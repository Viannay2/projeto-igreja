// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
    window.location.href = "login.html";
}


const corpoTabelaVisitantes = document.getElementById("tbody-visitantes");

const NOME_STATUS_VISITANTE = {
  primeira_vez: "Primeira vez",
  retorno: "Retorno",
};

const CLASSE_BADGE_VISITANTE = {
  primeira_vez: "badge-ativo",
  retorno: "badge-congregando",
};

function formatarDataVisita(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function desenharTabelaVisitantes() {
  const visitantes = await getVisitantes();
  corpoTabelaVisitantes.innerHTML = "";

  if (visitantes.length === 0) {
    corpoTabelaVisitantes.innerHTML = `<tr><td colspan="5">Nenhum visitante cadastrado ainda.</td></tr>`;
    return;
  }

  visitantes.forEach((visitante) => {
    const linha = document.createElement("tr");
    const nomeStatus = NOME_STATUS_VISITANTE[visitante.status] || visitante.status;

    linha.innerHTML = `
      <td>${visitante.nome}</td>
      <td>${formatarDataVisita(visitante.data_visita)}</td>
      <td>${visitante.convidado_por || "—"}</td>
      <td><span class="badge ${CLASSE_BADGE_VISITANTE[visitante.status] || "badge-ativo"}">${nomeStatus}</span></td>
      <td class="col-acoes">
        <a href="cadastrovisitante.html?id=${visitante.id}" class="icon-btn" aria-label="Editar ${visitante.nome}"><i class="fa-solid fa-pen"></i></a>
        <button class="icon-btn btn-excluir-visitante" data-id="${visitante.id}" aria-label="Excluir ${visitante.nome}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    corpoTabelaVisitantes.appendChild(linha);
  });

  document.querySelectorAll(".btn-excluir-visitante").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = Number(botao.dataset.id);

      if (confirm("Tem certeza que quer excluir esse visitante?")) {
        await excluirVisitante(id);
        desenharTabelaVisitantes();
      }
    });
  });
}

desenharTabelaVisitantes();