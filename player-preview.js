
(function (W) {
  'use strict';
  var T = W.THREE;
  if (!T) { console.warn('THREE missing'); return; }

  const PLAYER_DEF = {
  style: 'suit',                  
  skin: '#f5c08f', skinD: '#e0a070', hair: '#3a2616', iris: '#2a3f5a',
  shirt: '#f1f1ee', pants: '#34415e', jacket: '#34415e', tie: '#c0392b', shoes: '#1d1b1b', belt: '#1d1b1b',
  vest: '#4f5f2e', helmet: '#6a8040', glove: '#33353a', scarf: '#e0483c', pack: '#9c8553',
  hairStyle: 'short', beard: false, glasses: false, headScale: 1.0, proportions: 'man', rounded: false, noseSize: 1.7, belly: .6,
  abaya: '#1f2329', trim: '#c9a96e', hood: false
};
  var PCFG = JSON.parse(JSON.stringify(PLAYER_DEF));
  var PSC = 1.2;

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
  return {root, pelvis, waist, chest, neck, head, eyes, lids, brows, lipU, lipD, fs: null, cape, L: legs.L, R: legs.R, AL: arms.L, AR: arms.R, st, hipY: HIP, sec, blob, tie};
}

  W.HawaPlayerPreview = {
    PLAYER_DEF: PLAYER_DEF,
    makeManRig: makeManRig,
    make: function (cfg) {
      if (cfg && typeof cfg === 'object') Object.assign(PCFG, cfg);
      return makeManRig();
    }
  };
})(window);
