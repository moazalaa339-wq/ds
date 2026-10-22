'use strict';
/* Hawa Engine v2.2
   - تحديد الكائن بمعلم أخضر، وكل وضع له gizmo مميز (التدوير = 3 حلقات)
   - وضع الطيران: حركة بالكيبورد بدون ضغط على الشاشة. Space طلوع · Shift نزول · Ctrl يظهر/يلغي الماوس
   - قسم البرمجة: كل ملف له تفعيل / إلغاء تفعيل (أخضر = مفعّل، أحمر = غير مفعّل)
   - قسم الكائنات البرمجية: يدعم سكربتات المحرك الكبير (Game.defineParams / Game.onUpdate ...) بنفس الشكل
*/
(() => {
const T = THREE, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const D2R = Math.PI / 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), E = .02;
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const PH = 2.15, PR = .34;   // ارتفاع ونصف قطر اللاعب

/* ---------- أيقونات SVG ---------- */
const ICO = {
  cursor: '<path d="M4 4l7 17 2.5-7.5L21 11z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  move: '<path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  scale: '<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l16 16"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  fly: '<path d="M2 12l20-8-8 20-2-8-10-4z"/>',
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-3.2 4M6.6 6.6C3.4 8.6 1 12 1 12s4 7 11 7a10 10 0 0 0 5.4-1.6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  grid: '<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>',
  flag: '<path d="M4 21V4M4 4h12l-2 4 2 4H4"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
  load: '<path d="M3 7h6l2 2h10v11H3z"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  export: '<path d="M12 3v12M8 11l4 4 4-4M4 19h16"/>',
  marquee: '<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 2" fill="none"/><path d="M3 3h4M17 3h4M3 21h4M17 21h4M3 3v4M3 17v4M21 3v4M21 17v4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 19c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5.4 4.5 1.8 4.5 4"/>'
};
const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ''}</svg>`;

/* ---------- تعريف الكائنات ---------- */
const DEF = {
  cube:   {n:'مكعب',i:'🧊',c:'#8fa3b8',s:[1,1,1],g:'cube',solid:1},
  wall:   {n:'جدار',i:'🧱',c:'#a8927a',s:[4,3,.4],g:'cube',solid:1},
  floor:  {n:'أرضية',i:'⬜',c:'#6b7f6b',s:[8,.4,8],g:'cube',solid:1},
  cyl:    {n:'أسطوانة',i:'🛢',c:'#9aa6c8',s:[1,2,1],g:'cyl',solid:1},
  sphere: {n:'كرة',i:'⚪',c:'#c89a9a',s:[1,1,1],g:'sphere',solid:1},
  ramp:   {n:'منحدر',i:'📐',c:'#b8a46b',s:[3,2,4],g:'ramp',solid:1},
  coin:   {n:'عملة',i:'🪙',c:'#ffd23f',s:[.8,.8,.8],g:'coin',p:{value:1}},
  pad:    {n:'نطاطة',i:'⏫',c:'#22d3ee',s:[2,.3,2],g:'cube',p:{power:16}},
  kill:   {n:'منطقة موت',i:'☠',c:'#ef4444',s:[4,1,4],g:'cube'},
  plat:   {n:'منصة متحركة',i:'🛗',c:'#a78bfa',s:[4,.5,4],g:'cube',solid:1,p:{axis:0,amp:4,speed:1}},
  light:  {n:'ضوء',i:'💡',c:'#fff2c0',s:[1,1,1],g:'sphere',p:{intensity:1.2,range:18}},
  respawn:{n:'نقطة بدء',i:'🚩',c:'#34d399',s:[1,1,1]},
  online_spawn:{n:'نقطة أونلاين',i:'🌐',c:'#60a5fa',s:[1,1,1],p:{slot:1}},
  sobj:   {n:'كائن برمجي',i:'🎮',c:'#a78bfa',s:[1,1,1],g:'cube',solid:1,p:{}}
};
const CATS = [['🏛 الجماد',['cube','wall','floor','cyl','sphere','ramp']],['⚡ التفاعلي',['pad','kill','plat','light']]];
const PL = {value:'القيمة',power:'قوة النط',axis:'المحور 0=X 1=Y 2=Z',amp:'المسافة',speed:'السرعة',intensity:'الشدة',range:'المدى',slot:'رقم اللاعب 1–3'};
const HINT = { select:'', place:'', delete:'', boxdel:'', online_spawn:'', respawn:'' };
const STPL = `// @param speed = 2
// @param color = #ffaa00
function onStart(self, game) {}
function onUpdate(self, game, dt) {}
`;
const TPL = `// self = الكائن المرتبط (position / rotation / scale / props / hide())
function onStart(self, game) {
}
function onUpdate(self, game, dt) {
  // self.rotation.y += dt;
}
`;
const API = `onStart(self,game) onUpdate(self,game,dt) onTouch(self,game,dt)
self: name,props,mesh,position,rotation,scale,hide,show,hideBody,dist
game: THREE,scene,camera,time,score,addScore,say,respawn,key,setKey,forcePlayerInput,find,player,coords,setHud,setPlayerLimb,touch
مدخل موحّد (كيبورد + موبايل نفس المصدر):
  game.key('KeyW'|'KeyA'|'KeyS'|'KeyD'|'Space'|'KeyE'|'KeyF'|...)
  game.setKey(code,true|false) — كأنك بتضغط/بتسيب زر كيبورد (يشتغل لأي سكربت/مركبة/تفاعل)
  game.forcePlayerInput(0,{up,down,left,right,jump,run,interact,action,KeyE,...})
