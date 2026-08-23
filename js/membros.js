const corpoTabela = document.getElementById("tbody-membros");
const campoPesquisa = document.getElementById("campo-pesquisa");
const filtroStatus = document.getElementById("filtro-status");

const CLASSE_BADGE = {
  ativo: "badge-ativo",
  desligado: "badge-desligado",
};

const TEXTO_STATUS = {
  ativo: "Ativo",
  desligado: "Desligado",
};

// Guarda a lista completa que veio da API, pra pesquisa/filtro não
// precisarem buscar de novo na API a cada mudança.
let todosOsMembros = [];

function renderizarLinhas(membros) {
  corpoTabela.innerHTML = "";

  if (membros.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="3">Nenhum membro encontrado.</td></tr>`;
    return;
  }

  membros.forEach((membro) => {
    const linha = document.createElement("tr");

    const classeBadge = CLASSE_BADGE[membro.status] || "badge-ativo";
    const textoStatus = TEXTO_STATUS[membro.status] || membro.status;

    linha.className = "linha-clicavel";
    linha.dataset.id = membro.id;

    linha.innerHTML = `
      <td>${membro.nome_completo}</td>
      <td><span class="badge ${classeBadge}">${textoStatus}</span></td>
      <td class="col-acoes">
        <a href="cadastro.html?id=${membro.id}" class="icon-btn" aria-label="Editar ${membro.nome_completo}"><i class="fa-solid fa-pen"></i></a>
        <button class="icon-btn btn-excluir" data-id="${membro.id}" aria-label="Excluir ${membro.nome_completo}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    corpoTabela.appendChild(linha);
  });

  // Clicar em qualquer lugar da linha (menos nos botões) abre a ficha completa
  document.querySelectorAll(".linha-clicavel").forEach((linha) => {
    linha.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return; // não interfere nos botões de ação
      window.location.href = `cadastro.html?id=${linha.dataset.id}`;
    });
  });

  // Liga o clique de cada botão de excluir recém-criado
  document.querySelectorAll(".btn-excluir").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = Number(botao.dataset.id);

      if (confirm("Tem certeza que quer excluir esse membro?")) {
        await excluirMembro(id);
        await desenharTabela(); // busca de novo na API e redesenha
      }
    });
  });
}

// Aplica busca por nome + filtro de status juntos, sobre a lista completa
function aplicarFiltros() {
  const termo = campoPesquisa.value.trim().toLowerCase();
  const status = filtroStatus.value;

  let filtrados = todosOsMembros;

  if (termo) {
    filtrados = filtrados.filter((m) => m.nome_completo.toLowerCase().includes(termo));
  }

  if (status && status !== "todos") {
    filtrados = filtrados.filter((m) => m.status === status);
  }

  renderizarLinhas(filtrados);
}

async function desenharTabela() {
  todosOsMembros = await getMembros();

  const parametros = new URLSearchParams(window.location.search);
  const termoDaUrl = parametros.get("busca");
  const filtroDaUrl = parametros.get("filtro");

  if (termoDaUrl) {
    // Veio da busca do dashboard (?busca=nome)
    campoPesquisa.value = termoDaUrl;
    aplicarFiltros();
  } else if (filtroDaUrl === "nao_batizados") {
    renderizarLinhas(todosOsMembros.filter((membro) => !membro.data_batismo));
  } else if (filtroDaUrl === "aniversariantes") {
    const mesAtual = new Date().getMonth();
    renderizarLinhas(todosOsMembros.filter((membro) => {
      if (!membro.data_nascimento) return false;
      const mesNascimento = Number(membro.data_nascimento.split("-")[1]) - 1;
      return mesNascimento === mesAtual;
    }));
  } else {
    renderizarLinhas(todosOsMembros);
  }
}

// ----- Pesquisa por nome e filtro de status, juntos -----
campoPesquisa.addEventListener("input", aplicarFiltros);
filtroStatus.addEventListener("change", aplicarFiltros);

desenharTabela();