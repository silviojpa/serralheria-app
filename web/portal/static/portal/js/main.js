// Módulos focados no escopo atual
const modulos = [
  {id:'inicio', nome:'Início', icone:'⌂'},
  {id:'clientes', nome:'Clientes', icone:'♧'},
  {id:'agendamento', nome:'Agendamento', icone:'▦'}
];
// Adiciona o módulo de Equipe apenas se for um Superuser logado
if (window.IS_SUPERUSER) {
  modulos.push({id:'usuarios', nome:'Equipe', icone:'👤'});
}

let usuarios = [];
let formularioNovoUsuarioAberto = false;

  async function carregarClientesDoBackend() {
    try {
      const response = await fetch('/api/clientes/');
      const result = await response.json();
      if (result.status === 'success') {
        clientes = result.data.map(c => ({
          id: String(c.id).padStart(6, '0'),
          dbId: c.id,
          nome: c.nome,
          cpf: c.cpf_cnpj,
          contato: c.telefone,
          status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : 'Ativo',
          // Mapeamento dos novos campos
          cep: c.cep,
          endereco: c.endereco,
          numero: c.numero,
          bairro: c.bairro,
          cidade: c.cidade,
          uf: c.uf,
          observacoes: c.observacoes
        }));
        if (typeof atualizarListaClientes === 'function') {
          atualizarListaClientes();
        }
      }
    } catch (err) {
      console.error("Erro ao carregar clientes do banco:", err);
    }
  }

  // Busca inicial dos clientes do banco
  carregarClientesDoBackend();

  let paginaAtual = 'inicio', clienteAtual = null, pesquisaCliente = '';
  const elPagina = document.getElementById('pagina');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusChip = s => `<span class="chip ${s === 'Inativo' ? 'chip-vermelho' : 'chip-verde'}">${esc(s)}</span>`;
  const ocultarDocumento = (doc) => {
    if (!doc) return '—';
    
    // O Administrador vê sempre o documento completo
    if (window.IS_SUPERUSER) return esc(doc); 
    
    const str = String(doc).trim();

    // CPF sem pontuação (11 dígitos): ex 12345678900 -> ***456789**
    if (str.length === 11) {
      return `***${str.substring(3, 9)}**`;
    }
    // CPF com pontuação (14 caracteres): ex 123.456.789-00 -> ***.456.789-**
    if (str.length === 14) {
      return `***${str.substring(3, 12)}**`;
    }
    // CNPJ com pontuação (18 caracteres): ex 12.345.678/0001-99 -> **.345.678/0001-**
    if (str.length === 18) {
      return `**${str.substring(2, 16)}**`;
    }

    // Fallback genérico: mascara os 3 primeiros e os 2 últimos
    if (str.length > 5) {
      return `***${str.substring(3, str.length - 2)}**`;
    }
    
    return '***';
  };

  function ir(p) {
    paginaAtual = p;
    clienteAtual = null;
    formularioNovoClienteAberto = false;
    render();
    window.scrollTo(0,0);
  }

  function abrirCliente(id) {
    clienteAtual = clientes.find(c => c.id === id) || null;
    if (!clienteAtual) { alert('Cliente não localizado.'); return; }
    paginaAtual = 'clientes';
    formularioNovoClienteAberto = false;
    render();
    window.scrollTo(0,0);
  }

  function cabecalho(titulo, desc, acoes='') {
    return `<div class="cabecalho"><div><h1>${titulo}</h1><p class="suave">${desc}</p></div>${acoes}</div>`;
  }
  function titulo(t, icone='▤') {
    return `<div class="card-titulo"><span class="sinal">${icone}</span><h2>${t}</h2></div>`;
  }
  function info(a, b) {
    return `<div class="info"><span>${a}</span><strong>${b}</strong></div>`;
  }
  function kpi(label, num, extra='') {
    return `<div class="card mini-indicador"><small>${label}</small><b>${num}</b><p class="suave" style="font-size:11px">${extra}</p></div>`;
  }

  function renderMenu() {
    document.getElementById('menu').innerHTML = modulos.map(m => 
      `<button type="button" class="nav-btn ${m.id === paginaAtual ? 'ativo' : ''}" onclick="ir('${m.id}')">
        <span class="ico">${m.icone}</span>
        <span class="nome">${m.nome}</span>
      </button>`
    ).join('');
  }

  // HOME FOCADA
  function home() {
    const atalhos = modulos.filter(m => m.id !== 'inicio').map(m => 
      `<button class="atalho" onclick="ir('${m.id}')">
        <span class="sinal">${m.icone}</span>
        <span>${m.nome}</span>
        <span class="seta">›</span>
      </button>`
    ).join('');

    // Torna a etiqueta visual dinâmica baseada no nível do usuário
    const tagNivel = window.IS_SUPERUSER ? 
      '<span class="chip chip-verde">Administrador</span>' : 
      '<span class="chip chip-laranja">Operador</span>';

    // Proteção: aguarda as variáveis carregarem para evitar a tela em branco
    const qtdClientes = (typeof clientes !== 'undefined' && clientes) ? clientes.length : 0;
    const qtdAgendamentos = (typeof agendamentos !== 'undefined' && agendamentos) ? agendamentos.length : 0;

    return `${cabecalho('Painel Geral', 'Serralheria Casa das Artes', tagNivel)}
      <div class="home-grid">
        <section class="card card-pad">
          ${titulo('Acesso rápido aos módulos', '▦')}
          <div class="atalhos">${atalhos}</div>
        </section>
        <section class="card card-pad">
          ${titulo('Resumo do Sistema', '♧')}
          <div class="mini-indicadores">
            ${kpi('Clientes Cadastrados', qtdClientes, 'Base PostgreSQL')}
            ${kpi('Agendamentos', qtdAgendamentos, 'Visitas cadastradas')}
          </div>
        </section>
      </div>`;
  }

  function pesquisarGlobal(valor) {
    if (paginaAtual !== 'clientes' || clienteAtual) {
      ir('clientes'); // Força a ida para a tela de lista de clientes
    }
    pesquisaCliente = valor;
  
    // Sincroniza o input da tela de clientes com o valor global
    const inputTela = document.getElementById('buscaCliente');
    if (inputTela) inputTela.value = valor;
  
    atualizarListaClientes();
  }

  // CONTROLE DO PAINEL DE NOVO CLIENTE
  function toggleFormularioNovoCliente() {
    formularioNovoClienteAberto = !formularioNovoClienteAberto;
    render();
    if (formularioNovoClienteAberto) {
      setTimeout(() => document.getElementById('cadNome')?.focus(), 50);
    }
  }

  // CLIENTES
  function listarClientes() {
    const linhas = clientes.filter(c => (c.nome + c.id + c.contato).toLowerCase().includes(pesquisaCliente.toLowerCase())).map(c => 
      `<tr>
        <td><b>${esc(c.nome)}</b><br><small class="suave">#${c.id}</small></td>
        <td>${ocultarDocumento(c.cpf)}</td>
        <td>${esc(c.contato || '—')}</td>
        <td>${statusChip(c.status)}</td>
        <td><button class="link" onclick="abrirCliente('${c.id}')">Abrir ficha →</button></td>
      </tr>`
    ).join('');

    const painelFormulario = formularioNovoClienteAberto ? `
      <section class="painel-cadastro">
        <div class="cabecalho" style="margin-bottom: 14px;">
          <div>
            ${titulo('Cadastrar Novo Cliente', '♧')}
            <p class="suave">Insira as informações do cliente para salvar na base da empresa.</p>
            <p class="suave" style="grid-column: span 6; font-size: 10px; margin-top: 10px; text-align: right;">
              🔒 Os dados recolhidos destinam-se exclusivamente à prestação de serviços e faturação, conforme a LGPD.
            </p>
          </div>
          <button class="link" onclick="toggleFormularioNovoCliente()">Fechar ×</button>
        </div>
        <form onsubmit="cadastrarCliente(event)">
          <div class="form-grid" style="grid-template-columns: repeat(6, 1fr);">
            <label style="grid-column: span 2">Nome completo / Razão Social * <input class="campo-input" id="cadNome" required placeholder="Ex.: João da Silva" /></label>
            <label style="grid-column: span 2">CPF ou CNPJ * <input class="campo-input" id="cadCpf" required placeholder="000.000.000-00" /></label>
            <label style="grid-column: span 2">Telefone / WhatsApp * <input class="campo-input" id="cadTelefone" required placeholder="(21) 00000-0000" /></label>
            
            <label style="grid-column: span 1">CEP <input class="campo-input" id="cadCep" placeholder="00000-000" /></label>
            <label style="grid-column: span 3">Endereço <input class="campo-input" id="cadEndereco" placeholder="Rua das Artes..." /></label>
            <label style="grid-column: span 2">Número / Comp. <input class="campo-input" id="cadNumero" placeholder="123 - Apt 101" /></label>
            
            <label style="grid-column: span 2">Bairro <input class="campo-input" id="cadBairro" placeholder="Ex: Madureira" /></label>
            <label style="grid-column: span 3">Cidade <input class="campo-input" id="cadCidade" placeholder="Rio de Janeiro" /></label>
            <label style="grid-column: span 1">UF <input class="campo-input" id="cadUf" placeholder="RJ" maxlength="2" /></label>
            
            <label style="grid-column: span 6">Anotações e Preferências Operacionais <textarea class="campo-input" id="cadObs" rows="2" style="resize:vertical; width:100%" placeholder="Ex: Cliente prefere contato via WhatsApp..."></textarea></label>
            
            <div class="form-acoes">
              <button type="button" class="botao botao-outline" onclick="toggleFormularioNovoCliente()">Cancelar</button>
              <button type="submit" class="botao">Salvar no PostgreSQL</button>
            </div>
          </div>
        </form>
      </section>
    ` : '';

    return `${cabecalho('Clientes', 'Consulta e centralização de dados cadastrais', 
      `<button class="botao" onclick="toggleFormularioNovoCliente()">${formularioNovoClienteAberto ? 'Fechar formulário' : '+ Novo cliente'}</button>`
    )}
    ${painelFormulario}
    <section class="card card-pad">
      ${titulo('Relação de clientes', '♧')}
      <div class="filtro">
        <input id="buscaCliente" class="campo-input" placeholder="Buscar por nome, código ou telefone" value="${esc(pesquisaCliente)}" oninput="pesquisaCliente=this.value;atualizarListaClientes()">
      </div>
      <div class="tabela-wrap">
        <table>
          <thead>
            <tr><th>Cliente</th><th>CPF / CNPJ</th><th>Telefone</th><th>Status</th><th></th></tr>
          </thead>
          <tbody id="linhasClientes">${linhas || '<tr><td colspan="5" class="sem-resultado">Nenhum cliente encontrado</td></tr>'}</tbody>
        </table>
      </div>
    </section>`;
  }

  async function carregarUsuariosDoBackend() {
  if (!window.IS_SUPERUSER) return;
  try {
    const response = await fetch('/api/usuarios/');
    const result = await response.json();
    if (result.status === 'success') usuarios = result.data;
  } catch (err) { console.error("Erro ao carregar usuários:", err); }
}
carregarUsuariosDoBackend();

