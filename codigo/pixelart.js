/* Riña Divina — [Nuevo] PIXEL ART DE LA INTERFAZ
   - Erizo de peluche de púas rojas (el de los capítulos de la novela) como
     icono de la Colocación Destinada: encendido si está disponible, apagado
     si no. También el del rival, arriba a la izquierda.
   - Burbuja negra de la Existencia flotando sobre la carta seleccionada
     (roja sobre la segunda carta de la Colocación Destinada).
   - Iconos de tipo: Existir (infinito), Revelar (estallido), Especial (gema).
   - Puntuación de cada espacio con cifras en pixel art.
   - Robar carta: vuela en arco desde el mazo, girando y dándose la vuelta.
   - Botón de historial a mano, abajo a la izquierda. */
function pxLienzo(filas, pal, escala = 1){
  const h = filas.length, w = Math.max(...filas.map(f => f.length));
  const c = document.createElement('canvas'); c.width = w * escala; c.height = h * escala;
  const x = c.getContext('2d');
  filas.forEach((f, j) => [...f].forEach((ch, i) => { const col = pal[ch]; if (col){ x.fillStyle = col; x.fillRect(i * escala, j * escala, escala, escala); } }));
  return c;
}
function pxEspejo(c){ const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const x = o.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return o; }

/* ---- erizo de púas rojas (14×9), el de las pantallas de capítulo de la novela ---- */
const PX_ERIZO = ['...R..R..R....','..RrRRrRRrR...','.RrRrRrRrRrW..','RrRrRrRrRrWWW.','.RrRrRrRrWWKWW','RrRrRrRrWWWWWN','.RrRrRrRWWWWW.','..RRRRRWWWWW..','...WW...WW....'];
const PX_ERIZO_PAL = { R:'#6e1f1f', r:'#a83434', W:'#f1e4d6', K:'#141214', N:'#3a2a2a' };
const PX_ERIZO_APAGADO = { R:'#34303a', r:'#4a4552', W:'#6e6a74', K:'#141214', N:'#2a2830' };

/* ---- esfera (burbuja) 16×16, como las gotas del minijuego ---- */
function pxEsfera(color, claro){
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), mez = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const C = hex(color), L = hex(claro), N = [8, 7, 12], B = [255, 255, 255];
  const pal = { cuerpo: C, sombra: mez(C, N, .38), reflejo: mez(C, L, .4), borde: mez(C, N, .62), brillo: L, brillo2: mez(L, B, .65) };
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'), R = 7.1;
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++){
    const dx = (i + .5 - 8) / R, dy = (j + .5 - 8) / R, r = Math.hypot(dx, dy); if (r > 1) continue;
    let col = r > 1 - 1.1 / R ? pal.borde : (-dx * .55 + dy * .85) > .55 ? pal.reflejo : (dx * .8 + dy * .2) > .38 ? pal.sombra : pal.cuerpo;
    const hx = dx + .42, hy = dy + .45, q = hx * hx + hy * hy; if (q < .07) col = pal.brillo; if (q < .018) col = pal.brillo2;
    x.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; x.fillRect(i, j, 1, 1);
  }
  return c;
}

/* ---- iconos de tipo ---- */
const PX_TIPOS = {
  exist:   { filas: ['.##...##.', '#..#.#..#', '#...#...#', '#..#.#..#', '.##...##.'], pal: { '#': '#c9a2ff' } },
  reveal:  { filas: ['#..#..#', '.#.#.#.', '..#o#..', '##ooo##', '..#o#..', '.#.#.#.', '#..#..#'], pal: { '#': '#8fd0ff', o: '#ffffff' } },
  special: { filas: ['...#...', '..#o#..', '.#ooo#.', '#ooooo#', '.#ooo#.', '..#o#..', '...#...'], pal: { '#': '#ff9a62', o: '#ffd9bf' } },
  // [Nuevo] Realidad: una esfera (en cada carta, del color de su Realidad; ver buildCardFace más abajo)
  realidad: { filas: ['..###..', '.#oo##.', '#oo####', '#o#####', '#######', '.#####.', '..###..'], pal: { '#': '#b9a2e8', o: '#f1eaff' } },
};
const PX_TIPO_URL = {};

