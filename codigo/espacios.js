/* Riña Divina — [Nuevo] ESPACIOS
   Indicador de quién gana cada espacio (sustituye a la barra de tensión):
   dice siempre quién va ganando y POR QUÉ (más Valor, desempate por cartas de
   Valor 0, por el efecto del espacio, por Imi…), para que se entienda de un vistazo. */
const ESP_TXT = {
  es: { tu: 'Ganas tú', ia: 'Gana la IA', empate: 'Empate', vacio: 'Sin cartas',
        valor: 'más Valor', v0: 'desempate: más Valor 0', v1cero: 'desempate: más Valor 1 a 0',
        solo: 'el rival no tiene cartas', imi: 'desempata Imi', efecto: 'por el efecto', real: 'por Real', global: 'suma de los 3 espacios' },
  en: { tu: 'You win', ia: 'AI wins', empate: 'Tie', vacio: 'No cards',
        valor: 'more Value', v0: 'tiebreak: more Value 0', v1cero: 'tiebreak: more Value 1 at 0',
        solo: 'opponent has no cards', imi: 'Imi breaks the tie', efecto: 'by the effect', real: 'by Real', global: 'sum of all 3 spaces' },
  ja: { tu: 'あなたが優勢', ia: 'AIが優勢', empate: '引き分け', vacio: 'カードなし',
        valor: '価値が上', v0: '同点：価値0が多い', v1cero: '同点：価値0の価値1が多い',
        solo: '相手にカードなし', imi: 'イミが決着', efecto: '効果による', real: 'レアルによる', global: '3空間の合計' },
};
function espT(k){ return (ESP_TXT[window.CURRENT_LANG] || ESP_TXT.es)[k] || ESP_TXT.es[k]; }

function motivoVictoria(idx, sc){
  const sp = G.spaces[idx];
  if (sc.winner === -1) return null;
  if (sp.blocked) return 'real';
  const effs = typeof getActiveEffects === 'function' ? getActiveEffects(idx) : [];
  if (effs.some(e => e.includes('más cartas con menos valor') || e.includes('más cartas de valor 0 tenga') || (e.includes('más personajes tenga') && !isGlobalScoring()))) return 'efecto';
  const resta = [0, 1].some(s => sp.slots[s].some(c => c && c.name === 'Resta' && !c.faceDown && !c.effectDisabled));
  if (resta) return 'imi';
  const vis = s => sp.slots[s].filter(c => c && !c.faceDown && c.name !== 'Reiza' && c.name !== 'Resta');
  if (!vis(1 - sc.winner).length) return 'solo';
  if (sc.p0 !== sc.p1) return 'valor';
  const v0 = s => vis(s).filter(c => c.baseValue === 0).length;
  if (v0(0) !== v0(1)) return 'v0';
  const v1c = s => vis(s).filter(c => c.baseValue !== 0 && getCardPower(c) <= 0).length;
  if (v1c(0) !== v1c(1)) return 'v1cero';
  return 'imi';
}

/* corona en pixel art (7×5) */
const PX_CORONA = ['#..#..#', '##.#.##', '#######', '#######', '.#####.'];
const PX_CORONA_URL = {};
function pxCorona(color){
  return PX_CORONA_URL[color] || (PX_CORONA_URL[color] = pxLienzo(PX_CORONA, { '#': color }).toDataURL());
}

/* va en la fila de la puntuación, entre las dos cifras (sin ocupar más alto) */
function indicadorGanador(loc, idx, sc, global){
  const hayCartas = [0, 1].some(s => G.spaces[idx].slots[s].some(c => c && !c.faceDown));
  const el = document.createElement('span');
  const w = sc.winner;
  el.className = 'ganador-espacio ' + (w === 0 ? 'ge-tu' : w === 1 ? 'ge-ia' : hayCartas ? 'ge-empate' : 'ge-vacio');
  let titulo = hayCartas ? espT('empate') : '', motivo = '';
  if (w === 0 || w === 1){
    titulo = espT(w === 0 ? 'tu' : 'ia');
    const m = global ? 'global' : motivoVictoria(idx, sc);
    motivo = m ? espT(m) : '';
  }
  el.innerHTML = (w === 0 || w === 1 ? `<img class="ge-corona" src="${pxCorona(w === 0 ? '#8fbfff' : '#ff8a80')}" alt="">` : '')
    + `<span class="ge-titulo"></span>` + (motivo ? `<span class="ge-motivo"></span>` : '');
  el.querySelector('.ge-titulo').textContent = titulo;
  if (motivo){ el.querySelector('.ge-motivo').textContent = motivo; el.title = titulo + ' · ' + motivo; }
  const fila = loc.querySelector('.space-score');
  const mid = fila && fila.querySelector('.score-mid');
  if (mid) mid.replaceWith(el); else if (fila) fila.appendChild(el);
}

