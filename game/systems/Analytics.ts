// Silent localStorage analytics — no external service, no UI
// Tracks player behavior for understanding engagement

export class Analytics {
  private static KEY = 'jdlo-game-analytics';

  static trackEvent(event: string, data?: Record<string, unknown>): void {
    try {
      const existing = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      existing.push({ event, data, timestamp: Date.now() });
      localStorage.setItem(this.KEY, JSON.stringify(existing));
    } catch {
      // Silent fail — analytics should never break gameplay
    }
  }

  static trackChapterStart(chapter: string): void {
    this.trackEvent('chapter_start', { chapter });
  }

  static trackChapterComplete(chapter: string): void {
    this.trackEvent('chapter_complete', { chapter });
  }

  static trackInteraction(id: string): void {
    this.trackEvent('interaction', { id });
  }

  static trackGameComplete(): void {
    this.trackEvent('game_complete');
  }

  static getStats(): { events: number; chaptersReached: string[] } {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      const chapters = [
        ...new Set(
          data
            .filter((e: { event: string }) => e.event === 'chapter_start')
            .map((e: { data?: { chapter?: string } }) => e.data?.chapter)
        ),
      ];
      return { events: data.length, chaptersReached: chapters as string[] };
    } catch {
      return { events: 0, chaptersReached: [] };
    }
  }
}
