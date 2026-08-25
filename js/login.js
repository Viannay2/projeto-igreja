const formLogin =
  document.getElementById("form-login");

const statusMsgLogin =
  document.getElementById("status-msg");


formLogin.addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();

    statusMsgLogin.textContent = "";
    statusMsgLogin.className = "";


    const dados =
      Object.fromEntries(
        new FormData(formLogin).entries()
      );


    const btnLogin =
      document.getElementById("btn-login");


    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";


    try {

      const login =
        await verificarLogin(
          dados.email,
          dados.senha
        );


      if (!login) {

        statusMsgLogin.textContent =
          "E-mail ou senha incorretos.";

        statusMsgLogin.className =
          "show err";

        return;
      }


      // Salva usuário + JWT
      salvarSessao(login);


      // Confirma que a sessão foi realmente salva
      if (!estaLogado()) {

        throw new Error(
          "Não foi possível salvar a sessão."
        );
      }


      // Administrador e Secretaria
      // entram no painel administrativo
      if (
        login.cargo === "administrador" ||
        login.cargo === "secretaria"
      ) {

        window.location.href =
          "index.html";

        return;
      }


      // Outros cargos entram
      // na área do membro
      window.location.href =
        "area_membro.html";


    } catch (erro) {

      console.error(
        "Erro no login:",
        erro
      );

      statusMsgLogin.textContent =
        "Não foi possível realizar o login.";

      statusMsgLogin.className =
        "show err";

    } finally {

      btnLogin.disabled = false;
      btnLogin.textContent = "Entrar";
    }

  }
);    allow pasting    typeof getToken  typeof testarToken