/* ---- cifras 3×5 con contorno ---- */
const PX_CIFRAS = { 0:['.n.','n.n','n.n','n.n','.n.'], 1:['.n.','nn.','.n.','.n.','nnn'], 2:['nn.','..n','.n.','n..','nnn'], 3:['nn.','..n','.n.','..n','nn.'],
  4:['n.n','n.n','nnn','..n','..n'], 5:['nnn','n..','nn.','..n','nn.'], 6:['.nn','n..','nn.','n.n','.n.'], 7:['nnn','..n','.n.','.n.','.n.'],
  8:['.n.','n.n','.n.','n.n','.n.'], 9:['.n.','n.n','.nn','..n','nn.'], '-':['...','...','nnn','...','...'] };
const PX_NUM_CACHE = {};
function pxNumero(texto, color, brillo){
  const k = texto + color + brillo; if (PX_NUM_CACHE[k]) return PX_NUM_CACHE[k];
  const chars = [...String(texto)].filter(ch => PX_CIFRAS[ch]);
  const w = chars.length * 4 - 1 + 2, h = 7, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const puntos = [];
  chars.forEach((ch, k2) => PX_CIFRAS[ch].forEach((f, j) => [...f].forEach((p, i) => { if (p === 'n') puntos.push([1 + k2 * 4 + i, 1 + j]); })));
  x.fillStyle = '#07070e';   // contorno
  puntos.forEach(([i, j]) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) x.fillRect(i + a, j + b, 1, 1); });
  puntos.forEach(([i, j]) => { x.fillStyle = j === 1 ? brillo : color; x.fillRect(i, j, 1, 1); });   // la fila de arriba, más clara
  return PX_NUM_CACHE[k] = c.toDataURL();
}
function puntuacionPixel(sr){
  sr.querySelectorAll('.score-p1, .score-p2').forEach(sp => {
    const t = sp.textContent.trim(); if (!/^-?\d+$/.test(t)) return;
    const p1 = sp.classList.contains('score-p1');
    const gana = sp.classList.contains('score-winner') || !!sp.closest(p1 ? '.winning-p1' : '.winning-p2');
    const color = p1 ? (gana ? '#7fb4ff' : '#4f79b8') : (gana ? '#ff7a70' : '#b8534d');
    const brillo = p1 ? (gana ? '#d6e6ff' : '#86a8d8') : (gana ? '#ffd0cc' : '#d98a84');
    const img = document.createElement('img'); img.className = 'px-num' + (gana ? ' gana' : ''); img.alt = t; img.src = pxNumero(t, color, brillo);
    sp.textContent = ''; sp.appendChild(img);
  });
}

