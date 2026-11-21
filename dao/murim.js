export class Murim extends EventTarget {
  constructor() {
    super();
    this._traits = new Map(); // id → TraitDef
    this.player  = this._load();
  }

  // ── Trait registry ────────────────────────────────────────────────────────

  registerTrait(def) {
    this._traits.set(def.id, def);
  }

  applyTrait(id) {
    const def = this._traits.get(id);
    if (!def || this.player.traits.includes(id)) return;
    def.apply?.(this.player);
    this.player.traits.push(id);
    this.save();
    this._emit('traitchange', { id, action: 'apply' });
    this._emit('playerchange');
  }

  removeTrait(id) {
    const def = this._traits.get(id);
    if (!def || !this.player.traits.includes(id)) return;
    def.remove?.(this.player);
    this.player.traits = this.player.traits.filter(t => t !== id);
    this.save();
    this._emit('traitchange', { id, action: 'remove' });
    this._emit('playerchange');
  }

  // Run a named hook on every active trait. Extra args forwarded to each hook.
  runHook(hookName, ...args) {
    for (const id of this.player.traits) {
      this._traits.get(id)?.hooks?.[hookName]?.(this.player, ...args);
    }
  }

  // ── Stat mutations ────────────────────────────────────────────────────────

  damage(amount) {
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.save();
    this._emit('playerchange');
  }

  heal(amount) {
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
    this.save();
    this._emit('playerchange');
  }

  spendMana(amount) {
    if (this.player.mana < amount) return false;
    this.player.mana = Math.max(0, this.player.mana - amount);
    this.save();
    this._emit('playerchange');
    return true;
  }

  restoreMana(amount) {
    this.player.mana = Math.min(this.player.maxMana, this.player.mana + amount);
    this.save();
    this._emit('playerchange');
  }

  addCoins(amount) {
    this.player.coins = Math.max(0, this.player.coins + amount);
    this.save();
    this._emit('playerchange');
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  save() {
    localStorage.setItem('dao-save', JSON.stringify(this.player));
  }

  reset() {
    localStorage.removeItem('dao-save');
  }

  _load() {
    try {
      const raw = localStorage.getItem('dao-save');
      if (raw) return { ...this._defaults(), ...JSON.parse(raw) };
    } catch {}
    return this._defaults();
  }

  addXp(amount) {
    this.player.xp = Math.min(this.player.maxXp, this.player.xp + amount);
    this.save();
    this._emit('playerchange');
  }

  _defaults() {
    return {
      id:          crypto.randomUUID(),
      name:        '',
      origin:      '',
      alignment:   '',
      rank:        0,
      chapter:     0,
      hp:          100,
      maxHp:       100,
      mana:        0,
      maxMana:     0,
      coins:       0,
      xp:          0,
      maxXp:       100,
      str:         5,
      agi:         5,
      int:         5,
      vit:         5,
      will:        5,
      techniques:  ['Iron Fist'],
      traits:      [],
      battlesDone: {},
      introsShown: {},
      x:           128,
      y:           320,
    };
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}
