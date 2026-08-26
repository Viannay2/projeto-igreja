// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}


const form = document.getElementById("form-cadastro");
const statusMsg = document.getElementById("status-msg");
const tituloPagina = document.querySelector("header h1");




const botaoSalvar = document.querySelector(".btn-salvar");
const containerCheckboxMinisterios = document.getElementById("lista-checkbox-ministerios");

const campoTemFilhos = document.getElementById("tem_filhos");
const blocoFilhos = document.getElementById("bloco-filhos");
const listaFilhos = document.getElementById("lista-filhos");
const botaoAddFilho = document.getElementById("btn-add-filho");

// Pega o "?id=123" da URL, se existir
const parametros = new URLSearchParams(window.location.search);
const idEdicao = parametros.get("id");

// ----- Desenha as caixinhas de ministério, uma pra cada ministério cadastrado -----
function desenharCheckboxMinisterios() {
  const ministerios = getMinisterios();

  if (ministerios.length === 0) {
    containerCheckboxMinisterios.innerHTML = `<p class="dica-campo">Nenhum ministério cadastrado ainda.</p>`;
    return;
  }

  containerCheckboxMinisterios.innerHTML = ministerios.map(ministerio => `
    <label>
      <input type="checkbox" name="ministerios" value="${ministerio.nome}">
      ${ministerio.nome}
    </label>
  `).join("");
}

desenharCheckboxMinisterios();

// ----- Filhos: mostra/esconde o bloco, adiciona/remove linhas -----
function adicionarLinhaFilho(nome = "", idade = "") {
  const linha = document.createElement("div");
  linha.className = "linha-filho";
  linha.innerHTML = `
    <input type="text" class="campo-nome-filho" placeholder="Nome do filho(a)" value="${nome}">
    <input type="text" class="campo-idade" placeholder="Idade" value="${idade}">
    <button type="button" aria-label="Remover"><i class="fa-solid fa-trash"></i></button>
  `;
  linha.querySelector("button").addEventListener("click", () => linha.remove());
  listaFilhos.appendChild(linha);
}

campoTemFilhos.addEventListener("change", () => {
  if (campoTemFilhos.value === "sim") {
    blocoFilhos.hidden = false;
    if (listaFilhos.children.length === 0) adicionarLinhaFilho();
  } else {
    blocoFilhos.hidden = true;
  }
});

botaoAddFilho.addEventListener("click", () => adicionarLinhaFilho());

function coletarFilhosDoFormulario() {
  const filhos = [];
  listaFilhos.querySelectorAll(".linha-filho").forEach(linha => {
    const nome = linha.querySelector(".campo-nome-filho").value.trim();
    const idade = linha.querySelector(".campo-idade").value.trim();
    if (nome) filhos.push({ nome, idade });
  });
  return filhos;
}

