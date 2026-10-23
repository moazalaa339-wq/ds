

function onStart(self, game) {
  if (typeof document === "undefined") return;

  var old = document.getElementById("hawa-mobile-joystick");
  if (old && old.parentNode) old.parentNode.removeChild(old);

  var root = document.createElement("div");
  root.id = "hawa-mobile-joystick";
  root.setAttribute("data-script-ui", "1");
  root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;user-select:none;-webkit-user-select:none;";

  var css = document.createElement("style");
  css.textContent = [
    "#hawa-mobile-joystick .j-base{position:absolute;left:max(12px,env(safe-area-inset-left));bottom:max(16px,calc(12px + env(safe-area-inset-bottom)));width:120px;height:120px;border-radius:50%;background:rgba(0,0,0,.32);border:2px solid rgba(255,255,255,.4);pointer-events:auto;touch-action:none;}",
    "#hawa-mobile-joystick .j-knob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,255,255,.88);box-shadow:0 4px 12px rgba(0,0,0,.35);pointer-events:none;}",
    "#hawa-mobile-joystick .j-jump{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:max(20px,calc(14px + env(safe-area-inset-bottom)));width:70px;height:70px;border-radius:50%;background:rgba(34,197,94,.4);border:2px solid rgba(134,239,172,.75);color:#fff;font:800 13px/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:none;}",
    "#hawa-mobile-joystick .j-jump.on{transform:scale(.92);background:rgba(34,197,94,.65);}",
    "#hawa-mobile-joystick .j-run{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:max(100px,calc(94px + env(safe-area-inset-bottom)));width:56px;height:56px;border-radius:50%;background:rgba(245,158,11,.35);border:2px solid rgba(252,211,77,.7);color:#fff;font:800 11px/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:none;}",
    "#hawa-mobile-joystick .j-run.on{transform:scale(.92);background:rgba(245,158,11,.6);}"
  ].join("");
  document.head.appendChild(css);

  var base = document.createElement("div");
  base.className = "j-base";
  var knob = document.createElement("div");
  knob.className = "j-knob";
  base.appendChild(knob);

  var jump = document.createElement("div");
  jump.className = "j-jump";
  jump.textContent = "قفز";

  var run = document.createElement("div");
  run.className = "j-run";
  run.textContent = "جري";

  root.appendChild(base);
  root.appendChild(jump);
  root.appendChild(run);
  document.body.appendChild(root);

  self._joy = {
    active: false,
    id: null,
    nx: 0,
    ny: 0,
    jump: false,
    run: false,
    maxR: 42,
    base: base,
    knob: knob,
    jumpEl: jump,
    runEl: run,
    root: root
  };

  function setKnob(x, y) {
    knob.style.transform = "translate(" + x + "px," + y + "px)";
  }

  function updateFrom(clientX, clientY) {
    var r = base.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var dx = clientX - cx;
    var dy = clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var maxR = self._joy.maxR;
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob(dx, dy);
    self._joy.nx = dx / maxR;
    self._joy.ny = dy / maxR;
  }

  function resetJoy() {
    self._joy.active = false;
    self._joy.id = null;
    self._joy.nx = 0;
    self._joy.ny = 0;
    setKnob(0, 0);
  }

  function onStartJoy(e) {
    e.preventDefault();
    if (self._joy.active) return;
    var t = e.changedTouches ? e.changedTouches[0] : e;
    if (!t) return;
    self._joy.active = true;
    self._joy.id = t.identifier != null ? t.identifier : "mouse";
    updateFrom(t.clientX, t.clientY);
  }

  function onMoveJoy(e) {
    if (!self._joy.active) return;
    if (e.changedTouches) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier === self._joy.id) {
          updateFrom(t.clientX, t.clientY);
          e.preventDefault();
          break;
        }
      }
    } else {
      updateFrom(e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  function onEndJoy(e) {
    if (!self._joy.active) return;
    if (e.changedTouches) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === self._joy.id) {
          resetJoy();
          break;
        }
      }
    } else {
      resetJoy();
    }
  }

  base.addEventListener("touchstart", onStartJoy, { passive: false });
  window.addEventListener("touchmove", onMoveJoy, { passive: false });
  window.addEventListener("touchend", onEndJoy, { passive: false });
  window.addEventListener("touchcancel", onEndJoy, { passive: false });
  base.addEventListener("mousedown", function (e) {
    onStartJoy(e);
    function mm(ev) { onMoveJoy(ev); }
    function mu(ev) {
      onEndJoy(ev);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    }
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
  });

  function bindHold(el, flag) {
    function down(e) {
      e.preventDefault();
      self._joy[flag] = true;
      el.classList.add("on");
    }
    function up(e) {
      e.preventDefault();
      self._joy[flag] = false;
      el.classList.remove("on");
    }
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up, { passive: false });
    el.addEventListener("touchcancel", up, { passive: false });
    el.addEventListener("mousedown", down);
    el.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", up);
  }
  bindHold(jump, "jump");
  bindHold(run, "run");
}

function onUpdate(self, game, dt) {
  if (!self._joy || !game) return;
  var dead = 0.25;
  var nx = self._joy.nx;
  var ny = self._joy.ny;
  var up = ny < -dead;
  var down = ny > dead;
  var left = nx < -dead;
  var right = nx > dead;

  
  if (typeof game.forcePlayerInput === "function") {
    game.forcePlayerInput(0, {
      up: up,
      down: down,
      left: left,
      right: right,
      jump: !!self._joy.jump,
      run: !!self._joy.run
    });
  } else if (typeof game.setKey === "function") {
    game.setKey("KeyW", up);
    game.setKey("KeyS", down);
    game.setKey("KeyA", left);
    game.setKey("KeyD", right);
    game.setKey("Space", !!self._joy.jump);
    game.setKey("ShiftLeft", !!self._joy.run);
  }
}

function onTouch(self, game, dt) {}
