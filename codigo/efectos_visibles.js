/* Riña Divina — EFECTOS QUE SE VEN Y SE OYEN   [Nuevo]
   Sin textos: cada efecto se nota en la propia carta o en el tablero, con
   animaciones suaves y sonidos discretos (siguen el volumen de efectos y la
   velocidad de Opciones).
   - La carta que hace su efecto brilla un momento en dorado (o el espacio, si
     el efecto es del espacio), y la partida espera lo justo para verlo.
   - Ganar valor: destellos verdes y «+N» (ya existía) y ahora con sonido.
     Perder valor: destellos rojos y «-N» con un tono que baja.
   - Chiouri boca arriba: el espacio se escarcha y cae nieve en píxeles; si el
     límite de 3 corta el valor de alguien, su cifra se congela (destellos de
     hielo y un tintineo).
   - Ziru: cuando tú la tienes, las cartas de la mano rival se dan la vuelta una
     a una con un brillo; mientras sigue, la mano rival lleva un contorno
     dorado. Si la tiene el rival, tu mano lleva un leve brillo morado (te ve).
   - Carta que se va del tablero: vuela al descarte, a la extinción (se apaga
     en rojo) o a la mano a la que vuelve.
   - Carta a la que le anulan el efecto: una onda gris y un golpe sordo.
   - Panel de la derecha (mazo, descarte, extinción): de cuero, más presente.
   - Nombre de las cartas: un poco más abajo, para que el marco no lo tape.
   - Pruebas (solo con «Desbloquear todo» activado): en el menú de la partida,
     «Forzar Real en un espacio» y «Reki a mi mano». */
