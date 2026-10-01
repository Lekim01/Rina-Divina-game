/* Riña Divina — textos en español, inglés y japonés
   (separado del index.html original; se carga en el mismo orden que antes) */
// ══════════════════════════════════════════════════════════
//  INTERNACIONALIZACIÓN (i18n)
// ══════════════════════════════════════════════════════════
const I18N = {
  es: {
    // Meta
    lang_label: "ES",
    lang_name: "Español",
    // Menú principal
    menu_title:        "Riña Divina",
    menu_play:         "Jugar",
    menu_play_deck:    "Jugar con mazo",
    menu_cards_decks:  "Cartas y Mazos",
    menu_hitos:        "Hitos",
    menu_rules:        "Ver Reglas",
    menu_options:      "Opciones",
    menu_profile:      "Perfil y estadísticas",
    // Menú hamburguesa in-game
    fab_title:         "— Menú —",
    fab_play_again:    "▶ Jugar otra",
    fab_exit:          "✕ Salir al menú",
    fab_log:           "📜 Historial",
    fab_cards:         "🃏 Cartas",
    fab_rules:         "📖 Reglas",
    fab_options:       "⚙ Opciones",
    fab_fullscreen:    "⛶ Pantalla completa",
    fab_abandon:       "✕ Abandonar",
    // Fin de partida
    btn_exit_menu:     "Salir al menú",
    // Pilas
    label_deck:        "MAZO",
    label_discard:     "DESCARTE",
    label_extinct:     "EXTINCIÓN",
    // Opciones
    opt_title:         "Opciones",
    // Hitos
    hitos_title:       "Hitos",
    hitos_back:        "← Volver al menú",
    hitos_search:      "Buscar carta…",
    hitos_filter_all:   "Todos",
    hitos_filter_done:  "✦ Completados",
    hitos_filter_v1:    "Valor 1",
    hitos_filter_v0:    "Valor 0",
    hitos_filter_token: "Tokens",
    hitos_progress:     "Progreso",
    hitos_empty:        "Sin resultados",
    hitos_toast_title:  "✦ Hito completado",
    // Perfil
    profile_player:    "Jugador",
    profile_name_ph:   "Tu nombre…",
    profile_history:   "— Historial de Partidas —",
    profile_wins:      "Victorias",
    profile_draws:     "Empates",
    profile_losses:    "Derrotas",
    profile_winrate:   "Ratio Victoria",
    profile_streak_w:  "Racha Victorias",
    profile_streak_d:  "Racha Empates",
    profile_streak_l:  "Racha Derrotas",
    profile_real:      "Aparic. Real",
    profile_card_stats:"📊 Estadísticas por carta",
    profile_collection:"— Colección —",
    profile_signature: "— Carta Insignia —",
    profile_sig_desc:  "Juega más partidas para descubrir tu carta insignia",
    profile_games:     "— Últimas Partidas —",
    profile_avatar_title: "— Elige tu carta insignia —",
    profile_title_picker: "— Elige tu título —",
    replay_back:       "← Volver",
    // Progreso
    export_title:      "— Código de progreso —",
    export_desc:       "Copia este código y guárdalo en un lugar seguro. Úsalo con \"Importar código\" para restaurar tu partida.",
    import_title:      "— Importar código —",
    import_desc:       'Pega aquí tu código de progreso (empieza por "RD2:") y pulsa Confirmar.',
    btn_confirm:       "Confirmar",
    btn_copy:          "📋 Copiar",
    btn_copied:        "✓ Copiado",
    btn_close:         "✕ Cerrar",
    // Bloqueado
    locked_label:      "🔒 Nivel 1",
    // Card Browser
    cb_back:           "← Volver al menú",
    cb_title:          "Todas las Cartas",
    cb_presets:        "📖 Mazos básicos",
    cb_new_deck:       "＋ Crear nuevo mazo",
    cb_rename:         "✎ Renombrar seleccionado",
    cb_search:         "Buscar nombre/efecto",
    cb_filter_in_deck: "En el mazo",
    cb_filter_val1:    "Valor 1",
    cb_filter_val0:    "Valor 0",
    cb_filter_reveal:  "✴ Revelar",
    cb_filter_exist:   "♾ Existir",
    cb_filter_special: "◇ Especial",
    cb_filter_token:   "Tokens",
    cb_filter_fav:     "⭐ Favoritos",
    cb_filter_unlocked:"🔓 Desbloqueados",
    cb_filter_locked:  "🔒 Bloqueados",
    cb_size_label:     "TAMAÑO",
    // Deck Game
    dg_title:          "Partida con Mazo",
    dg_presets:        "📖 Mazos básicos",
    dg_new_deck:       "＋ Crear nuevo mazo",
    dg_slot1:          "Jugador 1",
    dg_slot2:          "IA",
    dg_no_deck:        "Sin mazo",
    dg_random_all:     "Azar",
    dg_random_basic:   "Azar básico",
    dg_random_custom:  "Azar construido",
    dg_start:          "Empezar",
    dg_no_basic:       "No hay mazos básicos.",
    dg_no_complete:    "No hay mazos completos.",
    dg_random_label:   "Azar",
    cb_readonly:       "Mazo básico — solo lectura.",
    cb_discard_empty:  "El descarte está vacío.",
    cb_deck_empty:     "Mazo vacío.",
    cb_badge_basic:    "BÁSICO",
    cb_select_deck:    "Selecciona un mazo para añadir cartas.",
    cb_no_cards:       "No se encontraron cartas.",
    cb_extinct_empty:  "La pila de extinguidos está vacía.",
    cb_badge_basic_deck: "MAZO BÁSICO",
    // Opciones — título y categorías
    opt_mobile:          "Para móviles",
    opt_cat_visual:      "🎨 Visual",
    opt_cat_sound:       "🔊 Sonido",
    opt_cat_save:        "💾 Guardados",
    // Opciones — visual
    opt_hand_raised:     "Mano siempre levantada",
    opt_paso:            "Tocar para pasar las acciones una a una (solo sin conexión)",
    opt_hand_opacity:    "Opacidad de la mano",
    opt_card_font:       "Tamaño del texto en cartas",
    opt_anim_speed:      "Velocidad de animaciones",
    opt_show_name:       "Mostrar nombre en cartas",
    opt_show_type:       "Mostrar tipo en cartas",
    opt_show_type_text:  "Mostrar texto de tipo en cartas",
    opt_show_effect:     "Mostrar efecto en cartas",
    // Opciones — sonido
    opt_sfx:             "Soniditos",
    opt_music:           "Música del menú",
    // Opciones — guardado
    opt_save_code_label: "— Código de texto —",
    opt_copy_code:       "📋 Copiar código",
    opt_paste_code:      "📥 Pegar código",
    opt_reset_save:      "✕ Borrar progreso",
    // Toggles genéricos
    toggle_yes:          "Sí",
    toggle_no:           "No",
    // Velocidad de animaciones
    speed_fast:          "Rápido",
    speed_slow:          "Lento",
    speed_normal:        "Normal",
    // Modales in-game
    modal_discard:       "Descarte",
    modal_extinct:       "Extinguidos",
    modal_cards_suffix:  "cartas",
    modal_confirm:       "Confirmar",
    modal_close:         "Cerrar",
    modal_copy:          "📋 Copiar",
    modal_copied:        "✓ Copiado",
    // Fin de partida
    end_play_again:      "Jugar otra",
    end_view_board:      "Ver tablero",
    // Resultado de partida
    result_victory:      "¡Victoria!",
    result_defeat:       "Derrota",
    result_draw:         "Empate",
    result_you_win:      "🔵 Tú ganas",
    result_ai_wins:      "🔴 IA gana",
    result_draw_short:   "— Empate",
    result_you_win_short:"◆ Tú ganas",
    result_ai_wins_short:"◆ IA gana",
    // Perfil & historial
    profile_no_games:    "Todavía no hay partidas registradas",
    profile_no_filtered: "No hay partidas con ese resultado",
    profile_no_board:    "Sin datos de tablero (partida antigua)",
    profile_no_card_stats:"Todavía no hay datos de cartas",
    profile_no_unlocked: "No hay cartas desbloqueadas aún.",
    // Nivel
    level_label:         "Nivel",
    level_locked:        "🔒 Nivel",
    level_xp_label:      "— Nivel",
    // Modales in-game
    modal_no_effect:     "Sin efecto",
    modal_space:         "Espacio",
    modal_score_you:     "Tú:",
    modal_score_ai:      "IA:",
    modal_soi_title:     "Soi: próximas cartas",
    modal_soi_note:      "Nota: Tú robas primero al inicio de los turnos.",
    modal_rules_title:   "Reglas",
    // Desbloqueo
    unlock_deck:         "¡Has desbloqueado este mazo!",
    // End-of-game unlock badges
    unlock_card_badge:   "✦ CARTA",
    unlock_info_badge:   "✦ INFORMACIÓN",
    // Card stats
    cs_most_played:      "Más jugadas",
    cs_most_wins:        "Más victorias",
    cs_best_pct:         "Mejor %",
    cs_hide:             "Ocultar",
    cs_show:             "Ver estadísticas",
    cs_wins_abbr:        "V",
    cs_losses_abbr:      "D",
    cs_games:            "partidas",
    // Game history filters
    pgame_all:           "Todas",
    pgame_wins:          "Victorias",
    pgame_losses:        "Derrotas",
    pgame_draws:         "Empates",
    pgame_view:          "▶ Ver",
    pgame_quick:         "Partida Rápida",
    pgame_deck_prefix:   "Mazo:",
    pgame_copy_deck:     "⎘ Copiar mazo",
    pgame_copy_done:     '✓ Copiado como',
    // Replay labels
    replay_you_first:    "Tú revelaste primero",
    replay_ai_first:     "IA reveló primero",
    replay_turn_of:      "Turno",
    replay_of:           "de",
    replay_space_label:  "E",
    replay_you:          "TÚ",
    // Sig count
    sig_count_single:    "Presente en 1 partida",
    sig_count_plural:    "Presente en {n} partidas",
    // Date labels
    date_today:          "Hoy",
    date_yesterday:      "Ayer",
    date_days:           "Dom,Lun,Mar,Mié,Jue,Vie,Sáb",
    // ← Card curiosity button
    btn_back_card:       "← Carta",
    btn_info:            "✦ Información",
    level_required:      "requerido",
    menu_version:        "Versión 0.1 (Pueden haber errores)",
    // Reset confirmación
    reset_confirm:       "¿Seguro que quieres borrar todo el progreso de desbloqueos y estadísticas? Esta acción no se puede deshacer.",
  },
  en: {
    lang_label: "EN",
    lang_name: "English",
    menu_title:        "Divine Quarrel",
    menu_play:         "Play",
    menu_play_deck:    "Play with Deck",
    menu_cards_decks:  "Cards & Decks",
    menu_hitos:        "Milestones",
    menu_rules:        "View Rules",
    menu_options:      "Options",
    menu_profile:      "Profile & Stats",
    fab_title:         "— Menu —",
    fab_play_again:    "▶ Play Again",
    fab_exit:          "✕ Exit to Menu",
    fab_log:           "📜 Log",
    fab_cards:         "🃏 Cards",
    fab_rules:         "📖 Rules",
    fab_options:       "⚙ Options",
    fab_fullscreen:    "⛶ Fullscreen",
    fab_abandon:       "✕ Abandon",
    btn_exit_menu:     "Exit to Menu",
    label_deck:        "DECK",
    label_discard:     "DISCARD",
    label_extinct:     "EXTINCTION",
    opt_title:         "Options",
    hitos_title:       "Milestones",
    hitos_back:        "← Back to Menu",
    hitos_search:      "Search card…",
    hitos_filter_all:   "All",
    hitos_filter_done:  "✦ Completed",
    hitos_filter_v1:    "Value 1",
    hitos_filter_v0:    "Value 0",
    hitos_filter_token: "Tokens",
    hitos_progress:     "Progress",
    hitos_empty:        "No results",
    hitos_toast_title:  "✦ Milestone unlocked",
    profile_player:    "Player",
    profile_name_ph:   "Your name…",
    profile_history:   "— Match History —",
    profile_wins:      "Wins",
    profile_draws:     "Draws",
    profile_losses:    "Losses",
    profile_winrate:   "Win Rate",
    profile_streak_w:  "Win Streak",
    profile_streak_d:  "Draw Streak",
    profile_streak_l:  "Loss Streak",
    profile_real:      "Real Appear.",
    profile_card_stats:"📊 Card Statistics",
    profile_collection:"— Collection —",
    profile_signature: "— Signature Card —",
    profile_sig_desc:  "Play more matches to discover your signature card",
    profile_games:     "— Recent Matches —",
    profile_avatar_title: "— Choose your signature card —",
    profile_title_picker: "— Choose your title —",
    replay_back:       "← Back",
    export_title:      "— Progress Code —",
    export_desc:       'Copy this code and save it somewhere safe. Use "Import Code" to restore your progress.',
    import_title:      "— Import Code —",
    import_desc:       'Paste your progress code (starts with "RD2:") and press Confirm.',
    btn_confirm:       "Confirm",
    btn_copy:          "📋 Copy",
    btn_copied:        "✓ Copied",
    btn_close:         "✕ Close",
    locked_label:      "🔒 Level 1",
    // Card Browser
    cb_back:           "← Back to Menu",
    cb_title:          "All Cards",
    cb_presets:        "📖 Basic Decks",
    cb_new_deck:       "＋ Create New Deck",
    cb_rename:         "✎ Rename Selected",
    cb_search:         "Search name/effect",
    cb_filter_in_deck: "In Deck",
    cb_filter_val1:    "Value 1",
    cb_filter_val0:    "Value 0",
    cb_filter_reveal:  "✴ Reveal",
    cb_filter_exist:   "♾ Exist",
    cb_filter_special: "◇ Special",
    cb_filter_token:   "Tokens",
    cb_filter_fav:     "⭐ Favorites",
    cb_filter_unlocked:"🔓 Unlocked",
    cb_filter_locked:  "🔒 Locked",
    cb_size_label:     "SIZE",
    // Deck Game
    dg_title:          "Deck Match",
    dg_presets:        "📖 Basic Decks",
    dg_new_deck:       "＋ Create New Deck",
    dg_slot1:          "Player 1",
    dg_slot2:          "AI",
    dg_no_deck:        "No Deck",
    dg_random_all:     "Random",
    dg_random_basic:   "Basic Random",
    dg_random_custom:  "Built Random",
    dg_start:          "Start",
    dg_no_basic:       "No basic decks.",
    dg_no_complete:    "No complete decks.",
    dg_random_label:   "Random",
    cb_readonly:       "Basic deck — read only.",
    cb_discard_empty:  "The discard pile is empty.",
    cb_deck_empty:     "Empty deck.",
    cb_badge_basic:    "BASIC",
    cb_select_deck:    "Select a deck to add cards.",
    cb_no_cards:       "No cards found.",
    cb_extinct_empty:  "The extinction pile is empty.",
    cb_badge_basic_deck: "BASIC DECK",
    opt_mobile:          "Mobile mode",
    opt_cat_visual:      "🎨 Visual",
    opt_cat_sound:       "🔊 Sound",
    opt_cat_save:        "💾 Save data",
    opt_hand_raised:     "Hand always raised",
    opt_paso:            "Tap to advance actions one by one (offline only)",
    opt_hand_opacity:    "Hand opacity",
    opt_card_font:       "Card text size",
    opt_anim_speed:      "Animation speed",
    opt_show_name:       "Show card name",
    opt_show_type:       "Show card type",
    opt_show_type_text:  "Show type text on cards",
    opt_show_effect:     "Show card effect",
    opt_sfx:             "Sound effects",
    opt_music:           "Menu music",
    opt_save_code_label: "— Text code —",
    opt_copy_code:       "📋 Copy code",
    opt_paste_code:      "📥 Paste code",
    opt_reset_save:      "✕ Delete progress",
    toggle_yes:          "Yes",
    toggle_no:           "No",
    speed_fast:          "Fast",
    speed_slow:          "Slow",
    speed_normal:        "Normal",
    modal_discard:       "Discard",
    modal_extinct:       "Extinction",
    modal_cards_suffix:  "cards",
    modal_confirm:       "Confirm",
    modal_close:         "Close",
    modal_copy:          "📋 Copy",
    modal_copied:        "✓ Copied",
    end_play_again:      "Play Again",
    end_view_board:      "View Board",
    result_victory:      "Victory!",
    result_defeat:       "Defeat",
    result_draw:         "Draw",
    result_you_win:      "🔵 You win",
    result_ai_wins:      "🔴 AI wins",
    result_draw_short:   "— Draw",
    result_you_win_short:"◆ You win",
    result_ai_wins_short:"◆ AI wins",
    profile_no_games:    "No matches recorded yet",
    profile_no_filtered: "No matches with that result",
    profile_no_board:    "No board data (old match)",
    profile_no_card_stats:"No card data yet",
    profile_no_unlocked: "No cards unlocked yet.",
    level_label:         "Level",
    level_locked:        "🔒 Level",
    level_xp_label:      "— Level",
    modal_no_effect:     "No effect",
    modal_space:         "Space",
    modal_score_you:     "You:",
    modal_score_ai:      "AI:",
    modal_soi_title:     "Soi: upcoming cards",
    modal_soi_note:      "Note: You draw first at the start of turns.",
    modal_rules_title:   "Rules",
    unlock_deck:         "You've unlocked this deck!",
    reset_confirm:       "Are you sure you want to delete all unlock progress and statistics? This cannot be undone.",
    // End-of-game unlock badges
    unlock_card_badge:   "✦ CARD",
    unlock_info_badge:   "✦ INFO",
    // Card stats
    cs_most_played:      "Most played",
    cs_most_wins:        "Most wins",
    cs_best_pct:         "Best %",
    cs_hide:             "Hide",
    cs_show:             "Show stats",
    cs_wins_abbr:        "W",
    cs_losses_abbr:      "L",
    cs_games:            "games",
    // Game history filters
    pgame_all:           "All",
    pgame_wins:          "Wins",
    pgame_losses:        "Losses",
    pgame_draws:         "Draws",
    pgame_view:          "▶ View",
    pgame_quick:         "Quick Match",
    pgame_deck_prefix:   "Deck:",
    pgame_copy_deck:     "⎘ Copy Deck",
    pgame_copy_done:     '✓ Copied as',
    // Replay labels
    replay_you_first:    "You revealed first",
    replay_ai_first:     "AI revealed first",
    replay_turn_of:      "Turn",
    replay_of:           "of",
    replay_space_label:  "S",
    replay_you:          "YOU",
    // Sig count
    sig_count_single:    "Present in 1 match",
    sig_count_plural:    "Present in {n} matches",
    // Date labels
    date_today:          "Today",
    date_yesterday:      "Yesterday",
    date_days:           "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    // ← Card curiosity button
    btn_back_card:       "← Card",
    btn_info:            "✦ Info",
    level_required:      "required",
    menu_version:        "Version 0.1 (May contain bugs)",
  },
  ja: {
    lang_label: "JA",
    lang_name: "日本語",
    menu_title:        "神気の争い",
    menu_play:         "プレイ",
    menu_play_deck:    "デッキでプレイ",
    menu_cards_decks:  "カード＆デッキ",
    menu_hitos:        "実績",
    menu_rules:        "ルールを見る",
    menu_options:      "オプション",
    menu_profile:      "プロフィールと統計",
    fab_title:         "— メニュー —",
    fab_play_again:    "▶ もう一度プレイ",
    fab_exit:          "✕ メニューへ戻る",
    fab_log:           "📜 ログ",
    fab_cards:         "🃏 カード",
    fab_rules:         "📖 ルール",
    fab_options:       "⚙ オプション",
    fab_fullscreen:    "⛶ フルスクリーン",
    fab_abandon:       "✕ 中断",
    btn_exit_menu:     "メニューへ戻る",
    label_deck:        "デッキ",
    label_discard:     "捨て札",
    label_extinct:     "絶滅",
    opt_title:         "オプション",
    hitos_title:       "実績",
    hitos_back:        "← メニューへ戻る",
    hitos_search:      "カードを検索…",
    hitos_filter_all:   "すべて",
    hitos_filter_done:  "✦ 達成済み",
    hitos_filter_v1:    "値1",
    hitos_filter_v0:    "値0",
    hitos_filter_token: "トークン",
    hitos_progress:     "進捗",
    hitos_empty:        "結果なし",
    hitos_toast_title:  "✦ 実績解除",
    profile_player:    "プレイヤー",
    profile_name_ph:   "名前を入力…",
    profile_history:   "— 対戦履歴 —",
    profile_wins:      "勝利",
    profile_draws:     "引き分け",
    profile_losses:    "敗北",
    profile_winrate:   "勝率",
    profile_streak_w:  "連勝",
    profile_streak_d:  "連続引き分け",
    profile_streak_l:  "連敗",
    profile_real:      "リアル出現",
    profile_card_stats:"📊 カード統計",
    profile_collection:"— コレクション —",
    profile_signature: "— シグネチャーカード —",
    profile_sig_desc:  "シグネチャーカードを見つけるにはもっと対戦しよう",
    profile_games:     "— 最近の対戦 —",
    profile_avatar_title: "— シグネチャーカードを選ぶ —",
    profile_title_picker: "— 称号を選ぶ —",
    replay_back:       "← 戻る",
    export_title:      "— 進行コード —",
    export_desc:       "このコードをコピーして安全な場所に保存してください。「コードをインポート」で進行を復元できます。",
    import_title:      "— コードをインポート —",
    import_desc:       '進行コード（"RD2:"で始まる）を貼り付けて確認を押してください。',
    btn_confirm:       "確認",
    btn_copy:          "📋 コピー",
    btn_copied:        "✓ コピー済み",
    btn_close:         "✕ 閉じる",
    locked_label:      "🔒 レベル1",
    // Card Browser
    cb_back:           "← メニューへ戻る",
    cb_title:          "全カード",
    cb_presets:        "📖 基本デッキ",
    cb_new_deck:       "＋ 新しいデッキを作成",
    cb_rename:         "✎ 選択したものを名前変更",
    cb_search:         "名前・効果を検索",
    cb_filter_in_deck: "デッキ内",
    cb_filter_val1:    "値1",
    cb_filter_val0:    "値0",
    cb_filter_reveal:  "✴ 公開",
    cb_filter_exist:   "♾ 存在",
    cb_filter_special: "◇ 特殊",
    cb_filter_token:   "トークン",
    cb_filter_fav:     "⭐ お気に入り",
    cb_filter_unlocked:"🔓 解放済み",
    cb_filter_locked:  "🔒 ロック中",
    cb_size_label:     "サイズ",
    // Deck Game
    dg_title:          "デッキ対戦",
    dg_presets:        "📖 基本デッキ",
    dg_new_deck:       "＋ 新しいデッキを作成",
    dg_slot1:          "プレイヤー1",
    dg_slot2:          "AI",
    dg_no_deck:        "デッキなし",
    dg_random_all:     "ランダム",
    dg_random_basic:   "基本ランダム",
    dg_random_custom:  "構築ランダム",
    dg_start:          "スタート",
    dg_no_basic:       "基本デッキがありません。",
    dg_no_complete:    "完成デッキがありません。",
    dg_random_label:   "ランダム",
    cb_readonly:       "基本デッキ — 読み取り専用。",
    cb_discard_empty:  "捨て札が空です。",
    cb_deck_empty:     "デッキが空です。",
    cb_badge_basic:    "基本",
    cb_select_deck:    "カードを追加するデッキを選んでください。",
    cb_no_cards:       "カードが見つかりません。",
    cb_extinct_empty:  "絶滅パイルが空です。",
    cb_badge_basic_deck: "基本デッキ",
    opt_mobile:          "モバイルモード",
    opt_cat_visual:      "🎨 ビジュアル",
    opt_cat_sound:       "🔊 サウンド",
    opt_cat_save:        "💾 セーブデータ",
    opt_hand_raised:     "常に手札を上げる",
    opt_paso:            "タップでアクションを一つずつ進める（オフラインのみ）",
    opt_hand_opacity:    "手札の不透明度",
    opt_card_font:       "カードのテキストサイズ",
    opt_anim_speed:      "アニメーション速度",
    opt_show_name:       "カード名を表示",
    opt_show_type:       "カードタイプを表示",
    opt_show_type_text:  "タイプテキストを表示",
    opt_show_effect:     "カード効果を表示",
    opt_sfx:             "効果音",
    opt_music:           "メニュー音楽",
    opt_save_code_label: "— テキストコード —",
    opt_copy_code:       "📋 コードをコピー",
    opt_paste_code:      "📥 コードを貼り付け",
    opt_reset_save:      "✕ 進行を削除",
    toggle_yes:          "はい",
    toggle_no:           "いいえ",
    speed_fast:          "速い",
    speed_slow:          "遅い",
    speed_normal:        "普通",
    modal_discard:       "捨て札",
    modal_extinct:       "絶滅",
    modal_cards_suffix:  "枚",
    modal_confirm:       "確認",
    modal_close:         "閉じる",
    modal_copy:          "📋 コピー",
    modal_copied:        "✓ コピー済み",
    end_play_again:      "もう一度",
    end_view_board:      "盤面を見る",
    result_victory:      "勝利！",
    result_defeat:       "敗北",
    result_draw:         "引き分け",
    result_you_win:      "🔵 あなたの勝ち",
    result_ai_wins:      "🔴 AIの勝ち",
    result_draw_short:   "— 引き分け",
    result_you_win_short:"◆ あなたの勝ち",
    result_ai_wins_short:"◆ AIの勝ち",
    profile_no_games:    "まだ対戦記録がありません",
    profile_no_filtered: "その結果の対戦はありません",
    profile_no_board:    "盤面データなし（古い対戦）",
    profile_no_card_stats:"カードデータがまだありません",
    profile_no_unlocked: "まだ解放されたカードがありません。",
    level_label:         "レベル",
    level_locked:        "🔒 レベル",
    level_xp_label:      "— レベル",
    modal_no_effect:     "効果なし",
    modal_space:         "スペース",
    modal_score_you:     "あなた:",
    modal_score_ai:      "AI:",
    modal_soi_title:     "Soi：次のカード",
    modal_soi_note:      "注：各ターン開始時にあなたが先にドローします。",
    modal_rules_title:   "ルール",
    unlock_deck:         "このデッキを解放しました！",
    reset_confirm:       "すべての解放進行と統計を削除しますか？この操作は元に戻せません。",
    // End-of-game unlock badges
    unlock_card_badge:   "✦ カード",
    unlock_info_badge:   "✦ 情報",
    // Card stats
    cs_most_played:      "多く使用",
    cs_most_wins:        "多く勝利",
    cs_best_pct:         "最高 %",
    cs_hide:             "隠す",
    cs_show:             "統計を見る",
    cs_wins_abbr:        "勝",
    cs_losses_abbr:      "敗",
    cs_games:            "対戦",
    // Game history filters
    pgame_all:           "すべて",
    pgame_wins:          "勝利",
    pgame_losses:        "敗北",
    pgame_draws:         "引き分け",
    pgame_view:          "▶ 見る",
    pgame_quick:         "クイックマッチ",
    pgame_deck_prefix:   "デッキ：",
    pgame_copy_deck:     "⎘ デッキをコピー",
    pgame_copy_done:     '✓ コピー済み：',
    // Replay labels
    replay_you_first:    "あなたが先に公開",
    replay_ai_first:     "AIが先に公開",
    replay_turn_of:      "ターン",
    replay_of:           "/",
    replay_space_label:  "S",
    replay_you:          "あなた",
    // Sig count
    sig_count_single:    "1対戦に登場",
    sig_count_plural:    "{n}対戦に登場",
    // Date labels
    date_today:          "今日",
    date_yesterday:      "昨日",
    date_days:           "日,月,火,水,木,金,土",
    // ← Card curiosity button
    btn_back_card:       "← カード",
    btn_info:            "✦ 情報",
    level_required:      "が必要",
    menu_version:        "バージョン 0.1（エラーが含まれる場合があります）",
  },
};

