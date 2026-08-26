


// ===============================
// layout.js
// Roda em toda página. Pega o logo da igreja e a foto do admin
// salvos (em perfil.html / configuracoes.html) e aplica no
// menu lateral e no topo, se existirem na página atual.
// Precisa do storage.js carregado ANTES dele.
// ===============================

function aplicarLayoutSalvo() {
  const config = getConfigIgreja();
  const perfil = getPerfilAdmin();

  // ----- Logo + nome da igreja no menu lateral -----
  const containerLogo = document.querySelector(".sidebar .logo");
  if (config && containerLogo) {
    const icone = containerLogo.querySelector("i");
    const titulo = containerLogo.querySelector("h2");

    if (config.logo_base64 && icone) {
      const img = document.createElement("img");
      img.src = config.logo_base64;
      img.alt = "Logo da igreja";
      img.className = "logo-img-sidebar";
      icone.replaceWith(img);
    }

    if (config.nome_igreja && titulo) {
      titulo.textContent = config.nome_igreja;
    }
  }

  // ----- Foto do administrador no topo -----
  const avatarTopo = document.querySelector(".topo img");
  if (perfil && perfil.foto_base64 && avatarTopo) {
    avatarTopo.src = perfil.foto_base64;
    avatarTopo.alt = perfil.nome || "Administrador";
  }
}

document.addEventListener("DOMContentLoaded", aplicarLayoutSalvo);