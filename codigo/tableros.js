/* Riña Divina — [Nuevo] TABLEROS
   Varios tableros en pixel art. Cada partida sale uno al azar (o el que se
   elija en Opciones → Tablero):
   - Clásico: el de siempre, oscuro.
   - Trono: alfombra roja de terciopelo, marco dorado y huecos de tela dorada.
   - Prado: césped, huecos de tierra, piedras y flores, y un árbol en la
     esquina cuya sombra (por encima del tablero) se mueve con el viento; de
     vez en cuando pasa una ráfaga, como en el minijuego del erizo.
   Todo se pinta al cargar con <canvas> (no hay imágenes nuevas que guardar).
   En Opciones también se elige cómo funcionan los efectos de espacio
   (Realidades que tiñen los espacios, o los clásicos al azar; ver espacios.js). */
const TABLEROS = ['clasico', 'trono', 'prado'];
const TAB_TXT = {
  es: { tablero: 'Tablero', azar: 'Al azar (Trono o Prado)', clasico: 'Clásico (sin tablero)', trono: 'Trono', prado: 'Prado',
        espacios: 'Efectos de espacio (desde la próxima partida)', realidades: 'Realidades', clasicos: 'Clásicos al azar' },
  en: { tablero: 'Board', azar: 'Random (Throne or Meadow)', clasico: 'Classic (no board)', trono: 'Throne', prado: 'Meadow',
        espacios: 'Space effects (from the next match)', realidades: 'Realities', clasicos: 'Classic, random' },
  ja: { tablero: 'ボード', azar: 'ランダム（玉座か草原）', clasico: 'クラシック（ボードなし）', trono: '玉座', prado: '草原',
        espacios: '空間の効果（次の対戦から）', realidades: '現実', clasicos: 'クラシック（ランダム）' },
};
function tabT(k){ return (TAB_TXT[window.CURRENT_LANG] || TAB_TXT.es)[k] || TAB_TXT.es[k]; }
OPTIONS.tablero  = (typeof _savedOptions !== 'undefined' && _savedOptions.tablero)  || 'azar';
OPTIONS.espacios = (typeof _savedOptions !== 'undefined' && _savedOptions.espacios) || 'realidades';

/* ---------- utilidades de pixel art (baldosas con ruido suave, como las del minijuego) ---------- */
function tabBaldosa(w, h, semilla){
  let s = semilla;
  const M = new Array(w * h).fill(null);
  const B = {
    w, h,
    rnd(){ s = (s * 16807) % 2147483647; return s / 2147483647; },
    set(i, j, c){ i = Math.floor(i); j = Math.floor(j); M[((j % h + h) % h) * w + ((i % w + w) % w)] = c; },
    elipse(cx, cy, rx, ry, color){
      for (let j = Math.floor(cy - ry) - 1; j <= Math.ceil(cy + ry) + 1; j++)
        for (let i = Math.floor(cx - rx) - 1; i <= Math.ceil(cx + rx) + 1; i++){
          const dx = (i + .5 - cx) / rx, dy = (j + .5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) B.set(i, j, typeof color === 'function' ? color(i, j, dx, dy) : color);
        }
    },
    ruido(g){
      const nx = Math.ceil(w / g), ny = Math.ceil(h / g), red = Array.from({ length: nx * ny }, () => B.rnd());
      const v = (a, b) => red[((b % ny + ny) % ny) * nx + ((a % nx + nx) % nx)];
      const liso = t => t * t * (3 - 2 * t);
      return (i, j) => {
        const x = i / g, y = j / g, x0 = Math.floor(x), y0 = Math.floor(y), fx = liso(x - x0), fy = liso(y - y0);
        const a = v(x0, y0) + (v(x0 + 1, y0) - v(x0, y0)) * fx, b = v(x0, y0 + 1) + (v(x0 + 1, y0 + 1) - v(x0, y0 + 1)) * fx;
        return a + (b - a) * fy;
      };
    },
    lienzo(){
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d');
      M.forEach((col, k) => { if (col){ x.fillStyle = col; x.fillRect(k % w, Math.floor(k / w), 1, 1); } });
      return c;
    }
  };
  return B;
}

