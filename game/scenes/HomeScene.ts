import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { InventoryUI } from '../systems/InventoryUI';

export class HomeScene extends BaseChapterScene {
  private interactionCount = 0;
  private phoneTriggered = false;
  private trackedInteractions = new Set<string>();

  // Surprise element state
  private momArgued = false;
  private sisterPromised = false;
  private fetchPlayed = false;
  private isNightMode = false;
  private ivyFollowing = false;
  private ivyGiftGiven = false;
  private popsTalkedTo = false;
  private ivySurpriseTriggered = false;
  private ivySurpriseFollowSteps = 0;
  private momFoodSpawned = false;
  private sisterDrawingSpawned = false;
  private popsRecordPlayed = false;
  private stashSmoked = false;
  private bedLocked = false;
  private nightOverlay: Phaser.GameObjects.Rectangle | null = null;
  private ivyFollowHistory: { x: number; y: number }[] = [];
  private currentFloor: 'up' | 'down' = 'up'; // Player starts upstairs
  private exitTriggered = false;
  private openingCutsceneDone = false;
  private firstInteractableGlow: Phaser.GameObjects.Arc | null = null;
  private morningTint: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
    this.requiredInteractionId = 'ch0_nolan_call';
  }

  protected getPlayerTexture(): string {
    return 'player-ch0';
  }

  protected getMusicTrack(): string {
    return 'home';
  }

  create() {
    // Skip default chapter title — opening cutscene handles it
    this.chapterTitle = '';
    super.create();
    this.addNavArrow(14, 42, 'Leave home');

    // Play cinematic opening cutscene
    this.playOpeningCutscene();

    // Player starts upstairs — hide everything below row 12 (Pokemon-style)
    const upRows = Array.from({ length: 12 }, (_, i) => i); // rows 0-11
    const downRows = Array.from({ length: this.mapHeight - 12 }, (_, i) => i + 12);
    this.setFloorVisibility(upRows, downRows);
    // Clamp camera to upstairs area + black bg covers any bleed
    this.cameras.main.setBounds(0, 0, this.mapWidth * SCALED_TILE, 12 * SCALED_TILE);
    this.cameras.main.setBackgroundColor(0x000000);
    // Black mask behind upstairs to hide any downstairs bleed-through
    this.add.rectangle(
      this.mapWidth * SCALED_TILE / 2, 6 * SCALED_TILE,
      this.mapWidth * SCALED_TILE, 12 * SCALED_TILE,
      0x000000
    ).setDepth(-1);

    // Stairs labels — in the lounge against the back wall
    const stairsDownX = 20 * SCALED_TILE + SCALED_TILE / 2;
    const stairsDownY = 4 * SCALED_TILE + SCALED_TILE / 2;
    this.add.text(stairsDownX, stairsDownY - 24, 'STAIRS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(15).setAlpha(0.8);
    // Pulsing arrow above stairs
    const stairsArrow = this.add.text(stairsDownX, stairsDownY - 36, '\u25bc', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: stairsArrow, y: stairsDownY - 28, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    // Same for downstairs stairs
    const stairsUpX = 20 * SCALED_TILE + SCALED_TILE / 2;
    const stairsUpY = 18 * SCALED_TILE + SCALED_TILE / 2;
    this.add.text(stairsUpX, stairsUpY - 24, 'STAIRS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(15).setAlpha(0.8);
    const stairsArrow2 = this.add.text(stairsUpX, stairsUpY - 36, '\u25bc', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: stairsArrow2, y: stairsUpY - 28, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    // Sister's crayon drawings on walls — UPSTAIRS (cols 22-27, row 3)
    // Drawing 1: Sun on back wall
    this.add.circle(23 * SCALED_TILE + 20, 3 * SCALED_TILE + 40, 8, 0xf0c040).setDepth(1);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      this.add.rectangle(
        23 * SCALED_TILE + 20 + Math.cos(angle) * 12,
        3 * SCALED_TILE + 40 + Math.sin(angle) * 12,
        3, 6, 0xf0c040
      ).setDepth(1).setAngle(angle * 180 / Math.PI);
    }
    // Drawing 2: Heart
    this.add.rectangle(26 * SCALED_TILE + 20, 3 * SCALED_TILE + 40, 6, 6, 0xff69b4).setDepth(1);
    this.add.rectangle(26 * SCALED_TILE + 17, 3 * SCALED_TILE + 37, 4, 4, 0xff69b4).setDepth(1);
    this.add.rectangle(26 * SCALED_TILE + 23, 3 * SCALED_TILE + 37, 4, 4, 0xff69b4).setDepth(1);
    // Drawing 3: Rainbow stripes
    const rainbowColors = [0xff4444, 0xf0a030, 0xf0f040, 0x40c060, 0x4080e0, 0xc040f0];
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(24 * SCALED_TILE + 30, 3 * SCALED_TILE + 30 + i * 4, 20, 2, rainbowColors[i])
        .setDepth(1).setAlpha(0.7);
    }

    // Render windows directly on wall tiles (not floating sprites)
    const windowPositions = [
      { x: 4, y: 3 },   // JP's room (upstairs back wall)
      { x: 16, y: 3 },  // Upstairs lounge (back wall)
      { x: 25, y: 3 },  // Sister's room (upstairs back wall)
      { x: 31, y: 3 },  // Bathroom (upstairs back wall)
      { x: 8, y: 11 },  // Parents' room (downstairs)
    ];
    for (const pos of windowPositions) {
      const wx = pos.x * SCALED_TILE + SCALED_TILE / 2;
      const wy = pos.y * SCALED_TILE + SCALED_TILE / 2;
      // Window frame on wall
      this.add.rectangle(wx, wy, 24, 20, 0x90d0f8).setDepth(1); // glass
      this.add.rectangle(wx, wy, 28, 24, 0x707880).setDepth(1).setAlpha(0); // frame behind
      // Frame lines (cross)
      this.add.rectangle(wx, wy, 2, 20, 0x808890).setDepth(2); // vertical bar
      this.add.rectangle(wx, wy, 24, 2, 0x808890).setDepth(2); // horizontal bar
      // Outer frame
      this.add.rectangle(wx, wy, 28, 2, 0x707880).setDepth(2).setAlpha(0.7); // top
      this.add.rectangle(wx, wy + 10, 28, 2, 0x606870).setDepth(2).setAlpha(0.7); // bottom
    }

    // ── Mom catches you smoking inside ──
    InventoryUI.onBeforeUse = (itemId: string) => {
      // Cart is chill — only weed smoke triggers Mom
      const weedSmokeables = ['preroll', 'bong'];
      if (!weedSmokeables.includes(itemId)) return true;

      // Check if inside the house (upstairs or downstairs, not yard)
      const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);
      const inside = this.currentFloor === 'up' || playerTileY < 24;
      if (!inside) return true; // outside = safe

      // MOM CATCHES YOU
      this.triggerMomCatchesSmoking();
      return false;
    };

    // Start family NPC ambient movement
    this.startFamilyMovement();

    // ── VISUAL POLISH ─────────────────────────────────────────────────

    // Floor indicator — show initial floor
    this.showFloorIndicator('Upstairs');

    // Highlight first interactable (computer in JP's room)
    this.firstInteractableGlow = this.add.circle(
      10 * SCALED_TILE + SCALED_TILE / 2, 5 * SCALED_TILE + SCALED_TILE / 2,
      24, 0xf0c040, 0.15
    ).setDepth(3);
    this.tweens.add({
      targets: this.firstInteractableGlow,
      alpha: 0.05,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Morning light — warm golden tint that fades over time
    this.morningTint = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
      0xf8e0a0, 0.06
    ).setScrollFactor(0).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);

    // Ambient atmosphere — subtle text hints
    const ambientTexts = ['*tick... tick...*', '*birds chirping*', '*fridge humming*', '*distant TV*'];
    let ambientIdx = 0;
    this.time.addEvent({
      delay: 12000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        const text = ambientTexts[ambientIdx % ambientTexts.length];
        ambientIdx++;
        const ambientLabel = this.add.text(
          GAME_WIDTH / 2 + Phaser.Math.Between(-100, 100),
          60,
          text,
          { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#555555' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(89).setAlpha(0);
        this.tweens.add({
          targets: ambientLabel,
          alpha: 0.5,
          duration: 1000,
          hold: 3000,
          yoyo: true,
          onComplete: () => ambientLabel.destroy(),
        });
      },
    });
  }

  protected getObjectiveHint(): string {
    if (this.phoneTriggered && this.requiredDone) return 'Head outside. Walk to the street.';
    if (this.phoneTriggered) return 'Answer the phone.';
    if (this.interactionCount >= 5) return 'Keep exploring. Something\'s about to happen.';
    if (this.interactionCount >= 2 && this.currentFloor === 'up') return 'Talk to family. Head downstairs.';
    if (this.interactionCount >= 2) return 'Talk to Pops. Explore the yard.';
    if (this.currentFloor === 'up') return 'Look around your room. Interact with everything.';
    return 'Talk to family. Check everything out.';
  }

  // ─── NPC MOVEMENT SYSTEM ──────────────────────────────────────────
  private findNPC(id: string) {
    return this.npcs.find(n => n.id === id);
  }

  private moveNPCTo(id: string, tileX: number, tileY: number, duration = 800, onComplete?: () => void) {
    const npc = this.findNPC(id);
    if (!npc) return;

    // Remove old collision
    const oldTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const oldTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
    this.collisionTiles.delete(`${oldTileX},${oldTileY}`);

    const targetX = tileX * SCALED_TILE + SCALED_TILE / 2;
    const targetY = tileY * SCALED_TILE + SCALED_TILE / 2;

    // Walking bounce
    this.tweens.add({
      targets: npc.sprite,
      scaleY: SCALE * 1.05,
      scaleX: SCALE * 0.95,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(duration / 300),
    });

    this.tweens.add({
      targets: npc.sprite,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Linear',
      onComplete: () => {
        // Add new collision
        this.collisionTiles.add(`${tileX},${tileY}`);
        if (onComplete) onComplete();
      },
    });
  }

  // ─── FAMILY AMBIENT MOVEMENT ────────────────────────────────────
  private popsForward = true;
  private momForward = true;

  private startFamilyMovement(): void {
    // ── Pops: wanders between den couch (18,18) and kitchen table (26,18) ──
    this.time.addEvent({
      delay: 7000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        if (!this.popsTalkedTo) return; // Pops stays put until player talks to him
        const pops = this.findNPC('ch0_pops');
        if (!pops || !pops.sprite.visible) return;

        const targetX = this.popsForward ? 24 : 18;
        const targetY = 18;
        this.popsForward = !this.popsForward;

        this.moveNPCTo('ch0_pops', targetX, targetY, 3500);
      },
    });

    // ── Mom: patrols between kitchen counter (28,18) and parents room (8,16) ──
    this.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        const mom = this.findNPC('ch0_mom');
        if (!mom || !mom.sprite.visible) return;

        const targetX = this.momForward ? 8 : 28;
        const targetY = this.momForward ? 16 : 18;
        this.momForward = !this.momForward;

        this.moveNPCTo('ch0_mom', targetX, targetY, 4000);
      },
    });

    // ── Ivy the dog: wanders randomly around the yard when not following JP ──
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        if (this.ivyFollowing) return; // Don't wander when following JP

        const ivy = this.findNPC('ch0_frenchie');
        if (!ivy || !ivy.sprite.visible) return;

        // Random tile within the yard area (cols 4-30, rows 26-36)
        const minX = 4, maxX = 30, minY = 26, maxY = 36;
        const randX = minX + Math.floor(Math.random() * (maxX - minX + 1));
        const randY = minY + Math.floor(Math.random() * (maxY - minY + 1));

        // Skip if target is a collision tile
        if (this.collisionTiles.has(`${randX},${randY}`)) return;

        this.moveNPCTo('ch0_frenchie', randX, randY, 2000);

        // Tail wag animation
        this.tweens.add({
          targets: ivy.sprite,
          angle: 5,
          duration: 100,
          yoyo: true,
          repeat: 4,
        });
      },
    });
  }

  // ─── OPENING CUTSCENE ──────────────────────────────────────────────
  private playOpeningCutscene() {
    this.frozen = true;

    // Dark overlay covering the full screen
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1)
      .setScrollFactor(0).setDepth(600);

    // Chapter title card — "Chapter 1: Home"
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Chapter 1: Home', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    // Fade in title
    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 800,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        titleText.destroy();
        // Now play narrator lines
        this.playNarratorLines(overlay);
      },
    });
  }

  private playNarratorLines(overlay: Phaser.GameObjects.Rectangle) {
    const lines = [
      { text: 'Napa, California.', hold: 1500 },
      { text: 'Same room. Same walls. Same ceiling.', hold: 2000 },
      { text: 'Jordan had everything going for him.', hold: 2000 },
      { text: 'Then he left.', hold: 1500 },
    ];

    let delay = 200; // small initial pause after title fades

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fadeIn = 400;
      const fadeOut = 400;

      this.time.delayedCall(delay, () => {
        const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, line.text, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#ffffff',
          wordWrap: { width: GAME_WIDTH - 80 },
          align: 'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

        this.tweens.add({
          targets: txt,
          alpha: 1,
          duration: fadeIn,
          hold: line.hold,
          yoyo: true,
          onComplete: () => {
            txt.destroy();
          },
        });
      });

      delay += fadeIn + line.hold + fadeOut + 200; // 200ms gap between lines
    }

    // After all lines finish, fade overlay and unfreeze
    this.time.delayedCall(delay, () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          overlay.destroy();
          this.frozen = false;
          this.openingCutsceneDone = true;

          // Show intro dialogue after cutscene
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Good neighborhood. Good family. Good life.' },
            { speaker: 'Narrator', text: 'But the ceiling looks the same every morning.' },
            { speaker: 'JP\'s Mind', text: 'I gotta do something different.' },
          ]);
        },
      });
    });
  }

  // ─── EXIT EMOTIONAL BEAT ──────────────────────────────────────────
  protected transitionToScene(sceneKey: string, sceneData?: Record<string, string>) {
    if (this.exitTriggered) return;
    this.exitTriggered = true;
    this.frozen = true;

    // Dim screen slightly
    const dimOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(500);
    this.tweens.add({ targets: dimOverlay, alpha: 0.4, duration: 800 });

    this.time.delayedCall(800, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'He didn\'t say goodbye.' },
        { speaker: 'Narrator', text: 'He didn\'t have to. Pops already knew.' },
      ], () => {
        dimOverlay.destroy();
        // Now actually transition via parent
        super.transitionToScene(sceneKey, sceneData);
      });
    });
  }

  // ─── IVY FOLLOWING SYSTEM (Pokemon-style: 1 tile behind) ─────────
  private lastPlayerTileX = -1;
  private lastPlayerTileY = -1;

  protected onPlayerMove(tileX: number, tileY: number): void {
    if (this.ivyFollowing) {
      const ivy = this.findNPC('ch0_frenchie');
      if (ivy && this.lastPlayerTileX >= 0) {
        // Ivy moves to where JP JUST was (1 tile behind, every step)
        const prevX = this.lastPlayerTileX;
        const prevY = this.lastPlayerTileY;

        const ivyTileX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const ivyTileY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

        // Only move if the target tile is different from current
        if (prevX !== ivyTileX || prevY !== ivyTileY) {
          // Remove old collision
          this.collisionTiles.delete(`${ivyTileX},${ivyTileY}`);

          const targetPixelX = prevX * SCALED_TILE + SCALED_TILE / 2;
          const targetPixelY = prevY * SCALED_TILE + SCALED_TILE / 2;

          // Kill any existing movement tween
          this.tweens.killTweensOf(ivy.sprite);

          this.tweens.add({
            targets: ivy.sprite,
            x: targetPixelX,
            y: targetPixelY,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
              this.collisionTiles.add(`${prevX},${prevY}`);
            },
          });

          // Tail wag while moving
          this.tweens.add({
            targets: ivy.sprite,
            angle: 4,
            duration: 80,
            yoyo: true,
          });
        }
      }
    }

    // Store where JP was BEFORE this move (so Ivy follows there next step)
    this.lastPlayerTileX = tileX;
    this.lastPlayerTileY = tileY;

    // Auto-stairs — against the wall in the lounge (20,4), NOT in the hallway
    if (this.currentFloor === 'up' && tileX === 20 && tileY === 4 && !this.frozen) {
      this.frozen = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.setPosition(20 * SCALED_TILE + SCALED_TILE / 2, 18 * SCALED_TILE + SCALED_TILE / 2);
        const upRows = Array.from({ length: 12 }, (_, i) => i);
        const downRows = Array.from({ length: this.mapHeight - 12 }, (_, i) => i + 12);
        this.setFloorVisibility(downRows, upRows);
        this.currentFloor = 'down';
        this.showFloorIndicator('Downstairs');
        this.cameras.main.setBounds(0, 12 * SCALED_TILE, this.mapWidth * SCALED_TILE, (this.mapHeight - 12) * SCALED_TILE);
        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.frozen = false;
      });
    }
    if (this.currentFloor === 'down' && tileX === 20 && tileY === 18 && !this.frozen) {
      this.frozen = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.setPosition(20 * SCALED_TILE + SCALED_TILE / 2, 4 * SCALED_TILE + SCALED_TILE / 2);
        const upRows = Array.from({ length: 12 }, (_, i) => i);
        const downRows = Array.from({ length: this.mapHeight - 12 }, (_, i) => i + 12);
        this.setFloorVisibility(upRows, downRows);
        this.currentFloor = 'up';
        this.showFloorIndicator('Upstairs');
        this.cameras.main.setBounds(0, 0, this.mapWidth * SCALED_TILE, 12 * SCALED_TILE);
        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.frozen = false;
      });
    }

    // Sister follow hook
    if (this.sisterFollowHook) {
      this.sisterFollowHook(tileX, tileY);
    }

    // Late night trigger
    if (!this.isNightMode && this.trackedInteractions.size >= 15) {
      this.triggerNightMode();
    }

    // Ivy gift — after fetch, when walking near Ivy
    if (this.fetchPlayed && !this.ivyGiftGiven && this.ivyFollowing) {
      const ivy = this.findNPC('ch0_frenchie');
      if (ivy) {
        const ivyTileX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const ivyTileY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
        const dist = Math.abs(ivyTileX - tileX) + Math.abs(ivyTileY - tileY);
        if (dist <= 2) {
          this.ivyGiftGiven = true;
          this.triggerIvyGift();
        }
      }
    }

    // Mom avoidance — turns away when JP gets within 3 tiles
    const mom = this.findNPC('ch0_mom');
    if (mom && mom.sprite.visible) {
      const momTX = Math.round((mom.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const momTY = Math.round((mom.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      const momDist = Math.abs(momTX - tileX) + Math.abs(momTY - tileY);
      if (momDist <= 3 && momDist > 0) {
        // Face away from player
        const dx = momTX - tileX;
        const dy = momTY - tileY;
        if (Math.abs(dx) > Math.abs(dy)) {
          mom.sprite.setFrame(dx > 0 ? 6 : 4); // face away horizontally
        } else {
          mom.sprite.setFrame(dy > 0 ? 0 : 2); // face away vertically
        }
      }
    }

    // Ivy surprise follow — after 5+ interactions, Ivy silently follows for 3 tiles then sits
    if (!this.ivySurpriseTriggered && !this.ivyFollowing && this.requiredDone) {
      const ivy = this.findNPC('ch0_frenchie');
      if (ivy && ivy.sprite.visible) {
        const ivyTX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const ivyTY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
        const ivyDist = Math.abs(ivyTX - tileX) + Math.abs(ivyTY - tileY);
        if (ivyDist <= 3 && ivyDist > 0) {
          // Trigger the surprise follow
          this.ivySurpriseTriggered = true;
          this.ivySurpriseFollowSteps = 0;
          this.triggerIvySurpriseFollow(tileX, tileY);
        }
      }
    } else if (this.ivySurpriseTriggered && this.ivySurpriseFollowSteps > 0 && this.ivySurpriseFollowSteps < 3) {
      // Continue the surprise follow — Ivy moves to where JP just was
      this.triggerIvySurpriseFollow(tileX, tileY);
    }
  }

  // ─── IVY SURPRISE FOLLOW (silent 3-tile follow then sits) ────────
  private triggerIvySurpriseFollow(playerTileX: number, playerTileY: number): void {
    const ivy = this.findNPC('ch0_frenchie');
    if (!ivy) return;

    // Move Ivy to where JP just was (1 tile behind)
    const prevX = this.lastPlayerTileX;
    const prevY = this.lastPlayerTileY;
    if (prevX < 0) return;

    const ivyTileX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const ivyTileY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

    if (prevX !== ivyTileX || prevY !== ivyTileY) {
      this.collisionTiles.delete(`${ivyTileX},${ivyTileY}`);
      const targetPixelX = prevX * SCALED_TILE + SCALED_TILE / 2;
      const targetPixelY = prevY * SCALED_TILE + SCALED_TILE / 2;

      this.tweens.killTweensOf(ivy.sprite);
      this.tweens.add({
        targets: ivy.sprite,
        x: targetPixelX,
        y: targetPixelY,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
          this.collisionTiles.add(`${prevX},${prevY}`);
        },
      });

      // Tail wag while following
      this.tweens.add({
        targets: ivy.sprite,
        angle: 4,
        duration: 80,
        yoyo: true,
      });
    }

    this.ivySurpriseFollowSteps++;

    // After 3 steps, Ivy sits and shows "..."
    if (this.ivySurpriseFollowSteps >= 3) {
      this.time.delayedCall(300, () => {
        // Stop Ivy — she sits (frame 0 = front-facing idle)
        this.tweens.killTweensOf(ivy.sprite);
        ivy.sprite.setFrame(0);

        // Floating "..." text above Ivy
        const dotsText = this.add.text(
          ivy.sprite.x, ivy.sprite.y - SCALED_TILE * 0.8,
          '...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
          }
        ).setOrigin(0.5).setDepth(15).setAlpha(0);

        // Fade in, float up, fade out
        this.tweens.add({
          targets: dotsText,
          alpha: 1,
          y: dotsText.y - 12,
          duration: 600,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: dotsText,
              alpha: 0,
              y: dotsText.y - 10,
              duration: 1200,
              delay: 800,
              onComplete: () => dotsText.destroy(),
            });
          },
        });
      });
    }
  }

  // ─── LATE NIGHT MODE ──────────────────────────────────────────────
  private triggerNightMode() {
    this.isNightMode = true;

    // Dim overlay — evening settling in
    this.nightOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3, 0x0a0820, 0
    ).setDepth(8).setAlpha(0);

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0.35,
      duration: 3000,
      ease: 'Sine.easeIn',
    });

    // Cricket sounds (text-based since no audio files)
    const cricketTexts = ['*chirp*', '*chirp chirp*'];
    const spawnCricket = () => {
      if (!this.scene.isActive()) return;
      const text = cricketTexts[Math.floor(Math.random() * cricketTexts.length)];
      const x = this.player.x + Phaser.Math.Between(-200, 200);
      const y = this.player.y + Phaser.Math.Between(-150, 150);
      const cricket = this.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#406030',
      }).setDepth(9).setAlpha(0);
      this.tweens.add({
        targets: cricket,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        onComplete: () => cricket.destroy(),
      });
    };
    this.time.addEvent({ delay: 3000, callback: spawnCricket, loop: true });

    // Move Pops to couch (sleeping)
    const pops = this.findNPC('ch0_pops');
    if (pops) {
      this.time.delayedCall(2000, () => {
        this.moveNPCTo('ch0_pops', 8, 21, 1500, () => {
          // Pops "sleeping" — gentle breathing animation
          this.tweens.add({
            targets: pops!.sprite,
            scaleY: SCALE * 0.95,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          // Update dialogue
          pops!.dialogue = [
            { speaker: 'Narrator', text: 'Pops fell asleep on the couch. Game still on.' },
            { speaker: 'Narrator', text: 'He looks peaceful. Let him rest.' },
          ];
        });
      });
    }
  }

  // ─── IVY GIFT (post-fetch surprise) ───────────────────────────────
  private triggerIvyGift() {
    this.frozen = true;

    // Ivy drops a sock at JP's feet
    const chapterDialogue = this.getChapterDialogue();
    const lines = chapterDialogue.npcs['ch0_ivy_gift'] || [
      { speaker: 'Narrator', text: 'Ivy drops something at JP\'s feet. It\'s... a sock.' },
      { speaker: 'Narrator', text: 'She wags her tail. This is her best sock.' },
      { speaker: 'JP', text: 'Thanks Ivy.' },
    ];

    // Show sock sprite briefly
    const sockSprite = this.add.sprite(
      this.player.x, this.player.y + SCALED_TILE / 2, 'item-sock'
    ).setScale(SCALE).setDepth(11).setAlpha(0);

    this.tweens.add({
      targets: sockSprite,
      alpha: 1,
      duration: 300,
    });

    this.dialogue.show(lines, () => {
      this.tweens.add({
        targets: sockSprite,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          sockSprite.destroy();
          this.frozen = false;
        },
      });
    });
  }

  // ─── MOM ROOM DARKEN (post-argument) ──────────────────────────────
  // ─── MOM CATCHES YOU SMOKING INSIDE ──────────────────────────────
  private triggerMomCatchesSmoking() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Screen flash red
    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3, 0xff0000, 0
    ).setScrollFactor(0).setDepth(400);
    objects.push(flash);

    this.tweens.add({
      targets: flash,
      alpha: 0.4,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });

    // Camera shake — Mom is MAD
    this.cameras.main.shake(500, 0.01);

    // Big "MOM" text slams in
    this.time.delayedCall(300, () => {
      const momText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'MOM', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '48px',
        color: '#ff2020',
        stroke: '#000000',
        strokeThickness: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setScale(3).setAlpha(0);
      objects.push(momText);

      // Slam in
      this.tweens.add({
        targets: momText,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });

      // Dialogue sequence
      this.time.delayedCall(800, () => {
        // Dark overlay
        const overlay = this.add.rectangle(
          GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7
        ).setScrollFactor(0).setDepth(399);
        objects.push(overlay);

        this.dialogue.show([
          { speaker: 'Mom', text: 'JORDAN!' },
          { speaker: 'Mom', text: 'ARE YOU SMOKING IN MY HOUSE?!' },
          { speaker: 'JP', text: '...' },
          { speaker: 'Mom', text: 'I KNOW I DID NOT JUST SMELL THAT.' },
          { speaker: 'Mom', text: 'GET OUT. Go to your room. NOW.' },
          { speaker: 'Narrator', text: 'Mom drags JP back to his room by the ear.' },
          { speaker: 'Narrator', text: 'Chapter restart.' },
        ], () => {
          // Full black screen
          const black = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
          ).setScrollFactor(0).setDepth(500);

          this.tweens.add({
            targets: black,
            alpha: 1,
            duration: 600,
            onComplete: () => {
              // Clean up and restart the scene
              for (const obj of objects) {
                if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
              }
              InventoryUI.onBeforeUse = null;
              this.scene.restart();
            },
          });
        });
      });
    });
  }

  private triggerMomWalkaway() {
    this.momArgued = true;
    const mom = this.findNPC('ch0_mom');
    if (!mom) return;

    // Mom walks a REAL PATH: kitchen → hallway → parents room door → inside
    // Step 1: Walk to hallway door area (through kitchen to row 18)
    this.moveNPCTo('ch0_mom', 20, 18, 1200, () => {
      // Step 2: Walk down hallway toward parents room door
      this.moveNPCTo('ch0_mom', 20, 17, 400, () => {
        // Step 3: Walk into parents room through door
        this.moveNPCTo('ch0_mom', 22, 14, 1200, () => {
          // Block the parents room door — Mom locked it
          this.collisionTiles.add('20,17');

          // Dark overlay on parents' room (cols 17-30, rows 12-16)
          const roomCenterX = 23.5 * SCALED_TILE + SCALED_TILE / 2;
          const roomCenterY = 14 * SCALED_TILE + SCALED_TILE / 2;
          const roomW = 14 * SCALED_TILE;
          const roomH = 5 * SCALED_TILE;

          const darkness = this.add.rectangle(roomCenterX, roomCenterY, roomW, roomH, 0x000000, 0)
            .setDepth(7);
          this.tweens.add({
            targets: darkness,
            alpha: 0.5,
            duration: 1000,
            ease: 'Sine.easeIn',
          });

          // Door closing sound effect — just visual "thud"
          this.cameras.main.shake(100, 0.002);

          // Update Mom's dialogue to reflect state
          mom.dialogue = [
            { speaker: 'Narrator', text: 'The door is locked. She\'s done talking.' },
          ];

          // Spawn food on counter after a delay
          this.time.delayedCall(5000, () => {
            if (!this.momFoodSpawned) {
              this.momFoodSpawned = true;
              this.spawnDynamicInteractable('ch0_mom_food', 28, 20, 'item-plate');
            }
          });
        });
      });
    });
  }

  // ─── SISTER FOLLOWS (after birthday promise) ─────────────────────
  private triggerSisterFollow() {
    this.sisterPromised = true;
    const sister = this.findNPC('ch0_sister');
    if (!sister) return;

    // Sister follows for a bit then goes back
    let followSteps = 0;
    const maxFollowSteps = 8;

    const originalTileX = Math.round((sister.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const originalTileY = Math.round((sister.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

    const originalOnPlayerMove = this.onPlayerMove.bind(this);

    const sisterFollow = (tileX: number, tileY: number) => {
      followSteps++;

      const sisterTX = Math.round((sister.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const sisterTY = Math.round((sister.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      const dist = Math.abs(sisterTX - tileX) + Math.abs(sisterTY - tileY);

      if (dist > 2 && followSteps <= maxFollowSteps) {
        // Move sister closer
        const dx = tileX > sisterTX ? 1 : tileX < sisterTX ? -1 : 0;
        const dy = tileY > sisterTY ? 1 : tileY < sisterTY ? -1 : 0;
        const newX = sisterTX + dx;
        const newY = sisterTY + dy;

        if (!this.collisionTiles.has(`${newX},${newY}`)) {
          this.collisionTiles.delete(`${sisterTX},${sisterTY}`);
          const targetPx = newX * SCALED_TILE + SCALED_TILE / 2;
          const targetPy = newY * SCALED_TILE + SCALED_TILE / 2;
          this.tweens.add({
            targets: sister.sprite,
            x: targetPx,
            y: targetPy,
            duration: 250,
            ease: 'Linear',
            onComplete: () => {
              this.collisionTiles.add(`${newX},${newY}`);
            },
          });
        }
      }

      if (followSteps >= maxFollowSteps) {
        // Sister goes back to her room
        this.time.delayedCall(1000, () => {
          this.dialogue.show([
            { speaker: 'Sister', text: 'I\'m going back to my room. Don\'t forget, okay?' },
          ], () => {
            this.moveNPCTo('ch0_sister', originalTileX, originalTileY, 1200);
          });
        });
        // Remove the follow hook
        this.sisterFollowHook = null;
      }
    };

    this.sisterFollowHook = sisterFollow;

    // Spawn drawing on fridge after she follows
    this.time.delayedCall(10000, () => {
      if (!this.sisterDrawingSpawned) {
        this.sisterDrawingSpawned = true;
        this.spawnDynamicInteractable('ch0_sister_drawing', 30, 20, 'item-drawing');
      }
    });
  }

  private sisterFollowHook: ((tileX: number, tileY: number) => void) | null = null;

  // ─── POPS RUNS TO FISHING ─────────────────────────────────────────
  private triggerPopsRunsToFishing() {
    const pops = this.findNPC('ch0_pops');
    if (!pops) return;

    this.frozen = true;

    // Pops gets excited
    this.dialogue.show([
      { speaker: 'Pops', text: 'Oh hell yeah! Just like when you were little!' },
      { speaker: 'Pops', text: 'Hold on, let me grab the rods.' },
    ], () => {
      // Pops SPRINTS a real path — through the house, out the door, across the yard to the pond
      // Path waypoints (tile coords): living room → hallway → front door → yard → pond
      const path = [
        { x: 8, y: 22 },   // walk to hallway
        { x: 13, y: 22 },  // walk to front door area
        { x: 13, y: 24 },  // out the front door
        { x: 13, y: 28 },  // sprint through yard
        { x: 20, y: 30 },  // cut across to pond
        { x: 25, y: 32 },  // arrive at pond
      ];

      let step = 0;
      const runNext = () => {
        if (step >= path.length) {
          // Arrived! Excited bounce
          this.tweens.add({
            targets: pops.sprite,
            y: pops.sprite.y - 10,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              this.frozen = false;
              this.playFishing();
            },
          });
          return;
        }

        const wp = path[step];
        const speed = 400; // fast sprint speed
        step++;
        this.moveNPCTo('ch0_pops', wp.x, wp.y, speed, runNext);
      };

      runNext();
    });
  }

  // ─── POPS TV SIT-DOWN MOMENT ──────────────────────────────────────
  private triggerTVMoment() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(300));

    // Living room scene — couch + TV glow
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Couch (dark)
    objects.push(this.add.rectangle(cx, cy + 60, 400, 80, 0x3a3028)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy + 30, 380, 20, 0x4a3a28)
      .setScrollFactor(0).setDepth(301));

    // TV glow
    objects.push(this.add.rectangle(cx, cy - 100, 300, 180, 0x102030)
      .setScrollFactor(0).setDepth(301));
    const tvScreen = this.add.rectangle(cx, cy - 100, 280, 160, 0x1a3050)
      .setScrollFactor(0).setDepth(302);
    objects.push(tvScreen);

    // Flickering TV light
    this.tweens.add({
      targets: tvScreen,
      fillColor: 0x203860,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // JP and Pops silhouettes on couch
    const jpSil = this.add.sprite(cx - 60, cy + 40, this.getPlayerTexture(), 2)
      .setScale(3).setScrollFactor(0).setDepth(303).setTint(0x404040);
    objects.push(jpSil);
    const popsSil = this.add.sprite(cx + 60, cy + 40, 'npc_pops', 0)
      .setScale(3).setScrollFactor(0).setDepth(303).setTint(0x404040);
    objects.push(popsSil);

    // TV glow on faces
    objects.push(this.add.rectangle(cx, cy + 20, 160, 40, 0x203050, 0.15)
      .setScrollFactor(0).setDepth(304));

    // Sequence
    this.time.delayedCall(1500, () => {
      // Pops leans forward
      this.tweens.add({
        targets: popsSil,
        y: cy + 25,
        scaleX: 3.2,
        duration: 400,
        ease: 'Quad.easeOut',
      });

      this.time.delayedCall(600, () => {
        // JP does the same without realizing
        this.tweens.add({
          targets: jpSil,
          y: cy + 25,
          scaleX: 3.2,
          duration: 400,
          ease: 'Quad.easeOut',
        });
      });
    });

    // Text after a beat
    this.time.delayedCall(3500, () => {
      const text = this.add.text(cx, cy + 140, 'Some moments don\'t need words.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#808090',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305).setAlpha(0);
      objects.push(text);

      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 1000,
        hold: 2000,
        yoyo: true,
        onComplete: () => {
          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }
          this.frozen = false;
        },
      });
    });
  }

  // ─── ROOFTOP EASTER EGG ──────────────────────────────────────────
  private triggerRooftop() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // === SUNRISE OVER THE VINEYARD ===

    // Sky gradient — dawn colors (dark blue top → warm orange/pink horizon)
    objects.push(this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, GAME_HEIGHT * 0.3, 0x1a2040)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.2, GAME_WIDTH, GAME_HEIGHT * 0.2, 0x3a3060)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, GAME_WIDTH, GAME_HEIGHT * 0.15, 0x804850)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.45, GAME_WIDTH, GAME_HEIGHT * 0.1, 0xc07040)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(300));

    // Sun — golden circle rising at the horizon
    const sun = this.add.circle(GAME_WIDTH / 2 + 100, GAME_HEIGHT * 0.48, 40, 0xf0c040)
      .setScrollFactor(0).setDepth(301).setAlpha(0.9);
    objects.push(sun);
    // Sun glow
    const sunGlow = this.add.circle(GAME_WIDTH / 2 + 100, GAME_HEIGHT * 0.48, 70, 0xf0c040)
      .setScrollFactor(0).setDepth(300).setAlpha(0.15);
    objects.push(sunGlow);
    // Sun rises slowly
    this.tweens.add({ targets: [sun, sunGlow], y: GAME_HEIGHT * 0.42, duration: 8000, ease: 'Sine.easeOut' });

    // Rolling hills (green, layered)
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.55, GAME_WIDTH + 100, GAME_HEIGHT * 0.5, 0x4a7a3a)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(301));
    // Hill contour (lighter ridge)
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.53, GAME_WIDTH + 100, 8, 0x5a8a4a)
      .setScrollFactor(0).setDepth(302));

    // Vineyard rows — parallel lines across the hills
    for (let i = 0; i < 14; i++) {
      const rowY = GAME_HEIGHT * 0.58 + i * 18;
      objects.push(this.add.rectangle(GAME_WIDTH / 2, rowY, GAME_WIDTH - 100, 3, 0x3a6a2a)
        .setScrollFactor(0).setDepth(302).setAlpha(0.6));
      // Vine posts (small dots along each row)
      for (let j = 0; j < 20; j++) {
        objects.push(this.add.rectangle(80 + j * 60, rowY - 2, 2, 6, 0x5a4030)
          .setScrollFactor(0).setDepth(302).setAlpha(0.4));
      }
    }

    // Rooftop edge (shingles)
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 120, 0x3a2a1a)
      .setScrollFactor(0).setDepth(303));
    for (let i = 0; i < 20; i++) {
      objects.push(this.add.rectangle(
        i * 70 + 20, GAME_HEIGHT - 110 + Math.random() * 15, 55, 3, 0x4a3a2a
      ).setScrollFactor(0).setDepth(304).setAlpha(0.5));
    }

    // JP sitting on roof edge — silhouette against sunrise
    const jp = this.add.sprite(GAME_WIDTH / 2 - 60, GAME_HEIGHT - 140, this.getPlayerTexture(), 0)
      .setScale(3).setScrollFactor(0).setDepth(305);
    objects.push(jp);

    // Warm golden light overlay (sunrise glow on everything)
    const warmGlow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0a030)
      .setScrollFactor(0).setDepth(306).setAlpha(0);
    objects.push(warmGlow);
    this.tweens.add({ targets: warmGlow, alpha: 0.06, duration: 3000 });

    // Dialogue
    this.time.delayedCall(2000, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The sun comes up over the hills. Vineyard rows stretch to the horizon.' },
        { speaker: 'JP\'s Mind', text: 'One day I\'m gonna look back at this moment.' },
        { speaker: 'JP\'s Mind', text: 'And I\'m gonna know exactly when everything changed.' },
      ], () => {
        const fade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
          .setScrollFactor(0).setDepth(400);
        this.tweens.add({
          targets: fade,
          alpha: 1,
          duration: 800,
          onComplete: () => {
            for (const obj of objects) {
              if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
            }
            fade.destroy();
            this.frozen = false;
          },
        });
      });
    });
  }

  // ─── RECORD PLAYER ────────────────────────────────────────────────
  private triggerRecordPlayer() {
    this.popsRecordPlayed = true;
    const pops = this.findNPC('ch0_pops');

    // Move Pops to garage if he's not already there
    if (pops) {
      const popsTX = Math.round((pops.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const popsTY = Math.round((pops.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      // If Pops isn't near the garage, walk him over
      if (Math.abs(popsTX - 33) > 3 || Math.abs(popsTY - 26) > 3) {
        this.moveNPCTo('ch0_pops', 33, 26, 1500);
      }
    }

    this.frozen = true;
    const chapterDialogue = this.getChapterDialogue();
    const lines = chapterDialogue.npcs['ch0_record_player'] || [
      { speaker: 'Narrator', text: 'A warm crackle fills the garage.' },
    ];

    this.dialogue.show(lines, () => {
      this.frozen = false;
    });
  }

  // ─── DYNAMIC INTERACTABLE SPAWNING ────────────────────────────────
  private spawnDynamicInteractable(id: string, x: number, y: number, sprite?: string) {
    // Add to interaction system with a glow effect
    this.interactions.addInteractable({
      id, x, y, type: 'examine', glow: true, sprite,
    });

    // Visual spawn — sparkle effect
    const worldX = x * SCALED_TILE + SCALED_TILE / 2;
    const worldY = y * SCALED_TILE + SCALED_TILE / 2;
    for (let i = 0; i < 5; i++) {
      const sparkle = this.add.circle(
        worldX + Phaser.Math.Between(-15, 15),
        worldY + Phaser.Math.Between(-15, 15),
        2, 0xf0c040, 0.8
      ).setDepth(12);
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        y: sparkle.y - 20,
        duration: 600,
        delay: i * 100,
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }

  // Override to add computer interface, fetch, goodbye, phone ring, + all surprise elements
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Destroy first-interactable glow on any interaction
    if (this.firstInteractableGlow) {
      this.firstInteractableGlow.destroy();
      this.firstInteractableGlow = null;
    }
    if (interactable.id === 'ch0_journal') {
      Analytics.trackInteraction(interactable.id);
      this.showJournal();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_college') {
      Analytics.trackInteraction(interactable.id);
      this.showCollegeLetters();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_computer') {
      if (this.frozen) return;
      Analytics.trackInteraction(interactable.id);
      this.showComputerInterface();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_frenchie_ball') {
      Analytics.trackInteraction(interactable.id);
      this.fetchPlayed = true;
      // Start Ivy following after fetch
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_fishing') {
      Analytics.trackInteraction(interactable.id);
      // Pops gets excited and runs to the pond!
      this.triggerPopsRunsToFishing();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_goodbye') {
      Analytics.trackInteraction(interactable.id);
      this.playGoodbyeCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    // Rooftop easter egg
    if (interactable.id === 'ch0_rooftop') {
      Analytics.trackInteraction(interactable.id);
      this.triggerRooftop();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    // Record player in garage
    if (interactable.id === 'ch0_record_player') {
      Analytics.trackInteraction(interactable.id);
      this.triggerRecordPlayer();
      this.interactions.consume(interactable.id);
      this.trackForPhoneCall(interactable.id);
      return;
    }
    // Shoebox under the bed — pickup items for inventory
    if (interactable.id === 'ch0_shoebox') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Old shoebox under the bed. Nike. Size 10.' },
        { speaker: 'Narrator', text: 'Inside: a stack of photos, a lighter, rolling papers, and a fake ID that says "Jordan Perez, age 22."' },
      ], () => {
        // Add items to inventory
        InventorySystem.addItem('papers', 5);
        InventorySystem.addItem('lighter', 1); // extra lighter from the box
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP pockets the lighter and papers. Leaves the rest.' },
          { speaker: 'Narrator', text: 'Papers x5 and Lighter added to inventory.' },
          { speaker: 'JP\'s Mind', text: 'Everyone\'s got a box they don\'t show people.' },
        ], () => { this.frozen = false; });
      });
      this.trackForPhoneCall(interactable.id);
      return;
    }
    // TV sit-down with Pops
    if (interactable.id === 'ch0_tv_sitdown') {
      Analytics.trackInteraction(interactable.id);
      this.triggerTVMoment();
      this.interactions.consume(interactable.id);
      this.trackForPhoneCall(interactable.id);
      return;
    }
    // Stairs — Pokemon-style floor swap
    if (interactable.id === 'ch0_stairs_up') {
      this.frozen = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.setPosition(20 * SCALED_TILE + SCALED_TILE / 2, 4 * SCALED_TILE + SCALED_TILE / 2);
        const upRows = Array.from({ length: 12 }, (_, i) => i); // rows 0-11
        const downRows = Array.from({ length: this.mapHeight - 12 }, (_, i) => i + 12);
        this.setFloorVisibility(upRows, downRows);
        this.currentFloor = 'up';
        this.showFloorIndicator('Upstairs');
        // Camera only sees upstairs
        this.cameras.main.setBounds(0, 0, this.mapWidth * SCALED_TILE, 12 * SCALED_TILE);
        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.frozen = false;
      });
      return;
    }
    if (interactable.id === 'ch0_stairs_down') {
      this.frozen = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.setPosition(20 * SCALED_TILE + SCALED_TILE / 2, 18 * SCALED_TILE + SCALED_TILE / 2);
        const upRows = Array.from({ length: 12 }, (_, i) => i); // rows 0-11
        const downRows = Array.from({ length: this.mapHeight - 12 }, (_, i) => i + 12);
        this.setFloorVisibility(downRows, upRows);
        this.currentFloor = 'down';
        this.showFloorIndicator('Downstairs');
        // Camera sees full downstairs + yard
        this.cameras.main.setBounds(0, 12 * SCALED_TILE, this.mapWidth * SCALED_TILE, (this.mapHeight - 12) * SCALED_TILE);
        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.frozen = false;
      });
      return;
    }

    // Weights — dumbbell curl minigame
    if (interactable.id === 'ch0_weights') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.playLiftingMinigame();
      this.trackForPhoneCall(interactable.id);
      return;
    }

    // Basketball — quick shoot animation
    if (interactable.id === 'ch0_basketball') {
      Analytics.trackInteraction(interactable.id);
      this.trackForPhoneCall(interactable.id);
      this.frozen = true;

      // Ball arc animation
      const courtX = 20 * SCALED_TILE + SCALED_TILE / 2;
      const courtY = 28 * SCALED_TILE;
      const ball = this.add.circle(this.player.x, this.player.y - 20, 8, 0xf08030)
        .setDepth(12);
      // Arc to hoop
      this.tweens.add({
        targets: ball,
        x: courtX,
        y: courtY - 40,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Drop into hoop
          this.tweens.add({
            targets: ball,
            y: courtY,
            duration: 200,
            ease: 'Bounce.easeOut',
            onComplete: () => {
              ball.destroy();
              const chapterDialogue = this.getChapterDialogue();
              const lines = chapterDialogue.npcs['ch0_basketball'] || [
                { speaker: 'Narrator', text: 'Swish.' },
              ];
              this.dialogue.show(lines, () => { this.frozen = false; });
            },
          });
        },
      });
      return;
    }

    // Shower — JP hops in, hits the cart, smoke comes out
    if (interactable.id === 'ch0_shower') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);

      // Move JP to shower tile (bathroom is cols 30-33)
      const showerX = 32 * SCALED_TILE + SCALED_TILE / 2;
      const showerY = 6 * SCALED_TILE + SCALED_TILE / 2;
      this.tweens.add({
        targets: this.player,
        x: showerX,
        y: showerY,
        duration: 300,
        onComplete: () => {
          // Player disappears behind shower
          this.player.setAlpha(0.4);

          // Steam particles rising
          const steamTimer = this.time.addEvent({
            delay: 300,
            repeat: 12,
            callback: () => {
              const steam = this.add.circle(
                showerX + Phaser.Math.Between(-15, 15),
                showerY - 10,
                3 + Math.random() * 4,
                0xffffff, 0.2
              ).setDepth(12);
              this.tweens.add({
                targets: steam,
                y: steam.y - 40,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 1500,
                onComplete: () => steam.destroy(),
              });
            },
          });

          // After 1.5 sec — hits the cart
          this.time.delayedCall(1500, () => {
            this.dialogue.show([
              { speaker: 'Narrator', text: 'JP hits the cart in the shower. Classic.' },
            ], () => {
              // Cart smoke — thicker, denser puffs
              for (let i = 0; i < 8; i++) {
                this.time.delayedCall(i * 200, () => {
                  const smoke = this.add.text(
                    showerX + Phaser.Math.Between(-10, 10),
                    showerY - 20,
                    '~',
                    { fontFamily: 'monospace', fontSize: '16px', color: '#cccccc' }
                  ).setDepth(20).setAlpha(0.8);
                  this.tweens.add({
                    targets: smoke,
                    y: smoke.y - 50,
                    x: smoke.x + Phaser.Math.Between(-20, 20),
                    alpha: 0,
                    duration: 1800,
                    onComplete: () => smoke.destroy(),
                  });
                });
              }

              // Dialogue after smoking
              this.time.delayedCall(2000, () => {
                this.dialogue.show([
                  { speaker: 'JP\'s Mind', text: 'Needed that.' },
                ], () => {
                  steamTimer.remove();
                  this.player.setAlpha(1);
                  this.frozen = false;
                });
              });
            });
          });
        },
      });
      this.trackForPhoneCall(interactable.id);
      return;
    }

    // Deep mirror reflection (replaces generic mirror dialogue)
    if (interactable.id === 'ch0_mirror') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch0_mirror_deep'] || [
        { speaker: 'Narrator', text: 'Jordi stares at himself. Really stares.' },
        { speaker: 'JP\'s Mind', text: 'I don\'t know who this person is yet.' },
      ];
      this.dialogue.show(lines, () => { this.frozen = false; });
      this.trackForPhoneCall(interactable.id);
      return;
    }
    // Mom food plate (dynamically spawned)
    if (interactable.id === 'ch0_mom_food') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.trackForPhoneCall(interactable.id);
      super.handleInteractable(interactable);
      return;
    }
    // Sister drawing (dynamically spawned)
    if (interactable.id === 'ch0_sister_drawing') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.trackForPhoneCall(interactable.id);
      super.handleInteractable(interactable);
      return;
    }
    // Hidden stash is now discovered through the computer (no standalone interactable)

    // Papers — pickup (nightstand drawer)
    // Papers now discovered through bed (shoebox). Old standalone handler removed.

    // Bed — JP lies down, discovers shoebox underneath
    if (interactable.id === 'ch0_bed' && !this.bedLocked) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      const chapterDialogue = this.getChapterDialogue();
      const bedLines = chapterDialogue.npcs['ch0_bed'] || [
        { speaker: 'JP\'s Mind', text: 'Another night staring at the ceiling.' },
      ];
      this.dialogue.show(bedLines, () => {
        this.bedLocked = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP lies down for a second. Stares at the ceiling.' },
          { speaker: 'JP\'s Mind', text: 'I gotta get out of here.' },
        ], () => {
          // Hidden discovery — shoebox under the bed
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Something under the bed catches his eye. Old Nike shoebox.' },
            { speaker: 'Narrator', text: 'Inside: a stack of photos, a lighter, rolling papers, and a fake ID.' },
          ], () => {
            InventorySystem.addItem('papers', 5);
            InventorySystem.addItem('lighter', 1);
            this.dialogue.show([
              { speaker: 'Narrator', text: 'JP pockets the lighter and papers. Leaves the rest.' },
              { speaker: 'JP\'s Mind', text: 'Everyone\'s got a box they don\'t show people.' },
            ], () => { this.frozen = false; });
          });
        });
      });
      this.trackForPhoneCall(interactable.id);
      return;
    }

    this.trackForPhoneCall(interactable.id);
    super.handleInteractable(interactable);
  }

  // Reusable yes/no choice UI — prompt shows ABOVE buttons
  private showYesNoChoice(
    prompt: string,
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const promptText = this.add.text(cx, cy - 35, prompt, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const yesBg = this.add.rectangle(cx - 80, cy + 10, 120, 40, 0x30a040)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(cx - 80, cy + 10, yesLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const noBg = this.add.rectangle(cx + 80, cy + 10, 120, 40, 0xa03030)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const noText = this.add.text(cx + 80, cy + 10, noLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    yesBg.on('pointerover', () => yesBg.setFillStyle(0x40c050));
    yesBg.on('pointerout', () => yesBg.setFillStyle(0x30a040));
    noBg.on('pointerover', () => noBg.setFillStyle(0xc04040));
    noBg.on('pointerout', () => noBg.setFillStyle(0xa03030));

    const cleanup = () => {
      promptText.destroy();
      yesBg.destroy(); yesText.destroy();
      noBg.destroy(); noText.destroy();
      spaceKey.off('down', spaceHandler);
      nKey.off('down', nHandler);
    };

    noBg.on('pointerdown', () => { cleanup(); onNo(); });
    yesBg.on('pointerdown', () => { cleanup(); onYes(); });

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const spaceHandler = () => { cleanup(); onYes(); };
    const nHandler = () => { cleanup(); onNo(); };
    spaceKey.on('down', spaceHandler);
    nKey.on('down', nHandler);
  }

  // Override NPC dialogue to add reactive behaviors
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]) {
    if (npcId === 'ch0_pops' && !this.popsTalkedTo) {
      // First conversation with Pops — unlock his movement after
      this.dialogue.show(dialogue, () => {
        this.popsTalkedTo = true;
      });
      return;
    }

    if (npcId === 'ch0_mom' && !this.momArgued) {
      // Show normal dialogue, then trigger walkaway + Mom turns cold
      this.dialogue.show(dialogue, () => {
        this.triggerMomWalkaway();
      });
      return;
    }

    if (npcId === 'ch0_sister' && !this.sisterPromised) {
      // Show dialogue, then check if they promised birthday
      this.dialogue.show(dialogue, () => {
        // Trigger sister follow regardless of choice
        this.triggerSisterFollow();
      });
      return;
    }

    if (npcId === 'ch0_frenchie' && !this.ivyFollowing) {
      // After talking to Ivy, she starts following
      this.dialogue.show(dialogue, () => {
        this.ivyFollowing = true;
        // Little bark/wiggle
        const ivy = this.findNPC('ch0_frenchie');
        if (ivy) {
          this.tweens.add({
            targets: ivy.sprite,
            angle: 10,
            duration: 100,
            yoyo: true,
            repeat: 3,
          });
        }
      });
      return;
    }

    // Default behavior
    this.dialogue.show(dialogue);
  }

  private trackForPhoneCall(id: string) {
    if (this.phoneTriggered) return;
    if (this.trackedInteractions.has(id)) return;
    this.trackedInteractions.add(id);
    this.interactionCount++;

    // Time passes as you explore — morning light fades
    if (this.morningTint && this.interactionCount > 3) {
      const targetAlpha = Math.max(0, 0.06 - (this.interactionCount - 3) * 0.008);
      this.tweens.add({ targets: this.morningTint, alpha: targetAlpha, duration: 2000 });
    }

    // After 4 unique interactions + talked to Pops, queue surprise phone call
    if (this.interactionCount >= 4 && this.popsTalkedTo) {
      this.phoneTriggered = true;
      // Wait until player is TRULY free — check every 500ms, must be unfrozen for 2 consecutive checks
      let freeCount = 0;
      const checkReady = () => {
        if (!this.scene.isActive()) return;
        if (this.frozen || this.dialogue.isActive()) {
          freeCount = 0;
          this.time.delayedCall(500, checkReady);
        } else {
          freeCount++;
          if (freeCount >= 2) {
            // Truly free — ring
            this.triggerPhoneCall();
          } else {
            this.time.delayedCall(800, checkReady);
          }
        }
      };
      this.time.delayedCall(1500, checkReady);
    }
  }

  private triggerPhoneCall() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Vibrate/ring effect — screen shake
    this.cameras.main.shake(200, 0.003);

    // Phone overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Phone body — centered on screen
    const phoneX = GAME_WIDTH / 2;
    const phoneY = GAME_HEIGHT / 2 - 40;
    const phoneW = 200;
    const phoneH = 340;

    // Phone outer body
    const phoneBody = this.add.rectangle(phoneX, phoneY, phoneW, phoneH, 0x1a1a1a)
      .setScrollFactor(0).setDepth(301);
    objects.push(phoneBody);

    // Phone screen
    const phoneScreen = this.add.rectangle(phoneX, phoneY - 20, phoneW - 20, phoneH - 80, 0x0a2040)
      .setScrollFactor(0).setDepth(302);
    objects.push(phoneScreen);

    // Caller name
    const callerName = this.add.text(phoneX, phoneY - 80, 'Nolan', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callerName);

    // "Incoming Call" text
    const callLabel = this.add.text(phoneX, phoneY - 50, 'Incoming Call...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#80a0c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callLabel);

    // Pulsing ring animation on caller name
    this.tweens.add({
      targets: callerName,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Periodic vibrate
    const vibrateTimer = this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (this.scene.isActive()) this.cameras.main.shake(150, 0.002);
      },
    });

    // Answer button — green
    const btnY = phoneY + phoneH / 2 - 40;
    const answerBtn = this.add.rectangle(phoneX, btnY, 140, 36, 0x30a040)
      .setScrollFactor(0).setDepth(303).setInteractive({ useHandCursor: true });
    objects.push(answerBtn);

    const answerText = this.add.text(phoneX, btnY, 'ANSWER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
    objects.push(answerText);

    // Button hover effect
    answerBtn.on('pointerover', () => answerBtn.setFillStyle(0x40c050));
    answerBtn.on('pointerout', () => answerBtn.setFillStyle(0x30a040));

    // Answer handler
    const answer = () => {
      vibrateTimer.remove();
      answerBtn.off('pointerdown');
      spaceKey.off('down', spaceHandler);

      // Clean up phone UI
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }

      // Nolan dialogue — inviting JP to move in
      this.dialogue.show([
        { speaker: 'Nolan', text: 'Yooo JP! What\'s good bro?' },
        { speaker: 'JP', text: 'Nolan. What\'s up man?' },
        { speaker: 'Nolan', text: 'Bro. Santa Barbara. I got a spot down here.' },
        { speaker: 'Nolan', text: 'I\'m tryna see if you wanna move in with us.' },
      ], () => {
        // Choice: Yeah / Tell me more
        this.showYesNoChoice('Move in?', 'Yeah', 'Tell me more', () => {
          // "Yeah" — straight in
          this.dialogue.show([
            { speaker: 'JP', text: 'I\'m down. Who else is there?' },
            { speaker: 'Nolan', text: 'David, Cooper, Terrell, Big Bart. The whole crew bro.' },
            { speaker: 'Nolan', text: 'We got the frat house locked down. Beach is right there.' },
            { speaker: 'JP', text: 'Say less. I\'m packing tonight.' },
            { speaker: 'Nolan', text: 'LET\'S GO! I\'ll send you the address.' },
          ], () => {
            this.requiredDone = true;
            this.frozen = false;
          });
        }, () => {
          // "Tell me more" — Nolan pitches it
          this.dialogue.show([
            { speaker: 'Nolan', text: 'Alright listen. We got this house near campus right?' },
            { speaker: 'Nolan', text: 'David\'s already down here. Cooper too.' },
            { speaker: 'Nolan', text: 'Terrell and Big Bart just locked in last week.' },
            { speaker: 'Nolan', text: 'Bro it\'s the whole squad. Beach is five minutes away.' },
            { speaker: 'Nolan', text: 'Parties every weekend. Girls everywhere.' },
            { speaker: 'Nolan', text: 'And rent is split five ways so it\'s nothing.' },
            { speaker: 'JP', text: '...' },
            { speaker: 'JP', text: 'I\'m in.' },
            { speaker: 'Nolan', text: 'THAT\'S WHAT I\'M TALKING ABOUT! Pack your shit bro.' },
          ], () => {
            this.requiredDone = true;
            this.frozen = false;
          });
        });
      });
    };

    answerBtn.on('pointerdown', answer);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const spaceHandler = () => answer();
    spaceKey.on('down', spaceHandler);
  }

  private showJournal() {
    this.frozen = true;
    const frameObjects: Phaser.GameObjects.GameObject[] = [];
    let pageObjects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const bookW = 500;
    const bookH = 440;
    const textX = cx - bookW / 2 + 70;

    // Journal pages — 2017 through June 2021
    const pages = [
      {
        date: 'September 2017',
        lines: [
          'First day at De La Salle.',
          'Don\'t know a single person here.',
          '',
          'Everyone already has their groups.',
          'I\'m just walking around trying to',
          'figure out where everything is.',
          '',
          'Made a couple people laugh at lunch.',
          'That\'s something I guess.',
        ],
      },
      {
        date: 'March 2018',
        lines: [
          'Started at Caymus doing field work.',
          'Don\'t know anyone here either.',
          '',
          'Using my Spanish though. Ernesto talks',
          'fast but I can keep up. Mostly.',
          'Juan and Eliseo are cool.',
          '',
          'Hands hurt. Back hurts.',
          'But the money\'s real.',
        ],
      },
      {
        date: 'Fall 2019',
        lines: [
          'This year has been different.',
          'Parties every weekend. Drinking.',
          'Football games with the crew.',
          '',
          'Finally feel like I belong somewhere.',
          'People know my name now.',
          '',
          'But when I come home and it\'s quiet',
          'I still feel like I\'m behind.',
        ],
      },
      {
        date: 'March 2020',
        lines: [
          'COVID. Everything shut down.',
          '',
          'Stuck in this room. Staring at the',
          'ceiling. Smoking. Playing games.',
          '',
          'Found out about LA on the internet.',
          'People living different out there.',
          'I wanna go so bad.',
          '',
          'But I\'m here. In this room.',
        ],
      },
      {
        date: 'August 2020',
        lines: [
          'Started looking into dropshipping.',
          'Watched like 40 videos on it.',
          '',
          'Set up a store. Didn\'t sell anything.',
          'Set up another one. Sold two things.',
          '',
          'It\'s not much but it\'s something.',
          'First time I made money from MY thing.',
          'Not someone else\'s field.',
        ],
      },
      {
        date: 'February 2021',
        lines: [
          'I\'m going to be somebody.',
          'I just don\'t know how yet.',
          '',
          'Everyone around me has a plan.',
          'College, job, whatever.',
          'I don\'t have a plan.',
          'I just know this isn\'t it.',
          '',
          'Something\'s coming. I can feel it.',
        ],
      },
      {
        date: 'June 2021',
        lines: [
          'Haven\'t heard from Nolan in a minute.',
          '',
          'Been thinking a lot.',
          'About what I\'m doing. Where I\'m going.',
          'Whether any of this leads somewhere.',
          '',
          'Pops works every day. Comes home tired.',
          'Mom holds everything together.',
          'Ivy waits at the door no matter what.',
          '',
          'I don\'t want to let them down.',
          'But I don\'t know what the move is yet.',
        ],
      },
      {
        date: 'June 2021 (later)',
        lines: [
          'I keep coming back to this feeling.',
          '',
          'Like I\'m standing at the edge of',
          'something and I can\'t see the bottom.',
          '',
          'Everyone else just... jumped.',
          'College. Military. Trade school.',
          '',
          'I\'m still standing here.',
          '',
          'But I\'m not scared. I\'m ready.',
          'I just need the moment.',
        ],
      },
    ];

    let currentPage = 0;

    // Dark overlay
    frameObjects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300));

    // Leather cover
    frameObjects.push(this.add.rectangle(cx, cy, bookW + 16, bookH + 16, 0x5a3a20)
      .setScrollFactor(0).setDepth(301));
    // Spine
    frameObjects.push(this.add.rectangle(cx - bookW / 2 - 4, cy, 8, bookH + 16, 0x4a2a18)
      .setScrollFactor(0).setDepth(302));
    // Paper
    frameObjects.push(this.add.rectangle(cx + 4, cy, bookW, bookH, 0xf5edd8)
      .setScrollFactor(0).setDepth(302));

    // Ruled lines
    for (let i = 0; i < 14; i++) {
      const lineY = cy - bookH / 2 + 50 + i * 28;
      frameObjects.push(this.add.rectangle(cx + 4, lineY, bookW - 40, 1, 0xc8c0b0)
        .setScrollFactor(0).setDepth(303).setAlpha(0.5));
    }

    // Red margin line
    frameObjects.push(this.add.rectangle(cx - bookW / 2 + 60, cy, 1, bookH - 20, 0xd08080)
      .setScrollFactor(0).setDepth(303).setAlpha(0.6));

    // Nav buttons
    const prevBtn = this.add.text(cx - bookW / 2 + 20, cy + bookH / 2 + 20, '< PREV', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#8a7a6a',
    }).setScrollFactor(0).setDepth(305).setInteractive({ useHandCursor: true });
    frameObjects.push(prevBtn);

    const nextBtn = this.add.text(cx + bookW / 2 - 20, cy + bookH / 2 + 20, 'NEXT >', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#8a7a6a',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(305).setInteractive({ useHandCursor: true });
    frameObjects.push(nextBtn);

    const pageNum = this.add.text(cx, cy + bookH / 2 + 20, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#999999',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(305);
    frameObjects.push(pageNum);

    const closeHint = this.add.text(cx, cy + bookH / 2 + 38, 'ESC to close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666666',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(305);
    frameObjects.push(closeHint);

    const renderPage = () => {
      // Clear previous page content
      for (const obj of pageObjects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
      pageObjects = [];

      const page = pages[currentPage];

      // Date
      const dateText = this.add.text(textX, cy - bookH / 2 + 24, page.date, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#8a7a6a',
      }).setScrollFactor(0).setDepth(304);
      pageObjects.push(dateText);

      // Entries
      let entryY = cy - bookH / 2 + 56;
      for (const line of page.lines) {
        if (line === '') { entryY += 14; continue; }
        const t = this.add.text(textX, entryY, line, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#3a3028',
        }).setScrollFactor(0).setDepth(304);
        pageObjects.push(t);
        entryY += 26;
      }

      // Update nav
      pageNum.setText(`${currentPage + 1} / ${pages.length}`);
      prevBtn.setAlpha(currentPage > 0 ? 1 : 0.3);
      nextBtn.setAlpha(currentPage < pages.length - 1 ? 1 : 0.3);
    };

    prevBtn.on('pointerdown', () => {
      if (currentPage > 0) { currentPage--; renderPage(); }
    });
    nextBtn.on('pointerdown', () => {
      if (currentPage < pages.length - 1) { currentPage++; renderPage(); }
    });

    // Keyboard nav
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const onLeft = () => { if (currentPage > 0) { currentPage--; renderPage(); } };
    const onRight = () => { if (currentPage < pages.length - 1) { currentPage++; renderPage(); } };

    const closeJournal = () => {
      leftKey.off('down', onLeft); rightKey.off('down', onRight);
      escKey.off('down', closeJournal); spaceKey.off('down', closeJournal);
      for (const obj of [...frameObjects, ...pageObjects]) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    };

    this.time.delayedCall(300, () => {
      leftKey.on('down', onLeft);
      rightKey.on('down', onRight);
      escKey.on('down', closeJournal);
      spaceKey.on('down', closeJournal);
    });

    renderPage();
  }

  // ─── COLLEGE ACCEPTANCE LETTERS ─────────────────────────────────
  private showCollegeLetters() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let trashed = 0;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300));

    // Desk surface
    objects.push(this.add.rectangle(cx, cy + 20, 800, 420, 0x6a5030)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy + 20, 790, 410, 0x7a6040)
      .setScrollFactor(0).setDepth(301));
    // Wood grain lines
    for (let i = 0; i < 8; i++) {
      objects.push(this.add.rectangle(cx, cy - 160 + i * 55, 780, 1, 0x6a5030)
        .setScrollFactor(0).setDepth(302).setAlpha(0.3));
    }

    // Trash can (bottom right)
    const trashX = cx + 320;
    const trashY = cy + 160;
    objects.push(this.add.rectangle(trashX, trashY, 60, 70, 0x404048)
      .setScrollFactor(0).setDepth(303));
    objects.push(this.add.rectangle(trashX, trashY - 38, 68, 6, 0x505058)
      .setScrollFactor(0).setDepth(303)); // rim
    objects.push(this.add.rectangle(trashX, trashY + 30, 50, 4, 0x353538)
      .setScrollFactor(0).setDepth(303)); // base
    const trashLabel = this.add.text(trashX, trashY + 50, 'TRASH', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(trashLabel);

    // Title
    objects.push(this.add.text(cx, cy - 190, 'Acceptance Letters', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#c0b090',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

    objects.push(this.add.text(cx, cy - 168, 'Click a letter to crumple it.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#807060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

    // === The 3 Letters ===
    const letters = [
      {
        school: 'University of Oregon',
        city: 'Eugene, OR',
        color: 0x154733, accent: 0xFEE123, // Oregon green + yellow
        logo: 'O', logoColor: '#FEE123',
        x: cx - 240,
      },
      {
        school: "University of Hawai'i",
        city: 'Honolulu, HI',
        color: 0x024731, accent: 0x000000, // UH green + black
        logo: 'H', logoColor: '#ffffff',
        x: cx,
      },
      {
        school: 'Arizona State University',
        city: 'Tempe, AZ',
        color: 0x8C1D40, accent: 0xFFC627, // ASU maroon + gold
        logo: 'A', logoColor: '#FFC627',
        x: cx + 240,
      },
    ];

    for (const letter of letters) {
      const lx = letter.x;
      const ly = cy + 10;
      const lw = 200;
      const lh = 280;

      // Track ALL parts of this letter for crumpling
      const thisLetterParts: Phaser.GameObjects.GameObject[] = [];

      const paper = this.add.rectangle(lx, ly, lw, lh, 0xf5f0e8)
        .setScrollFactor(0).setDepth(305);
      objects.push(paper);
      thisLetterParts.push(paper);

      const header = this.add.rectangle(lx, ly - lh / 2 + 30, lw, 60, letter.color)
        .setScrollFactor(0).setDepth(306);
      objects.push(header);
      thisLetterParts.push(header);

      const logo = this.add.text(lx, ly - lh / 2 + 30, letter.logo, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '28px', color: letter.logoColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(307);
      objects.push(logo);
      thisLetterParts.push(logo);

      const schoolName = this.add.text(lx, ly - 50, letter.school, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#333333',
        wordWrap: { width: lw - 20 }, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
      objects.push(schoolName);
      thisLetterParts.push(schoolName);

      const city = this.add.text(lx, ly - 30, letter.city, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
      objects.push(city);
      thisLetterParts.push(city);

      const stamp = this.add.text(lx, ly + 10, 'ACCEPTED', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#2a8040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(306).setAngle(-8);
      objects.push(stamp);
      thisLetterParts.push(stamp);

      const accent = this.add.rectangle(lx, ly - lh / 2 + 62, lw - 20, 2, letter.accent)
        .setScrollFactor(0).setDepth(306);
      objects.push(accent);
      thisLetterParts.push(accent);

      for (let i = 0; i < 4; i++) {
        const line = this.add.rectangle(lx, ly + 50 + i * 14, lw - 40, 2, 0xcccccc)
          .setScrollFactor(0).setDepth(306).setAlpha(0.5);
        objects.push(line);
        thisLetterParts.push(line);
      }

      const dear = this.add.text(lx - lw / 2 + 18, ly + 40, 'Dear Jordan Lopez,', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#555555',
      }).setScrollFactor(0).setDepth(306);
      objects.push(dear);
      thisLetterParts.push(dear);

      // Clickable
      paper.setInteractive({ useHandCursor: true });
      paper.on('pointerover', () => paper.setStrokeStyle(2, 0xf04040));
      paper.on('pointerout', () => paper.setStrokeStyle(0));

      paper.on('pointerdown', () => {
        paper.removeInteractive();

        // Crumple ALL parts
        for (const t of thisLetterParts) {
          this.tweens.add({
            targets: t, scaleX: 0.3, scaleY: 0.3,
            angle: Phaser.Math.Between(-30, 30), duration: 300, ease: 'Back.easeIn',
          });
        }

        // Toss to trash
        this.time.delayedCall(350, () => {
          for (const t of thisLetterParts) {
            this.tweens.add({
              targets: t, x: trashX, y: trashY - 20, alpha: 0,
              duration: 400, ease: 'Quad.easeIn',
              onComplete: () => { if (t && t.active) (t as Phaser.GameObjects.GameObject).destroy(); },
            });
          }

          trashed++;
          if (trashed >= 3) {
            this.time.delayedCall(800, () => {
              this.dialogue.show([
                { speaker: 'JP\'s Mind', text: '$40K a year to learn what YouTube teaches for free.' },
                { speaker: 'JP\'s Mind', text: 'Nah.' },
              ], () => {
                for (const obj of objects) {
                  if (obj && obj.active) {
                    this.tweens.add({
                      targets: obj, alpha: 0, duration: 400,
                      onComplete: () => { if (obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); },
                    });
                  }
                }
                this.time.delayedCall(500, () => { this.frozen = false; });
              });
            });
          }
        });
      });
    }

    // ESC to close early
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const onEsc = () => {
      escKey.off('down', onEsc);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    };
    escKey.on('down', onEsc);
  }

  private showComputerInterface() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 20;
    const monW = 780;
    const monH = 520;

    // Dark overlay — click to close
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300).setInteractive();
    objects.push(overlay);

    // === MacBook Pro — space grey ===
    // Aluminum outer shell
    objects.push(this.add.rectangle(cx, cy, monW + 28, monH + 28, 0x8a8a8e).setScrollFactor(0).setDepth(301));
    // Black bezel around screen
    objects.push(this.add.rectangle(cx, cy, monW + 6, monH + 6, 0x0a0a0a).setScrollFactor(0).setDepth(301));
    // Top bezel (camera notch)
    objects.push(this.add.rectangle(cx, cy - monH / 2 - 1, monW + 6, 8, 0x0a0a0a).setScrollFactor(0).setDepth(301));
    // Camera dot
    objects.push(this.add.circle(cx, cy - monH / 2 - 1, 2, 0x1a3a1a).setScrollFactor(0).setDepth(302));

    // Screen — macOS wallpaper (dark gradient)
    objects.push(this.add.rectangle(cx, cy, monW, monH, 0x1a1028).setScrollFactor(0).setDepth(302));
    objects.push(this.add.rectangle(cx - 80, cy - 60, monW * 0.6, 180, 0x2a1040).setScrollFactor(0).setDepth(302).setAlpha(0.5));
    objects.push(this.add.rectangle(cx + 100, cy + 50, monW * 0.5, 160, 0x102030).setScrollFactor(0).setDepth(302).setAlpha(0.35));
    objects.push(this.add.rectangle(cx, cy + 100, monW, 80, 0x141020).setScrollFactor(0).setDepth(302).setAlpha(0.4));

    // === Laptop base + keyboard ===
    // Hinge
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 15, monW + 8, 5, 0x6a6a6e).setScrollFactor(0).setDepth(301));
    // Keyboard deck
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 32, monW + 50, 28, 0x7a7a7e).setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 32, monW + 46, 24, 0x6a6a6e).setScrollFactor(0).setDepth(300));
    // Trackpad
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 34, 90, 12, 0x5a5a5e).setScrollFactor(0).setDepth(301));
    // Key hints
    for (let i = 0; i < 11; i++) {
      objects.push(this.add.rectangle(cx - 160 + i * 32, cy + monH / 2 + 27, 18, 3, 0x555558)
        .setScrollFactor(0).setDepth(301).setAlpha(0.4));
    }

    // === macOS Menu bar ===
    const menuBarY = cy - monH / 2 + 10;
    objects.push(this.add.rectangle(cx, menuBarY, monW, 20, 0x1a1a22, 0.85).setScrollFactor(0).setDepth(303));
    // Menu items
    const menuItems = ['Finder', 'File', 'Edit', 'View'];
    for (let i = 0; i < menuItems.length; i++) {
      objects.push(this.add.text(cx - monW / 2 + 14 + i * 48, menuBarY - 4, menuItems[i], {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#b0b0b0',
      }).setScrollFactor(0).setDepth(304));
    }
    // Right side status
    objects.push(this.add.text(cx + monW / 2 - 50, menuBarY - 4, '11:42 PM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#b0b0b0',
    }).setScrollFactor(0).setDepth(304));

    // === macOS Dock ===
    const dockY = cy + monH / 2 - 36;
    const dockW = 420;
    // Glass dock — above app windows so buttons always clickable
    objects.push(this.add.rectangle(cx, dockY, dockW, 50, 0x2a2a3a, 0.5).setScrollFactor(0).setDepth(319));
    objects.push(this.add.rectangle(cx, dockY - 25, dockW, 1, 0x505070, 0.25).setScrollFactor(0).setDepth(319));

    // Dock apps
    const apps = [
      { name: 'Safari',    color: 0x2090e0, icon: 'S',  x: cx - 160 },
      { name: 'Mail',      color: 0x3080d0, icon: 'M',  x: cx - 90 },
      { name: 'Instagram', color: 0xc040a0, icon: 'IG', x: cx - 20 },
      { name: 'YouTube',   color: 0xe02020, icon: 'YT', x: cx + 50 },
      { name: 'Close',     color: 0x505058, icon: 'X',  x: cx + 160 },
    ];

    const appButtons: Phaser.GameObjects.Rectangle[] = [];
    for (const app of apps) {
      const btn = this.add.rectangle(app.x, dockY, 38, 38, app.color)
        .setScrollFactor(0).setDepth(320).setInteractive({ useHandCursor: true });
      objects.push(btn);
      appButtons.push(btn);
      // Gloss
      objects.push(this.add.rectangle(app.x, dockY - 9, 32, 6, 0xffffff)
        .setScrollFactor(0).setDepth(321).setAlpha(0.1));
      // Letter
      objects.push(this.add.text(app.x, dockY + 1, app.icon, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(321));
      // Hover scale
      btn.on('pointerover', () => { this.tweens.add({ targets: btn, scaleX: 1.15, scaleY: 1.15, duration: 80 }); });
      btn.on('pointerout', () => { this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 80 }); });
    }

    // === Close handler — works from any state ===
    const closeAll = () => {
      // Close any open app window first
      if (currentWinCleanup) currentWinCleanup();
      active = false;
      escKey.off('down', closeAll);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }

      // Hidden discovery — first time closing the computer, JP notices the bag
      if (!this.stashSmoked) {
        this.stashSmoked = true;
        this.frozen = true;
        InventorySystem.addItem('eighth', 1);
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP closes the laptop. Reaches behind the desk.' },
          { speaker: 'Narrator', text: 'A bag tucked behind the monitor. JP pockets it.' },
          { speaker: 'Narrator', text: 'Eighth added to inventory.' },
        ], () => { this.frozen = false; });
      } else {
        this.frozen = false;
      }
    };

    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', closeAll);

    // Click overlay (outside the laptop) to close
    overlay.on('pointerdown', closeAll);

    // App window state — track current open window for switching
    let currentWinObjs: Phaser.GameObjects.GameObject[] = [];
    let currentWinCleanup: (() => void) | null = null;

    // App window builder — can switch directly between apps
    const showAppWindow = (title: string, content: { speaker?: string; text: string }[]) => {
      // If another app is open, close it first (switch directly)
      if (!active && currentWinCleanup) {
        currentWinCleanup();
      }
      active = false;

      // App window overlay
      const winObjs: Phaser.GameObjects.GameObject[] = [];
      const winW = monW - 60;
      const winH = monH - 80;
      const winY = cy - 10;

      // Window background
      winObjs.push(this.add.rectangle(cx, winY, winW, winH, 0x1e1e2e).setScrollFactor(0).setDepth(310));
      // Title bar
      winObjs.push(this.add.rectangle(cx, winY - winH / 2 + 14, winW, 28, 0x2a2a3a).setScrollFactor(0).setDepth(311));
      // Traffic lights
      winObjs.push(this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 14, 5, 0xff5f57).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.circle(cx - winW / 2 + 36, winY - winH / 2 + 14, 5, 0xffbd2e).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.circle(cx - winW / 2 + 52, winY - winH / 2 + 14, 5, 0x28c940).setScrollFactor(0).setDepth(312));
      // Title text
      winObjs.push(this.add.text(cx, winY - winH / 2 + 14, title, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaacc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Content lines
      let lineY = winY - winH / 2 + 50;
      for (const line of content) {
        if (line.speaker) {
          winObjs.push(this.add.text(cx - winW / 2 + 20, lineY, line.speaker, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
          }).setScrollFactor(0).setDepth(312));
          lineY += 18;
        }
        winObjs.push(this.add.text(cx - winW / 2 + 20, lineY, line.text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#c0c0d0',
          wordWrap: { width: winW - 40 }, lineSpacing: 6,
        }).setScrollFactor(0).setDepth(312));
        lineY += 30;
      }

      // Close button (click red traffic light or press Space)
      const closeBtn = this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 14, 5, 0xff5f57)
        .setScrollFactor(0).setDepth(313).setInteractive({ useHandCursor: true });
      winObjs.push(closeBtn);

      const winSpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const winSpaceHandler = () => closeWin();

      const closeWin = () => {
        winSpace.off('down', winSpaceHandler);
        for (const o of winObjs) { if (o && o.active) (o as Phaser.GameObjects.GameObject).destroy(); }
        currentWinObjs = [];
        currentWinCleanup = null;
        active = true;
      };
      closeBtn.on('pointerdown', closeWin);
      winSpace.on('down', winSpaceHandler);

      // Track current window for switching
      currentWinObjs = winObjs;
      currentWinCleanup = closeWin;

      for (const o of winObjs) objects.push(o);
    };

    // IG DM interface — special handler
    const showInstagram = () => {
      // If another app is open, close it first
      if (!active && currentWinCleanup) {
        currentWinCleanup();
      }
      active = false;

      const winObjs: Phaser.GameObjects.GameObject[] = [];
      const winW = monW - 60;
      const winH = monH - 80;
      const winY = cy - 10;

      // Window bg
      winObjs.push(this.add.rectangle(cx, winY, winW, winH, 0x0a0a0a).setScrollFactor(0).setDepth(310));
      // IG header — gradient purple/orange
      winObjs.push(this.add.rectangle(cx, winY - winH / 2 + 24, winW, 48, 0x833ab4).setScrollFactor(0).setDepth(311));
      winObjs.push(this.add.rectangle(cx + 100, winY - winH / 2 + 24, winW / 2, 48, 0xc13584).setScrollFactor(0).setDepth(311).setAlpha(0.6));
      // IG logo text
      winObjs.push(this.add.text(cx, winY - winH / 2 + 16, 'Instagram', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.text(cx, winY - winH / 2 + 34, 'Direct Messages', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ddddee',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Traffic lights
      winObjs.push(this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 12, 5, 0xff5f57).setScrollFactor(0).setDepth(313));
      winObjs.push(this.add.circle(cx - winW / 2 + 36, winY - winH / 2 + 12, 5, 0xffbd2e).setScrollFactor(0).setDepth(313));
      winObjs.push(this.add.circle(cx - winW / 2 + 52, winY - winH / 2 + 12, 5, 0x28c940).setScrollFactor(0).setDepth(313));

      // DM conversation list (left panel)
      const panelX = cx - winW / 2;
      const panelW = 200;
      winObjs.push(this.add.rectangle(panelX + panelW / 2, winY + 20, panelW, winH - 60, 0x121212).setScrollFactor(0).setDepth(311));
      // Divider line
      winObjs.push(this.add.rectangle(panelX + panelW, winY + 20, 1, winH - 60, 0x333333).setScrollFactor(0).setDepth(312));

      // DM contacts
      const dms = [
        { name: 'Nolan', preview: 'bro come thru this wknd', active: true },
        { name: 'David', preview: 'lmao u see that video', active: false },
        { name: 'Cooper', preview: 'yo', active: false },
        { name: 'Random Girl', preview: 'hey :)', active: false },
      ];

      let dmY = winY - winH / 2 + 70;
      for (const dm of dms) {
        // DM row highlight if active
        if (dm.active) {
          winObjs.push(this.add.rectangle(panelX + panelW / 2, dmY + 10, panelW - 4, 40, 0x1e1e2e).setScrollFactor(0).setDepth(312));
        }
        // Profile circle
        winObjs.push(this.add.circle(panelX + 22, dmY + 10, 12, dm.active ? 0x833ab4 : 0x333333).setScrollFactor(0).setDepth(312));
        winObjs.push(this.add.text(panelX + 22, dmY + 10, dm.name[0], {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(313));
        // Name
        winObjs.push(this.add.text(panelX + 42, dmY, dm.name, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: dm.active ? '#ffffff' : '#888888',
        }).setScrollFactor(0).setDepth(312));
        // Preview
        winObjs.push(this.add.text(panelX + 42, dmY + 14, dm.preview, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666666',
        }).setScrollFactor(0).setDepth(312));

        // Blue dot for unread
        if (dm.active) {
          winObjs.push(this.add.circle(panelX + panelW - 14, dmY + 10, 4, 0x3897f0).setScrollFactor(0).setDepth(312));
        }

        dmY += 46;
      }

      // Right panel — active conversation with Nolan
      const chatX = panelX + panelW + 10;
      const chatW = winW - panelW - 10;

      // Chat header
      winObjs.push(this.add.text(chatX + chatW / 2, winY - winH / 2 + 60, 'Nolan', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.text(chatX + chatW / 2, winY - winH / 2 + 76, 'Active now', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#44bb44',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Chat messages — bubble style
      const messages = [
        { from: 'nolan', text: 'yooo JP' },
        { from: 'nolan', text: 'bro this weekend' },
        { from: 'nolan', text: 'santa barbara' },
        { from: 'nolan', text: 'frat house on the beach' },
        { from: 'nolan', text: 'david n cooper already down' },
        { from: 'jp', text: 'who else going' },
        { from: 'nolan', text: 'terrell, some girls from UCSB' },
        { from: 'nolan', text: 'bro come thru this wknd 🔥' },
      ];

      let msgY = winY - winH / 2 + 96;
      for (const msg of messages) {
        const isJP = msg.from === 'jp';
        const bubbleColor = isJP ? 0x3897f0 : 0x262626;
        const textColor = '#ffffff';
        const msgX = isJP ? chatX + chatW - 30 : chatX + 20;
        const originX = isJP ? 1 : 0;

        // Bubble
        const textObj = this.add.text(msgX, msgY, msg.text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: textColor,
          padding: { x: 8, y: 6 },
          backgroundColor: isJP ? '#3897f0' : '#262626',
        }).setOrigin(originX, 0).setScrollFactor(0).setDepth(312);
        winObjs.push(textObj);

        msgY += 26;
      }

      // Close on red button, ESC, or Space
      const closeBtn = this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 12, 5, 0xff5f57)
        .setScrollFactor(0).setDepth(314).setInteractive({ useHandCursor: true });
      winObjs.push(closeBtn);

      const igSpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const igSpaceHandler = () => closeWin();

      const closeWin = () => {
        igSpace.off('down', igSpaceHandler);
        for (const o of winObjs) { if (o && o.active) (o as Phaser.GameObjects.GameObject).destroy(); }
        currentWinObjs = [];
        currentWinCleanup = null;
        active = true;
      };
      closeBtn.on('pointerdown', closeWin);
      igSpace.on('down', igSpaceHandler);

      // Track for switching
      currentWinObjs = winObjs;
      currentWinCleanup = closeWin;

      for (const o of winObjs) objects.push(o);
    };

    // Wire up app clicks
    appButtons[0].on('pointerdown', () => showAppWindow('Safari — Coinbase', [
      { speaker: 'Coinbase', text: 'Portfolio: $5,000 → $7,200  (+44%)' },
      { text: 'BTC: $40,000   (+18%)' },
      { text: 'ETH: $2,800    (+32%)' },
      { text: 'SOL: $38.50    (+54%)' },
      { text: 'LUNA: $5.20    (+12%)' },
      { speaker: 'JP\'s Mind', text: '5K turned into 7 already. This is just the beginning.' },
      { speaker: 'JP\'s Mind', text: 'Pops would kill me if he knew.' },
    ]));

    appButtons[1].on('pointerdown', () => showAppWindow('Mail — Inbox (3)', [
      { speaker: 'UC Davis Admissions', text: 'Congratulations! You have been accepted...' },
      { speaker: 'Sac State', text: 'We are pleased to offer you admission...' },
      { speaker: 'Sonoma State', text: 'Dear Jordan, Welcome to the Seawolf family...' },
      { speaker: 'JP\'s Mind', text: '$40K a year for something I can learn on YouTube? Nah.' },
    ]));

    appButtons[2].on('pointerdown', () => showInstagram());

    appButtons[3].on('pointerdown', () => showAppWindow('YouTube — Trending', [
      { text: '"How I Made $10K/Month Dropshipping" — 2.1M views' },
      { text: '"Crypto Trading for Beginners" — 890K views' },
      { text: '"Affiliate Marketing Blueprint" — 1.4M views' },
      { speaker: 'JP\'s Mind', text: 'Everyone selling the dream. Nobody shows the work.' },
    ]));

    appButtons[4].on('pointerdown', () => closeAll());
  }

  // ─── LIFTING MINIGAME (Dumbbell Curls) ─────────────────────────
  private playLiftingMinigame() {
    const objects: Phaser.GameObjects.GameObject[] = [];
    let reps = 0;
    let timeLeft = 15;
    let gameOver = false;

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(300));

    // Title
    objects.push(this.add.text(GAME_WIDTH / 2, 40, 'DUMBBELL CURLS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310));

    // Instructions
    objects.push(this.add.text(GAME_WIDTH / 2, 70, 'MASH SPACE to curl!', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310));

    // Exit button
    const exitBtn = this.add.text(80, 40, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);

    // JP sprite (big, center)
    const jpSprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, this.getPlayerTexture(), 0)
      .setScale(6).setScrollFactor(0).setDepth(305);
    objects.push(jpSprite);

    // Dumbbell in JP's hand
    const dumbbell = this.add.rectangle(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 50, 50, 16, 0x404040)
      .setScrollFactor(0).setDepth(306);
    objects.push(dumbbell);
    const plate1 = this.add.rectangle(GAME_WIDTH / 2 + 55, GAME_HEIGHT / 2 + 50, 14, 24, 0x303030)
      .setScrollFactor(0).setDepth(306);
    objects.push(plate1);
    const plate2 = this.add.rectangle(GAME_WIDTH / 2 + 105, GAME_HEIGHT / 2 + 50, 14, 24, 0x303030)
      .setScrollFactor(0).setDepth(306);
    objects.push(plate2);

    // Rep counter
    const repText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, '0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '48px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(repText);

    const repLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'REPS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(repLabel);

    // Timer
    const timerText = this.add.text(GAME_WIDTH - 100, 40, '15', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(timerText);

    // Countdown timer
    const countdown = this.time.addEvent({
      delay: 1000,
      repeat: 14,
      callback: () => {
        timeLeft--;
        timerText.setText(String(timeLeft));
        if (timeLeft <= 5) timerText.setColor('#ff4444');
        if (timeLeft <= 0) {
          gameOver = true;
          spaceKey.off('down', curlHandler);
          this.input.off('pointerdown', curlHandler);
          endGame();
        }
      },
    });

    // Curl animation on Space
    const doCurl = () => {
      if (gameOver) return;
      reps++;
      repText.setText(String(reps));

      // Curl animation — dumbbell goes up then down
      const baseY = GAME_HEIGHT / 2 + 50;
      this.tweens.add({
        targets: [dumbbell, plate1, plate2],
        y: baseY - 60,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      // JP squish (effort)
      this.tweens.add({
        targets: jpSprite,
        scaleX: 6.3,
        scaleY: 5.7,
        duration: 80,
        yoyo: true,
      });

      // Sweat particle every 5 reps
      if (reps % 5 === 0) {
        const sweat = this.add.circle(
          GAME_WIDTH / 2 - 30 + Phaser.Math.Between(-10, 10),
          GAME_HEIGHT / 2 - 20,
          3, 0x60a0e0, 0.8
        ).setScrollFactor(0).setDepth(308);
        objects.push(sweat);
        this.tweens.add({
          targets: sweat,
          y: sweat.y + 60,
          alpha: 0,
          duration: 800,
          onComplete: () => sweat.destroy(),
        });
      }

      // Milestone text
      if (reps === 10) {
        this.showFloatingText('WARMING UP', '#f0c040');
      } else if (reps === 20) {
        this.showFloatingText('LOCKED IN', '#40c060');
      } else if (reps === 30) {
        this.showFloatingText('BEAST MODE', '#ff4040');
        this.cameras.main.shake(200, 0.003);
      }
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const curlHandler = () => doCurl();
    spaceKey.on('down', curlHandler);
    this.input.on('pointerdown', curlHandler);

    const endGame = () => {
      countdown.remove();

      // Result
      let msg: string;
      let color: string;
      if (reps >= 30) {
        msg = 'BEAST. ' + reps + ' reps.';
        color = '#ff4040';
        MoodSystem.setMood('locked_in', 60);
      } else if (reps >= 20) {
        msg = 'Solid. ' + reps + ' reps.';
        color = '#40c060';
        MoodSystem.setMood('locked_in', 45);
      } else if (reps >= 10) {
        msg = 'Not bad. ' + reps + ' reps.';
        color = '#f0c040';
      } else {
        msg = reps + ' reps. Gotta do better.';
        color = '#888888';
      }

      const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, msg, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
      objects.push(resultText);

      this.time.delayedCall(2500, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: reps >= 20 ? 'Gotta stay disciplined.' : 'Need to hit these more.' },
        ], () => { this.frozen = false; });
      });
    };

    exitBtn.on('pointerdown', () => {
      gameOver = true;
      countdown.remove();
      spaceKey.off('down', curlHandler);
      this.input.off('pointerdown', curlHandler);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    });

    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.once('down', () => {
      gameOver = true;
      countdown.remove();
      spaceKey.off('down', curlHandler);
      this.input.off('pointerdown', curlHandler);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    });
  }

  private showFloatingText(text: string, color: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, text, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(311).setAlpha(0);
    this.tweens.add({
      targets: t,
      alpha: 1,
      y: t.y - 30,
      duration: 400,
      hold: 600,
      yoyo: true,
      onComplete: () => t.destroy(),
    });
  }

  private playFishing() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let totalCaught = 0;
    let round = 0;
    const totalRounds = 3;
    let gameOver = false;

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300));

    // Scenery — grass bank at top
    objects.push(this.add.rectangle(GAME_WIDTH / 2, 130, GAME_WIDTH - 100, 160, 0x4a8c3f)
      .setScrollFactor(0).setDepth(300));

    // JP sprite on bank
    const jpSprite = this.add.sprite(300, 160, this.getPlayerTexture(), 0)
      .setScale(4).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Pops sprite nearby
    const popsSprite = this.add.sprite(180, 170, 'npc_pops', 0)
      .setScale(3.5).setScrollFactor(0).setDepth(302);
    objects.push(popsSprite);

    // Pond — deeper blue with gradient
    const pondY = GAME_HEIGHT / 2 + 120;
    const pondW = GAME_WIDTH - 100;
    const pondH = 380;
    objects.push(this.add.rectangle(GAME_WIDTH / 2, pondY, pondW, pondH, 0x1a4878)
      .setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(GAME_WIDTH / 2, pondY - 60, pondW, 80, 0x2060a0)
      .setScrollFactor(0).setDepth(300).setAlpha(0.5));

    // Water ripple animations
    for (let i = 0; i < 6; i++) {
      const ripple = this.add.circle(200 + Math.random() * 900, pondY - 80 + Math.random() * 300, 15 + Math.random() * 20, 0x3080c0, 0.15)
        .setScrollFactor(0).setDepth(301);
      objects.push(ripple);
      this.tweens.add({ targets: ripple, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 2000 + Math.random() * 2000, repeat: -1, delay: Math.random() * 2000 });
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 30, 'FISHING WITH POPS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(title);

    // Exit button
    const exitBtn = this.add.text(80, 30, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);

    // Score
    const scoreText = this.add.text(GAME_WIDTH - 100, 30, 'Caught: 0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(scoreText);

    // Bobber
    const bobberX = GAME_WIDTH / 2 + 50;
    const bobberRestY = pondY - pondH / 2 + 40;
    const bobber = this.add.circle(bobberX, bobberRestY, 6, 0xff3030).setScrollFactor(0).setDepth(303);
    objects.push(bobber);
    objects.push(this.add.circle(bobberX, bobberRestY - 3, 3, 0xffffff).setScrollFactor(0).setDepth(304));

    // Fishing line from JP to bobber
    const fishLine = this.add.line(0, 0, 320, 140, bobberX, bobberRestY, 0xffffff, 0.4)
      .setScrollFactor(0).setDepth(302).setLineWidth(1);
    objects.push(fishLine);

    // Fish shadows (ellipse bodies + tail ellipses)
    const fishBodies: Phaser.GameObjects.Ellipse[] = [];
    const fishTails: Phaser.GameObjects.Ellipse[] = [];
    const fishSpeeds: number[] = [];
    for (let i = 0; i < 7; i++) {
      const sx = 150 + Math.random() * 1000;
      const sy = pondY - 60 + Math.random() * 250;
      const bodyW = 16 + Math.random() * 16; // varied sizes
      const bodyH = 6 + Math.random() * 4;
      const speed = (0.4 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);
      const tailOffsetX = speed > 0 ? -(bodyW / 2 + 3) : (bodyW / 2 + 3);
      const body = this.add.ellipse(sx, sy, bodyW, bodyH, 0x0a2040, 0.3)
        .setScrollFactor(0).setDepth(301);
      const tail = this.add.ellipse(sx + tailOffsetX, sy, bodyW * 0.35, bodyH * 0.7, 0x0a2040, 0.25)
        .setScrollFactor(0).setDepth(301);
      objects.push(body); objects.push(tail);
      fishBodies.push(body); fishTails.push(tail);
      fishSpeeds.push(speed);
    }
    const fishUpdate = () => {
      for (let i = 0; i < fishBodies.length; i++) {
        const b = fishBodies[i]; if (!b.active) continue;
        b.x += fishSpeeds[i];
        const tailOff = fishSpeeds[i] > 0 ? -(b.width / 2 + 3) : (b.width / 2 + 3);
        fishTails[i].x = b.x + tailOff;
        fishTails[i].y = b.y;
        if (b.x < 100 || b.x > GAME_WIDTH - 100) fishSpeeds[i] *= -1;
      }
    };
    this.events.on('update', fishUpdate);

    // Reel progress bar (hidden until bite)
    const barX = GAME_WIDTH / 2;
    const barY = pondY - pondH / 2 - 20;
    const barW = 300;
    const barBg = this.add.rectangle(barX, barY, barW, 20, 0x1a1a2a).setScrollFactor(0).setDepth(305).setVisible(false);
    const barFill = this.add.rectangle(barX - barW / 2, barY, 0, 16, 0x40c060).setOrigin(0, 0.5).setScrollFactor(0).setDepth(306).setVisible(false);
    const barBorder = this.add.rectangle(barX, barY, barW, 20).setStrokeStyle(2, 0x4060a0).setScrollFactor(0).setDepth(307).setVisible(false).setFillStyle(0, 0);
    objects.push(barBg, barFill, barBorder);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Waiting for a bite...', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(instr);

    // State
    let phase: 'waiting' | 'bite' | 'reeling' | 'done' = 'waiting';
    let reelProgress = 0;
    let reelDecay = 0;

    const fishData = [
      { name: 'Largemouth Bass', size: '3.2 lbs', color: 0x408040 },
      { name: 'Rainbow Trout', size: '1.8 lbs', color: 0xc06080 },
      { name: 'Channel Catfish', size: '5.1 lbs', color: 0x706050 },
    ];

    const startRound = () => {
      phase = 'waiting';
      reelProgress = 0;
      barFill.displayWidth = 0;
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      instr.setText(`Round ${round + 1}/${totalRounds} — Casting...`);

      // --- Cast animation ---
      // Start bobber near JP, animate it to the pond
      bobber.setPosition(340, 160);
      fishLine.setTo(320, 140, 340, 160);

      // "Cast!" text
      const castText = this.add.text(GAME_WIDTH / 2, pondY - 120, 'Cast!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setAlpha(1);
      objects.push(castText);
      this.tweens.add({ targets: castText, alpha: 0, y: pondY - 160, duration: 800, ease: 'Quad.easeOut' });

      // Tween bobber to pond
      this.tweens.add({
        targets: bobber,
        x: bobberX,
        y: bobberRestY,
        duration: 500,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          fishLine.setTo(320, 140, bobber.x, bobber.y);
        },
        onComplete: () => {
          // Splash circle at landing
          const splash = this.add.circle(bobberX, bobberRestY, 4, 0x80c0ff, 0.7)
            .setScrollFactor(0).setDepth(303);
          objects.push(splash);
          this.tweens.add({ targets: splash, radius: 20, alpha: 0, scaleX: 3, scaleY: 2, duration: 500, onComplete: () => splash.destroy() });

          instr.setText(`Round ${round + 1}/${totalRounds} — Wait for a bite...`);

          // Gentle bobber float
          this.tweens.add({ targets: bobber, y: bobberRestY + 4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

          this.time.delayedCall(2000 + Math.random() * 3000, () => {
            if (gameOver || phase !== 'waiting') return;
            triggerBite();
          });
        },
      });
    };

    const triggerBite = () => {
      phase = 'bite';
      this.tweens.killTweensOf(bobber);
      this.tweens.add({ targets: bobber, y: bobberRestY + 20, duration: 100, yoyo: true, repeat: 5, ease: 'Bounce.easeOut' });
      this.cameras.main.shake(150, 0.006);
      instr.setText('MASH SPACE to reel it in!');
      instr.setColor('#ff4444');

      // "BITE!" flash text
      const biteText = this.add.text(bobberX, pondY - 20, 'BITE!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '22px', color: '#ff2222',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312).setScale(0.3);
      objects.push(biteText);
      this.tweens.add({ targets: biteText, scale: 1.4, alpha: 0, duration: 300, ease: 'Quad.easeOut', onComplete: () => biteText.destroy() });

      // Show reel bar
      barBg.setVisible(true); barFill.setVisible(true); barBorder.setVisible(true);
      reelProgress = 0;
      reelDecay = 0.4 + round * 0.15; // harder each round
      phase = 'reeling';

      // Fish fights back — progress decays over time
      const reelUpdate = () => {
        if (phase !== 'reeling' || gameOver) { this.events.off('update', reelUpdate); return; }
        reelProgress -= reelDecay;
        if (reelProgress < 0) reelProgress = 0;
        barFill.displayWidth = (reelProgress / 100) * barW;
        // Color gradient: green → yellow → full
        if (reelProgress > 70) barFill.setFillStyle(0x40f060);
        else if (reelProgress > 40) barFill.setFillStyle(0xf0c040);
        else barFill.setFillStyle(0x40c060);

        if (reelProgress >= 100) {
          phase = 'done';
          this.events.off('update', reelUpdate);
          catchFish();
        }
      };
      this.events.on('update', reelUpdate);

      // Timeout — 5 seconds to reel it in
      this.time.delayedCall(5000, () => {
        if (phase === 'reeling') {
          phase = 'done';
          missRound();
        }
      });
    };

    const catchPhrases = ["That's a keeper!", "Nice one, son!", "Just like when you were little."];
    const missPhrases = ["Almost had it.", "They're fighters today.", "Patience, JP."];

    const showPopsComment = (caught: boolean) => {
      const phrases = caught ? catchPhrases : missPhrases;
      const line = phrases[Math.floor(Math.random() * phrases.length)];
      const bubble = this.add.text(popsSprite.x + 40, popsSprite.y - 40, line, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
        backgroundColor: '#333355', padding: { x: 6, y: 4 },
      }).setOrigin(0, 1).setScrollFactor(0).setDepth(312);
      objects.push(bubble);
      this.tweens.add({ targets: bubble, alpha: 0, delay: 1200, duration: 300, onComplete: () => bubble.destroy() });
    };

    const spawnSplashParticles = () => {
      for (let i = 0; i < 9; i++) {
        const angle = (Math.PI * 2 / 9) * i + (Math.random() - 0.5) * 0.4;
        const dist = 30 + Math.random() * 30;
        const p = this.add.circle(bobber.x, bobber.y, 2 + Math.random() * 3, 0x60a0e0, 0.8)
          .setScrollFactor(0).setDepth(309);
        objects.push(p);
        this.tweens.add({
          targets: p,
          x: bobber.x + Math.cos(angle) * dist,
          y: bobber.y + Math.sin(angle) * dist,
          alpha: 0, scale: 0.3, duration: 400 + Math.random() * 200, ease: 'Quad.easeOut',
          onComplete: () => p.destroy(),
        });
      }
    };

    const catchFish = () => {
      totalCaught++;
      scoreText.setText(`Caught: ${totalCaught}`);
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      this.cameras.main.flash(300, 255, 255, 255);

      // Splash particles
      spawnSplashParticles();

      const fish = fishData[round] || fishData[0];
      const caughtText = this.add.text(GAME_WIDTH / 2, pondY - 100, `${fish.name}\n${fish.size}`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40f060', align: 'center', lineSpacing: 8,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
      objects.push(caughtText);

      // Fish shape flies up
      const fishShape = this.add.rectangle(GAME_WIDTH / 2, pondY - 40, 30, 12, fish.color).setScrollFactor(0).setDepth(308);
      objects.push(fishShape);
      this.tweens.add({ targets: fishShape, y: pondY - 140, alpha: 0, duration: 1200, ease: 'Quad.easeOut' });

      instr.setText('Nice catch!');
      instr.setColor('#40f060');

      // Pops commentary
      this.time.delayedCall(600, () => showPopsComment(true));

      this.time.delayedCall(2500, () => {
        caughtText.destroy();
        round++;
        if (round < totalRounds) startRound();
        else finishFishing();
      });
    };

    const missRound = () => {
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      const miss = this.add.text(GAME_WIDTH / 2, pondY - 80, 'It got away!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ff6666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
      objects.push(miss);
      instr.setText('Too slow...');
      instr.setColor('#ff6666');

      // Pops commentary
      this.time.delayedCall(600, () => showPopsComment(false));

      this.time.delayedCall(2500, () => {
        miss.destroy();
        round++;
        if (round < totalRounds) startRound();
        else finishFishing();
      });
    };

    // Space = reel (add progress)
    const reelInput = () => {
      if (phase === 'reeling') {
        reelProgress += 8;
        // Bobber jerks up
        this.tweens.add({ targets: bobber, y: bobberRestY - 5, duration: 50, yoyo: true });
      }
    };

    const finishFishing = () => {
      gameOver = true;
      this.events.off('update', fishUpdate);
      spaceKey.off('down', reelInput);
      this.input.off('pointerdown', reelInput);
      escKey.off('down', exitHandler);

      title.setText(totalCaught === totalRounds ? 'FULL BUCKET!' : totalCaught > 0 ? 'NOT BAD' : 'SKUNKED');
      instr.setText(`Total: ${totalCaught}/${totalRounds}`);
      instr.setColor('#ffffff');

      // Locked in on perfect fishing
      if (totalCaught === totalRounds) {
        MoodSystem.setMood('locked_in', 45);
      }

      this.time.delayedCall(2000, () => {
        for (const obj of objects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
        this.dialogue.show([
          { speaker: 'Pops', text: 'Not bad. Remember when we used to do this every weekend?' },
          { speaker: 'JP', text: 'Yeah. I miss that.' },
          { speaker: 'Pops', text: 'We\'ll do it again. When you come back.' },
          { speaker: 'Pops', text: 'Alright, I gotta head to work. Early shift.' },
          { speaker: 'Narrator', text: 'Pops daps up JP and walks toward the truck.' },
        ], () => {
          // Pops walks to garage
          this.moveNPCTo('ch0_pops', 34, 28, 2500, () => {
            // Garage door opens — white folding panels roll up
            const doorX = 35 * SCALED_TILE + SCALED_TILE / 2;
            const doorY = 30 * SCALED_TILE + SCALED_TILE / 2;

            // Door panels that slide up (like a real garage door)
            const panel1 = this.add.rectangle(doorX, doorY, SCALED_TILE * 3, SCALED_TILE * 0.25, 0xe8e0d4).setDepth(6);
            const panel2 = this.add.rectangle(doorX, doorY - 8, SCALED_TILE * 3, SCALED_TILE * 0.25, 0xd8d0c4).setDepth(6);
            const panel3 = this.add.rectangle(doorX, doorY + 8, SCALED_TILE * 3, SCALED_TILE * 0.25, 0xe0d8cc).setDepth(6);

            // Roll them up with a slight delay between each
            this.cameras.main.shake(100, 0.002); // rumble as door opens
            this.tweens.add({ targets: panel3, y: doorY - SCALED_TILE, alpha: 0, duration: 400 });
            this.tweens.add({ targets: panel2, y: doorY - SCALED_TILE - 8, alpha: 0, duration: 400, delay: 100 });
            this.tweens.add({ targets: panel1, y: doorY - SCALED_TILE - 16, alpha: 0, duration: 400, delay: 200 });

            // Remove door collision so it's now open
            this.collisionTiles.delete('35,30');

            // Cover the door tile with concrete (open garage)
            const openDoor = this.add.rectangle(doorX, doorY, SCALED_TILE * 3, SCALED_TILE, 0x505058).setDepth(0);

            // After door opens, Pops drives out
            this.time.delayedCall(800, () => {
              const pops = this.findNPC('ch0_pops');
              if (pops) {
                // Pops moves out through the open door and down the driveway
                this.moveNPCTo('ch0_pops', 35, 31, 600, () => {
                  this.moveNPCTo('ch0_pops', 35, 39, 1500, () => {
                    // Pops disappears (drove away)
                    this.tweens.add({
                      targets: pops.sprite,
                      alpha: 0,
                      duration: 500,
                      onComplete: () => {
                        this.collisionTiles.delete('35,39');
                        pops.dialogue = [
                          { speaker: 'Narrator', text: 'Pops already left for work.' },
                        ];
                      },
                    });
                  });
                });
              }
              this.frozen = false;
            });
          });
        });
      });
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', reelInput);
    this.input.on('pointerdown', reelInput);
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const exitHandler = () => finishFishing();
    escKey.on('down', exitHandler);
    exitBtn.on('pointerdown', exitHandler);

    startRound();
  }

  private playGoodbyeCutscene() {
    this.frozen = true;

    // Step 1: Ask if ready to leave
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Ready to head to Santa Barbara?' },
    ], () => {
      // Show yes/no choice
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2;

      const yesBg = this.add.rectangle(cx - 80, cy, 120, 40, 0x30a040)
        .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
      const yesText = this.add.text(cx - 80, cy, 'Yeah', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      const noBg = this.add.rectangle(cx + 80, cy, 120, 40, 0xa03030)
        .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
      const noText = this.add.text(cx + 80, cy, 'Not yet', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      yesBg.on('pointerover', () => yesBg.setFillStyle(0x40c050));
      yesBg.on('pointerout', () => yesBg.setFillStyle(0x30a040));
      noBg.on('pointerover', () => noBg.setFillStyle(0xc04040));
      noBg.on('pointerout', () => noBg.setFillStyle(0xa03030));

      const cleanup = () => {
        yesBg.destroy(); yesText.destroy();
        noBg.destroy(); noText.destroy();
      };

      noBg.on('pointerdown', () => {
        cleanup();
        this.frozen = false;
      });

      yesBg.on('pointerdown', () => {
        cleanup();
        this.runGoodbyeSequence();
      });

      // Space = yes, N = not yet
      const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
      const spaceHandler = () => {
        spaceKey.off('down', spaceHandler);
        nKey.off('down', nHandler);
        cleanup();
        this.runGoodbyeSequence();
      };
      const nHandler = () => {
        spaceKey.off('down', spaceHandler);
        nKey.off('down', nHandler);
        cleanup();
        this.frozen = false;
      };
      spaceKey.on('down', spaceHandler);
      nKey.on('down', nHandler);
    });
  }

  private runGoodbyeSequence() {
    // JP takes one last look
    this.dialogue.show([
      { speaker: 'Narrator', text: 'JP takes one last look around. This is home.' },
    ], () => {
      // Walk south toward the street
      const exitY = this.player.y + SCALED_TILE * 2;
      this.tweens.add({
        targets: this.player,
        y: exitY,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          // Screen dims
          const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setScrollFactor(0).setDepth(50).setAlpha(0);
          this.tweens.add({
            targets: dim,
            alpha: 0.3,
            duration: 400,
            onComplete: () => {
              this.dialogue.show([
                { speaker: 'Narrator', text: 'He grabs his bag. Hugs his sister. Daps up Pops.' },
                { speaker: 'Narrator', text: 'Ivy whines at the door. She knows.' },
              ], () => {
                this.tweens.add({
                  targets: this.player,
                  y: this.player.y + SCALED_TILE * 2,
                  duration: 1000,
                  ease: 'Linear',
                  onComplete: () => {
                    this.tweens.add({
                      targets: dim,
                      alpha: 0,
                      duration: 300,
                      onComplete: () => {
                        dim.destroy();
                        this.frozen = false;
                      },
                    });
                  },
                });
              });
            },
          });
        },
      });
    });
  }

  private playFetch() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let score = 0;
    let round = 0;
    const totalRounds = 3;
    let gameEnded = false;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Green yard background
    const yard = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, GAME_WIDTH - 160, 500, 0x4a8c3f)
      .setScrollFactor(0).setDepth(300);
    objects.push(yard);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'FETCH WITH IVY!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Exit button
    const exitBtn = this.add.text(80, 70, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);
    exitBtn.on('pointerdown', () => finishGame());
    const escExit = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escExit.on('down', () => finishGame());

    // Score display
    const scoreText = this.add.text(GAME_WIDTH - 100, 70, 'Score: 0/3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(scoreText);

    // JP position (left side)
    const jpSprite = this.add.sprite(200, GAME_HEIGHT / 2 + 100, this.getPlayerTexture(), 6)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Ivy sprite (near JP)
    const frenchie = this.npcs.find(n => n.id === 'ch0_frenchie');
    const ivyTexture = frenchie ? 'npc_frenchie' : this.getPlayerTexture();
    const ivyStartX = 260;
    const ivyStartY = GAME_HEIGHT / 2 + 140;
    const ivy = this.add.sprite(ivyStartX, ivyStartY, ivyTexture, 0)
      .setScale(4).setScrollFactor(0).setDepth(302);
    objects.push(ivy);

    // Idle tail wag animation
    this.tweens.add({ targets: ivy, angle: 3, duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Aim line (oscillating angle indicator)
    const aimLine = this.add.line(0, 0, 200, GAME_HEIGHT / 2 + 80, 500, GAME_HEIGHT / 2 - 100, 0xffffff, 0.6)
      .setScrollFactor(0).setDepth(301).setLineWidth(2);
    objects.push(aimLine);

    // Power bar (vertical, near JP)
    const powerBarX = 120;
    const powerBarY = GAME_HEIGHT / 2 - 20;
    const powerBarH = 200;
    const powerBarW = 16;
    const powerBg = this.add.rectangle(powerBarX, powerBarY, powerBarW, powerBarH, 0x1a1a2a)
      .setScrollFactor(0).setDepth(303);
    objects.push(powerBg);
    const powerFill = this.add.rectangle(powerBarX, powerBarY + powerBarH / 2, powerBarW - 4, 0, 0x40c060)
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(304);
    objects.push(powerFill);
    const powerBorder = this.add.rectangle(powerBarX, powerBarY, powerBarW, powerBarH)
      .setStrokeStyle(2, 0x4060a0).setFillStyle(0, 0).setScrollFactor(0).setDepth(305);
    objects.push(powerBorder);
    const powerLabel = this.add.text(powerBarX, powerBarY - powerBarH / 2 - 14, 'PWR', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
    objects.push(powerLabel);

    // Instruction
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Hold SPACE to charge, release to throw!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Aim angle oscillation
    let aimAngle = 0;
    let aimDir = 1;
    let aiming = true;
    const aimSpeed = 0.03;

    // Power charge state
    let charging = false;
    let power = 0;
    const maxPower = 100;
    const chargeSpeed = 1.8; // per frame
    let powerOscDir = 1;

    const startRound = (animate: boolean) => {
      if (animate && (ivy.x !== ivyStartX || ivy.y !== ivyStartY)) {
        // Animate Ivy running back to JP
        aiming = false;
        aimLine.setVisible(false);
        this.tweens.add({
          targets: ivy,
          x: ivyStartX,
          y: ivyStartY,
          duration: 500,
          ease: 'Quad.easeInOut',
          onComplete: () => {
            ivy.setAngle(0);
            beginAiming();
          },
        });
      } else {
        ivy.setPosition(ivyStartX, ivyStartY);
        beginAiming();
      }
    };

    const beginAiming = () => {
      aiming = true;
      charging = false;
      power = 0;
      powerFill.displayHeight = 0;
      aimAngle = 0;
      aimDir = 1;
      aimLine.setVisible(true);
      instr.setText(`Round ${round + 1}/${totalRounds} — Hold SPACE to charge!`);
    };

    // Update aim line + power
    const updateHandler = () => {
      if (gameEnded) return;
      if (aiming) {
        aimAngle += aimSpeed * aimDir;
        if (aimAngle > 1.2) aimDir = -1;
        if (aimAngle < -1.2) aimDir = 1;

        // Aim line length based on current power (min 150, max 500)
        const throwDist = 150 + (power / maxPower) * 350;
        const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
        const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;
        aimLine.setTo(200, GAME_HEIGHT / 2 + 80, endX, endY);
      }

      // Charge power while holding
      if (charging && aiming) {
        power += chargeSpeed * powerOscDir;
        if (power >= maxPower) { power = maxPower; powerOscDir = -1; }
        if (power <= 30 && powerOscDir === -1) { powerOscDir = 1; }
        powerFill.displayHeight = (power / maxPower) * (powerBarH - 4);

        // Color: green → yellow → red at max
        if (power > 80) powerFill.setFillStyle(0xf04040);
        else if (power > 50) powerFill.setFillStyle(0xf0c040);
        else powerFill.setFillStyle(0x40c060);
      }
    };

    this.events.on('update', updateHandler);

    const throwBall = () => {
      if (!aiming || !charging) return;
      charging = false;
      aiming = false;
      aimLine.setVisible(false);

      const throwPower = Math.max(power, 20); // minimum throw
      const throwDist = 150 + (throwPower / maxPower) * 350;
      const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
      const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;

      // JP throw animation
      this.tweens.add({ targets: jpSprite, scaleX: 5.5, duration: 80, yoyo: true });

      // Create ball
      const ball = this.add.circle(200, GAME_HEIGHT / 2 + 80, 8, 0xc0d030)
        .setScrollFactor(0).setDepth(303);
      objects.push(ball);

      // Fly ball
      this.tweens.add({
        targets: ball,
        x: endX,
        y: endY,
        duration: 400 + (throwDist / 500) * 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          const inYard = endX > 140 && endX < GAME_WIDTH - 140 &&
                         endY > 180 && endY < GAME_HEIGHT - 80;

          // Ball bounce on landing
          this.tweens.add({
            targets: ball,
            y: ball.y - 20,
            duration: 120,
            yoyo: true,
            ease: 'Quad.easeOut',
          });

          // Dust puff at landing
          for (let d = 0; d < 3; d++) {
            const dust = this.add.circle(
              endX + Phaser.Math.Between(-15, 15),
              endY + Phaser.Math.Between(-5, 5),
              3 + Math.random() * 3, 0x8a7a5a, 0.5
            ).setScrollFactor(0).setDepth(302);
            objects.push(dust);
            this.tweens.add({
              targets: dust,
              y: dust.y - 10 - Math.random() * 10,
              alpha: 0,
              scale: 2,
              duration: 400,
              delay: d * 60,
              onComplete: () => dust.destroy(),
            });
          }

          if (inYard) {
            // Ivy chases ball
            this.tweens.killTweensOf(ivy);
            this.tweens.add({
              targets: ivy,
              x: endX,
              y: endY,
              duration: 500 + throwDist * 0.5,
              ease: 'Quad.easeInOut',
              onUpdate: () => {
                // Flip Ivy to face direction of travel
                ivy.setFlipX(ivy.x > endX);
              },
              onComplete: () => {
                ball.destroy();
                score++;
                scoreText.setText(`Score: ${score}/${totalRounds}`);

                // Good girl text
                const good = this.add.text(ivy.x, ivy.y - 40, 'Good girl Ivy!', {
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '10px',
                  color: '#40c040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
                objects.push(good);

                // Wiggle celebration
                this.tweens.add({
                  targets: ivy,
                  angle: 10,
                  duration: 80,
                  yoyo: true,
                  repeat: 4,
                  onComplete: () => {
                    this.tweens.add({
                      targets: good,
                      alpha: 0,
                      y: good.y - 20,
                      duration: 500,
                      onComplete: () => {
                        good.destroy();
                        // Restart tail wag
                        this.tweens.add({ targets: ivy, angle: 3, duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                        round++;
                        if (round < totalRounds) {
                          startRound(true);
                        } else {
                          finishGame();
                        }
                      },
                    });
                  },
                });
              },
            });
          } else {
            // Missed — ball out of bounds
            ball.setFillStyle(0xff4444);
            const miss = this.add.text(endX, endY - 30, 'Out of bounds!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
              color: '#ff4444',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
            objects.push(miss);

            // Ivy looks confused (tilts head)
            this.tweens.add({ targets: ivy, angle: -15, duration: 200, yoyo: true, hold: 400 });

            this.time.delayedCall(1200, () => {
              ball.destroy();
              miss.destroy();
              round++;
              if (round < totalRounds) {
                startRound(true);
              } else {
                finishGame();
              }
            });
          }
        },
      });
    };

    // Charge start (space down)
    const startCharge = () => {
      if (!aiming || gameEnded) return;
      charging = true;
      power = 0;
      powerOscDir = 1;
    };

    // Release throw (space up)
    const releaseThrow = () => {
      if (charging && aiming) throwBall();
    };

    const finishGame = () => {
      gameEnded = true;
      this.events.off('update', updateHandler);
      spaceKey.off('down', startCharge);
      spaceKey.off('up', releaseThrow);
      this.input.off('pointerdown', tapThrow);

      instr.setText(`Ivy fetched ${score}/${totalRounds} balls!`);
      title.setText(score === totalRounds ? 'PERFECT!' : score > 0 ? 'GOOD GIRL IVY!' : 'NEXT TIME...');

      // Locked in on perfect fetch
      if (score === totalRounds) {
        MoodSystem.setMood('locked_in', 45);
      }

      const resultMsg = score === totalRounds
        ? 'Ivy is the happiest dog alive.'
        : score > 0
        ? 'Ivy had fun. She always does.'
        : 'Ivy tilts her head. She still loves JP.';

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, resultMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#aaaacc',
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(result);

      const finalScore = score;
      this.time.delayedCall(2500, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        // Post-game dialogue
        const dialogueLines = finalScore === totalRounds
          ? [{ speaker: 'Narrator', text: 'Ivy drops the ball at JP\'s feet. Tail going crazy.' }]
          : finalScore > 0
          ? [{ speaker: 'Narrator', text: 'Ivy rolls onto her back. She doesn\'t care about the score.' }]
          : [{ speaker: 'Narrator', text: 'Ivy stares at JP. Still the best girl.' }];
        this.dialogue.show(dialogueLines, () => { this.frozen = false; });
      });
    };

    // Input — hold space to charge, release to throw
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', startCharge);
    spaceKey.on('up', releaseThrow);
    // Touch/click: tap to start charge, tap again to throw
    let tapCharging = false;
    const tapThrow = () => {
      if (gameEnded) return;
      if (!tapCharging) {
        startCharge();
        tapCharging = true;
      } else {
        releaseThrow();
        tapCharging = false;
      }
    };
    this.input.on('pointerdown', tapThrow);

    // Start first round
    startRound(false);
  }
}
