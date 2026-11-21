// ── Hero photo: "print" it in, line by line ───────────────────────
(() => {
  const frame = document.getElementById('photo-frame');
  if (!frame || frame.classList.contains('printed')) return;
  const img = frame.querySelector('img');
  const status = document.getElementById('photo-status');
  const DURATION = 2200, LINES = 44;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame.classList.add('printed');
    return;
  }

  const start = () => {
    if (frame.classList.contains('printed')) return;
    frame.classList.add('printing');
    status.classList.add('show');
    const t0 = performance.now();
    const tick = now => {
      const step = Math.min(LINES, Math.floor((now - t0) / DURATION * LINES));
      status.textContent = 'PRINTING ' + Math.round(step / LINES * 100) + '%';
      if (step < LINES) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    img.addEventListener('animationend', () => {
      status.textContent = 'READY.';
      frame.classList.replace('printing', 'printed');
      setTimeout(() => status.classList.remove('show'), 1400);
    }, { once: true });
  };

  if (img.complete && img.naturalWidth) start();
  else {
    img.addEventListener('load', start, { once: true });
    img.addEventListener('error', () => frame.classList.add('printed'), { once: true });
  }
})();

// ── Theme toggle ─────────────────────────────────────────────────
(() => {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches;

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

// ── Header border on scroll ──────────────────────────────────────
(() => {
  const header = document.querySelector('.site-header');
  const update = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── Active nav link ──────────────────────────────────────────────
(() => {
  const links = [...document.querySelectorAll('.nav a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = links.find(l => l.hash === '#' + e.target.id);
      if (link) link.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => {
    const sec = document.querySelector(l.hash);
    if (sec) io.observe(sec);
  });
})();

// ── Reveal on scroll ─────────────────────────────────────────────
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();

// ── Footer year ──────────────────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ── C64 screen: loading from floppy (and failing, the first time) ─
(() => {
  const screen = document.getElementById('c64-screen');
  if (!screen) return;
  const ROWS = 8;
  const MSG = 'LESS CODE = MORE';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  let lines = ['READY.', ''];

  const render = () => {
    screen.textContent = lines.slice(-ROWS).join('\n');
    screen.append(cursor);
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const type = async text => {
    for (const ch of text) {
      lines[lines.length - 1] += ch;
      render();
      await wait(60 + Math.random() * 70);
    }
    await wait(300);
  };
  const print = async (text, pause) => {
    lines.splice(lines.length - 1, 0, text); // insert above the input line
    render();
    await wait(pause);
  };
  const enter = () => { lines.push(''); render(); };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lines = ['LOAD"*",8,1', '', 'SEARCHING FOR *', 'LOADING', '?LOAD  ERROR', 'READY.', 'LOAD"*",8,1', ''];
    render();
    return;
  }

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(screen);
  const whenVisible = async () => { while (!visible || document.hidden) await wait(400); };

  (async function loop() {
    for (;;) {
      lines = ['READY.', ''];
      render();
      await whenVisible();
      await wait(900);

      // attempt #1 — the classic
      await type('LOAD"*",8,1');
      enter();
      await print('', 200);
      await print('SEARCHING FOR *', 1800);
      await print('LOADING', 3200);
      await print('?LOAD  ERROR', 300);
      await print('READY.', 1400);

      // attempt #2 — works, eventually
      await type('LOAD"*",8,1');
      enter();
      await print('', 200);
      await print('SEARCHING FOR *', 1800);
      await print('LOADING', 4200);
      await print('READY.', 700);
      await type('RUN');
      enter();
      lines.pop();
      for (let i = 0; i < 10; i++) { lines.push(MSG); render(); await wait(120); }
      lines.push('');
      render();
      await wait(5000);
    }
  })();
})();
