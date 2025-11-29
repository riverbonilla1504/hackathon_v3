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
import time
import re

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
            'Prefer': 'count=exact',
        }
        def _supabase_count():
            u = base.rstrip('/') + '/rest/v1/profile?select=id'
            if status_f:
                u = u + f'&status=eq.{status_f}'
            try:
                with urlopen(Request(u, headers=headers), timeout=8) as r:
                    cr = r.getheader('Content-Range') or ''
                    return int(cr.split('/')[-1]) if '/' in cr else 0
            except Exception:
                return 0
        ql = q.lower()
        is_count = ('registros' in ql or 'records' in ql) and ('cuantos' in ql or 'cuántos' in ql or 'how many' in ql or 'count' in ql or 'cantidad' in ql or 'total' in ql)
        if is_count:
            total = _supabase_count()
            messages = [
                {'role': 'system', 'content': 'You answer concisely using provided facts.'},
                {'role': 'user', 'content': f'Hay {total} registros en la tabla profile.'},
            ]
            sc, content = _openai_chat(messages)
            return Response({
                'answer': content or f'Hay {total} registros en profile',
                'matches': [],
                'used': 0,
                'scanned': total,
                'status_code': sc,
                'partial': False
            })
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        scored = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        while True:
            url = url_base + params + str(offset)
            req = Request(url, headers=headers)
            try:
                with urlopen(req, timeout=8) as r:
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
                    if time.time() > deadline:
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
        timed_out = time.time() > deadline
        return Response({
            "answer": f"Found {len(scored[:limit])} relevant profiles",
            "matches": scored[:limit],
            "scanned": total,
            "query": q,
            "partial": timed_out,
            "used": len(scored[:limit]),
            "status_code": 200
        })


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
            with urlopen(Request(url, headers=headers), timeout=8) as r:
                cr = r.getheader('Content-Range') or ''
                total = int(cr.split('/')[-1]) if '/' in cr else 0
            with urlopen(Request(pending, headers=headers), timeout=8) as r2:
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
                with urlopen(req, timeout=8) as r:
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
        return Response({
            "answer": answer,
            "matches": [{'id': str(match['id']), 'score': match['score'], 'snippet': match['snippet']} for match in top],
            "query": q,
            "used": len(top),
            "scanned": len(scored),
            "status_code": 200,
            "partial": False
        })


def _openai_chat(messages, model='gpt-4.1-mini', temperature=0.2):
    _load_env()
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        return 500, ''
    url = 'https://api.openai.com/v1/chat/completions'
    body = json.dumps({
        'model': model,
        'messages': messages,
        'temperature': temperature,
    }).encode('utf-8')
    headers = {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
    }
    try:
        with urlopen(Request(url, data=body, headers=headers), timeout=15) as r:
            resp = json.loads(r.read().decode('utf-8'))
            content = resp.get('choices', [{}])[0].get('message', {}).get('content', '')
            return r.status, content
    except HTTPError as e:
        try:
            err = e.read().decode('utf-8')
        except Exception:
            err = ''
        return e.code, err
    except URLError:
        return 0, ''


class AIHealthView(APIView):
    def get(self, request):
        status_code, content = _openai_chat([
            {'role': 'system', 'content': 'You are a health check bot.'},
            {'role': 'user', 'content': 'Reply with OK.'},
        ])
        ok = status_code in (200,) and ('OK' in content or content.strip())
        return Response({
            'ok': bool(ok),
            'status_code': status_code,
        }, status=200 if ok else 502)


