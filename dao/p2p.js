// P2P via Trystero (BitTorrent strategy — no server needed).
// If Trystero is unavailable the game runs fully solo.
// Add Trystero: import { joinRoom } from 'https://cdn.jsdelivr.net/npm/trystero/torrent.js'

const ROOM_ID  = 'dao-v1';
const APP_ID   = 'asset.plus.dao';
const INTERVAL = 2500; // ms between presence broadcasts

export async function initP2P(engine) {
  let joinRoom;

  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/trystero@0.21/torrent.js');
    joinRoom = mod.joinRoom;
  } catch {
    console.info('[dao] P2P unavailable — solo mode');
    return;
  }

  let room;
  try {
    room = joinRoom({ appId: APP_ID }, ROOM_ID);
  } catch {
    console.info('[dao] Could not join P2P room — solo mode');
    return;
  }

  const [sendPresence, onPresence] = room.makeAction('presence');

  onPresence((data, peerId) => {
    engine.updatePeer(peerId, data);
  });

  room.onPeerLeave(peerId => {
    engine.removePeer(peerId);
  });

  // Broadcast our own presence on an interval
  setInterval(() => {
    if (engine.player.name) {
      sendPresence(engine.presenceData());
    }
  }, INTERVAL);

  console.info('[dao] P2P connected — room:', ROOM_ID);
}
