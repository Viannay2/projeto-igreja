// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}






// ===== Calcula quantos dias faltam pra uma data =====
function diasRestantes(dataString) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const alvo = new Date(dataString + "T00:00:00");

  const diffMs = alvo - hoje;
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDias;
}

// ===== Formata a data no padrão brasileiro =====
function formatarData(dataString) {
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}`;
}

function montarPagina() {
  const eventos = getEventos();

  // Separa eventos futuros dos que já passaram, e ordena por proximidade
  const futuros = eventos
    .map(e => ({ ...e, dias: diasRestantes(e.data) }))
    .filter(e => e.dias >= 0)
    .sort((a, b) => a.dias - b.dias);

  // ----- Destaque: TODOS os eventos importantes que estão chegando -----
  const importantes = futuros.filter(e => e.tipo === "importante");
  const destaque = document.getElementById("destaque-evento");

  if (importantes.length > 0) {
    destaque.innerHTML = importantes.map(evento => `
      <div class="destaque-conteudo">
        <span class="destaque-eyebrow">Evento importante</span>
        <div class="destaque-corpo">
          <i class="fa-solid ${evento.icone}"></i>
          <div>
            <h2>${evento.nome}</h2>
            <p>Faltam <strong>${evento.dias}</strong> dia(s) — dia ${formatarData(evento.data)}</p>
          </div>
        </div>
        <p class="destaque-aviso">
          <i class="fa-solid fa-triangle-exclamation"></i>
          Data que costuma pedir preparação com antecedência (ensaio, teatro, decoração, almoço).
        </p>
      </div>
    `).join("");
  } else {
    destaque.innerHTML = `<p>Nenhum evento importante cadastrado no momento.</p>`;
  }

  // ----- Grid: todos os eventos futuros -----
  const grid = document.getElementById("grid-eventos");
  grid.innerHTML = "";

  futuros.forEach(evento => {
    const card = document.createElement("div");
    card.className = "card-evento" + (evento.tipo === "importante" ? " card-evento-importante" : "");

    let textoDias;
    if (evento.dias === 0) {
      textoDias = "É hoje!";
    } else if (evento.dias === 1) {
      textoDias = "Amanhã";
    } else {
      textoDias = `Em ${evento.dias} dias`;
    }

    card.innerHTML = `
      <i class="fa-solid ${evento.icone}"></i>
      <h3>${evento.nome}</h3>
      <p class="data-card">${formatarData(evento.data)}</p>
      <p class="contagem-card">${textoDias}</p>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <a href="cadastro-evento.html?id=${evento.id}" class="icon-btn" aria-label="Editar ${evento.nome}"><i class="fa-solid fa-pen"></i></a>
        <button type="button" class="icon-btn btn-excluir-evento" data-id="${evento.id}" aria-label="Excluir ${evento.nome}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    grid.appendChild(card);
  });

  document.querySelectorAll(".btn-excluir-evento").forEach(botao => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);
      if (confirm("Tem certeza que quer excluir esse evento?")) {
        excluirEvento(id);
        montarPagina();
      }
    });
  });

  if (futuros.length === 0) {
    grid.innerHTML = "<p>Nenhuma data futura cadastrada este ano.</p>";
  }
}

document.addEventListener("DOMContentLoaded", montarPagina);