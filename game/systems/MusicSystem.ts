/**
 * Procedural lo-fi music system using Web Audio API.
 * Generates looping ambient tracks for each chapter — no audio files needed.
 * Uses ADSR envelopes, low-pass filters, vibrato, and soft wave types
 * for a warm, café-like background music feel.
 */

const NOTE_FREQ: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D#5': 622.25, 'E5': 659.25,
  'REST': 0,
};

type WaveType = OscillatorType;

interface TrackDef {
  notes: string[];
  bpm: number;
  wave: WaveType;
  gain: number;
  bassWave?: WaveType;
  bassGain?: number;
  harmonyNotes?: string[];
  harmonyWave?: WaveType;
  harmonyGain?: number;
}

const TRACKS: Record<string, TrackDef> = {
  'home': {
    notes: ['C4', 'E4', 'G4', 'A4', 'G4', 'E4'],
    bpm: 100,
    wave: 'triangle',
    gain: 0.03,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'santa-barbara': {
    notes: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'A3', 'G3'],
    bpm: 90,
    wave: 'triangle',
    gain: 0.03,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'wrong-crowd': {
    notes: ['E3', 'G3', 'Bb3', 'E3', 'D3', 'E3'],
    bpm: 80,
    wave: 'triangle',
    gain: 0.03,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'jail': {
    notes: ['D3', 'F3', 'D3', 'REST', 'D3', 'Eb3', 'D3', 'REST'],
    bpm: 60,
    wave: 'triangle',
    gain: 0.025,
    bassWave: 'square',
    bassGain: 0.01,
  },
  'caymus': {
    notes: ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'A3', 'B3'],
    bpm: 110,
    wave: 'triangle',
    gain: 0.03,
    harmonyNotes: ['G3', 'G3', 'D4', 'D4', 'D4', 'G3', 'A3', 'G3'],
    harmonyWave: 'sine',
    harmonyGain: 0.01,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'come-up': {
    notes: ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'G4'],
    bpm: 130,
    wave: 'triangle',
    gain: 0.03,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'operator': {
    notes: ['E4', 'G#4', 'B4', 'E5', 'D#5', 'B4', 'G#4', 'B4'],
    bpm: 120,
    wave: 'triangle',
    gain: 0.03,
    harmonyNotes: ['E4', 'E4', 'B4', 'B4', 'B4', 'B4', 'E4', 'B4'],
    harmonyWave: 'sine',
    harmonyGain: 0.01,
    bassWave: 'square',
    bassGain: 0.015,
  },
  'la': {
    notes: ['A3', 'C#4', 'E4', 'A4', 'G#4', 'E4', 'C#4', 'E4'],
    bpm: 95,
    wave: 'triangle',
    gain: 0.03,
    bassWave: 'square',
    bassGain: 0.015,
  },
};

// ADSR envelope constants
const ATTACK = 0.01;
const DECAY = 0.1;
const SUSTAIN_LEVEL = 0.4;
const RELEASE = 0.1;
const NOTE_GAP = 0.01; // 10ms silence between notes

// Filter
const FILTER_FREQ = 1000;

// Vibrato (lead only)
const VIBRATO_RATE = 5;   // Hz
const VIBRATO_DEPTH = 2;  // +/- Hz

export class MusicSystem {
  private static context: AudioContext | null = null;
  private static currentTrack: string = '';
  private static masterGain: GainNode | null = null;
  private static activeNodes: AudioNode[] = [];
  private static loopTimer: ReturnType<typeof setTimeout> | null = null;
  private static defaultVolume: number = 1;
  private static muted: boolean = false;

  private static getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.defaultVolume;
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  /**
   * Play a single note with ADSR envelope, low-pass filter, and optional vibrato.
   * Each note is its own oscillator — created and destroyed per note.
   */
  private static playNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    wave: WaveType,
    peakGain: number,
    addVibrato: boolean,
  ): void {
    if (freq <= 0) return; // REST

    const effectiveDuration = duration - NOTE_GAP;
    if (effectiveDuration <= 0) return;

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);

    // Vibrato via LFO on frequency
    if (addVibrato) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(VIBRATO_RATE, startTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(VIBRATO_DEPTH, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + effectiveDuration + RELEASE + 0.05);
      this.activeNodes.push(lfo, lfoGain);
    }

    // Envelope gain node
    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0.0001, startTime);
    // Attack
    envGain.gain.linearRampToValueAtTime(peakGain, startTime + ATTACK);
    // Decay to sustain
    envGain.gain.linearRampToValueAtTime(
      peakGain * SUSTAIN_LEVEL,
      startTime + ATTACK + DECAY
    );
    // Hold sustain until release point
    const releaseStart = startTime + effectiveDuration;
    envGain.gain.setValueAtTime(peakGain * SUSTAIN_LEVEL, releaseStart);
    // Release
    envGain.gain.linearRampToValueAtTime(0.0001, releaseStart + RELEASE);

    // Low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(FILTER_FREQ, startTime);
    filter.Q.setValueAtTime(0.7, startTime);

    // Connect: osc -> filter -> envGain -> masterGain
    osc.connect(filter);
    filter.connect(envGain);
    envGain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(releaseStart + RELEASE + 0.05);

    this.activeNodes.push(osc, envGain, filter);
  }

  /**
   * Schedule a full loop of notes for one voice.
   */
  private static scheduleVoice(
    ctx: AudioContext,
    notes: string[],
    startTime: number,
    beatDuration: number,
    wave: WaveType,
    gain: number,
    octaveShift: number,
    vibrato: boolean,
  ): void {
    for (let i = 0; i < notes.length; i++) {
      const freq = NOTE_FREQ[notes[i]] || 0;
      const shifted = octaveShift !== 0 && freq > 0
        ? freq * Math.pow(2, octaveShift)
        : freq;
      const noteStart = startTime + i * beatDuration;
      this.playNote(ctx, shifted, noteStart, beatDuration, wave, gain, vibrato);
    }
  }

  static play(trackName: string): void {
    if (trackName === this.currentTrack) return;

    this.stop();

    const track = TRACKS[trackName];
    if (!track) return;

    this.currentTrack = trackName;

    const ctx = this.getContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const beatDuration = 60 / track.bpm;
    const loopDuration = track.notes.length * beatDuration;

    const scheduleOneLoop = (baseTime: number) => {
      // Lead voice (with vibrato)
      this.scheduleVoice(
        ctx, track.notes, baseTime, beatDuration,
        track.wave, track.gain, 0, true
      );

      // Bass voice (one octave lower, no vibrato)
      if (track.bassGain) {
        this.scheduleVoice(
          ctx, track.notes, baseTime, beatDuration,
          track.bassWave || 'square', track.bassGain, -1, false
        );
      }

      // Harmony voice
      if (track.harmonyNotes) {
        this.scheduleVoice(
          ctx, track.harmonyNotes, baseTime, beatDuration,
          track.harmonyWave || 'sine', track.harmonyGain || 0.01, 0, false
        );
      }
    };

    // Schedule first loop immediately
    scheduleOneLoop(ctx.currentTime + 0.05);

    // Re-schedule loops ahead of time using setTimeout
    const scheduleNext = () => {
      if (this.currentTrack !== trackName) return;
      scheduleOneLoop(ctx.currentTime + 0.05);
      this.loopTimer = setTimeout(scheduleNext, loopDuration * 1000 * 0.95);
    };

    this.loopTimer = setTimeout(scheduleNext, loopDuration * 1000 * 0.95);
  }

  static stop(): void {
    this.currentTrack = '';

    for (const node of this.activeNodes) {
      try {
        if (node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch { /* already stopped/disconnected */ }
    }
    this.activeNodes = [];

    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  static setVolume(vol: number): void {
    this.defaultVolume = vol;
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  static toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.defaultVolume;
    }
    return this.muted;
  }

  static isMuted(): boolean {
    return this.muted;
  }
}
