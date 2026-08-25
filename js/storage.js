// ===============================
// storage.js
// Dados temporários do navegador
// ===============================


// ======================================================
// FUNÇÕES GENÉRICAS DE LOCALSTORAGE
// ======================================================

function lerLista(chave, listaInicial) {

  const dados = localStorage.getItem(chave);

  if (dados === null) {

    localStorage.setItem(
      chave,
      JSON.stringify(listaInicial)
    );

    return listaInicial;
  }

  return JSON.parse(dados);
}


function salvarLista(chave, lista) {

  localStorage.setItem(
    chave,
    JSON.stringify(lista)
  );
}


// ======================================================
// SESSÃO / LOGIN
// ======================================================

const CHAVE_USUARIO_LOGADO =
  "sistema_igreja_usuario_logado";

const CHAVE_TOKEN =
  "sistema_igreja_token";


// Salva a sessão retornada pela API
function salvarSessao(login) {

  if (!login) {
    return;
  }

  // Salva o token
  if (login.access_token) {

    localStorage.setItem(
      CHAVE_TOKEN,
      login.access_token
    );
  }

  // Salva os dados do usuário
  localStorage.setItem(
    CHAVE_USUARIO_LOGADO,
    JSON.stringify({
      id: login.id,
      nome: login.nome_completo,
      email: login.email,
      cargo: login.cargo,
      token_type: login.token_type || "bearer"
    })
  );
}


// Recupera os dados do usuário logado
function getSessao() {

  const dados = localStorage.getItem(
    CHAVE_USUARIO_LOGADO
  );

  return dados
    ? JSON.parse(dados)
    : null;
}


// Recupera o token JWT
function getToken() {

  return localStorage.getItem(
    CHAVE_TOKEN
  );
}


// Verifica se existe uma sessão
function estaLogado() {

  return !!getToken() && !!getSessao();
}


// Encerra a sessão
function sair() {

  localStorage.removeItem(
    CHAVE_USUARIO_LOGADO
  );

  localStorage.removeItem(
    CHAVE_TOKEN
  );
}


// ======================================================
// EVENTOS
// ======================================================

const CHAVE_EVENTOS =
  "sistema_igreja_eventos";


const EVENTOS_INICIAIS = [

  {
    id: 1,
    nome: "Dia dos Namorados",
    data: "2026-06-12",
    tipo: "lembrete",
    icone: "fa-heart"
  },

  {
    id: 2,
    nome: "Dia do Amigo",
    data: "2026-07-20",
    tipo: "lembrete",
    icone: "fa-people-arrows"
  },

  {
    id: 3,
    nome: "Dia dos Avós",
    data: "2026-07-26",
    tipo: "lembrete",
    icone: "fa-user-group"
  },

  {
    id: 4,
    nome: "Dia dos Pais",
    data: "2026-08-09",
    tipo: "importante",
    icone: "fa-person"
  },

  {
    id: 5,
    nome: "Dia do Soldado",
    data: "2026-08-25",
    tipo: "lembrete",
    icone: "fa-flag"
  },

  {
    id: 6,
    nome: "Dia do Pastor",
    data: "2026-10-11",
    tipo: "importante",
    icone: "fa-cross"
  },

  {
    id: 7,
    nome: "Dia das Crianças",
    data: "2026-10-12",
    tipo: "importante",
    icone: "fa-child"
  },

  {
    id: 8,
    nome: "Dia do Professor",
    data: "2026-10-15",
    tipo: "lembrete",
    icone: "fa-chalkboard-user"
  },

  {
    id: 9,
    nome: "Dia de Ação de Graças",
    data: "2026-11-26",
    tipo: "lembrete",
    icone: "fa-hands-praying"
  },

  {
    id: 10,
    nome: "Natal",
    data: "2026-12-25",
    tipo: "importante",
    icone: "fa-tree"
  },

  {
    id: 11,
    nome: "Dia da Amizade (virada do ano)",
    data: "2026-12-31",
    tipo: "lembrete",
    icone: "fa-champagne-glasses"
  }

];


function getEventos() {

  return lerLista(
    CHAVE_EVENTOS,
    EVENTOS_INICIAIS
  );
}


