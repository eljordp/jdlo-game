import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT, TILE_IDS } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { BalanceSystem } from '../systems/BalanceSystem';
import { GameSettings } from '../systems/GameSettings';
import { SubstanceSystem } from '../systems/SubstanceSystem';
import { PartyAI } from '../systems/PartyAI';
import { GameIntelligence } from '../systems/GameIntelligence';
import { DMSystem } from '../systems/DMSystem';
import { CasinoSystem } from '../systems/CasinoSystem';

export class BeachScene extends BaseChapterScene {
  private inHotTub = false;
  private bmwInteracted = false;
  private volleyballPlayed = false;
  private volleyballWon = false;
  private cooperPassedOut = false;
  private hotTubReacted = false;
  private davidPhoneDown = false;
  private hotTubBlinker = false;
  private bedroomStayed = false;
  private showerBlinker = false;
  private currentDay: 1 | 2 = 1;
  private partyOverlay: Phaser.GameObjects.Rectangle | null = null;
  private bartRampage = false;
  private beerPongPlayed = false;
  private armWrestlePlayed = false;
  private rollingContestPlayed = false;
  private beerPongTournamentWon = false;

  private darkWebDone = false;
  private lunaTraded = false;
  private plugCalled = false;
  private bagsReturned = false;
  private bmwLeft = false;
  private smokeSeshDone = false;
  private weedPickedUp = new Set<string>();
  private partyLevel = 0; // 0=sober, 1=drinking, 2=faded, 3=coked, 4=blackout
  private drinksDone = false;
  private blowOffered = false;
  private blackedOut = false;
  private nolanRoomCaught = false;
  private wobbleEffect: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'BeachScene' });
    this.chapterTitle = 'Chapter 2: Santa Barbara';
    this.nextScene = 'WrongCrowdScene';
    this.requiredInteractionId = 'ch1_smoke';
  }

  protected getPlayerTexture(): string {
    return 'player-ch1';
  }

  protected getMusicTrack(): string {
    return 'santa-barbara';
  }

  create() {
    super.create();
    SubstanceSystem.reset();
    this.events.on('shutdown', () => {
      PartyAI.destroy();
      GameIntelligence.flush();
    });

    // Watch key story interactions so GameIntelligence can track misses/stucks
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch1_bed',          15, 2,  true);  // required: wake K
    GameIntelligence.watch('ch1_computer',     14, 2,  true);  // required: LUNA trade
    GameIntelligence.watch('ch1_phone',        20, 2);
    GameIntelligence.watch('ch1_hottub',       36, 4);
    GameIntelligence.watch('ch1_volleyball1',  17, 25);
    GameIntelligence.watch('ch1_kitchen_sesh', 28, 6);
    GameIntelligence.watch('ch1_smoke',        10, 19, true);  // required: gate to ch3
    GameIntelligence.attachDebugPanel(this);
    // Exit triggers at south beach
    this.addNavArrow(18, 26, 'Next chapter');

    // Day 1 opening — JP wakes up, K is still asleep
    this.playMorningCutscene();

    // Place the BMW 335i in the yard (row 17)
    const carX = 4 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 17 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    this.collisionTiles.add('3,17');
    this.collisionTiles.add('4,17');
    this.collisionTiles.add('5,17');

    // === VOLLEYBALL NET on the beach ===
    const netLeftX = 15 * SCALED_TILE + SCALED_TILE / 2;
    const netRightX = 19 * SCALED_TILE + SCALED_TILE / 2;
    const netY = 25 * SCALED_TILE + SCALED_TILE / 2;
    const poleHeight = 20;
    // Left pole
    this.add.rectangle(netLeftX, netY - poleHeight / 2, 2, poleHeight, 0x4a3020).setDepth(5);
    // Right pole
    this.add.rectangle(netRightX, netY - poleHeight / 2, 2, poleHeight, 0x4a3020).setDepth(5);
    // Net (horizontal line between poles, slightly sagging via two segments)
    const netWidth = netRightX - netLeftX;
    const netTopY = netY - poleHeight + 4;
    // Top rope
    this.add.rectangle(netLeftX + netWidth / 2, netTopY, netWidth, 1, 0xffffff).setDepth(5).setAlpha(0.8);
    // Bottom rope (slight sag — 3px lower in the middle)
    this.add.rectangle(netLeftX + netWidth / 2, netTopY + 6, netWidth, 1, 0xcccccc).setDepth(5).setAlpha(0.6);
    // Vertical net lines
    const netSegments = 6;
    for (let i = 1; i < netSegments; i++) {
      const segX = netLeftX + (netWidth / netSegments) * i;
      this.add.rectangle(segX, netTopY + 3, 1, 6, 0xdddddd).setDepth(5).setAlpha(0.5);
    }

    // === NOLAN'S MASTER BEDROOM — LED lights + gaming vibes ===
    // LED strip behind TV (cycling colors)
    const ledColors = [0xff2060, 0x6020ff, 0x2060ff, 0x20ff60, 0xff6020];
    let ledIdx = 0;
    const ledStrip = this.add.rectangle(
      27 * SCALED_TILE + SCALED_TILE / 2, 12 * SCALED_TILE + 4,
      11 * SCALED_TILE - 8, 4, ledColors[0], 0.3
    ).setDepth(3);
    // LED color cycle
    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        ledIdx = (ledIdx + 1) % ledColors.length;
        this.tweens.add({
          targets: ledStrip,
          fillColor: { from: ledStrip.fillColor, to: ledColors[ledIdx] },
          duration: 1000,
        });
        // Can\'t tween fillColor directly — just set it
        ledStrip.setFillStyle(ledColors[ledIdx], 0.3);
      },
    });
    // LED glow on floor
    const ledGlow = this.add.rectangle(
      27 * SCALED_TILE + SCALED_TILE / 2, 13 * SCALED_TILE + SCALED_TILE / 2,
      11 * SCALED_TILE, 3 * SCALED_TILE, 0x4020a0, 0.06
    ).setDepth(2);
    this.tweens.add({
      targets: ledGlow,
      alpha: 0.03,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Hot tub bubble jets — active bubbles rising from the water
    this.createHotTubBubbles();

    // Hot tub steam effect
    this.createHotTubSteam();

    // Day 1 — hide all girls except K (no girls til party)
    for (const npc of this.npcs) {
      if (npc.id.includes('girl') || npc.id === 'ch1_sunbather') {
        npc.sprite.setVisible(false);
        npc.sprite.setActive(false);
        const tx = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const ty = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
        this.collisionTiles.delete(`${tx},${ty}`);
      }
    }

    // K starts hidden — she\'s visually part of the bed sprite (item-bed-k)
    const k = this.npcs.find(n => n.id === 'ch1_gf_k');
    if (k) {
      k.sprite.setVisible(false);
      // Remove K\'s collision so player can walk near the bed
      const kTX = Math.round((k.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const kTY = Math.round((k.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      this.collisionTiles.delete(`${kTX},${kTY}`);
    }

    // ZZZ floating from the bed
    const bedSprite = this.interactions.getSprite('ch1_bed');
    if (bedSprite) {
      this.kZzzTimer = this.time.addEvent({
        delay: 2500,
        loop: true,
        callback: () => {
          if (!bedSprite.visible || !this.scene.isActive() || this.kGoodbyeDone) return;
          const z = this.add.text(bedSprite.x + 40, bedSprite.y - 10, 'z', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#8888aa',
          }).setDepth(20).setAlpha(0.7);
          this.tweens.add({ targets: z, y: z.y - 25, alpha: 0, duration: 1800, onComplete: () => z.destroy() });
        },
      });
      // Subtle breathing — bed sprite gently pulses
      this.kSleepTween = this.tweens.add({
        targets: bedSprite,
        scaleY: SCALE * 0.98,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Update BMW position for new map layout
    // Update hot tub steam/bubble positions for new map
  }

  private createHotTubSteam() {
    // Hot tub is at cols 37, rows 3-5 (outdoor patio — smaller)
    const tubCenterX = 37 * SCALED_TILE;
    const tubTopY = 3 * SCALED_TILE;

    // 4 steam columns that rise and fade infinitely
    for (let i = 0; i < 4; i++) {
      const offsetX = (i - 1.5) * SCALED_TILE * 0.8;
      const baseDelay = i * 600;

      this.time.addEvent({
        delay: 1800,
        loop: true,
        startAt: baseDelay,
        callback: () => {
          const steam = this.add.circle(
            tubCenterX + offsetX + (Math.random() - 0.5) * 12,
            tubTopY,
            4 + Math.random() * 4,
            0xffffff,
            0.15 + Math.random() * 0.1
          ).setDepth(4);

          this.tweens.add({
            targets: steam,
            y: tubTopY - 30 - Math.random() * 20,
            x: steam.x + (Math.random() - 0.5) * 16,
            alpha: 0,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: 2000 + Math.random() * 800,
            ease: 'Sine.easeOut',
            onComplete: () => steam.destroy(),
          });
        },
      });
    }
  }

  private createHotTubBubbles() {
    // Hot tub is at col 37, rows 3-5 (outdoor patio — smaller)
    const tubCenterX = 37 * SCALED_TILE;
    const tubCenterY = 4 * SCALED_TILE;
    const tubWidth = 3 * SCALED_TILE;
    const tubHeight = 3 * SCALED_TILE;

    // Continuous bubble jets
    this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        // Random position within the hot tub area
        const bx = tubCenterX + (Math.random() - 0.5) * tubWidth * 0.8;
        const by = tubCenterY + (Math.random() - 0.3) * tubHeight * 0.7;
        const size = 2 + Math.random() * 4;

        const bubble = this.add.circle(bx, by, size, 0xffffff, 0.4 + Math.random() * 0.3)
          .setDepth(4);

        // Bubble rises and pops
        this.tweens.add({
          targets: bubble,
          y: by - 15 - Math.random() * 20,
          x: bx + (Math.random() - 0.5) * 12,
          alpha: 0,
          scale: 0.3,
          duration: 600 + Math.random() * 400,
          ease: 'Quad.easeOut',
          onComplete: () => bubble.destroy(),
        });
      },
    });

    // Larger jet bursts every few seconds
    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        // Burst of 5-8 bubbles from one spot
        const jx = tubCenterX + (Math.random() - 0.5) * tubWidth * 0.5;
        const jy = tubCenterY + Math.random() * tubHeight * 0.3;

        for (let i = 0; i < 6; i++) {
          this.time.delayedCall(i * 50, () => {
            const b = this.add.circle(
              jx + (Math.random() - 0.5) * 8,
              jy,
              3 + Math.random() * 5,
              0xffffff,
              0.5 + Math.random() * 0.3
            ).setDepth(4);

            this.tweens.add({
              targets: b,
              y: jy - 25 - Math.random() * 15,
              alpha: 0,
              scale: 0.2,
              duration: 500 + Math.random() * 300,
              ease: 'Quad.easeOut',
              onComplete: () => b.destroy(),
            });
          });
        }
      },
    });
  }

  protected onPlayerMove(tileX: number, tileY: number): void {
    const mapData = this.getMapData();
    const tile = mapData.tiles[tileY]?.[tileX];
    const onHotTub = tile === TILE_IDS.HOT_TUB;

    if (onHotTub && !this.inHotTub) {
      this.inHotTub = true;
      this.player.setTexture('player-swim');

      // Girls in hot tub react when JP gets in
      if (!this.hotTubReacted) {
        this.hotTubReacted = true;
        this.time.delayedCall(500, () => {
          if (!this.frozen && this.scene.isActive()) {
            this.dialogue.show([
              { speaker: 'Girl', text: 'Oh heyyy. Room for one more?' },
              { speaker: 'JP', text: 'What\'s good.' },
              { speaker: 'Narrator', text: 'The water\'s too hot. JP doesn\'t care.' },
            ]);
          }
        });
      }
    } else if (!onHotTub && this.inHotTub) {
      this.inHotTub = false;
      this.player.setTexture(this.getPlayerTexture());
    }

    // Cooper passes out after enough exploration (8+ tiles moved)
    if (!this.cooperPassedOut) {
      this.cooperPassedOut = true;
      // Delayed — Cooper passes out after player has been exploring
      this.time.delayedCall(30000, () => {
        const cooper = this.npcs.find(n => n.id === 'ch1_cooper');
        if (cooper && this.scene.isActive()) {
          // Cooper breathing animation (sleeping)
          this.tweens.add({
            targets: cooper.sprite,
            scaleY: SCALE * 0.92,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          // Update Cooper\'s dialogue
          cooper.dialogue = [
            { speaker: 'Narrator', text: 'Cooper passed out. Beer still in his hand.' },
            { speaker: 'JP\'s Mind', text: 'Lightweight.' },
          ];
        }
      });
    }
  }

  // GF K — sleeping in bed, wakes up when you talk
  private kGoodbyeDone = false;
  private kSleepTween: Phaser.Tweens.Tween | null = null;
  private kZzzTimer: Phaser.Time.TimerEvent | null = null;

  private wakeUpK() {
    this.kGoodbyeDone = true;
    // Stop sleeping animation
    if (this.kSleepTween) this.kSleepTween.stop();
    if (this.kZzzTimer) this.kZzzTimer.remove();

    // Swap bed to open covers version
    const bedSprite = this.interactions.getSprite('ch1_bed');
    if (bedSprite) {
      bedSprite.setTexture('item-bed-k-open');
      bedSprite.setScale(SCALE);
    }

    // Make K appear standing next to the bed
    const kNpc = this.npcs.find(n => n.id === 'ch1_gf_k');
    if (kNpc) {
      kNpc.sprite.setPosition(16 * SCALED_TILE + SCALED_TILE / 2, 3 * SCALED_TILE + SCALED_TILE / 2);
      kNpc.sprite.setVisible(true);
      kNpc.sprite.setAlpha(0);
      this.tweens.add({ targets: kNpc.sprite, alpha: 1, duration: 500 });
    }

    // Show the wake-up dialogue — rated R version has an intimate moment before she leaves
    const ratedRLines: DialogueLine[] = [
      { speaker: 'Narrator', text: 'K stirs. Rolls over. Her hair falls across the pillow.' },
      { speaker: 'K', text: 'Mmm... hey baby.' },
      { speaker: 'Narrator', text: 'She pulls him closer under the covers.' },
      { speaker: 'K', text: 'Don\'t get up yet.' },
      { speaker: 'JP', text: 'Come here.' },
      { speaker: 'Narrator', text: 'He pulls her on top of him. She laughs.' },
      { speaker: 'K', text: 'Your hands are cold!' },
      { speaker: 'JP', text: 'Let me crack your back real quick.' },
      { speaker: 'K', text: 'Be gentle.' },
      { speaker: 'Narrator', text: '*CRACK*' },
      { speaker: 'K', text: 'OH my god. Okay that felt amazing.' },
      { speaker: 'JP', text: 'You\'re welcome.' },
      { speaker: 'Narrator', text: 'Neither of them moves. The covers are warm.' },
      { speaker: 'JP', text: 'Ayo did you see that TikTok with the—' },
      { speaker: 'K', text: 'JP. I swear to god if you show me another brain rot video right now.' },
      { speaker: 'JP', text: 'Nah nah this one is actually funny though—' },
      { speaker: 'K', text: 'I will literally leave.' },
      { speaker: 'JP', text: '...okay fine.' },
      { speaker: 'Narrator', text: 'She puts her phone down. He puts his phone down.' },
      { speaker: 'Narrator', text: 'They look at each other.' },
      { speaker: 'K', text: '...' },
      { speaker: 'JP', text: '...' },
      { speaker: 'Narrator', text: 'The covers shift.' },
      { speaker: 'Narrator', text: '...' },
      { speaker: 'Narrator', text: 'Some moments you don\'t narrate.' },
      { speaker: 'Narrator', text: '...' },
      { speaker: 'Narrator', text: 'Time passes. The light in the room shifts.' },
      { speaker: 'K', text: '...wow.' },
      { speaker: 'JP', text: '...' },
      { speaker: 'K', text: 'You\'re not gonna say anything?' },
      { speaker: 'JP', text: 'I\'m trying to breathe.' },
      { speaker: 'Narrator', text: 'They lay there for a while. Not talking. Just existing.' },
      { speaker: 'K', text: 'Okay NOW I really gotta go. I have class.' },
      { speaker: 'JP', text: 'Five more minutes.' },
      { speaker: 'K', text: 'That\'s what you said 40 minutes ago.' },
      { speaker: 'Narrator', text: 'She gets up. Steals his t-shirt. Fixes her hair in the mirror.' },
      { speaker: 'K', text: 'Don\'t just smoke all day okay? Actually do something.' },
      { speaker: 'JP', text: 'I will. Promise.' },
      { speaker: 'K', text: 'I\'m serious JP.' },
      { speaker: 'Narrator', text: 'She leans down. Kisses him one more time.' },
      { speaker: 'K', text: 'Be safe. I love you.' },
      { speaker: 'JP', text: 'Love you too.' },
      { speaker: 'Narrator', text: 'The door closes. His shirt is gone. The room smells like her perfume.' },
      { speaker: 'JP\'s Mind', text: 'She\'s the only person who actually cares if I make it.' },
    ];

    const kidsLines: DialogueLine[] = [
      { speaker: 'Narrator', text: 'K wakes up! She had a great nap!' },
      { speaker: 'K', text: 'Good morning! Time for school!' },
      { speaker: 'JP', text: 'Morning! Want some juice?' },
      { speaker: 'K', text: 'No time! I have UCLA orientation!' },
      { speaker: 'Narrator', text: 'She gives him a high five and grabs her backpack.' },
      { speaker: 'K', text: 'Study hard today okay? No video games all day.' },
      { speaker: 'JP', text: 'I won\'t! Promise!' },
      { speaker: 'K', text: 'Bye! Have a great day!' },
      { speaker: 'JP\'s Mind', text: 'She\'s a really good friend.' },
    ];

    const lines = GameSettings.kidsMode ? kidsLines : ratedRLines;
    if (lines) {
      this.dialogue.show(lines, () => {
        const k = this.npcs.find(n => n.id === 'ch1_gf_k');
        if (k) {
          // K runs to the front door (row 9, col 18) then out
          const doorX = 18 * SCALED_TILE + SCALED_TILE / 2;
          const doorY = 9 * SCALED_TILE + SCALED_TILE / 2;

          // Walk to the door first
          this.tweens.add({
            targets: k.sprite,
            x: doorX,
            y: doorY,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
              // Run out the door (move south past the wall)
              this.tweens.add({
                targets: k.sprite,
                y: doorY + 4 * SCALED_TILE,
                duration: 600,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  k.sprite.setVisible(false);
                  // K is gone — check if LUNA trade already happened, fire plug call
                  this.maybeAutoPlugCall();
                },
              });
            },
          });
        }
      });
    }
  }

  // ─── MORNING CUTSCENE ────────────────────────────────────────────
  private playMorningCutscene() {
    this.frozen = true;
    this.time.delayedCall(800, () => {
      if (!this.scene.isActive()) return;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Santa Barbara. JP\'s room in the frat house.' },
        { speaker: 'Narrator', text: 'K is still asleep. Her phone has been going off for an hour.' },
        { speaker: 'JP\'s Mind', text: 'She sleeps through everything. Always has.' },
        { speaker: 'JP\'s Mind', text: 'I\'ve been up for a while. Thinking.' },
        { speaker: 'Narrator', text: 'The house is quiet. The guys are still knocked out.' },
        { speaker: 'JP\'s Mind', text: 'Let\'s see what\'s going on in the market.' },
      ], () => {
        this.frozen = false;
      });
    });
  }

  // ─── LUNA CRYPTO TRADE (Day 1) ───────────────────────────────────
  private playLunaTrade() {
    this.lunaTraded = true;
    this.frozen = true;

    // Fake phone/app overlay
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const screen = this.add.rectangle(cx, cy, 320, 480, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300).setAlpha(0);
    const border = this.add.rectangle(cx, cy, 322, 482, 0x22ff88, 0)
      .setScrollFactor(0).setDepth(299).setAlpha(0);

    this.tweens.add({ targets: [screen, border], alpha: 1, duration: 400, onComplete: () => {
      // App header
      this.add.text(cx, cy - 210, 'ROBINHOOD', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#22ff88',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      // Portfolio
      this.add.text(cx, cy - 160, 'PORTFOLIO', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      const portfolioValue = this.add.text(cx, cy - 130, '$1,200.00', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      // LUNA ticker
      this.add.text(cx - 100, cy - 80, 'LUNA', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);

      const lunaPrice = this.add.text(cx + 60, cy - 80, '+3,489%', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#22ff88',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);

      this.cameras.main.shake(300, 0.005);

      this.time.delayedCall(1000, () => {
        // Update to real value
        portfolioValue.setText('$42,468.00');
        portfolioValue.setColor('#22ff88');
        portfolioValue.setScale(1);
        this.tweens.add({ targets: portfolioValue, scaleX: 1.2, scaleY: 1.2, duration: 150, yoyo: true, repeat: 2 });
        this.cameras.main.shake(500, 0.012);

        this.time.delayedCall(1200, () => {
          this.tweens.add({ targets: [screen, border], alpha: 0, duration: 400, onComplete: () => {
            screen.destroy(); border.destroy();

            this.dialogue.show([
              { speaker: 'JP\'s Mind', text: 'LUNA is up 3,489%.' },
              { speaker: 'JP\'s Mind', text: 'I put in $1,200 two weeks ago and forgot about it.' },
              { speaker: 'JP\'s Mind', text: '$42,000.' },
              { speaker: 'JP\'s Mind', text: '...' },
              { speaker: 'JP\'s Mind', text: 'FORTY. TWO. THOUSAND. DOLLARS.' },
              { speaker: 'JP\'s Mind', text: 'I need to wake K up right now.' },
              { speaker: 'JP\'s Mind', text: 'And then I need to call the plug.' },
            ], () => {
              this.frozen = false;
              // Check if K scene already done
              this.maybeAutoPlugCall();
            });
          }});
        });
      });
    }});
  }

  // ─── PLUG CALL (auto after LUNA + K both done) ───────────────────
  private maybeAutoPlugCall() {
    if (!this.lunaTraded || !this.kGoodbyeDone || this.plugCalled) return;
    this.plugCalled = true;

    this.time.delayedCall(1000, () => {
      if (!this.scene.isActive()) return;
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP pulls out his phone. Calls his plug.' },
        { speaker: 'Plug', text: 'Ayy.' },
        { speaker: 'JP', text: 'Bro I need a big one. Trash bag big.' },
        { speaker: 'Plug', text: '...how big we talking.' },
        { speaker: 'JP', text: 'Multiple.' },
        { speaker: 'Plug', text: 'You got the bread though?' },
        { speaker: 'JP', text: 'I just hit 40K on LUNA.' },
        { speaker: 'Plug', text: '...' },
        { speaker: 'Plug', text: 'Say less. You know where I\'m at.' },
        { speaker: 'JP', text: 'On my way.' },
        { speaker: 'JP\'s Mind', text: 'He\'s gonna front me the whole thing. He always does.' },
        { speaker: 'Narrator', text: 'Go get in the BMW.' },
      ], () => {
        this.frozen = false;
      });
    });
  }

  // ─── BMW DRIVE + BAG RETURN ──────────────────────────────────────
  private triggerBMWDrive() {
    this.bmwLeft = true;
    this.frozen = true;

    const black = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(500);

    this.tweens.add({ targets: black, alpha: 1, duration: 800, onComplete: () => {
      const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Later...', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

      this.tweens.add({ targets: timeText, alpha: 1, duration: 600, hold: 1500, yoyo: true, onComplete: () => {
        timeText.destroy();

        // JP returns — spawn trash bags in living room
        this.bagsReturned = true;
        this.player.setPosition(7 * SCALED_TILE + SCALED_TILE / 2, 5 * SCALED_TILE + SCALED_TILE / 2);

        // Spawn bag sprites in living room
        const bagPositions = [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }];
        for (const pos of bagPositions) {
          const bag = this.add.rectangle(
            pos.x * SCALED_TILE + SCALED_TILE / 2,
            pos.y * SCALED_TILE + SCALED_TILE / 2,
            28, 36, 0x111111
          ).setDepth(4);
          // Tie at top
          this.add.circle(
            pos.x * SCALED_TILE + SCALED_TILE / 2,
            pos.y * SCALED_TILE + SCALED_TILE / 2 - 18,
            4, 0x333333
          ).setDepth(5);
        }

        this.tweens.add({ targets: black, alpha: 0, duration: 600, onComplete: () => {
          black.destroy();
          this.dialogue.show([
            { speaker: 'Narrator', text: 'JP pulls up. Pops the trunk.' },
            { speaker: 'JP', text: 'Aye everybody outside! Help me with these!' },
            { speaker: 'Nolan', text: '...bro what is in those bags.' },
            { speaker: 'JP', text: 'Don\'t worry about it. Just grab one.' },
            { speaker: 'Big Bart', text: 'YOOO IS THAT—' },
            { speaker: 'JP', text: 'BART. Keep your voice down.' },
            { speaker: 'Big Bart', text: '*whisper* YOOOO IS THAT—' },
            { speaker: 'Cooper', text: 'I\'m not asking questions. I\'m just carrying the bag.' },
            { speaker: 'Narrator', text: 'Three trash bags. Living room floor. The boys go quiet.' },
            { speaker: 'Narrator', text: 'Then all at once—' },
            { speaker: 'Big Bart', text: 'LETS GOOOOOO.' },
            { speaker: 'JP\'s Mind', text: 'Didn\'t cost me a dollar. Plug showed love.' },
            { speaker: 'JP\'s Mind', text: 'We\'re smoking for free for the rest of the trip.' },
          ], () => {
            this.frozen = false;
            // Spawn kitchen table sesh interactable
            this.spawnDynamicInteractable('ch1_kitchen_sesh', 28, 6, 'item-weed-bag');
          });
        }});
      }});
    }});
  }

  // NPC reactive behaviors
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    // K — already woke up, just show dialogue if she\'s still visible
    if (npcId === 'ch1_gf_k') {
      this.dialogue.show(dialogue);
      return;
    }

    // Girls at the party (Day 2) — Talk / Flirt choice for any girl NPC
    if ((npcId.includes('girl') || npcId === 'ch1_sunbather') && this.currentDay === 2) {
      this.showYesNoChoice('What do you do?', 'Talk', 'Flirt', () => {
        // Talk — threesome path for girl1/girl2 at faded+, otherwise normal dialogue
        if ((npcId === 'ch1_girl1' || npcId === 'ch1_girl2') && this.partyLevel >= 2) {
          this.handleGirlThreesome(npcId);
        } else {
          this.dialogue.show(dialogue);
        }
      }, () => {
        // Flirt — 50/50 success/rejection
        this.handlePartyFlirt(npcId);
      });
      return;
    }

    // David puts his phone down
    if (npcId === 'ch1_david' && !this.davidPhoneDown) {
      this.davidPhoneDown = true;
      this.dialogue.show(dialogue, () => {
        const david = this.npcs.find(n => n.id === 'ch1_david');
        if (david) {
          this.tweens.add({
            targets: david.sprite,
            scaleX: SCALE * 0.9,
            duration: 150,
            yoyo: true,
          });
        }
      });
      return;
    }

    // Big Bart — arm wrestle option (Day 2 party, after rampage)
    if (npcId === 'ch1_bigbart' && this.bartRampage && this.currentDay === 2 && !this.armWrestlePlayed) {
      this.showYesNoChoice('Big Bart flexes.', 'Arm Wrestle', 'Talk', () => {
        this.playArmWrestle();
      }, () => {
        this.dialogue.show(dialogue);
      });
      return;
    }

    // Big Bart — causes havoc when you talk to him
    if (npcId === 'ch1_bigbart' && !this.bartRampage) {
      this.bartRampage = true;
      this.dialogue.show(dialogue, () => {
        const bart = this.npcs.find(n => n.id === 'ch1_bigbart');
        if (!bart) return;

        // Bart goes on a rampage — runs around, knocks into walls, camera shakes
        this.cameras.main.shake(300, 0.005);

        // Bart charges left
        this.tweens.add({
          targets: bart.sprite,
          x: bart.sprite.x - SCALED_TILE * 3,
          duration: 500,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // SLAM into wall
            this.cameras.main.shake(200, 0.008);

            // Bounce back right
            this.tweens.add({
              targets: bart.sprite,
              x: bart.sprite.x + SCALED_TILE * 5,
              duration: 600,
              ease: 'Quad.easeInOut',
              onComplete: () => {
                this.cameras.main.shake(150, 0.006);

                // Bart does a belly flop (squash animation)
                this.tweens.add({
                  targets: bart.sprite,
                  scaleY: SCALE * 0.6,
                  scaleX: SCALE * 1.4,
                  duration: 200,
                  yoyo: true,
                  onComplete: () => {
                    this.dialogue.show([
                      { speaker: 'Big Bart', text: 'WHOOOOO! SB BABY!!' },
                      { speaker: 'Narrator', text: 'Big Bart just body-slammed the coffee table.' },
                      { speaker: 'Nolan', text: 'BRO THE TABLE!' },
                      { speaker: 'Big Bart', text: 'IT\'S A PARTY!!' },
                    ]);
                  },
                });
              },
            });
          },
        });
      });
      return;
    }

    // Default
    this.dialogue.show(dialogue);
  }

  // ─── PARTY FLIRT SYSTEM ────���────────────────────────────────────
  private handleGirlThreesome(_npcId: string) {
    const isKids = GameSettings.kidsMode;
    const ratedRIntro: DialogueLine[] = [
      { speaker: 'Girl', text: 'You live here right? This party is insane.' },
      { speaker: 'JP', text: 'Yeah. My boy Nolan set it up.' },
      { speaker: 'Girl', text: 'My friend thinks you\'re cute. She\'s too shy to say it.' },
      { speaker: 'Girl 2', text: 'I am NOT shy. I just don\'t talk to random guys.' },
      { speaker: 'JP', text: 'I\'m not random. I live here.' },
      { speaker: 'Girl 2', text: '...okay that was smooth.' },
      { speaker: 'Narrator', text: 'The first girl whispers something in her friend\'s ear. They both look at JP.' },
      { speaker: 'Girl', text: 'We should go somewhere quieter. All three of us.' },
      { speaker: 'JP\'s Mind', text: 'No way this is happening right now.' },
    ];
    const kidsIntro: DialogueLine[] = [
      { speaker: 'Girl', text: 'Hey! Wanna play Mario Kart?' },
      { speaker: 'JP', text: 'I\'m pretty good at Mario Kart.' },
      { speaker: 'Girl 2', text: 'We\'ll see about that!' },
      { speaker: 'Narrator', text: 'They go inside to play video games. What a fun party!' },
    ];
    this.dialogue.show(isKids ? kidsIntro : ratedRIntro, () => {
      this.frozen = true;
      const fadeObj = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0).setScrollFactor(0).setDepth(400);
      this.tweens.add({ targets: fadeObj, alpha: 1, duration: 1000, onComplete: () => {
        const afterLines: DialogueLine[] = isKids ? [
          { speaker: 'Narrator', text: 'JP won 3 races in a row! Then lost the last one on purpose.' },
          { speaker: 'Girl', text: 'Rematch tomorrow?' },
          { speaker: 'JP', text: 'Absolutely.' },
        ] : [
          { speaker: 'Narrator', text: '...' },
          { speaker: 'Narrator', text: 'The bedroom door is locked.' },
          { speaker: 'Narrator', text: '...' },
          { speaker: 'Narrator', text: 'Time passes.' },
          { speaker: 'Narrator', text: '...' },
          { speaker: 'Narrator', text: 'More time.' },
          { speaker: 'Narrator', text: '...' },
          { speaker: 'Girl', text: 'Oh my god.' },
          { speaker: 'Girl 2', text: '...yeah.' },
          { speaker: 'Narrator', text: 'Nobody says anything after that.' },
          { speaker: 'Narrator', text: 'They fall asleep. All three of them.' },
          { speaker: 'Narrator', text: 'Sunlight hits the room before JP processes what just happened.' },
          { speaker: 'JP\'s Mind', text: '...K can never find out about this.' },
          { speaker: 'Narrator', text: 'She always finds out.' },
        ];
        this.time.delayedCall(2000, () => {
          this.dialogue.show(afterLines, () => {
            this.tweens.add({ targets: fadeObj, alpha: 0, duration: 800, onComplete: () => {
              fadeObj.destroy();
              this.player.setPosition(33 * SCALED_TILE + SCALED_TILE / 2, 6 * SCALED_TILE + SCALED_TILE / 2);
              MoodSystem.setMood('tired', 60);
              this.requiredDone = true;
              this.time.delayedCall(400, () => {
                this.dialogue.show([
                  { speaker: 'Narrator', text: 'Morning. The girls are gone. The house is trashed.' },
                  { speaker: 'JP\'s Mind', text: 'Why do I feel like shit right now.' },
                  { speaker: 'JP\'s Mind', text: 'Post-nut clarity is a different kind of prison.' },
                  { speaker: 'JP\'s Mind', text: 'These people don\'t actually mess with me.' },
                  { speaker: 'JP\'s Mind', text: 'They mess with the bags. The free food. The DoorDash runs at 2am.' },
                  { speaker: 'JP\'s Mind', text: 'I\'m just the trapper with a credit card.' },
                  { speaker: 'JP\'s Mind', text: 'K texted me four times.' },
                  { speaker: 'JP\'s Mind', text: 'I can\'t even look at my phone right now.' },
                  { speaker: 'Narrator', text: 'Walk south to the street.' },
                ], () => { this.frozen = false; });
              });
            }});
          });
        });
      }});
    });
  }

  private handlePartyFlirt(npcId: string) {
    const fumbleBefore = DMSystem.getFumbleCount();
    DMSystem.openFlirt(this, (lines, onComplete) => {
      const fumbledNow = DMSystem.getFumbleCount() > fumbleBefore;
      // If fumbleCount >= 3 after this rejection, Big Bart intervenes (chapter-specific)
      if (fumbledNow && DMSystem.getFumbleCount() >= 3) {
        const bartLines: DialogueLine[] = [
          ...lines,
          { speaker: 'Big Bart', text: 'BRO STOP.' },
          { speaker: 'Big Bart', text: 'You are 0 for ' + DMSystem.getFumbleCount() + ' tonight.' },
          { speaker: 'Big Bart', text: 'Just... go stand by the speakers or something.' },
          { speaker: 'JP\'s Mind', text: 'Even Bart feels bad for me. That\'s how you know it\'s over.' },
        ];
        this.dialogue.show(bartLines, () => {
          // Bart speech bubble stays visible briefly
          const bart = this.npcs.find(n => n.id === 'ch1_bigbart');
          if (bart) {
            const bubbleBg = this.add.rectangle(bart.sprite.x, bart.sprite.y - 30, 80, 20, 0x000000, 0.8).setDepth(20);
            const bubbleText = this.add.text(bart.sprite.x, bart.sprite.y - 30, 'BRO STOP', {
              fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ff4444',
            }).setOrigin(0.5).setDepth(21);
            this.time.delayedCall(3000, () => { bubbleBg.destroy(); bubbleText.destroy(); });
          }
          if (onComplete) onComplete();
        });
      } else {
        this.dialogue.show(lines, onComplete);
      }
    }, npcId);
  }

  protected getObjectiveHint(): string {
    if (this.currentDay === 1) {
      if (!this.bedroomStayed) return 'Explore the house. Hit the bed when you\'re ready.';
      return 'Head to bed. It\'s getting late.';
    }
    // Day 2 — smoke → drink → blow → exit
    if (!this.smokeSeshDone) return 'Party\'s going. Hit the smoke spot in the yard.';
    if (!this.drinksDone) return 'Grab a drink. Bottles are in the kitchen.';
    if (!this.blowOffered) return 'Keep vibing. Something\'s coming...';
    if (!this.blackedOut) return 'Things are getting out of hand.';
    return 'Head to the beach.';
  }

  getMapData(): MapData {
    return beachMap;
  }

  private spawnDynamicInteractable(id: string, x: number, y: number, sprite?: string) {
    this.interactions.addInteractable({ id, x, y, type: 'examine', glow: true, sprite });
    const worldX = x * SCALED_TILE + SCALED_TILE / 2;
    const worldY = y * SCALED_TILE + SCALED_TILE / 2;
    for (let i = 0; i < 5; i++) {
      const sparkle = this.add.circle(
        worldX + Phaser.Math.Between(-15, 15),
        worldY + Phaser.Math.Between(-15, 15),
        2, 0xf0c040, 0.8
      ).setDepth(12);
      this.tweens.add({
        targets: sparkle, alpha: 0, y: sparkle.y - 20, duration: 600, delay: i * 100,
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return beachDialogue;
  }

  // Override to add volleyball mini-game, BMW, and bed wake-up
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Always notify GameIntelligence — one place, catches everything
    GameIntelligence.onInteracted(interactable.id);

    if (interactable.id === 'ch1_volleyball1') {
      Analytics.trackInteraction(interactable.id);
      this.playVolleyballMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Hot tub — blinker choice
    if (interactable.id === 'ch1_hottub' && !this.hotTubBlinker) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.showYesNoChoice('Hit the blinker?', 'Yeah', 'Nah', () => {
        this.hotTubBlinker = true;
        SubstanceSystem.hit(1);
        this.dialogue.show([
          { speaker: 'Nolan', text: 'Ayy pass that!' },
          { speaker: 'Narrator', text: 'The boys pass it around. Nobody has anywhere to be.' },
        ], () => { this.frozen = false; });
      }, () => {
        this.dialogue.show([
          { speaker: 'JP', text: 'I\'m good.' },
        ], () => { this.frozen = false; });
      });
      return;
    }

    // Weed bags — inventory pickups
    if ((interactable.id === 'ch1_weed1' || interactable.id === 'ch1_weed2' || interactable.id === 'ch1_weed3') && !this.weedPickedUp.has(interactable.id)) {
      Analytics.trackInteraction(interactable.id);
      this.weedPickedUp.add(interactable.id);
      this.interactions.consume(interactable.id);
      InventorySystem.addItem('eighth', 1);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP pockets it. Eighth added to inventory.' },
      ], () => { this.frozen = false; });
      return;
    }

    // Bong — inventory pickup
    if (interactable.id === 'ch1_bong') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      InventorySystem.addItem('bong', 1);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Glass piece on the counter. JP adds it to the collection.' },
        { speaker: 'Narrator', text: 'Bong added to inventory.' },
      ], () => { this.frozen = false; });
      return;
    }

    // Beer pong — Day 2 only
    if (interactable.id === 'ch1_beerpong' && !this.beerPongPlayed) {
      if (this.currentDay < 2) {
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Beer pong table. Not set up yet.' },
          { speaker: 'JP\'s Mind', text: 'Tonight though...' },
        ], () => { this.frozen = false; });
        return;
      }
      Analytics.trackInteraction(interactable.id);
      this.playBeerPong();
      return;
    }

    // Drinks — Day 2 party only
    if (interactable.id === 'ch1_bottles' && this.currentDay === 2 && !this.drinksDone) {
      Analytics.trackInteraction(interactable.id);
      this.drinksDone = true;
      this.frozen = true;
      this.partyLevel = 1;
      this.dialogue.show([
        { speaker: 'Cooper', text: 'Bro take a shot. We\'re celebrating.' },
        { speaker: 'JP', text: 'Celebrating what?' },
        { speaker: 'Cooper', text: 'Being ALIVE bro. In SB. With a hot tub.' },
        { speaker: 'Narrator', text: 'JP takes the shot. Then another. Then another.' },
        { speaker: 'Narrator', text: 'The room starts to feel warmer.' },
      ], () => {
        SubstanceSystem.drink();
        SubstanceSystem.drink();
        SubstanceSystem.drink(); // 3 shots
        // Slight wobble effect on camera
        this.wobbleEffect = this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.cameras.main.scrollX + 2,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.frozen = false;

        // After a few seconds of drinking, girls walk in
        this.time.delayedCall(4000, () => {
          if (!this.scene.isActive() || this.currentDay !== 2) return;
          this.frozen = true;
          this.cameras.main.shake(80, 0.002);

          const isKids = GameSettings.kidsMode;

          this.dialogue.show(isKids ? [
            { speaker: 'Nolan', text: 'Ayo! More friends are here!' },
            { speaker: 'Narrator', text: 'A group of girls walk in with board games and snacks.' },
            { speaker: 'Cooper', text: 'GAME NIGHT LET\'S GOOO!' },
          ] : [
            { speaker: 'Nolan', text: 'AYO! THE GIRLS ARE HERE!' },
            { speaker: 'Narrator', text: 'The front door swings open. A group of girls walk in like they own the place.' },
            { speaker: 'Narrator', text: 'Short skirts. High heels. The whole house turns around.' },
            { speaker: 'Big Bart', text: 'OH WE\'RE PARTYING PARTYING!' },
            { speaker: 'Cooper', text: 'Who invited them??' },
            { speaker: 'Nolan', text: 'I did. You\'re welcome.' },
            { speaker: 'Narrator', text: 'The music gets louder. The energy shifts. This isn\'t a kickback anymore.' },
            { speaker: 'JP\'s Mind', text: 'This just went from a 5 to a 10 real quick.' },
          ], () => {
            // Make all hidden girls visible now
            for (const npc of this.npcs) {
              if (npc.id.includes('girl') || npc.id === 'ch1_sunbather') {
                npc.sprite.setVisible(true);
                npc.sprite.setActive(true);
                npc.sprite.setAlpha(0);
                this.tweens.add({ targets: npc.sprite, alpha: 1, duration: 500 });
                const tx = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
                const ty = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
                this.collisionTiles.add(`${tx},${ty}`);
              }
            }
            this.frozen = false;

            // After drinking + girls arrive, blow gets offered (delayed)
            this.time.delayedCall(10000, () => {
              if (this.scene.isActive() && !this.blowOffered && !this.requiredDone && this.currentDay === 2) {
                this.triggerBlowOffer();
              }
            });
          });
        });
      });
      return;
    }

    // Group smoke sesh — Day 2 (smoke comes FIRST, no drink gate)
    if (interactable.id === 'ch1_smoke' && this.currentDay === 2 && !this.smokeSeshDone) {
      Analytics.trackInteraction(interactable.id);
      this.smokeSeshDone = true;
      this.frozen = true;
      this.partyLevel = 2;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Nolan', text: 'Aye everybody outside! We\'re rolling up!' },
        { speaker: 'Narrator', text: 'The whole crew circles up in the yard. Girls too.' },
        { speaker: 'Big Bart', text: 'PASS IT! PASS IT!' },
        { speaker: 'Narrator', text: 'Bart takes the biggest hit anyone\'s ever seen. Coughs for 30 seconds.' },
        { speaker: 'Terrell', text: 'Bro you good??' },
        { speaker: 'Big Bart', text: '*coughing* I\'M GREAT!' },
        { speaker: 'Narrator', text: 'Smoke hangs in the air. Nobody\'s going anywhere tonight.' },
        { speaker: 'Girl', text: 'This is the best party I\'ve been to all year.' },
        { speaker: 'JP\'s Mind', text: 'It feels good. For now.' },
      ], () => {
        SubstanceSystem.hit(1); // group smoke
        SubstanceSystem.hit(1); // extra pass
        // Heavier wobble
        if (this.wobbleEffect) this.wobbleEffect.stop();
        this.wobbleEffect = this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.cameras.main.scrollX + 4,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // Green tint overlay
        const greenHaze = this.add.rectangle(
          GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3,
          0x204010, 0
        ).setScrollFactor(0).setDepth(7);
        this.tweens.add({ targets: greenHaze, alpha: 0.1, duration: 2000 });
        this.frozen = false;

        // Blow comes after drinking, not smoking — hint to grab drinks
        // (triggerBlowOffer is called from the drink interaction now)
      });
      return;
    }

    // Bedroom — Day 1: JP lies down, eyes blink, wakes up to party. Day 2: K scene or no sleeping
    if (interactable.id === 'ch1_bed') {
      Analytics.trackInteraction(interactable.id);
      // K wake-up takes priority (any day, if not done yet)
      if (!this.kGoodbyeDone) {
        this.wakeUpK();
        return;
      }
      if (this.currentDay === 1 && !this.bedroomStayed) {
        this.frozen = true;
        this.showYesNoChoice(
          'It\'s getting late...',
          'Get some sleep',
          'Keep going',
          () => {
            this.bedroomStayed = true;
            this.dialogue.show([
              { speaker: 'JP\'s Mind', text: 'Just a quick nap...' },
            ], () => {
              this.triggerPartyNight();
            });
          },
          () => {
            this.dialogue.show([
              { speaker: 'JP\'s Mind', text: 'Not done yet.' },
            ], () => { this.frozen = false; });
          }
        );
      } else if (this.currentDay === 2) {
        this.frozen = true;
        this.dialogue.show([
          { speaker: 'Narrator', text: 'No sleeping at a party.' },
        ], () => { this.frozen = false; });
      }
      return;
    }

    // Shower — blinker choice
    if (interactable.id === 'ch1_shower' && !this.showerBlinker) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.showYesNoChoice('Hit it in the shower?', 'Yeah', 'Nah', () => {
        this.showerBlinker = true;
        SubstanceSystem.hit(3); // blinker = potency 3
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Steam and smoke. JP\'s favorite combination.' },
        ], () => { this.frozen = false; });
      }, () => {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP takes a quick shower and gets out.' },
        ], () => { this.frozen = false; });
      });
      return;
    }

    // Computer — Day 1: LUNA crypto trade
    if (interactable.id === 'ch1_computer' && this.currentDay === 1 && !this.lunaTraded) {
      Analytics.trackInteraction(interactable.id);
      this.playLunaTrade();
      return;
    }

    // Kitchen table sesh (spawned dynamically after bag return)
    if (interactable.id === 'ch1_kitchen_sesh') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The whole crew pulls up to the kitchen table.' },
        { speaker: 'Narrator', text: 'Someone dumps a bag out. The whole table is covered.' },
        { speaker: 'Big Bart', text: 'BRO.' },
        { speaker: 'Cooper', text: 'JP who did you rob for this.' },
        { speaker: 'JP', text: 'Nobody. Plug fronted it.' },
        { speaker: 'Nolan', text: 'How do you get a plug to FRONT THIS MUCH.' },
        { speaker: 'JP', text: 'Track record.' },
        { speaker: 'Narrator', text: 'They roll up. They smoke. They roll up again.' },
        { speaker: 'Narrator', text: 'For two hours, nobody talks about anything real.' },
        { speaker: 'JP\'s Mind', text: 'This is what it\'s supposed to feel like.' },
      ], () => {
        SubstanceSystem.hit(2);
        this.frozen = false;
      });
      return;
    }

    // Phone — call the plug (Day 1, after LUNA trade), then phone apps after
    if (interactable.id === 'ch1_phone' && this.currentDay === 1) {
      if (!this.lunaTraded) {
        this.frozen = true;
        this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Check the computer first.' }], () => { this.frozen = false; });
      } else if (!this.plugCalled) {
        this.kGoodbyeDone = true; // treat K scene as done
        this.maybeAutoPlugCall();
      } else {
        this.showPhoneApps();
      }
      return;
    }

    // Phone — Day 2: phone apps
    if (interactable.id === 'ch1_phone' && this.currentDay === 2) {
      this.showPhoneApps();
      return;
    }

    // Computer — Day 1: story already done, show apps menu
    if (interactable.id === 'ch1_computer' && this.currentDay === 1 && this.lunaTraded) {
      this.showComputerApps();
      return;
    }

    // Nolan\'s computer — Day 2: JP goes on the dark web, buys a stolen card
    if (interactable.id === 'ch1_computer' && this.currentDay === 2 && !this.darkWebDone) {
      Analytics.trackInteraction(interactable.id);
      this.darkWebDone = true;
      this.frozen = true;
      const isKids = GameSettings.kidsMode;
      this.dialogue.show(isKids ? [
        { speaker: 'JP', text: 'Nolan has a gaming PC. Nice setup.' },
        { speaker: 'JP\'s Mind', text: 'Maybe I\'ll look up some cool games.' },
      ] : [
        { speaker: 'JP', text: 'Nolan\'s computer. Fancy.' },
        { speaker: 'JP\'s Mind', text: 'I heard you can find anything on Tor.' },
        { speaker: 'Narrator', text: 'JP opens the browser. Doesn\'t tell anyone what he\'s doing.' },
        { speaker: 'JP\'s Mind', text: 'Credit card marketplace. 16 digits, exp date, CVV. $40.' },
        { speaker: 'JP\'s Mind', text: 'This is stupid. This is really stupid.' },
        { speaker: 'JP\'s Mind', text: 'He buys it anyway.' },
        { speaker: 'Narrator', text: 'Card added to Apple Pay.' },
        { speaker: 'JP\'s Mind', text: 'Okay. Now for the real test.' },
      ], () => {
        if (isKids) { this.frozen = false; return; }
        // Order the haul on his phone
        this.time.delayedCall(800, () => {
          this.dialogue.show([
            { speaker: 'Narrator', text: 'JP opens DoorDash on his phone.' },
            { speaker: 'JP\'s Mind', text: 'Wing stop. Two orders of Cane\'s. A full box of Wingstop. 6 bottles of Hennessy.' },
            { speaker: 'JP\'s Mind', text: 'Oh and the plug. Let me text the plug real quick.' },
            { speaker: 'Narrator', text: 'JP orders $400 worth of food and alcohol. Hits the connect for a zip.' },
            { speaker: 'Narrator', text: 'Card goes through.' },
            { speaker: 'JP\'s Mind', text: '...' },
            { speaker: 'JP\'s Mind', text: 'I just did that.' },
            { speaker: 'Big Bart', text: 'YO WHO ORDERED ALL THIS FOOD?!' },
            { speaker: 'JP', text: 'Me.' },
            { speaker: 'Nolan', text: 'BRO HOW.' },
            { speaker: 'JP', text: 'Don\'t ask.' },
          ], () => {
            this.frozen = false;
            InventorySystem.addItem('eighth', 2); // zip arrived
          });
        });
      });
      return;
    }

    // Computer — Day 2: story already done, show apps menu
    if (interactable.id === 'ch1_computer' && this.currentDay === 2 && this.darkWebDone) {
      this.showComputerApps();
      return;
    }

    // BMW interaction — check if player is adjacent to the car tiles (3-5, 9)
    // We handle this via proximity in the interact handler below
    super.handleInteractable(interactable);
  }

  // Check for BMW interaction when player presses interact near the car
  protected handleInteract(): void {
    // Let dialogue advance / frozen checks happen in parent first
    if (this.dialogue.isActive() || this.frozen) {
      super.handleInteract();
      return;
    }

    // Check if player is near the BMW (tiles 3-5, row 17)
    if (this.player) {
      const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
      const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

      const nearBMW =
        playerTileX >= 2 && playerTileX <= 6 &&
        playerTileY >= 15 && playerTileY <= 19;

      if (nearBMW) {
        // If plug call done and haven\'t left yet — drive to pickup
        if (this.plugCalled && !this.bmwLeft) {
          this.triggerBMWDrive();
          return;
        }
        // Otherwise just look at the car
        if (!this.bmwInteracted) {
          this.bmwInteracted = true;
          this.frozen = true;
          this.dialogue.show([
            { speaker: "JP\'s Mind", text: '335i. Twin turbo. Catless downpipes.' },
            { speaker: "JP\'s Mind", text: 'This car is trouble. But it sounds SO good.' },
          ], () => {
            this.frozen = false;
          });
          return;
        }
      }

      // Nolan\'s master bedroom door — party night scene
      if (this.currentDay === 2 && !this.nolanRoomCaught) {
        const nearNolanDoor =
          playerTileX >= 25 && playerTileX <= 29 &&
          playerTileY >= 15 && playerTileY <= 17;

        if (nearNolanDoor) {
          this.nolanRoomCaught = true;
          this.frozen = true;

          const isKids = GameSettings.kidsMode;

          this.dialogue.show(isKids ? [
            { speaker: 'Narrator', text: 'The door is locked. Sounds like someone\'s watching a movie really loud in there.' },
            { speaker: "JP\'s Mind", text: 'I\'ll come back later.' },
          ] : [
            { speaker: 'Narrator', text: 'The door\'s cracked open. Someone\'s in there.' },
            { speaker: 'Narrator', text: 'JP pushes the door.' },
            { speaker: 'JP', text: 'Oh shit—my bad my bad' },
            { speaker: '???', text: 'BRO CLOSE THE DOOR' },
            { speaker: '???', text: '*screams*' },
            { speaker: 'Narrator', text: 'JP backs out. The door slams shut.' },
            { speaker: "JP\'s Mind", text: 'Nolan\'s room is OFF LIMITS tonight.' },
          ], () => {
            // Block re-entry by adding collision at the door tile (col 27, row 16)
            this.collisionTiles.add('27,16');
            this.frozen = false;
          });
          return;
        }
      }
    }

    super.handleInteract();
  }

  // Reusable yes/no choice UI — prompt text shows ABOVE buttons so you know what you\'re choosing
  private showYesNoChoice(
    prompt: string,
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Prompt text — tells you what you\'re deciding
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

  // ─── PARTY NIGHT TRANSITION (Day 1 → Day 2) ─────────────────────
  private triggerPartyNight() {
    this.frozen = true;

    const black = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(500);

    // Eye blink effect — rapid black flashes simulating falling asleep
    let blinkCount = 0;
    const blink = () => {
      blinkCount++;
      // Each blink gets longer (eyes staying closed longer)
      const closeTime = 200 + blinkCount * 150;
      const openTime = Math.max(100, 400 - blinkCount * 80);

      this.tweens.add({
        targets: black,
        alpha: 1,
        duration: 150,
        hold: closeTime,
        yoyo: true,
        onComplete: () => {
          if (blinkCount < 4) {
            this.time.delayedCall(openTime, blink);
          } else {
            // Final close — eyes shut, asleep
            this.tweens.add({
              targets: black,
              alpha: 1,
              duration: 300,
              onComplete: () => {
                // Time passes text
                const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Later that night...', {
                  fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

                this.tweens.add({
                  targets: timeText,
                  alpha: 1,
                  duration: 800,
                  hold: 1500,
                  yoyo: true,
                  onComplete: () => {
                    timeText.destroy();

            // Switch to Day 2
            this.currentDay = 2;

            // Night overlay — purple party tint (not too dark)
            this.partyOverlay = this.add.rectangle(
              GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3,
              0x0a0020, 0.55
            ).setScrollFactor(0).setDepth(8);

            // Spawn party vibes — floating music notes
            this.time.addEvent({
              delay: 2000,
              loop: true,
              callback: () => {
                if (!this.scene.isActive() || this.currentDay !== 2) return;
                const notes = ['♪', '♫', '♬'];
                const note = this.add.text(
                  this.player.x + Phaser.Math.Between(-200, 200),
                  this.player.y + Phaser.Math.Between(-150, 100),
                  notes[Math.floor(Math.random() * notes.length)],
                  { fontSize: '14px', color: '#f0c040' }
                ).setDepth(9).setAlpha(0);
                this.tweens.add({
                  targets: note,
                  alpha: 0.6,
                  y: note.y - 40,
                  duration: 1500,
                  yoyo: true,
                  onComplete: () => note.destroy(),
                });
              },
            });

            // Update NPC dialogue for party mode
            for (const npc of this.npcs) {
              if (npc.id === 'ch1_homie1') {
                npc.dialogue = [
                  { speaker: 'Nolan', text: 'BRO THIS PARTY IS CRAZY!' },
                  { speaker: 'Nolan', text: 'I told you SB was the move!' },
                ];
              }
              if (npc.id === 'ch1_bigbart') {
                npc.dialogue = [
                  { speaker: 'Big Bart', text: 'SOMEBODY GET ME ANOTHER DRINK!' },
                  { speaker: 'Narrator', text: 'Bart\'s shirt is off. Has been for an hour.' },
                  { speaker: 'Big Bart', text: 'WHO WANTS TO PLAY BEER PONG?!' },
                ];
              }
              if (npc.id === 'ch1_cooper') {
                npc.dialogue = [
                  { speaker: 'Cooper', text: 'Bro I just woke up from a nap and now there\'s a PARTY?' },
                  { speaker: 'Cooper', text: 'I love this house.' },
                ];
              }
            }

            // ── SPAWN THE PARTY ──────────────────────────────
            this.spawnPartyScene();

            // Move player back to room
            this.player.setPosition(12 * SCALED_TILE + SCALED_TILE / 2, 5 * SCALED_TILE + SCALED_TILE / 2);

            // Fade in
            this.tweens.add({
              targets: black,
              alpha: 0,
              duration: 600,
              onComplete: () => {
                black.destroy();


                // Disco lights — colored circles pulsing around the yard
                const discoColors = [0xff2080, 0x20c0ff, 0xf0c040, 0x40ff60, 0xc040ff];
                this.time.addEvent({
                  delay: 800,
                  loop: true,
                  callback: () => {
                    if (!this.scene.isActive() || this.currentDay !== 2) return;
                    const color = discoColors[Math.floor(Math.random() * discoColors.length)];
                    const lx = this.player.x + Phaser.Math.Between(-300, 300);
                    const ly = this.player.y + Phaser.Math.Between(-200, 200);
                    const light = this.add.circle(lx, ly, 30 + Math.random() * 40, color, 0)
                      .setDepth(7);
                    this.tweens.add({
                      targets: light,
                      alpha: 0.12,
                      duration: 400,
                      yoyo: true,
                      onComplete: () => light.destroy(),
                    });
                  },
                });


                // Hide K on Day 2 — she left
                const kNpc = this.npcs.find(n => n.id === 'ch1_gf_k');
                if (kNpc) {
                  kNpc.sprite.setVisible(false);
                  const kTileX = Math.round((kNpc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
                  const kTileY = Math.round((kNpc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
                  this.collisionTiles.delete(`${kTileX},${kTileY}`);
                }

                // K\'s texts — phone buzzing on screen before party starts
                this.dialogue.show([
                  { speaker: 'Narrator', text: 'JP\'s phone is blowing up.' },
                  { speaker: 'K (text)', text: 'babe??' },
                  { speaker: 'K (text)', text: 'hello???' },
                  { speaker: 'K (text)', text: 'why aren\'t you answering' },
                  { speaker: 'K (text)', text: 'jp.' },
                  { speaker: 'K (text)', text: 'whatever.' },
                  { speaker: 'Narrator', text: 'JP stares at the screen. Puts the phone face-down.' },
                ], () => {
                  // Party arrival
                  this.dialogue.show([
                    { speaker: 'Narrator', text: 'Bass is shaking the walls. There\'s a DJ outside.' },
                    { speaker: 'Narrator', text: 'Lights flashing. People EVERYWHERE. Hella girls.' },
                    { speaker: 'Narrator', text: 'Big Bart\'s already shirtless. Has been for an hour.' },
                    { speaker: 'JP\'s Mind', text: 'I took a nap and they threw a whole party.' },
                    { speaker: 'Nolan', text: 'YOOO HE\'S UP! JP GET OUT HERE!' },
                  ], () => {
                    this.frozen = false;
                  });
                });
              },
            });
          },
        });
              },
            });
          }
        },
      });
    };
    blink();
  }

  // ─── SPAWN PARTY SCENE ─────────────────────────────────────────
  private spawnPartyScene() {
    const CHAR_SCALE = SCALE;

    // Night overlay — purple party tint (ensure it exists even if called directly)
    if (!this.partyOverlay) {
      this.partyOverlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3,
        0x0a0020, 0.55
      ).setScrollFactor(0).setDepth(8);
    }

    // Show the girls — they arrive for the party
    for (const npc of this.npcs) {
      if (npc.id.includes('girl') || npc.id === 'ch1_sunbather') {
        npc.sprite.setVisible(true);
        npc.sprite.setActive(true);
        const tx = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const ty = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
        this.collisionTiles.add(`${tx},${ty}`);
      }
    }

    // ── LED STRIP LIGHTS in rooms (Gen Z vibes) ──
    // Each room gets a color-cycling strip along the top wall
    const ledRooms = [
      { startCol: 1, endCol: 8, row: 1 },   // Living room
      { startCol: 10, endCol: 15, row: 1 },  // JP\'s room
      { startCol: 17, endCol: 21, row: 1 },  // Kitchen
      { startCol: 23, endCol: 27, row: 1 },  // Nolan\'s room
    ];
    const ledColors = [0xff2080, 0x8020ff, 0x20c0ff, 0xff2080, 0x40ff60];
    for (const room of ledRooms) {
      for (let col = room.startCol; col <= room.endCol; col++) {
        const lx = col * SCALED_TILE + SCALED_TILE / 2;
        const ly = room.row * SCALED_TILE + 4; // tight against ceiling
        const led = this.add.rectangle(lx, ly, SCALED_TILE - 2, 4,
          ledColors[Math.floor(Math.random() * ledColors.length)], 0.7
        ).setDepth(6);
        // Color cycle
        this.tweens.add({
          targets: led,
          fillColor: ledColors[(Math.floor(Math.random() * ledColors.length))],
          duration: 1500 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 500,
        });
        // Pulse brightness
        this.tweens.add({
          targets: led,
          alpha: 0.3,
          duration: 800 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 300,
        });
      }
    }

    // ── DJ SETUP (yard, center) ──
    const djX = 12 * SCALED_TILE + SCALED_TILE / 2;
    const djY = 18 * SCALED_TILE + SCALED_TILE / 2;

    // DJ table (dark rectangle)
    this.add.rectangle(djX, djY, SCALED_TILE * 2, SCALED_TILE * 0.6, 0x202028).setDepth(5);
    // Turntable circles
    this.add.circle(djX - 18, djY, 10, 0x404048).setDepth(6);
    this.add.circle(djX + 18, djY, 10, 0x404048).setDepth(6);
    // Spinning records
    const record1 = this.add.circle(djX - 18, djY, 8, 0x101010).setDepth(6);
    const record2 = this.add.circle(djX + 18, djY, 8, 0x101010).setDepth(6);
    this.tweens.add({ targets: record1, angle: 360, duration: 2000, repeat: -1 });
    this.tweens.add({ targets: record2, angle: 360, duration: 2000, repeat: -1, delay: 500 });
    // DJ NPC
    const dj = this.add.sprite(djX, djY - SCALED_TILE * 0.5, 'npc_generic', 0)
      .setScale(CHAR_SCALE).setDepth(9);
    // DJ head-bob
    this.tweens.add({
      targets: dj,
      y: dj.y + 3,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // "DJ" label
    this.add.text(djX, djY - SCALED_TILE, 'DJ', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(10);
    this.collisionTiles.add(`${12},${18}`);

    // ── SPEAKERS (bass visual) ──
    const spkL = this.add.rectangle(djX - SCALED_TILE * 1.5, djY, 20, 30, 0x1a1a1a).setDepth(5);
    const spkR = this.add.rectangle(djX + SCALED_TILE * 1.5, djY, 20, 30, 0x1a1a1a).setDepth(5);
    // Speaker cones
    this.add.circle(spkL.x, spkL.y, 8, 0x303030).setDepth(6);
    this.add.circle(spkR.x, spkR.y, 8, 0x303030).setDepth(6);
    // Bass pulse
    this.tweens.add({
      targets: [spkL, spkR],
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── PARTY PEOPLE (AI-driven) ──
    PartyAI.init(this, this.player);

    // ── DANCE FLOOR LIGHTS (on the ground near DJ) ──
    const floorColors = [0xff2080, 0x20c0ff, 0xf0c040, 0x40ff60, 0xc040ff, 0xff6030];
    for (let i = 0; i < 8; i++) {
      const fx = (32 + Math.random() * 6) * SCALED_TILE;
      const fy = (9 + Math.random() * 3) * SCALED_TILE;
      const floorLight = this.add.circle(fx, fy, 20 + Math.random() * 15,
        floorColors[Math.floor(Math.random() * floorColors.length)], 0
      ).setDepth(1);
      this.tweens.add({
        targets: floorLight,
        alpha: 0.15,
        duration: 600 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
    }

    // ── RED SOLO CUPS scattered around ──
    const cupPositions = [
      { x: 6, y: 2 }, { x: 19, y: 4 }, { x: 25, y: 6 },
      { x: 10, y: 9 }, { x: 22, y: 10 }, { x: 33, y: 9 },
      { x: 3, y: 6 }, { x: 17, y: 1 },
    ];
    for (const pos of cupPositions) {
      const cupX = pos.x * SCALED_TILE + SCALED_TILE / 2 + Phaser.Math.Between(-10, 10);
      const cupY = pos.y * SCALED_TILE + SCALED_TILE / 2 + Phaser.Math.Between(-5, 5);
      this.add.rectangle(cupX, cupY, 8, 12, 0xe03030).setDepth(3);
      this.add.rectangle(cupX, cupY - 6, 10, 2, 0xf04040).setDepth(3); // rim
    }

    // ── SMOKE HAZE (party fog) ──
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.currentDay !== 2) return;
        const haze = this.add.circle(
          this.player.x + Phaser.Math.Between(-250, 250),
          this.player.y + Phaser.Math.Between(-150, 150),
          40 + Math.random() * 30,
          0xcccccc, 0
        ).setDepth(7);
        this.tweens.add({
          targets: haze,
          alpha: 0.04,
          scaleX: 3,
          scaleY: 3,
          duration: 4000,
          yoyo: true,
          onComplete: () => haze.destroy(),
        });
      },
    });
  }

  // ─── BLOW OFFER + BLACKOUT SEQUENCE ─────────────────────────────
  private triggerBlowOffer() {
    if (this.blowOffered || this.frozen) return;
    this.blowOffered = true;
    this.frozen = true;

    // Camera shake — someone taps JP\'s shoulder
    this.cameras.main.shake(100, 0.002);

    const isKids = GameSettings.kidsMode;

    this.dialogue.show(isKids ? [
      { speaker: 'Narrator', text: 'Someone offers JP some candy.' },
      { speaker: '???', text: 'Hey! Want some Pixy Stix?' },
    ] : [
      { speaker: 'Narrator', text: 'Someone JP doesn\'t recognize pulls him aside.' },
      { speaker: '???', text: 'Aye. You want a bump?' },
    ], () => {
      const prompt = isKids ? 'Eat the Pixy Stix?' : 'Do a line?';
      const yes = isKids ? 'Yummy!' : 'Fuck it';
      const no = isKids ? 'No thanks!' : 'Nah I\'m good';
      this.showYesNoChoice(prompt, yes, no, () => {
        // YES — escalates to blackout
        this.partyLevel = 3;
        this.dialogue.show(isKids ? [
          { speaker: 'Narrator', text: 'JP pours the ENTIRE Pixy Stix in his mouth.' },
          { speaker: 'Narrator', text: 'SUGAR RUSH! Everything is BRIGHT and FAST!' },
          { speaker: 'JP\'s Mind', text: 'WOOOOOO!' },
        ] : [
          { speaker: 'Narrator', text: 'JP leans over the counter.' },
          { speaker: 'Narrator', text: 'Everything gets LOUD. The music. The people. His own heartbeat.' },
          { speaker: 'JP\'s Mind', text: 'Oh shit.' },
        ], () => {
          // Intense visual effects
          this.cameras.main.shake(500, 0.01);

          // White flash
          const flash = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
          ).setScrollFactor(0).setDepth(400);
          this.tweens.add({
            targets: flash,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => flash.destroy(),
          });

          // Hyped mood
          SubstanceSystem.hype();
          MoodSystem.setMood('hyped', 30);

          // More party chaos dialogue
          this.time.delayedCall(1500, () => {
            this.dialogue.show([
              { speaker: 'Big Bart', text: 'YOOOOO JP IS LOCKED IN!!' },
              { speaker: 'Narrator', text: 'JP doesn\'t remember the next hour.' },
              { speaker: 'Narrator', text: 'Flashes. Beer pong. Dancing on tables. More drinks.' },
              { speaker: 'Narrator', text: 'Someone hands him another line.' },
              { speaker: 'JP\'s Mind', text: 'I should stop.' },
              { speaker: 'Narrator', text: 'He doesn\'t stop.' },
            ], () => {
              // BLACKOUT
              this.triggerBlackout();
            });
          });
        });
      }, () => {
        // NO — stays sober enough, but the night is still young
        this.dialogue.show([
          { speaker: 'JP', text: 'Nah I\'m good.' },
          { speaker: '???', text: 'Suit yourself.' },
          { speaker: 'JP\'s Mind', text: 'At least I got that right.' },
          { speaker: 'JP\'s Mind', text: 'Party\'s still going though. Don\'t waste it.' },
        ], () => {
          this.frozen = false;
          // Girls are already out — interact with them to continue the night
        });
      });
    });
  }

  private triggerBlackout() {
    this.partyLevel = 4;
    this.blackedOut = true;
    this.frozen = true;

    // Kill all tweens/effects
    if (this.wobbleEffect) this.wobbleEffect.stop();

    // Rapid flash montage — fragments of the night
    const fragments = [
      'Beer pong. Cups flying.',
      'Dancing. Someone\'s on the table.',
      'Bart tackles someone into the pool.',
      'Girls screaming. Good screaming.',
      'Another shot. Another line.',
      'Nolan yelling. Can\'t hear what.',
      'Kissing someone. Two someones.',
      'The world spinning.',
      'Floor.',
    ];

    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    ).setScrollFactor(0).setDepth(500);

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 400,
    });

    // Flash each fragment quickly
    let delay = 600;
    for (let i = 0; i < fragments.length; i++) {
      this.time.delayedCall(delay, () => {
        const frag = this.add.text(
          GAME_WIDTH / 2 + Phaser.Math.Between(-80, 80),
          GAME_HEIGHT / 2 + Phaser.Math.Between(-40, 40),
          fragments[i],
          {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: i < 7 ? '10px' : '14px',
            color: i < 6 ? '#ffffff' : i === 7 ? '#f04040' : '#888888',
          }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

        this.tweens.add({
          targets: frag,
          alpha: 1,
          duration: 150,
          hold: i === fragments.length - 1 ? 1000 : 300,
          yoyo: true,
          onComplete: () => frag.destroy(),
        });

        // Camera shake gets worse
        if (i < 8) this.cameras.main.shake(200, 0.003 + i * 0.002);
      });
      delay += i < 6 ? 600 : i === 7 ? 800 : 1200;
    }

    // After all fragments — wake up scene
    this.time.delayedCall(delay + 1500, () => {
      // Full black, then slowly reveal
      const wakeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '...', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

      this.tweens.add({
        targets: wakeText,
        alpha: 1,
        duration: 1500,
        hold: 1000,
        yoyo: true,
        onComplete: () => {
          wakeText.destroy();

          // Spawn patio chair with slumped girl near hot tub
          const chairX = 35 * SCALED_TILE + SCALED_TILE / 2;
          const chairY = 6 * SCALED_TILE + SCALED_TILE / 2;
          // Chair (brown rectangle)
          this.add.rectangle(chairX, chairY, 30, 20, 0x6a5030).setDepth(5);
          this.add.rectangle(chairX, chairY - 14, 30, 8, 0x6a5030).setDepth(5); // back rest
          // Slumped girl on chair — tilted, sleeping
          const slumpedGirl = this.add.sprite(chairX, chairY - 6, 'npc_bikini1', 0)
            .setScale(SCALE).setDepth(9).setAngle(25);
          // Breathing animation — she\'s out cold
          this.tweens.add({
            targets: slumpedGirl,
            scaleY: SCALE * 0.95,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          // ZZZs from her
          this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => {
              if (!this.scene.isActive()) return;
              const z = this.add.text(chairX + 15, chairY - 25, 'z', {
                fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#8888aa',
              }).setDepth(20).setAlpha(0.6);
              this.tweens.add({
                targets: z, y: z.y - 20, alpha: 0, duration: 1800,
                onComplete: () => z.destroy(),
              });
            },
          });

          // Wake up somewhere random
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Sunlight. Concrete. The sound of waves.' },
            { speaker: 'Narrator', text: 'JP is lying on the ground next to the hot tub. Fully clothed. One shoe missing.' },
            { speaker: 'JP\'s Mind', text: '...what happened.' },
            { speaker: 'Narrator', text: 'His phone has 23 missed calls. K. Nolan. Mom.' },
            { speaker: 'Narrator', text: 'There\'s a girl slumped on a patio chair next to him. He doesn\'t know her name.' },
            { speaker: 'JP\'s Mind', text: 'I did some fucked up shit last night.' },
            { speaker: 'Narrator', text: 'Cooper walks out with coffee. Doesn\'t even look surprised.' },
            { speaker: 'Cooper', text: 'Bro. You were ON ONE last night.' },
            { speaker: 'JP', text: 'How bad?' },
            { speaker: 'Cooper', text: 'You don\'t wanna know.' },
            { speaker: 'JP\'s Mind', text: 'He\'s right. I don\'t.' },
          ], () => {
            // Remove party overlay, clear effects
            if (this.partyOverlay) {
              this.tweens.add({ targets: this.partyOverlay, alpha: 0, duration: 1000 });
            }
            overlay.destroy();

            // Move player to hot tub area (outside, on the ground)
            this.player.setPosition(33 * SCALED_TILE + SCALED_TILE / 2, 6 * SCALED_TILE + SCALED_TILE / 2);

            // Mark required interaction done — time to move to Wrong Crowd
            this.requiredDone = true;

            // Give player a clear direction cue — Nolan tells them to bounce
            this.time.delayedCall(500, () => {
              this.dialogue.show([
                { speaker: 'Nolan', text: 'Bro. You should probably head out before anyone else wakes up.' },
                { speaker: 'JP\'s Mind', text: 'Yeah. Time to go.' },
                { speaker: 'Narrator', text: 'Walk south to the street.' },
              ], () => {
                // Brief camera pan down toward exit arrow to show where to go
                const origX = this.cameras.main.scrollX;
                const origY = this.cameras.main.scrollY;
                this.cameras.main.stopFollow();
                this.tweens.add({
                  targets: this.cameras.main,
                  scrollY: origY + 400,
                  duration: 1200,
                  ease: 'Sine.easeInOut',
                  yoyo: true,
                  hold: 800,
                  onComplete: () => {
                    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
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

  // ─── BEER PONG MINIGAME ──────────────────────────────────────────
  private playBeerPong() {
    this.frozen = true;
    this.beerPongPlayed = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Table
    objects.push(this.add.rectangle(cx, cy, 600, 280, 0x2a5030)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, 590, 270, 0x306838)
      .setScrollFactor(0).setDepth(301));
    // Center line
    objects.push(this.add.rectangle(cx, cy, 2, 270, 0xffffff)
      .setScrollFactor(0).setDepth(302).setAlpha(0.3));

    // Title
    objects.push(this.add.text(cx, cy - 170, 'BEER PONG', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Instructions
    objects.push(this.add.text(cx, cy - 148, 'LEFT/RIGHT to aim  |  SPACE to shoot  |  Power fills automatically', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Cups — 6 per side (triangle: 3-2-1)
    const cupRadius = 16;
    const cupColor = 0xe03030;
    const cupSpacing = 38;

    // Opponent cups (right side)
    const oppCupPositions = [
      { x: cx + 220, y: cy - 50 }, { x: cx + 220, y: cy }, { x: cx + 220, y: cy + 50 },
      { x: cx + 258, y: cy - 25 }, { x: cx + 258, y: cy + 25 },
      { x: cx + 296, y: cy },
    ];

    // Player cups (left side)
    const myCupPositions = [
      { x: cx - 220, y: cy - 50 }, { x: cx - 220, y: cy }, { x: cx - 220, y: cy + 50 },
      { x: cx - 258, y: cy - 25 }, { x: cx - 258, y: cy + 25 },
      { x: cx - 296, y: cy },
    ];

    const oppCups: { obj: Phaser.GameObjects.Arc; hit: boolean; pos: { x: number; y: number } }[] = [];
    const myCups: { obj: Phaser.GameObjects.Arc; hit: boolean }[] = [];

    for (const pos of oppCupPositions) {
      const cup = this.add.circle(pos.x, pos.y, cupRadius, cupColor).setScrollFactor(0).setDepth(302);
      // Beer inside
      const beer = this.add.circle(pos.x, pos.y, cupRadius - 4, 0xf0c040).setScrollFactor(0).setDepth(302).setAlpha(0.6);
      objects.push(cup, beer);
      oppCups.push({ obj: cup, hit: false, pos });
    }

    for (const pos of myCupPositions) {
      const cup = this.add.circle(pos.x, pos.y, cupRadius, cupColor).setScrollFactor(0).setDepth(302);
      const beer = this.add.circle(pos.x, pos.y, cupRadius - 4, 0xf0c040).setScrollFactor(0).setDepth(302).setAlpha(0.6);
      objects.push(cup, beer);
      myCups.push({ obj: cup, hit: false });
    }

    // Score
    let jpScore = 0;
    let oppScore = 0;
    let jpTurn = true;
    let shots = 0;
    const maxShots = 12;

    const scoreText = this.add.text(cx, cy + 160, 'JP: 0  |  THEM: 0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(scoreText);

    const turnText = this.add.text(cx, cy + 180, 'YOUR SHOT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#60c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(turnText);

    // Aiming cursor (moves up/down)
    let aimY = cy;
    let aimDir = 1;
    const aimSpeed = 2;
    const aimCursor = this.add.triangle(cx - 160, aimY, 0, -8, 0, 8, 12, 0, 0xffffff)
      .setScrollFactor(0).setDepth(304);
    objects.push(aimCursor);

    // Power bar
    let power = 0;
    let powerDir = 1;
    const powerBarBg = this.add.rectangle(cx - 330, cy, 20, 200, 0x333333)
      .setScrollFactor(0).setDepth(302);
    objects.push(powerBarBg);
    const powerBar = this.add.rectangle(cx - 330, cy + 100, 16, 0, 0x30c060)
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(303);
    objects.push(powerBar);

    let shooting = false;
    let gameOver = false;

    // Game loop
    const updateEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (gameOver || shooting) return;

        if (jpTurn) {
          // Move aim cursor
          aimY += aimSpeed * aimDir;
          if (aimY > cy + 100) aimDir = -1;
          if (aimY < cy - 100) aimDir = 1;
          aimCursor.setY(aimY);

          // Power oscillates
          power += 1.5 * powerDir;
          if (power > 100) powerDir = -1;
          if (power < 0) powerDir = 1;
          powerBar.setSize(16, power * 2);
          powerBar.setFillStyle(power > 70 ? 0x30c060 : power > 40 ? 0xf0c040 : 0xf04040);
        }
      },
    });

    // Shoot handler
    const shoot = () => {
      if (!jpTurn || shooting || gameOver) return;
      shooting = true;

      // Ball animation
      const ball = this.add.circle(cx - 140, aimY, 8, 0xffffff)
        .setScrollFactor(0).setDepth(305);
      objects.push(ball);

      // Arc toward opponent cups based on aim + power
      const targetX = cx + 220 + (power / 100) * 80;
      const targetY = aimY;

      this.tweens.add({
        targets: ball,
        x: targetX,
        y: targetY - 30,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Drop
          this.tweens.add({
            targets: ball,
            y: targetY,
            duration: 200,
            ease: 'Bounce.easeOut',
            onComplete: () => {
              // Check hit
              let hitCup = false;
              for (const cup of oppCups) {
                if (cup.hit) continue;
                const dist = Math.sqrt((ball.x - cup.pos.x) ** 2 + (ball.y - cup.pos.y) ** 2);
                if (dist < cupRadius + 8) {
                  // HIT!
                  hitCup = true;
                  cup.hit = true;
                  jpScore++;

                  // Cup disappears
                  this.tweens.add({ targets: cup.obj, alpha: 0.2, scaleX: 0.5, scaleY: 0.5, duration: 300 });

                  // Hit text
                  const hitText = this.add.text(cup.pos.x, cup.pos.y - 20, 'SPLASH!', {
                    fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
                  this.tweens.add({
                    targets: hitText,
                    y: hitText.y - 30,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => hitText.destroy(),
                  });
                  break;
                }
              }

              if (!hitCup) {
                // Miss text
                const missText = this.add.text(ball.x, ball.y - 15, 'MISS', {
                  fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f04040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
                this.tweens.add({
                  targets: missText,
                  alpha: 0,
                  duration: 600,
                  onComplete: () => missText.destroy(),
                });
              }

              ball.destroy();
              scoreText.setText(`JP: ${jpScore}  |  THEM: ${oppScore}`);
              shots++;

              // Check game over
              if (jpScore >= 6 || oppScore >= 6 || shots >= maxShots) {
                gameOver = true;
                updateEvent.remove();
                spaceKey.off('down', shootHandler);
                this.time.delayedCall(800, () => this.endBeerPong(jpScore, oppScore, objects));
                return;
              }

              // Opponent turn
              jpTurn = false;
              turnText.setText('THEIR SHOT').setColor('#f04040');
              aimCursor.setAlpha(0.3);

              this.time.delayedCall(1200, () => {
                // Opponent shoots (40% hit rate)
                const hit = Math.random() < 0.4;
                if (hit) {
                  const available = myCups.filter(c => !c.hit);
                  if (available.length > 0) {
                    const target = available[Math.floor(Math.random() * available.length)];
                    target.hit = true;
                    oppScore++;
                    this.tweens.add({ targets: target.obj, alpha: 0.2, scaleX: 0.5, scaleY: 0.5, duration: 300 });
                  }
                }

                scoreText.setText(`JP: ${jpScore}  |  THEM: ${oppScore}`);
                shots++;

                if (jpScore >= 6 || oppScore >= 6 || shots >= maxShots) {
                  gameOver = true;
                  updateEvent.remove();
                  spaceKey.off('down', shootHandler);
                  this.time.delayedCall(800, () => this.endBeerPong(jpScore, oppScore, objects));
                  return;
                }

                // Back to player
                jpTurn = true;
                turnText.setText('YOUR SHOT').setColor('#60c060');
                aimCursor.setAlpha(1);
                shooting = false;
              });
            },
          });
        },
      });
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const shootHandler = () => shoot();
    spaceKey.on('down', shootHandler);
  }

  private endBeerPong(jpScore: number, oppScore: number, objects: Phaser.GameObjects.GameObject[]) {
    const won = jpScore > oppScore;

    const lines: DialogueLine[] = won ? [
      { speaker: 'Narrator', text: `JP sinks ${jpScore} cups. The table erupts.` },
      { speaker: 'Big Bart', text: 'THAT\'S MY BOY!! LET\'S GOOO!' },
      { speaker: 'Narrator', text: 'Bart bear-hugs JP so hard he lifts him off the ground.' },
    ] : [
      { speaker: 'Narrator', text: 'JP only hits ' + jpScore + '. Not his night.' },
      { speaker: 'Cooper', text: 'It\'s all good bro. Next round.' },
      { speaker: 'Big Bart', text: 'NAH NAH RUN IT BACK! RUN IT BACK!' },
    ];

    if (won) {
      SubstanceSystem.hype();
      MoodSystem.setMood('hyped', 30);
    }

    // Clean up
    for (const obj of objects) {
      if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
    }

    this.dialogue.show(lines, () => {
      this.frozen = false;
    });
  }

  private playVolleyballMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let jpScore = 0;
    let oppScore = 0;
    const winScore = 5;
    let active = true;
    let rallyCount = 0;

    // Court bounds
    const courtLeft = 80;
    const courtRight = GAME_WIDTH - 80;
    const courtTop = 170;
    const courtBottom = GAME_HEIGHT - 100;
    const netX = GAME_WIDTH / 2;
    const groundY = courtBottom - 30;

    // Ball state
    let ballX = GAME_WIDTH / 4;
    let ballY = courtTop + 60;
    let ballVX = 0;
    let ballVY = 0;
    const gravity = 0.15;
    let ballSpeed = 5;
    let ballOnJPSide = true;
    let waitingForServe = true;
    let oppReturning = false;
    let pointScored = false;
    let isSpiking = false;

    // Spike trail objects (cleaned up each frame)
    const trailObjects: Phaser.GameObjects.GameObject[] = [];

    // Opponent return delay (gets faster each rally)
    let oppBaseDelay = 800;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Sand background
    const sand = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 60, GAME_HEIGHT - 120, 0xd4b896)
      .setScrollFactor(0).setDepth(300);
    objects.push(sand);

    // Net
    const net = this.add.rectangle(netX, (courtTop + courtBottom) / 2, 6, courtBottom - courtTop, 0xffffff, 0.5)
      .setScrollFactor(0).setDepth(301);
    objects.push(net);

    // Net top bar
    const netTop = this.add.rectangle(netX, courtTop, 30, 4, 0xffffff, 0.7)
      .setScrollFactor(0).setDepth(301);
    objects.push(netTop);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'BEACH VOLLEYBALL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(title);

    // Score display
    const scoreText = this.add.text(GAME_WIDTH / 2, 120, `JP: 0  |  OPP: 0`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(scoreText);

    // Rally counter
    const rallyText = this.add.text(GAME_WIDTH / 2, 150, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(rallyText);

    // Crowd reaction text (for RALLY! / INSANE RALLY!)
    const crowdText = this.add.text(GAME_WIDTH / 2, 50, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ff6644',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(0);
    objects.push(crowdText);

    // Score reaction text (NICE! / ...)
    const scoreReactionText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(0);
    objects.push(scoreReactionText);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'UP/DOWN to move, SPACE to hit!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(instr);

    // JP sprite (left side)
    const jpSprite = this.add.sprite(GAME_WIDTH / 4, groundY - 30, this.getPlayerTexture(), 0)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Opponent sprite (right side)
    const oppSprite = this.add.sprite(GAME_WIDTH * 3 / 4, groundY - 30, 'npc_inmate', 0)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(oppSprite);

    // Ball
    const ball = this.add.circle(ballX, ballY, 10, 0xffffff)
      .setScrollFactor(0).setDepth(303);
    objects.push(ball);

    // Ball shadow — ellipse on the ground that tracks ball X, scales with ball Y
    const shadow = this.add.ellipse(ballX, groundY + 10, 16, 6, 0x000000, 0.2)
      .setScrollFactor(0).setDepth(301);
    objects.push(shadow);

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- Helper: show crowd reaction text ---
    const showCrowdReaction = () => {
      if (rallyCount >= 8) {
        crowdText.setText('INSANE RALLY!');
        crowdText.setColor('#ff2222');
        crowdText.setAlpha(1);
        crowdText.setScale(1);
        // Pulse effect
        this.tweens.add({
          targets: crowdText,
          scale: 1.3,
          duration: 150,
          yoyo: true,
          repeat: 2,
        });
        // Screen shake
        this.cameras.main.shake(200, 0.01);
      } else if (rallyCount >= 5) {
        crowdText.setText('RALLY!');
        crowdText.setColor('#ff6644');
        crowdText.setAlpha(1);
        crowdText.setScale(1);
        // Pulse effect
        this.tweens.add({
          targets: crowdText,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          repeat: 1,
        });
      } else {
        crowdText.setAlpha(0);
      }
    };

    // --- Helper: show score reaction near JP sprite ---
    const showScoreReaction = (jpScored: boolean) => {
      scoreReactionText.setText(jpScored ? 'NICE!' : '...');
      scoreReactionText.setColor(jpScored ? '#40ff40' : '#ff4444');
      scoreReactionText.setPosition(jpSprite.x, jpSprite.y - 40);
      scoreReactionText.setAlpha(1);
      scoreReactionText.setScale(1);
      this.tweens.add({
        targets: scoreReactionText,
        y: scoreReactionText.y - 20,
        alpha: 0,
        duration: 1200,
        ease: 'Quad.easeOut',
      });
    };

    // --- Helper: net ripple when ball passes near ---
    const triggerNetRipple = () => {
      this.tweens.add({
        targets: net,
        scaleX: 1.6,
        duration: 80,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          net.setScale(1, 1);
        },
      });
    };

    // --- Helper: spawn spike trail ---
    const spawnSpikeTrail = () => {
      const trail = this.add.circle(ballX, ballY, 6, 0xffffff, 0.6)
        .setScrollFactor(0).setDepth(302);
      trailObjects.push(trail);
      objects.push(trail);
      this.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.2,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => {
          trail.destroy();
          const idx = trailObjects.indexOf(trail);
          if (idx >= 0) trailObjects.splice(idx, 1);
        },
      });
    };

    const updateRallyDisplay = () => {
      if (rallyCount <= 1) {
        rallyText.setText('');
      } else if (rallyCount <= 3) {
        rallyText.setText('!');
      } else if (rallyCount <= 5) {
        rallyText.setText('!!');
      } else if (rallyCount <= 8) {
        rallyText.setText('!!!');
      } else {
        rallyText.setText('RALLY!');
      }
      showCrowdReaction();
    };

    const serveBall = (toJP: boolean) => {
      pointScored = false;
      waitingForServe = false;
      oppReturning = false;
      rallyCount = 0;
      ballSpeed = 5;
      oppBaseDelay = 800;
      isSpiking = false;
      crowdText.setAlpha(0);
      updateRallyDisplay();

      if (toJP) {
        // Serve to JP\'s side
        ballX = GAME_WIDTH / 4 + Phaser.Math.Between(-80, 80);
        ballY = courtTop + 40;
        ballVX = Phaser.Math.Between(-1, 1);
        ballVY = 2;
        ballOnJPSide = true;
      } else {
        // Serve to opponent\'s side
        ballX = GAME_WIDTH * 3 / 4 + Phaser.Math.Between(-80, 80);
        ballY = courtTop + 40;
        ballVX = Phaser.Math.Between(-1, 1);
        ballVY = 2;
        ballOnJPSide = false;
      }
      ball.setPosition(ballX, ballY);
      ball.setFillStyle(0xffffff);
    };

    const scorePoint = (jpScored: boolean) => {
      if (pointScored) return;
      pointScored = true;
      isSpiking = false;
      rallyCount = 0;
      crowdText.setAlpha(0);
      updateRallyDisplay();

      // Show score reaction near JP
      showScoreReaction(jpScored);

      if (jpScored) {
        jpScore++;
        ball.setFillStyle(0x40c040);
      } else {
        oppScore++;
        ball.setFillStyle(0xff4444);
      }

      scoreText.setText(`JP: ${jpScore}  |  OPP: ${oppScore}`);

      // Check for game end
      if (jpScore >= winScore || oppScore >= winScore) {
        endGame();
        return;
      }

      // Next serve after delay — loser receives
      waitingForServe = true;
      this.time.delayedCall(1200, () => {
        if (!active) return;
        serveBall(jpScored ? false : true);
      });
    };

    const oppReturnBall = () => {
      if (!active || pointScored || oppReturning) return;
      oppReturning = true;

      // Opponent delay decreases with rally count
      const delay = Math.max(300, oppBaseDelay - rallyCount * 50);

      this.time.delayedCall(delay, () => {
        if (!active || pointScored) return;
        oppReturning = false;

        // Opponent hit animation
        this.tweens.add({
          targets: oppSprite,
          scaleY: 5.5,
          duration: 80,
          yoyo: true,
        });

        rallyCount++;
        ballSpeed = Math.min(10, 5 + rallyCount * 0.4);
        updateRallyDisplay();

        // Send ball to JP\'s side
        const targetY = jpSprite.y + Phaser.Math.Between(-60, 60);
        const angle = Math.atan2(targetY - ballY, (GAME_WIDTH / 4 + Phaser.Math.Between(-80, 80)) - ballX);
        ballVX = Math.cos(angle) * ballSpeed;
        ballVY = -(4 + Math.random() * 2); // Arc up
        ballOnJPSide = true;
      });
    };

    const endGame = () => {
      active = false;
      isSpiking = false;
      this.events.off('update', updateHandler);

      const jpWon = jpScore >= winScore;
      if (jpWon) {
        MoodSystem.setMood('locked_in', 45);
      }
      title.setText(jpWon ? 'SET POINT!' : 'GAME OVER');

      const msg = jpWon
        ? 'JP takes the set. Beach king.'
        : "Not his day. But he\'ll be back.";

      instr.setText(`Final: JP ${jpScore} - ${oppScore} OPP`);

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
      objects.push(result);

      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }

        // Post-game dialogue
        const postGameLines: DialogueLine[] = jpWon
          ? [
              { speaker: 'Nolan', text: "Bro you\'re NICE at this!" },
              { speaker: 'JP', text: 'Run it back anytime.' },
            ]
          : [
              { speaker: 'Nolan', text: "We\'ll get you next time bro." },
              { speaker: 'JP', text: 'Whatever man.' },
            ];

        this.dialogue.show(postGameLines, () => {
          this.frozen = false;
          // Update Nolan\'s dialogue based on volleyball result
          this.volleyballPlayed = true;
          this.volleyballWon = jpWon;
          const nolan = this.npcs.find(n => n.id === 'ch1_nolan');
          if (nolan) {
            nolan.dialogue = jpWon
              ? [
                  { speaker: 'Nolan', text: 'Bro you killed it out there.' },
                  { speaker: 'Nolan', text: 'Where\'d you learn to spike like that?' },
                  { speaker: 'JP', text: 'Natural talent.' },
                ]
              : [
                  { speaker: 'Nolan', text: 'Don\'t even trip bro. We go again later.' },
                  { speaker: 'JP', text: 'Yeah yeah.' },
                ];
          }
        });
      });
    };

    // Start with serve to JP
    this.time.delayedCall(500, () => {
      serveBall(true);
    });

    // Track previous ball position for net crossing detection
    let prevBallX = ballX;

    const updateHandler = () => {
      if (!active || waitingForServe) return;

      // Move JP up/down
      if (upKey.isDown) {
        jpSprite.y -= 4;
      } else if (downKey.isDown) {
        jpSprite.y += 4;
      }
      jpSprite.y = Phaser.Math.Clamp(jpSprite.y, courtTop + 30, groundY - 10);

      // Ball physics
      ballVY += gravity;
      ballX += ballVX;
      ballY += ballVY;

      // Keep ball in court horizontally
      if (ballX < courtLeft) {
        ballX = courtLeft;
        ballVX = Math.abs(ballVX);
      }
      if (ballX > courtRight) {
        ballX = courtRight;
        ballVX = -Math.abs(ballVX);
      }

      // Net ripple — detect ball crossing near the net
      if (Math.abs(ballX - netX) < 40 && Math.abs(prevBallX - netX) >= 40) {
        triggerNetRipple();
      }
      // Also trigger if ball is very close and moving through
      if (Math.abs(ballX - netX) < 20 && ((prevBallX < netX && ballX >= netX) || (prevBallX > netX && ballX <= netX))) {
        triggerNetRipple();
      }
      prevBallX = ballX;

      // Track which side ball is on
      ballOnJPSide = ballX < netX;

      ball.setPosition(ballX, ballY);

      // Update ball shadow — tracks X, scales with height
      shadow.setPosition(ballX, groundY + 10);
      const heightFromGround = Math.max(0, groundY - ballY);
      const maxHeight = groundY - courtTop;
      const shadowScale = Math.max(0.3, 1 - (heightFromGround / maxHeight) * 0.7);
      const shadowAlpha = Math.max(0.05, 0.25 - (heightFromGround / maxHeight) * 0.2);
      shadow.setScale(shadowScale, shadowScale * 0.5);
      shadow.setAlpha(shadowAlpha);

      // Spike trail effect
      if (isSpiking) {
        spawnSpikeTrail();
      }

      // Player hits ball when SPACE pressed and ball is near JP on JP\'s side
      if (spaceKey.isDown && ballOnJPSide && !pointScored) {
        const distX = Math.abs(ballX - jpSprite.x);
        const distY = Math.abs(ballY - jpSprite.y);
        if (distX < 60 && distY < 60) {
          // Hit! Send ball to opponent\'s side
          this.tweens.add({
            targets: jpSprite,
            scaleY: 5.5,
            duration: 80,
            yoyo: true,
          });

          rallyCount++;
          ballSpeed = Math.min(10, 5 + rallyCount * 0.4);
          updateRallyDisplay();

          // Check for spike — ball is high (near top of court)
          const isSpike = ballY < courtTop + 100;

          // Arc ball to opponent\'s side
          const targetX = GAME_WIDTH * 3 / 4 + Phaser.Math.Between(-80, 80);

          if (isSpike) {
            // SPIKE! Faster ball, flatter arc, enable trail
            const spikeSpeed = ballSpeed * 1.5;
            ballVX = (targetX - ballX) / 25;
            ballVY = -(2 + Math.random() * 1); // Flatter arc for spike
            // Scale velocities to spike speed
            const currentSpeed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
            if (currentSpeed > 0) {
              ballVX = (ballVX / currentSpeed) * spikeSpeed;
              ballVY = (ballVY / currentSpeed) * spikeSpeed;
            }
            isSpiking = true;
            // Turn off spike trail after a short time
            this.time.delayedCall(300, () => {
              isSpiking = false;
            });
          } else {
            ballVX = (targetX - ballX) / 40;
            ballVY = -(5 + Math.random() * 2);
            isSpiking = false;
          }

          ball.setFillStyle(0x40c040);
          this.time.delayedCall(150, () => {
            if (ball.active) ball.setFillStyle(0xffffff);
          });
        }
      }

      // Ball hits ground — point scored
      if (ballY > groundY && !pointScored) {
        isSpiking = false;
        if (ballOnJPSide) {
          // Ball hit JP\'s ground — opponent scores
          scorePoint(false);
        } else {
          // Ball hit opponent\'s ground — JP scores
          scorePoint(true);
        }
        return;
      }

      // Opponent AI — when ball is on their side and falling, they return it
      if (!ballOnJPSide && ballVY > 0 && !oppReturning && !pointScored) {
        // Move opponent toward ball
        if (oppSprite.y < ballY - 20) {
          oppSprite.y += 3;
        } else if (oppSprite.y > ballY + 20) {
          oppSprite.y -= 3;
        }
        oppSprite.y = Phaser.Math.Clamp(oppSprite.y, courtTop + 30, groundY - 10);

        // When ball is close enough, trigger return
        const distX = Math.abs(ballX - oppSprite.x);
        const distY = Math.abs(ballY - oppSprite.y);
        if (distX < 80 && distY < 80) {
          oppReturnBall();
        }
      }

      // Ball goes above screen — bring it back
      if (ballY < courtTop - 50) {
        ballVY = Math.abs(ballVY) * 0.5;
      }
    };

    this.events.on('update', updateHandler);
  }

  // ─── COMPUTER APPS MENU ───────────────────────────────────────────
  private showComputerApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 280, 350, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 282, 352, 0x4488ff, 0)
      .setStrokeStyle(2, 0x4488ff)
      .setScrollFactor(0).setDepth(299);

    const title = this.add.text(cx, cy - 155, 'DESKTOP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#4488ff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['Stocks Viewer', 'Sports Betting', 'Portfolio Tracker', 'Crypto', 'Casino', 'Close'];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 100 + i * 38;
      const isClose = app === 'Close';
      const isCasino = app === 'Casino';
      const isCrypto = app === 'Crypto';
      const btnColor = isClose ? 0x333333 : isCasino ? 0x0a3a1a : isCrypto ? 0x1a0a2a : 0x1a3355;
      const hoverColor = isClose ? 0x555555 : isCasino ? 0x1a5a2a : isCrypto ? 0x3a1a5a : 0x2a5580;

      const btn = this.add.rectangle(cx, y, 240, 34, btnColor)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const labelColor = isCasino ? '#f0c040' : isCrypto ? '#bb66ff' : '#ffffff';
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColor));
      btn.on('pointerout', () => btn.setFillStyle(btnColor));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'Stocks Viewer') this.showStocksViewer();
        else if (app === 'Sports Betting') this.showSportsBetting();
        else if (app === 'Portfolio Tracker') this.showPortfolioTracker();
        else if (app === 'Crypto') CasinoSystem.openCrypto(this, () => { this.showComputerApps(); });
        else if (app === 'Casino') CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      });

      buttons.push(btn);
      labels.push(label);
    });

    const cleanup = () => {
      bg.destroy();
      border.destroy();
      title.destroy();
      buttons.forEach(b => b.destroy());
      labels.forEach(l => l.destroy());
    };

    // Keyboard: 1-6 to pick
    const keys = [
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
    ];
    const handlers: (() => void)[] = [];
    keys.forEach((key, i) => {
      const handler = () => {
        keys.forEach((k, j) => k.off('down', handlers[j]));
        cleanup();
        if (i === 0) this.showStocksViewer();
        else if (i === 1) this.showSportsBetting();
        else if (i === 2) this.showPortfolioTracker();
        else if (i === 3) CasinoSystem.openCrypto(this, () => { this.showComputerApps(); });
        else if (i === 4) CasinoSystem.openCasino(this, () => { this.showComputerApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── STOCKS VIEWER APP ─────────────────────────────────────────────
  private showStocksViewer() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const screen = this.add.rectangle(cx, cy, 320, 400, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 322, 402, 0x22ff88, 0)
      .setStrokeStyle(2, 0x22ff88)
      .setScrollFactor(0).setDepth(299);

    const header = this.add.text(cx, cy - 175, 'ROBINHOOD', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#22ff88',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const subHeader = this.add.text(cx, cy - 145, 'WATCHLIST', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const tickers = [
      { name: 'LUNA', change: '+3,489%', color: '#22ff88' },
      { name: 'AAPL', change: '+2.3%', color: '#22ff88' },
      { name: 'TSLA', change: '-4.1%', color: '#ff4444' },
      { name: 'GME', change: '+420%', color: '#22ff88' },
    ];

    const elements: Phaser.GameObjects.GameObject[] = [screen, border, header, subHeader];

    tickers.forEach((t, i) => {
      const y = cy - 95 + i * 55;
      const sep = this.add.rectangle(cx, y - 20, 280, 1, 0x333333)
        .setScrollFactor(0).setDepth(301);
      const name = this.add.text(cx - 120, y, t.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
      const change = this.add.text(cx + 120, y, t.change, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: t.color,
      }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);
      elements.push(sep, name, change);
    });

    const hint = this.add.text(cx, cy + 170, '[SPACE] Close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    elements.push(hint);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      this.showComputerApps();
    };
    spaceKey.on('down', handler);
  }

  // ─── SPORTS BETTING APP ────────────────────────────────────────────
  private showSportsBetting() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const screen = this.add.rectangle(cx, cy, 320, 400, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 322, 402, 0xf0c040, 0)
      .setStrokeStyle(2, 0xf0c040)
      .setScrollFactor(0).setDepth(299);

    const header = this.add.text(cx, cy - 175, 'FANDUEL', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const subHeader = this.add.text(cx, cy - 145, 'PICK A BET', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Bet 1: Lakers vs Celtics
    const bet1Label = this.add.text(cx, cy - 100, 'Lakers vs Celtics', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const bet1Line = this.add.text(cx, cy - 80, 'Lakers -3.5', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const bet1Btn = this.add.rectangle(cx, cy - 50, 200, 32, 0x1a3355)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const bet1BtnText = this.add.text(cx, cy - 50, 'Place Bet ($50)', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

    // Bet 2: UFC 300
    const bet2Label = this.add.text(cx, cy + 10, 'UFC 300 Main Event', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const bet2Line = this.add.text(cx, cy + 30, 'KO Rd 1 (+450)', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const bet2Btn = this.add.rectangle(cx, cy + 60, 200, 32, 0x1a3355)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const bet2BtnText = this.add.text(cx, cy + 60, 'Place Bet ($50)', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

    const elements: Phaser.GameObjects.GameObject[] = [
      screen, border, header, subHeader,
      bet1Label, bet1Line, bet1Btn, bet1BtnText,
      bet2Label, bet2Line, bet2Btn, bet2BtnText,
    ];

    bet1Btn.on('pointerover', () => bet1Btn.setFillStyle(0x2a5580));
    bet1Btn.on('pointerout', () => bet1Btn.setFillStyle(0x1a3355));
    bet2Btn.on('pointerover', () => bet2Btn.setFillStyle(0x2a5580));
    bet2Btn.on('pointerout', () => bet2Btn.setFillStyle(0x1a3355));

    const showResult = (win: boolean) => {
      elements.forEach(e => e.destroy());
      this.showBetResult(win);
    };

    // Bet 1: 50/50
    bet1Btn.on('pointerdown', () => {
      const win = Math.random() >= 0.5;
      showResult(win);
    });

    // Bet 2: always wins
    bet2Btn.on('pointerdown', () => {
      showResult(true);
    });

    // Keyboard: 1 for bet 1, 2 for bet 2, space to close
    const key1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    const key2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const cleanKeys = () => {
      key1.off('down', h1);
      key2.off('down', h2);
      spaceKey.off('down', hSpace);
    };
    const h1 = () => { cleanKeys(); const win = Math.random() >= 0.5; showResult(win); };
    const h2 = () => { cleanKeys(); showResult(true); };
    const hSpace = () => { cleanKeys(); elements.forEach(e => e.destroy()); this.showComputerApps(); };
    key1.on('down', h1);
    key2.on('down', h2);
    spaceKey.on('down', hSpace);
  }

  private showBetResult(win: boolean) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 320, 200, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 322, 202, win ? 0x22ff88 : 0xff4444, 0)
      .setStrokeStyle(2, win ? 0x22ff88 : 0xff4444)
      .setScrollFactor(0).setDepth(299);

    const resultText = this.add.text(cx, cy - 40, win ? 'W' : 'L', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '36px', color: win ? '#22ff88' : '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const msgText = this.add.text(cx, cy + 10, win ? '+$275' : '-$50', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: win ? '#22ff88' : '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const flavorText = this.add.text(cx, cy + 50, win ? 'JP stays winning.' : 'House always wins.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const hint = this.add.text(cx, cy + 80, '[SPACE] Back', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    if (win) this.cameras.main.shake(300, 0.005);

    const elements = [bg, border, resultText, msgText, flavorText, hint];
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      this.showComputerApps();
    };
    spaceKey.on('down', handler);
  }

  // ─── PORTFOLIO TRACKER APP ─────────────────────────────────────────
  private showPortfolioTracker() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const hasLuna = this.lunaTraded;

    const cryptoVal = hasLuna ? '$42,468' : '$1,200';
    const netWorthVal = hasLuna ? '$39,268' : '-$2,000';
    const netColor = hasLuna ? '#22ff88' : '#ff4444';

    const screen = this.add.rectangle(cx, cy, 320, 360, 0x0a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 322, 362, 0x8844ff, 0)
      .setStrokeStyle(2, 0x8844ff)
      .setScrollFactor(0).setDepth(299);

    const header = this.add.text(cx, cy - 155, 'NET WORTH', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#8844ff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const lines = [
      { label: 'Crypto', value: cryptoVal, color: '#22ff88' },
      { label: 'Cash', value: '$200', color: '#ffffff' },
      { label: 'Debt', value: '-$3,400', color: '#ff4444' },
    ];

    const elements: Phaser.GameObjects.GameObject[] = [screen, border, header];

    lines.forEach((line, i) => {
      const y = cy - 90 + i * 55;
      const sep = this.add.rectangle(cx, y - 18, 280, 1, 0x333333)
        .setScrollFactor(0).setDepth(301);
      const label = this.add.text(cx - 120, y, line.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#888888',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
      const value = this.add.text(cx + 120, y, line.value, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: line.color,
      }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);
      elements.push(sep, label, value);
    });

    // Net worth total
    const totalSep = this.add.rectangle(cx, cy + 80, 280, 2, 0x8844ff)
      .setScrollFactor(0).setDepth(301);
    const totalLabel = this.add.text(cx - 120, cy + 105, 'Net Worth', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    const totalValue = this.add.text(cx + 120, cy + 105, netWorthVal, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: netColor,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);
    elements.push(totalSep, totalLabel, totalValue);

    const hint = this.add.text(cx, cy + 155, '[SPACE] Close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    elements.push(hint);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      this.showComputerApps();
    };
    spaceKey.on('down', handler);
  }

  // ─── PHONE APP STORE ───────────────────────────────────────────────
  private showPhoneApps() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Phone body — darker, taller than computer overlay
    const phoneBg = this.add.rectangle(cx, cy, 240, 370, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const phoneBorder = this.add.rectangle(cx, cy, 242, 372, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);
    // Notch at top center
    const notch = this.add.rectangle(cx, cy - 177, 60, 8, 0x0d0d1a)
      .setScrollFactor(0).setDepth(301);

    const timeText = this.add.text(cx, cy - 155, '9:41 AM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const apps = ['Messages', 'Weedmaps', 'Instagram', 'Casino', 'Close'];
    const appColors = [0x2a4a2a, 0x2a4a1a, 0x3a2a4a, 0x0a3a1a, 0x333344];
    const hoverColors = [0x3a6a3a, 0x3a6a2a, 0x5a3a6a, 0x1a5a2a, 0x555566];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    apps.forEach((app, i) => {
      const y = cy - 100 + i * 48;
      const btn = this.add.rectangle(cx, y, 200, 36, appColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const isCasino = app === 'Casino';
      const labelColor = isCasino ? '#f0c040' : '#ffffff';
      const label = this.add.text(cx, y, app, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: labelColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(hoverColors[i]));
      btn.on('pointerout', () => btn.setFillStyle(appColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (app === 'Messages') this.showPhoneMessages();
        else if (app === 'Weedmaps') this.showPhoneWeedmaps();
        else if (app === 'Instagram') DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
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

    // Keyboard: 1-5 to pick
    const keys = [
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];
    const handlers: (() => void)[] = [];
    keys.forEach((key, i) => {
      const handler = () => {
        keys.forEach((k, j) => k.off('down', handlers[j]));
        cleanup();
        if (i === 0) this.showPhoneMessages();
        else if (i === 1) this.showPhoneWeedmaps();
        else if (i === 2) DMSystem.openDMs(this, (l, cb) => this.dialogue.show(l, cb), () => this.showPhoneApps());
        else if (i === 3) CasinoSystem.openCasino(this, () => { this.showPhoneApps(); });
        else this.frozen = false;
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── PHONE: MESSAGES ──────────────────────────────────────────────
  private showPhoneMessages() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 260, 300, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 262, 302, 0x555577, 0)
      .setStrokeStyle(2, 0x555577)
      .setScrollFactor(0).setDepth(299);

    const header = this.add.text(cx, cy - 125, 'MESSAGES', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#6688cc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const threads = [
      { name: 'K \u2764\uFE0F',      preview: 'be safe. i love you' },
      { name: 'Plug \uD83D\uDD0C',   preview: 'say less. you know where im at' },
      { name: 'Mom',                  preview: 'call me when you get a chance' },
      { name: 'Nolan',                preview: 'bro where are the cups' },
    ];

    const elements: Phaser.GameObjects.GameObject[] = [bg, border, header];

    threads.forEach((t, i) => {
      const y = cy - 70 + i * 50;
      const sep = this.add.rectangle(cx, y - 18, 220, 1, 0x333344)
        .setScrollFactor(0).setDepth(301);
      const name = this.add.text(cx - 110, y - 5, t.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
      const preview = this.add.text(cx - 110, y + 10, t.preview, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#888899',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
      elements.push(sep, name, preview);
    });

    const hint = this.add.text(cx, cy + 130, '[SPACE] Back', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666677',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    elements.push(hint);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      this.showPhoneApps();
    };
    spaceKey.on('down', handler);
  }

  // ─── PHONE: WEEDMAPS ─────────────────────────────────────────────
  private showPhoneWeedmaps() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 260, 320, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 262, 322, 0x44aa44, 0)
      .setStrokeStyle(2, 0x44aa44)
      .setScrollFactor(0).setDepth(299);

    const header = this.add.text(cx, cy - 135, 'WEEDMAPS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#44aa44',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const shopName = this.add.text(cx, cy - 105, 'SB Green Room \u2014 0.3 mi', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const items = [
      { name: 'Top Shelf OG', price: '$45/8th' },
      { name: 'Blue Dream',   price: '$35/8th' },
      { name: 'Edibles',      price: '$25' },
    ];

    const elements: Phaser.GameObjects.GameObject[] = [bg, border, header, shopName];
    const itemBtns: Phaser.GameObjects.Rectangle[] = [];

    items.forEach((item, i) => {
      const y = cy - 55 + i * 55;
      const sep = this.add.rectangle(cx, y - 20, 220, 1, 0x2a3a2a)
        .setScrollFactor(0).setDepth(301);
      const nameText = this.add.text(cx - 100, y, item.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
      const priceText = this.add.text(cx + 100, y, item.price, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#44aa44',
      }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);

      const orderBtn = this.add.rectangle(cx, y + 20, 160, 24, 0x2a5a2a)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const orderLabel = this.add.text(cx, y + 20, 'Order', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      orderBtn.on('pointerover', () => orderBtn.setFillStyle(0x3a7a3a));
      orderBtn.on('pointerout', () => orderBtn.setFillStyle(0x2a5a2a));

      orderBtn.on('pointerdown', () => {
        cleanKeys();
        cleanup();
        this.showWeedmapsOrder(item.name);
      });

      elements.push(sep, nameText, priceText, orderBtn, orderLabel);
      itemBtns.push(orderBtn);
    });

    const hint = this.add.text(cx, cy + 140, '[1-3] Order  [SPACE] Back', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666677',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    elements.push(hint);

    const cleanup = () => { elements.forEach(e => e.destroy()); };

    const key1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    const key2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    const key3 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const cleanKeys = () => { key1.off('down', h1); key2.off('down', h2); key3.off('down', h3); spaceKey.off('down', hSpace); };
    const h1 = () => { cleanKeys(); cleanup(); this.showWeedmapsOrder(items[0].name); };
    const h2 = () => { cleanKeys(); cleanup(); this.showWeedmapsOrder(items[1].name); };
    const h3 = () => { cleanKeys(); cleanup(); this.showWeedmapsOrder(items[2].name); };
    const hSpace = () => { cleanKeys(); cleanup(); this.showPhoneApps(); };
    key1.on('down', h1); key2.on('down', h2); key3.on('down', h3); spaceKey.on('down', hSpace);
  }

  private showWeedmapsOrder(itemName: string) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, 260, 160, 0x1a1a2e)
      .setScrollFactor(0).setDepth(300);
    const border = this.add.rectangle(cx, cy, 262, 162, 0x44aa44, 0)
      .setStrokeStyle(2, 0x44aa44)
      .setScrollFactor(0).setDepth(299);

    const checkmark = this.add.text(cx, cy - 40, '\u2713', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#44aa44',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const msg = this.add.text(cx, cy, 'Order placed.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const msg2 = this.add.text(cx, cy + 20, 'Pick up in 30 min.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const hint = this.add.text(cx, cy + 55, '[SPACE] Back', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666677',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Add item to inventory
    if (itemName === 'Edibles') {
      InventorySystem.addItem('edible', 1);
    } else {
      InventorySystem.addItem('eighth', 1);
    }

    const elements = [bg, border, checkmark, msg, msg2, hint];
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      this.showPhoneApps();
    };
    spaceKey.on('down', handler);
  }


  // ─── ARM WRESTLING MINIGAME (Big Bart) ──────────────────────────
  private playArmWrestle() {
    this.armWrestlePlayed = true;
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Title
    objects.push(this.add.text(cx, cy - 130, 'ARM WRESTLE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    objects.push(this.add.text(cx, cy - 108, 'MASH A KEY AS FAST AS POSSIBLE!', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Table
    objects.push(this.add.rectangle(cx, cy + 30, 300, 20, 0x5a3a20)
      .setScrollFactor(0).setDepth(301));

    // Arms (rectangles) — JP on right, Bart on left
    const armY = cy + 10;
    const jpArm = this.add.rectangle(cx + 40, armY, 60, 18, 0xd4a574)
      .setScrollFactor(0).setDepth(302);
    objects.push(jpArm);

    const bartArm = this.add.rectangle(cx - 40, armY, 70, 22, 0xc48a54)
      .setScrollFactor(0).setDepth(302);
    objects.push(bartArm);

    // Hands (clasped in center)
    const handGrip = this.add.circle(cx, armY, 12, 0xe0b080)
      .setScrollFactor(0).setDepth(303);
    objects.push(handGrip);

    // Labels
    objects.push(this.add.text(cx + 80, armY - 30, 'JP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#60c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    objects.push(this.add.text(cx - 80, armY - 30, 'BART', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f04040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Power meter — horizontal bar
    const meterBg = this.add.rectangle(cx, cy - 60, 260, 24, 0x333333)
      .setScrollFactor(0).setDepth(301);
    objects.push(meterBg);

    // Meter fill — starts at center (130px = neutral), JP pushes right, Bart pushes left
    let meterValue = 0; // -100 (Bart wins) to +100 (JP wins), starts at 0
    const meterFill = this.add.rectangle(cx, cy - 60, 4, 20, 0xf0c040)
      .setScrollFactor(0).setDepth(302);
    objects.push(meterFill);

    // Center line
    objects.push(this.add.rectangle(cx, cy - 60, 2, 28, 0xffffff)
      .setScrollFactor(0).setDepth(303).setAlpha(0.5));

    // Timer
    let timeLeft = 5;
    const timerText = this.add.text(cx, cy + 70, '5.0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(timerText);

    let taps = 0;
    let gameOver = false;

    // Bart auto-taps (simulated strength)
    const bartTimer = this.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => {
        if (gameOver) return;
        meterValue -= 4; // Bart pushes steadily
        meterValue = Math.max(-100, Math.min(100, meterValue));
      },
    });

    // Player tap handler
    const tapHandler = () => {
      if (gameOver) return;
      taps++;
      meterValue += 5;
      meterValue = Math.max(-100, Math.min(100, meterValue));
      // Camera shake on each tap
      this.cameras.main.shake(30, 0.002);
    };

    // Listen for A key, SPACE, or any key really
    const aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    aKey.on('down', tapHandler);
    spaceKey.on('down', tapHandler);
    this.input.on('pointerdown', tapHandler);

    // Game loop — update meter visual + timer
    const updateTimer = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (gameOver) return;
        // Update meter visual
        const width = Math.abs(meterValue) * 1.3;
        meterFill.setSize(Math.max(4, width), 20);
        if (meterValue >= 0) {
          meterFill.setPosition(cx + meterValue * 0.65, cy - 60);
          meterFill.setFillStyle(0x60c060);
        } else {
          meterFill.setPosition(cx + meterValue * 0.65, cy - 60);
          meterFill.setFillStyle(0xf04040);
        }

        // Tilt the arms based on meter
        const tilt = meterValue / 100 * 25;
        handGrip.setPosition(cx + tilt, armY);
        jpArm.setPosition(cx + 40 + tilt * 0.5, armY);
        bartArm.setPosition(cx - 40 + tilt * 0.5, armY);
      },
    });

    // Countdown
    const countdownTimer = this.time.addEvent({
      delay: 100,
      repeat: 49,
      callback: () => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) timeLeft = 0;
        timerText.setText(timeLeft.toFixed(1));

        if (timeLeft <= 0 && !gameOver) {
          gameOver = true;
          aKey.off('down', tapHandler);
          spaceKey.off('down', tapHandler);
          this.input.off('pointerdown', tapHandler);
          bartTimer.remove();
          updateTimer.remove();

          const won = taps >= 20 && meterValue > 0;

          // Clean up
          this.time.delayedCall(500, () => {
            for (const obj of objects) {
              if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
            }

            const lines: DialogueLine[] = won ? [
              { speaker: 'JP', text: 'LETS GOOO!!' },
              { speaker: 'Big Bart', text: 'HOW.' },
              { speaker: 'Narrator', text: 'The whole table goes silent. Bart stares at his arm.' },
              { speaker: 'Big Bart', text: '...best of three?' },
              { speaker: 'Narrator', text: 'JP\'s confidence is through the roof.' },
            ] : [
              { speaker: 'Narrator', text: 'Bart slams JP\'s arm down like a pancake.' },
              { speaker: 'Big Bart', text: 'NOT EVEN CLOSE.' },
              { speaker: 'Narrator', text: 'The crowd laughs. Even JP laughs.' },
              { speaker: 'JP', text: 'Bro you\'re like 280 pounds.' },
              { speaker: 'Big Bart', text: '295 ACTUALLY.' },
            ];

            if (won) {
              MoodSystem.changeMorale(15);
              try { localStorage.setItem('jdlo_arm_wrestle_won', 'true'); } catch {}
            }

            this.dialogue.show(lines, () => { this.frozen = false; });
          });
        }
      },
    });
  }

  // ─── ROLLING CONTEST MINIGAME ──────────────────────────────────
  private playRollingContest() {
    this.rollingContestPlayed = true;
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Title
    objects.push(this.add.text(cx, cy - 120, 'WHO CAN ROLL THE FATTEST?', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#80c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    objects.push(this.add.text(cx, cy - 98, 'Press SPACE in the GREEN zone!', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Timing bar
    const barWidth = 300;
    const barHeight = 30;
    const barX = cx - barWidth / 2;
    const barY = cy - 20;

    // Background
    objects.push(this.add.rectangle(cx, barY + barHeight / 2, barWidth, barHeight, 0x333333)
      .setScrollFactor(0).setDepth(301));

    // Red zone (full bar)
    objects.push(this.add.rectangle(cx, barY + barHeight / 2, barWidth - 4, barHeight - 4, 0xcc3333)
      .setScrollFactor(0).setDepth(302));

    // Yellow zone (middle 40%)
    const yellowWidth = barWidth * 0.4;
    objects.push(this.add.rectangle(cx, barY + barHeight / 2, yellowWidth, barHeight - 4, 0xcccc33)
      .setScrollFactor(0).setDepth(302));

    // Green zone (center 15%)
    const greenWidth = barWidth * 0.15;
    objects.push(this.add.rectangle(cx, barY + barHeight / 2, greenWidth, barHeight - 4, 0x33cc33)
      .setScrollFactor(0).setDepth(302));

    // Moving indicator
    let indicatorPos = 0; // 0 to barWidth
    let indicatorDir = 1;
    const indicatorSpeed = 4;
    const indicator = this.add.rectangle(barX + 2, barY + barHeight / 2, 4, barHeight + 6, 0xffffff)
      .setScrollFactor(0).setDepth(304);
    objects.push(indicator);

    let pressed = false;

    // Game loop — move indicator back and forth
    const updateEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (pressed) return;
        indicatorPos += indicatorSpeed * indicatorDir;
        if (indicatorPos >= barWidth) { indicatorPos = barWidth; indicatorDir = -1; }
        if (indicatorPos <= 0) { indicatorPos = 0; indicatorDir = 1; }
        indicator.setX(barX + indicatorPos);
      },
    });

    const pressHandler = () => {
      if (pressed) return;
      pressed = true;
      updateEvent.remove();
      spaceKey.off('down', pressHandler);
      this.input.off('pointerdown', pressHandler);

      // Determine zone: green = center 15%, yellow = center 40%, red = rest
      const normalizedPos = indicatorPos / barWidth; // 0 to 1
      const distFromCenter = Math.abs(normalizedPos - 0.5);

      let result: 'perfect' | 'decent' | 'bad';
      if (distFromCenter <= 0.075) {
        result = 'perfect';
      } else if (distFromCenter <= 0.2) {
        result = 'decent';
      } else {
        result = 'bad';
      }

      // Flash indicator
      this.tweens.add({
        targets: indicator,
        alpha: 0,
        duration: 200,
        yoyo: true,
        repeat: 2,
      });

      this.time.delayedCall(800, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }

        const lines: DialogueLine[] = result === 'perfect' ? [
          { speaker: 'Narrator', text: 'JP rolls it. Tight. Even. Perfect cone.' },
          { speaker: 'Cooper', text: 'That\'s a cannon.' },
          { speaker: 'Big Bart', text: 'HOW IS HE THIS GOOD AT EVERYTHING.' },
          { speaker: 'Narrator', text: 'The whole table goes quiet looking at this perfect roll.' },
          { speaker: 'JP\'s Mind', text: 'Track record.' },
        ] : result === 'decent' ? [
          { speaker: 'Narrator', text: 'JP rolls it. A little uneven but it\'ll smoke.' },
          { speaker: 'Nolan', text: 'Not bad.' },
          { speaker: 'Big Bart', text: 'I\'ve seen worse. I\'ve also seen better.' },
          { speaker: 'JP', text: 'It\'s functional.' },
        ] : [
          { speaker: 'Narrator', text: 'JP tries. The paper tears. Weed falls out.' },
          { speaker: 'Cooper', text: 'Bro that\'s a toothpick.' },
          { speaker: 'Narrator', text: 'Everyone laughs. Even JP.' },
          { speaker: 'Big Bart', text: 'GIVE ME THAT. Let a real one handle this.' },
          { speaker: 'Narrator', text: 'Bart rolls a perfect blunt in 8 seconds. Nobody\'s surprised.' },
        ];

        if (result === 'perfect') {
          MoodSystem.changeMorale(10);
          try { localStorage.setItem('jdlo_perfect_roll', 'true'); } catch {}
        }

        this.dialogue.show(lines, () => { this.frozen = false; });
      });
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', pressHandler);
    this.input.on('pointerdown', pressHandler);
  }

  // ─── BEER PONG TOURNAMENT ROUND 2 ─────────────────────────────
  private playBeerPongRound2() {
    // Same as regular beer pong but harder — smaller cups (radius 12), opponent 55% hit rate
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    objects.push(this.add.rectangle(cx, cy, 600, 280, 0x2a5030)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, 590, 270, 0x306838)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, 2, 270, 0xffffff)
      .setScrollFactor(0).setDepth(302).setAlpha(0.3));

    objects.push(this.add.text(cx, cy - 170, 'BEER PONG - FINALS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f04040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    objects.push(this.add.text(cx, cy - 148, 'LEFT/RIGHT aim  |  SPACE shoot  |  HARDER OPPONENT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ff8888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Smaller cups for harder round
    const cupRadius = 12;
    const cupColor = 0xe03030;

    const oppCupPositions = [
      { x: cx + 220, y: cy - 50 }, { x: cx + 220, y: cy }, { x: cx + 220, y: cy + 50 },
      { x: cx + 258, y: cy - 25 }, { x: cx + 258, y: cy + 25 },
      { x: cx + 296, y: cy },
    ];
    const myCupPositions = [
      { x: cx - 220, y: cy - 50 }, { x: cx - 220, y: cy }, { x: cx - 220, y: cy + 50 },
      { x: cx - 258, y: cy - 25 }, { x: cx - 258, y: cy + 25 },
      { x: cx - 296, y: cy },
    ];

    const oppCups: { obj: Phaser.GameObjects.Arc; hit: boolean; pos: { x: number; y: number } }[] = [];
    const myCups: { obj: Phaser.GameObjects.Arc; hit: boolean }[] = [];

    for (const pos of oppCupPositions) {
      const cup = this.add.circle(pos.x, pos.y, cupRadius, cupColor).setScrollFactor(0).setDepth(302);
      const beer = this.add.circle(pos.x, pos.y, cupRadius - 3, 0xf0c040).setScrollFactor(0).setDepth(302).setAlpha(0.6);
      objects.push(cup, beer);
      oppCups.push({ obj: cup, hit: false, pos });
    }
    for (const pos of myCupPositions) {
      const cup = this.add.circle(pos.x, pos.y, cupRadius, cupColor).setScrollFactor(0).setDepth(302);
      const beer = this.add.circle(pos.x, pos.y, cupRadius - 3, 0xf0c040).setScrollFactor(0).setDepth(302).setAlpha(0.6);
      objects.push(cup, beer);
      myCups.push({ obj: cup, hit: false });
    }

    let jpScore = 0;
    let oppScore = 0;
    let jpTurn = true;
    let shots = 0;
    const maxShots = 12;

    const scoreText = this.add.text(cx, cy + 160, 'JP: 0  |  THEM: 0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(scoreText);

    const turnText = this.add.text(cx, cy + 180, 'YOUR SHOT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#60c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(turnText);

    let aimY = cy;
    let aimDir = 1;
    const aimSpeed = 2.5; // Faster aim movement
    const aimCursor = this.add.triangle(cx - 160, aimY, 0, -8, 0, 8, 12, 0, 0xffffff)
      .setScrollFactor(0).setDepth(304);
    objects.push(aimCursor);

    let power = 0;
    let powerDir = 1;
    const powerBarBg = this.add.rectangle(cx - 330, cy, 20, 200, 0x333333)
      .setScrollFactor(0).setDepth(302);
    objects.push(powerBarBg);
    const powerBar = this.add.rectangle(cx - 330, cy + 100, 16, 0, 0x30c060)
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(303);
    objects.push(powerBar);

    let shooting = false;
    let gameOver = false;

    const updateEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (gameOver || shooting) return;
        if (jpTurn) {
          aimY += aimSpeed * aimDir;
          if (aimY > cy + 100) aimDir = -1;
          if (aimY < cy - 100) aimDir = 1;
          aimCursor.setY(aimY);
          power += 2 * powerDir; // Faster power
          if (power > 100) powerDir = -1;
          if (power < 0) powerDir = 1;
          powerBar.setSize(16, power * 2);
          powerBar.setFillStyle(power > 70 ? 0x30c060 : power > 40 ? 0xf0c040 : 0xf04040);
        }
      },
    });

    const endRound2 = () => {
      const won = jpScore > oppScore;
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }

      if (won) {
        this.beerPongTournamentWon = true;
        SubstanceSystem.hype();
        MoodSystem.setMood('hyped', 60);
        try { localStorage.setItem('jdlo_bp_champion', 'true'); } catch {}

        // TOURNAMENT CHAMPION text
        const champBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9)
          .setScrollFactor(0).setDepth(300);
        const champText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'TOURNAMENT CHAMPION', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#f0c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
        const champSub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'The crowd goes INSANE', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        this.cameras.main.shake(500, 0.01);

        this.time.delayedCall(2500, () => {
          champBg.destroy(); champText.destroy(); champSub.destroy();
          this.dialogue.show([
            { speaker: 'Big Bart', text: 'NOBODY CAN BEAT THIS MAN!!' },
            { speaker: 'Narrator', text: 'Bart lifts JP onto his shoulders. The whole party chants his name.' },
            { speaker: 'Girl', text: 'Who IS that guy??' },
            { speaker: 'Nolan', text: 'That\'s my boy.' },
          ], () => { this.frozen = false; });
        });
      } else {
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP goes down in the finals. ' + jpScore + ' cups.' },
          { speaker: 'Narrator', text: 'Eliminated.' },
          { speaker: 'Cooper', text: 'Finals though. That\'s still fire.' },
          { speaker: 'Big Bart', text: 'RUN IT BACK NEXT PARTY!!' },
        ], () => { this.frozen = false; });
      }
    };

    const shoot = () => {
      if (!jpTurn || shooting || gameOver) return;
      shooting = true;

      const ball = this.add.circle(cx - 140, aimY, 8, 0xffffff)
        .setScrollFactor(0).setDepth(305);
      objects.push(ball);

      const targetX = cx + 220 + (power / 100) * 80;
      const targetY = aimY;

      this.tweens.add({
        targets: ball,
        x: targetX,
        y: targetY - 30,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: ball,
            y: targetY,
            duration: 200,
            ease: 'Bounce.easeOut',
            onComplete: () => {
              let hitCup = false;
              for (const cup of oppCups) {
                if (cup.hit) continue;
                const dist = Math.sqrt((ball.x - cup.pos.x) ** 2 + (ball.y - cup.pos.y) ** 2);
                if (dist < cupRadius + 6) { // Tighter hit detection
                  hitCup = true;
                  cup.hit = true;
                  jpScore++;
                  this.tweens.add({ targets: cup.obj, alpha: 0.2, scaleX: 0.5, scaleY: 0.5, duration: 300 });
                  const ht = this.add.text(cup.pos.x, cup.pos.y - 20, 'SPLASH!', {
                    fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
                  this.tweens.add({ targets: ht, y: ht.y - 30, alpha: 0, duration: 800, onComplete: () => ht.destroy() });
                  break;
                }
              }
              if (!hitCup) {
                const mt = this.add.text(ball.x, ball.y - 15, 'MISS', {
                  fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f04040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
                this.tweens.add({ targets: mt, alpha: 0, duration: 600, onComplete: () => mt.destroy() });
              }

              ball.destroy();
              scoreText.setText('JP: ' + jpScore + '  |  THEM: ' + oppScore);
              shots++;

              if (jpScore >= 6 || oppScore >= 6 || shots >= maxShots) {
                gameOver = true;
                updateEvent.remove();
                spaceKey.off('down', shootHandler);
                this.time.delayedCall(800, () => endRound2());
                return;
              }

              jpTurn = false;
              turnText.setText('THEIR SHOT').setColor('#f04040');
              aimCursor.setAlpha(0.3);

              this.time.delayedCall(1200, () => {
                // Harder opponent: 55% hit rate
                const hit = Math.random() < 0.55;
                if (hit) {
                  const available = myCups.filter(c => !c.hit);
                  if (available.length > 0) {
                    const target = available[Math.floor(Math.random() * available.length)];
                    target.hit = true;
                    oppScore++;
                    this.tweens.add({ targets: target.obj, alpha: 0.2, scaleX: 0.5, scaleY: 0.5, duration: 300 });
                  }
                }
                scoreText.setText('JP: ' + jpScore + '  |  THEM: ' + oppScore);
                shots++;

                if (jpScore >= 6 || oppScore >= 6 || shots >= maxShots) {
                  gameOver = true;
                  updateEvent.remove();
                  spaceKey.off('down', shootHandler);
                  this.time.delayedCall(800, () => endRound2());
                  return;
                }

                jpTurn = true;
                turnText.setText('YOUR SHOT').setColor('#60c060');
                aimCursor.setAlpha(1);
                shooting = false;
              });
            },
          });
        },
      });
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const shootHandler = () => shoot();
    spaceKey.on('down', shootHandler);
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    // Party AI — autonomous NPC behavior during party
    if (this.currentDay === 2 && PartyAI.isActive()) {
      PartyAI.update(delta);
    }
  }
}
