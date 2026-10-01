/* Riña Divina — [Nuevo] BOTÓN «PÁGINA WEB» DEL MENÚ
   Como en el menú de la novela visual: arriba a la izquierda, un globo en
   pixel art que lleva a la página oficial de la novela ligera. (El título
   del juego ya no es un enlace.) */
function crearGloboPixel(){
  const N = 32, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), cx = 15.5, cy = 15.5, R = 13.2;
  const mar = ['#123a73','#1b5aa6','#2f7fd6','#5aa9ee','#9fd3ff'];
  const tierra = ['#1f5a2e','#2f7d3c','#4aa352','#7fcf6a'];
  // continentes: manchas en coordenadas de longitud/latitud (grados), para que «envuelvan» la esfera
  const manchas = [[-55,30,30],[-45,0,22],[-65,-32,18],[20,38,26],[28,8,26],[22,-24,18],[95,42,30],[118,12,16],[132,-26,16],[-100,55,16],[60,62,20]];
  const giro = 25;
  for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){
    const dx = (x - cx) / R, dy = (y - cy) / R, d2 = dx*dx + dy*dy;
    if(d2 > 1) continue;
    const dz = Math.sqrt(1 - d2);
    const lat = Math.asin(-dy) * 180 / Math.PI, lon = Math.atan2(dx, dz) * 180 / Math.PI + giro;
    // luz desde arriba a la izquierda
    const luz = Math.max(0, (-dx*0.55 - dy*0.6 + dz*0.6));
    let enTierra = false;
    for(const [lo, la, r] of manchas){ let dl = ((lon - lo + 540) % 360) - 180; const dd = Math.hypot(dl * Math.cos(la*Math.PI/180), lat - la); if(dd < r * (0.75 + 0.25*Math.sin(lo + la + x*0.7 + y*1.3))) { enTierra = true; break; } }
    const pal = enTierra ? tierra : mar;
    let k = Math.min(pal.length - 1, Math.max(0, Math.floor(luz * pal.length * 0.95 + 0.4)));
    g.fillStyle = pal[k];
    // nubes: franjas finas y onduladas
    const nube = [[-20,48,9,3],[50,-12,11,3],[5,10,7,2],[-75,-40,8,2]].some(([lo,la,rx,ry])=>{ const dl=((lon-lo+540)%360)-180; return (dl*dl)/(rx*rx)+((lat-la)*(lat-la))/(ry*ry) < 1; });
    if(nube) g.fillStyle = luz > 0.45 ? '#f4f8ff' : '#b8c8e0';
    // borde: oscuro abajo a la derecha, halo de atmósfera arriba a la izquierda
    if(d2 > 0.82) g.fillStyle = (dx + dy < -0.2) ? '#8fd0ff' : (enTierra ? '#174a25' : '#0e2f5e');
    g.fillRect(x, y, 1, 1);
  }
  // brillo
  g.fillStyle = '#ffffff'; [[9,8],[10,8],[9,9]].forEach(([x,y])=>g.fillRect(x,y,1,1));
  // contorno negro de 1 px
  const img = g.getImageData(0, 0, N, N), a = (x,y)=> x>=0&&y>=0&&x<N&&y<N && img.data[(y*N+x)*4+3] > 0;
  g.fillStyle = '#0a0a10';
  for(let y = 0; y < N; y++) for(let x = 0; x < N; x++) if(!a(x,y) && (a(x-1,y)||a(x+1,y)||a(x,y-1)||a(x,y+1))) g.fillRect(x, y, 1, 1);
  return c;
}
(function(){
  const menu = document.getElementById('screen-menu'); if (!menu) return;
  const TXT = { es: 'Página web', en: 'Website', ja: 'ウェブサイト' };
  const TIT = { es: 'Página web oficial de la novela ligera', en: 'Official website of the light novel', ja: 'ライトノベル公式サイト' };
  const btn = document.createElement('button'); btn.id = 'web-btn'; btn.type = 'button';
  btn.innerHTML = '<span class="web-btn-ico"></span><span class="web-btn-txt"></span>';
  btn.querySelector('.web-btn-ico').appendChild(crearGloboPixel());
  const pintar = () => { const L = window.CURRENT_LANG || 'es'; btn.querySelector('.web-btn-txt').textContent = TXT[L] || TXT.es; btn.title = TIT[L] || TIT.es; };
  pintar();
  btn.addEventListener('click', e => { e.stopPropagation(); window.open('https://tinyurl.com/lekimsama', '_blank', 'noopener'); });
  menu.appendChild(btn);
  if (typeof applyTranslations === 'function'){
    const orig = applyTranslations;
    window.applyTranslations = function(){ const r = orig.apply(this, arguments); try { pintar(); } catch (e) {} return r; };
  }
})();
