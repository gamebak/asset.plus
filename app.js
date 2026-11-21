document.documentElement.classList.add('js');

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

// ── Easter egg: press R for retro mode ───────────────────────────
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'r' || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  window.location.href = 'retro/';
});
