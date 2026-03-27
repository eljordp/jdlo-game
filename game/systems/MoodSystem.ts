import Phaser from 'phaser';

// ── Mood Types ───────────────────────────────────────────────────

export type Mood = 'sober' | 'faded' | 'locked_in' | 'vibing' | 'hyped' | 'tired';

interface MoodConfig {
  speedMultiplier: number;
  defaultDuration: number; // seconds
  icon: string;
  moraleChange: number; // how this mood affects morale (-1 to +1 scale, applied once on set)
}

const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  sober:     { speedMultiplier: 1.0, defaultDuration: 0,   icon: '',                         moraleChange: 0 },
  faded:     { speedMultiplier: 1.3, defaultDuration: 60,  icon: '\uD83C\uDF2C\uFE0F',      moraleChange: 0 },     // chillin, no morale hit
  locked_in: { speedMultiplier: 0.8, defaultDuration: 45,  icon: '\uD83D\uDD25',             moraleChange: 15 },    // morale boost
  vibing:    { speedMultiplier: 1.0, defaultDuration: 30,  icon: '\uD83C\uDFB5',             moraleChange: 5 },     // slight boost
  hyped:     { speedMultiplier: 0.7, defaultDuration: 20,  icon: '\u26A1',                   moraleChange: 20 },    // big boost
  tired:     { speedMultiplier: 1.4, defaultDuration: 120, icon: '\uD83D\uDE34',             moraleChange: -20 },   // slow + morale hit
};

// ── Mood System (Singleton) ──────────────────────────────────────

export class MoodSystem {
  private static currentMood: Mood = 'sober';
  private static remainingMs: number = 0;
  private static hudIcon: Phaser.GameObjects.Text | null = null;
  private static hudBg: Phaser.GameObjects.Rectangle | null = null;

  // Morale: 0-100 scale. Affects minigame difficulty + NPC dialogue quality.
  // 50 = baseline. >70 = NPCs give respect. <30 = NPCs sense something off.
  private static morale: number = 50;
  private static moraleText: Phaser.GameObjects.Text | null = null;

  // Visual effect objects
  private static wobbleOffset: number = 0;
  private static wobbleTime: number = 0;
  private static smokeTrailTimer: number = 0;
  private static noteTimer: number = 0;
  private static glowCircle: Phaser.GameObjects.Arc | null = null;
  private static warmTint: Phaser.GameObjects.Rectangle | null = null;
  private static bounceTime: number = 0;

  // Track which scene we initialized for (to clean up on scene change)
  private static activeScene: Phaser.Scene | null = null;

  // ── Public API ─────────────────────────────────────────────────

  static setMood(mood: Mood, durationSeconds?: number): void {
    const config = MOOD_CONFIGS[mood];
    const duration = (durationSeconds ?? config.defaultDuration) * 1000;

    // If already in this mood, extend instead of resetting
    if (this.currentMood === mood && mood !== 'sober') {
      this.remainingMs += duration;
      return;
    }

    // Clean up previous mood effects
    this.cleanupEffects();

    this.currentMood = mood;
    this.remainingMs = duration;

    // Apply morale change
    this.changeMorale(config.moraleChange);

    // Reset timers
    this.wobbleTime = 0;
    this.smokeTrailTimer = 0;
    this.noteTimer = 0;
    this.bounceTime = 0;

    this.updateHUD();
  }

  static getMood(): Mood {
    return this.currentMood;
  }

  static isFaded(): boolean {
    return this.currentMood === 'faded';
  }

  static isLockedIn(): boolean {
    return this.currentMood === 'locked_in';
  }

  static isVibing(): boolean {
    return this.currentMood === 'vibing';
  }

  static isHyped(): boolean {
    return this.currentMood === 'hyped';
  }

  static isSober(): boolean {
    return this.currentMood === 'sober';
  }

  static isTired(): boolean {
    return this.currentMood === 'tired';
  }

  // ── Morale API ──────────────────────────────────────────────────

  /** Get current morale (0-100). 50 = baseline. */
  static getMorale(): number {
    return this.morale;
  }

  /** Change morale by amount. Clamped 0-100. */
  static changeMorale(amount: number): void {
    this.morale = Math.max(0, Math.min(100, this.morale + amount));
  }

  /** Morale affects minigame difficulty. Returns multiplier (0.7 = harder, 1.3 = easier). */
  static getMoraleMultiplier(): number {
    if (this.morale >= 70) return 1.2;  // high morale = minigames easier
    if (this.morale >= 40) return 1.0;  // normal
    if (this.morale >= 20) return 0.85; // low morale = harder
    return 0.7;                          // very low = much harder
  }

