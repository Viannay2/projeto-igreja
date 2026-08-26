// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}


// ======================================================
// CADASTRO / EDIÇÃO DE EVENTO
// ======================================================

const formEvento = document.getElementById("form-evento");
const statusMsgEvento = document.getElementById("status-msg");
const tituloEvento = document.querySelector("header h1");
const botaoSalvarEvento = document.querySelector(".btn-salvar");

const parametrosEvento = new URLSearchParams(window.location.search);
const idEdicaoEvento = parametrosEvento.get("id");

function carregarEventoParaEdicao() {
  if (!idEdicaoEvento) return;

  const evento = buscarEvento(idEdicaoEvento);
  if (!evento) return;

  for (const campo in evento) {
    const input = formEvento.elements[campo];
    if (input && evento[campo] !== null) {
      input.value = evento[campo];
    }
  }

  tituloEvento.textContent = "Editar Evento";
  botaoSalvarEvento.textContent = "Salvar alterações";
}

carregarEventoParaEdicao();

formEvento.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!formEvento.checkValidity()) {
    formEvento.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formEvento).entries());

  if (idEdicaoEvento) {
    editarEvento(idEdicaoEvento, dados);
    statusMsgEvento.innerHTML = 'Alterações salvas! <a href="eventos.html">Ver na lista de eventos</a>';
  } else {
    addEvento(dados);
    statusMsgEvento.innerHTML = 'Evento cadastrado! <a href="eventos.html">Ver na lista de eventos</a>';
    formEvento.reset();
  }

  statusMsgEvento.className = "show ok";
});