game.touch: show(list) hide() isDown(id) wasPressed(id) isMobile()`;


function parseParams(code) {
  const o = {}, re = /^\s*\/\/\s*@param\s+(\w+)\s*=\s*(.+?)\s*$/gm; let m;
  while ((m = re.exec(code))) {
    let v = m[2];
    if (v === 'true') v = true; else if (v === 'false') v = false;
    else if (v !== '' && isFinite(+v)) v = +v;
    else v = v.replace(/^["']|["']$/g, '');
    o[m[1]] = v;
  }
  return o;
}

/* ---------- سكربتات المحرك الكبير ---------- */
const BIG_RE = /Game\s*\.\s*(onUpdate|defineParams|registerInteractAction)\b/;
const isBig = code => BIG_RE.test(code || '');
const SCH = new Map();
function schemaOf(code) {
  if (SCH.has(code)) return SCH.get(code);
  let out = [];
  const m = /Game\s*\.\s*defineParams\s*\(\s*(\[[\s\S]*?\])\s*\)/.exec(code || '');
  if (m) { try { out = new Function('return ' + m[1])() || []; } catch (e) { out = []; } }
  out = out.filter(x => x && x.key);
  SCH.set(code, out); return out;
}
const defOf = id => S.sdefs.find(x => x.id === id);

/* ---------- الحالة ---------- */
const S = {objs:[], scripts:[], sdefs:[], sel:null, mode:'build', tool:'select', gz:'move', item:'cube', section:'objects',
  snap:.5, nid:1, sid:1, did:1, dirty:1, err:[], hr:null, fly:false};
const OBJ = new Map(), MESH = new Map(), K = {};
/* مفاتيح افتراضية (موبايل/سكربت) — تتعامل ككيبورد حقيقي لأي نظام يقرأ keyDown */
const VK = Object.create(null);
function keyDown(code) {
  const c = String(code || '');
  return !!(K[c] || VK[c]);
}
function setVirtualKey(code, down) {
  const c = String(code || '');
  if (!c) return;
  if (down) VK[c] = 1; else delete VK[c];
  // مرآة على K عشان أي كود قديم يقرأ K مباشرة
  K[c] = down ? 1 : 0;
}
function clearVirtualKeys() {
  for (const c of Object.keys(VK)) { delete VK[c]; if (K[c]) K[c] = 0; }
}
function applyInputMap(inp) {
  if (!inp || typeof inp !== 'object') return;
  const pairs = [
    ['up', 'KeyW'], ['forward', 'KeyW'], ['KeyW', 'KeyW'],
    ['down', 'KeyS'], ['back', 'KeyS'], ['KeyS', 'KeyS'],
    ['left', 'KeyA'], ['KeyA', 'KeyA'],
    ['right', 'KeyD'], ['KeyD', 'KeyD'],
    ['jump', 'Space'], ['Space', 'Space'],
    ['run', 'ShiftLeft'], ['ShiftLeft', 'ShiftLeft'],
    ['interact', 'KeyE'], ['KeyE', 'KeyE'],
    ['action', 'KeyF'], ['KeyF', 'KeyF'],
    ['KeyQ', 'KeyQ'], ['KeyR', 'KeyR'], ['KeyC', 'KeyC'], ['KeyX', 'KeyX'],
    ['Digit1', 'Digit1'], ['Digit2', 'Digit2'], ['Digit3', 'Digit3']
  ];
  for (const [src, dst] of pairs) {
    if (inp[src] != null) setVirtualKey(dst, !!inp[src]);
  }
}

let RT = null, rmb = false, edI = null, edK = 'script', SELH = null;

/* ---------- المشهد ---------- */
const cv = $('#cv'), vp = $('#vp'), pvp = $('#pvp');
let R, scene, cam, sun, grid;
try {
  R = new T.WebGLRenderer({canvas: cv, antialias: true, powerPreference: 'high-performance'});
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  scene = new T.Scene(); scene.background = new T.Color(0x0e1726);
  cam = new T.PerspectiveCamera(60, 1, .1, 1500);
  scene.add(new T.HemisphereLight(0xcfe3ff, 0x3a3f4a, .9));
  sun = new T.DirectionalLight(0xffffff, 1.1); sun.position.set(30, 50, 20); scene.add(sun);
  grid = new T.GridHelper(200, 200, 0x3b5068, 0x1f3049); grid.position.y = .01; scene.add(grid);
} catch (webglErr) {
  console.error('WebGL init failed — UI will still work', webglErr);
  // stubs so later code does not crash
  R = { setSize(){}, setPixelRatio(){}, render(){}, domElement: cv };
  scene = { add(){}, remove(){}, background: null, children: [] };
  cam = { position: { set(){}, clone(){ return {x:0,y:0,z:0}; } }, lookAt(){}, updateMatrixWorld(){}, updateProjectionMatrix(){}, aspect: 1 };
  sun = { position: { set(){} } };
  grid = { position: { y: 0 }, visible: true };
}

const G = {
  cube: new T.BoxGeometry(1, 1, 1), sphere: new T.SphereGeometry(.5, 20, 14), cyl: new T.CylinderGeometry(.5, .5, 1, 24),
  coin: new T.CylinderGeometry(.5, .5, .12, 20).rotateX(Math.PI / 2), cone: new T.ConeGeometry(.35, 1.2, 16), ring: new T.RingGeometry(.4, .6, 28)
};
(() => {
  const A = [-.5,-.5,-.5], B = [.5,-.5,-.5], C = [.5,-.5,.5], D = [-.5,-.5,.5], Ee = [-.5,.5,.5], F = [.5,.5,.5];
  const tr = [A,B,C, A,C,D, D,C,F, D,F,Ee, A,F,B, A,Ee,F, A,D,Ee, B,F,C];
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(tr.flat(), 3)); g.computeVertexNormals(); G.ramp = g;
})();

const MC = new Map();
function mat(c, t) {
  const k = c + '|' + t; let m = MC.get(k);
  if (!m) {
    const o = {color: c, roughness: .75, metalness: .05};
    if (t === 'kill') { o.transparent = true; o.opacity = .35; o.depthWrite = false; }
    if (t === 'coin') { o.emissive = c; o.emissiveIntensity = .35; o.metalness = .6; o.roughness = .3; }
    if (t === 'pad' || t === 'light' || t === 'respawn' || t === 'sobj') { o.emissive = c; o.emissiveIntensity = .5; }
    m = new T.MeshStandardMaterial(o); MC.set(k, m);
  }
  return m;
}
const INST = new T.MeshStandardMaterial({color: 0xffffff, roughness: .75, metalness: .05});
const HIDM = new T.MeshStandardMaterial({color: 0x7dd3fc, transparent: true, opacity: .16, depthWrite: false, roughness: 1});
const GM = {
  ok: new T.MeshStandardMaterial({color: 0x34d399, transparent: true, opacity: .38, depthWrite: false, emissive: 0x14532d, emissiveIntensity: .25}),
  bad: new T.MeshStandardMaterial({color: 0xf43f5e, transparent: true, opacity: .45, depthWrite: false, emissive: 0x7f1d1d, emissiveIntensity: .2})
};

/* ---------- كاميرا البناء (مدار حول نقطة + طيران) ---------- */
const OB = {t: new T.Vector3(0, 1, 0), yaw: .8, pitch: .55, dist: 22};
const dirOf = (y, p) => { const cc = Math.cos(p); return [cc * Math.sin(y), Math.sin(p), cc * Math.cos(y)]; };
const FLOOR_EPS = .25;
function camUpdate() {
  if (OB.t.y < 0) OB.t.y = 0;
  const minS = (FLOOR_EPS - OB.t.y) / OB.dist;
  if (Math.sin(OB.pitch) < minS) OB.pitch = Math.asin(clamp(minS, -1, 1));
  const d = dirOf(OB.yaw, OB.pitch);
  cam.position.set(OB.t.x + OB.dist * d[0], OB.t.y + OB.dist * d[1], OB.t.z + OB.dist * d[2]);
  cam.lookAt(OB.t); cam.updateMatrixWorld(); S.dirty = 1;
}
function lookAround(dx, dy) {
  const cp = cam.position.clone();
  OB.yaw -= dx * .0035; OB.pitch = clamp(OB.pitch + dy * .0035, -1.5, 1.5);
  const d = dirOf(OB.yaw, OB.pitch);
  OB.t.set(cp.x - OB.dist * d[0], Math.max(0, cp.y - OB.dist * d[1]), cp.z - OB.dist * d[2]);
  camUpdate();
}
function resize() {
  const host = cv.parentElement, w = host.clientWidth || 1, h = host.clientHeight || 1;
  R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); S.dirty = 1;
}
const ro = new ResizeObserver(() => resize());
function attach(host) {
  if (cv.parentElement !== host) host.insertBefore(cv, host.firstChild);
  ro.disconnect(); ro.observe(host); resize();
}

/* ---------- الهندسة والتصادم ---------- */
function aabbOf(o) {
  const [sx, sy, sz] = o.scl, e = new T.Matrix4().makeRotationFromEuler(new T.Euler(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R)).elements;
  const hx = .5 * (Math.abs(e[0]) * sx + Math.abs(e[4]) * sy + Math.abs(e[8]) * sz);
  const hy = .5 * (Math.abs(e[1]) * sx + Math.abs(e[5]) * sy + Math.abs(e[9]) * sz);
  const hz = .5 * (Math.abs(e[2]) * sx + Math.abs(e[6]) * sy + Math.abs(e[10]) * sz);
  const x = o.pos[0], z = o.pos[2], y0 = o.pos[1] - (o.base ? 0 : hy);
  return {id: o.id, x, y: y0 + hy, z, hx, hy, hz, x0: x - hx, x1: x + hx, y0, y1: y0 + 2 * hy, z0: z - hz, z1: z + hz};
}
const solid = o => o.solid && !o.hidden && o.type !== 'light' && o.type !== 'respawn' && o.type !== 'online_spawn';
function supportY(b, ceil = Infinity) {
  let top = 0;
  for (const o of S.objs) {
    if (o.id === b.id || !solid(o)) continue;
    const c = aabbOf(o);
    if (c.y1 > ceil + E || c.y1 <= top) continue;
    if (c.x1 <= b.x0 + E || c.x0 >= b.x1 - E || c.z1 <= b.z0 + E || c.z0 >= b.z1 - E) continue;
    top = c.y1;
  }
  return top;
}
function blockers(b) {
  for (const o of S.objs) {
    if (o.id === b.id || !solid(o)) continue;
    const c = aabbOf(o);
    if (c.x1 > b.x0 + E && c.x0 < b.x1 - E && c.y1 > b.y0 + E && c.y0 < b.y1 - E && c.z1 > b.z0 + E && c.z0 < b.z1 - E) return c;
  }
  return null;
}
function rayBox(o, d, b) {
  let t0 = -Infinity, t1 = Infinity, n = null;
  const A = [[o.x, d.x, b.x0, b.x1], [o.y, d.y, b.y0, b.y1], [o.z, d.z, b.z0, b.z1]];
  for (let i = 0; i < 3; i++) {
    const [oc, dc, lo, hi] = A[i];
    if (Math.abs(dc) < 1e-9) { if (oc < lo || oc > hi) return null; continue; }
    const a = ((dc > 0 ? lo : hi) - oc) / dc, c = ((dc > 0 ? hi : lo) - oc) / dc, nn = dc > 0 ? -1 : 1;
    if (a > t0) { t0 = a; n = [0, 0, 0]; n[i] = nn; }
    if (c < t1) t1 = c;
    if (t0 > t1) return null;
  }
  if (t0 < 0 || t1 < 0) return null;
  return {t: t0, n};
}
function castRay(r) {
  const o = r.origin, d = r.direction; let best = null;
  for (const ob of S.objs) {
    if (!solid(ob)) continue;
    const h = rayBox(o, d, aabbOf(ob));
    if (h && (!best || h.t < best.t)) best = h;
  }
  if (d.y < -1e-6) { const t = -o.y / d.y; if (t > 0 && (!best || t < best.t)) best = {t, n: [0, 1, 0]}; }
  if (!best) return null;
  return {p: [o.x + d.x * best.t, o.y + d.y * best.t, o.z + d.z * best.t], n: best.n};
}
function spotFor(info, h) {
  const isR = info.bt === 'respawn' || info.bt === 'online_spawn', sc = info.sc, base = !!info.base && !isR;
  const hx = sc[0] / 2, hy = isR ? 0 : sc[1] / 2, hz = sc[2] / 2, lo = base ? 0 : hy;
  const [nx, ny, nz] = h.n, g = S.snap, c = h.p.slice();
  if (!isR) { const off = Math.abs(nx) * hx + Math.abs(ny) * hy + Math.abs(nz) * hz; c[0] += nx * off; c[1] += ny * off; c[2] += nz * off; }
  if (g) { c[0] = Math.round(c[0] / g) * g; c[2] = Math.round(c[2] / g) * g; }
  const top = ny > .5 || isR;
  let cen = c[1];
  const boxAt = y => isR ? {id: -1, x0: c[0] - PR, x1: c[0] + PR, y0: y, y1: y + PH, z0: c[2] - PR, z1: c[2] + PR}
                         : {id: -1, x0: c[0] - hx, x1: c[0] + hx, y0: y - hy, y1: y + hy, z0: c[2] - hz, z1: c[2] + hz};
  if (top) cen = supportY({id: -1, x0: c[0] - hx, x1: c[0] + hx, z0: c[2] - hz, z1: c[2] + hz}) + hy;
  for (let k = 0; k < 24; k++) {
    if (!top && cen - hy < 0) cen = hy;
    const b = boxAt(cen), bl = blockers(b);
    if (!bl) break;
    if (top) cen = Math.max(cen + .25, bl.y1 + hy);
    else { c[0] += nx * .25; cen += ny * .25; c[2] += nz * .25; }
    if (k === 23) return {p: c, yc: cen, ok: false};
  }
  if (isR) return {p: [c[0], cen, c[2]], yc: cen, ok: true};
  return {p: [c[0], cen - hy + lo, c[2]], yc: cen, ok: true};
}
function phInfo() {
  if (S.tool === 'respawn') return {bt: 'respawn', sc: [2 * PR, PH, 2 * PR], base: false};
  if (S.tool === 'online_spawn') return {bt: 'online_spawn', sc: [2 * PR, PH, 2 * PR], base: false};
  if (String(S.item).startsWith('s:')) {
    const d = defOf(+S.item.slice(2)), big = !!d && isBig(d.code);
    return {bt: 'sobj', sc: big ? [2, 2.2, 3.6] : [1, 1, 1], base: big, def: d};
  }
  return {bt: S.item, sc: [...DEF[S.item].s], base: false};
}
function countOnlineSpawns() { return S.objs.filter(o => o.type === 'online_spawn').length; }
function nextOnlineSlot() {
  const used = new Set(S.objs.filter(o => o.type === 'online_spawn').map(o => +(o.p && o.p.slot) || 1));
  for (let i = 1; i <= 3; i++) if (!used.has(i)) return i;
  return 0;
}
function updOnRsBtn() {
  const n = countOnlineSpawns();
  const el = $('#onRsN'); if (el) el.textContent = n + '/3';
  const b = $('#bOnRs'); if (b) b.classList.toggle('on', S.tool === 'online_spawn');
}

/* ---------- الكائنات ---------- */
function mk(o) {
  const d = DEF[o.type]; let m;
  if (o.type === 'light') {
    m = new T.Group(); m.add(new T.PointLight(o.color, o.p.intensity, o.p.range));
    const s = new T.Mesh(G.sphere, mat(o.color, 'light')); s.scale.setScalar(.4); m.add(s);
  } else if (o.type === 'sobj') {
    m = new T.Group(); const b = new T.Mesh(G.cube, mat(o.color, 'sobj')); m.add(b); m.userData.body = b;
  } else if (o.type === 'respawn' || o.type === 'online_spawn') {
    m = new T.Group();
    const c = new T.Mesh(G.cone, mat(o.color, o.type)); c.position.y = .6;
    const r = new T.Mesh(G.ring, mat(o.color, o.type)); r.rotation.x = -Math.PI / 2; r.position.y = .03;
    m.add(c, r);
    if (o.type === 'online_spawn') {
      const slot = (o.p && o.p.slot) || 1;
      const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
      const g = canvas.getContext('2d'); g.fillStyle = '#1e3a5f'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 32px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(slot), 32, 34);
      const sp = new T.Sprite(new T.SpriteMaterial({map: new T.CanvasTexture(canvas), depthTest: false, transparent: true}));
      sp.position.y = 1.3; sp.scale.set(0.7, 0.7, 1); m.add(sp);
    }
  } else m = new T.Mesh(G[d.g], mat(o.color, o.type));
  m.userData.id = o.id; m.matrixAutoUpdate = false; scene.add(m); MESH.set(o.id, m);
  tf(o); look(o);
}
function tf(o) {
  const m = MESH.get(o.id); if (!m) return;
  m.position.set(o.pos[0], o.pos[1], o.pos[2]);
  m.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R, o.base ? 'YXZ' : 'XYZ');
  if (o.base && m.userData.body) {   // كائن برمجي من المحرك الكبير: الجذر = الأرض، والمعاينة تأخذ الحجم
    m.scale.set(1, 1, 1);
    m.userData.body.scale.set(o.scl[0], o.scl[1], o.scl[2]); m.userData.body.position.set(0, o.scl[1] / 2, 0);
  } else m.scale.set(o.scl[0], o.scl[1], o.scl[2]);
  m.updateMatrix(); S.dirty = 1;
}
function look(o) {
  const m = MESH.get(o.id); if (!m) return;
  const ghost = o.hidden && S.mode === 'build';
  m.traverse(x => { if (!x.isMesh) return; if (!x.userData.base) x.userData.base = x.material; x.material = ghost ? HIDM : x.userData.base; });
  m.visible = !(o.hidden && S.mode === 'play'); S.dirty = 1;
}
function recolor(o) {
  const m = MESH.get(o.id); if (!m) return;
  m.traverse(x => { if (x.isMesh) x.userData.base = mat(o.color, o.type); if (x.isLight) x.color.set(o.color); });
  look(o);
}
function reg(o) { S.objs.push(o); OBJ.set(o.id, o); fillDefaults(o); mk(o); if (o.type === 'sobj') refreshPreview(o); return o; }
function fillDefaults(o) {
  if (o.type !== 'sobj') return;
  const d = defOf(o.def); if (!d) return;
  for (const e of schemaOf(d.code)) if (o.p[e.key] === undefined) o.p[e.key] = e.value;
}
function add(type, pos, ex) {
  const d = DEF[type], id = S.nid++;
  const o = {id, name: d.n + ' ' + id, type, pos: [...pos], rot: [0, 0, 0], scl: [...d.s], color: d.c, solid: !!d.solid, hidden: false, scripts: [], base: false, p: {...(d.p || {})}};
  if (ex) Object.assign(o, ex);
  return reg(o);
}
function placeNow(info, pos) {
  if (info.bt === 'sobj') {
    const d = info.def; if (!d) { tip('⚠ الكائن البرمجي غير موجود'); return null; }
    return add('sobj', pos, {def: d.id, name: d.name, p: parseParams(d.code), base: !!info.base, scl: [...info.sc]});
  }
  if (info.bt === 'online_spawn') {
    if (countOnlineSpawns() >= 3) { tip('⚠ الحد الأقصى 3 نقاط أونلاين'); return null; }
    const slot = nextOnlineSlot();
    if (!slot) { tip('⚠ مفيش سلو متاح'); return null; }
    const o = add('online_spawn', pos, {name: 'أونلاين ' + slot, color: '#60a5fa', p: {slot}});
    updOnRsBtn(); return o;
  }
  return add(info.bt, pos);
}
function delObj(id) {
  removePreview(id);
  const m = MESH.get(id); if (m) scene.remove(m);
  MESH.delete(id); OBJ.delete(id); S.objs = S.objs.filter(o => o.id !== id);
  if (S.sel === id) sel(null); hier(); chg(); updOnRsBtn();
}
function dup() {
  const s = OBJ.get(S.sel); if (!s) return;
  const o = JSON.parse(JSON.stringify(s)); o.id = S.nid++; o.pos[0] += 1; o.name = s.name + ' ٢';
  reg(o); sel(o.id); hier(); chg();
}
function clearAll() { for (const id of [...MESH.keys()]) removePreview(id); for (const m of MESH.values()) scene.remove(m); MESH.clear(); OBJ.clear(); S.objs = []; sel(null); }

/* ---------- المعاينة (شبح بالشكل الكامل أثناء الوضع) ----------
   أي كائن (عادي أو برمجي): الشبح = الشكل الحقيقي شفاف أخضر/أحمر، مش صندوق.
   للكائنات البرمجية: بنبني الموديل مرة ونخزّنه، ونطبّق عليه مواد شبح. */
const GH = new T.Group(); GH.visible = false; scene.add(GH);
let ghKey = '';
let ghSimple = null;           // Mesh بسيط للكائنات العادية
const GH_CACHE = new Map();    // defId -> {root: Group, code: string}
const GHOST_OK = new T.MeshStandardMaterial({color: 0x34d399, transparent: true, opacity: .32, depthWrite: false, emissive: 0x14532d, emissiveIntensity: .35, roughness: .7, metalness: .05, side: T.DoubleSide});
const GHOST_BAD = new T.MeshStandardMaterial({color: 0xf43f5e, transparent: true, opacity: .38, depthWrite: false, emissive: 0x7f1d1d, emissiveIntensity: .3, roughness: .7, metalness: .05, side: T.DoubleSide});

function clearGhChildren() {
  while (GH.children.length) {
    const c = GH.children[0];
    GH.remove(c);
  }
  ghSimple = null;
}

function applyGhostMats(root, ok) {
  const mat = ok ? GHOST_OK : GHOST_BAD;
  root.traverse(x => {
    if (!x.isMesh) return;
    x.material = mat;
    x.castShadow = false;
    x.receiveShadow = false;
  });
}

function buildSobjGhost(def) {
  if (!def || !def.code) return null;
  const cached = GH_CACHE.get(def.id);
  if (cached && cached.code === def.code) return cached.root;
  const root = new T.Group();
  root.userData.__ghostBuild = true;
  try {
    const fakeO = {id: -1, name: def.name, type: 'sobj', def: def.id, p: parseParams(def.code), pos: [0,0,0], rot: [0,0,0], scl: [1,1,1], base: isBig(def.code)};
    const body = new T.Mesh(G.cube, mat('#888', 'sobj'));
    body.visible = false;
    root.userData.body = body;
    root.add(body);
    new Function('Game', 'root', def.code)(bigGame(previewRt(), fakeO, root), root);
    root.traverse(x => {
      if (x.isLight) { x.intensity = 0; x.visible = false; }
    });
  } catch (e) {
    console.warn('ghost build fail', def.name, e);
    return null;
  }
  GH_CACHE.set(def.id, {root, code: def.code});
  return root;
}

function invalidateGhostCache(defId) {
  if (defId != null) GH_CACHE.delete(defId);
  else GH_CACHE.clear();
}

function ghostUpdate() {
  if (S.mode !== 'build' || (S.tool !== 'place' && S.tool !== 'respawn' && S.tool !== 'online_spawn') || !S.hr) {
    GH.visible = false;
    return;
  }
  const info = phInfo(), h = castRay(S.hr);
  if (!h) { GH.visible = false; return; }
  const sp = spotFor(info, h);
  const isR = info.bt === 'respawn' || info.bt === 'online_spawn';
  const ok = !!sp.ok;
  const sc = isR ? [.9, .9, .9] : (info.sc || [1, 1, 1]);
  const y = isR ? sp.p[1] : sp.yc;
  const key = [sp.p[0], y, sp.p[2]].map(v => (+v).toFixed(2)).join() + '|' + ok + '|' + info.bt + '|' + (info.def ? info.def.id : '') + '|' + sc.join();

  const contentKey = info.bt + ':' + (info.def ? info.def.id : '') + ':' + (info.def ? (info.def.code || '').length : '');
  if (GH.userData.contentKey !== contentKey) {
    clearGhChildren();
    GH.userData.contentKey = contentKey;

    if (info.bt === 'sobj' && info.def && isBig(info.def.code)) {
      const full = buildSobjGhost(info.def);
      if (full) {
        GH.add(full);
        full.position.set(0, 0, 0);
        full.rotation.set(0, 0, 0);
        full.scale.set(1, 1, 1);
        applyGhostMats(full, ok);
        GH.userData.isFull = true;
      } else {
        ghSimple = new T.Mesh(G.cube, ok ? GHOST_OK : GHOST_BAD);
        GH.add(ghSimple);
        GH.userData.isFull = false;
      }
    } else {
      let geo = G.cube;
      if (isR) geo = G.ring;
      else if (DEF[info.bt] && DEF[info.bt].g && G[DEF[info.bt].g]) geo = G[DEF[info.bt].g];
      ghSimple = new T.Mesh(geo, ok ? GHOST_OK : GHOST_BAD);
      if (isR) ghSimple.rotation.x = -Math.PI / 2;
      GH.add(ghSimple);
      GH.userData.isFull = false;
    }
  } else {
    if (GH.userData.isFull) {
      for (const c of GH.children) applyGhostMats(c, ok);
    } else if (ghSimple) {
      ghSimple.material = ok ? GHOST_OK : GHOST_BAD;
    }
  }

  if (GH.userData.isFull) {
    GH.position.set(sp.p[0], sp.p[1], sp.p[2]);
    GH.scale.set(1, 1, 1);
    GH.rotation.set(0, 0, 0);
  } else {
    const y = isR ? sp.p[1] : sp.yc;
    GH.position.set(sp.p[0], y, sp.p[2]);
    GH.scale.set(sc[0], sc[1], sc[2]);
    GH.rotation.set(0, 0, 0);
  }
  GH.visible = true;

  if (key !== ghKey) { ghKey = key; S.dirty = 1; }
}

/* ---------- Gizmo: حركة (أسهم) · تدوير (3 حلقات) · حجم (مربعات) ---------- */
const gizmo = new T.Group(); gizmo.visible = false; scene.add(gizmo);
const AXC = [0xef4444, 0x22c55e, 0x3b82f6];
const GZ = {move: new T.Group(), rot: new T.Group(), scl: new T.Group()};
gizmo.add(GZ.move, GZ.rot, GZ.scl);
const HIT = [];
const mkm = c => new T.MeshBasicMaterial({color: c, depthTest: false, transparent: true, opacity: .95});
const invis = () => new T.MeshBasicMaterial({visible: false});
AXC.forEach((c, i) => {   // أسهم النقل
  const g = new T.Group(), mt = mkm(c);
  const sh = new T.Mesh(new T.CylinderGeometry(.04, .04, 1.2, 8), mt); sh.position.y = .6;
  const cp = new T.Mesh(new T.ConeGeometry(.14, .4, 12), mt); cp.position.y = 1.4;
  const hit = new T.Mesh(new T.CylinderGeometry(.18, .18, 1.7, 8), invis()); hit.position.y = .85;
  [sh, cp].forEach(x => x.renderOrder = 999);
  g.add(sh, cp, hit); if (i === 0) g.rotation.z = -Math.PI / 2; if (i === 2) g.rotation.x = Math.PI / 2;
  GZ.move.add(g); HIT.push({m: hit, ax: i, mode: 'move', vis: [sh, cp]});
});
AXC.forEach((c, i) => {   // حلقات التدوير
  const mt = mkm(c), g = new T.Group();
  const ring = new T.Mesh(new T.TorusGeometry(1.2, .045, 10, 80), mt);
  const hit = new T.Mesh(new T.TorusGeometry(1.2, .16, 8, 48), invis());
  ring.renderOrder = 999; hit.renderOrder = 999;
  g.add(ring, hit); if (i === 0) g.rotation.y = Math.PI / 2; if (i === 1) g.rotation.x = Math.PI / 2;
  GZ.rot.add(g); HIT.push({m: hit, ax: i, mode: 'rotate', vis: [ring]});
});
AXC.forEach((c, i) => {   // مقابض الحجم
  const g = new T.Group(), mt = mkm(c);
  const sh = new T.Mesh(new T.CylinderGeometry(.03, .03, 1.2, 8), mt); sh.position.y = .6;
  const cp = new T.Mesh(new T.BoxGeometry(.26, .26, .26), mt); cp.position.y = 1.3;
  const hit = new T.Mesh(new T.CylinderGeometry(.18, .18, 1.7, 8), invis()); hit.position.y = .85;
  g.add(sh, cp, hit); if (i === 0) g.rotation.z = -Math.PI / 2; if (i === 2) g.rotation.x = Math.PI / 2;
  GZ.scl.add(g); HIT.push({m: hit, ax: i, mode: 'scale', vis: [sh, cp]});
});
let HOV = null;
function hiAx(rec, on) { if (rec) rec.vis.forEach(v => v.material.color.set(on ? 0xfff06a : AXC[rec.ax])); }
function hoverGizmo(e) {
  if (!S.sel || !gizmo.visible || S.mode !== 'build') { if (HOV) { hiAx(HOV, false); HOV = null; S.dirty = 1; } return; }
  const list = HIT.filter(h => h.mode === S.gz).map(h => h.m);
  const hh = ray(e).intersectObjects(list, false)[0];
  const rec = hh ? HIT.find(h => h.m === hh.object) : null;
  if (rec !== HOV) { hiAx(HOV, false); HOV = rec; hiAx(HOV, true); S.dirty = 1; }
  if (S.tool === 'select') cv.style.cursor = rec ? 'pointer' : 'default';
}
function setGz(m) {
  hiAx(HOV, false); HOV = null;
  S.gz = m;
  GZ.move.visible = m === 'move'; GZ.rot.visible = m === 'rotate'; GZ.scl.visible = m === 'scale';
  $$('#gz [data-g]').forEach(b => b.classList.toggle('on', b.dataset.g === m));
  $('#gzHint').textContent = {move: 'اسحب السهم لتحريك الكائن على المحور', rotate: 'اسحب الحلقة لتدوير الكائن حول محورها', scale: 'اسحب المربع لتغيير الحجم'}[m];
  S.dirty = 1;
}
function ugizmo() {
  const o = OBJ.get(S.sel), g = $('#gz');
  if (!o || S.mode !== 'build') { gizmo.visible = false; g.hidden = true; return; }
  const cy = o.base ? o.pos[1] + o.scl[1] / 2 : o.pos[1];
  g.hidden = false; gizmo.visible = true; gizmo.position.set(o.pos[0], cy, o.pos[2]);
  const gzMul = (typeof MOB !== 'undefined' && MOB.on) ? .13 : .22;
  gizmo.scale.setScalar(cam.position.distanceTo(gizmo.position) * gzMul); gizmo.updateMatrixWorld(true);
  const v = new T.Vector3(o.pos[0], cy + Math.max(.6, o.scl[1] / 2) + .5, o.pos[2]).project(cam);
  if (v.z > 1) { g.hidden = true; return; }
  const W = vp.clientWidth, H = vp.clientHeight, hw = g.offsetWidth / 2;
  g.style.left = clamp((v.x * .5 + .5) * W, hw + 8, W - hw - 8) + 'px';
  g.style.top = clamp((-v.y * .5 + .5) * H, 60, H - 8) + 'px';
}
const RC = new T.Raycaster(), ndc = new T.Vector2();
function ray(e) { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); RC.setFromCamera(ndc, cam); return RC; }
function rayCenter() { ndc.set(0, 0); RC.setFromCamera(ndc, cam); return RC; }
function clickCenter() {
  const fake = {clientX: 0, clientY: 0};
  const rc = rayCenter(), r = rc.ray;
  if (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') {
    const info = phInfo(), h = castRay(r);
    if (!h) return tip('⚠ وجّه المركز على سطح (أرض أو كائن)');
    const sp = spotFor(info, h);
    if (!sp.ok) return tip('⚠ المكان مشغول — اختار مكان فاضي');
    const o = placeNow(info, sp.p); if (!o) return;
    sel(o.id); hier(); chg(); return;
  }
  const h = pickObj(rc);
  if (S.tool === 'delete') { if (h != null) delObj(h); return; }
  if (S.tool === 'boxdel') return;
  sel(h);
}
const AX = [new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1)];
function axT(r, p, a) { const w = new T.Vector3(r.origin.x - p[0], r.origin.y - p[1], r.origin.z - p[2]), b = r.direction.dot(a), d = r.direction.dot(w), e = a.dot(w), den = 1 - b * b; return den < 1e-4 ? 0 : (e - b * d) / den; }
let drag = null;
function startDrag(h, e) {
  const o = OBJ.get(S.sel);
  drag = {o, ax: h.ax, mode: h.mode, t0: axT(ray(e).ray, o.pos, AX[h.ax]), pos: [...o.pos], rot: [...o.rot], scl: [...o.scl], x0: e.clientX, y0: e.clientY};
}
function doDrag(e) {
  const {o, ax, mode, pos, rot, scl} = drag, sn = S.snap, q = (v, s) => s ? Math.round(v / s) * s : v;
  if (mode === 'rotate') { const dd = (e.clientX - drag.x0) - (e.clientY - drag.y0); o.rot[ax] = q(rot[ax] + dd * .6, sn ? 5 : 0); }
  else {
    const dt = axT(ray(e).ray, pos, AX[ax]) - drag.t0;
    if (mode === 'move') o.pos[ax] = q(pos[ax] + dt, sn);
    else o.scl[ax] = Math.max(.05, q(scl[ax] + dt, sn));
  }
  tf(o); refreshTf();
}

/* ---------- المعلم الأخضر للكائن المحدد ---------- */
function selHelper() {
  if (SELH) { scene.remove(SELH); SELH = null; }
  const m = S.sel != null && MESH.get(S.sel);
  if (m && S.mode === 'build') {
    SELH = new T.BoxHelper(m, 0x39ff7a); SELH.material.depthTest = false; SELH.renderOrder = 998;
    scene.add(SELH);
  }
  S.dirty = 1;
}

/* ---------- الاختيار ---------- */
const allMeshes = () => [...MESH.values()];
function pickObj(rc) {
  for (const x of rc.intersectObjects(allMeshes(), true)) { let m = x.object; while (m && m.userData.id == null) m = m.parent; if (m) return m.userData.id; }
  return null;
}
function sel(id) { S.sel = id; inspect(); hierMark(); selHelper(); }
function click(e) {
  const rc = ray(e), r = rc.ray;
  if (S.pick) {                         // وضع الكائن: اضغط أي كائن → يتحدد ويظهر إحداثياته
    const hid = pickObj(rc);
    if (hid != null) { sel(hid); if (!S.showCoord) toggleCoord(); } else tip('اضغط على كائن لعرض إحداثياته');
    return;
  }
  if (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') {
    const info = phInfo(), h = castRay(r);
    if (!h) return tip('⚠ اضغط على سطح (أرض أو كائن)');
    const sp = spotFor(info, h);
    if (!sp.ok) return tip('⚠ المكان مشغول — اختار مكان فاضي');
    const o = placeNow(info, sp.p); if (!o) return;
    sel(o.id); hier(); chg(); return;
  }
  const h = pickObj(rc);
  if (S.tool === 'delete') { if (h != null) delObj(h); return; }
  if (S.tool === 'boxdel') return;
  sel(h);
}

/* ---------- أفعال الكائن المختار ---------- */
function act(a) {
  const o = OBJ.get(S.sel); if (!o) return;
  if (a === 'dup') return dup();
  if (a === 'del') return delObj(o.id);
  const f = aabbOf(o);
  if (a === 'up') { o.pos[1] += S.snap || 1; tip('⬆ طلوع'); }
  else if (a === 'down') { o.pos[1] = supportY(f, f.y0 + E) + (o.pos[1] - f.y0); tip('⬇ نزول على أول سطح تحته'); }
  else if (a === 'fly') { o.pos[1] = supportY(f, f.y0 + E) + (o.pos[1] - f.y0) + 3; tip('✈ طيران: 3 وحدات فوق السطح'); }
  else if (a === 'vis') { o.hidden = !o.hidden; look(o); refreshPreview(o); tip(o.hidden ? 'مخفي: لن يظهر في الاختبار' : 'ظاهر في الاختبار'); inspect(); }
  if (a !== 'vis') tf(o);
  refreshTf(); updVis(); hier(); chg();
}
function updVis() {
  const o = OBJ.get(S.sel), b = $('#gVis'); if (!b) return;
  b.querySelector('.ico').innerHTML = ic(o && o.hidden ? 'eyeoff' : 'eye');
  $('#gVisT').textContent = o && o.hidden ? 'إظهار' : 'إخفاء';
}

/* ---------- وضع الطيران + الماوس ---------- */
function toggleFly() {
  S.fly = !S.fly; updModes();
  tip(S.fly ? 'وضع الطيران: WASD حركة · Space طلوع · Shift نزول · Ctrl إظهار/إلغاء الماوس' : 'وضع البناء العادي');
}
function toggleLock() {
  if (document.pointerLockElement === cv) document.exitPointerLock();
  else if (cv.requestPointerLock) cv.requestPointerLock();
}
document.addEventListener('pointerlockchange', () => { updModes(); });
function updModes() {
  $('#bFly').classList.toggle('on', S.fly);
  const locked = document.pointerLockElement === cv;
  $('#modeChip').textContent = (S.fly ? '🕊 طيران' : '🏗 بناء') + (locked ? ' · الماوس مخفي (Ctrl للإلغاء · Enter للتنفيذ على المركز)' : '');
  const ch = $('#crosshair'); if (ch) ch.hidden = !(locked && S.mode === 'build');
  S.dirty = 1;
}
function fly(dt) {
  const f = new T.Vector3().subVectors(OB.t, cam.position); f.y = 0;
  if (f.lengthSq() < 1e-6) f.set(0, 0, -1); f.normalize();
  const r = new T.Vector3().crossVectors(f, new T.Vector3(0, 1, 0)).normalize(), m = new T.Vector3();
  if (keyDown('KeyW') || keyDown('ArrowUp')) m.add(f); if (keyDown('KeyS') || keyDown('ArrowDown')) m.sub(f);
  if (keyDown('KeyD') || keyDown('ArrowRight')) m.add(r); if (keyDown('KeyA') || keyDown('ArrowLeft')) m.sub(r);
  if (keyDown('Space')) m.y += 1; if (keyDown('ShiftLeft') || keyDown('ShiftRight')) m.y -= 1;
  if (m.lengthSq() > 0) { m.normalize(); OB.t.addScaledVector(m, (K.ControlLeft || K.ControlRight ? 4 : 14) * dt); OB.t.y = Math.max(0, OB.t.y); camUpdate(); }
}
function pan(dx, dy) {
  const s = OB.dist * .0016, r = new T.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), u = new T.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  OB.t.addScaledVector(r, -dx * s).addScaledVector(u, dy * s); camUpdate();
}

/* ---------- إدخال البناء ---------- */
let mv = null, lx = 0, ly = 0;
function _vpLocal(e) {
  const r = vp.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
}
function _marqueeShow(box) {
  const el = document.getElementById('marqueeBox');
  if (!el || !box) { if (el) el.hidden = true; return; }
  const x = Math.min(box.x0, box.x1), y = Math.min(box.y0, box.y1);
  const w = Math.abs(box.x1 - box.x0), h = Math.abs(box.y1 - box.y0);
  el.hidden = false;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  el.style.width = w + 'px'; el.style.height = h + 'px';
}
function _marqueeDelete(box) {
  if (!box) return 0;
  const x0 = Math.min(box.x0, box.x1), x1 = Math.max(box.x0, box.x1);
  const y0 = Math.min(box.y0, box.y1), y1 = Math.max(box.y0, box.y1);
  if (x1 - x0 < 4 && y1 - y0 < 4) return 0;
  const W = vp.clientWidth, H = vp.clientHeight;
  const v = new T.Vector3();
  const ids = [];
  for (const o of S.objs) {
    if (o.type === 'respawn' || o.type === 'online_spawn') continue;
    const m = MESH.get(o.id); if (!m || o.hidden) continue;
    v.set(o.pos[0], o.pos[1] + (o.scl[1] || 1) * 0.5, o.pos[2]).project(cam);
    if (v.z > 1) continue;
    const sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H;
    if (sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1) ids.push(o.id);
  }
  for (const id of ids) delObj(id);
  return ids.length;
}
cv.addEventListener('pointerdown', e => {
  if (S.mode === 'play') {
    if (!MOB.on && !document.pointerLockElement && cv.requestPointerLock) cv.requestPointerLock();
    return;
  }
  cv.setPointerCapture(e.pointerId); lx = e.clientX; ly = e.clientY; mv = {b: e.button, moved: 0};
  if (e.button === 2) rmb = true;
  if (e.button === 0 && S.tool === 'boxdel') {
    const p = _vpLocal(e);
    S.boxdel = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    _marqueeShow(S.boxdel);
    mv.moved = 0;
    return;
  }
  if (e.button === 0 && S.sel != null && gizmo.visible) {
    const list = HIT.filter(h => h.mode === S.gz).map(h => h.m);
    const hh = ray(e).intersectObjects(list, false)[0];
    if (hh) { const rec = HIT.find(h => h.m === hh.object); if (rec) { startDrag(rec, e); mv.moved = 99; } }
  }
});
cv.addEventListener('pointermove', e => {
  if (S.mode === 'play' && RT) {
    if (document.pointerLockElement === cv || e.buttons & 1) { RT.yaw -= e.movementX * .0035; RT.pitch = clamp(RT.pitch + e.movementY * .0035, -.3, 1.3); }
    return;
  }
  if (document.pointerLockElement === cv) { lookAround(e.movementX, e.movementY); return; }
  if (mv && S.boxdel && mv.b === 0 && S.tool === 'boxdel') {
    const p = _vpLocal(e);
    S.boxdel.x1 = p.x; S.boxdel.y1 = p.y;
    _marqueeShow(S.boxdel);
    mv.moved += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
    lx = e.clientX; ly = e.clientY;
    return;
  }
  if (!mv) hoverGizmo(e);
  if (!mv && (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn')) { S.hr = ray(e).ray.clone(); S.dirty = 1; }
  if (!mv) return;
  const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; mv.moved += Math.abs(dx) + Math.abs(dy);
  if (drag) return doDrag(e);
  if (mv.b === 2) { if (e.shiftKey) pan(dx, dy); else { OB.yaw -= dx * .005; OB.pitch = clamp(OB.pitch + dy * .005, -1.5, 1.5); camUpdate(); } }
  else if (mv.b === 1) pan(dx, dy);
});
cv.addEventListener('pointerleave', () => { S.hr = null; });
cv.addEventListener('pointerup', e => {
  if (S.mode !== 'build' || !mv) return;
  const m = mv; mv = null; rmb = false;
  if (S.boxdel && S.tool === 'boxdel') {
    const n = _marqueeDelete(S.boxdel);
    S.boxdel = null; _marqueeShow(null);
    if (n > 0) { tip('🗑 اتحذف ' + n + ' كائن'); hier(); chg(); }
    else tip('مفيش كائنات جوه المستطيل');
    return;
  }
  if (drag) { drag = null; chg(); return; }
  // على الموبايل اللمسة القصيرة تتنفّذ من touchend عشان مفيش دبل-كليك
  if (m.b === 0 && m.moved < 5 && !(typeof MOB !== 'undefined' && MOB.on && e.pointerType === 'touch')) click(e);
});
cv.addEventListener('wheel', e => {
  e.preventDefault();
  if (S.mode === 'play' && RT) { RT.dist = clamp(RT.dist * (1 + Math.sign(e.deltaY) * .1), 2, 25); return; }
  OB.dist = clamp(OB.dist * (1 + Math.sign(e.deltaY) * .1), 1.5, 400); camUpdate();
}, {passive: false});
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mousedown', e => { if (e.button === 0) K.Mouse0 = 1; if (e.button === 2) K.Mouse2 = 1; });
addEventListener('mouseup', e => { if (e.button === 0) K.Mouse0 = 0; if (e.button === 2) K.Mouse2 = 0; });


let ctrlPend = false;
addEventListener('blur', () => { for (const k in K) K[k] = 0; });
addEventListener('keyup', e => {
  K[e.code] = 0;
  if (e.key === 'Control' && ctrlPend && S.mode === 'build') toggleLock();
  if (e.key === 'Control') ctrlPend = false;
});
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select')) return;
  K[e.code] = 1;
  if (e.key !== 'Control') ctrlPend = false;
  if (S.mode === 'play') {
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'KeyR') respawnP();
    if (e.code === 'KeyP') playStop();
    if (e.code === 'KeyB' && !e.repeat) {
      e.preventDefault();
      const m = onlinePlayMeta();
      if (m && (m.voice == null || m.voice)) VoiceChat.toggle();
    }
    return;
  }
  if (e.key === 'Control') { ctrlPend = true; return; }
  const c = e.ctrlKey || e.metaKey;
  const locked = document.pointerLockElement === cv;
  if (e.code === 'Space' && !c) e.preventDefault();
  if (locked && S.mode === 'build' && (e.code === 'Enter' || e.code === 'NumpadEnter')) { e.preventDefault(); clickCenter(); return; }
  if (e.code === 'Delete' || e.code === 'Backspace') { if (S.sel != null) delObj(S.sel); }
  else if (c && e.code === 'KeyD') { e.preventDefault(); dup(); }
  else if (c && e.code === 'KeyS') { e.preventDefault(); save(); tip('تم الحفظ ✔'); }
  else if (e.code === 'Escape') { if (document.pointerLockElement === cv) document.exitPointerLock(); setTool('select'); sel(null); }
  else if (e.code === 'KeyF') { const o = OBJ.get(S.sel); if (o) { OB.t.set(o.pos[0], o.pos[1] + o.scl[1] / 2, o.pos[2]); OB.dist = Math.max(...o.scl) * 3 + 5; camUpdate(); } }
  else if (e.code === 'KeyH') { if (S.sel != null) act('vis'); }
  else if (e.code === 'KeyN') setTool('place');
  else if (e.code === 'KeyV') toggleFly();
  else if (!rmb && !locked && e.code === 'Digit1') setGz('move');
  else if (!rmb && !locked && e.code === 'Digit2') setGz('rotate');
  else if (!rmb && !locked && e.code === 'Digit3') setGz('scale');
});

/* ---------- واجهة البناء ---------- */
function tip(t) {
  const s = (t == null) ? '' : String(t);
  if (s && s.indexOf('⚠') === -1 && s.indexOf('ERROR') === -1) { $('#tip').textContent = ''; return; }
  $('#tip').textContent = s;
  clearTimeout(tip.t);
  tip.t = setTimeout(() => { $('#tip').textContent = ''; }, 2200);
}
function setTool(t) {
  S.tool = t; $$('#tools [data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  $('#bRs').classList.toggle('on', t === 'respawn');
  updOnRsBtn();
  cv.style.cursor = t === 'select' ? 'default' : (t === 'boxdel' ? 'crosshair' : 'crosshair');
  if (t !== 'boxdel') { S.boxdel = null; _marqueeShow && _marqueeShow(null); }
  $('#tip').textContent = HINT[t] || ''; S.hr = null; ghKey = ''; cats(); sList();
}
function setSec(s) {
  S.section = s; $('#catP').hidden = s !== 'objects'; $('#progP').hidden = s !== 'prog'; $('#sobjP').hidden = s !== 'sobj';
  $$('#secs [data-sec]').forEach(b => b.classList.toggle('on', b.dataset.sec === s));
  $('#dockTitle').textContent = {objects: 'الكائنات', prog: 'قسم البرمجة', sobj: 'الكائنات البرمجية'}[s];
}
function cats() {
  const q = $('#q').value.trim(); let h = '';
  for (const [t, l] of CATS) {
    const it = l.filter(k => !q || DEF[k].n.includes(q)); if (!it.length) continue;
    h += `<h5>${t}</h5><div class="g">` + it.map(k => `<button data-it="${k}" class="${S.item === k && S.tool === 'place' ? 'on' : ''}"><span>${DEF[k].i}</span>${DEF[k].n}</button>`).join('') + '</div>';
  }
  $('#grid').innerHTML = h;
}
$('#grid').onclick = e => { const b = e.target.closest('[data-it]'); if (!b) return; S.item = b.dataset.it; setTool('place'); };
$('#q').oninput = cats;
$('#tools').onclick = e => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); };
$('#secs').onclick = e => { const b = e.target.closest('[data-sec]'); if (b) setSec(b.dataset.sec); };
$('#bFly').onclick = toggleFly;
$('#bPar').onclick = () => { document.body.classList.toggle('noside'); $('#bPar').classList.toggle('on', !document.body.classList.contains('noside')); setTimeout(resize, 30); };
$('#bRs').onclick = () => setTool(S.tool === 'respawn' ? 'select' : 'respawn');
$('#bOnRs').onclick = () => {
  if (S.tool === 'online_spawn') { setTool('select'); }
  else {
    if (countOnlineSpawns() >= 3) { tip('⚠ عندك بالفعل 3 نقاط أونلاين — احذف واحدة الأول'); return; }
    setTool('online_spawn'); tip('ضع نقطة بدء أونلاين (حد أقصى 3 لاعبين)');
  }
  updOnRsBtn();
};
$('#bSnap').onclick = () => { const L = [0, .25, .5, 1]; S.snap = L[(L.indexOf(S.snap) + 1) % 4]; $('#bSnap .snap-l').textContent = S.snap ? String(S.snap) : 'حر'; };

/* ---------- تحويل المشروع إلى لعبة + فتح اللعبة ---------- */
const HAWA_ASSET_NAMES = ['game.html', 'play-runtime.js', 'three.min.js', 'peerjs.min.js', 'jszip.min.js'];
const HAWA_ASSETS = {}; // name -> ArrayBuffer
async function preloadGameAssets() {
  let ok = 0;
  for (const f of HAWA_ASSET_NAMES) {
    if (HAWA_ASSETS[f]) { ok++; continue; }
    try {
      const r = await fetch(f);
      if (r.ok) { HAWA_ASSETS[f] = await r.arrayBuffer(); ok++; }
    } catch (e) { console.warn('preload fail', f, e); }
  }
  return ok;
}
setTimeout(() => { preloadGameAssets().catch(() => {}); }, 400);

function packGameData(name) {
  const objs = JSON.parse(JSON.stringify(S.objs));
  const scripts = JSON.parse(JSON.stringify(S.scripts));
  const sdefs = JSON.parse(JSON.stringify(S.sdefs));
  return {
    version: '2.3',
    engine: 'Hawa Engine',
    name: name || '',
    objs,
    scripts,
    sdefs,
    objectCodes: objs.filter(o => o.type === 'sobj').map(o => {
      const d = sdefs.find(x => x.id === o.def);
      return { id: o.id, name: o.name, defId: o.def, defName: d && d.name, code: d && d.code, params: o.p, scripts: o.scripts };
    }),
    globalScripts: scripts.map(s => ({ id: s.id, name: s.name, enabled: s.enabled, code: s.code })),
    programmedDefs: sdefs.map(d => ({ id: d.id, name: d.name, code: d.code })),
    onlineSpawns: objs.filter(o => o.type === 'online_spawn').map(o => ({
      slot: (o.p && o.p.slot) || 1, pos: o.pos, rot: o.rot, name: o.name, id: o.id
    })),
    offlineSpawns: objs.filter(o => o.type === 'respawn').map(o => ({
      pos: o.pos, rot: o.rot, name: o.name, id: o.id
    })),
    meta: {
      objectCount: objs.length,
      scriptCount: scripts.length,
      sdefCount: sdefs.length,
      onlineSlots: objs.filter(o => o.type === 'online_spawn').length,
      offlineSpawns: objs.filter(o => o.type === 'respawn').length
    },
    exportedAt: new Date().toISOString()
  };
}

async function getAssetBuf(name) {
  if (HAWA_ASSETS[name]) return HAWA_ASSETS[name];
  try {
    const r = await fetch(name);
    if (r.ok) {
      const buf = await r.arrayBuffer();
      HAWA_ASSETS[name] = buf;
      return buf;
    }
  } catch (e) {}
  return null;
}

async function convertToGame() {
  if (typeof JSZip === 'undefined') {
    tip('⚠ JSZip غير محمّل — حدّث الصفحة');
    return;
  }
  const nOn = countOnlineSpawns();
  if (nOn < 1) {
    if (!confirm('مفيش نقاط أونلاين. هيتصدر اللعبة للأوفلاين فقط. تكمل؟')) return;
  } else if (nOn < 3) {
    if (!confirm('عندك ' + nOn + ' نقطة أونلاين من 3. تكمل التحويل؟')) return;
  }
  const name = prompt('اسم اللعبة؟', 'لعبتي');
  if (!name || !name.trim()) return tip('تم الإلغاء');
  tip('⏳ جاري تجهيز اللعبة الكاملة...');

  const data = packGameData(name.trim());

  try {
    await preloadGameAssets();
    const zip = new JSZip();

    const jsonStr = JSON.stringify(data, null, 2);
    zip.file('game.json', jsonStr);
    zip.file('game-data.js', 'window.HAWA_EMBEDDED_GAME = ' + jsonStr + ';\n');

    const required = [
      ['three.min.js', 'three.min.js'],
      ['engine.js', 'engine.js'],
      ['style.css', 'style.css'],
      ['play.html', 'play.html'],
      ['index.html', 'play.html'],
      ['game.html', 'game.html'],
      ['peerjs.min.js', 'peerjs.min.js'],
      ['jszip.min.js', 'jszip.min.js'],
      ['play-runtime.js', 'play-runtime.js']
    ];
    const included = ['game.json', 'game-data.js'];
    const missing = [];
    for (const [zipName, srcName] of required) {
      const buf = await getAssetBuf(srcName);
      if (buf) {
        zip.file(zipName, buf);
        if (!included.includes(zipName)) included.push(zipName);
      } else if (!missing.includes(srcName)) {
        missing.push(srcName);
      }
    }

    zip.file('README.txt',
      'Hawa Game: ' + data.name + '\n' +
      '========================\n' +
      'شغّل index.html أو game.html في Chrome/Edge.\n' +
      'أو ارفع الملف من «فتح اللعبة» في المحرك.\n\n' +
      'المحتويات:\n' + included.map(x => ' - ' + x).join('\n') + '\n\n' +
      'كائنات: ' + data.meta.objectCount + '\n' +
      'سكربتات: ' + data.meta.scriptCount + '\n' +
      'كائنات برمجية: ' + data.meta.sdefCount + '\n' +
      'نقاط أونلاين: ' + data.meta.onlineSlots + '\n' +
      'نقاط أوفلاين: ' + data.meta.offlineSpawns + '\n' +
      'تاريخ التصدير: ' + data.exportedAt + '\n'
    );

    if (missing.length) {
      console.warn('ملفات ناقصة في الـ ZIP:', missing);
      if (!confirm('بعض ملفات التشغيل مش اتلقطت (' + missing.join(', ') + ').\nهيتصدر الـ ZIP برضو. تكمل؟\n\nنصيحة: افتح المحرك عن طريق سيرفر محلي (مش file://) عشان كل الملفات تتحط.')) {
        tip('تم الإلغاء');
        return;
      }
    }

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (data.name.replace(/[^\w\u0600-\u06FF\-]+/g, '_') || 'hawa-game') + '.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);

    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    tip('✔ لعبة كاملة: «' + data.name + '» · ' + sizeMB + ' MB · ' + included.length + ' ملف · ' + data.meta.objectCount + ' كائن');
  } catch (e) {
    console.error(e);
    tip('⚠ فشل التصدير: ' + (e.message || e));
    alert('فشل تحويل اللعبة:\n' + (e.message || e));
  }
}
$('#bConvert').onclick = convertToGame;
$('#bOpenGame').onclick = () => { window.open('game.html', '_blank'); };
S.showCoord = false; S.pick = false;
S.boxdel = null; // {x0,y0,x1,y1} أثناء سحب الحذف المحيطي
function ensureCoordUI() {
  const cp = document.getElementById('coordPanel');
  if (cp && !document.getElementById('cr')) cp.insertAdjacentHTML('beforeend', '<div class="cp-row"><b>R</b><span id="cr">—</span></div><div class="cp-row"><b>S</b><span id="cs">—</span></div>');
  for (const id of ['bPick', 'bCoordAlways']) {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  }
}
function syncCoordRailBtn() {
  const b = document.getElementById('bCoordRail');
  if (b) b.classList.toggle('on', !!(S.showCoord || S.pick));
}
function togglePick() {
  S.pick = !S.pick;
  if (S.pick && !S.showCoord) {
    S.showCoord = true;
    const panel = $('#coordPanel'); if (panel) panel.hidden = false;
  }
  syncCoordRailBtn();
  tip(S.pick ? '🎯 وضع الكائن مفعّل — اضغط أي كائن لعرض إحداثياته' : 'وضع الكائن مُغلق');
  S.dirty = 1;
}
function toggleCoord() {
  S.showCoord = !S.showCoord;
  S.pick = S.showCoord;
  const panel = $('#coordPanel'); if (panel) panel.hidden = !S.showCoord;
  syncCoordRailBtn();
  tip(S.showCoord ? '📍 الإحداثيات + وضع الكائن مفعّلان — اضغط أي كائن' : 'الإحداثيات مُغلقة');
  S.dirty = 1;
}
const _bCoordRail = $('#bCoordRail'); if (_bCoordRail) _bCoordRail.onclick = () => toggleCoord();
$('#gz').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.g) setGz(b.dataset.g);
  else if (b.dataset.a) act(b.dataset.a);
  else if (b.id === 'gDup') dup();
  else if (b.id === 'gDel' && S.sel != null) delObj(S.sel);
};
function updCoord() {
  if (!S.showCoord) return;
  if (S.mode === 'play' && RT) {
    $('#cx').textContent = RT.p.x.toFixed(3); $('#cy').textContent = RT.p.y.toFixed(3); $('#cz').textContent = RT.p.z.toFixed(3);
    $('#cName').textContent = 'اللاعب · وضع الاختبار'; return;
  }
  const o = OBJ.get(S.sel);
  if (o) {
    $('#cx').textContent = (+o.pos[0]).toFixed(3);
    $('#cy').textContent = (+o.pos[1]).toFixed(3);
    $('#cz').textContent = (+o.pos[2]).toFixed(3);
    $('#cName').textContent = o.name + ' · id=' + o.id;
    const f2 = a => a.map(n => (+n).toFixed(2)).join(', ');
    const cr = $('#cr'), cs = $('#cs'); if (cr) cr.textContent = '[' + f2(o.rot) + ']'; if (cs) cs.textContent = '[' + f2(o.scl) + ']';
  } else {
    $('#cx').textContent = OB.t.x.toFixed(3);
    $('#cy').textContent = OB.t.y.toFixed(3);
    $('#cz').textContent = OB.t.z.toFixed(3);
    $('#cName').textContent = 'هدف الكاميرا';
  }
}

/* ---------- المشهد + الخصائص ---------- */
function hier() {
  refNames = null;
  const q = $('#hq').value.trim(), L = [];
  for (const o of S.objs) { if (q && !o.name.includes(q)) continue; L.push(o); if (L.length >= 300) break; }
  $('#hier').innerHTML = L.map(o => `<div data-id="${o.id}" class="${o.id === S.sel ? 'on' : ''}${o.hidden ? ' dim' : ''}">${DEF[o.type].i} ${esc(o.name)}${isProg(o) ? ' <span class="pbadge">⚙ مبرمج</span>' : ''}${o.hidden ? ' <span class="mut">· مخفي</span>' : ''}</div>`).join('')
    || '<div class="mut">المشهد فاضي</div>';
  $('#objCount').textContent = S.objs.length + ' كائن';
}
function hierMark() { $$('#hier [data-id]').forEach(d => d.classList.toggle('on', +d.dataset.id === S.sel)); }
$('#hier').onclick = e => { const d = e.target.closest('[data-id]'); if (d) sel(+d.dataset.id); };
$('#hq').oninput = hier;
function paramRow(o, k, label, e) {
  const v = o.p[k], t = e && e.type;
  let inp;
  if (t === 'boolean' || typeof v === 'boolean') inp = `<input type="checkbox" data-p="${k}" ${v ? 'checked' : ''}>`;
  else if (t === 'color' || /^#[0-9a-f]{6}$/i.test(v)) inp = `<input type="color" data-p="${k}" value="${/^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'}" style="flex:1">`;
  else if (t === 'text' || typeof v === 'string') inp = `<input type="text" data-p="${k}" value="${esc(v ?? '')}" style="flex:1">`;
  else inp = `<input type="number" data-p="${k}" value="${v}" step="${(e && e.step) || .5}"${e && e.min != null ? ` min="${e.min}"` : ''}${e && e.max != null ? ` max="${e.max}"` : ''} style="flex:1">`;
  return `<div class="r"><b class="pl">${esc(label || PL[k] || k)}</b>${inp}</div>`;
}
/* ---------- الكائنات المبرمجة: علامة حمرا + زر "عرض الملفات المتأثرة" ---------- */
const PM = new Map();      // id -> {h: BoxHelper أحمر, sp: لافتة "مبرمج"}
let refNames = null, mkc = 0, pmTex = null;
function globalRefs() {    // ملفات البرمجة العامة المفعّلة اللي بتذكر اسم الكائن
  if (refNames) return refNames;
  refNames = new Map();
  for (const sc of S.scripts) if (sc.enabled) for (const o of S.objs) if (o.name && o.name.length > 1 && sc.code.includes(o.name)) { if (!refNames.has(o.id)) refNames.set(o.id, []); refNames.get(o.id).push(sc); }
  return refNames;
}
function affFiles(o) {
  const L = [];
  if (o.type === 'sobj') { const d = defOf(o.def); if (d) L.push({k: 'sobj', id: d.id, name: d.name, role: 'كود الكائن (بيتحكم فيه بالكامل)'}); }
  for (const id of o.scripts) { const sc = S.scripts.find(x => x.id === id); if (sc) L.push({k: 'script', id: sc.id, name: sc.name, on: sc.enabled, role: 'سكربت مربوط بالكائن'}); }
  const g = globalRefs().get(o.id); if (g) for (const sc of g) if (!o.scripts.includes(sc.id)) L.push({k: 'script', id: sc.id, name: sc.name, on: true, role: 'ملف عام مفعّل بيذكر اسم الكائن'});
  return L;
}
const isProg = o => o.type === 'sobj' || o.scripts.length > 0 || globalRefs().has(o.id);
function pmLabel() {
  if (pmTex) return pmTex;
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#e11d2e'; g.beginPath(); g.roundRect(4, 6, 248, 52, 14); g.fill();
  g.strokeStyle = '#ffd0d0'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚙ مبرمج', 128, 34);
  return pmTex = new T.CanvasTexture(c);
}
function syncMarks() {
  for (const e of PM.values()) { scene.remove(e.h); scene.remove(e.sp); try { e.h.geometry.dispose(); } catch (_) {} }
  PM.clear();
}
const _pb = new T.Box3();
function markUpd() {
}
function inspect() {
  const o = OBJ.get(S.sel), el = $('#ins');
  if (o && o.type === 'sobj') { const d = defOf(o.def); if (d && !isBig(d.code)) { const df = parseParams(d.code); for (const k in df) if (!(k in o.p)) o.p[k] = df[k]; } }
  if (!o) { el.innerHTML = '<div class="empty"><span>🎯</span><p>لم يتم تحديد كائن</p><small>اختر كائناً من المشهد أو من الشاشة</small></div>'; updVis(); return; }
  const big = o.type === 'sobj' && !!defOf(o.def) && isBig(defOf(o.def).code);
  const v3 = (k, l, st) => `<div class="r"><b>${l}</b>` + [0, 1, 2].map(i => `<label>${'XYZ'[i]}<input type="number" step="${st}" data-k="${k}" data-i="${i}" value="${+o[k][i].toFixed(3)}"></label>`).join('') + '</div>';
  let h = `<div class="ih"><span>${DEF[o.type].i}</span><input data-k="name" value="${esc(o.name)}"></div>`;
  if (isProg(o)) {
    const af = affFiles(o), op = S.ffOpen === o.id;
    h += `<div class="prog-b"><span>⚙ كائن مبرمج</span><button data-ff="1">${op ? 'إخفاء' : 'عرض'} الملفات المتأثرة (${af.length})</button></div>`;
    if (op) h += '<div class="ff-list">' + (af.map(f => `<div class="ff" data-fk="${f.k}" data-fid="${f.id}" title="اضغط لفتح الملف"><span>${f.k === 'sobj' ? '🎮' : f.on === false ? '🔴' : '🟢'} ${esc(f.name)}</span><em>${f.role}</em></div>`).join('') || '<p class="mut small">مفيش ملفات مرتبطة</p>') + '</div>';
  }
  h += `<div class="cp"><h4>Transform</h4>${v3('pos', 'الموضع', .1)}${v3('rot', 'الدوران', 5)}${big ? '' : v3('scl', 'الحجم', .1)}${big ? '<p class="mut small">كائن برمجي: الجذر على الأرض، الحجم للمعاينة فقط.</p>' : ''}</div>`;
  h += `<div class="cp"><h4>Renderer</h4><div class="r"><b>اللون</b><input type="color" data-k="color" value="${o.color}"></div></div>`;
  h += `<div class="cp"><h4>الحالة</h4>`
    + (DEF[o.type].solid || o.type === 'sobj' ? `<label class="r"><input type="checkbox" data-k="solid" ${o.solid ? 'checked' : ''}> صلب (يُلمس ويُقف عليه ويعترض الوضع)</label>` : '')
    + `<label class="r"><input type="checkbox" data-k="hidden" ${o.hidden ? 'checked' : ''}> مخفي (لا يظهر في الاختبار)</label></div>`;
  if (big) {
    const sch = schemaOf(defOf(o.def).code);
    h += `<div class="cp"><h4>${esc(o.name)} · البارامترات</h4>` + (sch.length ? sch.map(e => paramRow(o, e.key, e.label, e)).join('') : '<p class="mut small">مفيش defineParams</p>') + '</div>';
  } else {
    const pk = Object.keys(o.p);
    if (pk.length) h += `<div class="cp"><h4>${esc(o.type === 'sobj' ? o.name : DEF[o.type].n)} · البارامترات</h4>` + pk.map(k => paramRow(o, k, PL[k], null)).join('') + '</div>';
  }
  if (o.type !== 'respawn' && o.type !== 'light') {
    const sc = o.scripts.map(id => { const s = S.scripts.find(x => x.id === id); return s ? `<div class="sr"><span>${s.enabled ? '🟢' : '🔴'} ${esc(s.name)}</span><button data-rm="${id}">✕</button></div>` : ''; }).join('');
    const op = S.scripts.filter(s => !o.scripts.includes(s.id)).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    h += `<div class="cp"><h4>السكربتات المرتبطة</h4>${sc}<select id="addsc" style="width:100%"><option value="">＋ ربط سكربت...</option>${op}</select></div>`;
  }
  h += `<div class="acts"><button data-a="up">${ic('up')}<i>طلوع</i></button><button data-a="down">${ic('down')}<i>نزول</i></button><button data-a="fly">${ic('fly')}<i>طيران</i></button>`
    + `<button data-a="vis">${ic(o.hidden ? 'eyeoff' : 'eye')}<i>${o.hidden ? 'إظهار' : 'إخفاء'}</i></button><button data-a="dup">${ic('copy')}<i>نسخ</i></button><button data-a="del" class="red">${ic('trash')}<i>حذف</i></button></div>`;
  el.innerHTML = h; updVis();
}
function refreshTf() {
  const o = OBJ.get(S.sel); if (!o) return;
  for (const k of ['pos', 'rot', 'scl']) for (let i = 0; i < 3; i++) { const e = $(`#ins [data-k="${k}"][data-i="${i}"]`); if (e && document.activeElement !== e) e.value = +o[k][i].toFixed(3); }
}
$('#ins').addEventListener('input', e => {
  const t = e.target, o = OBJ.get(S.sel); if (!o) return;
  const k = t.dataset.k, p = t.dataset.p;
  if (p) { const pv = o.p[p]; o.p[p] = typeof pv === 'boolean' ? t.checked : typeof pv === 'string' ? t.value : +t.value; if (o.type === 'light') { const l = MESH.get(o.id).children[0]; l.intensity = o.p.intensity; l.distance = o.p.range; } if (o.type === 'sobj') { clearTimeout(prevT); prevT = setTimeout(() => refreshPreview(o), 350); } }
  else if (k === 'pos' || k === 'rot' || k === 'scl') { const v = parseFloat(t.value); if (!isNaN(v)) { o[k][+t.dataset.i] = v; tf(o); selHelper(); } }
  else if (k === 'color') { o.color = t.value; recolor(o); }
  else if (k === 'solid') o.solid = t.checked;
  else if (k === 'name') { o.name = t.value; hier(); }
  chg();
});
$('#ins').addEventListener('change', e => {
  const o = OBJ.get(S.sel); if (!o) return;
  if (e.target.dataset.k === 'hidden') { o.hidden = e.target.checked; look(o); refreshPreview(o); hier(); updVis(); selHelper(); chg(); }
  if (e.target.id === 'addsc' && e.target.value) { o.scripts.push(+e.target.value); inspect(); chg(); }
});
$('#ins').addEventListener('click', e => {
  const ff = e.target.closest('.ff'); if (ff) { openEd(+ff.dataset.fid, ff.dataset.fk === 'sobj' ? 'sobj' : 'script'); return; }
  const o = OBJ.get(S.sel), b = e.target.closest('button'); if (!o || !b) return;
  if (b.dataset.ff) { S.ffOpen = S.ffOpen === o.id ? null : o.id; inspect(); return; }
  if (b.dataset.rm) { o.scripts = o.scripts.filter(i => i !== +b.dataset.rm); inspect(); chg(); }
  else if (b.dataset.a) act(b.dataset.a);
});

