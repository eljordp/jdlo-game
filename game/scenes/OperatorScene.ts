import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, TILE_SIZE, SCALED_TILE } from '../config';
import { Analytics } from '../systems/Analytics';
import { BalanceSystem } from '../systems/BalanceSystem';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { GameIntelligence } from '../systems/GameIntelligence';
import { CasinoSystem } from '../systems/CasinoSystem';
import { DMSystem } from '../systems/DMSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { AffinitySystem } from '../systems/AffinitySystem';

export class OperatorScene extends BaseChapterScene {
  private npcsTalkedTo = new Set<string>();
  private dashboardDone = false;
  private pitchDone = false;
  private deePaidDeposit = false;
  private vacavilleTexted = false;
  private geraldTexted = false;
  private clockText?: Phaser.GameObjects.Text;
  private dayNightOverlay?: Phaser.GameObjects.Rectangle;
  private hiddenRoomFound = false;

  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 8: Operator Mode';
    this.nextScene = 'VegasScene';
    this.requiredInteractionId = 'ch6_equal_moment';
  }

  protected getPlayerTexture(): string {
    return 'player-ch7';
  }

  protected getMusicTrack(): string {
    return 'operator';
  }

  create() {
    super.create();
    this.createOperatorWorkplaces();
    this.createDhlOperationsCenter();
    this.buildDensityPass();

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch6_dashboard',      12, 4,  true);  // required: see the empire
    GameIntelligence.watch('ch6_portfolio',      19, 12);
    GameIntelligence.watch('ch6_equal_moment',   22, 12, true);  // required: gate to next
    GameIntelligence.watch('ch6_revenue',        33, 16);
    GameIntelligence.watch('ch6_client_call',    15, 6,  true);  // required: close the deal
    GameIntelligence.watch('ch6_view_city',      32, 44);
    GameIntelligence.watch('ch6_homeless',       5,  35);
    GameIntelligence.watch('ch6_pops_call',      12, 48, true);  // required: emotional peak
    GameIntelligence.watch('ch6_food_truck_menu', 24, 48);
    GameIntelligence.attachDebugPanel(this);

    // JP has money by Ch7 — seed balance if not already set
    if (BalanceSystem.getBalance() < 2550) {
      BalanceSystem.earn(2550); // $2,550 earned through Ch6 clients
      SoundEffects.playCash();
    }


    // --- HIDDEN ROOM (behind restaurant, alley at col 1, row 23-25) ---
    // Remove collision from a specific wall tile to make it secretly walkable
    this.collisionTiles.delete('1,23');
    this.collisionTiles.delete('1,24');
    this.collisionTiles.delete('1,25');
    // Add a small hidden room visual (only visible when you walk in)
    const hiddenRoomX = 1 * SCALED_TILE + SCALED_TILE / 2;
    const hiddenRoomY = 24 * SCALED_TILE + SCALED_TILE / 2;
    // Dim computer glow to hint there\'s something there
    const glow = this.add.circle(hiddenRoomX, hiddenRoomY, 4, 0x4080ff, 0.3).setDepth(3);
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Exit south -- head to Vegas (row 57 visible, triggers at 58)
    this.addNavArrow(19, 57, 'Vegas');

    // --- C8 Corvette + Lambo SVJ parked side by side ---
    const c8X = 19 * SCALED_TILE + SCALED_TILE / 2;
    const c8Y = 51 * SCALED_TILE + SCALED_TILE / 2;
    const c8 = this.add.sprite(c8X, c8Y, 'car-corvette-c8').setScale(SCALE).setDepth(5);
    this.collisionTiles.add('18,51'); this.collisionTiles.add('19,51'); this.collisionTiles.add('20,51');

    const svjX = 23 * SCALED_TILE + SCALED_TILE / 2;
    const svjY = 51 * SCALED_TILE + SCALED_TILE / 2;
    const svj = this.add.sprite(svjX, svjY, 'car-lambo-svj').setScale(SCALE).setDepth(5);
    this.collisionTiles.add('22,51'); this.collisionTiles.add('23,51'); this.collisionTiles.add('24,51');

    // --- Gym equipment (inside gym building ~rows 37-42, cols 3-12) ---
    // Bench press
    const benchX = 6 * SCALED_TILE + SCALED_TILE / 2;
    const benchY = 39 * SCALED_TILE + SCALED_TILE / 2;
    this.add.rectangle(benchX, benchY, 28, 14, 0x505060).setDepth(5); // bench
    this.add.rectangle(benchX, benchY - 8, 36, 3, 0x808090).setDepth(6); // barbell
    this.add.circle(benchX - 18, benchY - 8, 6, 0x404050).setDepth(6); // left plate
    this.add.circle(benchX + 18, benchY - 8, 6, 0x404050).setDepth(6); // right plate

    // Dumbbells rack
    const rackX = 10 * SCALED_TILE + SCALED_TILE / 2;
    const rackY = 38 * SCALED_TILE + SCALED_TILE / 2;
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(rackX + i * 10 - 20, rackY, 8, 6, 0x606070).setDepth(5);
      this.add.circle(rackX + i * 10 - 20 - 4, rackY, 3, 0x505060).setDepth(5);
      this.add.circle(rackX + i * 10 - 20 + 4, rackY, 3, 0x505060).setDepth(5);
    }

    // Pull-up bar
    const pullupX = 5 * SCALED_TILE + SCALED_TILE / 2;
    const pullupY = 41 * SCALED_TILE;
    this.add.rectangle(pullupX, pullupY, 40, 3, 0x808090).setDepth(6); // bar
    this.add.rectangle(pullupX - 18, pullupY, 3, 20, 0x606070).setDepth(5); // left post
    this.add.rectangle(pullupX + 18, pullupY, 3, 20, 0x606070).setDepth(5); // right post

    // --- Coffee shop details (inside ~rows 37-42, cols 14-19) ---
    // Espresso machine
    const espressoX = 16 * SCALED_TILE + SCALED_TILE / 2;
    const espressoY = 38 * SCALED_TILE + SCALED_TILE / 2;
    this.add.rectangle(espressoX, espressoY, 18, 14, 0x404048).setDepth(5); // machine body
    this.add.rectangle(espressoX, espressoY - 6, 12, 4, 0x808088).setDepth(6); // chrome top
    this.add.circle(espressoX - 4, espressoY + 2, 2, 0x30c060).setDepth(6); // green light

    // Matcha cup on counter
    const matchaX = 17 * SCALED_TILE;
    const matchaY = 40 * SCALED_TILE + SCALED_TILE / 2;
    this.add.circle(matchaX, matchaY, 5, 0x80c060).setDepth(6); // matcha green cup
    this.add.circle(matchaX, matchaY, 3, 0xa0e080).setDepth(7); // foam top

    // Menu board on wall
    const menuX = 15 * SCALED_TILE + SCALED_TILE / 2;
    const menuY = 37 * SCALED_TILE + 10;
    this.add.rectangle(menuX, menuY, 30, 20, 0x1a1a2a).setDepth(5); // chalkboard
    this.add.text(menuX, menuY, 'MENU', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(6);

    // --- Ambient office atmosphere ---

    // Subtle office lighting flicker (white overlay oscillating between 0.02 and 0.04 alpha)
    const ambientLight = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xffffff
    ).setScrollFactor(0).setDepth(1).setAlpha(0.02);

    this.tweens.add({
      targets: ambientLight,
      alpha: 0.04,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Hide car interactable sprites — real car sprites are placed above
    const corvSprite = this.interactions.getSprite('ch6_corvette');
    if (corvSprite) corvSprite.setVisible(false);
    const lamboSprite = this.interactions.getSprite('ch6_lambo');
    if (lamboSprite) lamboSprite.setVisible(false);

    // Day/night cycle overlay — starts invisible, shifts warm as clock advances
    this.dayNightOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 2, GAME_HEIGHT * 2, 0xff8020, 0
    ).setScrollFactor(0).setDepth(2).setBlendMode(Phaser.BlendModes.MULTIPLY);

    // --- NPC MOVEMENT — city feels alive ---
    this.startNPCPatrols();

    // Location tag: "LA, CA" in the top-right corner
    const locationTag = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 20, 'LA, CA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({
      targets: locationTag,
      alpha: 0.35,
      duration: 1500,
      delay: 4000,
      ease: 'Quad.easeOut',
    });

    // Small clock display (advances as you explore)
    this.clockText = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 34, '2:00 PM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#f0c040',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({
      targets: this.clockText,
      alpha: 0.3,
      duration: 1500,
      delay: 4200,
      ease: 'Quad.easeOut',
    });
  }

  // Density pass: the big readable layer. A room should announce its job
  // from across the screen — zones, one commanding board, and people working.
  private buildDensityPass() {
    const tile = SCALED_TILE;
    const px = (v: number) => v * tile + tile / 2;

    // ── HQ floor zoning: tape lines + stencils split the gray into functions ──
    const zones: Array<{ x: number; y: number; w: number; h: number; name: string; tint: number }> = [
      { x: 3.5, y: 3, w: 5, h: 5.5, name: 'DEV BAY', tint: 0x2a3a55 },
      { x: 10.5, y: 3, w: 2.5, h: 5.5, name: 'CALLS', tint: 0x3a2a45 },
      { x: 13.5, y: 3, w: 3, h: 5.5, name: 'OPS', tint: 0x453a25 },
    ];
    for (const z of zones) {
      this.add.rectangle(px(z.x + z.w / 2 - 0.5), px(z.y + z.h / 2 - 0.5), z.w * tile, z.h * tile, z.tint, 0.14)
        .setDepth(1.8);
      this.add.rectangle(px(z.x + z.w / 2 - 0.5), px(z.y) - tile * 0.35, z.w * tile, 3, 0xf0c040, 0.35).setDepth(1.9);
      this.add.text(px(z.x + z.w / 2 - 0.5), px(z.y) - tile * 0.18, z.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#c9b878',
      }).setOrigin(0.5).setDepth(1.9).setAlpha(0.85);
    }

    // ── THE BOARD: real clients, real statuses, readable across the room ──
    const boardX = px(11.5);
    const boardY = px(3.15);
    this.add.rectangle(boardX, boardY, tile * 3.4, tile * 1.5, 0x1c2430).setDepth(2.5).setStrokeStyle(3, 0x4a5568);
    this.add.text(boardX, boardY - tile * 0.55, 'ACTIVE WORK', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#8fa8c8',
    }).setOrigin(0.5).setDepth(2.6);
    const clients: Array<[string, string, number]> = [
      ['STICKER SMITH', 'PAID', 0x40c060],
      ['WCT', 'LIVE', 0x40c060],
      ['DHL', 'OPS', 0xf0c040],
      ['VACAVILLE', '+1 MORE THING', 0xe07040],
    ];
    clients.forEach(([name, status, color], i) => {
      const rowY = boardY - tile * 0.32 + i * (tile * 0.29);
      this.add.rectangle(boardX - tile * 0.6, rowY, tile * 1.9, tile * 0.22, 0x2a3444).setDepth(2.6);
      this.add.text(boardX - tile * 1.5, rowY, name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#c8d4e4',
      }).setOrigin(0, 0.5).setDepth(2.7);
      const chip = this.add.rectangle(boardX + tile * 0.95, rowY, tile * 0.85, tile * 0.2, color, 0.85).setDepth(2.6);
      this.add.text(boardX + tile * 0.95, rowY, status, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#101418',
      }).setOrigin(0.5).setDepth(2.7);
      if (status === 'OPS') {
        this.tweens.add({ targets: chip, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
      }
    });

    // ── DEV BAY: monitor wall with living glow + scrolling code flicker ──
    for (let m = 0; m < 3; m++) {
      const mx = px(4.4 + m * 1.2);
      const my = px(3.2);
      this.add.rectangle(mx, my, tile * 0.95, tile * 0.7, 0x0e1420).setDepth(2.5).setStrokeStyle(2, 0x3a4658);
      const screen = this.add.rectangle(mx, my, tile * 0.8, tile * 0.55, [0x1c3050, 0x1c4038, 0x30263e][m], 0.9).setDepth(2.6);
      this.tweens.add({
        targets: screen, alpha: 0.55, duration: 700 + m * 260, yoyo: true, repeat: -1, delay: m * 300,
      });
      for (let l = 0; l < 3; l++) {
        const codeLine = this.add.rectangle(mx - tile * 0.22 + l * 5, my - tile * 0.14 + l * 8, tile * (0.32 - l * 0.06), 2, 0x7ec8a0, 0.6).setDepth(2.7);
        this.tweens.add({
          targets: codeLine, scaleX: 0.4 + (l % 2) * 0.5, duration: 1100 + l * 380, yoyo: true, repeat: -1, delay: m * 200 + l * 150,
        });
      }
    }

    // ── OPS CORNER: pallet stacks + a worker who actually moves boxes ──
    for (let s = 0; s < 3; s++) {
      const sx = px(14.2 + (s % 2) * 0.9);
      const sy = px(3.3 + Math.floor(s / 2) * 0.75);
      this.add.rectangle(sx, sy, tile * 0.72, tile * 0.55, 0x8a6544).setDepth(2.5).setStrokeStyle(2, 0x5a4028);
      this.add.rectangle(sx, sy - tile * 0.08, tile * 0.72, 3, 0xc9a44a, 0.8).setDepth(2.6);
    }
    const worker = this.add.sprite(px(14.5), px(5), 'npc_generic', 0).setScale(SCALE * 0.95).setDepth(3.1).setTint(0xc8b898);
    const carried = this.add.rectangle(px(14.5), px(5) - tile * 0.4, tile * 0.4, tile * 0.3, 0x8a6544).setDepth(3.2);
    const runWorkerLoop = () => {
      if (!this.scene.isActive()) return;
      carried.setVisible(true);
      this.tweens.add({
        targets: [worker, carried], x: `-=${tile * 3.2}`, duration: 2600, ease: 'Sine.easeInOut',
        onComplete: () => {
          carried.setVisible(false);
          this.tweens.add({
            targets: [worker, carried], x: `+=${tile * 3.2}`, duration: 2600, delay: 700, ease: 'Sine.easeInOut',
            onComplete: () => { this.time.delayedCall(900, runWorkerLoop); },
          });
        },
      });
    };
    runWorkerLoop();

    // ── People using equipment: a dev parked at the monitor wall ──
    const seatedDev = this.add.sprite(px(5.6), px(3.9), 'npc_elijah', 0).setScale(SCALE * 0.95).setDepth(3.0).setTint(0xd8d8e8);
    this.tweens.add({ targets: seatedDev, y: px(3.9) - 2, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Keyboard clatter: a tiny paper/note hop near the dev every few seconds
    this.time.addEvent({
      delay: 5200, loop: true,
      callback: () => {
        if (!this.scene.isActive()) return;
        const note = this.add.rectangle(px(5.6) + 14, px(3.9) - 8, 6, 6, 0xf0e8c8).setDepth(3.2);
        this.tweens.add({ targets: note, y: px(3.9) - 24, alpha: 0, duration: 900, onComplete: () => note.destroy() });
      },
    });

    // ── Client samples: sticker sheets + print proofs by the OPS zone ──
    const sampleColors = [0xe05050, 0x40a0e0, 0xf0c040, 0x50c878];
    sampleColors.forEach((c, i) => {
      const sx = px(13.4) + (i % 2) * 14;
      const sy = px(6.1) + Math.floor(i / 2) * 14;
      this.add.rectangle(sx, sy, 12, 16, 0xffffff).setDepth(2.5).setAngle(-8 + i * 6);
      this.add.rectangle(sx, sy - 2, 8, 8, c).setDepth(2.6).setAngle(-8 + i * 6);
    });
    this.add.text(px(13.8), px(6.7), 'PROOFS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#8a7a58',
    }).setOrigin(0.5).setDepth(2.6);

    // ── Street life: courier with a dolly crossing the main street ──
    const courier = this.add.sprite(-tile, px(11), 'npc-business', 0).setScale(SCALE).setDepth(3.1);
    const dolly = this.add.rectangle(-tile - tile * 0.5, px(11) + tile * 0.1, tile * 0.5, tile * 0.55, 0x9a7040).setDepth(3.05);
    this.tweens.add({
      targets: [courier, dolly], x: `+=${(operatorMap.tiles[0].length + 2) * tile}`,
      duration: 26000, repeat: -1, delay: 2000,
    });

    // ── Printer at (8,6) actually prints ──
    this.time.addEvent({
      delay: 7000, loop: true,
      callback: () => {
        if (!this.scene.isActive()) return;
        const page = this.add.rectangle(px(8), px(6) - 6, 10, 12, 0xf0f0e8).setDepth(3.2).setAlpha(0.95);
        this.tweens.add({
          targets: page, y: px(6) + 14, alpha: 0, duration: 1600, ease: 'Quad.easeIn',
          onComplete: () => page.destroy(),
        });
      },
    });
  }

  private createOperatorWorkplaces() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;
    const rect = (x: number, y: number, width: number, height: number, color: number, depth = 2.05, alpha = 1) =>
      this.add.rectangle(px(x), px(y), width * tile, height * tile, color, alpha).setDepth(depth);
    const prop = (texture: string, x: number, y: number, scale = 0.65, tint?: number) => {
      const sprite = this.add.sprite(px(x), px(y), texture).setScale(SCALE * scale).setDepth(3.08);
      if (tint !== undefined) sprite.setTint(tint);
      return sprite;
    };
    const label = (x: number, y: number, width: number, text: string, color: number) => {
      this.add.rectangle(px(x), y * tile, width * tile, 26, color).setDepth(2.45);
      this.add.text(px(x), y * tile, text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(2.48);
    };

    label(9.5, 2.28, 14.6, 'POMAIKA\'I  /  OFFICE KULT', 0x233f59);
    label(24.5, 2.28, 8.6, 'CLIENT WORKSHOP', 0x4e535e);
    label(35, 2.28, 5.6, 'CLIENT OFFICE', 0x4b3f52);

    // Pomaika'i: a working operator floor—shared desks, live projects,
    // whiteboard, printer, water station and a table where scope gets decided.
    rect(9.5, 5.6, 12.4, 4.5, 0x26384a, 2.0);
    rect(9.5, 5.6, 11.8, 3.9, 0x354c62, 2.02);
    for (let x = 4.2; x <= 14.8; x += 1.1) {
      this.add.rectangle(px(x), px(5.6), 4, 3.45 * tile, 0x82a1b7, 0.18).setDepth(2.04);
    }

    // Two workstation rows instead of tablets floating on hardwood.
    for (const y of [4.15, 6.25]) {
      for (const x of [5.1, 7.4, 11.7, 14.0]) {
        this.add.rectangle(px(x), px(y), 1.7 * tile, 34, 0x553a2c).setDepth(2.5);
        this.add.rectangle(px(x), px(y) - 12, 1.55 * tile, 7, 0x9a7655).setDepth(2.53);
      }
    }
    for (const [x, y, color] of [
      [5.1, 3.88, 0x4d8fc5], [7.4, 3.88, 0x5ca66e],
      [11.7, 3.88, 0x7769c8], [14.0, 3.88, 0x4d9a93],
      [5.1, 5.98, 0x5a88bd], [7.4, 5.98, 0x9b7755],
      [11.7, 5.98, 0x6c75bd], [14.0, 5.98, 0x4c9c77],
    ] as Array<[number, number, number]>) {
      this.add.rectangle(px(x), px(y), 58, 36, 0x11161e).setDepth(2.72).setStrokeStyle(3, 0x424a53);
      const glow = this.add.rectangle(px(x), px(y), 47, 25, color, 0.48).setDepth(2.74);
      this.tweens.add({ targets: glow, alpha: 0.2, duration: 1000 + x * 57 + y * 31, yoyo: true, repeat: -1 });
    }

    // Real operational surfaces: proposal notes, delivery status and a screen
    // showing work—not vanity revenue counters.
    this.add.rectangle(px(10.4), 3.05 * tile, 265, 58, 0xe4e3dc).setDepth(2.43).setStrokeStyle(6, 0x635544);
    this.add.text(px(10.4), 3.05 * tile, 'TODAY\nSHIP  •  FIX  •  FOLLOW UP', {
      fontFamily: 'monospace', fontSize: '9px', color: '#25303b', align: 'center',
    }).setOrigin(0.5).setDepth(2.46);
    for (const note of [
      { x: 3.8, y: 3.2, color: 0xe5d36e },
      { x: 4.35, y: 3.25, color: 0x77b7d4 },
      { x: 15.1, y: 3.2, color: 0xe08d98 },
      { x: 15.65, y: 3.28, color: 0x85bd79 },
    ]) {
      this.add.rectangle(px(note.x), px(note.y), 32, 28, note.color).setDepth(2.48).setAngle((note.x % 1) * 8 - 3);
    }
    prop('item-storage-box', 8.2, 7.2, 0.58, 0xd4d1ca);
    prop('item-letter', 9.0, 7.15, 0.48);
    prop('item-bottle', 13.0, 3.5, 0.48, 0x7bb5c5);
    prop('item-photo', 15.7, 7.2, 0.5);
    prop('item-plant', 3.5, 7.2, 0.62);

    // Client workshop: presentation screen, conference table, samples and
    // chairs. It reads as a working session, not an empty executive suite.
    rect(24.5, 5.5, 6.6, 4.3, 0x4b5058, 2.01);
    rect(24.5, 5.5, 6.1, 3.8, 0x646a72, 2.03);
    this.add.rectangle(px(24.5), 3.1 * tile, 275, 72, 0x171b20).setDepth(2.45).setStrokeStyle(5, 0x6f747a);
    const clientDisplay = this.add.rectangle(px(24.5), 3.1 * tile, 252, 54, 0x4c78a4, 0.38).setDepth(2.47);
    this.tweens.add({ targets: clientDisplay, alpha: 0.17, duration: 1900, yoyo: true, repeat: -1 });
    this.add.text(px(24.5), 3.1 * tile, 'SCOPE  /  STATUS  /  NEXT', {
      fontFamily: 'monospace', fontSize: '9px', color: '#dbe6ee',
    }).setOrigin(0.5).setDepth(2.5);
    rect(24.5, 5.45, 4.4, 1.05, 0x5d4031, 2.48);
    this.add.rectangle(px(24.5), px(5.45) - 20, 4.05 * tile, 9, 0x9f7958).setDepth(2.51);
    for (const [x, y] of [[22.4, 4.65], [24.5, 4.65], [26.6, 4.65], [22.4, 6.3], [24.5, 6.3], [26.6, 6.3]] as Array<[number, number]>) {
      prop('item-nightstand', x, y, 0.46, 0x4b4f56);
    }
    prop('item-letter', 23.5, 5.3, 0.5);
    prop('item-tablet', 25.4, 5.3, 0.52);
    prop('item-bottle', 26.2, 5.35, 0.42, 0x7697a8);

    // The workshop needs to look occupied from the doorway, not like a table
    // waiting for a meeting. Large sample walls and two working participants
    // make the room's purpose legible without filling its walkable center.
    for (const side of [-1, 1]) {
      const wallX = 24.5 + side * 2.65;
      this.add.rectangle(px(wallX), px(4.25), 0.58 * tile, 1.3 * tile, 0x2d3239)
        .setDepth(2.5)
        .setStrokeStyle(2, 0x7d858d);
      for (let sample = 0; sample < 3; sample++) {
        this.add.rectangle(
          px(wallX),
          px(3.85 + sample * 0.4),
          0.42 * tile,
          0.22 * tile,
          [0x8e5f45, 0x587a8e, 0xb99b55][sample],
          0.9,
        ).setDepth(2.55);
      }
      this.add.text(px(wallX), px(4.92), side < 0 ? 'SAMPLES' : 'PROOFS', {
        fontFamily: 'monospace', fontSize: '6px', color: '#d4d8dc',
      }).setOrigin(0.5).setDepth(2.57);
    }

    const workshopClient = this.add.sprite(px(22.55), px(6.35), 'npc-business', 0)
      .setScale(SCALE * 0.94).setDepth(3.05);
    const workshopOperator = this.add.sprite(px(26.45), px(6.35), 'npc_generic', 0)
      .setScale(SCALE * 0.94).setDepth(3.05).setTint(0xb9c6d8);
    this.tweens.add({
      targets: [workshopClient, workshopOperator],
      y: '-=2',
      duration: 1150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // A live pointer crossing the scope display gives the meeting one clear
    // motion cue while the surrounding office remains focused and calm.
    const scopePointer = this.add.circle(px(23.55), 3.1 * tile, 5, 0xf0c040, 0.8).setDepth(2.6);
    this.tweens.add({
      targets: scopePointer,
      x: px(25.45),
      duration: 2400,
      yoyo: true,
      repeat: -1,
      hold: 500,
      ease: 'Sine.easeInOut',
    });

    // Smaller client office: believable scale, one desk, a waiting couch,
    // framed work and storage. The mirror no longer hangs in an empty box.
    rect(35, 5.0, 4.4, 2.9, 0x4a3f50, 2.01);
    rect(35, 5.0, 4.0, 2.5, 0x65566b, 2.03);
    this.add.rectangle(px(35), 3.15 * tile, 220, 52, 0x2a2d33).setDepth(2.44);
    for (const [x, color] of [[33.8, 0xb78a5c], [35, 0x7fa0b4], [36.2, 0x9f728c]] as const) {
      this.add.rectangle(px(x), 3.15 * tile, 52, 36, color, 0.55).setDepth(2.47);
    }
    this.add.rectangle(px(34.1), px(5.55), 2.0 * tile, 34, 0x52362b).setDepth(2.5);
    prop('item-tablet', 34.1, 5.35, 0.52);
    prop('item-couch', 36.2, 5.8, 0.68, 0x4b4f58);
    prop('item-storage-box', 36.3, 4.2, 0.52, 0x7c6652);

    // The old gray void between buildings read as leftover map space. Turn it
    // into a service road with curb, parking bays, and a safe crossing so the
    // moving courier and DHL van have a believable route.
    this.add.rectangle(px(20), px(10.75), 40 * tile, 3.0 * tile, 0x252932, 0.72).setDepth(1.65);
    this.add.rectangle(px(20), px(9.35), 40 * tile, 5, 0x7b858c, 0.65).setDepth(1.7);
    this.add.rectangle(px(20), px(12.15), 40 * tile, 5, 0x7b858c, 0.65).setDepth(1.7);
    for (let laneX = 1.5; laneX < 40; laneX += 3.2) {
      this.add.rectangle(px(laneX), px(10.75), 1.45 * tile, 4, 0xc7b96a, 0.55).setDepth(1.72);
    }
    for (let stripe = 0; stripe < 6; stripe++) {
      this.add.rectangle(px(18.2 + stripe * 0.55), px(10.75), 0.28 * tile, 2.55 * tile, 0xe5e5dc, 0.72)
        .setDepth(1.74);
    }
    this.add.text(px(20), px(12.0), 'CLIENTS   •   DELIVERIES   •   OPERATIONS', {
      fontFamily: 'monospace', fontSize: '7px', color: '#9ba4ad', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(1.75).setAlpha(0.72);

    // Preserve the entrance at 9,9 and the open circulation spines through all
    // three offices while making the furniture physically meaningful.
    for (const [x, y] of [
      [5, 4], [7, 4], [12, 4], [14, 4], [5, 6], [7, 6], [12, 6], [14, 6],
      [22, 5], [24, 5], [26, 5], [34, 5], [36, 5],
    ] as Array<[number, number]>) {
      this.collisionTiles.add(`${x},${y}`);
    }

    // A DHL vehicle passes the operator district, tying the warehouse work in
    // Come Up to the later relationship without inventing a second fake office.
    const dhlVan = this.add.sprite(-2 * tile, 11.45 * tile, 'item-truck')
      .setScale(SCALE * 0.9).setTint(0xd8b600).setDepth(2.62).setAlpha(0.9);
    this.tweens.add({
      targets: dhlVan,
      x: 42 * tile,
      duration: 12800,
      repeat: -1,
      onRepeat: () => { dhlVan.x = -2 * tile; },
      ease: 'Linear',
    });
  }

  private createDhlOperationsCenter() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;

    // This is a DHL operations visit, not JP's office. The existing downtown
    // shop becomes a compact scan / sort / stage floor so the relationship is
    // visible as serious logistics work instead of one client on the sidewalk.
    const centerX = px(30.5);
    this.add.rectangle(centerX, 14.25 * tile, 9.2 * tile, 30, 0xd8b600)
      .setDepth(2.44)
      .setStrokeStyle(3, 0x9a7900);
    this.add.text(centerX, 14.25 * tile, 'DHL  OPERATIONS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#251d00',
    }).setOrigin(0.5).setDepth(2.48);

    // The floor is deliberately divided into three large readable functions.
    const floorY = px(15.55);
    this.add.rectangle(px(28.15), floorY, 3.0 * tile, 1.65 * tile, 0x3b3730, 0.9).setDepth(2.08);
    this.add.rectangle(px(31.15), floorY, 2.6 * tile, 1.65 * tile, 0x49443a, 0.9).setDepth(2.08);
    this.add.rectangle(px(33.75), floorY, 2.0 * tile, 1.65 * tile, 0x343942, 0.9).setDepth(2.08);
    for (const [x, label] of [[28.15, 'SCAN'], [31.15, 'SORT'], [33.75, 'STAGE']] as Array<[number, string]>) {
      this.add.text(px(x), px(15.03), label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#f2d447',
      }).setOrigin(0.5).setDepth(2.5).setAlpha(0.9);
    }

    // Scan station: terminal, scale and a live green confirmation light.
    this.add.rectangle(px(27.35), px(15.8), 1.15 * tile, 0.7 * tile, 0x24272d)
      .setDepth(2.55)
      .setStrokeStyle(2, 0x626873);
    this.add.rectangle(px(27.35), px(15.62), 0.72 * tile, 0.33 * tile, 0x173e45).setDepth(2.58);
    const scanLight = this.add.circle(px(27.7), px(15.45), 5, 0x52d273).setDepth(2.62);
    this.tweens.add({ targets: scanLight, alpha: 0.3, duration: 650, yoyo: true, repeat: -1 });
    this.add.rectangle(px(28.55), px(15.95), 0.9 * tile, 0.5 * tile, 0x6f6b63).setDepth(2.54);

    // Sorting conveyor: one large functional object beats a scatter of props.
    const beltX = px(31.0);
    const beltY = px(15.75);
    this.add.rectangle(beltX, beltY, 2.45 * tile, 0.72 * tile, 0x222831)
      .setDepth(2.5)
      .setStrokeStyle(3, 0x69727e);
    for (let roller = -4; roller <= 4; roller++) {
      this.add.rectangle(beltX + roller * 19, beltY, 5, 0.58 * tile, 0x5e6873).setDepth(2.52);
    }
    const parcel = this.add.rectangle(beltX - tile, beltY - 4, 0.52 * tile, 0.42 * tile, 0xa97742)
      .setDepth(2.63)
      .setStrokeStyle(2, 0xd4a35d);
    this.tweens.add({
      targets: parcel,
      x: beltX + tile,
      duration: 2400,
      repeat: -1,
      repeatDelay: 700,
      ease: 'Linear',
      onRepeat: () => { parcel.x = beltX - tile; },
    });

    // Dispatch staging: palletized cartons and dock markings form a single
    // recognizable cluster while the center aisle and south door stay open.
    for (const [x, y, shade] of [
      [33.55, 15.55, 0x9a6d3d], [34.35, 15.55, 0x825c35],
      [33.55, 16.15, 0x76512f], [34.35, 16.15, 0xa87842],
    ] as Array<[number, number, number]>) {
      this.add.rectangle(px(x), px(y), 0.66 * tile, 0.5 * tile, shade)
        .setDepth(2.55)
        .setStrokeStyle(2, 0x533821);
      this.add.rectangle(px(x), px(y) - 5, 0.5 * tile, 3, 0xf0c040, 0.8).setDepth(2.58);
    }
    this.add.rectangle(px(33.95), px(16.48), 1.8 * tile, 5, 0xf0c040, 0.8).setDepth(2.52);
    this.add.text(px(33.95), px(16.6), 'DISPATCH', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#d7dbe0',
    }).setOrigin(0.5).setDepth(2.54);

    // A floor worker moves a parcel between scan and sort. The manager stays
    // interactable and paces inside the operation instead of on the road.
    const floorWorker = this.add.sprite(px(28.9), px(16.45), 'npc_generic', 0)
      .setScale(SCALE * 0.92)
      .setTint(0xe4c517)
      .setDepth(3.1);
    const workerParcel = this.add.rectangle(px(28.9), px(16.45) - tile * 0.42, tile * 0.38, tile * 0.28, 0x9b7042)
      .setDepth(3.2);
    this.tweens.add({
      targets: [floorWorker, workerParcel],
      x: px(32.15),
      duration: 3300,
      yoyo: true,
      repeat: -1,
      hold: 900,
      repeatDelay: 700,
      ease: 'Sine.easeInOut',
    });

    // ── Round two: the authority layer. Scanner arch, live order wall,
    // safety markings, a clock that ticks. A floor that runs on schedule. ──

    // Scanner arch over the belt with a sweeping red laser
    this.add.rectangle(beltX - tile * 0.05, beltY - tile * 0.62, 8, tile * 0.55, 0x8a919c).setDepth(2.66);
    this.add.rectangle(beltX + tile * 0.55, beltY - tile * 0.62, 8, tile * 0.55, 0x8a919c).setDepth(2.66);
    this.add.rectangle(beltX + tile * 0.25, beltY - tile * 0.9, tile * 0.75, 8, 0x8a919c).setDepth(2.66);
    const laser = this.add.rectangle(beltX - tile * 0.02, beltY - tile * 0.35, 3, tile * 0.5, 0xff3030, 0.75).setDepth(2.67);
    this.tweens.add({ targets: laser, x: beltX + tile * 0.52, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Live order wall: label cards, amber highlight walks the queue
    const orderCards: Phaser.GameObjects.Rectangle[] = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const card = this.add.rectangle(px(29.4 + col * 0.62), px(14.65 + row * 0.34), tile * 0.5, tile * 0.24, 0xe8e4da)
          .setDepth(2.5).setStrokeStyle(1, 0x9a938a);
        orderCards.push(card);
      }
    }
    let liveOrder = 0;
    this.time.addEvent({
      delay: 4000, loop: true,
      callback: () => {
        if (!this.scene.isActive()) return;
        orderCards.forEach((c, i) => c.setFillStyle(i === liveOrder ? 0xf0c040 : 0xe8e4da));
        liveOrder = (liveOrder + 1) % orderCards.length;
      },
    });

    // Safety hatch marks along the belt lane + dock stencil
    for (let h = 0; h < 6; h++) {
      this.add.rectangle(px(29.9 + h * 0.45), px(16.55), tile * 0.28, 5, 0xf0c040, 0.7).setDepth(2.46).setAngle(-45);
    }
    this.add.text(px(27.6), px(16.6), 'DOCK 1', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#8a919c',
    }).setOrigin(0.5).setDepth(2.5);

    // Wall clock that actually ticks — floors like this run on minutes
    this.add.circle(px(32.9), px(14.63), 10, 0xe8e4da).setDepth(2.5).setStrokeStyle(2, 0x555a63);
    const minuteHand = this.add.rectangle(px(32.9), px(14.63) - 3, 2, 8, 0x2a2e35).setOrigin(0.5, 1).setDepth(2.52);
    this.time.addEvent({
      delay: 2000, loop: true,
      callback: () => { if (this.scene.isActive()) minuteHand.angle += 30; },
    });

    const dhlManager = this.npcs.find(npc => npc.id === 'ch6_dhl');
    if (dhlManager) {
      this.collisionTiles.delete('30,12');
      dhlManager.sprite.setPosition(px(29.25), px(16.45));
      this.collisionTiles.add('29,16');
    }

    for (const [x, y] of [[27, 15], [28, 15], [30, 15], [31, 15], [32, 15], [34, 15], [34, 16]] as Array<[number, number]>) {
      this.collisionTiles.add(`${x},${y}`);
    }
  }

  // --- NPC Patrol System ---
  private startNPCPatrols() {
    // Helper: make an NPC walk back and forth on X axis
    const patrolX = (npcId: string, tileStart: number, tileEnd: number, delay: number, speed: number) => {
      const npc = this.npcs.find(n => n.id === npcId);
      if (!npc) return;
      let forward = true;
      const startX = tileStart * SCALED_TILE + SCALED_TILE / 2;
      const endX = tileEnd * SCALED_TILE + SCALED_TILE / 2;
      // Initial position
      npc.sprite.x = startX;

      this.time.addEvent({
        delay,
        loop: true,
        callback: () => {
          if (!this.scene.isActive() || this.frozen) return;
          const n = this.npcs.find(np => np.id === npcId);
          if (!n || !n.sprite.visible) return;

          const oldTX = Math.round((n.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
          const oldTY = Math.round((n.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
          this.collisionTiles.delete(`${oldTX},${oldTY}`);

          const targetX = forward ? endX : startX;
          forward = !forward;

          this.tweens.add({
            targets: n.sprite,
            x: targetX,
            duration: speed,
            ease: 'Linear',
            onComplete: () => {
              const newTX = Math.round((n.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
              this.collisionTiles.add(`${newTX},${oldTY}`);
            },
          });
        },
      });
    };

    // Helper: make an NPC walk back and forth on Y axis
    const patrolY = (npcId: string, tileStart: number, tileEnd: number, delay: number, speed: number) => {
      const npc = this.npcs.find(n => n.id === npcId);
      if (!npc) return;
      let forward = true;
      const startY = tileStart * SCALED_TILE + SCALED_TILE / 2;
      const endY = tileEnd * SCALED_TILE + SCALED_TILE / 2;
      npc.sprite.y = startY;

      this.time.addEvent({
        delay,
        loop: true,
        callback: () => {
          if (!this.scene.isActive() || this.frozen) return;
          const n = this.npcs.find(np => np.id === npcId);
          if (!n || !n.sprite.visible) return;

          const oldTX = Math.round((n.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
          const oldTY = Math.round((n.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
          this.collisionTiles.delete(`${oldTX},${oldTY}`);

          const targetY = forward ? endY : startY;
          forward = !forward;

          this.tweens.add({
            targets: n.sprite,
            y: targetY,
            duration: speed,
            ease: 'Linear',
            onComplete: () => {
              const newTY = Math.round((n.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
              this.collisionTiles.add(`${oldTX},${newTY}`);
            },
          });
        },
      });
    };

    // Security — paces back and forth outside Pomaikai (row 10, cols 5-15)
    patrolX('ch6_security', 5, 15, 4000, 3000);

    // Tony — strolls the boulevard (row 11, cols 10-28)
    patrolX('ch6_tony', 10, 28, 5000, 4500);

    // Pedestrian 1 — walks the tree-lined boulevard (row 35, cols 5-35)
    patrolX('ch6_pedestrian1', 5, 35, 3000, 6000);

    // Pedestrian 2 — walks opposite direction (row 44, cols 30-5)
    patrolX('ch6_pedestrian2', 5, 30, 4000, 5500);

    // Manza — walks between buildings (row 12, cols 28-38)
    patrolX('ch6_manza', 28, 38, 6000, 3500);

    // DHL manager — checks the scan-side aisle. Keep him off the Future object
    // at 30,16 so normal interaction can never resolve the wrong target.
    patrolX('ch6_dhl', 28, 29, 5500, 1800);

    // Gym bro — moves between equipment (col 5, rows 38-41)
    patrolY('ch6_gym_bro', 38, 41, 4500, 2000);

    // Doorman — patrols highrise entrance (row 42, cols 27-33)
    patrolX('ch6_doorman', 27, 33, 7000, 4000);

    // Valet — walks near the cars (row 51, cols 17-25)
    patrolX('ch6_valet', 17, 25, 5000, 3000);

    // --- Pomaikai HQ office NPCs ---
    // Malachi — purposeful walk across the office, checking on things (cols 4-14)
    patrolX('ch6_malachi', 4, 14, 6000, 4000);

    // Elijah — short pace near conference area (cols 10-14)
    patrolX('ch6_elijah', 10, 14, 7000, 2500);

    // Office Kult tech — working at desk, small shift (cols 4-7)
    patrolX('ch6_office_kult', 4, 7, 8000, 2000);

    // --- Office 2 + Office 3 ---
    // Big client — paces while on a call (cols 22-27)
    patrolX('ch6_big_client', 22, 27, 5500, 3000);

    // Client 2 — small fidget in the tight office (cols 34-36)
    patrolX('ch6_client2', 34, 36, 9000, 1800);

    // --- Street NPCs ---
    // Equal (whale) — slow stroll down the sidewalk (cols 17-26)
    patrolX('ch6_equal', 17, 26, 7000, 5000);

    // Mentor — walks thoughtfully near the plaza (cols 14-22)
    patrolX('ch6_mentor', 14, 22, 8000, 4500);

    // --- Downtown / Plaza ---
    // Team member — wanders the plaza area (cols 4-8)
    patrolX('ch6_team_member', 4, 8, 6500, 3000);

    // --- Restaurant ---
    // Restaurant NPC — subtle seat shift (cols 5-7, seated movement)
    patrolX('ch6_restaurant', 5, 7, 10000, 1500);

    // --- Coworking space ---
    // Coworker 1 — rolls chair between desks (cols 14-19)
    patrolX('ch6_coworker1', 14, 19, 7500, 2500);

    // Coworker 2 — paces to whiteboard and back (cols 20-25)
    patrolX('ch6_coworker2', 20, 25, 8500, 3000);

    // --- Coffee shop ---
    // Barista — moves behind the counter (cols 15-19)
    patrolX('ch6_barista', 15, 19, 6000, 2000);

    // --- Block 4 ---
    // Food truck NPC — steps out and back (tiny movement, cols 23-25)
    patrolX('ch6_food_truck', 23, 25, 9000, 1800);
  }

  // Clock advances based on NPC count + shifts day/night lighting
  private advanceClock() {
    if (!this.clockText) return;
    const count = this.npcsTalkedTo.size;
    const times = ['2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];
    const timeIndex = Math.min(count, times.length - 1);
    this.clockText.setText(times[timeIndex]);

    // Day/night shift — overlay gets warmer and more visible as time passes
    if (this.dayNightOverlay) {
      // 0 = 2PM (bright), 8 = 5PM (sunset)
      // Color shifts: clear → golden → orange → deep sunset
      const colors = [
        { color: 0xffffff, alpha: 0 },      // 2:00 — bright, no tint
        { color: 0xfff8e0, alpha: 0.02 },   // 2:15 — barely warm
        { color: 0xffe8c0, alpha: 0.04 },   // 2:30
        { color: 0xffd890, alpha: 0.06 },   // 2:45 — noticeable warmth
        { color: 0xffb860, alpha: 0.09 },   // 3:00 — golden hour starts
        { color: 0xff9840, alpha: 0.12 },   // 3:30 — deep golden
        { color: 0xff7830, alpha: 0.15 },   // 4:00 — orange sunset
        { color: 0xff5820, alpha: 0.18 },   // 4:30 — deep sunset
        { color: 0xe04020, alpha: 0.22 },   // 5:00 — dusk
      ];
      const target = colors[timeIndex];
      this.dayNightOverlay.setFillStyle(target.color, 1);
      this.tweens.add({
        targets: this.dayNightOverlay,
        alpha: target.alpha,
        duration: 2000,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // Malachi reacts based on client count + dashboard/pitch
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    this.npcsTalkedTo.add(npcId);
    this.advanceClock();

    // Barista — purchase menu
    if (npcId === 'ch6_barista') {
      this.playPurchaseMenu('ORDER UP', [
        { name: 'Matcha Latte', price: '$7', cost: 7, color: '#80c060' },
        { name: 'Espresso', price: '$4', cost: 4, color: '#3a2010' },
        { name: 'Breakfast Sandwich', price: '$9', cost: 9, color: '#c8a050' },
      ], [
        '"The usual?" JP nods.',
        'Barista already had it started.',
      ]);
      return;
    }

    // Dee — the client with her own voice. She remembers how you price.
    // Player's Come Up pricing choice echoes here, word for word.
    if (npcId === 'ch6_client2') {
      const priced = ChoiceLedger.get('price_hold');
      const deeLines: DialogueLine[] = [
        { speaker: 'Dee', text: 'We need the full stack. Website, CRM, AI receptionist, booking system.' },
        { speaker: 'JP', text: 'End of week.' },
        { speaker: 'Dee', text: 'Our last vendor quoted eight weeks.' },
        { speaker: 'JP', text: 'I\'m not your last vendor.' },
        ...(priced === 'Cut it to close'
          ? [
              { speaker: 'Dee', text: 'And JP — I saw what you charged the print shop back then. That number was wrong.' },
              { speaker: 'Dee', text: 'Bill me what it\'s worth. I don\'t hire people who don\'t value themselves.' },
              { speaker: 'JP\'s Mind', text: 'She\'s right. She usually is.' },
            ]
          : priced === 'Held the price'
            ? [
                { speaker: 'Dee', text: 'And I heard you don\'t cut your number. Good. Neither do I.' },
                { speaker: 'JP\'s Mind', text: 'Real recognize real.' },
              ]
            : []),
        // Dee doesn't do talk. She does deposits.
        { speaker: 'Dee', text: 'Deposit\'s in your inbox. Half up front. That\'s how professionals work.' },
        { speaker: 'Narrator', text: 'She\'s already walking off. Phone to her ear, next thing handled.' },
      ];
      this.dialogue.show(deeLines, () => {
        if (!this.deePaidDeposit) {
          this.deePaidDeposit = true;
          BalanceSystem.earn(750);
          SoundEffects.playCash();
          AffinitySystem.adjust('ch6_client2', 1);
        }
      });
      return;
    }

    // Malachi impressed if you\'ve talked to 5+ people
    if (npcId === 'ch6_malachi' && this.npcsTalkedTo.size >= 5) {
      const chapterDialogue = this.getChapterDialogue();
      const impressedLines = chapterDialogue.npcs['ch6_malachi_impressed'];
      if (impressedLines) {
        this.dialogue.show(impressedLines);
        return;
      }
    }

    // Team member thanks you after dashboard
    if (npcId === 'ch6_team' && this.dashboardDone) {
      const chapterDialogue = this.getChapterDialogue();
      const thanksLines = chapterDialogue.npcs['ch6_team_thanks'];
      if (thanksLines) {
        this.dialogue.show(thanksLines);
        return;
      }
    }

    // DHL manager reacts after pitch
    if (npcId === 'ch6_dhl' && this.pitchDone) {
      const chapterDialogue = this.getChapterDialogue();
      const solvedLines = chapterDialogue.npcs['ch6_dhl_solved'];
      if (solvedLines) {
        this.dialogue.show(solvedLines);
        return;
      }
    }

    this.dialogue.show(dialogue);
  }

  protected getObjectiveHint(): string {
    if (this.requiredDone) return 'Head south. Vegas is calling.';
    if (this.npcsTalkedTo.size >= 5) return 'Close the deal. Show the dashboard.';
    if (this.npcsTalkedTo.size >= 2) return 'Keep talking. Build the network.';
    return 'Run the operation. Turn proof into pressure.';
  }

  getMapData(): MapData {
    return operatorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return operatorDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch6_dashboard: {
        title: "Pomaika'i Team Dashboard",
        description: 'Full ops dashboard. Built in one session. Whole team uses it daily.',
        revenue: 'In production',
      },
      ch6_portfolio: {
        title: 'The Portfolio',
        description: 'Websites, AI tools, and operating systems. Self-taught, with real work separated from demos.',
        revenue: 'Delivered',
      },
    };
  }

  // --- Override handleInteractable for custom moments ---
  private laDinnerDone = false;
  private innoutDone = false;

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // ── LA prices. Two ways to sit in the same room. ──
    if (interactable.id === 'ch6_restaurant_menu' && !this.laDinnerDone) {
      this.laDinnerDone = true;
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The menu in the window. $85 a plate. JP used to live on $85 a week.' },
      ], () => {
        this.showPostChoiceStyle('Eat here tonight?', 'Bar seat, solo -$85', 'Corner table, for two -$170', () => {
          BalanceSystem.spend(85);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Bar seat. Back to the wall. Old habits keep the good view.' },
            { speaker: 'JP\'s Mind', text: 'Eighty-five dollars and I checked the exits twice. Some math never leaves.' },
          ], () => { this.frozen = false; });
        }, () => {
          BalanceSystem.spend(170);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Corner table. She picks the wine. JP picks the seat facing the door.' },
            { speaker: 'JP\'s Mind', text: 'A hundred seventy on dinner, legal money, taxed and everything. Wild how normal wild feels now.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    GameIntelligence.onInteracted(interactable.id);
    // Client pitch presentation (big_client or client2)
    if (interactable.id === 'ch6_portfolio') {
      Analytics.trackInteraction(interactable.id);
      this.pitchDone = true;
      this.playClientPitch();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dashboard showcase
    if (interactable.id === 'ch6_dashboard') {
      Analytics.trackInteraction(interactable.id);
      this.dashboardDone = true;
      this.playDashboardShowcase();
      this.interactions.consume(interactable.id);
      return;
    }

    // The equal moment -- the required interaction
    if (interactable.id === 'ch6_equal_moment') {
      Analytics.trackInteraction(interactable.id);
      SoundEffects.achievementUnlock();
      this.playEqualMoment();
      this.interactions.consume(interactable.id);
      return;
    }

    // Food truck purchase
    if (interactable.id === 'ch6_food_truck_menu') {
      Analytics.trackInteraction(interactable.id);
      this.playPurchaseMenu('STREET TACOS', [
        { name: 'Asada Tacos (2)', price: '$8', cost: 8, color: '#c8a040' },
        { name: 'Al Pastor (2)', price: '$8', cost: 8, color: '#d06030' },
        { name: 'Birria Quesadilla', price: '$12', cost: 12, color: '#b84020' },
        { name: 'Horchata', price: '$4', cost: 4, color: '#f0e8d0' },
      ], [
        'Best tacos in LA. Twice a week minimum.',
        'The vendor knows JP by name now.',
      ]);
      return;
    }

    // C8 Corvette — big purchase moment
    if (interactable.id === 'ch6_corvette' && this.innoutDone) {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'The C8 still smells like grilled onions. No regrets. Zero.' },
      ], () => { this.frozen = false; });
      return;
    }
    if (interactable.id === 'ch6_corvette' && !this.innoutDone) {
      this.innoutDone = true;
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: '2 AM. Deliveries sent. The C8 idling in an empty lot.' },
        { speaker: 'JP\'s Mind', text: 'There is exactly one correct move right now.' },
      ], () => {
        this.showPostChoiceStyle('You know what it is.', 'In-N-Out run -$12', 'Head home', () => {
          BalanceSystem.spend(12);
          MoodSystem.setMood('vibing', 40);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Double-double animal style, fries well-done, in a half-million-dollar drive-thru line at 2 AM.' },
            { speaker: 'Narrator', text: 'The $85 spot was dinner. THIS is eating.' },
            { speaker: 'JP\'s Mind', text: 'Twelve dollars. The C8 will smell like grilled onions for two days. Worth every single day.' },
          ], () => { this.frozen = false; });
        }, () => {
          this.dialogue.show([
            { speaker: 'JP\'s Mind', text: 'Discipline. Straight home.' },
            { speaker: 'Narrator', text: 'He thought about the double-double the entire drive.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }
    if (interactable.id === 'ch6_corvette') {
      Analytics.trackInteraction(interactable.id);
      SoundEffects.moneyRain();
      this.playCorvetteScene();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch6_steak_dinner') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Steak dinner. Downtown LA. White tablecloth.' },
        { speaker: 'Narrator', text: 'Nobody in this room knows how recent the ramen was. Good.' },
        { speaker: 'Malachi', text: 'Order whatever you want. It\'s on the company.' },
        { speaker: 'JP\'s Mind', text: '"On the company." That means I built something worth paying for.' },
        { speaker: 'JP', text: 'I\'ll take the ribeye.' },
        { speaker: 'Malachi', text: 'Good man.' },
      ], () => {
        InventorySystem.addItem('steak-dinner', 1);
        MoodSystem.setMood('vibing', 60);
        this.frozen = false;
      });
      return;
    }

    // Homeless man — give $20
    if (interactable.id === 'ch6_homeless') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch6_homeless'];
      if (lines) {
        this.dialogue.show(lines, () => {
          InventorySystem.addItem('receipt', 1);
          BalanceSystem.spend(20);
          MoodSystem.changeMorale(10);
          this.frozen = false;
        });
      } else {
        this.frozen = false;
      }
      return;
    }

    if (interactable.id === 'ch6_mirror') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      // Dim overlay for the moment
      const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
        .setScrollFactor(0).setDepth(300);
      this.tweens.add({ targets: dim, alpha: 0.4, duration: 800 });
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP catches his reflection in the office window.' },
        { speaker: 'Narrator', text: 'Button-down shirt. Clean shoes. Laptop bag.' },
        { speaker: 'JP\'s Mind', text: 'I don\'t recognize this person.' },
        { speaker: 'JP\'s Mind', text: 'That\'s a good thing.' },
        { speaker: 'Narrator', text: 'He straightens his collar. Keeps walking.' },
      ], () => {
        MoodSystem.changeMorale(10);
        this.tweens.add({ targets: dim, alpha: 0, duration: 600, onComplete: () => { dim.destroy(); this.frozen = false; } });
      });
      return;
    }

    if (interactable.id === 'ch6_slack') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Slack notifications. 47 unread. 3 channels blowing up.' },
        { speaker: 'Narrator', text: '"@JP can you review this?" "@JP client wants changes" "@JP meeting at 4"' },
        { speaker: 'JP\'s Mind', text: 'People need me now. That used to be a burden.' },
        { speaker: 'JP\'s Mind', text: 'Now it\'s proof.' },
      ], () => { this.frozen = false; });
      return;
    }

    if (interactable.id === 'ch6_gym_weights') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'LA Fitness. JP racks the 225.' },
        { speaker: 'Narrator', text: 'Same routine he started in jail. Never stopped.' },
        { speaker: 'JP\'s Mind', text: 'Body, mind, business. All three. Every day.' },
        { speaker: 'JP\'s Mind', text: 'The guys in jail would be proud.' },
      ], () => {
        MoodSystem.setMood('locked_in', 45);
        this.frozen = false;
      });
      return;
    }

    // JP\'s phone — full apps menu
    if (interactable.id === 'ch6_phone') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      // The scope-creeper never stops creeping — first phone check only
      const vacavilleReturn: DialogueLine[] = this.vacavilleTexted ? [] : [
        { speaker: 'Narrator', text: 'Text from Vacaville Appliance.' },
        { speaker: 'Vacaville Appliance', text: 'Hey! Site\'s crushing it. Real quick — can we add financing applications? Small thing probably.' },
        { speaker: 'JP\'s Mind', text: 'Two years later. Still "one small thing."' },
        { speaker: 'JP\'s Mind', text: 'Good client though. Scope doc goes out tomorrow.' },
      ];
      // Gerald, two years later, still circling — second phone check only
      const geraldReturn: DialogueLine[] = (this.vacavilleTexted && !this.geraldTexted) ? [
        { speaker: 'Narrator', text: 'Also: Gerald.' },
        { speaker: 'Gerald', text: 'JP! Big news. My cousin\'s FINALLY freed up. Q3 we align for real. The vision lives!' },
        { speaker: 'JP\'s Mind', text: 'Two years. Same vision. Same cousin. Still circling.' },
        { speaker: 'JP\'s Mind', text: 'Some people never land the plane. You just stop waiting at the airport.' },
      ] : [];
      if (this.vacavilleTexted) this.geraldTexted = true;
      this.vacavilleTexted = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP pulls out his phone. Battery at 87%. 14 notifications.' },
        ...vacavilleReturn,
        ...geraldReturn,
        { speaker: 'JP\'s Mind', text: 'Let me check on a few things.' },
      ], () => {
        this.showPhoneApps();
      });
      return;
    }

    // Office computer — apps menu
    if (interactable.id === 'ch6_computer') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP sits down at the workstation. Three monitors. Dark mode everything.' },
        { speaker: 'JP\'s Mind', text: 'Empire runs from right here.' },
      ], () => {
        this.showComputerApps();
      });
      return;
    }

    // Everything else goes to base handler
    super.handleInteractable(interactable);
  }

  // ─── PURCHASE MENU ─────────────────────────────────────────────────
  private playPurchaseMenu(
    title: string,
    items: { name: string; price: string; cost: number; color: string }[],
    afterLines: string[]
  ) {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let selectedIndex = 0;

    // Dark overlay
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // Menu board
    const menuW = 400;
    const menuH = 100 + items.length * 50;
    const menuBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, menuW, menuH, 0x1a1a2a)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(2, 0xf0c040);
    objects.push(menuBg);

    // Title
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - menuH / 2 + 25, title, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(titleText);

    // Menu items
    const itemTexts: Phaser.GameObjects.Text[] = [];
    const priceTexts: Phaser.GameObjects.Text[] = [];
    const dots: Phaser.GameObjects.Arc[] = [];
    const startY = GAME_HEIGHT / 2 - menuH / 2 + 65;

    for (let i = 0; i < items.length; i++) {
      const y = startY + i * 44;
      const dot = this.add.circle(GAME_WIDTH / 2 - menuW / 2 + 30, y + 6, 5, parseInt(items[i].color.replace('#', '0x')))
        .setScrollFactor(0).setDepth(302);
      objects.push(dot); dots.push(dot);

      const name = this.add.text(GAME_WIDTH / 2 - menuW / 2 + 50, y, items[i].name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
      }).setScrollFactor(0).setDepth(302);
      objects.push(name); itemTexts.push(name);

      const price = this.add.text(GAME_WIDTH / 2 + menuW / 2 - 30, y, items[i].price, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#aaaaaa',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(302);
      objects.push(price); priceTexts.push(price);
    }

    // Selection arrow
    const arrow = this.add.text(GAME_WIDTH / 2 - menuW / 2 + 15, startY, '>', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(302);
    objects.push(arrow);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + menuH / 2 - 20, 'UP/DOWN to browse  SPACE to buy  ESC to close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666688',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(instr);

    const updateSelection = () => {
      arrow.setY(startY + selectedIndex * 44);
      for (let i = 0; i < itemTexts.length; i++) {
        itemTexts[i].setColor(i === selectedIndex ? '#f0c040' : '#ffffff');
        priceTexts[i].setColor(i === selectedIndex ? '#f0c040' : '#aaaaaa');
      }
    };
    updateSelection();

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const onUp = () => { selectedIndex = Math.max(0, selectedIndex - 1); updateSelection(); };
    const onDown = () => { selectedIndex = Math.min(items.length - 1, selectedIndex + 1); updateSelection(); };
    const onEsc = () => cleanup();
    const onBuy = () => {
      const item = items[selectedIndex];
      // Check balance
      if (!BalanceSystem.canAfford(item.cost)) {
        const noFunds = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + menuH / 2 - 45, "Can\'t afford that rn", {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
        objects.push(noFunds);
        this.tweens.add({ targets: noFunds, alpha: 0, delay: 1000, duration: 300, onComplete: () => noFunds.destroy() });
        return;
      }
      BalanceSystem.spend(item.cost);
      SoundEffects.playCash();
      // Add purchased item to inventory
      const itemId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      InventorySystem.addItem(itemId, 1);
      // Purchase animation
      const purchaseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `${item.name}  ✓`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40c060',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setAlpha(0);
      objects.push(purchaseText);

      // Hide menu items
      menuBg.setAlpha(0.3);
      titleText.setAlpha(0.3);
      for (const t of itemTexts) t.setAlpha(0.2);
      for (const t of priceTexts) t.setAlpha(0.2);
      arrow.setAlpha(0);
      instr.setAlpha(0);

      // Show purchase confirmation
      this.tweens.add({
        targets: purchaseText,
        alpha: 1, scale: 1.1,
        duration: 300,
        yoyo: true, hold: 800,
        onComplete: () => {
          cleanup();
          // Post-purchase dialogue
          this.dialogue.show(
            afterLines.map(text => ({ speaker: 'Narrator', text })),
            () => { this.frozen = false; }
          );
        },
      });

      // Remove input after buy
      upKey.off('down', onUp); downKey.off('down', onDown);
      spaceKey.off('down', onBuy); escKey.off('down', onEsc);
    };

    const cleanup = () => {
      upKey.off('down', onUp); downKey.off('down', onDown);
      spaceKey.off('down', onBuy); escKey.off('down', onEsc);
      for (const obj of objects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
      if (!this.frozen) return; // already handled by buy flow
      this.frozen = false;
    };

    upKey.on('down', onUp);
    downKey.on('down', onDown);
    spaceKey.on('down', onBuy);
    escKey.on('down', onEsc);

    // Touch: tap items to select + buy
    for (let i = 0; i < itemTexts.length; i++) {
      itemTexts[i].setInteractive({ useHandCursor: true });
      itemTexts[i].on('pointerdown', () => { selectedIndex = i; updateSelection(); onBuy(); });
    }
  }

  // ─── C8 CORVETTE PURCHASE SCENE ──────────────────────────────────────
  private playCorvetteScene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // C8 sprite centered, big
    const carSprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'car-corvette-c8')
      .setScale(SCALE * 3).setScrollFactor(0).setDepth(301).setAlpha(0);
    objects.push(carSprite);

    // Fade in car
    this.tweens.add({
      targets: carSprite,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        // Car name
        const nameText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'CORVETTE C8 STINGRAY', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(nameText);

        const specText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'Dark Metallic Green  |  495 HP  |  Mid-Engine', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888899',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(specText);

        this.tweens.add({ targets: [nameText, specText], alpha: 1, duration: 500 });

        // Dialogue sequence
        this.time.delayedCall(2000, () => {
          for (const obj of objects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Dark metallic green. Almost black in the shade. Emerald in the sun.' },
            { speaker: 'Narrator', text: 'The C8 from the saved photos is sitting in front of him now.' },
            { speaker: 'JP\'s Mind', text: 'Not a reward. A reminder.' },
            { speaker: 'JP\'s Mind', text: 'Access changes faster than stability does.' },
          ], () => { this.frozen = false; });
        });
      },
    });
  }

  // ─── CLIENT PITCH PRESENTATION ──────────────────────────────────────
  private playClientPitch() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // White "slide" rectangle
    const slideW = 700;
    const slideH = 380;
    const slide = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, slideW, slideH, 0xffffff)
      .setScrollFactor(0).setDepth(301);
    objects.push(slide);

    // Thin gold border on slide
    const border = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, slideW + 4, slideH + 4)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0xf0c040);
    objects.push(border);

    const slides = [
      { heading: 'The Problem', body: 'Client needs a system that runs\nwithout hand-holding.\nNo dashboards. No visibility.\nJust chaos.' },
      { heading: 'The Solution', body: 'Custom ops dashboard.\nAI-powered workflows.\nTeam Slack integration.\nBuilt in one weekend.' },
      { heading: 'The Result', value: 'DELIVERED', sub: 'Paid. In production. Still asking questions.' },
    ];

    let slideIndex = 0;
    let headingText: Phaser.GameObjects.Text | null = null;
    let bodyText: Phaser.GameObjects.Text | null = null;
    let valueText: Phaser.GameObjects.Text | null = null;
    let subText: Phaser.GameObjects.Text | null = null;

    const showSlide = (index: number) => {
      // Clean previous
      headingText?.destroy();
      bodyText?.destroy();
      valueText?.destroy();
      subText?.destroy();

      const s = slides[index];
      const slideTop = GAME_HEIGHT / 2 - 20 - slideH / 2;

      headingText = this.add.text(GAME_WIDTH / 2, slideTop + 50, s.heading, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '16px',
        color: '#111111',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
      objects.push(headingText);

      this.tweens.add({ targets: headingText, alpha: 1, duration: 400 });

      if (s.body) {
        bodyText = this.add.text(GAME_WIDTH / 2, slideTop + 130, s.body, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#333333',
          align: 'center',
          lineSpacing: 10,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(bodyText);
        this.tweens.add({ targets: bodyText, alpha: 1, duration: 400, delay: 200 });
      }

      if (s.value) {
        valueText = this.add.text(GAME_WIDTH / 2, slideTop + 160, s.value, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '32px',
          color: '#c8a020',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(valueText);
        this.tweens.add({ targets: valueText, alpha: 1, duration: 600, delay: 300 });
      }

      if (s.sub) {
        subText = this.add.text(GAME_WIDTH / 2, slideTop + 220, s.sub, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#555555',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(subText);
        this.tweens.add({ targets: subText, alpha: 1, duration: 400, delay: 500 });
      }
    };

    showSlide(0);

    // Auto-advance slides
    const advanceTimer = this.time.addEvent({
      delay: 3000,
      repeat: 2,
      callback: () => {
        slideIndex++;
        if (slideIndex < slides.length) {
          showSlide(slideIndex);
        } else {
          // All slides done -- show "Deal closed."
          headingText?.destroy();
          bodyText?.destroy();
          valueText?.destroy();
          subText?.destroy();

          const closedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Scope agreed. Work starts Monday.', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#111111',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
          objects.push(closedText);
          SoundEffects.success();

          this.tweens.add({
            targets: closedText,
            alpha: 1,
            duration: 600,
            onComplete: () => {
              this.time.delayedCall(1500, () => {
                // Fade out everything
                this.tweens.add({
                  targets: objects,
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    for (const obj of objects) obj.destroy();
                    // End with narrator line, then the choice JP still wrestles with
                    this.dialogue.show([
                      { speaker: 'Narrator', text: 'The client nods. The next call starts in twenty minutes.' },
                      { speaker: 'Narrator', text: 'The launch is live. It\'s genuinely good.' },
                      { speaker: 'JP\'s Mind', text: 'Screenshot\'s already taken. Caption\'s half-written.' },
                    ], () => {
                      this.showPostChoice();
                    });
                  },
                });
              });
            },
          });
        }
      },
    });
    objects.push(advanceTimer as unknown as Phaser.GameObjects.GameObject);
  }

  // ─── DASHBOARD SHOWCASE ─────────────────────────────────────────────
  private showPostChoiceStyle(prompt: string, a: string, b: string, onA: () => void, onB: () => void) {
    const cx = GAME_WIDTH / 2; const cy = GAME_HEIGHT / 2;
    const pt = this.add.text(cx, cy - 35, prompt, { fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    const objs: Phaser.GameObjects.GameObject[] = [pt];
    const mk = (x: number, label: string, color: number, cb: () => void) => {
      const bg = this.add.rectangle(x, cy + 10, 250, 42, color).setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
      const tx = this.add.text(x, cy + 10, label, { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
      bg.on('pointerdown', () => { cleanup(); cb(); });
      objs.push(bg, tx);
    };
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const cleanup = () => { objs.forEach(o => o.destroy()); spaceKey.off('down', onSpace); nKey.off('down', onN); };
    const onSpace = () => { cleanup(); onA(); };
    const onN = () => { cleanup(); onB(); };
    mk(cx - 150, a, 0x30598e, onA);
    mk(cx + 150, b, 0x8a5a30, onB);
    spaceKey.on('down', onSpace);
    nKey.on('down', onN);
  }

  // The launch nobody saw — JP's real pattern: wins stay in the drafts.
  private showPostChoice() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const promptText = this.add.text(cx, cy - 35, 'Post it?', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const yesBg = this.add.rectangle(cx - 90, cy + 10, 150, 40, 0x30a040)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(cx - 90, cy + 10, 'Post it', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    const noBg = this.add.rectangle(cx + 90, cy + 10, 150, 40, 0xa03030)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const noText = this.add.text(cx + 90, cy + 10, 'Keep it moving', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const cleanup = () => {
      promptText.destroy(); yesBg.destroy(); yesText.destroy(); noBg.destroy(); noText.destroy();
      spaceKey.off('down', onYes); nKey.off('down', onNo);
    };
    const onYes = () => {
      cleanup();
      ChoiceLedger.record('post_the_win', 'Posted it');
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Posted. No caption gymnastics. Just the work.' },
        { speaker: 'JP\'s Mind', text: 'Let them see it.' },
      ], () => { this.frozen = false; });
    };
    const onNo = () => {
      cleanup();
      ChoiceLedger.record('post_the_win', 'Kept it quiet');
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The draft stays a draft. The phone goes face-down.' },
        { speaker: 'JP\'s Mind', text: 'The work speaks. Eventually. To somebody.' },
      ], () => { this.frozen = false; });
    };
    yesBg.on('pointerdown', onYes);
    noBg.on('pointerdown', onNo);
    spaceKey.on('down', onYes);
    nKey.on('down', onNo);
  }

  private playDashboardShowcase() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // Green-bordered terminal
    const termW = 640;
    const termH = 360;
    const termBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x0a0a0a)
      .setScrollFactor(0).setDepth(301);
    objects.push(termBg);

    const termBorder = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW + 4, termH + 4)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x00ff66);
    objects.push(termBorder);

    // Terminal header
    const headerBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 16, termW, 32, 0x0d1a0d)
      .setScrollFactor(0).setDepth(302);
    objects.push(headerBar);

    const headerText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 16, "POMAIKA'I OPS DASHBOARD", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#00ff66',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(headerText);

    // Stats that count up
    const stats = [
      { label: 'Open Projects', target: 12, suffix: '', prefix: '' },
      { label: 'Unread Messages', target: 47, suffix: '', prefix: '' },
      { label: 'Invoices Pending', target: 3, suffix: '', prefix: '' },
    ];

    const startY = GAME_HEIGHT / 2 - termH / 2 + 80;
    const statTexts: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const y = startY + i * 80;

      // Label
      const label = this.add.text(GAME_WIDTH / 2 - 200, y, stat.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#00cc55',
      }).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(label);

      // Value (starts at 0)
      const valueStr = `${stat.prefix || ''}0${stat.suffix}`;
      const valueObj = this.add.text(GAME_WIDTH / 2 + 160, y, valueStr, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: '#00ff66',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(valueObj);
      statTexts.push(valueObj);

      // Dots between label and value
      const dots = this.add.text(GAME_WIDTH / 2 - 10, y + 4, '..............', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#005522',
      }).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(dots);

      // Stagger the reveal of each stat row
      const delay = i * 600;
      this.tweens.add({ targets: [label, valueObj, dots], alpha: 1, duration: 300, delay });

      // Count-up animation
      const counter = { value: 0 };
      this.tweens.add({
        targets: counter,
        value: stat.target,
        duration: 1500,
        delay: delay + 300,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          const v = Math.round(counter.value);
          valueObj.setText(`${stat.prefix || ''}${v}${stat.suffix}`);
        },
      });
    }

    // After all counters finish, show Malachi\'s line
    const totalDuration = (stats.length - 1) * 600 + 300 + 1500 + 800;
    this.time.delayedCall(totalDuration, () => {
      // Fade out the dashboard
      this.tweens.add({
        targets: objects,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          for (const obj of objects) obj.destroy();
          this.dialogue.show([
            { speaker: 'Malachi', text: 'This is what I needed. You built this in one session?' },
          ], () => { this.frozen = false; });
        },
      });
    });
  }

  // ─── PHONE APPS MENU ─────────────────────────────────────────────────
  private showPhoneApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Phone body — dark with notch
    const phoneBg = this.add.rectangle(cx, cy, 240, 370, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const phoneBorder = this.add.rectangle(cx, cy, 242, 372, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);
    // Notch
    const notch = this.add.rectangle(cx, cy - 177, 60, 8, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);
    // Time display
    const timeText = this.add.text(cx, cy - 155, '3:14 PM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['DMs', 'Casino', 'Crypto', 'Close'];
    const appColors = [0x2a4a2a, 0x0a3a1a, 0x1a2a4a, 0x333344];
    const hoverColors = [0x3a6a3a, 0x1a5a2a, 0x2a4a6a, 0x555566];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 80 + i * 52;
      const btn = this.add.rectangle(cx, y, 200, 38, appColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const isCasino = app === 'Casino';
      const isCrypto = app === 'Crypto';
      const labelColor = isCasino ? '#f0c040' : isCrypto ? '#40c0f0' : '#ffffff';
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColors[i]));
      btn.on('pointerout', () => btn.setFillStyle(appColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'DMs') DMSystem.openDMs(this, (l: DialogueLine[], cb?: () => void) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else if (app === 'Crypto') this.showCryptoPortfolio(() => this.showPhoneApps());
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
        if (i === 0) DMSystem.openDMs(this, (l: DialogueLine[], cb?: () => void) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (i === 1) CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else if (i === 2) this.showCryptoPortfolio(() => this.showPhoneApps());
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── COMPUTER APPS MENU ──────────────────────────────────────────────
  private showComputerApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Monitor body — lighter, wider than phone
    const monitorBg = this.add.rectangle(cx, cy, 500, 320, 0x1a1a2a)
      .setScrollFactor(0).setDepth(300);
    const monitorBorder = this.add.rectangle(cx, cy, 504, 324, 0x444466, 0)
      .setStrokeStyle(2, 0x444466)
      .setScrollFactor(0).setDepth(299);
    // Monitor stand
    const stand = this.add.rectangle(cx, cy + 170, 80, 12, 0x333344)
      .setScrollFactor(0).setDepth(299);
    // Title bar
    const titleBar = this.add.rectangle(cx, cy - 148, 500, 24, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);
    const titleText = this.add.text(cx, cy - 148, 'JDLO WORKSTATION', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    // Dot indicators (red/yellow/green)
    this.add.circle(cx - 230, cy - 148, 4, 0xff4444).setScrollFactor(0).setDepth(302);
    this.add.circle(cx - 218, cy - 148, 4, 0xf0c040).setScrollFactor(0).setDepth(302);
    this.add.circle(cx - 206, cy - 148, 4, 0x40c060).setScrollFactor(0).setDepth(302);

    const apps = ['Crypto', 'Casino', 'Close'];
    const appColors = [0x1a2a4a, 0x0a3a1a, 0x333344];
    const hoverColors = [0x2a4a6a, 0x1a5a2a, 0x555566];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const x = cx - 140 + i * 150;
      const y = cy + 20;
      const btn = this.add.rectangle(x, y, 120, 80, appColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const isCasino = app === 'Casino';
      const isCrypto = app === 'Crypto';
      const labelColor = isCasino ? '#f0c040' : isCrypto ? '#40c0f0' : '#ffffff';
      const label = this.add.text(x, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColors[i]));
      btn.on('pointerout', () => btn.setFillStyle(appColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'Crypto') this.showCryptoPortfolio(() => this.showComputerApps());
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      });

      buttons.push(btn);
      labels.push(label);
    });

    const cleanup = () => {
      monitorBg.destroy(); monitorBorder.destroy(); stand.destroy();
      titleBar.destroy(); titleText.destroy();
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
        if (i === 0) this.showCryptoPortfolio(() => this.showComputerApps());
        else if (i === 1) CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── CRYPTO PORTFOLIO ────────────────────────────────────────────────
  private showCryptoPortfolio(onBack: () => void) {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    const bg = this.add.rectangle(cx, cy, 300, 340, 0x0a0a1a)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);
    const border = this.add.rectangle(cx, cy, 302, 342, 0x40c0f0, 0)
      .setStrokeStyle(1, 0x40c0f0)
      .setScrollFactor(0).setDepth(299);
    objects.push(border);

    // Header
    const header = this.add.text(cx, cy - 150, 'PORTFOLIO', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#40c0f0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(header);

    // Total
    const totalLabel = this.add.text(cx, cy - 120, 'Total Value', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666688',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(totalLabel);

    const totalValue = this.add.text(cx, cy - 100, '$1,204.55', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40f080',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(totalValue);

    const changeText = this.add.text(cx, cy - 80, '+$41.02 (3.5%) — small on purpose', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#40f080',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(changeText);

    // Holdings — modest by design. He learned that lesson already.
    const holdings = [
      { name: 'BTC', amount: '0.012', value: '$780', change: '+2.1%', color: '#f0a020' },
      { name: 'SOL', amount: '4.2',  value: '$310', change: '+6.0%', color: '#00d18c' },
      { name: 'ETH', amount: '0.04', value: '$114', change: '-1.2%', color: '#627eea' },
    ];

    holdings.forEach((h, i) => {
      const y = cy - 40 + i * 44;
      const nameT = this.add.text(cx - 120, y, h.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: h.color,
      }).setScrollFactor(0).setDepth(301);
      objects.push(nameT);

      const amountT = this.add.text(cx - 120, y + 16, h.amount, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#555577',
      }).setScrollFactor(0).setDepth(301);
      objects.push(amountT);

      const valueT = this.add.text(cx + 120, y, h.value, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(301);
      objects.push(valueT);

      const changeT = this.add.text(cx + 120, y + 16, h.change, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px',
        color: h.change.startsWith('-') ? '#ff4444' : '#40f080',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(301);
      objects.push(changeT);
    });

    // Back button
    const backBtn = this.add.text(cx, cy + 150, '[ BACK ]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#666688',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301)
      .setInteractive({ useHandCursor: true });
    objects.push(backBtn);

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#666688'));

    const close = () => {
      for (const obj of objects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
      onBack();
    };

    backBtn.on('pointerdown', close);

    // ESC to go back
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const onEsc = () => { escKey.off('down', onEsc); close(); };
    escKey.on('down', onEsc);
  }

  // ─── EQUAL MOMENT (Required Interaction) ────────────────────────────
  private playEqualMoment() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dim the screen
    const dimOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(300);
    objects.push(dimOverlay);

    this.tweens.add({
      targets: dimOverlay,
      alpha: 0.6,
      duration: 800,
      onComplete: () => {
        // The moment is about being taken seriously, not repeating Caymus.
        this.dialogue.show([
          { speaker: 'Narrator', text: 'For once, nobody asks where he went to school.' },
        ], () => {
          // Pause 2 seconds
          this.time.delayedCall(2000, () => {
            // Line 2
            this.dialogue.show([
              { speaker: 'Narrator', text: 'They ask whether the system can handle the pressure.' },
            ], () => {
              // Pause 1.5 seconds
              this.time.delayedCall(1500, () => {
                // Line 3
                this.dialogue.show([
                  { speaker: 'Narrator', text: 'Then they wait for his answer.' },
                ], () => {
                  // Mark required done
                  this.requiredDone = true;

                  // Fade dim back out
                  this.tweens.add({
                    targets: dimOverlay,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => {
                      for (const obj of objects) obj.destroy();
                      this.frozen = false;
                    },
                  });
                });
              });
            });
          });
        });
      },
    });
  }

  protected onPlayerMove(tileX: number, tileY: number): void {
    // Hidden room — behind the restaurant alley
    if (tileX === 1 && tileY === 24 && !this.hiddenRoomFound) {
      this.hiddenRoomFound = true;
      this.frozen = true;

      try { localStorage.setItem('jdlo_hidden_room_found', 'true'); } catch {}

      // Reveal the room
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2;

      const dimOverlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
        .setScrollFactor(0).setDepth(300);
      this.tweens.add({ targets: dimOverlay, alpha: 0.5, duration: 600 });

      // Computer screen visual
      const screenBg = this.add.rectangle(cx, cy - 20, 200, 120, 0x111111)
        .setScrollFactor(0).setDepth(301);
      const screenGlow = this.add.rectangle(cx, cy - 20, 190, 110, 0x1a1a2e)
        .setScrollFactor(0).setDepth(302);
      // Browser mockup showing jdlo.site
      const urlBar = this.add.rectangle(cx, cy - 68, 180, 14, 0x333344)
        .setScrollFactor(0).setDepth(303);
      const urlText = this.add.text(cx, cy - 68, 'jdlo.site', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#80c0ff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(304);

      // Site content mockup
      const siteTitle = this.add.text(cx, cy - 40, 'JDLO', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
      const siteSub = this.add.text(cx, cy - 20, 'Websites. AI. Systems.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaacc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
      const siteTagline = this.add.text(cx, cy, 'Built different.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666688',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303);

      const objects = [dimOverlay, screenBg, screenGlow, urlBar, urlText, siteTitle, siteSub, siteTagline];

      this.time.delayedCall(1500, () => {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'A small room. Barely fits a desk. One laptop.' },
          { speaker: 'Narrator', text: 'The screen shows jdlo.site. His site. The first thing he ever built.' },
          { speaker: 'JP', text: 'This is where it all started. A laptop and a dream.' },
          { speaker: 'JP', text: 'If you\'re playing this game, I built it for you.' },
          { speaker: 'JP', text: 'No fancy tools. No team. Just Claude and stubbornness.' },
          { speaker: 'Narrator', text: 'JP smiles. Closes the laptop. Walks out.' },
        ], () => {
          for (const obj of objects) {
            if (obj.active) this.tweens.add({ targets: obj, alpha: 0, duration: 400, onComplete: () => obj.destroy() });
          }
          this.time.delayedCall(500, () => { this.frozen = false; });
        });
      });
    }
  }

}