(function(){
  const L = () => window.CURRENT_LANG || 'es';
  const T = (es, en, ja) => ({ es, en, ja })[L()] || es;
  const ms = v => Math.round(v * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));

  const css = `
  .card-in-slot.efecto-activo{ animation: efectoLatido .9s ease-out 1; }
  .card-in-slot.efecto-activo::before{ content: ''; position: absolute; inset: -3px; border-radius: inherit; pointer-events: none; z-index: 30;
    box-shadow: 0 0 0 2px rgba(240,212,138,.95), 0 0 14px 2px rgba(240,200,110,.55); animation: efectoBrillo var(--ef-dur, 1.8s) ease-out forwards; }
  @keyframes efectoLatido{ 0%{ transform: scale(1); } 35%{ transform: scale(1.04); } 100%{ transform: scale(1); } }
  @keyframes efectoBrillo{ 0%{ opacity: 0; } 15%{ opacity: 1; } 70%{ opacity: 1; } 100%{ opacity: 0; } }
  .space-location.efecto-activo{ box-shadow: 0 0 0 2px rgba(240,212,138,.9), 0 0 16px rgba(240,200,110,.5) !important; transition: box-shadow .3s; }

  /* Chiouri: escarcha */
  .space.chiouri-helada{ position: relative; border-radius: 10px; box-shadow: inset 0 0 0 1px rgba(205,235,255,.55), inset 0 0 34px rgba(170,215,255,.32), 0 0 12px rgba(170,215,255,.25); background-color: rgba(190,225,255,.07); transition: box-shadow .6s, background-color .6s; }
  .space.chiouri-helada .space-location{ box-shadow: inset 0 0 0 1px rgba(200,235,255,.55), inset 0 0 22px rgba(170,215,255,.28) !important; }
  .space-score .congelado{ position: relative; animation: congelar 1.4s ease-out 1; filter: saturate(.35) brightness(1.35) drop-shadow(0 0 3px #9fd4ff); }
  .space-score .congelado::after{ content: ''; position: absolute; right: -15px; top: -7px; width: 15px; height: 15px; background: var(--copo-hielo) center / contain no-repeat; image-rendering: pixelated; }
  @keyframes congelar{ 0%{ filter: none; transform: scale(1); } 25%{ filter: brightness(2.2) saturate(.2) drop-shadow(0 0 8px #e8f6ff); transform: scale(1.25); } 100%{ filter: saturate(.35) brightness(1.35) drop-shadow(0 0 3px #9fd4ff); transform: scale(1); } }
  #burbujas-iona{ position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 34; image-rendering: pixelated; }
  #nieve-chiouri{ position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 33; image-rendering: pixelated; }

  /* Ziru */
  #ai-hidden-hand.ziru-vista .ai-card-back.ziru-revealed{ box-shadow: 0 0 0 1px rgba(240,212,138,.8), 0 0 10px rgba(240,200,110,.35); }
  #hand-cards.ziru-te-ve .hand-card{ box-shadow: 0 0 0 1px rgba(190,140,255,.55), 0 0 12px rgba(160,110,240,.35); }
  .ziru-brillo{ position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 40; overflow: hidden; }
  .ziru-brillo::after{ content: ''; position: absolute; top: -20%; bottom: -20%; width: 40%; left: -60%;
    background: linear-gradient(100deg, transparent, rgba(255,240,200,.75), transparent); animation: ziruBarrido .8s ease-out forwards; }
  @keyframes ziruBarrido{ to{ left: 120%; } }

  /* carta que se va del tablero */
  .carta-fantasma{ position: fixed; z-index: 60; pointer-events: none; margin: 0 !important; transform-origin: center; }
  .carta-fantasma *{ animation: none !important; }

  /* panel de la derecha: mazo, descarte y extinción */
  #side-piles{ width: 76px !important; padding: 12px 6px !important; gap: 12px !important; border-radius: 9px !important;
    background: linear-gradient(180deg, #4e2f1d, #2e1a0f) !important; border: 1px solid #c9a84c !important;
    box-shadow: inset 0 0 0 1px #2a170c, inset 0 1px 0 rgba(255,230,180,.15), 0 8px 20px rgba(0,0,0,.55) !important; opacity: 1 !important; }
  #side-piles > div[style*="height:1px"]{ background: linear-gradient(90deg, transparent, rgba(216,176,106,.7), transparent) !important; width: 56px !important; }
  #deck-label, #discard-label, #extinct-label{ color: #d8b06a !important; opacity: 1 !important; font-family: 'KleeOne', serif; letter-spacing: .12em !important; text-shadow: 0 1px 0 #140a04; }
  #extinct-label{ color: #e8a0a0 !important; }
  #deck-count, #discard-count, #extinct-count{ color: #f4e6c4 !important; opacity: 1 !important; font-family: 'KleeOne', serif; text-shadow: 0 1px 0 #140a04; }
  .discard-pile, .extinct-pile{ border-color: rgba(216,176,106,.55) !important; background: rgba(0,0,0,.32) !important; opacity: 1 !important; }
  .deck-pile{ filter: drop-shadow(0 3px 4px rgba(0,0,0,.5)); }
  #side-piles .discard-empty{ color: rgba(216,176,106,.6) !important; }
  .pila-recibe{ animation: pilaRecibe .5s ease-out 1; }
  @keyframes pilaRecibe{ 30%{ filter: brightness(1.6); transform: scale(1.06); } 100%{ filter: none; transform: none; } }

  /* nombre de la carta: un poco más abajo, lejos del borde */
  .cf-name{ padding-top: calc(5px + .12em) !important; }

  /* botones de prueba en el menú de la partida */
  #fab-items .fab-item.fab-prueba{ border-style: dashed !important; }`;
  const st = document.createElement('style'); st.id = 'estilo-efectos-visibles'; st.textContent = css; document.head.appendChild(st);

  (function(){
    const F = ['..#.#..', '.#.#.#.', '#.###.#', '.##o##.', '#.###.#', '.#.#.#.', '..#.#..'];
    const c = document.createElement('canvas'); c.width = 7; c.height = 7; const x = c.getContext('2d');
    F.forEach((f, j) => [...f].forEach((ch, i) => { if (ch === '.') return; x.fillStyle = ch === 'o' ? '#ffffff' : '#bfe6ff'; x.fillRect(i, j, 1, 1); }));
    document.documentElement.style.setProperty('--copo-hielo', `url(${c.toDataURL()})`);
  })();
  const EV = { ultimo: 0, pendiente: false };
  const marcarPausa = (t = 900) => { EV.ultimo = performance.now() + ms(t) - ms(900); EV.pendiente = true; };
  function enPartida(){
    const g = document.getElementById('screen-game');
    return !!(g && g.classList.contains('active') && typeof G !== 'undefined' && G && G.spaces && G.phase && G.phase !== 'end');
  }

  /* ---------- sonidos suaves (sintetizados) ---------- */
  let AC = null;
  function tono(notas, { tipo = 'sine', vol = .15 } = {}){
    const v = OPTIONS.sfxVolume ?? .55; if (!v) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const t0 = AC.currentTime + .01;
      notas.forEach(([f, dt, d, f2]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = tipo; o.frequency.setValueAtTime(f, t0 + dt);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dt + d);
        g.gain.setValueAtTime(0, t0 + dt); g.gain.linearRampToValueAtTime(vol * v, t0 + dt + .015);
        g.gain.exponentialRampToValueAtTime(.0001, t0 + dt + d);
        o.connect(g); g.connect(AC.destination); o.start(t0 + dt); o.stop(t0 + dt + d + .05);
      });
    } catch (e) {}
  }
  const SON = {
    baja:      () => tono([[523, 0, .2, 440], [392, .13, .34, 311]], { tipo: 'triangle', vol: .16 }),
    hielo:     () => tono([[2093, 0, .5], [2637, .07, .45], [3136, .14, .6], [2349, .23, .8]], { vol: .06 }),
    ziru:      () => tono([[659, 0, .45], [880, .09, .5], [1175, .18, .7], [1568, .27, .8]], { vol: .07 }),
    anulada:   () => tono([[196, 0, .3, 130]], { tipo: 'triangle', vol: .2 }),
    extincion: () => tono([[220, 0, .6, 82]], { vol: .13 }),
  };
  window.rdSonidoSuave = SON;

  /* ---------- la carta que hace el efecto brilla ---------- */
  let NOMBRES = null;
  function nombres(){
    if (NOMBRES) return NOMBRES;
    const n = Object.keys(typeof CARD_DB !== 'undefined' ? CARD_DB : {}).concat(Object.keys(typeof TOKENS !== 'undefined' ? TOKENS : {}));
    return NOMBRES = [...new Set(n)].sort((a, b) => b.length - a.length);
  }
  function cartaDelMensaje(msg){
    let mejor = null, pos = Infinity;
    for (const n of nombres()){
      const i = msg.indexOf(n);
      if (i === -1 || i >= pos) continue;
      const antes = msg[i - 1], despues = msg[i + n.length];
      if ((antes && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(antes)) || (despues && /[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(despues))) continue;
      mejor = n; pos = i;
    }
    return mejor;
  }
  function elementoDeCarta(nombre){
    let mejor = null;
    G.spaces.forEach((esp, sp) => [0, 1].forEach(o => esp.slots[o].forEach((c, sl) => {
      if (!c || c.faceDown || c.name !== nombre) return;
      if (!mejor || (c._ordenColocada || 0) > (mejor.c._ordenColocada || 0)) mejor = { c, sp, o, sl };
    })));
    if (!mejor || typeof ritmoElementoCarta !== 'function') return null;
    const el = ritmoElementoCarta(mejor.sp, mejor.o, mejor.sl);
    return el && el.classList.contains('card-in-slot') ? el : null;
  }
  function brillar(el){
    el.style.setProperty('--ef-dur', (ms(1500) / 1000) + 's');
    el.classList.remove('efecto-activo'); void el.offsetWidth; el.classList.add('efecto-activo');
    setTimeout(() => el.classList.remove('efecto-activo'), ms(1550));
  }
  function verEfecto(msg){
    if (!enPartida()) return;
    const limpio = String(msg).replace(/^[✦★\s]+|[✦\s]+$/g, '');
    const nombre = cartaDelMensaje(limpio);
    const el = nombre && elementoDeCarta(nombre);
    if (el) brillar(el);
    else {
      const m = limpio.match(/Espacio (\d)/);
      const loc = m && document.querySelectorAll('#spaces-area .space')[+m[1] - 1];
      const zona = loc && loc.querySelector('.space-location');
      if (!zona) return;
      zona.classList.add('efecto-activo'); setTimeout(() => zona.classList.remove('efecto-activo'), ms(1400));
    }
    marcarPausa(800);
  }
  if (typeof addLog === 'function'){
    const o = addLog;
    window.addLog = addLog = function(msg, type){
      const r = o.apply(this, arguments);
      if (type === 'effect'){ try { verEfecto(msg); } catch (e) {} }
      return r;
    };
  }
  // la siguiente pausa espera lo justo para que se vea (si fue hace muy poco)
  if (typeof gameSleep === 'function'){
    const o = gameSleep;
    window.gameSleep = gameSleep = function(t){
      const p = o.apply(this, arguments);
      if (!EV.pendiente) return p;
      EV.pendiente = false;
      const falta = ms(900) - (performance.now() - EV.ultimo);
      if (falta <= 0) return p;
      return Promise.all([p, new Promise(r => setTimeout(r, falta))]).then(() => undefined);
    };
  }

  /* ---------- valor: sonido al subir y al bajar ---------- */
  if (typeof valorCambio === 'function'){
    const o = valorCambio;
    let ultimoSonido = 0;
    window.valorCambio = valorCambio = function(el, dif){
      const r = o.apply(this, arguments);
      const ahora = performance.now();
      if (ahora - ultimoSonido > 180){
        ultimoSonido = ahora;
        if (dif > 0){ const s = typeof SOUNDS !== 'undefined' && SOUNDS.valorUp; if (!(s && !s.paused && s.currentTime < .25)) playSound('valorUp'); }
        else SON.baja();
      }
      return r;
    };
  }

  /* ---------- Chiouri: escarcha, nieve y cifras congeladas ---------- */
  const HIELO = { espacios: new Set(), cortes: new Map(), copos: [], lienzo: null };
  function chiouriVisible(sp){ return [0, 1].some(s => G.spaces[sp].slots[s].some(c => c && c.name === 'Chiouri' && !c.faceDown && !c.effectDisabled)); }
  function puntuacionSinChiouri(sp){
    const quitadas = [];
    [0, 1].forEach(s => G.spaces[sp].slots[s].forEach(c => { if (c && c.name === 'Chiouri' && !c.effectDisabled){ c.effectDisabled = true; quitadas.push(c); } }));
    let r = null;
    try { r = computeSpaceScore(sp); } catch (e) {}
    quitadas.forEach(c => { c.effectDisabled = false; });
    return r;
  }
  function revisarChiouri(){
    const espacios = document.querySelectorAll('#spaces-area .space');
    for (let sp = 0; sp < 3; sp++){
      const el = espacios[sp]; if (!el) continue;
      const helado = chiouriVisible(sp);
      el.classList.toggle('chiouri-helada', helado);
      if (helado && !HIELO.espacios.has(sp)){
        HIELO.espacios.add(sp); SON.hielo();
        if (typeof estallidoDestellos === 'function') estallidoDestellos(el.querySelector('.space-location') || el, { colores: ['#ffffff', '#d8f0ff', '#9fd4ff', '#bfe6ff'], anillo: '190,230,255', cantidad: 20 });
        marcarPausa(900);
      }
      if (!helado){ HIELO.espacios.delete(sp); HIELO.cortes.delete(sp); continue; }
      // ¿el límite corta el valor de alguien?
      let actual = null; try { actual = computeSpaceScore(sp); } catch (e) {}
      const crudo = puntuacionSinChiouri(sp);
      if (!actual || !crudo) continue;
      const corte = [crudo.p0 > actual.p0, crudo.p1 > actual.p1];
      const antes = HIELO.cortes.get(sp) || [false, false];
      HIELO.cortes.set(sp, corte);
      const sr = el.querySelector('.space-score');
      [0, 1].forEach(s => {
        const cifra = sr && sr.querySelector(s === 0 ? '.score-p1' : '.score-p2'); if (!cifra || !corte[s]) return;
        if (!antes[s]){
          cifra.classList.add('congelado'); SON.hielo();
          if (typeof estallidoDestellos === 'function') estallidoDestellos(cifra, { colores: ['#ffffff', '#d8f0ff', '#9fd4ff'], anillo: '190,230,255', cantidad: 14, ancho: 140, alto: 110 });
          marcarPausa(1000);
        } else cifra.classList.add('congelado', 'sigue');
      });
    }
    nieve();
  }
  function nieve(){
    if (!HIELO.espacios.size){ if (HIELO.lienzo) HIELO.lienzo.style.display = 'none'; return; }
    if (!HIELO.lienzo){
      const c = document.createElement('canvas'); c.id = 'nieve-chiouri'; (document.getElementById('screen-game') || document.body).appendChild(c); HIELO.lienzo = c;
      const P = 3; let antes = 0;
      (function paso(t){
        requestAnimationFrame(paso);
        if (c.style.display === 'none' || t - antes < 33) return;
        const dt = Math.min(.1, (t - antes) / 1000); antes = t;
        const W = Math.ceil(innerWidth / P), H = Math.ceil(innerHeight / P);
        if (c.width !== W || c.height !== H){ c.width = W; c.height = H; }
        const x = c.getContext('2d'); x.clearRect(0, 0, W, H);
        if (!enPartida()) return;
        const espacios = document.querySelectorAll('#spaces-area .space');
        HIELO.espacios.forEach(sp => {
          const el = espacios[sp]; if (!el) return;
          const r = el.getBoundingClientRect();
          let lista = HIELO.copos[sp];
          if (!lista) lista = HIELO.copos[sp] = Array.from({ length: 22 }, () => ({ u: Math.random(), v: Math.random(), vel: .06 + Math.random() * .07, fase: Math.random() * 6.3, g: Math.random() < .45 }));
          lista.forEach(f => {
            f.v += f.vel * dt; if (f.v > 1){ f.v = 0; f.u = Math.random(); }
            const px = Math.round((r.left + (f.u + Math.sin(t / 900 + f.fase) * .02) * r.width) / P), py = Math.round((r.top + f.v * r.height) / P);
            const a = Math.min(1, f.v * 6, (1 - f.v) * 4) * .9;
            x.globalAlpha = a;
            if (f.g){ x.fillStyle = '#cfeaff'; x.fillRect(px - 1, py, 3, 1); x.fillRect(px, py - 1, 1, 3); x.fillStyle = '#ffffff'; x.fillRect(px, py, 1, 1); }
            else { x.fillStyle = '#eaf6ff'; x.fillRect(px, py, 1, 1); }
          });
        });
        x.globalAlpha = 1;
      })(0);
    }
    HIELO.lienzo.style.display = '';
    HIELO.copos.forEach((l, sp) => { if (!HIELO.espacios.has(sp)) HIELO.copos[sp] = null; });
  }

  /* ---------- Ziru: la mano que se ve ---------- */
  const ZIRU = { yo: false, rival: false };
  function revisarZiru(){
    if (typeof ziruActive !== 'function') return;
    const yo = enPartida() && ziruActive(0), rival = enPartida() && ziruActive(1);
    const manoRival = document.getElementById('ai-hidden-hand'), mano = document.getElementById('hand-cards');
    if (manoRival) manoRival.classList.toggle('ziru-vista', yo);
    if (mano) mano.classList.toggle('ziru-te-ve', rival);
    if (yo && !ZIRU.yo && manoRival){
      SON.ziru();
      [...manoRival.querySelectorAll('.ai-card-back.ziru-revealed')].forEach((c, i) => {
        c.animate([{ transform: getComputedStyle(c).transform + ' rotateY(90deg)', opacity: .4 }, { transform: getComputedStyle(c).transform, opacity: 1 }],
          { duration: ms(380), delay: ms(110) * i, easing: 'ease-out', fill: 'backwards' });
        setTimeout(() => { const b = document.createElement('div'); b.className = 'ziru-brillo'; c.appendChild(b); setTimeout(() => b.remove(), 900); }, ms(110) * i + ms(300));
      });
      marcarPausa(1100);
    }
    if (rival && !ZIRU.rival && mano){
      SON.ziru();
      if (typeof estallidoDestellos === 'function') estallidoDestellos(mano, { colores: ['#e0c8ff', '#b88aff', '#ffffff'], anillo: '190,150,255', cantidad: 16 });
      marcarPausa(900);
    }
    ZIRU.yo = yo; ZIRU.rival = rival;
  }

  /* ---------- cartas que se van del tablero / pierden su efecto ---------- */
  let TABLERO = [];
  function fantasma(antes, destino, tipo){
    if (!antes.el) return;
    const r = antes.rect, g = antes.el.cloneNode(true);
    g.classList.remove('efecto-activo', 'valor-sube', 'valor-baja'); g.classList.add('carta-fantasma');
    Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transition: 'none' });
    document.body.appendChild(g);
    const d = destino && destino.getBoundingClientRect();
    const dur = ms(tipo === 'extincion' ? 900 : 700);
    let fin;
    if (d && d.width){
      const dx = d.left + d.width / 2 - (r.left + r.width / 2), dy = d.top + d.height / 2 - (r.top + r.height / 2);
      const esc = Math.max(.25, Math.min(1, d.height / r.height));
      const filtro = tipo === 'extincion' ? ['none', 'sepia(1) hue-rotate(-40deg) saturate(3) brightness(.8)', 'sepia(1) hue-rotate(-40deg) saturate(3) brightness(.25)'] : ['none', 'none', 'brightness(.85)'];
      fin = [{ transform: 'none', filter: filtro[0], opacity: 1 },
        { transform: `translate(${dx * .15}px, ${dy * .15 - 14}px) scale(1.03)`, filter: filtro[1], opacity: 1, offset: .25 },
        { transform: `translate(${dx}px, ${dy}px) scale(${esc})`, filter: filtro[2], opacity: tipo === 'mano' ? .9 : .55 }];
    } else {
      fin = [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px) scale(.92)' }];
    }
    g.animate(fin, { duration: dur, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' }).onfinish = () => {
      g.remove();
      if (destino && tipo !== 'mano'){ destino.classList.remove('pila-recibe'); void destino.offsetWidth; destino.classList.add('pila-recibe'); }
    };
    if (tipo === 'extincion'){
      SON.extincion();
      setTimeout(() => { if (typeof estallidoDestellos === 'function') estallidoDestellos(g, { colores: ['#ff6a5a', '#7a1a24', '#2a0a0a'], anillo: '200,60,60', cantidad: 12, ancho: 140, alto: 160 }); }, dur * .3);
    }
    marcarPausa(tipo === 'extincion' ? 1000 : 750);
  }
  function revisarTablero(){
    if (!enPartida() || typeof ritmoElementoCarta !== 'function'){ TABLERO = []; return; }
    const ahora = [], enTablero = new Set();
    G.spaces.forEach((esp, sp) => [0, 1].forEach(o => esp.slots[o].forEach((c, sl) => {
      if (!c) return;
      enTablero.add(c);
      const el = ritmoElementoCarta(sp, o, sl);
      ahora.push({ c, el: el && el.classList.contains('card-in-slot') ? el : null, rect: el ? el.getBoundingClientRect() : null, anulada: !!c.effectDisabled, boca: !!c.faceDown });
    })));
    const previo = new Map(TABLERO.map(e => [e.c, e]));
    TABLERO.forEach(a => {
      if (enTablero.has(a.c) || !a.el || !a.rect) return;
      if (G.extinct && G.extinct.includes(a.c)) fantasma(a, document.querySelector('.extinct-pile'), 'extincion');
      else if (G.discard && G.discard.includes(a.c)) fantasma(a, document.querySelector('.discard-pile'), 'descarte');
      else if (G.hands && G.hands[0] && G.hands[0].includes(a.c)) fantasma(a, document.getElementById('hand-cards'), 'mano');
      else if (G.hands && G.hands[1] && G.hands[1].includes(a.c)) fantasma(a, document.getElementById('ai-hidden-hand'), 'mano');
      else if (G.deck && [].concat(G.deck).includes(a.c)) fantasma(a, document.querySelector('.deck-pile'), 'mazo');
    });
    ahora.forEach(n => {
      const a = previo.get(n.c);
      if (a && !a.anulada && n.anulada && !n.boca && n.el){
        SON.anulada();
        n.el.animate([{ filter: 'none' }, { filter: 'grayscale(1) brightness(1.5)' }, { filter: 'grayscale(.6)' }, { filter: 'none' }], { duration: ms(900), easing: 'ease-out' });
        if (typeof estallidoDestellos === 'function') estallidoDestellos(n.el, { colores: ['#d0d0d0', '#8a8a8a', '#ffffff'], anillo: '200,200,200', cantidad: 10, ancho: 170, alto: 210 });
        marcarPausa(900);
      }
    });
    TABLERO = ahora;
  }

  /* ---------- Iona: burbujas en los huecos vacíos de su lado (su Existir funciona todo el rato) ---------- */
  const IONA = { huecos: [], lienzo: null, burbujas: new Map() };
  function revisarIona(){
    const h = [];
    G.spaces.forEach((esp, sp) => [0, 1].forEach(o => {
      if (!esp.slots[o].some(c => c && c.name === 'Iona' && !c.faceDown && !c.effectDisabled)) return;
      for (let sl = 0; sl < 3; sl++) if (!esp.slots[o][sl]) h.push(sp + ',' + o + ',' + sl);
    }));
    IONA.huecos = h;
    if (!h.length){ if (IONA.lienzo) IONA.lienzo.style.display = 'none'; return; }
    if (!IONA.lienzo){
      const c = document.createElement('canvas'); c.id = 'burbujas-iona'; (document.getElementById('screen-game') || document.body).appendChild(c); IONA.lienzo = c;
      const P = 3; let antes = 0;
      (function paso(t){
        requestAnimationFrame(paso);
        if (c.style.display === 'none' || t - antes < 40) return;
        const dt = Math.min(.12, (t - antes) / 1000); antes = t;
        const W = Math.ceil(innerWidth / P), H = Math.ceil(innerHeight / P);
        if (c.width !== W || c.height !== H){ c.width = W; c.height = H; }
        const x = c.getContext('2d'); x.clearRect(0, 0, W, H);
        if (!enPartida()) return;
        IONA.huecos.forEach(k => {
          const [sp, o, sl] = k.split(',').map(Number);
          const el = typeof valorCartaEl === 'function' ? valorCartaEl(sp, o, sl) : null; if (!el) return;
          const r = el.getBoundingClientRect(); if (!r.width) return;
          let lista = IONA.burbujas.get(k);
          if (!lista){ lista = Array.from({ length: 5 }, () => ({ u: .15 + Math.random() * .7, v: Math.random(), vel: .12 + Math.random() * .12, rad: 1 + Math.floor(Math.random() * 2), fase: Math.random() * 6.3 })); IONA.burbujas.set(k, lista); }
          lista.forEach(b => {
            b.v -= b.vel * dt; if (b.v < 0){ b.v = 1; b.u = .15 + Math.random() * .7; }
            const cx = Math.round((r.left + (b.u + Math.sin(t / 700 + b.fase) * .05) * r.width) / P), cy = Math.round((r.top + (.12 + b.v * .8) * r.height) / P);
            const a = Math.min(1, b.v * 4, (1 - b.v) * 5) * .85;
            const aro = (dx, dy) => {
              if (b.rad === 1){ x.fillRect(cx - 1 + dx, cy + dy, 1, 1); x.fillRect(cx + 1 + dx, cy + dy, 1, 1); x.fillRect(cx + dx, cy - 1 + dy, 1, 1); x.fillRect(cx + dx, cy + 1 + dy, 1, 1); }
              else { x.fillRect(cx - 1 + dx, cy - 2 + dy, 3, 1); x.fillRect(cx - 1 + dx, cy + 2 + dy, 3, 1); x.fillRect(cx - 2 + dx, cy - 1 + dy, 1, 3); x.fillRect(cx + 2 + dx, cy - 1 + dy, 1, 3); }
            };
            x.globalAlpha = a * .55; x.fillStyle = '#1f4a74'; aro(1, 1);   // sombra para que se vea sobre la tierra clara
            x.globalAlpha = a; x.fillStyle = '#c8efff'; aro(0, 0);
            x.fillStyle = '#ffffff'; x.fillRect(cx - (b.rad === 1 ? 0 : 1), cy - (b.rad === 1 ? 0 : 1), 1, 1);
          });
        });
        x.globalAlpha = 1;
      })(0);
    }
    IONA.lienzo.style.display = '';
    [...IONA.burbujas.keys()].forEach(k => { if (!h.includes(k)) IONA.burbujas.delete(k); });
  }

  /* ---------- al revelarse, si la carta ya entra con valor extra (Iona, Ponce, Kaeka…), se ve «+N» ---------- */
  const BOCA = new WeakMap();
  function revisarReveladas(){
    G.spaces.forEach((esp, sp) => [0, 1].forEach(o => esp.slots[o].forEach((c, sl) => {
      if (!c) return;
      const antes = BOCA.get(c); BOCA.set(c, !!c.faceDown);
      if (antes === true && !c.faceDown && typeof getCardPower === 'function' && typeof valorCambio === 'function'){
        const extra = getCardPower(c) - (c.baseValue || 0);
        if (extra > 0 && c.baseValue !== 0) setTimeout(() => { const el = valorCartaEl(sp, o, sl); if (el && el.classList.contains('card-in-slot')) valorCambio(el, extra); }, ms(450));
      }
    })));
  }

  if (typeof render === 'function'){
    const o = window.render;
    window.render = function(){
      const r = o.apply(this, arguments);
      // [Nuevo] al redibujar, las ilustraciones (ya cargadas) se pintan a la vez: así no parpadean las cartas
      try { document.querySelectorAll('#screen-game img:not([decoding])').forEach(i => { i.decoding = 'sync'; }); } catch (e) {}
      if (enPartida()){
        try { revisarIona(); } catch (e) {}
        try { revisarReveladas(); } catch (e) {}
        try { revisarTablero(); } catch (e) {}
        try { revisarChiouri(); } catch (e) {}
        try { revisarZiru(); } catch (e) {}
      } else {
        TABLERO = []; HIELO.espacios.clear(); HIELO.cortes.clear(); ZIRU.yo = ZIRU.rival = false;
        IONA.huecos = []; if (IONA.lienzo) IONA.lienzo.style.display = 'none';
        if (HIELO.lienzo) HIELO.lienzo.style.display = 'none';
      }
      return r;
    };
  }

