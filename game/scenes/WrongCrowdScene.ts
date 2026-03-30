import { BaseChapterScene } from './BaseChapterScene';
import { wrongCrowdMap, MapData } from '../data/maps';
import { wrongCrowdDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, SCALE } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { GameIntelligence } from '../systems/GameIntelligence';
import { CasinoSystem } from '../systems/CasinoSystem';
import { DMSystem } from '../systems/DMSystem';

export class WrongCrowdScene extends BaseChapterScene {
  private raidTriggered = false;
  private interactionCount = 0;
  private tensionOverlays: Phaser.GameObjects.Rectangle[] = [];
  private heartbeatTimer?: Phaser.Time.TimerEvent;
  private heartbeatOverlay?: Phaser.GameObjects.Rectangle;
  private windowLights: Phaser.GameObjects.Rectangle[] = [];
  private dogBarkShown = false;
  private joseGrabbed = false;
  private lookoutWarned = false;
  private buyerNervousStarted = false;
  private unmarkedCarSpawned = false;
  private bedBagsTriggered = false;
  private wasNearBed = false;

  constructor() {
    super({ key: 'WrongCrowdScene' });
    this.chapterTitle = 'Chapter 3: Wrong Crowd';
    this.nextScene = 'CourtScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3-tired';
  }

  protected getMusicTrack(): string {
    return 'wrong-crowd';
  }

  create() {
    super.create();

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch2_grab_weed',   19, 3,  true);  // required: story
    GameIntelligence.watch('ch2_gun',         16, 1);
    GameIntelligence.watch('ch2_phone',       16, 3);
    GameIntelligence.watch('ch2_money_stack', 20, 3);
    GameIntelligence.watch('ch2_pops_missed', 17, 5,  true);  // required: story beat
    GameIntelligence.watch('ch2_car',         18, 13, true);  // required: drives to sale
    GameIntelligence.watch('ch2_sale',        25, 37, true);  // required: gate to ch4
    GameIntelligence.attachDebugPanel(this);

    this.raidTriggered = false;
    this.interactionCount = 0;
    this.dogBarkShown = false;

    // Nighttime tint — dark blue overlay
    this.cameras.main.setBackgroundColor(0x080810);
    const nightOverlay = this.add.rectangle(
      this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 480,
      2000, 2000, 0x101030
    ).setAlpha(0.35).setScrollFactor(0).setDepth(100);

    // Place the BMW 335i sprite
    const carX = 11 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 11 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    this.collisionTiles.add('10,11');
    this.collisionTiles.add('11,11');
    this.collisionTiles.add('12,11');

    // Navigation hints
    this.addHint(11, 8, 'Exit house');
    this.addHint(11, 11, 'Your 335i');
    this.addHint(18, 26, 'Buyer\'s block');

    // --- Night atmosphere: flickering window lights ---
    this.createWindowLights();

    // --- Tension building: edge darkening overlays ---
    this.createTensionOverlays();

    // Unmarked car — foreshadowing the cops
    this.spawnUnmarkedCar();

    // Buyer nervous leg bounce
    this.startBuyerNervous();

    // 3:33 AM wake up cutscene at start
    this.play333Cutscene();
  }

  private spawnUnmarkedCar() {
    // Black sedan on the street, no plates — subtle foreshadowing
    const carX = 30 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 14 * SCALED_TILE + SCALED_TILE / 2;
    const sedan = this.add.rectangle(carX, carY, SCALED_TILE * 2, SCALED_TILE, 0x101018)
      .setDepth(5);
    // Tinted windows
    this.add.rectangle(carX, carY - 6, SCALED_TILE * 1.5, SCALED_TILE * 0.4, 0x1a1a2a)
      .setDepth(6);
    // No headlights — it's just sitting there
    this.collisionTiles.add('29,14');
    this.collisionTiles.add('30,14');
    this.collisionTiles.add('31,14');
    this.unmarkedCarSpawned = true;
  }

