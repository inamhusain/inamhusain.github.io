document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Expertise line: a curve through every icon, rebuilt on layout changes ---------- */
const journey = document.querySelector('.journey');
function drawJourney() {
  const box = journey.getBoundingClientRect();
  const pts = [...journey.querySelectorAll('.stop__icon')].map((icon) => {
    const r = icon.getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
  });
  if (!pts.length) return;
  const swing = box.width * 0.22;
  let d = `M ${pts[0].x - swing} 0 C ${pts[0].x - swing} ${pts[0].y / 2}, ${pts[0].x} ${pts[0].y / 2}, ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const half = (b.y - a.y) / 2;
    const s = i % 2 ? swing : -swing; // alternate the bulge so the line weaves
    d += ` C ${a.x + s} ${a.y + half}, ${b.x + s} ${b.y - half}, ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  d += ` C ${last.x} ${box.height}, ${box.width} ${last.y}, ${box.width} ${box.height}`;
  const line = journey.querySelector('.journey__line');
  line.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  line.querySelectorAll('path').forEach((path) => path.setAttribute('d', d));
}
new ResizeObserver(drawJourney).observe(journey);
document.fonts.ready.then(drawJourney);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// No GSAP (CDN blocked) or reduced motion: drop the .js flag so all content shows statically.
if (reduceMotion || !window.gsap || !window.Lenis) {
  document.documentElement.classList.remove('js');
} else {
  // SplitText measures lines in whatever font is loaded; splitting before Inter swaps in leaves over-long lines that re-wrap on iOS.
  document.fonts.ready.then(initMotion);
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    });
  });

  /* ---------- Scroll progress bar ---------- */
  gsap.to('.progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  /* ---------- Hero ---------- */
  SplitText.create('.hero h1', {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit: (self) => {
      gsap.set('.hero h1', { autoAlpha: 1 });
      return gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12 });
    },
  });
  gsap.from('.hero__foot > *, .badge', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', delay: 0.6, stagger: 0.12 });

  gsap.to('.hero .wrap', {
    yPercent: -12,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.badge', {
    rotation: 360,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 1 },
  });

  /* ---------- Ticker: speeds up with scroll velocity ---------- */
  const ticker = gsap.to('.ticker__track', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  let boost = 0;
  lenis.on('scroll', ({ velocity }) => { boost = Math.min(Math.abs(velocity), 60) / 6; });
  gsap.ticker.add(() => {
    boost *= 0.92;
    ticker.timeScale(1 + boost);
  });

  /* ---------- Section headings: words rise from a mask ---------- */
  document.querySelectorAll('.about h2, .work-head h2, .expertise-title').forEach((heading) => {
    SplitText.create(heading, {
      type: 'lines, words',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.words, {
        yPercent: 110,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
      }),
    });
  });

  /* ---------- About copy: lines slide up once in view ---------- */
  document.querySelectorAll('.about__copy p').forEach((p) => {
    SplitText.create(p, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 100,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: p, start: 'top 88%', once: true },
      }),
    });
  });

  /* ---------- Stats count up ---------- */
  document.querySelectorAll('.stats dd').forEach((dd) => {
    const value = parseInt(dd.textContent, 10);
    const suffix = dd.textContent.replace(/\d+/, '');
    const counter = { n: 0 };
    dd.textContent = 0 + suffix;
    gsap.to(counter, {
      n: value,
      duration: 1.6,
      ease: 'power2.out',
      // Trigger on the row, not each dd: tiles start offset by the staircase, which skews per-dd positions.
      scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true },
      onUpdate: () => { dd.textContent = Math.round(counter.n) + suffix; },
    });
  });

  /* ---------- Staggered reveals ---------- */
  const reveal = (selector, from) => {
    gsap.set(selector, { autoAlpha: 0, ...from });
    ScrollTrigger.batch(selector, {
      start: 'top 90%',
      once: true,
      // clearProps hands transform back to CSS so :hover lifts still work.
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity,visibility' }),
    });
  };
  /* ---------- About: heading slides in, stat tiles settle from a staircase ---------- */
  gsap.fromTo('.about h2', { xPercent: -12 }, {
    xPercent: 0,
    ease: 'none',
    scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top 25%', scrub: true },
  });
  gsap.fromTo('.stats div', { y: (i) => 60 + i * 80 }, {
    y: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'top 45%', scrub: true },
  });
  reveal('.project', { y: 70 });
  reveal('.card', { y: 60 });
  /* ---------- Expertise: line draws itself, each stop pops in ---------- */
  gsap.fromTo('.journey__draw', { strokeDashoffset: 1000 }, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.journey', start: 'top 65%', end: 'bottom 65%', scrub: 0.5 },
  });
  document.querySelectorAll('.stop').forEach((stop) => {
    const [first, icon, second] = stop.querySelectorAll('h3 > span');
    gsap.timeline({ scrollTrigger: { trigger: stop, start: 'top 75%', toggleActions: 'play none none reverse' } })
      .from(icon, { scale: 0, rotation: -120, duration: 0.7, ease: 'back.out(2)' })
      .from(first, { xPercent: -40, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, '<0.1')
      .from(second, { xPercent: 40, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, '<')
      .from(stop.querySelector('.stop__note'), { y: 30, rotation: 8, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, '<0.15');
  });
  reveal('.stack li', { scale: 0.6, y: 20 });
  reveal('.stories li', { y: 50 });

  /* ---------- Contact heading grows in ---------- */
  gsap.from('.contact h2', {
    scale: 0.6,
    yPercent: 40,
    ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: true },
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
