// ─── BALANCE SYSTEM ──────────────────────────────────────────────────
// Tracks JP's money across chapters. Earn from clients, spend on stuff.
// Static singleton, same pattern as SoundEffects/Analytics.
// ─────────────────────────────────────────────────────────────────────

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { DialogueSystem, type DialogueLine } from './DialogueSystem';
import { SoundEffects } from './SoundEffects';

const SAVE_KEY = 'jdlo-balance';
const MILESTONES_KEY = 'jdlo-milestones';

interface MilestoneConfig {
  amount: number;
  emojis: string;
  subtitle: string;
  dialogue: string;
}

const MILESTONES: MilestoneConfig[] = [
  {
    amount: 10_000,
    emojis: '\u{1F4B0}',
    subtitle: 'First 10 bands.',
    dialogue: 'Ten thousand dollars. I made that. Nobody gave me shit.',
  },
  {
    amount: 50_000,
    emojis: '\u{1F4B0}\u{1F4B0}',
    subtitle: 'Half a hundred.',
    dialogue: 'Fifty K. I used to steal lunch money.',
  },
  {
    amount: 100_000,
    emojis: '\u{1F4B0}\u{1F4B0}\u{1F4B0}',
    subtitle: 'Six figures. Different air up here.',
    dialogue: 'A hundred thousand. Pops would lose his mind.',
  },
];

export class BalanceSystem {
  private static balance = 0;
  private static initialized = false;
  private static scene: Phaser.Scene | null = null;
  private static triggeredMilestones: Set<number> = new Set();
  private static celebrationInProgress = false;

  static init() {
    if (this.initialized) return;
    this.initialized = true;
    this.load();
    this.loadMilestones();
  }

