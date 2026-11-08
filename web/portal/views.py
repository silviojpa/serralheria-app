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
def api_clientes(request):
    if request.method == 'GET':
        clientes = list(Cliente.objects.values('id', 'nome', 'cpf_cnpj', 'telefone', 'status'))
        return JsonResponse({'status': 'success', 'data': clientes})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            cliente = Cliente.objects.create(
                nome=data.get('nome'),
                cpf_cnpj=data.get('cpf_cnpj'),
                telefone=data.get('telefone'),
                email=data.get('email', ''),
                endereco=data.get('endereco', ''),
                status=data.get('status', 'ativo')
            )
            return JsonResponse({
                'status': 'success', 
                'message': 'Cliente cadastrado com sucesso!',
                'cliente': {
                    'id': cliente.id,
                    'nome': cliente.nome,
                    'cpf_cnpj': cliente.cpf_cnpj,
                    'telefone': cliente.telefone,
                    'status': cliente.status
                }
            }, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)