  /** Check morale level for NPC dialogue branching */
  static moraleIsHigh(): boolean { return this.morale >= 70; }
  static moraleIsLow(): boolean { return this.morale < 30; }

  static getSpeedMultiplier(): number {
    return MOOD_CONFIGS[this.currentMood].speedMultiplier;
  }

  static extendMood(seconds: number): void {
    if (this.currentMood !== 'sober') {
      this.remainingMs += seconds * 1000;
    }
  }

  static getRemainingSeconds(): number {
    return Math.ceil(this.remainingMs / 1000);
  }

  // ── Frame Update ───────────────────────────────────────────────

  static update(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
    // Track active scene for cleanup
    if (this.activeScene !== scene) {
      this.activeScene = scene;
      this.hudIcon = null;
      this.hudBg = null;
      this.glowCircle = null;
      this.warmTint = null;
    }

    const delta = scene.game.loop.delta;

    // Count down mood timer
    if (this.currentMood !== 'sober' && this.remainingMs > 0) {
      this.remainingMs -= delta;

      if (this.remainingMs <= 0) {
        this.remainingMs = 0;
        // Hyped drops to locked_in instead of sober
        if (this.currentMood === 'hyped') {
          this.cleanupEffects();
          this.currentMood = 'locked_in';
          this.remainingMs = MOOD_CONFIGS.locked_in.defaultDuration * 1000;
        } else {
          this.cleanupEffects();
          this.currentMood = 'sober';
        }
        this.updateHUD();
      }
    }

    // Apply per-frame visual effects based on current mood
    switch (this.currentMood) {
      case 'faded':
        this.updateFadedEffects(scene, player, delta);
        break;
      case 'locked_in':
        this.updateLockedInEffects(scene, player);
        break;
      case 'vibing':
        this.updateVibingEffects(scene, player, delta);
        break;
      case 'hyped':
        this.updateHypedEffects(scene, player);
        break;
    }

    // Keep HUD updated
    this.ensureHUD(scene);
  }

  // ── Faded Effects ──────────────────────────────────────────────
  // Subtle camera wobble + smoke trail particles

  private static updateFadedEffects(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, delta: number): void {
    // Camera wobble: very subtle +-1px oscillation
    this.wobbleTime += delta * 0.003;
    this.wobbleOffset = Math.sin(this.wobbleTime) * 1;
    scene.cameras.main.setFollowOffset(this.wobbleOffset, Math.cos(this.wobbleTime * 0.7) * 0.5);

    // Smoke trail: spawn a small grey circle behind player periodically
    this.smokeTrailTimer += delta;
    if (this.smokeTrailTimer > 400) {
      this.smokeTrailTimer = 0;

      const puff = scene.add.circle(
        player.x + (Math.random() * 6 - 3),
        player.y + 5,
        2 + Math.random() * 1.5,
        0x999999,
        0.3,
      ).setDepth(player.depth - 1);

      scene.tweens.add({
        targets: puff,
        y: puff.y - 15 - Math.random() * 10,
        x: puff.x + (Math.random() * 8 - 4),
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 800 + Math.random() * 400,
        onComplete: () => puff.destroy(),
      });
    }
  }

  // ── Locked In Effects ──────────────────────────────────────────
  // Subtle golden glow behind player

  private static updateLockedInEffects(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
    if (!this.glowCircle || !this.glowCircle.active) {
      this.glowCircle = scene.add.circle(player.x, player.y, 24, 0xf0c040, 0.08)
        .setDepth(player.depth - 1);
    }
    // Follow player
    this.glowCircle.setPosition(player.x, player.y + 2);
  }

  // ── Vibing Effects ─────────────────────────────────────────────
  // Music note particles + subtle sprite bounce

  private static updateVibingEffects(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, delta: number): void {
    // Music note particles every ~1.2 seconds
    this.noteTimer += delta;
    if (this.noteTimer > 1200) {
      this.noteTimer = 0;
      const notes = ['\u266A', '\u266B'];
      const note = notes[Math.floor(Math.random() * notes.length)];
      const noteText = scene.add.text(
        player.x + (Math.random() * 16 - 8),
        player.y - 20,
        note,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        },
      ).setOrigin(0.5).setDepth(player.depth + 1).setAlpha(0.7);

      scene.tweens.add({
        targets: noteText,
        y: noteText.y - 30 - Math.random() * 15,
        x: noteText.x + (Math.random() * 20 - 10),
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        onComplete: () => noteText.destroy(),
      });
    }

