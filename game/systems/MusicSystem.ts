/**
 * Procedural 8-bit music system using Web Audio API.
 * Generates looping chiptune tracks for each chapter — no audio files needed.
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
    wave: 'square',
    gain: 0.06,
    bassGain: 0.03,
  },
  'santa-barbara': {
    notes: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'A3', 'G3'],
    bpm: 90,
    wave: 'triangle',
    gain: 0.07,
    bassGain: 0.03,
  },
  'wrong-crowd': {
    notes: ['E3', 'G3', 'Bb3', 'E3', 'D3', 'E3'],
    bpm: 80,
    wave: 'square',
    gain: 0.07,
    bassGain: 0.04,
  },
  'jail': {
    notes: ['D3', 'F3', 'D3', 'REST', 'D3', 'Eb3', 'D3', 'REST'],
    bpm: 60,
    wave: 'square',
    gain: 0.05,
    bassGain: 0.02,
  },
  'caymus': {
    notes: ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'A3', 'B3'],
    bpm: 110,
    wave: 'square',
    gain: 0.06,
    harmonyNotes: ['G3', 'G3', 'D4', 'D4', 'D4', 'G3', 'A3', 'G3'],
    harmonyWave: 'triangle',
    harmonyGain: 0.03,
    bassGain: 0.03,
  },
  'come-up': {
    notes: ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'G4'],
    bpm: 130,
    wave: 'square',
    gain: 0.07,
    bassGain: 0.03,
  },
  'operator': {
    notes: ['E4', 'G#4', 'B4', 'E5', 'D#5', 'B4', 'G#4', 'B4'],
    bpm: 120,
    wave: 'square',
    gain: 0.06,
    harmonyNotes: ['E4', 'E4', 'B4', 'B4', 'B4', 'B4', 'E4', 'B4'],
    harmonyWave: 'sawtooth',
    harmonyGain: 0.02,
    bassGain: 0.03,
  },
  'la': {
    notes: ['A3', 'C#4', 'E4', 'A4', 'G#4', 'E4', 'C#4', 'E4'],
    bpm: 95,
    wave: 'triangle',
    gain: 0.07,
    bassGain: 0.03,
  },
};

export class MusicSystem {
  private static context: AudioContext | null = null;
  private static currentTrack: string = '';
  private static masterGain: GainNode | null = null;
  private static oscillators: OscillatorNode[] = [];
  private static loopTimer: ReturnType<typeof setInterval> | null = null;
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

    // Schedule one loop of notes for an oscillator
    const scheduleLoop = (
      osc: OscillatorNode,
      notes: string[],
      startTime: number,
      octaveShift: number
    ) => {
      for (let i = 0; i < notes.length; i++) {
        const freq = NOTE_FREQ[notes[i]] || 0;
        const shifted = octaveShift !== 0 && freq > 0
          ? freq * Math.pow(2, octaveShift)
          : freq;
        const time = startTime + i * beatDuration;

        if (shifted === 0) {
          // REST: set frequency to something inaudible
          osc.frequency.setValueAtTime(0.001, time);
        } else {
          osc.frequency.setValueAtTime(shifted, time);
        }
      }
    };

    // Create an oscillator voice
    const createVoice = (
      wave: WaveType,
      gainValue: number,
      notes: string[],
      octaveShift: number
    ): OscillatorNode => {
      const osc = ctx.createOscillator();
      osc.type = wave;
      const gain = ctx.createGain();
      gain.gain.value = gainValue;
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      this.oscillators.push(osc);

      // Schedule initial loop
      scheduleLoop(osc, notes, ctx.currentTime, octaveShift);

      return osc;
    };

    // Lead voice
    const leadOsc = createVoice(track.wave, track.gain, track.notes, 0);

    // Bass voice (one octave lower)
    const bassOsc = track.bassGain
      ? createVoice(track.wave, track.bassGain, track.notes, -1)
      : null;

    // Harmony voice (if defined)
    const harmonyOsc = track.harmonyNotes
      ? createVoice(
          track.harmonyWave || 'triangle',
          track.harmonyGain || 0.03,
          track.harmonyNotes,
          0
        )
      : null;

    // Re-schedule loops on interval
    let loopCount = 1;
    this.loopTimer = setInterval(() => {
      const time = ctx.currentTime + 0.05; // small buffer
      scheduleLoop(leadOsc, track.notes, time, 0);
      if (bassOsc) scheduleLoop(bassOsc, track.notes, time, -1);
      if (harmonyOsc && track.harmonyNotes) {
        scheduleLoop(harmonyOsc, track.harmonyNotes, time, 0);
      }
      loopCount++;
    }, loopDuration * 1000);
  }

  static stop(): void {
    this.currentTrack = '';

    for (const osc of this.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.oscillators = [];

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
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