// ----- Se tem id na URL, é edição: busca o membro e preenche o formulário -----
async function carregarParaEdicao() {
  if (!idEdicao) return; // não é edição, segue o fluxo normal de cadastro

  const membro = await buscarMembro(idEdicao);

  for (const campo in membro) {
    if (campo === "ministerios" || campo === "filhos") continue; // tratados separado
    const input = form.elements[campo];
    if (input && membro[campo] !== null) {
      input.value = membro[campo];
    }
  }

  // Marca as caixinhas dos ministérios que essa pessoa já participa
  (membro.ministerios || []).forEach(nomeMinisterio => {
    const checkbox = form.querySelector(`input[name="ministerios"][value="${nomeMinisterio}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Mostra os filhos já cadastrados, se tiver
  if (membro.tem_filhos === "sim") {
    blocoFilhos.hidden = false;
    if (membro.filhos && membro.filhos.length > 0) {
      membro.filhos.forEach(f => adicionarLinhaFilho(f.nome, f.idade));
    } else {
      adicionarLinhaFilho();
    }
  }

  tituloPagina.textContent = "Editar Membro";
  botaoSalvar.textContent = "Salvar alterações";
}

carregarParaEdicao();

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const dados = Object.fromEntries(formData.entries());

  // Checkbox de múltipla escolha precisa de getAll — fromEntries só pega o último
  dados.ministerios = formData.getAll("ministerios");
  dados.filhos = coletarFilhosDoFormulario();

  if (idEdicao) {
    // ----- Modo edição -----
    await editarMembro(idEdicao, dados);
    statusMsg.innerHTML = 'Alterações salvas! <a href="membros.html">Ver na lista de membros</a>';
  } else {
    // ----- Modo cadastro novo -----
    await addMembro(dados);
    statusMsg.innerHTML = 'Membro cadastrado! <a href="membros.html">Ver na lista de membros</a>';
    form.reset();
    blocoFilhos.hidden = true;
    listaFilhos.innerHTML = "";
  }

  statusMsg.className = "show ok";
});

// ----- Gerar PDF da ficha, pra imprimir e assinar no papel -----
const TEXTO_ESTADO_CIVIL = {
  solteiro: "Solteiro(a)", casado: "Casado(a)", divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)", outro: "Outro",
};
const TEXTO_SEXO = { masculino: "Masculino", feminino: "Feminino" };
const TEXTO_STATUS_PDF = { ativo: "Ativo", desligado: "Desligado" };
const TEXTO_SIM_NAO = { sim: "Sim", nao: "Não" };
const TEXTO_AUTORIZA = { sim: "Sim, autorizo", nao: "Não autorizo" };

function formatarDataBRLocal(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

document.getElementById("btn-gerar-pdf").addEventListener("click", () => {
  const formData = new FormData(form);
  const d = Object.fromEntries(formData.entries());
  const ministeriosMarcados = formData.getAll("ministerios");
  const filhos = coletarFilhosDoFormulario();

  if (!d.nome_completo) {
    alert("Preenche pelo menos o nome completo antes de gerar o PDF.");
    return;
  }

  const doc = new jspdf.jsPDF();
  let y = 20;

  function titulo(texto) {
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(texto, 15, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    y += 8;
  }

  function linha(rotulo, valor) {
    doc.text(`${rotulo}: ${valor || "—"}`, 15, y);
    y += 7;
    if (y > 275) { doc.addPage(); y = 20; }
  }

  doc.setFontSize(16);
  doc.text("Ficha de Cadastro de Membro", 15, y);
  y += 12;

  titulo("1. Dados pessoais");
  linha("Nome completo", d.nome_completo);
  linha("Data de nascimento", formatarDataBRLocal(d.data_nascimento));
  linha("CPF", d.cpf);
  linha("RG", d.rg);
  linha("Estado civil", TEXTO_ESTADO_CIVIL[d.estado_civil] || "—");
  linha("Nome do cônjuge", d.nome_conjuge);
  linha("Sexo", TEXTO_SEXO[d.sexo] || "—");
  linha("Tem filhos?", TEXTO_SIM_NAO[d.tem_filhos] || "—");
  if (filhos.length > 0) {
    filhos.forEach(f => linha("  Filho(a)", `${f.nome}${f.idade ? " — " + f.idade + " anos" : ""}`));
  }
  linha("Telefone/WhatsApp", d.telefone);
  linha("E-mail", d.email);

  titulo("2. Endereço");
  linha("Rua/Av.", d.endereco_rua);
  linha("Número", d.endereco_numero);
  linha("Complemento", d.endereco_complemento);
  linha("Bairro", d.endereco_bairro);
  linha("Cidade", d.endereco_cidade);
  linha("CEP", d.endereco_cep);

  titulo("3. Vida cristã");
  linha("Batizado(a) nas águas", d.data_batismo ? formatarDataBRLocal(d.data_batismo) : "Não");
  linha("Status", TEXTO_STATUS_PDF[d.status] || "—");
  linha("Família", d.familia);
  linha("Ministérios", ministeriosMarcados.length > 0 ? ministeriosMarcados.join(", ") : "Nenhum");
  linha("Dons/talentos", d.dons_talentos);

  titulo("4. Autorização para uso de imagem");
  linha("Autoriza uso de imagem/voz", TEXTO_AUTORIZA[d.autoriza_imagem] || "—");

  if (d.responsavel_nome) {
    titulo("5. Responsável (menor de idade)");
    linha("Nome do responsável", d.responsavel_nome);
    linha("CPF do responsável", d.responsavel_cpf);
    linha("Parentesco", d.responsavel_parentesco);
    linha("Telefone do responsável", d.responsavel_telefone);
  }

  // ----- Espaço pra assinatura física -----
  y += 10;
  if (y > 250) { doc.addPage(); y = 20; }

  doc.text("_______________________________________________", 15, y);
  y += 7;
  doc.text("Assinatura do membro", 15, y);
  y += 7;
  doc.text(`Data: ____/____/______`, 15, y);
  y += 15;

  if (d.responsavel_nome) {
    doc.text("_______________________________________________", 15, y);
    y += 7;
    doc.text("Assinatura do responsável (menor de idade)", 15, y);
    y += 7;
    doc.text(`Data: ____/____/______`, 15, y);
  }

  const nomeArquivo = d.nome_completo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`ficha-${nomeArquivo}.pdf`);
});