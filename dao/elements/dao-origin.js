const ORIGINS = [
  {
    id: 'beggar',
    title: 'Street Orphan',
    subtitle: 'Beggar Sect lineage',
    lines: [
      'No family. No name.',
      'Found in a gutter and raised by the Beggar Sect.',
      'Weakness taught you to read people.',
      'That knowledge cuts deeper than a blade.',
    ],
    trait: 'Resourceful',
    bonus: '+15 max HP · AGI+3 · WILL+2 · Borrowed Strike',
  },
  {
    id: 'disciple',
    title: 'Ruined Disciple',
    subtitle: 'Fallen orthodox sect',
    lines: [
      'You trained under a sect master',
      'before Iron Sky erased everything.',
      'Stance, breath, discipline —',
      'drilled until it became instinct.',
    ],
    trait: 'Disciplined',
    bonus: '+10 battle attack · STR+3 · VIT+2',
  },
  {
    id: 'merchant',
    title: "Merchant's Shadow",
    subtitle: 'Bastard of a trading clan',
    lines: [
      'Born to a merchant clan. Unacknowledged.',
      'Raised in comfort, then discarded.',
      'Money and secrets are the same thing.',
      'You know how to spend both.',
    ],
    trait: 'Cunning',
    bonus: '+30 max Mana · INT+3 · AGI+2',
  },
];

// faction color palettes: [border, bg, hover-border, hover-bg, selected-bg]
const ALIGN_COLORS = {
  orthodox:   ['#2a6090', '#080e18', '#80d0ff', '#0a1828', '#0c2038'],
  unorthodox: ['#8b1020', '#100608', '#c41830', '#180a0a', '#200c0c'],
  demonic:    ['#224488', '#060c18', '#4488ff', '#0a1430', '#0c1c40'],
  neutral:    ['#3a5070', '#080c14', '#80a8d0', '#0c1420', '#101828'],
};

const ALIGNMENTS = [
  {
    id: 'orthodox',
    title: 'Orthodox',
    subtitle: 'The righteous path',
    lines: [
      'Strike with principle.',
      'Never dishonour the sword.',
      'The great sects will not call you enemy.',
    ],
    bonus: '+5 attack · STR+2 · WILL+2',
  },
  {
    id: 'unorthodox',
    title: 'Unorthodox',
    subtitle: 'The crooked path',
    lines: [
      'Rules exist for lesser cultivators.',
      'You fight dirty, fast, effective.',
      'The Borrowed Strike is your opening move.',
    ],
    bonus: 'Borrowed Strike · +8 attack · AGI+3 · INT+1',
  },
  {
    id: 'demonic',
    title: 'Demonic',
    subtitle: 'The hungry path',
    lines: [
      'You bargained early. Power answered.',
      "It costs something —",
      "but you haven't found the bill yet.",
    ],
    bonus: '+10 attack · STR+4',
  },
  {
    id: 'neutral',
    title: 'Neutral',
    subtitle: 'The still path',
    lines: [
      'Neither sect nor demon. Only the dao.',
      'Stillness is a weapon most forget to forge.',
      'The mountain does not hurry. Yet it stands.',
    ],
    bonus: 'VIT+2 · WILL+2 · flat damage reduction',
  },
];

const CSS = `
:host { display: block; }
.screen {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  background: #080c18;
  padding: 32px 20px 24px;
  overflow-y: auto;
  font-family: 'Space Mono', monospace;
  box-sizing: border-box;
}
.heading {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #f0b830;
  letter-spacing: 3px;
  margin-bottom: 6px;
  text-align: center;
}
.sub-heading {
  font-size: 10px; color: #3a5878;
  margin-bottom: 28px;
  text-align: center;
}
.cards {
  display: flex; gap: 20px;
  flex-wrap: wrap; justify-content: center;
  max-width: 1100px;
}
.card {
  width: 260px;
  border: 1px solid #1e3050;
  padding: 20px 18px 18px;
  cursor: pointer;
  background: #0c1428;
  transition: border-color 0.12s, background 0.12s;
  display: flex; flex-direction: column; gap: 10px;
}
.card:hover { border-color: #4488ff; background: #0e1c38; }
.card.selected { border-color: #4488ff; background: #102040; }
.card-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #d8eaf8;
  line-height: 1.7;
}
.card-subtitle { font-size: 10px; color: #3a5878; }
.card-lines {
  font-size: 11px; color: #6888b8;
  line-height: 1.9;
  flex: 1;
}
.trait-icon {
  width: 52px; height: 52px;
  border: 1px solid #30d4b0;
  align-self: flex-start;
}
.card-bonus {
  font-size: 9px; color: #f0b830;
  border-top: 1px solid #1e3050;
  padding-top: 10px;
  line-height: 1.7;
}
.confirm-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 10px 24px;
  background: #4488ff;
  border: none;
  color: #080c18;
  cursor: pointer;
  margin-top: 28px;
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s;
}
.confirm-btn.visible { opacity: 1; pointer-events: all; }
.confirm-btn:hover { background: #66aaff; }
`;

