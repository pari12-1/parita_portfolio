(() => {
  'use strict';

  const stage = document.getElementById('glass-field-stage');
  const svg   = document.getElementById('glass-field-svg');
  if (!stage || !svg) return;

  // ---------- Config ----------
  const BAR_COUNT = 6;
  const CONNECT_DIST = 170;        // px – when strings appear
  const FRICTION = 0.94;           // momentum decay
  const SPIN_THRESHOLD = 0.35;     // rad/frame to trigger glow

  // Different sizes for visual interest
  const SIZES = [
    { w: 160, h: 42 },
    { w: 110, h: 42 },
    { w: 90,  h: 42 },
    { w: 140, h: 36 },
    { w: 70,  h: 70 },   // almost square
    { w: 180, h: 36 }
  ];

  // ---------- State ----------
  const bars = [];
  let active = null;          // currently dragged bar
  let startAngle = 0;
  let startRot = 0;
  let lastMouse = { x: 0, y: 0 };
  let lastTime = 0;

  // ---------- Helpers ----------
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createBar(i) {
    const size = SIZES[i % SIZES.length];
    const el = document.createElement('div');
    el.className = 'glass-bar';
    el.style.width  = size.w + 'px';
    el.style.height = size.h + 'px';

    const bar = {
      el,
      x: rand(60, stage.clientWidth  - size.w - 60),
      y: rand(60, stage.clientHeight - size.h - 60),
      rot: rand(-25, 25) * Math.PI / 180,
      vx: 0,
      vy: 0,
      vr: 0,               // rotational velocity
      w: size.w,
      h: size.h,
      phase: rand(0, Math.PI * 2),   // for idle float
      dragging: false
    };

    el.style.transform = `translate(${bar.x}px, ${bar.y}px) rotate(${bar.rot}rad)`;
    stage.appendChild(el);

    // pointer events
    el.addEventListener('pointerdown', (e) => onDown(e, bar));
    bars.push(bar);
  }

  function onDown(e, bar) {
    e.preventDefault();
    elSetPointerCapture(bar.el, e.pointerId);

    active = bar;
    bar.dragging = true;
    bar.el.classList.add('is-dragging');
    bar.vx = bar.vy = bar.vr = 0;

    const rect = stage.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // offset from bar center
    const cx = bar.x + bar.w / 2;
    const cy = bar.y + bar.h / 2;
    bar.grabDX = mx - cx;
    bar.grabDY = my - cy;

    // for rotation
    startAngle = Math.atan2(my - cy, mx - cx);
    startRot   = bar.rot;

    lastMouse = { x: mx, y: my };
    lastTime  = performance.now();
  }

  function elSetPointerCapture(el, id) {
    try { el.setPointerCapture(id); } catch (_) {}
  }

  function onMove(e) {
    if (!active) return;

    const rect = stage.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 16.67, 2); // normalize

    // --- translation (grab point follows mouse) ---
    const newCx = mx - active.grabDX;
    const newCy = my - active.grabDY;
    active.x = newCx - active.w / 2;
    active.y = newCy - active.h / 2;

    // clamp inside stage
    active.x = Math.max(8, Math.min(stage.clientWidth  - active.w - 8, active.x));
    active.y = Math.max(8, Math.min(stage.clientHeight - active.h - 8, active.y));

    // --- rotation from angular change ---
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    const angle = Math.atan2(my - cy, mx - cx);
    let delta = angle - startAngle;

    // keep shortest path
    if (delta >  Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    active.rot = startRot + delta;

    // velocity for momentum + spin detection
    active.vx = (mx - lastMouse.x) / dt * 0.6;
    active.vy = (my - lastMouse.y) / dt * 0.6;
    active.vr = delta / dt;

    // spin glow
    if (Math.abs(active.vr) > SPIN_THRESHOLD) {
      active.el.classList.add('is-spinning');
      spawnTrail(active);
    } else {
      active.el.classList.remove('is-spinning');
    }

    lastMouse = { x: mx, y: my };
    lastTime  = now;

    applyTransform(active);
  }

  function onUp(e) {
    if (!active) return;
    active.dragging = false;
    active.el.classList.remove('is-dragging', 'is-spinning');
    active = null;
  }

  // light trail when spinning fast
  function spawnTrail(bar) {
    const trail = document.createElement('div');
    trail.className = 'glass-trail';
    trail.style.width  = bar.w + 'px';
    trail.style.height = bar.h + 'px';
    trail.style.transform = `translate(${bar.x}px, ${bar.y}px) rotate(${bar.rot}rad)`;
    stage.appendChild(trail);

    requestAnimationFrame(() => {
      trail.style.opacity = '0';
    });
    setTimeout(() => trail.remove(), 450);
  }

  function applyTransform(bar) {
    bar.el.style.transform =
      `translate(${bar.x}px, ${bar.y}px) rotate(${bar.rot}rad)`;
  }

  // ---------- Soft collision ----------
  function resolveCollisions() {
    for (let i = 0; i < bars.length; i++) {
      for (let j = i + 1; j < bars.length; j++) {
        const a = bars[i];
        const b = bars[j];

        const acx = a.x + a.w / 2;
        const acy = a.y + a.h / 2;
        const bcx = b.x + b.w / 2;
        const bcy = b.y + b.h / 2;

        const dx = bcx - acx;
        const dy = bcy - acy;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = (a.w + b.w) * 0.38; // soft radius

        if (dist < minDist) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          if (!a.dragging) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!b.dragging) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }
    }
  }

  // ---------- Living connections (SVG lines) ----------
  function updateConnections() {
    // clear old
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    for (let i = 0; i < bars.length; i++) {
      for (let j = i + 1; j < bars.length; j++) {
        const a = bars[i];
        const b = bars[j];

        const acx = a.x + a.w / 2;
        const acy = a.y + a.h / 2;
        const bcx = b.x + b.w / 2;
        const bcy = b.y + b.h / 2;

        const dist = Math.hypot(bcx - acx, bcy - acy);

        if (dist < CONNECT_DIST) {
          const opacity = 1 - dist / CONNECT_DIST;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', acx);
          line.setAttribute('y1', acy);
          line.setAttribute('x2', bcx);
          line.setAttribute('y2', bcy);
          line.setAttribute('stroke', `rgba(0, 240, 255, ${opacity * 0.7})`);
          line.setAttribute('stroke-width', 1.5 + opacity * 1.5);
          line.style.filter = `drop-shadow(0 0 ${4 + opacity * 6}px rgba(0, 240, 255, 0.6))`;
          svg.appendChild(line);
        }
      }
    }
  }

  // ---------- Main loop ----------
  function tick(now) {
    const t = now * 0.001;

    bars.forEach(bar => {
      if (!bar.dragging) {
        // momentum
        bar.x  += bar.vx;
        bar.y  += bar.vy;
        bar.rot += bar.vr * 0.3;

        bar.vx *= FRICTION;
        bar.vy *= FRICTION;
        bar.vr *= FRICTION;

        // idle gentle float
        const floatY = Math.sin(t * 0.9 + bar.phase) * 3.5;
        bar.y += floatY * 0.04; // very subtle continuous drift

        // keep inside
        if (bar.x < 8)                      { bar.x = 8; bar.vx *= -0.4; }
        if (bar.y < 8)                      { bar.y = 8; bar.vy *= -0.4; }
        if (bar.x > stage.clientWidth  - bar.w - 8) { bar.x = stage.clientWidth  - bar.w - 8; bar.vx *= -0.4; }
        if (bar.y > stage.clientHeight - bar.h - 8) { bar.y = stage.clientHeight - bar.h - 8; bar.vy *= -0.4; }
      }

      applyTransform(bar);
    });

    resolveCollisions();
    updateConnections();

    requestAnimationFrame(tick);
  }

  // ---------- Init ----------
  for (let i = 0; i < BAR_COUNT; i++) createBar(i);

  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);

  // prevent page scroll while dragging on mobile
  stage.addEventListener('touchmove', e => {
    if (active) e.preventDefault();
  }, { passive: false });

  requestAnimationFrame(tick);
})();