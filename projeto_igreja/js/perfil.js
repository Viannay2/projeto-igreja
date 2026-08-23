const formPerfil = document.getElementById("form-perfil");
const statusMsgPerfil = document.getElementById("status-msg");

// Atualiza o nome e o cargo mostrados no topo da página
// conforme o usuário digita nos campos do formulário
const campoNome = document.getElementById("nome");
const campoCargo = document.getElementById("cargo");
const nomeExibicao = document.getElementById("perfil-nome-exibicao");
const cargoExibicao = document.getElementById("perfil-cargo-exibicao");

campoNome.addEventListener("input", () => {
  nomeExibicao.textContent = campoNome.value || "Administrador";
});

campoCargo.addEventListener("input", () => {
  cargoExibicao.textContent = campoCargo.value || "Secretaria da Igreja";
});

// Pré-visualização da nova foto antes de salvar
const inputFoto = document.getElementById("upload-avatar");
const previewFoto = document.getElementById("avatar-preview");

inputFoto.addEventListener("change", () => {
  const arquivo = inputFoto.files[0];
  if (arquivo) {
    previewFoto.src = URL.createObjectURL(arquivo);
  }
});

// Envio do formulário — por enquanto só simula o salvamento
formPerfil.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formPerfil).entries());
  console.log("Dados do perfil:", dados);

  statusMsgPerfil.textContent = "Perfil atualizado (localmente, ainda sem conexão com o banco).";
  statusMsgPerfil.className = "show ok";
});


