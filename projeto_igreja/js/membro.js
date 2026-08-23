
const corpoTabela = document.getElementById("tbody-membros");

const CLASSE_BADGE = {
  ativo: "badge-ativo",
  congregando: "badge-congregando",
  afastado: "badge-afastado",
};

const TEXTO_STATUS = {
  ativo: "Ativo",
  congregando: "Congregando",
  afastado: "Afastado",
};

function desenharTabela() {
  const membros = getMembros();
  corpoTabela.innerHTML = "";

  if (membros.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="5">Nenhum membro cadastrado ainda.</td></tr>`;
    return;
  }

  membros.forEach((membro) => {
    const linha = document.createElement("tr");

    const classeBadge = CLASSE_BADGE[membro.status] || "badge-ativo";
    const textoStatus = TEXTO_STATUS[membro.status] || membro.status;

    linha.innerHTML = `
      <td>${membro.nome_completo}</td>
      <td>${membro.familia || "—"}</td>
      <td><span class="badge ${classeBadge}">${textoStatus}</span></td>
      <td>${membro.telefone || "—"}</td>
      <td class="col-acoes">
        <button class="icon-btn" aria-label="Editar ${membro.nome_completo}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn btn-excluir" data-id="${membro.id}" aria-label="Excluir ${membro.nome_completo}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    corpoTabela.appendChild(linha);
  });

  // Liga o clique de cada botão de excluir recém-criado
  document.querySelectorAll(".btn-excluir").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);

      if (confirm("Tem certeza que quer excluir esse membro?")) {
        excluirMembro(id);
        desenharTabela(); // redesenha a tabela sem o membro excluído
      }
    });
  });
}

desenharTabela();