(function(){
  // iconos de tipo (como URL, para poder ponerlos en el HTML de typeLabel)
  Object.keys(PX_TIPOS).forEach(k => { PX_TIPO_URL[k] = pxLienzo(PX_TIPOS[k].filas, PX_TIPOS[k].pal).toDataURL(); });
  const r = document.documentElement.style;
  r.setProperty('--burbuja-negra', `url(${pxEsfera('#0c0a14', '#6c6590').toDataURL()})`);
  r.setProperty('--burbuja-roja', `url(${pxEsfera('#b0302a', '#e07068').toDataURL()})`);
  // erizos de la Colocación Destinada (tuyo y del rival, mirando hacia dentro)
  const on = pxLienzo(PX_ERIZO, PX_ERIZO_PAL).toDataURL(), off = pxLienzo(PX_ERIZO, PX_ERIZO_APAGADO).toDataURL();
  const onR = pxEspejo(pxLienzo(PX_ERIZO, PX_ERIZO_PAL)).toDataURL(), offR = pxEspejo(pxLienzo(PX_ERIZO, PX_ERIZO_APAGADO)).toDataURL();
  const tuyo = document.getElementById('destinada-indicator');
  if (tuyo){ tuyo.innerHTML = `<img class="erizo-dest on" src="${on}" alt=""><img class="erizo-dest off" src="${off}" alt="">`; }
  const ti = document.getElementById('turn-info');
  if (ti){
    const rival = document.createElement('div'); rival.id = 'destinada-rival'; rival.className = 'available';
    rival.innerHTML = `<img class="erizo-dest on" src="${onR}" alt=""><img class="erizo-dest off" src="${offR}" alt=""><span class="hud-tip-rival"></span>`;
    ti.parentNode.insertBefore(rival, ti);
    // historial, a mano encima del turno
    const hb = document.createElement('button'); hb.id = 'hud-historial'; hb.type = 'button';
    hb.addEventListener('click', () => { if (typeof openLogModal === 'function') openLogModal(); });
    ti.parentNode.insertBefore(hb, ti);
    pxActualizarHistorial();
  }
  // burbuja sobre la carta seleccionada (y roja sobre la segunda de la Destinada)
  const burbujas = [0, 1].map(k => { const d = document.createElement('div'); d.className = 'burbuja-seleccion' + (k ? ' roja' : ''); d.style.display = 'none'; document.body.appendChild(d); return d; });
  let turno = 0;
  (function paso(){
    requestAnimationFrame(paso);
    if ((turno = (turno + 1) % 2)) return;
    [document.querySelector('#hand-cards .hand-card.selected'), document.querySelector('#hand-cards .hand-card.selected-destinada')].forEach((c, k) => {
      const b = burbujas[k];
      if (!c || !c.offsetParent){ b.style.display = 'none'; return; }
      const rc = c.getBoundingClientRect();
      b.style.display = ''; b.style.left = (rc.left + rc.width / 2 - 14) + 'px'; b.style.top = (rc.top - 36) + 'px';
    });
  })();
})();

function pxActualizarHistorial(){
  const hb = document.getElementById('hud-historial'); if (!hb) return;
  const n = (typeof G !== 'undefined' && G && G.logs) ? G.logs.length : 0;
  hb.innerHTML = `${typeof t === 'function' ? t('fab_log') : '📜 Historial'} <span class="n">${n}</span>`;
}
function actualizarDestinadaRival(){
  const el = document.getElementById('destinada-rival'); if (!el || typeof G === 'undefined' || !G) return;
  const usada = G.destinadaUsed && G.destinadaUsed[1];
  const bloq = G.spaces && G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'));
  el.className = (usada || bloq) ? 'used' : 'available';
  const L = window.CURRENT_LANG;
  el.title = (usada || bloq)
    ? ({ en: 'The AI can no longer use Destined Placement', ja: 'AIは運命配置をもう使えない' }[L] || 'La IA ya no puede usar la Colocación Destinada')
    : ({ en: 'The AI can still use Destined Placement', ja: 'AIはまだ運命配置を使える' }[L] || 'La IA aún puede usar la Colocación Destinada');
}

