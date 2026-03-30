import Phaser from 'phaser';
import { SCALED_TILE, SCALE } from '../config';
import { GameIntelligence } from './GameIntelligence';

// ── Waypoints — locations NPCs can walk to ──────────────────────

interface Waypoint {
  name: string;
  x: number; // tile X
  y: number; // tile Y
  type: 'social' | 'dance' | 'drink' | 'chill' | 'hotTub';
}

const WAYPOINTS: Waypoint[] = [
  { name: 'living_couch', x: 5, y: 5, type: 'social' },
  { name: 'living_center', x: 8, y: 4, type: 'dance' },
  { name: 'jp_room', x: 17, y: 5, type: 'chill' },
  { name: 'kitchen_counter', x: 28, y: 3, type: 'drink' },
  { name: 'kitchen_fridge', x: 25, y: 5, type: 'drink' },
  { name: 'hot_tub', x: 37, y: 4, type: 'hotTub' },
  { name: 'nolan_bed', x: 27, y: 14, type: 'chill' },
  { name: 'nolan_setup', x: 30, y: 13, type: 'chill' },
  { name: 'yard_left', x: 8, y: 18, type: 'social' },
  { name: 'yard_dj', x: 14, y: 18, type: 'dance' },
  { name: 'yard_right', x: 22, y: 18, type: 'social' },
  { name: 'yard_smoke', x: 10, y: 19, type: 'chill' },
  { name: 'patio', x: 34, y: 18, type: 'social' },
];

// ── NPC States ──────────────────────────────────────────────────

type PartyState = 'idle' | 'dancing' | 'wandering' | 'drinking' | 'talking' | 'passed_out';

// ── NPC Personality ─────────────────────────────────────────────

interface PartyNPCConfig {
  id: string;
  sprite: string;
  drinkRate: number;       // 0-1, how fast they drink (1=chug)
  passOutThreshold: number; // drinks before passing out
  danceBias: number;       // 0-1, how likely to dance vs other activities
  talkBias: number;        // 0-1, how likely to start convos
  isGirl: boolean;
  lines: string[];         // random speech bubble lines
}

// ── Speech bubble lines by personality type ─────────────────────

const DUDE_LINES = [
  'YEAHHH!', 'This song SLAPS', 'Bro pass the aux', 'Who brought the henny?',
  'CHUG CHUG CHUG', 'Where\'s the bathroom??', 'I love everyone here',
  'Nolan is the GOAT', 'Run it BACK!', 'We going crazy tonight',
  'This is the move fr', 'Someone put on Travis', 'AYOOO',
];

const GIRL_LINES = [
  'Omg this song!', 'Where\'s the bathroom?', 'Take a pic of me',
  'He\'s cute', 'I\'m so drunk lol', 'This party is insane',
  'Let\'s go to the hot tub!', 'Who invited all these people',
  'Someone hold my drink', 'I love this song!!', 'Wait play that back',
];

const BART_LINES = [
  'EVERYBODY SHOTS!!', 'I\'M NOT EVEN DRUNK YET', 'WHO WANTS TO ARM WRESTLE',
  'BRO WATCH THIS', 'NOLAN! MORE HENNY!', 'THIS IS MY HOUSE NOW',
  '*belch*', 'RUN IT BACK!', 'WHERE\'S THE FOOD AT',
  'I HAVEN\'T EATEN ALL DAY', 'BRO I\'M FINE I SWEAR',
];

const COOPER_LINES = [
  'Bro I\'m good', 'Just one more...', 'I need water', 'Where\'s the couch',
  'I\'m sitting down', 'This is a lot', 'How long have we been here',
];

const NOLAN_LINES = [
  'Everyone having fun?', 'There\'s more in the kitchen', 'Don\'t break anything',
  'Mi casa es su casa', 'JP get over here!', 'Who needs a drink?',
  'This is gonna be legendary', 'Bart calm down bro',
];

const TERRELL_LINES = [
  'Vibes are right', 'Pass it', 'Who rolled this', 'I\'m chilling',
  'This beat is crazy', 'Y\'all wilding', 'I\'m good right here',
];

// ── NPC configs ─────────────────────────────────────────────────

const NPC_CONFIGS: PartyNPCConfig[] = [
  { id: 'bart', sprite: 'npc_bigbart', drinkRate: 0.8, passOutThreshold: 8, danceBias: 0.3, talkBias: 0.7, isGirl: false, lines: BART_LINES },
  { id: 'cooper', sprite: 'npc_cooper', drinkRate: 0.3, passOutThreshold: 4, danceBias: 0.2, talkBias: 0.4, isGirl: false, lines: COOPER_LINES },
  { id: 'nolan', sprite: 'npc_nolan', drinkRate: 0.4, passOutThreshold: 7, danceBias: 0.5, talkBias: 0.8, isGirl: false, lines: NOLAN_LINES },
  { id: 'terrell', sprite: 'npc_terrell', drinkRate: 0.2, passOutThreshold: 10, danceBias: 0.6, talkBias: 0.3, isGirl: false, lines: TERRELL_LINES },
  { id: 'girl1', sprite: 'npc_bikini1', drinkRate: 0.3, passOutThreshold: 5, danceBias: 0.7, talkBias: 0.6, isGirl: true, lines: GIRL_LINES },
  { id: 'girl2', sprite: 'npc_bikini2', drinkRate: 0.4, passOutThreshold: 5, danceBias: 0.7, talkBias: 0.6, isGirl: true, lines: GIRL_LINES },
  { id: 'girl3', sprite: 'npc_bikini1', drinkRate: 0.3, passOutThreshold: 6, danceBias: 0.6, talkBias: 0.5, isGirl: true, lines: GIRL_LINES },
  { id: 'dude1', sprite: 'npc_generic', drinkRate: 0.5, passOutThreshold: 6, danceBias: 0.4, talkBias: 0.5, isGirl: false, lines: DUDE_LINES },
  { id: 'dude2', sprite: 'npc_generic', drinkRate: 0.6, passOutThreshold: 5, danceBias: 0.5, talkBias: 0.4, isGirl: false, lines: DUDE_LINES },
  { id: 'dude3', sprite: 'npc_generic', drinkRate: 0.4, passOutThreshold: 7, danceBias: 0.3, talkBias: 0.5, isGirl: false, lines: DUDE_LINES },
];

// ── Event timeline ──────────────────────────────────────────────

interface PartyEvent {
  time: number;   // ms from party start
  action: 'shout' | 'move' | 'passout';
  npcId: string;
  text?: string;
  waypoint?: string;
}

