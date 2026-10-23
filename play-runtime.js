/* Hawa Play Runtime + Net
   - PeerJS (إنترنت): عبر سيرفر Peer العام
   - LAN WebRTC: شبكة محلية عبر سيرفر Hawa المحلي
   - Codes (تبادل الأكواد): WebRTC يدوي — نسخ/لصق SDP — من غير بايثون ومن غير PeerJS
   - حد أقصى 3 لاعبين
*/
'use strict';

const HawaNet = (() => {
  function randCode() {
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function randId(prefix) {
    return (prefix || 'p') + '-' + randCode() + randCode().slice(0, 2);
  }

  /* ---------- إنترنت: PeerJS ---------- */
  async function createHost({ roomName, gameName, onPeerJoin, onPeerLeave, onMessage }) {
    if (typeof Peer === 'undefined') throw new Error('PeerJS غير محمّل');
    const code = randCode();
    const peer = new Peer(code, { debug: 0 });
    await new Promise((res, rej) => {
      peer.on('open', res);
      peer.on('error', rej);
      setTimeout(() => rej(new Error('timeout Peer — تأكد من اتصال الإنترنت')), 15000);
    });
    const conns = new Map();
    peer.on('connection', conn => {
      conn.on('open', () => {
        conns.set(conn.peer, conn);
        const api = {
          id: conn.peer,
          playerName: null,
          send(m) { try { conn.send(m); } catch (_) {} },
          close() { try { conn.close(); } catch (_) {} }
        };
        conn.on('data', d => {
          if (d && d.t === 'hello') {
            api.playerName = d.name || 'لاعب';
            onPeerJoin && onPeerJoin(api);
          } else onMessage && onMessage(conn.peer, d);
        });
        conn.on('close', () => {
          conns.delete(conn.peer);
          onPeerLeave && onPeerLeave(conn.peer);
        });
      });
    });
    return {
      transport: 'peerjs',
      code,
      peerId: peer.id,
      broadcast(m) { for (const c of conns.values()) try { c.send(m); } catch (_) {} },
      sendTo(id, m) { const c = conns.get(id); if (c) try { c.send(m); } catch (_) {} },
      destroy() { try { peer.destroy(); } catch (_) {} }
    };
  }

  async function joinHost({ code, roomName, playerName, onWelcome, onLobby, onStart, onMessage, onClose }) {
    if (typeof Peer === 'undefined') throw new Error('PeerJS غير محمّل');
    const peer = new Peer({ debug: 0 });
    await new Promise((res, rej) => {
      peer.on('open', res);
      peer.on('error', rej);
      setTimeout(() => rej(new Error('timeout Peer — تأكد من الإنترنت')), 15000);
    });
    const conn = peer.connect(code, { reliable: true });
    await new Promise((res, rej) => {
      conn.on('open', res);
      conn.on('error', rej);
      setTimeout(() => rej(new Error('فشل الاتصال بالكود — تأكد إنه صحيح والمضيف فاتح')), 15000);
    });
    conn.send({ t: 'hello', name: playerName, room: roomName });
    conn.on('data', d => {
      if (!d || !d.t) return;
      if (d.t === 'welcome') onWelcome && onWelcome(d);
      else if (d.t === 'lobby') onLobby && onLobby(d.players || []);
      else if (d.t === 'start') onStart && onStart(d);
      else if (d.t === 'full') { onClose && onClose(); alert('الرووم ممتلئ'); }
      else onMessage && onMessage('host', d);
    });
    conn.on('close', () => onClose && onClose());
    return {
      transport: 'peerjs',
      code,
      peerId: peer.id,
      broadcast(m) { try { conn.send(m); } catch (_) {} },
      sendTo() { try { conn.send(arguments[1]); } catch (_) {} },
      destroy() { try { conn.close(); peer.destroy(); } catch (_) {} }
    };
  }

  /* ---------- LAN: WebRTC + سيرفر Hawa المحلي للتوقيع ---------- */
  function lanBase() {
    // نفس أصل الصفحة (السيرفر المحلي)
    return location.origin;
  }

  async function lanFetch(path, opts) {
    const r = await fetch(lanBase() + path, opts);
    let j = null;
    try { j = await r.json(); } catch (_) {}
    if (!r.ok) throw new Error((j && j.error) || ('HTTP ' + r.status));
    return j;
  }

  function makePC() {
    // بدون STUN عام → يعتمد على عناوين الشبكة المحلية فقط
    return new RTCPeerConnection({ iceServers: [] });
  }

  async function createHostLan({ roomName, hostName, onPeerJoin, onPeerLeave, onMessage, onPlayers }) {
    const peerId = randId('h');
    const created = await lanFetch('/api/lan/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, hostName: hostName || 'مضيف', peerId })
    });
    const code = created.code;
    const channels = new Map(); // remotePeerId -> {pc, dc, api}
    let pollAfter = 0;
    let stopped = false;
    let knownPlayers = created.players || [{ id: peerId, name: hostName || 'مضيف', slot: 1, host: true }];

    async function ensureChannel(remoteId) {
      if (channels.has(remoteId)) return channels.get(remoteId);
      const pc = makePC();
      const dc = pc.createDataChannel('hawa', { ordered: true });
      const entry = { pc, dc, api: null, remoteId };
      channels.set(remoteId, entry);

      pc.onicecandidate = e => {
        if (!e.candidate) return;
        lanFetch('/api/lan/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, from: peerId, to: remoteId, type: 'ice', candidate: e.candidate })
        }).catch(() => {});
      };

      const api = {
        id: remoteId,
        playerName: null,
        send(m) { try { if (dc.readyState === 'open') dc.send(JSON.stringify(m)); } catch (_) {} },
        close() { try { dc.close(); pc.close(); } catch (_) {} }
      };
      entry.api = api;

      dc.onopen = () => {};
      dc.onclose = () => {
        channels.delete(remoteId);
        onPeerLeave && onPeerLeave(remoteId);
      };
      dc.onmessage = ev => {
        let d = null;
        try { d = JSON.parse(ev.data); } catch (_) { return; }
        if (d && d.t === 'hello') {
          api.playerName = d.name || 'لاعب';
          onPeerJoin && onPeerJoin(api);
        } else onMessage && onMessage(remoteId, d);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await lanFetch('/api/lan/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, from: peerId, to: remoteId, type: 'offer', sdp: pc.localDescription })
      });
      return entry;
    }

    async function poll() {
      if (stopped) return;
      try {
        const res = await lanFetch('/api/lan/signal/' + code + '?peer=' + encodeURIComponent(peerId) + '&after=' + pollAfter);
        if (res.serverTime) pollAfter = res.serverTime;
        if (res.players) {
          knownPlayers = res.players;
          onPlayers && onPlayers(res.players);
          // أي ضيف جديد مفيش قناة معاه → اعمل offer
          for (const p of res.players) {
            if (p.id === peerId) continue;
            if (!channels.has(p.id)) ensureChannel(p.id).catch(e => console.warn('LAN offer', e));
          }
        }
        for (const s of (res.signals || [])) {
          if (s.from === peerId) continue;
          if (s.type === 'answer' && s.sdp) {
            const entry = channels.get(s.from);
            if (entry && entry.pc.signalingState !== 'stable') {
              try { await entry.pc.setRemoteDescription(s.sdp); } catch (e) { console.warn(e); }
            }
          } else if (s.type === 'ice' && s.candidate) {
            const entry = channels.get(s.from);
            if (entry) {
              try { await entry.pc.addIceCandidate(s.candidate); } catch (_) {}
            }
          }
        }
      } catch (e) { /* سيرفر مش جاهز أو شبكة */ }
      if (!stopped) setTimeout(poll, 700);
    }
    poll();

    return {
      transport: 'lan',
      code,
      peerId,
      broadcast(m) {
        for (const e of channels.values()) {
          try { if (e.dc.readyState === 'open') e.dc.send(JSON.stringify(m)); } catch (_) {}
        }
      },
      sendTo(id, m) {
        const e = channels.get(id);
        if (e && e.dc.readyState === 'open') try { e.dc.send(JSON.stringify(m)); } catch (_) {}
      },
      destroy(keepRoom) {
        stopped = true;
        for (const e of channels.values()) try { e.dc.close(); e.pc.close(); } catch (_) {}
        channels.clear();
        if (!keepRoom) lanFetch('/api/lan/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, peerId })
        }).catch(() => {});
      }
    };
  }

  async function joinHostLan({ code, playerName, onWelcome, onLobby, onStart, onMessage, onClose, onPlayers }) {
    code = String(code || '').trim().toUpperCase();
    const peerId = randId('g');
    const joined = await lanFetch('/api/lan/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name: playerName || 'لاعب', peerId })
    });
    if (!joined.ok) throw new Error(joined.error || 'فشل الانضمام');

    const hostId = joined.hostId;
    const pc = makePC();
    let dc = null;
    let pollAfter = 0;
    let stopped = false;
    let opened = false;

    pc.onicecandidate = e => {
      if (!e.candidate) return;
      lanFetch('/api/lan/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, from: peerId, to: hostId, type: 'ice', candidate: e.candidate })
      }).catch(() => {});
    };

    pc.ondatachannel = ev => {
      dc = ev.channel;
      dc.onopen = () => {
        opened = true;
        try { dc.send(JSON.stringify({ t: 'hello', name: playerName || 'لاعب', room: joined.roomName })); } catch (_) {}
      };
      dc.onclose = () => { onClose && onClose(); };
      dc.onmessage = ev2 => {
        let d = null;
        try { d = JSON.parse(ev2.data); } catch (_) { return; }
        if (!d || !d.t) return;
        if (d.t === 'welcome') onWelcome && onWelcome(d);
        else if (d.t === 'lobby') onLobby && onLobby(d.players || []);
        else if (d.t === 'start') onStart && onStart(d);
        else if (d.t === 'full') { onClose && onClose(); alert('الرووم ممتلئ'); }
        else if (d.t === 'kick' && d.slot === joined.slot) { alert('تم طردك'); onClose && onClose(); }
        else onMessage && onMessage('host', d);
      };
    };

    async function poll() {
      if (stopped) return;
      try {
        const res = await lanFetch('/api/lan/signal/' + code + '?peer=' + encodeURIComponent(peerId) + '&after=' + pollAfter);
        if (res.serverTime) pollAfter = res.serverTime;
        if (res.players) {
          onPlayers && onPlayers(res.players);
          onLobby && onLobby(res.players);
        }
        if (res.started) onStart && onStart({ t: 'start', voice: true });
        for (const s of (res.signals || [])) {
          if (s.from === peerId) continue;
          if (s.type === 'offer' && s.sdp && (s.to === peerId || s.to === '*')) {
            try {
              await pc.setRemoteDescription(s.sdp);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await lanFetch('/api/lan/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, from: peerId, to: s.from, type: 'answer', sdp: pc.localDescription })
              });
            } catch (e) { console.warn('LAN answer', e); }
          } else if (s.type === 'ice' && s.candidate) {
            try { await pc.addIceCandidate(s.candidate); } catch (_) {}
          }
        }
      } catch (e) {}
      if (!stopped) setTimeout(poll, 700);
    }
    poll();

    // welcome محلي فوري من بيانات الانضمام
    onWelcome && onWelcome({
      t: 'welcome',
      slot: joined.slot,
      players: joined.players,
      roomName: joined.roomName,
      gameName: ''
    });

    return {
      transport: 'lan',
      code,
      peerId,
      slot: joined.slot,
      broadcast(m) { try { if (dc && dc.readyState === 'open') dc.send(JSON.stringify(m)); } catch (_) {} },
      sendTo() { try { if (dc && dc.readyState === 'open') dc.send(JSON.stringify(arguments[1])); } catch (_) {} },
      destroy(keepRoom) {
        stopped = true;
        try { if (dc) dc.close(); pc.close(); } catch (_) {}
        if (!keepRoom) lanFetch('/api/lan/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, peerId })
        }).catch(() => {});
      }
    };
  }


  /* ---------- تبادل الأكواد: WebRTC يدوي (من غير بايثون / PeerJS) ---------- */
  function rtcIceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];
  }
  function rtcSanitizeCode(code) {
    let s = String(code || '');
    s = s.replace(/[\u200B-\u200D\uFEFF\u00A0\u202A-\u202E\u2066-\u2069]/g, '');
    s = s.replace(/[\r\n\t\f\v ]+/g, '');
    s = s.replace(/^SM1\./i, '');
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    s = s.replace(/[^A-Za-z0-9+/=]/g, '');
    const pad = s.length % 4;
    if (pad === 1) throw new Error('الكود ناقص أو اتقطع أثناء النسخ');
    if (pad === 2) s += '==';
    else if (pad === 3) s += '=';
    return s;
  }
  function rtcUtf8ToB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function rtcB64ToUtf8(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function rtcNormalizeSdp(sdp, role) {
    var s = String(sdp || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var lines = s.split('\n');
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (/^a=max-message-size:/i.test(line)) continue;
      if (/^a=x-/i.test(line)) continue;
      if (/^a=extmap-allow-mixed/i.test(line)) continue;
      if (role === 'answer' && /^a=setup:/i.test(line)) {
        if (/actpass/i.test(line)) line = 'a=setup:active';
        else if (!/active|passive|holdconn/i.test(line)) line = 'a=setup:active';
      }
      out.push(line);
    }
    if (role === 'answer') {
      var result = [];
      var i = 0;
      while (i < out.length) {
        var line = out[i];
        result.push(line);
        if (/^m=/i.test(line)) {
          var j = i + 1, hasSetup = false;
          while (j < out.length && !/^m=/i.test(out[j])) {
            if (/^a=setup:/i.test(out[j])) hasSetup = true;
            j++;
          }
          if (!hasSetup) result.push('a=setup:active');
        }
        i++;
      }
      return result.join('\r\n') + '\r\n';
    }
    return out.join('\r\n') + '\r\n';
  }
  function rtcEncodeSdp(sdp, role) {
    var s = rtcNormalizeSdp(sdp, role || null);
    if (!s || s.indexOf('v=0') < 0) throw new Error('SDP غير جاهز');
    if (s.indexOf('m=') < 0) throw new Error('SDP ناقص');
    var b64 = rtcUtf8ToB64(s);
    var lines = [];
    for (var i = 0; i < b64.length; i += 64) lines.push(b64.substr(i, 64));
    return 'SM1.\n' + lines.join('\n');
  }
  function rtcDecodeSdp(code, role) {
    var raw = rtcSanitizeCode(code);
    if (!raw || raw.length < 20) throw new Error('الكود قصير جدًا — انسخه كامل');
    var sdp;
    try { sdp = rtcB64ToUtf8(raw); }
    catch (e) { throw new Error('فشل فك الكود — انسخه كامل من غير قص'); }
    sdp = rtcNormalizeSdp(sdp, role || null);
    if (sdp.indexOf('v=0') < 0) throw new Error('كود غير صالح بعد الفك');
    if (sdp.indexOf('m=') < 0) throw new Error('الكود مش مكتمل');
    return sdp;
  }
  function rtcWaitIce(pc, ms) {
    return new Promise(resolve => {
      if (!pc || pc.iceGatheringState === 'complete') return resolve();
      let done = false;
      const finish = () => { if (done) return; done = true; try { pc.removeEventListener('icecandidate', onCand); } catch (_) {} resolve(); };
      const onCand = (ev) => { if (!ev.candidate) finish(); };
      pc.addEventListener('icecandidate', onCand);
      setTimeout(finish, ms || 4000);
    });
  }
  function rtcMakePc() {
    return new RTCPeerConnection({ iceServers: rtcIceServers() });
  }

  /**
   * Host: ينشئ Offer ويُرجعه كنص للنسخ. بعد ما الضيف يبعت Answer → applyAnswer(code).
   */
  async function createHostCodes({ roomName, hostName, onPeerJoin, onPeerLeave, onMessage }) {
    if (typeof RTCPeerConnection === 'undefined') throw new Error('المتصفح لا يدعم WebRTC');
    const code = randCode();
    const pc = rtcMakePc();
    const dc = pc.createDataChannel('hawa', { ordered: true });
    const conns = new Map();
    let remoteApi = null;

    const api = {
      transport: 'codes',
      code,
      peerId: code,
      roomName: roomName || 'CODES',
      hostName: hostName || 'مضيف',
      _pc: pc,
      _dc: dc,
      offerCode: null,
      status: 'waiting-offer',
      broadcast(m) {
        const payload = (typeof m === 'string') ? m : JSON.stringify(m);
        // قناة واحدة — لا تكرر الإرسال عبر remoteApi و dc
        try { if (dc.readyState === 'open') dc.send(payload); } catch (_) {}
      },
      sendTo(id, m) {
        if (remoteApi && (id === remoteApi.id || id === 'guest')) try { remoteApi.send(m); } catch (_) {}
      },
      destroy() {
        try { dc.close(); } catch (_) {}
        try { pc.close(); } catch (_) {}
        conns.clear();
      },
      async makeOffer() {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await rtcWaitIce(pc, 4500);
        const sdp = pc.localDescription && pc.localDescription.sdp;
        this.offerCode = rtcEncodeSdp(sdp, 'offer');
        this.status = 'offer-ready';
        return this.offerCode;
      },
      async applyAnswer(answerCode) {
        const sdp = rtcDecodeSdp(answerCode, 'answer');
        await pc.setRemoteDescription({ type: 'answer', sdp });
        this.status = 'connecting';
      }
    };

    dc.onopen = () => {
      const id = 'guest-' + randCode().slice(0, 4);
      remoteApi = {
        id,
        playerName: null,
        send(m) { try { if (dc.readyState === 'open') dc.send(JSON.stringify(m)); } catch (_) {} },
        close() { try { dc.close(); } catch (_) {} }
      };
      conns.set(id, remoteApi);
      api.status = 'connected';
      // انتظر hello
    };
    dc.onmessage = (ev) => {
      let d = ev.data;
      try { d = typeof d === 'string' ? JSON.parse(d) : d; } catch (_) {}
      if (d && d.t === 'hello') {
        if (remoteApi) {
          remoteApi.playerName = d.name || 'لاعب';
          onPeerJoin && onPeerJoin(remoteApi);
        }
      } else if (remoteApi) {
        onMessage && onMessage(remoteApi.id, d);
      }
    };
    dc.onclose = () => {
      if (remoteApi) {
        conns.delete(remoteApi.id);
        onPeerLeave && onPeerLeave(remoteApi.id);
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (remoteApi) onPeerLeave && onPeerLeave(remoteApi.id);
      }
    };

    await api.makeOffer();
    return api;
  }

  /**
   * Joiner: يلصق Offer من المضيف → يولّد Answer للنسخ → بعد الاتصال يبعت hello.
   */
  async function joinHostCodes({ offerCode, playerName, onWelcome, onLobby, onStart, onMessage, onClose }) {
    if (typeof RTCPeerConnection === 'undefined') throw new Error('المتصفح لا يدعم WebRTC');
    const pc = rtcMakePc();
    let dc = null;
    let opened = false;

    const api = {
      transport: 'codes',
      code: null,
      answerCode: null,
      _pc: pc,
      status: 'need-offer',
      broadcast() {},
      sendTo() {},
      destroy() {
        try { if (dc) dc.close(); } catch (_) {}
        try { pc.close(); } catch (_) {}
      },
      async makeAnswerFromOffer(offerText) {
        const sdp = rtcDecodeSdp(offerText, 'offer');
        await pc.setRemoteDescription({ type: 'offer', sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await rtcWaitIce(pc, 4500);
        this.answerCode = rtcEncodeSdp(pc.localDescription.sdp, 'answer');
        this.status = 'answer-ready';
        return this.answerCode;
      }
    };

    pc.ondatachannel = (ev) => {
      dc = ev.channel;
      api._dc = dc;
      dc.onopen = () => {
        opened = true;
        api.status = 'connected';
        try {
          dc.send(JSON.stringify({ t: 'hello', name: playerName || 'لاعب' }));
        } catch (_) {}
        // سلوت مؤقت — المضيف هيبعت welcome بالسلوت الحقيقي
        onWelcome && onWelcome({ slot: 2, roomName: 'CODES', players: [] });
      };
      dc.onmessage = (e) => {
        let d = e.data;
        try { d = typeof d === 'string' ? JSON.parse(d) : d; } catch (_) {}
        if (!d) return;
        if (d.t === 'lobby') onLobby && onLobby(d.players || []);
        else if (d.t === 'start') onStart && onStart(d);
        else if (d.t === 'welcome') onWelcome && onWelcome(d);
        else onMessage && onMessage('host', d);
      };
      dc.onclose = () => { onClose && onClose(); };
    };

    // لو العرض جاهز من البداية
    if (offerCode) await api.makeAnswerFromOffer(offerCode);

    // wrap send for joiner
    api.broadcast = (m) => { try { if (dc && dc.readyState === 'open') dc.send(JSON.stringify(m)); } catch (_) {} };
    api.sendTo = (id, m) => api.broadcast(m);

    return api;
  }

  return { createHost, joinHost, createHostLan, joinHostLan, createHostCodes, joinHostCodes, randCode };

})();

const HawaPlay = (() => {
  let T, scene, cam, ren, rootEl, opts, players = new Map(), localId = 'local';
  let clock, bodies = [], coins = [], pads = [], kills = [];
  let local = null, remotes = new Map(), vehicleOwners = new Map();
  let netTick = 0;

  function start(o, el) {
    opts = o; rootEl = el;
    T = THREE;
    scene = new T.Scene();
    scene.background = new T.Color(0x87b8e0);
    scene.fog = new T.Fog(0x87b8e0, 40, 160);
    cam = new T.PerspectiveCamera(60, 1, .1, 400);
    ren = new T.WebGLRenderer({ antialias: true });
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(ren.domElement);
    const hemi = new T.HemisphereLight(0xcfe3ff, 0x3a3f4a, .95);
    scene.add(hemi);
    const sun = new T.DirectionalLight(0xffffff, 1.05);
    sun.position.set(30, 50, 20);
    scene.add(sun);

    buildWorld(o.data);
    spawnLocal();
    if (o.mode === 'online' && o.players) {
      for (const p of o.players) {
        if (p.slot === o.slot) continue;
        spawnRemote(p);
      }
    }
    resize();
    window.addEventListener('resize', resize);
    clock = performance.now();
    requestAnimationFrame(loop);
    return { stop };
  }

  function stop() {
    try { ren.dispose(); } catch (_) {}
    if (ren && ren.domElement && ren.domElement.parentNode) ren.domElement.parentNode.removeChild(ren.domElement);
  }

  function resize() {
    if (!rootEl || !ren) return;
    const w = rootEl.clientWidth || window.innerWidth;
    const h = rootEl.clientHeight || window.innerHeight;
    cam.aspect = w / Math.max(1, h);
    cam.updateProjectionMatrix();
    ren.setSize(w, h, false);
  }

  function buildWorld(data) {
    bodies = []; coins = []; pads = []; kills = [];
    const list = (data && data.objs) || [];
    for (const o of list) {
      if (o.type === 'respawn' || o.type === 'online_spawn') continue;
      // placeholder simple geometry for launcher runtime (full play uses engine)
      const geo = new T.BoxGeometry(o.scl ? o.scl[0] : 1, o.scl ? o.scl[1] : 1, o.scl ? o.scl[2] : 1);
      const mat = new T.MeshStandardMaterial({ color: o.color || '#888' });
      const m = new T.Mesh(geo, mat);
      m.position.set(o.pos[0], o.pos[1] + (o.scl ? o.scl[1] / 2 : .5), o.pos[2]);
      scene.add(m);
      if (o.type === 'coin') coins.push({ m, o });
      else if (o.type === 'pad') pads.push({ m, o });
      else if (o.type === 'kill') kills.push({ m, o });
      else bodies.push({ m, o });
    }
    // ground fallback
    const g = new T.Mesh(new T.BoxGeometry(80, .4, 80), new T.MeshStandardMaterial({ color: '#5d7a5d' }));
    g.position.y = -.2; scene.add(g);
  }

  function spawnLocal() {
    local = { x: 0, y: 1, z: 0, yaw: 0 };
    if (opts.mode === 'online' && opts.data && opts.data.onlineSpawns) {
      const list = opts.data.onlineSpawns || [];
      const mine = list.find(s => +((s.p && s.p.slot) || s.slot || 0) === opts.slot) || list[opts.slot - 1];
      if (mine && mine.pos) { local.x = mine.pos[0]; local.y = mine.pos[1] + 1; local.z = mine.pos[2]; }
    } else if (opts.data && opts.data.offlineSpawns && opts.data.offlineSpawns[0]) {
      const s = opts.data.offlineSpawns[0];
      if (s.pos) { local.x = s.pos[0]; local.y = s.pos[1] + 1; local.z = s.pos[2]; }
    }
  }

  function spawnRemote(p) {
    const m = new T.Mesh(new T.CapsuleGeometry(.35, .9, 4, 8), new T.MeshStandardMaterial({ color: '#60a5fa' }));
    m.position.set(0, 1, 0);
    scene.add(m);
    remotes.set(p.slot || p.id, { m, p });
  }

  function applyRemote(from, msg) {
    if (!msg || !msg.p) return;
    const r = [...remotes.values()].find(x => x.p && (x.p.id === from || x.p.slot === msg.slot));
    if (r) r.m.position.set(msg.p[0], msg.p[1], msg.p[2]);
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - clock) / 1000); clock = now;
    if (cam && local) {
      cam.position.set(local.x + Math.sin(local.yaw) * 6, local.y + 3, local.z + Math.cos(local.yaw) * 6);
      cam.lookAt(local.x, local.y + 1, local.z);
    }
    if (ren && scene && cam) ren.render(scene, cam);
    netTick += dt;
  }

  return { start, applyRemote };
})();

// تصدير للصفحة
window.HawaNet = HawaNet;
window.HawaPlay = HawaPlay;
