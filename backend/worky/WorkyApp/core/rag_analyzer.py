"""
Enhanced RAG Analyzer with better data analysis capabilities
Provides detailed analytics and structured responses for better data understanding
"""

import re
import unicodedata
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict
import time

# Field weights for scoring (customizable)
FIELD_WEIGHTS = {
    'skills': 3.0,
    'personal_information': 2.5,
    'experience': 2.0,
    'projects': 1.5,
    'education': 1.0
}

# Common stopwords for Spanish and English
STOPWORDS = {
    'es': {
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'que', 'con', 'para', 'esta', 'los', 'las', 'del', 'al', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'sobre', 'entre', 'cuando', 'todo', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'muy', 'ahora', 'cómo', 'quien', 'qué', 'tan', 'trabajo', 'años', 'año', 'mes', 'meses', 'día', 'días'
    },
    'en': {
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    }
}


def normalize_text(text: str) -> str:
    """
    Normalize text for better matching:
    - Remove accents
    - Convert to lowercase
    - Remove extra whitespace
    """
    if not text:
        return ""
    
    # Remove accents
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    
    # Convert to lowercase and clean
    text = text.lower().strip()
    
    # Remove extra whitespace and special characters
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text


def tokenize_text(text: str, language: str = 'es') -> List[str]:
    """
    Tokenize text and remove stopwords
    """
    normalized = normalize_text(text)
    tokens = normalized.split()
    
    # Remove stopwords
    stopwords = STOPWORDS.get(language, set()) | STOPWORDS.get('en', set())
    tokens = [token for token in tokens if token not in stopwords and len(token) > 2]
    
    return tokens


def extract_field_text(data: Dict[str, Any], field_name: str) -> str:
    """
    Extract text from specific field with structure preservation
    """
    if field_name not in data or data[field_name] is None:
        return ""
    
    field_data = data[field_name]
    
    if isinstance(field_data, str):
        return field_data
    elif isinstance(field_data, list):
        # Handle list of items (like experience, projects, education)
        texts = []
        for item in field_data:
            if isinstance(item, dict):
                # Extract common fields from structured data
                for key in ['title', 'description', 'company', 'institution', 'name', 'role', 'technologies']:
                    if key in item and item[key]:
                        texts.append(str(item[key]))
            elif isinstance(item, str):
                texts.append(item)
        return ' '.join(texts)
    elif isinstance(field_data, dict):
        # Handle dictionary data
        texts = []
        for key, value in field_data.items():
            if value and key not in ['id', 'created_at', 'updated_at']:
                texts.append(str(value))
        return ' '.join(texts)
    
    return str(field_data)


def analyze_field_match(query_tokens: List[str], field_text: str, field_name: str) -> Dict[str, Any]:
    """
    Analyze how well query tokens match a specific field
    """
    if not field_text or not query_tokens:
        return {
            'score': 0,
            'matched_tokens': [],
            'missing_tokens': query_tokens,
            'coverage': 0.0,
            'snippet': ''
    }
    
    field_tokens = tokenize_text(field_text)
    field_text_norm = normalize_text(field_text)
    
    # Find matched tokens
    matched_tokens = []
    missing_tokens = []
    
    for query_token in query_tokens:
        found = False
        # Check for exact match first
        if query_token in field_tokens:
            matched_tokens.append(query_token)
            found = True
        # Check for partial match (substring)
        elif any(query_token in field_token for field_token in field_tokens):
            matched_tokens.append(query_token)
            found = True
        
        if not found:
            missing_tokens.append(query_token)
    
    # Calculate coverage
    coverage = len(matched_tokens) / len(query_tokens) if query_tokens else 0
    
    # Create snippet with context
    snippet = create_snippet(field_text_norm, matched_tokens)
    
    # Calculate weighted score
    weight = FIELD_WEIGHTS.get(field_name, 1.0)
    score = coverage * weight * len(matched_tokens)
    
    return {
        'score': score,
        'matched_tokens': matched_tokens,
        'missing_tokens': missing_tokens,
        'coverage': coverage,
        'snippet': snippet,
        'field_length': len(field_tokens),
        'matched_count': len(matched_tokens)
    }


def create_snippet(text: str, matched_tokens: List[str], max_length: int = 200) -> str:
    """
    Create a snippet showing matched tokens in context
    """
    if not matched_tokens or not text:
        return text[:max_length] + ('...' if len(text) > max_length else '')
    
    # Find positions of matched tokens
    positions = []
    for token in matched_tokens:
        pos = text.find(token)
        if pos != -1:
            positions.append(pos)
    
    if not positions:
        return text[:max_length] + ('...' if len(text) > max_length else '')
    
    # Sort positions and create snippet around first match
    positions.sort()
    start_pos = max(0, positions[0] - 50)
    end_pos = min(len(text), start_pos + max_length)
    
    snippet = text[start_pos:end_pos]
    
    # Add ellipsis if truncated
    if start_pos > 0:
        snippet = '...' + snippet
    if end_pos < len(text):
        snippet = snippet + '...'
    
    return snippet