/* ══════════════════════════════════════════════════════════════════════
   REALIDADES QUE TIÑEN LOS ESPACIOS
   Los espacios empiezan neutros (sin efecto). Cuando se revela una Realidad
   (un personaje de Valor 0), cae como una gota en el centro de su espacio,
   salpica y lo tiñe de su color: el espacio pasa a tener el efecto de esa
   Realidad. La primera que llega predomina: las siguientes ya no lo cambian.

   ► Los personajes de Valor 0 son de tipo «Realidad»: su efecto ES el efecto
     que dan al espacio. Las que tienen efecto: null están pendientes; mientras
     tanto conservan su efecto de carta de siempre y no tiñen.
   ► Reki no tiñe: salen partículas moradas y anula el efecto de un espacio
     (lo eliges tú; la IA elige el suyo). Una intercambia su efecto con el de
     otro espacio (teñido o no).
   ► Para cambiar un texto hay que tocar también juego.js si es una regla
     nueva (el motor reconoce los efectos por su texto).
   ► Colores por tipo de Realidad: la Existencia negra (Tei, Tis), el Color
     blanco (Roloc, Moira, Reiza, Usei), el Sueño morado oscuro (Reki, Yuta) y
     el Espacio, uno distinto cada una. Son también los marcos de la mano.
   ► En Opciones se puede volver a los efectos de espacio clásicos (al azar). */
const REALIDADES = {
  // Existencia (negro)
  Tei:    { color: '#1b1724', grupo: 'Existencia', efecto: 'Si una carta de Valor 1 es removida o extinguida aquí, vuelve a otro espacio como Valor 0.',
            en: 'If a Value 1 card is removed or extinguished here, it returns to another space as Value 0.', ja: 'ここで価値1のカードが除去または消滅したら、価値0として別の空間に戻る。' },
  Tis:    { color: '#1b1724', grupo: 'Existencia', efecto: 'La primera carta colocada desde la mano de cada jugador en este espacio es extinguida.',
            en: 'The first card each player places here from their hand is extinguished.', ja: '各プレイヤーが手札からこの空間に最初に置いたカードは消滅する。' },
  // Color (blanco)
  Roloc:  { color: '#f2f2f2', grupo: 'Color', efecto: 'Todos los efectos de espacio se aplican en el resto de espacios.',
            en: 'All space effects apply to the other spaces too.', ja: 'すべての空間の効果が他の空間にも適用される。' },
  Moira:  { color: '#f2f2f2', grupo: 'Color', efecto: 'No se puede activar Colocación Destinada.',
            en: 'Destined Placement cannot be activated.', ja: '運命配置は発動できない。' },
  Reiza:  { color: '#f2f2f2', grupo: 'Color', efecto: 'Aquí sólo cuenta quien más cartas de valor 0 tenga.',
            en: 'Here only the one with more Value 0 cards counts.', ja: 'ここでは価値0のカードが多い方だけが数える。' },
  Usei:   { color: '#f2f2f2', grupo: 'Color', efecto: 'El valor de los espacios ya no va por separado.',
            en: 'The value of the spaces is no longer counted separately.', ja: '空間の価値はもう別々に数えない。' },
  // Sueño (morado oscuro)
  Reki:   { color: '#4a2370', grupo: 'Sueño', especial: 'reki', efecto: 'Ignora todos los efectos y deshabilita el efecto de un espacio sin extinguir.',
            en: 'Ignores all effects and disables the effect of a space without being extinguished.', ja: 'すべての効果を無視し、消滅せずに空間の効果を一つ無効にする。' },
  Yuta:   { color: '#4a2370', grupo: 'Sueño', especial: 'yuta', efecto: 'Copia el efecto de otro espacio por el de este.',
            en: 'Copies the effect of another space onto this one.', ja: '別の空間の効果をこの空間に写す。' },
  // Espacio (uno cada una)
  Nasu:   { color: '#f5dc3a', grupo: 'Espacio', efecto: 'Los jugadores deben jugar aquí hasta que no puedan.',
            en: 'Players must play here until they can\'t.', ja: 'プレイヤーはできなくなるまでここにプレイしなければならない。' },
  Su:     { color: '#3a7fe0', grupo: 'Espacio', efecto: 'Tus aliados se activan sin condición de si colocó, o no, aquí.',
            en: 'Your allies activate regardless of whether the opponent played here or not.', ja: '味方は相手がここにプレイしたかどうかに関係なく発動する。' },
  Rasu:   { color: '#8e1c24', grupo: 'Espacio', efecto: 'Al final de cada ronda, este espacio atrae la última carta colocada en los espacios de al lado, si hay hueco.',
            en: 'At the end of each round, this space pulls in the last card placed in the neighbouring spaces, if there is room.', ja: '各ラウンドの終わりに、隣の空間に最後に置かれたカードを、空きがあればこの空間に引き寄せる。' },
  Neutra: { color: '#3fae4a', grupo: 'Espacio', efecto: 'Quien coloque una carta aquí roba una carta.',
            en: 'Whoever places a card here draws a card.', ja: 'ここにカードを置いた者はカードを1枚引く。' },
  Resta:  { color: '#f08a24', grupo: 'Espacio', efecto: 'Las cartas aquí valen 0.',
            en: 'Cards here are worth 0.', ja: 'ここのカードの価値は0。' },
  Suma:   { color: '#9b4fd6', grupo: 'Espacio', efecto: 'Las cartas de valor 0 tienen +1 valor aquí.',
            en: 'Value 0 cards have +1 value here.', ja: 'ここでは価値0のカードは価値+1。' },
  Una:    { color: '#8d8d95', grupo: 'Espacio', especial: 'una', efecto: 'Intercambia el efecto de este espacio con el de otro.',
            en: 'Swap the effect of this space with another one.', ja: 'この空間の効果を別の空間と入れ替える。' },
};
const REAL_TXT = {
  es: { neutro: 'Espacio neutro', neutroSub: 'Lo teñirá la primera Realidad (Valor 0) que se revele aquí.', de: 'Realidad de {n}', anulado: 'Anulado por Reki' },
  en: { neutro: 'Neutral space', neutroSub: 'The first Reality (Value 0) revealed here will tint it.', de: '{n}’s Reality', anulado: 'Disabled by Reki' },
  ja: { neutro: '中立の空間', neutroSub: 'ここで最初に公開された現実（価値0）が色を与える。', de: '{n}の現実', anulado: 'レキにより無効' },
};
function realT(k){ return (REAL_TXT[window.CURRENT_LANG] || REAL_TXT.es)[k] || REAL_TXT.es[k]; }
function modoRealidades(){ return true; }   // [Cambiado] solo hay Realidades (los efectos clásicos ya no se usan)
/* el color de un espacio sale de la Realidad a la que pertenece su efecto
   (así, si Una o Yuta cambian el efecto, el color lo sigue) */
