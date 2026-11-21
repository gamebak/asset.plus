# dao — Game Plan

Served at `/dao`. A murim/wuxia cultivation RPG: single linear story, pixel world, P2P shared presence.

---

## Architecture

```
dao/
  index.html        shell
  style.css         host-element layout (positions wu-* elements)
  main.js           registers custom elements, boots Engine + P2P
  engine.js         state machine + player data (EventTarget)
  p2p.js            Trystero wrapper (graceful solo fallback)
  sprites.js        pixel maps + drawSprite / makeCanvas helpers
  story.js          all dialogue (7 chapters × intro/preBattle/postBattle/rankUp/defeat)
  elements/
    wu-world.js     canvas world (tiles, player, peers, title screen)
    wu-hud.js       HP / Qi / rank bar (fixed top)
    wu-dialogue.js  typewriter text box (title entry + all story scenes)
    wu-battle.js    turn-based combat canvas
    wu-status.js    character sheet slide-in (TAB)
```

### State machine

```
TITLE → (name entered) → DIALOGUE(ch0, intro)
                       → WORLD
                       → DIALOGUE(chN, pre_battle) → BATTLE
                                                    → DIALOGUE(chN, post_battle+rankUp) → RANK_UP → WORLD
                                                    → DIALOGUE(chN, defeat) → WORLD
                       → STATUS (TAB toggle)
```

### Element ↔ Engine communication

- Elements call `window.__engine.method()`
- Elements subscribe to engine events in `connectedCallback`, unsubscribe in `disconnectedCallback`
- Key events: `statechange`, `hpchange`, `peerschange`

---

## Cultivation ranks

| # | zh   | en                  | Aura             | maxHP | maxQi |
|---|------|---------------------|------------------|-------|-------|
| 0 | 散人 | Mortal Body         | none             | 100   | 0     |
| 1 | 炼气 | Qi Refining         | white haze       | 160   | 40    |
| 2 | 筑基 | Foundation          | blue             | 260   | 100   |
| 3 | 结丹 | Core Formation      | gold             | 380   | 180   |
| 4 | 元婴 | Nascent Soul        | orange pulse     | 520   | 280   |
| 5 | 返虚 | Void Return         | violet           | 700   | 420   |
| 6 | 仙君 | Immortal Sovereign  | rainbow          | 999   | 999   |

Rank-up happens inside `engine.winBattle(chapter)`. Rank = chapter + 1 (capped at 6).

---

## Story chapters

| Ch | Title                  | Zone | Enemy              | HP  |
|----|------------------------|------|--------------------|-----|
| 0  | The Fallen Sect        | 0    | Sect Enforcer      | 60  |
| 1  | The Old Man's Gift     | 1    | Shadow Stalker     | 80  |
| 2  | The Underworld Market  | 2    | Iron Fang Elder    | 110 |
| 3  | Blood and Iron         | 3    | Crimson Viper      | 150 |
| 4  | The Ancestor's Tomb    | 4    | Stone Sentinel     | 250 |
| 5  | War of Sects           | 5    | Warlord Chen       | 350 |
| 6  | The Peak               | 6    | Iron Sky Patriarch | 500 |

Each chapter: intro → explore zone → walk to boss area → pre-battle dialogue → combat → win/lose.

---

## Factions / Sects

Reference for all major murim powers in the world. Each appears in at least one chapter.

| Sect | Location | Signature | Role in story |
|------|----------|-----------|---------------|
| **Mount Hua Sect** | Mt. Hua (Volcanic mountain) | Plum Blossom Sword — leaves a blossom scent in battle; top-10 power | Ch5 ally — disciples hold the eastern flank in the sect war |
| **Beggar Sect** | Wandering / no fixed home | Information network via beggar connections; cheap clothes, sharp minds; decent fighters | Ch1 — vagrant is a retired Beggar Sect member; Ch2 — contact sells intel on Ren Zhaotian |
| **Demonic Cult** | The Thousand Mountains | Leader = Heavenly Demon; strength is absolute law; practice demonic arts that violate human ethics | Ch6 — Ren Zhaotian admits bargaining with the Thousand Mountains / Heavenly Demon for his power |
| **Namgung Family** | Merchant city circuit | Arrogant merchant clan; primary arms & goods suppliers to major sects | Ch2 — mentioned as Iron Sky Pavilion's weapon suppliers in the Underworld Market |
| **Poison Sect** | Unknown; itinerant | Mastery of poison arts; the sect's champion carries the title **Thousand Poison Lord** | Ch3 — Crimson Viper *is* the Thousand Poison Lord; he carried the massacre order |
| **Wudang Sect** | Wudang Mountains | Sword fighters; all members remain celibate; philosophical, deliberate | Ch5 — present at the sect war but neutral; elders observe from the ridge, withhold disciples |
| **Shaolin Temple** | Shaolin mountain | Buddhist monks, shaved heads; fight unarmed only (no weapons); one of the strongest sects | Ch4 — a lone monk guards the ancestor's tomb entrance; tests the MC before standing aside |

