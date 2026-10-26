'use strict';
// اختبار على شبكة وهمية بظروف حقيقية: تأخير + jitter + spikes + فقدان
// ساعة السيرفر مختلفة عن ساعة الكلاينت (الكود لازم يتعامل معاها بدون ما يعرف الفرق)
// الباكتات بتوصل في وقت وصولها الحقيقي (زي الـ socket callbacks)، مش مع الفريم
const N = require('./hawa-netcode-v2.js');

const FRAME = 1 / 60, SPEED = 6, SECONDS = 20;
const SERVER_OFFSET = 3.7;
const ME = 1, OTHER = 2, R = 8, W = SPEED / R;
const IDEAL = SPEED * FRAME;   // الخطوة المثالية لكل فريم = 0.1 وحدة

const PROFILES = [
  { name: 'LAN',        lat: 0.0005, jit: 0.0002, loss: 0.000, spikeP: 0.000, spikeMs: 0 },
  { name: 'WAN جيد',    lat: 0.025,  jit: 0.003,  loss: 0.005, spikeP: 0.002, spikeMs: 60 },
  { name: 'WAN متوسط',  lat: 0.060,  jit: 0.020,  loss: 0.020, spikeP: 0.010, spikeMs: 80 },
  { name: 'موبايل سيء', lat: 0.120,  jit: 0.050,  loss: 0.080, spikeP: 0.030, spikeMs: 150 }
];

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* ---------- الشبكة: قناة واحدة (اتجاه واحد) ---------- */
function makeChannel(p, rnd) {
  return { p, rnd, q: [], n: 0, bytes: 0 };
}
function sendOn(ch, now, payload, cb) {
  if (ch.rnd() < ch.p.loss) return;                       // فقد
  let d = ch.p.lat + (ch.rnd() * 2 - 1) * ch.p.jit;       // تأخير + jitter
  if (ch.rnd() < ch.p.spikeP) d += ch.p.spikeMs / 1000;   // spike
  ch.q.push({ at: now + Math.max(0, d), n: ch.n++, payload, cb });
}
/** يشغّل كل الأحداث اللي وصلت لحد upto بالترتيب الزمني الحقيقي */
function pump(channels, upto) {
  for (;;) {
    let best = null, bestCh = null, bestI = -1;
    for (const ch of channels) {
      for (let i = 0; i < ch.q.length; i++) {
        const e = ch.q[i];
        if (e.at <= upto && (!best || e.at < best.at || (e.at === best.at && e.n < best.n))) { best = e; bestCh = ch; bestI = i; }
      }
    }
    if (!best) break;
    bestCh.q.splice(bestI, 1);
    best.cb(best.payload, best.at);
  }
}

