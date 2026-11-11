from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf_cnpj', 'telefone', 'status', 'data_criacao')
    search_fields = ('nome', 'cpf_cnpj', 'telefone')
    list_filter = ('status',)