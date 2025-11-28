from django.urls import path
from .views import GetAllPersonsView, GetPersonView, CreatePersonView, UpdatePersonView, DeletePersonView

urlpatterns = [
    path('', GetAllPersonsView.as_view(), name='get_all_persons'),
    path('get/<str:name>/', GetPersonView.as_view(), name='get_person'),
    path('create/', CreatePersonView.as_view(), name='create_person'),  # Asegúrate de que esta ruta acepte POST
    path('update/<int:id>/', UpdatePersonView.as_view(), name='update_person'),
    path('delete/<int:person_id>/', DeletePersonView.as_view(), name='delete_person'),
]
