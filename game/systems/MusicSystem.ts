/**
 * Procedural synth music system — mood-matched ambient loops per chapter.
 * Uses Web Audio API with multiple oscillator layers (bass, pad, melody).
 * Each chapter has a unique vibe built from different waveforms, scales, and rhythms.
 * Volume is kept LOW (0.03-0.06 total) — this is background ambience.
 */

// ── Note frequencies ──────────────────────────────────────────────────────────

const NOTE: Record<string, number> = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00,
  'A1': 55.00, 'Bb1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'Ab2': 103.83, 'A2': 110.00,
  'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
  'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.26, 'F5': 698.46,
  'G5': 783.99,
  'R': 0,
};

// ── Layer definition ──────────────────────────────────────────────────────────

type LayerDef = {
  /** Note names from the NOTE table. 'R' = rest (silence). */
  notes: string[];
  /** Beats per minute for this layer. */
  bpm: number;
  /** Master gain for this layer (keep 0.005-0.03). */
  gain: number;
  /** Oscillator waveform. */
  wave: OscillatorType;
  /** Low-pass filter cutoff Hz. Lower = warmer/darker. */
  filterFreq: number;
  /** Filter Q (resonance). Keep 0.3-1.5. */
  filterQ?: number;
  /** Detune in cents — slight detuning adds warmth. */
  detune?: number;
  /** Note attack time constant (seconds). Higher = softer onset. */
  attack?: number;
  /** Note release time constant (seconds). Higher = longer tail. */
  release?: number;
};

type TrackDef = {
  layers: LayerDef[];
};

// ── Track definitions ─────────────────────────────────────────────────────────