// ══════════════════════════════════════════════════════════
//  TRADUCCIONES DE CARTAS
//  Estructura: CARD_TRANSLATIONS[lang][cardName] = { displayName, effect }
//  ES e EN usan los mismos textos del CARD_DB original.
//  Solo JA necesita entradas propias.
// ══════════════════════════════════════════════════════════
const CARD_TRANSLATIONS = {
  en: {
    // ── Value 1 ──
    Koly:        { displayName: 'Koly',           effect: 'Allied cards in this space cannot be removed.' },
    Chiouri:     { displayName: 'Chiouri',         effect: 'The maximum value in this space is 3.' },
    Gena:        { displayName: 'Gena',            effect: 'An ally gains +1 value.' },
    Nugu:        { displayName: 'Nugu',            effect: 'Place a White Plush Hedgehog in the opponent\'s space.' },
    Fukou:       { displayName: 'Fukou',           effect: 'Next turn, the opponent draws a White Plush Hedgehog.' },
    Ramia:       { displayName: 'Ramia',           effect: 'If the opponent played here, steal 1 card from their hand.' },
    Reina:       { displayName: 'Reina',           effect: 'Steal the most boosted opponent value here.' },
    Ziru:        { displayName: 'Ziru',            effect: 'Look at the opponent\'s hand.' },
    Mugon:       { displayName: 'Mugon',           effect: 'If an ally is about to be removed, sacrifice this card instead.' },
    'Gran Demonio': { displayName: 'Gran Demonio', effect: 'Move this card and an ally to another space.' },
    Slau:        { displayName: 'Slau',            effect: 'All other cards here lose -1 value.' },
    Hanoe:       { displayName: 'Hanoe',           effect: 'Gain +1 value each time an ally is moved.' },
    Faun:        { displayName: 'Faun',            effect: 'Gain +1 value if it is the last turn.' },
    Yukoi:       { displayName: 'Yukoi',           effect: 'Next turn, a Value 1 ally placed here gains +1 value.' },
    Abaki:       { displayName: 'Abaki',           effect: 'If the opponent played here, gain +2 value.' },
    Mimimi:      { displayName: 'Mimimi',          effect: 'At end of turn, if in hand, it is forcibly placed in an empty space.' },
    Hobu:        { displayName: 'Hobu',            effect: 'If the opponent did not play here, opponent\'s Exist cards here lose their effect.' },
    Yiren:       { displayName: 'Yiren',           effect: 'Other allied cards here gain +1 value.' },
    Tira:        { displayName: 'Tira',            effect: 'Place a card after the opponent plays.' },
    Demae:       { displayName: 'Demae',           effect: 'Move a Value 1 card placed here to the adjacent space.' },
    Feruzu:      { displayName: 'Feruzu',          effect: 'Remove an unboosted opponent card from here.' },
    Kakomi:      { displayName: 'Kakomi',          effect: 'Remove a boosted opponent card from here.' },
    Soi:         { displayName: 'Soi',             effect: 'You may see the top 4 cards of each player\'s deck and choose among them when drawing by effect.' },
    Tanozo:      { displayName: 'Tanozo',          effect: 'If the opponent played here, their card loses its effect.' },
    Foret:       { displayName: 'Foret',           effect: 'Gain +1 value for each card in your hand.' },
    Tanna:       { displayName: 'Tanna',           effect: 'If discarded from or drawn from the deck, it is placed in a random empty slot on the opponent\'s side.' },
    Peroth:      { displayName: 'Peroth',          effect: 'Place a Value 1 card from the Discard Pile in an allied space and reveal it; if none, discard the top 2 cards of the deck.' },
    Henos:       { displayName: 'Henos',           effect: 'Discard a random Value 1 card from each player\'s hand.' },
    Miria:       { displayName: 'Miria',           effect: 'When a Value 1 ally is placed here, discard it and gain +2 value.' },
    Ekuro:       { displayName: 'Ekuro',           effect: 'You may retire an ally to gain +1 value. Exist: When placing a card, you may retire an ally so it gains +1 value.' },
    Filia:       { displayName: 'Filia',           effect: 'You have one fewer slot here.' },
    Naiki:       { displayName: 'Naiki',           effect: 'Both players discard the top 2 cards of their decks.' },
    Kaeka:       { displayName: 'Kaeka',           effect: 'Gain +2 value for each boosted opponent here.' },
    Miboro:      { displayName: 'Miboro',          effect: 'Allied cards placed here are revealed at the end of the match.' },
    En:          { displayName: 'En',              effect: 'Gain +2 value each time someone tries to reduce your Value.' },
    Ponce:       { displayName: 'Ponce',           effect: 'Gain +1 value for each card in the Discard Pile.' },
    Mega:        { displayName: 'Mega',            effect: 'Each ally in a losing space gains +1 value.' },
    Imi:         { displayName: 'Imi',             effect: 'You win ties.' },
    Etza:        { displayName: 'Etza',            effect: 'The other spaces gain +1 value.' },
    Gae:         { displayName: 'Gae',             effect: 'If there are allies here, their values become 0 and this card gains +2.' },
    Iona:        { displayName: 'Iona',            effect: 'Gain +1 value for each empty slot here.' },
    Zao:         { displayName: 'Zao',             effect: 'Gain +1 value for each opponent card here.' },
    Humi:        { displayName: 'Humi',            effect: 'Copy the Reveal effect of a Value 1 opponent here.' },
    Noira:       { displayName: 'Noira',           effect: 'Return an ally to your hand; if it is Value 1, gain +1 value.' },
    Kope:        { displayName: 'Kope',            effect: 'If the opponent did not play here, remove an allied Value 1 card.' },
    Menmei:      { displayName: 'Menmei',          effect: 'Draw a Value 0 and a Value 1 card from the deck.' },
    Nofi:        { displayName: 'Nofi',            effect: 'If the opponent did not play here, place an Ery in another allied space.' },
    Tenpoh:      { displayName: 'Tenpoh',          effect: 'At the end of the turn, each player discards a random card from their deck.' },
    // ── Value 0 ──
    Tei:         { displayName: 'Tei',             effect: 'Search the last 4 cards of your deck for a Value 1 and place it in another space as Value 0 without triggering its Reveal.' },
    Roloc:       { displayName: 'Roloc',           effect: 'The other spaces share this space\'s effect.' },
    Reki:        { displayName: 'Reki',            effect: 'Ignores all effects.' },
    Moira:       { displayName: 'Moira',           effect: 'Remove one allied and one opponent Value 1 card.' },
    Reiza:       { displayName: 'Reiza',           effect: 'Has no Value. Reveal: Add a Kitten to the Extinction Pile.' },
    Yuta:        { displayName: 'Yuta',            effect: 'Randomly change the effect of a space.' },
    Tis:         { displayName: 'Tis',             effect: 'Double the value of the rest of your allies here.' },
    Usei:        { displayName: 'Usei',            effect: 'This card goes extinct if a Value 1 is removed.' },
    Nasu:        { displayName: 'Nasu',            effect: 'The opponent must play here if they can.' },
    Su:          { displayName: 'Su',              effect: 'Allied cards activate regardless of whether the opponent played here or not.' },
    Rasu:        { displayName: 'Rasu',            effect: 'Move a card from here to another space.' },
    Neutra:      { displayName: 'Neutra',          effect: 'Swap this card for an opponent\'s card in this space; if face down, reveal it before swapping.' },
    Resta:       { displayName: 'Resta',           effect: 'Cards in this space have no value and cannot gain any; wins spaces with Real.' },
    Suma:        { displayName: 'Suma',            effect: 'If in your hand, extinguish this card. Draw 1 card from the deck. You cannot use Destined Placement. (Drawn at the start in deck mode)' },
    Una:         { displayName: 'Una',             effect: 'Swap this space\'s effect with another.' },
    // ── Tokens ──
    ErizoPeluche:{ displayName: 'White Plush Hedgehog', effect: 'When you place an ally here, move this card to the top of the deck.' },
    Ery:         { displayName: 'Ery',             effect: 'With Nofi in the same space, both gain +2 value.' },
    Gatito:      { displayName: 'Kitten',          effect: 'At the start of each turn, if in the Discard or Extinction Pile, move to the other.' },
  },
  ja: {
    // ── Valor 1 ──
    Koly:        { displayName: 'コリー',      effect: 'このスペースの味方カードは除去されない。' },
    Chiouri:     { displayName: 'チオウリ',    effect: 'このスペースの最大値は3である。' },
    Gena:        { displayName: 'ジェナ',      effect: '味方1枚が+1値を得る。' },
    Nugu:        { displayName: 'ヌグ',        effect: '相手のこのスペースに白いぬいぐるみハリネズミを置く。' },
    Fukou:       { displayName: 'フコウ',      effect: '次のターン、相手は白いぬいぐるみハリネズミを1枚引く。' },
    Ramia:       { displayName: 'ラミア',      effect: '相手がここにプレイした場合、相手の手札から1枚奪う。' },
    Reina:       { displayName: 'レイナ',      effect: 'ここで最も強化された相手の値を奪う。' },
    Ziru:        { displayName: 'ジル',        effect: '相手の手札を見る。' },
    Mugon:       { displayName: 'ムゴン',      effect: '味方が除去されそうになった場合、代わりに自身を犠牲にする。' },
    'Gran Demonio': { displayName: '大悪魔',   effect: 'このカードと味方1枚を別のスペースへ移動する。' },
    Slau:        { displayName: 'スロウ',      effect: 'ここの他の全カードが-1値を失う。' },
    Hanoe:       { displayName: 'ハノエ',      effect: '味方が移動するたびに+1値を得る。' },
    Faun:        { displayName: 'フォーン',    effect: '最終ターンなら+1値を得る。' },
    Yukoi:       { displayName: 'ユコイ',      effect: '次のターン、配置した値1の味方が+1値を得る。' },
    Abaki:       { displayName: 'アバキ',      effect: '相手がここにプレイした場合、+2値を得る。' },
    Mimimi:      { displayName: 'ミミミ',      effect: 'ターン終了時、手札にある場合、空きスペースに強制的に配置される。' },
    Hobu:        { displayName: 'ホブ',        effect: '相手がここにプレイしなかった場合、ここの存在効果を持つ相手カードの効果が失われる。' },
    Yiren:       { displayName: 'イレン',      effect: 'ここの他の味方カードが+1値を得る。' },
    Tira:        { displayName: 'ティラ',      effect: '相手がプレイした後にカードを配置する。' },
    Demae:       { displayName: 'デマエ',      effect: 'ここに配置された値1のカードを隣のスペースへ移動する。' },
    Feruzu:      { displayName: 'フェルズ',    effect: '強化されていない相手カードをここから除去する。' },
    Kakomi:      { displayName: 'カコミ',      effect: '強化された相手カードをここから除去する。' },
    Soi:         { displayName: 'ソイ',        effect: '各プレイヤーのデッキ上位4枚を確認でき、効果でドローする際に選べる。' },
    Tanozo:      { displayName: 'タノゾ',      effect: '相手がここにプレイした場合、その相手カードの効果を失わせる。' },
    Foret:       { displayName: 'フォレット',  effect: '手札の枚数分+1値を得る。' },
    Tanna:       { displayName: 'タンナ',      effect: 'デッキから捨てられた場合、またはドローされた場合、相手のランダムな空きスロットに配置される。' },
    Peroth:      { displayName: 'ペロット',      effect: '捨て山から値1のカードを味方スペースに置いて公開する。なければデッキ上2枚を捨てる。' },
    Henos:       { displayName: 'ヘノス',      effect: '両プレイヤーの手札から値1のカードをランダムに1枚捨てる。' },
    Miria:       { displayName: 'ミリア',      effect: '値1の味方がここに配置されると、それを捨て+2値を得る。' },
    Ekuro:       { displayName: 'エクロ',      effect: '味方を退かして+1値を得られる。存在：カード配置時に味方を退かしてそのカードに+1値を与えられる。' },
    Filia:       { displayName: 'フィリア',    effect: 'このスペースのスロットが1つ減る。' },
    Naiki:       { displayName: 'ナイキ',      effect: '両プレイヤーのデッキ上位2枚をそれぞれ捨てる。' },
    Kaeka:       { displayName: 'カエカ',      effect: 'ここで強化された相手1枚につき+2値を得る。' },
    Miboro:      { displayName: 'ミボロ',      effect: '配置された味方カードはゲーム終了時に公開される。' },
    En:          { displayName: 'エン',        effect: '値を下げようとされるたびに+2値を得る。' },
    Ponce:       { displayName: 'ポンス',      effect: '捨て山のカード枚数分+1値を得る。' },
    Mega:        { displayName: 'メガ',        effect: '負けているスペースにいる全味方が+1値を得る。' },
    Imi:         { displayName: 'イミ',        effect: '引き分けを制する。' },
    Etza:        { displayName: 'エツザ',      effect: '他のスペースが+1値を得る。' },
    Gae:         { displayName: 'ガエ',        effect: 'ここに味方がいる場合、その値を0にしてこのカードが+2を得る。' },
    Iona:        { displayName: 'イオナ',      effect: 'ここの空きスロット1つにつき+1値を得る。' },
    Zao:         { displayName: 'ザオ',        effect: 'ここの相手カード1枚につき+1値を得る。' },
    Humi:        { displayName: 'ヒュミ',      effect: 'ここにいる値1の相手の公開効果をコピーする。' },
    Noira:       { displayName: 'ノイラ',      effect: '味方1枚を手札に戻す。値1なら+1値を得る。' },
    Kope:        { displayName: 'コペー',        effect: '相手がここにプレイしなかった場合、値1の味方カードを1枚除去する。' },
    Menmei:      { displayName: 'メンメイ',    effect: 'デッキから値0と値1のカードをそれぞれ1枚引く。' },
    Nofi:        { displayName: 'ノフィ',      effect: '相手がここにプレイしなかった場合、別の味方スペースにエリーを置く。' },
    Tenpoh:      { displayName: 'テンポー',    effect: 'ターン終了時、各プレイヤーはデッキからランダムに1枚捨てる。' },
    // ── Valor 0 ──
    Tei:         { displayName: 'テイ',        effect: 'デッキ下位4枚から値1を1枚探し、公開効果を発動せずに値0として別スペースに配置する。' },
    Roloc:       { displayName: 'ロロク',      effect: '他の全スペースがこのスペース効果を持つ。' },
    Reki:        { displayName: 'レキ',        effect: '全ての効果を無視する。' },
    Moira:       { displayName: 'モイラ',      effect: '値1の味方と相手をそれぞれ1枚除去する。' },
    Reiza:       { displayName: 'レイザ',      effect: '値を持たない。公開：絶滅山に子猫を1枚加える。' },
    Yuta:        { displayName: 'ユタ',        effect: 'スペース効果をランダムに1つ変更する。' },
    Tis:         { displayName: 'ティス',      effect: 'ここの他の味方の値を全て2倍にする。' },
    Usei:        { displayName: 'ウセイ',      effect: '値1が除去された場合、このカードは絶滅する。' },
    Nasu:        { displayName: 'ナス',        effect: '相手はできる限りここにプレイしなければならない。' },
    Su:          { displayName: 'ス',          effect: '味方カードはここにプレイしたかどうかに関わらず効果が発動する。' },
    Rasu:        { displayName: 'ラス',        effect: 'ここから別スペースへカードを1枚移動する。' },
    Neutra:      { displayName: 'ニュートラ',  effect: 'このスペースの相手カード1枚とこのカードを交換する。裏向きなら交換前に公開する。' },
    Resta:       { displayName: 'レスタ',      effect: 'このスペースのカードは値を持たず得られない。リアルでスペースを制する。' },
    Suma:        { displayName: 'スマ',        effect: '手札にある場合、このカードを絶滅させる。デッキから1枚引く。運命配置は使用不可。（構築では最初にドロー）' },
    Una:         { displayName: 'ウナ',        effect: 'このスペースの効果を別スペースと交換する。' },
    // ── トークン ──
    ErizoPeluche:{ displayName: '白いぬいぐるみハリネズミ', effect: 'ここに味方を配置するとき、このカードをデッキの一番上へ移動する。' },
    Ery:         { displayName: 'エリー',      effect: '同じスペースにノフィがいる場合、両者が+2値を得る。' },
    Gatito:      { displayName: '子猫',        effect: '各ターン開始時、捨て山か絶滅山にある場合、もう一方へ移動する。' },
  },
};