### Notes for future chapters / world decorations
- Mount Hua zone decoration: plum blossom pixel sprites, stone sword pillars
- Beggar Sect NPCs: ragged sprites with bamboo staves, info bubbles
- Shaolin: orange-robed pixel monk sprite; idle animation = meditation pose
- Demonic Cult: purple energy tile effect in The Thousand Mountains (potential future zone 8)
- Namgung Family: merchant stall tiles in the Market zone (ch2/zone 2)

---

## Known bugs to fix

### Critical

**1. Intro dialogue triggers battle immediately** (`wu-dialogue.js:187`)

Current:
```js
e.finishDialogue(chapter, phase === 'intro' ? 'pre_battle' : phase);
```
`finishDialogue(chapter, 'pre_battle')` → `setState('BATTLE')`. Player never gets to explore.

Fix: map `'intro'` → `'intro'` and handle it in `engine.finishDialogue`:
```js
finishDialogue(chapter, phase) {
  if (phase === 'pre_battle') this.setState('BATTLE', { chapter });
  else                        this.setState('WORLD');       // intro, defeat, rank_up
}
```
And in wu-dialogue, the next-click for intro scenes should call:
```js
e.finishDialogue(chapter, 'intro'); // → WORLD
```

### Minor

**2. Rank-up flash uses undefined colour**

`wu-world.js:96` — `_onState({ state, chapter, rank })` — `rank` is never passed in `setState('RANK_UP', { chapter })`.

Fix in `wu-dialogue.js`:
```js
e.setState('RANK_UP', { chapter, rank: e.player.rank });
```

**3. `_darken()` called per tile per frame** (`wu-world.js`)

Memoize results into a `Map<string, string>`.

**4. Zone intro dialogues replay after page refresh**

`_triggeredIntros` lives only in the element instance. Store triggered intros in `engine.player` (already persisted to localStorage).

---

## Phase 2 — Completeness

- [ ] **Victory screen** — after ch6 postBattle dialogue, show a special fullscreen canvas with scrolling credits / final rank display before returning to (read-only) world
- [ ] **New game / reset** — button in wu-status to clear localStorage and restart
- [ ] **Zone transition fade** — brief black fade when player crosses zone boundary
- [ ] **World decorations** — static pixel sprites (trees, ruins, stalls, tombstones) rendered per zone at fixed tile positions
- [ ] **NPC markers** — named landmarks (sect ruins, market gate, tomb entrance) as pixel signs
- [ ] **Battle animations** — shake effect on hit; brief sprite flash on damage
- [ ] **Defeat → retry** — after defeat dialogue, offer "Try Again" (reset HP, stay at zone start)

---

## Phase 3 — P2P features

P2P library: **Trystero** (BitTorrent strategy, CDN ESM, zero server)
```js
import { joinRoom } from 'https://cdn.jsdelivr.net/npm/trystero@0.21/torrent.js';
```

Current: peers broadcast `{ id, name, rank, chapter, x, y }` every 2.5 s. Rendered as small sprites on world canvas.

Planned additions:
- [ ] **Emotes** — press E to emit a pixel animation (wave / bow / qi burst) visible to nearby peers
- [ ] **Peer list panel** — small overlay showing online cultivators, their rank, zone
- [ ] **Duel request** — press F near a peer to send a duel request → both enter a shared battle sequence
- [ ] **Technique share** — high-rank players can "inscribe" a technique that low-rank players can pick up from a world tile

---

## Phase 4 — Sound

Web Audio API only (no external library):
- [ ] Background drone per zone (oscillator + filter, shifts with rank)
- [ ] Combat hit SFX (short noise burst)
- [ ] Rank-up chime (ascending tone sequence)
- [ ] Typewriter tick for dialogue
- [ ] Master mute toggle in wu-status

---

## Phase 5 — Mobile

- [ ] Virtual D-pad overlay (fixed bottom-left, touch events → same key flags as keyboard)
- [ ] Action button (fixed bottom-right) for interact / next dialogue
- [ ] Pinch-to-zoom for world canvas (clamp 0.75×–1.5×)

---

## Controls (current)

| Key | Action |
|-----|--------|
| WASD / ↑↓←→ | Move |
| TAB | Open/close status panel |
| Enter (name field) | Confirm name |

---

## Save format (localStorage key: `dao-save`)

```json
{
  "id": "uuid",
  "name": "string",
  "rank": 0,
  "chapter": 0,
  "hp": 100,
  "maxHp": 100,
  "qi": 0,
  "maxQi": 0,
  "techniques": ["Iron Fist"],
  "battlesDone": {},
  "x": 128,
  "y": 320
}
```

---

## Dev

```bash
npm run dev   # http://localhost:9000/dao
```

To reset save: `localStorage.removeItem('dao-save')` in browser console, then refresh.
