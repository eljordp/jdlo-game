import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CHAR_SCALE } from '../config';
import { SoundEffects } from './SoundEffects';
import { InventorySystem } from './InventorySystem';
import { MoodSystem } from './MoodSystem';
import { virtualInput } from '../../components/GameCanvas';

// ── Emote Definition ──────────────────────────────────────────────

interface EmoteDef {
  id: string;
  name: string;
  requiredItem: string | null; // inventory item id needed, or null if always available
  requiredItemName: string;    // display name of required item (for "Need: X" text)
  animation: (scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) => number; // returns duration ms
}

// ── Animations ────────────────────────────────────────────────────

function spawnSmokePuff(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  alpha: number,
  radius: number,
  driftX: number,
  driftY: number,
  duration: number,
  depth: number,
) {
  const puff = scene.add.circle(x, y, radius, color, alpha).setDepth(depth);
  scene.tweens.add({
    targets: puff,
    y: y + driftY,
    x: x + driftX,
    alpha: 0,
    scaleX: 2.5,
    scaleY: 2.5,
    duration,
    onComplete: () => puff.destroy(),
  });
}

function animHitCart(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseY = player.y;
  const baseAngle = player.angle;

  // Head tilt back
  scene.tweens.add({
    targets: player,
    angle: baseAngle - 8,
    y: baseY - 2,
    duration: 300,
    yoyo: true,
    ease: 'Sine.easeInOut',
  });

  // Small cloud puff from mouth area after inhale
  scene.time.delayedCall(350, () => {
    for (let i = 0; i < 4; i++) {
      scene.time.delayedCall(i * 120, () => {
        spawnSmokePuff(
          scene,
          player.x + (Math.random() * 8 - 4),
          player.y - 28,
          0xcccccc,
          0.5,
          3 + Math.random() * 2,
          Math.random() * 10 - 5,
          -30 - Math.random() * 15,
          800 + Math.random() * 400,
          player.depth + 1,
        );
      });
    }
  });

  return 1000;
}

function animNod(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseY = player.y;
  scene.tweens.add({
    targets: player,
    y: baseY + 3,
    duration: 120,
    yoyo: true,
    repeat: 1,
    ease: 'Sine.easeInOut',
  });
  return 500;
}

function animSmokeZa(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseY = player.y;
  const baseAngle = player.angle;

  // Longer inhale — head tilt back, hold
  scene.tweens.add({
    targets: player,
    angle: baseAngle - 10,
    y: baseY - 3,
    duration: 500,
    hold: 300,
    yoyo: true,
    ease: 'Sine.easeInOut',
  });

  // Big green-tinted smoke clouds after hold
  scene.time.delayedCall(900, () => {
    for (let i = 0; i < 7; i++) {
      scene.time.delayedCall(i * 100, () => {
        spawnSmokePuff(
          scene,
          player.x + (Math.random() * 12 - 6),
          player.y - 28,
          0x80c060,
          0.55,
          4 + Math.random() * 3,
          Math.random() * 16 - 8,
          -40 - Math.random() * 20,
          1000 + Math.random() * 500,
          player.depth + 1,
        );
      });
    }
  });

  return 1500;
}

