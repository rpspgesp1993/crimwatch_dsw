# backend/urls.py

from django.contrib import admin
from django.urls import path
from app import views  # Corrigir para o nome da aplicação, que é 'app'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ocorrencias/', views.OcorrenciaListCreate.as_view(), name='ocorrencia-list-create'),
    path('', views.HomeView.as_view(), name='home'),
]