// ── ヘルパー: 現在の言語でカードの表示名とエフェクトを取得 ──
function getCardDisplay(cardName) {
  const lang = window.CURRENT_LANG || 'es';
  if (lang === 'ja' && CARD_TRANSLATIONS.ja[cardName]) {
    return CARD_TRANSLATIONS.ja[cardName];
  }
  if (lang === 'en' && CARD_TRANSLATIONS.en[cardName]) {
    return CARD_TRANSLATIONS.en[cardName];
  }
  // ES: usar datos originales del CARD_DB / TOKENS
  const base = CARD_DB?.[cardName] || TOKENS?.[cardName];
  const DISPLAY_NAMES = { 'ErizoPeluche': 'Erizo de Peluche Blanco', 'Ery': 'Ery', 'Gatito': 'Gatito' };
  return {
    displayName: DISPLAY_NAMES[cardName] || cardName,
    effect: base?.effect || '',
  };
}

// ── ヘルパー: 解放条件を現在の言語で取得 ──
const UNLOCK_CONDITIONS_JA = {
  Fukou:        { title: 'ぬいぐるみ好き',    text: '相手が白いぬいぐるみハリネズミを持っていたスペースを制する。' },
  Reina:        { title: 'こそ泥',            text: '1試合で相手の手札から2枚以上奪う。' },
  Mugon:        { title: '救済',              text: 'コリーでカードの除去を防ぐ。' },
  Ziru:         { title: '才女',              text: '1試合で「相手がここにプレイした場合」条件を持つカードを2枚以上発動させる。' },
  Yukoi:        { title: '楽観主義者',        text: '最終ターンにフォーンの効果で負けていたスペースを制する。' },
  Mimimi:       { title: '外出恐怖症',        text: '全スロットがカードで埋まった状態で試合を終える。' },
  Yiren:        { title: '秘書',              text: '1試合でエクロを味方の上に置き、さらに別の味方の上にカードを置く。' },
  Etza:         { title: '雲の上の残骸',      text: '1試合でジェナとユコイを使って別スペースの味方に値を与える。' },
  Reki:         { title: '夢想家',            text: '不明' },
  Tira:         { title: '戦略家',            text: '1試合で3つ全てのスペースを制する。' },
  Demae:        { title: '大惨事',            text: '1試合で3枚以上のカードを移動する。' },
  'Gran Demonio':{ title: 'タクシー運転手',   text: '1試合で2枚以上のカードを移動する。' },
  Chiouri:      { title: '明確な限界',        text: '1試合で3つ全てのスペースで値3以上を持たずに勝つ。' },
  Slau:         { title: '盲目の正義',        text: '1試合で3スペース全て失う。' },
  Kakomi:       { title: '桜の実三つ',        text: '1試合で1ターンにフェルズで3枚除去する。' },
  Tanozo:       { title: '不運',              text: '1試合で相手が2つのスペースで値を得られないようにする。' },
  Tanna:        { title: '道化師',            text: '相手陣地のミミミでスペースを制する。' },
  Peroth:       { title: '罪',                text: '1試合でポンスの値を5にする。' },
  Henos:        { title: 'いたずら者',        text: 'ナイキを3回配置する。' },
  Foret:        { title: '倒錯',              text: '1試合で手札を5枚以上持つ。' },
  Nofi:         { title: '君の傍に',          text: '運命配置を3回行う。' },
  Menmei:       { title: '真実を求めて',      text: '1ターンにノフィを置き、エリーを同じスペースに集める。' },
  Filia:        { title: '空きスロット',      text: '「スロットが1つだけ」効果のスペースで値0のカードを使って勝つ。' },
  Tis:          { title: '存在',              text: '「存在効果が2倍」効果のスペースで存在カード3枚で試合を終える。' },
  Reiza:        { title: 'ニヒリズム',        text: '「値0が絶滅」効果のスペースで値0カードを絶滅させる。' },
  Resta:        { title: '受容',              text: '「より少ない値のカードが多い方が勝つ」効果のスペースを勝った試合に勝つ。' },
  Roloc:        { title: '色',                text: 'テイを使って存在・公開・特殊の各タイプを1枚ずつ配置する。' },
  Usei:         { title: '運命',              text: 'リアルを7回見た。' },
  Su:           { title: '真実',              text: '「相手がここにプレイしたか否か」条件の効果を合計10回成功させる。' },
  Neutra:       { title: 'カード好き',        text: '相手の手札からレキを奪う。' },
  Suma:         { title: '愛情',              text: '値0カードを使わず運命配置もせずに試合に勝つ。' },
  Una:          { title: '観客',              text: 'リアルのスペースにレキを置いて勝つ。' },
  Miria:        { title: 'とげ',              text: '1試合で勝ち・引き分け・負けを1スペースずつで終える。' },
  Kaeka:        { title: '勇気',              text: '追加値を持つ味方3枚がいるスペースで試合に勝つ。' },
  Miboro:       { title: '目隠し',            text: '「カードがゲーム終了時に公開される」効果のスペースを制する。' },
  Imi:          { title: '幸運',              text: '3スペース全て引き分けで試合を終える。' },
  Gae:          { title: '刺激',              text: '同じスペースに値0を2枚と値1を1枚で試合を終える。' },
  Zao:          { title: '弱者の力',          text: '追加値を持つ味方なしで試合に勝つ。' },
  Humi:         { title: '嫉妬',              text: '公開タイプのカードだけで試合に勝つ。' },
  Kope:         { title: '不幸',              text: '相手に合計6枚除去された。' },
  Tenpoh:       { title: '盲目',              text: 'デッキからペロスを捨て山へ送る。' },
  Soi:          { title: '予防の炎',          text: '1試合でジルとティラを配置する。' },
  Moira:        { title: '絶望',              text: 'ウセイの効果でスペースを絶滅させる。' },
};