function realidadDeEfecto(texto){
  if (!texto) return null;
  for (const n in REALIDADES) if (REALIDADES[n].efecto === texto) return n;
  return null;
}

/* esfera en pixel art (16×16), del color de la Realidad (como las del minijuego) */
const PX_GOTA_CACHE = {};
function pxGota(color){
  if (PX_GOTA_CACHE[color]) return PX_GOTA_CACHE[color];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const C = hex(color), claro = '#' + C.map(v => Math.round(v + (255 - v) * .6).toString(16).padStart(2, '0')).join('');
  return PX_GOTA_CACHE[color] = pxEsfera(color, claro);
}
const PX_GOTA_URL = {};
function pxGotaUrl(color){ return PX_GOTA_URL[color] || (PX_GOTA_URL[color] = pxGota(color).toDataURL()); }

/* la esfera cae al centro del espacio, salpica y hace ondas; luego se tiñe */
function gotaRealidad(sp, color){
  return new Promise(resolve => {
    const spEl = document.querySelectorAll('#spaces-area .space')[sp];
    const loc = spEl && spEl.querySelector('.space-location');
    if (!loc){ resolve(); return; }
    const r = loc.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const esc = 3, gota = pxGota(color);
    const g = document.createElement('img');
    g.src = gota.toDataURL(); g.className = 'gota-realidad';
    g.style.width = gota.width * esc + 'px'; g.style.height = gota.height * esc + 'px';
    g.style.left = (cx - gota.width * esc / 2) + 'px'; g.style.top = (cy - gota.height * esc / 2) + 'px';
    document.body.appendChild(g);
    const ms = v => Math.round(v * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));
    const caida = Math.max(160, r.top + 60);
    const anim = g.animate([
      { transform: `translateY(${-caida}px)`, opacity: 0 },
      { transform: `translateY(${-caida * .8}px)`, opacity: 1, offset: .12 },
      { transform: 'translateY(0) scale(1, 1)', offset: .86 },
      { transform: 'translateY(4px) scale(1.35, .6)', opacity: 1, offset: .94 },
      { transform: 'translateY(4px) scale(1.9, .2)', opacity: 0 },
    ], { duration: ms(520), easing: 'cubic-bezier(.55,0,.9,.55)', fill: 'forwards' });
    anim.onfinish = () => {
      g.remove();
      try { playSound('gotaRealidad'); } catch (e) {}
      // ondas en pixel art (anillos que se abren y se apagan)
      for (let k = 0; k < 3; k++){
        const o = document.createElement('div'); o.className = 'onda-realidad';
        o.style.left = cx + 'px'; o.style.top = cy + 'px'; o.style.setProperty('--c', color);
        document.body.appendChild(o);
        o.animate([{ width: '8px', height: '3px', opacity: 1 }, { width: (r.width * (1 - k * .18)) + 'px', height: (r.height * .42 * (1 - k * .18)) + 'px', opacity: 0 }],
          { duration: ms(900), delay: ms(k * 140), easing: 'steps(9, end)', fill: 'forwards' }).onfinish = () => o.remove();
      }
      // salpicadura: gotitas cuadradas que saltan en arco
      for (let k = 0; k < 12; k++){
        const p = document.createElement('div'); p.className = 'salpica-realidad'; p.style.background = color;
        const tam = 3 + (k % 3) * 2; p.style.width = p.style.height = tam + 'px';
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        document.body.appendChild(p);
        const ang = Math.PI * (1.05 + .9 * (k / 11)) + (Math.random() - .5) * .25;
        const dist = 30 + Math.random() * 55, alto = 30 + Math.random() * 45;
        const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * .45;
        p.animate([
          { transform: 'translate(0,0)', opacity: 1 },
          { transform: `translate(${dx * .55}px, ${dy - alto}px)`, opacity: 1, offset: .45 },
          { transform: `translate(${dx}px, ${dy + 10}px)`, opacity: 0 },
        ], { duration: ms(620), easing: 'linear', fill: 'forwards' }).onfinish = () => p.remove();
      }
      setTimeout(resolve, ms(260));
    };
  });
}

