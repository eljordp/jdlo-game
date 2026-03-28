import Phaser from 'phaser';
import { SCALED_TILE, SCALE } from '../config';

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
  tileX: number;
  tileY: number;
  moveProgress: number;      // 0-1 for interpolating walk between tiles
  moveStartX: number;        // pixel start for current tile move
  moveStartY: number;
  moveTargetX: number;       // pixel target for current tile move
  moveTargetY: number;
  danceTween: Phaser.Tweens.Tween | null;
  zzzText: Phaser.GameObjects.Text | null;
  zzzTimer: number;          // ms counter for ZZZ respawn
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

// ── Main Party AI System ────────────────────────────────────────

export class PartyAI {
  private static scene: Phaser.Scene | null = null;
  private static npcs: PartyNPC[] = [];
  private static active: boolean = false;
  private static elapsedTime: number = 0;
  private static nextEventIndex: number = 0;

  // ── Init ────────────────────────────────────────────────────

  static init(scene: Phaser.Scene): Phaser.GameObjects.Sprite[] {
    PartyAI.scene = scene;
    PartyAI.npcs = [];
    PartyAI.active = true;
    PartyAI.elapsedTime = 0;
    PartyAI.nextEventIndex = 0;

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
        tileX: wp.x,
        tileY: wp.y,
        moveProgress: 0,
        moveStartX: px,
        moveStartY: py,
        moveTargetX: px,
        moveTargetY: py,
        danceTween: null,
        zzzText: null,
        zzzTimer: 0,
      };

      PartyAI.npcs.push(npc);
      sprites.push(sprite);
    }

    return sprites;
  }

  // ── Update (called every frame) ─────────────────────────────

  static update(delta: number): void {
    if (!PartyAI.active || !PartyAI.scene) return;

    PartyAI.elapsedTime += delta;

    // Process scripted events
    PartyAI.processEvents();

    // Update each NPC
    for (const npc of PartyAI.npcs) {
      // Update bubble timers
      PartyAI.updateBubble(npc, delta);

      // Skip updates for passed out NPCs
      if (npc.state === 'passed_out') {
        PartyAI.updatePassedOut(npc, delta);
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

    // Occasionally show a line while dancing
    if (Math.random() < 0.4) {
      PartyAI.showBubble(npc, pick(npc.config.lines));
    }
  }

  private static enterTalking(npc: PartyNPC): void {
    npc.state = 'talking';
    npc.stateTimer = randomRange(3000, 6000);

    // Show a speech bubble with a random line
    PartyAI.showBubble(npc, pick(npc.config.lines));

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

    // Chance to say something while drinking
    if (Math.random() < 0.3) {
      PartyAI.showBubble(npc, pick(npc.config.lines));
    }
  }

  private static enterWanderingRandom(npc: PartyNPC): void {
    const wp = pick(WAYPOINTS);
    PartyAI.startWandering(npc, wp);
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

    // Move along the axis with larger distance first
    let nextTileX = npc.tileX;
    let nextTileY = npc.tileY;

    if (Math.abs(dx) >= Math.abs(dy)) {
      nextTileX += dx > 0 ? 1 : -1;
    } else {
      nextTileY += dy > 0 ? 1 : -1;
    }

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

    // Update tile position (we claim the new tile immediately for proximity checks)
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
    PartyAI.active = false;
    PartyAI.elapsedTime = 0;
    PartyAI.nextEventIndex = 0;
  }
}
