/**
 * Ambient music system — dark/moody tracks only.
 * Uses Web Audio with heavy filtering for atmosphere, not melody.
 * Only plays on chapters where dark ambient fits.
 */

const NOTE: Record<string, number> = {
  'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98, 'A2': 110,
  'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'G3': 196, 'A3': 220,
  'REST': 0,
};

type TrackDef = {
  notes: string[];
  bpm: number;
  gain: number;
  wave: OscillatorType;
  filterFreq: number;
};

// Only dark/moody tracks — no happy chiptune
const TRACKS: Record<string, TrackDef> = {
  'wrong-crowd': {
    notes: ['E2', 'REST', 'G2', 'REST', 'E2', 'REST', 'Bb2', 'REST'],
    bpm: 50,
    gain: 0.03,
    wave: 'sine',
    filterFreq: 400,
  },
  'jail': {
    notes: ['D2', 'REST', 'REST', 'F2', 'REST', 'D2', 'REST', 'REST'],
    bpm: 40,
    gain: 0.04,
    wave: 'sine',
    filterFreq: 300,
  },
  'caymus': {
    notes: ['G2', 'REST', 'A2', 'REST', 'C3', 'REST', 'A2', 'REST'],
    bpm: 55,
    gain: 0.02,
    wave: 'triangle',
    filterFreq: 500,
  },
  'come-up': {
    notes: ['C3', 'REST', 'E3', 'REST', 'G3', 'REST', 'E3', 'REST'],
    bpm: 60,
    gain: 0.02,
    wave: 'triangle',
    filterFreq: 600,
  },
  'operator': {
    notes: ['E3', 'REST', 'G3', 'REST', 'A3', 'REST', 'G3', 'REST'],
    bpm: 65,
    gain: 0.02,
    wave: 'triangle',
    filterFreq: 700,
  },
};

export class MusicSystem {
  private static ctx: AudioContext | null = null;
  private static currentTrack = '';
  private static oscillator: OscillatorNode | null = null;
  private static gainNode: GainNode | null = null;
  private static filterNode: BiquadFilterNode | null = null;
  private static interval: ReturnType<typeof setInterval> | null = null;
  private static muted = false;

  private static getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  static play(trackName: string): void {
    if (this.currentTrack === trackName) return;
    this.stop();

    const track = TRACKS[trackName];
    if (!track || this.muted) {
      this.currentTrack = trackName;
      return;
    }

    const ctx = this.getCtx();
    this.currentTrack = trackName;

    // Deep low-pass filter for ambient feel
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = track.filterFreq;
    this.filterNode.Q.value = 0.5;

    // Very quiet gain
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = track.gain;

    // Single sustained oscillator
    this.oscillator = ctx.createOscillator();
    this.oscillator.type = track.wave;
    this.oscillator.frequency.value = NOTE[track.notes[0]] || 0;

    this.oscillator.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);
    this.oscillator.start();

    // Slowly cycle through notes
    let noteIndex = 0;
    const msPerBeat = (60 / track.bpm) * 1000;

    this.interval = setInterval(() => {
      noteIndex = (noteIndex + 1) % track.notes.length;
      const freq = NOTE[track.notes[noteIndex]];
      if (this.oscillator) {
        if (freq === 0) {
          // Rest — fade out briefly
          this.gainNode?.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        } else {
          this.oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.3);
          this.gainNode?.gain.setTargetAtTime(track.gain, ctx.currentTime, 0.1);
        }
      }
    }, msPerBeat);
  }

  static stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.oscillator) {
      try { this.oscillator.stop(); } catch {}
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }
    this.currentTrack = '';
  }

  static setVolume(vol: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = vol;
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
