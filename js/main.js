/* Stylus Unisex — panal de LEDs hexagonales que reacciona al cursor */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- horario de hoy ---------- */
(function today() {
  const d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
  const [o, c] = day === 0 ? [10, 21] : [9, 21];
  const open = h >= o && h < c;
  $('.nav__open').innerHTML = `<i style="${open ? '' : 'background:#ff5c7a;box-shadow:0 0 10px #ff5c7a'}"></i> ${open ? 'Abierto ahora' : 'Cerrado ahora'} · hoy ${o}–${c} h`;
})();

/* ---------- techo LED ---------- */
(function hex() {
  const cv = $('#hex'), ctx = cv.getContext('2d');
  let W, H, dpr, cells = [], R;
  const mouse = { x: -1e4, y: -1e4 };
  function build() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = cv.clientWidth * dpr; H = cv.height = cv.clientHeight * dpr;
    R = (cv.clientWidth < 700 ? 34 : 48) * dpr;
    const w = Math.sqrt(3) * R, h = 1.5 * R;
    cells = [];
    for (let row = -1, y = 0; y < H + R * 2; row++, y = row * h) {
      for (let col = -1; col * w < W + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0);
        const dist = Math.hypot(x - W / 2, y - H * .45);
        cells.push({ x, y, g: 0, on: 0, delay: dist / (W * .6) * 1.6 + Math.random() * .25, flick: Math.random() });
      }
    }
  }
  build();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * dpr; mouse.y = (e.clientY - r.top) * dpr; });
  cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  function path(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath();
  }
  const t0 = performance.now();
  let vis = true;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);
  gsap.ticker.add(() => {
    if (!vis) return;
    const t = (performance.now() - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    const inner = R * .86;
    cells.forEach(c => {
      // encendido con parpadeo
      if (c.on < 1 && t > c.delay) c.on = Math.min(1, c.on + (Math.random() < .3 ? .25 : .02));
      const d = Math.hypot(c.x - mouse.x, c.y - mouse.y);
      const near = Math.max(0, 1 - d / (R * 4.2));
      const pulse = Math.max(0, Math.sin(t * .7 + c.flick * 40)) ** 30 * .6;
      const target = c.on * (.16 + near * .85 + pulse);
      c.g += (target - c.g) * .15;
      if (c.g < .02) return;
      path(c.x, c.y, inner);
      ctx.lineWidth = 7 * dpr; ctx.strokeStyle = `rgba(45,91,255,${(c.g * .35).toFixed(3)})`; ctx.stroke();
      ctx.lineWidth = 2 * dpr; ctx.strokeStyle = `rgba(223,233,255,${Math.min(1, c.g).toFixed(3)})`; ctx.stroke();
      if (near > .5) { ctx.fillStyle = `rgba(127,209,255,${(near * .07).toFixed(3)})`; ctx.fill(); }
    });
  });
})();

/* ---------- entrada ---------- */
gsap.from('.neon', { opacity: 0, duration: .08, repeat: 6, yoyo: true, delay: .8, ease: 'steps(1)', onComplete: () => gsap.set('.neon', { opacity: 1 }) });
gsap.from(['.hero .kicker', '.hero__lead', '.hero__row', '.hero__stats div'], { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, delay: 1.2 });

/* ---------- panal: cada celda se enciende al entrar ---------- */
gsap.from('.cell', { scale: .4, opacity: 0, duration: 1, ease: 'back.out(1.6)', clearProps: 'transform,opacity', stagger: { each: .08, from: 'center' }, scrollTrigger: { trigger: '.honey', start: 'top 80%' } });
$$('.head, .salon__img, .salon__txt, .rev__big, .rev__row blockquote, .visit__card, .visit__front').forEach(n => gsap.from(n, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 88%' } }));