const TRACKS: Record<string, TrackDef> = {

  // ── Menu: Atmospheric, ethereal, inviting. Sets the tone. ──────────────
  'menu': {
    layers: [
      // Pad — slow ethereal swells
      {
        notes: ['E3', 'R', 'G3', 'R', 'B3', 'R', 'A3', 'R',
                'G3', 'R', 'E3', 'R', 'D3', 'R', 'E3', 'R'],
        bpm: 30,
        gain: 0.012,
        wave: 'sine',
        filterFreq: 800,
        filterQ: 0.3,
        attack: 0.8,
        release: 0.6,
      },
      // High shimmer — distant sparkle
      {
        notes: ['R', 'R', 'B4', 'R', 'R', 'R', 'E5', 'R',
                'R', 'R', 'G4', 'R', 'R', 'R', 'D5', 'R'],
        bpm: 30,
        gain: 0.005,
        wave: 'sine',
        filterFreq: 2000,
        filterQ: 0.5,
        detune: 5,
        attack: 0.3,
        release: 1.0,
      },
    ],
  },

  // ── Ch1 Home: Warm, nostalgic — soft pads, gentle melody, slow. ────────
  'home': {
    layers: [
      // Bass pad — warm root notes
      {
        notes: ['G2', 'R', 'G2', 'R', 'C3', 'R', 'D3', 'R',
                'E3', 'R', 'D3', 'R', 'C3', 'R', 'G2', 'R'],
        bpm: 50,
        gain: 0.012,
        wave: 'sine',
        filterFreq: 400,
        filterQ: 0.4,
        attack: 0.6,
        release: 0.5,
      },
      // Melody — gentle nostalgic line
      {
        notes: ['G3', 'B3', 'D4', 'R', 'E4', 'D4', 'B3', 'R',
                'C4', 'B3', 'G3', 'R', 'A3', 'G3', 'E3', 'R'],
        bpm: 50,
        gain: 0.008,
        wave: 'sine',
        filterFreq: 1200,
        filterQ: 0.3,
        detune: 3,
        attack: 0.4,
        release: 0.4,
      },
      // Harmonic — warm overtone shimmer
      {
        notes: ['R', 'D4', 'R', 'R', 'R', 'G4', 'R', 'R',
                'R', 'E4', 'R', 'R', 'R', 'D4', 'R', 'R'],
        bpm: 50,
        gain: 0.004,
        wave: 'sine',
        filterFreq: 1600,
        filterQ: 0.5,
        detune: 1200,
        attack: 0.3,
        release: 0.8,
      },
    ],
  },

  // ── Ch2 Santa Barbara: Chill party — deeper bass, beach energy. ────────
  // Uses special playBeachAmbiance() + bass layer overlay
  'santa-barbara': {
    layers: [
      // Deep sub bass — party feel under the waves
      {
        notes: ['E2', 'R', 'E2', 'G2', 'R', 'A2', 'R', 'G2',
                'E2', 'R', 'B2', 'R', 'A2', 'R', 'G2', 'R'],
        bpm: 55,
        gain: 0.010,
        wave: 'sine',
        filterFreq: 200,
        filterQ: 0.6,
        attack: 0.5,
        release: 0.4,
      },
      // Mid pad — chill vibes
      {
        notes: ['R', 'R', 'E3', 'R', 'R', 'R', 'G3', 'R',
                'R', 'R', 'A3', 'R', 'R', 'R', 'B3', 'R'],
        bpm: 55,
        gain: 0.006,
        wave: 'triangle',
        filterFreq: 600,
        filterQ: 0.4,
        detune: 7,
        attack: 0.6,
        release: 0.6,
      },
    ],
  },

  // ── Ch3 Wrong Crowd: Dark, tense — minor key, ominous drone. ──────────
  'wrong-crowd': {
    layers: [
      // Low drone — constant unease
      {
        notes: ['E2', 'E2', 'E2', 'R', 'E2', 'E2', 'Eb2', 'R',
                'E2', 'E2', 'E2', 'R', 'D2', 'R', 'E2', 'R'],
        bpm: 40,
        gain: 0.015,
        wave: 'sine',
        filterFreq: 250,
        filterQ: 0.8,
        attack: 0.8,
        release: 0.3,
      },
      // Tension melody — sparse minor intervals
      {
        notes: ['R', 'R', 'R', 'G2', 'R', 'R', 'R', 'R',
                'R', 'R', 'R', 'Bb2', 'R', 'R', 'A2', 'R'],
        bpm: 40,
        gain: 0.008,
        wave: 'sine',
        filterFreq: 350,
        filterQ: 0.5,
        detune: -10,
        attack: 0.6,
        release: 0.8,
      },
      // High dissonant whisper — barely audible
      {
        notes: ['R', 'R', 'R', 'R', 'R', 'R', 'Bb3', 'R',
                'R', 'R', 'R', 'R', 'R', 'R', 'R', 'Ab3'],
        bpm: 40,
        gain: 0.003,
        wave: 'sawtooth',
        filterFreq: 500,
        filterQ: 1.0,
        attack: 0.4,
        release: 1.2,
      },
    ],
  },

  // ── Ch4 Locked Up: Sparse, cold — minimal, echoing, institutional. ────
  'jail': {
    layers: [
      // Deep institutional hum
      {
        notes: ['D2', 'R', 'R', 'R', 'F2', 'R', 'R', 'R',
                'D2', 'R', 'R', 'R', 'A1', 'R', 'R', 'R'],
        bpm: 30,
        gain: 0.014,
        wave: 'sine',
        filterFreq: 300,
        filterQ: 0.4,
        attack: 1.0,
        release: 0.8,
      },
      // Echoing single notes — sparse and cold
      {
        notes: ['R', 'R', 'R', 'R', 'R', 'A3', 'R', 'R',
                'R', 'R', 'R', 'R', 'R', 'R', 'F3', 'R'],
        bpm: 30,
        gain: 0.006,
        wave: 'sine',
        filterFreq: 600,
        filterQ: 0.3,
        detune: 700,
        attack: 0.2,
        release: 1.5,
      },
      // Faint metallic ring — jail ambience
      {
        notes: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
                'R', 'R', 'R', 'D4', 'R', 'R', 'R', 'R'],
        bpm: 30,
        gain: 0.003,
        wave: 'triangle',
        filterFreq: 1200,
        filterQ: 1.5,
        attack: 0.1,
        release: 2.0,
      },
    ],
  },

  // ── Ch5 Caymus: Earthy, working — acoustic feel, outdoor warmth. ──────
  'caymus': {
    layers: [
      // Root bass — steady, grounding
      {
        notes: ['G2', 'R', 'G2', 'R', 'C3', 'R', 'D3', 'R',
                'G2', 'R', 'G2', 'R', 'E3', 'R', 'D3', 'R'],
        bpm: 55,
        gain: 0.010,
        wave: 'triangle',
        filterFreq: 350,
        filterQ: 0.4,
        attack: 0.4,
        release: 0.3,
      },
      // Acoustic melody — warm and simple
      {
        notes: ['G3', 'A3', 'B3', 'R', 'D4', 'B3', 'A3', 'R',
                'G3', 'E3', 'G3', 'R', 'A3', 'B3', 'A3', 'R'],
        bpm: 55,
        gain: 0.008,
        wave: 'triangle',
        filterFreq: 900,
        filterQ: 0.3,
        attack: 0.2,
        release: 0.3,
      },
      // Pluck accent — like a string being picked
      {
        notes: ['R', 'R', 'R', 'D4', 'R', 'R', 'R', 'R',
                'R', 'R', 'R', 'G4', 'R', 'R', 'R', 'R'],
        bpm: 55,
        gain: 0.005,
        wave: 'triangle',
        filterFreq: 1400,
        filterQ: 0.8,
        attack: 0.05,
        release: 0.6,
      },
    ],
  },

  // ── Ch6 Come Up: Grinding, focused — lo-fi beats, late night energy. ──
  'come-up': {
    layers: [
      // Lo-fi bass — steady grind rhythm
      {
        notes: ['C3', 'R', 'C3', 'Eb3', 'R', 'G3', 'R', 'Eb3',
                'C3', 'R', 'C3', 'Eb3', 'R', 'F3', 'R', 'Eb3'],
        bpm: 65,
        gain: 0.012,
        wave: 'triangle',
        filterFreq: 500,
        filterQ: 0.5,
        attack: 0.3,
        release: 0.2,
      },
      // Rising melody — building momentum
      {
        notes: ['C3', 'E3', 'G3', 'R', 'A3', 'C4', 'R', 'G3',
                'E3', 'G3', 'A3', 'R', 'C4', 'E4', 'R', 'C4'],
        bpm: 65,
        gain: 0.008,
        wave: 'triangle',
        filterFreq: 1000,
        filterQ: 0.3,
        detune: 5,
        attack: 0.2,
        release: 0.3,
      },
      // Typing rhythm — faint percussive clicks at double time
      {
        notes: ['C5', 'R', 'E5', 'R', 'C5', 'R', 'R', 'D5',
                'R', 'C5', 'R', 'E5', 'R', 'R', 'C5', 'R'],
        bpm: 130,
        gain: 0.002,
        wave: 'square',
        filterFreq: 2000,
        filterQ: 0.3,
        attack: 0.01,
        release: 0.05,
      },
    ],
  },

  // ── Ch7 Operator: Confident, clean — modern synth, professional. ──────
  'operator': {
    layers: [
      // Clean bass — confident, steady
      {
        notes: ['E2', 'R', 'E2', 'R', 'A2', 'R', 'B2', 'R',
                'E2', 'R', 'E2', 'R', 'G2', 'R', 'A2', 'R'],
        bpm: 60,
        gain: 0.010,
        wave: 'sine',
        filterFreq: 350,
        filterQ: 0.4,
        attack: 0.4,
        release: 0.3,
      },
      // Smooth melody — assured, professional
      {
        notes: ['E3', 'G3', 'A3', 'B3', 'R', 'A3', 'G3', 'R',
                'E3', 'F#3', 'A3', 'R', 'B3', 'A3', 'G3', 'R'],
        bpm: 60,
        gain: 0.008,
        wave: 'sine',
        filterFreq: 1100,
        filterQ: 0.3,
        detune: 3,
        attack: 0.3,
        release: 0.4,
      },
      // City shimmer — modern, clean high tones
      {
        notes: ['R', 'R', 'R', 'R', 'E4', 'R', 'R', 'R',
                'R', 'R', 'R', 'R', 'B4', 'R', 'R', 'R'],
        bpm: 60,
        gain: 0.004,
        wave: 'triangle',
        filterFreq: 1800,
        filterQ: 0.5,
        detune: 700,
        attack: 0.15,
        release: 0.8,
      },
    ],
  },
};