/* ---- robar carta: vuela en arco desde el mazo, se da la vuelta (las tuyas) y se asienta ---- */
function animarRobo(fromRect, toRect, carta, jugador){
  return new Promise(resolve => {
    const mano = document.getElementById(jugador === 0 ? 'hand-cards' : 'ai-hidden-hand');
    const destino = mano && mano.lastElementChild;
    if (destino) destino.style.visibility = 'hidden';
    // [Nuevo] mientras vuela, la carta de la mano sigue oculta aunque la mano se vuelva a dibujar
    if (jugador === 0){ (window._cartasEnVuelo = window._cartasEnVuelo || new Set()).add(carta); }
    // [Nuevo] tu mano se levanta mientras robas, para ver dónde llega la carta (y luego vuelve a bajar)
    if (jugador === 0 && mano){
      clearTimeout(window._roboBajar); mano.classList.add('robo-mostrar');
      if (destino){ destino.style.transition = 'none'; toRect = destino.getBoundingClientRect(); destino.offsetWidth; destino.style.transition = ''; }
    }
    const w = toRect.width, h = toRect.height;
    const el = document.createElement('div'); el.className = 'robo-carta';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    const cara = jugador === 0 ? `<img src="./ilustraciones/${carta.name}.jpg" alt="" onerror="this.style.display='none'">` : '';
    el.innerHTML = `<div class="robo-interior"><div class="robo-cara robo-dorso"><img src="./ilustraciones/card-back.jpg" alt=""></div><div class="robo-cara robo-frente">${cara}</div></div>`;
    document.body.appendChild(el);
    // [Corregido] tu carta vuela con su cara completa (nombre, efecto, iconos y marco): es una copia de la carta de la mano
    if (jugador === 0 && destino && destino.classList.contains('hand-card')){
      const copia = destino.cloneNode(true);
      copia.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;margin:0;transform:none;visibility:visible;transition:none;';
      copia.classList.remove('selected', 'raised');
      const frente = el.querySelector('.robo-frente'); frente.innerHTML = ''; frente.appendChild(copia);
      frente.classList.add('con-carta');
    }
    if (jugador !== 0) el.querySelector('.robo-interior').style.transform = 'rotateY(180deg)';   // las del rival, boca abajo
    const x0 = fromRect.left + fromRect.width / 2 - w / 2, y0 = fromRect.top + fromRect.height / 2 - h / 2;
    const x1 = toRect.left, y1 = toRect.top;
    const cx = (x0 + x1) / 2 + (jugador === 0 ? -60 : 60), cy = Math.min(y0, y1) - (jugador === 0 ? 120 : -80);   // punto de control del arco
    const s0 = Math.max(.25, fromRect.width / w);
    const dur = Math.round(560 * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));
    const pasos = [];
    for (let k = 0; k <= 12; k++){
      const t = k / 12, u = 1 - t, e = t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      // [Corregido] las del rival van giradas del revés, como las tiene en su mano
      const esc = s0 + (1 - s0) * (1 - Math.pow(1 - e, 2)), gira = (jugador === 0 ? -14 : 14) * Math.sin(Math.PI * t) + (jugador === 0 ? 0 : 180);
      pasos.push({ transform: `translate(${x}px,${y}px) rotate(${gira}deg) scale(${esc})`, offset: t });
    }
    const anim = el.animate(pasos, { duration: dur, easing: 'cubic-bezier(.3,.7,.35,1)', fill: 'forwards' });
    if (jugador === 0) el.querySelector('.robo-interior').animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(180deg)', offset: .3 }, { transform: 'rotateY(0deg)', offset: .8 }, { transform: 'rotateY(0deg)' }], { duration: dur, fill: 'forwards', easing: 'ease-in-out' });
    anim.onfinish = () => {
      if (window._cartasEnVuelo) window._cartasEnVuelo.delete(carta);
      const idx = jugador === 0 && G && G.hands ? G.hands[0].indexOf(carta) : -1;
      const actual = idx >= 0 ? document.querySelectorAll('#hand-cards .hand-card')[idx] : destino;
      if (actual) actual.style.visibility = '';
      if (destino && destino !== actual) destino.style.visibility = '';
      el.remove(); resolve();
      if (jugador === 0 && mano) window._roboBajar = setTimeout(() => mano.classList.remove('robo-mostrar'), ritmoMs ? ritmoMs(650) : 900);
    };
  });
}

/* ---- [Nuevo] marcos de valor: Realidades (Valor 0) en blanco, Valor 1 en negro ----
   En la mano y en «Cartas y mazos». El color de cada Realidad se ve cuando
   se juega: la esfera que cae en el espacio (y el icono de tipo de la carta).
   El número de valor (junto al icono de tipo) pasa a ser una cifra en pixel
   art del alto del icono (blanca con un 0 / negra con un 1); brilla en
   azul/rojo si el valor está subido/bajado. */
