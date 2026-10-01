/* Riña Divina — modo «Jugar con mazo»
   (separado del index.html original; se carga en el mismo orden que antes) */
// ══════════════════════════════════════════════════════════
//  DECK GAME MODAL
// ══════════════════════════════════════════════════════════
let DG_SHOW_PRESETS = false;
let DG_ACTIVE_SLOT = null;   // 0 = player, 1 = AI, null = none
// Each slot: { deckKey: null|int, randomMode: 'all'|'basic'|'custom' }
const DG_SLOTS = [
  { deckKey: null, randomMode: 'all' },
  { deckKey: null, randomMode: 'all' },
];

const DG_LAST_KEY = 'juego_cartas_dg_last';

function dgSaveLast() {
  try {
    localStorage.setItem(DG_LAST_KEY, JSON.stringify([
      { deckKey: DG_SLOTS[0].deckKey, randomMode: DG_SLOTS[0].randomMode },
      { deckKey: DG_SLOTS[1].deckKey, randomMode: DG_SLOTS[1].randomMode },
    ]));
  } catch {}
}

function dgLoadLast() {
  try {
    const saved = JSON.parse(localStorage.getItem(DG_LAST_KEY) || 'null');
    if (!saved) return;
    for (let i = 0; i < 2; i++) {
      if (!saved[i]) continue;
      DG_SLOTS[i].randomMode = saved[i].randomMode || 'all';
      // Validate deckKey still exists
      const k = saved[i].deckKey;
      if (k === null) { DG_SLOTS[i].deckKey = null; continue; }
      const deck = dgGetDeck(k);
      DG_SLOTS[i].deckKey = deck ? k : null;
    }
  } catch {}
}

function showDeckGameModal() {
  playSound('uiClick');
  DG_SHOW_PRESETS = false;
  DG_ACTIVE_SLOT = null;
  DG_SLOTS[0] = { deckKey: null, randomMode: 'all' };
  DG_SLOTS[1] = { deckKey: null, randomMode: 'all' };
  dgLoadLast();
  const btn = document.getElementById('dg-presets-btn');
  if (btn) btn.classList.remove('active');
  document.getElementById('deck-game-overlay').classList.add('show');
  dgRenderSidebar();
  dgRenderSlots();
}

function closeDeckGameModal() {
  playSound('uiClick');
  document.getElementById('deck-game-overlay').classList.remove('show');
  DG_ACTIVE_SLOT = null;
  dgUnpinPreview();
}

function dgTogglePresets() {
  playSound('uiClick');
  DG_SHOW_PRESETS = !DG_SHOW_PRESETS;
  const btn = document.getElementById('dg-presets-btn');
  if (btn) btn.classList.toggle('active', DG_SHOW_PRESETS);
  dgRenderSidebar();
}

function dgSelectSlot(slotIdx) {
  playSound('uiClick');
  DG_ACTIVE_SLOT = (DG_ACTIVE_SLOT === slotIdx) ? null : slotIdx;
  dgRenderSlots();
  dgRenderSidebar();
}

function dgSetRandom(e, slotIdx, mode) {
  e.stopPropagation();
  playSound('uiClick');
  const slot = DG_SLOTS[slotIdx];
  // Toggle off if already active
  if (slot.randomMode === mode && slot.deckKey === null) {
    // already in random mode with this mode — deselect random entirely? keep it, it must always have some mode
    return;
  }
  slot.randomMode = mode;
  slot.deckKey = null; // switch back to random mode
  dgRenderSlots();
  dgRenderSidebar();
}

function dgAssignDeck(deckKey) {
  if (DG_ACTIVE_SLOT === null) return;
  const deck = dgGetDeck(deckKey);
  if (!isDeckComplete(deck)) return; // should not happen (filtered from list) but guard anyway
  playSound('uiClick');
  DG_SLOTS[DG_ACTIVE_SLOT].deckKey = deckKey;
  dgRenderSlots();
  dgRenderSidebar();
}

