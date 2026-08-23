const form = document.getElementById("form-cadastro");
const statusMsg = document.getElementById("status-msg");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Por enquanto só mostra os dados no console — depois vamos trocar
  // isso por uma chamada fetch() pra API (FastAPI), que salva no banco.
  const dados = Object.fromEntries(new FormData(form).entries());
  console.log("Dados do formulário:", dados);

  statusMsg.textContent = "Cadastrado (localmente, ainda sem conexão com o banco).";
  statusMsg.className = "show ok";

  form.reset();
});


