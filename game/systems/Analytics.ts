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

  static trackChapterTime(chapter: string, ms: number): void {
    this.trackEvent('chapter_time', { chapter, ms });
  }

  static getChapterStats(chapter: string): { interactions: number; timeMs: number } {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      const interactions = data.filter(
        (e: { event: string; data?: { id?: string } }) =>
          e.event === 'interaction' && e.data?.id?.startsWith(chapter)
      ).length;
      const timeEntries = data.filter(
        (e: { event: string; data?: { chapter?: string } }) =>
          e.event === 'chapter_time' && e.data?.chapter === chapter
      );
      const timeMs = timeEntries.length > 0
        ? (timeEntries[timeEntries.length - 1] as { data: { ms: number } }).data.ms
        : 0;
      return { interactions, timeMs };
    } catch {
      return { interactions: 0, timeMs: 0 };
    }
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
