import { CHAPTERS } from '../story.js';

const CSS = `
:host { display: block; }
.box {
  background: rgba(8,12,24,0.97);
  border-top: 2px solid #1e3050;
  padding: 20px 28px 16px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Space Mono', monospace;
}
.chapter-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #f0b830;
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.speaker {
  font-size: 10px;
  color: #80c8ff;
  font-weight: 700;
  min-height: 14px;
}
.text {
  font-size: 12px;
  color: #d8eaf8;
  line-height: 1.9;
  min-height: 44px;
  white-space: pre-wrap;
}
.footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
.progress { font-size: 9px; color: #3a5878; }
.next-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 7px 14px;
  background: transparent;
  border: 1px solid #1e3050;
  color: #d8eaf8;
  cursor: pointer;
  transition: all 0.1s;
  pointer-events: all;
}
.next-btn:hover { background: #1e3050; color: #4488ff; border-color: #4488ff; }

/* Choices */
.choices {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 4px;
}
.choice-btn {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #1e3050;
  color: #d8eaf8;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
  pointer-events: all;
}
.choice-btn:hover { background: #0e2040; border-color: #4488ff; color: #4488ff; }
.choice-btn::before { content: '› '; color: #3a5878; }

/* Name entry */
.name-form { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.name-label { font-size: 10px; color: #6888b8; }
.name-input {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  background: #080e18;
  border: 1px solid #1e3050;
  border-bottom-color: #4488ff;
  color: #d8eaf8;
  padding: 6px 10px;
  width: 240px;
  outline: none;
}
.name-input:focus { border-color: #4488ff; }
.name-submit {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 8px 16px;
  background: #4488ff;
  border: none;
  color: #080c18;
  cursor: pointer;
  pointer-events: all;
}
.name-submit:hover { background: #66aaff; }
`;

export class DaoDialogue extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="root"></div>`;
    this.style.display = 'none';

    const e = window.__engine;
    const handler = ev => this._onState(ev.detail, e);
    e.addEventListener('statechange', handler);
    this._cleanup = () => e.removeEventListener('statechange', handler);

    if (e.state === 'TITLE') this._showTitle(e);
  }

  disconnectedCallback() { this._cleanup?.(); }

  _root() { return this.shadowRoot.getElementById('root'); }

  _onState({ state, chapter, phase }, e) {
    if (state === 'TITLE') {
      this.style.display = 'block';
      this._showTitle(e);
    } else if (state === 'DIALOGUE') {
      this.style.display = 'block';
      this._showDialogue(chapter, phase, e);
    } else {
      this.style.display = 'none';
    }
  }

  _showTitle(e) {
    const root = this._root();
    root.innerHTML = `
<div class="box">
  <div class="chapter-title">DAO — A CULTIVATOR'S PATH</div>
  <div class="speaker">Begin your journey</div>
  <div class="name-form">
    <span class="name-label">Enter your name, cultivator:</span>
    <input class="name-input" id="name-in" maxlength="16" placeholder="Nameless" autofocus>
    <button class="name-submit" id="name-ok">BEGIN ›</button>
  </div>
</div>`;
    const input = root.querySelector('#name-in');
    const ok    = root.querySelector('#name-ok');
    const submit = () => e.setName(input.value);
    ok.addEventListener('click', submit);
    input.addEventListener('keydown', ev => { if (ev.key === 'Enter') submit(); });
    setTimeout(() => input?.focus(), 60);
  }

  _showDialogue(chapter, phase, e) {
    const ch = CHAPTERS[chapter];
    let scenes = [];

    if      (phase === 'intro')        scenes = ch.intro      || [];
    else if (phase === 'pre_battle')   scenes = ch.preBattle  || [];
    else if (phase === 'post_battle')  scenes = [...(ch.postBattle || []), ...(ch.rankUp || [])];
    else if (phase === 'defeat')       scenes = ch.defeat     || [];

    const pages = [];
    for (const scene of scenes) {
      const lines = scene.lines || [];
      for (let i = 0; i < lines.length; i++) {
        const page = { speaker: scene.speaker || null, text: lines[i] };
        if (i === lines.length - 1 && scene.choices) page.choices = scene.choices;
        pages.push(page);
      }
    }

    if (!pages.length) { e.finishDialogue(chapter, phase); return; }

    this._runPages(pages, chapter, phase, ch.title, e);
  }

  _runPages(pages, chapter, phase, title, e) {
    let idx = 0;

    const advance = () => {
      idx++;
      if (idx < pages.length) {
        render();
      } else {
        if (phase === 'post_battle') {
          e.setState('RANK_UP', { chapter, rank: e.player.rank });
        } else {
          e.finishDialogue(chapter, phase);
        }
      }
    };

    const render = () => {
      const page = pages[idx];
      const root = this._root();

      root.innerHTML = `
<div class="box">
  <div class="chapter-title">Ch.${chapter + 1} — ${title.toUpperCase()}</div>
  <div class="speaker">${page.speaker || ''}</div>
  <div class="text" id="txt"></div>
  <div class="footer" id="footer">
    <span class="progress">${idx + 1} / ${pages.length}</span>
  </div>
</div>`;

      const footer = root.querySelector('#footer');

      this._typewrite(root.querySelector('#txt'), page.text, () => {
        if (page.choices) {
          this._renderChoices(footer, page.choices, advance);
        } else {
          const btn = document.createElement('button');
          btn.className   = 'next-btn';
          btn.textContent = idx < pages.length - 1 ? 'NEXT ›' : 'CONTINUE ›';
          btn.addEventListener('click', advance);
          footer.appendChild(btn);
        }
      });
    };

    render();
  }

  _renderChoices(footer, choices, onChosen) {
    const wrap = document.createElement('div');
    wrap.className = 'choices';

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        wrap.remove();
        const resp   = choice.response;
        const respEl = document.createElement('div');
        respEl.style.cssText = 'margin-top:8px;border-top:1px solid #0e2040;padding-top:8px;';

        if (resp.speaker) {
          const spkEl = document.createElement('div');
          spkEl.className   = 'speaker';
          spkEl.textContent = resp.speaker;
          respEl.appendChild(spkEl);
        }

        const txtEl = document.createElement('div');
        txtEl.className = 'text';
        footer.parentElement.appendChild(respEl);
        respEl.appendChild(txtEl);

        this._typewrite(txtEl, resp.lines.join('\n'), () => {
          const cont = document.createElement('button');
          cont.className   = 'next-btn';
          cont.textContent = 'CONTINUE ›';
          cont.style.cssText = 'margin-top:8px;display:block;';
          cont.addEventListener('click', onChosen);
          footer.parentElement.appendChild(cont);
        });
      });
      wrap.appendChild(btn);
    });

    footer.appendChild(wrap);
  }

  _typewrite(el, text, onDone) {
    el.textContent = '';
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, 18);
      } else {
        onDone();
      }
    };
    tick();
  }
}
