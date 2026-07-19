import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeReturnDialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { MusicSystem } from '../systems/MusicSystem';

/**
 * Home Return — playable chapter. Same house from Ch1, but JP is different now.
 * Walk around, talk to Pops, Mom, Sister, Ivy. Everyone's positive.
 * After talking to Pops (required), exit triggers EndScene.
 */
export class HomeReturnScene extends BaseChapterScene {
  private goldenOverlay!: Phaser.GameObjects.Rectangle;
  private ivyTriggered = false;
  private popsTalked = false;
  private arrivalDone = false;
  private exitDialogueShown = false;
  private momOverride = false;

  constructor() {
    super({ key: 'HomeReturnScene' });
    this.chapterTitle = 'Home Return';
    this.nextScene = 'EndScene';
    // BaseChapterScene only locks exits when this is non-empty. Pops is handled
    // by the custom reunion flow below, which marks requiredDone at its end.
    this.requiredInteractionId = 'ch0_pops';
  }

  protected getPlayerTexture(): string {
    return 'player-ch7';
  }

  protected getMusicTrack(): string {
    return 'homecoming';
  }

  create() {
    super.create();

    // Reset state
    this.ivyTriggered = false;
    this.popsTalked = false;
    this.arrivalDone = false;
    this.exitDialogueShown = false;
    this.momOverride = false;

    // The original map has plenty of one-tile objects, but the large house
    // still reads sparse from the camera. Return-specific layers group those
    // objects into believable rooms and show the life that continued here.
    this.createHomeReturnDensity();

    // Override homeMap triggers — point to EndScene at CORRECT y: 35 (expanded map)
    this.triggers = [];
    for (let x = 11; x <= 18; x++) {
      this.triggers.push({ x, y: 35, action: 'scene', target: 'EndScene' });
    }

    this.addNavArrow(13, 34, 'The End');

    // ── Golden hour tint — warm overlay that makes everything feel different ──
    this.goldenOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH * 3, GAME_HEIGHT * 3,
      0xfff8e0
    ).setAlpha(0.06).setDepth(300).setScrollFactor(0);

