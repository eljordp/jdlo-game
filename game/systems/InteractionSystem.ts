import { SCALED_TILE } from '../config';
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

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
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
        sprite.setScale(3);
        sprite.setDepth(5); // above ground tiles, below player/NPCs

        this.sprites.set(obj.id, sprite);

        if (obj.glow) {
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

    // Hide the sprite
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.setVisible(false);
    }
  }

  getSprite(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.sprites.get(id);
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

    this.interactables = [];
  }
}
