// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}



const gridMinisterios = document.getElementById("grid-ministerios");

async function montarMinisterios() {
  const ministerios = getMinisterios(); // storage.js (localStorage)
  const membros = await getMembros();   // api.js (API de verdade)

  gridMinisterios.innerHTML = "";

  if (ministerios.length === 0) {
    gridMinisterios.innerHTML = `<p>Nenhum ministério cadastrado ainda.</p>`;
    return;
  }

  ministerios.forEach(ministerio => {
    const totalIntegrantes = membros.filter(m =>
      (m.ministerios || []).includes(ministerio.nome)
    ).length;

    const textoIntegrantes = totalIntegrantes === 1 ? "1 integrante" : `${totalIntegrantes} integrantes`;

    const card = document.createElement("div");
    card.className = "card-evento";
    card.innerHTML = `
      <i class="fa-solid ${ministerio.icone}"></i>
      <h3>${ministerio.nome}</h3>
      <p class="data-card">${ministerio.lider ? "Líder: " + ministerio.lider : "Sem líder definido"}</p>
      <p class="contagem-card">${textoIntegrantes}</p>
      <div style="display:flex; gap:8px; margin-top:8px; justify-content:center;">
        <a href="chamada.html?ministerio=${encodeURIComponent(ministerio.nome)}" class="icon-btn" aria-label="Fazer chamada de ${ministerio.nome}"><i class="fa-solid fa-clipboard-check"></i></a>
        <a href="cadastro-ministerio.html?id=${ministerio.id}" class="icon-btn" aria-label="Editar ${ministerio.nome}"><i class="fa-solid fa-pen"></i></a>
        <button type="button" class="icon-btn btn-excluir-ministerio" data-id="${ministerio.id}" data-nome="${ministerio.nome}" data-total="${totalIntegrantes}" aria-label="Excluir ${ministerio.nome}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    gridMinisterios.appendChild(card);
  });

  document.querySelectorAll(".btn-excluir-ministerio").forEach(botao => {
    botao.addEventListener("click", () => {
      const total = Number(botao.dataset.total);
      const nome = botao.dataset.nome;

      let mensagem = `Tem certeza que quer excluir o ministério "${nome}"?`;
      if (total > 0) {
        mensagem += `\n\nAtenção: ${total} membro(s) estão marcados nesse ministério. Excluir o ministério NÃO remove eles automaticamente da lista de ministérios deles — só o ministério some da lista geral.`;
      }

      if (confirm(mensagem)) {
        excluirMinisterio(Number(botao.dataset.id));
        montarMinisterios();
      }
    });
  });
}

montarMinisterios();