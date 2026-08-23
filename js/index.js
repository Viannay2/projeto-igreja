async function montarDashboard() {
  const membros = await getMembros();

  // ----- Cards -----
  const mesAtual = new Date().getMonth(); // 0 = janeiro, 11 = dezembro

  const total = membros.length;
  const naoBatizados = membros.filter(m => !m.data_batismo).length;
  const aniversariantes = membros.filter(m => {
    if (!m.data_nascimento) return false;
    const mesNascimento = Number(m.data_nascimento.split("-")[1]) - 1;
    return mesNascimento === mesAtual;
  }).length;

  document.getElementById("card-total").textContent = total;
  document.getElementById("card-nao-batizados").textContent = naoBatizados;
  document.getElementById("card-aniversariantes").textContent = aniversariantes;

  // Card de "Não batizados" só aparece se tiver alguém não batizado
  document.getElementById("card-nao-batizados-container").hidden = naoBatizados === 0;

  // ----- Notificações -----
  await montarNotificacoes(membros);

  // ----- Card de Faltas -----
  await montarCardFaltas(membros);

  // ----- Gráfico de crescimento -----
  montarGraficoCrescimento(membros);
}

// Mesma regra da notificação de ausência, só que aqui é pra preencher o card.
// O card só aparece se tiver pelo menos 1 pessoa com falta.
async function montarCardFaltas(membros) {
  const cardFaltas = document.getElementById("card-faltas");
  const containerFaltas = document.getElementById("card-faltas-container");
  const LIMITE_DIAS_AUSENCIA = 10;

  try {
    const presencas = await getPresencas();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let totalFaltas = 0;

    membros.forEach(membro => {
      if (membro.status !== "ativo") return;

      const presencasDele = presencas.filter(p => p.membro_id === membro.id && p.presente);
      if (presencasDele.length === 0) return;

      const datasPresente = presencasDele.map(p => new Date(p.data + "T00:00:00"));
      const maisRecente = new Date(Math.max(...datasPresente));
      const diasSemAparecer = Math.round((hoje - maisRecente) / (1000 * 60 * 60 * 24));

      if (diasSemAparecer >= LIMITE_DIAS_AUSENCIA) totalFaltas++;
    });

    cardFaltas.textContent = totalFaltas;
    containerFaltas.hidden = totalFaltas === 0;
  } catch (erro) {
    cardFaltas.textContent = "—";
    console.error("Não consegui calcular faltas:", erro);
  }
}

// Gráfico de barras: quantos membros novos em cada um dos últimos 6 meses.
// Só conta quem tem "data_cadastro" preenchida — membros antigos (de antes
// desse campo existir) não entram na conta, por não terem essa data salva.
let graficoCrescimentoAtual = null; // guarda a instância pra poder destruir antes de redesenhar
let membrosParaGrafico = []; // guarda os membros, pra redesenhar sem buscar de novo na API

// Monta os "baldes" (dias ou meses) de acordo com o período escolhido.
// Até 90 dias, mostra dia a dia. Acima disso, mostra mês a mês.
function calcularBaldesCrescimento(membros, dias) {
  const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const hoje = new Date();
  const baldes = [];

  if (dias <= 90) {
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const rotulo = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      baldes.push({ chave, rotulo, comparar: (m) => m.data_cadastro === chave });
    }
  } else {
    const totalMeses = Math.round(dias / 30);
    for (let i = totalMeses - 1; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      baldes.push({ chave, rotulo: NOMES_MES[d.getMonth()], comparar: (m) => m.data_cadastro && m.data_cadastro.startsWith(chave) });
    }
  }

  return {
    labels: baldes.map(b => b.rotulo),
    contagem: baldes.map(b => membros.filter(b.comparar).length),
  };
}

