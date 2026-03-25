/**
 * Music system — disabled for now.
 * Ready to accept real MP3/audio files when available.
 *
 * To add real music later:
 * 1. Drop MP3s in /public/audio/ (e.g. home.mp3, jail.mp3)
 * 2. Load them in BootScene preload: this.load.audio('home', '/audio/home.mp3')
 * 3. Uncomment the Phaser sound code below
 */

export class MusicSystem {
  private static muted = false;

  static play(_trackName: string): void {
    // Disabled — procedural music removed
    // When real audio files are added, use Phaser's sound manager here
  }

  static stop(): void {
    // No-op
  }

  static setVolume(_vol: number): void {
    // No-op
  }

  static toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  static isMuted(): boolean {
    return this.muted;
  }
}
