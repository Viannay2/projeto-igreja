const formVisitante = document.getElementById("form-visitante");
const statusMsgVisitante = document.getElementById("status-msg");
const tituloVisitante = document.querySelector("header h1");
const botaoSalvarVisitante = document.querySelector(".btn-salvar");

const parametrosVisitante = new URLSearchParams(window.location.search);
const idEdicaoVisitante = parametrosVisitante.get("id");

async function carregarVisitanteParaEdicao() {
  if (!idEdicaoVisitante) return;

  const visitante = await buscarVisitante(idEdicaoVisitante);

  for (const campo in visitante) {
    const input = formVisitante.elements[campo];
    if (input && visitante[campo] !== null) {
      input.value = visitante[campo];
    }
  }

  tituloVisitante.textContent = "Editar Visitante";
  botaoSalvarVisitante.textContent = "Salvar alterações";
}

carregarVisitanteParaEdicao();

formVisitante.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!formVisitante.checkValidity()) {
    formVisitante.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formVisitante).entries());

  if (idEdicaoVisitante) {
    await editarVisitante(idEdicaoVisitante, dados);
    statusMsgVisitante.innerHTML = 'Alterações salvas! <a href="visitante.html">Ver na lista de visitantes</a>';
  } else {
    await addVisitante(dados);
    statusMsgVisitante.innerHTML = 'Visitante cadastrado! <a href="visitante.html">Ver na lista de visitantes</a>';
    formVisitante.reset();
  }

  statusMsgVisitante.className = "show ok";
});