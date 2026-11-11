import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from .models import Cliente

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')
    else:
        form = AuthenticationForm()
        
    return render(request, 'portal/login.html', {'form': form})

@login_required
def dashboard_view(request):
    # Garante que só utilizadores autenticados acedem à interface principal
    return render(request, 'portal/index.html')

def logout_view(request):
    logout(request)
    return redirect('login')

# API de Clientes
@login_required
@csrf_exempt
def api_clientes(request):
    if request.method == 'GET':
        clientes = Cliente.objects.all().order_by('-id')
        data = [{
            'id': c.id,
            'nome': c.nome,
            'cpf_cnpj': c.cpf_cnpj,
            'telefone': c.telefone,
            'status': c.status,
            'cep': c.cep,
            'endereco': c.endereco,
            'numero': c.numero,
            'bairro': c.bairro,
            'cidade': c.cidade,
            'uf': c.uf,
            'observacoes': c.observacoes
        } for c in clientes]
        return JsonResponse({'status': 'success', 'data': data})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            cliente = Cliente.objects.create(
                nome=data.get('nome'),
                cpf_cnpj=data.get('cpf_cnpj'),
                telefone=data.get('telefone'),
                cep=data.get('cep'),
                endereco=data.get('endereco'),
                numero=data.get('numero'),
                bairro=data.get('bairro'),
                cidade=data.get('cidade'),
                uf=data.get('uf'),
                observacoes=data.get('observacoes')
            )
            return JsonResponse({'status': 'success', 'id': cliente.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)