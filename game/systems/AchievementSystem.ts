// ─── ACHIEVEMENT / BADGE SYSTEM ─────────────────────────────────────
// Tracks and displays achievement badges. Persisted to localStorage.
// Static singleton — call from anywhere.
// ─────────────────────────────────────────────────────────────────────

import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';

const SAVE_KEY = 'jdlo-achievements';

// ─── Achievement Definitions ────────────────────────────────────────

export type AchievementCategory = 'money' | 'casino' | 'crypto' | 'social' | 'gameplay';

export interface AchievementDef {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  category: AchievementCategory;
  rare?: boolean; // rare = camera shake on unlock
}

const ACHIEVEMENTS: AchievementDef[] = [
  // MONEY
  { id: 'first_band',    name: 'First Band',       subtitle: 'Earn $1,000 total',               icon: '\u{1F4B0}', category: 'money' },
  { id: '10_bands',      name: '10 Bands',         subtitle: 'Earn $10,000',                    icon: '\u{1F4B5}', category: 'money', rare: true },
  { id: 'six_figures',   name: 'Six Figures',       subtitle: 'Earn $100,000',                   icon: '\u{1F451}', category: 'money', rare: true },

  // CASINO
  { id: 'jackpot_king',  name: 'Jackpot King',      subtitle: 'Hit 3-match on slots',            icon: '\u{1F3B0}', category: 'casino', rare: true },
  { id: 'card_counter',  name: 'Card Counter',      subtitle: 'Win 5 blackjack hands',           icon: '\u{1F0CF}', category: 'casino' },
  { id: 'lucky_7',       name: 'Lucky 7',           subtitle: 'Win 3 dice games in a row',       icon: '\u{1F3B2}', category: 'casino' },
  { id: 'degenerate',    name: 'Degenerate',        subtitle: 'Lose $500 in one casino session',  icon: '\u{1F4B8}', category: 'casino' },
  { id: 'house_money',   name: 'House Money',       subtitle: 'Profit $1,000+ from casino',      icon: '\u{1F911}', category: 'casino', rare: true },

  // CRYPTO
  { id: 'diamond_hands', name: 'Diamond Hands',     subtitle: 'Hold through a >30% crash',       icon: '\u{1F48E}', category: 'crypto', rare: true },
  { id: 'paper_hands',   name: 'Paper Hands',       subtitle: 'Panic sell during a crash',        icon: '\u{1F4C4}', category: 'crypto' },
  { id: 'to_the_moon',   name: 'To The Moon',       subtitle: 'Portfolio hits $10,000',           icon: '\u{1F680}', category: 'crypto', rare: true },

  // SOCIAL
  { id: '0_for_5',       name: '0 for 5',           subtitle: 'Fumble 5 girls',                  icon: '\u{1F62C}', category: 'social' },
  { id: 'smooth_operator', name: 'Smooth Operator', subtitle: 'Succeed with 3 girls',            icon: '\u{1F60E}', category: 'social' },
  { id: 'left_on_read',  name: 'Left on Read',      subtitle: 'Get left on read in DMs',         icon: '\u{1F4F1}', category: 'social' },
  { id: 'plug_connected', name: 'Plug Connected',   subtitle: 'Interact with plug in every chapter', icon: '\u{1F50C}', category: 'social', rare: true },

  // GAMEPLAY
  { id: 'completionist', name: 'Completionist',     subtitle: 'Interact with every item in a chapter', icon: '\u{2705}', category: 'gameplay' },
  { id: 'speed_runner',  name: 'Speed Runner',      subtitle: 'Complete a chapter in under 3 min',     icon: '\u{26A1}', category: 'gameplay', rare: true },
  { id: 'faded_247',     name: 'Faded 24/7',        subtitle: 'Stay faded for 60+ seconds',            icon: '\u{1F32C}\u{FE0F}', category: 'gameplay' },
  { id: 'sober_sally',   name: 'Sober Sally',       subtitle: 'Complete a chapter without substances',  icon: '\u{1F9CA}', category: 'gameplay' },
  { id: 'the_whole_story', name: 'The Whole Story', subtitle: 'Beat all 7 chapters',                   icon: '\u{1F3C6}', category: 'gameplay', rare: true },
  { id: 'konami_found',    name: 'Old School',      subtitle: 'You know the code',                     icon: '\u{1F579}\u{FE0F}', category: 'gameplay', rare: true },
];

// ─── Achievement System ─────────────────────────────────────────────

export class AchievementSystem {
  private static unlocked: Set<string> = new Set();
  private static initialized = false;
  private static scene: Phaser.Scene | null = null;
  private static toastActive = false;
  private static toastQueue: AchievementDef[] = [];

  // ── Tracking counters (session-level, not persisted) ──
  static blackjackWins = 0;
  static diceWinStreak = 0;
  static casinoSessionLoss = 0;
  static casinoSessionProfit = 0;
  static flirtSuccesses = 0;
  static plugChapters: Set<string> = new Set();
  static fadedTimer = 0;        // ms spent in faded mood
  static usedSubstance = false;  // did player smoke/drink this chapter
  static chapterStartTime = 0;  // timestamp when chapter started

  // ── Init / Persistence ────────────────────────────────────────────

