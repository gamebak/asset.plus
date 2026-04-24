// ── Drawing utilities ────────────────────────────────────────────
function drawSprite(ctx, map, colors, px, ox = 0, oy = 0) {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const col = colors[map[r][c]];
      if (!col || col === 'transparent') continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + c * px, oy + r * px, px, px);
    }
  }
}

function makeCanvas(map, colors, px) {
  const el = document.createElement('canvas');
  el.width = map[0].length * px;
  el.height = map.length * px;
  el.style.imageRendering = 'pixelated';
  drawSprite(el.getContext('2d'), map, colors, px);
  return el;
}

// Pause RAF when element scrolls out of view; static frame if reduced motion
function makeLoop(fn, el) {
  if (MQ_MOTION.matches) { fn(); return; }
  let raf = null;
  function tick() { fn(); raf = requestAnimationFrame(tick); }
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(raf); raf = null; }
  }).observe(el);
}

// ── Sprite maps ──────────────────────────────────────────────────
const M = {
  coin:   [[0,1,1,0,0],[1,2,2,1,0],[1,2,2,1,0],[1,2,2,1,0],[0,1,1,0,0]],
  star:   [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
  gem:    [[0,1,1,1,1,0],[1,2,2,2,2,1],[1,2,2,2,2,1],[0,1,2,2,1,0],[0,0,1,1,0,0]],
  moon:   [[0,0,1,1,1,0,0],[0,1,1,1,0,0,0],[1,1,1,1,0,0,0],[1,1,1,1,0,0,0],[1,1,1,1,0,0,0],[0,1,1,1,0,0,0],[0,0,1,1,1,0,0]],
  tree:   [[0,0,0,1,0,0,0],[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[1,1,1,1,1,1,1],[0,0,0,2,0,0,0],[0,0,0,2,0,0,0],[0,0,0,2,0,0,0]],
  cloud:  [[0,0,1,1,0,0,0,0,0,0],[0,1,1,1,1,1,0,1,1,0],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[0,1,1,0,0,1,1,1,1,0]],
  avOpen: [[0,0,1,1,1,0,0],[0,1,2,2,2,1,0],[0,1,2,1,2,1,0],[0,1,2,2,2,1,0],[0,0,1,2,1,0,0],[0,1,1,1,1,1,0],[0,0,3,1,3,0,0],[0,0,1,1,1,0,0],[0,0,1,0,1,0,0]],
  avShut: [[0,0,1,1,1,0,0],[0,1,2,2,2,1,0],[0,1,2,2,2,1,0],[0,1,2,2,2,1,0],[0,0,1,2,1,0,0],[0,1,1,1,1,1,0],[0,0,3,1,3,0,0],[0,0,1,1,1,0,0],[0,0,1,0,1,0,0]],
  li: [[1,1,0,0,0,0,0,0],[1,1,0,0,0,0,0,0],[0,0,0,1,1,0,0,0],[1,1,0,1,1,1,0,0],[1,1,0,1,1,0,1,0],[1,1,0,1,1,0,1,0],[1,1,0,1,1,0,1,0],[0,0,0,0,0,0,0,0]],
  tw: [[1,0,0,0,0,0,0,1],[1,1,0,0,0,0,1,1],[0,1,1,0,0,1,1,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,1,1,0,0,1,1,0],[1,1,0,0,0,0,1,1],[1,0,0,0,0,0,0,1]],
  gh: [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[0,1,1,0,0,1,1,0],[0,0,1,0,0,1,0,0],[0,0,1,1,1,1,0,0]],
};

const BIRD_WINGS = { up: [[1,0,1],[0,1,0]], dn: [[0,1,0],[1,0,1]] };

const POTION_SHAPES = [
  [[0,0,1,4,4,1,0],[0,0,1,4,4,1,0],[0,1,1,1,1,1,0],[0,1,3,2,2,1,0],[1,1,1,1,1,1,1],[1,3,2,5,2,2,1],[1,3,2,5,2,2,1],[1,2,2,5,2,2,1],[1,2,2,2,2,2,1],[1,1,1,1,1,1,1],[0,1,1,1,1,1,0]],
  [[0,0,1,4,1,0,0],[0,0,1,4,1,0,0],[0,0,1,1,1,0,0],[0,0,1,3,1,0,0],[0,0,1,2,1,0,0],[0,0,1,5,1,0,0],[0,0,1,5,1,0,0],[0,0,1,2,1,0,0],[0,1,1,2,1,1,0],[0,1,2,2,2,1,0],[0,0,1,1,1,0,0]],
  [[0,0,1,4,1,0,0],[0,0,1,4,1,0,0],[0,1,1,1,1,1,0],[1,1,1,1,1,1,1],[1,3,2,2,2,2,1],[1,3,2,5,5,2,1],[1,2,2,5,5,2,1],[1,2,2,2,2,2,1],[1,2,2,2,2,2,1],[1,1,1,1,1,1,1],[0,1,1,1,1,1,0]],
  [[0,0,1,4,4,1,0],[0,0,1,4,4,1,0],[0,1,1,1,1,1,0],[1,1,3,2,2,1,1],[1,3,2,5,2,2,1],[0,1,2,5,2,1,0],[0,0,1,2,1,0,0],[0,1,2,2,2,1,0],[1,1,2,2,2,1,1],[1,1,1,1,1,1,1],[0,1,1,1,1,1,0]],
  [[0,0,1,4,1,0,0],[0,1,1,4,1,1,0],[1,1,1,1,1,1,1],[1,3,1,2,1,2,1],[1,2,1,2,1,2,1],[1,1,1,2,1,1,1],[0,1,2,2,2,1,0],[0,1,2,5,2,1,0],[0,1,1,2,1,1,0],[0,0,1,1,1,0,0],[0,0,0,1,0,0,0]],
  [[0,1,4,4,1,0,0],[0,1,4,4,1,0,0],[0,1,1,1,1,0,0],[0,1,3,2,1,0,0],[0,1,3,2,1,0,0],[0,1,2,2,1,0,0],[0,1,5,2,1,0,0],[0,1,5,2,1,0,0],[0,1,2,2,1,0,0],[0,0,1,1,0,0,0],[0,0,0,1,0,0,0]],
];
const POTION_COLORS = [
  {liquid:'#3388ff',shine:'#88ccff',label:'#ffdd00'},
  {liquid:'#ee2244',shine:'#ff88aa',label:'#ffffff'},
  {liquid:'#22bb44',shine:'#88ffaa',label:'#ffdd00'},
  {liquid:'#9933dd',shine:'#cc88ff',label:'#ffdd00'},
  {liquid:'#ff8800',shine:'#ffcc66',label:'#ffffff'},
  {liquid:'#11cccc',shine:'#88ffff',label:'#ffdd00'},
];

function potionColorMap(idx, active) {
  const p = POTION_COLORS[idx % POTION_COLORS.length];
  return {
    0:'transparent', 1:'#1a1208',
    2: active ? p.liquid : '#3a3530',
    3: active ? p.shine  : '#4a4540',
    4:'#8b6914',
    5: active ? p.label  : '#2a2520',
  };
}

function makePotionCanvas(idx, px, active = true) {
  const map = POTION_SHAPES[idx % POTION_SHAPES.length];
  return makeCanvas(map, potionColorMap(idx, active), px);
}

// ── Global theme state ───────────────────────────────────────────
const MQ_DARK   = window.matchMedia('(prefers-color-scheme: dark)');
const MQ_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
let isDark = MQ_DARK.matches;
const themeListeners = [];

function setDark(d) {
  isDark = d;
  document.body.classList.toggle('light', !d);
  themeListeners.forEach(fn => fn(d));
}

function onTheme(fn) { themeListeners.push(fn); }

// ── Scroll helper ────────────────────────────────────────────────
let scrollRoot;
function scrollTo(id) {
  scrollRoot ??= document.getElementById('scroll-root');
  const el = document.getElementById(id);
  if (el && scrollRoot) scrollRoot.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
}

// ── HP Bar ───────────────────────────────────────────────────────
function initHPBar() {
  const cellsEl = document.getElementById('hp-cells');
  const pctEl   = document.getElementById('hp-pct');
  const iconsEl = document.getElementById('hp-icons');
  const N = 20;
  const cells = [];

  for (let i = 0; i < N; i++) {
    const d = document.createElement('div');
    d.className = 'hp-cell';
    cellsEl.appendChild(d);
    cells.push(d);
  }

  iconsEl.append(
    makeCanvas(M.coin, {0:'transparent',1:'#a07010',2:'#f0c030'}, 4),
    makeCanvas(M.gem,  {0:'transparent',1:'#7a1060',2:'#ff44aa'}, 4),
    makeCanvas(M.star, {0:'transparent',1:'#ffdd00'}, 4),
  );

  const root = document.getElementById('scroll-root');
  root.addEventListener('scroll', () => {
    const max = root.scrollHeight - root.clientHeight;
    const pct = max > 0 ? root.scrollTop / max : 0;
    const filled = Math.round(pct * N);
    const col = filled > 13 ? 'var(--green)' : filled > 6 ? 'var(--gold)' : 'var(--orange)';
    cells.forEach((c, i) => {
      if (i < filled) c.style.background = col;
      else c.style.removeProperty('background');
    });
    pctEl.style.color = col;
    pctEl.textContent = Math.round(pct * 100) + '%';
  }, { passive: true });
}

// ── Day/Night ────────────────────────────────────────────────────
function initDayNight() {
  const btn = document.getElementById('day-night');

  function render(dark) {
    btn.replaceChildren(dark
      ? makeCanvas(M.star, {0:'transparent',1:'#f0d060'}, 5)
      : makeCanvas(M.moon, {0:'transparent',1:'#f0d060'}, 5)
    );
  }

  btn.addEventListener('click', () => setDark(!isDark));
  MQ_DARK.addEventListener('change', e => setDark(e.matches));
  onTheme(render);
  setDark(isDark);
}

// ── Nav + scroll buttons ─────────────────────────────────────────
function initNav() {
  scrollRoot ??= document.getElementById('scroll-root');
  const stickyBtn = document.getElementById('sticky-hire');
  stickyBtn.addEventListener('click', () => scrollTo('find-me'));

  new IntersectionObserver(([entry]) => {
    stickyBtn.classList.toggle('hide', entry.isIntersecting);
  }, { root: scrollRoot }).observe(document.getElementById('find-me'));

  const navLinks = document.querySelectorAll('.nav-link[data-target]');
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = [...navLinks].find(l => l.dataset.target === entry.target.id);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { root: scrollRoot, rootMargin: '-35% 0px -35% 0px' });
  ['stack', 'packages', 'find-me'].forEach(id => sectionIO.observe(document.getElementById(id)));

  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); scrollTo(el.dataset.target); });
  });
}

