'use strict';

(() => {
// إخفاء واجهة البناء فوراً في وضع اللعب فقط — يمنع ومضة البناء قبل اللعب
try {
  if (window.HAWA_PLAY_ONLY) {
    const st = document.createElement('style');
    st.id = 'pure-play-boot';
    st.textContent = '#app{display:none!important;visibility:hidden!important}body.pure-play #app{display:none!important}#play{visibility:visible}body{background:#08060f}';
    document.documentElement.appendChild(st);
    document.documentElement.classList.add('pure-play');
    if (document.body) document.body.classList.add('pure-play','play-on');
    else document.addEventListener('DOMContentLoaded',()=>{try{document.body.classList.add('pure-play','play-on')}catch(_){}});
  }
} catch(_){}
const T = THREE, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const D2R = Math.PI / 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), E = .02;
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const PH = 2.15, PR = .34;

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
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 19c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5.4 4.5 1.8 4.5 4"/>',
  home: '<path d="M4 11.5L12 4l8 7.5"/><path d="M6.5 10.5V20h11V10.5"/><path d="M10 20v-5h4v5"/>',
  objects: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  prog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  sobj: '<rect x="5" y="7" width="14" height="12" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8"/>',
  micoff: '<path d="M3 3l18 18"/><path d="M9 9v3a3 3 0 0 0 5.1 2.1"/><path d="M15 5v6"/><path d="M12 2a3 3 0 0 0-3 3"/><path d="M19 11v1a7 7 0 0 1-9.5 6.5"/><path d="M5 11v1a7 7 0 0 0 3 5.7"/><path d="M12 19v3M8 22h8"/>',
  leave: '<path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M15 16l5-4-5-4"/><path d="M20 12H10"/>',
  mute: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/>',
  unmute: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a8 8 0 0 1 0 12"/>',
  box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5L12 12l9-4.5M12 12v9"/>'
};
const ic = n => `<svg class="hawa-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ''}</svg>`;
const icFramed = n => `<span class="hawa-ico-frame" data-ico="${n}">${ic(n)}</span>`;

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
const PL = {value:'القيمة',power:'قوة النط',axis:'المحور 0=X 1=Y 2=Z',amp:'المسافة',speed:'السرعة',intensity:'الشدة',range:'المدى',slot:'رقم اللاعب 1–8'};
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
game.touch: show(list) hide() isDown(id) wasPressed(id) isMobile()
أونلاين/لاعبين (مفتوح):
  game.getAllPlayers() game.getPlayer(t) game.forEachPlayer(fn)
  game.controlPlayer(target,cmd)  target: slot|name|"me"|"all"|"others"
  cmd: {pos,teleport,yaw,appearance,state,limbs,input,camera,locked,hold,say,...}
  game.teleportPlayer / teleportAll / setPlayerAppearance / setPlayerState / givePlayer
  game.setCinematic({mode:"follow"|"orbit",targetSlot,offset,fov}) game.clearCinematic()
  game.isNetworked() game.isHost() game.mySlot() game.onPlayerCmd(fn)
أطراف آمنة: game.setPlayerLimb(0,'rArm'|'rForearm'|'lArm'|'lForearm'|'spine',rx,ry,rz) — سالب X ≈ للأمام
حظر: شعاع ليزر CylinderGeometry+PointLight كل فريم / p.setLimb بدل setPlayerLimb / getBone كشرط تشغيل — تسبب شاشة سوداء
cleanup: امسح أي Mesh/Light من scene + game.touch.hide()
`;

const HawaUI = {
  _root: null,
  ensure() {
    if (this._root) return this._root;
    let el = document.getElementById('hawaDialog');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hawaDialog';
      el.hidden = true;
      el.innerHTML = `
        <div class="hd-backdrop"></div>
        <div class="hd-box" role="dialog" aria-modal="true">
          <div class="hd-msg" id="hdMsg"></div>
          <div class="hd-field" id="hdField" hidden>
            <input type="text" id="hdInput" autocomplete="off" />
          </div>
          <div class="hd-actions" id="hdActions"></div>
        </div>`;
      document.body.appendChild(el);
    }
    this._root = el;
    return el;
  },
  _open(msg, opts) {
    const el = this.ensure();
    const msgEl = el.querySelector('#hdMsg');
    const field = el.querySelector('#hdField');
    const input = el.querySelector('#hdInput');
    const actions = el.querySelector('#hdActions');
    msgEl.textContent = String(msg || '');
    actions.innerHTML = '';
    field.hidden = true;
    el.hidden = false;
    el.classList.add('on');
    return { el, msgEl, field, input, actions };
  },
  _close() {
    const el = this.ensure();
    el.hidden = true;
    el.classList.remove('on');
  },
  alert(msg) {
    return new Promise(resolve => {
      const { actions } = this._open(msg);
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'hd-ok';
      ok.textContent = 'حسنًا';
      ok.onclick = () => { this._close(); resolve(); };
      actions.appendChild(ok);
      setTimeout(() => ok.focus(), 30);
    });
  },
  confirm(msg) {
    return new Promise(resolve => {
      const { actions } = this._open(msg);
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'hd-cancel';
      cancel.textContent = 'إلغاء';
      cancel.onclick = () => { this._close(); resolve(false); };
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'hd-ok';
      ok.textContent = 'تأكيد';
      ok.onclick = () => { this._close(); resolve(true); };
      actions.appendChild(cancel);
      actions.appendChild(ok);
      setTimeout(() => ok.focus(), 30);
    });
  },
  prompt(msg, def) {
    return new Promise(resolve => {
      const { field, input, actions } = this._open(msg);
      field.hidden = false;
      input.value = def != null ? String(def) : '';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'hd-cancel';
      cancel.textContent = 'إلغاء';
      cancel.onclick = () => { this._close(); resolve(null); };
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'hd-ok';
      ok.textContent = 'موافق';
      const done = () => { const v = input.value; this._close(); resolve(v); };
      ok.onclick = done;
      input.onkeydown = e => {
        if (e.key === 'Enter') { e.preventDefault(); done(); }
        if (e.key === 'Escape') { e.preventDefault(); this._close(); resolve(null); }
      };
      actions.appendChild(cancel);
      actions.appendChild(ok);
      setTimeout(() => { input.focus(); input.select(); }, 30);
    });
  }
};
function uiAlert(msg) { return HawaUI.alert(msg); }
function uiConfirm(msg) { return HawaUI.confirm(msg); }
function uiPrompt(msg, def) { return HawaUI.prompt(msg, def); }
try {
  window.alert = function(m) { try { HawaUI.alert(String(m)); } catch(_){} };
  window.confirm = function(m) { console.warn('native confirm blocked — use uiConfirm'); return false; };
  window.prompt = function(m, d) { console.warn('native prompt blocked — use uiPrompt'); return d != null ? d : null; };
} catch(_){}


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

function fileDefaultParams(code, fileP) {
  const p = {};
  for (const e of schemaOf(code || '')) {
    try { p[e.key] = e.value !== undefined ? JSON.parse(JSON.stringify(e.value)) : e.value; }
    catch (_) { p[e.key] = e.value; }
  }
  const parsed = parseParams(code || '');
  for (const k of Object.keys(parsed)) if (p[k] === undefined) p[k] = parsed[k];
  if (fileP && typeof fileP === 'object') {
    for (const k of Object.keys(fileP)) {
      try { p[k] = JSON.parse(JSON.stringify(fileP[k])); }
      catch (_) { p[k] = fileP[k]; }
    }
  }
  return p;
}
function applyFileParamsToObject(o) {
  if (!o || o.type !== 'sobj') return;
  const d = defOf(o.def); if (!d) return;
  o.p = fileDefaultParams(d.code, d.p);
  clearTimeout(prevT);
  prevT = setTimeout(() => { try { refreshPreview(o); } catch (_) {} }, 80);
  chg();
}

const S = {objs:[], scripts:[], sdefs:[], sel:null, mode:'build', tool:'select', gz:'move', item:'cube', section:'objects',
  snap:.5, nid:1, sid:1, did:1, mid:1, dirty:1, err:[], hr:null, fly:false, media:{}, mediaOrder:[], paramOpen:false,
  allowScriptSpawn:true, // دائماً مسموح — الخيار اتشال من الواجهة
  roomMinEnabled:false,   // تفعيل حد أدنى مخصص
  roomMinPlayers:1,       // الحد الأدنى (لازم < عدد نقاط الأونلاين)
  roomFillExact:false,    // الحد = عدد النقاط (min=max=spawns)
  playNet: null};
const OBJ = new Map(), MESH = new Map(), K = {};

const VK = Object.create(null);
function keyDown(code) {
  const c = String(code || '');
  return !!(K[c] || VK[c]);
}
function setVirtualKey(code, down) {
  const c = String(code || '');
  if (!c) return;
  if (down) VK[c] = 1; else delete VK[c];
  
  K[c] = down ? 1 : 0;
}
function clearVirtualKeys() {
  for (const c of Object.keys(VK)) { delete VK[c]; if (K[c]) K[c] = 0; }
}
/** امسح كل المفاتيح (فيزيائي + افتراضي) — يمنع اللزق بعد فقدان التركيز */
function clearAllKeys(reason) {
  try {
    for (const c of Object.keys(K)) delete K[c];
    for (const c of Object.keys(VK)) delete VK[c];
  } catch (_) {
    try { for (const k in K) K[k] = 0; } catch (__) {}
    try { for (const k in VK) delete VK[k]; } catch (__) {}
  }
  // صفّر حالات متعلقة بالإدخال المستمر
  try { if (typeof rmb !== 'undefined') rmb = false; } catch (_) {}
  try {
    if (typeof RT !== 'undefined' && RT) {
      RT.spPrev = false;
      if (RT.v && RT.v.set) { /* لا نصفر السرعة بالكامل أثناء القفز — بس المفاتيح */ }
    }
  } catch (_) {}
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

const cv = $('#cv'), vp = $('#vp'), pvp = $('#pvp');
let R, scene, cam, sun, grid;
try {
  const _isMob = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900);
  R = new T.WebGLRenderer({
    canvas: cv,
    antialias: !_isMob,
    powerPreference: _isMob ? 'low-power' : 'high-performance',
    alpha: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: false
  });
  
  R.setPixelRatio(Math.min(devicePixelRatio || 1, _isMob ? 1.5 : 2));
  try { R.shadowMap.enabled = false; } catch (_) {}
  try { if (R.outputColorSpace != null) R.outputColorSpace = T.SRGBColorSpace; } catch (_) {}
  scene = new T.Scene(); scene.background = new T.Color(0x0e1726);
  cam = new T.PerspectiveCamera(60, 1, .1, 1500);
  scene.add(new T.HemisphereLight(0xcfe3ff, 0x3a3f4a, .9));
  sun = new T.DirectionalLight(0xffffff, 1.1); sun.position.set(30, 50, 20); scene.add(sun);
  grid = new T.GridHelper(200, 200, 0x3b5068, 0x1f3049); grid.position.y = .01; scene.add(grid);
} catch (webglErr) {
  console.error('WebGL init failed — UI will still work', webglErr);
  
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

const OB = {t: new T.Vector3(0, 1, 0), yaw: .8, pitch: .55, dist: 22};
const dirOf = (y, p) => { const cc = Math.cos(p); return [cc * Math.sin(y), Math.sin(p), cc * Math.cos(y)]; };
const FLOOR_EPS = .25;

const LASTCAM_KEY = 'hawa-last-cam';
const INTRO = {active: !!(typeof document !== 'undefined' && document.getElementById('intro')) && !window.HAWA_PLAY_ONLY, started: false};
const LAST_CAM = (function () {          
  try {
    const c = JSON.parse(localStorage.getItem(LASTCAM_KEY) || 'null');
    if (c && [c.tx, c.ty, c.tz, c.yaw, c.pitch, c.dist].every(v => Number.isFinite(+v))) return c;
  } catch (_) {}
  return null;
})();
let _lcTimer = 0;
function persistCam(now) {
  if (INTRO.active) return;               
  const w = () => { try { localStorage.setItem(LASTCAM_KEY, JSON.stringify(getBuilderCam())); } catch (_) {} };
  clearTimeout(_lcTimer);
  if (now) w(); else _lcTimer = setTimeout(w, 350);
}
addEventListener('pagehide', () => persistCam(true));
addEventListener('beforeunload', () => persistCam(true));

function getBuilderCam() {
  return {
    tx: OB.t.x, ty: OB.t.y, tz: OB.t.z,
    yaw: OB.yaw, pitch: OB.pitch, dist: OB.dist,
    fly: !!S.fly
  };
}
function applyBuilderCam(c) {
  if (!c || typeof c !== 'object') return;
  try {
    OB.t.set(+c.tx || 0, +c.ty || 0, +c.tz || 0);
    if (c.yaw != null) OB.yaw = +c.yaw;
    if (c.pitch != null) OB.pitch = +c.pitch;
    if (c.dist != null) OB.dist = Math.max(1.5, +c.dist || 22);
    if (c.fly != null) {
      S.fly = !!c.fly;
      try { updModes(); } catch (_) {}
    }
    camUpdate();
  } catch (e) { console.warn('applyBuilderCam', e); }
}

function camUpdate() {
  if (OB.t.y < 0) OB.t.y = 0;
  const minS = (FLOOR_EPS - OB.t.y) / OB.dist;
  if (Math.sin(OB.pitch) < minS) OB.pitch = Math.asin(clamp(minS, -1, 1));
  const d = dirOf(OB.yaw, OB.pitch);
  cam.position.set(OB.t.x + OB.dist * d[0], OB.t.y + OB.dist * d[1], OB.t.z + OB.dist * d[2]);
  cam.lookAt(OB.t); cam.updateMatrixWorld(); S.dirty = 1;
  persistCam();
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
  R.setSize(w, h, false); cam.aspect = w / h;
  try {
    const mob = !!(typeof MOB !== 'undefined' && MOB.on) || (Math.min(w, h) < 700);
    cam.fov = mob ? 65 : 60;
    cam.far = mob ? 900 : 1500;
    cam.near = 0.12;
  } catch (_) {}
  cam.updateProjectionMatrix(); S.dirty = 1;
}
const ro = new ResizeObserver(() => resize());
function attach(host) {
  if (cv.parentElement !== host) host.insertBefore(cv, host.firstChild);
  ro.disconnect(); ro.observe(host); resize();
}

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
  if (top) cen = h.p[1] + hy;            
  else if (cen - hy < 0) cen = hy;       
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
/** أقصى لاعبين = عدد نقاط الأونلاين */
function roomMaxPlayers() { return countOnlineSpawns(); }
/** الحد الأدنى: لو «الحد=عدد النقاط» أو مفيش تفعيل → = الأقصى؛ وإلا الرقم المخصص (أقل من الأقصى، على الأقل 1) */
function roomMinPlayers() {
  const max = roomMaxPlayers();
  if (max < 1) return 0;
  // لاعب واحد = أوفلاين — الأونلاين يبدأ من 2 على الأقل
  if (max < 2) return max;
  if (S.roomFillExact || !S.roomMinEnabled) return max;
  let m = Math.floor(+S.roomMinPlayers || 2);
  if (m < 2) m = 2;
  if (m >= max) m = Math.max(2, max - 1);
  return m;
}
function roomPlayersLabel() {
  const max = roomMaxPlayers(), min = roomMinPlayers();
  if (max < 1) return 'مفيش نقاط أونلاين';
  if (min >= max) return 'عدد اللاعبين: ' + max;
  return 'عدد اللاعبين من ' + min + ' لـ ' + max;
}
function nextOnlineSlot() {
  const used = new Set(S.objs.filter(o => o.type === 'online_spawn').map(o => +(o.p && o.p.slot) || 1));
  for (let i = 1; i <= 8; i++) if (!used.has(i)) return i;
  return 0;
}
function countOfflineSpawns() { return S.objs.filter(o => o.type === 'respawn').length; }
function updOnRsBtn() { try { updSpawnBtn(); } catch (_) {} }
function updSpawnBtn() {
  const nOn = countOnlineSpawns(), nOff = countOfflineSpawns();
  const el = document.getElementById('spawnN');
  if (el) el.textContent = String(nOff + nOn);
  const elOld = document.getElementById('onRsN');
  if (elOld) elOld.textContent = nOn + '/8';
  const b = document.getElementById('bSpawns') || document.getElementById('bOnRs');
  if (b) {
    b.classList.toggle('on', S.tool === 'respawn' || S.tool === 'online_spawn');
    b.title = 'نقط البداية — أوفلاين ' + nOff + '/1 · أونلاين ' + nOn + '/8';
  }
  try { refreshSpawnsPanel(); } catch (_) {}
}

function openSpawnsPanel() {
  const m = document.getElementById('spawnsModal');
  if (!m) { tip('⚠ نافذة نقط البداية غير موجودة'); return; }
  m.hidden = false;
  m.removeAttribute('hidden');
  m.style.display = 'flex';
  m.classList.add('open');
  S.allowScriptSpawn = true;
  refreshSpawnsPanel();
  bindSpawnsPanelOnce();
}
function closeSpawnsPanel() {
  const m = document.getElementById('spawnsModal');
  if (m) {
    m.hidden = true;
    m.setAttribute('hidden', '');
    m.style.display = 'none';
    m.classList.remove('open');
  }
  S._spReopen = false;
  if (S.tool === 'respawn' || S.tool === 'online_spawn') setTool('select');
}
function refreshSpawnsPanel() {
  const offList = document.getElementById('spOffList');
  const onList = document.getElementById('spOnList');
  if (!offList || !onList) return;
  const offs = S.objs.filter(o => o.type === 'respawn');
  const ons = S.objs.filter(o => o.type === 'online_spawn').slice().sort((a, b) => (+(a.p && a.p.slot) || 0) - (+(b.p && b.p.slot) || 0));
  const fmt = o => {
    const p = o.pos || [0, 0, 0];
    return (+p[0]).toFixed(1) + ', ' + (+p[1]).toFixed(1) + ', ' + (+p[2]).toFixed(1);
  };
  const row = (o, label) => `<div class="sp-item" data-sp-id="${o.id}">
      <span class="sp-name">${esc(label)}</span>
      <span class="mut small">${fmt(o)}</span>
      <button type="button" data-sp-go="${o.id}">انتقل</button>
      <button type="button" class="bad" data-sp-del="${o.id}">حذف</button>
    </div>`;
  offList.innerHTML = offs.length
    ? offs.map(o => row(o, 'نقطة أوفلاين')).join('')
    : '<div class="sp-empty">لم تُوضَع نقطة أوفلاين بعد</div>';
  onList.innerHTML = ons.length
    ? ons.map(o => row(o, 'أونلاين · سلوت ' + ((o.p && o.p.slot) || '?'))).join('')
    : '<div class="sp-empty">لا نقاط أونلاين</div>';
  const cnt = document.getElementById('spOnCount');
  if (cnt) cnt.textContent = '(' + ons.length + '/8)';
  const placeOn = document.getElementById('spOnPlace');
  if (placeOn) {
    placeOn.disabled = ons.length >= 8;
    placeOn.style.opacity = placeOn.disabled ? '.4' : '';
    placeOn.title = ons.length >= 8 ? 'الحد الأقصى 8' : 'ضع نقطة أونلاين (يحوّل لأونلاين تلقائياً)';
  }
  const placeOff = document.getElementById('spOffPlace');
  if (placeOff) {
    placeOff.textContent = offs.length ? 'إعادة وضع نقطة أوفلاين' : 'وضع نقطة أوفلاين';
  }
  // إعدادات الرووم — تظهر في مشروع أونلاين فقط
  const rs = document.getElementById('spRoomSettings');
  if (rs) {
    const show = S.playNet === 'online';
    rs.hidden = !show;
    if (show) {
      const max = ons.length;
      const en = document.getElementById('spMinEnable');
      const inp = document.getElementById('spMinPlayers');
      const fill = document.getElementById('spFillExact');
      const sum = document.getElementById('spRoomSummary');
      const hint = document.getElementById('spMinHint');
      if (en) en.checked = !!S.roomMinEnabled && !S.roomFillExact;
      if (fill) fill.checked = !!S.roomFillExact;
      if (inp) {
        inp.min = 2;
        inp.max = Math.max(2, max - 1);
        let v = Math.floor(+S.roomMinPlayers || 2);
        if (v < 2) v = 2;
        if (max > 2 && v >= max) v = max - 1;
        if (max <= 2) v = 2;
        inp.value = String(v);
        S.roomMinPlayers = v;
        inp.disabled = !!S.roomFillExact || !S.roomMinEnabled || max < 3;
      }
      if (en) en.disabled = !!S.roomFillExact || max < 3;
      if (hint) {
        if (max < 2) hint.textContent = 'حط نقطتين أونلاين على الأقل (لاعب واحد = أوفلاين)';
        else if (max < 3) hint.textContent = 'حد أدنى مخصص يحتاج 3 نقاط فأكثر · حالياً الحد = ' + max;
        else if (S.roomFillExact) hint.textContent = 'الرووم لازم يتملي (' + max + ')';
        else if (!S.roomMinEnabled) hint.textContent = 'الافتراضي = عدد النقاط (' + max + ')';
        else hint.textContent = 'الأقصى ' + max + ' · الأدنى من 2 إلى ' + (max - 1);
      }
      if (sum) sum.textContent = 'ملخص: ' + roomPlayersLabel() + ' · سعة الرووم ' + max;
    }
  }
}
function bindSpawnsPanelOnce() {
  const m = document.getElementById('spawnsModal');
  if (!m || m._bound) return;
  m._bound = true;
  const close = () => closeSpawnsPanel();
  const cbtn = document.getElementById('spClose');
  if (cbtn) cbtn.onclick = close;
  m.addEventListener('click', e => { if (e.target === m) close(); });
  // spAllowScript اتشال — السكربتات مسموح لها دائماً
  S.allowScriptSpawn = true;
  const syncRoom = () => {
    const en = document.getElementById('spMinEnable');
    const inp = document.getElementById('spMinPlayers');
    const fill = document.getElementById('spFillExact');
    const max = countOnlineSpawns();
    if (fill && fill.checked) {
      S.roomFillExact = true;
      S.roomMinEnabled = false;
      if (en) en.checked = false;
    } else {
      S.roomFillExact = false;
      S.roomMinEnabled = !!(en && en.checked);
      let v = inp ? Math.floor(+inp.value || 2) : 2;
      if (v < 2) v = 2;
      if (max > 2 && v >= max) v = max - 1;
      S.roomMinPlayers = v;
      if (inp) inp.value = String(v);
    }
    chg();
    try { refreshSpawnsPanel(); } catch (_) {}
    tip('✔ ' + roomPlayersLabel());
  };
  const en = document.getElementById('spMinEnable');
  const inp = document.getElementById('spMinPlayers');
  const fill = document.getElementById('spFillExact');
  if (en) en.onchange = syncRoom;
  if (inp) {
    inp.onchange = syncRoom;
    inp.oninput = () => {
      // حفظ فوري للرقم أثناء الكتابة
      let v = Math.floor(+inp.value || 2);
      if (v < 2) v = 2;
      S.roomMinPlayers = v;
      try { localStorage.setItem('hawa2-room', JSON.stringify({
        roomMinEnabled: !!S.roomMinEnabled,
        roomMinPlayers: Math.max(2, Math.floor(+S.roomMinPlayers || 2)),
        roomFillExact: !!S.roomFillExact,
        playNet: S.playNet,
        allowScriptSpawn: true
      })); } catch (_) {}
    };
  }
  if (fill) fill.onchange = syncRoom;
  
  const hideKeepTool = () => {
    m.hidden = true; m.setAttribute('hidden', ''); m.style.display = 'none'; m.classList.remove('open');
    S._spReopen = true;
  };
  const po = document.getElementById('spOffPlace');
  if (po) po.onclick = () => {
    hideKeepTool();
    setTool('respawn');
    tipNow('', 1);
  };
  const pn = document.getElementById('spOnPlace');
  if (pn) pn.onclick = () => {
    if (countOnlineSpawns() >= 8) { tip('⚠ الحد 8 نقاط أونلاين'); return; }
    // التحويل لأونلاين يحصل تلقائياً عند وضع النقطة
    hideKeepTool();
    setTool('online_spawn');
    tipNow('', 1);
  };
  m.addEventListener('click', e => {
    const go = e.target.closest('[data-sp-go]');
    if (go) {
      const o = OBJ.get(+go.getAttribute('data-sp-go'));
      if (!o) return;
      try {
        OB.t.set(o.pos[0], o.pos[1] + 1.2, o.pos[2]);
        camUpdate();
        sel(o.id);
        tip('📍 عند النقطة');
      } catch (_) {}
      return;
    }
    const del = e.target.closest('[data-sp-del]');
    if (del) {
      const id = +del.getAttribute('data-sp-del');
      delObj(id);
      tip('تم الحذف');
      refreshSpawnsPanel();
      updSpawnBtn();
    }
  });
}
setTimeout(() => { try { bindSpawnsPanelOnce(); } catch (_) {} }, 0);

function syncPlayNetUI() {
  const b = document.getElementById('bPlayNet');
  if (!b) return;
  const m = S.playNet;
  if (m === 'online') {
    b.innerHTML = '🌐<i>أونلاين</i>';
    b.title = 'أونلاين';
    b.classList.add('on');
    b.classList.remove('playnet-ask');
  } else if (m === 'offline') {
    b.innerHTML = '📴<i>أوفلاين</i>';
    b.title = 'أوفلاين';
    b.classList.add('on');
    b.classList.remove('playnet-ask');
  } else {
    b.innerHTML = '❓<i>أونلاين / أوفلاين</i>';
    b.title = 'أونلاين / أوفلاين';
    b.classList.remove('on');
    b.classList.add('playnet-ask');
  }
  try { updOnRsBtn(); } catch (_) {}
}
function removeAllOnlineSpawns() {
  const ids = S.objs.filter(o => o.type === 'online_spawn').map(o => o.id);
  for (const id of ids) {
    try {
      const m = MESH.get(id);
      if (m) { scene.remove(m); MESH.delete(id); }
      OBJ.delete(id);
      try { removePreview(id); } catch (_) {}
    } catch (_) {}
  }
  if (ids.length) S.objs = S.objs.filter(o => o.type !== 'online_spawn');
  if (S.tool === 'online_spawn') setTool('select');
  try { updOnRsBtn(); hier(); chg(); } catch (_) {}
}
function applyPlayNetMode(mode, opts) {
  const m = mode === 'online' ? 'online' : (mode === 'offline' ? 'offline' : null);
  if (!m) return false;
  S.playNet = m;
  if (m === 'offline') removeAllOnlineSpawns();
  syncPlayNetUI();
  try { chg(); } catch (_) {}
  try { save(); } catch (_) {}
  if (!(opts && opts.silent)) {
    try {
      tip(m === 'online'
        ? '✔ المشروع أونلاين — التلقائي يدعم مزامنة اللاعبين'
        : '✔ المشروع أوفلاين — محلي بدون مزامنة · نُقاط الأونلاين اتشالت');
    } catch (_) {}
  }
  return true;
}
function uiPlayNetChoice() {
  return new Promise(resolve => {
    const { actions, msgEl } = HawaUI._open(
      'تفعيل المشروع — اختيار مرة واحدة فقط\n\n' +
      '• أوفلاين: لعب محلي فقط · تُحذف نقاط بدء الأونلاين · التلقائي بدون مزامنة لاعبين\n' +
      '• أونلاين: نفس منطق الأوفلاين + مزامنة أونلاين بين اللاعبين\n\n' +
      'لا يمكن التبديل لاحقاً إلا بعد حذف المشروع بالكامل.'
    );
    msgEl.style.whiteSpace = 'pre-wrap';
    const off = document.createElement('button');
    off.type = 'button';
    off.className = 'hd-cancel';
    off.textContent = '📴 أوفلاين';
    off.onclick = () => { HawaUI._close(); resolve('offline'); };
    const on = document.createElement('button');
    on.type = 'button';
    on.className = 'hd-ok';
    on.textContent = '🌐 أونلاين';
    on.onclick = () => { HawaUI._close(); resolve('online'); };
    actions.appendChild(off);
    actions.appendChild(on);
    setTimeout(() => on.focus(), 30);
  });
}
/** يحدّد أونلاين/أوفلاين تلقائياً من نقاط الأونلاين — من غير ما يسأل المستخدم */
function autoDetectPlayNet() {
  try {
    const nOn = typeof countOnlineSpawns === 'function' ? countOnlineSpawns() : (S.objs || []).filter(o => o && o.type === 'online_spawn').length;
    return nOn > 0 ? 'online' : 'offline';
  } catch (_) {
    return 'offline';
  }
}
async function ensurePlayNetChosen(forceAsk) {
  if (window.HAWA_PLAY_ONLY) return S.playNet || autoDetectPlayNet();
  // لو محدد مسبقاً — رجّعه بس (من غير تنبيهات)
  if (S.playNet === 'online' || S.playNet === 'offline') {
    syncPlayNetUI();
    return S.playNet;
  }
  // تلقائي: وجود نقطة أونلاين = أونلاين، غير كده أوفلاين
  const choice = autoDetectPlayNet();
  applyPlayNetMode(choice, { silent: !forceAsk });
  syncPlayNetUI();
  return S.playNet;
}
async function onPlayNetBtn() {
  // إعادة كشف تلقائي + تلميح بالحالة الحالية
  const prev = S.playNet;
  const mode = autoDetectPlayNet();
  if (prev !== mode) applyPlayNetMode(mode, { silent: true });
  else syncPlayNetUI();
  try {
    tip(mode === 'online'
      ? '🌐 أونلاين تلقائي (فيه نقاط أونلاين)'
      : '📴 أوفلاين تلقائي (مفيش نقاط أونلاين — حط نقطة أونلاين عشان يتحوّل)');
  } catch (_) {}
}

function buildSpawnGhostMesh(o) {
  const isOn = o.type === 'online_spawn';
  const tint = isOn ? 0xef4444 : 0x22c55e;
  let root;
  try {
    if (typeof makeRig === 'function') {
      const rig = makeRig();
      root = rig.root;
      root.traverse(x => {
        if (!x.isMesh || !x.material) return;
        const mats = Array.isArray(x.material) ? x.material : [x.material];
        const out = mats.map(mat0 => {
          const m = mat0.clone();
          if (m.color) m.color.setHex(tint);
          m.transparent = true;
          m.opacity = 0.42;
          m.depthWrite = false;
          if (m.emissive) { m.emissive.setHex(tint); m.emissiveIntensity = 0.35; }
          m.needsUpdate = true;
          return m;
        });
        x.material = out.length === 1 ? out[0] : out;
        x.userData.base = x.material;
        x.frustumCulled = false;
      });
      try { if (typeof hardenPlayerRig === 'function') hardenPlayerRig(rig); } catch (_) {}
      
      if (isOn) {
        const slot = (o.p && o.p.slot) || 1;
        const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
        const g = canvas.getContext('2d');
        g.fillStyle = 'rgba(127,29,29,.9)'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff'; g.font = 'bold 32px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(slot), 32, 34);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(canvas), depthTest: false, transparent: true }));
        sp.position.y = 2.15; sp.scale.set(0.55, 0.55, 1); root.add(sp);
      }
      
      const ring = new T.Mesh(
        new T.RingGeometry(0.35, 0.48, 32),
        new T.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; root.add(ring);
      return root;
    }
  } catch (e) { console.warn('spawn ghost', e); }
  
  const g = new T.Group();
  const body = new T.Mesh(new T.CapsuleGeometry(0.28, 0.9, 4, 8), new T.MeshStandardMaterial({ color: tint, transparent: true, opacity: 0.45 }));
  body.position.y = 0.9; g.add(body);
  return g;
}

function mk(o) {
  const d = DEF[o.type]; let m;
  if (o.type === 'light') {
    m = new T.Group(); m.add(new T.PointLight(o.color, o.p.intensity, o.p.range));
    const s = new T.Mesh(G.sphere, mat(o.color, 'light')); s.scale.setScalar(.4); m.add(s);
  } else if (o.type === 'sobj') {
    m = new T.Group(); const b = new T.Mesh(G.cube, mat(o.color, 'sobj')); m.add(b); m.userData.body = b;
  } else if (o.type === 'respawn' || o.type === 'online_spawn') {
    m = buildSpawnGhostMesh(o);
  } else m = new T.Mesh(G[d.g], mat(o.color, o.type));
  m.userData.id = o.id; m.matrixAutoUpdate = false; scene.add(m); MESH.set(o.id, m);
  tf(o); look(o);
}
function tf(o) {
  const m = MESH.get(o.id); if (!m) return;
  m.position.set(o.pos[0], o.pos[1], o.pos[2]);
  m.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R, o.base ? 'YXZ' : 'XYZ');
  if (o.type === 'respawn' || o.type === 'online_spawn') {
    
    m.updateMatrix(); S.dirty = 1; return;
  }
  if (o.base && m.userData.body) {
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
  if (!o.p) o.p = {};
  const defs = fileDefaultParams(d.code, d.p);
  for (const k of Object.keys(defs)) if (o.p[k] === undefined) o.p[k] = defs[k];
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
    
    const p = fileDefaultParams(d.code, d.p);
    return add('sobj', pos, {def: d.id, name: d.name, p: JSON.parse(JSON.stringify(p)), base: !!info.base, scl: [...info.sc]});
  }
  if (info.bt === 'respawn') {
    
    const olds = S.objs.filter(x => x.type === 'respawn');
    for (const x of olds) {
      try {
        removePreview(x.id);
        const mm = MESH.get(x.id); if (mm) scene.remove(mm);
        MESH.delete(x.id); OBJ.delete(x.id);
      } catch (_) {}
    }
    S.objs = S.objs.filter(x => x.type !== 'respawn');
    const o = add('respawn', pos, { name: 'بداية أوفلاين', color: '#22c55e', scl: [1, 1, 1] });
    tip('✔ تم وضع نقطة الأوفلاين');
    try { refreshSpawnsPanel(); updSpawnBtn(); } catch (_) {}
    setTool('select');
    return o;
  }
  if (info.bt === 'online_spawn') {
    // وضع نقطة أونلاين يحوّل المشروع لأونلاين تلقائياً
    if (S.playNet !== 'online') {
      try { applyPlayNetMode('online', { silent: true }); } catch (_) { S.playNet = 'online'; }
    }
    if (countOnlineSpawns() >= 8) { tip('⚠ الحد الأقصى 8 نقاط أونلاين'); return null; }
    const slot = nextOnlineSlot();
    if (!slot) { tip('⚠ مفيش سلو متاح'); return null; }
    const o = add('online_spawn', pos, { name: 'أونلاين ' + slot, color: '#ef4444', p: { slot }, scl: [1, 1, 1] });
    tip('✔ تم وضع نقطة أونلاين · سلوت ' + slot);
    try { refreshSpawnsPanel(); updSpawnBtn(); syncPlayNetUI(); } catch (_) {}
    setTool('select');
    return o;
  }
  return add(info.bt, pos);
}
function delObj(id) {
  const wasOn = (() => { try { const o = OBJ.get(id); return o && o.type === 'online_spawn'; } catch (_) { return false; } })();
  removePreview(id);
  const m = MESH.get(id); if (m) scene.remove(m);
  MESH.delete(id); OBJ.delete(id); S.objs = S.objs.filter(o => o.id !== id);
  if (S.sel === id) sel(null); hier(); chg(); updOnRsBtn();
  // لو اتشالت آخر نقطة أونلاين → أوفلاين تلقائي
  if (wasOn) {
    try {
      const n = countOnlineSpawns();
      if (n === 0 && S.playNet === 'online') applyPlayNetMode('offline', { silent: true });
      else syncPlayNetUI();
    } catch (_) {}
  }
}
function dup() {
  const s = OBJ.get(S.sel); if (!s) return;
  const o = JSON.parse(JSON.stringify(s)); o.id = S.nid++; o.pos[0] += 1; o.name = s.name + ' ٢';
  reg(o); sel(o.id); hier(); chg();
}
function clearAll() { for (const id of [...MESH.keys()]) removePreview(id); for (const m of MESH.values()) scene.remove(m); MESH.clear(); OBJ.clear(); S.objs = []; sel(null); }

const GH = new T.Group(); GH.visible = false; scene.add(GH);
let ghKey = '';
let ghSimple = null;           
const GH_CACHE = new Map();    
const GHOST_OK = new T.MeshStandardMaterial({color: 0x34d399, transparent: true, opacity: .5, depthWrite: false, emissive: 0x22c55e, emissiveIntensity: .55, roughness: .7, metalness: .05, side: T.DoubleSide});
const GHOST_BAD = new T.MeshStandardMaterial({color: 0xf43f5e, transparent: true, opacity: .55, depthWrite: false, emissive: 0xf43f5e, emissiveIntensity: .5, roughness: .7, metalness: .05, side: T.DoubleSide});

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
    const gm = sandboxRun(root, true, () => new Function('Game', 'root', def.code)(bigGame(previewRt(), fakeO, root), root));
    killMedia(gm); sweepScriptUI();
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

function ghostRay() {
  if (S.hr) return S.hr;
  if (document.pointerLockElement === cv) return rayCenter().ray.clone();
  if (typeof MOB !== 'undefined' && MOB.on) {
    if (S.tr) return ray({clientX: S.tr.x, clientY: S.tr.y}).ray.clone();
    const r = cv.getBoundingClientRect();
    return ray({clientX: r.left + r.width / 2, clientY: r.top + r.height * 0.55}).ray.clone();
  }
  return null;
}
function tipNow(t, ms) {
  const el = $('#tip'); if (!el) return;
  el.textContent = t; clearTimeout(tipNow.t);
  if (t) tipNow.t = setTimeout(() => { el.textContent = ''; }, ms || 2600);
}
function ghostUpdate() {
  const gr = ghostRay();
  if (S.mode !== 'build' || (S.tool !== 'place' && S.tool !== 'respawn' && S.tool !== 'online_spawn') || !gr) {
    GH.visible = false;
    return;
  }
  const info = phInfo(), h = castRay(gr);
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
      try {
        const ed = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({color: 0xb6ffd9, depthTest: false, transparent: true}));
        ed.renderOrder = 999; ghSimple.add(ed);
      } catch (_) {}
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

const gizmo = new T.Group(); gizmo.visible = false; scene.add(gizmo);
const AXC = [0xef4444, 0x22c55e, 0x3b82f6];
const GZ = {move: new T.Group(), rot: new T.Group(), scl: new T.Group()};
gizmo.add(GZ.move, GZ.rot, GZ.scl);
const HIT = [];
const mkm = c => new T.MeshBasicMaterial({color: c, depthTest: false, transparent: true, opacity: .95});
const invis = () => new T.MeshBasicMaterial({visible: false});
AXC.forEach((c, i) => {   
  const g = new T.Group(), mt = mkm(c);
  const sh = new T.Mesh(new T.CylinderGeometry(.04, .04, 1.2, 8), mt); sh.position.y = .6;
  const cp = new T.Mesh(new T.ConeGeometry(.14, .4, 12), mt); cp.position.y = 1.4;
  const hit = new T.Mesh(new T.CylinderGeometry(.32, .32, 1.9, 10), invis()); hit.position.y = .9;
  [sh, cp].forEach(x => x.renderOrder = 999);
  g.add(sh, cp, hit); if (i === 0) g.rotation.z = -Math.PI / 2; if (i === 2) g.rotation.x = Math.PI / 2;
  GZ.move.add(g); HIT.push({m: hit, ax: i, mode: 'move', vis: [sh, cp]});
});
AXC.forEach((c, i) => {   
  const mt = mkm(c), g = new T.Group();
  const ring = new T.Mesh(new T.TorusGeometry(1.2, .045, 10, 80), mt);
  const hit = new T.Mesh(new T.TorusGeometry(1.2, .28, 8, 48), invis());
  ring.renderOrder = 999; hit.renderOrder = 999;
  g.add(ring, hit); if (i === 0) g.rotation.y = Math.PI / 2; if (i === 1) g.rotation.x = Math.PI / 2;
  GZ.rot.add(g); HIT.push({m: hit, ax: i, mode: 'rotate', vis: [ring]});
});
AXC.forEach((c, i) => {   
  const g = new T.Group(), mt = mkm(c);
  const sh = new T.Mesh(new T.CylinderGeometry(.03, .03, 1.2, 8), mt); sh.position.y = .6;
  const cp = new T.Mesh(new T.BoxGeometry(.26, .26, .26), mt); cp.position.y = 1.3;
  const hit = new T.Mesh(new T.CylinderGeometry(.32, .32, 1.9, 10), invis()); hit.position.y = .9;
  g.add(sh, cp, hit); if (i === 0) g.rotation.z = -Math.PI / 2; if (i === 2) g.rotation.x = Math.PI / 2;
  GZ.scl.add(g); HIT.push({m: hit, ax: i, mode: 'scale', vis: [sh, cp]});
});
let HOV = null;
function hiAx(rec, on) { if (rec) rec.vis.forEach(v => v.material.color.set(on ? 0xfff06a : AXC[rec.ax])); }
function hoverGizmo(e) {
  if (!S.sel || !gizmo.visible || S.mode !== 'build' || S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') {
    if (HOV) { hiAx(HOV, false); HOV = null; S.dirty = 1; } return;
  }
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
  $('#gzHint').textContent = '';
  S.dirty = 1;
}
function updGzParamsBtn() {
  const b = document.getElementById('gParams');
  if (!b) return;
  const o = OBJ.get(S.sel);
  const show = !!(o && o.type === 'sobj' && S.mode === 'build');
  b.style.display = show ? '' : 'none';
  b.classList.toggle('on', !!S.paramOpen);
}
function ugizmo() {
  try { updGzParamsBtn(); } catch (_) {}

  const o = OBJ.get(S.sel), g = $('#gz');
  // أثناء وضع كائن: اخفِ الجيزمو عشان تقدر تحط حوالين الكائن من غير ما المحاور تعترض
  const placingNow = (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn');
  if (!o || S.mode !== 'build' || placingNow) { gizmo.visible = false; if (g) g.hidden = true; return; }
  const cy = o.base ? o.pos[1] + o.scl[1] / 2 : o.pos[1];
  g.hidden = false; gizmo.visible = true; gizmo.position.set(o.pos[0], cy, o.pos[2]);
  try { fatHits(!!(typeof MOB !== 'undefined' && MOB.on)); } catch (_) {}
  // موبايل: محاور أصغر بوضوح عشان متشفطش المنطقة حوالين الجسم
  const gzMul = (typeof MOB !== 'undefined' && MOB.on) ? .14 : .22;
  gizmo.scale.setScalar(cam.position.distanceTo(gizmo.position) * gzMul); gizmo.updateMatrixWorld(true);
  if (typeof MOB !== 'undefined' && MOB.on) {
    
    g.style.left = '';
    g.style.top = '';
    return;
  }
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
    
    sel((o.type === 'respawn' || o.type === 'online_spawn') ? null : o.id); hier(); chg(); return;
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
  drag = {o, ax: h.ax, mode: h.mode, pid: e.pointerId, t0: axT(ray(e).ray, o.pos, AX[h.ax]), pos: [...o.pos], rot: [...o.rot], scl: [...o.scl], x0: e.clientX, y0: e.clientY, rec: h};
  dragLight(h, true);
}

function dragLight(rec, on) {
  if (!rec) return;
  try {
    for (const h of HIT) {
      if (h.mode !== rec.mode) continue;
      for (const v of h.vis) {
        v.material.opacity = on ? (h === rec ? 1 : .28) : .95;
        if (h === rec) v.material.color.set(on ? 0xfff06a : AXC[h.ax]);
      }
      if (on && h === rec) { h.vis.forEach(v => v.scale.setScalar(1)); }
    }
    if (on && HOV && HOV !== rec) { HOV = null; }
  } catch (_) {}
  S.dirty = 1;
}
function endDrag(commit) {
  if (!drag) return false;
  const rec = drag.rec;
  drag = null;
  dragLight(rec, false);
  if (commit) { try { chg(); } catch (_) {} }
  return true;
}

let _fatHits = false;
function fatHits(on) {
  if (on === _fatHits) return; _fatHits = on;
  for (const h of HIT) {
    const old = h.m.geometry;
    // موبايل: hit أصغر بكتير (كان 0.72/0.6 بيشفط حوالين الجسم)
    // لسه قابل للمس بس مش بياخد نصف الشاشة
    h.m.geometry = h.mode === 'rotate'
      ? new T.TorusGeometry(1.2, on ? .22 : .28, 8, 48)
      : new T.CylinderGeometry(on ? .28 : .32, on ? .28 : .32, on ? 1.7 : 1.9, 10);
    try { old.dispose(); } catch (_) {}
  }
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

function selHelper() {
  if (SELH) { scene.remove(SELH); SELH = null; }
  const m = S.sel != null && MESH.get(S.sel);
  
  if (m && S.mode === 'build' && !(typeof MOB !== 'undefined' && MOB.on)) {
    SELH = new T.BoxHelper(m, 0x39ff7a); SELH.material.depthTest = false; SELH.renderOrder = 998;
    scene.add(SELH);
  }
  S.dirty = 1;
}

const allMeshes = () => [...MESH.values()];
function pickObj(rc) {
  for (const x of rc.intersectObjects(allMeshes(), true)) { let m = x.object; while (m && m.userData.id == null) m = m.parent; if (m) return m.userData.id; }
  return null;
}
function sel(id) { S.sel = id; inspect(); hierMark(); selHelper(); try { updGzParamsBtn(); if (S.paramOpen) openParamPanel(true); else closeParamPanel(); } catch (_) {} }
function click(e) {
  const rc = ray(e), r = rc.ray;
  if (S.pick) {                         
    const hid = pickObj(rc);
    if (hid != null) { sel(hid); if (!S.showCoord) toggleCoord(); } else tip('');
    return;
  }
  if (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') {
    const info = phInfo(), h = castRay(r);
    if (!h) return tip('⚠ اضغط على سطح (أرض أو كائن)');
    const sp = spotFor(info, h);
    if (!sp.ok) return tip('⚠ المكان مشغول — اختار مكان فاضي');
    const o = placeNow(info, sp.p); if (!o) return;
    
    sel((o.type === 'respawn' || o.type === 'online_spawn') ? null : o.id); hier(); chg(); return;
  }
  const h = pickObj(rc);
  if (S.tool === 'delete') { if (h != null) delObj(h); return; }
  if (S.tool === 'boxdel') return;
  sel(h);
}

function act(a) {
  const o = OBJ.get(S.sel); if (!o) return;
  if (a === 'dup') return dup();
  if (a === 'del') return delObj(o.id);
  const f = aabbOf(o);
  if (a === 'up') { o.pos[1] += S.snap || 1; tip('⬆ طلوع'); }
  else if (a === 'down') { o.pos[1] = supportY(f, f.y0 + E) + (o.pos[1] - f.y0); tip('⬇ نزول'); }
  else if (a === 'fly') { o.pos[1] = supportY(f, f.y0 + E) + (o.pos[1] - f.y0) + 3; tip('✈ طيران'); }
  else if (a === 'vis') { o.hidden = !o.hidden; look(o); refreshPreview(o); tip(o.hidden ? 'مخفي: لن يظهر في الاختبار' : 'ظاهر في الاختبار'); inspect(); }
  if (a !== 'vis') tf(o);
  refreshTf(); updVis(); hier(); chg();
}
function updVis() {
  const o = OBJ.get(S.sel), b = $('#gVis'); if (!b) return;
  b.querySelector('.ico').innerHTML = ic(o && o.hidden ? 'eyeoff' : 'eye');
  $('#gVisT').textContent = o && o.hidden ? 'إظهار' : 'إخفاء';
}

function toggleFly() {
  S.fly = !S.fly; updModes();
  tip(S.fly ? 'وضع الطيران' : 'وضع البناء');
}
function toggleLock() {
  if (document.pointerLockElement === cv) document.exitPointerLock();
  else if (cv.requestPointerLock) cv.requestPointerLock();
}
document.addEventListener('pointerlockchange', () => { updModes(); });
function updModes() {
  try { const _bf = $('#bFly'); if (_bf) _bf.classList.toggle('on', S.fly); } catch (_) {}
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
  // أثناء وضع كائن: تجاهل محاور الجيزمو عشان تقدر تحط حول الكائن المختار
  const placingTool = (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn');
  if (e.button === 0 && S.sel != null && gizmo.visible && !placingTool && !S.pick) {
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
  if (drag) { if (drag.pid == null || e.pointerId === drag.pid) doDrag(e); return; }
  if (mv.b === 2) { if (e.shiftKey) pan(dx, dy); else { OB.yaw -= dx * .005; OB.pitch = clamp(OB.pitch + dy * .005, -1.5, 1.5); camUpdate(); } }
  else if (mv.b === 1) pan(dx, dy);
});
cv.addEventListener('pointerleave', () => { S.hr = null; });
function _endPointerGesture() {
  mv = null; rmb = false;
  if (S.boxdel) { S.boxdel = null; try { _marqueeShow(null); } catch (_) {} }
  if (drag) endDrag(true);
}
cv.addEventListener('pointercancel', e => { if (S.mode === 'build') _endPointerGesture(); });
cv.addEventListener('lostpointercapture', e => { if (S.mode === 'build' && drag && (drag.pid == null || e.pointerId === drag.pid)) _endPointerGesture(); });
cv.addEventListener('pointerup', e => {
  if (S.mode !== 'build' || !mv) return;
  if (drag && drag.pid != null && e.pointerId !== drag.pid) return;   
  const m = mv; mv = null; rmb = false;
  if (S.boxdel && S.tool === 'boxdel') {
    const n = _marqueeDelete(S.boxdel);
    S.boxdel = null; _marqueeShow(null);
    if (n > 0) { tip('🗑 اتحذف ' + n + ' كائن'); hier(); chg(); }
    else tip('مفيش كائنات جوه المستطيل');
    return;
  }
  if (drag) { endDrag(true); return; }
  
  if (m.b === 0 && m.moved < 5 && !(typeof MOB !== 'undefined' && MOB.on && e.pointerType === 'touch')) click(e);
});
cv.addEventListener('wheel', e => {
  e.preventDefault();
  
  if (S.mode === 'play') return;
  OB.dist = clamp(OB.dist * (1 + Math.sign(e.deltaY) * .1), 1.5, 400); camUpdate();
}, {passive: false});
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mousedown', e => { if (e.button === 0) K.Mouse0 = 1; if (e.button === 2) K.Mouse2 = 1; });
addEventListener('mouseup', e => { if (e.button === 0) K.Mouse0 = 0; if (e.button === 2) K.Mouse2 = 0; });

let ctrlPend = false;
// —— منع لزق المفاتيح عند الخروج من النافذة/التطبيق ——
(function bindKeyUnstick() {
  const wipe = () => { try { clearAllKeys('focus-lost'); } catch (_) {} ctrlPend = false; };
  // window blur: Alt+Tab / تطبيق تاني
  window.addEventListener('blur', wipe);
  // الصفحة مخفية (تبويب تاني / تصغير)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || document.visibilityState === 'hidden') wipe();
  });
  // إغلاق/تجميد الصفحة
  window.addEventListener('pagehide', wipe);
  // الرجوع للنافذة: امسح كمان (لو مفتاح اتفلت برة من غير keyup)
  window.addEventListener('focus', wipe);
  document.addEventListener('focusin', () => { /* لا تمسح عند التركيز على input */ });
  // خروج من pointer lock
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement) wipe();
  });
  // لو المتصفح علّق الـ keyup
  window.addEventListener('mouseup', e => {
    if (e.button === 0) K.Mouse0 = 0;
    if (e.button === 2) { K.Mouse2 = 0; try { rmb = false; } catch (_) {} }
  });
})();
addEventListener('keyup', e => {
  K[e.code] = 0;
  try { delete K[e.code]; } catch (_) {}
  if (e.key === 'Control' && ctrlPend && S.mode === 'build') toggleLock();
  if (e.key === 'Control') ctrlPend = false;
});
addEventListener('keydown', e => {
  // لو الصفحة مش ظاهرة: متسجّلش ضغطات
  if (document.hidden || document.visibilityState === 'hidden') return;
  if (e.target && e.target.matches && e.target.matches('input,textarea,select,[contenteditable="true"]')) return;
  K[e.code] = 1;
  if (e.key !== 'Control') ctrlPend = false;
  if (S.mode === 'play') {
    if (e.code === 'Space') e.preventDefault();
    
    if (e.code === 'KeyP') playStop();
    
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

function tip(t) {
  const s = (t == null) ? '' : String(t);
  if (s && s.indexOf('⚠') === -1 && s.indexOf('ERROR') === -1) { $('#tip').textContent = ''; return; }
  $('#tip').textContent = s;
  clearTimeout(tip.t);
  tip.t = setTimeout(() => { $('#tip').textContent = ''; }, 2200);
}
function armedMobile() {   
  try { if (typeof MOB !== 'undefined' && MOB.on) { MOB.closeSheets(); S.dirty = 1;  } } catch (_) {}
}
function setTool(t) {
  S.tool = t;
  
  if (S._spReopen && t !== 'respawn' && t !== 'online_spawn') {
    S._spReopen = false;
    setTimeout(() => { try { openSpawnsPanel(); } catch (_) {} }, 0);
  }
  $$('#tools [data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  const brs = document.getElementById('bRs'); if (brs) brs.classList.toggle('on', t === 'respawn');
  const bsp = document.getElementById('bSpawns'); if (bsp) bsp.classList.toggle('on', t === 'respawn' || t === 'online_spawn');
  updOnRsBtn();
  cv.style.cursor = t === 'select' ? 'default' : (t === 'boxdel' ? 'crosshair' : 'crosshair');
  if (t !== 'boxdel') { S.boxdel = null; _marqueeShow && _marqueeShow(null); }
  $('#tip').textContent = HINT[t] || ''; S.hr = null; S.tr = null; S.tapArm = null; ghKey = ''; cats(); sList();
}
function setSec(s) {
  S.section = s; $('#catP').hidden = s !== 'objects'; $('#progP').hidden = s !== 'prog'; $('#sobjP').hidden = s !== 'sobj';
  $$('#secs [data-sec],#mSecs [data-sec]').forEach(b => b.classList.toggle('on', b.dataset.sec === s));
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
$('#grid').onclick = e => { const b = e.target.closest('[data-it]'); if (!b) return; S.item = b.dataset.it; setTool('place'); armedMobile(); };
$('#q').oninput = cats;
$('#tools').onclick = e => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); };
$('#secs').onclick = e => { const b = e.target.closest('[data-sec]'); if (b) setSec(b.dataset.sec); };
if ($('#mSecs')) $('#mSecs').onclick = e => { const b = e.target.closest('[data-sec]'); if (b) setSec(b.dataset.sec); };
try { const _bfly = document.getElementById('bFly'); if (_bfly) _bfly.onclick = toggleFly; } catch (_) {}
$('#bPar').onclick = () => { document.body.classList.toggle('noside'); $('#bPar').classList.toggle('on', !document.body.classList.contains('noside')); setTimeout(resize, 30); };
const _bSpawns = document.getElementById('bSpawns');
if (_bSpawns) _bSpawns.onclick = () => openSpawnsPanel();

const _bRs = document.getElementById('bRs'); if (_bRs) _bRs.onclick = () => openSpawnsPanel();
const _bOnRs = document.getElementById('bOnRs'); if (_bOnRs) _bOnRs.onclick = () => openSpawnsPanel();
$('#bSnap').onclick = () => {
  const L = [0, .25, .5, 1];
  S.snap = L[(L.indexOf(S.snap) + 1) % 4];
  try { $('#bSnap .snap-l').textContent = S.snap ? String(S.snap) : 'حر'; } catch (_) {}
  try { chg(); } catch (_) {}
};

const HAWA_ASSET_NAMES = ['game.html', 'play-runtime.js', 'three.min.js', 'peerjs.min.js', 'jszip.min.js'];
const HAWA_ASSETS = {}; 
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

function detectPlayNet(data) {
  if (!data) return null;
  if (data.playNet === 'online' || data.playNet === 'offline') return data.playNet;
  if (data.meta && (data.meta.playNet === 'online' || data.meta.playNet === 'offline')) return data.meta.playNet;
  const objs = data.objs || [];
  if (objs.some(o => o && o.type === 'online_spawn')) return 'online';
  if ((data.onlineSpawns || []).length > 0) return 'online';
  return 'offline';
}

async function confirmPlayNetMismatch(data, targetMode) {
  const fileMode = detectPlayNet(data);
  if (!fileMode) return true;
  
  const cur = (targetMode === 'online' || targetMode === 'offline')
    ? targetMode
    : ((S.playNet === 'online' || S.playNet === 'offline') ? S.playNet : null);
  
  if (!cur || cur === fileMode) return true;
  const fromL = cur === 'online' ? 'أونلاين' : 'أوفلاين';
  const toL = fileMode === 'online' ? 'أونلاين' : 'أوفلاين';
  const warnExtra = (fileMode === 'online')
    ? '\nبعد التأكيد هيتحوّل المشروع الحالي لوضع الأونلاين (نقاط الأونلاين من الملف هتُحمَّل).'
    : '\nبعد التأكيد هيتحوّل المشروع الحالي لوضع الأوفلاين (نقاط الأونلاين الحالية هتتشال).';
  return await uiConfirm(
    '⚠ المشروع الحالي «' + fromL + '» والملف المرفوع «' + toL + '».\n\n'
    + 'هل أنت متأكد من التحويل من «' + fromL + '» إلى «' + toL + '»؟'
    + warnExtra
  );
}

function packGameData(name) {
  const objs = JSON.parse(JSON.stringify(S.objs));
  const scripts = JSON.parse(JSON.stringify(S.scripts));
  const sdefs = JSON.parse(JSON.stringify(S.sdefs));
  
  const netMode = (S.playNet === 'online' || S.playNet === 'offline')
    ? S.playNet
    : (objs.some(o => o.type === 'online_spawn') ? 'online' : 'offline');
  return {
    version: '2.3',
    engine: 'Hawa Engine',
    name: name || '',
    playNet: netMode,
    allowScriptSpawn: true,
    roomMinEnabled: !!S.roomMinEnabled,
    roomMinPlayers: roomMinPlayers(),
    roomMinPlayersSetting: Math.max(2, Math.floor(+S.roomMinPlayers || 2)),
    roomFillExact: !!S.roomFillExact,
    roomMaxPlayers: roomMaxPlayers(),
    objs,
    scripts,
    sdefs,
    media: JSON.parse(JSON.stringify(S.media || {})),
    mediaOrder: Array.isArray(S.mediaOrder) ? S.mediaOrder.slice() : Object.keys(S.media || {}),
    mid: S.mid || 1,
    nid: S.nid, sid: S.sid, did: S.did,
    player: (typeof PCFG !== 'undefined') ? JSON.parse(JSON.stringify(PCFG)) : null,
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
      offlineSpawns: objs.filter(o => o.type === 'respawn').length,
      playNet: netMode,
      roomMinPlayers: roomMinPlayers(),
      roomMaxPlayers: roomMaxPlayers(),
      roomFillExact: !!S.roomFillExact,
      roomMinEnabled: !!S.roomMinEnabled,
      playersLabel: roomPlayersLabel()
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

const ConvUI = {
  el: null, steps: new Map(), url: null, fname: '',
  open(title) {
    this.close();
    const el = document.createElement('div');
    el.id = 'convOv';
    el.innerHTML =
      '<div class="cv-box" role="dialog" aria-modal="true">' +
      '<div class="cv-h"><span class="cv-spin" id="cvSpin"></span><b id="cvTitle"></b></div>' +
      '<div class="cv-bar"><i id="cvBar"></i></div>' +
      '<div class="cv-pct" id="cvPct">0%</div>' +
      '<ul class="cv-steps" id="cvSteps"></ul>' +
      '<div class="cv-rep" id="cvRep" hidden></div>' +
      '<div class="cv-btns" id="cvBtns"></div>' +
      '</div>';
    document.body.appendChild(el);
    this.el = el; this.steps = new Map();
    el.querySelector('#cvTitle').textContent = title;
    return this;
  },
  close() {
    if (this.el) { this.el.remove(); this.el = null; }
    if (this.url) { try { URL.revokeObjectURL(this.url); } catch (_) {} this.url = null; }
  },
  pct(p) {
    if (!this.el) return;
    p = Math.max(0, Math.min(100, Math.round(p)));
    this.el.querySelector('#cvBar').style.width = p + '%';
    this.el.querySelector('#cvPct').textContent = p + '%';
  },
  step(id, label, state) { 
    if (!this.el) return;
    let li = this.steps.get(id);
    if (!li) {
      li = document.createElement('li');
      li.innerHTML = '<span class="cv-i"></span><span class="cv-t"></span>';
      this.el.querySelector('#cvSteps').appendChild(li);
      this.steps.set(id, li);
    }
    li.className = 's-' + (state || 'wait');
    li.querySelector('.cv-i').textContent = ({run: '⏳', ok: '✔', warn: '⚠', err: '✖', wait: '•'})[state || 'wait'];
    li.querySelector('.cv-t').textContent = label;
  },
  report(lines, cls) {
    if (!this.el) return;
    const r = this.el.querySelector('#cvRep');
    r.hidden = false; r.className = 'cv-rep ' + (cls || '');
    r.innerHTML = '';
    for (const l of lines) { const d = document.createElement('div'); d.textContent = l; r.appendChild(d); }
  },
  finish(title, ok, buttons) {
    if (!this.el) return;
    this.el.querySelector('#cvTitle').textContent = title;
    const sp = this.el.querySelector('#cvSpin'); sp.className = 'cv-spin ' + (ok ? 'done' : 'fail'); sp.textContent = ok ? '✔' : '✖';
    const b = this.el.querySelector('#cvBtns'); b.innerHTML = '';
    for (const x of buttons) {
      const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = x.t;
      if (x.pri) bt.className = 'pri';
      bt.onclick = x.fn; b.appendChild(bt);
    }
  }
};
const cvTick = () => new Promise(r => setTimeout(r, 25));
function dataUrlToU8(dataUrl) {
  const s = String(dataUrl), c = s.indexOf(',');
  const bin = atob(c > 0 ? s.slice(c + 1) : s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
const cvSafeName = s => String(s || '').replace(/[^\w\u0600-\u06FF.\-]+/g, '_');

function auditGameData(data) {
  const errors = [], warnings = [];
  const objs = data.objs || [], scripts = data.scripts || [], sdefs = data.sdefs || [];
  const media = data.media || {};
  if (!objs.length) errors.push('المشروع فاضي — مفيش ولا كائن.');
  
  for (const o of objs) {
    if (o.type === 'sobj' && !sdefs.some(d => +d.id === +o.def)) errors.push('الكائن «' + (o.name || o.id) + '» كائن برمجي بدون ملف تعريف (def=' + o.def + ').');
    for (const sid of (o.scripts || [])) if (!scripts.some(s => +s.id === +sid)) warnings.push('الكائن «' + (o.name || o.id) + '» مربوط بسكربت ' + sid + ' مش موجود.');
  }
  
  const refs = collectMediaRefs(data);
  const lost = [];
  for (const id of refs) if (!media[id] || !media[id].data) lost.push(id);
  if (lost.length) errors.push('وسائط مُشار إليها في البارامترات ومش موجودة/فاضية: ' + lost.join(', '));
  for (const id of Object.keys(media)) if (!media[id] || !media[id].data) warnings.push('ملف «' + ((media[id] && media[id].name) || id) + '» في «ملفاتي» بدون بيانات.');
  
  const chk = (kind, x) => {
    try { new Function('Game', 'root', 'game', String(x.code || '')); }
    catch (e) { warnings.push('خطأ صياغة في ' + kind + ' «' + (x.name || x.id) + '»: ' + (e.message || e)); }
  };
  scripts.forEach(s => chk('سكربت', s));
  sdefs.forEach(d => chk('كائن برمجي', d));
  
  if (data.playNet === 'online') {
    if (!(data.onlineSpawns || []).length) errors.push('وضع أونلاين بدون نقاط أونلاين.');
  } else if (!(data.offlineSpawns || []).length) {
    warnings.push('مفيش نقطة بدء أوفلاين — اللاعب هيبدأ من الموضع الافتراضي.');
  }
  return {errors, warnings, refs: refs.size};
}

let convBusy = false;
async function convertToGame() {
  if (convBusy || ConvUI.el) return;      
  convBusy = true;
  try { await convertToGameImpl(); } finally { convBusy = false; }
}
async function convertToGameImpl() {
  if (typeof JSZip === 'undefined') { tip('⚠ JSZip غير محمّل — حدّث الصفحة'); return; }
  if (ConvUI.el) return;
  try { await ensurePlayNetChosen(false); } catch (_) {}
  const nOn = countOnlineSpawns();
  const mode = (S.playNet === 'online' || S.playNet === 'offline') ? S.playNet : (nOn > 0 ? 'online' : 'offline');
  if (mode === 'offline') {
    if (nOn > 0) {
      if (!await uiConfirm('المشروع أوفلاين وفيه نقاط أونلاين. التحويل هيصدرها كأوفلاين فقط (النقاط مش هتُستخدم في الأونلاين). تكمل؟')) return;
    } else {
      if (!await uiConfirm('هيتصدر اللعبة كـ «أوفلاين» فقط — مش هتشتغل في وضع الأونلاين. تكمل؟')) return;
    }
  } else {
    if (nOn < 1) { await uiAlert('المشروع أونلاين ومفيش نقاط أونلاين.\nحط على الأقل نقطة أونلاين واحدة قبل التحويل.'); return; }
    if (nOn < 3 && !await uiConfirm('عندك ' + nOn + ' نقطة أونلاين من 3. هيتصدر اللعبة للأونلاين. تكمل؟')) return;
  }
  const name = await uiPrompt('اسم اللعبة؟', 'لعبتي');
  if (!name || !name.trim()) return tip('تم الإلغاء');

  const ui = ConvUI.open('جاري تحويل «' + name.trim() + '» إلى لعبة…');
  ui.step('pack', 'تجميع بيانات المشروع', 'wait');
  ui.step('audit', 'فحص الكائنات والسكربتات والوسائط', 'wait');
  ui.step('rt', 'جلب ملفات التشغيل (المحرك + الأنماط + الشبكة)', 'wait');
  ui.step('inj', 'حقن الملفات والوسائط داخل اللعبة', 'wait');
  ui.step('zip', 'ضغط الحزمة', 'wait');
  ui.step('ver', 'التحقق من سلامة الحزمة', 'wait');
  ui.step('dl', 'التحميل', 'wait');
  ui.pct(0);
  let cancelled = false;
  ui.finish('جاري تحويل «' + name.trim() + '» إلى لعبة…', true, []);
  { const sp = ui.el.querySelector('#cvSpin'); sp.className = 'cv-spin'; sp.textContent = ''; }
  ui.el.querySelector('#cvBtns').innerHTML = '';
  const cb = document.createElement('button'); cb.type = 'button'; cb.textContent = 'إلغاء';
  cb.onclick = () => { cancelled = true; ui.close(); };
  ui.el.querySelector('#cvBtns').appendChild(cb);
  const alive = () => !cancelled && ConvUI.el;

  try {
    
    ui.step('pack', 'تجميع بيانات المشروع', 'run'); await cvTick();
    const data = packGameData(name.trim());
    data.playNet = mode;
    if (data.meta) data.meta.playNet = mode;
    const mediaMap = Object.assign({}, S.media || {}, data.media || {});
    data.media = JSON.parse(JSON.stringify(mediaMap));
    data.mediaOrder = Array.isArray(S.mediaOrder) ? S.mediaOrder.slice() : Object.keys(mediaMap);
    data.meta.mediaCount = Object.keys(mediaMap).length;
    ui.step('pack', 'تجميع بيانات المشروع — ' + data.scripts.length + ' سكربت · ' + data.sdefs.length + ' كائن برمجي · ' + (data.meta.mediaCount || 0) + ' ملف' + (mode === 'online' ? (' · ' + roomPlayersLabel()) : ''), 'ok');
    ui.pct(8);
    if (!alive()) return;

    
    ui.step('audit', 'فحص الكائنات والسكربتات والوسائط', 'run'); await cvTick();
    const au = auditGameData(data);
    if (au.errors.length) {
      ui.step('audit', 'الفحص: ' + au.errors.length + ' خطأ يمنع التصدير', 'err');
      ui.report(au.errors.concat(au.warnings.map(w => '⚠ ' + w)), 'err');
      ui.finish('التحويل اتوقف — صلّح الأخطاء دي', false, [{t: 'إغلاق', pri: true, fn: () => ui.close()}]);
      return;
    }
    ui.step('audit', au.warnings.length ? 'الفحص تمام (مع ' + au.warnings.length + ' تحذير)' : 'الفحص تمام — مفيش مشاكل', au.warnings.length ? 'warn' : 'ok');
    ui.pct(16);
    if (!alive()) return;

    
    ui.step('rt', 'جلب ملفات التشغيل', 'run');
    const required = [
      ['three.min.js', 'three.min.js'], ['engine.js', 'engine.js'], ['style.css', 'style.css'],
      ['play.html', 'play.html'], ['index.html', 'play.html'], ['game.html', 'game.html'],
      ['peerjs.min.js', 'peerjs.min.js'], ['jszip.min.js', 'jszip.min.js'], ['play-runtime.js', 'play-runtime.js']
    ];
    const bufs = new Map(), missing = [];
    let k = 0;
    for (const [, src] of required) {
      if (!bufs.has(src)) {
        const b = await getAssetBuf(src);
        if (b) bufs.set(src, b); else missing.push(src);
      }
      k++; ui.pct(16 + 24 * k / required.length);
      if (!alive()) return;
    }
    if (missing.length) {
      ui.step('rt', 'ملفات التشغيل ناقصة: ' + missing.join(', '), 'err');
      ui.report(['مش قادر أجيب: ' + missing.join(', '), 'افتح المحرك عن طريق START_SERVER.bat (مش file://) وحدّث الصفحة (Ctrl+F5) وجرّب تاني.'], 'err');
      ui.finish('التحويل اتوقف — ملفات التشغيل ناقصة', false, [{t: 'إغلاق', pri: true, fn: () => ui.close()}]);
      return;
    }
    ui.step('rt', 'ملفات التشغيل جاهزة (' + bufs.size + ' ملف)', 'ok');

    
    ui.step('inj', 'حقن الملفات والوسائط', 'run'); await cvTick();
    const zip = new JSZip();
    const included = [];
    const addF = (path, content) => { zip.file(path, content); included.push(path); };
    const sizes = {};
    for (const [zipName, src] of required) { addF(zipName, bufs.get(src)); sizes[zipName] = bufs.get(src).byteLength; }

    
    const assetMap = {};
    const mids = Object.keys(mediaMap).filter(id => mediaMap[id] && mediaMap[id].data);
    let mi = 0;
    for (const id of mids) {
      const m = mediaMap[id];
      try {
        const arr = dataUrlToU8(m.data);
        const path = 'assets/' + id + '_' + cvSafeName(m.name || id);
        addF(path, arr); assetMap[id] = {path, size: arr.length};
      } catch (err) { ui.step('inj', 'فشل حقن ملف «' + (m.name || id) + '»: ' + err.message, 'err'); throw err; }
      mi++; ui.pct(40 + 20 * mi / Math.max(1, mids.length));
      if (mi % 3 === 0) await cvTick();
      if (!alive()) return;
    }
    
    let inl = 0;
    for (const o of data.objs) {
      if (!o.p) continue;
      for (const [kk, v] of Object.entries(o.p)) {
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 32) {
          try { addF('assets/inline_' + o.id + '_' + cvSafeName(kk) + '.bin', dataUrlToU8(v)); inl++; } catch (_) {}
        }
      }
    }
    data.meta.assetFiles = mids.length + inl;

    
    data.player = JSON.parse(JSON.stringify(PCFG));
    const jsonStr = JSON.stringify(data);
    addF('game.json', jsonStr);
    addF('game-data.js', 'window.HAWA_EMBEDDED_GAME = ' + jsonStr + ';\n');
    addF('player_config.json', JSON.stringify(data.player, null, 2));
    const manifest = {
      name: data.name, exportedAt: data.exportedAt, playNet: mode,
      counts: {objects: data.objs.length, scripts: data.scripts.length, sdefs: data.sdefs.length,
        media: mids.length, inlineAssets: inl, onlineSpawns: data.onlineSpawns.length, offlineSpawns: data.offlineSpawns.length},
      mediaFiles: assetMap, warnings: au.warnings
    };
    addF('manifest.json', JSON.stringify(manifest, null, 2));
    addF('README.txt',
      'Hawa Game: ' + data.name + '\n========================\n' +
      'شغّل index.html أو game.html في Chrome/Edge (مباشرة أو من سيرفر).\n\nالمحتويات:\n' +
      included.map(x => ' - ' + x).join('\n') + '\n\n' +
      'كائنات: ' + data.meta.objectCount + '\nسكربتات: ' + data.meta.scriptCount + '\nكائنات برمجية: ' + data.meta.sdefCount +
      '\nملفات ووسائط: ' + data.meta.assetFiles + '\nنقاط أونلاين: ' + data.meta.onlineSlots + '\nنقاط أوفلاين: ' + data.meta.offlineSpawns +
      '\nتاريخ التصدير: ' + data.exportedAt + '\n');
    ui.step('inj', 'تم الحقن — ' + mids.length + ' ملف وسائط + ' + inl + ' بارامتر مضمّن + الشخصية + الكود', 'ok');
    ui.pct(62);
    if (!alive()) return;

    
    ui.step('zip', 'ضغط الحزمة', 'run'); await cvTick();
    const blob = await zip.generateAsync({type: 'blob', compression: 'DEFLATE', compressionOptions: {level: 6}},
      meta => { ui.pct(62 + 24 * (meta.percent || 0) / 100); ui.step('zip', 'ضغط الحزمة — ' + Math.round(meta.percent || 0) + '%', 'run'); });
    ui.step('zip', 'تم الضغط — ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB', 'ok');
    ui.pct(88);
    if (!alive()) return;

    
    ui.step('ver', 'التحقق من سلامة الحزمة', 'run'); await cvTick();
    const vz = await JSZip.loadAsync(blob);
    const bad = [];
    for (const p of included) if (!vz.file(p)) bad.push('ناقص: ' + p);
    const gj = JSON.parse(await vz.file('game.json').async('string'));
    const gd = await vz.file('game-data.js').async('string');
    const gdj = JSON.parse(gd.slice(gd.indexOf('=') + 1).trim().replace(/;$/, ''));
    for (const [lbl, g] of [['game.json', gj], ['game-data.js', gdj]]) {
      if ((g.objs || []).length !== data.objs.length) bad.push(lbl + ': عدد الكائنات مختلف');
      if ((g.scripts || []).length !== data.scripts.length) bad.push(lbl + ': عدد السكربتات مختلف');
      if ((g.sdefs || []).length !== data.sdefs.length) bad.push(lbl + ': عدد الكائنات البرمجية مختلف');
      if (Object.keys(g.media || {}).length !== Object.keys(data.media).length) bad.push(lbl + ': عدد الوسائط مختلف');
      if (!g.player) bad.push(lbl + ': بيانات الشخصية ناقصة');
      if (g.playNet !== mode) bad.push(lbl + ': وضع اللعب مختلف');
    }
    for (const id of Object.keys(assetMap)) {
      const f = vz.file(assetMap[id].path);
      if (!f) { bad.push('وسيط ناقص: ' + id); continue; }
      const u = await f.async('uint8array');
      if (u.length !== assetMap[id].size) bad.push('وسيط تالف: ' + id);
    }
    for (const [n, sz] of Object.entries(sizes)) {
      const f = vz.file(n); if (!f) continue;
      const u = await f.async('uint8array'); if (u.length !== sz) bad.push('ملف تشغيل تالف: ' + n);
    }
    if (bad.length) {
      ui.step('ver', 'التحقق فشل (' + bad.length + ')', 'err');
      ui.report(bad, 'err');
      ui.finish('الحزمة فيها مشكلة — ما اتحمّلتش', false, [{t: 'إغلاق', pri: true, fn: () => ui.close()}]);
      return;
    }
    ui.step('ver', 'الحزمة سليمة — كل الملفات والبيانات متطابقة مع المشروع', 'ok');
    ui.pct(96);

    
    ui.step('dl', 'التحميل', 'run'); await cvTick();
    ui.fname = (data.name.replace(/[^\w\u0600-\u06FF\-]+/g, '_') || 'hawa-game') + '.zip';
    ui.url = URL.createObjectURL(blob);
    const dl = () => { const a = document.createElement('a'); a.href = ui.url; a.download = ui.fname; document.body.appendChild(a); a.click(); a.remove(); };
    dl();
    ui.step('dl', 'اتحمّل: ' + ui.fname, 'ok');
    ui.pct(100);
    const rep = ['«' + data.name + '» · ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB · ' + included.length + ' ملف',
      (mode === 'online'
        ? ('أونلاين · ' + roomPlayersLabel() + ' · سعة الرووم ' + roomMaxPlayers())
        : 'أوفلاين'),
      'سكربتات ' + data.scripts.length + ' · كائنات برمجية ' + data.sdefs.length + ' · وسائط ' + mids.length]
      .concat(au.warnings.map(w => '⚠ ' + w));
    ui.report(rep, au.warnings.length ? 'warn' : 'ok');
    ui.finish('اللعبة جاهزة واتحمّلت', true, [
      {t: 'تحميل تاني', fn: dl}, {t: 'إغلاق', pri: true, fn: () => ui.close()}]);
    tip('✔ لعبة كاملة: «' + data.name + '» · ' + (blob.size / 1024 / 1024).toFixed(2) + ' MB');
  } catch (e) {
    console.error(e);
    ui.report(['فشل التحويل: ' + (e && e.message || e)], 'err');
    ui.finish('فشل التحويل', false, [{t: 'إغلاق', pri: true, fn: () => ui.close()}]);
  }
}
{ const _bc = document.getElementById('bConvert'); if (_bc) _bc.onclick = convertToGame; }
(function bindParamsGear() {
  const b = document.getElementById('gParams');
  if (b) b.onclick = e => {
    e.preventDefault(); e.stopPropagation();
    const o = OBJ.get(S.sel);
    if (!o || o.type !== 'sobj') return;
    if (S.paramOpen) closeParamPanel(); else openParamPanel(true);
    try { updGzParamsBtn(); } catch (_) {}
  };
  try { bindParamPanel(); } catch (_) {}
})();
{ const _bo = document.getElementById('bOpenGame'); if (_bo) _bo.onclick = () => { window.open('game.html', '_blank'); }; }
S.showCoord = false; S.pick = false;
S.boxdel = null; 
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
  tip(S.pick ? 'وضع الكائن مفعّل' : 'وضع الكائن مُغلق');
  S.dirty = 1;
}
function toggleCoord() {
  S.showCoord = !S.showCoord;
  S.pick = S.showCoord;
  const panel = $('#coordPanel'); if (panel) panel.hidden = !S.showCoord;
  syncCoordRailBtn();
  tip(S.showCoord ? 'الإحداثيات مفعّلة' : 'الإحداثيات مُغلقة');
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

function hier() {
  refNames = null;
  const q = $('#hq').value.trim(), L = [];
  for (const o of S.objs) {
    if (o.type === 'respawn' || o.type === 'online_spawn') continue; 
    if (q && !o.name.includes(q)) continue;
    L.push(o);
    if (L.length >= 300) break;
  }
  $('#hier').innerHTML = L.map(o => `<div data-id="${o.id}" class="${o.id === S.sel ? 'on' : ''}${o.hidden ? ' dim' : ''}">${DEF[o.type].i} ${esc(o.name)}${isProg(o) ? ' <span class="pbadge">⚙ مبرمج</span>' : ''}${o.hidden ? ' <span class="mut">· مخفي</span>' : ''}</div>`).join('')
    || '<div class="mut">المشهد فاضي</div>';
  const worldN = S.objs.filter(o => o.type !== 'respawn' && o.type !== 'online_spawn').length;
  $('#objCount').textContent = worldN + ' كائن';
  try { updSpawnBtn(); } catch (_) {}
}
function hierMark() { $$('#hier [data-id]').forEach(d => d.classList.toggle('on', +d.dataset.id === S.sel)); }
$('#hier').onclick = e => { const d = e.target.closest('[data-id]'); if (d) sel(+d.dataset.id); };
$('#hq').oninput = hier;
function mediaLabel(v) {
  if (v == null || v === '') return 'لا يوجد';
  const s = String(v);
  if (s.startsWith('media:')) {
    const id = s.slice(6);
    const m = S.media && S.media[id];
    return m ? (m.name || id) : id;
  }
  if (s.startsWith('data:')) return 'مرفق مضمّن';
  if (s.length > 40) return s.slice(0, 28) + '…';
  return s;
}
function mediaKindFrom(mime, name) {
  const m = String(mime || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  if (m.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(n)) return 'image';
  if (m.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(n)) return 'audio';
  if (m.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(n)) return 'video';
  if (m === 'application/pdf' || m.includes('pdf') || /\.pdf$/i.test(n)) return 'pdf';
  return 'file';
}
function mediaKindIcon(kind) {
  return ({ image: '🖼', audio: '🔊', video: '🎬', pdf: '📄', file: '📎' })[kind] || '📎';
}
function mediaMatchesAccept(entry, accept) {
  if (!accept || accept === '*/*') return true;
  const mime = String(entry.mime || '');
  const name = String(entry.name || '');
  const kind = entry.kind || mediaKindFrom(mime, name);
  const parts = String(accept).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const p of parts) {
    if (p === '*/*') return true;
    if (p.endsWith('/*')) {
      const head = p.slice(0, -1);
      if (mime.toLowerCase().startsWith(head)) return true;
      if (p.startsWith('image') && kind === 'image') return true;
      if (p.startsWith('audio') && kind === 'audio') return true;
      if (p.startsWith('video') && kind === 'video') return true;
    } else if (p.startsWith('.')) {
      if (name.toLowerCase().endsWith(p)) return true;
    } else if (mime.toLowerCase() === p || (p.includes('pdf') && kind === 'pdf')) return true;
  }
  
  const t = String(accept).toLowerCase();
  if (t === 'audio' || t === 'sound') return kind === 'audio';
  if (t === 'image' || t === 'img' || t === 'texture') return kind === 'image';
  if (t === 'video') return kind === 'video';
  if (t === 'pdf') return kind === 'pdf';
  return false;
}
function ensureMediaOrder() {
  if (!S.media) S.media = {}; S.mediaOrder = [];
  if (!Array.isArray(S.mediaOrder)) S.mediaOrder = [];
  const ids = Object.keys(S.media);
  
  for (const id of ids) if (!S.mediaOrder.includes(id)) S.mediaOrder.push(id);
  
  S.mediaOrder = S.mediaOrder.filter(id => S.media[id]);
}
function paramAccept(t) {
  t = String(t || '').toLowerCase();
  if (t === 'audio' || t === 'sound') return 'audio/*';
  if (t === 'image' || t === 'img' || t === 'texture') return 'image/*';
  if (t === 'video') return 'video/*';
  if (t === 'pdf') return '.pdf,application/pdf';
  if (t === 'file') return '*/*';
  return '';
}
function isMediaType(t) {
  t = String(t || '').toLowerCase();
  return t === 'audio' || t === 'sound' || t === 'image' || t === 'img' || t === 'texture' || t === 'video' || t === 'file' || t === 'media' || t === 'pdf';
}
function isVec3Param(ty, v) {
  const t = String(ty || '').toLowerCase();
  if (t === 'vec3' || t === 'vector3' || t === 'xyz' || t === 'position' || t === 'pos' || t === 'coord' || t === 'coords' || t === 'location') return true;
  if (Array.isArray(v) && v.length >= 3 && v.slice(0, 3).every(n => typeof n === 'number' || (n !== '' && isFinite(+n)))) return true;
  return false;
}
function parseVec3(v) {
  if (Array.isArray(v) && v.length >= 3) return [+v[0] || 0, +v[1] || 0, +v[2] || 0];
  if (v && typeof v === 'object' && ('x' in v || 'y' in v || 'z' in v)) return [+v.x || 0, +v.y || 0, +v.z || 0];
  if (typeof v === 'string') {
    const parts = v.replace(/\[|\]/g, '').split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (parts.length >= 3) return parts.slice(0, 3);
  }
  return [0, 0, 0];
}
function paramRow(o, k, label, e) {
  const v = o.p[k], ty = (e && e.type) || '';
  let inp;
  if (isVec3Param(ty, v)) {
    const arr = parseVec3(v);
    inp = `<span class="param-xyz">`
      + `<label>X<input type="number" step="0.1" data-p="${k}" data-p-axis="0" value="${arr[0]}"></label>`
      + `<label>Y<input type="number" step="0.1" data-p="${k}" data-p-axis="1" value="${arr[1]}"></label>`
      + `<label>Z<input type="number" step="0.1" data-p="${k}" data-p-axis="2" value="${arr[2]}"></label>`
      + `</span>`;
  } else if (isMediaType(ty) || (typeof v === 'string' && (String(v).startsWith('media:') || String(v).startsWith('data:')))) {
    const acc = paramAccept(ty) || '*/*';
    const has = !!(v && String(v).length);
    inp = `<span class="media-name" title="${esc(mediaLabel(v))}">${esc(mediaLabel(v))}</span>`
      + `<span class="media-actions">`
      + `<button type="button" class="media-btn mf-pick" data-p-from-files="${k}" data-p-accept="${esc(acc)}" data-p-type="${esc(ty)}" title="اختيار من ملفاتي">رفع من ملفاتي</button>`
      + (has ? `<button type="button" class="media-btn" data-p-from-files="${k}" data-p-accept="${esc(acc)}" data-p-type="${esc(ty)}" title="استبدال">استبدال</button>` : '')
      + (has ? `<button type="button" class="media-clr" data-p-clr="${k}" title="حذف من البارامتر">حذف</button>` : '')
      + `</span>`;
  } else if (ty === 'boolean' || typeof v === 'boolean') {
    inp = `<input type="checkbox" data-p="${k}" ${v ? 'checked' : ''}>`;
  } else if (ty === 'color' || (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v))) {
    inp = `<input type="color" data-p="${k}" value="${(typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : '#000000'}" style="flex:1">`;
  } else if (ty === 'text' || ty === 'string' || (typeof v === 'string' && !isMediaType(ty))) {
    inp = `<input type="text" data-p="${k}" value="${esc(v ?? '')}" style="flex:1">`;
  } else {
    inp = `<input type="number" data-p="${k}" value="${v}" step="${(e && e.step) || .5}"${e && e.min != null ? ` min="${e.min}"` : ''}${e && e.max != null ? ` max="${e.max}"` : ''} style="flex:1">`;
  }
  return `<div class="r param-row"><b class="pl">${esc(label || (e && e.label) || PL[k] || k)}</b>${inp}</div>`;
}
function applyParamValue(o, key, raw, schemaEntry, axis) {
  if (!o.p) o.p = {};
  const e = schemaEntry || null;
  const ty = e && e.type;
  if (axis != null && axis !== '' && isVec3Param(ty, o.p[key])) {
    const arr = parseVec3(o.p[key]);
    arr[+axis] = isNaN(+raw) ? 0 : +raw;
    o.p[key] = arr;
  } else if (ty === 'boolean' || typeof o.p[key] === 'boolean') o.p[key] = !!raw;
  else if (ty === 'color') o.p[key] = String(raw);
  else if (ty === 'text' || ty === 'string' || isMediaType(ty)) o.p[key] = raw;
  else if (typeof o.p[key] === 'string' && !isVec3Param(ty, o.p[key])) o.p[key] = String(raw);
  else if (isVec3Param(ty, o.p[key])) {
    
  } else {
    const n = +raw;
    o.p[key] = isNaN(n) ? raw : n;
  }
  if (o.type === 'light') {
    const l = MESH.get(o.id) && MESH.get(o.id).children[0];
    if (l) { l.intensity = o.p.intensity; l.distance = o.p.range; }
  }
  if (o.type === 'sobj') {
    clearTimeout(prevT);
    prevT = setTimeout(() => { try { refreshPreview(o); } catch (_) {} }, 120);
  }
  chg();
}
function storeMediaFile(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const id = 'm' + (S.mid++);
    if (!S.media) S.media = {}; S.mediaOrder = [];
    if (!Array.isArray(S.mediaOrder)) S.mediaOrder = [];
    const kind = mediaKindFrom(file.type, file.name);
    S.media[id] = {
      name: file.name || id,
      mime: file.type || 'application/octet-stream',
      data: reader.result,
      kind,
      size: file.size || 0,
      addedAt: Date.now()
    };
    if (!S.mediaOrder.includes(id)) S.mediaOrder.push(id);
    try { chg(); } catch (_) {}
    cb('media:' + id);
  };
  reader.onerror = () => cb(null);
  reader.readAsDataURL(file);
}

async function deleteMediaFile(id, opts) {
  id = String(id || '');
  if (!id || !S.media || !S.media[id]) return false;
  const soft = opts && opts.skipConfirm;
  if (!soft) {
    const nm = (S.media[id] && S.media[id].name) || id;
    if (!await uiConfirm('حذف الملف «' + nm + '» من المشروع نهائياً؟\nأي بارامتر يستخدمه هيصير فاضي.')) return false;
  }
  
  const ref = 'media:' + id;
  const clearRef = (p) => {
    if (!p || typeof p !== 'object') return;
    for (const k of Object.keys(p)) if (p[k] === ref) p[k] = '';
  };
  for (const o of (S.objs || [])) clearRef(o.p);
  for (const s of (S.scripts || [])) clearRef(s.p);
  for (const d of (S.sdefs || [])) clearRef(d.p);
  delete S.media[id];
  if (Array.isArray(S.mediaOrder)) S.mediaOrder = S.mediaOrder.filter(x => x !== id);
  
  try {
    if (StoreFS && StoreFS.handle && StoreFS.mode === 'folder') {
      const root = StoreFS.handle;
      try {
        const mediaDir = await root.getDirectoryHandle('media', { create: false });
        
        for await (const [name, ent] of mediaDir.entries()) {
          if (ent.kind === 'file' && (name === id || name.startsWith(id + '_'))) {
            try { await mediaDir.removeEntry(name); } catch (_) {}
          }
        }
      } catch (_) {}
    }
  } catch (e) { console.warn('delete media disk', e); }
  try { chg(); } catch (_) {}
  try { save(); } catch (_) {}
  return true;
}

const MyFilesUI = {
  pickCb: null,
  accept: '*/*',
  mode: 'manage', 
  dragId: null,
  open(opts) {
    opts = opts || {};
    this.mode = opts.mode === 'pick' ? 'pick' : 'manage';
    this.accept = opts.accept || '*/*';
    this.pickCb = typeof opts.onPick === 'function' ? opts.onPick : null;
    try { ensureMediaOrder(); } catch (_) {}
    const m = document.getElementById('myFilesModal');
    if (!m) {
      try { tip('⚠ نافذة ملفاتي غير موجودة'); } catch (_) {}
      console.warn('[ملفاتي] #myFilesModal missing');
      return;
    }
    m.hidden = false;
    m.removeAttribute('hidden');
    m.style.display = 'flex';
    m.classList.add('open');
    const title = document.getElementById('mfTitle');
    if (title) title.textContent = this.mode === 'pick' ? 'اختر من ملفاتي' : 'ملفاتي';
    const hint = document.getElementById('mfHint');
    if (hint) {
      hint.textContent = '';
    }
    const cancel = document.getElementById('mfCancelPick');
    if (cancel) cancel.hidden = this.mode !== 'pick';
    const q = document.getElementById('mfSearch');
    if (q) q.value = '';
    this.render();
  },
  close() {
    const m = document.getElementById('myFilesModal');
    if (m) {
      m.hidden = true;
      m.setAttribute('hidden', '');
      m.style.display = 'none';
      m.classList.remove('open');
    }
    this.pickCb = null;
    this.mode = 'manage';
  },
  render() {
    ensureMediaOrder();
    const list = document.getElementById('mfList');
    const count = document.getElementById('mfCount');
    if (!list) return;
    const q = ((document.getElementById('mfSearch') || {}).value || '').trim().toLowerCase();
    let ids = S.mediaOrder.slice();
    if (this.mode === 'pick') {
      ids = ids.filter(id => {
        const e = S.media[id];
        return e && mediaMatchesAccept(e, this.accept);
      });
    }
    if (q) {
      ids = ids.filter(id => {
        const e = S.media[id];
        return e && String(e.name || id).toLowerCase().includes(q);
      });
    }
    if (count) count.textContent = ids.length + ' ملف' + (Object.keys(S.media).length !== ids.length ? ' (عرض مفلتر)' : '');
    if (!ids.length) {
      list.innerHTML = '<div class="mf-empty">' + (Object.keys(S.media).length ? '—' : '—') + '</div>';
      return;
    }
    list.innerHTML = ids.map(id => {
      const e = S.media[id];
      const kind = e.kind || mediaKindFrom(e.mime, e.name);
      const size = e.size ? (e.size > 1048576 ? (e.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(e.size / 1024)) + ' KB') : '';
      return `<div class="mf-item" draggable="true" data-mf-id="${id}">
        <span class="mf-ico">${mediaKindIcon(kind)}</span>
        <div class="mf-meta">
          <div class="mf-name" title="${esc(e.name || id)}">${esc(e.name || id)}</div>
          <div class="mf-sub">${kind}${size ? ' · ' + size : ''}</div>
        </div>
        ${this.mode === 'manage' ? `<button type="button" class="mf-del" data-mf-del="${id}">حذف</button>` : ''}
      </div>`;
    }).join('');
    this.bindList();
  },
  bindList() {
    const list = document.getElementById('mfList');
    if (!list || list._mfBound) {
      
    }
    list._mfBound = true;
    list.querySelectorAll('.mf-item').forEach(el => {
      const id = el.getAttribute('data-mf-id');
      el.ondblclick = () => {
        if (this.mode === 'pick' && this.pickCb) {
          this.pickCb('media:' + id);
          this.close();
        }
      };
      el.ondragstart = ev => {
        this.dragId = id;
        el.classList.add('dragging');
        try { ev.dataTransfer.setData('text/plain', id); ev.dataTransfer.effectAllowed = 'move'; } catch (_) {}
      };
      el.ondragend = () => { this.dragId = null; el.classList.remove('dragging'); list.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over')); };
      el.ondragover = ev => { ev.preventDefault(); el.classList.add('drag-over'); };
      el.ondragleave = () => el.classList.remove('drag-over');
      el.ondrop = ev => {
        ev.preventDefault();
        el.classList.remove('drag-over');
        const from = this.dragId || (ev.dataTransfer && ev.dataTransfer.getData('text/plain'));
        const to = id;
        if (!from || !to || from === to) return;
        ensureMediaOrder();
        const a = S.mediaOrder.indexOf(from);
        const b = S.mediaOrder.indexOf(to);
        if (a < 0 || b < 0) return;
        S.mediaOrder.splice(a, 1);
        S.mediaOrder.splice(b, 0, from);
        try { chg(); } catch (_) {}
        this.render();
      };
    });
    list.querySelectorAll('[data-mf-del]').forEach(btn => {
      btn.onclick = async ev => {
        ev.stopPropagation();
        const id = btn.getAttribute('data-mf-del');
        if (await deleteMediaFile(id)) this.render();
      };
    });
  },
  async uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    for (const f of files) {
      await new Promise(res => storeMediaFile(f, () => res()));
    }
    tip('✔ تم رفع ' + files.length + ' ملف');
    this.render();
  }
};

function openMyFilesManager() {
  MyFilesUI.open({ mode: 'manage' });
}
function openMyFilesPicker(accept, onPick) {
  MyFilesUI.open({ mode: 'pick', accept: accept || '*/*', onPick });
}
function bindMyFilesUI() {
  const modal = document.getElementById('myFilesModal');
  if (modal && !modal._bound) {
    modal._bound = true;
    const close = () => MyFilesUI.close();
    const cbtn = document.getElementById('mfClose');
    if (cbtn) cbtn.onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    const cancel = document.getElementById('mfCancelPick');
    if (cancel) cancel.onclick = close;
    const search = document.getElementById('mfSearch');
    if (search) search.oninput = () => MyFilesUI.render();
    const up = document.getElementById('mfUpload');
    if (up) up.onchange = async () => {
      await MyFilesUI.uploadFiles(up.files);
      up.value = '';
    };
  }
  
  const b = document.getElementById('bMyFiles');
  if (b && !b._mfClick) {
    b._mfClick = true;
    b.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      try { openMyFilesManager(); } catch (err) { console.error(err); tip('⚠ فشل فتح ملفاتي'); }
    });
  }
}

try { bindMyFilesUI(); } catch (e) { console.warn(e); }
setTimeout(() => { try { bindMyFilesUI(); } catch (e) { console.warn(e); } }, 0);
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { try { bindMyFilesUI(); } catch (e) {} });
  window.addEventListener('load', () => { try { bindMyFilesUI(); } catch (e) {} });
}

document.addEventListener('click', e => {
  const t = e.target && e.target.closest && e.target.closest('#bMyFiles, [data-proxy="bMyFiles"]');
  if (!t) return;
  if (t.id === 'bMyFiles' || t.getAttribute('data-proxy') === 'bMyFiles') {
    
    if (t.getAttribute('data-proxy') === 'bMyFiles') return;
    try { openMyFilesManager(); } catch (_) {}
  }
}, true);

function resolveParamValue(v) {
  if (typeof v === 'string' && v.startsWith('media:')) {
    const m = S.media && S.media[v.slice(6)];
    return m && m.data ? m.data : '';
  }
  return v;
}
function resolvedParams(p) {
  const out = {};
  if (!p) return out;
  for (const k of Object.keys(p)) out[k] = resolveParamValue(p[k]);
  return out;
}
function collectMediaRefs(data) {
  const ids = new Set();
  const scan = (v) => {
    if (v == null) return;
    if (typeof v === 'string') {
      if (v.startsWith('media:')) ids.add(v.slice(6));
    } else if (Array.isArray(v)) v.forEach(scan);
    else if (typeof v === 'object') Object.values(v).forEach(scan);
  };
  scan(data);
  return ids;
}

const PM = new Map();      
let refNames = null, mkc = 0, pmTex = null;
function globalRefs() {    
  if (refNames) return refNames;
  refNames = new Map();
  for (const d of (S.sdefs || [])) for (const o of S.objs) if (o.name && o.name.length > 1 && o.type !== 'sobj' && d.code && d.code.includes(o.name)) { if (!refNames.has(o.id)) refNames.set(o.id, []); refNames.get(o.id).push({id: d.id, name: d.name, enabled: true, code: d.code}); }
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

function openParamPanel(force) {
  const o = OBJ.get(S.sel);
  if (!o || o.type !== 'sobj') { closeParamPanel(); return; }
  const d = defOf(o.def);
  if (!d) { closeParamPanel(); return; }
  S.paramOpen = force != null ? !!force : true;
  const panel = document.getElementById('paramPanel');
  if (!panel) return;
  panel.hidden = !S.paramOpen;
  if (!S.paramOpen) return;
  fillDefaults(o); 
  syncParamPanel();
}
function closeParamPanel() {
  S.paramOpen = false;
  const panel = document.getElementById('paramPanel');
  if (panel) panel.hidden = true;
}
function syncParamPanel() {
  const panel = document.getElementById('paramPanel');
  const body = document.getElementById('paramBody');
  const title = document.getElementById('paramTitle');
  if (!panel || !body) return;
  const o = OBJ.get(S.sel);
  if (!o || o.type !== 'sobj' || !S.paramOpen) { panel.hidden = true; return; }
  const d = defOf(o.def);
  if (!d) { panel.hidden = true; return; }
  panel.hidden = false;
  if (title) title.textContent = (o.name || d.name || 'كائن') + ' · بارامترات';
  const sch = schemaOf(d.code);
  if (!sch.length) {
    body.innerHTML = '<p class=\"mut small\">—</p>';
    return;
  }
  body.innerHTML = sch.map(e => paramRow(o, e.key, e.label || e.key, e)).join('')
    + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
    + '<button type="button" id="paramFromFile" class="ok" title="من الملف">من الملف</button>'
    + '</div>'
;
  const btn = document.getElementById('paramFromFile');
  if (btn) btn.onclick = () => {
    applyFileParamsToObject(o);
    syncParamPanel();
    try { inspect(); } catch (_) {}
    tip('تم تطبيق بارامترات الملف على هذا الكائن');
  };
}
function bindParamPanel() {
  const panel = document.getElementById('paramPanel');
  if (!panel || panel._bound) return;
  panel._bound = true;
  const body = document.getElementById('paramBody');
  const close = document.getElementById('paramClose');
  if (close) close.onclick = () => closeParamPanel();
  if (!body) return;
  body.addEventListener('input', e => {
    const t = e.target, o = OBJ.get(S.sel); if (!o || !t.dataset.p) return;
    const d = defOf(o.def);
    const sch = d ? schemaOf(d.code).find(x => x.key === t.dataset.p) : null;
    const axis = t.dataset.pAxis != null ? t.dataset.pAxis : t.getAttribute('data-p-axis');
    applyParamValue(o, t.dataset.p, t.type === 'checkbox' ? t.checked : t.value, sch, axis);
  });
  body.addEventListener('click', e => {
    const o = OBJ.get(S.sel); if (!o) return;
    const pick = e.target.closest('[data-p-from-files]');
    if (pick) {
      const key = pick.getAttribute('data-p-from-files');
      const acc = pick.getAttribute('data-p-accept') || '*/*';
      const ty = pick.getAttribute('data-p-type') || '';
      openMyFilesPicker(acc || paramAccept(ty) || '*/*', ref => {
        if (!ref) return;
        const d = defOf(o.def);
        const sch = d ? schemaOf(d.code).find(x => x.key === key) : null;
        applyParamValue(o, key, ref, sch);
        syncParamPanel();
        try { inspect(); } catch (_) {}
        tip('✔ تم اختيار: ' + mediaLabel(ref));
      });
      return;
    }
    const b = e.target.closest('[data-p-clr]'); if (!b) return;
    const key = b.getAttribute('data-p-clr');
    o.p[key] = '';
    applyParamValue(o, key, '', null);
    syncParamPanel();
    try { inspect(); } catch (_) {}
  });
}

function inspect() {
  const o = OBJ.get(S.sel), el = $('#ins');
  if (o && o.type === 'sobj') { const d = defOf(o.def); if (d && !isBig(d.code)) { const df = parseParams(d.code); for (const k in df) if (!(k in o.p)) o.p[k] = df[k]; } }
  if (!o) { el.innerHTML = '<div class="empty"><span>◈</span><p>لا يوجد تحديد</p></div>'; updVis(); return; }
  const big = o.type === 'sobj' && !!defOf(o.def) && isBig(defOf(o.def).code);
  const v3 = (k, l, st) => `<div class="r"><b>${l}</b>` + [0, 1, 2].map(i => `<label>${'XYZ'[i]}<input type="number" step="${st}" data-k="${k}" data-i="${i}" value="${+o[k][i].toFixed(3)}"></label>`).join('') + '</div>';
  let h = `<div class="ih"><span>${DEF[o.type].i}</span><input data-k="name" value="${esc(o.name)}"></div>`;
  if (isProg(o)) {
    const af = affFiles(o), op = S.ffOpen === o.id;
    h += `<div class="prog-b"><span>⚙ كائن مبرمج</span><button data-ff="1">${op ? 'إخفاء' : 'عرض'} الملفات المتأثرة (${af.length})</button></div>`;
    if (op) h += '<div class="ff-list">' + (af.map(f => `<div class="ff" data-fk="${f.k}" data-fid="${f.id}"><span>${f.k === 'sobj' ? '🎮' : f.on === false ? '🔴' : '🟢'} ${esc(f.name)}</span><em>${f.role}</em></div>`).join('') || '<p class="mut small">مفيش ملفات مرتبطة</p>') + '</div>';
  }
  h += `<div class="cp"><h4>Transform</h4>${v3('pos', 'الموضع', .1)}${v3('rot', 'الدوران', 5)}${big ? '' : v3('scl', 'الحجم', .1)}</div>`;
  h += `<div class="cp"><h4>Renderer</h4><div class="r"><b>اللون</b><input type="color" data-k="color" value="${o.color}"></div></div>`;
  h += `<div class="cp"><h4>الحالة</h4>`
    + (DEF[o.type].solid || o.type === 'sobj' ? `<label class="r"><input type="checkbox" data-k="solid" ${o.solid ? 'checked' : ''}> صلب</label>` : '')
    + `<label class="r"><input type="checkbox" data-k="hidden" ${o.hidden ? 'checked' : ''}> مخفي</label></div>`;
  if (big) {
    const sch = schemaOf(defOf(o.def).code);
    h += `<div class="cp"><h4>${esc(o.name)} · البارامترات</h4>`
      + (sch.length ? sch.map(e => paramRow(o, e.key, e.label, e)).join('') : '<p class="mut small">—</p>')
      + `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-from-file="1" class="ok">من الملف</button>`
      + `<button type="button" class="unit-viewer-btn" data-unit-view title="عارض الوحدة الافتراضية">عارض الوحده الافتراضيه</button></div>`
      + '</div>';
  } else {
    const pk = Object.keys(o.p);
    if (pk.length || o.type === 'sobj') {
      h += `<div class="cp"><h4>${esc(o.type === 'sobj' ? o.name : DEF[o.type].n)} · البارامترات</h4>`
        + (pk.length ? pk.map(k => paramRow(o, k, PL[k], null)).join('') : '<p class="mut small">—</p>')
        + (o.type === 'sobj' ? `<div style="margin-top:8px"><button type="button" class="unit-viewer-btn" data-unit-view title="عارض الوحدة الافتراضية">عارض الوحده الافتراضيه</button></div>` : '')
        + '</div>';
    }
  }
  if (o.type !== 'respawn' && o.type !== 'light') {
    const sc = o.scripts.map(id => { const s = S.scripts.find(x => x.id === id); return s ? `<div class="sr"><span>${s.enabled ? '🟢' : '🔴'} ${esc(s.name)}</span><button data-rm="${id}">✕</button></div>` : ''; }).join('');
    const op = S.scripts.filter(s => !o.scripts.includes(s.id)).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    h += `<div class="cp"><h4>السكربتات المرتبطة</h4>${sc}<select id="addsc" style="width:100%"><option value="">＋ ربط سكربت...</option>${op}</select></div>`;
  }
  h += `<div class="acts"><button data-a="up">${ic('up')}<i>طلوع</i></button><button data-a="down">${ic('down')}<i>نزول</i></button>`
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
  if (p) {
    const d = o.type === 'sobj' ? defOf(o.def) : null;
    const sch = d ? schemaOf(d.code).find(x => x.key === p) : null;
    const axis = t.dataset.pAxis != null ? t.dataset.pAxis : t.getAttribute('data-p-axis');
    applyParamValue(o, p, t.type === 'checkbox' ? t.checked : t.value, sch, axis);
    try { syncParamPanel(); } catch (_) {}
  }
  else if (k === 'pos' || k === 'rot' || k === 'scl') { const v = parseFloat(t.value); if (!isNaN(v)) { o[k][+t.dataset.i] = v; tf(o); selHelper(); } }
  else if (k === 'color') { o.color = t.value; recolor(o); }
  else if (k === 'solid') o.solid = t.checked;
  else if (k === 'name') { o.name = t.value; hier(); }
  chg();
});
$('#ins').addEventListener('change', e => {
  const t = e.target, o = OBJ.get(S.sel); if (!o || !t) return;
  
  if (false && (t.dataset.pFile != null || t.getAttribute('data-p-file') != null)) { return; }
  if (t.dataset.k === 'hidden') { o.hidden = t.checked; look(o); refreshPreview(o); hier(); updVis(); selHelper(); chg(); }
  if (t.id === 'addsc' && t.value) { o.scripts.push(+t.value); inspect(); chg(); }
});
$('#ins').addEventListener('click', e => {
  const ff = e.target.closest('.ff'); if (ff) { openEd(+ff.dataset.fid, ff.dataset.fk === 'sobj' ? 'sobj' : 'script'); return; }
  const o = OBJ.get(S.sel), b = e.target.closest('button'); if (!o || !b) return;
  if (b.dataset.ff) { S.ffOpen = S.ffOpen === o.id ? null : o.id; inspect(); return; }
  if (b.dataset.pFromFiles || b.getAttribute('data-p-from-files')) {
    const key = b.dataset.pFromFiles || b.getAttribute('data-p-from-files');
    const acc = b.getAttribute('data-p-accept') || '*/*';
    const ty = b.getAttribute('data-p-type') || '';
    openMyFilesPicker(acc || paramAccept(ty) || '*/*', ref => {
      if (!ref) return;
      const d = o.type === 'sobj' ? defOf(o.def) : null;
      const sch = d ? schemaOf(d.code).find(x => x.key === key) : null;
      applyParamValue(o, key, ref, sch);
      inspect();
      try { syncParamPanel(); } catch (_) {}
      tip('✔ تم اختيار: ' + mediaLabel(ref));
    });
    return;
  }
  if (b.dataset.pClr || b.getAttribute('data-p-clr')) {
    const key = b.dataset.pClr || b.getAttribute('data-p-clr');
    o.p[key] = '';
    applyParamValue(o, key, '', null);
    inspect();
    try { syncParamPanel(); } catch (_) {}
    return;
  }
  if (b.dataset.fromFile || b.getAttribute('data-from-file')) {
    applyFileParamsToObject(o);
    inspect();
    try { syncParamPanel(); } catch (_) {}
    tip('تم تطبيق بارامترات الملف على هذا الكائن');
    return;
  }
  if (b.dataset.rm) { o.scripts = o.scripts.filter(i => i !== +b.dataset.rm); inspect(); chg(); }
  else if (b.dataset.a) act(b.dataset.a);
});

function fitNameStyle(name) {
  const n = String(name || '').length;
  const fs = n <= 8 ? 12.5 : n <= 12 ? 11.5 : n <= 18 ? 10.5 : n <= 26 ? 9.5 : 9;
  return `font-size:${fs}px`;
}
function openScriptParams(id) {
  const s = S.scripts.find(x => +x.id === +id); if (!s) return;
  const sch = schemaOf(s.code);
  if (!s.p) s.p = {};
  for (const e of sch) if (s.p[e.key] === undefined) s.p[e.key] = e.value;
  const parsed = parseParams(s.code);
  for (const k of Object.keys(parsed)) if (s.p[k] === undefined) s.p[k] = parsed[k];
  let m = document.getElementById('scrParamModal');
  if (!m) {
    m = document.createElement('div'); m.id = 'scrParamModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;display:flex;align-items:center;justify-content:center;';
    m.addEventListener('click', ev => { if (ev.target === m) m.hidden = true; });
    document.body.appendChild(m);
  }
  const holder = {p: s.p};
  const keys = sch.length ? sch : Object.keys(s.p).map(k => ({ key: k, label: k, value: s.p[k] }));
  m.innerHTML = `<div style="background:#14161c;color:#eee;border-radius:12px;padding:16px;min-width:300px;max-width:90vw;max-height:80vh;overflow:auto;direction:rtl">`
    + `<h4 style="margin:0 0 10px">${esc(s.name)} · بارامترات الملف</h4>`
    + (keys.length ? keys.map(e => paramRow(holder, e.key, e.label || e.key, e)).join('') : '<p class=\"mut small\">—</p>')
    + `<div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap">`
    + `<button type="button" class="unit-viewer-btn" data-unit-view title="عارض الوحدة الافتراضية">عارض الوحده الافتراضيه</button>`
    + `<button data-close>إغلاق</button></div></div>`;
  m.hidden = false;
  m.querySelector('[data-close]').onclick = () => { m.hidden = true; };
  m.querySelectorAll('[data-p]').forEach(inp => {
    const k = inp.dataset.p, e = sch.find(x => x.key === k);
    const h = () => {
      const axis = inp.dataset.pAxis != null ? inp.dataset.pAxis : inp.getAttribute('data-p-axis');
      applyParamValue(holder, k, inp.type === 'checkbox' ? inp.checked : inp.value, e, axis);
      chg();
    };
    inp.addEventListener('input', h); inp.addEventListener('change', h);
  });
  m.querySelectorAll('[data-p-from-files]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-p-from-files');
      const acc = btn.getAttribute('data-p-accept') || '*/*';
      const ty = btn.getAttribute('data-p-type') || '';
      openMyFilesPicker(acc || paramAccept(ty) || '*/*', ref => {
        if (!ref) return;
        applyParamValue(holder, key, ref, sch.find(x => x.key === key));
        openScriptParams(id);
        chg();
        tip('✔ تم اختيار: ' + mediaLabel(ref));
      });
    });
  });
  m.querySelectorAll('[data-p-clr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-p-clr') || btn.dataset.pClr;
      applyParamValue(holder, key, '', null);
      openScriptParams(id);
      chg();
    });
  });
}

function openSdefParams(id) {
  const d = S.sdefs.find(x => +x.id === +id); if (!d) return;
  const sch = schemaOf(d.code);
  if (!d.p) d.p = {};
  for (const e of sch) if (d.p[e.key] === undefined) d.p[e.key] = e.value;
  const parsed = parseParams(d.code);
  for (const k of Object.keys(parsed)) if (d.p[k] === undefined) d.p[k] = parsed[k];
  let m = document.getElementById('scrParamModal');
  if (!m) {
    m = document.createElement('div'); m.id = 'scrParamModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;display:flex;align-items:center;justify-content:center;';
    m.addEventListener('click', ev => { if (ev.target === m) m.hidden = true; });
    document.body.appendChild(m);
  }
  const holder = {p: d.p};
  const keys = sch.length ? sch : Object.keys(d.p).map(k => ({ key: k, label: k, value: d.p[k] }));
  m.innerHTML = `<div style="background:#14161c;color:#eee;border-radius:12px;padding:16px;min-width:300px;max-width:90vw;max-height:80vh;overflow:auto;direction:rtl">`
    + `<h4 style="margin:0 0 10px">${esc(d.name)} · بارامترات الملف</h4>`
    + (keys.length ? keys.map(e => paramRow(holder, e.key, e.label || e.key, e)).join('') : '<p class=\"mut small\">—</p>')
    + `<div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap">`
    + `<button type="button" class="unit-viewer-btn" data-unit-view title="عارض الوحدة الافتراضية">عارض الوحده الافتراضيه</button>`
    + `<button data-close>إغلاق</button></div></div>`;
  m.hidden = false;
  m.querySelector('[data-close]').onclick = () => { m.hidden = true; };
  m.querySelectorAll('[data-p]').forEach(inp => {
    const k = inp.dataset.p, e = sch.find(x => x.key === k);
    const h = () => {
      const axis = inp.dataset.pAxis != null ? inp.dataset.pAxis : inp.getAttribute('data-p-axis');
      applyParamValue(holder, k, inp.type === 'checkbox' ? inp.checked : inp.value, e, axis);
      chg();
    };
    inp.addEventListener('input', h); inp.addEventListener('change', h);
  });
  m.querySelectorAll('[data-p-from-files]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-p-from-files');
      const acc = btn.getAttribute('data-p-accept') || '*/*';
      const ty = btn.getAttribute('data-p-type') || '';
      openMyFilesPicker(acc || paramAccept(ty) || '*/*', ref => {
        if (!ref) return;
        applyParamValue(holder, key, ref, sch.find(x => x.key === key));
        openSdefParams(id);
        chg();
        tip('✔ تم اختيار: ' + mediaLabel(ref));
      });
    });
  });
  m.querySelectorAll('[data-p-clr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-p-clr') || btn.dataset.pClr;
      applyParamValue(holder, key, '', null);
      openSdefParams(id);
      chg();
    });
  });
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
        <button data-sp="${s.id}" title="بارامترات">⚙</button>
        <button data-ed="${s.id}" title="تعديل">${ic('pen')}</button>
        <button data-dl="${s.id}" class="red" title="حذف">${ic('trash')}</button>
      </div></div>`;
  }).join('') || '<p class="mut small" style="grid-column:1/-1">—</p>';
}
$('#pList').onclick = async e => {
  const t = e.target.closest('button');
  if (t) {
    if (t.dataset.sp != null) { openScriptParams(+t.dataset.sp); return; }
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
      if (!await uiConfirm('حذف الملف؟')) return;
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
  const s = {id: S.sid++, name: 'script_' + S.sid + '.js', code: TPL, enabled: true, p: {}};
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
async function saveEd() {
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
    try { SCH.clear(); } catch (_) {}  
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
async function deleteEd() {
  if (edI == null) return;
  if (!await uiConfirm('حذف الملف؟')) return;
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
window.__hawaSaveEd = async function () { try { return await saveEd(); } catch (e) { console.error(e); await uiAlert('خطأ في الحفظ: ' + (e && e.message || e)); return false; } };
window.__hawaCloseEd = function () { try { closeEd(); } catch (e) { console.error(e); } };
window.__hawaDelEd = async function () { try { await deleteEd(); } catch (e) { console.error(e); await uiAlert('خطأ في الحذف: ' + (e && e.message || e)); } };
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

const HawaWorldView = (() => {
  let active = null; 

  function closeActive() {
    if (!active) return;
    try { cancelAnimationFrame(active.raf); } catch (_) {}
    try { active.dispose && active.dispose(); } catch (_) {}
    active = null;
  }

  function shell(title, extraBarHtml) {
    closeActive();
    const ov = document.createElement('div');
    ov.className = 'hwv-overlay';
    ov.innerHTML = `
      <div class="hwv-modal" role="dialog" aria-modal="true">
        <div class="hwv-head">
          <b class="hwv-title">${title}</b>
          <div class="hwv-actions">${extraBarHtml || ''}
            <button type="button" class="hwv-close" title="إغلاق">✕</button>
          </div>
        </div>
        <div class="hwv-body"><canvas class="hwv-cv"></canvas>
          <div class="hwv-hint"></div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const close = () => { closeActive(); try { ov.remove(); } catch (_) {} };
    ov.querySelector('.hwv-close').onclick = close;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    return { ov, canvas: ov.querySelector('.hwv-cv'), close, bar: ov.querySelector('.hwv-actions') };
  }

  function makeMiniScene(canvas) {
    const renderer = new T.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    const isMob = !!(typeof MOB !== 'undefined' && MOB.on);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMob ? 1.5 : 2));
    const scene = new T.Scene();
    scene.background = new T.Color(0x0b1220);
    scene.fog = new T.Fog(0x0b1220, 18, 55);
    const camera = new T.PerspectiveCamera(60, 1, 0.1, 200);
    scene.add(new T.HemisphereLight(0xd6e6ff, 0x2a3040, 0.95));
    const sun = new T.DirectionalLight(0xffffff, 1.05);
    sun.position.set(12, 22, 10);
    scene.add(sun);
    const grid = new T.GridHelper(40, 40, 0x3d5678, 0x1a2a40);
    grid.position.y = 0.005;
    scene.add(grid);
    
    const floor = new T.Mesh(
      new T.PlaneGeometry(40, 40),
      new T.MeshStandardMaterial({ color: 0x152033, roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);
    return { renderer, scene, camera };
  }

  function fit(renderer, camera, host) {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function simpleChar() {
    
    const g = new T.Group();
    const skin = new T.MeshStandardMaterial({ color: 0xf5c08f, roughness: 0.7 });
    const cloth = new T.MeshStandardMaterial({ color: 0x34415e, roughness: 0.65 });
    const head = new T.Mesh(new T.SphereGeometry(0.18, 16, 12), skin);
    head.position.y = 1.55;
    const body = new T.Mesh(new T.BoxGeometry(0.42, 0.55, 0.24), cloth);
    body.position.y = 1.1;
    const legL = new T.Mesh(new T.BoxGeometry(0.14, 0.55, 0.16), cloth);
    legL.position.set(-0.1, 0.35, 0);
    const legR = legL.clone(); legR.position.x = 0.1;
    const armL = new T.Mesh(new T.BoxGeometry(0.1, 0.45, 0.1), skin);
    armL.position.set(-0.3, 1.15, 0);
    const armR = armL.clone(); armR.position.x = 0.3;
    g.add(head, body, legL, legR, armL, armR);
    g.userData.height = 1.7;
    return g;
  }

  function makeChar() {
    try {
      if (typeof makeRig === 'function') {
        const rig = makeRig();
        if (rig && rig.root) {
          rig.root.userData.height = 1.7;
          return rig.root;
        }
      }
    } catch (e) { console.warn('makeRig in viewer', e); }
    return simpleChar();
  }

  function buildSobjModel(def) {
    const root = new T.Group();
    try {
      const fakeO = {
        id: -1, name: def.name, type: 'sobj', def: def.id,
        p: parseParams(def.code), pos: [0, 0, 0], rot: [0, 0, 0], scl: [1, 1, 1],
        base: isBig(def.code)
      };
      const body = new T.Mesh(G.cube, mat('#888', 'sobj'));
      body.visible = false;
      root.userData.body = body;
      root.add(body);
      const gm = sandboxRun(root, true, () => new Function('Game', 'root', def.code)(bigGame(previewRt(), fakeO, root), root));
      killMedia(gm); sweepScriptUI();
      root.traverse(x => { if (x.isLight) { x.intensity = 0; x.visible = false; } });
    } catch (e) {
      console.warn('sobj viewer build', e);
      const fallback = new T.Mesh(
        G.cube,
        new T.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x6d28d9, emissiveIntensity: 0.35 })
      );
      fallback.position.y = 0.5;
      root.add(fallback);
    }
    return root;
  }

  function runPlayerLoop(api, opts) {
    const { renderer, scene, camera, canvas, close } = api;
    const keys = Object.create(null);
    let yaw = 0, pitch = 0.12, fly = !!(opts && opts.flyDefault);
    const pos = new T.Vector3(0, (opts && opts.forceFly) ? 3.2 : 1.6, 7);
    let dragging = false, lx = 0, ly = 0, lookPid = null;
    const speed = 6, flySpeed = 9;
    
    const joy = { x: 0, y: 0, active: false };
    const isMob = !!(typeof MOB !== 'undefined' && MOB.on)
      || ('ontouchstart' in window) || (navigator.maxTouchPoints > 1);
    let joyEl = null, knobEl = null, lookZone = null;

    if (isMob && api.ov) {
      const body = api.ov.querySelector('.hwv-body');
      if (body) {
        joyEl = document.createElement('div');
        joyEl.className = 'hwv-joy';
        knobEl = document.createElement('div');
        knobEl.className = 'hwv-joy-knob';
        joyEl.appendChild(knobEl);
        body.appendChild(joyEl);
        lookZone = document.createElement('div');
        lookZone.className = 'hwv-look-zone';
        body.appendChild(lookZone);
        const hint = body.querySelector('.hwv-hint');
        if (hint) {
          hint.classList.add('hwv-hint-mobile');
          hint.textContent = '';
        }
        const Rmax = 36;
        const setKnob = (dx, dy) => {
          const len = Math.hypot(dx, dy) || 1;
          const cl = Math.min(len, Rmax);
          const nx = dx / len * cl, ny = dy / len * cl;
          knobEl.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
          joy.x = len < 6 ? 0 : nx / Rmax;
          joy.y = len < 6 ? 0 : ny / Rmax;
        };
        let jPid = null, jox = 0, joy_y0 = 0;
        const jDown = e => {
          e.preventDefault(); e.stopPropagation();
          jPid = e.pointerId; joy.active = true;
          const r = joyEl.getBoundingClientRect();
          jox = r.left + r.width / 2; joy_y0 = r.top + r.height / 2;
          setKnob(e.clientX - jox, e.clientY - joy_y0);
          try { joyEl.setPointerCapture(e.pointerId); } catch (_) {}
        };
        const jMove = e => {
          if (jPid == null || e.pointerId !== jPid) return;
          e.preventDefault(); e.stopPropagation();
          setKnob(e.clientX - jox, e.clientY - joy_y0);
        };
        const jUp = e => {
          if (jPid != null && e.pointerId !== jPid) return;
          jPid = null; joy.active = false; joy.x = 0; joy.y = 0;
          knobEl.style.transform = 'translate(0,0)';
        };
        joyEl.addEventListener('pointerdown', jDown);
        joyEl.addEventListener('pointermove', jMove);
        joyEl.addEventListener('pointerup', jUp);
        joyEl.addEventListener('pointercancel', jUp);

        
        const lDown = e => {
          e.preventDefault(); e.stopPropagation();
          lookPid = e.pointerId; dragging = true; lx = e.clientX; ly = e.clientY;
          try { lookZone.setPointerCapture(e.pointerId); } catch (_) {}
        };
        const lMove = e => {
          if (lookPid == null || e.pointerId !== lookPid) return;
          e.preventDefault();
          const dx = e.clientX - lx, dy = e.clientY - ly;
          lx = e.clientX; ly = e.clientY;
          yaw -= dx * 0.005; pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.005));
        };
        const lUp = e => {
          if (lookPid != null && e.pointerId !== lookPid) return;
          lookPid = null; dragging = false;
        };
        lookZone.addEventListener('pointerdown', lDown);
        lookZone.addEventListener('pointermove', lMove);
        lookZone.addEventListener('pointerup', lUp);
        lookZone.addEventListener('pointercancel', lUp);
      }
    }

    const onKey = e => {
      const k = e.code;
      if (k === 'Escape') { e.preventDefault(); close(); return; }
      if (k === 'KeyF' && !(opts && opts.forceFly)) {
        fly = !fly;
        const flyBtn = api.ov && api.ov.querySelector('[data-hwv-fly]');
        if (flyBtn) { flyBtn.classList.toggle('on', fly); flyBtn.textContent = fly ? 'طيران ✓' : 'طيران'; }
        try { tip(fly ? 'وضع الطيران' : 'وضع المشي'); } catch (_) {}
      }
      if (fly && (k === 'Space' || k === 'ShiftLeft' || k === 'ShiftRight')) e.preventDefault();
      keys[k] = e.type === 'keydown';
    };
    const onDown = e => {
      if (isMob) return; 
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      dragging = true; lx = e.clientX; ly = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const onMove = e => {
      if (isMob || !dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      yaw -= dx * 0.0045;
      pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.0045));
    };
    const onUp = () => { if (!isMob) dragging = false; };
    addEventListener('keydown', onKey);
    addEventListener('keyup', onKey);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      let f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
      let r = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
      
      if (joy.active || joy.x || joy.y) {
        f += -joy.y;
        r += joy.x;
        const ml = Math.hypot(f, r);
        if (ml > 1) { f /= ml; r /= ml; }
      }
      const sp = fly ? flySpeed : speed;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      const rx = Math.cos(yaw), rz = -Math.sin(yaw);
      pos.x += (fx * f + rx * r) * sp * dt;
      pos.z += (fz * f + rz * r) * sp * dt;
      if (fly) {
        
        if (keys.Space || keys.KeyE) pos.y += sp * dt;
        if (keys.ShiftLeft || keys.ShiftRight || keys.KeyQ) pos.y -= sp * dt;
        if (pos.y < 0.3) pos.y = 0.3;
      } else {
        pos.y = 1.6;
        if (keys.Space) pos.y = 2.2;
      }
      const look = new T.Vector3(
        pos.x + Math.sin(yaw) * Math.cos(pitch) * -1,
        pos.y + Math.sin(pitch) * -1 + 0.0,
        pos.z + Math.cos(yaw) * Math.cos(pitch) * -1
      );
      
      const dir = new T.Vector3(
        -Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );
      camera.position.copy(pos);
      camera.lookAt(pos.x + dir.x, pos.y + dir.y, pos.z + dir.z);
      renderer.render(scene, camera);
      active.raf = requestAnimationFrame(tick);
    }
    active = {
      kind: opts && opts.kind || 'world',
      raf: requestAnimationFrame(tick),
      dispose() {
        removeEventListener('keydown', onKey);
        removeEventListener('keyup', onKey);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        try { if (joyEl && joyEl.parentNode) joyEl.parentNode.removeChild(joyEl); } catch (_) {}
        try { if (lookZone && lookZone.parentNode) lookZone.parentNode.removeChild(lookZone); } catch (_) {}
        try { renderer.dispose(); } catch (_) {}
      }
    };
    
    const flyBtn = api.ov.querySelector('[data-hwv-fly]');
    if (flyBtn) {
      if (fly) { flyBtn.classList.add('on'); flyBtn.textContent = 'طيران ✓'; }
      if (opts && opts.forceFly) {
        flyBtn.style.display = 'none'; 
      } else {
        flyBtn.onclick = () => {
          fly = !fly;
          flyBtn.classList.toggle('on', fly);
          flyBtn.textContent = fly ? 'طيران ✓' : 'طيران';
        };
      }
    }
    return { get fly() { return fly; }, set fly(v) { fly = !!v; } };
  }

  function openSobj(defId) {
    const def = (S.sdefs || []).find(x => +x.id === +defId);
    if (!def) { tip('الملف غير موجود'); return; }
    const ui = shell('عرض: ' + (def.name || 'كائن برمجي'),
      '<button type="button" class="hwv-fly on" data-hwv-fly title="طيران دائم">طيران ✓</button>');
    const host = ui.ov.querySelector('.hwv-body');
    const hint = host.querySelector('.hwv-hint');
    if (hint) hint.textContent = '';
    const mini = makeMiniScene(ui.canvas);
    fit(mini.renderer, mini.camera, host);
    const ro = new ResizeObserver(() => fit(mini.renderer, mini.camera, host));
    ro.observe(host);

    
    const model = buildSobjModel(def);
    model.position.set(0, 0, 0);
    mini.scene.add(model);

    
    const ring = new T.Mesh(
      new T.RingGeometry(0.55, 0.72, 32),
      new T.MeshBasicMaterial({ color: 0x2de2c4, transparent: true, opacity: 0.55, side: T.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02;
    mini.scene.add(ring);

    const prevClose = ui.close;
    ui.close = () => { try { ro.disconnect(); } catch (_) {} prevClose(); };
    ui.ov.querySelector('.hwv-close').onclick = ui.close;
    runPlayerLoop({ ...mini, canvas: ui.canvas, close: ui.close, ov: ui.ov }, { kind: 'sobj', flyDefault: true, forceFly: true });
  }

  function openUnit() {
    let dist = 1;
    const ui = shell('عارض الوحدة الافتراضية',
      `<label class="hwv-unit-lab">المسافة (وحدة)
        <input type="number" class="hwv-unit-inp" min="0.1" max="50" step="0.1" value="1">
      </label>
      <button type="button" class="hwv-fly" data-hwv-fly>طيران</button>`);
    const host = ui.ov.querySelector('.hwv-body');
    const mini = makeMiniScene(ui.canvas);
    fit(mini.renderer, mini.camera, host);
    const ro = new ResizeObserver(() => fit(mini.renderer, mini.camera, host));
    ro.observe(host);

    const char = makeChar();
    char.position.set(0, 0, 0);
    mini.scene.add(char);

    
    const wallMat = new T.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.55, metalness: 0.1, emissive: 0x1d4ed8, emissiveIntensity: 0.15 });
    const wall = new T.Mesh(new T.BoxGeometry(2.4, 2.2, 0.12), wallMat);
    wall.position.set(0, 1.1, -dist);
    mini.scene.add(wall);

    
    const label = document.createElement('div');
    label.className = 'hwv-dist-label';
    label.innerHTML = `<b>1 وحدة</b><span>= 1 متر في المحرك</span><em>البُعد الحالي: <strong>1.00</strong> وحدة</em>`;
    host.appendChild(label);

    const measureLine = new T.Group();
    const lineGeo = new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.05, 0), new T.Vector3(0, 0.05, -dist)]);
    const line = new T.Line(lineGeo, new T.LineBasicMaterial({ color: 0x60a5fa }));
    measureLine.add(line);
    mini.scene.add(measureLine);

    function applyDist(v) {
      dist = Math.max(0.1, Math.min(50, +v || 1));
      wall.position.z = -dist;
      line.geometry.dispose();
      line.geometry = new T.BufferGeometry().setFromPoints([
        new T.Vector3(0, 0.05, 0),
        new T.Vector3(0, 0.05, -dist)
      ]);
      const pretty = dist.toFixed(2);
      label.innerHTML = `<b>${pretty} وحدة</b><span>الوحدة الموحّدة في المحرك: <strong>1 وحدة = 1 متر</strong></span><em>البُعد بين اللاعب والحائط: <strong>${pretty}</strong> وحدة</em>`;
    }

    const inp = ui.ov.querySelector('.hwv-unit-inp');
    inp.addEventListener('input', () => applyDist(inp.value));
    inp.addEventListener('change', () => applyDist(inp.value));
    applyDist(1);

    const prevClose = ui.close;
    ui.close = () => { try { ro.disconnect(); } catch (_) {} prevClose(); };
    ui.ov.querySelector('.hwv-close').onclick = ui.close;
    runPlayerLoop({ ...mini, canvas: ui.canvas, close: ui.close, ov: ui.ov }, { kind: 'unit', flyDefault: false });
  }

  return { openSobj, openUnit, close: closeActive };
})();

function openSobjWorldViewer(id) { HawaWorldView.openSobj(id); }
function openUnitViewer() { HawaWorldView.openUnit(); }

function sList() {
  $('#sCount').textContent = S.sdefs.length + ' ملف';
  $('#sList').innerHTML = S.sdefs.map(d => {
    const big = isBig(d.code), cnt = S.objs.filter(o => o.def === d.id).length;
    const armed = S.item === 's:' + d.id && S.tool === 'place';
    const nm = d.name || '';
    return `<div class="pcard sobj-card ${armed ? 'is-on' : ''}" data-d="${d.id}">
      <div class="pc-top"><span class="pc-ico sobj-ico">🎮</span>${big ? '<span class="tag">كبير</span>' : ''}</div>
      <div class="pc-name" style="${fitNameStyle(nm)}" title="${esc(nm)}">${esc(nm)}</div>
      <div class="pc-meta"><em>${cnt ? cnt + ' في المشهد' : 'غير موضوع'}</em></div>
      <div class="pc-btns sobj-btns">
        <button type="button" data-sv="${d.id}" class="sobj-view" title="عرض في عالم 3D">عرض</button>
        <button data-pl="${d.id}" class="${armed ? 'on' : 'ok'}" title="${armed ? 'جاهز للوضع' : 'وضع'}">${ic('plus')}</button>
        <button data-sdp="${d.id}" title="بارامترات الملف">⚙</button>
        <button data-ed="${d.id}" data-k="sobj" title="تعديل">${ic('pen')}</button>
        <button data-dd="${d.id}" class="red" title="حذف">${ic('trash')}</button>
      </div></div>`;
  }).join('') || '<p class="mut small" style="grid-column:1/-1">— لا توجد كائنات برمجية بعد</p>';
}
$('#sList').onclick = async e => {
  const t = e.target.closest('button');
  if (!t) {
    const c = e.target.closest('[data-d]');
    if (c) openEd(+c.dataset.d, 'sobj');
    return;
  }
  if (t.dataset.sv != null) {
    try { openSobjWorldViewer(+t.dataset.sv); } catch (err) { console.warn(err); tip('تعذّر فتح العارض'); }
    return;
  }
  if (t.dataset.pl != null) {
    S.item = 's:' + t.dataset.pl;
    setTool('place');
    sList();
    armedMobile();
    return;
  }
  if (t.dataset.sdp != null) {
    openSdefParams(+t.dataset.sdp);
    return;
  }
  if (t.dataset.ed != null) {
    openEd(+t.dataset.ed, 'sobj');
    return;
  }
  if (t.dataset.dd != null) {
    const id = +t.dataset.dd;
    if (!await uiConfirm('حذف الكائن البرمجي وكل نسخه في المشهد؟')) return;
    try { invalidateGhostCache(id); } catch (e) {}
    S.sdefs = S.sdefs.filter(x => +x.id !== id);
    S.objs.filter(o => +o.def === id).forEach(o => delObj(o.id));
    try { if (GH) GH.userData.contentKey = ''; } catch (e) {}
    sList(); chg();
  }
};
const _sNew = $('#sNew'), _sUp = $('#sUp');
const _sUnit = $('#sUnitView');
if (_sNew) _sNew.onclick = () => {
  const d = {id: S.did++, name: 'كائن_' + S.did, code: STPL, p: {}};
  S.sdefs.push(d); sList(); openEd(d.id, 'sobj'); chg();
};
if (_sUp) _sUp.onclick = () => { const fl = $('#fl'); if (fl) { fl.dataset.m = 'sobj'; fl.click(); } };

function makeServerDir(base, label) {
  const enc = encodeURIComponent;
  const join = n => (base ? base + '/' : '') + n;
  const notFound = n => { const e = new Error('not found: ' + n); e.name = 'NotFoundError'; return e; };
  const listAt = async rel => {
    const r = await fetch('/api/fs/list?path=' + enc(rel), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.ok ? j.items : null;
  };
  const fileHandle = (name, rel) => ({
    kind: 'file', name,
    async getFile() {
      const r = await fetch('/api/fs/read?path=' + enc(rel), { cache: 'no-store' });
      if (!r.ok) throw notFound(rel);
      const blob = await r.blob();
      return new File([blob], name);
    },
    async createWritable() {
      const chunks = [];
      return {
        async write(c) { chunks.push(c); },
        async close() {
          const blob = new Blob(chunks);
          
          let fp = null;
          if (blob.size > 32768 && window.crypto && crypto.subtle) {
            try {
              const h = await crypto.subtle.digest('SHA-1', await blob.arrayBuffer());
              fp = blob.size + ':' + Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
              if (StoreFS._fp.get(rel) === fp) return;
            } catch (_) { fp = null; }
          }
          const r = await fetch('/api/fs/write?path=' + enc(rel), { method: 'POST', body: blob });
          if (!r.ok) throw new Error('server write failed: ' + rel);
          if (fp) StoreFS._fp.set(rel, fp);
        }
      };
    }
  });
  return {
    kind: 'directory',
    name: label || (base.split('/').pop() || 'project'),
    async getDirectoryHandle(name, opts) {
      const rel = join(name);
      if (opts && opts.create) {
        const r = await fetch('/api/fs/mkdir?path=' + enc(rel), { method: 'POST' });
        if (!r.ok) throw new Error('mkdir failed: ' + rel);
      } else if (!(await listAt(rel))) throw notFound(rel);
      return makeServerDir(rel);
    },
    async getFileHandle(name, opts) {
      return fileHandle(name, join(name));
    },
    async *entries() {
      const items = (await listAt(base)) || [];
      for (const it of items) {
        yield [it.name, it.kind === 'directory' ? makeServerDir(join(it.name)) : fileHandle(it.name, join(it.name))];
      }
    }
  };
}

const StoreFS = {
  dbName: 'hawa_fs_v1',
  storeName: 'handles',
  handle: null,
  mode: 'local',
  label: 'متصفح (localStorage)',
  _fp: new Map(),
  legacy: null,
  _saving: false,
  _again: false,
  async _idb() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(this.dbName, 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName);
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  },
  async _idbSet(key, val) {
    const db = await this._idb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async _idbGet(key) {
    const db = await this._idb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const q = tx.objectStore(this.storeName).get(key);
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(q.error);
    });
  },
  supportsFolder() {
    return typeof window.showDirectoryPicker === 'function';
  },
  isFolderLike() {
    // لو الإذن لسه محتاج ضغطة مستخدم — متعتمدش على المجلد في الحفظ التلقائي
    if (this.needsGesture && this.mode === 'folder') return false;
    return !!this.handle && (this.mode === 'folder' || this.mode === 'server');
  },
  
  async initServer() {
    if (location.protocol === 'file:') return false;
    let info = null;
    try {
      const ctl = typeof AbortController === 'function' ? new AbortController() : null;
      const to = ctl ? setTimeout(() => ctl.abort(), 2500) : 0;
      const r = await fetch('/api/fs/ping', { cache: 'no-store', signal: ctl ? ctl.signal : undefined });
      if (to) clearTimeout(to);
      if (r.ok) info = await r.json();
    } catch (_) { info = null; }
    if (!info || !info.ok) return false;
    this.handle = makeServerDir('', 'HawaEngineData/project');
    this.mode = 'server';
    this.label = 'تلقائي: ' + (info.dir || 'HawaEngineData/project');
    this.serverDir = info.dir || '';
    this.needsGesture = false;
    this.legacy = null;
    
    if (!info.exists && this.supportsFolder()) {
      try {
        const h = await this._idbGet('dir');
        if (h) { this.legacy = h; return 'migrate'; }
      } catch (_) {}
    }
    return true;
  },
  async readFromLegacy() {
    if (!this.legacy) return null;
    const keep = this.handle;
    try {
      let p = 'prompt';
      try { p = await this.legacy.queryPermission({ mode: 'read' }); } catch (_) {}
      if (p !== 'granted') p = await this.legacy.requestPermission({ mode: 'read' });
      if (p !== 'granted') return null;
      this.handle = this.legacy;
      return await this.readFolder();
    } catch (e) { console.warn('legacy read', e); return null; }
    finally { this.handle = keep; }
  },
  /** أول لمسة بعد الريفرش = إعادة إذن المجلد تلقائي (موبايل + كمبيوتر) من غير زر تفعيل */
  _bindSilentFolderRestore() {
    if (this._silentBound || !this.handle) return;
    this._silentBound = true;
    const once = async () => {
      try { document.removeEventListener('pointerdown', once, true); } catch (_) {}
      try { document.removeEventListener('click', once, true); } catch (_) {}
      if (!this.handle || this.mode === 'folder' || this.mode === 'server') return;
      try {
        const p = await this.handle.requestPermission({ mode: 'readwrite' });
        if (p === 'granted') {
          this.needsGesture = false;
          this.mode = 'folder';
          this.label = 'مجلد: ' + (this.handle.name || 'جهاز');
          try { localStorage.setItem('hawa2-store-mode', 'folder'); } catch (_) {}
          try { await this.saveAll(); } catch (_) {}
          try { tip('✔ تم ربط مجلد التخزين: ' + (this.handle.name || '')); } catch (_) {}
          try { updStorageActBtn(); } catch (_) {}
        }
      } catch (e) { console.warn('silent folder restore', e); }
    };
    try {
      document.addEventListener('pointerdown', once, true);
      document.addEventListener('click', once, true);
    } catch (_) {}
  },
  async init() {
    this.handle = null;
    this.mode = 'none';
    this.label = 'لم يُحدَّد';
    this.needsGesture = false;
    this._silentBound = false;
    try {
      const sv = await this.initServer();
      if (sv) return sv;
    } catch (e) { console.warn('StoreFS server', e); }

    // مجلد الجهاز (موبايل Chrome + كمبيوتر): اختيار مرة → والحفظ عليه
    if (!this.supportsFolder()) {
      this.mode = 'local';
      this.label = 'متصفح (localStorage)';
      return false;
    }
    try {
      const h = await this._idbGet('dir');
      if (h) {
        let perm = 'prompt';
        try { perm = await h.queryPermission({ mode: 'readwrite' }); } catch (_) {}
        this.handle = h;
        if (perm === 'granted') {
          this.mode = 'folder';
          this.label = 'مجلد: ' + (h.name || 'جهاز');
          this.needsGesture = false;
          try { localStorage.setItem('hawa2-store-mode', 'folder'); } catch (_) {}
          return true;
        }
        // الإذن نائم بعد الريفرش — نرجّعه تلقائي عند أول لمسة (من غير زر تفعيل)
        this.mode = 'local';
        this.label = 'مجلد محفوظ: ' + (h.name || 'جهاز') + ' (هيتفعل مع أول لمسة)';
        this.needsGesture = false;
        this._bindSilentFolderRestore();
        return false;
      }
    } catch (e) { console.warn('StoreFS init', e); }
    this.mode = 'local';
    this.label = 'متصفح (localStorage)';
    return false;
  },
  async activatePermission() {
    if (!this.handle) return false;
    try {
      const p = await this.handle.requestPermission({ mode: 'readwrite' });
      if (p === 'granted') {
        this.needsGesture = false;
        this.mode = 'folder';
        this.label = 'مجلد: ' + (this.handle.name || 'جهاز');
        try { localStorage.setItem('hawa2-store-mode', 'folder'); } catch (_) {}
        return true;
      }
    } catch (e) { console.warn('activatePermission', e); }
    return false;
  },
  snapshot() {
    if (typeof packProjectSnapshot === 'function') return packProjectSnapshot('autosave');
    return {
      format: 'hawa-project-v3',
      objs: S.objs, scripts: S.scripts, sdefs: S.sdefs,
      media: S.media || {}, mediaOrder: Array.isArray(S.mediaOrder) ? S.mediaOrder.slice() : Object.keys(S.media || {}), nid: S.nid, sid: S.sid, did: S.did, mid: S.mid || 1
    };
  },
  _safeName(name, id) {
    const base = String(name || id || 'file').replace(/[^\w\u0600-\u06FF.\-]+/g, '_');
    return (base || 'file').slice(0, 80);
  },
  _dataUrlToBytes(dataUrl) {
    const s = String(dataUrl || '');
    const comma = s.indexOf(',');
    const b64 = comma > 0 ? s.slice(comma + 1) : s;
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  },
  _bytesToDataUrl(bytes, mime) {
    let bin = '';
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const chunk = 0x8000;
    for (let i = 0; i < arr.length; i += chunk) {
      bin += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
    }
    return 'data:' + (mime || 'application/octet-stream') + ';base64,' + btoa(bin);
  },
  async _ensureDir(parent, name) {
    return parent.getDirectoryHandle(name, { create: true });
  },
  async _writeFile(dirHandle, name, content) {
    const fh = await dirHandle.getFileHandle(name, { create: true });
    const w = await fh.createWritable();
    await w.write(content);
    await w.close();
  },
  async _readFileText(dirHandle, name) {
    const fh = await dirHandle.getFileHandle(name);
    const file = await fh.getFile();
    return file.text();
  },
  async _readFileBytes(dirHandle, name) {
    const fh = await dirHandle.getFileHandle(name);
    const file = await fh.getFile();
    return new Uint8Array(await file.arrayBuffer());
  },
  
  async writeFolder(data) {
    if (!this.handle) return false;
    const root = this.handle;
    const mediaDir = await this._ensureDir(root, 'media');
    const scriptsDir = await this._ensureDir(root, 'scripts');
    const sdefsDir = await this._ensureDir(root, 'sdefs');

    const mediaIndex = {};
    const media = (data && data.media) || S.media || {};
    for (const id of Object.keys(media)) {
      const m = media[id];
      if (!m) continue;
      const fname = id + '_' + this._safeName(m.name, id);
      mediaIndex[id] = { name: m.name || fname, mime: m.mime || 'application/octet-stream', file: 'media/' + fname };
      try {
        if (m.data && String(m.data).startsWith('data:')) {
          const bytes = this._dataUrlToBytes(m.data);
          await this._writeFile(mediaDir, fname, bytes);
        }
      } catch (e) { console.warn('media write', id, e); }
    }

    
    const objs = JSON.parse(JSON.stringify((data && data.objs) || S.objs || []));
    for (const o of objs) {
      if (!o.p) continue;
      for (const k of Object.keys(o.p)) {
        const v = o.p[k];
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 64) {
          const mid = 'inline_' + o.id + '_' + k;
          const fname = mid + '.bin';
          try {
            await this._writeFile(mediaDir, fname, this._dataUrlToBytes(v));
            mediaIndex[mid] = { name: fname, mime: 'application/octet-stream', file: 'media/' + fname };
            o.p[k] = 'media:' + mid;
          } catch (_) {}
        }
      }
    }

    const scripts = (data && data.scripts) || S.scripts || [];
    for (const s of scripts) {
      try {
        const fname = this._safeName(s.name || ('script_' + s.id), s.id) + (/\.js$/i.test(s.name || '') ? '' : '.js');
        await this._writeFile(scriptsDir, fname, s.code || '');
      } catch (e) { console.warn('script write', e); }
    }
    const sdefs = (data && data.sdefs) || S.sdefs || [];
    for (const d of sdefs) {
      try {
        const fname = this._safeName(d.name || ('sdef_' + d.id), d.id) + (/\.js$/i.test(d.name || '') ? '' : '.js');
        await this._writeFile(sdefsDir, fname, d.code || '');
      } catch (e) { console.warn('sdef write', e); }
    }

    
    const persist = (typeof projectPersistFields === 'function') ? projectPersistFields() : {};
    // لو data جاية من snapshot حديثة — فضّل قيمها
    if (data) {
      for (const k of ['playNet','roomMinEnabled','roomFillExact','roomMinPlayers','roomMinPlayersSetting','snap','player','builderCam']) {
        if (data[k] != null) persist[k] = data[k];
      }
    }
    const lean = {
      format: 'hawa-folder-v1',
      version: 1,
      name: (data && data.name) || 'project',
      objs,
      scripts: JSON.parse(JSON.stringify(scripts)),
      sdefs: JSON.parse(JSON.stringify(sdefs)),
      mediaIndex,
      nid: (data && data.nid) || S.nid,
      sid: (data && data.sid) || S.sid,
      did: (data && data.did) || S.did,
      mid: (data && data.mid) || S.mid || 1,
      mediaOrder: (data && Array.isArray(data.mediaOrder)) ? data.mediaOrder.slice()
        : (Array.isArray(S.mediaOrder) ? S.mediaOrder.slice() : Object.keys((data && data.media) || S.media || {})),
      ...persist,
      allowScriptSpawn: true,
      exportedAt: new Date().toISOString(),
      savedAt: Date.now()
    };
    
    if (lean.scripts) lean.scripts.forEach(s => {  });
    await this._writeFile(root, 'hawa-project.json', JSON.stringify(lean, null, 2));
    await this._writeFile(root, 'README.txt',
      'Hawa Engine — تخزين كلي\n' +
      '- hawa-project.json : المشهد والبارامترات والروابط\n' +
      '- media/ : كل الصور والصوت والفيديو والملفات\n' +
      '- scripts/ : ملفات البرمجة\n' +
      '- sdefs/ : تعريفات الكائنات البرمجية\n'
    );
    return true;
  },
  async readFolder() {
    if (!this.handle) return null;
    const root = this.handle;
    let lean;
    try {
      lean = JSON.parse(await this._readFileText(root, 'hawa-project.json'));
    } catch (e) {
      console.warn('read project', e);
      return null;
    }
    const media = {};
    const index = lean.mediaIndex || lean.media || {};
    
    for (const id of Object.keys(index)) {
      const m = index[id];
      if (!m) continue;
      if (m.data && String(m.data).startsWith('data:')) {
        media[id] = { name: m.name, mime: m.mime, data: m.data };
        continue;
      }
      const rel = m.file || ('media/' + id + '_' + this._safeName(m.name, id));
      const parts = String(rel).split('/');
      const fname = parts.pop();
      try {
        const dir = parts[0] === 'media' ? await root.getDirectoryHandle('media') : root;
        const bytes = await this._readFileBytes(dir, fname);
        media[id] = {
          name: m.name || fname,
          mime: m.mime || 'application/octet-stream',
          data: this._bytesToDataUrl(bytes, m.mime || 'application/octet-stream')
        };
      } catch (e) { console.warn('read media', id, e); }
    }
    
    try {
      const mediaDir = await root.getDirectoryHandle('media');
      const indexedFiles = new Set(Object.keys(index).map(k => String((index[k] && index[k].file) || '').split('/').pop()));
      for await (const [name, ent] of mediaDir.entries()) {
        if (ent.kind !== 'file') continue;
        if (indexedFiles.has(name)) continue;      
        const idGuess = name.split('_')[0];
        if (media[idGuess]) continue;
        try {
          const bytes = await this._readFileBytes(mediaDir, name);
          media[idGuess] = { name, mime: 'application/octet-stream', data: this._bytesToDataUrl(bytes, 'application/octet-stream') };
        } catch (_) {}
      }
    } catch (_) {}

    return {
      format: 'hawa-project-v3',
      name: lean.name,
      objs: lean.objs || [],
      scripts: lean.scripts || [],
      sdefs: lean.sdefs || [],
      media,
      mediaOrder: Array.isArray(lean.mediaOrder) ? lean.mediaOrder.slice() : Object.keys(media),
      nid: lean.nid, sid: lean.sid, did: lean.did, mid: lean.mid,
      playNet: lean.playNet === 'online' || lean.playNet === 'offline' ? lean.playNet : null,
      player: lean.player || null,
      roomMinEnabled: lean.roomMinEnabled != null ? !!lean.roomMinEnabled : undefined,
      roomFillExact: lean.roomFillExact != null ? !!lean.roomFillExact : undefined,
      roomMinPlayers: lean.roomMinPlayers != null ? +lean.roomMinPlayers : undefined,
      roomMinPlayersSetting: lean.roomMinPlayersSetting != null ? +lean.roomMinPlayersSetting
        : (lean.roomMinPlayers != null ? +lean.roomMinPlayers : undefined),
      snap: (lean.snap === 0 || lean.snap === .25 || lean.snap === .5 || lean.snap === 1) ? lean.snap : undefined,
      allowScriptSpawn: true,
      builderCam: lean.builderCam || null,
      savedAt: lean.savedAt || null
    };
  },
  async saveAll() {
    const data = this.snapshot();
    
    if (!this.isFolderLike()) {
      console.warn('saveAll: لا يوجد مجلد تخزين');
      return data;
    }
    
    if (this._saving) { this._again = true; return data; }
    this._saving = true;
    try {
      let d = data;
      do {
        this._again = false;
        try { await this.writeFolder(d); } catch (e) { console.warn('folder save', e); throw e; }
        if (this._again) d = this.snapshot();
      } while (this._again);
    } finally { this._saving = false; }
    return data;
  },
  async loadPreferred() {
    if (this.handle) {
      try {
        const d = await this.readFolder();
        if (d) return d;
      } catch (e) { console.warn(e); }
    }
    return null;
  },
  async listFolderTree() {
    if (!this.handle) return '—';
    const lines = [];
    const walk = async (dir, prefix, depth) => {
      if (depth > 3) return;
      const entries = [];
      for await (const [name, ent] of dir.entries()) entries.push([name, ent]);
      entries.sort((a, b) => a[0].localeCompare(b[0]));
      for (const [name, ent] of entries) {
        if (ent.kind === 'directory') {
          lines.push(prefix + '📁 ' + name + '/');
          try { await walk(ent, prefix + '&nbsp;&nbsp;', depth + 1); } catch (_) {}
        } else {
          let size = '';
          try {
            const f = await ent.getFile();
            size = ' (' + Math.max(1, Math.round(f.size / 1024)) + ' KB)';
          } catch (_) {}
          lines.push(prefix + '📄 ' + name + size);
        }
      }
    };
    lines.push('📁 ' + (this.handle.name || 'root') + '/');
    await walk(this.handle, '&nbsp;&nbsp;', 0);
    return lines.join('<br>') || 'المجلد فارغ';
  },
  async ensureFolderOrPrompt(force) {
    if (this.mode === 'server' && this.handle) return true;
    if (this.handle && !force) return true;
    // سيرفر أو localStorage يكفي — مفيش إجبار على اختيار مجلد
    if (this.mode === 'server' || this.mode === 'local') return true;
    if (!force) return !!this.handle;
    if (!this.supportsFolder()) return false;
    // force فقط من «عرض التخزين» لما المستخدم يطلب بنفسه
    return await this.pickAndMigrate();
  },
  async pickAndMigrate() {
    if (!this.supportsFolder()) {
      await uiAlert('المتصفح لا يدعم اختيار مجلد.\nجرّب Chrome على أندرويد أو الكمبيوتر.\nالحفظ داخل المتصفح شغال كبديل دائم.');
      return false;
    }
    try {
      const fromName = this.mode === 'server'
        ? (this.serverDir || 'التخزين التلقائي')
        : (this.handle && this.handle.name)
          ? ('مجلد «' + this.handle.name + '»')
          : (this.mode === 'local' || this.mode === 'none' ? 'المتصفح (localStorage)' : 'التخزين الحالي');
      const dir = await window.showDirectoryPicker({
        id: 'hawa-project-store',
        mode: 'readwrite',
        startIn: 'documents'
      });
      const toName = dir.name || 'المجلد الجديد';
      const ui = showTransferProgress(fromName, toName);
      try {
        ui.setStep('قراءة المشروع الحالي…');
        const data = this.snapshot();
        ui.setStep('تجهيز المجلد «' + toName + '»…');
        this.handle = dir;
        await this._idbSet('dir', dir);
        this.mode = 'folder';
        this.label = 'مجلد: ' + toName;
        try { localStorage.setItem('hawa2-store-mode', 'folder'); } catch (_) {}
        ui.setStep('جاري النقل إلى «' + toName + '»…');
        await this.writeFolder(data);
        ui.done(true, 'تم النقل بنجاح إلى «' + toName + '»');
        try { tip('✔ تم نقل المشروع إلى «' + toName + '»'); } catch (_) {}
        return true;
      } catch (err) {
        ui.done(false, 'فشل النقل: ' + (err && err.message || err));
        throw err;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      console.error(e);
      await uiAlert('تعذر اختيار/كتابة المجلد:\n' + (e.message || e));
      return false;
    }
  },
  async useLocalOnly() {
    
    return await this.pickAndMigrate();
  }
};

function save() {
  // نسخة محلية دائماً + مجلد/سيرفر — أي تعديل في البناء
  try {
    const snap = packProjectSnapshot((S && S._projName) || 'مشروع');
    localStorage.setItem('hawa2-project', JSON.stringify(snap));
    localStorage.setItem('hawa2-room', JSON.stringify(projectPersistFields()));
  } catch (e) { console.warn('local save', e); }
  try {
    if (StoreFS && StoreFS.isFolderLike()) StoreFS.saveAll().catch(e => console.warn(e));
  } catch (e) { console.warn('folder save', e); }
}

let svT; let rfT;
function chg() {
  refNames = null;
  try { hier(); } catch (_) {}
  clearTimeout(rfT);
  rfT = setTimeout(() => { refNames = null; try { hier(); } catch (_) {} }, 500);
  S.dirty = 1;
  clearTimeout(svT);
  // حفظ سريع بعد أي تغيير في الشريط أو المشهد
  svT = setTimeout(save, 280);
  try { refreshLive(); } catch (_) {}
}
// حفظ إجباري عند إغلاق/تحديث الصفحة + نبض دوري لو في تعديلات
(function bindPersistGuards() {
  const flush = () => { try { clearTimeout(svT); save(); } catch (_) {} };
  try {
    addEventListener('pagehide', flush);
    addEventListener('beforeunload', flush);
    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  } catch (_) {}
  setInterval(() => {
    try {
      if (S && S.dirty && S.mode === 'build') {
        S.dirty = 0;
        save();
      }
    } catch (_) {}
  }, 4000);
})();
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
  if (!d) return;
  if (d && d.media && typeof d.media === 'object') {
    S.media = append ? Object.assign({}, S.media || {}, d.media) : Object.assign({}, d.media);
  } else if (!append) {
    S.media = {}; S.mediaOrder = [];
  }
  
  if (d && Array.isArray(d.mediaOrder)) {
    S.mediaOrder = append
      ? (Array.isArray(S.mediaOrder) ? S.mediaOrder : []).concat(d.mediaOrder.filter(id => !(S.mediaOrder || []).includes(id)))
      : d.mediaOrder.slice();
  } else if (!append) {
    S.mediaOrder = Object.keys(S.media || {});
  }
  try { ensureMediaOrder(); } catch (_) {}
  
  try {
    for (const id of Object.keys(S.media || {})) {
      const m = S.media[id];
      if (m && !m.kind) m.kind = mediaKindFrom(m.mime, m.name);
    }
  } catch (_) {}
  if (d && d.mid) S.mid = Math.max(S.mid || 1, +d.mid || 1);

  if (S.mode === 'play') try { playStop(); } catch (_) {}
  if (Array.isArray(d)) { d = {objs: d}; append = true; }
  if (!append) {
    clearAll();
    S.scripts = (d.scripts || []).map(s => ({
      id: +s.id, name: s.name, code: s.code || '',
      enabled: s.enabled != null ? !!s.enabled : !!s.global,
      p: (s.p && typeof s.p === 'object') ? JSON.parse(JSON.stringify(s.p)) : {}
    }));
    S.sdefs = (d.sdefs || []).map(x => ({
      id: +x.id, name: x.name, code: x.code || '',
      p: (x.p && typeof x.p === 'object') ? JSON.parse(JSON.stringify(x.p)) : {}
    }));
    const maxSid = S.scripts.reduce((m, s) => Math.max(m, +s.id || 0), 0);
    const maxDid = S.sdefs.reduce((m, s) => Math.max(m, +s.id || 0), 0);
    S.sid = Math.max(1, (d.sid || 0), maxSid + 1);
    S.did = Math.max(1, (d.did || 0), maxDid + 1);
    S.nid = 1;
  }
  for (const r of d.objs || []) {
    const o = norm(r);
    if (!o) continue;
    
    if (!append && r.id != null) {
      o.id = +r.id;
      if (o.id >= S.nid) S.nid = o.id + 1;
    }
    o.scripts = (r.scripts || []).filter(i => S.scripts.some(s => +s.id === +i));
    o.def = r.def;
    if (r.p && typeof r.p === 'object') o.p = JSON.parse(JSON.stringify(r.p));
    reg(o);
  }
  if (!append) {
    if (d.nid) S.nid = Math.max(S.nid, +d.nid);
    if (d.player && typeof d.player === 'object' && typeof PCFG !== 'undefined') {
      try { Object.assign(PCFG, d.player); } catch (_) {}
    }
    
    // استعادة كل إعدادات المشروع (رووم / شبكة / شبكة / لاعب / …)
    applyProjectPersistFields(d);
    if (S.playNet === 'offline') {
      try { removeAllOnlineSpawns(); } catch (_) {}
    }
    // لو الملف القديم ناقص إعدادات — كمّل من النسخة المحلية
    if (d.roomMinEnabled == null && d.roomFillExact == null) {
      try {
        const loc = JSON.parse(localStorage.getItem('hawa2-room') || 'null');
        if (loc) applyProjectPersistFields(loc);
      } catch (_) {}
    }
    try {
      const ai = document.getElementById('spAllowScript');
      if (ai) ai.checked = !!S.allowScriptSpawn;
    } catch (_) {}
    try { syncPlayNetUI(); } catch (_) {}
    try { refreshSpawnsPanel(); } catch (_) {}
  }
  try { SCH.clear(); } catch (_) {}
  if (!append && d.builderCam) {
    try { applyBuilderCam(d.builderCam); } catch (_) {}
  }
  hier(); pList(); sList(); inspect(); chg();
  try { save(); } catch (_) {}
  
  if (!append && !window.HAWA_PLAY_ONLY && S.playNet !== 'online' && S.playNet !== 'offline') {
    setTimeout(() => { try { ensurePlayNetChosen(false); } catch (_) {} }, 400);
  }
}
/** كل حالة المشروع القابلة للحفظ — أي تعديل في البناء لازم يعدّي من هنا */
function projectPersistFields() {
  const roomMin = Math.max(2, Math.floor(+S.roomMinPlayers || 2));
  return {
    playNet: S.playNet === 'online' || S.playNet === 'offline' ? S.playNet : null,
    allowScriptSpawn: true,
    roomMinEnabled: !!S.roomMinEnabled,
    roomMinPlayers: roomMin,
    roomMinPlayersSetting: roomMin,
    roomFillExact: !!S.roomFillExact,
    snap: (S.snap === 0 || S.snap === .25 || S.snap === .5 || S.snap === 1) ? S.snap : .5,
    player: (typeof PCFG !== 'undefined') ? JSON.parse(JSON.stringify(PCFG)) : null,
    builderCam: (typeof getBuilderCam === 'function') ? getBuilderCam() : null
  };
}
function applyProjectPersistFields(d) {
  if (!d || typeof d !== 'object') return;
  if (d.playNet === 'online' || d.playNet === 'offline') {
    S.playNet = d.playNet;
  }
  S.allowScriptSpawn = true;
  if (d.roomMinEnabled != null) S.roomMinEnabled = !!d.roomMinEnabled;
  if (d.roomFillExact != null) S.roomFillExact = !!d.roomFillExact;
  let rmp = d.roomMinPlayersSetting != null ? d.roomMinPlayersSetting : d.roomMinPlayers;
  if (rmp != null) S.roomMinPlayers = Math.max(2, Math.floor(+rmp || 2));
  if (d.snap === 0 || d.snap === .25 || d.snap === .5 || d.snap === 1) {
    S.snap = d.snap;
    try {
      const el = document.querySelector('#bSnap .snap-l');
      if (el) el.textContent = S.snap ? String(S.snap) : 'حر';
    } catch (_) {}
  }
  if (d.player && typeof d.player === 'object' && typeof PCFG !== 'undefined') {
    try { Object.assign(PCFG, d.player); } catch (_) {}
  }
}
function packProjectSnapshot(name) {
  const meta = projectPersistFields();
  return {
    format: 'hawa-project-v3',
    version: 3,
    name: name || (S && S._projName) || 'مشروع',
    objs: JSON.parse(JSON.stringify(S.objs)),
    scripts: JSON.parse(JSON.stringify(S.scripts)),
    sdefs: JSON.parse(JSON.stringify(S.sdefs)),
    media: JSON.parse(JSON.stringify(S.media || {})),
    mediaOrder: Array.isArray(S.mediaOrder) ? S.mediaOrder.slice() : Object.keys(S.media || {}),
    nid: S.nid, sid: S.sid, did: S.did, mid: S.mid || 1,
    ...meta,
    exportedAt: new Date().toISOString(),
    savedAt: Date.now()
  };
}
async function downloadProjectZip() {
  if (typeof JSZip === 'undefined') { await uiAlert('JSZip غير محمّل'); return; }
  const name = await uiPrompt('اسم المشروع؟', 'مشروعي');
  if (!name || !name.trim()) return;
  const data = packProjectSnapshot(name.trim());
  const zip = new JSZip();
  zip.file('project.json', JSON.stringify(data, null, 2));
  zip.file('README.txt', 'Hawa Engine Project\n' + data.name + '\nارفع هذا الـ ZIP من زر «رفع المشروع» لمتابعة البناء.\n');
  
  const media = data.media || {};
  for (const id of Object.keys(media)) {
    const m = media[id];
    if (!m || !m.data) continue;
    try {
      const dataUrl = String(m.data);
      const comma = dataUrl.indexOf(',');
      const b64 = comma > 0 ? dataUrl.slice(comma + 1) : dataUrl;
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const safe = String(m.name || id).replace(/[^\w\u0600-\u06FF.\-]+/g, '_');
      zip.file('media/' + id + '_' + safe, arr);
    } catch (_) {}
  }
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (name.trim().replace(/[^\w\u0600-\u06FF\-]+/g, '_') || 'hawa-project') + '.zip';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  try { tip('✔ تم تحميل المشروع'); } catch (_) {}
}
async function uploadProjectZip(file) {
  if (!file) return;
  if (typeof JSZip === 'undefined') { await uiAlert('JSZip غير محمّل'); return; }
  try {
    const zip = await JSZip.loadAsync(file);
    let jsonText = null;
    if (zip.file('project.json')) jsonText = await zip.file('project.json').async('string');
    else {
      
      const names = Object.keys(zip.files).filter(n => /\.json$/i.test(n) && !zip.files[n].dir);
      if (names.length) jsonText = await zip.file(names[0]).async('string');
    }
    if (!jsonText) { await uiAlert('الملف لا يحتوي project.json'); return; }
    const data = JSON.parse(jsonText);
    if (!data || (!data.objs && !data.scripts && !data.sdefs)) {
      await uiAlert('ملف مشروع غير صالح');
      return;
    }
    
    try {
      if (S.playNet === 'online' || S.playNet === 'offline') {
        const ok = await confirmPlayNetMismatch(data, S.playNet);
        if (!ok) { tip('تم إلغاء الرفع'); return; }
      }
    } catch (_) {}
    
    if (!data.media) data.media = {};
    const mediaFiles = Object.keys(zip.files).filter(n => n.startsWith('media/') && !zip.files[n].dir);
    for (const path of mediaFiles) {
      const base = path.split('/').pop() || '';
      const id = base.split('_')[0];
      if (data.media[id] && data.media[id].data) continue;
      try {
        const buf = await zip.file(path).async('uint8array');
        let bin = '';
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        const b64 = btoa(bin);
        const mime = (data.media[id] && data.media[id].mime) || 'application/octet-stream';
        data.media[id] = {
          name: (data.media[id] && data.media[id].name) || base.replace(/^[^_]+_/, ''),
          mime,
          data: 'data:' + mime + ';base64,' + b64
        };
      } catch (_) {}
    }
        loadData(data, false);
    try {
      const pn = detectPlayNet(data);
      if (pn === 'online' || pn === 'offline') {
        tip('✔ تم رفع المشروع · الوضع: ' + (pn === 'online' ? 'أونلاين' : 'أوفلاين'));
      }
    } catch (_) {}
    try { tip('✔ تم رفع المشروع — تقدر تكمّل'); } catch (_) {}
  } catch (e) {
    console.error(e);
    await uiAlert('فشل قراءة المشروع:\n' + (e.message || e));
  }
}
async function wipeProjectTotal() {
  for (let i = 1; i <= 3; i++) {
    const ok = await uiConfirm('تأكيد ' + i + ' من 3\n\nهذا سيحذف كل شيء في المشروع الحالي (كائنات، برمجة، كائنات برمجية، وسائط، تخزين محلي).\nهل أنت متأكد؟');
    if (!ok) { try { tip('تم إلغاء الحذف'); } catch (_) {} return; }
  }
  try { if (S.mode === 'play') playStop(); } catch (_) {}
  clearAll();
  S.scripts = [];
  S.sdefs = [];
  S.media = {}; S.mediaOrder = [];
  S.nid = 1; S.sid = 1; S.did = 1; S.mid = 1;
  S.sel = null; S.paramOpen = false;
  S.playNet = null; 
  try { SCH.clear(); } catch (_) {}
  try { localStorage.removeItem('hawa2'); } catch (_) {} 
  try { closeParamPanel(); } catch (_) {}
  hier(); pList(); sList(); inspect();
  try { demo(); } catch (_) {  }
  chg();
  try { syncPlayNetUI(); } catch (_) {}
  try { save(); } catch (_) {}
  try { tip('✔ المشروع اتصفر'); } catch (_) {}
  
  try { await ensurePlayNetChosen(false); } catch (_) {}
  if (StoreFS.mode === 'server') {
    try { await fetch('/api/fs/wipe', { method: 'POST' }); StoreFS._fp.clear(); } catch (_) {}
    try { await StoreFS.saveAll(); } catch (_) {}
    try { tip('✔ المشروع اتمسح · التخزين تلقائي'); } catch (_) {}
    return;
  }
  // مفيش إجبار على اختيار مجلد — localStorage أو المجلد الحالي يكفي
  try { await StoreFS.saveAll(); } catch (_) {}
  try { tip('✔ المشروع اتمسح'); } catch (_) {}
}
/** نافذة تقدم النقل بين أماكن التخزين */
function showTransferProgress(fromName, toName) {
  let el = document.getElementById('hawaTransferUI');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hawaTransferUI';
    el.style.cssText = 'position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;background:rgba(6,5,12,.82);backdrop-filter:blur(6px);font-family:Cairo,Tahoma,sans-serif;color:#f4efe4';
    document.body.appendChild(el);
  }
  el.innerHTML =
    '<div style="width:min(420px,92vw);padding:28px 24px;border-radius:18px;background:linear-gradient(180deg,#1a1528,#0e0b16);border:1px solid rgba(255,190,61,.35);box-shadow:0 24px 60px rgba(0,0,0,.55);text-align:center">' +
      '<div style="font-size:28px;margin-bottom:10px">📦</div>' +
      '<div style="font-size:18px;font-weight:900;margin-bottom:6px">جاري نقل التخزين</div>' +
      '<div style="font-size:13px;opacity:.85;line-height:1.7;margin-bottom:16px">' +
        'من: <b style="color:#ffe2a6" id="xferFrom">' + (fromName || '—') + '</b><br>' +
        'إلى: <b style="color:#7ff0dc" id="xferTo">' + (toName || '—') + '</b>' +
      '</div>' +
      '<div style="width:100%;height:6px;border-radius:99px;background:#1e1a2e;overflow:hidden;border:1px solid #2a2438;margin-bottom:12px">' +
        '<div id="xferBar" style="height:100%;width:12%;background:linear-gradient(90deg,#7ff0dc,#ffe2a6,#c4b5fd);transition:width .2s linear"></div>' +
      '</div>' +
      '<div id="xferStep" style="font-size:13px;font-weight:700;opacity:.9">جاري التحضير…</div>' +
    '</div>';
  el.style.display = 'flex';
  let p = 12;
  const bar = () => document.getElementById('xferBar');
  const stepEl = () => document.getElementById('xferStep');
  const tick = setInterval(() => {
    p = Math.min(90, p + 3 + Math.random() * 5);
    const b = bar(); if (b) b.style.width = p + '%';
  }, 180);
  return {
    setStep(t) { const s = stepEl(); if (s) s.textContent = t || ''; },
    done(ok, msg) {
      clearInterval(tick);
      const b = bar(); if (b) b.style.width = '100%';
      const s = stepEl(); if (s) s.textContent = msg || (ok ? 'تم' : 'فشل');
      setTimeout(() => {
        try { el.style.display = 'none'; el.remove(); } catch (_) {}
      }, ok ? 900 : 1800);
    }
  };
}

async function openStorageFolderOnDevice() {
  // 1) وضع السيرفر: اطلب من السيرفر فتح المجلد في مستكشف الملفات
  if (StoreFS.mode === 'server') {
    try {
      const r = await fetch('/api/fs/open', { method: 'POST', cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (j && j.ok) {
        try { tip('📂 اتفتح مجلد التخزين على الجهاز'); } catch (_) {}
        return true;
      }
      await uiAlert('ما قدرتش أفتح المجلد من السيرفر.\n' + (j && j.error ? j.error : ''));
      return false;
    } catch (e) {
      await uiAlert('السيرفر مش متاح.\nشغّل START_SERVER.bat ثم حاول تاني.');
      return false;
    }
  }
  // 2) مجلد File System Access: نعيد اختيار/فتح نافذة المجلد (المتصفح يفتح منتقي الجهاز)
  if (StoreFS.supportsFolder()) {
    try {
      // لو عندنا handle محفوظ نطلب الإذن ونفتح المنتقي على نفس المكان تقريباً
      if (StoreFS.handle && typeof StoreFS.handle.requestPermission === 'function') {
        try { await StoreFS.handle.requestPermission({ mode: 'readwrite' }); } catch (_) {}
      }
      const dir = await window.showDirectoryPicker({
        id: 'hawa-project-store',
        mode: 'readwrite',
        startIn: StoreFS.handle || 'documents'
      });
      // لو اختار نفس المجلد أو جديد — ثبّته واعرض محتواه
      const same = StoreFS.handle && StoreFS.handle.name === dir.name;
      if (!same) {
        const fromName = StoreFS.handle ? ('مجلد «' + (StoreFS.handle.name || '') + '»') : 'التخزين الحالي';
        const ui = showTransferProgress(fromName, dir.name || 'المجلد');
        try {
          ui.setStep('جاري الربط بالمجلد…');
          const data = StoreFS.snapshot();
          StoreFS.handle = dir;
          await StoreFS._idbSet('dir', dir);
          StoreFS.mode = 'folder';
          StoreFS.label = 'مجلد: ' + (dir.name || 'جهاز');
          ui.setStep('جاري حفظ المشروع في «' + (dir.name || '') + '»…');
          await StoreFS.writeFolder(data);
          ui.done(true, 'تم الربط بـ «' + (dir.name || '') + '»');
        } catch (err) {
          ui.done(false, 'فشل: ' + (err && err.message || err));
        }
      } else {
        StoreFS.handle = dir;
        try { tip('📂 مجلد «' + (dir.name || '') + '»'); } catch (_) {}
      }
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      await uiAlert('تعذر فتح مجلد من الجهاز:\n' + (e.message || e));
      return false;
    }
  }
  await uiAlert('المتصفح ده مش بيدعم فتح مجلدات مباشرة.\nعلى الموبايل استخدم تحميل/رفع ZIP، أو شغّل السيرفر على الكمبيوتر.');
  return false;
}

/** يظهر زر «تفعيل التخزين» في شريط الموبايل فقط لما المجلد محفوظ والإذن مش مفعّل */
function updStorageActBtn() {
  try {
    const btn = document.getElementById('mStorageAct');
    if (!btn) return;
    const mob = (typeof MOB !== 'undefined' && MOB.on) || (typeof isMobileLike === 'function' && isMobileLike());
    if (!mob) { btn.hidden = true; return; }
    // يظهر لو: في مجلد محفوظ بس مش متفعل، أو مفيش مجلد أصلاً والمتصفح يدعم الاختيار
    const folderActive = StoreFS.mode === 'folder' || StoreFS.mode === 'server';
    const hasHandleSleeping = !!(StoreFS.handle && !folderActive);
    const canPick = !StoreFS.handle && typeof StoreFS.supportsFolder === 'function' && StoreFS.supportsFolder();
    btn.hidden = !(hasHandleSleeping || canPick);
    if (!btn.hidden) {
      const label = btn.querySelector('i');
      if (label) label.textContent = hasHandleSleeping ? 'تفعيل التخزين' : 'اختيار التخزين';
    }
  } catch (_) {}
}
function showStorageInfo() {
  const modal = document.getElementById('storageModal');
  const body = document.getElementById('storageBody');
  if (!modal || !body) return;
  let raw = '';
  try { raw = localStorage.getItem('hawa2') || ''; } catch (_) {}
  let bytes = 0;
  try { bytes = new Blob([raw]).size; } catch (_) { bytes = (raw && raw.length) || 0; }
  const kb = (bytes / 1024).toFixed(1);
  const objs = S.objs.length;
  const scripts = S.scripts.length;
  const sdefs = S.sdefs.length;
  const mediaN = Object.keys(S.media || {}).length;
  const folderOk = StoreFS.supportsFolder();
  const hasFolder = StoreFS.isFolderLike();
  const isSrv = StoreFS.mode === 'server';
  const isMob = (typeof isMobileLike === 'function') ? isMobileLike()
    : /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const folderName = isSrv ? (StoreFS.serverDir || 'HawaEngineData/project')
    : (hasFolder ? (StoreFS.handle && StoreFS.handle.name) || 'مجلد'
      : (isMob || StoreFS.mode === 'local' ? 'متصفح (دائم)' : '— لم يحدد —'));
  const canPick = folderOk;
  const modeTxt = isSrv
    ? 'تلقائي على الجهاز (من غير برميشن)'
    : (hasFolder ? 'مجلد على الجهاز — مربوط'
      : (StoreFS.handle ? 'مجلد محفوظ — بيتفعل مع أول لمسة' : 'متصفح (أو اختر مجلد مرة واحدة)'));
  const statusOk = isSrv || hasFolder || StoreFS.mode === 'local';
  body.innerHTML = `
    <div class="st-row"><span>وضع التخزين</span><b id="stMode">${modeTxt}</b></div>
    <div class="st-row"><span>المكان</span><b id="stLabel">${folderName}</b></div>
    <div class="st-row"><span>الحالة</span><b style="color:#7ff0dc">${statusOk ? '✔ شغال' : '—'}</b></div>
    <div class="st-row"><span>كائنات / برمجة / برمجي / وسائط</span><b>${objs} / ${scripts} / ${sdefs} / ${mediaN}</b></div>
    <div class="mut small" style="margin-top:8px;line-height:1.5">${canPick
      ? 'اختار مجلد مرة واحدة (موبايل أو كمبيوتر). بعد كده أول لمسة بعد الريفرش بترجّع الربط تلقائي من غير زر تفعيل.'
      : 'المتصفح ده مش بيدعم اختيار مجلد — الحفظ داخل المتصفح دائم.'}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
      ${StoreFS.legacy ? '<button type="button" id="stLegacy" class="go" style="flex:1;min-height:40px">استيراد من المجلد القديم</button>' : ''}
      ${canPick ? `<button type="button" id="stPick" class="go" style="flex:1;min-height:40px">${hasFolder || StoreFS.handle ? 'تغيير مجلد التخزين' : 'تحديد مجلد التخزين مرة واحدة'}</button>` : ''}
      ${!isMob && (hasFolder || isSrv) ? '<button type="button" id="stReveal" class="go" style="flex:1;min-height:40px">📂 فتح مجلد التخزين على الجهاز</button>' : ''}
    </div>
    <div id="stListing" class="mut small" style="margin-top:10px;max-height:180px;overflow:auto;line-height:1.65"></div>
    `;
  modal.hidden = false;
  const act = document.getElementById('stActivate');
  if (act) act.onclick = async () => {
    act.disabled = true;
    const ok = await StoreFS.activatePermission();
    act.disabled = false;
    if (ok) {
      try {
        const d2 = await StoreFS.loadPreferred();
        if (d2) loadData(d2, false);
      } catch (_) {}
      try { tip('✔ تم تفعيل المجلد'); } catch (_) {}
      showStorageInfo();
    } else {
      await uiAlert('فشل التفعيل. جرّب «تحديد مكان التخزين».');
    }
  };
  const legBtn = document.getElementById('stLegacy');
  if (legBtn) legBtn.onclick = async () => {
    legBtn.disabled = true;
    const fromName = 'المجلد القديم';
    const toName = StoreFS.mode === 'server' ? (StoreFS.serverDir || 'التخزين التلقائي') : 'التخزين الحالي';
    const ui = showTransferProgress(fromName, toName);
    ui.setStep('جاري قراءة المجلد القديم…');
    const d = await StoreFS.readFromLegacy();
    legBtn.disabled = false;
    if (d) {
      try {
        ui.setStep('جاري النقل إلى «' + toName + '»…');
        loadData(d, false);
        await StoreFS.saveAll();
        StoreFS.legacy = null;
        ui.done(true, 'تم النقل من المجلد القديم');
        tip('✔ اتنقل المشروع القديم للتخزين التلقائي');
      } catch (e) {
        console.warn(e);
        ui.done(false, 'فشل النقل');
      }
      showStorageInfo();
    } else {
      ui.done(false, 'معرفتش أقرا المجلد القديم');
      await uiAlert('معرفتش أقرا المجلد القديم (الإذن اترفض أو المشروع فاضي).');
    }
  };
  const pick = document.getElementById('stPick');
  const reveal = document.getElementById('stReveal');
  if (pick) pick.onclick = async () => {
    pick.disabled = true;
    const ok = await StoreFS.pickAndMigrate();
    pick.disabled = false;
    if (ok) {
      try { tip('✔ تم تثبيت/تغيير مكان التخزين'); } catch (_) {}
      showStorageInfo();
    }
  };
  if (reveal) reveal.onclick = async () => {
    const box = document.getElementById('stListing');
    reveal.disabled = true;
    try {
      // افتح المجلد فعلياً على الجهاز (سيرفر أو منتقي الملفات)
      await openStorageFolderOnDevice();
      // واعرض المحتوى جوه النافذة كمان
      if (box) {
        if (StoreFS.mode === 'server') {
          box.textContent = 'جاري قراءة مجلد السيرفر…';
          try {
            const r = await fetch('/api/fs/list?path=', { cache: 'no-store' });
            const j = await r.json();
            if (j && j.ok && Array.isArray(j.items)) {
              const lines = j.items.map(it =>
                (it.kind === 'directory' ? '📁 ' : '📄 ') + it.name +
                (it.size ? ' (' + Math.max(1, Math.round(it.size / 1024)) + ' KB)' : '')
              );
              box.innerHTML = '<b>محتوى التخزين التلقائي:</b><br>' + (lines.join('<br>') || 'فارغ');
            } else {
              box.textContent = 'المجلد فاضي أو مش متاح.';
            }
          } catch (e) {
            box.textContent = 'تعذر قراءة المجلد: ' + (e.message || e);
          }
        } else if (StoreFS.handle) {
          box.textContent = 'جاري قراءة المجلد…';
          try {
            const listing = await StoreFS.listFolderTree();
            box.innerHTML = '<b>محتوى «' + (StoreFS.handle.name || '') + '»:</b><br>' + listing;
          } catch (e) {
            box.textContent = 'تعذر قراءة المجلد: ' + (e.message || e);
          }
        } else {
          box.textContent = 'مفيش مجلد مربوط بعد — استخدم «تحديد مكان التخزين».';
        }
      }
    } finally {
      reveal.disabled = false;
    }
  };
}

const _bSave = $('#bSave');
if (_bSave) _bSave.onclick = () => { save(); try { tip('✔ اتسجل في المتصفح'); } catch (_) {} };
const _bProjDown = document.getElementById('bProjDown');
if (_bProjDown) _bProjDown.onclick = () => { downloadProjectZip().catch(e => { uiAlert(e.message || e); }); };
const _bProjUp = document.getElementById('bProjUp');
const _flProj = document.getElementById('flProj');
if (_bProjUp && _flProj) {
  _bProjUp.onclick = () => { _flProj.value = ''; _flProj.click(); };
  _flProj.onchange = async e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (f) await uploadProjectZip(f);
  };
}
const _bWipe = document.getElementById('bWipe');
if (_bWipe) _bWipe.onclick = () => wipeProjectTotal();
const _bPlayNet = document.getElementById('bPlayNet');
if (_bPlayNet) _bPlayNet.onclick = () => { try { onPlayNetBtn(); } catch (e) { console.warn(e); } };
const _bStorage = document.getElementById('bStorage');
if (_bStorage) _bStorage.onclick = () => showStorageInfo();
const _storageClose = document.getElementById('storageClose');
if (_storageClose) _storageClose.onclick = () => { const m = document.getElementById('storageModal'); if (m) m.hidden = true; };
const _storageModal = document.getElementById('storageModal');
if (_storageModal) _storageModal.addEventListener('click', e => { if (e.target === _storageModal) _storageModal.hidden = true; });

/* قائمة «المزيد» في الشريط: fixed فوق كل شيء + إغلاق عند اختيار/برّه */
(function setupBarMenu() {
  const menu = document.getElementById('barMenu');
  if (!menu) return;
  const pop = menu.querySelector('.menu-pop');
  const summary = menu.querySelector('summary');

  function placePop() {
    if (!pop || !menu.open) return;
    const r = (summary || menu).getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.top = Math.round(r.bottom + 8) + 'px';
    const right = Math.max(8, window.innerWidth - r.right);
    pop.style.left = 'auto';
    pop.style.right = right + 'px';
    pop.style.insetInlineEnd = right + 'px';
    pop.style.insetInlineStart = 'auto';
    pop.style.zIndex = '100000';
    pop.style.minWidth = '220px';
  }
  function clearPopPos() {
    if (!pop) return;
    pop.style.position = '';
    pop.style.top = '';
    pop.style.left = '';
    pop.style.right = '';
    pop.style.insetInlineEnd = '';
    pop.style.insetInlineStart = '';
    pop.style.zIndex = '';
  }
  function closeMenu() {
    try { menu.open = false; menu.removeAttribute('open'); } catch (_) {}
    clearPopPos();
  }

  menu.addEventListener('toggle', () => {
    if (menu.open) {
      placePop();
      requestAnimationFrame(placePop);
    } else {
      clearPopPos();
    }
  });
  window.addEventListener('resize', () => { if (menu.open) placePop(); });
  window.addEventListener('scroll', () => { if (menu.open) placePop(); }, true);

  if (pop) {
    pop.addEventListener('click', e => {
      const btn = e.target && e.target.closest && e.target.closest('button');
      if (btn) setTimeout(closeMenu, 0);
    });
  }
  document.addEventListener('click', e => {
    if (!menu.open) return;
    if (menu.contains(e.target) || (pop && pop.contains(e.target))) return;
    closeMenu();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.open) closeMenu();
  });
})();

$('#fl').onchange = async e => {
  const m = e.target.dataset.m;
  for (const f of e.target.files) {
    const name = (f.name || '').toLowerCase();
    if (name.endsWith('.zip')) { await uploadProjectZip(f); continue; }
    const text = await f.text();
    if (m === 'js') { S.scripts.push({id: S.sid++, name: f.name, code: text, enabled: true, p: {}}); pList(); }
    else if (m === 'sobj') { const d = {id: S.did++, name: f.name.replace(/\.[^.]+$/, ''), code: text, p: {}}; S.sdefs.push(d); sList(); }
    else {
      try {
        const data = JSON.parse(text);
        if (S.playNet === 'online' || S.playNet === 'offline') {
          const ok = await confirmPlayNetMismatch(data, S.playNet);
          if (!ok) { tip('تم إلغاء الرفع'); continue; }
        }
        loadData(data, false);
        const pn = detectPlayNet(data);
        if (pn === 'online' || pn === 'offline') {
          tip('✔ تم تحميل المشروع · الوضع: ' + (pn === 'online' ? 'أونلاين' : 'أوفلاين'));
        }
      } catch (x) { await uiAlert('ملف غير صالح'); }
    }
  }
  e.target.value = ''; chg();
};

function dl(n, t, m) {
  const blob = new Blob([t], { type: (m || 'text/plain') + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  // موبايل: جرّب Web Share ثم التحميل العادي
  const mob = (typeof isMobileLike === 'function') ? isMobileLike()
    : (typeof MOB !== 'undefined' && MOB.on);
  if (mob && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], n, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: n }).catch(() => {
          const a = document.createElement('a'); a.href = url; a.download = n; a.click();
        });
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        return;
      }
    } catch (_) {}
  }
  const a = document.createElement('a');
  a.href = url; a.download = n;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { try { a.remove(); URL.revokeObjectURL(url); } catch (_) {} }, 2500);
}

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
  if (!file) return '';
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

function resolveAutoCtxFile(sec) {
  const section = sec || (S.mode === 'play' ? 'play' : S.section);
  
  if (section === 'objects' || section === 'play') return 'auto_story_level.txt';
  if (section !== 'prog' && section !== 'sobj') return '';

  try { if (typeof MOB !== 'undefined' && MOB.detect) MOB.detect(); } catch (_) {}
  const mobile = !!(typeof MOB !== 'undefined' && MOB.on)
    || (typeof isMobileLike === 'function' && isMobileLike());
  const device = mobile ? 'PHONE' : 'PC';
  const kind = section === 'sobj' ? 'PROBJ' : 'PROG';
  
  const sync = S.playNet === 'online' ? '_SYNC' : '';
  
  return `AUTO_${device}_${kind}${sync}.txt`;
}

function autoText(extraCtx) {
  const sec = S.mode === 'play' ? 'play' : S.section;
  const names = { play: 'play', prog: 'prog', sobj: 'sobj', objects: 'objects' };
  const sm = o => `id=${o.id} name=${o.name} type=${o.type} pos=[${o.pos.map(v => +v.toFixed(2))}] rot=[${o.rot.map(v => +v.toFixed(1))}] scl=[${o.scl.map(v => +v.toFixed(2))}] color=${o.color}${o.hidden ? ' hidden' : ''}${o.scripts && o.scripts.length ? ' scripts=' + o.scripts.join(',') : ''}`;
  const mobile = !!(typeof MOB !== 'undefined' && MOB.on);
  const netMode = S.playNet === 'online' ? 'online' : (S.playNet === 'offline' ? 'offline' : 'unset');
  let t = `HAWA_AUTO\nsec=${names[sec] || sec}\nmobile=${mobile ? '1' : '0'}\ndevice=${mobile ? 'mobile' : 'desktop'}\nplayNet=${netMode}\n${playerNote()}\n`;
  t += API + '\n\n';

  
  if (netMode === 'offline') {
    t += `=== PROJECT_MODE_OFFLINE (إلزامي) ===
المشروع أوفلاين — لعب محلي فقط.
1) ممنوع أنظمة مزامنة لاعبين / NetMP / getRemotePlayers / setShared للشبكة / peer.
2) ممنوع نقاط online_spawn أو منطق سلوتات أونلاين.
3) ابنِ الميكانيكس للاعب المحلي الواحد فقط.
4) التلقائي يركّز على تجربة محلية (موبايل + كومبيوتر) بدون شبكة.

`;
  } else if (netMode === 'online') {
    t += `=== PROJECT_MODE_ONLINE (إلزامي) ===
المشروع أونلاين — نفس منطق الأوفلاين المحلي + مزامنة بين اللاعبين.
1) ابنِ أولاً منطق محلي صحيح، ثم أضف المزامنة (setShared / syncObject / NetMP / getRemotePlayers).
2) RULE: لو اللاعب المحلي شايفه، كل لاعب أونلاين لازم يشوفه.
3) نقاط online_spawn متاحة (حد 8). استخدمها عند الحاجة فقط.
4) التلقائي يدعم موبايل + كومبيوتر مع الشبكة.

`;
  }

  
  if (sec === 'prog' || sec === 'sobj' || sec === 'objects') {
    t += `=== NO_FIXED_SHAPE_TEMPLATES (إلزامي — أعلى أولوية بعد طلب المستخدم) ===
1) ممنوع تكرار نفس الشكل/الأبعاد/الألوان بين طلبات مختلفة (سفينة، مركبة، وحش، سلاح…).
2) كل كائن يُبنى من الصفر حسب وصف المستخدم — فكّر في تصميم فريد: نسب، أجزاء، خامات، ألوان، تفاصيل.
3) أمثلة الكود في السياق = مرجع API فقط (Game.onUpdate، defineParams، customDrive…) — ليست قوالب شكل للنسخ.
4) ممنوع نسخ مجسمات أمثلة (توك توك/صندوق/أسطوانة بنفس الترتيب) إلا لو المستخدم طلب نفس الشكل صراحة.
5) التنوع مطلوب: لو الطلب عام («وحوش شرير») اختر تفسيرًا بصريًا مميزًا وغير مكرر.
6) التزم بطلب المستخدم حرفيًا في الوظيفة والميكانيكس؛ الشكل البصري حر وإبداعي ضمن الطلب.
7) لا تذكر «قالب» ولا تعتمد على شكل افتراضي محفوظ في رأسك من رسائل سابقة.

`;
  }

  
  if (extraCtx) {
    t += `\n===== CONTEXT_FILE_BEGIN =====\n${extraCtx}\n===== CONTEXT_FILE_END =====\n\n`;
  }

  
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
    try {
      // تأكد من كشف الموبايل قبل اختيار ملف التلقائي
      try { if (typeof MOB !== 'undefined' && MOB.detect) MOB.detect(); } catch (_) {}
      if (forceSec) S.section = forceSec;
      const sec = S.mode === 'play' ? 'play' : S.section;
      const file = resolveAutoCtxFile(sec);
      let ctx = '';
      if (file) {
        ctx = await loadAutoCtx(file);
        if (!ctx && (sec === 'prog' || sec === 'sobj')) {
          // احتياطي: ملف الكائنات البرمجية العام
          ctx = await loadAutoCtx('auto_scripted_object.txt');
        }
        // لو ملف الموبايل فاضي — جرّب نسخة PC كمرجع
        if (!ctx && file.indexOf('PHONE') >= 0) {
          ctx = await loadAutoCtx(file.replace('PHONE', 'PC'));
        }
      }
      const { sec: s2, t } = autoText(ctx);
      const mobile = !!(typeof MOB !== 'undefined' && MOB.on) || (typeof isMobileLike === 'function' && isMobileLike());
      const net = S.playNet === 'online' ? 'online' : (S.playNet === 'offline' ? 'offline' : 'unset');
      const tag = (mobile ? 'phone' : 'pc') + '-' + net;
      const outName = file
        ? file.replace(/\.txt$/i, '') + '-export.txt'
        : ('hawa-auto-' + s2 + '-' + tag + '.txt');
      dl(outName, t);
      try { tip('✔ تلقائي · ' + (file || s2) + (mobile ? ' · موبايل' : ' · PC')); } catch (_) {}
    } catch (e) {
      console.warn('auto', e);
      try { tip('⚠ فشل التلقائي: ' + (e.message || e)); } catch (_) {}
    }
  };
  
  const pA = $('#pAuto'), sA = $('#sAuto');
  if (pA) pA.onclick = () => { run('prog'); };
  if (sA) sA.onclick = () => { run('sobj'); };
})();

function isMobileLike() {
  try {
    if (document.body && document.body.classList.contains('is-mobile')) return true;
  } catch (_) {}
  try {
    return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900);
  } catch (_) { return false; }
}
async function lockLandscapeIfMobile() {
  if (!isMobileLike()) return;
  try {
    const o = screen.orientation || screen.mozOrientation || screen.msOrientation;
    if (o && typeof o.lock === 'function') {
      // جرّب landscape ثم any landscape
      try { await o.lock('landscape'); return; } catch (_) {}
      try { await o.lock('landscape-primary'); return; } catch (_) {}
      try { await o.lock('landscape-secondary'); } catch (_) {}
    }
  } catch (_) {}
}
function unlockOrientation() {
  try {
    const o = screen.orientation || screen.mozOrientation || screen.msOrientation;
    if (o && typeof o.unlock === 'function') o.unlock();
  } catch (_) {}
}
function toggleFullscreen() {
  try {
    const el = document.documentElement;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFs) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      const p = req ? req.call(el, { navigationUI: 'hide' }) : null;
      Promise.resolve(p).then(() => {
        // على الموبايل: أفقي (ويس) عشان الشاشة متبقاش مقصوصة/أكبر من مساحتها
        lockLandscapeIfMobile();
        try { setTimeout(() => { try { resize(); } catch (_) {} }, 120); } catch (_) {}
      }).catch(() => {});
    } else {
      const ex = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (ex) {
        Promise.resolve(ex.call(document)).then(() => {
          unlockOrientation();
          try { setTimeout(() => { try { resize(); } catch (_) {} }, 120); } catch (_) {}
        }).catch(() => {});
      }
    }
  } catch (e) { console.warn(e); }
}
function syncFullscreenBtn() {
  const b = document.getElementById('bFullscreen');
  if (!b) return;
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  b.classList.toggle('on', on);
  b.title = on ? 'خروج من ملء الشاشة' : 'ملء الشاشة';
  if (on && isMobileLike()) lockLandscapeIfMobile();
  if (!on) unlockOrientation();
  try { setTimeout(() => { try { resize(); } catch (_) {} }, 80); } catch (_) {}
}
(function bindFullscreen() {
  const b = document.getElementById('bFullscreen');
  if (b) b.onclick = () => toggleFullscreen();
  document.addEventListener('fullscreenchange', syncFullscreenBtn);
  document.addEventListener('webkitfullscreenchange', syncFullscreenBtn);
})();

const PLAYER_DEF = {
  style: 'suit',                  
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
      .then(j => { if (window.__HAWA_PLAYER_LOCKED) return; if (j && typeof j === 'object') { Object.assign(PCFG, j); if (RT && RT.rig) rebuildLocalRig(); } })
      .catch(() => {});
  } catch (e) {}
}
function rebuildLocalRig() {   
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

const PSC = 1.2; let RIDE_SC = .9;   

const THIGH_HALF = .09, SOLE_H = .06;   
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
  const seatToOrigin = d.pelvisY + d.hipJointY - THIGH_HALF;   
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
function faceNoise() {          
  if (_NOISE) return _NOISE;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 150 + (Math.random() - .5) * 70; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  _NOISE = new T.CanvasTexture(c); _NOISE.wrapS = _NOISE.wrapT = T.RepeatWrapping; _NOISE.repeat.set(3, 3);
  return _NOISE;
}

function onlinePlayMeta() {
  try {
    if (!window.HAWA_PLAY_ONLY) return null;
    const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null');
    return (m && m.mode === 'online') ? m : null;
  } catch (_) { return null; }
}

const VOICE_DEF = {
  enabled: true,
  sensitivity: 0.008,      
  maxMouth: 1.35,          
  headShake: 0.32,         
  headShakeEnabled: true,
  nodSpeed: 7.2,           
  nodAmount: 0.38,         
  smoothing: 0.42,         
  highpass: 85,
  lowpass: 7500,
  noiseGate: 0.005,
  shape: 'cartoon',        
  gain: 2.1                
};
const VOICE_CFG = Object.assign({}, VOICE_DEF);

const VoiceChat = {
  on: false,
  level: 0,          
  raw: 0,
  stream: null,
  ac: null,
  analyser: null,
  data: null,
  src: null,
  filters: null,
  _btn: null,
  _remoteAudios: new Map(),  // peerId -> { el, stream, slot, name, username, volume, muted, gain, panner }
  _bySlot: new Map(),        // slot -> peerId
  _byName: new Map(),        // lowercase name -> peerId
  _mediaCalls: new Map(), 
  _inCalls: new Map(),    
  _lanTracks: new Map(),
  _wantOn: false,
  spatial: false,            // صوت مكاني مرتبط بموقع الشخصية

  ensureBtn() {
    let b = document.getElementById('pMic');
    if (!b) {
      b = document.createElement('button');
      b.id = 'pMic'; b.type = 'button'; b.title = 'المايك';
      b.innerHTML = '<span class="mic-ico" aria-hidden="true"><svg class="r" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><line x1="4" y1="4" x2="20" y2="20"/></svg><svg class="g" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span><span class="mic-lbl">مايك</span><span class="mic-bar"><i></i></span>';
      const bar = document.getElementById('pOnlineBar');
      const play = document.getElementById('play');
      if (bar) { b.classList.add('online-compact'); bar.appendChild(b); }
      else if (play) play.appendChild(b);
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
    if (lbl) { const t = this.on ? 'مفتوح' : 'مكتوم'; if (lbl.textContent !== t) lbl.textContent = t; }
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
      say('تم تفعيل المايك', 1800);
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
    try { say('تم إلغاء المايك', 1600); } catch(_){} this.on = false;
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
    let m = this.level * (+VOICE_CFG.maxMouth || 1.2);
    m = Math.min(1.5, m);
    if (VOICE_CFG.shape === 'cartoon') m = Math.pow(m, 0.65) * 1.05;
    return Math.min(1, m);
  },
  headShakeAmount() {
    if (!VOICE_CFG.enabled || !VOICE_CFG.headShakeEnabled || !this.on) return 0;
    return this.level * (+VOICE_CFG.headShake || 0.045);
  },

  _collectPcs() {
    const pcs = [];
    const seen = new Set();
    const pushPc = (id, pc) => {
      if (!pc || seen.has(pc)) return;
      seen.add(pc);
      pcs.push({ id: String(id), pc });
    };
    try {
      const live = (NetMP && NetMP._codesNet) || (typeof window !== 'undefined' && window.__HAWA_LIVE_NET__);
      if (live) {
        if (typeof live.forEachChannel === 'function') {
          live.forEachChannel((e, s) => { if (e && e.pc) pushPc('s' + (e.slot != null ? e.slot : s), e.pc); });
        }
        if (live._pc) pushPc('guest', live._pc);
        if (live.bySlot && typeof live.bySlot.forEach === 'function') {
          live.bySlot.forEach((e, s) => { if (e && e.pc) pushPc('slot' + s, e.pc); });
        }
      }
    } catch (_) {}
    try {
      if (NetMP && NetMP._dcMap) {
        for (const [id, e] of NetMP._dcMap) if (e && e.pc) pushPc(id, e.pc);
      }
    } catch (_) {}
    return pcs;
  },
  /** استقبال الصوت فقط — يشتغل من غير ما تفتح مايك */
  _ensureListenAll() {
    const pcs = this._collectPcs();
    for (const { id, pc } of pcs) {
      try {
        if (!pc.__hawaVoiceOnTrack) {
          pc.__hawaVoiceOnTrack = true;
          pc.addEventListener('track', (ev) => {
            try {
              if (ev.track && ev.track.kind === 'audio') {
                const stream = (ev.streams && ev.streams[0]) || new MediaStream([ev.track]);
                this._playRemote(id, stream);
              }
            } catch (_) {}
          });
        }
        try {
          const recs = pc.getReceivers ? pc.getReceivers() : [];
          for (const r of recs) {
            if (r.track && r.track.kind === 'audio' && r.track.readyState !== 'ended') {
              this._playRemote(id, new MediaStream([r.track]));
            }
          }
        } catch (_) {}
      } catch (e) { console.warn('ensure listen', id, e); }
    }
  },
  _startListenLoop() {
    if (this._listenLoop) return;
    this._ensureListenAll();
    let n = 0;
    this._listenLoop = setInterval(() => {
      n++;
      try { this._ensureListenAll(); } catch (_) {}
      // بعد دقيقتين خفّف التكرار
      if (n > 60 && this._listenLoop) {
        clearInterval(this._listenLoop);
        this._listenLoop = setInterval(() => { try { this._ensureListenAll(); } catch (_) {} }, 3000);
      }
    }, 700);
  },
  _shareStream() {
    // الاستماع دائماً (حتى بدون مايك)
    try { this._startListenLoop(); } catch (_) {}
    if (!this.stream || !NetMP || !NetMP.on) return;
    if (NetMP.transport === 'peerjs' && NetMP.peer) {
      for (const [pid] of NetMP.conns) this._callPeer(pid);
    }
    if (NetMP.transport === 'lan' && NetMP._dcMap) {
      for (const [pid, entry] of NetMP._dcMap) this._addLanTrack(pid, entry);
    }
    try { this._attachCodesAudio(); } catch (e) { console.warn('codes audio', e); }
    if (!this._codesRetry) {
      this._codesRetry = 0;
      const retry = () => {
        if (!this.on || !this.stream) { this._codesRetry = 0; return; }
        this._codesRetry++;
        try { this._attachCodesAudio(); } catch (_) {}
        if (this._codesRetry < 12) setTimeout(retry, 800);
        else this._codesRetry = 0;
      };
      setTimeout(retry, 600);
    }
  },
  _attachCodesAudio() {
    // إرسال فقط — الاستماع في _ensureListenAll
    try { this._ensureListenAll(); } catch (_) {}
    if (!this.stream) return;
    const track = this.stream.getAudioTracks()[0];
    if (!track || track.readyState === 'ended') return;
    const pcs = this._collectPcs();
    for (const { id, pc } of pcs) {
      try {
        try {
          if (pc.getTransceivers) {
            for (const tr of pc.getTransceivers()) {
              try {
                if (tr.receiver && tr.receiver.track && tr.receiver.track.kind === 'audio') {
                  if (tr.direction === 'recvonly' || tr.direction === 'inactive') tr.direction = 'sendrecv';
                }
              } catch (_) {}
            }
          }
        } catch (_) {}

        const senders = pc.getSenders ? pc.getSenders() : [];
        let audioSender = senders.find(s => s.track && s.track.kind === 'audio');
        if (!audioSender) audioSender = senders.find(s => !s.track);
        if (!audioSender && pc.getTransceivers) {
          const tr = pc.getTransceivers().find(t => t.sender && (
            (t.receiver && t.receiver.track && t.receiver.track.kind === 'audio') ||
            (t.sender.track && t.sender.track.kind === 'audio') ||
            !t.sender.track
          ));
          if (tr && tr.sender) audioSender = tr.sender;
        }

        const key = 'codes_' + id;
        const already = this._lanTracks.get(key);
        if (already && already.track === track) {
          // already sending
        } else if (audioSender && typeof audioSender.replaceTrack === 'function') {
          audioSender.replaceTrack(track).catch(() => {
            try { pc.addTrack(track, this.stream); } catch (_) {}
          });
          this._lanTracks.set(key, audioSender);
        } else {
          try {
            const s = pc.addTrack(track, this.stream);
            this._lanTracks.set(key, s || track);
          } catch (e) {
            this._lanTracks.set(key, audioSender || track);
          }
        }
      } catch (e) { console.warn('attach codes audio', id, e); }
    }
  },
  _stopSharing() {
    for (const [, call] of this._mediaCalls) { try { call.close(); } catch (_) {} }
    this._mediaCalls.clear();
    // لا توقف مسار المايك المحلي — فقط افصل الإرسال عن الـ PeerConnections
    for (const [, sender] of this._lanTracks) {
      try {
        if (sender && typeof sender.replaceTrack === 'function') sender.replaceTrack(null);
      } catch (_) {}
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
      // الرد بمجرى المايك المحلي لو شغال → صوت ثنائي الاتجاه
      call.answer(this.stream || undefined);
      const old = this._inCalls.get(pid);
      this._inCalls.set(pid, call);
      if (old && old !== call) { try { old.close(); } catch (_) {} }
      call.on('stream', remote => this._playRemote(pid, remote));
      call.on('close', () => { if (this._inCalls.get(pid) === call) { this._inCalls.delete(pid); this._stopRemote(pid); } });
      call.on('error', () => {});
      // لو المايك اتفعّل بعد الرد: PeerJS لا يدعم replace بسهولة — أعد الاتصال الصوتي
      if (!this.stream) {
        const waitMic = setInterval(() => {
          if (!this._inCalls.has(pid) || this._inCalls.get(pid) !== call) { clearInterval(waitMic); return; }
          if (this.stream) {
            clearInterval(waitMic);
            try {
              // أغلق الرد القديم وابدأ نداء صادر بمجرى المايك
              try { call.close(); } catch (_) {}
              this._inCalls.delete(pid);
              this._mediaCalls.delete(pid);
              this._callPeer(pid);
            } catch (_) {}
          }
        }, 500);
        setTimeout(() => clearInterval(waitMic), 20000);
      }
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
  // ربط peerId → معلومات اللاعب (سلوت / اسم / شخصية)
  _resolvePlayer(peerId) {
    const out = { peerId, slot: null, name: null, username: null };
    try {
      if (typeof NetMP !== 'undefined' && NetMP.remotes) {
        for (const r of NetMP.remotes.values()) {
          if (r && r.peerId === peerId) {
            out.slot = r.slot;
            out.name = r.name || ('لاعب ' + r.slot);
            out.username = out.name;
            return out;
          }
        }
      }
    } catch (_) {}
    try {
      if (typeof NetMP !== 'undefined' && NetMP.conns) {
        // peerId هو المفتاح في conns أحياناً
      }
    } catch (_) {}
    return out;
  },
  _bindMeta(peerId, entry) {
    const info = this._resolvePlayer(peerId);
    entry.peerId = peerId;
    entry.slot = info.slot;
    entry.name = info.name;
    entry.username = info.username || info.name;
    // فهرس بالسلوت والاسم عشان السكربتات
    if (info.slot != null) this._bySlot.set(+info.slot, peerId);
    if (info.name) this._byName.set(String(info.name).toLowerCase(), peerId);
    return entry;
  },
  _playRemote(peerId, stream) {
    // لو نفس الـ stream شغال متوقفش/تعيدش عشان متقطعش الصوت
    const prev = this._remoteAudios.get(peerId);
    if (prev && prev.el && prev.el.srcObject === stream) {
      try { prev.el.play().catch(() => {}); } catch (_) {}
      this._bindMeta(peerId, prev);
      return;
    }
    this._stopRemote(peerId);
    try {
      const a = new Audio();
      a.autoplay = true;
      a.playsInline = true;
      a.setAttribute('playsinline', '');
      a.setAttribute('autoplay', '');
      a.srcObject = stream;
      const vol = this._volFor(peerId);
      a.volume = this.muteAll ? 0 : vol;
      a.muted = !!this.muteAll;
      const go = () => a.play().catch(() => {});
      go();
      // فك قفل الصوت بأي لمسة/ضغطة — من غير ما تحتاج تفتح مايك
      if (!this._unlock) {
        this._unlock = () => {
          for (const x of this._remoteAudios.values()) {
            try {
              const el = x.el || x;
              el.muted = !!this.muteAll;
              el.play().catch(() => {});
            } catch (_) {}
          }
          try {
            if (this.ac && this.ac.state === 'suspended') this.ac.resume();
          } catch (_) {}
        };
        addEventListener('click', this._unlock, { passive: true });
        addEventListener('keydown', this._unlock, { passive: true });
        addEventListener('touchstart', this._unlock, { passive: true });
        addEventListener('pointerdown', this._unlock, { passive: true });
      }
      const entry = { el: a, stream, peerId, slot: null, name: null, username: null, volume: vol, muted: false, gain: null, panner: null };
      this._bindMeta(peerId, entry);
      // مسار Web Audio اختياري للتأثيرات المكانية / الفلاتر من السكربت
      try {
        if (!this.ac) {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ac = new AC();
        }
        if (this.ac && this.ac.state === 'suspended') this.ac.resume().catch(() => {});
        const srcNode = this.ac.createMediaStreamSource(stream);
        const gain = this.ac.createGain();
        gain.gain.value = this.muteAll || entry.muted ? 0 : vol;
        const panner = this.ac.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 2;
        panner.maxDistance = 60;
        panner.rolloffFactor = 1.2;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 360;
        srcNode.connect(gain);
        gain.connect(panner);
        // لو spatial مفعّل نستخدم panner، وإلا نفضل عنصر Audio العادي (أوضح على الموبايل)
        if (this.spatial) {
          panner.connect(this.ac.destination);
          a.muted = true; // نمنع مضاعفة الصوت
        }
        entry.gain = gain;
        entry.panner = panner;
        entry.srcNode = srcNode;
      } catch (_) {}
      this._remoteAudios.set(peerId, entry);
      setTimeout(go, 120);
      setTimeout(go, 600);
    } catch (_) {}
  },
  _volFor(peerId) {
    const e = this._remoteAudios.get(peerId);
    if (e && typeof e.volume === 'number') return Math.max(0, Math.min(1, e.volume));
    return 1;
  },
  _stopRemote(peerId) {
    const a = this._remoteAudios.get(peerId);
    if (a) {
      try {
        if (a.el) { a.el.pause(); a.el.srcObject = null; }
        else if (a.pause) { a.pause(); a.srcObject = null; }
      } catch (_) {}
      try {
        if (a.srcNode) a.srcNode.disconnect();
        if (a.gain) a.gain.disconnect();
        if (a.panner) a.panner.disconnect();
      } catch (_) {}
      if (a.slot != null) this._bySlot.delete(+a.slot);
      if (a.name) this._byName.delete(String(a.name).toLowerCase());
      this._remoteAudios.delete(peerId);
    }
  },
  onPeerConnected(peerId) {
    if (this.on && this.stream) {
      this._callPeer(peerId);
      try { this._attachCodesAudio(); } catch (_) {}
    }
  },
  // ——— API للاعبين / السكربتات ———
  /** يرجع قائمة كل أصوات اللاعبين البعيدين مع السلوت والاسم */
  listPlayers() {
    const out = [];
    for (const [pid, e] of this._remoteAudios) {
      this._bindMeta(pid, e);
      out.push({
        peerId: pid,
        slot: e.slot,
        name: e.name,
        username: e.username || e.name,
        volume: e.volume != null ? e.volume : 1,
        muted: !!e.muted,
        speaking: false
      });
    }
    return out;
  },
  /** يلاقي peerId من سلوت أو اسم لاعب أو peerId مباشرة */
  _findPeer(who) {
    if (who == null) return null;
    if (typeof who === 'number' || (/^\d+$/).test(String(who))) {
      const pid = this._bySlot.get(+who);
      if (pid) return pid;
      // محاولة من NetMP
      try {
        if (NetMP.remotes) {
          const r = NetMP.remotes.get(+who);
          if (r && r.peerId) return r.peerId;
        }
      } catch (_) {}
    }
    const key = String(who).toLowerCase();
    if (this._byName.has(key)) return this._byName.get(key);
    if (this._remoteAudios.has(who)) return who;
    // بحث بالاسم الجزئي
    for (const [pid, e] of this._remoteAudios) {
      if (e.name && String(e.name).toLowerCase() === key) return pid;
      if (e.username && String(e.username).toLowerCase() === key) return pid;
    }
    try {
      if (NetMP.remotes) {
        for (const r of NetMP.remotes.values()) {
          if (r && r.name && String(r.name).toLowerCase() === key && r.peerId) return r.peerId;
        }
      }
    } catch (_) {}
    return null;
  },
  getPlayer(who) {
    const pid = this._findPeer(who);
    if (!pid) return null;
    const e = this._remoteAudios.get(pid);
    if (!e) return null;
    this._bindMeta(pid, e);
    return {
      peerId: pid,
      slot: e.slot,
      name: e.name,
      username: e.username || e.name,
      volume: e.volume != null ? e.volume : 1,
      muted: !!e.muted
    };
  },
  setVolume(who, vol) {
    const pid = this._findPeer(who);
    if (!pid) return false;
    const e = this._remoteAudios.get(pid);
    if (!e) return false;
    vol = Math.max(0, Math.min(1, +vol));
    e.volume = vol;
    try {
      if (e.el) e.el.volume = this.muteAll || e.muted ? 0 : vol;
      if (e.gain) e.gain.gain.value = this.muteAll || e.muted ? 0 : vol;
    } catch (_) {}
    return true;
  },
  mutePlayer(who, on) {
    const pid = this._findPeer(who);
    if (!pid) return false;
    const e = this._remoteAudios.get(pid);
    if (!e) return false;
    e.muted = !!on;
    try {
      if (e.el) {
        e.el.muted = this.muteAll || e.muted;
        e.el.volume = this.muteAll || e.muted ? 0 : (e.volume != null ? e.volume : 1);
      }
      if (e.gain) e.gain.gain.value = this.muteAll || e.muted ? 0 : (e.volume != null ? e.volume : 1);
    } catch (_) {}
    return true;
  },
  setSpatial(on) {
    this.spatial = !!on;
    // إعادة توصيل المسارات حسب الحالة
    for (const [pid, e] of this._remoteAudios) {
      try {
        if (!e.panner || !e.gain) continue;
        e.panner.disconnect();
        e.gain.disconnect();
        e.gain.connect(e.panner);
        if (this.spatial) {
          e.panner.connect(this.ac.destination);
          if (e.el) e.el.muted = true;
        } else {
          if (e.el) {
            e.el.muted = this.muteAll || e.muted;
            e.el.volume = this.muteAll || e.muted ? 0 : (e.volume != null ? e.volume : 1);
            e.el.play().catch(() => {});
          }
        }
      } catch (_) {}
    }
    return this.spatial;
  },
  /** يحدّث مواقع الصوت المكاني من شخصيات اللاعبين البعيدين */
  tickSpatial() {
    if (!this.spatial || !this.ac) return;
    try {
      if (typeof RT !== 'undefined' && RT && RT.p && this.ac.listener) {
        const L = this.ac.listener;
        if (L.positionX) {
          L.positionX.value = RT.p.x;
          L.positionY.value = RT.p.y + 1.6;
          L.positionZ.value = RT.p.z;
        } else if (L.setPosition) {
          L.setPosition(RT.p.x, RT.p.y + 1.6, RT.p.z);
        }
      }
    } catch (_) {}
    for (const [pid, e] of this._remoteAudios) {
      if (!e.panner) continue;
      try {
        this._bindMeta(pid, e);
        let pos = null;
        if (e.slot != null && NetMP.remotes) {
          const r = NetMP.remotes.get(+e.slot);
          if (r && r.rig && r.rig.root) pos = r.rig.root.position;
          else if (r && r.tp) pos = r.tp;
        }
        if (!pos) continue;
        const P = e.panner;
        if (P.positionX) {
          P.positionX.value = pos.x;
          P.positionY.value = pos.y + 1.5;
          P.positionZ.value = pos.z;
        } else if (P.setPosition) {
          P.setPosition(pos.x, pos.y + 1.5, pos.z);
        }
      } catch (_) {}
    }
  },

    // ——— وصول مفتوح مالانهاية للسكربتات (أي فلتر / أي ظرف) ———
  /** MediaStream الخام لصوت لاعب بعيد (أو null) */
  getStream(who) {
    const pid = this._findPeer(who);
    if (!pid) return null;
    const e = this._remoteAudios.get(pid);
    return (e && (e.stream || (e.el && e.el.srcObject))) || null;
  },
  /** عنصر Audio الخام للاعب */
  getAudioElement(who) {
    const pid = this._findPeer(who);
    if (!pid) return null;
    const e = this._remoteAudios.get(pid);
    return (e && e.el) || null;
  },
  /** Web Audio nodes للاعب: { src, gain, panner, stream, peerId, slot, name } — عدّل بحرية */
  getNodes(who) {
    const pid = this._findPeer(who);
    if (!pid) return null;
    const e = this._remoteAudios.get(pid);
    if (!e) return null;
    this._bindMeta(pid, e);
    return {
      peerId: pid,
      slot: e.slot,
      name: e.name,
      username: e.username || e.name,
      stream: e.stream || (e.el && e.el.srcObject) || null,
      audio: e.el || null,
      src: e.srcNode || null,
      gain: e.gain || null,
      panner: e.panner || null,
      entry: e
    };
  },
  /** AudioContext المشترك (اعمل عليه أي Effect / Convolver / Biquad / ScriptProcessor) */
  getContext() {
    try {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ac = new AC();
      }
      if (this.ac.state === 'suspended') this.ac.resume().catch(() => {});
    } catch (_) {}
    return this.ac || null;
  },
  /** مجرى المايك المحلي الخام (للإرسال أو التحليل) */
  getLocalStream() { return this.stream || null; },
  /** كل الـ entries الداخلية (Map-like array) للتحكم الكامل */
  getAllEntries() {
    const out = [];
    for (const [pid, e] of this._remoteAudios) {
      this._bindMeta(pid, e);
      out.push({
        peerId: pid,
        slot: e.slot,
        name: e.name,
        username: e.username || e.name,
        stream: e.stream || (e.el && e.el.srcObject) || null,
        audio: e.el || null,
        src: e.srcNode || null,
        gain: e.gain || null,
        panner: e.panner || null,
        entry: e
      });
    }
    return out;
  },
  /** وصّل فلتر/عقده مخصصة على صوت لاعب — src → yourNode → gain → (panner) → destination
      fn(nodes, ac) يبني ويوصل؛ رجّع العقدة الأخيرة أو void */
  pipe(who, fn) {
    const nodes = this.getNodes(who);
    const ac = this.getContext();
    if (!nodes || !ac || typeof fn !== 'function') return null;
    try {
      return fn(nodes, ac) || nodes;
    } catch (e) {
      console.warn('VoiceChat.pipe', e);
      return null;
    }
  },
  muteAll: false,

  setMuteAll(on) {
    this.muteAll = !!on;
    for (const a of this._remoteAudios.values()) {
      try {
        const el = a.el || a;
        const vol = (a.volume != null ? a.volume : 1);
        const silent = this.muteAll || !!a.muted;
        if (el && el.volume != null) { el.muted = silent; el.volume = silent ? 0 : vol; }
        if (a.gain) a.gain.gain.value = silent ? 0 : vol;
      } catch (_) {}
    }
    return this.muteAll;
  },
  toggleMuteAll() { return this.setMuteAll(!this.muteAll); },
  destroy() {
    this.off();
    this.muteAll = false;
    for (const [, c] of this._inCalls) { try { c.close(); } catch (_) {} }
    this._inCalls.clear();
    for (const pid of [...this._remoteAudios.keys()]) this._stopRemote(pid);
    if (this._listenLoop) { try { clearInterval(this._listenLoop); } catch (_) {} this._listenLoop = null; }
  }
};
try {
  window.__HAWA_ON_REMOTE_AUDIO = function (id, stream) {
    try { VoiceChat._playRemote(id || 'remote', stream); } catch (_) {}
  };
} catch (_) {}


function localFace(rig) {
  const bl = rig.st.blinkT > 0 ? Math.sin((1 - rig.st.blinkT / .15) * Math.PI) : 0;
  const talkKey = K.KeyT ? .3 + .3 * Math.abs(Math.sin(performance.now() / 85)) : 0;
  const talkMic = VoiceChat.mouthAmount();
  const talk = Math.max(talkKey, talkMic);
  return {bl, mo: talk, sm: K.KeyY ? 1 : 0, su: K.KeyU ? 1 : 0, br: K.KeyU ? 1 : (K.KeyY ? .25 : 0), vo: VoiceChat.level01()};
}
function applyFace(rig, f, dt) {
  if (!rig || !rig.lipU || !f) return;
  
  const k = Math.min(1, dt * 16);
  const s = rig.fs || (rig.fs = {mo: 0, sm: 0, su: 0, br: 0});
  s.mo = _lerp(s.mo, f.mo || 0, k); s.sm = _lerp(s.sm, f.sm || 0, k); s.su = _lerp(s.su, f.su || 0, k); s.br = _lerp(s.br, f.br || 0, k);
  
  const mo = s.mo;
  rig.lipD.position.y = .04 - mo * .095;
  rig.lipU.position.y = .052 + mo * .045;
  rig.lipU.scale.x = rig.lipD.scale.x = 1 + s.sm * .45 + mo * .22;
  rig.lipD.scale.y = 1 + mo * 6.8;
  rig.lipU.scale.y = 1 + mo * 2.2;
  
  if (rig.jaw) {
    try { rig.jaw.rotation.x = mo * 0.55; } catch (_) {}
  }
  /* حركة الرأس من إيماءة الصوت فقط — مش من فتحة الفم */
  for (const b of (rig.brows || [])) b.position.y = .165 + s.br * .014 + s.su * .01;
  for (const e of (rig.eyes || [])) e.scale.y = 1 + s.su * .22;
  if (f.bl != null) for (const l of (rig.lids || [])) l.scale.y = .0001 + f.bl * .95;
}

function hardenPlayerRig(rig) {
  if (!rig || !rig.root) return;
  const fix = (o) => {
    if (!o) return;
    try {
      o.frustumCulled = false;
      o.visible = true;
      if (o.isMesh) {
        o.castShadow = !!o.castShadow;
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            if (!m) continue;
            if (m.opacity != null && m.opacity < 0.05) m.opacity = 1;
            if (m.transparent && m.opacity >= 0.99) m.transparent = false;
            m.needsUpdate = true;
          }
        }
      }
    } catch (_) {}
  };
  fix(rig.root);
  try { rig.root.traverse(fix); } catch (_) {}
  
  for (const side of [rig.L, rig.R]) {
    if (!side) continue;
    for (const k of ['hip', 'knee', 'ankle', 'toe']) fix(side[k]);
  }
  fix(rig.pelvis); fix(rig.waist); fix(rig.chest);
}

function makeRigWith(app) {
  if (!app || typeof app !== 'object') return makeRig();
  const bak = JSON.parse(JSON.stringify(PCFG)), clean = {};
  for (const k in app) if (app[k] !== undefined && app[k] !== null) clean[k] = app[k];
  for (const k in PCFG) delete PCFG[k];
  Object.assign(PCFG, JSON.parse(JSON.stringify(PLAYER_DEF)), clean);   
  try { return makeRig(); } finally { for (const k in PCFG) delete PCFG[k]; Object.assign(PCFG, bak); }
}

function makeGuyRig() {
  const P = PCFG, root = new T.Group();
  const dk = (hex, f) => new T.Color(hex).multiplyScalar(f);
  const RND = true;   
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
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .74, sec = [];
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .31, .14, .2, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .345, .12, .225, C.jacket, 0, .06, 0, null, .05);                                    
  bx(pelvis, .345, .02, .23, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .232, C.jacketD, 0, .06, 0);                                    

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .32, .17, .215, C.jacket, 0, .085, 0, null, .06);
  const BL = P.belly != null ? +P.belly : .6;                                          
  if (BL > 0) rbx(waist, .3, .2, .1 + .18 * BL, C.jacket, 0, .06, .09, null, .085);
  const chest = jt(waist, 0, .17, 0);
  rfru(chest, .24, .2, .3, .74, C.jacket, 0, .15, 0, null, .08);                                
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .27, .15);                                                  
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .078, .09, .12, C.skin, 0, .045, 0, 10);
  cy(neck, .08, .092, .04, C.skinD, 0, .01, 0, 10);
  cy(neck, .1, .11, .028, C.shirt, 0, -.02, 0, 10);
  for (const sd of [-1, 1]) bx(neck, .04, .035, .018, C.shirtD, sd * .04, -.025, .1, [.15, sd * .3, sd * .15]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .162, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        
  for (const sd of [-1, 1]) {
    rbx(head, .036, .1, .07, C.skinD, sd * (aTop + .004), .1, -.005, null, .016);                 
    
  }
  const NS = +P.noseSize > 0 ? +P.noseSize : 1.7;                                      
  rbx(head, .046 * NS * .8, .044 * NS, .05 * NS, C.skinD, 0, .092, fz(.092) + .012 + .008 * NS, null, .02);
  rbx(head, .06 * NS * .8, .024 * NS, .04 * NS, C.skinD, 0, .07, fz(.07) + .014 + .008 * NS, null, .014);                          
  const brows = [];
  for (const sd of [-1, 1]) brows.push(rbx(head, .085, .028, .03, C.hair, sd * .07, .165, fz(.165) + .008, [0, 0, sd * -.2], .012));
  const lipU = rbx(head, .07, .012, .02, C.lip, 0, .052, fz(.05) + .005, null, .0058);
  const lipD = rbx(head, .055, .012, .02, C.lip, 0, .04, fz(.04) + .004, null, .0058);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, fz(.046) - .004);
  for (const sd of [-1, 1]) rbx(head, .075, .03, .035, C.hair, sd * .04, .076, fz(.076) + .03, [0, 0, sd * -.2], .014);   
  rbx(head, .11, .06, .06, C.skin, 0, -.004, fz(0) + .02, null, .026);                                              
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
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar((+P.headScale > 0 ? +P.headScale : 1.0) * .95);

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .17, .34, .185, C.pants, 0, -.16, 0, null, .07);
    bx(hip, .012, .3, .187, C.pantsD, 0, -.17, 0);                                     
    const knee = jt(hip, 0, -.34, 0);
    rfru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0, null, .045);
    const ank = jt(knee, 0, -.32, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    rbx(sh, .17, .085, .16, C.jacket, sd * .015, .045, 0, [0, 0, sd * -.14], .04);            
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
  const RND = P.rounded === true;   
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
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .80, sec = [];   
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .29, .14, .19, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .315, .12, .205, C.jacket, 0, .06, 0, null, .05);                                    
  bx(pelvis, .315, .02, .21, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .212, C.jacketD, 0, .06, 0);                                    

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .29, .16, .195, C.jacket, 0, .08, 0, null, .06);
  const chest = jt(waist, 0, .16, 0);
  rfru(chest, .2, .175, .28, .825, C.jacket, 0, .14, 0, null, .07);                                
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .25, .15);                                                  
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .28, 0);
  
  cy(neck, .07, .08, .11, C.skin, 0, .04, 0, 10);
  cy(neck, .072, .082, .04, C.skinD, 0, .01, 0, 10);
  
  cy(neck, .095, .105, .028, C.shirt, 0, -.02, 0, 10);
  for (const sd of [-1, 1]) bx(neck, .04, .035, .018, C.shirtD, sd * .04, -.025, .1, [.15, sd * .3, sd * .15]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        
  for (const sd of [-1, 1]) {
    rbx(head, .03, .075, .055, C.skinD, sd * (aTop + .002), .1, -.005, null, .013);                 
    
  }
  rbx(head, .04, .045, .035, C.skinD, 0, .09, fz(.09) + .012, null, .014);                          
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
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar((+P.headScale > 0 ? +P.headScale : 1.0) * .88);   

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .155, .37, .17, C.pants, 0, -.175, 0, null, .06);
    bx(hip, .012, .33, .172, C.pantsD, 0, -.185, 0);                                     
    const knee = jt(hip, 0, -.37, 0);
    rfru(knee, .07, .06, .34, 1.05, C.pants, 0, -.17, 0, null, .04);
    const ank = jt(knee, 0, -.35, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .225, .205, 0);
    rbx(sh, .13, .065, .13, C.jacket, sd * .012, .04, 0, [0, 0, sd * -.14], .03);            
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
  const RND = P.rounded === true;   
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
  const disc = (par, rx, ry, dp, mt, x, y, z) => {   
    if (!RND) return bx(par, rx * 2, ry * 2, dp, mt, x, y, z);
    const g = new T.CylinderGeometry(1, 1, dp, 24); g.rotateX(Math.PI / 2);
    const m = new T.Mesh(g, mt); m.scale.set(rx, ry, 1); return place(m, par, x, y, z);
  };
  const cy = (par, rt, rb, h, mt, x, y, z, seg, rot) => place(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 8), mt), par, x, y, z, rot);
  const HIP = .74, sec = [];
  const spring = (o, o2) => { sec.push(Object.assign({o, m: 1, sg: 1, k: 90, d: 8, rx: o.rotation.x, rz: o.rotation.z, py: o.position.y, ly: 0}, o2 || {})); };

  const pelvis = jt(root, 0, HIP, 0);
  rbx(pelvis, .31, .14, .2, C.pants, 0, -.01, 0, null, .05);
  rbx(pelvis, .345, .12, .225, C.jacket, 0, .06, 0, null, .05);                                    
  bx(pelvis, .345, .02, .23, C.jacketD, 0, .005, 0);
  bx(pelvis, .012, .1, .232, C.jacketD, 0, .06, 0);                                    

  const waist = jt(pelvis, 0, .08, 0);
  rbx(waist, .32, .17, .215, C.jacket, 0, .085, 0, null, .06);
  const chest = jt(waist, 0, .17, 0);
  rfru(chest, .225, .195, .3, .74, C.jacket, 0, .15, 0, null, .075);                                
  bx(chest, .1, .24, .02, C.shirt, 0, .16, .142);                                      
  for (const sd of [-1, 1]) {
    bx(chest, .1, .26, .03, C.jacketD, sd * .1, .14, .145, [0, 0, sd * -.2]);          
    bx(chest, .03, .03, .015, C.dark, sd * .02, .0, .168);                             
  }
  bx(chest, .05, .03, .012, C.shirt, .12, .15, .145);                                  
  bx(chest, .07, .014, .02, C.jacketD, .12, .125, .15);
  const tie = jt(chest, 0, .27, .15);                                                  
  bx(tie, .045, .04, .035, C.tieD, 0, 0, 0);
  bx(tie, .05, .17, .018, C.tie, 0, -.12, .004);
  bx(tie, .05, .04, .018, C.tieD, 0, -.215, .004, [0, 0, Math.PI / 4]);
  spring(tie, {m: .7, sg: 1, k: 120, d: 7, lo: -.9, hi: .04});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .07, .08, .11, C.skin, 0, .04, 0, 10);
  cy(neck, .072, .082, .04, C.skinD, 0, .01, 0, 10);
  cy(neck, .095, .105, .028, C.shirt, 0, -.02, 0, 10);
  for (const sd of [-1, 1]) bx(neck, .04, .035, .018, C.shirtD, sd * .04, -.025, .1, [.15, sd * .3, sd * .15]);

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);
  rfru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0, null, .07);
  const fz = y => zAt(y) * .96;                                                        
  for (const sd of [-1, 1]) {
    rbx(head, .03, .075, .055, C.skinD, sd * (aTop + .002), .1, -.005, null, .013);                 
    
  }
  rbx(head, .04, .045, .035, C.skinD, 0, .09, fz(.09) + .012, null, .014);                          
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
  rbx(head, .4, .085, .385, C.hair, 0, .305, -.004, null, .04);                                    
  rbx(head, .4, .2, .08, C.hair, 0, .2, -.165, null, .035);                                         
  for (const sd of [-1, 1]) rbx(head, .04, .14, .3, C.hair, sd * .183, .225, -.02, null, .018);     
  rbx(head, .26, .05, .06, C.hair, -.04, .275, .165, [0, 0, .07], .022);                      
  rbx(head, .12, .05, .05, C.hair, .13, .285, .155, [0, 0, -.25], .02);
  if (hs === 'long') { rbx(head, .4, .34, .08, C.hair, 0, .02, -.18, null, .035); for (const sd of [-1, 1]) rbx(head, .05, .26, .1, C.hair, sd * .185, .08, -.05, null, .022); }
  if (hs === 'bun') { place(new T.Mesh(new T.IcosahedronGeometry(.085, RND ? 2 : 0), C.hair), head, 0, .37, -.08); }
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, fz(.01)); bx(head, .11, .02, .03, C.hair, 0, .066, fz(.066) + .012); }
  if (P.glasses) {                                                                     
    const gz = fz(.12) + .03;
    for (const sd of [-1, 1]) {
      const cx = sd * .075;
      bx(head, .105, .012, .014, C.dark, cx, .162, gz); bx(head, .105, .012, .014, C.dark, cx, .082, gz);
      bx(head, .012, .08, .014, C.dark, cx - .0465, .122, gz); bx(head, .012, .08, .014, C.dark, cx + .0465, .122, gz);
      bx(head, .09, .068, .008, C.glass, cx, .122, gz);
      bx(head, .012, .012, .2, C.dark, sd * .1, .13, gz - .1);                          
    }
    bx(head, .03, .012, .014, C.dark, 0, .135, gz);
  }
  head.scale.setScalar(+P.headScale > 0 ? +P.headScale : 1.0);

  const cape = [jt(chest, 0, .3, -.13)];

  const legs = {}, arms = {};
  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', hip = jt(pelvis, sd * .1, -.02, 0);
    rbx(hip, .17, .34, .185, C.pants, 0, -.16, 0, null, .07);
    bx(hip, .012, .3, .187, C.pantsD, 0, -.17, 0);                                     
    const knee = jt(hip, 0, -.34, 0);
    rfru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0, null, .045);
    const ank = jt(knee, 0, -.32, 0);
    rbx(ank, .16, .08, .175, C.pants, 0, .045, 0, null, .03);                                      
    rbx(ank, .15, .06, .17, C.boot, 0, -.005, .035, null, .028);
    bx(ank, .14, .04, .07, C.sole, 0, -.04, -.075);                                    
    bx(ank, .155, .025, .29, C.sole, 0, -.0475, .045);                                 
    const toe = jt(ank, 0, -.02, .13);
    rbx(toe, .15, .06, .1, C.boot, 0, .005, .045, null, .028);
    bx(toe, .155, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    rbx(sh, .15, .07, .15, C.jacket, sd * .015, .045, 0, [0, 0, sd * -.14], .033);            
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
    bx(pelvis, .075, .085, .06, C.vestD, sd * .13, .03, .12, [0, sd * .35, 0]);      
    bx(pelvis, .08, .02, .065, C.vest, sd * .13, .08, .12, [0, sd * .35, 0]);
  }
  bx(pelvis, .06, .17, .09, C.belt, .21, -.09, .02);                                  
  bx(pelvis, .035, .06, .05, C.metal, .21, .0, .02);
  cy(pelvis, .055, .055, .1, C.packD, -.19, -.02, -.1, 8, [0, 0, 0]);                 
  cy(pelvis, .03, .03, .02, C.metal, -.19, .04, -.1, 6);

  const waist = jt(pelvis, 0, .08, 0);
  bx(waist, .31, .17, .21, C.shirt, 0, .085, 0);
  const chest = jt(waist, 0, .17, 0);
  fru(chest, .22, .19, .3, .74, C.shirt, 0, .15, 0);                                  
  bx(chest, .35, .27, .075, C.vest, 0, .135, .125);                                   
  bx(chest, .34, .27, .06, C.vest, 0, .135, -.125);                                   
  for (let i = -1; i <= 1; i++) {                                                     
    bx(chest, .085, .09, .055, C.vestD, i * .105, .06, .17);
    bx(chest, .09, .025, .06, C.vest, i * .105, .108, .172);
    bx(chest, .018, .03, .062, C.buckle, i * .105, .095, .175);
  }
  bx(chest, .07, .045, .012, C.scarf, .1, .22, .166);                                 
  bx(chest, .035, .035, .014, C.buckle, .1, .22, .171, [0, 0, Math.PI / 4]);
  for (const sd of [-1, 1]) bx(chest, .085, .03, .27, C.vestD, sd * .13, .305, 0, [0, 0, sd * -.08]);   
  bx(chest, .05, .09, .045, C.dark, -.17, .22, .13);
  const tags = jt(chest, 0, .3, .16);
  bx(tags, .012, .075, .008, C.metal, -.012, -.04, 0, [0, 0, .08]); bx(tags, .012, .075, .008, C.buckle, .014, -.045, .004, [0, 0, -.06]);
  spring(tags, {m: 1.3, sg: 1, k: 130, d: 7});

  const pack = jt(chest, 0, .09, -.2);
  bx(pack, .32, .26, .14, C.pack, 0, 0, 0);
  bx(pack, .3, .055, .16, C.packD, 0, .15, 0);
  bx(pack, .06, .16, .03, C.packD, -.1, .0, .085); bx(pack, .06, .16, .03, C.packD, .1, .0, .085);
  for (const sd of [-1, 1]) bx(pack, .06, .13, .1, C.packD, sd * .185, -.02, 0);
  cy(pack, .06, .06, .34, C.roll, 0, -.17, .0, 8, [0, 0, Math.PI / 2]);               
  for (const sd of [-1, 1]) bx(pack, .018, .13, .13, C.belt, sd * .1, -.17, 0);
  spring(pack, {m: .45, sg: 1, k: 110, d: 9, ly: .012});
  const ant = jt(pack, .11, .16, -.02);                                                
  cy(ant, .006, .009, .42, C.metal, 0, .21, 0, 5);
  place(new T.Mesh(new T.IcosahedronGeometry(.02, 0), C.scarf), ant, 0, .42, 0);
  spring(ant, {m: 1.9, sg: -1, k: 60, d: 4.2});

  const neck = jt(chest, 0, .3, 0);
  cy(neck, .065, .075, .08, C.skinD, 0, .02, 0, 6);
  cy(neck, .125, .145, .075, C.scarf, 0, .0, 0, 8);                                    
  bx(neck, .075, .075, .07, C.scarfD, .04, -.015, .125, [0, 0, .5]);                   

  const head = jt(neck, 0, .05, 0);
  const aTop = .184, aBot = .148, hy0 = -.02, hy1 = .30;
  const zAt = y => aBot + (aTop - aBot) * (y - hy0) / (hy1 - hy0);                    
  fru(head, aTop, aBot, hy1 - hy0, .96, C.skin, 0, (hy0 + hy1) / 2, 0);
  for (const sd of [-1, 1]) {
    bx(head, .03, .075, .055, C.skinD, sd * (aTop - .012 + .018), .1, -.005);          
    bx(head, .03, .095, .07, C.hair, sd * (aTop - .006), .19, -.01);                   
    bx(head, .04, .03, .012, C.cheek, sd * .112, .072, zAt(.072) * .96 + .004);        
  }
  bx(head, .37, .1, .05, C.hair, 0, .2, -.17);                                         
  bx(head, .04, .045, .035, C.skinD, 0, .09, zAt(.09) * .96 + .012);                   
  const brows = [];
  for (const sd of [-1, 1]) brows.push(bx(head, .065, .016, .022, C.hair, sd * .07, .165, zAt(.165) * .96 + .004, [0, 0, sd * -.14]));
  const lipU = bx(head, .07, .012, .02, C.lip, 0, .052, zAt(.05) * .96 + .005);
  const lipD = bx(head, .055, .012, .02, C.lip, 0, .04, zAt(.04) * .96 + .004);
  bx(head, .05, .03, .012, C.mouthIn, 0, .046, zAt(.046) * .96 - .004);                
  const eyes = [], lids = [];
  for (const sd of [-1, 1]) {
    const ez = zAt(.12) * .96, eg = jt(head, sd * .075, .12, ez);
    bx(eg, .088, .076, .022, C.eyeW, 0, 0, .002);
    bx(eg, .052, .062, .022, C.iris, 0, 0, .01);
    bx(eg, .028, .04, .022, C.pupil, 0, 0, .016);
    bx(eg, .012, .012, .022, C.eyeW, .012, .014, .022);                                
    eyes.push(eg);
    lids.push(bx(head, .094, .082, .028, C.skin, sd * .075, .12, ez + .005));
  }
  for (const l of lids) l.scale.y = .0001;
  if (P.beard) { bx(head, .15, .06, .05, C.hair, 0, .005, zAt(.01) * .96); bx(head, .11, .02, .03, C.hair, 0, .066, zAt(.066) * .96 + .012); }
  const helmJ = jt(head, 0, .0, 0);
  const dome = new T.Mesh(new T.SphereGeometry(.215, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), C.helm);
  dome.scale.set(1.02, .9, 1.02); place(dome, helmJ, 0, .22, -.005);
  cy(helmJ, .225, .235, .04, C.helmD, 0, .215, -.005, 8);                              
  cy(helmJ, .213, .219, .04, C.vestD, 0, .26, -.005, 8);                               
  for (const sd of [-1, 1]) {
    cy(helmJ, .052, .052, .04, C.metal, sd * .065, .262, .192, 8, [Math.PI / 2, 0, 0]);
    cy(helmJ, .04, .04, .045, C.lens, sd * .065, .262, .196, 8, [Math.PI / 2, 0, 0]);
    bx(helmJ, .012, .16, .02, C.belt, sd * .176, .13, .05, [0, 0, sd * .06]);          
  }
  bx(helmJ, .05, .05, .014, C.scarf, 0, .35, .19, [.45, 0, Math.PI / 4]);              
  [[-.1, .365, .1], [.12, .36, .06], [-.05, .4, -.08], [.1, .37, -.1], [-.14, .33, -.06]].forEach(q => {
    const sp = new T.Mesh(new T.IcosahedronGeometry(.036, 0), C.helmD); sp.scale.set(1, .45, 1); place(sp, helmJ, q[0], q[1], q[2]);
  });
  head.scale.setScalar(+P.headScale > 0 ? +P.headScale : 1.0);                                                          

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
    bx(hip, .04, .12, .115, C.pantsD, sd * .105, -.14, 0);                             
    bx(hip, .045, .02, .12, C.vestD, sd * .105, -.1, 0);
    const knee = jt(hip, 0, -.34, 0);
    bx(knee, .145, .1, .06, C.vestD, 0, .0, .1);                                       
    bx(knee, .12, .03, .065, C.vest, 0, .045, .1);
    fru(knee, .078, .066, .31, 1.05, C.pants, 0, -.155, 0);
    const ank = jt(knee, 0, -.32, 0);
    bx(ank, .16, .17, .175, C.boot, 0, .075, 0);                                       
    bx(ank, .175, .03, .19, C.sole, 0, .155, 0);                                       
    bx(ank, .07, .11, .012, C.pack, 0, .08, .09);                                      
    bx(ank, .16, .09, .17, C.boot, 0, -.015, .035);
    bx(ank, .15, .045, .07, C.sole, 0, -.04, -.075);                                   
    bx(ank, .17, .025, .29, C.sole, 0, -.0475, .045);                                  
    const toe = jt(ank, 0, -.02, .13);
    bx(toe, .16, .075, .1, C.boot, 0, .0, .045);
    bx(toe, .17, .025, .1, C.sole, 0, -.0275, .05);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .255, .23, 0);
    bx(sh, .16, .07, .16, C.vest, sd * .02, .045, 0, [0, 0, sd * -.18]);               
    bx(sh, .17, .02, .17, C.vestD, sd * .03, .075, 0, [0, 0, sd * -.18]);
    bx(sh, .13, .30, .135, C.shirt, 0, -.135, 0);
    bx(sh, .145, .05, .15, C.shirtD, 0, -.27, 0);
    const el = jt(sh, 0, -.255, 0);
    bx(el, .12, .07, .12, C.skin, 0, .0, 0);
    bx(el, .115, .08, .06, C.vestD, 0, .0, -.07);
    fru(el, .062, .05, .26, 1, C.skin, 0, -.11, 0);
    bx(el, .11, .035, .11, C.dark, 0, -.205, 0); bx(el, .06, .03, .02, C.lens, 0, -.205, .058);   
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
  bx(pelvis, .075, .06, .03, C.gold, 0, .075, .172);                       
  bx(pelvis, .04, .035, .035, C.metal, 0, .075, .178);
  for (const sd of [-1, 1]) {
    bx(pelvis, .085, .12, .07, C.leatherD, sd * .165, .02, .1, [0, sd * .25, 0]);    
    bx(pelvis, .09, .035, .075, C.leather, sd * .165, .085, .1, [0, sd * .25, 0]);
    sph(pelvis, .012, C.gold, sd * .165, .075, .135, null, 8);
  }
  bx(pelvis, .075, .22, .05, C.leatherD, .205, -.1, .02);                    
  bx(pelvis, .06, .08, .045, C.metal, .205, .03, .02);
  bx(pelvis, .13, .11, .02, C.armorD, 0, -.06, .17, [.15, 0, 0]);            
  bx(pelvis, .06, .15, .02, C.armor, 0, -.085, .182, [.1, 0, 0]);

  const waist = jt(pelvis, 0, .1, 0);
  cyl(waist, .17, .19, .22, C.shirt, 0, .1, 0, [1, 1, .74], 18);
  for (let i = 0; i < 3; i++) bx(waist, .1, .012, .02, C.shirtD, 0, .06 + i * .06, .13);    
  const chest = jt(waist, 0, .2, 0);
  sph(chest, .235, C.shirt, 0, .11, 0, [1.02, 1.02, .72], 20);               
  sph(chest, .12, C.shirtD, -.1, .12, .08, [1, .9, .6], 12); sph(chest, .12, C.shirtD, .1, .12, .08, [1, .9, .6], 12);  
  bx(chest, .36, .3, .055, C.armor, 0, .12, .17, [-.06, 0, 0]);              
  bx(chest, .12, .26, .06, C.armorD, 0, .12, .19, [-.06, 0, 0]);            
  for (const sd of [-1, 1]) {
    bx(chest, .15, .24, .04, C.armor, sd * .11, .15, .175, [-.06, sd * -.2, 0]);
    bx(chest, .07, .055, .04, C.leatherD, sd * .09, -.02, .2);               
    bx(chest, .07, .02, .045, C.leather, sd * .09, .01, .205);
    sph(chest, .009, C.gold, sd * .09, .01, .23, null, 6);
  }
  cyl(chest, .035, .035, .012, C.gold, 0, .2, .225, null, 14, [Math.PI / 2, 0, 0]);   
  bx(chest, .34, .28, .05, C.armor, 0, .12, -.17, [.04, 0, 0]);              
  bx(chest, .3, .05, .04, C.armorD, 0, .02, -.18);
  for (const sd of [-1, 1]) bx(chest, .06, .035, .26, C.leather, sd * .12, .24, 0, [0, 0, sd * .08]);   
  bx(chest, .3, .36, .14, C.leatherD, 0, .08, -.28);
  bx(chest, .26, .14, .05, C.leather, 0, .0, -.36);
  cyl(chest, .06, .06, .34, C.shirtD, 0, .3, -.26, null, 12, [0, 0, Math.PI / 2]);       
  for (const sd of [-1, 1]) bx(chest, .03, .3, .02, C.leather, sd * .14, .1, -.2);
  cyl(chest, .1, .145, .07, C.armorD, 0, .28, 0, [1, 1, .9], 16);

  const neck = jt(chest, 0, .28, 0);
  cyl(neck, .058, .068, .12, C.skin, 0, .03, 0, null, 14);
  sph(neck, .02, C.skinD, 0, .0, .055, null, 8);
  const head = jt(neck, 0, .08, 0);
  sph(head, .118, C.skin, 0, .125, 0, [1, 1.1, 1.06], 22);                    
  sph(head, .092, C.skin, 0, .035, .03, [1, .85, 1], 18);                      
  sph(head, .03, C.skin, 0, -.0, .085, [1.25, .7, .8], 12);                    
  for (const sd of [-1, 1]) sph(head, .045, C.skin, sd * .068, .088, .075, [1, .9, .8], 10);   
  put(new T.ConeGeometry(.02, .055, 8), C.skin, head, 0, .108, .125, [1, 1, 1], [Math.PI / 2 - .35, 0, 0]);  
  sph(head, .016, C.skin, 0, .093, .128, [1.5, .8, 1], 8);
  bx(head, .012, .045, .014, C.skin, 0, .135, .112);                           
  const brows = [];
  for (const sd of [-1, 1]) {
    sph(head, .016, C.skinD, sd * .12, .115, -.005, [.5, 1.2, .9], 8);       
    brows.push(bx(head, .05, .009, .012, C.hair, sd * .042, .165, .113, [0, 0, sd * -.15]));   
  }
  const lipU = bx(head, .05, .01, .014, C.lip, 0, .052, .113), lipD = bx(head, .042, .008, .013, C.lip, 0, .04, .112);   
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
  bx(head, .03, .02, .24, C.armorD, 0, .285, -.005);                            
  for (const sd of [-1, 1]) {
    bx(head, .02, .1, .12, C.armorD, sd * .14, .155, -.01);                    
    bx(head, .012, .08, .012, C.leather, sd * .1, .06, .06, [0, 0, sd * .15]);  
    cyl(head, .028, .028, .03, C.metal, sd * .15, .17, -.01, null, 10, [0, 0, Math.PI / 2]);
  }
  bx(head, .1, .012, .012, C.leather, 0, .0, .085);
  bx(head, .24, .05, .035, C.armorD, 0, .215, .13, [.15, 0, 0]);
  for (const sd of [-1, 1]) { cyl(head, .028, .028, .03, C.glass, sd * .06, .215, .15, null, 14, [Math.PI / 2 + .15, 0, 0]); cyl(head, .02, .02, .008, C.glow, sd * .06, .218, .167, null, 12, [Math.PI / 2 + .15, 0, 0]); }

  const cape = []; let cp = jt(chest, 0, .32, -.22);
  bx(cp, .52, .04, .06, C.gold, 0, 0, 0); 
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
    sph(hip, .085, C.cloth, 0, -.17, .015, [1, 2.1, 1.05], 14);               
    sph(hip, .07, C.clothL, sd * -.01, -.16, -.04, [1, 1.9, .9], 12);          
    bx(hip, .1, .17, .03, C.armor, sd * .02, -.15, .095, [-.05, 0, 0]);        
    bx(hip, .1, .02, .035, C.armorD, sd * .02, -.07, .1);
    const knee = jt(hip, 0, -.4, 0);
    sph(knee, .068, C.armor, 0, 0, .0, [1, 1, .9], 12);
    bx(knee, .1, .09, .045, C.armor, 0, .0, .065, [-.1, 0, 0]);              
    sph(knee, .012, C.gold, 0, .0, .092, null, 8);
    lim(knee, .068, .048, .38, C.cloth, 14);
    sph(knee, .06, C.cloth, 0, -.1, -.03, [1, 1.9, 1.1], 12);                 
    bx(knee, .085, .24, .03, C.armor, 0, -.2, .06, [.03, 0, 0]);               
    bx(knee, .09, .02, .035, C.armorD, 0, -.085, .066);
    bx(knee, .09, .02, .035, C.armorD, 0, -.31, .056);
    const ank = jt(knee, 0, -.38, 0);
    sph(ank, .05, C.leather, 0, 0, 0, null, 10);
    cyl(ank, .065, .06, .14, C.leather, 0, .015, 0, null, 14);                
    cyl(ank, .068, .068, .02, C.armorD, 0, .075, 0, null, 14);
    for (let i = 0; i < 4; i++) bx(ank, .06, .008, .012, C.gold, 0, .05 - i * .028, .066, [.3, 0, 0]);   
    bx(ank, .115, .075, .17, C.leather, 0, -.05, .045);                        
    bx(ank, .1, .04, .07, C.leatherD, 0, -.06, -.075);                          
    bx(ank, .125, .03, .31, C.rubber, 0, -.098, .04);                            
    bx(ank, .125, .045, .05, C.rubber, 0, -.088, -.1);
    const toe = jt(ank, 0, -.075, .12);
    bx(toe, .113, .06, .09, C.leather, 0, .015, .045);
    bx(toe, .115, .035, .075, C.armorD, 0, .045, .045);                      
    bx(toe, .125, .028, .1, C.rubber, 0, -.025, .04);
    legs[nm] = {hip, knee, ankle: ank, toe};
  }

  for (const sd of [-1, 1]) {
    const nm = sd < 0 ? 'L' : 'R', sh = jt(chest, sd * .27, .22, 0);
    sph(sh, .082, C.shirt, 0, 0, 0, [1, .9, 1], 12);
    sph(sh, .105, C.armor, sd * .02, .04, 0, [1.1, .5, 1.1], 14);              
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
    cyl(el, .056, .05, .15, C.armor, 0, -.12, 0, null, 12);                    
    cyl(el, .058, .058, .018, C.gold, 0, -.19, 0, null, 14);
    bx(el, .07, .04, .015, C.glow, 0, -.1, .055);
    const wr = jt(el, 0, -.26, 0);
    sph(wr, .035, C.leather, 0, 0, 0, null, 8);
    bx(wr, .085, .09, .04, C.leatherD, 0, -.05, 0);                              
    bx(wr, .075, .03, .045, C.armorD, 0, -.095, .005);                           
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
    
    head.scale.setScalar(1.22);
  }
  if (PCFG.style === 'abaya') {
    const abM = new T.MeshStandardMaterial({color: PCFG.abaya, roughness: .92, metalness: 0, side: T.DoubleSide});
    root.traverse(o => {   
      if (o.isMesh && (o.material === C.armor || o.material === C.armorD || o.material === C.glow || o.material === C.glass || o.material === C.capeEdge)) o.visible = false;
    });
    if (cape[0]) cape[0].visible = false;                     
    if (PCFG.hood) {                                          
      const hd = new T.Mesh(new T.SphereGeometry(.135, 24, 14, 0, Math.PI * 2, 0, Math.PI * .55), abM);
      hd.position.set(0, .2, -.05); hd.scale.set(1.06, 1.12, 1.1); head.add(hd);
    }
    const robe = new T.Mesh(new T.CylinderGeometry(.22, .5, 1.0, 40, 1, true), abM);   
    robe.position.set(0, -.4, 0); robe.castShadow = true; pelvis.add(robe);
    const hem = new T.Mesh(new T.TorusGeometry(.5, .018, 8, 56), M(PCFG.trim, .3, .6)); 
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
  const fall = air ? clamp(-s.vy / 14, -1, 1) : 0;        
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
    VoiceChat.tick(); try { VoiceChat.tickSpatial(); } catch(_){}
    const sh = VoiceChat.headShakeAmount();
    // إيماءة كلام واضحة: رأس لأعلى/أسفل + اهتزاز خفيف جانبي مع الصوت
    const baseHx = hp, baseHy = tgt, baseHz = -turnRoll * .5;
    const baseNx = -lean * .15, baseNy = tgt * .25;
    if (!rig._voiceNod) rig._voiceNod = { x: 0, z: 0 };
    const nodAmt = (+VOICE_CFG.nodAmount || 0.38);
    const nodSpd = (+VOICE_CFG.nodSpeed || 7.2);
    if (sh > 0.0008) {
      const tt = performance.now() * 0.001;
      const intensity = Math.min(1.35, sh * 10);
      // موجة أقوى لأعلى/أسفل أثناء الكلام
      const nod = Math.sin(tt * nodSpd) * 0.7 + Math.sin(tt * nodSpd * 1.85 + 0.35) * 0.35
                + Math.sin(tt * nodSpd * 0.55 + 1.1) * 0.18;
      const targetNod = nod * nodAmt * intensity;
      // اهتزاز جانبي خفيف يتناسب مع مستوى الصوت
      const side = Math.sin(tt * nodSpd * 2.4 + 0.6) * 0.22 + Math.sin(tt * nodSpd * 4.1) * 0.1;
      const targetSide = side * nodAmt * 0.55 * intensity;
      rig._voiceNod.x = _lerp(rig._voiceNod.x, targetNod, Math.min(1, dt * 14));
      rig._voiceNod.z = _lerp(rig._voiceNod.z, targetSide, Math.min(1, dt * 14));
    } else {
      rig._voiceNod.x = _lerp(rig._voiceNod.x, 0, Math.min(1, dt * 9));
      rig._voiceNod.z = _lerp(rig._voiceNod.z, 0, Math.min(1, dt * 9));
      if (Math.abs(rig._voiceNod.x) < 0.001) rig._voiceNod.x = 0;
      if (Math.abs(rig._voiceNod.z) < 0.001) rig._voiceNod.z = 0;
    }
    rig.head.rotation.x = baseHx + rig._voiceNod.x;
    rig.head.rotation.y = baseHy;
    rig.head.rotation.z = baseHz + (rig._voiceNod.z || 0);
    if (rig.neck) {
      rig.neck.rotation.x = baseNx + rig._voiceNod.x * 0.42;
      rig.neck.rotation.y = baseNy;
      rig.neck.rotation.z = (rig._voiceNod.z || 0) * 0.45;
    }
  }
  if (!s.local) {
    rig.neck.rotation.x = _lerp(rig.neck.rotation.x, -lean * .15, k);
    rig.neck.rotation.y = _lerp(rig.neck.rotation.y, tgt * .25, kS);
  }
  // للوكل: الرقبة اتظبطت مع إيماءة الصوت فوق
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
    const lag = .35 + .09 * i;                 
    const fl = (Math.sin(t * 6.5 + i * 1.15) * .04 + Math.sin(t * 1.7 + i * .7) * .015) * Math.min(1.2, s.hv / 5 + .3);
    const tx = base * lag + fl + wind * (1 + i * .08);
    const tz = side * (.4 + .12 * i) + Math.sin(t * 3.2 + i) * .008;
    const stiff = 95 - i * 4;                   
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
      const step = (!air && s.moving) ? Math.sin(2 * ph) * .03 * stride * m * e.sg : 0;   
      e.o.rotation.x = e.rx + clamp(S2.a, e.lo != null ? e.lo : -1.1, e.hi != null ? e.hi : 1.1) + step;
      e.o.rotation.z = e.rz + clamp(S2.z, -.8, .8);
      if (e.ly) e.o.position.y = e.py - land * e.ly;
    }
  }
  if (rig.blob) { const bm = rig.blob.material; bm.opacity = _lerp(bm.opacity, air ? .1 : .34, Math.min(1, dt * 10)); }
}

function respawnP() {
  const rt = RT; if (!rt) return;
  
  if (rt.scriptSpawn) {
    const s = rt.scriptSpawn;
    rt.p.set(+s.x || 0, (+s.y || 0) + .02, +s.z || 0);
  } else {
    const o = rt.cur || rt.rs[0];
    if (o) rt.p.set(o.pos[0], o.pos[1] + .02, o.pos[2]); else rt.p.set(0, .02, 0);
  }
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
function aabbBox(m) {   
  _bb.setFromObject(m); const b = _bb;
  return {x0: b.min.x, x1: b.max.x, y0: b.min.y, y1: b.max.y, z0: b.min.z, z1: b.max.z, cx: (b.min.x + b.max.x) / 2, cy: (b.min.y + b.max.y) / 2, cz: (b.min.z + b.max.z) / 2};
}
function hadd(b) {
  for (let x = Math.floor(b.x0 / CELL); x <= Math.floor(b.x1 / CELL); x++) for (let z = Math.floor(b.z0 / CELL); z <= Math.floor(b.z1 / CELL); z++) {
    const k = x * 100003 + z; let a = RT.hash.get(k); if (!a) RT.hash.set(k, a = []); a.push(b);
  }
}

const NOPLAY = new WeakSet();
let sbxDepth = 0, sbxMedia = [];
(function patchMediaOnce() {
  try {
    if (window.__hawaMediaPatched) return; window.__hawaMediaPatched = true;
    const _play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (NOPLAY.has(this) || (S.mode !== 'play' && this.hasAttribute && this.hasAttribute('data-script-ui'))) { try { this.pause(); } catch (_) {} return Promise.resolve(); }
      return _play.apply(this, arguments);
    };
    const _ce = document.createElement;
    document.createElement = function (tag) {
      const el = _ce.apply(document, arguments);
      try {
        if (sbxDepth > 0) {
          if (/^(audio|video)$/i.test(String(tag))) { NOPLAY.add(el); sbxMedia.push(el); }
          
          if (/^(div|span|canvas|p|button|img|video|audio|iframe|ul|ol|li|section|aside|header|footer)$/i.test(String(tag))) {
            try { el.setAttribute('data-script-ui', '1'); } catch (_) {}
          }
        }
      } catch (_) {}
      return el;
    };
    const _A = window.Audio;
    if (_A) {
      const W = function (src) { const a = new _A(src); try { if (sbxDepth > 0) { NOPLAY.add(a); sbxMedia.push(a); } } catch (_) {} return a; };
      W.prototype = _A.prototype; window.Audio = W;
    }
    ['AudioContext', 'webkitAudioContext'].forEach(n => {
      const C = window[n]; if (!C) return;
      const W = function () {
        const c = new C(...arguments);
        try { if (sbxDepth > 0) { NOPLAY.add(c); c.suspend(); } } catch (_) {}
        return c;
      };
      W.prototype = C.prototype; window[n] = W;
    });
    const AC = window.AudioContext && window.AudioContext.prototype;
    if (AC && AC.resume) { const _r = AC.resume; AC.resume = function () { if (NOPLAY.has(this)) return Promise.resolve(); return _r.apply(this, arguments); }; }
  } catch (e) { console.warn('media patch', e); }
})();
function sandboxRun(root, preview, fn) {
  const hadOwn = Object.prototype.hasOwnProperty.call(scene, 'add'), origAdd = scene.add;
  const mark = sbxMedia.length;
  if (preview) sbxDepth++;
  scene.add = function () { for (let i = 0; i < arguments.length; i++) root.add(arguments[i]); return this; };
  try { fn(); }
  finally {
    if (hadOwn) scene.add = origAdd; else delete scene.add;
    if (preview) sbxDepth--;
  }
  return preview ? sbxMedia.splice(mark) : [];
}
function killMedia(list) {
  for (const m of (list || [])) { try { m.pause(); m.removeAttribute('src'); m.load && m.load(); } catch (_) {} try { m.remove && m.remove(); } catch (_) {} }
}
function sweepScriptUI() {   
  if (S.mode === 'play') return;
  try {
    document.querySelectorAll('[data-script-ui],[data-hawa-ctrl-ui],[data-hawa-combat-ui]').forEach(el => {
      
      if (el.id === 'hawaScriptHud') {
        if (el.innerHTML) el.innerHTML = '';
        el.style.display = 'none';
        return;
      }
      try { if (el.pause) el.pause(); } catch (_) {}
      try { el.remove(); } catch (_) {}
    });
    
    document.querySelectorAll('[id^="hawa-"],[id^="Hawa-"]').forEach(el => {
      if (el.id === 'hawaScriptHud') return;
      
      if (el.closest && (el.closest('#app') || el.closest('#play') || el.closest('#ed') || el.closest('#paramPanel'))) return;
      if (el.getAttribute('data-script-ui') == null && el.getAttribute('data-hawa-ctrl-ui') == null && el.getAttribute('data-hawa-combat-ui') == null) {
        
        if (el.parentElement === document.body && /fixed|absolute/i.test((el.style && el.style.position) || '')) {
          try { el.remove(); } catch (_) {}
        }
        return;
      }
      try { el.remove(); } catch (_) {}
    });
  } catch (_) {}
}
function bigGame(rt, o, root) {
  const G2 = {
    THREE: T, scene,
    get params() { return resolvedParams(o.p); },
    findByName: n => (rt.byName && rt.byName.get(n)) || null,
    find: n => (rt.byName && rt.byName.get(n)) || null,
    listAllObjects: () => (rt.byName ? Array.from(rt.byName.values()) : []),
    defineParams(list) { for (const e of list || []) if (e && e.key && o.p[e.key] === undefined) o.p[e.key] = e.value; },
    onUpdate(fn) { if (typeof fn === 'function') rt.ups.push(fn); },
    isKeyDown: c => keyDown(c),
    key: c => keyDown(c),
    setKey(code, down) { setVirtualKey(code, !!down); },
    forcePlayerInput(slot, inp) { applyInputMap(inp); },
    
    getMyName: () => {
      if (NetMP.on) return NetMP.name || 'لاعب';
      try { const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null'); if (m && m.playerName) return m.playerName; } catch (_) {}
      return 'لاعب';
    },
    getMyUsername: () => {
      if (NetMP.on) return NetMP.name || 'لاعب';
      try { const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null'); if (m && m.playerName) return m.playerName; } catch (_) {}
      return 'لاعب';
    },
    getPlayerId: () => (NetMP.on ? NetMP.slot : 0),
    getLocalPlayer: () => {
      const pl = rt.pl || {};
      let nm = 'لاعب';
      if (NetMP.on) nm = NetMP.name || 'لاعب';
      else { try { const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null'); if (m && m.playerName) nm = m.playerName; } catch (_) {} }
      pl.name = nm; pl.username = nm;
      pl.slot = NetMP.on ? NetMP.slot : 1;
      pl.local = true;
      pl.id = NetMP.on ? ('slot_' + NetMP.slot) : 'local';
      pl.mesh = (rt.rig && rt.rig.root) || pl.mesh || null;
      pl.position = rt.p || pl.position;
      return pl;
    },
    getPlayerForward: () => ({x: Math.sin(rt.ang), z: Math.cos(rt.ang)}),
    setPlayerPosition: (i, x, y, z, opt) => {
      const target = (i == null || i === 0 || i === 'me' || i === 'local') ? (NetMP.on ? NetMP.slot : 1) : i;
      const cmd = { pos: [x, y, z] };
      if (opt && opt.hold) cmd.hold = true;
      if (opt && opt.yaw != null) cmd.yaw = opt.yaw;
      if (opt && opt.locked != null) cmd.locked = opt.locked;
      return G2.controlPlayer(target, cmd);
    },
    
    get allowScriptSpawn() { return true; },
    setScriptSpawn(x, y, z) {
      /* script spawn دائماً مسموح */
      rt.scriptSpawn = { x: +x || 0, y: +y || 0, z: +z || 0 };
      return true;
    },
    clearScriptSpawn() { rt.scriptSpawn = null; },
    teleportPlayer: (i, x, y, z, opt) => {
      const target = (i == null || i === 0 || i === 'me' || i === 'local') ? (NetMP.on ? NetMP.slot : 1) : i;
      const cmd = { teleport: [x, y, z] };
      if (opt && opt.yaw != null) cmd.yaw = opt.yaw;
      if (opt && opt.pitch != null) cmd.pitch = opt.pitch;
      if (opt && opt.hold != null) cmd.hold = opt.hold;
      return G2.controlPlayer(target, cmd);
    },
    setPlayerYaw: (i, yaw) => G2.controlPlayer(i == null || i === 0 ? (NetMP.on ? NetMP.slot : 1) : i, { yaw }),
    holdPlayerPosition: (i, b) => G2.controlPlayer(i == null || i === 0 ? (NetMP.on ? NetMP.slot : 1) : i, { hold: !!b }),
    lockPlayer: (i, b) => G2.controlPlayer(i == null || i === 0 ? (NetMP.on ? NetMP.slot : 1) : i, { locked: !!b }),
    lockPlayerAnim: (i, b) => G2.controlPlayer(i == null || i === 0 ? (NetMP.on ? NetMP.slot : 1) : i, { animLock: b !== false }),
    unlockPlayerAnim: (i) => G2.controlPlayer(i == null || i === 0 ? (NetMP.on ? NetMP.slot : 1) : i, { animLock: false }),
    setPlayerLimb: (i, name, rx, ry, rz, opt) => {
      const target = (i == null || i === 0 || i === 'me') ? (NetMP.on ? NetMP.slot : 1) : i;
      const isLocal = !NetMP.on || +target === +NetMP.slot || target === 'me' || target === 'local';
      if (isLocal) {
        const key = jkey(name), j = key && jointOf(rt.rig, key); if (!j) return;
        j.rotation.set(rx || 0, ry || 0, rz || 0);
        if (opt && opt.lock) rt.locks.add(key); else if (opt && opt.lock === false) rt.locks.delete(key);
      } else {
        const limbs = {}; limbs[name] = [rx || 0, ry || 0, rz || 0];
        G2.controlPlayer(target, { limbs });
      }
    },
    getBone: (i, name) => {
      const target = (i == null || i === 0 || i === 'me') ? (NetMP.on ? NetMP.slot : 1) : i;
      if (!NetMP.on || +target === +NetMP.slot) {
        const key = jkey(name); return key ? jointOf(rt.rig, key) : null;
      }
      const r = NetMP.remotes && NetMP.remotes.get(+target);
      if (!r || !r.rig) return null;
      const key = jkey(name); return key ? jointOf(r.rig, key) : null;
    },
    setCamera: (i, cfg) => {
      // setCamera(cfg) or setCamera(slot, cfg)
      if (cfg === undefined && i && typeof i === 'object') { rt.cam = i; return; }
      const target = (i == null || i === 0 || i === 'me') ? (NetMP.on ? NetMP.slot : 1) : i;
      if (!NetMP.on || +target === +NetMP.slot) { rt.cam = cfg || null; return; }
      G2.controlPlayer(target, { camera: cfg || null });
    },
    clearCamera: (i) => {
      if (i == null || i === 0 || i === 'me' || !NetMP.on || +i === +NetMP.slot) { rt.cam = null; return; }
      G2.controlPlayer(i, { camera: null });
    },
    subtitle: t => { if (t) say(String(t), 4000); else rt.msgT = 0; },
    setHud(html) {
      
      if (S.mode !== 'play') return;
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
      level: () => VoiceChat.level01(),
      // مايك مرتبط باللاعب (سلوت / اسم / peerId) — مش مايك عام
      listPlayers: () => VoiceChat.listPlayers(),
      getPlayer: (who) => VoiceChat.getPlayer(who),
      setVolume: (who, vol) => VoiceChat.setVolume(who, vol),
      mutePlayer: (who, on) => VoiceChat.mutePlayer(who, on),
      setSpatial: (on) => VoiceChat.setSpatial(on),
      spatial: () => !!VoiceChat.spatial,
      // وصول مفتوح مالانهاية: stream / nodes / context لأي ظرف تبنيه في السكربت
      getStream: (who) => VoiceChat.getStream(who),
      getAudioElement: (who) => VoiceChat.getAudioElement(who),
      getNodes: (who) => VoiceChat.getNodes(who),
      getContext: () => VoiceChat.getContext(),
      getLocalStream: () => VoiceChat.getLocalStream(),
      getAllEntries: () => VoiceChat.getAllEntries(),
      pipe: (who, fn) => VoiceChat.pipe(who, fn)
    },
    clearHud() {
      if (S.mode !== 'play') return;
      const el = document.getElementById('hawaScriptHud');
      if (el) { el.innerHTML = ''; el.style.display = 'none'; }
    },
    getCoords: () => RT ? ({ x: +RT.p.x.toFixed(3), y: +RT.p.y.toFixed(3), z: +RT.p.z.toFixed(3) }) : ({x:0,y:0,z:0}),
    registerInteractAction: (r, cfg) => { if (cfg) rt.inter.push({root: r, cfg}); },
    
    syncObject: (obj) => {
      try {
        const m = obj || root;
        if (!m || !m.position) return;
        const id = m.userData && m.userData.id != null ? m.userData.id : (o && o.id);
        if (id == null) return;
        m.userData.netSync = true;
        
        if (m.userData.bikeState || m.userData.netExtra) {
          
        }
        NetMP.queueObj(id, m);
      } catch (e) {}
    },
    getShared: (k, d) => {
      if (rt.shared.has(k)) return rt.shared.get(k);
      if (NetMP.sharedHas && NetMP.sharedHas(k)) return NetMP.sharedGet(k, d);
      return d;
    },
    setShared: (k, v) => {
      rt.shared.set(k, v);
      try { NetMP.setSharedNet(k, v); } catch (e) {}
    },
    
    netEvent: (toSlotOrName, type, payload) => {
      try { NetMP.sendEvent(toSlotOrName, type, payload || {}); } catch (e) {}
    },
    onNetEvent: (fn) => { if (typeof fn === 'function') NetMP.onEvent(fn); },
    
    getRemotePlayers: () => (NetMP.on && NetMP.remotes ? Array.from(NetMP.remotes.values()) : []),
    
    getAllPlayers: () => {
      const out = [];
      let myName = 'لاعب';
      if (NetMP.on) myName = NetMP.name || 'لاعب';
      else { try { const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null'); if (m && m.playerName) myName = m.playerName; } catch (_) {} }
      out.push({
        id: NetMP.on ? ('slot_' + NetMP.slot) : 'local',
        slot: NetMP.on ? NetMP.slot : 1,
        name: myName,
        username: myName,
        local: true,
        isHost: !!(NetMP.on && NetMP.isHost),
        mesh: (rt.rig && rt.rig.root) || null,
        position: rt.p ? { x: rt.p.x, y: rt.p.y, z: rt.p.z } : { x: 0, y: 0, z: 0 },
        avatar: null,
        state: (NetMP.playerState && NetMP.getPlayerState) ? Object.assign({}, NetMP.getPlayerState(NetMP.on ? NetMP.slot : 1)) : {},
        yaw: rt.ang || 0,
        velocity: rt.v ? { x: rt.v.x, y: rt.v.y, z: rt.v.z } : { x: 0, y: 0, z: 0 },
        locked: !!rt.locked,
        appearance: (typeof PCFG !== 'undefined') ? Object.assign({}, PCFG) : null
      });
      if (NetMP.on && NetMP.remotes) {
        for (const r of NetMP.remotes.values()) {
          if (!r) continue;
          const pos = (r.rig && r.rig.root && r.rig.root.position) || r.tp || { x: 0, y: 0, z: 0 };
          out.push({
            id: 'slot_' + r.slot,
            slot: r.slot,
            name: r.name || ('لاعب ' + r.slot),
            username: r.name || ('لاعب ' + r.slot),
            local: false,
            isHost: false,
            mesh: (r.rig && r.rig.root) || null,
            position: { x: pos.x || 0, y: pos.y || 0, z: pos.z || 0 },
            avatar: null,
            state: (NetMP.playerState && NetMP.getPlayerState) ? Object.assign({}, NetMP.getPlayerState(r.slot)) : {},
            yaw: r.ta || 0,
            velocity: { x: 0, y: 0, z: 0 },
            locked: false,
            appearance: r.appKey ? null : null
          });
        }
      }
      return out;
    },
    
    getRoster: () => {
      if (NetMP.on) {
        const list = [{ id: 'slot_' + NetMP.slot, name: NetMP.name || 'لاعب', slot: NetMP.slot, isHost: !!NetMP.isHost }];
        if (NetMP.remotes) {
          for (const r of NetMP.remotes.values()) {
            list.push({ id: 'slot_' + r.slot, name: r.name || ('لاعب ' + r.slot), slot: r.slot, isHost: false });
          }
        }
        return list;
      }
      try {
        const m = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null');
        if (m && Array.isArray(m.players) && m.players.length) {
          return m.players.map(p => ({ id: p.id || ('slot_' + p.slot), name: p.name || 'لاعب', slot: p.slot, isHost: !!p.host }));
        }
      } catch (_) {}
      return [{ id: 'local', name: 'لاعب', slot: 1, isHost: true }];
    },
    
    getPing: () => (NetMP.on ? (NetMP.pingMs != null ? NetMP.pingMs : null) : null),
    isNetworked: () => !!NetMP.on,
    isHost: () => !!(NetMP.on && NetMP.isHost),
    mySlot: () => (NetMP.on ? NetMP.slot : 1),

    /* —— تحكم مفتوح بأي لاعب (محلي / أونلاين) —— */
    resolvePlayerTarget(target) {
      if (target == null || target === 0 || target === 'me' || target === 'local') return NetMP.on ? NetMP.slot : 1;
      if (target === 'all' || target === '*') return '*';
      if (target === 'others') return 'others';
      if (typeof target === 'string' && target.startsWith('slot_')) return +target.slice(5);
      if (typeof target === 'string') {
        const all = G2.getAllPlayers();
        const hit = all.find(p => p.name === target || p.username === target || String(p.slot) === target);
        if (hit) return hit.slot;
      }
      return target;
    },
    controlPlayer(target, cmd) {
      if (!cmd || typeof cmd !== 'object') return false;
      const to = G2.resolvePlayerTarget(target);
      if (!NetMP.on) {
        // أوفلاين: طبّق محلياً دائماً
        try { NetMP._applyPlayerCmd(cmd, { from: 1, to: 1 }); } catch (_) {
          // NetMP قد يكون off — طبّق مباشرة على RT
          try {
            if (!RT) return false;
            if (cmd.pos) RT.p.set(+cmd.pos[0], +cmd.pos[1], +cmd.pos[2]);
            if (cmd.teleport) RT.p.set(+cmd.teleport[0], +cmd.teleport[1], +cmd.teleport[2]);
            if (cmd.yaw != null) RT.ang = +cmd.yaw;
            if (cmd.locked != null) RT.locked = !!cmd.locked;
            if (cmd.hold != null) RT.hold = !!cmd.hold;
            if (cmd.camera !== undefined) RT.cam = cmd.camera;
            if (cmd.appearance) Object.assign(PCFG, cmd.appearance);
          } catch (__) {}
        }
        return true;
      }
      return NetMP.sendPlayerCmd(to, cmd);
    },
    forEachPlayer(fn) {
      if (typeof fn !== 'function') return;
      for (const p of G2.getAllPlayers()) {
        try { fn(p); } catch (_) {}
      }
    },
    getPlayer(target) {
      const to = G2.resolvePlayerTarget(target);
      if (to === '*' || to === 'others') return G2.getAllPlayers();
      const all = G2.getAllPlayers();
      return all.find(p => +p.slot === +to) || null;
    },
    setPlayerAppearance(target, cfg) {
      if (!cfg || typeof cfg !== 'object') return false;
      return G2.controlPlayer(target, { appearance: cfg });
    },
    setPlayerState(target, key, val) {
      if (key != null && typeof key === 'object' && val === undefined) {
        return G2.controlPlayer(target, { state: key });
      }
      return G2.controlPlayer(target, { state: { [key]: val } });
    },
    getPlayerState(target, key) {
      const to = G2.resolvePlayerTarget(target);
      const slot = (to === '*' || to === 'others') ? (NetMP.on ? NetMP.slot : 1) : +to;
      const st = (NetMP.playerState && NetMP.getPlayerState) ? NetMP.getPlayerState(slot) : {};
      return key != null ? st[key] : st;
    },
    givePlayer(target, key, val) {
      // اسم ودّي لـ setPlayerState — سلاح، عنصر، قدرة، أي شيء
      return G2.setPlayerState(target, key, val);
    },
    setCinematic(cfg) {
      // كاميرا سينمائية محلية — يمكن أن تتبع لاعب
      // cfg: { mode:'follow'|'orbit'|'fixed'|'path', targetSlot|target, pos, lookAt, fov, duration, offset, yaw, pitch }
      if (!cfg) { rt.cam = null; return; }
      const c = Object.assign({}, cfg);
      if (c.target != null && c.targetSlot == null) {
        const t = G2.resolvePlayerTarget(c.target);
        if (t !== '*' && t !== 'others') c.targetSlot = +t;
      }
      if (c.targetSlot != null) {
        const p = G2.getPlayer(c.targetSlot);
        if (p && p.position) {
          if (!c.lookAt) c.lookAt = [p.position.x, p.position.y + 1.4, p.position.z];
          if (c.mode === 'follow' && !c.pos) {
            const off = c.offset || [0, 2.2, 4.5];
            c.pos = [p.position.x + off[0], p.position.y + off[1], p.position.z + off[2]];
          }
        }
      }
      rt.cam = c;
      return true;
    },
    clearCinematic() { rt.cam = null; },
    emitToPlayers(type, payload, to) {
      // رسالة حرّة لكل/بعض اللاعبين
      return G2.controlPlayer(to == null ? '*' : to, { state: { __evt: type, __payload: payload }, say: undefined });
    },
    onPlayerCmd(fn) {
      if (typeof fn === 'function') {
        try { NetMP.onPlayerCmd(fn); } catch (_) {}
      }
    },
    // اختصارات شائعة
    teleportAll(x, y, z, opt) { return G2.controlPlayer('*', Object.assign({ teleport: [x, y, z] }, opt || {})); },
    teleportOthers(x, y, z, opt) { return G2.controlPlayer('others', Object.assign({ teleport: [x, y, z] }, opt || {})); },
    lockAll(b) { return G2.controlPlayer('*', { locked: !!b }); },
    setAllAppearance(cfg) { return G2.controlPlayer('*', { appearance: cfg }); },

    hitWorld: (ox, oy, oz, dx, dy, dz, maxD) => {
      const len = Math.hypot(dx, dy, dz) || 1;
      const h = castRay(new T.Ray(new T.Vector3(ox, oy, oz), new T.Vector3(dx / len, dy / len, dz / len)));
      return (h && h.t >= 0 && h.t <= maxD) ? h.t : null;
    }
  };
  return G2;
}
function runBig(rt, o, root, code) {
  const base = root.children.slice();
  if (root.userData && root.userData.body) root.userData.body.visible = false;
  const body = root.userData.body;
  rt.bigs.push({o, m: root, base, body});
  try { const G = bigGame(rt, o, root); try { window.Game = G; } catch (_) {} sandboxRun(root, false, () => new Function('Game', 'root', code)(G, root)); }
  catch (e) { fail(o.name || 'script', e); }
}
function runScene(rt, s) {
  const root = new T.Group(); scene.add(root); rt.sceneRoots.push(root);
  try { if (!s.p) s.p = {}; const G = bigGame(rt, {name: s.name, p: s.p}, root); try { window.Game = G; } catch (_) {} new Function('Game', 'root', s.code)(G, root); }
  catch (e) { fail(s.name, e); }
}
function cleanBig(rt) {
  for (const b of rt.bigs) {
    try { if (b.m.userData.__tukCleanup) b.m.userData.__tukCleanup(); } catch (e) {}
    for (const c of b.m.children.slice()) if (!b.base.includes(c)) b.m.remove(c);
    if (b.body) b.body.visible = true;
  }
  for (const r of rt.sceneRoots) scene.remove(r);
  if (rt.sceneBase) for (const c of scene.children.slice()) if (!rt.sceneBase.has(c)) scene.remove(c);
}

const PREV = new Map();
let prevT = null;
function previewRt() { return {ups: [], inter: [], shared: new Map(), locks: new Set(), bigs: [], sceneRoots: [], rig: null, pl: null,
  p: new T.Vector3(), v: new T.Vector3(), ang: 0, locked: false, hold: false, animLock: false, cam: null, rs: [], hudScore: 0}; }
function removePreview(id) {
  const pv = PREV.get(id); if (!pv) return;
  PREV.delete(id);
  killMedia(pv.media);
  try { if (pv.m.userData.__tukCleanup) pv.m.userData.__tukCleanup(); } catch (e) {}
  for (const c of pv.m.children.slice()) if (!pv.base.includes(c)) pv.m.remove(c);
  if (pv.body) pv.body.visible = true;
  
  if (S.mode !== 'play') {
    try {
      document.querySelectorAll('[data-script-ui]').forEach(el => { try { el.remove(); } catch (_) {} });
    } catch (_) {}
  }
  S.dirty = 1;
}
function refreshPreview(o) {
  removePreview(o.id);
  if (S.mode !== 'build' || o.type !== 'sobj' || o.hidden) return;
  const d = defOf(o.def); if (!d || !isBig(d.code)) return;
  const m = MESH.get(o.id); if (!m) return;
  const base = m.children.slice(), body = m.userData.body;
  if (body) body.visible = false;
  const pvRec = {m, base, body, media: []};
  PREV.set(o.id, pvRec);
  try { pvRec.media = sandboxRun(m, true, () => new Function('Game', 'root', d.code)(bigGame(previewRt(), o, m), m)); }
  catch (e) { tip('⚠ ' + o.name + ': ' + (e && e.message || e)); }
  killMedia(pvRec.media); sweepScriptUI();
  S.dirty = 1;
}
function refreshPreviewsOf(defId) { invalidateGhostCache(defId); for (const o of S.objs) if (o.type === 'sobj' && o.def === defId) refreshPreview(o); GH.userData.contentKey = ''; }

const STEP_UP = .5, MAX_TILT = .5;
function surfaceY(rt, x, z, fromY, self, rise = 1.2) {
  let best = 0; const w = new T.Vector3(), q = new T.Vector3();
  const a = rt.hash.get(Math.floor(x / CELL) * 100003 + Math.floor(z / CELL));
  if (a) for (const b of a) {
    if (b.ramp) {
      q.set(x, fromY, z).applyMatrix4(b.inv);
      if (Math.abs(q.x) <= .5 && Math.abs(q.z) <= .5) { w.set(q.x, q.z, q.z).applyMatrix4(b.m); if (w.y <= fromY + rise && w.y > best) best = w.y; }
    } else if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.y1 <= fromY + rise && b.y1 > best) best = b.y1;
  }
  for (const b of rt.dyn) if (b.mesh !== self && x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.y1 <= fromY + rise && b.y1 > best) best = b.y1;
  return best;
}

function pushOut(rt, b, hx, hz) {
  const m = b.m, yaw = m.rotation.y, c = Math.cos(yaw), s = Math.sin(yaw), cy = b.gy != null ? b.gy : m.position.y;
  const top = cy + Math.max(1.4, (b.o.scl[1] || 1.5)), low = cy + STEP_UP, rad = Math.max(.3, hx), n = Math.max(2, Math.min(5, Math.round(hz * 2 / rad)));
  const L = [], seen = new Set();
  const px = m.position.x, pz = m.position.z, reach = hz + rad + 1;
  for (let x = Math.floor((px - reach) / CELL); x <= Math.floor((px + reach) / CELL); x++) for (let z = Math.floor((pz - reach) / CELL); z <= Math.floor((pz + reach) / CELL); z++) {
    const a = rt.hash.get(x * 100003 + z); if (a) for (const o of a) if (!seen.has(o)) { seen.add(o); if (!o.ramp && o.y1 > low && o.y0 < top) L.push(o); }
  }
  for (const o of rt.dyn) if (o.mesh !== m && !o.big && o.y1 > low && o.y0 < top) L.push(o);
  b.hitN = 0; if (!L.length) return;
  for (let it = 0; it < 3; it++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const lz = n === 1 ? 0 : -hz + (2 * hz) * i / (n - 1);
      const cx = m.position.x + lz * s, cz = m.position.z + lz * c;
      for (const o of L) {
        const qx = clamp(cx, o.x0, o.x1), qz = clamp(cz, o.z0, o.z1); let dx = cx - qx, dz = cz - qz, d = Math.hypot(dx, dz);
        if (d >= rad) continue;
        if (d < 1e-4) {   
          const l = cx - o.x0, r = o.x1 - cx, f = cz - o.z0, bk = o.z1 - cz, mn = Math.min(l, r, f, bk);
          dx = mn === l ? -1 : mn === r ? 1 : 0; dz = mn === f ? -1 : mn === bk ? 1 : 0; if (!dx && !dz) dz = 1; d = -mn;
        } else { dx /= d; dz /= d; }
        const pen = rad - d; m.position.x += dx * pen; m.position.z += dz * pen; b.hitN = Math.max(b.hitN, pen); b.hx = dx; b.hz = dz; moved = true;
      }
    }
    if (!moved) break;
  }
  if (b.hitN > .002) { const u = m.userData; u.engineHit = {nx: b.hx, nz: b.hz, pen: b.hitN, t: rt.t}; if (typeof u.onEngineHit === 'function') try { u.onEngineHit(u.engineHit); } catch (e) {} }
}
function groundFollow(rt, b, dt) {
  const o = b.o, m = b.m; if (!o.base) return;
  const yaw = m.rotation.y, hx = Math.max(.25, o.scl[0] / 2 * .85), hz = Math.max(.35, o.scl[2] / 2 * .85);
  if (b.gy == null) { b.gy = m.position.y; b.vy = 0; b.gp = 0; b.gr = 0; }
  pushOut(rt, b, hx, hz);
  const c = Math.cos(yaw), s = Math.sin(yaw), cy = b.gy;
  const pt = (lx, lz) => surfaceY(rt, m.position.x + lx * c + lz * s, m.position.z - lx * s + lz * c, cy, m, STEP_UP);
  const FL = pt(-hx, -hz), FR = pt(hx, -hz), BL = pt(-hx, hz), BR = pt(hx, hz), mid = pt(0, 0);
  const front = (FL + FR) / 2, back = (BL + BR) / 2, left = (FL + BL) / 2, right = (FR + BR) / 2;
  let pT = Math.atan2(front - back, 2 * hz), rT = Math.atan2(right - left, 2 * hx), tgtY = (FL + FR + BL + BR) / 4;
  
  if (Math.abs(pT) > MAX_TILT || Math.abs(rT) > MAX_TILT) { pT = 0; rT = 0; tgtY = Math.max(FL, FR, BL, BR, mid); }
  pT = clamp(pT, -MAX_TILT, MAX_TILT); rT = clamp(rT, -MAX_TILT, MAX_TILT);
  const k = Math.min(1, dt * 12);
  b.gp += (pT - b.gp) * k; b.gr += (rT - b.gr) * k;
  if (tgtY >= b.gy) { b.gy += (tgtY - b.gy) * Math.min(1, dt * 22); b.vy = 0; }
  else { b.vy = Math.max(-30, b.vy - 28 * dt); b.gy = Math.max(tgtY, b.gy + b.vy * dt); if (b.gy === tgtY) b.vy = 0; }
  m.position.y = b.gy;
  m.rotation.set(b.gp, yaw, b.gr, 'YXZ');
}

const NetMP = {
  on: false, role: 'off', code: null, slot: 1, isHost: false, name: 'لاعب',
  peer: null, conns: new Map(), remotes: new Map(), objs: new Map(), 
  acc: 0, ready: false, seq: 0,
  
  sendRate: 1 / 12, 
  initFromSession() {
    let meta = null;
    try { meta = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null'); } catch (e) {}
    if (!meta || meta.mode !== 'online') { this.on = false; return; }
    this.transport = meta.transport || 'peerjs';
    this.on = true; this.role = meta.isHost ? 'host' : 'guest';
    this.isHost = !!meta.isHost; this.code = meta.code ? String(meta.code).trim().toUpperCase() : 'CODES';
    this.slot = +meta.slot || 1; this.name = meta.playerName || 'لاعب';
    this.voice = meta.voice != null ? !!meta.voice : true;
    this.conns = new Map(); this.remotes = new Map(); this.objs = new Map();
    this.ready = false; this.acc = 0; this.seq = 0;
    this._dcMap = new Map();
    this.pingMs = null; this._pingAcc = 0; this._pingWait = null; this._roster = meta.players || [];
    
    const live = this._findCodesLive();
    if (live) {
      this._startLiveNet(live);
      return;
    }
    if (this.transport === 'codes') {
      this._startCodesLive();
    } else if (this.transport === 'lan') this._startLan();
    else {
      if (!meta.code) { this.on = false; return; }
      if (typeof Peer === 'undefined') { console.warn('PeerJS missing'); this.on = false; return; }
      this._startPeer();
    }
  },
  _startLiveNet(live) {
    const self = this;
    if (!live) return;
    this._codesNet = live;
    this.ready = true;
    this.on = true;
    
    const attachDc = (dc, fromId, slotHint) => {
      if (!dc || dc.__hawaNetBound) return;
      dc.__hawaNetBound = true;
      const prev = dc.onmessage;
      dc.onmessage = function (ev) {
        try { if (typeof prev === 'function') prev.call(dc, ev); } catch (_) {}
        try {
          let d = ev.data;
          if (typeof d === 'string') d = JSON.parse(d);
          if (!d || d.t === 'hello' || d.t === 'welcome' || d.t === 'lobby' || d.t === 'start' || d.t === 'full' || d.t === 'kick' || d.t === 'lock') return;
          self._onMsg(fromId || 'remote', d);
        } catch (_) {}
      };
      if (dc.readyState === 'open') self.ready = true;
      else try { dc.addEventListener('open', () => { self.ready = true; }); } catch (_) {}
      // انقطاع مفاجئ (قفل التبويب / انقطاع نت) بدون رسالة leave
      try {
        dc.addEventListener('close', () => {
          try {
            let removed = false;
            if (slotHint != null) {
              const r = self.remotes.get(+slotHint);
              if (r) {
                const nm = r.name || ('لاعب ' + slotHint);
                self._removeRemote(+slotHint);
                try { say('💀 غادر اللاعب «' + nm + '»', 3500); } catch (_) {}
                removed = true;
              }
            }
            if (!removed) {
              for (const [k, r] of self.remotes) {
                // آخر remote لو مفيش مطابقة — متلحقش الكل
                if (self.remotes.size === 1) {
                  const nm = r.name || ('لاعب ' + k);
                  self._removeRemote(k);
                  try { say('💀 غادر اللاعب «' + nm + '»', 3500); } catch (_) {}
                  break;
                }
              }
            }
          } catch (_) {}
        });
      } catch (_) {}
    };
    try {
      if (typeof live.forEachChannel === 'function') {
        live.forEachChannel((e, slot) => {
          if (e && e.dc) attachDc(e.dc, (e.remoteApi && e.remoteApi.id) || ('slot-' + slot), e.slot != null ? e.slot : slot);
        });
      } else if (live._dc) {
        attachDc(live._dc, 'remote');
      } else if (live._conn) {
        
        live._conn.on('data', (d) => {
          try {
            if (!d || d.t === 'hello' || d.t === 'welcome' || d.t === 'lobby' || d.t === 'start' || d.t === 'full') return;
            self._onMsg('host', d);
          } catch (_) {}
        });
      }
      if (live._conns) {
        for (const [pid, c] of live._conns) {
          try {
            c.on('data', (d) => {
              if (!d || d.t === 'hello' || d.t === 'welcome' || d.t === 'lobby' || d.t === 'start' || d.t === 'full') return;
              self._onMsg(pid, d);
            });
          } catch (_) {}
        }
      }
      
      live.onData = function (from, d) {
        try {
          if (!d || d.t === 'hello' || d.t === 'welcome' || d.t === 'lobby' || d.t === 'start' || d.t === 'full' || d.t === 'kick' || d.t === 'lock') return;
          self._onMsg(from || 'remote', d);
        } catch (e) { console.warn(e); }
      };
    } catch (err) { console.warn('live net bind', err); }
    const label = this.transport === 'codes' ? '🔑' : (this.transport === 'lan' ? '📡' : '🌐');
    say(label + ' أونلاين مباشر · سلوت ' + this.slot + (this.isHost ? ' · مضيف' : ' · ضيف'), 3000);
  },
  _findCodesLive() {
    try { if (window.__HAWA_LIVE_NET__) return window.__HAWA_LIVE_NET__; } catch (_) {}
    try { if (window.parent && window.parent !== window && window.parent.__HAWA_LIVE_NET__) return window.parent.__HAWA_LIVE_NET__; } catch (_) {}
    try { if (window.top && window.top.__HAWA_LIVE_NET__) return window.top.__HAWA_LIVE_NET__; } catch (_) {}
    try { if (window.opener && window.opener.__HAWA_LIVE_NET__) return window.opener.__HAWA_LIVE_NET__; } catch (_) {}
    return null;
  },
  _startCodesLive() {
    const self = this;
    let tries = 0;
    const bind = (live) => {
      if (!live) return false;
      this._codesNet = live;
      this.ready = true;
      this.on = true;
      try {
        const dc = live._dc;
        if (dc) {
          const prev = dc.onmessage;
          dc.onmessage = function (ev) {
            try { if (typeof prev === 'function') prev.call(dc, ev); } catch (_) {}
            try {
              let d = ev.data;
              if (typeof d === 'string') d = JSON.parse(d);
              if (!d || d.t === 'hello' || d.t === 'welcome' || d.t === 'lobby' || d.t === 'start' || d.t === 'full') return;
              self._onMsg('remote', d);
            } catch (_) {}
          };
          if (dc.readyState === 'open') self.ready = true;
          else dc.addEventListener('open', () => { self.ready = true; });
        }
      } catch (err) { console.warn(err); }
      say('🔑 أونلاين (تبادل أكواد) · سلوت ' + this.slot + (this.isHost ? ' · مضيف' : ' · ضيف'), 3000);
      return true;
    };
    if (bind(this._findCodesLive())) return;
    const poll = () => {
      tries++;
      if (bind(this._findCodesLive())) return;
      if (tries < 40) setTimeout(poll, 100);
      else {
        console.warn('codes: live net timeout');
        const fileProto = (typeof location !== 'undefined' && location.protocol === 'file:');
        say(fileProto
          ? '⚠ افتح عبر START_SERVER.bat (مش file://) — الأونلاين لا يعمل من الملفات مباشرة'
          : '⚠ فشل ربط شبكة تبادل الأكواد — اللعب محلي فقط', 6000);
        this.on = false;
        this.ready = false;
      }
    };
    setTimeout(poll, 50);
    try {
      window.addEventListener('message', (ev) => {
        if (ev && ev.data && ev.data.t === 'hawa_codes_net') bind(this._findCodesLive());
      });
    } catch (_) {}
  },
  async _startLan() {
    
    const self = this;
    const peerId = (this.isHost ? 'h-' : 'g-') + Math.random().toString(36).slice(2, 10);
    this._lanPeerId = peerId;
    this._lanPollAfter = 0;
    this._lanStopped = false;
    const code = this.code;
    try {
      if (this.isHost) {
        await fetch('/api/lan/rehost', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, name: 'play', hostName: this.name, peerId })
        });
      } else {
        await fetch('/api/lan/join', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, name: this.name, peerId })
        });
      }
    } catch (e) { console.warn('LAN rejoin', e); }
    this.ready = true;
    say('📡 LAN · سلوت ' + this.slot, 2000);
    
    const makePC = () => new RTCPeerConnection({ iceServers: [] });
    async function ensureOffer(remoteId) {
      if (self._dcMap.has(remoteId)) return;
      const pc = makePC();
      const dc = pc.createDataChannel('hawa', { ordered: true });
      self._dcMap.set(remoteId, { pc, dc });
      pc.onicecandidate = e => {
        if (!e.candidate) return;
        fetch('/api/lan/signal', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ code, from: peerId, to: remoteId, type: 'ice', candidate: e.candidate }) }).catch(()=>{});
      };
      dc.onmessage = ev => { try { self._onMsg(remoteId, JSON.parse(ev.data)); } catch(_){} };
      dc.onclose = () => self._dcMap.delete(remoteId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await fetch('/api/lan/signal', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ code, from: peerId, to: remoteId, type: 'offer', sdp: pc.localDescription }) });
      } catch (e) { console.warn(e); }
    }
    async function poll() {
      if (self._lanStopped || !self.on) return;
      try {
        const r = await fetch('/api/lan/signal/' + code + '?peer=' + encodeURIComponent(peerId) + '&after=' + self._lanPollAfter);
        const j = await r.json();
        if (j.serverTime) self._lanPollAfter = j.serverTime;
        if (self.isHost && j.players) {
          for (const p of j.players) if (p.id !== peerId) ensureOffer(p.id);
        }
        for (const s of (j.signals || [])) {
          if (s.from === peerId) continue;
          if (s.type === 'offer' && s.sdp) {
            let entry = self._dcMap.get(s.from);
            if (!entry) {
              const pc = makePC();
              entry = { pc, dc: null };
              self._dcMap.set(s.from, entry);
              pc.ondatachannel = ev => {
                entry.dc = ev.channel;
                entry.dc.onmessage = e2 => { try { self._onMsg(s.from, JSON.parse(e2.data)); } catch(_){} };
              };
              pc.onicecandidate = e => {
                if (!e.candidate) return;
                fetch('/api/lan/signal', { method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ code, from: peerId, to: s.from, type: 'ice', candidate: e.candidate }) }).catch(()=>{});
              };
            }
            try {
              await entry.pc.setRemoteDescription(s.sdp);
              const ans = await entry.pc.createAnswer();
              await entry.pc.setLocalDescription(ans);
              await fetch('/api/lan/signal', { method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ code, from: peerId, to: s.from, type: 'answer', sdp: entry.pc.localDescription }) });
            } catch (e) {}
          } else if (s.type === 'answer' && s.sdp) {
            const entry = self._dcMap.get(s.from);
            if (entry) try { await entry.pc.setRemoteDescription(s.sdp); } catch (_) {}
          } else if (s.type === 'ice' && s.candidate) {
            const entry = self._dcMap.get(s.from);
            if (entry) try { await entry.pc.addIceCandidate(s.candidate); } catch (_) {}
          }
        }
      } catch (e) {}
      if (!self._lanStopped) setTimeout(poll, 700);
    }
    poll();
  },
  _startPeer() {
    const self = this;
    try {
      this.peer = this.isHost ? new Peer(this.code, { debug: 0 }) : new Peer({ debug: 0 });
    } catch (e) { console.error(e); say('⚠ فشل الشبكة: ' + (e.message || e), 4000); return; }
    this.peer.on('open', id => {
      self.ready = true;
      if (self._pendingEvt && self._pendingEvt.length) {
        for (const m of self._pendingEvt) self.broadcast(m);
        self._pendingEvt = [];
      }
      if (!self.isHost) {
        const c = self.peer.connect(self.code, { reliable: true });
        self._bindConn(c);
        c.on('open', () => { c.send({ t: 'hello', slot: self.slot, name: self.name }); });
      } else say('🌐 المضيف جاهز · سلوت ' + self.slot, 2000);
    });
    this.peer.on('connection', c => {
      self._bindConn(c);
      c.on('open', () => { try { VoiceChat.onPeerConnected(c.peer); } catch(_){} });
    });
    this.peer.on('call', call => { try { VoiceChat._answerCall(call); } catch(_){} });
    this.peer.on('error', err => console.warn('Peer error', err));
  },
  _bindConn(c) {
    const self = this;
    c.on('open', () => { self.conns.set(c.peer, c); try { VoiceChat.onPeerConnected(c.peer); } catch(_){} });
    c.on('data', msg => self._onMsg(c.peer, msg));
    c.on('close', () => {
      self.conns.delete(c.peer);
      for (const [k, r] of self.remotes) {
        if (r.peerId === c.peer) {
          const nm = r.name || ('لاعب ' + k);
          self._removeRemote(k);
          try { say('💀 غادر اللاعب «' + nm + '»', 3500); } catch (_) {}
          break;
        }
      }
    });
  },
  _onMsg(from, msg) {
    if (!msg || !msg.t) return;
    if (this._handleNetMsg(from, msg)) return;
    if (msg.t === 'leave' || msg.t === 'bye') {
      const slot = +(msg.slot || 0);
      const nm = msg.name || (this.remotes.get(slot) && this.remotes.get(slot).name) || 'لاعب';
      if (slot && slot !== this.slot) this._removeRemote(slot);
      else {
        // بدون سلوت: ابحث بالـ peerId
        for (const [k, r] of this.remotes) {
          if (r.peerId === from || (msg.peerId && r.peerId === msg.peerId)) {
            this._removeRemote(k);
            break;
          }
        }
      }
      try { say('💀 غادر اللاعب «' + nm + '»', 3500); } catch (_) {}
      if (this.isHost) this._relay(from, msg);
      return;
    }
    if (msg.t === 'hello' && this.isHost) {
      const c = this.conns.get(from);
      if (c) try { c.send({ t: 'hi', slot: this.slot, name: this.name }); } catch (e) {}
      return;
    }
    if (msg.t === 'state') {
      this._applyState(from, msg);
      if (this.isHost) this._relay(from, msg);
    }
    if (msg.t === 'world' && Array.isArray(msg.objs)) {
      this._applyWorld(msg.objs);
      if (this.isHost) this._relay(from, msg);
    }
    if (msg.t === 'shared') {
      this._netShared.set(msg.k, msg.v);
      if (RT) RT.shared.set(msg.k, msg.v);
      if (this.isHost) this._relay(from, msg);
    }
    if (msg.t === 'evt') {
      this._handleEvt(msg);
      if (this.isHost) this._relay(from, msg);
    }
  },
  _relay(exceptPeer, msg) {
    
    for (const [id, c] of this.conns) {
      if (id === exceptPeer) continue;
      try { if (c.open) c.send(msg); } catch (e) {}
    }
    
    if (this.transport === 'codes' && this._codesNet) {
      try {
        if (typeof this._codesNet.forEachChannel === 'function') {
          this._codesNet.forEachChannel((e, slot) => {
            const rid = e.remoteApi && e.remoteApi.id;
            if (rid && rid === exceptPeer) return;
            try {
              if (e.dc && e.dc.readyState === 'open') e.dc.send(JSON.stringify(msg));
            } catch (_) {}
          });
        } else {
          this._codesNet.broadcast(msg);
        }
      } catch (e) {}
      return;
    }
    
    if (this.transport === 'lan' && this._dcMap) {
      for (const [id, e] of this._dcMap) {
        if (id === exceptPeer) continue;
        try {
          if (e.dc && e.dc.readyState === 'open') e.dc.send(JSON.stringify(msg));
        } catch (_) {}
      }
    }
    
    if (this._codesNet && this._codesNet.transport === 'peerjs' && this._codesNet._conns) {
      for (const [id, c] of this._codesNet._conns) {
        if (id === exceptPeer) continue;
        try { if (c && c.open) c.send(msg); } catch (_) {}
      }
    }
  },
  _ensureRemote(slot, name, peerId, app) {
    slot = +slot;
    if (slot === this.slot) return null;
    let r = this.remotes.get(slot);
    if (r) { if (name) r.name = name; r.peerId = peerId || r.peerId; return r; }
    const rig = makeRigWith(app);
    try { hardenPlayerRig(rig); } catch (_) {}
    scene.add(rig.root);
    r = {
      slot, name: name || ('لاعب ' + slot), peerId, rig,
      
      tp: new T.Vector3(), ta: 0, hasT: false,
      anim: { moving: false, run: false, air: false, ph: 0, sf: 0, hv: 0, vy: 0, turn: 0, fz: 0, fx: 0 },
      cape: null, 
      veh: null, 
      ride: false
    };
    this.remotes.set(slot, r);
    return r;
  },
  _removeRemote(slot) {
    const r = this.remotes.get(slot);
    if (!r) return;
    try { scene.remove(r.rig.root); } catch (e) {}
    this.remotes.delete(slot);
  },
  _applyState(from, msg) {
    const r = this._ensureRemote(msg.slot, msg.name, from, msg.app);
    if (!r || !RT) return;
    
    if (msg.app) {
      const key = JSON.stringify(msg.app);
      if (r.appKey !== key) {
        r.appKey = key;
        try { scene.remove(r.rig.root); } catch (e) {}
        r.rig = makeRigWith(msg.app);
        try { hardenPlayerRig(r.rig); } catch (_) {}
        scene.add(r.rig.root);
        if (r.cl) applyMats(r.rig.root, r.cl);
      }
    }
    if (msg.cl) { r.cl = msg.cl; applyMats(r.rig.root, msg.cl); }   
    if (msg.p && msg.p.length >= 3) {
      r.tp.set(msg.p[0], msg.p[1], msg.p[2]);
      r.ta = msg.ang != null ? msg.ang : (msg.yaw || 0);
      r.hasT = true;
    }
    r.anim = {
      moving: !!msg.moving, run: !!msg.run, air: !!msg.air,
      ph: msg.walk || 0, sf: msg.sf || 0, hv: msg.hv || 0,
      vy: msg.vy || 0, turn: msg.turn || 0, fz: msg.fz || 0, fx: msg.fx || 0, face: msg.face || null,
      funny: msg.funny || null
    };
    if (msg.cape && msg.cape.length) r.cape = msg.cape;
    
    if (msg.veh != null && msg.vp) {
      r.ride = true;
      r.veh = {
        id: msg.veh,
        x: msg.vp[0], y: msg.vp[1], z: msg.vp[2],
        yaw: msg.vyaw || 0,
        lean: msg.lean || 0,
        rx: msg.vrx || 0, rz: msg.vrz || 0,
        extras: msg.vextra || null
      };
      const m = MESH.get(msg.veh);
      if (m) {
        
        if (!m.userData.netSmooth) {
          m.userData.netSmooth = {
            tp: new T.Vector3(msg.vp[0], msg.vp[1], msg.vp[2]),
            tyaw: msg.vyaw || 0, tlean: msg.lean || 0, trx: msg.vrx || 0, trz: msg.vrz || 0
          };
        } else {
          const s = m.userData.netSmooth;
          s.tp.set(msg.vp[0], msg.vp[1], msg.vp[2]);
          s.tyaw = msg.vyaw || 0; s.tlean = msg.lean || 0; s.trx = msg.vrx || 0; s.trz = msg.vrz || 0;
        }
        m.userData.netDriver = msg.slot;
        m.matrixAutoUpdate = true;
      }
      
      r.rig.root.visible = true;
    } else {
      r.ride = false; r.veh = null;
      r.rig.root.visible = true;
    }
  },
  _applyWorld(list) {
    for (const o of list) {
      if (!o || o.id == null) continue;
      
      const m0 = MESH.get(o.id);
      if (m0 && m0.userData && m0.userData.netDriver === this.slot) continue;
      if (!this.objs.has(o.id)) {
        this.objs.set(o.id, { tp: new T.Vector3(), tyaw: 0, trx: 0, trz: 0, has: false });
      }
      const s = this.objs.get(o.id);
      s.tp.set(o.x, o.y, o.z);
      s.tyaw = o.yaw || 0; s.trx = o.rx || 0; s.trz = o.rz || 0; s.has = true;
      const m = MESH.get(o.id);
      if (m) {
        m.matrixAutoUpdate = true;
        if (o.extra) m.userData.netExtra = o.extra;
        if (o.driver != null) m.userData.netDriver = o.driver;
        if (o.cl && !this.isHost) applyMats(m, o.cl);
      }
    }
  },
  
  update(dt) {
    if (!this.on || !RT) return;
    const k = Math.min(1, dt * 14); 
    for (const r of this.remotes.values()) {
      if (r.hasT) {
        r.rig.root.position.lerp(r.tp, k);
        
        let da = r.ta - r.rig.root.rotation.y;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        r.rig.root.rotation.y += da * k;
      }
      const a = r.anim || {};
      try {
        
        if (!r._bodyChk || (performance.now() - r._bodyChk) > 2000) {
          r._bodyChk = performance.now();
          try {
            if (r.rig && r.rig.root) {
              r.rig.root.visible = true;
              if (r.rig.pelvis) r.rig.pelvis.visible = true;
              if (r.rig.L && r.rig.L.hip) r.rig.L.hip.visible = true;
              if (r.rig.R && r.rig.R.hip) r.rig.R.hip.visible = true;
            }
          } catch (_) {}
        }
        if (r.ride) {
          rigNeutral(r.rig);
          
          if (r.veh) {
            const m = MESH.get(r.veh.id);
            if (m) {
              r.rig.root.position.set(m.position.x, m.position.y + 0.55, m.position.z);
              r.rig.root.rotation.y = m.rotation.y;
            }
          }
        } else if (a.funny && typeof window.__HawaFunnyNetApply === 'function') {
          try { window.__HawaFunnyNetApply(r, a.funny, dt); } catch (e) {}
        } else {
          animRig(r.rig, dt, {
            moving: a.moving, run: a.run, air: a.air, ph: a.ph || 0,
            sf: a.sf || 0, hv: a.hv || 0, vy: a.vy || 0, turn: a.turn || 0,
            az: a.fz || 0, fz: a.fz || 0, fx: a.fx || 0, camRel: 0, camPitch: 0
          }, new Set());
        }
      } catch (e) {}
      
      if (!r.ride && a.face && r.rig.head) {
        const f = a.face, kk = Math.min(1, dt * 14);
        const vo = (f.vo || 0);
        const sh = (VOICE_CFG.headShakeEnabled !== false && VOICE_CFG.enabled !== false) ? vo * (+VOICE_CFG.headShake || 0.32) : 0;
        if (!r._voiceNod) r._voiceNod = { x: 0, z: 0 };
        const nodAmt = (+VOICE_CFG.nodAmount || 0.38);
        const nodSpd = (+VOICE_CFG.nodSpeed || 7.2);
        const baseHx = (f.hx || 0), baseHy = (f.hy || 0);
        if (sh > 0.0008) {
          const tt = performance.now() * 0.001;
          const intensity = Math.min(1.35, sh * 10);
          const nod = Math.sin(tt * nodSpd) * 0.7 + Math.sin(tt * nodSpd * 1.85 + 0.35) * 0.35
                    + Math.sin(tt * nodSpd * 0.55 + 1.1) * 0.18;
          const targetNod = nod * nodAmt * intensity;
          const side = Math.sin(tt * nodSpd * 2.4 + 0.6) * 0.22 + Math.sin(tt * nodSpd * 4.1) * 0.1;
          const targetSide = side * nodAmt * 0.55 * intensity;
          r._voiceNod.x = _lerp(r._voiceNod.x, targetNod, Math.min(1, dt * 14));
          r._voiceNod.z = _lerp(r._voiceNod.z, targetSide, Math.min(1, dt * 14));
        } else {
          r._voiceNod.x = _lerp(r._voiceNod.x, 0, Math.min(1, dt * 9));
          r._voiceNod.z = _lerp(r._voiceNod.z, 0, Math.min(1, dt * 9));
          if (Math.abs(r._voiceNod.x) < 0.001) r._voiceNod.x = 0;
          if (Math.abs(r._voiceNod.z) < 0.001) r._voiceNod.z = 0;
        }
        r.rig.head.rotation.y = _lerp(r.rig.head.rotation.y, baseHy, kk);
        r.rig.head.rotation.x = _lerp(r.rig.head.rotation.x, baseHx + r._voiceNod.x, kk);
        r.rig.head.rotation.z = _lerp(r.rig.head.rotation.z, r._voiceNod.z || 0, kk);
        if (r.rig.neck) {
          r.rig.neck.rotation.x = _lerp(r.rig.neck.rotation.x, r._voiceNod.x * 0.42, kk);
          r.rig.neck.rotation.y = _lerp(r.rig.neck.rotation.y, baseHy * 0.25, kk);
          r.rig.neck.rotation.z = _lerp(r.rig.neck.rotation.z, (r._voiceNod.z || 0) * 0.45, kk);
        }
        for (const e of (r.rig.eyes || [])) { e.rotation.y = _lerp(e.rotation.y, f.ey || 0, kk); e.rotation.x = _lerp(e.rotation.x, f.ex || 0, kk); }
        applyFace(r.rig, f, dt);
      }
      
      if (r.cape && r.rig.cape && r.rig.cape.length) {
        const n = Math.min(r.cape.length, r.rig.cape.length);
        for (let i = 0; i < n; i++) {
          const c = r.cape[i];
          if (!c) continue;
          r.rig.cape[i].rotation.x = c.a != null ? c.a : r.rig.cape[i].rotation.x;
          r.rig.cape[i].rotation.z = c.z != null ? c.z : r.rig.cape[i].rotation.z;
          if (c.y != null) r.rig.cape[i].rotation.y = c.y;
        }
      }
    }
    
    for (const [id, m] of MESH) {
      const s = m.userData && m.userData.netSmooth;
      if (!s) continue;
      
      if (m.userData.netDriver === this.slot) continue;
      m.position.lerp(s.tp, k);
      let dy = s.tyaw - m.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      m.rotation.y += dy * k;
      if (s.trx != null) m.rotation.x += (s.trx - m.rotation.x) * k;
      if (s.trz != null) m.rotation.z += (s.trz - m.rotation.z) * k;
      
      if (s.tlean) m.rotation.z += (s.tlean - (m.userData._lean || 0)) * k, m.userData._lean = (m.userData._lean || 0) + (s.tlean - (m.userData._lean || 0)) * k;
    }
    
    for (const [id, s] of this.objs) {
      if (!s.has) continue;
      const m = MESH.get(id);
      if (!m) continue;
      if (m.userData && m.userData.netDriver === this.slot) continue;
      m.position.lerp(s.tp, k);
      let dy = s.tyaw - m.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      m.rotation.y += dy * k;
      m.rotation.x += (s.trx - m.rotation.x) * k;
      m.rotation.z += (s.trz - m.rotation.z) * k;
    }
  },
  _collectVehicle() {
    const rt = RT;
    if (!(rt.hold || rt.animLock)) {
      for (const [id, m] of MESH) {
        if (m.userData && m.userData.netDriver === this.slot) m.userData.netDriver = null;
      }
      return null;
    }
    let best = rt.vehicleMesh || null;
    if (!best && rt.shared && rt.shared.get) best = rt.shared.get('vehicleMesh') || null;
    if (!best) {
      let bd = 5;
      for (const [id, m] of MESH) {
        const o = OBJ.get(id); if (!o || o.hidden) continue;
        if (!(o.type === 'sobj' || o.base || o.type === 'plat')) continue;
        const d = m.position.distanceTo(rt.p);
        if (d < bd) { bd = d; best = m; }
      }
    }
    if (!best) return null;
    best.userData.netDriver = this.slot;
    
    const extra = best.userData.netExtra || best.userData.bikeState || null;
    return {
      veh: best.userData.id,
      vp: [best.position.x, best.position.y, best.position.z],
      vyaw: best.rotation.y,
      vrx: best.rotation.x,
      vrz: best.rotation.z,
      lean: best.rotation.z,
      vextra: extra
    };
  },
  _rigCl() {
    const rig = RT && RT.rig; if (!rig) return null;
    const now = performance.now(); if (now - (this._clChk || 0) < 250) return null; this._clChk = now;
    const a = snapMats(rig.root), h = a.join(',');
    if (h !== this._clH || now - (this._clT || 0) > 2500) { this._clH = h; this._clT = now; return a; }
    return null;
  },
  _objCl(id, m) {
    const S = this._objClS || (this._objClS = new Map()); let st = S.get(id); const now = performance.now();
    if (!st) S.set(id, st = {h: '', t: 0, c: 0});
    if (now - st.c < 250) return null; st.c = now;
    const a = snapMats(m), h = a.join(',');
    if (h !== st.h || now - st.t > 3000) { st.h = h; st.t = now; return a; }
    return null;
  },
  _collectWorld() {
    
    const out = [];
    for (const [id, m] of MESH) {
      const o = OBJ.get(id);
      if (!o || o.hidden) continue;
      if (!(o.type === 'sobj' || o.base || o.type === 'plat' || (m.userData && m.userData.netSync))) continue;
      
      if (m.userData && m.userData.netDriver != null && m.userData.netDriver !== this.slot) continue;
      const ent = {
        id, x: m.position.x, y: m.position.y, z: m.position.z,
        yaw: m.rotation.y, rx: m.rotation.x, rz: m.rotation.z
      };
      if (this.isHost) { const cl = this._objCl(id, m); if (cl) ent.cl = cl; }   
      out.push(ent);
    }
    return out;
  },
  _capeState() {
    const rig = RT && RT.rig;
    if (!rig || !rig.cape) return null;
    const L = [];
    for (let i = 0; i < rig.cape.length; i++) {
      const c = rig.cape[i];
      L.push({ a: c.rotation.x, z: c.rotation.z, y: c.rotation.y });
    }
    return L;
  },
  tick(dt) {
    if (!this.on || !this.ready || !RT) return;
    this.update(dt); 
    
    this._pingAcc = (this._pingAcc || 0) + dt;
    if (this._pingAcc >= 2.0 && this._pingWait == null) {
      this._pingAcc = 0;
      this._pingWait = performance.now();
      try { this.broadcast({ t: 'ping', from: this.slot, ts: this._pingWait }); } catch (_) {}
    }
    try { this._updPingHud(); } catch (_) {}
    this.acc += dt;
    if (this.acc < this.sendRate) return;
    this.acc = 0;
    const rt = RT;
    const hv = Math.hypot(rt.v.x, rt.v.z);
    const veh = this._collectVehicle();
    const msg = {
      t: 'state',
      seq: ++this.seq,
      slot: this.slot,
      name: this.name,
      p: [rt.p.x, rt.p.y, rt.p.z],
      yaw: rt.yaw,
      ang: rt.ang,
      moving: hv > .3 && !(rt.hold || rt.animLock),
      run: !!(K.ShiftLeft || K.ShiftRight) && hv > .3,
      air: !rt.gr,
      walk: rt.walk || 0,
      hv, sf: Math.min(1, hv / 5.5),
      vy: rt.v.y,
      turn: rt.turnS || 0,
      fz: rt.fa || 0,
      fx: rt.la || 0,
      cape: this._capeState(),
      app: this._appearance(),
      cl: this._rigCl(),
      veh: null, vp: null, vyaw: null, vrx: null, vrz: null, lean: null, vextra: null, face: this._faceSnap(),
      funny: (typeof window.__HawaFunnyNetPack === 'function') ? window.__HawaFunnyNetPack() : null
    };
    if (veh) Object.assign(msg, veh);
    this.broadcast(msg);
    
    let world = this._collectWorld();
    
    if (this._objQueue && this._objQueue.size) {
      for (const o of this._objQueue.values()) world.push(o);
      this._objQueue.clear();
    }
    
    if (world.length) {
      const seen = new Set();
      world = world.filter(o => { if (seen.has(o.id)) return false; seen.add(o.id); return true; });
      this.broadcast({ t: 'world', objs: world, slot: this.slot });
    }
  },
  _appearance() {
    
    const o = {}; for (const x of Object.keys(PLAYER_DEF)) o[x] = PCFG[x] != null ? PCFG[x] : PLAYER_DEF[x];
    return o;
  },
  _faceSnap() {
    const r = RT && RT.rig; if (!r || !r.eyes || !r.st) return null;
    const f = r.fs || {}, q = v => Math.round((+v || 0) * 100) / 100, e = r.eyes[0];
    const bl = r.st.blinkT > 0 ? Math.sin((1 - r.st.blinkT / .15) * Math.PI) : 0;
    return {bl: q(bl), ey: q(e.rotation.y), ex: q(e.rotation.x), hy: q(r.head.rotation.y), hx: q(r.head.rotation.x), mo: q(f.mo), sm: q(f.sm), su: q(f.su), br: q(f.br), vo: q(f.vo != null ? f.vo : VoiceChat.level01())};
  },
  broadcast(msg) {
    if (!msg) return;
    
    if (this._codesNet && typeof this._codesNet.broadcast === 'function') {
      try { this._codesNet.broadcast(msg); } catch (_) {}
      
      if (this._codesNet.transport === 'peerjs' || this.transport === 'codes') return;
    }
    if (this.transport === 'lan' && this._dcMap) {
      for (const [id, e] of this._dcMap) {
        try {
          if (e.dc && e.dc.readyState === 'open') {
            if (e.dc.bufferedAmount > 512 * 1024) continue;
            e.dc.send(JSON.stringify(msg));
          }
        } catch (_) {}
      }
      return;
    }
    for (const [pid, c] of this.conns) {
      try {
        if (!c || !c.open) { this.conns.delete(pid); continue; }
        if (c.dataChannel && c.dataChannel.bufferedAmount > 512 * 1024) continue;
        c.send(msg);
      } catch (e) {}
    }
  },
  
  _objQueue: new Map(),
  _netShared: new Map(),
  _eventHandlers: [],
  queueObj(id, m) {
    if (!this.on) return;
    this._objQueue.set(id, {
      id,
      x: m.position.x, y: m.position.y, z: m.position.z,
      yaw: m.rotation.y, rx: m.rotation.x, rz: m.rotation.z,
      extra: m.userData.netExtra || m.userData.bikeState || null,
      driver: m.userData.netDriver != null ? m.userData.netDriver : null
    });
  },
  sharedHas(k) { return this._netShared.has(k) || (RT && RT.shared && RT.shared.has(k)); },
  sharedGet(k, d) {
    if (this._netShared.has(k)) return this._netShared.get(k);
    if (RT && RT.shared && RT.shared.has(k)) return RT.shared.get(k);
    return d;
  },
  setSharedNet(k, v) {
    this._netShared.set(k, v);
    if (RT) RT.shared.set(k, v);
    if (!this.on || !this.ready) return;
    this.broadcast({ t: 'shared', k: String(k), v: v, from: this.slot });
  },
  sendEvent(to, type, payload) {
    if (!this.on) return;
    const msg = { t: 'evt', to: to, type: type, payload: payload || {}, from: this.slot, fromName: this.name };
    
    if (!this.ready) {
      this._pendingEvt = this._pendingEvt || [];
      this._pendingEvt.push(msg);
      return;
    }
    this.broadcast(msg);
  },
  onEvent(fn) { this._eventHandlers.push(fn); },
  _handleNetMsg(from, msg) {
    if (!msg || !msg.t) return false;
    if (msg.t === 'ping') {
      try { this.broadcast({ t: 'pong', from: this.slot, to: msg.from, ts: msg.ts }); } catch (_) {}
      if (this.isHost) try { this._relay(from, msg); } catch (_) {}
      return true;
    }
    if (msg.t === 'pong') {
      if (this.isHost) try { this._relay(from, msg); } catch (_) {}
      if (msg.to != null && +msg.to !== +this.slot && String(msg.to) !== String(this.slot)) return true;
      if (msg.ts != null) {
        const rtt = performance.now() - msg.ts;
        if (rtt >= 0 && rtt < 30000) {
          this.pingMs = this.pingMs == null ? Math.round(rtt) : Math.round(this.pingMs * 0.6 + rtt * 0.4);
          this._pingWait = null;
        }
      }
      return true;
    }
    return false;
  },
  _updPingHud() {
    if (!this.on) {
      const el = document.getElementById('hawaPing');
      if (el) el.style.display = 'none';
      return;
    }
    let el = document.getElementById('hawaPing');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hawaPing';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:40;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:10px;background:rgba(10,8,15,.5);border:1px solid rgba(255,214,150,.12);backdrop-filter:blur(5px)';
      el.innerHTML = '<svg class="hp-wifi" viewBox="0 0 24 24" width="28" height="22" aria-hidden="true">'
        + '<path data-b="5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M3.2 9.2c5.2-4.4 12.4-4.4 17.6 0"/>'
        + '<path data-b="4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5.4 11.6c3.8-3.2 9.4-3.2 13.2 0"/>'
        + '<path data-b="3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M7.6 14c2.5-2.1 6.3-2.1 8.8 0"/>'
        + '<path data-b="2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M9.8 16.3c1.3-1.1 3.1-1.1 4.4 0"/>'
        + '<circle data-b="1" cx="12" cy="19" r="1.35" fill="currentColor"/>'
        + '</svg><span class="hp-ms" style="font:800 11px/1 Cairo,Tahoma,sans-serif;letter-spacing:.2px"></span>';
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
    const ms = this.pingMs;
    const num = el.querySelector('.hp-ms');
    // عدد القطع + اللون حسب البينج
    let bars = 0, color = 'rgba(160,160,170,.35)';
    if (ms == null) {
      bars = 0;
      color = 'rgba(180,180,190,.4)';
      if (num) num.textContent = '…';
    } else {
      if (num) num.textContent = String(Math.round(ms));
      if (ms <= 70) { bars = 5; color = '#22c55e'; }       // أخضر — 5
      else if (ms <= 110) { bars = 4; color = '#4ade80'; }  // أخضر فاتح — 4
      else if (ms <= 180) { bars = 3; color = '#f59e0b'; }  // برتقالي — 3
      else if (ms <= 280) { bars = 2; color = '#ef4444'; }  // أحمر — 2
      else { bars = 1; color = '#ef4444'; }                 // أحمر — 1
    }
    el.style.color = color;
    if (num) num.style.color = color;
    el.querySelectorAll('[data-b]').forEach(p => {
      const n = +p.getAttribute('data-b');
      const on = n <= bars;
      if (p.tagName === 'circle') {
        p.setAttribute('fill', on ? color : 'rgba(255,255,255,.12)');
        p.setAttribute('opacity', on ? '1' : '0.25');
      } else {
        p.setAttribute('stroke', on ? color : 'rgba(255,255,255,.12)');
        p.setAttribute('opacity', on ? '1' : '0.22');
      }
    });
  },

  /* —— أوامر تحكم اللاعبين (مفتوح بالكامل للسكربتات) —— */
  playerState: new Map(),
  _pcmdHandlers: [],
  onPlayerCmd(fn) { if (typeof fn === 'function') this._pcmdHandlers.push(fn); },
  getPlayerState(slot) {
    slot = +slot || this.slot;
    if (!this.playerState.has(slot)) this.playerState.set(slot, {});
    return this.playerState.get(slot);
  },
  setPlayerStateKey(slot, key, val) {
    const st = this.getPlayerState(slot);
    if (val === undefined) delete st[key];
    else st[key] = val;
    return st;
  },
  sendPlayerCmd(to, cmd, opt) {
    if (!cmd || typeof cmd !== 'object') return false;
    const msg = {
      t: 'pcmd',
      from: this.slot,
      fromName: this.name || 'لاعب',
      to: to == null ? '*' : to,
      cmd: cmd,
      ts: performance.now()
    };
    if (opt && opt.reliable) msg.reliable = 1;
    try { this.broadcast(msg); } catch (_) {}
    // طبّق محلياً لو الأمر موجه لينا أو للجميع
    try { this._handlePlayerCmd('local', msg); } catch (_) {}
    return true;
  },
  _targetMatches(to) {
    if (to == null || to === '*' || to === 'all') return true;
    if (to === 'others') return false; // others = everyone except sender — handled by caller
    if (to === 'me' || to === 'local') return true;
    if (+to === +this.slot) return true;
    if (String(to) === String(this.name)) return true;
    if (String(to) === ('slot_' + this.slot)) return true;
    return false;
  },
  _handlePlayerCmd(from, msg) {
    if (!msg || !msg.cmd) return;
    const to = msg.to;
    // others: everyone except the sender
    if (to === 'others') {
      if (+msg.from === +this.slot) return;
    } else if (!this._targetMatches(to)) {
      return;
    }
    try { this._applyPlayerCmd(msg.cmd, msg); } catch (e) { console.warn('pcmd', e); }
    for (const fn of this._pcmdHandlers) {
      try { fn(msg.cmd, msg); } catch (_) {}
    }
  },
  _applyPlayerCmd(cmd, meta) {
    if (!cmd || !RT) return;
    const rt = RT;
    // —— موضع / تيليبورت ——
    if (cmd.pos && Array.isArray(cmd.pos) && cmd.pos.length >= 3) {
      rt.p.set(+cmd.pos[0] || 0, +cmd.pos[1] || 0, +cmd.pos[2] || 0);
      rt.v.set(0, 0, 0);
    }
    if (cmd.teleport && Array.isArray(cmd.teleport) && cmd.teleport.length >= 3) {
      rt.p.set(+cmd.teleport[0] || 0, +cmd.teleport[1] || 0, +cmd.teleport[2] || 0);
      rt.v.set(0, 0, 0);
    }
    if (cmd.x != null && cmd.y != null && cmd.z != null) {
      rt.p.set(+cmd.x, +cmd.y, +cmd.z);
      rt.v.set(0, 0, 0);
    }
    if (cmd.yaw != null) rt.ang = +cmd.yaw;
    if (cmd.ang != null) rt.ang = +cmd.ang;
    if (cmd.pitch != null) rt.pitch = +cmd.pitch;
    if (cmd.velocity && Array.isArray(cmd.velocity)) {
      rt.v.set(+cmd.velocity[0] || 0, +cmd.velocity[1] || 0, +cmd.velocity[2] || 0);
    }
    if (cmd.locked != null) { rt.locked = !!cmd.locked; if (cmd.locked) rt.v.set(0, 0, 0); }
    if (cmd.hold != null) { rt.hold = !!cmd.hold; if (!cmd.hold) rt.v.set(0, 0, 0); }
    if (cmd.speedMul != null) rt.speedMul = +cmd.speedMul;
    if (cmd.animLock != null) rt.animLock = !!cmd.animLock;
    // —— مظهر / شخصية / لبس ——
    if (cmd.appearance && typeof cmd.appearance === 'object') {
      try {
        Object.assign(PCFG, cmd.appearance);
        if (rt.rig && rt.rig.root) {
          const parent = rt.rig.root.parent;
          const pos = rt.rig.root.position.clone();
          const sc = rt.rig.root.scale.clone();
          try { if (parent) parent.remove(rt.rig.root); else scene.remove(rt.rig.root); } catch (_) {}
          const newRig = makeRig();
          try { hardenPlayerRig(newRig); } catch (_) {}
          newRig.root.position.copy(pos);
          newRig.root.scale.copy(sc);
          if (parent) parent.add(newRig.root); else scene.add(newRig.root);
          rt.rig = newRig;
        }
      } catch (e) { console.warn('pcmd appearance', e); }
    }
    // —— مفاصل ——
    if (cmd.limbs && typeof cmd.limbs === 'object' && rt.rig) {
      for (const [name, rot] of Object.entries(cmd.limbs)) {
        const key = jkey(name);
        const j = key && jointOf(rt.rig, key);
        if (!j || !rot) continue;
        if (Array.isArray(rot)) j.rotation.set(+rot[0] || 0, +rot[1] || 0, +rot[2] || 0);
        else if (typeof rot === 'object') j.rotation.set(+rot.x || 0, +rot.y || 0, +rot.z || 0);
      }
    }
    // —— إدخال قسري ——
    if (cmd.input && typeof cmd.input === 'object') {
      try { applyInputMap(cmd.input); } catch (_) {}
    }
    // —— كاميرا سينمائية على جهاز اللاعب ——
    if (cmd.camera !== undefined) {
      if (cmd.camera === null) rt.cam = null;
      else if (typeof cmd.camera === 'object') rt.cam = Object.assign({}, cmd.camera);
    }
    // —— حالة حرّة (سلاح، حي، نقاط، أي شيء) ——
    if (cmd.state && typeof cmd.state === 'object') {
      const st = this.getPlayerState(this.slot);
      Object.assign(st, cmd.state);
    }
    if (cmd.prop != null && cmd.key != null) {
      this.setPlayerStateKey(this.slot, cmd.key, cmd.prop);
    }
    // —— رسالة HUD قصيرة ——
    if (cmd.say != null) {
      try { say(String(cmd.say), cmd.sayMs || 2500); } catch (_) {}
    }
    // —— أي مفاتيح إضافية تتخزن في الحالة ——
    for (const k of Object.keys(cmd)) {
      if (['pos','teleport','x','y','z','yaw','ang','pitch','velocity','locked','hold','speedMul','animLock','appearance','limbs','input','camera','state','prop','key','say','sayMs'].includes(k)) continue;
      this.setPlayerStateKey(this.slot, k, cmd[k]);
    }
  },
  _handleEvt(msg) {

    const to = msg.to;
    const mySlot = +this.slot;
    const myName = 'p' + mySlot + '_' + (this.name || 'player');
    let forMe = false;
    if (to === '*' || to === 'all' || to == null) forMe = true;
    else if (+to === mySlot) forMe = true;
    else if (String(to) === myName || String(to) === String(this.name)) forMe = true;
    else if (msg.payload && (+msg.payload.to === mySlot || msg.payload.to === myName)) forMe = true;
    if (!forMe) return;
    for (const fn of this._eventHandlers) {
      try { fn(msg.type, msg.payload || {}, msg.from, msg.fromName); } catch (e) { console.warn(e); }
    }
  },
  announceLeave() {
    if (!this.on) return;
    const msg = { t: 'leave', slot: this.slot, name: this.name || 'لاعب', peerId: this.code || null };
    try {
      // peerjs
      for (const [, c] of this.conns) {
        try { if (c && c.open) c.send(msg); } catch (_) {}
      }
      // codes
      if (this._codesNet) {
        try {
          if (typeof this._codesNet.broadcast === 'function') this._codesNet.broadcast(msg);
          else if (typeof this._codesNet.forEachChannel === 'function') {
            this._codesNet.forEachChannel((e) => {
              try { if (e.dc && e.dc.readyState === 'open') e.dc.send(JSON.stringify(msg)); } catch (_) {}
            });
          }
        } catch (_) {}
      }
      // lan
      if (this._dcMap) {
        for (const e of this._dcMap.values()) {
          try { if (e.dc && e.dc.readyState === 'open') e.dc.send(JSON.stringify(msg)); } catch (_) {}
        }
      }
    } catch (_) {}
  },
  stop() {
    try { this.announceLeave(); } catch (_) {}
    this._lanStopped = true;
    try { if (this.peer) this.peer.destroy(); } catch (e) {}
    if (this._dcMap) {
      for (const e of this._dcMap.values()) {
        try { if (e.dc) e.dc.close(); e.pc.close(); } catch (_) {}
      }
      this._dcMap.clear();
    }
    try {
      const live = this._codesNet || (typeof window !== 'undefined' && window.__HAWA_LIVE_NET__);
      if (live) {
        try { if (typeof live.destroy === 'function') live.destroy(); } catch (_) {}
        try {
          if (typeof live.forEachChannel === 'function') {
            live.forEachChannel((e) => {
              try { if (e.dc) e.dc.close(); } catch (_) {}
              try { if (e.pc) e.pc.close(); } catch (_) {}
            });
          }
        } catch (_) {}
        try { if (live._pc) live._pc.close(); } catch (_) {}
        try { if (live._dc) live._dc.close(); } catch (_) {}
      }
    } catch (_) {}
    for (const slot of [...this.remotes.keys()]) this._removeRemote(slot);
    this.conns.clear(); this.objs.clear();
    this._objQueue = new Map(); this._netShared = new Map(); this._eventHandlers = [];
    this.peer = null; this.on = false; this.ready = false;
    this._codesNet = null;
  }
};

function showEnginePlayLoad(ms) {
  return new Promise(resolve => {
    let el = document.getElementById('hawaEngineLoad');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hawaEngineLoad';
      el.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;background:radial-gradient(ellipse at 50% 28%,#1e1838 0%,#08060f 72%);color:#f4efe4;font-family:Cairo,Tahoma,sans-serif;opacity:0;transition:opacity .28s ease';
      el.innerHTML =
        '<div style="width:120px;height:120px;border-radius:50%;padding:3px;background:linear-gradient(135deg,#ffbe3d,#7ff0dc,#c4b5fd);box-shadow:0 0 40px rgba(255,190,61,.35)">' +
          '<div style="width:100%;height:100%;border-radius:50%;background:#0c0a14;display:flex;align-items:center;justify-content:center;overflow:hidden">' +
            '<img src="logo-256.png" alt="Hawa" style="width:100%;height:100%;object-fit:contain">' +
          '</div></div>' +
        '<div style="font-size:26px;font-weight:900;letter-spacing:.14em;background:linear-gradient(90deg,#ffe2a6,#7ff0dc,#c4b5fd);-webkit-background-clip:text;background-clip:text;color:transparent">HAWA ENGINE</div>' +
        '<div id="hawaEngineLoadTxt" style="opacity:.9;font-weight:700;font-size:14px">جاري تحميل اللعبة…</div>' +
        '<div style="width:min(280px,72vw);height:5px;border-radius:99px;background:#1e1a2e;overflow:hidden;border:1px solid #2a2438">' +
          '<div id="hawaEngineLoadBar" style="height:100%;width:0%;background:linear-gradient(90deg,#7ff0dc,#ffe2a6,#c4b5fd);transition:width .08s linear"></div>' +
        '</div>';
      document.body.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    } else {
      el.style.display = 'flex';
      el.style.opacity = '1';
    }
    const bar = document.getElementById('hawaEngineLoadBar');
    const txt = document.getElementById('hawaEngineLoadTxt');
    const dur = Math.max(900, +ms || 1600);
    const t0 = performance.now();
    const steps = ['جاري تحميل اللعبة…', 'تهيئة العالم…', 'تحضير اللاعب…', 'جاهز تقريباً…'];
    let raf = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      // ease-out cubic then hold near end
      const e = 1 - Math.pow(1 - k, 2.4);
      if (bar) bar.style.width = (Math.min(0.98, e) * 100).toFixed(1) + '%';
      if (txt) txt.textContent = steps[Math.min(steps.length - 1, Math.floor(k * steps.length))];
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        if (bar) bar.style.width = '100%';
        if (txt) txt.textContent = 'تم';
        setTimeout(() => {
          try {
            el.style.opacity = '0';
            setTimeout(() => {
              try { el.style.display = 'none'; el.remove(); } catch (_) {}
              resolve();
            }, 260);
          } catch (_) { resolve(); }
        }, 180);
      }
    };
    raf = requestAnimationFrame(tick);
  });
}


const OnlineMenu = {
  open: false,
  bound: false,
  ensure() {
    if (this.bound) return;
    this.bound = true;
    const menuBtn = document.getElementById('pMenuBtn');
    const menu = document.getElementById('pOnlineMenu');
    const close = document.getElementById('pMenuClose');
    const mute = document.getElementById('pMuteAll');
    const leave = document.getElementById('pLeaveOnline');
    const conf = document.getElementById('pOnlineConfirm');
    const leaveOk = document.getElementById('pLeaveOk');
    const leaveCancel = document.getElementById('pLeaveCancel');
    if (menuBtn) menuBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.toggle(); });
    if (close) close.addEventListener('click', e => { e.preventDefault(); this.hide(); });
    if (menu) menu.addEventListener('click', e => { if (e.target === menu) this.hide(); });
    if (mute) mute.addEventListener('click', e => {
      e.preventDefault();
      const on = VoiceChat.toggleMuteAll();
      mute.classList.toggle('active', on);
      const lbl = document.getElementById('pMuteAllLbl');
      if (lbl) lbl.textContent = on ? 'إلغاء كتم أصوات اللاعبين' : 'كتم أصوات جميع اللاعبين';
      try { say(on ? '🔇 تم كتم أصوات الجميع' : '🔊 تم إلغاء الكتم', 1800); } catch (_) {}
    });
    if (leave) leave.addEventListener('click', e => {
      e.preventDefault();
      this.hide();
      if (conf) { conf.classList.add('on'); conf.setAttribute('aria-hidden', 'false'); }
    });
    if (leaveCancel) leaveCancel.addEventListener('click', e => {
      e.preventDefault();
      if (conf) { conf.classList.remove('on'); conf.setAttribute('aria-hidden', 'true'); }
    });
    if (conf) conf.addEventListener('click', e => {
      if (e.target === conf) { conf.classList.remove('on'); conf.setAttribute('aria-hidden', 'true'); }
    });
    if (leaveOk) leaveOk.addEventListener('click', e => {
      e.preventDefault();
      this.leaveToHome();
    });
    // إغلاق الصفحة / Alt+F4
    if (!window.__hawaLeaveBound) {
      window.__hawaLeaveBound = true;
      const bye = () => {
        try { if (NetMP && NetMP.on) NetMP.announceLeave(); } catch (_) {}
        try { if (NetMP && NetMP.on) NetMP.stop(); } catch (_) {}
      };
      window.addEventListener('pagehide', bye);
      window.addEventListener('beforeunload', bye);
    }
  },
  show() {
    this.ensure();
    const menu = document.getElementById('pOnlineMenu');
    if (menu) { menu.classList.add('on'); menu.setAttribute('aria-hidden', 'false'); }
    this.open = true;
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (_) {}
  },
  hide() {
    const menu = document.getElementById('pOnlineMenu');
    if (menu) { menu.classList.remove('on'); menu.setAttribute('aria-hidden', 'true'); }
    const conf = document.getElementById('pOnlineConfirm');
    if (conf) { conf.classList.remove('on'); conf.setAttribute('aria-hidden', 'true'); }
    this.open = false;
  },
  toggle() { if (this.open) this.hide(); else this.show(); },
  leaveToHome() {
    try { NetMP.announceLeave(); } catch (_) {}
    try { NetMP.stop(); } catch (_) {}
    try { VoiceChat.destroy(); } catch (_) {}
    try {
      sessionStorage.removeItem('hawa_play_meta');
      sessionStorage.removeItem('hawa_play');
    } catch (_) {}
    // لو جوا iframe (تبادل أكواد): رجّع الأب للرئيسية
    try {
      if (window.parent && window.parent !== window) {
        window.parent.location.href = 'index.html';
        return;
      }
    } catch (_) {}
    try { location.href = 'index.html'; } catch (_) {}
  },
  setupOnlineChrome() {
    this.ensure();
    try { document.body.classList.add('online-play'); } catch (_) {}
    const bar = document.getElementById('pOnlineBar');
    if (bar) bar.classList.add('show');
    const home = document.getElementById('playHome');
    if (home) home.style.display = 'none';
    const top = document.getElementById('pTop');
    if (top) top.style.display = 'none';
    // المايك داخل الشريط
    const mic = document.getElementById('pMic');
    if (mic) {
      mic.classList.add('online-compact', 'show');
      mic.style.display = 'flex';
      if (bar && mic.parentElement !== bar) bar.appendChild(mic);
    }
  }
};

async function playStart() {
  try {
  // إخفاء طبقة البناء فوراً عشان متظهرش ومضة قبل اللعب
  try {
    const app = document.getElementById('app');
    if (app) { app.style.display = 'none'; app.setAttribute('hidden', ''); }
    document.body.classList.add('play-on', 'pure-play');
  } catch (_) {}
  // شاشة تحميل واضحة (حتى من game.html) — مدة كافية عشان متتفوتش
  try { await showEnginePlayLoad(window.HAWA_PLAY_ONLY ? 1800 : 1400); } catch (_) {}
  try {
    const el = document.getElementById('hawaEngineLoad');
    if (el) { el.style.display = 'none'; try { el.remove(); } catch (_) {} }
  } catch (_) {}
  try { MOB.closeSheets(); MOB.setPlay(true); } catch (_) {}
  for (const id of [...PREV.keys()]) removePreview(id);
  try { S._buildCam = getBuilderCam(); } catch (_) { S._buildCam = null; }
  
  try {
    S._playBackup = {
      objs: JSON.parse(JSON.stringify(S.objs)),
      nid: S.nid,
      scripts: JSON.parse(JSON.stringify(S.scripts || [])),
      sdefs: JSON.parse(JSON.stringify(S.sdefs || [])),
      sid: S.sid,
      did: S.did
    };
  } catch (_) { S._playBackup = null; }
  sel(null); S.mode = 'play'; syncMarks(); S.err = []; S.fly = false; updModes();
  const playEl = document.getElementById('play');
  const appEl = document.getElementById('app');
  if (playEl) { playEl.hidden = false; playEl.style.display = ''; }
  if (appEl) { appEl.hidden = true; }
  try { attach(pvp); } catch (e) { console.warn(e); }
  
  
  (function(){
    let online = false, voiceOn = false;
    try {
      const meta = JSON.parse(sessionStorage.getItem('hawa_play_meta') || 'null');
      if (meta && meta.mode === 'online') online = true;
      
      if (online) voiceOn = (meta && meta.voice != null) ? !!meta.voice : true;
    } catch (_) {}
    
    const purePlay = !!window.HAWA_PLAY_ONLY;
    const top = document.getElementById('pTop');
    if (top) top.style.display = (online || purePlay) ? 'none' : '';
    const help = document.getElementById('pHelp');
    
    if (help) {
      help.hidden = true;
      help.innerHTML = '';
    }
    try {
      if (online) {
        try { OnlineMenu.setupOnlineChrome(); } catch (e) { console.warn(e); }
        if (voiceOn) {
          VoiceChat.ensureBtn();
          const b = document.getElementById('pMic');
          if (b) {
            b.classList.add('online-compact', 'show');
            b.style.display = 'flex'; b.style.visibility = 'visible'; b.style.opacity = '1';
            const bar = document.getElementById('pOnlineBar');
            if (bar && b.parentElement !== bar) bar.appendChild(b);
          }
          try { VoiceChat._startListenLoop(); } catch (_) {}
          try {
            const unlockOnce = () => {
              try { VoiceChat._unlock && VoiceChat._unlock(); } catch (_) {}
              try { VoiceChat._ensureListenAll && VoiceChat._ensureListenAll(); } catch (_) {}
            };
            addEventListener('pointerdown', unlockOnce, { once: false, passive: true });
            addEventListener('keydown', unlockOnce, { once: false, passive: true });
          } catch (_) {}
          try { say('تم تفعيل الاستماع', 1800); } catch (_) {}
        }
      } else {
        try { document.body.classList.remove('online-play'); } catch (_) {}
        try { VoiceChat.off(); } catch (_) {}
        const b = document.getElementById('pMic');
        if (b) b.style.display = 'none';
        const bar = document.getElementById('pOnlineBar');
        if (bar) bar.classList.remove('show');
      }
    } catch (e) { console.warn(e); }
  })();
  $('#pMsg').hidden = true; $('#pPrompt').hidden = true;
  grid.visible = false; gizmo.visible = false; GH.visible = false; selHelper();
  const rt = RT = {t: 0, score: 0, msg: '', msgT: 0, inst: [], dyn: [], trig: [], coins: [], plats: [], hooks: [], rs: [], hash: new Map(),
    stamp: 0, p: new T.Vector3(), v: new T.Vector3(), gnd: null, gr: false, yaw: Math.PI, pitch: .35, dist: 8, ang: 0, walk: 0, cd: 0, cur: null,
    byName: new Map(), hud: '', rig: null, pl: null, ups: [], bigs: [], scriptSpawn: null, sceneRoots: [], inter: [], shared: new Map(), locks: new Set(),
    hold: false, locked: false, animLock: false, cam: null, camS: null, fPrev: false, prompt: ''};
  const groups = {};
  for (const o of S.objs) {
    const m = MESH.get(o.id), sc = o.scripts.length > 0 || o.type === 'sobj' || globalRefs().has(o.id);
    if (o.hidden) { m.visible = false; continue; }
    if (o.type === 'respawn' || o.type === 'online_spawn') { m.visible = false; if (o.type === 'respawn') rt.rs.push(o); continue; }
    if (o.type === 'light') continue;
    m.matrixAutoUpdate = true;
    if (o.type === 'coin') { rt.coins.push({o, m}); continue; }
    if (o.type === 'pad' || o.type === 'kill') { const b = aabb(m); b.o = o; b.kind = o.type; rt.trig.push(b); continue; }
    if (o.type === 'plat' || sc) {
      if (o.type === 'plat') rt.plats.push({o, m});
      if (o.solid && o.type !== 'ramp') { const big = o.type === 'sobj' && o.base; const b = big ? aabbBox(m) : aabb(m); b.mesh = m; b.dyn = 1; b.big = big; rt.dyn.push(b); }
      continue;
    }
    m.matrixAutoUpdate = false; (groups[o.type] = groups[o.type] || []).push({o, m}); m.visible = false;
    if (o.solid) { const b = aabb(m); if (o.type === 'ramp') { b.ramp = 1; b.m = m.matrix.clone(); b.inv = m.matrix.clone().invert(); } hadd(b); }
  }
  const col = new T.Color();
  for (const t in groups) {
    const L = groups[t], im = new T.InstancedMesh(G[DEF[t].g], INST, L.length);
    L.forEach((x, i) => { im.setMatrixAt(i, x.m.matrix); im.setColorAt(i, col.set(x.o.color)); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    scene.add(im); rt.inst.push(im);
  }
  rt.rig = makeRig(); try { hardenPlayerRig(rt.rig); } catch(_){} scene.add(rt.rig.root);
  rt.pl = {position: rt.p, velocity: rt.v, get grounded() { return rt.gr; }, mesh: rt.rig.root};
  rt.cur = rt.rs[0] || null; respawnP();
  
  try {
    NetMP.initFromSession();
    const placeOnline = () => {
      if (!NetMP.on) return;
      // رتب نقاط الأونلاين حسب رقم السلوت — كل لاعب على نقطته، مش نفس النقطة
      const sp = S.objs.filter(o => o.type === 'online_spawn')
        .slice()
        .sort((a, b) => (+((a.p && a.p.slot) || 0)) - (+((b.p && b.p.slot) || 0)));
      let mine = sp.find(o => +((o.p && o.p.slot) || 0) === +NetMP.slot);
      if (!mine && sp.length) {
        // لو مفيش نقطة بنفس رقم السلوت: وزّع حسب ترتيب السلوت (فريد لكل لاعب)
        const idx = Math.max(0, (+NetMP.slot || 1) - 1) % sp.length;
        mine = sp[idx];
      }
      if (mine) {
        rt.p.set(mine.pos[0], mine.pos[1] + .02, mine.pos[2]);
        rt.v.set(0, 0, 0);
        rt.cur = mine;
      }
      say((NetMP.transport === 'codes' ? '🔑' : '🌐') + ' أونلاين · سلوت ' + NetMP.slot + ' · ' + (NetMP.isHost ? 'مضيف' : 'ضيف'), 2500);
    };
    placeOnline();
    
    if (NetMP.transport === 'codes') {
      let n = 0;
      const wait = () => {
        n++;
        if (NetMP.on && NetMP._codesNet) { placeOnline(); return; }
        if (n < 50) setTimeout(wait, 100);
      };
      setTimeout(wait, 120);
    }
  } catch (e) { console.error(e); }
  const game = {
    THREE: T, scene, camera: cam, renderer: R,
    get time() { return rt.t; }, get score() { return rt.score; }, addScore: n => rt.score += n, say, respawn: respawnP,
    key: c => keyDown(c),
    setKey(code, down) { setVirtualKey(code, !!down); },
    forcePlayerInput(slot, inp) { applyInputMap(inp); },
    touch: TouchUI.api(),
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
    
    setHud(html) {
      if (S.mode !== 'play') return;
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
      level: () => VoiceChat.level01(),
      // مايك مرتبط باللاعب (سلوت / اسم / peerId) — مش مايك عام
      listPlayers: () => VoiceChat.listPlayers(),
      getPlayer: (who) => VoiceChat.getPlayer(who),
      setVolume: (who, vol) => VoiceChat.setVolume(who, vol),
      mutePlayer: (who, on) => VoiceChat.mutePlayer(who, on),
      setSpatial: (on) => VoiceChat.setSpatial(on),
      spatial: () => !!VoiceChat.spatial,
      // وصول مفتوح مالانهاية: stream / nodes / context لأي ظرف تبنيه في السكربت
      getStream: (who) => VoiceChat.getStream(who),
      getAudioElement: (who) => VoiceChat.getAudioElement(who),
      getNodes: (who) => VoiceChat.getNodes(who),
      getContext: () => VoiceChat.getContext(),
      getLocalStream: () => VoiceChat.getLocalStream(),
      getAllEntries: () => VoiceChat.getAllEntries(),
      pipe: (who, fn) => VoiceChat.pipe(who, fn)
    },
    clearHud() { const el = document.getElementById('hawaScriptHud'); if (el) { el.innerHTML = ''; el.style.display = 'none'; } },
    get allowScriptSpawn() { return true; },
    setScriptSpawn(x, y, z) {
      if (!S.allowScriptSpawn || !RT) return false;
      RT.scriptSpawn = { x: +x || 0, y: +y || 0, z: +z || 0 };
      return true;
    },
    clearScriptSpawn() { if (RT) RT.scriptSpawn = null; },
    
    setCameraDist(d) { if (RT) RT.dist = clamp(+d || 5, 2, 25); },
    setCameraOffset(x, y, z) { if (RT) { RT.off = RT.off || new T.Vector3(); RT.off.set(x || 0, y || 0, z || 0); } },
    setFog(color, near, far) { scene.fog = new T.Fog(color || 0x87ceeb, near || 20, far || 180); },
    clearFog() { scene.fog = null; },
    setSky(color) { scene.background = new T.Color(color || 0x87ceeb); },
    setAmbient(intensity, color) {  },
    setSun(intensity, color) {  },

    /* —— تحكم مفتوح باللاعبين (أونلاين/أوفلاين) —— */
    isNetworked: () => !!NetMP.on,
    isHost: () => !!(NetMP.on && NetMP.isHost),
    mySlot: () => (NetMP.on ? NetMP.slot : 1),
    getMyName: () => (NetMP.on ? (NetMP.name || 'لاعب') : 'لاعب'),
    getRemotePlayers: () => (NetMP.on && NetMP.remotes ? Array.from(NetMP.remotes.values()) : []),
    getAllPlayers() {
      const out = [];
      const mySlot = NetMP.on ? NetMP.slot : 1;
      const myName = NetMP.on ? (NetMP.name || 'لاعب') : 'لاعب';
      out.push({
        id: 'slot_' + mySlot, slot: mySlot, name: myName, username: myName, local: true,
        isHost: !!(NetMP.on && NetMP.isHost),
        mesh: rt.rig && rt.rig.root, position: { x: rt.p.x, y: rt.p.y, z: rt.p.z },
        yaw: rt.ang || 0, locked: !!rt.locked,
        state: (NetMP.getPlayerState ? Object.assign({}, NetMP.getPlayerState(mySlot)) : {}),
        appearance: (typeof PCFG !== 'undefined') ? Object.assign({}, PCFG) : null
      });
      if (NetMP.on && NetMP.remotes) {
        for (const r of NetMP.remotes.values()) {
          if (!r) continue;
          const pos = (r.rig && r.rig.root && r.rig.root.position) || r.tp || { x: 0, y: 0, z: 0 };
          out.push({
            id: 'slot_' + r.slot, slot: r.slot, name: r.name || ('لاعب ' + r.slot), username: r.name || ('لاعب ' + r.slot),
            local: false, isHost: false, mesh: r.rig && r.rig.root,
            position: { x: pos.x || 0, y: pos.y || 0, z: pos.z || 0 },
            yaw: r.ta || 0, locked: false,
            state: (NetMP.getPlayerState ? Object.assign({}, NetMP.getPlayerState(r.slot)) : {})
          });
        }
      }
      return out;
    },
    getPlayer(target) {
      const all = game.getAllPlayers();
      if (target == null || target === 'me' || target === 0) return all.find(p => p.local) || all[0];
      if (target === 'all' || target === '*') return all;
      return all.find(p => +p.slot === +target || p.name === target || p.id === target) || null;
    },
    forEachPlayer(fn) { if (typeof fn === 'function') game.getAllPlayers().forEach(p => { try { fn(p); } catch (_) {} }); },
    controlPlayer(target, cmd) {
      if (!cmd || typeof cmd !== 'object') return false;
      let to = target;
      if (to == null || to === 0 || to === 'me' || to === 'local') to = NetMP.on ? NetMP.slot : 1;
      if (!NetMP.on) {
        try {
          if (cmd.pos) rt.p.set(+cmd.pos[0], +cmd.pos[1], +cmd.pos[2]);
          if (cmd.teleport) rt.p.set(+cmd.teleport[0], +cmd.teleport[1], +cmd.teleport[2]);
          if (cmd.x != null) rt.p.set(+cmd.x, +cmd.y, +cmd.z);
          if (cmd.yaw != null) rt.ang = +cmd.yaw;
          if (cmd.locked != null) rt.locked = !!cmd.locked;
          if (cmd.hold != null) rt.hold = !!cmd.hold;
          if (cmd.speedMul != null) rt.speedMul = +cmd.speedMul;
          if (cmd.camera !== undefined) rt.cam = cmd.camera;
          if (cmd.appearance) Object.assign(PCFG, cmd.appearance);
          if (cmd.state && NetMP.setPlayerStateKey) {
            for (const [k, v] of Object.entries(cmd.state)) NetMP.setPlayerStateKey(1, k, v);
          }
          if (cmd.input) try { applyInputMap(cmd.input); } catch (_) {}
        } catch (_) {}
        return true;
      }
      return NetMP.sendPlayerCmd(to, cmd);
    },
    teleportPlayer(target, x, y, z, opt) {
      const cmd = { teleport: [x, y, z] };
      if (opt) Object.assign(cmd, opt);
      return game.controlPlayer(target, cmd);
    },
    teleportAll(x, y, z, opt) { return game.controlPlayer('*', Object.assign({ teleport: [x, y, z] }, opt || {})); },
    teleportOthers(x, y, z, opt) { return game.controlPlayer('others', Object.assign({ teleport: [x, y, z] }, opt || {})); },
    setPlayerAppearance(target, cfg) { return game.controlPlayer(target, { appearance: cfg }); },
    setPlayerState(target, key, val) {
      if (key != null && typeof key === 'object' && val === undefined) return game.controlPlayer(target, { state: key });
      return game.controlPlayer(target, { state: { [key]: val } });
    },
    getPlayerState(target, key) {
      const p = game.getPlayer(target);
      const slot = p && p.slot != null ? p.slot : (NetMP.on ? NetMP.slot : 1);
      const st = NetMP.getPlayerState ? NetMP.getPlayerState(slot) : {};
      return key != null ? st[key] : st;
    },
    givePlayer(target, key, val) { return game.setPlayerState(target, key, val); },
    lockPlayer(target, b) { return game.controlPlayer(target, { locked: !!b }); },
    lockAll(b) { return game.controlPlayer('*', { locked: !!b }); },
    setCinematic(cfg) {
      if (!cfg) { if (RT) RT.cam = null; return; }
      const c = Object.assign({}, cfg);
      if (c.target != null && c.targetSlot == null) {
        const p = game.getPlayer(c.target);
        if (p) c.targetSlot = p.slot;
      }
      if (c.targetSlot != null) {
        const p = game.getPlayer(c.targetSlot);
        if (p && p.position) {
          if (!c.lookAt) c.lookAt = [p.position.x, p.position.y + 1.4, p.position.z];
          if (c.mode === 'follow' && !c.pos) {
            const off = c.offset || [0, 2.2, 4.5];
            c.pos = [p.position.x + off[0], p.position.y + off[1], p.position.z + off[2]];
          }
        }
      }
      if (RT) RT.cam = c;
      return true;
    },
    clearCinematic() { if (RT) RT.cam = null; },
    setCamera(cfg) { if (RT) RT.cam = cfg || null; },
    clearCamera() { if (RT) RT.cam = null; },
    getShared: (k, d) => (RT && RT.shared && RT.shared.has(k) ? RT.shared.get(k) : (NetMP._netShared && NetMP._netShared.has(k) ? NetMP._netShared.get(k) : d)),
    setShared: (k, v) => { try { if (RT) RT.shared.set(k, v); NetMP.setSharedNet(k, v); } catch (_) {} },
    netEvent: (to, type, payload) => { try { NetMP.sendEvent(to, type, payload || {}); } catch (_) {} },
    onNetEvent: (fn) => { try { NetMP.onEvent(fn); } catch (_) {} },
    onPlayerCmd: (fn) => { try { NetMP.onPlayerCmd(fn); } catch (_) {} }
  };
  rt.game = game;
  for (const o of S.objs) {
    const m = MESH.get(o.id); if (o.type === 'respawn' || o.hidden) continue;
    rt.byName.set(o.name, {name: o.name, props: resolvedParams(o.p), mesh: m, object: o, position: m.position, rotation: m.rotation, scale: m.scale,
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
  rt.sceneBase = new Set(scene.children);
  
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
  } catch (err) {
    // لو فشل الاختبار (سكربت غلط / خطأ شبكة) — ارجع للبناء بدل شاشة سوداء
    console.error('[playStart]', err);
    try {
      const el = document.getElementById('hawaEngineLoad');
      if (el) { el.style.display = 'none'; try { el.remove(); } catch (_) {} }
    } catch (_) {}
    try {
      S.mode = 'build';
      const playEl = document.getElementById('play');
      const app = document.getElementById('app');
      if (playEl) { playEl.hidden = true; playEl.style.display = 'none'; }
      if (app) {
        app.hidden = false;
        app.removeAttribute('hidden');
        app.style.display = '';
        app.style.visibility = '';
      }
      document.body.classList.remove('play-on', 'pure-play', 'online-play');
      try { attach(vp); } catch (_) {}
      try { MOB.setPlay(false); MOB.detect(); } catch (_) {}
      try { resize(); camUpdate(); } catch (_) {}
    } catch (_) {}
    try { tip('⚠ فشل بدء الاختبار: ' + (err && err.message || err)); } catch (_) {}
  }
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
  try { if (S._buildCam) applyBuilderCam(S._buildCam); } catch (_) {}

  
  try {
    const bak = S._playBackup;
    if (bak && Array.isArray(bak.objs)) {
      const bakIds = new Set(bak.objs.map(o => +o.id));
      
      for (const o of [...S.objs]) {
        if (!bakIds.has(+o.id)) {
          try {
            const m = MESH.get(o.id);
            if (m) { scene.remove(m); try { m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) { const mats = Array.isArray(c.material) ? c.material : [c.material]; mats.forEach(mm => mm && mm.dispose && mm.dispose()); } }); } catch (_) {} }
            MESH.delete(o.id); OBJ.delete(o.id);
            try { removePreview(o.id); } catch (_) {}
          } catch (_) {}
          S.objs = S.objs.filter(x => x.id !== o.id);
        }
      }
      
      const byId = new Map(bak.objs.map(o => [+o.id, o]));
      for (const o of S.objs) {
        const b = byId.get(+o.id);
        if (!b) continue;
        o.pos = Array.isArray(b.pos) ? [...b.pos] : [0, 0, 0];
        o.rot = Array.isArray(b.rot) ? [...b.rot] : [0, 0, 0];
        o.scl = Array.isArray(b.scl) ? [...b.scl] : [1, 1, 1];
        if (b.color != null) o.color = b.color;
        if (b.solid != null) o.solid = !!b.solid;
        if (b.hidden != null) o.hidden = !!b.hidden;
        if (b.name != null) o.name = b.name;
        if (b.base != null) o.base = !!b.base;
        if (b.def != null) o.def = b.def;
        if (Array.isArray(b.scripts)) o.scripts = b.scripts.slice();
        if (b.p && typeof b.p === 'object') o.p = JSON.parse(JSON.stringify(b.p));
        
        const m = MESH.get(o.id);
        if (m) {
          m.matrixAutoUpdate = false;
          try { tf(o); look(o); } catch (_) {}
        }
      }
      
      const liveIds = new Set(S.objs.map(o => +o.id));
      for (const b of bak.objs) {
        if (liveIds.has(+b.id)) continue;
        try {
          const o = JSON.parse(JSON.stringify(b));
          o.id = +b.id;
          reg(o);
        } catch (_) {}
      }
      if (bak.nid != null) S.nid = Math.max(+bak.nid || 1, ...S.objs.map(o => (+o.id || 0) + 1));
      
      if (Array.isArray(bak.scripts)) S.scripts = JSON.parse(JSON.stringify(bak.scripts));
      if (Array.isArray(bak.sdefs)) S.sdefs = JSON.parse(JSON.stringify(bak.sdefs));
      if (bak.sid != null) S.sid = +bak.sid;
      if (bak.did != null) S.did = +bak.did;
    } else {
      for (const o of S.objs) {
        const m = MESH.get(o.id);
        if (m) { m.matrixAutoUpdate = false; try { tf(o); look(o); } catch (_) {} }
      }
    }
  } catch (e) {
    console.warn('[playStop] restore build state', e);
    for (const o of S.objs) {
      const m = MESH.get(o.id);
      if (m) { m.matrixAutoUpdate = false; try { tf(o); look(o); } catch (_) {} }
    }
  }
  S._playBackup = null;

  for (const o of S.objs) { try { refreshPreview(o); } catch (_) {} }
  try { hier(); pList(); sList(); inspect(); } catch (_) {}
  grid.visible = true;
  try {
    const playEl = document.getElementById('play');
    const app = document.getElementById('app');
    if (playEl) { playEl.hidden = true; playEl.style.display = 'none'; }
    if (app) {
      app.hidden = false;
      app.removeAttribute('hidden');
      app.style.display = '';
      app.style.visibility = '';
    }
    document.body.classList.remove('play-on', 'pure-play', 'online-play');
    const bootSt = document.getElementById('pure-play-boot');
    if (bootSt) try { bootSt.remove(); } catch (_) {}
  } catch (_) {
    try { $('#play').hidden = true; $('#app').hidden = false; } catch (_) {}
  }
  attach(vp);
  setTool(S.tool); sel(null); camUpdate(); updModes(); refNames = null; syncMarks();
  try { endDrag(false); mv = null; MOB.resetBuildTouch(); MOB.detect(); MOB.syncPads(); setTimeout(() => { try { MOB.detect(); MOB.syncPads(); resize(); } catch (_) {} }, 120); } catch (_) {}
}

function playStartFX() {
  if (S.mode === 'play') return;
  try {
    const FX = window.HawaFX;
    if (!FX) { playStart().catch(e => console.error(e)); return; }
    if (FX.busy) return;
    let snap = null;
    try {
      if (R && R.render) R.render(scene, cam);
      const r = vp.getBoundingClientRect(), o = document.createElement('canvas');
      o.width = cv.width; o.height = cv.height;
      o.getContext('2d').drawImage(cv, 0, 0);
      snap = {img: o, rect: {x: r.left, y: r.top, w: r.width, h: r.height}};
    } catch (_) { snap = null; }
    const go = () => { try { playStart().catch(e => console.error(e)); } catch (e) { console.error(e); } };
    if (!FX.play('test', go, {snap})) go();
  } catch (e) {
    console.error(e);
    try { playStart().catch(err => console.error(err)); } catch (_) {}
  }
}
function togglePlay() { S.mode === 'play' ? playStop() : playStartFX(); }
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
    // دعم صيغ متعددة: x/y/z أو pos[] أو follow/orbit مع targetSlot
    let cx = c.x, cy = c.y, cz = c.z, lx = c.lookX, ly = c.lookY, lz = c.lookZ;
    if (c.pos && Array.isArray(c.pos)) { cx = c.pos[0]; cy = c.pos[1]; cz = c.pos[2]; }
    if (c.lookAt && Array.isArray(c.lookAt)) { lx = c.lookAt[0]; ly = c.lookAt[1]; lz = c.lookAt[2]; }
    if (c.targetSlot != null || c.mode === 'follow' || c.mode === 'orbit') {
      let px = tx, py = ty, pz = tz;
      const slot = c.targetSlot != null ? +c.targetSlot : (NetMP.on ? NetMP.slot : 1);
      if (NetMP.on && +slot !== +NetMP.slot && NetMP.remotes) {
        const r = NetMP.remotes.get(+slot);
        if (r) {
          const p = (r.rig && r.rig.root && r.rig.root.position) || r.tp;
          if (p) { px = p.x; py = p.y; pz = p.z; }
        }
      } else if (+slot === +(NetMP.on ? NetMP.slot : 1) && RT) {
        px = RT.p.x; py = RT.p.y; pz = RT.p.z;
      }
      const off = c.offset || [0, 2.2, 4.5];
      if (c.mode === 'orbit') {
        const t0 = (c.t0 != null ? c.t0 : (rt.t || 0));
        const speed = c.speed != null ? c.speed : .4;
        const rad = c.radius != null ? c.radius : (off[2] || 5);
        const ang = (rt.t - t0) * speed + (c.yaw0 || 0);
        const h = c.height != null ? c.height : (off[1] || 2.2);
        cx = px + Math.sin(ang) * rad; cy = py + h; cz = pz + Math.cos(ang) * rad;
        lx = px; ly = py + 1.2; lz = pz;
      } else if (c.mode === 'follow' || (cx == null && c.mode !== 'fixed')) {
        cx = px + (off[0] || 0); cy = py + (off[1] || 2.2); cz = pz + (off[2] || 4.5);
        if (lx == null) { lx = px; ly = py + 1.4; lz = pz; }
      } else if (lx == null) {
        lx = px; ly = py + 1.4; lz = pz;
      }
    }
    if (cx == null) { cx = cam.position.x; cy = cam.position.y; cz = cam.position.z; }
    if (lx == null) { lx = tx; ly = ty; lz = tz; }
    if (!rt.camS) rt.camS = {p: cam.position.clone(), l: new T.Vector3(tx, ty, tz)};
    rt.camS.p.lerp(new T.Vector3(cx, cy, cz), k); rt.camS.l.lerp(new T.Vector3(lx, ly, lz), k);
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

let last = performance.now(), fc = 0, ft = last;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (S.mode === 'play') play(dt);
  else {
    if (keyDown('KeyW') || keyDown('KeyA') || keyDown('KeyS') || keyDown('KeyD') || keyDown('ArrowUp') || keyDown('ArrowDown') || keyDown('ArrowLeft') || keyDown('ArrowRight') || keyDown('Space') || keyDown('ShiftLeft') || keyDown('ShiftRight')) fly(dt);
    ghostUpdate();
    if ((fc & 15) === 0) sweepScriptUI();
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

function demo() {
  add('floor', [0, -.2, 0], {name: 'الأرضية', scl: [40, .4, 40], color: '#5d7a5d'});
  add('cube', [4, .5, 0]); add('cube', [5, 1, 0], {scl: [1, 2, 1]}); add('cube', [6, 1.5, 0], {scl: [1, 3, 1]});
  add('ramp', [-6, 1, -2], {rot: [0, 90, 0]}); add('wall', [0, 1.5, -12], {scl: [12, 3, .5]});
  add('pad', [-4, .15, 5]); add('plat', [9, 1, -6], {p: {axis: 0, amp: 4, speed: 1}}); add('cyl', [-9, 1, 6]); add('sphere', [8, .5, 7]);
  add('respawn', [0, 0, 8], {name: 'نقطة البدء'});
}
window.HAWA = {S};

document.addEventListener('click', e => {
  const b = e.target && e.target.closest && e.target.closest('[data-unit-view], .unit-viewer-btn, #sUnitView');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  try { openUnitViewer(); } catch (err) { console.warn(err); }
}, true);

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
    
    document.addEventListener('gesturestart', e => e.preventDefault(), {passive: false});
    const ov = document.getElementById('mOverlay');
    if (ov) ov.onclick = () => this.closeSheets();
    const mMore = document.getElementById('mMoreBtn');
    if (mMore) mMore.onclick = () => this.toggleSheet('more');
    document.querySelectorAll('[data-proxy]').forEach(b => b.onclick = () => {
      this.closeSheets();
      const t = document.getElementById(b.dataset.proxy);
      if (t) setTimeout(() => { try { t.click(); } catch (_) {} }, 80);
    });
    document.querySelectorAll('[data-m-close]').forEach(b => b.onclick = () => this.closeSheets());
    const dBtn = document.getElementById('mDockBtn');
    const sBtn = document.getElementById('mSideBtn');
    const tBtn = document.getElementById('mTestBtn');
    if (dBtn) dBtn.onclick = () => this.toggleSheet('dock');
    if (sBtn) sBtn.onclick = () => this.toggleSheet('side');
    if (tBtn) tBtn.onclick = () => { try { if (S.mode !== 'play') playStartFX(); } catch (_) {} };
    const mSt = document.getElementById('mStorageBtn');
    if (mSt) mSt.onclick = () => { try { showStorageInfo(); } catch (_) {} };
    const mAct = document.getElementById('mStorageAct');
    if (mAct) {
      mAct.onclick = async () => {
        try {
          mAct.disabled = true;
          if (!StoreFS.handle) {
            const okPick = await StoreFS.pickAndMigrate();
            mAct.disabled = false;
            if (okPick) {
              try { tip('✔ تم ربط مجلد التخزين'); } catch (_) {}
              try { updStorageActBtn(); } catch (_) {}
            }
            return;
          }
          const ok = await StoreFS.activatePermission();
          mAct.disabled = false;
          if (ok) {
            try {
              const d2 = await StoreFS.loadPreferred();
              if (d2) loadData(d2, false);
            } catch (_) {}
            try { await StoreFS.saveAll(); } catch (_) {}
            try { tip('✔ تم تفعيل التخزين على «' + (StoreFS.handle.name || 'المجلد') + '»'); } catch (_) {}
            try { updStorageActBtn(); } catch (_) {}
          } else {
            try { tip('⚠ لم يتم منح الإذن — حاول مرة أخرى'); } catch (_) {}
          }
        } catch (e) {
          try { mAct.disabled = false; } catch (_) {}
          console.warn(e);
        }
      };
    }
    try { updStorageActBtn(); } catch (_) {}
    this._bindJoy();
    this._bindPlayLook();
    this._bindBuildGestures();
    const mb = document.getElementById('mBar');
    if (mb) mb.hidden = !this.on;
    try { this.syncPads(); } catch (_) {}
    try { this.syncPads(); } catch (_) {}
    
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
    const cls = 'sheet-' + which, b = document.body, was = b.classList.contains(cls);
    b.classList.remove('sheet-dock', 'sheet-side', 'sheet-more');
    if (!was) {
      b.classList.add(cls);
      if (which === 'side') b.classList.remove('noside');
    }
    setTimeout(resize, 40);
  },
  closeSheets() {
    document.body.classList.remove('sheet-dock', 'sheet-side', 'sheet-more');
    setTimeout(resize, 40);
  },
  resetBuildTouch() {
    this.pinch = null; this.lookTouch = null; this.buildTouch = null; this.gizmoTouch = false;
    this.look.pid = null;
  },
  setPlay(on) {
    this.playOn = !!on;
    document.body.classList.toggle('play-on', !!on);
    if (!on) {
      this.joy.x = this.joy.y = 0; this.joy.active = false;
      this.run = this.jump = false;
      try {
        setVirtualKey('KeyW', 0); setVirtualKey('KeyA', 0); setVirtualKey('KeyS', 0); setVirtualKey('KeyD', 0);
        setVirtualKey('Space', 0); setVirtualKey('ShiftLeft', 0);
      } catch (_) {}
    }
    this.syncPads();
  },
  syncPads() {
    if (!this.on) {
      const mt = document.getElementById('mTouch'); if (mt) mt.hidden = true;
      const mb = document.getElementById('mBar'); if (mb) mb.hidden = true;
      const bh = document.getElementById('mBuildHint'); if (bh) bh.hidden = true;
      return;
    }
    const play = !!this.playOn;
    const mt = document.getElementById('mTouch');
    
    
    if (mt) mt.hidden = !!play;
    const mb = document.getElementById('mBar');
    if (mb) mb.hidden = !!play;
    const bh = document.getElementById('mBuildHint');
    if (bh) bh.hidden = !!play;
    const jb = document.getElementById('mJump'), rb = document.getElementById('mRun');
    if (jb && rb && !play) {
      jb.innerHTML = '<b>▲</b><span>طلوع</span>';
      rb.innerHTML = '<b>▼</b><span>نزول</span>';
      jb.setAttribute('aria-label', 'طلوع'); rb.setAttribute('aria-label', 'نزول');
    }
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
    
    const playLayer = document.getElementById('play');
    if (playLayer && !playLayer._hawaWheelBlock) {
      playLayer._hawaWheelBlock = true;
      playLayer.addEventListener('wheel', e => { e.preventDefault(); }, { passive: false });
    }

    
    const play = document.getElementById('play');
    if (!play) return;
    play.addEventListener('pointerdown', e => {
      if (!this.on || S.mode !== 'play') return;
      if (e.target.closest('#mJoy,#mAct,#pTop,#pMic,button')) return;
      const w = innerWidth;
      if (e.clientX < w * 0.42) return; 
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
    this.pinch = null;
    this.buildTouch = null;
    this.lookTouch = null;
    cv.addEventListener('touchstart', e => {
      if (!this.on || S.mode !== 'build') return;
      
      
      if (e.targetTouches.length >= 2) {
        const a = e.targetTouches[0], b = e.targetTouches[1];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        this.pinch = { dist, d0: OB.dist };
        this.buildTouch = null;
        this.lookTouch = null;
        this.gizmoTouch = false;
        e.preventDefault();
        return;
      }
      const t = e.changedTouches[0] || e.targetTouches[0];
      if (!t) return;
      this.gizmoTouch = false;
      const placingTouch = (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn' || S.pick);
      if (S.sel != null && gizmo.visible && !placingTouch) {
        try {
          const list = HIT.filter(h => h.mode === S.gz).map(h => h.m);
          const hh = ray({ clientX: t.clientX, clientY: t.clientY }).intersectObjects(list, false)[0];
          if (hh) {
            const rec = HIT.find(h => h.m === hh.object);
            if (rec) {
              if (!drag) startDrag(rec, { clientX: t.clientX, clientY: t.clientY, button: 0 });
              this.gizmoTouch = true;
              this.buildTouch = null;
              this.lookTouch = null;
              e.preventDefault();
              return;
            }
          }
        } catch (_) {}
      }
      
      this.lookTouch = { x: t.clientX, y: t.clientY, t: performance.now(), moved: 0, id: t.identifier };
      this.buildTouch = this.lookTouch;
      if (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') { S.tr = { x: t.clientX, y: t.clientY }; S.dirty = 1; }
    }, { passive: false });
    cv.addEventListener('touchmove', e => {
      if (!this.on || S.mode !== 'build') return;
      if (typeof drag !== 'undefined' && drag) {
        e.preventDefault();
        if (drag.pid == null && e.targetTouches[0]) { try { doDrag({ clientX: e.targetTouches[0].clientX, clientY: e.targetTouches[0].clientY }); } catch (_) {} }
        return;
      }
      if (this.gizmoTouch) { e.preventDefault(); return; }
      if (e.targetTouches.length >= 2 && this.pinch) {
        const a = e.targetTouches[0], b = e.targetTouches[1];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const s = this.pinch.dist / Math.max(40, dist);
        OB.dist = clamp(this.pinch.d0 * s, 1.5, 400);
        camUpdate();
        e.preventDefault();
        return;
      }
      if (this.lookTouch) {
        let t = null;
        for (let i = 0; i < e.targetTouches.length; i++) {
          if (e.targetTouches[i].identifier === this.lookTouch.id) { t = e.targetTouches[i]; break; }
        }
        if (t) {
          const dx = t.clientX - this.lookTouch.x, dy = t.clientY - this.lookTouch.y;
          this.lookTouch.moved += Math.abs(dx) + Math.abs(dy);
          OB.yaw -= dx * 0.005;
          OB.pitch = clamp(OB.pitch + dy * 0.005, -1.5, 1.5);
          this.lookTouch.x = t.clientX;
          this.lookTouch.y = t.clientY;
          if (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn') { S.tr = { x: t.clientX, y: t.clientY }; S.tapArm = null; }
          camUpdate();
          e.preventDefault();
        }
      }
    }, { passive: false });
    cv.addEventListener('touchend', e => {
      if (!this.on || S.mode !== 'build') return;
      if (this.pinch && e.targetTouches.length < 2) {
        this.pinch = null;
        const r = e.targetTouches[0];
        if (r) { this.lookTouch = { x: r.clientX, y: r.clientY, t: performance.now(), moved: 99, id: r.identifier }; this.buildTouch = this.lookTouch; }
      }
      if (this.gizmoTouch) { this.gizmoTouch = false; if (drag && drag.pid == null) endDrag(true); }
      if (this.lookTouch && e.changedTouches.length) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.lookTouch.id) {
            const bt = this.lookTouch;
            const t = e.changedTouches[i];
            this.lookTouch = null;
            this.buildTouch = null;
            if (bt.moved < 12 && performance.now() - bt.t < 320) {
              const placing = !S.pick && (S.tool === 'place' || S.tool === 'respawn' || S.tool === 'online_spawn');
              if (placing) {
                
                const pt = { x: t.clientX, y: t.clientY }, a = S.tapArm, now = performance.now();
                if (a && Math.hypot(a.x - pt.x, a.y - pt.y) < 40 && now - a.t < 9000) {
                  S.tapArm = null; S.tr = pt;
                  try { click({ clientX: t.clientX, clientY: t.clientY, button: 0 }); } catch (_) {}
                  tipNow('');
                } else {
                  S.tapArm = { x: pt.x, y: pt.y, t: now }; S.tr = pt; S.dirty = 1;
                  tipNow('', 1);
                }
              } else {
                try { click({ clientX: t.clientX, clientY: t.clientY, button: 0 }); } catch (_) {}
              }
            }
            break;
          }
        }
      }
    }, { passive: false });
  }
};

Object.assign(INTRO, {
  dur: 5200,
  to: null, raf: 0, t0: 0, fov0: 60,
  _key(e) {
    if (!INTRO.active) return;
    if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.code)) return;
    if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') INTRO.finish(true);
    e.preventDefault(); e.stopImmediatePropagation();
  },
  _setCam(e) {
    const to = this.to, k = 1 - e;
    OB.t.set(to.tx, to.ty + k * 14, to.tz);
    OB.dist = to.dist + k * 150;
    OB.pitch = to.pitch + (1.42 - to.pitch) * k;
    OB.yaw = to.yaw + k * 2.1;
    camUpdate();
    const fv = this.fov0 + k * 16;
    if (Math.abs(cam.fov - fv) > .01) { cam.fov = fv; cam.updateProjectionMatrix(); }
  },
  start() {
    if (this.started) return;
    this.started = true;
    const el = document.getElementById('intro');
    if (!el || window.HAWA_PLAY_ONLY || !this.active) { this.active = false; this._cleanup(); return; }
    this.el = el;
    const g = LAST_CAM || getBuilderCam();
    this.to = {
      tx: +g.tx || 0, ty: Math.max(0, +g.ty || 0), tz: +g.tz || 0,
      yaw: +g.yaw, pitch: clamp(+g.pitch, -1.5, 1.5), dist: clamp(+g.dist || 22, 1.5, 500)
    };
    if (!Number.isFinite(this.to.yaw)) this.to.yaw = OB.yaw;
    if (!Number.isFinite(this.to.pitch)) this.to.pitch = OB.pitch;
    this.fov0 = cam.fov || 60;
    document.addEventListener('keydown', this._key, true);
    const sk = document.getElementById('introSkip');
    if (sk) sk.onclick = e => { e.stopPropagation(); this.finish(true); };
    this._setCam(0); resize();
    this.t0 = performance.now();
    requestAnimationFrame(() => el.classList.add('run'));
    const loop = now => {
      if (!this.active) return;
      const u = clamp((now - this.t0) / this.dur, 0, 1);
      this._setCam(1 - Math.pow(1 - u, 3));
      if (u >= 1) { this.finish(false); return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
    this._wd = setTimeout(() => this.finish(true), this.dur + 5000);
  },
  finish(skipped) {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.raf); clearTimeout(this._wd);
    document.removeEventListener('keydown', this._key, true);
    if (this.to) {
      OB.t.set(this.to.tx, this.to.ty, this.to.tz);
      OB.dist = this.to.dist; OB.pitch = this.to.pitch; OB.yaw = this.to.yaw;
      if (cam.fov !== this.fov0) { cam.fov = this.fov0; cam.updateProjectionMatrix(); }
    }
    const el = this.el, b = document.body;
    if (el) el.classList.add('flash');
    setTimeout(() => {
      b.classList.remove('intro-on');
      b.classList.add('intro-reveal');
      try { resize(); camUpdate(); persistCam(true); MOB.syncPads(); } catch (_) {}
      if (el) el.classList.add('out');
    }, skipped ? 120 : 220);
    setTimeout(() => { b.classList.remove('intro-reveal'); if (el) el.remove(); try { resize(); } catch (_) {} }, skipped ? 1900 : 2300);
  },
  _cleanup() {
    document.body.classList.remove('intro-on');
    const el = document.getElementById('intro'); if (el) el.remove();
  }
});
(function () {
  try { [...document.querySelectorAll('#bar > *')].forEach((e, i) => e.style.setProperty('--i', i)); } catch (_) {}
  addEventListener('error', () => { if (INTRO.active && !INTRO.started) setTimeout(() => INTRO.finish(true), 1500); });
})();

function boot() {
  try { MOB.bind(); } catch (e) { console.warn(e); }
  
  

  try { bindParamPanel(); } catch (e) {}

  loadPlayerCfg();
  $$('[data-ic]').forEach(e => e.innerHTML = ic(e.dataset.ic));
  attach(vp);
  let d = null;
  const emb = (typeof window.HAWA_EMBEDDED_GAME === 'object' && window.HAWA_EMBEDDED_GAME && Array.isArray(window.HAWA_EMBEDDED_GAME.objs)) ? window.HAWA_EMBEDDED_GAME : null;
  
  let fromLauncher = false;
  try { fromLauncher = !!sessionStorage.getItem('hawa_play_meta'); } catch (e) {}
  const readSession = () => {
    if (window.__HAWA_IDB_GAME && window.__HAWA_IDB_GAME.objs) return window.__HAWA_IDB_GAME;
    try {
      const ss = sessionStorage.getItem('hawa_game') || sessionStorage.getItem('hawa_game_data');
      if (ss) {
        const parsed = JSON.parse(ss);
        if (parsed && Array.isArray(parsed.objs)) return parsed;
      }
    } catch (e) {}
    return null;
  };
  if (emb && !fromLauncher) d = emb;
  else d = readSession() || emb || null;
  if (d && d.objs) {
    clearAll();
    
    try {
      S.media = (d.media && typeof d.media === 'object') ? JSON.parse(JSON.stringify(d.media)) : {};
      S.mediaOrder = Array.isArray(d.mediaOrder) ? d.mediaOrder.slice() : Object.keys(S.media);
      S.mid = Math.max(1, +d.mid || 1);
      for (const id of Object.keys(S.media)) { const m = S.media[id]; if (m && !m.kind) m.kind = mediaKindFrom(m.mime, m.name); }
      const pn = d.playNet || (d.meta && d.meta.playNet);
      S.playNet = (pn === 'online' || pn === 'offline') ? pn : null;
      S.allowScriptSpawn = true;
      S.roomMinEnabled = !!d.roomMinEnabled;
      S.roomFillExact = !!d.roomFillExact;
      S.roomMinPlayers = Math.max(2, Math.floor(+(d.roomMinPlayersSetting != null ? d.roomMinPlayersSetting : d.roomMinPlayers) || 2));
      if (d.player && typeof d.player === 'object') {
        window.__HAWA_PLAYER_LOCKED = true;
        for (const k in PCFG) delete PCFG[k];
        Object.assign(PCFG, JSON.parse(JSON.stringify(PLAYER_DEF)), d.player);
      }
    } catch (e) { console.warn('apply game settings', e); }
    S.scripts = (d.scripts || []).map(s => ({
      id: +s.id, name: s.name, code: s.code,
      enabled: s.enabled != null ? !!s.enabled : !!s.global,
      p: (s.p && typeof s.p === 'object') ? JSON.parse(JSON.stringify(s.p)) : {}
    }));
    S.sdefs = (d.sdefs || []).map(x => ({
      id: +x.id, name: x.name, code: x.code,
      p: (x.p && typeof x.p === 'object') ? JSON.parse(JSON.stringify(x.p)) : {}
    }));
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
  try { syncPlayNetUI(); } catch (_) {}
  requestAnimationFrame(frame);
  if (window.HAWA_PLAY_ONLY) {
    try {
      const bar = document.getElementById('bar');
      const app = document.getElementById('app');
      if (bar) bar.style.display = 'none';
      if (app) { app.style.display = 'none'; app.setAttribute('hidden', ''); }
      document.body.classList.add('pure-play', 'play-on');
      // شاشة تحميل احترافية فوراً (بدل الجملة البيضا على أسود)
      if (!document.getElementById('hawaEngineLoad')) {
        const el = document.createElement('div');
        el.id = 'hawaEngineLoad';
        el.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;background:radial-gradient(ellipse at 50% 28%,#1e1838 0%,#08060f 72%);color:#f4efe4;font-family:Cairo,Tahoma,sans-serif;opacity:1';
        el.innerHTML =
          '<div style="width:120px;height:120px;border-radius:50%;padding:3px;background:linear-gradient(135deg,#ffbe3d,#7ff0dc,#c4b5fd);box-shadow:0 0 40px rgba(255,190,61,.35)">' +
            '<div style="width:100%;height:100%;border-radius:50%;background:#0c0a14;display:flex;align-items:center;justify-content:center;overflow:hidden">' +
              '<img src="logo-256.png" alt="Hawa" style="width:100%;height:100%;object-fit:contain">' +
            '</div></div>' +
          '<div style="font-size:26px;font-weight:900;letter-spacing:.14em;background:linear-gradient(90deg,#ffe2a6,#7ff0dc,#c4b5fd);-webkit-background-clip:text;background-clip:text;color:transparent">HAWA ENGINE</div>' +
          '<div id="hawaEngineLoadTxt" style="opacity:.9;font-weight:700;font-size:14px">جاري تحميل اللعبة…</div>' +
          '<div style="width:min(280px,72vw);height:5px;border-radius:99px;background:#1e1a2e;overflow:hidden;border:1px solid #2a2438">' +
            '<div id="hawaEngineLoadBar" style="height:100%;width:8%;background:linear-gradient(90deg,#7ff0dc,#ffe2a6,#c4b5fd);transition:width .25s linear"></div>' +
          '</div>';
        document.body.appendChild(el);
        // حركة بسيطة للشريط لحد ما playStart ياخد الأمر
        let _p = 8;
        const _iv = setInterval(() => {
          _p = Math.min(92, _p + 4 + Math.random() * 6);
          const b = document.getElementById('hawaEngineLoadBar');
          const t = document.getElementById('hawaEngineLoadTxt');
          if (b) b.style.width = _p + '%';
          if (t) t.textContent = _p < 40 ? 'جاري تحميل اللعبة…' : _p < 70 ? 'تهيئة العالم…' : 'تحضير اللاعب…';
          if (_p >= 92 || !document.getElementById('hawaEngineLoad')) clearInterval(_iv);
        }, 120);
      }
    } catch (_) {}
    setTimeout(async () => {
      try {
        if (!(d && d.objs && d.objs.length)) {
          await uiAlert('اللعبة مفيهاش بيانات كافية للتشغيل.\nالسبب: ملف اللعبة ما وصلش لوضع اللعب (ارفعه من «فتح اللعبة» قبل إنشاء/انضمام الرووم، أو أعد رفعه).');
          location.href = 'game.html';
          return;
        }
        playStart();
      } catch (e) { console.error(e); await uiAlert('فشل بدء اللعب: ' + (e.message || e)); }
    }, 40);
  }
}
(async function bootAsync() {
  let st = false;
  
  
  if (window.HAWA_PLAY_ONLY) {
    try { StoreFS.handle = null; StoreFS.mode = 'none'; } catch (_) {}
    try {
      if (!(window.HAWA_EMBEDDED_GAME && window.HAWA_EMBEDDED_GAME.objs) && !sessionStorage.getItem('hawa_game') && !sessionStorage.getItem('hawa_game_data')) {
        window.__HAWA_IDB_GAME = await new Promise(res => {
          try {
            const r = indexedDB.open('hawa_play_tmp', 1);
            r.onupgradeneeded = () => r.result.createObjectStore('g');
            r.onsuccess = () => { const q = r.result.transaction('g').objectStore('g').get('game'); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); };
            r.onerror = () => res(null);
          } catch (_) { res(null); }
        });
      }
    } catch (_) {}
    boot();
    return;
  }
  // طلب تخزين دائم من المتصفح (مرة واحدة صامتة) — يقلل مسح البيانات وثبات الحفظ
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  } catch (_) {}
  try { st = await StoreFS.init(); } catch (e) { console.warn(e); }
  boot();
  // تحميل مشروع محفوظ من localStorage (احتياطي قوي خصوصاً على الموبايل)
  async function loadLocalProjectFallback() {
    try {
      const raw = localStorage.getItem('hawa2-project');
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d && (Array.isArray(d.objs) || d.scripts || d.sdefs)) {
        loadData(d, false);
        return true;
      }
    } catch (e) { console.warn('local project load', e); }
    return false;
  }
  // تخزين صامت: سيرفر / مجلد / localStorage — من غير ما نطلب تفعيل كل ريفرش
  if (st === true) {
    try {
      const d2 = await StoreFS.loadPreferred();
      if (d2) try { loadData(d2, false); } catch (e) { console.warn(e); await loadLocalProjectFallback(); }
      else await loadLocalProjectFallback();
    } catch (e) { console.warn(e); await loadLocalProjectFallback(); }
  } else if (st === 'migrate') {
    try {
      const d2 = await StoreFS.readFromLegacy();
      if (d2) {
        try { loadData(d2, false); } catch (e) { console.warn(e); }
        try { await StoreFS.saveAll(); StoreFS.legacy = null; tip('✔ اتنقل مشروعك للتخزين التلقائي'); } catch (e) { console.warn(e); }
      } else await loadLocalProjectFallback();
    } catch (e) { console.warn(e); await loadLocalProjectFallback(); }
  } else {
    // local / مفيش مجلد / موبايل — حمّل من المتصفح فوراً بدون أي برميشن
    try {
      if (StoreFS.mode === 'none' || !StoreFS.mode) {
        StoreFS.mode = 'local';
        StoreFS.label = StoreFS.label || 'متصفح (حفظ دائم بدون برميشن)';
      }
      StoreFS.needsGesture = false;
      await loadLocalProjectFallback();
    } catch (_) {}
  }
  try { INTRO.start(); } catch (e) { console.warn(e); try { INTRO.finish(true); } catch (_) {} }
  try { updStorageActBtn(); } catch (_) {}
  setTimeout(() => { try { updStorageActBtn(); } catch (_) {} }, 800);

  // أونلاين/أوفلاين تلقائي من غير سؤال
  if (!window.HAWA_PLAY_ONLY) {
    setTimeout(() => {
      try {
        if (S.playNet !== 'online' && S.playNet !== 'offline') ensurePlayNetChosen(false);
        else syncPlayNetUI();
      } catch (_) {}
    }, 400);
  }
})();
})();
