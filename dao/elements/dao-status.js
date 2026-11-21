import { RANKS } from '../engine.js';
import { drawSprite, S_BATTLE_PLAYER, playerColors } from '../sprites.js';

const CSS = `
:host { display: block; }
.overlay {
  width: 100%; height: 100%;
  background: rgba(8,12,24,0.97);
  border-top: 2px solid #1e3050;
  display: flex; flex-direction: column;
  font-family: 'Space Mono', monospace;
  overflow-y: auto;
}
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 28px 10px;
  border-bottom: 1px solid #1e3050;
}
.topbar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #f0b830; letter-spacing: 2px;
}
.close-btn {
  background: transparent; border: 1px solid #1e3050;
  color: #6888b8; font-size: 16px;
  width: 32px; height: 32px;
  cursor: pointer; line-height: 1;
  pointer-events: all;
}
.close-btn:hover { border-color: #4488ff; color: #4488ff; }
.body {
  display: flex; gap: 40px;
  padding: 28px 40px;
  flex: 1;
  flex-wrap: wrap;
}
.col-left {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  min-width: 120px;
}
.col-left canvas { image-rendering: pixelated; }
.name    { font-family: 'Press Start 2P', monospace; font-size: 9px; color: #d8eaf8; text-align: center; }
.rank-en { font-family: 'Press Start 2P', monospace; font-size: 9px; color: #f0b830; text-align: center; }
.col-right { display: flex; flex-direction: column; gap: 14px; flex: 1; min-width: 200px; }
.divider { border: none; border-top: 1px solid #1e3050; }
.stat-row { display: flex; justify-content: space-between; font-size: 11px; color: #d8eaf8; }
.stat-label { color: #6888b8; }
.section-title { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #3a5878; letter-spacing: 2px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
.stat-entry { display: flex; justify-content: space-between; font-size: 11px; }
.stat-entry .stat-label { color: #3a5878; }
.stat-entry .stat-val   { color: #d8eaf8; }
.xp-row { display: flex; align-items: center; gap: 10px; font-size: 11px; }
.xp-track { flex: 1; height: 6px; background: #101828; border: 1px solid #1e3050; }
.xp-fill-s { height: 100%; background: #4488ff; transition: width 0.3s; }
.xp-label { color: #3a5878; font-size: 9px; white-space: nowrap; }
.techniques { display: flex; flex-wrap: wrap; gap: 8px; }
.technique { font-size: 10px; color: #80c8ff; border: 1px solid #1a3060; padding: 4px 10px; }
.traits-list { display: flex; flex-wrap: wrap; gap: 8px; }
.trait-pill { font-size: 9px; color: #30d4b0; border: 1px solid #0e3030; padding: 3px 8px; }
.footer {
  padding: 0 40px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.hint { font-size: 9px; color: #1e3050; }
.reset-btn {
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  padding: 8px 14px;
  background: transparent; border: 1px solid #6a0f18;
  color: #e03030; cursor: pointer;
  pointer-events: all;
}
.reset-btn:hover { background: #6a0f18; color: #d8eaf8; }
`;

export class DaoStatus extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="root"></div>`;
    this.style.display = 'none';
    this._open = false;

    window.__daoStatus = this;

    const e = window.__engine;
    const onPlayerChange = () => { if (this._open) this._render(e); };
    e.murim.addEventListener('playerchange', onPlayerChange);
    this._cleanup = () => e.murim.removeEventListener('playerchange', onPlayerChange);
  }

  disconnectedCallback() {
    this._cleanup?.();
    if (window.__daoStatus === this) delete window.__daoStatus;
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this.style.display = 'block';
    this._render(window.__engine);
  }

  close() {
    this._open = false;
    this.style.display = 'none';
  }

  _render(e) {
    const p    = e.player;
    const rank = RANKS[p.rank];
    const root = this.shadowRoot.getElementById('root');

    const traitHtml = p.traits.map(id => {
      const def = e.murim._traits.get(id);
      return def ? `<div class="trait-pill">${def.name}</div>` : '';
    }).join('');

    const xpPct = p.maxXp > 0 ? Math.round((p.xp / p.maxXp) * 100) : 0;

    root.innerHTML = `
<div class="overlay">
  <div class="topbar">
    <span class="topbar-title">CHARACTER</span>
    <button class="close-btn" id="close">×</button>
  </div>
  <div class="body">
    <div class="col-left">
      <canvas id="av" width="28" height="36"></canvas>
      <div class="name">${p.name}</div>
      <div class="rank-en">${rank.en}</div>
      <div class="stat-row"><span class="stat-label">HP</span>&nbsp;<span>${p.hp} / ${p.maxHp}</span></div>
      <div class="stat-row"><span class="stat-label">MANA</span>&nbsp;<span>${p.maxMana > 0 ? p.mana + ' / ' + p.maxMana : '—'}</span></div>
      <div class="stat-row"><span class="stat-label">COINS</span>&nbsp;<span>${p.coins}</span></div>
    </div>
    <div class="col-right">
      <div class="stat-row"><span class="stat-label">RANK</span><span>${p.rank} / 7</span></div>
      <div class="stat-row"><span class="stat-label">CHAPTER</span><span>${p.chapter + 1} / 8</span></div>
      <div class="xp-row">
        <span class="xp-label">XP</span>
        <div class="xp-track"><div class="xp-fill-s" style="width:${xpPct}%"></div></div>
        <span class="xp-label">${p.xp}/${p.maxXp}</span>
      </div>
      <hr class="divider">
      <div class="section-title">STATS</div>
      <div class="stats-grid">
        <div class="stat-entry"><span class="stat-label">STR</span><span class="stat-val">${p.str ?? 5}</span></div>
        <div class="stat-entry"><span class="stat-label">AGI</span><span class="stat-val">${p.agi ?? 5}</span></div>
        <div class="stat-entry"><span class="stat-label">INT</span><span class="stat-val">${p.int ?? 5}</span></div>
        <div class="stat-entry"><span class="stat-label">VIT</span><span class="stat-val">${p.vit ?? 5}</span></div>
        <div class="stat-entry"><span class="stat-label">WILL</span><span class="stat-val">${p.will ?? 5}</span></div>
      </div>
      <hr class="divider">
      <div class="section-title">TECHNIQUES</div>
      <div class="techniques">
        ${p.techniques.map(t => `<div class="technique">${t}</div>`).join('')}
      </div>
      ${traitHtml ? `<hr class="divider"><div class="section-title">TRAITS</div><div class="traits-list">${traitHtml}</div>` : ''}
    </div>
  </div>
  <div class="footer">
    <span class="hint">[ TAB ] or [ ☰ ] to close</span>
    <button class="reset-btn" id="reset">[ RESET SAVE ]</button>
  </div>
</div>`;

    drawSprite(root.querySelector('#av').getContext('2d'), S_BATTLE_PLAYER, playerColors(p.rank), 4);
    root.querySelector('#close').addEventListener('click', () => this.close());
    root.querySelector('#reset').addEventListener('click', () => {
      if (confirm('Reset all progress and start over?')) {
        e.murim.reset();
        location.reload();
      }
    });
  }
}
