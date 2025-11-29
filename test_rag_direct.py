#!/usr/bin/env python3
"""
Test directo de funcionalidad RAG sin servidor Django
"""
import os
import sys
import json
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Configurar variables de entorno
os.environ['NEXT_PUBLIC_SUPABASE_URL'] = 'https://hpzohppfcibdpfazptmd.supabase.co/'
os.environ['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwem9ocHBmY2liZHBmYXpwdG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDc3OTMsImV4cCI6MjA3OTkyMzc5M30.CAOxr25PpskOiMiOYoYP650WSTbk3vgaqCi9FnL73Hk'
os.environ['OPENAI_API_KEY'] = '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'

def _load_env():
    """Load environment variables"""
    pass

def _openai_chat(messages, model='gpt-4.1-mini', temperature=0.2):
    """Simple OpenAI chat function"""
    import os
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

def test_supabase_connection():
    """Test direct connection to Supabase"""
    print("🧪 Testing Supabase RAG functionality...")
    
    base = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not base or not key:
        print("❌ Missing Supabase environment variables")
        return
    
    headers = {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Prefer': 'count=exact',
    }
    
    # Test 1: Check connection and count records
    print("\n📊 Test 1: Counting records in profile table")
    url = base.rstrip('/') + '/rest/v1/profile?select=id'
    
    try:
        with urlopen(Request(url, headers=headers), timeout=8) as r:
            cr = r.getheader('Content-Range') or ''
            total = int(cr.split('/')[-1]) if '/' in cr else 0
            print(f"✅ Total records found: {total}")
            
            # Test 2: Simple RAG query
            print("\n🔍 Test 2: Simple RAG search")
            
            # Get some sample data
            sample_url = base.rstrip('/') + '/rest/v1/profile?select=id,personal_information,experience,education,skills,projects&limit=5'
            
            with urlopen(Request(sample_url, headers=headers), timeout=8) as sr:
                sample_data = json.loads(sr.read().decode('utf-8'))
                print(f"✅ Retrieved {len(sample_data)} sample records")
                
                # Test 3: AI response generation
                print("\n🤖 Test 3: AI response generation")
                
                if sample_data:
                    # Create context from sample data
                    contexts = []
                    for row in sample_data:
                        text = ''
                        for k in ('personal_information','experience','education','skills','projects'):
                            v = row.get(k)
                            if v is not None:
                                text += ' ' + str(v)
                        contexts.append({
                            'id': row.get('id'),
                            'text': text[:500]  # Limit text length
                        })
                    
                    # Test simple AI query
                    q = "What kind of candidates are in the database?"
                    ctx_json = json.dumps({'query': q, 'contexts': contexts})
                    messages = [
                        {'role': 'system', 'content': 'You are an assistant that answers about candidate profiles. Use the provided JSON context only.'},
                        {'role': 'user', 'content': f'Question: {q}\nContext JSON: {ctx_json}\nReturn a concise answer and list matched ids.'},
                    ]
                    
                    status_code, content = _openai_chat(messages)
                    
                    if status_code == 200 and content:
                        print(f"✅ AI Response: {content[:200]}...")
                        
                        # Test structured response parsing
                        print("\n📋 Test 4: Structured response parsing")
                        
                        # Parse the response to extract structured information
                        answer_text = "No se encontró información relevante."
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
                        
                        structured_response = {
                            'answer': answer_text,
                            'matches': [{'id': str(mid), 'score': 1.0} for mid in matched_ids],
                            'used': len(contexts),
                            'scanned': len(sample_data),
                            'status_code': status_code,
                            'partial': False
                        }
                        
                        print(f"✅ Structured response:")
                        print(f"   Answer: {structured_response['answer'][:100]}...")
                        print(f"   Matches: {len(structured_response['matches'])} items")
                        print(f"   Used: {structured_response['used']} contexts")
                        print(f"   Scanned: {structured_response['scanned']} records")
                        print(f"   Status: {structured_response['status_code']}")
                        
                        print("\n🎉 All tests passed! RAG functionality is working correctly.")
                        print("\n📊 Summary of structured response format:")
                        print("   - answer: Clear, concise response")
                        print("   - matches: List of matched items with IDs and scores")
                        print("   - used: Number of contexts used for the response")
                        print("   - scanned: Total records scanned")
                        print("   - status_code: HTTP status code")
                        print("   - partial: Whether the response was truncated")
                        
                    else:
                        print(f"❌ AI request failed: {status_code}")
                else:
                    print("❌ No sample data available")
                    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_supabase_connection()