// ── Space effect display translations (EN / JA) ──────────────────────
// The Spanish strings in SPACE_EFFECTS are used as game-logic keys.
// These tables are for *display only*.
const SPACE_EFFECTS_EN = {
  "Tu mayor Valor aquí se mantiene hasta que lo superes.":
    "Your highest Value here is preserved until you surpass it.",
  "Los efectos de cartas ajenas a este espacio no aplican aquí.":
    "Effects from cards outside this space do not apply here.",
  "Los efectos de Revelar se repiten una vez más.":
    "Reveal effects trigger one additional time.",
  "La partida se alarga un turno.":
    "The match is extended by one turn.",
  "El resto de efectos de espacio están desactivados.":
    "All other space effects are disabled.",
  "Las cartas aquí se revelan al final de la partida.":
    "Cards here are revealed at the end of the match.",
  "Las cartas en este espacio no pueden ser movidas.":
    "Cards in this space cannot be moved.",
  "Los efectos de Existir se duplican aquí.":
    "Exist effects are doubled here.",
  "Las cartas de Valor 0 colocadas aquí se extinguen.":
    "Value 0 cards placed here go extinct.",
  "Los personajes no pueden ser removidos aquí.":
    "Characters cannot be removed here.",
  "Sólo hay un hueco aquí.":
    "There is only one slot here.",
  "Los Valor 1 pierden -1 valor aquí.":
    "Value 1 cards lose -1 value here.",
  "Los efectos de existir no funcionan aquí.":
    "Exist effects do not work here.",
  "El valor de los espacios ya no va por separado.":
    "Space values are no longer counted separately.",
  "Este espacio lo gana quien tenga más cartas con menos valor.":
    "This space is won by whoever has more cards with lower value.",
  "Aquí sólo cuenta quien más cartas de valor 0 tenga.":
    "Only whoever has more Value 0 cards wins here.",
  "Solo puede haber una carta de Valor 0 y una de Valor 1 aquí.":
    "Only one Value 0 card and one Value 1 card can be here.",
  "Al final de la partida, si hay una carta de existir, revelar y especial, remueve una carta del rival aquí.":
    "At the end of the match, if there is an Exist, Reveal and Special card, remove one opponent card here.",
  "No puedes activar Colocación Destinada.":
    "You cannot use Destined Placement.",
  "Sin efecto.": "No effect.",
  "Este espacio se bloquea tras el turno 2.": "This space is blocked after turn 2.",
  "Se revelan los efectos del resto de espacios.": "The effects of the other spaces are revealed.",
  "Cambia el efecto de todos los espacios.": "Changes the effect of all spaces.",
  "Cada turno, el resto de efectos de Espacios cambia.": "Each turn, the other Space effects change.",
  "Aquí sólo cuenta quien más personajes tenga.": "Only whoever has more characters wins here.",
  "Bloqueado, invalorable, extingue las cartas.": "Blocked, valueless, extinguishes cards.",
};

