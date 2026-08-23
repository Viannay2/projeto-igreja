// ===============================
// relatorios.js
// Cada função monta um PDF diferente, usando jsPDF + autoTable.
// Dados de Membros/Visitantes vêm da API (api.js), o resto do
// localStorage (storage.js) — igual o resto do sistema.
// ===============================

const TEXTO_STATUS = {
  primeira_vez: "Primeira vez",
  retorno: "Retorno",
};

function formatarDataBR(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Escreve o cabeçalho padrão (nome da igreja + título do relatório + data)
// em todo PDF, e devolve a posição Y onde a tabela deve começar.
function desenharCabecalho(doc, tituloRelatorio) {
  const config = getConfigIgreja();
  const nomeIgreja = (config && config.nome_igreja) || "Sistema de Gestão da Igreja";

  doc.setFontSize(16);
  doc.text(nomeIgreja, 40, 45);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(tituloRelatorio, 40, 65);

  doc.setFontSize(9);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 40, 80);

  doc.setTextColor(0);

  return 100; // posição Y onde a tabela começa
}

// ----- Relatório: Membros ativos -----
async function gerarPDFMembrosAtivos() {
  const membros = await getMembros();
  const ativos = membros.filter(m => m.status === "ativo");

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Membros Ativos");

  doc.autoTable({
    startY: inicioY,
    head: [["Nome", "Telefone", "Família"]],
    body: ativos.map(m => [m.nome_completo, m.telefone || "—", m.familia || "—"]),
  });

  doc.save("membros-ativos.pdf");
}

// ----- Relatório: Aniversariantes do mês -----
async function gerarPDFAniversariantes() {
  const membros = await getMembros();
  const mesAtual = new Date().getMonth();

  const aniversariantes = membros
    .filter(m => m.data_nascimento && Number(m.data_nascimento.split("-")[1]) - 1 === mesAtual)
    .sort((a, b) => Number(a.data_nascimento.split("-")[2]) - Number(b.data_nascimento.split("-")[2]));

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Aniversariantes do Mês");

  doc.autoTable({
    startY: inicioY,
    head: [["Nome", "Data de nascimento"]],
    body: aniversariantes.map(m => [m.nome_completo, formatarDataBR(m.data_nascimento)]),
  });

  doc.save("aniversariantes-do-mes.pdf");
}

// ----- Relatório: Batizados -----
async function gerarPDFBatizados() {
  const membros = await getMembros();
  const batizados = membros
    .filter(m => m.data_batismo)
    .sort((a, b) => new Date(a.data_batismo) - new Date(b.data_batismo));

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Membros Batizados");

  doc.autoTable({
    startY: inicioY,
    head: [["Nome", "Data de batismo"]],
    body: batizados.map(m => [m.nome_completo, formatarDataBR(m.data_batismo)]),
  });

  doc.save("batizados.pdf");
}

// ----- Relatório: Famílias (agrupado pela etiqueta "família" do próprio membro) -----
async function gerarPDFFamilias() {
  const membros = await getMembros();

  // Agrupa por nome de família, ignorando quem não preencheu esse campo
  const grupos = {};
  membros.forEach(m => {
    const nomeFamilia = (m.familia || "").trim();
    if (!nomeFamilia) return;
    if (!grupos[nomeFamilia]) grupos[nomeFamilia] = [];
    grupos[nomeFamilia].push(m.nome_completo);
  });

  const linhas = Object.keys(grupos)
    .sort()
    .map(nomeFamilia => [nomeFamilia, String(grupos[nomeFamilia].length), grupos[nomeFamilia].join(", ")]);

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Famílias");

  doc.autoTable({
    startY: inicioY,
    head: [["Família", "Total", "Integrantes"]],
    body: linhas,
    columnStyles: { 2: { cellWidth: 90 } },
  });

  doc.save("familias.pdf");
}

// ----- Relatório: Ministérios -----
async function gerarPDFMinisterios() {
  const ministerios = getMinisterios();
  const membros = await getMembros();

  const linhas = ministerios.map(ministerio => {
    const integrantes = membros.filter(m => (m.ministerios || []).includes(ministerio.nome));
    const nomes = integrantes.map(m => m.nome_completo).join(", ") || "—";
    return [ministerio.nome, ministerio.lider || "—", String(integrantes.length), nomes];
  });

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Ministérios");

  doc.autoTable({
    startY: inicioY,
    head: [["Ministério", "Líder", "Total", "Integrantes"]],
    body: linhas,
    columnStyles: { 3: { cellWidth: 70 } },
  });

  doc.save("ministerios.pdf");
}

// ----- Relatório: Visitantes (últimos 30 dias) -----
async function gerarPDFVisitantes() {
  const visitantes = await getVisitantes();
  const hoje = new Date();
  const haTrintaDias = new Date();
  haTrintaDias.setDate(hoje.getDate() - 30);

  const recentes = visitantes.filter(v => {
    if (!v.data_visita) return false;
    const data = new Date(v.data_visita + "T00:00:00");
    return data >= haTrintaDias && data <= hoje;
  });

  const doc = new jspdf.jsPDF();
  const inicioY = desenharCabecalho(doc, "Visitantes — Últimos 30 dias");

  doc.autoTable({
    startY: inicioY,
    head: [["Nome", "Data da visita", "Convidado por", "Status"]],
    body: recentes.map(v => [
      v.nome,
      formatarDataBR(v.data_visita),
      v.convidado_por || "—",
      TEXTO_STATUS[v.status] || v.status,
    ]),
  });

  doc.save("visitantes-30-dias.pdf");
}

// ----- Liga cada botão na sua função -----
document.getElementById("btn-pdf-membros-ativos").addEventListener("click", gerarPDFMembrosAtivos);
document.getElementById("btn-pdf-aniversariantes").addEventListener("click", gerarPDFAniversariantes);
document.getElementById("btn-pdf-batizados").addEventListener("click", gerarPDFBatizados);
document.getElementById("btn-pdf-familias").addEventListener("click", gerarPDFFamilias);
document.getElementById("btn-pdf-ministerios").addEventListener("click", gerarPDFMinisterios);
document.getElementById("btn-pdf-visitantes").addEventListener("click", gerarPDFVisitantes);