const PARTY_EVENTS: PartyEvent[] = [
  { time: 10000, action: 'shout', npcId: 'bart', text: 'EVERYBODY SHOTS!!' },
  { time: 25000, action: 'shout', npcId: 'nolan', text: 'TURN IT UP!!' },
  { time: 45000, action: 'move', npcId: 'cooper', waypoint: 'living_couch' },
  { time: 60000, action: 'shout', npcId: 'bart', text: 'WHO WANTS TO ARM WRESTLE' },
  { time: 80000, action: 'passout', npcId: 'cooper' },
  { time: 80000, action: 'shout', npcId: 'nolan', text: 'Cooper\'s DOWN! Get him water!' },
  { time: 100000, action: 'shout', npcId: 'girl1', text: 'Hot tub time!!' },
  { time: 100000, action: 'move', npcId: 'girl1', waypoint: 'hot_tub' },
  { time: 100000, action: 'move', npcId: 'girl2', waypoint: 'hot_tub' },
  { time: 130000, action: 'shout', npcId: 'bart', text: 'I\'M NOT EVEN DRUNK YET' },
  { time: 160000, action: 'shout', npcId: 'terrell', text: 'Bart you need to sit down bro' },
  { time: 180000, action: 'passout', npcId: 'bart' },
  { time: 180000, action: 'shout', npcId: 'nolan', text: 'BART\'S DOWN!! I KNEW IT!' },
];

// ── Runtime NPC state ───────────────────────────────────────────

interface PartyNPC {
  config: PartyNPCConfig;
  sprite: Phaser.GameObjects.Sprite;
  state: PartyState;
  stateTimer: number;        // ms remaining in current state
  targetWaypoint: Waypoint | null;
  drinksHad: number;
  currentBubble: Phaser.GameObjects.Text | null;
  bubbleTimer: number;       // ms remaining for bubble display
  bubbleCooldown: number;    // ms before this NPC can talk again
  tileX: number;
  tileY: number;
  moveProgress: number;      // 0-1 for interpolating walk between tiles
  moveStartX: number;        // pixel start for current tile move
  moveStartY: number;
  moveTargetX: number;       // pixel target for current tile move
  moveTargetY: number;
  waitTimer: number;         // ms to wait when blocked by another NPC
  danceTween: Phaser.Tweens.Tween | null;
  zzzText: Phaser.GameObjects.Text | null;
  zzzTimer: number;          // ms counter for ZZZ respawn
  unpopular: boolean;        // flagged by intelligence — wanders toward player
}

// ── Helpers ─────────────────────────────────────────────────────

function tileToPx(tile: number): number {
  return tile * SCALED_TILE + SCALED_TILE / 2;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function waypointsByType(type: Waypoint['type']): Waypoint[] {
  return WAYPOINTS.filter(w => w.type === type);
}

// ── Door-aware routing ──────────────────────────────────────────
// Zone checks: inside the house (rows 0-9) vs outside (rows 10+)
const isInside = (y: number) => y <= 9;
const DOORS_ROW9 = [6, 18, 29];   // exits from house to yard
const DOORS_ROW5 = [12, 23, 34];  // between rooms inside house

function nearestDoor(doorCols: number[], fromX: number): number {
  let best = doorCols[0];
  let bestDist = Math.abs(fromX - best);
  for (const col of doorCols) {
    const dist = Math.abs(fromX - col);
    if (dist < bestDist) {
      best = col;
      bestDist = dist;
    }
  }
  return best;
}

/** Returns the next tile {x, y} an NPC should move to, routing through doors when crossing zones. */
function getNextMoveToward(fromX: number, fromY: number, toX: number, toY: number): { x: number; y: number } {
  const fromIn = isInside(fromY);
  const toIn = isInside(toY);

  if (fromIn !== toIn) {
    // Crossing inside <-> outside: route through nearest row-9 door
    const doorCol = nearestDoor(DOORS_ROW9, fromX);
    if (fromX !== doorCol) {
      // Step 1: move toward the door column on current row
      return { x: fromX + (doorCol > fromX ? 1 : -1), y: fromY };
    }
    // Step 2: cross through the door row
    if (fromIn) {
      // Inside → outside: move down through row 9
      return { x: fromX, y: fromY + 1 };
    } else {
      // Outside → inside: move up through row 9
      return { x: fromX, y: fromY - 1 };
    }
  }

  // Same zone: check if we need to cross between rooms (rows 1-8, different "columns" separated by walls at row 5)
  if (fromIn && toIn && fromY <= 8 && toY <= 8) {
    // If there's a large horizontal gap, might need a row-5 door
    // Simple heuristic: if X distance > 8, route through nearest row-5 door
    const xDist = Math.abs(toX - fromX);
    if (xDist > 8) {
      const doorCol = nearestDoor(DOORS_ROW5, fromX);
      // Route through door row 5 if not already there
      if (fromY !== 5) {
        return { x: fromX, y: fromY + (5 > fromY ? 1 : -1) };
      }
      if (fromX !== doorCol) {
        return { x: fromX + (doorCol > fromX ? 1 : -1), y: fromY };
      }
    }
  }

  // Default: move toward target directly (larger axis first)
  const dx = toX - fromX;
  const dy = toY - fromY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: fromX + (dx > 0 ? 1 : -1), y: fromY };
  } else {
    return { x: fromX, y: fromY + (dy > 0 ? 1 : -1) };
  }
}

// ── Bubble font config ──────────────────────────────────────────

const BUBBLE_FONT = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '8px',
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 3,
  wordWrap: { width: 160 },
};

const ZZZ_FONT = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '10px',
  color: '#aaaaff',
  stroke: '#000000',
  strokeThickness: 2,
};

// ── Random Event Configs ────────────────────────────────────────

interface RandomEventConfig {
  id: string;
  chance: number;      // 0-1 probability when rolled
  minTime: number;     // earliest ms from party start this can fire
  maxTime: number;     // latest ms it can fire
  handler: () => void; // executed when triggered
}

// ── Main Party AI System ────────────────────────────────────────

export class PartyAI {
  private static scene: Phaser.Scene | null = null;
  private static playerSprite: Phaser.GameObjects.Sprite | null = null;
  private static npcs: PartyNPC[] = [];
  private static active: boolean = false;
  private static elapsedTime: number = 0;
  private static nextEventIndex: number = 0;

  // Random events system
  private static randomEventsFired: Set<string> = new Set();
  private static randomEventsRollTimer: number = 0;
  private static randomEventActive: boolean = false; // lock to prevent overlap
  private static maxRandomEvents: number = 3; // max random events per party