function addEvento(evento) {

  const eventos = getEventos();

  evento.id = Date.now();

  eventos.push(evento);

  salvarLista(
    CHAVE_EVENTOS,
    eventos
  );

  return evento;
}


function excluirEvento(id) {

  const eventos =
    getEventos().filter(
      evento => evento.id !== id
    );

  salvarLista(
    CHAVE_EVENTOS,
    eventos
  );
}


function buscarEvento(id) {

  return getEventos().find(
    evento => evento.id === Number(id)
  ) || null;
}


function editarEvento(
  id,
  dadosNovos
) {

  const eventos = getEventos();

  const indice = eventos.findIndex(
    evento => evento.id === Number(id)
  );

  if (indice === -1) {
    return null;
  }

  dadosNovos.id = Number(id);

  eventos[indice] = dadosNovos;

  salvarLista(
    CHAVE_EVENTOS,
    eventos
  );

  return dadosNovos;
}


// ======================================================
// PERFIL DO ADMINISTRADOR
// ======================================================

const CHAVE_PERFIL_ADMIN =
  "sistema_igreja_perfil_admin";


function getPerfilAdmin() {

  const dados = localStorage.getItem(
    CHAVE_PERFIL_ADMIN
  );

  return dados
    ? JSON.parse(dados)
    : null;
}


function salvarPerfilAdmin(perfil) {

  localStorage.setItem(
    CHAVE_PERFIL_ADMIN,
    JSON.stringify(perfil)
  );
}


// ======================================================
// CONFIGURAÇÕES DA IGREJA
// ======================================================

const CHAVE_CONFIG_IGREJA =
  "sistema_igreja_config";


function getConfigIgreja() {

  const dados = localStorage.getItem(
    CHAVE_CONFIG_IGREJA
  );

  return dados
    ? JSON.parse(dados)
    : null;
}


function salvarConfigIgreja(config) {

  localStorage.setItem(
    CHAVE_CONFIG_IGREJA,
    JSON.stringify(config)
  );
}


// ======================================================
// MINISTÉRIOS
// ======================================================

const CHAVE_MINISTERIOS =
  "sistema_igreja_ministerios";


const MINISTERIOS_INICIAIS = [

  {
    id: 1,
    nome: "Louvor",
    lider: "Ana Paula",
    icone: "fa-music"
  },

  {
    id: 2,
    nome: "Infantil",
    lider: "Fernanda Lima",
    icone: "fa-child-reaching"
  },

  {
    id: 3,
    nome: "Jovens",
    lider: "Pedro Henrique",
    icone: "fa-people-group"
  },

  {
    id: 4,
    nome: "Diaconato",
    lider: "José Carlos",
    icone: "fa-hands-holding-child"
  },

  {
    id: 5,
    nome: "Ação Social",
    lider: "Rosana Alves",
    icone: "fa-utensils"
  },

  {
    id: 6,
    nome: "Ensino / EBD",
    lider: "Marcos Vinícius",
    icone: "fa-book-bible"
  }

];


function getMinisterios() {

  return lerLista(
    CHAVE_MINISTERIOS,
    MINISTERIOS_INICIAIS
  );
}


function addMinisterio(ministerio) {

  const ministerios =
    getMinisterios();

  ministerio.id = Date.now();

  ministerios.push(ministerio);

  salvarLista(
    CHAVE_MINISTERIOS,
    ministerios
  );

  return ministerio;
}


function excluirMinisterio(id) {

  const ministerios =
    getMinisterios().filter(
      ministerio => ministerio.id !== id
    );

  salvarLista(
    CHAVE_MINISTERIOS,
    ministerios
  );
}


function buscarMinisterio(id) {

  return getMinisterios().find(
    ministerio =>
      ministerio.id === Number(id)
  ) || null;
}


function editarMinisterio(
  id,
  dadosNovos
) {

  const ministerios =
    getMinisterios();

  const indice =
    ministerios.findIndex(
      ministerio =>
        ministerio.id === Number(id)
    );

  if (indice === -1) {
    return null;
  }

  dadosNovos.id = Number(id);

  ministerios[indice] = dadosNovos;

  salvarLista(
    CHAVE_MINISTERIOS,
    ministerios
  );

  return dadosNovos;
}