const SPACE_EFFECTS_JA = {
  "Tu mayor Valor aquí se mantiene hasta que lo superes.":
    "ここで達成した最高値は、それを超えるまで保持される。",
  "Los efectos de cartas ajenas a este espacio no aplican aquí.":
    "このスペース外のカードの効果はここに適用されない。",
  "Los efectos de Revelar se repiten una vez más.":
    "公開効果がもう一度発動する。",
  "La partida se alarga un turno.":
    "試合が1ターン延長される。",
  "El resto de efectos de espacio están desactivados.":
    "他のスペース効果はすべて無効化される。",
  "Las cartas aquí se revelan al final de la partida.":
    "ここのカードは試合終了時に公開される。",
  "Las cartas en este espacio no pueden ser movidas.":
    "このスペースのカードは移動できない。",
  "Los efectos de Existir se duplican aquí.":
    "存在効果がここで2倍になる。",
  "Las cartas de Valor 0 colocadas aquí se extinguen.":
    "ここに配置された値0のカードは絶滅する。",
  "Los personajes no pueden ser removidos aquí.":
    "ここではキャラクターを除去できない。",
  "Sólo hay un hueco aquí.":
    "ここにはスロットが1つしかない。",
  "Los Valor 1 pierden -1 valor aquí.":
    "値1のカードはここで-1値を失う。",
  "Los efectos de existir no funcionan aquí.":
    "ここでは存在効果が機能しない。",
  "El valor de los espacios ya no va por separado.":
    "スペースの値は個別に計算されない。",
  "Este espacio lo gana quien tenga más cartas con menos valor.":
    "より少ない値のカードを多く持つプレイヤーがこのスペースを制する。",
  "Aquí sólo cuenta quien más cartas de valor 0 tenga.":
    "ここでは値0のカードを多く持つ方のみが勝つ。",
  "Solo puede haber una carta de Valor 0 y una de Valor 1 aquí.":
    "ここには値0のカードと値1のカードがそれぞれ1枚しか置けない。",
  "Al final de la partida, si hay una carta de existir, revelar y especial, remueve una carta del rival aquí.":
    "試合終了時、存在・公開・特殊のカードが揃っていれば、ここの相手カードを1枚除去する。",
  "No puedes activar Colocación Destinada.":
    "運命配置は使用できない。",
  "Sin efecto.": "効果なし。",
  "Este espacio se bloquea tras el turno 2.": "ターン2以降、このスペースはブロックされる。",
  "Se revelan los efectos del resto de espacios.": "他のスペースの効果が公開される。",
  "Cambia el efecto de todos los espacios.": "全スペースの効果が変わる。",
  "Cada turno, el resto de efectos de Espacios cambia.": "毎ターン、他のスペース効果が変わる。",
  "Aquí sólo cuenta quien más personajes tenga.": "ここではキャラクターが最も多い方が勝つ。",
  "Bloqueado, invalorable, extingue las cartas.": "ブロック済み・値なし・カードを絶滅させる。",
};

