const corpoTabelaFamilias = document.getElementById("tbody-familias");

async function desenharTabelaFamilias() {
  const familias = getFamilias();
  corpoTabelaFamilias.innerHTML = "";

  if (familias.length === 0) {
    corpoTabelaFamilias.innerHTML = `<tr><td colspan="4">Nenhuma família cadastrada ainda.</td></tr>`;
    return;
  }

  for (const familia of familias) {
    const linha = document.createElement("tr");
    const totalMembros = await contarMembrosDaFamilia(familia.nome_familia);
    const textoMembros = totalMembros === 1 ? "1 membro" : `${totalMembros} membros`;

    linha.innerHTML = `
      <td>${familia.nome_familia}</td>
      <td>${familia.responsavel || "—"}</td>
      <td>${textoMembros}</td>
      <td class="col-acoes">
        <button class="icon-btn" aria-label="Ver membros de ${familia.nome_familia}"><i class="fa-solid fa-eye"></i></button>
        <button class="icon-btn" aria-label="Editar ${familia.nome_familia}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn btn-excluir-familia" data-id="${familia.id}" aria-label="Excluir ${familia.nome_familia}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    corpoTabelaFamilias.appendChild(linha);
  }

  document.querySelectorAll(".btn-excluir-familia").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);

      if (confirm("Tem certeza que quer excluir essa família?")) {
        excluirFamilia(id);
        desenharTabelaFamilias();
      }
    });
  });
}

desenharTabelaFamilias();