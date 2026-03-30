export class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** Short high beep for menu selection */
  static playBlip() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  /** Two-note confirm sound */
  static playConfirm() {
    const ctx = this.getCtx();

    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'triangle';
    osc1.frequency.value = 440;
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.05);

    // Second note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.value = 660;
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
    osc2.start(ctx.currentTime + 0.06);
    osc2.stop(ctx.currentTime + 0.11);
  }

  /** Low sweep for scene transitions */
  static playDoorOpen() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** Coin/cash register ding */
  static playCash() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /** Soft footstep — alternating pitch for L/R */
  private static stepToggle = false;
  static playFootstep() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    this.stepToggle = !this.stepToggle;
    osc.frequency.value = this.stepToggle ? 120 : 100;
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  /** Sparkle pickup — rising arpeggio */
  static playPickup() {
    const ctx = this.getCtx();
    const notes = [660, 880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.04;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.start(t);
      osc.stop(t + 0.06);
    });
  }

  /** Dialogue advance click */
  static playDialogueClick() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.025);
  }

  /** Impact thud for minigames */
  static playImpact() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /** Phone vibrate buzz */
  static playVibrate() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  /** Sharp warning beep for police/alert */
  static playAlert() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /** Cinematic swoosh for letterbox bars sliding in */
  static playCinematicSwoosh() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Red/blue police siren flash sound */
  static playPoliceSiren() {
    const ctx = this.getCtx();
    // Alternating high-low siren
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = i % 2 === 0 ? 700 : 500;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  /** Bright flash whoosh for freedom/release */
  static playFreedomFlash() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }

  /** Car engine/driving hint sound */
  static playCarDrive() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CASINO SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** Rising pitched whir for slot machine spinning */
  static slotSpin() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
  }

  /** Happy ascending notes C E G C for slot win */
  static slotWin() {
    const ctx = this.getCtx();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    });
  }

  /** Extended victory fanfare with tremolo for jackpot */
  static slotJackpot() {
    const ctx = this.getCtx();
    const notes = [523, 659, 784, 1047]; // C E G C high
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      lfo.frequency.value = 12; lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain); lfoGain.connect(gain.gain);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.3); lfo.start(t); lfo.stop(t + 0.3);
    });
  }

  /** Sad descending notes G E C for casino loss */
  static casinoLose() {
    const ctx = this.getCtx();
    const notes = [392, 330, 262]; // G4 E4 C4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    });
  }

  /** Quick click sound — white noise burst for chip stacking */
  static chipStack() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const gain = ctx.createGain();
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    src.start(ctx.currentTime);
  }

  /** Rattling noise for dice roll */
  static diceRoll() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.2;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 3000; filter.Q.value = 2;
    const gain = ctx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    src.start(ctx.currentTime);
  }

  /** Short snap for card flip */
  static cardFlip() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const gain = ctx.createGain();
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    src.start(ctx.currentTime);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CRYPTO SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** Ascending sweep for price pump */
  static pricePump() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  }

  /** Descending sweep for price dump */
  static priceDump() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  }

  /** Dramatic crash — low rumble + descending for rug pull */
  static rugPull() {
    const ctx = this.getCtx();
    // Low rumble
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.type = 'sawtooth'; osc1.frequency.value = 60;
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.5);
    // Descending screech
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    gain2.gain.setValueAtTime(0.04, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.5);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SOCIAL SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** iMessage-style ding — two quick high notes */
  static dmReceived() {
    const ctx = this.getCtx();
    [880, 1046].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    });
  }

  /** Sad trombone — descending Bb Ab G F */
  static fumble() {
    const ctx = this.getCtx();
    const notes = [466, 415, 392, 349]; // Bb4 Ab4 G4 F4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.18);
    });
  }

  /** Triumphant ding — ascending C major chord, fast */
  static success() {
    const ctx = this.getCtx();
    const notes = [523, 659, 784]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACHIEVEMENT SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** Sparkly ascending arpeggio C E G B C with shimmer */
  static achievementUnlock() {
    const ctx = this.getCtx();
    const notes = [523, 659, 784, 988, 1047]; // C5 E5 G5 B5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      // Add slight detune for shimmer
      osc.detune.value = Math.sin(i * 2) * 15;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MILESTONE SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** Cash register cha-ching — sharp attack high burst + low thump */
  static moneyRain() {
    const ctx = this.getCtx();
    // High cha-ching
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.type = 'sine'; osc1.frequency.value = 2400;
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.12);
    // Low thump
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime + 0.05); osc2.stop(ctx.currentTime + 0.2);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PARTY SOUNDS
  // ═══════════════════════════════════════════════════════════════════

  /** Quick burst of noise simulating crowd cheering */
  static crowdReact() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 0.5;
    const gain = ctx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    src.start(ctx.currentTime);
  }

  /** Crash sound — high frequency noise burst with fast decay */
  static glassBreak() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 4000;
    const gain = ctx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    src.start(ctx.currentTime);
  }

  /** Water splash — low noise with fast attack, medium decay */
  static splash() {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.25;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 600;
    const gain = ctx.createGain();
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src.start(ctx.currentTime);
  }

  /** Road/highway wind sound for road stretching effect */
  static playRoadWind() {
    const ctx = this.getCtx();
    // White noise burst for wind
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.5);
  }
}