  private startBuyerNervous() {
    // Buyer's leg bouncing — subtle nervous tell
    const buyer = this.npcs.find(n => n.id === 'ch2_buyer');
    if (!buyer) return;
    // Start after a delay (buyer is already inside waiting)
    this.time.delayedCall(2000, () => {
      if (!this.scene.isActive()) return;
      this.buyerNervousStarted = true;
      this.tweens.add({
        targets: buyer.sprite,
        y: buyer.sprite.y + 2,
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  /**
   * Flickering yellow window lights in nearby buildings to sell the night atmosphere.
   */
  private createWindowLights() {
    const windowPositions = [
      { x: 8 * SCALED_TILE + 20, y: 0 * SCALED_TILE + 30 },   // house top-left window
      { x: 26 * SCALED_TILE + 10, y: 1 * SCALED_TILE + 20 },   // kitchen area window
      { x: 7 * SCALED_TILE + 40, y: 18 * SCALED_TILE + 10 },   // convenience store window
    ];

    for (const pos of windowPositions) {
      const light = this.add.rectangle(pos.x, pos.y, 12, 10, 0xf0c040)
        .setAlpha(0.5).setDepth(99);
      this.windowLights.push(light);

      // Each window flickers independently with random timing
      this.time.addEvent({
        delay: 600 + Math.random() * 1200,
        loop: true,
        callback: () => {
          const targetAlpha = 0.3 + Math.random() * 0.4;
          this.tweens.add({
            targets: light,
            alpha: targetAlpha,
            duration: 200 + Math.random() * 400,
          });
        },
      });
    }
  }

  /**
   * Four edge overlays that gradually darken as the player interacts with more things.
   * Starts at 0 alpha, reaches 0.2 by the time the deal happens.
   */
  private createTensionOverlays() {
    const thickness = 120;
    const overlayConfigs = [
      // top
      { x: GAME_WIDTH / 2, y: thickness / 2, w: GAME_WIDTH, h: thickness },
      // bottom
      { x: GAME_WIDTH / 2, y: GAME_HEIGHT - thickness / 2, w: GAME_WIDTH, h: thickness },
      // left
      { x: thickness / 2, y: GAME_HEIGHT / 2, w: thickness, h: GAME_HEIGHT },
      // right
      { x: GAME_WIDTH - thickness / 2, y: GAME_HEIGHT / 2, w: thickness, h: GAME_HEIGHT },
    ];

    this.tensionOverlays = [];
    for (const cfg of overlayConfigs) {
      const overlay = this.add.rectangle(cfg.x, cfg.y, cfg.w, cfg.h, 0x000000)
        .setAlpha(0).setScrollFactor(0).setDepth(150);
      this.tensionOverlays.push(overlay);
    }
  }

  /**
   * Called after each interaction to gradually increase edge darkness.
   */
  private increaseTension() {
    this.interactionCount++;
    // ~10 interactions to reach max tension of 0.35
    const targetAlpha = Math.min(0.35, this.interactionCount * 0.04);
    for (const overlay of this.tensionOverlays) {
      this.tweens.add({
        targets: overlay,
        alpha: targetAlpha,
        duration: 800,
      });
    }
  }

  private play333Cutscene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // --- Heartbeat pulse: dark red vignette ---
    this.heartbeatOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x880000
    ).setScrollFactor(0).setDepth(599).setAlpha(0);
    objects.push(this.heartbeatOverlay);

    this.heartbeatTimer = this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        if (this.heartbeatOverlay && this.heartbeatOverlay.active) {
          this.tweens.add({
            targets: this.heartbeatOverlay,
            alpha: 0.15,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut',
          });
        }
      },
    });

    // --- Slow camera zoom for creep effect ---
    this.cameras.main.zoomTo(1.05, 3000);

    // Black screen
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(600).setAlpha(1);
    objects.push(bg);

    // Clock: 3:33 AM
    const clock = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, '3:33 AM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff2020',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);
    objects.push(clock);

