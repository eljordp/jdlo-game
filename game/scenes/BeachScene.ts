import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT, TILE_IDS } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { GameSettings } from '../systems/GameSettings';
import { SubstanceSystem } from '../systems/SubstanceSystem';
import { PartyAI } from '../systems/PartyAI';

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
  private smokeSeshDone = false;
  private weedPickedUp = new Set<string>();
  private partyLevel = 0; // 0=sober, 1=drinking, 2=faded, 3=coked, 4=blackout
  private drinksDone = false;
  private blowOffered = false;
  private blackedOut = false;
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
    this.events.on('shutdown', () => { PartyAI.destroy(); });
    // Exit triggers at south beach
    this.addNavArrow(18, 26, 'Next chapter');

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
        // Can't tween fillColor directly — just set it
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

    // K starts hidden — she's visually part of the bed sprite (item-bed-k)
    const k = this.npcs.find(n => n.id === 'ch1_gf_k');
    if (k) {
      k.sprite.setVisible(false);
      // Remove K's collision so player can walk near the bed
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
          // Update Cooper's dialogue
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
                },
              });
            },
          });
        }
      });
    }
  }

  // NPC reactive behaviors
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    // K — already woke up, just show dialogue if she's still visible
    if (npcId === 'ch1_gf_k') {
      this.dialogue.show(dialogue);
      return;
    }

    // Girls at the party (Day 2) — threesome only after partying hard (faded+)
    if ((npcId === 'ch1_girl1' || npcId === 'ch1_girl2') && this.currentDay === 2 && this.partyLevel >= 2) {
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
        const fadeObj = this.add.rectangle(
          GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
        ).setScrollFactor(0).setDepth(400);
        this.tweens.add({
          targets: fadeObj,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
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
              { speaker: 'Girl 2', text: '...is that it?' },
              { speaker: 'Girl', text: 'Bro.' },
              { speaker: 'JP', text: '...give me a minute.' },
              { speaker: 'Girl 2', text: 'Nah it\'s like... small.' },
              { speaker: 'JP', text: 'I\'ve been drinking all night! And smoking! That\'s not—' },
              { speaker: 'Girl', text: 'Sure babe.' },
              { speaker: 'Girl 2', text: 'It\'s okay. It happens.' },
              { speaker: 'JP\'s Mind', text: 'This is the worst moment of my life.' },
              { speaker: 'Narrator', text: '...' },
              { speaker: 'Narrator', text: 'They get dressed. Nobody makes eye contact.' },
              { speaker: 'Girl', text: 'The party\'s still going right? Let\'s just... go back out there.' },
              { speaker: 'JP\'s Mind', text: 'I am never drinking and smoking before... nah forget it.' },
              { speaker: 'Narrator', text: 'The party keeps going outside. Nobody noticed they left. Thank god.' },
            ];
            this.time.delayedCall(2000, () => {
              this.dialogue.show(afterLines, () => {
                this.tweens.add({
                  targets: fadeObj,
                  alpha: 0,
                  duration: 800,
                  onComplete: () => {
                    fadeObj.destroy();
                    this.frozen = false;
                  },
                });
              });
            });
          },
        });
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

  protected getObjectiveHint(): string {
    return 'Check out the townhouse. Head south to leave.';
  }

  getMapData(): MapData {
    return beachMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return beachDialogue;
  }

  // Override to add volleyball mini-game, BMW, and bed wake-up
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Bed — K wakes up
    if (interactable.id === 'ch1_bed' && !this.kGoodbyeDone && this.currentDay === 1) {
      this.wakeUpK();
      return;
    }

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
        this.time.delayedCall(8000, () => {
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
          });
        });
      });
      return;
    }

    // Smoke spot hint — Day 2 but haven't drank yet
    if (interactable.id === 'ch1_smoke' && this.currentDay === 2 && !this.smokeSeshDone && this.partyLevel < 1) {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'The crew wants to smoke but nobody\'s loose enough yet.' },
        { speaker: 'JP\'s Mind', text: 'Should probably grab a drink first. Bottles are in the kitchen.' },
      ], () => { this.frozen = false; });
      return;
    }

    // Group smoke sesh — Day 2 after drinking
    if (interactable.id === 'ch1_smoke' && this.currentDay === 2 && !this.smokeSeshDone && this.partyLevel >= 1) {
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

        // After smoke sesh, someone offers blow (delayed)
        this.time.delayedCall(15000, () => {
          if (this.scene.isActive() && !this.blowOffered && this.currentDay === 2) {
            this.triggerBlowOffer();
          }
        });
      });
      return;
    }

    // Bedroom — Day 1: JP lies down, eyes blink, wakes up to party. Day 2: no sleeping
    if (interactable.id === 'ch1_bed') {
      Analytics.trackInteraction(interactable.id);
      if (this.currentDay === 1 && !this.bedroomStayed) {
        this.bedroomStayed = true;
        this.frozen = true;
        // JP lies down
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: 'Just a quick nap...' },
        ], () => {
          this.triggerPartyNight();
        });
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

    // Check if player is near the BMW (tiles 3-5, row 9)
    if (!this.bmwInteracted && this.player) {
      const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
      const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

      const nearBMW =
        playerTileX >= 2 && playerTileX <= 6 &&
        playerTileY >= 10 && playerTileY <= 12;

      if (nearBMW) {
        this.bmwInteracted = true;
        this.frozen = true;
        this.dialogue.show([
          { speaker: "JP's Mind", text: '335i. Twin turbo. Catless downpipes.' },
          { speaker: "JP's Mind", text: 'This car is trouble. But it sounds SO good.' },
        ], () => {
          this.frozen = false;
        });
        return;
      }
    }

    super.handleInteract();
  }

  // Reusable yes/no choice UI — prompt text shows ABOVE buttons so you know what you're choosing
  private showYesNoChoice(
    prompt: string,
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Prompt text — tells you what you're deciding
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
              0x1a0840, 0.25
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

                // K's texts — phone buzzing on screen before party starts
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
        0x1a0840, 0.25
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
      { startCol: 10, endCol: 15, row: 1 },  // JP's room
      { startCol: 17, endCol: 21, row: 1 },  // Kitchen
      { startCol: 23, endCol: 27, row: 1 },  // Nolan's room
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
    PartyAI.init(this);

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

    // Camera shake — someone taps JP's shoulder
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
        // NO — stays at party level 2
        this.dialogue.show([
          { speaker: 'JP', text: 'Nah I\'m straight.' },
          { speaker: '???', text: 'Suit yourself.' },
          { speaker: 'JP\'s Mind', text: 'Smart decision. First one tonight.' },
        ], () => {
          this.frozen = false;
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
          // Breathing animation — she's out cold
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
            this.frozen = false;
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
        // Serve to JP's side
        ballX = GAME_WIDTH / 4 + Phaser.Math.Between(-80, 80);
        ballY = courtTop + 40;
        ballVX = Phaser.Math.Between(-1, 1);
        ballVY = 2;
        ballOnJPSide = true;
      } else {
        // Serve to opponent's side
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

        // Send ball to JP's side
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
        : "Not his day. But he'll be back.";

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
              { speaker: 'Nolan', text: "Bro you're NICE at this!" },
              { speaker: 'JP', text: 'Run it back anytime.' },
            ]
          : [
              { speaker: 'Nolan', text: "We'll get you next time bro." },
              { speaker: 'JP', text: 'Whatever man.' },
            ];

        this.dialogue.show(postGameLines, () => {
          this.frozen = false;
          // Update Nolan's dialogue based on volleyball result
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

      // Player hits ball when SPACE pressed and ball is near JP on JP's side
      if (spaceKey.isDown && ballOnJPSide && !pointScored) {
        const distX = Math.abs(ballX - jpSprite.x);
        const distY = Math.abs(ballY - jpSprite.y);
        if (distX < 60 && distY < 60) {
          // Hit! Send ball to opponent's side
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

          // Arc ball to opponent's side
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
          // Ball hit JP's ground — opponent scores
          scorePoint(false);
        } else {
          // Ball hit opponent's ground — JP scores
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

  update(time: number, delta: number) {
    super.update(time, delta);

    // Party AI — autonomous NPC behavior during party
    if (this.currentDay === 2 && PartyAI.isActive()) {
      PartyAI.update(delta);
    }
  }
}
