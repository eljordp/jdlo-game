import { BaseChapterScene } from './BaseChapterScene';
import { comeUpMap, MapData } from '../data/maps';
import { comeUpDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, SCALED_TILE } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { GameIntelligence } from '../systems/GameIntelligence';
import { CasinoSystem } from '../systems/CasinoSystem';
import { DMSystem } from '../systems/DMSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { ChoiceLedger } from '../systems/ChoiceLedger';

export class ComeUpScene extends BaseChapterScene {
  private typingPlayed = false;
  private clientTriagePlayed = false;
  private websiteRescuePlayed = false;
  private clientReturned = false;
  private ghostMoved = false;
  private stickerTalked = false;
  private lateNightActive = false;
  private rejectionPlayed = false;
  private birdLetterRead = false;
  private joseTexted = false;
  private larTexted = false;
  private bankChecked = false;
  private timePassagePlayed = false;
  private popsCallDone = false;

  constructor() {
    super({ key: 'ComeUpScene' });
    this.chapterTitle = 'Chapter 7: The Come Up';
    this.nextScene = 'LAScene';
    this.requiredInteractionId = 'ch5_first_dollar';
  }

  protected getPlayerTexture(): string {
    return 'player-ch5';
  }

  protected getMusicTrack(): string {
    return 'come-up';
  }

  create() {
    super.create();
    this.createHomeOfficeIdentity();
    this.createClientDistrictIdentity();
    this.createComeUpAtmosphere();

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch5_first_dollar',      5,  3,  true);  // required: gate
    GameIntelligence.watch('ch5_first_site',        10, 2,  true);  // required: build first site
    GameIntelligence.watch('ch5_stack',             7,  2);
    GameIntelligence.watch('ch5_fiverr',            19, 5);
    GameIntelligence.watch('ch5_cold_email',        12, 6,  true);  // required: outreach
    GameIntelligence.watch('ch5_invoice',           17, 2);
    GameIntelligence.watch('ch5_wct_showcase',      5,  17);
    GameIntelligence.watch('ch5_sticker_showcase',  30, 18);
    GameIntelligence.watch('ch5_dhl_showcase',      30, 28);
    GameIntelligence.watch('ch5_bank_app',          11, 4);
    GameIntelligence.attachDebugPanel(this);

    // Client showcases
    this.addNavArrow(5, 16, 'WCT');
    this.addNavArrow(18, 16, 'Sticker Smith');
    this.addNavArrow(15, 21, 'DHL');
    // Exit at bottom
    this.addNavArrow(30, 27, 'Exit');
  }

  private createClientDistrictIdentity() {
    const tile = SCALED_TILE;

    const facadeLabel = (x: number, y: number, width: number, label: string, color: number) => {
      this.add.rectangle(x * tile, y * tile, width * tile, 28, color).setDepth(1.45);
      this.add.text(x * tile, y * tile, label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(1.6);
    };

    facadeLabel(5, 12.35, 7.6, 'WCT E-COMMERCE', 0x254d70);
    facadeLabel(18, 12.35, 9.2, 'PROPOSALS / PROSPECTS', 0x4c4f59);
    facadeLabel(30.5, 12.35, 10.2, 'STICKER SMITH', 0x61264a);
    facadeLabel(14.5, 22.35, 8.2, 'VACAVILLE APPLIANCE', 0x42615c);
    facadeLabel(30.5, 22.35, 12.2, 'DHL OPERATIONS', 0xdca900);

    // Print-shop windows and rolls of stock establish what these early clients
    // actually do, instead of presenting three identical office boxes.
    for (const x of [27, 29, 31, 33]) {
      this.add.rectangle(x * tile, 14.2 * tile, 34, 48, 0x56314b).setDepth(1.3);
      this.add.rectangle(x * tile, 14.2 * tile, 26, 38, 0xd870a2, 0.32).setDepth(1.34);
    }
    for (const x of [3, 5, 7]) {
      this.add.rectangle(x * tile, 15.3 * tile, 34, 46, 0xd7d7dc).setDepth(1.28);
      this.add.circle(x * tile, 15.3 * tile, 10, 0x5983a0).setDepth(1.34);
    }

    // DHL is a working distribution building: dock shutters, safety lanes,
    // pallets, conveyors and staff in motion. The central bay remains visibly
    // open and the underlying doorway stays passable.
    for (const x of [26.2, 30, 33.8]) {
      this.add.rectangle(x * tile, 26.65 * tile, 2.5 * tile, 46, 0x4b5358).setDepth(1.45);
      for (let line = -16; line <= 16; line += 8) {
        this.add.rectangle(x * tile, 26.65 * tile + line, 2.35 * tile, 3, 0x778087).setDepth(1.5);
      }
      this.add.rectangle(x * tile, 27.05 * tile, 2.8 * tile, 8, 0xe4bc17).setDepth(1.55);
    }
    // Reopen the visual center of the actual door.
    this.add.rectangle(30 * tile + tile / 2, 27.25 * tile, 34, 56, 0x1d2226).setDepth(1.58);

    for (const y of [23.5, 25.5]) {
      this.add.rectangle(30.5 * tile, y * tile, 10.5 * tile, 5, 0xe4bc17, 0.72).setDepth(1.2);
      for (let x = 25.5; x <= 35.5; x += 2) {
        this.add.rectangle(x * tile, y * tile, 26, 5, 0x20262a, 0.75).setDepth(1.22).setAngle(-28);
      }
    }

    // Conveyor spine with moving parcels.
    this.add.rectangle(30.5 * tile, 24.6 * tile, 8.5 * tile, 18, 0x596168).setDepth(1.7);
    this.add.rectangle(30.5 * tile, 24.6 * tile, 8.2 * tile, 6, 0x252a2e).setDepth(1.75);
    for (let i = 0; i < 5; i++) {
      const parcel = this.add.rectangle((26.5 + i * 1.6) * tile, 24.45 * tile, 28, 22, 0xa8783d)
        .setDepth(1.9);
      this.tweens.add({
        targets: parcel,
        x: parcel.x + 3.2 * tile,
        duration: 4200,
        delay: i * 650,
        repeat: -1,
        onRepeat: () => { parcel.x = 26.5 * tile; },
        ease: 'Linear',
      });
    }

    for (const pos of [{ x: 27, y: 23.6 }, { x: 32, y: 25.6 }, { x: 35, y: 23.8 }]) {
      const worker = this.add.sprite(pos.x * tile, pos.y * tile, 'npc_dhl_client', 0)
        .setScale(SCALE * 0.92).setDepth(4);
      this.tweens.add({
        targets: worker,
        x: worker.x + tile * 1.2,
        y: worker.y + (pos.x % 2 ? 8 : -8),
        duration: 1900 + pos.x * 22,
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
      });
    }

    const safetyX = 30.5 * tile;
    const safetyY = 22.8 * tile;
    this.add.rectangle(safetyX, safetyY, 310, 30, 0x20262a).setDepth(2.1);
    this.add.text(safetyX, safetyY, 'SAFETY • EN  ES  TL  ZH', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f2c315',
    }).setOrigin(0.5).setDepth(2.2);

    this.createClientInteriors();
  }

  private createHomeOfficeIdentity() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;
    const rect = (x: number, y: number, width: number, height: number, color: number, depth = 2.05, alpha = 1) =>
      this.add.rectangle(px(x), px(y), width * tile, height * tile, color, alpha).setDepth(depth);
    const prop = (texture: string, x: number, y: number, scale = 0.72, tint?: number) => {
      const sprite = this.add.sprite(px(x), px(y), texture).setScale(SCALE * scale).setDepth(3.1);
      if (tint !== undefined) sprite.setTint(tint);
      return sprite;
    };

    // Divide the oversized room into a work wall, build bench, admin corner
    // and food/sleep corner. Existing interactables now sit on furniture instead
    // of floating independently across an empty hardwood box.
    rect(11.5, 4.45, 13.8, 3.5, 0x253242, 2.0);
    rect(11.5, 4.45, 13.1, 2.9, 0x34475b, 2.02);
    for (let x = 5.3; x <= 17.7; x += 1.05) {
      this.add.rectangle(px(x), px(4.45), 4, 2.55 * tile, 0x7d98ab, 0.2).setDepth(2.04);
    }