// ── XP bar ──────────────────────────────────────────────────────
function initXPBar() {
  const el = document.getElementById('xp-bar');
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('div');
    const pulse = i >= 11;
    d.className = 'xp-cell filled' + (pulse ? ' pulse' : '');
    if (pulse) d.style.animationDelay = ((i - 11) * 0.15) + 's';
    el.appendChild(d);
  }
}

// ── Avatar (blink) ───────────────────────────────────────────────
function initAvatar() {
  const canvas = document.getElementById('avatar-canvas');
  const PX = 12;
  canvas.width  = M.avOpen[0].length * PX;
  canvas.height = M.avOpen.length * PX;
  const ctx = canvas.getContext('2d');
  const C = {0:'transparent',1:'#2a2520',2:'#c8a882',3:'#ff6600'};

  function draw(blink) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSprite(ctx, blink ? M.avShut : M.avOpen, C, PX);
  }
  draw(false);
  if (!MQ_MOTION.matches) {
    let timer = null;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!timer) timer = setInterval(() => { draw(true); setTimeout(() => draw(false), 120); }, 2400);
      } else {
        clearInterval(timer);
        timer = null;
      }
    }).observe(canvas);
  }
}

// ── Hero background (stars + birds + sky deco) ───────────────────
function initHeroBg() {
  const canvas = document.getElementById('hero-bg');
  const hero   = document.getElementById('hero');
  const ctx    = canvas.getContext('2d');
  let frame = 0;

  const moonSprite  = makeCanvas(M.moon,  {0:'transparent',1:'#f0d060'}, 5);
  const starBig     = makeCanvas(M.star,  {0:'transparent',1:'#f0d060'}, 5);
  const starMed     = makeCanvas(M.star,  {0:'transparent',1:'#5599dd'}, 3);
  const starSml     = makeCanvas(M.star,  {0:'transparent',1:'#dd5599'}, 2);
  const cloudSprite = makeCanvas(M.cloud, {0:'transparent',1:'rgba(180,200,220,0.22)'}, 3);

  const STARS = [
    {x:.05,y:.15,p:0,c:'#ffdd00'},{x:.15,y:.08,p:1,c:'#00ccff'},{x:.28,y:.20,p:2,c:'#ff44aa'},
    {x:.42,y:.06,p:0,c:'#ffdd00'},{x:.55,y:.18,p:3,c:'#39d353'},{x:.68,y:.10,p:1,c:'#00ccff'},
    {x:.78,y:.24,p:2,c:'#ff44aa'},{x:.88,y:.04,p:0,c:'#ffdd00'},{x:.22,y:.30,p:3,c:'#39d353'},
    {x:.48,y:.28,p:1,c:'#00ccff'},{x:.72,y:.32,p:2,c:'#ff44aa'},{x:.94,y:.16,p:0,c:'#ffdd00'},
  ];
  // y as fraction of canvas height — positions birds just above the h1 text
  const FLOCK = [
    {spd:.18,y:.28,ph:0,  sz:3},{spd:.13,y:.32,ph:80, sz:2},
    {spd:.22,y:.25,ph:160,sz:3},{spd:.16,y:.35,ph:240,sz:2},{spd:.20,y:.30,ph:310,sz:2},
  ];

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  function tick() {
    frame++;
    const {width: W, height: H} = canvas;
    ctx.clearRect(0, 0, W, H);

    STARS.forEach(s => {
      if ((Math.floor(frame / 21) + s.p) % 4 >= 2) return;
      ctx.fillStyle = s.c;
      ctx.globalAlpha = isDark ? 0.8 : 0.4;
      ctx.fillRect(Math.floor(s.x * W), Math.floor(s.y * H), 3, 3);
    });
    ctx.globalAlpha = 1;

    const deco = isDark ? moonSprite : starBig;
    ctx.drawImage(deco, 20, 16);
    ctx.drawImage(starMed, 20 + deco.width + 8, 16);
    ctx.drawImage(starSml, 20 + deco.width + 8 + starMed.width + 8, 16);
    ctx.drawImage(cloudSprite, 20, 16 + deco.height + 6);

    FLOCK.forEach((b, i) => {
      const x = ((frame * b.spd * 0.01 + b.ph * 0.01) % 1.35) * W - 20;
      const wm = Math.floor(frame * 0.2 + i) % 2 === 0 ? BIRD_WINGS.up : BIRD_WINGS.dn;
      ctx.globalAlpha = 0.55;
      wm.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        ctx.fillStyle = isDark ? '#8b949e' : '#5a5048';
        ctx.fillRect(x + c * b.sz, b.y * H + r * b.sz, b.sz, b.sz);
      }));
      ctx.globalAlpha = 1;
    });
  }

  makeLoop(tick, hero);
}