/* ---------- botones de prueba en el menú de la partida ---------- */
  function botonesPrueba(){
    const items = document.getElementById('fab-items'); if (!items) return;
    const opciones = document.getElementById('btn-options-fab');
    const crear = (id, onclick) => {
      let b = document.getElementById(id);
      if (!b){ b = document.createElement('button'); b.id = id; b.className = 'fab-item fab-prueba'; b.type = 'button'; b.addEventListener('click', onclick); items.insertBefore(b, opciones || null); }
      return b;
    };
    const bReal = crear('btn-prueba-real', async () => {
      closeFabMenu();
      if (!G || !G.spaces || G.phase === 'end') return;
      const cands = [0, 1, 2].filter(i => !G.spaces[i].blocked);
      if (!cands.length) return;
      const sp = await realElegirEspacio(0, cands, T('Pruebas: elige el espacio donde forzar Real', 'Testing: choose the space to force Real', 'テスト：リアルを起こす空間を選ぶ'));
      if (sp < 0) return;
      triggerReal(sp); render();
    });
    const bReki = crear('btn-prueba-reki', async () => {
      closeFabMenu();
      if (typeof testRekiApparition === 'function') await testRekiApparition();
    });
    bReal.textContent = '🧪 ' + T('Forzar Real en un espacio', 'Force Real on a space', '空間にリアルを起こす');
    bReki.textContent = '🧪 ' + T('Reki a mi mano', 'Reki to my hand', 'レキを手札に');
    const ver = typeof rdModoPrueba === 'function' && rdModoPrueba() && enPartida();
    bReal.style.display = bReki.style.display = ver ? '' : 'none';
  }
  if (typeof toggleFabMenu === 'function'){
    const o = toggleFabMenu;
    window.toggleFabMenu = toggleFabMenu = function(){ try { botonesPrueba(); } catch (e) {} return o.apply(this, arguments); };
  }
  try { botonesPrueba(); } catch (e) {}
})();