  // Tile occupancy: key = "x,y" → which npcId owns it
  private static occupiedTiles: Map<string, string> = new Map();

  private static tileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private static claimTile(npc: PartyNPC, newX: number, newY: number): void {
    // Release old tile
    const oldKey = PartyAI.tileKey(npc.tileX, npc.tileY);
    if (PartyAI.occupiedTiles.get(oldKey) === npc.config.id) {
      PartyAI.occupiedTiles.delete(oldKey);
    }
    // Claim new tile
    PartyAI.occupiedTiles.set(PartyAI.tileKey(newX, newY), npc.config.id);
  }

  private static isTileOccupied(x: number, y: number, excludeId: string): boolean {
    const owner = PartyAI.occupiedTiles.get(PartyAI.tileKey(x, y));
    return owner !== undefined && owner !== excludeId;
  }

  // ── Init ────────────────────────────────────────────────────

  static init(scene: Phaser.Scene, playerSprite?: Phaser.GameObjects.Sprite): Phaser.GameObjects.Sprite[] {
    PartyAI.scene = scene;
    PartyAI.playerSprite = playerSprite ?? null;
    PartyAI.npcs = [];
    PartyAI.active = true;
    PartyAI.elapsedTime = 0;
    PartyAI.nextEventIndex = 0;
    PartyAI.occupiedTiles = new Map();
    PartyAI.randomEventsFired = new Set();
    PartyAI.randomEventsRollTimer = 0;
    PartyAI.randomEventActive = false;

    const sprites: Phaser.GameObjects.Sprite[] = [];

    // Shuffle waypoints for initial placement so NPCs spread out
    const shuffledWaypoints = [...WAYPOINTS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < NPC_CONFIGS.length; i++) {
      const config = NPC_CONFIGS[i];
      const wp = shuffledWaypoints[i % shuffledWaypoints.length];

      const px = tileToPx(wp.x);
      const py = tileToPx(wp.y);

      const sprite = scene.add.sprite(px, py, config.sprite, 0)
        .setScale(SCALE)
        .setDepth(9);

      const npc: PartyNPC = {
        config,
        sprite,
        state: 'idle',
        stateTimer: randomRange(1000, 4000), // random first idle duration
        targetWaypoint: null,
        drinksHad: 0,
        currentBubble: null,
        bubbleTimer: 0,
        bubbleCooldown: randomRange(4000, 10000), // stagger initial speech
        tileX: wp.x,
        tileY: wp.y,
        moveProgress: 0,
        moveStartX: px,
        moveStartY: py,
        moveTargetX: px,
        moveTargetY: py,
        waitTimer: 0,
        danceTween: null,
        zzzText: null,
        zzzTimer: 0,
        unpopular: false,
      };

      PartyAI.occupiedTiles.set(PartyAI.tileKey(wp.x, wp.y), config.id);

      PartyAI.npcs.push(npc);
      sprites.push(sprite);
    }

    // Apply intelligence-driven adjustments from aggregate player data
    PartyAI.applyIntelligence();

    return sprites;
  }

  // ── Intelligence-driven NPC adjustment ─────────────────────

  private static applyIntelligence(): void {
    const agg = GameIntelligence.getAggregate();
    const popularity = agg.npcPopularity;

    // Loose match: check if signal key contains the PartyAI id or vice versa
    // e.g. 'ch1_bigbart' contains 'bart', 'ch1_cooper' contains 'cooper'
    const getTalkCount = (npcId: string): number => {
      let total = 0;
      for (const [key, count] of Object.entries(popularity)) {
        if (key.includes(npcId) || npcId.includes(key)) {
          total += count;
        }
      }
      return total;
    };

    // Build scored list
    const scored = PartyAI.npcs.map(npc => ({
      npc,
      talks: getTalkCount(npc.config.id),
    }));

    // Sort descending by talks to find top and bottom
    const sorted = [...scored].sort((a, b) => b.talks - a.talks);

    // Top 3 popular NPCs: boost talkBias
    const top3 = sorted.slice(0, 3).filter(s => s.talks > 0);
    for (const { npc } of top3) {
      npc.config.talkBias = Math.min(1, npc.config.talkBias + 0.2);
    }

    // Bottom 3 or those with 0 talks: flag as unpopular
    const bottom3 = sorted.slice(-3);
    const zeroTalks = scored.filter(s => s.talks === 0);
    const unpopularSet = new Set([
      ...bottom3.map(s => s.npc.config.id),
      ...zeroTalks.map(s => s.npc.config.id),
    ]);

    // Don't flag NPCs that are also in top 3
    for (const { npc } of top3) {
      unpopularSet.delete(npc.config.id);
    }

    for (const npc of PartyAI.npcs) {
      npc.unpopular = unpopularSet.has(npc.config.id);
    }
  }

  // ── Update (called every frame) ─────────────────────────────

  static update(delta: number): void {
    if (!PartyAI.active || !PartyAI.scene) return;

    PartyAI.elapsedTime += delta;

    // Process scripted events
    PartyAI.processEvents();

    // Process random events (roll every 30s after 20s warmup)
    PartyAI.processRandomEvents(delta);

    // Update each NPC
    for (const npc of PartyAI.npcs) {
      // Update bubble timers and cooldown
      PartyAI.updateBubble(npc, delta);
      if (npc.bubbleCooldown > 0) npc.bubbleCooldown -= delta;

      // Skip updates for passed out NPCs
      if (npc.state === 'passed_out') {
        PartyAI.updatePassedOut(npc, delta);
        continue;
      }

      // Blocked waiting for a tile to free up
      if (npc.waitTimer > 0) {
        npc.waitTimer -= delta;
        if (npc.waitTimer <= 0) {
          // Retry movement
          PartyAI.startNextTileMove(npc);
        }
        continue;
      }

      npc.stateTimer -= delta;

      if (npc.state === 'wandering') {
        PartyAI.updateWandering(npc, delta);
      }

      // When state timer expires, transition
      if (npc.stateTimer <= 0) {
        PartyAI.transitionState(npc);
      }
    }
  }

  // ── Event timeline processing ───────────────────────────────

