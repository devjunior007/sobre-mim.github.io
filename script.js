(function () {
  var root = document.documentElement;
  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Som (bipe curto, so depois de um clique) ---------- */
  var audio = null;
  function bipe(freq, duracao) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audio.createOscillator();
      var ganho = audio.createGain();
      osc.type = "square";
      osc.frequency.value = freq || 880;
      ganho.gain.value = 0.04;
      osc.connect(ganho);
      ganho.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + (duracao || 0.08));
    } catch (e) { /* sem som, sem problema */ }
  }

  /* ---------- Personagem em pixel art ---------- */
  // 0 = vazio, 1 = escuro, 2 = medio, 3 = claro
  var SPRITE = [
    "00001111110000",
    "00011111111000",
    "00111111111100",
    "00112333321100",
    "00123333332100",
    "00123133133100",
    "00123333332100",
    "00123313332100",
    "00012333321000",
    "00001222210000",
    "00011222211000",
    "00112222221100",
    "00122222222100",
    "00122000022100"
  ];
  var canvas = document.getElementById("sprite");
  var ctx = canvas.getContext("2d");

  function desenhar() {
    var estilo = getComputedStyle(root);
    var cores = {
      "1": estilo.getPropertyValue("--ink").trim(),
      "2": estilo.getPropertyValue("--mid").trim(),
      "3": estilo.getPropertyValue("--pop").trim()
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SPRITE.forEach(function (linha, y) {
      linha.split("").forEach(function (c, x) {
        if (c === "0") return;
        ctx.fillStyle = cores[c];
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }

  canvas.addEventListener("click", function () {
    canvas.classList.remove("pula");
    void canvas.offsetWidth;
    canvas.classList.add("pula");
    bipe(660, 0.1);
    setTimeout(function () { bipe(990, 0.12); }, 100);
  });

  /* ---------- Tema claro/escuro ---------- */
  var botaoTema = document.getElementById("tema");

  function escuro() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function atualizarBotaoTema() {
    var e = escuro();
    botaoTema.setAttribute("aria-pressed", String(e));
    botaoTema.textContent = e ? "TEMA: ESCURO" : "TEMA: CLARO";
  }

  try {
    var salvo = localStorage.getItem("tema-bio");
    if (salvo === "dark" || salvo === "light") root.setAttribute("data-theme", salvo);
  } catch (e) { /* sem armazenamento */ }

  botaoTema.addEventListener("click", function () {
    var novo = escuro() ? "light" : "dark";
    root.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema-bio", novo); } catch (e) {}
    atualizarBotaoTema();
    desenhar();
    bipe(520, 0.07);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    atualizarBotaoTema();
    desenhar();
  });

  atualizarBotaoTema();
  desenhar();

  /* ---------- Moedas ---------- */
  var moedas = 0;
  var contador = document.getElementById("moedas");
  document.getElementById("moeda").addEventListener("click", function () {
    moedas = Math.min(moedas + 1, 999);
    contador.textContent = String(moedas).padStart(3, "0");
    bipe(1175, 0.06);
    setTimeout(function () { bipe(1568, 0.1); }, 60);
  });

  /* ---------- Digitando as frases ---------- */
  var frases = [
    "estudo no IFSC",
    "programo em HTML, CSS e JavaScript",
    "jogo jogos retrô",
    "crio conteúdo"
  ];
  var alvo = document.getElementById("digitando");
  var i = 0;

  if (reduzMovimento) {
    setInterval(function () {
      i = (i + 1) % frases.length;
      alvo.textContent = frases[i];
    }, 3000);
  } else {
    var pos = frases[0].length;
    var apagando = false;
    (function passo() {
      var frase = frases[i];
      if (!apagando) {
        pos++;
        alvo.textContent = frase.slice(0, pos);
        if (pos >= frase.length) { apagando = true; return setTimeout(passo, 1600); }
        return setTimeout(passo, 70);
      }
      pos--;
      alvo.textContent = frase.slice(0, pos);
      if (pos <= 0) { apagando = false; i = (i + 1) % frases.length; return setTimeout(passo, 300); }
      setTimeout(passo, 35);
    })();
    // comeca apagando a primeira frase depois de uma pausa
    // (o texto inicial ja esta visivel no HTML)
  }

  /* ---------- Links ainda sem endereco ---------- */
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); bipe(220, 0.15); });
  });
})();