/* ================= TRONO ================= */
function tabTerciopelo(){   // alfombra roja con un damasco de rombos muy suave
  const B = tabBaldosa(32, 32, 7), r = B.ruido(8);
  for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++){
    const v = r(i, j) + (B.rnd() - .5) * .22;
    B.set(i, j, v < .3 ? '#7a1814' : v < .7 ? '#861b16' : '#921f19');
  }
  for (let k = 0; k < 16; k++){   // rombo del damasco
    const a = k, b = 15 - k;
    [[16 + a, 16 - b], [16 - a, 16 - b], [16 + a, 16 + b], [16 - a, 16 + b]].forEach(([i, j]) => B.set(i, j, '#6f1512'));
  }
  B.elipse(16, 16, 2.2, 2.2, '#9c241d'); B.set(16, 16, '#b0302a');
  for (let k = 0; k < 30; k++) B.set(B.rnd() * 32, B.rnd() * 32, '#a3281f');   // brillo del pelo
  return B.lienzo();
}
function tabTelaDorada(){   // la tela dorada de los huecos, con ondas
  const B = tabBaldosa(24, 36, 19), r = B.ruido(6);
  for (let j = 0; j < 36; j++) for (let i = 0; i < 24; i++){
    const onda = Math.sin((i * .38) + j * .52) + Math.sin(i * .21 - j * .31) * .6 + (r(i, j) - .5) * 1.2;
    B.set(i, j, onda > 1.05 ? '#ffe689' : onda > .35 ? '#f7cc3a' : onda > -.6 ? '#eab62a' : '#d19a1c');
  }
  return B.lienzo();
}
function tabMarcoDorado(){   // 9-slice de 18×18 (6 px por lado) para border-image
  const c = document.createElement('canvas'); c.width = c.height = 18; const x = c.getContext('2d');
  const P = (col, i, j, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(i, j, w, h); };
  // banda dorada de 6 px: sombra por fuera, oro, brillo, oro, línea oscura por dentro
  const capas = ['#5a3a08', '#c08a1c', '#ffe27a', '#e3aa2c', '#b37a14', '#2a1a04'];
  capas.forEach((col, k) => {
    P(col, k, k, 18 - 2 * k, 1); P(col, k, 17 - k, 18 - 2 * k, 1);
    P(col, k, k, 1, 18 - 2 * k); P(col, 17 - k, k, 1, 18 - 2 * k);
  });
  // esquinas redondeadas (se quita el píxel de fuera y se suaviza)
  [[0, 0], [17, 0], [0, 17], [17, 17]].forEach(([i, j]) => x.clearRect(i, j, 1, 1));
  [[1, 0], [0, 1], [16, 0], [17, 1], [0, 16], [1, 17], [17, 16], [16, 17]].forEach(([i, j]) => { x.clearRect(i, j, 1, 1); P('#5a3a08', i, j); });
  // tachuelas en las esquinas
  [[2, 2], [14, 2], [2, 14], [14, 14]].forEach(([i, j]) => { P('#fff3b8', i, j, 2, 2); P('#8a5a10', i + 1, j + 1); });
  return c;
}
/* ================= PRADO ================= */
function tabCesped(){
  const B = tabBaldosa(32, 32, 11), r = B.ruido(8);
  for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++){ const v = r(i, j) + B.rnd() * .18; B.set(i, j, v < .42 ? '#357a2f' : v < .8 ? '#3f8a36' : '#48963c'); }
  for (let k = 0; k < 46; k++){ const i = Math.floor(B.rnd() * 32), j = Math.floor(B.rnd() * 32); B.set(i, j, '#5cad48'); B.set(i, j + 1, '#4c9c3f'); B.set(i, j + 2, '#2d6b28'); }
  return B.lienzo();
}
function tabTierra(){
  const B = tabBaldosa(24, 36, 41), r = B.ruido(6);
  for (let j = 0; j < 36; j++) for (let i = 0; i < 24; i++){ const v = r(i, j) + (B.rnd() - .5) * .35; B.set(i, j, v < .35 ? '#8a6038' : v < .72 ? '#9a6d41' : '#a97b4b'); }
  for (let k = 0; k < 8; k++){
    const i = Math.floor(B.rnd() * 22) + 1, j = Math.floor(B.rnd() * 34) + 1, grande = B.rnd() < .4;
    B.set(i, j, '#a39684'); B.set(i + 1, j, '#8d8170'); if (grande){ B.set(i, j + 1, '#8d8170'); B.set(i + 1, j + 1, '#77695a'); B.set(i, j, '#c4b8a6'); }
    B.set(i, j + (grande ? 2 : 1), '#6e4c2a');
  }
  return B.lienzo();
}
/* piedras, flores y matas repartidas por el prado (en un lienzo del tamaño de la pantalla / 3) */
function tabDecoPrado(w, h, semilla){
  const B = tabBaldosa(w, h, semilla);
  const piedra = (x, y, g) => {
    B.elipse(x + 1.2, y + 1.4, g, g * .7, '#24521f');   // sombra
    B.elipse(x, y, g, g * .72, (i, j, dx, dy) => (dx + dy) < -.7 ? '#d4d0c6' : (dx + dy) < .3 ? '#aaa597' : (dx + dy) < .9 ? '#8a8578' : '#6d695e');
  };
  const flor = (x, y, col) => { [[0, -1], [-1, 0], [1, 0], [0, 1]].forEach(([a, b]) => B.set(x + a, y + b, col)); B.set(x, y, '#ffe36a'); B.set(x, y + 2, '#2d6b28'); };
  const mata = (x, y) => [[0, 0], [-1, -1], [-2, -2], [1, -1], [2, -2], [0, -2], [0, -3]].forEach(([a, b], n) => B.set(x + a, y + b, n % 2 ? '#5cad48' : '#2f6628'));
  const n = Math.round(w * h / 900);
  for (let k = 0; k < n; k++){
    const x = B.rnd() * w, y = B.rnd() * h, t = B.rnd();
    if (t < .16) piedra(x, y, 2 + B.rnd() * 3.5);
    else if (t < .42) flor(x, y, ['#ffffff', '#f2a6c8', '#b9a4ff', '#ffd05a'][Math.floor(B.rnd() * 4)]);
    else mata(x, y);
  }
  return B.lienzo();
}
/* copa del árbol (en la esquina) y su sombra moteada, que se mueve con el viento */
function tabCopa(R, semilla){
  const S = R * 2 + 4, B = tabBaldosa(S, S, semilla);
  const c = S / 2, bolas = [];
  for (let k = 0; k < 16; k++){ const a = B.rnd() * 6.28, d = B.rnd() * R * .55; bolas.push([c + Math.cos(a) * d, c + Math.sin(a) * d, R * (.32 + B.rnd() * .2)]); }
  bolas.forEach(([x, y, r]) => B.elipse(x, y, r, r, '#1d4a1a'));
  bolas.forEach(([x, y, r]) => B.elipse(x, y, r - 1, r - 1, (i, j, dx, dy) => (dx + dy) < -.8 ? '#6ab54f' : (dx + dy) < 0 ? '#4c9a3c' : (dx + dy) < .8 ? '#3a7f31' : '#2b6526'));
  for (let k = 0; k < R * 5; k++){ const a = B.rnd() * 6.28, d = B.rnd() * R * .8; B.set(c + Math.cos(a) * d, c + Math.sin(a) * d, B.rnd() < .5 ? '#7cc05a' : '#23551f'); }
  return B.lienzo();
}
function tabSombraArbol(R, semilla, fase){
  const S = R * 2 + 4, B = tabBaldosa(S, S, semilla);
  const c = S / 2;
  const sombra = 'rgba(8,28,10,.42)';
  for (let k = 0; k < 18; k++){ const a = B.rnd() * 6.28, d = B.rnd() * R * .6; B.elipse(c + Math.cos(a) * d, c + Math.sin(a) * d, R * (.3 + B.rnd() * .2), R * (.3 + B.rnd() * .2), sombra); }
  // huecos de luz entre las hojas: cambian un poco con cada «fase» (parpadean con el viento)
  let s2 = semilla * 31 + fase * 7 + 1; const rnd = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
  const lienzo = B.lienzo(), x = lienzo.getContext('2d');
  x.globalCompositeOperation = 'destination-out';
  for (let k = 0; k < R * 1.1; k++){
    const a = rnd() * 6.28, d = rnd() * R * .75, tam = 1 + Math.floor(rnd() * 2.2);
    x.fillRect(Math.round(c + Math.cos(a) * d), Math.round(c + Math.sin(a) * d), tam, tam);
  }
  return lienzo;
}