// ── Philosophy potions ───────────────────────────────────────────
function initPhilosophyPotions() {
  const el = document.getElementById('philosophy-potions');
  [2, 0, 3].forEach(i => el.appendChild(makePotionCanvas(i, 4, true)));
}

// ── Packages ─────────────────────────────────────────────────────
const LIBS = [
  {name:'lib-router',   desc:'Zero-dep client-side router',  tags:['JS','2.1kb'], idx:0},
  {name:'lib-store',    desc:'Reactive state primitive',      tags:['JS','1.4kb'], idx:1},
  {name:'lib-fetch',    desc:'Typed fetch wrapper',           tags:['JS','3kb'],   idx:2},
  {name:'lib-validate', desc:'Schema validation, no deps',    tags:['JS','Node'],  idx:3},
  {name:'lib-emitter',  desc:'Event bus, 0 deps',             tags:['JS','0.8kb'], idx:4},
  {name:'lib-auth',     desc:'JWT helper for Node',           tags:['Node','AWS'], idx:5},
];

function buildExpandPanel(lib) {
  const panel = document.createElement('div');
  panel.className = 'expand-panel';

  const cmd = document.createElement('div');
  cmd.className = 'expand-cmd';
  cmd.textContent = `$ npm install ${lib.name}`;

  const code = document.createElement('div');
  code.className = 'expand-code';
  code.textContent = `npm i ${lib.name}`;

  const btns = document.createElement('div');
  btns.className = 'expand-btns';

  const gh = document.createElement('button');
  gh.className = 'px-btn sm';
  gh.textContent = '[ GITHUB → ]';

  const docs = document.createElement('button');
  docs.className = 'px-btn sm';
  docs.textContent = '[ DOCS → ]';

  btns.append(gh, docs);
  panel.append(cmd, code, btns);
  return panel;
}