// ── Active layer state ────────────────────────────────────────────────────────

type ActiveLayer = {
  oscillator: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
  interval: ReturnType<typeof setInterval>;
  def: LayerDef;
};

// ── MusicSystem ───────────────────────────────────────────────────────────────

export class MusicSystem {
  private static ctx: AudioContext | null = null;
  private static currentTrack = '';
  private static activeLayers: ActiveLayer[] = [];
  private static muted = false;
  // Beach-specific nodes
  private static beachNoise: AudioBufferSourceNode | null = null;
  private static beachGain: GainNode | null = null;
  private static beachFilter: BiquadFilterNode | null = null;
  private static beachTimeout: ReturnType<typeof setTimeout> | null = null;

  private static getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // ── Play ────────────────────────────────────────────────────────────────

  static play(trackName: string): void {
    if (this.currentTrack === trackName) return;
    this.stop();

    this.currentTrack = trackName;

    if (this.muted) return;

    const track = TRACKS[trackName];
    if (!track) return;

    const ctx = this.getCtx();

    // Santa Barbara gets wave noise underneath its oscillator layers
    if (trackName === 'santa-barbara') {
      this.startBeachNoise(ctx);
    }

    // Start each layer
    for (const layerDef of track.layers) {
      this.startLayer(ctx, layerDef);
    }
  }