/* ---------- قسم البرمجة: تفعيل / إلغاء تفعيل ---------- */
function fitNameStyle(name) {
  const n = String(name || '').length;
  const fs = n <= 8 ? 12.5 : n <= 12 ? 11.5 : n <= 18 ? 10.5 : n <= 26 ? 9.5 : 9;
  return `font-size:${fs}px`;
}
function pList() {
  const on = S.scripts.filter(s => s.enabled).length;
  $('#pCount').textContent = `${on} / ${S.scripts.length} مفعّل`;
  $('#pList').innerHTML = S.scripts.map(s => {
    const n = S.objs.filter(o => o.scripts.includes(s.id)).length;
    const nm = s.name || '';
    return `<div class="pcard ${s.enabled ? 'is-on' : 'is-off'}" data-s="${s.id}">
      <div class="pc-top"><span class="dot"></span><span class="pc-ico">📜</span></div>
      <div class="pc-name" style="${fitNameStyle(nm)}" title="${esc(nm)}">${esc(nm)}</div>
      <div class="pc-meta"><em>${s.enabled ? 'مفعّل' : 'متوقف'}</em>${n ? `<em> · ${n}</em>` : ''}</div>
      <div class="pc-btns">
        <button data-tg="${s.id}" class="${s.enabled ? 'bad' : 'ok'}" title="${s.enabled ? 'إلغاء التفعيل' : 'تفعيل'}">${s.enabled ? 'إيقاف' : 'تفعيل'}</button>
        <button data-ed="${s.id}" title="تعديل">${ic('pen')}</button>
        <button data-dl="${s.id}" class="red" title="حذف">${ic('trash')}</button>
      </div></div>`;
  }).join('') || '<p class="mut small" style="grid-column:1/-1">مفيش ملفات برمجة. اضغط ＋ ملف أو ⬆ رفع.</p>';
}
$('#pList').onclick = e => {
  const t = e.target.closest('button');
  if (t) {
    const id = +(t.dataset.tg || t.dataset.ed || t.dataset.dl);
    const s = S.scripts.find(x => +x.id === id);
    if (!s) return;
    if (t.dataset.tg != null) {
      s.enabled = !s.enabled;
      tip(s.enabled ? '✔ ' + s.name + ' مفعّل — هيشتغل في الاختبار' : '⛔ ' + s.name + ' اتلغى تفعيله');
      pList(); chg();
    } else if (t.dataset.ed != null) {
      openEd(id, 'script');
    } else if (t.dataset.dl != null) {
      if (!confirm('حذف الملف؟')) return;
      S.scripts = S.scripts.filter(x => +x.id !== id);
      S.objs.forEach(o => { o.scripts = (o.scripts || []).filter(i => +i !== id); });
      pList(); inspect(); chg();
    }
    return;
  }
  const c = e.target.closest('[data-s]');
  if (c) openEd(+c.dataset.s, 'script');
};
const _pNew = $('#pNew'), _pUp = $('#pUp');
if (_pNew) _pNew.onclick = () => {
  const s = {id: S.sid++, name: 'script_' + S.sid + '.js', code: TPL, enabled: true};
  S.scripts.push(s); pList(); openEd(s.id, 'script'); chg();
};
if (_pUp) _pUp.onclick = () => { const fl = $('#fl'); if (fl) { fl.dataset.m = 'js'; fl.click(); } };
const edL = () => (edK === 'sobj' ? S.sdefs : S.scripts);
function showEd(on) {
  const el = $('#ed');
  if (!el) return;
  if (on) {
    el.hidden = false;
    el.style.display = 'flex';
    el.setAttribute('aria-hidden', 'false');
  } else {
    el.hidden = true;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    edI = null;
  }
}
function openEd(id, k) {
  edK = (k === 'sobj') ? 'sobj' : 'script';
  const nid = +id;
  const s = edL().find(x => +x.id === nid);
  if (!s) { tip('⚠ الملف غير موجود'); return; }
  edI = +s.id;
  const nameEl = $('#edName'), ta = $('#edT'), kind = $('#edKind');
  if (nameEl) nameEl.value = s.name || '';
  if (ta) ta.value = s.code || '';
  if (kind) kind.textContent = edK === 'sobj' ? 'كائن برمجي' : 'ملف برمجة';
  showEd(true);
  try { const sm = document.getElementById('edSaveMsg'); if (sm) { sm.className = ''; sm.textContent = ''; } } catch (e) {}
  try { if (ta) ta.focus(); } catch (e) {}
}
function saveEd() {
  const flash = (msg, isErr) => {
    try {
      const el = document.getElementById('edSaveMsg');
      if (el) {
        el.textContent = msg;
        el.className = isErr ? 'err show' : 'show';
        clearTimeout(flash._t);
        flash._t = setTimeout(() => { el.className = ''; el.textContent = ''; }, 2500);
      }
    } catch (_) {}
    try { tip(msg); } catch (_) {}
    console.log('[hawa-save]', msg);
  };
  try {
    if (edI == null && edI !== 0) {
      flash('⚠ مفيش ملف مفتوح للحفظ', true);
      return false;
    }
    const list = edL();
    const s = list.find(x => +x.id === +edI);
    if (!s) {
      flash('⚠ الملف غير موجود — أعد فتحه (id=' + edI + ')', true);
      return false;
    }
    const nameEl = document.getElementById('edName');
    const ta = document.getElementById('edT');
    const newName = (nameEl && String(nameEl.value || '').trim()) || s.name || 'untitled';
    const newCode = ta ? String(ta.value || '') : (s.code || '');
    s.name = newName;
    s.code = newCode;
    if (edK === 'sobj') {
      for (const o of S.objs) {
        if (o.type === 'sobj' && +o.def === +s.id) {
          const d = defOf(o.def);
          if (d && isBig(d.code)) o.base = true;
          try { fillDefaults(o); } catch (_) {}
        }
      }
      try { refreshPreviewsOf(s.id); } catch (e) { console.warn(e); }
    }
    try { pList(); } catch (e) { console.warn(e); }
    try { sList(); } catch (e) { console.warn(e); }
    try { inspect(); } catch (e) { console.warn(e); }
    try { chg(); } catch (e) { console.warn(e); }
    try { save(); } catch (e) { console.warn(e); }
    if (nameEl) nameEl.value = s.name;
    flash('✔ تم الحفظ: ' + s.name + '  (' + newCode.length + ' حرف)');
    try {
      const btn = document.getElementById('edS');
      if (btn) {
        const prev = btn.style.background;
        btn.style.background = 'linear-gradient(180deg,#166534,#14532d)';
        btn.style.borderColor = '#34d399';
        setTimeout(() => { btn.style.background = prev; btn.style.borderColor = ''; }, 700);
      }
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('saveEd failed', err);
    flash('خطأ في الحفظ: ' + (err && err.message || err), true);
    return false;
  }
}
function closeEd() { showEd(false); }
function deleteEd() {
  if (edI == null) return;
  if (!confirm('حذف الملف؟')) return;
  const id = +edI;
  if (edK === 'sobj') {
    try { invalidateGhostCache(id); } catch (e) {}
    S.sdefs = S.sdefs.filter(x => +x.id !== id);
    S.objs.filter(o => +o.def === id).forEach(o => delObj(o.id));
    try { if (GH) GH.userData.contentKey = ''; } catch (e) {}
  } else {
    S.scripts = S.scripts.filter(x => +x.id !== id);
    S.objs.forEach(o => { o.scripts = (o.scripts || []).filter(i => +i !== id); });
  }
  showEd(false);
  try { pList(); sList(); inspect(); } catch (e) {}
  chg();
  tip('تم حذف الملف');
}
window.__hawaSaveEd = function () { try { return saveEd(); } catch (e) { console.error(e); alert('خطأ في الحفظ: ' + (e && e.message || e)); return false; } };
window.__hawaCloseEd = function () { try { closeEd(); } catch (e) { console.error(e); } };
window.__hawaDelEd = function () { try { deleteEd(); } catch (e) { console.error(e); alert('خطأ في الحذف: ' + (e && e.message || e)); } };
(function bindEd() {
  const s = $('#edS'), x = $('#edX'), d = $('#edD'), t = $('#edT'), ed = $('#ed');
  const bindClick = (el, fn) => {
    if (!el) return;
    el.onclick = e => { e.preventDefault(); e.stopPropagation(); fn(); };
    el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fn(); }, true);
  };
  bindClick(s, () => window.__hawaSaveEd());
  bindClick(x, () => window.__hawaCloseEd());
  bindClick(d, () => window.__hawaDelEd());
  if (ed) {
    ed.addEventListener('click', e => {
      const btn = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!btn || !ed.contains(btn)) return;
      if (btn.id === 'edS' || btn.closest('#edS')) { e.preventDefault(); e.stopPropagation(); window.__hawaSaveEd(); }
      else if (btn.id === 'edD' || btn.closest('#edD')) { e.preventDefault(); e.stopPropagation(); window.__hawaDelEd(); }
      else if (btn.id === 'edX' || btn.closest('#edX')) { e.preventDefault(); e.stopPropagation(); window.__hawaCloseEd(); }
    }, true);
    ed.addEventListener('mousedown', e => { if (e.target === ed) window.__hawaCloseEd(); });
  }
  if (t) t.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const a = t.selectionStart;
      t.setRangeText('  ', a, t.selectionEnd, 'end');
    }
    if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyS' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      window.__hawaSaveEd();
    }
    if (e.key === 'Escape') { e.preventDefault(); window.__hawaCloseEd(); }
  });
})();
addEventListener('keydown', e => {
  const ed = $('#ed');
  if (!ed || ed.hidden || ed.style.display === 'none') return;
  if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyS' || e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    e.stopPropagation();
    saveEd();
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    closeEd();
  }
}, true);


/* ---------- قسم الكائنات البرمجية ---------- */
function sList() {
  $('#sCount').textContent = S.sdefs.length + ' ملف';
  $('#sList').innerHTML = S.sdefs.map(d => {
    const big = isBig(d.code), cnt = S.objs.filter(o => o.def === d.id).length;
    const armed = S.item === 's:' + d.id && S.tool === 'place';
    const nm = d.name || '';
    return `<div class="pcard ${armed ? 'is-on' : ''}" data-d="${d.id}">
      <div class="pc-top"><span class="pc-ico">🎮</span>${big ? '<span class="tag">كبير</span>' : ''}</div>
      <div class="pc-name" style="${fitNameStyle(nm)}" title="${esc(nm)}">${esc(nm)}</div>
      <div class="pc-meta"><em>${cnt ? cnt + ' في المشهد' : 'غير موضوع'}</em></div>
      <div class="pc-btns">
        <button data-pl="${d.id}" class="${armed ? 'on' : 'ok'}" title="${armed ? 'جاهز للوضع' : 'وضع'}">${ic('plus')}</button>
        <button data-ed="${d.id}" data-k="sobj" title="تعديل">${ic('pen')}</button>
        <button data-dd="${d.id}" class="red" title="حذف">${ic('trash')}</button>
      </div></div>`;
  }).join('') || '<p class="mut small" style="grid-column:1/-1">مفيش كائنات برمجية. اضغط ＋ كائن أو ⬆ رفع.</p>';
}
$('#sList').onclick = e => {
  const t = e.target.closest('button');
  if (!t) {
    const c = e.target.closest('[data-d]');
    if (c) openEd(+c.dataset.d, 'sobj');
    return;
  }
  if (t.dataset.pl != null) {
    S.item = 's:' + t.dataset.pl;
    setTool('place');
    sList();
    return;
  }
  if (t.dataset.ed != null) {
    openEd(+t.dataset.ed, 'sobj');
    return;
  }
  if (t.dataset.dd != null) {
    const id = +t.dataset.dd;
    if (!confirm('حذف الكائن البرمجي وكل نسخه في المشهد؟')) return;
    try { invalidateGhostCache(id); } catch (e) {}
    S.sdefs = S.sdefs.filter(x => +x.id !== id);
    S.objs.filter(o => +o.def === id).forEach(o => delObj(o.id));
    try { if (GH) GH.userData.contentKey = ''; } catch (e) {}
    sList(); chg();
  }
};
const _sNew = $('#sNew'), _sUp = $('#sUp');
if (_sNew) _sNew.onclick = () => {
  const d = {id: S.did++, name: 'كائن_' + S.did, code: STPL};
  S.sdefs.push(d); sList(); openEd(d.id, 'sobj'); chg();
};
if (_sUp) _sUp.onclick = () => { const fl = $('#fl'); if (fl) { fl.dataset.m = 'sobj'; fl.click(); } };

/* ---------- حفظ / تحميل / تلقائي ---------- */
function save() { try { localStorage.setItem('hawa2', JSON.stringify({objs: S.objs, scripts: S.scripts, sdefs: S.sdefs, nid: S.nid, sid: S.sid, did: S.did})); } catch (e) {} }
let svT; let rfT; function chg() { clearTimeout(rfT); rfT = setTimeout(() => { refNames = null; }, 500); S.dirty = 1; clearTimeout(svT); svT = setTimeout(save, 400); refreshLive(); }
function ensureLive() {
  for (const [pid, id] of [['progP', 'pLive'], ['sobjP', 'sLive']]) {
    const root = document.getElementById(pid);
    if (root && !document.getElementById(id)) {
      const d = document.createElement('div'); d.id = id;
      d.style.cssText = 'font:600 11px/1.5 Consolas,monospace;direction:ltr;text-align:left;padding:5px 8px;margin:6px 0;border-radius:8px;background:rgba(56,217,245,.08);border:1px solid rgba(56,217,245,.25);color:#7dd3fc';
      const row = root.querySelector('.row'); if (row) row.after(d);
    }
  }
}
let liveT;
function refreshLive() {
  clearTimeout(liveT);
  liveT = setTimeout(() => {
    ensureLive();
    const info = `● تلقائي · ${new Date().toLocaleTimeString('ar-EG')} · ${S.objs.length} كائن · ${S.scripts.filter(x => x.enabled).length}/${S.scripts.length} ملف مفعّل · ${S.sdefs.length} كائن برمجي`;
    for (const id of ['pLive', 'sLive']) { const el = document.getElementById(id); if (el) el.textContent = info; }
  }, 250);
}
function norm(o) {
  if (!o || !DEF[o.type]) return null;
  const d = DEF[o.type], v3 = (a, f) => Array.isArray(a) && a.length === 3 ? a.map(Number) : [...f];
  const sd = o.type === 'sobj' ? defOf(o.def) : null, big = !!sd && isBig(sd.code);
  return {id: S.nid++, def: o.def, name: o.name || d.n, type: o.type, pos: v3(o.pos, [0, 0, 0]), rot: v3(o.rot, [0, 0, 0]), scl: v3(o.scl, d.s),
    color: /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : d.c, solid: o.solid != null ? !!o.solid : !!d.solid, hidden: !!o.hidden,
    base: !!o.base || big, scripts: Array.isArray(o.scripts) ? o.scripts : [], p: {...(d.p || {}), ...(o.p || {})}};
}
function loadData(d, append) {
  if (S.mode === 'play') playStop();
  if (Array.isArray(d)) { d = {objs: d}; append = true; }
  if (!append) {
    clearAll(); S.nid = 1;
    S.scripts = (d.scripts || []).map(s => ({id: +s.id, name: s.name, code: s.code, enabled: s.enabled != null ? !!s.enabled : !!s.global}));
    S.sid = Math.max(1, ...S.scripts.map(s => s.id + 1));
    S.sdefs = (d.sdefs || []).map(x => ({id: +x.id, name: x.name, code: x.code}));
    S.did = Math.max(1, ...S.sdefs.map(x => x.id + 1));
  }
  for (const r of d.objs || []) { const o = norm(r); if (o) { o.scripts = (r.scripts || []).filter(i => S.scripts.some(s => s.id === i)); o.def = r.def; reg(o); } }
  hier(); pList(); sList(); inspect(); chg();
}
const _bSave = $('#bSave'); if (_bSave) _bSave.onclick = () => { dl('hawa-project.json', JSON.stringify({objs: S.objs, scripts: S.scripts, sdefs: S.sdefs}, null, 1), 'application/json'); tip('تم تنزيل المشروع ✔'); };
const _bLoad = $('#bLoad'); if (_bLoad) _bLoad.onclick = () => { const fl = $('#fl'); if (fl) { fl.dataset.m = 'json'; fl.click(); } };
$('#fl').onchange = async e => {
  const m = e.target.dataset.m;
  for (const f of e.target.files) {
    const t = await f.text();
    if (m === 'js') { S.scripts.push({id: S.sid++, name: f.name, code: t, enabled: true}); pList(); }
    else if (m === 'sobj') { const d = {id: S.did++, name: f.name.replace(/\.[^.]+$/, ''), code: t}; S.sdefs.push(d); sList(); }
    else try { loadData(JSON.parse(t)); } catch (x) { alert('ملف غير صالح'); }
  }
  e.target.value = ''; chg();
};
function dl(n, t, m) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], {type: (m || 'text/plain') + ';charset=utf-8'})); a.download = n; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }

