// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}


// ======================================================
// CALENDÁRIO
// ======================================================

const campoData = document.getElementById("campo-data-calendario");
const cardsResumo = document.getElementById("cards-resumo-dia");
const detalheDia = document.getElementById("detalhe-dia");

let dadosDoDiaAtual = null; // guarda tudo que foi calculado, pra trocar de categoria sem buscar de novo
let categoriaSelecionada = "presencas";

function dataDeHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

campoData.value = dataDeHoje();

// ----- Busca e organiza tudo que aconteceu no dia escolhido -----
async function buscarDadosDoDia() {
  const dataEscolhida = campoData.value;

  const [membros, visitantes, presencas, anotacoes] = await Promise.all([
    getMembros(),
    getVisitantes(),
    getPresencas(),
    getAnotacoes(),
  ]);
  const eventos = getEventos(); // localStorage, não precisa await

  const [, mesEscolhido, diaEscolhido] = dataEscolhida.split("-");

  const presencasDoDia = presencas.filter(p => p.data === dataEscolhida);

  const aniversariantesDoDia = membros.filter(m => {
    if (!m.data_nascimento) return false;
    const [, mesNasc, diaNasc] = m.data_nascimento.split("-");
    return mesNasc === mesEscolhido && diaNasc === diaEscolhido;
  });

  const visitantesDoDia = visitantes.filter(v => v.data_visita === dataEscolhida);
  const cadastradosDoDia = membros.filter(m => m.data_cadastro === dataEscolhida);
  const eventosDoDia = eventos.filter(e => e.data === dataEscolhida);
  const anotacoesDoDia = anotacoes.filter(a => a.data === dataEscolhida);

  return { dataEscolhida, presencasDoDia, aniversariantesDoDia, visitantesDoDia, cadastradosDoDia, eventosDoDia, anotacoesDoDia };
}

// ----- Desenha os cards de resumo (igual estilo do dashboard) -----
function desenharCards() {
  const d = dadosDoDiaAtual;

  const categorias = [
    { chave: "presencas", icone: "fa-clipboard-check", label: "Presenças", total: d.presencasDoDia.length },
    { chave: "aniversariantes", icone: "fa-cake-candles", label: "Aniversariantes", total: d.aniversariantesDoDia.length },
    { chave: "visitantes", icone: "fa-user-plus", label: "Visitantes", total: d.visitantesDoDia.length },
    { chave: "cadastros", icone: "fa-user-check", label: "Cadastros", total: d.cadastradosDoDia.length },
    { chave: "eventos", icone: "fa-calendar-days", label: "Eventos", total: d.eventosDoDia.length },
    { chave: "anotacoes", icone: "fa-note-sticky", label: "Anotações", total: d.anotacoesDoDia.length },
  ];

  cardsResumo.innerHTML = categorias.map(c => `
    <div class="card card-calendario ${categoriaSelecionada === c.chave ? "selecionado" : ""}" data-categoria="${c.chave}">
      <i class="fa-solid ${c.icone}"></i>
      <h2>${c.total}</h2>
      <p>${c.label}</p>
    </div>
  `).join("");

  cardsResumo.querySelectorAll(".card-calendario").forEach(card => {
    card.addEventListener("click", () => {
      categoriaSelecionada = card.dataset.categoria;
      desenharCards(); // redesenha só pra atualizar o destaque do selecionado
      desenharDetalhe();
    });
  });
}

