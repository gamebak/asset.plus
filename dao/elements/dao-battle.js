import { ENEMIES } from '../sprites.js';
import { drawSprite, S_BATTLE_PLAYER, playerColors } from '../sprites.js';

const CSS = `
:host { display: block; }
.arena {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: #080c18;
  font-family: 'Space Mono', monospace;
}
.combatants {
  display: flex; align-items: center; justify-content: space-around;
  padding: 32px 40px 16px;
  flex: 1;
}
.fighter { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.fighter canvas { image-rendering: pixelated; }
.fname { font-family: 'Press Start 2P', monospace; font-size: 8px; color: #d8eaf8; }
.hp-track { width: 140px; height: 9px; background: #101828; border: 1px solid #1e3050; }
.hp-fill  { height: 100%; transition: width 0.4s; }
.player-hp { background: #e03030; }
.enemy-hp  { background: #30d4b0; }
.hp-nums { font-size: 9px; color: #6888b8; }
.vs { font-family: 'Press Start 2P', monospace; font-size: 14px; color: #1e3050; }
.log {
  height: 80px; overflow-y: auto;
  border-top: 1px solid #101828; border-bottom: 1px solid #101828;
  padding: 8px 20px;
  font-size: 11px; color: #6888b8; line-height: 1.7;
  background: #080e18;
}
.log .entry { color: #d8eaf8; }
.log .entry.good { color: #30d4b0; }
.log .entry.bad  { color: #e03030; }
.actions {
  display: flex; gap: 10px;
  padding: 14px 20px;
  background: #080e18;
  flex-wrap: wrap;
}
.act-btn {
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  padding: 9px 14px;
  background: transparent;
  border: 1px solid #1e3050; color: #d8eaf8;
  cursor: pointer; transition: all 0.08s;
}
.act-btn:hover:not(:disabled) { background: #1e3050; color: #4488ff; border-color: #4488ff; }
.act-btn:disabled { opacity: 0.35; cursor: default; }
.act-btn.technique { border-color: #80c8ff; color: #80c8ff; }
.act-btn.technique:hover:not(:disabled) { background: #0e1e38; }
`;

export class DaoBattle extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="root" style="width:100%;height:100%"></div>`;
    this.style.display = 'none';

    const e = window.__engine;
    const handler = ev => this._onState(ev.detail, e);
    e.addEventListener('statechange', handler);
    this._cleanup = () => e.removeEventListener('statechange', handler);
  }

  disconnectedCallback() { this._cleanup?.(); }

  _onState({ state, chapter }, e) {
    if (state === 'BATTLE') {
      this.style.display = 'block';
      this._start(chapter, e);
    } else {
      this.style.display = 'none';
    }
  }

  _start(chapter, engine) {
    const enemy  = ENEMIES[chapter] || ENEMIES[0];
    const player = engine.player;

    const state = {
      playerHp:  player.hp,
      playerMax: player.maxHp,
      enemyHp:   enemy.hp,
      enemyMax:  enemy.hp,
      turn:      'player',
      busy:      false,
    };

    const root = this.shadowRoot.getElementById('root');

    const render = () => {
      const pPct = Math.max(0, state.playerHp / state.playerMax) * 100;
      const ePct = Math.max(0, state.enemyHp  / state.enemyMax)  * 100;

      root.innerHTML = `
<div class="arena">
  <div class="combatants">
    <div class="fighter" id="player-fig">
      <canvas id="pc" width="28" height="36"></canvas>
      <div class="fname">${player.name}</div>
      <div class="hp-track"><div class="hp-fill player-hp" id="php" style="width:${pPct}%"></div></div>
      <div class="hp-nums">${state.playerHp}/${state.playerMax}</div>
    </div>
    <div class="vs">VS</div>
    <div class="fighter" id="enemy-fig">
      <canvas id="ec" width="28" height="36"></canvas>
      <div class="fname">${enemy.name}</div>
      <div class="hp-track"><div class="hp-fill enemy-hp" id="ehp" style="width:${ePct}%"></div></div>
      <div class="hp-nums" id="ehpnums">${state.enemyHp}/${state.enemyMax}</div>
    </div>
  </div>
  <div class="log" id="log"></div>
  <div class="actions" id="actions"></div>