/* ---------- واجهة لمس للسكربتات (موبايل / مركبات) ---------- */
const TouchUI = {
  root: null,
  down: Object.create(null),
  pressed: Object.create(null),
  _btns: Object.create(null),
  ensure() {
    if (this.root) return this.root;
    let el = document.getElementById('hawaTouchUI');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hawaTouchUI';
      el.setAttribute('data-script-ui', '1');
      el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:28;';
      document.body.appendChild(el);
    }
    this.root = el;
    return el;
  },
  clear() {
    if (this.root) this.root.innerHTML = '';
    this.down = Object.create(null);
    this.pressed = Object.create(null);
    this._btns = Object.create(null);
  },
  hide() { this.clear(); if (this.root) this.root.style.display = 'none'; },
  show(list) {
    this.ensure();
    this.root.style.display = 'block';
    this.root.innerHTML = '';
    this.down = Object.create(null);
    this.pressed = Object.create(null);
    this._btns = Object.create(null);
    const items = Array.isArray(list) ? list : [];
    for (const b of items) {
      if (!b || !b.id) continue;
      const id = String(b.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.label != null ? String(b.label) : id;
      btn.dataset.tid = id;
      btn.style.cssText = this._style(b);
      const on = e => { e.preventDefault(); e.stopPropagation(); this.down[id] = 1; this.pressed[id] = 1; btn.classList.add('on'); };
      const off = e => { e.preventDefault(); this.down[id] = 0; btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointerleave', off);
      btn.addEventListener('pointercancel', off);
      this.root.appendChild(btn);
      this._btns[id] = btn;
    }
  },
  _style(b) {
    const pos = b.pos || 'br';
    const map = {
      br: 'right:max(12px,env(safe-area-inset-right));bottom:max(18px,calc(12px + env(safe-area-inset-bottom)));',
      bl: 'left:max(12px,env(safe-area-inset-left));bottom:max(18px,calc(12px + env(safe-area-inset-bottom)));',
      bc: 'left:50%;transform:translateX(-50%);bottom:max(18px,calc(12px + env(safe-area-inset-bottom)));',
      tr: 'right:max(12px,env(safe-area-inset-right));top:max(12px,calc(12px + env(safe-area-inset-top)));',
      tl: 'left:max(12px,env(safe-area-inset-left));top:max(12px,calc(12px + env(safe-area-inset-top)));',
      mr: 'right:max(12px,env(safe-area-inset-right));top:50%;transform:translateY(-50%);',
      ml: 'left:max(12px,env(safe-area-inset-left));top:50%;transform:translateY(-50%);'
    };
    let extra = map[pos] || map.br;
    if (b.x != null) extra = `left:${b.x};top:${b.y != null ? b.y : 'auto'};bottom:auto;right:auto;transform:none;`;
    const w = b.w || (b.big ? '88px' : '72px');
    const h = b.h || (b.big ? '88px' : '72px');
    const bg = b.bg || 'rgba(15,23,42,.62)';
    const bd = b.bd || 'rgba(148,163,184,.45)';
    return `pointer-events:auto;position:absolute;${extra}min-width:${w};min-height:${h};padding:10px 14px;border-radius:${b.round != null ? b.round : '18px'};border:2px solid ${bd};background:${bg};color:#f8fafc;font:800 14px/1.2 Cairo,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);touch-action:manipulation;-webkit-user-select:none;user-select:none;z-index:29;`;
  },
  isDown(id) { return !!this.down[String(id)]; },
  wasPressed(id) {
    const k = String(id);
    if (this.pressed[k]) { this.pressed[k] = 0; return true; }
    return false;
  },
  isMobile() { return !!(typeof MOB !== 'undefined' && MOB.on); },
  api() {
    return {
      show: list => this.show(list),
      hide: () => this.hide(),
      clear: () => this.clear(),
      isDown: id => this.isDown(id),
      wasPressed: id => this.wasPressed(id),
      isMobile: () => this.isMobile()
    };
  }
};



const _autoCtxCache = {};
async function loadAutoCtx(file) {
  if (_autoCtxCache[file]) return _autoCtxCache[file];
  try {
    const r = await fetch(file, { cache: 'no-store' });
    if (r && r.ok) {
      const txt = await r.text();
      _autoCtxCache[file] = txt || '';
      return _autoCtxCache[file];
    }
  } catch (e) { console.warn('auto ctx', file, e); }
  _autoCtxCache[file] = '';
  return '';
}

function autoText(extraCtx) {
  const sec = S.mode === 'play' ? 'play' : S.section;
  const names = { play: 'play', prog: 'prog', sobj: 'sobj', objects: 'objects' };
  const sm = o => `id=${o.id} name=${o.name} type=${o.type} pos=[${o.pos.map(v => +v.toFixed(2))}] rot=[${o.rot.map(v => +v.toFixed(1))}] scl=[${o.scl.map(v => +v.toFixed(2))}] color=${o.color}${o.hidden ? ' hidden' : ''}${o.scripts && o.scripts.length ? ' scripts=' + o.scripts.join(',') : ''}`;
  const mobile = !!(typeof MOB !== 'undefined' && MOB.on);
  let t = `HAWA_AUTO\nsec=${names[sec] || sec}\nmobile=${mobile ? '1' : '0'}\ndevice=${mobile ? 'mobile' : 'desktop'}\n${playerNote()}\n`;
  t += API + '\n\n';

  // توجيهات الملف المرجعي حسب القسم
  if (extraCtx) {
    t += `\n===== CONTEXT_FILE_BEGIN =====\n${extraCtx}\n===== CONTEXT_FILE_END =====\n\n`;
  }

  // طبقة موبايل إضافية فوق السياق — للبرمجة والكائنات البرمجية فقط
  if (mobile && (sec === 'prog' || sec === 'sobj')) {
    t += `=== طبقة موبايل — مدخل افتراضي موحّد (إلزامي) ===
الجهاز: موبايل. المحرك بيعامل اللمس ككيبورد حقيقي لنفس المصدر (game.key / K).

المبدأ:
- أي نظام (لاعب، عربية، باب، سلاح، قائمة، تفاعل F/E) يقرأ game.key('KeyX') أو يستقبل forcePlayerInput — يشتغل من الموبايل بنفس الأكواد.
- ممنوع تعتمد على كيبورد حقيقي فقط. ابنِ أزرار/جويستيك لمس يكتبوا على المفاتيح الافتراضية.

API المفاتيح الافتراضية (عام — مش للاعب بس):
  game.setKey('KeyW', true|false)
  game.setKey('KeyA'|'KeyS'|'KeyD'|'Space'|'ShiftLeft'|'KeyE'|'KeyF'|'KeyQ'|'KeyR'|..., true|false)
  game.forcePlayerInput(0, {up,down,left,right,jump,run,interact,action, KeyE, KeyF, ...})
  game.key('KeyE') — يقرأ الكيبورد الحقيقي + الافتراضي من اللمس

أنماط واجهة:
1) game.touch.show([{id:'gas',label:'بنزين',pos:'br'}]) ثم كل فريم:
   game.setKey('KeyW', game.touch.isDown('gas'))
2) أو جوystick مخصص (DOM) يحدّث كل فريم:
   game.forcePlayerInput(0,{up:w,down:s,left:a,right:d,jump:space})
3) تفاعل عام (باب/ركوب/التقاط): زر لمس → game.setKey('KeyE',true) لحظة wasPressed ثم false

قواعد:
- اكتب setKey/forcePlayerInput كل onUpdate طالما الزر مضغوط (hold)، وfalse عند الإفلات.
- cleanup: game.touch.hide() + setKey الكل false أو اترك playStop يمسّح.
- dist للتقارب 2.5–4. ممنوع hover/كليك يمين كشرط وحيد.
- مركبة سكربت: customDrive؛ تحكم باللمس عبر نفس المفاتيح أو setKey مخصص لمنطقك.
- أي كود قديم يستخدم game.key('Space') يشتغل تلقائياً لو زر الموبايل يعمل setKey('Space',true).

`;
  } else if (!mobile && (sec === 'prog' || sec === 'sobj')) {
    t += `=== طبقة ديسكتوب ===
كيبورد/ماوس حسب السياق. game.setKey/forcePlayerInput متاحين لو حابب نفس منطق الموبايل.
game.key يقرأ الكيبورد الحقيقي. على الموبايل نفس الاستدعاءات تقرأ اللمس الافتراضي.

`;
  }

  t += `objs:\n${S.objs.map(sm).join('\n') || '(empty)'}\n\n`;
  t += `scripts:\n${S.scripts.map(s => `--- ${s.name} enabled=${!!s.enabled}\n${s.code}`).join('\n\n') || '(empty)'}\n\n`;
  t += `sdefs:\n${S.sdefs.map(d => `--- ${d.name} id=${d.id}\n${d.code}`).join('\n\n') || '(empty)'}\n`;
  if (sec === 'play' && RT) {
    const p = RT.p || { x: 0, y: 0, z: 0 };
    t += `\nplay score=${RT.score} pos=[${[p.x, p.y, p.z].map(v => (+v).toFixed(2))}] err=${S.err.join(' | ') || 'none'}\n`;
  }
  return { sec, t: t + coordBlock() };
}

function coordBlock() {
  const r3 = a => '[' + a.map(v => +(+v).toFixed(2)) + ']';
  const sp = S.objs.filter(o => o.type === 'respawn' || o.type === 'online_spawn').map(o => `${o.name} id=${o.id} pos=${r3(o.pos)}`);
  const pl = RT && RT.p ? r3([RT.p.x, RT.p.y, RT.p.z]) : '—';
  const cam = OB && OB.t ? r3([OB.t.x, OB.t.y, OB.t.z]) : '—';
  return `\ncoords player=${pl} cam=${cam} spawns=${sp.join(' | ') || '—'}\n`;
}

(function bindAuto() {
  const run = async (forceSec) => {
    if (forceSec) S.section = forceSec;
    const sec = S.mode === 'play' ? 'play' : S.section;
    let ctx = '';
    // برمجة + كائنات برمجية ← ملف السكربتات المرجعي
    // كائنات عادية ← ملف مستوى/ستوري المرجعي
    if (sec === 'prog' || sec === 'sobj') ctx = await loadAutoCtx('auto_scripted_object.txt');
    else if (sec === 'objects') ctx = await loadAutoCtx('auto_story_level.txt');
    const { sec: s2, t } = autoText(ctx);
    const tag = (typeof MOB !== 'undefined' && MOB.on) ? 'mobile' : 'desktop';
    dl('hawa-auto-' + s2 + '-' + tag + '.txt', t);
    try { tip('✔ تلقائي'); } catch (_) {}
  };
  const bA = $('#bAuto'), pA = $('#pAuto'), sA = $('#sAuto');
  if (bA) bA.onclick = () => { run(null); };
  if (pA) pA.onclick = () => { run('prog'); };
  if (sA) sA.onclick = () => { run('sobj'); };
})();

function toggleFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) req.call(el);
    } else {
      const ex = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (ex) ex.call(document);
    }
  } catch (e) { console.warn(e); }
}
function syncFullscreenBtn() {
  const b = document.getElementById('bFullscreen');
  if (!b) return;
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  b.classList.toggle('on', on);
  b.title = on ? 'خروج من ملء الشاشة' : 'ملء الشاشة';
}
(function bindFullscreen() {
  const b = document.getElementById('bFullscreen');
  if (b) b.onclick = () => toggleFullscreen();
  document.addEventListener('fullscreenchange', syncFullscreenBtn);
  document.addEventListener('webkitfullscreenchange', syncFullscreenBtn);
})();


/* =================================================================
   الاختبار — طبقة منفصلة تماماً
   ================================================================= */

/* ---------- شخصية بمفاصل هرمية ---------- */
const PLAYER_DEF = {
  style: 'suit',                  // 'suit' = شاب بالبدلة (الافتراضي) | 'soldier' = جندي لوباي | 'lowpoly' = لوباي كيوت قديم | 'realistic' = واقعية | 'armor' = مدرّع
  skin: '#f5c08f', skinD: '#e0a070', hair: '#3a2616', iris: '#2a3f5a',
  shirt: '#f1f1ee', pants: '#34415e', jacket: '#34415e', tie: '#c0392b', shoes: '#1d1b1b', belt: '#1d1b1b',
  vest: '#4f5f2e', helmet: '#6a8040', glove: '#33353a', scarf: '#e0483c', pack: '#9c8553',
  hairStyle: 'short', beard: false, glasses: false, headScale: 1.0, proportions: 'man', rounded: false, noseSize: 1.7, belly: .6,
  abaya: '#1f2329', trim: '#c9a96e', hood: false
};
const PCFG = JSON.parse(JSON.stringify(PLAYER_DEF));
function loadPlayerCfg() {
  try {
    fetch('player_config.json', {cache: 'no-store'})
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && typeof j === 'object') { Object.assign(PCFG, j); if (RT && RT.rig) rebuildLocalRig(); } })
      .catch(() => {});
  } catch (e) {}
}
function rebuildLocalRig() {   // لو ملف الشخصية وصل بعد ما اللاعب اتبنى → نعيد بناءه بالألوان الصح
  try {
    const o = RT.rig, nr = makeRig(); nr.root.position.copy(o.root.position); nr.root.rotation.y = o.root.rotation.y;
    scene.remove(o.root); RT.rig = nr; scene.add(nr.root);
  } catch (e) {}
}
function snapMats(root) {
  const seen = new Set(), out = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
      if (!m || seen.has(m)) continue; seen.add(m);
      out.push(m.color ? m.color.getHex() : -1, m.emissive ? m.emissive.getHex() : -1);
    }
  });
  return out;
}
function applyMats(root, arr) {
  if (!root || !Array.isArray(arr)) return false;
  const seen = new Set(), mats = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (m && !seen.has(m)) { seen.add(m); mats.push(m); } }
  });
  if (mats.length * 2 !== arr.length) return false;
  mats.forEach((m, i) => {
    const c = arr[2 * i], e = arr[2 * i + 1];
    if (c >= 0 && m.color && m.color.getHex() !== c) m.color.setHex(c);
    if (e >= 0 && m.emissive && m.emissive.getHex() !== e) m.emissive.setHex(e);
  });
  return true;
}
function playerNote() {
  const st = String(PCFG.style || 'suit').toLowerCase();
  return '## style: ' + st + '\n```json\n' + JSON.stringify(PCFG, null, 2) + '\n```\n';
}

const PSC = 1.2; let RIDE_SC = .9;   // حجم الشخصية العادي (أكبر وأوضح) / وهي راكبة

/* ---------- قياس اللاعب الحقيقي + الجلوس الصح (v2.15) ----------
   origin اللاعب (rt.p) = عند القدمين مش الحوض. لو سكربت حط player.position = موضع الكرسي
   الحوض بيغرق جوّه المخدة. الدوال دي بتقيس الهيكل الفعلي وتحسب الإزاحة الصح. */
const THIGH_HALF = .09, SOLE_H = .06;   // نص سمك الفخذ / ارتفاع النعل (وحدات الهيكل قبل الـ scale)
const r3 = n => Math.round(n * 1000) / 1000;
function measurePlayer(rig, sc) {
  rig = rig || (RT && RT.rig); if (!rig) return null;
  let d = rig._dims;
  if (!d) {
    const pos = o => (o && o.position) || {x: 0, y: 0, z: 0};
    const len = o => { const q = pos(o); return Math.hypot(q.x, q.y, q.z); };
    const pelvisY = rig.hipY || .74, hipJ = pos(rig.R.hip);
    const shY = pelvisY + pos(rig.waist).y + pos(rig.chest).y + pos(rig.AR.sh).y;
    let top = pelvisY + pos(rig.waist).y + pos(rig.chest).y + pos(rig.neck).y + pos(rig.head).y + .25;
    try { rig.root.updateMatrixWorld(true); const b = new T.Box3().setFromObject(rig.head); top = (b.max.y - rig.root.position.y) / (rig.root.scale.y || 1); } catch (e) {}
    d = rig._dims = {pelvisY, hipJointY: hipJ.y, hipX: Math.abs(hipJ.x), thigh: len(rig.R.knee), shin: len(rig.R.ankle),
      upperArm: len(rig.AR.el), foreArm: rig.AR.wr ? len(rig.AR.wr) : .24, shoulderX: Math.abs(pos(rig.AR.sh).x), shoulderY: shY, top};
  }
  const rs = +sc > .2 && +sc < 3 ? +sc : ((RT && RT.rideSc) || RIDE_SC);
  const at = s => ({scale: r3(s), height: r3(d.top * s), hipHeight: r3(d.pelvisY * s), thigh: r3(d.thigh * s), shin: r3(d.shin * s),
    upperArm: r3(d.upperArm * s), foreArm: r3(d.foreArm * s), shoulderWidth: r3(2 * d.shoulderX * s), shoulderHeight: r3(d.shoulderY * s), hipWidth: r3(2 * d.hipX * s + .17 * s)});
  const seatToOrigin = d.pelvisY + d.hipJointY - THIGH_HALF;   // سطح الكرسي فوق القدمين بكام (وحدات هيكل)
  return {style: String((typeof PCFG !== 'undefined' && PCFG.style) || 'suit'), standScale: PSC, rideScale: r3(rs), stand: at(PSC), ride: at(rs),
    sit: {originDrop: r3(seatToOrigin * rs), headAboveSeat: r3((d.top - seatToOrigin) * rs), shoulderAboveSeat: r3((d.shoulderY - seatToOrigin) * rs),
      kneeForward: r3(d.thigh * rs), feetBelowSeat: r3((d.shin + SOLE_H - THIGH_HALF) * rs), width: r3((2 * d.shoulderX + .12) * rs)}};
}
const SIT_KEYS = ['rLeg', 'lLeg', 'rShin', 'lShin', 'rFoot', 'lFoot'];
function seatPlayerRT(rt, x, y, z, o) {
  o = o || {};
  const sc = +o.scale > .2 && +o.scale < 3 ? +o.scale : RIDE_SC;
  rt.rideSc = sc;
  const d = measurePlayer(rt.rig, sc); if (!d) return false;
  rt.animLock = true; rt.hold = true; rt.sit = true;
  rt.p.set(x, y - d.sit.originDrop + (+o.lift || 0), z); rt.v.set(0, 0, 0);
  if (o.yaw != null) rt.ang = o.yaw;
  rt.rig.root.scale.setScalar(sc);
  if (o.pose === 'none') { rt.sitLimbs = null; }
  else {
    const th = o.thighRx != null ? +o.thighRx : -1.5, sh = o.shinRx != null ? +o.shinRx : 1.5, sp = o.spread != null ? +o.spread : .06;
    rt.sitLimbs = [['rLeg', th, sp], ['lLeg', th, -sp], ['rShin', sh, 0], ['lShin', sh, 0], ['rFoot', 0, 0], ['lFoot', 0, 0]];
    applySitLimbs(rt);
  }
  return true;
}
function applySitLimbs(rt) {
  if (!rt.sitLimbs) return;
  for (const l of rt.sitLimbs) { const j = jointOf(rt.rig, l[0]); if (j) { j.rotation.set(l[1], 0, l[2]); rt.locks.add(l[0]); } }
}
function unseatPlayerRT(rt, x, y, z) {
  rt.sit = false; rt.sitLimbs = null; rt.animLock = false; rt.hold = false; rt.rideSc = 0;
  for (const k of SIT_KEYS) { const j = jointOf(rt.rig, k); if (j) j.rotation.set(0, 0, 0); rt.locks.delete(k); }
  rt.rig.root.scale.setScalar(PSC); rt.rig.st.neutral = false;
  if (x != null) rt.p.set(x, y, z);
  rt.v.set(0, 0, 0);
}
let _noteDims = null, _noteKey = '';
function dimsForNote() {
  if (RT && RT.rig) return measurePlayer(RT.rig);
  const key = JSON.stringify([PCFG.style, PCFG.headScale]);
  if (!_noteDims || _noteKey !== key) { _noteDims = measurePlayer(makeRig(), RIDE_SC); _noteKey = key; }
  return _noteDims;
}
function seatNote() {
  let d = null; try { d = dimsForNote(); } catch (e) {}
  if (!d) return '';
  const f = n => (+n).toFixed(2), a = d.ride, st = d.stand, q = d.sit;
  return '### أبعاد اللاعب الحقيقية + الركوب والجلوس (إجباري تقرأه قبل أي مركبة أو كرسي أو سرير)\n' +
    '- origin اللاعب (game.player.position) = عند القدمين (الأرض) مش عند الحوض. ممنوع تنسخ موضع الكرسي في player.position — ده بيغرز الجسم في الكرسي.\n' +
    '- واقف: scale=' + st.scale + ' · الطول ' + f(st.height) + 'م · عرض الكتفين ' + f(st.shoulderWidth) + 'م.\n' +
    '- راكب/قاعد (scale=' + a.scale + ' بيتظبط تلقائي): الطول ' + f(a.height) + 'م · الحوض فوق القدمين ' + f(a.hipHeight) + 'م · فخذ ' + f(a.thigh) + 'م · ساق ' + f(a.shin) + 'م · عضد ' + f(a.upperArm) + 'م · ساعد ' + f(a.foreArm) + 'م · عرض الكتفين ' + f(a.shoulderWidth) + 'م · ارتفاع الكتف عن القدمين ' + f(a.shoulderHeight) + 'م.\n' +
    '- وهو قاعد (فخذ أفقي، ساق عمودي): الراس فوق سطح الكرسي ' + f(q.headAboveSeat) + 'م · الكتف فوق السطح ' + f(q.shoulderAboveSeat) + 'م · الركبة قدام الحوض ' + f(q.kneeForward) + 'م · القدم تحت سطح الكرسي ' + f(q.feetBelowSeat) + 'م · العرض المطلوب ' + f(q.width) + 'م · إزاحة origin تحت السطح ' + f(q.originDrop) + 'م.\n' +
    'القواعد:\n' +
    '  1) القعدة: كل فريم نادي Game.seatPlayer(0, x, y, z, {yaw}) — (x,y,z) = السطح العلوي للمخدة بالإحداثيات العالمية (احسبها بـ chassis.localToWorld على نقطة سطح المخدة الفعلية: مركزها XZ و y = أعلى المخدة). الدالة بتخصم الإزاحة وتظبط الحجم وتثني الركبتين لوحدها.\n' +
    '  2) النزول: Game.unseatPlayer(0, x, y, z) (بيرجع الحجم والأرجل ويفك القفل). x,y,z = مكان الوقوف على الأرض.\n' +
    '  3) قيس قبل ما ترسم: Game.getPlayerDims(0) بيرجّع كل الأرقام دي (stand / ride / sit). صمّم الكرسي والكابينة على قدها: أرضية القدم عند (ارتفاع السطح − ' + f(q.feetBelowSeat) + 'م) أو حط مسند قدم، مساحة ركبة قدام الكرسي ≥ ' + f(q.kneeForward + .1) + 'م، سقف/حاجز فوق السطح ≥ ' + f(q.headAboveSeat + .1) + 'م، عرض الكرسي ≥ ' + f(q.width) + 'م.\n' +
    '  4) موتوسيكل/حصان (ركبة مفتوحة): Game.seatPlayer(..., {pose:\'none\'}) وبعدها اظبط الأرجل بـ setPlayerLimb بنفسك. opt.lift لتعديل دقيق (±0.05م بس).\n' +
    '  5) ممنوع تغيّر root.scale للاعب بإيدك. لو عايز حجم مختلف: {scale: 0.8} في seatPlayer.\n' +
    '  6) الأونلاين: القعدة بتتزامن تلقائي (الحجم + الأرجل). متحطش اللاعب بـ setPlayerPosition يدوي وهو قاعد.\n\n';
}
let _NOISE = null;
function faceNoise() {          // ملمس مسام وتفاصيل جلد/قماش (bump)
  if (_NOISE) return _NOISE;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 150 + (Math.random() - .5) * 70; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  _NOISE = new T.CanvasTexture(c); _NOISE.wrapS = _NOISE.wrapT = T.RepeatWrapping; _NOISE.repeat.set(3, 3);
  return _NOISE;
}
/* ---------- هل نحن في لعب أونلاين فعلي؟ (مش اختبار المحرر) ---------- */
function onlinePlayMeta() {
  try {
    if (!window.HAWA_PLAY_ONLY) return null;
    const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null');
    return (m && m.mode === 'online') ? m : null;
  } catch (_) { return null; }
}
/* ---------- صوت / مايك (B) + اهتزاز الفم/الرأس عند وجود صوت فعلي ---------- */
const VOICE_DEF = {
  enabled: true,           // السماح باهتزاز الوجه من الصوت (أونلاين فقط يظهر الزر)
  sensitivity: 0.012,      // عتبة الضوضاء (أقل = أكثر حساسية للصوت)
  maxMouth: 0.72,          // أقصى فتح فم من الصوت
  headShake: 0.045,        // سعة اهتزاز الرأس
  headShakeEnabled: true,  // تفعيل/إيقاف اهتزاز الرأس
  smoothing: 0.32,         // تنعيم المستوى (0–1)
  highpass: 85,            // تردد عالي-تمرير (يزيل همهمة)
  lowpass: 7500,           // تردد منخفض-تمرير
  noiseGate: 0.008,        // بوابة ضوضاء إضافية
  shape: 'natural',        // natural | cartoon (شكل فتح الفم)
  gain: 1.35               // تضخيم المستوى قبل التطبيق
};
const VOICE_CFG = Object.assign({}, VOICE_DEF);

const VoiceChat = {
  on: false,
  level: 0,          // 0–1 بعد التنعيم (صوت فعلي فقط)
  raw: 0,
  stream: null,
  ac: null,
  analyser: null,
  data: null,
  src: null,
  filters: null,
  _btn: null,
  _remoteAudios: new Map(),
  _mediaCalls: new Map(), // مكالماتنا الصادرة (صوتنا)
  _inCalls: new Map(),    // مكالمات واردة (صوت غيرنا) — لا تُقفل عند كتم المايك
  _lanTracks: new Map(),
  _wantOn: false,

  ensureBtn() {
    let b = document.getElementById('pMic');
    if (!b) {
      b = document.createElement('button');
      b.id = 'pMic'; b.type = 'button'; b.title = 'تفعيل/إيقاف المايك (B)';
      b.innerHTML = '<span class="mic-ico" aria-hidden="true"><svg class="r" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><line x1="4" y1="4" x2="20" y2="20"/></svg><svg class="g" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span><kbd>B</kbd><span class="mic-lbl">مايك</span>';
      const play = document.getElementById('play');
      if (play) play.appendChild(b);
      else document.body.appendChild(b);
    }
    if (b && !b._voiceBound) {
      b._voiceBound = 1;
      const stop = e => { e.stopPropagation(); };
      b.addEventListener('mousedown', stop); b.addEventListener('mouseup', stop); b.addEventListener('pointerdown', stop);
      b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.toggle(); });
    }
    this._btn = b;
    this._syncBtn();
    return b;
  },
  show(v) {
    const b = this._btn || document.getElementById('pMic');
    if (b) b.classList.toggle('show', !!v);
  },
  _syncBtn() {
    const b = this._btn || document.getElementById('pMic');
    if (!b) return;
    b.classList.toggle('on', !!this.on);
    b.classList.toggle('live', !!this.on && this.level > 0.05);
    const lbl = b.querySelector('.mic-lbl');
    if (lbl) { const t = this.on ? (this.level > 0.05 ? 'يتكلم' : 'مفتوح') : 'مكتوم'; if (lbl.textContent !== t) lbl.textContent = t; }
    const bar = b.querySelector('.mic-bar i');
    if (bar) bar.style.width = Math.round(Math.min(1, this.level * 1.4) * 100) + '%';
  },
  set(opts) {
    if (!opts || typeof opts !== 'object') return this.get();
    for (const k of Object.keys(VOICE_DEF)) {
      if (opts[k] != null) VOICE_CFG[k] = opts[k];
    }
    this._rebuildFilters();
    return this.get();
  },
  get() { return Object.assign({}, VOICE_CFG, { on: this.on, level: +this.level.toFixed(3) }); },
  isOn() { return !!this.on; },
  level01() { return this.level; },

  async toggle() {
    if (this.on || this._wantOn) return this.off();
    return this.start();
  },
  async start() {
    this._wantOn = true;
    this.ensureBtn();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        say(window.isSecureContext === false ? '⚠ المايك يحتاج localhost أو https (افتح الصفحة من START_SERVER)' : '⚠ المتصفح لا يدعم المايك', 4500);
        this._wantOn = false; return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        },
        video: false
      });
      if (!this._wantOn) { stream.getTracks().forEach(t => t.stop()); return false; }
      this.stream = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ac = new AC();
      if (this.ac.state === 'suspended') try { await this.ac.resume(); } catch (_) {}
      this.src = this.ac.createMediaStreamSource(stream);
      this.analyser = this.ac.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.35;
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      this._rebuildFilters();
      this.on = true;
      this._syncBtn();
      this._shareStream();
      say('🎙 المايك مفعّل · تكلم عشان الفم يهتز', 2200);
      return true;
    } catch (e) {
      this._wantOn = false;
      this.on = false;
      this._syncBtn();
      say('⚠ رفض المايك أو غير متاح: ' + (e.message || e), 4000);
      return false;
    }
  },
  _rebuildFilters() {
    if (!this.ac || !this.src || !this.analyser) return;
    try { this.src.disconnect(); } catch (_) {}
    try { if (this.filters) this.filters.forEach(f => { try { f.disconnect(); } catch (_) {} }); } catch (_) {}
    const hp = this.ac.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = +VOICE_CFG.highpass || 85; hp.Q.value = 0.7;
    const lp = this.ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = +VOICE_CFG.lowpass || 7500; lp.Q.value = 0.7;
    this.filters = [hp, lp];
    this.src.connect(hp); hp.connect(lp); lp.connect(this.analyser);
  },
  off() {
    this._wantOn = false;
    this.on = false;
    this.level = 0; this.raw = 0;
    try {
      if (this.stream) this.stream.getTracks().forEach(t => { try { t.stop(); } catch (_) {} });
    } catch (_) {}
    this.stream = null;
    try { if (this.src) this.src.disconnect(); } catch (_) {}
    try { if (this.filters) this.filters.forEach(f => { try { f.disconnect(); } catch (_) {} }); } catch (_) {}
    this.src = null; this.filters = null; this.analyser = null; this.data = null;
    try { if (this.ac) this.ac.close(); } catch (_) {}
    this.ac = null;
    this._stopSharing();
    this._syncBtn();
    return false;
  },
  tick() {
    if (!this.on || !this.analyser || !this.data) {
      this.level = this.level * 0.85;
      this._syncBtn();
      return this.level;
    }
    if (this.ac && this.ac.state === 'suspended') {
      try { this.ac.resume(); } catch (_) {}
    }
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) {
      const v = (this.data[i] - 128) / 128;
      sum += v * v;
    }
    let rms = Math.sqrt(sum / this.data.length);
    const gate = Math.max(+VOICE_CFG.noiseGate || 0, +VOICE_CFG.sensitivity || 0.018);
    if (rms < gate) rms = 0;
    else rms = (rms - gate) / (1 - gate);
    rms = Math.min(1, rms * (+VOICE_CFG.gain || 1));
    this.raw = rms;
    const sm = Math.min(1, Math.max(0.05, +VOICE_CFG.smoothing || 0.28));
    this.level = this.level + (rms - this.level) * (rms > this.level ? Math.min(1, sm * 2.2) : sm);
    if (this.level < 0.008) this.level = 0;
    this._syncBtn();
    return this.level;
  },
  mouthAmount() {
    if (!VOICE_CFG.enabled || !this.on) return 0;
    let m = this.level * (+VOICE_CFG.maxMouth || 0.65);
    if (VOICE_CFG.shape === 'cartoon') m = Math.pow(m, 0.65) * 1.05;
    return Math.min(1, m);
  },
  headShakeAmount() {
    if (!VOICE_CFG.enabled || !VOICE_CFG.headShakeEnabled || !this.on) return 0;
    return this.level * (+VOICE_CFG.headShake || 0.045);
  },

  _shareStream() {
    if (!this.stream || !NetMP || !NetMP.on) return;
    if (NetMP.transport === 'peerjs' && NetMP.peer) {
      for (const [pid] of NetMP.conns) this._callPeer(pid);
    }
    if (NetMP.transport === 'lan' && NetMP._dcMap) {
      for (const [pid, entry] of NetMP._dcMap) this._addLanTrack(pid, entry);
    }
  },
  _stopSharing() {
    for (const [, call] of this._mediaCalls) { try { call.close(); } catch (_) {} }
    this._mediaCalls.clear();
    for (const [, sender] of this._lanTracks) {
      try { if (sender && sender.track) sender.track.stop(); } catch (_) {}
    }
    this._lanTracks.clear();
  },
  _callPeer(peerId) {
    if (!this.stream || !NetMP.peer || this._mediaCalls.has(peerId)) return;
    try {
      const call = NetMP.peer.call(peerId, this.stream);
      if (!call) return;
      this._mediaCalls.set(peerId, call);
      call.on('close', () => { if (this._mediaCalls.get(peerId) === call) this._mediaCalls.delete(peerId); });
      call.on('error', () => { if (this._mediaCalls.get(peerId) === call) this._mediaCalls.delete(peerId); });
    } catch (e) { console.warn('voice call', e); }
  },
  _answerCall(call) {
    if (!call) return;
    const pid = call.peer;
    try {
      call.answer(); // نستقبل فقط؛ صوتنا يطلع بمكالمة صادرة منفصلة
      const old = this._inCalls.get(pid);
      this._inCalls.set(pid, call);
      if (old && old !== call) { try { old.close(); } catch (_) {} }
      call.on('stream', remote => this._playRemote(pid, remote));
      call.on('close', () => { if (this._inCalls.get(pid) === call) { this._inCalls.delete(pid); this._stopRemote(pid); } });
      call.on('error', () => {});
    } catch (e) { console.warn('voice answer', e); }
  },
  _addLanTrack(peerId, entry) {
    if (!this.stream || !entry || !entry.pc) return;
    try {
      const track = this.stream.getAudioTracks()[0];
      if (!track) return;
      const sender = entry.pc.addTrack(track, this.stream);
      this._lanTracks.set(peerId, sender);
      entry.pc.ontrack = (ev) => {
        if (ev.streams && ev.streams[0]) this._playRemote(peerId, ev.streams[0]);
      };
    } catch (e) { console.warn('lan track', e); }
  },
  _playRemote(peerId, stream) {
    this._stopRemote(peerId);
    try {
      const a = new Audio();
      a.autoplay = true;
      a.srcObject = stream;
      a.volume = 1;
      const go = () => a.play().catch(() => {});
      go();
      if (!this._unlock) { this._unlock = () => { for (const x of this._remoteAudios.values()) { try { x.play(); } catch (_) {} } }; addEventListener('click', this._unlock); addEventListener('keydown', this._unlock); }
      this._remoteAudios.set(peerId, a);
    } catch (_) {}
  },
  _stopRemote(peerId) {
    const a = this._remoteAudios.get(peerId);
    if (a) {
      try { a.pause(); a.srcObject = null; } catch (_) {}
      this._remoteAudios.delete(peerId);
    }
  },
  onPeerConnected(peerId) {
    if (this.on && this.stream) this._callPeer(peerId);
  },
  destroy() {
    this.off();
    for (const [, c] of this._inCalls) { try { c.close(); } catch (_) {} }
    this._inCalls.clear();
    for (const pid of [...this._remoteAudios.keys()]) this._stopRemote(pid);
  }
};