/* ══ [Nuevo] QUIÉN HA CAMBIADO EL VALOR DE UNA CARTA ═══════════════════════
   Cada carta del tablero anota sola los cambios de su Valor y de quién vienen
   (RD_FUENTE, en juego.js). Al pasar el ratón por una carta mejorada o
   debilitada sale una notita pequeña: «▲ +2 Abaki · ▼ −1 Slau». */
(function(){
  if (typeof RD_FUENTE === 'undefined') return;
  const nombreDe = f => typeof f === 'string' ? f : (f && (f.displayName || f.name)) || '';
  function anotar(c, tipo, fuente, d){
    const n = nombreDe(fuente); if (!n || n === '__reset') return;
    if (!c._fuentes) c._fuentes = { p: [], e: [] };
    const lista = c._fuentes[tipo], ya = lista.find(x => x.n === n);
    if (ya) ya.d += d; else lista.push({ n, d });
    c._fuentes[tipo] = lista.filter(x => x.d !== 0);
  }
  function vigilar(c){
    if (!c || typeof c !== 'object' || c.__vigilada) return;
    Object.defineProperty(c, '__vigilada', { value: true, enumerable: false });
    [['powerBonus', 'p'], ['existBonus', 'e']].forEach(([prop, tipo]) => {
      let v = c[prop] || 0;
      Object.defineProperty(c, prop, { enumerable: true, configurable: true,
        get(){ return v; },
        set(nv){
          nv = nv || 0; const d = nv - (v || 0);
          if (nv === 0 || (tipo === 'e' && RD_FUENTE.actual === '__reset')){ if (c._fuentes) c._fuentes[tipo] = []; }   // vuelve a 0: se olvida
          else if (d && RD_FUENTE.actual) anotar(c, tipo, RD_FUENTE.actual, d);
          v = nv;
        } });
    });
  }
  const vigilarTablero = () => { if (typeof G !== 'undefined' && G && G.spaces) G.spaces.forEach(sp => sp.slots.forEach(fila => fila.forEach(vigilar))); };
  if (typeof placeCard === 'function'){
    const o = placeCard;
    window.placeCard = placeCard = function(card){ vigilar(card); return o.apply(this, arguments); };
  }
  if (typeof render === 'function'){
    const o = window.render;
    window.render = function(){ try { vigilarTablero(); } catch (e) {} return o.apply(this, arguments); };
  }

  /* ---- la notita al pasar el ratón ---- */
  const nota = document.createElement('div'); nota.id = 'rd-fuentes-valor';
  document.body.appendChild(nota);
  const st = document.createElement('style');
  st.textContent = `
  #rd-fuentes-valor{ position: fixed; z-index: 9400; pointer-events: none; opacity: 0; transform: translateY(4px); transition: opacity .15s ease, transform .15s ease;
    background: rgba(14,11,16,.94); border: 1px solid rgba(201,168,76,.55); border-radius: 5px; padding: 5px 9px; box-shadow: 0 4px 14px rgba(0,0,0,.55);
    font-family: 'KleeOne', sans-serif; font-size: .74rem; line-height: 1.5; color: #e8dcc0; white-space: nowrap; }
  #rd-fuentes-valor.ver{ opacity: 1; transform: translateY(0); }
  #rd-fuentes-valor .sube{ color: #9ff08a; } #rd-fuentes-valor .baja{ color: #ff8a7a; }
  #rd-fuentes-valor .tit{ font-size: .62rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(232,220,192,.6); }`;
  document.head.appendChild(st);
  const T = (es, en, ja) => { const l = window.CURRENT_LANG || 'es'; return l === 'en' ? en : l === 'ja' ? ja : es; };
  function cartaDe(el){
    const spEl = el.closest('#spaces-area .space'), fila = el.closest('.slots-row'); if (!spEl || !fila) return null;
    const sp = [...document.querySelectorAll('#spaces-area .space')].indexOf(spEl);
    const filas = spEl.querySelectorAll('.slots-row'), side = fila === filas[filas.length - 1] ? 0 : 1;
    const slot = [...fila.children].find(ch => ch.contains(el)); const sl = [...fila.children].indexOf(slot);
    const c = G && G.spaces && G.spaces[sp] && G.spaces[sp].slots[side][sl];
    return c && !c.faceDown ? c : null;
  }
  let actual = null;
  document.addEventListener('mouseover', ev => {
    const el = ev.target.closest && ev.target.closest('#spaces-area .card-in-slot');
    if (el === actual) return; actual = el;
    if (!el){ nota.classList.remove('ver'); return; }
    const c = cartaDe(el), f = c && c._fuentes;
    const todas = f ? [...(f.p || []), ...(f.e || [])] : [];
    const suma = {}; todas.forEach(x => { suma[x.n] = (suma[x.n] || 0) + x.d; });
    const propio = n => n === (c.displayName || c.name) ? ' <span style="opacity:.6">' + T('(su efecto)', '(own effect)', '（自身の効果）') + '</span>' : '';
    const lineas = Object.keys(suma).filter(n => suma[n]).map(n => `<span class="${suma[n] > 0 ? 'sube' : 'baja'}">${suma[n] > 0 ? '▲ +' : '▼ −'}${Math.abs(suma[n])}</span> ${n.replace(/^Espacio /, T('Espacio ', 'Space ', '空間 '))}${propio(n)}`);
    if (!lineas.length){ nota.classList.remove('ver'); return; }
    nota.innerHTML = `<div class="tit">${T('Valor cambiado por', 'Value changed by', '値の変化')}</div>` + lineas.join('<br>');
    const r = el.getBoundingClientRect();
    nota.style.left = Math.min(window.innerWidth - nota.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - nota.offsetWidth / 2)) + 'px';
    nota.style.top = Math.max(8, r.top - nota.offsetHeight - 8) + 'px';
    nota.classList.add('ver');
  });
})();