const MARCO_V0 = '#f2f0ea', MARCO_V1 = '#0e0c12';
function pxLuz(hex){ const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (c[0] * .3 + c[1] * .59 + c[2] * .11) / 255; }
function pxAclara(hex, t){ return '#' + [1, 3, 5].map(i => { const v = parseInt(hex.slice(i, i + 2), 16); return Math.round(v + (255 - v) * t).toString(16).padStart(2, '0'); }).join(''); }
const PX_MEDALLA = {};
function pxMedalla(texto, color){
  // [Cambiado] ya no es una esfera con el número dentro: solo el número, en pixel art, a la altura del icono de tipo.
  // Valor 0: cifra blanca con contorno oscuro; Valor 1: cifra negra con contorno claro (como sus marcos).
  const k = 'n' + texto + color; if (PX_MEDALLA[k]) return PX_MEDALLA[k];
  const chars = [...String(texto)].filter(ch => PX_CIFRAS[ch]);
  const w = chars.length * 4 + 1, h = 7, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), puntos = [];
  chars.forEach((ch, n) => PX_CIFRAS[ch].forEach((f, j) => [...f].forEach((p, i) => { if (p === 'n') puntos.push([1 + n * 4 + i, 1 + j]); })));
  const claro = pxLuz(color) > .55;
  x.fillStyle = claro ? '#0b0a10' : '#f4f2ec';   // contorno
  puntos.forEach(([i, j]) => { for (let a2 = -1; a2 <= 1; a2++) for (let b2 = -1; b2 <= 1; b2++) x.fillRect(i + a2, j + b2, 1, 1); });
  x.fillStyle = claro ? '#f4f2ec' : '#16131c';   // la cifra
  puntos.forEach(([i, j]) => x.fillRect(i, j, 1, 1));
  return PX_MEDALLA[k] = c.toDataURL();
}
function marcoValor(el, carta){
  if (!el || !carta || el.querySelector('.marco-valor')) return;
  const v = (carta.baseValue ?? carta.value) === 0 ? 0 : 1;
  const color = v === 0 ? MARCO_V0 : MARCO_V1;
  const m = document.createElement('div'); m.className = 'marco-valor';
  m.style.setProperty('--mv-c', color);
  m.style.setProperty('--mv-linea', v === 0 ? 'rgba(10,10,16,.85)' : 'rgba(255,255,255,.35)');
  el.appendChild(m);
  const val = el.querySelector('.cf-value');
  if (val && val.textContent.trim() !== '' && !val.classList.contains('con-medalla')){
    const t = val.textContent.trim();
    const sube = val.style.color && val.style.color.includes('blue'), baja = val.style.color && val.style.color.includes('red');
    val.textContent = '';
    const img = document.createElement('img'); img.className = 'medalla-valor' + (sube ? ' sube' : baja ? ' baja' : ''); img.alt = t;
    img.src = pxMedalla(t, v === 0 ? '#e9e6de' : '#26222e');
    val.appendChild(img); val.classList.add('con-medalla');
  }
}
(function(){
  if (typeof renderHand === 'function'){
    const original = renderHand;
    window.renderHand = function(){
      original.apply(this, arguments);
      const cartas = (typeof G !== 'undefined' && G && G.hands) ? G.hands[0] : [];
      document.querySelectorAll('#hand-cards .hand-card').forEach((el, i) => {
        marcoValor(el, cartas[i]);
        if (window._cartasEnVuelo && cartas[i] && window._cartasEnVuelo.has(cartas[i])) el.style.visibility = 'hidden';   // aún volando hacia la mano
      });
    };
  }
  // [Corregido] la carta ampliada (clic para agrandarla) también lleva su marco y su esfera de valor
  if (typeof openCardZoom === 'function'){
    const original = openCardZoom;
    window.openCardZoom = openCardZoom = function(card){
      const r = original.apply(this, arguments);
      const box = document.getElementById('card-zoom-box');
      if (box && card) marcoValor(box, card);
      const tok = document.querySelector('#zoom-token-panel .zoom-token-card');
      const SPAWNS = { Reiza: 'Gatito', Fukou: 'ErizoPeluche', Nugu: 'ErizoPeluche', Nofi: 'Ery' };
      if (tok && card && SPAWNS[card.name] && typeof TOKENS !== 'undefined' && TOKENS[SPAWNS[card.name]]) marcoValor(tok, TOKENS[SPAWNS[card.name]]);
      return r;
    };
  }
  // Cartas y mazos: los mismos marcos
  if (typeof buildCbGrid === 'function'){
    const original = buildCbGrid;
    window.buildCbGrid = function(cards){
      const grid = original.apply(this, arguments);
      [...grid.children].forEach((el, i) => { if (!el.classList.contains('locked') && cards[i]) marcoValor(el, cards[i]); });
      return grid;
    };
  }
})();

