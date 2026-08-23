

const formLogin = document.getElementById("form-login");
const statusMsgLogin = document.getElementById("status-msg");

formLogin.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formLogin).entries());
  const usuario = await verificarLogin(dados.email, dados.senha);

  if (usuario) {
    salvarSessao(usuario);
    window.location.href = "area_membro.html";
  } else {
    statusMsgLogin.textContent = "E-mail ou senha incorretos.";
    statusMsgLogin.className = "show err";
  }
});