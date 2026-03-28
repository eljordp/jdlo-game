import { MoodSystem, Mood } from './MoodSystem';

// Substance levels
export type IntoxicationLevel = 'sober' | 'buzzed' | 'drunk' | 'wasted' | 'blacked_out';
export type HighLevel = 'sober' | 'light' | 'faded' | 'cooked';
export type PostNutState = 'none' | 'active';  // 60-sec cooldown

export class SubstanceSystem {
  // Running tallies (persist within a scene/chapter)
  private static drinks: number = 0;          // 1=buzzed, 3=drunk, 5+=wasted
  private static hits: number = 0;            // 1=light, 2=faded, 4+=cooked
  private static nutCount: number = 0;        // triggers post-nut tired state
  private static postNutTimer: number = 0;    // countdown in ms (60000 = 60s)

  // Decay timers — substances wear off over time
  private static drinkDecayTimer: number = 0;
  private static hitDecayTimer: number = 0;

  // Stumble system
  private static stumbleTimer: number = 0;
  private static isStumbling: boolean = false;

  // ── Public API ──

  /** Call when JP takes a drink (shot, beer, etc) */
  static drink(): void {
    this.drinks++;
    this.drinkDecayTimer = 0; // reset decay
    this.recalculate();
  }

  /** Call when JP takes a hit (weed, cart, blinker, bong) */
  static hit(potency: number = 1): void {
    // potency: 1=joint/blunt, 2=bong, 3=cart/blinker
    this.hits += potency;
    this.hitDecayTimer = 0;
    this.recalculate();
  }

  /** Call when JP nuts (gooning, bedroom scenes, etc) */
  static nut(): void {
    this.nutCount++;
    this.postNutTimer = 60000; // 60 second cooldown
    this.recalculate();
  }

  /** Call when JP does something hype (wins minigame, closes deal) */
  static hype(): void {
    // Hype cuts through intoxication slightly
    if (this.drinks > 0) this.drinks = Math.max(0, this.drinks - 1);
    this.recalculate();
  }

  // ── Getters ──

  static getDrinkLevel(): IntoxicationLevel {
    if (this.drinks === 0) return 'sober';
    if (this.drinks <= 2) return 'buzzed';
    if (this.drinks <= 4) return 'drunk';
    if (this.drinks <= 6) return 'wasted';
    return 'blacked_out';
  }

  static getHighLevel(): HighLevel {
    if (this.hits === 0) return 'sober';
    if (this.hits <= 1) return 'light';
    if (this.hits <= 3) return 'faded';
    return 'cooked';
  }

  static isPostNut(): boolean {
    return this.postNutTimer > 0;
  }

  static getDrinks(): number { return this.drinks; }
  static getHits(): number { return this.hits; }

  static isCrossfaded(): boolean {
    return this.getDrinkLevel() !== 'sober' && this.getHighLevel() !== 'sober';
  }

  /** Get a stumble chance per movement tick (0-1). Higher = more likely to stumble. */
  static getStumbleChance(): number {
    const drunk = this.getDrinkLevel();
    const high = this.getHighLevel();
    let chance = 0;
    if (drunk === 'drunk') chance += 0.05;
    if (drunk === 'wasted') chance += 0.15;
    if (drunk === 'blacked_out') chance += 0.3;
    if (high === 'cooked') chance += 0.05;
    if (this.isCrossfaded()) chance += 0.08;
    if (this.isPostNut()) chance += 0.03;
    return Math.min(chance, 0.4);
  }

  /** Check if player should stumble this frame. Call from movement code. */
  static shouldStumble(): boolean {
    const chance = this.getStumbleChance();
    if (chance <= 0) return false;
    return Math.random() < chance;
  }

  // ── Frame Update ──

