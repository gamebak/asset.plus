// Built-in traits — registered into Murim at engine startup.
// External code can call engine.murim.registerTrait(def) to add more.

export const BUILT_IN_TRAITS = [

  // ── Origin traits ─────────────────────────────────────────────────────────

  {
    id:   'origin_beggar',
    name: 'Street Orphan',
    description: 'Raised by the Beggar Sect. Hardship became resilience.',
    apply(p) {
      p.maxHp += 15;
      p.hp    += 15;
      p.agi   = (p.agi  || 5) + 3;
      p.will  = (p.will || 5) + 2;
      if (!p.techniques.includes('Borrowed Strike'))
        p.techniques.push('Borrowed Strike');
    },
    remove(p) {
      p.maxHp -= 15;
      p.hp     = Math.min(p.hp, p.maxHp);
      p.agi   -= 3;
      p.will  -= 2;
      p.techniques = p.techniques.filter(t => t !== 'Borrowed Strike');
    },
    hooks: {},
  },

  {
    id:   'origin_disciple',
    name: 'Ruined Disciple',
    description: 'Trained in a sect before Iron Sky erased it. Discipline is memory.',
    apply(p) {
      p.str = (p.str || 5) + 3;
      p.vit = (p.vit || 5) + 2;
    },
    remove(p) {
      p.str -= 3;
      p.vit -= 2;
    },
    hooks: {
      onBattleStart(_p, ctx) { ctx.atkBonus = (ctx.atkBonus || 0) + 10; },
    },
  },

  {
    id:   'origin_merchant',
    name: "Merchant's Shadow",
    description: 'Bastard of a trading clan. Cunning buys more than swords.',
    apply(p) {
      p.maxMana += 30;
      p.mana    += 30;
      p.int = (p.int || 5) + 3;
      p.agi = (p.agi  || 5) + 2;
    },
    remove(p) {
      p.maxMana -= 30;
      p.mana     = Math.min(p.mana, p.maxMana);
      p.int -= 3;
      p.agi -= 2;
    },
    hooks: {},
  },

  // ── Alignment traits ──────────────────────────────────────────────────────

  {
    id:   'align_orthodox',
    name: 'Orthodox Path',
    description: 'Righteous cultivation. Precision over force.',
    apply(p) {
      p.str  = (p.str  || 5) + 2;
      p.will = (p.will || 5) + 2;
    },
    remove(p) {
      p.str  -= 2;
      p.will -= 2;
    },
    hooks: {
      onBattleStart(_p, ctx) { ctx.atkBonus = (ctx.atkBonus || 0) + 5; },
    },
  },

  {
    id:   'align_unorthodox',
    name: 'Unorthodox Path',
    description: 'Forbidden arts. Rules are for cultivators who plan to lose.',
    apply(p) {
      p.agi = (p.agi || 5) + 3;
      p.int = (p.int || 5) + 1;
      if (!p.techniques.includes('Borrowed Strike'))
        p.techniques.push('Borrowed Strike');
    },
    remove(p) {
      p.agi -= 3;
      p.int -= 1;
      p.techniques = p.techniques.filter(t => t !== 'Borrowed Strike');
    },
    hooks: {
      onBattleStart(_p, ctx) { ctx.atkBonus = (ctx.atkBonus || 0) + 8; },
    },
  },

  {
    id:   'align_demonic',
    name: 'Demonic Path',
    description: 'You bargained early. Power answered. The bill is deferred.',
    apply(p) {
      p.str = (p.str || 5) + 4;
    },
    remove(p) {
      p.str -= 4;
    },
    hooks: {
      onBattleStart(_p, ctx) { ctx.atkBonus = (ctx.atkBonus || 0) + 10; },
    },
  },

  {
    id:   'align_neutral',
    name: 'Neutral Path',
    description: 'Neither sect nor demon. The mountain does not hurry.',
    apply(p) {
      p.vit  = (p.vit  || 5) + 2;
      p.will = (p.will || 5) + 2;
    },
    remove(p) {
      p.vit  -= 2;
      p.will -= 2;
    },
    hooks: {},
  },
];