/* ══ [Nuevo] EL PELUCHE DE NUGU VUELA HASTA EL TABLERO RIVAL ══════════════
   Sale de la carta de Nugu, da un saltito en arco, cae en su hueco con unos
   destellos y un letrerito «Regalo de Nugu». La partida espera a que caiga. */
let RD_PELUCHE_OCULTO = null;   // {sp, side, sl}: el hueco de destino no se ve mientras vuela
(function(){
  const st = document.createElement('style');
  st.textContent = `
  .rd-peluche-vuela{ position: fixed; z-index: 9350; pointer-events: none; border-radius: 6px; overflow: hidden; box-shadow: 0 8px 22px rgba(0,0,0,.55), 0 0 0 2px #f4f1ea; background: #f4f1ea; }
  .rd-peluche-vuela img{ width: 100%; height: 100%; object-fit: cover; display: block; }
  .rd-peluche-nota{ position: fixed; z-index: 9360; pointer-events: none; transform: translate(-50%, -100%); font-family: 'KleeOne', sans-serif; font-size: .78rem; letter-spacing: .06em;
    color: #fff6e6; background: rgba(20,14,22,.92); border: 1px solid rgba(244,241,234,.6); border-radius: 12px; padding: 3px 10px; white-space: nowrap;
    animation: rdNotaPeluche 1.6s ease forwards; }
  @keyframes rdNotaPeluche{ 0%{ opacity: 0; margin-top: 6px; } 15%{ opacity: 1; margin-top: 0; } 75%{ opacity: 1; } 100%{ opacity: 0; margin-top: -8px; } }`;
  document.head.appendChild(st);
  if (typeof render === 'function'){
    const o = window.render;
    window.render = function(){ const r = o.apply(this, arguments);
      if (RD_PELUCHE_OCULTO){ const el = valorCartaEl(RD_PELUCHE_OCULTO.sp, RD_PELUCHE_OCULTO.side, RD_PELUCHE_OCULTO.sl); if (el) el.style.visibility = 'hidden'; }
      return r; };
  }
})();
async function rdLanzarPeluche(rectDesde, sp, side, sl){
  const f = (typeof OPTIONS !== 'undefined' && OPTIONS.speedFactor) || 1;
  RD_PELUCHE_OCULTO = { sp, side, sl };
  try {
    render();
    const destino = valorCartaEl(sp, side, sl); if (!destino) return;
    const r1 = destino.getBoundingClientRect();
    const r0 = rectDesde || { left: r1.left, top: r1.top + (side === 1 ? 160 : -160), width: r1.width, height: r1.height };
    const vuela = document.createElement('div'); vuela.className = 'rd-peluche-vuela';
    const img = document.createElement('img'); img.src = './ilustraciones/ErizoPeluche.jpg'; img.alt = ''; vuela.appendChild(img);
    Object.assign(vuela.style, { left: r1.left + 'px', top: r1.top + 'px', width: r1.width + 'px', height: r1.height + 'px' });
    document.body.appendChild(vuela);
    const dx = (r0.left + r0.width / 2) - (r1.left + r1.width / 2), dy = (r0.top + r0.height / 2) - (r1.top + r1.height / 2);
    const alto = Math.max(70, Math.abs(dy) * .45 + 50), dur = Math.max(320, 900 * f);
    const anim = vuela.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(.45) rotate(-12deg)`, opacity: 0 },
      { transform: `translate(${dx * .5}px, ${dy * .5 - alto}px) scale(.8) rotate(8deg)`, opacity: 1, offset: .5 },
      { transform: 'translate(0, 0) scale(1.06) rotate(0deg)', opacity: 1, offset: .88 },
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 }
    ], { duration: dur, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    await new Promise(ok => { anim.onfinish = ok; setTimeout(ok, dur + 200); });
    RD_PELUCHE_OCULTO = null;
    const el = valorCartaEl(sp, side, sl); if (el) el.style.visibility = '';
    vuela.remove();
    if (typeof playSound === 'function') try { playSound('place'); } catch (e) {}
    if (typeof estallidoDestellos === 'function' && el) estallidoDestellos(el, { colores: ['#ffffff', '#f4f1ea', '#ffd6e0'], anillo: '255,255,255', cantidad: 16 });
    const T = (es, en, ja) => { const l = window.CURRENT_LANG || 'es'; return l === 'en' ? en : l === 'ja' ? ja : es; };
    const nota = document.createElement('div'); nota.className = 'rd-peluche-nota'; nota.textContent = T('🧸 Regalo de Nugu', '🧸 A gift from Nugu', '🧸 ヌグからの贈り物');
    const r2 = (el || destino).getBoundingClientRect();
    Object.assign(nota.style, { left: (r2.left + r2.width / 2) + 'px', top: (r2.top - 6) + 'px' });
    document.body.appendChild(nota); setTimeout(() => nota.remove(), 1700);
    await new Promise(ok => setTimeout(ok, Math.max(250, 650 * f)));   // un momento para verlo antes de seguir
  } finally { RD_PELUCHE_OCULTO = null; }
}