/* ---------- تشغيل سيناريو ---------- */
function run(p, seed = 42) {
  const rnd = rng(seed);
  const up = makeChannel(p, rnd), down = makeChannel(p, rnd);
  const chans = [up, down];
  const auth = new N.AuthServer(SPEED);
  auth.time = SERVER_OFFSET;
  auth.add(ME, { x: 0, z: 0 });
  auth.add(OTHER, { x: R, z: 0 });
  const pred = new N.Predictor({ x: 0, z: 0 }, SPEED);
  const remote = new N.RemoteBuffer();
  const clock = new N.ClockSync();

  const FRAMES = Math.round(SECONDS * 60);
  const NUDGE_FRAMES = [5 * 60, 11 * 60];
  let interval = 1, snapSeq = 0, bytesUp = 0, bytesDown = 0, rateNow = 60;
  let naive = null, heading = 0, nextTurn = 0;
  let intended = { x: 0, z: 0 };
  const truthB = [];
  const A = { vis: [], err: [] }, B = { vis: [], naive: [], err: [], lag: [] };
  let lossSum = 0, lossN = 0;

  for (let f = 0; f < FRAMES; f++) {
    const t = f * FRAME;

    // 0) وصول كل الباكتات اللي وقتها جه لحد دلوقتي (قبل ما اللعبة تشتغل في الفريم)
    pump(chans, t);

    // 1) إدخال اللاعب المحلي: اتجاه بيتغير عشوائياً
    if (t >= nextTurn) { heading += (rnd() - 0.5) * 2.2; nextTurn = t + 0.4 + rnd(); }
    const inp = pred.input(Math.cos(heading), Math.sin(heading), FRAME);
    intended = N.step(intended, inp, SPEED);

    // 2) إرسال الإنبوتس مع تكرار حسب الفقد
    const pkt = N.encodeInputs(pred.packet(remote.lossEst));
    bytesUp += pkt.byteLength;
    sendOn(up, t, pkt, (buf) => auth.receive(ME, N.decodeInputs(buf)));

    // 3) لاعب بعيد بيدور دايرة في السيرفر
    auth.receive(OTHER, [{ seq: f + 1, ...N.quantizeInput(-Math.sin(W * t), Math.cos(W * t), FRAME) }]);

    // 4) دفعة مفاجئة من السيرفر (تصادم/سكربت)
    if (NUDGE_FRAMES.includes(f)) { auth.nudge(ME, 1.5, 0); intended.x += 1.5; }

    // 5) خطوة السيرفر
    auth.tick(FRAME);
    truthB.push({ x: auth.players[OTHER].s.x, z: auth.players[OTHER].s.z });

    // 6) لقطة حسب معدل الإرسال المتكيّف
    if (f % interval === 0) {
      snapSeq++;
      const snap = auth.snapshot();
      const buf = N.encodeSnap(snapSeq, snap.time, snap.players);
      bytesDown += buf.byteLength;
      sendOn(down, t, buf, (b, now) => {
        const d = N.decodeSnap(b);
        pred.onServer(d.seq, d.players.find(q => q.id === ME));
        const ot = d.players.find(q => q.id === OTHER);
        remote.push(d.seq, d.time, ot, now);
        naive = ot;                       // baseline: آخر لقطة من غير أي interpolation
      });
    }

    // 7) ping/pong (كل ثانية) + تقرير الشبكة للسيرفر
    if (f % 60 === 0) {
      sendOn(up, t, { t0: t }, (m, now) => {
        const t1 = now + SERVER_OFFSET;                    // ساعة السيرفر وقت الاستقبال
        sendOn(down, now, { t0: m.t0, t1, t2: t1 }, (r, now2) => clock.onPong(r.t0, r.t1, r.t2, now2));
      });
    }
    if (f % 60 === 30) {
      sendOn(up, t, { rtt: clock.rtt, loss: remote.lossEst }, m => {
        rateNow = N.sendRateFor(m.rtt, m.loss, 48);
        interval = Math.max(1, Math.round(N.CFG.TICK_HZ / rateNow));
      });
    }

    // 8) الرسم
    pump(chans, t + FRAME);          // اللي هيوصل جوه الفريم الجاي
    remote.update(FRAME);
    if (f > 60) { lossSum += remote.lossEst; lossN++; }
    const vis = pred.frame(FRAME);
    const rs = remote.sample();
    A.vis.push(vis);
    A.err.push(Math.hypot(vis.x - intended.x, vis.z - intended.z));
    if (naive) B.naive.push({ x: naive.x, z: naive.z });
    if (rs && truthB.length >= 2) {
      B.vis.push(rs);
      const rt = remote.renderT - SERVER_OFFSET;          // وقت الحقيقة اللي بيتعرض
      B.lag.push(t - rt);
      const tr = rt / FRAME - 1, i0 = Math.min(truthB.length - 2, Math.max(0, Math.floor(tr))), fr = Math.min(1, Math.max(0, tr - i0));
      const tx = truthB[i0].x + (truthB[i0 + 1].x - truthB[i0].x) * fr, tz = truthB[i0].z + (truthB[i0 + 1].z - truthB[i0].z) * fr;
      B.err.push(Math.hypot(rs.x - tx, rs.z - tz));
    }
  }
  return { A, B, remote, clock, bytesUp, bytesDown, rateNow, FRAMES, lossAvg: lossSum / Math.max(1, lossN) };
}

const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
function steps(arr) { const r = []; for (let i = 1; i < arr.length; i++) r.push(Math.hypot(arr[i].x - arr[i - 1].x, arr[i].z - arr[i - 1].z)); return r; }
function stutter(stepsArr) {
  let freeze = 0, jerk = 0;
  for (const s of stepsArr) { if (s < 0.2 * IDEAL) freeze++; else if (s > 1.8 * IDEAL) jerk++; }
  return { freeze, jerk };
}

