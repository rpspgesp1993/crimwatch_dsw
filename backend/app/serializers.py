from rest_framework import serializers
from app.models import Ocorrencia

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = '__all__'  # Ou especifique os campos que deseja incluir