    // Monitor wall and long desk: portfolio, first site, pricing, invoices and
    // the bank app occupy one believable working surface.
    rect(11.5, 2.65, 13.9, 0.7, 0x4b3327, 2.5);
    this.add.rectangle(px(11.5), px(2.45), 13.5 * tile, 12, 0x9a6a48).setDepth(2.58);
    for (const x of [5.5, 8.8, 13.4, 17.2]) {
      const screen = this.add.rectangle(px(x), px(2.15), 72, 44, 0x10151d).setDepth(2.72).setStrokeStyle(4, 0x4a4f57);
      const glow = this.add.rectangle(px(x), px(2.15), 58, 31, x < 10 ? 0x4a8bc8 : x < 15 ? 0x6e76d2 : 0x4fb186, 0.48).setDepth(2.74);
      this.tweens.add({ targets: glow, alpha: 0.2, duration: 1100 + x * 55, yoyo: true, repeat: -1 });
      this.add.rectangle(screen.x, px(2.56), 8, 12, 0x3d4148).setDepth(2.73);
    }
    prop('item-speaker', 10.7, 2.3, 0.48);
    prop('item-headphones', 15.4, 2.3, 0.5);

    // Whiteboard, corkboard and handwritten work queue make the room read as
    // self-taught operations, not a polished startup office.
    this.add.rectangle(px(8), 1.28 * tile, 230, 54, 0xe8e5dc).setDepth(2.42).setStrokeStyle(6, 0x775e45);
    this.add.text(px(8), 1.28 * tile, 'BUILD  •  SEND  •  FOLLOW UP', {
      fontFamily: 'monospace', fontSize: '10px', color: '#29303a',
    }).setOrigin(0.5).setDepth(2.45);
    this.add.rectangle(px(16.8), 1.28 * tile, 225, 54, 0x8f6742).setDepth(2.42).setStrokeStyle(5, 0x5c3e2d);
    for (const note of [
      { x: 15.6, color: 0xe9d979, angle: -5 },
      { x: 16.5, color: 0x82c4d8, angle: 4 },
      { x: 17.4, color: 0xe49da7, angle: -2 },
      { x: 18.2, color: 0xa5d28b, angle: 6 },
    ]) {
      this.add.rectangle(px(note.x), 1.28 * tile, 38, 30, note.color).setDepth(2.47).setAngle(note.angle);
    }

    // Admin table: cold email, proposal, invoice and a cheap printer.
    rect(13.5, 6.0, 5.2, 0.75, 0x493126, 2.48);
    prop('item-letter', 12.0, 5.85, 0.55);
    prop('item-money', 13.0, 5.9, 0.52);
    prop('item-tablet', 14.2, 5.85, 0.58);
    prop('item-storage-box', 15.3, 6.0, 0.58, 0xd6d3ca);

    // Left corner stayed home: fridge, coffee, ramen, laundry and the family
    // photograph that follows JP through each move.
    rect(5.0, 5.65, 2.1, 1.65, 0x6e4b36, 2.45);
    prop('item-fridge', 4.2, 5.6, 0.76, 0xe7e4dc);
    prop('item-food', 5.1, 5.25, 0.54);
    prop('item-bottle', 5.8, 5.25, 0.48, 0x704b32);
    prop('item-laundry-basket', 6.1, 6.2, 0.56, 0x737a83);
    prop('item-photo', 4.4, 1.65, 0.6);

