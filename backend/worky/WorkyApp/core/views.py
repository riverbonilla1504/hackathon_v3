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
from .rag_analyzer import (
    analyze_query, 
    analyze_profile_match, 
    generate_analysis_summary,
    normalize_text,
    tokenize_text
)

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
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        q = (request.GET.get('q') or '').strip()
        limit = int(request.GET.get('limit') or 10)
        status_f = request.GET.get('status') or 'pending'
        include_analysis = request.GET.get('analysis', 'true').lower() == 'true'
        
        if not base or not key:
            return Response({"error": "Missing Supabase env"}, status=500)
        
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Prefer': 'count=exact',
        }
        
        # Analyze query first
        query_analysis = analyze_query(q)
        
        # Enhanced RAG search with company data
        url_base = base.rstrip('/') + '/rest/v1/company'
        params = '?select=*&limit=1000&offset='
        offset = 0
        all_matches = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        start_time = time.time()
        
        while True:
            url = url_base + params + str(offset)
            req = Request(url, headers=headers)
            try:
                with urlopen(req, timeout=8) as r:
                    body = r.read().decode('utf-8')
                    companies = json.loads(body)
                    if not isinstance(companies, list) or not companies:
                        break
                    
                    for company in companies:
                        # Convert company data to profile format for analysis
                        profile_data = self._convert_company_to_profile(company)
                        
                        # Use enhanced analyzer for detailed matching
                        match_analysis = analyze_profile_match(profile_data, query_analysis)
                        
                        if match_analysis['total_score'] > 0 or not q:  # Include all if no query
                            enhanced_match = {
                                'id': company.get('id'),
                                'score': match_analysis['total_score'],
                                'company': company,
                                'personal_information': profile_data.get('personal_information', {}),
                                'skills': profile_data.get('skills', []),
                                'experience': profile_data.get('experience', []),
                                'education': profile_data.get('education', []),
                                'projects': profile_data.get('projects', []),
                                'overall_coverage': match_analysis.get('overall_coverage', 0),
                                'field_scores': match_analysis.get('field_scores', {}),
                                'matched_tokens': match_analysis.get('matched_tokens', []),
                                'missing_tokens': match_analysis.get('missing_tokens', []),
                                'field_snippets': match_analysis.get('field_snippets', {})
                            }
                            
                            if include_analysis:
                                enhanced_match['analysis'] = match_analysis
                            
                            all_matches.append(enhanced_match)
                    
                    total += len(companies)
                    offset += len(companies)
                    if len(companies) < 1000:
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
        
        # Sort by score (descending) and then by ID
        all_matches.sort(key=lambda x: (-x['score'], x['id'] or 0))
        timed_out = time.time() > deadline
        elapsed_time = time.time() - start_time
        
        # Prepare response
        top_matches = all_matches[:limit]
        
        response_data = {
            "answer": f"Found {len(top_matches)} relevant companies",
            "matches": top_matches,
            "scanned": total,
            "query": q,
            "partial": timed_out,
            "used": len(top_matches),
            "status_code": 200
        }
        
        # Include comprehensive analysis if requested
        if include_analysis:
            analysis_summary = generate_analysis_summary(all_matches, query_analysis, total, elapsed_time)
            response_data['analysis'] = analysis_summary
        
        return Response(response_data)
    
    def _convert_company_to_profile(self, company):
        """Convert company data to profile format for RAG analysis"""
        return {
            'personal_information': {
                'name': company.get('legal_name', company.get('trade_name', 'Unknown Company')),
                'title': company.get('trade_name', ''),
                'summary': f"{company.get('company_type', 'Company')} - {company.get('legal_representative', '')}"
            },
            'skills': [company.get('company_type', '').lower()],
            'experience': [{
                'title': company.get('legal_name', ''),
                'description': f"Company type: {company.get('company_type', 'Unknown')}, Legal representative: {company.get('legal_representative', 'Unknown')}, Tax ID: {company.get('tax_id', 'Unknown')}"
            }],
            'education': [],
            'projects': []
        }


