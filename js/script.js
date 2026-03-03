document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const startBtn = document.getElementById('start-btn');
    const startPointer = document.getElementById('start-pointer');
    const video = document.getElementById('intro-video');
    const videoContainer = document.getElementById('video-container');
    const cardContainer = document.getElementById('card-container');
    const messageOverlay = document.getElementById('message-overlay');
    const dialog = document.getElementById('pokemon-dialog');
    const bgMusic = document.getElementById('bg-music');
    const notesTop = document.getElementById('notes-top');
    const notesBottom = document.getElementById('notes-bottom');

    const frasesPrep = ["O Que Será", "Que vêm...", "Por aí?", "Prepare-se!", "Diademenses à Vista"];
    const segredo = ["Você", "Aceitaria", "Um", "Encontro", "Comigo?"];
    
    let viradas = 0;
    window.clicksNao = 0; 

  startBtn.addEventListener('click', () => {
        // 1. PRIORIDADE ZERO: Iniciar o áudio imediatamente
        // Ao colocar no topo, o comando de play é enviado milissegundos antes de qualquer processamento visual
        if (bgMusic) {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(e => console.log("Interação necessária para áudio:", e));
        }

        // 2. FEEDBACK INSTANTÂNEO: Sumir com o botão e a seta
        // O usuário sente que o sistema respondeu na hora
        startBtn.classList.add('hide-btn');
        if (startPointer) startPointer.style.display = 'none';

        // 3. PROCESSAMENTO DE INTERFACE: Ativar notas musicais
        // requestAnimationFrame evita que a renderização das notas gere micro-travamentos no áudio
        requestAnimationFrame(() => {
            if (notesTop) notesTop.style.display = 'block';
            if (notesBottom) notesBottom.style.display = 'block';
        });

        // 4. CRIAÇÃO DINÂMICA: Gerar as cartas na tela
        frasesPrep.forEach((txt, index) => {
            const card = document.createElement('div');
            card.className = 'card wave-effect';
            // O delay da animação de onda cria o ritmo visual
            card.style.animationDelay = `${index * 0.2}s`;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">${txt}</div>
                </div>
            `;
            
            card.addEventListener('click', function() {
                if (!this.classList.contains('flipped')) {
                    this.classList.add('flipped');
                    
                    // Remove o efeito de onda para a carta ficar estável durante a leitura
                    this.classList.remove('wave-effect');
                    this.style.transform = 'translateY(0)';
                    
                    viradas++;
                    
                    // Se todas as cartas (5 no total) forem clicadas, inicia o vídeo após o delay
                    if (viradas === frasesPrep.length) {
                        setTimeout(iniciarVideo, 4500);
                    }
                }
            });
            
            cardContainer.appendChild(card);
        });
    });

    function iniciarVideo() {
        cardContainer.style.opacity = '0';
        if (bgMusic) bgMusic.volume = 0.1;

        setTimeout(() => {
            cardContainer.style.display = 'none';
            header.style.display = 'block';
            videoContainer.style.display = 'block';
            video.play().catch(e => console.log("Erro Play"));

            const monitor = setInterval(() => {
                if (video.duration && video.currentTime >= video.duration - 1) {
                    video.pause();
                    clearInterval(monitor);
                    if (bgMusic) bgMusic.volume = 0.4;
                    configurarRevelacao();
                }
            }, 100);
        }, 800);
    }

    function configurarRevelacao() {
        segredo.forEach((palavra, index) => {
            const zone = document.createElement('div');
            zone.className = 'click-zone';
            zone.id = `zone-${index}`;
            const span = document.createElement('span');
            span.className = 'word';
            span.innerText = palavra;
            zone.appendChild(span);
            messageOverlay.appendChild(zone);

            zone.addEventListener('click', () => {
                if (!span.classList.contains('revealed')) {
                    span.classList.add('revealed');
                    if (index === segredo.length - 1) {
                        setTimeout(() => mostrarDialogo("E então? O que me diz?"), 800);
                    }
                }
            });
        });
    }
});

function mostrarDialogo(texto) {
    const dialog = document.getElementById('pokemon-dialog');
    const dialogText = document.getElementById('dialog-text');
    dialog.classList.remove('dialog-hidden');
    dialogText.innerText = "";
    let i = 0;
    const typer = setInterval(() => {
        if (i < texto.length) {
            dialogText.innerText += texto[i];
            i++;
        } else {
            clearInterval(typer);
        }
    }, 50);
}

function decisao(tipo) {
    const dialogText = document.getElementById('dialog-text');
    const btnNao = document.getElementById('btn-nao');
    const btnsContainer = document.querySelector('.dialog-buttons');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    if (tipo === 'sim') {
        btnsContainer.style.display = 'none';
        dialogText.innerText = "SQUIRTLE! 🐢💙 (Isso é um sim maravilhoso!)";
        const numero = "5511988975727"; // TROQUE AQUI
        const msg = encodeURIComponent("Eu aceito o convite da Gangue Squirtle! 🐢😊");
        whatsappBtn.href = `https://wa.me/${numero}?text=${msg}`;
        setTimeout(() => { whatsappBtn.classList.remove('dialog-hidden'); }, 1200);
    } 
    else if (tipo === 'nao') {
        if (window.clicksNao === 0) {
            mostrarDialogo("Disseram: o Não você já tem, vamos atrás do que nojo kkkkkkkkkkkkkk");
            btnNao.innerText = "Que nojo!";
            window.clicksNao++;
        } else {
            btnsContainer.style.display = 'none';
            dialogText.innerText = "A Gangue Squirtle respeita sua escolha... nos vemos por aí!";
            setTimeout(() => location.reload(), 5000);
        }
    }
}