    // A couch that became a second bed, shipping boxes and a narrow clear path
    // to the door. The room is dense but remains traversable down the middle.
    prop('item-couch', 18.6, 5.9, 0.86, 0x515b68);
    prop('item-storage-box', 18.9, 4.7, 0.62);
    prop('item-storage-box', 18.1, 4.9, 0.54, 0x8b735c);
    prop('item-shoe-rack', 7.3, 6.2, 0.55);
    for (const [x, y] of [[5, 2], [7, 2], [9, 2], [12, 2], [14, 2], [17, 2], [4, 5], [6, 6], [18, 6]] as Array<[number, number]>) {
      this.collisionTiles.add(`${x},${y}`);
    }
  }

  private createClientInteriors() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;
    const prop = (texture: string, x: number, y: number, scale = 0.66, tint?: number) => {
      const sprite = this.add.sprite(px(x), px(y), texture).setScale(SCALE * scale).setDepth(3.05);
      if (tint !== undefined) sprite.setTint(tint);
      return sprite;
    };
    const worktable = (x: number, y: number, width: number, color: number) => {
      this.add.rectangle(px(x), px(y), width * tile, 38, color).setDepth(2.45);
      this.add.rectangle(px(x), px(y) - 15, width * tile - 18, 8, 0xd4c6af, 0.55).setDepth(2.5);
    };

    // WCT e-commerce: products, cartons, checkout screen and a real delivery
    // workflow rather than a generic office.
    worktable(5, 14.7, 5.1, 0x405f75);
    for (const [x, y, tint] of [[3, 13.4, 0x9b6741], [4, 13.4, 0x826e53], [6, 13.4, 0x7e9b8a], [7, 13.4, 0xa77b52]] as const) {
      prop('item-storage-box', x, y, 0.52, tint);
    }
    prop('item-tablet', 5.1, 14.55, 0.54);
    prop('item-letter', 7.2, 15.6, 0.48);

    // Prospect office: too many chairs, one untouched proposal and nobody
    // willing to make the decision.
    worktable(18, 14.7, 6.0, 0x4d4c53);
    prop('item-letter', 18, 14.55, 0.56);
    for (const x of [15.2, 16.6, 19.4, 20.8]) prop('item-nightstand', x, 15.7, 0.47, 0x55565d);
    const coldLight = this.add.rectangle(px(18), px(13.6), 5.8 * tile, 1.2 * tile, 0x9eb8c7, 0.08).setDepth(2.1);
    this.tweens.add({ targets: coldLight, alpha: 0.16, duration: 2300, yoyo: true, repeat: -1 });

    // Sticker Smith: rolls, cutting tables and a wall of color samples.
    worktable(30.5, 15.5, 8.1, 0x6a4057);
    for (const [x, color] of [[27, 0xe36c75], [28, 0xe6b758], [29, 0x66b7cc], [32, 0x7e76c9], [33, 0x75b477], [34, 0xd77ca9]] as const) {
      this.add.circle(px(x), px(13.6), 18, color).setDepth(2.8);
      this.add.circle(px(x), px(13.6), 7, 0x3b3540).setDepth(2.82);
    }
    prop('item-tablet', 30, 15.35, 0.52);
    prop('item-poster', 34.2, 15.3, 0.58, 0xeaaac7);

    // Vacaville Appliance: recognizable appliance silhouettes and service
    // paperwork. The work is practical, local and paid.
    for (const x of [12, 14, 16, 17]) prop('item-fridge', x, 24.2, 0.7, x % 2 ? 0xd7d3ca : 0xc5c8cc);
    worktable(14.5, 26.0, 6.2, 0x4b625d);
    prop('item-letter', 14, 25.8, 0.5);
    prop('item-tablet', 15.5, 25.8, 0.52);

    // Keep doors and central aisles mechanically clear despite added density.
    for (const [x, y] of [[3, 13], [4, 13], [6, 13], [7, 13], [27, 13], [28, 13], [32, 13], [33, 13], [34, 13], [12, 24], [14, 24], [16, 24], [17, 24]] as Array<[number, number]>) {
      this.collisionTiles.add(`${x},${y}`);
    }
  }

  private createComeUpAtmosphere() {
    const tile = SCALED_TILE;

    // A late-night delivery truck crosses the client district while the DHL
    // conveyor and workers keep moving inside.
    const truck = this.add.sprite(-2 * tile, 20.55 * tile, 'item-truck')
      .setScale(SCALE * 1.05).setDepth(2.7).setTint(0xd8b500);
    this.tweens.add({
      targets: truck,
      x: 42 * tile,
      duration: 14500,
      repeat: -1,
      onRepeat: () => { truck.x = -2 * tile; },
      ease: 'Linear',
    });

    // Streetlights, window glow and a lonely office light connect the chapter's
    // public momentum to its private 3 AM reality.
    for (const [x, y] of [[3, 8.8], [21, 8.8], [3, 19.5], [23, 19.5], [38, 29.5]] as Array<[number, number]>) {
      this.add.rectangle(x * tile, y * tile, 6, 56, 0x40484c).setDepth(2.35);
      const lamp = this.add.circle(x * tile, (y - 0.4) * tile, 10, 0xf0cc71, 0.62).setDepth(2.4);
      this.tweens.add({ targets: lamp, alpha: 0.3, duration: 1800 + x * 19, yoyo: true, repeat: -1 });
    }
    const officeWindow = this.add.rectangle(11.5 * tile, 1.55 * tile, 13.4 * tile, 26, 0x7da4ca, 0.2).setDepth(2.18);
    this.tweens.add({ targets: officeWindow, alpha: 0.38, duration: 2700, yoyo: true, repeat: -1 });

    // Notification pulses happen at different rhythms; the room never becomes
    // silent even when nobody answers.
    for (const [x, y, delay] of [[6, 4, 0], [11, 4, 450], [16, 3, 900]] as Array<[number, number, number]>) {
      const pulse = this.add.circle(x * tile + tile / 2, y * tile + tile / 2, 15, 0x58a6ff, 0.1).setDepth(3.35);
      this.tweens.add({ targets: pulse, alpha: 0.46, scale: 1.35, duration: 620, delay, yoyo: true, repeat: -1, repeatDelay: 3100 });
    }
  }

  protected getObjectiveHint(): string {
    if (this.clientReturned) return "You're building something real. Keep going.";
    if (this.stickerTalked && !this.requiredDone) return 'Return to the office. Check the first real payment.';
    if (this.stickerTalked) return 'Deliver the work. More conversations are waiting.';
    return 'Find the difference between interest and a real yes.';
  }

  getMapData(): MapData {
    return comeUpMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return comeUpDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch5_wct_showcase: {
        title: 'WCT E-Commerce',
        description: 'A real e-commerce build: products, cart, checkout, delivery.',
        revenue: 'Delivered',
      },
      ch5_sticker_showcase: {
        title: 'The Sticker Smith',
        description: 'The first legitimate client: website and a real working relationship.',
        revenue: '~$1K',
      },
      ch5_dhl_showcase: {
        title: 'DHL Translator App',
        description: 'A serious translation tool built around warehouse communication.',
        revenue: 'Operational',
      },
    };
  }

  // Ghost prospect walks away when you approach
  protected onPlayerMove(tileX: number, tileY: number): void {
    if (!this.ghostMoved) {
      const ghost = this.npcs.find(n => n.id === 'ch5_ghost');
      if (ghost) {
        const ghostTX = Math.round((ghost.sprite.x - 32) / 64);
        const ghostTY = Math.round((ghost.sprite.y - 32) / 64);
        const dist = Math.abs(ghostTX - tileX) + Math.abs(ghostTY - tileY);
        if (dist <= 3) {
          this.ghostMoved = true;
          // Ghost walks away
          this.collisionTiles.delete(`${ghostTX},${ghostTY}`);
          this.tweens.add({
            targets: ghost.sprite,
            x: ghost.sprite.x + 64 * 4,
            alpha: 0.3,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
              // Update dialogue
              ghost.dialogue = [
                { speaker: 'Narrator', text: 'He\'s gone. Same as always.' },
              ];
            },
          });
        }
      }
    }

    // Late night dim effect after examining 3am interactable
    if (this.lateNightActive) return;
  }

  // Sticker Smith triggers referral chain to Manza
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    if (npcId === 'ch5_sticker' && !this.stickerTalked) {
      this.stickerTalked = true;
      this.refreshObjectiveHint();
      SoundEffects.playConfirm();
      this.dialogue.show(dialogue, () => {
        // One paid client makes the next conversation possible. It does not
        // magically turn every interested person into a deal.
        const manza = this.npcs.find(n => n.id === 'ch5_manza');
        if (manza) {
          // Sparkle effect on Manza
          const sparkle = this.add.text(
            manza.sprite.x, manza.sprite.y - 40, 'NEW!',
            { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040' }
          ).setOrigin(0.5).setDepth(15);
          this.tweens.add({
            targets: sparkle,
            y: sparkle.y - 8,
            duration: 800,
            yoyo: true,
            repeat: -1,
          });
          // Update the composite prospect with the real frustrating pattern:
          // enthusiasm, a promised follow-up, then silence.
          manza.dialogue = [
            { speaker: 'Prospect', text: 'I saw the Sticker Smith work. Send me a proposal.' },
            { speaker: 'Prospect', text: 'I am serious. I will call you tomorrow.' },
            { speaker: 'JP', text: 'Cool. I will have it ready.' },
            { speaker: 'Narrator', text: 'Tomorrow passes. The proposal stays on seen.' },
            { speaker: 'JP\'s Mind', text: 'He still watches every story.' },
            ...this.ghostEcho(),
          ];
        }
      });
      return;
    }

    this.dialogue.show(dialogue);
  }

  // Override to add typing mini-game and payment cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    GameIntelligence.onInteracted(interactable.id);
    if (interactable.id === 'ch5_first_site' && !this.websiteRescuePlayed) {
      Analytics.trackInteraction(interactable.id);
      this.websiteRescuePlayed = true;
      this.playWebsiteRescue();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch5_stack' && !this.clientTriagePlayed) {
      Analytics.trackInteraction(interactable.id);
      SoundEffects.playVibrate();
      this.clientTriagePlayed = true;
      this.playClientTriage();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch5_github' && !this.typingPlayed) {
      Analytics.trackInteraction(interactable.id);
      SoundEffects.playBlip();
      this.typingPlayed = true;
      this.playTypingMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Late night coding dim
    if (interactable.id === 'ch5_3am' && !this.lateNightActive) {
      this.lateNightActive = true;
      const nightOverlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3, 0x0a0820, 0
      ).setDepth(8).setAlpha(0);
      this.tweens.add({ targets: nightOverlay, alpha: 0.3, duration: 2000 });
    }

    if (interactable.id === 'ch5_first_dollar') {
      if (!this.stickerTalked) {
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Invoice ready. Payment notifications empty.' },
          { speaker: 'JP\'s Mind', text: 'A good conversation is not money. Find a real yes.' },
        ], () => { this.frozen = false; });
        return;
      }
      Analytics.trackInteraction(interactable.id);
      this.requiredDone = true;
      SoundEffects.moneyRain();
      this.playPaymentCutscene();
      this.interactions.consume(interactable.id);

      // First client returns after payment (delayed)
      if (!this.clientReturned) {
        this.clientReturned = true;
        this.time.delayedCall(8000, () => {
          if (!this.scene.isActive()) return;
          const firstClient = this.npcs.find(n => n.id === 'ch5_first_client');
          if (firstClient) {
            // Client walks toward player
            const chapterDialogue = this.getChapterDialogue();
            const lines = chapterDialogue.npcs['ch5_client_returns'];
            if (lines) {
              firstClient.dialogue = lines;
              // Visual indicator
              const returnText = this.add.text(
                firstClient.sprite.x, firstClient.sprite.y - 40, '!',
                { fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40c040' }
              ).setOrigin(0.5).setDepth(15);
              this.tweens.add({
                targets: returnText,
                y: returnText.y - 8,
                duration: 600,
                yoyo: true,
                repeat: -1,
              });
            }
          }
        });
      }
      return;
    }
    if (interactable.id === 'ch5_doubt') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'What if this doesn\'t work?' },
        { speaker: 'JP\'s Mind', text: 'What if I\'m just a kid with a laptop pretending to be something?' },
        { speaker: 'JP\'s Mind', text: 'Other people went to school for this. I did not.' },
        { speaker: 'JP\'s Mind', text: 'I taught myself from tutorials, AI, broken builds, and doing it again.' },
        { speaker: 'Narrator', text: 'He stares at the screen. The cursor blinks.' },
        { speaker: 'JP\'s Mind', text: '...but the site works. The client paid. That\'s real.' },
        { speaker: 'JP\'s Mind', text: 'Keep going.' },
      ], () => {
        MoodSystem.changeMorale(5);
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch5_pricing') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP\'s pricing sheet. Scope on one side. Anxiety on the other.' },
        { speaker: 'JP\'s Mind', text: 'I know how long it takes. I am still learning what the work is worth.' },
      ], () => { this.frozen = false; });
      return;
    }

    if (interactable.id === 'ch5_late_night') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      // Bird's letter sits on the desk — the inside checking on the outside.
      // First visit only; the commissary choice echoes in his P.S.
      const birdLetter: DialogueLine[] = this.birdLetterRead ? [] : [
        { speaker: 'Narrator', text: 'Under the Red Bull can — an envelope. State-stamped. Bird.' },
        { speaker: 'Bird', text: '"Heard from Mikey you out there building. Websites and all that."' },
        { speaker: 'Bird', text: '"Don\'t be the fourth one I watch come back."' },
        ...(ChoiceLedger.get('commissary_share') === 'Shared it'
          ? [{ speaker: 'Bird', text: '"P.S. Block ain\'t been the same since you shared the bag."' }]
          : []),
        { speaker: 'JP\'s Mind', text: 'Bird\'s still in there. I keep typing.' },
      ];
      this.birdLetterRead = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Late night. Screen glowing in the dark.' },
        { speaker: 'Narrator', text: 'Red Bull can. Cold coffee. Stack of tutorials.' },
        ...birdLetter,
        { speaker: 'JP\'s Mind', text: 'Everyone\'s asleep. This is when the real work happens.' },
        { speaker: 'JP\'s Mind', text: 'Nobody sees this part. They only see the finished site.' },
        { speaker: 'Narrator', text: 'He keeps typing.' },
      ], () => {
        MoodSystem.setMood('locked_in', 60);
        this.frozen = false;
      });
      return;
    }

    // Rejection montage — wall of no's
    if (interactable.id === 'ch5_rejection' && !this.rejectionPlayed) {
      this.rejectionPlayed = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      SoundEffects.fumble();
      this.playRejectionMontage();
      return;
    }

    // Bank account — fullscreen overlay
    if (interactable.id === 'ch5_bank_app' && !this.bankChecked) {
      this.bankChecked = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      SoundEffects.playCash();
      this.playBankScene();
      return;
    }

    // Cold email — triggers time passing montage
    if (interactable.id === 'ch5_cold_email' && !this.timePassagePlayed) {
      this.timePassagePlayed = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.playTimePassage();
      return;
    }

    // Ramen — add to inventory
    if (interactable.id === 'ch5_ramen') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch5_ramen'];
      if (lines) {
        this.dialogue.show(lines, () => {
          InventorySystem.addItem('ramen', 1);
          SoundEffects.playPickup();
          this.frozen = false;
        });
      } else {
        this.frozen = false;
      }
      this.interactions.consume(interactable.id);
      return;
    }

    // Fiverr — triggers Pops call after a delay
    if (interactable.id === 'ch5_fiverr' && !this.popsCallDone) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Fiverr inbox. "Your gig has been removed for violating terms."' },
        { speaker: 'JP\'s Mind', text: 'They want me to charge $5 for a logo and then they ban me?' },
        { speaker: 'JP\'s Mind', text: 'Forget Fiverr. I\'ll find my own clients.' },
      ], () => {
        this.frozen = false;
        // Pops calls after a delay
        this.time.delayedCall(10000, () => {
          if (this.scene.isActive() && !this.popsCallDone) {
            this.triggerPopsCall();
          }
        });
      });
      return;
    }

    // Phone — story first, then apps on revisit
    if (interactable.id === 'ch5_phone') {
      Analytics.trackInteraction(interactable.id);
      // Jose closes his loop — the one who told JP not to disappear
      // gets to see him show up somewhere better. First check only.
      if (!this.joseTexted) {
        this.joseTexted = true;
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'One unread text. Jose.' },
          { speaker: 'Jose', text: '"my mom needed a website for her cleaning business. googled it. YOUR name came up."' },
          { speaker: 'Jose', text: '"you used to disappear on everybody. now i find you by searching. crazy."' },
          { speaker: 'Jose', text: '"proud of you gang. for real."' },
          { speaker: 'JP', text: '"Tell your mom I got her. Family rate."' },
          { speaker: 'JP\'s Mind', text: 'Jose never stopped checking on me. Even when I gave him nothing back.' },
        ], () => {
          this.frozen = false;
          this.showPhoneApps();
        });
        return;
      }
      // Lar checks in on the second look — the duffel days went legit
      if (!this.larTexted) {
        this.larTexted = true;
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'New text. Lar.' },
          { speaker: 'Lar', text: '"bro guess who got a plug on clubs now. LEGIT clubs. golf."' },
          { speaker: 'Lar', text: '"from duffel bags to pro shops. proud of us gang."' },
          { speaker: 'JP\'s Mind', text: 'Everybody from the mud finding a legal hustle. Nobody planned it. Everybody did it.' },
        ], () => {
          this.frozen = false;
          this.showPhoneApps();
        });
        return;
      }
      this.showPhoneApps();
      return;
    }

    // Computer — story first, then apps on revisit
    if (interactable.id === 'ch5_computer') {
      Analytics.trackInteraction(interactable.id);
      this.showComputerApps();
      return;
    }

    super.handleInteractable(interactable);
  }

  // ─── PHONE APPS (Ch6: full hustle — DMs, Casino, Crypto) ───────
  private showPhoneApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const phoneBg = this.add.rectangle(cx, cy, 240, 370, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const phoneBorder = this.add.rectangle(cx, cy, 242, 372, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);
    const notch = this.add.rectangle(cx, cy - 177, 60, 8, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);
    const timeText = this.add.text(cx, cy - 155, '2:14 AM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['DMs', 'Casino', 'Crypto', 'Close'];
    const appColors = [0x3a2a4a, 0x0a3a1a, 0x1a0a2a, 0x333344];
    const hoverColors = [0x5a3a6a, 0x1a5a2a, 0x3a1a5a, 0x555566];
    const labelColors = ['#ffffff', '#f0c040', '#bb66ff', '#ffffff'];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 100 + i * 48;
      const btn = this.add.rectangle(cx, y, 200, 36, appColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: labelColors[i],
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColors[i]));
      btn.on('pointerout', () => btn.setFillStyle(appColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'DMs') DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else if (app === 'Crypto') CasinoSystem.openCrypto(this, () => { this.showPhoneApps(); });
        else this.frozen = false;
      });

      buttons.push(btn);
      labels.push(label);
    });

    const cleanup = () => {
      phoneBg.destroy(); phoneBorder.destroy(); notch.destroy(); timeText.destroy();
      buttons.forEach(b => b.destroy());
      labels.forEach(l => l.destroy());
    };

    // Keyboard: 1-4 to pick
    const keys = [
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    ];
    const handlers: (() => void)[] = [];
    keys.forEach((key, i) => {
      const handler = () => {
        keys.forEach((k, j) => k.off('down', handlers[j]));
        cleanup();
        if (i === 0) DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (i === 1) CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else if (i === 2) CasinoSystem.openCrypto(this, () => { this.showPhoneApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── COMPUTER APPS (Ch6: Crypto + Casino) ──────────────────────
  private showComputerApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 280, 280, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 282, 282, 0x4488ff, 0)
      .setStrokeStyle(2, 0x4488ff)
      .setScrollFactor(0).setDepth(299);
    const title = this.add.text(cx, cy - 115, 'DESKTOP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#4488ff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['Crypto', 'Casino', 'Close'];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 50 + i * 48;
      const isClose = app === 'Close';
      const isCasino = app === 'Casino';
      const isCrypto = app === 'Crypto';
      const btnColor = isClose ? 0x333333 : isCasino ? 0x0a3a1a : 0x1a0a2a;
      const hoverColor = isClose ? 0x555555 : isCasino ? 0x1a5a2a : 0x3a1a5a;
      const labelColor = isCasino ? '#f0c040' : isCrypto ? '#bb66ff' : '#ffffff';

      const btn = this.add.rectangle(cx, y, 240, 36, btnColor)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColor));
      btn.on('pointerout', () => btn.setFillStyle(btnColor));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'Crypto') CasinoSystem.openCrypto(this, () => { this.showComputerApps(); });
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      });

      buttons.push(btn);
      labels.push(label);
    });

    const cleanup = () => {
      bg.destroy(); border.destroy(); title.destroy();
      buttons.forEach(b => b.destroy());
      labels.forEach(l => l.destroy());
    };

    // Keyboard: 1-3 to pick
    const keys = [
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    const handlers: (() => void)[] = [];
    keys.forEach((key, i) => {
      const handler = () => {
        keys.forEach((k, j) => k.off('down', handlers[j]));
        cleanup();
        if (i === 0) CasinoSystem.openCrypto(this, () => { this.showComputerApps(); });
        else if (i === 1) CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── REJECTION MONTAGE ──────────────────────────────────────────
  private playRejectionMontage() {
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    objects.push(this.add.text(GAME_WIDTH / 2, 60, 'THE GRIND', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f04040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301));

    // Wall of rejections — flash one after another
    const rejections = [
      '"Not interested."',
      '"We went with someone else."',
      '"Our budget changed."',
      '"Can you do it for $50?"',
      '"We\'ll get back to you." (they never did)',
      '"My nephew can do it."',
      '"We need someone with more experience."',
      '"Sorry, who are you?"',
      '"Read 3:42 PM"',
      '"$200 is CRAZY. $40 and I leave a Google review."',
      '"bro is LARPing as a developer 💀"',
      '"67"',
      '"Not a good fit."',
      '"We found someone on Fiverr."',
    ];

    let delay = 500;
    for (let i = 0; i < rejections.length; i++) {
      this.time.delayedCall(delay, () => {
        const x = GAME_WIDTH / 2 + Phaser.Math.Between(-200, 200);
        const y = 120 + Phaser.Math.Between(0, 350);
        const size = i < 8 ? '9px' : '11px';
        const color = i < 6 ? '#cc4444' : i < 9 ? '#ff4444' : '#ff6666';

        const text = this.add.text(x, y, rejections[i], {
          fontFamily: '"Press Start 2P", monospace', fontSize: size, color,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(text);

        this.tweens.add({
          targets: text,
          alpha: 0.9,
          duration: 200,
        });

        // Camera shake gets worse
        this.cameras.main.shake(100, 0.002 + i * 0.001);
      });
      delay += 500 + i * 50; // gets faster
    }

    // After all rejections — JP's response
    this.time.delayedCall(delay + 800, () => {
      const response = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 'Next.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
      objects.push(response);

      this.tweens.add({
        targets: response,
        alpha: 1,
        duration: 600,
        hold: 1500,
        onComplete: () => {
          MoodSystem.changeMorale(-10);
          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }
          this.frozen = false;
        },
      });
    });
  }

  // ─── BANK ACCOUNT SCENE ───────────────────────────────────────────
  private playBankScene() {
    const objects: Phaser.GameObjects.GameObject[] = [];
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Phone overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Phone body
    const phoneW = 280;
    const phoneH = 480;
    objects.push(this.add.rectangle(cx, cy, phoneW + 10, phoneH + 10, 0x1a1a1a)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, phoneW, phoneH, 0x0a1020)
      .setScrollFactor(0).setDepth(302));

    // Bank app header
    objects.push(this.add.rectangle(cx, cy - phoneH / 2 + 30, phoneW, 50, 0x1a3050)
      .setScrollFactor(0).setDepth(303));
    objects.push(this.add.text(cx, cy - phoneH / 2 + 30, 'CHECKING ACCOUNT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#80a0c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

    // Balance — big number
    const balanceText = this.add.text(cx, cy - 100, '$0.00', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
    objects.push(balanceText);

    // Documentary tension without pretending an invented balance is a receipt.
    this.time.delayedCall(700, () => balanceText.setText('LOW'));

    // Bills list
    const bills = [
      { name: 'Housing', amount: 'DUE', due: 'Soon' },
      { name: 'Phone', amount: 'DUE', due: '' },
      { name: 'Car', amount: 'DUE', due: '' },
      { name: 'Food', amount: 'LOW', due: '' },
    ];

    let billY = cy - 20;
    this.time.delayedCall(1500, () => {
      objects.push(this.add.text(cx, billY - 20, 'UPCOMING', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f04040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

      for (let i = 0; i < bills.length; i++) {
        this.time.delayedCall(i * 400, () => {
          const b = bills[i];
          objects.push(this.add.text(cx - 100, billY + i * 35, b.name, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#cccccc',
          }).setScrollFactor(0).setDepth(304));
          objects.push(this.add.text(cx + 80, billY + i * 35, b.amount, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ff6060',
          }).setOrigin(1, 0).setScrollFactor(0).setDepth(304));
          if (b.due) {
            objects.push(this.add.text(cx + 80, billY + i * 35 + 14, b.due, {
              fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f0c040',
            }).setOrigin(1, 0).setScrollFactor(0).setDepth(304));
          }
        });
      }
    });

    // JP's reaction after all bills shown
    this.time.delayedCall(4000, () => {
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'Not enough room between the balance and the bills.' },
        { speaker: 'JP\'s Mind', text: 'A promise from a prospect cannot pay anything.' },
        { speaker: 'Narrator', text: 'He closes the app. Opens his laptop instead.' },
      ], () => {
        MoodSystem.changeMorale(-15);
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    });
  }

  // ─── TIME PASSING MONTAGE ──────────────────────────────────────────
  private playTimePassage() {
    const objects: Phaser.GameObjects.GameObject[] = [];

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    this.tweens.add({ targets: overlay, alpha: 0.9, duration: 500 });

    const weeks = [
      { text: 'Outreach', sub: 'Messages sent. Mostly silence.' },
      { text: 'Portfolio', sub: 'Built proof before anyone asked for it.' },
      { text: 'Proposal', sub: '"I am serious." Then no reply.' },
      { text: 'Follow-up', sub: 'Seen. Still watches every story.' },
      { text: 'Sticker Smith', sub: 'A legitimate client. A real payment.' },
      { text: 'Delivery', sub: 'The work has to justify the trust.' },
    ];

    let delay = 800;
    for (let i = 0; i < weeks.length; i++) {
      this.time.delayedCall(delay, () => {
        const weekText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, weeks[i].text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '20px',
          color: i < 4 ? '#888888' : '#f0c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(weekText);

        const subText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, weeks[i].sub, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px',
          color: i < 4 ? '#666666' : '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(subText);

        this.tweens.add({
          targets: [weekText, subText],
          alpha: 1,
          duration: 400,
          hold: 1200,
          yoyo: true,
        });
      });
      delay += 2000;
    }

    // End
    this.time.delayedCall(delay + 500, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Enough silence to make one real yes feel enormous.' },
        { speaker: 'JP\'s Mind', text: 'Now deliver.' },
      ], () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    });
  }

  // ─── POPS CALL (JP has to lie) ─────────────────────────────────────
  private triggerPopsCall() {
    if (this.popsCallDone) return;
    this.popsCallDone = true;
    this.frozen = true;

    // Phone ring
    SoundEffects.playVibrate();
    this.cameras.main.shake(200, 0.003);

    this.dialogue.show([
      { speaker: 'Narrator', text: 'Phone rings. Pops.' },
      { speaker: 'Pops', text: 'Hey son. How\'s everything going?' },
      { speaker: 'JP', text: 'Good, Pops. Yeah. Everything\'s good.' },
      { speaker: 'Pops', text: 'You eating?' },
      { speaker: 'JP', text: 'Yeah. Three meals a day.' },
      { speaker: 'Narrator', text: 'That\'s a lie. It\'s ramen twice and coffee.' },
      { speaker: 'Pops', text: 'And the business stuff? The websites?' },
      { speaker: 'JP', text: 'Getting clients. Building momentum.' },
      { speaker: 'Narrator', text: 'That\'s half true. One client. Barely momentum.' },
      { speaker: 'Pops', text: 'Good. I\'m proud of you for trying. Most people don\'t even try.' },
      { speaker: 'JP', text: 'Thanks Pops.' },
      { speaker: 'Narrator', text: 'He hangs up. Stares at the wall.' },
      { speaker: 'JP\'s Mind', text: 'I can\'t let him down. I won\'t.' },
    ], () => {
      MoodSystem.changeMorale(10);
      this.frozen = false;
    });
  }

  private playClientTriage() {
    this.frozen = true;
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Three windows stay open on one tired screen.' },
      { speaker: 'Paid Client', text: 'Checkout is broken. Customers cannot place an order.' },
      { speaker: 'Prospect', text: 'Seen 11:42 PM.' },
      { speaker: 'New Lead', text: 'I like it. Can you do it for less?' },
      { speaker: 'JP\'s Mind', text: 'Fix what is paid, chase what might pay, or lower the number.' },
      { speaker: 'JP\'s Mind', text: 'There is enough time for two. Not all three.' },
    ], () => {
      this.showWorkChoice('Paid checkout or silent prospect?', 'Fix checkout', 'Chase prospect', () => {
        ChoiceLedger.record('ghost_chase', 'Moved on');
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP closes the prospect tab and traces the broken order button.' },
          { speaker: 'Paid Client', text: 'Orders are coming through again. Thank you.' },
          { speaker: 'Narrator', text: 'The prospect keeps watching every story and never replies.' },
        ], () => this.playPricingDecision('client'));
      }, () => {
        ChoiceLedger.record('ghost_chase', 'Kept sending');
        this.dialogue.show([
          { speaker: 'JP', text: 'Following up in case this got buried.' },
          { speaker: 'Narrator', text: 'Delivered. No answer.' },
          { speaker: 'Paid Client', text: 'Any update? We are still losing orders.' },
        ], () => this.playPricingDecision('prospect'));
      });
    });
  }

  private playWebsiteRescue() {
    this.frozen = true;
    SoundEffects.playAlert();
    this.dialogue.show([
      { speaker: 'Client (text)', text: 'The order button is gone on my phone.' },
      { speaker: 'Narrator', text: 'Desktop looks fine. The client screenshot is real.' },
      { speaker: 'JP\'s Mind', text: 'Do not guess. Find where it actually breaks.' },
    ], () => {
      this.showWorkChoice('What comes first?', 'Reproduce it', 'Rewrite the page', () => {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP narrows the browser to the client\'s screen size.' },
          { speaker: 'Narrator', text: 'The fixed-width cart pushes checkout past the edge.' },
          { speaker: 'JP\'s Mind', text: 'Found it. One constraint, not the whole site.' },
        ], () => this.playWebsiteFixDecision(true));
      }, () => {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP rebuilds the product card. The page looks cleaner.' },
          { speaker: 'Client (text)', text: 'Button is still gone.' },
          { speaker: 'JP\'s Mind', text: 'I changed what I could see instead of finding what broke.' },
        ], () => this.playWebsiteFixDecision(false));
      });
    });
  }

  private playWebsiteFixDecision(reproduced: boolean) {
    this.showWorkChoice('Checkout is wider than the phone.', 'Fix the layout', 'Hide overflow', () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The cart becomes fluid. The button returns at every screen size.' },
        { speaker: 'Client (text)', text: 'It works. Just got an order.' },
        { speaker: 'JP\'s Mind', text: reproduced
          ? 'Reproduce. Trace. Fix the cause.'
          : 'The first hour was wasted. The lesson was not.' },
      ], () => this.finishWebsiteRescue());
    }, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The page stops scrolling sideways. The checkout is still clipped.' },
        { speaker: 'Client (text)', text: 'I still cannot press it.' },
        { speaker: 'JP\'s Mind', text: 'Hiding the symptom is not fixing the site.' },
        { speaker: 'Narrator', text: 'JP goes back, removes the fixed width, and tests it again.' },
      ], () => this.finishWebsiteRescue());
    });
  }

  private finishWebsiteRescue() {
    SoundEffects.playConfirm();
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Ugly or not, the site takes the order.' },
      { speaker: 'JP\'s Mind', text: 'Working beats impressive.' },
    ], () => {
      MoodSystem.changeMorale(4);
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  private playPricingDecision(priority: 'client' | 'prospect') {
    this.showWorkChoice('New lead wants the same work cheaper.', 'Hold price', 'Cut to close', () => {
      ChoiceLedger.record('price_hold', 'Held the price');
      this.dialogue.show([
        { speaker: 'JP', text: 'That is the price for the scope.' },
        { speaker: 'Narrator', text: 'The typing bubble appears, disappears, then never comes back.' },
        { speaker: 'JP\'s Mind', text: priority === 'client'
          ? 'One client stayed because the work came first.'
          : 'I chased one maybe and let another maybe walk.' },
        { speaker: 'Narrator', text: 'A clean no leaves the night quiet.' },
      ], () => this.finishClientTriage());
    }, () => {
      ChoiceLedger.record('price_hold', 'Cut it to close');
      this.dialogue.show([
        { speaker: 'JP', text: 'I can make that work.' },
        { speaker: 'New Lead', text: 'Perfect. One more thing — can you add booking too?' },
        { speaker: 'Narrator', text: 'The price shrinks. The scope grows.' },
        { speaker: 'JP\'s Mind', text: 'Back then, any yes felt safer than no client.' },
      ], () => this.finishClientTriage());
    });
  }

  private finishClientTriage() {
    this.dialogue.show([
      { speaker: 'Narrator', text: 'The code was not the hardest part.' },
      { speaker: 'Narrator', text: 'The hard part was deciding what deserved the next hour.' },
    ], () => {
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  private showWorkChoice(
    prompt: string,
    leftLabel: string,
    rightLabel: string,
    onLeft: () => void,
    onRight: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
      objects.push(object);
      return object;
    };

    add(this.add.rectangle(cx, cy, GAME_WIDTH, 180, 0x070812, 0.94)
      .setScrollFactor(0).setDepth(449).setStrokeStyle(2, 0x4a5872));
    add(this.add.text(cx, cy - 54, prompt, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
      align: 'center', wordWrap: { width: GAME_WIDTH - 180 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451));
    const leftBg = add(this.add.rectangle(cx - 150, cy + 6, 260, 48, 0x355d49)
      .setScrollFactor(0).setDepth(450).setInteractive({ useHandCursor: true }));
    add(this.add.text(cx - 150, cy + 6, leftLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451));
    const rightBg = add(this.add.rectangle(cx + 150, cy + 6, 260, 48, 0x4b5362)
      .setScrollFactor(0).setDepth(450).setInteractive({ useHandCursor: true }));
    add(this.add.text(cx + 150, cy + 6, rightLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451));
    add(this.add.text(cx, cy + 58, 'SPACE / ← left     N / → right', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#737b91',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451));

    const keyboard = this.input.keyboard!;
    const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    let resolved = false;
    const cleanup = () => {
      objects.forEach(object => object.destroy());
      spaceKey.off('down', chooseLeft); nKey.off('down', chooseRight);
      leftKey.off('down', chooseLeft); rightKey.off('down', chooseRight);
    };
    const chooseLeft = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      SoundEffects.playConfirm();
      onLeft();
    };
    const chooseRight = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      SoundEffects.playConfirm();
      onRight();
    };
    leftBg.on('pointerdown', chooseLeft);
    rightBg.on('pointerdown', chooseRight);
    spaceKey.on('down', chooseLeft);
    nKey.on('down', chooseRight);
    leftKey.on('down', chooseLeft);
    rightKey.on('down', chooseRight);
  }

  private playTypingMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;

    const lines = [
      'npx create-next-app',
      'export default function',
      'className="flex gap-4"',
      'npm run build',
      'vercel --prod',
    ];
    let lineIndex = 0;
    let charIndex = 0;
    let totalCharsTyped = 0;
    const startTime = Date.now();

    // Streak tracking
    let streak = 0;

    const monoStyle = {
      fontFamily: '"Press Start 2P", monospace',
    };

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Terminal background
    const termW = GAME_WIDTH - 160;
    const termH = GAME_HEIGHT - 140;
    const terminal = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x0a0a1a)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x30c060);
    objects.push(terminal);

    // Title bar
    const titleBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, termW, 28, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301);
    objects.push(titleBar);
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, 'BUILD THE SITE', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(titleText);

    // --- Clock / Timer (top-left of terminal) ---
    const clockX = GAME_WIDTH / 2 - termW / 2 + 20;
    const clockY = GAME_HEIGHT / 2 - termH / 2 + 14;
    const clockText = this.add.text(clockX, clockY, '0:00', {
      ...monoStyle, fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(clockText);

    const clientWaitingText = this.add.text(clockX, clockY + 14, '', {
      ...monoStyle, fontSize: '6px', color: '#ff4444',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(clientWaitingText);

    const clockTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!active) return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        clockText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

        if (elapsed > 60) {
          clockText.setColor('#ff4444');
          clientWaitingText.setText('Client waiting...');
        } else if (elapsed > 30) {
          clockText.setColor('#f0c040');
          clientWaitingText.setText('');
        }
      },
    });

    // Progress bar background
    const barY = GAME_HEIGHT / 2 - termH / 2 + 44;
    const barW = termW - 60;
    const barBg = this.add.rectangle(GAME_WIDTH / 2, barY, barW, 12, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(1, 0x333355);
    objects.push(barBg);
    // Progress bar fill
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2, barY, 0, 12, 0x30c060)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(barFill);
    // Progress label
    const progressLabel = this.add.text(GAME_WIDTH / 2 + barW / 2 + 10, barY, '0%', {
      ...monoStyle, fontSize: '8px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(progressLabel);

    // WPM display
    const wpmText = this.add.text(GAME_WIDTH / 2 + termW / 2 - 30, GAME_HEIGHT / 2 - termH / 2 + 14, '0 WPM', {
      ...monoStyle, fontSize: '8px', color: '#aaaacc',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(wpmText);

    // --- Streak indicator (next to WPM) ---
    const streakText = this.add.text(GAME_WIDTH / 2 + termW / 2 - 30, GAME_HEIGHT / 2 - termH / 2 + 26, '', {
      ...monoStyle, fontSize: '7px', color: '#f0c040',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(streakText);

    // Line number + prompt
    const lineY = GAME_HEIGHT / 2 - 20;
    const promptX = GAME_WIDTH / 2 - termW / 2 + 40;

    const lineNumText = this.add.text(promptX - 20, lineY - 30, '1/5', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(lineNumText);

    // Target line (untyped chars in grey)
    const targetText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(targetText);

    // Typed text (green, overlaid on top)
    const typedText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(typedText);

    // Blinking cursor
    const cursor = this.add.text(promptX, lineY, '_', {
      ...monoStyle, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(303);
    objects.push(cursor);

    // Cursor blink
    const cursorBlink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        cursor.setAlpha(cursor.alpha === 1 ? 0 : 1);
      },
    });

    // Red flash overlay (for wrong keypress)
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0xff4444, 0)
      .setScrollFactor(0).setDepth(303);
    objects.push(flash);

    // Instruction text
    const instrText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + termH / 2 - 30, 'Type each line to build the site', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instrText);

    // "Line shipped!" text (hidden initially)
    const shippedText = this.add.text(GAME_WIDTH / 2, lineY + 40, '', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
    objects.push(shippedText);

    // Completed lines display area
    const completedTexts: Phaser.GameObjects.Text[] = [];
    const completedStartY = lineY - 80;

    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    const updateProgress = () => {
      let charsCompleted = 0;
      for (let i = 0; i < lineIndex; i++) charsCompleted += lines[i].length;
      charsCompleted += charIndex;
      const pct = Math.round((charsCompleted / totalChars) * 100);
      barFill.setDisplaySize(barW * (pct / 100), 12);
      progressLabel.setText(`${pct}%`);
    };

    const updateWPM = () => {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      if (elapsed <= 0) return 0;
      const words = totalCharsTyped / 5; // standard: 5 chars = 1 word
      const wpm = Math.round(words / elapsed);
      wpmText.setText(`${wpm} WPM`);
      return wpm;
    };

    const updateStreak = () => {
      if (streak >= 30) {
        streakText.setText('LOCKED IN');
        streakText.setColor('#ffffff');
      } else if (streak >= 10) {
        streakText.setText('x' + streak);
        streakText.setColor('#f0c040');
      } else {
        streakText.setText('');
      }

      // At 20+ streak, briefly glow the terminal border
      if (streak === 20 || streak === 25 || streak === 30) {
        terminal.setStrokeStyle(3, 0x60ff90);
        this.time.delayedCall(200, () => {
          if (terminal.active) terminal.setStrokeStyle(2, 0x30c060);
        });
      }
    };

    const loadLine = () => {
      if (lineIndex >= lines.length) {
        finishGame();
        return;
      }
      charIndex = 0;
      const line = lines[lineIndex];
      targetText.setText(line);
      typedText.setText('');
      cursor.setX(promptX);
      cursor.setAlpha(1);
      lineNumText.setText(`${lineIndex + 1}/5`);
      updateProgress();
    };

    const advanceLine = () => {
      // Show completed line in the history area
      const completedY = completedStartY + completedTexts.length * 18;
      const done = this.add.text(promptX, completedY, `> ${lines[lineIndex]}`, {
        ...monoStyle, fontSize: '8px', color: '#30c060',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301).setAlpha(0.5);
      objects.push(done);
      completedTexts.push(done);

      // Flash "Line shipped!"
      shippedText.setText('Line shipped!');
      shippedText.setAlpha(1);
      this.tweens.add({
        targets: shippedText,
        alpha: 0,
        duration: 800,
        delay: 400,
      });

      // Flash terminal border green
      terminal.setStrokeStyle(3, 0x30c060);
      this.time.delayedCall(300, () => {
        terminal.setStrokeStyle(2, 0x30c060);
      });

      lineIndex++;
      this.time.delayedCall(600, () => {
        loadLine();
      });
    };

    // --- Confetti particle helper ---
    const spawnConfetti = () => {
      const confettiColors = [0x30c060, 0xf0c040, 0xffffff, 0x60ff90, 0xffdd00];
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2 - 20;
      for (let i = 0; i < 14; i++) {
        const color = confettiColors[i % confettiColors.length];
        const w = 4 + Math.random() * 6;
        const h = 3 + Math.random() * 5;
        const particle = this.add.rectangle(cx, cy, w, h, color)
          .setScrollFactor(0).setDepth(310).setAlpha(1);
        objects.push(particle);

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const speed = 120 + Math.random() * 180;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Animate: burst up then fall with gravity
        this.tweens.add({
          targets: particle,
          x: cx + vx * 0.8,
          y: cy + vy * 0.4,
          duration: 400,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Gravity fall
            this.tweens.add({
              targets: particle,
              y: GAME_HEIGHT + 20,
              x: cx + vx * 1.2,
              alpha: 0,
              duration: 800 + Math.random() * 400,
              ease: 'Quad.easeIn',
              onComplete: () => {
                particle.destroy();
              },
            });
          },
        });

        // Rotate effect via scale flip
        this.tweens.add({
          targets: particle,
          scaleX: -1,
          duration: 150 + Math.random() * 200,
          yoyo: true,
          repeat: 5,
        });
      }
    };

    const finishGame = () => {
      active = false;
      clockTimer.destroy();
      cursorBlink.destroy();
      this.input.keyboard!.off('keydown', keyHandler);
      this.input.off('pointerdown', pointerListener);

      const elapsed = (Date.now() - startTime) / 1000;
      const minutes = elapsed / 60;
      const words = totalCharsTyped / 5;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

      // Clear typing area
      targetText.setText('');
      typedText.setText('');
      cursor.setAlpha(0);
      lineNumText.setText('');
      instrText.setText('');
      streakText.setText('');
      clientWaitingText.setText('');
      clockText.setText('');

      // --- "SHIPPED!" celebration ---

      // Flash terminal green
      const greenFlash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x30c060, 0.4)
        .setScrollFactor(0).setDepth(305);
      objects.push(greenFlash);
      this.tweens.add({
        targets: greenFlash,
        alpha: 0,
        duration: 400,
      });

      // Confetti burst
      spawnConfetti();

      // "DEPLOYED!" text slam
      const deployedText = this.add.text(GAME_WIDTH / 2, lineY - 50, 'DEPLOYED!', {
        ...monoStyle, fontSize: '28px', color: '#30c060',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(306).setScale(2.5);
      objects.push(deployedText);

      this.tweens.add({
        targets: deployedText,
        scale: 1,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          // After slam, show results
          this.time.delayedCall(600, () => {
            deployedText.setFontSize(14);
            deployedText.setY(lineY - 60);

            // Show results
            titleText.setText('SITE DEPLOYED!');
            titleText.setColor('#30c060');

            const timeStr = elapsed < 60
              ? `${elapsed.toFixed(1)}s`
              : `${Math.floor(elapsed / 60)}m ${Math.round(elapsed % 60)}s`;

            const resultText = this.add.text(GAME_WIDTH / 2, lineY - 10, `${wpm} WPM  //  ${timeStr}`, {
              ...monoStyle, fontSize: '16px', color: '#ffffff',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
            objects.push(resultText);

            const flavor = wpm >= 60
              ? 'Senior dev energy.'
              : wpm >= 40
              ? 'JP ships fast.'
              : wpm >= 20
              ? "Still learning. But it's live."
              : 'Slow and steady. The site works.';

            const flavorText = this.add.text(GAME_WIDTH / 2, lineY + 30, flavor, {
              ...monoStyle, fontSize: '10px', color: '#aaaacc',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
            objects.push(flavorText);

            // Fill progress to 100%
            barFill.setDisplaySize(barW, 12);
            progressLabel.setText('100%');
            wpmText.setText(`${wpm} WPM`);

            // After results display, cleanup and show post-game dialogue
            this.time.delayedCall(3000, () => {
              for (const obj of objects) {
                if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
              }
              this.frozen = false;

              // Post-game dialogue based on WPM
              let postDialogue: DialogueLine[];
              if (wpm >= 60) {
                postDialogue = [{ speaker: 'Narrator', text: "JP's fingers moved like they always knew how." }];
              } else if (wpm >= 40) {
                postDialogue = [{ speaker: 'Narrator', text: "Not fast. But it works. And it's live." }];
              } else {
                postDialogue = [{ speaker: 'Narrator', text: "Slow. But he shipped it. That's what matters." }];
              }

              this.frozen = true;
              this.dialogue.show(postDialogue, () => {
                this.frozen = false;
              });
            });
          });
        },
      });
    };

    const handleCorrectChar = () => {
      const line = lines[lineIndex];
      typedText.setText(line.substring(0, charIndex + 1));
      charIndex++;
      totalCharsTyped++;
      streak++;

      // Move cursor
      // Approximate character width for "Press Start 2P" at 14px
      cursor.setX(promptX + charIndex * 12.5);
      cursor.setAlpha(1);

      updateProgress();
      updateWPM();
      updateStreak();

      // Check if line complete
      if (charIndex >= line.length) {
        advanceLine();
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (!active || lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const expected = line[charIndex];

      // Only handle single printable characters and space
      if (event.key.length !== 1) return;

      if (event.key === expected) {
        handleCorrectChar();

        // Green pulse on cursor
        this.tweens.add({
          targets: cursor,
          scaleY: 1.3,
          duration: 60,
          yoyo: true,
        });
      } else {
        // Wrong key — reset streak, red flash, don't advance
        streak = 0;
        updateStreak();

        flash.setFillStyle(0xff4444, 0.2);
        flash.setAlpha(1);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
        });

        // Shake the target text
        const origX = targetText.x;
        this.tweens.add({
          targets: [targetText, typedText],
          x: origX + 4,
          duration: 40,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            targetText.setX(origX);
            typedText.setX(origX);
          },
        });
      }
    };

    // Touch support — auto-complete current character
    const pointerListener = () => {
      if (!active || lineIndex >= lines.length) return;
      handleCorrectChar();
    };

    this.input.keyboard!.on('keydown', keyHandler);
    this.input.on('pointerdown', pointerListener);

    // Start first line
    loadLine();
  }

  private ghostEcho(): DialogueLine[] {
    // Kept-sending in Weed Rise-era habit carries into how he chases legit clients
    return ChoiceLedger.get('ghost_chase') === 'Kept sending'
      ? [{ speaker: 'JP\'s Mind', text: 'Same finger that texted buyers who ghosted now texts clients who ghost. Muscle memory. At least it\'s legal now.' }]
      : [];
  }

  private playPaymentCutscene() {
    this.frozen = true;

    // --- Phone vibration (camera shake before anything appears) ---
    this.cameras.main.shake(100, 0.003);

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(100).setAlpha(0);

    // Payment notification box
    const boxW = 280;
    const boxH = 140;
    const boxX = GAME_WIDTH / 2;
    const boxY = GAME_HEIGHT / 2;

    const box = this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e)
      .setScrollFactor(0).setDepth(101).setAlpha(0).setStrokeStyle(2, 0x30c060);

    // "Payment Received" label
    const label = this.add.text(boxX, boxY - 35, 'Payment Received', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Amount text (will count up)
    const amountText = this.add.text(boxX, boxY + 10, '$0.00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Fade in overlay and box (after shake)
    this.time.delayedCall(120, () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0.6,
        duration: 300,
      });
      this.tweens.add({
        targets: [box, label, amountText],
        alpha: 1,
        duration: 400,
        delay: 200,
        onComplete: () => {
          // Count up from $0 to $300
          let currentAmount = 0;
          const targetAmount = 300;
          const countDuration = 1200; // ms
          const steps = 30;
          const stepDelay = countDuration / steps;
          const increment = targetAmount / steps;

          const counter = this.time.addEvent({
            delay: stepDelay,
            repeat: steps - 1,
            callback: () => {
              currentAmount += increment;
              if (currentAmount > targetAmount) currentAmount = targetAmount;
              amountText.setText('$' + currentAmount.toFixed(2));
            },
          });

          // After counting finishes, show the thought
          this.time.delayedCall(countDuration + 200, () => {
            const thought = this.add.text(boxX, boxY + 45, 'First real dollar from\nsomething I BUILT.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '9px',
              color: '#f0c040',
              align: 'center',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

            this.tweens.add({
              targets: thought,
              alpha: 1,
              duration: 400,
            });

            // --- Emotional beat: escalating amounts ---
            this.time.delayedCall(1200, () => {
              // Fade out the thought text first
              this.tweens.add({
                targets: thought,
                alpha: 0,
                duration: 300,
              });

              // Resize box to fit escalation
              this.tweens.add({
                targets: box,
                displayHeight: 220,
                duration: 300,
              });

              const escalationAmounts = ['$300.', '$500.', '$900.', '$1,000.'];
              const escalationSizes = ['10px', '12px', '14px', '16px'];
              const escalationColors = ['#888888', '#bbbbbb', '#f0c040', '#ffffff'];
              const escalationObjects: Phaser.GameObjects.Text[] = [];
              const baseY = boxY - 10;

              escalationAmounts.forEach((amount, i) => {
                this.time.delayedCall(600 * i, () => {
                  // Hide the original amount text when escalation starts
                  if (i === 0) {
                    amountText.setAlpha(0);
                  }

                  const escalText = this.add.text(boxX, baseY + i * 28, amount, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: escalationSizes[i],
                    color: escalationColors[i],
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);
                  escalationObjects.push(escalText);

                  this.tweens.add({
                    targets: escalText,
                    alpha: 1,
                    duration: 300,
                  });
                });
              });

              // Hold final display for 2 seconds, then fade everything out
              const totalEscalationTime = 600 * escalationAmounts.length;
              this.time.delayedCall(totalEscalationTime + 2000, () => {
                const allObjects = [overlay, box, label, amountText, thought, ...escalationObjects];
                this.tweens.add({
                  targets: allObjects,
                  alpha: 0,
                  duration: 400,
                  onComplete: () => {
                    allObjects.forEach((obj) => {
                      if (obj && obj.active) obj.destroy();
                    });
                    InventorySystem.addItem('cash', 1);
                    this.frozen = false;
                  },
                });
              });
            });
          });
        },
      });
    });
  }
}
