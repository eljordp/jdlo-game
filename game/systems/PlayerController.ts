import { SCALED_TILE, MOVEMENT_SPEED, TILE_SIZE, SCALE } from '../config';
import { DialogueSystem } from './DialogueSystem';

type Direction = 'up' | 'down' | 'left' | 'right';

interface CollisionChecker {
  isSolidAt(tileX: number, tileY: number): boolean;
}

export class PlayerController {
  private scene!: Phaser.Scene;
  private sprite!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;

  private direction: Direction = 'down';
  private isMoving = false;
  private frozen = false;
  private targetX = 0;
  private targetY = 0;
  private startX = 0;
  private startY = 0;
  private moveProgress = 0;

  // Tile position (in tile coordinates)
  private tileX = 0;
  private tileY = 0;

  private collisionChecker: CollisionChecker | null = null;
  private dialogueSystem: DialogueSystem | null = null;
  private onInteract: ((tileX: number, tileY: number, direction: Direction) => void) | null = null;

  create(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    collisionChecker?: CollisionChecker,
    dialogueSystem?: DialogueSystem,
    onInteract?: (tileX: number, tileY: number, direction: Direction) => void
  ): void {
    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.collisionChecker = collisionChecker || null;
    this.dialogueSystem = dialogueSystem || null;
    this.onInteract = onInteract || null;

    // Create sprite at pixel position
    const pixelX = tileX * SCALED_TILE + SCALED_TILE / 2;
    const pixelY = tileY * SCALED_TILE + SCALED_TILE / 2;

    this.sprite = scene.add.sprite(pixelX, pixelY, 'player', 0);
    this.sprite.setScale(SCALE);
    this.sprite.setDepth(100);
    // Use nearest neighbor for crisp pixels
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(): void {
    if (this.frozen) return;
    if (this.dialogueSystem?.isActive()) return;

    if (this.isMoving) {
      this.continueMovement();
      return;
    }

    // Check for interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
      return;
    }

    // Check directional input
    const dir = this.getInputDirection();
    if (dir) {
      this.direction = dir;
      this.sprite.play(`walk-${dir}`, true);
      this.tryMove(dir);
    } else {
      // No input — show idle
      this.sprite.play(`idle-${this.direction}`, true);
    }
  }

  private getInputDirection(): Direction | null {
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    // Priority: most recent press, but for simplicity just pick one
    if (up) return 'up';
    if (down) return 'down';
    if (left) return 'left';
    if (right) return 'right';
    return null;
  }

  private tryMove(dir: Direction): void {
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;

    const newTileX = this.tileX + dx;
    const newTileY = this.tileY + dy;

    // Check collision
    if (this.collisionChecker?.isSolidAt(newTileX, newTileY)) {
      // Can't move — just face direction
      return;
    }

    // Start movement
    this.isMoving = true;
    this.moveProgress = 0;
    this.startX = this.sprite.x;
    this.startY = this.sprite.y;
    this.targetX = newTileX * SCALED_TILE + SCALED_TILE / 2;
    this.targetY = newTileY * SCALED_TILE + SCALED_TILE / 2;
    this.tileX = newTileX;
    this.tileY = newTileY;
  }

  private continueMovement(): void {
    const duration = (SCALED_TILE / MOVEMENT_SPEED) * 1000; // ms to cross one tile
    const delta = this.scene.game.loop.delta;

    this.moveProgress += delta / duration;

    if (this.moveProgress >= 1) {
      this.moveProgress = 1;
      this.isMoving = false;
    }

    // Lerp position
    this.sprite.x = Phaser.Math.Linear(this.startX, this.targetX, this.moveProgress);
    this.sprite.y = Phaser.Math.Linear(this.startY, this.targetY, this.moveProgress);
  }

  private tryInteract(): void {
    if (!this.onInteract) return;

    const dx = this.direction === 'left' ? -1 : this.direction === 'right' ? 1 : 0;
    const dy = this.direction === 'up' ? -1 : this.direction === 'down' ? 1 : 0;
    const facingTileX = this.tileX + dx;
    const facingTileY = this.tileY + dy;

    this.onInteract(facingTileX, facingTileY, this.direction);
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }

  getDirection(): Direction {
    return this.direction;
  }

  freeze(): void {
    this.frozen = true;
    this.isMoving = false;
    this.sprite.play(`idle-${this.direction}`, true);
  }

  unfreeze(): void {
    this.frozen = false;
  }

  setPosition(tileX: number, tileY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    this.sprite.x = tileX * SCALED_TILE + SCALED_TILE / 2;
    this.sprite.y = tileY * SCALED_TILE + SCALED_TILE / 2;
    this.isMoving = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
