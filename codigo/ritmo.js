/* Riña Divina — [Nuevo] RITMO: que dé tiempo a entender lo que pasa
   - RITMO_BASE: todas las pausas de la partida duran un poco más (encima del
     control de velocidad de Opciones, que sigue funcionando igual).
   - ritmoCartel: un cartel breve en el centro («Turno 3 de 6», «La IA revela»).
   - ritmoFocoCarta: la carta que se revela brilla un momento del color de su
     dueño (sin agrandarla: el hueco la recortaba).
   - Opción «Tocar para pasar las acciones una a una»: durante el revelado, cada
     acción espera a que el jugador toque la pantalla (o pulse Espacio/Intro).
   - ritmoAviso: ya no se usa; los efectos solo se ven en el historial. */
const RITMO_BASE = 1.4;
const RITMO_TXT = {
  es: { turno: 'Turno {n} de {t}', tu: 'Revelas tus cartas', ia: 'La IA revela', ultimo: 'Último turno', toca: 'Toca para continuar' },
  en: { turno: 'Turn {n} of {t}', tu: 'You reveal your cards', ia: 'The AI reveals', ultimo: 'Final turn', toca: 'Tap to continue' },
  ja: { turno: 'ターン {n} / {t}', tu: 'あなたのカードを公開', ia: 'AIが公開', ultimo: '最終ターン', toca: 'タップして続ける' },
};
function ritmoT(k){ return (RITMO_TXT[window.CURRENT_LANG] || RITMO_TXT.es)[k] || RITMO_TXT.es[k]; }
function ritmoMs(ms){ return ms * (OPTIONS.speedFactor || 1) * RITMO_BASE; }

/* cartel central que entra, se queda un momento y se va (no bloquea el clic) */
function ritmoCartel(texto, { ms = 1300, tipo = '', y = null } = {}){
  const el = document.createElement('div');
  el.className = 'ritmo-cartel ' + tipo;
  if (y !== null) el.style.top = y + 'px';   // [Nuevo] a una altura concreta (p. ej. junto a una mano)
  el.innerHTML = `<span class="rc-linea"></span><span class="rc-texto"></span><span class="rc-linea"></span>`;
  el.querySelector('.rc-texto').textContent = texto;
  document.body.appendChild(el);
  const dur = ritmoMs(ms);
  el.style.setProperty('--rc-dur', dur + 'ms');
  setTimeout(() => el.remove(), dur + 50);
  return new Promise(r => setTimeout(r, dur * .55));   // se puede esperar a que se lea, sin esperar a que desaparezca
}

/* la carta recién revelada, en primer plano un momento, con su efecto al lado */
function ritmoElementoCarta(sp, owner, sl){
  const spEl = document.querySelectorAll('#spaces-area .space')[sp]; if (!spEl) return null;
  const filas = spEl.querySelectorAll('.slots-row');
  const fila = owner === 1 ? filas[0] : filas[filas.length - 1];
  const slot = fila && fila.children[sl];
  return slot ? (slot.querySelector('.card-in-slot') || slot) : null;
}
async function ritmoFocoCarta(sp, owner, sl, card){
  const el = ritmoElementoCarta(sp, owner, sl);
  if (el) el.classList.add('ritmo-foco', owner === 0 ? 'rf-tuya' : 'rf-rival');
  if (OPTIONS.pasoAPaso) await ritmoEsperarToque();
  else { await new Promise(res => setTimeout(res, ritmoMs(650))); await ritmoSinZoom(); }
  if (el) el.classList.remove('ritmo-foco');
}

/* [Nuevo] «Tocar para pasar las acciones una a una» (solo contra la IA, sin conexión) */
function ritmoPasoAPaso(ms){
  return !!(OPTIONS.pasoAPaso && typeof G !== 'undefined' && G && G.phase === 'resolve' && ms >= 300);
}
let ritmoEsperando = null;
function ritmoEsperarToque(){
  if (ritmoEsperando) return ritmoEsperando.promesa;
  let aviso = document.getElementById('ritmo-toca');
  if (!aviso){ aviso = document.createElement('div'); aviso.id = 'ritmo-toca'; document.body.appendChild(aviso); }
  aviso.textContent = '▸ ' + ritmoT('toca');
  aviso.classList.add('show');
  let fin;
  const promesa = new Promise(res => { fin = res; });
  const seguir = ev => {
    if (ev.type === 'keydown' && !['Space', 'Enter', 'ArrowRight'].includes(ev.code)) return;
    // [Nuevo] mirar una carta (ampliarla) o usar un menú no cuenta como «seguir»
    if (ev.type === 'pointerdown' && (ritmoZoomAbierto() || (ev.target.closest && ev.target.closest('.card-in-slot, .hand-card, #card-zoom-overlay, #fab-menu, #hud-historial, #historial-panel, .modal, .modal-overlay, #log-modal')))) return;
    if (ev.type === 'keydown') ev.preventDefault();
    document.removeEventListener('pointerdown', seguir, true);
    document.removeEventListener('keydown', seguir, true);
    aviso.classList.remove('show');
    ritmoEsperando = null;
    fin();
  };
  setTimeout(() => {   // un momento antes de aceptar el toque: que no se salte sin querer
    document.addEventListener('pointerdown', seguir, true);
    document.addEventListener('keydown', seguir, true);
  }, 150);
  ritmoEsperando = { promesa };
  return promesa;
}

/* avisos de efectos: se apilan abajo a la izquierda y se van solos */
function ritmoAviso(msg, tipo){
  const pila = document.getElementById('ritmo-avisos') || (() => { const p = document.createElement('div'); p.id = 'ritmo-avisos'; document.body.appendChild(p); return p; })();
  const game = document.getElementById('screen-game');
  if (!game || getComputedStyle(game).display === 'none') return;
  const a = document.createElement('div');
  a.className = 'ritmo-aviso' + (tipo === 'real-log' ? ' real' : '');
  a.textContent = msg;
  pila.appendChild(a);
  while (pila.children.length > 3) pila.firstChild.remove();
  setTimeout(() => { a.classList.add('sale'); setTimeout(() => a.remove(), 400); }, ritmoMs(2600));
}

function ritmoCartelTurno(){
  const txt = G.turn >= G.maxTurns ? ritmoT('ultimo') : ritmoT('turno').replace('{n}', G.turn).replace('{t}', G.maxTurns);
  const tipo = G.turn >= G.maxTurns ? 'rc-ultimo' : '';
  if (!OPTIONS.pasoAPaso){ ritmoCartel(txt, { ms: 1300, tipo }); return; }
  // [Nuevo] paso a paso: el cartel se queda hasta que se toca la pantalla
  const el = document.createElement('div');
  el.className = 'ritmo-cartel fijo ' + tipo;
  el.innerHTML = `<span class="rc-linea"></span><span class="rc-texto"></span><span class="rc-linea"></span>`;
  el.querySelector('.rc-texto').textContent = txt;
  document.body.appendChild(el);
  ritmoEsperarToque().then(() => { el.classList.add('sale'); setTimeout(() => el.remove(), 400); });
}

/* [Nuevo] con una carta ampliada abierta, la partida espera a que se cierre */
function ritmoZoomAbierto(){ const z = document.getElementById('card-zoom-overlay'); return !!(z && z.classList.contains('show')); }
async function ritmoSinZoom(){ while (ritmoZoomAbierto()) await new Promise(r => setTimeout(r, 120)); }
