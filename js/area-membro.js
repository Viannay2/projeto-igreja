const sessao = getSessao();
const mensagem = document.getElementById("mensagem-boas-vindas");

if (sessao) {
  mensagem.textContent = `Você entrou como ${sessao.nome} (${sessao.email}).`;
} else {
  // Se não tem sessão salva, manda de volta pro login
  window.location.href = "login.html";
}

document.getElementById("link-sair").addEventListener("click", (e) => {
  e.preventDefault();
  sair();
  window.location.href = "login.html";
});