</div>`;

      drawSprite(root.querySelector('#pc').getContext('2d'), S_BATTLE_PLAYER, playerColors(player.rank), 4);
      drawSprite(root.querySelector('#ec').getContext('2d'), enemy.map, enemy.colors, 4);

      this._buildActions(root, engine, enemy, state, chapter, render);
    };

    render();
  }

  _buildActions(root, engine, enemy, state, chapter, render) {
    const actions = root.querySelector('#actions');
    const log     = root.querySelector('#log');

    const addLog = (msg, cls = '') => {
      const d = document.createElement('div');
      d.className = 'entry' + (cls ? ' ' + cls : '');
      d.textContent = msg;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    };

    const updateBars = () => {
      const pPct = Math.max(0, state.playerHp / state.playerMax) * 100;
      const ePct = Math.max(0, state.enemyHp  / state.enemyMax)  * 100;
      root.querySelector('#php').style.width  = pPct + '%';
      root.querySelector('#ehp').style.width  = ePct + '%';
      root.querySelector('#ehpnums').textContent = `${state.enemyHp}/${state.enemyMax}`;
    };

    const enemyTurn = () => {
      state.busy = true;
      setTimeout(() => {
        const dodgeChance = 0.08 + (engine.player.agi || 5) * 0.015;
        const dodge = Math.random() < dodgeChance;
        if (dodge) {
          addLog(`${enemy.name} misses!`, 'good');
        } else {
          const rawDmg  = Math.max(1, enemy.atk + Math.floor(Math.random() * 6) - enemy.def);
          const willDef = Math.floor((engine.player.will || 5) / 2);
          const dmg     = Math.max(1, rawDmg - willDef);
          state.playerHp = Math.max(0, state.playerHp - dmg);
          addLog(`${enemy.name} strikes — ${dmg} dmg`, 'bad');
        }
        updateBars();
        state.busy = false;

        if (state.playerHp <= 0) {
          addLog('You collapse...', 'bad');
          setTimeout(() => engine.loseBattle(chapter), 1200);
          return;
        }
        state.turn = 'player';
        setDisabled(false);
      }, 700);
    };

    const setDisabled = dis => {
      actions.querySelectorAll('.act-btn').forEach(b => b.disabled = dis);
    };

    const doAction = (label, dmgFn) => {
      if (state.busy || state.turn !== 'player') return;
      setDisabled(true);
      state.busy = true;

      const result = dmgFn();
      if (result.dodge) {
        addLog(`${enemy.name} dodges!`);
      } else if (result.miss) {
        addLog(`Your ${label} misses!`);
      } else {
        state.enemyHp = Math.max(0, state.enemyHp - result.dmg);
        addLog(`${label} — ${result.dmg} dmg`, 'good');
      }
      updateBars();
      state.busy = false;

      if (state.enemyHp <= 0) {
        addLog(`${enemy.name} is defeated.`, 'good');
        setDisabled(true);
        setTimeout(() => engine.winBattle(chapter), 1200);
        return;
      }

      state.turn = 'enemy';
      enemyTurn();
    };

    const p   = engine.player;
    const ctx = { atkBonus: p.rank * 8 + (p.str || 5) * 2 };
    engine.murim.runHook('onBattleStart', ctx);
    const bonus = ctx.atkBonus;

    actions.innerHTML = '';

    const mkBtn = (label, cls, fn) => {
      const b = document.createElement('button');
      b.className = 'act-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('click', fn);
      actions.appendChild(b);
    };

    mkBtn('[ STRIKE ]', '', () => doAction('Strike', () => {
      const dmg = bonus + 10 + Math.floor(Math.random() * 10) - enemy.def;
      return Math.random() < 0.1 ? { miss: true } : { dmg: Math.max(1, dmg) };
    }));

    p.techniques.forEach(tech => {
      mkBtn(`[ ${tech.toUpperCase()} ]`, 'technique', () => doAction(tech, () => {
        const intBonus = (p.int || 5) * 2;
        const dmg = bonus + 20 + intBonus + Math.floor(Math.random() * 15);
        return Math.random() < 0.05 ? { dodge: true } : { dmg: Math.max(1, dmg) };
      }));
    });

    mkBtn('[ DODGE ]', '', () => {
      if (state.busy || state.turn !== 'player') return;
      addLog('You read the rhythm and step aside.');
      state.turn = 'enemy';
      const orig = enemy.atk;
      enemy.atk = Math.floor(enemy.atk / 2);
      enemyTurn();
      setTimeout(() => { enemy.atk = orig; }, 800);
    });

    mkBtn('[ FLEE ]', '', () => {
      addLog('You retreat from the battle.');
      setTimeout(() => engine.loseBattle(chapter), 800);
    });

    addLog('The battle begins. Choose your action.');
  }
}
