import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDay1Dialogue, jailDay2Dialogue, jailDay3Dialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { Analytics } from '../systems/Analytics';
import { GameSettings } from '../systems/GameSettings';
import { GameIntelligence } from '../systems/GameIntelligence';
import { SoundEffects } from '../systems/SoundEffects';
import { MusicSystem } from '../systems/MusicSystem';
import { SubstanceSystem } from '../systems/SubstanceSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { AffinitySystem } from '../systems/AffinitySystem';
import { BalanceSystem } from '../systems/BalanceSystem';

export class JailScene extends BaseChapterScene {
  private currentDay = 1;
  private battleWon: boolean | null = null; // null = not fought, true/false = outcome
  private phaseOneRelapseDone = false;
  private phaseOneRefusedLastHit = false;
  private sawBirdCycle = false;
  private sawDeniedAppeal = false;
  private phaseOneRealizationDone = false;
  private trainingComplete = false;
  private bookRead = false;
  private faithDone = false;
  private pushupDominated = false; // won by 10+
  private pushupGameActive = false;
  private diceBroke = false; // went to 0 in dice
  private crewSaveUsed = false; // the crew steps in once per fight, if earned
  private shirtOff = false;
  private guardPatrolTimer?: Phaser.Time.TimerEvent;
  private inmatePatrolTimers: Phaser.Time.TimerEvent[] = [];
  private jailGateVisuals = new Map<string, Phaser.GameObjects.Container>();

  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 5: Locked Up';
    this.nextScene = 'ReleaseScene';
    this.requiredInteractionId = 'ch3_bed';
  }

  protected getPlayerTexture(): string {
    // Sprite evolves each day
    if (this.currentDay >= 3) return this.shirtOff ? 'player-jail-shirtless' : 'player-jail-day3';
    if (this.currentDay >= 2) return 'player-jail-day2';
    return 'player-jail-day1';
  }

  protected getMusicTrack(): string {
    return 'jail';
  }

  create() {
    this.currentDay = 1;
    this.battleWon = null;
    this.phaseOneRelapseDone = false;
    this.phaseOneRefusedLastHit = false;
    this.sawBirdCycle = false;
    this.sawDeniedAppeal = false;
    this.phaseOneRealizationDone = false;
    this.trainingComplete = false;
    this.bookRead = false;
    this.faithDone = false;
    this.pushupDominated = false;
    this.pushupGameActive = false;
    this.diceBroke = false;
    this.shirtOff = false;
    this.jailGateVisuals.clear();
    super.create();

    // The 40x40 facility is one of the largest maps in the game; the old wide
    // camera made six cells, intake, yard, chapel and chow read like one small
    // board. A closer jail-specific lens makes each corridor a place the
    // player has to move through and keeps later areas unknown from the bunk.
    this.cameras.main.setZoom(1.32);

    // The shared house-sized props overwhelm a jail cell. Keep their
    // interactions/markers, but let the jail-specific furniture carry the art.
    for (const visual of this.interactions.getVisuals()) {
      if (['ch3_bed', 'ch3_toilet', 'ch3_book', 'ch3_letter_home'].includes(visual.id)) {
        visual.sprite?.setVisible(false);
      }
    }

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch3_bed',         3,  6,  true);  // required: gate to ch5
    GameIntelligence.watch('ch3_book',        5,  8,  true);  // required: Compound Effect
    GameIntelligence.watch('ch3_letter_home', 4,  6);
    GameIntelligence.watch('ch3_phone',       10, 13);
    GameIntelligence.watch('ch3_fight_watch', 23, 3);
    GameIntelligence.watch('ch3_pbj_witness', 20, 35);
    GameIntelligence.watch('ch3_dice_watch',  34, 8);
    GameIntelligence.watch('ch3_pushups',     12, 19, true);  // required: minigame
    GameIntelligence.watch('ch3_faith',       7,  22, true);  // required: transformation arc
    GameIntelligence.watch('ch3_psych_course', 35, 24);
    GameIntelligence.attachDebugPanel(this);

    // The old map made barred thresholds look and behave like dead ends. These
    // marked gates guarantee a readable route through the cell, yard, chapel,
    // and release path even if a moving NPC temporarily occupies a corridor.
    this.openJailRoutes();
    this.createJailIdentity();
    this.openStartingCellRoute();
    this.addNavArrow(4, 9, 'COMMON AREA');
    this.addNavArrow(17, 17, 'Yard');
    this.addNavArrow(15, 26, 'Chapel');
    this.addNavArrow(20, 31, 'Chow');

    // Guard patrol — walks between guard station and cells
    this.startGuardPatrol();

    // Inmate movement — crew and other inmates pace/wander
    this.startInmateMovement();

    // Shirt toggle button (Day 2+)
    this.createShirtToggle();
  }

  private openJailRoutes() {
    // Movement to the common area begins on a remote buzz, as it does in a
    // housing unit. Yard and chapel remain controlled interaction gates.
    const guaranteedOpenTiles = [
      '4,9',
      '4,10', '4,11', '4,12',
      '17,18',
      '15,27',
      '20,31', '20,32',
    ];
    guaranteedOpenTiles.forEach((tile) => this.collisionTiles.delete(tile));
  }

  private openStartingCellRoute() {
    const gateVisual = this.jailGateVisuals.get('4,9');
    if (gateVisual) {
      gateVisual.x -= SCALED_TILE * 0.82;
      gateVisual.setAlpha(0.18);
    }
  }

  private createJailIdentity() {
    const tile = SCALED_TILE;

    // Institutional seams keep the large concrete surfaces from reading as
    // empty purple rooms.
    for (const y of [3, 7, 11, 14, 16, 20, 24, 29, 32, 35, 37]) {
      this.add.rectangle(20 * tile, y * tile, 36 * tile, 3, 0x14191d, 0.42)
        .setDepth(0.72);
    }
    for (const x of [7, 13, 20, 27, 32, 38]) {
      this.add.rectangle(x * tile, 15.5 * tile, 3, 27 * tile, 0x14191d, 0.32)
        .setDepth(0.72);
    }

    // The map's long vertical bar strips looked like giant freestanding fences.
    // Cover those cell side walls with concrete, leaving bars only at the
    // actual fronts and gates.
    for (const x of [6.5, 12.5]) {
      for (const segment of [{ y: 3.5, h: 3 }, { y: 7.5, h: 3 }, { y: 10.95, h: 2.1 }]) {
        this.add.rectangle(x * tile, segment.y * tile, 0.64 * tile, segment.h * tile, 0x41414d)
          .setDepth(2.34).setStrokeStyle(3, 0x24242c);
        this.add.rectangle(x * tile, (segment.y - segment.h / 2 + 0.2) * tile, 0.46 * tile, 7, 0x24242c)
          .setDepth(2.36);
        for (let seam = -1; seam <= 1; seam++) {
          this.add.rectangle(x * tile, (segment.y + seam * 0.65) * tile, 0.56 * tile, 2, 0x676773, 0.42)
            .setDepth(2.35);
        }
      }
    }

    // Steel bunk, thin mattress, toilet/lavatory, writing shelf, storage and
    // personal clutter in every visible cell. Everything hugs a wall so the
    // cells stay tight and navigable.
    const cellRooms = [
      { left: 2, top: 2 }, { left: 8, top: 2 },
      { left: 2, top: 6 }, { left: 8, top: 6 },
      { left: 2, top: 10 }, { left: 8, top: 10 },
    ];
    for (const room of cellRooms) {
      const bunkX = (room.left + 1.35) * tile;
      const bunkY = (room.top + 0.65) * tile;
      this.add.rectangle(bunkX, bunkY, 1.65 * tile, 21, 0x303b42).setDepth(1.12);
      this.add.rectangle(bunkX, bunkY - 3, 1.48 * tile, 12, 0x899296).setDepth(1.14);
      this.add.rectangle(bunkX - 0.78 * tile, bunkY + 15, 7, 38, 0x20282d).setDepth(1.15);
      this.add.rectangle(bunkX + 0.78 * tile, bunkY + 15, 7, 38, 0x20282d).setDepth(1.15);

      const isJpCell = room.left === 2 && room.top === 6;
      const toiletX = (room.left + (isJpCell ? 0.55 : 3.35)) * tile;
      const toiletY = (room.top + (isJpCell ? 1.65 : 2.25)) * tile;
      this.add.circle(toiletX, toiletY, 15, 0xa8b3b6).setDepth(1.13);
      this.add.circle(toiletX, toiletY, 8, 0x38464c).setDepth(1.14);
      this.add.rectangle(toiletX, toiletY - 18, 27, 22, 0x77868b).setDepth(1.12);

      // Stainless combination sink fixed above the plumbing chase.
      this.add.rectangle(toiletX, toiletY - 40, 30, 16, 0x89979a).setDepth(1.15)
        .setStrokeStyle(2, 0x4a565b);
      this.add.circle(toiletX, toiletY - 40, 5, 0x303b40).setDepth(1.16);
      this.add.rectangle(toiletX + 9, toiletY - 54, 3, 12, 0xb3bdbf).setDepth(1.16);

      this.add.rectangle((room.left + 3.35) * tile, (room.top + 0.58) * tile, 48, 8, 0x47535a)
        .setDepth(1.12);
      this.add.rectangle((room.left + 2.35) * tile, (room.top + 2.45) * tile, 23, 13, 0xc5b08b, 0.65)
        .setAngle((room.top + room.left) % 2 ? 7 : -8).setDepth(1.16);

      // Fold-down writing surface, property bin, clothes hook and air vent.
      const deskX = (room.left + 2.35) * tile;
      const deskY = (room.top + 1.55) * tile;
      this.add.rectangle(deskX, deskY, 52, 22, 0x59666b).setDepth(1.17)
        .setStrokeStyle(3, 0x283136);
      this.add.rectangle(deskX, deskY + 20, 6, 31, 0x30393e).setDepth(1.15);
      this.add.rectangle(bunkX, bunkY + 28, 66, 19, 0x242c31).setDepth(1.16)
        .setStrokeStyle(2, 0x4f5b60);
      this.add.circle((room.left + 0.4) * tile, (room.top + 0.55) * tile, 4, 0x9ba6a8).setDepth(1.19);
      this.add.rectangle((room.left + 0.62) * tile, (room.top + 0.46) * tile, 46, 18, 0x1b2226)
        .setDepth(1.17).setStrokeStyle(2, 0x778489);
      for (const ventOffset of [-15, -5, 5, 15]) {
        this.add.rectangle((room.left + 0.62) * tile + ventOffset, (room.top + 0.46) * tile, 2, 12, 0x6f7c81)
          .setDepth(1.18);
      }

      if (isJpCell) {
        // Personal props line up with the usable Letter and Book interactions.
        this.add.rectangle(4.1 * tile, 6.55 * tile, 22, 14, 0xe5dbc0).setDepth(1.22).setAngle(-4);
        this.add.rectangle(5.0 * tile, 8.0 * tile, 24, 31, 0x31505f).setDepth(1.22)
          .setStrokeStyle(3, 0x1b2b33).setAngle(5);
        this.add.rectangle(5.0 * tile, 8.0 * tile, 3, 28, 0xd2b55b).setDepth(1.23).setAngle(5);
        this.add.text(5.0 * tile, 8.0 * tile, 'THE\nCOMPOUND\nEFFECT', {
          fontFamily: 'monospace', fontSize: '4px', color: '#e7e0bd', align: 'center',
        }).setOrigin(0.5).setDepth(1.24).setAngle(5);
      }
    }

    // The secure passage beside the cells needs a function, not a blank slab:
    // intake bench, property cart, roster board and direction striping.
    this.add.text(16.4 * tile, 2.55 * tile, 'INTAKE / TRANSPORT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#9ca7aa',
    }).setOrigin(0.5).setDepth(1.05);
    this.add.rectangle(16.3 * tile, 4.2 * tile, 3.5 * tile, 22, 0x3e484d).setDepth(1.05)
      .setStrokeStyle(3, 0x1b2226);
    for (const x of [15.2, 16.3, 17.4]) {
      this.add.rectangle(x * tile, 4.2 * tile + 18, 7, 30, 0x242c30).setDepth(1.04);
    }
    this.add.rectangle(16.3 * tile, 7.0 * tile, 2.8 * tile, 1.55 * tile, 0x252d31).setDepth(1.04)
      .setStrokeStyle(3, 0x606c70);
    for (const y of [6.55, 7.0, 7.45]) {
      this.add.rectangle(16.3 * tile, y * tile, 2.35 * tile, 4, 0x788488).setDepth(1.06);
    }
    this.add.text(16.3 * tile, 8.1 * tile, 'PROPERTY', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#899598',
    }).setOrigin(0.5).setDepth(1.08);
    this.add.rectangle(14.22 * tile, 9.8 * tile, 5, 3.2 * tile, 0xd4b446, 0.55).setDepth(1.04);
    this.add.rectangle(18.78 * tile, 9.8 * tile, 5, 3.2 * tile, 0xd4b446, 0.55).setDepth(1.04);

    // Jail-specific steel sliders cover the shared brown door tile.
    for (const door of [
      { x: 4, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 9 },
    ]) {
      const dx = door.x * tile + tile / 2;
      const dy = door.y * tile + tile / 2;
      this.add.rectangle(dx, dy, 50, 58, 0x46535a).setDepth(2.46)
        .setStrokeStyle(4, 0x1d2529);
      this.add.rectangle(dx, dy - 12, 30, 15, 0x141a1e).setDepth(2.48);
      for (const offset of [-10, 0, 10]) {
        this.add.rectangle(dx + offset, dy - 12, 3, 15, 0x9aa5a8).setDepth(2.49);
      }
      this.add.rectangle(dx, dy + 13, 28, 5, 0x1e272b).setDepth(2.49);
    }

    // Cell numbers and cold fluorescent strips give the block a legible rhythm.
    const cells = [
      { x: 4, y: 5, label: 'A1' }, { x: 10, y: 5, label: 'A2' },
      { x: 4, y: 9, label: 'A3' }, { x: 10, y: 9, label: 'A4' },
    ];
    for (const cell of cells) {
      const cx = cell.x * tile + tile / 2;
      const cy = cell.y * tile + 9;
      this.add.rectangle(cx, cy, 30, 16, 0x1d2327).setDepth(2.1);
      this.add.text(cx, cy, cell.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#b8c4c7',
      }).setOrigin(0.5).setDepth(2.2);
    }
    for (const x of [3, 9, 15, 24, 33]) {
      const light = this.add.rectangle(x * tile + tile / 2, 13.25 * tile, 82, 7, 0xdbe7df, 0.78)
        .setDepth(1.6);
      this.tweens.add({
        targets: light,
        alpha: { from: 0.55, to: 0.82 },
        duration: 1800 + x * 33,
        yoyo: true,
        repeat: -1,
      });
    }

    this.add.text(8 * tile, 1.72 * tile, 'HOUSING UNIT A', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#d4d9d6',
    }).setOrigin(0.5).setDepth(2.3);
    this.add.text(29.5 * tile, 1.72 * tile, 'DAYROOM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#d4d9d6',
    }).setOrigin(0.5).setDepth(2.3);
    this.add.text(29.5 * tile, 11.45 * tile, 'COUNT TIME · RED LINE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#b87362',
    }).setOrigin(0.5).setDepth(2.3);

    // Bolted steel tables and fixed stools give the dayroom a real use.
    for (const table of [{ x: 25.2, y: 5.6 }, { x: 32.8, y: 7.3 }]) {
      const tx = table.x * tile;
      const ty = table.y * tile;
      this.add.rectangle(tx, ty, 2.7 * tile, 1.12 * tile, 0x65747a).setDepth(1.32)
        .setStrokeStyle(5, 0x283238);
      this.add.rectangle(tx, ty, 2.42 * tile, 0.86 * tile, 0x8b989b).setDepth(1.33);
      for (const [sx, sy] of [[-1.7, 0], [1.7, 0], [0, -1.05], [0, 1.05]]) {
        this.add.circle(tx + sx * tile, ty + sy * tile, 17, 0x56646a).setDepth(1.34)
          .setStrokeStyle(4, 0x222b30);
        this.add.rectangle(tx + sx * tile, ty + sy * tile + 18, 8, 28, 0x242d31).setDepth(1.31);
      }
    }

    // Phone bank and barred commissary window.
    this.add.rectangle(36.8 * tile, 5.5 * tile, 18, 4.9 * tile, 0x273136).setDepth(1.34);
    for (const y of [3.7, 5.2, 6.7, 8.2]) {
      this.add.rectangle(36.55 * tile, y * tile, 20, 34, 0x59686d).setDepth(1.38);
      this.add.circle(36.48 * tile, y * tile - 2, 5, 0x171d20).setDepth(1.4);
    }
    this.add.rectangle(28 * tile, 2.55 * tile, 4.8 * tile, 16, 0x313d42).setDepth(1.36);
    for (let x = 25.8; x <= 30.2; x += 0.42) {
      this.add.rectangle(x * tile, 2.55 * tile, 3, 42, 0x879398).setDepth(1.38);
    }
    this.add.text(28 * tile, 2.08 * tile, 'COMMISSARY', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#c4ccca',
    }).setOrigin(0.5).setDepth(1.42);

    // Cameras and warning placards sell constant supervision.
    for (const camera of [
      { x: 14.3, y: 2.3, angle: 22 },
      { x: 37.1, y: 2.3, angle: -22 },
      { x: 21.8, y: 13.35, angle: 18 },
    ]) {
      const cx = camera.x * tile;
      const cy = camera.y * tile;
      this.add.rectangle(cx, cy, 32, 15, 0x20282d).setAngle(camera.angle).setDepth(2.25);
      this.add.circle(cx + (camera.angle > 0 ? 12 : -12), cy + 3, 5, 0xb92424).setDepth(2.28);
    }
    for (const sign of [
      { x: 14.7, y: 13.35, text: 'NO CONTACT' },
      { x: 23.5, y: 13.35, text: 'KEEP MOVING' },
    ]) {
      this.add.rectangle(sign.x * tile, sign.y * tile, 2.8 * tile, 26, 0xe7dfc2).setDepth(1.7)
        .setStrokeStyle(3, 0x7b322c);
      this.add.text(sign.x * tile, sign.y * tile, sign.text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#6f2824',
      }).setOrigin(0.5).setDepth(1.72);
    }

    // Guard station glass and desk silhouette.
    this.add.rectangle(19 * tile, 14.5 * tile, 4.5 * tile, 1.45 * tile, 0x64828b, 0.28)
      .setDepth(1.25);
    this.add.rectangle(19 * tile, 15.35 * tile, 3.1 * tile, 18, 0x283036, 0.92)
      .setDepth(1.4);
    this.add.text(19 * tile, 14.2 * tile, 'CONTROL', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#9db1b6',
    }).setOrigin(0.5).setDepth(1.8);

    // Three unmistakable gate frames. Their amber lights change the doors from
    // decorative bars into navigation landmarks.
    const gates = [
      { x: 4, y: 9, label: 'CELL BLOCK' },
      { x: 17, y: 17, label: 'YARD' },
      { x: 15, y: 26, label: 'CHAPEL' },
    ];
    for (const gate of gates) {
      const gx = gate.x * tile + tile / 2;
      const gy = gate.y * tile + tile / 2;
      this.add.rectangle(gx - tile / 2 + 5, gy, 9, tile, 0x394249).setDepth(2.4);
      this.add.rectangle(gx + tile / 2 - 5, gy, 9, tile, 0x394249).setDepth(2.4);
      this.add.rectangle(gx, gy - tile / 2 + 5, tile, 9, 0x4a555c).setDepth(2.4);
      const lamp = this.add.circle(gx + 20, gy - 20, 5, 0xe1a83a, 0.9).setDepth(2.6);
      this.tweens.add({ targets: lamp, alpha: 0.3, duration: 650, yoyo: true, repeat: -1 });
      this.add.text(gx, gy - 44, gate.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#d7c38c',
      }).setOrigin(0.5).setDepth(2.6);

      // Dark pocket covers the shared brown door/fence texture after the steel
      // slider moves away.
      this.add.rectangle(gx, gy, tile - 9, tile - 9, 0x10171b).setDepth(2.45);
      const slidingGate = this.add.container(gx, gy).setDepth(2.52);
      slidingGate.add(this.add.rectangle(0, 0, tile - 8, tile - 8, 0x172025, 0.92)
        .setStrokeStyle(4, 0x66757b));
      slidingGate.add(this.add.rectangle(0, -tile / 2 + 9, tile - 7, 7, 0x89979b));
      slidingGate.add(this.add.rectangle(0, tile / 2 - 9, tile - 7, 7, 0x89979b));
      for (const offset of [-20, -10, 0, 10, 20]) {
        slidingGate.add(this.add.rectangle(offset, 0, 4, tile - 12, 0x9aa6aa));
      }
      this.jailGateVisuals.set(`${gate.x},${gate.y}`, slidingGate);
    }

    // Cover the global wooden fence material with welded prison mesh.
    const addSecurityFence = (y: number, gapX: number) => {
      for (let x = 2; x <= 37; x++) {
        if (x === gapX) continue;
        const fx = x * tile + tile / 2;
        const fy = y * tile + tile / 2;
        this.add.rectangle(fx, fy, tile + 2, tile, 0x151d21, 0.96).setDepth(1.5);
        this.add.rectangle(fx, fy - 21, tile + 2, 5, 0x65747a).setDepth(1.58);
        this.add.rectangle(fx, fy + 21, tile + 2, 5, 0x65747a).setDepth(1.58);
        for (const offset of [-24, -12, 0, 12, 24]) {
          this.add.rectangle(fx + offset, fy, 3, 55, 0x879499).setDepth(1.6);
        }
      }
    };
    addSecurityFence(17, 17);
    addSecurityFence(26, 15);
    addSecurityFence(31, 20);

    this.add.text(19.5 * tile, 17.72 * tile, 'RECREATION YARD', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#b8c2c4',
    }).setOrigin(0.5).setDepth(2.08);

    // Razor-wire silhouette along the two yard fences.
    for (const y of [17.08, 26.08]) {
      for (let x = 2.7; x < 37; x += 0.85) {
        this.add.ellipse(x * tile, y * tile, 46, 18, 0x000000, 0)
          .setStrokeStyle(3, 0x8e9a9e, 0.82).setDepth(1.66);
      }
    }

    // Cover the old crate-like exercise tiles with prison weight stations.
    for (const station of [{ x: 5, y: 18 }, { x: 4, y: 19 }, { x: 9, y: 20 }, { x: 8, y: 21 }]) {
      const sx = station.x * tile + tile / 2;
      const sy = station.y * tile + tile / 2;
      this.add.rectangle(sx, sy, 62, 62, 0x252c31).setDepth(1.7);
      this.add.rectangle(sx, sy + 5, 48, 15, 0x4b585e).setDepth(1.76);
      this.add.rectangle(sx, sy + 17, 7, 27, 0x20272b).setDepth(1.75);
      this.add.rectangle(sx, sy - 17, 57, 5, 0x879397).setDepth(1.77);
      this.add.circle(sx - 31, sy - 17, 10, 0x1c2226).setDepth(1.78);
      this.add.circle(sx + 31, sy - 17, 10, 0x1c2226).setDepth(1.78);
    }

    // Yard court markings, pull-up station, and weights. The space now reads as
    // an exercise yard from the camera instead of another concrete room.
    const yardCx = 19.5 * tile;
    const yardCy = 22 * tile;
    this.add.rectangle(yardCx, yardCy, 17 * tile, 7 * tile, 0x000000, 0)
      .setStrokeStyle(5, 0xbfc4ba, 0.42).setDepth(0.8);
    this.add.circle(yardCx, yardCy, 54, 0x000000, 0)
      .setStrokeStyle(4, 0xbfc4ba, 0.42).setDepth(0.81);
    for (const x of [9.5, 11.7, 33.1, 35.0]) {
      this.add.rectangle(x * tile, 24.8 * tile, 8, 54, 0x30373c).setDepth(2);
    }
    this.add.rectangle(10.6 * tile, 24.25 * tile, 2.2 * tile, 8, 0x465158).setDepth(2.1);
    this.add.rectangle(34.05 * tile, 24.25 * tile, 1.9 * tile, 8, 0x465158).setDepth(2.1);

    // Chapel: warm pools of light and actual pew rows visually separate the
    // interior transformation from the violence of the block and yard.
    for (const y of [28.2, 29.2]) {
      for (const x of [8, 13, 25, 30]) {
        this.add.rectangle(x * tile, y * tile, 3.3 * tile, 18, 0x5b3d28).setDepth(1.65);
        this.add.rectangle(x * tile, y * tile - 6, 3.3 * tile, 5, 0x8b6038).setDepth(1.7);
      }
    }
    this.add.circle(20 * tile, 27.6 * tile, 96, 0xf0c878, 0.07).setDepth(1.1);
    this.add.text(20 * tile, 27.5 * tile, 'QUIET ROOM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#d8bd79',
    }).setOrigin(0.5).setDepth(2.2);

    this.createChowHall();
  }

  private createChowHall() {
    const tile = SCALED_TILE;

    this.add.text(20 * tile, 32.15 * tile, 'CHOW HALL · 12 MINUTES', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#c7cfcc',
    }).setOrigin(0.5).setDepth(2.3);
    this.add.text(20 * tile, 37.35 * tile, 'EAT · CLEAN · MOVE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#827f78',
    }).setOrigin(0.5).setDepth(2.3);

    // Stainless serving line and the barred pass-through make this a jail
    // chow hall, not another sparse multipurpose room.
    this.add.rectangle(33.4 * tile, 33.15 * tile, 7.2 * tile, 1.15 * tile, 0x657378)
      .setDepth(1.55).setStrokeStyle(5, 0x252e32);
    this.add.rectangle(33.4 * tile, 32.7 * tile, 7.05 * tile, 14, 0x9aa5a6).setDepth(1.58);
    for (let x = 30.2; x <= 36.6; x += 0.55) {
      this.add.rectangle(x * tile, 32.25 * tile, 3, 46, 0x7f8c8f).setDepth(1.62);
    }
    for (const x of [31.1, 33.35, 35.6]) {
      this.add.rectangle(x * tile, 33.0 * tile, 1.5 * tile, 19, 0xb1b8b6).setDepth(1.65)
        .setStrokeStyle(2, 0x4b5659);
      this.add.ellipse(x * tile, 33.0 * tile, 42, 10, 0x555e5f).setDepth(1.66);
    }
    this.add.text(33.4 * tile, 31.92 * tile, 'SERVING LINE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#aeb8b7',
    }).setOrigin(0.5).setDepth(2.05);

    // Two rows of bolted tables, trays and undersized fixed stools. The aisle
    // remains clear so the room is usable at normal movement speed.
    for (const table of [
      { x: 7.5, y: 34.3 }, { x: 15.5, y: 34.3 }, { x: 23.5, y: 34.3 },
      { x: 7.5, y: 36.2 }, { x: 15.5, y: 36.2 }, { x: 23.5, y: 36.2 },
    ]) {
      const tx = table.x * tile;
      const ty = table.y * tile;
      this.add.rectangle(tx, ty, 3.25 * tile, 0.76 * tile, 0x7d898b).setDepth(1.5)
        .setStrokeStyle(4, 0x293236);
      this.add.rectangle(tx, ty + 20, 10, 42, 0x333d41).setDepth(1.48);
      for (const stoolX of [-1.95, 1.95]) {
        this.add.circle(tx + stoolX * tile, ty, 15, 0x515d61).setDepth(1.54)
          .setStrokeStyle(3, 0x242c30);
      }
      for (const trayX of [-0.92, 0.92]) {
        this.add.rectangle(tx + trayX * tile, ty - 4, 48, 25, 0xa4aaa6).setDepth(1.56)
          .setStrokeStyle(2, 0x4d5657);
        this.add.rectangle(tx + trayX * tile - 10, ty - 4, 15, 10, 0xc7aa70).setDepth(1.57);
        this.add.rectangle(tx + trayX * tile + 10, ty - 4, 12, 10, 0x88815a).setDepth(1.57);
      }
    }

    // PB&J at the center table anchors the witnessed violence beat in the
    // place where JP actually kept eating while the block moved on.
    this.add.rectangle(20 * tile, 35 * tile, 56, 36, 0x9ba19d).setDepth(1.58)
      .setStrokeStyle(3, 0x424a4b);
    this.add.rectangle(20 * tile, 35 * tile, 29, 17, 0xd7bc80).setDepth(1.61);
    this.add.rectangle(20 * tile, 35 * tile, 18, 9, 0x7d4f35).setDepth(1.62);

    // Workers and diners keep moving even when the player is only passing
    // through. They are atmosphere, not another dialogue checklist.
    const worker = this.add.sprite(30.4 * tile, 33.85 * tile, 'npc_inmate4', 0)
      .setScale(1.8).setTint(0xc2c8c5).setDepth(1.9);
    this.tweens.add({
      targets: worker,
      x: 36.2 * tile,
      duration: 6200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    for (const diner of [
      { x: 6.4, y: 34.3, texture: 'npc_inmate' },
      { x: 16.6, y: 34.3, texture: 'npc_inmate2' },
      { x: 22.4, y: 36.2, texture: 'npc_inmate3' },
    ]) {
      this.add.sprite(diner.x * tile, diner.y * tile, diner.texture, 0)
        .setScale(1.75).setDepth(1.88);
    }

    this.add.rectangle(4.2 * tile, 32.55 * tile, 2.9 * tile, 24, 0xe0dbc6).setDepth(1.8)
      .setStrokeStyle(3, 0x7a302d);
    this.add.text(4.2 * tile, 32.55 * tile, 'NO TALKING\nIN LINE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#6e2926', align: 'center',
    }).setOrigin(0.5).setDepth(1.82);
    this.add.rectangle(37.1 * tile, 32.15 * tile, 32, 15, 0x20282d).setAngle(-20).setDepth(2.2);
    this.add.circle(36.9 * tile, 32.23 * tile, 5, 0xb92424).setDepth(2.22);
  }

  private startGuardPatrol() {
    const guard = this.npcs.find(n => n.id === 'ch3_guard');
    if (!guard) return;

    let patrolForward = true;
    const startX = guard.sprite.x;
    const patrolEndX = 10 * 64 + 32; // tile 10

    this.guardPatrolTimer = this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        const guard = this.npcs.find(n => n.id === 'ch3_guard');
        if (!guard) return;

        const targetX = patrolForward ? patrolEndX : startX;
        patrolForward = !patrolForward;

        // Remove old collision
        const oldTX = Math.round((guard.sprite.x - 32) / 64);
        const oldTY = Math.round((guard.sprite.y - 32) / 64);
        this.collisionTiles.delete(`${oldTX},${oldTY}`);

        this.tweens.add({
          targets: guard.sprite,
          x: targetX,
          duration: 3000,
          ease: 'Linear',
          onComplete: () => {
            const newTX = Math.round((guard.sprite.x - 32) / 64);
            this.collisionTiles.add(`${newTX},${oldTY}`);
          },
        });
      },
    });
  }

  private startInmateMovement() {
    const S = 64; // SCALED_TILE
    const half = 32; // center offset

    // Each entry: npcId, target tile X/Y, delay between moves, tween duration
    const patrols: { id: string; axis: 'x' | 'y'; endTile: number; delay: number; duration: number }[] = [
      // Mikey — paces back and forth in JP's cell row (y=7, x 2→4)
      { id: 'ch3_mikey', axis: 'x', endTile: 4, delay: 5000, duration: 2500 },
      // Chris — paces within cell 2 (x 9→11, row 3)
      { id: 'ch3_chris', axis: 'x', endTile: 11, delay: 7000, duration: 3500 },
      // Bird — paces within cell 4 (x 9→11, row 7)
      { id: 'ch3_bird', axis: 'x', endTile: 11, delay: 8000, duration: 4000 },
      // Smoker — paces in the yard corner (y=23, x 5→8)
      { id: 'ch3_smoker', axis: 'x', endTile: 8, delay: 9000, duration: 3000 },
      // Pullups guy — walks along the exercise zone (y=19, x 10→13)
      { id: 'ch3_pullups', axis: 'x', endTile: 13, delay: 10000, duration: 4500 },
    ];

    for (const patrol of patrols) {
      const npc = this.npcs.find(n => n.id === patrol.id);
      if (!npc) continue;

      let forward = true;
      const startVal = npc.sprite[patrol.axis];
      const endVal = patrol.endTile * S + half;

      const timer = this.time.addEvent({
        delay: patrol.delay,
        loop: true,
        callback: () => {
          if (!this.scene.isActive() || this.frozen) return;
          const npcRef = this.npcs.find(n => n.id === patrol.id);
          if (!npcRef) return;

          const targetVal = forward ? endVal : startVal;
          forward = !forward;

          // Remove old collision tile
          const oldTX = Math.round((npcRef.sprite.x - half) / S);
          const oldTY = Math.round((npcRef.sprite.y - half) / S);
          this.collisionTiles.delete(`${oldTX},${oldTY}`);

          this.tweens.add({
            targets: npcRef.sprite,
            [patrol.axis]: targetVal,
            duration: patrol.duration,
            ease: 'Linear',
            onComplete: () => {
              // Add new collision tile at destination
              const newTX = Math.round((npcRef.sprite.x - half) / S);
              const newTY = Math.round((npcRef.sprite.y - half) / S);
              this.collisionTiles.add(`${newTX},${newTY}`);
            },
          });
        },
      });

      this.inmatePatrolTimers.push(timer);
    }
  }

  private createShirtToggle() {
    const btn = this.add.text(GAME_WIDTH - 120, GAME_HEIGHT - 30, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#808090',
      backgroundColor: '#1a1a2a',
      padding: { x: 6, y: 3 },
    }).setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });

    const updateBtn = () => {
      if (this.currentDay >= 2) {
        btn.setText(this.shirtOff ? 'Shirt On' : 'Shirt Off');
        btn.setVisible(true);
      } else {
        btn.setVisible(false);
      }
    };
    updateBtn();

    btn.on('pointerdown', () => {
      if (this.currentDay < 2) return;
      this.shirtOff = !this.shirtOff;
      this.player.setTexture(this.getPlayerTexture());
      updateBtn();
    });

    // Store reference to update on day change
    (this as any)._shirtBtn = btn;
    (this as any)._updateShirtBtn = updateBtn;
  }

  // NPC dialogue reacts to minigame outcomes
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    // Phase III yard rep echoes the fight choice from Phase I
    if (npcId === 'ch3_og' && this.currentDay >= 3) {
      const fought = ChoiceLedger.get('jail_fight') === 'Fought';
      this.dialogue.show(fought ? [
        { speaker: 'OG', text: 'That first week you swung on somebody. Whole block saw it.' },
        { speaker: 'OG', text: 'Now you read books in the same yard. Nobody tests a man who did both.' },
        { speaker: 'JP\'s Mind', text: 'The fight bought the quiet. The books kept it.' },
      ] : [
        { speaker: 'OG', text: 'You never threw hands once in here. Some men clocked that as soft.' },
        { speaker: 'OG', text: 'Then they watched you not flinch at ANYTHING. That\'s the scarier kind.' },
        { speaker: 'JP\'s Mind', text: 'Never had to swing. Turns out stillness reads louder in here.' },
      ], () => { this.frozen = false; });
      return;
    }
    GameIntelligence.onNPCTalked(npcId);
    if (this.currentDay === 1 && npcId === 'ch3_smoker' && !this.phaseOneRelapseDone) {
      this.playPhaseOneRelapseChoice();
      return;
    }

    if (this.currentDay === 1 && npcId === 'ch3_bird') {
      this.dialogue.show(dialogue, () => {
        this.sawBirdCycle = true;
        this.maybePlayPhaseOneRealization();
      });
      return;
    }

    if (this.currentDay === 1 && npcId === 'ch3_book_inmate') {
      this.dialogue.show(dialogue, () => {
        this.sawDeniedAppeal = true;
        this.maybePlayPhaseOneRealization();
      });
      return;
    }
    // Friend levels have teeth in here: humiliate somebody in the yard and
    // stay cold with him, and he presses you. JP's rule — if you don't
    // f*** with someone in jail, eventually they want to fight.
    if ((npcId === 'ch3_fighter1' || npcId === 'ch3_fighter2') &&
        AffinitySystem.tier(npcId) === 'cold' && !this.frozen && this.currentDay >= 2) {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Inmate', text: 'You been walkin\' around like you run this yard.' },
        { speaker: 'Inmate', text: 'We got a problem, Lopez.' },
        { speaker: 'JP\'s Mind', text: 'Should\'ve kept him closer. Too late now.' },
      ], () => {
        this.frozen = false;
        this.playBattleScene();
      });
      return;
    }

    // Fighter reacts based on battle outcome
    if ((npcId === 'ch3_fighter1' || npcId === 'ch3_fighter2') && this.battleWon !== null && this.currentDay >= 2) {
      const chapterDialogue = this.getChapterDialogue();
      const key = this.battleWon ? 'ch3_battle_won' : 'ch3_battle_lost';
      const reactiveLines = chapterDialogue.npcs[key];
      if (reactiveLines) {
        this.dialogue.show(reactiveLines);
        return;
      }
    }

    // Pullups guy reacts to pushup domination
    if (npcId === 'ch3_pullups' && this.pushupDominated && this.currentDay >= 2) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch3_pushup_beast'];
      if (lines) {
        this.dialogue.show(lines);
        return;
      }
    }

    // Bird warns about dice
    // Bird's store: everybody with a hustle sells something. Bird runs his tight.
    if (npcId === 'ch3_bird' && this.currentDay >= 2 && !this.diceBroke) {
      const base = this.getChapterDialogue().npcs['ch3_bird'] ?? dialogue;
      this.dialogue.show(base, () => {
        this.showYesNoChoice('Bird\'s store is open. Books: ' + this.fmtBucks(), 'Pressed coffee $1', 'Extra soup $2', () => {
          if (this.commissaryBucks < 1) {
            this.dialogue.show([{ speaker: 'Bird', text: 'Credit? In HERE? Funny.' }], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 1;
          AffinitySystem.adjust('ch3_bird', 1);
          this.dialogue.show([
            { speaker: 'Bird', text: 'Pressed in a chip bag, brewed in a sock. Best coffee in the building.' },
            { speaker: 'JP\'s Mind', text: 'A dollar. Everybody in here has a hustle. Just like everywhere.' },
          ], () => { this.frozen = false; });
        }, () => {
          if (this.commissaryBucks < 2) {
            this.dialogue.show([{ speaker: 'Bird', text: 'Come back Wednesday, big dawg.' }], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 2;
          AffinitySystem.adjust('ch3_bird', 1);
          this.dialogue.show([
            { speaker: 'Bird', text: 'Store price. Markup is the whole business model, you know this.' },
            { speaker: 'JP\'s Mind', text: 'Buying marked-up soup off the homie. Same economy as the street. Smaller shelves.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    if (npcId === 'ch3_bird' && this.diceBroke) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch3_dice_broke'];
      if (lines) {
        this.dialogue.show(lines);
        this.diceBroke = false; // only warn once
        return;
      }
    }

    this.dialogue.show(dialogue);
  }

  private playPhaseOneRelapseChoice() {
    if (this.phaseOneRelapseDone) return;
    this.frozen = true;
    this.showYesNoChoice('The smoke reaches JP.', 'Take the hit', 'Walk away', () => {
      this.phaseOneRelapseDone = true;
      this.phaseOneRefusedLastHit = false;
      SubstanceSystem.hit(2);
      MoodSystem.setMood('faded', 35);
      this.dialogue.show([
        { speaker: 'Smoker', text: 'Knew you would.' },
        { speaker: 'Narrator', text: 'For a few minutes, the walls feel farther away.' },
        { speaker: 'JP\'s Mind', text: 'Same escape. Different walls.' },
      ], () => {
        this.frozen = false;
        this.refreshObjectiveHint();
        this.maybePlayPhaseOneRealization();
      });
    }, () => {
      this.phaseOneRelapseDone = true;
      this.phaseOneRefusedLastHit = true;
      this.dialogue.show([
        { speaker: 'Smoker', text: 'Now you saying no?' },
        { speaker: 'Narrator', text: 'It is not the first offer JP took in here.' },
        { speaker: 'Narrator', text: 'It is the first one he refuses.' },
      ], () => {
        this.frozen = false;
        this.refreshObjectiveHint();
        this.maybePlayPhaseOneRealization();
      });
    });
  }

  private maybePlayPhaseOneRealization() {
    if (this.phaseOneRealizationDone
      || !this.phaseOneRelapseDone
      || this.battleWon === null
      || !this.sawBirdCycle
      || !this.sawDeniedAppeal) return;

    this.phaseOneRealizationDone = true;
    this.frozen = true;
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Bird has been in three times.' },
      { speaker: 'Narrator', text: 'Across the room, another man is holding a denied appeal.' },
      { speaker: 'JP\'s Mind', text: this.phaseOneRefusedLastHit
        ? 'Saying no once does not erase what I was doing all week.'
        : 'The high took the edge off. Then it gave everything back worse.' },
      { speaker: 'JP\'s Mind', text: 'Same habits. Same anger. Same place again.' },
      { speaker: 'JP\'s Mind', text: 'I need to straighten up or I\'ll end up like the rest of them.' },
      { speaker: 'Narrator', text: 'That is the first decision in here that feels different.' },
    ], () => {
      MoodSystem.setMood('locked_in', 35);
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  /** Director-only state shortcut. The playable fight still owns the normal route. */
  public directorMarkFightComplete() {
    this.battleWon = true;
    this.refreshObjectiveHint();
    this.maybePlayPhaseOneRealization();
  }

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
    }).setOrigin(0.5).setScrollFactor(0).setDepth(321);
    const yesBg = this.add.rectangle(cx - 95, cy + 12, 150, 42, 0x6f5734)
      .setScrollFactor(0).setDepth(320).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(cx - 95, cy + 12, yesLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(321);
    const noBg = this.add.rectangle(cx + 95, cy + 12, 150, 42, 0x4b5362)
      .setScrollFactor(0).setDepth(320).setInteractive({ useHandCursor: true });
    const noText = this.add.text(cx + 95, cy + 12, noLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(321);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const cleanup = () => {
      promptText.destroy(); yesBg.destroy(); yesText.destroy(); noBg.destroy(); noText.destroy();
      spaceKey.off('down', chooseYes); nKey.off('down', chooseNo);
    };
    const chooseYes = () => { cleanup(); onYes(); };
    const chooseNo = () => { cleanup(); onNo(); };
    yesBg.on('pointerdown', chooseYes);
    noBg.on('pointerdown', chooseNo);
    spaceKey.on('down', chooseYes);
    nKey.on('down', chooseNo);
  }

  protected getObjectiveHint(): string {
    if (this.currentDay === 1) {
      if (!this.phaseOneRelapseDone) return 'Phase I — old habits followed you inside. Head to the yard.';
      if (this.battleWon === null) return 'Phase I — Juan El Loco is going off in the yard. Bird\'s in it.';
      if (!this.phaseOneRealizationDone) return 'Phase I — listen to Bird and the inmate waiting on an appeal.';
      return 'Phase I — return to your bunk.';
    }
    if (this.currentDay === 2) {
      return this.trainingComplete ? 'Phase II — return to your bunk.' : 'Phase II — train in the yard.';
    }
    if (this.currentDay === 3) {
      if (!this.bookRead) return 'Phase III — read The Compound Effect.';
      if (!this.faithDone) return 'Phase III — find the quiet corner of the yard.';
      return 'Phase III — return to your bunk.';
    }
    return 'Hit the bed. Time to go.';
  }

  getMapData(): MapData {
    return jailMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    if (this.currentDay === 3) return jailDay3Dialogue;
    if (this.currentDay === 2) return jailDay2Dialogue;
    return jailDay1Dialogue;
  }

  // Everything in here costs. The homies keep the books loaded; the block runs on it.
  // What's left when they book you. You spent it all on bitches, bottles,
  // and getting faded — so it's never much. Whatever survives follows you in.
  private commissaryBucks = Math.min(60, Math.max(8, Math.round(BalanceSystem.getBalance() * 0.05)));
  private visitationSeen = false;
  private picsSold = false;

  private fmtBucks(): string {
    return '$' + this.commissaryBucks.toFixed(2);
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // ── PHONE: 15 minutes for $3. The realest price in the building. ──
    if (interactable.id === 'ch3_phone') {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Phone bank. A dollar a call. The whole block\'s life runs through this receiver, one dollar at a time.' },
        { speaker: 'JP\'s Mind', text: 'A dollar to hear a voice from outside. Books: ' + this.fmtBucks() },
      ], () => {
        this.showYesNoChoice('Who you calling?', 'Call Pops -$1', 'Call K -$1', () => {
          if (this.commissaryBucks < 1) {
            this.dialogue.show([
              { speaker: 'JP\'s Mind', text: 'Not even three dollars on the books. Can\'t afford my own father\'s voice.' },
              { speaker: 'JP\'s Mind', text: 'Wednesday. Everything is about Wednesday.' },
            ], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 1;
          MoodSystem.changeMorale(10);
          AffinitySystem.adjust('ch0_pops', 1);
          this.dialogue.show([
            { speaker: 'Pops', text: 'Mijo.' },
            { speaker: 'JP', text: 'Hey Pops.' },
            { speaker: 'Pops', text: 'Your mom made tamales Sunday. I saved you some. They\'ll be freezer-burned by the time you\'re out but they\'re yours.' },
            { speaker: 'JP', text: '...save them anyway.' },
            { speaker: 'Narrator', text: 'The best dollar in the building.' },
          ], () => { this.frozen = false; });
        }, () => {
          if (this.commissaryBucks < 1) {
            this.dialogue.show([
              { speaker: 'JP\'s Mind', text: 'Not even a dollar on the books. Can\'t afford anybody\'s voice today.' },
            ], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 1;
          MoodSystem.changeMorale(10);
          this.dialogue.show([
            { speaker: 'K', text: 'BABE. Okay so first of all your dog misses you. Second of all I miss you MORE—' },
            { speaker: 'Narrator', text: 'She talks for the entire call without breathing. JP just holds the receiver and smiles.' },
            { speaker: 'K', text: 'Visitation Saturday. I\'m wearing the thing. You know the thing.' },
            { speaker: 'JP\'s Mind', text: 'I called her every single day. A dollar a day. Cheapest therapy in California.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    // ── MAIL CALL: photos from outside. And a business opportunity. ──
    if (interactable.id === 'ch3_letter_home' && this.currentDay >= 2 && !this.picsSold) {
      this.picsSold = true;
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Mail call. Printed photos — the homies send the outside in: the beach, the cars, somebody\'s backyard party.' },
        { speaker: 'Narrator', text: 'Group pics from the function. And a full page of printed memes — somebody PRINTED memes. On paper. With ink.' },
        { speaker: 'Narrator', text: 'The meme page circulates the block like contraband. Grown men crying at a printout.' },
        { speaker: 'Narrator', text: 'And a few girls sent... personal portfolio pieces. Bikini series. Professional angles.' },
        { speaker: 'Inmate', text: 'Lopez. LOPEZ. Who IS that? I got four dollars RIGHT NOW.' },
        { speaker: 'JP\'s Mind', text: 'Everybody in here has a hustle. Mine just found me.' },
      ], () => {
        this.showYesNoChoice('Prints are currency.', 'Sell two prints +$8', 'Keep the collection', () => {
          this.commissaryBucks += 8;
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Two prints move in under a minute. Four dollars each. The market is STARVED.' },
            { speaker: 'Inmate', text: 'She got a sister?' },
            { speaker: 'JP', text: 'Four more dollars and I\'ll ask.' },
            { speaker: 'JP\'s Mind', text: 'Photo distribution. In here. The hustle finds you anywhere on earth.' },
          ], () => { this.frozen = false; });
        }, () => {
          this.dialogue.show([
            { speaker: 'JP\'s Mind', text: 'Nah. Some things aren\'t inventory.' },
            { speaker: 'JP\'s Mind', text: 'Most things are inventory. These aren\'t.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    // ── VISITATION: the glass, the phones, and K being K ──
    if (interactable.id === 'ch3_window' && this.currentDay >= 2 && !this.visitationSeen) {
      this.visitationSeen = true;
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Saturday. Visitation. Thick glass, two phones, thirty minutes.' },
        { speaker: 'K', text: 'You look STRONG. Jail arms. I\'m mad about it.' },
        { speaker: 'Narrator', text: 'She checks the guard. Checks the camera. Leans close to the glass and—' },
        { speaker: 'Narrator', text: 'Some parts of visitation stay at visitation.' },
        { speaker: 'JP\'s Mind', text: 'That woman is completely insane.' },
        { speaker: 'JP\'s Mind', text: 'Thirty minutes never went so fast in my life.' },
      ], () => { MoodSystem.changeMorale(15); this.frozen = false; });
      return;
    }

    // ── TABLET KIOSK: nothing is free in here, not even a bad movie ──
    if (interactable.id === 'ch3_tablet') {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Tablet kiosk. $1.50 an hour regular. $3.00 premium — better movies, better shows, better games.' },
        { speaker: 'JP\'s Mind', text: 'Nothing is free in here. NOTHING. Books: ' + this.fmtBucks() },
      ], () => {
        this.showYesNoChoice('Buy tablet time?', 'Regular $1.50', 'Premium $3.00', () => {
          if (this.commissaryBucks < 1.5) {
            this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Books are light. Story of half this block.' }], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 1.5;
          this.dialogue.show([
            { speaker: 'Narrator', text: 'One hour. Grainy movies, two games, a music app that skips.' },
            { speaker: 'JP\'s Mind', text: 'Best dollar-fifty I spend all week. That\'s what in here does to a dollar-fifty.' },
          ], () => { this.frozen = false; });
        }, () => {
          if (this.commissaryBucks < 3) {
            this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Premium is for Wednesday-money. Books: ' + this.fmtBucks() }], () => { this.frozen = false; });
            return;
          }
          this.commissaryBucks -= 3;
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Premium hour. Real movies. Newer shows. Games that load.' },
            { speaker: 'JP\'s Mind', text: 'Three dollars an hour and I feel like a Rockefeller. Perspective is a hell of a drug.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    GameIntelligence.onInteracted(interactable.id);

    if (interactable.id === 'ch3_cell_door') {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The lock buzzed before count cleared.' },
        { speaker: 'Guard', text: 'Common area. Keep moving.' },
      ]);
      return;
    }

    if (interactable.id === 'ch3_yard_gate') {
      this.openGate('17,17', 17, 18, [
        { speaker: 'Narrator', text: 'The yard gate rattles open.' },
      ]);
      return;
    }

    if (interactable.id === 'ch3_chapel_gate') {
      this.openGate('15,26', 15, 27, [
        { speaker: 'Narrator', text: 'A quieter room waits beyond the fence.' },
      ]);
      return;
    }
    if (interactable.id === 'ch3_bed') {
      this.handleBedInteraction();
      return;
    }

    // Pushup minigame — available Day 2+
    if (interactable.id === 'ch3_pushups' && this.currentDay >= 2) {
      this.playPushupMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dice minigame — available Day 2
    if (interactable.id === 'ch3_dice_watch' && this.currentDay >= 2) {
      this.playDiceMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Battle — available Day 1
    if (interactable.id === 'ch3_fight_watch' && this.currentDay === 1) {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Juan El Loco is off again. Face tatted, eyes somewhere else, running his mouth at the whole tank.' },
        { speaker: 'JP\'s Mind', text: 'That\'s my barber. Cuts the cleanest fade in here. Loses his mind by dinner.' },
        { speaker: 'Narrator', text: 'He swings on Bird. Bird stumbles. For half a second the tank just watches.' },
        { speaker: 'JP\'s Mind', text: 'Old habits don\'t knock. They move your feet before you decide.' },
        { speaker: 'Narrator', text: 'JP is already moving. So is half the tank.' },
      ], () => {
        this.interactions.consume(interactable.id);
        this.playBattleScene();
      });
      return;
    }

    // Optional documentary beat: jail violence had become ordinary enough
    // that chow kept moving. It is witnessed, not turned into another game.
    if (interactable.id === 'ch3_pbj_witness') {
      this.interactions.consume(interactable.id);
      this.playPBJWitness();
      return;
    }

    if (interactable.id === 'ch3_commissary') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      // JP ran the ramen economy: homies outside kept the books loaded.
      // Everybody knew it — and everybody had an offer.
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Wednesday. Store day. The whole week bends around Wednesday.' },
        { speaker: 'Narrator', text: 'The homies outside keep the books loaded. Money hit Monday. Everybody knows whose hit.' },
        { speaker: 'Narrator', text: 'JP walks off with a full bag: ramen, Hot Cheetos, the works.' },
        { speaker: 'Inmate', text: 'Lopez. Two soups for a strip of suboxone. Fair trade.' },
        { speaker: 'JP', text: 'I\'m good bro.' },
        { speaker: 'Inmate', text: 'K2 then. Everybody smokin\' it—' },
        { speaker: 'JP', text: 'Bro. I\'m on a kosher diet. You think I\'m smokin\' K2?' },
        { speaker: 'Inmate', text: '...you got any more Hot Cheetos though?' },
      ], () => {
        this.showYesNoChoice('Share the bag?', 'Share it', 'Keep it', () => {
          ChoiceLedger.record('commissary_share', 'Shared it');
          AffinitySystem.adjust('ch3_mikey', 1);
          AffinitySystem.adjust('ch3_chris', 1);
          AffinitySystem.adjust('ch3_bird', 1);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Soups for Mikey. Cheetos for Chris. Bird gets first pick.' },
            { speaker: 'Bird', text: 'This why nobody got a problem with you, Lopez.' },
            { speaker: 'JP\'s Mind', text: 'Feed people. It comes back. Same rule as outside.' },
          ], () => {
            InventorySystem.addItem('ramen', 1);
            InventorySystem.addItem('stamps', 1);
            SoundEffects.playPickup();
            this.frozen = false;
          });
        }, () => {
          ChoiceLedger.record('commissary_share', 'Kept it');
          this.dialogue.show([
            { speaker: 'Narrator', text: 'The bag stays under the bunk. The block notices everything.' },
            { speaker: 'JP\'s Mind', text: 'Mine. For now.' },
          ], () => {
            InventorySystem.addItem('ramen', 2);
            InventorySystem.addItem('stamps', 1);
            InventorySystem.addItem('soap', 1);
            SoundEffects.playPickup();
            this.frozen = false;
          });
        });
      });
      return;
    }

    if (interactable.id === 'ch3_letter_home') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP sits on his bunk with a pen and paper.' },
        { speaker: 'Narrator', text: 'He writes: "I\'m okay. Tell Mom I\'m sorry."' },
        { speaker: 'Narrator', text: '"I\'m going to be different when I get out."' },
        { speaker: 'JP\'s Mind', text: 'He holds the page before sealing it.' },
      ], () => {
        InventorySystem.addItem('letter', 1);
        MoodSystem.changeMorale(10);
        SoundEffects.playConfirm();
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch3_faith') {
      if (this.currentDay < 3) {
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: this.currentDay === 1
            ? 'My head is still too loud to sit here.'
            : 'The routine is helping. I am not ready to call that faith yet.' },
        ]);
        return;
      }
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      // Dim the scene
      const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
        .setScrollFactor(0).setDepth(300);
      this.tweens.add({ targets: dim, alpha: 0.5, duration: 1000 });
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP sits in the corner of the yard. Alone.' },
        { speaker: 'Narrator', text: 'He closes his eyes.' },
        { speaker: 'JP\'s Mind', text: 'I can\'t come back here.' },
        { speaker: 'JP\'s Mind', text: 'Not like them. Not again.' },
        { speaker: 'Narrator', text: 'The yard is quiet. For once, so is his mind.' },
      ], () => {
        this.faithDone = true;
        MoodSystem.setMood('locked_in', 90);
        MoodSystem.changeMorale(20);
        SoundEffects.achievementUnlock();
        this.tweens.add({ targets: dim, alpha: 0, duration: 800, onComplete: () => {
          dim.destroy();
          this.frozen = false;
          this.refreshObjectiveHint();
        } });
      });
      return;
    }

    if (interactable.id === 'ch3_book') {
      if (this.currentDay < 3) {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'The Compound Effect sits on the bunk.' },
          { speaker: 'JP\'s Mind', text: this.currentDay === 1
            ? 'I look at the cover and put it back.'
            : 'Soon. Right now I am building the routine first.' },
        ]);
        return;
      }
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      SoundEffects.playPageTurn();
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Package slip: AMAZON. Books can\'t come from people — only from Amazon direct. Soaked pages made them ban regular mail.' },
      { speaker: 'JP\'s Mind', text: 'The homies figured out the loophole week one. They kept the reading list stocked the whole bid.' },
      { speaker: 'Narrator', text: 'The Compound Effect. JP\'s been reading it for two weeks.' },
        { speaker: 'Narrator', text: '"Small choices + consistency + time = massive results."' },
        { speaker: 'JP\'s Mind', text: 'If that\'s true... then everything I did before was compounding too.' },
        { speaker: 'JP\'s Mind', text: 'Bad choices. Consistently. Over time.' },
        { speaker: 'JP\'s Mind', text: 'No wonder I ended up here.' },
        { speaker: 'JP\'s Mind', text: '"One run. Make it back. Then I\'m done."' },
        { speaker: 'JP\'s Mind', text: 'I kept moving the finish line.' },
        { speaker: 'Narrator', text: 'He keeps reading.' },
      ], () => {
        this.bookRead = true;
        InventorySystem.addItem('compound-effect', 1);
        MoodSystem.changeMorale(10);
        this.frozen = false;
        this.refreshObjectiveHint();
      });
      return;
    }

    super.handleInteractable(interactable);
  }

  private openGate(tile: string, targetX: number, targetY: number, lines: DialogueLine[]) {
    this.collisionTiles.delete(tile);
    SoundEffects.playMetalGate();
    const gateVisual = this.jailGateVisuals.get(tile);
    if (gateVisual) {
      this.tweens.add({
        targets: gateVisual,
        x: gateVisual.x - SCALED_TILE * 0.82,
        alpha: 0.18,
        duration: 420,
        ease: 'Quad.easeInOut',
      });
    }
    this.frozen = true;
    this.dialogue.show(lines, () => {
      this.player.setPosition(
        targetX * SCALED_TILE + SCALED_TILE / 2,
        targetY * SCALED_TILE + SCALED_TILE / 2,
      );
      this.frozen = false;
    });
  }

  private handleBedInteraction() {
    // Get bed dialogue for current day
    const chapterDialogue = this.getChapterDialogue();
    const bedLines = chapterDialogue.npcs['ch3_bed'];

    if (this.currentDay === 1) {
      if (!this.phaseOneRelapseDone || this.battleWon === null || !this.phaseOneRealizationDone) {
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: 'I cannot sleep yet.' },
          { speaker: 'JP\'s Mind', text: !this.phaseOneRelapseDone
            ? 'I am still moving like I did outside.'
            : this.battleWon === null
              ? 'Too much anger still looking for somewhere to go.'
              : 'Bird and the guy waiting on his appeal keep replaying in my head.' },
          { speaker: 'Narrator', text: 'Go east to the common area.' },
        ]);
        return;
      }
      // Show Day 1 bed dialogue, then transition to Day 2
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('3 months later...', () => {
            this.currentDay = 2;
            this.player.setTexture(this.getPlayerTexture());
            // Scale up slightly — Day 2 JP is filling out
            this.player.setScale(2.03);
            this.refreshDayDialogue();
            this.interactions.resetAll();
            if ((this as any)._updateShirtBtn) (this as any)._updateShirtBtn();
          });
        });
      }
    } else if (this.currentDay === 2) {
      if (!this.trainingComplete) {
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: 'Not yet.' },
          { speaker: 'JP\'s Mind', text: 'The routine has to become real first.' },
          { speaker: 'Narrator', text: 'Train in the yard.' },
        ]);
        return;
      }
      // Show Day 2 bed dialogue, then transition to Day 3
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('6 months later...', () => {
            this.currentDay = 3;
            MusicSystem.transitionTo('jail-reflection', 900);
            this.player.setTexture(this.getPlayerTexture());
            // Scale up more — Day 3 JP is built
            this.player.setScale(2.06);
            this.refreshDayDialogue();
            this.interactions.resetAll();
            if ((this as any)._updateShirtBtn) (this as any)._updateShirtBtn();
          });
        });
      }
    } else {
      if (!this.bookRead || !this.faithDone) {
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: 'My body changed first. That is not enough.' },
          { speaker: 'Narrator', text: this.bookRead ? 'Find the quiet corner in the yard.' : 'Read the book in JP\'s cell.' },
        ]);
        return;
      }
      // Day 3 — show final bed dialogue, then play montage and release
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playFinalMontage();
        });
      }
    }
  }

  /**
   * After changing day, update all NPC dialogue references to match the new day.
   */
  private refreshDayDialogue() {
    const chapterDialogue = this.getChapterDialogue();
    for (const npc of this.npcs) {
      npc.dialogue = chapterDialogue.npcs[npc.id] || [{ text: '...' }];
    }
  }

  /**
   * Calendar-style day transition with strikethrough and color progression.
   * Day 1→2: white text, "3 MONTHS LATER..."
   * Day 2→3: yellow text, "6 MONTHS LATER..."
   * Each day's title card feels heavier.
   */
  private playDayTransition(text: string, callback: () => void) {
    this.frozen = true;
    this.commissaryBucks += 20; // the homies never miss a week
    SoundEffects.playCinematicSwoosh();

    // Determine which day we're transitioning FROM
    const fromDay = this.currentDay;
    // Color progression: Day 1 = white, Day 2 = yellow, Day 3 = gold
    const dayColors = ['#ffffff', '#f0c040', '#ffd700'];
    const dayColor = dayColors[fromDay - 1] || '#ffffff';
    const nextDayColor = dayColors[fromDay] || '#f0c040';
    const phaseLabels = ['PHASE I — SURVIVAL', 'PHASE II — DISCIPLINE', 'PHASE III — DIRECTION'];
    const dayLabel = phaseLabels[fromDay - 1] || `PHASE ${fromDay}`;
    const nextDayLabel = phaseLabels[fromDay] || `PHASE ${fromDay + 1}`;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    // Fade to black
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Show old day label — then strike it out
        const oldDayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, dayLabel, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: dayColor,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

        // Slow fade in old day
        this.tweens.add({
          targets: oldDayText,
          alpha: 1,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold, then strikethrough line slides across
            this.time.delayedCall(800, () => {
              const strikeWidth = oldDayText.width + 20;
              const strikeX = GAME_WIDTH / 2 - strikeWidth / 2;
              const strikeY = GAME_HEIGHT / 2 - 40;
              const strikeLine = this.add.rectangle(strikeX, strikeY, 0, 4, 0xff4444)
                .setOrigin(0, 0.5).setScrollFactor(0).setDepth(202);

              // Animate strikethrough growing across the text
              this.tweens.add({
                targets: strikeLine,
                displayWidth: strikeWidth,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => {
                  // Dim the old day text
                  this.tweens.add({
                    targets: oldDayText,
                    alpha: 0.3,
                    duration: 300,
                  });

                  // Show the time skip text below
                  const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, text, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '14px',
                    color: '#aaaacc',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

                  this.tweens.add({
                    targets: timeText,
                    alpha: 1,
                    duration: 600,
                    ease: 'Quad.easeOut',
                  });

                  // Hold, then show new day
                  this.time.delayedCall(1500, () => {
                    // Fade out old elements
                    this.tweens.add({
                      targets: [oldDayText, strikeLine, timeText],
                      alpha: 0,
                      duration: 500,
                      onComplete: () => {
                        oldDayText.destroy();
                        strikeLine.destroy();
                        timeText.destroy();

                        // New day appears — heavier, larger
                        const newDayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, nextDayLabel, {
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '36px',
                          color: nextDayColor,
                        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0).setScale(0.6);

                        // Slow dramatic fade in + scale up
                        this.tweens.add({
                          targets: newDayText,
                          alpha: 1,
                          scale: 1,
                          duration: 1000,
                          ease: 'Quad.easeOut',
                          onComplete: () => {
                            // Hold 2 seconds
                            this.time.delayedCall(2000, () => {
                              // Slow fade out
                              this.tweens.add({
                                targets: newDayText,
                                alpha: 0,
                                duration: 800,
                                ease: 'Quad.easeIn',
                                onComplete: () => {
                                  newDayText.destroy();

                                  // Run callback (changes day, resets interactions)
                                  callback();

                                  // Fade back to gameplay
                                  this.tweens.add({
                                    targets: bg,
                                    alpha: 0,
                                    duration: 800,
                                    ease: 'Quad.easeOut',
                                    onComplete: () => {
                                      bg.destroy();
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
                },
              });
            });
          },
        });
      },
    });
  }

  /**
   * Day 3 final montage: time skip beats then transition to ReleaseScene.
   */
  private playFinalMontage() {
    this.frozen = true;

    const steps = [
      { day: 'MONTH 9', desc: 'Training before breakfast.\nBooks after count.\nFaith when the noise dies down.', hold: 1700 },
      { day: 'MONTH 12', desc: "The doors open.\nThe same fire leaves with him.\nNow it has a direction.", hold: 2600 },
    ];

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.playTimeSkipStep(steps, 0, bg);
      },
    });
  }

  // Three-set yard strategy: read the rival, manage your reputation.
  // No meters. Each set he telegraphs his condition; you pick your move.
  private playPushupMinigame() {
    // Director, pointer and interaction inputs can arrive in the same frame.
    // Never let two contests stack; otherwise a completed set reveals a fresh
    // duplicate underneath and makes the player's choice look ignored.
    if (this.pushupGameActive) return;
    this.pushupGameActive = true;
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let jpCount = 0;
    let rivalCount = 0;
    let energy = 100;
    let setIndex = 0;

    const SETS = [
      { rival: 12, tell: 'Set 1. He\'s fresh. Fast pace, clean reps.', pushBonus: 4 },
      { rival: 9, tell: 'Set 2. He\'s breathing through his mouth now.', pushBonus: 6 },
      { rival: 6, tell: 'Set 3. His arms are shaking. Pride\'s doing his reps.', pushBonus: 9 },
    ];
    const MATCH_COST = 25;
    const PUSH_COST = 35;

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    const title = this.add.text(GAME_WIDTH / 2, 70, 'PUSHUP CONTEST', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '22px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    const tellText = this.add.text(GAME_WIDTH / 2, 115, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#aaaacc',
      wordWrap: { width: 640 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(tellText);

    // The two of them, down in the dirt
    const jpSprite = this.add.sprite(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 60, this.getPlayerTexture(), 0)
      .setScale(7, 3).setScrollFactor(0).setDepth(301);
    objects.push(jpSprite);
    const rivalSprite = this.add.sprite(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 + 60, 'npc_inmate3', 0)
      .setScale(7, 3).setScrollFactor(0).setDepth(301);
    objects.push(rivalSprite);

    const jpCounter = this.add.text(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(jpCounter);
    const rivalCounter = this.add.text(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(rivalCounter);

    objects.push(this.add.text(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 80, 'JP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302));
    objects.push(this.add.text(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 - 80, 'INMATE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302));

    const crowdText = this.add.text(GAME_WIDTH / 2, 155, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
    objects.push(crowdText);

    const crowdSay = (msg: string) => {
      crowdText.setText(msg);
      crowdText.setAlpha(1);
      this.tweens.add({ targets: crowdText, alpha: 0, duration: 1200, delay: 700 });
    };

    const buttonObjs: Phaser.GameObjects.GameObject[] = [];
    const keyCleanups: Array<() => void> = [];
    const clearButtons = () => {
      for (const cleanup of keyCleanups) cleanup();
      keyCleanups.length = 0;
      for (const b of buttonObjs) b.destroy();
      buttonObjs.length = 0;
    };

    // Resolve a set as one deliberate decision. Per-rep timer events could
    // overlap Director/pointer inputs and leave a duplicate-looking Set 1 on
    // screen; the read and consequence matter more than watching 12 ticks.
    const animateSet = (jpAdd: number, rivalAdd: number, onDone: () => void) => {
      jpCount += jpAdd;
      rivalCount += rivalAdd;
      jpCounter.setText(String(jpCount));
      rivalCounter.setText(String(rivalCount));
      this.tweens.add({ targets: jpSprite, scaleY: 2.2, duration: 110, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: rivalSprite, scaleY: 2.2, duration: 110, yoyo: true, repeat: 2 });
      this.time.delayedCall(850, onDone);
    };

    const offerChoices = () => {
      const set = SETS[setIndex];
      tellText.setText(set.tell + (energy < 40 ? '  (JP\'s own arms aren\'t sure.)' : ''));

      const defs: Array<{ label: string; color: number; pick: () => void }> = [
        {
          label: 'MATCH HIS PACE',
          color: 0x2a6a8a,
          pick: () => {
            const gassed = energy < MATCH_COST;
            energy = Math.max(0, energy - MATCH_COST);
            const reps = gassed ? Math.max(1, set.rival - 5) : set.rival;
            if (gassed) crowdSay('"HE\'S SLOWING DOWN."');
            animateSet(reps, set.rival, nextSet);
          },
        },
        {
          label: 'PUSH AHEAD',
          color: 0xa03030,
          pick: () => {
            const gassed = energy < PUSH_COST;
            energy = Math.max(0, energy - PUSH_COST);
            // Pushing raises the temperature either way — the yard keeps score
            AffinitySystem.adjust('ch3_fighter1', -1);
            const reps = gassed ? Math.max(1, set.rival - 3) : set.rival + set.pushBonus;
            crowdSay(gassed ? '"HE\'S WRITING CHECKS HIS ARMS CAN\'T CASH."' : '"OHHH HE\'S GOING!"');
            animateSet(reps, set.rival, nextSet);
          },
        },
        {
          label: 'STOP CLEAN',
          color: 0x4a5058,
          pick: () => {
            energy = Math.min(100, energy + 15);
            crowdSay('"SMART. LIVE TO LIFT TOMORROW."');
            animateSet(Math.max(2, set.rival - 7), set.rival, nextSet);
          },
        },
      ];

      const choose = (def: typeof defs[number]) => {
        clearButtons();
        def.pick();
      };

      const choiceKeys = [
        Phaser.Input.Keyboard.KeyCodes.ONE,
        Phaser.Input.Keyboard.KeyCodes.TWO,
        Phaser.Input.Keyboard.KeyCodes.THREE,
      ];

      defs.forEach((def, i) => {
        const bx = GAME_WIDTH / 2 + (i - 1) * 250;
        const by = GAME_HEIGHT / 2 + 180;
        const bg = this.add.rectangle(bx, by, 230, 52, def.color)
          .setScrollFactor(0).setDepth(303).setInteractive({ useHandCursor: true });
        const label = this.add.text(bx, by, `[${i + 1}] ${def.label}`, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
        bg.on('pointerover', () => bg.setAlpha(0.85));
        bg.on('pointerout', () => bg.setAlpha(1));
        bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event?.stopPropagation();
          choose(def);
        });
        buttonObjs.push(bg, label);
        objects.push(bg, label);

        const key = this.input.keyboard!.addKey(choiceKeys[i]);
        const onKey = () => choose(def);
        key.on('down', onKey);
        keyCleanups.push(() => key.off('down', onKey));
      });
    };

    const nextSet = () => {
      setIndex++;
      if (setIndex >= SETS.length) { finish(); return; }
      offerChoices();
    };

    const finish = () => {
      tellText.setText('');
      title.setText('DONE.');

      let message = '';
      const diff = jpCount - rivalCount;
      if (diff > 10) {
        message = 'He wins. The yard remembers. It does not make him safe.';
        jpCounter.setColor('#f0c040');
      } else if (diff > 0) {
        message = 'JP wins. Respect buys room. Not peace.';
        jpCounter.setColor('#40c040');
      } else if (diff === 0) {
        message = 'Dead even. Mutual respect.';
        jpCounter.setColor('#aaaacc');
        rivalCounter.setColor('#aaaacc');
      } else {
        message = 'Inmate wins. JP nods. Next time.';
        rivalCounter.setColor('#ff6666');
      }

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, message, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#aaaacc',
        wordWrap: { width: 600 }, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(result);

      const scoreResult = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, `JP: ${jpCount}  |  INMATE: ${rivalCount}`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(scoreResult);

      // Track pushup outcome for reactive NPC dialogue
      if (diff > 10) {
        this.pushupDominated = true;
        // Public domination breeds a grudge — the yard keeps score
        AffinitySystem.adjust('ch3_fighter1', -3);
      }
      if (diff <= 0) MoodSystem.changeMorale(-10); // losing in the yard costs pride
      this.trainingComplete = true;

      if (diff > 0) {
        SoundEffects.crowdReact();
        MoodSystem.setMood('locked_in', 45);
      } else if (diff < 0) {
        SoundEffects.fumble();
      }

      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.pushupGameActive = false;
        this.frozen = false;
        this.refreshObjectiveHint();
      });
    };

    offerChoices();
  }

  private playPBJWitness() {
    this.frozen = true;

    const shade = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x06080a,
      0.72,
    ).setScrollFactor(0).setDepth(280).setAlpha(0);
    const left = this.add.sprite(GAME_WIDTH / 2 - 85, GAME_HEIGHT / 2 - 10, 'npc_inmate2', 0)
      .setScale(6).setTint(0x111111).setScrollFactor(0).setDepth(281).setAlpha(0);
    const right = this.add.sprite(GAME_WIDTH / 2 + 85, GAME_HEIGHT / 2 - 10, 'npc_inmate4', 0)
      .setScale(6).setTint(0x111111).setScrollFactor(0).setDepth(281).setAlpha(0);

    this.tweens.add({ targets: [shade, left, right], alpha: 1, duration: 300 });
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Two inmates had been playing around. One wanted it to stop. The other took it personal.' },
      { speaker: 'Narrator', text: 'A chair scrapes. Somebody slams into the wall.' },
    ], () => {
      SoundEffects.playImpact();
      this.cameras.main.shake(180, 0.006);
      this.tweens.add({
        targets: left,
        x: GAME_WIDTH / 2 + 35,
        duration: 160,
        yoyo: true,
        repeat: 1,
      });
      this.time.delayedCall(420, () => {
        SoundEffects.playImpact();
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Then shoes against concrete. A head hits the wall. The whole thing is over almost as fast as it started.' },
          { speaker: 'Guard', text: 'KEEP THE CHOW LINE MOVING.' },
          { speaker: 'Narrator', text: 'JP walks to the table, unwraps his PB&J, and eats.' },
          { speaker: 'JP\'s Mind', text: 'Not mine.' },
        ], () => {
          this.tweens.add({
            targets: [shade, left, right],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              shade.destroy();
              left.destroy();
              right.destroy();
              this.frozen = false;
            },
          });
        });
      });
    });
  }


  private playDiceMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let roundNum = 0;
    let points = 10;
    const maxRounds = 5;
    let currentBet = 1;
    const betOptions = [1, 3, 5];
    let betIndex = 0;

    const winComments = ['Lucky.', 'JP collects.', 'The yard nods.'];
    const loseComments = ['Cold dice.', 'The yard laughs.', 'JP pays up.'];

    // Inmate speech bubbles — random shouts during rolls
    const inmateShouts = [
      'COME ON BABY', 'SEVEN SEVEN SEVEN', "HE'S HEATED",
      'LET IT RIDE', 'BLOW ON EM', 'THAT BOY NICE',
      'NAH NAH NAH', 'OOOH SHIT', 'PAY THE MAN',
      'CMON YOUNGSTER', "DON'T CHOKE", 'BIG MONEY',
    ];
    const shoutPositions = [
      { x: 80, y: 60 }, { x: GAME_WIDTH - 80, y: 60 },
      { x: 100, y: GAME_HEIGHT - 40 }, { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 40 },
      { x: 60, y: GAME_HEIGHT / 2 - 60 }, { x: GAME_WIDTH - 60, y: GAME_HEIGHT / 2 + 60 },
    ];
    const showInmateShout = () => {
      const msg = inmateShouts[Phaser.Math.Between(0, inmateShouts.length - 1)];
      const pos = shoutPositions[Phaser.Math.Between(0, shoutPositions.length - 1)];
      const shout = this.add.text(pos.x, pos.y, msg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ccccaa',
        backgroundColor: '#222222',
        padding: { x: 6, y: 4 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305).setAlpha(0);
      objects.push(shout);
      this.tweens.add({
        targets: shout,
        alpha: 1,
        y: pos.y - 15,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: shout,
            alpha: 0,
            y: pos.y - 35,
            duration: 800,
            delay: 600,
            ease: 'Quad.easeIn',
            onComplete: () => shout.destroy(),
          });
        },
      });
    };

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'YARD DICE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Round + points info
    const roundText = this.add.text(GAME_WIDTH / 2, 130, 'Round 1/5  |  Commissary: 10', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(roundText);

    // Two dice (white squares)
    const diceSize = 60;
    const die1Bg = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    const die2Bg = this.add.rectangle(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    objects.push(die1Bg, die2Bg);

    // Dice value text
    const die1Text = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const die2Text = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(die1Text, die2Text);

    // Bet selection display
    const betLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'BET:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(betLabel);

    const betButtons: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i++) {
      const bx = GAME_WIDTH / 2 + (i - 1) * 100;
      const btn = this.add.text(bx, GAME_HEIGHT / 2 + 115, String(betOptions[i]), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: i === 0 ? '#f0c040' : '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      objects.push(btn);
      betButtons.push(btn);
    }

    // Arrows around selected bet
    const leftArrow = this.add.text(GAME_WIDTH / 2 - 100 - 30, GAME_HEIGHT / 2 + 115, '<', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const rightArrow = this.add.text(GAME_WIDTH / 2 - 100 + 30, GAME_HEIGHT / 2 + 115, '>', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(leftArrow, rightArrow);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, 'LEFT/RIGHT to bet, SPACE to roll', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Result / flavor text
    const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(resultText);

    // Side commentary
    const commentText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 235, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(commentText);

    let rolling = false;
    let phase: 'betting' | 'rolling' | 'done' = 'betting';

    const updateBetDisplay = () => {
      currentBet = betOptions[betIndex];
      for (let i = 0; i < 3; i++) {
        const isSelected = i === betIndex;
        betButtons[i].setColor(isSelected ? '#f0c040' : '#666666');
        betButtons[i].setScale(isSelected ? 1.2 : 1);
        // Grey out bets player can't afford
        if (betOptions[i] > points) {
          betButtons[i].setColor('#333333');
        }
      }
      // Position arrows around selected bet
      const selectedX = GAME_WIDTH / 2 + (betIndex - 1) * 100;
      leftArrow.setPosition(selectedX - 30, GAME_HEIGHT / 2 + 115);
      rightArrow.setPosition(selectedX + 30, GAME_HEIGHT / 2 + 115);
    };

    const endGame = (reason?: string) => {
      phase = 'done';
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);
      instr.setText('');

      let finalMsg: string;
      if (points >= 20) {
        finalMsg = 'JP walks away up. Smart player.';
      } else if (points >= 10) {
        finalMsg = 'Broke even. Could be worse.';
      } else if (points >= 1) {
        finalMsg = "Down bad. But it's just soup.";
      } else {
        finalMsg = 'JP walks away empty.';
        this.diceBroke = true; // Track for Bird's warning
      }

      if (reason) {
        resultText.setText(reason);
        resultText.setColor('#ff4444');
      }

      const finalMsgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 270,
        `Final: ${points} pts  |  ${finalMsg}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(finalMsgText);

      // Clean up after 3 seconds
      this.time.delayedCall(3000, () => {
        spaceKey.off('down', inputListener);
        leftKey.off('down', inputListener);
        rightKey.off('down', inputListener);
        this.input.off('pointerdown', inputListener);
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    const rollDice = () => {
      if (phase !== 'betting' || rolling) return;
      // Can't bet more than you have
      if (currentBet > points) return;

      rolling = true;
      phase = 'rolling';
      resultText.setText('');
      commentText.setText('');
      instr.setText('Rolling...');
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);

      // Inmate shouts during the roll
      showInmateShout();
      SoundEffects.diceRoll();
      this.time.delayedCall(500, () => showInmateShout());

      // Dice tumble animation — full rotation spin
      this.tweens.add({
        targets: [die1Bg, die1Text],
        angle: 360,
        duration: 150,
        repeat: 6,
        ease: 'Linear',
        onComplete: () => {
          die1Bg.setAngle(0);
          die1Text.setAngle(0);
        },
      });
      this.tweens.add({
        targets: [die2Bg, die2Text],
        angle: -360,
        duration: 150,
        repeat: 6,
        ease: 'Linear',
        onComplete: () => {
          die2Bg.setAngle(0);
          die2Text.setAngle(0);
        },
      });

      // Rapid random number cycling during tumble
      this.time.addEvent({
        delay: 60,
        repeat: 15,
        callback: () => {
          die1Text.setText(String(Phaser.Math.Between(1, 6)));
          die2Text.setText(String(Phaser.Math.Between(1, 6)));
        },
      });

      // Land on final values
      this.time.delayedCall(1100, () => {
        rolling = false;
        const val1 = Phaser.Math.Between(1, 6);
        const val2 = Phaser.Math.Between(1, 6);
        const total = val1 + val2;

        die1Text.setText(String(val1));
        die2Text.setText(String(val2));
        die1Bg.setAngle(0);
        die2Bg.setAngle(0);

        // Bounce tween on dice
        this.tweens.add({
          targets: [die1Bg, die1Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
        this.tweens.add({
          targets: [die2Bg, die2Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          delay: 50,
        });

        roundNum++;

        // Crowd reacts to result
        showInmateShout();

        if (total >= 7) {
          points += currentBet;
          SoundEffects.success();
          resultText.setText(`${total}! Win +${currentBet} pts`);
          resultText.setColor('#40c040');
          commentText.setText(winComments[Phaser.Math.Between(0, winComments.length - 1)]);

          // Big win reaction (bet 5 and win)
          if (currentBet === 5) {
            const ohText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'OHHH!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '20px',
              color: '#f0c040',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(1);
            objects.push(ohText);
            this.tweens.add({
              targets: ohText,
              y: GAME_HEIGHT / 2 - 80,
              alpha: 0,
              scale: 1.5,
              duration: 800,
              ease: 'Quad.easeOut',
              onComplete: () => ohText.destroy(),
            });
          }
        } else {
          points -= currentBet;
          SoundEffects.casinoLose();
          resultText.setText(`${total}. Lose -${currentBet} pts`);
          resultText.setColor('#ff4444');
          commentText.setText(loseComments[Phaser.Math.Between(0, loseComments.length - 1)]);

          // Big loss reaction (bet 5 and lose)
          if (currentBet === 5) {
            const damnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'DAMN.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '20px',
              color: '#ff4444',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(1);
            objects.push(damnText);
            this.tweens.add({
              targets: damnText,
              y: GAME_HEIGHT / 2 - 70,
              alpha: 0,
              duration: 1000,
              ease: 'Quad.easeOut',
              onComplete: () => damnText.destroy(),
            });
          }
        }

        roundText.setText(`Round ${roundNum}/${maxRounds}  |  Commissary: ${points}`);

        // Check for going broke
        if (points <= 0) {
          points = 0;
          endGame("JP's out. Nothing left to bet.");
          return;
        }

        if (roundNum < maxRounds) {
          // Check for double-or-nothing dare on last round when JP is up
          if (roundNum === maxRounds - 1 && points > 10) {
            this.time.delayedCall(1500, () => {
              // Show the dare
              resultText.setText('');
              commentText.setText('');
              instr.setText('');
              betLabel.setVisible(false);
              for (const b of betButtons) b.setVisible(false);
              leftArrow.setVisible(false);
              rightArrow.setVisible(false);

              const dareText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'DOUBLE OR NOTHING?', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '18px',
                color: '#f0c040',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              objects.push(dareText);

              // Pulse the dare text
              this.tweens.add({
                targets: dareText,
                scale: 1.1,
                duration: 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              });

              let dareChoice = 0; // 0 = YES, 1 = NO
              const yesText = this.add.text(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2, '> YES', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: '#f0c040',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              const noText = this.add.text(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2, '  NO', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: '#666666',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              objects.push(yesText, noText);

              const updateDareChoice = () => {
                if (dareChoice === 0) {
                  yesText.setText('> YES').setColor('#f0c040');
                  noText.setText('  NO').setColor('#666666');
                } else {
                  yesText.setText('  YES').setColor('#666666');
                  noText.setText('> NO').setColor('#f0c040');
                }
              };

              // Temporary dare input — reuse existing keys
              const dareInputHandler = (event?: { keyCode?: number }) => {
                const keyCode = event?.keyCode;
                if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT || keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
                  dareChoice = dareChoice === 0 ? 1 : 0;
                  updateDareChoice();
                  return;
                }
                if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || !keyCode) {
                  // Remove dare input
                  spaceKey.off('down', dareSpaceWrap);
                  leftKey.off('down', dareLeftWrap);
                  rightKey.off('down', dareRightWrap);
                  this.input.off('pointerdown', darePointerWrap);

                  // Clean up dare UI
                  dareText.destroy();
                  yesText.destroy();
                  noText.destroy();

                  if (dareChoice === 0) {
                    // YES — double or nothing: bet half of points
                    currentBet = Math.floor(points / 2);
                    roundText.setText(`FINAL ROUND  |  Commissary: ${points}  |  Bet: ${currentBet}`);
                    phase = 'betting';
                    rollDice();
                  } else {
                    // NO — normal last round
                    phase = 'betting';
                    roundText.setText(`Round ${roundNum + 1}/${maxRounds}  |  Commissary: ${points}`);
                    instr.setText('LEFT/RIGHT to bet, SPACE to roll');
                    betLabel.setVisible(true);
                    for (const b of betButtons) b.setVisible(true);
                    leftArrow.setVisible(true);
                    rightArrow.setVisible(true);
                    if (betOptions[betIndex] > points) betIndex = 0;
                    updateBetDisplay();
                  }
                }
              };

              const dareSpaceWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const dareLeftWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const dareRightWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const darePointerWrap = () => dareInputHandler();

              spaceKey.on('down', dareSpaceWrap);
              leftKey.on('down', dareLeftWrap);
              rightKey.on('down', dareRightWrap);
              this.input.on('pointerdown', darePointerWrap);
            });
          } else {
            // Normal next round
            this.time.delayedCall(1500, () => {
              phase = 'betting';
              roundText.setText(`Round ${roundNum + 1}/${maxRounds}  |  Commissary: ${points}`);
              instr.setText('LEFT/RIGHT to bet, SPACE to roll');
              betLabel.setVisible(true);
              for (const b of betButtons) b.setVisible(true);
              leftArrow.setVisible(true);
              rightArrow.setVisible(true);
              // Reset bet index if current bet is unaffordable
              if (betOptions[betIndex] > points) {
                betIndex = 0;
              }
              updateBetDisplay();
            });
          }
        } else {
          endGame();
        }
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    const inputListener = (event?: { keyCode?: number }) => {
      if (phase === 'done') return;

      if (phase === 'betting' && !rolling) {
        const keyCode = event?.keyCode;
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
          betIndex = Math.max(0, betIndex - 1);
          // Skip unaffordable bets
          while (betIndex > 0 && betOptions[betIndex] > points) betIndex--;
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
          betIndex = Math.min(2, betIndex + 1);
          // Skip unaffordable bets
          while (betIndex < 2 && betOptions[betIndex] > points) {
            if (betOptions[betIndex] <= points) break;
            betIndex--;
            break;
          }
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || !keyCode) {
          rollDice();
        }
      }
    };

    spaceKey.on('down', (e: { keyCode: number }) => inputListener(e));
    leftKey.on('down', (e: { keyCode: number }) => inputListener(e));
    rightKey.on('down', (e: { keyCode: number }) => inputListener(e));
    this.input.on('pointerdown', () => inputListener());
  }

  private playBattleScene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const DEPTH = 400;
    const FONT = '"Press Start 2P", monospace';

    // === STATE ===
    type BattleState = 'intro' | 'menu' | 'player-action' | 'enemy-action' | 'text' | 'end';
    let state: BattleState = 'intro';
    let jpHP = 100;
    let enemyHP = 80;
    const jpMaxHP = 100;
    const enemyMaxHP = 80;
    let menuIndex = 0; // 0=SWING, 1=DODGE, 2=TALK, 3=WALK AWAY
    let dodgeActive = false;
    let talkDebuff = false; // reduces enemy attack by 5
    let inputEnabled = false;
    let swingsLanded = 0;
    let crewIntervened = false;

    // === INTRO: Pokemon swipe transition ===
    const introTop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);
    const introBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);

    // Bars close in
    this.tweens.add({ targets: introTop, y: GAME_HEIGHT / 4, duration: 1 }); // already in place
    this.tweens.add({ targets: introBottom, y: GAME_HEIGHT * 3 / 4, duration: 1 });

    // Flash text "FIGHT!"
    const fightText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'FIGHT!', {
      fontFamily: FONT, fontSize: '36px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 51).setAlpha(0);
    objects.push(fightText);

    this.tweens.add({
      targets: fightText,
      alpha: 1,
      duration: 300,
      delay: 300,
      hold: 600,
      yoyo: true,
      onComplete: () => {
        fightText.destroy();
        // Open the bars to reveal the battle
        this.tweens.add({
          targets: introTop,
          y: -GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => introTop.destroy(),
        });
        this.tweens.add({
          targets: introBottom,
          y: GAME_HEIGHT + GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            introBottom.destroy();
            state = 'menu';
            inputEnabled = true;
          },
        });
      },
    });

    // === BACKGROUND ===
    // Dark concrete background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x252530)
      .setScrollFactor(0).setDepth(DEPTH);
    objects.push(bg);

    // Concrete wall texture lines (horizontal)
    for (let i = 0; i < 8; i++) {
      const y = 60 + i * 70;
      const line = this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 2, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1);
      objects.push(line);
    }
    // Vertical cracks
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 280;
      const crack = this.add.rectangle(x, GAME_HEIGHT / 3, 1, 120 + Math.random() * 80, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1).setAlpha(0.5);
      objects.push(crack);
    }

    // === ENEMY PLATFORM (top-left) ===
    const enemyPlatX = 340;
    const enemyPlatY = 250;
    const enemyPlatform = this.add.ellipse(enemyPlatX, enemyPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(enemyPlatform);

    // Enemy sprite
    const enemySprite = this.add.sprite(enemyPlatX, enemyPlatY, 'npc_inmate2', 0)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(enemySprite);
    const enemySpriteBaseX = enemyPlatX;
    const enemySpriteBaseY = enemyPlatY;

    // Enemy name + HP
    const enemyNameBg = this.add.rectangle(280, 80, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(enemyNameBg);

    const enemyName = this.add.text(130, 58, 'JUAN EL LOCO', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyName);

    const enemyHPLabel = this.add.text(130, 82, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyHPLabel);

    // HP bar background
    const enemyHPBgBar = this.add.rectangle(310, 87, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(enemyHPBgBar);

    // HP bar fill
    const enemyHPBar = this.add.rectangle(310, 87, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(enemyHPBar);

    // === JP PLATFORM (bottom-right) ===
    const jpPlatX = 940;
    const jpPlatY = 560;
    const jpPlatform = this.add.ellipse(jpPlatX, jpPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(jpPlatform);

    // JP sprite (facing up — frame 2)
    const jpSprite = this.add.sprite(jpPlatX, jpPlatY, this.getPlayerTexture(), 2)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(jpSprite);
    const jpSpriteBaseX = jpPlatX;
    const jpSpriteBaseY = jpPlatY;

    // JP name + HP
    const jpNameBg = this.add.rectangle(1000, 470, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(jpNameBg);

    const jpName = this.add.text(850, 448, 'JP', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpName);

    const jpHPLabel = this.add.text(850, 472, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPLabel);

    const jpHPText = this.add.text(1120, 472, `${jpHP}/${jpMaxHP}`, {
      fontFamily: FONT, fontSize: '10px', color: '#aaaacc',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPText);

    const jpHPBgBar = this.add.rectangle(900, 477, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(jpHPBgBar);

    const jpHPBar = this.add.rectangle(900, 477, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(jpHPBar);

    // === BATTLE MENU BOX (bottom, Pokemon-style) ===
    const menuY = 720;
    const menuBoxHeight = 240;

    // Text area (left side)
    const textBoxBg = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(textBoxBg);

    // Inner white border for Pokemon look
    const textBoxInner = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(textBoxInner);

    const battleText = this.add.text(40, menuY + 30, 'An inmate steps to JP.\n"You think you\'re tough?"', {
      fontFamily: FONT, fontSize: '13px', color: '#ffffff',
      wordWrap: { width: GAME_WIDTH / 2 - 80 }, lineSpacing: 8,
    }).setScrollFactor(0).setDepth(DEPTH + 11);
    objects.push(battleText);

    // Menu area (right side)
    const menuBoxBg = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(menuBoxBg);

    const menuBoxInner = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(menuBoxInner);

    // Menu options in 2x2 grid
    const menuOptions = ['SWING', 'DODGE', 'TALK', 'WALK AWAY'];
    const menuBaseX = GAME_WIDTH / 2 + 60;
    const menuBaseY = menuY + 50;
    const menuColGap = 260;
    const menuRowGap = 70;

    const menuTexts: Phaser.GameObjects.Text[] = [];
    const menuCursors: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = menuBaseX + col * menuColGap;
      const y = menuBaseY + row * menuRowGap;

      // Selection arrow
      const cursor = this.add.text(x - 5, y, '\u25b6', {
        fontFamily: FONT, fontSize: '14px', color: '#f0c040',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 12).setAlpha(i === 0 ? 1 : 0);
      objects.push(cursor);
      menuCursors.push(cursor);

      const text = this.add.text(x, y, menuOptions[i], {
        fontFamily: FONT, fontSize: '14px', color: i === 0 ? '#f0c040' : '#aaaacc',
      }).setScrollFactor(0).setDepth(DEPTH + 12);
      // Mobile: each option is directly tappable (battle is otherwise keyboard-only)
      text.setInteractive(new Phaser.Geom.Rectangle(-24, -18, 200, 52), Phaser.Geom.Rectangle.Contains);
      text.on('pointerdown', () => {
        if (!inputEnabled || state !== 'menu') return;
        menuIndex = i;
        updateMenu();
        onConfirm();
      });
      objects.push(text);
      menuTexts.push(text);
    }

    // === HP BAR HELPERS ===
    const getHPColor = (ratio: number): number => {
      if (ratio > 0.5) return 0x40c040; // green
      if (ratio > 0.25) return 0xc0c040; // yellow
      return 0xc04040; // red
    };

    const updateEnemyHP = () => {
      const ratio = Math.max(0, enemyHP / enemyMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: enemyHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          enemyHPBar.setFillStyle(color);
        },
      });
    };

    const updateJPHP = () => {
      const ratio = Math.max(0, jpHP / jpMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: jpHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          jpHPBar.setFillStyle(color);
        },
      });
      jpHPText.setText(`${Math.max(0, jpHP)}/${jpMaxHP}`);
    };

    // === MENU UPDATE ===
    const updateMenu = () => {
      for (let i = 0; i < 4; i++) {
        menuTexts[i].setColor(i === menuIndex ? '#f0c040' : '#aaaacc');
        menuCursors[i].setAlpha(i === menuIndex ? 1 : 0);
      }
    };

    // === WHITE FLASH ON HIT ===
    const flashSprite = (target: Phaser.GameObjects.Sprite) => {
      target.setTint(0xffffff);
      this.time.delayedCall(100, () => target.clearTint());

      // Impact particles — blood splatters (or stars in kids mode)
      const hitX = target.x;
      const hitY = target.y;
      const isKids = GameSettings.kidsMode;
      const particleCount = isKids ? 5 : 8;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const speed = 60 + Math.random() * 40;
        const color = isKids ? 0xf0c040 : 0xcc2020; // yellow stars vs blood red
        const size = isKids ? (4 + Math.random() * 3) : (3 + Math.random() * 5);
        const particle = this.add.circle(hitX, hitY, size, color)
          .setScrollFactor(0).setDepth(DEPTH + 20).setAlpha(0.9);
        objects.push(particle);
        this.tweens.add({
          targets: particle,
          x: hitX + Math.cos(angle) * speed,
          y: hitY + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: 300 + Math.random() * 200,
          ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      }

      // Blood drip that lingers (rated R only)
      if (!isKids && Math.random() > 0.4) {
        const drip = this.add.circle(hitX + (Math.random() - 0.5) * 20, hitY, 2, 0x990000, 0.7)
          .setScrollFactor(0).setDepth(DEPTH + 15);
        objects.push(drip);
        this.tweens.add({
          targets: drip,
          y: hitY + 30 + Math.random() * 20,
          alpha: 0.3,
          duration: 800,
          ease: 'Quad.easeIn',
        });
      }
    };

    // === SCREEN SHAKE (heavier for big hits) ===
    const screenShake = (heavy = false) => {
      if (heavy) {
        this.cameras.main.shake(350, 0.025);
      } else {
        this.cameras.main.shake(200, 0.015);
      }
    };

    // === SHOW BATTLE TEXT ===
    const showText = (text: string, callback?: () => void) => {
      state = 'text';
      inputEnabled = false;
      battleText.setText(text);
      this.time.delayedCall(1400, () => {
        if (callback) callback();
      });
    };

    // === SHOW MULTI-LINE TEXT SEQUENCE ===
    const showTextSequence = (lines: string[], callback?: () => void) => {
      let idx = 0;
      const showNext = () => {
        if (idx >= lines.length) {
          if (callback) callback();
          return;
        }
        battleText.setText(lines[idx]);
        idx++;
        this.time.delayedCall(1800, showNext);
      };
      showNext();
    };

    // === ENEMY TURN ===
    const enemyTurn = () => {
      state = 'enemy-action';
      inputEnabled = false;

      if (dodgeActive) {
        // Inmate swings and misses
        this.tweens.add({
          targets: enemySprite,
          x: enemySpriteBaseX + 120,
          duration: 200,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        dodgeActive = false;
        showText('Inmate swings... and misses!', () => {
          if (enemyHP <= 0) { endBattle(true); return; }
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
        return;
      }

      // Inmate attacks
      let damage = Phaser.Math.Between(10, 20);
      if (talkDebuff) {
        damage = Math.max(5, damage - 5);
      }

      // Enemy lunge animation
      this.tweens.add({
        targets: enemySprite,
        x: enemySpriteBaseX + 180,
        y: enemySpriteBaseY + 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Hit JP
          flashSprite(jpSprite);
          screenShake(damage > 15);
          jpHP -= damage;
          updateJPHP();

          // Enemy returns
          this.tweens.add({
            targets: enemySprite,
            x: enemySpriteBaseX,
            y: enemySpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`Inmate swings! JP takes ${damage} damage!`, () => {
            // Yard protection is earned twice: JP fed the crew and proved he
            // would stand up for himself. They stop a jump, not a fair fade.
            if (jpHP > 0 && jpHP <= 30 && !this.crewSaveUsed
                && ChoiceLedger.get('commissary_share') === 'Shared it'
                && swingsLanded >= 2) {
              this.crewSaveUsed = true;
              crewIntervened = true;
              state = 'player-action';
              inputEnabled = false;
              showText('A second inmate starts in from JP\'s blind side.', () => {
                showText('Mikey grabs him. Chris and Bird fill the space.', () => {
                  showText('"He stood up. He eats with us. This ain\'t a jump."', () => {
                    endBattle(true);
                  });
                });
              });
              return;
            }
            if (jpHP <= 0) { endBattle(false); return; }
            state = 'menu';
            inputEnabled = true;
            battleText.setText('What will JP do?');
          });
        },
      });
    };

    // === PLAYER ACTIONS ===
    const doSwing = () => {
      ChoiceLedger.record('jail_fight', 'Fought');
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      const damage = Phaser.Math.Between(15, 25);

      // JP lunge animation
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX - 180,
        y: jpSpriteBaseY - 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          flashSprite(enemySprite);
          screenShake(damage > 20);
          enemyHP -= damage;
          swingsLanded++;
          updateEnemyHP();

          // JP returns
          this.tweens.add({
            targets: jpSprite,
            x: jpSpriteBaseX,
            y: jpSpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`JP swings! Hit for ${damage} damage!`, () => {
            if (enemyHP <= 0) { endBattle(true); return; }
            enemyTurn();
          });
        },
      });
    };

    const doDodge = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = true;

      // JP shifts sideways
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX + 50,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });

      showText('JP braces and dodges!', () => {
        enemyTurn();
      });
    };

    const doTalk = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      // Talk NEVER works in jail — you get slapped for trying
      showText('JP: "Bro we don\'t gotta do this—"', () => {
        showText('That gay ass shit don\'t work in here.', () => {
          // Enemy gets a FREE hit — bitch slap
          const slapDmg = 20;
          jpHP = Math.max(0, jpHP - slapDmg);
          updateJPHP();

          // Slap animation
          this.cameras.main.shake(300, 0.015);
          const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
            .setScrollFactor(0).setDepth(710).setAlpha(0.4);
          this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy(),
          });

          showText(`Inmate slaps JP! ${slapDmg} damage!\n"I SAID DON'T TALK TO ME."`, () => {
            if (jpHP <= 0) {
              endBattle(false);
            } else {
              enemyTurn();
            }
          });
        });
      });
    };

    const doWalkAway = () => {
      ChoiceLedger.record('jail_fight', 'Walked away');
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      if (enemyHP > 50) {
        showText("The inmate blocks the way.\nYou can't leave yet.", () => {
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
      } else {
        showText('JP walks away. Not worth it.', () => {
          endBattle(true);
        });
      }
    };

    // === END BATTLE ===
    const endBattle = (jpWon: boolean) => {
      state = 'end';
      inputEnabled = false;
      this.battleWon = jpWon; // Track for reactive NPC dialogue
      this.refreshObjectiveHint();

      // Hide menu
      for (const t of menuTexts) t.setAlpha(0);
      for (const c of menuCursors) c.setAlpha(0);

      if (jpWon && enemyHP <= 0) {
        // Enemy falls
        this.tweens.add({
          targets: enemySprite,
          y: enemySpriteBaseY + 80,
          alpha: 0.3,
          angle: 90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        // Screen shake on KO
        screenShake(true);

        // Crowd roar text
        const roarText = this.add.text(GAME_WIDTH / 2, 180, 'K.O.', {
          fontFamily: FONT, fontSize: '40px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 30).setAlpha(0);
        objects.push(roarText);
        this.tweens.add({
          targets: roarText,
          alpha: 1,
          scale: 1.3,
          duration: 400,
          yoyo: true,
          hold: 600,
          ease: 'Quad.easeOut',
          onComplete: () => roarText.destroy(),
        });

        showTextSequence([
          'The inmate hits the ground.',
          'Guard: "BREAK IT UP! Both of you, against the wall!"',
          'JP: "He started it."',
          'Guard: "I don\'t care who started it. You want more time?"',
          "JP's Mind: Winning did not fix anything.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else if (jpWon && crewIntervened) {
        showTextSequence([
          'The whole crew moved. The extra inmate backs off.',
          'Nobody celebrates. Count is still coming.',
          'The yard goes back to pretending it saw nothing.',
        ], () => {
          cleanupBattle();
        });
      } else if (jpWon) {
        // Walked away
        showTextSequence([
          'JP turns his back and walks.',
          "JP's Mind: First good decision all week.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else {
        // JP lost
        this.tweens.add({
          targets: jpSprite,
          y: jpSpriteBaseY + 80,
          alpha: 0.3,
          angle: -90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        // Screen shake on JP going down
        screenShake(true);

        // Crowd roar
        const lossRoar = this.add.text(GAME_WIDTH / 2, 180, 'K.O.', {
          fontFamily: FONT, fontSize: '40px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 30).setAlpha(0);
        objects.push(lossRoar);
        this.tweens.add({
          targets: lossRoar,
          alpha: 1,
          scale: 1.3,
          duration: 400,
          yoyo: true,
          hold: 600,
          ease: 'Quad.easeOut',
          onComplete: () => lossRoar.destroy(),
        });

        showTextSequence([
          'JP hits the ground.',
          'Guard: "BREAK IT UP!"',
          'Guard: "Both of you. Against the wall. Now."',
          "JP's Mind: He gets up angrier than before.",
        ], () => {
          cleanupBattle();
        });
      }
    };

    // === CLEANUP ===
    const cleanupBattle = () => {
      // Pokemon bars closing transition
      const closeTop = this.add.rectangle(GAME_WIDTH / 2, -GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);
      const closeBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);

      this.tweens.add({
        targets: closeTop,
        y: GAME_HEIGHT / 4,
        duration: 500,
        ease: 'Quad.easeIn',
      });
      this.tweens.add({
        targets: closeBottom,
        y: GAME_HEIGHT * 3 / 4,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Destroy all battle objects
          upKey.off('down', onKeyDown);
          downKey.off('down', onKeyDown);
          leftKey.off('down', onKeyDown);
          rightKey.off('down', onKeyDown);
          spaceKey.off('down', onConfirm);

          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }

          // Open bars back to gameplay
          const openTop2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          const openBottom2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          this.tweens.add({
            targets: openTop2,
            y: -GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => { openTop2.destroy(); closeTop.destroy(); },
          });
          this.tweens.add({
            targets: openBottom2,
            y: GAME_HEIGHT + GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => {
              openBottom2.destroy();
              closeBottom.destroy();
              this.frozen = false;
              this.refreshObjectiveHint();
              this.maybePlayPhaseOneRealization();
            },
          });
        },
      });
    };

    // === INPUT ===
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const onKeyDown = (event: { keyCode: number }) => {
      if (!inputEnabled || state !== 'menu') return;

      const col = menuIndex % 2;
      const row = Math.floor(menuIndex / 2);

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP && row > 0) {
        menuIndex -= 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN && row < 1) {
        menuIndex += 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT && col > 0) {
        menuIndex -= 1;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT && col < 1) {
        menuIndex += 1;
      }
      updateMenu();
    };

    const onConfirm = () => {
      if (!inputEnabled || state !== 'menu') return;

      switch (menuIndex) {
        case 0: doSwing(); break;
        case 1: doDodge(); break;
        case 2: doTalk(); break;
        case 3: doWalkAway(); break;
      }
    };

    upKey.on('down', onKeyDown);
    downKey.on('down', onKeyDown);
    leftKey.on('down', onKeyDown);
    rightKey.on('down', onKeyDown);
    spaceKey.on('down', onConfirm);
  }

  // playTimeSkip removed — replaced by day system + playFinalMontage

  private playTimeSkipStep(
    steps: { day: string; desc: string; hold: number; shake?: boolean }[],
    index: number,
    bg: Phaser.GameObjects.Rectangle
  ) {
    if (index >= steps.length) {
      // All steps done — fade back to gameplay then transition
      this.tweens.add({
        targets: bg,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeOut',
        onComplete: () => {
          bg.destroy();
          this.frozen = false;
          this.requiredDone = true;
          // Transition to TractorScene
          this.transitionToScene('ReleaseScene');
        },
      });
      return;
    }

    const step = steps[index];

    // Day number — big, white, centered
    const dayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, step.day, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Description — smaller, muted color, below
    const descText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, step.desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#aaaacc',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Fade in the day number
    this.tweens.add({
      targets: dayText,
      alpha: 1,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Camera shake on birthday
        if (step.shake) {
          this.cameras.main.shake(400, 0.01);
        }

        // Fade in description after a beat
        this.tweens.add({
          targets: descText,
          alpha: 1,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold for the specified duration, then fade both out
            this.time.delayedCall(step.hold, () => {
              this.tweens.add({
                targets: [dayText, descText],
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  dayText.destroy();
                  descText.destroy();
                  // Brief pause between steps
                  this.time.delayedCall(300, () => {
                    this.playTimeSkipStep(steps, index + 1, bg);
                  });
                },
              });
            });
          },
        });
      },
    });
  }
}