// ----- Desenha o detalhe da categoria selecionada -----
function desenharDetalhe() {
  const d = dadosDoDiaAtual;
  let html = "";

  if (categoriaSelecionada === "presencas") {
    html += `<h2><i class="fa-solid fa-clipboard-check"></i> Presenças registradas</h2>`;
    if (d.presencasDoDia.length === 0) {
      html += `<p class="dica-campo">Nenhuma chamada feita nesse dia.</p>`;
    } else {
      const porMinisterio = {};
      d.presencasDoDia.forEach(p => {
        if (!porMinisterio[p.ministerio]) porMinisterio[p.ministerio] = [];
        porMinisterio[p.ministerio].push(p);
      });

      for (const ministerio in porMinisterio) {
        const registros = porMinisterio[ministerio];
        const presentes = registros.filter(r => r.presente);
        const justificadas = registros.filter(r => !r.presente && r.falta_justificada);
        const faltantes = registros.filter(r => !r.presente && !r.falta_justificada);
        html += `<h3 style="margin-top:16px;">${ministerio} — ${presentes.length} presente(s), ${faltantes.length} falta(s), ${justificadas.length} justificada(s)</h3><ul style="margin-top:8px;">`;
        registros.forEach(r => {
          let icone = "❌";
          let extra = "";
          if (r.presente) {
            icone = "✅";
          } else if (r.falta_justificada) {
            icone = "⚠️";
            extra = ` <span style="color:#999; font-size:12px;">— ${r.motivo_falta || "sem motivo informado"}</span>`;
          }
          html += `<li style="padding:4px 0;">${icone} ${r.membro_nome}${extra}</li>`;
        });
        html += `</ul>`;
      }
    }
  }

  if (categoriaSelecionada === "aniversariantes") {
    html += `<h2><i class="fa-solid fa-cake-candles"></i> Aniversariantes do dia</h2>`;
    html += d.aniversariantesDoDia.length === 0
      ? `<p class="dica-campo">Ninguém faz aniversário nesse dia.</p>`
      : `<ul style="margin-top:10px;">${d.aniversariantesDoDia.map(m => `<li style="padding:4px 0;">🎂 ${m.nome_completo}</li>`).join("")}</ul>`;
  }

  if (categoriaSelecionada === "visitantes") {
    html += `<h2><i class="fa-solid fa-user-plus"></i> Visitantes do dia</h2>`;
    html += d.visitantesDoDia.length === 0
      ? `<p class="dica-campo">Nenhum visitante registrado nesse dia.</p>`
      : `<ul style="margin-top:10px;">${d.visitantesDoDia.map(v => `<li style="padding:4px 0;">${v.nome}${v.convidado_por ? " — convidado por " + v.convidado_por : ""}</li>`).join("")}</ul>`;
  }

  if (categoriaSelecionada === "cadastros") {
    html += `<h2><i class="fa-solid fa-user-check"></i> Membros cadastrados nesse dia</h2>`;
    html += d.cadastradosDoDia.length === 0
      ? `<p class="dica-campo">Nenhum cadastro nesse dia.</p>`
      : `<ul style="margin-top:10px;">${d.cadastradosDoDia.map(m => `<li style="padding:4px 0;">${m.nome_completo}</li>`).join("")}</ul>`;
  }

  if (categoriaSelecionada === "eventos") {
    html += `<h2><i class="fa-solid fa-calendar-days"></i> Eventos desse dia</h2>`;
    html += d.eventosDoDia.length === 0
      ? `<p class="dica-campo">Nenhum evento cadastrado nesse dia.</p>`
      : `<ul style="margin-top:10px;">${d.eventosDoDia.map(e => `<li style="padding:4px 0;">${e.nome}</li>`).join("")}</ul>`;
  }

  if (categoriaSelecionada === "anotacoes") {
    html += `<h2><i class="fa-solid fa-note-sticky"></i> Anotações do dia</h2>`;

    if (d.anotacoesDoDia.length === 0) {
      html += `<p class="dica-campo">Nenhuma anotação nesse dia ainda.</p>`;
    } else {
      d.anotacoesDoDia.forEach(a => {
        html += `
          <div class="anotacao-item">
            <div>${a.texto}</div>
            <div class="anotacao-meta">
              ${a.ministerio ? a.ministerio + " — " : ""}${a.autor_nome || "Sem autor informado"}
              <button type="button" class="btn-excluir-anotacao" data-id="${a.id}" style="border:none; background:none; color:#d9534f; cursor:pointer; margin-left:8px;">Excluir</button>
            </div>
          </div>
        `;
      });
    }

    html += `
      <form id="form-nova-anotacao" style="margin-top:14px;">
        <textarea id="texto-anotacao" rows="2" placeholder="Ex: Hoje não teve ensaio por causa da chuva..." style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--linha, #ddd); font-family:inherit;"></textarea>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <select id="ministerio-anotacao" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--linha, #ddd);">
            <option value="">Geral (sem ministério específico)</option>
          </select>
          <input type="text" id="autor-anotacao" placeholder="Seu nome" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--linha, #ddd);">
          <button type="submit" class="btn-salvar" style="width:auto; padding:8px 16px;">Salvar</button>
        </div>
      </form>
    `;
  }

  detalheDia.innerHTML = html;

  if (categoriaSelecionada === "anotacoes") {
    const selectMinisterio = document.getElementById("ministerio-anotacao");
    getMinisterios().forEach(m => {
      const option = document.createElement("option");
      option.value = m.nome;
      option.textContent = m.nome;
      selectMinisterio.appendChild(option);
    });

    document.getElementById("form-nova-anotacao").addEventListener("submit", async (e) => {
      e.preventDefault();
      const texto = document.getElementById("texto-anotacao").value.trim();
      if (!texto) return;

      await criarAnotacao({
        data: dadosDoDiaAtual.dataEscolhida,
        ministerio: document.getElementById("ministerio-anotacao").value || null,
        texto,
        autor_nome: document.getElementById("autor-anotacao").value.trim() || null,
      });

      await montarResumoDoDia(); // busca de novo e redesenha tudo
    });

    document.querySelectorAll(".btn-excluir-anotacao").forEach(botao => {
      botao.addEventListener("click", async () => {
        if (confirm("Excluir essa anotação?")) {
          await excluirAnotacao(Number(botao.dataset.id));
          await montarResumoDoDia();
        }
      });
    });
  }
}

async function montarResumoDoDia() {
  if (!campoData.value) return;

  cardsResumo.innerHTML = `<p class="dica-campo">Carregando...</p>`;
  dadosDoDiaAtual = await buscarDadosDoDia();
  desenharCards();
  desenharDetalhe();
}

campoData.addEventListener("change", montarResumoDoDia);
montarResumoDoDia();