async function realidadTine(sp, owner, card){
  if (!modoRealidades()) return;
  const R = REALIDADES[card.name]; if (!R || !R.efecto) return;   // pendiente: sin efecto de espacio todavía
  if (R.especial === 'reki') return rekiAnula(sp, owner, card);
  const space = G.spaces[sp];
  if (!space || space.blocked || space._realActive || space.effectText || space._rekiAnulado) return;   // la primera predomina
  // [Corregido] primero se ve la carta girada y revelada; después cae la gota
  render();
  await new Promise(r => setTimeout(r, Math.round(650 * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1))));
  await gotaRealidad(sp, R.color);
  space.effectText = R.efecto;
  space.effectRevealed = true;
  space._tinteNuevo = true;
  addLog(`${card.name} tiñe el Espacio ${sp + 1}: «${R.efecto}»`, 'effect');
  render();
  await gameSleep(500);
  if (R.especial === 'una') await unaIntercambia(sp, owner);
  if (R.especial === 'yuta') await yutaCopia(sp, owner);
  if (typeof applySpaceOnReveal === 'function') await applySpaceOnReveal(sp);
  render();
}

/* elegir un espacio: tú, tocándolo; la IA, al azar entre los que le sirven */
function realElegirEspacio(owner, candidatos, texto){
  if (!candidatos.length) return Promise.resolve(-1);
  // [Nuevo] partida con un amigo: si elige el amigo, se le pregunta a él (en_linea.js)
  if (owner === 1 && typeof rdHumano === 'function' && rdHumano(1) && typeof rdPreguntarEspacio === 'function') return rdPreguntarEspacio(candidatos, texto);
  if (owner !== 0 || typeof spacePickState === 'undefined') return Promise.resolve(candidatos[Math.floor(Math.random() * candidatos.length)]);
  return new Promise(res => {
    const aviso = document.createElement('div'); aviso.className = 'ritmo-cartel fijo real-elige';
    aviso.innerHTML = '<span class="rc-linea"></span><span class="rc-texto"></span><span class="rc-linea"></span>';
    aviso.querySelector('.rc-texto').textContent = texto;
    document.body.appendChild(aviso);
    spacePickState = { filterFn: i => candidatos.includes(i), resolve: i => { aviso.remove(); res(i); } };
    render();
  });
}
const REAL_ELIGE = {
  es: { una: 'Una: elige el espacio con el que intercambiar', reki: 'Reki: elige el espacio que anular', yuta: 'Yuta: elige el espacio cuyo efecto copiar' },
  en: { una: 'Una: choose the space to swap with', reki: 'Reki: choose the space to disable', yuta: 'Yuta: choose the space whose effect to copy' },
  ja: { una: 'ウナ：入れ替える空間を選ぶ', reki: 'レキ：無効にする空間を選ぶ', yuta: 'ユタ：効果を写す空間を選ぶ' },
};
function realEligeT(k){ return (REAL_ELIGE[window.CURRENT_LANG] || REAL_ELIGE.es)[k]; }

/* Una: su efecto se intercambia con el de otro espacio ya teñido (si lo hay) */
async function unaIntercambia(sp, owner){
  // [Cambio] vale cualquier otro espacio (teñido o no); si es neutro, este queda neutro y aquel se queda con el efecto de Una
  const otros = [0, 1, 2].filter(i => i !== sp && !G.spaces[i].blocked && !G.spaces[i]._rekiAnulado);
  if (!otros.length){ addLog('Una: no hay otro espacio con el que intercambiar.', 'effect'); return; }
  const destino = await realElegirEspacio(owner, otros, realEligeT('una'));
  if (destino < 0) return;
  const a = G.spaces[sp], b = G.spaces[destino];
  [a.effectText, b.effectText] = [b.effectText, a.effectText];
  a.effectRevealed = !!a.effectText; b.effectRevealed = !!b.effectText;
  a._tinteNuevo = b._tinteNuevo = true;
  addLog(`Una intercambia el efecto del Espacio ${sp + 1} con el del Espacio ${destino + 1}.`, 'effect');
  try { playSound('spaceChange'); } catch (e) {}
  render();
  await gameSleep(500);
  if (typeof applySpaceOnReveal === 'function') await applySpaceOnReveal(destino);
}

/* [Nuevo] Yuta: este espacio pasa a tener una copia del efecto de otro espacio con efecto
   (el otro lo conserva). Si no hay ninguno, se queda con el texto de Yuta, que no hace nada. */
async function yutaCopia(sp, owner){
  const otros = [0, 1, 2].filter(i => i !== sp && !G.spaces[i].blocked && !G.spaces[i]._rekiAnulado && G.spaces[i].effectText);
  if (!otros.length){ addLog('Yuta: no hay ningún otro espacio con efecto que copiar.', 'effect'); return; }
  const origen = await realElegirEspacio(owner, otros, realEligeT('yuta'));
  if (origen < 0) return;
  const a = G.spaces[sp], b = G.spaces[origen];
  motasMoradas(origen, 1000); motasMoradas(sp, 1400);
  a.effectText = b.effectText; a.effectRevealed = true; a._tinteNuevo = true;
  addLog(`Yuta copia en el Espacio ${sp + 1} el efecto del Espacio ${origen + 1}: «${a.effectText}».`, 'effect');
  try { playSound('spaceChange'); } catch (e) {}
  render();
  await gameSleep(500);
}

