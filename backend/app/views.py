from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics  # // alteração: import para views baseadas em classe
from .serializers import OcorrenciaSerializer
from .models import Ocorrencia  # // alteração: import do model necessário para queryset
from rest_framework.views import APIView  # // adicionado para criar a HomeView


@api_view(['POST'])
def registrar_ocorrencia(request):
    serializer = OcorrenciaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OcorrenciaListCreate(generics.ListCreateAPIView):  # // alteração: nova classe
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer
    
class HomeView(APIView):  # // adicionado para a rota raiz '/'
    def get(self, request):
        return Response({"message": "Bem-vindo à API do CrimWatch!"})
    