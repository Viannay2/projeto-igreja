const formLideranca = document.getElementById("form-lideranca");
const statusMsgLideranca = document.getElementById("status-msg");
const campoUsuario = document.getElementById("usuario_id");
const campoMinisterio = document.getElementById("ministerio_nome");
const corpoTabelaLiderancas = document.getElementById("tbody-liderancas");

const TEXTO_PAPEL = {
  lider: "Líder",
  vice: "Vice-líder",
  auxiliar: "Auxiliar",
};

// ----- Preenche o select de pessoas com todo mundo que tem login -----
async function preencherSelectUsuarios() {
  const usuarios = await listarUsuarios();

  usuarios.forEach(usuario => {
    const option = document.createElement("option");
    option.value = usuario.id;
    option.textContent = `${usuario.nome_completo} (${usuario.email})`;
    campoUsuario.appendChild(option);
  });
}

// ----- Preenche o select de ministérios -----
function preencherSelectMinisterios() {
  const ministerios = getMinisterios();

  ministerios.forEach(ministerio => {
    const option = document.createElement("option");
    option.value = ministerio.nome;
    option.textContent = ministerio.nome;
    campoMinisterio.appendChild(option);
  });
}

// ----- Desenha a tabela de lideranças já atribuídas -----
async function desenharTabelaLiderancas() {
  const liderancas = await getLiderancas();
  corpoTabelaLiderancas.innerHTML = "";

  if (liderancas.length === 0) {
    corpoTabelaLiderancas.innerHTML = `<tr><td colspan="4">Nenhuma liderança atribuída ainda.</td></tr>`;
    return;
  }

  liderancas.forEach(lideranca => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${lideranca.usuario_nome}</td>
      <td>${lideranca.ministerio_nome}</td>
      <td>${TEXTO_PAPEL[lideranca.papel] || lideranca.papel}</td>
      <td class="col-acoes">
        <button class="icon-btn btn-remover-lideranca" data-id="${lideranca.id}" aria-label="Remover liderança de ${lideranca.usuario_nome}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    corpoTabelaLiderancas.appendChild(linha);
  });

  document.querySelectorAll(".btn-remover-lideranca").forEach(botao => {
    botao.addEventListener("click", async () => {
      if (confirm("Tem certeza que quer remover essa liderança?")) {
        await removerLideranca(Number(botao.dataset.id));
        desenharTabelaLiderancas();
      }
    });
  });
}

async function iniciar() {
  await preencherSelectUsuarios();
  preencherSelectMinisterios();
  await desenharTabelaLiderancas();
}

iniciar();

formLideranca.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formLideranca).entries());
  dados.usuario_id = Number(dados.usuario_id);

  try {
    await atribuirLideranca(dados);
    statusMsgLideranca.textContent = "Liderança atribuída!";
    statusMsgLideranca.className = "show ok";
    formLideranca.reset();
    desenharTabelaLiderancas();
  } catch (erro) {
    statusMsgLideranca.textContent = erro.message;
    statusMsgLideranca.className = "show err";
  }
});