  private static processEvents(): void {
    while (
      PartyAI.nextEventIndex < PARTY_EVENTS.length &&
      PartyAI.elapsedTime >= PARTY_EVENTS[PartyAI.nextEventIndex].time
    ) {
      const event = PARTY_EVENTS[PartyAI.nextEventIndex];
      const npc = PartyAI.npcs.find(n => n.config.id === event.npcId);

      if (npc && npc.state !== 'passed_out') {
        switch (event.action) {
          case 'shout':
            if (event.text) {
              PartyAI.showBubble(npc, event.text);
            }
            break;
          case 'move': {
            const wp = WAYPOINTS.find(w => w.name === event.waypoint);
            if (wp) {
              PartyAI.startWandering(npc, wp);
            }
            break;
          }
          case 'passout':
            PartyAI.enterPassedOut(npc);
            break;
        }
      }

      PartyAI.nextEventIndex++;
    }
  }

  // ── Random events processing ─────────────────────────────────

  private static getRandomEvents(): RandomEventConfig[] {
    return [
      {
        id: 'cops_pull_up',
        chance: 0.15,
        minTime: 20000,
        maxTime: 150000,
        handler: () => PartyAI.randomEvent_CopsPullUp(),
      },
      {
        id: 'fight_breaks_out',
        chance: 0.15,
        minTime: 30000,
        maxTime: 160000,
        handler: () => PartyAI.randomEvent_FightBreaksOut(),
      },
      {
        id: 'cannonball',
        chance: 0.20,
        minTime: 40000,
        maxTime: 140000,
        handler: () => PartyAI.randomEvent_Cannonball(),
      },
      {
        id: 'bart_breaks_tv',
        chance: 0.20,
        minTime: 50000,
        maxTime: 150000,
        handler: () => PartyAI.randomEvent_BartBreaksTV(),
      },
      {
        id: 'dj_banger',
        chance: 0.20,
        minTime: 25000,
        maxTime: 130000,
        handler: () => PartyAI.randomEvent_DJBanger(),
      },
      {
        id: 'ex_shows_up',
        chance: 0.10,
        minTime: 60000,
        maxTime: 160000,
        handler: () => PartyAI.randomEvent_ExShowsUp(),
      },
    ];
  }

  private static processRandomEvents(delta: number): void {
    if (!PartyAI.scene || PartyAI.randomEventActive) return;
    if (PartyAI.randomEventsFired.size >= PartyAI.maxRandomEvents) return;
    if (PartyAI.elapsedTime < 20000) return; // 20s warmup

    PartyAI.randomEventsRollTimer += delta;
    if (PartyAI.randomEventsRollTimer < 30000) return; // roll every 30s
    PartyAI.randomEventsRollTimer = 0;

    const events = PartyAI.getRandomEvents();
    // Shuffle so we don't always check in same order
    const shuffled = events.sort(() => Math.random() - 0.5);

    for (const evt of shuffled) {
      if (PartyAI.randomEventsFired.has(evt.id)) continue;
      if (PartyAI.elapsedTime < evt.minTime || PartyAI.elapsedTime > evt.maxTime) continue;
      if (Math.random() > evt.chance) continue;

      // Fire this event
      PartyAI.randomEventsFired.add(evt.id);
      PartyAI.randomEventActive = true;
      evt.handler();
      break; // only one event per roll
    }
  }

  // ── Random Event: Cops Pull Up ──────────────────────────────

  private static randomEvent_CopsPullUp(): void {
    const scene = PartyAI.scene!;

    // Create red and blue flashing rectangles on screen edges
    const cam = scene.cameras.main;
    const redBar = scene.add.rectangle(
      cam.scrollX, cam.scrollY + cam.height / 2,
      40, cam.height, 0xff0000
    ).setAlpha(0).setDepth(400).setScrollFactor(0).setOrigin(0, 0.5);

    const blueBar = scene.add.rectangle(
      cam.scrollX + cam.width - 40, cam.scrollY + cam.height / 2,
      40, cam.height, 0x0044ff
    ).setAlpha(0).setDepth(400).setScrollFactor(0).setOrigin(0, 0.5);

    // Position relative to camera viewport
    redBar.setPosition(0, cam.height / 2);
    blueBar.setPosition(cam.width - 40, cam.height / 2);

    // Flash alternating lights
    let flashCount = 0;
    const flashTimer = scene.time.addEvent({
      delay: 150,
      repeat: 19, // 3 seconds of flashing
      callback: () => {
        flashCount++;
        const isEven = flashCount % 2 === 0;
        redBar.setAlpha(isEven ? 0.6 : 0);
        blueBar.setAlpha(isEven ? 0 : 0.6);
      },
    });

    // Someone yells COPS
    const randomNPC = pick(PartyAI.npcs.filter(n => n.state !== 'passed_out'));
    if (randomNPC) {
      PartyAI.showBubble(randomNPC, 'COPS!!');
    }

    // Freeze all NPCs for 3 seconds
    const savedStates: { npc: PartyNPC; state: PartyState; timer: number }[] = [];
    for (const npc of PartyAI.npcs) {
      if (npc.state !== 'passed_out') {
        savedStates.push({ npc, state: npc.state, timer: npc.stateTimer });
        PartyAI.stopDanceTween(npc);
        npc.state = 'idle';
        npc.stateTimer = 5000; // hold idle long enough
        npc.targetWaypoint = null;
      }
    }

    // After 3 seconds: false alarm
    scene.time.delayedCall(3000, () => {
      flashTimer.destroy();
      redBar.destroy();
      blueBar.destroy();

      // Show false alarm text
      const nolan = PartyAI.npcs.find(n => n.config.id === 'nolan');
      if (nolan && nolan.state !== 'passed_out') {
        PartyAI.showBubble(nolan, 'It\'s just campus security driving by.');
      }

      // Restore NPC states
      for (const saved of savedStates) {
        if (saved.npc.state !== 'passed_out') {
          saved.npc.state = saved.state;
          saved.npc.stateTimer = saved.timer;
        }
      }

      // After another 2 seconds someone reacts
      scene.time.delayedCall(2000, () => {
        const reactor = pick(PartyAI.npcs.filter(n => n.state !== 'passed_out'));
        if (reactor) {
          PartyAI.showBubble(reactor, 'BRO I ALMOST RAN 💀');
        }
        PartyAI.randomEventActive = false;
      });
    });
  }

  // ── Random Event: Fight Breaks Out ──────────────────────────