/* ================= aplicar ================= */
const TAB = { actual: 'clasico', texturas: null, capa: null, animSombra: null };
function tabTexturas(){
  if (TAB.texturas) return TAB.texturas;
  return TAB.texturas = {
    terciopelo: tabTerciopelo().toDataURL(), tela: tabTelaDorada().toDataURL(), marco: tabMarcoDorado().toDataURL(),
    cesped: tabCesped().toDataURL(), tierra: tabTierra().toDataURL(),
  };
}
function tabCapa(){
  if (TAB.capa) return TAB.capa;
  const c = document.createElement('div'); c.id = 'tablero-fondo'; c.setAttribute('aria-hidden', 'true');
  const juego = document.getElementById('screen-game') || document.body;   // [Cambio] dentro de la partida (con la sombra y la copa), para que se mezclen bien
  juego.insertBefore(c, juego.firstChild);
  return TAB.capa = c;
}
function tabPintar(){
  const capa = tabCapa(), tex = tabTexturas(), raiz = document.documentElement.style;
  clearInterval(TAB.animSombra); TAB.animSombra = null;
  capa.innerHTML = ''; capa.className = 'tab-' + TAB.actual;
  if (TAB.sombraCapa){ TAB.sombraCapa.remove(); TAB.sombraCapa = null; }
  if (TAB.copaCapa){ TAB.copaCapa.remove(); TAB.copaCapa = null; }
  tabVientoParar();
  TABLEROS.forEach(t => document.body.classList.remove('tablero-' + t));
  document.body.classList.add('tablero-' + TAB.actual);
  raiz.setProperty('--tab-tela', `url(${tex.tela})`);
  raiz.setProperty('--tab-tierra', `url(${tex.tierra})`);
  if (TAB.actual === 'trono'){
    capa.style.backgroundImage = `url(${tex.terciopelo})`;
    const marco = document.createElement('div'); marco.className = 'tab-marco';
    marco.style.borderImageSource = `url(${tex.marco})`;
    const vi = document.createElement('div'); vi.className = 'tab-vineta';
    capa.append(vi, marco);
  } else if (TAB.actual === 'prado'){
    capa.style.backgroundImage = `url(${tex.cesped})`;
    // [Cambio] la decoración se pinta una vez por partida, más grande que cualquier pantalla,
    // y no se repinta al cambiar el tamaño de la ventana (antes cambiaba de sitio)
    const semilla = TAB.semilla, izq = TAB.izq;
    const deco = tabDecoPrado(900, 560, semilla); deco.className = 'tab-deco'; deco.style.width = '2700px'; deco.style.height = '1680px'; capa.appendChild(deco);
    const R = 46;
    const copa = document.createElement('img'); copa.className = 'tab-copa' + (izq ? ' izq' : ' der'); copa.src = tabCopa(R, semilla).toDataURL(); copa.alt = '';
    // la sombra del árbol va POR ENCIMA del tablero (huecos y cartas), sin tapar los clics
    const sc = document.createElement('div'); sc.id = 'tablero-sombra'; sc.setAttribute('aria-hidden', 'true');
    const sombraCaja = document.createElement('div'); sombraCaja.className = 'tab-sombra' + (izq ? ' izq' : ' der');
    const fases = [0, 1, 2, 3].map(f => tabSombraArbol(R, semilla, f).toDataURL());
    const sombra = document.createElement('img'); sombra.src = fases[0]; sombra.alt = '';
    sombraCaja.appendChild(sombra); sc.appendChild(sombraCaja);
    (document.getElementById('screen-game') || document.body).appendChild(sc); TAB.sombraCapa = sc;   // [Cambio] dentro de la partida: así queda por debajo de la mano y del menú
    // [Cambio] la copa, por encima de su propia sombra (y de alguna esquinita de carta)
    const cc = document.createElement('div'); cc.id = 'tablero-copa'; cc.setAttribute('aria-hidden', 'true');
    cc.appendChild(copa); (document.getElementById('screen-game') || document.body).appendChild(cc); TAB.copaCapa = cc;
    let f = 0;
    TAB.animSombra = setInterval(() => { if (document.hidden) return; f = (f + 1) % fases.length; sombra.src = fases[f]; }, 650);
    tabVientoEmpezar();
  } else {
    capa.style.backgroundImage = '';
  }
  tabVisible();
}
function tabVisible(){
  const juego = document.getElementById('screen-game');
  const en = !!(juego && juego.classList.contains('active'));
  if (TAB.capa) TAB.capa.style.display = en && TAB.actual !== 'clasico' ? '' : 'none';
  if (TAB.sombraCapa) TAB.sombraCapa.style.display = en ? '' : 'none';
  if (TAB.copaCapa) TAB.copaCapa.style.display = en ? '' : 'none';
  if (TAB.vientoLienzo) TAB.vientoLienzo.style.display = en ? '' : 'none';
  document.body.classList.toggle('tablero-en-juego', en);
}
function tabElegir(){
  const o = OPTIONS.tablero || 'azar';
  // [Cambiado] «al azar» solo elige entre los tableros visuales; «Clásico» (sin tablero) solo si el jugador lo elige
  const visuales = TABLEROS.filter(t => t !== 'clasico');
  TAB.actual = o === 'azar' ? visuales[Math.floor(Math.random() * visuales.length)] : (TABLEROS.includes(o) ? o : 'clasico');
  TAB.semilla = 1 + Math.floor(Math.random() * 90000); TAB.izq = Math.random() < .5;
  TAB.vientoAng = (Math.random() < .5 ? 0 : Math.PI) + (Math.random() - .5) * .5;   // sopla de lado, un poco inclinado
  tabPintar();
}

