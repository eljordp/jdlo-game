import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class HomeScene extends BaseChapterScene {
  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
    this.requiredInteractionId = 'ch0_nolan_call';
  }

  protected getPlayerTexture(): string {
    return 'player-ch0';
  }

  protected getMusicTrack(): string {
    return 'home';
  }

  create() {
    super.create();
    this.addNavArrow(10, 23, 'Leave home');
  }

  protected getObjectiveHint(): string {
    return 'Explore your house. Talk to family. Leave when ready.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }

  // Override to add Frenchie fetch + goodbye cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch0_frenchie_ball') {
      Analytics.trackInteraction(interactable.id);
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_goodbye') {
      Analytics.trackInteraction(interactable.id);
      this.playGoodbyeCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playGoodbyeCutscene() {
    this.frozen = true;

    // Step 1: JP looks around
    this.dialogue.show([
      { speaker: 'Narrator', text: 'JP looks around his room one last time.' },
    ], () => {
      // Step 2: Walk automatically toward the door (south a couple tiles)
      const doorY = this.player.y + SCALED_TILE * 2;
      this.tweens.add({
        targets: this.player,
        y: doorY,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          // Step 3: Screen dims slightly
          const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setScrollFactor(0).setDepth(50).setAlpha(0);
          this.tweens.add({
            targets: dim,
            alpha: 0.3,
            duration: 400,
            onComplete: () => {
              // Step 4: Emotional dialogue
              this.dialogue.show([
                { speaker: 'Narrator', text: 'He grabs his bag. Hugs his sister. Daps up Pops.' },
                { speaker: 'Narrator', text: 'Ivy whines at the door. She knows.' },
              ], () => {
                // Step 5: Walk south toward exit
                this.tweens.add({
                  targets: this.player,
                  y: this.player.y + SCALED_TILE * 2,
                  duration: 1000,
                  ease: 'Linear',
                  onComplete: () => {
                    // Fade dim back out, unfreeze, trigger transition
                    this.tweens.add({
                      targets: dim,
                      alpha: 0,
                      duration: 300,
                      onComplete: () => {
                        dim.destroy();
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
  }

  private playFetch() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let score = 0;
    let round = 0;
    const totalRounds = 3;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Green yard background
    const yard = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, GAME_WIDTH - 160, 500, 0x4a8c3f)
      .setScrollFactor(0).setDepth(300);
    objects.push(yard);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'FETCH WITH IVY!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Score display
    const scoreText = this.add.text(GAME_WIDTH - 100, 70, 'Score: 0/3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(scoreText);

    // JP position (left side)
    const jpSprite = this.add.sprite(200, GAME_HEIGHT / 2 + 100, this.getPlayerTexture(), 6)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Ivy sprite (near JP)
    const frenchie = this.npcs.find(n => n.id === 'ch0_frenchie');
    const ivyTexture = frenchie ? 'npc_frenchie' : this.getPlayerTexture();
    const ivy = this.add.sprite(260, GAME_HEIGHT / 2 + 140, ivyTexture, 0)
      .setScale(4).setScrollFactor(0).setDepth(302);
    objects.push(ivy);

    // Aim line (oscillating angle indicator)
    const aimLine = this.add.line(0, 0, 200, GAME_HEIGHT / 2 + 80, 500, GAME_HEIGHT / 2 - 100, 0xffffff, 0.6)
      .setScrollFactor(0).setDepth(301).setLineWidth(2);
    objects.push(aimLine);

    // Instruction
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'SPACE to throw!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Obstacles — trees/walls on edges of yard
    const wallZones = [
      { x: 100, y: 300, w: 40, h: 500 },  // left wall
      { x: GAME_WIDTH - 100, y: 300, w: 40, h: 500 },  // right wall
      { x: GAME_WIDTH / 2, y: 150, w: 800, h: 40 },  // top wall
    ];

    // Aim angle oscillation
    let aimAngle = 0;
    let aimDir = 1;
    let aiming = true;
    const aimSpeed = 0.03;

    const startRound = () => {
      aiming = true;
      aimAngle = 0;
      aimDir = 1;
      aimLine.setVisible(true);
      instr.setText(`Round ${round + 1}/${totalRounds} — SPACE to throw!`);
      ivy.setPosition(260, GAME_HEIGHT / 2 + 140);
    };

    // Update aim line
    const updateHandler = () => {
      if (!aiming) return;
      aimAngle += aimSpeed * aimDir;
      if (aimAngle > 1.2) aimDir = -1;
      if (aimAngle < -1.2) aimDir = 1;

      // Update line end point based on angle
      const throwDist = 500;
      const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
      const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;
      aimLine.setTo(200, GAME_HEIGHT / 2 + 80, endX, endY);
    };

    this.events.on('update', updateHandler);

    // Throw handler
    const throwBall = () => {
      if (!aiming) return;
      aiming = false;
      aimLine.setVisible(false);

      // Calculate throw direction
      const throwDist = 500;
      const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
      const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;

      // Create ball
      const ball = this.add.circle(200, GAME_HEIGHT / 2 + 80, 8, 0xc0d030)
        .setScrollFactor(0).setDepth(303);
      objects.push(ball);

      // Fly ball
      this.tweens.add({
        targets: ball,
        x: endX,
        y: endY,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Check if ball landed in yard (not hitting walls)
          const inYard = endX > 140 && endX < GAME_WIDTH - 140 &&
                         endY > 180 && endY < GAME_HEIGHT - 80;

          if (inYard) {
            // Ivy chases ball
            this.tweens.add({
              targets: ivy,
              x: endX,
              y: endY,
              duration: 700,
              ease: 'Quad.easeInOut',
              onComplete: () => {
                ball.destroy();
                score++;
                scoreText.setText(`Score: ${score}/${totalRounds}`);

                // Good girl text
                const good = this.add.text(ivy.x, ivy.y - 40, 'Good girl Ivy!', {
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '10px',
                  color: '#40c040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
                objects.push(good);

                // Wiggle
                this.tweens.add({
                  targets: ivy,
                  angle: 8,
                  duration: 100,
                  yoyo: true,
                  repeat: 3,
                  onComplete: () => {
                    ivy.setAngle(0);
                    this.tweens.add({
                      targets: good,
                      alpha: 0,
                      duration: 500,
                      onComplete: () => {
                        good.destroy();
                        round++;
                        if (round < totalRounds) {
                          startRound();
                        } else {
                          finishGame();
                        }
                      },
                    });
                  },
                });
              },
            });
          } else {
            // Missed — ball hit a wall
            ball.setFillStyle(0xff4444);
            const miss = this.add.text(endX, endY - 30, 'Out of bounds!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
              color: '#ff4444',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
            objects.push(miss);

            this.time.delayedCall(1000, () => {
              ball.destroy();
              miss.destroy();
              round++;
              if (round < totalRounds) {
                startRound();
              } else {
                finishGame();
              }
            });
          }
        },
      });
    };

    const finishGame = () => {
      this.events.off('update', updateHandler);
      spaceKey.off('down', throwListener);
      this.input.off('pointerdown', throwListener);

      instr.setText(`Ivy fetched ${score}/${totalRounds} balls!`);
      title.setText(score === totalRounds ? 'PERFECT!' : score > 0 ? 'GOOD BOY JP!' : 'TRY AGAIN...');

      const resultMsg = score === totalRounds
        ? 'Ivy is the happiest dog alive.'
        : score > 0
        ? 'Ivy had fun. She always does.'
        : 'Ivy tilts her head. She still loves JP.';

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, resultMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#aaaacc',
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(result);

      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const throwListener = () => throwBall();
    spaceKey.on('down', throwListener);
    this.input.on('pointerdown', throwListener);

    // Start first round
    startRound();
  }
}
