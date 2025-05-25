# crimes/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer
from ocorrencias.views import OcorrenciaViewSet


class CriarOcorrencia(APIView):
    def post(self, request):
        serializer = OcorrenciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Salva a nova ocorrência no banco de dados
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
