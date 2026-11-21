export function drawSprite(ctx, map, colors, px, ox = 0, oy = 0) {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const col = colors[map[r][c]];
      if (!col || col === 'transparent') continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + c * px, oy + r * px, px, px);
    }
  }
}

export function makeCanvas(map, colors, px) {
  const el = document.createElement('canvas');
  el.width  = map[0].length * px;
  el.height = map.length * px;
  el.style.imageRendering = 'pixelated';
  drawSprite(el.getContext('2d'), map, colors, px);
  return el;
}

// ── Sprite maps ───────────────────────────────────────────────────

// Player (world view, 5×7) — 0=transparent 1=outline 2=skin 3=robe
export const S_PLAYER = [
  [0,0,1,0,0],
  [0,1,2,1,0],
  [0,1,2,1,0],
  [0,0,1,0,0],
  [1,1,3,1,1],
  [0,0,3,0,0],
  [0,1,0,1,0],
];

// Robe colors per rank (index 3 in player color map)
export const ROBE_COLORS = [
  '#504840', // 0 Mortal
  '#c8c0b8', // 1 Qi Refining
  '#304880', // 2 Foundation
  '#806020', // 3 Core Formation
  '#803010', // 4 Nascent Soul
  '#502878', // 5 Void Return
  '#c040c0', // 6 Immortal Sovereign
];

export function playerColors(rank) {
  return { 0: 'transparent', 1: '#201808', 2: '#d09060', 3: ROBE_COLORS[rank] };
}

// Battle player (7×9) — 0=transparent 1=outline 2=skin 3=robe
export const S_BATTLE_PLAYER = [
  [0,0,1,1,1,0,0],
  [0,1,2,2,2,1,0],
  [0,1,2,1,2,1,0],
  [0,1,2,2,2,1,0],
  [0,0,1,2,1,0,0],
  [0,1,3,3,3,1,0],
  [0,0,3,1,3,0,0],
  [0,0,1,1,1,0,0],
  [0,0,1,0,1,0,0],
];

// Enemies per chapter (7×9) — each uses a unique color palette
// 0=transparent 1=outline 2=skin/base 3=armor/accent 4=secondary 5=highlight