  static update(delta: number): void {
    // Post-nut cooldown
    if (this.postNutTimer > 0) {
      this.postNutTimer -= delta;
      if (this.postNutTimer <= 0) {
        this.postNutTimer = 0;
        this.recalculate();
      }
    }

    // Drink decay: 1 drink wears off every 90 seconds
    this.drinkDecayTimer += delta;
    if (this.drinkDecayTimer >= 90000 && this.drinks > 0) {
      this.drinkDecayTimer = 0;
      this.drinks--;
      this.recalculate();
    }

    // Hit decay: 1 hit wears off every 120 seconds
    this.hitDecayTimer += delta;
    if (this.hitDecayTimer >= 120000 && this.hits > 0) {
      this.hitDecayTimer = 0;
      this.hits--;
      this.recalculate();
    }
  }

  // ── Core: Auto-calculate mood from combined state ──

  private static recalculate(): void {
    const drunk = this.getDrinkLevel();
    const high = this.getHighLevel();
    const postNut = this.isPostNut();
    const crossfaded = this.isCrossfaded();

    // Priority: post-nut > blacked_out > crossfaded > wasted > faded > drunk > buzzed > sober

    // Post-nut = tired, overrides everything temporarily
    if (postNut) {
      MoodSystem.setMood('tired', 60);
      return;
    }

    // Blackout = tired (pass out)
    if (drunk === 'blacked_out') {
      MoodSystem.setMood('tired', 120);
      return;
    }

    // Crossfaded = faded with extended duration (strongest combo)
    if (crossfaded) {
      MoodSystem.setMood('faded', 180);
      return;
    }

    // Wasted = faded (heavy drunk)
    if (drunk === 'wasted') {
      MoodSystem.setMood('faded', 120);
      return;
    }

    // Faded/cooked on weed
    if (high === 'faded' || high === 'cooked') {
      MoodSystem.setMood('faded', 120);
      return;
    }

    // Drunk = vibing but sloppy
    if (drunk === 'drunk') {
      MoodSystem.setMood('vibing', 90);
      return;
    }

    // Light high
    if (high === 'light') {
      MoodSystem.setMood('vibing', 60);
      return;
    }

    // Buzzed = vibing
    if (drunk === 'buzzed') {
      MoodSystem.setMood('vibing', 60);
      return;
    }

    // Nothing active = sober
    MoodSystem.setMood('sober');
  }

  /** Get text description for dialogue/HUD */
  static getStatusText(): string {
    const drunk = this.getDrinkLevel();
    const high = this.getHighLevel();
    const postNut = this.isPostNut();

    if (postNut) return 'post-nut clarity';
    if (this.isCrossfaded()) return 'crossfaded';
    if (drunk === 'blacked_out') return 'blacked out';
    if (drunk === 'wasted') return 'wasted';
    if (high === 'cooked') return 'cooked';
    if (high === 'faded') return 'faded';
    if (drunk === 'drunk') return 'drunk';
    if (high === 'light') return 'light buzz';
    if (drunk === 'buzzed') return 'buzzed';
    return 'sober';
  }

  /** Slur text based on intoxication level. Makes dialogue wobbly. */
  static slurText(text: string): string {
    const drunk = this.getDrinkLevel();
    if (drunk === 'sober' || drunk === 'buzzed') return text;

    let result = text;

    if (drunk === 'drunk') {
      // Occasional double letters and typos
      result = result.replace(/s/g, (m) => Math.random() < 0.3 ? 'ss' : m);
      result = result.replace(/\./g, (m) => Math.random() < 0.4 ? '...' : m);
    }

    if (drunk === 'wasted' || drunk === 'blacked_out') {
      // Heavy slurring
      result = result.replace(/s/g, (m) => Math.random() < 0.5 ? 'shh' : m);
      result = result.replace(/th/gi, (m) => Math.random() < 0.4 ? 'fff' : m);
      result = result.replace(/\b(\w)/g, (m) => Math.random() < 0.15 ? m + m : m);
      result = result.replace(/\./g, '...');
      result = result.replace(/!/g, Math.random() < 0.5 ? '!!' : '!');
    }

    return result;
  }

  /** Full reset — call on scene change or game restart */
  static reset(): void {
    this.drinks = 0;
    this.hits = 0;
    this.nutCount = 0;
    this.postNutTimer = 0;
    this.drinkDecayTimer = 0;
    this.hitDecayTimer = 0;
    this.stumbleTimer = 0;
    this.isStumbling = false;
  }
}