function localFace(rig) {
  const bl = rig.st.blinkT > 0 ? Math.sin((1 - rig.st.blinkT / .15) * Math.PI) : 0;
  const talkKey = K.KeyT ? .3 + .3 * Math.abs(Math.sin(performance.now() / 85)) : 0;
  const talkMic = VoiceChat.mouthAmount();
  const talk = Math.max(talkKey, talkMic);
  return {bl, mo: talk, sm: K.KeyY ? 1 : 0, su: K.KeyU ? 1 : 0, br: K.KeyU ? 1 : (K.KeyY ? .25 : 0), vo: VoiceChat.level01()};
}
function applyFace(rig, f, dt) {
  if (!rig || !rig.lipU || !f) return;
  const k = Math.min(1, dt * 12);
  const s = rig.fs || (rig.fs = {mo: 0, sm: 0, su: 0, br: 0});
  s.mo = _lerp(s.mo, f.mo || 0, k); s.sm = _lerp(s.sm, f.sm || 0, k); s.su = _lerp(s.su, f.su || 0, k); s.br = _lerp(s.br, f.br || 0, k);
  rig.lipD.position.y = .04 - s.mo * .02; rig.lipU.position.y = .052 + s.mo * .008;
  rig.lipU.scale.x = rig.lipD.scale.x = 1 + s.sm * .45;
  rig.lipD.scale.y = 1 + s.mo * 2.5;
  for (const b of rig.brows) b.position.y = .165 + s.br * .014 + s.su * .01;
  for (const e of rig.eyes) e.scale.y = 1 + s.su * .22;
  if (f.bl != null) for (const l of rig.lids) l.scale.y = .0001 + f.bl * .95;
}

function makeRigWith(app) {
  if (!app || typeof app !== 'object') return makeRig();
  const bak = JSON.parse(JSON.stringify(PCFG)), clean = {};
  for (const k in app) if (app[k] !== undefined && app[k] !== null) clean[k] = app[k];
  for (const k in PCFG) delete PCFG[k];
  Object.assign(PCFG, JSON.parse(JSON.stringify(PLAYER_DEF)), clean);   // الأساس = الافتراضي (مش ملف الجهاز ده) → نفس الألوان عند الكل
  try { return makeRig(); } finally { for (const k in PCFG) delete PCFG[k]; Object.assign(PCFG, bak); }
}
/* ---------- شخصية «الشاب بالبدلة» (v2.11) — لبس عام (بدلة + قميص + كرافتة) بنفس هيكل المفاصل ---------- */
function makeGuyRig() {
  const P = PCFG, root = new T.Group();
  const dk = (hex, f) => new T.Color(hex).multiplyScalar(f);
  const RND = true;   // v2.16: حواف مدوّرة + تظليل ناعم (rounded:false يرجّع الشكل المكعّب القديم)
  const flat = (c, r = .8, m = 0) => new T.MeshStandardMaterial({color: c, roughness: r, metalness: m, flatShading: !RND});
  const jacketC = P.jacket || '#27324a', tieC = P.tie || '#c0392b';
  const C = {
    skin: flat(P.skin, .62), skinD: flat(P.skinD, .68), hair: flat(P.hair, .7),
    shirt: flat(P.shirt, .85), shirtD: flat(dk(P.shirt, .86), .88),
    jacket: flat(jacketC, .82), jacketD: flat(dk(jacketC, .72), .85),
    pants: flat(P.pants, .88), pantsD: flat(dk(P.pants, .8), .9),
    tie: flat(tieC, .7), tieD: flat(dk(tieC, .75), .75),
    boot: flat(P.shoes, .45, .1), sole: flat(0x15130f, .9), belt: flat(P.belt, .6), buckle: flat(0xd9b44a, .35, .65),
    dark: flat(0x22252b, .5, .3), glass: new T.MeshStandardMaterial({color: 0xbfe6ff, roughness: .1, metalness: .2, transparent: true, opacity: .28, flatShading: true}),
    eyeW: flat(0xfbfaf6, .25), iris: flat(P.iris, .3), pupil: flat(0x08080c, .25),
    lip: flat(0xb5645a, .6), mouthIn: flat(0x3a0f10, .8), cheek: flat(0xff8fa3, .9)
  };
  const jt = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const place = (m, par, x, y, z, rot) => { m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m; };
  const bx = (par, w, h, d, mt, x, y, z, rot) => place(new T.Mesh(new T.BoxGeometry(w, h, d), mt), par, x, y, z, rot);
  const fru = (par, aTop, aBot, h, dz, mt, x, y, z, rot) => {
    const g = new T.CylinderGeometry(aTop * 1.4142, aBot * 1.4142, h, 4); g.rotateY(Math.PI / 4);
    const m = new T.Mesh(g, mt); m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const rGeo = (w, h, d, r, tp) => {
    r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    const g = new T.BoxGeometry(w, h, d, 8, 8, 8), ps = g.attributes.position, nr = g.attributes.normal;
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new T.Vector3(), q = new T.Vector3();
    for (let i = 0; i < ps.count; i++) {
      v.fromBufferAttribute(ps, i);
      q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
      v.sub(q); const l = v.length();
      if (l > 1e-6) { v.multiplyScalar(1 / l); nr.setXYZ(i, v.x, v.y, v.z); ps.setXYZ(i, q.x + v.x * r, q.y + v.y * r, q.z + v.z * r); }
      if (tp) { const k = tp(ps.getY(i)); ps.setX(i, ps.getX(i) * k); ps.setZ(i, ps.getZ(i) * k); }
    }
    return g;
  };
  const rbx = (par, w, h, d, mt, x, y, z, rot, r) => !RND ? bx(par, w, h, d, mt, x, y, z, rot) : place(new T.Mesh(rGeo(w, h, d, r != null ? r : Math.min(w, h, d) * .32), mt), par, x, y, z, rot);
  const rfru = (par, aTop, aBot, h, dz, mt, x, y, z, rot, r) => {
    if (!RND) return fru(par, aTop, aBot, h, dz, mt, x, y, z, rot);
    const m = new T.Mesh(rGeo(2 * aTop, h, 2 * aTop, r != null ? r : .05, yy => (aBot + (aTop - aBot) * (yy + h / 2) / h) / aTop), mt);
    m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   // عين/قزحية بيضاوية بدل المستطيل
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .74, sec = [];
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .31, .14, .2, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .345, .12, .225, C.jacket, 0, .06, 0, null, .05);                                    // ذيل الجاكت
  bx(pelvis, .345, .02, .23, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .232, C.jacketD, 0, .06, 0);                                    // خط الضهر

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .32, .17, .215, C.jacket, 0, .085, 0, null, .06);
  const BL = P.belly != null ? +P.belly : .6;                                          // الكرش (فاني)
  if (BL > 0) rbx(waist, .3, .2, .1 + .18 * BL, C.jacket, 0, .06, .09, null, .085);
  const chest = jt(waist, 0, .17, 0);
  rfru(chest, .24, .2, .3, .74, C.jacket, 0, .15, 0, null, .08);                                // كتاف الجاكت (أعرض من فوق)
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      // القميص من قدام
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          // ياقة الجاكت (لابل)
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             // زراير
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  // منديل الجيب
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .27, .15);                                                  // الكرافتة (نابض)
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .085, .095, .08, C.skinD, 0, .02, 0, 10);
  cy(neck, .1, .115, .05, C.shirt, 0, .005, 0, 8);                                     // ياقة القميص
  for (const sd of [-1, 1]) bx(neck, .05, .05, .02, C.shirtD, sd * .035, -.01, .105, [.2, sd * .35, sd * .2]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .162, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        // سطح الوش الفعلي عند ارتفاع
  for (const sd of [-1, 1]) {
    rbx(head, .036, .1, .07, C.skinD, sd * (aTop + .004), .1, -.005, null, .016);                 // ودان (ملزوقة)
    bx(head, .04, .03, .012, C.cheek, sd * .112, .072, fz(.072) + .004);
  }
  const NS = +P.noseSize > 0 ? +P.noseSize : 1.7;                                      // حجم المنخار (فاني)
  rbx(head, .046 * NS * .8, .044 * NS, .05 * NS, C.skinD, 0, .092, fz(.092) + .012 + .008 * NS, null, .02);
  rbx(head, .06 * NS * .8, .024 * NS, .04 * NS, C.skinD, 0, .07, fz(.07) + .014 + .008 * NS, null, .014);                          // الأنف
  const brows = [];
  for (const sd of [-1, 1]) brows.push(rbx(head, .085, .028, .03, C.hair, sd * .07, .165, fz(.165) + .008, [0, 0, sd * -.2], .012));
  const lipU = rbx(head, .07, .012, .02, C.lip, 0, .052, fz(.05) + .005, null, .0058);
  const lipD = rbx(head, .055, .012, .02, C.lip, 0, .04, fz(.04) + .004, null, .0058);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, fz(.046) - .004);
  for (const sd of [-1, 1]) rbx(head, .075, .03, .035, C.hair, sd * .04, .076, fz(.076) + .03, [0, 0, sd * -.2], .014);   // شنب كثيف
  rbx(head, .11, .06, .06, C.skin, 0, -.004, fz(0) + .02, null, .026);                                              // دقن كبيرة
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const ez = fz(.12), eg = jt(head, sd * .075, .12, ez);
    disc(eg, .039, .036, .022, C.eyeW, 0, 0, .002);
    disc(eg, .022, .027, .022, C.iris, 0, 0, .01);
    disc(eg, .012, .016, .022, C.pupil, 0, 0, .016);
    disc(eg, .0055, .0055, .022, C.eyeW, .009, .011, .022);
    eyes.push(eg);
    lids.push(disc(head, .042, .039, .028, C.skin, sd * .075, .12, ez + .005));
  }
  for (const l of lids) l.scale.y = .0001;
  const hs = P.hairStyle || 'short';
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    // فوق
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         // ورا
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     // جوانب
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      // غُرّة
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     // نظارة ملزوقة بالراس (الوش + الودان)
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          // دراع النظارة لحد الودن
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar((+P.headScale > 0 ? +P.headScale : 1.0) * .95);

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .17, .34, .185, C.pants, 0, -.16, 0, null, .07);
    bx(hip, .012, .3, .187, C.pantsD, 0, -.17, 0);                                     // كسرة البنطلون
    const knee = jt(hip, 0, -.34, 0);
    rfru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0, null, .045);
    const ank = jt(knee, 0, -.32, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      // طرف البنطلون
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    // كعب
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 // نعل
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    rbx(sh, .17, .085, .16, C.jacket, sd * .015, .045, 0, [0, 0, sd * -.14], .04);            // كتف
    rbx(sh, .145, .30, .15, C.jacket, 0, -.135, 0, null, .06);
    const el = jt(sh, 0, -.255, 0);
    rbx(el, .12, .06, .12, C.jacket, 0, .0, 0, null, .03);
    rfru(el, .062, .054, .26, 1, C.jacket, 0, -.11, 0, null, .04);
    bx(el, .108, .03, .108, C.shirt, 0, -.235, 0);
    bx(el, .112, .012, .112, C.jacketD, 0, -.222, 0);
    const wr = jt(el, 0, -.24, 0);
    rbx(wr, .115, .1, .075, C.skin, 0, -.05, 0, null, .028);
    const fingers = [];
    for (let f = 0; f < 4; f++) {
      const L = .042 * (f === 1 ? 1.1 : f === 3 ? .85 : 1);
      const f1 = jt(wr, -.03 + f * .02, -.095, 0); bx(f1, .02, L, .032, C.skin, 0, -L / 2, 0);
      const f2 = jt(f1, 0, -L, 0); bx(f2, .019, L * .8, .03, C.skin, 0, -L * .4, 0);
      const f3 = jt(f2, 0, -L * .8, 0);
      fingers.push([f1, f2, f3]);
    }
    const t1 = jt(wr, -sd * .054, -.05, .015); t1.rotation.set(-.6, 0, -sd * .5);
    bx(t1, .025, .045, .028, C.skin, 0, -.022, 0);
    const t2 = jt(t1, 0, -.045, 0); bx(t2, .022, .035, .026, C.skin, 0, -.017, 0);
    arms[nm] = {sh, el, wr, fingers, thumb: [t1, t2]};
  }

  const blob = new T.Mesh(new T.CircleGeometry(.34, 14), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .025; blob.renderOrder = 1; root.add(blob);

  root.scale.setScalar(PSC);
  const st = {t: Math.random() * 10, blink: 2.5, blinkT: 0, land: 0, wasAir: false, pvy: 0, cw: cape.map(() => ({a: .1, v: 0, z: 0, zv: 0})), neutral: false, hip: 0, eyeTx: 0, eyeTy: 0, eyeNext: 1 + Math.random() * 2};
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st, hipY: HIP, sec, blob};
}

function makeManRig() {
  const P = PCFG, root = new T.Group();
  const dk = (hex, f) => new T.Color(hex).multiplyScalar(f);
  const RND = P.rounded === true;   // v2.16: حواف مدوّرة + تظليل ناعم (rounded:false يرجّع الشكل المكعّب القديم)
  const flat = (c, r = .8, m = 0) => new T.MeshStandardMaterial({color: c, roughness: r, metalness: m, flatShading: !RND});
  const jacketC = P.jacket || '#27324a', tieC = P.tie || '#c0392b';
  const C = {
    skin: flat(P.skin, .62), skinD: flat(P.skinD, .68), hair: flat(P.hair, .7),
    shirt: flat(P.shirt, .85), shirtD: flat(dk(P.shirt, .86), .88),
    jacket: flat(jacketC, .82), jacketD: flat(dk(jacketC, .72), .85),
    pants: flat(P.pants, .88), pantsD: flat(dk(P.pants, .8), .9),
    tie: flat(tieC, .7), tieD: flat(dk(tieC, .75), .75),
    boot: flat(P.shoes, .45, .1), sole: flat(0x15130f, .9), belt: flat(P.belt, .6), buckle: flat(0xd9b44a, .35, .65),
    dark: flat(0x22252b, .5, .3), glass: new T.MeshStandardMaterial({color: 0xbfe6ff, roughness: .1, metalness: .2, transparent: true, opacity: .28, flatShading: true}),
    eyeW: flat(0xfbfaf6, .25), iris: flat(P.iris, .3), pupil: flat(0x08080c, .25),
    lip: flat(0xb5645a, .6), mouthIn: flat(0x3a0f10, .8), cheek: flat(0xff8fa3, .9)
  };
  const jt = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const place = (m, par, x, y, z, rot) => { m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m; };
  const bx = (par, w, h, d, mt, x, y, z, rot) => place(new T.Mesh(new T.BoxGeometry(w, h, d), mt), par, x, y, z, rot);
  const fru = (par, aTop, aBot, h, dz, mt, x, y, z, rot) => {
    const g = new T.CylinderGeometry(aTop * 1.4142, aBot * 1.4142, h, 4); g.rotateY(Math.PI / 4);
    const m = new T.Mesh(g, mt); m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const rGeo = (w, h, d, r, tp) => {
    r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    const g = new T.BoxGeometry(w, h, d, 8, 8, 8), ps = g.attributes.position, nr = g.attributes.normal;
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new T.Vector3(), q = new T.Vector3();
    for (let i = 0; i < ps.count; i++) {
      v.fromBufferAttribute(ps, i);
      q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
      v.sub(q); const l = v.length();
      if (l > 1e-6) { v.multiplyScalar(1 / l); nr.setXYZ(i, v.x, v.y, v.z); ps.setXYZ(i, q.x + v.x * r, q.y + v.y * r, q.z + v.z * r); }
      if (tp) { const k = tp(ps.getY(i)); ps.setX(i, ps.getX(i) * k); ps.setZ(i, ps.getZ(i) * k); }
    }
    return g;
  };
  const rbx = (par, w, h, d, mt, x, y, z, rot, r) => !RND ? bx(par, w, h, d, mt, x, y, z, rot) : place(new T.Mesh(rGeo(w, h, d, r != null ? r : Math.min(w, h, d) * .32), mt), par, x, y, z, rot);
  const rfru = (par, aTop, aBot, h, dz, mt, x, y, z, rot, r) => {
    if (!RND) return fru(par, aTop, aBot, h, dz, mt, x, y, z, rot);
    const m = new T.Mesh(rGeo(2 * aTop, h, 2 * aTop, r != null ? r : .05, yy => (aBot + (aTop - aBot) * (yy + h / 2) / h) / aTop), mt);
    m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   // عين/قزحية بيضاوية بدل المستطيل
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .80, sec = [];   // رجل: حوض أعلى (رجلين أطول)
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .29, .14, .19, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .315, .12, .205, C.jacket, 0, .06, 0, null, .05);                                    // ذيل الجاكت
  bx(pelvis, .315, .02, .21, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .212, C.jacketD, 0, .06, 0);                                    // خط الضهر

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .29, .16, .195, C.jacket, 0, .08, 0, null, .06);
  const chest = jt(waist, 0, .16, 0);
  rfru(chest, .2, .175, .28, .825, C.jacket, 0, .14, 0, null, .07);                                // كتاف الجاكت (أعرض من فوق)
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      // القميص من قدام
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          // ياقة الجاكت (لابل)
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             // زراير
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  // منديل الجيب
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .25, .15);                                                  // الكرافتة (نابض)
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .28, 0);
  cy(neck, .065, .075, .08, C.skinD, 0, .02, 0, 6);
  cy(neck, .1, .115, .05, C.shirt, 0, .005, 0, 8);                                     // ياقة القميص
  for (const sd of [-1, 1]) bx(neck, .05, .05, .02, C.shirtD, sd * .035, -.01, .105, [.2, sd * .35, sd * .2]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        // سطح الوش الفعلي عند ارتفاع
  for (const sd of [-1, 1]) {
    rbx(head, .03, .075, .055, C.skinD, sd * (aTop + .002), .1, -.005, null, .013);                 // ودان (ملزوقة)
    bx(head, .04, .03, .012, C.cheek, sd * .112, .072, fz(.072) + .004);
  }
  rbx(head, .04, .045, .035, C.skinD, 0, .09, fz(.09) + .012, null, .014);                          // الأنف
  const brows = [];
  for (const sd of [-1, 1]) brows.push(rbx(head, .065, .016, .022, C.hair, sd * .07, .165, fz(.165) + .004, [0, 0, sd * -.14], .007));
  const lipU = rbx(head, .07, .012, .02, C.lip, 0, .052, fz(.05) + .005, null, .0058);
  const lipD = rbx(head, .055, .012, .02, C.lip, 0, .04, fz(.04) + .004, null, .0058);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, fz(.046) - .004);
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const ez = fz(.12), eg = jt(head, sd * .075, .12, ez);
    disc(eg, .044, .038, .022, C.eyeW, 0, 0, .002);
    disc(eg, .027, .031, .022, C.iris, 0, 0, .01);
    disc(eg, .015, .019, .022, C.pupil, 0, 0, .016);
    disc(eg, .0065, .0065, .022, C.eyeW, .011, .013, .022);
    eyes.push(eg);
    lids.push(disc(head, .047, .041, .028, C.skin, sd * .075, .12, ez + .005));
  }
  for (const l of lids) l.scale.y = .0001;
  const hs = P.hairStyle || 'short';
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    // فوق
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         // ورا
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     // جوانب
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      // غُرّة
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     // نظارة ملزوقة بالراس (الوش + الودان)
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          // دراع النظارة لحد الودن
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar((+P.headScale > 0 ? +P.headScale : 1.0) * .88);   // راس بنسبة رجل حقيقي

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .155, .37, .17, C.pants, 0, -.175, 0, null, .06);
    bx(hip, .012, .33, .172, C.pantsD, 0, -.185, 0);                                     // كسرة البنطلون
    const knee = jt(hip, 0, -.37, 0);
    rfru(knee, .07, .06, .34, 1.05, C.pants, 0, -.17, 0, null, .04);
    const ank = jt(knee, 0, -.35, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      // طرف البنطلون
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    // كعب
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 // نعل
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .225, .205, 0);
    rbx(sh, .13, .065, .13, C.jacket, sd * .012, .04, 0, [0, 0, sd * -.14], .03);            // كتف
    rbx(sh, .115, .32, .12, C.jacket, 0, -.145, 0, null, .05);
    const el = jt(sh, 0, -.27, 0);
    rbx(el, .1, .055, .1, C.jacket, 0, .0, 0, null, .025);
    rfru(el, .055, .048, .28, 1, C.jacket, 0, -.12, 0, null, .035);
    bx(el, .097, .03, .097, C.shirt, 0, -.255, 0);
    bx(el, .1, .012, .1, C.jacketD, 0, -.242, 0);
    const wr = jt(el, 0, -.26, 0);
    rbx(wr, .088, .085, .055, C.skin, 0, -.045, 0, null, .02);
    const fingers = [];
    for (let f = 0; f < 4; f++) {
      const L = .042 * (f === 1 ? 1.1 : f === 3 ? .85 : 1);
      const f1 = jt(wr, -.03 + f * .02, -.095, 0); bx(f1, .02, L, .032, C.skin, 0, -L / 2, 0);
      const f2 = jt(f1, 0, -L, 0); bx(f2, .019, L * .8, .03, C.skin, 0, -L * .4, 0);
      const f3 = jt(f2, 0, -L * .8, 0);
      fingers.push([f1, f2, f3]);
    }
    const t1 = jt(wr, -sd * .054, -.05, .015); t1.rotation.set(-.6, 0, -sd * .5);
    bx(t1, .025, .045, .028, C.skin, 0, -.022, 0);
    const t2 = jt(t1, 0, -.045, 0); bx(t2, .022, .035, .026, C.skin, 0, -.017, 0);
    arms[nm] = {sh, el, wr, fingers, thumb: [t1, t2]};
  }

  const blob = new T.Mesh(new T.CircleGeometry(.34, 14), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .025; blob.renderOrder = 1; root.add(blob);

  root.scale.setScalar(PSC);
  const st = {t: Math.random() * 10, blink: 2.5, blinkT: 0, land: 0, wasAir: false, pvy: 0, cw: cape.map(() => ({a: .1, v: 0, z: 0, zv: 0})), neutral: false, hip: 0, eyeTx: 0, eyeTy: 0, eyeNext: 1 + Math.random() * 2};
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st, hipY: HIP, sec, blob};
}

