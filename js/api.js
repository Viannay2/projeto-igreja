// ===============================
// api.js
// Funções de Membros que falam com a API de verdade (FastAPI),
// em vez do localStorage. Troca direta do storage.js, só pras
// páginas de Membros por enquanto.
// ===============================

const URL_API = "http://localhost:8000/api/membros";

// Busca a lista de membros na API
async function getMembros() {
  try {
    const resposta = await fetch(URL_API);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro: " + resposta.status);
    }

    return await resposta.json();
  } catch (erro) {
    alert("Não consegui falar com a API. Ela está rodando? (uvicorn main:app --reload)");
    console.error(erro);
    return [];
  }
}

// Cadastra um novo membro na API
async function addMembro(membro) {
  const resposta = await fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(membro),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou o cadastro: " + resposta.status);
  }

  return await resposta.json();
}

// Busca um único membro pelo id (usado na tela de edição)
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(membro),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a edição: " + resposta.status);
  }

  return await resposta.json();
}

// ----- Visitantes -----
const URL_API_VISITANTES = "http://localhost:8000/api/visitantes";

async function getVisitantes() {
  try {
    const resposta = await fetch(URL_API_VISITANTES);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro: " + resposta.status);
    }

    return await resposta.json();
  } catch (erro) {
    alert("Não consegui falar com a API. Ela está rodando? (uvicorn main:app --reload)");
    console.error(erro);
    return [];
  }
}

async function addVisitante(visitante) {
  const resposta = await fetch(URL_API_VISITANTES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(visitante),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a edição: " + resposta.status);
  }

  return await resposta.json();
}

// ----- Chamada / presença -----
const URL_API_CHAMADA = "http://localhost:8000/api/chamada";
const URL_API_PRESENCAS = "http://localhost:8000/api/presencas";

// Salva a chamada de um dia + ministério (substitui se já existir pra esse dia)
async function salvarChamada(data, ministerio, registros) {
  const resposta = await fetch(URL_API_CHAMADA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, ministerio, registros }),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a chamada: " + resposta.status);
  }

  return await resposta.json();
}

// Busca TODAS as presenças já registradas (usado pra calcular ausência)
async function getPresencas() {
  const resposta = await fetch(URL_API_PRESENCAS);

  if (!resposta.ok) {
    throw new Error("Não consegui buscar as presenças: " + resposta.status);
  }

  return await resposta.json();
}

// Exclui um membro na API
async function excluirMembro(id) {
  const resposta = await fetch(`${URL_API}/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    throw new Error("A API não conseguiu excluir: " + resposta.status);
  }

  return await resposta.json();
}

// ----- Usuário / login -----
const URL_API_USUARIOS = "http://localhost:8000/api/usuarios";
const URL_API_LOGIN = "http://localhost:8000/api/login";

// Cadastra um novo usuário. Se o e-mail já existir, a API recusa —
// isso é tratado em cada tela que chama essa função.
async function criarUsuario(usuario) {
  const resposta = await fetch(URL_API_USUARIOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Não foi possível cadastrar");
  }

  return await resposta.json();
}

// Retorna os dados do usuário se o login der certo, ou null se der errado
async function verificarLogin(email, senha) {
  const resposta = await fetch(URL_API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!resposta.ok) {
    return null; // e-mail ou senha errados — a tela decide o que mostrar
  }

  return await resposta.json();
}

// ----- Usuários (lista geral) -----
const URL_API_USUARIOS_LISTA = "http://localhost:8000/api/usuarios";

async function listarUsuarios() {
  const resposta = await fetch(URL_API_USUARIOS_LISTA);

  if (!resposta.ok) {
    throw new Error("Não consegui buscar os usuários: " + resposta.status);
  }

  return await resposta.json();
}

// ----- Liderança (usuário ↔ ministério ↔ papel) -----
const URL_API_LIDERANCAS = "http://localhost:8000/api/liderancas";

async function getLiderancas() {
  const resposta = await fetch(URL_API_LIDERANCAS);

  if (!resposta.ok) {
    throw new Error("Não consegui buscar as lideranças: " + resposta.status);
  }

  return await resposta.json();
}

async function atribuirLideranca(dados) {
  const resposta = await fetch(URL_API_LIDERANCAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Não foi possível atribuir a liderança");
  }

  return await resposta.json();
}

async function removerLideranca(id) {
  const resposta = await fetch(`${URL_API_LIDERANCAS}/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    throw new Error("A API não conseguiu remover: " + resposta.status);
  }

  return await resposta.json();
}

// ----- Anotações do calendário -----
const URL_API_ANOTACOES = "http://localhost:8000/api/anotacoes";

async function getAnotacoes() {
  const resposta = await fetch(URL_API_ANOTACOES);

  if (!resposta.ok) {
    throw new Error("Não consegui buscar as anotações: " + resposta.status);
  }

  return await resposta.json();
}

async function criarAnotacao(dados) {
  const resposta = await fetch(URL_API_ANOTACOES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    throw new Error("A API não aceitou a anotação: " + resposta.status);
  }

  return await resposta.json();
}

async function excluirAnotacao(id) {
  const resposta = await fetch(`${URL_API_ANOTACOES}/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    throw new Error("A API não conseguiu excluir: " + resposta.status);
  }

  return await resposta.json();
}