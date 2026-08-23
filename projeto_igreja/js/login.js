const formLogin = document.getElementById("form-login");
const statusMsgLogin = document.getElementById("status-msg");

formLogin.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formLogin).entries());
  const usuario = verificarLogin(dados.email, dados.senha);

  if (usuario) {
    salvarSessao(usuario);
    window.location.href = "membros.html";
  } else {
    statusMsgLogin.textContent = "E-mail ou senha incorretos.";
    statusMsgLogin.className = "show err";
  }
});