function makeSuitRig() {
  const P = PCFG, root = new T.Group();
  const dk = (hex, f) => new T.Color(hex).multiplyScalar(f);
  const RND = P.rounded === true;   // v2.16: حواف مدوّرة + تظليل ناعم (rounded:false يرجّع الشكل المكعّب القديم)
  const flat = (c, r = .8, m = 0) => new T.MeshStandardMaterial({color: c, roughness: r, metalness: m, flatShading: !RND});
  const jacketC = P.jacket || '#27324a', tieC = P.tie || '#c0392b';
  const C = {
    skin: flat(P.skin, .62), skinD: flat(P.skinD, .68), hair: flat(P.hair, .7),
    shirt: flat(P.shirt, .85), shirtD: flat(dk(P.shirt, .86), .88),
    jacket: flat(jacketC, .82), jacketD: flat(dk(jacketC, .72), .85),
    pants: flat(P.pants, .88), pantsD: flat(dk(P.pants, .8), .9),
    tie: flat(tieC, .7), tieD: flat(dk(tieC, .75), .75),
    boot: flat(P.shoes, .45, .1), sole: flat(0x15130f, .9), belt: flat(P.belt, .6), buckle: flat(0xd9b44a, .35, .65),
    dark: flat(0x22252b, .5, .3), glass: new T.MeshStandardMaterial({color: 0xbfe6ff, roughness: .1, metalness: .2, transparent: true, opacity: .28, flatShading: true}),
    eyeW: flat(0xfbfaf6, .25), iris: flat(P.iris, .3), pupil: flat(0x08080c, .25),
    lip: flat(0xb5645a, .6), mouthIn: flat(0x3a0f10, .8), cheek: flat(0xff8fa3, .9)
  };
  const jt = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const place = (m, par, x, y, z, rot) => { m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m; };
  const bx = (par, w, h, d, mt, x, y, z, rot) => place(new T.Mesh(new T.BoxGeometry(w, h, d), mt), par, x, y, z, rot);
  const fru = (par, aTop, aBot, h, dz, mt, x, y, z, rot) => {
    const g = new T.CylinderGeometry(aTop * 1.4142, aBot * 1.4142, h, 4); g.rotateY(Math.PI / 4);
    const m = new T.Mesh(g, mt); m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const rGeo = (w, h, d, r, tp) => {
    r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    const g = new T.BoxGeometry(w, h, d, 8, 8, 8), ps = g.attributes.position, nr = g.attributes.normal;
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new T.Vector3(), q = new T.Vector3();
    for (let i = 0; i < ps.count; i++) {
      v.fromBufferAttribute(ps, i);
      q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
      v.sub(q); const l = v.length();
      if (l > 1e-6) { v.multiplyScalar(1 / l); nr.setXYZ(i, v.x, v.y, v.z); ps.setXYZ(i, q.x + v.x * r, q.y + v.y * r, q.z + v.z * r); }
      if (tp) { const k = tp(ps.getY(i)); ps.setX(i, ps.getX(i) * k); ps.setZ(i, ps.getZ(i) * k); }
    }
    return g;
  };
  const rbx = (par, w, h, d, mt, x, y, z, rot, r) => !RND ? bx(par, w, h, d, mt, x, y, z, rot) : place(new T.Mesh(rGeo(w, h, d, r != null ? r : Math.min(w, h, d) * .32), mt), par, x, y, z, rot);
  const rfru = (par, aTop, aBot, h, dz, mt, x, y, z, rot, r) => {
    if (!RND) return fru(par, aTop, aBot, h, dz, mt, x, y, z, rot);
    const m = new T.Mesh(rGeo(2 * aTop, h, 2 * aTop, r != null ? r : .05, yy => (aBot + (aTop - aBot) * (yy + h / 2) / h) / aTop), mt);
    m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   // عين/قزحية بيضاوية بدل المستطيل
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .74, sec = [];
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .31, .14, .2, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .345, .12, .225, C.jacket, 0, .06, 0, null, .05);                                    // ذيل الجاكت
  bx(pelvis, .345, .02, .23, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .232, C.jacketD, 0, .06, 0);                                    // خط الضهر

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .32, .17, .215, C.jacket, 0, .085, 0, null, .06);
  const chest = jt(waist, 0, .17, 0);
  rfru(chest, .225, .195, .3, .74, C.jacket, 0, .15, 0, null, .075);                                // كتاف الجاكت (أعرض من فوق)
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      // القميص من قدام
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          // ياقة الجاكت (لابل)
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             // زراير
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  // منديل الجيب
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .27, .15);                                                  // الكرافتة (نابض)
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .065, .075, .08, C.skinD, 0, .02, 0, 6);
  cy(neck, .1, .115, .05, C.shirt, 0, .005, 0, 8);                                     // ياقة القميص
  for (const sd of [-1, 1]) bx(neck, .05, .05, .02, C.shirtD, sd * .035, -.01, .105, [.2, sd * .35, sd * .2]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        // سطح الوش الفعلي عند ارتفاع
  for (const sd of [-1, 1]) {
    rbx(head, .03, .075, .055, C.skinD, sd * (aTop + .002), .1, -.005, null, .013);                 // ودان (ملزوقة)
    bx(head, .04, .03, .012, C.cheek, sd * .112, .072, fz(.072) + .004);
  }
  rbx(head, .04, .045, .035, C.skinD, 0, .09, fz(.09) + .012, null, .014);                          // الأنف
  const brows = [];
  for (const sd of [-1, 1]) brows.push(rbx(head, .065, .016, .022, C.hair, sd * .07, .165, fz(.165) + .004, [0, 0, sd * -.14], .007));
  const lipU = rbx(head, .07, .012, .02, C.lip, 0, .052, fz(.05) + .005, null, .0058);
  const lipD = rbx(head, .055, .012, .02, C.lip, 0, .04, fz(.04) + .004, null, .0058);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, fz(.046) - .004);
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const ez = fz(.12), eg = jt(head, sd * .075, .12, ez);
    disc(eg, .044, .038, .022, C.eyeW, 0, 0, .002);
    disc(eg, .027, .031, .022, C.iris, 0, 0, .01);
    disc(eg, .015, .019, .022, C.pupil, 0, 0, .016);
    disc(eg, .0065, .0065, .022, C.eyeW, .011, .013, .022);
    eyes.push(eg);
    lids.push(disc(head, .047, .041, .028, C.skin, sd * .075, .12, ez + .005));
  }
  for (const l of lids) l.scale.y = .0001;
  const hs = P.hairStyle || 'short';
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    // فوق
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         // ورا
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     // جوانب
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      // غُرّة
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     // نظارة ملزوقة بالراس (الوش + الودان)
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          // دراع النظارة لحد الودن
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar(+P.headScale > 0 ? +P.headScale : 1.0);

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .17, .34, .185, C.pants, 0, -.16, 0, null, .07);
    bx(hip, .012, .3, .187, C.pantsD, 0, -.17, 0);                                     // كسرة البنطلون
    const knee = jt(hip, 0, -.34, 0);
    rfru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0, null, .045);
    const ank = jt(knee, 0, -.32, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      // طرف البنطلون
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    // كعب
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 // نعل
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    rbx(sh, .15, .07, .15, C.jacket, sd * .015, .045, 0, [0, 0, sd * -.14], .033);            // كتف
    rbx(sh, .13, .30, .135, C.jacket, 0, -.135, 0, null, .055);
    const el = jt(sh, 0, -.255, 0);
    rbx(el, .11, .055, .11, C.jacket, 0, .0, 0, null, .028);
    rfru(el, .062, .054, .26, 1, C.jacket, 0, -.11, 0, null, .04);
    bx(el, .108, .03, .108, C.shirt, 0, -.235, 0);
    bx(el, .112, .012, .112, C.jacketD, 0, -.222, 0);
    const wr = jt(el, 0, -.24, 0);
    rbx(wr, .095, .085, .06, C.skin, 0, -.045, 0, null, .022);
    const fingers = [];
    for (let f = 0; f < 4; f++) {
      const L = .042 * (f === 1 ? 1.1 : f === 3 ? .85 : 1);
      const f1 = jt(wr, -.03 + f * .02, -.095, 0); bx(f1, .02, L, .032, C.skin, 0, -L / 2, 0);
      const f2 = jt(f1, 0, -L, 0); bx(f2, .019, L * .8, .03, C.skin, 0, -L * .4, 0);
      const f3 = jt(f2, 0, -L * .8, 0);
      fingers.push([f1, f2, f3]);
    }
    const t1 = jt(wr, -sd * .054, -.05, .015); t1.rotation.set(-.6, 0, -sd * .5);
    bx(t1, .025, .045, .028, C.skin, 0, -.022, 0);
    const t2 = jt(t1, 0, -.045, 0); bx(t2, .022, .035, .026, C.skin, 0, -.017, 0);
    arms[nm] = {sh, el, wr, fingers, thumb: [t1, t2]};
  }

  const blob = new T.Mesh(new T.CircleGeometry(.34, 14), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .025; blob.renderOrder = 1; root.add(blob);

  root.scale.setScalar(PSC);
  const st = {t: Math.random() * 10, blink: 2.5, blinkT: 0, land: 0, wasAir: false, pvy: 0, cw: cape.map(() => ({a: .1, v: 0, z: 0, zv: 0})), neutral: false, hip: 0, eyeTx: 0, eyeTy: 0, eyeNext: 1 + Math.random() * 2};
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st, hipY: HIP, sec, blob};
}

/* ---------- شخصية «الجندي اللوباي» (v2.10) — نفس هيكل المفاصل بتاع makeRig عشان المشي/الأونلاين/السكربتات تشتغل زي ما هي ---------- */
function makeSoldierRig() {
  const P = PCFG, root = new T.Group();
  const dk = (hex, f) => new T.Color(hex).multiplyScalar(f);
  const flat = (c, r = .8, m = 0, extra) => new T.MeshStandardMaterial(Object.assign({color: c, roughness: r, metalness: m, flatShading: true}, extra || {}));
  const vestC = P.vest || '#4f5f2e', helmC = P.helmet || '#6a8040', gloveC = P.glove || '#33353a', scarfC = P.scarf || '#e0483c', packC = P.pack || '#9c8553';
  const C = {
    skin: flat(P.skin, .62), skinD: flat(P.skinD, .68), hair: flat(P.hair, .7),
    shirt: flat(P.shirt, .86), shirtD: flat(dk(P.shirt, .8), .88),
    pants: flat(P.pants, .88), pantsD: flat(dk(P.pants, .78), .9),
    vest: flat(vestC, .8), vestD: flat(dk(vestC, .68), .82),
    helm: flat(helmC, .72), helmD: flat(dk(helmC, .7), .78),
    glove: flat(gloveC, .7), gloveD: flat(dk(gloveC, .7), .72),
    boot: flat(P.shoes, .78), sole: flat(0x1c1a1a, .9),
    belt: flat(P.belt, .6), buckle: flat(0xd9b44a, .35, .65),
    scarf: flat(scarfC, .85), scarfD: flat(dk(scarfC, .72), .88),
    pack: flat(packC, .85), packD: flat(dk(packC, .72), .88), roll: flat(0x5b6f84, .85),
    metal: flat(0x7b8590, .35, .8), dark: flat(0x22252b, .6, .3),
    eyeW: flat(0xfbfaf6, .25), iris: flat(P.iris, .3), pupil: flat(0x08080c, .25),
    lip: flat(0xb5645a, .6), mouthIn: flat(0x3a0f10, .8), cheek: flat(0xff8fa3, .9),
    lens: new T.MeshStandardMaterial({color: 0x7fd6ff, emissive: 0x1f6f9c, emissiveIntensity: .55, roughness: .15, metalness: .3, flatShading: true})
  };
  const jt = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const place = (m, par, x, y, z, rot) => { m.position.set(x, y, z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m; };
  const bx = (par, w, h, d, mt, x, y, z, rot) => place(new T.Mesh(new T.BoxGeometry(w, h, d), mt), par, x, y, z, rot);
  const fru = (par, aTop, aBot, h, dz, mt, x, y, z, rot) => {
    const g = new T.CylinderGeometry(aTop * 1.4142, aBot * 1.4142, h, 4); g.rotateY(Math.PI / 4);
    const m = new T.Mesh(g, mt); m.scale.z = dz; return place(m, par, x, y, z, rot);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .74, sec = [];
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  bx(pelvis, .31, .14, .2, C.pants, 0, 0, 0);
  bx(pelvis, .33, .05, .22, C.belt, 0, .08, 0);
  bx(pelvis, .06, .045, .02, C.buckle, 0, .08, .112);
  for (const sd of [-1, 1]) {
    bx(pelvis, .075, .085, .06, C.vestD, sd * .13, .03, .12, [0, sd * .35, 0]);      // جيب خزنة على الحزام
    bx(pelvis, .08, .02, .065, C.vest, sd * .13, .08, .12, [0, sd * .35, 0]);
  }
  bx(pelvis, .06, .17, .09, C.belt, .21, -.09, .02);                                  // جراب المسدس
  bx(pelvis, .035, .06, .05, C.metal, .21, .0, .02);
  cy(pelvis, .055, .055, .1, C.packD, -.19, -.02, -.1, 8, [0, 0, 0]);                 // مطرة
  cy(pelvis, .03, .03, .02, C.metal, -.19, .04, -.1, 6);

  const waist = jt(pelvis, 0, .08, 0);
  bx(waist, .31, .17, .21, C.shirt, 0, .085, 0);
  const chest = jt(waist, 0, .17, 0);
  fru(chest, .22, .19, .3, .74, C.shirt, 0, .15, 0);                                  // الجذع (أعرض من فوق)
  bx(chest, .35, .27, .075, C.vest, 0, .135, .125);                                   // سترة تكتيكية قدام
  bx(chest, .34, .27, .06, C.vest, 0, .135, -.125);                                   // ورا
  for (let i = -1; i <= 1; i++) {                                                     // 3 جيوب خزن
    bx(chest, .085, .09, .055, C.vestD, i * .105, .06, .17);
    bx(chest, .09, .025, .06, C.vest, i * .105, .108, .172);
    bx(chest, .018, .03, .062, C.buckle, i * .105, .095, .175);
  }
  bx(chest, .07, .045, .012, C.scarf, .1, .22, .166);                                 // شارة
  bx(chest, .035, .035, .014, C.buckle, .1, .22, .171, [0, 0, Math.PI / 4]);
  for (const sd of [-1, 1]) bx(chest, .085, .03, .27, C.vestD, sd * .13, .305, 0, [0, 0, sd * -.08]);   // أحزمة الكتف
  bx(chest, .05, .09, .045, C.dark, -.17, .22, .13);
  const tags = jt(chest, 0, .3, .16);
  bx(tags, .012, .075, .008, C.metal, -.012, -.04, 0, [0, 0, .08]); bx(tags, .012, .075, .008, C.buckle, .014, -.045, .004, [0, 0, -.06]);
  spring(tags, {m: 1.3, sg: 1, k: 130, d: 7});

  const pack = jt(chest, 0, .09, -.2);
  bx(pack, .32, .26, .14, C.pack, 0, 0, 0);
  bx(pack, .3, .055, .16, C.packD, 0, .15, 0);
  bx(pack, .06, .16, .03, C.packD, -.1, .0, .085); bx(pack, .06, .16, .03, C.packD, .1, .0, .085);
  for (const sd of [-1, 1]) bx(pack, .06, .13, .1, C.packD, sd * .185, -.02, 0);
  cy(pack, .06, .06, .34, C.roll, 0, -.17, .0, 8, [0, 0, Math.PI / 2]);               // لفة النوم
  for (const sd of [-1, 1]) bx(pack, .018, .13, .13, C.belt, sd * .1, -.17, 0);
  spring(pack, {m: .45, sg: 1, k: 110, d: 9, ly: .012});
  const ant = jt(pack, .11, .16, -.02);                                                // هوائي
  cy(ant, .006, .009, .42, C.metal, 0, .21, 0, 5);
  place(new T.Mesh(new T.IcosahedronGeometry(.02, 0), C.scarf), ant, 0, .42, 0);
  spring(ant, {m: 1.9, sg: -1, k: 60, d: 4.2});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .065, .075, .08, C.skinD, 0, .02, 0, 6);
  cy(neck, .125, .145, .075, C.scarf, 0, .0, 0, 8);                                    // وشاح
  bx(neck, .075, .075, .07, C.scarfD, .04, -.015, .125, [0, 0, .5]);                   // عقدة الوشاح

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);                    // سطح الوش عند ارتفاع معيّن
  fru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0);
  for (const sd of [-1, 1]) {
    bx(head, .03, .075, .055, C.skinD, sd * (aTop - .012 + .018), .1, -.005);          // ودان
    bx(head, .03, .095, .07, C.hair, sd * (aTop - .006), .19, -.01);                   // سوالف
    bx(head, .04, .03, .012, C.cheek, sd * .112, .072, zAt(.072) * .96 + .004);        // خدود وردي
  }
  bx(head, .37, .1, .05, C.hair, 0, .2, -.17);                                         // شعر من ورا
  bx(head, .04, .045, .035, C.skinD, 0, .09, zAt(.09) * .96 + .012);                   // الأنف
  const brows = [];
  for (const sd of [-1, 1]) brows.push(bx(head, .065, .016, .022, C.hair, sd * .07, .165, zAt(.165) * .96 + .004, [0, 0, sd * -.14]));
  const lipU = bx(head, .07, .012, .02, C.lip, 0, .052, zAt(.05) * .96 + .005);
  const lipD = bx(head, .055, .012, .02, C.lip, 0, .04, zAt(.04) * .96 + .004);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, zAt(.046) * .96 - .004);                // جوّه الفم
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const ez = zAt(.12) * .96, eg = jt(head, sd * .075, .12, ez);
    bx(eg, .088, .076, .022, C.eyeW, 0, 0, .002);
    bx(eg, .052, .062, .022, C.iris, 0, 0, .01);
    bx(eg, .028, .04, .022, C.pupil, 0, 0, .016);
    bx(eg, .012, .012, .022, C.eyeW, .012, .014, .022);                                // لمعة
    eyes.push(eg);
    lids.push(bx(head, .094, .082, .028, C.skin, sd * .075, .12, ez + .005));
  }
  for (const l of lids) l.scale.y = .0001;
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, zAt(.01) * .96); bx(head, .11, .02, .03, C.hair, 0, .066, zAt(.066) * .96 + .012); }
  const helmJ = jt(head, 0, .0, 0);
  const dome = new T.Mesh(new T.SphereGeometry(.215, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), C.helm);
  dome.scale.set(1.02, .9, 1.02); place(dome, helmJ, 0, .22, -.005);
  cy(helmJ, .225, .235, .04, C.helmD, 0, .215, -.005, 8);                              // حافة
  cy(helmJ, .213, .219, .04, C.vestD, 0, .26, -.005, 8);                               // شريط النظارة
  for (const sd of [-1, 1]) {
    cy(helmJ, .052, .052, .04, C.metal, sd * .065, .262, .192, 8, [Math.PI / 2, 0, 0]);
    cy(helmJ, .04, .04, .045, C.lens, sd * .065, .262, .196, 8, [Math.PI / 2, 0, 0]);
    bx(helmJ, .012, .16, .02, C.belt, sd * .176, .13, .05, [0, 0, sd * .06]);          // حزام الدقن
  }
  bx(helmJ, .05, .05, .014, C.scarf, 0, .35, .19, [.45, 0, Math.PI / 4]);              // نجمة على الخوذة
  [[-.1, .365, .1], [.12, .36, .06], [-.05, .4, -.08], [.1, .37, -.1], [-.14, .33, -.06]].forEach(q => {
    const sp = new T.Mesh(new T.IcosahedronGeometry(.036, 0), C.helmD); sp.scale.set(1, .45, 1); place(sp, helmJ, q[0], q[1], q[2]);
  });
  head.scale.setScalar(+P.headScale > 0 ? +P.headScale : 1.0);                                                          // راس أكبر = شكل كرتوني أحلى

  const cape = []; let cp = jt(chest, 0, .335, -.135);
  for (let i = 0; i < 5; i++) {
    const w = .15 - i * .018, h = .08;
    bx(cp, w, h, .02, i % 2 ? C.scarfD : C.scarf, 0, -h / 2, 0);
    const nx = jt(cp, 0, -h, 0); cape.push(cp); cp = nx;
  }

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    bx(hip, .17, .34, .185, C.pants, 0, -.16, 0);
    bx(hip, .04, .12, .115, C.pantsD, sd * .105, -.14, 0);                             // جيب كارجو
    bx(hip, .045, .02, .12, C.vestD, sd * .105, -.1, 0);
    const knee = jt(hip, 0, -.34, 0);
    bx(knee, .145, .1, .06, C.vestD, 0, .0, .1);                                       // ركبية
    bx(knee, .12, .03, .065, C.vest, 0, .045, .1);
    fru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0);
    const ank = jt(knee, 0, -.32, 0);
    bx(ank, .16, .17, .175, C.boot, 0, .075, 0);                                       // رقبة الجزمة
    bx(ank, .175, .03, .19, C.sole, 0, .155, 0);                                       // حافة
    bx(ank, .07, .11, .012, C.pack, 0, .08, .09);                                      // رباط
    bx(ank, .16, .09, .17, C.boot, 0, -.015, .035);
    bx(ank, .15, .045, .07, C.sole, 0, -.04, -.075);                                   // كعب
    bx(ank, .17, .025, .29, C.sole, 0, -.0475, .045);                                  // نعل
    const toe = jt(ank, 0, -.02, .13);
    bx(toe, .16, .075, .1, C.boot, 0, .0, .045);
    bx(toe, .17, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    bx(sh, .16, .07, .16, C.vest, sd * .02, .045, 0, [0, 0, sd * -.18]);               // كتفية
    bx(sh, .17, .02, .17, C.vestD, sd * .03, .075, 0, [0, 0, sd * -.18]);
    bx(sh, .13, .30, .135, C.shirt, 0, -.135, 0);
    bx(sh, .145, .05, .15, C.shirtD, 0, -.27, 0);
    const el = jt(sh, 0, -.255, 0);
    bx(el, .12, .07, .12, C.skin, 0, .0, 0);
    bx(el, .115, .08, .06, C.vestD, 0, .0, -.07);
    fru(el, .062, .05, .26, 1, C.skin, 0, -.11, 0);
    bx(el, .11, .035, .11, C.dark, 0, -.205, 0); bx(el, .06, .03, .02, C.lens, 0, -.205, .058);   // ساعة
    const wr = jt(el, 0, -.24, 0);
    bx(wr, .105, .085, .065, C.glove, 0, -.045, 0);
    bx(wr, .1, .025, .07, C.gloveD, 0, -.095, 0);
    const fingers = [];
    for (let f = 0; f < 4; f++) {
      const L = .042 * (f === 1 ? 1.1 : f === 3 ? .85 : 1);
      const f1 = jt(wr, -.03 + f * .02, -.105, 0); bx(f1, .021, L, .034, C.glove, 0, -L / 2, 0);
      const f2 = jt(f1, 0, -L, 0); bx(f2, .02, L * .8, .032, C.glove, 0, -L * .4, 0);
      const f3 = jt(f2, 0, -L * .8, 0);
      fingers.push([f1, f2, f3]);
    }
    const t1 = jt(wr, -sd * .056, -.05, .015); t1.rotation.set(-.6, 0, -sd * .5);
    bx(t1, .026, .045, .03, C.glove, 0, -.022, 0);
    const t2 = jt(t1, 0, -.045, 0); bx(t2, .023, .035, .027, C.glove, 0, -.017, 0);
    arms[nm] = {sh, el, wr, fingers, thumb: [t1, t2]};
  }

  const blob = new T.Mesh(new T.CircleGeometry(.34, 14), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .025; blob.renderOrder = 1; root.add(blob);

  root.scale.setScalar(PSC);
  const st = {t: Math.random() * 10, blink: 2.5, blinkT: 0, land: 0, wasAir: false, pvy: 0, cw: cape.map(() => ({a: .1, v: 0, z: 0, zv: 0})), neutral: false, hip: 0, eyeTx: 0, eyeTy: 0, eyeNext: 1 + Math.random() * 2};
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st, hipY: HIP, sec, blob};
}

function makeRig() {
  if (PCFG.style === 'guy') return makeGuyRig();
  if (PCFG.style === 'suit') return PCFG.proportions === 'classic' ? makeSuitRig() : makeManRig();
  if (PCFG.style === 'soldier') return makeSoldierRig();
  const root = new T.Group();
  const M = (c, r = .6, m = .1, flat = false) => new T.MeshStandardMaterial({color: c, roughness: r, metalness: m, flatShading: flat});
  const C = {
    skin: M(PCFG.skin, .6, .02), skinD: M(PCFG.skinD, .7, .02), lip: M(0xb5645a, .55, 0), hair: M(PCFG.hair, .78, .06),
    eyeW: M(0xf4f1ea, .2, 0), iris: M(PCFG.iris, .25, .1), pupil: M(0x050505, .2, 0),
    cloth: M(PCFG.pants, .9, 0), clothL: M(PCFG.pants, .9, 0), shirt: M(PCFG.shirt, .92, 0), shirtD: M(PCFG.shirt, .92, 0),
    armor: M(0x4a586b, .32, .65, true), armorD: M(0x262d38, .42, .6, true), gold: M(PCFG.trim, .26, .85),
    leather: M(PCFG.belt, .62, .05), leatherD: M(PCFG.belt, .7, .05), rubber: M(PCFG.shoes, .85, .02), metal: M(0x8a929c, .28, .88),
    glass: M(0x1d6fa8, .1, .45),
    glow: new T.MeshStandardMaterial({color: 0x7fdfff, emissive: 0x2a9cff, emissiveIntensity: 1, roughness: .3}),
    cape: new T.MeshStandardMaterial({color: 0x8a232b, roughness: .82, metalness: .05, roughness: .78, side: T.DoubleSide}),
    capeD: new T.MeshStandardMaterial({color: 0x5e1519, roughness: .85, metalness: .04, roughness: .82, side: T.DoubleSide}),
    capeEdge: new T.MeshStandardMaterial({color: 0x3a0c10, roughness: .9, metalness: .08, roughness: .7, side: T.DoubleSide})
  };
  if (PCFG.style === 'lowpoly') {
    const lpMat = (c, r = .7) => new T.MeshStandardMaterial({color: c, roughness: r, metalness: 0, flatShading: true});
    C.skin = lpMat(PCFG.skin, .6); C.skinD = lpMat(PCFG.skinD, .65);
    C.shirt = C.shirtD = lpMat(PCFG.shirt, .8);
    C.cloth = C.clothL = lpMat(PCFG.pants, .85);
    C.leather = lpMat(PCFG.belt, .6); C.leatherD = lpMat(PCFG.belt, .7);
    C.rubber = lpMat(PCFG.shoes, .8); C.hair = lpMat(PCFG.hair, .7);
  }
  if (PCFG.style === 'realistic') {
    const bump = faceNoise();
    C.skin = new T.MeshPhysicalMaterial({color: PCFG.skin, roughness: .46, metalness: 0, clearcoat: .15, clearcoatRoughness: .4, bumpMap: bump, bumpScale: .03});
    C.skinD = new T.MeshPhysicalMaterial({color: PCFG.skinD, roughness: .55, bumpMap: bump, bumpScale: .03});
    C.shirt = C.shirtD = new T.MeshPhysicalMaterial({color: PCFG.shirt, roughness: .85, sheen: .5, sheenRoughness: .6, sheenColor: new T.Color(0xffffff), bumpMap: bump, bumpScale: .05});
    C.cloth = C.clothL = new T.MeshPhysicalMaterial({color: PCFG.pants, roughness: .9, sheen: .4, sheenRoughness: .7, bumpMap: bump, bumpScale: .05});
  }
  const jt = (par, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const put = (geo, mt, par, x = 0, y = 0, z = 0, sc, rot) => {
    const m = new T.Mesh(geo, mt); m.position.set(x, y, z);
    if (sc) m.scale.set(sc[0], sc[1], sc[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m;
  };
  const sph = (par, r, mt, x, y, z, sc, seg = 16) => put(new T.SphereGeometry(r, seg, Math.max(8, seg - 4)), mt, par, x, y, z, sc);
  const cyl = (par, rt, rb, h, mt, x, y, z, sc, seg = 16, rot) => put(new T.CylinderGeometry(rt, rb, h, seg), mt, par, x, y, z, sc, rot);
  const lim = (par, rt, rb, len, mt, seg = 14) => cyl(par, rt, rb, len, mt, 0, -len / 2, 0, null, seg);
  const bx = (par, w, h, d, mt, x, y, z, rot) => put(new T.BoxGeometry(w, h, d), mt, par, x, y, z, null, rot);

  const pelvis = jt(root, 0, .9, 0);
  sph(pelvis, .19, C.cloth, 0, -.03, 0, [1.12, .78, .86]);
  cyl(pelvis, .205, .2, .075, C.leather, 0, .075, 0, [1, 1, .8], 20);
  bx(pelvis, .075, .06, .03, C.gold, 0, .075, .172);                       // إبزيم
  bx(pelvis, .04, .035, .035, C.metal, 0, .075, .178);
  for (const sd of [-1, 1]) {
    bx(pelvis, .085, .12, .07, C.leatherD, sd * .165, .02, .1, [0, sd * .25, 0]);    // جيب الحزام
    bx(pelvis, .09, .035, .075, C.leather, sd * .165, .085, .1, [0, sd * .25, 0]);
    sph(pelvis, .012, C.gold, sd * .165, .075, .135, null, 8);
  }
  bx(pelvis, .075, .22, .05, C.leatherD, .205, -.1, .02);                    // جراب على الفخذ
  bx(pelvis, .06, .08, .045, C.metal, .205, .03, .02);
  bx(pelvis, .13, .11, .02, C.armorD, 0, -.06, .17, [.15, 0, 0]);            // حامي الحوض
  bx(pelvis, .06, .15, .02, C.armor, 0, -.085, .182, [.1, 0, 0]);

  const waist = jt(pelvis, 0, .1, 0);
  cyl(waist, .17, .19, .22, C.shirt, 0, .1, 0, [1, 1, .74], 18);
  for (let i = 0; i < 3; i++) bx(waist, .1, .012, .02, C.shirtD, 0, .06 + i * .06, .13);    // طيّات القميص
  const chest = jt(waist, 0, .2, 0);
  sph(chest, .235, C.shirt, 0, .11, 0, [1.02, 1.02, .72], 20);               // القفص الصدري
  sph(chest, .12, C.shirtD, -.1, .12, .08, [1, .9, .6], 12); sph(chest, .12, C.shirtD, .1, .12, .08, [1, .9, .6], 12);  // عضلة الصدر
  bx(chest, .36, .3, .055, C.armor, 0, .12, .17, [-.06, 0, 0]);              // درع الصدر الأمامي
  bx(chest, .12, .26, .06, C.armorD, 0, .12, .19, [-.06, 0, 0]);            // عمود الدرع
  for (const sd of [-1, 1]) {
    bx(chest, .15, .24, .04, C.armor, sd * .11, .15, .175, [-.06, sd * -.2, 0]);
    bx(chest, .07, .055, .04, C.leatherD, sd * .09, -.02, .2);               // جيوب مخازن
    bx(chest, .07, .02, .045, C.leather, sd * .09, .01, .205);
    sph(chest, .009, C.gold, sd * .09, .01, .23, null, 6);
  }
  cyl(chest, .035, .035, .012, C.gold, 0, .2, .225, null, 14, [Math.PI / 2, 0, 0]);   // شعار
  bx(chest, .34, .28, .05, C.armor, 0, .12, -.17, [.04, 0, 0]);              // درع الظهر
  bx(chest, .3, .05, .04, C.armorD, 0, .02, -.18);
  for (const sd of [-1, 1]) bx(chest, .06, .035, .26, C.leather, sd * .12, .24, 0, [0, 0, sd * .08]);   // أحزمة الكتف
  bx(chest, .3, .36, .14, C.leatherD, 0, .08, -.28);
  bx(chest, .26, .14, .05, C.leather, 0, .0, -.36);
  cyl(chest, .06, .06, .34, C.shirtD, 0, .3, -.26, null, 12, [0, 0, Math.PI / 2]);       // لفة نوم
  for (const sd of [-1, 1]) bx(chest, .03, .3, .02, C.leather, sd * .14, .1, -.2);
  cyl(chest, .1, .145, .07, C.armorD, 0, .28, 0, [1, 1, .9], 16);

  const neck = jt(chest, 0, .28, 0);
  cyl(neck, .058, .068, .12, C.skin, 0, .03, 0, null, 14);
  sph(neck, .02, C.skinD, 0, .0, .055, null, 8);
  const head = jt(neck, 0, .08, 0);
  sph(head, .118, C.skin, 0, .125, 0, [1, 1.1, 1.06], 22);                    // الجمجمة
  sph(head, .092, C.skin, 0, .035, .03, [1, .85, 1], 18);                      // الفك
  sph(head, .03, C.skin, 0, -.0, .085, [1.25, .7, .8], 12);                    // الذقن
  for (const sd of [-1, 1]) sph(head, .045, C.skin, sd * .068, .088, .075, [1, .9, .8], 10);   // الخدود
  put(new T.ConeGeometry(.02, .055, 8), C.skin, head, 0, .108, .125, [1, 1, 1], [Math.PI / 2 - .35, 0, 0]);  // الأنف
  sph(head, .016, C.skin, 0, .093, .128, [1.5, .8, 1], 8);
  bx(head, .012, .045, .014, C.skin, 0, .135, .112);                           // جسر الأنف
  const brows = [];
  for (const sd of [-1, 1]) {
    sph(head, .016, C.skinD, sd * .12, .115, -.005, [.5, 1.2, .9], 8);       // الودان
    brows.push(bx(head, .05, .009, .012, C.hair, sd * .042, .165, .113, [0, 0, sd * -.15]));   // الحواجب
  }
  const lipU = bx(head, .05, .01, .014, C.lip, 0, .052, .113), lipD = bx(head, .042, .008, .013, C.lip, 0, .04, .112);   // الشفايف
  bx(head, .09, .012, .01, C.skinD, 0, .03, .11, [.1, 0, 0]);
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const eg = jt(head, sd * .042, .142, .1);
    sph(eg, .022, C.eyeW, 0, 0, 0, [1, .85, .9], 12);
    const iris = sph(eg, .0125, C.iris, 0, 0, .016, [1, 1, .5], 10);
    sph(eg, .006, C.pupil, 0, 0, .0215, [1, 1, .4], 8);
    eyes.push(eg);
    const lid = sph(head, .0245, C.skinD, sd * .042, .142, .1, [1, .0001, .95], 10);
    lids.push(lid);
  }
  sph(head, .124, C.hair, 0, .145, -.025, [1.02, 1.0, 1.02], 18);
  const helm = put(new T.SphereGeometry(.14, 22, 12, 0, Math.PI * 2, 0, Math.PI * .47), C.armor, head, 0, .155, -.005, [1.06, 1.08, 1.12]);
  cyl(head, .152, .156, .014, C.armorD, 0, .192, -.005, [1.02, 1, 1.12], 22);
  bx(head, .03, .02, .24, C.armorD, 0, .285, -.005);                            // كرستة الخوذة
  for (const sd of [-1, 1]) {
    bx(head, .02, .1, .12, C.armorD, sd * .14, .155, -.01);                    // حماية الودان
    bx(head, .012, .08, .012, C.leather, sd * .1, .06, .06, [0, 0, sd * .15]);  // حزام الذقن
    cyl(head, .028, .028, .03, C.metal, sd * .15, .17, -.01, null, 10, [0, 0, Math.PI / 2]);
  }
  bx(head, .1, .012, .012, C.leather, 0, .0, .085);
  bx(head, .24, .05, .035, C.armorD, 0, .215, .13, [.15, 0, 0]);
  for (const sd of [-1, 1]) { cyl(head, .028, .028, .03, C.glass, sd * .06, .215, .15, null, 14, [Math.PI / 2 + .15, 0, 0]); cyl(head, .02, .02, .008, C.glow, sd * .06, .218, .167, null, 12, [Math.PI / 2 + .15, 0, 0]); }

  const cape = []; let cp = jt(chest, 0, .32, -.22);
  bx(cp, .52, .04, .06, C.gold, 0, 0, 0); // مشبك الكتف
  bx(cp, .48, .02, .04, C.metal, 0, -.01, .01);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const w = .50 + t * .12;
    const h = .14 + (i === 7 ? .04 : 0);
    const mt = i % 2 ? C.capeD : C.cape;
    bx(cp, w, h, .010 + t * .004, mt, 0, -h / 2, 0);
    if (i > 0) {
      bx(cp, .018, h * .92, .012, C.capeEdge, -w / 2 + .01, -h / 2, 0);
      bx(cp, .018, h * .92, .012, C.capeEdge,  w / 2 - .01, -h / 2, 0);
    }
    const nx = jt(cp, 0, -h, 0); cape.push(cp); cp = nx;
  }

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    sph(hip, .085, C.cloth, 0, 0, 0, null, 12);
    lim(hip, .098, .072, .4, C.cloth, 16);
    sph(hip, .085, C.cloth, 0, -.17, .015, [1, 2.1, 1.05], 14);               // عضلة الفخذ الأمامية
    sph(hip, .07, C.clothL, sd * -.01, -.16, -.04, [1, 1.9, .9], 12);          // الخلفية
    bx(hip, .1, .17, .03, C.armor, sd * .02, -.15, .095, [-.05, 0, 0]);        // درع الفخذ
    bx(hip, .1, .02, .035, C.armorD, sd * .02, -.07, .1);
    const knee = jt(hip, 0, -.4, 0);
    sph(knee, .068, C.armor, 0, 0, .0, [1, 1, .9], 12);
    bx(knee, .1, .09, .045, C.armor, 0, .0, .065, [-.1, 0, 0]);              // ركبية
    sph(knee, .012, C.gold, 0, .0, .092, null, 8);
    lim(knee, .068, .048, .38, C.cloth, 14);
    sph(knee, .06, C.cloth, 0, -.1, -.03, [1, 1.9, 1.1], 12);                 // السمانة
    bx(knee, .085, .24, .03, C.armor, 0, -.2, .06, [.03, 0, 0]);               // واقي الساق
    bx(knee, .09, .02, .035, C.armorD, 0, -.085, .066);
    bx(knee, .09, .02, .035, C.armorD, 0, -.31, .056);
    const ank = jt(knee, 0, -.38, 0);
    sph(ank, .05, C.leather, 0, 0, 0, null, 10);
    cyl(ank, .065, .06, .14, C.leather, 0, .015, 0, null, 14);                // رقبة الجزمة
    cyl(ank, .068, .068, .02, C.armorD, 0, .075, 0, null, 14);
    for (let i = 0; i < 4; i++) bx(ank, .06, .008, .012, C.gold, 0, .05 - i * .028, .066, [.3, 0, 0]);   // رباط
    bx(ank, .115, .075, .17, C.leather, 0, -.05, .045);                        // مقدمة الجزمة
    bx(ank, .1, .04, .07, C.leatherD, 0, -.06, -.075);                          // الكعب
    bx(ank, .125, .03, .31, C.rubber, 0, -.098, .04);                            // النعل
    bx(ank, .125, .045, .05, C.rubber, 0, -.088, -.1);
    const toe = jt(ank, 0, -.075, .12);
    bx(toe, .113, .06, .09, C.leather, 0, .015, .045);
    bx(toe, .115, .035, .075, C.armorD, 0, .045, .045);                      // رأس معدن
    bx(toe, .125, .028, .1, C.rubber, 0, -.025, .04);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .27, .22, 0);
    sph(sh, .082, C.shirt, 0, 0, 0, [1, .9, 1], 12);
    sph(sh, .105, C.armor, sd * .02, .04, 0, [1.1, .5, 1.1], 14);              // كتفية
    cyl(sh, .085, .095, .02, C.gold, sd * .02, .015, 0, [1, 1, 1], 16);
    bx(sh, .02, .05, .1, C.armorD, sd * .09, .0, 0);
    lim(sh, .068, .055, .32, C.shirt, 14);
    sph(sh, .058, C.shirt, 0, -.12, .01, [1, 1.7, 1.05], 12);
    cyl(sh, .06, .06, .022, C.shirtD, 0, -.24, 0, null, 14);
    const el = jt(sh, 0, -.275, 0);
    sph(el, .058, C.skin, 0, 0, 0, null, 10);
    sph(el, .055, C.armor, 0, .0, -.02, [1, 1, .7], 10);
    lim(el, .05, .038, .28, C.skin, 14);
    sph(el, .05, C.skin, 0, -.07, .005, [1, 1.5, 1.05], 10);
    cyl(el, .056, .05, .15, C.armor, 0, -.12, 0, null, 12);                    // ساعد مدرع
    cyl(el, .058, .058, .018, C.gold, 0, -.19, 0, null, 14);
    bx(el, .07, .04, .015, C.glow, 0, -.1, .055);
    const wr = jt(el, 0, -.26, 0);
    sph(wr, .035, C.leather, 0, 0, 0, null, 8);
    bx(wr, .085, .09, .04, C.leatherD, 0, -.05, 0);                              // كف القفاز
    bx(wr, .075, .03, .045, C.armorD, 0, -.095, .005);                           // واقي المفاصل
    bx(wr, .07, .025, .042, C.leather, 0, -.005, 0);
    const fingers = [];
    for (let f = 0; f < 4; f++) {
      const L = [.036, .03, .026][0] * (f === 1 ? 1.1 : f === 3 ? .85 : 1);
      const f1 = jt(wr, -.03 + f * .02, -.105, 0); bx(f1, .019, L, .024, C.leather, 0, -L / 2, 0); sph(f1, .011, C.leatherD, 0, 0, 0, null, 6);
      const f2 = jt(f1, 0, -L, 0); bx(f2, .018, L * .85, .022, C.leather, 0, -L * .425, 0); sph(f2, .01, C.leatherD, 0, 0, 0, null, 6);
      const f3 = jt(f2, 0, -L * .85, 0); bx(f3, .017, L * .7, .02, C.leather, 0, -L * .35, 0);
      fingers.push([f1, f2, f3]);
    }
    const t1 = jt(wr, -sd * .042, -.05, .015); t1.rotation.set(-.6, 0, -sd * .5);
    bx(t1, .022, .04, .025, C.leather, 0, -.02, 0);
    const t2 = jt(t1, 0, -.04, 0); bx(t2, .02, .035, .022, C.leather, 0, -.017, 0);
    arms[nm] = {sh, el, wr, fingers, thumb: [t1, t2]};
  }
  if (PCFG.style === 'realistic' || PCFG.style === 'lowpoly') {
    root.traverse(o => {
      if (o.isMesh && (o.material === C.armor || o.material === C.armorD || o.material === C.glow || o.material === C.glass || o.material === C.capeEdge)) o.visible = false;
    });
    if (cape[0]) cape[0].visible = false;
    if (PCFG.hairStyle === 'long') { const hl = new T.Mesh(new T.SphereGeometry(.15, 28, 20), C.hair); hl.scale.set(1, 1.9, .85); hl.position.set(0, -.05, -.06); head.add(hl); }
    if (PCFG.beard) { const bd = new T.Mesh(new T.SphereGeometry(.088, 24, 16), C.hair); bd.scale.set(1.1, .75, .95); bd.position.set(0, .0, .035); head.add(bd); }
  }
  if (PCFG.style === 'lowpoly') {
    const bun = new T.Mesh(new T.OctahedronGeometry(.085, 0), C.hair); bun.position.set(0, .215, -.02); head.add(bun);
    const bunB = new T.Mesh(new T.OctahedronGeometry(.06, 0), C.hair); bunB.position.set(0, .275, -.03); head.add(bunB);
    const cheekM = new T.MeshStandardMaterial({color: 0xff7f9c, roughness: .9, flatShading: true});
    for (const sd of [-1, 1]) { const ch = new T.Mesh(new T.OctahedronGeometry(.032, 0), cheekM); ch.position.set(sd * .088, -.02, .105); ch.scale.set(1.2, .7, .4); head.add(ch); }
    head.scale.setScalar(1.22);
  }
  if (PCFG.style === 'abaya') {
    const abM = new T.MeshStandardMaterial({color: PCFG.abaya, roughness: .92, metalness: 0, side: T.DoubleSide});
    root.traverse(o => {   // إخفاء الدروع والخوذة والأضواء
      if (o.isMesh && (o.material === C.armor || o.material === C.armorD || o.material === C.glow || o.material === C.glass || o.material === C.capeEdge)) o.visible = false;
    });
    if (cape[0]) cape[0].visible = false;                     // الكاب الخلفي يُستبدل بالعباءة
    if (PCFG.hood) {                                          // الحجاب
      const hd = new T.Mesh(new T.SphereGeometry(.135, 24, 14, 0, Math.PI * 2, 0, Math.PI * .55), abM);
      hd.position.set(0, .2, -.05); hd.scale.set(1.06, 1.12, 1.1); head.add(hd);
    }
    const robe = new T.Mesh(new T.CylinderGeometry(.22, .5, 1.0, 40, 1, true), abM);   // العباءة من الخصر للأرض
    robe.position.set(0, -.4, 0); robe.castShadow = true; pelvis.add(robe);
    const hem = new T.Mesh(new T.TorusGeometry(.5, .018, 8, 56), M(PCFG.trim, .3, .6)); // حاشية ذهبية
    hem.rotation.x = Math.PI / 2; hem.position.set(0, -.9, 0); pelvis.add(hem);
  }
  root.scale.setScalar(PSC);
  const st = {t: Math.random() * 10, blink: 2.5, blinkT: 0, land: 0, wasAir: false, pvy: 0, cw: cape.map(() => ({a: .1, v: 0, z: 0, zv: 0})), neutral: false, hip: 0, eyeTx: 0, eyeTy: 0, eyeNext: 1 + Math.random() * 2};
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st};
}

