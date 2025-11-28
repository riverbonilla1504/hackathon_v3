from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import persons
from .serializers import PersonSerializer
import os
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

class GetAllPersonsView(APIView):
    def get(self, request):
        persons_list = persons.objects.all()
        serializer = PersonSerializer(persons_list, many=True)
        return Response({"persons": serializer.data})

class GetPersonView(APIView):
    def get(self, request, name):
        person = persons.objects.filter(name=name)
        serializer = PersonSerializer(person, many=True)
        return Response({"person": serializer.data})

class CreatePersonView(APIView):
    def post(self, request):  # Asegúrate de que este método esté definido correctamente
        serializer = PersonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdatePersonView(APIView):
    def put(self, request, id):
        try:
            person = persons.objects.get(id=id)
        except persons.DoesNotExist:
            return Response({"error": "Person not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeletePersonView(APIView):
    def delete(self, request, person_id):
        try:
            person = persons.objects.get(id=person_id)
            person.delete()
            return Response({"message": "Person deleted successfully"}, status=status.HTTP_200_OK)
        except persons.DoesNotExist:
            return Response({"error": "Person not found"}, status=status.HTTP_404_NOT_FOUND)


def _load_env():
    cur = Path(__file__).resolve()
    for i in range(1, 8):
        base = cur.parents[i]
        p = base / '.env'
        if p.exists():
            for line in p.read_text(encoding='utf-8').splitlines():
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip())
            break


def _flatten_text(obj):
    parts = []
    def walk(x):
        if isinstance(x, dict):
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
        elif isinstance(x, (str, int, float)):
            parts.append(str(x))
    walk(obj)
    return ' '.join(parts)


class SupabaseRagSearchView(APIView):
    def get(self, request):
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        q = (request.GET.get('q') or '').strip().lower()
        limit = int(request.GET.get('limit') or 10)
        status_f = request.GET.get('status') or 'pending'
        if not base or not key:
            return Response({"error": "Missing Supabase env"}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        scored = []
        total = 0
        while True:
            url = url_base + params + str(offset)
            req = Request(url, headers=headers)
            try:
                with urlopen(req) as r:
                    body = r.read().decode('utf-8')
                    rows = json.loads(body)
                    if not isinstance(rows, list) or not rows:
                        break
                    for row in rows:
                        text = ''
                        for k in ('personal_information','experience','education','skills','projects'):
                            if k in row and row[k] is not None:
                                text += ' ' + _flatten_text(row[k])
                        if q:
                            score = 0
                            for tok in q.split():
                                if tok in text.lower():
                                    score += 1
                        else:
                            score = 1
                        if score > 0:
                            scored.append({
                                'id': row.get('id'),
                                'score': score,
                                'personal_information': row.get('personal_information'),
                                'skills': row.get('skills'),
                                'projects': row.get('projects'),
                            })
                    total += len(rows)
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
            except HTTPError as e:
                try:
                    err_body = e.read().decode('utf-8')
                except Exception:
                    err_body = ''
                return Response({"error": "Supabase HTTPError", "status": e.code, "detail": err_body}, status=502)
            except URLError:
                return Response({"error": "Supabase URLError"}, status=502)
        scored.sort(key=lambda x: (-x['score'], x['id'] or 0))
        return Response({"matches": scored[:limit], "scanned": total, "query": q})


class SupabaseRagHealthView(APIView):
    def get(self, request):
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        if not base or not key:
            return Response({"ok": False, "env": False}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Prefer': 'count=exact',
        }
        url = base.rstrip('/') + '/rest/v1/profile?select=id'
        pending = base.rstrip('/') + '/rest/v1/profile?status=eq.pending&select=id'
        try:
            with urlopen(Request(url, headers=headers)) as r:
                cr = r.getheader('Content-Range') or ''
                total = int(cr.split('/')[-1]) if '/' in cr else 0
            with urlopen(Request(pending, headers=headers)) as r2:
                cr2 = r2.getheader('Content-Range') or ''
                pend = int(cr2.split('/')[-1]) if '/' in cr2 else 0
            return Response({"ok": True, "env": True, "supabase": True, "total": total, "pending": pend})
        except Exception:
            return Response({"ok": False, "env": True, "supabase": False}, status=502)


class SupabaseAskView(APIView):
    def get(self, request):
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        q = (request.GET.get('q') or '').strip().lower()
        limit = int(request.GET.get('limit') or 5)
        status_f = request.GET.get('status') or 'pending'
        if not base or not key:
            return Response({"error": "Missing Supabase env"}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        scored = []
        while True:
            url = url_base + params + str(offset)
            req = Request(url, headers=headers)
            try:
                with urlopen(req) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not rows:
                        break
                    for row in rows:
                        text = ''
                        for k in ('personal_information','experience','education','skills','projects'):
                            if k in row and row[k] is not None:
                                text += ' ' + _flatten_text(row[k])
                        score = 0
                        for tok in q.split():
                            if tok in text.lower():
                                score += 1
                        if score > 0:
                            scored.append({
                                'id': row.get('id'),
                                'score': score,
                                'snippet': text[:600],
                            })
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
            except Exception:
                break
        scored.sort(key=lambda x: (-x['score'], x['id'] or 0))
        top = scored[:limit]
        answer = ' '.join([x['snippet'] for x in top])[:1000]
        return Response({"answer": answer, "matches": top, "query": q})