/* ---------- viento del prado: de vez en cuando pasa una ráfaga (como en el minijuego del erizo, más suave) ---------- */
const TAB_VIENTO = { cadaMs: [9000, 16000], rafagaMs: 2200, px: 3 };
function tabVientoEmpezar(){
  if (!TAB.vientoLienzo){
    const c = document.createElement('canvas'); c.id = 'tablero-viento'; c.setAttribute('aria-hidden', 'true');
    (document.getElementById('screen-game') || document.body).appendChild(c); TAB.vientoLienzo = c;
  }
  const prox = () => TAB_VIENTO.cadaMs[0] + Math.random() * (TAB_VIENTO.cadaMs[1] - TAB_VIENTO.cadaMs[0]);
  const siguiente = () => { TAB.vientoT = setTimeout(() => { tabRafaga(); siguiente(); }, prox()); };
  TAB.vientoT = setTimeout(() => { tabRafaga(); siguiente(); }, 3500);
}
function tabVientoParar(){
  clearTimeout(TAB.vientoT); cancelAnimationFrame(TAB.vientoRaf);
  if (TAB.vientoLienzo){ TAB.vientoLienzo.remove(); TAB.vientoLienzo = null; }
  document.body.classList.remove('tab-rafaga');
}
let TAB_SONIDO_VIENTO = null;
function tabRafaga(){
  const c = TAB.vientoLienzo; if (!c || document.hidden || c.style.display === 'none') return;
  const p = TAB_VIENTO.px, W = Math.ceil(innerWidth / p), H = Math.ceil(innerHeight / p);
  c.width = W; c.height = H;
  const x = c.getContext('2d'), ux = Math.cos(TAB.vientoAng), uy = Math.sin(TAB.vientoAng);
  const lineas = Array.from({ length: Math.round(8 + W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, largo: 14 + Math.random() * 22, vel: 90 + Math.random() * 70, fase: Math.random() }));
  const t0 = performance.now(), total = TAB_VIENTO.rafagaMs;
  document.body.classList.add('tab-rafaga');
  try {
    if (!TAB_SONIDO_VIENTO) TAB_SONIDO_VIENTO = new Audio('./viento-rafaga.mp3');
    TAB_SONIDO_VIENTO.currentTime = 0; TAB_SONIDO_VIENTO.volume = Math.min(1, (OPTIONS.sfxVolume ?? .55) * .35);
    TAB_SONIDO_VIENTO.play().catch(() => {});
  } catch (e) {}
  const paso = ahora => {
    const t = ahora - t0;
    x.clearRect(0, 0, W, H);
    if (t > total){ document.body.classList.remove('tab-rafaga'); return; }
    const entra = Math.min(1, t / 400), sale = Math.min(1, (total - t) / 500);
    x.fillStyle = '#f4f1ea';
    lineas.forEach(l => {
      const av = (t / 1000) * l.vel, cx = ((l.x + ux * av) % W + W) % W, cy = ((l.y + uy * av) % H + H) % H;
      for (let k = 0; k < l.largo; k++){
        x.globalAlpha = .5 * entra * sale * (.65 + .35 * Math.sin(t / 120 + l.fase * 6)) * (1 - k / l.largo * .8);
        x.fillRect(Math.round(cx - ux * k), Math.round(cy - uy * k + Math.sin(k * .18 + l.fase * 9) * 2), 1, 1);
      }
    });
    TAB.vientoRaf = requestAnimationFrame(paso);
  };
  TAB.vientoRaf = requestAnimationFrame(paso);
}