    // Subtle bounce: +-1px y oscillation on the sprite
    this.bounceTime += delta * 0.008;
    const bounceY = Math.sin(this.bounceTime) * 1;
    // We adjust via the scene camera follow offset to avoid fighting movement tweens
    // Actually, we do a very small y offset addition — but since player position is tween-controlled,
    // we use a child approach: set originY slightly
    // Simplest: we won't move the player directly. The bounce is visual only through a tiny origin shift.
    // This is safe because the origin doesn't affect collision position.
    const baseOriginY = 0.5;
    player.setOrigin(0.5, baseOriginY + bounceY * 0.02);
  }

  // ── Hyped Effects ──────────────────────────────────────────────
  // Warm screen tint + faster sprint particles

  private static updateHypedEffects(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
    // Warm tint overlay (very subtle)
    if (!this.warmTint || !this.warmTint.active) {
      const cam = scene.cameras.main;
      this.warmTint = scene.add.rectangle(
        cam.width / 2, cam.height / 2, cam.width, cam.height,
        0xff8800, 0.04,
      ).setScrollFactor(0).setDepth(300).setBlendMode(Phaser.BlendModes.ADD);
    }

    // Golden glow (inherited from locked_in)
    if (!this.glowCircle || !this.glowCircle.active) {
      this.glowCircle = scene.add.circle(player.x, player.y, 28, 0xf0c040, 0.12)
        .setDepth(player.depth - 1);
    }
    this.glowCircle.setPosition(player.x, player.y + 2);
  }

  // ── HUD ────────────────────────────────────────────────────────

  private static ensureHUD(scene: Phaser.Scene): void {
    const config = MOOD_CONFIGS[this.currentMood];
    const icon = config.icon;

    if (this.currentMood === 'sober') {
      // Remove HUD if sober
      if (this.hudIcon && this.hudIcon.active) {
        this.hudIcon.destroy();
        this.hudIcon = null;
      }
      if (this.hudBg && this.hudBg.active) {
        this.hudBg.destroy();
        this.hudBg = null;
      }
      return;
    }

    // Create HUD elements if missing
    if (!this.hudBg || !this.hudBg.active) {
      this.hudBg = scene.add.rectangle(28, 56, 40, 40, 0x000000, 0.5)
        .setScrollFactor(0).setDepth(350);
    }
    if (!this.hudIcon || !this.hudIcon.active) {
      this.hudIcon = scene.add.text(28, 56, icon, {
        fontSize: '20px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(351);
    }

    // Update icon text in case mood changed
    this.hudIcon.setText(icon);
  }

  private static updateHUD(): void {
    if (this.hudIcon && this.hudIcon.active) {
      if (this.currentMood === 'sober') {
        this.hudIcon.destroy();
        this.hudIcon = null;
        if (this.hudBg && this.hudBg.active) {
          this.hudBg.destroy();
          this.hudBg = null;
        }
      } else {
        this.hudIcon.setText(MOOD_CONFIGS[this.currentMood].icon);
      }
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────

  private static cleanupEffects(): void {
    // Reset camera wobble
    if (this.activeScene) {
      this.activeScene.cameras.main.setFollowOffset(0, 0);
    }

    // Destroy glow
    if (this.glowCircle && this.glowCircle.active) {
      this.glowCircle.destroy();
      this.glowCircle = null;
    }

    // Destroy warm tint
    if (this.warmTint && this.warmTint.active) {
      this.warmTint.destroy();
      this.warmTint = null;
    }

    // Reset player origin if vibing
    // (Will be handled naturally when mood changes since updateVibingEffects stops running)
  }

  /** Full reset — call on game restart or scene teardown */
  static reset(): void {
    this.cleanupEffects();
    this.currentMood = 'sober';
    this.remainingMs = 0;
    this.wobbleTime = 0;
    this.smokeTrailTimer = 0;
    this.noteTimer = 0;
    this.bounceTime = 0;

    if (this.hudIcon && this.hudIcon.active) {
      this.hudIcon.destroy();
      this.hudIcon = null;
    }
    if (this.hudBg && this.hudBg.active) {
      this.hudBg.destroy();
      this.hudBg = null;
    }

    this.activeScene = null;
  }
}