class SupabaseRagHealthView(APIView):
    def get(self, request):
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        if not base or not key:
            return Response({"ok": False, "env": False}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        
        try:
            # Check company data
            url = base.rstrip('/') + '/rest/v1/company?select=id'
            req = Request(url, headers=headers)
            with urlopen(req, timeout=8) as r:
                if r.status == 200:
                    body = r.read().decode('utf-8')
                    companies = json.loads(body)
                    total = len(companies) if isinstance(companies, list) else 0
                else:
                    total = 0
            
            # Check profile data
            profile_url = base.rstrip('/') + '/rest/v1/profile?select=id'
            profile_req = Request(profile_url, headers=headers)
            with urlopen(profile_req, timeout=8) as r2:
                if r2.status == 200:
                    body2 = r2.read().decode('utf-8')
                    profiles = json.loads(body2)
                    profile_total = len(profiles) if isinstance(profiles, list) else 0
                else:
                    profile_total = 0
            
            return Response({
                "ok": True, 
                "env": True, 
                "supabase": True, 
                "company_total": total,
                "profile_total": profile_total,
                "total": total + profile_total
            })
        except Exception as e:
            return Response({"ok": False, "env": True, "supabase": False, "error": str(e)}, status=502)


class SupabaseAskView(APIView):
    def get(self, request):
        _load_env()
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        q = (request.GET.get('q') or '').strip()
        limit = int(request.GET.get('limit') or 5)
        status_f = request.GET.get('status') or 'pending'
        include_analysis = request.GET.get('analysis', 'true').lower() == 'true'
        
        if not base or not key:
            return Response({"error": "Missing Supabase env"}, status=500)
        
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        
        # Analyze query first
        query_analysis = analyze_query(q)
        
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        all_matches = []
        start_time = time.time()
        
        while True:
            url = url_base + params + str(offset)
            req = Request(url, headers=headers)
            try:
                with urlopen(req, timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not rows:
                        break
                    
                    for row in rows:
                        # Use enhanced analyzer for detailed matching
                        match_analysis = analyze_profile_match(row, query_analysis)
                        
                        if match_analysis['total_score'] > 0 or not q:  # Include all if no query
                            # Create enhanced match with snippets
                            text = ''
                            for k in ('personal_information','experience','education','skills','projects'):
                                if k in row and row[k] is not None:
                                    text += ' ' + _flatten_text(row[k])
                            
                            enhanced_match = {
                                'id': row.get('id'),
                                'score': match_analysis['total_score'],
                                'snippet': text[:600],
                                'personal_information': row.get('personal_information'),
                                'skills': row.get('skills'),
                                'projects': row.get('projects'),
                            }
                            
                            if include_analysis:
                                enhanced_match['analysis'] = match_analysis
                            
                            all_matches.append(enhanced_match)
                    
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
            except Exception:
                break
        
        # Sort by score (descending) and then by ID
        all_matches.sort(key=lambda x: (-x['score'], x['id'] or 0))
        top_matches = all_matches[:limit]
        elapsed_time = time.time() - start_time
        
        # Create answer from top matches
        answer = ' '.join([x['snippet'] for x in top_matches])[:1000]
        
        response_data = {
            "answer": answer,
            "matches": [{'id': str(match['id']), 'score': match['score'], 'snippet': match['snippet']} for match in top_matches],
            "query": q,
            "used": len(top_matches),
            "scanned": len(all_matches),
            "status_code": 200,
            "partial": False
        }
        
        # Include comprehensive analysis if requested
        if include_analysis:
            analysis_summary = generate_analysis_summary(all_matches, query_analysis, len(all_matches), elapsed_time)
            response_data['analysis'] = analysis_summary
        
        return Response(response_data)


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
        include_analysis = body.get('analysis', True)
        
        if not q and not vacant_id:
            return Response({'error': 'Missing message'}, status=400)
            
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not base or not key:
            return Response({'error': 'Missing Supabase env'}, status=500)
            
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        
        # Analyze query first using enhanced RAG analyzer
        query_analysis = analyze_query(q)
        
        # Enhanced RAG search with detailed analysis
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        all_matches = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        start_time = time.time()
        
        while True:
            url = url_base + params + str(offset)
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    body = r.read().decode('utf-8')
                    rows = json.loads(body)
                    if not isinstance(rows, list) or not rows:
                        break
                    
                    for row in rows:
                        # Use enhanced analyzer for detailed matching
                        match_analysis = analyze_profile_match(row, query_analysis)
                        
                        if match_analysis['total_score'] > 0 or not q:  # Include all if no query
                            enhanced_match = {
                                'id': row.get('id'),
                                'score': match_analysis['total_score'],
                                'personal_information': row.get('personal_information'),
                                'skills': row.get('skills'),
                                'projects': row.get('projects'),
                                'education': row.get('education'),
                                'experience': row.get('experience'),
                                'overall_coverage': match_analysis.get('overall_coverage', 0),
                                'field_scores': match_analysis.get('field_scores', {}),
                                'matched_tokens': match_analysis.get('matched_tokens', []),
                                'missing_tokens': match_analysis.get('missing_tokens', []),
                                'field_snippets': match_analysis.get('field_snippets', {})
                            }
                            
                            if include_analysis:
                                enhanced_match['analysis'] = match_analysis
                            
                            all_matches.append(enhanced_match)
                    
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
        
        # Sort by score (descending) and then by ID
        all_matches.sort(key=lambda x: (-x['score'], x['id'] or 0))
        timed_out = time.time() > deadline
        elapsed_time = time.time() - start_time
        
        # Take top matches for context
        top_matches = all_matches[:limit]
        
        # Prepare context for AI
        contexts = []
        for match in top_matches:
            context_text = self._build_context_text(match)
            contexts.append({
                'id': match['id'],
                'text': context_text[:1200],
                'score': match['score'],
                'name': match.get('personal_information', {}).get('name', 'Unknown')
            })
        
        # Generate AI answer
        ctx_json = json.dumps({'query': q, 'contexts': contexts})
        messages = [
            {'role': 'system', 'content': 'You answer questions about candidate profiles using only the provided context. Be specific and mention names when available.'},
            {'role': 'user', 'content': f'{q}\nContext: {ctx_json}\nReturn a concise answer and list matched profile IDs.'},
        ]
        status_code, content = _openai_chat(messages)
        
        # Parse the OpenAI response
        answer_text = "No se encontró información relevante en los perfiles."
        matched_ids = []
        
        if content:
            lines = content.strip().split('\n')
            answer_lines = []
            ids_found = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Look for ID list patterns
                if any(keyword in line.lower() for keyword in ['matched ids:', 'ids:', 'id:', 'matched:']):
                    import re
                    id_matches = re.findall(r'\b\d+\b', line)
                    if id_matches:
                        matched_ids = [int(id_str) for id_str in id_matches]
                    ids_found = True
                elif not ids_found:
                    answer_lines.append(line)
            
            if answer_lines:
                answer_text = ' '.join(answer_lines).strip()
            else:
                answer_text = content.strip()
                
            if not matched_ids:
                matched_ids = [c['id'] for c in contexts]
        
        response_data = {
            'answer': answer_text,
            'matches': [{'id': str(mid), 'score': next((m['score'] for m in top_matches if m['id'] == mid), 0.0)} for mid in matched_ids],
            'used': len(contexts),
            'scanned': total,
            'status_code': status_code,
            'partial': timed_out,
            'query_analysis': query_analysis if include_analysis else None
        }
        
        # Include comprehensive analysis if requested
        if include_analysis:
            analysis_summary = generate_analysis_summary(all_matches, query_analysis, total, elapsed_time)
            response_data['analysis'] = analysis_summary
        
        return Response(response_data)
    
    def _build_context_text(self, match):
        """Build context text from profile match"""
        parts = []
        
        # Personal information
        pi = match.get('personal_information', {})
        if pi:
            name = pi.get('name', 'Unknown')
            email = pi.get('email', '')
            phone = pi.get('phone', '')
            summary = pi.get('summary', '')
            location = pi.get('location', '')
            
            personal_text = f"Profile: {name}"
            if email:
                personal_text += f", Email: {email}"
            if phone:
                personal_text += f", Phone: {phone}"
            if location:
                personal_text += f", Location: {location}"
            if summary:
                personal_text += f", Summary: {summary}"
            parts.append(personal_text)
        
        # Experience
        exp = match.get('experience', [])
        if exp and isinstance(exp, list):
            for i, job in enumerate(exp[:3]):  # Limit to first 3 jobs
                if isinstance(job, dict):
                    title = job.get('title', '')
                    company = job.get('company', '')
                    desc = job.get('description', '')[:100]  # Limit description
                    exp_text = f"Experience {i+1}: {title}"
                    if company:
                        exp_text += f" at {company}"
                    if desc:
                        exp_text += f", {desc}"
                    parts.append(exp_text)
        
        # Skills
        skills = match.get('skills', {})
        if skills and isinstance(skills, dict):
            languages = skills.get('languages', [])
            technical = skills.get('technical', [])
            
            skill_parts = []
            if languages:
                skill_parts.append(f"Languages: {', '.join(languages[:5])}")
            if technical:
                skill_parts.append(f"Technical: {', '.join(technical[:5])}")
            
            if skill_parts:
                parts.append("Skills: " + "; ".join(skill_parts))
        
        # Education
        edu = match.get('education', [])
        if edu and isinstance(edu, list):
            for i, school in enumerate(edu[:2]):  # Limit to first 2
                if isinstance(school, dict):
                    degree = school.get('degree', '')
                    institution = school.get('institution', '')
                    edu_text = f"Education {i+1}: {degree}"
                    if institution:
                        edu_text += f" from {institution}"
                    parts.append(edu_text)
        
        # Projects
        projects = match.get('projects', [])
        if projects and isinstance(projects, list):
            for i, proj in enumerate(projects[:2]):  # Limit to first 2
                if isinstance(proj, dict):
                    title = proj.get('title', '')
                    desc = proj.get('description', '')[:80]  # Limit description
                    proj_text = f"Project {i+1}: {title}"
                    if desc:
                        proj_text += f", {desc}"
                    parts.append(proj_text)
        
        return ' | '.join(parts)


class RankingView(APIView):
    def post(self, request):
        _load_env()
        body = request.data or {}
        status_f = body.get('status') or 'pending'
        limit = int(body.get('limit') or 5)
        include_analysis = bool(body.get('analysis', False))
        vacant_id = body.get('vacant_id')
        if not vacant_id:
            return Response({'error': 'Missing vacant_id'}, status=400)
        base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        if not base or not key:
            return Response({'error': 'Missing Supabase env'}, status=500)
        headers = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
        }
        sel_v = '*'
        url_v = base.rstrip('/') + f'/rest/v1/vacant?id=eq.{vacant_id}&select={sel_v}&limit=1'
        try:
            with urlopen(Request(url_v, headers=headers), timeout=8) as r:
                vrows = json.loads(r.read().decode('utf-8'))
                vacancy = vrows[0] if isinstance(vrows, list) and vrows else None
        except HTTPError as e:
            try:
                err = e.read().decode('utf-8')
            except Exception:
                err = ''
            return Response({'error': 'Supabase HTTPError', 'status': e.code, 'detail': err}, status=502)
        except URLError:
            return Response({'error': 'Supabase URLError'}, status=502)
        if not vacancy:
            return Response({'error': 'Vacante no encontrada', 'vacant_id': str(vacant_id)}, status=404)
        vtext = _flatten_text(vacancy)
        vquery = analyze_query(vtext)
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&vacant_id=eq.{vacant_id}&limit=1000&offset='
        offset = 0
        all_matches = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        start_time = time.time()
        while True:
            url = url_base + params + str(offset)
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not isinstance(rows, list) or not rows:
                        break
                    for row in rows:
                        ma = analyze_profile_match(row, vquery)
                        if ma['total_score'] > 0:
                            all_matches.append({
                                'id': row.get('id'),
                                'score': ma['total_score'],
                                'overall_coverage': ma.get('overall_coverage', 0),
                                'field_scores': ma.get('field_scores', {}),
                                'matched_tokens': ma.get('matched_tokens', []),
                                'analysis_time_ms': ma.get('analysis_time_ms', 0)
                            })
                    total += len(rows)
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
                    if time.time() > deadline:
                        break
            except Exception:
                break
        all_matches.sort(key=lambda x: (-x['score'], x['id'] or 0))
        top_matches = all_matches[:limit]
        timed_out = time.time() > deadline
        elapsed_time = time.time() - start_time
        response = {
            'answer': f'Se encontraron {len(all_matches)} perfiles aptos para la vacante {vacant_id}.',
            'matches': [{'id': str(m['id']), 'score': m['score']} for m in top_matches],
            'used': len(top_matches),
            'scanned': total,
            'status_code': 200,
            'partial': timed_out,
            'vacant_id': str(vacant_id)
        }
        if include_analysis:
            response['analysis'] = generate_analysis_summary(all_matches, vquery, total, elapsed_time)
        return Response(response)
        is_count = (('cuantos' in ql or 'cuántos' in ql or 'how many' in ql or 'count' in ql or 'cantidad' in ql or 'total' in ql)
                    and ('registros' in ql or 'records' in ql or 'perfiles' in ql or 'profiles' in ql or 'usuarios' in ql or 'users' in ql or 'candidatos' in ql))
        if is_count:
            u = base.rstrip('/') + '/rest/v1/profile?select=id'
            if status_f:
                u = u + f'&status=eq.{status_f}'
            total = 0
            try:
                with urlopen(Request(u, headers=headers), timeout=8) as r:
                    cr = r.getheader('Content-Range') or ''
                    total = int(cr.split('/')[-1]) if '/' in cr else 0
            except Exception:
                total = 0
            if not total:
                url_base_c = base.rstrip('/') + '/rest/v1/profile'
                params_c = f'?select=id&status=eq.{status_f}&limit=1000&offset='
                off = 0
                deadline_c = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
                while True:
                    try:
                        url_c = url_base_c + params_c + str(off)
                        with urlopen(Request(url_c, headers=headers), timeout=8) as r:
                            rows = json.loads(r.read().decode('utf-8'))
                            if not isinstance(rows, list) or not rows:
                                break
                            total += len(rows)
                            off += len(rows)
                            if len(rows) < 1000:
                                break
                            if time.time() > deadline_c:
                                break
                    except Exception:
                        break
            return Response({
                'answer': f'Hay {total} registros en profile',
                'matches': [],
                'used': 0,
                'scanned': total,
                'status_code': 200,
                'partial': False
            })
        ids = re.findall(r'\b\d+\b', ql)
        record = None
        if ids and ('id' in ql or 'perfil' in ql or 'profile' in ql):
            id_val = ids[0]
            sel = 'id,personal_information,experience,education,skills,projects'
            url = base.rstrip('/') + f'/rest/v1/profile?id=eq.{id_val}&select={sel}&limit=1'
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if isinstance(rows, list) and rows:
                        record = rows[0]
            except Exception:
                record = None
        if record:
            text = ''
            for k in ('personal_information','experience','education','skills','projects'):
                v = record.get(k)
                if v is not None:
                    text += ' ' + _flatten_text(v)
            snippet = text[:1000]
            return Response({
                'answer': snippet,
                'matches': [{'id': str(record.get('id')), 'score': 1.0}],
                'used': 1,
                'scanned': 1,
                'status_code': 200,
                'partial': False
            })
        url_base = base.rstrip('/') + '/rest/v1/profile'
        params = f'?select=id,personal_information,experience,education,skills,projects&status=eq.{status_f}&limit=1000&offset='
        offset = 0
        all_matches = []
        total = 0
        deadline = time.time() + float(os.environ.get('AI_RAG_BUDGET_SEC', '8'))
        start_time = time.time()
        while True:
            url = url_base + params + str(offset)
            try:
                with urlopen(Request(url, headers=headers), timeout=8) as r:
                    rows = json.loads(r.read().decode('utf-8'))
                    if not isinstance(rows, list) or not rows:
                        break
                    for row in rows:
                        match_analysis = analyze_profile_match(row, query_analysis)
                        if match_analysis['total_score'] > 0:
                            all_matches.append({
                                'id': row.get('id'),
                                'score': match_analysis['total_score']
                            })
                    total += len(rows)
                    offset += len(rows)
                    if len(rows) < 1000:
                        break
                    if time.time() > deadline:
                        break
            except Exception:
                break
        all_matches.sort(key=lambda x: (-x['score'], x['id'] or 0))
        top_matches = all_matches[:limit]
        timed_out = time.time() > deadline
        elapsed_time = time.time() - start_time
        response = {
            'answer': f'Se encontraron {len(all_matches)} perfiles que coinciden con la consulta.',
            'matches': [{'id': str(m['id']), 'score': m['score']} for m in top_matches],
            'used': len(top_matches),
            'scanned': total,
            'status_code': 200,
            'partial': timed_out
        }
        if include_analysis:
            response['analysis'] = generate_analysis_summary([
                {
                    'overall_coverage': 0,
                    'field_scores': {'skills': {'score': m['score']}, 'personal_information': {'score': 0}, 'experience': {'score': 0}, 'projects': {'score': 0}, 'education': {'score': 0}},
                    'matched_tokens': []
                } for m in all_matches
            ], query_analysis, total, elapsed_time)
        return Response(response)

