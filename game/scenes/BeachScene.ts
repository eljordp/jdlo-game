import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT, TILE_IDS } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';

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
    // Exit triggers at y=18, x=12-15
    this.addNavArrow(18, 24, 'Next chapter');

    // Place the BMW 335i in the driveway (right next to house, row 8-9 area)
    const carX = 4 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 9 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    this.collisionTiles.add('3,9');
    this.collisionTiles.add('4,9');
    this.collisionTiles.add('5,9');

    // Hot tub bubble jets — active bubbles rising from the water
    this.createHotTubBubbles();

    // Hot tub steam effect
    this.createHotTubSteam();
  }

  private createHotTubSteam() {
    // Hot tub is at cols 31-34, rows 2-4 in the beachMap
    const tubCenterX = 32.5 * SCALED_TILE;
    const tubTopY = 2 * SCALED_TILE;

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
    // Hot tub is at cols 31-34, rows 2-4 in the beachMap
    const tubCenterX = 32.5 * SCALED_TILE;
    const tubCenterY = 3.5 * SCALED_TILE;
    const tubWidth = 5 * SCALED_TILE;
    const tubHeight = 4 * SCALED_TILE;

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

  // David puts his phone down when you talk to him
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    if (npcId === 'ch1_david' && !this.davidPhoneDown) {
      this.davidPhoneDown = true;
      // Show normal dialogue, then David reacts
      this.dialogue.show(dialogue, () => {
        const david = this.npcs.find(n => n.id === 'ch1_david');
        if (david) {
          // Quick phone-pocket animation
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

  // Override to add volleyball mini-game and BMW interaction
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
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
        MoodSystem.setMood('faded', 120);
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

    // Bedroom — stay the night choice
    if (interactable.id === 'ch1_bed' && !this.bedroomStayed) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.showYesNoChoice('Stay the night?', 'Yeah', 'Nah', () => {
        this.bedroomStayed = true;
        MoodSystem.setMood('tired', 120);
        MoodSystem.changeMorale(-20);
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP wakes up hours later. Groggy. Not sure where he is for a second.' },
        ], () => { this.frozen = false; });
      }, () => {
        this.dialogue.show([
          { speaker: 'JP', text: 'Nah I\'m good. Early morning.' },
        ], () => { this.frozen = false; });
      });
      return;
    }

    // Shower — blinker choice
    if (interactable.id === 'ch1_shower' && !this.showerBlinker) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.showYesNoChoice('Hit it in the shower?', 'Yeah', 'Nah', () => {
        this.showerBlinker = true;
        MoodSystem.setMood('faded', 90);
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
        playerTileY >= 8 && playerTileY <= 10;

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

  // Reusable yes/no choice UI
  private showYesNoChoice(
    _prompt: string,
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const yesBg = this.add.rectangle(cx - 80, cy, 120, 40, 0x30a040)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(cx - 80, cy, yesLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const noBg = this.add.rectangle(cx + 80, cy, 120, 40, 0xa03030)
      .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
    const noText = this.add.text(cx + 80, cy, noLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    yesBg.on('pointerover', () => yesBg.setFillStyle(0x40c050));
    yesBg.on('pointerout', () => yesBg.setFillStyle(0x30a040));
    noBg.on('pointerover', () => noBg.setFillStyle(0xc04040));
    noBg.on('pointerout', () => noBg.setFillStyle(0xa03030));

    const cleanup = () => {
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
}
