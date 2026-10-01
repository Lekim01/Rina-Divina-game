/* Riña Divina — JUGAR CON UN AMIGO (en línea)   [Nuevo]
   Cada uno en su ordenador. Uno crea una sala y le pasa el código al otro.
   - Conexión directa entre los dos navegadores (PeerJS, en codigo/peerjs.min.js;
     solo usa su servidor gratuito para que los dos se encuentren).
   - Sala: los dos ven el perfil del otro (nombre, nivel, título y avatar). Cada uno
     elige su mazo sin que el otro vea cuál; solo se ve «mazo elegido» y «¡listo!».
     Cuando los dos están listos, la partida empieza a los 3 segundos.
   - Durante la partida manda quien creó la sala (anfitrión): su juego hace las
     reglas y le envía al otro (invitado) cómo va el tablero. El invitado coloca
     sus cartas y, cuando un efecto suyo pide elegir, elige él en su pantalla.
   - Las partidas con un amigo cuentan para tu perfil (partidas, experiencia e
     historial); los desbloqueos solo cuentan para quien crea la sala.
   Notas para pruebas: con localStorage 'rd_red_prueba' = '1' la conexión se hace
   entre pestañas del mismo navegador (BroadcastChannel), sin internet. */
(function(){
  const L = () => window.CURRENT_LANG || 'es';
  const T = (es, en, ja) => ({ es, en, ja })[L()] || es;
  const ms = v => Math.round(v * (OPTIONS.speedFactor || 1) * (typeof RITMO_BASE !== 'undefined' ? RITMO_BASE : 1));

  const RED = window.RD_RED = {
    activo: false, anfitrion: false, enPartida: false, conectado: false,
    codigo: '', yo: null, amigo: null,
    sala: { yo: { eligio: false, listo: false }, amigo: { eligio: false, listo: false }, cuenta: null },
    miEleccion: { modo: 'all', clave: null }, mazoAmigo: null, miMazo: null, mazoPropio: false,   // por defecto, un mazo compartido
    // anfitrión
    ventana: 0, jugada: null, esperandoJugada: false, preguntaId: 0, preguntas: new Map(), logsEnviados: 0, pid: 0,
    // invitado
    miJugada: null, colaPreguntas: [], estado: null, pidVisto: 0, unlockPropio: null, ultimoFoto: null,
  };
  const nombreAmigo = () => (RED.amigo && RED.amigo.nombre) || T('Tu amigo', 'Your friend', '友達');
  window.rdNombreRival = () => (RED.enPartida ? nombreAmigo() : null);

  /* ══════════════ CONEXIÓN ══════════════ */
  const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const nuevoCodigo = () => Array.from({ length: 5 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('');
  const PREFIJO = 'rinadivina-sala-';
  let peer = null, conn = null, canal = null;
  const modoPrueba = () => { try { return localStorage.getItem('rd_red_prueba') === '1'; } catch (e) { return false; } };

  function cargarPeerJS(){
    if (window.Peer) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = './codigo/peerjs.min.js';
      s.onload = () => window.Peer ? res() : rej(new Error('PeerJS'));
      s.onerror = () => rej(new Error('PeerJS'));
      document.head.appendChild(s);
    });
  }
  function enviar(o){
    try {
      if (canal) canal.postMessage({ de: RED.anfitrion ? 'A' : 'I', o });
      else if (conn && conn.open) conn.send(o);
    } catch (e) { console.warn('red', e); }
  }
  function alConectar(){
    RED.conectado = true; RED.ultimoMensaje = performance.now();
    enviar({ t: 'hola', perfil: miPerfil() });
    if (RED.anfitrion) enviar({ t: 'modoMazo', propio: RED.mazoPropio });
    pintarSala();
  }
  function alCerrar(){
    if (!RED.activo) return;
    const estaba = RED.enPartida;
    salirDeRed(false);
    avisoGrande(T('Se ha perdido la conexión con tu amigo.', 'The connection with your friend was lost.', '友達との接続が切れました。'), () => { if (estaba) showMenu(); });
  }
  function fallo(msg){ salirDeRed(false); pintarSala(); estadoSala(msg, true); }
  function textoError(e){
    const t = e && e.type;
    if (t === 'peer-unavailable') return T('No se encuentra esa sala. Revisa el código.', 'Room not found. Check the code.', 'ルームが見つかりません。コードを確認してください。');
    if (t === 'browser-incompatible') return T('Este navegador no permite jugar en línea.', 'This browser cannot play online.', 'このブラウザはオンライン対戦に対応していません。');
    if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return T('No se puede conectar con el servidor de salas. Revisa tu conexión a internet.', 'Cannot reach the room server. Check your internet connection.', 'ルームサーバーに接続できません。');
    return T('Error de conexión', 'Connection error', '接続エラー') + (t ? ` (${t})` : '');
  }
  function prepararConexion(c){
    conn = c;
    c.on('open', alConectar);
    c.on('data', d => recibir(d));
    c.on('close', alCerrar);
    c.on('error', e => console.warn('conn', e));
    if (c.open) alConectar();
  }
  async function crearSala(){
    salirDeRed(false);
    RED.activo = true; RED.anfitrion = true; RED.codigo = nuevoCodigo();
    estadoSala(T('Creando la sala…', 'Creating the room…', 'ルームを作成中…'));
    if (modoPrueba()){
      canal = new BroadcastChannel('rd-sala-' + RED.codigo);
      canal.onmessage = ev => { const m = ev.data; if (!m || m.de === 'A') return; if (m.o && m.o.t === '__unir'){ canal.postMessage({ de: 'A', o: { t: '__ok' } }); alConectar(); return; } recibir(m.o); };
      pintarSala(); return;
    }
    try { await cargarPeerJS(); } catch (e){ fallo(T('No se pudo cargar la conexión.', 'Could not load the connection.', '接続を読み込めませんでした。')); return; }
    peer = new Peer(PREFIJO + RED.codigo, { debug: 0 });
    peer.on('open', () => pintarSala());
    peer.on('connection', c => { if (conn && conn.open){ c.close(); return; } prepararConexion(c); });
    peer.on('error', e => {
      if (e && e.type === 'unavailable-id'){ peer.destroy(); peer = null; crearSala(); return; }
      if (RED.conectado && e && e.type === 'network') return;   // la partida sigue por la conexión directa
      fallo(textoError(e));
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
  }
  async function unirse(codigo){
    codigo = String(codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (codigo.length < 4){ estadoSala(T('Escribe el código que te ha pasado tu amigo.', 'Type the code your friend gave you.', '友達のコードを入力してください。'), true); return; }
    salirDeRed(false);
    RED.activo = true; RED.anfitrion = false; RED.codigo = codigo;
    const intento = RED.intento = (RED.intento || 0) + 1;
    estadoSala(T('Conectando…', 'Connecting…', '接続中…'));
    if (modoPrueba()){
      canal = new BroadcastChannel('rd-sala-' + codigo);
      canal.onmessage = ev => { const m = ev.data; if (!m || m.de === 'I') return; if (m.o && m.o.t === '__ok'){ alConectar(); return; } recibir(m.o); };
      canal.postMessage({ de: 'I', o: { t: '__unir' } });
      setTimeout(() => { if (RED.intento === intento && RED.activo && !RED.conectado) fallo(T('No se encuentra esa sala.', 'Room not found.', 'ルームが見つかりません。')); }, 2500);
      return;
    }
    try { await cargarPeerJS(); } catch (e){ fallo(T('No se pudo cargar la conexión.', 'Could not load the connection.', '接続を読み込めませんでした。')); return; }
    peer = new Peer(undefined, { debug: 0 });
    peer.on('open', () => prepararConexion(peer.connect(PREFIJO + codigo, { reliable: true, serialization: 'json' })));
    peer.on('error', e => { if (RED.conectado && e && e.type === 'network') return; fallo(textoError(e)); });
    // si en 15 s no se ha conectado, se avisa
    setTimeout(() => { if (RED.intento === intento && RED.activo && !RED.anfitrion && !RED.conectado) fallo(T('No se ha podido conectar con la sala.', 'Could not connect to the room.', 'ルームに接続できませんでした。')); }, 15000);
  }
  function salirDeRed(avisar = true){
    if (avisar && RED.conectado) enviar({ t: 'adios' });
    RED.activo = RED.conectado = RED.enPartida = false;
    RED.amigo = null; RED.mazoAmigo = null; RED.miMazo = null; RED.jugada = null; RED.esperandoJugada = false; RED.miJugada = null; RED.colaPreguntas = [];
    RED.sala = { yo: { eligio: false, listo: false }, amigo: { eligio: false, listo: false }, cuenta: null };
    RED.preguntas.forEach(p => p.rechazar && p.rechazar(new Error('desconectado'))); RED.preguntas.clear();
    clearInterval(RED._cuentaInt);
    try { if (conn) conn.close(); } catch (e) {} conn = null;
    try { if (peer) peer.destroy(); } catch (e) {} peer = null;
    try { if (canal) canal.close(); } catch (e) {} canal = null;
    if (RED._pasoAPaso !== undefined){ OPTIONS.pasoAPaso = RED._pasoAPaso; delete RED._pasoAPaso; }
    quitarAviso(); pintarMarcadorRed();
  }

  /* ══════════════ PERFIL ══════════════ */
  function miPerfil(){
    const p = typeof loadProfile === 'function' ? loadProfile() : {};
    return {
      nombre: (p.name || (typeof t === 'function' ? t('profile_player') : 'Jugador')).slice(0, 24),
      nivel: p._nivelReal ?? p.userLevel ?? 0,
      titulo: p.title || 'Ignorante',
      avatar: p.avatarCard || 'Abaki',
    };
  }
  const tituloTxt = tit => (typeof getTranslatedTitle === 'function' ? getTranslatedTitle(tit) : tit);

  /* ══════════════ MENSAJES ══════════════ */
  function recibir(m){
    if (!m || !m.t) return;
    RED.ultimoMensaje = performance.now();
    switch (m.t){
      case 'latido': break;
      case 'hola': RED.amigo = m.perfil; pintarSala(); break;
      case 'sala': RED.sala.amigo = { eligio: !!m.eligio, listo: !!m.listo }; pintarSala(); revisarCuenta(); break;
      case 'modoMazo': if (!RED.anfitrion){ RED.mazoPropio = !!m.propio; RED.sala.yo.listo = false; avisarSala(); pintarSala(); revisarCuenta(); } break;
      case 'mazo': RED.mazoAmigo = m.mazo; revisarCuenta(); break;
      case 'cuenta': if (!RED.anfitrion) empezarCuenta(); break;
      case 'cancelaCuenta': cancelarCuenta(); break;
      case 'revancha':
        if (RED.enPartida){ RED.enPartida = false; quitarAviso(); pintarMarcadorRed(); if (RED._pasoAPaso !== undefined){ OPTIONS.pasoAPaso = RED._pasoAPaso; delete RED._pasoAPaso; } RED.sala.yo = { eligio: true, listo: false }; }
        RED.sala.amigo = { eligio: false, listo: false }; cancelarCuenta(); abrirSala(); pintarSala(); break;
      case 'adios': {
        const estaba = RED.enPartida;
        salirDeRed(false);
        avisoGrande(T(`${(m.nombre || nombreAmigo())} ha salido de la partida.`, `${(m.nombre || nombreAmigo())} left the game.`, `${(m.nombre || nombreAmigo())}が退出しました。`), () => { if (estaba) showMenu(); else cerrarSala(); });
        break;
      }
      // anfitrión ← invitado
      case 'jugada': if (RED.anfitrion) recibirJugada(m); break;
      case 'resp': if (RED.anfitrion){ const p = RED.preguntas.get(m.id); if (p){ RED.preguntas.delete(m.id); p.resolver(m.v); } } break;
      // invitado ← anfitrión
      case 'estado': if (!RED.anfitrion) recibirEstado(m); break;
      case 'pide': if (!RED.anfitrion){ RED.colaPreguntas.push(m); atenderPreguntas(); } break;
      case 'ev': if (!RED.anfitrion) recibirEvento(m); break;
      case 'fin': if (!RED.anfitrion) finInvitado(m); break;
    }
  }

  /* ══════════════ SALA (interfaz) ══════════════ */
  const css = `
  #amigo-overlay{ position: fixed; inset: 0; z-index: 330; display: none; align-items: center; justify-content: center; background: rgba(10,4,3,.7); font-family: 'KleeOne', serif; }
  #amigo-overlay.show{ display: flex; }
  .am-libro{ width: min(980px, 95vw); max-height: 92vh; display: flex; flex-direction: column; padding: 0 14px 14px; box-sizing: border-box; background: #4a2c1c; border: 2px solid #2a170c; border-radius: 8px;
    box-shadow: inset 0 0 0 3px #6a4128, inset 0 0 0 5px #2a170c, 0 20px 50px rgba(0,0,0,.6); }
  .am-cab{ display: flex; align-items: center; padding: 12px 8px 10px; color: #d8b06a; }
  .am-cab h2{ margin: 0; font-weight: 400; letter-spacing: .14em; font-size: 1.2rem; color: #d8b06a; }
  .am-cab button{ margin-left: auto; background: none; border: none; color: #d8b06a; font-size: 1.3rem; cursor: pointer; }
  .am-papel{ background: #efe3c4; color: #2b1a10; border-radius: 3px; padding: 22px 28px 24px; overflow-y: auto; box-shadow: 0 0 0 1px #b89c6a, 0 3px 0 #c9b383, 0 5px 0 #b89c6a, 0 7px 0 #a88a58; }
  .am-txt{ color: #6a4a30; font-size: .92rem; line-height: 1.55; margin: 0 0 18px; text-align: center; }
  .am-inicio{ display: grid; grid-template-columns: 1fr 1fr; gap: 26px; align-items: start; }
  .am-col{ display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 18px 14px; border: 1px solid rgba(106,74,48,.35); border-radius: 8px; background: rgba(255,250,235,.45); }
  .am-col h3{ margin: 0; font-weight: 400; letter-spacing: .14em; font-size: .85rem; text-transform: uppercase; color: #6a4a30; }
  .am-col p{ margin: 0; font-size: .82rem; color: #6a4a30; text-align: center; line-height: 1.45; }
  .am-entrada{ width: 190px; text-align: center; font-family: 'KleeOne', serif; font-size: 1.5rem; letter-spacing: .3em; text-transform: uppercase; padding: 8px 6px; border: 2px solid #b89c6a; border-radius: 6px; background: #fbf6e6; color: #2b1a10; }
  .am-entrada:focus{ outline: none; border-color: #8a5a10; }
  .rd-cuero.am-btn{ max-width: 240px !important; padding: 10px 26px !important; width: auto !important; font-size: .95rem !important; }
  .am-estado{ min-height: 1.3em; text-align: center; font-size: .86rem; color: #6a4a30; margin-top: 14px; }
  .am-estado.error{ color: #9a2a2a; }
  .am-codigo{ display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 6px 0 4px; }
  .am-codigo b{ font-weight: 400; font-size: 2.6rem; letter-spacing: .32em; color: #2b1a10; background: #fbf6e6; border: 2px dashed #b89c6a; border-radius: 8px; padding: 6px 10px 6px 22px; }
  .am-codigo small{ color: #6a4a30; font-size: .8rem; }
  .am-mini{ background: none; border: 1px solid rgba(106,74,48,.45); border-radius: 4px; padding: 4px 10px; font-family: 'KleeOne', serif; color: #6a4a30; cursor: pointer; font-size: .78rem; }
  .am-mini:hover{ border-color: #8a5a10; color: #2b1a10; }
  /* la sala */
  .am-sala{ display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: start; }
  .am-vs{ align-self: center; color: #8a5a10; font-size: 1.6rem; letter-spacing: .1em; text-shadow: 0 1px 0 #fff6e0; }
  .am-jug{ display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 14px 16px; border-radius: 8px; border: 1px solid rgba(106,74,48,.35); background: rgba(255,250,235,.5); min-height: 280px; }
  .am-jug.listo{ border-color: #4a8a3c; box-shadow: 0 0 0 2px rgba(74,138,60,.35); }
  .am-quien{ font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: #6a4a30; }
  .am-ava{ width: 92px; height: 92px; border-radius: 6px; object-fit: cover; object-position: top; border: 5px solid #fbf6e6; box-shadow: 0 6px 14px rgba(60,40,20,.4); transform: rotate(-2deg); background: #2a170c; }
  .am-jug:last-child .am-ava{ transform: rotate(2deg); }
  .am-nombre{ font-size: 1.3rem; color: #2b1a10; }
  .am-etiquetas{ display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .am-nivel{ font-size: .74rem; padding: 2px 9px; border-radius: 999px; background: linear-gradient(180deg, #6e442b, #4e2f1d); color: #ffe9a8; border: 1px solid #22130a; box-shadow: inset 0 0 0 1px #c9a84c; }
  .am-titulo{ font-size: .74rem; padding: 2px 9px; border-radius: 999px; color: #8a5a10; border: 1px solid rgba(138,90,16,.5); letter-spacing: .1em; text-transform: uppercase; }
  .am-modo{ display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin: -4px 0 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(106,74,48,.3); }
  .am-modo-t{ font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: #6a4a30; }
  .am-modo-b{ display: flex; gap: 6px; }
  .am-modo-p{ flex-basis: 100%; margin: 0; text-align: center; font-size: .8rem; color: #6a4a30; }
  .am-mazo{ width: 100%; display: flex; flex-direction: column; gap: 8px; align-items: center; margin-top: 6px; }
  .am-mazo h4{ margin: 0; font-weight: 400; font-size: .7rem; letter-spacing: .18em; color: #6a4a30; text-transform: uppercase; }
  .am-opciones{ display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-height: 128px; overflow-y: auto; padding: 2px; }
  .am-op{ font-family: 'KleeOne', serif; font-size: .78rem; padding: 5px 10px; border-radius: 4px; cursor: pointer; background: rgba(255,250,235,.7); color: #6a4a30; border: 1px solid rgba(106,74,48,.4); }
  .am-op:hover{ border-color: #8a5a10; color: #2b1a10; }
  .am-op.sel{ background: linear-gradient(180deg, #6e442b, #4e2f1d); color: #ffe9a8; border-color: #22130a; box-shadow: inset 0 0 0 1px #c9a84c; }
  .am-op:disabled{ opacity: .5; cursor: default; }
  .am-oculto{ display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 8px; }
  .am-dorso{ width: 64px; height: 90px; border-radius: 4px; border: 4px solid #fbf6e6; background: #2a170c url(./ilustraciones/card-back.jpg) center / cover; box-shadow: 0 5px 12px rgba(60,40,20,.4); transition: transform .3s; }
  .am-dorso.vacio{ background: rgba(106,74,48,.12); border-style: dashed; border-color: rgba(106,74,48,.4); box-shadow: none; }
  .am-marca{ font-size: .84rem; color: #6a4a30; }
  .am-marca.ok{ color: #2f6a28; }
  .am-listo{ margin-top: auto; }
  .am-cuenta{ text-align: center; margin-top: 16px; font-size: 1.05rem; color: #2b1a10; min-height: 1.6em; }
  .am-cuenta b{ font-weight: 400; font-size: 2rem; color: #8a5a10; display: inline-block; animation: amLatido 1s ease-in-out infinite; }
  @keyframes amLatido{ 0%{ transform: scale(1.25); } 40%{ transform: scale(1); } }
  @media (max-width: 760px){ .am-inicio, .am-sala{ grid-template-columns: 1fr; } .am-vs{ display: none; } .am-jug{ min-height: 0; } }
  /* en la partida */
  #red-aviso{ position: fixed; left: 50%; top: 14px; transform: translateX(-50%); z-index: 9250; pointer-events: none; display: none; padding: 8px 22px; border-radius: 6px; font-family: 'KleeOne', serif; font-size: .92rem; letter-spacing: .06em;
    background: linear-gradient(180deg, #553321, #3a2214); border: 1px solid #c9a84c; color: #f6e9c8; box-shadow: inset 0 0 0 1px #2a170c, 0 8px 20px rgba(0,0,0,.55); text-shadow: 0 1px 0 #140a04; }
  #red-aviso.ver{ display: block; animation: amAviso .3s ease-out; }
  #red-aviso.elige{ border-color: #f0d48a; color: #fff3c8; }
  #red-aviso .puntos::after{ content: '…'; animation: amPuntos 1.2s steps(4) infinite; display: inline-block; width: 1.2em; text-align: left; overflow: hidden; vertical-align: bottom; }
  @keyframes amPuntos{ 0%{ width: 0; } 100%{ width: 1.2em; } }
  @keyframes amAviso{ from{ opacity: 0; transform: translate(-50%, -8px); } to{ opacity: 1; transform: translateX(-50%); } }
  #red-marcador{ position: fixed; left: 14px; top: 12px; z-index: 9240; display: none; flex-direction: column; gap: 4px; font-family: 'KleeOne', serif; font-size: .76rem; pointer-events: none; }
  #red-marcador.ver{ display: flex; }
  #red-marcador span{ padding: 3px 10px; border-radius: 4px; background: rgba(42,23,12,.82); border: 1px solid rgba(201,168,76,.6); color: #f4e6c4; }
  #red-marcador span.rival{ border-color: rgba(224,122,112,.7); }
  #red-marcador span.tu{ border-color: rgba(122,160,232,.7); }
  #red-grande{ position: fixed; inset: 0; z-index: 99980; display: flex; align-items: center; justify-content: center; background: rgba(10,4,3,.6); }
  #red-grande > div{ background: #efe3c4; color: #2b1a10; border: 2px solid #4a2c1c; border-radius: 8px; padding: 22px 28px; max-width: 420px; text-align: center; font-family: 'KleeOne', serif; box-shadow: 0 20px 50px rgba(0,0,0,.6); }
  #red-grande p{ margin: 0 0 16px; line-height: 1.5; }
  .red-aparece{ animation: redAparece .45s cubic-bezier(.22,1,.36,1); }
  @keyframes redAparece{ from{ transform: translateY(-18px) scale(1.08); opacity: 0; } to{ transform: none; opacity: 1; } }
  .red-gira{ animation: redGira .5s ease-out; }
  @keyframes redGira{ 0%{ transform: rotateY(90deg); } 100%{ transform: none; } }`;
  const st = document.createElement('style'); st.id = 'estilo-en-linea'; st.textContent = css; document.head.appendChild(st);

  function overlay(){
    let ov = document.getElementById('amigo-overlay');
    if (ov) return ov;
    ov = document.createElement('div'); ov.id = 'amigo-overlay';
    ov.innerHTML = `<div class="am-libro"><div class="am-cab"><h2 class="am-h"></h2><button type="button" class="am-cerrar" aria-label="cerrar">✕</button></div><div class="am-papel"></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('.am-cerrar').onclick = () => cerrarSala();
    ov.addEventListener('click', e => { if (e.target === ov) cerrarSala(); });
    return ov;
  }
  function estadoSala(txt, error){
    const e = document.querySelector('#amigo-overlay .am-estado'); if (!e) return;
    e.textContent = txt || ''; e.classList.toggle('error', !!error);
  }
  function abrirSala(){
    const ov = overlay();
    document.querySelectorAll('#end-overlay.active').forEach(e => e.classList.remove('active'));
    ov.classList.add('show');
    pintarSala();
  }
  window.showFriendGame = abrirSala;
  function cerrarSala(){
    if (RED.activo && !RED.enPartida) salirDeRed(true);
    const ov = document.getElementById('amigo-overlay'); if (ov) ov.classList.remove('show');
    // si veníamos del final de una partida, de vuelta al menú
    if (document.getElementById('screen-game')?.classList.contains('active') && !RED.enPartida) showMenu();
    try { playSound('uiClick'); } catch (e) {}
  }
  function pintarSala(){
    const ov = document.getElementById('amigo-overlay'); if (!ov) return;
    ov.querySelector('.am-h').textContent = T('Jugar con un amigo', 'Play with a friend', '友達と対戦');
    const papel = ov.querySelector('.am-papel');
    if (!RED.activo){
      papel.innerHTML = `<p class="am-txt"></p>
        <div class="am-inicio">
          <div class="am-col"><h3></h3><p class="am-p1"></p><button type="button" class="rd-cuero am-btn am-crear"></button></div>
          <div class="am-col"><h3></h3><p class="am-p2"></p><input class="am-entrada" maxlength="6" autocomplete="off" spellcheck="false"><button type="button" class="rd-cuero am-btn am-unir"></button></div>
        </div><div class="am-estado"></div>`;
      papel.querySelector('.am-txt').textContent = T('Cada uno juega en su ordenador. Uno crea la sala y le pasa el código al otro.', 'Each player uses their own computer. One creates a room and shares the code.', 'それぞれ自分のパソコンで遊びます。片方がルームを作り、コードを伝えます。');
      const [h1, h2] = papel.querySelectorAll('.am-col h3');
      h1.textContent = T('Crear sala', 'Create room', 'ルームを作る'); h2.textContent = T('Unirse', 'Join', '参加する');
      papel.querySelector('.am-p1').textContent = T('Te dará un código para tu amigo.', 'You will get a code for your friend.', '友達に渡すコードが出ます。');
      papel.querySelector('.am-p2').textContent = T('Escribe el código de tu amigo.', 'Type your friend’s code.', '友達のコードを入力。');
      const bc = papel.querySelector('.am-crear'), bu = papel.querySelector('.am-unir'), inp = papel.querySelector('.am-entrada');
      bc.textContent = T('Crear sala', 'Create room', '作成'); bu.textContent = T('Unirse', 'Join', '参加');
      inp.placeholder = 'ABCDE';
      bc.onclick = () => { try { playSound('uiClick'); } catch (e) {} crearSala(); };
      bu.onclick = () => { try { playSound('uiClick'); } catch (e) {} unirse(inp.value); };
      inp.onkeydown = e => { if (e.key === 'Enter') bu.click(); };
      return;
    }
    if (!RED.conectado){
      if (RED.anfitrion){
        papel.innerHTML = `<p class="am-txt"></p><div class="am-codigo"><b></b><button type="button" class="am-mini am-copiar"></button><small></small></div><div class="am-estado"></div>`;
        papel.querySelector('.am-txt').textContent = T('Pásale este código a tu amigo para que se una:', 'Give this code to your friend so they can join:', 'このコードを友達に伝えてください：');
        papel.querySelector('.am-codigo b').textContent = RED.codigo;
        const cp = papel.querySelector('.am-copiar'); cp.textContent = T('Copiar código', 'Copy code', 'コードをコピー');
        cp.onclick = () => { try { navigator.clipboard.writeText(RED.codigo); cp.textContent = T('¡Copiado!', 'Copied!', 'コピーしました！'); } catch (e) {} };
        papel.querySelector('.am-codigo small').innerHTML = '';
        const sm = papel.querySelector('.am-codigo small'); sm.textContent = T('Esperando a que se una', 'Waiting for your friend', '友達を待っています'); sm.classList.add('puntos');
        estadoSala('');
      } else {
        papel.innerHTML = `<p class="am-txt"></p><div class="am-estado"></div>`;
        papel.querySelector('.am-txt').textContent = T(`Buscando la sala ${RED.codigo}…`, `Looking for room ${RED.codigo}…`, `ルーム${RED.codigo}を探しています…`);
      }
      return;
    }
    // los dos conectados: la sala
    const yo = miPerfil(), am = RED.amigo || { nombre: '…', nivel: '?', titulo: '', avatar: 'Abaki' };
    papel.innerHTML = `<div class="am-sala"><div class="am-jug am-yo"></div><div class="am-vs">VS</div><div class="am-jug am-el"></div></div><div class="am-cuenta"></div>`;
    const ficha = (el, p, quien) => {
      el.innerHTML = `<div class="am-quien"></div><img class="am-ava" alt=""><div class="am-nombre"></div><div class="am-etiquetas"><span class="am-nivel"></span><span class="am-titulo"></span></div>`;
      el.querySelector('.am-quien').textContent = quien;
      const img = el.querySelector('.am-ava'); img.src = `./ilustraciones/${p.avatar}.jpg`;
      if (typeof CB_THUMB_OFFSET !== 'undefined' && CB_THUMB_OFFSET.get) img.style.objectPosition = CB_THUMB_OFFSET.get(p.avatar) || 'top';
      el.querySelector('.am-nombre').textContent = p.nombre;
      el.querySelector('.am-nivel').textContent = T('Nivel', 'Level', 'レベル') + ' ' + p.nivel;
      el.querySelector('.am-titulo').textContent = tituloTxt(p.titulo);
    };
    const elYo = papel.querySelector('.am-yo'), elAm = papel.querySelector('.am-el');
    ficha(elYo, yo, T('Tú', 'You', 'あなた')); ficha(elAm, am, RED.anfitrion ? T('Invitado', 'Guest', 'ゲスト') : T('Anfitrión', 'Host', 'ホスト'));
    elYo.classList.toggle('listo', RED.sala.yo.listo); elAm.classList.toggle('listo', RED.sala.amigo.listo);
    // modo de mazo: lo decide quien creó la sala
    const modo = document.createElement('div'); modo.className = 'am-modo';
    modo.innerHTML = '<span class="am-modo-t"></span><div class="am-modo-b"></div><p class="am-modo-p"></p>';
    modo.querySelector('.am-modo-t').textContent = T('Mazo', 'Deck', 'デッキ');
    [[false, T('Compartido', 'Shared', '共有')], [true, T('Cada uno el suyo', 'Each their own', 'それぞれのデッキ')]].forEach(([v, txt]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'am-op' + (RED.mazoPropio === v ? ' sel' : ''); b.textContent = txt;
      b.disabled = !RED.anfitrion || RED.sala.cuenta !== null;
      b.onclick = () => { if (RED.mazoPropio === v) return; try { playSound('uiClick'); } catch (e) {} RED.mazoPropio = v; RED.sala.yo.listo = false; RED.sala.amigo.listo = false; enviar({ t: 'modoMazo', propio: v }); avisarSala(); pintarSala(); };
      modo.querySelector('.am-modo-b').appendChild(b);
    });
    modo.querySelector('.am-modo-p').textContent = RED.mazoPropio
      ? T('Cada uno juega con su propio mazo (sin ver el del otro).', 'Each player uses their own deck (hidden from the other).', 'それぞれ自分のデッキで遊びます。')
      : T('Las cartas salen del mismo mazo para los dos.', 'Both draw from the same deck.', '同じデッキから引きます。') + (RED.anfitrion ? '' : ' ' + T('(lo elige quien creó la sala)', '(chosen by the host)', '（ホストが選択）'));
    papel.prepend(modo);
    // tu mazo (solo si cada uno juega con el suyo)
    const mz = document.createElement('div'); mz.className = 'am-mazo';
    if (RED.mazoPropio){
    mz.innerHTML = `<h4></h4><div class="am-opciones"></div>`;
    mz.querySelector('h4').textContent = T('Tu mazo (tu amigo no lo verá)', 'Your deck (hidden from your friend)', 'あなたのデッキ（相手には見えません）');
    const ops = mz.querySelector('.am-opciones');
    opcionesMazo().forEach(op => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'am-op'; b.textContent = op.nombre;
      const sel = RED.miEleccion.clave !== null ? RED.miEleccion.clave === op.clave : (op.clave === null && RED.miEleccion.modo === op.modo);
      if (sel) b.classList.add('sel');
      b.disabled = RED.sala.yo.listo;
      b.onclick = () => { try { playSound('uiClick'); } catch (e) {} RED.miEleccion = { modo: op.modo, clave: op.clave }; RED.sala.yo.eligio = true; avisarSala(); pintarSala(); };
      ops.appendChild(b);
    });
    }
    elYo.appendChild(mz);
    const bl = document.createElement('button'); bl.type = 'button'; bl.className = 'rd-cuero am-btn am-listo';
    bl.textContent = RED.sala.yo.listo ? T('No estoy listo', 'Not ready', '準備取消') : T('¡Listo!', 'Ready!', '準備OK！');
    bl.onclick = () => { try { playSound('uiClick'); } catch (e) {} ponerListo(!RED.sala.yo.listo); };
    elYo.appendChild(bl);
    // el mazo del amigo: solo si ya eligió y si está listo
    const oc = document.createElement('div'); oc.className = 'am-oculto';
    oc.innerHTML = `<div class="am-dorso"></div><div class="am-marca"></div>`;
    const dorso = oc.querySelector('.am-dorso'), marca = oc.querySelector('.am-marca');
    if (!RED.mazoPropio){ dorso.style.display = 'none'; if (RED.sala.amigo.listo){ marca.textContent = '✓ ' + T('¡Listo!', 'Ready!', '準備OK！'); marca.classList.add('ok'); } else { const s = document.createElement('span'); s.className = 'puntos'; s.textContent = T('Aún no está listo', 'Not ready yet', 'まだ準備中'); marca.appendChild(s); } }
    else if (!RED.sala.amigo.eligio && !RED.sala.amigo.listo){ dorso.classList.add('vacio'); marca.innerHTML = ''; const s = document.createElement('span'); s.className = 'puntos'; s.textContent = T('Eligiendo mazo', 'Choosing a deck', 'デッキを選択中'); marca.appendChild(s); }
    else { marca.textContent = RED.sala.amigo.listo ? '✓ ' + T('Mazo elegido · ¡listo!', 'Deck chosen · ready!', 'デッキ決定・準備OK！') : '✓ ' + T('Mazo elegido', 'Deck chosen', 'デッキ決定'); marca.classList.add('ok'); }
    elAm.appendChild(oc);
    pintarCuenta();
  }
  function pintarCuenta(){
    const c = document.querySelector('#amigo-overlay .am-cuenta'); if (!c) return;
    if (RED.sala.cuenta !== null){ c.innerHTML = ''; c.append(T('La partida empieza en ', 'The game starts in ', '開始まで '), Object.assign(document.createElement('b'), { textContent: String(RED.sala.cuenta) })); }
    else if (RED.sala.yo.listo && !RED.sala.amigo.listo) c.textContent = T(`Esperando a que ${nombreAmigo()} esté listo…`, `Waiting for ${nombreAmigo()} to be ready…`, `${nombreAmigo()}の準備を待っています…`);
    else if (!RED.sala.yo.listo && RED.sala.amigo.listo) c.textContent = T(`${nombreAmigo()} ya está listo.`, `${nombreAmigo()} is ready.`, `${nombreAmigo()}は準備OK。`);
    else c.textContent = '';
  }
  function opcionesMazo(){
    const ops = [
      { nombre: T('Azar', 'Random', 'ランダム'), modo: 'all', clave: null },
      { nombre: T('Azar básico', 'Random basic', '基本ランダム'), modo: 'basic', clave: null },
      { nombre: T('Azar construido', 'Random built', '自作ランダム'), modo: 'custom', clave: null },
    ];
    try {
      (typeof PRESET_DECKS !== 'undefined' ? PRESET_DECKS : []).forEach((d, i) => { if (!(typeof isPresetDeckLocked === 'function' && isPresetDeckLocked(i))) ops.push({ nombre: d.name, modo: null, clave: -(i + 1) }); });
      (typeof CB_DECKS !== 'undefined' ? CB_DECKS : []).forEach((d, i) => { if (typeof isDeckComplete === 'function' && isDeckComplete(d)) ops.push({ nombre: d.name, modo: null, clave: i }); });
    } catch (e) {}
    return ops;
  }
  function resolverMiMazo(){
    let k = RED.miEleccion.clave;
    if (k === null && typeof dgResolveRandomDeck === 'function') k = dgResolveRandomDeck(RED.miEleccion.modo || 'all');
    if ((k === null || k === undefined) && typeof dgResolveRandomDeck === 'function') k = dgResolveRandomDeck('all');
    let d = (k !== null && k !== undefined && typeof dgGetDeck === 'function') ? dgGetDeck(k) : null;
    if (!d && typeof PRESET_DECKS !== 'undefined' && PRESET_DECKS.length) d = PRESET_DECKS[Math.floor(Math.random() * PRESET_DECKS.length)];
    return d ? { name: d.name, cards: [...d.cards], thumb: d.thumb } : null;
  }
  function avisarSala(){ enviar({ t: 'sala', eligio: RED.sala.yo.eligio || RED.sala.yo.listo, listo: RED.sala.yo.listo }); }
  function ponerListo(v){
    RED.sala.yo.listo = v;
    if (v){
      RED.sala.yo.eligio = true;
      RED.miMazo = RED.mazoPropio ? resolverMiMazo() : null;
      if (!RED.anfitrion && RED.mazoPropio) enviar({ t: 'mazo', mazo: RED.miMazo });   // el anfitrión lo necesita para repartir; no lo enseña
    }
    avisarSala(); pintarSala(); revisarCuenta();
  }
  // la cuenta atrás la lleva el anfitrión; el invitado la sigue
  function revisarCuenta(){
    const ambos = RED.sala.yo.listo && RED.sala.amigo.listo;
    if (!ambos){ if (RED.sala.cuenta !== null){ cancelarCuenta(); enviar({ t: 'cancelaCuenta' }); } else pintarCuenta(); return; }
    if (RED.anfitrion && RED.sala.cuenta === null && (RED.mazoAmigo || !RED.mazoPropio)){ enviar({ t: 'cuenta' }); empezarCuenta(); }
  }
  function empezarCuenta(){
    clearInterval(RED._cuentaInt);
    RED.sala.cuenta = 3; pintarCuenta();
    try { playSound('uiClick'); } catch (e) {}
    RED._cuentaInt = setInterval(() => {
      RED.sala.cuenta--;
      if (RED.sala.cuenta <= 0){
        clearInterval(RED._cuentaInt); RED.sala.cuenta = null; pintarCuenta();
        if (RED.anfitrion) empezarPartidaAnfitrion();
        return;
      }
      try { playSound('uiClick'); } catch (e) {}
      pintarCuenta();
    }, 1000);
  }
  function cancelarCuenta(){ clearInterval(RED._cuentaInt); RED.sala.cuenta = null; pintarCuenta(); }

  /* ══════════════ AVISOS EN LA PARTIDA ══════════════ */
  function aviso(txt, elige){
    let a = document.getElementById('red-aviso');
    if (!a){ a = document.createElement('div'); a.id = 'red-aviso'; document.body.appendChild(a); }
    a.innerHTML = ''; const s = document.createElement('span'); s.textContent = txt; a.appendChild(s);
    if (!elige){ const p = document.createElement('span'); p.className = 'puntos'; a.appendChild(p); }
    a.classList.toggle('elige', !!elige);
    a.classList.add('ver');
  }
  function quitarAviso(){ const a = document.getElementById('red-aviso'); if (a) a.classList.remove('ver'); }
  function avisoGrande(txt, alCerrarlo){
    const v = document.getElementById('red-grande'); if (v) v.remove();
    const d = document.createElement('div'); d.id = 'red-grande';
    d.innerHTML = '<div><p></p><button type="button" class="rd-cuero am-btn"></button></div>';
    d.querySelector('p').textContent = txt;
    const b = d.querySelector('button'); b.textContent = T('Volver al menú', 'Back to menu', 'メニューへ');
    b.onclick = () => { d.remove(); const ov = document.getElementById('amigo-overlay'); if (ov) ov.classList.remove('show'); if (alCerrarlo) alCerrarlo(); };
    document.body.appendChild(d);
  }
  function pintarMarcadorRed(){
    let m = document.getElementById('red-marcador');
    if (!m){ m = document.createElement('div'); m.id = 'red-marcador'; document.body.appendChild(m); }
    const ver = RED.enPartida && document.getElementById('screen-game')?.classList.contains('active') && !document.getElementById('end-overlay')?.classList.contains('active');
    m.classList.toggle('ver', !!ver);
    if (!ver) return;
    const yo = miPerfil(), am = RED.amigo || {};
    m.innerHTML = '<span class="rival"></span><span class="tu"></span>';
    m.querySelector('.rival').textContent = `${am.nombre || '?'} · ${T('Nivel', 'Lv', 'Lv')} ${am.nivel ?? '?'} · ${tituloTxt(am.titulo || '')}`;
    m.querySelector('.tu').textContent = `${yo.nombre} · ${T('Nivel', 'Lv', 'Lv')} ${yo.nivel}`;
  }
  // «IA» → el nombre del amigo, en el tablero y en los carteles
  function cambiarNombres(raiz){
    if (!RED.enPartida || !raiz) return;
    const n = nombreAmigo();
    const re = /(\b[Ll]a |\b[Tt]he )?\b(IA|AI)\b/g;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    let x; while ((x = w.nextNode())) if (re.test(x.nodeValue)){ re.lastIndex = 0; x.nodeValue = x.nodeValue.replace(re, n); }
  }
  window.rdCambiarNombres = cambiarNombres;

  /* ══════════════ ANFITRIÓN ══════════════ */
  function empezarPartidaAnfitrion(){
    RED.enPartida = true; RED.pid++; RED.ventana = 0; RED.jugada = null; RED.logsEnviados = 0;
    RED._pasoAPaso = OPTIONS.pasoAPaso; OPTIONS.pasoAPaso = false;
    const ov = document.getElementById('amigo-overlay'); if (ov) ov.classList.remove('show');
    if (!RED.mazoPropio){ RED.mazoAmigo = null; startGame(null, null); return; }   // un mazo para los dos
    const mio = RED.miMazo || resolverMiMazo(), suyo = RED.mazoAmigo || resolverMiMazo();
    RED.mazoAmigo = null;
    startGame(mio, suyo);
  }
  // identificador de cada carta para que el invitado siga la misma carta entre envíos
  let SIG_ID = 1;
  const idCarta = c => (c._rid || (c._rid = SIG_ID++));
  function todasLasCartas(g){
    const out = [];
    const mira = a => (a || []).forEach(c => { if (c && typeof c === 'object' && c.name) out.push(c); });
    g.spaces.forEach(sp => sp.slots.forEach(mira));
    g.hands.forEach(mira); mira(g.deck); mira(g.discard); mira(g.extinct);
    (g.playerDecks || []).forEach(mira);
    return out;
  }
  const OCULTA = { name: 'Oculta', displayName: '?', value: 1, baseValue: 1, type: 'exist', effect: '', faceDown: true, _oculta: true };
  function tiraInvitado(){ return typeof hasTiraActive === 'function' && hasTiraActive(1) && !hasTiraActive(0); }
  function puedeColocarInvitado(){
    if (RED.jugada) return false;
    if (RED.esperandoJugada) return true;
    return G.phase === 'player_place' && !tiraInvitado();
  }
  function foto(){
    todasLasCartas(G).forEach(idCarta);
    const ziru = typeof ziruActive === 'function' && ziruActive(1);
    const ocultarNueva = (G.phase === 'player_place' || RED.esperandoJugada) && !RED.jugada && !tiraInvitado();
    const NO = new Set(['unlockProgress', 'logs', 'seenPlayerCards', 'aiPlayerSpaceHistory', 'aiMatchState', 'historyLog', '_currentTurnLog', 'deckCards', '_deckCardsP0', '_deckNameP0']);
    let json;
    try { json = JSON.stringify(G, function(k, v){
      if (NO.has(k)) return undefined;
      if (v instanceof Set) return [...v];
      if (typeof v === 'function') return undefined;
      return v;
    }); } catch (e) { console.warn('foto', e); return null; }
    const g = JSON.parse(json);
    // lo que el invitado no debe ver: tu mano (salvo Ziru), los mazos y tu carta recién colocada
    g.hands[0] = g.hands[0].map(c => ziru ? c : Object.assign({}, OCULTA, { _rid: c._rid }));
    g.deck = (g.deck || []).map(c => Object.assign({}, OCULTA, { _rid: c._rid }));
    if (g.playerDecks) g.playerDecks = g.playerDecks.map(d => d ? d.map(c => Object.assign({}, OCULTA, { _rid: c._rid })) : d);
    if (ocultarNueva) g.spaces.forEach(sp => { sp.slots[0] = sp.slots[0].map(c => (c && c.faceDown && c._placedThisTurn) ? null : c); });
    // si no ha cambiado nada (p. ej. solo seleccionaste una carta de tu mano), no se envía
    RED.eligiendoAhora = !!(boardPickState || slotPickState || spacePickState || document.querySelector('#modal-overlay.show'));
    const firma = G.logs.length + ':' + RED.ventana + ':' + (RED.jugada ? 1 : 0) + ':' + (RED.esperandoJugada ? 1 : 0) + ':' + (RED.eligiendoAhora ? 1 : 0) + ':' + json;
    if (!RED._forzar && firma === RED._ultimaFirma) return null;
    RED._ultimaFirma = firma; RED._forzar = false;
    const logs = G.logs.slice(Math.min(RED.logsEnviados, G.logs.length));
    const desde = RED.logsEnviados; RED.logsEnviados = G.logs.length;
    return { t: 'estado', pid: RED.pid, g, logs, logsDesde: desde, ventana: RED.ventana, puede: puedeColocarInvitado(),
      eligiendo: RED.eligiendoAhora,
      tab: (typeof TAB !== 'undefined') ? { actual: TAB.actual, semilla: TAB.semilla, izq: TAB.izq, vientoAng: TAB.vientoAng } : null,
      rival: miPerfil() };
  }
  let tEnvio = null, ultimoEnvio = 0;
  function enviarEstado(ya){
    if (!RED.anfitrion || !RED.enPartida || !RED.conectado || !G || !G.spaces) return;
    const ahora = performance.now();
    if (ya || ahora - ultimoEnvio > 140){ clearTimeout(tEnvio); tEnvio = null; ultimoEnvio = ahora; const f = foto(); if (f) enviar(f); return; }
    if (!tEnvio) tEnvio = setTimeout(() => { tEnvio = null; ultimoEnvio = performance.now(); const f = foto(); if (f) enviar(f); }, 140 - (ahora - ultimoEnvio));
  }
  window.rdEnviarEstado = enviarEstado;
  function recibirJugada(m){
    if (!RED.enPartida || m.v !== RED.ventana || RED.jugada) return;
    RED.jugada = m;
    if (RED._alJugar){ const f = RED._alJugar; RED._alJugar = null; f(m); }
    enviarEstado(true);
  }
  function esperarJugada(){
    if (RED.jugada) return Promise.resolve(RED.jugada);
    return new Promise(res => { RED._alJugar = res; });
  }
  async function colocarInvitado(){
    if (G.hands[1].length === 0) return null;
    RED.esperandoJugada = true; enviarEstado(true);
    if (!RED.jugada) aviso(T(`Esperando a ${nombreAmigo()}`, `Waiting for ${nombreAmigo()}`, `${nombreAmigo()}を待っています`));
    const mv = await esperarJugada();
    RED.esperandoJugada = false; quitarAviso();
    RED.jugada = null; RED.ventana++;
    let ult = null;
    const colocar = async (rid, sp, sl, orden) => {
      const idx = G.hands[1].findIndex(c => c._rid === rid); if (idx === -1) return false;
      const esp = G.spaces[sp]; if (!esp) return false;
      const card = G.hands[1][idx];
      const occ = esp.slots[1][sl];
      if (occ && !(typeof canEkuroDisplace === 'function' && canEkuroDisplace(card, 1) && occ.baseValue !== 0 && occ.name !== 'Ekuro')) return false;
      G.hands[1].splice(idx, 1);
      placeCard(card, 1, sp, sl, true);
      if (occ){
        removeToDiscard(occ);
        card.powerBonus = (card.powerBonus || 0) + 1;
        addLog(`${occ.name} es descartada por ${card.name}.`, 'effect');
      }
      if (orden) card._destinadaOrder = orden;
      render();
      await animateAIPlay(sp, sl);
      ult = { sp, sl, card };
      return true;
    };
    let ok = await colocar(mv.rid, mv.sp, mv.sl, mv.d ? 1 : 0);
    if (ok && mv.d){
      await gameSleep(300);
      const ok2 = await colocar(mv.d.rid, mv.d.sp, mv.d.sl, 2);
      if (ok2){
        G.destinadaUsed[1] = true;
        addLog(`${nombreAmigo()} usa Colocación Destinada.`, 'ai');
        if (typeof destinadaRivalActivada === 'function') destinadaRivalActivada();
      }
    }
    if (!ok){ aiFallbackPlace(); render(); }
    G.pending_nasu = G.pending_nasu.filter(n => !(n.target === 1 && n.turn === G.turn));
    if (ult && G._currentTurnLog){ G._currentTurnLog.aiCard = ult.card.displayName || ult.card.name; G._currentTurnLog.aiSpace = ult.sp; }
    enviarEstado(true);
    return ult ? { sp: ult.sp, sl: ult.sl } : null;
  }
  if (typeof doAIPlace === 'function'){
    const o = doAIPlace;
    window.doAIPlace = doAIPlace = function(){ return (RED.anfitrion && RED.enPartida) ? colocarInvitado() : o.apply(this, arguments); };
  }
  if (typeof aiTurn === 'function'){
    const o = aiTurn;
    window.aiTurn = aiTurn = async function(){
      if (!(RED.anfitrion && RED.enPartida)) return o.apply(this, arguments);
      if (!hasAnyFreeSlot(1)) addLog(`${nombreAmigo()} no puede colocar cartas. Su turno se salta.`, 'effect');
      else await doAIPlace();
      addLog(`Ambos colocan una carta.`, '');
      await resolvePhase();
    };
  }
  // preguntas al invitado (cuando elige él)
  function preguntar(datos){
    const id = ++RED.preguntaId;
    enviarEstado(true);
    enviar(Object.assign({ t: 'pide', id, titulo: RED.ultimoAviso || '' }, datos));
    aviso(T(`${nombreAmigo()} está eligiendo`, `${nombreAmigo()} is choosing`, `${nombreAmigo()}が選択中`));
    return new Promise((resolver, rechazar) => RED.preguntas.set(id, { resolver: v => { quitarAviso(); resolver(v); }, rechazar }));
  }
  const celdas = () => { const out = []; for (let sp = 0; sp < 3; sp++) for (let side = 0; side < 2; side++) for (let sl = 0; sl < 3; sl++) out.push([sp, side, sl]); return out; };
  function envolverEleccion(nombre, remota){
    const o = window[nombre]; if (typeof o !== 'function') return;
    window[nombre] = function(){
      const q = RD_QUIEN_ELIGE; RD_QUIEN_ELIGE = 0;
      if (q === 1 && RED.anfitrion && RED.enPartida) return remota.apply(this, arguments);
      return o.apply(this, arguments);
    };
  }
  envolverEleccion('pickCardFromBoard', async function(filterFn){
    const validos = celdas().filter(([sp, side, sl]) => { const c = G.spaces[sp].slots[side][sl]; try { return c && filterFn(c, sp, side, sl); } catch (e) { return false; } });
    if (!validos.length) return null;
    const v = await preguntar({ tipo: 'carta', validos });
    return v ? G.spaces[v[0]].slots[v[1]][v[2]] : G.spaces[validos[0][0]].slots[validos[0][1]][validos[0][2]];
  });
  envolverEleccion('pickSlotFromBoard', async function(filterFn){
    const validos = celdas().filter(([sp, side, sl]) => { try { return !G.spaces[sp].slots[side][sl] && filterFn(sp, side, sl); } catch (e) { return false; } });
    if (!validos.length) return null;
    const v = await preguntar({ tipo: 'hueco', validos }) || validos[0];
    return { spaceIdx: v[0], side: v[1], slotIdx: v[2] };
  });
  envolverEleccion('pickSpaceFromBoard', async function(filterFn){
    const validos = [0, 1, 2].filter(i => { try { return filterFn(i); } catch (e) { return false; } });
    if (!validos.length) return null;
    const v = await preguntar({ tipo: 'espacio', validos });
    return validos.includes(v) ? v : validos[0];
  });
  envolverEleccion('chooseSpace', async function(spaces, title){
    if (!spaces || !spaces.length) return null;
    if (spaces.length === 1) return spaces[0];
    const v = await preguntar({ tipo: 'espacio', validos: spaces, titulo: title });
    return spaces.includes(v) ? v : spaces[0];
  });
  envolverEleccion('chooseCard', async function(cards, title, opts = {}){
    if (!cards || !cards.length) return null;
    if (cards.length === 1) return cards[0];
    const lista = JSON.parse(JSON.stringify(cards.map(c => Object.assign({}, c, { owner: c.owner === 0 ? 1 : c.owner === 1 ? 0 : c.owner }))));
    const v = await preguntar({ tipo: 'lista', cartas: lista, titulo: title, noCancel: !!opts.noCancel });
    return (typeof v === 'number' && cards[v]) ? cards[v] : (opts.noCancel ? cards[0] : null);
  });
  envolverEleccion('chooseRivalHandCard', async function(title, excludeIndices = []){
    const v = await preguntar({ tipo: 'manoRival', titulo: title, excluir: excludeIndices });
    return (typeof v === 'number' && v >= 0 && v < G.hands[0].length) ? v : null;
  });
  window.rdPreguntarEspacio = (candidatos, texto) => preguntar({ tipo: 'espacio', validos: candidatos, titulo: texto }).then(v => candidatos.includes(v) ? v : candidatos[0]);

  // lo que pasa en el anfitrión y el invitado también debe ver u oír
  const SIN_ENVIAR = new Set(['victory', 'defeat', 'xpFill', 'xpLevelUp', 'nivelDestellos', 'uiClick', 'mazoAgregar', 'mazoQuitar', 'mazoRechazar', 'pick', 'place', 'colocDestinada']);
  if (typeof playSound === 'function'){
    const o = playSound;
    window.playSound = playSound = function(n){
      const r = o.apply(this, arguments);
      if (RED.anfitrion && RED.enPartida && !SIN_ENVIAR.has(n)) enviar({ t: 'ev', k: 'snd', n });
      return r;
    };
  }
  if (typeof ritmoCartel === 'function'){
    const o = ritmoCartel;
    window.ritmoCartel = ritmoCartel = function(texto, opts = {}){
      if (RED.enPartida){
        if (RED.anfitrion){ enviarEstado(true); enviar({ t: 'ev', k: 'cartel', texto, tipo: opts.tipo || '', ms: opts.ms }); }
        if (typeof ritmoT === 'function' && texto === ritmoT('ia')) texto = T(`${nombreAmigo()} revela`, `${nombreAmigo()} reveals`, `${nombreAmigo()}が公開`);
      }
      return o.call(this, texto, opts);
    };
  }
  if (typeof ritmoFocoCarta === 'function'){
    const o = ritmoFocoCarta;
    window.ritmoFocoCarta = ritmoFocoCarta = function(sp, owner, sl){
      if (RED.anfitrion && RED.enPartida){ enviarEstado(true); enviar({ t: 'ev', k: 'foco', sp, owner, sl }); }
      return o.apply(this, arguments);
    };
  }
  if (typeof rekiPisadas === 'function'){
    const o = rekiPisadas;
    window.rekiPisadas = rekiPisadas = function(sp, sl, owner){
      if (RED.anfitrion && RED.enPartida) enviar({ t: 'ev', k: 'pisadas', sp, sl, owner });
      return o.apply(this, arguments);
    };
  }
  if (typeof gotaRealidad === 'function'){
    const o = gotaRealidad;
    window.gotaRealidad = gotaRealidad = function(sp, color){
      if (RED.anfitrion && RED.enPartida){ enviarEstado(true); enviar({ t: 'ev', k: 'gota', sp, color }); }
      return o.apply(this, arguments);
    };
  }
  if (typeof motasMoradas === 'function'){
    const o = motasMoradas;
    window.motasMoradas = motasMoradas = function(sp, msx, rect){
      if (RED.anfitrion && RED.enPartida && !rect) enviar({ t: 'ev', k: 'motas', sp, ms: msx });
      return o.apply(this, arguments);
    };
  }
  if (typeof addLog === 'function'){
    const o = addLog;
    window.addLog = addLog = function(msg, type){
      if (type === 'important') RED.ultimoAviso = String(msg);
      if (RED.enPartida && RED.anfitrion) msg = String(msg).replace(/(\b[Ll]a )?\bIA\b/g, nombreAmigo());
      return o.call(this, msg, type);
    };
  }
  if (typeof render === 'function'){
    const o = window.render;
    window.render = function(){
      if (!RED.anfitrion && RED.enPartida && RED.renderBloqueado) return;
      const r = o.apply(this, arguments);
      if (RED.enPartida){
        try { cambiarNombres(document.getElementById('screen-game')); } catch (e) {}
        if (RED.anfitrion) enviarEstado(false);
        else try { animarInvitado(); } catch (e) {}
        pintarMarcadorRed();
      }
      return r;
    };
  }
  // al terminar: el anfitrión avisa; los dos guardan su partida
  if (typeof endGame === 'function'){
    const o = endGame;
    window.endGame = endGame = function(){
      if (RED.enPartida && !RED.anfitrion && !RED._finLocal) return;   // el invitado solo la cierra cuando llega «fin»
      const r = o.apply(this, arguments);
      if (RED.enPartida && RED.anfitrion){ enviarEstado(true); enviar({ t: 'fin' }); }
      if (RED.enPartida){ ajustarFinRed(); pintarMarcadorRed(); }
      return r;
    };
  }
  if (typeof saveGameRecord === 'function'){
    const o = saveGameRecord;
    window.saveGameRecord = saveGameRecord = function(){
      const r = o.apply(this, arguments);
      if (RED.enPartida){
        try {
          const h = loadGameHistory();
          if (h[0]){ h[0].mode = T(`Contra ${nombreAmigo()}`, `Vs ${nombreAmigo()}`, `${nombreAmigo()}と対戦`); h[0].amigo = nombreAmigo(); saveGameHistory(h); }
        } catch (e) {}
      }
      return r;
    };
  }
  function ajustarFinRed(){
    // «Jugar otra» vuelve a la sala con el mismo amigo; «Salir al menú» se despide
    const jugar = document.getElementById('end-btn-play');
    if (jugar){ jugar.textContent = T('Revancha', 'Rematch', '再戦'); }
    try { cambiarNombres(document.getElementById('end-overlay')); } catch (e) {}
  }

  /* ══════════════ INVITADO ══════════════ */
  const otro = s => (s === 0 ? 1 : s === 1 ? 0 : s);
  function espejo(g){
    const gira = a => { if (Array.isArray(a) && a.length === 2){ const x = a[0]; a[0] = a[1]; a[1] = x; } };
    gira(g.hands); gira(g.playerDecks); gira(g.destinadaUsed);
    (g.spaces || []).forEach(sp => {
      gira(sp.slots); gira(sp.slotCount); gira(sp._peakScore); gira(sp._tisUsado);
      if (sp.exploredBy){ const a = sp.exploredBy[0]; sp.exploredBy[0] = sp.exploredBy[1]; sp.exploredBy[1] = a; }
    });
    todasLasCartas(g).forEach(c => { c.owner = otro(c.owner); });
    (g.pending_nasu || []).forEach(n => { n.target = otro(n.target); });
    (g.pending_fukou || []).forEach(n => { if ('target' in n) n.target = otro(n.target); });
    if (g.pending_yukoi && 'owner' in g.pending_yukoi) g.pending_yukoi.owner = otro(g.pending_yukoi.owner);
    if (typeof g.tieBreaker === 'number') g.tieBreaker = otro(g.tieBreaker);
    if (typeof g.playerRevealFirst === 'boolean') g.playerRevealFirst = !g.playerRevealFirst;
    return g;
  }
  // las cartas conservan su objeto entre envíos (para los destellos y animaciones)
  const PERSISTE = new Map();
  function reconciliar(g){
    const fija = c => {
      if (!c || typeof c !== 'object' || !c._rid) return c;
      let p = PERSISTE.get(c._rid);
      if (!p){ PERSISTE.set(c._rid, c); return c; }
      Object.keys(p).forEach(k => { if (!(k in c)) delete p[k]; });
      Object.assign(p, c); return p;
    };
    const lista = a => Array.isArray(a) ? a.map(fija) : a;
    g.spaces.forEach(sp => { sp.slots = sp.slots.map(lista); });
    g.hands = g.hands.map(lista); g.deck = lista(g.deck); g.discard = lista(g.discard); g.extinct = lista(g.extinct);
    if (g.playerDecks) g.playerDecks = g.playerDecks.map(lista);
    return g;
  }
  function textoInvitado(msg){
    const H = (RED.amigo && RED.amigo.nombre) || 'Rival';
    let s = String(msg);
    // el historial lo escribe el anfitrión: «Tú» es él y su rival eres tú
    s = s.split(H).join('@@YO@@');
    s = s.replace(/\bTú has\b/g, `${H} ha`).replace(/\bTú\b/g, H).replace(/\bRobas\b/g, `${H} roba`).replace(/\bDescartaste\b/g, `${H} descartó`);
    s = s.replace(/@@YO@@ ha\b/g, 'Has').replace(/@@YO@@ usa\b/g, 'Usas').replace(/@@YO@@ roba\b/g, 'Robas').replace(/@@YO@@/g, 'Tú');
    return s;
  }
  function entrarPartidaInvitado(m){
    RED.enPartida = true; RED.pidVisto = m.pid; RED.miJugada = null; RED.colaPreguntas = []; RED.logs = [];
    RED._pasoAPaso = OPTIONS.pasoAPaso; OPTIONS.pasoAPaso = false;
    PERSISTE.clear();
    const ov = document.getElementById('amigo-overlay'); if (ov) ov.classList.remove('show');
    const entrar = () => {
      try { stopMenuMusic(); } catch (e) {}
      document.getElementById('screen-menu').style.display = 'none';
      document.getElementById('end-overlay').classList.remove('active');
      document.getElementById('screen-game').classList.add('active');
      const up = document.getElementById('end-unlocks-panel'); if (up){ up.classList.remove('revealed'); up.dataset.pendingReveal = '0'; }
      ['end-btn-play', 'end-btn-menu', 'end-btn-board'].forEach(id => { const b = document.getElementById(id); if (b) b.disabled = true; });
      ['btn-historial-inline'].forEach(id => { const b = document.getElementById(id); if (b) b.style.display = 'inline-block'; });
      const ab = document.getElementById('btn-abandon'); if (ab) ab.style.display = 'block';
      selectedCard = null; selectedCard2 = null; destinadaPhase = 0; destinadaCard1Info = null; pendingPlacement = null;
      RED.renderBloqueado = true;
      try { initGame(null, null); } catch (e) { console.warn(e); }
      RED.unlockPropio = G.unlockProgress;
      RED.renderBloqueado = false;
      if (m.tab && typeof TAB !== 'undefined' && typeof tabPintar === 'function'){ Object.assign(TAB, m.tab); tabPintar(); }
      aplicarEstado(m);
    };
    (window.rdConFundido || (f => f()))(entrar);
  }
  function recibirEstado(m){
    if (m.rival) RED.amigo = m.rival;
    if (!RED.enPartida || m.pid !== RED.pidVisto){ entrarPartidaInvitado(m); return; }
    // mientras eliges una Destinada, el tablero espera (para no deshacerte la primera carta)
    if (typeof destinadaPhase !== 'undefined' && destinadaPhase > 0){ RED.estadoPendiente = m; return; }
    aplicarEstado(m);
  }
  function aplicarEstado(m){
    RED.estado = m;
    const g = reconciliar(espejo(JSON.parse(JSON.stringify(m.g))));
    // historial (desde el punto de vista del invitado)
    RED.logs = (RED.logs || []).slice(0, m.logsDesde).concat((m.logs || []).map(l => ({ msg: textoInvitado(l.msg), type: l.type === 'ai' ? 'important' : (l.type === 'important' ? 'ai' : l.type) })));
    g.logs = RED.logs;
    g.unlockProgress = RED.unlockPropio || {};
    g.seenPlayerCards = []; g.aiPlayerSpaceHistory = [0, 0, 0]; g.historyLog = []; g._currentTurnLog = {};
    g._deckNameP0 = RED.miMazo ? RED.miMazo.name : null; g._deckCardsP0 = RED.miMazo ? [...RED.miMazo.cards] : null;
    // ¿puedes colocar ahora?
    const yaColoque = RED.miJugada && RED.miJugada.v === m.ventana;
    if (RED.miJugada && RED.miJugada.v < m.ventana) RED.miJugada = null;
    g.phase = (m.puede && !yaColoque) ? 'player_place' : (m.g.phase === 'player_place' ? 'ai_place' : m.g.phase);
    // tu carta ya colocada (hasta que el anfitrión la ponga en el tablero)
    if (yaColoque) mostrarMiJugada(g, RED.miJugada);
    const prevSel = (typeof selectedCard !== 'undefined') ? selectedCard : null;
    G = g;
    if (prevSel !== null && (!G.hands[0][prevSel] || G.phase !== 'player_place')){ selectedCard = null; selectedCard2 = null; pendingPlacement = null; }
    if (G.phase === 'end'){ render(); return; }
    render();
    // avisos
    if (RED.colaPreguntas.length || RED.preguntando) return;
    if (yaColoque) aviso(T(`Carta colocada · esperando a ${nombreAmigo()}`, `Card placed · waiting for ${nombreAmigo()}`, `配置完了・${nombreAmigo()}を待っています`));
    else if (m.eligiendo) aviso(T(`${nombreAmigo()} está eligiendo`, `${nombreAmigo()} is choosing`, `${nombreAmigo()}が選択中`));
    else if (m.g.phase === 'player_place' && !m.puede) aviso(T(`Esperando a ${nombreAmigo()}`, `Waiting for ${nombreAmigo()}`, `${nombreAmigo()}を待っています`));
    else quitarAviso();
  }
  function mostrarMiJugada(g, j){
    const pon = (rid, sp, sl) => {
      const enTablero = g.spaces.some(e => e.slots[0].some(c => c && c._rid === rid)); if (enTablero) return;
      const i = g.hands[0].findIndex(c => c._rid === rid); if (i === -1) return;
      const c = g.hands[0].splice(i, 1)[0]; c.faceDown = true; c._placedThisTurn = true;
      if (!g.spaces[sp].slots[0][sl]) g.spaces[sp].slots[0][sl] = c;
    };
    pon(j.rid, j.sp, j.sl); if (j.d) pon(j.d.rid, j.d.sp, j.d.sl);
  }
  // colocar: la interfaz es la de siempre; al confirmar se le manda al anfitrión
  function mandarJugada(j){
    j.v = RED.estado ? RED.estado.ventana : 0;
    RED.miJugada = j;
    enviar(Object.assign({ t: 'jugada' }, j));
    selectedCard = null; selectedCard2 = null; destinadaPhase = 0; destinadaCard1Info = null; pendingPlacement = null;
    if (RED.estadoPendiente){ const m = RED.estadoPendiente; RED.estadoPendiente = null; aplicarEstado(m); }
    else if (RED.estado) aplicarEstado(RED.estado);
  }
  if (typeof confirmTurn === 'function'){
    const o = confirmTurn;
    window.confirmTurn = confirmTurn = async function(){
      if (!(RED.enPartida && !RED.anfitrion)) return o.apply(this, arguments);
      if (!pendingPlacement || selectedCard === null) return;
      const card = G.hands[0][selectedCard]; if (!card) return;
      try { playSound('place'); } catch (e) {}
      mandarJugada({ rid: card._rid, sp: pendingPlacement.spaceIdx, sl: pendingPlacement.slotIdx });
    };
  }
  if (typeof confirmDestinada1 === 'function'){
    const o = confirmDestinada1;
    window.confirmDestinada1 = confirmDestinada1 = async function(spaceIdx, slotIdx){
      if (!(RED.enPartida && !RED.anfitrion)) return o.apply(this, arguments);
      const card = G.hands[0][selectedCard]; if (!card) return;
      RED.destinada1 = { rid: card._rid, sp: spaceIdx, sl: slotIdx };
      // como en solitario: la primera queda boca abajo y se elige dónde va la segunda
      return o.apply(this, arguments);
    };
  }
  if (typeof confirmDestinada2 === 'function'){
    const o = confirmDestinada2;
    window.confirmDestinada2 = confirmDestinada2 = async function(spaceIdx, slotIdx){
      if (!(RED.enPartida && !RED.anfitrion)) return o.apply(this, arguments);
      const card2 = G.hands[0][selectedCard2]; const d1 = RED.destinada1; RED.destinada1 = null;
      if (!card2 || !d1) return;
      mandarJugada({ rid: d1.rid, sp: d1.sp, sl: d1.sl, d: { rid: card2._rid, sp: spaceIdx, sl: slotIdx } });
    };
  }
  // preguntas del anfitrión: se eligen aquí con la interfaz de siempre
  async function atenderPreguntas(){
    if (RED.preguntando) return;
    RED.preguntando = true;
    while (RED.colaPreguntas.length){
      const p = RED.colaPreguntas.shift();
      let v = null;
      try { v = await responder(p); } catch (e) { console.warn(e); }
      enviar({ t: 'resp', id: p.id, v });
    }
    RED.preguntando = false;
    quitarAviso();
  }
  const titulo = p => (p.titulo ? String(p.titulo).replace(/^Tu /, '') : T('Elige', 'Choose', '選んでください'));
  async function responder(p){
    aviso(titulo(p), true);
    const espejoC = ([sp, side, sl]) => [sp, otro(side), sl];
    if (p.tipo === 'carta'){
      const val = p.validos.map(espejoC);
      const objetos = new Set(val.map(([sp, side, sl]) => G.spaces[sp].slots[side][sl]).filter(Boolean));
      const c = await RD_ORIG.pickCardFromBoard(x => objetos.has(x), { mandatory: true });
      for (const [sp, side, sl] of val) if (G.spaces[sp].slots[side][sl] === c) return [sp, otro(side), sl];
      return null;
    }
    if (p.tipo === 'hueco'){
      const val = p.validos.map(espejoC), clave = new Set(val.map(x => x.join(',')));
      const r = await RD_ORIG.pickSlotFromBoard((sp, side, sl) => clave.has([sp, side, sl].join(',')), { mandatory: true });
      return r ? [r.spaceIdx, otro(r.side), r.slotIdx] : null;
    }
    if (p.tipo === 'espacio'){
      return await RD_ORIG.pickSpaceFromBoard(i => p.validos.includes(i), { mandatory: true });
    }
    if (p.tipo === 'lista'){
      const cartas = p.cartas || [];
      const c = await RD_ORIG.chooseCard(cartas, titulo(p), { noCancel: p.noCancel });
      const i = cartas.indexOf(c);
      return i === -1 ? null : i;
    }
    if (p.tipo === 'manoRival'){
      return await RD_ORIG.chooseRivalHandCard(titulo(p), p.excluir || []);
    }
    return null;
  }
  const RD_ORIG = {};
  ['pickCardFromBoard', 'pickSlotFromBoard', 'pickSpaceFromBoard', 'chooseCard', 'chooseRivalHandCard'].forEach(n => { RD_ORIG[n] = (...a) => {
    // en el invitado se usan las funciones normales (ya envueltas: con RD_QUIEN_ELIGE = 0 hacen lo de siempre)
    RD_QUIEN_ELIGE = 0; return window[n](...a);
  }; });
  function recibirEvento(m){
    if (!RED.enPartida) return;
    if (m.k === 'snd'){ try { playSound(m.n); } catch (e) {} return; }
    if (m.k === 'cartel' && typeof ritmoCartel === 'function'){
      let texto = m.texto, tipo = m.tipo;
      if (typeof ritmoT === 'function'){
        if (texto === ritmoT('tu')) texto = T(`${nombreAmigo()} revela`, `${nombreAmigo()} reveals`, `${nombreAmigo()}が公開`);
        else if (texto === ritmoT('ia')) texto = ritmoT('tu');
      }
      tipo = tipo === 'rc-tuyo' ? 'rc-rival' : tipo === 'rc-rival' ? 'rc-tuyo' : tipo;
      ritmoCartel(texto, { tipo, ms: m.ms || 1100 });
      return;
    }
    if (m.k === 'foco'){
      const el = typeof ritmoElementoCarta === 'function' && ritmoElementoCarta(m.sp, otro(m.owner), m.sl);
      if (el){ el.classList.add('ritmo-foco', otro(m.owner) === 0 ? 'rf-tuya' : 'rf-rival'); setTimeout(() => el.classList.remove('ritmo-foco'), ms(700)); }
      return;
    }
    if (m.k === 'pisadas' && typeof rekiPisadas === 'function'){ rekiPisadas(m.sp, m.sl, otro(m.owner)); return; }
    if (m.k === 'motas' && typeof motasMoradas === 'function'){ motasMoradas(m.sp, m.ms); return; }
    if (m.k === 'gota' && typeof gotaRealidad === 'function'){ gotaRealidad(m.sp, m.color); return; }
  }
  // animaciones propias del invitado: cartas que aparecen y que se dan la vuelta
  let VISTAS = new Map();
  function animarInvitado(){
    if (RED.anfitrion || !G || !G.spaces) return;
    const ahora = new Map();
    G.spaces.forEach((esp, sp) => [0, 1].forEach(o => esp.slots[o].forEach((c, sl) => {
      if (!c) return;
      ahora.set(c, c.faceDown);
      const antes = VISTAS.get(c);
      const el = typeof ritmoElementoCarta === 'function' ? ritmoElementoCarta(sp, o, sl) : null;
      if (!el || !el.classList.contains('card-in-slot')) return;
      if (antes === undefined && VISTAS.size){ el.classList.add('red-aparece'); setTimeout(() => el.classList.remove('red-aparece'), 500); }
      else if (antes === true && !c.faceDown){ el.classList.add('red-gira'); setTimeout(() => el.classList.remove('red-gira'), 550); }
    })));
    // si el rival acaba de usar su Destinada
    if (G.destinadaUsed && G.destinadaUsed[1] && !RED._destinadaVista){ RED._destinadaVista = true; if (typeof destinadaRivalActivada === 'function') destinadaRivalActivada(); }
    VISTAS = ahora;
  }
  function finInvitado(){
    if (!RED.enPartida) return;
    const aplicar = () => {
      if (RED.estadoPendiente){ const m = RED.estadoPendiente; RED.estadoPendiente = null; aplicarEstado(m); }
      G.phase = 'end'; quitarAviso();
      RED._finLocal = true;
      try { endGame(); } finally { RED._finLocal = false; }
    };
    setTimeout(aplicar, 250);
  }

  /* ══════════════ SALIR / REVANCHA ══════════════ */
  if (typeof showMenu === 'function'){
    const o = showMenu;
    window.showMenu = showMenu = function(){
      if (RED.activo){ salirDeRed(true); }
      return o.apply(this, arguments);
    };
  }
  if (typeof startGame === 'function'){
    const o = startGame;
    window.startGame = startGame = function(){
      // «Revancha» desde el final de una partida con un amigo: de vuelta a la sala
      if (RED.activo && RED.conectado && RED.enPartida && arguments.length === 0){
        RED.enPartida = false; quitarAviso(); pintarMarcadorRed();
        RED.sala.yo = { eligio: true, listo: false }; RED.sala.amigo = { eligio: false, listo: false };
        if (RED._pasoAPaso !== undefined){ OPTIONS.pasoAPaso = RED._pasoAPaso; delete RED._pasoAPaso; }
        enviar({ t: 'revancha' });
        abrirSala();
        return;
      }
      return o.apply(this, arguments);
    };
  }

  /* ══════════════ BOTÓN DEL MENÚ ══════════════ */
  function botonMenu(){
    const nav = document.getElementById('menu-nav'), mazo = document.getElementById('btn-deck-game-menu');
    if (!nav || !mazo) return;
    let b = document.getElementById('btn-amigo-menu');
    if (!b){
      b = document.createElement('button'); b.className = 'btn'; b.id = 'btn-amigo-menu'; b.type = 'button';
      b.onclick = () => { try { playSound('uiClick'); } catch (e) {} abrirSala(); };
      const g = document.createElement('i'); g.className = 'gema'; g.style.setProperty('--gema', '#b06ae0');
      b.appendChild(g); b.appendChild(document.createElement('span'));
      mazo.after(b);
    }
    b.querySelector('span').textContent = T('Jugar con un amigo', 'Play with a friend', '友達と対戦');
  }
  botonMenu();
  if (typeof setLang === 'function'){
    const o = setLang;
    window.setLang = setLang = function(){ const r = o.apply(this, arguments); try { botonMenu(); pintarSala(); } catch (e) {} return r; };
  }
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && document.getElementById('amigo-overlay')?.classList.contains('show')){ ev.preventDefault(); cerrarSala(); }
  });
  // latido: si en 15 s no llega nada del amigo, se da la conexión por perdida
  setInterval(() => {
    if (!RED.activo || !RED.conectado) return;
    enviar({ t: 'latido' });
    if (RED.ultimoMensaje && performance.now() - RED.ultimoMensaje > 15000) alCerrar();
  }, 3000);
  window.addEventListener('beforeunload', () => { if (RED.conectado) enviar({ t: 'adios', nombre: miPerfil().nombre }); });
})();