/* Reki: partículas moradas y anula el efecto de un espacio (queda neutro para siempre) */
async function rekiAnula(sp, owner, card){
  motasMoradas(sp, 1400);
  await gameSleep(400);
  const cands = [0, 1, 2].filter(i => !G.spaces[i].blocked && !G.spaces[i]._rekiAnulado);
  if (!cands.length) return;
  // la IA prefiere anular un espacio con efecto
  const conEfecto = cands.filter(i => G.spaces[i].effectText);
  const destino = await realElegirEspacio(owner, owner === 0 ? cands : (conEfecto.length ? conEfecto : cands), realEligeT('reki'));
  if (destino < 0) return;
  const esp = G.spaces[destino];
  motasMoradas(destino, 1800);
  const antes = esp.effectText;
  esp.effectText = ''; esp.effectRevealed = false; esp._rekiAnulado = true;
  if (esp.slotCount && (esp.slotCount[0] < 3 || esp.slotCount[1] < 3)) esp.slotCount = [3, 3];
  addLog(antes ? `Reki anula el efecto del Espacio ${destino + 1} («${antes}»).` : `Reki anula el Espacio ${destino + 1}: ya no se podrá teñir.`, 'effect');
  render();
  await gameSleep(600);
}

/* motas moradas que suben desde el centro de un espacio (como las de la Tienda de la novela) */
function motasMoradas(sp, ms, rect, n = 34){
  const spEl = rect ? null : document.querySelectorAll('#spaces-area .space')[sp]; if (!rect && !spEl) return;
  const r = rect || spEl.getBoundingClientRect();
  const dur = Math.round(ms * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));
  for (let k = 0; k < n; k++){
    const m = document.createElement('div'); m.className = 'mota-morada';
    const t = 3 + (k % 3) * 2; m.style.width = m.style.height = t + 'px';
    m.style.left = (r.left + r.width * (.12 + Math.random() * .76)) + 'px';
    m.style.top = (r.top + r.height * (.35 + Math.random() * .5)) + 'px';
    document.body.appendChild(m);
    const sube = 60 + Math.random() * 140, lado = (Math.random() - .5) * 40;
    m.animate([
      { transform: 'translate(0,0)', opacity: 0 },
      { transform: `translate(${lado * .3}px,${-sube * .2}px)`, opacity: .95, offset: .2 },
      { transform: `translate(${lado}px,${-sube}px)`, opacity: 0 },
    ], { duration: dur * (.7 + Math.random() * .5), delay: Math.random() * dur * .35, easing: 'ease-out', fill: 'both' }).onfinish = () => m.remove();
  }
}

/* ---- las cartas de Valor 0 pasan a ser de tipo «Realidad» (con su efecto de espacio) ---- */
const REAL_ORIGINAL = {};
function realAplicarCartas(){
  if (typeof CARD_DB === 'undefined') return;
  const tr = typeof CARD_TRANSLATIONS !== 'undefined' ? CARD_TRANSLATIONS : null;
  for (const n in REALIDADES){
    const R = REALIDADES[n], c = CARD_DB[n]; if (!c || !R.efecto) continue;
    if (!REAL_ORIGINAL[n]) REAL_ORIGINAL[n] = { type: c.type, effect: c.effect, en: tr && tr.en[n] && tr.en[n].effect, ja: tr && tr.ja[n] && tr.ja[n].effect };
    const O = REAL_ORIGINAL[n], on = modoRealidades();
    c.type = on ? 'realidad' : O.type;
    c.effect = on ? R.efecto : O.effect;
    if (tr && tr.en[n]) tr.en[n].effect = on ? (R.en || R.efecto) : O.en;
    if (tr && tr.ja[n]) tr.ja[n].effect = on ? (R.ja || R.efecto) : O.ja;
  }
  // traducción del efecto cuando está en un espacio
  if (typeof SPACE_EFFECTS_EN !== 'undefined') for (const n in REALIDADES){ const R = REALIDADES[n]; if (R.efecto){ SPACE_EFFECTS_EN[R.efecto] = R.en || R.efecto; SPACE_EFFECTS_JA[R.efecto] = R.ja || R.efecto; } }
}
realAplicarCartas();
(function(){
  // al crear cada carta: las Realidades con efecto nuevo ya no hacen su efecto de carta antiguo
  // (Reki sí conserva «ignora todos los efectos»)
  if (typeof mkCard === 'function'){
    const orig = mkCard;
    window.mkCard = function(name){
      const c = orig.apply(this, arguments);
      if (c && c.type === 'realidad' && name !== 'Reki') c.effectDisabled = true;
      return c;
    };
  }
  if (typeof startGame === 'function'){
    const orig = startGame;
    window.startGame = function(){ realAplicarCartas(); return orig.apply(this, arguments); };
  }
})();

/* los espacios empiezan neutros (modo Realidades) */
(function(){
  if (typeof initGame !== 'function') return;
  const original = initGame;
  window.initGame = function(){
    const r = original.apply(this, arguments);
    if (modoRealidades() && G && G.spaces) G.spaces.forEach(s => { s.effectText = ''; s.effectRevealed = false; });
    return r;
  };
})();

