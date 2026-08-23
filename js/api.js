// ===============================
// api.js
// Funções que falam com a API FastAPI
// ===============================

// Endereço da API online no Render
const API_URL = "https://sistema-igreja-api-w30h.onrender.com";


// ======================================================
// MEMBROS
// ======================================================

const URL_API = `${API_URL}/api/membros`;

// Busca a lista de membros na API
async function getMembros() {
  try {
    const resposta = await fetch(URL_API);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro: " + resposta.status);
    }

    return await resposta.json();

  } catch (erro) {
    alert("Não consegui falar com a API.");
    console.error(erro);
    return [];
  }
}

// Cadastra um novo membro na API
async function addMembro(membro) {
  const resposta = await fetch(URL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(membro),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou o cadastro: " + resposta.status);
  }

  return await resposta.json();
}

// Busca um único membro pelo ID
async function buscarMembro(id) {
  const resposta = await fetch(`${URL_API}/${id}`);

  if (!resposta.ok) {
    throw new Error("Membro não encontrado: " + resposta.status);
  }

  return await resposta.json();
}

// Atualiza um membro existente
async function editarMembro(id, membro) {
  const resposta = await fetch(`${URL_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(membro),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a edição: " + resposta.status);
  }

  return await resposta.json();
}

// Exclui um membro
async function excluirMembro(id) {
  const resposta = await fetch(`${URL_API}/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    throw new Error("A API não conseguiu excluir: " + resposta.status);
  }

  return await resposta.json();
}


// ======================================================
// VISITANTES
// ======================================================

const URL_API_VISITANTES = `${API_URL}/api/visitantes`;

async function getVisitantes() {
  try {
    const resposta = await fetch(URL_API_VISITANTES);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro: " + resposta.status);
    }

    return await resposta.json();

  } catch (erro) {
    alert("Não consegui falar com a API.");
    console.error(erro);
    return [];
  }
}

async function addVisitante(visitante) {
  const resposta = await fetch(URL_API_VISITANTES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(visitante),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou o cadastro: " + resposta.status);
  }

  return await resposta.json();
}

async function excluirVisitante(id) {
  const resposta = await fetch(`${URL_API_VISITANTES}/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    throw new Error("A API não conseguiu excluir: " + resposta.status);
  }

  return await resposta.json();
}

async function buscarVisitante(id) {
  const resposta = await fetch(`${URL_API_VISITANTES}/${id}`);

  if (!resposta.ok) {
    throw new Error("Visitante não encontrado: " + resposta.status);
  }

  return await resposta.json();
}

async function editarVisitante(id, visitante) {
  const resposta = await fetch(`${URL_API_VISITANTES}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(visitante),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a edição: " + resposta.status);
  }

  return await resposta.json();
}


// ======================================================
// CHAMADA / PRESENÇAS
// ======================================================

const URL_API_CHAMADA = `${API_URL}/api/chamada`;
const URL_API_PRESENCAS = `${API_URL}/api/presencas`;

// Salva a chamada de um dia + ministério
async function salvarChamada(data, ministerio, registros) {
  const resposta = await fetch(URL_API_CHAMADA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data,
      ministerio,
      registros
    }),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a chamada: " + resposta.status);
  }

  return await resposta.json();
}

// Busca todas as presenças
async function getPresencas() {
  const resposta = await fetch(URL_API_PRESENCAS);

  if (!resposta.ok) {
    throw new Error(
      "Não consegui buscar as presenças: " + resposta.status
    );
  }

  return await resposta.json();
}


// ======================================================
// USUÁRIOS / LOGIN
// ======================================================

const URL_API_USUARIOS = `${API_URL}/api/usuarios`;
const URL_API_LOGIN = `${API_URL}/api/login`;

// Cadastra um novo usuário
async function criarUsuario(usuario) {
  const resposta = await fetch(URL_API_USUARIOS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(usuario),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(
      erro.detail || "Não foi possível cadastrar"
    );
  }

  return await resposta.json();
}

// Verifica login
async function verificarLogin(email, senha) {
  const resposta = await fetch(URL_API_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      senha
    }),
  });

  if (!resposta.ok) {
    return null;
  }

  return await resposta.json();
}


// ======================================================
// USUÁRIOS — LISTA GERAL
// ======================================================

const URL_API_USUARIOS_LISTA = `${API_URL}/api/usuarios`;

async function listarUsuarios() {
  const resposta = await fetch(URL_API_USUARIOS_LISTA);

  if (!resposta.ok) {
    throw new Error(
      "Não consegui buscar os usuários: " + resposta.status
    );
  }

  return await resposta.json();
}


// ======================================================
// LIDERANÇAS
// ======================================================

const URL_API_LIDERANCAS = `${API_URL}/api/liderancas`;

async function getLiderancas() {
  const resposta = await fetch(URL_API_LIDERANCAS);

  if (!resposta.ok) {
    throw new Error(
      "Não consegui buscar as lideranças: " + resposta.status
    );
  }

  return await resposta.json();
}

async function atribuirLideranca(dados) {
  const resposta = await fetch(URL_API_LIDERANCAS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();

    throw new Error(
      erro.detail || "Não foi possível atribuir a liderança"
    );
  }

  return await resposta.json();
}

async function removerLideranca(id) {
  const resposta = await fetch(
    `${URL_API_LIDERANCAS}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!resposta.ok) {
    throw new Error(
      "A API não conseguiu remover: " + resposta.status
    );
  }

  return await resposta.json();
}


// ======================================================
// ANOTAÇÕES DO CALENDÁRIO
// ======================================================

const URL_API_ANOTACOES = `${API_URL}/api/anotacoes`;

async function getAnotacoes() {
  const resposta = await fetch(URL_API_ANOTACOES);

  if (!resposta.ok) {
    throw new Error(
      "Não consegui buscar as anotações: " + resposta.status
    );
  }

  return await resposta.json();
}

async function criarAnotacao(dados) {
  const resposta = await fetch(URL_API_ANOTACOES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    throw new Error(
      "A API não aceitou a anotação: " + resposta.status
    );
  }

  return await resposta.json();
}

async function excluirAnotacao(id) {
  const resposta = await fetch(
    `${URL_API_ANOTACOES}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!resposta.ok) {
    throw new Error(
      "A API não conseguiu excluir: " + resposta.status
    );
  }

  return await resposta.json();
}