def analyze_query(query: str) -> Dict[str, Any]:
    """
    Analyze query and extract insights
    """
    if not query:
        return {
            'original': query,
            'normalized': '',
            'tokens': [],
            'language': 'unknown',
            'length': 0,
            'has_technical_terms': False
        }
    
    normalized = normalize_text(query)
    tokens = tokenize_text(query)
    
    # Detect language (simple heuristic)
    spanish_words = set(['de', 'la', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le'])
    english_words = set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'])
    
    spanish_count = sum(1 for token in tokens if token in spanish_words)
    english_count = sum(1 for token in tokens if token in english_words)
    
    language = 'es' if spanish_count > english_count else 'en'
    
    # Check for technical terms (simple heuristic)
    technical_indicators = ['python', 'java', 'javascript', 'react', 'angular', 'node', 'sql', 'api', 'aws', 'docker', 'kubernetes', 'devops', 'agile', 'scrum']
    has_technical = any(token in technical_indicators for token in tokens)
    
    return {
        'original': query,
        'normalized': normalized,
        'tokens': tokens,
        'language': language,
        'length': len(tokens),
        'has_technical_terms': has_technical
    }


def analyze_profile_match(profile_data: Dict[str, Any], query_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze how well a profile matches a query with detailed breakdown
    """
    start_time = time.time()
    
    query_tokens = query_analysis['tokens']
    if not query_tokens:
        return {
            'id': profile_data.get('id'),
            'total_score': 0,
            'field_scores': {},
            'overall_coverage': 0,
            'matched_tokens': [],
            'missing_tokens': [],
            'field_snippets': {},
            'analysis_time_ms': 0
        }
    
    # Analyze each field
    field_scores = {}
    field_snippets = {}
    all_matched_tokens = set()
    all_missing_tokens = set(query_tokens)
    
    for field_name in FIELD_WEIGHTS.keys():
        field_text = extract_field_text(profile_data, field_name)
        field_analysis = analyze_field_match(query_tokens, field_text, field_name)
        
        field_scores[field_name] = field_analysis
        field_snippets[field_name] = field_analysis['snippet']
        
        # Update token tracking
        all_matched_tokens.update(field_analysis['matched_tokens'])
        all_missing_tokens.difference_update(field_analysis['matched_tokens'])
    
    # Calculate total score
    total_score = sum(analysis['score'] for analysis in field_scores.values())
    
    # Calculate overall coverage
    overall_coverage = len(all_matched_tokens) / len(query_tokens) if query_tokens else 0
    
    analysis_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    return {
        'id': profile_data.get('id'),
        'total_score': total_score,
        'field_scores': field_scores,
        'overall_coverage': overall_coverage,
        'matched_tokens': list(all_matched_tokens),
        'missing_tokens': list(all_missing_tokens),
        'field_snippets': field_snippets,
        'analysis_time_ms': round(analysis_time, 2)
    }


def generate_analysis_summary(all_matches: List[Dict[str, Any]], query_analysis: Dict[str, Any], total_scanned: int, elapsed_time: float) -> Dict[str, Any]:
    """
    Generate comprehensive analysis summary
    """
    if not all_matches:
        return {
            'total_matches': 0,
            'total_scanned': total_scanned,
            'query_analysis': query_analysis,
            'coverage_stats': {},
            'field_performance': {},
            'token_insights': {},
            'performance': {
                'elapsed_ms': round(elapsed_time * 1000, 2),
                'avg_match_time_ms': 0
            }
        }
    
    # Coverage statistics
    coverages = [match['overall_coverage'] for match in all_matches]
    coverage_stats = {
        'avg_coverage': round(sum(coverages) / len(coverages), 3),
        'max_coverage': round(max(coverages), 3),
        'min_coverage': round(min(coverages), 3),
        'high_coverage_count': sum(1 for c in coverages if c >= 0.7),
        'medium_coverage_count': sum(1 for c in coverages if 0.3 <= c < 0.7),
        'low_coverage_count': sum(1 for c in coverages if c < 0.3)
    }
    
    # Field performance analysis
    field_performance = defaultdict(list)
    for match in all_matches:
        for field_name, field_score in match['field_scores'].items():
            field_performance[field_name].append(field_score['score'])
    
    field_stats = {}
    for field_name, scores in field_performance.items():
        field_stats[field_name] = {
            'avg_score': round(sum(scores) / len(scores), 2),
            'max_score': round(max(scores), 2),
            'total_contributions': len([s for s in scores if s > 0])
        }
    
    # Token insights
    all_matched_tokens = []
    for match in all_matches:
        all_matched_tokens.extend(match['matched_tokens'])
    
    token_frequency = defaultdict(int)
    for token in all_matched_tokens:
        token_frequency[token] += 1
    
    token_insights = {
        'most_frequent': sorted(token_frequency.items(), key=lambda x: x[1], reverse=True)[:10],
        'unique_tokens': len(token_frequency),
        'total_matches': len(all_matched_tokens)
    }
    
    # Performance metrics
    match_times = [match.get('analysis_time_ms', 0) for match in all_matches]
    avg_match_time = sum(match_times) / len(match_times) if match_times else 0
    
    return {
        'total_matches': len(all_matches),
        'total_scanned': total_scanned,
        'query_analysis': query_analysis,
        'coverage_stats': coverage_stats,
        'field_performance': field_stats,
        'token_insights': token_insights,
        'performance': {
            'elapsed_ms': round(elapsed_time * 1000, 2),
            'avg_match_time_ms': round(avg_match_time, 2),
            'total_analysis_time_ms': round(sum(match_times), 2)
        }
    }