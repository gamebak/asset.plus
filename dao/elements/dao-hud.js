import { RANKS } from '../engine.js';

const CSS = `
:host { display: block; pointer-events: none; }
.xp-bar {
  width: 100%; height: 3px;
  background: #101828;
}
.xp-fill {
  height: 100%;
  background: #4488ff;
  transition: width 0.4s;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 10px 20px;
  background: rgba(8,12,24,0.92);
  border-top: 1px solid #1e3050;
  font-family: 'Space Mono', monospace;
}
.stat {
  display: flex; align-items: center; gap: 8px;
}
.label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px; color: #3a5878;
  white-space: nowrap;
}
.track {
  width: 100px; height: 7px;
  background: #101828; border: 1px solid #1e3050;
}
.fill { height: 100%; transition: width 0.3s; }
.hp-fill   { background: #e03030; }
.mana-fill { background: #80c8ff; }
.val {
  font-size: 9px; color: #6888b8;
  min-width: 58px;
}
.coins-val {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #f0b830;
}
.sep { width: 1px; height: 20px; background: #1e3050; }
.menu-btn {
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  padding: 5px 10px; margin-left: 8px;
  background: transparent; border: 1px solid #1e3050;
  color: #6888b8; cursor: pointer;
  pointer-events: all;
}
.menu-btn:hover { border-color: #4488ff; color: #4488ff; }
`;

const HIDDEN_STATES = new Set(['TITLE', 'ORIGIN', 'BATTLE']);

export class DaoHud extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
<div class="xp-bar"><div class="xp-fill" id="xp-fill"></div></div>
<div class="bar" id="bar">
  <div class="stat">
    <span class="label">HP</span>
    <div class="track"><div class="fill hp-fill" id="hp-fill"></div></div>
    <span class="val" id="hp-val"></span>
  </div>
  <div class="sep"></div>
  <div class="stat">
    <span class="label">MANA</span>
    <div class="track"><div class="fill mana-fill" id="mana-fill"></div></div>
    <span class="val" id="mana-val"></span>
  </div>
  <div class="sep"></div>
  <div class="stat">
    <span class="label">COINS</span>
    <span class="coins-val" id="coins-val">0</span>
  </div>
  <div class="sep"></div>
  <button class="menu-btn" id="menu-btn">[ ☰ ]</button>
</div>`;

    const e = window.__engine;
    this._update(e);

    const onChange = () => this._update(e);
    e.addEventListener('statechange', onChange);
    e.murim.addEventListener('playerchange', onChange);
    this._cleanup = () => {
      e.removeEventListener('statechange', onChange);
      e.murim.removeEventListener('playerchange', onChange);
    };

    this.shadowRoot.getElementById('menu-btn').addEventListener('click', () => {
      window.__daoStatus?.toggle();
    });

    window.addEventListener('keydown', ev => {
      if (ev.key === 'Tab') { ev.preventDefault(); window.__daoStatus?.toggle(); }
    });
  }

  disconnectedCallback() { this._cleanup?.(); }

  _update(e) {
    const p  = e.player;
    const sr = this.shadowRoot;

    this.style.display = HIDDEN_STATES.has(e.state) ? 'none' : 'block';

    const hpPct   = p.maxHp   > 0 ? (p.hp   / p.maxHp)   * 100 : 0;
    const manaPct = p.maxMana > 0 ? (p.mana / p.maxMana) * 100 : 0;
    const xpPct   = p.maxXp   > 0 ? (p.xp   / p.maxXp)   * 100 : 0;

    sr.getElementById('hp-fill').style.width   = hpPct   + '%';
    sr.getElementById('mana-fill').style.width = manaPct + '%';
    sr.getElementById('xp-fill').style.width   = xpPct   + '%';
    sr.getElementById('hp-val').textContent    = `${p.hp}/${p.maxHp}`;
    sr.getElementById('mana-val').textContent  = p.maxMana > 0 ? `${p.mana}/${p.maxMana}` : '—';
    sr.getElementById('coins-val').textContent = p.coins;
  }
}