function jkey(name) {
  const k = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  const Rs = /right|^r/.test(k), Ls = /left|^l/.test(k);
  if (/fore|elbow|hand|wrist/.test(k)) return Rs ? 'rForearm' : Ls ? 'lForearm' : null;
  if (/arm|shoulder/.test(k)) return Rs ? 'rArm' : Ls ? 'lArm' : null;
  if (/shin|knee|calf/.test(k)) return Rs ? 'rShin' : Ls ? 'lShin' : null;
  if (/foot|ankle|boot/.test(k)) return Rs ? 'rFoot' : Ls ? 'lFoot' : null;
  if (/leg|thigh|hip/.test(k)) return Rs ? 'rLeg' : Ls ? 'lLeg' : null;
  if (/spine|chest|torso|waist|pelvis/.test(k)) return 'spine';
  if (/head|neck/.test(k)) return 'head';
  return null;
}
function jointOf(rig, key) {
  if (!rig) return null;
  switch (key) {
    case 'rArm': return rig.AR.sh; case 'rForearm': return rig.AR.el;
    case 'lArm': return rig.AL.sh; case 'lForearm': return rig.AL.el;
    case 'rLeg': return rig.R.hip; case 'rShin': return rig.R.knee; case 'rFoot': return rig.R.ankle;
    case 'lLeg': return rig.L.hip; case 'lShin': return rig.L.knee; case 'lFoot': return rig.L.ankle;
    case 'spine': return rig.waist; case 'head': return rig.head;
  }
  return null;
}
const _lerp = (a, b, k) => a + (b - a) * k;
function rigNeutral(rig) {
  const st = rig.st; if (st.neutral) return; st.neutral = true;
  rig.pelvis.position.y = rig.hipY || .9; rig.pelvis.rotation.set(0, 0, 0);
  if (rig.sec) for (const e of rig.sec) { e.o.rotation.x = e.rx; e.o.rotation.z = e.rz; e.o.position.y = e.py; if (e.s) e.s.a = e.s.v = e.s.z = e.s.zv = 0; } rig.chest.rotation.set(0, 0, 0); rig.chest.scale.set(1, 1, 1);
  rig.neck.rotation.set(0, 0, 0);
  for (const sd of [rig.L, rig.R]) sd.toe.rotation.set(0, 0, 0);
  for (const a of [rig.AL, rig.AR]) { a.wr.rotation.set(0, 0, 0); for (const f of a.fingers) { f[0].rotation.x = .25; f[1].rotation.x = .35; f[2].rotation.x = .3; } }
  for (const l of rig.lids) l.scale.y = .0001;
}
function animRig(rig, dt, s, locks) {
  const st = rig.st; st.neutral = false; st.t += dt;
  const k = Math.min(1, dt * 16), kS = Math.min(1, dt * 9), kF = Math.min(1, dt * 24), t = st.t;
  const run = s.run, air = s.air;
  const stride = s.moving ? (run ? 1 : .45 + .5 * s.sf) : 0;
  const ph = s.ph, sL = Math.sin(ph), sR = -sL, cL = Math.cos(ph), cR = -cL;
  if (st.wasAir && !air) st.land = Math.min(1, Math.max(st.land, (-st.pvy - 4) / 20));
  st.wasAir = air; st.pvy = s.vy; st.land = Math.max(0, st.land - dt * 3.4);
  const land = clamp(st.land * 1.4, 0, 1);
  const lock = key => locks && locks.has(key);
  const set = (key, o, x, y, z, kk) => { if (key && lock(key)) return; o.rotation.x = _lerp(o.rotation.x, x, kk || k); o.rotation.y = _lerp(o.rotation.y, y, kk || k); o.rotation.z = _lerp(o.rotation.z, z, kk || k); };
  const fall = air ? clamp(-s.vy / 14, -1, 1) : 0;        // +1 سقوط / -1 صعود
  const legPose = (c, sn) => {
    if (air) {
      const up = 1 - Math.max(0, fall);
      return c === 0 ? {hip: -.55 * up - .15, knee: .95 * up + .25, ank: .3, toe: .4} : {hip: .22 - .1 * fall, knee: .45 + .2 * up, ank: .1, toe: .25};
    }
    const amp = run ? 1.0 : .52 + .12 * s.sf, sw = Math.max(0, Math.cos(c === 0 ? ph : ph + Math.PI));
    const hip = -amp * sn * stride + .02;
    const knee = stride * ((run ? .22 : .12) + (run ? 1.15 : .6) * Math.pow(sw, 1.2)) + land * .9;
    const back = Math.max(0, -sn);
    return {hip: hip - land * .5, knee, ank: -(hip + knee) * .72 + back * stride * .25, toe: (stride ? -back * .55 * stride + sw * .25 * stride : 0)};
  };
  const lp = legPose(0, sL), rp = legPose(1, sR);
  set('lLeg', rig.L.hip, lp.hip, 0, .02, k); set('lShin', rig.L.knee, lp.knee, 0, 0, k); set('lFoot', rig.L.ankle, lp.ank, 0, 0, k);
  set('rLeg', rig.R.hip, rp.hip, 0, -.02, k); set('rShin', rig.R.knee, rp.knee, 0, 0, k); set('rFoot', rig.R.ankle, rp.ank, 0, 0, k);
  rig.L.toe.rotation.x = _lerp(rig.L.toe.rotation.x, lp.toe, k); rig.R.toe.rotation.x = _lerp(rig.R.toe.rotation.x, rp.toe, k);
  const lean = air ? .1 + .12 * Math.max(0, -fall) : (s.moving ? (run ? .2 : .06 + .05 * s.sf) * stride + clamp(-s.az * .006, -.06, .1) : 0) + land * .15;
  const turnRoll = clamp(-s.turn * .028 * Math.min(1, s.hv / 5), -.16, .16);
  const bob = air ? 0 : .036 * stride * (Math.cos(2 * ph) - 1) - land * .17 + Math.sin(t * 1.6) * .002;
  const sway = air ? 0 : .045 * stride * Math.sin(ph);
  const idle = s.moving ? 0 : 1, wsh = Math.sin(t * .45) * .022 * idle, br = Math.sin(t * 1.7);
  rig.pelvis.position.y = _lerp(rig.pelvis.position.y, (rig.hipY || .9) + bob, kF);
  rig.pelvis.rotation.y = _lerp(rig.pelvis.rotation.y, air ? 0 : .2 * stride * sL, k);
  rig.pelvis.rotation.z = _lerp(rig.pelvis.rotation.z, sway + wsh + turnRoll * .5, k);
  rig.pelvis.rotation.x = _lerp(rig.pelvis.rotation.x, lean * .25 + land * .12, k);
  set('spine', rig.waist, lean * .45 + br * .006, air ? 0 : -.14 * stride * sL, -sway * .6 - wsh * .8 + turnRoll * .4, k);
  rig.chest.rotation.x = _lerp(rig.chest.rotation.x, lean * .45 - .02 * br * idle, k);
  rig.chest.rotation.y = _lerp(rig.chest.rotation.y, air ? 0 : -.2 * stride * sL, k);
  rig.chest.rotation.z = _lerp(rig.chest.rotation.z, -sway * .5 + turnRoll * .3, k);
  rig.chest.scale.y = 1 + .014 * br; rig.chest.scale.z = 1 + .02 * br;
  const tgt = clamp(s.camRel * (s.moving ? .25 : .5), -.9, .9);
  const hp = -lean * .85 + clamp((s.camPitch - .35) * .5, -.4, .4) + land * .1;
  set('head', rig.head, hp, tgt, -turnRoll * .5, kS);
  if (s.local) {
    VoiceChat.tick();
    const sh = VoiceChat.headShakeAmount();
    if (sh > 0.0005) {
      const tt = performance.now() * 0.045;
      rig.head.rotation.y += Math.sin(tt * 1.7) * sh;
      rig.head.rotation.x += Math.sin(tt * 2.3) * sh * 0.7;
    }
  }
  rig.neck.rotation.x = _lerp(rig.neck.rotation.x, -lean * .15, k); rig.neck.rotation.y = _lerp(rig.neck.rotation.y, tgt * .25, kS);
  if (s.local) {
    st.eyeNext = (st.eyeNext != null ? st.eyeNext : 1) - dt;
    if (st.eyeNext <= 0) {
      const idle = !s.moving && Math.abs(s.camRel || 0) < 0.08;
      if (idle && Math.random() < 0.72) {
        st.eyeTx = (Math.random() - 0.5) * 0.38;
        st.eyeTy = (Math.random() - 0.5) * 0.2;
        st.eyeNext = 0.55 + Math.random() * 2.2;
      } else {
        st.eyeTx = 0; st.eyeTy = 0;
        st.eyeNext = 1.2 + Math.random() * 2.8;
      }
    }
  }
  const erBase = clamp((s.camRel || 0) * .5 - tgt, -.28, .28);
  const er = erBase + (st.eyeTx || 0);
  const ex = -hp * .4 + (st.eyeTy || 0);
  const kEye = Math.min(1, dt * 14);
  for (const e of rig.eyes) { e.rotation.y = _lerp(e.rotation.y, er, kEye); e.rotation.x = _lerp(e.rotation.x, ex, kEye); }
  st.blink -= dt;
  if (st.blink <= 0) {
    st.blinkT = .13 + Math.random() * .04;
    st.blink = (Math.random() < 0.18 ? 0.18 : (2.2 + Math.random() * 3.8));
  }
  st.blinkT = Math.max(0, st.blinkT - dt);
  const bl = st.blinkT > 0 ? Math.sin((1 - st.blinkT / .15) * Math.PI) : 0;
  for (const l of rig.lids) l.scale.y = .0001 + bl * .95;
  if (s.local) applyFace(rig, localFace(rig), dt);
  const aA = run ? 1.0 : .6 * (.5 + .5 * s.sf);
  const arm = (a, sn, sd, kyL, kyF) => {
    let x, z, el, yw = 0;
    if (air) { x = -.5 - .6 * Math.max(0, -fall) - .25 * Math.max(0, fall); z = sd * (.55 + .5 * Math.max(0, fall)); el = -.45; }
    else if (s.moving) { x = aA * sn * stride; z = sd * (.07 + .05 * stride); el = -(run ? 1.05 : .5) * stride - .1 - .35 * Math.max(0, -sn) * stride * (run ? 1 : .4); yw = -sd * .06 * stride; }
    else { x = .04 + Math.sin(t * 1.7 + (sd > 0 ? 0 : .6)) * .012; z = sd * (.09 + .01 * br); el = -.16 + wsh; }
    set(kyL, a.sh, x - land * .35, yw, z, k); set(kyF, a.el, el - land * .4, 0, 0, k);
    const curl = air ? .7 : s.moving ? (run ? .95 : .55) : .3 + .04 * br;
    a.wr.rotation.x = _lerp(a.wr.rotation.x, s.moving ? -.12 : -.05, k);
    for (let f = 0; f < 4; f++) { const c = curl * (1 + (f - 1.5) * .06), F = a.fingers[f]; F[0].rotation.x = _lerp(F[0].rotation.x, c * .7, kF); F[1].rotation.x = _lerp(F[1].rotation.x, c * 1.0, kF); F[2].rotation.x = _lerp(F[2].rotation.x, c * .75, kF); }
    a.thumb[0].rotation.x = _lerp(a.thumb[0].rotation.x, -.6 + curl * .25, kF); a.thumb[1].rotation.x = _lerp(a.thumb[1].rotation.x, curl * .5, kF);
  };
  arm(rig.AL, sL, -1, 'lArm', 'lForearm'); arm(rig.AR, sR, 1, 'rArm', 'rForearm');
  const nC = Math.max(1, rig.cape.length);
  const base = clamp(s.fz * .055 + Math.max(0, -s.vy) * .028 + (s.moving ? .12 : .025) + Math.min(1, s.hv / 8) * .14, -.25, 1.45);
  const side = clamp(-s.fx * .05 - s.turn * .08, -.75, .75);
  const wind = Math.sin(t * 2.1) * .012 + Math.sin(t * 5.3) * .006;
  for (let i = 0; i < nC; i++) {
    const c = st.cw[i] || (st.cw[i] = {a: .08, v: 0, z: 0, zv: 0});
    const lag = .35 + .09 * i;                 // القطع السفلية تتأخر أكثر
    const fl = (Math.sin(t * 6.5 + i * 1.15) * .04 + Math.sin(t * 1.7 + i * .7) * .015) * Math.min(1.2, s.hv / 5 + .3);
    const tx = base * lag + fl + wind * (1 + i * .08);
    const tz = side * (.4 + .12 * i) + Math.sin(t * 3.2 + i) * .008;
    const stiff = 95 - i * 4;                   // القطع العلوية أصلب
    const damp = Math.exp(-(7.5 + i * .35) * dt);
    c.v += (tx - c.a) * stiff * dt; c.v *= damp; c.a += c.v * dt;
    c.zv += (tz - c.z) * stiff * dt; c.zv *= damp; c.z += c.zv * dt;
    const ax = clamp(c.a, -.55, 1.55) * (i === 0 ? 1 : .85);
    const az = clamp(c.z, -.8, .8) * (i === 0 ? .55 : .92);
    rig.cape[i].rotation.x = ax;
    rig.cape[i].rotation.z = az;
    rig.cape[i].rotation.y = Math.sin(t * 1.4 + i * .9) * .015 * Math.min(1, s.hv / 7);
  }
  if (rig.sec) {
    const dts = Math.min(dt, .05);
    for (const e of rig.sec) {
      const S2 = e.s || (e.s = {a: 0, v: 0, z: 0, zv: 0}), m = e.m;
      const tx = (s.fz * .045 + (s.moving ? .06 + Math.min(1, s.hv / 8) * .14 : 0) + (air ? -clamp(s.vy / 18, -1, 1) * .5 : 0)) * m * e.sg;
      const tz = clamp(-s.fx * .04 - s.turn * .05, -.7, .7) * m;
      const dmp = Math.exp(-e.d * dts);
      S2.v += (tx - S2.a) * e.k * dts; S2.v *= dmp; S2.a += S2.v * dts;
      S2.zv += (tz - S2.z) * e.k * dts; S2.zv *= dmp; S2.z += S2.zv * dts;
      const step = (!air && s.moving) ? Math.sin(2 * ph) * .03 * stride * m * e.sg : 0;   // كل خطوة بترجّ الحاجة
      e.o.rotation.x = e.rx + clamp(S2.a, e.lo != null ? e.lo : -1.1, e.hi != null ? e.hi : 1.1) + step;
      e.o.rotation.z = e.rz + clamp(S2.z, -.8, .8);
      if (e.ly) e.o.position.y = e.py - land * e.ly;
    }
  }
  if (rig.blob) { const bm = rig.blob.material; bm.opacity = _lerp(bm.opacity, air ? .1 : .34, Math.min(1, dt * 10)); }
}

function respawnP() {
  const rt = RT; if (!rt) return;
  const o = rt.cur || rt.rs[0];
  if (o) rt.p.set(o.pos[0], o.pos[1] + .02, o.pos[2]); else rt.p.set(0, .02, 0);
  rt.v.set(0, 0, 0); rt.gnd = null; rt.gr = false; rt.hold = false;
}
function say(t, ms) { if (RT) { RT.msg = t; RT.msgT = (ms || 2500) / 1000; } }
function fail(n, e) { const m = `${n}: ${e && e.message || e}`; S.err.push(m); say('⚠ ' + m, 4000); console.error(m); }
const CELL = 6;
function aabb(m) {
  const e = m.matrix.elements;
  const hx = .5 * (Math.abs(e[0]) + Math.abs(e[4]) + Math.abs(e[8])), hy = .5 * (Math.abs(e[1]) + Math.abs(e[5]) + Math.abs(e[9])), hz = .5 * (Math.abs(e[2]) + Math.abs(e[6]) + Math.abs(e[10]));
  return {x0: e[12] - hx, x1: e[12] + hx, y0: e[13] - hy, y1: e[13] + hy, z0: e[14] - hz, z1: e[14] + hz, cx: e[12], cy: e[13], cz: e[14]};
}
const _bb = new T.Box3();
function aabbBox(m) {   // للكائنات البرمجية الكبيرة: الصندوق الحقيقي من الهندسة
  _bb.setFromObject(m); const b = _bb;
  return {x0: b.min.x, x1: b.max.x, y0: b.min.y, y1: b.max.y, z0: b.min.z, z1: b.max.z, cx: (b.min.x + b.max.x) / 2, cy: (b.min.y + b.max.y) / 2, cz: (b.min.z + b.max.z) / 2};
}
function hadd(b) {
  for (let x = Math.floor(b.x0 / CELL); x <= Math.floor(b.x1 / CELL); x++) for (let z = Math.floor(b.z0 / CELL); z <= Math.floor(b.z1 / CELL); z++) {
    const k = x * 100003 + z; let a = RT.hash.get(k); if (!a) RT.hash.set(k, a = []); a.push(b);
  }
}

