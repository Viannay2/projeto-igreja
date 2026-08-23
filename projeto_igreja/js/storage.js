// ===============================
// storage.js
// "Banco de dados temporário" usando o localStorage do navegador.
// Serve só pra testar o fluxo completo (cadastrar → aparecer na lista)
// antes de existir a API de verdade. No final do projeto, essas
// funções vão ser trocadas por chamadas fetch() pra API.
// ===============================

const CHAVE_MEMBROS = "sistema_igreja_membros";
const CHAVE_FAMILIAS = "sistema_igreja_familias";

// Dados iniciais — os mesmos que já apareciam fixos no HTML.
// Só são usados na PRIMEIRA vez que a página abre (localStorage vazio).
const MEMBROS_INICIAIS = [
  { id: 1, nome_completo: "João Silva", familia: "Silva", status: "ativo", telefone: "(21)99999-9999" },
  { id: 2, nome_completo: "Maria Sousa", familia: "Souza", status: "congregando", telefone: "(21)98888-8888" },
  { id: 3, nome_completo: "Carlos Oliveira", familia: "Oliveira", status: "afastado", telefone: "(21)97777-7777" },
];

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

// ----- Membros -----
function getMembros() {
  return lerLista(CHAVE_MEMBROS, MEMBROS_INICIAIS);
}

function addMembro(membro) {
  const membros = getMembros();
  membro.id = Date.now(); // id simples baseado no horário atual
  membros.push(membro);
  salvarLista(CHAVE_MEMBROS, membros);
  return membro;
}

function excluirMembro(id) {
  const membros = getMembros().filter(m => m.id !== id);
  salvarLista(CHAVE_MEMBROS, membros);
}

// ----- Famílias -----
const FAMILIAS_INICIAIS = [
  { id: 1, nome_familia: "Família Silva", responsavel: "João Silva" },
  { id: 2, nome_familia: "Família Souza", responsavel: "Maria Sousa" },
  { id: 3, nome_familia: "Família Oliveira", responsavel: "Carlos Oliveira" },
];

function getFamilias() {
  return lerLista(CHAVE_FAMILIAS, FAMILIAS_INICIAIS);
}

function addFamilia(familia) {
  const familias = getFamilias();
  familia.id = Date.now();
  familias.push(familia);
  salvarLista(CHAVE_FAMILIAS, familias);
  return familia;
}

function excluirFamilia(id) {
  const familias = getFamilias().filter(f => f.id !== id);
  salvarLista(CHAVE_FAMILIAS, familias);
}

// Conta quantos membros pertencem a uma família, olhando o campo
// "familia" de cada membro (que hoje é texto livre no formulário)
function contarMembrosDaFamilia(nomeFamilia) {
  const nomeSemPrefixo = nomeFamilia.replace(/^Família\s+/i, "").trim().toLowerCase();

  return getMembros().filter(m => {
    const familiaDoMembro = (m.familia || "").trim().toLowerCase();
    return familiaDoMembro === nomeFamilia.trim().toLowerCase()
        || familiaDoMembro === nomeSemPrefixo;
  }).length;
}

// ==========================================================
// ⚠️ AVISO DE SEGURANÇA — LER ANTES DE MEXER AQUI ⚠️
// As senhas abaixo são salvas SEM criptografia, só pra testar
// o fluxo de login visualmente. Isso NUNCA pode ir pra produção
// assim. Quando a API entrar, a senha precisa ser criptografada
// (hash com bcrypt) ANTES de ser salva — nunca salva "pelada".
// ==========================================================

const CHAVE_USUARIOS = "sistema_igreja_usuarios";
const CHAVE_USUARIO_LOGADO = "sistema_igreja_usuario_logado";

function getUsuarios() {
  return lerLista(CHAVE_USUARIOS, []);
}

function emailJaCadastrado(email) {
  return getUsuarios().some(u => u.email.toLowerCase() === email.toLowerCase());
}

function criarUsuario(usuario) {
  const usuarios = getUsuarios();
  usuario.id = Date.now();
  usuarios.push(usuario);
  salvarLista(CHAVE_USUARIOS, usuarios);
  return usuario;
}

// Retorna o usuário se o e-mail/senha baterem, ou null se não bater
function verificarLogin(email, senha) {
  const usuarios = getUsuarios();
  return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha) || null;
}

function salvarSessao(usuario) {
  localStorage.setItem(CHAVE_USUARIO_LOGADO, JSON.stringify({ nome: usuario.nome_completo, email: usuario.email }));
}

function getSessao() {
  const dados = localStorage.getItem(CHAVE_USUARIO_LOGADO);
  return dados ? JSON.parse(dados) : null;
}

function sair() {
  localStorage.removeItem(CHAVE_USUARIO_LOGADO);
}

// ----- Visitantes -----
const CHAVE_VISITANTES = "sistema_igreja_visitantes";

const VISITANTES_INICIAIS = [
  { id: 1, nome: "Renata Farias", data_visita: "2026-08-03", convidado_por: "Maria Sousa", status: "ativo" },
  { id: 2, nome: "Diego Martins", data_visita: "2026-07-27", convidado_por: "João Silva", status: "congregando" },
  { id: 3, nome: "Beatriz Nogueira", data_visita: "2026-07-20", convidado_por: "Carlos Oliveira", status: "afastado" },
];

function getVisitantes() {
  return lerLista(CHAVE_VISITANTES, VISITANTES_INICIAIS);
}

function addVisitante(visitante) {
  const visitantes = getVisitantes();
  visitante.id = Date.now();
  visitantes.push(visitante);
  salvarLista(CHAVE_VISITANTES, visitantes);
  return visitante;
}

function excluirVisitante(id) {
  const visitantes = getVisitantes().filter(v => v.id !== id);
  salvarLista(CHAVE_VISITANTES, visitantes);
}

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