function animRipBong(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseY = player.y;
  const baseScaleY = player.scaleY;

  // Duck down (squish)
  scene.tweens.add({
    targets: player,
    scaleY: baseScaleY * 0.8,
    y: baseY + 6,
    duration: 400,
    yoyo: true,
    ease: 'Quad.easeInOut',
  });

  // Big cloud burst upward
  scene.time.delayedCall(500, () => {
    for (let i = 0; i < 10; i++) {
      scene.time.delayedCall(i * 60, () => {
        spawnSmokePuff(
          scene,
          player.x + (Math.random() * 16 - 8),
          player.y - 30,
          0xdddddd,
          0.6,
          5 + Math.random() * 4,
          Math.random() * 20 - 10,
          -50 - Math.random() * 25,
          1200 + Math.random() * 500,
          player.depth + 1,
        );
      });
    }

    // Cough emoji floating up
    const cough = scene.add.text(player.x, player.y - 35, '\u{1F4A8}', {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(player.depth + 2);
    scene.tweens.add({
      targets: cough,
      y: cough.y - 50,
      alpha: 0,
      duration: 1200,
      onComplete: () => cough.destroy(),
    });
  });

  return 1500;
}

function animShoulderDance(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseX = player.x;
  const baseAngle = player.angle;

  // Fast side-to-side rock with angle tilt
  scene.tweens.add({
    targets: player,
    x: baseX + 4,
    angle: baseAngle + 4,
    duration: 140,
    yoyo: true,
    repeat: 5,
    ease: 'Sine.easeInOut',
    onYoyo: () => {
      // On each yoyo, overshoot to the other side
      scene.tweens.add({
        targets: player,
        x: baseX - 4,
        angle: baseAngle - 4,
        duration: 140,
        yoyo: true,
      });
    },
    onComplete: () => {
      player.x = baseX;
      player.angle = baseAngle;
    },
  });

  return 1500;
}

function animGooning(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseY = player.y;

  // Slow head bob
  scene.tweens.add({
    targets: player,
    y: baseY + 5,
    duration: 500,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
  });

  // Eyes half-closed effect — dark rectangles flash over top of sprite
  for (let i = 0; i < 3; i++) {
    scene.time.delayedCall(i * 1000, () => {
      const leftEye = scene.add.rectangle(
        player.x - 6, player.y - 18, 8, 4, 0x000000, 0.7,
      ).setDepth(player.depth + 1);
      const rightEye = scene.add.rectangle(
        player.x + 6, player.y - 18, 8, 4, 0x000000, 0.7,
      ).setDepth(player.depth + 1);

      scene.tweens.add({
        targets: [leftEye, rightEye],
        alpha: 0,
        duration: 600,
        delay: 200,
        onComplete: () => { leftEye.destroy(); rightEye.destroy(); },
      });
    });
  }

  return 1500;
}

function animSixtySeven(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  // "67" in gold above player
  const text = scene.add.text(player.x, player.y - 35, '67', {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '14px',
    color: '#f0c040',
    stroke: '#000000',
    strokeThickness: 3,
  }).setOrigin(0.5).setDepth(player.depth + 2).setAlpha(0);

  scene.tweens.add({
    targets: text,
    alpha: 1,
    y: text.y - 15,
    duration: 400,
    hold: 600,
    yoyo: true,
    onComplete: () => text.destroy(),
  });

  // Brief flex — scale pulse wider then back
  const baseScaleX = player.scaleX;
  const baseScaleY = player.scaleY;
  scene.tweens.add({
    targets: player,
    scaleX: baseScaleX * 1.25,
    scaleY: baseScaleY * 0.9,
    duration: 200,
    yoyo: true,
    ease: 'Back.easeOut',
  });

  return 1200;
}

function animFlex(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): number {
  const baseScaleX = player.scaleX;
  const baseScaleY = player.scaleY;

  // Scale up
  scene.tweens.add({
    targets: player,
    scaleX: baseScaleX * 1.2,
    scaleY: baseScaleY * 1.2,
    duration: 300,
    yoyo: true,
    ease: 'Back.easeOut',
  });

  // Flex emoji
  const emoji = scene.add.text(player.x + 15, player.y - 25, '\u{1F4AA}', {
    fontSize: '16px',
  }).setOrigin(0.5).setDepth(player.depth + 2);

  scene.tweens.add({
    targets: emoji,
    y: emoji.y - 35,
    alpha: 0,
    duration: 1000,
    onComplete: () => emoji.destroy(),
  });

  return 1000;
}

// ── Emote Registry ────────────────────────────────────────────────

const ALL_EMOTES: EmoteDef[] = [
  { id: 'hit_cart',        name: 'Hit Cart',        requiredItem: 'cart', requiredItemName: 'Blinker',  animation: animHitCart },
  { id: 'nod',             name: 'Nod',             requiredItem: null,   requiredItemName: '',         animation: animNod },
  { id: 'smoke_za',        name: 'Smoke Za',        requiredItem: 'za',   requiredItemName: 'Za',       animation: animSmokeZa },
  { id: 'rip_bong',        name: 'Rip Bong',        requiredItem: 'bong', requiredItemName: 'Bong',     animation: animRipBong },
  { id: 'shoulder_dance',  name: 'Drop Shoulder',   requiredItem: null,   requiredItemName: '',         animation: animShoulderDance },
  { id: 'gooning',         name: 'Gooning',         requiredItem: null,   requiredItemName: '',         animation: animGooning },
  { id: 'sixty_seven',     name: '67',              requiredItem: null,   requiredItemName: '',         animation: animSixtySeven },
  { id: 'flex',            name: 'Flex',             requiredItem: null,   requiredItemName: '',         animation: animFlex },
];

// ── Emote System (Singleton) ─────────────────────────────────────

export class EmoteSystem {
  private static scene: Phaser.Scene | null = null;
  private static player: Phaser.GameObjects.Sprite | null = null;
  private static wheelOpen = false;
  private static wheelObjects: Phaser.GameObjects.GameObject[] = [];
  private static playing = false;
  private static eKey: Phaser.Input.Keyboard.Key | null = null;
  private static escKey: Phaser.Input.Keyboard.Key | null = null;
  private static numberKeys: Phaser.Input.Keyboard.Key[] = [];

  /** Check if an emote is available (has required item or no item needed) */
  static isAvailable(emoteId: string): boolean {
    const emote = ALL_EMOTES.find(e => e.id === emoteId);
    if (!emote) return false;
    if (emote.requiredItem === null) return true;
    return InventorySystem.hasItem(emote.requiredItem);
  }

  /** Initialize the emote system for the current scene */
  static init(scene: Phaser.Scene) {
    this.scene = scene;
    // Player is always `this.player` on BaseChapterScene
    this.player = (scene as unknown as { player: Phaser.GameObjects.Sprite }).player;
    this.wheelOpen = false;
    this.playing = false;
    this.wheelObjects = [];

    // Register E key
    this.eKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Number keys 1-8
    this.numberKeys = [];
    const codes = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
      Phaser.Input.Keyboard.KeyCodes.SIX,
      Phaser.Input.Keyboard.KeyCodes.SEVEN,
      Phaser.Input.Keyboard.KeyCodes.EIGHT,
    ];
    for (const code of codes) {
      this.numberKeys.push(scene.input.keyboard!.addKey(code));
    }

    // Key listeners
    this.eKey.on('down', () => {
      if (this.playing) return;
      if (this.wheelOpen) {
        this.closeWheel();
      } else {
        this.openWheel();
      }
    });

    this.escKey.on('down', () => {
      if (this.wheelOpen) this.closeWheel();
    });

    // Number key shortcuts
    for (let i = 0; i < this.numberKeys.length; i++) {
      const idx = i;
      this.numberKeys[i].on('down', () => {
        if (!this.wheelOpen) return;
        const visibleEmotes = this.getVisibleEmotes();
        if (idx < visibleEmotes.length) {
          const emote = visibleEmotes[idx];
          if (this.isAvailable(emote.id)) {
            this.closeWheel();
            this.playEmote(scene, this.player!, emote.id);
          }
        }
      });
    }

    // Mobile: poll virtualInput for emote button
    scene.events.on('update', () => {
      if (virtualInput.emoteJustPressed) {
        virtualInput.emoteJustPressed = false;
        if (this.playing) return;
        if (this.wheelOpen) this.closeWheel();
        else this.openWheel();
      }
    });
  }

  /** Play a specific emote by id */
  static playEmote(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, emoteId: string): void {
    const emote = ALL_EMOTES.find(e => e.id === emoteId);
    if (!emote) return;
    if (!this.isAvailable(emoteId)) return;
    if (this.playing) return;

    this.playing = true;

    // Freeze movement on the scene
    const baseScene = scene as unknown as { frozen: boolean };
    baseScene.frozen = true;

    SoundEffects.playBlip();

    const duration = emote.animation(scene, player);

    scene.time.delayedCall(duration, () => {
      this.playing = false;
      baseScene.frozen = false;

      // Emote wheel = just animations, no mood changes
      // Mood changes come from contextual world interactions only
    });
  }

  /** Apply mood change based on the emote that was just played */
  private static applyMoodFromEmote(emoteId: string): void {
    switch (emoteId) {
      case 'hit_cart':
        if (MoodSystem.isFaded()) {
          MoodSystem.extendMood(60);
        } else {
          MoodSystem.setMood('faded', 60);
        }
        break;
      case 'smoke_za':
        if (MoodSystem.isFaded()) {
          MoodSystem.extendMood(90);
        } else {
          MoodSystem.setMood('faded', 90);
        }
        break;
      case 'rip_bong':
        if (MoodSystem.isFaded()) {
          MoodSystem.extendMood(120);
        } else {
          MoodSystem.setMood('faded', 120);
        }
        break;
      case 'shoulder_dance':
      case 'gooning':
      case 'sixty_seven':
        MoodSystem.setMood('vibing', 30);
        break;
      case 'flex':
        if (MoodSystem.isLockedIn()) {
          MoodSystem.setMood('hyped', 20);
        } else {
          MoodSystem.setMood('locked_in', 45);
        }
        break;
      // 'nod' — no mood change
    }
  }

  /** Get all emote definitions */
  static getEmotes(): EmoteDef[] {
    return ALL_EMOTES;
  }

  // ── Emote Wheel ──────────────────────────────────────────────

  private static getVisibleEmotes(): EmoteDef[] {
    // Show available first, then locked
    const available = ALL_EMOTES.filter(e => this.isAvailable(e.id));
    const locked = ALL_EMOTES.filter(e => !this.isAvailable(e.id));
    return [...available, ...locked];
  }

  private static openWheel() {
    if (!this.scene || this.wheelOpen) return;
    this.wheelOpen = true;

    const scene = this.scene;
    const baseScene = scene as unknown as { frozen: boolean };
    baseScene.frozen = true;

    // Dark overlay
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7,
    ).setScrollFactor(0).setDepth(400).setInteractive();
    this.wheelObjects.push(overlay);

    // Title
    const title = scene.add.text(GAME_WIDTH / 2, 80, 'EMOTES', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401);
    this.wheelObjects.push(title);

    // Hint
    const hint = scene.add.text(GAME_WIDTH / 2, 110, 'Press 1-8 or click  |  E / ESC to close', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401);
    this.wheelObjects.push(hint);

    // Grid of emotes — 4 columns
    const emotes = this.getVisibleEmotes();
    const cols = 4;
    const cellW = 260;
    const cellH = 100;
    const startX = GAME_WIDTH / 2 - ((Math.min(cols, emotes.length) * cellW) / 2) + cellW / 2;
    const startY = 170;

    for (let i = 0; i < emotes.length; i++) {
      const emote = emotes[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * cellW;
      const cy = startY + row * cellH;
      const available = this.isAvailable(emote.id);

      // Cell background
      const bg = scene.add.rectangle(cx, cy, cellW - 16, cellH - 12, available ? 0x1a1a2e : 0x0e0e18, 0.9)
        .setScrollFactor(0).setDepth(402).setStrokeStyle(2, available ? 0x3a3a5e : 0x2a2a3e);
      this.wheelObjects.push(bg);

      // Number badge
      const numBadge = scene.add.text(cx - (cellW / 2) + 18, cy - 20, `${i + 1}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: available ? '#f0c040' : '#444444',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
      this.wheelObjects.push(numBadge);

      // Emote name
      const nameColor = available ? '#ffffff' : '#555555';
      const nameText = scene.add.text(cx + 8, cy - 18, emote.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: nameColor,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(403);
      this.wheelObjects.push(nameText);

      // Status line
      if (available) {
        const ready = scene.add.text(cx, cy + 14, 'READY', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#60c060',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(ready);
      } else {
        const lockText = scene.add.text(cx, cy + 6, '\u{1F512}', {
          fontSize: '14px',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(lockText);

        const needText = scene.add.text(cx, cy + 26, `Need: ${emote.requiredItemName}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#f0c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(needText);
      }

      // Click handler
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, available ? 0xf0c040 : 0x605020);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, available ? 0x3a3a5e : 0x2a2a3e);
      });
      bg.on('pointerdown', () => {
        if (available) {
          this.closeWheel();
          this.playEmote(scene, this.player!, emote.id);
        }
      });
    }

    // Close when clicking overlay (not cells)
    overlay.on('pointerdown', () => this.closeWheel());
  }

  private static closeWheel() {
    if (!this.wheelOpen) return;
    this.wheelOpen = false;

    for (const obj of this.wheelObjects) {
      if (obj && obj.active) obj.destroy();
    }
    this.wheelObjects = [];

    // Unfreeze if not playing an emote
    if (!this.playing && this.scene) {
      const baseScene = this.scene as unknown as { frozen: boolean };
      baseScene.frozen = false;
    }
  }
}
