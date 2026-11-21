import { Murim }            from './murim.js';
import { BUILT_IN_TRAITS }  from './traits.js';

export const RANKS = [
  { id: 0, en: 'Mortal Body',         aura: null,                       maxHp: 100, maxMana: 0   },
  { id: 1, en: 'Body Refining',       aura: 'rgba(180,100,40,0.20)',    maxHp: 130, maxMana: 0   },
  { id: 2, en: 'Qi Refining',         aura: 'rgba(220,220,220,0.18)',   maxHp: 160, maxMana: 40  },
  { id: 3, en: 'Foundation',          aura: 'rgba(60,120,200,0.25)',    maxHp: 260, maxMana: 100 },
  { id: 4, en: 'Core Formation',      aura: 'rgba(200,160,40,0.30)',    maxHp: 380, maxMana: 180 },
  { id: 5, en: 'Nascent Soul',        aura: 'rgba(220,100,20,0.35)',    maxHp: 520, maxMana: 280 },
  { id: 6, en: 'Void Return',         aura: 'rgba(160,60,220,0.40)',    maxHp: 700, maxMana: 420 },
  { id: 7, en: 'Immortal Sovereign',  aura: 'rainbow',                  maxHp: 999, maxMana: 999 },
];

const TECHNIQUES = [
  'Iron Fist',
  'Iron Body',
  'Formless Qi Strike',
  'Jade Barrier',
  'Crimson Seal',
  "Ancestor's Wrath",
  'Void Slash',
  'Immortal Decree',
];

export class Engine extends EventTarget {
  constructor() {
    super();
    this.murim = new Murim();
    this.state = 'TITLE';
    this.peers = new Map();
    this._peerTimer = null;

    BUILT_IN_TRAITS.forEach(t => this.murim.registerTrait(t));
  }

  // Convenience passthrough — all components use engine.player
  get player() { return this.murim.player; }
  get rank()   { return RANKS[this.player.rank]; }

  // ── State machine ─────────────────────────────────────────────────────────

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  setState(state, data = {}) {
    this.state = state;
    this._emit('statechange', { state, ...data });
  }

  start() {
    if (!this.player.name) {
      this.setState('TITLE');
    } else {
      this.setState('WORLD');
    }
    this._peerTimer = setInterval(() => this._cleanPeers(), 8000);
  }

  // ── Player setup ──────────────────────────────────────────────────────────

  setName(name) {
    this.player.name = (name || '').trim() || 'Nameless';
    this.murim.save();
    this.setState('ORIGIN');
  }

  setOrigin(originId, alignmentId) {
    this.player.origin    = originId;
    this.player.alignment = alignmentId;
    this.murim.applyTrait(`origin_${originId}`);
    this.murim.applyTrait(`align_${alignmentId}`);
    this.murim.save();
    this.setState('DIALOGUE', { chapter: 0, phase: 'intro' });
  }

  // ── Story progression ─────────────────────────────────────────────────────

  finishDialogue(chapter, phase) {
    if (phase === 'pre_battle') {
      this.setState('BATTLE', { chapter });
    } else {
      if (phase === 'intro') {
        this.player.introsShown          = this.player.introsShown || {};
        this.player.introsShown[chapter] = true;
        this.murim.save();
      }
      this.setState('WORLD');
    }
  }

  winBattle(chapter) {
    this.player.battlesDone[chapter] = true;
    const nextRank = Math.min(chapter + 1, 7);
    const rd = RANKS[nextRank];

    this.player.rank    = nextRank;
    this.player.maxHp   = rd.maxHp;
    this.player.hp      = rd.maxHp;
    this.player.maxMana = rd.maxMana;
    this.player.mana    = rd.maxMana;
    this.player.chapter = Math.min(chapter + 1, 7);

    // XP reward: reset bar, scale max up for next rank
    this.player.xp    = 0;
    this.player.maxXp = (nextRank + 1) * 100;

    const tech = TECHNIQUES[nextRank];
    if (tech && !this.player.techniques.includes(tech))
      this.player.techniques.push(tech);

    this.murim.runHook('onBattleWin');
    this.murim.save();
    this.setState('DIALOGUE', { chapter, phase: 'post_battle' });
  }

  loseBattle(chapter) {
    this.player.hp = Math.max(1, Math.floor(this.player.maxHp * 0.25));
    this.murim.save();
    this.setState('DIALOGUE', { chapter, phase: 'defeat' });
  }

  // ── Stat passthrough ──────────────────────────────────────────────────────

  save()           { this.murim.save(); }
  damage(n)        { this.murim.damage(n); }
  heal(n)          { this.murim.heal(n); }
  addCoins(n)      { this.murim.addCoins(n); }
  restoreMana(n)   { this.murim.restoreMana(n); }
  addXp(n)         { this.murim.addXp(n); }

  // ── P2P peers ─────────────────────────────────────────────────────────────

  updatePeer(id, data) {
    this.peers.set(id, { ...data, lastSeen: Date.now() });
    this._emit('peerschange');
  }

  removePeer(id) {
    this.peers.delete(id);
    this._emit('peerschange');
  }

  _cleanPeers() {
    const cutoff = Date.now() - 12000;
    for (const [id, peer] of this.peers)
      if (peer.lastSeen < cutoff) this.peers.delete(id);
    if (this.peers.size) this._emit('peerschange');
  }

  presenceData() {
    const p = this.player;
    return { id: p.id, name: p.name, rank: p.rank, chapter: p.chapter, x: p.x, y: p.y };
  }
}
