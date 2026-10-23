
(function () {
  'use strict';
  var W = window, D = document;

  /* ألوان موحّدة مع ستايل المحرك / مشهد الانتقال: ذهب + سماوي */
  var CFG = {
    test:  { C: 1400, D: 2000, rgb: [45, 226, 196],  rgb2: [255, 190, 61],  sub: '',   ar: '' },
    build: { C: 1900, D: 3000, rgb: [255, 190, 61],  rgb2: [255, 157, 28],  sub: '',   ar: '' },
    play:  { C: 1750, D: 2800, rgb: [45, 226, 196],  rgb2: [20, 184, 160],  sub: '',   ar: '' }
  };
  var FLAG = 'hawa_fx_arrive';

  
  function cl(x, a, b) { return x < a ? a : x > b ? b : x; }
  function pr(t, a, b) { return cl((t - a) / (b - a), 0, 1); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }
  function eio(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eob(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function hs(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  var FONT = 'Cairo,Tahoma,"Segoe UI",sans-serif';

  
  var AC = null;
  function sfx(kind) {
    try {
      AC = AC || new (W.AudioContext || W.webkitAudioContext)();
      var a = AC; if (a.state === 'suspended') a.resume();
      var T0 = a.currentTime;
      var noise = function (d, dur, f1, f2, vol, type) {
        var n = a.createBuffer(1, Math.max(1, a.sampleRate * dur | 0), a.sampleRate), x = n.getChannelData(0);
        for (var i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
        var s = a.createBufferSource(); s.buffer = n;
        var f = a.createBiquadFilter(); f.type = type || 'bandpass';
        f.frequency.setValueAtTime(f1, T0 + d); f.frequency.exponentialRampToValueAtTime(f2, T0 + d + dur);
        var g = a.createGain(); g.gain.value = vol;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(T0 + d);
      };
      var tone = function (d, dur, f1, f2, vol, type) {
        var o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine';
        o.frequency.setValueAtTime(f1, T0 + d); o.frequency.exponentialRampToValueAtTime(f2, T0 + d + dur);
        g.gain.setValueAtTime(vol, T0 + d); g.gain.exponentialRampToValueAtTime(.0001, T0 + d + dur);
        o.connect(g); g.connect(a.destination); o.start(T0 + d); o.stop(T0 + d + dur + .02);
      };
      if (kind === 'test') {
        
        noise(.42, .04, 4200, 1800, .38, 'highpass');
        noise(.48, .07, 1600, 600, .22, 'lowpass');
        tone(.55, .18, 180, 90, .045, 'sine');
        noise(1.05, .25, 900, 280, .12, 'lowpass');
        tone(1.35, .4, 140, 70, .03, 'sine');
      } else if (kind === 'build') {
        tone(.45, .35, 110, 38, .5, 'sine');
        for (var i = 0; i < 4; i++) { tone(1.0 + i * .13, .14, 1100 - i * 90, 500, .07, 'square'); noise(1.0 + i * .13, .08, 3500, 1200, .12, 'bandpass'); }
      } else {
        
        noise(.05, .9, 120, 900, .22, 'lowpass');
        tone(.4, .8, 95, 42, .12, 'sine');
        noise(1.1, .35, 600, 180, .1, 'bandpass');
        tone(1.4, .55, 220, 110, .04, 'triangle');
      }
    } catch (_) { }
  }

  
  var cv = null, c = null, VW = 0, VH = 0, dpr = 1, raf = 0, busy = false;
  function fit() {
    if (!cv) return;
    dpr = Math.min(W.devicePixelRatio || 1, 2);
    VW = W.innerWidth; VH = W.innerHeight;
    cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr);
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  }
  function mount() {
    unmount();
    cv = D.createElement('canvas'); cv.id = 'fx-layer-x1';
    cv.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483000;pointer-events:auto;touch-action:none;cursor:default;background:transparent';
    (D.body || D.documentElement).appendChild(cv);
    c = cv.getContext('2d'); fit();
    W.addEventListener('resize', fit);
  }
  function unmount() {
    cancelAnimationFrame(raf);
    W.removeEventListener('resize', fit);
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    cv = null; c = null; busy = false; api.busy = false;
  }

  
  var logoImg = null, logoReady = false;
  try {
    logoImg = new Image();
    logoImg.onload = function () { logoReady = true; };
    logoImg.decoding = 'async';
    logoImg.src = 'logo-256.png';
  } catch (_) {}
  /* لوجو المحرك — يظهر ملتصق بالأنيميشن (scale + glow + bounce خفيف) */
  function mark(x, y, r, o) {
    var p = pr(o.p, 0, .55); if (p <= 0) return;
    var A = o.cfg.rgb, B = o.cfg.rgb2 || A;
    var e = eob(Math.min(1, p * 1.15)); /* overshoot bounce */
    var fade = eo(pr(o.p, 0, .28));
    var size = r * 3.05;
    var sc = .42 + .58 * e;
    c.save();
    c.translate(x, y);
    c.globalAlpha = o.a * fade;
    c.scale(sc, sc);
    /* هالة خلف اللوجو */
    var glowR = size * .62;
    var rg = c.createRadialGradient(0, 0, size * .12, 0, 0, glowR);
    rg.addColorStop(0, rgba(A, .55 * fade));
    rg.addColorStop(.55, rgba(B, .22 * fade));
    rg.addColorStop(1, rgba(A, 0));
    c.fillStyle = rg;
    c.beginPath(); c.arc(0, 0, glowR, 0, Math.PI * 2); c.fill();
    if (logoReady && logoImg) {
      c.shadowColor = rgba(A, .9);
      c.shadowBlur = r * 1.35;
      c.drawImage(logoImg, -size / 2, -size / 2, size, size);
      /* لمسة ضوء علوية خفيفة */
      c.shadowBlur = 0;
      c.globalAlpha = o.a * fade * .35;
      c.globalCompositeOperation = 'lighter';
      var hg = c.createRadialGradient(0, -size * .18, 0, 0, -size * .1, size * .45);
      hg.addColorStop(0, 'rgba(255,255,255,.55)');
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = hg;
      c.beginPath(); c.arc(0, -size * .08, size * .42, 0, Math.PI * 2); c.fill();
    } else {
      c.shadowColor = rgba(A, .85); c.shadowBlur = r * .9;
      c.fillStyle = rgba(A, 1);
      rr(c, -r, -r, 2 * r, 2 * r, r * .28); c.fill();
    }
    c.restore();
  }
  function title(o) {
    var cfg = o.cfg, A = cfg.rgb, B = cfg.rgb2;
    var fs = Math.min(VW * .2, VH * .26, 190), gap = fs * .1, cx = VW / 2, cy = VH / 2 + (o.dy || 0);
    var base = cy + fs * .22;
    c.save(); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.font = '900 ' + fs + 'px ' + FONT;
    var L = 'HAWA'.split(''), ws = L.map(function (ch) { return c.measureText(ch).width; }), tot = gap * (L.length - 1);
    ws.forEach(function (w) { tot += w; });
    var x = cx - tot / 2, i;
    mark(cx, base - fs * 1.28, fs * .30, o);
    for (i = 0; i < L.length; i++) {
      var lp = pr(o.p, i * .13, i * .13 + .5);
      if (lp > 0) {
        var dy = 0, sc = 1, al = lp;
        if (o.style === 'drop') { dy = -(1 - eob(lp)) * fs * 1.7; al = Math.min(1, lp * 3); }
        else if (o.style === 'zoom') { var z = eo(lp); sc = 1 + (1 - z) * .9; al = z; }
        else { dy = (1 - eo(lp)) * fs * .5; al = eo(lp); }
        c.save(); c.globalAlpha = al * o.a; c.translate(x + ws[i] / 2, base + dy); c.scale(sc, sc);
        if (o.g > 0) {
          var gx = Math.sin(o.time * .05 + i * 2.3) * fs * .05 * o.g;
          c.globalCompositeOperation = 'lighter';
          c.fillStyle = 'rgba(255,190,61,.9)'; c.fillText(L[i], -ws[i] / 2 + gx, 0);
          c.fillStyle = 'rgba(45,226,196,.9)'; c.fillText(L[i], -ws[i] / 2 - gx, 0);
          c.globalCompositeOperation = 'source-over';
        }
        var g = c.createLinearGradient(0, -fs * .75, 0, 0);
        g.addColorStop(0, '#ffffff'); g.addColorStop(.5, rgba([Math.min(255, A[0] + 60), Math.min(255, A[1] + 60), Math.min(255, A[2] + 60)], 1)); g.addColorStop(1, rgba(A, 1));
        c.shadowColor = rgba(A, .75); c.shadowBlur = fs * .28; c.fillStyle = g; c.fillText(L[i], -ws[i] / 2, 0);
        c.restore();
        o.letterLand && o.letterLand(i, x + ws[i] / 2, base, lp);
      }
      x += ws[i] + gap;
    }
    
    var ep = pr(o.p, .35, .8);
    if (ep > 0) {
      var f2 = fs * .27, sp = f2 * .95, E = 'ENGINE'.split(''), ey = base + fs * .42;
      c.font = '800 ' + f2 + 'px ' + FONT;
      var ew = E.map(function (ch) { return c.measureText(ch).width; }), et = sp * (E.length - 1);
      ew.forEach(function (w) { et += w; });
      c.globalAlpha = o.a * eo(ep); var ex = cx - et / 2;
      c.fillStyle = rgba(B, 1); c.shadowColor = rgba(B, .8); c.shadowBlur = f2 * .6;
      for (i = 0; i < E.length; i++) { c.fillText(E[i], ex, ey); ex += ew[i] + sp; }
      c.shadowBlur = 0; c.strokeStyle = rgba(A, .7); c.lineWidth = 2;
      var ln = eo(ep) * Math.min(VW * .16, 200);
      c.beginPath(); c.moveTo(cx - et / 2 - 22, ey - f2 * .35); c.lineTo(cx - et / 2 - 22 - ln, ey - f2 * .35);
      c.moveTo(cx + et / 2 + 22, ey - f2 * .35); c.lineTo(cx + et / 2 + 22 + ln, ey - f2 * .35); c.stroke();
    }
    
    var sp2 = pr(o.p, .55, 1);
    if (sp2 > 0 && cfg.sub) {
      var f3 = Math.max(11, fs * .095), sgp = f3 * .32;
      c.font = '700 ' + f3 + 'px ' + FONT; c.globalAlpha = o.a * eo(sp2) * .85; c.fillStyle = rgba(A, 1);
      
      var segs = cfg.sub.split('·').map(function (z) { return z.trim(); }), parts = [], sw = 0, k, m;
      segs.forEach(function (z, idx) {
        if (idx > 0) { var dw = c.measureText('·').width; parts.push({ dot: 1, w: dw }); sw += dw + sgp * 2; }
        if (/[\u0600-\u06FF]/.test(z)) { var w = c.measureText(z).width; parts.push({ t: z, w: w, ar: 1 }); sw += w; }
        else {
          var chs = z.split(''), cw = chs.map(function (ch) { return c.measureText(ch).width; }), tw = sgp * (chs.length - 1);
          cw.forEach(function (w2) { tw += w2; }); parts.push({ chs: chs, cw: cw, w: tw }); sw += tw;
        }
      });
      var sx = cx - sw / 2, sy = base + fs * .42 + fs * .3;
      parts.forEach(function (pt) {
        if (pt.dot) { sx += sgp; c.fillText('·', sx, sy); sx += pt.w + sgp; }
        else if (pt.ar) { c.fillText(pt.t, sx, sy); sx += pt.w; }
        else { for (m = 0; m < pt.chs.length; m++) { c.fillText(pt.chs[m], sx, sy); sx += pt.cw[m] + sgp; } sx -= sgp; }
      });
      
      var bw = Math.min(VW * .36, 360), by = sy + f3 * 1.5;
      c.globalAlpha = o.a * .35; c.fillStyle = rgba(A, .35); rr(c, cx - bw / 2, by, bw, 3, 2); c.fill();
      c.globalAlpha = o.a * .95; c.fillStyle = rgba(A, 1); c.shadowColor = rgba(A, .9); c.shadowBlur = 10;
      rr(c, cx - bw / 2, by, Math.max(4, bw * (o.bar == null ? sp2 : o.bar)), 3, 2); c.fill();
    }
    c.restore();
  }

  
  function rTest(t, cfg, snap) {
    
    var A = cfg.rgb, B = cfg.rgb2, C = cfg.C, tt = Math.min(t, C);
    var cover = eo(pr(tt, 0, 380));
    var fade = 1 - pr(t, C, C + 420);

    
    if (cover > 0) {
      var g = c.createRadialGradient(VW / 2, VH / 2, 0, VW / 2, VH / 2, Math.hypot(VW, VH) / 2);
      g.addColorStop(0, 'rgba(14,12,20,' + (cover * fade) + ')');
      g.addColorStop(1, 'rgba(6,5,10,' + (cover * fade) + ')');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      
      c.fillStyle = 'rgba(255,255,255,' + (.025 * cover * fade) + ')';
      for (var y = 0; y < VH; y += 5) c.fillRect(0, y, VW, 1);
    }

    
    var tp = pr(tt, 280, 900);
    if (tp > 0 && fade > 0) {
      title({
        cfg: cfg, p: tp, a: fade, style: 'rise',
        g: tt < 1200 ? Math.max(0, 1 - pr(tt, 700, 1200)) * 0.8 : 0,
        time: tt, bar: pr(tt, 500, C)
      });
      
      var sy2 = lerp(-30, VH + 30, eio(pr(tt, 350, 1100)));
      if (pr(tt, 350, 1100) > 0 && pr(tt, 350, 1100) < 1) {
        var sg = c.createLinearGradient(0, sy2 - 50, 0, sy2 + 2);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(1, rgba(A, .22 * fade));
        c.fillStyle = sg; c.fillRect(0, sy2 - 50, VW, 52);
        c.fillStyle = 'rgba(255,255,255,' + (.55 * fade) + ')'; c.fillRect(0, sy2, VW, 1.5);
      }
    }

    
    var fl = pr(t, C - 80, C + 180);
    if (fl > 0 && fl < 1) {
      var fa = fl < .35 ? fl / .35 : 1 - (fl - .35) / .65;
      c.fillStyle = 'rgba(255,242,220,' + (fa * .35) + ')'; c.fillRect(0, 0, VW, VH);
    }
  }

  
  function rBuild(t, cfg) {
    var A = cfg.rgb, B = cfg.rgb2, C = cfg.C, tt = Math.min(t, C);
    var rows = Math.max(9, Math.round(VH / 72)), rh = VH / rows, bw = Math.max(96, VW / 9);
    var stag = Math.min(45, 480 / rows), i, j;
    for (i = 0; i < rows; i++) {
      var dir = (i % 2) ? 1 : -1;
      var pin = eo(pr(t, i * stag, i * stag + 520));
      var pout = eio(pr(t, C + i * stag * .8, C + i * stag * .8 + 560));
      var x = dir * VW * (1 - pin) - dir * VW * pout;
      if (pin <= 0 || pout >= 1) continue;
      var y = i * rh;
      c.save(); c.beginPath(); c.rect(x, y, VW, rh + .6); c.clip();
      c.fillStyle = '#0b0803'; c.fillRect(x, y, VW, rh + 1);
      var off = (i % 2) ? bw * .5 : 0;
      for (j = -1; j * bw - off < VW + bw; j++) {
        var bx = x + j * bw - off, hh = hs(i * 31 + j * 7 + 3);
        var lit = hh > .93;
        var g = c.createLinearGradient(0, y, 0, y + rh);
        g.addColorStop(0, lit ? rgba(A, .42) : 'rgb(' + (34 + hh * 14 | 0) + ',' + (25 + hh * 10 | 0) + ',' + (10 + hh * 5 | 0) + ')');
        g.addColorStop(1, lit ? rgba(B, .18) : 'rgb(20,14,6)');
        c.fillStyle = g; c.fillRect(bx + 2, y + 2, bw - 4, rh - 4);
        c.fillStyle = rgba(A, lit ? .9 : .28); c.fillRect(bx + 2, y + 2, bw - 4, 2);
      }
      c.restore();
    }
    
    var cover = pr(tt, 500, 1000) * (1 - pr(t, C, C + 350));
    if (cover > 0) {
      c.save(); c.globalAlpha = cover * .5; c.strokeStyle = rgba(A, .13); c.lineWidth = 1; c.beginPath();
      for (var gx = 0; gx < VW; gx += 48) { c.moveTo(gx, 0); c.lineTo(gx, VH); }
      for (var gy = 0; gy < VH; gy += 48) { c.moveTo(0, gy); c.lineTo(VW, gy); }
      c.stroke(); c.restore();
      
      var vg = c.createRadialGradient(VW / 2, VH / 2, 0, VW / 2, VH / 2, Math.min(VW, VH) * .75);
      vg.addColorStop(0, 'rgba(0,0,0,' + (.7 * cover) + ')'); vg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
      
      c.save(); c.globalAlpha = cover; c.strokeStyle = rgba(A, .9); c.lineWidth = 2.5;
      var m = Math.min(VW, VH) * .05, Ln = m * 1.3;
      c.beginPath();
      c.moveTo(m, m + Ln); c.lineTo(m, m); c.lineTo(m + Ln, m);
      c.moveTo(VW - m - Ln, m); c.lineTo(VW - m, m); c.lineTo(VW - m, m + Ln);
      c.moveTo(VW - m, VH - m - Ln); c.lineTo(VW - m, VH - m); c.lineTo(VW - m - Ln, VH - m);
      c.moveTo(m + Ln, VH - m); c.lineTo(m, VH - m); c.lineTo(m, VH - m - Ln); c.stroke(); c.restore();
    }
    
    var tp = pr(tt, 900, 1650), fade = 1 - pr(t, C, C + 380), sparks = [];
    if (tp > 0 && fade > 0) {
      var fs = Math.min(VW * .2, VH * .26, 190);
      title({
        cfg: cfg, p: tp, a: fade, style: 'drop', g: 0, time: tt, dy: -(1 - fade) * 10, bar: pr(tt, 1000, C),
        letterLand: function (idx, lx, ly, lp) { if (lp > .6) sparks.push([idx, lx, ly, (lp - .6) / .4]); }
      });
      
      for (i = 0; i < sparks.length; i++) {
        var s0 = sparks[i], landT = 900 + s0[0] * .13 * 750 + .6 * .5 * 750 * 1.0;
        var age = (tt - landT) / 1000;
        if (age < 0 || age > .9) continue;
        for (j = 0; j < 14; j++) {
          var ang = -Math.PI / 2 + (hs(s0[0] * 17 + j) - .5) * 2.6, sp = 160 + hs(s0[0] * 5 + j * 3) * 360;
          var px = s0[1] + Math.cos(ang) * sp * age, py = s0[2] + Math.sin(ang) * sp * age + 620 * age * age;
          c.globalAlpha = (1 - age / .9) * fade; c.fillStyle = j % 3 ? rgba(A, 1) : '#fff';
          c.shadowColor = rgba(B, 1); c.shadowBlur = 10; c.fillRect(px, py, 3, 3);
        }
        c.globalAlpha = 1; c.shadowBlur = 0;
      }
    }
  }

  
  function rPlay(t, cfg) {
    var A = cfg.rgb, B = cfg.rgb2, C = cfg.C, tt = Math.min(t, C);
    var cx = VW / 2, cy = VH / 2, maxR = Math.hypot(VW, VH) / 2;
    var coverIn = eo(pr(t, 0, 420));
    var portal = eio(pr(tt, 280, 1100));
    var burst = eio(pr(tt, 700, 1500));
    var fadeOut = eio(pr(t, C, cfg.D));
    var reveal = t < C ? 0 : fadeOut;

    
    var bg = c.createLinearGradient(0, 0, 0, VH);
    bg.addColorStop(0, 'rgba(2,18,28,' + coverIn + ')');
    bg.addColorStop(.45, 'rgba(1,10,18,' + coverIn + ')');
    bg.addColorStop(1, 'rgba(0,6,12,' + coverIn + ')');
    c.fillStyle = bg; c.fillRect(0, 0, VW, VH);

    
    var i, j;
    if (coverIn > 0) {
      for (i = 0; i < 5; i++) {
        var yp = VH * (.15 + i * .16);
        var amp = (18 + i * 10) * coverIn;
        var phase = tt * (0.0012 + i * 0.00025) + i * 1.7;
        c.beginPath();
        for (j = 0; j <= 40; j++) {
          var x = (j / 40) * VW;
          var y = yp + Math.sin(phase + j * 0.35 + i) * amp + Math.sin(phase * 1.7 + j * 0.15) * amp * 0.35;
          if (j === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        var band = c.createLinearGradient(0, yp - 40, 0, yp + 40);
        var alB = (.12 + i * .04) * coverIn * (1 - reveal * .85);
        band.addColorStop(0, 'rgba(0,0,0,0)');
        band.addColorStop(.5, i % 2 ? rgba(A, alB) : rgba(B, alB * .9));
        band.addColorStop(1, 'rgba(0,0,0,0)');
        c.strokeStyle = band; c.lineWidth = 28 + i * 6; c.lineCap = 'round'; c.stroke();
      }
    }

    
    c.save(); c.globalAlpha = coverIn * (1 - reveal);
    for (i = 0; i < 120; i++) {
      var seed = hs(i * 13.7);
      var ang = seed * 6.2832 + tt * 0.0004 * (0.5 + hs(i));
      var dist0 = maxR * (0.35 + hs(i * 2.1) * 0.9);
      var pull = eo(pr(tt, 200 + seed * 600, 1400));
      var dist = lerp(dist0, dist0 * 0.08, pull);
      var px = cx + Math.cos(ang) * dist, py = cy + Math.sin(ang) * dist;
      var sz = 1.2 + hs(i * 4) * 2.4;
      c.fillStyle = hs(i * 9) > .55 ? rgba(A, 0.55 + pull * 0.4) : 'rgba(220,255,250,' + (0.35 + pull * 0.5) + ')';
      c.beginPath(); c.arc(px, py, sz, 0, 6.2832); c.fill();
      if (pull > 0.4 && i % 5 === 0) {
        c.strokeStyle = rgba(A, 0.15 * pull); c.lineWidth = 1;
        c.beginPath(); c.moveTo(px, py); c.lineTo(cx, cy); c.stroke();
      }
    }
    c.restore();

    
    function hexPath(r, rot) {
      c.beginPath();
      for (var k = 0; k < 6; k++) {
        var a = rot + k * Math.PI / 3;
        var hx = cx + Math.cos(a) * r, hy = cy + Math.sin(a) * r;
        if (k === 0) c.moveTo(hx, hy); else c.lineTo(hx, hy);
      }
      c.closePath();
    }
    if (portal > 0) {
      var baseR = Math.min(VW, VH) * (0.12 + portal * 0.28);
      var rot = tt * 0.00055;
      for (i = 0; i < 3; i++) {
        c.save();
        c.globalAlpha = portal * (1 - i * 0.25) * (1 - reveal);
        c.strokeStyle = i === 0 ? rgba(A, 0.95) : rgba(B, 0.55);
        c.lineWidth = 2.5 - i * 0.5;
        c.shadowColor = rgba(A, 0.9); c.shadowBlur = 18 - i * 4;
        hexPath(baseR * (1 + i * 0.18), rot * (i % 2 ? -1 : 1) + i * 0.2);
        c.stroke();
        c.restore();
      }
      
      var glow = c.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.1);
      glow.addColorStop(0, rgba(A, 0.35 * portal * (1 - reveal)));
      glow.addColorStop(0.6, rgba(B, 0.12 * portal * (1 - reveal)));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow; c.fillRect(0, 0, VW, VH);

      
      if (burst > 0) {
        c.save(); c.globalAlpha = (1 - reveal) * Math.min(1, burst * 1.4);
        for (i = 0; i < 36; i++) {
          var ba = hs(i * 6.1) * 6.2832;
          var br = baseR * (0.9 + burst * (1.2 + hs(i * 3) * 2.5));
          var bx = cx + Math.cos(ba) * br, by = cy + Math.sin(ba) * br;
          var s = 4 + hs(i) * 10 * (1 - burst * 0.3);
          c.fillStyle = i % 3 === 0 ? rgba(A, 0.75) : 'rgba(180,255,240,' + (0.45 + hs(i) * 0.4) + ')';
          c.save(); c.translate(bx, by); c.rotate(ba + burst);
          c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.55, s * 0.4); c.lineTo(-s * 0.55, s * 0.4); c.closePath(); c.fill();
          c.restore();
        }
        c.restore();
      }
    }

    
    var scan = pr(tt, 500, 1600);
    if (scan > 0 && scan < 1) {
      var sy = lerp(-40, VH + 40, eio(scan));
      var sg = c.createLinearGradient(0, sy - 80, 0, sy + 4);
      sg.addColorStop(0, 'rgba(45,226,196,0)'); sg.addColorStop(1, rgba(A, 0.28));
      c.fillStyle = sg; c.fillRect(0, sy - 80, VW, 84);
      c.fillStyle = 'rgba(200,255,245,.85)'; c.fillRect(0, sy, VW, 2);
    }

    
    var tp = pr(tt, 720, 1450), fade = 1 - pr(t, C, C + 380);
    if (tp > 0 && fade > 0) {
      title({ cfg: cfg, p: tp, a: fade * (1 - reveal * 0.5), style: 'rise', g: 0, time: tt, bar: pr(tt, 900, C) });
    }

    
    if (t >= C) {
      var hole = eo(fadeOut) * maxR * 1.15;
      c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
      hexPath(Math.max(0, hole), fadeOut * 0.4);
      c.fill();
      c.restore();
      if (hole > 4 && fadeOut < 1) {
        c.save(); c.strokeStyle = rgba(A, 0.9 * (1 - fadeOut)); c.lineWidth = 3 + 5 * (1 - fadeOut);
        c.shadowColor = rgba(A, 1); c.shadowBlur = 22;
        hexPath(hole, fadeOut * 0.4); c.stroke(); c.restore();
      }
    } else {
      
      c.fillStyle = 'rgba(0,8,12,' + (0.08 * coverIn) + ')'; c.fillRect(0, 0, VW, VH);
    }
  }

  function render(kind, t, snap) {
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, VW, VH);
    var cfg = CFG[kind];
    if (kind === 'test') rTest(t, cfg, snap);
    else if (kind === 'build') rBuild(t, cfg);
    else rPlay(t, cfg);
  }

  
  function phase2(kind, snap, done) {
    var cfg = CFG[kind], s2 = 0;
    (function loop(now) {
      if (!cv) return;
      if (!s2) s2 = now;
      var t = cfg.C + (now - s2);
      if (t >= cfg.D) { unmount(); done && done(); return; }
      render(kind, t, snap); raf = requestAnimationFrame(loop);
    })(performance.now());
  }

  var api = {
    busy: false,
    kinds: CFG,
    
    play: function (kind, cb, opts) {
      opts = opts || {};
      if (busy || !CFG[kind]) return false;
      if (W.matchMedia && W.matchMedia('(prefers-reduced-motion:reduce)').matches) { try { cb && cb(); } catch (e) { console.error(e); } return true; }
      busy = true; api.busy = true; mount();
      if (opts.sound !== false) sfx(kind);
      var cfg = CFG[kind], t0 = performance.now();
      (function loop(now) {
        if (!cv) return;
        var t = now - t0;
        if (t < cfg.C) { render(kind, t, opts.snap); raf = requestAnimationFrame(loop); return; }
        render(kind, cfg.C, opts.snap);
        if (opts.nav) {
          try { sessionStorage.setItem(FLAG, kind + '|' + Date.now()); } catch (_) { }
          location.href = opts.nav; return;
        }
        try { cb && cb(); } catch (e) { console.error('[HawaFX cb]', e); }
        
        raf = requestAnimationFrame(function () { phase2(kind, opts.snap); });
      })(performance.now());
      return true;
    },
    
    preview: function (kind, t, snap) { if (!cv) { mount(); busy = true; api.busy = true; } render(kind, t, snap); },
    close: function () { unmount(); },
    navigate: function (kind, url) {
      if (!CFG[kind]) { location.href = url; return; }
      if (W.matchMedia && W.matchMedia('(prefers-reduced-motion:reduce)').matches) { location.href = url; return; }
      if (!api.play(kind, null, { nav: url })) location.href = url;
    },
    
    arrive: function () {
      var f = null;
      try { f = sessionStorage.getItem(FLAG); sessionStorage.removeItem(FLAG); } catch (_) { }
      if (!f) return false;
      var p = f.split('|'), kind = p[0];
      if (!CFG[kind] || Date.now() - (+p[1] || 0) > 12000) return false;
      busy = true; api.busy = true; mount(); render(kind, CFG[kind].C);
      var started = false;
      function go() {
        if (started) return; started = true;
        setTimeout(function () { raf = requestAnimationFrame(function () { phase2(kind, null); }); }, 180);
      }
      if (D.readyState === 'complete') go(); else { W.addEventListener('load', go); setTimeout(go, 4500); }
      return true;
    }
  };
  W.addEventListener('pageshow', function (e) { if (e.persisted) unmount(); });
  W.HawaFX = api;
  try { api.arrive(); } catch (e) { console.error('[HawaFX arrive]', e); }
})();
