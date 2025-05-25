# crimes/serializers.py

from rest_framework import serializers
from .models import Ocorrencia

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = ['municipio', 'bairro', 'tipo_crime', 'descricao', 'localizacao', 'data']
