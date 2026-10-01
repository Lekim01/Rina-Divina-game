/* Riña Divina — «CARTAS Y MAZOS» COMO UN LIBRO   [Nuevo]
   Página izquierda: los mazos y los filtros. Página derecha: las cartas.
   Al abrirse, la tapa de cuero (las cuatro flores) gira sobre el lomo y en su
   dorso lleva ya la página izquierda, que cae justo encima de la de verdad.
   En «Para móviles» o en pantallas estrechas se ve como siempre.
   Si las cartas se ven pequeñas, al pasar el ratón por encima aparece una
   nota con su efecto (o cómo se desbloquea), para poder leerlo.
   No toca juego.js: envuelve showCardBrowser / closeCardBrowser desde fuera. */
(function(){
  const quiere = () => true;   // [Cambiado] siempre como libro (ya no hay botón para quitarlo)
  const puede = () => !(typeof OPTIONS !== 'undefined' && OPTIONS.mobileMode) && innerWidth >= 900;
  const activo = () => quiere() && puede();

  const css = `
  #card-browser-box.cb-libro{ --lb-cuero:#4a2c1c; --lb-cuero-osc:#2a170c; --lb-oro:#d8b06a; --lb-papel:#efe3c4; --lb-papel-osc:#dccaa0; --lb-tinta:#2b1a10; --lb-tinta-suave:#6a4a30;
    position: relative; perspective: 12000px; background: var(--lb-cuero); border: 2px solid var(--lb-cuero-osc); border-radius: 8px; overflow: visible;
    box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px var(--lb-cuero-osc), 0 20px 50px rgba(0,0,0,.6); padding: 0 16px 16px; max-width: 1500px; height: 90vh; }
  #card-browser-overlay.fullscreen-mode #card-browser-box.cb-libro{ margin: 2vh auto; height: 96vh; max-width: min(1500px, 96vw); border: 2px solid var(--lb-cuero-osc); border-radius: 8px; }
  #card-browser-overlay.fullscreen-mode:has(.cb-libro){ align-items: center; }
  .cb-libro #card-browser-header{ background: transparent; border-bottom: none; padding: 12px 8px 10px; }
  .cb-libro #card-browser-header h2, .cb-libro #cb-back-btn, .cb-libro #card-browser-header button{ color: var(--lb-oro); }
  .cb-libro #cb-layout{ background: var(--lb-papel); border-radius: 3px; position: relative; max-height: none !important; flex: 1; min-height: 0;
    box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58;
    background-image: linear-gradient(90deg, rgba(120,80,30,.12), transparent 4%, transparent 45%, rgba(80,50,20,.25) 49.4%, rgba(40,20,5,.42) 50%, rgba(80,50,20,.25) 50.6%, transparent 55%, transparent 96%, rgba(120,80,30,.12)); }
  .cb-libro #cb-deck-sidebar{ flex: 0 0 50%; width: 50%; box-sizing: border-box; background: transparent; border-right: none; padding: 22px 30px 26px; gap: 10px; color: var(--lb-tinta); }
  .cb-libro #cb-main{ flex: 0 0 50%; width: 50%; box-sizing: border-box; }
  .cb-libro #card-browser-body{ padding: 22px 28px 26px 30px; }
  .cb-libro .cb-libro-fila{ display: flex; gap: 8px; flex-wrap: wrap; }
  .cb-libro .cb-libro-fila > button{ flex: 1; min-width: 9em; }
  .cb-libro #cb-new-deck-btn, .cb-libro #cb-rename-deck-btn, .cb-libro #cb-presets-btn, .cb-libro .cb-filter-btn{
    background: rgba(255,250,235,.45); color: var(--lb-tinta); border: 1px solid rgba(106,74,48,.5); border-radius: 3px; }
  .cb-libro #cb-new-deck-btn:hover, .cb-libro #cb-rename-deck-btn:hover, .cb-libro #cb-presets-btn:hover, .cb-libro .cb-filter-btn:hover{ border-color: var(--lb-tinta); color: var(--lb-tinta); background: rgba(255,250,235,.8); }
  .cb-libro #cb-presets-btn.active, .cb-libro .cb-filter-btn.active{ background: var(--lb-papel-osc); border-color: #8a5a10; color: #6a3a08; }
  .cb-libro #cb-controls{ background: transparent; border: none; border-top: 1px solid rgba(106,74,48,.3); border-bottom: 1px solid rgba(106,74,48,.3); padding: 12px 0; gap: 8px; }
  .cb-libro #cb-search{ background: rgba(255,250,235,.6); color: var(--lb-tinta); border-color: rgba(106,74,48,.5); flex: 1; min-width: 10em; }
  .cb-libro #cb-search::placeholder{ color: var(--lb-tinta-suave); }
  .cb-libro #cb-size-label{ color: var(--lb-tinta-suave) !important; }
  .cb-libro #cb-deck-list{ display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .cb-libro .cb-deck-item{ background: rgba(255,250,235,.5); border-color: rgba(106,74,48,.4); box-shadow: 0 2px 4px rgba(60,40,20,.25); }
  .cb-libro .cb-deck-item.selected{ border-color: #2c5aa8; box-shadow: 0 0 0 2px rgba(44,90,168,.35); }
  .cb-libro .cb-deck-name{ color: var(--lb-tinta); }
  .cb-libro .cb-deck-item.preset .cb-deck-name{ color: #6a3a08; }
  .cb-libro .cb-deck-count, .cb-libro #cb-deck-hint{ color: var(--lb-tinta-suave); }
  .cb-libro .cb-section-title{ color: var(--lb-tinta-suave); border-bottom-color: rgba(106,74,48,.35); }
  .cb-libro .cb-libro-titulo{ font-family: 'KleeOne', serif; color: var(--lb-tinta-suave); font-size: .75rem; letter-spacing: .14em; text-transform: uppercase; border-bottom: 1px solid rgba(106,74,48,.35); padding-bottom: 4px; margin-top: 4px; }
  /* nota para leer las cartas pequeñas */
  #cb-nota{ position: fixed; z-index: 400; max-width: 300px; padding: 12px 14px 13px; pointer-events: none; display: none;
    background: #efe3c4; color: #2b1a10; border: 1px solid #b89c6a; border-radius: 3px; box-shadow: 0 8px 24px rgba(0,0,0,.45), inset 0 0 0 3px rgba(255,250,235,.5);
    font-family: 'KleeOne', serif; font-size: .92rem; line-height: 1.5; }
  #cb-nota.ver{ display: block; }
  #cb-nota b{ display: block; font-size: 1.02rem; color: #2b1a10; margin-bottom: 4px; letter-spacing: .03em; }
  #cb-nota .bloq{ display: block; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: #8a5a10; margin-bottom: 2px; }
  #cb-nota p{ margin: 0; color: #4a3020; }
  /* apertura */
  .cb-tapa{ position:absolute; top:-2px; bottom:-2px; left:50%; width: calc(50% + 2px); z-index: 30; transform-origin: left center; transform-style: preserve-3d; cursor:pointer; display:none; }
  .cb-tapa .cb-cara{ position:absolute; inset:0; width:100%; height:100%; backface-visibility:hidden; -webkit-backface-visibility:hidden; }
  .cb-tapa img.cb-cara{ image-rendering: pixelated; box-shadow: 10px 14px 0 rgba(0,0,0,.5); border-radius: 0 6px 6px 0; }
  .cb-tapa .cb-dorso{ transform: rotateY(180deg); overflow: hidden; border-radius: 8px 0 0 8px; }
  .cb-tapa .cb-copia{ position: absolute !important; left: 0; top: 0; width: 200% !important; height: 100% !important; max-width: none !important; margin: 0 !important; pointer-events: none; }
  #card-browser-overlay.fullscreen-mode #card-browser-box.cb-libro.cb-cerrado, #card-browser-box.cb-libro.cb-cerrado{ border-color: transparent; }   /* [Corregido] antes se veía el marco marrón del libro abierto */
  #card-browser-box.cb-libro.cb-cerrado{ background: linear-gradient(90deg, transparent 50%, var(--lb-cuero) 50%) border-box no-repeat; border-color: transparent; box-shadow: none; }
  #card-browser-box.cb-libro.cb-cerrado > :not(.cb-tapa){ clip-path: inset(-20px -20px -20px 50%); }
  #card-browser-box.cb-libro.cb-cerrado::before{ content:''; position:absolute; top:-2px; bottom:-2px; left:50%; right:-2px; border-radius: 0 8px 8px 0; pointer-events:none;
    box-shadow: inset 0 0 0 2px var(--lb-cuero-osc), inset 0 0 0 5px #6a4128, inset 0 0 0 7px var(--lb-cuero-osc); clip-path: inset(0 0 0 8px); }
  .cb-cerrado .cb-tapa{ display:block; }
  .cb-cerrado.cb-abriendo .cb-tapa{ transform: rotateY(-180deg); transition: transform .95s cubic-bezier(.45,.05,.3,1); }`;
  const st = document.createElement('style'); st.id = 'estilo-libro-cartas'; st.textContent = css; document.head.appendChild(st);

  /* tapa: la misma de los otros libros (cuero, flores roja, azul, verde y roja oscura) */
  function crearPortada(){
    const W = 96, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), px = (i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
    let s = 7; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const CUERO = ['#4a2c1c', '#56341f', '#5e3a23', '#673f26'];
    for(let j = 0; j < H; j++) for(let i = 0; i < W; i++) px(i, j, CUERO[Math.min(3, Math.floor(azar() * 3.2 + (Math.sin(i * .35 + j * .21) + 1) * .4))]);
    for(let j = 0; j < H; j++) for(let i = 0; i < 7; i++) px(i, j, i < 2 ? '#24140c' : i === 6 ? '#7a4c2e' : (j % 6 === 0 ? '#3a2214' : '#331d11'));
    x.fillStyle = '#24140c'; x.fillRect(0, 0, W, 2); x.fillRect(0, H - 2, W, 2); x.fillRect(W - 2, 0, 2, H);
    const marco = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, 1); x.fillRect(a, b + h - 1, w, 1); x.fillRect(a, b, 1, h); x.fillRect(a + w - 1, b, 1, h); };
    marco(11, 6, W - 17, H - 12, '#2e1a0f'); marco(12, 7, W - 19, H - 14, '#8a5a36'); marco(15, 10, W - 25, H - 20, '#3a2214'); marco(16, 11, W - 27, H - 22, '#7a4c2e');
    const ORO = ['#b88a4a', '#d8b06a', '#7a5a2a'];
    [[18, 13, 1, 1], [W - 12, 13, -1, 1], [18, H - 14, 1, -1], [W - 12, H - 14, -1, -1]].forEach(([a, b, sx, sy]) =>
      [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [3, 1], [1, 3], [2, 2]].forEach(([u, v], n) => px(a + u * sx, b + v * sy, ORO[n % 3])));
    [{ cx: 36, cy: 44, p: ['#ff8a7a', '#d23a3a', '#8a1a1a'] }, { cx: 66, cy: 44, p: ['#9cc3f2', '#4a7ad8', '#24448a'] },
     { cx: 36, cy: 84, p: ['#a8e08a', '#4aa84a', '#24602a'] }, { cx: 66, cy: 84, p: ['#c2505a', '#7a1a24', '#420a12'] }].forEach(f => {
      for(let j = -13; j <= 13; j++) for(let i = -13; i <= 13; i++){ const d = Math.hypot(i, j);
        if(d <= 12.6 && d > 11.4) px(f.cx + i, f.cy + j, (i + j) < 0 ? '#9a6a40' : '#2e1a0f'); else if(d <= 11.4) px(f.cx + i, f.cy + j, d > 10.4 ? '#3a2214' : '#4a2c1c'); }
      for(let j = 3; j <= 10; j++) px(f.cx, f.cy + j, '#2f5a2a');
      [[1, 6], [2, 5], [3, 5], [-1, 8], [-2, 7], [-3, 7]].forEach(([u, v]) => px(f.cx + u, f.cy + v, '#4a8a3c'));
      [[0, -4.2], [4, -1.3], [2.5, 3.4], [-2.5, 3.4], [-4, -1.3]].forEach(([a, b]) => {
        for(let j = -4; j <= 4; j++) for(let i = -4; i <= 4; i++){ const dx = i - a + .5, dy = j - b + .5;
          if(Math.hypot(dx, dy) <= 3.1){ const luz = -dx * .5 - dy * .7; px(f.cx + i, f.cy + j, luz > 1 ? f.p[0] : luz < -1.2 ? f.p[2] : f.p[1]); } }
      });
      px(f.cx, f.cy, '#ffd76a'); px(f.cx - 1, f.cy, '#ffd76a'); px(f.cx, f.cy - 1, '#fff1b0'); px(f.cx - 1, f.cy - 1, '#ffd76a'); px(f.cx, f.cy + 1, '#b8862a'); px(f.cx - 1, f.cy + 1, '#b8862a');
    });
    x.fillStyle = '#2e1a0f'; x.fillRect(30, 108, 42, 7); x.fillStyle = '#b88a4a'; x.fillRect(31, 109, 40, 5); x.fillStyle = '#d8b06a'; x.fillRect(31, 109, 40, 1);
    [44, 51, 58].forEach(a => { x.fillStyle = '#5a3a1a'; x.fillRect(a, 110, 2, 2); });
    x.globalAlpha = .08; x.fillStyle = '#fff'; x.fillRect(8, 3, W - 12, 18); x.globalAlpha = 1;
    return c;
  }

  window.rdCrearPortada = crearPortada;   // la usa también el libro de Hitos (menu_pulido.js)

  /* ---------- colocar los filtros en la página izquierda (y devolverlos) ---------- */
  const sitio = { controlsPadre: null, controlsSig: null };
  function montar(){
    const box = document.getElementById('card-browser-box'), side = document.getElementById('cb-deck-sidebar'), ctr = document.getElementById('cb-controls');
    if (!box || !side || !ctr) return;
    box.classList.add('cb-libro');
    if (!side.querySelector('.cb-libro-fila')){
      const fila = document.createElement('div'); fila.className = 'cb-libro-fila';
      ['cb-presets-btn', 'cb-new-deck-btn', 'cb-rename-deck-btn'].forEach(id => { const b = document.getElementById(id); if (b) fila.appendChild(b); });
      side.insertBefore(fila, side.firstChild);
      sitio.controlsPadre = ctr.parentNode; sitio.controlsSig = ctr.nextSibling;
      side.insertBefore(ctr, fila.nextSibling);
      const tit = document.createElement('div'); tit.className = 'cb-libro-titulo'; tit.textContent = ({ es: 'Mazos', en: 'Decks', ja: 'デッキ' })[window.CURRENT_LANG] || 'Mazos';
      side.insertBefore(tit, ctr.nextSibling);
    }
  }
  function desmontar(){
    const box = document.getElementById('card-browser-box'), side = document.getElementById('cb-deck-sidebar'), ctr = document.getElementById('cb-controls');
    if (!box) return;
    box.classList.remove('cb-libro', 'cb-cerrado', 'cb-abriendo');
    const fila = side && side.querySelector('.cb-libro-fila');
    if (fila){
      [...fila.children].reverse().forEach(b => side.insertBefore(b, fila.nextSibling));
      fila.remove();
      const tit = side.querySelector('.cb-libro-titulo'); if (tit) tit.remove();
      if (sitio.controlsPadre) sitio.controlsPadre.insertBefore(ctr, sitio.controlsSig && sitio.controlsSig.parentNode === sitio.controlsPadre ? sitio.controlsSig : sitio.controlsPadre.firstChild);
    }
  }

  /* ---------- apertura con la página pegada a la tapa ---------- */
  let urlPortada = null, tiempos = [], intervalo = null;
  function copiarIzquierda(box, tapa){
    const dorso = tapa.querySelector('.cb-dorso'); dorso.innerHTML = '';
    const copia = box.cloneNode(true);
    copia.classList.remove('cb-cerrado', 'cb-abriendo'); copia.classList.add('cb-copia');
    copia.querySelectorAll('.cb-tapa').forEach(el => el.remove());
    // la copia conserva los ids para que tenga exactamente los mismos estilos; como va DESPUÉS en la
    // página, getElementById sigue encontrando siempre los de verdad (y la copia no se puede pulsar)
    copia.querySelectorAll('input, button').forEach(el => el.setAttribute('tabindex', '-1'));
    const o = box.querySelectorAll('canvas'), d = copia.querySelectorAll('canvas');
    d.forEach((cv, i) => { if (o[i]){ cv.width = o[i].width; cv.height = o[i].height; try { cv.getContext('2d').drawImage(o[i], 0, 0); } catch(e){} } });
    dorso.appendChild(copia);
  }
  function abrir(){
    const box = document.getElementById('card-browser-box'); if (!box) return;
    let tapa = box.querySelector('.cb-tapa');
    if (!tapa){
      tapa = document.createElement('div'); tapa.className = 'cb-tapa';
      const img = document.createElement('img'); img.className = 'cb-cara'; img.alt = '';
      const dorso = document.createElement('div'); dorso.className = 'cb-cara cb-dorso';
      tapa.append(img, dorso); box.appendChild(tapa);
    }
    if (!urlPortada) urlPortada = crearPortada().toDataURL();
    tapa.querySelector('img').src = urlPortada;
    tiempos.forEach(clearTimeout); tiempos = []; clearInterval(intervalo);
    box.classList.remove('cb-abriendo'); box.classList.add('cb-cerrado');
    copiarIzquierda(box, tapa); void box.offsetWidth;
    const fin = () => { tiempos.forEach(clearTimeout); tiempos = []; clearInterval(intervalo); box.classList.remove('cb-cerrado', 'cb-abriendo'); tapa.querySelector('.cb-dorso').innerHTML = ''; };
    intervalo = setInterval(() => copiarIzquierda(box, tapa), 150);
    tiempos.push(setTimeout(() => box.classList.add('cb-abriendo'), 420));
    tiempos.push(setTimeout(fin, 1500));
    tapa.onclick = fin;
  }

  /* ---------- nota con el texto de la carta (para cartas pequeñas) ---------- */
  function nota(){ let n = document.getElementById('cb-nota'); if (!n){ n = document.createElement('div'); n.id = 'cb-nota'; document.body.appendChild(n); } return n; }
  function textoDe(sel, el){ const e = el.querySelector(sel); return e ? e.textContent.trim() : ''; }
  document.addEventListener('mouseover', ev => {
    const carta = ev.target.closest && ev.target.closest('#card-browser-body .cb-card');
    const n = nota();
    if (!carta || !document.querySelector('#card-browser-box.cb-libro') || carta.offsetWidth >= 185){ n.classList.remove('ver'); return; }
    const bloqueada = carta.classList.contains('locked');
    const nombre = bloqueada ? textoDe('.cb-card-lock-title', carta) : textoDe('.cf-name', carta);
    const texto = bloqueada ? textoDe('.cb-card-lock-cond', carta) : textoDe('.cf-effect', carta);
    if (!nombre && !texto){ n.classList.remove('ver'); return; }
    const L = window.CURRENT_LANG;
    n.innerHTML = '';
    if (bloqueada){ const s = document.createElement('span'); s.className = 'bloq'; s.textContent = ({ es: '🔒 Para desbloquear', en: '🔒 To unlock', ja: '🔒 解放条件' })[L] || '🔒 Para desbloquear'; n.appendChild(s); }
    const b = document.createElement('b'); b.textContent = nombre; n.appendChild(b);
    if (texto){ const p = document.createElement('p'); p.textContent = texto; n.appendChild(p); }
    n.classList.add('ver');
    const r = carta.getBoundingClientRect(), w = n.offsetWidth, h = n.offsetHeight;
    let x = r.right + 10; if (x + w > innerWidth - 8) x = r.left - w - 10;
    let y = Math.min(Math.max(8, r.top), innerHeight - h - 8);
    n.style.left = Math.max(8, x) + 'px'; n.style.top = y + 'px';
  });
  document.addEventListener('scroll', () => { const n = document.getElementById('cb-nota'); if (n) n.classList.remove('ver'); }, true);

  if (typeof showCardBrowser === 'function'){
    const original = showCardBrowser;
    window.showCardBrowser = showCardBrowser = function(){
      if (activo()) montar(); else desmontar();
      const r = original.apply(this, arguments);
      if (activo()) abrir();
      return r;
    };
  }
  if (typeof closeCardBrowser === 'function'){
    const original = closeCardBrowser;
    window.closeCardBrowser = closeCardBrowser = function(){
      tiempos.forEach(clearTimeout); tiempos = []; clearInterval(intervalo);
      const box = document.getElementById('card-browser-box'); if (box) box.classList.remove('cb-cerrado', 'cb-abriendo');
      const n = document.getElementById('cb-nota'); if (n) n.classList.remove('ver');
      return original.apply(this, arguments);
    };
  }
})();
