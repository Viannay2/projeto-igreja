// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}


// ======================================================
// CADASTRO / EDIÇÃO DE MINISTÉRIO
// ======================================================




const formMinisterio = document.getElementById("form-ministerio");
const statusMsgMinisterio = document.getElementById("status-msg");
const tituloMinisterio = document.querySelector("header h1");
const botaoSalvarMinisterio = document.querySelector(".btn-salvar");

const parametrosMinisterio = new URLSearchParams(window.location.search);
const idEdicaoMinisterio = parametrosMinisterio.get("id");

function carregarMinisterioParaEdicao() {
  if (!idEdicaoMinisterio) return;

  const ministerio = buscarMinisterio(idEdicaoMinisterio);
  if (!ministerio) return;

  for (const campo in ministerio) {
    const input = formMinisterio.elements[campo];
    if (input && ministerio[campo] !== null) {
      input.value = ministerio[campo];
    }
  }

  tituloMinisterio.textContent = "Editar Ministério";
  botaoSalvarMinisterio.textContent = "Salvar alterações";
}

carregarMinisterioParaEdicao();

formMinisterio.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!formMinisterio.checkValidity()) {
    formMinisterio.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formMinisterio).entries());

  if (idEdicaoMinisterio) {
    editarMinisterio(idEdicaoMinisterio, dados);
    statusMsgMinisterio.innerHTML = 'Alterações salvas! <a href="ministério.html">Ver na lista de ministérios</a>';
  } else {
    addMinisterio(dados);
    statusMsgMinisterio.innerHTML = 'Ministério cadastrado! <a href="ministério.html">Ver na lista de ministérios</a>';
    formMinisterio.reset();
  }

  statusMsgMinisterio.className = "show ok";
});