function dgGetDeck(deckKey) {
  if (deckKey < 0) return PRESET_DECKS[-(deckKey + 1)] || null;
  return CB_DECKS[deckKey] || null;
}

function isDeckComplete(deck) {
  if (!deck) return false;
  const v1 = deck.cards.filter(n => CARD_DB[n]?.value === 1).length;
  const v0 = deck.cards.filter(n => CARD_DB[n]?.value === 0).length;
  return v1 >= 8 && v0 >= 2;
}

function dgRejectBtn(slotIdx) {
  const slot = document.getElementById(`dg-slot-${slotIdx}`);
  if (!slot) return;
  slot.classList.remove('dg-reject');
  void slot.offsetWidth;
  slot.classList.add('dg-reject');
  setTimeout(() => slot.classList.remove('dg-reject'), 500);
  playSound('mazoRechazar');
}

function dgResolveRandomDeck(mode) {
  // Build pool based on mode
  let pool = [];
  if (mode === 'all' || mode === 'basic') {
    // Only include unlocked preset decks
    pool.push(...PRESET_DECKS.map((d, i) => -(i + 1)).filter(k => !isPresetDeckLocked(-(k + 1))));
  }
  if (mode === 'all' || mode === 'custom') {
    pool.push(...CB_DECKS.map((_, i) => i).filter(i => isDeckComplete(CB_DECKS[i])));
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function startDeckGame() {
  playSound('uiClick');
  // Resolve random decks
  const resolvedKeys = DG_SLOTS.map((slot, i) => {
    if (slot.deckKey !== null) return slot.deckKey;
    const key = dgResolveRandomDeck(slot.randomMode);
    if (key === null) {
      dgRejectBtn(i);
      return undefined;
    }
    return key;
  });

  if (resolvedKeys.includes(undefined)) return;

  const decks = resolvedKeys.map(k => dgGetDeck(k));
  if (decks.some(d => !d)) return;

  // Guard: reject if any deck is incomplete (e.g. edited after assignment)
  decks.forEach((d, i) => {
    if (!isDeckComplete(d)) {
      dgRejectBtn(i);
      resolvedKeys[i] = undefined;
    }
  });
  if (resolvedKeys.includes(undefined)) return;

  closeDeckGameModal();
  dgSaveLast();
  startGame(decks[0], decks[1]);
}

function dgOpenCardBrowser() {
  closeDeckGameModal();
  showCardBrowser(true);
}

function dgShowPreview(deck, itemEl, pin = false) {
  const panel = document.getElementById('dg-deck-preview');
  const nameEl = document.getElementById('dg-preview-name');
  const grid = document.getElementById('dg-preview-grid');
  if (!panel || !deck) return;

  // In mobile mode, click toggles pin; if already pinned to this deck, unpin
  if (pin) {
    if (panel._pinnedDeck === deck) {
      dgHidePreview();
      return;
    }
    panel._pinnedDeck = deck;
    panel.classList.add('pinned');
  } else {
    if (panel._pinnedDeck) return; // hover shouldn't override a pinned preview
    panel._pinnedDeck = null;
    panel.classList.remove('pinned');
  }

  nameEl.textContent = deck.name;
  grid.innerHTML = '';

  const sorted = [...deck.cards].sort((a, b) => {
    const av = CARD_DB[a]?.value ?? 1;
    const bv = CARD_DB[b]?.value ?? 1;
    return av - bv;
  });

  sorted.forEach(cardName => {
    const cardData = CARD_DB[cardName];
    const cell = document.createElement('div');
    cell.className = 'dg-preview-card ' + (cardData?.value === 0 ? 'val0' : 'val1');
    const img = document.createElement('img');
    img.src = `./ilustraciones/${cardName}.jpg`;
    img.alt = cardName;
    img.title = cardName;
    img.onerror = () => { img.style.display = 'none'; };
    cell.appendChild(img);
    grid.appendChild(cell);
  });

  // Position: to the left of the hovered item, using fixed viewport coords
  const itemRect = itemEl.getBoundingClientRect();
  const panelW = 210;
  const gap = 10;
  let left = itemRect.left - panelW - gap;
  // Clamp so it doesn't go off-screen left
  if (left < 8) left = 8;
  let top = itemRect.top;
  // Clamp bottom
  const maxTop = window.innerHeight - panel.offsetHeight - 8;
  if (top > maxTop) top = maxTop;
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';

  panel.classList.add('visible');
}

function dgHidePreview() {
  const panel = document.getElementById('dg-deck-preview');
  if (!panel) return;
  if (panel._pinnedDeck) return; // don't hide on mouseleave if pinned
  panel.classList.remove('visible');
}

function dgUnpinPreview() {
  const panel = document.getElementById('dg-deck-preview');
  if (!panel) return;
  panel._pinnedDeck = null;
  panel.classList.remove('pinned', 'visible');
}

function dgRenderSidebar() {
  const list = document.getElementById('dg-deck-list');
  if (!list) return;
  list.innerHTML = '';

  const deckList = DG_SHOW_PRESETS
    ? PRESET_DECKS.map((d, i) => ({ deck: d, key: -(i + 1) }))
    : CB_DECKS.map((d, i) => ({ deck: d, key: i })).filter(({ deck }) => isDeckComplete(deck));

  if (deckList.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:0.7rem;color:var(--text-dim);font-style:italic;padding:8px 2px;';
    empty.textContent = DG_SHOW_PRESETS ? t('dg_no_basic') : t('dg_no_complete');
    list.appendChild(empty);
    const newDeckBtn = document.getElementById('dg-new-deck-btn');
    if (newDeckBtn) newDeckBtn.style.display = DG_SHOW_PRESETS ? 'none' : '';
    return;
  }

  deckList.forEach(({ deck, key }) => {
    const isPresetItem = key < 0;
    const presetIdx = isPresetItem ? -(key + 1) : -1;
    const missingCards = isPresetItem ? getPresetDeckMissingCards(presetIdx) : [];
    const isLocked = missingCards.length > 0;
    const isAssigned = DG_SLOTS.some(s => s.deckKey === key);
    const item = document.createElement('div');
    item.className = 'cb-deck-item' + (isAssigned ? ' selected' : '') + (isLocked ? ' deck-locked' : '');
    item.style.cursor = isLocked ? 'not-allowed' : 'grab';
    item.draggable = !isLocked;
    item.dataset.dgKey = key;

    // Tooltip for locked decks
    if (isLocked) {
      item.addEventListener('mouseenter', (e) => showDeckLockTooltip(e, missingCards));
      item.addEventListener('mousemove', positionDeckLockTooltip);
      item.addEventListener('mouseleave', hideDeckLockTooltip);
    }

    item.onclick = () => {
      if (isLocked) return;
      if (DG_ACTIVE_SLOT === null) return;
      dgAssignDeck(key);
    };
    if (!isLocked) {
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('dg-deck-key', key);
        e.dataTransfer.effectAllowed = 'copy';
      });
    }
    item.addEventListener('mouseenter', () => { if (!OPTIONS.mobileMode && !isLocked) dgShowPreview(deck, item); });
    item.addEventListener('mouseleave', () => { if (!OPTIONS.mobileMode) dgHidePreview(); });
    item.addEventListener('click', () => { if (OPTIONS.mobileMode && !isLocked) dgShowPreview(deck, item, true); });

    // Thumbnail
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'cb-deck-thumb-wrap';
    if (deck.thumb && cbThumbExists(deck.thumb)) {
      const img = document.createElement('img');
      img.className = 'cb-deck-thumb';
      img.src = `./ilustraciones/${deck.thumb}.jpg`;
      img.style.objectPosition = CB_THUMB_OFFSET.get(deck.thumb) || 'top';
      img.onerror = () => { img.remove(); };
      thumbWrap.appendChild(img);
    } else {
      const empty = document.createElement('div');
      empty.className = 'cb-deck-thumb-empty';
      empty.textContent = '🂠';
      thumbWrap.appendChild(empty);
    }
    item.appendChild(thumbWrap);

    // Lock icon overlay for locked preset decks
    if (isLocked) {
      const lockIcon = document.createElement('div');
      lockIcon.className = 'cb-deck-lock-overlay';
      lockIcon.textContent = '🔒';
      item.appendChild(lockIcon);
    }

    if (DG_SHOW_PRESETS) {
      const badge = document.createElement('div');
      badge.className = 'cb-deck-preset-badge';
      badge.textContent = t('cb_badge_basic');
      item.appendChild(badge);
    }

    const info = document.createElement('div');
    info.className = 'cb-deck-info';
    const nameEl = document.createElement('span');
    nameEl.className = 'cb-deck-name';
    nameEl.textContent = deck.name;
    const countEl = document.createElement('div');
    countEl.className = 'cb-deck-count';
    const v1 = deck.cards.filter(n => CARD_DB[n]?.value === 1).length;
    const v0 = deck.cards.filter(n => CARD_DB[n]?.value === 0).length;
    countEl.textContent = `${v1}/8 V1 · ${v0}/2 V0`;
    info.appendChild(nameEl);
    info.appendChild(countEl);
    item.appendChild(info);

    list.appendChild(item);
  });

  // Show/hide the "crear nuevo mazo" button — only when not in presets view
  const newDeckBtn = document.getElementById('dg-new-deck-btn');
  if (newDeckBtn) newDeckBtn.style.display = DG_SHOW_PRESETS ? 'none' : '';
}

