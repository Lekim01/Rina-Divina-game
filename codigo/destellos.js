/* Riña Divina — [Nuevo] DESTELLOS EN PIXEL ART
   Los mismos destellos en cruz de la novela (los del corazón de Reki en los
   títulos de capítulo): parpadean a saltos, sin suavizar.
   - (La carta seleccionada ya no lleva destellos: ahora una burbuja negra
     encima, ver pixelart.js.)
   - Rayas de las cartas shiny (--rayas-shiny): las mismas rayas en pixel art de
     los títulos de capítulo de la novela, en la parte de arriba de la carta.
   - estallidoDestellos(elemento, colores): estallido de destellos y anillo de
     píxeles alrededor de un elemento (Colocación Destinada, hito conseguido).
   - destinadaActivada(): el momento de elegir la pareja de la Colocación Destinada.
   - destinadaRivalActivada(): lo mismo cuando la usa la IA (junto a su mano). */
const DESTELLOS_PAL = {
  shiny: ['#ffffff', '#ffd6d6', '#ff8a8a'],
  oro:   ['#ffffff', '#ffe9a6', '#e8b64c'],
  rojo:  ['#ffffff', '#ffc4c0', '#e04a44'],
};
// marco: 50×70 con la carta ocupando el centro (margen de 5): los destellos solo en el margen
function destellosMarco(pal){
  const W = 50, H = 70, F = 4, c = document.createElement('canvas');
  c.width = W * F; c.height = H;
  const x = c.getContext('2d');
  const P = [[2, 3], [17, 1], [33, 2], [48, 5], [47, 24], [48, 44], [47, 63], [31, 68], [14, 67], [1, 60], [2, 38], [3, 17]];
  const cruz = (i, j, grande, col, centro) => {
    x.fillStyle = col; x.fillRect(i - 1, j, 3, 1); x.fillRect(i, j - 1, 1, 3);
    if (grande){ x.fillRect(i - 2, j, 5, 1); x.fillRect(i, j - 2, 1, 5); }
    x.fillStyle = centro; x.fillRect(i, j, 1, 1);
  };
  for (let f = 0; f < F; f++){
    x.save(); x.beginPath(); x.rect(f * W, 0, W, H); x.rect(f * W + 5, 5, W - 10, H - 10); x.clip('evenodd');   // nunca encima de la carta
    P.forEach(([i, j], k) => {
      const fase = (f + k) % 4, ox = f * W;
      if (fase === 0) cruz(ox + i, j, true, pal[1], pal[0]);
      else if (fase === 1) cruz(ox + i, j, false, pal[2], pal[1]);
    });
    x.restore();
  }
  return c.toDataURL();
}
// las rayas de los títulos de capítulo de la novela (5 mechones gruesos con la punta redondeada)
function rayasShiny(tono = '#f4f2ee'){
  const mezcla = (hex, f, conBlanco) => { const n = parseInt(hex.slice(1), 16); const c = k => { const v = (n >> k) & 255; return Math.round(conBlanco ? v + (255 - v) * f : v * f); }; return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const ANCHO = 7, LARGOS = [30, 38, 44, 38, 30], HUECO = 22;   // [Cambiado] más separadas
  const c = document.createElement('canvas');
  c.width = LARGOS.length * ANCHO + (LARGOS.length - 1) * HUECO; c.height = Math.max(...LARGOS) + 1;
  const x = c.getContext('2d'), sombra = mezcla(tono, .68), brillo = mezcla(tono, .28, true);
  LARGOS.forEach((largo, k) => {
    const x0 = k * (ANCHO + HUECO);
    for (let y = 0; y < largo; y++){
      const recorte = y === largo - 1 ? 2 : y === largo - 2 ? 1 : 0;
      for (let i = recorte; i < ANCHO - recorte; i++){ x.fillStyle = i === recorte ? sombra : (i === 2 && y < largo - 3 ? brillo : tono); x.fillRect(x0 + i, y, 1, 1); }
    }
  });
  return c.toDataURL();
}
(function(){
  try {
    const r = document.documentElement.style;
    r.setProperty('--marco-oro', `url(${destellosMarco(DESTELLOS_PAL.oro)})`);
    r.setProperty('--marco-rojo', `url(${destellosMarco(DESTELLOS_PAL.rojo)})`);
    r.setProperty('--rayas-shiny', `url(${rayasShiny()})`);
  } catch (e) {}
})();

function estallidoDestellos(el, { colores = ['#ffe9a6', '#ffffff', '#ffd76a', '#c9b8ff'], ancho = 0, alto = 0, cantidad = 28, anillo = '255,233,166' } = {}){
  if (!el) return;
  const r = el.getBoundingClientRect(), P = 3;
  const W = ancho || Math.max(240, r.width + 140), H = alto || Math.max(180, r.height + 120);
  const cv = document.createElement('canvas'); cv.className = 'nivel-destellos';
  const cols = Math.ceil(W / P), filas = Math.ceil(H / P); cv.width = cols; cv.height = filas;
  Object.assign(cv.style, { left: (r.left + r.width / 2 - W / 2) + 'px', top: (r.top + r.height / 2 - H / 2) + 'px', width: W + 'px', height: H + 'px' });
  document.body.appendChild(cv);
  const x = cv.getContext('2d'), cx = cols / 2, cy = filas / 2;
  const chispas = Array.from({ length: cantidad }, () => {
    const a = Math.random() * Math.PI * 2, v = 16 + Math.random() * 38;
    return { x: cx + (Math.random() - .5) * r.width / P * .7, y: cy + (Math.random() - .5) * r.height / P * .5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10,
             col: colores[(Math.random() * colores.length) | 0], grande: Math.random() < .35, fase: Math.random() * 6, vida: .8 + Math.random() * .7 };
  });
  const cruz = (i, j, grande, col) => {
    x.fillStyle = col; x.fillRect(i, j, 1, 1); x.fillRect(i - 1, j, 3, 1); x.fillRect(i, j - 1, 1, 3);
    if (grande){ x.fillRect(i - 2, j, 5, 1); x.fillRect(i, j - 2, 1, 5); x.fillStyle = '#fff'; x.fillRect(i, j, 1, 1); }
  };
  const t0 = performance.now();
  (function paso(now){
    const t = (now - t0) / 1000;
    if (t > 1.6){ cv.remove(); return; }
    x.clearRect(0, 0, cols, filas);
    if (anillo && t < .7){
      const rr = 5 + t / .7 * Math.min(cx, cy) * 1.2, a = 1 - t / .7;
      x.fillStyle = `rgba(${anillo},${a})`;
      for (let k = 0; k < 80; k++){ const an = k / 80 * Math.PI * 2; x.fillRect(Math.round(cx + Math.cos(an) * rr), Math.round(cy + Math.sin(an) * rr * .7), 1, 1); }
    }
    chispas.forEach(c => {
      const f = Math.exp(-t * 2.2), a = 1 - t / c.vida; if (a <= 0) return;
      if (Math.sin(t * 22 + c.fase) < -.6) return;
      x.globalAlpha = a; cruz(Math.round(c.x + c.vx * (1 - f) / 2.2), Math.round(c.y + c.vy * (1 - f) / 2.2 + 6 * t * t), c.grande && t < .9, c.col);
    });
    x.globalAlpha = 1;
    requestAnimationFrame(paso);
  })(t0);
}

const DESTINADA_TXT = { es: 'Colocación Destinada', en: 'Destined Placement', ja: '運命配置' };
function destinadaActivada(){
  const cartas = document.querySelectorAll('#hand-cards .hand-card.selected, #hand-cards .hand-card.selected-destinada');
  cartas.forEach(c => estallidoDestellos(c, { colores: ['#ffffff', '#ffc4c0', '#e04a44', '#ffe9a6'], cantidad: 22, anillo: '224,74,68' }));
  // [Cambiado] el cartel justo encima de la mano del jugador
  const mano = document.getElementById('hand-cards'), r = mano && mano.getBoundingClientRect();
  const arriba = cartas.length ? Math.min(...[...cartas].map(c => c.getBoundingClientRect().top)) : (r ? r.top : innerHeight - 200);
  if (typeof ritmoCartel === 'function') ritmoCartel(DESTINADA_TXT[window.CURRENT_LANG] || DESTINADA_TXT.es, { ms: 1500, tipo: 'rc-destinada', y: Math.max(60, arriba - 34) });
}
function destinadaRivalActivada(){
  const mano = document.getElementById('ai-hidden-hand'), r = mano && mano.getBoundingClientRect();
  if (mano) estallidoDestellos(mano, { colores: ['#ffffff', '#ffc4c0', '#e04a44'], cantidad: 26, anillo: '224,74,68' });
  if (typeof ritmoCartel === 'function') ritmoCartel(DESTINADA_TXT[window.CURRENT_LANG] || DESTINADA_TXT.es, { ms: 1700, tipo: 'rc-destinada', y: r && r.height ? r.bottom + 34 : 170 });
  if (typeof playSound === 'function') playSound('colocDestinada');
}
