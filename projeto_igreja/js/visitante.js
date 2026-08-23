const corpoTabelaVisitantes = document.getElementById("tbody-visitantes");

const NOME_STATUS_VISITANTE = {
  ativo: "Retornou",
  congregando: "Acompanhando",
  afastado: "Não retornou",
};

function formatarDataVisita(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function desenharTabelaVisitantes() {
  const visitantes = getVisitantes();
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
      <td><span class="badge badge-${visitante.status}">${nomeStatus}</span></td>
      <td class="col-acoes">
        <button class="icon-btn" aria-label="Converter ${visitante.nome} em membro"><i class="fa-solid fa-user-plus"></i></button>
        <button class="icon-btn" aria-label="Editar ${visitante.nome}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn btn-excluir-visitante" data-id="${visitante.id}" aria-label="Excluir ${visitante.nome}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    corpoTabelaVisitantes.appendChild(linha);
  });

  document.querySelectorAll(".btn-excluir-visitante").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);

      if (confirm("Tem certeza que quer excluir esse visitante?")) {
        excluirVisitante(id);
        desenharTabelaVisitantes();
      }
    });
  });
}

desenharTabelaVisitantes();