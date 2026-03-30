// ── Inventory System (Singleton) ────────────────────────────────
// Items with quantities, durability (lighter uses), and crafting.
// Persists to localStorage.

import { GameStats } from './GameStats';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  maxStack: number;       // -1 = unlimited
  uses: number;           // -1 = no durability, 0 = depleted, >0 = remaining uses
  maxUses: number;        // -1 = no durability
  usable: boolean;        // can this item be "used" from inventory?
  consumeOnUse: boolean;  // does using it remove 1 from quantity?
  requiresForUse?: string; // another item needed to use this (e.g. preroll needs lighter)
}

export interface CraftRecipe {
  id: string;
  name: string;
  inputs: { itemId: string; qty: number }[];
  output: { itemId: string; qty: number };
}

// ── Item Catalog ─────────────────────────────────────────────────
// Every item definition lives here. When adding to inventory, we clone from catalog.

const ITEM_CATALOG: Record<string, Omit<InventoryItem, 'quantity'>> = {
  cart: {
    id: 'cart', name: 'Blinker', description: "JP's daily driver. Always loaded.",
    icon: '\u{1F32C}\u{FE0F}', maxStack: 1, uses: -1, maxUses: -1,
    usable: true, consumeOnUse: false,
  },
  eighth: {
    id: 'eighth', name: 'Eighth', description: 'An eighth of za. Smells loud.',
    icon: '\u{1F33F}', maxStack: 5, uses: -1, maxUses: -1,
    usable: false, consumeOnUse: false,
  },
  papers: {
    id: 'papers', name: 'Papers', description: 'Rolling papers. RAW blacks.',
    icon: '\u{1F4C4}', maxStack: 10, uses: -1, maxUses: -1,
    usable: false, consumeOnUse: false,
  },
  lighter: {
    id: 'lighter', name: 'Lighter', description: 'Bic lighter. Flicks left.',
    icon: '\u{1F525}', maxStack: 1, uses: 10, maxUses: 10,
    usable: false, consumeOnUse: false,
  },
  preroll: {
    id: 'preroll', name: 'Preroll', description: "Hand-rolled. Needs a light.",
    icon: '\u{1F6AC}', maxStack: 5, uses: -1, maxUses: -1,
    usable: true, consumeOnUse: true, requiresForUse: 'lighter',
  },
  bong: {
    id: 'bong', name: 'Bong', description: 'Glass piece. Hits hard.',
    icon: '\u{1F4A8}', maxStack: 1, uses: -1, maxUses: -1,
    usable: true, consumeOnUse: false, requiresForUse: 'lighter',
  },
  'lucky-coin': {
    id: 'lucky-coin', name: 'Lucky Coin', description: 'Found in a hidden place. Feels warm.',
    icon: '🪙', maxStack: 1, uses: -1, maxUses: -1,
    usable: false, consumeOnUse: false,
  },
  za: {
    id: 'za', name: 'Za', description: 'Loose za. Pack a bowl or roll up.',
    icon: '\u{1F343}', maxStack: 5, uses: -1, maxUses: -1,
    usable: false, consumeOnUse: false,
  },
};

// ── Crafting Recipes ─────────────────────────────────────────────

const RECIPES: CraftRecipe[] = [
  {
    id: 'roll_preroll',
    name: 'Roll Preroll',
    inputs: [
      { itemId: 'eighth', qty: 1 },
      { itemId: 'papers', qty: 1 },
    ],
    output: { itemId: 'preroll', qty: 1 },
  },
];

// ── Default Starting Items ───────────────────────────────────────

const DEFAULT_ITEMS: { id: string; quantity: number }[] = [
  { id: 'cart', quantity: 1 },
  { id: 'lighter', quantity: 1 },
];

const STORAGE_KEY = 'jdlo-inventory';

// ── Inventory System ─────────────────────────────────────────────

export class InventorySystem {
  private static items: Map<string, InventoryItem> = new Map();
  private static initialized = false;
  private static listeners: (() => void)[] = [];

  // ── Init ──