/* color del espacio y rótulo de la Realidad, encima de lo que dibuja juego.js */
(function(){
  if (typeof buildSpaceEl !== 'function') return;
  const original = buildSpaceEl;
  window.buildSpaceEl = function(idx){
    const el = original.apply(this, arguments);
    const space = G.spaces[idx];
    if (!modoRealidades() || !space) return el;
    const loc = el.querySelector('.space-location');
    const eff = el.querySelector('.space-effect-text');
    const nombre = !space.blocked ? realidadDeEfecto(space.effectText) : null;
    if (nombre){
      const col = REALIDADES[nombre].color;
      el.classList.add('espacio-tenido');
      el.style.setProperty('--tinte', col);
      const luz = typeof pxLuz === 'function' ? pxLuz(col) : .5;
      el.style.setProperty('--tinte-texto', luz > .6 ? '#15121c' : '#ffffff');
      el.style.setProperty('--tinte-contorno', luz > .6 ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.9)');
      el.style.setProperty('--tinte-borde', luz < .2 ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.55)');
      if (space._tinteNuevo){ el.classList.add('tinte-entra'); delete space._tinteNuevo; }
      if (eff){   // esfera del color de la Realidad delante del efecto (el nombre, al pasar el ratón)
        const gota = document.createElement('img'); gota.className = 'realidad-gota'; gota.alt = '';
        gota.src = pxGotaUrl(col);
        eff.insertBefore(gota, eff.firstChild);
        eff.title = realT('de').replace('{n}', nombre);
      }
    } else if (space._rekiAnulado && eff){
      el.classList.add('espacio-anulado');
      eff.textContent = realT('anulado');
    } else if (!space.blocked && !space.effectText && eff){
      el.classList.add('espacio-neutro');
      eff.textContent = '';   // neutro: sin texto
    }
    return el;
  };
})();

/* ══════ REKI: pisadas sobre Real y aparición en la mano ══════ */
/* Cuando alguien coloca a Reki en un espacio con Real, sus pisadas (las de la
   novela y el minijuego) cruzan el blanco hasta el hueco; las ven los dos.
   Que Reki aparezca en una mano solo lo ve quien la tiene (juego.js). */
const REKI_HUELLA = ['.XX.', 'XXXX', 'XXXX', 'XXXX', '.XX.', '....', '.XX.', '.XX.'];
let REKI_HUELLA_URL = null;
function rekiHuellaUrl(){
  if (REKI_HUELLA_URL) return REKI_HUELLA_URL;
  return REKI_HUELLA_URL = pxLienzo(REKI_HUELLA, { X: '#0b0a0c' }).toDataURL();
}
let REKI_SONIDO = null;
function rekiSonarHuella(){
  try {
    if (!REKI_SONIDO) REKI_SONIDO = new Audio('./reki-huella.mp3');
    const a = REKI_SONIDO.cloneNode(); a.volume = Math.min(1, (OPTIONS.sfxVolume ?? .55) * .9); a.playbackRate = .92 + Math.random() * .16; a.play().catch(() => {});
  } catch (e) {}
}
function rekiPisadas(sp, sl, owner = 0){
  const spEl = document.querySelectorAll('#spaces-area .space')[sp]; if (!spEl) return;
  const filas = spEl.querySelectorAll('.slots-row'), fila = owner === 0 ? filas[filas.length - 1] : filas[0];
  const slot = fila && fila.children[sl]; if (!slot) return;
  const rs = spEl.getBoundingClientRect(), rt = slot.getBoundingClientRect();
  const x1 = rt.left + rt.width / 2, y1 = rt.top + rt.height * (owner === 0 ? .35 : .65);
  const x0 = rs.left + rs.width * (.25 + Math.random() * .5), y0 = owner === 0 ? rs.top + rs.height * .08 : rs.bottom - rs.height * .08;
  const ang = Math.atan2(y1 - y0, x1 - x0), N = 4, S = 3;
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const paso = Math.max(28, Math.hypot(x1 - x0, y1 - y0) / (N + .5));
  const ms = v => Math.round(v * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));
  for (let i = 0; i < N; i++){
    const d = Math.hypot(x1 - x0, y1 - y0) - (N - 1 - i) * paso, lado = (i % 2 ? 1 : -1) * 7;
    const x = x0 + Math.cos(ang) * d + nx * lado, y = y0 + Math.sin(ang) * d + ny * lado;
    const h = document.createElement('img'); h.className = 'reki-huella'; h.src = rekiHuellaUrl(); h.alt = '';
    h.style.width = 4 * S + 'px'; h.style.height = 8 * S + 'px';
    h.style.left = (x - 2 * S) + 'px'; h.style.top = (y - 4 * S) + 'px';
    h.style.transform = `rotate(${ang + Math.PI / 2}rad) scaleX(${i % 2 ? -1 : 1})`;
    document.body.appendChild(h);
    const aparece = ms(i * 500), funde = ms((N - 1) * 500 + 700 + i * 300);
    setTimeout(() => { h.style.opacity = '1'; rekiSonarHuella(); }, aparece);
    setTimeout(() => { h.style.opacity = '0'; setTimeout(() => h.remove(), 400); }, funde);
  }
}
// Reki acaba de revelarse: se ve la carta boca arriba y luego sus pisadas cruzan Real hasta ella
async function rekiAlRevelar(sp, sl, owner, card){
  delete card._rekiPisadas;
  if (!G.spaces[sp] || !G.spaces[sp].blocked) return;
  render();
  await gameSleep(350);
  rekiPisadas(sp, sl, owner);
  await gameSleep(1500);
}
(function(){
  if (typeof placeCard === 'function'){
    const orig = placeCard;
    window.placeCard = function(card, owner, spaceIdx, slotIdx){
      const r = orig.apply(this, arguments);
      try {
        // [Cambio] las pisadas las ven los dos jugadores, la coloque quien la coloque
        // [Cambio] boca abajo: las pisadas esperan a que se revele (rekiAlRevelar, desde revealOwnerCards)
        if (card && card.name === 'Reki' && G.spaces[spaceIdx] && G.spaces[spaceIdx].blocked){
          if (card.faceDown) card._rekiPisadas = true;
          else setTimeout(() => rekiPisadas(spaceIdx, slotIdx, owner), 60);
        }
      } catch (e) {}
      return r;
    };
  }
  // Reki aparece en tu mano: estallido de motas moradas alrededor de la carta
  if (typeof triggerRekiApparition === 'function'){
    const orig = triggerRekiApparition;
    window.triggerRekiApparition = async function(player, idx){
      if (player === 0){
        const el = document.querySelectorAll('#hand-cards .hand-card')[idx];
        if (el){
          const r = el.getBoundingClientRect();
          const zona = { left: r.left - 20, top: r.top + r.height * .2, width: r.width + 40, height: r.height * .6 };
          motasMoradas(-1, 1500, zona, 40);
          setTimeout(() => { const e2 = document.querySelectorAll('#hand-cards .hand-card')[idx]; if (e2){ const r2 = e2.getBoundingClientRect(); motasMoradas(-1, 1700, { left: r2.left - 30, top: r2.top, width: r2.width + 60, height: r2.height * .8 }, 50); } }, Math.round(430 * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1)));
        }
      }
      return orig.apply(this, arguments);
    };
  }
})();


