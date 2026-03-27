import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CHAR_SCALE } from '../config';
import { SoundEffects } from './SoundEffects';

// ── Emote Definition ──────────────────────────────────────────────

interface EmoteDef {
  id: string;
  name: string;
  locked: boolean;
  price: number;
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
  { id: 'hit_cart',        name: 'Hit Cart',        locked: false, price: 0,   animation: animHitCart },
  { id: 'nod',             name: 'Nod',             locked: false, price: 0,   animation: animNod },
  { id: 'smoke_za',        name: 'Smoke Za',        locked: true,  price: 500, animation: animSmokeZa },
  { id: 'rip_bong',        name: 'Rip Bong',        locked: true,  price: 750, animation: animRipBong },
  { id: 'shoulder_dance',  name: 'Drop Shoulder',   locked: true,  price: 400, animation: animShoulderDance },
  { id: 'gooning',         name: 'Gooning',         locked: true,  price: 600, animation: animGooning },
  { id: 'sixty_seven',     name: '67',              locked: true,  price: 300, animation: animSixtySeven },
  { id: 'flex',            name: 'Flex',            locked: true,  price: 200, animation: animFlex },
];

// ── Emote System (Singleton) ─────────────────────────────────────

const SAVE_KEY = 'jdlo-emotes-unlocked';

export class EmoteSystem {
  private static scene: Phaser.Scene | null = null;
  private static player: Phaser.GameObjects.Sprite | null = null;
  private static unlockedIds: Set<string> = new Set();
  private static wheelOpen = false;
  private static wheelObjects: Phaser.GameObjects.GameObject[] = [];
  private static shopOpen = false;
  private static playing = false;
  private static eKey: Phaser.Input.Keyboard.Key | null = null;
  private static escKey: Phaser.Input.Keyboard.Key | null = null;
  private static numberKeys: Phaser.Input.Keyboard.Key[] = [];