function initPackages() {
  document.getElementById('packages-gem-icon')
    .appendChild(makeCanvas(M.gem, {0:'transparent',1:'#7a1060',2:'#ff44aa'}, 6));

  const grid = document.getElementById('packages-grid');
  let activeCard = null;
  let activePanel = null;

  LIBS.forEach(lib => {
    const wrapper = document.createElement('div');

    const card = document.createElement('div');
    card.className = 'potion-card';

    const nameEl = document.createElement('div');
    nameEl.className = 'px-title card-name';
    nameEl.textContent = lib.name;

    const descEl = document.createElement('div');
    descEl.className = 'card-desc';
    descEl.textContent = lib.desc;

    const tagsEl = document.createElement('div');
    tagsEl.className = 'card-tags';
    lib.tags.forEach(t => {
      const s = document.createElement('span');
      s.className = 'tag-item';
      s.textContent = t;
      tagsEl.appendChild(s);
    });

    card.append(makePotionCanvas(lib.idx, 7, true), nameEl, descEl, tagsEl);

    card.addEventListener('click', () => {
      if (activeCard === card) {
        card.classList.remove('active');
        activePanel.remove();
        activeCard = null;
        activePanel = null;
      } else {
        if (activeCard) {
          activeCard.classList.remove('active');
          activePanel.remove();
        }
        card.classList.add('active');
        activePanel = buildExpandPanel(lib);
        wrapper.appendChild(activePanel);
        activeCard = card;
      }
    });

    wrapper.appendChild(card);
    grid.appendChild(wrapper);
  });
}

