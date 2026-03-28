import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, TILE_SIZE, SCALED_TILE } from '../config';
import { Analytics } from '../systems/Analytics';
import { BalanceSystem } from '../systems/BalanceSystem';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';

export class OperatorScene extends BaseChapterScene {
  private npcsTalkedTo = new Set<string>();
  private dashboardDone = false;
  private pitchDone = false;
  private clockText?: Phaser.GameObjects.Text;
  private dayNightOverlay?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 7: Operator Mode';
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

    // JP has money by Ch7 — seed balance if not already set
    if (BalanceSystem.getBalance() < 2550) {
      BalanceSystem.earn(2550); // $2,550 earned through Ch6 clients
    }

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

    // DHL client — paces near his office (row 12, cols 26-33)
    patrolX('ch6_dhl', 26, 33, 5500, 2500);

    // Gym bro — moves between equipment (col 5, rows 38-41)
    patrolY('ch6_gym_bro', 38, 41, 4500, 2000);

    // Doorman — patrols highrise entrance (row 42, cols 27-33)
    patrolX('ch6_doorman', 27, 33, 7000, 4000);

    // Valet — walks near the cars (row 51, cols 17-25)
    patrolX('ch6_valet', 17, 25, 5000, 3000);
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

    // Malachi impressed if you've talked to 5+ people
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
    return 'Run the LA operation. Talk to everyone, then head south to Vegas.';
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
        revenue: 'COO',
      },
      ch6_portfolio: {
        title: 'The Portfolio',
        description: '6+ clients. Websites, AI systems, sales ops. All self-taught in 5 months.',
        revenue: '$10K+/mo',
      },
    };
  }

  // --- Override handleInteractable for custom moments ---
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
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
    if (interactable.id === 'ch6_corvette') {
      Analytics.trackInteraction(interactable.id);
      this.playCorvetteScene();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch6_steak_dinner') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Steak dinner. Downtown LA. White tablecloth.' },
        { speaker: 'Narrator', text: 'Six months ago JP was eating ramen in a cell.' },
        { speaker: 'Malachi', text: 'Order whatever you want. It\'s on the company.' },
        { speaker: 'JP\'s Mind', text: '"On the company." That means I built something worth paying for.' },
        { speaker: 'JP', text: 'I\'ll take the ribeye.' },
        { speaker: 'Malachi', text: 'Good man.' },
      ], () => {
        MoodSystem.setMood('vibing', 60);
        this.frozen = false;
      });
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
        const noFunds = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + menuH / 2 - 45, "Can't afford that rn", {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
        objects.push(noFunds);
        this.tweens.add({ targets: noFunds, alpha: 0, delay: 1000, duration: 300, onComplete: () => noFunds.destroy() });
        return;
      }
      BalanceSystem.spend(item.cost);
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
            { speaker: 'Narrator', text: 'The car JP dreamed about while driving a tractor through grape vines.' },
            { speaker: 'JP\'s Mind', text: 'Not a reward. A reminder.' },
            { speaker: 'JP\'s Mind', text: 'Of what happens when you don\'t stop.' },
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
      { heading: 'The Result', value: '$15K/mo', sub: 'Recurring revenue. Zero downtime.' },
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

          const closedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Deal closed.', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#111111',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
          objects.push(closedText);

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
                    // End with narrator line
                    this.dialogue.show([
                      { speaker: 'Narrator', text: 'JP doesn\'t pitch anymore. He presents.' },
                    ], () => { this.frozen = false; });
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
      { label: 'Team Members', target: 8, suffix: '' },
      { label: 'Active Projects', target: 12, suffix: '' },
      { label: 'Monthly Revenue', target: 15, suffix: 'K', prefix: '$' },
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

    // After all counters finish, show Malachi's line
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
        // Line 1: "Six months ago he was on a tractor."
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Six months ago he was on a tractor.' },
        ], () => {
          // Pause 2 seconds
          this.time.delayedCall(2000, () => {
            // Line 2
            this.dialogue.show([
              { speaker: 'Narrator', text: 'Now he sits at tables with people doing $400K a month.' },
            ], () => {
              // Pause 1.5 seconds
              this.time.delayedCall(1500, () => {
                // Line 3
                this.dialogue.show([
                  { speaker: 'Narrator', text: 'And they treat him like an equal.' },
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
}