class AIAskView(APIView):
    def get(self, request):
        q = (request.GET.get('q') or '').strip()
        limit = int(request.GET.get('limit') or 5)
        status_f = request.GET.get('status') or 'pending'
        if not q:
            return Response({'error': 'Missing q'}, status=400)
        # Reuse Supabase retrieval
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        contexts = []
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        while len(contexts) < limit:
            url = url_base + params + str(offset)
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not rows:
                        break
                    for row in rows:
                        ctx = {
                            'id': row.get('id'),
                            'personal_information': row.get('personal_information'),
                            'skills': row.get('skills'),
                            'projects': row.get('projects'),
                            'experience': row.get('experience'),
                            'education': row.get('education'),
                        }
                        contexts.append(ctx)
                        if len(contexts) >= limit:
                            break
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
                    if time.time() > deadline:
                        break
            except Exception:
                break
        ctx_text = json.dumps({'query': q, 'contexts': contexts})
        messages = [
            {'role': 'system', 'content': 'You are an assistant that answers about candidate profiles. Use the provided JSON context only.'},
            {'role': 'user', 'content': f'Question: {q}\nContext JSON: {ctx_text}\nReturn a concise answer and list matched ids.'},
        ]
        status_code, content = _openai_chat(messages)
        timed_out = time.time() > deadline
        
        # Parse the OpenAI response to extract structured information
        answer_text = "No se encontró información relevante."
        matched_ids = []
        
        if content:
            # Try to extract answer and IDs from the response
            lines = content.strip().split('\n')
            answer_lines = []
            ids_found = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Look for ID list patterns
                if any(keyword in line.lower() for keyword in ['matched ids:', 'ids:', 'id:', 'matched:']):
                    # Extract IDs from this line or subsequent lines
                    import re
                    id_matches = re.findall(r'\b\d+\b', line)
                    if id_matches:
                        matched_ids = [int(id_str) for id_str in id_matches]
                    ids_found = True
                elif not ids_found:
                    answer_lines.append(line)
            
            # If we found answer lines, use them
            if answer_lines:
                answer_text = ' '.join(answer_lines).strip()
            else:
                # Fallback: use the entire content if we couldn't parse it
                answer_text = content.strip()
                
            # If we didn't find explicit IDs, use the context IDs
            if not matched_ids:
                matched_ids = [c['id'] for c in contexts]
        
        return Response({
            'answer': answer_text,
            'matches': [{'id': str(mid), 'score': 1.0} for mid in matched_ids],
            'used': len(contexts),
            'scanned': len(contexts),
            'status_code': status_code,
            'partial': timed_out
        })


class ProfileAIAskView(APIView):
    def post(self, request):
        _load_env()
        body = request.data or {}
        q = (body.get('message') or '').strip()
        status_f = body.get('status') or 'pending'
        limit = int(body.get('limit') or 5)
        if not q:
            return Response({'error': 'Missing message'}, status=400)
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        if not base or not key:
            return Response({'error': 'Missing Supabase env'}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        scored = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        while len(scored) < limit * 3:
            url = url_base + params + str(offset)
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not rows:
                        break
                    for row in rows:
                        text = ''
                        for k in ('personal_information','experience','education','skills','projects'):
                            v = row.get(k)
                            if v is not None:
                                text += ' ' + _flatten_text(v)
                        score = 0
                        for tok in q.lower().split():
                            if tok in text.lower():
                                score += 1
                        if score > 0:
                            scored.append({'id': row.get('id'), 'score': score, 'text': text})
                    total += len(rows)
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
                    if time.time() > deadline:
                        break
            except Exception:
                break
        scored.sort(key=lambda x: (-x['score'], x['id'] or 0))
        contexts = [{'id': s['id'], 'text': s['text'][:1200]} for s in scored[:limit]]
        ctx_json = json.dumps({'query': q, 'contexts': contexts})
        messages = [
            {'role': 'system', 'content': 'You answer questions about candidate profiles using only the provided context.'},
            {'role': 'user', 'content': f'{q}\nContext: {ctx_json}\nReturn a concise answer and list matched ids.'},
        ]
        status_code, content = _openai_chat(messages)
        timed_out = time.time() > deadline
        
        # Parse the OpenAI response to extract structured information
        answer_text = "No se encontró información relevante."
        matched_ids = []
        
        if content:
            # Try to extract answer and IDs from the response
            lines = content.strip().split('\n')
            answer_lines = []
            ids_found = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Look for ID list patterns
                if any(keyword in line.lower() for keyword in ['matched ids:', 'ids:', 'id:', 'matched:']):
                    # Extract IDs from this line or subsequent lines
                    import re
                    id_matches = re.findall(r'\b\d+\b', line)
                    if id_matches:
                        matched_ids = [int(id_str) for id_str in id_matches]
                    ids_found = True
                elif not ids_found:
                    answer_lines.append(line)
            
            # If we found answer lines, use them
            if answer_lines:
                answer_text = ' '.join(answer_lines).strip()
            else:
                # Fallback: use the entire content if we couldn't parse it
                answer_text = content.strip()
                
            # If we didn't find explicit IDs, use the context IDs
            if not matched_ids:
                matched_ids = [c['id'] for c in contexts]
        
        return Response({
            'answer': answer_text,
            'matches': [{'id': str(mid), 'score': 1.0} for mid in matched_ids],
            'used': len(contexts),
            'scanned': total,
            'status_code': status_code,
            'partial': timed_out
        })

