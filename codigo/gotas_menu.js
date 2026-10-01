/* Riña Divina — [Nuevo] gotas de colores flotando en el menú (pixel art)
   Las gotas del Color (y una negra de la Existencia) suben despacio por
   detrás del menú, meciéndose, como burbujas. Es la misma esfera en pixel
   art que las gotas del minijuego del erizo de la novela.
   Ligero: un lienzo pequeño (1 píxel por cada 3 de pantalla) que el
   navegador amplía sin suavizar, a 30 fotogramas por segundo, y solo
   mientras se ve el menú. */
(function(){
  const GOTAS = [
    ['#3f7fe8', '#9cc2ff'], ['#8e44ad', '#c9a2e8'], ['#2e7d3a', '#8ccf8e'], ['#e8c93f', '#f6e7a0'],
    ['#d9782a', '#f2b07a'], ['#b0302a', '#e07068'], ['#6a6a72', '#b8b8c0'], ['#0c0a14', '#6c6590'],   // la última: la Existencia
  ];
  const K = 3;   // píxeles de pantalla por píxel del lienzo
  function esfera(color, claro){
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mez = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const C = hex(color), L = hex(claro), NEG = [8, 7, 12], BLA = [255, 255, 255];
    const pal = { cuerpo: C, sombra: mez(C, NEG, .38), reflejo: mez(C, L, .4), borde: mez(C, NEG, .62), brillo: L, brillo2: mez(L, BLA, .65) };
    const N = 16, R = 7.1, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++){
      const dx = (i + .5 - 8) / R, dy = (j + .5 - 8) / R, r = Math.hypot(dx, dy);
      if (r > 1) continue;
      let col = r > 1 - 1.1 / R ? pal.borde : (-dx * .55 + dy * .85) > .55 ? pal.reflejo : (dx * .8 + dy * .2) > .38 ? pal.sombra : pal.cuerpo;
      const hx = dx + .42, hy = dy + .45, q = hx * hx + hy * hy;
      if (q < .07) col = pal.brillo; if (q < .018) col = pal.brillo2;
      x.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; x.fillRect(i, j, 1, 1);
    }
    return c;
  }
  const sprites = GOTAS.map(([a, b]) => esfera(a, b));
  const cv = document.createElement('canvas'); cv.id = 'menu-gotas';
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  let gotas = [], antes = 0, turno = 0;
  function nueva(inicio){
    const w = cv.width, h = cv.height, grande = Math.random() < .3;
    return { s: sprites[(Math.random() * sprites.length) | 0], esc: grande ? 2 : 1,
      x: Math.random() * w, y: inicio ? Math.random() * h : h + 20, vy: -(3 + Math.random() * 4) * (grande ? 1.3 : 1),
      fase: Math.random() * 6.3, vaiven: 4 + Math.random() * 6, alfa: .35 + Math.random() * .35 };
  }
  function ajustar(){
    const w = Math.ceil(innerWidth / K), h = Math.ceil(innerHeight / K);
    if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; ctx.imageSmoothingEnabled = false; gotas = Array.from({ length: 9 }, () => nueva(true)); }
  }
  function paso(t){
    requestAnimationFrame(paso);
    const menu = document.getElementById('screen-menu');
    const visible = menu && getComputedStyle(menu).display !== 'none' && !document.hidden;
    cv.style.display = visible ? '' : 'none';
    if (!visible){ antes = t; return; }
    if ((turno = (turno + 1) % 2)) return;   // 30 fps
    const dt = Math.min(.1, (t - antes) / 1000 || 0); antes = t;
    ajustar();
    ctx.clearRect(0, 0, cv.width, cv.height);
    gotas.forEach((g, i) => {
      g.y += g.vy * dt; g.fase += dt * .8;
      if (g.y < -20 * g.esc) gotas[i] = g = nueva(false);
      const lado = 16 * g.esc;
      ctx.globalAlpha = g.alfa;
      ctx.drawImage(g.s, Math.round(g.x + Math.sin(g.fase) * g.vaiven - lado / 2), Math.round(g.y - lado / 2), lado, lado);
    });
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(paso);
})();