/** Returns the display text for a space effect in the current language. */
function getSpaceEffectText(esText) {
  if (!esText) return esText;
  const lang = window.CURRENT_LANG || 'es';
  if (lang === 'en') return SPACE_EFFECTS_EN[esText] || esText;
  if (lang === 'ja') return SPACE_EFFECTS_JA[esText] || esText;
  return esText;
}

// ── EN unlock conditions (hitos) ─────────────────────────────────────
const UNLOCK_CONDITIONS_EN = {
  Fukou:  { title: 'Plush Lover',         text: 'Win a space where the opponent had a White Plush Hedgehog.' },
  Reina:  { title: 'Pickpocket',          text: 'In one match, steal 2 or more cards from the opponent\'s hand.' },
  Mugon:  { title: 'Salvation',           text: 'Use Koly to prevent a card from being removed.' },
  Ziru:   { title: 'Clever Girl',         text: 'In one match, trigger 2 cards with the condition «if the opponent played here».' },
  Yukoi:  { title: 'Optimist',            text: 'Win a lost space using Faun\'s effect on the last turn.' },
  Mimimi: { title: 'Agoraphobia',         text: 'Finish a match with all slots occupied by cards.' },
  Yiren:  { title: 'Secretary',           text: 'In one match, place Ekuro on an ally and then place another card on an ally.' },
  Etza:   { title: 'Remnants in the Clouds', text: 'In one match, use Gena and Yukoi to give value to an ally in another space.' },
  Reki:   { title: 'Dreamer',             text: 'Unknown' },
  Tira:        { title: 'Strategist',     text: 'In one match, win all three spaces.' },
  Demae:       { title: 'Disaster',       text: 'In one match, move 3 or more cards.' },
  'Gran Demonio': { title: 'Taxi Driver', text: 'In one match, move 2 or more cards.' },
  Chiouri:     { title: 'Clear Limits',   text: 'In one match, win without having 3 or more value in all three spaces.' },
  Slau:        { title: 'Blind Justice',  text: 'In one match, lose all 3 spaces.' },
  Kakomi:      { title: 'Three Cherries', text: 'In one match, remove 3 cards with Feruzu in a single turn.' },
  Tanozo:      { title: 'Misfortune',     text: 'In one match, prevent the opponent from gaining any value in two spaces.' },
  Tanna:  { title: 'Jester',              text: 'Win a space with your Mimimi on the opponent\'s side.' },
  Peroth: { title: 'The Sin',             text: 'In one match, make Ponce reach 5 value.' },
  Henos:  { title: 'Prankster',           text: 'Place Naiki three times.' },
  Foret:  { title: 'Perversion',          text: 'In one match, have 5 cards in your hand.' },
  Nofi:   { title: 'By Your Side',        text: 'Use Destined Placement three times.' },
  Menmei: { title: 'Seeking the Truth',   text: 'In one turn, place Nofi and get Ery into the same space as Nofi.' },
  Filia:  { title: 'The Slot',            text: 'Win a space with the "Only one slot here" effect using a Value 0 card.' },
  Tis:    { title: 'Existence',           text: 'Finish a match with 3 Exist cards in a space with the "Exist effects are doubled here" effect.' },
  Reiza:  { title: 'Nihilism',            text: 'Extinguish a Value 0 card in a space with the "Value 0 cards placed here go extinct" effect.' },
  Resta:  { title: 'Acceptance',          text: 'Win a match with the "This space is won by whoever has more cards with lower value" space effect won.' },
  Roloc:  { title: 'The Color',           text: 'Use Tei to place one card of each type: 1 Exist, 1 Reveal and 1 Special.' },
  Usei:   { title: 'The Destiny',         text: 'You have seen Real 7 times.' },
  Su:     { title: 'The Truth',           text: 'Successfully trigger 10 times an effect of "Whether or not the opponent played here".' },
  Neutra: { title: 'Card Lover',          text: 'Steal Reki from the opponent\'s hand.' },
  Suma:   { title: 'Affection',           text: 'Win a match without using Value 0 cards or performing a Destined Placement.' },
  Una:    { title: 'Spectator',           text: 'Win by placing Reki in a space with Real.' },
  Miria:  { title: 'Thorns',              text: 'In one match, finish with one space won, one tied and one lost.' },
  Kaeka:  { title: 'Courage',             text: 'Win a match with a space containing 3 allies with bonus value.' },
  Miboro: { title: 'Blindfolded',         text: 'In one match, win a space with the "Cards here are revealed at the end of the match" effect.' },
  Imi:    { title: 'Luck',                text: 'Finish a match with all 3 spaces tied.' },
  Gae:    { title: 'Stimulation',         text: 'Finish a match with 2 Value 0 cards and 1 Value 1 card in the same space.' },
  Zao:    { title: 'Strength of the Weak',text: 'Win a match without any allies with bonus value.' },
  Humi:   { title: 'Envy',               text: 'Win a match using only Reveal type cards.' },
  Kope:   { title: 'Unhappiness',         text: 'The opponent removed 6 of your cards.' },
  Tenpoh: { title: 'Blindness',           text: 'Send Peroth from the deck to the Discard Pile.' },
  Soi:    { title: 'Preventive Flame',    text: 'In one match, place both Ziru and Tira.' },
  Moira:  { title: 'Desperate',           text: 'Extinguish a space using Usei\'s effect.' },
};

