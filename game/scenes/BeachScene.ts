import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class BeachScene extends BaseChapterScene {
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

    // Place the BMW 335i in the driveway (concrete strip near right side of house)
    const carX = 22 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 10 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    // BMW occupies 3 tiles of collision
    this.collisionTiles.add('21,10');
    this.collisionTiles.add('22,10');
    this.collisionTiles.add('23,10');
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
    let points = 0;
    let misses = 0;
    const maxMisses = 3;
    let active = true;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Sand background
    const sand = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 100, GAME_HEIGHT - 140, 0xd4b896)
      .setScrollFactor(0).setDepth(300);
    objects.push(sand);

    // Net line in the middle
    const net = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 4, GAME_HEIGHT - 200, 0xffffff, 0.4)
      .setScrollFactor(0).setDepth(301);
    objects.push(net);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 90, 'BEACH VOLLEYBALL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(title);

    // Score + misses display
    const scoreText = this.add.text(GAME_WIDTH / 2, 130, 'Score: 0  |  Misses: 0/3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(scoreText);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'LEFT/RIGHT to move, SPACE to bump!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(instr);

    // JP paddle (sprite at bottom)
    const jpPaddle = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 160, this.getPlayerTexture(), 0)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(jpPaddle);

    // Ball — white circle
    let ballX = GAME_WIDTH / 2;
    let ballY = 200;
    let ballVX = Phaser.Math.Between(-2, 2);
    let ballVY = 1;
    const gravity = 0.12;
    const ball = this.add.circle(ballX, ballY, 10, 0xffffff)
      .setScrollFactor(0).setDepth(303);
    objects.push(ball);

    // Ball shadow
    const shadow = this.add.ellipse(ballX, GAME_HEIGHT - 140, 16, 6, 0x000000, 0.2)
      .setScrollFactor(0).setDepth(301);
    objects.push(shadow);

    // Input
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const resetBall = () => {
      ballX = GAME_WIDTH / 2 + Phaser.Math.Between(-200, 200);
      ballY = 200;
      ballVX = Phaser.Math.Between(-3, 3);
      ballVY = 0;
      ball.setPosition(ballX, ballY);
      ball.setFillStyle(0xffffff);
    };

    const endGame = () => {
      active = false;
      this.events.off('update', updateHandler);

      title.setText(points >= 5 ? 'NICE GAME!' : points >= 3 ? 'NOT BAD!' : 'GAME OVER');
      instr.setText(`Final score: ${points}`);

      const msg = points >= 5
        ? 'JP impresses the beach crew.'
        : points >= 3
        ? 'Solid effort. The volleyball players nod.'
        : 'The volleyball rolls away. Someone else grabs it.';

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
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

    const updateHandler = () => {
      if (!active) return;

      // Move JP left/right
      if (leftKey.isDown) {
        jpPaddle.x -= 5;
      } else if (rightKey.isDown) {
        jpPaddle.x += 5;
      }
      jpPaddle.x = Phaser.Math.Clamp(jpPaddle.x, 100, GAME_WIDTH - 100);

      // Ball physics
      ballVY += gravity;
      ballX += ballVX;
      ballY += ballVY;

      // Bounce off side walls
      if (ballX < 80 || ballX > GAME_WIDTH - 80) {
        ballVX *= -1;
        ballX = Phaser.Math.Clamp(ballX, 80, GAME_WIDTH - 80);
      }

      ball.setPosition(ballX, ballY);
      shadow.setPosition(ballX, GAME_HEIGHT - 140);

      // Check if space pressed AND ball is near JP
      if (spaceKey.isDown && ballY > GAME_HEIGHT - 210 && ballY < GAME_HEIGHT - 120) {
        const dist = Math.abs(ballX - jpPaddle.x);
        if (dist < 50) {
          // Bump! Ball goes back up
          ballVY = -(6 + Math.random() * 3);
          ballVX = (ballX - jpPaddle.x) * 0.1 + Phaser.Math.Between(-2, 2);
          points++;
          scoreText.setText(`Score: ${points}  |  Misses: ${misses}/${maxMisses}`);

          // Flash ball green
          ball.setFillStyle(0x40c040);
          this.time.delayedCall(150, () => {
            if (ball.active) ball.setFillStyle(0xffffff);
          });

          // Bump animation on JP
          this.tweens.add({
            targets: jpPaddle,
            scaleY: 5.5,
            duration: 80,
            yoyo: true,
          });
        }
      }

      // Ball went off bottom — miss
      if (ballY > GAME_HEIGHT - 60) {
        misses++;
        scoreText.setText(`Score: ${points}  |  Misses: ${misses}/${maxMisses}`);

        if (misses >= maxMisses) {
          endGame();
        } else {
          // Flash red
          ball.setFillStyle(0xff4444);
          this.time.delayedCall(500, () => {
            resetBall();
          });
        }
      }

      // Ball went off top — bounce it back
      if (ballY < 160) {
        ballVY = Math.abs(ballVY) * 0.8;
      }
    };

    this.events.on('update', updateHandler);
  }
}