  private static randomEvent_FightBreaksOut(): void {
    const scene = PartyAI.scene!;

    // Pick two random non-passed-out NPCs
    const available = PartyAI.npcs.filter(n => n.state !== 'passed_out' && !n.config.isGirl);
    if (available.length < 2) {
      PartyAI.randomEventActive = false;
      return;
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const fighter1 = shuffled[0];
    const fighter2 = shuffled[1];

    // Fighters face each other
    PartyAI.stopDanceTween(fighter1);
    PartyAI.stopDanceTween(fighter2);
    fighter1.state = 'idle';
    fighter1.stateTimer = 10000;
    fighter1.targetWaypoint = null;
    fighter2.state = 'idle';
    fighter2.stateTimer = 10000;
    fighter2.targetWaypoint = null;

    // First exchange
    PartyAI.showBubble(fighter1, 'WHAT DID YOU SAY?!');

    scene.time.delayedCall(1500, () => {
      PartyAI.showBubble(fighter2, 'BRO CHILL');
    });

    // Crowd gathers — nearby NPCs react
    scene.time.delayedCall(2500, () => {
      const bystanders = PartyAI.npcs.filter(
        n => n !== fighter1 && n !== fighter2 && n.state !== 'passed_out'
      );
      const reacting = bystanders.slice(0, 3);
      for (const b of reacting) {
        PartyAI.showBubble(b, pick(['OH SHIT', 'WORLDSTAR!!', 'NO WAY', 'YOOO']));
      }
    });

    // Camera shake
    scene.time.delayedCall(2000, () => {
      scene.cameras.main.shake(2000, 0.01);
    });

    // Someone breaks it up
    scene.time.delayedCall(5000, () => {
      const nolan = PartyAI.npcs.find(n => n.config.id === 'nolan');
      const breaker = nolan && nolan.state !== 'passed_out'
        ? nolan
        : pick(PartyAI.npcs.filter(n => n !== fighter1 && n !== fighter2 && n.state !== 'passed_out'));

      if (breaker) {
        PartyAI.showBubble(breaker, 'AYO CHILL CHILL');
      }

      // Fighters scatter to random waypoints
      scene.time.delayedCall(1500, () => {
        PartyAI.startWandering(fighter1, pick(WAYPOINTS));
        PartyAI.startWandering(fighter2, pick(WAYPOINTS));
        PartyAI.randomEventActive = false;
      });
    });
  }

  // ── Random Event: Cannonball ────────────────────────────────

  private static randomEvent_Cannonball(): void {
    const scene = PartyAI.scene!;

    // Pick a random NPC to do the cannonball
    const available = PartyAI.npcs.filter(n => n.state !== 'passed_out');
    if (available.length === 0) {
      PartyAI.randomEventActive = false;
      return;
    }

    const jumper = pick(available);
    const hotTubWP = WAYPOINTS.find(w => w.name === 'hot_tub')!;

    // Walk toward the hot tub
    PartyAI.startWandering(jumper, hotTubWP);
    PartyAI.showBubble(jumper, 'CANNONBALL!!!');

    // After arrival (estimate ~4s), do the splash
    scene.time.delayedCall(4000, () => {
      // Big text
      const cannonText = scene.add.text(
        tileToPx(hotTubWP.x), tileToPx(hotTubWP.y) - 50,
        'CANNONBALL!!!',
        { ...BUBBLE_FONT, fontSize: '12px', color: '#00ccff' }
      ).setOrigin(0.5).setDepth(25);

      scene.tweens.add({
        targets: cannonText,
        y: cannonText.y - 40,
        alpha: 0,
        duration: 2000,
        onComplete: () => cannonText.destroy(),
      });

      // Splash effect: 10 blue circles that expand and fade
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const splashX = tileToPx(hotTubWP.x) + Math.cos(angle) * 5;
        const splashY = tileToPx(hotTubWP.y) + Math.sin(angle) * 5;

        const circle = scene.add.circle(splashX, splashY, 3, 0x00aaff, 0.7)
          .setDepth(22);

        scene.tweens.add({
          targets: circle,
          radius: randomRange(20, 40),
          alpha: 0,
          x: splashX + Math.cos(angle) * randomRange(20, 50),
          y: splashY + Math.sin(angle) * randomRange(20, 50),
          duration: randomRange(800, 1500),
          ease: 'Sine.easeOut',
          onComplete: () => circle.destroy(),
        });
      }

      // Camera shake for impact
      scene.cameras.main.shake(500, 0.005);

      // Nearby NPCs react
      scene.time.delayedCall(800, () => {
        const nearHotTub = PartyAI.npcs.filter(
          n => n !== jumper && n.state !== 'passed_out' &&
          Math.abs(n.tileX - hotTubWP.x) <= 5 && Math.abs(n.tileY - hotTubWP.y) <= 5
        );
        for (const n of nearHotTub.slice(0, 3)) {
          PartyAI.showBubble(n, pick([
            'BRO YOU SPLASHED MY PHONE',
            'MY PHONE!!',
            'DUDE WTF',
            'YOU GOT MY SHIRT WET',
          ]));
        }

        scene.time.delayedCall(2000, () => {
          PartyAI.randomEventActive = false;
        });
      });
    });
  }

  // ── Random Event: Bart Breaks TV ────────────────────────────

  private static randomEvent_BartBreaksTV(): void {
    const scene = PartyAI.scene!;

    const bart = PartyAI.npcs.find(n => n.config.id === 'bart');
    const nolan = PartyAI.npcs.find(n => n.config.id === 'nolan');

    // If Bart is passed out, skip
    if (!bart || bart.state === 'passed_out') {
      PartyAI.randomEventActive = false;
      return;
    }

    // Someone yells BART NO
    const bystander = pick(PartyAI.npcs.filter(n => n !== bart && n.state !== 'passed_out'));
    if (bystander) {
      PartyAI.showBubble(bystander, 'BART NO');
    }

    // Crash — camera shake after 1 second
    scene.time.delayedCall(1000, () => {
      scene.cameras.main.shake(1500, 0.015);

      // Crash text
      const crashText = scene.add.text(
        bart.sprite.x, bart.sprite.y - 50,
        '*CRASH*',
        { ...BUBBLE_FONT, fontSize: '14px', color: '#ff4444' }
      ).setOrigin(0.5).setDepth(25);

      scene.tweens.add({
        targets: crashText,
        y: crashText.y - 30,
        alpha: 0,
        duration: 1500,
        onComplete: () => crashText.destroy(),
      });
    });

    scene.time.delayedCall(2500, () => {
      const reactor = pick(PartyAI.npcs.filter(n => n !== bart && n !== nolan && n.state !== 'passed_out'));
      if (reactor) {
        PartyAI.showBubble(reactor, '...was that the TV?');
      }
    });

    scene.time.delayedCall(4000, () => {
      if (nolan && nolan.state !== 'passed_out') {
        PartyAI.showBubble(nolan, 'THAT WAS A $2000 TV BART');
      }
    });

    scene.time.delayedCall(6000, () => {
      PartyAI.showBubble(bart, 'my bad...');

      scene.time.delayedCall(2000, () => {
        PartyAI.randomEventActive = false;
      });
    });
  }

