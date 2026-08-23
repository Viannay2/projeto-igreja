const formEvento = document.getElementById("form-evento");
const statusMsgEvento = document.getElementById("status-msg");

formEvento.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!formEvento.checkValidity()) {
    formEvento.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formEvento).entries());

  addEvento(dados);

  statusMsgEvento.innerHTML = 'Evento cadastrado! <a href="evento.html">Ver na lista de eventos</a>';
  statusMsgEvento.className = "show ok";

  formEvento.reset();
});