function dgRenderSlots() {
  [0, 1].forEach(i => {
    const slot = DG_SLOTS[i];
    const el = document.getElementById(`dg-slot-${i}`);
    if (!el) return;

    el.classList.toggle('active-slot', DG_ACTIVE_SLOT === i);

    // Drop target
    el.ondragover = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; el.classList.add('dg-drop-over'); };
    el.ondragleave = () => el.classList.remove('dg-drop-over');
    el.ondrop = e => {
      e.preventDefault();
      el.classList.remove('dg-drop-over');
      const key = parseInt(e.dataTransfer.getData('dg-deck-key'));
      if (!isNaN(key) || e.dataTransfer.getData('dg-deck-key') !== '') {
        const rawKey = e.dataTransfer.getData('dg-deck-key');
        const parsedKey = Number(rawKey);
        const droppedDeck = dgGetDeck(parsedKey);
        if (!isDeckComplete(droppedDeck)) {
          dgRejectBtn(i);
          return;
        }
        DG_SLOTS[i].deckKey = parsedKey;
        DG_ACTIVE_SLOT = null;
        playSound('uiClick');
        dgRenderSlots();
        dgRenderSidebar();
      }
    };

    // Thumbnail
    const thumbWrap = el.querySelector('.dg-slot-thumb-wrap');
    thumbWrap.innerHTML = '';
    const deck = slot.deckKey !== null ? dgGetDeck(slot.deckKey) : null;
    if (deck && deck.thumb && CARD_DB[deck.thumb]) {
      const img = document.createElement('img');
      img.className = 'dg-slot-thumb';
      img.src = `./ilustraciones/${deck.thumb}.jpg`;
      img.style.objectPosition = CB_THUMB_OFFSET.get(deck.thumb) || 'top';
      img.onerror = () => { img.remove(); };
      thumbWrap.appendChild(img);
    } else {
      const empty = document.createElement('div');
      empty.className = 'dg-slot-empty';
      empty.textContent = '🂠';
      thumbWrap.appendChild(empty);
    }

    // Name
    const nameEl = el.querySelector('.dg-slot-name');
    if (deck) {
      nameEl.textContent = deck.name;
      nameEl.style.color = 'var(--text)';
    } else {
      nameEl.textContent = t('dg_random_label');
      nameEl.style.color = 'var(--text-dim)';
    }

    // Random buttons
    el.querySelectorAll('.dg-random-btn').forEach(btn => {
      const mode = btn.dataset.mode;
      btn.classList.toggle('active', slot.deckKey === null && slot.randomMode === mode);
    });
  });
}
