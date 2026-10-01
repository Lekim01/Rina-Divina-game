/* Riña Divina — PANTALLAS CON EL ESTILO DEL JUEGO   [Nuevo]
   1. Menú inicial: alfombra roja de terciopelo con marco dorado (las mismas
      texturas del tablero Trono) y botones de cuero con borde dorado y sombra,
      que se hunden al pulsarlos.
   2. Final de la partida: un libro que se abre.
      - Página izquierda: el resultado de cada espacio (tus cartas y las del
        rival, la puntuación en píxeles y quién lo ganó), tu nivel con las
        cuatro barritas blancas, qué te ha dado la partida y qué trae el
        siguiente nivel, y los botones.
      - Página derecha: lo desbloqueado y por qué. Si no hay nada nuevo, los
        próximos retos (cartas aún bloqueadas y cómo conseguirlas).
   3. Perfil: la sección de números se llama «Estadísticas» y lleva una barra
      con el reparto de victorias, empates y derrotas. Cada partida del
      historial muestra el marcador de los tres espacios y, al abrirla, el
      tablero final con las cartas y la puntuación de cada espacio. */
(function(){
  const L = () => window.CURRENT_LANG || 'es';
  const T = (es, en, ja) => ({ es, en, ja })[L()] || es;
  const ancho = () => !(typeof OPTIONS !== 'undefined' && OPTIONS.mobileMode) && innerWidth >= 900;

  const css = `
  /* ══════ botón de cuero (menú y final) ══════ */
  #screen-menu #menu-nav .btn, .fin-libro .fin-botones .btn, #dg-start-btn, .rd-cuero{
    opacity: 1 !important; width: 100%; max-width: 300px; padding: 11px 0 !important; margin: 0 !important;
    color: #f4e6c4 !important; font-family: 'KleeOne', serif !important; font-size: 1.02rem !important; letter-spacing: .14em !important;
    background: linear-gradient(180deg, #6e442b, #4e2f1d 55%, #3e2416) !important; border: 2px solid #22130a !important; border-radius: 7px !important;
    box-shadow: inset 0 0 0 1px #c9a84c, inset 0 0 0 3px #3a2214, inset 0 1px 0 4px rgba(255,230,180,.08), 0 5px 0 #22130a, 0 9px 16px rgba(0,0,0,.55) !important;
    text-shadow: 0 1px 0 #140a04, 0 0 2px #140a04; transform: translateY(0); transition: transform .12s ease, box-shadow .12s ease, filter .15s ease !important; cursor: pointer; position: relative; }
  #screen-menu #menu-nav .btn:not(.btn-locked):hover, .fin-libro .fin-botones .btn:not(:disabled):hover, #dg-start-btn:hover, .rd-cuero:not(:disabled):hover{
    transform: translateY(-2px) !important; filter: brightness(1.13); letter-spacing: .14em !important; color: #fff6dc !important;
    box-shadow: inset 0 0 0 1px #f0d48a, inset 0 0 0 3px #3a2214, inset 0 1px 0 4px rgba(255,230,180,.1), 0 7px 0 #22130a, 0 12px 20px rgba(0,0,0,.55) !important; }
  #screen-menu #menu-nav .btn:not(.btn-locked):active, .fin-libro .fin-botones .btn:not(:disabled):active, #dg-start-btn:active, .rd-cuero:not(:disabled):active{
    transform: translateY(4px) !important; box-shadow: inset 0 0 0 1px #c9a84c, inset 0 0 0 3px #3a2214, 0 1px 0 #22130a, 0 3px 6px rgba(0,0,0,.5) !important; }


  /* ══════ 0. FUNDIDOS ENTRE PANTALLAS ══════ */
  #rd-fundido{ position: fixed; inset: 0; z-index: 99990; background: #0b0505; opacity: 0; pointer-events: none; transition: opacity .26s ease; }
  #rd-fundido.ver{ opacity: 1; pointer-events: auto; }
  #rd-fundido.sale{ transition-duration: .5s; }
  /* el fondo del menú sigue detrás de los libros y ventanas que se abren desde él */
  body.menu-con-alfombra #card-browser-overlay.fullscreen-mode, body.menu-con-alfombra #hl-overlay, body.menu-con-alfombra #hitos-overlay,
  body.menu-con-alfombra #options-overlay, body.menu-con-alfombra #deck-game-overlay, body.menu-con-alfombra #profile-overlay, body.menu-con-alfombra #modal-overlay, body.menu-con-alfombra #amigo-overlay{
    background: rgba(24,4,3,.5) !important; }

  /* ══════ JUGAR CON MAZO: libro de cuero y pergamino ══════ */
  #deck-game-overlay{ backdrop-filter: blur(2px); }
  #deck-game-box{ background: #4a2c1c !important; border: 2px solid #2a170c !important; border-radius: 8px !important; padding: 0 14px 14px !important; font-family: 'KleeOne', serif;
    box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px #2a170c, 0 20px 50px rgba(0,0,0,.6) !important; }
  #deck-game-header{ background: transparent !important; border: none !important; padding: 12px 8px 10px !important; }
  #deck-game-header h2{ color: #d8b06a !important; letter-spacing: .14em !important; font-weight: 400 !important; }
  #deck-game-header button{ color: #d8b06a !important; background: none !important; border: none !important; font-size: 1.3rem !important; }
  #deck-game-layout{ background: #efe3c4 !important; border-radius: 3px !important; color: #2b1a10; box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58; overflow: hidden; }
  #dg-sidebar{ background: linear-gradient(90deg, rgba(120,80,30,.1), rgba(120,80,30,.04) 90%, rgba(80,50,20,.22)) !important; border-right: 1px solid rgba(106,74,48,.35) !important; }
  #dg-sidebar > button{ background: linear-gradient(180deg, #6e442b, #4e2f1d) !important; color: #f4e6c4 !important; border: 1px solid #22130a !important; border-radius: 5px !important;
    box-shadow: inset 0 0 0 1px #c9a84c, 0 3px 0 #22130a !important; font-family: 'KleeOne', serif !important; }
  #dg-sidebar > button.active{ background: linear-gradient(180deg, #8a5a2a, #5a3622) !important; color: #fff3c8 !important; }
  #dg-deck-list, #dg-deck-list *{ color: #2b1a10; }
  #dg-deck-list .cb-deck-item{ background: rgba(255,250,235,.6) !important; border: 1px solid rgba(106,74,48,.35) !important; border-radius: 6px !important; }
  #dg-deck-list .cb-deck-item:hover{ border-color: #8a5a10 !important; background: rgba(255,250,235,.85) !important; }
  #dg-deck-list .cb-deck-item.selected{ border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,.45) !important; }
  #dg-deck-list .cb-deck-count, #dg-deck-list .cb-deck-preset-badge{ color: #6a4a30 !important; }
  #dg-deck-list .cb-deck-thumb-wrap{ border: 2px solid #fbf6e6 !important; box-shadow: 0 2px 5px rgba(60,40,20,.35); }
  #dg-deck-list > div:not(.cb-deck-item){ color: #6a4a30 !important; }
  #dg-main, #dg-footer{ background: transparent !important; }
  #dg-footer{ border-top: 1px solid rgba(106,74,48,.3) !important; }
  .dg-slot{ background: rgba(255,250,235,.5) !important; border: 1px solid rgba(106,74,48,.4) !important; border-radius: 8px !important; color: #2b1a10 !important; transition: box-shadow .2s, border-color .2s, transform .2s; }
  .dg-slot:hover{ transform: translateY(-2px); }
  .dg-slot.active-slot{ border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,.55), 0 8px 18px rgba(60,40,20,.25) !important; background: rgba(255,250,235,.8) !important; }
  .dg-slot-label{ color: #6a4a30 !important; letter-spacing: .18em !important; }
  .dg-slot-thumb-wrap{ border: 5px solid #fbf6e6 !important; border-radius: 4px !important; box-shadow: 0 6px 14px rgba(60,40,20,.4) !important; background: #2a170c url(./ilustraciones/card-back.jpg) center / cover !important; overflow: hidden; }
  #dg-slot-0 .dg-slot-thumb-wrap{ transform: rotate(-2deg); } #dg-slot-1 .dg-slot-thumb-wrap{ transform: rotate(2deg); }
  .dg-slot-empty{ opacity: 0 !important; }
  .dg-slot-name{ color: #2b1a10 !important; font-size: 1rem !important; }
  .dg-random-btn{ background: rgba(255,250,235,.6) !important; color: #6a4a30 !important; border: 1px solid rgba(106,74,48,.4) !important; border-radius: 4px !important; font-family: 'KleeOne', serif !important; }
  .dg-random-btn:hover{ border-color: #8a5a10 !important; color: #2b1a10 !important; }
  .dg-random-btn.active{ background: linear-gradient(180deg, #6e442b, #4e2f1d) !important; color: #ffe9a8 !important; border-color: #22130a !important; box-shadow: inset 0 0 0 1px #c9a84c; }
  .dg-slot-vs{ color: #8a5a10 !important; font-size: 1.6rem !important; letter-spacing: .1em; text-shadow: 0 1px 0 #fff6e0; }
  #dg-deck-preview{ background: #efe3c4 !important; border: 2px solid #4a2c1c !important; color: #2b1a10 !important; box-shadow: 0 10px 30px rgba(0,0,0,.5) !important; }
  #dg-deck-preview *{ color: #2b1a10; }

  /* ══════ 1. MENÚ INICIAL ══════ */
  #menu-alfombra{ position: fixed; inset: 0; z-index: -1; pointer-events: none; display: none; background-color: #7a1814; background-size: 96px 96px; image-rendering: pixelated; }
  body.menu-con-alfombra #menu-alfombra{ display: block; }
  #menu-alfombra .ma-vineta{ position: absolute; inset: 0; background: radial-gradient(ellipse 62% 70% at 50% 50%, transparent 40%, rgba(30,4,3,.62) 100%); }
  #menu-alfombra .ma-marco{ position: absolute; inset: 8px; border-style: solid; border-width: 18px; border-image-slice: 6; border-image-repeat: stretch; border-radius: 24px; image-rendering: pixelated; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5)); }
  body.menu-con-alfombra #menu-gotas{ opacity: .55; }
  body.menu-con-alfombra #screen-menu h1{ color: #fff3d6 !important; text-shadow: 0 0 1px #2a0503, 2px 2px 0 #2a0503, -2px -2px 0 #2a0503, 2px -2px 0 #2a0503, -2px 2px 0 #2a0503, 0 6px 18px rgba(20,2,1,.8); }
  body.menu-con-alfombra #screen-menu h1::after{ height: 3px !important; background: linear-gradient(90deg, transparent, #c08a1c 15%, #ffe27a 50%, #c08a1c 85%, transparent) !important; box-shadow: 0 2px 0 rgba(42,5,3,.6); }
  #screen-menu #menu-nav{ gap: 13px; max-width: 340px !important; }
  #screen-menu #menu-nav .menu-sep{ display: none !important; }
  #screen-menu #menu-nav #btn-menu-play{ font-size: 1.45rem !important; letter-spacing: .26em !important; padding: 15px 0 !important; max-width: 340px; color: #ffe9a8 !important; margin-bottom: 6px !important;
    box-shadow: inset 0 0 0 2px #e3b84c, inset 0 0 0 4px #3a2214, inset 0 1px 0 5px rgba(255,230,180,.1), 0 6px 0 #22130a, 0 11px 20px rgba(0,0,0,.6) !important; }
  #screen-menu #menu-nav #btn-menu-play:not(.btn-locked):hover{ letter-spacing: .26em !important; color: #fff3c8 !important; }
  #screen-menu #menu-nav .btn.btn-locked{ filter: grayscale(.55) brightness(.7); cursor: not-allowed; }
  #screen-menu #menu-nav .btn .gema{ position: absolute; left: 16px; top: 50%; width: 10px; height: 10px; margin-top: -5px; transform: rotate(45deg); background: var(--gema, #d8b06a);
    box-shadow: inset 2px 2px 0 rgba(255,255,255,.45), inset -2px -2px 0 rgba(0,0,0,.35), 0 0 0 1px #22130a; }
  #screen-menu #menu-nav #btn-profile-menu{ width: 250px !important; max-width: 250px !important; font-size: .88rem !important; padding: 9px 0 !important; margin-top: 8px !important; border-radius: 999px !important; }
  #screen-menu #menu-nav #btn-profile-menu:hover{ border-color: #22130a !important; }
  body.menu-con-alfombra #lang-selector .lang-btn{ background: linear-gradient(180deg, #5a3622, #3c2315) !important; border: 1px solid #c9a84c !important; color: #f4e6c4 !important; border-radius: 4px !important; box-shadow: 0 3px 0 #22130a; }
  body.menu-con-alfombra #lang-selector .lang-btn.lang-btn-active{ background: linear-gradient(180deg, #8a5a2a, #5a3622) !important; color: #fff3c8 !important; }
  body.menu-con-alfombra #lang-selector .lang-sep{ color: transparent !important; }
  #screen-menu #menu-nav .btn.btn-locked::after{ right: 12px !important; color: #f4e6c4 !important; opacity: .85 !important; font-size: .66rem !important; }
  body.menu-con-alfombra #web-btn{ background: linear-gradient(180deg, #5a3622, #3c2315) !important; border: 1px solid #c9a84c !important; color: #f4e6c4 !important; box-shadow: 0 3px 0 #22130a, 0 6px 12px rgba(0,0,0,.45) !important; }
  body.menu-con-alfombra #menu-version-label{ color: rgba(255,233,200,.55) !important; bottom: 34px !important; }

  /* ══════ 2. FINAL DE LA PARTIDA: el libro ══════ */
  #end-overlay.fin-modo #end-wrapper{ padding: 0 !important; justify-content: center; overflow: hidden !important; }
  #end-overlay.fin-modo #end-panel{ display: none !important; }
  .fin-libro{ --c:#4a2c1c; --co:#2a170c; --papel:#efe3c4; --tinta:#2b1a10; --tinta-s:#6a4a30; position: relative; width: min(1180px, 95vw); height: min(780px, 93vh);
    display: flex; flex-direction: column; padding: 0 16px 16px; box-sizing: border-box; perspective: 12000px; font-family: 'KleeOne', serif;
    background: var(--c); border: 2px solid var(--co); border-radius: 8px; box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px var(--co), 0 20px 50px rgba(0,0,0,.6);
    animation: finSube .45s cubic-bezier(.22,1,.36,1); }
  @keyframes finSube{ from{ transform: translateY(26px); opacity: 0; } to{ transform: none; opacity: 1; } }
  .fin-cab{ display: flex; align-items: baseline; gap: 18px; padding: 10px 10px 9px; }
  .fin-cab #end-title{ font-size: 1.9rem !important; letter-spacing: .22em; font-weight: 400; margin: 0; padding: 0; text-shadow: 0 2px 0 #140a04, 0 0 2px #140a04; }
  .fin-cab .fin-sub{ color: #d8b06a; font-size: .9rem; letter-spacing: .08em; }
  .fin-paginas{ flex: 1; min-height: 0; display: flex; position: relative; border-radius: 3px; background: var(--papel); color: var(--tinta);
    box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58;
    background-image: linear-gradient(90deg, rgba(120,80,30,.12), transparent 4%, transparent 45%, rgba(80,50,20,.25) 49.4%, rgba(40,20,5,.42) 50%, rgba(80,50,20,.25) 50.6%, transparent 55%, transparent 96%, rgba(120,80,30,.12)); }
  .fin-izq, .fin-der{ flex: 0 0 50%; width: 50%; box-sizing: border-box; overflow-y: auto; padding: 20px 32px 24px; scrollbar-width: thin; scrollbar-color: var(--tinta-s) transparent; display: flex; flex-direction: column; gap: 16px; }
  .fin-titulo{ color: var(--tinta-s); font-size: .74rem; letter-spacing: .2em; text-transform: uppercase; border-bottom: 1px solid rgba(106,74,48,.35); padding-bottom: 4px; }
  /* resultado de los espacios */
  .pm-tablero{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .pm-esp{ position: relative; border-radius: 6px; padding: 8px 6px 9px; background: rgba(255,250,235,.5); border: 1px solid rgba(106,74,48,.35); display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .pm-esp.gana-yo{ background: linear-gradient(180deg, rgba(120,170,255,.16), rgba(255,250,235,.5) 60%); border-color: #5a7ab8; box-shadow: inset 0 0 0 1px rgba(90,122,184,.35); }
  .pm-esp.gana-ia{ background: linear-gradient(0deg, rgba(220,90,80,.14), rgba(255,250,235,.5) 60%); border-color: #b85a52; box-shadow: inset 0 0 0 1px rgba(184,90,82,.3); }
  .pm-esp-nombre{ font-size: .7rem; letter-spacing: .16em; color: var(--tinta-s); text-transform: uppercase; }
  .pm-fila{ display: flex; gap: 4px; justify-content: center; min-height: 59px; }
  .pm-mini{ position: relative; width: 42px; height: 59px; border-radius: 3px; overflow: hidden; background: #2a170c; border: 2px solid #fbf6e6; box-shadow: 0 2px 4px rgba(60,40,20,.4); flex: none; }
  .pm-mini img{ width: 100%; height: 100%; object-fit: cover; display: block; }
  .pm-mini .pm-v{ position: absolute; left: 2px; bottom: 1px; font-size: .74rem; line-height: 1; padding: 1px 2px; color: #fff; text-shadow: 0 0 2px #000, 0 0 2px #000; font-weight: 700; }
  .pm-mini .pm-v.v0{ color: #bfe0ff; }
  .pm-mini.vacio{ background: rgba(106,74,48,.12); border: 1px dashed rgba(106,74,48,.35); box-shadow: none; }
  .pm-mini.oculta{ filter: brightness(.85); }
  .pm-marcador{ display: flex; align-items: center; gap: 8px; }
  .pm-marcador img{ height: 28px; image-rendering: pixelated; }
  .pm-marcador .pm-raya{ color: var(--tinta-s); font-size: .8rem; }
  .pm-corona{ display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box; margin-top: -2px; font-size: .62rem; letter-spacing: .08em; padding: 1px 7px; border-radius: 3px; color: #fff; }
  .pm-corona.yo{ background: #4a6aa8; } .pm-corona.ia{ background: #a84a42; } .pm-corona.nadie{ background: #8a7a6a; }
  .pm-esp .pm-ef:empty{ display: none; }
  .pm-replay .pm-mini{ width: 33px; height: 46px; } .pm-replay .pm-fila{ min-height: 46px; } .pm-replay .pm-marcador img{ height: 22px; }
  .pm-esp .pm-ef{ font-size: .6rem; color: var(--tinta-s); text-align: center; line-height: 1.25; max-width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 1.5em; }
  .pm-lado{ font-size: .58rem; letter-spacing: .14em; color: var(--tinta-s); }
  /* nivel: banda de cuero con las cuatro barritas blancas */
  .fin-nivel{ background: linear-gradient(180deg, #553321, #3a2214); border: 1px solid #c9a84c; border-radius: 6px; padding: 14px 16px 12px;
    box-shadow: inset 0 0 0 1px #2a170c, inset 0 0 0 3px rgba(216,176,106,.2), 0 5px 12px rgba(60,40,20,.35); color: #f4e6c4; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .fin-nivel #end-levelup-notif{ display: block !important; }
  .fin-nivel .end-xp-level-label{ color: #fff3d6; text-shadow: 0 1px 0 #140a04; }
  .fin-nivel .end-xp-segs{ gap: 9px; }
  .fin-nivel .end-xp-seg{ width: 74px; height: 15px; }
  .fin-xp-razon{ font-size: .78rem; color: #d8b06a; letter-spacing: .06em; text-align: center; }
  .fin-xp-sig{ font-size: .74rem; color: rgba(244,230,196,.75); text-align: center; }
  .fin-botones{ display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: auto; padding-top: 6px; }
  .fin-botones .btn{ max-width: 280px !important; }
  .fin-botones .btn:disabled{ filter: grayscale(.6) brightness(.7); cursor: default; }
  .fin-botones #end-btn-play{ color: #ffe9a8 !important; }
  .fin-botones #end-btn-menu{ color: #ffd0c8 !important; }
  /* desbloqueos */
  .fin-der #end-unlocks-panel{ width: auto !important; max-width: none !important; padding: 0 !important; align-items: stretch !important; gap: 12px !important; }
  .fin-der #end-unlocks-header{ color: #8a5a10 !important; text-align: left; font-size: .76rem !important; }
  .fin-der #end-unlocks-list{ display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important; gap: 12px !important; align-items: stretch !important; }
  .fin-der .end-unlock-card{ display: grid !important; grid-template-columns: 78px 1fr; grid-auto-rows: min-content; column-gap: 16px; row-gap: 4px; align-items: start;
    min-width: 0 !important; max-width: none !important; padding: 12px 14px !important; text-align: left !important;
    background: rgba(255,250,235,.55) !important; border: 1px solid rgba(106,74,48,.35) !important; border-radius: 6px !important; box-shadow: 0 3px 8px rgba(60,40,20,.15) !important; }
  .fin-der .end-unlock-card > div:not([class]){ grid-column: 1; grid-row: 1 / span 5; }
  .fin-der .end-unlock-card > :not(div:not([class])){ grid-column: 2; }
  .fin-der .end-unlock-img{ width: 78px !important; height: 108px; object-fit: cover; border-radius: 3px !important; border: 4px solid #fbf6e6 !important; animation: none !important; box-shadow: 0 5px 12px rgba(60,40,20,.45) !important; transform: rotate(-2deg); }
  .fin-der .end-unlock-deck-badge{ justify-self: start; color: #8a5a10 !important; border-color: rgba(138,90,16,.45) !important; }
  .fin-der .end-curi-badge{ color: #3a5a8a !important; border-color: rgba(58,90,138,.45) !important; }
  .fin-der .end-unlock-name{ color: var(--tinta) !important; font-size: 1.12rem !important; text-align: left !important; }
  .fin-der .end-unlock-achieve{ color: #8a5a10 !important; font-size: .82rem !important; text-align: left !important; }
  .fin-der .end-unlock-cond, .fin-der .end-unlock-curi-snippet{ color: var(--tinta-s) !important; font-size: .8rem !important; text-align: left !important; padding: 0 !important; line-height: 1.45 !important; }
  .fin-der .end-unlock-cond::before{ content: attr(data-por); display: block; font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(106,74,48,.75); margin-bottom: 1px; }
  .fin-der #end-unlocks-panel.revealed .end-unlock-card{ animation: finAparece .5s cubic-bezier(.22,1,.36,1) both !important; }
  .fin-der #end-unlocks-panel.revealed .end-unlock-card:nth-child(2){ animation-delay: .15s !important; }
  .fin-der #end-unlocks-panel.revealed .end-unlock-card:nth-child(3){ animation-delay: .3s !important; }
  .fin-der #end-unlocks-panel.revealed .end-unlock-card:nth-child(n+4){ animation-delay: .45s !important; }
  @keyframes finAparece{ from{ opacity: 0; transform: translateX(18px); } to{ opacity: 1; transform: none; } }
  .fin-espera{ color: var(--tinta-s); font-size: .85rem; font-style: italic; text-align: center; padding: 30px 0; }
  .fin-retos{ display: none; flex-direction: column; gap: 10px; }
  .fin-retos.ver{ display: flex; animation: finAparece .5s both; }
  .fin-retos p{ margin: 0; color: var(--tinta-s); font-size: .86rem; }
  .fin-reto{ display: grid; grid-template-columns: 46px 1fr; column-gap: 12px; align-items: start; padding: 8px 10px; border: 1px dashed rgba(106,74,48,.4); border-radius: 6px; }
  .fin-reto img{ width: 46px; height: 64px; object-fit: cover; border-radius: 3px; filter: brightness(.18) sepia(1); border: 2px solid #fbf6e6; grid-row: 1 / span 3; }
  .fin-reto b{ font-weight: 400; color: var(--tinta); font-size: .95rem; }
  .fin-reto i{ color: #8a5a10; font-size: .78rem; }
  .fin-reto span{ color: var(--tinta-s); font-size: .76rem; line-height: 1.4; }
  @media (max-width: 899px){
    .fin-libro{ width: 96vw; height: 94vh; }
    .fin-paginas{ flex-direction: column; overflow-y: auto; background-image: none; }
    .fin-izq, .fin-der{ flex: none; width: 100%; overflow: visible; padding: 16px; }
    .pm-mini{ width: 26px; height: 36px; }
  }

  /* ══════ 3. PERFIL ══════ */
  .pf-balance{ display: flex; flex-direction: column; gap: 6px; margin: 4px 0 14px; }
  .pf-balance .barra{ display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: rgba(106,74,48,.18); box-shadow: inset 0 1px 2px rgba(60,40,20,.3); }
  .pf-balance .barra > div{ height: 100%; transition: width .8s cubic-bezier(.22,1,.36,1); }
  .pf-balance .bv{ background: linear-gradient(180deg, #e3c06a, #a8822e); } .pf-balance .be{ background: linear-gradient(180deg, #8aa8d8, #4a6aa8); } .pf-balance .bd{ background: linear-gradient(180deg, #d88a80, #a84a42); }
  .pf-balance .leyenda{ display: flex; gap: 14px; font-size: .74rem; color: #6a4a30; }
  .pf-balance .leyenda i{ display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 5px; vertical-align: -1px; }
  /* filas del historial: el marcador de cada espacio */
  .pgame-spaces.pm-marcas{ display: flex; gap: 5px; }
  .pm-marca{ display: inline-flex; flex-direction: column; align-items: center; min-width: 38px; padding: 2px 5px 3px; border-radius: 4px; font-size: .74rem; line-height: 1.1; border: 1px solid rgba(106,74,48,.35); background: rgba(255,250,235,.6); color: #2b1a10; }
  .pm-marca small{ font-size: .54rem; letter-spacing: .1em; color: #6a4a30; }
  .pm-marca.w{ border-color: #5a7ab8; background: rgba(120,170,255,.18); }
  .pm-marca.l{ border-color: #b85a52; background: rgba(220,90,80,.14); }
  .pm-marca b{ font-weight: 400; } .pm-marca .yo{ color: #2a4a8a; } .pm-marca .ia{ color: #8a2a22; }
  /* repetición: la vista de la partida tapa la lista, sin taparse a sí misma */
  #profile-modal.pf-libro .pf-der.replay-abierto > :not(#profile-replay-panel){ display: none !important; }
  #profile-modal.pf-libro .pf-der.replay-abierto #profile-replay-panel{ position: static !important; inset: auto !important; padding: 0 !important; background: transparent !important; overflow: visible !important; }
  .pm-final{ margin: 14px 0 18px; display: flex; flex-direction: column; gap: 8px; }
  .pm-final .fin-titulo{ font-size: .7rem; }
  `;
  const st = document.createElement('style'); st.id = 'estilo-pantallas'; st.textContent = css; document.head.appendChild(st);

  /* ══════════════ utilidades comunes ══════════════ */
  function fotoTablero(){
    return G.spaces.map((sp, i) => {
      let sc = null; try { sc = computeSpaceScore(i); } catch (e) {}
      return {
        slots: [0, 1].map(side => sp.slots[side].map(c => c ? { n: c.displayName || c.name, img: c.name, fd: !!c.faceDown, v: c.baseValue ?? 0, b: (c.powerBonus || 0) + (c.existBonus || 0) } : null)),
        effect: sp.effectText || null, effectRevealed: !!sp.effectRevealed,
        p0: sc ? sc.p0 : null, p1: sc ? sc.p1 : null, w: sc ? sc.winner : -1,
      };
    });
  }
  function mini(c){
    const d = document.createElement('div');
    if (!c){ d.className = 'pm-mini vacio'; return d; }
    d.className = 'pm-mini' + (c.fd ? ' oculta' : '');
    const img = document.createElement('img'); img.alt = ''; img.draggable = false;
    img.src = c.fd ? './ilustraciones/card-back.jpg' : `./ilustraciones/${c.img}.jpg`;
    if (!c.fd && typeof CB_THUMB_OFFSET !== 'undefined' && CB_THUMB_OFFSET.get) img.style.objectPosition = CB_THUMB_OFFSET.get(c.img) || 'top';
    d.appendChild(img);
    if (!c.fd){
      const v = document.createElement('span'); v.className = 'pm-v' + (c.v === 0 ? ' v0' : ''); v.textContent = c.v === 0 ? '0' : (c.v + (c.b || 0));
      d.appendChild(v);
      d.title = c.n;
    }
    return d;
  }
  function cifra(n, yo, gana){
    const img = document.createElement('img'); img.alt = String(n);
    if (typeof pxNumero === 'function') img.src = pxNumero(String(n), yo ? (gana ? '#7fb4ff' : '#4f79b8') : (gana ? '#ff7a70' : '#b8534d'), yo ? (gana ? '#d6e6ff' : '#86a8d8') : (gana ? '#ffd0cc' : '#d98a84'));
    return img;
  }
  // tablero final: tres tablillas (rival arriba, tú abajo)
  function tableroFinal(final, conEfecto){
    const t = document.createElement('div'); t.className = 'pm-tablero';
    final.forEach((sp, i) => {
      const w = sp.w;
      const e = document.createElement('div'); e.className = 'pm-esp' + (w === 0 ? ' gana-yo' : w === 1 ? ' gana-ia' : '');
      const nom = document.createElement('div'); nom.className = 'pm-esp-nombre'; nom.textContent = T('Espacio', 'Space', '空間') + ' ' + (i + 1); e.appendChild(nom);
      const cor = document.createElement('div'); cor.className = 'pm-corona ' + (w === 0 ? 'yo' : w === 1 ? 'ia' : 'nadie');
      cor.textContent = w === 0 ? T('Tú', 'You', 'あなた') : w === 1 ? T('IA', 'AI', 'AI') : T('Empate', 'Draw', '引分'); e.appendChild(cor);
      if (conEfecto){
        const ef = document.createElement('div'); ef.className = 'pm-ef';
        const txt = sp.effect && sp.effectRevealed !== false ? (typeof getSpaceEffectText === 'function' ? getSpaceEffectText(sp.effect) : sp.effect) : '';
        ef.textContent = txt || ''; ef.title = txt; e.appendChild(ef);
      }
      const lado = (txt) => { const l = document.createElement('div'); l.className = 'pm-lado'; l.textContent = txt; return l; };
      const fila = (side) => { const f = document.createElement('div'); f.className = 'pm-fila'; const s = (sp.slots && sp.slots[side]) || [null, null, null]; for (let k = 0; k < 3; k++) f.appendChild(mini(s[k] || null)); return f; };
      e.appendChild(lado(T('IA', 'AI', 'AI'))); e.appendChild(fila(1));
      const m = document.createElement('div'); m.className = 'pm-marcador';
      if (sp.p0 !== null && sp.p0 !== undefined){
        m.appendChild(cifra(sp.p1, false, w === 1));
        const r = document.createElement('span'); r.className = 'pm-raya'; r.textContent = '—'; m.appendChild(r);
        m.appendChild(cifra(sp.p0, true, w === 0));
      } else {
        const r = document.createElement('span'); r.className = 'pm-raya'; r.textContent = w === 0 ? '✓' : w === 1 ? '✕' : '—'; m.appendChild(r);
      }
      e.appendChild(m);
      e.appendChild(fila(0)); e.appendChild(lado(T('Tú', 'You', 'あなた')));
      t.appendChild(e);
    });
    return t;
  }

  /* ══════════════ 1. MENÚ INICIAL ══════════════ */
  function prepararMenu(){
    if (!document.getElementById('menu-alfombra') && typeof tabTerciopelo === 'function' && typeof tabMarcoDorado === 'function'){
      const a = document.createElement('div'); a.id = 'menu-alfombra'; a.setAttribute('aria-hidden', 'true');
      a.style.backgroundImage = `url(${tabTerciopelo().toDataURL()})`;
      const v = document.createElement('div'); v.className = 'ma-vineta';
      const m = document.createElement('div'); m.className = 'ma-marco'; m.style.borderImageSource = `url(${tabMarcoDorado().toDataURL()})`;
      a.append(v, m); document.body.prepend(a);
    }
    const GEMAS = { 'btn-menu-play': '#e3b84c', 'btn-deck-game-menu': '#e3b84c', 'btn-card-browser-menu': '#5a8ae0', 'btn-hitos-menu': '#4ab878', 'btn-rules-menu': '#e8dcc0', 'btn-options-menu': '#b0a090' };
    Object.entries(GEMAS).forEach(([id, col]) => {
      const b = document.getElementById(id); if (!b) return;
      b.style.removeProperty('color');   // el color va en la gema; el texto, crema sobre el cuero
      if (!b.querySelector('.gema') && id !== 'btn-menu-play'){ const g = document.createElement('i'); g.className = 'gema'; g.style.setProperty('--gema', col); b.prepend(g); }
    });
    const p = document.getElementById('btn-profile-menu'); if (p){ p.style.removeProperty('opacity'); p.style.removeProperty('font-size'); p.style.removeProperty('margin-top'); }
  }
  // la alfombra solo mientras se ve el menú (y los libros y ventanas que se abren desde él)
  const SOBRE_MENU = '#card-browser-overlay.show.fullscreen-mode, #hl-overlay.show, #hitos-overlay.show, #options-overlay.show, #deck-game-overlay.show, #amigo-overlay.show, #modal-overlay.show, #modal-overlay.active';
  function vigilarMenu(){
    const menu = document.getElementById('screen-menu'), juego = document.getElementById('screen-game');
    const enJuego = juego && juego.classList.contains('active');
    const perfil = document.getElementById('profile-overlay');
    const ver = !!menu && !enJuego && (getComputedStyle(menu).display !== 'none' || document.querySelector(SOBRE_MENU) || (perfil && perfil.style.display === 'flex'));
    document.body.classList.toggle('menu-con-alfombra', !!ver);
  }
  window.rdVigilarMenu = vigilarMenu;
  try { prepararMenu(); vigilarMenu(); } catch (e) { console.warn(e); }
  setInterval(() => { try { vigilarMenu(); } catch (e) {} }, 200);
  if (typeof setLang === 'function'){
    const o = setLang;
    window.setLang = setLang = function(){ const r = o.apply(this, arguments); try { prepararMenu(); } catch (e) {} return r; };
  }
  // el menú se enseña cuando ya está montado (antes se veía un momento el menú antiguo)
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('rd-listo')));

  /* ══════════════ FUNDIDOS: entrar y salir de la partida ══════════════ */
  const fundido = document.createElement('div'); fundido.id = 'rd-fundido'; document.body.appendChild(fundido);
  function conFundido(fn){
    if (!document.body.classList.contains('rd-listo')) return fn();
    return new Promise(res => {
      fundido.classList.remove('sale'); fundido.classList.add('ver');
      setTimeout(() => {
        let r; try { r = fn(); } catch (e) { console.error(e); }
        try { vigilarMenu(); } catch (e) {}
        setTimeout(() => { fundido.classList.add('sale'); fundido.classList.remove('ver'); }, 220);
        res(r);
      }, 270);
    });
  }
  window.rdConFundido = conFundido;
  if (typeof startGame === 'function'){
    const o = startGame;
    window.startGame = startGame = function(){ const a = arguments, t = this; return conFundido(() => o.apply(t, a)); };
  }
  if (typeof showMenu === 'function'){
    const o = showMenu;
    window.showMenu = showMenu = function(){ const a = arguments, t = this; return conFundido(() => o.apply(t, a)); };
  }

  /* ══════════════ 2. FINAL DE LA PARTIDA ══════════════ */
  function montarLibroFin(){
    const ov = document.getElementById('end-overlay'), wr = document.getElementById('end-wrapper');
    if (!ov || !wr) return null;
    let libro = wr.querySelector('.fin-libro');
    if (!libro){
      libro = document.createElement('div'); libro.className = 'fin-libro';
      libro.innerHTML = `<div class="fin-cab"><span class="fin-sub"></span></div>
        <div class="fin-paginas">
          <div class="fin-izq"><div class="fin-titulo fin-t-res"></div><div class="fin-res"></div>
            <div class="fin-titulo fin-t-niv"></div><div class="fin-nivel"><div class="fin-xp-razon"></div><div class="fin-xp-sig"></div></div>
            <div class="fin-botones"></div></div>
          <div class="fin-der"><div class="fin-titulo fin-t-des"></div><div class="fin-espera"></div><div class="fin-retos"></div></div>
        </div>`;
      wr.appendChild(libro);
      const cab = libro.querySelector('.fin-cab');
      cab.prepend(document.getElementById('end-title'));
      const btns = document.getElementById('end-btn-play');
      if (btns && btns.parentNode){
        const caja = libro.querySelector('.fin-botones');
        ['end-btn-play', 'end-btn-board', 'end-btn-menu'].forEach(id => { const b = document.getElementById(id); if (b){ b.removeAttribute('style'); caja.appendChild(b); } });
      }
      libro.querySelector('.fin-der').insertBefore(document.getElementById('end-unlocks-panel'), libro.querySelector('.fin-espera'));
      ov.classList.add('fin-modo');
    }
    // el bloque de nivel (lo crea endGame la primera vez dentro del panel viejo)
    const xp = document.getElementById('end-levelup-notif'), nivel = libro.querySelector('.fin-nivel');
    if (xp && xp.parentNode !== nivel) nivel.prepend(xp);
    return libro;
  }
  function rellenarLibroFin(libro){
    const fin = fotoTablero();
    const ganados = [0, 1].map(s => fin.filter(sp => sp.w === s).length);
    const yoGano = ganados[0] > ganados[1], iaGana = ganados[1] > ganados[0];
    const sub = libro.querySelector('.fin-sub');
    if (typeof isGlobalScoring === 'function' && isGlobalScoring()){
      const tot = [0, 1].map(s => fin.reduce((a, sp) => a + ((s === 0 ? sp.p0 : sp.p1) || 0), 0));
      sub.textContent = T(`Puntuación global: ${tot[0]} a ${tot[1]}`, `Global score: ${tot[0]} to ${tot[1]}`, `合計：${tot[0]}対${tot[1]}`);
    } else {
      sub.textContent = yoGano ? T(`Ganaste ${ganados[0]} de 3 espacios`, `You won ${ganados[0]} of 3 spaces`, `3つの空間のうち${ganados[0]}つを勝ち取った`)
        : iaGana ? T(`La IA ganó ${ganados[1]} de 3 espacios`, `The AI won ${ganados[1]} of 3 spaces`, `AIが3つの空間のうち${ganados[1]}つを勝ち取った`)
        : T('Nadie ganó la mayoría', 'Nobody won the majority', '誰も過半数を取れなかった');
    }
    libro.querySelector('.fin-t-res').textContent = T('— Resultado de cada espacio —', '— Result of each space —', '— 各空間の結果 —');
    libro.querySelector('.fin-t-niv').textContent = T('— Tu progreso —', '— Your progress —', '— あなたの成長 —');
    libro.querySelector('.fin-t-des').textContent = T('— Desbloqueado en esta partida —', '— Unlocked this game —', '— この対戦で解放 —');
    const res = libro.querySelector('.fin-res'); res.innerHTML = ''; res.appendChild(tableroFinal(fin, true));
    // nivel: qué ha dado la partida y qué trae el siguiente
    const p = typeof loadProfile === 'function' ? loadProfile() : {};
    const gane = document.getElementById('end-title') && /victor|勝利/i.test(document.getElementById('end-title').textContent);
    libro.querySelector('.fin-xp-razon').textContent = gane
      ? T('+2 barritas por la victoria', '+2 bars for the win', '勝利で+2')
      : T('+1 barrita por jugar la partida', '+1 bar for playing', '対戦で+1');
    const sigNivel = (p._nivelReal ?? p.userLevel ?? 0) + 1;
    const curi = typeof CURIOSIDAD_ORDER !== 'undefined' ? CURIOSIDAD_ORDER[sigNivel - 1] : null;
    libro.querySelector('.fin-xp-sig').textContent = curi
      ? T(`En el nivel ${sigNivel}: la curiosidad de ${curi}`, `At level ${sigNivel}: ${curi}'s trivia`, `レベル${sigNivel}：${curi}の豆知識`) : '';
    // concordancia: «carta(s)/curiosidad(es) desbloqueada(s)» (con mazos, en masculino)
    const cab = document.getElementById('end-unlocks-label');
    if (cab && L() === 'es' && !/mazo/.test(cab.textContent)) cab.textContent = cab.textContent.replace(/desbloqueado(s?)!/, 'desbloqueada$1!');
    // «por qué» encima de cada condición
    libro.querySelectorAll('.end-unlock-cond').forEach(c => c.setAttribute('data-por', T('Por qué', 'Why', '理由')));
    // mientras sube el nivel, la página derecha espera; luego, desbloqueos o próximos retos
    const hay = document.getElementById('end-unlocks-panel').dataset.pendingReveal === '1';
    const espera = libro.querySelector('.fin-espera'), retos = libro.querySelector('.fin-retos');
    espera.style.display = ''; espera.textContent = T('…', '…', '…'); retos.classList.remove('ver'); retos.innerHTML = '';
    clearInterval(libro._vigila);
    libro._vigila = setInterval(() => {
      const b = document.getElementById('end-btn-play');
      if (b && b.disabled) return;
      clearInterval(libro._vigila);
      if (hay){ espera.style.display = 'none'; return; }
      espera.style.display = 'none';
      pintarRetos(retos); retos.classList.add('ver');
    }, 200);
  }
  function pintarRetos(caja){
    const todas = Object.keys(typeof UNLOCK_CONDITIONS !== 'undefined' ? UNLOCK_CONDITIONS : {});
    const bloqueadas = todas.filter(n => typeof isCardUnlocked === 'function' && !isCardUnlocked(n)).slice(0, 3);
    const p = document.createElement('p');
    if (!bloqueadas.length){ p.textContent = T('Esta vez no hay nada nuevo… ¡y ya lo tienes todo desbloqueado!', 'Nothing new this time… and you have everything unlocked!', '今回は新しい解放なし…すべて解放済み！'); caja.appendChild(p); return; }
    p.textContent = T('Esta vez no hay nada nuevo. Próximos retos:', 'Nothing new this time. Next challenges:', '今回は新しい解放なし。次の挑戦：');
    caja.appendChild(p);
    bloqueadas.forEach(n => {
      const c = (typeof getUnlockCondition === 'function' && getUnlockCondition(n)) || {};
      const d = document.createElement('div'); d.className = 'fin-reto';
      const img = document.createElement('img'); img.src = `./ilustraciones/${n}.jpg`; img.alt = ''; img.onerror = () => { img.style.visibility = 'hidden'; };
      const b = document.createElement('b'); b.textContent = (typeof getCardDisplay === 'function' && getCardDisplay(n).displayName) || n;
      const i = document.createElement('i'); i.textContent = c.title ? `«${c.title}»` : '';
      const s = document.createElement('span'); s.textContent = c.text || '';
      d.append(img, b, i, s); caja.appendChild(d);
    });
  }
  if (typeof endGame === 'function'){
    const o = endGame;
    window.endGame = endGame = function(){
      const r = o.apply(this, arguments);
      try {
        const libro = montarLibroFin();
        if (libro){
          rellenarLibroFin(libro);
          if (ancho() && typeof abrirLibroRD === 'function') abrirLibroRD(libro, '.fin-izq');
        }
      } catch (e) { console.warn(e); }
      return r;
    };
  }

  /* ══════════════ 3. PERFIL E HISTORIAL ══════════════ */
  // cada partida guarda también el tablero final con la puntuación de cada espacio
  if (typeof saveGameRecord === 'function'){
    const o = saveGameRecord;
    window.saveGameRecord = saveGameRecord = function(){
      const r = o.apply(this, arguments);
      try {
        const h = loadGameHistory();
        if (h[0] && !h[0].final){ h[0].final = fotoTablero(); saveGameHistory(h); }
      } catch (e) {}
      return r;
    };
  }
  function finalDe(rec){
    if (rec.final) return rec.final;
    const ult = rec.turns && rec.turns.length ? rec.turns[rec.turns.length - 1] : null;
    if (!ult || !ult.board) return null;
    return ult.board.map((sp, i) => ({ slots: sp.slots || sp, effect: sp.effect, effectRevealed: sp.effectRevealed, p0: null, p1: null, w: (rec.spaceWinners || [])[i] ?? -1 }));
  }
  if (typeof renderGameHistory === 'function'){
    const o = renderGameHistory;
    window.renderGameHistory = renderGameHistory = function(){
      const r = o.apply(this, arguments);
      try {
        const filtro = typeof _pgameFilter !== 'undefined' ? _pgameFilter : 'all';
        const lista = loadGameHistory().filter(x => filtro === 'all' || x.outcome === filtro);
        document.querySelectorAll('#profile-games-list .pgame-row').forEach((row, k) => {
          const rec = lista[k]; if (!rec) return;
          const cont = row.querySelector('.pgame-spaces'); if (!cont) return;
          cont.classList.add('pm-marcas'); cont.innerHTML = '';
          (rec.spaceWinners || []).forEach((w, i) => {
            const f = rec.final && rec.final[i];
            const m = document.createElement('span'); m.className = 'pm-marca ' + (w === 0 ? 'w' : w === 1 ? 'l' : 'd');
            m.title = T('Espacio', 'Space', '空間') + ' ' + (i + 1);
            m.innerHTML = `<small>E${i + 1}</small>` + (f && f.p0 !== null && f.p0 !== undefined
              ? `<b><span class="yo">${f.p0}</span>–<span class="ia">${f.p1}</span></b>`
              : `<b>${w === 0 ? '✓' : w === 1 ? '✕' : '—'}</b>`);
            cont.appendChild(m);
          });
        });
      } catch (e) {}
      return r;
    };
  }
  if (typeof openReplayPanel === 'function'){
    const o = openReplayPanel;
    window.openReplayPanel = openReplayPanel = function(rec){
      const r = o.apply(this, arguments);
      try {
        const panel = document.getElementById('profile-replay-panel');
        const der = panel && panel.closest('.pf-der'); if (der) der.classList.add('replay-abierto');
        panel.querySelectorAll('.pm-final').forEach(e => e.remove());
        const fin = finalDe(rec);
        if (fin){
          const caja = document.createElement('div'); caja.className = 'pm-final';
          const t = document.createElement('div'); t.className = 'fin-titulo'; t.textContent = T('— Cómo terminó —', '— How it ended —', '— 最終盤面 —');
          caja.classList.add('pm-replay'); caja.append(t, tableroFinal(fin, false));
          const fila = document.getElementById('replay-spaces-row');
          if (fila && fila.parentNode) fila.parentNode.insertBefore(caja, fila.nextSibling); else panel.prepend(caja);
          const t2 = document.createElement('div'); t2.className = 'fin-titulo pm-final'; t2.textContent = T('— Turno a turno —', '— Turn by turn —', '— ターンごと —');
          const nav = document.getElementById('replay-board-nav'); if (nav && nav.parentNode) nav.parentNode.insertBefore(t2, nav);
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof closeReplayPanel === 'function'){
    const o = closeReplayPanel;
    window.closeReplayPanel = closeReplayPanel = function(){
      const r = o.apply(this, arguments);
      document.querySelectorAll('.pf-der.replay-abierto').forEach(d => d.classList.remove('replay-abierto'));
      document.querySelectorAll('#profile-replay-panel .pm-final').forEach(e => e.remove());
      return r;
    };
  }
  // estadísticas: nombre correcto y barra de reparto
  if (typeof renderProfileData === 'function'){
    const o = renderProfileData;
    window.renderProfileData = renderProfileData = function(profile){
      const r = o.apply(this, arguments);
      try {
        const sec = document.getElementById('profile-stats-section'); if (!sec) return r;
        const lbl = sec.querySelector('.profile-section-label'); if (lbl) lbl.textContent = T('— Estadísticas —', '— Statistics —', '— 統計 —');
        let bal = sec.querySelector('.pf-balance');
        if (!bal){ bal = document.createElement('div'); bal.className = 'pf-balance'; if (lbl) lbl.after(bal); else sec.prepend(bal); }
        const v = profile.wins || 0, e = profile.draws || 0, d = profile.losses || 0, tot = v + e + d;
        const pc = n => tot ? (n / tot * 100) : 0;
        bal.innerHTML = `<div class="barra"><div class="bv" style="width:0"></div><div class="be" style="width:0"></div><div class="bd" style="width:0"></div></div>
          <div class="leyenda"><span><i class="bv"></i>${T('Victorias', 'Wins', '勝利')} ${v}</span><span><i class="be"></i>${T('Empates', 'Draws', '引分')} ${e}</span><span><i class="bd"></i>${T('Derrotas', 'Losses', '敗北')} ${d}</span><span style="margin-left:auto">${tot} ${T('partidas', 'games', '試合')}</span></div>`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const [a, b, c] = bal.querySelectorAll('.barra > div'); a.style.width = pc(v) + '%'; b.style.width = pc(e) + '%'; c.style.width = pc(d) + '%';
        }));
      } catch (e) {}
      return r;
    };
  }
})();