function toggleFormularioNovoUsuario() {
  formularioNovoUsuarioAberto = !formularioNovoUsuarioAberto;
  render();
}

function listarUsuarios() {
  const linhas = usuarios.map(u => 
    `<tr>
      <td><b>${esc(u.username)}</b></td>
      <td>${esc(u.nome || '—')}</td>
      <td>${esc(u.email || '—')}</td>
      <td>${u.is_superuser ? '<span class="chip chip-verde">Administrador</span>' : '<span class="chip chip-laranja">Operador</span>'}</td>
      <td>${u.data_criacao}</td>
    </tr>`
  ).join('');

  const painelFormulario = formularioNovoUsuarioAberto ? `
    <section class="painel-cadastro">
      <div class="cabecalho" style="margin-bottom: 14px;">
        <div>
          ${titulo('Criar Novo Acesso', '👤')}
          <p class="suave">Cadastre um novo Operador ou Administrador no sistema.</p>
        </div>
        <button class="link" onclick="toggleFormularioNovoUsuario()">Fechar ×</button>
      </div>
      <form onsubmit="cadastrarUsuario(event)">
        <div class="form-grid" style="grid-template-columns: repeat(4, 1fr);">
          <label style="grid-column: span 1">Login (Username) * <input class="campo-input" id="usuUsername" required placeholder="ex: thiago.silva" /></label>
          <label style="grid-column: span 1">Nome e Sobrenome * <input class="campo-input" id="usuNome" required placeholder="Thiago Silva" /></label>
          <label style="grid-column: span 1">E-mail <input class="campo-input" id="usuEmail" type="email" placeholder="thiago@email.com" /></label>
          <label style="grid-column: span 1">Senha * <input class="campo-input" id="usuSenha" type="password" required placeholder="******" /></label>
          
          <label style="grid-column: span 4">Nível de Acesso * 
            <select class="campo-input" id="usuNivel" required style="margin-top: 6px;">
              <option value="operador">Operador (Acesso restrito padrão)</option>
              <option value="admin">Administrador (Acesso total)</option>
            </select>
          </label>
          
          <div class="form-acoes">
            <button type="button" class="botao botao-outline" onclick="toggleFormularioNovoUsuario()">Cancelar</button>
            <button type="submit" class="botao">Criar Usuário</button>
          </div>
        </div>
      </form>
    </section>
  ` : '';

  return `${cabecalho('Gestão de Equipe', 'Controle de acessos e permissões do sistema', 
    `<button class="botao" onclick="toggleFormularioNovoUsuario()">${formularioNovoUsuarioAberto ? 'Fechar formulário' : '+ Novo usuário'}</button>`
  )}
  ${painelFormulario}
  <section class="card card-pad">
    ${titulo('Usuários do Sistema', '👤')}
    <div class="tabela-wrap">
      <table>
        <thead><tr><th>Username</th><th>Nome</th><th>E-mail</th><th>Permissão</th><th>Criado em</th></tr></thead>
        <tbody>${linhas || '<tr><td colspan="5" class="sem-resultado">Nenhum usuário encontrado</td></tr>'}</tbody>
      </table>
    </div>
  </section>`;
}