if (require.main === module) {
  console.log('==== Hawa Netcode v2 — نتائج على شبكة وهمية (20 ثانية لكل بروفايل) ====\n');
  for (const p of PROFILES) {
    const r = run(p);
    const warm = 60;
    const nudgeWin = new Set();
    [300, 660].forEach(n => { for (let i = n; i < n + 90; i++) nudgeWin.add(i); });
    const sA = steps(r.A.vis);
    let jerksA = 0; for (let i = 0; i < sA.length; i++) if (!nudgeWin.has(i + 1) && sA[i] > 1.8 * IDEAL) jerksA++;
    const stB = stutter(steps(r.B.vis.slice(warm)));
    const stN = stutter(steps(r.B.naive.slice(warm)));
    const errB = r.B.err.slice(warm);
    console.log(`--- ${p.name} | RTT حقيقي ${(p.lat * 2000).toFixed(0)}ms | loss ${(p.loss * 100).toFixed(1)}% | jitter ±${(p.jit * 1000).toFixed(0)}ms`);
    console.log(`  RTT مقاس: ${(r.clock.rtt * 1000).toFixed(1)}ms | خطأ الـ clock offset: ${((r.clock.offset - SERVER_OFFSET) * 1000).toFixed(1)}ms`);
    console.log(`  معدل اللقطات: ${r.rateNow}Hz | فقد مقاس (متوسط): ${(r.lossAvg * 100).toFixed(1)}% | buffer نهائي: ${(r.remote.D * 1000).toFixed(0)}ms`);
    console.log(`  باندويدث: صعود ${(r.bytesUp / SECONDS / 1024).toFixed(2)} KB/s | نزول ${(r.bytesDown / SECONDS / 1024).toFixed(2)} KB/s`);
    const errOutside = r.A.err.filter((_, i) => !nudgeWin.has(i));
    console.log(`  المحلي: خطأ بصري متوسط ${mean(errOutside).toFixed(4)} (خارج الدفعات) | نبضات خارج الدفعات: ${jerksA}`);
    console.log(`  البعيد (متكيّف): خطأ متوسط ${mean(errB).toFixed(4)} | p99 ${pct(errB, 0.99).toFixed(4)} | تجمّد ${stB.freeze} | نبضات ${stB.jerk}`);
    console.log(`  البعيد (من غير تكيّف): تجمّد ${stN.freeze} | نبضات ${stN.jerk}`);
    console.log(`  تأخير ظاهر للبعيد: ${(mean(r.B.lag.slice(warm)) * 1000).toFixed(0)}ms (RTT/2 = ${(p.lat * 1000).toFixed(0)}ms + buffer)\n`);
  }

  // ---------- اختبار الغش: كلاينت بيبعت dt كبير ----------
  {
    const a = new N.AuthServer(SPEED); a.add(1, { x: 0, z: 0 });
    let seq = 0;
    for (let f = 0; f < 600; f++) {                    // 10 ثواني سيرفر
      const batch = [];
      for (let k = 0; k < 3; k++) batch.push({ seq: ++seq, ...N.quantizeInput(1, 0, 0.05) });   // 180 إنبوت/ث بدل 60
      a.receive(1, batch); a.tick(FRAME);
    }
    const ratio = a.players[1].s.x / (SPEED * 10);
    console.log(`اختبار السرعة المزيفة: الحركة = ${(ratio * 100).toFixed(1)}% من الطبيعي (السقف ${(N.CFG.SLACK * 100).toFixed(0)}%)`);
  }

  // ---------- اختبار الـ codec ----------
  {
    const inputs = [{ seq: 99, ...N.quantizeInput(0.6, 0.8, 1 / 60) }, { seq: 100, ...N.quantizeInput(-1, 0, 0.02) }];
    const back = N.decodeInputs(N.encodeInputs(inputs));
    const okIn = back.every((b, i) => b.seq === inputs[i].seq && b.dx === inputs[i].dx && b.dz === inputs[i].dz && b.dt === inputs[i].dt);
    const snapBuf = N.encodeSnap(5, 123.456, [{ id: 1, ack: 9, x: 3.14159, z: -2.5, vx: 6, vz: 0 }, { id: 2, ack: 3, x: -40.2, z: 11.7, vx: 0, vz: 5.5 }]);
    const sn = N.decodeSnap(snapBuf);
    const posErr = Math.max(Math.abs(sn.players[0].x - 3.14159), Math.abs(sn.players[1].z - 11.7));
    console.log(`codec: إنبوتس ${okIn ? 'exact' : 'MISMATCH'} | لقطة ${snapBuf.byteLength} بايت لـ 2 لاعب | خطأ الكوانتايز ${posErr.toFixed(5)} وحدة`);
  }
}
module.exports = { run, PROFILES };