    // ── Arrival cutscene ──
    this.playArrivalSequence();
  }

  private worldX(tileX: number): number {
    return tileX * SCALED_TILE + SCALED_TILE / 2;
  }

  private worldY(tileY: number): number {
    return tileY * SCALED_TILE + SCALED_TILE / 2;
  }

  private addWovenRug(
    tileX: number,
    tileY: number,
    widthTiles: number,
    heightTiles: number,
    color: number,
    trim: number,
  ) {
    const width = widthTiles * SCALED_TILE;
    const height = heightTiles * SCALED_TILE;
    const x = this.worldX(tileX);
    const y = this.worldY(tileY);
    this.add.rectangle(x + 4, y + 5, width, height, 0x171018, 0.28).setDepth(1);
    this.add.rectangle(x, y, width, height, color, 0.82)
      .setDepth(1)
      .setStrokeStyle(3, trim, 0.9);

    for (let lineY = y - height / 2 + 9; lineY < y + height / 2; lineY += 12) {
      this.add.rectangle(x, lineY, width - 12, 2, trim, 0.22).setDepth(2);
    }
  }

  private scaleHomeObject(id: string, xMultiplier: number, yMultiplier: number) {
    const visual = this.interactions.getVisuals().find(item => item.id === id);
    if (!visual?.sprite) return;
    visual.sprite.setScale(
      visual.sprite.scaleX * xMultiplier,
      visual.sprite.scaleY * yMultiplier,
    );
  }

  private createHomeReturnDensity() {
    // Continuous textiles anchor the furniture instead of reading like loose
    // item icons dropped across oversized rooms.
    this.addWovenRug(17, 7, 7, 2.5, 0x6c5946, 0xbca27c);  // upstairs lounge
    this.addWovenRug(9, 15, 7, 2.4, 0x725c4f, 0xc4a681);  // parents' room
    this.addWovenRug(8, 21, 7, 2.5, 0x6a493f, 0xc58d73);  // living room
    this.addWovenRug(23, 14, 10, 3, 0x3e5261, 0x88a0a9); // family den

    // The silhouettes now match the footprint implied by the room.
    this.scaleHomeObject('ch0_upstairs_couch', 1.22, 1.12);
    this.scaleHomeObject('ch0_parents_bed', 1.2, 1.12);
    this.scaleHomeObject('ch0_couch', 1.28, 1.16);
    this.scaleHomeObject('ch0_den_couch', 1.42, 1.2);
    this.scaleHomeObject('ch0_den_tv', 1.45, 1.28);
    this.scaleHomeObject('ch0_pops_truck', 1.42, 1.22);
    this.scaleHomeObject('ch0_jp_car', 1.4, 1.18);
    this.scaleHomeObject('ch0_workbench', 1.45, 1.08);

    this.createFamilyGallery();
    this.createBedroomHistory();
    this.createIvyCorner();
    this.createKitchenLife();
    this.createGarageIdentity();
    this.createTelevisionGlow(4, 20, 0x7fa7d8);
    this.createTelevisionGlow(18, 12, 0xe6b470);
  }

  private createFamilyGallery() {
    const frames = [
      { x: 13, w: 28, h: 20, color: 0x6f91b6 },
      { x: 15, w: 22, h: 28, color: 0xc69a70 },
      { x: 17, w: 34, h: 22, color: 0x8aa27a },
      { x: 23, w: 26, h: 24, color: 0xb57d82 },
      { x: 25, w: 30, h: 20, color: 0x9f8a70 },
    ];
    const y = this.worldY(17.55);

    for (const frame of frames) {
      const x = this.worldX(frame.x);
      this.add.rectangle(x + 3, y + 4, frame.w + 8, frame.h + 8, 0x1d1511, 0.35).setDepth(2);
      this.add.rectangle(x, y, frame.w + 8, frame.h + 8, 0x5c3d29).setDepth(3);
      this.add.rectangle(x, y, frame.w, frame.h, frame.color).setDepth(4);
      this.add.rectangle(x - frame.w * 0.2, y - 2, 5, 5, 0xf1c79f).setDepth(5);
      this.add.rectangle(x + frame.w * 0.16, y + 3, 6, 7, 0x3b2a25).setDepth(5);
    }
  }

  private createBedroomHistory() {
    const decorations = [
      { texture: 'item-storage-box', x: 5.7, y: 7.25, sx: 1.15, sy: 1.0 },
      { texture: 'item-laundry-basket', x: 6.8, y: 7.2, sx: 1.1, sy: 1.05 },
      { texture: 'item-speaker', x: 7.25, y: 4.7, sx: 0.9, sy: 0.9 },
      { texture: 'item-shoe-rack', x: 9.8, y: 7.25, sx: 1.15, sy: 1.0 },
    ];

    for (const item of decorations) {
      this.add.sprite(this.worldX(item.x), this.worldY(item.y), item.texture)
        .setScale(3 * item.sx, 3 * item.sy)
        .setDepth(5);
    }

    // A few boxes are labeled without a speech bubble: the room was kept,
    // stored in, and lived around while JP was gone.
    this.add.text(this.worldX(5.7), this.worldY(7.25) + 15, 'JP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#d9c7ae',
    }).setOrigin(0.5).setDepth(6);
  }

  private createIvyCorner() {
    const x = this.worldX(9.2);
    const y = this.worldY(32.1);
    this.add.ellipse(x, y, SCALED_TILE * 3.2, SCALED_TILE * 1.9, 0x7c5e55, 0.92)
      .setDepth(1)
      .setStrokeStyle(3, 0xc59b82, 0.9);
    this.add.ellipse(x, y, SCALED_TILE * 2.55, SCALED_TILE * 1.25, 0xa77f70, 0.6).setDepth(2);

    const bowlY = this.worldY(31.1);
    this.add.ellipse(this.worldX(8.2), bowlY, 20, 10, 0xb9c6d4).setDepth(4).setStrokeStyle(2, 0x59636e);
    this.add.ellipse(this.worldX(8.9), bowlY, 20, 10, 0xd4b99a).setDepth(4).setStrokeStyle(2, 0x68554a);

    const toy = this.add.circle(this.worldX(10.6), this.worldY(32.35), 7, 0xf0c040).setDepth(4);
    this.tweens.add({
      targets: toy,
      angle: 360,
      duration: 3200,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private createKitchenLife() {
    // A runner and place settings make the existing island/dining tiles read
    // as somewhere the family actually uses.
    const tableX = this.worldX(27);
    const tableY = this.worldY(20);
    this.add.rectangle(tableX, tableY, SCALED_TILE * 4.3, SCALED_TILE * 1.15, 0x6d4932)
      .setDepth(3)
      .setStrokeStyle(3, 0x3b271d);
    this.add.rectangle(tableX, tableY, SCALED_TILE * 3.4, 12, 0xc7a56f, 0.85).setDepth(4);
    for (const offset of [-1.25, -0.4, 0.4, 1.25]) {
      this.add.ellipse(tableX + offset * SCALED_TILE, tableY, 18, 10, 0xe8ded0).setDepth(5);
      this.add.circle(tableX + offset * SCALED_TILE + 12, tableY - 2, 4, 0x9b6d58).setDepth(5);
    }

    this.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        const steam = this.add.text(this.worldX(33), this.worldY(20) - 12, '~', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#fff4dc',
        }).setOrigin(0.5).setDepth(8).setAlpha(0.65);
        this.tweens.add({
          targets: steam,
          y: steam.y - 28,
          x: steam.x + 5,
          alpha: 0,
          duration: 1700,
          onComplete: () => steam.destroy(),
        });
      },
    });
  }

  private createGarageIdentity() {
    const boardX = this.worldX(35);
    const boardY = this.worldY(26.7);
    this.add.rectangle(boardX + 5, boardY + 6, SCALED_TILE * 6.4, SCALED_TILE * 1.3, 0x171717, 0.38).setDepth(2);
    this.add.rectangle(boardX, boardY, SCALED_TILE * 6.4, SCALED_TILE * 1.3, 0x5b4d3e)
      .setDepth(3)
      .setStrokeStyle(3, 0x2f2822);

    for (let row = -1; row <= 1; row++) {
      for (let col = -7; col <= 7; col++) {
        this.add.circle(boardX + col * 13, boardY + row * 12, 1.5, 0xc2a67e, 0.7).setDepth(4);
      }
    }

    const toolColors = [0xc94f45, 0xd7b64c, 0x6e95b8, 0xb8b8b8];
    toolColors.forEach((color, index) => {
      this.add.rectangle(boardX - 110 + index * 55, boardY, 8, 34 + index * 4, color)
        .setDepth(5)
        .setStrokeStyle(1, 0x222222);
    });

    const workLight = this.add.circle(this.worldX(37.2), this.worldY(27.4), 20, 0xffd978, 0.12).setDepth(2);
    this.tweens.add({
      targets: workLight,
      alpha: 0.24,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.createVehicleSilhouette(34.5, 28.35, 5.2, 1.45, 0x293744, true);
    this.createVehicleSilhouette(33.2, 31.45, 3.2, 1.15, 0x171b25, false);

    // The visual footprint and collision footprint agree, so neither car can
    // be walked through even though its interaction remains on the original ID.
    for (let x = 33; x <= 36; x++) this.collisionTiles.add(`${x},28`);
    for (let x = 32; x <= 34; x++) this.collisionTiles.add(`${x},31`);
  }

  private createVehicleSilhouette(
    tileX: number,
    tileY: number,
    widthTiles: number,
    heightTiles: number,
    color: number,
    truck: boolean,
  ) {
    const x = this.worldX(tileX);
    const y = this.worldY(tileY);
    const width = widthTiles * SCALED_TILE;
    const height = heightTiles * SCALED_TILE;
    const bodyY = y - 2;

    this.add.ellipse(x + 6, bodyY + height * 0.3, width * 0.92, height * 0.7, 0x101116, 0.35).setDepth(3);
    if (truck) {
      // Pickup profile: raised cab on the left, open bed on the right.
      this.add.rectangle(x, bodyY + height * 0.08, width, height * 0.42, color)
        .setDepth(4)
        .setStrokeStyle(3, 0x0d1118);
      this.add.rectangle(x - width * 0.27, bodyY - height * 0.16, width * 0.34, height * 0.7, color)
        .setDepth(4)
        .setStrokeStyle(3, 0x0d1118);
      this.add.rectangle(x - width * 0.27, bodyY - height * 0.22, width * 0.23, height * 0.28, 0x243b4d)
        .setDepth(5)
        .setStrokeStyle(2, 0x718494);
      this.add.rectangle(x + width * 0.24, bodyY - height * 0.04, width * 0.4, height * 0.44, color)
        .setDepth(4)
        .setStrokeStyle(3, 0x0d1118);
      this.add.rectangle(x + width * 0.24, bodyY - height * 0.06, width * 0.32, height * 0.24, 0x17212b)
        .setDepth(5)
        .setStrokeStyle(2, 0x697987);
    } else {
      this.add.rectangle(x, bodyY, width, height * 0.62, color)
        .setDepth(4)
        .setStrokeStyle(3, 0x0d1118);
      this.add.triangle(
        x - width * 0.18, bodyY - height * 0.5,
        0, height * 0.45,
        width * 0.42, height * 0.45,
        width * 0.3, 0,
        color,
      ).setDepth(4).setStrokeStyle(2, 0x0d1118);
      this.add.rectangle(x + width * 0.05, bodyY - height * 0.2, width * 0.34, height * 0.22, 0x1e3446)
        .setDepth(5)
        .setStrokeStyle(2, 0x57758d);
    }

    const wheelY = bodyY + height * 0.34;
    for (const wheelX of [x - width * 0.3, x + width * 0.3]) {
      this.add.circle(wheelX, wheelY, Math.max(9, height * 0.18), 0x101116).setDepth(5);
      this.add.circle(wheelX, wheelY, Math.max(4, height * 0.08), 0x6f747a).setDepth(6);
    }

    this.add.rectangle(x - width * 0.48, bodyY, 8, 12, 0xffe6a3).setDepth(6);
    this.add.rectangle(x + width * 0.48, bodyY, 8, 12, 0xb92f36).setDepth(6);
  }

  private createTelevisionGlow(tileX: number, tileY: number, color: number) {
    const glow = this.add.rectangle(
      this.worldX(tileX),
      this.worldY(tileY) + 8,
      SCALED_TILE * 2.2,
      SCALED_TILE * 1.45,
      color,
      0.08,
    ).setDepth(2);
    this.tweens.add({
      targets: glow,
      alpha: 0.18,
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playArrivalSequence() {
    this.frozen = true;

    // Small delay after chapter title fades, then arrival narration
    this.time.delayedCall(3800, () => {
      this.dialogue.show(
        [{ speaker: 'Narrator', text: 'The drive felt longer than he remembered.' }],
        () => {
          this.time.delayedCall(800, () => {
            this.dialogue.show(
              [{ speaker: 'Narrator', text: 'Everything looks the same. But nothing feels the same.' }],
              () => {
                this.frozen = false;
                this.arrivalDone = true;
              }
            );
          });
        }
      );
    });
  }

  // ── Override handleInteract to intercept Pops and Mom NPC conversations ──
  protected handleInteract() {
    // If dialogue is active, advance it (must check before anything else)
    if (this.dialogue.isActive()) {
      this.dialogue.advance();
      return;
    }

    if (this.frozen) return;

    // Get player tile position and facing tile
    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    let facingX = playerTileX;
    let facingY = playerTileY;
    if (this.facing === 'up') facingY--;
    if (this.facing === 'down') facingY++;
    if (this.facing === 'left') facingX--;
    if (this.facing === 'right') facingX++;

    // Check if facing Pops NPC
    for (const npc of this.npcs) {
      const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

      if (npcTileX === facingX && npcTileY === facingY) {
        if (npc.id === 'ch0_pops' && !this.popsTalked) {
          this.playPopsReunion(npc.dialogue);
          return;
        }
        if (npc.id === 'ch0_mom' && !this.momOverride) {
          this.playMomMoment();
          return;
        }
      }
    }

    // Fall through to base for everything else
    super.handleInteract();
  }

  // ── Pops reunion — emotional peak of the game ──
  private playPopsReunion(baseDialogue: DialogueLine[]) {
    this.frozen = true;
    MusicSystem.stop();

    // Dim screen — intimate moment
    const dimOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH * 3, GAME_HEIGHT * 3,
      0x000000
    ).setAlpha(0).setDepth(301).setScrollFactor(0);

    this.tweens.add({
      targets: dimOverlay,
      alpha: 0.15,
      duration: 600,
      ease: 'Sine.easeIn',
    });

    // Echo: Pops remembers the phone that night in Santa Barbara.
    // The player's choice comes back here, one line, no lecture.
    const popsEcho: DialogueLine[] =
      ChoiceLedger.get('pops_call') === 'Answered'
        ? [{ speaker: 'Pops', text: 'That night you picked up and said you were studying... I knew, mijo.' }]
        : ChoiceLedger.get('pops_call') === 'Let it ring'
          ? [{ speaker: 'Pops', text: 'Those nights you didn\'t pick up... I still called. Dads know.' }]
          : [];

    // Play the full Pops dialogue from story.ts
    this.dialogue.show([...baseDialogue, ...popsEcho], () => {
      // Emotional peak — one line after the story dialogue. The pause does the work.
      this.time.delayedCall(2400, () => {
        this.dialogue.show(
          [{ speaker: 'Pops', text: 'I just needed you home.' }],
          () => {
                  // Camera flash white — like a memory being sealed
                  const flash = this.add.rectangle(
                    GAME_WIDTH / 2, GAME_HEIGHT / 2,
                    GAME_WIDTH * 3, GAME_HEIGHT * 3,
                    0xffffff
                  ).setAlpha(0).setDepth(302).setScrollFactor(0);

                  this.tweens.add({
                    targets: flash,
                    alpha: 0.2,
                    duration: 150,
                    yoyo: true,
                    hold: 150,
                    onComplete: () => {
                      flash.destroy();

                      // Fade dim overlay back out
                      this.tweens.add({
                        targets: dimOverlay,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => {
                          dimOverlay.destroy();
                          this.popsTalked = true;
                          this.requiredDone = true;
                          this.frozen = false;
                          MusicSystem.play('homecoming');
                        },
                      });
                    },
                  });
          }
        );
      });
    });
  }

  // ── Mom moment — quiet, understated, hits different ──
  private playMomMoment() {
    this.frozen = true;
    this.momOverride = true;

    this.dialogue.show(
      [
        { speaker: 'Mom', text: '...' },
        { speaker: 'Narrator', text: 'She doesn\'t say much. But she holds him a little longer.' },
      ],
      () => {
        // Now show the real Mom dialogue from story data
        const chapterDialogue = this.getChapterDialogue();
        const momLines = chapterDialogue.npcs['ch0_mom'];
        if (momLines) {
          this.dialogue.show(momLines, () => {
            this.frozen = false;
          });
        } else {
          this.frozen = false;
        }
      }
    );
  }

  // ── Override transitionToScene to show final walk dialogue ──
  protected transitionToScene(sceneKey: string, sceneData?: Record<string, string>) {
    if (!this.exitDialogueShown) {
      this.exitDialogueShown = true;
      this.frozen = true;

      this.dialogue.show(
        [{ speaker: 'Narrator', text: 'To come home and make Pops proud.' }],
        () => {
          this.time.delayedCall(600, () => {
            this.dialogue.show(
              [{ speaker: 'Narrator', text: 'That was always the point.' }],
              () => {
                // Now do the real transition
                super.transitionToScene(sceneKey, sceneData);
              }
            );
          });
        }
      );
      return;
    }

    super.transitionToScene(sceneKey, sceneData);
  }

  // ── Ivy proximity check — she goes crazy when JP is near ──
  update(time: number, delta: number) {
    super.update(time, delta);

    if (!this.arrivalDone || this.ivyTriggered) return;

    // Find Ivy (the frenchie)
    const ivy = this.npcs.find(n => n.id === 'ch0_frenchie');
    if (!ivy) return;

    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);
    const ivyTileX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const ivyTileY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

    const dist = Math.abs(playerTileX - ivyTileX) + Math.abs(playerTileY - ivyTileY);

    if (dist <= 3) {
      this.ivyTriggered = true;
      this.playIvyFreakout(ivy.sprite);
    }
  }

  private playIvyFreakout(ivySprite: Phaser.GameObjects.Sprite) {
    // Rapid wiggle — Ivy is LOSING it
    this.tweens.add({
      targets: ivySprite,
      angle: 15,
      duration: 100,
      yoyo: true,
      repeat: 8,
      ease: 'Sine.easeInOut',
      onStart: () => {
        ivySprite.angle = -15;
      },
      onUpdate: (_tween: Phaser.Tweens.Tween, target: Phaser.GameObjects.Sprite) => {
        // Alternate between -15 and 15
        if (target.angle >= 14) target.angle = -15;
      },
      onComplete: () => {
        ivySprite.angle = 0;
      },
    });

    // Floating text: "Ivy remembers."
    const floatText = this.add.text(
      ivySprite.x,
      ivySprite.y - 40,
      'Ivy remembers.',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(305).setAlpha(0);

    // Fade up and float higher, then fade out
    this.tweens.add({
      targets: floatText,
      alpha: 1,
      y: ivySprite.y - 70,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: floatText,
          alpha: 0,
          y: ivySprite.y - 100,
          duration: 800,
          ease: 'Sine.easeIn',
          onComplete: () => floatText.destroy(),
        });
      },
    });
  }

  protected getObjectiveHint(): string {
    return 'You\'re home. Talk to your family.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeReturnDialogue;
  }
}