  // ── Random Event: DJ Drops a Banger ─────────────────────────

  private static randomEvent_DJBanger(): void {
    const scene = PartyAI.scene!;

    // Screen tint: purple overlay that pulses
    const overlay = scene.add.rectangle(
      0, 0,
      scene.cameras.main.width, scene.cameras.main.height,
      0x8040a0, 0
    ).setOrigin(0, 0).setDepth(400).setScrollFactor(0);

    // Pulse the tint
    let pulseCount = 0;
    const pulseTween = scene.tweens.add({
      targets: overlay,
      alpha: 0.08,
      duration: 400,
      yoyo: true,
      repeat: 12, // ~10 seconds of pulsing
      ease: 'Sine.easeInOut',
      onRepeat: () => { pulseCount++; },
      onComplete: () => {
        overlay.destroy();
      },
    });

    // All non-passed-out NPCs start dancing
    const dancers: PartyNPC[] = [];
    for (const npc of PartyAI.npcs) {
      if (npc.state !== 'passed_out') {
        PartyAI.stopDanceTween(npc);
        npc.targetWaypoint = null;
        PartyAI.enterDancing(npc);
        dancers.push(npc);
      }
    }

    // Multiple NPCs yell
    const shouters = dancers.sort(() => Math.random() - 0.5).slice(0, 4);
    const shouts = ['THIS IS MY SONG!!', 'YOOO THIS SONG', 'TURN IT UP!!', 'OH SHIT THIS SLAPS'];
    for (let i = 0; i < shouters.length; i++) {
      scene.time.delayedCall(i * 800, () => {
        if (shouters[i].state !== 'passed_out') {
          PartyAI.showBubble(shouters[i], shouts[i % shouts.length]);
        }
      });
    }

    // After 10 seconds, unlock
    scene.time.delayedCall(10000, () => {
      if (!pulseTween.isDestroyed()) {
        pulseTween.stop();
      }
      overlay.destroy();
      PartyAI.randomEventActive = false;
    });
  }

  // ── Random Event: Ex Shows Up ───────────────────────────────

  private static randomEvent_ExShowsUp(): void {
    const scene = PartyAI.scene!;

    // Spawn a girl NPC near the entrance (bottom-left yard area)
    const entranceX = 3;
    const entranceY = 18;
    const exSprite = scene.add.sprite(
      tileToPx(entranceX), tileToPx(entranceY),
      'npc_bikini2', 0
    ).setScale(SCALE).setDepth(9);

    // Someone notices
    const noticer = pick(PartyAI.npcs.filter(n => n.state !== 'passed_out'));
    if (noticer) {
      PartyAI.showBubble(noticer, 'Is that... oh no.');
    }

    // JP's internal monologue (show as bubble on player sprite)
    scene.time.delayedCall(2000, () => {
      if (PartyAI.playerSprite && PartyAI.scene) {
        const mindBubble = scene.add.text(
          PartyAI.playerSprite.x, PartyAI.playerSprite.y - 50,
          'This is bad.',
          { ...BUBBLE_FONT, color: '#ffaaaa' }
        ).setOrigin(0.5, 1).setDepth(25);

        scene.tweens.add({
          targets: mindBubble,
          alpha: 0,
          delay: 2500,
          duration: 500,
          onComplete: () => mindBubble.destroy(),
        });
      }
    });

    // Girl walks toward player area briefly
    scene.tweens.add({
      targets: exSprite,
      x: tileToPx(entranceX + 6),
      duration: 3000,
      ease: 'Linear',
    });

    // Someone tells her to leave
    scene.time.delayedCall(5000, () => {
      const bouncer = PartyAI.npcs.find(n => n.config.id === 'terrell' && n.state !== 'passed_out')
        ?? pick(PartyAI.npcs.filter(n => n.state !== 'passed_out'));
      if (bouncer) {
        PartyAI.showBubble(bouncer, 'Nah you gotta go.');
      }
    });

    // Girl leaves
    scene.time.delayedCall(7000, () => {
      scene.tweens.add({
        targets: exSprite,
        x: tileToPx(-3),
        alpha: 0,
        duration: 3000,
        ease: 'Linear',
        onComplete: () => {
          exSprite.destroy();
        },
      });

      // Aftermath
      scene.time.delayedCall(2000, () => {
        const commenter = pick(PartyAI.npcs.filter(n => n.state !== 'passed_out'));
        if (commenter) {
          PartyAI.showBubble(commenter, 'That was awkward...');
        }

        scene.time.delayedCall(2000, () => {
          PartyAI.randomEventActive = false;
        });
      });
    });
  }

  // ── State transitions ───────────────────────────────────────

  private static transitionState(npc: PartyNPC): void {
    // Stop any active dance tween
    PartyAI.stopDanceTween(npc);

    // Check if drunk enough to pass out
    if (npc.drinksHad >= npc.config.passOutThreshold) {
      PartyAI.enterPassedOut(npc);
      return;
    }

    // RNG to pick next state based on personality
    const roll = Math.random();
    let cumulative = 0;

    // Dance bias
    cumulative += npc.config.danceBias * 0.4;
    if (roll < cumulative) {
      PartyAI.enterDancing(npc);
      return;
    }

    // Talk bias
    cumulative += npc.config.talkBias * 0.3;
    if (roll < cumulative) {
      PartyAI.enterTalking(npc);
      return;
    }

    // Drink chance (scaled by drinkRate)
    cumulative += npc.config.drinkRate * 0.2;
    if (roll < cumulative) {
      PartyAI.enterDrinking(npc);
      return;
    }

    // Unpopular NPC: 20% chance to wander toward the player instead
    if (npc.unpopular && PartyAI.playerSprite && Math.random() < 0.2) {
      PartyAI.enterWanderingTowardPlayer(npc);
      return;
    }

    // Default: wander to a random waypoint
    PartyAI.enterWanderingRandom(npc);
  }

  // ── Enter States ────────────────────────────────────────────