/* ---- [Nuevo] cartas que vuelan al tablero (o a una pila) ----
   Antes se desvanecían a mitad de camino y la carta del rival parecía aparecer
   y desaparecer. Ahora vuela entera en un arco suave, se encoge hasta el tamaño
   del hueco, se asienta con un pequeño rebote y se queda un instante hasta que
   la carta real aparece debajo. La carta de la mano del rival se oculta mientras vuela. */
function animateFlyCard(fromRect, toRect, durationMs = 380){
  return new Promise(resolve => {
    const w = toRect.width || 52, h = toRect.height || 74;
    const el = document.createElement('div'); el.className = 'fly-card';
    el.style.width = w + 'px'; el.style.height = h + 'px'; el.style.left = '0px'; el.style.top = '0px';
    document.body.appendChild(el);
    const x0 = fromRect.left + fromRect.width / 2 - w / 2, y0 = fromRect.top + fromRect.height / 2 - h / 2;
    const x1 = toRect.left, y1 = toRect.top;
    const s0 = Math.max(.35, Math.min(2.2, (fromRect.width || w) / w));
    const baja = y1 > y0;   // del rival (arriba) hacia el tablero: arco hacia fuera
    const cx = (x0 + x1) / 2 + (x1 > x0 ? -30 : 30), cy = baja ? Math.min(y0, y1) + (y1 - y0) * .15 : Math.min(y0, y1) - 60;
    const dur = Math.max(300, Math.round(durationMs * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1)));
    const pasos = [];
    for (let k = 0; k <= 12; k++){
      const t = k / 12, u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      const esc = s0 + (1 - s0) * (1 - Math.pow(1 - t, 2)), gira = (x1 > x0 ? 8 : -8) * Math.sin(Math.PI * t);
      pasos.push({ transform: `translate(${x}px,${y}px) rotate(${gira}deg) scale(${esc})`, offset: t * .86 });
    }
    pasos.push({ transform: `translate(${x1}px,${y1 + 3}px) scale(1.05, .96)`, offset: .93 });
    pasos.push({ transform: `translate(${x1}px,${y1}px) scale(1)`, offset: 1 });
    const anim = el.animate(pasos, { duration: dur, easing: 'cubic-bezier(.35,.1,.3,1)', fill: 'forwards' });
    anim.onfinish = () => {
      resolve();
      // se queda un momento (la carta real se dibuja debajo) y se funde
      setTimeout(() => { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).onfinish = () => el.remove(); }, 120);
    };
  });
}
(function(){
  if (typeof animateAIPlay !== 'function') return;
  window.animateAIPlay = async function(spaceIdx, slotIdx){
    const aiHand = document.getElementById('ai-hidden-hand');
    const srcEl = aiHand && (aiHand.querySelector(':scope > *:not([style*="hidden"])') || aiHand.lastElementChild);
    const fromRect = srcEl ? srcEl.getBoundingClientRect() : { left: innerWidth / 2 - 70, top: 20, width: 140, height: 196 };
    if (srcEl) srcEl.style.visibility = 'hidden';
    const spaceEls = document.querySelectorAll('#spaces-area .space');
    let toRect = { left: innerWidth / 2, top: innerHeight / 2, width: 52, height: 74 };
    const aiRow = spaceEls[spaceIdx] && spaceEls[spaceIdx].querySelectorAll('.slots-row')[0];
    const slot = aiRow && aiRow.querySelectorAll('.slot')[slotIdx];
    if (slot) toRect = slot.getBoundingClientRect();
    await animateFlyCard(fromRect, toRect, Math.round(460 * OPTIONS.speedFactor));
  };
})();

