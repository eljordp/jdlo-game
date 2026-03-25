import Phaser from 'phaser';
import { TILE_SIZE, SCALE, GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, MOVEMENT_SPEED } from '../config';
import { DialogueSystem, DialogueLine } from '../systems/DialogueSystem';
import { MapBuilder } from '../systems/MapBuilder';
import type { MapData } from '../data/maps';

type NPCObject = {
  sprite: Phaser.GameObjects.Sprite;
  id: string;
  dialogue: DialogueLine[];
};

export abstract class BaseChapterScene extends Phaser.Scene {
  protected player!: Phaser.GameObjects.Sprite;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  protected dialogue!: DialogueSystem;
  protected npcs: NPCObject[] = [];
  protected collisionTiles: Set<string> = new Set();
  protected isMoving = false;
  protected moveTarget = { x: 0, y: 0 };
  protected facing: 'down' | 'up' | 'left' | 'right' = 'down';
  protected frozen = false;
  protected triggers: { x: number; y: number; action: string; target?: string }[] = [];
  protected mapWidth = 0;
  protected mapHeight = 0;
  protected chapterTitle = '';
  protected nextScene = '';

  abstract getMapData(): MapData;
  abstract getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> };

  create() {
    this.npcs = [];
    this.collisionTiles = new Set();
    this.isMoving = false;
    this.frozen = false;

    // Camera fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Build the map
    const mapData = this.getMapData();
    const mapBuilder = new MapBuilder(this);
    const { collisions, bounds } = mapBuilder.buildMap(mapData);
    this.collisionTiles = collisions;
    this.mapWidth = bounds.width;
    this.mapHeight = bounds.height;
    this.triggers = mapData.triggers || [];

    // Create player at spawn point
    const spawn = mapData.spawns.player;
    this.player = this.add.sprite(
      spawn.x * SCALED_TILE + SCALED_TILE / 2,
      spawn.y * SCALED_TILE + SCALED_TILE / 2,
      'player', 0
    ).setScale(SCALE).setDepth(10);

    // Create NPCs
    const chapterDialogue = this.getChapterDialogue();
    for (const npcData of mapData.spawns.npcs) {
      const sprite = this.add.sprite(
        npcData.x * SCALED_TILE + SCALED_TILE / 2,
        npcData.y * SCALED_TILE + SCALED_TILE / 2,
        npcData.sprite, 0
      ).setScale(SCALE).setDepth(9);

      // Add collision for NPC tile
      this.collisionTiles.add(`${npcData.x},${npcData.y}`);

      this.npcs.push({
        sprite,
        id: npcData.id,
        dialogue: chapterDialogue.npcs[npcData.id] || [{ text: '...' }],
      });
    }

    // Set up dialogue system
    this.dialogue = new DialogueSystem(this);

    // Interaction keys
    this.input.keyboard!.on('keydown-SPACE', () => this.handleInteract());
    this.input.keyboard!.on('keydown-ENTER', () => this.handleInteract());
    this.input.on('pointerdown', () => this.handleInteract());

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapWidth * SCALED_TILE, this.mapHeight * SCALED_TILE);

    // Show chapter title
    this.showChapterTitle();
  }

  private showChapterTitle() {
    if (!this.chapterTitle) return;

    this.frozen = true;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(100).setAlpha(1);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.chapterTitle, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: bg,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            bg.destroy();
            title.destroy();
            this.frozen = false;

            // Show intro dialogue
            const chapter = this.getChapterDialogue();
            if (chapter.intro.length > 0) {
              this.dialogue.show(chapter.intro);
            }
          },
        });
      },
    });
  }

  private handleInteract() {
    if (this.dialogue.isActive()) {
      this.dialogue.advance();
      return;
    }

    // Check for nearby NPC
    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    let facingX = playerTileX;
    let facingY = playerTileY;
    if (this.facing === 'up') facingY--;
    if (this.facing === 'down') facingY++;
    if (this.facing === 'left') facingX--;
    if (this.facing === 'right') facingX++;

    for (const npc of this.npcs) {
      const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

      if (npcTileX === facingX && npcTileY === facingY) {
        this.dialogue.show(npc.dialogue);
        return;
      }
    }
  }

  protected transitionToScene(sceneKey: string) {
    this.frozen = true;
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey);
    });
  }

  update() {
    if (this.frozen || this.dialogue.isActive() || this.isMoving) return;

    // Get input direction
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) { dx = -1; this.facing = 'left'; }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) { dx = 1; this.facing = 'right'; }
    else if (this.cursors.up.isDown || this.wasd.W.isDown) { dy = -1; this.facing = 'up'; }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) { dy = 1; this.facing = 'down'; }

    // Update facing frame
    const frameMap = { down: 0, up: 2, left: 4, right: 6 };
    this.player.setFrame(frameMap[this.facing]);

    if (dx === 0 && dy === 0) return;

    // Calculate target tile
    const currentTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const currentTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);
    const targetTileX = currentTileX + dx;
    const targetTileY = currentTileY + dy;

    // Check collision
    const key = `${targetTileX},${targetTileY}`;
    if (this.collisionTiles.has(key)) return;

    // Check bounds
    if (targetTileX < 0 || targetTileX >= this.mapWidth || targetTileY < 0 || targetTileY >= this.mapHeight) return;

    // Move to target
    this.isMoving = true;
    const targetX = targetTileX * SCALED_TILE + SCALED_TILE / 2;
    const targetY = targetTileY * SCALED_TILE + SCALED_TILE / 2;

    // Walking animation frame
    const walkFrame = frameMap[this.facing] + 1;
    this.player.setFrame(walkFrame);

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 200,
      onComplete: () => {
        this.isMoving = false;
        this.player.setFrame(frameMap[this.facing]);

        // Check triggers
        this.checkTriggers(targetTileX, targetTileY);
      },
    });
  }

  private checkTriggers(tileX: number, tileY: number) {
    for (const trigger of this.triggers) {
      if (trigger.x === tileX && trigger.y === tileY) {
        if (trigger.action === 'scene' && trigger.target) {
          this.transitionToScene(trigger.target);
        } else if (trigger.action === 'dialogue' && trigger.target) {
          const chapter = this.getChapterDialogue();
          const dialogueLines = chapter.npcs[trigger.target];
          if (dialogueLines) {
            this.dialogue.show(dialogueLines);
          }
        }
      }
    }
  }
}
