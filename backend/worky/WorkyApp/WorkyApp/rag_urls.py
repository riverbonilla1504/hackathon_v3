"""
URL configuration for RAG-only Django server
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/', include('core.rag_urls')),  # Solo endpoints RAG
    path('person/', include('core.rag_urls')),  # También soportar rutas person/ para compatibilidad
]