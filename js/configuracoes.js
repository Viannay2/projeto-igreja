// ======================================================
// PROTEÇÃO DA PÁGINA
// ======================================================

const sessao = getSessao();

if (!sessao) {
  window.location.href = "login.html";
}


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const campoNomeIgreja = document.getElementById("nome_igreja");
const nomeExibicaoConfig = document.getElementById("config-nome-exibicao");
const inputLogo = document.getElementById("upload-logo");
const previewLogo = document.getElementById("logo-preview");
const formConfig = document.getElementById("form-config");
const statusMsgConfig = document.getElementById("status-msg");

let logoBase64Atual = null;

// ----- Carrega tudo que já estava salvo, ao abrir a página -----
function carregarConfigSalva() {
  const config = getConfigIgreja();
  if (!config) return;

  for (const campo in config) {
    if (campo === "logo_base64") continue; // tratado separado, embaixo
    const input = formConfig.elements[campo];
    if (input && config[campo] !== null && config[campo] !== undefined) {
      input.value = config[campo];
    }
  }

  if (config.nome_igreja) {
    nomeExibicaoConfig.textContent = config.nome_igreja;
  }
  if (config.logo_base64) {
    previewLogo.src = config.logo_base64;
    logoBase64Atual = config.logo_base64;
  }
}

carregarConfigSalva();

campoNomeIgreja.addEventListener("input", () => {
  nomeExibicaoConfig.textContent = campoNomeIgreja.value || "Igreja";
});

inputLogo.addEventListener("change", () => {
  const arquivo = inputLogo.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = () => {
    logoBase64Atual = leitor.result;
    previewLogo.src = logoBase64Atual;
  };
  leitor.readAsDataURL(arquivo);
});

formConfig.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(formConfig).entries());
  dados.logo_base64 = logoBase64Atual;

  salvarConfigIgreja(dados);

  statusMsgConfig.textContent = "Configurações salvas!";
  statusMsgConfig.className = "show ok";
});