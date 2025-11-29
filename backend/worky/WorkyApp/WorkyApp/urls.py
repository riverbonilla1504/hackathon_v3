from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.rag_urls")),
    path("person/", include("core.urls")),
]
