import { SCALED_TILE, SCALE } from '../config';
import { DialogueLine } from '../systems/DialogueSystem';

export type InteractableType = 'examine' | 'item' | 'evolve' | 'showcase' | 'scratch';

export interface Interactable {
  id: string;
  x: number; // tile position
  y: number; // tile position
  type: InteractableType;
  sprite?: string; // optional visual sprite key
  dialogue?: DialogueLine[]; // text when examined
  onInteract?: string; // callback key for special behavior
  consumed?: boolean; // once-only interactions
  glow?: boolean; // subtle visual indicator that this is interactable
}

export class InteractionSystem {
  private scene: Phaser.Scene;
  private interactables: Interactable[] = [];
  private sprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private glowTweens: Map<string, Phaser.Tweens.Tween> = new Map();
  private markers: Map<string, Phaser.GameObjects.Text> = new Map();
  private markerTweens: Map<string, Phaser.Tweens.Tween> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Get all interactable items with their sprites/markers for floor visibility */
  getVisuals(): { id: string; x: number; y: number; sprite?: Phaser.GameObjects.Sprite; marker?: Phaser.GameObjects.Text }[] {
    return this.interactables.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      sprite: this.sprites.get(item.id),
      marker: this.markers.get(item.id),
    }));
  }

  init(interactables: Interactable[]): void {
    // Clean up any previous state
    this.destroy();

    this.interactables = interactables;

    for (const obj of interactables) {
      if (obj.sprite) {
        // Place sprite at the center of the tile, scaled x3 like everything else
        const worldX = obj.x * SCALED_TILE + SCALED_TILE / 2;
        const worldY = obj.y * SCALED_TILE + SCALED_TILE / 2;

        const sprite = this.scene.add.sprite(worldX, worldY, obj.sprite);
        // Small items (joints, pencils, keys) render smaller than big items (tablets, bbq)
        const smallItems = ['item-joint', 'item-pencil', 'item-keys', 'item-dice'];
        const itemScale = smallItems.includes(obj.sprite) ? SCALE * 0.6 : SCALE;
        sprite.setScale(itemScale);
        sprite.setDepth(5); // above ground tiles, below player/NPCs

        this.sprites.set(obj.id, sprite);

        // Only pulse/glow for non-furniture sprites
        const skipGlow = obj.sprite && InteractionSystem.NO_GLOW_SPRITES.has(obj.sprite);
        if (obj.glow && !skipGlow) {
          const tween = this.scene.tweens.add({
            targets: sprite,
            alpha: { from: 0.7, to: 1.0 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          this.glowTweens.set(obj.id, tween);
        }
      }

      // Add "!" marker above any interactable with glow, regardless of sprite
      if (obj.glow) {
        const markerX = obj.x * SCALED_TILE + SCALED_TILE / 2;
        const markerY = obj.y * SCALED_TILE - 4;

        const marker = this.scene.add.text(markerX, markerY, '!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        }).setOrigin(0.5, 1).setDepth(50);

        this.markers.set(obj.id, marker);

        const bounce = this.scene.tweens.add({
          targets: marker,
          y: markerY - 6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.markerTweens.set(obj.id, bounce);
      }
    }
  }

  checkInteraction(tileX: number, tileY: number): Interactable | null {
    for (const obj of this.interactables) {
      if (obj.x === tileX && obj.y === tileY && !obj.consumed) {
        return obj;
      }
    }
    return null;
  }

  // Decoration sprites that should STAY visible after interaction
  private static readonly DECORATION_SPRITES = new Set([
    'item-bed', 'item-fridge', 'item-couch', 'item-tv', 'item-bbq',
    'item-bong', 'item-mirror', 'item-tablet', 'item-computer',
    'item-gun', 'item-bottle', 'item-food',
    'item-desk', 'item-nightstand', 'item-poster', 'item-toilet',
    'item-window', 'item-photo', 'item-bed-pink', 'item-bookshelf', 'item-yoga-mat',
  ]);

  // Furniture sprites that should NOT glow/pulse — they're scenery, not pickups
  private static readonly NO_GLOW_SPRITES = new Set([
    'item-bed', 'item-fridge', 'item-couch', 'item-tv', 'item-bbq',
    'item-mirror', 'item-computer', 'item-food',
    'item-desk', 'item-nightstand', 'item-poster', 'item-toilet',
    'item-window', 'item-photo', 'item-bed-pink', 'item-bookshelf', 'item-yoga-mat',
  ]);

  consume(id: string): void {
    const obj = this.interactables.find((i) => i.id === id);
    if (obj) {
      obj.consumed = true;
    }

    // Stop the glow tween if it exists
    const tween = this.glowTweens.get(id);
    if (tween) {
      tween.stop();
      this.glowTweens.delete(id);
    }

    // Hide the sprite ONLY if it's an actual pickup item (weed, money, joints, letters)
    const PICKUP_SPRITES = new Set([
      'item-weed-bag', 'item-money', 'item-joint', 'item-letter',
      'item-ball', 'item-key',
    ]);
    const sprite = this.sprites.get(id);
    if (sprite) {
      const isPickup = obj?.sprite && PICKUP_SPRITES.has(obj.sprite);
      if (isPickup) {
        sprite.setVisible(false);
      }
    }

    // Destroy the "!" marker
    const markerTween = this.markerTweens.get(id);
    if (markerTween) {
      markerTween.stop();
      this.markerTweens.delete(id);
    }
    const marker = this.markers.get(id);
    if (marker) {
      marker.destroy();
      this.markers.delete(id);
    }
  }

  /** Dynamically add a new interactable at runtime (for surprise events) */
  addInteractable(obj: Interactable): void {
    this.interactables.push(obj);

    if (obj.sprite) {
      const worldX = obj.x * SCALED_TILE + SCALED_TILE / 2;
      const worldY = obj.y * SCALED_TILE + SCALED_TILE / 2;

      const sprite = this.scene.add.sprite(worldX, worldY, obj.sprite);
      const smallItems = ['item-joint', 'item-pencil', 'item-keys', 'item-dice'];
      const itemScale = smallItems.includes(obj.sprite) ? SCALE * 0.6 : SCALE;
      sprite.setScale(itemScale);
      sprite.setDepth(5);
      this.sprites.set(obj.id, sprite);

      const skipGlow = InteractionSystem.NO_GLOW_SPRITES.has(obj.sprite);
      if (obj.glow && !skipGlow) {
        const tween = this.scene.tweens.add({
          targets: sprite,
          alpha: { from: 0.7, to: 1.0 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.glowTweens.set(obj.id, tween);
      }
    }

    if (obj.glow) {
      const markerX = obj.x * SCALED_TILE + SCALED_TILE / 2;
      const markerY = obj.y * SCALED_TILE - 4;

      const marker = this.scene.add.text(markerX, markerY, '!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#f0c040',
      }).setOrigin(0.5, 1).setDepth(50);

      this.markers.set(obj.id, marker);

      const bounce = this.scene.tweens.add({
        targets: marker,
        y: markerY - 6,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.markerTweens.set(obj.id, bounce);
    }
  }

  getSprite(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.sprites.get(id);
  }

  resetAll(): void {
    // Un-consume all interactables and re-show their sprites/markers
    for (const obj of this.interactables) {
      obj.consumed = false;

      // Re-show the sprite
      const sprite = this.sprites.get(obj.id);
      if (sprite) {
        sprite.setVisible(true);
      }

      // Re-create glow tween if needed (skip furniture)
      const skipGlow = obj.sprite && InteractionSystem.NO_GLOW_SPRITES.has(obj.sprite);
      if (obj.glow && !skipGlow && sprite && !this.glowTweens.has(obj.id)) {
        const tween = this.scene.tweens.add({
          targets: sprite,
          alpha: { from: 0.7, to: 1.0 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.glowTweens.set(obj.id, tween);
      }

      // Re-create "!" marker if missing
      if (obj.glow && !this.markers.has(obj.id)) {
        const markerX = obj.x * SCALED_TILE + SCALED_TILE / 2;
        const markerY = obj.y * SCALED_TILE - 4;

        const marker = this.scene.add.text(markerX, markerY, '!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        }).setOrigin(0.5, 1).setDepth(50);

        this.markers.set(obj.id, marker);

        const bounce = this.scene.tweens.add({
          targets: marker,
          y: markerY - 6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.markerTweens.set(obj.id, bounce);
      }
    }
  }

  destroy(): void {
    for (const tween of this.glowTweens.values()) {
      tween.stop();
    }
    this.glowTweens.clear();

    for (const sprite of this.sprites.values()) {
      sprite.destroy();
    }
    this.sprites.clear();

    for (const tween of this.markerTweens.values()) {
      tween.stop();
    }
    this.markerTweens.clear();

    for (const marker of this.markers.values()) {
      marker.destroy();
    }
    this.markers.clear();

    this.interactables = [];
  }
}