function getUnlockCondition(cardName) {
  const lang = window.CURRENT_LANG || 'es';
  if (lang === 'ja' && UNLOCK_CONDITIONS_JA[cardName]) {
    return UNLOCK_CONDITIONS_JA[cardName];
  }
  if (lang === 'en' && UNLOCK_CONDITIONS_EN[cardName]) {
    return UNLOCK_CONDITIONS_EN[cardName];
  }
  return UNLOCK_CONDITIONS[cardName] || null;
}

// ── Detección automática de idioma ──────────────────────
(function detectLang() {
  const saved = localStorage.getItem('rd_lang');
  if (saved && I18N[saved]) { window.CURRENT_LANG = saved; return; }
  const nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
  if (nav.startsWith('ja'))      window.CURRENT_LANG = 'ja';
  else if (nav.startsWith('en')) window.CURRENT_LANG = 'en';
  else                           window.CURRENT_LANG = 'es';
})();

function t(key) {
  return (I18N[window.CURRENT_LANG] || I18N.es)[key] || (I18N.es[key] || key);
}

function setLang(lang) {
  if (!I18N[lang]) return;
  window.CURRENT_LANG = lang;
  localStorage.setItem('rd_lang', lang);
  applyTranslations();
  // Re-render game board if a game is active
  if (typeof render === 'function' && typeof G !== 'undefined' && G.phase && G.phase !== 'end') {
    render();
  }
  // Re-render card browser if open
  if (typeof renderCardBrowser === 'function') {
    const browser = document.getElementById('card-browser');
    if (browser && browser.style.display !== 'none') renderCardBrowser();
  }
}

