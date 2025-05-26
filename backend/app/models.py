from django.db import models

class Ocorrencia(models.Model):
    municipio = models.CharField(max_length=100)
    bairro = models.CharField(max_length=100)
    tipoCrime = models.CharField(max_length=100)
    localizacao = models.CharField(max_length=100)  # Pode ser ajustado para coordenadas com JSONField, se necessário
    descricao = models.TextField()
    data = models.DateField()
    campo1 = models.CharField(max_length=100)
    campo2 = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.tipoCrime} - {self.municipio}/{self.bairro}'