/* ---- [Nuevo] contorno del dueño (azul tú / rojo la IA) en las cartas boca arriba del tablero, siempre ---- */
(function(){
  if (typeof buildSlotsRow !== 'function') return;
  const original = buildSlotsRow;
  window.buildSlotsRow = function(spaceIdx, side){
    const row = original.apply(this, arguments);
    row.querySelectorAll('.card-in-slot').forEach(c => c.classList.add(side === 0 ? 'borde-tuyo' : 'borde-rival'));
    return row;
  };
})();

/* ---- [Nuevo] el icono de «Realidad» de cada carta, del color de su Realidad ---- */
(function(){
  if (typeof buildCardFace !== 'function') return;
  const original = buildCardFace;
  window.buildCardFace = function(card, el){
    const r = original.apply(this, arguments);
    if (card && card.type === 'realidad' && typeof REALIDADES !== 'undefined' && REALIDADES[card.name] && typeof pxGotaUrl === 'function'){
      const ic = el.querySelector('img.tipo-px-realidad'); if (ic) ic.src = pxGotaUrl(REALIDADES[card.name].color);
    }
    return r;
  };
})();

/* ---- [Nuevo] cartas que ganan o pierden valor: destellos en pixel art ----
   Cuando una carta boca arriba del tablero sube de valor (Mega, Gena, Yukoi…)
   salen destellos verdes y dorados y un «+N» que sube; si baja (Slau, Resta…),
   destellos rojos oscuros y un «-N» que cae. La partida espera a que se vea
   antes de seguir con la siguiente acción. */
