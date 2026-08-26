const formLogin = document.getElementById("form-login");
const statusMsgLogin = document.getElementById("status-msg");

formLogin.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formLogin).entries());
  const usuario = await verificarLogin(dados.email, dados.senha);

  console.log("RESPOSTA DO LOGIN:", usuario);

  if (usuario) {
    salvarSessao(usuario);

    // Administrador e Secretaria caem no painel de verdade.
    // Membro comum (autocadastro) cai na área simples de boas-vindas.
    if (usuario.cargo === "administrador" || usuario.cargo === "secretaria") {
      window.location.href = "index.html";
    } else {
      window.location.href = "area_membro.html";
    }
  } else {
    statusMsgLogin.textContent = "E-mail ou senha incorretos.";
    statusMsgLogin.className = "show err";
  }
});