  /** Attach a scene so milestone celebrations can render */
  static attachScene(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Get current balance */
  static getBalance(): number {
    this.init();
    return this.balance;
  }

  /** Earn money (from clients, deals, etc.) */
  static earn(amount: number, _reason?: string): number {
    this.init();
    this.balance += amount;
    this.save();
    this.checkMilestones();
    return this.balance;
  }

  /** Spend money. Returns true if successful, false if insufficient funds. */
  static spend(amount: number, _reason?: string): boolean {
    this.init();
    if (this.balance < amount) return false;
    this.balance -= amount;
    this.save();
    return true;
  }

  /** Check if player can afford something */
  static canAfford(amount: number): boolean {
    this.init();
    return this.balance >= amount;
  }

  /** Format balance for display */
  static formatted(): string {
    this.init();
    return '$' + this.balance.toLocaleString();
  }

  /** Reset (new game) */
  static reset() {
    this.balance = 0;
    this.triggeredMilestones.clear();
    this.save();
    this.saveMilestones();
  }

  /** Check if any milestone thresholds have been crossed */
  static checkMilestones() {
    if (!this.scene || this.celebrationInProgress) return;

    for (const milestone of MILESTONES) {
      if (this.balance >= milestone.amount && !this.triggeredMilestones.has(milestone.amount)) {
        this.triggeredMilestones.add(milestone.amount);
        this.saveMilestones();
        this.playCelebration(milestone);
        return; // One at a time
      }
    }
  }

  // ─── CELEBRATION ──────────────────────────────────────────────────

  private static playCelebration(milestone: MilestoneConfig) {
    const scene = this.scene;
    if (!scene) return;

    this.celebrationInProgress = true;
    SoundEffects.moneyRain();

    const cam = scene.cameras.main;
    const depth = 10000;

    // ── 1. Screen flash — white overlay, flash twice ──
    const flash = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0);

    scene.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.8 },
      duration: 200,
      yoyo: true,
      onComplete: () => {
        scene.tweens.add({
          targets: flash,
          alpha: { from: 0, to: 0.6 },
          duration: 200,
          yoyo: true,
          onComplete: () => flash.destroy(),
        });
      },
    });

    // ── 2. Camera shake + zoom ──
    cam.shake(500, 0.015);
    scene.tweens.add({
      targets: cam,
      zoom: 1.05,
      duration: 300,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 200,
    });

    // ── 3. Big text announcement ──
    const amountStr = '$' + milestone.amount.toLocaleString();
    const titleText = milestone.emojis + ' ' + amountStr;

    const title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, titleText, {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#8B6914',
      strokeThickness: 6,
      align: 'center',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 8,
        fill: true,
      },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setScale(0);

    const subtitle = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, milestone.subtitle, {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setScale(0);

    // Bounce scale in
    scene.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 300,
    });

    scene.tweens.add({
      targets: subtitle,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 500,
    });

    // Hold 2s then fade out
    scene.tweens.add({
      targets: [title, subtitle],
      alpha: 0,
      duration: 600,
      delay: 2800,
      onComplete: () => {
        title.destroy();
        subtitle.destroy();
      },
    });

    // ── 4. Money rain ──
    this.spawnMoneyRain(scene, depth + 1);

    // ── 5. JP's Mind dialogue after animation ──
    scene.time.delayedCall(3800, () => {
      this.celebrationInProgress = false;

      // Try to use existing dialogue system on the scene
      const sceneAny = scene as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (sceneAny.dialogue && typeof sceneAny.dialogue.show === 'function') {
        const lines: DialogueLine[] = [
          { speaker: "JP's Mind", text: milestone.dialogue },
        ];
        sceneAny.dialogue.show(lines);
      }
    });
  }

  private static spawnMoneyRain(scene: Phaser.Scene, depth: number) {
    const count = 40;
    const staggerTime = 500;
    const fallDuration = 3000;

    for (let i = 0; i < count; i++) {
      const delay = (i / count) * staggerTime + Math.random() * 100;

      scene.time.delayedCall(delay + 200, () => {
        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const startY = -40;
        const endY = GAME_HEIGHT + 60;
        const xDrift = Phaser.Math.Between(-80, 80);
        const startRotation = Phaser.Math.FloatBetween(-0.3, 0.3);
        const endRotation = startRotation + Phaser.Math.FloatBetween(-2, 2);
        const size = Phaser.Math.Between(24, 48);

        // Alternate between $ and bill emoji for variety
        const symbol = Math.random() > 0.3 ? '$' : '\u{1F4B5}';
        const color = symbol === '$' ? '#00FF41' : '#FFFFFF';

        const money = scene.add.text(x, startY, symbol, {
          fontFamily: 'Georgia, serif',
          fontSize: `${size}px`,
          color: color,
          stroke: '#004400',
          strokeThickness: symbol === '$' ? 3 : 0,
          shadow: {
            offsetX: 1,
            offsetY: 1,
            color: '#000000',
            blur: 4,
            fill: true,
          },
        })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(depth)
          .setRotation(startRotation)
          .setAlpha(0.9);

        // Fall down with drift and rotation
        scene.tweens.add({
          targets: money,
          y: endY,
          x: x + xDrift,
          rotation: endRotation,
          duration: fallDuration + Phaser.Math.Between(-400, 400),
          ease: 'Quad.easeIn',
          onComplete: () => money.destroy(),
        });

        // Fade out near the end
        scene.tweens.add({
          targets: money,
          alpha: 0,
          duration: 600,
          delay: fallDuration - 800,
        });
      });
    }
  }

  // ─── PERSISTENCE ──────────────────────────────────────────────────

  private static save() {
    try { localStorage.setItem(SAVE_KEY, String(this.balance)); } catch { /* noop */ }
  }

  private static load() {
    try {
      const val = localStorage.getItem(SAVE_KEY);
      if (val) this.balance = parseInt(val, 10) || 0;
    } catch { /* noop */ }
  }

  private static saveMilestones() {
    try {
      const arr = Array.from(this.triggeredMilestones);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(arr));
    } catch { /* noop */ }
  }

  private static loadMilestones() {
    try {
      const val = localStorage.getItem(MILESTONES_KEY);
      if (val) {
        const arr = JSON.parse(val) as number[];
        this.triggeredMilestones = new Set(arr);
      }
    } catch { /* noop */ }
  }
}
