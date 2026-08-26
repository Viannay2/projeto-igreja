// ===============================
// SISTEMA DE GESTÃO DA IGREJA
// script.js
// ===============================

// Mensagem de boas-vindas
window.addEventListener("load", () => {
    console.log("Sistema carregado com sucesso!");
});

// ===============================
// DATA E HORA
// ===============================

function atualizarRelogio() {
    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR");

    const relogio = document.getElementById("relogio");

    if (relogio) {
        relogio.innerHTML = `${data} - ${hora}`;
    }
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);

// ===============================
// PESQUISA DE MEMBROS
// ===============================

const pesquisa = document.querySelector("input[type='search']");

if (pesquisa) {
    pesquisa.addEventListener("keyup", function () {

        let texto = pesquisa.value.toLowerCase();
        let linhas = document.querySelectorAll("tbody tr");

        linhas.forEach(function (linha) {

            if (!linha.children[0]) return;

            let nome = linha.children[0].textContent.toLowerCase();

            linha.style.display = nome.includes(texto) ? "" : "none";
        });
    });
}

// ===============================
// ANIMAÇÃO DOS CARDS
// ===============================

const cards = document.querySelectorAll(".card");

cards.forEach((card) => {

    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-10px) scale(1.03)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0px) scale(1)";
    });

});

// ===============================
// CLIQUE NOS BOTÕES DO MENU
// ===============================

const menu = document.querySelectorAll(".sidebar nav a");

menu.forEach((item) => {

    item.addEventListener("click", function () {

        menu.forEach(link => link.classList.remove("active"));
        this.classList.add("active");

    });

});

// ===============================
// BOTÃO DE NOTIFICAÇÃO
// ===============================

const botao = document.querySelector(".topo button");

if (botao) {

    botao.addEventListener("click", () => {
        alert("📢 Nenhuma notificação no momento.");
    });

}

// ===============================
// RODAPÉ
// ===============================

console.log("Desenvolvido por Armindo 🚀");