export const ENEMIES = [
  // ch0: Sect Enforcer — grey iron armor
  {
    name: 'Sect Enforcer',
    map: [
      [0,0,1,1,1,0,0],
      [0,1,3,3,3,1,0],
      [0,1,3,1,3,1,0],
      [0,1,3,3,3,1,0],
      [1,3,3,3,3,3,1],
      [0,1,3,1,3,1,0],
      [0,0,1,3,1,0,0],
      [0,0,1,1,1,0,0],
      [0,0,1,0,1,0,0],
    ],
    colors: { 0:'transparent', 1:'#201808', 2:'#908878', 3:'#586070', 4:'#3a4050', 5:'#a0b0c0' },
    hp: 60, atk: 8, def: 2,
  },
  // ch1: Shadow Stalker — dark cloak, daggers
  {
    name: 'Shadow Stalker',
    map: [
      [0,0,1,1,1,0,0],
      [0,1,1,2,1,1,0],
      [0,1,2,1,2,1,0],
      [0,1,2,2,2,1,0],
      [0,1,3,3,3,1,0],
      [1,3,0,3,0,3,1],
      [0,1,3,1,3,1,0],
      [0,1,0,0,0,1,0],
      [0,1,0,0,0,1,0],
    ],
    colors: { 0:'transparent', 1:'#100808', 2:'#a07858', 3:'#201820', 4:'#504050', 5:'#8070a0' },
    hp: 80, atk: 12, def: 1,
  },
  // ch2: Iron Fang Elder — white robes, jade accents
  {
    name: 'Iron Fang Elder',
    map: [
      [0,0,1,1,1,0,0],
      [0,1,2,2,2,1,0],
      [0,1,2,1,2,1,0],
      [0,0,1,2,1,0,0],
      [0,3,3,3,3,3,0],
      [0,1,3,4,3,1,0],
      [0,0,3,1,3,0,0],
      [0,0,1,3,1,0,0],
      [0,0,1,0,1,0,0],
    ],
    colors: { 0:'transparent', 1:'#201808', 2:'#d4b080', 3:'#e0d8c8', 4:'#2a8a50', 5:'#c0a030' },
    hp: 110, atk: 15, def: 4,
  },
  // ch3: Crimson Viper — red sect robes
  {
    name: 'Crimson Viper',
    map: [
      [0,0,1,1,1,0,0],
      [0,1,2,2,2,1,0],
      [0,1,1,2,1,1,0],
      [0,1,2,2,2,1,0],
      [0,3,3,3,3,3,0],
      [3,0,3,4,3,0,3],
      [0,3,0,3,0,3,0],
      [0,0,1,3,1,0,0],
      [0,0,1,0,1,0,0],
    ],
    colors: { 0:'transparent', 1:'#180808', 2:'#c09060', 3:'#801010', 4:'#c82020', 5:'#e04040' },
    hp: 150, atk: 20, def: 3,
  },
  // ch4: Stone Sentinel — ancient golem
  {
    name: 'Stone Sentinel',
    map: [
      [0,1,1,1,1,1,0],
      [1,3,3,3,3,3,1],
      [1,3,4,3,4,3,1],
      [1,3,3,3,3,3,1],
      [1,3,3,3,3,3,1],
      [1,3,1,3,1,3,1],
      [1,3,1,3,1,3,1],
      [0,1,1,0,1,1,0],
      [0,1,0,0,0,1,0],
    ],
    colors: { 0:'transparent', 1:'#201808', 2:'#806848', 3:'#504038', 4:'#c0a870', 5:'#302820' },
    hp: 250, atk: 18, def: 10,
  },
  // ch5: Warlord Chen — heavy golden armor
  {
    name: 'Warlord Chen',
    map: [
      [0,1,1,1,1,1,0],
      [1,4,4,4,4,4,1],
      [1,4,2,4,2,4,1],
      [1,4,4,4,4,4,1],
      [1,3,4,4,4,3,1],
      [1,4,3,4,3,4,1],
      [0,1,4,1,4,1,0],
      [0,1,1,0,1,1,0],
      [0,1,0,0,0,1,0],
    ],
    colors: { 0:'transparent', 1:'#201008', 2:'#d09060', 3:'#a03010', 4:'#c8a030', 5:'#e0c050' },
    hp: 350, atk: 28, def: 8,
  },
  // ch6: Iron Sky Patriarch — dark qi wreathed, imposing
  {
    name: 'Iron Sky Patriarch',
    map: [
      [0,5,1,1,1,5,0],
      [5,1,2,2,2,1,5],
      [5,1,2,5,2,1,5],
      [0,5,2,2,2,5,0],
      [5,3,3,3,3,3,5],
      [5,3,4,3,4,3,5],
      [0,3,3,1,3,3,0],
      [0,5,1,1,1,5,0],
      [0,5,1,0,1,5,0],
    ],
    colors: { 0:'transparent', 1:'#100810', 2:'#c0a080', 3:'#180c28', 4:'#8030c0', 5:'#6020a0' },
    hp: 500, atk: 40, def: 12,
  },
];

// Aura configs per rank (for world rendering)
export const AURAS = [
  null,
  { color: 'rgba(220,220,220,0.18)', radius: 14, blur: 10 },
  { color: 'rgba(60,120,200,0.25)',  radius: 16, blur: 14 },
  { color: 'rgba(200,160,40,0.30)',  radius: 18, blur: 18 },
  { color: 'rgba(220,100,20,0.35)',  radius: 20, blur: 22 },
  { color: 'rgba(160,60,220,0.40)',  radius: 22, blur: 28 },
  null, // rainbow handled separately
];
