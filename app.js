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
  // only same-page section links (e.g. "#services"), not "/guides/" or links to other pages
  const links = [...document.querySelectorAll('.nav a')]
    .filter(l => l.hash && l.pathname === location.pathname);
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

// ── Code colors: comments, strings, keywords and numbers only ────
(() => {
  const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/.source;
  const KEYWORD = /\b(?:async|await|break|case|catch|class|const|continue|default|delete|else|export|extends|false|finally|fn|for|from|function|if|impl|import|in|let|match|mod|mut|new|null|of|pub|return|self|static|struct|switch|this|throw|true|try|typeof|undefined|use|while)\b/.source;
  const NUMBER = /\b\d[\d_.]*\b/.source;
  const slash = new RegExp(`(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|(${STRING})|\\.[A-Za-z]\\w*|(${KEYWORD})|(${NUMBER})`, 'g');
  const hash = new RegExp(`(#.*)|(${STRING})`, 'g');
  const CLASSES = ['c', 's', 'k', 'n'];

  document.querySelectorAll('.cs-code').forEach(fig => {
    const code = fig.querySelector('pre code');
    if (!code) return;
    const lang = fig.querySelector('figcaption')?.textContent ?? '';
    const re = /^(Shell|TOML|YAML|Docker)/i.test(lang) ? hash : slash;
    const text = code.textContent;
    const out = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(re)) {
      const kind = m.slice(1).findIndex(g => g !== undefined);
      if (kind < 0) continue; // property names like .use stay plain
      out.append(text.slice(last, m.index));
      const span = document.createElement('span');
      span.className = 'tok-' + CLASSES[kind];
      span.textContent = m[0];
      out.append(span);
      last = m.index + m[0].length;
    }
    out.append(text.slice(last));
    code.replaceChildren(out);
  });
})();

// ── Copy buttons on code blocks ──────────────────────────────────
(() => {
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback for older browsers / insecure contexts
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove();
      return ok;
    }
  };

  document.querySelectorAll('.cs-code').forEach((fig) => {
    const code = fig.querySelector('pre code');
    const bar = fig.querySelector('figcaption');
    if (!code || !bar) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.addEventListener('click', async () => {
      const ok = await copyText(code.textContent);
      btn.textContent = ok ? 'Copied ✓' : 'Press Ctrl+C';
      btn.classList.toggle('copied', ok);
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    });
    bar.append(btn);
  });
})();

// ── Listen to a guide (browser text-to-speech) ───────────────────
(() => {
  const byline = document.querySelector('.cs-byline');
  const synth = window.speechSynthesis;
  if (!byline || !synth || !window.SpeechSynthesisUtterance) return;

  const article = byline.closest('article');
  const lang = document.documentElement.lang || 'en';
  const RATES = [1, 1.25, 1.5];
  const CUES = { 'cs-code': 'Code example on the page.', 'cs-table-wrap': 'Table on the page.', 'cs-diagram': 'Diagram on the page.' };
  let chunks = [], index = 0, rate = 0, state = 'idle';
  let current = null; // also keeps the utterance alive: Chrome can drop onend if it's collected

  // short chunks: some Chrome voices cut out on long text
  const split = text => text.replace(/([.!?:;])\s+/g, '$1\n').split('\n').reduce((out, s) => {
    const last = out.length - 1;
    if (last >= 0 && out[last].length + s.length < 200) out[last] += ' ' + s;
    else out.push(s);
    return out;
  }, []);

  const collect = () => {
    const out = [];
    article.querySelectorAll('h1, .cs-lead, .cs-body :is(h2, h3, p, li, summary, .cs-code, .cs-table-wrap, .cs-diagram)').forEach(el => {
      if (el.closest('.cs-cta, .cs-related, .bench') || el.parentElement.closest('li')) return;
      const cue = CUES[el.classList[0]];
      if (cue) {
        if (out[out.length - 1] !== cue) out.push(cue);
        return;
      }
      const copy = el.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
      const text = copy.textContent.replace(/\s+/g, ' ').trim(); // textContent includes closed FAQ answers
      if (text) out.push(...split(text));
    });
    return out;
  };

  const pickVoice = () => {
    const voices = synth.getVoices().filter(v => v.localService && v.lang.slice(0, 2) === lang.slice(0, 2));
    return voices.find(v => v.default) || voices.find(v => /^(Samantha|Daniel|Microsoft)/.test(v.name)); // else the browser picks by lang
  };

  const button = (label, onClick) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-sm';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  };

  const setState = next => {
    state = next;
    main.textContent = { idle: '▶︎ Listen', playing: 'Pause', paused: 'Resume' }[next];
    if (next === 'idle' && document.activeElement === stopBtn) main.focus();
    stopBtn.hidden = rateBtn.hidden = next === 'idle';
  };

  const halt = next => {
    current = null; // makes pending events from the old utterance stale
    synth.cancel();
    setState(next);
  };

  const speak = () => {
    if (index >= chunks.length) return halt('idle');
    const u = new SpeechSynthesisUtterance(chunks[index]);
    const voice = pickVoice();
    u.lang = voice ? voice.lang : lang;
    if (voice) u.voice = voice;
    u.rate = RATES[rate];
    u.onend = () => { if (current === u) { index++; speak(); } };
    u.onerror = () => { if (current === u) halt('idle'); };
    current = u;
    synth.speak(u);
  };

  // pause = cancel + restart the same chunk: native pause() is unreliable on Android
  const main = button('', () => {
    if (state === 'playing') return halt('paused');
    if (state === 'idle') { chunks = collect(); index = 0; }
    synth.cancel(); // clears a stuck queue
    setState('playing');
    speak();
  });
  const stopBtn = button('Stop', () => halt('idle'));
  const rateBtn = button('', () => {
    rate = (rate + 1) % RATES.length;
    showRate();
    if (state !== 'playing') return;
    current = null;
    synth.cancel();
    speak();
  });
  const showRate = () => {
    rateBtn.textContent = RATES[rate] + '×';
    rateBtn.setAttribute('aria-label', 'Speed: ' + RATES[rate] + '×');
  };

  const row = document.createElement('div');
  row.className = 'listen';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Listen to this guide');
  row.append(main, stopBtn, rateBtn);
  showRate();
  setState('idle');
  byline.after(row);

  window.addEventListener('pagehide', () => { if (state === 'playing') halt('paused'); });
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
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let visible = false;
  // pause between steps while the screen is off-screen or the tab is hidden
  const whenVisible = async () => { while (!visible || document.hidden) await sleep(400); };
  const wait = async ms => { await sleep(ms); await whenVisible(); };
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

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(screen);

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

// Dates in charts that should follow the current month, e.g. "Nov 2026"
(() => {
  const now = new Date();
  document.querySelectorAll("[data-month-now]").forEach((el) => {
    el.textContent = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });
  document.querySelectorAll("[data-since]").forEach((el) => {
    const [year, month] = el.dataset.since.split("-").map(Number);
    const months = (now.getFullYear() - year) * 12 + now.getMonth() + 1 - month;
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const plural = (n) => `${n} year${n === 1 ? "" : "s"}`;
    const span = rest === 0 ? plural(years) : rest >= 9 ? `almost ${plural(years + 1)}` : `over ${plural(years)}`;
    el.textContent = `${span} without fixes`;
  });
})();
