// ===============================
// storage.js
// "Banco de dados temporário" usando o localStorage do navegador.
// Serve só pra testar o fluxo completo (cadastrar → aparecer na lista)
// antes de existir a API de verdade. No final do projeto, essas
// funções vão ser trocadas por chamadas fetch() pra API.
// ===============================

// getMembros, addMembro e excluirMembro mudaram pro api.js —
// agora falam com a API de verdade em vez do localStorage.

// Famílias deixaram de ser uma lista separada — a partir de agora,
// é só a etiqueta de texto livre no cadastro de Membro (campo "familia").

// ----- Funções genéricas de leitura/escrita -----
function lerLista(chave, listaInicial) {
  const dados = localStorage.getItem(chave);

  if (dados === null) {
    // Primeira vez: grava a lista inicial e devolve ela
    localStorage.setItem(chave, JSON.stringify(listaInicial));
    return listaInicial;
  }

  return JSON.parse(dados);
}

function salvarLista(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

// ==========================================================
// ⚠️ AVISO DE SEGURANÇA — LER ANTES DE MEXER AQUI ⚠️
// As senhas abaixo são salvas SEM criptografia, só pra testar
// o fluxo de login visualmente. Isso NUNCA pode ir pra produção
// assim. Quando a API entrar, a senha precisa ser criptografada
// (hash com bcrypt) ANTES de ser salva — nunca salva "pelada".
// ==========================================================

const CHAVE_USUARIO_LOGADO = "sistema_igreja_usuario_logado";

// getUsuarios, emailJaCadastrado, criarUsuario e verificarLogin
// mudaram pro api.js — agora falam com a API de verdade.

function salvarSessao(usuario) {
  localStorage.setItem(CHAVE_USUARIO_LOGADO, JSON.stringify({
    nome: usuario.nome_completo,
    email: usuario.email,
    cargo: usuario.cargo || "membro",
  }));
}

function getSessao() {
  const dados = localStorage.getItem(CHAVE_USUARIO_LOGADO);
  return dados ? JSON.parse(dados) : null;
}

function sair() {
  localStorage.removeItem(CHAVE_USUARIO_LOGADO);
}

// getVisitantes, addVisitante e excluirVisitante mudaram pro api.js —
// agora falam com a API de verdade.

// ----- Eventos -----
const CHAVE_EVENTOS = "sistema_igreja_eventos";

// tipo "importante" = precisa de preparação (ensaio, teatro, almoço)
// tipo "lembrete"   = só pra não esquecer, sem preparação especial
const EVENTOS_INICIAIS = [
  { id: 1, nome: "Dia dos Namorados", data: "2026-06-12", tipo: "lembrete", icone: "fa-heart" },
  { id: 2, nome: "Dia do Amigo", data: "2026-07-20", tipo: "lembrete", icone: "fa-people-arrows" },
  { id: 3, nome: "Dia dos Avós", data: "2026-07-26", tipo: "lembrete", icone: "fa-user-group" },
  { id: 4, nome: "Dia dos Pais", data: "2026-08-09", tipo: "importante", icone: "fa-person" },
  { id: 5, nome: "Dia do Soldado", data: "2026-08-25", tipo: "lembrete", icone: "fa-flag" },
  { id: 6, nome: "Dia do Pastor", data: "2026-10-11", tipo: "importante", icone: "fa-cross" },
  { id: 7, nome: "Dia das Crianças", data: "2026-10-12", tipo: "importante", icone: "fa-child" },
  { id: 8, nome: "Dia do Professor", data: "2026-10-15", tipo: "lembrete", icone: "fa-chalkboard-user" },
  { id: 9, nome: "Dia de Ação de Graças", data: "2026-11-26", tipo: "lembrete", icone: "fa-hands-praying" },
  { id: 10, nome: "Natal", data: "2026-12-25", tipo: "importante", icone: "fa-tree" },
  { id: 11, nome: "Dia da Amizade (virada do ano)", data: "2026-12-31", tipo: "lembrete", icone: "fa-champagne-glasses" },
];

function getEventos() {
  return lerLista(CHAVE_EVENTOS, EVENTOS_INICIAIS);
}

function addEvento(evento) {
  const eventos = getEventos();
  evento.id = Date.now();
  eventos.push(evento);
  salvarLista(CHAVE_EVENTOS, eventos);
  return evento;
}

function excluirEvento(id) {
  const eventos = getEventos().filter(e => e.id !== id);
  salvarLista(CHAVE_EVENTOS, eventos);
}

function buscarEvento(id) {
  return getEventos().find(e => e.id === Number(id)) || null;
}

function editarEvento(id, dadosNovos) {
  const eventos = getEventos();
  const indice = eventos.findIndex(e => e.id === Number(id));

  if (indice === -1) return null;

  dadosNovos.id = Number(id); // garante que o id não muda
  eventos[indice] = dadosNovos;
  salvarLista(CHAVE_EVENTOS, eventos);
  return dadosNovos;
}

// ----- Perfil do administrador (nome, cargo, foto) -----
const CHAVE_PERFIL_ADMIN = "sistema_igreja_perfil_admin";

function getPerfilAdmin() {
  const dados = localStorage.getItem(CHAVE_PERFIL_ADMIN);
  return dados ? JSON.parse(dados) : null;
}

function salvarPerfilAdmin(perfil) {
  localStorage.setItem(CHAVE_PERFIL_ADMIN, JSON.stringify(perfil));
}

// ----- Configurações da igreja (nome, logo) -----
const CHAVE_CONFIG_IGREJA = "sistema_igreja_config";

function getConfigIgreja() {
  const dados = localStorage.getItem(CHAVE_CONFIG_IGREJA);
  return dados ? JSON.parse(dados) : null;
}

function salvarConfigIgreja(config) {
  localStorage.setItem(CHAVE_CONFIG_IGREJA, JSON.stringify(config));
}

// ----- Ministérios (nome, líder, ícone — quem participa vem do cadastro de Membro) -----
const CHAVE_MINISTERIOS = "sistema_igreja_ministerios";

const MINISTERIOS_INICIAIS = [
  { id: 1, nome: "Louvor", lider: "Ana Paula", icone: "fa-music" },
  { id: 2, nome: "Infantil", lider: "Fernanda Lima", icone: "fa-child-reaching" },
  { id: 3, nome: "Jovens", lider: "Pedro Henrique", icone: "fa-people-group" },
  { id: 4, nome: "Diaconato", lider: "José Carlos", icone: "fa-hands-holding-child" },
  { id: 5, nome: "Ação Social", lider: "Rosana Alves", icone: "fa-utensils" },
  { id: 6, nome: "Ensino / EBD", lider: "Marcos Vinícius", icone: "fa-book-bible" },
];

function getMinisterios() {
  return lerLista(CHAVE_MINISTERIOS, MINISTERIOS_INICIAIS);
}

function addMinisterio(ministerio) {
  const ministerios = getMinisterios();
  ministerio.id = Date.now();
  ministerios.push(ministerio);
  salvarLista(CHAVE_MINISTERIOS, ministerios);
  return ministerio;
}

function excluirMinisterio(id) {
  const ministerios = getMinisterios().filter(m => m.id !== id);
  salvarLista(CHAVE_MINISTERIOS, ministerios);
}

function buscarMinisterio(id) {
  return getMinisterios().find(m => m.id === Number(id)) || null;
}

function editarMinisterio(id, dadosNovos) {
  const ministerios = getMinisterios();
  const indice = ministerios.findIndex(m => m.id === Number(id));

  if (indice === -1) return null;

  dadosNovos.id = Number(id);
  ministerios[indice] = dadosNovos;
  salvarLista(CHAVE_MINISTERIOS, ministerios);
  return dadosNovos;
}