import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { EvolutionAnimation } from '../systems/EvolutionAnimation';
import { SCALED_TILE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { GameIntelligence } from '../systems/GameIntelligence';
import { CasinoSystem } from '../systems/CasinoSystem';
import { DMSystem } from '../systems/DMSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { ChoiceLedger } from '../systems/ChoiceLedger';

export class TractorScene extends BaseChapterScene {
  private phoneExaminedFirst = false;
  private tractorPlayed = false;
  private crashCompleted = false;
  private aiDiscovered = false;

  constructor() {
    super({ key: 'TractorScene' });
    this.chapterTitle = 'Chapter 6: Caymus Vineyards';
    this.nextScene = 'ComeUpScene';
    this.requiredInteractionId = 'ch4_crash';
  }

  protected getPlayerTexture(): string {
    return 'player-ch4';
  }

  protected getMusicTrack(): string {
    return 'caymus';
  }

  create() {
    this.crashCompleted = false;
    this.aiDiscovered = false;
    super.create();
    this.createCaymusIdentity();

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch4_tractor',       13, 9,  true);  // required: work
    GameIntelligence.watch('ch4_phone',         8,  9);
    GameIntelligence.watch('ch4_ai_discovery',  6,  5,  true);  // required: discovers AI
    GameIntelligence.watch('ch4_lunch',         3,  9);
    GameIntelligence.watch('ch4_paycheck',      30, 19, true);  // required: story beat
    GameIntelligence.watch('ch4_snake',         30, 14);
    GameIntelligence.attachDebugPanel(this);

    // Tractor at 13,5
    this.addNavArrow(13, 4, 'Tractor');
    // AI discovery / computer area at 5,4 (evolve) and dialogue trigger at 6,4
    this.addNavArrow(5, 3, 'Computer');
    // Exit at 8,21
    this.addNavArrow(8, 20, 'Exit');
  }

  private createCaymusIdentity() {
    const tile = SCALED_TILE;

    // Napa's dry rolling hills behind the green worksite.
    this.add.ellipse(8 * tile, 1.7 * tile, 16 * tile, 3.4 * tile, 0xb9944e, 0.26).setDepth(0.28);
    this.add.ellipse(27 * tile, 1.45 * tile, 23 * tile, 3.0 * tile, 0xc8a45c, 0.22).setDepth(0.28);

    // Winery identity: cream stucco, dark red fascia, and a restrained mark.
    this.add.rectangle(7 * tile, 3.45 * tile, 8 * tile, 22, 0xe8ddc8).setDepth(1.35);
    this.add.rectangle(7 * tile, 3.22 * tile, 8.2 * tile, 11, 0x6d2523).setDepth(1.45);
    this.add.text(7 * tile, 3.45 * tile, 'CAYMUS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#5a1f1d',
    }).setOrigin(0.5).setDepth(1.6);

    // Working office / break room. The room used to be a large cream void;
    // wall-hugging fixtures keep the floor navigable and make every station
    // read as part of a real vineyard shift.
    this.add.rectangle(6.1 * tile, 5.25 * tile, 2.5 * tile, 0.9 * tile, 0x6e553b).setDepth(1.2)
      .setStrokeStyle(4, 0x3a2b20);
    this.add.rectangle(6.1 * tile, 5.25 * tile + 22, 2.2 * tile, 8, 0x342b25).setDepth(1.18);
    this.add.rectangle(5.45 * tile, 5.08 * tile, 42, 28, 0x202a31).setDepth(1.32)
      .setStrokeStyle(3, 0x66767d);
    this.add.rectangle(5.45 * tile, 5.08 * tile, 33, 19, 0x6ca1ad).setDepth(1.34);
    this.add.rectangle(6.55 * tile, 5.13 * tile, 48, 12, 0x4b4b45).setDepth(1.32);
    for (const x of [4.15, 4.65]) {
      this.add.rectangle(x * tile, 4.85 * tile, 0.42 * tile, 1.65 * tile, 0x667176).setDepth(1.26)
        .setStrokeStyle(3, 0x333b3e);
      this.add.rectangle(x * tile, 4.55 * tile, 14, 4, 0x30383b).setDepth(1.28);
    }
    this.add.rectangle(8.75 * tile, 4.5 * tile, 1.15 * tile, 0.9 * tile, 0xe1d8bd).setDepth(1.25)
      .setStrokeStyle(3, 0x855d35);
    this.add.text(8.75 * tile, 4.5 * tile, 'SAFETY\nROWS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#5d4632', align: 'center',
    }).setOrigin(0.5).setDepth(1.27);
    this.add.rectangle(9.15 * tile, 6.05 * tile, 42, 50, 0x87735c).setDepth(1.2)
      .setStrokeStyle(3, 0x4b3a2b);
    this.add.rectangle(9.15 * tile, 5.82 * tile, 27, 18, 0x2c3437).setDepth(1.24);
    this.add.circle(9.15 * tile, 6.34 * tile, 8, 0xc6c0ad).setDepth(1.24);

    // Tractor service bay: curb, fuel tank, hose reel, wheel chocks and tools.
    const bayX = 13.5 * tile;
    const bayY = 5.15 * tile;
    this.add.rectangle(bayX, bayY, 3.35 * tile, 3.3 * tile, 0x252b2e, 0.72).setDepth(0.88)
      .setStrokeStyle(7, 0xb6aa82, 0.7);
    this.add.rectangle(12.15 * tile, 3.9 * tile, 0.58 * tile, 1.35 * tile, 0xa9adb0).setDepth(1.2)
      .setStrokeStyle(3, 0x4b5559);
    this.add.circle(12.15 * tile, 3.55 * tile, 18, 0xb9bdbe).setDepth(1.22);
    this.add.circle(14.85 * tile, 4.1 * tile, 24, 0x283238).setDepth(1.2)
      .setStrokeStyle(6, 0x759096);
    this.add.circle(14.85 * tile, 4.1 * tile, 10, 0x111719).setDepth(1.21);
    this.add.rectangle(14.85 * tile, 4.75 * tile, 0.85 * tile, 0.72 * tile, 0xb0602f).setDepth(1.2)
      .setStrokeStyle(3, 0x5b3422);
    for (const x of [12.75, 14.25]) {
      this.add.rectangle(x * tile, 6.35 * tile, 33, 12, 0xd2a423).setDepth(1.18).setAngle(x < 13 ? -18 : 18);
    }

    // Barrel/work room in the outbuilding. Cylinders have hoops and cast
    // shadows, so this no longer reads as another empty square building.
    for (const x of [19, 20, 21]) {
      const bx = x * tile + tile / 2;
      const by = 4.8 * tile;
      this.add.ellipse(bx, by + 10, 46, 18, 0x3b281b, 0.35).setDepth(1.42);
      this.add.ellipse(bx, by, 42, 50, 0x885832).setDepth(1.5);
      this.add.rectangle(bx, by - 12, 42, 4, 0x3f3f3d).setDepth(1.6);
      this.add.rectangle(bx, by + 11, 42, 4, 0x3f3f3d).setDepth(1.6);
      this.add.circle(bx, by, 3, 0x321f18).setDepth(1.62);
    }

    // Trellis wires and Cabernet clusters connect hundreds of repeated vine
    // tiles into long agricultural rows.
    const blocks = [{ left: 3, right: 16 }, { left: 23, right: 37 }];
    for (const row of [12, 14, 16]) {
      for (const block of blocks) {
        const left = block.left * tile + tile / 2;
        const right = block.right * tile + tile / 2;
        this.add.rectangle((left + right) / 2, row * tile + 22, right - left, 3, 0x6c5034)
          .setDepth(1.35);
        for (let x = block.left; x <= block.right; x += 2) {
          const vx = x * tile + tile / 2;
          this.add.rectangle(vx, row * tile + 22, 5, 48, 0x5a422e).setDepth(1.38);
          this.add.circle(vx - 8, row * tile + 12, 6, 0x54325f, 0.9).setDepth(1.52);
          this.add.circle(vx + 6, row * tile + 17, 5, 0x68406e, 0.9).setDepth(1.52);
        }
      }
    }

    // Drip irrigation lines and periodic blue glints at the block edges.
    for (const block of blocks) {
      const left = block.left * tile + tile / 2;
      const right = block.right * tile + tile / 2;
      this.add.rectangle((left + right) / 2, 17.2 * tile, right - left, 4, 0x25343a, 0.9)
        .setDepth(1.25);
      const glint = this.add.circle(right - 15, 17.2 * tile, 5, 0x58b7cf, 0.2).setDepth(1.4);
      this.tweens.add({ targets: glint, alpha: 0.85, duration: 1400, yoyo: true, repeat: -1 });
    }

    // Picking bins, hose manifolds and pallet stacks make the field edges feel
    // operational instead of decorative.
    for (const bin of [{ x: 25.2, y: 10.15 }, { x: 27.0, y: 10.15 }, { x: 31.5, y: 19.2 }]) {
      this.add.rectangle(bin.x * tile, bin.y * tile, 1.45 * tile, 0.78 * tile, 0x6f3b2c).setDepth(1.42)
        .setStrokeStyle(4, 0x3c281f);
      for (const slat of [-0.42, 0, 0.42]) {
        this.add.rectangle((bin.x + slat) * tile, bin.y * tile, 5, 0.7 * tile, 0xb8794b).setDepth(1.44);
      }
    }
    this.add.rectangle(35.4 * tile, 10.1 * tile, 0.9 * tile, 1.1 * tile, 0x9da8a8).setDepth(1.38)
      .setStrokeStyle(4, 0x4b575a);
    this.add.circle(35.4 * tile, 10.1 * tile, 20, 0x2d3b3f).setDepth(1.41)
      .setStrokeStyle(5, 0x68878e);

    // Field signage helps the player read the two vineyard blocks.
    for (const marker of [{ x: 3.2, label: 'BLOCK 4' }, { x: 23.2, label: 'CABERNET' }]) {
      const mx = marker.x * tile;
      const my = 11.15 * tile;
      this.add.rectangle(mx, my, 86, 28, 0x6b4b2d).setDepth(2.2);
      this.add.text(mx, my, marker.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#f1dfb6',
      }).setOrigin(0.5).setDepth(2.3);
    }

    this.createVineyardShiftMotion();
  }

  private createVineyardShiftMotion() {
    const tile = SCALED_TILE;

    // Field hands move inside the rows instead of standing as scenery. They
    // remain non-interactive background crew so Ernesto, Juan and Eliseo keep
    // their authored dialogue and reliable collision positions.
    const rowWorkers = [
      { texture: 'npc_farmer', x: 6.2, fromY: 12.6, toY: 16.2, duration: 7600, delay: 700 },
      { texture: 'npc_jose', x: 28.1, fromY: 16.2, toY: 12.7, duration: 8400, delay: 2600 },
    ];
    rowWorkers.forEach((worker, index) => {
      const sprite = this.add.sprite(worker.x * tile, worker.fromY * tile, worker.texture)
        .setScale(1.62)
        .setDepth(2.42)
        .setAlpha(0.86)
        .setTint(index === 0 ? 0xd7b77c : 0xc49a72);
      if (index === 1) sprite.setFlipX(true);
      this.tweens.add({
        targets: sprite,
        y: worker.toY * tile,
        duration: worker.duration,
        delay: worker.delay,
        hold: 1000,
        yoyo: true,
        repeat: -1,
        repeatDelay: 1600,
        ease: 'Sine.easeInOut',
      });
    });

    // A small crew member makes repeated crate runs along the main work lane.
    // The load and worker share a container so the movement reads as one job.
    const crateRun = this.add.container(23.5 * tile, 9.72 * tile).setDepth(2.48).setAlpha(0.92);
    const carrier = this.add.sprite(-0.55 * tile, 0, 'npc_generic').setScale(1.6).setTint(0xb98b62);
    const crateA = this.add.sprite(0.12 * tile, 5, 'item-storage-box').setScale(1.35).setTint(0x8a5837);
    const crateB = this.add.sprite(0.55 * tile, 5, 'item-storage-box').setScale(1.35).setTint(0x9d6941);
    crateRun.add([carrier, crateA, crateB]);
    this.tweens.add({
      targets: crateRun,
      x: 32.2 * tile,
      duration: 6600,
      hold: 1300,
      yoyo: true,
      repeat: -1,
      repeatDelay: 3600,
      ease: 'Sine.easeInOut',
    });

    // Irrigation catches the light in sequence, making the rows feel active
    // without using oversized water effects that would hide the tile paths.
    for (const [index, x] of [15.2, 20.1, 31.8].entries()) {
      const water = this.add.circle(x * tile, 17.15 * tile, 7, 0x64bfd1, 0.16).setDepth(2.18);
      this.tweens.add({
        targets: water,
        alpha: 0.7,
        scale: 1.45,
        duration: 780,
        delay: index * 540,
        yoyo: true,
        repeat: -1,
        repeatDelay: 2100,
      });
    }
  }

  protected getObjectiveHint(): string {
    if (this.tractorPlayed) return 'Something changed. Check the computer.';
    return 'Ernesto needs you on the tractor.';
  }

  getMapData(): MapData {
    return tractorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return tractorDialogue;
  }

  // Juan shakes head if you looked at phone first
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    if (npcId === 'ch4_coworker' && this.phoneExaminedFirst) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch4_phone_first'];
      if (lines) {
        this.dialogue.show(lines, () => {
          // Then show normal dialogue
          this.dialogue.show(dialogue);
        });
        return;
      }
    }

    // After crash, Ernesto walks over
    if (npcId === 'ch4_boss' && this.tractorPlayed) {
      const ernesto = this.npcs.find(n => n.id === 'ch4_boss');
      if (ernesto) {
        // Ernesto walks toward player
        const targetX = this.player.x + SCALED_TILE;
        this.tweens.add({
          targets: ernesto.sprite,
          x: targetX,
          duration: 800,
          ease: 'Linear',
        });
      }
    }

    this.dialogue.show(dialogue);
  }

  // Override to add tractor mini-game and post-evolution cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    GameIntelligence.onInteracted(interactable.id);
    // Track if phone was examined before tractor
    if (interactable.id === 'ch4_phone' && !this.tractorPlayed) {
      this.phoneExaminedFirst = true;
    }

    // Phone — show story dialogue first, then phone apps on revisit
    if (interactable.id === 'ch4_phone') {
      Analytics.trackInteraction(interactable.id);
      if (interactable.consumed) {
        // Story already seen — go straight to apps
        this.showPhoneApps();
      } else {
        // First time — play story dialogue, then show apps
        const chapterDialogue = this.getChapterDialogue();
        const lines = chapterDialogue.npcs['ch4_phone'];
        if (lines) {
          this.frozen = true;
          this.dialogue.show(lines, () => {
            this.interactions.consume(interactable.id);
            this.frozen = false;
            this.showPhoneApps();
          });
        }
      }
      return;
    }

    if (interactable.id === 'ch4_tractor' || interactable.id === 'ch4_crash') {
      Analytics.trackInteraction(interactable.id);
      this.tractorPlayed = true;
      SoundEffects.playCarDrive();
      this.playTractorMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch4_ai_discovery') {
      Analytics.trackInteraction(interactable.id);
      this.aiDiscovered = true;
      this.updateChapterGate();
      // Let the base class handle it — it uses the grounded discovery scene.
      super.handleInteractable(interactable);
      return;
    }
    if (interactable.id === 'ch4_lunch') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Lunch break. The crew sits under the oak tree.' },
        { speaker: 'Narrator', text: 'Ernesto brought tamales. Juan has a Modelo.' },
        { speaker: 'Ernesto', text: 'Oye, come. Eat.' },
        { speaker: 'JP', text: 'Gracias.' },
        { speaker: 'Juan', text: 'You getting faster on the tractor, güero.' },
        { speaker: 'JP', text: 'Don\'t call me that.' },
        { speaker: 'Juan', text: 'Ha! He\'s learning.' },
        { speaker: 'JP\'s Mind', text: 'These guys are real. No games. Just work and eat.' },
      ], () => {
        InventorySystem.addItem('tamales', 1);
        MoodSystem.setMood('vibing', 60);
        SoundEffects.playPickup();
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch4_paycheck') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Paycheck. Around twenty an hour.' },
        { speaker: 'JP\'s Mind', text: 'Two weeks of work for what I used to make in a night.' },
        { speaker: 'JP\'s Mind', text: 'But this one doesn\'t come with a court date.' },
        { speaker: 'Narrator', text: 'He deposits it. First clean money in a long time.' },
      ], () => {
        InventorySystem.addItem('paycheck', 1);
        MoodSystem.changeMorale(15);
        SoundEffects.playCash();
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch4_sunrise') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Sun coming up over the Napa hills. Golden light on the vines.' },
        { speaker: 'JP\'s Mind', text: 'Everyone at home is still sleeping.' },
        { speaker: 'JP\'s Mind', text: 'Nobody knows I\'m here. Working. Quiet.' },
        { speaker: 'JP\'s Mind', text: 'Maybe quiet is enough.' },
      ], () => { this.frozen = false; });
      return;
    }

    super.handleInteractable(interactable);
  }

  /** Director entry point that follows the same handler as a real interaction. */
  public directorLaunchAIDiscovery() {
    this.directorTriggerTarget('ch4_ai_discovery', 'interaction');
  }

  private updateChapterGate() {
    this.requiredDone = this.crashCompleted && this.aiDiscovered;
  }

  // ─── PHONE APPS (Ch5: DMs + Crypto only — no casino, he's working) ───
  private showPhoneApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const phoneBg = this.add.rectangle(cx, cy, 240, 300, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const phoneBorder = this.add.rectangle(cx, cy, 242, 302, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);
    const notch = this.add.rectangle(cx, cy - 142, 60, 8, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);
    const timeText = this.add.text(cx, cy - 122, '12:31 PM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['DMs', 'Crypto', 'Close'];
    const appColors = [0x3a2a4a, 0x1a0a2a, 0x333344];
    const hoverColors = [0x5a3a6a, 0x3a1a5a, 0x555566];
    const labelColors = ['#ffffff', '#bb66ff', '#ffffff'];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 50 + i * 48;
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
        if (i === 0) DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (i === 1) CasinoSystem.openCrypto(this, () => { this.showPhoneApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  private playTractorMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;
    let crashed = false;

    // --- OVERLAY & UI ---
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Ground fill — earthy brown behind everything
    const ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x5c4a2a, 1)
      .setScrollFactor(0).setDepth(300.5);
    objects.push(ground);

    const title = this.add.text(GAME_WIDTH / 2, 40, 'MOWING THE FIELD', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(title);

    const instructions = this.add.text(GAME_WIDTH / 2, 75, 'UP / DOWN to dodge obstacles!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(instructions);

    // Fade instructions after 3 seconds
    this.time.delayedCall(3000, () => {
      if (instructions && instructions.active) {
        this.tweens.add({ targets: instructions, alpha: 0, duration: 800 });
      }
    });

    // Rows cleared counter (top right)
    let rowsCleared = 0;
    const scoreText = this.add.text(GAME_WIDTH - 30, 40, 'Rows: 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(310);
    objects.push(scoreText);

    // --- VINEYARD ROWS (5 lanes) ---
    // Lanes are the gaps BETWEEN rows. Row lines are visual dividers.
    const rowYPositions = [200, 320, 440, 560, 680];
    // Lane centers sit between row lines (and above first / below last)
    const laneCenters = [140, 260, 380, 500, 620, 740];
    const vineElements: Phaser.GameObjects.Rectangle[] = [];
    const rowLines: Phaser.GameObjects.Rectangle[] = [];

    for (const ry of rowYPositions) {
      const rowLine = this.add.rectangle(GAME_WIDTH / 2, ry, GAME_WIDTH, 12, 0x308030)
        .setScrollFactor(0).setDepth(301);
      objects.push(rowLine);
      rowLines.push(rowLine);

      // Vine posts along the row
      for (let vx = 0; vx < GAME_WIDTH + 160; vx += 70) {
        const vine = this.add.rectangle(vx, ry, 6, 22, 0x206020)
          .setScrollFactor(0).setDepth(301);
        objects.push(vine);
        vineElements.push(vine);
      }
    }

    // --- HEAT SHIMMER (upgrade #1) ---
    const shimmerLines: Phaser.GameObjects.Rectangle[] = [];
    const shimmerBaseY = [260, 400, 550, 700];
    for (let i = 0; i < shimmerBaseY.length; i++) {
      const shimmer = this.add.rectangle(GAME_WIDTH / 2, shimmerBaseY[i], GAME_WIDTH, 2, 0xf0d060)
        .setScrollFactor(0).setDepth(301.5).setAlpha(0.1);
      objects.push(shimmer);
      shimmerLines.push(shimmer);

      // Oscillate each shimmer line up/down with offset phase
      this.tweens.add({
        targets: shimmer,
        y: shimmerBaseY[i] + 5,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 500,
      });
    }

    // --- ERNESTO REACTIONS (upgrade #2) ---
    const ernestoYells = [
      '\u00a1CUIDADO!',
      '\u00a1NO MAMES!',
      '\u00a1A LA VERGA!',
    ];
    // Ernesto text object — reusable, positioned top-left like a boss watching
    const ernestoText = this.add.text(30, 110, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ff8844',
    }).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(ernestoText);
    let hitCount = 0;

    // --- SPEED WARNING (upgrade #3) ---
    const speedWarningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'FASTER!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffaa00',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(speedWarningText);
    let speedWarning35Shown = false;
    let speedWarning45Shown = false;
    let dangerZoneActive = false;

    // --- TRACTOR (bigger: 40x24) ---
    const startLane = 2; // middle lane
    const tractorX = 180;
    let tractorLaneY = laneCenters[startLane];
    const tractor = this.add.rectangle(tractorX, tractorLaneY, 40, 24, 0xd4a020)
      .setScrollFactor(0).setDepth(304);
    objects.push(tractor);

    // Cabin detail
    const cabin = this.add.rectangle(tractorX + 6, tractorLaneY - 4, 14, 14, 0xb8860b)
      .setScrollFactor(0).setDepth(304);
    objects.push(cabin);

    // Wheels (bigger)
    const wheel1 = this.add.circle(tractorX - 14, tractorLaneY + 14, 7, 0x303030)
      .setScrollFactor(0).setDepth(304);
    const wheel2 = this.add.circle(tractorX + 14, tractorLaneY + 14, 7, 0x303030)
      .setScrollFactor(0).setDepth(304);
    objects.push(wheel1, wheel2);

    const syncTractorParts = (y: number) => {
      tractor.y = y;
      cabin.y = y - 4;
      wheel1.y = y + 14;
      wheel2.y = y + 14;
    };

    // --- OBSTACLES ---
    interface Obstacle {
      body: Phaser.GameObjects.Rectangle;
      label?: Phaser.GameObjects.Text;
      type: 'rock' | 'puddle' | 'fence';
      hit: boolean;
    }
    const obstacles: Obstacle[] = [];

    const spawnObstacle = () => {
      if (!active) return;
      const laneIdx = Phaser.Math.Between(0, laneCenters.length - 1);
      const oy = laneCenters[laneIdx];
      const roll = Math.random();
      let type: 'rock' | 'puddle' | 'fence';
      let color: number;
      let w: number;
      let h: number;
      if (roll < 0.4) {
        type = 'rock'; color = 0x7a6552; w = 22; h = 18;
      } else if (roll < 0.75) {
        type = 'puddle'; color = 0x3a6fb5; w = 34; h = 12;
      } else {
        type = 'fence'; color = 0x8b6914; w = 10; h = 30;
      }
      const body = this.add.rectangle(GAME_WIDTH + 60, oy, w, h, color)
        .setScrollFactor(0).setDepth(303);
      objects.push(body);
      obstacles.push({ body, type, hit: false });
    };

    // Spawn obstacles on a timer — every 800-1400ms
    const obstacleTimer = this.time.addEvent({
      delay: 1100,
      callback: () => {
        if (active && !crashed) spawnObstacle();
      },
      loop: true,
    });

    // --- DUST PARTICLES ---
    const dustParticles: { obj: Phaser.GameObjects.Arc; life: number }[] = [];
    let dustTimer = 0;

    // --- GAME STATE ---
    let scrollSpeed = 2;
    let tractorVY = 0;
    let phoneShown = false;
    let bumping = false;
    const startTime = this.time.now;
    let lastScoreTime = 0;
    let lastSpeedTime = 0;

    // Engine vibration
    this.cameras.main.shake(25000, 0.001);

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // "WATCH IT!" flash text (reused)
    const watchItText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'WATCH IT!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(watchItText);

    // --- UPDATE LOOP ---
    const updateHandler = () => {
      if (!active || crashed) return;

      const now = this.time.now;
      const elapsed = (now - startTime) / 1000;

      // --- Speed ramp: +0.3 every 5 seconds ---
      if (elapsed - lastSpeedTime >= 5) {
        scrollSpeed += 0.3;
        lastSpeedTime += 5;
      }

      // --- Speed warnings (upgrade #3) ---
      if (scrollSpeed >= 3.5 && !speedWarning35Shown) {
        speedWarning35Shown = true;
        speedWarningText.setAlpha(1);
        this.tweens.add({
          targets: speedWarningText,
          alpha: 0,
          duration: 1200,
          ease: 'Quad.easeIn',
        });
      }
      if (scrollSpeed >= 4.5 && !speedWarning45Shown) {
        speedWarning45Shown = true;
        speedWarningText.setAlpha(1);
        speedWarningText.setColor('#ff6600');
        this.tweens.add({
          targets: speedWarningText,
          alpha: 0,
          duration: 1200,
          ease: 'Quad.easeIn',
        });
      }
      // Danger zone: red tint on vineyard rows at speed 5+
      if (scrollSpeed >= 5 && !dangerZoneActive) {
        dangerZoneActive = true;
        for (const rl of rowLines) {
          this.tweens.add({
            targets: rl,
            fillColor: 0x803030,
            duration: 1000,
          });
        }
      }

      // --- Rows cleared: +1 every 3 seconds ---
      if (elapsed - lastScoreTime >= 3) {
        rowsCleared++;
        lastScoreTime += 3;
        scoreText.setText(`Rows: ${rowsCleared}`);
        // Pulse the score
        this.tweens.add({
          targets: scoreText,
          scaleX: 1.3, scaleY: 1.3,
          duration: 150,
          yoyo: true,
        });
      }

      // --- Scroll vine elements left ---
      for (const vine of vineElements) {
        vine.x -= scrollSpeed;
        if (vine.x < -40) {
          vine.x += GAME_WIDTH + 200;
        }
      }

      // --- Steer tractor ---
      if (!bumping) {
        if (upKey.isDown) {
          tractorVY = -4;
        } else if (downKey.isDown) {
          tractorVY = 4;
        } else {
          tractorVY *= 0.85;
        }
      }

      tractorLaneY += tractorVY;
      tractorLaneY = Phaser.Math.Clamp(tractorLaneY, laneCenters[0], laneCenters[laneCenters.length - 1]);
      syncTractorParts(tractorLaneY);

      // --- Move obstacles & check collision ---
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.body.x -= scrollSpeed + 1.5;

        // Off screen — remove
        if (obs.body.x < -60) {
          obs.body.destroy();
          if (obs.label) obs.label.destroy();
          obstacles.splice(i, 1);
          continue;
        }

        // Collision check (AABB)
        if (!obs.hit) {
          const dx = Math.abs(obs.body.x - tractor.x);
          const dy = Math.abs(obs.body.y - tractor.y);
          const hw = (obs.body.width + tractor.width) / 2;
          const hh = (obs.body.height + tractor.height) / 2;
          if (dx < hw && dy < hh) {
            obs.hit = true;
            bumping = true;
            hitCount++;

            // Screen shake on bump
            this.cameras.main.shake(200, 0.008);
            SoundEffects.playImpact();

            // Ernesto reaction (upgrade #2) — pick yell based on severity
            const yellIndex = hitCount >= 4 ? 2 : (hitCount >= 2 ? Phaser.Math.Between(0, 1) : 0);
            ernestoText.setText(ernestoYells[yellIndex]);
            ernestoText.setAlpha(1);
            this.tweens.add({
              targets: ernestoText,
              alpha: 0,
              duration: 1200,
              ease: 'Quad.easeOut',
            });

            // Also flash "WATCH IT!" but less prominent now
            watchItText.setAlpha(0.6);
            this.tweens.add({
              targets: watchItText,
              alpha: 0,
              duration: 600,
              ease: 'Quad.easeOut',
            });

            // Bounce tractor back
            const bounceDir = tractor.y < obs.body.y ? -20 : 20;
            this.tweens.add({
              targets: { val: tractorLaneY },
              val: Phaser.Math.Clamp(tractorLaneY + bounceDir, laneCenters[0], laneCenters[laneCenters.length - 1]),
              duration: 200,
              ease: 'Quad.easeOut',
              onUpdate: (_tw: Phaser.Tweens.Tween, target: { val: number }) => {
                tractorLaneY = target.val;
                syncTractorParts(tractorLaneY);
              },
              onComplete: () => { bumping = false; },
            });
          }
        }
      }

      // --- Dust particles ---
      dustTimer += this.game.loop.delta;
      if (dustTimer >= 100) {
        dustTimer = 0;
        const dust = this.add.circle(
          tractorX - 24 + Phaser.Math.Between(-4, 4),
          tractorLaneY + Phaser.Math.Between(-6, 6),
          Phaser.Math.Between(2, 4),
          0x9e8b6e,
        ).setScrollFactor(0).setDepth(302).setAlpha(0.7);
        objects.push(dust);
        dustParticles.push({ obj: dust, life: 400 });
      }
      // Fade dust
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dp = dustParticles[i];
        dp.life -= this.game.loop.delta;
        dp.obj.x -= scrollSpeed * 0.5;
        dp.obj.setAlpha(Math.max(0, dp.life / 400) * 0.7);
        if (dp.life <= 0) {
          dp.obj.destroy();
          dustParticles.splice(i, 1);
        }
      }

      // --- PHONE DISTRACTION at 25 seconds (upgrade #4) ---
      if (elapsed >= 25 && !phoneShown) {
        phoneShown = true;

        // First notification — the tempting one
        const notifBg1 = this.add.rectangle(GAME_WIDTH / 2, -60, 560, 50, 0x1a1a2e, 0.95)
          .setScrollFactor(0).setDepth(312).setStrokeStyle(2, 0x4a4a6a);
        objects.push(notifBg1);

        const notifText1 = this.add.text(GAME_WIDTH / 2, -60, "YouTube: 'How I Made $10K in One Month with AI'", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#e0e0ff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
        objects.push(notifText1);

        // Slide first notification down
        this.tweens.add({
          targets: [notifBg1, notifText1],
          y: 120,
          duration: 600,
          ease: 'Back.easeOut',
        });

        // Second notification 1 second later
        this.time.delayedCall(1000, () => {
          const notifBg2 = this.add.rectangle(GAME_WIDTH / 2, -60, 480, 50, 0x1a1a2e, 0.95)
            .setScrollFactor(0).setDepth(312).setStrokeStyle(2, 0x4a4a6a);
          objects.push(notifBg2);

          const notifText2 = this.add.text(GAME_WIDTH / 2, -60, 'Instagram: @techbro liked your post', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#e0e0ff',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
          objects.push(notifText2);

          this.tweens.add({
            targets: [notifBg2, notifText2],
            y: 178,
            duration: 600,
            ease: 'Back.easeOut',
          });
        });

        // After 2 seconds — internal conflict then phone look
        this.time.delayedCall(2500, () => {
          // Brief internal conflict: "Ignore it..." text
          const ignoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Ignore it...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#aabbaa',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(313).setAlpha(0);
          objects.push(ignoreText);

          this.tweens.add({
            targets: ignoreText,
            alpha: 1,
            duration: 400,
            yoyo: true,
            hold: 800,
            onComplete: () => {
              // NOW JP gives in
              active = false; // player loses control

              // Phone emoji near tractor
              const phoneIcon = this.add.text(tractor.x + 50, tractor.y - 30, '\ud83d\udcf1', {
                fontSize: '28px',
              }).setScrollFactor(0).setDepth(313);
              objects.push(phoneIcon);

              // "JP looked at his phone..." text
              const lookText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'JP looked at his phone...', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#ffcccc',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
              objects.push(lookText);
              ChoiceLedger.record('tractor_phone', 'Looked');

              // Tractor drifts into nearest row
              const nearestRowY = rowYPositions.reduce((a, b) =>
                Math.abs(b - tractorLaneY) < Math.abs(a - tractorLaneY) ? b : a
              );

              this.tweens.add({
                targets: { val: tractorLaneY },
                val: nearestRowY,
                duration: 1200,
                ease: 'Quad.easeIn',
                onUpdate: (_tw: Phaser.Tweens.Tween, target: { val: number }) => {
                  tractorLaneY = target.val;
                  syncTractorParts(tractorLaneY);
                },
                onComplete: () => {
                  crashed = true;

                  // Stop engine vibration
                  this.cameras.main.resetFX();
                  SoundEffects.glassBreak();

                  // RED FLASH
                  const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0.6)
                    .setScrollFactor(0).setDepth(315);
                  objects.push(flash);

                  // Big screen shake
                  this.cameras.main.shake(600, 0.025);

                  // CRUNCH text
                  const crunch = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'CRUNCH!', {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '36px',
                    color: '#ff2222',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(316);
                  objects.push(crunch);

                  // Rows cleared summary
                  const summary = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `${rowsCleared} rows cleared before the crash.`, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '12px',
                    color: '#f0c040',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(316);
                  objects.push(summary);

                  // Fade flash
                  this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 1000,
                  });

                  // After 2.5 seconds, clean up and trigger crash dialogue
                  this.time.delayedCall(2500, () => {
                    // Remove update handler
                    this.events.off('update', updateHandler);

                    // Stop obstacle timer
                    obstacleTimer.destroy();

                    // Remove keyboard listeners
                    this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
                    this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

                    // Clean up all mini-game objects
                    for (const obj of objects) {
                      if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
                    }

                    this.frozen = false;

                    // The chapter only opens after both the crash and AI discovery.
                    this.crashCompleted = true;
                    this.updateChapterGate();
                    const chapterDialogue = this.getChapterDialogue();
                    const crashLines = chapterDialogue.npcs['ch4_crash'];
                    if (crashLines) {
                      this.dialogue.show(crashLines);
                    }
                  });
                },
              });
            },
          });
        });
      }
    };

    this.events.on('update', updateHandler);
  }

}