  private static enterDancing(npc: PartyNPC): void {
    npc.state = 'dancing';
    npc.stateTimer = randomRange(5000, 15000);

    // If not near a dance waypoint, wander to one first
    const danceWaypoints = waypointsByType('dance');
    const nearDance = danceWaypoints.some(
      w => Math.abs(w.x - npc.tileX) <= 3 && Math.abs(w.y - npc.tileY) <= 3
    );

    if (!nearDance && danceWaypoints.length > 0) {
      // Walk to a dance area first, then we'll dance when we arrive
      PartyAI.startWandering(npc, pick(danceWaypoints));
      return;
    }

    // Start dance tween: sway x +-3px and angle +-3 degrees
    if (PartyAI.scene) {
      npc.danceTween = PartyAI.scene.tweens.add({
        targets: npc.sprite,
        x: npc.sprite.x + 3,
        angle: 3,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onYoyo: () => {
          // Sway to the other side
          if (npc.danceTween && npc.state === 'dancing') {
            npc.sprite.x = npc.sprite.x - 3;
            npc.sprite.angle = -3;
          }
        },
      });
    }

    // Occasionally show a line while dancing (only if not on cooldown)
    if (Math.random() < 0.25 && npc.bubbleCooldown <= 0) {
      PartyAI.showBubble(npc, pick(npc.config.lines));
      npc.bubbleCooldown = randomRange(10000, 20000);
    }
  }

  private static enterTalking(npc: PartyNPC): void {
    npc.state = 'talking';
    npc.stateTimer = randomRange(3000, 6000);

    // Only say something if cooldown cleared
    if (npc.bubbleCooldown <= 0) {
      PartyAI.showBubble(npc, pick(npc.config.lines));
      npc.bubbleCooldown = randomRange(8000, 18000); // 8-18s before next line
    }

    // Check if another NPC is nearby — if so, make them respond
    const nearby = PartyAI.npcs.find(
      other =>
        other !== npc &&
        other.state !== 'passed_out' &&
        Math.abs(other.tileX - npc.tileX) <= 4 &&
        Math.abs(other.tileY - npc.tileY) <= 4
    );

    if (nearby && Math.random() < 0.5) {
      // Delayed response from nearby NPC
      if (PartyAI.scene) {
        PartyAI.scene.time.delayedCall(randomRange(1000, 2000), () => {
          if (nearby.state !== 'passed_out' && PartyAI.active) {
            PartyAI.showBubble(nearby, pick(nearby.config.lines));
          }
        });
      }
    }
  }

  private static enterDrinking(npc: PartyNPC): void {
    npc.state = 'drinking';
    npc.stateTimer = randomRange(3000, 5000);

    // If not near a drink waypoint, wander to one
    const drinkWaypoints = waypointsByType('drink');
    const nearDrink = drinkWaypoints.some(
      w => Math.abs(w.x - npc.tileX) <= 3 && Math.abs(w.y - npc.tileY) <= 3
    );

    if (!nearDrink && drinkWaypoints.length > 0) {
      PartyAI.startWandering(npc, pick(drinkWaypoints));
      return;
    }

    // Increment drinks
    npc.drinksHad++;

    // Chance to say something while drinking (only if not on cooldown)
    if (Math.random() < 0.2 && npc.bubbleCooldown <= 0) {
      PartyAI.showBubble(npc, pick(npc.config.lines));
      npc.bubbleCooldown = randomRange(8000, 16000);
    }
  }

  private static enterWanderingRandom(npc: PartyNPC): void {
    const wp = pick(WAYPOINTS);
    PartyAI.startWandering(npc, wp);
  }

