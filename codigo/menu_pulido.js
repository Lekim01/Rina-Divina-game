/* Riña Divina — MENÚ PULIDO   [Nuevo]
   - Opciones ordenadas por pestañas: Partida · Cartas · Sonido · Guardado · Pruebas.
   - «Pruebas»: «Desbloquear todo», para probar cualquier carta (Reki, las
     especiales…) sin tener que jugar mucho. Se puede quitar cuando se quiera:
     no borra ni cambia tu progreso de verdad.
   - Menú inicial, Perfil y estadísticas con un aspecto más cuidado.
   - Hitos: ahora es un libro (como «Cartas y mazos»): a la izquierda todas las
     cartas por grupos; a la derecha, el hito de la que elijas.
   No toca juego.js: envuelve sus funciones desde fuera. */
(function(){
  const L = () => window.CURRENT_LANG || 'es';
  const T = (es, en, ja) => ({ es, en, ja })[L()] || es;

  /* ══════════════ MODO PRUEBA: DESBLOQUEAR TODO ══════════════ */
  const PRUEBA_KEY = 'rd_modo_prueba', NIVEL_PRUEBA = 99;
  const modoPrueba = () => { try { return localStorage.getItem(PRUEBA_KEY) === '1'; } catch (e) { return false; } };
  window.rdModoPrueba = modoPrueba;
  if (typeof isCardUnlocked === 'function'){
    const o = isCardUnlocked;
    window.isCardUnlocked = isCardUnlocked = function(n){ return modoPrueba() ? true : o.apply(this, arguments); };
  }
  if (typeof loadProfile === 'function' && typeof saveProfile === 'function'){
    const oL = loadProfile, oS = saveProfile;
    window.loadProfile = loadProfile = function(){
      const p = oL.apply(this, arguments);
      if (modoPrueba() && p){ p._nivelReal = p.userLevel || 0; p.userLevel = Math.max(p.userLevel || 0, NIVEL_PRUEBA); }
      return p;
    };
    // al guardar, el nivel vuelve a ser el de verdad (más lo que se haya subido jugando)
    window.saveProfile = saveProfile = function(p){
      if (p && p._nivelReal !== undefined){
        const subio = Math.max(0, (p.userLevel || 0) - NIVEL_PRUEBA);
        p.userLevel = p._nivelReal + subio; delete p._nivelReal;
      }
      return oS.apply(this, arguments);
    };
  }
  if (typeof getHitoProgress === 'function'){
    const o = getHitoProgress;
    window.getHitoProgress = getHitoProgress = function(n){
      const p = o.apply(this, arguments);
      return (modoPrueba() && p) ? Object.assign({}, p, { done: true }) : p;
    };
  }
  function refrescarBloqueos(){
    const b = document.getElementById('btn-deck-game-menu');
    if (b && modoPrueba()){ b.classList.remove('btn-locked'); b.removeAttribute('tabindex'); }
    try { if (typeof renderCardBrowser === 'function') renderCardBrowser(); } catch (e) {}
  }
  if (typeof showMenu === 'function'){
    const o = showMenu;
    window.showMenu = showMenu = function(){ const r = o.apply(this, arguments); refrescarBloqueos(); return r; };
  }

  /* ══════════════ ESTILOS ══════════════ */
  const css = `
  /* ---- menú inicial ---- */
  #lang-selector{ position: fixed !important; top: 18px !important; right: 22px !important; }
  #screen-menu #menu-nav .btn{ opacity: .7; transition: letter-spacing .25s ease, color .2s ease, transform .2s ease, opacity .2s; }
  #screen-menu #menu-nav .btn:not(.btn-locked):hover{ opacity: 1 !important; letter-spacing: .2em; transform: translateY(-1px); }
  #screen-menu #menu-nav .btn.btn-locked{ opacity: .35; }
  #screen-menu #menu-nav #btn-menu-play{ opacity: 1; font-size: 1.6rem !important; letter-spacing: .24em; padding: 10px 0 18px !important; text-shadow: 0 0 22px rgba(201,168,76,.45); }
  #screen-menu #menu-nav #btn-profile-menu{ opacity: .8 !important; font-size: .9rem !important; margin-top: 22px !important; padding: 9px 22px !important; width: auto; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 999px !important; }
  #screen-menu #menu-nav #btn-profile-menu:hover{ opacity: 1 !important; border-color: rgba(201,168,76,.55) !important; color: var(--gold) !important; }
  #menu-version-label{ left: 50% !important; transform: translateX(-50%); bottom: 12px !important; }
  #menu-title{ cursor: default; user-select: none; }

  /* ---- opciones ---- */
  #options-box{ width: min(600px, calc(100vw - 32px)) !important; max-width: none !important; padding: 26px 28px 22px !important; border-radius: 10px !important;
    background: linear-gradient(165deg, #14131d, #0b0a12) !important; border: 1px solid rgba(201,168,76,.28) !important; box-shadow: 0 24px 60px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.03) !important; }
  #opt-title-label{ font-size: 1.25rem !important; letter-spacing: .14em !important; }
  #opt-filter-bar{ display: flex !important; gap: 4px !important; padding: 4px !important; margin: 4px 0 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 8px; flex-wrap: nowrap !important; }
  #opt-filter-bar .opt-cat-btn{ flex: 1; border: none !important; border-radius: 6px !important; padding: 8px 6px !important; background: transparent !important; color: var(--text-dim) !important; font-size: .78rem !important; white-space: nowrap; }
  #opt-filter-bar .opt-cat-btn.active{ background: rgba(201,168,76,.16) !important; color: var(--gold) !important; box-shadow: inset 0 0 0 1px rgba(201,168,76,.4); }
  #opt-filter-bar .opt-cat-btn.oculto{ display: none !important; }
  #options-box .opt-section{ max-height: min(56vh, 520px); overflow-y: auto; padding-right: 4px; }
  #options-box .option-row{ background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06) !important; border-radius: 7px; padding: 11px 14px !important; margin-bottom: 7px; gap: 14px; }
  #options-box .option-row label{ font-size: .88rem; line-height: 1.35; }
  #options-box .opt-grupo{ font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(201,168,76,.75); margin: 14px 2px 7px; }
  #options-box .opt-grupo:first-child{ margin-top: 2px; }
  #options-box .opt-toggle{ min-width: 64px; border-radius: 999px !important; padding: 5px 12px !important; }
  #options-box .opt-toggle.on{ background: rgba(201,168,76,.18) !important; }
  #options-box .opt-nota{ font-size: .74rem; color: var(--text-dim); line-height: 1.5; padding: 2px 4px 10px; }
  #options-box .opt-nota b{ color: var(--gold); font-weight: 400; }

  /* ---- perfil ---- */
  #profile-modal{ border-radius: 12px !important; border-color: rgba(201,168,76,.32) !important; background: radial-gradient(ellipse at 20% 0%, rgba(201,168,76,.08), transparent 55%), linear-gradient(165deg, #13121c, #0a0a12) !important; }
  #profile-header{ background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; padding: 16px 18px !important; }
  #profile-avatar-wrap img, #profile-avatar{ border-radius: 10px !important; box-shadow: 0 6px 18px rgba(0,0,0,.5), 0 0 0 2px rgba(201,168,76,.35); }
  #profile-name-display{ font-size: 1.6rem !important; letter-spacing: .06em; }
  .profile-section-label{ color: rgba(201,168,76,.8) !important; letter-spacing: .2em !important; }
  #profile-xp-segs{ gap: 6px !important; }
  .profile-xp-seg{ height: 10px !important; border-radius: 3px !important; border-color: rgba(201,168,76,.45) !important; max-width: 80px !important; }
  .profile-xp-seg.filled{ background: linear-gradient(180deg, #f0d48a, #c9a84c) !important; border-color: #c9a84c !important; box-shadow: 0 0 8px rgba(201,168,76,.45); }
  .profile-xp-seg.half{ background: linear-gradient(90deg, #e3c06a 50%, transparent 50%) !important; border-color: #c9a84c !important; }
  .pstat-cell{ border-radius: 8px !important; background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.015)) !important; transition: transform .15s, border-color .15s; }
  .pstat-cell:hover{ transform: translateY(-2px); border-color: rgba(201,168,76,.35) !important; }
  .pstat-val{ font-size: 1.7rem !important; }
  #profile-collection-bar{ height: 8px !important; border-radius: 99px !important; }
  #profile-collection-fill{ border-radius: 99px !important; background: linear-gradient(90deg, #8a6d2c, #f0d48a) !important; }

  /* ---- libro de Hitos ---- */
  #hl-overlay{ position: fixed; inset: 0; z-index: 320; display: none; align-items: center; justify-content: center; background: radial-gradient(ellipse at center, #14121c, #07060b); }
  #hl-overlay.show{ display: flex; }
  .hl-libro{ --c:#4a2c1c; --co:#2a170c; --oro:#d8b06a; --papel:#efe3c4; --papel-o:#dccaa0; --tinta:#2b1a10; --tinta-s:#6a4a30;
    position: relative; perspective: 12000px; width: min(1440px, 96vw); height: 94vh; display: flex; flex-direction: column; padding: 0 16px 16px; box-sizing: border-box;
    background: var(--c); border: 2px solid var(--co); border-radius: 8px; box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px var(--co), 0 20px 50px rgba(0,0,0,.6); font-family: 'KleeOne', serif; }
  .hl-cab{ display: flex; align-items: center; gap: 16px; padding: 12px 8px 10px; color: var(--oro); }
  .hl-cab h2{ font-size: 1.2rem; letter-spacing: .14em; margin: 0; color: var(--oro); }
  .hl-cab .hl-volver, .hl-cab .hl-cerrar{ background: none; border: none; color: var(--oro); cursor: pointer; font: inherit; font-size: .95rem; letter-spacing: .06em; }
  .hl-cab .hl-cerrar{ margin-left: auto; font-size: 1.3rem; }
  .hl-cab .hl-progreso{ display: flex; align-items: center; gap: 10px; font-size: .78rem; margin-left: 18px; }
  .hl-cab .hl-barra{ width: 160px; height: 7px; border-radius: 99px; background: rgba(0,0,0,.35); overflow: hidden; box-shadow: inset 0 0 0 1px rgba(216,176,106,.35); }
  .hl-cab .hl-barra b{ display: block; height: 100%; background: linear-gradient(90deg, #8a6d2c, #f0d48a); }
  .hl-paginas{ flex: 1; min-height: 0; display: flex; position: relative; border-radius: 3px; background: var(--papel);
    box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58;
    background-image: linear-gradient(90deg, rgba(120,80,30,.12), transparent 4%, transparent 45%, rgba(80,50,20,.25) 49.4%, rgba(40,20,5,.42) 50%, rgba(80,50,20,.25) 50.6%, transparent 55%, transparent 96%, rgba(120,80,30,.12)); }
  .hl-izq, .hl-der{ flex: 0 0 50%; width: 50%; box-sizing: border-box; overflow-y: auto; color: var(--tinta); scrollbar-width: thin; scrollbar-color: var(--tinta-s) transparent; }
  .hl-izq{ padding: 20px 30px 26px; }
  .hl-der{ padding: 26px 34px 30px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
  .hl-filtros{ display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 6px; }
  .hl-filtros button{ background: rgba(255,250,235,.45); color: var(--tinta); border: 1px solid rgba(106,74,48,.45); border-radius: 3px; padding: 5px 10px; font: inherit; font-size: .74rem; cursor: pointer; }
  .hl-filtros button.activo{ background: var(--papel-o); border-color: #8a5a10; color: #6a3a08; }
  .hl-filtros input{ flex: 1; min-width: 8em; background: rgba(255,250,235,.6); border: 1px solid rgba(106,74,48,.45); border-radius: 3px; padding: 6px 9px; color: var(--tinta); font: inherit; font-size: .82rem; }
  .hl-grupo{ font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; color: var(--tinta-s); border-bottom: 1px solid rgba(106,74,48,.35); padding: 14px 0 4px; margin-bottom: 10px; display: flex; justify-content: space-between; }
  .hl-rejilla{ display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 10px; }
  .hl-item{ position: relative; background: none; border: none; padding: 0; cursor: pointer; text-align: center; font: inherit; color: var(--tinta); }
  .hl-item .hl-mini{ position: relative; width: 100%; aspect-ratio: 2/3; border-radius: 5px; overflow: hidden; box-shadow: 0 2px 5px rgba(60,40,20,.4); border: 2px solid transparent; background: #1a1720; }
  .hl-item img{ width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) brightness(.7); }
  .hl-item.hecho img{ filter: none; }
  .hl-item.hecho .hl-mini::after{ content: '✓'; position: absolute; right: 3px; top: 2px; width: 18px; height: 18px; border-radius: 50%; background: #c9a84c; color: #2b1a10; font-size: .72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,.5); }
  .hl-item.actual .hl-mini{ border-color: #8a5a10; box-shadow: 0 0 0 2px rgba(201,168,76,.6), 0 3px 8px rgba(60,40,20,.5); }
  .hl-item span{ display: block; font-size: .7rem; margin-top: 4px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hl-item:hover .hl-mini{ transform: translateY(-2px); }
  .hl-ilus{ position: relative; width: min(230px, 36vh); aspect-ratio: 2/3; border-radius: 10px; overflow: hidden; border: 6px solid #fbf6e6; box-shadow: 0 8px 18px rgba(60,40,20,.45), 0 0 0 1px rgba(60,40,20,.3); transform: rotate(-1.2deg); background: #1a1720; }
  .hl-ilus img{ width: 100%; height: 100%; object-fit: cover; display: block; }
  .hl-ilus.pendiente img{ filter: grayscale(1) brightness(.75); }
  .hl-der h3{ margin: 6px 0 0; font-size: 1.8rem; font-weight: 400; color: var(--tinta); letter-spacing: .04em; }
  .hl-titulo{ font-size: .95rem; letter-spacing: .14em; text-transform: uppercase; }
  .hl-titulo.gold{ color: #8a5a10; } .hl-titulo.silver{ color: #5a5f6a; } .hl-titulo.shiny{ color: #7a3aa0; }
  .hl-cond{ max-width: 34em; font-size: 1.02rem; line-height: 1.65; color: var(--tinta); }
  .hl-estado{ display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: .78rem; letter-spacing: .08em; border: 1px solid rgba(106,74,48,.45); color: var(--tinta-s); background: rgba(255,250,235,.4); }
  .hl-estado.hecho{ border-color: #8a5a10; color: #6a3a08; background: rgba(201,168,76,.25); }
  .hl-shiny{ margin-top: 4px; background: rgba(255,250,235,.5); color: var(--tinta); border: 1px solid rgba(106,74,48,.5); border-radius: 999px; padding: 6px 16px; font: inherit; font-size: .82rem; cursor: pointer; }
  .hl-shiny.on{ background: linear-gradient(90deg, #f6e6ff, #fff2c8); border-color: #9a6ad0; color: #5a2a80; }
  .hl-vacio{ color: var(--tinta-s); font-style: italic; padding: 20px 0; }
  /* apertura (la página izquierda llega pegada a la tapa) */
  .hl-tapa{ position: absolute; top: -2px; bottom: -2px; left: 50%; width: calc(50% + 2px); z-index: 30; transform-origin: left center; transform-style: preserve-3d; cursor: pointer; display: none; }
  .hl-tapa .hl-cara{ position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .hl-tapa img.hl-cara{ image-rendering: pixelated; box-shadow: 10px 14px 0 rgba(0,0,0,.5); border-radius: 0 6px 6px 0; }
  .hl-tapa .hl-dorso{ transform: rotateY(180deg); overflow: hidden; border-radius: 8px 0 0 8px; }
  .hl-tapa .hl-copia{ position: absolute !important; left: 0; top: 0; width: 200% !important; height: 100% !important; margin: 0 !important; pointer-events: none; }
  .hl-libro.hl-cerrado{ background: linear-gradient(90deg, transparent 50%, var(--c) 50%) border-box no-repeat; border-color: transparent; box-shadow: none; }
  .hl-libro.hl-cerrado > :not(.hl-tapa){ clip-path: inset(-20px -20px -20px 50%); }
  .hl-libro.hl-cerrado::before{ content: ''; position: absolute; top: -2px; bottom: -2px; left: 50%; right: -2px; border-radius: 0 8px 8px 0; pointer-events: none;
    box-shadow: inset 0 0 0 2px var(--co), inset 0 0 0 5px #6a4128, inset 0 0 0 7px var(--co); clip-path: inset(0 0 0 8px); }
  .hl-cerrado .hl-tapa{ display: block; }
  .hl-cerrado.hl-abriendo .hl-tapa{ transform: rotateY(-180deg); transition: transform .95s cubic-bezier(.45,.05,.3,1); }
  @media (max-width: 900px){ .hl-paginas{ flex-direction: column; overflow-y: auto; } .hl-izq, .hl-der{ flex: none; width: 100%; overflow: visible; } }`;
  const st = document.createElement('style'); st.id = 'estilo-menu-pulido'; st.textContent = css; document.head.appendChild(st);

  /* ══════════════ OPCIONES ORDENADAS ══════════════ */
  const CATS = [
    { k: 'partida',  es: '🎲 Partida',  en: '🎲 Match',  ja: '🎲 対戦' },
    { k: 'cartas',   es: '🃏 Cartas',   en: '🃏 Cards',  ja: '🃏 カード' },
    { k: 'sonido',   es: '🔊 Sonido',   en: '🔊 Sound',  ja: '🔊 サウンド' },
    { k: 'guardado', es: '💾 Guardado', en: '💾 Saves',  ja: '💾 セーブ' },
    { k: 'pruebas',  es: '🧪 Pruebas',  en: '🧪 Testing', ja: '🧪 テスト' },
  ];
  function filaDe(id){ const el = document.getElementById(id); return el && el.closest('.option-row'); }
  function grupo(es, en, ja){ const d = document.createElement('div'); d.className = 'opt-grupo'; d.dataset.es = es; d.dataset.en = en; d.dataset.ja = ja; d.textContent = T(es, en, ja); return d; }
  function ordenarOpciones(){
    const box = document.getElementById('options-box'), bar = document.getElementById('opt-filter-bar');
    const visual = document.getElementById('opt-section-visual');
    if (!box || !bar || !visual || box.dataset.ordenado) return;
    box.dataset.ordenado = '1';
    const seccion = k => { let s = document.getElementById('opt-section-' + k); if (!s){ s = document.createElement('div'); s.className = 'opt-section'; s.id = 'opt-section-' + k; s.style.display = 'none'; box.appendChild(s); } return s; };
    const partida = seccion('partida'), cartas = seccion('cartas'), pruebas = seccion('pruebas');
    // Partida
    partida.appendChild(grupo('Cómo se juega', 'How you play', '遊び方'));
    ['opt-mobile-mode-btn', 'opt-paso-btn', 'opt-speed', 'opt-hand-raised-btn'].forEach(id => { const f = filaDe(id); if (f) partida.appendChild(f); });
    partida.appendChild(grupo('Tablero', 'Board', '盤面'));
    ['opt-tablero-btn'].forEach(id => { const f = filaDe(id); if (f) partida.appendChild(f); });
    // Cartas
    cartas.appendChild(grupo('Qué se ve en las cartas', 'What the cards show', 'カードの表示'));
    ['opt-show-name-btn', 'opt-show-type-btn', 'opt-show-type-text-btn', 'opt-show-effect-btn'].forEach(id => { const f = filaDe(id); if (f) cartas.appendChild(f); });
    cartas.appendChild(grupo('Tamaño y mano', 'Size and hand', 'サイズと手札'));
    ['opt-font-scale', 'opt-hand-opacity'].forEach(id => { const f = filaDe(id); if (f) cartas.appendChild(f); });
    // lo que quede en «Visual» (por si acaso) va a Partida
    [...visual.querySelectorAll('.option-row')].forEach(f => partida.appendChild(f));
    // el separador viejo bajo «Para móviles» ya no hace falta
    // Pruebas
    pruebas.appendChild(grupo('Para probar', 'For testing', 'テスト用'));
    const f = document.createElement('div'); f.className = 'option-row';
    f.innerHTML = '<label id="opt-prueba-label"></label><button id="opt-prueba-btn" class="opt-toggle" type="button"></button>';
    f.querySelector('button').addEventListener('click', () => {
      try { localStorage.setItem(PRUEBA_KEY, modoPrueba() ? '0' : '1'); } catch (e) {}
      try { playSound('uiClick'); } catch (e) {}
      pintarPruebas(); refrescarBloqueos();
    });
    pruebas.appendChild(f);
    const nota = document.createElement('div'); nota.className = 'opt-nota'; nota.id = 'opt-prueba-nota'; pruebas.appendChild(nota);
    // pestañas
    bar.innerHTML = '';
    CATS.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt-cat-btn'; b.dataset.cat = c.k; b.textContent = c[L()] || c.es;
      b.addEventListener('click', () => toggleOptCat(c.k));
      bar.appendChild(b);
    });
    visual.style.display = 'none'; visual.dataset.vacia = '1';
    // «Para móviles» vivía fuera de las pestañas: ya está dentro de Partida
    pintarPruebas();
  }
  function pintarPruebas(){
    const lb = document.getElementById('opt-prueba-label'), bt = document.getElementById('opt-prueba-btn'), nt = document.getElementById('opt-prueba-nota');
    if (!lb) return;
    lb.textContent = T('Desbloquear todo', 'Unlock everything', 'すべて解放');
    bt.textContent = modoPrueba() ? T('Sí', 'Yes', 'はい') : T('No', 'No', 'いいえ');
    bt.className = 'opt-toggle' + (modoPrueba() ? ' on' : '');
    nt.innerHTML = T('Todas las cartas (también Reki y las especiales), los niveles, las curiosidades y los hitos aparecen desbloqueados, para poder probarlo todo. <b>No cambia tu progreso de verdad</b>: al quitarlo, todo vuelve a como estaba.',
                     'All cards (Reki and the special ones too), levels, curiosities and milestones appear unlocked so you can test everything. <b>Your real progress is not changed</b>: turning it off puts everything back.',
                     'すべてのカード（レキや特別なカードも）、レベル、豆知識、実績が解放され、何でも試せます。<b>本当の進行状況は変わりません</b>。オフにすると元に戻ります。');
  }
  function retitular(){
    document.querySelectorAll('#opt-filter-bar .opt-cat-btn').forEach(b => { const c = CATS.find(x => x.k === b.dataset.cat); if (c) b.textContent = c[L()] || c.es; });
    document.querySelectorAll('#options-box .opt-grupo').forEach(g => { g.textContent = g.dataset[L()] || g.dataset.es; });
    pintarPruebas();
  }
  // por defecto se abre «Partida»
  window._openDefaultOptCat = _openDefaultOptCat = function(){
    ordenarOpciones();
    document.querySelectorAll('.opt-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === 'partida'));
    document.querySelectorAll('#options-box .opt-section').forEach(s => s.style.display = s.id === 'opt-section-partida' ? 'block' : 'none');
    pintarPruebas();
  };
  if (typeof applyTranslations === 'function'){
    const o = applyTranslations;
    window.applyTranslations = function(){ const r = o.apply(this, arguments); try { retitular(); } catch (e) {} return r; };
  }

  /* ══════════════ HITOS EN EL LIBRO ══════════════ */
  const HL = { filtro: 'all', busca: '', actual: null, tiempos: [], intervalo: null };
  function crearLibroHitos(){
    let ov = document.getElementById('hl-overlay'); if (ov) return ov;
    ov = document.createElement('div'); ov.id = 'hl-overlay';
    ov.innerHTML = `<div class="hl-libro">
      <div class="hl-cab"><button class="hl-volver" type="button"></button><h2 class="hl-tit"></h2>
        <div class="hl-progreso"><span class="hl-cuenta"></span><div class="hl-barra"><b></b></div></div>
        <button class="hl-cerrar" type="button">✕</button></div>
      <div class="hl-paginas"><div class="hl-izq"></div><div class="hl-der"></div></div>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector('.hl-volver').addEventListener('click', () => closeHitos());
    ov.querySelector('.hl-cerrar').addEventListener('click', () => closeHitos());
    return ov;
  }
  const grupoDe = n => (typeof TOKENS !== 'undefined' && TOKENS[n]) ? 'token' : (CARD_DB[n] && CARD_DB[n].value === 0) ? 'v0' : 'v1';
  function pintarHitos(){
    const ov = crearLibroHitos(), izq = ov.querySelector('.hl-izq'), scroll = izq.scrollTop;
    requestAnimationFrame(() => { izq.scrollTop = scroll; });
    const total = HITOS_ALL_CARDS.filter(n => HITOS_DEF[n] && HITOS_DEF[n].trackKey).length;
    const hechos = HITOS_ALL_CARDS.filter(n => isHitoDone(n)).length;
    ov.querySelector('.hl-volver').textContent = T('← Volver al menú', '← Back to menu', '← メニューへ');
    ov.querySelector('.hl-tit').textContent = T('Hitos', 'Milestones', '実績');
    ov.querySelector('.hl-cuenta').textContent = `${hechos} / ${total}`;
    ov.querySelector('.hl-barra b').style.width = (total ? hechos / total * 100 : 0) + '%';
    izq.innerHTML = '';
    const fil = document.createElement('div'); fil.className = 'hl-filtros';
    [['all', T('Todos', 'All', 'すべて')], ['done', T('Completados', 'Completed', '達成')], ['pend', T('Pendientes', 'Pending', '未達成')]].forEach(([k, txt]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.className = HL.filtro === k ? 'activo' : '';
      b.addEventListener('click', () => { HL.filtro = k; try { playSound('uiClick'); } catch (e) {} pintarHitos(); });
      fil.appendChild(b);
    });
    const inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = T('Buscar carta…', 'Search card…', 'カードを検索…'); inp.value = HL.busca;
    inp.addEventListener('input', () => { HL.busca = inp.value; const pos = inp.selectionStart; pintarHitos(); const n = document.querySelector('#hl-overlay .hl-filtros input'); if (n){ n.focus(); n.setSelectionRange(pos, pos); } });
    fil.appendChild(inp); izq.appendChild(fil);
    const busca = HL.busca.toLowerCase().trim();
    const GR = [['v1', T('Valor 1', 'Value 1', '価値1')], ['v0', T('Valor 0 · Realidades', 'Value 0 · Realities', '価値0・現実')], ['token', T('Tokens', 'Tokens', 'トークン')]];
    let alguno = false;
    GR.forEach(([g, titulo]) => {
      const nombres = HITOS_ALL_CARDS.filter(n => grupoDe(n) === g).filter(n => {
        const d = isHitoDone(n);
        if (HL.filtro === 'done' && !d) return false;
        if (HL.filtro === 'pend' && d) return false;
        if (busca && !n.toLowerCase().includes(busca)) return false;
        return true;
      });
      if (!nombres.length) return;
      alguno = true;
      const h = document.createElement('div'); h.className = 'hl-grupo';
      const enG = HITOS_ALL_CARDS.filter(n => grupoDe(n) === g), hechosG = enG.filter(n => isHitoDone(n)).length;
      h.innerHTML = `<span></span><span>${hechosG} / ${enG.length}</span>`; h.firstChild.textContent = titulo;
      izq.appendChild(h);
      const rej = document.createElement('div'); rej.className = 'hl-rejilla';
      nombres.forEach(n => {
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'hl-item' + (isHitoDone(n) ? ' hecho' : '') + (HL.actual === n ? ' actual' : '');
        b.innerHTML = `<div class="hl-mini"><img alt="" draggable="false"></div><span></span>`;
        b.querySelector('img').src = `./ilustraciones/${n}.jpg`; b.querySelector('img').onerror = function(){ this.style.display = 'none'; };
        b.querySelector('span').textContent = (typeof getCardDisplay === 'function' && getCardDisplay(n).displayName) || n;
        b.addEventListener('click', () => { HL.actual = n; try { playSound('uiClick'); } catch (e) {} pintarHitos(); });
        rej.appendChild(b);
      });
      izq.appendChild(rej);
    });
    if (!alguno){ const v = document.createElement('div'); v.className = 'hl-vacio'; v.textContent = T('Ninguna carta con ese filtro.', 'No cards match.', '該当するカードはありません。'); izq.appendChild(v); }
    pintarDetalle();
  }
  function pintarDetalle(){
    const der = document.querySelector('#hl-overlay .hl-der'); if (!der) return;
    const n = HL.actual || HITOS_ALL_CARDS[0];
    const def = HITOS_DEF[n] || {}, hecho = isHitoDone(n), disp = (typeof getHitoDisplay === 'function' ? getHitoDisplay(n) : {}) || {};
    der.innerHTML = '';
    const il = document.createElement('div'); il.className = 'hl-ilus' + (hecho ? '' : ' pendiente');
    const img = document.createElement('img'); img.src = `./ilustraciones/${n}.jpg`; img.alt = ''; img.onerror = () => { img.style.display = 'none'; };
    il.appendChild(img); der.appendChild(il);
    try { const prof = loadProfile(); if (hecho && def.rewardShinyCard && (prof.shinyCards || []).includes(def.rewardShinyCard) && typeof applyShinyIfUnlocked === 'function') applyShinyIfUnlocked(il, def.rewardShinyCard); } catch (e) {}
    const h = document.createElement('h3'); h.textContent = (typeof getCardDisplay === 'function' && getCardDisplay(n).displayName) || n; der.appendChild(h);
    if (disp.rewardTitle){ const tt = document.createElement('div'); tt.className = 'hl-titulo ' + (def.rewardTitleStyle || 'silver'); tt.textContent = `«${disp.rewardTitle}»`; der.appendChild(tt); }
    const c = document.createElement('div'); c.className = 'hl-cond'; c.textContent = disp.condition || T('Este hito todavía no tiene condición.', 'This milestone has no condition yet.', 'この実績にはまだ条件がありません。'); der.appendChild(c);
    const es = document.createElement('div'); es.className = 'hl-estado' + (hecho ? ' hecho' : '');
    es.textContent = hecho ? T('✦ Completado', '✦ Completed', '✦ 達成') : T('Pendiente', 'Pending', '未達成'); der.appendChild(es);
    if (hecho && def.rewardShinyCard){
      const prof = loadProfile(), on = (prof.shinyCards || []).includes(def.rewardShinyCard);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hl-shiny' + (on ? ' on' : '');
      b.textContent = on ? T('✦ Shiny activado', '✦ Shiny on', '✦ キラ ON') : T('Activar shiny en partida', 'Turn on shiny in matches', '対戦でキラを有効にする');
      b.addEventListener('click', () => { if (typeof toggleHitoShinyCard === 'function') toggleHitoShinyCard(def.rewardShinyCard, document.createElement('button')); pintarDetalle(); });
      der.appendChild(b);
    }
  }
  function copiarIzq(libro, tapa){
    const dorso = tapa.querySelector('.hl-dorso'); dorso.innerHTML = '';
    const copia = libro.cloneNode(true); copia.classList.remove('hl-cerrado', 'hl-abriendo'); copia.classList.add('hl-copia');
    copia.querySelectorAll('.hl-tapa').forEach(e => e.remove());
    copia.querySelectorAll('button, input').forEach(e => e.setAttribute('tabindex', '-1'));
    dorso.appendChild(copia);
    const a = libro.querySelector('.hl-izq'), b = copia.querySelector('.hl-izq'); if (a && b) b.scrollTop = a.scrollTop;
  }
  function abrirHitos(){
    const ov = crearLibroHitos(), libro = ov.querySelector('.hl-libro');
    let tapa = libro.querySelector('.hl-tapa');
    if (!tapa){
      tapa = document.createElement('div'); tapa.className = 'hl-tapa';
      tapa.innerHTML = '<img class="hl-cara" alt=""><div class="hl-cara hl-dorso"></div>';
      libro.appendChild(tapa);
    }
    if (typeof rdCrearPortada === 'function' && !tapa.dataset.lista){ tapa.querySelector('img').src = rdCrearPortada().toDataURL(); tapa.dataset.lista = '1'; }
    HL.tiempos.forEach(clearTimeout); HL.tiempos = []; clearInterval(HL.intervalo);
    libro.classList.remove('hl-abriendo'); libro.classList.add('hl-cerrado');
    copiarIzq(libro, tapa); void libro.offsetWidth;
    const fin = () => { HL.tiempos.forEach(clearTimeout); HL.tiempos = []; clearInterval(HL.intervalo); libro.classList.remove('hl-cerrado', 'hl-abriendo'); tapa.querySelector('.hl-dorso').innerHTML = ''; };
    HL.intervalo = setInterval(() => copiarIzq(libro, tapa), 150);
    HL.tiempos.push(setTimeout(() => libro.classList.add('hl-abriendo'), 420));
    HL.tiempos.push(setTimeout(fin, 1500));
    tapa.onclick = fin;
  }
  window.showHitos = showHitos = function(){
    try { playSound('uiClick'); } catch (e) {}
    HL.filtro = 'all'; HL.busca = ''; HL.actual = HL.actual || HITOS_ALL_CARDS[0];
    document.getElementById('screen-menu').style.display = 'none';
    const ov = crearLibroHitos(); pintarHitos(); ov.classList.add('show');
    abrirHitos();
  };
  window.closeHitos = closeHitos = function(){
    try { playSound('uiClick'); } catch (e) {}
    HL.tiempos.forEach(clearTimeout); clearInterval(HL.intervalo);
    const ov = document.getElementById('hl-overlay'); if (ov) ov.classList.remove('show');
    const viejo = document.getElementById('hitos-overlay'); if (viejo) viejo.classList.remove('show');
    document.getElementById('screen-menu').style.display = 'flex';
  };
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && document.getElementById('hl-overlay') && document.getElementById('hl-overlay').classList.contains('show')){ ev.preventDefault(); closeHitos(); }
  });


  /* ══════════════ APERTURA DE LIBRO GENÉRICA (perfil) ══════════════
     El libro cerrado está en su sitio; la tapa gira sobre el lomo llevando en
     su dorso una copia de la mitad izquierda, que cae justo encima de la de verdad. */
  const css2 = `
  .rdl-tapa{ position: absolute; top: -2px; bottom: -2px; left: 50%; width: calc(50% + 2px); z-index: 40; transform-origin: left center; transform-style: preserve-3d; cursor: pointer; display: none; }
  .rdl-tapa .rdl-cara{ position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .rdl-tapa img.rdl-cara{ image-rendering: pixelated; box-shadow: 10px 14px 0 rgba(0,0,0,.5); border-radius: 0 6px 6px 0; }
  .rdl-tapa .rdl-dorso{ transform: rotateY(180deg); overflow: hidden; border-radius: 8px 0 0 8px; }
  .rdl-tapa .rdl-copia{ position: absolute !important; left: 0 !important; top: 0 !important; width: 200% !important; height: 100% !important; max-width: none !important; max-height: none !important; margin: 0 !important; transform: none !important; opacity: 1 !important; pointer-events: none; }
  .rdl-tapa #profile-modal.rdl-copia{ width: 200% !important; height: 100% !important; max-width: none !important; position: absolute !important; left: 0 !important; top: 0 !important; transform: none !important; opacity: 1 !important; }
  .rdl-cerrado{ background: linear-gradient(90deg, transparent 50%, var(--c) 50%) border-box no-repeat !important; border-color: transparent !important; box-shadow: none !important; }
  .rdl-cerrado > :not(.rdl-tapa){ clip-path: inset(-20px -20px -20px 50%); }
  .rdl-cerrado::before{ content: ''; position: absolute; top: -2px; bottom: -2px; left: 50%; right: -2px; border-radius: 0 8px 8px 0; pointer-events: none; z-index: 1;
    box-shadow: inset 0 0 0 2px var(--co), inset 0 0 0 5px #6a4128, inset 0 0 0 7px var(--co); clip-path: inset(0 0 0 8px); }
  .rdl-cerrado .rdl-tapa{ display: block; }
  /* [Corregido] el perfil tiene su propio fondo de cuero (con id): mientras está cerrado, solo se ve la mitad derecha */
  #profile-modal.pf-libro.rdl-cerrado{ background: linear-gradient(90deg, transparent 50%, var(--c) 50%) border-box no-repeat !important; border-color: transparent !important; box-shadow: none !important; }
  .rdl-cerrado.rdl-abriendo .rdl-tapa{ transform: rotateY(-180deg); transition: transform .95s cubic-bezier(.45,.05,.3,1); }

  /* ---- PERFIL Y ESTADÍSTICAS como libro ---- */
  #profile-modal.pf-libro{ --c:#4a2c1c; --co:#2a170c; --oro:#d8b06a; --papel:#efe3c4; --papel-o:#dccaa0; --tinta:#2b1a10; --tinta-s:#6a4a30;
    --text: #2b1a10; --text-dim: #6a4a30; --gold: #8a5a10; --gold-light: #6a3a08; --silver: #4a5a7a; --border: rgba(106,74,48,.35); --border-light: rgba(106,74,48,.5); --bg2: #e6d6ae; --bg3: #dccaa0;
    width: min(1340px, 96vw) !important; max-width: none !important; height: 92vh; max-height: none !important; overflow: visible !important; padding: 0 16px 16px !important; box-sizing: border-box;
    display: flex; flex-direction: column; perspective: 12000px; border-radius: 8px !important;
    background: var(--c) !important; border: 2px solid var(--co) !important; box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px var(--co), 0 20px 50px rgba(0,0,0,.6) !important; font-family: 'KleeOne', serif; }
  #profile-modal.pf-libro .pf-cab{ display: flex; align-items: center; padding: 12px 8px 10px; color: var(--oro); }
  #profile-modal.pf-libro .pf-cab h2{ margin: 0; font-size: 1.2rem; letter-spacing: .14em; font-weight: 400; color: var(--oro); }
  #profile-modal.pf-libro #profile-close{ position: static !important; margin-left: auto; color: var(--oro) !important; font-size: 1.3rem; background: none; border: none; cursor: pointer; }
  #profile-modal.pf-libro .pf-paginas{ flex: 1; min-height: 0; display: flex; position: relative; border-radius: 3px; background: var(--papel); color: var(--tinta);
    box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58;
    background-image: linear-gradient(90deg, rgba(120,80,30,.12), transparent 4%, transparent 45%, rgba(80,50,20,.25) 49.4%, rgba(40,20,5,.42) 50%, rgba(80,50,20,.25) 50.6%, transparent 55%, transparent 96%, rgba(120,80,30,.12)); }
  #profile-modal.pf-libro .pf-izq, #profile-modal.pf-libro .pf-der{ flex: 0 0 50%; width: 50%; box-sizing: border-box; overflow-y: auto; padding: 24px 34px 28px; position: relative; scrollbar-width: thin; scrollbar-color: var(--tinta-s) transparent; }
  #profile-modal.pf-libro .pf-izq > *, #profile-modal.pf-libro .pf-der > *{ margin-bottom: 22px; }
  #profile-modal.pf-libro .profile-section-label{ color: var(--tinta-s) !important; border-bottom: 1px solid rgba(106,74,48,.35); padding-bottom: 4px; text-align: left; letter-spacing: .16em !important; }
  #profile-modal.pf-libro #profile-header{ background: rgba(255,250,235,.4) !important; border: 1px solid rgba(106,74,48,.35) !important; border-radius: 6px; }
  #profile-modal.pf-libro #profile-avatar{ border: 5px solid #fbf6e6 !important; box-shadow: 0 6px 14px rgba(60,40,20,.45) !important; transform: rotate(-2deg); }
  #profile-modal.pf-libro #profile-name-display{ color: var(--tinta) !important; }
  #profile-modal.pf-libro #profile-title-badge{ color: #8a5a10 !important; }
  #profile-modal.pf-libro button[id$="-edit-btn"]{ color: var(--tinta-s) !important; background: rgba(255,250,235,.7) !important; border-color: rgba(106,74,48,.4) !important; }
  #profile-modal.pf-libro .profile-xp-seg{ border-color: #8a6d2c !important; background: rgba(255,250,235,.5); }
  #profile-modal.pf-libro .profile-xp-seg.filled{ background: linear-gradient(180deg, #e3c06a, #a8822e) !important; }
  #profile-modal.pf-libro .pstat-cell{ background: rgba(255,250,235,.45) !important; border: 1px solid rgba(106,74,48,.3) !important; }
  #profile-modal.pf-libro .pstat-key{ color: var(--tinta-s) !important; }
  #profile-modal.pf-libro .pstat-val{ color: var(--tinta) !important; }
  #profile-modal.pf-libro #ps-wins{ color: #8a5a10 !important; } #profile-modal.pf-libro #ps-losses{ color: #9a2a2a !important; }
  #profile-modal.pf-libro #ps-draws{ color: #3a5a8a !important; } #profile-modal.pf-libro #ps-real{ color: #8a1a5a !important; }
  #profile-modal.pf-libro #cs-toggle-btn{ color: var(--tinta) !important; border-color: rgba(106,74,48,.45) !important; background: rgba(255,250,235,.5) !important; font-size: .78rem !important; padding: 7px 14px !important; }
  #profile-modal.pf-libro #profile-collection-bar{ background: rgba(106,74,48,.2) !important; }
  #profile-modal.pf-libro #profile-collection-text, #profile-modal.pf-libro #profile-sig-desc, #profile-modal.pf-libro #profile-sig-count{ color: var(--tinta-s) !important; }
  #profile-modal.pf-libro #profile-sig-name{ color: var(--tinta) !important; }
  #profile-modal.pf-libro #profile-signature-card{ border: 5px solid #fbf6e6 !important; box-shadow: 0 6px 14px rgba(60,40,20,.45) !important; transform: rotate(1.5deg); }
  #profile-modal.pf-libro .pf-der *, #profile-modal.pf-libro #card-stats-list *{ border-color: rgba(106,74,48,.35); }
  #profile-modal.pf-libro #profile-games-list *, #profile-modal.pf-libro #pgame-filter-row *, #profile-modal.pf-libro #card-stats-list *{ color: var(--tinta); }
  #profile-modal.pf-libro .pgame-row, #profile-modal.pf-libro #pgame-filter-row button, #profile-modal.pf-libro .cs-sort-row button{ background: rgba(255,250,235,.45) !important; }
  #profile-modal.pf-libro #profile-replay-panel{ background: var(--papel) !important; color: var(--tinta); }
  #profile-modal.pf-libro #profile-replay-panel.show, #profile-modal.pf-libro #profile-replay-panel.open{ position: absolute; inset: 0; z-index: 5; overflow-y: auto; padding: 24px 30px; }
  @media (max-width: 900px){ #profile-modal.pf-libro{ height: auto; max-height: 94vh !important; } #profile-modal.pf-libro .pf-paginas{ flex-direction: column; overflow-y: auto; } #profile-modal.pf-libro .pf-izq, #profile-modal.pf-libro .pf-der{ flex: none; width: 100%; overflow: visible; } }

  /* ---- carteles del centro («Revelas tus cartas», «Turno X de Y»…): en una caja de libro ---- */
  body .ritmo-cartel{ background: linear-gradient(180deg, #553321, #3a2214) !important; border: 1px solid #c9a84c; border-radius: 6px; padding: 12px 30px !important;
    box-shadow: inset 0 0 0 1px #2a170c, inset 0 0 0 3px rgba(216,176,106,.25), 0 10px 30px rgba(0,0,0,.65);
    color: #f6e9c8; -webkit-text-stroke: .6px rgba(20,10,4,.7);
    text-shadow: 0 0 1px #140a04, 1px 1px 0 #140a04, -1px -1px 0 #140a04, 1px -1px 0 #140a04, -1px 1px 0 #140a04, 0 2px 10px rgba(0,0,0,.8) !important; }
  body .ritmo-cartel .rc-linea{ width: 46px; background: linear-gradient(90deg, transparent, #d8b06a, transparent) !important; }
  body .ritmo-cartel.rc-tuyo{ color: #cfe0ff; border-color: #7aa0e8; }
  body .ritmo-cartel.rc-rival{ color: #ffd2cc; border-color: #e07a70; }
  body .ritmo-cartel.rc-ultimo{ color: #ffe9a8; }

  /* ---- botón del menú de la partida (pixel art) y sus opciones, estilo libro ---- */
  #fab-toggle{ font-size: 0 !important; color: transparent !important; width: 46px !important; height: 46px !important; padding: 0 !important; border: none !important; border-radius: 0 !important;
    background: var(--ico-fab) center / contain no-repeat !important; image-rendering: pixelated; filter: drop-shadow(0 3px 4px rgba(0,0,0,.6)); transition: transform .15s; }
  #fab-toggle:hover{ transform: scale(1.08); }
  #fab-toggle.open{ background-image: var(--ico-fab-x) !important; }
  #fab-menu{ z-index: 9300 !important; }   /* por encima de las copas de los árboles del Prado */
  #fab-backdrop{ z-index: 9290 !important; }
  #fab-items{ gap: 7px !important; }
  #fab-menu-title{ color: #d8b06a !important; letter-spacing: .2em !important; }
  #fab-items .fab-item{ background: linear-gradient(180deg, #5a3622, #3c2315) !important; border: 1px solid #c9a84c !important; border-radius: 5px !important; color: #f4e6c4 !important;
    box-shadow: inset 0 0 0 1px #2a170c, inset 0 1px 0 rgba(255,230,180,.15), 0 4px 10px rgba(0,0,0,.5) !important; font-family: 'KleeOne', serif !important; text-shadow: 0 1px 0 #140a04; }
  #fab-items .fab-item:hover{ background: linear-gradient(180deg, #6a412a, #4a2c1c) !important; border-color: #f0d48a !important; color: #fff6dc !important; }
  #fab-items .fab-item.btn-danger{ border-color: #c86a5a !important; color: #ffd0c8 !important; }`;
  const st2 = document.createElement('style'); st2.id = 'estilo-menu-pulido-2'; st2.textContent = css2; document.head.appendChild(st2);

  function abrirLibroRD(libro, selIzq){
    if (!libro) return;
    let tapa = libro.querySelector(':scope > .rdl-tapa');
    if (!tapa){
      tapa = document.createElement('div'); tapa.className = 'rdl-tapa';
      tapa.innerHTML = '<img class="rdl-cara" alt=""><div class="rdl-cara rdl-dorso"></div>';
      libro.appendChild(tapa);
    }
    if (typeof rdCrearPortada === 'function' && !tapa.dataset.lista){ tapa.querySelector('img').src = rdCrearPortada().toDataURL(); tapa.dataset.lista = '1'; }
    const copiar = () => {
      const dorso = tapa.querySelector('.rdl-dorso'); dorso.innerHTML = '';
      const copia = libro.cloneNode(true); copia.classList.remove('rdl-cerrado', 'rdl-abriendo'); copia.classList.add('rdl-copia');
      copia.querySelectorAll('.rdl-tapa').forEach(e => e.remove());
      // la copia conserva los ids (mismo aspecto); va después en la página, así que getElementById sigue dando los de verdad
      copia.querySelectorAll('button, input').forEach(e => e.setAttribute('tabindex', '-1'));
      dorso.appendChild(copia);
      const a = libro.querySelector(selIzq), b = copia.querySelector(selIzq); if (a && b) b.scrollTop = a.scrollTop;
    };
    clearInterval(libro._rdlInt); (libro._rdlT || []).forEach(clearTimeout); libro._rdlT = [];
    libro.classList.remove('rdl-abriendo'); libro.classList.add('rdl-cerrado');
    copiar(); void libro.offsetWidth;
    const fin = () => { clearInterval(libro._rdlInt); libro._rdlT.forEach(clearTimeout); libro.classList.remove('rdl-cerrado', 'rdl-abriendo'); tapa.querySelector('.rdl-dorso').innerHTML = ''; };
    libro._rdlInt = setInterval(copiar, 150);
    libro._rdlT.push(setTimeout(() => libro.classList.add('rdl-abriendo'), 420));
    libro._rdlT.push(setTimeout(fin, 1500));
    tapa.onclick = fin;
  }
  window.abrirLibroRD = abrirLibroRD;

  /* el perfil: dos páginas (izquierda: quién eres y tus partidas; derecha: colección, carta insignia y últimas partidas) */
  function perfilComoLibro(){
    const m = document.getElementById('profile-modal'); if (!m) return false;
    const puede = !(typeof OPTIONS !== 'undefined' && OPTIONS.mobileMode) && innerWidth >= 900;
    if (!puede) return false;
    if (!m.querySelector('.pf-paginas')){
      const cab = document.createElement('div'); cab.className = 'pf-cab'; cab.innerHTML = '<h2 class="pf-titulo"></h2>';
      const pag = document.createElement('div'); pag.className = 'pf-paginas';
      const izq = document.createElement('div'); izq.className = 'pf-izq';
      const der = document.createElement('div'); der.className = 'pf-der';
      pag.append(izq, der);
      ['profile-header', 'profile-xp-section', 'profile-stats-section', 'profile-card-stats-section'].forEach(id => { const e = document.getElementById(id); if (e) izq.appendChild(e); });
      ['profile-collection-section', 'profile-signature-section', 'profile-games-section', 'profile-replay-panel'].forEach(id => { const e = document.getElementById(id); if (e) der.appendChild(e); });
      const cerrar = document.getElementById('profile-close'); if (cerrar) cab.appendChild(cerrar);
      m.prepend(cab); m.appendChild(pag);
    }
    m.querySelector('.pf-titulo').textContent = T('Perfil y estadísticas', 'Profile & Stats', 'プロフィールと統計');
    m.classList.add('pf-libro');
    return true;
  }
  if (typeof showPlayerProfile === 'function'){
    const o = showPlayerProfile;
    window.showPlayerProfile = showPlayerProfile = function(){
      const r = o.apply(this, arguments);
      try { if (perfilComoLibro()) abrirLibroRD(document.getElementById('profile-modal'), '.pf-izq'); } catch (e) { console.warn(e); }
      return r;
    };
  }

  /* ══════════════ ICONO DEL MENÚ DE LA PARTIDA (pixel art) ══════════════ */
  function iconoFab(cerrar){
    const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
    const px = (i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++){
      const borde = i === 0 || j === 0 || i === 15 || j === 15, esq = (i < 1 || i > 14) && (j < 1 || j > 14);
      if (esq) continue;
      if (borde) px(i, j, '#2a170c');
      else if (i === 1 || j === 1) px(i, j, '#f0d48a');
      else if (i === 14 || j === 14) px(i, j, '#8a6d2c');
      else px(i, j, (i + j * 3) % 7 === 0 ? '#56341f' : '#4a2c1c');
    }
    if (!cerrar){
      [4, 7, 10].forEach(y => { for (let i = 4; i <= 11; i++){ px(i, y, '#efe3c4'); px(i, y + 1, '#a88a58'); } px(3, y, '#d8b06a'); px(3, y + 1, '#8a6d2c'); });
    } else {
      for (let k = 0; k < 7; k++){ px(4 + k, 4 + k, '#efe3c4'); px(5 + k, 4 + k, '#efe3c4'); px(11 - k, 4 + k, '#efe3c4'); px(10 - k, 4 + k, '#efe3c4'); px(4 + k, 5 + k, '#a88a58'); px(11 - k, 5 + k, '#a88a58'); }
    }
    return c.toDataURL();
  }
  try {
    document.documentElement.style.setProperty('--ico-fab', `url("${iconoFab(false)}")`);
    document.documentElement.style.setProperty('--ico-fab-x', `url("${iconoFab(true)}")`);
  } catch (e) {}

  // al cargar
  try { ordenarOpciones(); refrescarBloqueos(); } catch (e) { console.warn(e); }
})();
