#!/usr/bin/env python3
"""
Test script to verify RAG functionality returns structured responses
"""
import json
import requests
import os

def test_rag_endpoints():
    """Test all RAG endpoints to verify they return structured responses"""
    
    # Set up environment variables for testing
    os.environ['NEXT_PUBLIC_SUPABASE_URL'] = 'https://hpzohppfcibdpfazptmd.supabase.co/'
    os.environ['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwem9ocHBmY2liZHBmYXpwdG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDc3OTMsImV4cCI6MjA3OTkyMzc5M30.CAOxr25PpskOiMiOYoYP650WSTbk3vgaqCi9FnL73Hk'
    os.environ['OPENAI_API_KEY'] = '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'
    
    base_url = 'http://localhost:8000'
    
    # Test data
    test_queries = [
        "How many records are in the profile table?",
        "Find candidates with Python experience",
        "Show me profiles with machine learning skills"
    ]
    
    print("Testing RAG endpoints...")
    
    for query in test_queries:
        print(f"\n--- Testing query: '{query}' ---")
        
        # Test SupabaseRagSearchView
        try:
            response = requests.get(f'{base_url}/api/supabase-rag-search/', params={'q': query, 'limit': 5})
            if response.status_code == 200:
                data = response.json()
                print(f"✓ SupabaseRagSearchView response structure:")
                print(f"  - answer: {data.get('answer', 'N/A')}")
                print(f"  - matches: {len(data.get('matches', []))} items")
                print(f"  - scanned: {data.get('scanned', 0)}")
                print(f"  - status_code: {data.get('status_code', 'N/A')}")
                print(f"  - partial: {data.get('partial', 'N/A')}")
                
                # Verify structure
                required_fields = ['answer', 'matches', 'scanned', 'status_code', 'partial', 'used']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    print(f"  ⚠ Missing fields: {missing_fields}")
                else:
                    print(f"  ✓ All required fields present")
            else:
                print(f"✗ SupabaseRagSearchView failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"✗ SupabaseRagSearchView error: {e}")
        
        # Test ProfileAIAskView
        try:
            response = requests.post(f'{base_url}/api/profile-ai-ask/', json={'message': query, 'limit': 5})
            if response.status_code == 200:
                data = response.json()
                print(f"✓ ProfileAIAskView response structure:")
                print(f"  - answer: {data.get('answer', 'N/A')}")
                print(f"  - matches: {len(data.get('matches', []))} items")
                print(f"  - used: {data.get('used', 0)}")
                print(f"  - scanned: {data.get('scanned', 0)}")
                print(f"  - status_code: {data.get('status_code', 'N/A')}")
                print(f"  - partial: {data.get('partial', 'N/A')}")
                
                # Verify structure
                required_fields = ['answer', 'matches', 'used', 'scanned', 'status_code', 'partial']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    print(f"  ⚠ Missing fields: {missing_fields}")
                else:
                    print(f"  ✓ All required fields present")
            else:
                print(f"✗ ProfileAIAskView failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"✗ ProfileAIAskView error: {e}")

if __name__ == '__main__':
    test_rag_endpoints()