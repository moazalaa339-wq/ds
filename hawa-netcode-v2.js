/* Hawa Netcode v2 — شبكة متكيّفة (Adaptive) للـ LAN والأونلاين
 *
 * الفكرة في سطرين:
 *  1) كل حاجة بتتقاس من الشبكة نفسها: RTT و jitter و loss وعرض الباند،
 *     ومنها بتتحدد معدلات الإرسال ومدة الـ buffer ودرجة الـ redundancy لحظة بلحظة.
 *  2) الرسم مابيقفزش: الـ buffer بيتحكم في سرعة ساعة الرسم نفسها (±5%)
 *     عشان يفضل فيه داتا كفاية قدامه، والتصحيح بيتعمل بالتدريج.
 *
 * المكونات:
 *  ClockSync    : قياس RTT وفرق الساعة (NTP-style ping/pong)
 *  Codec        : binary مُكمَّم (quantized) للإنبوتس واللقطات — أصغر وأسرع من JSON
 *  Predictor    : تنبؤ محلي + replay على تصحيح السيرفر + تنعيم بصري
 *  AuthServer   : مرجع السيرفر + ميزانية وقت (time bank) تمنع السرعة المزيفة
 *  RemoteBuffer : jitter buffer متكيّف + تحكم في سرعة الرسم + extrapolation محدود
 *  sendRateFor  : اختيار معدل اللقطات من حالة الشبكة
 */