  // ── Start a single oscillator layer ─────────────────────────────────────

  private static startLayer(ctx: AudioContext, def: LayerDef): void {
    const attack = def.attack ?? 0.3;
    const release = def.release ?? 0.3;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = def.filterFreq;
    filter.Q.value = def.filterQ ?? 0.5;

    // Gain
    const gain = ctx.createGain();
    gain.gain.value = 0; // start silent, first note will fade in

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = def.wave;
    osc.frequency.value = NOTE[def.notes[0]] || 220;
    if (def.detune) osc.detune.value = def.detune;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    // Note sequencer
    let noteIndex = -1; // will increment to 0 on first tick
    const msPerBeat = (60 / def.bpm) * 1000;

    const tick = () => {
      noteIndex = (noteIndex + 1) % def.notes.length;
      const freq = NOTE[def.notes[noteIndex]];
      const now = ctx.currentTime;

      if (freq === 0) {
        // Rest — fade to silence
        gain.gain.setTargetAtTime(0, now, release);
      } else {
        // Note — glide to frequency, fade in
        osc.frequency.setTargetAtTime(freq, now, attack * 0.5);
        gain.gain.setTargetAtTime(def.gain, now, attack * 0.3);
      }
    };

    // Fire first note immediately
    tick();

    const interval = setInterval(tick, msPerBeat);

    this.activeLayers.push({ oscillator: osc, gain, filter, interval, def });
  }

  // ── Beach wave noise (filtered white noise with volume swells) ──────────

  private static startBeachNoise(ctx: AudioContext): void {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 0.7;

    const smoothFilter = ctx.createBiquadFilter();
    smoothFilter.type = 'lowpass';
    smoothFilter.frequency.value = 400;
    smoothFilter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.018;

    noise.connect(filter);
    filter.connect(smoothFilter);
    smoothFilter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.beachNoise = noise;
    this.beachGain = gain;
    this.beachFilter = filter;

    // Wave rhythm — slow volume swells
    const waveRhythm = () => {
      if (!this.beachGain || this.currentTrack !== 'santa-barbara') return;
      const now = ctx.currentTime;
      this.beachGain.gain.setTargetAtTime(0.035, now, 2.0);
      this.beachGain.gain.setTargetAtTime(0.010, now + 4, 2.5);

      if (this.beachFilter) {
        this.beachFilter.frequency.setTargetAtTime(350, now, 1.5);
        this.beachFilter.frequency.setTargetAtTime(250, now + 4, 2.0);
      }

      this.beachTimeout = setTimeout(waveRhythm, 6000 + Math.random() * 4000);
    };
    waveRhythm();
  }

  // ── Stop ────────────────────────────────────────────────────────────────

  static stop(): void {
    // Stop all oscillator layers
    for (const layer of this.activeLayers) {
      clearInterval(layer.interval);
      try { layer.oscillator.stop(); } catch { /* already stopped */ }
      layer.gain.disconnect();
      layer.filter.disconnect();
    }
    this.activeLayers = [];

    // Stop beach noise
    if (this.beachTimeout) {
      clearTimeout(this.beachTimeout);
      this.beachTimeout = null;
    }
    if (this.beachNoise) {
      try { this.beachNoise.stop(); } catch { /* already stopped */ }
      this.beachNoise = null;
    }
    if (this.beachGain) {
      this.beachGain.disconnect();
      this.beachGain = null;
    }
    if (this.beachFilter) {
      this.beachFilter.disconnect();
      this.beachFilter = null;
    }

    this.currentTrack = '';
  }

  // ── Volume / Mute ──────────────────────────────────────────────────────

  static setVolume(vol: number): void {
    for (const layer of this.activeLayers) {
      layer.gain.gain.value = vol;
    }
  }

  static toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stop();
    }
    return this.muted;
  }

  static isMuted(): boolean {
    return this.muted;
  }
}
