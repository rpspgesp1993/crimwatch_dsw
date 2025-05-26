# backend/urls.py

from django.contrib import admin
from django.urls import path
from app import views 

urlpatterns = [
    # Rota para o painel administrativo do Django
    path('admin/', admin.site.urls),
    
    # Rota para a API de ocorrências
    path('api/ocorrencias/', views.OcorrenciaListCreate.as_view(), name='ocorrencia-list-create'),
    
    # Rota para a página inicial (se necessário)
    path('', views.HomeView.as_view(), name='home'),
]