/* ---------- واجهة Game للمحرك الكبير ---------- */
function bigGame(rt, o, root) {
  const G2 = {
    THREE: T, scene,
    get params() { return o.p; },
    defineParams(list) { for (const e of list || []) if (e && e.key && o.p[e.key] === undefined) o.p[e.key] = e.value; },
    onUpdate(fn) { if (typeof fn === 'function') rt.ups.push(fn); },
    isKeyDown: c => keyDown(c),
    getMyName: () => (NetMP.on ? ('p' + NetMP.slot + '_' + (NetMP.name || 'player')) : 'local'),
    getPlayerId: () => (NetMP.on ? NetMP.slot : 0),
    getLocalPlayer: () => rt.pl,
    getPlayerForward: () => ({x: Math.sin(rt.ang), z: Math.cos(rt.ang)}),
    setPlayerPosition: (i, x, y, z, opt) => {
      if (i != null && i !== 0 && NetMP.on && +i !== NetMP.slot) return;
      rt.p.set(x, y, z); rt.v.set(0, 0, 0); if (opt && opt.hold) rt.hold = true;
    },
    teleportPlayer: (i, x, y, z, opt) => { rt.p.set(x, y, z); rt.v.set(0, 0, 0); if (opt && opt.yaw != null) rt.ang = opt.yaw; },
    setPlayerYaw: (i, yaw) => { rt.ang = yaw; },
    holdPlayerPosition: (i, b) => { rt.hold = !!b; if (!b) rt.v.set(0, 0, 0); },
    lockPlayer: (i, b) => { rt.locked = !!b; if (b) rt.v.set(0, 0, 0); },
    lockPlayerAnim: () => { rt.animLock = true; },
    unlockPlayerAnim: () => { rt.animLock = false; rt.sit = false; rt.sitLimbs = null; rt.rideSc = 0; },
    getPlayerDims: (i, sc) => measurePlayer(rt.rig, sc),
    getRideScale: () => RIDE_SC,
    setRideScale: s => { s = +s; if (s > .3 && s < 2.5) RIDE_SC = s; },
    seatPlayer: (i, x, y, z, opt) => {
      if (i != null && i !== 0 && NetMP.on && +i !== NetMP.slot) return false;
      return seatPlayerRT(rt, x, y, z, opt);
    },
    unseatPlayer: (i, x, y, z) => { unseatPlayerRT(rt, x, y, z); },
    setPlayerLimb: (i, name, rx, ry, rz, opt) => {
      const key = jkey(name), j = key && jointOf(rt.rig, key); if (!j) return;
      j.rotation.set(rx || 0, ry || 0, rz || 0);
      if (opt && opt.lock) rt.locks.add(key); else if (opt && opt.lock === false) rt.locks.delete(key);
    },
    getBone: (i, name) => { const key = jkey(name); return key ? jointOf(rt.rig, key) : null; },
    setCamera: (i, cfg) => { rt.cam = cfg || null; },
    clearCamera: () => { rt.cam = null; },
    subtitle: t => { if (t) say(String(t), 4000); else rt.msgT = 0; },
    touch: TouchUI.api(),
    forcePlayerInput(slot, inp) {
      applyInputMap(inp);
    },
    setKey(code, down) { setVirtualKey(code, !!down); },
    key: c => keyDown(c),
    isKeyDown: c => keyDown(c),
    setPlayerYaw(slot, yaw) { if (RT) { RT.yaw = +yaw || 0; RT.ang = +yaw || 0; } },
    random: Math.random, find: n => rt.byName.get(n) || null,
    get coords() { return { x: +rt.p.x.toFixed(3), y: +rt.p.y.toFixed(3), z: +rt.p.z.toFixed(3) }; },
    getCoord(axis) { const c = {x: rt.p.x, y: rt.p.y, z: rt.p.z}; return axis ? c[axis] : c; },
    player: {
      get position() { return rt.p; }, get velocity() { return rt.v; }, get grounded() { return rt.gr; },
      get mesh() { return rt.rig.root; }, get yaw() { return rt.yaw; }, set yaw(v) { rt.yaw = v; },
      get pitch() { return RT && RT.pitch; }, set pitch(v) { if (RT) RT.pitch = v; },
      setSpeed(mul) { rt.speedMul = mul; },
      setColor(hex) { try { rt.rig.root.traverse(x => { if (x.isMesh && x.material && x.material.color) x.material.color.set(hex); }); } catch (_) {} },
      hideCape(v) { if (rt.rig.cape) rt.rig.cape.forEach(c => { c.visible = !v; }); },
      setLimb(name, rx, ry, rz) { const j = jointOf(rt.rig, jkey(name)); if (j) j.rotation.set(rx || 0, ry || 0, rz || 0); }
    },
    touch: TouchUI.api(),
    getPlayerDims: sc => measurePlayer(rt.rig, sc),
    seatPlayer: (x, y, z, opt) => seatPlayerRT(rt, x, y, z, opt),
    unseatPlayer: (x, y, z) => unseatPlayerRT(rt, x, y, z),
    setHud(html) {
      let el = document.getElementById('hawaScriptHud');
      if (!el) {
        el = document.createElement('div');
        el.id = 'hawaScriptHud';
        el.setAttribute('data-script-ui', '1');
        el.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:50;pointer-events:none;max-width:min(420px,90vw);font:13px/1.4 system-ui,sans-serif;color:#e8f0ff;';
        document.body.appendChild(el);
      }
      el.innerHTML = html == null ? '' : String(html);
      el.style.display = html ? 'block' : 'none';
    },
    voice: {
      set: o => VoiceChat.set(o),
      get: () => VoiceChat.get(),
      toggle: () => VoiceChat.toggle(),
      on: () => VoiceChat.start(),
      off: () => VoiceChat.off(),
      isOn: () => VoiceChat.isOn(),
      level: () => VoiceChat.level01()
    },
    clearHud() { const el = document.getElementById('hawaScriptHud'); if (el) { el.innerHTML = ''; el.style.display = 'none'; } },
    setCameraDist(d) { if (RT) RT.dist = clamp(+d || 5, 2, 25); },
    setCameraOffset(x, y, z) { if (RT) { RT.off = RT.off || new T.Vector3(); RT.off.set(x || 0, y || 0, z || 0); } },
    setFog(color, near, far) { scene.fog = new T.Fog(color || 0x87ceeb, near || 20, far || 180); },
    clearFog() { scene.fog = null; },
    setSky(color) { scene.background = new T.Color(color || 0x87ceeb); },
    setAmbient(intensity, color) { /* تُضاف إن وُجدت */ },
    setSun(intensity, color) { /* تُضاف إن وُجدت */ }
  };
  rt.game = game;
  for (const o of S.objs) {
    const m = MESH.get(o.id); if (o.type === 'respawn' || o.hidden) continue;
    rt.byName.set(o.name, {name: o.name, props: o.p, mesh: m, object: o, position: m.position, rotation: m.rotation, scale: m.scale,
      hide() { m.visible = false; }, show() { m.visible = true; }, hideBody() { if (m.userData.body) m.userData.body.visible = false; }, dist() { return m.position.distanceTo(rt.p); }});
  }
  const comp = (s, self) => {
    try {
      const wrap = s.code + `\n;
return {
  onStart: (typeof onStart==="function"?onStart:null) || (self && typeof self.onStart==="function"?self.onStart:null),
  onUpdate: (typeof onUpdate==="function"?onUpdate:null) || (self && typeof self.onUpdate==="function"?self.onUpdate:null),
  onTouch: (typeof onTouch==="function"?onTouch:null) || (self && typeof self.onTouch==="function"?self.onTouch:null)
};`;
      const h = new Function('self', 'game', wrap)(self, game);
      if (!h.onStart && self && self.onStart) h.onStart = self.onStart.bind(self);
      if (!h.onUpdate && self && self.onUpdate) h.onUpdate = self.onUpdate.bind(self);
      if (!h.onTouch && self && self.onTouch) h.onTouch = self.onTouch.bind(self);
      h.self = self; h.name = s.name || (self && self.name) || 'script';
      rt.hooks.push(h);
    } catch (e) { fail(s.name || 'script', e); }
  };
  for (const s of S.scripts) if (s.enabled) { if (isBig(s.code)) runScene(rt, s); else comp(s, {name: 'scene', props: {}}); }
  for (const o of S.objs) {
    if (o.hidden || o.type === 'respawn') continue;
    if (o.type === 'sobj') {
      const d = defOf(o.def);
      if (d && isBig(d.code)) { runBig(rt, o, MESH.get(o.id), d.code); continue; }
      if (d) { const self = rt.byName.get(o.name); if (self) comp(d, self); }
    }
    const self = rt.byName.get(o.name);
    if (self) for (const id of o.scripts) { const s = S.scripts.find(x => x.id === id); if (s) comp(s, self); }
  }
  for (const h of rt.hooks) if (h.onStart) try { h.onStart(h.self, game); } catch (e) { fail(h.name, e); }
  S.dirty = 1;
}
function playStop() {
  try { MOB.setPlay(false); } catch (_) {}
  try { TouchUI.hide(); } catch (_) {}
  try { clearVirtualKeys(); } catch (_) {}

  const rt = RT; if (!rt) return;
  if (document.pointerLockElement) document.exitPointerLock();
  try { NetMP.stop(); } catch (e) {}
  try { VoiceChat.destroy(); VoiceChat.show(false); } catch (e) {}
  cleanBig(rt);
  try {
    document.querySelectorAll('[data-script-ui]').forEach(el => { try { el.remove(); } catch (_) {} });
  } catch (_) {}
  rt.inst.forEach(i => { scene.remove(i); i.dispose(); }); scene.remove(rt.rig.root);
  RT = null; S.mode = 'build';
  for (const o of S.objs) { const m = MESH.get(o.id); m.matrixAutoUpdate = false; tf(o); look(o); }
  for (const o of S.objs) refreshPreview(o);
  grid.visible = true; $('#play').hidden = true; $('#app').hidden = false; attach(vp);
  setTool(S.tool); sel(null); camUpdate(); updModes(); refNames = null; syncMarks();
}
function togglePlay() { S.mode === 'play' ? playStop() : playStart(); }
$('#bTest').onclick = togglePlay;
const _pExit = $('#pExit'); if (_pExit) _pExit.onclick = playStop;

function play(dt) {
  const rt = RT, p = rt.p, v = rt.v, r = PR, h = PH;
  rt.t += dt; rt.cd -= dt; rt.msgT -= dt;
  for (const x of rt.plats) { const a = x.o.p.axis | 0; x.m.position.set(...x.o.pos); x.m.position.setComponent(a, x.o.pos[a] + Math.sin(rt.t * x.o.p.speed) * x.o.p.amp); }
  for (let i = rt.ups.length - 1; i >= 0; i--) { let res; try { res = rt.ups[i](dt); } catch (e) { fail('script', e); res = false; } if (res === false) rt.ups.splice(i, 1); }
  for (const k of rt.hooks) if (k.onUpdate) try { k.onUpdate(k.self, rt.game, dt); } catch (e) { k.onUpdate = null; fail(k.name, e); }
  for (const bg of rt.bigs) { try { groundFollow(rt, bg, dt); } catch (e) { if (!bg.err) { bg.err = 1; console.error(e); } } }
  for (const b of rt.dyn) {
    b.mesh.updateMatrix();
    const n = b.big ? aabbBox(b.mesh) : aabb(b.mesh);
    const dx = n.cx - (b.cx ?? n.cx), dy = n.cy - (b.cy ?? n.cy), dz = n.cz - (b.cz ?? n.cz);
    Object.assign(b, n); b.dx = dx; b.dy = dy; b.dz = dz;
  }
  if (rt.gnd && rt.gnd.dyn) { p.x += rt.gnd.dx; p.y += rt.gnd.dy; p.z += rt.gnd.dz; }
  if (!rt.hold) {
    const inp = !rt.locked;
    const ix = inp ? (keyDown('KeyD') || keyDown('ArrowRight') ? 1 : 0) - (keyDown('KeyA') || keyDown('ArrowLeft') ? 1 : 0) : 0;
    const iz = inp ? (keyDown('KeyW') || keyDown('ArrowUp') ? 1 : 0) - (keyDown('KeyS') || keyDown('ArrowDown') ? 1 : 0) : 0;
    const sy = Math.sin(rt.yaw), cy = Math.cos(rt.yaw);
    let dx = -sy * iz + cy * ix, dz = -cy * iz - sy * ix; const len = Math.hypot(dx, dz), sp = (keyDown('ShiftLeft') || keyDown('ShiftRight')) ? 9 : 5.5;
    if (len > 0) { dx /= len; dz /= len; let d = Math.atan2(dx, dz) - rt.ang; d = Math.atan2(Math.sin(d), Math.cos(d)); rt.ang += d * Math.min(1, dt * 14); }
    const kk = Math.min(1, dt * (rt.gr ? 18 : 6));
    v.x += (dx * sp - v.x) * kk; v.z += (dz * sp - v.z) * kk;
    rt.coy = rt.gr ? .1 : (rt.coy || 0) - dt;
    const sp1 = keyDown('Space'); if (sp1 && !rt.spPrev) rt.jbuf = .13; rt.spPrev = sp1; rt.jbuf = (rt.jbuf || 0) - dt;
    if (rt.jbuf > 0 && rt.coy > 0 && inp) { v.y = 10; rt.gr = false; rt.coy = 0; rt.jbuf = 0; rt.jumping = true; }
    if (!sp1 && rt.jumping && v.y > 4) v.y *= Math.pow(.0005, dt);
    if (v.y <= 0) rt.jumping = false;
    v.y = Math.max(-35, v.y - 28 * dt);
    const st = ++rt.stamp, L = [];
    for (let x = Math.floor((p.x - 1.5) / CELL); x <= Math.floor((p.x + 1.5) / CELL); x++) for (let z = Math.floor((p.z - 1.5) / CELL); z <= Math.floor((p.z + 1.5) / CELL); z++) {
      const a = rt.hash.get(x * 100003 + z); if (a) for (const b of a) if (b.q !== st) { b.q = st; L.push(b); }
    }
    for (const b of rt.dyn) L.push(b);
    rt.gr = false; rt.gnd = null; let py;
    const hit = ax => {
      for (const b of L) {
        if (b.ramp || p.x + r <= b.x0 || p.x - r >= b.x1 || p.z + r <= b.z0 || p.z - r >= b.z1 || p.y + h <= b.y0 || p.y >= b.y1) continue;
        if (ax === 1) { if (py >= b.y1 - .1 || p.y + h / 2 > (b.y0 + b.y1) / 2) { p.y = b.y1; if (v.y < 0) v.y = 0; rt.gr = true; rt.gnd = b; } else { p.y = b.y0 - h; if (v.y > 0) v.y = 0; } }
        else if (b.y1 - p.y <= .45) { p.y = b.y1; rt.gr = true; rt.gnd = b; }
        else if (ax === 0) { p.x = p.x < (b.x0 + b.x1) / 2 ? b.x0 - r : b.x1 + r; v.x = 0; }
        else { p.z = p.z < (b.z0 + b.z1) / 2 ? b.z0 - r : b.z1 + r; v.z = 0; }
      }
    };
    p.x += v.x * dt; hit(0); p.z += v.z * dt; hit(2); py = p.y; p.y += v.y * dt; hit(1);
    if (v.y <= .5) {
      const q = new T.Vector3(), w = new T.Vector3();
      for (const b of L) { if (!b.ramp) continue; q.copy(p).applyMatrix4(b.inv); if (Math.abs(q.x) <= .5 && Math.abs(q.z) <= .5) { w.set(q.x, q.z, q.z).applyMatrix4(b.m); if (p.y <= w.y + .35 && p.y >= w.y - 1.2) { p.y = w.y; v.y = 0; rt.gr = true; } } }
    }
  } else { v.set(0, 0, 0); }
  for (const b of rt.trig) {
    if (p.x + r <= b.x0 || p.x - r >= b.x1 || p.z + r <= b.z0 || p.z - r >= b.z1 || p.y + h <= b.y0 || p.y >= b.y1 + .2) continue;
    if (b.kind === 'kill') respawnP(); else if (rt.cd <= 0) { v.y = b.o.p.power; rt.cd = .3; rt.gr = false; }
  }
  for (const k of rt.hooks) if (k.onTouch && k.self.mesh) {
    const mm = k.self.mesh; mm.updateMatrix(); const b = aabb(mm);
    if (!(p.x + r <= b.x0 || p.x - r >= b.x1 || p.z + r <= b.z0 || p.z - r >= b.z1 || p.y + h <= b.y0 || p.y >= b.y1)) try { k.onTouch(k.self, rt.game, dt); } catch (e) { k.onTouch = null; fail(k.name, e); }
  }
  for (const o of rt.rs) { const ex = o.pos[0] - p.x, ez = o.pos[2] - p.z; if (ex * ex + ez * ez < 2 && Math.abs(o.pos[1] - p.y) < 2) rt.cur = o; }
  if (p.y < -40) respawnP();

  const fd = !!K.KeyF, fEdge = fd && !rt.fPrev; rt.fPrev = fd;
  let prompt = '';
  for (const it of rt.inter) {
    const wp = new T.Vector3(); it.root.getWorldPosition(wp);
    if (wp.distanceTo(p) <= (it.cfg.radius || 3)) { prompt = it.cfg.label || ''; if (fEdge && it.cfg.onActivate) { try { it.cfg.onActivate(); } catch (e) { fail('interact', e); } break; } }
  }
  if (prompt !== rt.prompt) { rt.prompt = prompt; const pe = $('#pPrompt'); pe.hidden = !prompt; pe.textContent = prompt ? 'F · ' + prompt : ''; }

  const rig = rt.rig, hv = Math.hypot(v.x, v.z), moving = hv > .3, run = !!K.ShiftLeft && moving, sf = Math.min(1, hv / 5.5);
  if (moving) rt.walk += dt * (run ? 1.25 : 2.0) * hv * (rt.gr ? 1 : .4);
  rig.root.position.copy(p); rig.root.rotation.y = rt.ang;
  const wr = a => Math.atan2(Math.sin(a), Math.cos(a)), idt = Math.max(dt, 1e-3);
  const turn = clamp(wr(rt.ang - (rt.pAng ?? rt.ang)) / idt, -12, 12); rt.pAng = rt.ang; rt.turnS = (rt.turnS || 0) + (turn - (rt.turnS || 0)) * Math.min(1, dt * 10);
  const pv = rt.pv || (rt.pv = new T.Vector3(v.x, v.y, v.z)), ax = (v.x - pv.x) / idt, az = (v.z - pv.z) / idt; pv.copy(v);
  rt.fa = (rt.fa || 0) + (ax * Math.sin(rt.ang) + az * Math.cos(rt.ang) - (rt.fa || 0)) * Math.min(1, dt * 8);
  rt.la = (rt.la || 0) + (ax * Math.cos(rt.ang) - az * Math.sin(rt.ang) - (rt.la || 0)) * Math.min(1, dt * 8);
  if (rt.animLock) { rigNeutral(rig); if (rt.sit) applySitLimbs(rt); }
  else animRig(rig, dt, {moving, run, air: !rt.gr, ph: rt.walk, sf, hv, vy: v.y, turn: rt.turnS, az: rt.fa, fz: rt.fa, fx: rt.la, camRel: wr(rt.yaw + Math.PI - rt.ang), camPitch: rt.pitch, local: true}, rt.locks);
  try { NetMP.tick(dt); } catch (e) {}
  rig.root.scale.setScalar(rt.animLock ? (rt.rideSc || RIDE_SC) : PSC);

  const tx = p.x, ty = p.y + 1.75, tz = p.z, cp = Math.cos(rt.pitch);
  if (rt.cam) {
    const c = rt.cam, k = clamp(c.lerp != null ? c.lerp : .4, .05, 1);
    if (!rt.camS) rt.camS = {p: cam.position.clone(), l: new T.Vector3(tx, ty, tz)};
    rt.camS.p.lerp(new T.Vector3(c.x, c.y, c.z), k); rt.camS.l.lerp(new T.Vector3(c.lookX, c.lookY, c.lookZ), k);
    cam.position.copy(rt.camS.p); cam.lookAt(rt.camS.l);
    const fv = c.fov || 60; if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); }
  } else {
    if (rt.camS) { rt.camS = null; if (cam.fov !== 60) { cam.fov = 60; cam.updateProjectionMatrix(); } }
    cam.position.set(tx + rt.dist * cp * Math.sin(rt.yaw), ty + rt.dist * Math.sin(rt.pitch), tz + rt.dist * cp * Math.cos(rt.yaw));
    cam.lookAt(tx, ty, tz);
  }
  const msgOn = rt.msgT > 0;
  if (msgOn !== rt.msgOn || (msgOn && rt.msgShown !== rt.msg)) { rt.msgOn = msgOn; rt.msgShown = rt.msg; const m = $('#pMsg'); m.hidden = !msgOn; m.textContent = msgOn ? rt.msg : ''; }
}

/* ---------- الحلقة الرئيسية ---------- */
let last = performance.now(), fc = 0, ft = last;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (S.mode === 'play') play(dt);
  else {
    if (keyDown('KeyW') || keyDown('KeyA') || keyDown('KeyS') || keyDown('KeyD') || keyDown('ArrowUp') || keyDown('ArrowDown') || keyDown('ArrowLeft') || keyDown('ArrowRight') || keyDown('Space') || keyDown('ShiftLeft') || keyDown('ShiftRight')) fly(dt);
    ghostUpdate();
    if (SELH) SELH.update();
    if ((++mkc & 7) === 0) syncMarks();
  }
  if (S.mode === 'play' || S.dirty) { if (S.mode === 'build') try { markUpd(); } catch(_){ } S.dirty = 0; try { ugizmo(); } catch(_){ } try { if (R && R.render) R.render(scene, cam); } catch(_){ } fc++; }
  updCoord();
  if (now - ft > 500) {
    const f = Math.round(fc * 1000 / (now - ft)); fc = 0; ft = now;
    if (S.mode === 'play') $('#pFps').textContent = f + ' FPS';
    else $('#stat').textContent = f + ' FPS · ' + R.info.render.calls + ' رسم · ' + S.objs.length + ' كائن';
  }
}

/* ---------- بدء ---------- */
function demo() {
  add('floor', [0, -.2, 0], {name: 'الأرضية', scl: [40, .4, 40], color: '#5d7a5d'});
  add('cube', [4, .5, 0]); add('cube', [5, 1, 0], {scl: [1, 2, 1]}); add('cube', [6, 1.5, 0], {scl: [1, 3, 1]});
  add('ramp', [-6, 1, -2], {rot: [0, 90, 0]}); add('wall', [0, 1.5, -12], {scl: [12, 3, .5]});
  add('pad', [-4, .15, 5]); add('plat', [9, 1, -6], {p: {axis: 0, amp: 4, speed: 1}}); add('cyl', [-9, 1, 6]); add('sphere', [8, .5, 7]);
  add('respawn', [0, 0, 8], {name: 'نقطة البدء'});
}
window.HAWA = {S};


/* ---------- موبايل: لمس + تخطيط ---------- */
const MOB = {
  on: false,
  joy: {x: 0, y: 0, active: false, pid: null},
  look: {pid: null, lx: 0, ly: 0},
  pinch: null,
  buildTouch: null,
  run: false,
  jump: false,
  detect() {
    const coarse = (typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches);
    const small = Math.min(innerWidth, innerHeight) <= 900;
    const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    this.on = !!(coarse || (touch && small) || innerWidth <= 820);
    document.body.classList.toggle('is-mobile', this.on);
    return this.on;
  },
  bind() {
    this.detect();
    addEventListener('resize', () => { this.detect(); try { resize(); } catch (_) {} });
    addEventListener('orientationchange', () => setTimeout(() => { this.detect(); try { resize(); } catch (_) {} }, 200));
    // منع سكرول/زووم الصفحة على الكانفس
    document.addEventListener('gesturestart', e => e.preventDefault(), {passive: false});
    const ov = document.getElementById('mOverlay');
    if (ov) ov.onclick = () => this.closeSheets();
    const dBtn = document.getElementById('mDockBtn');
    const sBtn = document.getElementById('mSideBtn');
    const tBtn = document.getElementById('mTestBtn');
    if (dBtn) dBtn.onclick = () => this.toggleSheet('dock');
    if (sBtn) sBtn.onclick = () => this.toggleSheet('side');
    if (tBtn) tBtn.onclick = () => { try { if (S.mode !== 'play') playStart(); } catch (_) {} };
    this._bindJoy();
    this._bindPlayLook();
    this._bindBuildGestures();
    const mb = document.getElementById('mBar');
    if (mb) mb.hidden = !this.on;
    const bh = document.getElementById('mBuildHint');
    if (bh) bh.hidden = !this.on;
    const mt = document.getElementById('mTouch');
    if (mt) mt.hidden = true;
    // bPar على الموبايل يفتح الـ dock
    const bPar = document.getElementById('bPar');
    if (bPar) {
      const old = bPar.onclick;
      bPar.onclick = () => {
        if (this.on) this.toggleSheet('dock');
        else if (old) old();
        else { document.body.classList.toggle('noside'); bPar.classList.toggle('on', !document.body.classList.contains('noside')); setTimeout(resize, 30); }
      };
    }
  },
  toggleSheet(which) {
    const dock = which === 'dock';
    const openDock = dock && !document.body.classList.contains('sheet-dock');
    const openSide = !dock && !document.body.classList.contains('sheet-side');
    document.body.classList.remove('sheet-dock', 'sheet-side');
    if (openDock) document.body.classList.add('sheet-dock');
    if (openSide) {
      document.body.classList.remove('noside');
      document.body.classList.add('sheet-side');
    }
    setTimeout(resize, 40);
  },
  closeSheets() {
    document.body.classList.remove('sheet-dock', 'sheet-side');
    setTimeout(resize, 40);
  },
  setPlay(on) {
    document.body.classList.toggle('play-on', !!on);
    if (!on) {
      this.joy.x = this.joy.y = 0; this.joy.active = false;
      this.run = this.jump = false;
      K.KeyW = K.KeyA = K.KeyS = K.KeyD = K.Space = K.ShiftLeft = 0;
    }
    const mt = document.getElementById('mTouch');
    if (mt) mt.hidden = !(this.on && on);
    const mb = document.getElementById('mBar');
    if (mb) mb.hidden = !this.on || !!on;
    const bh = document.getElementById('mBuildHint');
    if (bh) bh.hidden = !this.on || !!on;
  },
  _bindJoy() {
    const zone = document.getElementById('mJoy');
    const knob = document.getElementById('mJoyKnob');
    if (!zone) return;
    const rad = () => zone.clientWidth * 0.5;
    const setKnob = (x, y) => {
      if (!knob) return;
      knob.style.transform = `translate(${x}px,${y}px)`;
    };
    const update = (cx, cy) => {
      const r = zone.getBoundingClientRect();
      const mx = r.left + r.width / 2, my = r.top + r.height / 2;
      let dx = cx - mx, dy = cy - my;
      const max = rad() * 0.72, len = Math.hypot(dx, dy) || 1;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      this.joy.x = dx / max;
      this.joy.y = dy / max;
      setKnob(dx, dy);
      // غذي مفاتيح الحركة
      const dead = 0.22;
      setVirtualKey('KeyW', this.joy.y < -dead);
      setVirtualKey('KeyS', this.joy.y > dead);
      setVirtualKey('KeyA', this.joy.x < -dead);
      setVirtualKey('KeyD', this.joy.x > dead);
    };
    const end = () => {
      this.joy.active = false; this.joy.pid = null;
      this.joy.x = this.joy.y = 0;
      setKnob(0, 0);
      setVirtualKey('KeyW',0);setVirtualKey('KeyA',0);setVirtualKey('KeyS',0);setVirtualKey('KeyD',0);
    };
    zone.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      zone.setPointerCapture(e.pointerId);
      this.joy.active = true; this.joy.pid = e.pointerId;
      update(e.clientX, e.clientY);
    });
    zone.addEventListener('pointermove', e => {
      if (!this.joy.active || e.pointerId !== this.joy.pid) return;
      e.preventDefault();
      update(e.clientX, e.clientY);
    });
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
    const jump = document.getElementById('mJump');
    const run = document.getElementById('mRun');
    const hold = (el, key, flag) => {
      if (!el) return;
      const on = e => { e.preventDefault(); e.stopPropagation(); setVirtualKey(key, 1); this[flag] = true; el.classList.add('on'); };
      const off = e => { e.preventDefault(); setVirtualKey(key, 0); this[flag] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointerleave', off);
      el.addEventListener('pointercancel', off);
    };
    hold(jump, 'Space', 'jump');
    hold(run, 'ShiftLeft', 'run');
  },
  _bindPlayLook() {
    // النصف الأيمن من شاشة اللعب = تدوير كاميرا
    const play = document.getElementById('play');
    if (!play) return;
    play.addEventListener('pointerdown', e => {
      if (!this.on || S.mode !== 'play') return;
      if (e.target.closest('#mJoy,#mAct,#pTop,#pMic,button')) return;
      const w = innerWidth;
      if (e.clientX < w * 0.42) return; // شمال = جوystick منطقة
      this.look.pid = e.pointerId;
      this.look.lx = e.clientX; this.look.ly = e.clientY;
      try { play.setPointerCapture(e.pointerId); } catch (_) {}
    });
    play.addEventListener('pointermove', e => {
      if (!this.on || S.mode !== 'play' || this.look.pid !== e.pointerId || !RT) return;
      const dx = e.clientX - this.look.lx, dy = e.clientY - this.look.ly;
      this.look.lx = e.clientX; this.look.ly = e.clientY;
      RT.yaw -= dx * 0.0045;
      RT.pitch = clamp(RT.pitch + dy * 0.0045, -.3, 1.3);
    });
    const clear = e => { if (e.pointerId === this.look.pid) this.look.pid = null; };
    play.addEventListener('pointerup', clear);
    play.addEventListener('pointercancel', clear);
  },
  _bindBuildGestures() {
    // بينش زووم + تمييز لمسة قصيرة = كليك
    let taps = new Map();
    cv.addEventListener('touchstart', e => {
      if (!this.on || S.mode !== 'build') return;
      if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        this.pinch = {dist, d0: OB.dist};
        e.preventDefault();
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        this.buildTouch = {x: t.clientX, y: t.clientY, t: performance.now(), moved: 0, id: t.identifier};
      }
    }, {passive: false});
    cv.addEventListener('touchmove', e => {
      if (!this.on || S.mode !== 'build') return;
      if (e.touches.length === 2 && this.pinch) {
        const a = e.touches[0], b = e.touches[1];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const s = this.pinch.dist / Math.max(40, dist);
        OB.dist = clamp(this.pinch.d0 * s, 1.5, 400);
        camUpdate();
        e.preventDefault();
      } else if (e.touches.length === 1 && this.buildTouch) {
        const t = e.touches[0];
        const dx = t.clientX - this.buildTouch.x, dy = t.clientY - this.buildTouch.y;
        this.buildTouch.moved += Math.abs(dx) + Math.abs(dy);
        // إصبع واحد = تدوير كاميرا البناء
        OB.yaw -= dx * 0.005;
        OB.pitch = clamp(OB.pitch + dy * 0.005, -1.5, 1.5);
        this.buildTouch.x = t.clientX; this.buildTouch.y = t.clientY;
        camUpdate();
        e.preventDefault();
      }
    }, {passive: false});
    cv.addEventListener('touchend', e => {
      if (!this.on || S.mode !== 'build') return;
      if (this.pinch && e.touches.length < 2) this.pinch = null;
      if (this.buildTouch && e.changedTouches.length) {
        const t = e.changedTouches[0];
        const bt = this.buildTouch;
        this.buildTouch = null;
        // لمسة قصيرة بدون حركة ≈ كليك أداة
        if (bt.moved < 12 && performance.now() - bt.t < 320) {
          const fake = {clientX: t.clientX, clientY: t.clientY, button: 0};
          try { click(fake); } catch (_) {}
        }
      }
    }, {passive: false});
  }
};


function boot() {
  try { MOB.bind(); } catch (e) { console.warn(e); }

  loadPlayerCfg();
  $$('[data-ic]').forEach(e => e.innerHTML = ic(e.dataset.ic));
  attach(vp);
  let d = null;
  if (typeof window.HAWA_EMBEDDED_GAME === 'object' && window.HAWA_EMBEDDED_GAME && Array.isArray(window.HAWA_EMBEDDED_GAME.objs)) {
    d = window.HAWA_EMBEDDED_GAME;
  } else {
    try {
      const ss = sessionStorage.getItem('hawa_game');
      if (ss) d = JSON.parse(ss);
    } catch (e) {}
    if (!d) try { d = JSON.parse(localStorage.getItem('hawa2')); } catch (e) {}
  }
  if (d && d.objs) {
    clearAll();
    S.scripts = (d.scripts || []).map(s => ({id: +s.id, name: s.name, code: s.code, enabled: s.enabled != null ? !!s.enabled : !!s.global}));
    S.sdefs = (d.sdefs || []).map(x => ({id: +x.id, name: x.name, code: x.code}));
    S.did = Math.max(1, ...(S.sdefs.map(x => x.id + 1).concat([1])));
    S.sid = Math.max(1, ...(S.scripts.map(x => x.id + 1).concat([1])));
    for (const r of d.objs) {
      const o = norm(r);
      if (o) {
        o.id = r.id != null ? +r.id : o.id;
        o.scripts = Array.isArray(r.scripts) ? r.scripts.map(Number) : [];
        o.def = r.def;
        o.name = r.name || o.name;
        o.p = {...(o.p || {}), ...(r.p || {})};
        reg(o);
      }
    }
    S.nid = Math.max(d.nid || 1, ...S.objs.map(o => o.id + 1), 1);
  }
  if (!S.objs.length && !(d && d.objs && d.objs.length) && !window.HAWA_PLAY_ONLY) demo();
  ensureLive(); refreshLive(); ensureCoordUI();
  cats(); setTool('select'); setSec('objects'); setGz('move'); hier(); pList(); sList(); inspect(); resize(); camUpdate(); updModes(); updOnRsBtn();
  requestAnimationFrame(frame);
  if (window.HAWA_PLAY_ONLY) {
    const bar = document.getElementById('bar');
    const app = document.getElementById('app');
    if (bar) bar.style.display = 'none';
    setTimeout(() => { try { playStart(); } catch (e) { console.error(e); alert('فشل بدء اللعب: ' + (e.message || e)); } }, 80);
  }
}
boot();
})();