/* cada partida nueva: un tablero (al azar o el elegido) */
(function(){
  if (typeof startGame !== 'function') return;
  const original = startGame;
  window.startGame = function(){ tabElegir(); return original.apply(this, arguments); };
  const juego = document.getElementById('screen-game');
  if (juego) new MutationObserver(tabVisible).observe(juego, { attributes: true, attributeFilter: ['class'] });
})();

/* ---------- Opciones: Tablero y Efectos de espacio ---------- */
(function(){
  const pasoBtn = document.getElementById('opt-paso-btn');
  const filaPaso = pasoBtn && pasoBtn.closest('.option-row');
  if (!filaPaso) return;
  const fila = (id, onclick) => {
    const d = document.createElement('div'); d.className = 'option-row';
    d.innerHTML = `<label id="${id}-label"></label><button id="${id}-btn" class="opt-toggle on" type="button"></button>`;
    d.querySelector('button').addEventListener('click', onclick);
    return d;
  };
  const ordenTab = ['azar', ...TABLEROS];
  const fTab = fila('opt-tablero', () => {
    OPTIONS.tablero = ordenTab[(ordenTab.indexOf(OPTIONS.tablero) + 1) % ordenTab.length];
    saveOptions(); pintarOpciones();
    // en mitad de una partida se ve al momento (con «al azar», sale otro distinto)
    const juego = document.getElementById('screen-game');
    if (juego && juego.classList.contains('active')) tabElegir();
  });
  const fEsp = fila('opt-espacios', () => {
    OPTIONS.espacios = OPTIONS.espacios === 'realidades' ? 'clasicos' : 'realidades';
    saveOptions(); pintarOpciones();
  });
  filaPaso.after(fTab);   // [Cambiado] ya no hay efectos de espacio clásicos: siempre Realidades
  function pintarOpciones(){
    document.getElementById('opt-tablero-label').textContent = tabT('tablero');
    document.getElementById('opt-tablero-btn').textContent = tabT(OPTIONS.tablero);

  }
  pintarOpciones();
  // al cambiar de idioma
  if (typeof applyTranslations === 'function'){
    const orig = applyTranslations;
    window.applyTranslations = function(){ const r = orig.apply(this, arguments); try { pintarOpciones(); } catch (e) {} return r; };
  }
})();