async function cadastrarUsuario(ev) {
  ev.preventDefault();
  const username = document.getElementById('usuUsername').value.trim();
  const nome = document.getElementById('usuNome').value.trim();
  const email = document.getElementById('usuEmail').value.trim();
  const password = document.getElementById('usuSenha').value;
  const is_superuser = document.getElementById('usuNivel').value === 'admin';

  try {
    const response = await fetch('/api/usuarios/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify({ username, nome, email, password, is_superuser })
    });
    
    const result = await response.json();
    if (response.ok) {
      formularioNovoUsuarioAberto = false;
      await carregarUsuariosDoBackend();
      render();
    } else {
      alert('Erro ao cadastrar: ' + (result.message || 'Falha na requisição.'));
    }
  } catch (err) { alert('Erro na requisição: ' + err); }
}

  function atualizarListaClientes() {
    const linhas = clientes.filter(c => (c.nome + c.id + c.contato).toLowerCase().includes(pesquisaCliente.toLowerCase())).map(c => 
      `<tr>
        <td><b>${esc(c.nome)}</b><br><small class="suave">#${c.id}</small></td>
        <td>${ocultarDocumento(c.cpf)}</td>
        <td>${esc(c.contato || '—')}</td>
        <td>${statusChip(c.status)}</td>
        <td><button class="link" onclick="abrirCliente('${c.id}')">Abrir ficha →</button></td>
      </tr>`
    ).join('');
    const el = document.getElementById('linhasClientes');
    if (el) el.innerHTML = linhas || '<tr><td colspan="5" class="sem-resultado">Nenhum cliente encontrado</td></tr>';
  }

  // Cadastrar cliente com novos campos
  async function cadastrarCliente(ev) {
    ev.preventDefault();
    const nome = document.getElementById('cadNome').value.trim();
    const cpf_cnpj = document.getElementById('cadCpf').value.trim();
    const telefone = document.getElementById('cadTelefone').value.trim();
    
    const cep = document.getElementById('cadCep').value.trim();
    const endereco = document.getElementById('cadEndereco').value.trim();
    const numero = document.getElementById('cadNumero').value.trim();
    const bairro = document.getElementById('cadBairro').value.trim();
    const cidade = document.getElementById('cadCidade').value.trim();
    const uf = document.getElementById('cadUf').value.trim();
    const observacoes = document.getElementById('cadObs').value.trim();

    if (!nome || !cpf_cnpj || !telefone) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      const response = await fetch('/api/clientes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ nome, cpf_cnpj, telefone, cep, endereco, numero, bairro, cidade, uf, observacoes })
      });
      
      const result = await response.json();
      if (response.ok) {
        formularioNovoClienteAberto = false;
        await carregarClientesDoBackend();
        render();
      } else {
        alert('Erro ao cadastrar: ' + (result.message || JSON.stringify(result)));
      }
    } catch (err) {
      alert('Erro na requisição: ' + err);
    }
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function fichaCliente() {
    const c = clienteAtual;
    const observacoes = c.observacoes || 'Nenhuma observação ou preferência operacional cadastrada para este cliente até o momento.';
    const endCompleto = c.endereco ? `${c.endereco}, ${c.numero || 'S/N'} - ${c.bairro || ''}<br>${c.cidade || ''}/${c.uf || ''} - CEP: ${c.cep || ''}` : 'Nenhum endereço cadastrado';

    return `<button class="link" onclick="ir('clientes')">← Voltar à listagem</button><div style="height:13px"></div>
      ${cabecalho('Cadastro do Cliente', 'Ficha centralizada do cliente')}
      
      <div class="card cliente-topo">
        <div class="cliente-pessoa">
          <div class="cliente-circulo">${esc(c.nome.split(' ').slice(0,2).map(p=>p[0]).join(''))}</div>
          <div><h2>${esc(c.nome)}</h2><p class="suave">Cliente #${c.id} &nbsp; • &nbsp; CPF/CNPJ ${esc(c.cpf || 'Não informado')}</p></div>
        </div>
        ${statusChip(c.status)}
      </div>

      <div class="duas-colunas">
        <section class="card card-pad">
          ${titulo('Informações básicas', '♧')}
          ${info('Nome completo', esc(c.nome))}
          ${info('CPF / CNPJ', ocultarDocumento(c.cpf))}
          ${info('Telefone / WhatsApp', esc(c.contato || 'Não informado'))}
        </section>
        
        <section class="card card-pad">
          ${titulo('Endereço', '⌖')}
          ${info('Endereço', endCompleto)}
        </section>
      </div>

      <section class="card card-pad" style="margin-top: 20px;">
        ${titulo('Anotações e Preferências Operacionais', '✎')}
        <p class="suave" style="font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; padding-top: 5px;">${esc(observacoes)}</p>
      </section>`;
  }

  /* ================= AGENDAMENTO SEMANAL ================= */
  const CONFIG_AGENDA = {
    duracaoMin:60, intervaloLogisticoMin:10, maxEntreVisitasKm:30, antecedenciaMin:120, diasBusca:28,
    horas:Array.from({length:10},(_,i)=>i+8), horasSugestoes:[8,9,10,11,13,14,15,16]
  };
  const locaisAgenda = {
    centro:{nome:'Centro',lat:-22.9068,lng:-43.1729},
    tijuca:{nome:'Tijuca',lat:-22.9249,lng:-43.2325},
    meier:{nome:'Méier',lat:-22.9032,lng:-43.2796},
    barra:{nome:'Barra da Tijuca',lat:-23.0004,lng:-43.3659}
  };
  const CHAVE_AGENDA = 'serralheria-casa-das-artes-agenda-demo-v2';
  const diaSemanaCurto=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  function dataBrasilia() {
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const v = Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return `${v.year}-${v.month}-${v.day}`;
  }

  function parseISO(s){ return new Date(`${s}T12:00:00`); }
  function toISO(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function addDias(s,n){ const d=parseISO(s); d.setDate(d.getDate()+n); return toISO(d); }
  function segundaFeira(s){ const d=parseISO(s); const ds=(d.getDay()+6)%7; d.setDate(d.getDate()-ds); return toISO(d); }
  function diaNum(s){ return parseISO(s).getDay(); }
  function curto(s){ return parseISO(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}); }
  function legivel(s){ return parseISO(s).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'}); }
  function horaStr(h){ return String(h).padStart(2,'0')+':00'; }

  let semanaAgenda = segundaFeira(dataBrasilia());
  let diaAgenda = dataBrasilia();
  let agendaFormAberto = false;
  let agendamentos = [];
  try {
    const saved = JSON.parse(localStorage.getItem(CHAVE_AGENDA));
    agendamentos = Array.isArray(saved) ? saved : [];
  } catch(e) { agendamentos = []; }

  function visitasDia(data) { return agendamentos.filter(a=>a.data===data).sort((a,b)=>a.hora-b.hora); }

  function agenda() {
    const fim = addDias(semanaAgenda,6);
    const total = agendamentos.filter(a => a.data>=semanaAgenda && a.data<=fim).length;
    const dias = Array.from({length:7}, (_,i) => addDias(semanaAgenda,i));

    const cab = `<div class="agenda-hora" style="background:#f6faf7"></div>${dias.map(d => 
      `<button type="button" class="agenda-cab-dia ${d===diaAgenda?'selecionado':''} ${d===dataBrasilia()?'hoje':''}" onclick="diaAgenda='${d}';render();">
        <small>${diaSemanaCurto[diaNum(d)]}</small><strong>${curto(d)}</strong><small>${visitasDia(d).length} visita(s)</small>
      </button>`
    ).join('')}`;

    const rows = CONFIG_AGENDA.horas.map(h => {
      const cells = dias.map(d => {
        const dN = diaNum(d);
        const aberto = dN===6 ? (h>=8 && h<12) : (dN>=1 && dN<=5 && (h>=8 && h<12 || h>=13 && h<18));
        const vis = visitasDia(d).find(a => a.hora === h);
        if(!aberto) return `<div class="agenda-celula bloqueado"><span class="agenda-fechado">Fechado</span></div>`;
        if(vis) return `<button type="button" class="agenda-celula ocupado ${d===diaAgenda?'selecionado':''}"><span class="agenda-tag"><b>${esc(vis.cliente)}</b>${esc(vis.tipo)}</span></button>`;
        return `<button type="button" class="agenda-celula ${d===diaAgenda?'selecionado':''}"><span class="agenda-vago">Livre</span></button>`;
      }).join('');
      return `<div class="agenda-hora">${horaStr(h)}</div>${cells}`;
    }).join('');

    return `${cabecalho('Agendamento', 'Agenda semanal de visitas técnicas e medições')}
      <div class="mini-indicadores">
        ${kpi('Visitas na semana', total, 'Segunda a domingo')}
        ${kpi('Visitas no dia selecionado', visitasDia(diaAgenda).length, curto(diaAgenda))}
      </div>
      <section class="card agenda-painel ag-section">
        <div class="agenda-toolbar">
          <div><h2>Calendário semanal</h2><p class="suave">Segunda a sexta: 08h–12h e 13h–18h · Sábado: 08h–12h</p></div>
          <div class="agenda-controles">
            <button class="botao botao-outline botao-pequeno" onclick="semanaAgenda=addDias(semanaAgenda,-7);diaAgenda=semanaAgenda;render();">←</button>
            <div class="agenda-periodo">${curto(semanaAgenda)} a ${curto(fim)}</div>
            <button class="botao botao-outline botao-pequeno" onclick="semanaAgenda=addDias(semanaAgenda,7);diaAgenda=semanaAgenda;render();">→</button>
          </div>
        </div>
        <div class="agenda-scroller"><div class="agenda-calendario">${cab}${rows}</div></div>
      </section>`;
  }

  function render() {
  renderMenu();
  elPagina.innerHTML = paginaAtual === 'inicio' ? home() :
                       paginaAtual === 'clientes' ? (clienteAtual ? fichaCliente() : listarClientes()) :
                       paginaAtual === 'agendamento' ? agenda() : 
                       paginaAtual === 'usuarios' ? listarUsuarios() : home();
}

// Garante que todas as variáveis foram lidas antes do primeiro desenho
setTimeout(() => {
  render();
}, 50);