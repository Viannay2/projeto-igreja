// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}



const parametros = new URLSearchParams(window.location.search);
const nomeMinisterio = parametros.get("ministerio");

const tituloChamada = document.getElementById("titulo-chamada");
const campoData = document.getElementById("campo-data");
const listaChamada = document.getElementById("lista-chamada");
const botaoSalvar = document.getElementById("btn-salvar-chamada");
const statusMsg = document.getElementById("status-msg");

// Guarda o estado de cada pessoa: { tipo: "presente" | "faltou" | "justificada", motivo: "" }
const estadoPresenca = {};

// Data de hoje, no formato que o <input type="date"> espera (AAAA-MM-DD)
function dataDeHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

campoData.value = dataDeHoje();
tituloChamada.textContent = `Chamada — ${nomeMinisterio || "Ministério"}`;

function redesenharLista(membrosDoMinisterio) {
  listaChamada.innerHTML = "";

  if (membrosDoMinisterio.length === 0) {
    listaChamada.innerHTML = `<p>Nenhum membro pra chamar aqui.</p>`;
    return;
  }

  membrosDoMinisterio.forEach(membro => {
    const linha = document.createElement("div");
    linha.className = "linha-chamada";

    const estadoAtual = estadoPresenca[membro.id]; // { tipo, motivo } ou undefined
    const tipo = estadoAtual?.tipo;

    linha.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <span class="nome-chamada">${membro.nome_completo}</span>
        <div class="botoes-presenca">
          <button type="button" data-id="${membro.id}" data-valor="presente"
            class="${tipo === "presente" ? "selecionado-presente" : ""}">Presente</button>
          <button type="button" data-id="${membro.id}" data-valor="faltou"
            class="${tipo === "faltou" ? "selecionado-faltou" : ""}">Faltou</button>
          <button type="button" data-id="${membro.id}" data-valor="justificada"
            class="${tipo === "justificada" ? "selecionado-faltou" : ""}" style="${tipo === "justificada" ? "border-color:#f2c200; background:#fff8e1; color:#a37c00;" : ""}">Falta justificada</button>
        </div>
      </div>
      ${tipo === "justificada" ? `
        <input type="text" class="campo-motivo-falta" data-id="${membro.id}"
          placeholder="Motivo da falta (ex: estava doente)"
          value="${estadoAtual.motivo || ""}"
          style="width:100%; margin-top:8px; padding:8px; border-radius:8px; border:1px solid var(--linha, #ddd);">
      ` : ""}
    `;

    listaChamada.appendChild(linha);
  });

  // Liga o clique de cada botão presente/faltou/justificada
  listaChamada.querySelectorAll(".botoes-presenca button").forEach(botao => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);
      const valor = botao.dataset.valor;
      estadoPresenca[id] = { tipo: valor, motivo: estadoPresenca[id]?.motivo || "" };
      redesenharLista(membrosDoMinisterio); // redesenha pra atualizar o visual marcado
    });
  });

  // Liga a digitação do motivo (sem redesenhar a lista toda, senão perde o foco do campo)
  listaChamada.querySelectorAll(".campo-motivo-falta").forEach(campo => {
    campo.addEventListener("input", () => {
      const id = Number(campo.dataset.id);
      if (estadoPresenca[id]) estadoPresenca[id].motivo = campo.value;
    });
  });
}

async function iniciarChamada() {
  if (!nomeMinisterio) {
    listaChamada.innerHTML = `<p>Nenhum ministério informado. Volte e clique em "Fazer chamada" de novo.</p>`;
    botaoSalvar.hidden = true;
    return;
  }

  const membros = await getMembros();

  // "Culto" é a chamada geral — mas só de quem NÃO está em nenhum
  // ministério. Quem já tem ministério, a responsabilidade de marcar
  // presença (tanto culto quanto ensaio) é do líder daquele grupo,
  // não da chamada geral da secretaria.
  const ehChamadaGeral = nomeMinisterio === "Culto";
  const membrosDoMinisterio = ehChamadaGeral
    ? membros.filter(m => m.status === "ativo" && (m.ministerios || []).length === 0)
    : membros.filter(m => (m.ministerios || []).includes(nomeMinisterio));

  if (ehChamadaGeral) {
    tituloChamada.textContent = "Chamada — Culto (quem não tem ministério)";
  }

  redesenharLista(membrosDoMinisterio);

  botaoSalvar.addEventListener("click", async () => {
    const registros = membrosDoMinisterio
      .filter(m => estadoPresenca[m.id] !== undefined) // só quem foi marcado
      .map(m => {
        const estado = estadoPresenca[m.id];
        return {
          membro_id: m.id,
          membro_nome: m.nome_completo,
          presente: estado.tipo === "presente",
          falta_justificada: estado.tipo === "justificada",
          motivo_falta: estado.tipo === "justificada" ? (estado.motivo || null) : null,
        };
      });

    if (registros.length === 0) {
      statusMsg.textContent = "Marca pelo menos uma pessoa antes de salvar.";
      statusMsg.className = "show err";
      return;
    }

    await salvarChamada(campoData.value, nomeMinisterio, registros);

    statusMsg.textContent = "Chamada salva!";
    statusMsg.className = "show ok";
  });
}

iniciarChamada();