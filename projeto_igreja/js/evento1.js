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

  // ----- Destaque: o próximo evento "importante" -----
  const proximoImportante = futuros.find(e => e.tipo === "importante");
  const destaque = document.getElementById("destaque-evento");

  if (proximoImportante) {
    destaque.innerHTML = `
      <div class="destaque-conteudo">
        <span class="destaque-eyebrow">Próximo evento importante</span>
        <div class="destaque-corpo">
          <i class="fa-solid ${proximoImportante.icone}"></i>
          <div>
            <h2>${proximoImportante.nome}</h2>
            <p>Faltam <strong>${proximoImportante.dias}</strong> dia(s) — dia ${formatarData(proximoImportante.data)}</p>
          </div>
        </div>
        <p class="destaque-aviso">
          <i class="fa-solid fa-triangle-exclamation"></i>
          Data que costuma pedir preparação com antecedência (ensaio, teatro, decoração, almoço).
        </p>
      </div>
    `;
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
    `;

    grid.appendChild(card);
  });

  if (futuros.length === 0) {
    grid.innerHTML = "<p>Nenhuma data futura cadastrada este ano.</p>";
  }
}

document.addEventListener("DOMContentLoaded", montarPagina);