const formPerfil = document.getElementById("form-perfil");
const statusMsgPerfil = document.getElementById("status-msg");

const campoNome = document.getElementById("nome");
const campoCargo = document.getElementById("cargo");
const nomeExibicao = document.getElementById("perfil-nome-exibicao");
const cargoExibicao = document.getElementById("perfil-cargo-exibicao");
const inputFoto = document.getElementById("upload-avatar");
const previewFoto = document.getElementById("avatar-preview");

let fotoBase64Atual = null; // guarda a foto convertida, pronta pra salvar

// ----- Carrega o que já estava salvo, ao abrir a página -----
function carregarPerfilSalvo() {
  const perfil = getPerfilAdmin();
  if (!perfil) return;

  if (perfil.nome) {
    campoNome.value = perfil.nome;
    nomeExibicao.textContent = perfil.nome;
  }
  if (perfil.cargo) {
    campoCargo.value = perfil.cargo;
    cargoExibicao.textContent = perfil.cargo;
  }
  if (perfil.foto_base64) {
    previewFoto.src = perfil.foto_base64;
    fotoBase64Atual = perfil.foto_base64;
  }
}

carregarPerfilSalvo();

// ----- Atualiza os textos do topo enquanto digita -----
campoNome.addEventListener("input", () => {
  nomeExibicao.textContent = campoNome.value || "Administrador";
});

campoCargo.addEventListener("input", () => {
  cargoExibicao.textContent = campoCargo.value || "Secretaria da Igreja";
});

// ----- Converte a foto escolhida pra base64 (formato que dá pra salvar) -----
inputFoto.addEventListener("change", () => {
  const arquivo = inputFoto.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = () => {
    fotoBase64Atual = leitor.result; // já vem pronto como base64
    previewFoto.src = fotoBase64Atual;
  };
  leitor.readAsDataURL(arquivo);
});

// ----- Salva tudo -----
formPerfil.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formPerfil).entries());

  salvarPerfilAdmin({
    nome: dados.nome,
    cargo: dados.cargo,
    foto_base64: fotoBase64Atual,
  });

  statusMsgPerfil.textContent = "Perfil atualizado!";
  statusMsgPerfil.className = "show ok";
});