  private static ensureInit() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr: InventoryItem[] = JSON.parse(saved);
        for (const item of arr) {
          this.items.set(item.id, item);
        }
      }
    } catch { /* silent */ }

    // Ensure defaults always present
    for (const def of DEFAULT_ITEMS) {
      if (!this.items.has(def.id)) {
        const catalog = ITEM_CATALOG[def.id];
        if (catalog) {
          this.items.set(def.id, { ...catalog, quantity: def.quantity });
        }
      }
    }

    this.persist();
  }

  // ── Listeners (for UI updates) ──

  static onChange(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(f => f !== fn); };
  }

  private static notify() {
    for (const fn of this.listeners) fn();
  }

  // ── Core Operations ──

  /** Add item by catalog id. Stacks if already owned. */
  static addItem(id: string, quantity = 1): void {
    this.ensureInit();
    const existing = this.items.get(id);
    if (existing) {
      if (existing.maxStack === -1) {
        existing.quantity += quantity;
      } else {
        existing.quantity = Math.min(existing.quantity + quantity, existing.maxStack);
      }
    } else {
      const catalog = ITEM_CATALOG[id];
      if (!catalog) return; // unknown item
      this.items.set(id, { ...catalog, quantity });
    }
    GameStats.increment('itemsCollected', quantity);
    this.persist();
    this.notify();
  }

  /** Add item using a full InventoryItem object (legacy compat) */
  static addItemObject(item: InventoryItem): void {
    this.ensureInit();
    this.items.set(item.id, item);
    this.persist();
    this.notify();
  }

  /** Check if player has at least `qty` of an item */
  static hasItem(id: string, qty = 1): boolean {
    this.ensureInit();
    const item = this.items.get(id);
    return !!item && item.quantity >= qty;
  }

  /** Get a specific item (or undefined) */
  static getItem(id: string): InventoryItem | undefined {
    this.ensureInit();
    return this.items.get(id);
  }

  /** Remove quantity of an item. Deletes entry if quantity hits 0. */
  static removeItem(id: string, quantity = 1): void {
    this.ensureInit();
    const item = this.items.get(id);
    if (!item) return;
    item.quantity -= quantity;
    if (item.quantity <= 0) {
      this.items.delete(id);
    }
    this.persist();
    this.notify();
  }

  /** Get all items as array */
  static getItems(): InventoryItem[] {
    this.ensureInit();
    return Array.from(this.items.values());
  }

  // ── Durability (Lighter Uses) ──

  /** Check if item has uses remaining (for tools like lighter) */
  static hasUses(id: string): boolean {
    this.ensureInit();
    const item = this.items.get(id);
    if (!item) return false;
    if (item.uses === -1) return true; // infinite
    return item.uses > 0;
  }

  /** Consume one use of an item (e.g. lighter flick) */
  static consumeUse(id: string): boolean {
    this.ensureInit();
    const item = this.items.get(id);
    if (!item) return false;
    if (item.uses === -1) return true; // infinite, always works
    if (item.uses <= 0) return false;  // depleted
    item.uses--;
    // Don't delete the item when uses run out — it's still in inventory, just dead
    this.persist();
    this.notify();
    return true;
  }

  // ── Crafting ──

  /** Get all recipes */
  static getRecipes(): CraftRecipe[] {
    return RECIPES;
  }

  /** Check if a recipe can be crafted right now */
  static canCraft(recipeId: string): boolean {
    this.ensureInit();
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const input of recipe.inputs) {
      if (!this.hasItem(input.itemId, input.qty)) return false;
    }
    // Check output won't exceed max stack
    const outputCatalog = ITEM_CATALOG[recipe.output.itemId];
    if (outputCatalog && outputCatalog.maxStack !== -1) {
      const existing = this.items.get(recipe.output.itemId);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + recipe.output.qty > outputCatalog.maxStack) return false;
    }
    return true;
  }

  /** Craft an item — consumes inputs, produces output */
  static craft(recipeId: string): boolean {
    if (!this.canCraft(recipeId)) return false;
    const recipe = RECIPES.find(r => r.id === recipeId)!;

    // Consume inputs
    for (const input of recipe.inputs) {
      this.removeItem(input.itemId, input.qty);
    }

    // Produce output
    this.addItem(recipe.output.itemId, recipe.output.qty);
    return true;
  }

  // ── Use Item ──

  /** Use an item (smoke preroll, hit cart, etc). Returns true if successful. */
  static useItem(id: string): boolean {
    this.ensureInit();
    const item = this.items.get(id);
    if (!item || !item.usable) return false;

    // Check required tool (e.g. lighter for preroll)
    if (item.requiresForUse) {
      if (!this.hasUses(item.requiresForUse)) return false;
      // Consume one use of the tool
      this.consumeUse(item.requiresForUse);
    }

    // Consume the item itself if needed
    if (item.consumeOnUse) {
      this.removeItem(id, 1);
    }

    this.persist();
    this.notify();
    return true;
  }

  /** Check if an item can be used right now */
  static canUse(id: string): boolean {
    this.ensureInit();
    const item = this.items.get(id);
    if (!item || !item.usable) return false;
    if (item.requiresForUse && !this.hasUses(item.requiresForUse)) return false;
    return true;
  }

  // ── Item Catalog Access ──

  static getCatalog(): Record<string, Omit<InventoryItem, 'quantity'>> {
    return ITEM_CATALOG;
  }

  static getCatalogItem(id: string): Omit<InventoryItem, 'quantity'> | undefined {
    return ITEM_CATALOG[id];
  }

  // ── Reset ──

  static clear(): void {
    this.items.clear();
    for (const def of DEFAULT_ITEMS) {
      const catalog = ITEM_CATALOG[def.id];
      if (catalog) {
        this.items.set(def.id, { ...catalog, quantity: def.quantity });
      }
    }
    this.persist();
    this.notify();
  }

  // ── Reset (new game) ──

  static clearAll(): void {
    this.items.clear();
    this.initialized = false;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
    this.ensureInit(); // re-initialize with defaults only
    for (const fn of this.listeners) fn();
  }

  // ── Persistence ──

  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.items.values())));
    } catch { /* silent */ }
  }
}
