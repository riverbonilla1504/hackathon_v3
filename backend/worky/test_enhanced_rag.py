#!/usr/bin/env python3
"""
Test script for the enhanced RAG system
"""

import json
import time
from core.rag_analyzer import (
    analyze_query, 
    analyze_profile_match, 
    generate_analysis_summary,
    normalize_text,
    tokenize_text
)

def test_query_analysis():
    """Test query analysis functionality"""
    print("=== Testing Query Analysis ===")
    
    test_queries = [
        "Python developer with 5 years experience",
        "Desarrollador senior en tecnologías web",
        "Project manager agile scrum",
        "Ingeniero de software con experiencia en AWS"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        analysis = analyze_query(query)
        print(f"  Tokens: {analysis['tokens']}")
        print(f"  Language: {analysis['language']}")
        print(f"  Technical terms: {analysis['has_technical_terms']}")
        print(f"  Length: {analysis['length']}")

def test_profile_matching():
    """Test profile matching with analysis"""
    print("\n\n=== Testing Profile Matching ===")
    
    # Sample profile data
    sample_profile = {
        'id': 1,
        'personal_information': {
            'name': 'Juan García',
            'title': 'Senior Software Engineer',
            'location': 'Madrid, Spain'
        },
        'experience': [
            {
                'title': 'Senior Python Developer',
                'company': 'Tech Solutions',
                'description': 'Developed web applications using Python, Django, and PostgreSQL'
            },
            {
                'title': 'Full Stack Developer',
                'company': 'StartupXYZ',
                'description': 'Built React frontend and Node.js backend applications'
            }
        ],
        'skills': ['Python', 'Django', 'React', 'JavaScript', 'PostgreSQL', 'AWS'],
        'projects': [
            {
                'name': 'E-commerce Platform',
                'description': 'Built scalable e-commerce platform with Python and React'
            }
        ],
        'education': [
            {
                'institution': 'Universidad Complutense',
                'degree': 'Computer Science',
                'field': 'Software Engineering'
            }
        ]
    }
    
    test_queries = [
        "Python developer",
        "React frontend developer",
        "Senior software engineer with AWS experience",
        "Java developer"  # Should have low/no match
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        query_analysis = analyze_query(query)
        match_analysis = analyze_profile_match(sample_profile, query_analysis)
        
        print(f"  Total Score: {match_analysis['total_score']}")
        print(f"  Overall Coverage: {match_analysis['overall_coverage']:.2%}")
        print(f"  Matched Tokens: {match_analysis['matched_tokens']}")
        print(f"  Missing Tokens: {match_analysis['missing_tokens']}")
        
        print("  Field Scores:")
        for field, scores in match_analysis['field_scores'].items():
            if scores['score'] > 0:
                print(f"    {field}: {scores['score']} (coverage: {scores['coverage']:.2%})")

def test_analysis_summary():
    """Test analysis summary generation"""
    print("\n\n=== Testing Analysis Summary ===")
    
    # Create multiple mock matches
    mock_matches = [
        {
            'id': 1,
            'total_score': 15.5,
            'overall_coverage': 0.8,
            'matched_tokens': ['python', 'developer', 'senior'],
            'missing_tokens': ['aws'],
            'field_scores': {
                'skills': {'score': 8.0, 'coverage': 0.9},
                'experience': {'score': 5.0, 'coverage': 0.7},
                'personal_information': {'score': 2.5, 'coverage': 0.8}
            }
        },
        {
            'id': 2,
            'total_score': 12.0,
            'overall_coverage': 0.6,
            'matched_tokens': ['python', 'developer'],
            'missing_tokens': ['senior', 'aws'],
            'field_scores': {
                'skills': {'score': 6.0, 'coverage': 0.8},
                'experience': {'score': 4.0, 'coverage': 0.5},
                'personal_information': {'score': 2.0, 'coverage': 0.6}
            }
        }
    ]
    
    query_analysis = analyze_query("Senior Python developer with AWS")
    summary = generate_analysis_summary(mock_matches, query_analysis, 100, 2.5)
    
    print(f"Total matches: {summary['total_matches']}")
    print(f"Total scanned: {summary['total_scanned']}")
    print(f"Coverage stats: {summary['coverage_stats']}")
    print(f"Field performance: {summary['field_performance']}")
    print(f"Token insights: {summary['token_insights']}")
    print(f"Performance: {summary['performance']}")

def test_normalization():
    """Test text normalization"""
    print("\n\n=== Testing Text Normalization ===")
    
    test_texts = [
        "Desarrollador SÉNIOR en Tecnologías Web",
        "Senior Software Engineer",
        "Ingeniero de Software - AWS & Python"
    ]
    
    for text in test_texts:
        normalized = normalize_text(text)
        tokens = tokenize_text(text)
        print(f"\nOriginal: {text}")
        print(f"Normalized: {normalized}")
        print(f"Tokens: {tokens}")

if __name__ == "__main__":
    print("Enhanced RAG System Test Suite")
    print("=" * 50)
    
    test_query_analysis()
    test_profile_matching()
    test_analysis_summary()
    test_normalization()
    
    print("\n\n=== All Tests Completed ===")