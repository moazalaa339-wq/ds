/* Hawa Play Runtime + Net
   - PeerJS (إنترنت): تبادل أكواد قصير عبر سيرفر Peer العام
   - LAN WebRTC: شبكة محلية عبر سيرفر Hawa المحلي + WebRTC DataChannel (من غير نت)
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

  return { createHost, joinHost, createHostLan, joinHostLan, randCode };
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