  /** Initialize the emote system for the current scene */
  static init(scene: Phaser.Scene) {
    this.scene = scene;
    // Player is always `this.player` on BaseChapterScene
    this.player = (scene as unknown as { player: Phaser.GameObjects.Sprite }).player;
    this.wheelOpen = false;
    this.shopOpen = false;
    this.playing = false;
    this.wheelObjects = [];

    // Load saved unlocks
    this.loadUnlocks();

    // Default emotes are always unlocked
    for (const e of ALL_EMOTES) {
      if (!e.locked) this.unlockedIds.add(e.id);
    }

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
          if (this.isUnlocked(emote.id)) {
            this.closeWheel();
            this.playEmote(scene, this.player!, emote.id);
          }
        }
      });
    }
  }

  /** Play a specific emote by id */
  static playEmote(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, emoteId: string): void {
    const emote = ALL_EMOTES.find(e => e.id === emoteId);
    if (!emote) return;
    if (!this.isUnlocked(emoteId)) return;
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
    });
  }

  /** Check if an emote is unlocked */
  static isUnlocked(emoteId: string): boolean {
    return this.unlockedIds.has(emoteId);
  }

  /** Unlock an emote */
  static unlock(emoteId: string): void {
    this.unlockedIds.add(emoteId);
    this.saveUnlocks();
  }

  /** Get all emote definitions */
  static getEmotes(): EmoteDef[] {
    return ALL_EMOTES;
  }

  // ── Emote Wheel ──────────────────────────────────────────────

  private static getVisibleEmotes(): EmoteDef[] {
    // Show unlocked first, then locked
    const unlocked = ALL_EMOTES.filter(e => this.isUnlocked(e.id));
    const locked = ALL_EMOTES.filter(e => !this.isUnlocked(e.id));
    return [...unlocked, ...locked];
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
      const unlocked = this.isUnlocked(emote.id);

      // Cell background
      const bg = scene.add.rectangle(cx, cy, cellW - 16, cellH - 12, unlocked ? 0x1a1a2e : 0x0e0e18, 0.9)
        .setScrollFactor(0).setDepth(402).setStrokeStyle(2, unlocked ? 0x3a3a5e : 0x2a2a3e);
      this.wheelObjects.push(bg);

      // Number badge
      const numBadge = scene.add.text(cx - (cellW / 2) + 18, cy - 20, `${i + 1}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: unlocked ? '#f0c040' : '#444444',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
      this.wheelObjects.push(numBadge);

      // Emote name
      const nameColor = unlocked ? '#ffffff' : '#555555';
      const nameText = scene.add.text(cx + 8, cy - 18, emote.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: nameColor,
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(403);
      this.wheelObjects.push(nameText);

      // Status line
      if (unlocked) {
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

        const priceText = scene.add.text(cx, cy + 26, `$${emote.price}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#f0c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(priceText);
      }

      // Click handler
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, unlocked ? 0xf0c040 : 0x605020);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, unlocked ? 0x3a3a5e : 0x2a2a3e);
      });
      bg.on('pointerdown', () => {
        if (unlocked) {
          this.closeWheel();
          this.playEmote(scene, this.player!, emote.id);
        } else {
          this.openShop(emote.id);
        }
      });
    }

    // Shop button at bottom
    const shopBg = scene.add.rectangle(GAME_WIDTH / 2, startY + Math.ceil(emotes.length / cols) * cellH + 30, 200, 40, 0x2a1a3e, 0.9)
      .setScrollFactor(0).setDepth(402).setStrokeStyle(2, 0x604080).setInteractive({ useHandCursor: true });
    this.wheelObjects.push(shopBg);

    const shopLabel = scene.add.text(GAME_WIDTH / 2, startY + Math.ceil(emotes.length / cols) * cellH + 30, 'SHOP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#c080f0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
    this.wheelObjects.push(shopLabel);

    shopBg.on('pointerover', () => shopBg.setStrokeStyle(2, 0xc080f0));
    shopBg.on('pointerout', () => shopBg.setStrokeStyle(2, 0x604080));
    shopBg.on('pointerdown', () => this.openShop());

    // Close when clicking overlay (not cells)
    overlay.on('pointerdown', () => this.closeWheel());
  }

  private static closeWheel() {
    if (!this.wheelOpen) return;
    this.wheelOpen = false;
    this.shopOpen = false;

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

  // ── Emote Shop ──────────────────────────────────────────────

  private static openShop(focusId?: string) {
    if (!this.scene) return;

    // Clear current wheel objects and rebuild as shop
    for (const obj of this.wheelObjects) {
      if (obj && obj.active) obj.destroy();
    }
    this.wheelObjects = [];
    this.shopOpen = true;

    const scene = this.scene;

    // Dark overlay
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8,
    ).setScrollFactor(0).setDepth(400).setInteractive();
    this.wheelObjects.push(overlay);

    // Shop title
    const shopTitle = scene.add.text(GAME_WIDTH / 2, 70, 'EMOTE SHOP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#c080f0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401);
    this.wheelObjects.push(shopTitle);

    const subtext = scene.add.text(GAME_WIDTH / 2, 100, 'Click to unlock  |  ESC to go back', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401);
    this.wheelObjects.push(subtext);

    // List purchasable emotes
    const purchasable = ALL_EMOTES.filter(e => e.locked);
    const startY = 150;
    const rowH = 70;

    for (let i = 0; i < purchasable.length; i++) {
      const emote = purchasable[i];
      const cy = startY + i * rowH;
      const unlocked = this.isUnlocked(emote.id);
      const highlighted = focusId === emote.id;

      const rowBg = scene.add.rectangle(
        GAME_WIDTH / 2, cy, 600, rowH - 8,
        highlighted ? 0x2a1a3e : 0x1a1a2e, 0.9,
      ).setScrollFactor(0).setDepth(402)
        .setStrokeStyle(2, highlighted ? 0xc080f0 : 0x3a3a5e);
      this.wheelObjects.push(rowBg);

      // Name
      const name = scene.add.text(GAME_WIDTH / 2 - 220, cy, emote.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: unlocked ? '#60c060' : '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(403);
      this.wheelObjects.push(name);

      // Price or "OWNED"
      if (unlocked) {
        const owned = scene.add.text(GAME_WIDTH / 2 + 200, cy, 'OWNED', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#60c060',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(owned);
      } else {
        const price = scene.add.text(GAME_WIDTH / 2 + 160, cy, `$${emote.price}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(403);
        this.wheelObjects.push(price);

        // Buy button
        const buyBg = scene.add.rectangle(GAME_WIDTH / 2 + 250, cy, 80, 30, 0x306030, 0.9)
          .setScrollFactor(0).setDepth(403).setStrokeStyle(1, 0x60c060)
          .setInteractive({ useHandCursor: true });
        this.wheelObjects.push(buyBg);

        const buyText = scene.add.text(GAME_WIDTH / 2 + 250, cy, 'BUY', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(404);
        this.wheelObjects.push(buyText);

        buyBg.on('pointerover', () => buyBg.setFillStyle(0x408040, 1));
        buyBg.on('pointerout', () => buyBg.setFillStyle(0x306030, 0.9));
        buyBg.on('pointerdown', () => {
          this.unlock(emote.id);
          SoundEffects.playCash();

          // Refresh shop
          this.openShop();
        });
      }

      rowBg.setInteractive();
    }

    // Back button
    const backBg = scene.add.rectangle(GAME_WIDTH / 2, startY + purchasable.length * rowH + 30, 200, 40, 0x1a1a2e, 0.9)
      .setScrollFactor(0).setDepth(402).setStrokeStyle(2, 0x3a3a5e).setInteractive({ useHandCursor: true });
    this.wheelObjects.push(backBg);

    const backLabel = scene.add.text(GAME_WIDTH / 2, startY + purchasable.length * rowH + 30, 'BACK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(403);
    this.wheelObjects.push(backLabel);

    backBg.on('pointerover', () => backBg.setStrokeStyle(2, 0xf0c040));
    backBg.on('pointerout', () => backBg.setStrokeStyle(2, 0x3a3a5e));
    backBg.on('pointerdown', () => {
      // Go back to emote wheel
      this.shopOpen = false;
      for (const obj of this.wheelObjects) {
        if (obj && obj.active) obj.destroy();
      }
      this.wheelObjects = [];
      this.wheelOpen = false;
      this.openWheel();
    });

    overlay.on('pointerdown', () => this.closeWheel());
  }

  // ── Persistence ─────────────────────────────────────────────

  private static loadUnlocks() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        for (const id of ids) this.unlockedIds.add(id);
      }
    } catch {
      // Silent fail
    }
  }

  private static saveUnlocks() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify([...this.unlockedIds]));
    } catch {
      // Silent fail
    }
  }
}
