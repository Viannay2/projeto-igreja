const form = document.getElementById("form-cadastro");
const statusMsg = document.getElementById("status-msg");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(form).entries());

  // Salva de verdade no "banco temporário" (storage.js)
  addMembro(dados);

  statusMsg.innerHTML = 'Membro cadastrado! <a href="membros.html">Ver na lista de membros</a>';
  statusMsg.className = "show ok";

  form.reset();
});


