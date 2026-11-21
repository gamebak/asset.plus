import { Engine }      from './engine.js';
import { initP2P }     from './p2p.js';
import { DaoHud }      from './elements/dao-hud.js';
import { DaoWorld }    from './elements/dao_world.js';
import { DaoDialogue } from './elements/dao-dialogue.js';
import { DaoOrigin }   from './elements/dao-origin.js';
import { DaoBattle }   from './elements/dao-battle.js';
import { DaoStatus }   from './elements/dao-status.js';

const engine = new Engine();
window.__engine = engine;

customElements.define('dao-hud',      DaoHud);
customElements.define('dao-world',    DaoWorld);
customElements.define('dao-dialogue', DaoDialogue);
customElements.define('dao-origin',   DaoOrigin);
customElements.define('dao-battle',   DaoBattle);
customElements.define('dao-status',   DaoStatus);

engine.start();
initP2P(engine);
