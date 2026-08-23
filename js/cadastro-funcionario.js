const formFuncionario = document.getElementById("form-funcionario");
const statusMsgFuncionario = document.getElementById("status-msg");

formFuncionario.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!formFuncionario.checkValidity()) {
    formFuncionario.reportValidity();
    return;
  }

  const dados = Object.fromEntries(new FormData(formFuncionario).entries());

  try {
    await criarUsuario({
      nome_completo: dados.nome_completo,
      email: dados.email,
      senha: dados.senha,
      cargo: dados.cargo,
    });

    statusMsgFuncionario.innerHTML = 'Acesso criado! Já pode ser usado em <a href="login.html">login.html</a>';
    statusMsgFuncionario.className = "show ok";

    formFuncionario.reset();
  } catch (erro) {
    statusMsgFuncionario.textContent = erro.message;
    statusMsgFuncionario.className = "show err";
  }
});