const VALOR_PREVIO = new WeakMap();
let VALOR_ESPERA_HASTA = 0;
function valorCartaEl(sp, side, sl){
  const spEl = document.querySelectorAll('#spaces-area .space')[sp]; if (!spEl) return null;
  const filas = spEl.querySelectorAll('.slots-row'), fila = side === 0 ? filas[filas.length - 1] : filas[0];
  const slot = fila && fila.children[sl];
  return slot ? (slot.querySelector('.card-in-slot') || slot) : null;
}
function valorCambio(el, dif){
  const sube = dif > 0;
  if (typeof estallidoDestellos === 'function') estallidoDestellos(el, sube
    ? { colores: ['#b8ff9a', '#ffffff', '#ffe27a', '#7fe06a'], anillo: '160,255,140', cantidad: 22, ancho: 200, alto: 240 }
    : { colores: ['#ff6a5a', '#b0303a', '#3a0a10', '#ff9a8a'], anillo: '255,90,80', cantidad: 18, ancho: 200, alto: 240 });
  const r = el.getBoundingClientRect();
  const n = document.createElement('img'); n.className = 'valor-flotante';
  n.src = pxNumero((sube ? '' : '-') + Math.abs(dif), sube ? '#8dff6a' : '#ff5a4a', sube ? '#e6ffd8' : '#ffc4bc');
  if (sube){
    // el «+» en pixel art delante de la cifra
    const c = document.createElement('canvas'), img = new Image(); img.src = n.src;
    img.onload = () => { c.width = img.width + 4; c.height = img.height; const x = c.getContext('2d');
      x.fillStyle = '#07070e'; x.fillRect(0, 1, 5, 5); x.fillStyle = '#8dff6a'; x.fillRect(1, 3, 3, 1); x.fillRect(2, 2, 1, 3);
      x.drawImage(img, 4, 0); n.src = c.toDataURL(); };
  }
  n.style.left = (r.left + r.width / 2) + 'px'; n.style.top = (r.top + r.height * .4) + 'px';
  document.body.appendChild(n);
  const dur = Math.round(1100 * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));
  n.animate(sube
    ? [{ transform: 'translate(-50%, 0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%, -18px) scale(1)', opacity: 1, offset: .25 }, { transform: 'translate(-50%, -54px) scale(1)', opacity: 0 }]
    : [{ transform: 'translate(-50%, -20px) scale(.6)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: .25 }, { transform: 'translate(-50%, 34px) scale(1)', opacity: 0 }],
    { duration: dur, easing: 'ease-out', fill: 'forwards' }).onfinish = () => n.remove();
  el.classList.add(sube ? 'valor-sube' : 'valor-baja');
  setTimeout(() => el.classList.remove('valor-sube', 'valor-baja'), dur);
  VALOR_ESPERA_HASTA = Math.max(VALOR_ESPERA_HASTA, performance.now() + dur * .8);
}
(function(){
  if (typeof render !== 'function') return;
  const original = render;
  window.render = function(){
    const r = original.apply(this, arguments);
    try {
      if (typeof G === 'undefined' || !G || !G.spaces || typeof getCardPower !== 'function') return r;
      for (let sp = 0; sp < 3; sp++) for (let side = 0; side < 2; side++) for (let sl = 0; sl < 3; sl++){
        const c = G.spaces[sp].slots[side][sl]; if (!c) continue;
        const v = c.faceDown ? null : getCardPower(c);
        const prev = VALOR_PREVIO.get(c);
        if (v !== null && prev && prev.sp === sp && prev.v !== null && v !== prev.v){
          const el = valorCartaEl(sp, side, sl); if (el) valorCambio(el, v - prev.v);
        }
        VALOR_PREVIO.set(c, { v, sp });
      }
    } catch (e) {}
    return r;
  };
  // la siguiente acción espera a que se vea el cambio de valor
  if (typeof gameSleep === 'function'){
    const gs = gameSleep;
    window.gameSleep = async function(ms){
      await gs.apply(this, arguments);
      const falta = VALOR_ESPERA_HASTA - performance.now();
      if (falta > 0) await new Promise(res => setTimeout(res, falta));
    };
  }
})();

/* ---- [Nuevo] cuando hay que elegir (Humi, Tei, Rasu, Una, Reki…): objetivos bien visibles ----
   Lo que se puede elegir lleva un marco dorado que late y una flecha en pixel
   art encima; el resto del tablero se oscurece. */
const PX_FLECHA = ['.#####.', '.#ooo#.', '.#ooo#.', '##ooo##', '#ooooo#', '.#ooo#.', '..#o#..', '...#...'];
let PX_FLECHA_URL = null;
function eleccionMarcar(){
  document.querySelectorAll('.flecha-eleccion').forEach(f => f.remove());
  const activa = (typeof boardPickState !== 'undefined' && boardPickState) || (typeof slotPickState !== 'undefined' && slotPickState) || (typeof spacePickState !== 'undefined' && spacePickState);
  document.body.classList.toggle('eligiendo', !!activa);
  if (!activa) return;
  const objetivos = [...document.querySelectorAll('#spaces-area .slot.board-pick-target, #spaces-area .space-location.space-pick-target' + (slotPickState ? ', #spaces-area .slot.highlight' : ''))];
  if (!PX_FLECHA_URL) PX_FLECHA_URL = pxLienzo(PX_FLECHA, { '#': '#2a1a04', o: '#ffd76a' }).toDataURL();
  objetivos.forEach(o => {
    o.classList.add('objetivo-eleccion');
    const r = o.getBoundingClientRect();
    const f = document.createElement('img'); f.className = 'flecha-eleccion'; f.src = PX_FLECHA_URL; f.alt = '';
    f.style.left = (r.left + r.width / 2 - 10) + 'px'; f.style.top = (r.top - 26) + 'px';
    document.body.appendChild(f);
  });
}
(function(){
  if (typeof render !== 'function') return;
  const original = window.render;
  window.render = function(){ const r = original.apply(this, arguments); try { eleccionMarcar(); } catch (e) {} return r; };
})();