(function (root) {
  'use strict';

  var CFG = {
    TICK_HZ: 60,          // معدل تيك السيرفر
    MAX_DT: 0.05,         // أقصى dt لأي إنبوت
    SLACK: 1.10,          // السيرفر بيسمح بزيادة 10% في الوقت (يغطي فروق الفريمات)
    BANK_CAP: 0.25,       // أقصى رصيد وقت متراكم (يسمح ببرست بعد لاج)
    QUEUE_MAX: 64,        // أقصى إنبوتس مستنيين للاعب
    EXTRAP_MAX: 0.25,     // أقصى extrapolation (ثانية)
    SNAP_DIST: 3.0,       // فرق أكبر من كده = teleport مش تصحيح تدريجي
    CORRECT_RATE: 6,      // سرعة تلاشي التصحيح البصري
    MIN_DELAY: 0.02,      // أقل buffer
    MAX_DELAY: 0.30,      // أكبر buffer
    RATE_GAIN: 0.8,       // قد إيه بنعدّل سرعة الرسم مع فرق الـ buffer
    RATE_MAX: 0.05,       // ±5% بس عشان مايبانش
    RESYNC_ERR: 0.5,      // لو الرسم متأخر أوي عن الداتا: قفزة واحدة للأمام
    MAX_BYTES_S: 30000    // ميزانية الداون-لينك للكلاينت (بايت/ث)
  };

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function median(arr) { var s = arr.slice().sort(function (a, b) { return a - b; }); return s[s.length >> 1]; }

  /* ================= الخطوة الحتمية (نفس الكود على الكلاينت والسيرفر) ================= */
  function step(s, inp, speed) {
    var dt = clamp(+inp.dt || 0, 0, CFG.MAX_DT);
    var dx = +inp.dx || 0, dz = +inp.dz || 0;
    var len = Math.sqrt(dx * dx + dz * dz);
    var vx = 0, vz = 0;
    if (len > 1e-9) { vx = dx / len * speed; vz = dz / len * speed; }
    return { x: s.x + vx * dt, z: s.z + vz * dt, vx: vx, vz: vz };
  }

  /** تكميم الإنبوت: الكلاينت بيطبّق القيم المكمّمة بالظبط اللي السيرفر هيستقبلها */
  function quantizeInput(dx, dz, dt) {
    var len = Math.sqrt(dx * dx + dz * dz);
    if (len > 1) { dx /= len; dz /= len; }
    return {
      dx: Math.round(dx * 1000) / 1000,
      dz: Math.round(dz * 1000) / 1000,
      dt: Math.round(clamp(dt, 0, CFG.MAX_DT) * 10000) / 10000
    };
  }

  /** عدد النسخ المكررة من الإنبوتس حسب نسبة الفقد */
  function redundancyFor(loss) { return clamp(2 + Math.ceil((loss || 0) * 30), 2, 8); }

  /* ================= Codec: binary مُكمَّم ================= */
  var T_INPUT = 1, T_SNAP = 2;
  var IN_HDR = 2, IN_REC = 10;          // type,count | seq u32, dx i16, dz i16, dt u16
  var SN_HDR = 14, SN_REC = 17;         // type,seq u32,time f64,count | id u8, ack u32, x i32, z i32, vx i16, vz i16

  function encodeInputs(list) {
    var n = Math.min(list.length, 255), start = list.length - n;
    var v = new DataView(new ArrayBuffer(IN_HDR + n * IN_REC));
    v.setUint8(0, T_INPUT); v.setUint8(1, n);
    for (var i = 0; i < n; i++) {
      var p = list[start + i], o = IN_HDR + i * IN_REC;
      v.setUint32(o, p.seq >>> 0, true);
      v.setInt16(o + 4, Math.round(p.dx * 1000), true);
      v.setInt16(o + 6, Math.round(p.dz * 1000), true);
      v.setUint16(o + 8, Math.round(p.dt * 10000), true);
    }
    return v.buffer;
  }
  function decodeInputs(buf) {
    if (!buf || buf.byteLength < IN_HDR) return [];
    var v = new DataView(buf);
    if (v.getUint8(0) !== T_INPUT) return [];
    var n = Math.min(v.getUint8(1), Math.floor((buf.byteLength - IN_HDR) / IN_REC)), out = [];
    for (var i = 0; i < n; i++) {
      var o = IN_HDR + i * IN_REC;
      out.push({
        seq: v.getUint32(o, true),
        dx: v.getInt16(o + 4, true) / 1000,
        dz: v.getInt16(o + 6, true) / 1000,
        dt: v.getUint16(o + 8, true) / 10000
      });
    }
    return out;
  }

  /** players: [{id, ack, x, z, vx, vz}] */
  function encodeSnap(seq, time, players) {
    var n = Math.min(players.length, 255);
    var v = new DataView(new ArrayBuffer(SN_HDR + n * SN_REC));
    v.setUint8(0, T_SNAP); v.setUint32(1, seq >>> 0, true);
    v.setFloat64(5, time, true); v.setUint8(13, n);
    for (var i = 0; i < n; i++) {
      var p = players[i], o = SN_HDR + i * SN_REC;
      v.setUint8(o, p.id);
      v.setUint32(o + 1, p.ack >>> 0, true);
      v.setInt32(o + 5, Math.round(p.x * 1000), true);
      v.setInt32(o + 9, Math.round(p.z * 1000), true);
      v.setInt16(o + 13, Math.round(p.vx * 100), true);
      v.setInt16(o + 15, Math.round(p.vz * 100), true);
    }
    return v.buffer;
  }
  function decodeSnap(buf) {
    if (!buf || buf.byteLength < SN_HDR) return null;     // باكت مقطوع: يتجاهل
    var v = new DataView(buf);
    if (v.getUint8(0) !== T_SNAP) return null;
    var n = Math.min(v.getUint8(13), Math.floor((buf.byteLength - SN_HDR) / SN_REC)), players = [];
    for (var i = 0; i < n; i++) {
      var o = SN_HDR + i * SN_REC;
      players.push({
        id: v.getUint8(o),
        ack: v.getUint32(o + 1, true),
        x: v.getInt32(o + 5, true) / 1000,
        z: v.getInt32(o + 9, true) / 1000,
        vx: v.getInt16(o + 13, true) / 100,
        vz: v.getInt16(o + 15, true) / 100
      });
    }
    return { seq: v.getUint32(1, true), time: v.getFloat64(5, true), players: players };
  }

  /* ================= ClockSync: RTT + فرق الساعة ================= */
  function ClockSync() { this.samples = []; this.offset = 0; this.rtt = 0.1; this.has = false; }
  /** t0: إرسال الكلاينت، t1: استقبال السيرفر، t2: إرسال السيرفر، t3: استقبال الكلاينت */
  ClockSync.prototype.onPong = function (t0, t1, t2, t3) {
    var rtt = (t3 - t0) - (t2 - t1);          // زمن الرحلة بس (من غير وقت معالجة السيرفر)
    if (rtt < 0 || rtt > 5) return;
    var off = ((t1 - t0) + (t2 - t3)) / 2;    // serverClock - clientClock
    this.samples.push({ rtt: rtt, off: off });
    if (this.samples.length > 16) this.samples.shift();
    // فلتر الـ min-RTT: بنعتمد على أقل 4 عينات (أقل جيتر)
    var best = this.samples.slice().sort(function (a, b) { return a.rtt - b.rtt; }).slice(0, 4);
    var m = median(best.map(function (s) { return s.off; }));
    this.offset = this.has ? this.offset + (m - this.offset) * 0.3 : m;
    this.rtt = this.has ? this.rtt + (rtt - this.rtt) * 0.2 : rtt;
    this.has = true;
  };
  ClockSync.prototype.serverNow = function (localNow) { return localNow + this.offset; };

  /* ================= Client: prediction + reconciliation ================= */
  function Predictor(initial, speed) {
    this.speed = speed || 6;
    this.seq = 0;
    this.pending = [];                                   // إنبوتس السيرفر لسه ماأكدهاش
    this.state = { x: initial.x, z: initial.z, vx: 0, vz: 0 };
    this.offset = { x: 0, z: 0 };                        // الإزاحة البصرية (بتتلاشى)
    this.lastTick = -1; this.ackSeq = 0; this.lastCorrection = 0;
  }
  /** كل فريم: يتطبّق فوراً (prediction) ويتخزن للإرسال */
  Predictor.prototype.input = function (dx, dz, dt) {
    var inp = quantizeInput(dx, dz, dt);
    inp.seq = ++this.seq;
    this.pending.push(inp);
    if (this.pending.length > CFG.QUEUE_MAX) this.pending.shift();
    this.state = step(this.state, inp, this.speed);
    return inp;
  };
  /** الإنبوتس اللي هيتبعت في الباكت (مكررة حسب الفقد) */
  Predictor.prototype.packet = function (loss) {
    return this.pending.slice(-redundancyFor(loss));
  };
  /** a = حالة اللاعب المحلي في اللقطة {x,z,vx,vz,ack} */
  Predictor.prototype.onServer = function (seq, a) {
    if (!a || seq <= this.lastTick || a.ack < this.ackSeq) return;   // قديمة أو مكررة
    this.lastTick = seq; this.ackSeq = a.ack;
    this.pending = this.pending.filter(function (i) { return i.seq > a.ack; });
    var s = { x: a.x, z: a.z, vx: a.vx, vz: a.vz };
    for (var i = 0; i < this.pending.length; i++) s = step(s, this.pending[i], this.speed);   // replay
    var ex = this.state.x - s.x, ez = this.state.z - s.z;
    var err = Math.sqrt(ex * ex + ez * ez);
    if (err > CFG.SNAP_DIST) { this.offset = { x: 0, z: 0 }; }
    else { this.offset.x += ex; this.offset.z += ez; }
    this.state = s;
    this.lastCorrection = err;
  };
  /** بتتنادى كل فريم للرسم */
  Predictor.prototype.frame = function (dt) {
    var k = Math.exp(-dt * CFG.CORRECT_RATE);
    this.offset.x *= k; this.offset.z *= k;
    if (Math.abs(this.offset.x) < 1e-4) this.offset.x = 0;
    if (Math.abs(this.offset.z) < 1e-4) this.offset.z = 0;
    return { x: this.state.x + this.offset.x, z: this.state.z + this.offset.z };
  };

  /* ================= Server (host): authoritative + time bank ================= */
  function AuthServer(speed) {
    this.speed = speed || 6;
    this.players = {};
    this.time = 0;                       // ساعة السيرفر
  }
  AuthServer.prototype.add = function (id, pos) {
    this.players[id] = { s: { x: pos.x, z: pos.z, vx: 0, vz: 0 }, last: 0, queue: [], bank: 0.05 };
  };
  AuthServer.prototype.receive = function (id, inputs) {
    var p = this.players[id]; if (!p) return;
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.seq <= p.last) continue;
      var dup = false;
      for (var j = 0; j < p.queue.length; j++) if (p.queue[j].seq === inp.seq) { dup = true; break; }
      if (!dup) p.queue.push(inp);
    }
    p.queue.sort(function (a, b) { return a.seq - b.seq; });
    if (p.queue.length > CFG.QUEUE_MAX) p.queue.splice(0, p.queue.length - CFG.QUEUE_MAX);
  };
  /** dt = وقت الفريم الحقيقي للسيرفر */
  AuthServer.prototype.tick = function (dt) {
    this.time += dt;
    for (var id in this.players) {
      var p = this.players[id];
      // الرصيد بيتجدد بمعدل الوقت الحقيقي × SLACK، ومايعديش BANK_CAP
      p.bank = Math.min(p.bank + dt * CFG.SLACK, CFG.BANK_CAP);
      // لو فيه فجوة والطابور اتكدس، معناه إنبوتس اتفقدت في كل النسخ: نتخطاها بدل ما نقف
      if (p.queue.length && p.queue[0].seq > p.last + 1 && p.queue.length >= CFG.QUEUE_MAX / 2) {
        p.last = p.queue[0].seq - 1;
      }
      while (p.queue.length && p.queue[0].seq === p.last + 1 && p.bank >= p.queue[0].dt) {
        var inp = p.queue.shift();
        p.bank -= inp.dt;
        p.s = step(p.s, inp, this.speed);
        p.last = inp.seq;
      }
    }
  };
  /** لقطة: {time, players:[{id, ack, x, z, vx, vz}]} */
  AuthServer.prototype.snapshot = function () {
    var arr = [];
    for (var id in this.players) {
      var p = this.players[id];
      arr.push({ id: +id, ack: p.last, x: p.s.x, z: p.s.z, vx: p.s.vx, vz: p.s.vz });
    }
    return { time: this.time, players: arr };
  };
  /** تعديل من بره (تصادم/دفعة) — لازم يتبعت في اللقطة */
  AuthServer.prototype.nudge = function (id, dx, dz) {
    var p = this.players[id]; if (p) { p.s.x += dx; p.s.z += dz; }
  };

  /** معدل اللقطات: الأصل أعلى معدل (التأخير بيتحكم فيه الـ buffer، واللقطة مش مكلفة).
   *  بننزل المعدل بس لو الميزانية (bandwidth) اتعدّت — مثلاً مع لاعبين كتير. */
  function sendRateFor(rtt, loss, bytesPerSnap) {
    var budget = Math.floor(CFG.MAX_BYTES_S / bytesPerSnap);
    return Math.max(10, Math.min(CFG.TICK_HZ, budget));
  }

  /* ================= Remote players: jitter buffer متكيّف ================= */
  function popcount32(x) {
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
  }
  function RemoteBuffer() {
    this.snaps = [];
    this.renderT = null;      // ساعة الرسم (بوقت السيرفر)
    this.D = 0.05;            // الـ buffer الحالي (ثانية)
    this.rate = 1;            // سرعة ساعة الرسم الحالية
    this.jitter = 0.002;      // تقدير الجيتر (ثانية)
    this.interval = 1 / 30;   // المسافة بين اللقطات
    this.lossEst = 0;         // تقدير فقد اللقطات (بيستبعد المتأخرة اللي وصلت)
    this.maxSeq = -1; this.first = -1; this.mask = 0;   // نافذة آخر 32 لقطة
    this.lastT = 0; this.lastArr = 0; this.prevSeq = -1;
  }
  /** seq: رقم اللقطة، t: وقت السيرفر، s: حالة اللاعب، now: وقت الاستقبال عند الكلاينت */
  RemoteBuffer.prototype.push = function (seq, t, s, now) {
    if (!s) return;
    // ---- تتبع الفقد بنافذة bitmap: اللقطة المتأخرة بتتحسب "وصلت" مش "اتفقدت"
    if (this.maxSeq < 0) { this.maxSeq = seq; this.first = seq; this.mask = 1; }
    else if (seq > this.maxSeq) {
      var sh = seq - this.maxSeq;
      this.mask = sh >= 32 ? 1 : (((this.mask << sh) | 1) >>> 0);
      this.maxSeq = seq;
    } else {
      var back = this.maxSeq - seq;
      if (back >= 32) return;                           // قديمة أوي
      var bit = (1 << back) >>> 0;
      if (this.mask & bit) return;                      // مكررة
      this.mask = (this.mask | bit) >>> 0;
    }
    // نحسب الفقد على اللقطات القديمة (بعد K) عشان اللقطات اللي في الطريق متتحسبش مفقودة
    var K = 8, span = Math.min(32 - K, this.maxSeq - this.first + 1 - K);
    if (span > 0) {
      var raw = 1 - popcount32(this.mask >>> K) / span;
      this.lossEst += (raw - this.lossEst) * 0.1;
    }

    var newest = this.snaps.length ? this.snaps[this.snaps.length - 1].t : -Infinity;
    if (t > newest) {
      // ---- جيتر وتسلسل: بيتحسبوا على اللقطات اللي جاية بالترتيب بس
      if (this.lastArr !== 0 && seq > this.prevSeq) {
        var n = seq - this.prevSeq;
        this.interval += ((t - this.lastT) / n - this.interval) * 0.1;
        // الجيتر = تغيّر زمن الوصول مقارنة بزمن التوليد (الفرق بيلغي الـ offset بين الساعتين)
        this.jitter += (Math.abs((now - this.lastArr) - (t - this.lastT)) - this.jitter) / 16;
      }
      this.lastT = t; this.lastArr = now; this.prevSeq = seq;
    }
    // ---- إدخال مرتب بالوقت (اللقطة المتأخرة ممكن تتحط في مكانها لو لسه بتفيد)
    var i = this.snaps.length;
    while (i > 0 && this.snaps[i - 1].t > t) i--;
    if (i > 0 && this.snaps[i - 1].t === t) return;
    this.snaps.splice(i, 0, { t: t, x: s.x, z: s.z, vx: s.vx, vz: s.vz });

    var keepFrom = (this.renderT === null ? t : this.renderT) - 1.0;
    while (this.snaps.length > 2 && this.snaps[0].t < keepFrom) this.snaps.shift();
    if (this.renderT === null) this.renderT = t - this.D;
  };
  /** بتتنادى كل فريم: بتعدّل الـ buffer وسرعة الرسم */
  RemoteBuffer.prototype.update = function (dt) {
    // الـ buffer = 2 لقطة + جيتر + تعويض فقد (لقطة أو اتنين بس، مش أكتر)
    var lossSteps = Math.min(2, Math.round(this.lossEst * 15));
    var target = clamp(2 * this.interval + 2 * this.jitter + this.interval * lossSteps,
                       CFG.MIN_DELAY, CFG.MAX_DELAY);
    this.D += (target - this.D) * Math.min(1, dt * 0.5);     // يتغير ببطء
    if (this.renderT === null || !this.snaps.length) return;
    var newest = this.snaps[this.snaps.length - 1].t;
    var err = (newest - this.renderT) - this.D;              // >0 يعني الرسم متأخر عن المخزون
    if (err > CFG.RESYNC_ERR) { this.renderT = newest - this.D; err = 0; }
    // time dilation: نسرّع/نبطّئ ساعة الرسم شوية عشان الـ buffer يرجع لمكانه بدون قفز
    this.rate = 1 + clamp(err * CFG.RATE_GAIN, -CFG.RATE_MAX, CFG.RATE_MAX);
    this.renderT += dt * this.rate;
  };
  /** الوضع المرسوم دلوقتي للاعب البعيد */
  RemoteBuffer.prototype.sample = function () {
    var b = this.snaps, rt = this.renderT;
    if (!b.length || rt === null) return null;
    if (rt <= b[0].t) return { x: b[0].x, z: b[0].z };
    for (var i = 0; i < b.length - 1; i++) {
      var a = b[i], c = b[i + 1];
      if (rt >= a.t && rt <= c.t) {
        var k = (rt - a.t) / Math.max(c.t - a.t, 1e-6);
        return { x: a.x + (c.x - a.x) * k, z: a.z + (c.z - a.z) * k };
      }
    }
    var last = b[b.length - 1];
    var ahead = Math.min(rt - last.t, CFG.EXTRAP_MAX);
    return { x: last.x + last.vx * ahead, z: last.z + last.vz * ahead };
  };

  var api = {
    CFG: CFG, step: step, quantizeInput: quantizeInput, redundancyFor: redundancyFor,
    encodeInputs: encodeInputs, decodeInputs: decodeInputs,
    encodeSnap: encodeSnap, decodeSnap: decodeSnap,
    ClockSync: ClockSync, Predictor: Predictor, AuthServer: AuthServer,
    RemoteBuffer: RemoteBuffer, sendRateFor: sendRateFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HawaNetcode = api;
})(typeof window !== 'undefined' ? window : globalThis);
