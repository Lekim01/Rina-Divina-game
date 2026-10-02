/* Riña Divina — el juego: reglas, efectos, IA, perfil, hitos…
   (separado del index.html original; se carga en el mismo orden que antes) */
const SOUNDS = {
  pick:        new Audio('./card-pick.mp3'),
  place:       new Audio('./card-place.mp3'),
  reveal:      new Audio('./card-reveal.mp3'),
  draw:        new Audio('./card-draw.mp3'),
  discard:     new Audio('./card-discard.mp3'),
  spaceChange: new Audio('./space-change.mp3'),
  victory:     new Audio('./victory.mp3'),
  defeat:      new Audio('./defeat.mp3'),
  uiClick:     new Audio('./ui-click.mp3'),
  steal:       new Audio('./card-draw.mp3'),
  colocDestinada: new Audio('./coloc-destinada.mp3'),
  tableroReal: new Audio('./tablero-real.mp3'),
  gotaRealidad: new Audio('./gota-realidad.mp3'),   // [Nuevo] una Realidad tiñe un espacio
  v0Reki:   new Audio('./Reki-entrada.mp3'),
  rekiAparece: new Audio('./Reki-aparece.mp3'),
  v0Tei:    new Audio('./Tei-entrada.mp3'),
  v0Roloc:  new Audio('./Roloc-entrada.mp3'),
  v0Reiza:  new Audio('./Reiza-entrada.mp3'),
  v0Yuta:   new Audio('./Yuta-entrada.mp3'),
  v0Tis:    new Audio('./Tis-entrada.mp3'),
  v0Usei:   new Audio('./Usei-entrada.mp3'),
  v0Nasu:   new Audio('./Nasu-entrada.mp3'),
  v0Su:     new Audio('./Su-entrada.mp3'),
  v0Rasu:   new Audio('./Rasu-entrada.mp3'),
  v0Neutra: new Audio('./Neutra-entrada.mp3'),
  v0Resta:  new Audio('./Resta-entrada.mp3'),
  v0Suma:   new Audio('./Suma-entrada.mp3'),
  v0Una:    new Audio('./Una-entrada.mp3'),
  v0Moira:  new Audio('./Moira-entrada.mp3'),
  mazoAgregar:  new Audio('./mazo-agregar.mp3'),
  mazoQuitar:   new Audio('./mazo-quitar.mp3'),
  mazoRechazar: new Audio('./mazo-rechazar.mp3'),
  realAppear:   new Audio('./real-music.mp3'),
  xpFill:       new Audio('./xp-fill.mp3'),
  xpLevelUp:    new Audio('./xp-levelup.mp3'),
  nivelDestellos: new Audio('./nivel-destellos.mp3'),   // [Nuevo] destellos que acompañan a la subida de nivel
  rasuNeutraMove:  new Audio('./Rasu-Neutra-Gran-mover.mp3'),
  feruzuKakomiRemove: new Audio('./Feruzu-Kakomi-remover.mp3'),
  valorUp:      new Audio('./valor-up-sound.mp3'),
  tisEffect:    new Audio('./Tis-efect.mp3'),
  gatitoSpawn:  new Audio('./Gatito-spawn.mp3'),
};

// Menu music
const MENU_MUSIC = new Audio('./menu-music.mp3');
MENU_MUSIC.loop = true;
MENU_MUSIC.volume = 0.4;



function setMenuMusicVolume(val) {
  const v = parseFloat(val);
  MENU_MUSIC.volume = v;
  OPTIONS.musicVolume = v;
  const lbl = document.getElementById('opt-music-vol-label');
  if (lbl) lbl.textContent = Math.round(v * 100) + '%';
  const slider = document.getElementById('opt-music-vol');
  if (slider) slider.value = v;
  saveOptions();
}

function setSfxVolume(val) {
  const v = parseFloat(val);
  OPTIONS.sfxVolume = v;
  Object.values(SOUNDS).forEach(s => { s.volume = v; });
  const lbl = document.getElementById('opt-sfx-vol-label');
  if (lbl) lbl.textContent = Math.round(v * 100) + '%';
  const slider = document.getElementById('opt-sfx-vol');
  if (slider) slider.value = v;
  saveOptions();
}

function playMenuMusic() {
  if (MENU_MUSIC.paused) {
    MENU_MUSIC.play().catch(() => {}); // catch autoplay policy errors silently
  }
}

// Browsers block autoplay until user interaction — start music on first click
let _musicUnlocked = false;
document.addEventListener('click', () => {
  if (!_musicUnlocked) {
    _musicUnlocked = true;
    // Only play if we're on the menu screen
    if (document.getElementById('screen-menu')?.style.display !== 'none') {
      playMenuMusic();
    }
  }
}, { once: false });

function stopMenuMusic() {
  MENU_MUSIC.pause();
  MENU_MUSIC.currentTime = 0;
}
// Preload & set volume (OPTIONS not yet defined here — setSfxVolume() at load applies the saved value)
Object.values(SOUNDS).forEach(s => { s.volume = 0.55; s.preload = 'auto'; });

function playSound(name) {
  const s = SOUNDS[name];
  if (!s) return;
  try {
    s.currentTime = 0;
    s.play().catch(()=>{});
  } catch(e){}
}

// Mapa de nombre de carta V0 → clave de sonido de entrada al tablero
const V0_ENTRY_SOUND = {
  Reki:   'v0Reki',
  Tei:    'v0Tei',
  Roloc:  'v0Roloc',
  Reiza:  'v0Reiza',
  Yuta:   'v0Yuta',
  Tis:    'v0Tis',
  Usei:   'v0Usei',
  Nasu:   'v0Nasu',
  Su:     'v0Su',
  Rasu:   'v0Rasu',
  Neutra: 'v0Neutra',
  Resta:  'v0Resta',
  Suma:   'v0Suma',
  Una:    'v0Una',
  Moira:  'v0Moira',
};

// Set que registra qué cartas V0 ya han sonado su entrada al tablero esta partida.
// Se limpia en initGame(). Si la carta sale y vuelve a entrar, NO suena de nuevo.
const _v0EntryPlayed = new Set();

function playV0EntrySound(cardName) {
  if (_v0EntryPlayed.has(cardName)) return;
  _v0EntryPlayed.add(cardName);
  const key = V0_ENTRY_SOUND[cardName];
  if (key) playSound(key);
}

// ══════════════════════════════════════════════════════════
//  PROGRESSION — UNLOCKED CARDS
// ══════════════════════════════════════════════════════════
// Cards available to the player from the start.
// All other cards are locked (shown with a padlock in the browser
// and excluded from Partida Rápida decks/pools).
const UNLOCKED_CARDS = new Set([
  // VALUE 1
  'Koly','Gena','Nugu','Ramia','Feruzu','Faun','Abaki','Hobu','Ekuro','Naiki',
  'Ponce','Iona','Hanoe','Yuta','Nasu','Rasu','Tei','En','Mega','Noira',
  // VALUE 0 — always included by name so quick-game pool contains them
  // (Yuta, Nasu, Rasu, Tei are V0 and already listed above)
]);

// Unlock conditions per card (shown under padlock)
const UNLOCK_CONDITIONS = {
  Fukou:  { title: 'Amante de los peluches', text: 'Gana un espacio donde el rival tenía un Erizo de Peluche Blanco.' },
  Reina:  { title: 'Ladronzuela',            text: 'En una partida, roba 2 o más cartas de la mano rival.' },
  Mugon:  { title: 'Salvación',              text: 'Evita con Koly que una carta sea retirada.' },
  Ziru:   { title: 'Potra',                  text: 'En una partida, usa 2 cartas con la condición «si el rival colocó aquí» para que surtan efecto.' },
  Yukoi:  { title: 'Optimista',              text: 'Gana un espacio perdido con Faun con su efecto en el último turno.' },
  Mimimi: { title: 'Exteriofobia',           text: 'Termina una partida con todos los huecos ocupados por cartas.' },
  Yiren:  { title: 'Secretaria',             text: 'En una partida, coloca a Ekuro sobre un aliado y luego coloca otra carta sobre un aliado.' },
  Etza:   { title: 'Restos en las nubes',    text: 'En una partida, usa Gena y Yukoi para otorgar valor a un aliado en otro espacio.' },
  Reki:   { title: 'Soñador',                text: 'Desconocido' },
  Tira:        { title: 'Estratega',     text: 'En una partida, gana los tres espacios.' },
  Demae:       { title: 'Desastre',      text: 'En una partida, mueve 3 o más cartas.' },
  'Gran Demonio': { title: 'Taxista',   text: 'En una partida, mueve 2 o más cartas.' },
  Chiouri:     { title: 'Límites claros', text: 'En una partida, gana sin tener 3 o más de valor en los tres espacios.' },
  Slau:        { title: 'Justicia ciega', text: 'En una partida, pierde los 3 espacios.' },
  Kakomi:      { title: 'Tres cerezas',   text: 'En una partida, remueve en un turno 3 cartas con Feruzu.' },
  Tanozo:      { title: 'Infortunio',     text: 'En una partida, logra que el rival no consiga ningún valor en dos espacios.' },
  Tanna:  { title: 'Bufón',             text: 'Gana un espacio con tu Mimimi en el bando rival.' },
  Peroth: { title: 'El pecado',         text: 'En una partida, logra que Ponce tenga 5 de valor.' },
  Henos:  { title: 'Bromista',          text: 'Coloca tres veces a Naiki.' },
  Foret:  { title: 'Perversión',        text: 'En una partida, consigue tener 5 cartas en tu mano.' },
  Nofi:   { title: 'Junto a ti',        text: 'Juega tres Colocación Destinada.' },
  Menmei: { title: 'Buscando la verdad',text: 'En un turno, coloca a Nofi y logra que Ery se junte con Nofi en el mismo espacio.' },
  Filia:  { title: 'El hueco',          text: 'Gana en un espacio con el efecto de "Sólo hay un hueco aquí" con un valor 0.' },
  Tis:    { title: 'Existencia',        text: 'Termina una partida con 3 cartas de Existir en un espacio con el efecto de "Los efectos de Existir se duplican aquí."' },
  Reiza:  { title: 'Nihilismo',         text: 'Extingue una carta de Valor 0 en un espacio con el efecto de "Las cartas de Valor 0 colocadas aquí se extinguen."' },
  Resta:  { title: 'Aceptación',        text: 'Gana una partida con el efecto de espacio "Este espacio lo gana quien tenga más cartas con menos valor." ganado.' },
  Roloc:  { title: 'El color',          text: 'Utiliza a Tei para colocar una carta de cada tipo: 1 de Existir, 1 de Revelar y 1 Especial.' },
  Usei:   { title: 'El destino',        text: 'Has visto 7 veces Real.' },
  Su:     { title: 'La verdad',         text: 'Activa con éxito 10 veces un efecto de "Si el rival colocó aquí, o no"' },
  Neutra: { title: 'Amante de las cartas', text: 'Roba a Reki de la mano del rival.' },
  Suma:   { title: 'El cariño',         text: 'Gana una partida sin usar cartas de Valor 0 ni realizar una Colocación Destinada.' },
  Una:    { title: 'Espectador',        text: 'Gana colocando a Reki en un espacio con Real.' },
  Miria:  { title: 'Espinas',          text: 'En una partida, termina con un espacio ganado, uno empatado y un perdido.' },
  Kaeka:  { title: 'Coraje',           text: 'Gana una partida con un espacio con 3 aliados con valor extra.' },
  Miboro: { title: 'A ciegas',         text: 'En una partida, gana un espacio con el efecto de "Las cartas aquí se revelan al final de la partida".' },
  Imi:    { title: 'Suerte',           text: 'Termina una partida con los 3 espacios empatados.' },
  Gae:    { title: 'Estimulación',     text: 'Termina una partida con 2 cartas de Valor 0 y 1 carta de Valor 1 en el mismo espacio.' },
  Zao:    { title: 'La fuerza del débil', text: 'Gana una partida sin aliados con valor extra.' },
  Humi:   { title: 'Envidia',          text: 'Gana una partida con solo cartas del tipo Revelar.' },
  Kope:   { title: 'Infelicidad',      text: 'El rival te removió 6 cartas.' },
  Tenpoh: { title: 'Ceguera',          text: 'Envía a Peroth del mazo a la Pila de Descarte.' },
  Soi:    { title: 'Llama preventiva', text: 'En una partida, coloca a Ziru y Tira.' },
  Moira:  { title: 'Desesperado',     text: 'Extingue un espacio con el efecto de Usei.' },
};

// Track newly unlocked cards to show glow in card browser (cleared when browser is opened)
const NEWLY_UNLOCKED_CARDS = new Set();

function isCardUnlocked(name) {
  // Tokens are always accessible; Reki is now unlockable via apparition
  if (TOKENS[name]) return true;
  return UNLOCKED_CARDS.has(name);
}

// ── Persistent unlock storage ──
const UNLOCK_KEY = 'juego_cartas_unlocks';
function loadUnlocks() {
  try {
    const saved = JSON.parse(localStorage.getItem(UNLOCK_KEY) || '[]');
    saved.forEach(n => { if (CARD_DB[n]) UNLOCKED_CARDS.add(n); });
  } catch {}
}
function saveUnlocks() {
  try { localStorage.setItem(UNLOCK_KEY, JSON.stringify([...UNLOCKED_CARDS])); } catch {}
}
// NOTE: loadUnlocks() is called after CARD_DB is defined (below)

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE GUARDADO ROBUSTO — schemaVersion + migración + Base64
// ═══════════════════════════════════════════════════════════════
const SAVE_SCHEMA_VERSION = 2;

// Claves localStorage dispersas que se unifican dentro del guardado principal
const COUNTER_KEYS = {
  destinada:  'juego_cartas_destinada_count',
  naiki:      'juego_cartas_naiki_count',
  su:         'juego_cartas_su_triggers',
  roloc:      'juego_cartas_roloc_tei_types',
  usei:       'juego_cartas_usei_real_count',
  kope:       'juego_cartas_kope_rival_removed',
};

/** Recoge todos los contadores dispersos del localStorage en un objeto plano */
function _leerContadores() {
  const c = {};
  try { c.destinada  = parseInt(localStorage.getItem(COUNTER_KEYS.destinada)  || '0'); } catch { c.destinada  = 0; }
  try { c.naiki      = parseInt(localStorage.getItem(COUNTER_KEYS.naiki)      || '0'); } catch { c.naiki      = 0; }
  try { c.su         = parseInt(localStorage.getItem(COUNTER_KEYS.su)         || '0'); } catch { c.su         = 0; }
  try { c.roloc      = JSON.parse(localStorage.getItem(COUNTER_KEYS.roloc)    || '{}'); } catch { c.roloc     = {}; }
  try { c.usei       = parseInt(localStorage.getItem(COUNTER_KEYS.usei)       || '0'); } catch { c.usei       = 0; }
  try { c.kope       = parseInt(localStorage.getItem(COUNTER_KEYS.kope)       || '0'); } catch { c.kope       = 0; }
  return c;
}

/** Vuelca los contadores del objeto al localStorage */
function _escribirContadores(c) {
  if (c == null) return;
  try { if (c.destinada  != null) localStorage.setItem(COUNTER_KEYS.destinada,  String(c.destinada));  } catch {}
  try { if (c.naiki      != null) localStorage.setItem(COUNTER_KEYS.naiki,      String(c.naiki));      } catch {}
  try { if (c.su         != null) localStorage.setItem(COUNTER_KEYS.su,         String(c.su));         } catch {}
  try { if (c.roloc      != null) localStorage.setItem(COUNTER_KEYS.roloc,      JSON.stringify(c.roloc)); } catch {}
  try { if (c.usei       != null) localStorage.setItem(COUNTER_KEYS.usei,       String(c.usei));       } catch {}
  try { if (c.kope       != null) localStorage.setItem(COUNTER_KEYS.kope,       String(c.kope));       } catch {}
}

/** Construye el objeto de guardado completo (todas las fuentes unificadas) */
function _buildSaveData() {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    unlocks:    [...UNLOCKED_CARDS],
    options:    { ...OPTIONS },
    counters:   _leerContadores(),
    profile:    loadProfile(),
    favorites:  [...favorites],
    decks:      (() => { try { return JSON.parse(localStorage.getItem(DECK_KEY) || '[]'); } catch { return []; } })(),
  };
}

/** Migra un objeto de guardado antiguo a la versión actual */
function _migrarSave(data) {
  let v = data.schemaVersion || 1;

  // v1 → v2: añadir counters y profile si no existen
  if (v < 2) {
    if (!data.counters) data.counters = _leerContadores();
    if (!data.profile)  data.profile  = loadProfile();
    if (!data.favorites) data.favorites = [];
    if (!data.decks)    data.decks    = [];
    data.schemaVersion = 2;
    v = 2;
  }

  return data;
}

/** Aplica un objeto de guardado (ya migrado) al estado del juego */
function _aplicarSave(data) {
  if (Array.isArray(data.unlocks)) {
    data.unlocks.forEach(n => { if (CARD_DB[n] || TOKENS[n]) UNLOCKED_CARDS.add(n); });
    saveUnlocks();
  }
  if (data.options && typeof data.options === 'object') {
    Object.assign(OPTIONS, data.options);
    saveOptions();
    initOptionsUI();
  }
  if (data.counters && typeof data.counters === 'object') {
    _escribirContadores(data.counters);
  }
  if (data.profile && typeof data.profile === 'object') {
    saveProfile(Object.assign(getDefaultProfile(), data.profile));
  }
  if (Array.isArray(data.favorites)) {
    favorites = new Set(data.favorites.filter(n => CARD_DB[n] || TOKENS[n]));
    saveFavorites();
  }
  if (Array.isArray(data.decks)) {
    try { localStorage.setItem(DECK_KEY, JSON.stringify(data.decks)); CB_DECKS = data.decks; } catch {}
  }
}

// ── Exportar / Importar en Base64 (cadena de texto para copiar/pegar) ──

function exportarProgreso() {
  try {
    const data   = _buildSaveData();
    const json   = JSON.stringify(data);
    const b64    = btoa(unescape(encodeURIComponent(json)));
    const codigo = 'RD2:' + b64; // prefijo para validar en importarProgreso

    // Mostrar modal con el código
    _mostrarModalTexto(
      '— Código de progreso —',
      'Copia este código y guárdalo en un lugar seguro. Úsalo con "Importar código" para restaurar tu partida.',
      codigo,
      true // seleccionar todo al hacer clic
    );
  } catch (err) {
    alert('Error al generar el código de progreso: ' + err.message);
  }
}

function importarProgreso() {
  _mostrarModalTexto(
    '— Importar código —',
    'Pega aquí tu código de progreso (empieza por "RD2:") y pulsa Confirmar.',
    '',
    false,
    (codigo) => {
      try {
        codigo = codigo.trim();
        if (!codigo.startsWith('RD2:')) throw new Error('Prefijo inválido');
        const json = decodeURIComponent(escape(atob(codigo.slice(4))));
        let data   = JSON.parse(json);
        if (!data || typeof data !== 'object') throw new Error('not_object');
        data = _migrarSave(data);
        _aplicarSave(data);
        renderCardBrowser?.();
        alert('¡Progreso restaurado correctamente!\n(v' + data.schemaVersion + ')');
      } catch {
        alert('Código inválido. Asegúrate de pegar el código completo generado desde Riña Divina.');
      }
    }
  );
}

// ── Modal auxiliar de texto (para código Base64) ──
function _mostrarModalTexto(titulo, desc, valor, autoSelect, onConfirm) {
  // Eliminar modal previo si existe
  const prev = document.getElementById('_b64modal');
  if (prev) prev.remove();

  const overlay = document.createElement('div');
  overlay.id = '_b64modal';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#111118;border:1px solid #3a3a55;border-radius:12px;
    padding:28px 24px 22px;max-width:520px;width:92%;display:flex;
    flex-direction:column;gap:14px;font-family:KleeOne,sans-serif;
    box-shadow:0 8px 40px rgba(0,0,0,0.7);
  `;

  const h = document.createElement('div');
  h.textContent = titulo;
  h.style.cssText = 'font-size:1rem;letter-spacing:0.1em;color:#c9a84c;text-align:center;';

  const p = document.createElement('div');
  p.textContent = desc;
  p.style.cssText = 'font-size:0.78rem;color:#888880;text-align:center;line-height:1.5;';

  const ta = document.createElement('textarea');
  ta.value = valor;
  ta.rows  = 5;
  ta.style.cssText = `
    width:100%;background:#0a0a0f;border:1px solid #2a2a3a;border-radius:6px;
    color:#ddd8cc;font-family:monospace;font-size:0.7rem;padding:10px;
    resize:vertical;outline:none;-webkit-user-select:text;user-select:text;
  `;
  if (autoSelect) {
    ta.readOnly = true;
    ta.addEventListener('click', () => { ta.select(); });
  }

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';

  if (!autoSelect && onConfirm) {
    const btnOk = document.createElement('button');
    btnOk.textContent = t('modal_confirm');
    btnOk.className   = 'btn btn-sm';
    btnOk.onclick     = () => { overlay.remove(); onConfirm(ta.value); };
    btnRow.appendChild(btnOk);
  } else {
    // Botón copiar al portapapeles
    const btnCopy = document.createElement('button');
    btnCopy.textContent = t('modal_copy');
    btnCopy.className   = 'btn btn-sm';
    btnCopy.onclick     = () => {
      ta.select();
      navigator.clipboard?.writeText(ta.value).then(() => {
        btnCopy.textContent = t('modal_copied');
        setTimeout(() => { btnCopy.textContent = t('modal_copy'); }, 2000);
      }).catch(() => {
        document.execCommand('copy');
        btnCopy.textContent = t('modal_copied');
        setTimeout(() => { btnCopy.textContent = t('modal_copy'); }, 2000);
      });
    };
    btnRow.appendChild(btnCopy);
  }

  const btnClose = document.createElement('button');
  btnClose.textContent = t('modal_close');
  btnClose.className   = 'btn btn-sm';
  btnClose.onclick     = () => overlay.remove();
  btnRow.appendChild(btnClose);

  box.append(h, p, ta, btnRow);
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  if (!autoSelect) ta.focus();
}

function confirmResetSave() {
  if (!confirm(t('reset_confirm'))) return;
  // Keep only the base unlocked cards
  const BASE = ['Koly','Gena','Nugu','Ramia','Feruzu','Faun','Abaki','Hobu','Ekuro','Naiki',
    'Ponce','Iona','Hanoe','Yuta','Nasu','Rasu','Tei','En','Mega','Noira'];
  UNLOCKED_CARDS.clear();
  BASE.forEach(n => UNLOCKED_CARDS.add(n));
  saveUnlocks();
  // Clear all persistent counters (using unified COUNTER_KEYS map)
  Object.values(COUNTER_KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} });
  // Clear hitos progress
  try { localStorage.removeItem(HITOS_KEY); } catch {}
  // Clear profile stats (wins, losses, draws, etc.) but keep name, title, avatar
  try {
    const profile = loadProfile();
    profile.wins = 0; profile.draws = 0; profile.losses = 0;
    profile.streakW = 0; profile.streakD = 0; profile.streakL = 0;
    profile.maxStreakW = 0; profile.maxStreakD = 0; profile.maxStreakL = 0;
    profile.realAppearances = 0;
    profile.cardWins = {};
    profile.cardPlays = {};
    // Reset level and XP
    profile.xp = 0;
    profile.level = 0;
    profile.userLevel = 0;
    profile.xpSegments = 0;
    profile.shinyCards = [];
    profile.unlockedTitles = ['Ignorante'];
    profile.title = 'Ignorante';
    saveProfile(profile);
  } catch {}
  // Reset in-memory PLAYER_TITLES array to base state
  PLAYER_TITLES.length = 0;
  PLAYER_TITLES.push(
    'Ignorante','Alcanzaestrellas','Costurero','Tramposo','Aspirante',
    'Desvelado','Detective','Cazahombres','Implacable','Ilustrador',
    'Modista','Expectante','Impaciente','Precursor','Pescador',
    'Diseñador','Realidad','Feriante','Pollito','Tsundere'
  );
  // Clear game history (replays)
  try { localStorage.removeItem(GAME_HISTORY_KEY); } catch {}
  renderCardBrowser?.();
  renderHitosGrid?.();
  updateHitosGlobalBar?.();
  alert('Progreso, estadísticas, hitos, nivel y partidas guardadas borrados.');
}

function confirmUnlockAll() {
  if (!confirm('¿Desbloquear todas las cartas? Esto desbloqueará todas las cartas bloqueadas del juego.')) return;
  Object.keys(CARD_DB).forEach(n => UNLOCKED_CARDS.add(n));
  saveUnlocks();
  renderCardBrowser?.();
  alert('¡Todas las cartas han sido desbloqueadas!');
}

// Called at game end — checks G.unlockProgress and grants new unlocks.
// Returns array of newly unlocked card names.
function checkUnlocks() {
  if (!G || !G.unlockProgress) return [];
  const p = G.unlockProgress;
  const newly = [];

  function tryUnlock(name, cond) {
    if (!isCardUnlocked(name) && cond) {
      UNLOCKED_CARDS.add(name);
      newly.push(name);
      // Otorgar título asociado al desbloqueo de la carta
      const title = CARD_UNLOCK_TITLES[name];
      if (title) {
        try {
          const profile = loadProfile();
          if (!profile.unlockedTitles) profile.unlockedTitles = [];
          if (!profile.unlockedTitles.includes(title)) {
            profile.unlockedTitles.push(title);
            saveProfile(profile);
          }
          if (!PLAYER_TITLES.includes(title)) PLAYER_TITLES.push(title);
        } catch {}
      }
    }
  }

  // Fukou: player won a space that had an ErizoPeluche on the rival's side
  tryUnlock('Fukou', p.fukouSpaceWon);

  // Reina: player stole ≥2 cards in one game
  tryUnlock('Reina', p.cardsStolen >= 2);

  // Mugon: Koly protected a card from removal
  tryUnlock('Mugon', p.kolyProtectedRemoval);

  // Ziru: ≥2 "si el rival colocó aquí" effects triggered (Abaki, Ramia, Tanozo)
  tryUnlock('Ziru', p.rivalPlacedCondTriggers >= 2);

  // Yukoi: player won a space that was losing, Faun gave the +1 that turned it around
  tryUnlock('Yukoi', p.faunWonLostSpace);

  // Mimimi: at end of game all slots are occupied
  tryUnlock('Mimimi', p.allSlotsFilled);

  // Yiren: Ekuro displaced an ally, then another ally was displaced by Ekuro in same game
  tryUnlock('Yiren', p.ekuroDoubleDisplace);

  // Etza: Gena boosted an ally in a different space AND Yukoi boosted an ally in a different space
  tryUnlock('Etza', p.genaCrossSpace && p.yukoiCrossSpace);

  // Tira: "Estratega" — won all 3 spaces in a game
  tryUnlock('Tira', p.tiraWonAllSpaces);

  // Demae: "Desastre" — moved 3 or more cards in a game
  tryUnlock('Demae', p.demaeMoved3);

  // Gran Demonio: "Taxista" — moved 2 or more cards in a game
  tryUnlock('Gran Demonio', p.granDemonioMoved2);

  // Chiouri: "Límites claros" — won without having 3+ value in all 3 spaces
  tryUnlock('Chiouri', p.chiouriWonClean);

  // Slau: "Justicia ciega" — lost all 3 spaces
  tryUnlock('Slau', p.slauLostAllSpaces);

  // Kakomi: "Tres cerezas" — removed 3+ cards with Feruzu in one turn
  tryUnlock('Kakomi', p.kakomiRemovedThree);

  // Tanozo: "Infortunio" — rival scored 0 in 2 spaces
  tryUnlock('Tanozo', p.tanozoRivalZeroTwo);

  // Tanna: "Bufón" — player's Mimimi placed on rival side wins a space
  tryUnlock('Tanna', p.tannaMimimiWonRivalSpace);

  // Peroth: "El pecado" — Ponce had value ≥5
  tryUnlock('Peroth', p.perothPonce5);

  // Henos: "Bromista" — placed Naiki 3 times (persistent)
  tryUnlock('Henos', p.henosNaiki3);

  // Foret: "Perversión" — had 5 cards in hand
  tryUnlock('Foret', p.foretHand5);

  // Nofi: "Junto a ti" — used Colocación Destinada 3 times (persistent)
  tryUnlock('Nofi', p.nofiDestinada3);

  // Menmei: "Buscando la verdad" — Nofi placed and Ery in same space same turn
  tryUnlock('Menmei', p.menmeiNofiEryTurn);

  // Filia: "El hueco" — won in "Sólo hay un hueco" space with value 0
  tryUnlock('Filia', p.filiaV0Win);

  // Tis: "Existencia" — 3 Exist cards in "Existir se duplican" space at game end
  tryUnlock('Tis', p.tis3ExistDuplicated);

  // Reiza: "Nihilismo" — V0 extinguished in "Las cartas de Valor 0 se extinguen" space
  tryUnlock('Reiza', p.reizaExtinctV0Effect);

  // Resta: "Aceptación" — player won game with a "menos valor" space won
  tryUnlock('Resta', p.restaWonMenosValor);

  // Roloc: "El color" — Tei placed one card of each type (exist, reveal, special)
  tryUnlock('Roloc', p.rolocTeiTypesUsed && p.rolocTeiTypesUsed.exist && p.rolocTeiTypesUsed.reveal && p.rolocTeiTypesUsed.special);

  // Usei: "El destino" — Real appeared 7 times across all games
  tryUnlock('Usei', (p._useiRealCount || 0) >= 7);

  // Su: "La verdad" — 10 rival-condition triggers across all games
  tryUnlock('Su', (p.suCondTriggers || 0) >= 10);

  // Neutra: "Amante de las cartas" — player stole Reki from rival hand
  tryUnlock('Neutra', p.neutraStoleReki);

  // Suma: "El cariño" — won without placing V0 nor completing Destinada
  tryUnlock('Suma', p.sumaWonClean);

  // Una: "Espectador" — won placing Reki in a Real space
  tryUnlock('Una', p.unaRekiWonReal);

  // Miria: "Espinas" — exactly 1 won, 1 tied, 1 lost
  tryUnlock('Miria', p.miriaOneWinOneTieOneLoss);

  // Kaeka: "Coraje" — won game with ≥3 boosted allies in one space
  tryUnlock('Kaeka', p.kaekaThreeBoostedAllies);

  // Miboro: "A ciegas" — won a space with the "se revelan al final" effect
  tryUnlock('Miboro', p.miboroWonFogSpace);

  // Imi: "Suerte" — all 3 spaces tied
  tryUnlock('Imi', p.imiAllTied);

  // Gae: "Estimulación" — ended with 2 V0 + 1 V1 in same space
  tryUnlock('Gae', p.gaeTwoV0OneV1SameSpace);

  // Zao: "La fuerza del débil" — won without any boosted ally
  tryUnlock('Zao', p.zaoWonNoBoosted);

  // Humi: "Envidia" — won with only Reveal-type cards on board
  tryUnlock('Humi', p.humiWonOnlyReveal);

  // Kope: "Infelicidad" — rival removed ≥6 player cards total (persistent)
  tryUnlock('Kope', (p.kopeRivalRemovedCount || 0) >= 6);

  // Tenpoh: "Ceguera" — Peroth sent from deck to discard by Tenpoh
  tryUnlock('Tenpoh', p.tenpohSentPerothToDiscard);

  // Soi: "Llama preventiva" — player placed both Ziru and Tira in one game
  tryUnlock('Soi', p.soiZiruPlaced && p.soiTiraPlaced);
  tryUnlock('Moira', p.moiraUseiExtinct);

  if (newly.length > 0) {
    saveUnlocks();
    newly.forEach(n => NEWLY_UNLOCKED_CARDS.add(n));
  }
  return newly;
}

// Show a styled notification for newly unlocked cards
function showUnlockNotification(names) {
  const existing = document.getElementById('unlock-notification');
  if (existing) existing.remove();

  const box = document.createElement('div');
  box.id = 'unlock-notification';
  box.style.cssText = `
    position:fixed; bottom:140px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#1a1020,#2a1535);
    border:2px solid var(--gold); border-radius:12px;
    padding:14px 20px; z-index:9999; text-align:center;
    box-shadow:0 0 30px rgba(200,160,60,0.4);
    animation: unlockPop 0.4s cubic-bezier(.22,.8,.4,1.1) both;
    max-width:360px; min-width:220px;
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes unlockPop { from{opacity:0;transform:translateX(-50%) scale(0.7)} to{opacity:1;transform:translateX(-50%) scale(1)} }`;
  document.head.appendChild(style);

  const title = document.createElement('div');
  title.style.cssText = 'color:var(--gold);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;';
  title.textContent = window.CURRENT_LANG === 'en' ? '🔓 Card unlocked!' : window.CURRENT_LANG === 'ja' ? '🔓 カード解放！' : '🔓 ¡Carta desbloqueada!';
  box.appendChild(title);

  names.forEach(name => {
    const cond = getUnlockCondition(name) || {};
    const achievTitle = cond.title || '';
    const condText = cond.text || '';

    // Card image
    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'display:flex;justify-content:center;margin-bottom:8px;';
    const img = document.createElement('img');
    img.src = `./ilustraciones/${name}.jpg`;
    img.draggable = false;
    img.style.cssText = 'width:90px;border-radius:7px;border:1px solid var(--gold);box-shadow:0 0 14px rgba(201,168,76,0.4);object-fit:cover;';
    img.onerror = () => imgWrap.style.display = 'none';
    imgWrap.appendChild(img);
    box.appendChild(imgWrap);

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'color:#fff;font-size:1.05rem;font-weight:bold;margin:4px 0 2px;';
    nameEl.textContent = getCardDisplay(name).displayName || name;
    box.appendChild(nameEl);

    if (achievTitle) {
      const achEl = document.createElement('div');
      achEl.style.cssText = 'color:var(--silver);font-size:0.72rem;font-style:italic;margin-bottom:4px;';
      achEl.textContent = `"${achievTitle}"`;
      box.appendChild(achEl);
    }

    if (condText) {
      const condEl = document.createElement('div');
      condEl.style.cssText = 'color:var(--text-dim);font-size:0.68rem;line-height:1.4;margin-top:4px;padding:0 4px;';
      condEl.textContent = condText;
      box.appendChild(condEl);
    }
  });

  const close = document.createElement('button');
  close.className = 'btn btn-sm';
  close.style.cssText = 'margin-top:10px;font-size:0.7rem;';
  close.textContent = t('btn_close').replace('✕ ', '');
  close.onclick = () => box.remove();
  box.appendChild(close);

  document.body.appendChild(box);
  setTimeout(() => { if (box.parentNode) box.remove(); }, 10000);
}

// ══════════════════════════════════════════════════════════
//  CARD DATABASE
// ══════════════════════════════════════════════════════════
const CARD_DB = {
  // VALUE 1
  Koly:       { value:1, type:'exist',   effect:"Tus aliados en este espacio no pueden ser removidos." },
  Chiouri:    { value:1, type:'exist',   effect:"El máximo de valor en este espacio es de 3." },
  Gena:       { value:1, type:'reveal',  effect:"Un aliado gana +1 valor." },
  Nugu:       { value:1, type:'reveal',  effect:"Coloca al rival un Erizo de Peluche Blanco aquí." },
  Fukou:      { value:1, type:'reveal',  effect:"El próximo turno, el rival roba un Erizo de Peluche Blanco." },
  Ramia:      { value:1, type:'reveal',  effect:"Si el rival jugó aquí, roba una carta de la mano rival." },
  Reina:      { value:1, type:'exist',   effect:"Roba el valor potenciado del rival con más aquí." },
  Ziru:       { value:1, type:'exist',   effect:"Ves la mano rival." },
  Mugon:      { value:1, type:'exist',   effect:"Se sacrifica si cualquier aliado fuera a ser removido." },
  "Gran Demonio":{ value:1, type:'reveal',  effect:"Mueve ésta con un aliado de aquí a otro espacio." },
  Slau:       { value:1, type:'exist',   effect:"-1 de valor al resto de cartas aquí." },
  Hanoe:      { value:1, type:'exist',   effect:"Cada vez que un aliado es movido, ganas +1 valor." },
  Faun:       { value:1, type:'reveal',  effect:"Ganas +1 valor si es el último turno." },
  Yukoi:      { value:1, type:'reveal',  effect:"El próximo turno, tus aliados colocados de Valor 1 ganan +1 valor." },
  Abaki:      { value:1, type:'reveal',  effect:"Si el rival colocó aquí, ganas +2 valor." },
  Mimimi:     { value:1, type:'special', effect:"Al final del turno, si está en tu mano, entra forzada en cualquier espacio con hueco." },
  Hobu:       { value:1, type:'reveal',  effect:"Si el rival no jugó aquí, los rivales con existir aquí pierden su efecto." },
  Yiren:      { value:1, type:'exist',   effect:"El resto de aliados aquí ganan +1 valor." },
  Tira:       { value:1, type:'exist',   effect:"Colocas tus cartas luego de que el rival lo haga." },
  Demae:      { value:1, type:'exist',   effect:"Mueve a un espacio adyacente las cartas de Valor 1 colocadas aquí." },
  Feruzu:     { value:1, type:'reveal',  effect:"Remueve los rivales sin potenciar de aquí." },
  Kakomi:     { value:1, type:'reveal',  effect:"Remueve los rivales potenciados de aquí." },
  Soi:        { value:1, type:'exist',   effect:"Puedes ojear las 4 próximas cartas de cada jugador y, cuando robas con un efecto, puedes elegir." },
  Tanozo:     { value:1, type:'reveal',  effect:"Si el rival colocó aquí, su carta pierde los efectos." },
  Foret:      { value:1, type:'exist',   effect:"Ganas +1 valor por cada carta en tu mano." },
  Tanna:      { value:1, type:'special', effect:"Si es descartada del mazo, se coloca en un hueco rival aleatorio. Si fue robada de tu mano, se coloca en un hueco rival aleatorio." },
  Peroth:     { value:1, type:'reveal',  effect:"Coloca una carta de Valor 1 de la Pila de Descarte a un espacio aliado y la revelas; si no hay, descarta las dos primeras cartas del mazo." },
  Henos:      { value:1, type:'reveal',  effect:"Descarta al azar una carta de Valor 1 de la mano de ambos jugadores." },
  Miria:      { value:1, type:'exist',   effect:"Cuando un aliado de Valor 1 es colocado aquí, lo descartas y ganas +2 valor." },
  Ekuro:      { value:1, type:'special', effect:"Puedes retirar un aliado para ganar +1 valor. Existir: Puedes retirar un aliado al colocar carta para que gane +1 valor." },
  Filia:      { value:1, type:'exist',   effect:"Tenéis un hueco menos aquí." },
  Naiki:      { value:1, type:'reveal',  effect:"Descartáis las dos primeras cartas de vuestros mazos." },
  Kaeka:      { value:1, type:'exist',   effect:"Ganas +2 valor por cada rival potenciado aquí." },
  Miboro:     { value:1, type:'exist',   effect:"Los aliados colocados son revelados al final de la partida." },
  En:         { value:1, type:'exist',   effect:"Ganas +2 valor cada vez que le intentan reducir el Valor." },
  Ponce:      { value:1, type:'exist',   effect:"Ganas +1 valor por cada carta en la Pila de Descarte." },
  Mega:       { value:1, type:'reveal',  effect:"Cada aliado en un espacio perdido gana +1 valor." },
  Imi:        { value:1, type:'exist',   effect:"Ganas los empates." },
  Etza:       { value:1, type:'exist',   effect:"El resto de espacios gana +1 valor." },
  Gae:        { value:1, type:'exist',   effect:"Si hay aliados aquí, sus valores pasan a 0 y ésta gana +2." },
  Iona:       { value:1, type:'exist',   effect:"Ganas +1 valor por cada hueco vacío aquí." },
  Zao:        { value:1, type:'reveal',  effect:"Ganas +1 valor por cada enemigo aquí." },
  Humi:       { value:1, type:'reveal',  effect:"Copia el Revelar de un rival aquí de Valor 1." },
  Noira:      { value:1, type:'reveal',  effect:"Devuelve a tu mano un aliado; si es Valor 1, ganas +1 valor." },
  Kope:       { value:1, type:'reveal',  effect:"Si el rival no colocó aquí, remueve una carta aliada de Valor 1." },
  Menmei:     { value:1, type:'reveal',  effect:"Roba una carta de Valor 0 y una de Valor 1 del mazo." },
  Nofi:       { value:1, type:'reveal',  effect:"Si el rival no colocó aquí, coloca un Ery en otro espacio aliado." },
  Tenpoh:     { value:1, type:'exist',   effect:"Al final del turno, cada jugador descarta al azar una carta del mazo." },
  // VALUE 0
  Tei:        { value:0, type:'reveal',  effect:"Busca un Valor 1 en las últimas 4 cartas de tu mazo y colócala en otro espacio como Valor 0 sin activar el revelar." },
  Roloc:      { value:0, type:'exist',   effect:"El resto de espacios tienen este efecto de espacio." },
  Reki:       { value:0, type:'exist',   effect:"Ignora todos los efectos." },
  Moira:      { value:0, type:'reveal',  effect:"Remueve un Valor 1 aliado y enemigo." },
  Reiza:      { value:0, type:'reveal',  effect:"No tiene Valor. Revelar: Agrega un Gatito a la Pila de Extinción." },
  Yuta:       { value:0, type:'reveal',  effect:"Cambia al azar el efecto de un espacio." },
  Tis:        { value:0, type:'exist',   effect:"Duplica el valor del resto de tus aliados aquí." },
  Usei:       { value:0, type:'exist',   effect:"Ésta se extingue si un Valor 1 es removido." },
  Nasu:       { value:0, type:'exist',   effect:"El rival debe jugar aquí si puede." },
  Su:         { value:0, type:'exist',   effect:"Las cartas aliadas se activan sin condición de si colocó, o no, aquí." },
  Rasu:       { value:0, type:'reveal',  effect:"Mueve una carta de aquí a otro espacio." },
  Neutra:     { value:0, type:'reveal',  effect:"Intercambia esta carta por una del rival en este espacio; si está boca abajo, la revelas antes de intercambiar." },
  Resta:      { value:0, type:'exist',   effect:"Las cartas en este espacio no tienen ni ganan valor; gana los espacios con Real." },
  Suma:       { value:0, type:'special', effect:"Si está en tu mano, extingue esta carta. Roba 1 carta del mazo. No puedes utilizar Colocación Destinada. (Se roba al inicio en construido)" },
  Una:        { value:0, type:'reveal',  effect:"Intercambia el efecto de este espacio con el de otro." },
};

// Tokens (not in deck)
const TOKENS = {
  ErizoPeluche:{ value:1, type:'exist', effect:"Cuando colocas un aliado aquí, mueve esta carta al tope del mazo." },
  Ery:         { value:1, type:'exist', effect:"Con Nofi en el mismo espacio, ambos ganan +2 valor." },
  Gatito:      { value:1, type:'special', isToken:true, effect:"Al inicio de cada turno, si está en la Pila de Descarte o Extinción, se mueve a la otra." },
};

// Space effects pool per space index
const SPACE_EFFECTS = [
  // Espacio 1 — El Sueño — 7 efectos actualmente
  [
    "Tu mayor Valor aquí se mantiene hasta que lo superes.",
    "Los efectos de cartas ajenas a este espacio no aplican aquí.",
    "Los efectos de Revelar se repiten una vez más.",
    "La partida se alarga un turno.",
    "El resto de efectos de espacio están desactivados.",
    "Las cartas aquí se revelan al final de la partida.",
    "Las cartas en este espacio no pueden ser movidas.",
  ],
  // Espacio 2 — La Existencia — 6 efectos actualmente
  [
    "Los efectos de Existir se duplican aquí.",
    "Las cartas de Valor 0 colocadas aquí se extinguen.",
    "Los personajes no pueden ser removidos aquí.",
    "Sólo hay un hueco aquí.",
    "Los Valor 1 pierden -1 valor aquí.",
    "Los efectos de existir no funcionan aquí.",
  ],
  // Espacio 3 — El Color — 6 efectos actualmente
  [
    "El valor de los espacios ya no va por separado.",
    "Este espacio lo gana quien tenga más cartas con menos valor.",
    "Aquí sólo cuenta quien más cartas de valor 0 tenga.",
    "Solo puede haber una carta de Valor 0 y una de Valor 1 aquí.",
    "Al final de la partida, si hay una carta de existir, revelar y especial, remueve una carta del rival aquí.",
    "No puedes activar Colocación Destinada.",
  ]
];

// Category icons shown while space is fogged
// ⚔ aggressive, 🛡 protective, 🔀 rules, ⚡ value mod, 🌀 deck, ⭕ neutral
const SPACE_EFFECT_CATEGORY = {
  "Sin efecto.": "⭕",
  "Este espacio se bloquea tras el turno 2.": "🔀",
  "Se revelan los efectos del resto de espacios.": "🔀",
  "Tu mayor Valor aquí se mantiene hasta que lo superes.": "🛡",
  "Los efectos de cartas ajenas a este espacio no aplican aquí.": "🛡",
  "Los efectos de Revelar se repiten una vez más.": "⚡",
  "La partida se alarga un turno.": "🔀",
  "El resto de efectos de espacio están desactivados.": "🛡",
  "Las cartas aquí se revelan al final de la partida.": "🔀",
  "Los efectos de Existir se duplican aquí.": "⚡",
  "Las cartas de Valor 0 colocadas aquí se extinguen.": "⚔",
  "Los personajes no pueden ser removidos aquí.": "🛡",
  "Sólo hay un hueco aquí.": "🔀",
  "Cambia el efecto de todos los espacios.": "🌀",
  "El valor de los espacios ya no va por separado.": "🔀",
  "Este espacio lo gana quien tenga más cartas con menos valor.": "🔀",
  "Cada turno, el resto de efectos de Espacios cambia.": "🌀",
  "Aquí sólo cuenta quien más personajes tenga.": "⚔",
  "Aquí sólo cuenta quien más cartas de valor 0 tenga.": "⚔",
  "Solo puede haber una carta de Valor 0 y una de Valor 1 aquí.": "🔀",
  "Los Valor 1 pierden -1 valor aquí.": "⚡",
  "Al final de la partida, si hay una carta de existir, revelar y especial, remueve una carta del rival aquí.": "⚔",
  "Los efectos de existir no funcionan aquí.": "🛡",
  "No puedes activar Colocación Destinada.": "🔀",
  "Las cartas en este espacio no pueden ser movidas.": "🛡",
};

// ══════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════
// Load persisted unlocks now that CARD_DB and TOKENS are defined
loadUnlocks();
let G = {};
let selectedCard = null;       // index in player hand (first card)
let selectedCard2 = null;      // index in player hand (second card — Colocación Destinada)
let destinadaPhase = 0;        // 0 = normal, 1 = first placed, waiting for second
let destinadaCard1Info = null; // { card, spaceIdx, slotIdx } — for ESC undo
let pendingPlacement = null;   // {spaceIdx, slotIdx}
let modalResolve = null;
let boardPickState = null;     // { filterFn, resolve } — active board card pick
let spacePickState = null;     // { filterFn, resolve } — active space pick
let slotPickState  = null;     // { filterFn, resolve } — active empty slot pick: filterFn(spaceIdx, side, slotIdx)
// [Nuevo] ¿decide una persona? El jugador 0 siempre; en una partida con un amigo (en_linea.js), también el 1.
// rdEligeHumano además apunta quién va a elegir, para que la elección se le pregunte a él.
let RD_QUIEN_ELIGE = 0;
function rdHumano(o){ return o === 0 || !!(window.RD_RED && RD_RED.anfitrion && RD_RED.enPartida && o === 1); }
function rdEligeHumano(o){ RD_QUIEN_ELIGE = o; return rdHumano(o); }

function mkCard(name, data, owner=-1) {
  return {
    name,
    value: data.value,
    baseValue: data.value,
    type: data.type,
    effect: data.effect,
    isToken: data.isToken || false,
    owner,
    faceDown: false,
    powerBonus: 0,       // bonus from effects, NOT counting base value
    effectDisabled: false,
    revealUsed: false,   // for reveal effects (Reki can reset)
  };
}

function mkToken(tokenName, owner) {
  const t = TOKENS[tokenName];
  const DISPLAY_NAMES = { 'ErizoPeluche': 'Erizo de Peluche Blanco', 'Gatito': 'Gatito' };
  return {
    name: tokenName,
    displayName: DISPLAY_NAMES[tokenName] || tokenName,
    value: t.value,
    baseValue: t.value,
    type: t.type,
    effect: t.effect,
    isToken: true,
    owner,
    faceDown: false,
    powerBonus: 0,
    effectDisabled: false,
    revealUsed: true,
  };
}

// ══════════════════════════════════════════════════════════
//  CARD FLIGHT ANIMATIONS
// ══════════════════════════════════════════════════════════
function animateFlyCard(fromRect, toRect, durationMs = 380) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'fly-card';
    const w = fromRect.width, h = fromRect.height;
    el.style.width   = w + 'px';
    el.style.height  = h + 'px';
    el.style.left    = fromRect.left + 'px';
    el.style.top     = fromRect.top  + 'px';
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
    el.style.transition = 'none';
    document.body.appendChild(el);
    el.getBoundingClientRect(); // force reflow
    const dx = toRect.left - fromRect.left + (toRect.width  - w) / 2;
    const dy = toRect.top  - fromRect.top  + (toRect.height - h) / 2;
    el.style.transition = `transform ${durationMs}ms cubic-bezier(0.25,0.6,0.3,1), opacity ${durationMs*0.4}ms ${durationMs*0.6}ms ease`;
    el.style.transform  = `translate(${dx}px,${dy}px) scale(0.82)`;
    el.style.opacity    = '0';
    setTimeout(() => { el.remove(); resolve(); }, durationMs + 80);
  });
}

// ══════════════════════════════════════════════════════════
//  REKI APPARITION — 1% per game, once only, after drawing a card
//  Replaces the just-drawn card in hand with Reki, with a visual
//  flip transition on that hand card's element and the Reki sound.
// ══════════════════════════════════════════════════════════
async function triggerRekiApparition(player, drawnCardIndex) {
  G.rekiApparitionUsed = true;

  // [Cambio] que Reki aparezca en la mano de la IA no se nota: sin animación, sin pausa y sin aviso
  const _secreto = player !== 0;
  // Brief pause so the drawn card settles into the hand
  if (!_secreto) await gameSleep(180);   // [Corregido] antes se aplicaba la velocidad dos veces

  // Find the hand card element that corresponds to drawnCardIndex
  let cardEl = null;
  if (player === 0) {
    const handEls = document.getElementById('hand-cards')?.querySelectorAll('.hand-card');
    if (handEls && handEls[drawnCardIndex]) cardEl = handEls[drawnCardIndex];
  } else {
    const aiEls = document.getElementById('ai-hidden-hand')?.querySelectorAll('.ai-card-back');
    if (aiEls && aiEls[drawnCardIndex]) cardEl = aiEls[drawnCardIndex];
  }

  // Animate the card element with the flip
  if (cardEl && !_secreto) cardEl.classList.add('reki-apparition-card');

  // Play Reki apparition sound solo si le tocó al jugador humano
  if (player === 0) playSound('rekiAparece');

  // Wait for flip midpoint, then swap the card in state
  if (!_secreto) await gameSleep(430);   // [Corregido] antes se aplicaba la velocidad dos veces

  // Replace drawn card with Reki in hand
  const rekiCard = mkCard('Reki', CARD_DB['Reki'], player);
  G.hands[player][drawnCardIndex] = rekiCard;
  render();

  // Wait for flip to finish
  if (!_secreto) await gameSleep(450);   // [Corregido] antes se aplicaba la velocidad dos veces

  if (!_secreto) addLog(`✦ ¡Reki aparece en tu mano! ✦`, 'important');

  // Unlock Reki the first time it appears in the player's hand
  if (player === 0 && !isCardUnlocked('Reki')) {
    UNLOCKED_CARDS.add('Reki');
    NEWLY_UNLOCKED_CARDS.add('Reki');
    saveUnlocks();
    if (G.unlockProgress) G.unlockProgress.rekiAppearedInHand = true;
    setTimeout(() => showUnlockNotification(['Reki']), 1400);
  }
}

// Test button: fuerza la aparición de Reki en la mano del jugador
async function testRekiApparition() {
  if (!G || G.phase === 'end') return;
  if (G.hands[0].length === 0) { addLog('No tienes cartas en mano.', ''); return; }
  // Force-enable for test
  G.rekiApparitionEnabled = true;
  G.rekiApparitionUsed = false;
  // Replace a random V1 in hand, or last card
  const v1Idx = G.hands[0].findIndex(c => c.baseValue === 1);
  const targetIdx = v1Idx !== -1 ? v1Idx : G.hands[0].length - 1;
  await triggerRekiApparition(0, targetIdx);
}

// Check whether Reki apparition should trigger after a draw.
// Returns true if it triggered (caller should await).
async function checkRekiApparition(player, drawnCardIndex) {
  if (!G.rekiApparitionEnabled) return false;
  if (G.rekiApparitionUsed) return false;
  // The drawn card itself cannot already be Reki
  const drawn = G.hands[player][drawnCardIndex];
  if (!drawn || drawn.name === 'Reki') return false;
  // Only replace V1 cards (not V0 special draws)
  if (drawn.baseValue !== 1) return false;

  await triggerRekiApparition(player, drawnCardIndex);
  return true;
}
async function animateDeckToDiscard(card) {
  const deckEl    = document.getElementById('deck-pile-vis');
  const discardEl = document.getElementById('discard-pile-vis');
  const fromRect = deckEl    ? deckEl.getBoundingClientRect()
    : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
  const toRect   = discardEl ? discardEl.getBoundingClientRect()
    : { left: window.innerWidth - 70, top: window.innerHeight / 2 + 90, width: 52, height: 74 };
  await animateFlyCard(fromRect, toRect, Math.round(320 * OPTIONS.speedFactor));
  // Tanna: if discarded from deck, she goes to a random slot instead of discard
  if (card.name === 'Tanna') {
    const placed = await handleTannaFromDeck(card);
    if (placed) { render(); return; }
  }
  removeToDiscard(card);
  render();
}

// Fire-and-forget: animate a card leaving a board slot toward a pile element
function animateCardFromSlot(spaceIdx, side, slotIdx, targetElId, durationMs = 360) {
  durationMs = Math.round(durationMs * OPTIONS.speedFactor);
  const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
  if (!spaceEls?.[spaceIdx]) return;
  const rows = spaceEls[spaceIdx].querySelectorAll('.slots-row');
  // side 1 = AI (top row, index 0), side 0 = player (bottom row, index 1)
  const rowEl = rows[side === 1 ? 0 : 1];
  const slotEls = rowEl?.querySelectorAll('.slot');
  if (!slotEls?.[slotIdx]) return;
  const fromRect = slotEls[slotIdx].getBoundingClientRect();
  const targetEl = document.getElementById(targetElId);
  const toRect = targetEl
    ? targetEl.getBoundingClientRect()
    : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
  animateFlyCard(fromRect, toRect, durationMs);
}

// Animate a card flying from rival hand (top) to player hand (bottom)
function animateStealCard() {
  const fromEl = document.getElementById('ai-hidden-hand')?.firstElementChild;
  const toEl   = document.getElementById('hand-cards')?.lastElementChild;
  const fromRect = fromEl ? fromEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: 0, width: 140, height: 196 };
  const toRect = toEl ? toEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight - 100, width: 140, height: 196 };
  animateFlyCard(fromRect, toRect, Math.round(400 * OPTIONS.speedFactor));
}

async function drawCardsAnimated(player, n, fromEffect = false) {
  const deckEl = document.getElementById('deck-pile-vis');
  // In deck mode, draw from each player's own deck
  const playerDeck = G.playerDecks?.[player];
  const isDeckMode = !!playerDeck;

  for (let i = 0; i < n; i++) {
    if (isDeckMode) {
      if (playerDeck.length === 0) break; // deck exhausted — simply don't draw
    } else {
      if (G.deck.length === 0) break;
    }
    const fromRect = deckEl
      ? deckEl.getBoundingClientRect()
      : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
    let c;
    if (!isDeckMode && fromEffect && soiActive(player) && G.deck.length > 0 && i > 0 && rdEligeHumano(player)) {
      const soiOptions = G.deck.slice(0, 4);
      const drawnSoFar = G.hands[player].slice(-(i));
      const chosen = await chooseCard(soiOptions, `Soi: elige qué carta robar (${i+1} de ${n})`, { noCancel: true, drawnCards: drawnSoFar });
      if (chosen) { G.deck.splice(G.deck.indexOf(chosen), 1); c = chosen; }
      else c = G.deck.shift();
    } else if (isDeckMode && fromEffect && soiActive(player) && playerDeck.length > 0 && i > 0 && rdEligeHumano(player)) {
      const soiOptions = playerDeck.slice(0, 4);
      const drawnSoFar = G.hands[player].slice(-(i));
      const chosen = await chooseCard(soiOptions, `Soi: elige qué carta robar (${i+1} de ${n})`, { noCancel: true, drawnCards: drawnSoFar });
      if (chosen) { playerDeck.splice(playerDeck.indexOf(chosen), 1); c = chosen; }
      else c = playerDeck.shift();
    } else if (isDeckMode) {
      c = playerDeck.shift();
    } else {
      const reservedIdx = G.deck.findIndex(c => !c._reservedFor || c._reservedFor === player);
      c = reservedIdx !== -1 ? G.deck.splice(reservedIdx, 1)[0] : G.deck.shift();
    }
    if (c._reservedFor !== undefined) delete c._reservedFor;
    c.owner = player;
    G.hands[player].push(c);
    playSound('draw');
    // Track max hand size for Foret unlock
    if (player === 0 && G.unlockProgress && G.hands[0].length >= 5) G.unlockProgress.foretHand5 = true;
    render();
    let toRect;
    if (player === 0) {
      const last = document.getElementById('hand-cards')?.lastElementChild;
      toRect = last ? last.getBoundingClientRect()
        : { left: window.innerWidth/2, top: window.innerHeight-100, width:170, height:238 };
    } else {
      const last = document.getElementById('ai-hidden-hand')?.lastElementChild;
      toRect = last ? last.getBoundingClientRect()
        : { left: window.innerWidth/2, top: 40, width:140, height:196 };
    }
    if (typeof animarRobo === 'function') await animarRobo(fromRect, toRect, c, player);   // [Nuevo] vuela en arco y se da la vuelta
    else await animateFlyCard(fromRect, toRect, Math.round(340 * OPTIONS.speedFactor));
    await gameSleep(60);
    if (!isDeckMode) await checkSumaDraw(player, c);
    // After the card settles, check if Reki appears in its place
    const drawnIdx = G.hands[player].length - 1;
    await checkRekiApparition(player, drawnIdx);
    // Naiki hito: deck empty before turn 4 while player has Naiki on board
    if (G.unlockProgress && !isDeckMode && G.deck.length === 0 && G.turn < 4) {
      const naikiOnBoard = G.spaces.some(sp =>
        sp.slots[0].some(c => c && c.name === 'Naiki' && !c.faceDown && !c.effectDisabled)
      );
      if (naikiOnBoard) G.unlockProgress.naikiDeckEmptyBefore4 = true;
    }
  }
  // Foret es tipo Existir: recalcular al cambiar la mano
  if (G && G.spaces) applyExistEffects();
}

async function animateAIPlay(spaceIdx, slotIdx) {
  const aiHand = document.getElementById('ai-hidden-hand');
  const srcEl  = aiHand?.firstElementChild;
  const fromRect = srcEl ? srcEl.getBoundingClientRect()
    : { left: window.innerWidth/2, top: 20, width:140, height:196 };
  const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
  let toRect = { left: window.innerWidth/2, top: window.innerHeight/2, width:52, height:74 };
  if (spaceEls?.[spaceIdx]) {
    const aiRow = spaceEls[spaceIdx].querySelectorAll('.slots-row')[0];
    const slotEls = aiRow?.querySelectorAll('.slot');
    if (slotEls?.[slotIdx]) toRect = slotEls[slotIdx].getBoundingClientRect();
  }
  await animateFlyCard(fromRect, toRect, Math.round(420 * OPTIONS.speedFactor));
}

// ══════════════════════════════════════════════════════════
//  MIMIMI — end-of-turn activation
//  Rules:
//  • Triggers AFTER reveal + effects, for both players
//  • Enters face-up
//  • Only valid target: a space where the owner has exactly
//    1 empty slot out of their slotCount (i.e. 2 already filled)
//  • Priority: player who revealed first that turn;
//    if no valid space for them, try the other player
// ══════════════════════════════════════════════════════════
async function checkMimimi(revealFirstPlayer) {
  // Find if anyone has Mimimi in hand
  const holderIdx = [revealFirstPlayer, 1 - revealFirstPlayer].find(p => G.hands[p].some(c => c.name === 'Mimimi'));
  if (holderIdx === undefined) return;

  const mimimiCardIdx = G.hands[holderIdx].findIndex(c => c.name === 'Mimimi');

  // Scan ALL sides of ALL spaces: any side with exactly 2/3 slots filled
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (space.blocked) continue;

    for (let side = 0; side < 2; side++) {
      const count  = space.slotCount[side];
      const filled = space.slots[side].slice(0, count).filter(Boolean).length;
      if (filled !== count - 1) continue; // must have exactly 1 empty slot

      const sl = space.slots[side].findIndex((c, i) => i < count && !c);
      if (sl === -1) continue;

      // Animate from hand to board before placing
      const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
      const destEl = spaceEls?.[sp];
      if (destEl) {
        const fromEl = holderIdx === 0
          ? document.getElementById('hand-cards')?.querySelector('.hand-card')
          : document.getElementById('ai-hidden-hand')?.firstElementChild;
        if (fromEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = destEl.getBoundingClientRect();
          await animateFlyCard(fromRect, toRect, Math.round(380 * OPTIONS.speedFactor));
        }
      }

      // Enter face-up, owned by whichever side it enters
      const card = G.hands[holderIdx].splice(mimimiCardIdx, 1)[0];
      card._autoPlaced = true; // mark as auto-forced for hito tracking
      placeCard(card, side, sp, sl, false, true);
      addLog(`Mimimi (${holderIdx===0?'tuya':'IA'}) entra sola en Espacio ${[1,2,3][sp]}, hueco ${sl+1} (bando ${side===0?'jugador':'IA'}).`, 'effect');
      // Tanna unlock: track if player's Mimimi landed on rival side
      if (holderIdx === 0 && side === 1 && G.unlockProgress) {
        G.unlockProgress._tannaMimimiOnRival = true;
      }
      // Tanna+Mimimi hito: Mimimi auto-entered the same space where Tanna activated this turn
      if (G.unlockProgress &&
          G.unlockProgress._tannaActivatedSpaceThisTurn === sp &&
          G.unlockProgress._tannaTurnActivated === G.turn) {
        G.unlockProgress.tannaMimimiSameTurn = true;
      }
      applyExistEffects(); // ensure Resta/exist effects apply to Mimimi immediately
      return;
    }
  }
}

function initGame(deckP0 = null, deckP1 = null) {
  _v0EntryPlayed.clear();
  // Reset Real sound flag for new game
  const v0Pool = [];
  const sharedDeck = [];
  for (const [name, data] of Object.entries(CARD_DB)) {
    if (name === 'Reki') continue; // Reki no entra en ningún mazo; puede aparecer por aparición especial
    // Quick game: skip locked cards entirely
    if (!isCardUnlocked(name)) continue;
    const card = mkCard(name, data);
    if (data.value === 0) {
      v0Pool.push(card);
    } else {
      sharedDeck.push(card);
    }
  }
  shuffle(v0Pool);
  shuffle(sharedDeck);

  // Build per-player decks if provided
  function buildPlayerDeck(deckDef) {
    if (!deckDef) return null;
    return deckDef.cards.map(name => {
      const data = CARD_DB[name];
      if (!data) return null;
      return mkCard(name, data);
    }).filter(Boolean);
  }
  const playerDeck0 = buildPlayerDeck(deckP0);
  const playerDeck1 = buildPlayerDeck(deckP1);
  if (playerDeck0) shuffle(playerDeck0);
  if (playerDeck1) shuffle(playerDeck1);

  // Space effects: each pool always maps to its fixed space
  // Pool 0 → Espacio 1 (El Sueño), Pool 1 → Espacio 2 (La Existencia), Pool 2 → Espacio 3 (El Color)
  const poolOrder = [0, 1, 2];
  function pickSpaceEffect(spaceIdx) {
    const pool = SPACE_EFFECTS[poolOrder[spaceIdx]];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const spaceEffects = [0,1,2].map(i => pickSpaceEffect(i));

  // Auto-reveal "No puedes activar Colocación Destinada" at game start
  const _destinadaBlockedSpaces = spaceEffects.map((e, i) => e.includes('activar Colocación Destinada') ? i : -1).filter(i => i !== -1);

  G = {
    deck: sharedDeck,
    v0Pool,                // V0 cards available for Menmei-style draws
    usedV0Names: new Set(), // names of V0s already dealt (to avoid duplicates)
    playerDecks: [playerDeck0 || null, playerDeck1 || null], // per-player decks (deck mode only)
    discard: [],
    extinct: [],    // cards removed from game entirely — not accessible by any effect
    hands: [[], []],
    spaces: [0,1,2].map(i => ({
      effectText: spaceEffects[i],
      poolIdx: poolOrder[i],            // which SPACE_EFFECTS pool this space draws from
      effectRevealed: true,
      fogged: false,             // always discovered
      exploredBy: { 0: true, 1: true }, // both sides always explored
      blocked: false,
      slotCount: [3, 3],
      slots: [[null,null,null],[null,null,null]],
      _erizoDone: false,
      _hideUntilEnd: false,
      _pendingFogLift: false,
      _peakScore: [0, 0],   // peak score per side for "mayor Valor" effect
    })),
    turn: 1,
    maxTurns: 6,
    phase: 'suma_check',  // suma_check | player_place | ai_place | resolve | end
    playerRevealFirst: true,
    tieBreaker: Math.random() < 0.5 ? 0 : 1,  // decided once at start: who reveals first on a full tie
    logs: [],
    extraTurn: false,
    _erizoDone: false,
    pending_yukoi: null,
    pending_nasu: [],
    pending_fukou: [],
    tiraPendingAISpace: null,
    tiraPendingAISlot: null,
    destinadaUsed: [false, false],  // [player, AI] — one use per partida each
    seenPlayerCards: [],            // names of player cards the AI has seen revealed
    aiPlayerSpaceHistory: [0, 0, 0], // how many times player placed in each space [sp0,sp1,sp2]
    aiMatchState: 'neutral',        // 'winning' | 'neutral' | 'losing' — updated each turn
    rekiApparitionEnabled: Math.random() < 0.01, // 1% chance per game Reki can appear
    rekiApparitionUsed: false,      // can only happen once per game
    _realMusicPlaying: false,       // Real loop music started this game
    // ── Progression tracking ──
    unlockProgress: {
      fukouSpaceWon:         false, // Fukou: won a space with ErizoPeluche on rival side
      cardsStolen:           0,     // Reina: total cards stolen from rival hand this game
      kolyProtectedRemoval:  false, // Mugon: Koly blocked a removal
      rivalPlacedCondTriggers: 0,   // Ziru: Abaki/Ramia/Tanozo triggered with rival-placed condition
      faunWonLostSpace:      false, // Yukoi: Faun +1 turned a losing space into a win
      allSlotsFilled:        false, // Mimimi: all slots occupied at game end
      ekuroDoubleDisplace:   false, // Yiren: Ekuro displaced ally AND another card displaced via Ekuro Exist same game
      _ekuroSelfDisplaced:   false, // internal: player's Ekuro itself displaced an ally
      _ekuroExistDisplaced:  false, // internal: player placed another card on an ally via Ekuro Exist
      genaCrossSpace:        false, // Etza: Gena boosted ally in different space
      yukoiCrossSpace:       false, // Etza: Yukoi boosted ally in different space
      // New unlock conditions
      tiraWonAllSpaces:      false, // Tira: "Estratega" — won all 3 spaces
      demaeMoved3:           false, // Demae: "Desastre" — player moved 3+ cards via other move effects (not Demae itself)
      _cardsMoved:           0,     // general counter: cards moved by player (Gran Demonio, Rasu, etc.) — excludes Demae itself
      granDemonioMoved2:     false, // Gran Demonio: "Taxista" — player moved 2+ cards via move effects
      chiouriWonClean:       false, // Chiouri: "Límites claros" — won without 3+ value in all 3 spaces
      slauLostAllSpaces:     false, // Slau: "Justicia ciega" — lost all 3 spaces
      kakomiRemovedThree:    false, // Kakomi: "Tres cerezas" — removed 3 cards with Feruzu in one turn
      _kakomiTurnRemovals:   {},    // { turnNum: count } for Feruzu removals per turn
      tanozoRivalZeroTwo:    false, // Tanozo: "Infortunio" — rival scored 0 in 2 spaces
      // New unlock conditions (second batch)
      tannaStole3AndDiscard2: false, // Tanna: OLD condition (kept for compat)
      tannaMimimiWonRivalSpace: false, // Tanna: "Bufón" — player's Mimimi placed on rival side wins a space
      _tannaMimimiOnRival:    false, // internal: player's Mimimi was placed on rival side this game
      _tannaStoleCount:       0,     // cards stolen from rival hand this game (all sources)
      _tannaRivalDeckDiscards: 0,    // cards discarded from deck by effects (Naiki, Henos side effect) — rival's deck
      perothPonce5:           false, // Peroth: "El pecado" — Ponce reached value 5 in one game
      henosNaiki3:            false, // Henos: "Bromista" — player placed Naiki 3 times (across all games, tracked persistently via localStorage)
      _naikiPlacedCount:      0,     // Naiki placed by player this game
      foretHand5:             false, // Foret: "Perversión" — player had 5 cards in hand at once
      nofiDestinada3:         false, // Nofi: "Junto a ti" — player used Colocación Destinada 3 times (tracked persistently)
      _destinadaCount:        0,     // times player used Colocación Destinada this game
      menmeiNofiEryTurn:      false, // Menmei: "Buscando la verdad" — Nofi placed and Ery joined Nofi same space same turn
      _nofiPlacedThisTurn:    false, // Nofi was placed by player this turn
      _nofiSpaceThisTurn:     -1,    // space where Nofi was placed this turn
      filiaV0Win:             false, // Filia: "El hueco" — won in a space with "Sólo hay un hueco" with value 0
      tis3ExistDuplicated:    false, // Tis: "Existencia" — ended with 3 Exist cards in a space with "Los efectos de Existir se duplican"
      reizaExtinctV0Effect:   false, // Reiza: "Nihilismo" — extinguished a V0 in a "Las cartas de Valor 0 se extinguen" space
      // ── New unlock conditions (third batch) ──
      restaWonMenosValor:      false, // Resta: "Aceptación" — player won the game AND a "menos valor" space was won
      rolocTeiTypesUsed:       {},    // Roloc: "El color" — keys: 'exist','reveal','special' placed by Tei (persistent)
      suCondTriggers:          0,     // Su: "La verdad" — total rival-placed condition triggers (persistent, ≥10)
      neutraStoleReki:         false, // Neutra: "Amante de las cartas" — player stole Reki from rival hand
      sumaWonClean:            false, // Suma: "El cariño" — won without placing V0 nor completing Destinada
      _sumaUsedV0:             false, // internal: player placed a V0 this game
      _sumaCompletedDestinada: false, // internal: player completed a Destinada this game
      unaRekiWonReal:          false, // Una: "Espectador" — won placing Reki in a Real space
      // ── New unlock conditions (fourth batch) ──
      miriaOneWinOneTieOneLoss: false, // Miria: "Espinas" — 1 won + 1 tied + 1 lost
      kaekaThreeBoostedAllies: false,  // Kaeka: "Coraje" — won game with 3 boosted allies in one space
      miboroWonFogSpace:       false,  // Miboro: "A ciegas" — won a "se revelan al final" space
      imiAllTied:              false,  // Imi: "Suerte" — all 3 spaces tied
      gaeTwoV0OneV1SameSpace:  false,  // Gae: "Estimulación" — 2 V0 + 1 V1 in same space at end
      zaoWonNoBoosted:         false,  // Zao: "La fuerza del débil" — won without any boosted ally
      humiWonOnlyReveal:       false,  // Humi: "Envidia" — won with only Reveal-type cards
      kopeRivalRemovedCount:   0,      // Kope: "Infelicidad" — total cards removed by rival (persistent, ≥6)
      tenpohSentPerothToDiscard: false, // Tenpoh: "Ceguera" — Peroth from deck sent to discard by Tenpoh
      soiZiruPlaced:             false, // Soi: Ziru placed by player this game
      soiTiraPlaced:             false, // Soi: Tira placed by player this game
      // ── New hito conditions (Abaki, Mimimi, Hobu, Yiren, Tira, Demae) ──
      abakiTriggeredWithMiria:   false, // Abaki hito: Abaki triggered AND Miria allied same space at game end
      _abakiTriggeredSpaces:     [],    // internal: spaces where player's Abaki triggered this game
      mimimiManualWonSpace:      false, // Mimimi hito: player placed Mimimi manually (no auto-trigger) and won that space
      _mimimiManualSpaceIdx:     -1,    // internal: space where player placed Mimimi manually this game
      hobuDisabledExistCount:    0,     // Hobu hito: cumulative rival exist-cards disabled by player's Hobu this game
      yirenSpacesVisited:        [],    // Yiren hito: space indices where player's Yiren has been placed this game
      tiraEstrategaEspia:        false, // Tira hito: Tira T1 + all other turns condMet cards with success, no Su
      _tiraPlacedT1:             false, // internal: player placed Tira on turn 1
      _tiraNonT1CondSuccess:     0,     // internal: turns after T1 where player placed a condMet-type card with success
      _tiraNonT1Turns:           0,     // internal: turns after T1 count (excluding T1)
      _tiraHadSu:                false, // internal: Su was active at any point this game
      demaeWonLockedSpace:       false, // Demae hito: won the game with player's Demae in "no pueden ser movidas" space
      // ── New hito conditions ──
      imiTiebreakCount:          0,     // Imi hito: spaces where Imi broke the tie this game (need 3)
      _kolyProtectCount:         0,     // Koly hito: times Koly blocked a removal this game (need 2)
      chiouriWonVsHigh:          false, // Chiouri hito: won a space with Chiouri where rival had ≥6 value
      _genaCrossSpaceTarget:     null,  // Gena hito: { cardName, spaceIdx } of the boosted ally
      _genaSourceSpaceIdx:       -1,    // Gena hito: space where Gena was placed
      genaChiouriDoubleWin:      false, // Gena hito: Gena+Chiouri different spaces both won
      fukouTripleErizo:          false, // Fukou hito: rival has ErizoPeluche in space + hand + deck
      ramiaStoleNugu:            false, // Ramia hito: player stole Nugu from rival hand
      // ── New hito tracking (Reina, Ziru, Mugon, Gran Demonio) ──
      reinaFurtivaSteals6:       false, // Reina hito: Reina moved then stole ≥6 value from rival
      _reinaWasMoved:            false, // internal: Reina was moved this game by Rasu/Demae/Gran Demonio
      _reinaMovedSpaceIdx:       -1,    // internal: space Reina landed in after being moved
      ziruStoleReki:             false, // Ziru hito: player stole Reki from rival hand while allied Ziru in board
      kolyProtectedMugon:        false, // Mugon hito: Koly protected Mugon in same space
      granDemonioTaxistaMasPoderoso: false, // Gran Demonio hito: moved GD+Tira into unique-value space, Tira discarded
      _granDemonioMovedTiraToUnique: false, // internal: GD moved with Tira into unique-value space this game
      // ── New hito conditions (Slau, Hanoe, Faun, Yukoi) ──
      slauJusticiaWon:               false, // Slau: ganó un espacio lleno de V1 con Slau aliado
      hanoeMaxValue:                 0,     // Hanoe: valor máximo alcanzado por Hanoe en una partida
      faunTurn7PlusTwo:              false, // Faun: obtuvo +2 valor en turno 7
      yukoiBoostedTwoSameTurn:       false, // Yukoi: dio +1 a dos aliados en el mismo turno
      _yukoiBoostedThisTurn:         0,     // internal: counter de aliados boosteados por Yukoi este turno
      // ── New hito conditions (Feruzu, Kakomi, Soi, Tanozo, Foret, Tanna) ──
      feruzuRemovedKakomi:           false, // Feruzu hito: player's Feruzu removed a rival Kakomi
      kakomiremovedSlau:             false, // Kakomi hito: player's Kakomi removed a rival Slau
      soiMenmeiDrawTwo:              false, // Soi hito: player drew 2+ cards via Menmei while Soi was active
      soiMenmeiDrawTwoWin:           false, // Soi hito: above + player won the game
      _tanozoDisabledCount:          0,     // internal: how many rival cards lost effect via player's Tanozo this game
      tanozoThreeDisabled:           false, // Tanozo hito: 3+ rival cards disabled by player's Tanozo
      foretDiscardedWithNugu:        false, // Foret hito: player discarded Foret from a space that had player's Nugu
      tannaMimimiSameTurn:           false, // Tanna hito: Tanna activated + Mimimi ended in same space same turn
      _tannaActivatedSpaceThisTurn:  -1,    // internal: space where Tanna activated this turn (-1 = none)
      _tannaTurnActivated:           -1,    // internal: turn number when Tanna last activated
      // ── New hito conditions (Peroth, Henos, Miria, Ekuro) ──
      perothPlacedMugon:             false, // Peroth hito: player's Peroth pulled Mugon from discard pile
      henosBothHandsEmpty:           false, // Henos hito: after Henos, both player and AI have 0 cards in hand
      miriaDiscardedAbaki:           false, // Miria hito: player's Miria discarded an Abaki
      ekuroT1Placed:                 false, // Ekuro hito internal: Ekuro placed on turn 1 by player
      ekuroSacrificeUsed:            false, // Ekuro hito internal: player used Ekuro sacrifice this game
      ekuroT1NoSacrifice:            false, // Ekuro hito: placed T1 + never used sacrifice (set at game end)
      // ── New hito conditions (Filia, Naiki, Kaeka, Miboro, En, Ponce) ──
      filiaChiouriWonSpace:          false, // Filia hito: player won a space with both Filia and Chiouri there
      naikiDeckEmptyBefore4:         false, // Naiki hito: deck empty before turn 4 with Naiki on board
      kaekaZeroValue:                false, // Kaeka hito: Kaeka ends game with 0 total value
      miboroRevealedInFogSpace:      false, // Miboro hito: player's Miboro revealed by space effect at game end
      enSixOrMore:                   false, // En hito: En ends game with 6+ total value
      ponceRemovedByRival:           false, // Ponce hito: rival removed player's Ponce
      // ── New hito conditions (Mega, Etza, Gae, Iona, Zao, Humi, Noira) ──
      _megaBoostedSpaces:            [],    // internal: set of space indices where Mega boosted while losing
      megaThreeLostBoostedWon:       false, // Mega hito: boosted all 3 losing spaces + won all 3
      _zaoThreeRivalsSpaceIdx:       -1,    // internal: space where Zao saw 3 rivals
      zaoThreeRivalsLost:            false, // Zao hito: placed Zao in space with 3 rivals and lost it
      humiLostToImiTiebreak:         false, // Humi hito: lost a space with Humi due to rival Imi tiebreak
      // ── New hito conditions (Kope, Menmei, Nofi, Tenpoh) ──
      kopeKilledAllyTriggeredUsei:   false, // Kope hito: Kope removed allied V1 → Usei extinguished → Real space
      _menmeiDrewSu:                 false, // internal: player drew Su via Menmei
      menmeiSuInExtinctSpace:        false, // Menmei hito: drew Su via Menmei, then placed Su in V0-extinguish space
      tenpohPlacedFromDiscard:       false, // Tenpoh hito: player placed Tenpoh from discard via Peroth
      // ── New hito conditions (Tei, Roloc, Reki, Reiza, Yuta) ──
      teiPlacedV1InExtinctSpace:     false, // Tei hito: placed V1-as-V0 in V0-extinguish space
      rolocPropagatedExtinct:        false, // Roloc hito: Roloc propagated a V0-extinguish effect to other spaces
      rekiWonRealSpace:              false, // Reki hito: player won a Real space with Reki
      reizaGatitoWonSpace:           false, // Reiza hito: player won a space with both Reiza and Gatito
      _yutaChangedSpaces:            [],    // internal: [{spaceIdx, wasLosingBefore}] tracked each Yuta use
      yutaTurnedLostToWon:           false, // Yuta hito: changed a losing space that ended as won
      // ── New hito conditions (Tis, Usei, Nasu, Su, Rasu) ──
      tisUseiFiredByKopeNugu:        false, // Tis+Usei hito: Kope removed allied Nugu → Usei+Tis both extinguished via Real
      nasuRivalDestinadaHere:        false, // Nasu hito: rival AI used Destinada in a space where player has Nasu face-up
      suEryErizoSameSpace:           false, // Su hito: Su+Ery+ErizoPeluche all in same player space at game end
      rasuSuErySameSpace:            false, // Rasu hito: Rasu+Su+Ery all in same player space at game end
      // ── New hito conditions (Neutra, Resta, Suma, Una, ErizoPeluche, Ery, Gatito) ──
      _neutraDestinadaUsedNuguNeutra: false, // internal: player used Destinada with Nugu+Neutra this game
      neutraDestinadaSwapErizo:      false, // Neutra hito: Destinada Nugu+Neutra + Neutra swapped with rival ErizoPeluche
      unaRekiSameSpace:              false, // Una hito: Reki and Una both in same player space at game end
      _sumaEverExtinct:              false, // internal: Suma was extinguished this game
      // ── New unlock/hito conditions (Moira) ──
      moiraUseiExtinct:              false, // Moira: "Desesperado" — player's Usei extinguished a space (Real triggered)
      moiraUseiHitoActivated:        false, // Moira hito: "Jugada invisible" — Moira removed a V1 ally → Usei extinguished
    },
    historyLog: [],       // registro de jugadas por turno para el historial
    _currentTurnLog: {},  // jugadas del turno en curso
    _deckNameP0: deckP0 ? (deckP0.name || 'Mazo') : null, // nombre del mazo del jugador
    _deckCardsP0: deckP0 ? (deckP0.cards ? [...deckP0.cards] : null) : null, // cartas originales del mazo
  };

  // Check persistent Nofi (Colocación Destinada ×3) count at game start
  try {
    const DESTINADA_KEY = 'juego_cartas_destinada_count';
    const dTotal = parseInt(localStorage.getItem(DESTINADA_KEY) || '0');
    if (dTotal >= 3) G.unlockProgress.nofiDestinada3 = true;
  } catch {}
  // Check persistent Henos (Naiki ×3) count at game start
  try {
    const NAIKI_KEY = 'juego_cartas_naiki_count';
    const nTotal = parseInt(localStorage.getItem(NAIKI_KEY) || '0');
    if (nTotal >= 3) G.unlockProgress.henosNaiki3 = true;
  } catch {}
  // Check persistent Su (rival-condition triggers ×10) count at game start
  try {
    const SU_KEY = 'juego_cartas_su_triggers';
    const sTotal = parseInt(localStorage.getItem(SU_KEY) || '0');
    G.unlockProgress.suCondTriggers = sTotal;
  } catch {}
  // Check persistent Roloc (Tei card types) at game start
  try {
    const ROLOC_KEY = 'juego_cartas_roloc_tei_types';
    const rTypes = JSON.parse(localStorage.getItem(ROLOC_KEY) || '{}');
    G.unlockProgress.rolocTeiTypesUsed = rTypes;
  } catch {}
  // Check persistent Usei (Real appearances) count at game start
  try {
    const USEI_KEY = 'juego_cartas_usei_real_count';
    const uTotal = parseInt(localStorage.getItem(USEI_KEY) || '0');
    G.unlockProgress._useiRealCount = uTotal;
  } catch {}
  // Check persistent Kope (rival removed player cards) count at game start
  try {
    const KOPE_KEY = 'juego_cartas_kope_rival_removed';
    const kTotal = parseInt(localStorage.getItem(KOPE_KEY) || '0');
    G.unlockProgress.kopeRivalRemovedCount = kTotal;
  } catch {}

  // Draw 4 each — animated in startGame
  // drawCards(0, 4);
  // drawCards(1, 4);

  addLog('── Turno 1 ──', 'important');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cardName(card) {
  return card.displayName || card.name;
}

function drawCards(player, n) {
  for (let i = 0; i < n; i++) {
    if (G.deck.length === 0) break;
    const reservedIdx = G.deck.findIndex(c => !c._reservedFor || c._reservedFor === player);
    const c = reservedIdx !== -1 ? G.deck.splice(reservedIdx, 1)[0] : G.deck.shift();
    if (c._reservedFor !== undefined) delete c._reservedFor;
    c.owner = player;
    G.hands[player].push(c);
    playSound('draw');
    // Track max hand size for Foret unlock
    if (player === 0 && G.unlockProgress && G.hands[0].length >= 5) G.unlockProgress.foretHand5 = true;
  }
  // Foret es tipo Existir: recalcular al cambiar la mano
  if (G && G.spaces) applyExistEffects();
}

function addLog(msg, type = '') {
  G.logs.push({ msg, type });
  // [Cambio] los efectos ya no salen como avisos en pantalla: solo en el historial desplegable (historial.js)
  if (typeof pxActualizarHistorial === 'function') pxActualizarHistorial();
  // Auto-refresh if modal is open
  if (document.getElementById('log-modal')?.classList.contains('show')) {
    refreshLogModal();
  }
  if (G.logs.length > 200) G.logs.shift();
  const badge = document.getElementById('log-badge-count');
  if (badge) badge.textContent = G.logs.length;
  // Auto-update if modal is open
  if (document.getElementById('log-modal')?.classList.contains('show')) {
    renderLogEntries();
  }
}

function renderLogEntries() {
  const entries = document.getElementById('log-entries');
  if (!entries) return;
  const wasAtBottom = entries.scrollHeight - entries.scrollTop - entries.clientHeight < 30;
  entries.innerHTML = '';
  G.logs.forEach(e => {
    const el = document.createElement('div');
    el.className = `log-entry ${e.type}`;
    el.textContent = e.msg;
    entries.appendChild(el);
  });
  // Only auto-scroll to bottom if user was already at bottom
  if (wasAtBottom) entries.scrollTop = entries.scrollHeight;
}

function refreshLogModal() {
  renderLogEntries();
}

function copyLog() {
  const text = G.logs.map(e => e.msg).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('log-copy-btn');
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = '⎘', 1500);
  }).catch(() => {
    // Fallback for browsers without clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    const btn = document.getElementById('log-copy-btn');
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = '⎘', 1500);
  });
}

function openLogModal() {
  const modal = document.getElementById('log-modal');
  if (modal.classList.contains('show')) {
    closeLogModal();
    return;
  }

  modal.classList.add('show');
  renderLogEntries();
}

function closeLogModal() {
  document.getElementById('log-modal').classList.remove('show');
}

// ══════════════════════════════════════════════════════════
//  SCORING
// ══════════════════════════════════════════════════════════
function getCardPower(card) {
  // Returns effective power: base + permanent bonus + dynamic exist bonus (never negative)
  if (!card || card.faceDown) return 0;
  if (card.name === 'Reiza') return -1; // always -1, lower than V0
  if (card.baseValue === 0) return 0;
  return Math.max(0, card.value + (card.powerBonus||0) + (card.existBonus||0));
}

function computeSpaceScore(spaceIdx) {
  const space = G.spaces[spaceIdx];

  // If space is blocked, check if Resta won it
  if (space.blocked) {
    // Reki in this space: ignore all Real/Resta rules, evaluate by card value
    const rekiSide = [0,1].find(s =>
      space.slots[s].some(c => c && c.name === 'Reki' && !c.faceDown && !c.effectDisabled)
    );
    if (rekiSide !== undefined) {
      // Reki (V0) vs whatever the other side has — plain V0 tiebreak
      const otherSide = 1 - rekiSide;
      const otherHasCards = space.slots[otherSide].some(c => c && !c.faceDown);
      // Reki wins if other side has no cards (or also just Reki-level V0)
      const v0mine = space.slots[rekiSide].filter(c => c && !c.faceDown).length;
      const v0other = space.slots[otherSide].filter(c => c && !c.faceDown).length;
      if (v0mine > v0other) return { p0:0, p1:0, winner: rekiSide, v0:[0,0] };
      if (v0other > v0mine) return { p0:0, p1:0, winner: otherSide, v0:[0,0] };
      return { p0:0, p1:0, winner:-1, v0:[0,0] };
    }

    // Real space: check Resta and Imi across all other spaces
    const restaOwners = [0,1].filter(s =>
      G.spaces.some((sp, si) =>
        si !== spaceIdx && sp.slots[s].some(c => c && c.name === 'Resta' && !c.faceDown && !c.effectDisabled)
      )
    );
    const imiSides = [0,1].filter(s =>
      G.spaces.some(sp => sp.slots[s].some(c => c && c.name === 'Imi' && !c.faceDown && !c.effectDisabled))
    );

    // Both have Resta → Imi breaks tie
    if (restaOwners.length === 2) {
      if (imiSides.length === 1) return { p0:0, p1:0, winner: imiSides[0], v0:[0,0] };
      return { p0:0, p1:0, winner:-1, v0:[0,0] };
    }
    // One has Resta, other has Imi → neutralise → tie; then Imi can't break its own tie
    if (restaOwners.length === 1) {
      const restaOwner = restaOwners[0];
      const imiOwner = imiSides.find(s => s !== restaOwner);
      if (imiOwner !== undefined) return { p0:0, p1:0, winner:-1, v0:[0,0] }; // neutralised
      return { p0:0, p1:0, winner: restaOwner, v0:[0,0] }; // only Resta
    }
    // No Resta → Imi breaks tie
    if (imiSides.length === 1) return { p0:0, p1:0, winner: imiSides[0], v0:[0,0] };
    return { p0:0, p1:0, winner:-1, v0:[0,0] };
  }

  // Resta active (not blocked yet) → forced tie, but Imi can still break it
  // Exception: "más cartas con menos valor" space handles Resta in its own logic
  const restaActive = [0,1].some(side =>
    space.slots[side].some(c => c && c.name === 'Resta' && !c.faceDown && !c.effectDisabled)
  );
  const isMenosValorSpace = space.effectRevealed && space.effectText && space.effectText.includes('más cartas con menos valor');
  if (restaActive && !isMenosValorSpace) {
    // Check if "mayor Valor" effect is active — if so, peak score protects each side
    const mayorValorActive = space.effectRevealed && space.effectText && space.effectText.includes('mayor Valor');
    if (mayorValorActive && space._peakScore) {
      // Resta cannot lower a side's score below their historical peak
      const p0 = space._peakScore[0] || 0;
      const p1 = space._peakScore[1] || 0;
      const imiOwner2 = [0,1].map(s =>
        G.spaces.some(sp => sp.slots[s].some(c => c && !c.faceDown && c.name === 'Imi' && !c.effectDisabled))
      );
      let w2 = -1;
      if (p0 > p1) w2 = 0;
      else if (p1 > p0) w2 = 1;
      else {
        if (imiOwner2[0] && !imiOwner2[1]) w2 = 0;
        else if (imiOwner2[1] && !imiOwner2[0]) w2 = 1;
      }
      return { p0, p1, winner: w2, v0:[0,0] };
    }
    // Resta forces a tie — check if Imi breaks it
    const imiOwner = [0,1].map(s =>
      G.spaces.some(sp => sp.slots[s].some(c => c && !c.faceDown && c.name === 'Imi' && !c.effectDisabled))
    );
    if (imiOwner[0] && !imiOwner[1]) return { p0:0, p1:0, winner:0, v0:[0,0] };
    if (imiOwner[1] && !imiOwner[0]) return { p0:0, p1:0, winner:1, v0:[0,0] };
    return { p0:0, p1:0, winner:-1, v0:[0,0] };
  }

  const _valen0 = getActiveEffects(spaceIdx).some(e => e.includes('Las cartas aquí valen 0'));
  const _sumaV0 = !_valen0 && getActiveEffects(spaceIdx).some(e => e.includes('Las cartas de valor 0 tienen +1 valor aquí'));   // [Nuevo] Realidad de Suma
  let scores = [0,0];
  let v0count = [0,0];
  let v1zeroCount = [0,0];
  let reizaCount = [0,0];

  for (let side = 0; side < 2; side++) {
    for (const card of space.slots[side]) {
      if (!card || card.faceDown) continue;
      if (card.name === 'Reiza' || card.name === 'Resta') {
        reizaCount[side]++;
      } else if (card.baseValue === 0) {
        v0count[side]++;
        if (_sumaV0) scores[side] += 1;
      } else {
        const power = _valen0 ? 0 : getCardPower(card);   // [Nuevo] Realidad de Resta: «Las cartas aquí valen 0.»
        scores[side] += power;
        if (power <= 0) v1zeroCount[side]++;
      }
    }
  }

  // Etza: +1 to OTHER spaces — but respects isolation:
  // Etza: +1 to OTHER spaces.
  // If THIS space is isolated, external card effects (like Etza elsewhere) don't enter.
  // But Etza inside an isolated space CAN still affect other spaces (outgoing, not blocked).
  for (let side = 0; side < 2; side++) {
    if (isIsolatedSpace(spaceIdx)) continue; // block incoming: Etza from outside doesn't apply here
    const hasEtzaElsewhere = G.spaces.some((sp, si) =>
      si !== spaceIdx &&
      sp.slots[side].some(c => c && c.name === 'Etza' && !c.faceDown && !c.effectDisabled)
    );
    if (hasEtzaElsewhere) scores[side] += 1;
  }

  // Space effect caps (Chiouri)
  {
    for (let side = 0; side < 2; side++) {
      if (space.slots[side].some(c => c && c.name === 'Chiouri' && !c.effectDisabled)) {
        scores[0] = Math.min(3, scores[0]);
        scores[1] = Math.min(3, scores[1]);
      }
    }
    // V1 gain +1 here (applied to powerBonus at reveal time already, but cap just in case)
    // V1 -1 penalty is applied via existBonus in applyExistEffects so it shows visually
  }

  const activeEffs = getActiveEffects(spaceIdx);
  const eff = space.effectText;
  let winner = -1;

  if (activeEffs.some(e => e.includes("más cartas con menos valor"))) {
    // Resta affects ALL cards in the space (both sides), even face-down
    const restaActiveHere = [0,1].some(s2 =>
      space.slots[s2].some(c => c && c.name === 'Resta' && !c.effectDisabled)
    );
    const calcMenosValor = (s) => {
      let total = 0, count = 0;
      for (const c of space.slots[s]) {
        if (!c) continue;
        count++;
        if (c.name === 'Reki') total += 0;
        else if (c.name === 'Reiza') total += -1; // Reiza always -1
        else if (restaActiveHere) total += -1; // Resta anula a todas menos Reki
        else total += (c.baseValue || 0);
      }
      return { total, count };
    };
    const mv = [calcMenosValor(0), calcMenosValor(1)];
    // Empty side cannot win; if only one side has cards, that side wins
    if (mv[0].count === 0 && mv[1].count === 0) { /* tie */ }
    else if (mv[0].count === 0) winner = 1;
    else if (mv[1].count === 0) winner = 0;
    else if (mv[0].total < mv[1].total) winner = 0;
    else if (mv[1].total < mv[0].total) winner = 1;
    else if (mv[0].count > mv[1].count) winner = 0;
    else if (mv[1].count > mv[0].count) winner = 1;
    else {
      // Imi tiebreak (global effect)
      const imiOwner = [0,1].map(s =>
        G.spaces.some(sp => sp.slots[s].some(c => c && !c.faceDown && c.name === 'Imi' && !c.effectDisabled))
      );
      if (imiOwner[0] && !imiOwner[1]) {
        winner = 0;
        if (G && G.unlockProgress) G.unlockProgress.imiTiebreakCount = (G.unlockProgress.imiTiebreakCount || 0) + 1;
      }
      else if (imiOwner[1] && !imiOwner[0]) {
        winner = 1;
        // Humi hito: player lost via rival Imi tiebreak while player has Humi in this space
        if (G && G.unlockProgress) {
          const playerHasHumi = space.slots[0].some(c => c && c.name === 'Humi' && !c.faceDown);
          if (playerHasHumi) G.unlockProgress.humiLostToImiTiebreak = true;
        }
      }
    }
  } else if (activeEffs.some(e => e.includes("más cartas de valor 0 tenga"))) {
    const c0 = space.slots[0].filter(c => c && !c.faceDown && c.baseValue === 0).length;
    const c1 = space.slots[1].filter(c => c && !c.faceDown && c.baseValue === 0).length;
    if (c0 > c1) winner = 0;
    else if (c1 > c0) winner = 1;
  } else if (activeEffs.some(e => e.includes("más personajes tenga")) && !isGlobalScoring()) {
    const c0 = space.slots[0].filter(Boolean).length;
    const c1 = space.slots[1].filter(Boolean).length;
    if (c0 > c1) winner = 0;
    else if (c1 > c0) winner = 1;
  } else {
    const hasCards0 = space.slots[0].some(c => c && !c.faceDown && c.name !== 'Reiza' && c.name !== 'Resta');
    const hasCards1 = space.slots[1].some(c => c && !c.faceDown && c.name !== 'Reiza' && c.name !== 'Resta');
    if (!hasCards0 && !hasCards1) { /* tie */ }
    else if (!hasCards0 && hasCards1) winner = 1;
    else if (hasCards0 && !hasCards1) winner = 0;
    else if (scores[0] > scores[1]) winner = 0;
    else if (scores[1] > scores[0]) winner = 1;
    else if (v0count[0] > v0count[1]) winner = 0;
    else if (v0count[1] > v0count[0]) winner = 1;
    else if (v1zeroCount[0] > v1zeroCount[1]) winner = 0;
    else if (v1zeroCount[1] > v1zeroCount[0]) winner = 1;
    else {
      if (!restaActive) {
        const imiOwner = [0,1].map(s =>
          G.spaces.some(sp => sp.slots[s].some(c => c && c.name === 'Imi' && !c.effectDisabled))
        );
        if (imiOwner[0] && !imiOwner[1]) {
          winner = 0;
          if (G && G.unlockProgress) G.unlockProgress.imiTiebreakCount = (G.unlockProgress.imiTiebreakCount || 0) + 1;
        }
        else if (imiOwner[1] && !imiOwner[0]) {
          winner = 1;
          // Humi hito: player lost via rival Imi tiebreak while player has Humi in this space
          if (G && G.unlockProgress) {
            const playerHasHumi = space.slots[0].some(c => c && c.name === 'Humi' && !c.faceDown);
            if (playerHasHumi) G.unlockProgress.humiLostToImiTiebreak = true;
          }
        }
      }
    }
  }

  // "Mayor Valor" effect: each side's score is at least their historical peak for this space.
  // The peak only applies if the side currently has face-up V1 cards (i.e. cards that actually
  // contribute to the score). A side with only V0 cards (or no cards) cannot benefit from a
  // stored peak — that would produce phantom points when e.g. only a V0 is present.
  if (space.effectRevealed && space.effectText && space.effectText.includes('mayor Valor')) {
    if (!space._peakScore) space._peakScore = [0, 0];
    for (let side = 0; side < 2; side++) {
      // Only count as "has scoring cards" if there's at least one face-up V1 (non-Reiza/Resta)
      const hasScoringCards = space.slots[side].some(c =>
        c && !c.faceDown && c.baseValue === 1 && c.name !== 'Reiza' && c.name !== 'Resta'
      );
      if (scores[side] > space._peakScore[side]) {
        // Always update the peak when current score beats it
        space._peakScore[side] = scores[side];
      } else if (hasScoringCards) {
        // Apply peak only if the side still has active scoring cards
        scores[side] = Math.max(scores[side], space._peakScore[side]);
      }
      // If no scoring cards, leave scores[side] as-is (current actual score, possibly 0)
    }
    // Recompute winner with peak-adjusted scores, but a side with no cards cannot win
    const hasRealCards0 = space.slots[0].some(c => c && !c.faceDown);
    const hasRealCards1 = space.slots[1].some(c => c && !c.faceDown);
    if (!hasRealCards0 && !hasRealCards1) winner = -1;
    else if (!hasRealCards0) winner = 1;
    else if (!hasRealCards1) winner = 0;
    else if (scores[0] > scores[1]) winner = 0;
    else if (scores[1] > scores[0]) winner = 1;
    else winner = -1;
  }

  return { p0: Math.max(0, scores[0]), p1: Math.max(0, scores[1]), winner, v0: v0count };
}
function getSpacesWon() {
  return [0,1].map(p => [0,1,2].filter(i => computeSpaceScore(i).winner === p).length);
}

// Returns true if the space blocks external effects
function isIsolatedSpace(spIdx) {
  if (!G || !G.spaces) return false;
  const sp = G.spaces[spIdx];
  if (!sp) return false;
  return sp.effectRevealed && sp.effectText.includes("cartas ajenas");
}

// Returns true if Real (or Resta-won-Real) is active in this space
function isRealSpace(spIdx) {
  if (!G || !G.spaces) return false;
  const sp = G.spaces[spIdx];
  return sp && sp.blocked && sp._realActive;
}

// Returns true if the global scoring effect is active (Space 2 center)
function isGlobalScoring() {
  if (!G || !G.spaces) return false;
  const globalSpace = G.spaces.find(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('no va por separado'));
  if (!globalSpace) return false;
  // If Roloc is in the "más personajes" space, global scoring is neutralized
  const rolocSp = rolocSpaceIdx();
  if (rolocSp !== -1) {
    const rolocSpaceEff = G.spaces[rolocSp].effectText || '';
    if (rolocSpaceEff.includes('más personajes')) return false;
  }
  // If "El resto de efectos de espacio están desactivados" is active in ANOTHER space, suppress this too
  const globalSpIdx = G.spaces.indexOf(globalSpace);
  const suppressorSp = G.spaces.findIndex((sp, i) =>
    i !== globalSpIdx && sp.effectRevealed && sp.effectText && sp.effectText.includes('están desactivados')
  );
  if (suppressorSp !== -1) return false;
  return true;
}

// Returns true if "más personajes" effect is active but suppressed by global scoring
function isMasPersonajesSuppressed() {
  if (!G || !G.spaces) return false;
  const hasMasPersonajes = G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('más personajes'));
  if (!hasMasPersonajes) return false;
  // Only suppressed if global scoring is genuinely active (Roloc not in más personajes space)
  return isGlobalScoring();
}

function getTotalPoints() {
  return [0,1].map(p => [0,1,2].reduce((acc,i) => acc + (p===0 ? computeSpaceScore(i).p0 : computeSpaceScore(i).p1), 0));
}

function whoRevealFirst() {
  const sw = getSpacesWon();
  if (sw[0] > sw[1]) return 0;
  if (sw[1] > sw[0]) return 1;
  const tp = getTotalPoints();
  if (tp[0] > tp[1]) return 0;
  if (tp[1] > tp[0]) return 1;
  return G.tieBreaker; // decided randomly at game start
}

// ══════════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════════
function render() {
  renderTopBar();
  renderAIZone();
  renderSpaces();
  renderDeck();
  renderHand();
  renderLog();
  renderBottomBar();
}

function renderTopBar() {
  const ti = document.getElementById('turn-info-text');
  if (ti) ti.innerHTML = `<span style="color:#5599ee;font-size:1.1em;">${G.turn}</span><span style="color:rgba(255,255,255,0.25);margin:0 4px;">|</span><span style="color:rgba(255,255,255,0.35);">${G.maxTurns}</span>`;
  const first = whoRevealFirst();
  const inline = document.getElementById('reveal-order-inline');
  if (inline) {
    const color = first === 0 ? 'var(--blue,#6ab0f5)' : 'var(--red,#e06c6c)';
    const label = first === 0 ? 'Revelas tú primero' : 'Revela la IA primero';
    const tipEl = document.getElementById('reveal-order-tip');
    if (tipEl) tipEl.textContent = label;
    // Transición suave: si el color ha cambiado, actualizar el span interno
    const existingSpan = inline.querySelector('span');
    if (existingSpan) {
      existingSpan.style.color = color;
    } else {
      inline.innerHTML = `<span style="color:${color};font-size:0.85em;transition:color 0.5s ease;">◆</span>`;
    }
  }
  // Also keep legacy reveal-order in sync (now hidden, but used for mobile override)
  const el = document.getElementById('reveal-order');
  if (el) {
    el.innerHTML = `<span style="color:${first === 0 ? 'var(--blue,#6ab0f5)' : 'var(--red,#e06c6c)'};font-size:0.85em;">◆</span>`;
  }
  const tbEl = document.getElementById('reveal-tiebreaker');
  if (tbEl) tbEl.textContent = '';
  // Update Destinada indicator
  const destEl = document.getElementById('destinada-indicator');
  if (destEl && G) {
    const used = G.destinadaUsed && G.destinadaUsed[0];
    const blocked = G.spaces && G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'));
    if (used || blocked) {
      destEl.className = 'used';
      const dtip = document.getElementById('destinada-tip');
      if (dtip) dtip.textContent = blocked ? 'Colocación Destinada bloqueada por un espacio' : 'Colocación Destinada ya usada este turno';
    } else {
      destEl.className = 'available';
      const dtip2 = document.getElementById('destinada-tip');
      if (dtip2) dtip2.textContent = 'Colocación Destinada disponible';
    }
  }
  if (typeof actualizarDestinadaRival === 'function') actualizarDestinadaRival();   // [Nuevo] el erizo del rival
  if (typeof pxActualizarHistorial === 'function') pxActualizarHistorial();
}

function renderAIZone() {
  // Remove old "IA · X cartas" text
  const aiInfo = document.getElementById('ai-info');
  if (aiInfo) aiInfo.textContent = '';

  const hand = document.getElementById('ai-hidden-hand');
  if (hand) {
    hand.innerHTML = '';
    const revealAI = ziruActive(0); // player has Ziru — sees AI hand
    for (let i = 0; i < G.hands[1].length; i++) {
      const card = G.hands[1][i];
      const c = document.createElement('div');
      if (revealAI) {
        c.className = `ai-card-back ziru-revealed ${card.value===0?'val0-card':'val1-card'}`;
        c.style.cursor = 'zoom-in';
        buildCardFace(card, c, { showName: true, showEffect: OPTIONS.showEffect, showType: OPTIONS.showType });
        // Only allow zoom if not in ramia/humi pick mode (no ramia-pick cards present)
        // Disable pointer events on children so click always reaches the wrapper
        c.style.pointerEvents = 'auto';
        c.addEventListener('click', (e) => {
          e.stopPropagation();
          const picking = document.querySelector('.ai-card-back.ramia-pick');
          if (!picking) openCardZoom(card);
        });
      } else {
        c.className = 'ai-card-back';
        const img = document.createElement('img'); img.draggable = false;
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:6px;';
        img.src = './ilustraciones/card-back.jpg';
        img.onerror = function() { this.style.display = 'none'; };
        c.appendChild(img);
      }
      hand.appendChild(c);
    }

  }
}

function renderDeck() {
  const cnt = document.getElementById('deck-count');
  const isDeckMode = !!(G.playerDecks?.[0] || G.playerDecks?.[1]);
  if (cnt) {
    if (isDeckMode) {
      const p0 = G.playerDecks?.[0]?.length ?? 0;
      const p1 = G.playerDecks?.[1]?.length ?? 0;
      cnt.textContent = `${t('modal_score_you')} ${p0} · ${t('modal_score_ai')} ${p1}`;
    } else {
      cnt.textContent = G.deck.length + ' cartas';
    }
  }
  const pile = document.getElementById('deck-pile-vis');
  const deckLen = isDeckMode ? (G.playerDecks?.[0]?.length ?? 0) : G.deck.length;
  if (pile) {
    pile.style.opacity = deckLen === 0 ? '0.3' : '1';
    const deckClickable = soiActive();
    pile.style.cursor = deckClickable ? 'pointer' : 'default';
    pile.onclick = deckClickable ? showDeckSoi : null;
    pile.title = deckClickable ? 'Soi: ojear el mazo' : '';
  }

  // Discard pile
  const dcnt = document.getElementById('discard-count');
  if (dcnt) dcnt.textContent = (G.discard?.length || 0) + ' cartas';
  const dpile = document.getElementById('discard-pile-vis');
  if (dpile) {
    dpile.innerHTML = '';
    const n = G.discard?.length || 0;
    if (n === 0) {
      const empty = document.createElement('div');
      empty.className = 'discard-empty';
      empty.textContent = '◫';
      dpile.appendChild(empty);
    } else {
      const top = G.discard[n - 1];
      const topDiv = document.createElement('div');
      topDiv.className = 'discard-top';
      // Try to show the art of the top card
      if (top.name) {
        const img = document.createElement('img'); img.draggable = false;
        img.src = `./ilustraciones/${top.name}.jpg`;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = () => { img.style.display='none'; topDiv.style.background='linear-gradient(135deg,#1a1a2e,#16213e)'; };
        topDiv.appendChild(img);
      } else {
        topDiv.style.background = 'linear-gradient(135deg,#1a1a2e,#16213e)';
      }
      dpile.appendChild(topDiv);
    }
  }
  // Extinct pile
  const ecnt = document.getElementById('extinct-count');
  if (ecnt) ecnt.textContent = (G.extinct?.length || 0) + ' cartas';
  const epile = document.getElementById('extinct-pile-vis');
  if (epile) {
    epile.innerHTML = '';
    const ne = G.extinct?.length || 0;
    if (ne === 0) {
      const empty = document.createElement('div');
      empty.className = 'discard-empty';
      empty.style.color = 'rgba(204,68,119,0.25)';
      empty.textContent = '✕';
      epile.appendChild(empty);
    } else {
      const top = G.extinct[ne - 1];
      const topDiv = document.createElement('div');
      topDiv.className = 'extinct-top';
      if (top.name) {
        const img = document.createElement('img'); img.draggable = false;
        img.src = `./ilustraciones/${top.name}.jpg`;
        img.onerror = () => { img.style.display='none'; };
        topDiv.appendChild(img);
      }
      epile.appendChild(topDiv);
    }
  }
}

function renderSpaces() {
  const area = document.getElementById('spaces-area');
  area.innerHTML = '';
  for (let i = 0; i < 3; i++) area.appendChild(buildSpaceEl(i));
  // Re-inject static Real veil for already-active dead spaces (no animation replay)
  const spaceEls = area.querySelectorAll('.space');
  G.spaces.forEach((sp, i) => {
    if (sp._realActive && spaceEls[i] && !spaceEls[i].querySelector('.real-veil')) {
      const veil = document.createElement('div');
      veil.className = 'real-veil visible';
      spaceEls[i].appendChild(veil);
    }
  });
}

function buildSpaceEl(idx) {
  const space = G.spaces[idx];
  const sc = computeSpaceScore(idx);
  const el = document.createElement('div');
  const isReal = isRealSpace(idx);
  el.className = 'space' +
    (space.blocked ? ' blocked' : '') +
    (!isReal ? ' effect-active' : '') +
    (isReal ? ' dead-space' : '');

  // ── AI slots (top) — always above fog
  el.appendChild(buildSlotsRow(idx, 1));

  // ── CENTER: Score + Effect text
  const loc = document.createElement('div');
  loc.className = 'space-location' +
    (sc.winner === 0 ? ' winning-p1' : sc.winner === 1 ? ' winning-p2' : '');

  // Space pick mode: highlight valid target spaces
  if (spacePickState && spacePickState.filterFn(idx)) {
    loc.classList.add('space-pick-target');
    loc.onclick = (e) => {
      e.stopPropagation();
      const r = spacePickState.resolve;
      spacePickState = null;
      render();
      r(idx);
    };
  }

  // Score row
  const sr = document.createElement('div');
  sr.className = 'space-score';
  sr.style.position = 'relative';
  sr.style.zIndex = '4';

  const globalScoringSpIdx = isGlobalScoring()
    ? G.spaces.findIndex(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('no va por separado'))
    : -1;

  if (isGlobalScoring() && idx !== globalScoringSpIdx) {
    // Other spaces: hide individual score
    sr.style.opacity = '0.25';
    sr.style.fontSize = '0.65rem';
    const hide = document.createElement('span');
    hide.style.color = 'var(--text-dim)';
    hide.textContent = '— —';
    sr.appendChild(hide);
  } else if (isGlobalScoring() && idx === globalScoringSpIdx) {
    // The space with the effect: show global total across ALL spaces
    const totals = [0,1].map(p => [0,1,2].reduce((a,i) => a + (p===0?computeSpaceScore(i).p0:computeSpaceScore(i).p1), 0));
    const gWinner = totals[0]>totals[1]?0:totals[1]>totals[0]?1:-1;
    const s0g = document.createElement('span');
    s0g.className = 'score-p1' + (gWinner===0?' score-winner':'');
    s0g.textContent = totals[0];
    const midg = document.createElement('span');
    midg.className = 'score-mid';
    midg.style.color = gWinner===0?'var(--blue)':gWinner===1?'var(--red)':'var(--silver)';
    midg.textContent = gWinner===0?'◆ Tú':gWinner===1?'◆ IA':'—';
    const s1g = document.createElement('span');
    s1g.className = 'score-p2' + (gWinner===1?' score-winner':'');
    s1g.textContent = totals[1];
    sr.appendChild(s0g); sr.appendChild(midg); sr.appendChild(s1g);
  } else {
    const s0 = document.createElement('span');
    s0.className = 'score-p1' + (sc.winner===0?' score-winner':'');
    s0.textContent = `${sc.p0}`;
    const mid = document.createElement('span');
    mid.className = 'score-mid';
    mid.style.color = sc.winner===0?'var(--blue)':sc.winner===1?'var(--red)':'var(--silver)';
    mid.textContent = sc.winner===0?'◆ Tú':sc.winner===1?'◆ IA':'—';
    const s1 = document.createElement('span');
    s1.className = 'score-p2' + (sc.winner===1?' score-winner':'');
    s1.textContent = `${sc.p1}`;
    sr.appendChild(s0); sr.appendChild(mid); sr.appendChild(s1);
  }
  loc.appendChild(sr);
  if (typeof puntuacionPixel === 'function') puntuacionPixel(sr);   // [Nuevo] cifras en pixel art

  // ── [Cambio] indicador de quién gana y por qué (antes: barra de tensión) — ver espacios.js ──
  if (typeof indicadorGanador === 'function') {
    if (isGlobalScoring() && idx === globalScoringSpIdx) {
      const tot = [0,1].map(p => [0,1,2].reduce((a,i) => a + (p===0?computeSpaceScore(i).p0:computeSpaceScore(i).p1), 0));
      indicadorGanador(loc, idx, { p0: tot[0], p1: tot[1], winner: tot[0]>tot[1]?0:tot[1]>tot[0]?1:-1 }, true);
    } else if (!isGlobalScoring()) {
      indicadorGanador(loc, idx, sc, false);
    }
  }

  // Effect text
  const effEl = document.createElement('div');
  effEl.className = 'space-effect-text revealed';
  effEl.style.zIndex = '4';
  // Dim effect text if Roloc is active in another space (this space's effect is overridden)
  const rolocSp = rolocSpaceIdx();
  if (rolocSp !== -1 && rolocSp !== idx && space.effectRevealed) {
    effEl.classList.add('roloc-overridden');
  }
  // Dim if "El resto de efectos de espacio están desactivados" is active in another space
  const suppressorSp = G.spaces.findIndex((sp, i) =>
    i !== idx && sp.effectRevealed && sp.effectText && sp.effectText.includes('están desactivados')
  );
  if (suppressorSp !== -1 && space.effectRevealed) {
    effEl.classList.add('roloc-overridden');
  }
  // Dim "más personajes" if global scoring suppresses it
  if (space.effectRevealed && space.effectText && space.effectText.includes('más personajes') && isMasPersonajesSuppressed()) {
    effEl.classList.add('roloc-overridden');
  }
  // Dim global scoring if Roloc is in the "más personajes" space (neutralized)
  if (space.effectRevealed && space.effectText && space.effectText.includes('no va por separado')) {
    const rSp = rolocSpaceIdx();
    if (rSp !== -1 && G.spaces[rSp].effectText && G.spaces[rSp].effectText.includes('más personajes')) {
      effEl.classList.add('roloc-overridden');
    }
  }
  if (space.blocked && !space.effectText) {
    effEl.textContent = '⚔ BLOQUEADO';
  } else if (space.effectRevealed) {
    effEl.textContent = getSpaceEffectText(space.effectText);
  } else {
    effEl.textContent = '???';
  }
  loc.appendChild(effEl);



  el.appendChild(loc);

  // Decorative corner ornaments
  ['tl','tr','bl','br'].forEach(pos => {
    const corner = document.createElement('span');
    corner.className = 'space-corner ' + pos;
    loc.appendChild(corner);
  });

  // ── PLAYER slots (bottom) — always above fog
  el.appendChild(buildSlotsRow(idx, 0));

  return el;
}

function buildSlotsRow(spaceIdx, side) {
  const space = G.spaces[spaceIdx];
  const row = document.createElement('div');
  row.className = 'slots-row';
  for (let s = 0; s < 3; s++) {
    const card = space.slots[side][s];
    const _selCard2 = (side === 0 && selectedCard !== null) ? G.hands[0][selectedCard] : null;
    const rekiSelected = _selCard2 && _selCard2.name === 'Reki';
    const isBlocked = (space.blocked && !(rekiSelected && isRealSpace(spaceIdx))) || (s >= space.slotCount[side] && !rekiSelected);
    const slotEl = document.createElement('div');

    if (card) {
      slotEl.className = 'slot occupied';
      const cardEl = buildCardInSlot(card);
      slotEl.appendChild(cardEl);
      // Board pick mode: highlight valid targets
      if (boardPickState && boardPickState.filterFn(card, spaceIdx, side, s)) {
        slotEl.classList.add('board-pick-target');
        const handler = (e) => {
          e.stopPropagation();
          const r = boardPickState.resolve;
          boardPickState = null;
          render();
          r(card);
        };
        slotEl.onclick = handler;
        cardEl.onclick = handler;
      }
      // Ekuro displacement: show occupied allied slots as valid targets
      // Only Ekuro itself (played from hand) can directly displace an ally.
      // The Exist effect (Ekuro face-up) only offers an optional sacrifice AFTER placing on an empty slot.
      if (side === 0 && G.phase === 'player_place' && selectedCard !== null) {
        const cardInHand = G.hands[0][selectedCard];
        if (canEkuroDisplace(cardInHand, 0) && card.baseValue !== 0 && card.name !== 'Ekuro') {
          slotEl.classList.add('ekuro-target');
          slotEl.dataset.space = spaceIdx;
          slotEl.dataset.slot = s;
          slotEl.dataset.side = '0';
          const ekuroHandler = (e) => { e.stopPropagation(); selectSlot(spaceIdx, s); };
          slotEl.onclick = ekuroHandler;
          cardEl.onclick = ekuroHandler; // override zoom on the card itself
        }
      }
    } else if (isBlocked) {
      slotEl.className = 'slot blocked-slot';
    } else {
      slotEl.className = 'slot';
      slotEl.textContent = '+';
      slotEl.dataset.space = spaceIdx;
      slotEl.dataset.slot = s;
      slotEl.dataset.side = side;
      if (side === 0 && G.phase === 'player_place') {
        const nasuEntry = G.pending_nasu?.find(n => n.target === 0 && n.turn === G.turn);
        const nasuSpaceFull = nasuEntry && G.spaces[nasuEntry.spIdx].slots[0].slice(0, G.spaces[nasuEntry.spIdx].slotCount[0]).every(c => c);
        const nasuBlocked = nasuEntry && !nasuSpaceFull && spaceIdx !== nasuEntry.spIdx;
        // Destinada phase 2: if _nasuDestinada2SpIdx forces a space, block highlights in other spaces
        const _nd2forced = destinadaPhase === 1 ? (destinadaCard1Info?._nasuDestinada2SpIdx ?? -1) : -1;
        const nd2sp = _nd2forced !== -1 ? G.spaces[_nd2forced] : null;
        const nasuBlockedD2 = _nd2forced !== -1 && nd2sp && !nd2sp.slots[0].slice(0, nd2sp.slotCount[0]).every(c => c) && spaceIdx !== _nd2forced;
        // Unique-value effect: don't highlight if card's baseValue is already present
        const activeSelCard = destinadaPhase === 1 ? (selectedCard2 !== null ? G.hands[0][selectedCard2] : null) : (selectedCard !== null ? G.hands[0][selectedCard] : null);
        const cardInHand = activeSelCard;
        const effsSlot = getActiveEffects(spaceIdx);
        const uniqueBlocked = cardInHand && cardInHand.name !== 'Reki' && effsSlot.some(e => e.includes('Solo puede haber una carta')) &&
          G.spaces[spaceIdx].slots[0].some(c => c && c.baseValue === cardInHand.baseValue);
        const hasActiveCard = destinadaPhase === 1 ? selectedCard2 !== null : selectedCard !== null;
        if (hasActiveCard && !nasuBlocked && !nasuBlockedD2 && !uniqueBlocked) {
          if (destinadaPhase === 1) {
            slotEl.classList.add('highlight-destinada');
          } else {
            slotEl.classList.add('highlight');
          }
        }
        slotEl.onclick = () => selectSlot(spaceIdx, s);
      }
      // slotPickState: Rasu destination slot picking
      if (slotPickState && slotPickState.filterFn(spaceIdx, side, s)) {
        slotEl.classList.add('highlight');
        slotEl.style.borderColor = 'var(--gold)';
        slotEl.style.cursor = 'pointer';
        slotEl.onclick = (e) => {
          e.stopPropagation();
          const r = slotPickState.resolve;
          slotPickState = null;
          render();
          r({ spaceIdx, side, slotIdx: s });
        };
      }
    }
    row.appendChild(slotEl);
  }
  return row;
}

// ══════════════════════════════════════════════════════════
//  UNIFIED CARD FACE BUILDER
//  Applies the shared layout to any card container element.
//  opts: { showName, showEffect, showValue, isZoom }
// ══════════════════════════════════════════════════════════
function typeLabel(type, withText) {
  // [Nuevo] iconos de tipo en pixel art (ver pixelart.js); si no están, los símbolos de antes
  if (typeof PX_TIPO_URL !== 'undefined' && PX_TIPO_URL[type]){
    const img = `<img class="tipo-px tipo-px-${type}" src="${PX_TIPO_URL[type]}" alt="">`;
    const txt = type==='reveal' ? 'Revelar' : type==='exist' ? 'Existir' : type==='realidad' ? 'Realidad' : 'Especial';
    return withText ? img + ' ' + txt : img;
  }
  const existIcon = '<span style="font-size:1.35em;line-height:1;vertical-align:-0.1em;">♾</span>';
  if (withText) return type==='reveal' ? '✴ Revelar' : type==='exist' ? existIcon + ' Existir' : '◇ Especial';
  return type==='reveal' ? '✴' : type==='exist' ? existIcon : '◇';
}

function buildCardFace(card, el, opts = {}) {
  const showName   = opts.showName   !== false;
  const showEffect = opts.showEffect !== false;
  const showValue  = opts.showValue  !== false;
  const showType     = opts.showType     !== false;
  const showTypeText = opts.showTypeText !== false && OPTIONS.showTypeText !== false;

  // Art image
  const img = document.createElement('img'); img.draggable = false;
  img.className = 'card-art';
  img.src = `./ilustraciones/${card.name}.jpg`;
  img.onerror = function() { this.style.display = 'none'; };
  el.appendChild(img);

  // Name — top center
  if (showName) {
    const nm = document.createElement('div');
    nm.className = 'cf-name';
    const disp = getCardDisplay(card.name);
    nm.textContent = disp.displayName || card.displayName || card.name;
    el.appendChild(nm);
  }

  // Bottom overlay (gradient + meta row + effect)
  const bot = document.createElement('div');
  bot.className = 'cf-bottom';

  const meta = document.createElement('div');
  meta.className = 'cf-meta-row';

  if (showValue && (!card.restaLocked || card.name === 'Reki') && card.name !== 'Reiza' && card.name !== 'Resta') {
    const valEl = document.createElement('div');
    const bv = card.baseValue ?? card.value;
    const totalBonus = (card.powerBonus||0) + (card.existBonus||0);
    const total = card._teiForced0 ? 0 : bv + totalBonus;
    valEl.className = 'cf-value ' + (bv === 0 ? 'cv0' : 'cv1');
    valEl.textContent = total >= 0 ? String(total) : '';
    if (!card._teiForced0 && bv !== 0 && totalBonus > 0) {
      valEl.style.color = 'var(--blue, #4477cc)';
    } else if (!card._teiForced0 && bv !== 0 && totalBonus < 0) {
      valEl.style.color = 'var(--red, #cc4444)';
    }
    meta.appendChild(valEl);
  }

  if (showType) {
    const tp = document.createElement('div');
    tp.className = 'cf-type';
    tp.innerHTML = typeLabel(card.type, showTypeText);
    meta.appendChild(tp);
  }

  if (meta.children.length) {
    if (meta.children.length === 1 && meta.querySelector('.cf-type')) {
      meta.style.justifyContent = 'flex-end';
    }
    bot.appendChild(meta);
  }

  // Effect text
  if (showEffect && card.effect && !card._effectHidden) {
    const ef = document.createElement('div');
    ef.className = 'cf-effect';
    const disp = getCardDisplay(card.name);
    ef.textContent = disp.effect || card.effect;
    bot.appendChild(ef);
  }

  el.appendChild(bot);
}

function buildCardInSlot(card, spaceIdx) {
  const el = document.createElement('div');
  if (card.faceDown) {
    el.className = 'card-in-slot face-down';
    const backImg = document.createElement('img'); backImg.draggable = false;
    backImg.className = 'card-art';
    backImg.src = './ilustraciones/card-back.jpg';
    backImg.onerror = function() { this.style.display = 'none'; };
    el.appendChild(backImg);
    const dot = document.createElement('div');
    dot.className = 'card-owner-dot ' + (card.owner===0?'dot-p1':'dot-p2');
    el.appendChild(dot);

    // Player's own hidden card — allow peeking via zoom
    if (card.owner === 0) {
      el.classList.add('peek-own');
      el.onclick = () => openCardZoom(card);
      el.title = 'Haz click para ver tu carta';
    }
    return el;
  }

  const cls = card.baseValue===0 ? 'val0' : 'val1';
  el.className = `card-in-slot ${cls}`;

  if (card.owner >= 0) {
    const dot = document.createElement('div');
    dot.className = 'card-owner-dot ' + (card.owner===0?'dot-p1':'dot-p2');
    el.appendChild(dot);
  }

  buildCardFace(card, el, { showName: OPTIONS.showName, showEffect: OPTIONS.showEffect, showType: OPTIONS.showType });
  if (card.owner === 0) applyShinyIfUnlocked(el, card.name);

  // Cartas Existir en tablero: texto del tipo en púrpura parpadeante, o gris si desactivada
  const cardDef = CARD_DB[card.name];
  if (!card.faceDown && cardDef && cardDef.type === 'exist') {
    const typeEl = el.querySelector('.cf-type');
    if (typeEl) {
      typeEl.classList.add(card.effectDisabled ? 'cf-type-exist-off' : 'cf-type-exist-on');
    }
  }

  el.style.cursor = 'zoom-in';
  el.onclick = () => openCardZoom(card);
  return el;
}

function renderHand() {
  const cont = document.getElementById('hand-cards');
  cont.innerHTML = '';
  document.getElementById('hand-count').textContent = G.hands[0].length;
  // When 2 cards selected (Destinada), lower the non-selected ones slightly
  const twoSelected = selectedCard !== null && selectedCard2 !== null;
  if (twoSelected) cont.classList.add('has-selection');
  else cont.classList.remove('has-selection');
  // During Destinada phase 1 (second card placement), keep remaining cards lowered
  if (destinadaPhase === 1 && !OPTIONS.handAlwaysRaised) {
    cont.classList.add('hand-destinada-wait');
  } else {
    cont.classList.remove('hand-destinada-wait');
  }
  G.hands[0].forEach((card, idx) => {
    const el = document.createElement('div');
    const isSelected1 = selectedCard === idx;
    const isSelected2 = selectedCard2 === idx;

    // Calcular si esta carta es un par válido de Destinada con la seleccionada
    const destinadaSpaceBlocked = G.spaces && G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'));
    const destinadaAvailable = !G.destinadaUsed[0] && !destinadaSpaceBlocked;
    const isPairHint = destinadaAvailable
      && selectedCard !== null && selectedCard2 === null
      && !isSelected1 && !isSelected2
      && G.hands[0][selectedCard]
      && G.hands[0][selectedCard].baseValue !== card.baseValue;

    el.className = `hand-card ${card.value===0?'val0-card':'val1-card'}${isSelected1?' selected':isSelected2?' selected-destinada':''}${isPairHint?' destinada-pair-hint':''}`;
    el.onclick = () => selectHandCard(idx);

    buildCardFace(card, el, { showName: OPTIONS.showName, showEffect: OPTIONS.showEffect, showType: OPTIONS.showType });
    applyShinyIfUnlocked(el, card.name);

    el.addEventListener('contextmenu', e => { e.preventDefault(); openCardZoom(card, G.hands[0], idx); });
    cont.appendChild(el);
  });
}

function renderLog() {
  // Log is now in the floating modal — nothing to render inline
}

function renderBottomBar() {
  // Bottom bar removed — turn confirmation is now automatic
}

// ══════════════════════════════════════════════════════════
//  INTERACTION
// ══════════════════════════════════════════════════════════
function selectHandCard(idx) {
  if (G.phase !== 'player_place') return;
  if (destinadaPhase === 1) return; // mano bloqueada — debes colocar la segunda carta
  if (_mobileHandJustRevealed) return; // móvil: primer toque sólo revela, no selecciona

  const card = G.hands[0][idx];
  if (!card) return;

  // Deselect if clicking already-selected card
  if (selectedCard === idx) {
    selectedCard = null;
    selectedCard2 = null;
    pendingPlacement = null;
    render();
    return;
  }
  if (selectedCard2 === idx) {
    selectedCard2 = null;
    render();
    return;
  }

  // If no first card yet → select as first (yellow)
  if (selectedCard === null) {
    playSound('pick');
    selectedCard = idx;
    render();
    return;
  }

  // First card already selected — try to pick second for Destinada
  const destinadaSpaceBlocked = G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'));
  if (!G.destinadaUsed[0] && !destinadaSpaceBlocked) {
    const card1 = G.hands[0][selectedCard];
    if (card1 && card1.baseValue !== card.baseValue) {
      // Different values → valid Destinada pair
      playSound('pick');
      playSound('colocDestinada');
      selectedCard2 = idx;
      render();
      if (typeof destinadaActivada === 'function') destinadaActivada();   // [Nuevo] el momento, bien visible
      return;
    }
  }

  // Same value or Destinada already used → replace first selection
  playSound('pick');
  selectedCard = idx;
  selectedCard2 = null;
  pendingPlacement = null;
  render();
}

function selectSlot(spaceIdx, slotIdx) {
  if (G.phase !== 'player_place') return;

  // ── Destinada phase 1: place second card (red) ──
  if (destinadaPhase === 1) {
    if (selectedCard2 === null) return;
    const space2 = G.spaces[spaceIdx];
    const card2 = G.hands[0][selectedCard2];
    if (!card2) return;
    const isRekiCard2 = card2.name === 'Reki';
    if ((space2.blocked && !(isRekiCard2 && isRealSpace(spaceIdx))) || (slotIdx >= space2.slotCount[0] && !isRekiCard2)) return;
    if (space2.slots[0][slotIdx]) return;
    // Nasu enforcement for second Destinada card (if Nasu wasn't satisfied by the first card)
    const nasuEntryD2 = G.pending_nasu.find(n => n.target === 0 && n.turn === G.turn);
    const nasuSpaceFullD2 = nasuEntryD2 && G.spaces[nasuEntryD2.spIdx].slots[0].slice(0, G.spaces[nasuEntryD2.spIdx].slotCount[0]).every(c => c);
    if (nasuEntryD2 && !nasuSpaceFullD2 && spaceIdx !== nasuEntryD2.spIdx) {
      addLog(`Nasu: debes jugar la segunda carta en E${[1,2,3][nasuEntryD2.spIdx]} este turno.`, 'effect');
      return;
    }
    // Nasu: if the first Destinada card already satisfied Nasu but the space still has free slots,
    // force the second Destinada card to also go to that same space
    const _nd2forced = destinadaCard1Info?._nasuDestinada2SpIdx;
    if (_nd2forced !== undefined && _nd2forced !== -1) {
      const nd2sp = G.spaces[_nd2forced];
      const nd2full = nd2sp.slots[0].slice(0, nd2sp.slotCount[0]).every(c => c);
      if (!nd2full && spaceIdx !== _nd2forced) {
        addLog(`Nasu: debes jugar la segunda carta en E${[1,2,3][_nd2forced]} este turno.`, 'effect');
        return;
      }
    }
    playSound('place');
    confirmDestinada2(spaceIdx, slotIdx);
    return;
  }

  if (selectedCard === null) return;
  const space = G.spaces[spaceIdx];
  const _selCard = G.hands[0][selectedCard];
  if (!_selCard) return;
  const isRekiCard = _selCard.name === 'Reki';
  if ((space.blocked && !(isRekiCard && isRealSpace(spaceIdx))) || (slotIdx >= space.slotCount[0] && !isRekiCard)) return;

  // Nasu enforcement
  const nasuEntry = G.pending_nasu.find(n => n.target === 0 && n.turn === G.turn);
  const nasuSpaceFull = nasuEntry && G.spaces[nasuEntry.spIdx].slots[0].slice(0, G.spaces[nasuEntry.spIdx].slotCount[0]).every(c => c);
  if (nasuEntry && !nasuSpaceFull && spaceIdx !== nasuEntry.spIdx) {
    addLog(`Nasu: debes jugar en E${[1,2,3][nasuEntry.spIdx]} este turno.`, 'effect');
    return;
  }

  // Unique-value space effect
  const effs = getActiveEffects(spaceIdx);
  if (_selCard.name !== 'Reki' && effs.some(e => e.includes('Solo puede haber una carta'))) {
    const alreadyHasSameValue = space.slots[0].some(c => c && c.baseValue === _selCard.baseValue);
    if (alreadyHasSameValue) {
      addLog(`Efecto de espacio: ya hay un personaje de Valor ${_selCard.baseValue} aquí.`, 'effect');
      return;
    }
  }

  const occupant = space.slots[0][slotIdx];
  if (occupant) {
    if (!canEkuroDisplace(_selCard, 0)) return;
    if (occupant.baseValue === 0) return;
    if (occupant.name === 'Ekuro') return;
  }

  playSound('place');
  pendingPlacement = { spaceIdx, slotIdx };

  // If two cards selected (Destinada), place first then wait for second
  if (!G.destinadaUsed[0] && selectedCard2 !== null) {
    confirmDestinada1(spaceIdx, slotIdx);
  } else {
    confirmTurn();
  }
}

// Places first Destinada card, then waits for player to place the second
async function confirmDestinada1(spaceIdx, slotIdx) {
  const card = G.hands[0].splice(selectedCard, 1)[0];
  // Adjust selectedCard2 index after splice
  if (selectedCard2 > selectedCard) selectedCard2--;
  selectedCard = null;
  pendingPlacement = null;

  placeCard(card, 0, spaceIdx, slotIdx, true);
  if (G._currentTurnLog) G._currentTurnLog.playerCard = (card.displayName || card.name), G._currentTurnLog.playerSpace = spaceIdx;
  // Track player space preference for AI pattern recognition
  if (G.aiPlayerSpaceHistory) G.aiPlayerSpaceHistory[spaceIdx] = (G.aiPlayerSpaceHistory[spaceIdx] || 0) + 1;
  // Track Suma unlock: did player place a V0 card via Destinada?
  if (G.unlockProgress && card.baseValue === 0) G.unlockProgress._sumaUsedV0 = true;
  // Clear Nasu only if the first Destinada card satisfied it (placed in the forced space)
  const nasuEntryD1 = G.pending_nasu.find(n => n.target === 0 && n.turn === G.turn);
  let _nasuDestinada2SpIdx = -1; // forced space for second Destinada card due to Nasu
  if (!nasuEntryD1 || spaceIdx === nasuEntryD1.spIdx) {
    // If Nasu was satisfied by the first card, check if the space still has a free slot
    // for the second Destinada card — if so, force the second card there too
    if (nasuEntryD1 && spaceIdx === nasuEntryD1.spIdx) {
      const nasuSp = G.spaces[nasuEntryD1.spIdx];
      const hasMoreFreeSlots = nasuSp.slots[0].some((c, i) => !c && i < nasuSp.slotCount[0]);
      if (hasMoreFreeSlots) _nasuDestinada2SpIdx = nasuEntryD1.spIdx;
    }
    G.pending_nasu = G.pending_nasu.filter(n => !(n.target === 0 && n.turn === G.turn));
  }
  // (If Nasu wasn't satisfied by this card, it remains active for the second Destinada card)
  // Save info for ESC undo
  destinadaCard1Info = { card, spaceIdx, slotIdx, _nasuDestinada2SpIdx };
  card._destinadaOrder = 1; // revealed first during resolve
  addLog(`Colocación Destinada: ${card.displayName || card.name} en E${[1,2,3][spaceIdx]}. Ahora coloca la segunda carta (♦) — o pulsa ESC para deshacer.`, 'important');
  destinadaPhase = 1;
  render();
}

async function confirmDestinada2(spaceIdx, slotIdx) {
  const card2 = G.hands[0].splice(selectedCard2, 1)[0];
  selectedCard2 = null;
  destinadaPhase = 0;
  destinadaCard1Info = null;
  G.destinadaUsed[0] = true;
  // Track Suma unlock: player completed Destinada
  if (G.unlockProgress) G.unlockProgress._sumaCompletedDestinada = true;
  // Neutra hito: track if player used Destinada with Nugu + Neutra
  if (G.unlockProgress) {
    const _d1card = destinadaCard1Info?.card;
    const _d2card = card2;
    const _dNames = new Set([_d1card?.name, _d2card?.name]);
    if (_dNames.has('Nugu') && _dNames.has('Neutra')) {
      G.unlockProgress._neutraDestinadaUsedNuguNeutra = true;
    }
  }
  // Track Colocación Destinada usage for Nofi unlock (persistent across games)
  if (G.unlockProgress) {
    G.unlockProgress._destinadaCount++;
    const DESTINADA_KEY = 'juego_cartas_destinada_count';
    try {
      const prev = parseInt(localStorage.getItem(DESTINADA_KEY) || '0');
      const newTotal = prev + 1;
      localStorage.setItem(DESTINADA_KEY, String(newTotal));
      if (newTotal >= 3) G.unlockProgress.nofiDestinada3 = true;
    } catch {}
  }

  placeCard(card2, 0, spaceIdx, slotIdx, true);
  card2._destinadaOrder = 2; // revealed second during resolve
  addLog(`Colocación Destinada: ${card2.displayName || card2.name} en E${[1,2,3][spaceIdx]}.`, 'important');
  render();

  // Now proceed to AI
  if (G.tiraPendingAISpace !== undefined && G.tiraPendingAISpace !== null) {
    G.tiraPendingAISpace = null;
    G.tiraPendingAISlot  = null;
    G.phase = 'resolve';
    await resolvePhase();
    return;
  }
  G.phase = 'ai_place';
  const aiHasTira  = hasTiraActive(1);
  const plrHasTira = hasTiraActive(0);
  const tiraActive = aiHasTira !== plrHasTira;
  await aiTurn(aiHasTira && tiraActive ? spaceIdx : null, aiHasTira && tiraActive ? slotIdx : null);
}

async function confirmTurn() {
  if (!pendingPlacement || selectedCard === null) return;

  const card = G.hands[0].splice(selectedCard, 1)[0];
  selectedCard = null;
  selectedCard2 = null;
  destinadaPhase = 0;
  const { spaceIdx, slotIdx } = pendingPlacement;
  pendingPlacement = null;

  // Ekuro displacement: if slot is occupied by an ally, displace it
  const occupant = G.spaces[spaceIdx].slots[0][slotIdx];
  if (occupant) {
    // Capture occupant slot position BEFORE render overwrites it
    const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
    const rowEl = spaceEls?.[spaceIdx]?.querySelectorAll('.slots-row')?.[1]; // side 0 = bottom row
    const fromRect = rowEl?.querySelectorAll('.slot')?.[slotIdx]?.getBoundingClientRect()
      ?? { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 52, height: 74 };

    // Place new card immediately face-down (overwrites occupant in state)
    placeCard(card, 0, spaceIdx, slotIdx, true);
    G.pending_nasu = G.pending_nasu.filter(n => !(n.target === 0 && n.turn === G.turn));
    removeToDiscard(occupant);
    addLog(`${occupant.name} es descartada por ${card.name}.`, 'effect');
    render();

    // Now animate occupant flying from its old position to discard pile
    const discardEl = document.getElementById('discard-pile-vis');
    const toRect = discardEl ? discardEl.getBoundingClientRect()
      : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
    animateFlyCard(fromRect, toRect, Math.round(360 * OPTIONS.speedFactor));

    if (card.name === 'Ekuro') {
      rdConFuente(card, () => { card.powerBonus = (card.powerBonus || 0) + 1; });
      addLog(`Ekuro entra con +1 Valor.`, 'effect');
      playSound('valorUp');
      if (G.unlockProgress) {
        G.unlockProgress._ekuroSelfDisplaced = true;
        if (G.unlockProgress._ekuroExistDisplaced) G.unlockProgress.ekuroDoubleDisplace = true;
        G.unlockProgress.ekuroSacrificeUsed = true; // confirmTurn is always player 0
      }
    } else {
      // Ekuro Exist: card placed over an ally gains +1 directly, no further choice needed
      card.powerBonus = (card.powerBonus || 0) + 1;
      addLog(`Ekuro (Existir): ${card.name} entra con +1 Valor.`, 'effect');
      playSound('valorUp');
      if (G.unlockProgress) {
        G.unlockProgress._ekuroExistDisplaced = true;
        if (G.unlockProgress._ekuroSelfDisplaced) G.unlockProgress.ekuroDoubleDisplace = true;
        G.unlockProgress.ekuroSacrificeUsed = true; // confirmTurn is always player 0
      }
    }

    if (G.tiraPendingAISpace !== undefined && G.tiraPendingAISpace !== null) {
      G.tiraPendingAISpace = null;
      G.tiraPendingAISlot  = null;
      addLog(`Ambos colocan una carta.`, '');
      G.phase = 'resolve';
      await resolvePhase();
      return;
    }
    render();
    G.phase = 'ai_place';
    const aiHasTira2  = hasTiraActive(1);
    const plrHasTira2 = hasTiraActive(0);
    const tiraActive2 = aiHasTira2 !== plrHasTira2;
    await aiTurn(aiHasTira2 && tiraActive2 ? spaceIdx : null, aiHasTira2 && tiraActive2 ? slotIdx : null);
    return;
  }

  placeCard(card, 0, spaceIdx, slotIdx, true);
  if (G._currentTurnLog) G._currentTurnLog.playerCard = card.displayName || card.name, G._currentTurnLog.playerSpace = spaceIdx;
  // Track player space preference for AI pattern recognition
  if (G.aiPlayerSpaceHistory) G.aiPlayerSpaceHistory[spaceIdx] = (G.aiPlayerSpaceHistory[spaceIdx] || 0) + 1;
  // Clear any Nasu targeting the player for this turn
  G.pending_nasu = G.pending_nasu.filter(n => !(n.target === 0 && n.turn === G.turn));
  // Track Suma unlock: did player place a V0 card?
  if (G.unlockProgress && card.baseValue === 0) G.unlockProgress._sumaUsedV0 = true;

  render();

  // If AI already placed this turn (Tira active), skip aiTurn and go straight to resolve
  if (G.tiraPendingAISpace !== undefined && G.tiraPendingAISpace !== null) {
    G.tiraPendingAISpace = null;
    G.tiraPendingAISlot  = null;
    addLog(`Ambos colocan una carta.`, '');
    G.phase = 'resolve';
    await resolvePhase();
    return;
  }

  // Normal flow: AI places now
  const aiHasTira  = hasTiraActive(1);
  const plrHasTira = hasTiraActive(0);
  const tiraActive = aiHasTira !== plrHasTira;
  G.phase = 'ai_place';
  await aiTurn(aiHasTira && tiraActive ? spaceIdx : null, aiHasTira && tiraActive ? slotIdx : null);
}

// ══════════════════════════════════════════════════════════
//  PLACE CARD (core function)
// ══════════════════════════════════════════════════════════
function resetCardBonus(card) {
  if (!card) return;
  card.powerBonus = 0;
  card.existBonus = 0;
  // Clear space-specific bonus flags so they can be re-applied if card re-enters
  for (const key of Object.keys(card)) {
    if (key.startsWith('_enSlau_') || key.startsWith('_enSpace_') || key.startsWith('_v1plus_')) delete card[key];
  }
}

function removeToDiscard(card) {
  if (card && card.name) {
    resetCardBonus(card);
    G.discard.push(card);
    playSound('discard');
    applyExistEffects(); // keeps Ponce and discard-sensitive exist effects current
  }
}

function extinguishCard(card) {
  if (card && card.name) {
    resetCardBonus(card);
    G.extinct.push(card);
    playSound('discard');
    if (card.name === 'Roloc') applyExistEffects();
  }
}

function placeCard(card, owner, spaceIdx, slotIdx, faceDown, fromEffect = false) {
  const spIdx = spaceIdx;   // [Corregido] los hitos de Yiren, Menmei y Mimimi usaban «spIdx», que aquí no existía (daba error al colocarlas)
  card.owner = owner;
  card.faceDown = faceDown;
  card._placedThisTurn = true;
  if (card.powerBonus === undefined) card.powerBonus = 0;
  if (card.existBonus === undefined) card.existBonus = 0;
  // Clear Slau/space interaction flags so En can gain +2 again if re-entering
  for (const key of Object.keys(card)) {
    if (key.startsWith('_enSlau_') || key.startsWith('_enSpace_') || key.startsWith('_v1PenaltySpace_')) delete card[key];
  }
  G.spaces[spaceIdx].slots[owner][slotIdx] = card;

  const space = G.spaces[spaceIdx];

  // Space effect: "personajes colocados aquí se extinguen"
  // Real is immune. Check happens at reveal time, not placement.
  // (handled in revealOwnerCards)

  // Space effect: "Los efectos de existir no funcionan aquí."
  // Disable exist-type cards (except Reki) when placed into this space
  if (space.effectRevealed && space.effectText && space.effectText.includes('Los efectos de existir no funcionan aquí')) {
    if (card.type === 'exist' && card.name !== 'Reki') {
      card.effectDisabled = true;
    }
  }

  // Erizo Peluche: when ally placed, move erizo to top of deck
  // NOTE: handled at reveal time in revealOwnerCards, not here

  // Yukoi pending bonus — mark all allied V1 cards placed on the active turn (not moved)
  if (G.pending_yukoi && G.pending_yukoi.owner === owner &&
      G.pending_yukoi.activeTurn === G.turn &&
      card.baseValue === 1 && !card._movedThisTurn) {
    card._yukoi_pending = true;
  }

  // Soi: track if player placed Ziru or Tira this game
  if (owner === 0 && G.unlockProgress) {
    if (card.name === 'Ziru') G.unlockProgress.soiZiruPlaced = true;
    if (card.name === 'Tira') G.unlockProgress.soiTiraPlaced = true;
    // Yiren hito: track all spaces where player's Yiren has been placed
    if (card.name === 'Yiren') {
      if (!G.unlockProgress.yirenSpacesVisited) G.unlockProgress.yirenSpacesVisited = [];
      if (!G.unlockProgress.yirenSpacesVisited.includes(spIdx)) G.unlockProgress.yirenSpacesVisited.push(spIdx);
    }
    // Tira hito: track if player placed Tira on turn 1
    if (card.name === 'Tira' && G.turn === 1) G.unlockProgress._tiraPlacedT1 = true;
    // Ekuro hito: track if player placed Ekuro on turn 1
    if (card.name === 'Ekuro' && G.turn === 1) G.unlockProgress.ekuroT1Placed = true;
    // Tira hito: track if Su was ever active (for any player)
    if (card.name === 'Su') G.unlockProgress._tiraHadSu = true;
    // Menmei hito: player places Su (drawn via Menmei) in a V0-extinguish space
    if (card.name === 'Su' && G.unlockProgress._menmeiDrewSu) {
      const spaceEff = G.spaces[spIdx];
      if (spaceEff.effectRevealed && spaceEff.effectText && spaceEff.effectText.includes('Valor 0') && spaceEff.effectText.includes('extinguen')) {
        G.unlockProgress.menmeiSuInExtinctSpace = true;
      }
    }
    // Mimimi hito: track if player manually placed Mimimi (not auto-forced) this game
    if (card.name === 'Mimimi' && !card._autoPlaced) {
      G.unlockProgress._mimimiManualSpaceIdx = spIdx;
    }
  }
  // Tira hito: if Su placed by AI also invalidates the hito
  if (owner === 1 && G.unlockProgress && card.name === 'Su') G.unlockProgress._tiraHadSu = true;
}

function checkErizoPeluche(owner, spaceIdx, newCard) {
  if (newCard.name === 'ErizoPeluche') return;
  const space = G.spaces[spaceIdx];
  for (let s = 0; s < 3; s++) {
    const c = space.slots[owner][s];
    if (c && c.name === 'ErizoPeluche' && !c.effectDisabled && !c.faceDown) {
      space.slots[owner][s] = null;
      c._reservedFor = owner;
      G.deck.unshift(c);
      playSound('discard');
      addLog(`Erizo de Peluche Blanco vuelve al tope del mazo del ${owner===0?'Jugador':'IA'}.`, 'effect');
    }
  }
}

// ══════════════════════════════════════════════════════════
//  REAL — efecto de espacio (ya no es una carta)
// ══════════════════════════════════════════════════════════
function triggerReal(spaceIdx) {
  const space = G.spaces[spaceIdx];
  if (space.blocked) return;

  // [Nuevo] antes de borrarlas, se apunta dónde estaba cada carta (y cómo se veía)
  // para que la animación las deshaga en polvo blanco en su sitio
  const fantasmas = realCapturarCartas(spaceIdx);

  // Extinguish all non-Reki cards in the space → send to Extinct pile
  for (let s = 0; s < 2; s++)
    for (let sl = 0; sl < 3; sl++) {
      const c = space.slots[s][sl];
      if (c && c.name !== 'Reki') {
        space.slots[s][sl] = null;
        extinguishCard(c);
      }
    }

  // No Real card placed in slots — Real is now a pure space effect
  space.blocked = true;
  space._realActive = true;
  space.effectText = "Bloqueado, invalorable, extingue las cartas.";
  space.effectRevealed = true;
  playSound('tableroReal');
  addLog(`★ Real en Espacio ${[1,2,3][spaceIdx]}. Espacio bloqueado — ¡empate!`, 'real-log');

  // Play real-appear sound on first appearance this game
  if (!G._realMusicPlaying) {
    G._realMusicPlaying = true;
    playSound('realAppear');
  }

  // [Rediseñado] animación de Real: ver realAnimar
  realAnimar(spaceIdx, fantasmas);
  // Track Usei unlock: count distinct games where Real appeared (only once per game)
  if (G.unlockProgress && !G.unlockProgress._useiRealAppearedThisGame) {
    G.unlockProgress._useiRealAppearedThisGame = true;
    G.unlockProgress._useiRealCount = (G.unlockProgress._useiRealCount || 0) + 1;
    try {
      const USEI_KEY = 'juego_cartas_usei_real_count';
      const prev = parseInt(localStorage.getItem(USEI_KEY) || '0');
      localStorage.setItem(USEI_KEY, String(prev + 1));
    } catch {}
  }
}

/* ══════════════════════════════════════════════════════════
   [Nuevo] ANIMACIÓN DE REAL (pixel art)
   1) Destello y una pequeña sacudida del espacio.
   2) El blanco entra desde los bordes, en píxeles, con el borde tramado.
   3) Cada carta extinguida se vuelve blanca a trozos y los trozos suben
      como polvo, igual que el blanco de la novela.
   4) El blanco se retira hasta un velo que se queda, con motas blancas
      que suben sin parar (.real-veil, solo CSS: no gasta).
   Va en una capa propia pegada al espacio (se recoloca cada fotograma),
   así que aunque el tablero se vuelva a pintar, la animación sigue.
   ══════════════════════════════════════════════════════════ */
const REAL_ANIM = { ms: 3400, px: 5, blanco: [246, 244, 240] };
function realEspacioEl(i){ return document.querySelectorAll('#spaces-area .space')[i] || null; }
function realCapturarCartas(spaceIdx){
  const spEl = realEspacioEl(spaceIdx); if (!spEl) return [];
  const filas = spEl.querySelectorAll('.slots-row');
  const out = [];
  for (let s = 0; s < 2; s++) for (let sl = 0; sl < 3; sl++) {
    const c = G.spaces[spaceIdx].slots[s][sl];
    if (!c || c.name === 'Reki') continue;
    const fila = s === 1 ? filas[0] : filas[filas.length - 1];
    const slotEl = fila && fila.children[sl]; if (!slotEl) continue;
    const r = slotEl.getBoundingClientRect(), e = spEl.getBoundingClientRect();
    const img = new Image(); img.src = c.faceDown ? './ilustraciones/card-back.jpg' : `./ilustraciones/${c.name}.jpg`;
    out.push({ x: r.left - e.left, y: r.top - e.top, w: r.width, h: r.height, img });
  }
  return out;
}
function realAnimar(spaceIdx, fantasmas){
  const spEl0 = realEspacioEl(spaceIdx); if (!spEl0) return;
  const cv = document.createElement('canvas');
  cv.className = 'real-canvas-flotante';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const P = REAL_ANIM.px, [BR, BG, BB] = REAL_ANIM.blanco;
  let W = 0, H = 0, cols = 0, rows = 0, dist = null;
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  function colocar(){
    const el = realEspacioEl(spaceIdx) || spEl0, r = el.getBoundingClientRect();
    cv.style.left = r.left + 'px'; cv.style.top = r.top + 'px'; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
    const c2 = Math.max(1, Math.ceil(r.width / P)), r2 = Math.max(1, Math.ceil(r.height / P));
    if (c2 !== cols || r2 !== rows){
      cols = c2; rows = r2; W = r.width; H = r.height; cv.width = cols; cv.height = rows;
      dist = new Float32Array(cols * rows);   // 0 en el borde, 1 en el centro
      const m = Math.min(cols, rows) / 2;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++)
        dist[j * cols + i] = Math.min(1, Math.min(i + .5, j + .5, cols - i - .5, rows - j - .5) / m);
    }
    return el;
  }
  colocar();
  // trozos de cada carta: cuándo se vuelven blancos y cómo suben. La imagen no se lee
  // píxel a píxel (abriendo el juego como archivo el navegador no deja): se dibuja
  // encogida en una capa aparte y ahí se tapan de blanco o se borran los trozos
  const capa = document.createElement('canvas'), cx2 = capa.getContext('2d');
  const trozos = [];
  function prepararTrozos(){
    fantasmas.forEach(f => {
      const tc = Math.max(1, Math.round(f.w / P)), tr = Math.max(1, Math.round(f.h / P));
      const sm = document.createElement('canvas'); sm.width = tc; sm.height = tr;
      const sx0 = sm.getContext('2d');
      try { const iw = f.img.naturalWidth, ih = f.img.naturalHeight, k = Math.max(tc / iw, tr / ih); sx0.drawImage(f.img, (tc - iw * k) / 2, (tr - ih * k) / 2, iw * k, ih * k); }
      catch (e) { sx0.fillStyle = '#46425a'; sx0.fillRect(0, 0, tc, tr); }
      f.sm = sm; f.tc = tc; f.tr = tr;
      for (let j = 0; j < tr; j++) for (let i = 0; i < tc; i++)
        trozos.push({ f, i, j, t0: .45 + (j / tr) * .6 + Math.random() * .6,   // de abajo arriba, con desorden
          vx: (Math.random() - .5) * 18, vy: -(28 + Math.random() * 46), vida: .7 + Math.random() * .6 });
    });
  }
  const listos = fantasmas.map(f => new Promise(res => { if (f.img.complete) res(); else { f.img.onload = f.img.onerror = res; } }));
  Promise.all(listos).then(prepararTrozos);
  // sacudida del espacio
  try { spEl0.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-3px,1px)' }, { transform: 'translate(3px,-1px)' }, { transform: 'translate(-2px,0)' }, { transform: 'translate(0,0)' }], { duration: 380, easing: 'ease-out' }); } catch (e) {}
  const t0 = performance.now();
  function frente(t){   // cuánto ha entrado el blanco (0 = nada, 1 = hasta el centro)
    if (t < 1.25) { const k = t / 1.25; return .58 * (k * k * (3 - 2 * k)); }   // entra poco a poco, sin tapar del todo el centro
    const k = Math.min(1, (t - 1.25) / 1.9); return .58 - .48 * (k * k * (3 - 2 * k));
  }
  function fotograma(now){
    const t = (now - t0) / 1000, dur = REAL_ANIM.ms / 1000;
    if (t >= dur || !document.body.contains(cv)) { cv.remove(); realPonerVelo(spaceIdx); return; }
    colocar();
    const img = ctx.createImageData(cols, rows), d = img.data;
    const f = frente(t), banda = .12, fin = Math.min(1, Math.max(0, (dur - t) / .5));
    // 2) el blanco en píxeles, con el borde tramado (Bayer 4×4)
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
      const v = dist[j * cols + i];
      let a = v < f - banda ? 1 : v < f ? ((f - v) / banda > bayer[(j & 3) * 4 + (i & 3)] ? .85 : 0) : 0;
      if (a){ const q = (j * cols + i) * 4; d[q] = BR; d[q + 1] = BG; d[q + 2] = BB; d[q + 3] = a * 255 * fin; }
    }
    ctx.putImageData(img, 0, 0);
    // 3) las cartas: se ven, se blanquean a trozos, los trozos suben y se apagan
    const sx = cols / W, sy = rows / H;
    if (capa.width !== cols || capa.height !== rows){ capa.width = cols; capa.height = rows; }
    cx2.clearRect(0, 0, cols, rows);
    for (const f of fantasmas) if (f.sm) cx2.drawImage(f.sm, Math.round(f.x * sx), Math.round(f.y * sy), f.tc, f.tr);
    const vuelan = [];
    for (const b of trozos){
      const k = (t - b.t0) / .22;
      if (k <= 0) continue;
      const bx = Math.round(b.f.x * sx) + b.i, by = Math.round(b.f.y * sy) + b.j;
      if (k <= 1){ cx2.fillStyle = `rgba(${BR},${BG},${BB},${k})`; cx2.fillRect(bx, by, 1, 1); continue; }
      cx2.clearRect(bx, by, 1, 1);   // el trozo ya se ha ido: vuela como polvo blanco
      const tv = (k - 1) * .22, alfa = 1 - tv / b.vida; if (alfa <= 0) continue;
      vuelan.push(Math.round(bx + b.vx * tv * sx), Math.round(by + (b.vy * tv - 14 * tv * tv) * sy), alfa);
    }
    ctx.globalAlpha = fin; ctx.drawImage(capa, 0, 0);
    ctx.fillStyle = `rgb(${BR},${BG},${BB})`;
    for (let q = 0; q < vuelan.length; q += 3){ ctx.globalAlpha = vuelan[q + 2] * fin; ctx.fillRect(vuelan[q], vuelan[q + 1], 1, 1); }
    ctx.globalAlpha = 1;
    // 1) destello al principio
    if (t < .35){ ctx.fillStyle = `rgba(255,255,255,${(1 - t / .35) * .3})`; ctx.fillRect(0, 0, cols, rows); }
    requestAnimationFrame(fotograma);
  }
  requestAnimationFrame(fotograma);
}
function realPonerVelo(spaceIdx){
  const el = realEspacioEl(spaceIdx);
  if (el && !el.querySelector('.real-veil')){
    const veil = document.createElement('div'); veil.className = 'real-veil';
    el.appendChild(veil); requestAnimationFrame(() => veil.classList.add('visible'));
  }
}

// Extinguish a val0 card (triggers Real)
function extinguishVal0(owner, spaceIdx, slotIdx) {
  const space = G.spaces[spaceIdx];
  const card = space.slots[owner][slotIdx];
  if (!card || card.baseValue !== 0) return;
  animateCardFromSlot(spaceIdx, owner, slotIdx, 'extinct-pile-vis');
  space.slots[owner][slotIdx] = null;
  extinguishCard(card);
  addLog(`${card.name} es extinguida.`, 'effect');
  triggerReal(spaceIdx);
}

// ══════════════════════════════════════════════════════════
//  PROTECT FROM REMOVAL
// ══════════════════════════════════════════════════════════
function isProtected(owner, spaceIdx, { allowExtinction = false } = {}) {
  const space = G.spaces[spaceIdx];
  // Koly — doesn't protect against extinction
  if (!allowExtinction && space.slots[owner].some(c => c && c.name === 'Koly' && !c.effectDisabled && !c.faceDown)) return true;
  // Space effect
  if (!allowExtinction && space.effectRevealed && space.effectText.includes("no pueden ser removidos")) return true;
  return false;
}

// Mugon sacrifice: protect one ally — searches all spaces, async so player can choose
async function tryMugonSacrifice(owner, targetCard, { allowExtinction = false } = {}) {
  if (allowExtinction) return false; // extinction bypasses Mugon
  // Collect all face-up, non-disabled Mugons on owner's side across all spaces
  const mugons = [];
  for (let sp = 0; sp < 3; sp++) {
    const sp_ = G.spaces[sp];
    for (let sl = 0; sl < 3; sl++) {
      const c = sp_.slots[owner][sl];
      if (c && c.name === 'Mugon' && !c.effectDisabled && !c.faceDown)
        mugons.push({ sp, sl, c });
    }
  }
  if (mugons.length === 0) return false;
  let chosen;
  if (mugons.length > 1 && rdEligeHumano(owner)) {
    const idx = await chooseCard(mugons.map(m => m.c), 'Mugon: elige cuál se sacrifica', { noCancel: true });
    chosen = mugons.find(m => m.c === idx) ?? mugons[0];
  } else {
    chosen = mugons[0];
  }
  animateCardFromSlot(chosen.sp, owner, chosen.sl, 'discard-pile-vis');
  G.spaces[chosen.sp].slots[owner][chosen.sl] = null;
  G.discard.push(chosen.c);
  addLog(`Mugon se sacrifica para proteger a ${targetCard.name}.`, 'effect');
  return true;
}

// ══════════════════════════════════════════════════════════
//  AI TURN
// ══════════════════════════════════════════════════════════

// Helper: does a player have Tira active on the board?
// Returns true if player has Ekuro face-up on the board (Exist active)
// Ekuro placed this very turn is excluded: Exist only works from the next turn onward.
function hasEkuroActive(player) {
  return G.spaces.some(sp =>
    sp.slots[player].some(c => c && c.name === 'Ekuro' && !c.faceDown && !c.effectDisabled && !c._placedThisTurn)
  );
}

// Returns true if placing card on an occupied allied slot is valid right now
// (either card being placed IS Ekuro, or Ekuro Exist is active)
function canEkuroDisplace(cardBeingPlaced, owner) {
  if (cardBeingPlaced && cardBeingPlaced.name === 'Ekuro') return true;
  if (hasEkuroActive(owner)) return true;
  return false;
}

function hasTiraActive(player) {
  return G.spaces.some(sp =>
    sp.slots[player].some(c => c && c.name === 'Tira' && !c.faceDown && !c.effectDisabled)
  );
}

// Place AI card and animate. Returns {sp, sl} or null.
async function doAIPlace(playerSpaceIdx = null, playerSlotIdx = null) {
  if (!hasAnyFreeSlot(1) && G.hands[1].length === 0) return null;
  showAIThinking(true);
  render();

  // ── Update match state awareness ──────────────────────────────────────────
  // Recalculate before every AI decision so strategy adapts dynamically.
  {
    const [playerWins, aiWins] = getSpacesWon();
    const turnsLeft = G.maxTurns - G.turn + 1;
    if (aiWins >= 2) G.aiMatchState = 'winning';
    else if (playerWins >= 2) G.aiMatchState = 'losing';
    else if (aiWins > playerWins) G.aiMatchState = 'winning';
    else if (playerWins > aiWins) G.aiMatchState = 'losing';
    else G.aiMatchState = 'neutral';
    // Even if "winning", if it's last turn and lead is thin, stay cautious
    if (turnsLeft <= 1 && aiWins <= playerWins) G.aiMatchState = 'losing';
  }

  // Check if player has Nasu forcing AI to a specific space this turn
  const nasuEntry = G.pending_nasu.find(n => n.target === 1 && n.turn === G.turn);

  let decision = null;
  try { decision = await askClaude(playerSpaceIdx, playerSlotIdx); } catch(e) { console.error(e); }

  showAIThinking(false);

  let placed = false;
  let aiSp = -1, aiSl = -1;

  // If Nasu is active, override decision to forced space
  if (nasuEntry) {
    const forcedSp = nasuEntry.spIdx;
    const space = G.spaces[forcedSp];
    if (!space.blocked) {
      for (let sl = 0; sl < space.slotCount[1]; sl++) {
        if (!space.slots[1][sl] && G.hands[1].length > 0) {
          // If space has Extingue effect, prefer a V0 card to sacrifice
          const activeEffs = getActiveEffects(forcedSp);
          const spaceExtingue = activeEffs.some(e => e.includes('extingue') || e.includes('Extingue'));
          let cardIdx = 0;
          if (spaceExtingue) {
            const v0Idx = G.hands[1].findIndex(c => c.baseValue === 0);
            if (v0Idx !== -1) cardIdx = v0Idx;
          }
          const card = G.hands[1].splice(cardIdx, 1)[0];
          placeCard(card, 1, forcedSp, sl, true);
          aiSp = forcedSp; aiSl = sl;
          render();
          await animateAIPlay(forcedSp, sl);
          placed = true;
          addLog(`IA juega en E${[1,2,3][forcedSp]} por Nasu.`, 'effect');
          break;
        }
      }
    }
    G.pending_nasu = G.pending_nasu.filter(n => n !== nasuEntry);
  }

  if (!placed && decision) {
    const cardIdx = G.hands[1].findIndex(c => c.name === decision.cardName);
    if (cardIdx !== -1) {
      const sp = decision.spaceIdx;
      const sl = decision.slotIdx;
      const space = G.spaces[sp];
      if (sp >= 0 && sp < 3 && sl >= 0 && sl < 3 &&
          !space.blocked && !space.slots[1][sl] && sl < space.slotCount[1]) {
        const card = G.hands[1].splice(cardIdx, 1)[0];
        placeCard(card, 1, sp, sl, true);
        aiSp = sp; aiSl = sl;
        render();
        await animateAIPlay(sp, sl);
        placed = true;
      }
    }
  }

  if (!placed) {
    outer: for (let sp = 0; sp < 3; sp++) {
      const space = G.spaces[sp];
      if (space.blocked) continue;
      for (let sl = 0; sl < space.slotCount[1]; sl++) {
        if (!space.slots[1][sl]) { aiSp = sp; aiSl = sl; break outer; }
      }
    }
    aiFallbackPlace();
    if (aiSp !== -1) {
      render();
      await animateAIPlay(aiSp, aiSl);
    }
  }

  // Capturar jugada IA para historial
  if (aiSp !== -1 && G._currentTurnLog) {
    // Buscar la carta que la IA acaba de colocar en aiSp
    const aiCard = G.spaces[aiSp]?.slots[1]?.find(c => c && c._placedThisTurn);
    if (aiCard) { G._currentTurnLog.aiCard = aiCard.displayName || aiCard.name; G._currentTurnLog.aiSpace = aiSp; }
  }
  return aiSp !== -1 ? { sp: aiSp, sl: aiSl } : null;
}

async function aiTurn(playerSpaceIdx = null, playerSlotIdx = null) {
  if (!hasAnyFreeSlot(1)) {
    addLog('La IA no puede colocar cartas. Su turno se salta.', 'effect');
  } else {
    // Try Colocación Destinada only for specific combos
    const destinadaBlockedBySpace = G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'));
    if (!G.destinadaUsed[1] && !destinadaBlockedBySpace && G.hands[1].length >= 2) {
      const restaurarD = iaOcultarJugadaRival(playerSpaceIdx, playerSlotIdx);   // [Mejorado] sin mirar la carta de este turno del jugador
      let destinadaPlay = null;
      try { destinadaPlay = aiDecideDestinada(); } finally { restaurarD(); }
      if (destinadaPlay) {
        try {
          await doAIDestinada(destinadaPlay);
          G.destinadaUsed[1] = true;
          addLog(`La IA usa Colocación Destinada.`, 'ai');
          if (typeof destinadaRivalActivada === 'function') destinadaRivalActivada();   // [Nuevo] cartel junto a la mano rival
          // Nasu hito: AI used Destinada in a space where player has Nasu face-up
          if (G.unlockProgress) {
            const { sp1, sp2 } = destinadaPlay;
            const _nasuSpaces = new Set([sp1, sp2]);
            for (const _nsp of _nasuSpaces) {
              if (G.spaces[_nsp].slots[0].some(c => c && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)) {
                G.unlockProgress.nasuRivalDestinadaHere = true;
                break;
              }
            }
          }
        } catch(e) {
          console.error('AI Destinada failed, falling back:', e);
          await doAIPlace(playerSpaceIdx, playerSlotIdx);
        }
        addLog(`Ambos colocan una carta.`, '');
        await resolvePhase();
        return;
      }
    }
    await doAIPlace(playerSpaceIdx, playerSlotIdx);
  }
  addLog(`Ambos colocan una carta.`, '');
  await resolvePhase();
}

// Returns { card1, sp1, sl1, card2, sp2, sl2 } if AI should use Destinada, else null
// Only triggers for specific high-value combos — never for generic placement
function aiDecideDestinada() {
  const hand = G.hands[1];
  if (G.destinadaUsed[1]) return null;
  if (G.spaces.some(sp => sp.effectRevealed && sp.effectText && sp.effectText.includes('activar Colocación Destinada'))) return null;
  const v0Cards = hand.filter(c => c.baseValue === 0);
  const v1Cards = hand.filter(c => c.baseValue === 1);
  if (!v0Cards.length || !v1Cards.length) return null;

  function freeSlot(sp) {
    return G.spaces[sp].slots[1].findIndex((c, i) => !c && i < G.spaces[sp].slotCount[1]);
  }
  function anyFreeSpace(exclude = -1) {
    for (let sp = 0; sp < 3; sp++) {
      if (sp === exclude || G.spaces[sp].blocked || isRealSpace(sp)) continue;
      if (freeSlot(sp) !== -1) return sp;
    }
    return -1;
  }

  const nofiInHand  = hand.find(c => c.name === 'Nofi');
  const rasuInHand  = hand.find(c => c.name === 'Rasu');
  const suInHand    = hand.find(c => c.name === 'Su');
  const hobuInHand  = hand.find(c => c.name === 'Hobu');
  const abakiInHand = hand.find(c => c.name === 'Abaki');
  const kopeInHand  = hand.find(c => c.name === 'Kope');
  const rekiInHand  = hand.find(c => c.name === 'Reki');
  const reizaInHand = hand.find(c => c.name === 'Reiza');
  const hanoeInHand = hand.find(c => c.name === 'Hanoe');
  const gaeInHand   = hand.find(c => c.name === 'Gae');
  const foretInHand = hand.find(c => c.name === 'Foret');
  const yirenInHand = hand.find(c => c.name === 'Yiren');
  const faunInHand  = hand.find(c => c.name === 'Faun');
  const tisInHand   = hand.find(c => c.name === 'Tis');
  const restaInHand = hand.find(c => c.name === 'Resta');
  const imiInHand   = hand.find(c => c.name === 'Imi');
  const nasuInHand  = hand.find(c => c.name === 'Nasu');
  const nuguInHand  = hand.find(c => c.name === 'Nugu');
  const useiInHand  = hand.find(c => c.name === 'Usei');
  const unaInHand   = hand.find(c => c.name === 'Una');
  const ionaInHand  = hand.find(c => c.name === 'Iona');

  // ── Combo 1: Nofi + Rasu ────────────────────────────────────────────────────
  // Place Nofi in a space without rivals, Rasu in a space that has cards to move.
  // Prefer placing Rasu where it can move a card TO Nofi's space (erizo synergy).
  if (nofiInHand && rasuInHand) {
    for (let sp1 = 0; sp1 < 3; sp1++) {
      if (G.spaces[sp1].blocked || isRealSpace(sp1)) continue;
      const sl1 = freeSlot(sp1);
      if (sl1 === -1) continue;
      if (G.spaces[sp1].slots[0].some(c => c && c._placedThisTurn)) continue; // Nofi needs rival to NOT be here
      // Try to find a space for Rasu that has at least one card that can be moved to sp1
      // (sp1 = Nofi's space must have a free AI slot for Rasu's moved card to land in)
      const nofiSpaceHasFreeAISlot = G.spaces[sp1].slots[1].some((c, i) => !c && i < G.spaces[sp1].slotCount[1]);
      let bestSp2 = -1;
      for (let sp2 = 0; sp2 < 3; sp2++) {
        if (sp2 === sp1 || G.spaces[sp2].blocked || isRealSpace(sp2)) continue;
        if (freeSlot(sp2) === -1) continue;
        // Check: does sp2 have any card that can be moved to sp1?
        const hasMoveCandidate = nofiSpaceHasFreeAISlot && [0,1].some(side =>
          G.spaces[sp2].slots[side].some(c => c) &&
          G.spaces[sp1].slots[side].some((x, i) => !x && i < G.spaces[sp1].slotCount[side])
        );
        if (hasMoveCandidate) { bestSp2 = sp2; break; }
        if (bestSp2 === -1) bestSp2 = sp2; // fallback
      }
      if (bestSp2 === -1) continue;
      // Don't place Rasu in a space where cards cannot be moved — its effect is useless there
      const rasuSpaceEffect = G.spaces[bestSp2].effectText || '';
      if (G.spaces[bestSp2].effectRevealed && rasuSpaceEffect.includes('Las cartas en este espacio no pueden ser movidas')) continue;
      return { card1: nofiInHand, sp1, sl1, card2: rasuInHand, sp2: bestSp2, sl2: freeSlot(bestSp2) };
    }
  }

  // ── Combo 2: Su + Abaki/Kope ─────────────────────────────────────────────────
  // Su makes reveal effects fire unconditionally; partner placed in contested space
  // Note: Hobu now triggers when rival did NOT play here, so it doesn't combo with Su
  if (suInHand) {
    const partners = [abakiInHand, kopeInHand].filter(Boolean);
    for (const partner of partners) {
      for (let sp2 = 0; sp2 < 3; sp2++) {
        if (G.spaces[sp2].blocked || isRealSpace(sp2)) continue;
        const sl2 = freeSlot(sp2);
        if (sl2 === -1) continue;
        const rivalHere = G.spaces[sp2].slots[0].some(c => c);
        // Abaki wants rivals present; Kope wants no rivals
        const fits = partner.name === 'Abaki' ? rivalHere : !rivalHere;
        if (!fits) continue;
        const sp1 = anyFreeSpace(sp2);
        if (sp1 === -1) continue;
        return { card1: suInHand, sp1, sl1: freeSlot(sp1), card2: partner, sp2, sl2 };
      }
    }
  }

  // ── Combo 3: Reiza + Hanoe ──────────────────────────────────────────────────
  if (reizaInHand && hanoeInHand) {
    const sp1 = anyFreeSpace(-1);
    if (sp1 !== -1) {
      const sp2 = anyFreeSpace(sp1);
      if (sp2 !== -1)
        return { card1: reizaInHand, sp1, sl1: freeSlot(sp1), card2: hanoeInHand, sp2, sl2: freeSlot(sp2) };
    }
  }

  // ── Combo 4: Tis + Gae/Foret/Yiren/(last-turn Faun) ────────────────────────
  if (tisInHand) {
    const partners = [gaeInHand, foretInHand, yirenInHand,
      ...(G.turn === G.maxTurns ? [faunInHand] : [])].filter(Boolean);
    for (const partner of partners) {
      // Find a space with existing allied V1 for Yiren/Gae synergy
      for (let sp1 = 0; sp1 < 3; sp1++) {
        if (G.spaces[sp1].blocked || isRealSpace(sp1)) continue;
        const hasAllyV1 = G.spaces[sp1].slots[1].some(c => c && !c.faceDown && c.baseValue === 1);
        if (partner.name === 'Yiren' && !hasAllyV1) continue;
        const sl1 = freeSlot(sp1);
        if (sl1 === -1) continue;
        const sp2 = anyFreeSpace(sp1);
        if (sp2 === -1) continue;
        // Tis multiplies values in its own space — place Tis where allied V1 is, partner elsewhere
        return { card1: tisInHand, sp1, sl1, card2: partner, sp2, sl2: freeSlot(sp2) };
      }
      // Fallback: any two free spaces
      const sp1 = anyFreeSpace(-1);
      if (sp1 === -1) continue;
      const sp2 = anyFreeSpace(sp1);
      if (sp2 === -1) continue;
      return { card1: tisInHand, sp1, sl1: freeSlot(sp1), card2: partner, sp2, sl2: freeSlot(sp2) };
    }
  }

  // ── Combo 5: Resta + Imi ────────────────────────────────────────────────────
  if (restaInHand && imiInHand) {
    for (let sp1 = 0; sp1 < 3; sp1++) {
      if (G.spaces[sp1].blocked || isRealSpace(sp1)) continue;
      if (computeSpaceScore(sp1).winner === 1) continue; // already winning
      const sl1 = freeSlot(sp1);
      if (sl1 === -1) continue;
      const sp2 = anyFreeSpace(sp1);
      if (sp2 === -1) continue;
      return { card1: restaInHand, sp1, sl1, card2: imiInHand, sp2, sl2: freeSlot(sp2) };
    }
  }

  // ── Combo 6: Nasu setup + Abaki follow-up ───────────────────────────────────
  // If Nasu forced rival here this turn, use Abaki for the guaranteed trigger
  // Note: Hobu now wants rival NOT here, so it no longer combos with Nasu
  {
    const nasuEntry = G.pending_nasu.find(n => n.target === 0 && n.turn === G.turn);
    if (nasuEntry && abakiInHand) {
      const partner = abakiInHand;
      const forcedSp = nasuEntry.spIdx;
      if (G.spaces[forcedSp].slots[0].some(c => c && c._placedThisTurn)) {
        const sl1 = freeSlot(forcedSp);
        if (sl1 !== -1) {
          const sp2 = anyFreeSpace(forcedSp);
          if (sp2 !== -1) {
            const secondCard = v0Cards.find(c => c !== partner) || v1Cards.find(c => c !== partner);
            if (secondCard)
              return { card1: partner, sp1: forcedSp, sl1, card2: secondCard, sp2, sl2: freeSlot(sp2) };
          }
        }
      }
    }
    // Set up Nasu now if we have Abaki and it's not too late
    if (nasuInHand && abakiInHand && G.turn < G.maxTurns) {
      for (let sp1 = 0; sp1 < 3; sp1++) {
        if (G.spaces[sp1].blocked || isRealSpace(sp1)) continue;
        if (computeSpaceScore(sp1).winner === 1) continue;
        const sl1 = freeSlot(sp1);
        if (sl1 === -1) continue;
        const partner = abakiInHand;
        const sp2 = anyFreeSpace(sp1);
        if (sp2 === -1) continue;
        const aiWinsCount = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
        if (aiWinsCount < 2)
          return { card1: nasuInHand, sp1, sl1, card2: partner, sp2, sl2: freeSlot(sp2) };
      }
    }

  }

  // ── Combo 7: Reki in blocked/Real space + best V1 elsewhere ─────────────────
  if (rekiInHand) {
    for (let sp1 = 0; sp1 < 3; sp1++) {
      if (!isRealSpace(sp1) && !G.spaces[sp1].blocked) continue;
      const sl1 = G.spaces[sp1].slots[1].findIndex((c, i) => !c && i < G.spaces[sp1].slotCount[1]);
      if (sl1 === -1) continue;
      if (computeSpaceScore(sp1).winner === 1) continue;
      const sp2 = anyFreeSpace(-1);
      if (sp2 === -1) continue;
      const sl2 = freeSlot(sp2);
      let bestV1 = null, bestScore = -Infinity;
      for (const c of v1Cards) {
        if (c === rekiInHand) continue;
        const s = aiScorePlacement(c, sp2, sl2, null);
        if (s > bestScore) { bestScore = s; bestV1 = c; }
      }
      if (bestV1) return { card1: rekiInHand, sp1, sl1, card2: bestV1, sp2, sl2 };
    }
  }

  // ── Combo 8: Una + Iona ─────────────────────────────────────────────────────
  // Una (V0) swaps space effects; Iona (V1) benefits from spaces with few slots.
  // Strategy: Una goes into the single-slot space (to disrupt rival there),
  // Iona goes to wherever the single-slot effect will land after the swap.
  if (unaInHand && ionaInHand) {
    const singleSlotSp = [0,1,2].find(i =>
      G.spaces[i].effectRevealed && G.spaces[i].effectText.includes('un hueco') && !isRealSpace(i)
    );
    if (singleSlotSp !== undefined) {
      // Una goes into the single-slot space if there's a free slot for AI
      const sl1 = G.spaces[singleSlotSp].slots[1].findIndex((c, i) => !c && i < G.spaces[singleSlotSp].slotCount[1]);
      if (sl1 !== -1) {
        // Iona goes to another space that has no AI allies yet (or where Iona gains most)
        let bestIonaSp = -1, bestIonaEmpty = -1;
        for (let sp2 = 0; sp2 < 3; sp2++) {
          if (sp2 === singleSlotSp || G.spaces[sp2].blocked || isRealSpace(sp2)) continue;
          const sl2 = freeSlot(sp2);
          if (sl2 === -1) continue;
          const hasNoAI = !G.spaces[sp2].slots[1].some(c => c);
          const emptySlots = G.spaces[sp2].slots[1].filter((c, i) => !c || i >= G.spaces[sp2].slotCount[1]).length;
          if (hasNoAI && emptySlots > bestIonaEmpty) { bestIonaSp = sp2; bestIonaEmpty = emptySlots; }
        }
        if (bestIonaSp !== -1)
          return { card1: unaInHand, sp1: singleSlotSp, sl1, card2: ionaInHand, sp2: bestIonaSp, sl2: freeSlot(bestIonaSp) };
      }
    }
  }

  // ── [Mejorado] Combo genérico: se prueban JUNTAS todas las parejas V0 + V1 y se usa la
  //    Destinada solo si la pareja es claramente mejor que la mejor jugada normal (ver iaDestinadaConjunta)
  { const par = iaDestinadaConjunta(v0Cards, v1Cards); if (par) return par; }

  // No specific combo found
  return null;
}

async function doAIDestinada({ card1, sp1, sl1, card2, sp2, sl2 }) {
  showAIThinking(true);
  await gameSleep(400);
  showAIThinking(false);
  const idx1 = G.hands[1].indexOf(card1);
  G.hands[1].splice(idx1, 1);
  placeCard(card1, 1, sp1, sl1, true);
  card1._destinadaOrder = 1;
  render();
  await animateAIPlay(sp1, sl1);
  await gameSleep(300);
  // Nasu: if the first card went to a Nasu-forced space and that space still has a free slot,
  // force the second card there too
  const nasuEntryAID = G.pending_nasu.find(n => n.target === 1 && n.turn === G.turn);
  if (!nasuEntryAID && sp1 !== sp2) {
    // Check if first card satisfied a Nasu and space still has room for second
    const nasuForAI = G.spaces.some((space, spi) =>
      space.slots[0].some(c => c && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled) && spi === sp1
    );
    if (nasuForAI) {
      const sp1Space = G.spaces[sp1];
      const freeSlotIdx = sp1Space.slots[1].findIndex((c, i) => !c && i < sp1Space.slotCount[1]);
      if (freeSlotIdx !== -1) { sp2 = sp1; sl2 = freeSlotIdx; }
    }
  }
  if (nasuEntryAID) {
    const forcedSp = nasuEntryAID.spIdx;
    const nasuSpaceFull = G.spaces[forcedSp].slots[1].slice(0, G.spaces[forcedSp].slotCount[1]).every(c => c);
    if (!nasuSpaceFull) {
      const freeSlotIdx = G.spaces[forcedSp].slots[1].findIndex((c, i) => !c && i < G.spaces[forcedSp].slotCount[1]);
      if (freeSlotIdx !== -1) { sp2 = forcedSp; sl2 = freeSlotIdx; }
    }
    G.pending_nasu = G.pending_nasu.filter(n => n !== nasuEntryAID);
  }
  // Adjust idx2 after first splice
  let idx2 = G.hands[1].indexOf(card2);
  G.hands[1].splice(idx2, 1);
  placeCard(card2, 1, sp2, sl2, true);
  card2._destinadaOrder = 2;
  render();
  await animateAIPlay(sp2, sl2);
}

function aiFallbackPlace() {
  if (G.hands[1].length === 0) return;
  // Smart fallback: quick score pass instead of blindly using first card/slot
  let bestScore = -Infinity, bestCardIdx = 0, bestSp = -1, bestSl = -1;
  for (let ci = 0; ci < G.hands[1].length; ci++) {
    const card = G.hands[1][ci];
    for (let sp = 0; sp < 3; sp++) {
      const space = G.spaces[sp];
      if (space.blocked) continue;
      for (let sl = 0; sl < space.slotCount[1]; sl++) {
        if (space.slots[1][sl]) continue;
        space.slots[1][sl] = card;
        const winsAfter = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
        space.slots[1][sl] = null;
        const sc = computeSpaceScore(sp);
        let s = winsAfter * 100 + (sc.winner === 1 ? 40 : sc.winner === -1 ? 10 : 0);
        if (s > bestScore) { bestScore = s; bestCardIdx = ci; bestSp = sp; bestSl = sl; }
      }
    }
  }
  if (bestSp === -1) {
    // Absolute last resort: first available slot
    for (let sp = 0; sp < 3; sp++) {
      const space = G.spaces[sp];
      if (space.blocked) continue;
      for (let sl = 0; sl < space.slotCount[1]; sl++) {
        if (!space.slots[1][sl]) { bestSp = sp; bestSl = sl; break; }
      }
      if (bestSp !== -1) break;
    }
    if (bestSp !== -1) { const card = G.hands[1].shift(); placeCard(card, 1, bestSp, bestSl, true); }
    return;
  }
  const card = G.hands[1].splice(bestCardIdx, 1)[0];
  placeCard(card, 1, bestSp, bestSl, true);
}

async function askClaude(playerSpaceIdx = null, playerSlotIdx = null) {
  const restaurar = iaOcultarJugadaRival(playerSpaceIdx, playerSlotIdx);   // [Mejorado] sin mirar la carta de este turno del jugador
  try { return aiDecide(playerSpaceIdx, playerSlotIdx); } finally { restaurar(); }
}

/* ══ [Mejorado] IA: probabilidad de ganar la partida ════════════════════════
   Para cada espacio estima la probabilidad de ganarlo al final, a partir de
   la ventaja actual, los huecos libres de cada lado y los turnos que quedan
   (con lo que puede añadir cada uno). Con eso, la probabilidad de ganar 2 de
   3. Las jugadas que más la suben puntúan más: la IA juega para ganar la
   partida, no solo para ganar el espacio que tiene delante. */
function iaVidaMedia(cartas){ if (!cartas || !cartas.length) return 0.55; return cartas.reduce((a, c) => a + (c.baseValue || 0) + (c.powerBonus || 0), 0) / cartas.length; }
function iaProbEspacios(){
  const T = Math.max(1, G.maxTurns - G.turn + 1);
  const vJ = ziruActive(1) ? iaVidaMedia(G.hands[0]) : 0.55;   // sin Ziru, la mano del jugador es un misterio: valor medio
  const vI = iaVidaMedia(G.hands[1]);
  return [0,1,2].map(i => {
    const s = G.spaces[i], r = computeSpaceScore(i);
    const dif = Math.max(1, Math.min(4, Math.abs((r.p1 || 0) - (r.p0 || 0))));
    const m = r.winner === 1 ? dif : r.winner === 0 ? -dif : 0;
    if (s.blocked) return r.winner === 1 ? 0.95 : r.winner === 0 ? 0.05 : 0.5;
    const libres = side => { let n = 0; for (let k = 0; k < s.slotCount[side]; k++) if (!s.slots[side][k]) n++; return n; };
    const eJ = Math.min(libres(0), T) * vJ * 0.42;          // lo que el jugador aún puede añadir aquí (incluida su carta de este turno)
    const eI = Math.min(libres(1), Math.max(0, T - 1)) * vI * 0.42;
    const z = m + eI - eJ;
    return 1 / (1 + Math.exp(-1.5 * z / Math.sqrt(1 + 0.35 * T)));
  });
}
function iaProbPartida(){
  if (typeof isGlobalScoring === 'function' && isGlobalScoring()) return 0.5;   // modo de puntos globales: no aplica
  const [a, b, c] = iaProbEspacios();
  return a*b*c + a*b*(1-c) + a*(1-b)*c + (1-a)*b*c;
}
var IA_PESO_PARTIDA = 900, IA_ALFA = 1;
function iaGananciaPartida(card, sp, sl){
  const antes = iaProbPartida();
  const sc = G.spaces[sp]; sc.slots[1][sl] = card;
  const despues = iaProbPartida();
  sc.slots[1][sl] = null;
  return (despues - antes) * IA_PESO_PARTIDA;
}
// la mejor jugada normal (una carta), con la misma puntuación que usa aiDecide (sin lookahead ni extras)
function iaMejorSimple(){
  let mejor = -Infinity;
  for (const card of G.hands[1]) for (let sp = 0; sp < 3; sp++) {
    const s = G.spaces[sp]; if (s.blocked || isRealSpace(sp)) continue;
    for (let sl = 0; sl < s.slotCount[1]; sl++) { if (s.slots[1][sl]) continue;
      const v = aiScorePlacement(card, sp, sl, null) + iaGananciaPartida(card, sp, sl);
      if (v > mejor) mejor = v; }
  }
  return mejor;
}
// Colocación Destinada pensada: todas las parejas V0 + V1 a la vez, comparadas con la mejor jugada normal
function iaDestinadaConjunta(v0Cards, v1Cards){
  if (!v0Cards.length || !v1Cards.length) return null;
  const T = Math.max(1, G.maxTurns - G.turn + 1);
  if (T > 2) return null;   // [Mejorado] la Destinada «genérica» solo al final (en las pruebas, usarla pronto salía mal); los combos concretos siguen igual
  const huecos = [];
  for (let sp = 0; sp < 3; sp++) { const s = G.spaces[sp]; if (s.blocked || isRealSpace(sp)) continue;
    for (let sl = 0; sl < s.slotCount[1]; sl++) if (!s.slots[1][sl]) huecos.push([sp, sl]); }
  if (huecos.length < 2) return null;
  const cache = new Map(), heur = (c, sp, sl) => { let m = cache.get(c); if (!m) cache.set(c, m = new Map()); const k = sp * 10 + sl; if (!m.has(k)) m.set(k, aiScorePlacement(c, sp, sl, null)); return m.get(k); };
  const p0 = iaProbPartida();
  let mejor = null, mejorV = -Infinity;
  for (const c1 of v0Cards) for (const [sp1, sl1] of huecos) for (const c2 of v1Cards) for (const [sp2, sl2] of huecos) {
    if (sp1 === sp2 && sl1 === sl2) continue;
    G.spaces[sp1].slots[1][sl1] = c1; G.spaces[sp2].slots[1][sl2] = c2;
    const p2 = iaProbPartida();
    G.spaces[sp1].slots[1][sl1] = null; G.spaces[sp2].slots[1][sl2] = null;
    const v = (p2 - p0) * IA_PESO_PARTIDA * 1.15 + 0.5 * (heur(c1, sp1, sl1) + heur(c2, sp2, sl2));
    if (v > mejorV) { mejorV = v; mejor = { card1: c1, sp1, sl1, card2: c2, sp2, sl2 }; }
  }
  if (!mejor) return null;
  // guardarla tiene valor mientras queden turnos; en el último turno, se usa si aporta algo
  const umbral = T <= 1 ? 0 : T === 2 ? 45 : 70 + 25 * (T - 3);
  return (mejorV - iaMejorSimple() > umbral) ? mejor : null;
}
// La IA no ve dónde ha colocado el jugador su carta de ESTE turno (va boca abajo y es simultáneo),
// salvo con Tira, que se lo dice (playerSpaceIdx/playerSlotIdx)
function iaOcultarJugadaRival(px, py){
  const ocultas = [];
  G.spaces.forEach((s, sp) => s.slots[0].forEach((c, sl) => {
    if (c && c.faceDown && c._placedThisTurn && !(sp === px && sl === py)) { ocultas.push([sp, sl, c]); s.slots[0][sl] = null; }
  }));
  return () => ocultas.forEach(([sp, sl, c]) => { if (!G.spaces[sp].slots[0][sl]) G.spaces[sp].slots[0][sl] = c; });
}

// ── Local AI: fully offline, no API needed ───────────────────────────────────
function aiDecide(playerSpaceIdx = null, playerSlotIdx = null) {
  const hand = G.hands[1];
  if (!hand.length) return null;

  const turnsLeft  = G.maxTurns - G.turn + 1;
  const isLastTurn = turnsLeft <= 1;
  const isPenultimate = turnsLeft === 2;
  const matchState = G.aiMatchState || 'neutral'; // 'winning' | 'neutral' | 'losing'

  // ── Turno 1: [Mejorado] ya no es al azar: se puntúa como el resto (con un poco de variedad, ver más abajo) ──
  if (false && G.turn === 1) {
    const validMoves = [];
    for (const c of hand) {
      for (let sp = 0; sp < 3; sp++) {
        const spc = G.spaces[sp];
        if (spc.blocked || isRealSpace(sp)) continue;
        for (let sl = 0; sl < spc.slotCount[1]; sl++) {
          if (!spc.slots[1][sl]) validMoves.push({ cardName: c.name, spaceIdx: sp, slotIdx: sl });
        }
      }
    }
    if (validMoves.length) return validMoves[Math.floor(Math.random() * validMoves.length)];
    return null;
  }

  // ── Combo protection ───────────────────────────────────────────────────────
  const comboProtected = new Set();
  const comboNames = [
    ['Nofi','Rasu'], ['Su','Abaki'], ['Su','Kope'],
    ['Reiza','Hanoe'], ['En','Slau'], ['Resta','Imi'],
    ['Nasu','Abaki'], ['Nasu','Ramia'], ['Nasu','Tanozo'],
    ['Tis','Gae'], ['Tis','Foret'], ['Tis','Yiren'], ['Tis','Faun'],
  ];
  for (const [a, b] of comboNames) {
    if (hand.some(c => c.name === a) && hand.some(c => c.name === b)) {
      comboProtected.add(a); comboProtected.add(b);
    }
  }

  // ── Player space preference (pattern recognition) ─────────────────────────
  // Identify if the player has a strong tendency toward a particular space.
  const hist = G.aiPlayerSpaceHistory || [0, 0, 0];
  const totalPlays = hist[0] + hist[1] + hist[2];
  // Space the player has preferred most (only meaningful after 2+ turns of data)
  const playerFavouriteSpace = totalPlays >= 2
    ? hist.indexOf(Math.max(...hist))
    : -1;

  // ── Hand management: detect cards that have become useless ────────────────
  // A card is "stale" if its effect can no longer trigger meaningfully.
  const staleCards = new Set();
  for (const c of hand) {
    // Gena: useless if no allies on board AND it's late game
    if (c.name === 'Gena' && (isPenultimate || isLastTurn)) {   // [Corregido] faltaban los paréntesis: en el último turno marcaba como inútiles TODAS las cartas de la mano
      const alliesOnBoard = G.spaces.some(s => s.slots[1].some(a => a && !a.faceDown));
      if (!alliesOnBoard) staleCards.add(c.name);
    }
    // Faun: worthless before last turn (handled in scoring already, but mark stale for hand mgmt)
    if (c.name === 'Faun' && !isLastTurn && turnsLeft > 2) staleCards.add(c.name);
    // Peroth: useless if discard is empty
    if (c.name === 'Peroth' && G.discard.filter(d => d.baseValue === 1).length === 0) staleCards.add(c.name);
    // Menmei: useless if deck has no V0 or no V1
    if (c.name === 'Menmei') {
      if (!G.deck.some(d => d.baseValue === 0) || !G.deck.some(d => d.baseValue === 1)) staleCards.add(c.name);
    }
    // Noira: useless if no allies on board at all
    if (c.name === 'Noira') {
      const allies = G.spaces.flatMap(s => s.slots[1].filter(a => a && !a.faceDown && a !== c));
      if (allies.length === 0) staleCards.add(c.name);
    }
  }

  // ── Score every candidate move ─────────────────────────────────────────────
  let bestScore = -Infinity;
  let bestCard = null, bestSp = 0, bestSl = 0;

  for (const card of hand) {
    for (let sp = 0; sp < 3; sp++) {
      const space = G.spaces[sp];
      if (space.blocked || isRealSpace(sp)) continue;
      for (let sl = 0; sl < space.slotCount[1]; sl++) {
        if (space.slots[1][sl]) continue;

        let score = aiScorePlacement(card, sp, sl, playerSpaceIdx) * IA_ALFA;   // [Mejorado] peso de las reglas por carta

        // ── Match state strategy ───────────────────────────────────────────
        // Winning: prioritise consolidating, avoid risky plays.
        // Losing: boost score for moves that flip spaces, accept more risk.
        const winsBefore = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
        space.slots[1][sl] = card;
        const winsAfter = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
        space.slots[1][sl] = null;
        const winDelta = winsAfter - winsBefore;

        if (matchState === 'losing') {
          // Desperate: heavily reward any move that flips a space
          if (winDelta > 0) score += winDelta * 120;
          // Penalise "safe but useless" plays when losing
          if (winDelta === 0 && winsAfter < 2) score -= 20;
        } else if (matchState === 'winning') {
          // Comfortable: reward defending won spaces, less need to flip
          if (winDelta > 0) score += winDelta * 50;
          if (winsBefore >= 2 && winDelta >= 0) score += 40; // consolidate lead
          // Penalise reckless plays when ahead
          if (winDelta < 0) score -= 60;
        } else {
          // Neutral: standard bonus
          if (winDelta > 0) score += winDelta * 80;
          if (winsBefore >= 2 && winDelta >= 0) score += 25;
        }

        // ── Hand management: stale card penalty ───────────────────────────
        // Stale cards should be played (spent) before useful ones.
        if (staleCards.has(card.name)) score -= 80;
        // But if it's the last turn and we have no better option, lift the penalty
        if (staleCards.has(card.name) && isLastTurn) score += 50;

        // ── Combo protection penalty ───────────────────────────────────────
        if (comboProtected.has(card.name) && !isLastTurn) {
          const spacesWon = winsAfter;
          if (spacesWon < 2) {
            const partnerCombo = comboNames.find(([a,b]) =>
              (a === card.name || b === card.name) &&
              hand.some(c => c.name !== card.name && (c.name === a || c.name === b))
            );
            if (partnerCombo) score -= isPenultimate ? 30 : 70;
          }
        }

        // ── Player space pattern: contest the player's favourite space ─────
        // If we know the player prefers a certain space and we're losing/neutral,
        // slightly favour placing there to contest it (unless we'd lose value).
        if (playerFavouriteSpace !== -1 && sp === playerFavouriteSpace && matchState !== 'winning') {
          const sc = computeSpaceScore(sp);
          if (sc.winner !== 1) score += 18; // mild bonus to contest their favourite
        }

        // ── Lookahead: 2-ply with pruning ─────────────────────────────────
        if (!isLastTurn && hand.length > 1) {
          score += aiLookahead(card, sp, sl, matchState);
        }

        // ── [Mejorado] intención de ganar la PARTIDA: cuánto sube la probabilidad de ganar 2 de 3 ──
        score += iaGananciaPartida(card, sp, sl);
        if (G.turn === 1) score += Math.random() * 12;   // un poco de variedad en la apertura

        if (score > bestScore) {
          bestScore = score;
          bestCard = card; bestSp = sp; bestSl = sl;
        }
      }
    }
  }

  if (!bestCard) return null;
  return { cardName: bestCard.name, spaceIdx: bestSp, slotIdx: bestSl };
}

// ── Lookahead: 2-ply with pruning ─────────────────────────────────────────────
// Ply 1: AI places card at (sp, sl). Ply 2: AI finds best follow-up from remaining hand.
// Pruning: only top-3 ply-1 candidates go to ply-2 to avoid browser freeze.
// matchState passed in to discount future gains less when losing (more urgent).
function aiLookahead(card, sp, sl, matchState) {
  const space = G.spaces[sp];
  space.slots[1][sl] = card;

  const remainingHand = G.hands[1].filter(c => c !== card);
  if (!remainingHand.length) {
    space.slots[1][sl] = null;
    return 0;
  }

  // ── Ply 1 score: how good is the board after THIS placement ───────────────
  const winsAfterPly1 = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;

  // ── Ply 2: find best follow-up among top candidates (pruned) ──────────────
  // Collect all ply-2 candidate scores (lightweight: only win-count delta)
  const ply2Candidates = [];
  for (const nextCard of remainingHand) {
    for (let nsp = 0; nsp < 3; nsp++) {
      const nspace = G.spaces[nsp];
      if (nspace.blocked || isRealSpace(nsp)) continue;
      for (let nsl = 0; nsl < nspace.slotCount[1]; nsl++) {
        if (nspace.slots[1][nsl]) continue;
        nspace.slots[1][nsl] = nextCard;
        const winsAfterPly2 = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
        nspace.slots[1][nsl] = null;
        const sc2 = computeSpaceScore(nsp);
        let fs = (winsAfterPly2 - winsAfterPly1) * 80;
        if (sc2.winner === 0) fs += 15; // contesting a losing space is good future setup
        ply2Candidates.push(fs);
      }
    }
  }

  space.slots[1][sl] = null;

  if (!ply2Candidates.length) return 0;

  // Best ply-2 outcome (the AI will play optimally on its next turn)
  const bestPly2 = Math.max(...ply2Candidates);

  // Discount: future gain is uncertain. Less discount when desperate (losing).
  const discount = matchState === 'losing' ? 0.45 : 0.30;
  return bestPly2 > 0 ? Math.round(bestPly2 * discount) : 0;
}

function aiScorePlacement(card, sp, sl, playerSpaceIdx) {
  const space = G.spaces[sp];
  let score = 0;

  // Simulate placement
  space.slots[1][sl] = card;

  // Core: spaces won after vs before placement
  const winsAfter = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
  space.slots[1][sl] = null;
  const winsBefore = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
  space.slots[1][sl] = card;
  score += (winsAfter - winsBefore) * 100;

  // Score in this specific space
  const sc = computeSpaceScore(sp);
  if (sc.winner === 1) score += 40;
  else if (sc.winner === -1) score += 10;
  score += Math.min(sc.p1 - sc.p0, 20);

  const cardVal = card.baseValue || 0;

  // ── Conocimiento de cartas reveladas del jugador ───────────────────────────
  const seen = G.seenPlayerCards || [];

  // ── Inferencia probabilística: estimar si el jugador PODRÍA tener ciertas cartas ──
  // Si nunca se ha visto una carta peligrosa pero tampoco está en el tablero,
  // la IA asume que existe cierta probabilidad de que el jugador la tenga en mano.
  // Esto hace que la IA sea más cautelosa incluso antes de ver las cartas rivales.
  const playerHandSize = G.hands[0].length;
  const playerCardsOnBoard = G.spaces.flatMap(s => s.slots[0].filter(c => c)).length;
  const totalPlayerCards = playerHandSize + playerCardsOnBoard;

  // Cards on board (player side, any space)
  const playerBoardNames = new Set(
    G.spaces.flatMap(s => s.slots[0].filter(c => c && !c.faceDown).map(c => c.name))
  );

  // Dangerous reveal cards the player might have (not seen, not on board)
  const dangerousUnseenCards = ['Feruzu','Kakomi','Abaki','Tanozo','Ramia','Kope','Hobu'].filter(name =>
    !seen.includes(name) && !playerBoardNames.has(name)
  );
  // If hand is non-empty and we haven't seen much, assume generic threat in contested spaces
  const contestedSpaceRisk = (playerHandSize > 1 && dangerousUnseenCards.length > 0) ? 15 : 0;
  // Extra caution: if player has many unseen cards, pile-in spaces have higher risk
  if (contestedSpaceRisk > 0 && space.slots[0].some(c => c)) {
    score -= contestedSpaceRisk;
  }
  // Player has Feruzu on board → AI V1 cards here without bonus are at risk
  const playerHasFeruzuOnBoard = G.spaces[sp].slots[0].some(c => c && !c.faceDown && c.name === 'Feruzu' && !c.effectDisabled);
  if (playerHasFeruzuOnBoard && card.baseValue === 1 && !(card.powerBonus||0)) {
    score -= 70; // will be removed by Feruzu if already revealed
  }
  // Player has Kakomi on board → AI V1 cards with bonus are at risk here
  const playerHasKakomiOnBoard = G.spaces[sp].slots[0].some(c => c && !c.faceDown && c.name === 'Kakomi' && !c.effectDisabled);
  if (playerHasKakomiOnBoard && card.baseValue === 1 && (card.powerBonus||0) > 0) {
    score -= 70;
  }
  // Player has used Abaki before → they may use it again; avoid piling into their spaces
  if (seen.includes('Abaki') && space.slots[0].some(c => c)) {
    score -= 20;
  }
  // Player has Kope on board → if we don't place here, our V1 allies are at risk
  const playerHasKopeOnBoard = G.spaces[sp].slots[0].some(c => c && !c.faceDown && c.name === 'Kope' && !c.effectDisabled);
  if (playerHasKopeOnBoard && card.baseValue === 1) {
    // Kope fires only if rival (AI) didn't place here — placing here neutralises Kope
    score += 60;
  }
  // Player has revealed Tanozo before → placing here when player places too loses our effect
  // Only penalise if Tira is active (AI can see where player placed this turn)
  if (seen.includes('Tanozo') && hasTiraActive(1) && space.slots[0].some(c => c && c._placedThisTurn)) {
    if (card.type === 'reveal') score -= 35;
  }
  // ── End player knowledge ───────────────────────────────────────────────────
  if (card.name === 'Kope') {
    const alliedV1 = [0,1,2].some(ks =>
      G.spaces[ks].slots[1].some(c => c && c !== card && !c.faceDown && c.baseValue === 1)
    );
    if (alliedV1) score -= 200;
    if (playerSpaceIdx !== null && playerSpaceIdx !== sp) score += 30;
  }

  // Gena: useless if no allies on board to receive the +1
  if (card.name === 'Gena') {
    const alliesOnBoard = G.spaces.some(sp2 => sp2.slots[1].some(c => c && !c.faceDown && c !== card));
    if (!alliesOnBoard) score -= 500;
  }

  // Feruzu: bonus solo si hay 2+ rivales V1 sin potenciar visibles aquí
  if (card.name === 'Feruzu') {
    const ferzTargets = space.slots[0].filter(c => c && !c.faceDown && c.baseValue === 1 && !(c.powerBonus||0) && !(c.existBonus||0)).length;
    if (ferzTargets >= 2) score += ferzTargets * 35;
    else score -= 150;
  }

  // Kakomi: bonus solo si hay 2+ rivales V1 potenciados visibles aquí
  if (card.name === 'Kakomi') {
    const kakoTargets = space.slots[0].filter(c => c && !c.faceDown && c.baseValue === 1 && (c.powerBonus||0) > 0).length;
    if (kakoTargets >= 2) score += kakoTargets * 35;
    else score -= 150;
  }

  // Mugon: prefer spaces with allies to protect
  if (card.name === 'Mugon') {
    score += space.slots[1].filter(c => c && c !== card).length * 20;
  }

  // En + Slau combo awareness
  const enOnField = G.spaces.some(s => s.slots[1].some(c => c && !c.faceDown && c.name === 'En' && !c.effectDisabled));
  const slauOnField = G.spaces.some(s => s.slots[1].some(c => c && !c.faceDown && c.name === 'Slau' && !c.effectDisabled));
  const enInHand = G.hands[1].some(c => c !== card && c.name === 'En');
  const slauInHand = G.hands[1].some(c => c !== card && c.name === 'Slau');

  if (card.name === 'En') {
    // Slau already on field in this space → great combo spot
    if (slauOnField && space.slots[1].some(c => c && c.name === 'Slau' && !c.faceDown)) score += 80;
    // Slau in hand → prefer same space we'd play Slau (any space, just boost En generally)
    else if (slauInHand) score += 40;
  }
  if (card.name === 'Slau') {
    // En already on field in this space → great combo spot
    if (enOnField && space.slots[1].some(c => c && c.name === 'En' && !c.faceDown)) score += 80;
    // En in hand → boost playing Slau in any space as setup
    else if (enInHand) score += 40;
  }

  // Nasu: strongly prefer placing in "más cartas con menos valor" space
  // Nasu (V0) is ideal there: forces rival to also be there, and as a V0 it counts as "menos valor"
  if (card.name === 'Nasu') {
    if (space.effectRevealed && space.effectText && space.effectText.includes('más cartas con menos valor')) {
      score += 200; // strong bonus — Nasu is tailor-made for this space
    }
  }

  // ── Reveal effect value estimation ────────────────────────────────────────
  // Only applies if card is type 'reveal' and hasn't fired yet
  if (card.type === 'reveal' && !card.revealUsed) {
    const rivals      = space.slots[0].filter(c => c && !c.faceDown);
    const rivalsAll   = G.spaces.flatMap(s => s.slots[0].filter(c => c && !c.faceDown));
    const alliesHere  = space.slots[1].filter(c => c && c !== card && !c.faceDown);
    const alliesAll   = G.spaces.flatMap(s => s.slots[1].filter(c => c && c !== card && !c.faceDown));
    // AI can only "see" where the player placed this turn if it has Tira active.
    // Without Tira, _placedThisTurn is completely hidden — the AI cannot use it.
    const aiHasTiraActive = hasTiraActive(1);
    const playerPlacedHere = aiHasTiraActive
      ? space.slots[0].some(c => c && c._placedThisTurn)
      : false; // without Tira the AI genuinely doesn't know where the player just played
    const handSize    = G.hands[1].length;
    // Su active means AI's condMet cards fire unconditionally
    const aiSuActive  = G.spaces.some(s => s.slots[1].some(c => c && c.name === 'Su' && !c.faceDown && !c.effectDisabled));
    // Space slot fullness: both sides filled = rival very likely placed here
    const spaceFilledForRival = space.slots[0].filter(c => c).length >= space.slotCount[0];
    // Does AI have Su or Tira in hand (hasn't played them yet)?
    const aiHasSuInHand   = G.hands[1].some(c => c !== card && c.name === 'Su');
    const aiHasTiraInHand = G.hands[1].some(c => c !== card && c.name === 'Tira');

    switch (card.name) {
      // Gena: +1 to an ally — best if there's already an ally on the board
      case 'Gena':
        if (alliesAll.length > 0) score += 40;
        break;

      // Abaki: +2 if rival placed here — great in contested spaces
      // Without Tira: AI doesn't know where player will place; use heuristic based on visible board state
      case 'Abaki':
        if (aiHasTiraActive && playerPlacedHere) score += 80;
        else score += rivals.length > 0 ? 30 : 5; // guess based on existing rival presence
        // If the AI still has Su or Tira unplayed, encourage playing those first
        if (!aiHasTiraActive && !aiSuActive && (aiHasSuInHand || aiHasTiraInHand)) {
          score -= 40;
        }
        // Nasu de la IA en este espacio → jugador forzado a venir aquí → condición casi garantizada
        if (space.slots[1].some(c => c && c !== card && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)) {
          score += 90;
        }
        break;

      // Hobu: disable exist effects of rival cards here if rival did NOT place this turn
      case 'Hobu': {
        const rivalExistHere = G.spaces[sp].slots[0].filter(c => c && !c.faceDown && !c.effectDisabled && c.type === 'exist' && c.name !== 'Reki').length;
        // With Tira active, AI knows exactly where player placed — avoid same space
        if (aiHasTiraActive && playerPlacedHere) {
          // Player placed here → Hobu condition won't be met → bad placement
          score -= 60;
        } else if (rivalExistHere > 0 && !playerPlacedHere) {
          score += 60; // confident condition will be met AND there are exist cards to disable
        } else if (rivalExistHere > 0) {
          score += 15; // exist targets present but uncertain if player placed here
        } else {
          score += 2;  // no targets — low value
        }
        // Nasu de la IA en OTRO espacio → jugador forzado allí, no aquí → condición de Hobu garantizada aquí
        {
          const aiNasuElsewhere = [0,1,2].some(nsp =>
            nsp !== sp &&
            G.spaces[nsp].slots[1].some(c => c && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)
          );
          if (aiNasuElsewhere) score += 80;
        }
        break;
      }

      // Zao: +1 per rival here — reward playing into contested spaces
      case 'Zao': {
        const knownRivals = rivals.length;
        score += knownRivals * 40;
        // Even if no rival visible, they might place here
        if (knownRivals === 0) score += 10;
        break;
      }

      // Feruzu: remueve V1 sin potenciar — solo vale con 2+ objetivos
      case 'Feruzu': {
        // Avoid space where characters cannot be removed (effect is wasted)
        if (space.effectRevealed && space.effectText && space.effectText.includes('no pueden ser removidos')) {
          // Allow only if AI would win this space by raw value alone (without Feruzu's remove effect)
          const wouldWinByValue = computeSpaceScore(sp).winner === 1;
          if (!wouldWinByValue) { score -= 500; break; }
        }
        const targets = rivals.filter(c => c.baseValue === 1 && !(c.powerBonus||0) && !(c.existBonus||0));
        if (targets.length < 2) score -= 200;
        else if (targets.length === 2) score += 120;
        else score += 240;
        if (G.turn === G.maxTurns && targets.length >= 1) {
          const saved = targets.map(t => ({ c: t, slot: space.slots[0].indexOf(t) }));
          saved.forEach(({ c, slot }) => { if (slot !== -1) space.slots[0][slot] = null; });
          const winsAfter = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
          saved.forEach(({ c, slot }) => { if (slot !== -1) space.slots[0][slot] = c; });
          if (winsAfter > winsBefore) score += (winsAfter - winsBefore) * 150;
        }
        break;
      }

      // Kakomi: remueve V1 potenciados — solo vale con 2+ objetivos
      case 'Kakomi': {
        // Avoid space where characters cannot be removed (effect is wasted)
        if (space.effectRevealed && space.effectText && space.effectText.includes('no pueden ser removidos')) {
          const wouldWinByValue = computeSpaceScore(sp).winner === 1;
          if (!wouldWinByValue) { score -= 500; break; }
        }
        const targets = rivals.filter(c => c.baseValue === 1 && ((c.powerBonus||0) + (c.existBonus||0)) > 0);
        if (targets.length < 2) score -= 200;
        else if (targets.length === 2) score += 120;
        else score += 240;
        if (G.turn === G.maxTurns && targets.length >= 1) {
          const saved = targets.map(t => ({ c: t, slot: space.slots[0].indexOf(t) }));
          saved.forEach(({ c, slot }) => { if (slot !== -1) space.slots[0][slot] = null; });
          const winsAfter = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
          saved.forEach(({ c, slot }) => { if (slot !== -1) space.slots[0][slot] = c; });
          if (winsAfter > winsBefore) score += (winsAfter - winsBefore) * 150;
        }
        break;
      }

      // Tanozo: remove rival's effects if they placed here
      case 'Tanozo':
        if (playerPlacedHere) {
          // Worth more against high-value effect cards
          const effectRivals = rivals.filter(c => c.type !== 'special');
          score += effectRivals.length * 50;
        } else score += rivals.length > 0 ? 15 : 0;
        // Nasu de la IA en este espacio → jugador forzado aquí → condición garantizada
        if (space.slots[1].some(c => c && c !== card && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)) {
          score += 80;
        }
        break;

      // Foret: +1 per card in hand
      case 'Foret':
        score += handSize * 18;
        break;

      // Nofi: place Ery in another space if rival didn't place here
      case 'Nofi':
        if (!playerPlacedHere) {
          const freeOtherSpace = [0,1,2].some(i => i !== sp &&
            !G.spaces[i].blocked && G.spaces[i].slots[1].some((c,si) => !c && si < G.spaces[i].slotCount[1]));
          if (freeOtherSpace) score += 60;
        } else score -= 20; // fires only if rival didn't place here — penalise if they're already here
        // Nasu de la IA en OTRO espacio → jugador forzado allí, no aquí → condición de Nofi garantizada
        {
          const aiNasuElsewhere = [0,1,2].some(nsp =>
            nsp !== sp &&
            G.spaces[nsp].slots[1].some(c => c && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)
          );
          if (aiNasuElsewhere) score += 80;
        }
        break;

      // Kope: already handled above — avoid if allied V1s elsewhere
      // (no additional scoring needed here)

      // Gran Demonio: can move itself + ally to better space — useful if losing here
      case 'Gran Demonio':
        if (sc.winner !== 1 && alliesHere.length > 0) score += 45;
        else if (sc.winner !== 1) score += 20;
        break;

      // Yukoi: next turn a placed ally gets +1 — better early game
      case 'Yukoi':
        score += G.turn < G.maxTurns ? 35 : 0;
        break;

      // Faun: +1 si es el último turno. Fuera del último turno (6 o 7), su efecto no se activa,
      // así que penalizamos fuertemente a menos que ya gane el espacio sin el bonus,
      // o que no haya opciones mejores (el score global compara todas las opciones).
      case 'Faun':
        if (G.turn === G.maxTurns) {
          score += 60; // último turno: efecto activo, gran bonus
        } else if (G.turn === G.maxTurns - 1) {
          // Penúltimo turno: Faun sin efecto todavía — sólo aceptable si gana el espacio
          if (sc.winner === 1) score += 10;
          else score -= 200;
        } else {
          // Turno temprano: Faun es un desperdicio si no gana el espacio
          if (sc.winner === 1) score -= 20; // tolerable si ya ganamos igualmente
          else score -= 350; // fuerte penalización
        }
        break;

      // Mega: +1 to each ally in a space we're losing
      case 'Mega': {
        const losingAllies = G.spaces.flatMap((s,i) => {
          if (i === sp) return [];
          const sc2 = computeSpaceScore(i);
          if (sc2.winner !== -1 && sc2.winner !== 0) return []; // we're not losing
          return s.slots[1].filter(c => c && !c.faceDown && c.baseValue === 1);
        });
        score += losingAllies.length * 40;
        break;
      }

      // Noira: return an ally to hand; if V1, +1 value
      case 'Noira':
        if (alliesHere.length > 0) {
          const v1ally = alliesHere.find(c => c.baseValue === 1);
          score += v1ally ? 50 : 25; // V1 gives extra +1
        }
        break;

      // Menmei: draw V0+V1 from deck
      case 'Menmei':
        score += G.deck.some(c => c.baseValue === 0) && G.deck.some(c => c.baseValue === 1) ? 55 : 20;
        break;

      // Ramia: steal a card from rival's hand if rival played here
      // Only confident when: Tira active (AI sees player's spot), Su active (bypasses condition),
      // or the rival's side of this space is already full (likely placed here).
      case 'Ramia': {
        const rivalHereConfirmed = aiHasTiraActive && playerPlacedHere;
        const condLikelyMet = rivalHereConfirmed || aiSuActive || spaceFilledForRival;
        if (condLikelyMet && G.hands[0].length > 0) {
          score += 55;
        } else {
          // Low confidence — heavily penalise; save Ramia for a better turn
          score -= 40;
        }
        // If the AI still has Su or Tira unplayed, strongly encourage playing those first
        if (!aiHasTiraActive && !aiSuActive && (aiHasSuInHand || aiHasTiraInHand)) {
          score -= 60; // defer Ramia until Su/Tira is on the field
        }
        // Nasu de la IA en este espacio → jugador forzado aquí → condición de Ramia garantizada
        if (space.slots[1].some(c => c && c !== card && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled)) {
          score += 90;
        }
        break;
      }

      // Henos: both discard a random V1 — slightly positive if rival has V1, neutral otherwise
      case 'Henos': {
        const theirV1 = ziruActive(1) ? G.hands[0].filter(c => c.baseValue === 1).length : (G.hands[0].length > 0 ? 1 : 0);   // [Mejorado] sin Ziru no ve la mano rival
        const ourV1   = G.hands[1].filter(c => c !== card && c.baseValue === 1).length;
        // Worth more if rival has V1 (we discard 1 each — symmetric disruption)
        if (theirV1 > 0) score += 25;
        if (ourV1 === 0) score += 15; // we have nothing to lose
        break;
      }

      // Naiki: both discard 2 from deck — symmetric, slight positive (disruption)
      case 'Naiki':
        score += 15;
        break;

      // Peroth: recycle a V1 from discard — good if discard has useful cards
      case 'Peroth': {
        const v1inDiscard = G.discard.filter(c => c.baseValue === 1).length;
        score += v1inDiscard > 0 ? 50 : 5;
        break;
      }

      // Nugu: give rival an ErizoPeluche here — disruption
      case 'Nugu':
        score += 30;
        break;

      // Fukou: rival draws ErizoPeluche next turn — mild disruption
      case 'Fukou':
        score += 20;
        break;
    }
  }
  // ── End reveal effect scoring ──────────────────────────────────────────────
  if (cardVal === 0 && card.name !== 'Resta' && sc.winner !== 1) score += 15;

  // Reki: prioritise placing in Real space if it would win it
  if (card.name === 'Reki' && isRealSpace(sp)) {
    space.slots[1][sl] = card;
    const sc2 = computeSpaceScore(sp);
    space.slots[1][sl] = null;
    if (sc2.winner === 1) score += 120;
    else score += 20; // still worth trying
  }

  // Roloc: play if simulating it winning at least one more space
  if (card.name === 'Roloc') {
    // Don't play Roloc until at least 2 spaces are revealed (effect is unknown/unreliable before that)
    const revealedSpaceCount = G.spaces.filter(s => s.effectRevealed).length;
    if (revealedSpaceCount < 2) {
      score -= 500; // strongly discourage until enough spaces are revealed
    } else {
      // Simulate Roloc active: how many spaces would AI win?
      space.slots[1][sl] = card;
      const winsWithRoloc = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
      space.slots[1][sl] = null;
      if (winsWithRoloc > winsBefore) score += (winsWithRoloc - winsBefore) * 80;
      else score -= 40; // discourage if no gain
    }
  }

  // Imi: worth more when there are tied spaces (global effect)
  if (card.name === 'Imi') {
    const tiedSpaces = [0,1,2].filter(i => computeSpaceScore(i).winner === -1).length;
    score += tiedSpaces * 60;
    if (sc.winner === -1) score += 40;
  }

  // Iona: worth more in spaces with blocked/fewer slots (more empty slots to count)
  if (card.name === 'Iona') {
    const totalEmpty = [0,1,2].reduce((acc, i) => {
      const sp2 = G.spaces[i];
      // Count nulls + beyond-slotCount slots for AI side
      let e = 0;
      for (let sl2 = 0; sl2 < 3; sl2++) {
        if (!sp2.slots[1][sl2] || sl2 >= sp2.slotCount[1]) e++;
      }
      return acc + e;
    }, 0);
    score += totalEmpty * 15;
    // Extra bonus for single-slot spaces (Sólo hay un hueco aquí)
    const isSingleSlot = space.effectRevealed && space.effectText.includes('un hueco');
    if (isSingleSlot) score += 60;
  }

  // Resta: best in spaces with Real (wins those), or spaces we can't win by value
  if (card.name === 'Resta') {
    if (isRealSpace(sp)) score += 120; // Resta wins Real spaces outright
    else if (sc.winner === 0) score += 60; // we're losing this space — Resta neutralises it
    else if (sc.winner === -1) score += 20; // tie — Imi could still win it
    else score -= 40; // we're winning — Resta would hurt us
    // If AI also has Imi in hand, Resta becomes much better
    if (G.hands[1].some(c => c !== card && c.name === 'Imi')) score += 50;
  }

  // Usei: worth more when we have Kope or Nugu to remove rival V1s (triggering Usei → Real)
  if (card.name === 'Usei') {
    const hasKopeInHand = G.hands[1].some(c => c !== card && c.name === 'Kope');
    const hasNuguInHand = G.hands[1].some(c => c !== card && c.name === 'Nugu');
    const alliedV1Here  = space.slots[1].filter(c => c && c !== card && c.baseValue === 1).length;
    if ((hasKopeInHand || hasNuguInHand) && alliedV1Here > 0) score += 70;
  }

  // Penalizar cartas de tipo 'exist' en el espacio "Los efectos de existir no funcionan aquí"
  // Su efecto es completamente inútil allí. Excepción: si la carta gana el espacio por valor puro,
  // o si no hay ninguna otra colocación válida (se maneja fuera con el score global).
  if (space.effectRevealed && space.effectText && space.effectText.includes('Los efectos de existir no funcionan aquí')) {
    if (card.type === 'exist') {
      const wouldWinByValue = sc.winner === 1;
      if (!wouldWinByValue) score -= 350;
    }
  }

  // [Nuevo] Realidad de Tis: la primera carta de cada jugador aquí se extingue — la IA lo evita si aún no la ha «pagado»
  if (space.effectRevealed && space.effectText && space.effectText.includes('es extinguida') && !(space._tisUsado && space._tisUsado[1])) score -= 150;
  // Avoid extinction spaces for V0 cards
  if (space.effectRevealed && space.effectText.includes('se extinguen')) {
    if (cardVal === 0 && card.name !== 'Reki') {
      score -= 120;
    }
  }

  // Evitar colocar V1 en espacios "más cartas con menos valor" — el valor alto perjudica
  if (space.effectRevealed && space.effectText && space.effectText.includes('más cartas con menos valor')) {
    if (card.baseValue === 1) score -= 180;
  }

  // Evitar colocar V1 en espacios "más cartas de valor 0 tenga" — las V1 no contribuyen al recuento
  // Solo tolerado si no hay ninguna otra opción mejor (el sistema de puntuación global lo garantiza).
  if (space.effectRevealed && space.effectText && space.effectText.includes('más cartas de valor 0 tenga')) {
    if (card.baseValue === 1) {
      // Penalizar fuertemente, pero no absoluto: si ganar el espacio exige una V1 (sin alternativa),
      // el score global la elegirá igualmente al no haber mejores candidatos.
      if (sc.winner === 1) score -= 80;   // ya ganamos con ella: penalización moderada (ocupa hueco útil)
      else score -= 250;                  // no gana nada: fuerte penalización
    }
    // ── Prioridad V0 y Tei en espacio "más cartas de valor 0 tenga" ──────────
    // Las cartas V0 son las únicas que puntúan aquí. Bonus fuerte para priorizarlas.
    if (card.baseValue === 0) {
      // Calcular cuántas V0 propias hay ya en este espacio vs las del rival
      const myV0Here    = space.slots[1].filter(c => c && c !== card && (c.baseValue === 0 || c._teiForced0)).length;
      const rivalV0Here = space.slots[0].filter(c => c && (c.baseValue === 0 || c._teiForced0)).length;
      // Bonus base por ser V0 en el espacio correcto
      score += 200;
      // Bonus adicional si colocar aquí nos pone por delante o empata en conteo de V0
      if (myV0Here + 1 > rivalV0Here) score += 80;   // pasamos a liderar el recuento
      else if (myV0Here + 1 === rivalV0Here) score += 40; // empatamos el recuento
    }
    // Tei es una carta V0 tipo reveal que puede transformar una V1 en V0 en otro espacio.
    // Colocarla en el espacio de valor 0 la añade al conteo Y deja abierta su habilidad de revelar.
    if (card.name === 'Tei') {
      score += 120; // bonus extra sobre el V0 base — Tei es ideal aquí
    }
  }

  // Unique space: "Solo puede haber una carta de Valor 0 y una de Valor 1"
  // Penalizar si ya hay una carta del mismo valor, a menos que colocarla haga ganar o empatar el espacio.
  // Exceptions: Rasu, Neutra, Gran Demonio (they reposition things).
  if (space.effectRevealed && getActiveEffects(sp).some(e => e.includes('Solo puede haber una carta'))) {
    const isException = ['Rasu', 'Neutra', 'Gran Demonio'].includes(card.name);
    if (!isException) {
      const alreadySameValue = space.slots[1].some(c => c && c !== card && c.baseValue === card.baseValue);
      if (alreadySameValue) {
        // Sólo permitir si con esta carta ganamos (preferible) o empatamos el espacio
        if (sc.winner === 1) score -= 50;       // ganar: penalización leve (preferible pero no ideal)
        else if (sc.winner === -1) score -= 200; // empatar: penalización moderada
        else score -= 9999;                      // perder: totalmente prohibido
      }
      // Also block if both value types already occupied and no win possible
      const hasV0 = space.slots[1].some(c => c && c !== card && c.baseValue === 0);
      const hasV1 = space.slots[1].some(c => c && c !== card && c.baseValue === 1);
      if (hasV0 && hasV1) score -= 9999;
    }
  }

  // Last turn: raw power matters more
  if (G.turn === G.maxTurns) score += sc.p1 * 2;

  // Anticipación de fin de partida: penultimate turn also starts caring about contested spaces
  if (G.turn >= G.maxTurns - 1 && G.turn < G.maxTurns) {
    if (sc.winner === 0 || sc.winner === -1) score += 25; // losing or tied — priority
    score += Math.min(sc.p1 - sc.p0, 12); // raw margin matters more
  }

  // Gestión de huecos: slightly penalise piling into an already-won space with nothing to gain
  if (G.turn < G.maxTurns && sc.winner === 1 && winsAfter === winsBefore) {
    score -= 20;
  }

  // Su / Tira priority: if the AI has condMet-dependent cards in hand (Ramia, Abaki)
  // and hasn't yet activated Su or Tira, boost the score of playing Su or Tira now
  if (card.name === 'Su' || card.name === 'Tira') {
    const hasCondMetCard = G.hands[1].some(c =>
      c !== card && (c.name === 'Ramia' || c.name === 'Abaki')
    );
    if (hasCondMetCard && !hasTiraActive(1) && !G.spaces.some(s => s.slots[1].some(c2 => c2 && c2.name === 'Su' && !c2.faceDown && !c2.effectDisabled))) {
      score += 55; // prioritise getting Su/Tira on the board before using condition cards
    }
  }

  // Slight bonus for responding to Tira reveal
  if (playerSpaceIdx !== null && sp === playerSpaceIdx) score += 5;

  // Rasu penalty: placing Rasu in a space where cards cannot be moved is useless
  if (card.name === 'Rasu' && space.effectRevealed && space.effectText &&
      space.effectText.includes('Las cartas en este espacio no pueden ser movidas')) {
    score -= 9999;
  }

  // Restore
  space.slots[1][sl] = null;
  return score;
}

// ══════════════════════════════════════════════════════════
//  RESOLVE PHASE
// ══════════════════════════════════════════════════════════
async function resolvePhase() {
  G.phase = 'resolve';
  render();
  await gameSleep(600);

  // Clear explorer and pre-reveal immunity flags from previous placements
  for (let sp = 0; sp < 3; sp++)
    for (let s = 0; s < 2; s++)
      for (let sl = 0; sl < 3; sl++) {
        const c = G.spaces[sp].slots[s][sl];
        if (c) { }
      }

  // Clear Yukoi pending if its active turn has passed
  if (G.pending_yukoi && G.turn > G.pending_yukoi.activeTurn) {
    G.pending_yukoi = null;
  }

  // 1. Demae: move V1 cards placed this turn BEFORE reveals
  // 5b. Demae: move ALL V1 cards placed this turn (both sides) to an adjacent space
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    // "Las cartas en este espacio no pueden ser movidas." — Demae cannot move cards out of this space
    if (space.effectRevealed && space.effectText && space.effectText.includes('Las cartas en este espacio no pueden ser movidas')) continue;
    // Check if any Demae is face-up here (either side), placed before this turn
    const demaeOwner = [0,1].find(side =>
      space.slots[side].some(c => c && c.name === 'Demae' && !c.effectDisabled && !c._placedThisTurn)
    );
    if (demaeOwner === undefined) continue;

    // Collect ALL V1 cards placed this turn in this space (both sides, excluding Demae)
    const targets = [];
    for (let side = 0; side < 2; side++)
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (c && c._placedThisTurn && c.name !== 'Demae' && c.baseValue === 1)
          targets.push({ c, side, sl });
      }
    if (targets.length === 0) continue;

    for (const { c, side, sl } of targets) {
      // Adjacent spaces with a free slot for this card's side
      const adjacent = [sp-1, sp+1].filter(i => i >= 0 && i < 3 && !G.spaces[i].blocked && !isRealSpace(i)
        && G.spaces[i].slots[side].some((x, si) => x === null && si < G.spaces[i].slotCount[side]));
      if (adjacent.length === 0) continue;

      let dest = null;
      // The owner of the MOVED CARD decides destination (not Demae's owner)
      if (rdEligeHumano(side)) {
        // Player's card being moved — player chooses
        dest = await chooseSpace(adjacent, `Demae: elige espacio adyacente para mover ${c.displayName||c.name}`);
      } else {
        // Demae's owner is AI — AI picks best destination
        let best = -Infinity;
        for (const i of adjacent) {
          const f = G.spaces[i].slots[side].findIndex((x, si) => x === null && si < G.spaces[i].slotCount[side]);
          if (f === -1) continue;
          space.slots[side][sl] = null;
          G.spaces[i].slots[side][f] = c;
          const wins = [0,1,2].filter(j => computeSpaceScore(j).winner === 1).length;
          G.spaces[i].slots[side][f] = null;
          space.slots[side][sl] = c;
          if (wins > best) { best = wins; dest = i; }
        }
        if (dest === null) dest = adjacent[0];
      }
      if (dest !== null) {
        const ds = G.spaces[dest];
        const f = ds.slots[side].findIndex((x, si) => x === null && si < ds.slotCount[side]);
        if (f !== -1) {
          animateCardFromSlot(sp, side, sl, `space-${dest}`);
          space.slots[side][sl] = null;
          c._movedThisTurn = true;
          // If card was effectDisabled by "existir no funciona" in source space, re-enable it when leaving
          if (c.type === 'exist' && c.name !== 'Reki' && c.effectDisabled &&
              space.effectRevealed && space.effectText && space.effectText.includes('Los efectos de existir no funcionan aquí')) {
            c.effectDisabled = false;
          }
          ds.slots[side][f] = c;
          // If destination space has "existir no funciona", disable the exist card
          if (c.type === 'exist' && c.name !== 'Reki' && !c.effectDisabled &&
              ds.effectRevealed && ds.effectText && ds.effectText.includes('Los efectos de existir no funcionan aquí')) {
            c.effectDisabled = true;
          }
          checkHanoe(side, dest);
          addLog(`Demae: ${c.displayName||c.name} se mueve a E${[1,2,3][dest]}.`, 'effect');
          // Reina hito: track if player's Reina was moved by Demae
          if (side === 0 && G.unlockProgress && c.name === 'Reina') {
            G.unlockProgress._reinaWasMoved = true;
          }
          render();
          await gameSleep(400);
        }
      }
    }
  }


  // 2. Determine reveal order
  const first = whoRevealFirst();
  const second = 1 - first;

  // 3. Reveal cards in order
  for (const owner of [first, second]) {
    await revealOwnerCards(owner);
  }

  // 4. Space effects were already applied at game start (spaces always revealed)

  // 5. Apply exist effects
  _existSoundEnabled = true;
  applyExistEffects();
  _existSoundEnabled = false;
  // Play valor-up sound if any exist-type card granted a positive value bonus this turn
  (function _existValorUpSound() {
    const valorUpCards = new Set(['Yiren','Gae','Tis','Ery','Iona','Ponce','Kaeka','Etza','En','Gena','Faun','Zao','Foret','Yiren']);
    for (let sp = 0; sp < 3; sp++) {
      for (let side = 0; side < 2; side++) {
        for (const c of G.spaces[sp].slots[side]) {
          if (c && !c.faceDown && valorUpCards.has(c.name) && ((c.existBonus||0) > 0)) {
            playSound('valorUp');
            return;
          }
        }
      }
    }
  })();
  render();
  await gameSleep(600);

  // 5b. Slot overflow enforcement (Filia and single-slot space effect)
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];

    // Filia especial: si ambos lados tienen 3 cartas cuando Filia quita el tercer hueco,
    // ambos descartan una carta de ese espacio y la restante se mueve al hueco libre.
    const filiaPresent = space.slots[0].some(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled)
                      || space.slots[1].some(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled);
    if (filiaPresent) {
      for (let side = 0; side < 2; side++) {
        const filiaOwnSide = space.slots[side].some(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled);
        // Si Filia está en el tercer hueco (slot índice 2) en cualquier lado y hay un hueco libre en ese lado
        const filiaInThird = space.slots[side].findIndex(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled) === 2;
        if (filiaInThird) {
          const freeSlot = space.slots[side].findIndex((c, i) => !c && i < 2);
          if (freeSlot !== -1) {
            space.slots[side][freeSlot] = space.slots[side][2];
            space.slots[side][2] = null;
            addLog(`Filia: se mueve al hueco ${freeSlot+1} en Espacio ${[1,2,3][sp]}.`, 'effect');
            render();
            await gameSleep(400);
          }
        }
      }
      // Si ambos lados tienen exactamente 3 cartas, cada uno descarta una carta de ese espacio
      const p0Count = space.slots[0].filter(c => c).length;
      const p1Count = space.slots[1].filter(c => c).length;
      if (p0Count >= 3 && p1Count >= 3) {
        addLog(`Filia: ambos tienen 3 cartas en Espacio ${[1,2,3][sp]} — ambos deben descartar una carta aquí.`, 'effect');
        // Jugador (side 0)
        {
          const candidates = space.slots[0].filter(c => c && c.name !== 'Reki');
          if (candidates.length > 0) {
            addLog(`Filia: elige qué carta descartar en Espacio ${[1,2,3][sp]}.`, 'important');
            const target = await pickCardFromBoard((c, si, s) => si === sp && s === 0 && candidates.includes(c), { mandatory: true });
            if (target) {
              const tIdx = space.slots[0].indexOf(target);
              space.slots[0][tIdx] = null;
              removeToDiscard(target);
              addLog(`Descartaste a ${target.name} por Filia.`, 'effect');
              if (G.unlockProgress && target.name === 'Foret') {
                const hasNugu = space.slots[0].some(c => c && c.name === 'Nugu' && !c.faceDown);
                if (hasNugu) G.unlockProgress.foretDiscardedWithNugu = true;
              }
              // Mover carta del tercer hueco al libre, si aplica
              if (space.slots[0][2]) {
                const nf = space.slots[0].findIndex((c, i) => !c && i < 2);
                if (nf !== -1) { space.slots[0][nf] = space.slots[0][2]; space.slots[0][2] = null; }
              }
            }
          }
        }
        // IA (side 1)
        {
          const filled = space.slots[1].map((c, i) => c && c.name !== 'Reki' ? { c, i } : null).filter(Boolean);
          if (filled.length > 0) {
            const scored = filled.map(({ c, i }) => {
              const savedSlots = space.slots[1].map(x => x);
              space.slots[1] = [null, null, null];
              space.slots[1][i] = c;
              const simScore = computeSpaceScore(sp);
              space.slots[1] = savedSlots;
              let keepScore = 0;
              if (simScore.winner === 1) keepScore += 10000;
              else if (simScore.winner === -1) keepScore += 3000;
              if (c.name === 'Reiza') keepScore -= 5000;
              if (c.name === 'Resta') {
                const opponentHasValue = space.slots[0].some(c2 => c2 && !c2.faceDown && c2.name !== 'Reiza' && c2.name !== 'Resta');
                if (opponentHasValue) keepScore += 2000;
              }
              keepScore += getCardPower(c);
              return { c, i, score: keepScore };
            });
            scored.sort((a, b) => a.score - b.score);
            let worst = scored[0];
            // [Nuevo] partida con un amigo: elige él qué carta descartar
            if (rdEligeHumano(1)) {
              addLog(`Elige qué carta descartar en Espacio ${[1,2,3][sp]}.`, 'important');
              const _el = await pickCardFromBoard((c, si, s) => si === sp && s === 1 && filled.some(f => f.c === c), { mandatory: true });
              const _f = filled.find(f => f.c === _el); if (_f) worst = { c: _f.c, i: _f.i };
            }
            if (!isProtected(1, sp) && !(await tryMugonSacrifice(1, worst.c))) {
              space.slots[1][worst.i] = null;
              removeToDiscard(worst.c);
              addLog(`IA descarta a ${worst.c.name} por Filia.`, 'effect');
            }
            if (space.slots[1][2]) {
              const nf = space.slots[1].findIndex((c, i) => !c && i < 2);
              if (nf !== -1) { space.slots[1][nf] = space.slots[1][2]; space.slots[1][2] = null; }
            }
          }
        }
        render();
        await gameSleep(600);
      }
    }

    for (let side = 0; side < 2; side++) {
      // Determine effective limit for this side
      let limit = space.slotCount[side];
      let cause = null;
      const filiaActive = space.slots[0].some(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled)
                        || space.slots[1].some(c => c && c.name === 'Filia' && !c.faceDown && !c.effectDisabled);
      if (filiaActive) { limit = Math.min(limit, 2); cause = 'Filia'; }
      if (space.slotCount[side] === 1) cause = cause || 'efecto de espacio';
      if (space.slotCount[side] === 2 && getActiveEffects(sp).some(e => e.includes('Solo puede haber una carta'))) cause = cause || 'efecto de espacio';
      if (!cause) continue;

      for (let sl = limit; sl < 3; sl++) {
        const overflow = space.slots[side][sl];
        if (!overflow) continue;
        if (overflow.name === 'Reki') continue; // Reki ignores all effects including Filia
        const freeSlot = space.slots[side].findIndex((c, i) => !c && i < limit);
        if (freeSlot !== -1) {
          space.slots[side][freeSlot] = overflow;
          space.slots[side][sl] = null;
          addLog(`${cause}: ${overflow.name} se mueve al hueco ${freeSlot+1} en Espacio ${[1,2,3][sp]}.`, 'effect');
          render();
          await gameSleep(400);
        } else {
          addLog(`${cause}: ${side===0?'Tú debes':'La IA debe'} descartar una carta en Espacio ${[1,2,3][sp]}.`, 'effect');
          if (side === 0) {
            const candidates = space.slots[0].filter(c => c && c.name !== 'Reki');
            addLog(`${cause}: elige qué carta descartar en Espacio ${[1,2,3][sp]}.`, 'important');
            const target = await pickCardFromBoard((c, si, s) => si === sp && s === 0 && candidates.includes(c), { mandatory: true });
            if (target) {
              const tIdx = space.slots[0].indexOf(target);
              space.slots[0][tIdx] = null;
              removeToDiscard(target);
              addLog(`Descartaste a ${target.name} por ${cause}.`, 'effect');
              // Foret hito: player discarded Foret while player's Nugu is in the same space
              if (G.unlockProgress && target.name === 'Foret') {
                const hasNugu = space.slots[0].some(c => c && c.name === 'Nugu' && !c.faceDown);
                if (hasNugu) G.unlockProgress.foretDiscardedWithNugu = true;
              }
              if (sl >= limit && space.slots[side][sl]) {
                const newFree = space.slots[side].findIndex((c, i) => !c && i < limit);
                if (newFree !== -1) { space.slots[side][newFree] = space.slots[side][sl]; space.slots[side][sl] = null; }
              }
            }
          } else {
            const filled = space.slots[1].map((c, i) => c && c.name !== 'Reki' ? { c, i } : null).filter(Boolean);
            const scored = filled.map(({ c, i }) => {
              // Simulate keeping only this card: what is the space score?
              const savedSlots = space.slots[1].map(x => x);
              space.slots[1] = [null, null, null];
              space.slots[1][i] = c; // only keep this card
              const simScore = computeSpaceScore(sp);
              space.slots[1] = savedSlots;
              // Primary: prefer to keep cards that make AI win (or at least not lose) the space
              // Secondary: prefer higher power cards
              let keepScore = 0;
              if (simScore.winner === 1) keepScore += 10000;
              else if (simScore.winner === -1) keepScore += 3000;
              if (c.name === 'Reiza') keepScore -= 5000; // Reiza rarely wins by itself
              if (c.name === 'Resta') {
                const opponentHasValue = space.slots[0].some(c2 => c2 && !c2.faceDown && c2.name !== 'Reiza' && c2.name !== 'Resta');
                if (opponentHasValue) keepScore += 2000;
              }
              keepScore += getCardPower(c);
              return { c, i, score: keepScore };
            });
            scored.sort((a, b) => a.score - b.score); // sort ascending — discard lowest keepScore
            let worst = scored[0];
            // [Nuevo] partida con un amigo: elige él qué carta descartar
            if (rdEligeHumano(1)) {
              addLog(`Elige qué carta descartar en Espacio ${[1,2,3][sp]}.`, 'important');
              const _el = await pickCardFromBoard((c, si, s) => si === sp && s === 1 && filled.some(f => f.c === c), { mandatory: true });
              const _f = filled.find(f => f.c === _el); if (_f) worst = { c: _f.c, i: _f.i };
            }
            if (isProtected(1, sp)) { addLog(`${worst.c.name} protegida (Koly).`, 'effect'); }
            else if (await tryMugonSacrifice(1, worst.c)) { /* Mugon sacrificed */ }
            else {
              space.slots[1][worst.i] = null;
              removeToDiscard(worst.c);
              addLog(`IA descarta a ${worst.c.name} por ${cause}.`, 'effect');
            }
            if (sl >= limit && space.slots[side][sl]) {
              const newFree = space.slots[side].findIndex((c, i) => !c && i < limit);
              if (newFree !== -1) { space.slots[side][newFree] = space.slots[side][sl]; space.slots[side][sl] = null; }
            }
          }
          render();
          await gameSleep(600);
        }
      }
    }
  }

  // 5c. Unique-value space effect: "único personaje de Valor 0 y uno de Valor 1"
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    const effsUniq = getActiveEffects(sp);
    if (!effsUniq.some(e => e.includes('Solo puede haber una carta'))) continue;
    for (let side = 0; side < 2; side++) {
      // Find duplicates: more than one card of the same baseValue
      for (const bv of [0, 1]) {
        const dupes = space.slots[side].map((c, i) => c && !c.faceDown && c.baseValue === bv && c.name !== 'Reki' ? { c, i } : null).filter(Boolean);
        if (dupes.length <= 1) continue;
        // Must discard down to 1 — keep the first, discard the rest
        const toDiscard = dupes.slice(1);
        const cause = 'efecto de espacio';
        addLog(`${cause}: ${side===0?'Tú debes':'La IA debe'} descartar una carta de Valor ${bv} en Espacio ${[1,2,3][sp]}.`, 'effect');
        if (side === 0) {
          const candidates = dupes.map(d => d.c);
          addLog(`${cause}: elige qué carta de Valor ${bv} descartar en Espacio ${[1,2,3][sp]}.`, 'important');
          const target = await pickCardFromBoard((c, si, s) => si === sp && s === 0 && candidates.includes(c), { mandatory: true });
          if (target) {
            const tIdx = space.slots[0].indexOf(target);
            space.slots[0][tIdx] = null;
            removeToDiscard(target);
            addLog(`Descartaste a ${target.name} por ${cause}.`, 'effect');
            // Foret hito: player discarded Foret while player's Nugu is in the same space
            if (G.unlockProgress && target.name === 'Foret') {
              const hasNugu = space.slots[0].some(c => c && c.name === 'Nugu' && !c.faceDown);
              if (hasNugu) G.unlockProgress.foretDiscardedWithNugu = true;
            }
            // Gran Demonio hito: Tira was discarded from unique-value space after GD moved with Tira
            if (G.unlockProgress && G.unlockProgress._granDemonioMovedTiraToUnique && target.name === 'Tira') {
              G.unlockProgress.granDemonioTaxistaMasPoderoso = true;
            }
          }
        } else {
          // AI discards the least valuable duplicate
          const scored = dupes.map(({ c, i }) => ({ c, i, score: c.baseValue === 0 ? 1000 : getCardPower(c) }));
          scored.sort((a, b) => a.score - b.score);
          const worst = scored[0];
          space.slots[1][worst.i] = null;
          removeToDiscard(worst.c);
          addLog(`IA descarta a ${worst.c.name} por ${cause}.`, 'effect');
        }
        render();
        await gameSleep(600);
      }
    }
  }

  // 6. Mimimi
  await checkMimimi(first);
  render();

  // 6b. Tenpoh — each player discards a random card from their deck
  for (let sp = 0; sp < 3; sp++) {
    for (let side = 0; side < 2; side++) {
      const tenpoh = G.spaces[sp].slots[side].find(c => c && c.name === 'Tenpoh' && !c.faceDown && !c.effectDisabled);
      if (tenpoh) {
        for (let p = 0; p < 2; p++) {
          if (G.deck.length > 0) {
            const idx = Math.floor(Math.random() * G.deck.length);
            const discarded = G.deck.splice(idx, 1)[0];
            addLog(`Tenpoh: ${p === 0 ? 'tú descartas' : 'la IA descarta'} ${discarded.name} del mazo.`, 'effect');
            // Track Tenpoh unlock: Peroth sent from deck to discard
            if (discarded.name === 'Peroth' && G.unlockProgress) {
              G.unlockProgress.tenpohSentPerothToDiscard = true;
            }
            await animateDeckToDiscard(discarded);
          }
        }
        break; // one Tenpoh is enough per turn
      }
    }
  }

  // Clear placedThisTurn flags now that all reveal effects have been processed
  for (let sp = 0; sp < 3; sp++)
    for (let s = 0; s < 2; s++)
      for (let sl = 0; sl < 3; sl++) {
        const c = G.spaces[sp].slots[s][sl];
        if (c) { delete c._placedThisTurn; delete c._movedThisTurn; }
      }

  // 6. (Draw moved to start of next turn)

  // 7. Next turn or end
  if (G.turn >= G.maxTurns) {
    // Reveal cards hidden by Miboro and trigger their reveal effects
    for (const owner of [0, 1]) {
      const hasMiboro = G.spaces.some(sp =>
        sp.slots[owner].some(c => c && c.name === 'Miboro' && !c.effectDisabled)
      );
      if (hasMiboro) {
        for (let sp = 0; sp < 3; sp++)
          for (let sl = 0; sl < 3; sl++) {
            const c = G.spaces[sp].slots[owner][sl];
            if (c && c.faceDown) {
              c.faceDown = false;
              if (c.baseValue === 0) playV0EntrySound(c.name);
              playSound('reveal');
              addLog(`${owner===0?'Tú revelas':'IA revela'} a ${c.name} (Miboro) en Espacio ${[1,2,3][sp]}, hueco ${sl+1}.`, owner===0?'important':'ai');
              applySpaceCardBonus(c, sp);
              render();
              await gameSleep(600);
              if (c.type === 'reveal' && !c.revealUsed && !c.effectDisabled) {
                c.revealUsed = true;
                await doRevealEffect(c, owner, sp, sl);
              }
              render();
              await gameSleep(400);
            }
          }
      }
    }
    // Reveal cards hidden by space effect "_hideUntilEnd" and trigger their reveal effects
    for (let sp = 0; sp < 3; sp++) {
      const spaceObj = G.spaces[sp];
      if (spaceObj._hideUntilEnd && spaceObj.effectRevealed && spaceObj.effectText.includes("al final de la partida")) {
        for (let side = 0; side < 2; side++)
          for (let sl = 0; sl < 3; sl++) {
            const c = spaceObj.slots[side][sl];
            if (c && c.faceDown) {
              c.faceDown = false;
              if (c.baseValue === 0) playV0EntrySound(c.name);
              playSound('reveal');
              addLog(`${side===0?'Tú revelas':'IA revela'} a ${c.name} (efecto espacio) en Espacio ${[1,2,3][sp]}, hueco ${sl+1}.`, side===0?'important':'ai');
              // Miboro hito: player's Miboro revealed by the space effect at game end
              if (side === 0 && c.name === 'Miboro' && G.unlockProgress) {
                G.unlockProgress.miboroRevealedInFogSpace = true;
              }
              applySpaceCardBonus(c, sp);
              render();
              await gameSleep(600);
              if (c.type === 'reveal' && !c.revealUsed && !c.effectDisabled) {
                c.revealUsed = true;
                await doRevealEffect(c, side, sp, sl);
              }
              render();
              await gameSleep(400);
            }
          }
      }
    }
    // ── Registrar último turno en el historial antes de endGame ──
    try {
      const spaceResultsLast = [0,1,2].map(i => computeSpaceScore(i));
      const boardSnapLast = G.spaces.map(sp => ({
        slots: [0,1].map(side => sp.slots[side].map(c => c ? { n: c.displayName || c.name, img: c.name, fd: !!c.faceDown, v: c.baseValue ?? 0, b: (c.powerBonus||0)+(c.existBonus||0) } : null)),
        effect: sp.effectText || null,
        effectRevealed: !!sp.effectRevealed,
      }))
      G.historyLog.push({
        turn: G.turn,
        playerCard:  G._currentTurnLog?.playerCard  || null,
        playerSpace: G._currentTurnLog?.playerSpace ?? null,
        aiCard:      G._currentTurnLog?.aiCard      || null,
        aiSpace:     G._currentTurnLog?.aiSpace      ?? null,
        spaceResults: spaceResultsLast.map(r => r.winner),
        first: whoRevealFirst(),
        board: boardSnapLast,
      });
      G._currentTurnLog = {};
    } catch(e) { /* no interrumpir */ }
    endGame();
    return;
  }

  // [Nuevo] Realidad de Rasu: al final de la ronda, su espacio atrae cartas (ver espacios.js)
  if (typeof rasuAtrae === 'function') { try { await rasuAtrae(); } catch (e) { console.warn(e); } }

  // ── Registrar jugadas de este turno en el historial ──
  try {
    const spaceResults = [0,1,2].map(i => computeSpaceScore(i));
    // Snapshot del tablero al final del turno (tras resolución)
    const boardSnap = G.spaces.map(sp => ({
      slots: [0,1].map(side => sp.slots[side].map(c => c ? { n: c.displayName || c.name, img: c.name, fd: !!c.faceDown, v: c.baseValue ?? 0, b: (c.powerBonus||0)+(c.existBonus||0) } : null)),
      effect: sp.effectText || null,
      effectRevealed: !!sp.effectRevealed,
    }))
    G.historyLog.push({
      turn: G.turn,
      playerCard:  G._currentTurnLog?.playerCard  || null,
      playerSpace: G._currentTurnLog?.playerSpace ?? null,
      aiCard:      G._currentTurnLog?.aiCard      || null,
      aiSpace:     G._currentTurnLog?.aiSpace      ?? null,
      spaceResults: spaceResults.map(r => r.winner),
      first: whoRevealFirst(),
      board: boardSnap,
    });
    G._currentTurnLog = {}; // reset para el siguiente turno
  } catch(e) { /* no interrumpir el flujo */ }

  G.turn++;

  // Reset per-turn Menmei tracking
  if (G.unlockProgress) {
    G.unlockProgress._nofiPlacedThisTurn = false;
    G.unlockProgress._nofiSpaceThisTurn = -1;
    G.unlockProgress._yukoiBoostedThisTurn = 0; // reset Yukoi turn counter
    // Reset Tanna turn tracking (space only valid within the same turn)
    G.unlockProgress._tannaActivatedSpaceThisTurn = -1;
    G.unlockProgress._tannaTurnActivated = -1;
  }

  // Nasu: permanent while on board — renew forced placement for current turn
  // First prune entries from past turns
  G.pending_nasu = G.pending_nasu.filter(n => n.turn >= G.turn);
  for (let sp = 0; sp < 3; sp++) {
    for (let side = 0; side < 2; side++) {
      const hasNasu = G.spaces[sp].slots[side].some(c => c && c.name === 'Nasu' && !c.faceDown && !c.effectDisabled);
      if (!hasNasu) continue;
      const target = 1 - side;
      if (!G.pending_nasu.some(n => n.spIdx === sp && n.target === target && n.turn === G.turn)) {
        G.pending_nasu.push({ spIdx: sp, turn: G.turn, target });
      }
    }
  }

  // [Nuevo] Realidad de Nasu: «Los jugadores deben jugar aquí hasta que no puedan.» (los dos jugadores, cada turno)
  for (let sp = 0; sp < 3; sp++) {
    if (!getActiveEffects(sp).some(e => e.includes('deben jugar aquí hasta que no puedan'))) continue;
    for (const target of [0, 1]) {
      if (!G.pending_nasu.some(n => n.spIdx === sp && n.target === target && n.turn === G.turn)) G.pending_nasu.push({ spIdx: sp, turn: G.turn, target });
    }
  }

  if (!G.extraTurn) {
    for (const sp of G.spaces) {
      if (sp.effectRevealed && sp.effectText.includes("alarga un turno")) {
        G.extraTurn = true;
        G.maxTurns = 7;
        addLog(`¡La partida se alarga 1 turno!`, 'important');
        break;
      }
    }
  }

  addLog(`── Turno ${G.turn} ──`, 'important');

  // Gatito: moves between discard and extinct at start of each turn
  {
    const discardIdx = G.discard.findIndex(c => c.name === 'Gatito');
    const extinctIdx = G.extinct ? G.extinct.findIndex(c => c.name === 'Gatito') : -1;
    if (discardIdx !== -1) {
      const gatito = G.discard.splice(discardIdx, 1)[0];
      G.extinct.push(gatito);
      addLog(`Gatito: se mueve de la pila de descarte a la de extinción.`, 'effect');
      // Activate Hanoe for Gatito's owner
      for (let sp = 0; sp < 3; sp++) checkHanoe(gatito.owner ?? 0, sp);
      render();
    } else if (extinctIdx !== -1) {
      const gatito = G.extinct.splice(extinctIdx, 1)[0];
      G.discard.push(gatito);
      addLog(`Gatito: se mueve de la pila de extinción a la de descarte.`, 'effect');
      // Activate Hanoe for Gatito's owner
      for (let sp = 0; sp < 3; sp++) checkHanoe(gatito.owner ?? 0, sp);
      render();
    }
  }

  // Draw 1 card each at the start of turns 2+
  if (G.turn >= 2) {
    const fukouP0 = G.pending_fukou.find(f => f.target === 0 && f.turn === G.turn);
    const fukouP1 = G.pending_fukou.find(f => f.target === 1 && f.turn === G.turn);
    if (fukouP0) {
      const erizoP0 = mkToken('ErizoPeluche', 0);
      G.hands[0].push(erizoP0);
      G.pending_fukou = G.pending_fukou.filter(f => f !== fukouP0);
      addLog(`Fukou: robas un Erizo de Peluche Blanco.`, 'effect');
      render();
      const deckElF0 = document.getElementById('deck-pile-vis');
      const fromF0 = deckElF0 ? deckElF0.getBoundingClientRect() : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
      const lastF0 = document.getElementById('hand-cards')?.lastElementChild;
      const toF0 = lastF0 ? lastF0.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight-100, width:170, height:238 };
      await animateFlyCard(fromF0, toF0, Math.round(420 * OPTIONS.speedFactor));
    } else {
      await drawCardsAnimated(0, 1);
    }
    await gameSleep(80);
    if (fukouP1) {
      const erizoP1 = mkToken('ErizoPeluche', 1);
      G.hands[1].push(erizoP1);
      G.pending_fukou = G.pending_fukou.filter(f => f !== fukouP1);
      addLog(`Fukou: la IA roba un Erizo de Peluche Blanco.`, 'effect');
      render();
      const deckElF1 = document.getElementById('deck-pile-vis');
      const fromF1 = deckElF1 ? deckElF1.getBoundingClientRect() : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
      const aiHandEl = document.getElementById('ai-hand-area');
      const toF1 = aiHandEl ? aiHandEl.getBoundingClientRect() : { left: window.innerWidth/2, top: 60, width:52, height:74 };
      await animateFlyCard(fromF1, toF1, Math.round(420 * OPTIONS.speedFactor));
    } else {
      await drawCardsAnimated(1, 1);
    }
    addLog(`Ambos roban 1 carta.`, '');
  }

  // Tira check: if player has Tira active (and AI doesn't), AI places first
  // so the player can see where before choosing.
  const playerHasTira = hasTiraActive(0);
  const aiHasTira     = hasTiraActive(1);
  const tiraActive    = playerHasTira !== aiHasTira;

  if (playerHasTira && tiraActive) {
    G.phase = 'ai_place';
    render();
    const aiResult = await doAIPlace();
    if (aiResult) {
      addLog(`IA coloca una carta en Espacio ${[1,2,3][aiResult.sp]}, hueco ${aiResult.sl+1} (Tira — ves dónde jugó).`, 'ai');
    }
    G.tiraPendingAISpace = aiResult ? aiResult.sp : null;
    G.tiraPendingAISlot  = aiResult ? aiResult.sl : null;
  }

  // Check if player can place — if not, skip player turn
  if (!hasAnyFreeSlot(0) || G.hands[0].length === 0) {
    if (!hasAnyFreeSlot(1) || G.hands[1].length === 0) {
      // Neither can place — end game
      addLog('Ningún jugador puede colocar cartas. La partida termina.', 'important');
      G.phase = 'end';
      await endGame();
      return;
    }
    // Only AI can place
    const skipReason = G.hands[0].length === 0 ? 'No tienes cartas en mano. Tu turno se salta.' : 'No puedes colocar cartas. Tu turno se salta.'
    addLog(skipReason, 'effect');
    G.phase = 'ai_place';
    await aiTurn();
    return;
  }
  G.phase = 'player_place';
  render();
  if (typeof ritmoCartelTurno === 'function') ritmoCartelTurno();   // [Nuevo] «Turno N de 6»
}

// Returns true if the given side has at least one free slot across all spaces
function hasAnyFreeSlot(side) {
  if (!G || !G.spaces) return false;
  const hasReki = G.hands[side].some(c => c.name === 'Reki');
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (space.blocked && !(hasReki && isRealSpace(sp))) continue;
    // Normal slots (within slotCount)
    for (let sl = 0; sl < space.slotCount[side]; sl++) {
      if (!space.slots[side][sl]) return true;
    }
    // Reki can also use slots blocked by slotCount (Filia, solo-hueco effect)
    if (hasReki) {
      for (let sl = space.slotCount[side]; sl < 3; sl++) {
        if (!space.slots[side][sl]) return true;
      }
    }
  }
  return false;
}

async function applySpaceOnReveal(spIdx) {
  const space = G.spaces[spIdx];

  // If Roloc is active and this is NOT Roloc's space, its own effect is suppressed
  const rolocSp = rolocSpaceIdx();
  if (rolocSp !== -1 && spIdx !== rolocSp) {
    addLog(`Efecto de Espacio ${[1,2,3][spIdx]} suprimido por Roloc.`, 'effect');
    return;
  }

  const eff = space.effectText;

  if (eff.includes("Se revelan los efectos del resto")) {
    // Spaces are always revealed — this effect has no additional impact
    addLog(`Efecto de Espacio ${[1,2,3][spIdx]}: todos los espacios ya están descubiertos.`, 'effect');
  }
  if (eff.includes("Barajad un Erizo de Peluche Blanco") && !G._erizoDone) {
    G._erizoDone = true;
    space._erizoDone = true;
    for (let p = 0; p < 2; p++) {
      const e = mkToken('ErizoPeluche', p);
      const pos = Math.floor(Math.random() * (G.deck.length+1));
      G.deck.splice(pos, 0, e);
    }
    addLog(`Un Erizo de Peluche Blanco entra en el mazo de cada jugador.`, 'effect');
  }
  if (eff.includes("Sólo hay un hueco aquí")) {
    // Only apply the slot restriction if desactivados is NOT already active in another space
    const desactivadosActive = G.spaces.some((sp, i) =>
      i !== spIdx && sp.effectRevealed && sp.effectText && sp.effectText.includes('están desactivados') && !sp._unaMovedDesactivados
    );
    if (!desactivadosActive) {
      space.slotCount = [1,1];
      addLog(`Espacio ${ [1,2,3][spIdx]}: solo 1 hueco por lado.`, 'effect');
    }
  }
  if (eff.includes("están desactivados")) {
    // Restore slotCount=3 for any other space currently locked by "Sólo hay un hueco" or "Solo puede haber una carta de Valor 0 y una de Valor 1"
    for (let i = 0; i < 3; i++) {
      if (i !== spIdx) {
        const sp2 = G.spaces[i];
        if (sp2.effectRevealed && sp2.effectText) {
          if (sp2.effectText.includes('Sólo hay un hueco') && sp2.slotCount[0] === 1) {
            sp2.slotCount = [3, 3];
            addLog(`Espacio ${[1,2,3][i]}: huecos restaurados a 3 (efectos de espacio desactivados).`, 'effect');
          } else if (sp2.effectText.includes('Solo puede haber una carta de Valor 0 y una de Valor 1') && sp2.slotCount[0] === 2) {
            sp2.slotCount = [3, 3];
            addLog(`Espacio ${[1,2,3][i]}: huecos restaurados a 3 (efectos de espacio desactivados).`, 'effect');
          }
        }
      }
    }
  }
  if (eff.includes("menos huecos") && !G._erizoDone) {
    G._erizoDone = true;
    space._erizoDone = true;
    for (let p = 0; p < 2; p++) {
      // Find the space with fewest free slots (most occupied) for this player
      let minFree = Infinity, targetSp = -1;
      for (let s = 0; s < 3; s++) {
        const sp = G.spaces[s];
        if (sp.blocked) continue;
        const freeCount = sp.slots[p].filter((c, i) => !c && i < sp.slotCount[p]).length;
        if (freeCount < minFree) { minFree = freeCount; targetSp = s; }
      }
      if (targetSp === -1) continue;
      const targetSpace = G.spaces[targetSp];
      const free = targetSpace.slots[p].findIndex((c, i) => !c && i < targetSpace.slotCount[p]);
      if (free !== -1) {
        const e = mkToken('ErizoPeluche', p);
        placeCard(e, p, targetSp, free, false, true);
        addLog(`Erizo de Peluche Blanco colocado en Espacio ${[1,2,3][targetSp]} para ${p===0?'ti':'la IA'}.`, 'effect');
      }
    }
  }
  if (eff.includes("se revelan al final de la partida")) {
    space._hideUntilEnd = true;
    addLog(`Espacio ${[1,2,3][spIdx]}: las cartas aquí se revelan al final.`, 'effect');
  }
  if (eff.includes("Cambia el efecto de todos")) {
    for (let i = 0; i < 3; i++) {
      const pool = SPACE_EFFECTS[G.spaces[i].poolIdx ?? i];
      G.spaces[i].effectText = pool[Math.floor(Math.random()*pool.length)];
      addLog(`Espacio ${[1,2,3][i]} cambia a: "${G.spaces[i].effectText}"`, 'effect');
    }
    playSound('spaceChange');
    render();
    await sleep(50);
    const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
    for (let i = 0; i < 3; i++) {
      const loc = spaceEls?.[i]?.querySelector('.space-location');
      if (loc) { loc.classList.add('swapping'); setTimeout(() => loc.classList.remove('swapping'), 900); }
    }
    await gameSleep(400);
  }
  // Retroactively apply +1 bonuses to cards already in this space
  if (eff.includes("Valor 1 ganan +1 Valor")) {
    for (let side = 0; side < 2; side++)
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (c && !c.faceDown) applySpaceCardBonus(c, spIdx);
      }
  }
  if (eff.includes("Solo puede haber una carta de Valor 0 y una de Valor 1")) {
    // Only apply the slot restriction if desactivados is NOT already active in another space
    const desactivadosActive = G.spaces.some((sp, i) =>
      i !== spIdx && sp.effectRevealed && sp.effectText && sp.effectText.includes('están desactivados') && !sp._unaMovedDesactivados
    );
    if (!desactivadosActive) {
      for (let side = 0; side < 2; side++) {
        if (space.slotCount[side] > 2) space.slotCount[side] = 2;
        const overflow = space.slots[side][2];
        if (overflow && overflow.name !== 'Reki') {
          const freeSlot = space.slots[side].findIndex((c, i) => !c && i < 2);
          if (freeSlot !== -1) {
            space.slots[side][freeSlot] = overflow;
            space.slots[side][2] = null;
            addLog(`Efecto de espacio: ${overflow.displayName||overflow.name} se mueve al hueco ${freeSlot+1} en E${[1,2,3][spIdx]}.`, 'effect');
          } else {
            // No free slot — must discard a card from this space. Player chooses; AI picks worst.
            if (side === 0) {
              const candidates = space.slots[0].filter(c => c && c.name !== 'Reki');
              addLog(`Efecto de espacio: elige qué carta descartar en E${[1,2,3][spIdx]}.`, 'important');
              render();
              const target = await pickCardFromBoard((c, si, s) => si === spIdx && s === 0 && candidates.includes(c), { mandatory: true });
              if (target) {
                const tIdx = space.slots[0].indexOf(target);
                space.slots[0][tIdx] = null;
                removeToDiscard(target);
                addLog(`Descartaste a ${target.displayName||target.name} por efecto de espacio.`, 'effect');
                // Move overflow to the freed slot if it was not the discarded one
                const nowFree = space.slots[0].findIndex((c, i) => !c && i < 2);
                if (space.slots[0][2] && nowFree !== -1) {
                  space.slots[0][nowFree] = space.slots[0][2];
                  space.slots[0][2] = null;
                }
              } else {
                // Fallback: discard overflow
                space.slots[side][2] = null;
                removeToDiscard(overflow);
                addLog(`Efecto de espacio: ${overflow.displayName||overflow.name} descartada — sin hueco libre en E${[1,2,3][spIdx]}.`, 'effect');
              }
            } else {
              // AI: discard the least valuable card among all three slots
              const filled = space.slots[1].map((c, i) => c && c.name !== 'Reki' ? { c, i } : null).filter(Boolean);
              if (filled.length > 0) {
                const scored = filled.map(({ c, i }) => {
                  let keepScore = getCardPower(c);
                  if (c.baseValue === 0) keepScore += 1000;
                  return { c, i, score: keepScore };
                });
                scored.sort((a, b) => a.score - b.score);
                const worst = scored[0];
                space.slots[1][worst.i] = null;
                removeToDiscard(worst.c);
                addLog(`IA descarta a ${worst.c.displayName||worst.c.name} por efecto de espacio.`, 'effect');
                // Move overflow (slot 2) to any freed slot
                const nowFree = space.slots[1].findIndex((c, i) => !c && i < 2);
                if (space.slots[1][2] && nowFree !== -1) {
                  space.slots[1][nowFree] = space.slots[1][2];
                  space.slots[1][2] = null;
                } else if (space.slots[1][2]) {
                  space.slots[1][2] = null;
                  removeToDiscard(overflow);
                  addLog(`Efecto de espacio: ${overflow.displayName||overflow.name} descartada — sin hueco libre en E${[1,2,3][spIdx]}.`, 'effect');
                }
              } else {
                space.slots[side][2] = null;
                removeToDiscard(overflow);
                addLog(`Efecto de espacio: ${overflow.displayName||overflow.name} descartada — sin hueco libre en E${[1,2,3][spIdx]}.`, 'effect');
              }
            }
          }
        }
      }
      addLog(`E${[1,2,3][spIdx]}: máx. 1 carta V0 y 1 carta V1 (tercer hueco bloqueado).`, 'effect');
    }
  }

  // "Los efectos de existir no funcionan aquí." — disable exist cards already in this space when effect reveals
  if (eff.includes('Los efectos de existir no funcionan aquí')) {
    for (let side = 0; side < 2; side++)
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (c && c.type === 'exist' && c.name !== 'Reki' && !c.effectDisabled) {
          c.effectDisabled = true;
          addLog(`${c.displayName||c.name}: efecto desactivado por el efecto del Espacio ${[1,2,3][spIdx]}.`, 'effect');
        }
      }
  }
}

async function revealOwnerCards(owner) {
  // Miboro Exist: active while a face-up Miboro is on the board on this owner's side.
  // Recalculated each turn — not permanent, can deactivate if Miboro leaves the board.
  const mibороActive = G.spaces.some(sp =>
    sp.slots[owner].some(c => c && c.name === 'Miboro' && !c.effectDisabled && !c.faceDown)
  );
  // Track for end-of-game reveal (only add, never remove — end reveal needs full history)

  // Build list of all face-down cards to reveal, sorted so Destinada card1 comes first
  const toReveal = [];
  for (let sp = 0; sp < 3; sp++) {
    for (let sl = 0; sl < 3; sl++) {
      const card = G.spaces[sp].slots[owner][sl];
      if (card && card.faceDown) toReveal.push({ sp, sl, card });
    }
  }
  // Destinada order: 1 first, 2 second, rest (undefined) last
  toReveal.sort((a, b) => {
    const ao = a.card._destinadaOrder ?? 99;
    const bo = b.card._destinadaOrder ?? 99;
    return ao - bo;
  });
  // [Nuevo] cartel de quién revela (solo si de verdad hay algo que se va a ver)
  if (toReveal.length && typeof ritmoCartel === 'function') await ritmoCartel(ritmoT(owner === 0 ? 'tu' : 'ia'), { ms: 1100, tipo: owner === 0 ? 'rc-tuyo' : 'rc-rival' });

  for (const { sp, sl, card } of toReveal) {
    // Re-check: card may have been removed mid-reveal (e.g. Miria, extinction)
    if (G.spaces[sp].slots[owner][sl] !== card || !card.faceDown) continue;

    // Miboro Exist: owner has active Miboro — all their cards stay hidden
    if (mibороActive && card.name !== 'Miboro') continue;

    // Space effect: cards in this space hidden until end of game — only if effect is still active
    const space = G.spaces[sp];
    const hideActive = space._hideUntilEnd && space.effectRevealed && space.effectText.includes("al final de la partida");
    if (hideActive) continue;

      card.faceDown = false;
      // Sonido especial de entrada para cartas Valor 0 (primera vez boca arriba en el tablero)
      if (card.baseValue === 0) {
        playV0EntrySound(card.name);
      }
      playSound('reveal');
      addLog(`${owner===0?'Tú has revelado':'La IA ha revelado'} a ${card.name} en Espacio ${[1,2,3][sp]}, hueco ${sl+1}.`, owner===0?'important':'ai');
      // [Cambio] las pisadas de Reki sobre Real salen al revelarse (no al colocarla boca abajo) — ver espacios.js
      if (card.name === 'Reki' && card._rekiPisadas && typeof rekiAlRevelar === 'function') await rekiAlRevelar(sp, sl, owner, card);

      // AI memory: record player cards as they're revealed
      if (owner === 0 && !G.seenPlayerCards.includes(card.name)) {
        G.seenPlayerCards.push(card.name);
      }

      // Space effect: extinction of V0 — Real and Reki are immune, V1 are safe
      // [Cambiado] Realidad de Tis: «La primera carta colocada desde la mano de cada jugador en este espacio es extinguida.»
      const _tisToca = card._desdeMano && card.name !== 'Reki' && !space._realActive && space.effectRevealed &&
          getActiveEffects(sp).some(e => e.includes('desde la mano de cada jugador en este espacio es extinguida')) &&
          !(space._tisUsado && space._tisUsado[owner]);
      if (_tisToca) (space._tisUsado = space._tisUsado || [false, false])[owner] = true;
      if (_tisToca || (card.baseValue === 0 && card.name !== 'Reki' && !space._realActive &&
          space.effectRevealed && getActiveEffects(sp).some(e => e.includes("se extinguen")))) {
          animateCardFromSlot(sp, owner, sl, 'extinct-pile-vis');
          space.slots[owner][sl] = null;
          extinguishCard(card);
          addLog(`${card.name} se extingue por efecto del Espacio ${[1,2,3][sp]}.`, 'effect');
          // Track Reiza unlock: V0 extinguished in "Las cartas de Valor 0 se extinguen" space
          if (owner === 0 && G.unlockProgress && getActiveEffects(sp).some(e => e.includes('Valor 0') && e.includes('extinguen'))) {
            G.unlockProgress.reizaExtinctV0Effect = true;
          }
          render();
          await gameSleep(1000);
          if (card.baseValue === 0) triggerReal(sp);
          else checkUsei(owner, sp, card);
          render();
          await gameSleep(300);
          continue;
      }

      // [Nuevo] Realidad de Neutra: «Quien coloque una carta aquí roba una carta.»
      if (card._desdeMano && getActiveEffects(sp).some(e => e.includes('Quien coloque una carta aquí roba una carta'))) {
        addLog(`${owner===0?'Robas':'La IA roba'} una carta por el efecto del Espacio ${[1,2,3][sp]} (Neutra).`, 'effect');
        await drawCardsAnimated(owner, 1, true);
      }
      // [Nuevo] una Realidad (Valor 0) que se revela tiñe su espacio si aún es neutro — ver espacios.js
      if (card.baseValue === 0 && typeof realidadTine === 'function') await realidadTine(sp, owner, card);

      // Yukoi bonus applied on reveal
      if (card._yukoi_pending) {
        delete card._yukoi_pending;
        if (isIsolatedSpace(sp)) {
          addLog(`${card.name} no gana +1 por Yukoi (espacio aislado).`, 'effect');
        } else {
          rdConFuente('Yukoi', () => { card.powerBonus = (card.powerBonus||0) + 1; });
          addLog(`${card.name} gana +1 por Yukoi.`, 'effect');
          playSound('valorUp');
          // Progression: Yukoi boosted an ally (owner 0)
          if (card.owner === 0 && G.unlockProgress) {
            G.unlockProgress.yukoiCrossSpace = true;
            // Hito Yukoi "Melodía sorda": contar aliados boosteados este turno
            G.unlockProgress._yukoiBoostedThisTurn = (G.unlockProgress._yukoiBoostedThisTurn||0) + 1;
            if (G.unlockProgress._yukoiBoostedThisTurn >= 2) G.unlockProgress.yukoiBoostedTwoSameTurn = true;
          }
        }
      }

      applySpaceCardBonus(card, sp);
      applyExistEffects(); // update existBonus immediately so value changes show on reveal
      render();
      if (typeof ritmoFocoCarta === 'function') await ritmoFocoCarta(sp, owner, sl, card);   // [Nuevo] la carta en primer plano, con su efecto
      else await gameSleep(600);

      // Erizo Peluche Existir: when an allied card is revealed here, Erizo moves to top of deck
      // Skip if the Erizo was placed THIS same turn (e.g. by Nugu revealing simultaneously)
      if (card.name !== 'ErizoPeluche') {
        const erizoSlot = space.slots[owner].findIndex(c => c && c.name === 'ErizoPeluche' && !c.effectDisabled && !c._placedThisTurn);
        if (erizoSlot !== -1) {
          const erizo = space.slots[owner][erizoSlot];
          space.slots[owner][erizoSlot] = null;
          erizo._reservedFor = owner;
          G.deck.unshift(erizo);
          playSound('discard');
          addLog(`Erizo de Peluche Blanco vuelve al tope del mazo del ${owner===0?'jugador':'IA'} — se robará al inicio del siguiente turno.`, 'effect');
          render();
          await gameSleep(500);
        }
      }

      // Miria: if an allied V1 (not Miria herself) was just PLACED (not moved) in this space, discard it and give Miria +2
      if (card.baseValue === 1 && card.name !== 'Miria' && !card.effectDisabled && !card._movedThisTurn) {
        const miriaCard = space.slots[owner].find(c => c && c.name === 'Miria' && !c.faceDown && !c.effectDisabled);
        if (miriaCard) {
          animateCardFromSlot(sp, owner, sl, 'discard-pile-vis');
          space.slots[owner][sl] = null;
          removeToDiscard(card);
          rdConFuente(miriaCard, () => { miriaCard.powerBonus = (miriaCard.powerBonus||0) + 2; });
          addLog(`Miria: descarta a ${card.name} y gana +2 Valor.`, 'effect');
          // Miria hito: player's Miria discarded an Abaki
          if (owner === 0 && card.name === 'Abaki' && G.unlockProgress) {
            G.unlockProgress.miriaDiscardedAbaki = true;
          }
          playSound('valorUp');
          applyExistEffects();
          render();
          await gameSleep(800);
          continue;
        }
      }

      if (card.type === 'reveal' && !card.revealUsed && !card.effectDisabled) {
        card.revealUsed = true;
        await doRevealEffect(card, owner, sp, sl);
        // Space effect: "Los efectos de Revelar se repiten una vez más."
        const activeEffsRepeat = getActiveEffects(sp);
        if (activeEffsRepeat.some(e => e.includes('Revelar se repiten una vez más'))) {
          addLog(`Efecto espacio: el efecto Revelar de ${card.name} se repite.`, 'effect');
          await doRevealEffect(card, owner, sp, sl);
        }
      }
      render();
      await gameSleep(900);
    }
}

function applySpaceCardBonus(card, spIdx) {
  if (isRealSpace(spIdx)) return;
  const effs = getActiveEffects(spIdx);
  for (const eff of effs) {
    // +1 V1: permanent powerBonus, use flag to avoid applying twice to same card in same space
    if (eff.includes("Valor 1 ganan +1 Valor") && card.baseValue === 1) {
      const key = `_spBonus_v1_${spIdx}`;
      if (!card[key]) { card[key] = true; rdConFuente('Espacio ' + (spIdx + 1), () => { card.powerBonus = (card.powerBonus||0) + 1; }); }
    }
  }
}

// Returns index of space where Roloc is face-up, or -1
function rolocSpaceIdx() {
  if (!G || !G.spaces) return -1;
  return G.spaces.findIndex(sp =>
    sp.slots[0].concat(sp.slots[1]).some(c => c && c.name === 'Roloc' && !c.faceDown && !c.effectDisabled)
  );
}

function rolocActive() {
  return rolocSpaceIdx() !== -1;
}

// Returns array of effectTexts that apply to a given space
// If Roloc is active: spaces OTHER than Roloc's space use Roloc's space effect
// Roloc's own space uses its own effect normally
function getActiveEffects(spIdx) {
  // If "El resto de efectos de espacio están desactivados" is active in ANOTHER space, suppress this one
  const suppressorSp = G.spaces.findIndex((sp, i) =>
    i !== spIdx && sp.effectRevealed && sp.effectText && sp.effectText.includes('están desactivados')
  );
  if (suppressorSp !== -1) return [];

  const rolocSp = rolocSpaceIdx();
  if (rolocSp !== -1 && spIdx !== rolocSp) {
    // This space is overridden by Roloc's space effect
    const rolocSpace = G.spaces[rolocSp];
    if (rolocSpace.effectRevealed && rolocSpace.effectText) return [rolocSpace.effectText];
    return [];
  }
  // Own space effect (Roloc's space or no Roloc active)
  const own = G.spaces[spIdx];
  const effs = [];
  if (own.effectRevealed && own.effectText) effs.push(own.effectText);
  return effs;
}

// Returns true if player 0 has Soi face-up on the board
function soiActive(side = 0) {
  if (!G || !G.spaces) return false;
  return G.spaces.some(sp =>
    sp.slots[side].some(c => c && c.name === 'Soi' && !c.faceDown && !c.effectDisabled)
  );
}

// Returns true if the given side has Ziru face-up on the board
function ziruActive(side) {
  return G && G.spaces && G.spaces.some(sp =>
    sp.slots[side].some(c => c && c.name === 'Ziru' && !c.faceDown && !c.effectDisabled)
  );
}

// ══════════════════════════════════════════════════════════
//  REVEAL EFFECTS
// ══════════════════════════════════════════════════════════
async function doRevealEffect(card, owner, spIdx, slIdx, bonusTarget) {
  const _fuentePrev = RD_FUENTE.actual; RD_FUENTE.actual = card;   // [Nuevo] quién cambia el valor (ver RD_FUENTE)
  try { return await doRevealEffectCuerpo(card, owner, spIdx, slIdx, bonusTarget); } finally { RD_FUENTE.actual = _fuentePrev; }
}
async function doRevealEffectCuerpo(card, owner, spIdx, slIdx, bonusTarget) {
  // bonusTarget: if set, stat bonuses (powerBonus) go to this card instead of `card` (used by Humi)
  const _bt = bonusTarget || card;
  const space = G.spaces[spIdx];
  const rival = 1 - owner;
  const rivalPlayedHere = space.slots[rival].some(c => c !== null && c._placedThisTurn);
  const suActive = G.spaces.some(sp => sp.slots[owner].some(c => c && c.name === 'Su' && !c.faceDown && !c.effectDisabled))
    || getActiveEffects(spIdx).some(e => e.includes('sin condición de si colocó'));   // [Nuevo] Realidad de Su (efecto de espacio)
  const condMet = rivalPlayedHere || suActive;
  const condNotMet = (!rivalPlayedHere) || suActive;

  switch (card.name) {
    case 'Nugu': {
      const free = space.slots[rival].findIndex((x,i) => x===null && i<space.slotCount[rival]);
      if (free !== -1 && !space.blocked) {
        const e = mkToken('ErizoPeluche', rival);
        const _desdeNugu = (typeof valorCartaEl === 'function' && valorCartaEl(spIdx, owner, slIdx)) || null;   // [Nuevo] de dónde sale el peluche
        const _rectNugu = _desdeNugu ? _desdeNugu.getBoundingClientRect() : null;
        placeCard(e, rival, spIdx, free, false, true);
        addLog(`Nugu: Erizo de Peluche Blanco al rival en E${ [1,2,3][spIdx]}.`, 'effect');
        if (typeof rdLanzarPeluche === 'function') { try { await rdLanzarPeluche(_rectNugu, spIdx, rival, free, [spIdx, owner, slIdx]); } catch (err) {} }   // [Nuevo] vuela hasta allí
      }
      break;
    }
    case 'Ramia': {
      if (condMet && G.hands[rival].length > 0) {
        let stolen;
        if (rdEligeHumano(owner)) {
          const idx = await chooseRivalHandCard('Ramia: elige una carta de la mano rival');
          if (idx !== null && idx < G.hands[rival].length) {
            stolen = G.hands[rival].splice(idx, 1)[0];
          }
        } else {
          const idx = Math.floor(Math.random() * G.hands[rival].length);
          stolen = G.hands[rival].splice(idx, 1)[0];
        }
        if (stolen) {
          stolen.owner = owner;
          const tannaCaught = await handleTanna(stolen, rival);
          if (!tannaCaught) G.hands[owner].push(stolen);
          playSound('steal');
          animateStealCard();
          render();
          await gameSleep(420);
          addLog(`Ramia: roba ${stolen.name} de la mano del rival.`, 'effect');
          // Progression: count cards stolen by player
          if (owner === 0 && G.unlockProgress) { G.unlockProgress.cardsStolen++; G.unlockProgress.rivalPlacedCondTriggers++; }
          if (owner === 0 && G.unlockProgress) G.unlockProgress._tannaStoleCount++;
          // Neutra unlock: stole Reki from rival hand
          if (owner === 0 && G.unlockProgress && stolen && stolen.name === 'Reki') G.unlockProgress.neutraStoleReki = true;
          // Ramia hito: stole Nugu from rival hand
          if (owner === 0 && G.unlockProgress && stolen && stolen.name === 'Nugu') G.unlockProgress.ramiaStoleNugu = true;
          // Ziru hito: stole Reki from rival hand while player has allied Ziru on board
          if (owner === 0 && G.unlockProgress && stolen && stolen.name === 'Reki') {
            const playerHasZiru = G.spaces.some(sp => sp.slots[0].some(c => c && c.name === 'Ziru' && !c.faceDown && !c.effectDisabled));
            if (playerHasZiru) G.unlockProgress.ziruStoleReki = true;
          }
          // Tira hito: Ramia succeeded with condMet in turn > 1
          if (owner === 0 && G.unlockProgress && G.turn > 1) {
            if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
            G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
          }
        }
      }
      break;
    }
    case 'Gena': {
      const allies = [];
      for (let s = 0; s < 3; s++) {
        if (s !== spIdx && isIsolatedSpace(s)) continue; // can't receive external effects
        G.spaces[s].slots[owner].forEach(c => {
          if (c && c !== card && !c.faceDown && !c.effectDisabled && c.name !== 'Reki' && c.baseValue !== 0) allies.push(c);
        });
      }
      if (allies.length > 0) {
        let t;
        if (rdEligeHumano(owner)) {
          addLog(`Gena: elige un aliado en el tablero para +1 Valor.`, 'important');
          t = await pickCardFromBoard((c, si, side) => side === owner && allies.includes(c), { mandatory: true });
        } else {
          t = allies[0];
        }
        if (t) { t.powerBonus=(t.powerBonus||0)+1; addLog(`Gena: ${t.name} +1 Valor.`,'effect');
          playSound('valorUp');
          // Progression: Gena boosted in a DIFFERENT space than where Gena was placed
          if (owner === 0 && G.unlockProgress) {
            // find which space t is in
            for (let _gs = 0; _gs < 3; _gs++) if (_gs !== spIdx && G.spaces[_gs].slots[0].includes(t)) {
              G.unlockProgress.genaCrossSpace = true;
              // Gena hito: remember which card was boosted and in which space
              G.unlockProgress._genaCrossSpaceTarget = { cardName: t.name, spaceIdx: _gs };
              G.unlockProgress._genaSourceSpaceIdx = spIdx;
              break;
            }
          }
        }
      }
      break;
    }
    case 'Gran Demonio': {
      // "Las cartas en este espacio no pueden ser movidas." — Gran Demonio cannot move out
      if (space.effectRevealed && space.effectText && space.effectText.includes('Las cartas en este espacio no pueden ser movidas')) {
        addLog(`Gran Demonio: el efecto del espacio impide moverse desde aquí.`, 'effect');
        break;
      }
      const otherSpaces = [0,1,2].filter(i => {
        if (i === spIdx || G.spaces[i].blocked) return false;
        const sp2 = G.spaces[i];
        return sp2.slots[owner].some((x, si) => x === null && si < sp2.slotCount[owner]);
      });
      // Build allies list: other allied cards in the same space
      const allies = space.slots[owner].filter(c => c && c !== card && !c.faceDown && !c.effectDisabled);
      if (otherSpaces.length > 0) {
        let ally = null;
        if (allies.length > 0) {
          if (rdEligeHumano(owner)) {
            addLog(`Gran Demonio: elige un aliado para llevarte (o cancela para ir solo).`, 'important');
            ally = await pickCardFromBoard((c, si, side) => si === spIdx && side === owner && allies.includes(c), { mandatory: true });
          } else {
            ally = allies[0];
          }
        }
        const dest = rdEligeHumano(owner)
          ? await (addLog(`Gran Demonio: elige el espacio destino.`, 'important'),
              pickSpaceFromBoard(i => otherSpaces.includes(i)))
          : otherSpaces[0];
        if (dest !== null) {
          const destSpace = G.spaces[dest];
          const freeSlots = destSpace.slots[owner].filter((x,i) => x===null && i<destSpace.slotCount[owner]).length;
          const allySlot = ally ? space.slots[owner].findIndex(c=>c===ally) : -1;

          space.slots[owner][slIdx] = null;
          const f1 = destSpace.slots[owner].findIndex((x,i)=>x===null&&i<destSpace.slotCount[owner]);
          // Helper to update effectDisabled when moving exist cards between spaces with "existir no funciona"
          const _updateExistDisabled = (c, fromSp, toSp) => {
            if (!c || c.type !== 'exist' || c.name === 'Reki') return;
            const fromEff = fromSp.effectRevealed && fromSp.effectText && fromSp.effectText.includes('Los efectos de existir no funcionan aquí');
            const toEff = toSp.effectRevealed && toSp.effectText && toSp.effectText.includes('Los efectos de existir no funcionan aquí');
            if (fromEff && c.effectDisabled) c.effectDisabled = false;
            if (toEff && !c.effectDisabled) c.effectDisabled = true;
          };
          _updateExistDisabled(card, space, destSpace);
          if (f1 !== -1) destSpace.slots[owner][f1] = card;

          if (ally && freeSlots >= 2) {
            space.slots[owner][allySlot] = null;
            _updateExistDisabled(ally, space, destSpace);
            const f2 = destSpace.slots[owner].findIndex((x,i)=>x===null&&i<destSpace.slotCount[owner]);
            if (f2 !== -1) destSpace.slots[owner][f2] = ally;
            addLog(`Gran Demonio mueve junto a ${ally.name} a E${[1,2,3][dest]}.`, 'effect');
            playSound('rasuNeutraMove');
            // Reina hito: track if Reina was moved as the ally
            if (owner === 0 && G.unlockProgress && ally.name === 'Reina') {
              G.unlockProgress._reinaWasMoved = true;
            }
            // Gran Demonio hito: moved with Tira into unique-value space
            if (owner === 0 && G.unlockProgress && ally.name === 'Tira') {
              const destEffs = getActiveEffects(dest);
              if (destEffs.some(e => e.includes('Solo puede haber una carta'))) {
                G.unlockProgress._granDemonioMovedTiraToUnique = true;
              }
            }
            // Moved 2 cards (itself + ally) — count towards general move unlock
            if (owner === 0 && G.unlockProgress) {
              G.unlockProgress._cardsMoved = (G.unlockProgress._cardsMoved || 0) + 2;
              if (G.unlockProgress._cardsMoved >= 2) G.unlockProgress.granDemonioMoved2 = true;
              if (G.unlockProgress._cardsMoved >= 3) G.unlockProgress.demaeMoved3 = true;
            }
          } else if (ally) {
            addLog(`Gran Demonio se mueve solo a E${[1,2,3][dest]} (sin hueco para ${ally.name}).`, 'effect');
            playSound('rasuNeutraMove');
            if (owner === 0 && G.unlockProgress) {
              G.unlockProgress._cardsMoved = (G.unlockProgress._cardsMoved || 0) + 1;
              if (G.unlockProgress._cardsMoved >= 2) G.unlockProgress.granDemonioMoved2 = true;
              if (G.unlockProgress._cardsMoved >= 3) G.unlockProgress.demaeMoved3 = true;
            }
          } else {
            addLog(`Gran Demonio se mueve a E${[1,2,3][dest]}.`, 'effect');
            playSound('rasuNeutraMove');
            if (owner === 0 && G.unlockProgress) {
              G.unlockProgress._cardsMoved = (G.unlockProgress._cardsMoved || 0) + 1;
              if (G.unlockProgress._cardsMoved >= 2) G.unlockProgress.granDemonioMoved2 = true;
              if (G.unlockProgress._cardsMoved >= 3) G.unlockProgress.demaeMoved3 = true;
            }
          }

          checkHanoe(owner, spIdx); checkHanoe(owner, dest);
        }
      }
      break;
    }
    case 'Abaki': {
      if (condMet && card.baseValue !== 0) { _bt.powerBonus=(_bt.powerBonus||0)+2; addLog(`Abaki: +2 Valor.`,'effect');
        playSound('valorUp');
        if (owner === 0 && G.unlockProgress) {
          G.unlockProgress.rivalPlacedCondTriggers++;
          G.unlockProgress.suCondTriggers = (G.unlockProgress.suCondTriggers || 0) + 1;
          try { const SU_KEY='juego_cartas_su_triggers'; localStorage.setItem(SU_KEY, String(G.unlockProgress.suCondTriggers)); } catch {}
          // Abaki hito: track spaces where player's Abaki triggered
          if (!G.unlockProgress._abakiTriggeredSpaces) G.unlockProgress._abakiTriggeredSpaces = [];
          if (!G.unlockProgress._abakiTriggeredSpaces.includes(spIdx)) G.unlockProgress._abakiTriggeredSpaces.push(spIdx);
          // Tira hito: Abaki succeeded in turn > 1
          if (G.turn > 1) {
            if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
            G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
          }
        }
      }
      break;
    }
    case 'Hobu': {
      // Condition: rival did NOT play here this turn (and Su doesn't override — Su only helps condMet cards)
      const hobuCondMet = !rivalPlayedHere;
      if (hobuCondMet) {
        const targets = space.slots[rival].filter(c => c && !c.faceDown && !c.effectDisabled && c.type === 'exist' && c.name !== 'Reki');
        if (targets.length > 0) {
          targets.forEach(c => {
            c.effectDisabled = true;
            addLog(`Hobu: ${c.name} pierde su efecto Existir.`, 'effect');
          });
          applyExistEffects();
          render();
          await gameSleep(400);
          if (owner === 0 && G.unlockProgress) {
            G.unlockProgress.rivalPlacedCondTriggers++;
            // Hobu hito: count rival exist-cards disabled
            G.unlockProgress.hobuDisabledExistCount = (G.unlockProgress.hobuDisabledExistCount || 0) + targets.length;
            // Tira hito: Hobu succeeded in turn > 1
            if (G.turn > 1) {
              if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
              G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
            }
          }
        } else {
          addLog(`Hobu: no hay rivales con Existir aquí.`, 'effect');
        }
      }
      break;
    }
    case 'Yukoi': {
      G.pending_yukoi = { owner, fromSpaceIdx: spIdx, activeTurn: G.turn + 1 };
      addLog(`Yukoi: el próximo turno, los aliados de Valor 1 colocados ganan +1 Valor.`, 'effect');
      break;
    }
    case 'Faun': {
      if (G.turn === G.maxTurns && card.baseValue !== 0) {
        // Check if this space was losing for player before Faun
        const scBefore = computeSpaceScore(spIdx);
        _bt.powerBonus=(_bt.powerBonus||0)+1; addLog(`Faun: +1 Valor (último turno).`,'effect');
        playSound('valorUp');
        const scAfter = computeSpaceScore(spIdx);
        if (owner === 0 && G.unlockProgress && scBefore.winner !== 0 && scAfter.winner === 0) {
          G.unlockProgress.faunWonLostSpace = true;
        }
        // Hito Faun "Trasnochador": si es turno 7 y Faun obtiene +2 (Yukoi+Faun o espacio repetidor)
        if (owner === 0 && G.unlockProgress && G.turn === 7) {
          const totalBonus = (_bt.powerBonus||0) + (card.powerBonus||0);
          if (totalBonus >= 2) G.unlockProgress.faunTurn7PlusTwo = true;
        }
      }
      break;
    }
    case 'Zao': {
      const ec = space.slots[rival].filter(Boolean).length;
      if (ec>0 && card.baseValue !== 0) { _bt.powerBonus=(_bt.powerBonus||0)+ec; addLog(`Zao: +${ec} Valor.`,'effect'); playSound('valorUp'); }
      // Zao hito: player placed Zao with 3 rivals in the space — track space for end-of-game check
      if (owner === 0 && ec >= 3 && G.unlockProgress) {
        G.unlockProgress._zaoThreeRivalsSpaceIdx = spIdx;
      }
      break;
    }
    case 'Foret': {
      // Ahora es tipo Existir — el bonus se calcula en applyExistEffects
      break;
    }
    case 'Feruzu': {
      if (isProtected(rival, spIdx)) {
        addLog(`Cartas del rival protegidas de Feruzu (Koly).`, 'effect');
        // Progression: Koly blocked a removal against player (only if actual Koly card present, not just space effect)
        const rivalHasKoly = G.spaces[spIdx].slots[rival].some(c => c && c.name === 'Koly' && !c.effectDisabled && !c.faceDown);
        if (rival === 0 && G.unlockProgress && rivalHasKoly) {
          G.unlockProgress.kolyProtectedRemoval = true;
          G.unlockProgress._kolyProtectCount = (G.unlockProgress._kolyProtectCount || 0) + 1;
          // Mugon hito: Koly protected Mugon in the same space
          const mugonAlsoHere = G.spaces[spIdx].slots[0].some(c => c && c.name === 'Mugon' && !c.faceDown && !c.effectDisabled);
          if (mugonAlsoHere) G.unlockProgress.kolyProtectedMugon = true;
        }
        break;
      }
      const feruzuTargets = [];
      for (let sl2 = 0; sl2 < 3; sl2++) {
        const c = space.slots[rival][sl2];
        if (!c || c.faceDown || c.baseValue !== 1) continue;
        if ((c.powerBonus||0) !== 0 || (c.existBonus||0) !== 0) continue; // potenciado (Ponce incluido)
        feruzuTargets.push({ c, sl2 });
      }
      if (feruzuTargets.length > 0 && await tryMugonSacrifice(rival, feruzuTargets[0].c)) {
        addLog(`Mugon se sacrifica — Feruzu no remueve ningún aliado rival.`, 'effect');
        break;
      }
      if (feruzuTargets.length > 0) playSound('feruzuKakomiRemove');
      for (const { c, sl2 } of feruzuTargets) {
        animateCardFromSlot(spIdx, rival, sl2, 'discard-pile-vis');
        space.slots[rival][sl2] = null;
        G.discard.push(c);
        addLog(`Feruzu: remueve ${c.displayName||c.name} (V1 sin potenciar).`, 'effect');
        // Track Feruzu hito: removed a rival Kakomi
        if (owner === 0 && c.name === 'Kakomi' && G.unlockProgress) {
          G.unlockProgress.feruzuRemovedKakomi = true;
        }
        // Track Feruzu removals per turn for Kakomi unlock
        if (owner === 0 && G.unlockProgress) {
          const t = G.turn;
          G.unlockProgress._kakomiTurnRemovals[t] = (G.unlockProgress._kakomiTurnRemovals[t] || 0) + 1;
          if (G.unlockProgress._kakomiTurnRemovals[t] >= 3) G.unlockProgress.kakomiRemovedThree = true;
        }
        // Track Kope unlock: rival removed a player card
        if (rival === 0 && G.unlockProgress) {
          G.unlockProgress.kopeRivalRemovedCount = (G.unlockProgress.kopeRivalRemovedCount || 0) + 1;
        }
        checkUsei(rival, spIdx, c);
      }
      break;
    }
    case 'Kakomi': {
      if (isProtected(rival, spIdx)) {
        addLog(`Cartas del rival protegidas de Kakomi (Koly).`, 'effect');
        // Progression: Koly blocked a removal against player (only if actual Koly card present, not just space effect)
        const rivalHasKolyK = G.spaces[spIdx].slots[rival].some(c => c && c.name === 'Koly' && !c.effectDisabled && !c.faceDown);
        if (rival === 0 && G.unlockProgress && rivalHasKolyK) {
          G.unlockProgress.kolyProtectedRemoval = true;
          G.unlockProgress._kolyProtectCount = (G.unlockProgress._kolyProtectCount || 0) + 1;
          // Mugon hito: Koly protected Mugon in the same space
          const mugonAlsoHereK = G.spaces[spIdx].slots[0].some(c => c && c.name === 'Mugon' && !c.faceDown && !c.effectDisabled);
          if (mugonAlsoHereK) G.unlockProgress.kolyProtectedMugon = true;
        }
        break;
      }
      const kakomiTargets = [];
      for (let sl2 = 0; sl2 < 3; sl2++) {
        const c = space.slots[rival][sl2];
        if (!c || c.faceDown || c.baseValue !== 1) continue;
        const totalBonus = (c.powerBonus||0) + (c.existBonus||0);
        if (totalBonus <= 0) continue;
        kakomiTargets.push({ c, sl2 });
      }
      if (kakomiTargets.length > 0 && await tryMugonSacrifice(rival, kakomiTargets[0].c)) {
        addLog(`Mugon se sacrifica — Kakomi no remueve ningún aliado rival.`, 'effect');
        break;
      }
      if (kakomiTargets.length > 0) playSound('feruzuKakomiRemove');
      for (const { c, sl2 } of kakomiTargets) {
        animateCardFromSlot(spIdx, rival, sl2, 'discard-pile-vis');
        space.slots[rival][sl2] = null;
        G.discard.push(c);
        addLog(`Kakomi: remueve ${c.displayName||c.name} (V1 potenciado).`, 'effect');
        // Track Kakomi hito: removed a rival Slau
        if (owner === 0 && c.name === 'Slau' && G.unlockProgress) {
          G.unlockProgress.kakomiremovedSlau = true;
        }
        checkUsei(rival, spIdx, c);
        // Track Kope unlock: rival removed a player card
        if (rival === 0 && G.unlockProgress) {
          G.unlockProgress.kopeRivalRemovedCount = (G.unlockProgress.kopeRivalRemovedCount || 0) + 1;
          // Ponce hito: rival removed player's Ponce
          if (c.name === 'Ponce') G.unlockProgress.ponceRemovedByRival = true;
        }
      }
      break;
    }
    case 'Tanozo': {
      if (condMet) {
        // Target the card placed this turn by the rival — including face-down ones
        const tanoTarget = space.slots[rival].find(c => c && c._placedThisTurn);
        if (tanoTarget) {
          tanoTarget.effectDisabled = true;
          tanoTarget._effectHidden = true; // hide effect text visually
          addLog(`Tanozo: ${tanoTarget.name} pierde sus efectos.`, 'effect');
          if (owner === 0 && G.unlockProgress) {
            G.unlockProgress.rivalPlacedCondTriggers++;
            // Tanozo hito: count rival cards whose effect was disabled by player's Tanozo
            G.unlockProgress._tanozoDisabledCount = (G.unlockProgress._tanozoDisabledCount || 0) + 1;
            if (G.unlockProgress._tanozoDisabledCount >= 3) G.unlockProgress.tanozoThreeDisabled = true;
            G.unlockProgress.suCondTriggers = (G.unlockProgress.suCondTriggers || 0) + 1;
            try { const SU_KEY='juego_cartas_su_triggers'; localStorage.setItem(SU_KEY, String(G.unlockProgress.suCondTriggers)); } catch {}
            // Tira hito: Tanozo succeeded in turn > 1
            if (G.turn > 1) {
              if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
              G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
            }
          }
        }
      }
      break;
    }
    case 'Humi': {
      const humiTargets = space.slots[rival].filter(c => c && c.baseValue===1 && c.type==='reveal' && !c.effectDisabled && !c.faceDown);
      if (humiTargets.length > 0) {
        let rv;
        if (humiTargets.length > 1 && rdEligeHumano(owner)) {
          addLog(`Humi: elige qué efecto rival replicar.`, 'important');
          rv = await pickCardFromBoard((c, si, side) => si === spIdx && side === rival && humiTargets.includes(c), { mandatory: true });
        } else {
          rv = humiTargets[0];
        }
        if (rv) {
          addLog(`Humi: replica Revelar de ${rv.name}.`, 'effect');
          const _humiBonusBefore = (card.powerBonus||0) + (card.existBonus||0);
          await doRevealEffect(rv, owner, spIdx, slIdx, card);
          const _humiBonus = (card.powerBonus||0) + (card.existBonus||0);
          if (_humiBonus > _humiBonusBefore) playSound('valorUp');
        }
      }
      break;
    }
    case 'Noira': {
      const alliesNoira = [];
      for (let ks = 0; ks < 3; ks++) {
        for (let sl2 = 0; sl2 < 3; sl2++) {
          const c = G.spaces[ks].slots[owner][sl2];
          if (c && c !== card && !c.faceDown && c.name !== 'Reki') alliesNoira.push({ c, ks, sl2 });
        }
      }
      if (alliesNoira.length > 0) {
        let chosen;
        if (rdEligeHumano(owner)) {
          addLog(`Noira: elige un aliado para devolver a tu mano.`, 'important');
          chosen = await pickCardFromBoard((c, si, side) => side === owner && alliesNoira.some(x => x.c === c), { mandatory: true });
        } else {
          chosen = alliesNoira[0].c;
        }
        if (chosen) {
          const entry = alliesNoira.find(x => x.c === chosen);
          G.spaces[entry.ks].slots[owner][entry.sl2] = null;
          chosen.faceDown = false;
          chosen.revealUsed = false; // reset so it can fire again if re-placed
          chosen.owner = owner;
          resetCardBonus(chosen);
          G.hands[owner].push(chosen);
          if (chosen.baseValue === 1) { _bt.powerBonus = (_bt.powerBonus||0) + 1; playSound('valorUp'); }
          addLog(`Noira: devuelve ${chosen.name} de E${[1,2,3][entry.ks]} a la mano${chosen.baseValue===1?', +1 Valor':''}.`, 'effect');
        }
      }
      break;
    }
    case 'Kope': {
      if (condNotMet) {
        // Collect all unprotected allied V1 targets (excluding Kope itself)
        const kopeTargets = [];
        for (let ks = 0; ks < 3; ks++) {
          if (isProtected(owner, ks)) continue;
          const kspace = G.spaces[ks];
          for (let sl2 = 0; sl2 < 3; sl2++) {
            const c = kspace.slots[owner][sl2];
            if (!c || c === card || c.baseValue !== 1) continue;
            kopeTargets.push({ c, ks, sl2 });
          }
        }
        if (kopeTargets.length > 0) {
          let chosen = null;
          if (rdEligeHumano(owner)) {
            addLog(`Kope: elige qué aliado de Valor 1 remueves.`, 'important');
            const picked = await pickCardFromBoard((c, si, side) =>
              side === owner && kopeTargets.some(t => t.c === c)
            , { mandatory: true });
            if (picked) chosen = kopeTargets.find(t => t.c === picked);   // [Corregido] antes buscaba picked.card y no removía nada
          } else {
            // AI: remove the V1 ally in the space it's least winning (sacrifice least valuable)
            chosen = kopeTargets.reduce((worst, t) => {
              const sc = computeSpaceScore(t.ks);
              const wScore = computeSpaceScore(worst.ks);
              return (sc.p1 - sc.p0) < (wScore.p1 - wScore.p0) ? t : worst;
            });
          }
          if (chosen) {
            const mugonSaved = await tryMugonSacrifice(owner, chosen.c);
            if (!mugonSaved) {
              animateCardFromSlot(chosen.ks, owner, chosen.sl2, 'discard-pile-vis');
              G.spaces[chosen.ks].slots[owner][chosen.sl2] = null;
              removeToDiscard(chosen.c);
              addLog(`Kope: remueve ${chosen.c.displayName||chosen.c.name} de E${[1,2,3][chosen.ks]}.`, 'effect');
              // Kope hito: check if Usei was present before checkUsei (it will be removed by it)
              const _kopeUseiWasPresent = owner === 0 && G.unlockProgress &&
                G.spaces.some(sp2 => sp2.slots[0].some(c2 => c2 && c2.name === 'Usei' && !c2.effectDisabled));
              // Tis+Usei hito: Kope removed Nugu specifically, and Tis+Usei are both allied in the Usei space
              let _kopeNuguRemoved = owner === 0 && G.unlockProgress && chosen.c.name === 'Nugu';
              let _tisPresentInUseiSpace = false;
              if (_kopeNuguRemoved && _kopeUseiWasPresent) {
                // Find which space has Usei + check if Tis is also there
                for (let _sp2 = 0; _sp2 < 3; _sp2++) {
                  const _slots = G.spaces[_sp2].slots[0];
                  const _hasUsei = _slots.some(c2 => c2 && c2.name === 'Usei' && !c2.effectDisabled);
                  const _hasTis  = _slots.some(c2 => c2 && c2.name === 'Tis');
                  if (_hasUsei && _hasTis) { _tisPresentInUseiSpace = true; break; }
                }
              }
              checkUsei(owner, chosen.ks, chosen.c);
              // If Usei was present and now the space became Real, hito is triggered
              if (_kopeUseiWasPresent && isRealSpace(chosen.ks)) {
                G.unlockProgress.kopeKilledAllyTriggeredUsei = true;
              }
              // Tis+Usei hito: Kope removed Nugu → Usei triggered Real → Tis also extinguished
              if (_kopeNuguRemoved && _tisPresentInUseiSpace) {
                // Verify Real was activated (Usei extinguished successfully)
                const _anyNewReal = [0,1,2].some(i => isRealSpace(i));
                if (_anyNewReal) G.unlockProgress.tisUseiFiredByKopeNugu = true;
              }
              // Track Su unlock: Kope triggered its "si el rival no colocó" condition
              if (owner === 0 && G.unlockProgress) {
                G.unlockProgress.suCondTriggers = (G.unlockProgress.suCondTriggers || 0) + 1;
                try { const SU_KEY='juego_cartas_su_triggers'; localStorage.setItem(SU_KEY, String(G.unlockProgress.suCondTriggers)); } catch {}
                // Tira hito: Kope succeeded in turn > 1
                if (G.turn > 1) {
                  if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
                  G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
                }
              }
            } else {
              addLog(`Mugon se sacrifica — Kope no remueve ningún aliado.`, 'effect');
            }
          }
        }
      }
      break;
    }
    case 'Menmei': {
      // Draw 1 unique V0 (not held by either player or on board) + 1 V1 from shared deck
      const allUsedV0Names = new Set([
        ...G.hands[0].map(c => c.name),
        ...G.hands[1].map(c => c.name),
        ...[0,1,2].flatMap(sp => [0,1].flatMap(side => G.spaces[sp].slots[side].filter(Boolean).map(c => c.name))),
      ]);
      const availableV0 = G.v0Pool.filter(c => !allUsedV0Names.has(c.name) && isCardUnlocked(c.name));
      if (availableV0.length > 0) {
        const v0card = availableV0[Math.floor(Math.random() * availableV0.length)];
        G.v0Pool.splice(G.v0Pool.indexOf(v0card), 1);
        G.usedV0Names.add(v0card.name);
        v0card.owner = owner;
        G.hands[owner].push(v0card);
        addLog(`Menmei: ${owner===0?'robas':'IA roba'} ${v0card.name} (V0).`, 'effect');
        // Menmei hito: player drew Su via Menmei
        if (owner === 0 && v0card.name === 'Su' && G.unlockProgress) {
          G.unlockProgress._menmeiDrewSu = true;
        }
        // Track max hand size for Foret unlock
        if (owner === 0 && G.unlockProgress && G.hands[0].length >= 5) G.unlockProgress.foretHand5 = true;
        render();
        // Animate from extinct pile to hand
        const fromEl = document.getElementById('extinct-pile-vis');
        const fromRect = fromEl ? fromEl.getBoundingClientRect()
          : { left: window.innerWidth/2, top: window.innerHeight/2, width: 52, height: 74 };
        if (owner === 0) {
          const lastEl = document.getElementById('hand-cards')?.lastElementChild;
          const toRect = lastEl ? lastEl.getBoundingClientRect()
            : { left: window.innerWidth/2, top: window.innerHeight-100, width: 170, height: 238 };
          await animateFlyCard(fromRect, toRect, Math.round(380 * OPTIONS.speedFactor));
        } else {
          const lastEl = document.getElementById('ai-hidden-hand')?.lastElementChild;
          const toRect = lastEl ? lastEl.getBoundingClientRect()
            : { left: window.innerWidth/2, top: 40, width: 140, height: 196 };
          await animateFlyCard(fromRect, toRect, Math.round(380 * OPTIONS.speedFactor));
        }
        await gameSleep(60);
        await checkSumaDraw(owner, v0card);
      } else {
        addLog(`Menmei: no quedan cartas V0 disponibles.`, 'effect');
      }
      // Draw 1 V1 from shared deck
      // Track Soi+Menmei hito: Menmei drew both cards while Soi was active (owner=player)
      if (owner === 0 && G.unlockProgress && soiActive()) {
        G.unlockProgress.soiMenmeiDrawTwo = true;
      }
      await drawCardsAnimated(owner, 1, true);
      break;
    }
    case 'Nofi': {
      if (condNotMet) {
        const others = [0,1,2].filter(i=>i!==spIdx&&!G.spaces[i].blocked&&!isRealSpace(i)&&
          G.spaces[i].slots[owner].some((x,si)=>x===null&&si<G.spaces[i].slotCount[owner]));
        if (others.length>0) {
          let destSlot = null;
          if (rdEligeHumano(owner)) {
            addLog(`Nofi: elige un hueco libre para colocar un Ery.`, 'important');
            destSlot = await pickSlotFromBoard((si, side, slIdx) =>
              others.includes(si) && side === owner &&
              G.spaces[si].slots[owner][slIdx] === null && slIdx < G.spaces[si].slotCount[owner]
            , { mandatory: true });
          } else {
            const destSp = others[0];
            const f = G.spaces[destSp].slots[owner].findIndex((x,i)=>x===null&&i<G.spaces[destSp].slotCount[owner]);
            if (f !== -1) destSlot = { spaceIdx: destSp, side: owner, slotIdx: f };
          }
          if (destSlot !== null) {
            placeCard(mkToken('Ery', owner), owner, destSlot.spaceIdx, destSlot.slotIdx, false, true);
            addLog(`Nofi: Ery en E${ [1,2,3][destSlot.spaceIdx]}.`, 'effect');
            // Track Su unlock: Nofi's "si el rival no colocó aquí" effect fired
            if (owner === 0 && G.unlockProgress) {
              G.unlockProgress.suCondTriggers = (G.unlockProgress.suCondTriggers || 0) + 1;
              try { const SU_KEY='juego_cartas_su_triggers'; localStorage.setItem(SU_KEY, String(G.unlockProgress.suCondTriggers)); } catch {}
              // Tira hito: Nofi succeeded in turn > 1
              if (G.turn > 1) {
                if (!G.unlockProgress._tiraCondSuccessTurns) G.unlockProgress._tiraCondSuccessTurns = new Set();
                G.unlockProgress._tiraCondSuccessTurns.add(G.turn);
              }
            }
          }
        }
      }
      // Track Nofi placement for Menmei unlock
      if (owner === 0 && G.unlockProgress) {
        G.unlockProgress._nofiPlacedThisTurn = true;
        G.unlockProgress._nofiSpaceThisTurn = spIdx;
      }
      break;
    }
    case 'Fukou': {
      G.pending_fukou.push({ target: rival, turn: G.turn + 1 });
      addLog(`Fukou: el rival robará un Erizo de Peluche Blanco el próximo turno.`, 'effect');
      break;
    }
    case 'Peroth': {
      const da = G.discard.filter(c => c.baseValue === 1);
      if (da.length > 0) {
        const validSpaces = [0,1,2].filter(i => {
          if (G.spaces[i].blocked || isRealSpace(i)) return false;
          return G.spaces[i].slots[owner].some((x, si) => x === null && si < G.spaces[i].slotCount[owner]);
        });
        if (validSpaces.length > 0) {
          let chosen = null;
          let destSlot = null;
          if (rdEligeHumano(owner)) {
            chosen = await chooseCard(da, 'Peroth: elige una carta V1 del descarte', { noCancel: true });
            if (chosen && rdEligeHumano(owner)) {
              addLog(`Peroth: elige el hueco destino.`, 'important');
              destSlot = await pickSlotFromBoard((si, side, slIdx) =>
                validSpaces.includes(si) && side === owner &&
                G.spaces[si].slots[owner][slIdx] === null && slIdx < G.spaces[si].slotCount[owner]
              , { mandatory: true });
            }
          } else {
            chosen = da[0];
            const destSp = validSpaces[0];
            const f = G.spaces[destSp].slots[owner].findIndex((x, i) => x === null && i < G.spaces[destSp].slotCount[owner]);
            if (f !== -1) destSlot = { spaceIdx: destSp, side: owner, slotIdx: f };
          }
          if (chosen && destSlot) {
            G.discard = G.discard.filter(c => c !== chosen);
            chosen.faceDown = false;
            chosen.revealUsed = false;
            placeCard(chosen, owner, destSlot.spaceIdx, destSlot.slotIdx, false, true);
            // Apply Yukoi bonus immediately (card is placed face-up, won't go through revealOwnerCards)
            if (chosen._yukoi_pending) {
              delete chosen._yukoi_pending;
              if (!isIsolatedSpace(destSlot.spaceIdx)) {
                rdConFuente('Yukoi', () => { chosen.powerBonus = (chosen.powerBonus||0) + 1; });
                addLog(`${chosen.name} gana +1 por Yukoi.`, 'effect');
                playSound('valorUp');
                if (owner === 0 && G.unlockProgress) {
                  G.unlockProgress.yukoiCrossSpace = true;
                  // Hito Yukoi "Melodía sorda"
                  G.unlockProgress._yukoiBoostedThisTurn = (G.unlockProgress._yukoiBoostedThisTurn||0) + 1;
                  if (G.unlockProgress._yukoiBoostedThisTurn >= 2) G.unlockProgress.yukoiBoostedTwoSameTurn = true;
                }
              } else {
                addLog(`${chosen.name} no gana +1 por Yukoi (espacio aislado).`, 'effect');
              }
            }
            applySpaceCardBonus(chosen, destSlot.spaceIdx);
            applyExistEffects();
            addLog(`Peroth: ${chosen.name} del descarte colocada en E${[1,2,3][destSlot.spaceIdx]}.`, 'effect');
            // Peroth hito: player's Peroth pulled Mugon from discard pile
            if (owner === 0 && chosen.name === 'Mugon' && G.unlockProgress) {
              G.unlockProgress.perothPlacedMugon = true;
            }
            // Tenpoh hito: player placed Tenpoh from discard via Peroth
            if (owner === 0 && chosen.name === 'Tenpoh' && G.unlockProgress) {
              G.unlockProgress.tenpohPlacedFromDiscard = true;
            }
            render();
            await gameSleep(500);
            // Trigger reveal effect of placed card
            if (chosen.type === 'reveal' && !chosen.revealUsed && !chosen.effectDisabled) {
              chosen.revealUsed = true;
              await doRevealEffect(chosen, owner, destSlot.spaceIdx, destSlot.slotIdx);
            }
          }
        } else {
          for (let i = 0; i < 2; i++) {
            if (G.deck.length > 0) {
              const c = G.deck.shift();
              addLog(`Peroth: sin huecos aliados libres — descarta ${c.name} del mazo.`, 'effect');
              await animateDeckToDiscard(c);
            }
          }
        }
      } else {
        for (let i = 0; i < 2; i++) {
          if (G.deck.length > 0) {
            const c = G.deck.shift();
            addLog(`Peroth: sin cartas V1 en descarte — descarta ${c.name} del mazo.`, 'effect');
            await animateDeckToDiscard(c);
          }
        }
      }
      break;
    }
    case 'Henos': {
      for (let p = 0; p < 2; p++) {
        const v1s = G.hands[p].map((c, i) => ({ c, i })).filter(({ c }) => c.baseValue === 1);
        if (v1s.length > 0) {
          const pick = v1s[Math.floor(Math.random() * v1s.length)];
          G.hands[p].splice(pick.i, 1);
          removeToDiscard(pick.c);
          addLog(`Henos: ${p === 0 ? 'tú descartas' : 'la IA descarta'} ${pick.c.displayName || pick.c.name} al azar.`, 'effect');
        } else {
          addLog(`Henos: ${p === 0 ? 'tú no tienes' : 'la IA no tiene'} cartas de Valor 1 en mano.`, 'effect');
        }
      }
      // Henos hito: both players end up with 0 cards in hand after Henos discards
      if (owner === 0 && G.unlockProgress && G.hands[0].length === 0 && G.hands[1].length === 0) {
        G.unlockProgress.henosBothHandsEmpty = true;
      }
      render();
      break;
    }
    case 'Naiki': {
      for (let p = 0; p < 2; p++) {
        for (let i = 0; i < 2; i++) {
          if (G.deck.length > 0) {
            const c = G.deck.shift();
            addLog(`Naiki: ${p===0?'tú descartas':'IA descarta'} ${c.name} del mazo.`, 'effect');
            await animateDeckToDiscard(c);
            // Track rival deck discards for Tanna unlock
            if (owner === 0 && G.unlockProgress && p === 1) G.unlockProgress._tannaRivalDeckDiscards++;
          }
        }
      }
      // Track Naiki placements for Henos unlock
      if (owner === 0 && G.unlockProgress) {
        G.unlockProgress._naikiPlacedCount++;
        const NAIKI_KEY = 'juego_cartas_naiki_count';
        try {
          const prev = parseInt(localStorage.getItem(NAIKI_KEY) || '0');
          const newTotal = prev + 1;
          localStorage.setItem(NAIKI_KEY, String(newTotal));
          if (newTotal >= 3) G.unlockProgress.henosNaiki3 = true;
        } catch {}
      }
      break;
    }
    case 'Mega': {
      let megaBoosted = false;
      for(let sp2=0;sp2<3;sp2++){
        if(sp2 !== spIdx && isIsolatedSpace(sp2)) continue; // external effects blocked
        const sc=computeSpaceScore(sp2);
        if(sc.winner!==owner){
          const allies = G.spaces[sp2].slots[owner].filter(c => c && c.baseValue===1);
          if (allies.length > 0) {
            allies.forEach(c => { c.powerBonus=(c.powerBonus||0)+1; });
            addLog(`Mega: aliados en E${[1,2,3][sp2]} +1 Valor.`,'effect');
            megaBoosted = true;
            // Mega hito: track spaces boosted while losing
            if (owner === 0 && G.unlockProgress) {
              if (!G.unlockProgress._megaBoostedSpaces) G.unlockProgress._megaBoostedSpaces = [];
              if (!G.unlockProgress._megaBoostedSpaces.includes(sp2)) G.unlockProgress._megaBoostedSpaces.push(sp2);
            }
          }
        }
      }
      if (megaBoosted) playSound('valorUp');
      break;
    }
    case 'Neutra': {
      // "Las cartas en este espacio no pueden ser movidas." — Neutra cannot swap in this space
      if (space.effectRevealed && space.effectText && space.effectText.includes('Las cartas en este espacio no pueden ser movidas')) {
        addLog(`Neutra: el efecto del espacio impide mover cartas aquí.`, 'effect');
        break;
      }
      const rivalTargets = [];
      for (let sl2=0;sl2<3;sl2++){
        const c=space.slots[rival][sl2];
        if(c) rivalTargets.push({c,s:rival,sl:sl2});
      }
      if(rivalTargets.length>0){
        let chosen;
        if (rdEligeHumano(owner)) {
          addLog(`Neutra: elige una carta rival de este espacio para intercambiar.`, 'important');
          chosen = await pickCardFromBoard((c, si, side) => si === spIdx && side === rival && rivalTargets.some(x => x.c === c), { mandatory: true });
        } else {
          chosen = rivalTargets[Math.floor(Math.random()*rivalTargets.length)].c;
        }
        if(chosen){
          const entry=rivalTargets.find(x=>x.c===chosen);
          let nSide=-1,nSl=-1;
          for(let s=0;s<2;s++) for(let sl2=0;sl2<3;sl2++) if(space.slots[s][sl2]===card){nSide=s;nSl=sl2;}
          if(nSide!==-1&&entry){
            // If face-down: reveal in place first, then swap
            if (chosen.faceDown) {
              chosen.faceDown = false;
              playSound('reveal');
              addLog(`Neutra revela: ${chosen.name} en Espacio ${[1,2,3][spIdx]}.`, 'effect');
              applySpaceCardBonus(chosen, spIdx);
              render();
              await gameSleep(600);
              if (chosen.type === 'reveal' && !chosen.revealUsed && !chosen.effectDisabled) {
                chosen.revealUsed = true;
                await doRevealEffect(chosen, chosen.owner, spIdx, entry.sl);
              }
            }
            // Now swap positions and ownership
            space.slots[nSide][nSl] = chosen;
            space.slots[entry.s][entry.sl] = card;
            const tmpOwner = card.owner;
            card.owner = chosen.owner;
            chosen.owner = tmpOwner;
            addLog(`Neutra: intercambia con ${chosen.name}.`, 'effect');
            // Neutra hito: Destinada used Nugu+Neutra AND Neutra just swapped with rival ErizoPeluche
            if (owner === 0 && G.unlockProgress &&
                G.unlockProgress._neutraDestinadaUsedNuguNeutra &&
                chosen.name === 'ErizoPeluche') {
              G.unlockProgress.neutraDestinadaSwapErizo = true;
            }
            playSound('rasuNeutraMove');
          }
        }
      }
      break;
    }
    case 'Nasu': {
      const nasuTarget = 1 - owner;
      // First turn: push for next turn; renewal handled each turn in resolvePhase turn increment
      if (!G.pending_nasu.some(n => n.spIdx === spIdx && n.target === nasuTarget && n.turn === G.turn + 1)) {
        G.pending_nasu.push({ spIdx, turn: G.turn + 1, target: nasuTarget });
      }
      addLog(`Nasu: el rival debe jugar en E${[1,2,3][spIdx]} mientras esté aquí.`, 'effect');
      break;
    }
    case 'Rasu': {
      // "Las cartas en este espacio no pueden ser movidas." — Rasu cannot move cards out
      if (space.effectRevealed && space.effectText && space.effectText.includes('Las cartas en este espacio no pueden ser movidas')) {
        addLog(`Rasu: el efecto del espacio impide mover cartas aquí.`, 'effect');
        break;
      }
      const allHere = []; // FIX: was missing declaration — caused ReferenceError / freeze
      for (let s = 0; s < 2; s++) for (let sl2 = 0; sl2 < 3; sl2++) {
        const c = space.slots[s][sl2]; if (c) allHere.push({ c, s, sl: sl2 });
      }
      if (allHere.length > 0) {
        let chosen;
        if (rdEligeHumano(owner)) {
          addLog(`Rasu: elige una carta de este espacio para mover.`, 'important');
          chosen = await pickCardFromBoard((c, si) => si === spIdx && allHere.some(x => x.c === c), { mandatory: true });
        } else {
          // AI: pick the best card to move
          // Priority: prefer moving rival (player) cards that are hurting the AI here
          // If space has "más cartas de valor 0" effect, prioritise moving a rival V0 card
          const isV0Space = space.effectRevealed && space.effectText && space.effectText.includes('más cartas de valor 0 tenga');
          if (isV0Space) {
            const rivalV0Here = allHere.filter(x => x.s === 0 && x.c.baseValue === 0);
            chosen = rivalV0Here.length > 0 ? rivalV0Here[0].c : allHere[0].c;
          } else {
            // Prefer revealed rival cards (player = side 0) — moving them disrupts the player
            // Among rival cards, pick the one contributing most value to their score in this space
            const rivalCards = allHere.filter(x => x.s === 0 && !x.c.faceDown);
            if (rivalCards.length > 0) {
              // Pick the rival card with the highest effective value
              chosen = rivalCards.reduce((best, x) => {
                const bv = (best.c.baseValue||0) + (best.c.powerBonus||0) + (best.c.existBonus||0);
                const xv = (x.c.baseValue||0) + (x.c.powerBonus||0) + (x.c.existBonus||0);
                return xv > bv ? x : best;
              }).c;
            } else {
              // No visible rival cards — fall back to first available
              chosen = allHere[0].c;
            }
          }
        }
        if (chosen) {
          const entry = allHere.find(x => x.c === chosen);
          // Build candidate destinations — filter out spaces that would benefit the rival
          const candidateOthers = [0,1,2].filter(i => i !== spIdx && !G.spaces[i].blocked && !isRealSpace(i)
            && G.spaces[i].slots[entry.s].some((x, si) => x === null && si < G.spaces[i].slotCount[entry.s]));
          // For AI moves: exclude destinations where moving the rival card there would make the rival win that space
          const othersFiltered = (owner === 1 && !rdHumano(1))
            ? candidateOthers.filter(destIdx => {
                const destSpace = G.spaces[destIdx];
                const freeSlIdx = destSpace.slots[entry.s].findIndex((x, si) => x === null && si < destSpace.slotCount[entry.s]);
                if (freeSlIdx === -1) return true; // shouldn't happen but allow
                // Simulate: place rival card there temporarily
                destSpace.slots[entry.s][freeSlIdx] = chosen;
                const simScore = computeSpaceScore(destIdx);
                destSpace.slots[entry.s][freeSlIdx] = null;
                // Only allow if moving there does NOT make the rival (player, side 0) win that space
                return !(entry.s === 0 && simScore.winner === 0);
              })
            : candidateOthers;
          // If all destinations were filtered out by AI logic, fall back to all candidate destinations
          const others = (owner === 1 && !rdHumano(1) && othersFiltered.length === 0) ? candidateOthers : othersFiltered;
          if (others.length > 0) {
            let destSlot = null;
            if (rdEligeHumano(owner)) {
              addLog(`Rasu: elige la casilla destino.`, 'important');
              destSlot = await pickSlotFromBoard((si, side, slIdx) =>
                others.includes(si) && side === entry.s &&
                G.spaces[si].slots[entry.s][slIdx] === null && slIdx < G.spaces[si].slotCount[entry.s]
              , { mandatory: true });
            } else {
              const dest = others[0];
              const f = G.spaces[dest].slots[entry.s].findIndex((x, i) => x === null && i < G.spaces[dest].slotCount[entry.s]);
              if (f !== -1) destSlot = { spaceIdx: dest, side: entry.s, slotIdx: f };
            }
            if (destSlot) {
              space.slots[entry.s][entry.sl] = null;
              // Restore effectDisabled if leaving a "existir no funciona" space
              if (chosen.type === 'exist' && chosen.name !== 'Reki' && chosen.effectDisabled &&
                  space.effectRevealed && space.effectText && space.effectText.includes('Los efectos de existir no funcionan aquí')) {
                chosen.effectDisabled = false;
              }
              G.spaces[destSlot.spaceIdx].slots[entry.s][destSlot.slotIdx] = chosen;
              // If the moved card was face-down, reveal it now — it may land after revealOwnerCards
              // has already run (e.g. final turn), so it must be flipped here to avoid staying hidden.
              if (chosen.faceDown) {
                chosen.faceDown = false;
                if (chosen.baseValue === 0) playV0EntrySound(chosen.name);
                playSound('reveal');
                addLog(`${entry.s===0?'Tú revelas':'IA revela'} a ${chosen.name} (movida por Rasu) en Espacio ${[1,2,3][destSlot.spaceIdx]}, hueco ${destSlot.slotIdx+1}.`, entry.s===0?'important':'ai');
              }
              // Disable if entering a "existir no funciona" space
              const dsDest = G.spaces[destSlot.spaceIdx];
              if (chosen.type === 'exist' && chosen.name !== 'Reki' && !chosen.effectDisabled &&
                  dsDest.effectRevealed && dsDest.effectText && dsDest.effectText.includes('Los efectos de existir no funcionan aquí')) {
                chosen.effectDisabled = true;
              }
              checkHanoe(entry.s, destSlot.spaceIdx);
              addLog(`Rasu: mueve ${chosen.name} a E${[1,2,3][destSlot.spaceIdx]}.`, 'effect');
              playSound('rasuNeutraMove');
              // Reina hito: track if player's Reina was moved (by Rasu)
              if (owner === 0 && G.unlockProgress && chosen.name === 'Reina') {
                G.unlockProgress._reinaWasMoved = true;
              }
              if (owner === 0 && G.unlockProgress) {
                G.unlockProgress._cardsMoved = (G.unlockProgress._cardsMoved || 0) + 1;
                if (G.unlockProgress._cardsMoved >= 2) G.unlockProgress.granDemonioMoved2 = true;
                if (G.unlockProgress._cardsMoved >= 3) G.unlockProgress.demaeMoved3 = true;
              }
            }
          } else {
            addLog(`Rasu: no hay espacios válidos a los que mover la carta.`, 'effect');
          }
        }
      }
      break;
    }
    case 'Una': {
      // Safety: verify Una is actually on the board at spIdx before proceeding
      const unaOnBoard = G.spaces[spIdx].slots[owner].some(c => c === card) ||
                         G.spaces[spIdx].slots[1-owner].some(c => c === card);
      if (!unaOnBoard) {
        addLog(`Una: efecto ignorado (carta no está en el tablero).`, 'effect');
        break;
      }
      const others = [0,1,2].filter(i => i !== spIdx && !isRealSpace(i));
      let dest;
      if (rdEligeHumano(owner)) {
        addLog(`Tu Una: elige el espacio con el que intercambiar el efecto.`, 'important');
        dest = others.length === 1 ? others[0] : await pickSpaceFromBoard(i => others.includes(i), { mandatory: true });
      } else {
        // AI: simulate each swap and pick the one that maximises AI spaces won
        let bestDest = others[0], bestScore = -Infinity;
        const origEffect = space.effectText;
        for (const d of others) {
          const origDest = G.spaces[d].effectText;
          // Simulate swap
          space.effectText = origDest;
          G.spaces[d].effectText = origEffect;
          const wins = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
          const thisSpace = computeSpaceScore(spIdx).winner;
          const sc = thisSpace === 1 ? 1 : thisSpace === -1 ? 0 : -1;
          const total = wins * 10 + sc;
          // Undo swap
          space.effectText = origEffect;
          G.spaces[d].effectText = origDest;
          if (total > bestScore) { bestScore = total; bestDest = d; }
        }
        dest = bestDest;
      }
      if (dest !== null) {
        const sa = G.spaces[spIdx];
        const sb = G.spaces[dest];
        // Swap all effect-related state (not slots/slotCount — those belong to the cards)
        const swapKeys = ['effectText', 'poolIdx', 'effectRevealed', 'fogged',
                          'exploredBy', '_erizoDone', '_hideUntilEnd', '_pendingFogLift', '_pendingRevealEffect', '_peakScore'];
        for (const key of swapKeys) {
          const tmp = sa[key];
          sa[key] = sb[key];
          sb[key] = tmp;
        }
        // Log appropriately — mention if dest was still fogged (it stays fogged after swap)
        const destWasFogged = sa.fogged; // after swap, sa now has what was sb's fogged state
        addLog(`Una (${owner===0?'tuya':'IA'}): efectos de E${[1,2,3][spIdx]} y E${[1,2,3][dest]} intercambiados${destWasFogged ? ' (E'+[1,2,3][spIdx]+' queda sin descubrir)' : ''}.`, 'effect');
        // (Una hito is checked at game end)
        playSound('spaceChange');
        render();
        await sleep(50);
        const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
        for (const i of [spIdx, dest]) {
          const loc = spaceEls?.[i]?.querySelector('.space-location');
          if (loc) { loc.classList.add('swapping'); setTimeout(() => loc.classList.remove('swapping'), 900); }
        }
        await gameSleep(400);
      }
      break;
    }
    case 'Moira': {
      // "Remueve un Valor 1 aliado y enemigo."
      // Conditions to fire: player must have a V1 ally somewhere, rival must have a V1 somewhere.
      // Search ALL spaces for player and rival V1s
      const moiraAllyTargets = [];
      const moiraRivalTargets = [];
      for (let ms = 0; ms < 3; ms++) {
        const mspace = G.spaces[ms];
        for (let sl2 = 0; sl2 < 3; sl2++) {
          const ca = mspace.slots[owner][sl2];
          if (ca && !ca.faceDown && ca.baseValue === 1) moiraAllyTargets.push({ c:ca, ms, sl:sl2 });
          const cr = mspace.slots[rival][sl2];
          if (cr && !cr.faceDown && cr.baseValue === 1) moiraRivalTargets.push({ c:cr, ms, sl:sl2 });
        }
      }
      if (moiraAllyTargets.length === 0) {
        addLog(`Moira: no hay aliados de Valor 1 — efecto cancelado.`, 'effect');
        break;
      }
      if (moiraRivalTargets.length === 0) {
        addLog(`Moira: el rival no tiene Valor 1 — efecto cancelado.`, 'effect');
        break;
      }
      // Pick ally to remove
      let moiraAllyChosen = null;
      if (rdEligeHumano(owner)) {
        addLog(`Moira: elige qué aliado de Valor 1 remueves.`, 'important');
        const picked = await pickCardFromBoard((c, si, side) =>
          side === owner && moiraAllyTargets.some(t => t.c === c)
        , { mandatory: true });
        if (picked) moiraAllyChosen = moiraAllyTargets.find(t => t.c === picked);
      } else {
        // AI: sacrifice the ally in the space where it helps least
        moiraAllyChosen = moiraAllyTargets.reduce((worst, t) => {
          const sc = computeSpaceScore(t.ms);
          const wsc = computeSpaceScore(worst.ms);
          return (sc.p1 - sc.p0) < (wsc.p1 - wsc.p0) ? t : worst;
        });
      }
      // Pick rival to remove
      let moiraRivalChosen = null;
      if (rdEligeHumano(owner)) {
        addLog(`Moira: elige qué enemigo de Valor 1 remueves.`, 'important');
        const picked = await pickCardFromBoard((c, si, side) =>
          side === 1 - owner && moiraRivalTargets.some(t => t.c === c)
        , { mandatory: true });
        if (picked) moiraRivalChosen = moiraRivalTargets.find(t => t.c === picked);
      } else {
        // AI: remove the rival (player) V1 in the space where it hurts AI most
        moiraRivalChosen = moiraRivalTargets.reduce((best, t) => {
          const sc = computeSpaceScore(t.ms);
          const bsc = computeSpaceScore(best.ms);
          return (sc.p0 - sc.p1) > (bsc.p0 - bsc.p1) ? t : best;
        });
      }
      // Remove ally
      if (moiraAllyChosen) {
        // Track hito "Jugada invisible": Moira removed an ally → Usei extinguishes
        const _moiraUseiWasPresent = owner === 0 && G.unlockProgress &&
          G.spaces.some(sp2 => sp2.slots[0].some(c2 => c2 && c2.name === 'Usei' && !c2.effectDisabled));
        animateCardFromSlot(moiraAllyChosen.ms, owner, moiraAllyChosen.sl, 'discard-pile-vis');
        G.spaces[moiraAllyChosen.ms].slots[owner][moiraAllyChosen.sl] = null;
        removeToDiscard(moiraAllyChosen.c);
        addLog(`Moira: remueve ${moiraAllyChosen.c.displayName||moiraAllyChosen.c.name} aliado de E${[1,2,3][moiraAllyChosen.ms]}.`, 'effect');
        checkUsei(owner, moiraAllyChosen.ms, moiraAllyChosen.c);
        // Hito "Jugada invisible": if Usei was present and now the space is Real
        if (_moiraUseiWasPresent && owner === 0 && G.unlockProgress) {
          if ([0,1,2].some(i => isRealSpace(i))) {
            G.unlockProgress.moiraUseiHitoActivated = true;
          }
        }
      }
      // Remove rival
      if (moiraRivalChosen) {
        if (isProtected(rival, moiraRivalChosen.ms)) {
          addLog(`Moira: el rival está protegido por Koly en E${[1,2,3][moiraRivalChosen.ms]} — la remoción rival se cancela.`, 'effect');
        } else {
          const mugonSaved = await tryMugonSacrifice(rival, moiraRivalChosen.c);
          if (!mugonSaved) {
            animateCardFromSlot(moiraRivalChosen.ms, rival, moiraRivalChosen.sl, 'discard-pile-vis');
            G.spaces[moiraRivalChosen.ms].slots[rival][moiraRivalChosen.sl] = null;
            removeToDiscard(moiraRivalChosen.c);
            addLog(`Moira: remueve ${moiraRivalChosen.c.displayName||moiraRivalChosen.c.name} rival de E${[1,2,3][moiraRivalChosen.ms]}.`, 'effect');
            checkUsei(rival, moiraRivalChosen.ms, moiraRivalChosen.c);
            // Track Kope unlock: rival removed a player card
            if (rival === 0 && G.unlockProgress) {
              G.unlockProgress.kopeRivalRemovedCount = (G.unlockProgress.kopeRivalRemovedCount || 0) + 1;
            }
          }
        }
      }
      break;
    }
    case 'Yuta': {
      // Determine which space to change — player clicks a space frame, AI picks best
      let targetSp = spIdx; // default to own space
      if (rdEligeHumano(owner)) {
        addLog(`Yuta: elige el espacio cuyo efecto quieres cambiar.`, 'important');
        const picked = await pickSpaceFromBoard(i => {
          if (isRealSpace(i)) return false;
          // Cannot target an isolated space from outside it
          if (i !== spIdx && isIsolatedSpace(i)) return false;
          return true;
        }, { mandatory: true });
        if (picked === null) break;
        targetSp = picked;
      } else {
        // AI: try each non-real, non-isolated-from-outside space, pick the one where changing gives most wins
        let bestScore = -Infinity;
        for (let ts = 0; ts < 3; ts++) {
          if (isRealSpace(ts)) continue;
          if (ts !== spIdx && isIsolatedSpace(ts)) continue; // cannot target isolated space from outside
          const pool = SPACE_EFFECTS[G.spaces[ts].poolIdx ?? ts].filter(e => e !== G.spaces[ts].effectText);
          if (!pool.length) continue;
          const origEff = G.spaces[ts].effectText;
          for (const eff of pool) {
            G.spaces[ts].effectText = eff;
            const wins = [0,1,2].filter(i => computeSpaceScore(i).winner === 1).length;
            if (wins > bestScore) { bestScore = wins; targetSp = ts; }
          }
          G.spaces[ts].effectText = origEff;
        }
      }

      const targetSpace = G.spaces[targetSp];
      // Roloc restriction
      const rolocSp2 = rolocSpaceIdx();
      if (rolocSp2 !== -1 && targetSp !== rolocSp2) {
        addLog(`Yuta: efecto bloqueado por Roloc (solo puede cambiar el efecto en E${[1,2,3][rolocSp2]}).`, 'effect');
        break;
      }

      const pool = SPACE_EFFECTS[targetSpace.poolIdx ?? targetSp].filter(e => e !== targetSpace.effectText);
      if (!pool.length) { addLog(`Yuta: no hay efectos alternativos disponibles.`, 'effect'); break; }

      // Yuta hito: check if player was losing this space before the change
      const _yutaWasLosing = owner === 0 && computeSpaceScore(targetSp).winner !== 0;
      if (owner === 0 && G.unlockProgress) {
        if (!G.unlockProgress._yutaChangedSpaces) G.unlockProgress._yutaChangedSpaces = [];
        G.unlockProgress._yutaChangedSpaces.push({ spaceIdx: targetSp, wasLosing: _yutaWasLosing, lastTurn: G.turn === G.maxTurns });
      }

      // New effect is random from pool (different from current)
      const chosenEffect = pool[Math.floor(Math.random() * pool.length)];

      // Reset previous effect state before applying new one
      if (targetSpace.effectText.includes('alarga un turno') && G.extraTurn) {
        G.extraTurn = false;
        G.maxTurns = 6;
        addLog(`Yuta: el turno extra se cancela.`, 'effect');
      }
      // If the old effect was "existir no funciona", restore exist cards in this space
      if (targetSpace.effectText.includes('Los efectos de existir no funcionan aquí')) {
        for (let side = 0; side < 2; side++)
          for (let sl = 0; sl < 3; sl++) {
            const c = targetSpace.slots[side][sl];
            if (c && c.type === 'exist' && c.effectDisabled) {
              c.effectDisabled = false;
              addLog(`${c.displayName||c.name}: efecto restaurado al cambiar el efecto del espacio.`, 'effect');
            }
          }
      }
      targetSpace._hideUntilEnd = false;
      targetSpace.slotCount = [3, 3];
      targetSpace.effectText = chosenEffect;
      targetSpace.effectRevealed = true;
      await applySpaceOnReveal(targetSp);
      addLog(`Yuta: E${[1,2,3][targetSp]} cambia al azar a "${targetSpace.effectText}".`, 'effect');
      break;
    }
    case 'Reiza': {
      const gatito = mkToken('Gatito', owner);
      G.extinct.push(gatito);
      addLog(`Reiza: un Gatito entra en la pila de extinción.`, 'effect');
      playSound('gatitoSpawn');
      render();
      break;
    }
    case 'Reki': {
      // Reki is now an exist card — no reveal effect
      addLog(`Reki: efectos ignorados en E${[1,2,3][spIdx]}.`, 'effect');
      break;
    }
    case 'Tei': {
      const v1sInDeck = G.deck.slice(-4).filter(c => c.baseValue === 1);
      if (v1sInDeck.length > 0) {
        const others = [0,1,2].filter(i => {
          if (i === spIdx || G.spaces[i].blocked || isRealSpace(i)) return false;
          // Tei is in spIdx (outside), so it's "foreign" to any other isolated space
          if (isIsolatedSpace(i)) return false;
          // AI: never place in a space that extinguishes V0 cards (carta quedaría extinguida sin beneficio)
          if (owner !== 0 && G.spaces[i].effectRevealed && getActiveEffects(i).some(e => e.includes('Valor 0') && e.includes('extinguen'))) return false;
          const ds = G.spaces[i];
          return ds.slots[owner].some((x, si) => x === null && si < ds.slotCount[owner]);
        });
        let chosen = null;
        if (rdEligeHumano(owner)) {
          chosen = await chooseCard(v1sInDeck, 'Tei: elige una carta V1 del mazo para colocarla como V0');
        } else {
          // AI prioritises exist-type cards that benefit from being placed as V0
          const TEI_PRIORITY = ['Chiouri','Koly','Reina','Ziru','Slau','Mugon','Yiren','Tira','Soi','Filia','Miboro','Imi','Etza','Tenpoh'];
          chosen = v1sInDeck.find(c => TEI_PRIORITY.includes(c.name)) ?? v1sInDeck[0];
        }
        if (chosen) {
          let destSpace = null, destSlot = null;
          if (rdHumano(owner)) {
            // Check if there are any valid destination slots before asking the player
            const teiFilterFn = (si, side, slIdx) => {
              if (side !== owner || si === spIdx) return false;
              if (G.spaces[si].blocked || isRealSpace(si)) return false;
              if (isIsolatedSpace(si)) return false;
              return G.spaces[si].slots[owner][slIdx] === null && slIdx < G.spaces[si].slotCount[owner];
            };
            const hasValidDest = [0,1,2].some(si =>
              G.spaces[si].slots[owner].some((_, slIdx) => teiFilterFn(si, owner, slIdx))
            );
            if (!hasValidDest) break; // No valid destination — skip silently
            // Player picks directly on the board
            addLog('Tei: elige un hueco libre aliado en otro espacio.', 'important');
            rdEligeHumano(owner);
            const picked = await pickSlotFromBoard(teiFilterFn, { mandatory: true });
            if (picked) { destSpace = picked.spaceIdx; destSlot = picked.slotIdx; }
          } else {
            destSpace = others[0] ?? null;
            if (destSpace !== null) {
              const ds = G.spaces[destSpace];
              destSlot = ds.slots[owner].findIndex((x, i) => x === null && i < ds.slotCount[owner]);
            }
          }
          if (destSpace !== null && destSlot !== null && destSlot !== -1) {
            const di = G.deck.indexOf(chosen);
            if (di !== -1) G.deck.splice(di, 1);
            chosen.baseValue = 0; chosen.value = 0;
            const deckEl = document.getElementById('deck-pile-vis');
            const fromRect = deckEl ? deckEl.getBoundingClientRect()
              : { left: window.innerWidth - 70, top: window.innerHeight / 2, width: 52, height: 74 };
            placeCard(chosen, owner, destSpace, destSlot, false, true);
            chosen._teiForced0 = true; // Tei placed as V0: never gains visual value
            addLog(`Tei: ${chosen.name} colocada como V0 en E${[1,2,3][destSpace]}.`, 'effect');
            // Tei hito: placed a V1-as-V0 in a V0-extinguish space
            if (owner === 0 && G.unlockProgress) {
              const destEff = G.spaces[destSpace];
              if (destEff.effectRevealed && destEff.effectText &&
                  destEff.effectText.includes('Valor 0') && destEff.effectText.includes('extinguen')) {
                G.unlockProgress.teiPlacedV1InExtinctSpace = true;
              }
            }
            // Track Roloc unlock: record original type of card placed by Tei
            if (owner === 0 && G.unlockProgress) {
              const origType = CARD_DB[chosen.name]?.type || chosen.type;
              if (origType === 'exist' || origType === 'reveal' || origType === 'special') {
                if (!G.unlockProgress.rolocTeiTypesUsed) G.unlockProgress.rolocTeiTypesUsed = {};
                G.unlockProgress.rolocTeiTypesUsed[origType] = true;
                try {
                  const ROLOC_KEY = 'juego_cartas_roloc_tei_types';
                  const prev = JSON.parse(localStorage.getItem(ROLOC_KEY) || '{}');
                  prev[origType] = true;
                  localStorage.setItem(ROLOC_KEY, JSON.stringify(prev));
                } catch {}
              }
            }
            render();
            const spaceEls = document.getElementById('spaces-area')?.querySelectorAll('.space');
            const rows = spaceEls?.[destSpace]?.querySelectorAll('.slots-row');
            const rowEl = rows?.[owner === 1 ? 0 : 1];
            const slotEls = rowEl?.querySelectorAll('.slot');
            const toRect = slotEls?.[destSlot]?.getBoundingClientRect()
              ?? { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 52, height: 74 };
            await animateFlyCard(fromRect, toRect, Math.round(420 * OPTIONS.speedFactor));
            playSound('place');

            // Chequeo inmediato: si el espacio destino extingue V0, la carta de Tei se extingue al instante
            const destSpaceObj = G.spaces[destSpace];
            const destEffects = getActiveEffects(destSpace);
            if (
              chosen.baseValue === 0 &&
              chosen.name !== 'Reki' &&
              !destSpaceObj._realActive &&
              destSpaceObj.effectRevealed &&
              destEffects.some(e => e.includes('se extinguen'))
            ) {
              await gameSleep(300);
              animateCardFromSlot(destSpace, owner, destSlot, 'extinct-pile-vis');
              destSpaceObj.slots[owner][destSlot] = null;
              extinguishCard(chosen);
              addLog(`${chosen.name} se extingue por efecto del Espacio ${[1,2,3][destSpace]}.`, 'effect');
              // Track Reiza unlock
              if (owner === 0 && G.unlockProgress && destEffects.some(e => e.includes('Valor 0') && e.includes('extinguen'))) {
                G.unlockProgress.reizaExtinctV0Effect = true;
              }
              render();
              await gameSleep(1000);
              triggerReal(destSpace);
              render();
              await gameSleep(300);
            }
          }
        }
      }
      break;
    }
  }
}

// ══════════════════════════════════════════════════════════
//  EXIST EFFECTS (applied each time scoring is done)
// ══════════════════════════════════════════════════════════
let _existSoundEnabled = false;

/* [Nuevo] QUIÉN CAMBIA EL VALOR DE CADA CARTA: mientras actúa un efecto, RD_FUENTE.actual dice de quién es
   (una carta o «Espacio N»); las cartas del tablero lo anotan solas al cambiar su Valor (ver efectos_visibles.js) */
const RD_FUENTE = { actual: null };
function rdConFuente(fuente, fn){ const prev = RD_FUENTE.actual; RD_FUENTE.actual = fuente; try { return fn(); } finally { RD_FUENTE.actual = prev; } }

function applyExistEffects() {
  const _fuentePrev = RD_FUENTE.actual; RD_FUENTE.actual = '__reset';   // [Nuevo] el reinicio borra lo anotado de «existir»
  try { applyExistEffectsCuerpo(); } finally { RD_FUENTE.actual = _fuentePrev; }
}
function applyExistEffectsCuerpo() {
  // Step 1: Reset all dynamic (exist) bonuses and restaLocked
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    for (let side = 0; side < 2; side++)
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (c) { c.existBonus = 0; delete c.restaLocked; }
      }
  }

  // Step 1c: Roloc — propagate continuous space effects to other spaces
  {
    const rsp = rolocSpaceIdx();
    const rolocEff = rsp !== -1 ? (G.spaces[rsp].effectText || '') : '';
    const rolocRestrictsSlots = rolocEff.includes('Sólo hay un hueco aquí');
    for (let sp = 0; sp < 3; sp++) {
      const space = G.spaces[sp];
      // Restore slotCount if it was overridden by Roloc but Roloc is no longer active there,
      // or Roloc moved to a space that doesn't restrict slots
      if (rsp === -1 || sp === rsp || !rolocRestrictsSlots) {
        // Only restore if slotCount was forced to 1 by Roloc (not by the space's own effect)
        if (space._rolocSlotOverride) {
          space.slotCount = [3, 3];
          delete space._rolocSlotOverride;
        }
      }
    }
    if (rsp !== -1) {
      // Roloc hito: player owns Roloc and is propagating a V0-extinguish effect to other spaces
      if (G.unlockProgress && G.spaces[rsp].slots[0].some(c => c && c.name === 'Roloc' && !c.faceDown && !c.effectDisabled)) {
        if (rolocEff.includes('Valor 0') && rolocEff.includes('extinguen')) {
          G.unlockProgress.rolocPropagatedExtinct = true;
        }
      }
      for (let sp = 0; sp < 3; sp++) {
        const space = G.spaces[sp];
        if (rolocEff.includes('Sólo hay un hueco aquí')) {
          if (sp !== rsp) {
            // Other spaces: mark as overridden by Roloc so they can be restored later
            if (space.slotCount[0] !== 1 || space.slotCount[1] !== 1) {
              space._rolocSlotOverride = true;
            }
          }
          space.slotCount = [1, 1];
        }
      }
    }
  }

  RD_FUENTE.actual = 'Resta';
  // Step 1b: Resta — dedicated pass, runs regardless of faceDown/type filters
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    const restaPresent = [0,1].some(side =>
      space.slots[side].some(c => c && c.name === 'Resta' && !c.faceDown && !c.effectDisabled)
    );
    if (!restaPresent) continue;
    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (!c || c.effectDisabled || c.name === 'Reki') continue; // Reki ignores Resta
        c.existBonus = -(c.baseValue + (c.powerBonus||0));
        c.restaLocked = true;
      }
    }
  }

  RD_FUENTE.actual = 'Reiza';
  // Step 1d: Reiza — always counts as -1, cannot gain value
  for (let sp = 0; sp < 3; sp++) {
    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < 3; sl++) {
        const c = G.spaces[sp].slots[side][sl];
        if (c && c.name === 'Reiza' && !c.effectDisabled) {
          c.existBonus = -(c.baseValue + (c.powerBonus||0));
          c.restaLocked = true;
        }
      }
    }
  }

  // Step 2: Apply each exist effect into existBonus
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (isRealSpace(sp)) continue; // Real blocks all bonuses

    // "Los efectos de existir no funcionan aquí." — skip all exist card effects in this space
    const existDisabledHere = space.effectRevealed && space.effectText && space.effectText.includes('Los efectos de existir no funcionan aquí');

    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < 3; sl++) {
        const card = space.slots[side][sl];
        if (!card || card.faceDown || card.effectDisabled) continue;
        if (card.type !== 'exist') continue;
        if (existDisabledHere && card.name !== 'Reki') continue; // Reki ignores space effects
        RD_FUENTE.actual = card;

        switch (card.name) {
          case 'Slau': {
            for (let s2 = 0; s2 < 2; s2++) for (let sl2 = 0; sl2 < 3; sl2++) {
              const c2 = space.slots[s2][sl2];
              if (c2 && c2 !== card && c2.baseValue === 1 && !c2.effectDisabled) {
                if (c2.name === 'En') {
                  // En is immune to reduction and gains +2 permanently — only once per Slau instance
                  const slauKey = `_enSlau_${card._uid ?? (card._uid = Math.random())}`;
                  if (!c2[slauKey]) {
                    c2[slauKey] = true;
                    c2.powerBonus = (c2.powerBonus||0) + 2;
                    addLog(`En: intento de reducción bloqueado, gana +2 Valor permanente (Slau).`, 'effect'); if (_existSoundEnabled) playSound('valorUp');
                  }
                } else {
                  c2.existBonus = (c2.existBonus||0) - 1;
                }
              }
            }
            break;
          }
          case 'Yiren': {
            for (let sl2 = 0; sl2 < 3; sl2++) {
              const c2 = space.slots[side][sl2];
              if (c2 && c2 !== card && !c2.effectDisabled && c2.baseValue !== 0)
                c2.existBonus = (c2.existBonus||0) + 1;
            }
            break;
          }
          case 'Gae': {
            const gaeAllies = space.slots[side].filter(c => c && c !== card);
            for (let sl2 = 0; sl2 < 3; sl2++) {
              const c2 = space.slots[side][sl2];
              if (c2 && c2 !== card) {
                // Force ally to 0: cancel out base + permanent bonus
                const cur = c2.baseValue + (c2.powerBonus||0);
                c2.existBonus = (c2.existBonus||0) - cur;
              }
            }
            if (gaeAllies.length > 0) { card.existBonus = (card.existBonus||0) + 2; if (_existSoundEnabled) playSound('valorUp'); }
            break;
          }
          case 'Tis': {
            let tisBoosted = false;
            for (let sl2 = 0; sl2 < 3; sl2++) {
              const c2 = space.slots[side][sl2];
              if (c2 && c2 !== card && !c2.faceDown && c2.baseValue !== 0) {
                // Duplicate total value (base value 1 + all current bonuses)
                const totalVal = (c2.baseValue || 1) + (c2.powerBonus || 0) + (c2.existBonus || 0);
                c2.existBonus = (c2.existBonus || 0) + totalVal;
                tisBoosted = true;
              }
            }
            if (tisBoosted && _existSoundEnabled) playSound('tisEffect');
            break;
          }
          case 'Ziru': {
            break; // passive — handled in render (ziruActive)
          }
          case 'Miria': {
            break; // handled at placement time
          }
          case 'Foret': {
            // Existir: valor se actualiza cada vez que la mano cambia
            const hcExist = G.hands[side].length;
            if (card.baseValue !== 0) card.existBonus = (card.existBonus || 0) + hcExist;
            break;
          }
          case 'Filia': {
            space.slotCount[0] = Math.max(0, Math.min(2, space.slotCount[0]));
            space.slotCount[1] = Math.max(0, Math.min(2, space.slotCount[1]));
            break;
          }
          case 'Reina': {
            break; // handled in Step 2c after all bonuses computed
          }
          case 'Ery': {
            // +2 to both Ery and Nofi if they share the same space
            const nofiHere = space.slots[side].some(c => c && c.name === 'Nofi' && !c.effectDisabled && !c.faceDown);
            if (nofiHere) {
              card.existBonus = 2;
              // Also give +2 to Nofi
              space.slots[side].forEach(c => {
                if (c && c.name === 'Nofi' && !c.effectDisabled && !c.faceDown) c.existBonus = (c.existBonus||0) + 2;
              });
              if (_existSoundEnabled) playSound('valorUp');
              // Menmei unlock: Nofi was placed this turn and Ery is now in the same space
              if (side === 0 && G.unlockProgress && G.unlockProgress._nofiPlacedThisTurn && G.unlockProgress._nofiSpaceThisTurn === sp) {
                G.unlockProgress.menmeiNofiEryTurn = true;
              }
            }
            break;
          }
          case 'Iona': {
            let empty = 0;
            for (let sl2 = 0; sl2 < 3; sl2++) {
              // Count: slot is null/empty within limit, OR slot is beyond slotCount (blocked)
              if (!space.slots[side][sl2]) empty++;
              else if (sl2 >= space.slotCount[side]) empty++; // blocked slot counts too
            }
            // Subtract 1 for Iona's own slot (always occupied by Iona itself)
            // Actually Iona is in one of the slots so it's not null — already not counted above
            card.existBonus = empty;
            break;
          }
          case 'Resta': {
            break; // handled in dedicated pass below
          }
          case 'Ponce': {
            card.existBonus = G.discard.length;
            // Track Ponce reaching value 5 for Peroth unlock
            if (side === 0 && G.unlockProgress) {
              const pTotalVal = (card.baseValue||1) + (card.powerBonus||0) + G.discard.length;
              if (pTotalVal >= 5) G.unlockProgress.perothPonce5 = true;
            }
            break;
          }
          case 'Kaeka': {
            // +2 per rival in this space with any bonus value (powerBonus or existBonus)
            let count = 0;
            for (const c2 of space.slots[1-side]) {
              if (c2 && !c2.faceDown && ((c2.powerBonus||0) + (c2.existBonus||0)) > 0) count++;
            }
            card.existBonus = count * 2;
            break;
          }
        }
      }
    }
  }

  // Step 2b: Space effect — V1 lose -1 Valor (Roloc may share this effect across spaces)
  for (let sp = 0; sp < 3; sp++) {
    if (isRealSpace(sp)) continue;
    const effs = getActiveEffects(sp);
    if (effs.some(e => e.includes("Valor 1 pierden -1 Valor"))) {
      RD_FUENTE.actual = 'Espacio ' + (sp + 1);
      for (let side = 0; side < 2; side++)
        for (let sl = 0; sl < 3; sl++) {
          const c = G.spaces[sp].slots[side][sl];
          if (c && !c.faceDown && c.baseValue === 1) {
            if (c.name === 'En') {
              const spaceKey = `_enSpace_${sp}`;
              if (!c[spaceKey]) {
                c[spaceKey] = true;
                c.powerBonus = (c.powerBonus||0) + 2;
                addLog(`En: intento de reducción bloqueado, gana +2 Valor permanente (espacio).`, 'effect'); if (_existSoundEnabled) playSound('valorUp');
              }
            } else {
              c.existBonus = (c.existBonus||0) - 1;
            }
          }
        }
    }
    // New effect: "Los Valor 1 pierden -1 valor aquí." — applied once on entry via powerBonus
    if (effs.some(e => e.includes("Los Valor 1 pierden -1 valor aquí"))) {
      for (let side = 0; side < 2; side++)
        for (let sl = 0; sl < 3; sl++) {
          const c = G.spaces[sp].slots[side][sl];
          if (c && !c.faceDown && c.baseValue === 1) {
            const penaltyKey = `_v1PenaltySpace_${sp}`;
            if (!c[penaltyKey]) {
              c[penaltyKey] = true;
              if (c.name === 'En') {
                // En blocks this and gains +2 instead
                const enKey = `_enSpace_v1p_${sp}`;
                if (!c[enKey]) {
                  c[enKey] = true;
                  c.powerBonus = (c.powerBonus||0) + 2;
                  addLog(`En: intento de reducción bloqueado, gana +2 Valor permanente (espacio).`, 'effect'); if (_existSoundEnabled) playSound('valorUp');
                }
              } else {
                c.powerBonus = (c.powerBonus||0) - 1;
                addLog(`Espacio: ${c.name} pierde -1 valor al entrar (E${sp+1}).`, 'effect');
              }
            }
          }
        }
    }
  }

  // Step 2c: Reina — runs after all bonuses so it can steal the correct amount
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (isRealSpace(sp)) continue;
    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < 3; sl++) {
        const card = space.slots[side][sl];
        if (!card || card.faceDown || card.effectDisabled || card.name !== 'Reina') continue;
        RD_FUENTE.actual = card;
        let maxVal = 0, maxCard = null;
        for (const c2 of space.slots[1-side]) {
          if (!c2 || c2.faceDown || c2.effectDisabled) continue;
          const v = (c2.baseValue||0) + (c2.powerBonus||0) + (c2.existBonus||0);
          if (v > maxVal) { maxVal = v; maxCard = c2; }
        }
        if (maxCard) {
          const stolen = (maxCard.powerBonus||0) + (maxCard.existBonus||0);
          if (stolen > 0) {
            maxCard.existBonus = (maxCard.existBonus||0) - stolen;
            card.existBonus = (card.existBonus||0) + stolen;
            // Reina hito: was moved (by Rasu/Demae/Gran Demonio, not Neutra) and stole ≥6 value
            if (side === 0 && G.unlockProgress && G.unlockProgress._reinaWasMoved && stolen >= 6) {
              G.unlockProgress.reinaFurtivaSteals6 = true;
            }
          }
        }
      }
    }
  }

  // Step 2d: "Los efectos de Existir se duplican aquí." — double the existBonus of all exist-type cards in this space
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (isRealSpace(sp)) continue;
    const effs = getActiveEffects(sp);
    if (!effs.some(e => e.includes('Los efectos de Existir se duplican aquí'))) continue;
    RD_FUENTE.actual = 'Espacio ' + (sp + 1);
    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (!c || c.faceDown || c.effectDisabled) continue;
        if (c.type !== 'exist') continue;
        if (c.restaLocked) continue; // Resta-locked cards can't gain value
        // Double the existBonus granted so far (the bonus from the card's own effect counts twice)
        c.existBonus = (c.existBonus || 0) * 2;
      }
    }
  }

  RD_FUENTE.actual = 'Resta';
  // Step 3: Resta enforcement pass — override any existBonus gains on restaLocked cards
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    for (let side = 0; side < 2; side++)
      for (let sl = 0; sl < 3; sl++) {
        const c = space.slots[side][sl];
        if (c && c.restaLocked && c.name !== 'Reki') c.existBonus = -(c.baseValue + (c.powerBonus||0));
      }
  }
}

function checkUsei(owner, spIdx, removedCard) {
  if (removedCard.baseValue !== 1) return;
  // Search for Usei anywhere on the board for this owner
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    for (let sl = 0; sl < 3; sl++) {
      const c = space.slots[owner][sl];
      if (c && c.name === 'Usei' && !c.effectDisabled) {
        animateCardFromSlot(sp, owner, sl, 'extinct-pile-vis');
        space.slots[owner][sl] = null;
        extinguishCard(c);
        addLog(`Usei se extingue por V1 removido.`, 'effect');
        // Track Moira unlock: player's Usei extinguished a space
        if (owner === 0 && G.unlockProgress) {
          G.unlockProgress.moiraUseiExtinct = true;
        }
        triggerReal(sp);
        return;
      }
    }
  }
}

function checkHanoe(owner, spIdx) {
  const space = G.spaces[spIdx];
  for (let sl = 0; sl < 3; sl++) {
    const c = space.slots[owner][sl];
    if (c && c.name === 'Hanoe' && !c.effectDisabled && c.baseValue !== 0) {
      rdConFuente(c, () => { c.powerBonus = (c.powerBonus||0) + 1; });
      addLog(`Hanoe: +1 Valor por movimiento.`, 'effect');
      // Hito Hanoe: rastrear valor máximo alcanzado
      if (owner === 0 && G.unlockProgress) {
        const curVal = (c.baseValue||1) + (c.powerBonus||0) + (c.existBonus||0);
        if (curVal > (G.unlockProgress.hanoeMaxValue||0)) G.unlockProgress.hanoeMaxValue = curVal;
      }
    }
  }
}

async function handleTanna(card, prevOwner) {
  // Called when Tanna is stolen from hand — places her in the rival's (prevOwner's) field
  // prevOwner = who originally owned Tanna (the one who got robbed)
  if (card.name !== 'Tanna') return false;
  const rival = 1 - prevOwner; // the one who stole — Tanna goes to prevOwner's field (rival of the thief)
  // Actually: Tanna goes to prevOwner's field (she returns to her original owner)
  // New rule: she goes to the RIVAL's (thief's) field instead
  const target = rival; // Tanna goes to the thief's field
  const available = [];
  for (let sp = 0; sp < 3; sp++) {
    const sp_ = G.spaces[sp]; if (sp_.blocked) continue;
    for (let sl = 0; sl < sp_.slotCount[target]; sl++) {
      if (!sp_.slots[target][sl]) available.push({ sp, sl });
    }
  }
  if (available.length === 0) return false;
  const chosen = available[Math.floor(Math.random() * available.length)];
  placeCard(card, target, chosen.sp, chosen.sl, false, true);
  addLog(`Tanna: al ser robada, se coloca en un hueco ${target===0?'del Jugador':'de la IA'} aleatorio (E${[1,2,3][chosen.sp]}).`, 'effect');
  // Tanna hito: track space and turn when Tanna activated
  if (G && G.unlockProgress) {
    G.unlockProgress._tannaActivatedSpaceThisTurn = chosen.sp;
    G.unlockProgress._tannaTurnActivated = G.turn;
  }
  return true;
}

async function handleTannaFromDeck(card) {
  // Called when Tanna is discarded from the deck — places in a random rival slot
  // "rival" here is: whoever did NOT own Tanna (she was in the shared deck, so she goes to a random side)
  // Since deck cards have no owner yet, she goes to a random available slot on either side
  if (card.name !== 'Tanna') return false;
  // Find all available slots across both sides
  const allAvailable = [];
  for (let sp = 0; sp < 3; sp++) {
    const sp_ = G.spaces[sp]; if (sp_.blocked) continue;
    for (let side = 0; side < 2; side++) {
      for (let sl = 0; sl < sp_.slotCount[side]; sl++) {
        if (!sp_.slots[side][sl]) allAvailable.push({ sp, sl, side });
      }
    }
  }
  if (allAvailable.length === 0) return false;
  const chosen = allAvailable[Math.floor(Math.random() * allAvailable.length)];
  placeCard(card, chosen.side, chosen.sp, chosen.sl, false, true);
  addLog(`Tanna: al ser descartada del mazo, se coloca aleatoriamente en E${[1,2,3][chosen.sp]} (bando ${chosen.side===0?'Jugador':'IA'}).`, 'effect');
  // Tanna hito: track space and turn when Tanna activated
  if (G && G.unlockProgress) {
    G.unlockProgress._tannaActivatedSpaceThisTurn = chosen.sp;
    G.unlockProgress._tannaTurnActivated = G.turn;
  }
  return true;
}

// ══════════════════════════════════════════════════════════
//  MODALS
// ══════════════════════════════════════════════════════════
function showModal(title, body, options) {
  return new Promise(resolve => {
    modalResolve = resolve;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').textContent = body;
    const opts = document.getElementById('modal-options');
    opts.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className='btn'; btn.textContent=opt.label;
      btn.onclick = () => { closeModal(); resolve(opt.value); };
      opts.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('show');
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

async function chooseRivalHandCard(title, excludeIndices = []) {
  return new Promise(resolve => {
    const hand = document.getElementById('ai-hidden-hand');
    if (!hand || G.hands[1].length === 0) { resolve(null); return; }

    const aiZone = document.getElementById('ai-zone');
    if (aiZone) aiZone.style.pointerEvents = 'all';

    const aiInfo = document.getElementById('ai-info');
    if (aiInfo) {
      aiInfo.textContent = title;
      aiInfo.style.color = 'var(--gold)';
      aiInfo.style.fontSize = '0.75rem';
    }

    const cards = hand.querySelectorAll('.ai-card-back');
    cards.forEach((el, i) => {
      if (excludeIndices.includes(i)) {
        // Already picked — show as red/dimmed
        el.classList.remove('ramia-pick');
        el.style.borderColor = 'var(--red)';
        el.style.opacity = '0.4';
        el.style.filter = 'grayscale(60%)';
        el.onclick = null;
      } else {
        el.classList.add('ramia-pick');
        el.style.borderColor = '';
        el.style.opacity = '';
        el.style.filter = '';
        el.onclick = () => {
          cards.forEach(c => {
            c.classList.remove('ramia-pick');
            c.style.borderColor = '';
            c.style.opacity = '';
            c.style.filter = '';
            c.onclick = null;
          });
          if (aiZone) aiZone.style.pointerEvents = '';
          if (aiInfo) { aiInfo.textContent = ''; aiInfo.style.color = ''; }
          resolve(i);
        };
      }
    });
  });
}

// Pick a card directly from the board by clicking it.
// filterFn(card, spaceIdx, side, slotIdx) => bool — which cards are valid targets.
// Returns the chosen card, or null if cancelled (Escape). Pass mandatory:true to prevent ESC cancel.
function pickCardFromBoard(filterFn, { mandatory = false } = {}) {
  return new Promise(resolve => {
    boardPickState = { filterFn, resolve, mandatory };
    render(); // triggers board-pick-target highlights
  });
}

function cancelBoardPick() {
  if (boardPickState) {
    const r = boardPickState.resolve;
    boardPickState = null;
    render();
    r(null);
  }
}

// Pick a space by clicking its center panel. filterFn(spaceIdx) => bool. Pass mandatory:true to prevent ESC cancel.
function pickSpaceFromBoard(filterFn, { mandatory = false } = {}) {
  return new Promise(resolve => {
    spacePickState = { filterFn, resolve, mandatory };
    render();
  });
}

function cancelSpacePick() {
  if (spacePickState) {
    const r = spacePickState.resolve;
    spacePickState = null;
    render();
    r(null);
  }
}

// Pick an empty slot directly on the board. filterFn(spaceIdx, side, slotIdx) => bool.
// Returns { spaceIdx, side, slotIdx } or null if cancelled. Pass mandatory:true to prevent ESC cancel.
function pickSlotFromBoard(filterFn, { mandatory = false } = {}) {
  return new Promise(resolve => {
    slotPickState = { filterFn, resolve, mandatory };
    render();
  });
}

function cancelSlotPick() {
  if (slotPickState) {
    const r = slotPickState.resolve;
    slotPickState = null;
    render();
    r(null);
  }
}

async function chooseCard(cards, title, opts = {}) {
  if (!cards || cards.length===0) return null;
  if (cards.length===1) return cards[0];
  // Build card picker grid
  return new Promise(resolve => {
    modalResolve = resolve;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = '';

    const chooseWrapper = document.createElement('div');
    chooseWrapper.style.cssText = 'display:flex;gap:16px;align-items:flex-start;';

    // Show previously drawn cards on the left if provided
    if (opts.drawnCards && opts.drawnCards.length > 0) {
      const drawnPanel = document.createElement('div');
      drawnPanel.style.cssText = 'display:flex;flex-direction:column;gap:6px;min-width:100px;';
      opts.drawnCards.forEach(dc => {
        const label = document.createElement('div');
        label.style.cssText = 'font-size:0.65rem;color:var(--text-dim);text-align:center;margin-bottom:2px;';
        label.textContent = 'Robada por Menmei';
        const el = document.createElement('div');
        el.className = `modal-card-pick ${dc.value===0?'val0-card':'val1-card'}`;
        el.style.cssText = 'pointer-events:none;opacity:0.85;';
        buildCardFace(dc, el, { showName: true, showEffect: true });
        const wrap = document.createElement('div');
        wrap.appendChild(label);
        wrap.appendChild(el);
        drawnPanel.appendChild(wrap);
      });
      chooseWrapper.appendChild(drawnPanel);
    }

    const grid = document.createElement('div');
    grid.className = 'modal-card-grid';
    chooseWrapper.appendChild(grid);
    document.getElementById('modal-body').appendChild(chooseWrapper);

    cards.forEach((card, i) => {
      const el = document.createElement('div');
      // If maskFaceDown and card is face-down, show as mystery
      if (opts.maskFaceDown && card.faceDown) {
        el.className = 'modal-card-pick face-down';
        const backImg = document.createElement('img');
        backImg.className = 'card-art'; backImg.draggable = false;
        backImg.src = './ilustraciones/card-back.jpg';
        backImg.onerror = () => backImg.style.display='none';
        el.appendChild(backImg);
      } else {
        el.className = `modal-card-pick ${card.value===0?'val0-card':'val1-card'}`;
        buildCardFace(card, el, { showName: true, showEffect: true });
      }
      el.onclick = () => { closeModal(); resolve(card); };
      grid.appendChild(el);
    });

    const modalOpts = document.getElementById('modal-options');
    modalOpts.innerHTML = '';

    document.getElementById('modal-overlay').classList.add('show');
  });
}



async function chooseFromList(options, title) {
  return new Promise(resolve => {
    modalResolve = resolve;
    document.getElementById('modal-title').textContent = title;
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:55vh;overflow-y:auto;';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm';
      btn.style.cssText = 'text-align:left;white-space:normal;padding:8px 12px;line-height:1.4;';
      btn.textContent = opt;
      btn.onclick = () => { closeModal(); resolve(opt); };
      list.appendChild(btn);
    });
    body.appendChild(list);
    document.getElementById('modal-options').innerHTML = '';
    document.getElementById('modal-overlay').classList.add('show');
  });
}

async function chooseSpace(spaces, title) {
  if (!spaces || spaces.length===0) return null;
  if (spaces.length===1) return spaces[0];
  const options = spaces.map(i=>({label:`Espacio ${ [1,2,3][i]}`, value:i}));
  return showModal(title, '', options);
}

async function chooseSpaceRasu(movedCard, spaces) {
  if (!spaces || spaces.length === 0) return null;
  if (spaces.length === 1) return spaces[0];
  return new Promise(resolve => {
    modalResolve = resolve;
    document.getElementById('modal-title').textContent =
      `Rasu: elige dónde mover a ${movedCard.displayName || movedCard.name}`;
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    const scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-bottom:12px;flex-wrap:wrap;';
    [0,1,2].forEach(i => {
      const sc = computeSpaceScore(i);
      const winner = sc.winner === 0 ? '🔵' : sc.winner === 1 ? '🔴' : '—';
      const div = document.createElement('div');
      div.style.cssText = 'font-size:0.72rem;color:var(--text-dim);text-align:center;padding:4px 8px;border:1px solid var(--border);border-radius:4px;';
      div.innerHTML = `<span style="color:var(--gold)">E${[1,2,3][i]}</span><br>${sc.p0} ${winner} ${sc.p1}`;
      scoreRow.appendChild(div);
    });
    body.appendChild(scoreRow);
    const opts = document.getElementById('modal-options');
    opts.innerHTML = '';
    spaces.forEach(i => {
      const eff = G.spaces[i].effectText || t('modal_no_effect');
      const sc = computeSpaceScore(i);
      const winnerTxt = sc.winner === 0 ? t('result_you_win') : sc.winner === 1 ? t('result_ai_wins') : t('result_draw_short');
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 12px;';
      btn.innerHTML = `<span style="font-size:0.85rem">${t('modal_space')} ${[1,2,3][i]}</span>
        <span style="font-size:0.7rem;color:var(--text-dim)">${eff.length > 40 ? eff.substring(0,40)+'…' : eff}</span>
        <span style="font-size:0.7rem">${winnerTxt}</span>`;
      btn.onclick = () => { closeModal(); resolve(i); };
      opts.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('show');
  });
}

async function chooseSpaceUna(spIdx, others) {
  if (!others || others.length === 0) return null;
  if (others.length === 1) return others[0];
  const currentEffect = G.spaces[spIdx].effectText || t('modal_no_effect');
  return new Promise(resolve => {
    modalResolve = resolve;
    const spName = `E${[1,2,3][spIdx]}`;
    document.getElementById('modal-title').textContent =
      `Una: intercambia efecto de "${currentEffect}" (${spName}) con:`;
    // Score summary in body
    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    const scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-bottom:12px;flex-wrap:wrap;';
    [0,1,2].forEach(i => {
      const sc = computeSpaceScore(i);
      const winner = sc.winner === 0 ? '🔵' : sc.winner === 1 ? '🔴' : '—';
      const div = document.createElement('div');
      div.style.cssText = 'font-size:0.72rem;color:var(--text-dim);text-align:center;padding:4px 8px;border:1px solid var(--border);border-radius:4px;';
      div.innerHTML = `<span style="color:var(--gold)">E${[1,2,3][i]}</span><br>${sc.p0} ${winner} ${sc.p1}`;
      scoreRow.appendChild(div);
    });
    body.appendChild(scoreRow);
    // Buttons
    const opts = document.getElementById('modal-options');
    opts.innerHTML = '';
    others.forEach(i => {
      const eff = G.spaces[i].effectText || t('modal_no_effect');
      const sc = computeSpaceScore(i);
      const winnerTxt = sc.winner === 0 ? t('result_you_win') : sc.winner === 1 ? t('result_ai_wins') : t('result_draw_short');
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 12px;';
      btn.innerHTML = `<span style="font-size:0.85rem">${t('modal_space')} ${[1,2,3][i]}</span>
        <span style="font-size:0.65rem;color:var(--text-dim);font-style:italic;white-space:normal;text-align:center;">${eff}</span>
        <span style="font-size:0.65rem;color:var(--silver);">${winnerTxt} · ${sc.p0}–${sc.p1}</span>`;
      btn.onclick = () => { closeModal(); resolve(i); };
      opts.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('show');
  });
}

// ══════════════════════════════════════════════════════════
//  SUMA — START OF GAME
// ══════════════════════════════════════════════════════════
async function handleSumaStart() {
  // Process any Suma drawn during initial deal, in turn order (player first, then AI)
  for (const player of [0, 1]) {
    const sumaCard = G.hands[player].find(c => c.name === 'Suma');
    if (sumaCard) await checkSumaDraw(player, sumaCard);
  }
}

// Called whenever Suma is in hand and its effect triggers
async function checkSumaDraw(player, card) {
  if (card.name !== 'Suma') return;

  // Block Destinada for this player
  G.destinadaUsed[player] = true;
  addLog(`Suma: Colocación Destinada bloqueada para ${player===0?'ti':'la IA'}.`, 'effect');

  // Extinguish Suma first
  const sumaIdx = G.hands[player].indexOf(card);
  if (sumaIdx !== -1) G.hands[player].splice(sumaIdx, 1);
  extinguishCard(card);
  addLog(`Suma se extingue.`, 'effect');
  // Suma hito: track that player's Suma was extinguished this game
  if (player === 0 && G.unlockProgress) G.unlockProgress._sumaEverExtinct = true;

  // Draw 1 card from deck
  if (G.deck.length === 0) {
    addLog(`Suma: mazo vacío, no se roba ninguna carta.`, 'effect');
    render();
    return;
  }
  const drawn = G.deck.shift();
  drawn.owner = player;
  G.hands[player].push(drawn);
  addLog(`${player===0?'Robas':'IA roba'} ${drawn.name} con Suma.`, player===0?'effect':'ai');
  render();
}

// ══════════════════════════════════════════════════════════
//  END GAME
// ══════════════════════════════════════════════════════════
function endGame() {
  G.phase = 'end';
  addLog('══ FIN DE LA PARTIDA ══', 'important');

  // Space 3 effect: "Al final de la partida, si hay una carta de existir, revelar y especial, remueve una carta del rival aquí."
  // Cada bando verifica sus PROPIAS cartas. Si un bando tiene las 3, remueve la de mayor valor del rival.
  for (let sp = 0; sp < 3; sp++) {
    const space = G.spaces[sp];
    if (!space.effectRevealed || !space.effectText) continue;
    if (!space.effectText.includes('si hay una carta de existir, revelar y especial')) continue;
    if (isRealSpace(sp)) continue;

    for (let side = 0; side < 2; side++) {
      const myCards = space.slots[side].filter(c => c && !c.faceDown);
      const hasExist   = myCards.some(c => c.type === 'exist');
      const hasReveal  = myCards.some(c => c.type === 'reveal');
      const hasSpecial = myCards.some(c => c.type === 'special');

      if (hasExist && hasReveal && hasSpecial) {
        const rival = 1 - side;
        const rivalCards = space.slots[rival].map((c, i) => ({ c, i })).filter(({ c }) => c && !c.faceDown);
        if (rivalCards.length === 0) continue;

        // Remove the rival card with the highest value (or first if tie)
        rivalCards.sort((a, b) => (b.c.value + (b.c.powerBonus||0) + (b.c.existBonus||0)) - (a.c.value + (a.c.powerBonus||0) + (a.c.existBonus||0)));
        const { c: removedCard, i: slotIdx } = rivalCards[0];
        space.slots[rival][slotIdx] = null;
        G.discard.push(removedCard);
        addLog(`Espacio ${sp+1}: ${side===0?'Jugador':'IA'} tiene existir+revelar+especial — remueve ${removedCard.name} del ${rival===0?'Jugador':'IA'}.`, 'effect');
      }
    }
  }

  const results = [0,1,2].map(i => computeSpaceScore(i));
  let winner, subtitle;

  if (isGlobalScoring()) {
    // Global mode: sum ALL spaces including isolated ones
    const totals = [0,1].map(p => [0,1,2].reduce((a,i) => a + (p===0?results[i].p0:results[i].p1), 0));
    const globalWinner = totals[0]>totals[1]?0:totals[1]>totals[0]?1:-1;
    winner = globalWinner;
    subtitle = winner===0?`Ganaste con ${totals[0]} puntos globales (IA: ${totals[1]})`:
               winner===1?`La IA ganó con ${totals[1]} puntos globales (Tú: ${totals[0]})`:
               `Empate — ${totals[0]} puntos cada uno`;
  } else {
    const sw = [results.filter(r=>r.winner===0).length, results.filter(r=>r.winner===1).length];
    winner = sw[0]>sw[1]?0:sw[1]>sw[0]?1:-1;
    subtitle = winner===0?`Ganaste ${sw[0]} de 3 espacios`:
               winner===1?`La IA ganó ${sw[1]} de 3 espacios`:
               'Ninguno ganó la mayoría';
  }

  render();

  // ── Registrar estadísticas del jugador ──
  try {
    const resultado = winner === 0 ? 'win' : winner === 1 ? 'loss' : 'draw';
    const playerCards = getPlayerHandAndBoardCards();
    actualizarEstadisticas(resultado, playerCards);
  } catch(e) { /* no interrumpir el flujo de juego */ }

  // ── Guardar en historial de partidas ──
  try {
    saveGameRecord(winner, results, G.historyLog || [], G._deckNameP0 || null);
  } catch(e) { /* no interrumpir el flujo de juego */ }

  document.getElementById('end-title').textContent = winner===0?t('result_victory'):winner===1?t('result_defeat'):t('result_draw');
  document.getElementById('end-title').style.color = winner===0?'var(--gold)':winner===1?'var(--red)':'var(--silver)';
  document.getElementById('end-subtitle').textContent = '';
  document.getElementById('end-subtitle').style.display = 'none';

  // ── Progression checks that require full end-of-game state ──
  if (G.unlockProgress) {
    // Una: "Espectador" — player placed Reki in a Real space and won (game win)
    if (winner === 0) {
      for (let i = 0; i < 3; i++) {
        if (isRealSpace(i)) {
          const hasReki = G.spaces[i].slots[0].some(c => c && c.name === 'Reki');
          if (hasReki) { G.unlockProgress.unaRekiWonReal = true; break; }
        }
      }
    }

    // Suma: "El cariño" — player won without placing V0 and without completing Destinada
    if (winner === 0 && !G.unlockProgress._sumaUsedV0 && !G.unlockProgress._sumaCompletedDestinada) {
      G.unlockProgress.sumaWonClean = true;
    }

    // Resta: "Aceptación" — player won game AND won at least one "menos valor" space
    if (winner === 0) {
      for (let i = 0; i < 3; i++) {
        if (results[i].winner === 0 && G.spaces[i].effectRevealed &&
            G.spaces[i].effectText && G.spaces[i].effectText.includes('más cartas con menos valor')) {
          G.unlockProgress.restaWonMenosValor = true;
          break;
        }
      }
    }

    // Fukou: player won a space that has an ErizoPeluche on the rival's side
    for (let i = 0; i < 3; i++) {
      const r = results[i];
      if (r.winner === 0) {
        const hasErizo = G.spaces[i].slots[1].some(c => c && c.name === 'ErizoPeluche');
        if (hasErizo) { G.unlockProgress.fukouSpaceWon = true; break; }
      }
    }
    // Mimimi: all slots across all spaces are occupied
    let allFilled = true;
    for (let i = 0; i < 3; i++) {
      const sp = G.spaces[i];
      for (let side = 0; side < 2; side++) {
        for (let sl = 0; sl < sp.slotCount[side]; sl++) {
          if (!sp.slots[side][sl]) { allFilled = false; break; }
        }
        if (!allFilled) break;
      }
      if (!allFilled) break;
    }
    G.unlockProgress.allSlotsFilled = allFilled;

    // Tira: "Estratega" — player won all 3 spaces
    const playerSpaceWins = results.filter(r => r.winner === 0).length;
    if (playerSpaceWins === 3) G.unlockProgress.tiraWonAllSpaces = true;

    // Chiouri: "Límites claros" — player won but none of their spaces had 3+ value
    if (playerSpaceWins > results.filter(r => r.winner === 1).length) {
      const allUnder3 = results.every(r => r.p0 < 3);
      if (allUnder3) G.unlockProgress.chiouriWonClean = true;
    }

    // Slau: "Justicia ciega" — player lost all 3 spaces
    const playerSpaceLosses = results.filter(r => r.winner === 1).length;
    if (playerSpaceLosses === 3) G.unlockProgress.slauLostAllSpaces = true;

    // Slau hito "Justicia ciega" (nuevo): el jugador gana un espacio donde hay Slau aliado
    // y el espacio está lleno de cartas Valor base 1 (3 del rival + 2 del jugador + Slau)
    for (let i = 0; i < 3; i++) {
      if (results[i].winner === 0) {
        const sp = G.spaces[i];
        const playerSlots = sp.slots[0].filter(c => c && !c.faceDown);
        const rivalSlots  = sp.slots[1].filter(c => c && !c.faceDown);
        const playerHasSlau = playerSlots.some(c => c.name === 'Slau' && !c.effectDisabled);
        if (playerHasSlau) {
          const rivalAllV1  = rivalSlots.length === 3 && rivalSlots.every(c => c.baseValue === 1);
          const playerAllV1 = playerSlots.every(c => c.baseValue === 1); // Slau es V1 también
          const playerFull  = playerSlots.length === 3; // espacio lleno (Slau + 2 aliados V1)
          if (rivalAllV1 && playerAllV1 && playerFull) {
            G.unlockProgress.slauJusticiaWon = true;
          }
        }
      }
    }

    // Hanoe hito: actualizar valor máximo final mirando la carta directamente
    for (let i = 0; i < 3; i++) {
      const sp = G.spaces[i];
      const hanoe = sp.slots[0].find(c => c && c.name === 'Hanoe' && !c.effectDisabled);
      if (hanoe) {
        const finalVal = (hanoe.baseValue||1) + (hanoe.powerBonus||0) + (hanoe.existBonus||0);
        if (finalVal > (G.unlockProgress.hanoeMaxValue||0)) G.unlockProgress.hanoeMaxValue = finalVal;
      }
    }

    // Tanozo: "Infortunio" — rival scored 0 in at least 2 spaces
    const rivalZeroSpaces = results.filter(r => r.p1 === 0).length;
    if (rivalZeroSpaces >= 2) G.unlockProgress.tanozoRivalZeroTwo = true;

    // Tanna: "Bufón" — player's Mimimi placed on rival side wins a space
    if (G.unlockProgress._tannaMimimiOnRival) {
      // Check if any space was won by player (side 0) with Mimimi on the rival's side (side 1)
      for (let i = 0; i < 3; i++) {
        if (results[i].winner === 0) {
          const hasMimimiOnRival = G.spaces[i].slots[1].some(c => c && c.name === 'Mimimi' && c.owner === 0);
          if (hasMimimiOnRival) {
            G.unlockProgress.tannaMimimiWonRivalSpace = true;
            break;
          }
        }
      }
    }

    // Filia: "El hueco" — player won in a space with "Sólo hay un hueco aquí" with value 0
    for (let i = 0; i < 3; i++) {
      const r = results[i];
      const sp = G.spaces[i];
      if (r.winner === 0 && r.p0 === 0 &&
          sp.effectRevealed && sp.effectText && sp.effectText.includes('Sólo hay un hueco aquí')) {
        G.unlockProgress.filiaV0Win = true;
      }
    }

    // Tis: "Existencia" — ended with ≥3 Exist cards in a space with "Los efectos de Existir se duplican"
    for (let i = 0; i < 3; i++) {
      const sp = G.spaces[i];
      if (!sp.effectRevealed || !sp.effectText || !sp.effectText.includes('Existir se duplican')) continue;
      for (let side = 0; side < 2; side++) {
        const existCount = sp.slots[side].filter(c => c && !c.faceDown && !c.effectDisabled && c.type === 'exist').length;
        if (side === 0 && existCount >= 3) G.unlockProgress.tis3ExistDuplicated = true;
      }
    }

    // Miria: "Espinas" — exactly 1 won, 1 tied, 1 lost
    {
      const wins   = results.filter(r => r.winner === 0).length;
      const losses = results.filter(r => r.winner === 1).length;
      const ties   = results.filter(r => r.winner === -1).length;
      if (wins === 1 && ties === 1 && losses === 1) G.unlockProgress.miriaOneWinOneTieOneLoss = true;
    }

    // Imi: "Suerte" — all 3 spaces tied
    if (results.every(r => r.winner === -1)) G.unlockProgress.imiAllTied = true;

    // Miboro: "A ciegas" — player won a space with "se revelan al final de la partida" effect
    for (let i = 0; i < 3; i++) {
      const sp = G.spaces[i];
      if (results[i].winner === 0 && sp.effectRevealed && sp.effectText &&
          sp.effectText.includes('se revelan al final de la partida')) {
        G.unlockProgress.miboroWonFogSpace = true;
      }
    }

    // Kaeka: "Coraje" — player won the game and has ≥3 boosted allies in one space
    if (winner === 0) {
      for (let i = 0; i < 3; i++) {
        const boostedCount = G.spaces[i].slots[0].filter(
          c => c && !c.faceDown && c.baseValue === 1 && ((c.powerBonus||0) + (c.existBonus||0)) > 0
        ).length;
        if (boostedCount >= 3) { G.unlockProgress.kaekaThreeBoostedAllies = true; break; }
      }
    }

    // Gae: "Estimulación" — any space has exactly 2 V0 + 1 V1 on player's side at end
    for (let i = 0; i < 3; i++) {
      const playerSlots = G.spaces[i].slots[0].filter(c => c && !c.faceDown);
      const v0Count = playerSlots.filter(c => c.baseValue === 0).length;
      const v1Count = playerSlots.filter(c => c.baseValue === 1).length;
      if (v0Count === 2 && v1Count === 1) { G.unlockProgress.gaeTwoV0OneV1SameSpace = true; break; }
    }

    // Zao: "La fuerza del débil" — player won and no allied card has any bonus value
    if (winner === 0) {
      const anyBoosted = G.spaces.some(sp =>
        sp.slots[0].some(c => c && !c.faceDown && ((c.powerBonus||0) + (c.existBonus||0)) > 0)
      );
      if (!anyBoosted) G.unlockProgress.zaoWonNoBoosted = true;
    }

    // Humi: "Envidia" — player won and ALL their board cards are of type 'reveal'
    if (winner === 0) {
      const allPlayerCards = G.spaces.flatMap(sp => sp.slots[0].filter(c => c && !c.faceDown && c.baseValue === 1));
      if (allPlayerCards.length > 0 && allPlayerCards.every(c => c.type === 'reveal')) {
        G.unlockProgress.humiWonOnlyReveal = true;
      }
    }

    // Kope: "Infelicidad" — save persistent rival-removed-player-cards count
    try {
      const KOPE_KEY = 'juego_cartas_kope_rival_removed';
      localStorage.setItem(KOPE_KEY, String(G.unlockProgress.kopeRivalRemovedCount || 0));
    } catch {}

    // ── Hito: Imi "Suerte y destino" — player won the game and Imi broke the tie in all 3 spaces
    if (winner === 0) {
      const playerHasImi = G.spaces.some(sp =>
        sp.slots[0].some(c => c && !c.faceDown && !c.effectDisabled && c.name === 'Imi')
      );
      if (playerHasImi && G.unlockProgress.imiTiebreakCount >= 3) {
        // already set during computeSpaceScore hooks — confirm here
      }
    }

    // ── Hito: Koly "Escudo real" — Koly blocked removal ≥2 times this game
    // (already tracked via _kolyProtectCount in Feruzu/Kakomi handlers)

    // ── Hito: Chiouri "Dios/a de los límites" — player won a space where Chiouri was on player side
    //    and rival had raw score ≥6 (before Chiouri's cap)
    for (let i = 0; i < 3; i++) {
      if (results[i].winner !== 0) continue;
      const sp = G.spaces[i];
      const playerHasChiouri = sp.slots[0].some(c => c && !c.faceDown && !c.effectDisabled && c.name === 'Chiouri');
      if (!playerHasChiouri) continue;
      // Compute rival's raw score without the Chiouri cap
      let rivalRaw = 0;
      for (const c of sp.slots[1]) {
        if (!c || c.faceDown) continue;
        rivalRaw += (c.baseValue || 0) + (c.powerBonus || 0) + (c.existBonus || 0);
      }
      if (rivalRaw >= 6) { G.unlockProgress.chiouriWonVsHigh = true; break; }
    }

    // ── Hito: Gena "Servicio perfecto" — Gena cross-boosted Chiouri, both spaces won by player
    if (G.unlockProgress._genaCrossSpaceTarget && G.unlockProgress._genaCrossSpaceTarget.cardName === 'Chiouri') {
      const genaSpace  = G.unlockProgress._genaSourceSpaceIdx;
      const chiouriSpace = G.unlockProgress._genaCrossSpaceTarget.spaceIdx;
      if (genaSpace !== -1 && chiouriSpace !== -1 &&
          results[genaSpace]?.winner === 0 && results[chiouriSpace]?.winner === 0) {
        G.unlockProgress.genaChiouriDoubleWin = true;
      }
    }

    // ── Hito: Fukou "Legador de promesas" — rival has ErizoPeluche in a space, in hand, and in deck
    {
      const erizoInRivalSpace = G.spaces.some(sp =>
        sp.slots[1].some(c => c && c.name === 'ErizoPeluche')
      );
      const erizoInRivalHand = G.hands[1].some(c => c.name === 'ErizoPeluche');
      const erizoInDeck = G.deck.some(c => c.name === 'ErizoPeluche');
      if (erizoInRivalSpace && erizoInRivalHand && erizoInDeck) {
        G.unlockProgress.fukouTripleErizo = true;
      }
    }

    // ── Hito: Ramia "Acosador de gatos" — already tracked in Ramia effect handler
  }

  // Check for new unlocks and show in end panel
  // Snapshot which cards were unlocked BEFORE this game's unlocks
  const preUnlockSnapshot = new Set(UNLOCKED_CARDS);
  const newlyUnlocked = checkUnlocks();
  // Now check which preset decks became fully unlocked this game
  const newlyUnlockedDecks = checkNewlyUnlockedDecks(preUnlockSnapshot);

  // ── Curiosidades desbloqueadas por nivel ──
  // Each level gained unlocks the curiosidad at CURIOSIDAD_ORDER[newLevel - 1]
  const _curiProfile   = loadProfile();
  const _afterLevel    = _curiProfile.userLevel  || 0;
  const _levelsGained  = _curiProfile._levelsGainedThisGame || 0;
  const _beforeLevel   = _afterLevel - _levelsGained;
  const newlyCuriCards = [];
  for (let lvl = _beforeLevel + 1; lvl <= _afterLevel; lvl++) {
    const cardName = CURIOSIDAD_ORDER[lvl - 1]; // level N unlocks index N-1
    if (cardName && CURIOSIDADES[cardName]) newlyCuriCards.push(cardName);
  }

  const unlocksPanel = document.getElementById('end-unlocks-panel');
  const unlocksList = document.getElementById('end-unlocks-list');
  const unlocksLabel = document.getElementById('end-unlocks-label');
  unlocksList.innerHTML = '';
  const totalUnlockItems = newlyUnlocked.length + newlyUnlockedDecks.length + newlyCuriCards.length;
  if (totalUnlockItems > 0) {
    const cardCount = newlyUnlocked.length;
    const deckCount = newlyUnlockedDecks.length;
    const curiCount = newlyCuriCards.length;
    // Build label text
    const parts = [];
    const lang = window.CURRENT_LANG || 'es';
    if (lang === 'en') {
      if (cardCount > 0) parts.push(`${cardCount} card${cardCount!==1?'s':''}`);
      if (deckCount > 0) parts.push(`${deckCount} deck${deckCount!==1?'s':''}`);
      if (curiCount > 0) parts.push(`${curiCount} curiosit${curiCount!==1?'ies':'y'}`);
      unlocksLabel.textContent = parts.join(' & ') + ` unlocked!`;
    } else if (lang === 'ja') {
      if (cardCount > 0) parts.push(`カード${cardCount}枚`);
      if (deckCount > 0) parts.push(`デッキ${deckCount}個`);
      if (curiCount > 0) parts.push(`豆知識${curiCount}件`);
      unlocksLabel.textContent = parts.join('・') + 'を解放！';
    } else {
      if (cardCount > 0) parts.push(`${cardCount} carta${cardCount!==1?'s':''}`);
      if (deckCount > 0) parts.push(`${deckCount} mazo${deckCount!==1?'s':''}`);
      if (curiCount > 0) parts.push(`${curiCount} curiosidad${curiCount!==1?'es':''}`);
      unlocksLabel.textContent = '¡' + parts.join(' y ') + ' desbloqueado' + (totalUnlockItems !== 1 ? 's' : '') + '!';
    }

    // Card unlocks first
    newlyUnlocked.forEach(name => {
      const cond = getUnlockCondition(name) || {};
      const div = document.createElement('div');
      div.className = 'end-unlock-card';
      const badge = document.createElement('div');
      badge.className = 'end-unlock-deck-badge';
      badge.textContent = t('unlock_card_badge');
      div.appendChild(badge);
      const imgWrap = document.createElement('div');
      const img = document.createElement('img');
      img.src = `./ilustraciones/${name}.jpg`;
      img.className = 'end-unlock-img';
      img.draggable = false;
      img.onerror = () => imgWrap.style.display = 'none';
      imgWrap.appendChild(img);
      div.appendChild(imgWrap);
      const nameEl = document.createElement('div');
      nameEl.className = 'end-unlock-name';
      nameEl.textContent = getCardDisplay(name).displayName || name;
      div.appendChild(nameEl);
      if (cond.title) {
        const achEl = document.createElement('div');
        achEl.className = 'end-unlock-achieve';
        achEl.textContent = `"${cond.title}"`;
        div.appendChild(achEl);
      }
      if (cond.text) {
        const condEl = document.createElement('div');
        condEl.className = 'end-unlock-cond';
        condEl.textContent = cond.text;
        div.appendChild(condEl);
      }
      unlocksList.appendChild(div);
    });
    // Deck unlocks
    newlyUnlockedDecks.forEach(deckIdx => {
      const deck = PRESET_DECKS[deckIdx];
      if (!deck) return;
      const div = document.createElement('div');
      div.className = 'end-unlock-card deck-unlock';
      const badge = document.createElement('div');
      badge.className = 'end-unlock-deck-badge';
      badge.textContent = t('cb_badge_basic_deck');
      div.appendChild(badge);
      if (deck.thumb) {
        const imgWrap = document.createElement('div');
        const img = document.createElement('img');
        img.src = `./ilustraciones/${deck.thumb}.jpg`;
        img.className = 'end-unlock-img';
        img.draggable = false;
        img.onerror = () => imgWrap.style.display = 'none';
        imgWrap.appendChild(img);
        div.appendChild(imgWrap);
      }
      const nameEl = document.createElement('div');
      nameEl.className = 'end-unlock-name';
      nameEl.textContent = deck.name;
      div.appendChild(nameEl);
      const subEl = document.createElement('div');
      subEl.className = 'end-unlock-achieve';
      subEl.textContent = t('unlock_deck');
      div.appendChild(subEl);
      unlocksList.appendChild(div);
    });
    // Curiosidad unlocks
    newlyCuriCards.forEach(name => {
      const div = document.createElement('div');
      div.className = 'end-unlock-card end-unlock-curi';
      const badge = document.createElement('div');
      badge.className = 'end-unlock-deck-badge end-curi-badge';
      badge.textContent = t('unlock_info_badge');
      div.appendChild(badge);
      const imgWrap = document.createElement('div');
      const img = document.createElement('img');
      img.src = `./ilustraciones/${name}.jpg`;
      img.className = 'end-unlock-img';
      img.draggable = false;
      img.onerror = () => imgWrap.style.display = 'none';
      imgWrap.appendChild(img);
      div.appendChild(imgWrap);
      const nameEl = document.createElement('div');
      nameEl.className = 'end-unlock-name';
      nameEl.textContent = name;
      div.appendChild(nameEl);
      const snippetEl = document.createElement('div');
      snippetEl.className = 'end-unlock-curi-snippet';
      const full = CURIOSIDADES[name] || '';
      snippetEl.textContent = full.length > 72 ? full.slice(0, 69) + '…' : full;
      div.appendChild(snippetEl);
      unlocksList.appendChild(div);
    });
    // Unlocks exist — panel will be revealed after XP bar finishes
    unlocksPanel.dataset.pendingReveal = '1';
  } else {
    unlocksPanel.dataset.pendingReveal = '0';
  }

  const sc = document.getElementById('end-scores');
  sc.innerHTML = '';

  if (isGlobalScoring()) {
    // Show only one combined result card
    const totals = [0,1].map(p => results.reduce((a,r) => a + (p===0?r.p0:r.p1), 0));
    const card = document.createElement('div');
    card.className = 'end-space-card';
    card.innerHTML = `
      <h3>Puntuación Global</h3>
      <div class="end-score-row"><span style="color:var(--blue)">Tú</span><span>${totals[0]}</span></div>
      <div class="end-score-row"><span style="color:var(--red)">IA</span><span>${totals[1]}</span></div>
      <div class="end-winner-badge ${winner===0?'badge-p1':winner===1?'badge-p2':'badge-tie'}">
        ${winner===0?t('result_you_win_short'):winner===1?t('result_ai_wins_short'):t('result_draw_short')}
      </div>`;
    sc.appendChild(card);
  } else {
    results.forEach((res,i) => {
      const card = document.createElement('div');
      card.className = 'end-space-card';
      card.innerHTML = `
        <h3>Espacio ${i+1}</h3>
        <div class="end-score-row"><span style="color:var(--blue)">Tú</span><span>${res.p0}</span></div>
        <div class="end-score-row"><span style="color:var(--red)">IA</span><span>${res.p1}</span></div>
        <div class="end-winner-badge ${res.winner===0?'badge-p1':res.winner===1?'badge-p2':'badge-tie'}">
          ${res.winner===0?t('result_you_win_short'):res.winner===1?t('result_ai_wins_short'):t('result_draw_short')}
        </div>`;
      sc.appendChild(card);
    });
  }

  document.getElementById('end-overlay').classList.add('active');
  document.getElementById('btn-play-again').style.display = 'block';
  document.getElementById('btn-exit-menu-fab').style.display = 'block';
  const abandonBtn = document.getElementById('btn-abandon');
  if (abandonBtn) abandonBtn.style.display = 'none';

  // ── XP bar + delayed unlock reveal ──
  try {
    const _endProfile = loadProfile();
    const segsEarned = (winner === 0) ? 2 : 1;
    let lvlNotif = document.getElementById('end-levelup-notif');
    if (!lvlNotif) {
      lvlNotif = document.createElement('div');
      lvlNotif.id = 'end-levelup-notif';
      document.getElementById('end-panel').appendChild(lvlNotif);
    }
    lvlNotif.style.display = 'block';
    lvlNotif.innerHTML = buildEndXpBlockHTML(_endProfile, segsEarned);
    // Wait 2s for the player to read the result, then animate XP.
    // When XP animation finishes: enable buttons + reveal unlocked cards (if any).
    function enableEndButtons() {
      ['end-btn-play','end-btn-menu','end-btn-board'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.disabled = false;
      });
    }
    setTimeout(() => {
      animateEndXpBar(_endProfile, segsEarned).then(() => {
        enableEndButtons();
        const panel = document.getElementById('end-unlocks-panel');
        if (panel && panel.dataset.pendingReveal === '1') {
          setTimeout(() => panel.classList.add('revealed'), 300);
        }
      });
    }, 1000);
  } catch(e) {}

  if (winner === 0) playSound('victory');
  else if (winner === 1) playSound('defeat');
}

function closeEndOverlay() {
  document.getElementById('end-overlay').classList.remove('active');
}

function toggleFabMenu() {
  playSound('uiClick');
  const toggle   = document.getElementById('fab-toggle');
  const items    = document.getElementById('fab-items');
  const backdrop = document.getElementById('fab-backdrop');
  const isOpen   = items.classList.contains('open');
  if (isOpen) { closeFabMenu(); } 
  else {
    items.classList.add('open');
    toggle.classList.add('open');
    toggle.textContent = '✕';
    if (backdrop) { backdrop.style.display = ''; backdrop.classList.add('show'); }
  }
}
function closeFabMenu() {
  const toggle   = document.getElementById('fab-toggle');
  const items    = document.getElementById('fab-items');
  const backdrop = document.getElementById('fab-backdrop');
  items.classList.remove('open');
  toggle.classList.remove('open');
  toggle.textContent = '☰';
  if (backdrop) { backdrop.classList.remove('show'); backdrop.style.display = 'none'; }
  items.style.transition = 'none';
  setTimeout(() => { items.style.transition = ''; }, 50);
}
// Close fab when clicking outside
document.addEventListener('click', e => {
  const fab      = document.getElementById('fab-menu');
  const backdrop = document.getElementById('fab-backdrop');
  if (fab && !fab.contains(e.target) && e.target !== backdrop) closeFabMenu();
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    const btn = document.getElementById('btn-fullscreen');
    if (btn) btn.textContent = '✕ Salir pantalla completa';
  } else {
    document.exitFullscreen().catch(() => {});
    const btn = document.getElementById('btn-fullscreen');
    if (btn) btn.textContent = '⛶ Pantalla completa';
  }
}
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('btn-fullscreen');
  if (!btn) return;
  btn.textContent = document.fullscreenElement ? '✕ Salir pantalla completa' : '⛶ Pantalla completa';
});

// ── DEBUG: Force level-up ── REMOVE BEFORE RELEASE ──
async function captureBoard() {
  const btn = document.getElementById('btn-capture');
  const overlay = document.getElementById('end-overlay');
  overlay.style.display = 'none';
  if (btn) btn.disabled = true;
  try {
    if (!window.html2canvas) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    const canvas = await html2canvas(document.getElementById('screen-game'), {
      backgroundColor: '#0a0a12',
      useCORS: true,
      scale: window.devicePixelRatio || 1,
    });
    const link = document.createElement('a');
    link.download = `partida_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    alert('No se pudo capturar el tablero.');
  } finally {
    overlay.style.display = '';
    if (btn) btn.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════
//  RULES
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  OPTIONS
// ══════════════════════════════════════════════════════════
// Load saved options from localStorage
const _savedOptions = (() => { try { return JSON.parse(localStorage.getItem('cardgame_options') || '{}'); } catch { return {}; } })();

const OPTIONS = {
  showEffect:    _savedOptions.showEffect    ?? true,
  showName:      _savedOptions.showName      ?? true,
  showType:      _savedOptions.showType      ?? true,
  showTypeText:  _savedOptions.showTypeText  ?? false,
  cardFontScale: _savedOptions.cardFontScale ?? 1,
  musicVolume:   _savedOptions.musicVolume   ?? 0.4,
  sfxVolume:     _savedOptions.sfxVolume     ?? 0.55,
  speedFactor:   _savedOptions.speedFactor   ?? 1,
  handAlwaysRaised: _savedOptions.handAlwaysRaised ?? false,
  handOpacity:      _savedOptions.handOpacity      ?? 1,
  mobileMode:       _savedOptions.mobileMode       ?? false,
  pasoAPaso:        _savedOptions.pasoAPaso        ?? false,   // [Nuevo] tocar para pasar las acciones una a una (ver ritmo.js)
};

function saveOptions() {
  try { localStorage.setItem('cardgame_options', JSON.stringify(OPTIONS)); } catch {}
}

function gameSleep(ms) {
  // [Nuevo] «tocar para pasar las acciones una a una»: las pausas de las acciones esperan un toque
  if (typeof ritmoPasoAPaso === 'function' && ritmoPasoAPaso(ms)) return ritmoEsperarToque();
  return sleep(ms * OPTIONS.speedFactor * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1))   // [Cambiado] un poco más pausado (ver ritmo.js)
    .then(() => typeof ritmoSinZoom === 'function' ? ritmoSinZoom() : null);   // [Nuevo] mientras miras una carta ampliada, la partida espera
}

function setSpeedFactor(val) {
  const v = parseFloat(val);
  const lbl = document.getElementById('opt-speed-label');
  if (lbl) {
    if (v <= 0.5) lbl.textContent = t('speed_fast');
    else if (v >= 1.5) lbl.textContent = t('speed_slow');
    else lbl.textContent = t('speed_normal');
  }
  OPTIONS.speedFactor = v;
  saveOptions();
}

function setCardFontScale(val) {
  const v = parseFloat(val);
  document.documentElement.style.setProperty('--card-font-scale', v);
  const lbl = document.getElementById('opt-font-scale-label');
  if (lbl) lbl.textContent = Math.round(v * 100) + '%';
  OPTIONS.cardFontScale = v;
  saveOptions();
}

function toggleOption(key) {
  OPTIONS[key] = !OPTIONS[key];
  const idMap = { showEffect: 'opt-show-effect-btn', showName: 'opt-show-name-btn', showType: 'opt-show-type-btn', showTypeText: 'opt-show-type-text-btn', handAlwaysRaised: 'opt-hand-raised-btn', mobileMode: 'opt-mobile-mode-btn', pasoAPaso: 'opt-paso-btn' };
  const btn = document.getElementById(idMap[key]);
  if (btn) {
    btn.textContent = OPTIONS[key] ? t('toggle_yes') : t('toggle_no');
    btn.className = 'opt-toggle' + (OPTIONS[key] ? ' on' : '');
  }
  if (key === 'handAlwaysRaised') applyHandRaised();
  if (key === 'mobileMode') applyMobileMode();
  saveOptions();
  render();
}

function applyHandRaised() {
  const handCards = document.getElementById('hand-cards');
  if (!handCards) return;
  if (OPTIONS.handAlwaysRaised) {
    handCards.classList.add('hand-raised');
  } else {
    handCards.classList.remove('hand-raised');
  }
}

// ── MOBILE MODE ──
// Tracks whether the hand is currently "visible" in mobile mode
let _mobileHandVisible = false;
let _mobileHandJustRevealed = false; // shield: blocks card selection on the reveal tap

function applyMobileMode() {
  const handCards = document.getElementById('hand-cards');
  const handRaisedBtn = document.getElementById('opt-hand-raised-btn');
  if (!handCards) return;

  if (OPTIONS.mobileMode) {
    // Force and lock "mano siempre levantada" as ON
    OPTIONS.handAlwaysRaised = true;
    applyHandRaised();
    if (handRaisedBtn) {
      handRaisedBtn.textContent = t('toggle_yes');
      handRaisedBtn.className = 'opt-toggle on';
      handRaisedBtn.disabled = true;
      handRaisedBtn.style.opacity = '0.35';
      handRaisedBtn.style.cursor = 'not-allowed';
    }
    // Start with hand hidden
    _mobileHandVisible = false;
    handCards.style.opacity = '0.05';
    // Register outside click listener
    document.addEventListener('pointerdown', _mobileOutsideHandler, { capture: true });
  } else {
    // Re-enable "mano siempre levantada"
    if (handRaisedBtn) {
      handRaisedBtn.disabled = false;
      handRaisedBtn.style.opacity = '';
      handRaisedBtn.style.cursor = '';
    }
    // Restore normal opacity
    handCards.style.opacity = OPTIONS.handOpacity ?? 1;
    _mobileHandVisible = false;
    document.removeEventListener('pointerdown', _mobileOutsideHandler, { capture: true });
  }
}

function _mobileOutsideHandler(e) {
  if (!OPTIONS.mobileMode) return;
  const handCards = document.getElementById('hand-cards');
  if (!handCards) return;

  // Use getBoundingClientRect to check if the tap landed over the hand area
  const rect = handCards.getBoundingClientRect();
  const x = e.clientX, y = e.clientY;
  const insideHand = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

  if (!_mobileHandVisible) {
    if (insideHand) {
      // First tap on the hand: reveal it, block this event so no card gets selected
      _mobileHandVisible = true;
      _mobileHandJustRevealed = true;
      handCards.style.opacity = '1';
      e.stopPropagation();
      e.preventDefault();
      // Clear shield after a short delay so next tap works normally
      setTimeout(() => { _mobileHandJustRevealed = false; }, 300);
    }
    // Tapping outside while hidden: do nothing
  } else {
    if (!insideHand) {
      // Tap outside: hide hand
      _mobileHandVisible = false;
      handCards.style.opacity = '0.05';
    }
    // Tapping inside while visible: allow normal card interaction (second tap)
  }
}

function setHandOpacity(val) {
  const v = parseFloat(val);
  OPTIONS.handOpacity = v;
  const handCards = document.getElementById('hand-cards');
  // In mobile mode, opacity is managed by applyMobileMode/_mobileOutsideHandler
  if (handCards && !OPTIONS.mobileMode) handCards.style.opacity = v;
  const lbl = document.getElementById('opt-hand-opacity-label');
  if (lbl) lbl.textContent = Math.round(v * 100) + '%';
  const slider = document.getElementById('opt-hand-opacity');
  if (slider) slider.value = v;
  saveOptions();
}

function showOptions() {
  closeFabMenu();
  const abandonBtn = document.getElementById('btn-abandon');
  if (abandonBtn) abandonBtn.style.display = G && G.phase && G.phase !== 'end' ? 'block' : 'none';
  const idMap = { showEffect: 'opt-show-effect-btn', showName: 'opt-show-name-btn', showType: 'opt-show-type-btn', showTypeText: 'opt-show-type-text-btn', handAlwaysRaised: 'opt-hand-raised-btn', mobileMode: 'opt-mobile-mode-btn', pasoAPaso: 'opt-paso-btn' };
  ['showEffect','showName','showType','showTypeText','handAlwaysRaised','mobileMode','pasoAPaso'].forEach(key => {
    const btn = document.getElementById(idMap[key]);
    if (btn) { btn.textContent = OPTIONS[key]?t('toggle_yes'):t('toggle_no'); btn.className='opt-toggle'+(OPTIONS[key]?' on':''); }
  });
  // Apply mobile mode lock on "mano siempre levantada"
  const handRaisedBtn = document.getElementById('opt-hand-raised-btn');
  if (handRaisedBtn) {
    if (OPTIONS.mobileMode) {
      handRaisedBtn.textContent = t('toggle_yes');
      handRaisedBtn.className = 'opt-toggle on';
    }
    handRaisedBtn.disabled = OPTIONS.mobileMode;
    handRaisedBtn.style.opacity = OPTIONS.mobileMode ? '0.35' : '';
    handRaisedBtn.style.cursor = OPTIONS.mobileMode ? 'not-allowed' : '';
  }
  const slider = document.getElementById('opt-font-scale');
  if (slider) { slider.value = OPTIONS.cardFontScale || 1; setCardFontScale(slider.value); }
  const musicSlider = document.getElementById('opt-music-vol');
  if (musicSlider) { setMenuMusicVolume(OPTIONS.musicVolume ?? 0.4); }
  const speedSlider = document.getElementById('opt-speed');
  if (speedSlider) { speedSlider.value = OPTIONS.speedFactor ?? 1; setSpeedFactor(speedSlider.value); }
  setHandOpacity(OPTIONS.handOpacity ?? 1);
  _openDefaultOptCat();
  document.getElementById('options-overlay').classList.add('show');
}

function showOptionsMenu() {
  const idMap = { showEffect: 'opt-show-effect-btn', showName: 'opt-show-name-btn', showType: 'opt-show-type-btn', showTypeText: 'opt-show-type-text-btn' };
  ['showEffect','showName','showType','showTypeText'].forEach(key => {
    const btn = document.getElementById(idMap[key]);
    if (btn) { btn.textContent = OPTIONS[key]?t('toggle_yes'):t('toggle_no'); btn.className='opt-toggle'+(OPTIONS[key]?' on':''); }
  });
  const speedSlider2 = document.getElementById('opt-speed');
  if (speedSlider2) { speedSlider2.value = OPTIONS.speedFactor ?? 1; setSpeedFactor(speedSlider2.value); }
  _openDefaultOptCat();
  document.getElementById('options-overlay').classList.add('show');
}

function toggleOptCat(cat) {
  playSound('uiClick');
  const btn = document.querySelector(`.opt-cat-btn[data-cat="${cat}"]`);
  const section = document.getElementById(`opt-section-${cat}`);
  if (!btn || !section) return;
  // Always switch to the selected category (no deselection)
  document.querySelectorAll('.opt-cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.opt-section').forEach(s => s.style.display = 'none');
  btn.classList.add('active');
  section.style.display = 'block';
}

function closeOptions() {
  document.getElementById('options-overlay').classList.remove('show');
}

function _openDefaultOptCat() {
  // Always open Visual tab by default
  document.querySelectorAll('.opt-cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.opt-section').forEach(s => s.style.display = 'none');
  const btn = document.querySelector('.opt-cat-btn[data-cat="visual"]');
  const section = document.getElementById('opt-section-visual');
  if (btn) btn.classList.add('active');
  if (section) section.style.display = 'block';
}

function initOptionsUI() {
  const idMap = { showEffect: 'opt-show-effect-btn', showName: 'opt-show-name-btn', showType: 'opt-show-type-btn', showTypeText: 'opt-show-type-text-btn', handAlwaysRaised: 'opt-hand-raised-btn', mobileMode: 'opt-mobile-mode-btn', pasoAPaso: 'opt-paso-btn' };
  Object.keys(idMap).forEach(key => {
    const btn = document.getElementById(idMap[key]);
    if (btn) { btn.textContent = OPTIONS[key] ? t('toggle_yes') : t('toggle_no'); btn.className = 'opt-toggle' + (OPTIONS[key] ? ' on' : ''); }
  });
  const fontSlider = document.getElementById('opt-font-scale');
  if (fontSlider) { fontSlider.value = OPTIONS.cardFontScale || 1; setCardFontScale(fontSlider.value); }
  setMenuMusicVolume(OPTIONS.musicVolume ?? 0.4);
  setSfxVolume(OPTIONS.sfxVolume ?? 0.55);
  const speedSlider = document.getElementById('opt-speed');
  if (speedSlider) { speedSlider.value = OPTIONS.speedFactor ?? 1; setSpeedFactor(speedSlider.value); }
  setHandOpacity(OPTIONS.handOpacity ?? 1);
}

// ══════════════════════════════════════════════════════════
//  CARD BROWSER
// ══════════════════════════════════════════════════════════
let CB_FILTER = 'all';
let CB_LOCK_FILTER = null; // null | 'unlocked' | 'locked' — combinable with CB_FILTER
// Whether the browser was opened from the menu (shows deck sidebar) or in-game (hides it)
let CB_FROM_MENU = false;

// ── Favorites (persisted in localStorage) ──
const FAV_KEY = 'juego_cartas_favorites';
let favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
function saveFavorites() { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); }
function toggleFavorite(cardName) {
  if (favorites.has(cardName)) favorites.delete(cardName); else favorites.add(cardName);
  saveFavorites();
}
let CB_SIZE = 200;

function setCbSize(val) {
  CB_SIZE = parseInt(val);
  document.getElementById('card-browser-body').style.setProperty('--cb-card-w', CB_SIZE + 'px');
  document.getElementById('card-browser-box').style.setProperty('--cb-card-w', CB_SIZE + 'px');
}

function setCbFilter(f) {
  playSound('uiClick');
  const LOCK_FILTERS = ['unlocked', 'locked'];
  if (LOCK_FILTERS.includes(f)) {
    // Toggle lock filter independently — can combine with primary filter
    CB_LOCK_FILTER = (CB_LOCK_FILTER === f) ? null : f;
  } else {
    // Toggle primary filter
    CB_FILTER = (CB_FILTER === f) ? null : f;
  }
  document.querySelectorAll('.cb-filter-btn').forEach(b => {
    const isLock = LOCK_FILTERS.includes(b.dataset.filter);
    b.classList.toggle('active',
      isLock ? b.dataset.filter === CB_LOCK_FILTER : b.dataset.filter === CB_FILTER
    );
  });
  renderCardBrowser();
}

function closeCardBrowser() {
  const overlay = document.getElementById('card-browser-overlay');
  const wasFromMenu = overlay.classList.contains('fullscreen-mode');
  overlay.classList.remove('show');
  overlay.classList.remove('fullscreen-mode');
  CB_SELECTED_DECK = null;
  CB_SHOW_PRESETS = false;
  const btn = document.getElementById('cb-presets-btn');
  if (btn) btn.classList.remove('active');
  const renameBtn = document.getElementById('cb-rename-deck-btn');
  if (renameBtn) renameBtn.style.display = 'block';
  // If opened from menu, restore menu screen
  if (wasFromMenu) {
    document.getElementById('screen-menu').style.display = 'flex';
  }
}

function showCardBrowser(fromMenu = false) {
  CB_FROM_MENU = fromMenu;
  CB_FILTER = null;
  CB_LOCK_FILTER = null;
  // Clear new-unlock glow since player is now viewing the browser
  NEWLY_UNLOCKED_CARDS.clear();
  document.querySelectorAll('.cb-filter-btn').forEach(b => {
    b.classList.toggle('active', false);
  });
  const search = document.getElementById('cb-search');
  if (search) search.value = '';
  const slider = document.getElementById('cb-size-slider');
  if (slider) slider.value = CB_SIZE;
  setCbSize(CB_SIZE);

  // Always show sidebar
  const sidebar = document.getElementById('cb-deck-sidebar');
  const title = document.getElementById('cb-header-title');
  sidebar.classList.remove('hidden');
  title.textContent = '';
  renderDeckSidebar();

  const overlay = document.getElementById('card-browser-overlay');
  if (fromMenu) {
    overlay.classList.add('fullscreen-mode');
    // Hide the menu, show the browser as a screen
    document.getElementById('screen-menu').style.display = 'none';
  } else {
    overlay.classList.remove('fullscreen-mode');
  }

  overlay.classList.add('show');
  renderCardBrowser();
}

function renderCardBrowser() {
  const body = document.getElementById('card-browser-body');
  body.innerHTML = '';

  const query = (document.getElementById('cb-search')?.value || '').toLowerCase().trim();

  // Build all card entries
  const all = [];
  for (const [name, data] of Object.entries(CARD_DB)) {
    all.push({ name, ...data, isToken: false });
  }
  // Tokens (including Suma already in CARD_DB as special)
  const DISPLAY_NAMES = { 'ErizoPeluche': 'Erizo de Peluche Blanco', 'Gatito': 'Gatito' };
  for (const [name, data] of Object.entries(TOKENS)) {
    all.push({ name, displayName: DISPLAY_NAMES[name] || name, ...data, value: data.value, baseValue: data.value, isToken: true });
  }

  // Filter
  const filtered = all.filter(card => {
    const display = getCardDisplay(card.name);
    const matchesQuery = !query ||
      display.displayName.toLowerCase().includes(query) ||
      card.name.toLowerCase().includes(query) ||
      (display.effect || '').toLowerCase().includes(query);

    let matchesFilter = true;
    if (CB_FILTER === 'val1')    matchesFilter = card.value === 1 && !card.isToken;
    if (CB_FILTER === 'val0')    matchesFilter = card.value === 0 && !card.isToken;
    if (CB_FILTER === 'reveal')  matchesFilter = card.type === 'reveal';
    if (CB_FILTER === 'exist')   matchesFilter = card.type === 'exist';
    if (CB_FILTER === 'special') matchesFilter = card.type === 'special';
    if (CB_FILTER === 'token')     matchesFilter = card.isToken;
    if (CB_FILTER === 'favorites') matchesFilter = favorites.has(card.name);
    if (CB_FILTER === 'unlocked')  matchesFilter = isCardUnlocked(card.name);
    if (CB_FILTER === 'locked')    matchesFilter = !isCardUnlocked(card.name) && !card.isToken;
    if (CB_FILTER === 'in-deck') {
      const activeDeck = cbGetSelectedDeck();
      matchesFilter = activeDeck ? activeDeck.cards.includes(card.name) : false;
    }

    // Apply secondary lock filter (combinable with any primary filter)
    let matchesLock = true;
    if (CB_LOCK_FILTER === 'unlocked') matchesLock = isCardUnlocked(card.name);
    if (CB_LOCK_FILTER === 'locked')   matchesLock = !isCardUnlocked(card.name) && !card.isToken;

    return matchesQuery && matchesFilter && matchesLock;
  });

  if (filtered.length === 0) {
    body.innerHTML = '<p style="color:var(--text-dim);padding:24px;font-style:italic;">' + t('cb_no_cards') + '</p>';
    return;
  }

  // Group by section if no specific filter
  const showSections = !CB_FILTER && !CB_LOCK_FILTER && !query;
  if (showSections) {
    const groups = [
      { title: '◆ VALOR 1', cards: filtered.filter(c => c.value === 1 && !c.isToken) },
      { title: '◈ VALOR 0  (No pueden ser removidas ni recibir valor; desempatan)', cards: filtered.filter(c => c.value === 0 && !c.isToken) },
      { title: '◇ TOKENS', cards: filtered.filter(c => c.isToken) },
    ];
    groups.forEach(g => {
      if (g.cards.length === 0) return;
      const titleEl = document.createElement('div');
      titleEl.className = 'cb-section-title';
      titleEl.textContent = g.title;
      body.appendChild(titleEl);
      body.appendChild(buildCbGrid(g.cards, filtered));
    });
  } else {
    body.appendChild(buildCbGrid(filtered));
  }
}

function buildCbGrid(cards, fullList) {
  const navList = fullList || cards;
  const grid = document.createElement('div');
  grid.className = 'cb-grid';
  cards.forEach((card) => {
    const globalIndex = navList.indexOf(card);
    const cls = card.isToken ? 'token' : card.value === 0 ? 'val0' : 'val1';
    const locked = !card.isToken && !isCardUnlocked(card.name);
    const isNewlyUnlocked = NEWLY_UNLOCKED_CARDS.has(card.name);
    const el = document.createElement('div');
    el.className = `cb-card ${cls}${locked ? ' locked' : ''}${isNewlyUnlocked ? ' new-unlock' : ''}`;

    if (locked) {
      // Show art image (darkened by CSS filter)
      const img = document.createElement('img'); img.draggable = false;
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;filter:brightness(0.35) saturate(0.2);';
      img.className = 'cb-card-img';
      img.src = `./ilustraciones/${card.name}.jpg`;
      img.onerror = function() { this.style.display = 'none'; };
      el.appendChild(img);

      // Lock overlay
      const overlay = document.createElement('div');
      overlay.className = 'cb-card-lock-overlay';

      const icon = document.createElement('div');
      icon.className = 'cb-card-lock-icon';
      icon.textContent = '🔒';
      overlay.appendChild(icon);

      const cond = getUnlockCondition(card.name);
      if (cond) {
        const titleEl = document.createElement('div');
        titleEl.className = 'cb-card-lock-title';
        titleEl.textContent = cond.title;
        overlay.appendChild(titleEl);

        const sep = document.createElement('div');
        sep.className = 'menu-sep menu-sep-wide';
        sep.style.cssText = 'width:80%;margin:1px 0;';
        overlay.appendChild(sep);

        const condEl = document.createElement('div');
        condEl.className = 'cb-card-lock-cond';
        condEl.textContent = cond.text;
        overlay.appendChild(condEl);
      }

      el.appendChild(overlay);

      el.onclick = (e) => {
        e.stopPropagation();
        el.classList.remove('lock-shake');
        void el.offsetWidth;
        el.classList.add('lock-shake');
        setTimeout(() => el.classList.remove('lock-shake'), 450);
        playSound('mazoRechazar');
      };
      grid.appendChild(el);
      return; // skip the rest for locked cards
    }

    // In-deck highlight
    if (CB_SELECTED_DECK !== null) {
      const activeDeck = cbGetSelectedDeck();
      if (activeDeck && activeDeck.cards.includes(card.name)) {
        el.classList.add('in-deck');
      }
    }

    el.onclick = (e) => {
      // If a deck is selected and this is a deckable card (not token), toggle membership
      if (CB_SELECTED_DECK !== null && !card.isToken) {
        // Block editing preset decks
        if (CB_SELECTED_DECK < 0) return;
        cbToggleCardInDeck(card);
        return;
      }
      openCardZoom(card, navList, globalIndex);
    };

    buildCardFace(card, el, { showName: true, showEffect: true });

    // Set-thumb pencil button (only on in-deck cards of user decks)
    if (CB_SELECTED_DECK !== null && CB_SELECTED_DECK >= 0) {
      const activeDeck = cbGetSelectedDeck();
      if (activeDeck && activeDeck.cards.includes(card.name)) {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = 'cb-card-set-thumb';
        thumbBtn.title = 'Usar como miniatura del mazo';
        thumbBtn.textContent = '✎';
        thumbBtn.onclick = (e) => {
          e.stopPropagation();
          CB_DECKS[CB_SELECTED_DECK].thumb = card.name;
          saveDecks();
          renderDeckSidebar();
        };
        el.appendChild(thumbBtn);

        // Token thumb buttons: if this card unlocks a token as thumb option
        for (const [tokenName, unlockers] of Object.entries(CB_TOKEN_THUMB_UNLOCKS)) {
          if (unlockers.includes(card.name)) {
            const tokenThumbBtn = document.createElement('button');
            tokenThumbBtn.className = 'cb-card-set-thumb-token';
            tokenThumbBtn.title = `Usar ${tokenName === 'ErizoPeluche' ? 'Erizo de Peluche Blanco' : tokenName} como miniatura`;
            tokenThumbBtn.textContent = '🐾';
            tokenThumbBtn.onclick = (e) => {
              e.stopPropagation();
              CB_DECKS[CB_SELECTED_DECK].thumb = tokenName;
              saveDecks();
              renderDeckSidebar();
            };
            el.appendChild(tokenThumbBtn);
          }
        }
      }
    }

    // Favorite badge
    if (favorites.has(card.name)) {
      const badge = document.createElement('div');
      badge.className = 'cb-card-fav-badge';
      badge.textContent = '★';
      el.appendChild(badge);
    }

    // Shiny effect if active
    applyShinyIfUnlocked(el, card.name);

    grid.appendChild(el);
  });
  return grid;
}

// Cards whose thumbnail should show at a specific vertical position.
// Value is the CSS object-position string ('center 40%' = lower, 'center 20%' = slight lower, 'top' = default)
const CB_THUMB_OFFSET = new Map([
  ['Nugu',   'center 40%'],
  ['Ramia',  'center 40%'],
  ['Ziru',   'center 40%'],
  ['Hanoe',  'center 40%'],
  ['Abaki',  'center 40%'],
  ['Miria',  'center 40%'],
  ['Ekuro',  'center 40%'],
  ['Kaeka',  'center 40%'],
  ['Ponce',  'center 40%'],
  ['Tenpoh', 'center 40%'],
  ['Roloc',  'center 20%'],
  ['Tis',    'center 20%'],
  ['Su',     'center 20%'],
  ['Resta',  'center 20%'],
  ['ErizoPeluche', 'center 40%'],
  ['Ery',          'center 40%'],
  ['Gatito',       'center 40%'],
]);

// Token thumbnails: token name → card names in deck that unlock it as thumb option
const CB_TOKEN_THUMB_UNLOCKS = {
  'ErizoPeluche': ['Nugu', 'Fukou'],
  'Ery':          ['Nofi'],
  'Gatito':       ['Reiza'],
};

// Returns true if thumbName is a valid image source (card or token)
function cbThumbExists(thumbName) {
  return !!(CARD_DB[thumbName] || TOKENS[thumbName]);
}

// Preset decks — read-only, built into the HTML
const PRESET_DECKS = [
  {
    name: 'Incordio',
    cards: ['Nugu','Gena','Iona','Noira','Hobu','Faun','Feruzu','Mega','Yuta','Rasu'],
    thumb: 'Nugu',
    preset: true,
  },
  {
    name: 'Destino',
    cards: ['Nofi','Menmei','Koly','Gena','Gran Demonio','Soi','Kaeka','Miboro','Rasu','Yuta'],
    thumb: 'Nofi',
    preset: true,
  },
  {
    name: 'Tramposo',
    cards: ['Tira','Ramia','Hobu','Tanozo','Abaki','Ziru','Reina','Humi','Nasu','Suma'],
    thumb: 'Tira',
    preset: true,
  },
  {
    name: 'Descarte',
    cards: ['Peroth','Naiki','Tanna','Mimimi','Miria','Ponce','Tenpoh','Kakomi','Tis','Una'],
    thumb: 'Peroth',
    preset: true,
  },
  {
    name: 'Suerte',
    cards: ['Imi','Slau','Hanoe','Demae','Kakomi','Tanozo','Miboro','Gae','Reiza','Resta'],
    thumb: 'Imi',
    preset: true,
  },
  {
    name: 'Sin límites',
    cards: ['Abaki','Ramia','Hobu','Tanozo','Kope','Nofi','Gran Demonio','Etza','Su','Usei'],
    thumb: 'Su',
    preset: true,
  },
];

// ── Preset deck lock helpers ──
// Returns array of card names from the preset deck that the player doesn't own.
function getPresetDeckMissingCards(deckIdx) {
  const deck = PRESET_DECKS[deckIdx];
  if (!deck) return [];
  return deck.cards.filter(name => !isCardUnlocked(name));
}

function isPresetDeckLocked(deckIdx) {
  return getPresetDeckMissingCards(deckIdx).length > 0;
}

// Returns array of preset deck indices that were JUST fully unlocked this game.
// "Just unlocked" = was locked before (had missing cards before this game's unlocks),
// but is now complete (all cards owned).
function checkNewlyUnlockedDecks(previouslyUnlocked) {
  const newlyUnlockedDecks = [];
  PRESET_DECKS.forEach((deck, i) => {
    const wasLocked = deck.cards.some(name => !previouslyUnlocked.has(name));
    const isNowUnlocked = !isPresetDeckLocked(i);
    if (wasLocked && isNowUnlocked) {
      newlyUnlockedDecks.push(i);
    }
  });
  return newlyUnlockedDecks;
}

// Shared tooltip element for deck lock tooltips
let _deckLockTooltipEl = null;
function showDeckLockTooltip(e, missingCards) {
  hideDeckLockTooltip();
  const tip = document.createElement('div');
  tip.className = 'deck-lock-tooltip';
  _deckLockTooltipEl = tip;
  const title = document.createElement('strong');
  title.textContent = '🔒 Te faltan estas cartas:';
  tip.appendChild(title);
  missingCards.forEach(name => {
    const row = document.createElement('div');
    row.className = 'dtip-card';
    const dot = document.createElement('span');
    dot.className = 'dtip-dot';
    row.appendChild(dot);
    const txt = document.createTextNode(name);
    row.appendChild(txt);
    tip.appendChild(row);
  });
  document.body.appendChild(tip);
  positionDeckLockTooltip(e);
}
function positionDeckLockTooltip(e) {
  if (!_deckLockTooltipEl) return;
  const x = e.clientX + 14;
  const y = e.clientY - 10;
  _deckLockTooltipEl.style.left = Math.min(x, window.innerWidth - 260) + 'px';
  _deckLockTooltipEl.style.top = Math.min(y, window.innerHeight - 200) + 'px';
}
function hideDeckLockTooltip() {
  if (_deckLockTooltipEl) { _deckLockTooltipEl.remove(); _deckLockTooltipEl = null; }
}


// Whether the preset list is currently shown in the sidebar
let CB_SHOW_PRESETS = false;
const DECK_KEY = 'juego_cartas_decks';
let CB_DECKS = [];          // array of { name, cards: [cardName,...], thumb: cardName|null }
let CB_SELECTED_DECK = null; // index or null

function loadDecks() {
  try { CB_DECKS = JSON.parse(localStorage.getItem(DECK_KEY) || '[]'); } catch { CB_DECKS = []; }
}
function saveDecks() {
  try { localStorage.setItem(DECK_KEY, JSON.stringify(CB_DECKS)); } catch {}
}
loadDecks();

function cbCreateDeck() {
  playSound('uiClick');
  // If showing presets, switch to custom decks first
  if (CB_SHOW_PRESETS) {
    CB_SHOW_PRESETS = false;
    const btn = document.getElementById('cb-presets-btn');
    if (btn) btn.classList.remove('active');
    const renameBtn = document.getElementById('cb-rename-deck-btn');
    if (renameBtn) renameBtn.style.display = 'block';
  }
  const n = CB_DECKS.length + 1;
  CB_DECKS.push({ name: `Mazo ${n}`, cards: [], thumb: null });
  saveDecks();
  CB_SELECTED_DECK = CB_DECKS.length - 1;
  renderDeckSidebar();
  renderCardBrowser();
}

function cbSelectDeck(key) {
  playSound('uiClick');
  CB_SELECTED_DECK = (CB_SELECTED_DECK === key) ? null : key;
  renderDeckSidebar();
  renderCardBrowser();
}

function cbDeleteDeck(idx) {
  CB_DECKS.splice(idx, 1);
  if (CB_SELECTED_DECK === idx) CB_SELECTED_DECK = null;
  else if (typeof CB_SELECTED_DECK === 'number' && CB_SELECTED_DECK >= 0 && CB_SELECTED_DECK > idx) CB_SELECTED_DECK--;
  saveDecks();
  renderDeckSidebar();
  renderCardBrowser();
}

function cbRejectCard(cardName) {
  // Flash the card element red and shake it
  const grid = document.getElementById('card-browser-body');
  if (!grid) return;
  grid.querySelectorAll('.cb-card').forEach(el => {
    // Match by the cf-name text content
    const nameEl = el.querySelector('.cf-name');
    if (nameEl && nameEl.textContent.trim() === cardName) {
      el.classList.remove('deck-reject');
      // Force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('deck-reject');
      setTimeout(() => el.classList.remove('deck-reject'), 500);
    }
  });
  playSound('mazoRechazar');
}

function cbToggleCardInDeck(card) {
  if (CB_SELECTED_DECK === null || CB_SELECTED_DECK < 0) return;
  const deck = CB_DECKS[CB_SELECTED_DECK];
  const idx = deck.cards.indexOf(card.name);

  if (idx !== -1) {
    // Remove from deck
    deck.cards.splice(idx, 1);
    if (deck.thumb === card.name) {
      deck.thumb = deck.cards.find(n => CARD_DB[n]) || null;
    }
    // If thumb is a token, check if the deck still has at least one card that unlocks it
    if (deck.thumb && TOKENS[deck.thumb]) {
      const unlockers = CB_TOKEN_THUMB_UNLOCKS[deck.thumb] || [];
      const stillUnlocked = unlockers.some(u => deck.cards.includes(u));
      if (!stillUnlocked) deck.thumb = deck.cards.find(n => CARD_DB[n]) || null;
    }
    playSound('mazoQuitar');
  } else {
    // Block Reki entirely
    if (card.name === 'Reki') {
      cbFlashHint('Reki no puede añadirse a un mazo');
      cbRejectCard('Reki');
      return;
    }
    // Block locked cards
    if (!isCardUnlocked(card.name)) {
      cbFlashHint(`${card.name} aún no está desbloqueada`);
      cbRejectCard(card.name);
      return;
    }
    // Check limits
    const v1count = deck.cards.filter(n => CARD_DB[n]?.value === 1).length;
    const v0count = deck.cards.filter(n => CARD_DB[n]?.value === 0).length;
    const isV1 = card.value === 1;
    const isV0 = card.value === 0;

    if (isV1 && v1count >= 8) {
      cbFlashHint('Máximo 8 cartas de Valor 1');
      cbRejectCard(card.name);
      return;
    }
    if (isV0 && v0count >= 2) {
      cbFlashHint('Máximo 2 cartas de Valor 0');
      cbRejectCard(card.name);
      return;
    }
    deck.cards.push(card.name);
    if (!deck.thumb) deck.thumb = card.name;
    playSound('mazoAgregar');
  }
  saveDecks();
  renderDeckSidebar();
  renderCardBrowser();
}

function cbFlashHint(msg) {
  const hint = document.getElementById('cb-deck-hint');
  if (!hint) return;
  hint.textContent = msg;
  hint.style.color = 'var(--red)';
  setTimeout(() => {
    hint.style.color = 'var(--text-dim)';
    cbUpdateHint();
  }, 2000);
}

function cbGetSelectedDeck() {
  if (CB_SELECTED_DECK === null) return null;
  if (CB_SELECTED_DECK < 0) return PRESET_DECKS[-(CB_SELECTED_DECK + 1)] || null;
  return CB_DECKS[CB_SELECTED_DECK] || null;
}

function cbUpdateHint() {
  const hint = document.getElementById('cb-deck-hint');
  if (!hint) return;
  if (CB_SELECTED_DECK === null) {
    hint.textContent = t('cb_select_deck');
    hint.style.color = 'var(--text-dim)';
    return;
  }
  if (CB_SELECTED_DECK < 0) {
    hint.textContent = t('cb_readonly');
    hint.style.color = 'var(--text-dim)';
    return;
  }
  // Counter now only lives under the deck thumbnail — hide hint text
  hint.textContent = '';
}

function cbStartRenaming(idx) {
  // Find the label + input for this deck item
  const items = document.querySelectorAll('.cb-deck-item');
  const item = items[idx];
  if (!item) return;
  const nameEl = item.querySelector('.cb-deck-name');
  const inputEl = item.querySelector('.cb-deck-name-input');
  if (!nameEl || !inputEl) return;
  nameEl.style.display = 'none';
  inputEl.style.display = 'block';
  inputEl.value = CB_DECKS[idx].name;
  inputEl.focus();
  inputEl.select();
  const finish = () => {
    const val = inputEl.value.trim();
    if (val) CB_DECKS[idx].name = val;
    saveDecks();
    nameEl.textContent = CB_DECKS[idx].name;
    inputEl.style.display = 'none';
    nameEl.style.display = 'block';
  };
  inputEl.onblur = finish;
  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); inputEl.blur(); }
    if (e.key === 'Escape') { inputEl.value = CB_DECKS[idx].name; inputEl.blur(); }
  };
}

function cbRenameSelected() {
  playSound('uiClick');
  if (CB_SELECTED_DECK === null || CB_SELECTED_DECK < 0) return;
  cbStartRenaming(CB_SELECTED_DECK);
}

function cbChangeThumbnail(idx) {
  const deck = CB_DECKS[idx];
  if (!deck || deck.cards.length === 0) return;
  // Find current thumb position and rotate to next card
  const cardNames = deck.cards.filter(n => CARD_DB[n]);
  if (cardNames.length === 0) return;
  const currentIdx = cardNames.indexOf(deck.thumb);
  const nextIdx = (currentIdx + 1) % cardNames.length;
  deck.thumb = cardNames[nextIdx];
  saveDecks();
  renderDeckSidebar();
}

function cbTogglePresets() {
  playSound('uiClick');
  CB_SHOW_PRESETS = !CB_SHOW_PRESETS;
  const btn = document.getElementById('cb-presets-btn');
  if (btn) btn.classList.toggle('active', CB_SHOW_PRESETS);
  CB_SELECTED_DECK = null;
  const renameBtn = document.getElementById('cb-rename-deck-btn');
  if (renameBtn) renameBtn.style.display = CB_SHOW_PRESETS ? 'none' : 'block';
  renderDeckSidebar();
  renderCardBrowser();
}

function renderDeckSidebar() {
  const list = document.getElementById('cb-deck-list');
  if (!list) return;
  list.innerHTML = '';

  let hint = document.getElementById('cb-deck-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'cb-deck-hint';
    document.getElementById('cb-deck-sidebar').appendChild(hint);
  }
  cbUpdateHint();

  function buildDeckItem(deck, deckKey, isPreset) {
    const isSelected = CB_SELECTED_DECK === deckKey;
    const presetIdx = isPreset ? -(deckKey + 1) : -1;
    const missingCards = isPreset ? getPresetDeckMissingCards(presetIdx) : [];
    const isLocked = missingCards.length > 0;
    const item = document.createElement('div');
    item.className = 'cb-deck-item' + (isSelected ? ' selected' : '') + (isPreset ? ' preset' : '') + (isLocked ? ' deck-locked' : '');

    // Tooltip on hover for locked preset decks
    if (isLocked) {
      item.addEventListener('mouseenter', (e) => showDeckLockTooltip(e, missingCards));
      item.addEventListener('mousemove', positionDeckLockTooltip);
      item.addEventListener('mouseleave', hideDeckLockTooltip);
    }

    // Thumbnail — simple click to select, no timer
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'cb-deck-thumb-wrap';
    if (deck.thumb && cbThumbExists(deck.thumb)) {
      const img = document.createElement('img');
      img.className = 'cb-deck-thumb';
      img.src = `./ilustraciones/${deck.thumb}.jpg`;
      img.style.objectPosition = CB_THUMB_OFFSET.get(deck.thumb) || 'top';
      img.onerror = () => {
        img.remove();
        const empty = document.createElement('div');
        empty.className = 'cb-deck-thumb-empty';
        empty.textContent = '🂠';
        thumbWrap.prepend(empty);
      };
      thumbWrap.appendChild(img);
    } else {
      const empty = document.createElement('div');
      empty.className = 'cb-deck-thumb-empty';
      empty.textContent = '🂠';
      thumbWrap.appendChild(empty);
    }
    thumbWrap.onclick = (e) => { e.stopPropagation(); if (!isLocked) cbSelectDeck(deckKey); };
    item.appendChild(thumbWrap);

    // Lock overlay icon
    if (isLocked) {
      const lockIcon = document.createElement('div');
      lockIcon.className = 'cb-deck-lock-overlay';
      lockIcon.textContent = '🔒';
      item.appendChild(lockIcon);
    }

    // Preset badge
    if (isPreset) {
      const badge = document.createElement('div');
      badge.className = 'cb-deck-preset-badge';
      badge.textContent = t('cb_badge_basic');
      item.appendChild(badge);
    }

    // Info area — single click selects, double click renames (user only)
    const info = document.createElement('div');
    info.className = 'cb-deck-info';
    info.style.cursor = isPreset ? 'pointer' : 'pointer';

    const nameWrap = document.createElement('div');
    nameWrap.className = 'cb-deck-name-wrap';
    const nameEl = document.createElement('span');
    nameEl.className = 'cb-deck-name';
    nameEl.textContent = deck.name;
    nameWrap.appendChild(nameEl);

    if (!isPreset) {
      const inputEl = document.createElement('input');
      inputEl.className = 'cb-deck-name-input';
      inputEl.type = 'text';
      inputEl.style.display = 'none';
      nameWrap.appendChild(inputEl);
    }

    const countEl = document.createElement('div');
    countEl.className = 'cb-deck-count';
    const v1 = deck.cards.filter(n => CARD_DB[n]?.value === 1).length;
    const v0 = deck.cards.filter(n => CARD_DB[n]?.value === 0).length;
    countEl.textContent = `${v1}/8 V1 · ${v0}/2 V0`;

    info.appendChild(nameWrap);
    info.appendChild(countEl);
    item.appendChild(info);

    // Delete button (user only)
    if (!isPreset) {
      const delBtn = document.createElement('button');
      delBtn.className = 'cb-deck-delete';
      delBtn.textContent = '✕';
      delBtn.title = 'Eliminar mazo';
      delBtn.onclick = (e) => { e.stopPropagation(); cbDeleteDeck(deckKey); };
      item.appendChild(delBtn);
    }

    // Item click behaviour
    let dblTimer = null;
    item.onclick = (e) => {
      if (e.target.closest('.cb-deck-thumb-wrap, .cb-deck-delete, .cb-deck-name-input')) return;
      if (isLocked) return; // blocked preset deck — ignore clicks
      if (!isPreset) {
        // Double click on info → rename; single click → select (instant)
        if (dblTimer) {
          clearTimeout(dblTimer);
          dblTimer = null;
          cbStartRenaming(deckKey);
        } else {
          cbSelectDeck(deckKey); // instant select on first click
          dblTimer = setTimeout(() => { dblTimer = null; }, 280);
        }
      } else {
        cbSelectDeck(deckKey);
      }
    };

    return item;
  }

  // Show EITHER presets OR user decks, never both at once
  if (CB_SHOW_PRESETS) {
    PRESET_DECKS.forEach((deck, pi) => {
      list.appendChild(buildDeckItem(deck, -(pi + 1), true));
    });
  } else {
    CB_DECKS.forEach((deck, idx) => {
      list.appendChild(buildDeckItem(deck, idx, false));
    });
  }
}

function showDiscardModal() {
  const n = G.discard?.length || 0;
  document.getElementById('modal-title').textContent = `${t('modal_discard')} (${n} ${t('modal_cards_suffix')})`;
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  if (n === 0) {
    body.innerHTML = '<p style="color:var(--text-dim);font-style:italic;">' + t('cb_discard_empty') + '</p>';
  } else {
    const playerCards = [...G.discard].reverse().filter(c => c.owner === 0);
    const aiCards    = [...G.discard].reverse().filter(c => c.owner === 1);
    const otherCards = [...G.discard].reverse().filter(c => c.owner !== 0 && c.owner !== 1);

    const makeSection = (label, cards, color) => {
      if (!cards.length) return;
      const heading = document.createElement('p');
      heading.style.cssText = `font-size:0.72rem;color:${color};letter-spacing:0.08em;text-transform:uppercase;margin:8px 0 4px;`;
      heading.textContent = label;
      body.appendChild(heading);
      const grid = document.createElement('div');
      grid.className = 'modal-card-grid';
      cards.forEach(card => {
        const el = document.createElement('div');
        el.className = `modal-card-pick ${card.baseValue===0?'val0-card':'val1-card'}`;
        el.onclick = () => openCardZoom(card);
        buildCardFace(card, el, { showName: true, showEffect: true });
        grid.appendChild(el);
      });
      body.appendChild(grid);
    };

    makeSection('Jugador', playerCards, 'var(--gold)');
    makeSection('IA', aiCards, 'var(--red)');
    if (otherCards.length) makeSection('Otro', otherCards, 'var(--text-dim)');
  }
  document.getElementById('modal-options').innerHTML = '<button class="btn" onclick="closeModal()">' + t('modal_close') + '</button>';
  document.getElementById('modal-overlay').classList.add('show');
}



function showExtinctModal() {
  const n = G.extinct?.length || 0;
  document.getElementById('modal-title').textContent = `${t('modal_extinct')} (${n} ${t('modal_cards_suffix')})`;
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  if (n === 0) {
    body.innerHTML = '<p style="color:var(--text-dim);font-style:italic;">' + t('cb_extinct_empty') + '</p>';
  } else {
    const playerCards = [...G.extinct].reverse().filter(c => c.owner === 0);
    const aiCards    = [...G.extinct].reverse().filter(c => c.owner === 1);
    const otherCards = [...G.extinct].reverse().filter(c => c.owner !== 0 && c.owner !== 1);

    const makeSection = (label, cards, color) => {
      if (!cards.length) return;
      const heading = document.createElement('p');
      heading.style.cssText = `font-size:0.72rem;color:${color};letter-spacing:0.08em;text-transform:uppercase;margin:8px 0 4px;`;
      heading.textContent = label;
      body.appendChild(heading);
      const grid = document.createElement('div');
      grid.className = 'modal-card-grid';
      cards.forEach(card => {
        const el = document.createElement('div');
        el.className = `modal-card-pick ${card.baseValue===0?'val0-card':'val1-card'}`;
        el.onclick = () => openCardZoom(card);
        buildCardFace(card, el, { showName: true, showEffect: true });
        grid.appendChild(el);
      });
      body.appendChild(grid);
    };

    makeSection('Jugador', playerCards, 'var(--gold)');
    makeSection('IA', aiCards, 'var(--red)');
    if (otherCards.length) makeSection('Otro', otherCards, 'var(--text-dim)');
  }
  document.getElementById('modal-options').innerHTML = '<button class="btn" onclick="closeModal()">' + t('modal_close') + '</button>';
  document.getElementById('modal-overlay').classList.add('show');
}

function showDeckSoi() {
  if (!soiActive()) return;
  const isDeckMode = !!(G.playerDecks?.[0] || G.playerDecks?.[1]);
  const playerDeckToShow = isDeckMode ? (G.playerDecks?.[0] ?? []) : G.deck;
  const rivalDeckToShow  = isDeckMode ? (G.playerDecks?.[1] ?? []) : G.deck;
  if (!playerDeckToShow.length && !rivalDeckToShow.length) return;
  modalResolve = null;
  document.getElementById('modal-title').textContent = t('modal_soi_title');
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  const note = document.createElement('p');
  note.style.cssText = 'font-size:0.78rem;color:var(--text-dim);font-style:italic;margin-bottom:10px;';
  note.textContent = t('modal_soi_note');
  body.appendChild(note);

  function buildSoiSection(label, deckSlice, labelColor) {
    const sec = document.createElement('div');
    sec.style.cssText = 'margin-bottom:14px;';
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:0.75rem;letter-spacing:0.1em;color:' + labelColor + ';margin-bottom:6px;';
    lbl.textContent = label;
    sec.appendChild(lbl);
    if (!deckSlice.length) {
      const empty = document.createElement('p');
      empty.style.cssText = 'font-size:0.75rem;color:var(--text-dim);font-style:italic;';
      empty.textContent = t('cb_deck_empty');
      sec.appendChild(empty);
    } else {
      const grid = document.createElement('div');
      grid.className = 'modal-card-grid';
      deckSlice.forEach((card, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;';
        const numBadge = document.createElement('div');
        numBadge.style.cssText = 'position:absolute;top:-6px;left:-4px;background:var(--gold);color:#000;font-size:0.6rem;font-weight:bold;border-radius:3px;padding:1px 4px;z-index:2;';
        numBadge.textContent = '#' + (i+1);
        const el = document.createElement('div');
        el.className = 'modal-card-pick ' + (card.value===0?'val0-card':'val1-card');
        buildCardFace(card, el, { showName: true, showEffect: OPTIONS.showEffect, showType: OPTIONS.showType });
        el.onclick = () => openCardZoom(card);
        wrap.appendChild(numBadge);
        wrap.appendChild(el);
        grid.appendChild(wrap);
      });
      sec.appendChild(grid);
    }
    return sec;
  }

  body.appendChild(buildSoiSection('— Tu mazo —', playerDeckToShow.slice(0, 4), 'var(--blue)'));
  body.appendChild(buildSoiSection('— Mazo rival —', rivalDeckToShow.slice(0, 4), 'var(--red)'));

  const opts = document.getElementById('modal-options');
  opts.innerHTML = '';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-sm'; closeBtn.textContent = t('modal_close');
  closeBtn.onclick = closeModal;
  opts.appendChild(closeBtn);
  document.getElementById('modal-overlay').classList.add('show');
}

// ══════════════════════════════════════════════════════════
//  CARD ZOOM
// ══════════════════════════════════════════════════════════
// zoomContext: { list: [...cards], index: N } or null
let zoomContext = null;

function openCardZoom(card, list = null, index = null) {
  playSound('uiClick');
  const overlay = document.getElementById('card-zoom-overlay');
  const box = document.getElementById('card-zoom-box');
  const img = document.getElementById('card-zoom-img');
  const fb = document.getElementById('card-zoom-fallback');

  fb.style.display = 'none';
  img.style.display = 'block';
  img.src = `./ilustraciones/${card.name}.jpg`;
  img.onerror = () => { img.style.display = 'none'; };
  img.onload = () => { img.style.display = 'block'; };

  const isVal0 = card.baseValue === 0;
  box.className = isVal0 ? 'val0' : '';

  const curiOverlay = document.getElementById('curiosidad-overlay');
  Array.from(box.children).forEach(c => {
    if (c !== img && c !== fb && c !== curiOverlay) c.remove();
  });

  buildCardFace(card, box, { showName: true, showEffect: true });

  // Shiny effect in zoom if active
  applyShinyIfUnlocked(box, card.name);

  // Favorite star button (top-right corner of zoom box)
  const favBtn = document.createElement('button');
  favBtn.id = 'zoom-fav-btn';
  favBtn.textContent = '★';
  favBtn.title = 'Marcar como favorita';
  const cardKey = card.name;
  if (favorites.has(cardKey)) favBtn.classList.add('active');
  favBtn.onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(cardKey);
    favBtn.classList.toggle('active', favorites.has(cardKey));
    renderCardBrowser(); // refresh browser grid if open
  };
  box.appendChild(favBtn);

  // Navigation context
  if (list && index !== null) {
    zoomContext = { list, index };
    overlay.classList.add('has-nav');
  } else {
    zoomContext = null;
    overlay.classList.remove('has-nav');
  }

  // ── Curiosidad button + test button — appended to wrap (outside overflow:hidden box) ──
  {
    const wrap = document.getElementById('zoom-card-wrap');
    // Remove any previously appended curiosidad button
    const oldBtn = document.getElementById('curiosidad-btn');
    if (oldBtn) oldBtn.remove();


    const curiBtn = document.createElement('button');
    curiBtn.id = 'curiosidad-btn';
    const profile = loadProfile();
    const userLevel = profile.userLevel || 0;
    const hasCuri = CURIOSIDADES[card.name];
    // Level needed = position in CURIOSIDAD_ORDER (1-based), or 0 if not in list
    const orderIdx = CURIOSIDAD_ORDER.indexOf(card.name);
    const levelNeeded = orderIdx >= 0 ? orderIdx + 1 : null;
    if (hasCuri) {
      if (levelNeeded === null || userLevel >= levelNeeded) {
        curiBtn.textContent = t('btn_info');
        curiBtn.onclick = (e) => {
          e.stopPropagation();
          const isOpen = document.getElementById('curiosidad-overlay').classList.contains('show');
          if (isOpen) {
            closeCuriosidad();
          } else {
            openCuriosidad(card.name);
          }
        };
      } else {
        curiBtn.textContent = `${t('level_locked')} ${levelNeeded} ${t('level_required')}`;
        curiBtn.classList.add('locked');
        curiBtn.onclick = (e) => e.stopPropagation();
      }
      wrap.appendChild(curiBtn);
    }
    // Always hide the overlay when opening a new card
    closeCuriosidad();
  }

  // Token preview panel (for cards that spawn tokens)
  const SPAWNS_TOKEN = {
    'Reiza': 'Gatito',
    'Fukou': 'ErizoPeluche',
    'Nugu':  'ErizoPeluche',
    'Nofi':  'Ery',
  };
  const tokenPanel = document.getElementById('zoom-token-panel');
  tokenPanel.innerHTML = '';
  const spawnedName = SPAWNS_TOKEN[card.name];
  if (spawnedName && TOKENS[spawnedName]) {
    const label = document.createElement('div');
    label.className = 'zoom-token-label';
    label.textContent = 'Token invocado';
    tokenPanel.appendChild(label);
    const tokenCard = mkToken(spawnedName, -1);
    const tokenEl = document.createElement('div');
    tokenEl.className = 'zoom-token-card';
    tokenEl.style.cursor = 'pointer';
    tokenEl.title = 'Ver token';
    tokenEl.onclick = (e) => { e.stopPropagation(); openCardZoom(tokenCard); };
    const tokenImg = document.createElement('img');
    tokenImg.src = `./ilustraciones/${spawnedName}.jpg`;
    tokenImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:8px;';
    tokenImg.onerror = () => { tokenImg.style.display = 'none'; };
    tokenEl.appendChild(tokenImg);
    buildCardFace(tokenCard, tokenEl, { showName: true, showEffect: true });
    tokenPanel.appendChild(tokenEl);
  }

  overlay.classList.add('show');
}

function openCuriosidad(cardName) {
  const overlay = document.getElementById('curiosidad-overlay');
  const text    = document.getElementById('curiosidad-text');
  text.textContent = getCuriosidadText(cardName);
  overlay.classList.add('show');
  const btn = document.getElementById('curiosidad-btn');
  if (btn) btn.textContent = t('btn_back_card');
}

function closeCuriosidad() {
  const overlay = document.getElementById('curiosidad-overlay');
  if (overlay) overlay.classList.remove('show');
  const btn = document.getElementById('curiosidad-btn');
  if (btn && !btn.classList.contains('locked')) btn.textContent = t('btn_info');
}

function zoomNavigate(dir) {
  if (!zoomContext) return;
  const newIndex = zoomContext.index + dir;
  if (newIndex < 0 || newIndex >= zoomContext.list.length) return;
  openCardZoom(zoomContext.list[newIndex], zoomContext.list, newIndex);
}

function closeCardZoom() {
  document.getElementById('card-zoom-overlay').classList.remove('show');
  document.getElementById('card-zoom-overlay').classList.remove('has-nav');
  closeCuriosidad();
  zoomContext = null;
}

// Keyboard navigation for zoom
function undoDestinada1() {
  if (!destinadaCard1Info) return;
  const { card, spaceIdx, slotIdx } = destinadaCard1Info;

  // Remove card from slot
  G.spaces[spaceIdx].slots[0][slotIdx] = null;

  // Clean all placement flags from the card
  delete card._placedThisTurn;
  delete card._yukoi_pending;

  // Reset bonuses so Gae's negative existBonus (or any other bonus) doesn't persist in hand
  resetCardBonus(card);

  // Return card to hand — insert at the position selectedCard2 currently occupies
  // so the index is before the second selected card
  const insertAt = selectedCard2 !== null ? selectedCard2 : G.hands[0].length;
  G.hands[0].splice(insertAt, 0, card);
  // selectedCard2 may have shifted
  if (selectedCard2 !== null && insertAt <= selectedCard2) selectedCard2++;
  // Restore selectedCard to the card we just put back
  selectedCard = insertAt;

  destinadaPhase = 0;
  destinadaCard1Info = null;
  addLog(`Colocación Destinada deshecha. Elige de nuevo.`, 'effect');
  render();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // Close card browser (modal in-game or fullscreen from menu)
    const cbOverlay = document.getElementById('card-browser-overlay');
    if (cbOverlay?.classList.contains('show')) {
      playSound('uiClick');
      closeCardBrowser();
      return;
    }
    // Close options
    const optOverlay = document.getElementById('options-overlay');
    if (optOverlay?.classList.contains('show')) {
      playSound('uiClick');
      closeOptions();
      return;
    }
    // Close rules/generic modal
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay?.classList.contains('show')) {
      playSound('uiClick');
      closeModal();
      return;
    }
    if (destinadaPhase === 1) {
      undoDestinada1();
      return;
    }
    // Cancel board/space/slot pick (e.g. Gran Demonio ally pick or destination pick)
    if (boardPickState) { if (!boardPickState.mandatory) cancelBoardPick(); return; }
    if (spacePickState) { if (!spacePickState.mandatory) cancelSpacePick(); return; }
    if (slotPickState)  { if (!slotPickState.mandatory)  cancelSlotPick();  return; }
    // Cancel second-card pre-selection
    if (G.phase === 'player_place' && selectedCard2 !== null) {
      selectedCard2 = null;
      render();
      return;
    }
    closeCardZoom();
    return;
  }
  if (!zoomContext) return;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); zoomNavigate(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); zoomNavigate(1); }
});

function showRules() {
  document.getElementById('modal-title').textContent = t('modal_rules_title');
  const lang = window.CURRENT_LANG || 'es';
  let rulesHtml;
  if (lang === 'en') {
    rulesHtml = `
      <b>Objective:</b> Win more Spaces by the end of 6 turns.<br><br>
      <b>Turn:</b> Place 1 card face down in a slot; then both are revealed. The player winning more spaces always reveals first.<br><br>
      <b>Types:</b> ♾ Exist = Always active when face up on the board. ✴ Reveal = Triggers once when revealed (on the board). <b>Special</b> cards activate on their own once their written condition is met.<br><br>
      <b>Value 0:</b> Cannot receive value from any external source, nor be removed; but they break ties. If extinguished, the space is extinguished too. Each match starts with two unique ones. The deck does not contain these cards. Reki is never in the deck, but there is a small chance it appears replacing a drawn card during the match.<br><br>
      <b>Value 1:</b> Grant 1 value by default + bonuses/advantages. They can be removed.<br><br>
      <b>Destined Placement ⸎:</b> Once per match, each player may place 2 cards in the same turn: one Value 0 and one Value 1. Select the first card (glows yellow), select the second (glows red), then place them and they will be revealed in the same order. (You can press ESC after placing the first card to cancel)<br><br>
      <b>Spaces:</b> There are 3 spaces with 3 slots each where cards are placed. Each space has an effect. Some effects can reduce slots; Reki ignores this.<br><br>
      <b>Tiebreaker (best to worst):</b><br>
      1. Highest V1 score.<br>
      2. More genuine V0 cards.<br>
      3. More V1 cards reduced to 0.<br>
      4. Valueless cards (Reiza, Resta) — never win a space.<br>
      5. Imi (global) breaks any tie between equal levels.<br><br>
    `;
  } else if (lang === 'ja') {
    rulesHtml = `
      <b>目的：</b>6ターン終了時により多くのスペースを制する。<br><br>
      <b>ターン：</b>スロットに1枚のカードを裏向きで置く。その後、両プレイヤーのカードが公開される。より多くのスペースを制しているプレイヤーが先に公開する。<br><br>
      <b>タイプ：</b>♾ 存在 = 盤面に表向きである間、常に効果が発動する。✴ 公開 = 盤面で公開されたとき一度だけ発動する。<b>特殊</b>カードは記載された条件を満たすと自動で発動する。<br><br>
      <b>値0：</b>外部からの値を受け取れず、除去もされない。ただし同点を破ることができる。絶滅した場合、そのスペースも絶滅する。各試合では固有の2枚から始める。デッキにはこれらのカードは含まれない。レキはデッキに入らないが、試合中にドローされたカードに代わって登場する小さな可能性がある。<br><br>
      <b>値1：</b>デフォルトで1値を付与し、ボーナスや利点も持つ。除去される可能性がある。<br><br>
      <b>運命配置 ⸎：</b>各プレイヤーは1試合に1回、同じターンに2枚のカードを置くことができる（値0と値1それぞれ1枚）。最初のカードを選択（黄色に光る）、次のカードを選択（赤に光る）、その後配置すると同じ順番で公開される（最初のカードを置いた後にESCを押すとキャンセル可能）。<br><br>
      <b>スペース：</b>カードを置く3つのスペースがあり、それぞれに3つのスロットがある。各スペースには効果がある。一部の効果でスロットが減ることがあるが、レキはこれを無視する。<br><br>
      <b>同点決定（優先順位順）：</b><br>
      1. 値1の合計スコアが高い方。<br>
      2. 本物の値0カードが多い方。<br>
      3. 値1から0になったカードが多い方。<br>
      4. 値なしカード（レイザ、レスタ）— スペースを制することはない。<br>
      5. イミ（全体）は同レベル同士の引き分けをあらゆる場合に解消する。<br><br>
    `;
  } else {
    rulesHtml = `
      <b>Objetivo:</b> Ganar más Espacios al final de 6 turnos.<br><br>
      <b>Turno:</b> Coloca 1 carta boca abajo en un hueco; luego, ambas se revelan. Siempre revela primero quien gane más espacios.<br><br>
      <b>Tipos:</b> ♾ Existir = Siempre activo si está boca arriba en el tablero. ✴ Revelar = Se activa una vez al revelarse (en el tablero). Las cartas <b>Especiales</b> se activan solas tras cumplir la condición escrita.<br><br>
      <b>Valor 0:</b> No pueden recibir valor de ninguna fuente externa, ni ser removidas; pero desempatan. Si son extinguidas, el espacio también lo hará. En cada partida, se empieza con dos únicas. El mazo no contiene estas cartas. Reki nunca está en el mazo, pero existe una pequeña posibilidad de que aparezca reemplazando una carta robada durante la partida.<br><br>
      <b>Valor 1:</b> Otorgan 1 valor por defecto + bonificaciones/ventajas. Pueden ser removidas.<br><br>
      <b>Colocación Destinada ⸎:</b> Una vez por partida, cada jugador puede colocar 2 cartas en el mismo turno: una de Valor 0 y una de Valor 1. Selecciona la primera carta (brilla en amarillo), selecciona la segunda (brilla en rojo), luego colocalas y se revelarán en el mismo orden. (Puedes pulsar ESC al colocar la primera para cancelar)<br><br>
      <b>Espacios:</b> Hay 3 espacios con 3 huecos cada uno donde se colocan cartas. Cada espacio tiene un efecto. Algunos efectos pueden reducir huecos; Reki ignora esto.<br><br>
      <b>Desempate (de mejor a peor):</b><br>
      1. Mayor puntuación V1.<br>
      2. Más cartas V0 genuinas.<br>
      3. Más cartas V1 reducidas a 0.<br>
      4. Cartas sin Valor (Reiza, Resta) — nunca ganan un espacio.<br>
      5. Imi (global) rompe cualquier empate entre niveles iguales.<br><br>
    `;
  }
  document.getElementById('modal-body').innerHTML = rulesHtml;
  document.getElementById('modal-options').innerHTML = '<button class="btn" onclick="playSound(\'uiClick\');closeModal()">' + t('modal_close') + '</button>';
  document.getElementById('modal-overlay').classList.add('show');
}

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
function showAIThinking(show) {
  const el = document.getElementById('ai-thinking');
  el.style.display = show ? 'flex' : 'none';
  el.className = show ? 'show' : '';
}
function sleep(ms) { return new Promise(r=>setTimeout(r,ms)).then(() => typeof ritmoSinZoom === 'function' ? ritmoSinZoom() : null); }   // [Cambiado] con una carta ampliada abierta, se espera

// ══════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ══════════════════════════════════════════════════════════
let gameSessionId = 0;

async function startGame(deckP0 = null, deckP1 = null) {
  const sessionId = ++gameSessionId;
  stopMenuMusic();

  document.getElementById('screen-menu').style.display = 'none';
  document.getElementById('end-overlay').classList.remove('active');
  document.getElementById('screen-game').classList.add('active');

  // Reset end-panel state from previous game
  const _upanel = document.getElementById('end-unlocks-panel');
  if (_upanel) { _upanel.classList.remove('revealed'); _upanel.dataset.pendingReveal = '0'; }
  ['end-btn-play','end-btn-menu','end-btn-board'].forEach(id => {
    const b = document.getElementById(id); if (b) b.disabled = true;
  });

  selectedCard = null;
  selectedCard2 = null;
  destinadaPhase = 0;
  destinadaCard1Info = null;
  pendingPlacement = null;

  initGame(deckP0, deckP1);
  // All spaces are always revealed from the start — apply their effects now
  for (let spIdx = 0; spIdx < 3; spIdx++) {
    await applySpaceOnReveal(spIdx);
  }
  render();

  document.getElementById('btn-historial-inline').style.display = 'inline-block';
  // Cartas: show but lock if below level 1
  const _cartasBtn = document.getElementById('btn-cartas-inline');
  _cartasBtn.style.display = 'inline-block';
  try {
    _cartasBtn.classList.remove('fab-locked');
    _cartasBtn.removeAttribute('tabindex');
  } catch(e) {}
  document.getElementById('btn-reglas-inline').style.display = 'inline-block';
  document.getElementById('btn-play-again').style.display = 'none';
  document.getElementById('btn-exit-menu-fab').style.display = 'none';
  const abandonBtnStart = document.getElementById('btn-abandon');
  if (abandonBtnStart) abandonBtnStart.style.display = 'block';
  document.getElementById('btn-log-float').style.display = 'none';

  addLog('¡La partida ha comenzado!', 'important');
  await gameSleep(200);

  const isDeckMode = !!(deckP0 || deckP1);

  if (isDeckMode) {
    // Deck mode: deal 1 V0 + 3 V1 from each player's own deck
    for (let player = 0; player < 2; player++) {
      if (gameSessionId !== sessionId) return;
      const deckEl = document.getElementById('deck-pile-vis');

      // Deal 1 V0 — Suma is drawn first if present in the deck
      const sumaV0idx = G.playerDecks[player].findIndex(c => c.name === 'Suma');
      const v0idx = sumaV0idx !== -1 ? sumaV0idx : G.playerDecks[player].findIndex(c => c.baseValue === 0);
      if (v0idx !== -1) {
        const card = G.playerDecks[player].splice(v0idx, 1)[0];
        card.owner = player;
        G.hands[player].push(card);
        playSound('draw');
        render();
        const fromRect = deckEl ? deckEl.getBoundingClientRect() : { left: window.innerWidth-70, top: window.innerHeight/2, width:52, height:74 };
        const lastEl = player === 0 ? document.getElementById('hand-cards')?.lastElementChild : document.getElementById('ai-hidden-hand')?.lastElementChild;
        const toRect = lastEl ? lastEl.getBoundingClientRect() : { left: window.innerWidth/2, top: player===0?window.innerHeight-100:40, width:170, height:238 };
        await (typeof animarRobo === 'function' ? animarRobo(fromRect, toRect, card, player) : animateFlyCard(fromRect, toRect, Math.round(340 * OPTIONS.speedFactor)));   // [Cambio] reparto: la carta aparece al llegar
        await gameSleep(80);
      }

      // [Cambiado] Deal 3 V1 (mano inicial: 1 de Valor 0 y 3 de Valor 1)
      for (let i = 0; i < 3; i++) {
        if (gameSessionId !== sessionId) return;
        const v1idx = G.playerDecks[player].findIndex(c => c.baseValue === 1);
        if (v1idx === -1) break;
        const card = G.playerDecks[player].splice(v1idx, 1)[0];
        card.owner = player;
        G.hands[player].push(card);
        playSound('draw');
        render();
        const fromRect = deckEl ? deckEl.getBoundingClientRect() : { left: window.innerWidth-70, top: window.innerHeight/2, width:52, height:74 };
        const lastEl = player === 0 ? document.getElementById('hand-cards')?.lastElementChild : document.getElementById('ai-hidden-hand')?.lastElementChild;
        const toRect = lastEl ? lastEl.getBoundingClientRect() : { left: window.innerWidth/2, top: player===0?window.innerHeight-100:40, width:170, height:238 };
        await (typeof animarRobo === 'function' ? animarRobo(fromRect, toRect, card, player) : animateFlyCard(fromRect, toRect, Math.round(340 * OPTIONS.speedFactor)));   // [Cambio] reparto: la carta aparece al llegar
        await gameSleep(80);
      }
      await gameSleep(150);
    }
  } else {
    // Quick game: deal 1 V0 + 3 V1 from shared deck
    for (let player = 0; player < 2; player++) {
      const deckEl = document.getElementById('deck-pile-vis');

      // [Cambiado] Deal 1 V0 from the V0 pool (mano inicial: 1 de Valor 0 y 3 de Valor 1)
      for (let i = 0; i < 1; i++) {
        if (gameSessionId !== sessionId) return;
        const idx = G.v0Pool.findIndex(c => !G.usedV0Names.has(c.name));
        if (idx === -1) break;
        const card = G.v0Pool.splice(idx, 1)[0];
        G.usedV0Names.add(card.name);
        card.owner = player;
        G.hands[player].push(card);
        playSound('draw');
        render();
        const fromRect = deckEl ? deckEl.getBoundingClientRect() : { left: window.innerWidth-70, top: window.innerHeight/2, width:52, height:74 };
        const lastEl = player === 0 ? document.getElementById('hand-cards')?.lastElementChild : document.getElementById('ai-hidden-hand')?.lastElementChild;
        const toRect = lastEl ? lastEl.getBoundingClientRect() : { left: window.innerWidth/2, top: player===0?window.innerHeight-100:40, width:170, height:238 };
        await (typeof animarRobo === 'function' ? animarRobo(fromRect, toRect, card, player) : animateFlyCard(fromRect, toRect, Math.round(340 * OPTIONS.speedFactor)));   // [Cambio] reparto: la carta aparece al llegar
        await gameSleep(80);
      }

      // [Cambiado] Deal 3 V1 from shared deck
      for (let i = 0; i < 3; i++) {
        if (gameSessionId !== sessionId) return;
        const v1idx = G.deck.findIndex(c => c.baseValue === 1);
        const card = v1idx !== -1 ? G.deck.splice(v1idx, 1)[0] : G.deck.shift();
        card.owner = player;
        G.hands[player].push(card);
        playSound('draw');
        render();
        const fromRect = deckEl ? deckEl.getBoundingClientRect() : { left: window.innerWidth-70, top: window.innerHeight/2, width:52, height:74 };
        const lastEl = player === 0 ? document.getElementById('hand-cards')?.lastElementChild : document.getElementById('ai-hidden-hand')?.lastElementChild;
        const toRect = lastEl ? lastEl.getBoundingClientRect() : { left: window.innerWidth/2, top: player===0?window.innerHeight-100:40, width:170, height:238 };
        await (typeof animarRobo === 'function' ? animarRobo(fromRect, toRect, card, player) : animateFlyCard(fromRect, toRect, Math.round(340 * OPTIONS.speedFactor)));   // [Cambio] reparto: la carta aparece al llegar
        await gameSleep(80);
      }
      await gameSleep(150);
    }
  }

  await gameSleep(200);
  if (gameSessionId !== sessionId) return;

  await handleSumaStart();

  G.phase = 'player_place';
  render();
  if (typeof ritmoCartelTurno === 'function') ritmoCartelTurno();   // [Nuevo] «Turno 1 de 6»
}

let _imagesPreloaded = false;
function preloadCardImages() {
  if (_imagesPreloaded) return;
  _imagesPreloaded = true;
  const names = Object.keys(CARD_DB);
  names.forEach(name => {
    const img = new Image();
    img.src = `./ilustraciones/${name}.jpg`;
  });
}

function showMenu() {
  closeFabMenu();
  gameSessionId++;
  document.getElementById('screen-menu').style.display = 'flex';
  document.getElementById('screen-game').classList.remove('active');
  document.getElementById('end-overlay').classList.remove('active');
  document.getElementById('btn-log-float').style.display = 'none';
  document.getElementById('btn-historial-inline').style.display = 'none';
  document.getElementById('btn-cartas-inline').style.display = 'none';
  document.getElementById('btn-reglas-inline').style.display = 'none';
  document.getElementById('btn-play-again').style.display = 'none';
  document.getElementById('btn-exit-menu-fab').style.display = 'none';
  const abandonBtnMenu = document.getElementById('btn-abandon');
  if (abandonBtnMenu) abandonBtnMenu.style.display = 'none';
  closeLogModal();
  closeOptions();
  preloadCardImages();
  playMenuMusic();

  // Lock only "Jugar con mazo" until level 1; rest are always unlocked
  try {
    const _menuProfile = loadProfile();
    const _menuLevel   = _menuProfile.userLevel || 0;
    const _alwaysUnlocked = ['btn-card-browser-menu', 'btn-profile-menu', 'btn-hitos-menu'];
    _alwaysUnlocked.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('btn-locked');
      el.removeAttribute('tabindex');
    });
    const _deckBtn = document.getElementById('btn-deck-game-menu');
    if (_deckBtn) {
      if (_menuLevel < 1) {
        _deckBtn.classList.add('btn-locked');
        _deckBtn.setAttribute('tabindex', '-1');
      } else {
        _deckBtn.classList.remove('btn-locked');
        _deckBtn.removeAttribute('tabindex');
      }
    }
  } catch(e) {}
}

// UI click sound for menu, log modal, options, top-bar buttons and card zoom
['screen-menu', 'log-modal', 'options-overlay', 'top-bar', 'card-zoom-overlay', 'card-browser', 'fab-menu'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => {
    if (e.target.closest('button, .cb-filter-btn, .opt-cat-btn')) playSound('uiClick');
  });
});

// ══════════════════════════════════════════════════════════
//  PLAYER PROFILE & STATISTICS
// ══════════════════════════════════════════════════════════
// ── XP bar helpers for end screen ──
function buildEndXpBlockHTML(profile, segsEarned) {
  // Reconstruct the BEFORE state so the bar shows correct progress immediately on render
  const afterSeg  = profile.xpSegments || 0;
  const levelsUp  = profile._levelsGainedThisGame || 0;
  let   beforeSeg = afterSeg + 4 * levelsUp - segsEarned;
  if (beforeSeg < 0) beforeSeg = 0;
  const beforeLevel = (profile.userLevel || 0) - levelsUp;

  // Build each segment with its pre-game fill state baked in as inline style
  const segs = [0,1,2,3].map(i => {
    const full  = Math.floor(beforeSeg);
    const extra = beforeSeg - full;
    let pct = 0;
    if (i < full) pct = 100;
    else if (i === full && extra >= 0.5) pct = 50;
    const cls = pct >= 100 ? 'end-xp-seg seg-done' : pct > 0 ? 'end-xp-seg seg-active' : 'end-xp-seg';
    return `<div class="${cls}" id="end-xpseg-${i}"><div class="xp-fill" style="width:${pct}%;transition:none;"></div></div>`;
  }).join('');

  return `
    <div class="end-xp-block">
      <div class="end-xp-level-label">${t('level_label')} ${beforeLevel}</div>
      <div class="end-xp-segs" id="end-xp-segs-live">
        ${segs}
      </div>
    </div>`;
}

function animateEndXpBar(profile, segsEarned) {
  // profile.xpSegments = state AFTER the gain
  // We reconstruct the BEFORE state
  const afterSeg  = profile.xpSegments || 0;   // 0–3.5 after this game
  const afterLvl  = profile.userLevel  || 0;
  const levelsUp  = profile._levelsGainedThisGame || 0;

  // Total segments gained in this game as a continuous value (each level = 4 segments overflow)
  // before state: walk backwards
  let beforeSeg = afterSeg + 4 * levelsUp - segsEarned;
  // Clamp — can't be negative; if levelsUp caused it to wrap, beforeSeg might be < 0 on first level
  if (beforeSeg < 0) beforeSeg = 0;

  // Duration constants
  const SEG_DUR = 520;   // ms to fill one full segment (lento y contemplativo)
  const PAUSE   = 120;   // ms gap between segments

  // Set CSS duration variable on each segment
  document.querySelectorAll('.end-xp-seg').forEach(el => {
    el.style.setProperty('--xp-dur', SEG_DUR + 'ms');
  });

  // Helper: render static state (no animation) — used to pre-fill already-complete segs
  function setSegStatic(idx, pct) {
    const el = document.getElementById(`end-xpseg-${idx}`);
    if (!el) return;
    const fill = el.querySelector('.xp-fill');
    if (!fill) return;
    // Disable transition for instant set
    fill.style.transition = 'none';
    fill.style.width = pct + '%';
    el.className = 'end-xp-seg' + (pct >= 100 ? ' seg-done' : pct > 0 ? ' seg-active' : '');
    // Re-enable after paint
    requestAnimationFrame(() => {
      fill.style.transition = '';
    });
  }

  // Helper: animate one segment filling from startPct → endPct, returns Promise
  function animateSeg(idx, startPct, endPct) {
    return new Promise(resolve => {
      const el = document.getElementById(`end-xpseg-${idx}`);
      if (!el) { resolve(); return; }
      const fill = el.querySelector('.xp-fill');
      if (!fill) { resolve(); return; }

      // Set start instantly
      fill.style.transition = 'none';
      fill.style.width = startPct + '%';
      el.className = 'end-xp-seg seg-active';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        // Duration proportional to how much we're filling
        const fraction = (endPct - startPct) / 100;
        const dur = Math.round(SEG_DUR * fraction);
        fill.style.transition = `width ${dur}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        fill.style.width = endPct + '%';

        // Play xpFill sound at start of each segment sweep
        playSound('xpFill');

        setTimeout(() => {
          if (endPct >= 100) el.classList.add('seg-done');
          else if (endPct >= 50) el.classList.add('seg-half-done');
          resolve();
        }, dur + 30);
      }));
    });
  }

  // Helper: flash all segments white, then clear them (level-up moment)
  function flashAndClear(newLevel) {
    return new Promise(resolve => {
      // Flash: set all to done instantly
      for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`end-xpseg-${i}`);
        if (!el) continue;
        const fill = el.querySelector('.xp-fill');
        if (fill) { fill.style.transition = 'none'; fill.style.width = '100%'; }
        el.className = 'end-xp-seg seg-done';
      }
      playSound('xpLevelUp');
      nivelSubidoEfecto();   // [Nuevo] estallido de destellos en pixel art

      // Update level label
      setTimeout(() => {
        const lbl = document.querySelector('.end-xp-level-label');
        if (lbl) {
          lbl.style.transition = 'opacity 0.2s';
          lbl.style.opacity = '0';
          setTimeout(() => {
            lbl.textContent = `${t('level_label')} ${newLevel}`;
            lbl.style.opacity = '1';
            lbl.classList.remove('nivel-sube'); void lbl.offsetWidth; lbl.classList.add('nivel-sube');   // [Nuevo] el número salta, dorado
          }, 200);
        }
        // Clear all segments
        for (let i = 0; i < 4; i++) {
          const el = document.getElementById(`end-xpseg-${i}`);
          if (!el) continue;
          const fill = el.querySelector('.xp-fill');
          if (fill) { fill.style.transition = 'none'; fill.style.width = '0%'; }
          el.className = 'end-xp-seg';
        }
        setTimeout(resolve, 180);
      }, 320);
    });
  }

  // ── Build the animation sequence ──
  // We need to animate from beforeSeg → 4 (if level up) → 0 → ... → afterSeg
  // Each "pass" is one level worth of fill

  async function runAnimation() {
    // Segments already rendered in correct pre-game state by buildEndXpBlockHTML.
    // Small pause so the player can see the current state before it animates.
    await new Promise(r => setTimeout(r, 400));

    // Build list of segments to animate.
    // We walk in 0.5 steps but merge consecutive steps on the same segment
    // so a full-segment gain (win) animates as one sweep → one sound.
    const rawQueue = [];
    let curSeg = beforeSeg;
    let curLvl = afterLvl - levelsUp;
    const steps = segsEarned / 0.5;
    for (let s = 0; s < steps; s++) {
      const segFloor  = Math.floor(curSeg);
      const withinSeg = curSeg - segFloor; // 0 or 0.5
      rawQueue.push({
        lvl:     curLvl,
        segIdx:  segFloor,
        fromPct: withinSeg * 100,
        toPct:   withinSeg * 100 + 50,
        levelUp: (segFloor === 3 && withinSeg * 100 + 50 >= 100),
        newLvl:  curLvl + 1,
      });
      curSeg += 0.5;
      if (curSeg >= 4) { curSeg = 0; curLvl++; }
    }

    // Merge consecutive entries that share the same segIdx (e.g. 0→50 + 50→100 = 0→100)
    const queue = [];
    for (const item of rawQueue) {
      const prev = queue[queue.length - 1];
      if (prev && prev.segIdx === item.segIdx && prev.toPct === item.fromPct && !prev.levelUp) {
        prev.toPct    = item.toPct;
        prev.levelUp  = item.levelUp;
        prev.newLvl   = item.newLvl;
      } else {
        queue.push({ ...item });
      }
    }

    // Execute queue sequentially
    for (let q = 0; q < queue.length; q++) {
      const item = queue[q];
      await animateSeg(item.segIdx, item.fromPct, item.toPct);
      if (item.toPct >= 100 && item.levelUp) {
        await new Promise(r => setTimeout(r, PAUSE));
        await flashAndClear(item.newLvl);
      } else {
        await new Promise(r => setTimeout(r, PAUSE));
      }
    }
  }

  return runAnimation();
}

/* ══════════════════════════════════════════════════════════
   [Nuevo] SUBIDA DE NIVEL: estallido en pixel art sobre la barra de
   experiencia — destellos en cruz (dorados, blancos y lila) que salen
   disparados y parpadean, y un anillo de píxeles que se abre. Con su
   propio sonido de destellos, encima del de siempre.
   ══════════════════════════════════════════════════════════ */
function nivelSubidoEfecto(){
  const bloque = document.querySelector('.end-xp-block'); if (!bloque) return;
  setTimeout(() => playSound('nivelDestellos'), 90);
  const r = bloque.getBoundingClientRect(), P = 3, ANCHO = Math.max(360, r.width + 160), ALTO = 220;
  const cv = document.createElement('canvas'); cv.className = 'nivel-destellos';
  const cols = Math.ceil(ANCHO / P), filas = Math.ceil(ALTO / P);
  cv.width = cols; cv.height = filas;
  Object.assign(cv.style, { left: (r.left + r.width / 2 - ANCHO / 2) + 'px', top: (r.top + r.height / 2 - ALTO / 2) + 'px', width: ANCHO + 'px', height: ALTO + 'px' });
  document.body.appendChild(cv);
  const x = cv.getContext('2d'), cx = cols / 2, cy = filas / 2;
  const COLORES = ['#ffe9a6', '#ffffff', '#ffd76a', '#c9b8ff', '#f7c6d0'];
  const chispas = Array.from({ length: 34 }, () => {
    const a = Math.random() * Math.PI * 2, v = 18 + Math.random() * 42;
    return { x: cx + (Math.random() - .5) * r.width / P * .8, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6 - 12,
             col: COLORES[(Math.random() * COLORES.length) | 0], grande: Math.random() < .35, fase: Math.random() * 6, vida: .8 + Math.random() * .7 };
  });
  const destello = (i, j, grande, col) => {
    x.fillStyle = col; x.fillRect(i, j, 1, 1); x.fillRect(i - 1, j, 3, 1); x.fillRect(i, j - 1, 1, 3);
    if (grande){ x.fillRect(i - 2, j, 5, 1); x.fillRect(i, j - 2, 1, 5); x.fillStyle = '#fff'; x.fillRect(i, j, 1, 1); }
  };
  const t0 = performance.now();
  (function paso(now){
    const t = (now - t0) / 1000;
    if (t > 1.6){ cv.remove(); return; }
    x.clearRect(0, 0, cols, filas);
    // anillo de píxeles que se abre y se apaga
    if (t < .7){
      const rr = 6 + t / .7 * Math.min(cx, cy) * 1.4, a = 1 - t / .7;
      x.fillStyle = `rgba(255,233,166,${a})`;
      for (let k = 0; k < 90; k++){ const an = k / 90 * Math.PI * 2; x.fillRect(Math.round(cx + Math.cos(an) * rr), Math.round(cy + Math.sin(an) * rr * .55), 1, 1); }
    }
    chispas.forEach(c => {
      const f = Math.exp(-t * 2.2);                       // frenan poco a poco
      const px = c.x + c.vx * (1 - f) / 2.2, py = c.y + c.vy * (1 - f) / 2.2 + 6 * t * t;
      const a = 1 - t / c.vida; if (a <= 0) return;
      if (Math.sin(t * 22 + c.fase) < -.6) return;        // parpadeo
      x.globalAlpha = a; destello(Math.round(px), Math.round(py), c.grande && t < .9, c.col);
    });
    x.globalAlpha = 1;
    requestAnimationFrame(paso);
  })(t0);
}

// ── Curiosidades DB ──
// Edita las frases entre comillas para personalizarlas.
const CURIOSIDADES = {
  Koly:     "Es humano y los detesta; no es humano.",
  Chiouri:  "Su mascota siempre está a su lado.",
  Gena:     "Camarera destinada a que sus heridas nunca sanen.",
  Nugu:     "El destino le acompaña en las malas y en las buenas.",
  Fukou:    "Pactó una promesa que se heredó.",
  Ramia:    "La creadora de este juego; a veces tiene DEMASIADA suerte.",
  Reina:    "Madre de la creadora del juego; se rumorea que vive dentro de un punto.",
  Ziru:     "Apredió a que no se debe depender de lo que te hace especial.",
  Mugon:    "Humana muda que protegería a sus amigos sin pensarlo.",
  "Gran Demonio": "Nació a partir de energía, y se autoproclama el más fuerte del universo.",
  Slau:     "No reveles tus pecados o Slau te castigará.",
  Hanoe:    "Se tiñió el pelo igual a la idol que admira.",
  Faun:     "Pone más esfuerzo en trabajar que en dormir.",
  Yukoi:    "Nacer con ceguera no es excusa para disfrutar de la vida.",
  Abaki:    "En medio de una investigación conoció a Miria y, desde entonces, se frecuentan.",
  Mimimi:   "Incluso si termina muerta, prefiere estar atrapada en lugares estrechos.",
  Hobu:     "Prioriza a presas solitarias, es preferible calidad antes que cantidad.",
  Yiren:    "Trabajar como secretaria para Imi es un infierno; pero estar junto a ella es divertido.",
  Tira:     "Los estrategas solo esperan a que el rival actúe primero para cometer el primer error.",
  Demae:    "En sus manos, los grifos siempre terminan rotos. Otro experimento fallido.",
  Feruzu:   "Intentar ser un heroe y ser visto como el villano.",
  Kakomi:   "Una cereza, dos cerezas, tres cerezas...",
  Soi:      "Es un fastidio trabajar para vivir.",
  Tanozo:   "La maldición trabajando para la suerte.",
  Foret:    "A veces, elijas lo que elijas, te arrepentiras.",
  Tanna:    "Una vez me escondí junto a Mimimi; estaba muerta...",
  Peroth:   "El castigo o la salvación, una elección que poco importa si el pecado llega a todos.",
  Henos:    "Su padre le regaló el bolígrafo; pero pasa más tiempo con sus amigos.",
  Miria:    "Desde que tomó la mano de Abaki, el mundo se abrió.",
  Ekuro:    "Pese a trabajar para Imi, también tiene clientes habituales como Ramia.",
  Filia:    "La primera campanada avisa el desastre; para la última, ya es demasiado tarde.",
  Naiki:    "Trabaja para Imi y la viste antes de que se ponga a trabajar; cuidado de no pisar un kimono en su presencia.",
  Kaeka:    "Ha vivido tantos fracasos amorosos que su corazón es piedra.",
  Miboro:   "Le encanta esconderse, no le importa si no es capaz de ver su escondite.",
  En:       "Una maldición es otra posibilidad, tres maldiciones son tres posibilidades.",
  Ponce:    "Trabaja de novio de alquiler; pero un día, cierta mujer le compartió media cereza y se enamoró.",
  Mega:     "Incluso si todo está perdido, siempre habrá esperanza.",
  Imi:      "La suerte no puede cambiar el corazón, ni tampoco volver al pasado.",
  Etza:     "Admitir una derrota es aceptar dos victorias.",
  Gae:      "Un ligero estímulo en el hombro, y el cliente muestra el dinero.",
  Iona:     "Cuando dos realidades se unen, culaquier cosa es posible.",
  Zao:      "Fingir ser fuerte para poder ser débil.",
  Humi:     "Hará cualquier cosa para subir en el ranking de popularidad, incluso si mancilla la imagen de otros.",
  Noira:    "Poder amueblar y ordenar es un lujo, excepto cuando hablamos de la habitación de Naiki.",
  Kope:     "Si tú no puedes ser feliz, nadie lo debe ser.",
  Menmei:   "Ignorar la verdad que hay en frente es querer ser ignorante.",
  Nofi:     "No sé cómo funciona el destino; pero si es con Ery, iré a cualquier lugar.",
  Tenpoh:   "Qué quieres hacer es tu elección.",
  Tei:      "Los humanos son despreciables; cometen actos despreciables por poco sin fijarse en su propia existencia.",
  Roloc:    "Dejé de admirar lo que parecía precioso cuando mancharon sus colores.",
  Reki:     "¿Te gusta? Es mi camiseta favorita. No puedes verme, ¿verdad?",
  Moira:    "Toda meta tiene un sacrificio.",
  Reiza:    "Lo que valoras no lo hace mejor que otra cosa.",
  Yuta:     "El tiempo también es un sueño, que podamos estar hablando, también lo es.",
  Tis:      "El erizo de Nugu es tan adorable...",
  Usei:     "¡Siempre que sucede algo malo, estoy segura de que es culpa de Tis!",
  Nasu:     "La salvación de una insignificante vida destinada a morir en un papel que no le correspondía.",
  Su:       "Buscando la verdad siendo real.",
  Rasu:     "Me encanta ver lugares nuevos, pero siento que falta algo...",
  Neutra:   "Un poco más y completaré mi colección de cartas.",
  Resta:    "Si niegas el valor de algo, significa que estás preparado para que hagan lo mismo contigo.",
  Suma:     "Si tú eres feliz, yo también lo soy.",
  Una:      "Incluso si es un sueño, no pisotearé las flores.",
  // Tokens
  ErizoPeluche: "La viva imagen de... un erizo de peluche.",
  Ery:          "Nofi y yo estuvimos destinados; no dejaré que su viaje termine aquí.",
  Gatito:       "¿El gato está en la caja? Incluso sin sonido o sin vista, le dará cariño a quienes lo merece.",
};

const CURIOSIDADES_EN = {
  Koly:     "He is human and despises them; he is not human.",
  Chiouri:  "Her pet is always by her side.",
  Gena:     "A waitress destined for her wounds never to heal.",
  Nugu:     "Fate accompanies her in bad times and good.",
  Fukou:    "He made a promise that was inherited.",
  Ramia:    "The creator of this game; sometimes she has TOO much luck.",
  Reina:    "Mother of the game's creator; rumour has it she lives inside a dot.",
  Ziru:     "She learned that one should not rely on what makes you special.",
  Mugon:    "A mute human who would protect her friends without a second thought.",
  "Gran Demonio": "Born from energy, and self-proclaimed the strongest in the universe.",
  Slau:     "Do not reveal your sins or Slau will punish you.",
  Hanoe:    "She dyed her hair to match the idol she admires.",
  Faun:     "She puts more effort into working than into sleeping.",
  Yukoi:    "Being born blind is no excuse to stop enjoying life.",
  Abaki:    "In the middle of an investigation she met Miria, and since then they see each other often.",
  Mimimi:   "Even if she ends up dead, she prefers to be trapped in narrow places.",
  Hobu:     "He prioritises solitary prey; quality over quantity is preferable.",
  Yiren:    "Working as a secretary for Imi is hell; but being beside her is fun.",
  Tira:     "Strategists only wait for the rival to act first and make the first mistake.",
  Demae:    "In her hands, taps always end up broken. Another failed experiment.",
  Feruzu:   "Trying to be a hero and being seen as the villain.",
  Kakomi:   "One cherry, two cherries, three cherries...",
  Soi:      "It is a nuisance to work to live.",
  Tanozo:   "The curse working for luck.",
  Foret:    "Sometimes, whatever you choose, you will regret it.",
  Tanna:    "Once I hid with Mimimi; she was dead...",
  Peroth:   "Punishment or salvation — a choice that matters little if sin reaches everyone.",
  Henos:    "His father gave him the pen; but he spends more time with his friends.",
  Miria:    "Since she took Abaki's hand, the world opened up.",
  Ekuro:    "Despite working for Imi, she also has regular clients like Ramia.",
  Filia:    "The first toll announces disaster; by the last, it is already too late.",
  Naiki:    "She works for Imi and dresses her before she starts working; be careful not to step on a kimono in her presence.",
  Kaeka:    "She has lived so many romantic failures that her heart has turned to stone.",
  Miboro:   "She loves to hide; she does not mind if she cannot see her hiding spot.",
  En:       "One curse is another possibility; three curses are three possibilities.",
  Ponce:    "He works as a rental boyfriend; but one day, a certain woman shared half a cherry with him and he fell in love.",
  Mega:     "Even if everything is lost, there will always be hope.",
  Imi:      "Luck cannot change a heart, nor can it return to the past.",
  Etza:     "Admitting a defeat is accepting two victories.",
  Gae:      "A slight nudge on the shoulder, and the client shows the money.",
  Iona:     "When two realities unite, anything is possible.",
  Zao:      "Pretending to be strong in order to be weak.",
  Humi:     "She will do anything to rise in the popularity rankings, even if it tarnishes others' image.",
  Noira:    "Being able to furnish and tidy up is a luxury, except when it comes to Naiki's room.",
  Kope:     "If you cannot be happy, no one else should be either.",
  Menmei:   "Ignoring the truth right in front of you is choosing to be ignorant.",
  Nofi:     "I do not know how fate works; but if it is with Ery, I will go anywhere.",
  Tenpoh:   "What you want to do is your choice.",
  Tei:      "Humans are despicable; they commit despicable acts for little, without noticing their own existence.",
  Roloc:    "I stopped admiring what seemed precious when they stained its colours.",
  Reki:     "Do you like it? It is my favourite shirt. You cannot see me, can you?",
  Moira:    "Every goal has a sacrifice.",
  Reiza:    "What you value does not make it better than something else.",
  Yuta:     "Time is also a dream; that we can be talking is also one.",
  Tis:      "Nugu's hedgehog is so adorable...",
  Usei:     "Whenever something bad happens, I am sure it is Tis's fault!",
  Nasu:     "The salvation of an insignificant life destined to die in a role that was never meant to be hers.",
  Su:       "Seeking the truth by being real.",
  Rasu:     "I love seeing new places, but I feel like something is missing...",
  Neutra:   "A little more and I will complete my card collection.",
  Resta:    "If you deny the value of something, it means you are prepared for others to do the same to you.",
  Suma:     "If you are happy, so am I.",
  Una:      "Even if it is a dream, I will not trample the flowers.",
  // Tokens
  ErizoPeluche: "The spitting image of... a plush hedgehog.",
  Ery:          "Nofi and I were destined; I will not let her journey end here.",
  Gatito:       "Is the cat in the box? Even without sound or sight, it will show affection to those who deserve it.",
};

const CURIOSIDADES_JA = {
  Koly:     "彼は人間で、人間を嫌っている。しかし人間ではない。",
  Chiouri:  "彼女のペットはいつも傍にいる。",
  Gena:     "傷が癒えない運命を背負ったウェイトレス。",
  Nugu:     "運命は彼女に良い時も悪い時も付き添う。",
  Fukou:    "受け継がれた約束を交わした。",
  Ramia:    "このゲームの制作者。時々運が良すぎる。",
  Reina:    "ゲーム制作者の母親。ある点の中に住んでいるという噂がある。",
  Ziru:     "自分を特別にするものに頼ってはいけないと学んだ。",
  Mugon:    "考える間もなく友人を守ろうとする、口が利けない人間の女性。",
  "Gran Demonio": "エネルギーから生まれ、自ら宇宙最強と名乗っている。",
  Slau:     "自分の罪を明かすな、さもなければSlauに罰せられる。",
  Hanoe:    "憧れのアイドルに合わせて髪を染めた。",
  Faun:     "眠るよりも働くことに力を注ぐ。",
  Yukoi:    "盲目に生まれたことは、人生を楽しまない理由にはならない。",
  Abaki:    "捜査の途中でMiriaと出会い、それ以来二人は頻繁に会うようになった。",
  Mimimi:   "たとえ死んでしまっても、狭い場所に閉じ込められる方を好む。",
  Hobu:     "孤立した獲物を優先する。量より質だ。",
  Yiren:    "Imiの秘書として働くのは地獄だが、彼女の傍にいるのは楽しい。",
  Tira:     "策士は、相手が先に動いて最初のミスを犯すのをただ待つだけだ。",
  Demae:    "彼女の手にかかれば、蛇口は必ず壊れてしまう。また失敗した実験だ。",
  Feruzu:   "ヒーローになろうとして、悪役として見られる。",
  Kakomi:   "一つのサクランボ、二つのサクランボ、三つのサクランボ……",
  Soi:      "生きるために働くのは面倒なことだ。",
  Tanozo:   "幸運のために働く呪い。",
  Foret:    "時として、何を選んでも後悔することになる。",
  Tanna:    "かつてミミミと一緒に隠れたことがある。彼女は死んでいた……",
  Peroth:   "罰か救済か——罪がすべてに及ぶなら、その選択に大した意味はない。",
  Henos:    "父親がペンをくれた。しかし彼は友人たちと過ごす時間の方が長い。",
  Miria:    "アバキの手を取ったとき、世界が開けた。",
  Ekuro:    "イミのために働きながら、ラミアのような常連客も持っている。",
  Filia:    "最初の鐘の音が災いを告げる。最後の鐘が鳴る頃には、もう手遅れだ。",
  Naiki:    "イミのために働き、仕事前に彼女の着付けをする。彼女の前で着物を踏まないように注意せよ。",
  Kaeka:    "恋愛の失敗を重ねすぎて、心が石になってしまった。",
  Miboro:   "隠れることが大好きで、自分の隠れ場所が見えなくても気にしない。",
  En:       "一つの呪いは一つの可能性。三つの呪いは三つの可能性。",
  Ponce:    "レンタル彼氏として働いていたが、ある日ある女性がサクランボの半分を分けてくれて、恋に落ちた。",
  Mega:     "たとえすべてが失われても、希望は必ずある。",
  Imi:      "幸運は心を変えることも、過去に戻ることもできない。",
  Etza:     "一つの敗北を認めることは、二つの勝利を受け入れることだ。",
  Gae:      "肩を少し押すだけで、客はお金を出す。",
  Iona:     "二つの現実が交わるとき、何でも可能になる。",
  Zao:      "弱くあるために、強いふりをする。",
  Humi:     "人気ランキングで上に行くためなら何でもする。たとえ他人のイメージを傷つけても。",
  Noira:    "家具を整えたり片付けたりできることは贅沢だ。ただし、Naikiの部屋は例外だが。",
  Kope:     "自分が幸せになれないなら、誰も幸せになるべきではない。",
  Menmei:   "目の前の真実を無視することは、無知でいたいということだ。",
  Nofi:     "運命がどう機能するかはわからない。でもEryと一緒なら、どこへでも行く。",
  Tenpoh:   "何をしたいかは、あなた自身が決めること。",
  Tei:      "人間は卑劣だ。自分の存在に気づかないまま、些細なことのために卑劣な行為をする。",
  Roloc:    "その色が汚されたとき、美しいと思っていたものへの憧れが消えた。",
  Reki:     "気に入った？私のお気に入りのシャツなんだ。私のこと、見えないでしょ？",
  Moira:    "すべての目標には犠牲が伴う。",
  Reiza:    "あなたが価値を置くものが、他のものより優れているわけではない。",
  Yuta:     "時間も夢のひとつ。こうして話せることも、夢だ。",
  Tis:      "ヌグのハリネズミ、本当にかわいい……",
  Usei:     "何か悪いことが起きるたびに、絶対Tisのせいだと確信している！",
  Nasu:     "本来割り当てられていなかった役割の中で死ぬ運命を背負った、取るに足らない命の救済。",
  Su:       "リアルであることで真実を探し求める。",
  Rasu:     "新しい場所を見るのが好きだけど、何かが足りない気がする……",
  Neutra:   "もう少しでカードコレクションが完成する。",
  Resta:    "何かの価値を否定するなら、他者が同じことをする覚悟ができているということだ。",
  Suma:     "あなたが幸せなら、私も幸せ。",
  Una:      "夢であっても、花は踏みにじらない。",
  // Tokens
  ErizoPeluche: "まさに……ぬいぐるみのハリネズミそのもの。",
  Ery:          "ノフィとエリーは運命で結ばれている。彼女の旅をここで終わらせるわけにはいかない。",
  Gatito:       "猫は箱の中にいる？音も視覚もなくても、ふさわしい者には愛情を注ぐ。",
};

function getCuriosidadText(cardName) {
  const lang = window.CURRENT_LANG || 'es';
  if (lang === 'en' && CURIOSIDADES_EN[cardName]) return CURIOSIDADES_EN[cardName];
  if (lang === 'ja' && CURIOSIDADES_JA[cardName]) return CURIOSIDADES_JA[cardName];
  return CURIOSIDADES[cardName] || '';
}

// ── Orden de desbloqueo de curiosidades por nivel ──
// Nivel 1 = índice 0, nivel 2 = índice 1, etc.
// Para cambiar el orden en el futuro, simplemente reordena los nombres aquí.
const CURIOSIDAD_ORDER = [
  'Nasu',          // nivel 1
  'Nugu',          // nivel 2
  'Ramia',         // nivel 3
  'Mega',          // nivel 4
  'Koly',          // nivel 5
  'Rasu',          // nivel 6
  'Hanoe',         // nivel 7
  'Faun',          // nivel 8
  'Abaki',         // nivel 9
  'Hobu',          // nivel 10
  'Yuta',          // nivel 11
  'Gena',          // nivel 12
  'Feruzu',        // nivel 13
  'Ekuro',         // nivel 14
  'Naiki',         // nivel 15
  'En',            // nivel 16
  'Tei',           // nivel 17
  'Ponce',         // nivel 18
  'Iona',          // nivel 19
  'Noira',         // nivel 20
  'ErizoPeluche',  // nivel 21
  'Fukou',         // nivel 22
  'Chiouri',       // nivel 23
  'Roloc',         // nivel 24
  'Reina',         // nivel 25
  'Ziru',          // nivel 26
  'Mugon',         // nivel 27
  'Su',            // nivel 28
  'Gran Demonio',  // nivel 29
  'Slau',          // nivel 30
  'Suma',          // nivel 31
  'Yukoi',         // nivel 32
  'Mimimi',        // nivel 33
  'Resta',         // nivel 34
  'Ery',           // nivel 35
  'Nofi',          // nivel 36
  'Menmei',        // nivel 37
  'Yiren',         // nivel 38
  'Usei',          // nivel 39
  'Tira',          // nivel 40
  'Tis',           // nivel 41
  'Demae',         // nivel 42
  'Kakomi',        // nivel 43
  'Soi',           // nivel 44
  'Tanozo',        // nivel 45
  'Gatito',        // nivel 46
  'Reiza',         // nivel 47
  'Foret',         // nivel 48
  'Tanna',         // nivel 49
  'Peroth',        // nivel 50
  'Tenpoh',        // nivel 51
  'Henos',         // nivel 52
  'Miria',         // nivel 53
  'Filia',         // nivel 54
  'Kaeka',         // nivel 55
  'Miboro',        // nivel 56
  'Imi',           // nivel 57
  'Etza',          // nivel 58
  'Gae',           // nivel 59
  'Zao',           // nivel 60
  'Humi',          // nivel 61
  'Kope',          // nivel 62
  'Neutra',        // nivel 63
  'Una',           // nivel 64
  'Moira',         // nivel 65
  'Reki',          // nivel 66
];

const PROFILE_KEY = 'rinadivina_player_profile';

// Titles the player can choose from — add more here in the future
const PLAYER_TITLES = [
  'Ignorante',
  'Alcanzaestrellas',
  'Costurero',
  'Tramposo',
  'Aspirante',
  'Desvelado',
  'Detective',
  'Cazahombres',
  'Implacable',
  'Ilustrador',
  'Modista',
  'Expectante',
  'Impaciente',
  'Precursor',
  'Pescador',
  'Diseñador',
  'Realidad',
  'Feriante',
  'Pollito',
  'Tsundere',
];

// Mapa: carta desbloqueada → título de hito que otorga al desbloquearse
// Sólo incluye cartas que tienen un rewardTitle definido en HITOS_DEF.
const CARD_UNLOCK_TITLES = {
  // ── Cartas desbloqueables: título = el que aparece en UNLOCK_CONDITIONS ──
  'Fukou':        'Amante de los peluches',
  'Reina':        'Ladronzuela',
  'Mugon':        'Salvación',
  'Ziru':         'Potra',
  'Yukoi':        'Optimista',
  'Mimimi':       'Exteriofobia',
  'Yiren':        'Secretaria',
  'Etza':         'Restos en las nubes',
  'Reki':         'Soñador',
  'Tira':         'Estratega',
  'Demae':        'Desastre',
  'Gran Demonio': 'Taxista',
  'Chiouri':      'Límites claros',
  'Slau':         'Justicia ciega',
  'Kakomi':       'Tres cerezas',
  'Tanozo':       'Infortunio',
  'Tanna':        'Bufón',
  'Peroth':       'El pecado',
  'Henos':        'Bromista',
  'Foret':        'Perversión',
  'Nofi':         'Junto a ti',
  'Menmei':       'Buscando la verdad',
  'Filia':        'El hueco',
  'Tis':          'Existencia',
  'Reiza':        'Nihilismo',
  'Resta':        'Aceptación',
  'Roloc':        'El color',
  'Usei':         'El destino',
  'Su':           'La verdad',
  'Neutra':       'Amante de las cartas',
  'Suma':         'El cariño',
  'Una':          'Espectador',
  'Miria':        'Espinas',
  'Kaeka':        'Coraje',
  'Miboro':       'A ciegas',
  'Imi':          'Suerte',
  'Gae':          'Estimulación',
  'Zao':          'La fuerza del débil',
  'Humi':         'Envidia',
  'Kope':         'Infelicidad',
  'Tenpoh':       'Ceguera',
  'Soi':          'Llama preventiva',
  'Moira':        'Desesperado',
  // ── Cartas base: título propio (no tienen condición de desbloqueo) ──
  'Nugu':         'Domador de erizos',
  'Koly':         'Escudo real',
  'Gena':         'Servicio perfecto',
  'Ramia':        'Acosador de gatos',
  'Hanoe':        'Admirador de las nubes',
  'Faun':         'Trasnochador',
  'Abaki':        'Investigador afortunado',
  'Hobu':         'Trabajo fácil',
  'Feruzu':       '1 vs. 1',
  'Ekuro':        'Artista incomprendido',
  'Naiki':        'Exigente en modales',
  'En':           'Optimista',
  'Ponce':        'Romeo y Julieta',
  'Mega':         'Santa esperanza',
  'Iona':         'Lobo solitario',
  'Noira':        'Decorador',
  'Tei':          'La existencia',
  'Yuta':         'El tiempo',
  'Nasu':         '¿El huevo o la gallina?',
  'Rasu':         'Déjà vu',
  'ErizoPeluche': 'Peluche',
  'Ery':          'Peluche de Autoridad',
  'Gatito':       'Inevitable',
};

// ── Title translations ────────────────────────────────────
const TITLE_TRANSLATIONS_EN = {
  'Ignorante':              'Ignorant',
  'Alcanzaestrellas':       'Star Reacher',
  'Costurero':              'Seamstress',
  'Tramposo':               'Cheater',
  'Aspirante':              'Aspirant',
  'Desvelado':              'Night Owl',
  'Detective':              'Detective',
  'Cazahombres':            'Manhunter',
  'Implacable':             'Relentless',
  'Ilustrador':             'Illustrator',
  'Modista':                'Modiste',
  'Expectante':             'Expectant',
  'Impaciente':             'Impatient',
  'Precursor':              'Precursor',
  'Pescador':               'Fisher',
  'Diseñador':              'Designer',
  'Realidad':               'Reality',
  'Feriante':               'Fairgoer',
  'Pollito':                'Chick',
  'Tsundere':               'Tsundere',
  // Hito / card unlock titles
  'Domador de erizos':      'Hedgehog Tamer',
  'Escudo real':            'Royal Shield',
  'Servicio perfecto':      'Perfect Service',
  'Acosador de gatos':      'Cat Stalker',
  'Legador de promesas':    'Promise Bearer',
  'Admirador de las nubes': 'Cloud Admirer',
  'Trasnochador':           'Night Owl',
  'Melodía sorda':          'Deaf Melody',
  'Investigador afortunado':'Lucky Investigator',
  'Primer paso':            'First Step',
  'Trabajo fácil':          'Easy Work',
  'Baile tradicional':      'Traditional Dance',
  'Estratega espía':        'Spy Strategist',
  'Chapuzas':               'Botched Job',
  '1 vs. 1':                '1 vs. 1',
  'Extripaalmas':           'Soul Ripper',
  'Pirómano del amor':      'Love Pyromaniac',
  'Mal de ojo':             'Evil Eye',
  'Perversión respetable':  'Respectable Perversion',
  'Caja de sorpresas':      'Surprise Box',
  'Dios de los pecados':    'God of Sins',
  'Niño interior':          'Inner Child',
  'Huésped de la desdicha': 'Guest of Misfortune',
  'Artista incomprendido':  'Misunderstood Artist',
  'Campanero gélido':       'Icy Bell Ringer',
  'Exigente en modales':    'Demanding Manners',
  'Corazón roto':           'Broken Heart',
  'Romeo y Julieta':        'Romeo and Juliet',
  'Lobo solitario':         'Lone Wolf',
  'Santa esperanza':        'Holy Hope',
  'Ídolo':                  'Idol',
  'Masajista cauto':        'Cautious Masseur',
  'Decorador':              'Decorator',
  'Adivino cegado':         'Blinded Fortune Teller',
  'Alborotador':            'Troublemaker',
  'Espía codiciosa':        'Greedy Spy',
  'Flor de un día':         'One-Day Flower',
  'Buscador de la felicidad':'Happiness Seeker',
  'Gato curioso':           'Curious Cat',
  'Ambientalista':          'Environmentalist',
  'Miope':                  'Short-Sighted',
  'Amante de los peluches': 'Plush Lover',
  'Ladronzuela':            'Pickpocket',
  'Salvación':              'Salvation',
  'Potra':                  'Clever Girl',
  'Optimista':              'Optimist',
  'Exteriofobia':           'Agoraphobia',
  'Secretaria':             'Secretary',
  'Restos en las nubes':    'Remnants in the Clouds',
  'Soñador':                'Dreamer',
  'Estratega':              'Strategist',
  'Desastre':               'Disaster',
  'Taxista':                'Taxi Driver',
  'Límites claros':         'Clear Limits',
  'Justicia ciega':         'Blind Justice',
  'Tres cerezas':           'Three Cherries',
  'Infortunio':             'Misfortune',
  'Bufón':                  'Jester',
  'El pecado':              'The Sin',
  'Bromista':               'Prankster',
  'Perversión':             'Perversion',
  'Junto a ti':             'By Your Side',
  'Buscando la verdad':     'Seeking the Truth',
  'El hueco':               'The Slot',
  'Existencia':             'Existence',
  'Nihilismo':              'Nihilism',
  'Aceptación':             'Acceptance',
  'El color':               'The Color',
  'El destino':             'The Destiny',
  'La verdad':              'The Truth',
  'Amante de las cartas':   'Card Lover',
  'El cariño':              'Affection',
  'Espectador':             'Spectator',
  'Espinas':                'Thorns',
  'Coraje':                 'Courage',
  'A ciegas':               'Blindfolded',
  'Suerte':                 'Luck',
  'Estimulación':           'Stimulation',
  'La fuerza del débil':    'Strength of the Weak',
  'Envidia':                'Envy',
  'Infelicidad':            'Unhappiness',
  'Ceguera':                'Blindness',
  'Llama preventiva':       'Preventive Flame',
  'Desesperado':            'Desperate',
  'La existencia':          'The Existence',
  'El tiempo':              'Time',
  '¿El huevo o la gallina?':'Chicken or Egg?',
  'Déjà vu':                'Déjà Vu',
  'Peluche':                'Plushie',
  'Peluche de Autoridad':   'Authoritative Plushie',
  'Inevitable':             'Inevitable',
  'Suerte y destino':       'Luck and Destiny',
  'Astucia furtiva':        'Stealthy Cunning',
  'Pastor mentiroso':       'Lying Shepherd',
  'Amor a primera vista':   'Love at First Sight',
  'El taxista más poderoso':'The Most Powerful Taxi Driver',
  'Jugada invisible':       'Invisible Move',
};

const TITLE_TRANSLATIONS_JA = {
  'Ignorante':              '無知者',
  'Alcanzaestrellas':       '星つかみ',
  'Costurero':              '仕立て師',
  'Tramposo':               'チート師',
  'Aspirante':              '志望者',
  'Desvelado':              '夜更かし',
  'Detective':              '探偵',
  'Cazahombres':            '人間狩り',
  'Implacable':             '容赦なし',
  'Ilustrador':             'イラストレーター',
  'Modista':                'ファッションデザイナー',
  'Expectante':             '期待者',
  'Impaciente':             '短気者',
  'Precursor':              '先駆者',
  'Pescador':               '漁師',
  'Diseñador':              'デザイナー',
  'Realidad':               '現実',
  'Feriante':               '市場人',
  'Pollito':                'ヒヨコ',
  'Tsundere':               'ツンデレ',
  'Domador de erizos':      'ハリネズミ使い',
  'Escudo real':            '王の盾',
  'Servicio perfecto':      '完璧な奉仕',
  'Acosador de gatos':      '猫ストーカー',
  'Legador de promesas':    '約束の遺産',
  'Admirador de las nubes': '雲の崇拝者',
  'Trasnochador':           '夜更かし',
  'Melodía sorda':          '聞こえぬ旋律',
  'Investigador afortunado':'幸運な調査者',
  'Primer paso':            '第一歩',
  'Trabajo fácil':          '楽な仕事',
  'Baile tradicional':      '伝統の舞',
  'Estratega espía':        'スパイ戦略家',
  'Chapuzas':               'ちぐはぐ',
  '1 vs. 1':                '1対1',
  'Extripaalmas':           '魂引き裂き',
  'Pirómano del amor':      '愛の放火魔',
  'Mal de ojo':             '邪視',
  'Perversión respetable':  '立派な倒錯',
  'Caja de sorpresas':      'びっくり箱',
  'Dios de los pecados':    '罪の神',
  'Niño interior':          '内なる子',
  'Huésped de la desdicha': '不幸の客人',
  'Artista incomprendido':  '誤解された芸術家',
  'Campanero gélido':       '氷の鐘撞き',
  'Exigente en modales':    '礼儀の厳格者',
  'Corazón roto':           '傷ついた心',
  'Romeo y Julieta':        'ロミオとジュリエット',
  'Lobo solitario':         '孤高の狼',
  'Santa esperanza':        '聖なる希望',
  'Ídolo':                  'アイドル',
  'Masajista cauto':        '慎重なマッサージ師',
  'Decorador':              'デコレーター',
  'Adivino cegado':         '盲目の予言者',
  'Alborotador':            '騒ぎ屋',
  'Espía codiciosa':        '欲深いスパイ',
  'Flor de un día':         '一日花',
  'Buscador de la felicidad':'幸福の探求者',
  'Gato curioso':           '好奇心旺盛な猫',
  'Ambientalista':          '環境保護主義者',
  'Miope':                  '近視眼的',
  'Amante de los peluches': 'ぬいぐるみ好き',
  'Ladronzuela':            'すり師',
  'Salvación':              '救済',
  'Potra':                  '賢い子',
  'Optimista':              '楽観主義者',
  'Exteriofobia':           '広場恐怖症',
  'Secretaria':             '秘書',
  'Restos en las nubes':    '雲の残骸',
  'Soñador':                '夢想家',
  'Estratega':              '戦略家',
  'Desastre':               '災難',
  'Taxista':                'タクシー運転手',
  'Límites claros':         '明確な限界',
  'Justicia ciega':         '盲目の正義',
  'Tres cerezas':           '三つのさくらんぼ',
  'Infortunio':             '不運',
  'Bufón':                  '道化師',
  'El pecado':              '罪',
  'Bromista':               'いたずら者',
  'Perversión':             '倒錯',
  'Junto a ti':             '君のそばに',
  'Buscando la verdad':     '真実を求めて',
  'El hueco':               '空きスロット',
  'Existencia':             '存在',
  'Nihilismo':              'ニヒリズム',
  'Aceptación':             '受容',
  'El color':               '色',
  'El destino':             '運命',
  'La verdad':              '真実',
  'Amante de las cartas':   'カード好き',
  'El cariño':              '愛情',
  'Espectador':             '観客',
  'Espinas':                '棘',
  'Coraje':                 '勇気',
  'A ciegas':               '目隠し',
  'Suerte':                 '幸運',
  'Estimulación':           '刺激',
  'La fuerza del débil':    '弱者の力',
  'Envidia':                '嫉妬',
  'Infelicidad':            '不幸',
  'Ceguera':                '盲目',
  'Llama preventiva':       '予防の炎',
  'Desesperado':            '絶望的',
  'La existencia':          '存在',
  'El tiempo':              '時間',
  '¿El huevo o la gallina?':'どっちが先？',
  'Déjà vu':                'デジャブ',
  'Peluche':                'ぬいぐるみ',
  'Peluche de Autoridad':   '権威あるぬいぐるみ',
  'Inevitable':             '必然',
  'Suerte y destino':       '幸運と運命',
  'Astucia furtiva':        '陰険な狡猾さ',
  'Pastor mentiroso':       '嘘つき羊飼い',
  'Amor a primera vista':   '一目惚れ',
  'El taxista más poderoso':'最強のタクシー運転手',
  'Jugada invisible':       '見えない一手',
};

/** Returns the display text for a title in the current language. */
function getTranslatedTitle(esTitle) {
  if (!esTitle) return esTitle;
  const lang = window.CURRENT_LANG || 'es';
  if (lang === 'en') return TITLE_TRANSLATIONS_EN[esTitle] || esTitle;
  if (lang === 'ja') return TITLE_TRANSLATIONS_JA[esTitle] || esTitle;
  return esTitle;
}

function getDefaultProfile() {
  return {
    name: 'Jugador',
    title: 'Ignorante',
    avatarCard: null,    // card name used as avatar
    wins: 0,
    draws: 0,
    losses: 0,
    streakW: 0,
    streakD: 0,
    streakL: 0,
    maxStreakW: 0,
    maxStreakD: 0,
    maxStreakL: 0,
    realAppearances: 0,
    cardWins: {},
    userLevel: 0,
    xpSegments: 0,   // 0–3.5 in 0.5 steps; 4 = level up
  };
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (!saved) return getDefaultProfile();
    return Object.assign(getDefaultProfile(), saved);
  } catch { return getDefaultProfile(); }
}

function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

// Called at end of every game. resultado: 'win' | 'draw' | 'loss'
function actualizarEstadisticas(resultado, playerCards) {
  const profile = loadProfile();

  if (resultado === 'win') {
    profile.wins++;
    profile.streakW++;
    profile.streakD = 0;
    profile.streakL = 0;
    if (profile.streakW > profile.maxStreakW) profile.maxStreakW = profile.streakW;
  } else if (resultado === 'draw') {
    profile.draws++;
    profile.streakD++;
    profile.streakW = 0;
    profile.streakL = 0;
    if (profile.streakD > profile.maxStreakD) profile.maxStreakD = profile.streakD;
  } else {
    profile.losses++;
    profile.streakL++;
    profile.streakW = 0;
    profile.streakD = 0;
    if (profile.streakL > profile.maxStreakL) profile.maxStreakL = profile.streakL;
  }

  // ── XP / Level system ──
  const gain = (resultado === 'win') ? 2 : 1;
  profile.xpSegments = (profile.xpSegments || 0) + gain;
  let levelsGained = 0;
  while (profile.xpSegments >= 4) {
    profile.xpSegments -= 4;
    profile.userLevel++;
    levelsGained++;
  }
  profile._levelsGainedThisGame = levelsGained;

  // Sync Real appearances with existing counter
  try {
    profile.realAppearances = parseInt(localStorage.getItem('juego_cartas_usei_real_count') || '0');
  } catch {}

  // Track card appearances
  if (playerCards && playerCards.length) {
    if (!profile.cardPlays) profile.cardPlays = {};
    playerCards.forEach(name => {
      if (!name) return;
      profile.cardPlays[name] = (profile.cardPlays[name] || 0) + 1;
    });
    if (resultado === 'win') {
      playerCards.forEach(name => {
        if (!name) return;
        profile.cardWins[name] = (profile.cardWins[name] || 0) + 1;
      });
    }
  }

  saveProfile(profile);

  // Hitos hook
  setTimeout(() => { if (typeof _hitoHookEndGame === "function") _hitoHookEndGame(); }, 0);
}

function getPlayerHandAndBoardCards() {
  const names = [];
  if (G && G.spaces) {
    G.spaces.forEach(sp => {
      (sp.slots[0] || []).forEach(c => { if (c && c.name) names.push(c.name); });
    });
  }
  if (G && G.hands && G.hands[0]) {
    G.hands[0].forEach(c => { if (c && c.name) names.push(c.name); });
  }
  return names;
}

// ── Profile UI ──
let _profileNameEditing = false;

function showPlayerProfile() {
  playSound('uiClick');
  const profile = loadProfile();
  renderProfileData(profile);
  const overlay = document.getElementById('profile-overlay');
  overlay.classList.remove('open');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
  overlay.onclick = function(e) { if (e.target === overlay) closePlayerProfile(); };
}

function closePlayerProfile() {
  playSound('uiClick');
  const overlay = document.getElementById('profile-overlay');
  overlay.classList.remove('open');
  setTimeout(() => { overlay.style.display = 'none'; }, 220);
  _profileNameEditing = false;
  document.getElementById('profile-name-display').style.display = '';
  document.getElementById('profile-name-edit-btn').style.display = '';
  document.getElementById('profile-name-input').style.display = 'none';
}

function renderProfileData(profile) {
  // Avatar
  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarPH  = document.getElementById('profile-avatar-placeholder');
  if (profile.avatarCard) {
    avatarImg.src = `./ilustraciones/${profile.avatarCard}.jpg`;
    avatarImg.style.objectPosition = CB_THUMB_OFFSET.get(profile.avatarCard) || 'top';
    avatarImg.style.display = '';
    avatarPH.style.display = 'none';
  } else {
    // Default avatar: Abaki
    avatarImg.src = './ilustraciones/Abaki.jpg';
    avatarImg.style.objectPosition = CB_THUMB_OFFSET.get('Abaki') || 'top';
    avatarImg.style.display = '';
    avatarPH.style.display = 'none';
  }

  // Name & title
  document.getElementById('profile-name-display').textContent = profile.name || t('profile_player');
  document.getElementById('profile-title-badge').textContent  = getTranslatedTitle(profile.title || 'Ignorante');

  // Level & XP
  const userLevel = profile.userLevel || 0;
  const xpSeg = profile.xpSegments || 0;
  document.getElementById('profile-xp-label').textContent = `${t('level_xp_label')} ${userLevel} —`;
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`pxp-${i}`);
    if (!el) continue;
    el.className = 'profile-xp-seg';
    const threshold = i + 1;
    if (xpSeg >= threshold) el.classList.add('filled');
    else if (xpSeg >= i + 0.5) el.classList.add('half');
  }

  // Stats
  const total = profile.wins + profile.draws + profile.losses;
  const winrate = total > 0 ? Math.round((profile.wins / total) * 100) + '%' : '—';
  document.getElementById('ps-wins').textContent    = profile.wins;
  document.getElementById('ps-draws').textContent   = profile.draws;
  document.getElementById('ps-losses').textContent  = profile.losses;
  document.getElementById('ps-winrate').textContent = winrate;
  document.getElementById('ps-streak-w').textContent = profile.maxStreakW;
  document.getElementById('ps-streak-d').textContent = profile.maxStreakD;
  document.getElementById('ps-streak-l').textContent = profile.maxStreakL;
  document.getElementById('ps-real').textContent    = profile.realAppearances;

  // Collection
  const totalCards  = Object.keys(CARD_DB).length;
  const unlocked    = [...UNLOCKED_CARDS].filter(n => CARD_DB[n]).length;
  const pct         = totalCards > 0 ? Math.round((unlocked / totalCards) * 100) : 0;
  document.getElementById('profile-collection-text').textContent = `${unlocked} / ${totalCards}`;
  setTimeout(() => {
    document.getElementById('profile-collection-fill').style.width = pct + '%';
  }, 60);

  // Signature card
  const cardWins = profile.cardWins || {};
  const sigCard  = Object.entries(cardWins).sort((a,b) => b[1]-a[1])[0];
  if (sigCard && sigCard[1] > 0) {
    const [name, count] = sigCard;
    const sigImg = document.getElementById('profile-sig-img');
    sigImg.src = `./ilustraciones/${name}.jpg`;
    sigImg.style.objectPosition = CB_THUMB_OFFSET.get(name) || 'top';
    sigImg.style.display = '';
    document.getElementById('profile-sig-fallback').style.display = 'none';
    document.getElementById('profile-sig-name').textContent  = getCardDisplay(name).displayName || name;
    const db = CARD_DB[name];
    document.getElementById('profile-sig-desc').textContent  = getCardDisplay(name).effect || (db ? db.effect : '');
    document.getElementById('profile-sig-count').textContent = count === 1 ? t('sig_count_single') : t('sig_count_plural').replace('{n}', count);
  } else {
    document.getElementById('profile-sig-img').style.display = 'none';
    document.getElementById('profile-sig-fallback').style.display = 'flex';
    document.getElementById('profile-sig-name').textContent  = '—';
    document.getElementById('profile-sig-desc').textContent  = t('profile_sig_desc');
    document.getElementById('profile-sig-count').textContent = '';
  }
  // Últimas partidas
  renderGameHistory();
}

// ══════════════════════════════════════════════════════════
//  HISTORIAL DE PARTIDAS
// ══════════════════════════════════════════════════════════
const GAME_HISTORY_KEY = 'rinadivina_game_history';
const GAME_HISTORY_MAX = 20;

function loadGameHistory() {
  try { return JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveGameHistory(list) {
  try { localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(list)); } catch {}
}

// Llamar al final de una partida para registrarla
function saveGameRecord(winner, spaceResults, turns, deckNameP0) {
  try {
    const record = {
      id: Date.now().toString(36),
      ts: Date.now(),
      outcome: winner === 0 ? 'win' : winner === 1 ? 'loss' : 'draw',
      mode: deckNameP0 ? `${t('pgame_deck_prefix')} ${deckNameP0}` : t('pgame_quick'),
      deckName: deckNameP0 || null,
      deckCards: G._deckCardsP0 || null,
      spaces: (G.spaces || []).map(sp => sp.effectText || ''),
      turns: turns.map(t => ({
        t:     t.turn,
        pc:    t.playerCard,    // nombre carta jugador
        psp:   t.playerSpace,   // espacio (0-2)
        ac:    t.aiCard,        // nombre carta IA
        asp:   t.aiSpace,       // espacio (0-2)
        res:   t.spaceResults,  // [ganador E1, E2, E3] — 0=jugador,1=IA,-1=empate
        first: t.first,         // quién reveló primero (0=jugador,1=IA)
        board: t.board || null, // snapshot del tablero
      })),
      spaceWinners: spaceResults.map(r => r.winner), // resultado final de cada espacio
    };
    const history = loadGameHistory();
    history.unshift(record);
    if (history.length > GAME_HISTORY_MAX) history.length = GAME_HISTORY_MAX;
    saveGameHistory(history);
  } catch(e) { console.warn('Error guardando historial:', e); }
}

function formatGameDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  const hhmm = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  if (diffDays === 0) {
    return `${t('date_today')}, ${hhmm}`;
  } else if (diffDays === 1) {
    return `${t('date_yesterday')}, ${hhmm}`;
  } else if (diffDays < 7) {
    const days = t('date_days').split(',');
    return `${days[d.getDay()]}, ${hhmm}`;
  } else {
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  }
}

let _pgameFilter = 'all';

function renderGameHistory() {
  const list = document.getElementById('profile-games-list');
  if (!list) return;
  const history = loadGameHistory();
  closeReplayPanel();
  // Actualizar título con contador
  const lbl = document.getElementById('profile-games-label');
  if (lbl) {
    const n = history.length;
    lbl.textContent = n > 0 ? `${t('profile_games').replace(/^— |— $/g,'')} (${n}) —`.replace(/^/,'— ') : t('profile_games');
  }
  // Filtros
  const filterRow = document.getElementById('pgame-filter-row');
  if (filterRow && history.length > 0) {
    filterRow.innerHTML = '';
    const filters = [
      { key: 'all',  label: t('pgame_all'),    cls: '' },
      { key: 'win',  label: t('pgame_wins'),   cls: 'f-win' },
      { key: 'loss', label: t('pgame_losses'), cls: 'f-loss' },
      { key: 'draw', label: t('pgame_draws'),  cls: 'f-draw' },
    ];
    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'pgame-filter-btn' + (f.cls ? ' ' + f.cls : '') + (_pgameFilter === f.key ? ' active' : '');
      btn.textContent = f.label;
      btn.onclick = () => { _pgameFilter = f.key; renderGameHistory(); };
      filterRow.appendChild(btn);
    });
  } else if (filterRow) {
    filterRow.innerHTML = '';
  }
  const filtered = history.filter(r => _pgameFilter === 'all' || r.outcome === _pgameFilter);
  if (history.length === 0) {
    list.innerHTML = '<div class="pgame-empty">' + t('profile_no_games') + '</div>';
    return;
  }
  if (filtered.length === 0) {
    list.innerHTML = '<div class="pgame-empty">' + t('profile_no_filtered') + '</div>';
    return;
  }
  list.innerHTML = '';
  filtered.forEach(rec => {
    const row = document.createElement('div');
    row.className = 'pgame-row';
    row.onclick = () => { playSound('uiClick'); openReplayPanel(rec); };

    const outcomeLabel = rec.outcome === 'win' ? t('result_victory').replace('!','') : rec.outcome === 'loss' ? t('result_defeat') : t('result_draw');
    const spaceHTML = (rec.spaceWinners || []).map((w, i) => {
      const cls = w === 0 ? 'w' : w === 1 ? 'l' : 'd';
      const lbl = w === 0 ? '✓' : w === 1 ? '✕' : '—';
      return `<span class="pgame-sp ${cls}" title="${t('modal_space')} ${i+1}">${lbl}</span>`;
    }).join('');

    row.innerHTML = `
      <div class="pgame-result ${rec.outcome}"></div>
      <div class="pgame-info">
        <div class="pgame-top">
          <span class="pgame-outcome ${rec.outcome}">${outcomeLabel}</span>
          <span class="pgame-mode">${rec.mode}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:3px;">
          <div class="pgame-spaces">${spaceHTML}</div>
          <span class="pgame-date">${formatGameDate(rec.ts)}</span>
        </div>
      </div>
      <div class="pgame-btn">${t('pgame_view')}</div>
    `;
    list.appendChild(row);
  });
}

function openReplayPanel(rec) {
  const gamesList = document.getElementById('profile-games-section');
  const replayPanel = document.getElementById('profile-replay-panel');
  if (!replayPanel) return;

  // Ocultar solo la lista de partidas (no el título de la sección)
  const gamesList2 = document.getElementById('profile-games-list');
  if (gamesList2) gamesList2.style.display = 'none';
  replayPanel.classList.add('open');

  // Header
  const outcomeLabel = rec.outcome === 'win' ? t('result_victory').replace('!','') : rec.outcome === 'loss' ? t('result_defeat') : t('result_draw');
  const badge = document.getElementById('replay-outcome-badge');
  badge.textContent = outcomeLabel;
  badge.className = `${rec.outcome}`;
  badge.id = 'replay-outcome-badge'; // preserve id

  document.getElementById('replay-title').textContent =
    `${rec.mode} · ${formatGameDate(rec.ts)}`;

  // Botón copiar mazo — solo si hay datos de mazo
  const existingBtn = document.getElementById('replay-copy-deck-btn');
  if (existingBtn) existingBtn.remove();
  if (rec.deckCards && rec.deckCards.length && rec.deckName) {
    const copyBtn = document.createElement('button');
    copyBtn.id = 'replay-copy-deck-btn';
    copyBtn.textContent = t('pgame_copy_deck');
    copyBtn.onclick = () => copiarMazoDesdeHistorial(rec.deckName, rec.deckCards);
    document.getElementById('replay-header').appendChild(copyBtn);
  }

  // Efectos de espacios
  const spacesRow = document.getElementById('replay-spaces-row');
  spacesRow.innerHTML = (rec.spaces || []).map((ef, i) =>
    `<span class="replay-space-effect">${t('replay_space_label')}${i+1}: ${getSpaceEffectText(ef) || (t('modal_no_effect'))}</span>`
  ).join('');

  // Tablero miniatura navegable
  _replayTurns = rec.turns || [];
  _replayCurrentTurn = 0;
  if (_replayTurns.length > 0) {
    renderReplayBoard(0);
  } else {
    const nav = document.getElementById('replay-board-nav');
    if (nav) nav.innerHTML = '<div class="pgame-empty">' + t('profile_no_board') + '</div>';
  }
}

function copiarMazoDesdeHistorial(deckName, deckCards) {
  try {
    if (!deckCards || !deckCards.length) return;
    const profile = loadProfile();
    // Generar nombre único: si ya existe, añadir (2), (3)...
    let baseName = deckName || 'Mazo copiado';
    let finalName = baseName;
    let n = 2;
    while (CB_DECKS.some(d => d.name === finalName)) {
      finalName = `${baseName} (${n++})`;
    }
    const newDeck = { name: finalName, cards: deckCards };
    CB_DECKS.push(newDeck);
    saveProfile(Object.assign(loadProfile(), {})); // trigger any needed saves
    // Guardar mazos via la misma clave que usa el juego
    try { localStorage.setItem('juego_cartas_decks', JSON.stringify(CB_DECKS)); } catch {}
    // Feedback visual: cambiar texto del botón brevemente
    const btn = document.getElementById('replay-copy-deck-btn');
    if (btn) {
      btn.textContent = `${t('pgame_copy_done')} "${finalName}"`;
      btn.disabled = true;
      setTimeout(() => { btn.textContent = t('pgame_copy_deck'); btn.disabled = false; }, 2200);
    }
  } catch(e) { console.warn('Error copiando mazo:', e); }
}


// ══════════════════════════════════════════════════════════
//  REPLAY TABLERO MINIATURA
// ══════════════════════════════════════════════════════════
let _replayCurrentTurn = 0;
let _replayTurns = [];

function buildMiniSlot(card) {
  const el = document.createElement('div');
  el.className = 'replay-mini-slot';

  if (!card) return el;

  el.classList.add('has-card');
  // Tooltip con nombre y efecto
  if (!card.fd) {
    const tip = document.createElement('div');
    tip.className = 'rms-tooltip';
    const tipName = document.createElement('div');
    tipName.className = 'rms-tooltip-name';
    const _cardN = card.img || card.n;
    tipName.textContent = getCardDisplay(_cardN).displayName || card.n;
    tip.appendChild(tipName);
    const cardData = CARD_DB && CARD_DB[_cardN];
    if (cardData && cardData.effect) {
      const tipEff = document.createElement('div');
      tipEff.className = 'rms-tooltip-effect';
      tipEff.textContent = getCardDisplay(_cardN).effect || cardData.effect;
      tip.appendChild(tipEff);
    }
    const totalVal = (card.v || 0) + (card.b || 0);
    const tipVal = document.createElement('div');
    tipVal.className = 'rms-tooltip-val';
    tipVal.textContent = `${window.CURRENT_LANG==='en'?'Value':window.CURRENT_LANG==='ja'?'値':'Valor'}: ${totalVal}${card.b ? ' ('+( card.b > 0 ? '+'+card.b : card.b )+' bonus)' : ''}`;
    tip.appendChild(tipVal);
    el.appendChild(tip);
  }
  if (card.fd) {
    el.classList.add('face-down');
    const icon = document.createElement('div');
    icon.className = 'rms-fd-icon';
    icon.textContent = '?';
    el.appendChild(icon);
  } else {
    el.classList.add(card.v === 0 ? 'v0' : 'v1');
    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:3px;';
    const img = document.createElement('img');
    img.src = `./ilustraciones/${card.img || card.n}.jpg`;
    img.alt = card.n;
    img.draggable = false;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block;opacity:0.92;';
    img.onerror = function() { this.style.display='none'; };
    imgWrap.appendChild(img);
    el.appendChild(imgWrap);

    const nm = document.createElement('div');
    nm.className = 'rms-name';
    nm.textContent = card.n;
    el.appendChild(nm);

    if (card.b && card.b !== 0) {
      const bon = document.createElement('div');
      bon.className = 'rms-bonus';
      bon.textContent = card.b > 0 ? `+${card.b}` : card.b;
      bon.style.color = card.b > 0 ? 'var(--blue,#6ab0f5)' : 'var(--red,#e06c6c)';
      el.appendChild(bon);
    }
  }
  return el;
}

function renderReplayBoard(turnIdx) {
  const container = document.getElementById('replay-board-nav');
  if (!container || !_replayTurns.length) return;
  container.innerHTML = '';

  const turnData = _replayTurns[turnIdx];
  const board = turnData.board;

  // ── Fila: navegador ──
  const navRow = document.createElement('div');
  navRow.className = 'replay-nav-row';

  const btnPrev = document.createElement('button');
  btnPrev.className = 'replay-nav-btn';
  btnPrev.textContent = '←';
  btnPrev.disabled = turnIdx === 0;
  btnPrev.onclick = () => { playSound('uiClick'); _replayCurrentTurn--; renderReplayBoard(_replayCurrentTurn); };

  const indicator = document.createElement('div');
  indicator.className = 'replay-turn-indicator';
  indicator.textContent = `${t('replay_turn_of')} ${turnData.t} ${t('replay_of')} ${_replayTurns.length}`;

  const btnNext = document.createElement('button');
  btnNext.className = 'replay-nav-btn';
  btnNext.textContent = '→';
  btnNext.disabled = turnIdx === _replayTurns.length - 1;
  btnNext.onclick = () => { playSound('uiClick'); _replayCurrentTurn++; renderReplayBoard(_replayCurrentTurn); };

  navRow.appendChild(btnPrev);
  navRow.appendChild(indicator);
  navRow.appendChild(btnNext);
  container.appendChild(navRow);

  // ── Quién reveló primero ──
  const whoFirst = document.createElement('div');
  whoFirst.className = 'replay-who-first';
  const fc = turnData.first === 0 ? 'var(--blue,#6ab0f5)' : 'var(--red,#e06c6c)';
  whoFirst.innerHTML = `<span style="color:${fc}">◆</span> ${turnData.first === 0 ? t('replay_you_first') : t('replay_ai_first')}`;
  container.appendChild(whoFirst);

  // ── Tablero miniatura ──
  const miniBoard = document.createElement('div');
  miniBoard.className = 'replay-mini-board';

  for (let sp = 0; sp < 3; sp++) {
    const spData = board ? board[sp] : null;
    const res = turnData.res ? turnData.res[sp] : -1;

    const spEl = document.createElement('div');
    spEl.className = 'replay-mini-space' +
      (res === 0 ? ' sp-win-player' : res === 1 ? ' sp-win-ai' : ' sp-win-draw');

    const spLabel = document.createElement('div');
    spLabel.className = 'replay-mini-space-label';
    spLabel.textContent = `${t('replay_space_label')}${sp + 1}`;
    spEl.appendChild(spLabel);
    const spEffect = spData && spData.effect ? spData.effect : null;
    if (spEffect) {
      const effEl = document.createElement('div');
      effEl.className = 'replay-mini-space-effect';
      effEl.textContent = getSpaceEffectText(spEffect);
      effEl.title = getSpaceEffectText(spEffect);
      spEl.appendChild(effEl);
    }

    // IA arriba (side 1), jugador abajo (side 0)
    for (const [side, sideLabel] of [[1, 'IA'], [0, t('replay_you')]]) {
      const sideEl = document.createElement('div');
      sideEl.className = 'replay-mini-side';

      const sideLbl = document.createElement('div');
      sideLbl.className = 'replay-mini-side-label';
      sideLbl.textContent = sideLabel;
      sideEl.appendChild(sideLbl);

      const slots = document.createElement('div');
      slots.className = 'replay-mini-slots';
      slots.style.cssText = 'display:flex;flex-direction:row;gap:2px;justify-content:center;overflow:visible;position:relative;';

      const sideCards = spData ? (spData.slots ? spData.slots[side] : spData[side]) : [null, null, null];
      for (let sl = 0; sl < 3; sl++) {
        const slotEl = buildMiniSlot(sideCards[sl] || null);
        slotEl.style.width = 'clamp(22px, 5vw, 38px)';
        slots.appendChild(slotEl);
      }
      sideEl.appendChild(slots);
      spEl.appendChild(sideEl);

      if (side === 1) {
        const div = document.createElement('div');
        div.className = 'replay-mini-divider';
        spEl.appendChild(div);
      }
    }

    miniBoard.appendChild(spEl);
  }
  container.appendChild(miniBoard);

  // ── Resultado de espacios ──
  const resRow = document.createElement('div');
  resRow.className = 'replay-result-row';
  (turnData.res || []).forEach((w, i) => {
    const badge = document.createElement('span');
    const cls = w === 0 ? 'w' : w === 1 ? 'l' : 'd';
    const lbl = w === 0 ? `${t('replay_space_label')}${i+1} ✓` : w === 1 ? `${t('replay_space_label')}${i+1} ✕` : `${t('replay_space_label')}${i+1} —`;
    badge.className = `replay-mini-result ${cls}`;
    badge.textContent = lbl;
    resRow.appendChild(badge);
  });
  container.appendChild(resRow);
}


// ══════════════════════════════════════════════════════════
//  ESTADÍSTICAS POR CARTA
// ══════════════════════════════════════════════════════════
let _cardStatsSort = 'plays'; // 'plays' | 'wins' | 'wr'
let _cardStatsOpen = false;

function toggleCardStats() {
  _cardStatsOpen = !_cardStatsOpen;
  const section = document.getElementById('profile-card-stats-section');
  if (section) section.classList.toggle('open', _cardStatsOpen);
  const btn = document.getElementById('cs-toggle-btn');
  if (btn) {
    btn.textContent = _cardStatsOpen ? t('cs_hide') : t('cs_show');
    btn.style.borderColor = _cardStatsOpen ? 'rgba(68,119,204,0.4)' : 'rgba(255,255,255,0.12)';
    btn.style.color = _cardStatsOpen ? 'rgba(100,176,245,0.9)' : 'var(--text-dim)';
    btn.style.background = _cardStatsOpen ? 'rgba(68,119,204,0.07)' : 'none';
  }
  if (_cardStatsOpen) renderCardStats();
}

function renderCardStats() {
  const listEl = document.getElementById('card-stats-list');
  if (!listEl) return;

  const profile = loadProfile();
  const plays = profile.cardPlays || {};
  const wins  = profile.cardWins  || {};

  // Unir todas las cartas que aparecen en plays o wins
  const allNames = [...new Set([...Object.keys(plays), ...Object.keys(wins)])];
  if (!allNames.length) {
    listEl.innerHTML = '<div class="pgame-empty">' + t('profile_no_card_stats') + '</div>';
    return;
  }

  const rows = allNames.map(name => ({
    name,
    plays: plays[name] || 0,
    wins:  wins[name]  || 0,
    wr:    plays[name] ? Math.round((wins[name] || 0) / plays[name] * 100) : 0,
  }));

  // Ordenar según criterio
  rows.sort((a, b) => b[_cardStatsSort] - a[_cardStatsSort] || b.plays - a.plays);

  const maxPlays = Math.max(...rows.map(r => r.plays), 1);

  // Botones de orden
  const sortRow = document.getElementById('cs-sort-row');
  if (sortRow) {
    sortRow.innerHTML = '';
    [
      { key: 'plays', label: t('cs_most_played') },
      { key: 'wins',  label: t('cs_most_wins') },
      { key: 'wr',    label: t('cs_best_pct') },
    ].forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'cs-sort-btn' + (_cardStatsSort === s.key ? ' active' : '');
      btn.textContent = s.label;
      btn.onclick = () => { _cardStatsSort = s.key; renderCardStats(); };
      sortRow.appendChild(btn);
    });
  }

  // Limpiar filas anteriores (mantener sortRow)
  [...listEl.children].forEach(el => { if (el.id !== 'cs-sort-row') el.remove(); });

  rows.slice(0, 25).forEach((r, i) => {
    const displayName = (CARD_DB[r.name] && typeof CARD_DB[r.name] === 'object')
      ? (r.name === 'ErizoPeluche' ? 'Erizo de Peluche Blanco' : (r.name === 'Gatito' ? 'Gatito' : r.name))
      : r.name;
    const DISPLAY_NAMES_LOCAL = { ErizoPeluche: 'Erizo de Peluche Blanco', Gatito: 'Gatito' };
    const dn = DISPLAY_NAMES_LOCAL[r.name] || r.name;

    const row = document.createElement('div');
    row.className = 'cs-row';

    const rank = document.createElement('div');
    rank.className = 'cs-rank';
    rank.textContent = i + 1;

    const thumb = document.createElement('div');
    thumb.className = 'cs-thumb';
    const img = document.createElement('img');
    img.src = `./ilustraciones/${r.name}.jpg`;
    img.alt = dn;
    img.onerror = function() { this.style.display = 'none'; };
    thumb.appendChild(img);

    const info = document.createElement('div');
    info.className = 'cs-info';

    const name = document.createElement('div');
    name.className = 'cs-name';
    name.textContent = dn;

    const barWrap = document.createElement('div');
    barWrap.className = 'cs-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'cs-bar';
    // barra basada en el criterio activo
    const pct = _cardStatsSort === 'wr'
      ? r.wr
      : _cardStatsSort === 'wins'
        ? Math.round(r.wins / Math.max(...rows.map(x => x.wins), 1) * 100)
        : Math.round(r.plays / maxPlays * 100);
    bar.style.width = pct + '%';
    barWrap.appendChild(bar);

    info.appendChild(name);
    info.appendChild(barWrap);

    const nums = document.createElement('div');
    nums.className = 'cs-nums';
    nums.innerHTML = `<div>${r.wins}${t('cs_wins_abbr')} / ${r.plays - r.wins}${t('cs_losses_abbr')}</div><div class="cs-plays">${r.plays} ${t('cs_games')} · ${r.wr}%</div>`;

    row.appendChild(rank);
    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(nums);
    listEl.appendChild(row);
  });
}

function closeReplayPanel() {
  const gamesList = document.getElementById('profile-games-section');
  const replayPanel = document.getElementById('profile-replay-panel');
  const gamesList2b = document.getElementById('profile-games-list');
  if (gamesList2b) gamesList2b.style.display = '';
  if (replayPanel) replayPanel.classList.remove('open');
  const nav = document.getElementById('replay-board-nav');
  if (nav) nav.innerHTML = '';
  _replayTurns = [];
  _replayCurrentTurn = 0;
}

// ── Hook: llamar desde endGame ──────────────────────────────────────────────
// ── Name editing ──
function startEditName() {
  _profileNameEditing = true;
  const profile = loadProfile();
  const input = document.getElementById('profile-name-input');
  input.value = profile.name || t('profile_player');
  document.getElementById('profile-name-display').style.display = 'none';
  document.getElementById('profile-name-edit-btn').style.display = 'none';
  input.style.display = '';
  input.focus();
  input.select();
}

function previewName(val) {}

function nameInputKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); confirmEditName(); }
  if (e.key === 'Escape') cancelEditName();
}

function confirmEditName() {
  const input = document.getElementById('profile-name-input');
  if (input.style.display === 'none') return; // already confirmed
  const newName = input.value.trim() || t('profile_player');
  const profile = loadProfile();
  profile.name = newName;
  saveProfile(profile);
  document.getElementById('profile-name-display').textContent = newName;
  document.getElementById('profile-name-display').style.display = '';
  document.getElementById('profile-name-edit-btn').style.display = '';
  input.style.display = 'none';
  _profileNameEditing = false;
  playSound('uiClick');
}

function cancelEditName() {
  document.getElementById('profile-name-display').style.display = '';
  document.getElementById('profile-name-edit-btn').style.display = '';
  document.getElementById('profile-name-input').style.display = 'none';
  _profileNameEditing = false;
}

// ── Avatar picker ──
function openAvatarPicker() {
  playSound('uiClick');
  const grid = document.getElementById('profile-avatar-picker-grid');
  grid.innerHTML = '';
  // Show all unlocked cards (excluding tokens), ordered like deck thumbnails: value desc, then type, then name
  const TYPE_ORDER = { exist: 0, reveal: 1, special: 2 };
  const unlocked = [...UNLOCKED_CARDS].filter(n => CARD_DB[n]).sort((a, b) => {
    const da = CARD_DB[a], db = CARD_DB[b];
    if ((db.value ?? 1) !== (da.value ?? 1)) return (db.value ?? 1) - (da.value ?? 1);
    const ta = TYPE_ORDER[da.type] ?? 99, tb = TYPE_ORDER[db.type] ?? 99;
    if (ta !== tb) return ta - tb;
    return a.localeCompare(b);
  });
  if (unlocked.length === 0) {
    grid.innerHTML = '<div style="font-family:KleeOne,sans-serif;font-size:0.8rem;color:var(--text-dim);text-align:center;padding:20px;opacity:0.6;">' + t('profile_no_unlocked') + '</div>';
  } else {
    let lastValue = null;
    unlocked.forEach(name => {
      const cardVal = CARD_DB[name]?.value ?? 1;
      if (lastValue !== null && cardVal !== lastValue) {
        const sep = document.createElement('div');
        sep.style.cssText = 'grid-column:1/-1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12) 20%,rgba(255,255,255,0.12) 80%,transparent);margin:4px 0;';
        grid.appendChild(sep);
      }
      lastValue = cardVal;
      const card = document.createElement('div');
      card.className = 'avatar-pick-card';
      card.title = name;
      const img = document.createElement('img');
      img.src = `./ilustraciones/${name}.jpg`;
      img.style.objectPosition = CB_THUMB_OFFSET.get(name) || 'top';
      img.draggable = false;
      img.onerror = () => { card.style.display='none'; };
      card.appendChild(img);
      card.onclick = () => {
        playSound('uiClick');
        const profile = loadProfile();
        profile.avatarCard = name;
        saveProfile(profile);
        renderProfileData(profile);
        closeAvatarPicker();
      };
      grid.appendChild(card);
    });
  }
  const picker = document.getElementById('profile-avatar-picker');
  picker.classList.add('show');
  picker.onclick = (e) => { if (e.target === picker) closeAvatarPicker(); };
}

function closeAvatarPicker() {
  document.getElementById('profile-avatar-picker').classList.remove('show');
}

// ── Title picker ──
function openTitlePicker() {
  playSound('uiClick');
  const profile = loadProfile();
  const list = document.getElementById('profile-title-picker-list');
  list.innerHTML = '';
  PLAYER_TITLES.forEach(t => {
    const opt = document.createElement('div');
    opt.className = 'title-pick-option' + (t === (profile.title || 'Ignorante') ? ' selected' : '');
    opt.textContent = getTranslatedTitle(t);
    opt.dataset.titleKey = t; // store ES key
    opt.onclick = () => {
      playSound('uiClick');
      const p = loadProfile();
      p.title = t;
      saveProfile(p);
      document.getElementById('profile-title-badge').textContent = getTranslatedTitle(t);
      closeTitlePicker();
    };
    list.appendChild(opt);
  });
  const picker = document.getElementById('profile-title-picker');
  picker.classList.add('show');
  picker.onclick = (e) => { if (e.target === picker) closeTitlePicker(); };
}

function closeTitlePicker() {
  document.getElementById('profile-title-picker').classList.remove('show');
}

// Close profile on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const avatarPicker = document.getElementById('profile-avatar-picker');
    const titlePicker  = document.getElementById('profile-title-picker');
    const overlay      = document.getElementById('profile-overlay');
    if (avatarPicker && avatarPicker.classList.contains('show')) { closeAvatarPicker(); return; }
    if (titlePicker  && titlePicker.classList.contains('show'))  { closeTitlePicker();  return; }
    if (overlay && overlay.style.display === 'flex') {
      if (_profileNameEditing) cancelEditName();
      else closePlayerProfile();
    }
  }
});

// ══════════════════════════════════════════════════════════
//  SISTEMA DE HITOS — Mosaico de Constelaciones
// ══════════════════════════════════════════════════════════

const HITOS_KEY = 'rinadivina_hitos';

// ── Todas las cartas en el orden que deben aparecer ──────
// (V1 primero, luego V0, luego tokens)
const HITOS_ALL_CARDS = [
  // V1
  'Koly','Chiouri','Gena','Nugu','Fukou','Ramia','Reina','Ziru','Mugon','Gran Demonio',
  'Slau','Hanoe','Faun','Yukoi','Abaki','Mimimi','Hobu','Yiren','Tira','Demae',
  'Feruzu','Kakomi','Soi','Tanozo','Foret','Tanna','Peroth','Henos','Miria','Ekuro',
  'Filia','Naiki','Kaeka','Miboro','En','Ponce','Mega','Imi','Etza','Gae',
  'Iona','Zao','Humi','Noira','Kope','Menmei','Nofi','Tenpoh',
  // V0
  'Tei','Roloc','Reki','Moira','Reiza','Yuta','Tis','Usei','Nasu','Su','Rasu','Neutra','Resta','Suma','Una',
  // Tokens
  'ErizoPeluche','Ery','Gatito',
];

// ── Definición de hitos (uno por carta) ──────────────────
// condition, goal, rewardTitle, rewardTitleStyle ('gold'|'silver'|'shiny'),
// rewardShinyCard son todos opcionales hasta que se rellenen.
// trackKey se genera automáticamente como 'hito_' + id.
const HITOS_DEF = {
  // ── El único con datos por ahora ──
  Nugu: {
    condition: "Gana un espacio con Nugu y 2 Erizos Blancos de Peluche en el lado rival.",
    goal: 1,
    trackKey: 'nuguVsErizo',
    rewardTitle: 'Domador de erizos',
    rewardTitleStyle: 'shiny',
    rewardShinyCard: 'Nugu',
  },
  Koly: {
    condition: "En una partida, evita con Koly que el rival remueva tus aliados 2 veces.",
    goal: 1,
    trackKey: 'kolyProtectTwice',
    rewardTitle: 'Escudo real',
    rewardTitleStyle: 'gold',
    rewardShinyCard: 'Koly',
  },
  Chiouri: {
    condition: "Gana un espacio con Chiouri donde el rival tenía 6 o más de valor.",
    goal: 1,
    trackKey: 'chiouriHighRivalWin',
    rewardTitle: 'Dios/a de los límites',
    rewardTitleStyle: 'gold',
    rewardShinyCard: 'Chiouri',
  },
  Gena: {
    condition: "En una partida, con Gena otorga valor a Chiouri en otro espacio y gana ambos espacios.",
    goal: 1,
    trackKey: 'genaChiouriWin',
    rewardTitle: 'Servicio perfecto',
    rewardTitleStyle: 'gold',
    rewardShinyCard: 'Gena',
  },
  Fukou: {
    condition: "En una partida, haz que el rival tenga un Erizo de Peluche Blanco en un espacio, en la mano y en el mazo.",
    goal: 1,
    trackKey: 'fukouTripleErizo',
    rewardTitle: 'Legador de promesas',
    rewardTitleStyle: 'silver',
    rewardShinyCard: 'Fukou',
  },
  Ramia: {
    condition: "Con Ramia roba a Nugu de la mano rival.",
    goal: 1,
    trackKey: 'ramiaStolenNugu',
    rewardTitle: 'Acosador de gatos',
    rewardTitleStyle: 'silver',
    rewardShinyCard: 'Ramia',
  },
  Imi: {
    condition: "Gana una partida con los 3 espacios desempatados por Imi.",
    goal: 1,
    trackKey: 'imiTripleTiebreak',
    rewardTitle: 'Suerte y destino',
    rewardTitleStyle: 'shiny',
    rewardShinyCard: 'Imi',
  },
  // ── Resto — sin condición aún (se irán añadiendo) ──────
  Reina: {
    condition: "Mueve a Reina a otro espacio para que robe 6 o más de valor a un rival.",
    goal: 1,
    trackKey: 'reinaFurtivaSteals6',
    rewardTitle: 'Astucia furtiva',
    rewardTitleStyle: 'gold',
    rewardShinyCard: 'Reina',
  },
  Ziru: {
    condition: "Con Ziru en un espacio roba a Reki de la mano rival.",
    goal: 1,
    trackKey: 'ziruStoleReki',
    rewardTitle: 'Pastor mentiroso',
    rewardTitleStyle: 'silver',
    rewardShinyCard: 'Ziru',
  },
  Mugon: {
    condition: "En una partida, Koly protege a Mugon en el mismo espacio.",
    goal: 1,
    trackKey: 'kolyProtectedMugon',
    rewardTitle: 'Amor a primera vista',
    rewardTitleStyle: 'silver',
    rewardShinyCard: 'Mugon',
  },
  'Gran Demonio': {
    condition: "Mueve a Gran Demonio con Tira en un espacio con el efecto de 'Solo puede haber una carta de Valor 0 y una de Valor 1 aquí.' y descarta a Tira.",
    goal: 1,
    trackKey: 'granDemonioTaxistaMasPoderoso',
    rewardTitle: 'El taxista más poderoso',
    rewardTitleStyle: 'gold',
    rewardShinyCard: 'Gran Demonio',
  },
  Slau:       { condition: 'En una partida, gana con Slau un espacio lleno de Valor 1.', goal: 1, trackKey: 'slauJusticiaWon', rewardTitle: 'Justicia ciega', rewardTitleStyle:'silver',  rewardShinyCard:'Slau' },
  Hanoe:      { condition: 'En una partida, con Hanoe obtén 8 o más de valor.',          goal: 1, trackKey: 'hanoeMaxValue',   rewardTitle: 'Admirador de las nubes', rewardTitleStyle:'silver',  rewardShinyCard:'Hanoe' },
  Faun:       { condition: 'En una partida, obtén +2 valor con Faun en turno 7.',        goal: 1, trackKey: 'faunTurn7PlusTwo', rewardTitle: 'Trasnochador', rewardTitleStyle:'gold',   rewardShinyCard:'Faun' },
  Yukoi:      { condition: 'Con Yukoi otorga +1 valor a dos aliados en un turno.', goal: 1, trackKey: 'yukoiBoostedTwoSameTurn', rewardTitle: 'Melodía sorda', rewardTitleStyle:'silver',  rewardShinyCard:'Yukoi' },
  Abaki:      { condition: "Termina una partida con Abaki habiendo activado su efecto y en el mismo espacio que Miria.", goal: 1, trackKey: 'abakiInvestigadorAfortunado', rewardTitle: 'Investigador afortunado', rewardTitleStyle:'gold',   rewardShinyCard:'Abaki' },
  Mimimi:     { condition: "En una partida, coloca a Mimimi sin que se active su efecto y gana dicho espacio.", goal: 1, trackKey: 'mimimiPrimerPaso', rewardTitle: 'Primer paso', rewardTitleStyle:'silver',  rewardShinyCard:'Mimimi' },
  Hobu:       { condition: "En una partida, con Hobu haz que tres rivales pierdan su existir.", goal: 1, trackKey: 'hobuTrabajoPacil', rewardTitle: 'Trabajo fácil', rewardTitleStyle:'gold',   rewardShinyCard:'Hobu' },
  Yiren:      { condition: "En una partida, haz que Yiren haya estado en los tres espacios.", goal: 1, trackKey: 'yirenBaileTradicional', rewardTitle: 'Baile tradicional', rewardTitleStyle:'gold',   rewardShinyCard:'Yiren' },
  Tira:       { condition: "En una partida, sin Su, coloca a Tira en primer turno y el resto de turnos coloca cartas con la condición \"Si el rival colocó aquí, o no\" con éxito.", goal: 1, trackKey: 'tiraEstrategaEspia', rewardTitle: 'Estratega espía', rewardTitleStyle:'silver',  rewardShinyCard:'Tira' },
  Demae:      { condition: "Gana una partida con Demae en el efecto de espacio \"Las cartas en este espacio no pueden ser movidas.\".", goal: 1, trackKey: 'demaeChabuzas', rewardTitle: 'Chapuzas', rewardTitleStyle:'silver',  rewardShinyCard:'Demae' },
  Feruzu:     { condition: 'En una partida, con Feruzu remueve a una Kakomi rival.',                                                              goal: 1, trackKey: 'feruzuRemovedKakomi',    rewardTitle: '1 vs. 1',                rewardTitleStyle:'silver',  rewardShinyCard:'Feruzu' },
  Kakomi:     { condition: 'En una partida, con Kakomi remueve a Slau.',                                                                         goal: 1, trackKey: 'kakomiremovedSlau',      rewardTitle: 'Extripaalmas',            rewardTitleStyle:'silver',  rewardShinyCard:'Kakomi' },
  Soi:        { condition: 'En una partida, con Soi roba dos cartas del mazo con Menmei y gana.',                                                goal: 1, trackKey: 'soiMenmeiDrawTwoWin',    rewardTitle: 'Pirómano del amor',       rewardTitleStyle:'gold',   rewardShinyCard:'Soi' },
  Tanozo:     { condition: 'En una partida, con Tanozo haz que 3 rivales pierdan su efecto.',                                                    goal: 1, trackKey: 'tanozoThreeDisabled',    rewardTitle: 'Mal de ojo',             rewardTitleStyle:'silver',  rewardShinyCard:'Tanozo' },
  Foret:      { condition: "En una partida, descarta a Foret si Nugu está en el mismo espacio.",                                                 goal: 1, trackKey: 'foretDiscardedWithNugu', rewardTitle: 'Perversión respetable',   rewardTitleStyle:'gold',   rewardShinyCard:'Foret' },
  Tanna:      { condition: 'En una partida, en un turno activa el efecto de Tanna y Mimimi para que estén en el mismo espacio.',                 goal: 1, trackKey: 'tannaMimimiSameTurn',    rewardTitle: 'Caja de sorpresas',       rewardTitleStyle:'silver',  rewardShinyCard:'Tanna' },
  Peroth:     { condition: 'En una partida, con Peroth coloca a Mugon de la Pila de Descarte a un espacio.',                                      goal: 1, trackKey: 'perothPlacedMugon',      rewardTitle: 'Dios de los pecados',   rewardTitleStyle:'silver',  rewardShinyCard:'Peroth' },
  Henos:      { condition: 'En una partida, con Henos haz que tú y el rival terminen el turno sin cartas en la mano.',                               goal: 1, trackKey: 'henosBothHandsEmpty',    rewardTitle: 'Niño interior',          rewardTitleStyle:'silver',  rewardShinyCard:'Henos' },
  Miria:      { condition: 'En una partida, con Miria descarta a Abaki.',                                                                             goal: 1, trackKey: 'miriaDiscardedAbaki',    rewardTitle: 'Huésped de la desdicha', rewardTitleStyle:'gold',   rewardShinyCard:'Miria' },
  Ekuro:      { condition: 'En una partida, coloca a Ekuro en primer turno y no uses su efecto.',                                                     goal: 1, trackKey: 'ekuroT1NoSacrifice',      rewardTitle: 'Artista incomprendido',  rewardTitleStyle:'silver',  rewardShinyCard:'Ekuro' },
  Filia:      { condition: "En una partida, gana un espacio con Filia y Chiouri en el mismo espacio.",                                                  goal: 1, trackKey: 'filiaChiouriWonSpace',  rewardTitle: 'Campanero gélido',        rewardTitleStyle:'silver',  rewardShinyCard:'Filia' },
  Naiki:      { condition: "En una partida, con Naiki en un espacio, quédate sin cartas en el mazo antes del turno 4.",                                goal: 1, trackKey: 'naikiDeckEmptyBefore4', rewardTitle: 'Exigente en modales',     rewardTitleStyle:'silver',  rewardShinyCard:'Naiki' },
  Kaeka:      { condition: "Termina una partida con Kaeka con 0 de valor.",                                                                            goal: 1, trackKey: 'kaekaZeroValue',         rewardTitle: 'Corazón roto',            rewardTitleStyle:'gold',   rewardShinyCard:'Kaeka' },
  Miboro:     { condition: 'En una partida, revela a Miboro en un espacio con el efecto de "Las cartas aquí se revelan al final de la partida."',      goal: 1, trackKey: 'miboroRevealedInFogSpace',rewardTitle: 'Veterano en las escondidas',rewardTitleStyle:'silver', rewardShinyCard:'Miboro' },
  En:         { condition: "Termina una partida con En con 6 o más de valor.",                                                                         goal: 1, trackKey: 'enSixOrMore',            rewardTitle: 'Optimista',               rewardTitleStyle:'gold',   rewardShinyCard:'En' },
  Ponce:      { condition: "En una partida, el rival te removió a Ponce.",                                                                             goal: 1, trackKey: 'ponceRemovedByRival',    rewardTitle: 'Romeo y Julieta',         rewardTitleStyle:'silver',  rewardShinyCard:'Ponce' },
  Mega:       { condition: 'En una partida, gana los 3 espacios habiendo boosteado con Mega aliados en los 3 espacios perdidos.',               goal: 1, trackKey: 'megaThreeLostBoostedWon',  rewardTitle: 'Santa esperanza',              rewardTitleStyle:'gold',   rewardShinyCard:'Mega' },
  Etza:       { condition: 'En una partida, gana los 3 espacios con Etza.',                                                                    goal: 1, trackKey: 'etzaWonAllThree',           rewardTitle: 'Ídolo',                        rewardTitleStyle:'silver',  rewardShinyCard:'Etza' },
  Gae:        { condition: 'En una partida, gana un espacio con Gae y Humi.',                                                                  goal: 1, trackKey: 'gaeHumiWonSpace',           rewardTitle: 'Masajista cauto',              rewardTitleStyle:'silver',  rewardShinyCard:'Gae' },
  Iona:       { condition: 'En una partida, gana un espacio solo con Iona.',                                                                   goal: 1, trackKey: 'ionaAloneWonSpace',         rewardTitle: 'Lobo solitario',               rewardTitleStyle:'silver',  rewardShinyCard:'Iona' },
  Zao:        { condition: 'En una partida, coloca a Zao en un espacio con 3 rivales y piérdelo.',                                             goal: 1, trackKey: 'zaoThreeRivalsLost',        rewardTitle: 'Lobo ladrador, poco mordedor', rewardTitleStyle:'gold',   rewardShinyCard:'Zao' },
  Humi:       { condition: 'En una partida, pierde un espacio con Humi por desempate de una Imi rival en el mismo espacio.',                   goal: 1, trackKey: 'humiLostToImiTiebreak',     rewardTitle: 'Envidioso',                    rewardTitleStyle:'silver',  rewardShinyCard:'Humi' },
  Noira:      { condition: 'Termina una partida con Noira en el tablero y todos tus aliados con exactamente 2 de valor.',                                                        goal: 1, trackKey: 'noiraAllAlliesValueTwo',    rewardTitle: 'Decorador',                    rewardTitleStyle:'silver',  rewardShinyCard:'Noira' },
  Kope:       { condition: "En una partida, usa a Kope para eliminar un Valor 1 aliado y extinguir a Usei convirtiendo el espacio en Real.",              goal: 1, trackKey: 'kopeKilledAllyTriggeredUsei', rewardTitle: 'Buscador de la felicidad', rewardTitleStyle:'silver', rewardShinyCard:'Kope' },
  Menmei:     { condition: 'En una partida, roba a Su con Menmei y colócalo en un espacio con el efecto "Las cartas de Valor 0 colocadas aquí se extinguen".', goal: 1, trackKey: 'menmeiSuInExtinctSpace',      rewardTitle: 'Gato curioso',             rewardTitleStyle:'gold',   rewardShinyCard:'Menmei' },
  Nofi:       { condition: "Termina una partida con Nofi, Ery y Menmei en el mismo espacio.",                                                                    goal: 1, trackKey: 'nofiEryMenmeiSameSpace',      rewardTitle: 'Ambientalista',             rewardTitleStyle:'silver', rewardShinyCard:'Nofi' },
  Tenpoh:     { condition: "En una partida, coloca a Tenpoh desde la Pila de Descarte a un espacio.",                                                            goal: 1, trackKey: 'tenpohPlacedFromDiscard',     rewardTitle: 'Miope',                    rewardTitleStyle:'silver', rewardShinyCard:'Tenpoh' },
  Tei:        { condition: 'En una partida, con Tei coloca un Valor 1 como Valor 0 en un espacio con el efecto de "Las cartas de Valor 0 colocadas aquí se extinguen".', goal: 1, trackKey: 'teiPlacedV1InExtinctSpace',  rewardTitle: 'La existencia',  rewardTitleStyle:'silver', rewardShinyCard:'Tei' },
  Roloc:      { condition: 'En una partida, aplica el efecto de Roloc en un espacio con el efecto de "Las cartas de Valor 0 colocadas aquí se extinguen".',              goal: 1, trackKey: 'rolocPropagatedExtinct',    rewardTitle: 'El color',       rewardTitleStyle:'gold',   rewardShinyCard:'Roloc' },
  Reki:       { condition: 'Gana un espacio Real con Reki.',                                                                                                              goal: 1, trackKey: 'rekiWonRealSpace',          rewardTitle: 'El sueño',       rewardTitleStyle:'gold',   rewardShinyCard:'Reki' },
  Reiza:      { condition: 'Gana un espacio con Reiza junto a Gatito (Gatito colocado en el tablero vía Peroth).',                                                        goal: 1, trackKey: 'reizaGatitoWonSpace',       rewardTitle: 'Niegavalores',   rewardTitleStyle:'silver', rewardShinyCard:'Reiza' },
  Yuta:       { condition: 'Termina una partida con Yuta cambiando un espacio que era perdido y que termine como ganado.',                                                goal: 1, trackKey: 'yutaTurnedLostToWon',       rewardTitle: 'El tiempo',      rewardTitleStyle:'silver', rewardShinyCard:'Yuta' },
  Tis:        { condition: 'En una partida, extingue a Tis junto a Usei tras remover a Nugu con Kope (los 4 aliados).', goal: 1, trackKey: 'tisUseiFiredByKopeNugu',  rewardTitle: 'La gravedad',          rewardTitleStyle:'gold',   rewardShinyCard:'Tis' },
  Usei:       { condition: 'En una partida, extingue a Usei junto a Tis tras remover a Nugu con Kope (los 4 aliados).',  goal: 1, trackKey: 'tisUseiFiredByKopeNugu',  rewardTitle: 'El destino',           rewardTitleStyle:'silver', rewardShinyCard:'Usei' },
  Nasu:       { condition: 'En una partida, la IA usó Colocación Destinada en el espacio donde el jugador tiene a Nasu boca arriba.', goal: 1, trackKey: 'nasuRivalDestinadaHere', rewardTitle: '¿El huevo o la gallina?', rewardTitleStyle:'gold',   rewardShinyCard:'Nasu' },
  Su:         { condition: 'Termina una partida con Su, Ery y un Erizo de Peluche Blanco en el mismo espacio (los 3 aliados).', goal: 1, trackKey: 'suEryErizoSameSpace',      rewardTitle: 'Escéptico',            rewardTitleStyle:'gold',   rewardShinyCard:'Su' },
  Rasu:       { condition: 'Termina una partida con Rasu, Su y Ery en el mismo espacio (los 3 aliados).',                      goal: 1, trackKey: 'rasuSuErySameSpace',       rewardTitle: 'Déjà vu',              rewardTitleStyle:'silver', rewardShinyCard:'Rasu' },
  Neutra:     { condition: 'En una partida, usa Colocación Destinada con Nugu y Neutra, e intercambia con Neutra al Erizo de Peluche Blanco rival.', goal: 1, trackKey: 'neutraDestinadaSwapErizo',   rewardTitle: 'Coleccionista',         rewardTitleStyle:'silver', rewardShinyCard:'Neutra' },
  Resta:      { condition: 'En una partida, gana un espacio con Resta.',                                                                              goal: 1, trackKey: 'restaWonSpace',              rewardTitle: 'Completamente relajado', rewardTitleStyle:'silver', rewardShinyCard:'Resta' },
  Suma:       { condition: 'En una partida, gana los tres espacios con Suma en la Pila de Extinción sin utilizar cartas de Valor 0.',                 goal: 1, trackKey: 'sumaExtinctWonAll3',        rewardTitle: 'Amor materno',           rewardTitleStyle:'gold',   rewardShinyCard:'Suma' },
  Una:        { condition: 'Termina una partida con Reki y Una en el mismo espacio.',                                                                    goal: 1, trackKey: 'unaRekiSameSpace',         rewardTitle: 'Sueño lúcido',           rewardTitleStyle:'silver', rewardShinyCard:'Una' },
  ErizoPeluche:{ condition: 'Gana una partida con Fukou y Nugu en distintos espacios.',                                                               goal: 1, trackKey: 'erizoFukouNuguDistinct',    rewardTitle: 'Peluche',               rewardTitleStyle:'silver', rewardShinyCard:'ErizoPeluche' },
  Ery:        { condition: 'Gana tres espacios en una partida con Nofi, Menmei y Ery en espacios distintos.',                                          goal: 1, trackKey: 'eryNofiMenmeiDistinct3',    rewardTitle: 'Peluche de Autoridad',   rewardTitleStyle:'silver', rewardShinyCard:'Ery' },
  Gatito:     { condition: 'Gana un espacio con Reiza.',                                                                                               goal: 1, trackKey: 'gatitoReizaWonSpace',       rewardTitle: 'Inevitable',             rewardTitleStyle:'gold',   rewardShinyCard:'Gatito' },
  Moira:      { condition: 'Activa el efecto de Usei con el efecto de Moira.',                                                                         goal: 1, trackKey: 'moiraUseiHitoActivated',    rewardTitle: 'Jugada invisible',        rewardTitleStyle:'gold',   rewardShinyCard:'Moira' },
};

// ══════════════════════════════════════════════════════════
//  HITOS_DEF TRANSLATIONS — EN & JA
// ══════════════════════════════════════════════════════════
const HITOS_DEF_EN = {
  Nugu:        { condition: "Win a space with Nugu and 2 White Plush Hedgehogs on the opponent's side.", rewardTitle: 'Hedgehog Tamer' },
  Koly:        { condition: "In one match, use Koly to prevent the opponent from removing your allies twice.", rewardTitle: 'Royal Shield' },
  Chiouri:     { condition: "Win a space with Chiouri where the opponent had 6 or more value.", rewardTitle: 'God/Goddess of Limits' },
  Gena:        { condition: "In one match, use Gena to give value to Chiouri in another space and win both spaces.", rewardTitle: 'Perfect Service' },
  Fukou:       { condition: "In one match, make the opponent have a White Plush Hedgehog in a space, in their hand and in their deck.", rewardTitle: 'Promise Bearer' },
  Ramia:       { condition: "Use Ramia to steal Nugu from the opponent's hand.", rewardTitle: 'Cat Stalker' },
  Imi:         { condition: "Win a match with all 3 spaces decided by Imi's tiebreaker.", rewardTitle: 'Luck and Destiny' },
  Reina:       { condition: "Move Reina to another space to steal 6 or more value from an opponent.", rewardTitle: 'Stealthy Cunning' },
  Ziru:        { condition: "With Ziru in a space, steal Reki from the opponent's hand.", rewardTitle: 'Lying Shepherd' },
  Mugon:       { condition: "In one match, Koly protects Mugon in the same space.", rewardTitle: 'Love at First Sight' },
  'Gran Demonio': { condition: "Move Gran Demonio with Tira to a space with the effect 'Only one Value 0 and one Value 1 card can be here.' and discard Tira.", rewardTitle: 'The Most Powerful Taxi Driver' },
  Slau:        { condition: "In one match, win with Slau a space full of Value 1 cards.", rewardTitle: 'Blind Justice' },
  Hanoe:       { condition: "In one match, reach 8 or more value with Hanoe.", rewardTitle: 'Cloud Admirer' },
  Faun:        { condition: "In one match, gain +2 value with Faun on turn 7.", rewardTitle: 'Night Owl' },
  Yukoi:       { condition: "Use Yukoi to grant +1 value to two allies in one turn.", rewardTitle: 'Silent Melody' },
  Abaki:       { condition: "Finish a match with Abaki having triggered its effect and in the same space as Miria.", rewardTitle: 'Lucky Investigator' },
  Mimimi:      { condition: "In one match, place Mimimi without its effect triggering and win that space.", rewardTitle: 'First Step' },
  Hobu:        { condition: "In one match, use Hobu to make three opponents lose their Exist effect.", rewardTitle: 'Easy Job' },
  Yiren:       { condition: "In one match, have Yiren pass through all three spaces.", rewardTitle: 'Traditional Dance' },
  Tira:        { condition: "In one match, without Su, place Tira on turn 1 and every remaining turn play cards with the condition \"Whether or not the opponent played here\" successfully.", rewardTitle: 'Spy Strategist' },
  Demae:       { condition: "Win a match with Demae in a space with the effect \"Cards in this space cannot be moved.\"", rewardTitle: 'Botched Job' },
  Feruzu:      { condition: "In one match, use Feruzu to remove an opponent's Kakomi.", rewardTitle: '1 vs. 1' },
  Kakomi:      { condition: "In one match, use Kakomi to remove Slau.", rewardTitle: 'Soul Stripper' },
  Soi:         { condition: "In one match, use Soi to draw two cards from the deck with Menmei and win.", rewardTitle: 'Love Pyromaniac' },
  Tanozo:      { condition: "In one match, use Tanozo to make 3 opponents lose their effect.", rewardTitle: 'Evil Eye' },
  Foret:       { condition: "In one match, discard Foret while Nugu is in the same space.", rewardTitle: 'Respectable Perversion' },
  Tanna:       { condition: "In one match, trigger Tanna and Mimimi's effects in the same turn so they end up in the same space.", rewardTitle: 'Jack-in-the-Box' },
  Peroth:      { condition: "In one match, use Peroth to place Mugon from the Discard Pile to a space.", rewardTitle: 'God of Sins' },
  Henos:       { condition: "In one match, use Henos so both you and the opponent end the turn with no cards in hand.", rewardTitle: 'Inner Child' },
  Miria:       { condition: "In one match, use Miria to discard Abaki.", rewardTitle: "Misfortune's Guest" },
  Ekuro:       { condition: "In one match, place Ekuro on the first turn and do not use its effect.", rewardTitle: 'Misunderstood Artist' },
  Filia:       { condition: "In one match, win a space with Filia and Chiouri in the same space.", rewardTitle: 'Icy Bell Ringer' },
  Naiki:       { condition: "In one match, with Naiki in a space, run out of deck cards before turn 4.", rewardTitle: 'Demanding in Manners' },
  Kaeka:       { condition: "Finish a match with Kaeka at 0 value.", rewardTitle: 'Broken Heart' },
  Miboro:      { condition: "In one match, reveal Miboro in a space with the effect \"Cards here are revealed at the end of the match.\"", rewardTitle: 'Hide-and-Seek Veteran' },
  En:          { condition: "Finish a match with En at 6 or more value.", rewardTitle: 'Optimist' },
  Ponce:       { condition: "In one match, the opponent removed Ponce.", rewardTitle: 'Romeo and Juliet' },
  Mega:        { condition: "In one match, win all 3 spaces having boosted allies with Mega in all 3 losing spaces.", rewardTitle: 'Holy Hope' },
  Etza:        { condition: "In one match, win all 3 spaces with Etza.", rewardTitle: 'Idol' },
  Gae:         { condition: "In one match, win a space with Gae and Humi.", rewardTitle: 'Cautious Masseur' },
  Iona:        { condition: "In one match, win a space with only Iona.", rewardTitle: 'Lone Wolf' },
  Zao:         { condition: "In one match, place Zao in a space with 3 opponents and lose it.", rewardTitle: 'All Bark and No Bite' },
  Humi:        { condition: "In one match, lose a space with Humi due to a tiebreaker by an opponent's Imi in the same space.", rewardTitle: 'Envious' },
  Noira:       { condition: "Finish a match with Noira on the board and all your allies at exactly 2 value.", rewardTitle: 'Decorator' },
  Kope:        { condition: "In one match, use Kope to eliminate a Value 1 ally and extinguish Usei, turning the space into Real.", rewardTitle: 'Happiness Seeker' },
  Menmei:      { condition: "In one match, draw Su with Menmei and place it in a space with the effect \"Value 0 cards placed here go extinct.\"", rewardTitle: 'Curious Cat' },
  Nofi:        { condition: "Finish a match with Nofi, Ery and Menmei in the same space.", rewardTitle: 'Environmentalist' },
  Tenpoh:      { condition: "In one match, place Tenpoh from the Discard Pile to a space.", rewardTitle: 'Short-Sighted' },
  Tei:         { condition: "In one match, use Tei to place a Value 1 as Value 0 in a space with the effect \"Value 0 cards placed here go extinct.\"", rewardTitle: 'Existence' },
  Roloc:       { condition: "In one match, apply Roloc's effect in a space with the effect \"Value 0 cards placed here go extinct.\"", rewardTitle: 'The Color' },
  Reki:        { condition: "Win a Real space with Reki.", rewardTitle: 'The Dream' },
  Reiza:       { condition: "Win a space with Reiza alongside Gatito (Gatito placed on the board via Peroth).", rewardTitle: 'Value Denier' },
  Yuta:        { condition: "Finish a match with Yuta having changed a losing space into a won space.", rewardTitle: 'Time' },
  Tis:         { condition: "In one match, extinguish Tis alongside Usei after removing Nugu with Kope (all 4 allies).", rewardTitle: 'Gravity' },
  Usei:        { condition: "In one match, extinguish Usei alongside Tis after removing Nugu with Kope (all 4 allies).", rewardTitle: 'The Destiny' },
  Nasu:        { condition: "In one match, the AI used Destined Placement in the space where the player has Nasu face-up.", rewardTitle: 'Which Came First?' },
  Su:          { condition: "Finish a match with Su, Ery and a White Plush Hedgehog in the same space (all 3 allies).", rewardTitle: 'Skeptic' },
  Rasu:        { condition: "Finish a match with Rasu, Su and Ery in the same space (all 3 allies).", rewardTitle: 'Déjà vu' },
  Neutra:      { condition: "In one match, use Destined Placement with Nugu and Neutra, and swap Neutra with the opponent's White Plush Hedgehog.", rewardTitle: 'Collector' },
  Resta:       { condition: "In one match, win a space with Resta.", rewardTitle: 'Completely Relaxed' },
  Suma:        { condition: "In one match, win all three spaces with Suma in the Extinction Pile without using Value 0 cards.", rewardTitle: 'Maternal Love' },
  Una:         { condition: "Finish a match with Reki and Una in the same space.", rewardTitle: 'Lucid Dream' },
  ErizoPeluche:{ condition: "Win a match with Fukou and Nugu in different spaces.", rewardTitle: 'Plushie' },
  Ery:         { condition: "Win three spaces in a match with Nofi, Menmei and Ery in different spaces.", rewardTitle: 'Authority Plushie' },
  Gatito:      { condition: "Win a space with Reiza.", rewardTitle: 'Inevitable' },
  Moira:       { condition: "Trigger Usei's effect with Moira's effect.", rewardTitle: 'Invisible Move' },
};

const HITOS_DEF_JA = {
  Nugu:        { condition: 'ヌグと相手側の白いぬいぐるみハリネズミ2体でスペースを制する。', rewardTitle: 'ハリネズミ使い' },
  Koly:        { condition: '1試合中、コリーで相手による味方の除去を2回防ぐ。', rewardTitle: '王家の盾' },
  Chiouri:     { condition: '相手が6以上の値を持つスペースをチオウリで制する。', rewardTitle: '限界の神' },
  Gena:        { condition: '1試合中、ジェナで別スペースのチオウリに値を与え、両スペースを制する。', rewardTitle: '完璧なサービス' },
  Fukou:       { condition: '1試合中、相手のスペース・手札・デッキそれぞれに白いぬいぐるみハリネズミを持たせる。', rewardTitle: '約束の担い手' },
  Ramia:       { condition: 'ラミアで相手の手札からヌグを奪う。', rewardTitle: '猫ストーカー' },
  Imi:         { condition: '3スペース全てをイミの決着で決めて試合に勝つ。', rewardTitle: '幸運と運命' },
  Reina:       { condition: 'レイナを別スペースへ移動させ、相手から6以上の値を奪う。', rewardTitle: '巧みな盗み' },
  Ziru:        { condition: 'ジルをスペースに置き、相手の手札からレキを奪う。', rewardTitle: '嘘つき羊飼い' },
  Mugon:       { condition: '1試合中、同じスペースでコリーがムゴンを守る。', rewardTitle: '一目惚れ' },
  'Gran Demonio': { condition: '大悪魔をティラと共に「値0と値1のカードがそれぞれ1枚しか置けない」効果のスペースへ移動し、ティラを捨てる。', rewardTitle: '最強のタクシー運転手' },
  Slau:        { condition: '1試合中、値1で埋まったスペースをスロウで制する。', rewardTitle: '盲目の正義' },
  Hanoe:       { condition: '1試合中、ハノエで8以上の値に達する。', rewardTitle: '雲の崇拝者' },
  Faun:        { condition: '1試合中、ターン7にフォーンで+2値を得る。', rewardTitle: '夜更かし' },
  Yukoi:       { condition: '1ターンにユコイで2体の味方に+1値を与える。', rewardTitle: '無声のメロディ' },
  Abaki:       { condition: 'アバキの効果を発動させた状態でミリアと同じスペースに置いて試合を終える。', rewardTitle: '幸運な調査員' },
  Mimimi:      { condition: '1試合中、ミミミの効果を発動させずに配置し、そのスペースを制する。', rewardTitle: '最初の一歩' },
  Hobu:        { condition: '1試合中、ホブで相手の存在効果を3回失わせる。', rewardTitle: '楽な仕事' },
  Yiren:       { condition: '1試合中、イレンを3つ全てのスペースに置く。', rewardTitle: '伝統の舞' },
  Tira:        { condition: '1試合中、スを使わずにティラを最初のターンに置き、残りのターンは全て「相手がここにプレイしたか否か」条件のカードを成功させる。', rewardTitle: 'スパイ戦略家' },
  Demae:       { condition: '「このスペースのカードは移動できない」効果のスペースでデマエを使って試合に勝つ。', rewardTitle: '雑な仕事' },
  Feruzu:      { condition: '1試合中、フェルズで相手のカコミを除去する。', rewardTitle: '1対1' },
  Kakomi:      { condition: '1試合中、カコミでスロウを除去する。', rewardTitle: '魂剥がし' },
  Soi:         { condition: '1試合中、ソイでメンメイを使いデッキから2枚引いて勝つ。', rewardTitle: '愛の放火魔' },
  Tanozo:      { condition: '1試合中、タノゾで相手3体の効果を失わせる。', rewardTitle: '邪視' },
  Foret:       { condition: '1試合中、ヌグが同じスペースにいる状態でフォレットを捨てる。', rewardTitle: '由緒ある倒錯' },
  Tanna:       { condition: '1試合中、同じターンにタンナとミミミの効果を発動させて同じスペースに集める。', rewardTitle: 'びっくり箱' },
  Peroth:      { condition: '1試合中、ペロスで捨て山からムゴンをスペースに配置する。', rewardTitle: '罪の神' },
  Henos:       { condition: '1試合中、ヘノスで自分と相手が共にターン終了時に手札ゼロになる。', rewardTitle: '内なる子供' },
  Miria:       { condition: '1試合中、ミリアでアバキを捨てる。', rewardTitle: '不幸の客人' },
  Ekuro:       { condition: '1試合中、エクロを最初のターンに置き、その効果を使わない。', rewardTitle: '誤解された芸術家' },
  Filia:       { condition: '1試合中、フィリアとチオウリを同じスペースに置いてそのスペースを制する。', rewardTitle: '氷の鐘つき' },
  Naiki:       { condition: '1試合中、ナイキをスペースに置きターン4前にデッキを使い切る。', rewardTitle: '礼儀に厳しい' },
  Kaeka:       { condition: 'カエカが0値で試合を終える。', rewardTitle: '失恋' },
  Miboro:      { condition: '1試合中、「ここのカードは試合終了時に公開される」効果のスペースでミボロを公開する。', rewardTitle: 'かくれんぼの猛者' },
  En:          { condition: 'エンが6以上の値で試合を終える。', rewardTitle: '楽観主義者' },
  Ponce:       { condition: '1試合中、相手がポンスを除去した。', rewardTitle: 'ロミオとジュリエット' },
  Mega:        { condition: '1試合中、負けている3スペース全てでメガが味方を強化し、その3スペースを全て制する。', rewardTitle: '聖なる希望' },
  Etza:        { condition: '1試合中、エツァで3スペース全てを制する。', rewardTitle: 'アイドル' },
  Gae:         { condition: '1試合中、ガエとヒュミで同じスペースを制する。', rewardTitle: '慎重なマッサージ師' },
  Iona:        { condition: '1試合中、イオナだけでスペースを制する。', rewardTitle: '孤高のオオカミ' },
  Zao:         { condition: '1試合中、相手3体がいるスペースにザオを置いてそのスペースを落とす。', rewardTitle: '吠え面かくな' },
  Humi:        { condition: '1試合中、同じスペースの相手イミの決着でヒュミのスペースを落とす。', rewardTitle: '嫉妬深い' },
  Noira:       { condition: 'ノイラをボードに置いた状態で、全ての味方がちょうど2値になって試合を終える。', rewardTitle: 'デコレーター' },
  Kope:        { condition: '1試合中、コペで値1の味方を除去しウセイを絶滅させてスペースをリアルにする。', rewardTitle: '幸福の探求者' },
  Menmei:      { condition: '1試合中、メンメイでスを引き、「値0カードが絶滅する」効果のスペースに配置する。', rewardTitle: '好奇心旺盛な猫' },
  Nofi:        { condition: 'ノフィ・エリー・メンメイを同じスペースに置いて試合を終える。', rewardTitle: '環境保護主義者' },
  Tenpoh:      { condition: '1試合中、捨て山からテンポーをスペースに配置する。', rewardTitle: '近視眼的' },
  Tei:         { condition: '1試合中、テイで値1を値0として「値0カードが絶滅する」効果のスペースに配置する。', rewardTitle: '存在' },
  Roloc:       { condition: '1試合中、「値0カードが絶滅する」効果のスペースにロロクの効果を適用する。', rewardTitle: '色' },
  Reki:        { condition: 'リアルスペースをレキで制する。', rewardTitle: '夢' },
  Reiza:       { condition: 'レイザと子猫（ペロスで配置した子猫）で同じスペースを制する。', rewardTitle: '値否定者' },
  Yuta:        { condition: 'ユタで負けスペースを勝ちスペースに変えて試合を終える。', rewardTitle: '時間' },
  Tis:         { condition: '1試合中、コペでヌグを除去してティスとウセイを共に絶滅させる（4体全員）。', rewardTitle: '重力' },
  Usei:        { condition: '1試合中、コペでヌグを除去してウセイとティスを共に絶滅させる（4体全員）。', rewardTitle: '運命' },
  Nasu:        { condition: '1試合中、プレイヤーがナスを表向きで置いているスペースにAIが運命配置を使った。', rewardTitle: 'どっちが先？' },
  Su:          { condition: 'ス・エリー・白いぬいぐるみハリネズミを同じスペースに置いて試合を終える（3体全員）。', rewardTitle: '懐疑主義者' },
  Rasu:        { condition: 'ラス・ス・エリーを同じスペースに置いて試合を終える（3体全員）。', rewardTitle: 'デジャブ' },
  Neutra:      { condition: '1試合中、ヌグとニュートラで運命配置を使い、ニュートラで相手の白いぬいぐるみハリネズミと交換する。', rewardTitle: 'コレクター' },
  Resta:       { condition: '1試合中、レスタでスペースを制する。', rewardTitle: '完全なリラックス' },
  Suma:        { condition: '1試合中、絶滅山にスマを置いた状態で値0カードを使わずに3スペース全てを制する。', rewardTitle: '母性愛' },
  Una:         { condition: 'レキとウナを同じスペースに置いて試合を終える。', rewardTitle: '明晰夢' },
  ErizoPeluche:{ condition: 'フコウとヌグを別々のスペースに置いて試合に勝つ。', rewardTitle: 'ぬいぐるみ' },
  Ery:         { condition: 'ノフィ・メンメイ・エリーをそれぞれ別のスペースに置いて3スペース全てを制する。', rewardTitle: '権威あるぬいぐるみ' },
  Gatito:      { condition: 'レイザでスペースを制する。', rewardTitle: '必然' },
  Moira:       { condition: 'モイラの効果でウセイの効果を発動させる。', rewardTitle: '見えない一手' },
};

/** Devuelve { condition, rewardTitle } del hito en el idioma activo. */
function getHitoDisplay(name) {
  const lang = window.CURRENT_LANG || 'es';
  const base = HITOS_DEF[name] || {};
  if (lang === 'en' && HITOS_DEF_EN[name]) {
    return { condition: HITOS_DEF_EN[name].condition, rewardTitle: HITOS_DEF_EN[name].rewardTitle || base.rewardTitle };
  }
  if (lang === 'ja' && HITOS_DEF_JA[name]) {
    return { condition: HITOS_DEF_JA[name].condition, rewardTitle: HITOS_DEF_JA[name].rewardTitle || base.rewardTitle };
  }
  return { condition: base.condition, rewardTitle: base.rewardTitle };
}

// ── Estado del UI ─────────────────────────────────────────
let _hitosFilter   = 'all';
let _hitosSelected = null; // nombre de carta seleccionada

// ── Progreso persistido ───────────────────────────────────
function loadHitosProgress() {
  try { return JSON.parse(localStorage.getItem(HITOS_KEY) || '{}'); } catch { return {}; }
}
function saveHitosProgress(data) {
  try { localStorage.setItem(HITOS_KEY, JSON.stringify(data)); } catch {}
}

function getHitoProgress(cardName) {
  const def  = HITOS_DEF[cardName];
  if (!def) return null;
  // Sin condición definida aún — no hay progreso
  if (!def.trackKey || !def.goal) return { current: 0, done: false, hasCondition: false };
  const data = loadHitosProgress();
  return {
    current: data[def.trackKey] || 0,
    done:    !!(data[def.trackKey + '_done']),
    hasCondition: true,
  };
}

function isHitoDone(cardName) {
  const p = getHitoProgress(cardName);
  return p ? p.done : false;
}

// ── Filtro ────────────────────────────────────────────────
function setHitoFilter(filter, btn) {
  _hitosFilter = filter;
  document.querySelectorAll('.hitos-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHitosGrid();
}

// ── Abrir / cerrar pantalla ───────────────────────────────
function showHitos() {
  playSound('uiClick');
  _hitosSelected = null;
  _hitosFilter   = 'all';
  document.querySelectorAll('.hitos-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  const search = document.getElementById('hitos-search');
  if (search) search.value = '';
  document.getElementById('screen-menu').style.display = 'none';
  document.getElementById('hitos-overlay').classList.add('show');
  renderHitosGrid();
  updateHitosGlobalBar();
  document.getElementById('hitos-detail')?.classList.remove('show');
}

function closeHitos() {
  playSound('uiClick');
  document.getElementById('hitos-overlay').classList.remove('show');
  document.getElementById('screen-menu').style.display = 'flex';
  _hitosSelected = null;
}

// ── Render de la lista vertical ──────────────────────────
function renderHitosGrid() {
  const grid   = document.getElementById('hitos-grid');
  const empty  = document.getElementById('hitos-empty');
  const search = (document.getElementById('hitos-search')?.value || '').toLowerCase().trim();
  if (!grid) return;
  grid.innerHTML = '';

  const totalWithCond = HITOS_ALL_CARDS.filter(n => HITOS_DEF[n]?.trackKey).length;
  const totalDone     = HITOS_ALL_CARDS.filter(n => isHitoDone(n)).length;
  const subtitle = document.getElementById('hitos-header-subtitle');
  if (subtitle) {
    const _sl = window.CURRENT_LANG || 'es';
    if (_sl === 'en') subtitle.textContent = totalWithCond > 0 ? `${totalDone} / ${totalWithCond} completed` : 'Milestones in development';
    else if (_sl === 'ja') subtitle.textContent = totalWithCond > 0 ? `${totalDone} / ${totalWithCond} 達成` : '実績開発中';
    else subtitle.textContent = totalWithCond > 0 ? `${totalDone} / ${totalWithCond} completados` : 'Hitos en desarrollo';
  }

  const profile    = loadProfile();
  const shinyCards = profile.shinyCards || [];

  let shown = 0;

  HITOS_ALL_CARDS.forEach(name => {
    const hdef    = HITOS_DEF[name];
    const prog    = getHitoProgress(name);
    const done    = prog ? prog.done : false;
    const hasCond = prog ? prog.hasCondition : false;

    // Filtros
    if (_hitosFilter === 'done'    && !done)                   return;
    if (_hitosFilter === 'v1'      && !CARD_DB[name])          return;   // solo cartas V1 (en CARD_DB, no token)
    if (_hitosFilter === 'v1'      && CARD_DB[name]?.value !== 1) return;
    if (_hitosFilter === 'v0'      && (!CARD_DB[name] || CARD_DB[name]?.value !== 0)) return;
    if (_hitosFilter === 'token'   && !TOKENS[name])           return;
    if (search && !name.toLowerCase().includes(search))        return;

    shown++;

    // ── Ficha cromo ───────────────────────────────────────
    const row = document.createElement('div');
    row.className = 'hito-row' + (done ? ' done' : '');

    // Miniatura protagonista
    const thumbDiv = document.createElement('div');
    thumbDiv.className = 'hito-row-thumb';
    const img = document.createElement('img');
    img.src = `./ilustraciones/${name}.jpg`;
    img.alt = name;
    img.draggable = false;
    img.className = done ? 'color' : 'grey';
    img.onerror = () => { img.style.display = 'none'; };
    thumbDiv.appendChild(img);
    if (done) {
      const sweep = document.createElement('div');
      sweep.className = 'hito-row-sweep';
      thumbDiv.appendChild(sweep);
    }
    if (done && hdef?.rewardShinyCard && shinyCards.includes(hdef.rewardShinyCard)) {
      applyShinyIfUnlocked(thumbDiv, hdef.rewardShinyCard);
    }
    row.appendChild(thumbDiv);

    // Contenido
    const contentDiv = document.createElement('div');
    contentDiv.className = 'hito-row-content';

    // Top: nombre + título
    const top = document.createElement('div');
    top.className = 'hito-row-top';
    const nameEl = document.createElement('div');
    nameEl.className = 'hito-row-name';
    nameEl.textContent = name;
    top.appendChild(nameEl);
    const hitoDisplay = getHitoDisplay(name);
    if (hitoDisplay.rewardTitle) {
      const reward = document.createElement('div');
      reward.className = 'hito-row-reward ' + (hdef.rewardTitleStyle || 'silver');
      reward.textContent = `"${hitoDisplay.rewardTitle}"`;
      top.appendChild(reward);
    }
    contentDiv.appendChild(top);

    // Descripción (siempre visible, clampada a 2 líneas)
    const desc = document.createElement('div');
    desc.className = 'hito-row-desc' + (hasCond ? '' : ' no-cond');
    desc.textContent = hitoDisplay.condition || '—';
    contentDiv.appendChild(desc);

    // Bottom: barra de progreso — eliminada (cada hito es un único logro, no acumulativo)

    row.appendChild(contentDiv);

    // Shiny toggle — esquina inferior derecha absoluta
    const right = document.createElement('div');
    right.className = 'hito-row-right';
    const badge = document.createElement('div');
    badge.className = 'hito-done-badge';
    badge.textContent = window.CURRENT_LANG === 'en' ? 'completed' : window.CURRENT_LANG === 'ja' ? '達成' : 'completado';
    right.appendChild(badge);
    if (done && hdef?.rewardShinyCard) {
      const isActive = shinyCards.includes(hdef.rewardShinyCard);
      const btn = document.createElement('button');
      btn.className = 'hito-shiny-toggle' + (isActive ? ' active' : '');
      btn.textContent = isActive ? '✦ Shiny ON' : 'Shiny';
      const _sl = window.CURRENT_LANG || 'es';
      btn.title = isActive
        ? (_sl==='en' ? 'Disable shiny effect in match' : _sl==='ja' ? 'キラ効果を無効にする' : 'Desactivar efecto shiny en partida')
        : (_sl==='en' ? 'Enable shiny effect in match'  : _sl==='ja' ? 'キラ効果を有効にする' : 'Activar efecto shiny en partida');
      btn.onclick = (e) => { e.stopPropagation(); toggleHitoShinyCard(hdef.rewardShinyCard, btn); };
      right.appendChild(btn);
    }
    row.appendChild(right);
    grid.appendChild(row);
  });

  empty.style.display = shown === 0 ? 'flex' : 'none';
  grid.style.display  = shown === 0 ? 'none' : 'grid';
}

// ── Toggle shiny desde fila ───────────────────────────────
function toggleHitoShinyCard(cardName, btn) {
  if (!cardName) return;
  playSound('uiClick');
  const profile = loadProfile();
  if (!profile.shinyCards) profile.shinyCards = [];
  const idx = profile.shinyCards.indexOf(cardName);
  if (idx === -1) {
    profile.shinyCards.push(cardName);
    btn.classList.add('active');
    btn.textContent = '✦ Shiny ON';
    btn.title = 'Desactivar efecto shiny en partida';
  } else {
    profile.shinyCards.splice(idx, 1);
    btn.classList.remove('active');
    btn.textContent = 'Shiny';
    btn.title = 'Activar efecto shiny en partida';
  }
  saveProfile(profile);
}

// ── toggleHitoShinyDisplay (legacy compat) ────────────────
function toggleHitoShinyDisplay() {}

// ── Barra global de progreso ──────────────────────────────
function updateHitosGlobalBar() {
  const total    = HITOS_ALL_CARDS.filter(n => HITOS_DEF[n]?.trackKey).length;
  const done     = HITOS_ALL_CARDS.filter(n => isHitoDone(n)).length;
  const pct      = total > 0 ? (done / total) * 100 : 0;
  const fill     = document.getElementById('hitos-global-fill');
  const count    = document.getElementById('hitos-global-count');
  if (fill)  fill.style.width  = pct + '%';
  if (count) count.textContent = `${done} / ${total}`;
}

// ── checkHitosPostGame ────────────────────────────────────
function checkHitosPostGame(gameData) {
  const data = loadHitosProgress();
  const newlyCompleted = [];

  Object.entries(HITOS_DEF).forEach(([cardName, hdef]) => {
    if (!hdef.trackKey || !hdef.goal) return;
    if (data[hdef.trackKey + '_done']) return;
    const gained = gameData[hdef.trackKey] || 0;
    data[hdef.trackKey] = (data[hdef.trackKey] || 0) + gained;
    if (data[hdef.trackKey] >= hdef.goal) {
      data[hdef.trackKey + '_done'] = true;
      newlyCompleted.push({ cardName, hdef });
    }
  });

  saveHitosProgress(data);

  newlyCompleted.forEach(({ cardName, hdef }) => {
    applyHitoReward(cardName, hdef);
  });

  return newlyCompleted;
}

// ── Recompensas ───────────────────────────────────────────
function applyHitoReward(cardName, hdef) {
  if (hdef.rewardTitle) {
    if (!PLAYER_TITLES.includes(hdef.rewardTitle)) PLAYER_TITLES.push(hdef.rewardTitle);
    const profile = loadProfile();
    if (!profile.unlockedTitles) profile.unlockedTitles = [];
    if (!profile.unlockedTitles.includes(hdef.rewardTitle)) profile.unlockedTitles.push(hdef.rewardTitle);
    saveProfile(profile);
  }
  if (hdef.rewardShinyCard) {
    const profile = loadProfile();
    if (!profile.shinyCards) profile.shinyCards = [];
    if (!profile.shinyCards.includes(hdef.rewardShinyCard)) profile.shinyCards.push(hdef.rewardShinyCard);
    saveProfile(profile);
  }
}

// ── Toast ─────────────────────────────────────────────────
let _hitoToastTimer = null;
function showHitoToast(cardName, hdef) {
  const toast = document.getElementById('hito-toast');
  if (!toast) return;
  document.getElementById('hito-toast-name').textContent = cardName;
  const parts = [];
  if (hdef.rewardTitle)     parts.push(`${window.CURRENT_LANG==='en'?'Title':window.CURRENT_LANG==='ja'?'称号':'Título'}: "${getTranslatedTitle(hdef.rewardTitle)}"`);
  if (hdef.rewardShinyCard) parts.push(`✦ ${hdef.rewardShinyCard} brillante`);
  document.getElementById('hito-toast-reward').textContent = parts.join('  ·  ');
  toast.classList.add('show');
  if (_hitoToastTimer) clearTimeout(_hitoToastTimer);
  _hitoToastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
}

// ── collectHitoGameData ───────────────────────────────────
function collectHitoGameData(spacesResult) {
  const gameData = { nuguVsErizo: 0 };
  if (!G || !G.spaces) return gameData;

  // Nugu hito
  for (let i = 0; i < 3; i++) {
    const space  = G.spaces[i];
    const result = spacesResult ? spacesResult[i] : null;
    if (result && result.winner === 0) {
      const playerHasNugu = space.slots[0].some(c => c && c.name === 'Nugu');
      const rivalErizoCount = space.slots[1].filter(c => c && c.name === 'ErizoPeluche').length;
      if (playerHasNugu && rivalErizoCount >= 2) gameData.nuguVsErizo++;
    }
  }

  const up = G.unlockProgress || {};

  // Determine overall winner (used by multiple hitos below)
  const spaceWins = (spacesResult || []).filter(r => r.winner === 0).length;
  const spaceLoss = (spacesResult || []).filter(r => r.winner === 1).length;
  const playerWon = spaceWins > spaceLoss;

  // Imi hito: player won the game AND Imi broke ties in all 3 spaces
  {
    if (playerWon && (up.imiTiebreakCount || 0) >= 3) gameData.imiTripleTiebreak = 1;
    else gameData.imiTripleTiebreak = 0;
  }

  // Koly hito: blocked removal ≥2 times this game
  gameData.kolyProtectTwice = (up._kolyProtectCount || 0) >= 2 ? 1 : 0;

  // Chiouri hito
  gameData.chiouriHighRivalWin = up.chiouriWonVsHigh ? 1 : 0;

  // Gena hito
  gameData.genaChiouriWin = up.genaChiouriDoubleWin ? 1 : 0;

  // Fukou hito
  gameData.fukouTripleErizo = up.fukouTripleErizo ? 1 : 0;

  // Ramia hito
  gameData.ramiaStolenNugu = up.ramiaStoleNugu ? 1 : 0;

  // Reina hito
  gameData.reinaFurtivaSteals6 = up.reinaFurtivaSteals6 ? 1 : 0;

  // Ziru hito
  gameData.ziruStoleReki = up.ziruStoleReki ? 1 : 0;

  // Mugon hito
  gameData.kolyProtectedMugon = up.kolyProtectedMugon ? 1 : 0;

  // Gran Demonio hito
  gameData.granDemonioTaxistaMasPoderoso = up.granDemonioTaxistaMasPoderoso ? 1 : 0;

  // Slau hito "Justicia ciega" (nuevo)
  gameData.slauJusticiaWon = up.slauJusticiaWon ? 1 : 0;

  // Hanoe hito "Admirador de las nubes"
  gameData.hanoeMaxValue = (up.hanoeMaxValue || 0) >= 8 ? 1 : 0;

  // Faun hito "Trasnochador"
  gameData.faunTurn7PlusTwo = up.faunTurn7PlusTwo ? 1 : 0;

  // Yukoi hito "Melodía sorda"
  gameData.yukoiBoostedTwoSameTurn = up.yukoiBoostedTwoSameTurn ? 1 : 0;

  // Abaki hito "Investigador afortunado"
  // Abaki triggered AND at game end player's Abaki and Miria are in the same space
  {
    let abakiHito = 0;
    const triggeredSpaces = up._abakiTriggeredSpaces || [];
    if (triggeredSpaces.length > 0) {
      for (let i = 0; i < 3; i++) {
        const playerSlots = G.spaces[i].slots[0];
        const hasAbaki = playerSlots.some(c => c && c.name === 'Abaki' && !c.faceDown);
        const hasMiria = playerSlots.some(c => c && c.name === 'Miria' && !c.faceDown);
        if (hasAbaki && hasMiria && triggeredSpaces.includes(i)) { abakiHito = 1; break; }
      }
    }
    gameData.abakiInvestigadorAfortunado = abakiHito;
  }

  // Mimimi hito "Primer paso"
  // Player manually placed Mimimi (no auto-trigger) and won that space
  {
    let mimimiHito = 0;
    const spIdx = up._mimimiManualSpaceIdx;
    if (spIdx !== undefined && spIdx >= 0 && spacesResult) {
      const result = spacesResult[spIdx];
      if (result && result.winner === 0) mimimiHito = 1;
    }
    gameData.mimimiPrimerPaso = mimimiHito;
  }

  // Hobu hito "Trabajo fácil"
  // Player's Hobu disabled 3 rival exist-cards in one game
  gameData.hobuTrabajoPacil = (up.hobuDisabledExistCount || 0) >= 3 ? 1 : 0;

  // Yiren hito "Baile tradicional"
  // Player's Yiren was placed in all 3 spaces
  {
    const visited = up.yirenSpacesVisited || [];
    gameData.yirenBaileTradicional = (visited.length >= 3 && visited.includes(0) && visited.includes(1) && visited.includes(2)) ? 1 : 0;
  }

  // Tira hito "Estratega espía"
  // No Su used, Tira placed T1, and every turn after T1 a condMet-type card was successfully activated
  {
    let tiraHito = 0;
    if (up._tiraPlacedT1 && !up._tiraHadSu) {
      const successTurns = up._tiraCondSuccessTurns ? [...up._tiraCondSuccessTurns] : [];
      // maxTurns-1 turns to cover (T2..T7 for a 7-turn game)
      const maxT = G.maxTurns || 7;
      const needed = maxT - 1;
      if (successTurns.length >= needed) tiraHito = 1;
    }
    gameData.tiraEstrategaEspia = tiraHito;
  }

  // Demae hito "Chapuzas"
  // Win the game with player's Demae in a "no pueden ser movidas" space
  {
    let demaeHito = 0;
    if (playerWon) {
      for (let i = 0; i < 3; i++) {
        const space = G.spaces[i];
        const hasDemae = space.slots[0].some(c => c && c.name === 'Demae' && !c.faceDown);
        const hasEffect = space.effectRevealed && space.effectText && space.effectText.includes('Las cartas en este espacio no pueden ser movidas');
        if (hasDemae && hasEffect) { demaeHito = 1; break; }
      }
    }
    gameData.demaeChabuzas = demaeHito;
  }

  // Feruzu hito "1 vs. 1": player's Feruzu removed a rival Kakomi
  gameData.feruzuRemovedKakomi = up.feruzuRemovedKakomi ? 1 : 0;

  // Kakomi hito "Extripaalmas": player's Kakomi removed a rival Slau
  gameData.kakomiremovedSlau = up.kakomiremovedSlau ? 1 : 0;

  // Soi hito "Pirómano del amor": Menmei drew 2 cards with Soi active AND player won
  {
    const spaceWinsSoi = (spacesResult || []).filter(r => r.winner === 0).length;
    const spaceLossSoi = (spacesResult || []).filter(r => r.winner === 1).length;
    const playerWonSoi = spaceWinsSoi > spaceLossSoi;
    gameData.soiMenmeiDrawTwoWin = (up.soiMenmeiDrawTwo && playerWonSoi) ? 1 : 0;
  }

  // Tanozo hito "Mal de ojo": 3+ rival cards lost their effect via player's Tanozo
  gameData.tanozoThreeDisabled = up.tanozoThreeDisabled ? 1 : 0;

  // Foret hito "Perversión respetable": player discarded Foret from a space with player's Nugu
  gameData.foretDiscardedWithNugu = up.foretDiscardedWithNugu ? 1 : 0;

  // Tanna hito "Caja de sorpresas": Tanna effect activated + Mimimi auto-placed same space same turn
  gameData.tannaMimimiSameTurn = up.tannaMimimiSameTurn ? 1 : 0;

  // Peroth hito "Dios de los pecados": player's Peroth pulled Mugon from discard pile
  gameData.perothPlacedMugon = up.perothPlacedMugon ? 1 : 0;

  // Henos hito "Niño interior": after Henos both hands were empty
  gameData.henosBothHandsEmpty = up.henosBothHandsEmpty ? 1 : 0;

  // Miria hito "Huésped de la desdicha": player's Miria discarded Abaki
  gameData.miriaDiscardedAbaki = up.miriaDiscardedAbaki ? 1 : 0;

  // Ekuro hito "Artista incomprendido": Ekuro placed T1, never used sacrifice
  gameData.ekuroT1NoSacrifice = (up.ekuroT1Placed && !up.ekuroSacrificeUsed) ? 1 : 0;

  // Filia hito "Campanero gélido": player won a space with both Filia and Chiouri in it
  {
    let filiaHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      const playerSlots = G.spaces[i].slots[0];
      const hasFilia   = playerSlots.some(c => c && c.name === 'Filia'   && !c.faceDown);
      const hasChiouri = playerSlots.some(c => c && c.name === 'Chiouri' && !c.faceDown);
      if (hasFilia && hasChiouri) { filiaHito = 1; break; }
    }
    gameData.filiaChiouriWonSpace = filiaHito;
  }

  // Naiki hito "Exigente en modales": deck empty before T4 with Naiki on board
  gameData.naikiDeckEmptyBefore4 = up.naikiDeckEmptyBefore4 ? 1 : 0;

  // Kaeka hito "Corazón roto": player's Kaeka ends game with 0 total value
  {
    let kaekaHito = 0;
    for (let i = 0; i < 3; i++) {
      const playerSlots = G.spaces[i].slots[0];
      const kaeka = playerSlots.find(c => c && c.name === 'Kaeka' && !c.faceDown);
      if (kaeka) {
        const total = kaeka.baseValue + (kaeka.powerBonus||0) + (kaeka.existBonus||0);
        if (total <= 0) { kaekaHito = 1; break; }
      }
    }
    gameData.kaekaZeroValue = kaekaHito;
  }

  // Miboro hito "Veterano en las escondidas": player's Miboro revealed by space fog effect
  gameData.miboroRevealedInFogSpace = up.miboroRevealedInFogSpace ? 1 : 0;

  // En hito "Optimista": player's En ends game with 6+ total value
  {
    let enHito = 0;
    for (let i = 0; i < 3; i++) {
      const playerSlots = G.spaces[i].slots[0];
      const enCard = playerSlots.find(c => c && c.name === 'En' && !c.faceDown);
      if (enCard) {
        const total = enCard.baseValue + (enCard.powerBonus||0) + (enCard.existBonus||0);
        if (total >= 6) { enHito = 1; break; }
      }
    }
    gameData.enSixOrMore = enHito;
  }

  // Ponce hito "Romeo y Julieta": rival removed player's Ponce
  gameData.ponceRemovedByRival = up.ponceRemovedByRival ? 1 : 0;

  // Mega hito "Santa esperanza": boosted in all 3 losing spaces + won all 3
  {
    const boosted = up._megaBoostedSpaces || [];
    const allThreeBoosted = boosted.includes(0) && boosted.includes(1) && boosted.includes(2);
    const wonAll3 = spacesResult && spacesResult.every(r => r.winner === 0);
    gameData.megaThreeLostBoostedWon = (allThreeBoosted && wonAll3) ? 1 : 0;
  }

  // Etza hito "Ídolo": player has Etza on board and won all 3 spaces
  {
    const etzaOnBoard = G.spaces.some(sp => sp.slots[0].some(c => c && c.name === 'Etza' && !c.faceDown));
    const wonAll3 = spacesResult && spacesResult.every(r => r.winner === 0);
    gameData.etzaWonAllThree = (etzaOnBoard && wonAll3) ? 1 : 0;
  }

  // Gae hito "Masajista cauto": player won a space with both Gae and Humi in it
  {
    let gaeHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      const slots = G.spaces[i].slots[0];
      const hasGae  = slots.some(c => c && c.name === 'Gae'  && !c.faceDown);
      const hasHumi = slots.some(c => c && c.name === 'Humi' && !c.faceDown);
      if (hasGae && hasHumi) { gaeHito = 1; break; }
    }
    gameData.gaeHumiWonSpace = gaeHito;
  }

  // Iona hito "Lobo solitario": player won a space with ONLY Iona (no other player cards)
  {
    let ionaHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      const slots = G.spaces[i].slots[0].filter(c => c && !c.faceDown);
      if (slots.length === 1 && slots[0].name === 'Iona') { ionaHito = 1; break; }
    }
    gameData.ionaAloneWonSpace = ionaHito;
  }

  // Zao hito "Lobo ladrador, poco mordedor": had Zao with 3 rivals in space and lost it
  {
    let zaoHito = 0;
    const zaoSp = up._zaoThreeRivalsSpaceIdx;
    if (zaoSp !== undefined && zaoSp >= 0 && spacesResult) {
      if (spacesResult[zaoSp].winner === 1) zaoHito = 1;
    }
    gameData.zaoThreeRivalsLost = zaoHito;
  }

  // Humi hito "Envidioso": lost a space with Humi due to rival Imi tiebreak
  gameData.humiLostToImiTiebreak = up.humiLostToImiTiebreak ? 1 : 0;

  // Neutra hito "Coleccionista": Destinada Nugu+Neutra + Neutra swapped rival ErizoPeluche
  gameData.neutraDestinadaSwapErizo = up.neutraDestinadaSwapErizo ? 1 : 0;

  // Resta hito "Completamente relajado": player won a space with Resta in it
  {
    let restaHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      if (G.spaces[i].slots[0].some(c => c && c.name === 'Resta' && !c.faceDown)) { restaHito = 1; break; }
    }
    gameData.restaWonSpace = restaHito;
  }

  // Suma hito "Amor materno": Suma was extinguished, player won all 3 spaces, and used no V0 cards
  {
    const sumaExtinct = up._sumaEverExtinct || false;
    const wonAll3 = spacesResult && spacesResult.every(r => r.winner === 0);
    const noV0Used = !up._sumaUsedV0;
    gameData.sumaExtinctWonAll3 = (sumaExtinct && wonAll3 && noV0Used) ? 1 : 0;
  }

  // Una hito "Sueño lúcido": Reki and Una both in same player space at game end
  {
    let unaHito = 0;
    for (let i = 0; i < 3; i++) {
      const slots = G.spaces[i].slots[0];
      const hasUna  = slots.some(c => c && c.name === 'Una'  && !c.faceDown);
      const hasReki = slots.some(c => c && c.name === 'Reki' && !c.faceDown);
      if (hasUna && hasReki) { unaHito = 1; break; }
    }
    gameData.unaRekiSameSpace = unaHito;
  }

  // ErizoPeluche hito "Peluche": player wins game with Fukou and Nugu in different spaces
  {
    let erizoHito = 0;
    if (playerWon) {
      let fukouSpace = -1, nuguSpace = -1;
      for (let i = 0; i < 3; i++) {
        const slots = G.spaces[i].slots[0];
        if (slots.some(c => c && c.name === 'Fukou' && !c.faceDown)) fukouSpace = i;
        if (slots.some(c => c && c.name === 'Nugu'  && !c.faceDown)) nuguSpace  = i;
      }
      if (fukouSpace !== -1 && nuguSpace !== -1 && fukouSpace !== nuguSpace) erizoHito = 1;
    }
    gameData.erizoFukouNuguDistinct = erizoHito;
  }

  // Ery hito "Peluche de Autoridad": Nofi, Menmei and Ery each in different spaces, and all 3 of those spaces won
  {
    let eryHito = 0;
    let nofiSp = -1, menmeiSp = -1, erySp = -1;
    for (let i = 0; i < 3; i++) {
      const slots = G.spaces[i].slots[0];
      if (slots.some(c => c && c.name === 'Nofi'   && !c.faceDown)) nofiSp   = i;
      if (slots.some(c => c && c.name === 'Menmei' && !c.faceDown)) menmeiSp = i;
      if (slots.some(c => c && c.name === 'Ery'    && !c.faceDown)) erySp    = i;
    }
    if (nofiSp !== -1 && menmeiSp !== -1 && erySp !== -1 &&
        nofiSp !== menmeiSp && nofiSp !== erySp && menmeiSp !== erySp &&
        spacesResult && spacesResult[nofiSp].winner === 0 &&
        spacesResult[menmeiSp].winner === 0 && spacesResult[erySp].winner === 0) eryHito = 1;
    gameData.eryNofiMenmeiDistinct3 = eryHito;
  }

  // Gatito hito "Inevitable": player won a space with Reiza in it
  {
    let gatitoHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      if (G.spaces[i].slots[0].some(c => c && c.name === 'Reiza' && !c.faceDown)) { gatitoHito = 1; break; }
    }
    gameData.gatitoReizaWonSpace = gatitoHito;
  }

  // Tis+Usei hito "La gravedad"/"El destino": Kope removed allied Nugu → Usei+Tis extinguished via Real
  gameData.tisUseiFiredByKopeNugu = up.tisUseiFiredByKopeNugu ? 1 : 0;

  // Nasu hito "¿El huevo o la gallina?": rival AI used Destinada in player's Nasu space
  gameData.nasuRivalDestinadaHere = up.nasuRivalDestinadaHere ? 1 : 0;

  // Su hito "Escéptico": Su + Ery + ErizoPeluche all in same player space at game end
  {
    let suHito = 0;
    for (let i = 0; i < 3; i++) {
      const slots = G.spaces[i].slots[0];
      const hasSu    = slots.some(c => c && c.name === 'Su'           && !c.faceDown);
      const hasEry   = slots.some(c => c && c.name === 'Ery'          && !c.faceDown);
      const hasErizo = slots.some(c => c && c.name === 'ErizoPeluche' && !c.faceDown);
      if (hasSu && hasEry && hasErizo) { suHito = 1; break; }
    }
    gameData.suEryErizoSameSpace = suHito;
  }

  // Rasu hito "Déjà vu": Rasu + Su + Ery all in same player space at game end
  {
    let rasuHito = 0;
    for (let i = 0; i < 3; i++) {
      const slots = G.spaces[i].slots[0];
      const hasRasu = slots.some(c => c && c.name === 'Rasu' && !c.faceDown);
      const hasSu   = slots.some(c => c && c.name === 'Su'   && !c.faceDown);
      const hasEry  = slots.some(c => c && c.name === 'Ery'  && !c.faceDown);
      if (hasRasu && hasSu && hasEry) { rasuHito = 1; break; }
    }
    gameData.rasuSuErySameSpace = rasuHito;
  }

  // Tei hito "La existencia": placed a V1-as-V0 in a V0-extinguish space
  gameData.teiPlacedV1InExtinctSpace = up.teiPlacedV1InExtinctSpace ? 1 : 0;

  // Roloc hito "El color": player's Roloc propagated a V0-extinguish effect
  gameData.rolocPropagatedExtinct = up.rolocPropagatedExtinct ? 1 : 0;

  // Reki hito "El sueño": player won a Real space with Reki in it
  {
    let rekiHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!isRealSpace(i)) continue;
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      if (G.spaces[i].slots[0].some(c => c && c.name === 'Reki')) { rekiHito = 1; break; }
    }
    gameData.rekiWonRealSpace = rekiHito;
  }

  // Reiza hito "Niegavalores": player won a space with both Reiza and Gatito in it
  {
    let reizaHito = 0;
    for (let i = 0; i < 3; i++) {
      if (!spacesResult || spacesResult[i].winner !== 0) continue;
      const slots = G.spaces[i].slots[0];
      const hasReiza  = slots.some(c => c && c.name === 'Reiza'  && !c.faceDown);
      const hasGatito = slots.some(c => c && c.name === 'Gatito' && !c.faceDown);
      if (hasReiza && hasGatito) { reizaHito = 1; break; }
    }
    gameData.reizaGatitoWonSpace = reizaHito;
  }

  // Yuta hito "El tiempo": changed a losing space that ended up won
  {
    let yutaHito = 0;
    const yutaSpaces = up._yutaChangedSpaces || [];
    for (const entry of yutaSpaces) {
      if (entry.wasLosing && entry.lastTurn && spacesResult && spacesResult[entry.spaceIdx].winner === 0) {
        yutaHito = 1; break;
      }
    }
    gameData.yutaTurnedLostToWon = yutaHito;
  }

  // Kope hito "Buscador de la felicidad": Kope removed allied V1 triggering Usei → Real space
  gameData.kopeKilledAllyTriggeredUsei = up.kopeKilledAllyTriggeredUsei ? 1 : 0;

  // Menmei hito "Gato curioso": drew Su via Menmei then placed Su in V0-extinguish space
  gameData.menmeiSuInExtinctSpace = up.menmeiSuInExtinctSpace ? 1 : 0;

  // Nofi hito "Ambientalista": Nofi, Ery and Menmei all in the same space at game end
  {
    let nofiHito = 0;
    for (let i = 0; i < 3; i++) {
      const slots = G.spaces[i].slots[0];
      const hasNofi   = slots.some(c => c && c.name === 'Nofi'   && !c.faceDown);
      const hasEry    = slots.some(c => c && c.name === 'Ery'    && !c.faceDown);
      const hasMenmei = slots.some(c => c && c.name === 'Menmei' && !c.faceDown);
      if (hasNofi && hasEry && hasMenmei) { nofiHito = 1; break; }
    }
    gameData.nofiEryMenmeiSameSpace = nofiHito;
  }

  // Tenpoh hito "Miope": player placed Tenpoh from discard via Peroth
  gameData.tenpohPlacedFromDiscard = up.tenpohPlacedFromDiscard ? 1 : 0;

  // Noira hito "Decorador": all player's face-up allied cards end game with exactly 2 total value, and Noira is on the board
  {
    let noiraHito = 0;
    const noiraOnBoard = G.spaces.some(sp => sp.slots[0].some(c => c && c.name === 'Noira' && !c.faceDown));
    if (noiraOnBoard) {
      const allAllies = [];
      for (let i = 0; i < 3; i++)
        G.spaces[i].slots[0].forEach(c => { if (c && !c.faceDown) allAllies.push(c); });
      if (allAllies.length > 0 && allAllies.every(c => {
        const total = c.baseValue + (c.powerBonus||0) + (c.existBonus||0);
        return total === 2;
      })) noiraHito = 1;
    }
    gameData.noiraAllAlliesValueTwo = noiraHito;
  }

  // Moira hito: "Jugada invisible" — activated Usei's effect via Moira
  gameData.moiraUseiHitoActivated = up.moiraUseiHitoActivated ? 1 : 0;

  return gameData;
}

// ── Hook fin de partida ───────────────────────────────────
function _hitoHookEndGame() {
  try {
    if (G && G.spaces) {
      const spacesResult = [0,1,2].map(i => computeSpaceScore(i));
      const gameData = collectHitoGameData(spacesResult);
      const newlyCompletedHitos = checkHitosPostGame(gameData);

      // ── Añadir hitos completados al panel end-unlocks ──
      if (newlyCompletedHitos && newlyCompletedHitos.length > 0) {
        const unlocksPanel = document.getElementById('end-unlocks-panel');
        const unlocksList  = document.getElementById('end-unlocks-list');
        const unlocksLabel = document.getElementById('end-unlocks-label');
        if (!unlocksPanel || !unlocksList || !unlocksLabel) return;

        newlyCompletedHitos.forEach(({ cardName, hdef }) => {
          const div = document.createElement('div');
          div.className = 'end-unlock-card end-unlock-hito';

          const badge = document.createElement('div');
          badge.className = 'end-unlock-deck-badge end-hito-badge';
          badge.textContent = window.CURRENT_LANG === 'en' ? '✦ MILESTONE' : window.CURRENT_LANG === 'ja' ? '✦ 実績' : '✦ HITO';
          div.appendChild(badge);

          const imgWrap = document.createElement('div');
          const img = document.createElement('img');
          img.src = `./ilustraciones/${cardName}.jpg`;
          img.className = 'end-unlock-img';
          img.draggable = false;
          img.onerror = () => imgWrap.style.display = 'none';
          imgWrap.appendChild(img);
          div.appendChild(imgWrap);

          const nameEl = document.createElement('div');
          nameEl.className = 'end-unlock-name';
          nameEl.textContent = cardName;
          div.appendChild(nameEl);

          if (hdef.condition) {
            const condEl = document.createElement('div');
            condEl.className = 'end-unlock-hito-cond';
            const full = hdef.condition || '';
            condEl.textContent = full.length > 72 ? full.slice(0, 69) + '\u2026' : full;
            div.appendChild(condEl);
          }

          const rewardParts = [];
          const _rl = window.CURRENT_LANG || 'es';
          if (hdef.rewardTitle)     rewardParts.push(_rl==='en' ? `Title: "${getTranslatedTitle(hdef.rewardTitle)}"` : _rl==='ja' ? `称号:「${getTranslatedTitle(hdef.rewardTitle)}」` : `Título: "${hdef.rewardTitle}"`);
          if (hdef.rewardShinyCard) rewardParts.push(_rl==='en' ? `✦ ${hdef.rewardShinyCard} shiny` : _rl==='ja' ? `✦ ${hdef.rewardShinyCard} キラ` : `✦ ${hdef.rewardShinyCard} brillante`);
          if (rewardParts.length > 0) {
            const rewEl = document.createElement('div');
            rewEl.className = 'end-unlock-hito-reward';
            rewEl.textContent = rewardParts.join(' · ');
            div.appendChild(rewEl);
          }

          unlocksList.appendChild(div);
        });

        // Actualizar el label del panel para incluir hitos
        // Recontamos todos los tipos presentes en la lista para construir el label correctamente
        const hitoCount = newlyCompletedHitos.length;
        const cartaItems   = unlocksList.querySelectorAll('.end-unlock-card:not(.deck-unlock):not(.end-unlock-hito):not(.end-unlock-curi)').length;
        const mazoItems    = unlocksList.querySelectorAll('.deck-unlock').length;
        const curiItems    = unlocksList.querySelectorAll('.end-unlock-curi').length;
        const labelParts = [];
        const _ll = window.CURRENT_LANG || 'es';
        if (_ll === 'en') {
          if (cartaItems  > 0) labelParts.push(`${cartaItems} card${cartaItems !== 1 ? 's' : ''}`);
          if (mazoItems   > 0) labelParts.push(`${mazoItems} deck${mazoItems !== 1 ? 's' : ''}`);
          if (curiItems   > 0) labelParts.push(`${curiItems} curiosit${curiItems !== 1 ? 'ies' : 'y'}`);
          if (hitoCount   > 0) labelParts.push(`${hitoCount} milestone${hitoCount !== 1 ? 's' : ''}`);
          unlocksLabel.textContent = labelParts.join(' & ') + ' unlocked!';
        } else if (_ll === 'ja') {
          if (cartaItems  > 0) labelParts.push(`カード${cartaItems}枚`);
          if (mazoItems   > 0) labelParts.push(`デッキ${mazoItems}個`);
          if (curiItems   > 0) labelParts.push(`豆知識${curiItems}件`);
          if (hitoCount   > 0) labelParts.push(`実績${hitoCount}件`);
          unlocksLabel.textContent = labelParts.join('・') + 'を解放！';
        } else {
          if (cartaItems  > 0) labelParts.push(`${cartaItems} carta${cartaItems !== 1 ? 's' : ''}`);
          if (mazoItems   > 0) labelParts.push(`${mazoItems} mazo${mazoItems !== 1 ? 's' : ''}`);
          if (curiItems   > 0) labelParts.push(`${curiItems} curiosidad${curiItems !== 1 ? 'es' : ''}`);
          if (hitoCount   > 0) labelParts.push(`${hitoCount} hito${hitoCount !== 1 ? 's' : ''}`);
          const totalItems2 = cartaItems + mazoItems + curiItems + hitoCount;
          const newLabel = labelParts.length > 0
            ? '¡' + labelParts.join(' y ') + ` desbloqueado${totalItems2 !== 1 ? 's' : ''}!`
            : '¡' + hitoCount + ` hito${hitoCount !== 1 ? 's' : ''} desbloqueado${hitoCount !== 1 ? 's' : ''}!`;
          unlocksLabel.textContent = newLabel;
        }

        unlocksPanel.dataset.pendingReveal = '1';
        if (!unlocksPanel.classList.contains('revealed')) {
          setTimeout(() => unlocksPanel.classList.add('revealed'), 300);
        }
      }
    }
  } catch(e) { console.warn('Hitos hook error:', e); }
}

// ── Tiempo de inicio global para sincronizar animaciones shiny ───
const _shinyEpoch = Date.now();

// ── applyShinyIfUnlocked ──────────────────────────────────
function applyShinyIfUnlocked(cardEl, cardName) {
  if (!cardEl || !cardName) return;
  try {
    const profile = loadProfile();
    const shinyCards = profile.shinyCards || [];
    if (shinyCards.includes(cardName)) {
      // Delay negativo sincronizado: todas las cartas shiny comparten la misma fase,
      // así colocar una nueva carta no reinicia visualmente las animaciones existentes.
      const borderDur = 3.5;
      const swipeDur  = 4.5;
      const elapsed = (Date.now() - _shinyEpoch) / 1000;
      cardEl.style.setProperty('--shiny-delay',       (-((elapsed % borderDur))).toFixed(3) + 's');
      cardEl.style.setProperty('--shiny-swipe-delay', (-((elapsed % swipeDur))).toFixed(3)  + 's');
      cardEl.classList.add('card-shiny');
      if (!cardEl.querySelector('.shiny-badge')) {
        const badge = document.createElement('span');
        badge.className = 'shiny-badge';
        badge.dataset.name = cardName;
        // [Cambiado] las rayas son ahora una imagen en pixel art (ver --rayas-shiny en destellos.js)
        cardEl.appendChild(badge);
      }
      if (false && !cardEl.querySelector('.shiny-corner-img')) {   // [Quitado] pedido del autor: sin el corazón; basta con las rayas
        const cornerImg = document.createElement('img');
        cornerImg.className = 'shiny-corner-img';
        cornerImg.src = './Corazon-real.png';
        cornerImg.alt = '';
        cornerImg.draggable = false;
        cardEl.appendChild(cornerImg);
      }
    }
  } catch {}
}

// ── Cargar títulos de hitos al iniciar ────────────────────
(function _loadHitoTitles() {
  try {
    const profile = loadProfile();
    // Asegurar que todos los títulos base estén siempre disponibles
    const BASE_TITLES = [
      'Ignorante','Alcanzaestrellas','Costurero','Tramposo','Aspirante',
      'Desvelado','Detective','Cazahombres','Implacable','Ilustrador',
      'Modista','Expectante','Impaciente','Precursor','Pescador',
      'Diseñador','Realidad','Feriante','Pollito','Tsundere'
    ];
    BASE_TITLES.forEach(t => {
      if (!PLAYER_TITLES.includes(t)) PLAYER_TITLES.push(t);
    });
    // Cargar títulos desbloqueados guardados (hitos + cartas)
    (profile.unlockedTitles || []).forEach(t => {
      if (!PLAYER_TITLES.includes(t)) PLAYER_TITLES.push(t);
    });
  } catch {}
})();



// ── Escape para cerrar ────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('hitos-overlay')?.classList.contains('show')) {
      closeHitos();
    }
  }
}, true);
// ── Migración: corregir userLevel inflado por bug del fallback || 1 ──
// Si el jugador tiene userLevel >= 1 pero 0 partidas jugadas, resetear a 0
try {
  const _mp = loadProfile();
  const _totalGames = (_mp.wins || 0) + (_mp.losses || 0) + (_mp.draws || 0);
  if (_mp.userLevel >= 1 && _totalGames === 0) {
    _mp.userLevel = 0;
    _mp.xpSegments = 0;
    saveProfile(_mp);
  }
} catch(e) {}

showMenu();

// Apply saved options on load
setCardFontScale(OPTIONS.cardFontScale);
setMenuMusicVolume(OPTIONS.musicVolume);
setSfxVolume(OPTIONS.sfxVolume ?? 0.55);
setSpeedFactor(OPTIONS.speedFactor ?? 1);
applyHandRaised();
setHandOpacity(OPTIONS.handOpacity ?? 1);
applyMobileMode();

// Apply language translations on load
applyTranslations();