/* ══════════════════════════════════════════════════════════════════════
   [Nuevo] TEI, RASU Y SUMA (Realidades) — y de dónde sale cada carta
   ══════════════════════════════════════════════════════════════════════ */
const TXT_TEI = 'Si una carta de Valor 1 es removida o extinguida aquí',
      TXT_RASU = 'este espacio atrae la última carta colocada',
      TXT_SUMA = 'Las cartas de valor 0 tienen +1 valor aquí';
let ORDEN_COLOCADA = 0;
const SITIO_CARTA = new Map();   // carta → { sp, owner } según el último vistazo al tablero
function realMirarTablero(){
  if (typeof G === 'undefined' || !G || !G.spaces) return;
  SITIO_CARTA.clear();
  G.spaces.forEach((esp, sp) => [0, 1].forEach(o => esp.slots[o].forEach(c => { if (c) SITIO_CARTA.set(c, { sp, owner: o }); })));
}
function espacioCon(texto, sp){ return typeof getActiveEffects === 'function' && getActiveEffects(sp).some(e => e.includes(texto)); }
function huecoLibre(sp, owner){ const e = G.spaces[sp]; if (!e || e.blocked) return -1; return e.slots[owner].findIndex((x, i) => x === null && i < e.slotCount[owner]); }
function slotEl(sp, owner, sl){
  const spEl = document.querySelectorAll('#spaces-area .space')[sp]; if (!spEl) return null;
  const filas = spEl.querySelectorAll('.slots-row'), fila = owner === 0 ? filas[filas.length - 1] : filas[0];
  return fila ? fila.querySelectorAll('.slot')[sl] : null;
}

/* Tei: un Valor 1 removido o extinguido en su espacio vuelve a OTRO espacio como Valor 0 */
function teiRevisa(card, pila){
  try {
    if (!modoRealidades() || !card || card.baseValue !== 1 || card.isToken) return;
    const sitio = SITIO_CARTA.get(card); if (!sitio) return;
    if (G.spaces.some(e => e.slots[0].includes(card) || e.slots[1].includes(card))) return;   // sigue en el tablero (no ha salido)
    if (!espacioCon(TXT_TEI, sitio.sp)) return;
    const owner = sitio.owner;
    const destinos = [0, 1, 2].filter(i => i !== sitio.sp && !(typeof isRealSpace === 'function' && isRealSpace(i)) && huecoLibre(i, owner) !== -1);
    if (!destinos.length){ addLog(`Tei: ${card.name} no encuentra hueco en otro espacio.`, 'effect'); return; }
    const dest = destinos[Math.floor(Math.random() * destinos.length)], sl = huecoLibre(dest, owner);
    const i = pila.lastIndexOf(card); if (i !== -1) pila.splice(i, 1);
    card.baseValue = 0; card.value = 0; card._teiForced0 = true; card.faceDown = false;
    SITIO_CARTA.delete(card);
    placeCard(card, owner, dest, sl, false, true);
    addLog(`Tei: ${card.name} prevalece y vuelve al Espacio ${dest + 1} como Valor 0.`, 'effect');
    setTimeout(() => {
      render();
      const el = slotEl(dest, owner, sl);
      if (el){ const r = el.getBoundingClientRect(); motasMoradas(-1, 1300, r, 26); el.animate([{ filter: 'brightness(2.2)' }, { filter: 'brightness(1)' }], { duration: 700 }); }
      try { playSound('valorUp'); } catch (e) {}
    }, 30);
  } catch (e) { console.warn('Tei', e); }
}

