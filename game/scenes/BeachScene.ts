import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT, TILE_IDS } from '../config';
import { Analytics } from '../systems/Analytics';

export class BeachScene extends BaseChapterScene {
  private inHotTub = false;

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
    this.addNavArrow(13, 17, 'Next chapter');

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
  }

  private createHotTubBubbles() {
    // Hot tub is at cols 21-25, rows 2-5 in the beachMap
    const tubCenterX = 23 * SCALED_TILE;
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
    } else if (!onHotTub && this.inHotTub) {
      this.inHotTub = false;
      this.player.setTexture(this.getPlayerTexture());
    }
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

  // Override to add volleyball mini-game
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch1_volleyball1') {
      Analytics.trackInteraction(interactable.id);
      this.playVolleyballMinigame();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
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

    // Ball shadow
    const shadow = this.add.ellipse(ballX, groundY + 10, 16, 6, 0x000000, 0.2)
      .setScrollFactor(0).setDepth(301);
    objects.push(shadow);

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
    };

    const serveBall = (toJP: boolean) => {
      pointScored = false;
      waitingForServe = false;
      oppReturning = false;
      rallyCount = 0;
      ballSpeed = 5;
      oppBaseDelay = 800;
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
      rallyCount = 0;
      updateRallyDisplay();

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
      this.events.off('update', updateHandler);

      const jpWon = jpScore >= winScore;
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
        this.frozen = false;
      });
    };

    // Start with serve to JP
    this.time.delayedCall(500, () => {
      serveBall(true);
    });

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

      // Track which side ball is on
      ballOnJPSide = ballX < netX;

      ball.setPosition(ballX, ballY);
      shadow.setPosition(ballX, groundY + 10);

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

          // Arc ball to opponent's side
          const targetX = GAME_WIDTH * 3 / 4 + Phaser.Math.Between(-80, 80);
          ballVX = (targetX - ballX) / 40;
          ballVY = -(5 + Math.random() * 2);

          ball.setFillStyle(0x40c040);
          this.time.delayedCall(150, () => {
            if (ball.active) ball.setFillStyle(0xffffff);
          });
        }
      }

      // Ball hits ground — point scored
      if (ballY > groundY && !pointScored) {
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