function montarGraficoCrescimento(membros) {
  const canvas = document.getElementById("grafico-crescimento");
  if (!canvas || typeof Chart === "undefined") return;

  membrosParaGrafico = membros; // guarda pra quando o filtro de período mudar

  const seletor = document.getElementById("filtro-periodo-crescimento");
  const dias = Number(seletor?.value || 180);

  const { labels, contagem } = calcularBaldesCrescimento(membros, dias);

  // Se já existe um gráfico desenhado, destrói antes de fazer outro
  // (o Chart.js reclama se tentar desenhar 2 vezes no mesmo canvas)
  if (graficoCrescimentoAtual) {
    graficoCrescimentoAtual.destroy();
  }

  graficoCrescimentoAtual = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Novos membros",
        data: contagem,
        backgroundColor: "#0ea8df",
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

// Redesenha o gráfico quando o período é trocado, sem precisar recarregar a página
document.getElementById("filtro-periodo-crescimento")?.addEventListener("change", () => {
  montarGraficoCrescimento(membrosParaGrafico);
});

// Quantos dias faltam pro próximo aniversário dessa pessoa (0 = hoje).
// Se já passou esse ano, calcula pro ano que vem.
function diasParaProximoAniversario(dataNascimentoISO) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [, mes, dia] = dataNascimentoISO.split("-").map(Number);

  let proximoAniversario = new Date(hoje.getFullYear(), mes - 1, dia);

  if (proximoAniversario < hoje) {
    proximoAniversario = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  }

  const diffMs = proximoAniversario - hoje;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Lista TODOS os aniversariantes do mês (não só quem está chegando),
// marcando quem já fez aniversário esse mês e quem ainda vai fazer.
function montarPainelAniversariantes(membros, mesAtual) {
  const hoje = new Date();
  const diaHoje = hoje.getDate();

  const doMes = membros
    .filter(m => {
      if (!m.data_nascimento) return false;
      const mesNascimento = Number(m.data_nascimento.split("-")[1]) - 1;
      return mesNascimento === mesAtual;
    })
    .map(m => {
      const diaNascimento = Number(m.data_nascimento.split("-")[2]);
      return { nome: m.nome_completo, dia: diaNascimento, jaPassou: diaNascimento < diaHoje, hoje: diaNascimento === diaHoje };
    })
    .sort((a, b) => a.dia - b.dia);

  const lista = document.getElementById("lista-aniversariantes");
  lista.innerHTML = "";

  if (doMes.length === 0) {
    lista.innerHTML = `<li class="vazio">Ninguém faz aniversário esse mês.</li>`;
  } else {
    doMes.forEach(pessoa => {
      const item = document.createElement("li");
      let situacao;
      if (pessoa.hoje) {
        situacao = `<strong style="color:var(--laranja, #ff7a00);">É hoje! 🎉</strong>`;
      } else if (pessoa.jaPassou) {
        situacao = `<span style="color:#888;">Já fez, dia ${pessoa.dia}</span>`;
      } else {
        situacao = `<span>Dia ${pessoa.dia}</span>`;
      }
      item.innerHTML = `<i class="fa-solid fa-cake-candles"></i><span>${pessoa.nome} — ${situacao}</span>`;
      lista.appendChild(item);
    });
  }

  const cardContainer = document.getElementById("card-aniversariantes-container");
  const painel = document.getElementById("painel-aniversariantes");

  cardContainer.onclick = (e) => {
    e.stopPropagation();
    painel.hidden = !painel.hidden;
  };

  document.addEventListener("click", (e) => {
    if (!painel.hidden && !cardContainer.contains(e.target)) {
      painel.hidden = true;
    }
  });
}

async function montarNotificacoes(membros) {
  const DIAS_DE_ANTECEDENCIA = 7;
  const LIMITE_DIAS_AUSENCIA = 10;
  const notificacoes = [];
  const notificacoesAusencia = [];
  const mesAtual = new Date().getMonth();

  montarPainelAniversariantes(membros, mesAtual);

  // ----- Eventos chegando -----
  const eventos = getEventos();
  eventos.forEach(evento => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(evento.data + "T00:00:00");
    const diffDias = Math.round((dataEvento - hoje) / (1000 * 60 * 60 * 24));

    if (diffDias >= 0 && diffDias <= DIAS_DE_ANTECEDENCIA) {
      const texto = diffDias === 0 ? "é hoje" : diffDias === 1 ? "é amanhã" : `em ${diffDias} dias`;
      notificacoes.push({
        dias: diffDias,
        icone: "fa-calendar-days",
        texto: `Evento "${evento.nome}" ${texto}`,
      });
    }
  });

  // ----- Aniversariantes chegando (membros Ativos) -----
  membros.forEach(membro => {
    if (!membro.data_nascimento) return;
    if (membro.status !== "ativo") return;
    const dias = diasParaProximoAniversario(membro.data_nascimento);

    if (dias <= DIAS_DE_ANTECEDENCIA) {
      const texto = dias === 0 ? "é hoje" : dias === 1 ? "é amanhã" : `em ${dias} dias`;
      notificacoes.push({
        dias,
        icone: "fa-cake-candles",
        texto: `Aniversário de ${membro.nome_completo} ${texto}`,
      });
    }
  });

  notificacoes.sort((a, b) => a.dias - b.dias);

  // ----- Quem sumiu (membros Ativos, com pelo menos 1 presença registrada) -----
  try {
    const presencas = await getPresencas();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    membros.forEach(membro => {
      if (membro.status !== "ativo") return;

      const presencasDele = presencas.filter(p => p.membro_id === membro.id && p.presente);
      if (presencasDele.length === 0) return; // nunca foi marcado presente — sem base pra comparar

      const datasPresente = presencasDele.map(p => new Date(p.data + "T00:00:00"));
      const maisRecente = new Date(Math.max(...datasPresente));
      const diasSemAparecer = Math.round((hoje - maisRecente) / (1000 * 60 * 60 * 24));

      if (diasSemAparecer >= LIMITE_DIAS_AUSENCIA) {
        notificacoesAusencia.push({
          icone: "fa-user-slash",
          texto: `${membro.nome_completo} não aparece há ${diasSemAparecer} dias`,
        });
      }
    });
  } catch (erro) {
    console.error("Não consegui calcular ausências:", erro);
  }

  const todasNotificacoes = [...notificacoesAusencia, ...notificacoes];

  const lista = document.getElementById("lista-notificacoes");
  const badge = document.getElementById("badge-notificacoes");

  lista.innerHTML = "";

  if (todasNotificacoes.length === 0) {
    lista.innerHTML = `<li class="vazio">Nada por enquanto — tudo em dia.</li>`;
    badge.hidden = true;
  } else {
    todasNotificacoes.forEach(n => {
      const item = document.createElement("li");
      item.innerHTML = `<i class="fa-solid ${n.icone}"></i><span>${n.texto}</span>`;
      lista.appendChild(item);
    });
    badge.textContent = todasNotificacoes.length;
    badge.hidden = false;
  }
}

// ----- Abre/fecha o painel ao clicar no sino -----
const botaoNotificacoes = document.getElementById("botao-notificacoes");
const painelNotificacoes = document.getElementById("painel-notificacoes");

botaoNotificacoes.addEventListener("click", (e) => {
  e.stopPropagation();
  painelNotificacoes.hidden = !painelNotificacoes.hidden;
});

document.addEventListener("click", (e) => {
  if (!painelNotificacoes.hidden && !painelNotificacoes.contains(e.target)) {
    painelNotificacoes.hidden = true;
  }
});

montarDashboard();