export class DaoOrigin extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="root"></div>`;
    this.style.display = 'none';

    const e = window.__engine;
    const handler = ev => this._onState(ev.detail, e);
    e.addEventListener('statechange', handler);
    this._cleanup = () => e.removeEventListener('statechange', handler);

    if (e.state === 'ORIGIN') {
      this.style.display = 'block';
      this._showOrigin(e);
    }
  }

  disconnectedCallback() { this._cleanup?.(); }

  _root() { return this.shadowRoot.querySelector('#root'); }

  _onState({ state }, e) {
    if (state === 'ORIGIN') {
      this.style.display = 'block';
      this._showOrigin(e);
    } else {
      this.style.display = 'none';
    }
  }

  _showOrigin(e) {
    const root = this._root();
    root.innerHTML = `
<div class="screen">
  <div class="heading">YOUR ORIGIN</div>
  <div class="sub-heading">Where did your path begin?</div>
  <div class="cards" id="cards"></div>
  <button class="confirm-btn" id="confirm">NEXT ›</button>
</div>`;

    let selected = null;
    const cardsEl = root.querySelector('#cards');
    const confirmBtn = root.querySelector('#confirm');

    ORIGINS.forEach(origin => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div class="card-title">${origin.title}</div>
        <div class="card-subtitle">${origin.subtitle}</div>
        <div class="card-lines">${origin.lines.join('<br>')}</div>
        <div class="trait-icon"></div>
        <div class="card-bonus">${origin.bonus}</div>
      `;
      el.addEventListener('click', () => {
        cardsEl.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        selected = origin;
        confirmBtn.classList.add('visible');
      });
      cardsEl.appendChild(el);
    });

    confirmBtn.addEventListener('click', () => {
      if (!selected) return;
      this._showAlignment(selected, e);
    });
  }

  _showAlignment(origin, e) {
    const root = this._root();
    root.innerHTML = `
<div class="screen">
  <div class="heading">YOUR PATH</div>
  <div class="sub-heading">Which way does your cultivation lean?</div>
  <div class="cards" id="cards"></div>
  <button class="confirm-btn" id="confirm">BEGIN ›</button>
</div>`;

    let selected = null;
    const cardsEl = root.querySelector('#cards');
    const confirmBtn = root.querySelector('#confirm');

    ALIGNMENTS.forEach(alignment => {
      const c = ALIGN_COLORS[alignment.id];
      const el = document.createElement('div');
      el.className = 'card';
      el.style.cssText = `border-color:${c[0]};background:${c[1]};width:260px;padding:20px 18px 18px;`;
      el.innerHTML = `
        <div class="card-title">${alignment.title}</div>
        <div class="card-subtitle">${alignment.subtitle}</div>
        <div class="card-lines">${alignment.lines.join('<br>')}</div>
        <div class="card-bonus" style="border-top-color:${c[0]};color:${c[2]}">${alignment.bonus}</div>
      `;
      el.addEventListener('mouseenter', () => {
        if (!el.classList.contains('selected')) {
          el.style.borderColor = c[2];
          el.style.background  = c[3];
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!el.classList.contains('selected')) {
          el.style.borderColor = c[0];
          el.style.background  = c[1];
        }
      });
      el.addEventListener('click', () => {
        cardsEl.querySelectorAll('.card').forEach((card, i) => {
          const ac = ALIGN_COLORS[ALIGNMENTS[i].id];
          card.classList.remove('selected');
          card.style.borderColor = ac[0];
          card.style.background  = ac[1];
        });
        el.classList.add('selected');
        el.style.borderColor = c[2];
        el.style.background  = c[4];
        selected = alignment;
        confirmBtn.classList.add('visible');
      });
      cardsEl.appendChild(el);
    });

    confirmBtn.addEventListener('click', () => {
      if (!selected) return;
      e.setOrigin(origin.id, selected.id);
    });
  }
}
