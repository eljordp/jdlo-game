// ── Inventory System (Singleton) ────────────────────────────────
// Tracks items JP picks up throughout the game.
// Persists to localStorage so items survive page refresh.

export interface InventoryItem {
  id: string;          // e.g. 'bong', 'za', 'cart', 'joint'
  name: string;        // display name
  description: string; // short description
  icon: string;        // emoji or text icon for display
  chapter: string;     // which chapter it was found in
}

const STORAGE_KEY = 'jdlo-inventory';

// Default items — always in inventory from the start
const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'cart',
    name: 'Blinker',
    description: "JP's daily driver. Always loaded.",
    icon: '\u{1F32C}\u{FE0F}',
    chapter: 'all',
  },
];

export class InventorySystem {
  private static items: Map<string, InventoryItem> = new Map();
  private static initialized = false;

  /** Load inventory from localStorage (called automatically) */
  private static ensureInit() {
    if (this.initialized) return;
    this.initialized = true;

    // Load saved items
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr: InventoryItem[] = JSON.parse(saved);
        for (const item of arr) {
          this.items.set(item.id, item);
        }
      }
    } catch {
      // Silent fail
    }

    // Ensure default items are always present
    for (const def of DEFAULT_ITEMS) {
      if (!this.items.has(def.id)) {
        this.items.set(def.id, def);
      }
    }

    this.persist();
  }

  /** Add an item to inventory */
  static addItem(item: InventoryItem): void {
    this.ensureInit();
    this.items.set(item.id, item);
    this.persist();
  }

  /** Check if player has an item */
  static hasItem(id: string): boolean {
    this.ensureInit();
    return this.items.has(id);
  }

  /** Remove an item (consumed) */
  static removeItem(id: string): void {
    this.ensureInit();
    this.items.delete(id);
    this.persist();
  }

  /** Get all items as an array */
  static getItems(): InventoryItem[] {
    this.ensureInit();
    return Array.from(this.items.values());
  }

  /** Reset inventory (new game) */
  static clear(): void {
    this.items.clear();
    // Re-add defaults
    for (const def of DEFAULT_ITEMS) {
      this.items.set(def.id, def);
    }
    this.persist();
  }

  /** Persist to localStorage */
  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.items.values())));
    } catch {
      // Silent fail
    }
  }
}
