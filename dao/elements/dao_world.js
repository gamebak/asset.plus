import { CHAPTERS } from '../story.js';

const RANK_COLORS = ['#1e3050','#804020','#6090c0','#3a7fd0','#c09030','#d04010','#2255cc','#40aaee'];

const CSS = `
:host { display: block; }
.container { position: relative; width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
.overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px;
  pointer-events: none;
  font-family: 'Space Mono', monospace;
}
.ch-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px; color: #3a5878; letter-spacing: 3px;
}
.ch-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px; color: #f0b830; letter-spacing: 2px;
  text-align: center; max-width: 480px; line-height: 1.8;
}
.continue-btn {
  font-family: 'Press Start 2P', monospace; font-size: 9px;
  padding: 14px 30px; margin-top: 8px;
  background: transparent; border: 1px solid #1e3050;
  color: #d8eaf8; cursor: pointer;
  pointer-events: all;
  transition: border-color 0.1s, color 0.1s, background 0.1s;
}
.continue-btn:hover { border-color: #4488ff; color: #4488ff; background: rgba(68,136,255,0.10); }
.end-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px; color: #f0b830; letter-spacing: 4px;
}
`;

export class DaoWorld extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
<div class="container">
  <canvas id="c"></canvas>
  <div class="overlay" id="overlay"></div>
</div>`;

    this.canvas = this.shadowRoot.getElementById('c');
    this.ctx    = this.canvas.getContext('2d');

    this._frame        = 0;
    this._rankFlash    = 0;
    this._rankColor    = '#f5c020';
    this._rafId        = null;
    this._visible      = true;
    this._loopRunning  = false;

    const ro = new ResizeObserver(() => this._resize());
    ro.observe(this);
    this._resize();

    const io = new IntersectionObserver(([e]) => {
      this._visible = e.isIntersecting;
      if (this._visible) this._startLoop();
    });
    io.observe(this);

    const eng = window.__engine;
    const handler = ev => this._onState(ev.detail, eng);
    eng.addEventListener('statechange', handler);
    this._cleanup = () => eng.removeEventListener('statechange', handler);

    this._startLoop();
    if (eng.state === 'WORLD') this._updateOverlay(eng);
  }

  disconnectedCallback() {
    this._cleanup?.();
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
    this._loopRunning = false;
  }

  _resize() {
    this.canvas.width  = this.offsetWidth  || window.innerWidth;
    this.canvas.height = this.offsetHeight || window.innerHeight;
  }

  _onState({ state, rank }, eng) {
    if (state === 'RANK_UP') {
      this._rankFlash = 100;
      this._rankColor = RANK_COLORS[Math.min(rank ?? eng.player.rank, 6)];
      setTimeout(() => {
        window.__engine.finishDialogue(window.__engine.player.chapter - 1, 'rank_up');
      }, 1800);
    }

    const overlay = this.shadowRoot.getElementById('overlay');
    if (state === 'WORLD') {
      this._updateOverlay(eng);
    } else if (overlay) {
      overlay.innerHTML = '';
    }
  }

  _updateOverlay(eng) {
    const overlay = this.shadowRoot.getElementById('overlay');
    if (!overlay) return;

    const ch          = eng.player.chapter;
    const chapter     = CHAPTERS[ch];
    const done        = !!eng.player.battlesDone[ch];
    const introSeen   = !!((eng.player.introsShown || {})[ch]);
    const isEnd       = ch === 7 && done;

    if (isEnd) {
      overlay.innerHTML = `<div class="end-text">— PATH COMPLETE —</div>`;
      return;
    }

    const btnLabel = done ? 'NEXT CHAPTER ›' : 'CONTINUE ›';

    overlay.innerHTML = `
      <div class="ch-label">CHAPTER ${ch + 1} / 8</div>
      <div class="ch-title">${(chapter?.title || '').toUpperCase()}</div>
      <button class="continue-btn" id="cont">${btnLabel}</button>
    `;

    overlay.querySelector('#cont').addEventListener('click', () => {
      if (!introSeen) {
        eng.setState('DIALOGUE', { chapter: ch, phase: 'intro' });
      } else if (!done) {
        eng.setState('DIALOGUE', { chapter: ch, phase: 'pre_battle' });
      } else if (ch < 7) {
        eng.player.chapter = ch + 1;
        eng.murim.save();
        this._updateOverlay(eng);
      }
    });
  }

  _startLoop() {
    if (this._loopRunning) return;
    this._loopRunning = true;
    const tick = () => {
      if (!this._visible) { this._loopRunning = false; this._rafId = null; return; }
      this._rafId = requestAnimationFrame(tick);
      this._frame++;
      this._drawBackground();
    };
    tick();
  }

  _drawBackground() {
    const { canvas, ctx } = this;
    const W = canvas.width, H = canvas.height;
    const eng = window.__engine;

    if (!eng?.player?.name) { this._drawTitle(); return; }

    ctx.fillStyle = '#080c18';
    ctx.fillRect(0, 0, W, H);

    // Floating qi motes
    const t = this._frame * 0.008;
    for (let i = 0; i < 50; i++) {
      const x = ((i * 137.5 + Math.sin(t * 0.4 + i) * 40) % W + W) % W;
      const y = ((i * 97.3  - t * 18 + H * 10) % H);
      const a = 0.10 + 0.20 * Math.sin(t * 1.2 + i * 0.8);
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? `rgba(240,184,48,${a * 0.5})` : `rgba(68,136,255,${a})`;
      ctx.fill();
    }

    // Rank-up flash
    if (this._rankFlash > 0) {
      ctx.globalAlpha = Math.min(1, this._rankFlash / 30) * 0.65;
      ctx.fillStyle   = this._rankColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      this._rankFlash--;
    }
  }

  _drawTitle() {
    const { canvas, ctx } = this;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#080c18';
    ctx.fillRect(0, 0, W, H);

    const t = this._frame * 0.01;
    for (let i = 0; i < 80; i++) {
      const x = ((i * 137.5 + t * 12) % W);
      const y = ((i * 97.3)  % H);
      const a = 0.3 + 0.3 * Math.sin(t + i);
      ctx.fillStyle = i % 4 === 0 ? `rgba(240,184,48,${a * 0.4})` : `rgba(68,136,255,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    ctx.textAlign = 'center';
    ctx.font      = '20px "Press Start 2P"';
    ctx.fillStyle = '#f0b830';
    ctx.fillText('DAO', W / 2, H / 2 - 40);

    ctx.font      = '8px "Press Start 2P"';
    ctx.fillStyle = '#6888b8';
    ctx.fillText("A Cultivator's Path", W / 2, H / 2 - 14);

    ctx.font      = '7px "Press Start 2P"';
    ctx.fillStyle = (Math.floor(this._frame / 30) % 2 === 0) ? '#d8eaf8' : '#3a5878';
    ctx.fillText('enter your name below', W / 2, H / 2 + 20);
    ctx.textAlign = 'left';
  }
}
