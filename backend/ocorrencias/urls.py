# crimes/urls.py

from django.urls import path
from .views import CriarOcorrencia

urlpatterns = [
    path('api/ocorrencias/', CriarOcorrencia.as_view(), name='criar_ocorrencia')
]
