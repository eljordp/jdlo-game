import { SCALED_TILE, SCALE } from '../config';
import { DialogueLine } from '../systems/DialogueSystem';
import { GameIntelligence } from './GameIntelligence';

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
  private bounceTweens: Map<string, Phaser.Tweens.Tween> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Determine glow intensity tier based on GameIntelligence miss rate.
   * Returns 'high' (>60%), 'medium' (>40%), or 'normal'.
   */
  private getMissRateTier(id: string): 'normal' | 'medium' | 'high' {
    const agg = GameIntelligence.getAggregate();
    const rate = agg.itemMissRate[id];
    if (rate === undefined) return 'normal';
    if (rate > 0.6) return 'high';
    if (rate > 0.4) return 'medium';
    return 'normal';
  }

  /**
   * Apply adaptive glow to a sprite based on miss rate data.
   * Higher miss rate = bigger pulse range, brighter, optional bounce.
   */
  private applyAdaptiveGlow(id: string, sprite: Phaser.GameObjects.Sprite): void {
    const tier = this.getMissRateTier(id);

    // Base glow params
    let alphaFrom = 0.7;
    let alphaTo = 1.0;
    let duration = 800;

    if (tier === 'medium') {
      // 1.5x emphasis: wider alpha range, slightly faster pulse
      alphaFrom = 0.5;
      alphaTo = 1.0;
      duration = 650;
      GameIntelligence.logAdaptation('glow_boost', `${id}: miss rate >40%, glow 1.5x`);
    } else if (tier === 'high') {
      // 2x emphasis: much wider alpha range, faster pulse, plus bounce
      alphaFrom = 0.3;
      alphaTo = 1.0;
      duration = 500;
      GameIntelligence.logAdaptation('glow_boost', `${id}: miss rate >60%, glow 2x + bounce`);

      // Add subtle up-down bounce on the sprite itself
      const bounceTween = this.scene.tweens.add({
        targets: sprite,
        y: sprite.y - 4,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.bounceTweens.set(id, bounceTween);
    }

    const tween = this.scene.tweens.add({
      targets: sprite,
      alpha: { from: alphaFrom, to: alphaTo },
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.glowTweens.set(id, tween);
  }

  /**
   * Apply adaptive styling to the "!" marker based on miss rate data.
   * Higher miss rate = bigger font, brighter color, wider bounce.
   */
  private applyAdaptiveMarker(id: string, marker: Phaser.GameObjects.Text, baseY: number): void {
    const tier = this.getMissRateTier(id);

    let fontSize = '10px';
    let color = '#f0c040';
    let bounceDistance = 6;
    let duration = 800;

    if (tier === 'medium') {
      fontSize = '13px';
      color = '#ffdd44';
      bounceDistance = 9;
      duration = 650;
    } else if (tier === 'high') {
      fontSize = '16px';
      color = '#ffee66';
      bounceDistance = 12;
      duration = 500;
    }

    marker.setFontSize(fontSize);
    marker.setColor(color);

    const bounce = this.scene.tweens.add({
      targets: marker,
      y: baseY - bounceDistance,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.markerTweens.set(id, bounce);
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

        // Only pulse/glow for non-furniture sprites — scaled by miss rate
        const skipGlow = obj.sprite && InteractionSystem.NO_GLOW_SPRITES.has(obj.sprite);
        if (obj.glow && !skipGlow) {
          this.applyAdaptiveGlow(obj.id, sprite);
        }
      }

      // Add "!" marker above any interactable with glow — scaled by miss rate
      if (obj.glow) {
        const markerX = obj.x * SCALED_TILE + SCALED_TILE / 2;
        const markerY = obj.y * SCALED_TILE - 4;

        const marker = this.scene.add.text(markerX, markerY, '!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        }).setOrigin(0.5, 1).setDepth(50);

        this.markers.set(obj.id, marker);
        this.applyAdaptiveMarker(obj.id, marker, markerY);
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
    'item-macbook', 'item-shoe-rack', 'item-makeup-stand', 'item-led-strip', 'item-closet',
    'item-shower',
  ]);

  // Furniture sprites that should NOT glow/pulse — they're scenery, not pickups
  private static readonly NO_GLOW_SPRITES = new Set([
    'item-bed', 'item-fridge', 'item-couch', 'item-tv', 'item-bbq',
    'item-mirror', 'item-computer', 'item-food',
    'item-desk', 'item-nightstand', 'item-poster', 'item-toilet',
    'item-window', 'item-photo', 'item-bed-pink', 'item-bookshelf', 'item-yoga-mat',
    'item-macbook', 'item-shoe-rack', 'item-makeup-stand', 'item-led-strip', 'item-closet',
    'item-shower',
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

    // Stop the adaptive bounce tween if it exists
    const bounceTween = this.bounceTweens.get(id);
    if (bounceTween) {
      bounceTween.stop();
      this.bounceTweens.delete(id);
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
        this.applyAdaptiveGlow(obj.id, sprite);
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
      this.applyAdaptiveMarker(obj.id, marker, markerY);
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

      // Re-create glow tween if needed (skip furniture) — scaled by miss rate
      const skipGlow = obj.sprite && InteractionSystem.NO_GLOW_SPRITES.has(obj.sprite);
      if (obj.glow && !skipGlow && sprite && !this.glowTweens.has(obj.id)) {
        this.applyAdaptiveGlow(obj.id, sprite);
      }

      // Re-create "!" marker if missing — scaled by miss rate
      if (obj.glow && !this.markers.has(obj.id)) {
        const markerX = obj.x * SCALED_TILE + SCALED_TILE / 2;
        const markerY = obj.y * SCALED_TILE - 4;

        const marker = this.scene.add.text(markerX, markerY, '!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#f0c040',
        }).setOrigin(0.5, 1).setDepth(50);

        this.markers.set(obj.id, marker);
        this.applyAdaptiveMarker(obj.id, marker, markerY);
      }
    }
  }

  destroy(): void {
    for (const tween of this.glowTweens.values()) {
      tween.stop();
    }
    this.glowTweens.clear();

    for (const tween of this.bounceTweens.values()) {
      tween.stop();
    }
    this.bounceTweens.clear();

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