/* Rasu: al final de cada ronda atrae (de cada jugador) la última carta colocada en los espacios de al lado */
async function rasuAtrae(){
  if (!modoRealidades() || !G || !G.spaces) return;
  for (let sp = 0; sp < 3; sp++){
    if (!espacioCon(TXT_RASU, sp) || G.spaces[sp].blocked) continue;
    const vecinos = [sp - 1, sp + 1].filter(i => i >= 0 && i < 3);
    for (const owner of [0, 1]){
      const sl = huecoLibre(sp, owner); if (sl === -1) continue;
      let mejor = null;
      vecinos.forEach(v => G.spaces[v].slots[owner].forEach((c, k) => {
        if (c && !c.faceDown && (c._ordenColocada || 0) > ((mejor && mejor.c._ordenColocada) || 0)) mejor = { c, v, k };
      }));
      if (!mejor) continue;
      if (G.spaces[mejor.v].effectText && G.spaces[mejor.v].effectText.includes('no pueden ser movidas')) continue;
      const desde = slotEl(mejor.v, owner, mejor.k), hasta = slotEl(sp, owner, sl);
      const r0 = desde && desde.getBoundingClientRect(), r1 = hasta && hasta.getBoundingClientRect();
      G.spaces[mejor.v].slots[owner][mejor.k] = null;
      G.spaces[sp].slots[owner][sl] = mejor.c;
      mejor.c._movedThisTurn = true;
      addLog(`Rasu: el Espacio ${sp + 1} atrae a ${mejor.c.name} desde el Espacio ${mejor.v + 1}.`, 'effect');
      try { playSound('rasuNeutraMove'); } catch (e) {}
      if (r0 && r1 && typeof animateFlyCard === 'function'){ render(); const _h = slotEl(sp, owner, sl); const el = _h && (_h.querySelector('.card-in-slot') || (_h.classList.contains('card-in-slot') ? _h : null)); if (el) el.style.visibility = 'hidden';   /* [Cambio] solo se esconde la carta: el hueco (tierra o tela) sigue a la vista */ await animateFlyCard(r0, r1, Math.round(420 * (OPTIONS.speedFactor || 1))); if (el) el.style.visibility = ''; }
      if (typeof checkHanoe === 'function'){ checkHanoe(owner, mejor.v); checkHanoe(owner, sp); }
      if (typeof applyExistEffects === 'function') applyExistEffects();
      render();
      await gameSleep(350);
    }
  }
}

/* Suma: los Valor 0 de su espacio muestran su +1 (en azul) */
function sumaPinta(){
  if (!modoRealidades() || !G || !G.spaces) return;
  G.spaces.forEach((esp, sp) => {
    if (!espacioCon(TXT_SUMA, sp) || espacioCon('Las cartas aquí valen 0', sp)) return;
    [0, 1].forEach(o => esp.slots[o].forEach((c, k) => {
      if (!c || c.faceDown || c.baseValue !== 0 || c.name === 'Reiza' || c.name === 'Resta') return;
      const el = slotEl(sp, o, k), v = el && el.querySelector('.cf-value');
      if (v && !v.classList.contains('con-medalla')){ v.textContent = '1'; v.style.color = 'var(--blue, #4477cc)'; v.title = 'Suma: +1'; }
    }));
  });
}

(function(){
  if (typeof placeCard === 'function'){
    const orig = placeCard;
    window.placeCard = function(card, owner, spaceIdx, slotIdx, faceDown, fromEffect){
      if (card){ card._desdeMano = !fromEffect; card._ordenColocada = ++ORDEN_COLOCADA; }
      const r = orig.apply(this, arguments);
      try { if (card) SITIO_CARTA.set(card, { sp: spaceIdx, owner }); } catch (e) {}
      return r;
    };
  }
  if (typeof render === 'function'){
    const orig = render;
    window.render = function(){ const r = orig.apply(this, arguments); try { realMirarTablero(); sumaPinta(); } catch (e) {} return r; };
  }
  if (typeof removeToDiscard === 'function'){
    const orig = removeToDiscard;
    window.removeToDiscard = function(card){ const r = orig.apply(this, arguments); teiRevisa(card, G.discard); return r; };
  }
  if (typeof extinguishCard === 'function'){
    const orig = extinguishCard;
    window.extinguishCard = function(card){ const r = orig.apply(this, arguments); teiRevisa(card, G.extinct); return r; };
  }
})();


/* ══════════════════════════════════════════════════════════════════════
   [Nuevo] ROLOC (Realidad): «Todos los efectos de espacio se aplican en el
   resto de espacios.» Mientras un espacio tenga ese efecto, cada espacio
   tiene a la vez los efectos de los tres. (El efecto antiguo de la carta de
   Roloc —copiar su espacio en los demás— ya no se usa.)
   ══════════════════════════════════════════════════════════════════════ */
const TXT_ROLOC = 'Todos los efectos de espacio se aplican en el resto de espacios';
function rolocGlobal(){
  return typeof G !== 'undefined' && G && G.spaces && G.spaces.some(e => e.effectRevealed && e.effectText && e.effectText.includes(TXT_ROLOC) && !e._rekiAnulado);
}
(function(){
  if (typeof rolocSpaceIdx === 'function') window.rolocSpaceIdx = rolocSpaceIdx = function(){ return -1; };
  if (typeof getActiveEffects === 'function'){
    const o = getActiveEffects;
    window.getActiveEffects = getActiveEffects = function(sp){
      if (!rolocGlobal()) return o.apply(this, arguments);
      const todos = [];
      G.spaces.forEach((e, i) => { if (e._realActive || e._rekiAnulado) return; o(i).forEach(t => { if (!todos.includes(t)) todos.push(t); }); });
      if (G.spaces[sp] && G.spaces[sp]._realActive) return o.apply(this, arguments);   // Real sigue siendo Real
      return todos;
    };
  }
})();