  private static enterWanderingTowardPlayer(npc: PartyNPC): void {
    if (!PartyAI.playerSprite) {
      PartyAI.enterWanderingRandom(npc);
      return;
    }

    // Find the waypoint closest to the player's current position
    const playerTileX = Math.round((PartyAI.playerSprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((PartyAI.playerSprite.y - SCALED_TILE / 2) / SCALED_TILE);

    let bestWp = WAYPOINTS[0];
    let bestDist = Infinity;
    for (const wp of WAYPOINTS) {
      const dist = Math.abs(wp.x - playerTileX) + Math.abs(wp.y - playerTileY);
      if (dist < bestDist) {
        bestDist = dist;
        bestWp = wp;
      }
    }

    PartyAI.startWandering(npc, bestWp);
  }

  private static startWandering(npc: PartyNPC, waypoint: Waypoint): void {
    // Stop any dance tween
    PartyAI.stopDanceTween(npc);

    npc.state = 'wandering';
    npc.targetWaypoint = waypoint;

    // Calculate how long it takes to walk there (1 tile per 400ms)
    const dx = Math.abs(waypoint.x - npc.tileX);
    const dy = Math.abs(waypoint.y - npc.tileY);
    const totalTiles = dx + dy;

    // stateTimer = total walk time + small buffer
    npc.stateTimer = totalTiles * 400 + 200;

    // Start the first tile move
    PartyAI.startNextTileMove(npc);
  }

  private static startNextTileMove(npc: PartyNPC): void {
    if (!npc.targetWaypoint) return;

    const dx = npc.targetWaypoint.x - npc.tileX;
    const dy = npc.targetWaypoint.y - npc.tileY;

    // Already at target
    if (dx === 0 && dy === 0) {
      npc.state = 'idle';
      npc.stateTimer = randomRange(1000, 3000);
      npc.targetWaypoint = null;
      npc.moveProgress = 0;
      return;
    }

    // Use door-aware routing to get preferred next tile
    const preferred = getNextMoveToward(npc.tileX, npc.tileY, npc.targetWaypoint.x, npc.targetWaypoint.y);

    // Try preferred tile, then perpendicular alternatives, then wait
    const candidates: { x: number; y: number }[] = [preferred];

    // Add perpendicular step as fallback
    if (preferred.x !== npc.tileX) {
      // Preferred is horizontal — add vertical alternatives
      candidates.push({ x: npc.tileX, y: npc.tileY + 1 });
      candidates.push({ x: npc.tileX, y: npc.tileY - 1 });
    } else {
      // Preferred is vertical — add horizontal alternatives
      candidates.push({ x: npc.tileX + 1, y: npc.tileY });
      candidates.push({ x: npc.tileX - 1, y: npc.tileY });
    }

    let chosen: { x: number; y: number } | null = null;
    for (const c of candidates) {
      if (!PartyAI.isTileOccupied(c.x, c.y, npc.config.id)) {
        chosen = c;
        break;
      }
    }

    if (!chosen) {
      // All candidate tiles are blocked — wait 150-300ms then retry
      npc.waitTimer = randomRange(150, 300);
      return;
    }

    const nextTileX = chosen.x;
    const nextTileY = chosen.y;

    // Claim the new tile, release old
    PartyAI.claimTile(npc, nextTileX, nextTileY);

    npc.moveStartX = npc.sprite.x;
    npc.moveStartY = npc.sprite.y;
    npc.moveTargetX = tileToPx(nextTileX);
    npc.moveTargetY = tileToPx(nextTileY);
    npc.moveProgress = 0;

    // Flip sprite based on horizontal direction
    if (nextTileX > npc.tileX) {
      npc.sprite.setFlipX(false);
    } else if (nextTileX < npc.tileX) {
      npc.sprite.setFlipX(true);
    }

    npc.tileX = nextTileX;
    npc.tileY = nextTileY;
  }

  // ── Update wandering (lerp between tiles) ───────────────────

  private static updateWandering(npc: PartyNPC, delta: number): void {
    if (!npc.targetWaypoint) {
      npc.state = 'idle';
      npc.stateTimer = randomRange(1000, 3000);
      return;
    }

    // 400ms per tile
    const moveSpeed = delta / 400;
    npc.moveProgress += moveSpeed;

    if (npc.moveProgress >= 1) {
      // Snap to target tile
      npc.sprite.x = npc.moveTargetX;
      npc.sprite.y = npc.moveTargetY;
      npc.moveProgress = 0;

      // Check if arrived at final target
      if (npc.tileX === npc.targetWaypoint.x && npc.tileY === npc.targetWaypoint.y) {
        npc.state = 'idle';
        npc.stateTimer = randomRange(1000, 3000);
        npc.targetWaypoint = null;
        return;
      }

      // Start next tile move
      PartyAI.startNextTileMove(npc);
    } else {
      // Lerp sprite position
      npc.sprite.x = npc.moveStartX + (npc.moveTargetX - npc.moveStartX) * npc.moveProgress;
      npc.sprite.y = npc.moveStartY + (npc.moveTargetY - npc.moveStartY) * npc.moveProgress;
    }
  }

  // ── Passed out state ────────────────────────────────────────

  private static enterPassedOut(npc: PartyNPC): void {
    // Stop any dance tween
    PartyAI.stopDanceTween(npc);

    npc.state = 'passed_out';
    npc.stateTimer = Infinity; // stays until party ends
    npc.targetWaypoint = null;

    // Lie flat
    npc.sprite.setAngle(90);

    // Start ZZZ cycle
    npc.zzzTimer = 0;
    PartyAI.spawnZzz(npc);
  }

  private static updatePassedOut(npc: PartyNPC, delta: number): void {
    npc.zzzTimer += delta;

    // Spawn new ZZZ every 2 seconds
    if (npc.zzzTimer >= 2000) {
      npc.zzzTimer -= 2000;
      PartyAI.spawnZzz(npc);
    }
  }

  private static spawnZzz(npc: PartyNPC): void {
    if (!PartyAI.scene) return;

    const zzz = PartyAI.scene.add.text(
      npc.sprite.x + 10,
      npc.sprite.y - 20,
      'ZZZ',
      ZZZ_FONT
    ).setDepth(20).setAlpha(0);

    PartyAI.scene.tweens.add({
      targets: zzz,
      y: npc.sprite.y - 60,
      alpha: { from: 1, to: 0 },
      duration: 1800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        zzz.destroy();
      },
    });
  }

  // ── Speech bubbles ──────────────────────────────────────────

  static showBubble(npc: PartyNPC, text: string): void {
    if (!PartyAI.scene) return;

    // Destroy existing bubble
    if (npc.currentBubble) {
      npc.currentBubble.destroy();
      npc.currentBubble = null;
    }

    const bubble = PartyAI.scene.add.text(
      npc.sprite.x,
      npc.sprite.y - 40,
      text,
      BUBBLE_FONT
    )
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setAlpha(0);

    npc.currentBubble = bubble;
    npc.bubbleTimer = randomRange(2000, 3000);

    // Fade in
    PartyAI.scene.tweens.add({
      targets: bubble,
      alpha: 1,
      duration: 200,
      ease: 'Linear',
    });
  }

  private static updateBubble(npc: PartyNPC, delta: number): void {
    if (!npc.currentBubble) return;

    // Keep bubble above NPC as they move
    npc.currentBubble.setPosition(npc.sprite.x, npc.sprite.y - 40);

    npc.bubbleTimer -= delta;

    if (npc.bubbleTimer <= 0) {
      // Fade out and destroy
      const bubble = npc.currentBubble;
      npc.currentBubble = null;

      if (PartyAI.scene) {
        PartyAI.scene.tweens.add({
          targets: bubble,
          alpha: 0,
          duration: 300,
          ease: 'Linear',
          onComplete: () => {
            bubble.destroy();
          },
        });
      } else {
        bubble.destroy();
      }
    }
  }

  // ── Dance tween management ──────────────────────────────────

  private static stopDanceTween(npc: PartyNPC): void {
    if (npc.danceTween) {
      npc.danceTween.stop();
      npc.danceTween = null;
      // Reset sprite angle and position to normal
      npc.sprite.setAngle(0);
      npc.sprite.x = tileToPx(npc.tileX);
      npc.sprite.y = tileToPx(npc.tileY);
    }
  }

  // ── Public API ──────────────────────────────────────────────

  static isActive(): boolean {
    return PartyAI.active;
  }

  static getNPCState(id: string): PartyState | null {
    const npc = PartyAI.npcs.find(n => n.config.id === id);
    return npc ? npc.state : null;
  }

  // ── Cleanup ─────────────────────────────────────────────────

  static destroy(): void {
    if (!PartyAI.scene) return;

    PartyAI.occupiedTiles.clear();

    for (const npc of PartyAI.npcs) {
      // Stop dance tweens
      PartyAI.stopDanceTween(npc);

      // Destroy bubble
      if (npc.currentBubble) {
        npc.currentBubble.destroy();
        npc.currentBubble = null;
      }

      // Destroy ZZZ
      if (npc.zzzText) {
        npc.zzzText.destroy();
        npc.zzzText = null;
      }

      // Destroy sprite
      npc.sprite.destroy();
    }

    PartyAI.npcs = [];
    PartyAI.scene = null;
    PartyAI.playerSprite = null;
    PartyAI.active = false;
    PartyAI.elapsedTime = 0;
    PartyAI.nextEventIndex = 0;
    PartyAI.randomEventsFired.clear();
    PartyAI.randomEventsRollTimer = 0;
    PartyAI.randomEventActive = false;
  }
}
