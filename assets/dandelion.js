/* Background dandelion whose seeds break off and drift across the page, drawn in the
   style of the current theme. Each theme sets on :root:
     --dl-style   modigliani | kandinsky | miro
     --dl-stroke  line color          --dl-seed  seed-body color
     --dl-colors  comma list of accent colors (used by kandinsky and miro)
     --dl-glow    soft halo behind the head (optional)
     --dl-opacity overall strength, 0–1 (optional)
   The canvas sits behind the page (z-index:-1): themes give <html> the page color and keep
   <body> transparent, with translucent color blocks so the dandelion shows through.
   Respects prefers-reduced-motion (one still frame); pauses in background tabs. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = document.createElement('canvas');
  c.id = 'dandelion';
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '-1', pointerEvents: 'none' });
  document.body.prepend(c);
  const ctx = c.getContext('2d');

  const css = getComputedStyle(document.documentElement);
  const v = (n, d) => css.getPropertyValue(n).trim() || d;
  const STYLE = v('--dl-style', 'modigliani');
  const STROKE = v('--dl-stroke', 'rgba(40,40,40,.4)');
  const SEED = v('--dl-seed', STROKE);
  const GLOW = v('--dl-glow', 'transparent');
  const COLORS = v('--dl-colors', STROKE).split(',').map(s => s.trim());
  c.style.opacity = v('--dl-opacity', '1');
  const SPEED = { modigliani: 0.6, kandinsky: 0.9, miro: 1 }[STYLE] || 1;

  let W, H, head, attached = [], flying = [], last = 0, nextRelease = 0;

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const small = W < 760;
    const r = Math.min(W, H) * (small ? 0.2 : 0.17);
    head = { x: W * (small ? 0.78 : 0.86), y: H * (STYLE === 'modigliani' ? 0.52 : 0.62), r };
    const n = STYLE === 'kandinsky' ? (small ? 18 : 24) : STYLE === 'miro' ? (small ? 14 : 18) : (small ? 40 : 60);
    attached = Array.from({ length: n }, (_, i) => ({ a: (i / n) * Math.PI * 2, i, alpha: 1, gone: false, back: 0 }));
  }

  // ---------- seeds, one per style ----------
  function star(x, y, R, rays, rot) {
    ctx.beginPath();
    for (let k = 0; k < rays; k++) { const b = rot + (k / rays) * Math.PI * 2; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * R, y + Math.sin(b) * R); }
    ctx.stroke();
  }
  function shape(kind, x, y, s, rot, color) {
    ctx.fillStyle = color; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    if (kind === 0) ctx.arc(0, 0, s, 0, Math.PI * 2);
    else if (kind === 1) { ctx.moveTo(0, -s * 1.15); ctx.lineTo(s, s * 0.7); ctx.lineTo(-s, s * 0.7); ctx.closePath(); }
    else ctx.rect(-s * 0.85, -s * 0.85, s * 1.7, s * 1.7);
    ctx.fill(); ctx.restore();
  }

  function seed(x, y, ang, L, alpha, i) {
    const tx = x + Math.cos(ang) * L, ty = y + Math.sin(ang) * L;
    ctx.globalAlpha = alpha; ctx.strokeStyle = STROKE; ctx.lineCap = 'round';
    if (STYLE === 'kandinsky') {
      // a ruled line ending in a pure shape: circle, triangle or square
      ctx.lineWidth = Math.max(1, L / 60);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
      shape(i % 3, tx, ty, Math.max(3, L * 0.1), ang + Math.PI / 2, COLORS[i % COLORS.length]);
    } else if (STYLE === 'miro') {
      // a short wobbly stalk with a black asterisk star and one bright dot
      ctx.lineWidth = Math.max(1.6, L / 30);
      const mx = (x + tx) / 2 + Math.cos(ang + Math.PI / 2) * L * 0.12, my = (y + ty) / 2 + Math.sin(ang + Math.PI / 2) * L * 0.12;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke();
      star(tx, ty, L * 0.32, 8, ang);
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.beginPath(); ctx.arc(x, y, Math.max(2.5, L * 0.09), 0, Math.PI * 2); ctx.fill();
    } else {
      // modigliani: long slender stalk, narrow tall fan, soft and elongated
      ctx.lineWidth = Math.max(0.8, L / 110);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty);
      const f = L * 0.5, n = 7, spread = 1.5;
      for (let k = 0; k < n; k++) { const b = ang - spread / 2 + (spread * k) / (n - 1); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(ang) * f * 0.6, ty + Math.sin(ang) * f * 0.6, tx + Math.cos(b) * f, ty + Math.sin(b) * f); }
      ctx.stroke();
      ctx.fillStyle = SEED; ctx.beginPath(); ctx.ellipse(x, y, L * 0.11 + 1.5, L * 0.025 + 0.8, ang, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- the plant, one per style ----------
  function drawPlant(now) {
    const { x, y, r } = head;
    if (GLOW !== 'transparent') {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
      g.addColorStop(0, GLOW); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = STROKE; ctx.lineCap = 'round';
    if (STYLE === 'kandinsky') {
      // ruled stem, a diagonal accent line, concentric rings for the head
      ctx.lineWidth = Math.max(2, r / 45);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * 0.25, H + 10); ctx.stroke();
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - r * 1.6, H); ctx.lineTo(x + r * 0.9, y + r * 1.4); ctx.stroke();
      shape(1, x + r * 0.1, y + (H - y) * 0.7, r * 0.12, -0.3, COLORS[1 % COLORS.length]);
      for (const s of attached) if (!s.gone) seed(x, y, s.a, r, 0.9 * s.alpha, s.i);
      [0.32, 0.22, 0.12].forEach((k, j) => { ctx.fillStyle = COLORS[(j + 2) % COLORS.length]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, r * k, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
    } else if (STYLE === 'miro') {
      // thick wobbly black stem, a black-outlined head ringed with asterisk stars
      ctx.lineWidth = Math.max(3, r / 22);
      ctx.beginPath(); ctx.moveTo(x, y + r * 0.2);
      ctx.bezierCurveTo(x - r * 0.4, y + (H - y) * 0.35, x + r * 0.5, y + (H - y) * 0.6, x - r * 0.1, H + 10); ctx.stroke();
      const wob = Math.sin(now / 900) * 0.05;
      for (const s of attached) if (!s.gone) seed(x + Math.cos(s.a) * r * 0.2, y + Math.sin(s.a) * r * 0.2, s.a + wob, r * 0.8, s.alpha, s.i);
      ctx.fillStyle = v('--dl-ground', '#F6F1E4'); ctx.lineWidth = Math.max(2.5, r / 28);
      ctx.beginPath(); ctx.arc(x, y, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS[0]; ctx.beginPath(); ctx.arc(x - r * 0.06, y - r * 0.04, r * 0.08, 0, Math.PI * 2); ctx.fill();
    } else {
      // modigliani: long slender curved stem, tall elongated head (stretched vertically)
      ctx.lineWidth = Math.max(1.6, r / 60);
      ctx.beginPath(); ctx.moveTo(x, y + r * 0.1); ctx.bezierCurveTo(x + r * 0.15, y + (H - y) * 0.4, x - r * 0.2, y + (H - y) * 0.7, x + r * 0.05, H + 10); ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.scale(0.72, 1.35); ctx.translate(-x, -y);
      for (const s of attached) if (!s.gone) seed(x + Math.cos(s.a) * r * 0.08, y + Math.sin(s.a) * r * 0.08, s.a, r * 0.85, 0.85 * s.alpha, s.i);
      ctx.restore();
      ctx.fillStyle = SEED; ctx.beginPath(); ctx.ellipse(x, y, r * 0.07, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function launch(s, now, anywhere) {
    const { x, y, r } = head;
    flying.push({
      x: anywhere ? Math.random() * W : x + Math.cos(s.a) * r * 0.8,
      y: anywhere ? Math.random() * H : y + Math.sin(s.a) * r * 0.8,
      L: r * (STYLE === 'modigliani' ? 0.55 : 0.45) * (0.85 + Math.random() * 0.3),
      vx: -(0.35 + Math.random() * 0.6) * SPEED, vy: -(0.12 + Math.random() * 0.35) * SPEED,
      ph: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 0.8, born: now, i: s.i,
      spin: STYLE === 'miro' ? (Math.random() - 0.5) * 0.002 : 0,
    });
  }

  function frame(now) {
    const dt = Math.min(50, now - (last || now)) / 16.7; last = now;
    ctx.clearRect(0, 0, W, H);
    if (now > nextRelease) {
      const free = attached.filter(s => !s.gone && Math.cos(s.a) < 0.3);
      if (free.length) { const s = free[(Math.random() * free.length) | 0]; s.gone = true; s.back = now + 25000 + Math.random() * 20000; launch(s, now); }
      nextRelease = now + (1200 + Math.random() * 1400) / SPEED;
    }
    for (const s of attached) {
      if (s.gone && now > s.back) { s.gone = false; s.alpha = 0; }
      if (!s.gone && s.alpha < 1) s.alpha = Math.min(1, s.alpha + 0.01 * dt);
    }
    drawPlant(now);
    const wind = 1 + Math.sin(now / 4000) * 0.35;
    flying = flying.filter(f => f.x > -f.L * 2 && f.y > -f.L * 2);
    for (const f of flying) {
      f.x += f.vx * wind * dt;
      f.y += (f.vy + Math.sin((now / 900) * f.sp + f.ph) * 0.25 * SPEED) * dt;
      const tilt = STYLE === 'kandinsky' ? Math.round(Math.sin((now / 1400) * f.sp + f.ph) * 2) * 0.2
        : Math.sin((now / 1100) * f.sp + f.ph) * 0.35 + (now - f.born) * f.spin;
      seed(f.x, f.y, -Math.PI / 2 + tilt, f.L, 0.85 * Math.min(1, (now - f.born) / 600), f.i);
    }
    requestAnimationFrame(frame);
  }

  function still() {
    ctx.clearRect(0, 0, W, H);
    attached.forEach((s, i) => { if (i % 5 === 0 && Math.cos(s.a) < 0.3) s.gone = true; });
    drawPlant(0);
    for (let i = 0; i < 9; i++) seed(W * (0.08 + i * 0.09), H * (0.15 + ((i * 37) % 60) / 100), -Math.PI / 2 + ((i % 3) - 1) * 0.3, head.r * 0.45, 0.75, i);
  }

  layout();
  addEventListener('resize', () => { layout(); if (reduce) still(); });
  if (reduce) { still(); return; }
  for (let i = 0; i < 7; i++) launch(attached[i % attached.length], -1e5, true);
  requestAnimationFrame(frame);
})();