function applyTranslations() {
  const L = window.CURRENT_LANG;
  // Título del menú
  _setText('menu-title',            t('menu_title'));   // [Corregido] el título ya no es un enlace (la web está en el botón 🌐)
  // Menú principal
  _setText('btn-menu-play',         t('menu_play'));
  _setText('btn-deck-game-menu',    t('menu_play_deck'));
  _setText('btn-card-browser-menu', t('menu_cards_decks'));
  _setText('btn-hitos-menu',        t('menu_hitos'));
  _setText('btn-rules-menu',        t('menu_rules'));
  _setText('btn-options-menu',      t('menu_options'));
  _setText('btn-profile-menu',      t('menu_profile'));
  // FAB in-game
  _setText('fab-menu-title',        t('fab_title'));
  _setText('btn-play-again',        t('fab_play_again'));
  _setText('btn-exit-menu-fab',     t('fab_exit'));
  _setHtml('btn-historial-inline',  t('fab_log') + ' <span class="log-badge" id="log-badge-count">0</span>');
  _setText('btn-cartas-inline',     t('fab_cards'));
  _setText('btn-reglas-inline',     t('fab_rules'));
  _setText('btn-options-fab',       t('fab_options'));
  _setText('btn-fullscreen',        t('fab_fullscreen'));
  _setText('btn-abandon',           t('fab_abandon'));
  // Botón fin de partida
  _setText('end-btn-menu',          t('btn_exit_menu'));
  // Pilas
  _setText('deck-label',            t('label_deck'));
  _setText('discard-label',         t('label_discard'));
  _setText('extinct-label',         t('label_extinct'));
  // Hitos
  _setText('hitos-back-btn',        t('hitos_back'));
  _setText('hitos-header-title',    t('hitos_title'));
  _setAttr('hitos-search', 'placeholder', t('hitos_search'));
  // Hitos filters & UI
  document.querySelectorAll('#hitos-filters .hitos-filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    if (f === 'all')   btn.textContent = t('hitos_filter_all');
    if (f === 'done')  btn.textContent = t('hitos_filter_done');
    if (f === 'v1')    btn.textContent = t('hitos_filter_v1');
    if (f === 'v0')    btn.textContent = t('hitos_filter_v0');
    if (f === 'token') btn.textContent = t('hitos_filter_token');
  });
  _setText('hitos-global-label',    t('hitos_progress'));
  _setText('hitos-empty',           t('hitos_empty'));
  const toastTitle = document.querySelector('#hito-toast .toast-title');
  if (toastTitle) toastTitle.textContent = t('hitos_toast_title');
  // Perfil
  _setText('profile-name-display',  t('profile_player'));
  _setAttr('profile-name-input', 'placeholder', t('profile_name_ph'));
  _setText('profile-stats-section-label', t('profile_history'));
  _setText('ps-wins-label',         t('profile_wins'));
  _setText('ps-draws-label',        t('profile_draws'));
  _setText('ps-losses-label',       t('profile_losses'));
  _setText('ps-winrate-label',      t('profile_winrate'));
  _setText('ps-streak-w-label',     t('profile_streak_w'));
  _setText('ps-streak-d-label',     t('profile_streak_d'));
  _setText('ps-streak-l-label',     t('profile_streak_l'));
  _setText('ps-real-label',         t('profile_real'));
  _setText('cs-toggle-btn',         t('profile_card_stats'));
  _setText('profile-collection-label', t('profile_collection'));
  _setText('profile-signature-label',  t('profile_signature'));
  _setText('profile-sig-desc',      t('profile_sig_desc'));
  _setText('profile-games-label',   t('profile_games'));
  _setText('profile-avatar-picker-title', t('profile_avatar_title'));
  _setText('profile-title-picker-title',  t('profile_title_picker'));
  _setText('replay-back-btn',       t('replay_back'));
  // Card Browser
  _setText('cb-back-btn',           t('cb_back'));
  _setText('cb-header-title',       t('cb_title'));
  _setText('cb-presets-btn',        t('cb_presets'));
  _setText('cb-new-deck-btn',       t('cb_new_deck'));
  _setText('cb-rename-deck-btn',    t('cb_rename'));
  _setAttr('cb-search', 'placeholder', t('cb_search'));
  _setText('cb-size-label',         t('cb_size_label'));
  // Card browser filter buttons
  document.querySelectorAll('.cb-filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    if (f === 'in-deck')   btn.textContent = t('cb_filter_in_deck');
    if (f === 'val1')      btn.textContent = t('cb_filter_val1');
    if (f === 'val0')      btn.textContent = t('cb_filter_val0');
    if (f === 'reveal')    btn.textContent = t('cb_filter_reveal');
    if (f === 'exist')     btn.innerHTML   = '<span style="font-size:1.3em;vertical-align:-0.1em;line-height:0;">♾</span> ' + t('cb_filter_exist').replace('♾ ', '');
    if (f === 'special')   btn.textContent = t('cb_filter_special');
    if (f === 'token')     btn.textContent = t('cb_filter_token');
    if (f === 'favorites') btn.textContent = t('cb_filter_fav');
    if (f === 'unlocked')  btn.textContent = t('cb_filter_unlocked');
    if (f === 'locked')    btn.textContent = t('cb_filter_locked');
  });
  // Deck Game
  _setText('dg-header-title',       t('dg_title'));
  _setText('dg-presets-btn',        t('dg_presets'));
  _setText('dg-new-deck-btn',       t('dg_new_deck'));
  _setText('dg-slot-label-0',       t('dg_slot1'));
  _setText('dg-slot-label-1',       t('dg_slot2'));
  _setText('dg-start-btn',          t('dg_start'));
  // Deck Game random buttons
  document.querySelectorAll('.dg-random-btn').forEach(btn => {
    const m = btn.dataset.mode;
    if (m === 'all')    btn.textContent = t('dg_random_all');
    if (m === 'basic')  btn.textContent = t('dg_random_basic');
    if (m === 'custom') btn.textContent = t('dg_random_custom');
  });
  // Slot "Sin mazo" labels (only if not already set to a deck name by JS)
  ['dg-slot-name-0','dg-slot-name-1'].forEach(id => {
    const el = document.getElementById(id);
    if (el && (!el.dataset.deckSet || el.dataset.deckSet === 'false')) el.textContent = t('dg_no_deck');
  });
  // Options modal
  _setText('opt-title-label',          t('opt_title'));
  _setText('opt-mobile-label',         t('opt_mobile'));
  _setText('opt-cat-visual-btn',       t('opt_cat_visual'));
  _setText('opt-cat-sound-btn',        t('opt_cat_sound'));
  _setText('opt-cat-save-btn',         t('opt_cat_save'));
  _setText('opt-hand-raised-label',    t('opt_hand_raised'));
  _setText('opt-paso-label',           t('opt_paso'));   // [Nuevo]
  _setText('opt-hand-opacity-label-text', t('opt_hand_opacity'));
  _setText('opt-card-font-label',      t('opt_card_font'));
  _setText('opt-anim-speed-label',     t('opt_anim_speed'));
  _setText('opt-show-name-label',      t('opt_show_name'));
  _setText('opt-show-type-label',      t('opt_show_type'));
  _setText('opt-show-type-text-label', t('opt_show_type_text'));
  _setText('opt-show-effect-label',    t('opt_show_effect'));
  _setText('opt-sfx-label',            t('opt_sfx'));
  _setText('opt-music-label',          t('opt_music'));
  _setText('opt-save-code-label',      t('opt_save_code_label'));
  _setText('opt-copy-code-btn',        t('opt_copy_code'));
  _setText('opt-paste-code-btn',       t('opt_paste_code'));
  _setText('opt-reset-btn',            t('opt_reset_save'));
  // Toggle buttons (only if not yet set to On by JS)
  const _toggles = [
    ['opt-mobile-mode-btn','opt-show-name-btn','opt-show-type-btn',
     'opt-show-type-text-btn','opt-show-effect-btn','opt-hand-raised-btn']
  ].flat();
  _toggles.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('on')) el.textContent = t('toggle_yes');
    else el.textContent = t('toggle_no');
  });
  // End-of-game buttons
  _setText('end-btn-play',   t('end_play_again'));
  _setText('end-btn-board',  t('end_view_board'));
  // Selector de idioma: actualizar botones activos (menú principal + FAB)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn-active', btn.dataset.lang === L);
  });
  // Etiqueta de versión
  _setText('menu-version-label', t('menu_version'));
  // Etiqueta de botón bloqueado en el menú
  const _lockedDeckBtn = document.getElementById('btn-deck-game-menu');
  if (_lockedDeckBtn) _lockedDeckBtn.setAttribute('data-locked-label', t('locked_label'));
}

function _setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function _setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function _setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}
