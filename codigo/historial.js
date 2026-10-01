/* Riña Divina — [Nuevo] HISTORIAL DESPLEGABLE
   En vez de la ventana modal, el historial se despliega hacia arriba desde el
   botón de abajo a la izquierda, en negro y blanco, con su barra de desplazamiento.
   No tapa el tablero ni para la partida: se puede dejar abierto mientras se juega.
   Los efectos ya no salen como avisos sueltos en pantalla; solo se ven aquí. */
(function(){
  const TXT = {
    es: { titulo: 'Historial', copiar: 'Copiar', copiado: 'Copiado', vacio: 'Todavía no ha pasado nada.' },
    en: { titulo: 'History',   copiar: 'Copy',   copiado: 'Copied',  vacio: 'Nothing has happened yet.' },
    ja: { titulo: '履歴',       copiar: 'コピー',  copiado: 'コピー済', vacio: 'まだ何も起きていません。' },
  };
  const tx = k => (TXT[window.CURRENT_LANG] || TXT.es)[k];

  const panel = document.createElement('div');
  panel.id = 'historial-panel';
  panel.innerHTML = `<div class="hp-cabecera"><span class="hp-titulo"></span><button type="button" class="hp-copiar"></button></div><div class="hp-lista"></div>`;
  document.body.appendChild(panel);
  const lista = panel.querySelector('.hp-lista');
  const btnCopiar = panel.querySelector('.hp-copiar');

  // [Nuevo] la carta que protagoniza cada línea: el primer nombre de carta que aparece en el texto
  let NOMBRES = null;
  const ALIAS = { 'Erizo de Peluche': 'ErizoPeluche' };
  function cartaDelMensaje(msg){
    if (!NOMBRES){
      const n = new Set([...(typeof CARD_DB !== 'undefined' ? Object.keys(CARD_DB) : []), ...(typeof TOKENS !== 'undefined' ? Object.keys(TOKENS) : []), ...Object.keys(ALIAS)]);
      NOMBRES = [...n].sort((a, b) => b.length - a.length).map(k => ({ k, re: new RegExp('(^|[^\\p{L}])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'u') }));
    }
    let mejor = null, pos = Infinity;
    for (const { k, re } of NOMBRES){ const m = re.exec(msg); if (m && m.index < pos){ pos = m.index; mejor = k; } }
    return mejor ? (ALIAS[mejor] || mejor) : null;
  }
  function abierto(){ return panel.classList.contains('abierto'); }
  function pintar(){
    panel.querySelector('.hp-titulo').textContent = tx('titulo');
    if (!btnCopiar.dataset.ok) btnCopiar.textContent = tx('copiar');
    const logs = (typeof G !== 'undefined' && G && G.logs) ? G.logs : [];
    const alFinal = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 30;
    lista.innerHTML = '';
    if (!logs.length){ const v = document.createElement('div'); v.className = 'hp-vacio'; v.textContent = tx('vacio'); lista.appendChild(v); }
    logs.forEach(e => {
      const d = document.createElement('div');
      d.className = 'hp-linea ' + (e.type || '');
      const n = cartaDelMensaje(e.msg);
      const mini = document.createElement(n ? 'img' : 'span');
      mini.className = 'hp-mini';
      if (n){ mini.src = './ilustraciones/' + n + '.jpg'; mini.alt = ''; mini.loading = 'lazy'; mini.title = n; mini.onerror = () => { mini.style.visibility = 'hidden'; }; }
      const txt = document.createElement('span'); txt.className = 'hp-texto'; txt.textContent = e.msg;
      d.append(mini, txt);
      lista.appendChild(d);
    });
    if (alFinal || !lista.dataset.visto) { lista.scrollTop = lista.scrollHeight; lista.dataset.visto = '1'; }
    alto();
  }
  function alto(){ document.body.style.setProperty('--hp-alto', (abierto() ? panel.offsetHeight + 10 : 0) + 'px'); }
  function abrir(){
    panel.classList.add('abierto'); document.body.classList.add('historial-abierto');
    delete lista.dataset.visto; pintar(); setTimeout(alto, 320);
    const hb = document.getElementById('hud-historial'); if (hb) hb.classList.add('activo');
  }
  function cerrar(){
    panel.classList.remove('abierto'); document.body.classList.remove('historial-abierto');
    document.body.style.setProperty('--hp-alto', '0px');
    const hb = document.getElementById('hud-historial'); if (hb) hb.classList.remove('activo');
  }
  btnCopiar.addEventListener('click', () => {
    const texto = ((typeof G !== 'undefined' && G && G.logs) || []).map(e => e.msg).join('\n');
    const listo = () => { btnCopiar.dataset.ok = '1'; btnCopiar.textContent = tx('copiado'); setTimeout(() => { delete btnCopiar.dataset.ok; btnCopiar.textContent = tx('copiar'); }, 1400); };
    (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject()).then(listo).catch(() => {
      const ta = document.createElement('textarea'); ta.value = texto; ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); listo();
    });
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && abierto()) cerrar(); });

  // sustituyen a las funciones de la ventana modal (juego.js las sigue llamando igual)
  window.openLogModal = function(){ abierto() ? cerrar() : abrir(); };
  window.closeLogModal = cerrar;
  window.renderLogEntries = function(){ if (abierto()) pintar(); };
  window.refreshLogModal = window.renderLogEntries;
  window.historialAbierto = abierto;
  // cada línea nueva del registro se añade al momento si está abierto
  const addLogOriginal = window.addLog;
  window.addLog = function(msg, type){ addLogOriginal(msg, type); if (abierto()) pintar(); };
})();
