const formAuto = document.getElementById("form-autocadastro");
const statusMsgAuto = document.getElementById("status-msg");

formAuto.addEventListener("submit", async function (e) {
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

  try {
    // ----- Parte 1: cria o acesso (login) -----
    // Se o e-mail já existir, a API recusa e cai no catch lá embaixo
    await criarUsuario({
      nome_completo: dados.nome_completo,
      email: dados.email,
      senha: dados.senha,
    });

    // ----- Parte 2: cria a ficha de membro, com os mesmos dados -----
    // Assim a pessoa já aparece em membros.html, sem precisar de um
    // segundo cadastro feito pela administração.
    await addMembro({
      nome_completo: dados.nome_completo,
      data_nascimento: dados.data_nascimento,
      telefone: dados.telefone,
      email: dados.email,
      endereco: dados.endereco,
      data_batismo: dados.data_batismo,
      familia: dados.familia,
      status: "ativo",
    });

    statusMsgAuto.innerHTML = 'Conta criada! Seu cadastro de membro já está na lista. <a href="login.html">Fazer login</a>';
    statusMsgAuto.className = "show ok";

    formAuto.reset();
  } catch (erro) {
    statusMsgAuto.textContent = erro.message;
    statusMsgAuto.className = "show err";
  }
});