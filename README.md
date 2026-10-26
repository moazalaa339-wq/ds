# Hawa Netcode v2 — شبكة متكيّفة

## الملفات
- hawa-netcode-v2.js : المحرك (مستقل عن الترانسبورت، شغال في المتصفح و Node)
- sim_test_v2.js     : اختبار على شبكة وهمية (LAN / WAN جيد / WAN متوسط / موبايل سيء)

تشغيل الاختبار: `node sim_test_v2.js`

## الفكرة
1. الشبكة بتقيس نفسها: RTT بـ ping/pong، جيتر، فقد (بنافذة bitmap تستبعد اللقطات اللي لسه في الطريق)،
   وعرض الباند. كل القرارات (buffer، redundancy، معدل اللقطات) بتتبني على القياسات دي.
2. الرسم مابيقفزش: الـ buffer بيتحكم في سرعة ساعة الرسم نفسها (±5%) عشان يرجع لحجمه المطلوب بالتدريج.
3. الكلاينت مش محتاج يعرف فرق الساعة مع السيرفر: التزامن بيتعدل بالـ rate control، فالـ clock offset بيتقاس للـ RTT بس.
4. بيانات binary مُكمَّمة (48 بايت لقطة لـ 2 لاعب، 10 بايت لكل إنبوت).
5. السيرفر فيه time bank: أي كلاينت مش ممكن يتحرك أسرع من 110% من الوقت الحقيقي، مهما بعت من dt.

## ربط بالمحرك
### السيرفر (المضيف)
    const auth = new HawaNetcode.AuthServer(speed);
    auth.add(playerId, {x, z});                     // playerId رقم 0..255
    // عند وصول باكت إنبوتس من لاعب:
    auth.receive(playerId, HawaNetcode.decodeInputs(buf));
    // كل تيك (60Hz):
    auth.tick(dt);
    // كل لقطة (حسب تقدير الإرسال):
    const snap = auth.snapshot();
    const buf = HawaNetcode.encodeSnap(snapSeq++, snap.time, snap.players);
    // لو الميزانية اتعدّت:  const hz = HawaNetcode.sendRateFor(rtt, loss, bytesPerSnap)

### الكلاينت
    const pred = new HawaNetcode.Predictor({x, z}, speed);
    const remote = new HawaNetcode.RemoteBuffer();
    const clock = new HawaNetcode.ClockSync();

    // كل فريم (المحلي):
    pred.input(dx, dz, dt);                                  // بيتطبق فوراً
    send(HawaNetcode.encodeInputs(pred.packet(remote.lossEst)));  // مكرر حسب الفقد

    // لما تيجي لقطة:
    const d = HawaNetcode.decodeSnap(buf);
    pred.onServer(d.seq, d.players.find(p => p.id === myId));
    remote.push(d.seq, d.time, d.players.find(p => p.id === otherId), nowLocal());

    // كل فريم للرسم:
    remote.update(dt);
    const me = pred.frame(dt);                 // موقعي المرسوم
    const other = remote.sample();             // موقع اللاعب البعيد المرسوم

    // ping كل ثانية:
    send({t0: now()});  ... على pong {t0,t1,t2}: clock.onPong(t0, t1, t2, now());

## ملاحظات مهمة
- **الـ ping الفيزيائي مايتقللش.** اللي بنعمله: اللاعب المحلي بيتحرك فوراً (prediction)، والبعيد بيتعرض بأقل buffer ممكن.
  أقل تأخير ممكن للبعيد = نص الـ RTT (زمن وصول الداتا) + حجم الـ buffer.
- **الترانسبورت مهم جداً:** TCP/WebSocket بيعمل head-of-line blocking: باكت واحد بيتفقد بيوقف كل حاجة لحد ما يتعاد، وده هو التقطيع بالظبط.
  استخدم UDP أو WebRTC DataChannel بوضع `ordered: false, maxRetransmits: 0` للمواقع والإنبوتس.
- النتايج اللي فوق على شبكة وهمية. لازم تتجرب على شبكتين حقيقيتين (ولو على LAN: استخدم `tc netem` على Linux لمحاكاة الفقد والتأخير).
- ما اتعملش: Lag compensation لضرب/إطلاق النار، ودعم الـ Interest management للعالم الكبير. دول الخطوة الجاية لو محتاجينهم.