// ── Koi Pond ─────────────────────────────────────────────────────
function initKoiPond() {
  const canvas = document.getElementById('pond-canvas');
  const ctx    = canvas.getContext('2d');
  const PX = 8, ROWS = 22;
  let t = 0;

  const WC = ['#0a2a4a','#0d3460','#104078','#0d3460','#0a2a4a','#081e38'];
  const fishR = [
    [0,0,0,0,1,1,0,0,0,0,0,0],[0,0,0,1,4,4,1,0,0,0,0,0],
    [0,0,1,2,2,2,2,1,1,1,1,0],[6,1,2,7,2,2,2,3,2,2,1,0],
    [6,1,2,2,2,2,2,3,5,1,0,0],[0,0,1,4,2,3,2,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0],
  ];
  const fishL = fishR.map(r => [...r].reverse());
  const FISHES = [
    {spd:.38,y:.22,ph:0,   color:'#ff5522',belly:'#ffaa66',fin:'#ff8833',pat:'#cc2200',sz:5},
    {spd:.25,y:.62,ph:2.1, color:'#ffffff',belly:'#eeeeff',fin:'#ddddff',pat:'#ffaacc',sz:4},
    {spd:.48,y:.80,ph:4.5, color:'#ffaa00',belly:'#ffee88',fin:'#ffcc22',pat:'#ff6600',sz:5},
    {spd:.30,y:.42,ph:6.8, color:'#cc44ff',belly:'#eeccff',fin:'#aa22dd',pat:'#880099',sz:4},
  ];
  const LILY = [[0,1,1,1,0,0],[1,2,2,2,1,0],[1,2,2,2,2,1],[0,1,1,1,1,0]];
  const LILY_POS = [{x:.12,y:.2},{x:.78,y:.65},{x:.45,y:.82}];
  const RIPPLES  = [{cx:.2,cy:.5,ph:0},{cx:.72,cy:.3,ph:1.8},{cx:.5,cy:.75,ph:3.2}];

  const section = canvas.parentElement;
  function resize() {
    canvas.width  = section.offsetWidth;
    canvas.height = PX * ROWS;
  }
  resize();
  new ResizeObserver(resize).observe(section);

  function fishColor(v, f) {
    return (['transparent','#050d14',f.color,f.belly,f.fin,'#050d14',f.fin,f.pat])[v] ?? 'transparent';
  }

  function draw() {
    const {width: W, height: H} = canvas;
    const cols = Math.ceil(W / PX);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        const w = Math.sin(c * 0.45 + t * 2.2 + r * 0.35) * 0.5 + 0.5;
        ctx.fillStyle = WC[Math.floor(w * (WC.length - 1))];
        ctx.fillRect(c * PX, r * PX, PX, PX);
      }
    }

    RIPPLES.forEach(rp => {
      const ph  = (t * 1.2 + rp.ph) % 3;
      const rad = ph * 14;
      const op  = Math.max(0, 1 - ph / 3) * 0.5;
      ctx.fillStyle = `rgba(100,180,255,${op})`;
      const cx = rp.cx * W, cy = rp.cy * H;
      [[cx,cy-rad],[cx+rad*.7,cy-rad*.7],[cx+rad,cy],[cx+rad*.7,cy+rad*.7],
       [cx,cy+rad],[cx-rad*.7,cy+rad*.7],[cx-rad,cy],[cx-rad*.7,cy-rad*.7]].forEach(([px,py]) => {
        ctx.fillRect(Math.round(px/PX)*PX, Math.round(py/PX)*PX, PX, PX);
      });
    });

    LILY_POS.forEach(l => {
      drawSprite(ctx, LILY, {0:'transparent',1:'#1a5c1a',2:'#22841a'}, 6,
        Math.round(l.x * W / PX) * PX - 3,
        Math.round(l.y * H / PX) * PX - 2);
    });

    FISHES.forEach(f => {
      const x   = ((t * f.spd + f.ph) % 1.35) * W - 20;
      const goR = Math.floor((t * f.spd + f.ph) / 1.35) % 2 === 0;
      const map = goR ? fishR : fishL;
      if (x < -80 || x > W + 20) return;
      const fy = f.y * H - (map.length * f.sz) / 2;
      map.forEach((row, r) => row.forEach((v, c) => {
        const col = fishColor(v, f);
        if (col === 'transparent') return;
        ctx.fillStyle = col;
        ctx.fillRect(x + c * f.sz, fy + r * f.sz, f.sz, f.sz);
      }));
    });

    ctx.fillStyle = '#050d14';
    ctx.fillRect(0, 0, W, 2);
    ctx.fillRect(0, H - 2, W, 2);

    // Message overlay
    const msg1 = "You've reached the end of my story.";
    const msg2 = 'Relax, and enjoy the koi.';
    const cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '8px "Press Start 2P"';
    const w1 = ctx.measureText(msg1).width;
    ctx.font = 'italic 11px "Space Mono"';
    const w2 = ctx.measureText(msg2).width;
    const pad = 18, bw = Math.max(w1, w2) + pad * 2, bh = 54;
    const bx = Math.round(cx - bw / 2), by = Math.round(cy - bh / 2);
    ctx.fillStyle = 'rgba(5,13,20,0.8)';
    ctx.fillRect(bx, by, bw, bh);
    const pulse = 0.22 + Math.sin(t * 1.8) * 0.08;
    ctx.strokeStyle = `rgba(0,204,255,${pulse})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    ctx.font = '8px "Press Start 2P"';
    ctx.fillStyle = `rgba(0,204,255,${0.72 + Math.sin(t * 1.8) * 0.15})`;
    ctx.fillText(msg1, cx, cy - 13);
    ctx.font = 'italic 11px "Space Mono"';
    ctx.fillStyle = 'rgba(230,237,243,0.55)';
    ctx.fillText(msg2, cx, cy + 14);
    ctx.restore();
  }

  function tick() { t += 0.015; draw(); }
  makeLoop(tick, canvas);
}

// ── Find Me: landscape strip ─────────────────────────────────────
function initLandscape() {
  const canvas = document.getElementById('landscape-canvas');
  const wrap   = document.getElementById('landscape-wrap');
  const ctx    = canvas.getContext('2d');
  let frame = 0;

  const FLOCK = [
    {spd:.18,y:8, ph:0,  sz:2},{spd:.13,y:14,ph:80, sz:2},
    {spd:.22,y:5, ph:160,sz:2},{spd:.16,y:18,ph:240,sz:2},
  ];

  const treeL  = makeCanvas(M.tree, {0:'transparent',1:'#1a5a1a',2:'#6b3a1f'}, 4);
  const treeSm = makeCanvas(M.tree, {0:'transparent',1:'#226622',2:'#6b3a1f'}, 3);
  const cld    = makeCanvas(M.cloud,{0:'transparent',1:'rgba(100,140,200,0.25)'}, 2);
  const coinC  = makeCanvas(M.coin, {0:'transparent',1:'#a07010',2:'#f0c030'}, 4);

  function resize() {
    const r = wrap.getBoundingClientRect();
    canvas.width  = r.width  || 900;
    canvas.height = r.height || 60;
  }
  resize();
  new ResizeObserver(resize).observe(wrap);

  function tick() {
    frame++;
    const {width: W, height: H} = canvas;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, W, H * 0.55);
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, H * 0.55, W, H * 0.45);

    ctx.drawImage(treeL,  10,              H - treeL.height);
    ctx.drawImage(treeSm, 55,              H - treeSm.height);
    ctx.drawImage(treeSm, W - 55 - treeSm.width, H - treeSm.height);
    ctx.drawImage(treeL,  W - 10 - treeL.width,  H - treeL.height);
    ctx.drawImage(cld, W * 0.3,  4);
    ctx.drawImage(cld, W * 0.75, 8);
    ctx.drawImage(coinC, W - 12 - coinC.width, 4);

    FLOCK.forEach((b, i) => {
      const x = ((frame * b.spd * 0.01 + b.ph * 0.01) % 1.35) * W - 20;
      const wm = Math.floor(frame * 0.2 + i) % 2 === 0 ? BIRD_WINGS.up : BIRD_WINGS.dn;
      ctx.globalAlpha = 0.55;
      wm.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        ctx.fillStyle = isDark ? '#8b949e' : '#5a5048';
        ctx.fillRect(x + c * b.sz, b.y + r * b.sz, b.sz, b.sz);
      }));
      ctx.globalAlpha = 1;
    });
  }

  makeLoop(tick, canvas);
}

// ── Social icons (theme-aware, platform-colored) ─────────────────
function initSocialIcons() {
  const iconMaps = { linkedin: M.li, twitter: M.tw, github: M.gh };
  const COLORS = {
    linkedin: { dark: '#0a84d0', light: '#0a84d0' },
    twitter:  { dark: '#cccccc', light: '#444444' },
    github:   { dark: '#a371f7', light: '#6f42c1' },
  };

  function render(dark) {
    document.querySelectorAll('[data-social-icon]').forEach(slot => {
      const key = slot.dataset.socialIcon;
      const map = iconMaps[key];
      const col = COLORS[key]?.[dark ? 'dark' : 'light'] ?? (dark ? '#e6edf3' : '#2a2520');
      if (map) slot.replaceChildren(makeCanvas(map, {0:'transparent',1:col}, 8));
    });
  }

  onTheme(render);
  render(isDark);
}

// ── Header + footer icons ────────────────────────────────────────
function initIcons() {
  document.getElementById('findme-coin-icon')
    .appendChild(makeCanvas(M.coin, {0:'transparent',1:'#a07010',2:'#f0c030'}, 6));

  const footer = document.getElementById('footer-icons');
  footer.append(
    makeCanvas(M.star, {0:'transparent',1:'#ffdd00'}, 4),
    makeCanvas(M.gem,  {0:'transparent',1:'#7a1060',2:'#ff44aa'}, 4),
    makeCanvas(M.coin, {0:'transparent',1:'#a07010',2:'#f0c030'}, 4),
  );
}

// ── Boot sequence ─────────────────────────────────────────────────
function initBoot() {
  const el = document.getElementById('boot-screen');
  const lines = [
    'ASSET.PLUS OS v1.0.0',
    '(c) 2026 ASSET.PLUS CORP.',
    '',
    '> INIT PIXEL ENGINE ........ OK',
    '> LOADING SPRITES .......... OK',
    '> SUMMONING KOI ............ OK',
    '> BOOT DEV MODE ............ OK',
    '',
    'WELCOME, VISITOR_',
  ];

  const pre = document.createElement('pre');
  pre.className = 'boot-content';
  el.appendChild(pre);

  document.fonts.ready.then(() => {
    let i = 0;
    function next() {
      if (i >= lines.length) {
        setTimeout(() => {
          el.classList.add('boot-out');
          el.addEventListener('transitionend', () => el.remove(), { once: true });
        }, 260);
        return;
      }
      pre.textContent += lines[i] + '\n';
      i++;
      setTimeout(next, i === 1 ? 120 : 60);
    }
    next();
  });
}

// ── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHPBar();
  initDayNight();
  initNav();
  initXPBar();
  initAvatar();
  initHeroBg();
  initPhilosophyPotions();
  initPackages();
  initKoiPond();
  initLandscape();
  initSocialIcons();
  initIcons();
});

initBoot();
