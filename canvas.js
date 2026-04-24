/**
 * canvas.js
 * ─────────────────────────────────────────────────────────────
 * Draws a smooth, animated gradient backdrop on a <canvas>.
 * Two large "orbs" drift slowly around the screen, blending
 * into a deep background color. The palette is derived from
 * --hue CSS custom property so it stays in sync with the quote.
 *
 * Exposed: window.BgCanvas.setHue(hue)  — call when quote changes
 */

window.BgCanvas = (() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  /* Current & target hue values — interpolated smoothly */
  let currentHue = 220;
  let targetHue  = 220;

  /* Orb state */
  const orbs = [
    { x: 0.3, y: 0.4, vx:  0.00018, vy:  0.00012, r: 0.55 },
    { x: 0.7, y: 0.6, vx: -0.00014, vy:  0.00020, r: 0.45 },
  ];

  /* Resize canvas to fill viewport */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* HSL shorthand */
  const hsl  = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

  /* Smoothly lerp hue values (handles wrap-around at 360) */
  function lerpHue(a, b, t) {
    let diff = b - a;
    // Shortest arc around the colour wheel
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    return (a + diff * t + 360) % 360;
  }

  /* Main draw loop */
  function draw() {
    requestAnimationFrame(draw);

    const W = canvas.width;
    const H = canvas.height;

    /* Ease hue toward target */
    currentHue = lerpHue(currentHue, targetHue, 0.012);

    const h  = currentHue;
    const h2 = (h + 40) % 360;

    /* Deep background fill */
    ctx.fillStyle = hsl(h, 55, 10);
    ctx.fillRect(0, 0, W, H);

    /* Move orbs */
    orbs.forEach(o => {
      o.x += o.vx;
      o.y += o.vy;
      /* Gentle bounce at edges */
      if (o.x < 0.1 || o.x > 0.9) o.vx *= -1;
      if (o.y < 0.1 || o.y > 0.9) o.vy *= -1;
    });

    /* Draw orbs as large radial gradients */
    orbs.forEach((o, i) => {
      const cx = o.x * W;
      const cy = o.y * H;
      const r  = o.r * Math.max(W, H);
      const hue = i === 0 ? h : h2;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   hsl(hue, 70, 35, 0.45));
      grad.addColorStop(0.5, hsl(hue, 60, 25, 0.18));
      grad.addColorStop(1,   hsl(hue, 50, 15, 0));

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /* Public API */
  function setHue(hue) {
    targetHue = hue;
  }

  draw();
  return { setHue };
})();
