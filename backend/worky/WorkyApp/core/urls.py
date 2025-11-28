from django.urls import path
from .views import GetAllPersonsView, GetPersonView, CreatePersonView, UpdatePersonView, DeletePersonView, SupabaseRagSearchView, SupabaseRagHealthView, SupabaseAskView

urlpatterns = [
    path('', GetAllPersonsView.as_view(), name='get_all_persons'),
    path('get/<str:name>/', GetPersonView.as_view(), name='get_person'),
    path('create/', CreatePersonView.as_view(), name='create_person'),  # Asegúrate de que esta ruta acepte POST
    path('update/<int:id>/', UpdatePersonView.as_view(), name='update_person'),
    path('delete/<int:person_id>/', DeletePersonView.as_view(), name='delete_person'),
    path('rag/search/', SupabaseRagSearchView.as_view(), name='rag_search'),
    path('rag/health/', SupabaseRagHealthView.as_view(), name='rag_health'),
    path('rag/ask/', SupabaseAskView.as_view(), name='rag_ask'),
]