    // Fade in clock
    this.tweens.add({
      targets: clock,
      alpha: 1,
      duration: 1000,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        // Bad thoughts sequence
        const thoughts = [
          { text: 'JP wakes up. Can\'t sleep again.', delay: 0 },
          { text: 'Something feels off tonight.', delay: 1500 },
          { text: 'Like something bad is about to happen.', delay: 3000 },
          { text: 'Phone buzzes. It\'s the buyer.\n"You coming or not?"', delay: 4800 },
          { text: '...fuck it.', delay: 6500 },
        ];

        for (const thought of thoughts) {
          const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, thought.text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '13px',
            color: '#888899',
            wordWrap: { width: GAME_WIDTH - 200 },
            align: 'center',
            lineSpacing: 8,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);
          objects.push(t);

          this.tweens.add({
            targets: t,
            alpha: 1,
            duration: 600,
            delay: thought.delay,
            hold: 1200,
            yoyo: true,
          });
        }

        // After all thoughts, stop heartbeat, reset zoom, fade out and start gameplay
        this.time.delayedCall(8500, () => {
          // Stop heartbeat
          if (this.heartbeatTimer) {
            this.heartbeatTimer.remove();
            this.heartbeatTimer = undefined;
          }
          if (this.heartbeatOverlay && this.heartbeatOverlay.active) {
            this.tweens.killTweensOf(this.heartbeatOverlay);
            this.heartbeatOverlay.setAlpha(0);
          }

          // Reset camera zoom
          this.cameras.main.zoomTo(1.0, 800);

          this.tweens.add({
            targets: bg,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              for (const obj of objects) {
                if (obj && obj.active) obj.destroy();
              }
              this.frozen = false;
            },
          });
        });
      },
    });
  }

  private addHint(x: number, y: number, _label: string) {
    const hintX = x * SCALED_TILE + SCALED_TILE / 2;
    const hintY = y * SCALED_TILE + SCALED_TILE / 2 - 20;
    const arrow = this.add.text(hintX, hintY, '\u25bc', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(50).setAlpha(0.6);
    this.tweens.add({
      targets: arrow,
      y: hintY + 8,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  protected getObjectiveHint(): string {
    if (this.raidTriggered) return 'Run.';
    if (this.joseGrabbed) return 'Make the drop. Get out.';
    if (this.interactionCount >= 4) return "It's 3 AM. Something's not right.";
    return 'Grab the weed. Get in the 335i. Make the drop.';
  }

  getMapData(): MapData {
    return wrongCrowdMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    const dialogue = wrongCrowdDialogue;
    dialogue.npcs['ch2_sale'] = [
      { speaker: 'Buyer', text: 'You got that zip?' },
      { speaker: 'JP', text: 'Right here.' },
      { speaker: 'Buyer', text: 'Cool cool. Lemme get a\u2014' },
    ];
    return dialogue;
  }

  // Bags fall from under the bed when JP walks away
  protected onPlayerMove(tileX: number, tileY: number): void {
    // Track if player was near the bed (cols 15-16, rows 1-3)
    const nearBed = tileX >= 15 && tileX <= 16 && tileY >= 1 && tileY <= 3;

    if (nearBed) {
      this.wasNearBed = true;
    } else if (this.wasNearBed && !this.bedBagsTriggered && !this.frozen) {
      // Just walked AWAY from the bed — bags tumble out
      this.bedBagsTriggered = true;
      this.wasNearBed = false;

      const bedX = 15 * SCALED_TILE + SCALED_TILE / 2;
      const bedY = 2 * SCALED_TILE + SCALED_TILE / 2;

      // 2 bags slide out from under the bed
      for (let i = 0; i < 2; i++) {
        const bag = this.add.sprite(bedX + i * 20, bedY - 10, 'item-weed-bag')
          .setScale(SCALE).setDepth(11).setAlpha(0).setAngle(Phaser.Math.Between(-15, 15));

        this.tweens.add({
          targets: bag,
          y: bedY + 30 + i * 20,
          x: bedX - 10 + i * 40,
          alpha: 1,
          duration: 400,
          delay: i * 200,
          ease: 'Bounce.easeOut',
        });
      }

      // JP turns around and shoves them back
      this.time.delayedCall(700, () => {
        if (this.frozen) return;
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Two bags slide out from under the bed.' },
          { speaker: 'JP', text: '...every time.' },
          { speaker: 'Narrator', text: 'He shoves them back under. They don\'t really fit.' },
        ], () => {
          this.frozen = false;
        });
      });
    }
  }

  // Reactive NPC dialogue
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    // Jose grabs JP's arm before he leaves
    if (npcId === 'ch2_homie_door' && !this.joseGrabbed) {
      this.joseGrabbed = true;
      const jose = this.npcs.find(n => n.id === 'ch2_homie_door');

      this.dialogue.show(dialogue, () => {
        // Jose grabs arm — camera shake + extra line
        this.frozen = true;
        this.cameras.main.shake(150, 0.003);

        if (jose) {
          // Jose steps toward player
          this.tweens.add({
            targets: jose.sprite,
            x: this.player.x - SCALED_TILE,
            duration: 300,
            ease: 'Quad.easeOut',
          });
        }

        this.time.delayedCall(400, () => {
          this.dialogue.show([
            { speaker: 'Jose', text: 'Hey.' },
            { speaker: 'Narrator', text: 'He grabs JP\'s arm.' },
            { speaker: 'Jose', text: 'Text me when you\'re back. For real this time.' },
            { speaker: 'Narrator', text: 'His eyes say what his mouth won\'t.' },
          ], () => {
            this.frozen = false;
            // Update Jose's dialogue for future interactions
            if (jose) {
              jose.dialogue = [
                { speaker: 'Jose', text: '...just be careful, bro.' },
              ];
            }
          });
        });
      });
      return;
    }

    // Lookout blocks and warns
    if (npcId === 'ch2_lookout' && !this.lookoutWarned) {
      this.lookoutWarned = true;
      const lookout = this.npcs.find(n => n.id === 'ch2_lookout');

      // Lookout steps closer
      if (lookout) {
        this.tweens.add({
          targets: lookout.sprite,
          x: this.player.x + SCALED_TILE,
          duration: 400,
          ease: 'Quad.easeOut',
        });
      }

      this.dialogue.show([
        { speaker: 'Lookout', text: '...' },
        { speaker: 'Narrator', text: 'He doesn\'t blink. Just stares.' },
        { speaker: 'Lookout', text: 'Straight back. Don\'t look around.' },
        { speaker: 'JP\'s Mind', text: 'Something\'s off. But you\'re already here.' },
      ], () => {
        // Lookout steps back
        if (lookout) {
          const lookoutData = this.getMapData().spawns.npcs.find(n => n.id === 'ch2_lookout');
          if (lookoutData) {
            this.tweens.add({
              targets: lookout.sprite,
              x: lookoutData.x * SCALED_TILE + SCALED_TILE / 2,
              duration: 400,
            });
          }
        }
        // Update lookout dialogue
        if (lookout) {
          lookout.dialogue = [
            { speaker: 'Narrator', text: 'He won\'t look at you now.' },
          ];
        }
      });
      return;
    }

    // Unmarked car interaction (player walks near it)
    if (npcId === 'ch2_corner_guy') {
      // After corner guy dialogue, hint about the car
      this.dialogue.show(dialogue, () => {
        if (this.unmarkedCarSpawned && !this.frozen) {
          this.time.delayedCall(1000, () => {
            if (this.scene.isActive() && !this.frozen) {
              this.dialogue.show([
                { speaker: 'JP\'s Mind', text: 'That black sedan wasn\'t here before.' },
                { speaker: 'JP\'s Mind', text: '...probably nothing.' },
              ]);
            }
          });
        }
      });
      return;
    }

    // Girl crosses the street when she sees JP
    if (npcId === 'ch2_girl_walking') {
      const girl = this.npcs.find(n => n.id === 'ch2_girl_walking');
      if (girl) {
        // She moves away
        this.tweens.add({
          targets: girl.sprite,
          x: girl.sprite.x + SCALED_TILE * 3,
          duration: 1000,
          ease: 'Linear',
        });
      }
      this.dialogue.show(dialogue);
      return;
    }

    // Shadow figure — just stares
    if (npcId === 'ch2_shadow_figure') {
      this.dialogue.show(dialogue, () => {
        this.increaseTension(); // extra tension for this one
        this.increaseTension();
      });
      return;
    }

    // Default
    this.dialogue.show(dialogue);
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    GameIntelligence.onInteracted(interactable.id);
    // Increase tension on every interaction
    this.increaseTension();

    // Tension affects mood — gets more anxious as chapter progresses
    if (this.interactionCount === 4) {
      MoodSystem.setMood('locked_in', 120);
    } else if (this.interactionCount === 8) {
      MoodSystem.setMood('hyped', 60); // adrenaline
    }

    // Gun — pick up (inventory)
    if (interactable.id === 'ch2_gun') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'A piece tucked under the pillow. JP stares at it.' },
        { speaker: 'JP\'s Mind', text: 'When did this become normal?' },
        { speaker: 'Narrator', text: 'He leaves it. Not tonight.' },
      ], () => { this.frozen = false; });
      return;
    }

    // Money stack — pick up (inventory)
    if (interactable.id === 'ch2_money_stack') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Fat stack of hundreds. $20K easy. Rubber-banded tight.' },
        { speaker: 'Narrator', text: 'This stack is bigger than everything else in the room combined.' },
        { speaker: 'JP\'s Mind', text: 'This is what it\'s all for. This right here.' },
        { speaker: 'JP\'s Mind', text: 'Twenty thousand dollars on a desk in a frat house at 3 AM.' },
        { speaker: 'JP\'s Mind', text: 'So why does it feel like nothing?' },
      ], () => { this.frozen = false; });
      return;
    }

    // Pops missed call — emotional gut punch
    if (interactable.id === 'ch2_pops_missed') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Narrator', text: '3 missed calls from Pops. 11:42 PM. 12:15 AM. 1:30 AM.' },
        { speaker: 'Narrator', text: 'One voicemail: "Just checking on you, son. Call me back."' },
        { speaker: 'JP\'s Mind', text: '...' },
        { speaker: 'JP\'s Mind', text: 'He can never know about this.' },
      ], () => {
        MoodSystem.changeMorale(-15);
        this.frozen = false;
      });
      return;
    }

    // Car interaction — driving cutscene (bumps tension extra to compensate for skipped walking)
    if (interactable.id === 'ch2_car') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      // Driving = 4 extra tension bumps (you skipped the walk)
      for (let i = 0; i < 4; i++) {
        this.interactionCount++;
      }
      const targetAlpha = Math.min(0.35, this.interactionCount * 0.04);
      for (const overlay of this.tensionOverlays) {
        this.tweens.add({ targets: overlay, alpha: targetAlpha, duration: 2000 });
      }
      this.playDrivingCutscene();
      return;
    }

    // Closet — bags fall out animation
    if (interactable.id === 'ch2_closet') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);

      // Camera shake — door opens
      this.cameras.main.shake(150, 0.003);

      // Spawn 3 bags that tumble out from closet position
      const closetX = 20 * SCALED_TILE + SCALED_TILE / 2;
      const closetY = 1 * SCALED_TILE + SCALED_TILE / 2;
      const fallingBags: Phaser.GameObjects.Sprite[] = [];

      for (let i = 0; i < 3; i++) {
        const bag = this.add.sprite(closetX, closetY, 'item-weed-bag')
          .setScale(SCALE).setDepth(11).setAlpha(0);

        this.tweens.add({
          targets: bag,
          x: closetX - 20 + i * 30,
          y: closetY + 40 + i * 15,
          alpha: 1,
          angle: Phaser.Math.Between(-30, 30),
          duration: 300,
          delay: i * 150,
          ease: 'Bounce.easeOut',
        });
        fallingBags.push(bag);
      }

      // Show dialogue, then shove bags back
      this.time.delayedCall(800, () => {
        const chapterDialogue = this.getChapterDialogue();
        const lines = chapterDialogue.npcs['ch2_closet'] || [
          { speaker: 'JP', text: 'Shit—' },
        ];
        this.dialogue.show(lines, () => {
          // Shove bags back — they slide back into closet
          for (let i = 0; i < fallingBags.length; i++) {
            this.tweens.add({
              targets: fallingBags[i],
              x: closetX,
              y: closetY,
              alpha: 0,
              angle: 0,
              duration: 250,
              delay: i * 100,
              onComplete: () => fallingBags[i].destroy(),
            });
          }
          // One bag corner still sticks out
          const stickOut = this.add.sprite(closetX + 8, closetY + 10, 'item-weed-bag')
            .setScale(SCALE * 0.6).setDepth(5).setAngle(20);
          this.time.delayedCall(500, () => {
            this.frozen = false;
          });
        });
      });
      return;
    }

    // Weighing minigame — triggered by grabbing the weed
    if (interactable.id === 'ch2_grab_weed') {
      Analytics.trackInteraction(interactable.id);
      this.playWeighingMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Phone — open phone apps (DMs, Casino)
    if (interactable.id === 'ch2_phone') {
      Analytics.trackInteraction(interactable.id);
      this.showPhoneApps();
      return;
    }

    // Computer — crypto trading
    if (interactable.id === 'ch2_computer') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      CasinoSystem.openCrypto(this, () => { this.frozen = false; });
      return;
    }

    if (interactable.id === 'ch2_sale' && !this.raidTriggered) {
      Analytics.trackInteraction(interactable.id);
      this.raidTriggered = true;
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  // ─── PHONE APP MENU ────────────────────────────────────────────────
  private showPhoneApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Phone body
    const phoneBg = this.add.rectangle(cx, cy, 240, 300, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const phoneBorder = this.add.rectangle(cx, cy, 242, 302, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);
    const notch = this.add.rectangle(cx, cy - 142, 60, 8, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);

    const timeText = this.add.text(cx, cy - 120, '3:33 AM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['DMs', 'Casino', 'Close'];
    const appColors = [0x3a2a4a, 0x0a3a1a, 0x333344];
    const hoverColors = [0x5a3a6a, 0x1a5a2a, 0x555566];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 50 + i * 55;
      const btn = this.add.rectangle(cx, y, 200, 40, appColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const isCasino = app === 'Casino';
      const labelColor = isCasino ? '#f0c040' : '#ffffff';
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColors[i]));
      btn.on('pointerout', () => btn.setFillStyle(appColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'DMs') DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
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
        else if (i === 1) CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  private playDrivingCutscene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Track ALL objects for cleanup
      const cutsceneObjects: Phaser.GameObjects.GameObject[] = [];
      const cutsceneTimers: Phaser.Time.TimerEvent[] = [];

      const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x101018)
        .setScrollFactor(0).setDepth(500);
      cutsceneObjects.push(overlay);

      // Road surface
      const road = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, GAME_WIDTH, 80, 0x303038)
        .setScrollFactor(0).setDepth(500);
      cutsceneObjects.push(road);

      // Road lines
      for (let i = 0; i < 8; i++) {
        const line = this.add.rectangle(
          200 + i * 160, GAME_HEIGHT / 2 + 40, 40, 6, 0xf0c040
        ).setScrollFactor(0).setDepth(501);
        cutsceneObjects.push(line);
        this.tweens.add({ targets: line, x: line.x - 160, duration: 400, repeat: -1 });
      }

      // BMW
      const bmwSprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'car-bmw335i')
        .setScale(SCALE).setScrollFactor(0).setDepth(502);
      cutsceneObjects.push(bmwSprite);
      this.tweens.add({ targets: bmwSprite, y: GAME_HEIGHT / 2 + 34, duration: 300, yoyo: true, repeat: -1 });

      // City lights
      for (let i = 0; i < 15; i++) {
        const light = this.add.rectangle(
          Math.random() * GAME_WIDTH,
          GAME_HEIGHT / 2 - 60 - Math.random() * 120,
          3, 4 + Math.random() * 8,
          [0xf0c040, 0x40a0f0, 0xf06040][Math.floor(Math.random() * 3)]
        ).setScrollFactor(0).setDepth(501).setAlpha(0.4);
        cutsceneObjects.push(light);
        this.tweens.add({ targets: light, x: light.x - 300, duration: 800 + Math.random() * 400, repeat: -1 });
      }

      // --- Streetlight pass effect: yellow circles sliding right to left ---
      const streetlightTimer = this.time.addEvent({
        delay: 400,
        repeat: 7, // ~3.2 seconds of lights
        callback: () => {
          const streetlight = this.add.circle(
            GAME_WIDTH + 30,
            40 + Math.random() * 60,
            18, 0xf0c040
          ).setScrollFactor(0).setDepth(504).setAlpha(0.35);
          cutsceneObjects.push(streetlight);
          this.tweens.add({
            targets: streetlight,
            x: -30,
            alpha: 0,
            duration: 1200,
            ease: 'Sine.easeIn',
            onComplete: () => {
              if (streetlight.active) streetlight.destroy();
            },
          });
        },
      });
      cutsceneTimers.push(streetlightTimer);

      // Driving text — extended monologue with tension beats
      const driveLines = [
        { text: 'Driving down the block...', delay: 500, size: '14px', color: '#ffffff' },
        { text: 'Two zips in the jacket. Same routine.', delay: 2000, size: '11px', color: '#aaaacc' },
        { text: 'Pass the park. Pass the school. Everything closed.', delay: 4000, size: '10px', color: '#808090' },
        { text: 'Red light. Nobody else on the road.', delay: 5800, size: '10px', color: '#808090' },
        { text: 'Rearview mirror — that black sedan again.', delay: 7200, size: '11px', color: '#aa6666' },
        { text: '...probably nothing.', delay: 8800, size: '10px', color: '#666677' },
      ];

      for (let i = 0; i < driveLines.length; i++) {
        const line = driveLines[i];
        const lineText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 180 + (i % 3) * 40, line.text, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: line.size,
          color: line.color,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
        cutsceneObjects.push(lineText);

        // Tension beat: brief screen darken before key lines
        if (i === 4) {
          // Rearview mirror moment — extra tension
          const darken = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000
          ).setScrollFactor(0).setDepth(505).setAlpha(0);
          cutsceneObjects.push(darken);
          this.tweens.add({
            targets: darken,
            alpha: 0.4,
            duration: 200,
            delay: line.delay - 600,
            yoyo: true,
            hold: 300,
          });
          // Camera shake when noticing the sedan
          this.time.delayedCall(line.delay, () => {
            this.cameras.main.shake(200, 0.003);
          });
        }

        // Fade in, hold, fade out each line
        this.tweens.add({
          targets: lineText,
          alpha: 1,
          duration: 600,
          delay: line.delay,
          hold: 1400,
          yoyo: true,
        });
      }

      // Unmarked sedan appears in rearview (visual — small dark shape behind BMW)
      this.time.delayedCall(7000, () => {
        const sedan = this.add.rectangle(
          GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 40, 20, 0x0a0a12
        ).setScrollFactor(0).setDepth(501).setAlpha(0);
        cutsceneObjects.push(sedan);
        // Sedan headlights
        const headlightL = this.add.circle(GAME_WIDTH / 2 - 14, GAME_HEIGHT / 2 + 95, 3, 0xf0f0f0, 0)
          .setScrollFactor(0).setDepth(502);
        const headlightR = this.add.circle(GAME_WIDTH / 2 + 14, GAME_HEIGHT / 2 + 95, 3, 0xf0f0f0, 0)
          .setScrollFactor(0).setDepth(502);
        cutsceneObjects.push(headlightL, headlightR);

        this.tweens.add({ targets: [sedan, headlightL, headlightR], alpha: 0.5, duration: 1500 });
      });

      // After 10.5 seconds, clean up EVERYTHING and teleport
      this.time.delayedCall(10500, () => {
        // Kill timers
        for (const timer of cutsceneTimers) {
          timer.remove();
        }
        // Kill all tweens on cutscene objects first
        for (const obj of cutsceneObjects) {
          this.tweens.killTweensOf(obj);
          if (obj.active) obj.destroy();
        }

        // Move player to the buyer's neighborhood (shifted for expanded map)
        this.player.setPosition(
          18 * SCALED_TILE + SCALED_TILE / 2,
          27 * SCALED_TILE + SCALED_TILE / 2
        );
        this.cameras.main.fadeIn(800, 0, 0, 0);
        this.frozen = false;
      });
    });
  }

  // Also trigger raid if player walks into the sale area
  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.raidTriggered) return;

    // --- Dog bark: appears once when player is near the map edge ---
    if (!this.dogBarkShown && this.player) {
      const px = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
      const py = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

      // Trigger when player is outside the house, near the street
      if (py >= 10 && py <= 14 && !this.dogBarkShown) {
        this.dogBarkShown = true;
        const barkX = 2 * SCALED_TILE;
        const barkY = 14 * SCALED_TILE;
        const bark = this.add.text(barkX, barkY, '*bark*', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#665544',
        }).setOrigin(0.5).setDepth(90).setAlpha(0);

        this.tweens.add({
          targets: bark,
          alpha: 0.6,
          duration: 400,
          hold: 1200,
          yoyo: true,
          onComplete: () => {
            if (bark.active) bark.destroy();
          },
        });
      }
    }

    // Check if player is inside the buyer's house (shifted: row 31-33, col 21-25)
    const px2 = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const py2 = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    if (py2 >= 31 && py2 <= 37 && px2 >= 21 && px2 <= 32) {
      this.raidTriggered = true;
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
    }
  }

  private triggerRaid() {
    this.frozen = true;

    // THE SILENCE — 1.5 seconds of nothing before everything breaks
    // Stop all tweens on buyer (leg bounce stops)
    const buyer = this.npcs.find(n => n.id === 'ch2_buyer');
    if (buyer) {
      this.tweens.killTweensOf(buyer.sprite);
    }

    // Brief flash of awareness text
    const awarenessText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, '...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(199).setAlpha(0);

    this.tweens.add({
      targets: awarenessText,
      alpha: 0.6,
      duration: 400,
      hold: 800,
      yoyo: true,
      onComplete: () => {
        awarenessText.destroy();
        // Escape attempt — JP tries to leave but can't
        this.playEscapeAttempt(() => {
          this.executeRaid();
        });
      },
    });
  }

  private executeRaid() {
    // --- Red/blue alternating police flashes on screen edges ---
    const redFlash = this.add.rectangle(
      60, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0xff0000
    ).setScrollFactor(0).setDepth(200).setAlpha(0);
    const blueFlash = this.add.rectangle(
      GAME_WIDTH - 60, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0x0000ff
    ).setScrollFactor(0).setDepth(200).setAlpha(0);

    // Alternate red/blue every 300ms
    let flashState = false;
    const flashTimer = this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        flashState = !flashState;
        if (redFlash.active) redFlash.setAlpha(flashState ? 0.4 : 0);
        if (blueFlash.active) blueFlash.setAlpha(flashState ? 0 : 0.4);
      },
    });

    // --- Camera shake that builds from 0.005 to 0.02 over 2 seconds ---
    this.cameras.main.shake(800, 0.005);
    this.time.delayedCall(800, () => {
      this.cameras.main.shake(600, 0.01);
    });
    this.time.delayedCall(1400, () => {
      this.cameras.main.shake(600, 0.02);
    });

    // --- "FREEZE!" text that slams onto screen (scale 3 -> 1) ---
    this.time.delayedCall(600, () => {
      // Brief black flash behind the text
      const slamBg = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000
      ).setScrollFactor(0).setDepth(201).setAlpha(0);

      this.tweens.add({
        targets: slamBg,
        alpha: 0.6,
        duration: 100,
        yoyo: true,
        hold: 400,
      });

      const freezeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'FREEZE!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setScale(3).setAlpha(0);

      this.tweens.add({
        targets: freezeText,
        scale: 1,
        alpha: 1,
        duration: 250,
        ease: 'Back.easeOut',
        hold: 800,
        onComplete: () => {
          // Now show POLICE! and transition out
          const policeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'POLICE!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#ff4444',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

          this.tweens.add({
            targets: policeText,
            alpha: 1,
            duration: 300,
            hold: 800,
            onComplete: () => {
              // Stop flashing
              flashTimer.remove();
              if (redFlash.active) redFlash.destroy();
              if (blueFlash.active) blueFlash.destroy();

              this.cameras.main.fadeOut(1500, 0, 0, 0);
              this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CourtScene');
              });
            },
          });
        },
      });
    });
  }

  // ─── WEIGHING MINIGAME ──────────────────────────────────────────
  private playWeighingMinigame() {
    this.frozen = true;
    this.increaseTension();
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Scale/table surface
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    objects.push(this.add.rectangle(cx, cy + 40, 500, 300, 0x1a1a20)
      .setScrollFactor(0).setDepth(301));

    // Digital scale
    objects.push(this.add.rectangle(cx, cy - 20, 200, 120, 0x202028)
      .setScrollFactor(0).setDepth(302));
    objects.push(this.add.rectangle(cx, cy - 20, 190, 110, 0x0a0a12)
      .setScrollFactor(0).setDepth(302).setStrokeStyle(1, 0x404050));

    // Scale display
    const scaleDisplay = this.add.text(cx, cy - 40, '0.0g', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#30ff30',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(scaleDisplay);

    // Target weight
    const targetWeight = 28.0; // 1 oz
    const targetText = this.add.text(cx, cy - 70, 'TARGET: 28.0g', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#808090',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(targetText);

    // Title
    objects.push(this.add.text(cx, 80, 'WEIGH IT OUT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Instructions
    const instr = this.add.text(cx, GAME_HEIGHT - 60, 'Hold SPACE to pour. Release at 28.0g.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(instr);

    // Weed pile visual (grows as weight increases)
    const pile = this.add.ellipse(cx, cy - 10, 10, 6, 0x2a6a20, 0.8)
      .setScrollFactor(0).setDepth(303);
    objects.push(pile);

    // State
    let currentWeight = 0;
    let pouring = false;
    let done = false;
    let pourSpeed = 0.15; // grams per frame — starts slow

    // Accuracy meter (bar under scale)
    const barW = 300;
    const barY = cy + 60;
    objects.push(this.add.rectangle(cx, barY, barW, 16, 0x1a1a2a)
      .setScrollFactor(0).setDepth(303));
    // Green zone marker at 28g position
    const targetPos = cx - barW / 2 + (28 / 35) * barW;
    objects.push(this.add.rectangle(targetPos, barY, 4, 20, 0x30ff30, 0.6)
      .setScrollFactor(0).setDepth(304));
    // Fill bar
    const barFill = this.add.rectangle(cx - barW / 2, barY, 0, 12, 0x40c060)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(304);
    objects.push(barFill);

    // Pour particle effect
    const spawnPourParticle = () => {
      const p = this.add.circle(
        cx + Phaser.Math.Between(-20, 20), cy - 80,
        2, 0x3a8a30, 0.7
      ).setScrollFactor(0).setDepth(303);
      objects.push(p);
      this.tweens.add({
        targets: p,
        y: cy - 15,
        x: p.x + Phaser.Math.Between(-10, 10),
        alpha: 0,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    };

    const update = () => {
      if (done) return;

      if (pouring) {
        currentWeight += pourSpeed;
        // Speed increases slightly — harder to be precise
        pourSpeed = Math.min(0.4, pourSpeed + 0.0005);

        // Visual updates
        scaleDisplay.setText(`${currentWeight.toFixed(1)}g`);
        barFill.displayWidth = Math.min(barW, (currentWeight / 35) * barW);
        pile.setScale(1 + currentWeight / 28, 0.6 + currentWeight / 40);

        // Color feedback
        if (currentWeight >= 27.5 && currentWeight <= 28.5) {
          scaleDisplay.setColor('#30ff30'); // green = perfect zone
        } else if (currentWeight > 28.5) {
          scaleDisplay.setColor('#ff4040'); // red = over
          barFill.setFillStyle(0xc04040);
        } else if (currentWeight > 25) {
          scaleDisplay.setColor('#f0f060'); // yellow = close
        }

        // Pour particles
        if (Math.random() > 0.5) spawnPourParticle();

        // Auto-fail at 35g (way over)
        if (currentWeight >= 35) {
          finishWeighing();
        }
      }
    };
    this.events.on('update', update);

    const finishWeighing = () => {
      if (done) return;
      done = true;
      pouring = false;
      this.events.off('update', update);
      spaceKey.off('down', startPour);
      spaceKey.off('up', stopPour);
      this.input.off('pointerdown', startPour);
      this.input.off('pointerup', stopPour);

      const diff = Math.abs(currentWeight - targetWeight);
      let resultMsg: string;
      let resultColor: string;

      if (diff <= 0.3) {
        resultMsg = 'Perfect. Not a gram over.';
        resultColor = '#30ff30';
        this.cameras.main.flash(200, 50, 255, 50);
      } else if (diff <= 1.0) {
        resultMsg = 'Close enough. Nobody\'s counting.';
        resultColor = '#f0f060';
      } else if (currentWeight > targetWeight) {
        resultMsg = 'Over. That\'s money you\'re giving away.';
        resultColor = '#ff6644';
      } else {
        resultMsg = 'Light. Buyer\'s gonna notice.';
        resultColor = '#ff4444';
      }

      const result = this.add.text(cx, cy + 120, resultMsg, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: resultColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
      objects.push(result);

      const weight = this.add.text(cx, cy + 145, `${currentWeight.toFixed(1)}g / ${targetWeight.toFixed(1)}g`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#666677',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
      objects.push(weight);

      // Clean up after 3 seconds, show internal monologue
      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        const chapterDialogue = this.getChapterDialogue();
        const lines = chapterDialogue.npcs['ch2_weigh_result'] || [
          { speaker: 'JP\'s Mind', text: 'If I put this energy into something legal...' },
        ];
        this.dialogue.show(lines, () => {
          this.frozen = false;
        });
      });
    };

    const startPour = () => { if (!done) pouring = true; };
    const stopPour = () => { if (!done) { pouring = false; finishWeighing(); } };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', startPour);
    spaceKey.on('up', stopPour);
    this.input.on('pointerdown', startPour);
    this.input.on('pointerup', stopPour);
  }

  // ─── ESCAPE ATTEMPT (post-sale, before raid) ──────────────────
  private playEscapeAttempt(onFail: () => void) {
    this.frozen = true;

    // JP tries to leave — walks toward door
    this.dialogue.show([
      { speaker: 'JP\'s Mind', text: 'Something\'s wrong. Get out. Now.' },
    ], () => {
      // Player moves toward door
      const doorX = 23 * SCALED_TILE + SCALED_TILE / 2;
      const doorY = 37 * SCALED_TILE + SCALED_TILE / 2;

      this.tweens.add({
        targets: this.player,
        x: doorX,
        y: doorY,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          // Door is blocked — lookout is there
          this.cameras.main.shake(200, 0.005);

          this.dialogue.show([
            { speaker: 'Lookout', text: 'Where you going?' },
            { speaker: 'JP', text: 'I\'m done. I\'m out.' },
            { speaker: 'Lookout', text: 'Nah. You wait.' },
            { speaker: 'Narrator', text: 'He doesn\'t move. JP can\'t get past.' },
            { speaker: 'JP\'s Mind', text: 'Fuck.' },
          ], () => {
            // Then the raid hits
            onFail();
          });
        },
      });
    });
  }
}
