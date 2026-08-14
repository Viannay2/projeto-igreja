const numeros = document.querySelectorAll(".card h2");

numeros.forEach((numero) => {

    const valorFinal = parseInt(numero.innerText);

    let contador = 0;

    const velocidade = Math.max(1, Math.floor(valorFinal / 60));

    const intervalo = setInterval(() => {

        contador += velocidade;

        if (contador >= valorFinal) {

            numero.innerText = valorFinal;

            clearInterval(intervalo);

        } else {

            numero.innerText = contador;

        }

    }, 20);

});

