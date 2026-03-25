export class SaveSystem {
  private static KEY = 'jdlo-game-save';

  static saveChapter(sceneKey: string): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({ chapter: sceneKey, timestamp: Date.now() }));
    } catch {}
  }

  static loadSave(): { chapter: string; timestamp: number } | null {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  static hasSave(): boolean {
    return this.loadSave() !== null;
  }

  static clearSave(): void {
    try { localStorage.removeItem(this.KEY); } catch {}
  }
}
