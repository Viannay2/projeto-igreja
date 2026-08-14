const formVisitante = document.getElementById("form-visitante");
const statusMsgVisitante = document.getElementById("status-msg");

formVisitante.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!formVisitante.checkValidity()) {
    formVisitante.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formVisitante).entries());

  addVisitante(dados);

  statusMsgVisitante.innerHTML = 'Visitante cadastrado! <a href="visitante.html">Ver na lista de visitantes</a>';
  statusMsgVisitante.className = "show ok";

  formVisitante.reset();
});