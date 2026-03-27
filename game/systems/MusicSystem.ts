/**
 * Ambient music system — mood-matched per chapter.
 * Uses Web Audio with careful frequency/gain choices per mood.
 * Music is background-level, never dominant.
 */

const NOTE: Record<string, number> = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98, 'A2': 110,
  'B2': 123.47, 'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'G3': 196, 'A3': 220, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392,
  'A4': 440, 'B4': 493.88,
  'REST': 0,
};

type TrackDef = {
  notes: string[];
  bpm: number;
  gain: number;
  wave: OscillatorType;
  filterFreq: number;
  // Optional second oscillator for warmth/depth
  harmonic?: { wave: OscillatorType; detune: number; gainMult: number };
};

const TRACKS: Record<string, TrackDef> = {
  // Ch1 Home: Warm, gentle, nostalgic. Major chord tones. Soft sine waves.
  'home': {
    notes: ['C3', 'E3', 'G3', 'E3', 'C3', 'REST', 'G2', 'REST'],
    bpm: 50,
    gain: 0.015,
    wave: 'sine',
    filterFreq: 800,
    harmonic: { wave: 'sine', detune: 1200, gainMult: 0.3 },
  },
  // Ch3 Wrong Crowd: Tense but NOT horror. Late night driving, subtle unease.
  'wrong-crowd': {
    notes: ['E2', 'REST', 'G2', 'A2', 'REST', 'E2', 'D2', 'REST'],
    bpm: 45,
    gain: 0.018,
    wave: 'sine',
    filterFreq: 350,
  },
  // Ch4 Jail: Somber, heavy, but with hope underneath. Deep tones, slow.
  'jail': {
    notes: ['D2', 'REST', 'F2', 'REST', 'A2', 'REST', 'D2', 'REST'],
    bpm: 35,
    gain: 0.018,
    wave: 'sine',
    filterFreq: 400,
    harmonic: { wave: 'sine', detune: 700, gainMult: 0.2 },
  },
  // Ch5 Caymus: Peaceful, rural, open. Simple acoustic-feel melody.
  'caymus': {
    notes: ['G3', 'A3', 'B3', 'REST', 'D4', 'B3', 'A3', 'REST'],
    bpm: 55,
    gain: 0.012,
    wave: 'triangle',
    filterFreq: 900,
  },
  // Ch6 Come Up: Building energy, motivational. Rising tones, momentum.
  'come-up': {
    notes: ['C3', 'E3', 'G3', 'A3', 'C4', 'REST', 'G3', 'E3'],
    bpm: 65,
    gain: 0.015,
    wave: 'triangle',
    filterFreq: 1000,
    harmonic: { wave: 'sine', detune: 1200, gainMult: 0.25 },
  },
  // Ch7 Operator: Confident, clean, professional. Smooth, assured.
  'operator': {
    notes: ['E3', 'G3', 'A3', 'B3', 'REST', 'A3', 'G3', 'REST'],
    bpm: 60,
    gain: 0.012,
    wave: 'sine',
    filterFreq: 1100,
    harmonic: { wave: 'triangle', detune: 700, gainMult: 0.15 },
  },
};

export class MusicSystem {
  private static ctx: AudioContext | null = null;
  private static currentTrack = '';
  private static oscillator: OscillatorNode | null = null;
  private static harmonicOsc: OscillatorNode | null = null;
  private static gainNode: GainNode | null = null;
  private static harmonicGain: GainNode | null = null;
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

    if (this.muted) {
      this.currentTrack = trackName;
      return;
    }

    // Beach ambiance — wave sounds using filtered noise
    if (trackName === 'santa-barbara') {
      this.playBeachAmbiance();
      this.currentTrack = trackName;
      return;
    }

    const track = TRACKS[trackName];
    if (!track) {
      this.currentTrack = trackName;
      return;
    }

    const ctx = this.getCtx();
    this.currentTrack = trackName;

    // Low-pass filter for ambient feel
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = track.filterFreq;
    this.filterNode.Q.value = 0.5;

    // Main gain — kept very quiet
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = track.gain;

    // Main oscillator
    this.oscillator = ctx.createOscillator();
    this.oscillator.type = track.wave;
    this.oscillator.frequency.value = NOTE[track.notes[0]] || 0;

    this.oscillator.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);
    this.oscillator.start();

    // Optional harmonic oscillator for warmth/depth
    if (track.harmonic) {
      this.harmonicGain = ctx.createGain();
      this.harmonicGain.gain.value = track.gain * track.harmonic.gainMult;

      this.harmonicOsc = ctx.createOscillator();
      this.harmonicOsc.type = track.harmonic.wave;
      this.harmonicOsc.frequency.value = NOTE[track.notes[0]] || 0;
      this.harmonicOsc.detune.value = track.harmonic.detune;

      this.harmonicOsc.connect(this.filterNode);
      this.harmonicGain.gain.value = track.gain * track.harmonic.gainMult;
      this.harmonicOsc.connect(this.harmonicGain);
      this.harmonicGain.connect(ctx.destination);
      this.harmonicOsc.start();
    }

    // Cycle through notes with smooth transitions
    let noteIndex = 0;
    const msPerBeat = (60 / track.bpm) * 1000;

    this.interval = setInterval(() => {
      noteIndex = (noteIndex + 1) % track.notes.length;
      const freq = NOTE[track.notes[noteIndex]];
      if (this.oscillator) {
        if (freq === 0) {
          // Rest — gentle fade
          this.gainNode?.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
          if (this.harmonicGain) {
            this.harmonicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
          }
        } else {
          this.oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.4);
          this.gainNode?.gain.setTargetAtTime(track.gain, ctx.currentTime, 0.15);
          if (this.harmonicOsc && track.harmonic) {
            this.harmonicOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.4);
            this.harmonicGain?.gain.setTargetAtTime(
              track.gain * track.harmonic.gainMult, ctx.currentTime, 0.15
            );
          }
        }
      }
    }, msPerBeat);
  }

  private static playBeachAmbiance(): void {
    const ctx = this.getCtx();

    // White noise buffer — sounds like ocean/waves when filtered
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Low-pass filter — keeps the deep ocean rumble
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 280;
    this.filterNode.Q.value = 0.7;

    // Second filter for extra smoothness
    const smoothFilter = ctx.createBiquadFilter();
    smoothFilter.type = 'lowpass';
    smoothFilter.frequency.value = 400;
    smoothFilter.Q.value = 0.5;

    // Very quiet
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.02;

    noise.connect(this.filterNode);
    this.filterNode.connect(smoothFilter);
    smoothFilter.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);
    noise.start();

    // Store as oscillator for cleanup
    this.oscillator = noise as unknown as OscillatorNode;

    // Wave rhythm — slow volume swells
    const waveRhythm = () => {
      if (!this.gainNode || this.currentTrack !== 'santa-barbara') return;
      const now = ctx.currentTime;
      this.gainNode.gain.setTargetAtTime(0.04, now, 2.0);
      this.gainNode.gain.setTargetAtTime(0.01, now + 4, 2.5);

      if (this.filterNode) {
        this.filterNode.frequency.setTargetAtTime(350, now, 1.5);
        this.filterNode.frequency.setTargetAtTime(250, now + 4, 2.0);
      }

      this.interval = setTimeout(waveRhythm, 6000 + Math.random() * 4000) as unknown as ReturnType<typeof setInterval>;
    };
    waveRhythm();
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
    if (this.harmonicOsc) {
      try { this.harmonicOsc.stop(); } catch {}
      this.harmonicOsc = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.harmonicGain) {
      this.harmonicGain.disconnect();
      this.harmonicGain = null;
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
