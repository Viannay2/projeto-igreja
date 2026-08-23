const formAuto = document.getElementById("form-autocadastro");
const statusMsgAuto = document.getElementById("status-msg");

formAuto.addEventListener("submit", function (e) {
  e.preventDefault();

  // Verifica os campos obrigatórios (nome, e-mail, senha, consentimento)
  if (!formAuto.checkValidity()) {
    formAuto.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formAuto).entries());

  if (dados.senha !== dados.confirmar_senha) {
    statusMsgAuto.textContent = "As senhas não são iguais.";
    statusMsgAuto.className = "show err";
    return;
  }

  if (emailJaCadastrado(dados.email)) {
    statusMsgAuto.textContent = "Já existe uma conta com esse e-mail.";
    statusMsgAuto.className = "show err";
    return;
  }

  delete dados.confirmar_senha; // não precisa guardar isso
  criarUsuario(dados);

  statusMsgAuto.innerHTML = 'Conta criada! <a href="login.html">Fazer login</a>';
  statusMsgAuto.className = "show ok";

  formAuto.reset();
});