  private static init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        arr.forEach(id => this.unlocked.add(id));
      }
    } catch { /* noop */ }
  }

  private static save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify([...this.unlocked]));
    } catch { /* noop */ }
  }

  // ── Public API ────────────────────────────────────────────────────

  /** Attach a scene reference for rendering toasts */
  static attachScene(scene: Phaser.Scene) {
    this.init();
    this.scene = scene;
  }

  /** Check if condition is met and unlock the achievement */
  static check(id: string, condition?: boolean) {
    this.init();
    if (this.unlocked.has(id)) return;
    if (condition === false) return;
    // If condition is undefined or true, unlock
    this.unlock(id);
  }

  /** Force unlock an achievement */
  static unlock(id: string) {
    this.init();
    if (this.unlocked.has(id)) return;

    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;

    this.unlocked.add(id);
    this.save();

    // Queue toast
    if (this.scene) {
      this.toastQueue.push(def);
      if (!this.toastActive) {
        this.showNextToast();
      }
    }
  }

  /** Get all unlocked achievement IDs */
  static getUnlocked(): AchievementDef[] {
    this.init();
    return ACHIEVEMENTS.filter(a => this.unlocked.has(a.id));
  }

  /** Get all achievements with locked/unlocked state */
  static getAll(): (AchievementDef & { unlocked: boolean })[] {
    this.init();
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: this.unlocked.has(a.id) }));
  }

  /** Check if a specific achievement is unlocked */
  static isUnlocked(id: string): boolean {
    this.init();
    return this.unlocked.has(id);
  }

  /** Reset chapter-level trackers (call at start of each chapter) */
  static resetChapterTrackers() {
    this.casinoSessionLoss = 0;
    this.casinoSessionProfit = 0;
    this.fadedTimer = 0;
    this.usedSubstance = false;
    this.chapterStartTime = Date.now();
  }

  /** Update faded timer — call from BaseChapterScene update() */
  static updateFadedTimer(delta: number, isFaded: boolean) {
    if (isFaded) {
      this.fadedTimer += delta;
      if (this.fadedTimer >= 60000) {
        this.check('faded_247');
      }
    }
  }

  /** Track substance use for sober sally */
  static trackSubstanceUse() {
    this.usedSubstance = true;
  }

  /** Check speed runner — call when chapter completes */
  static checkSpeedRunner() {
    if (this.chapterStartTime > 0) {
      const elapsed = Date.now() - this.chapterStartTime;
      if (elapsed < 180_000) { // 3 minutes
        this.check('speed_runner');
      }
    }
  }

  /** Check sober sally — call when chapter completes */
  static checkSoberSally() {
    if (!this.usedSubstance) {
      this.check('sober_sally');
    }
  }

  // ── Casino tracking helpers ───────────────────────────────────────

  static trackBlackjackWin() {
    this.blackjackWins++;
    this.check('card_counter', this.blackjackWins >= 5);
  }

  static trackDiceWin() {
    this.diceWinStreak++;
    this.check('lucky_7', this.diceWinStreak >= 3);
  }

  static trackDiceLoss() {
    this.diceWinStreak = 0;
  }

  static trackCasinoLoss(amount: number) {
    this.casinoSessionLoss += amount;
    this.check('degenerate', this.casinoSessionLoss >= 500);
  }

  static trackCasinoProfit(amount: number) {
    this.casinoSessionProfit += amount;
    this.check('house_money', this.casinoSessionProfit >= 1000);
  }

  // ── Social tracking helpers ───────────────────────────────────────

  static trackFumble(totalFumbles: number) {
    this.check('0_for_5', totalFumbles >= 5);
  }

  static trackFlirtSuccess() {
    this.flirtSuccesses++;
    this.check('smooth_operator', this.flirtSuccesses >= 3);
  }

  static trackLeftOnRead() {
    this.check('left_on_read');
  }

  static trackPlugInteraction(chapterKey: string) {
    this.plugChapters.add(chapterKey);
    this.check('plug_connected', this.plugChapters.size >= 7);
  }

  // ── Money tracking ────────────────────────────────────────────────

  static checkMoneyAchievements(balance: number) {
    this.check('first_band', balance >= 1000);
    this.check('10_bands', balance >= 10000);
    this.check('six_figures', balance >= 100000);
  }

  // ── Toast Notification System ─────────────────────────────────────

  private static showNextToast() {
    if (this.toastQueue.length === 0) {
      this.toastActive = false;
      return;
    }

    this.toastActive = true;
    const def = this.toastQueue.shift()!;
    const scene = this.scene;
    if (!scene || !scene.scene.isActive()) {
      this.toastActive = false;
      return;
    }

    const cx = GAME_WIDTH / 2;
    const startY = -60;
    const targetY = 40;

    // Gold banner background
    const bg = scene.add.rectangle(cx, startY, 360, 50, 0x1a1400)
      .setScrollFactor(0).setDepth(999).setStrokeStyle(2, 0xf0c040);

    // Badge icon
    const icon = scene.add.text(cx - 155, startY, def.icon, {
      fontSize: '22px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    // Achievement name
    const name = scene.add.text(cx - 10, startY - 8, def.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    // Subtitle
    const subtitle = scene.add.text(cx - 10, startY + 10, def.subtitle, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#c0a030',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    // "ACHIEVEMENT" label
    const label = scene.add.text(cx + 155, startY, '\u{1F3C5}', {
      fontSize: '18px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const elements = [bg, icon, name, subtitle, label];

    // Camera shake on rare achievements
    if (def.rare) {
      scene.time.delayedCall(300, () => {
        scene.cameras.main.shake(400, 0.015);
      });
    }

    // Slide in from top
    scene.tweens.add({
      targets: elements,
      y: `+=${targetY - startY}`,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold for 3 seconds, then slide back up
        scene.time.delayedCall(3000, () => {
          scene.tweens.add({
            targets: elements,
            y: `-=${targetY - startY}`,
            duration: 400,
            ease: 'Quad.easeIn',
            onComplete: () => {
              elements.forEach(e => e.destroy());
              this.showNextToast();
            },
          });
        });
      },
    });
  }
}
