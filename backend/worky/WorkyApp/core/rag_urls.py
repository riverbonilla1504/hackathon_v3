from django.urls import path
from .views import SupabaseRagSearchView, SupabaseRagHealthView, SupabaseAskView, AIHealthView, AIAskView, ProfileAIAskView, RankingView

# URLs solo para funcionalidad RAG - no requieren base de datos
urlpatterns = [
    path('rag/search/', SupabaseRagSearchView.as_view(), name='rag_search'),
    path('rag/health/', SupabaseRagHealthView.as_view(), name='rag_health'),
    path('rag/ask/', SupabaseAskView.as_view(), name='rag_ask'),
    path('ai/health/', AIHealthView.as_view(), name='ai_health'),
    path('ai/ask/', AIAskView.as_view(), name='ai_ask'),
    path('profile/ask/', ProfileAIAskView.as_view(), name='profile_ai_ask'),
    path('profile/ask', ProfileAIAskView.as_view(), name='profile_ai_ask_no_slash'),
    path('ranking/', RankingView.as_view(), name='ranking'),
]