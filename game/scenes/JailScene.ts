import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDay1Dialogue, jailDay2Dialogue, jailDay3Dialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { Analytics } from '../systems/Analytics';
import { GameSettings } from '../systems/GameSettings';
import { GameIntelligence } from '../systems/GameIntelligence';

export class JailScene extends BaseChapterScene {
  private currentDay = 1;
  private battleWon: boolean | null = null; // null = not fought, true/false = outcome
  private pushupDominated = false; // won by 10+
  private diceBroke = false; // went to 0 in dice
  private shirtOff = false;
  private guardPatrolTimer?: Phaser.Time.TimerEvent;
  private inmatePatrolTimers: Phaser.Time.TimerEvent[] = [];

  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 4: Locked Up';
    this.nextScene = 'ReleaseScene';
    this.requiredInteractionId = 'ch3_bed';
  }

  protected getPlayerTexture(): string {
    // Sprite evolves each day
    if (this.currentDay >= 3) return this.shirtOff ? 'player-jail-shirtless' : 'player-jail-day3';
    if (this.currentDay >= 2) return 'player-jail-day2';
    return 'player-jail-day1';
  }

  protected getMusicTrack(): string {
    return 'jail';
  }

  create() {
    this.currentDay = 1;
    this.battleWon = null;
    this.pushupDominated = false;
    this.diceBroke = false;
    this.shirtOff = false;
    super.create();

    // GameIntelligence — track player behavior
    GameIntelligence.init(this, this.player);
    GameIntelligence.watch('ch3_bed',         3,  6,  true);  // required: gate to ch5
    GameIntelligence.watch('ch3_book',        5,  8,  true);  // required: Compound Effect
    GameIntelligence.watch('ch3_letter_home', 4,  6);
    GameIntelligence.watch('ch3_phone',       10, 13);
    GameIntelligence.watch('ch3_fight_watch', 23, 3);
    GameIntelligence.watch('ch3_dice_watch',  34, 8);
    GameIntelligence.watch('ch3_pushups',     12, 19, true);  // required: minigame
    GameIntelligence.watch('ch3_faith',       7,  22, true);  // required: transformation arc
    GameIntelligence.watch('ch3_psych_course', 35, 24);
    GameIntelligence.attachDebugPanel(this);

    // Exit triggers at y=25, x=17-18
    this.addNavArrow(17, 24, 'Freedom');

    // Guard patrol — walks between guard station and cells
    this.startGuardPatrol();

    // Inmate movement — crew and other inmates pace/wander
    this.startInmateMovement();

    // Shirt toggle button (Day 2+)
    this.createShirtToggle();
  }

  private startGuardPatrol() {
    const guard = this.npcs.find(n => n.id === 'ch3_guard');
    if (!guard) return;

    let patrolForward = true;
    const startX = guard.sprite.x;
    const patrolEndX = 10 * 64 + 32; // tile 10

    this.guardPatrolTimer = this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive() || this.frozen) return;
        const guard = this.npcs.find(n => n.id === 'ch3_guard');
        if (!guard) return;

        const targetX = patrolForward ? patrolEndX : startX;
        patrolForward = !patrolForward;

        // Remove old collision
        const oldTX = Math.round((guard.sprite.x - 32) / 64);
        const oldTY = Math.round((guard.sprite.y - 32) / 64);
        this.collisionTiles.delete(`${oldTX},${oldTY}`);

        this.tweens.add({
          targets: guard.sprite,
          x: targetX,
          duration: 3000,
          ease: 'Linear',
          onComplete: () => {
            const newTX = Math.round((guard.sprite.x - 32) / 64);
            this.collisionTiles.add(`${newTX},${oldTY}`);
          },
        });
      },
    });
  }

  private startInmateMovement() {
    const S = 64; // SCALED_TILE
    const half = 32; // center offset

    // Each entry: npcId, target tile X/Y, delay between moves, tween duration
    const patrols: { id: string; axis: 'x' | 'y'; endTile: number; delay: number; duration: number }[] = [
      // Mikey — paces back and forth in JP's cell row (y=7, x 2→4)
      { id: 'ch3_mikey', axis: 'x', endTile: 4, delay: 5000, duration: 2500 },
      // Chris — paces within cell 2 (x 9→11, row 3)
      { id: 'ch3_chris', axis: 'x', endTile: 11, delay: 7000, duration: 3500 },
      // Bird — paces within cell 4 (x 9→11, row 7)
      { id: 'ch3_bird', axis: 'x', endTile: 11, delay: 8000, duration: 4000 },
      // Smoker — paces in the yard corner (y=23, x 5→8)
      { id: 'ch3_smoker', axis: 'x', endTile: 8, delay: 9000, duration: 3000 },
      // Pullups guy — walks along the exercise zone (y=19, x 10→13)
      { id: 'ch3_pullups', axis: 'x', endTile: 13, delay: 10000, duration: 4500 },
    ];

    for (const patrol of patrols) {
      const npc = this.npcs.find(n => n.id === patrol.id);
      if (!npc) continue;

      let forward = true;
      const startVal = npc.sprite[patrol.axis];
      const endVal = patrol.endTile * S + half;

      const timer = this.time.addEvent({
        delay: patrol.delay,
        loop: true,
        callback: () => {
          if (!this.scene.isActive() || this.frozen) return;
          const npcRef = this.npcs.find(n => n.id === patrol.id);
          if (!npcRef) return;

          const targetVal = forward ? endVal : startVal;
          forward = !forward;

          // Remove old collision tile
          const oldTX = Math.round((npcRef.sprite.x - half) / S);
          const oldTY = Math.round((npcRef.sprite.y - half) / S);
          this.collisionTiles.delete(`${oldTX},${oldTY}`);

          this.tweens.add({
            targets: npcRef.sprite,
            [patrol.axis]: targetVal,
            duration: patrol.duration,
            ease: 'Linear',
            onComplete: () => {
              // Add new collision tile at destination
              const newTX = Math.round((npcRef.sprite.x - half) / S);
              const newTY = Math.round((npcRef.sprite.y - half) / S);
              this.collisionTiles.add(`${newTX},${newTY}`);
            },
          });
        },
      });

      this.inmatePatrolTimers.push(timer);
    }
  }

  private createShirtToggle() {
    const btn = this.add.text(GAME_WIDTH - 120, GAME_HEIGHT - 30, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#808090',
      backgroundColor: '#1a1a2a',
      padding: { x: 6, y: 3 },
    }).setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });

    const updateBtn = () => {
      if (this.currentDay >= 2) {
        btn.setText(this.shirtOff ? 'Shirt On' : 'Shirt Off');
        btn.setVisible(true);
      } else {
        btn.setVisible(false);
      }
    };
    updateBtn();

    btn.on('pointerdown', () => {
      if (this.currentDay < 2) return;
      this.shirtOff = !this.shirtOff;
      this.player.setTexture(this.getPlayerTexture());
      updateBtn();
    });

    // Store reference to update on day change
    (this as any)._shirtBtn = btn;
    (this as any)._updateShirtBtn = updateBtn;
  }

  // NPC dialogue reacts to minigame outcomes
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    GameIntelligence.onNPCTalked(npcId);
    // Fighter reacts based on battle outcome
    if ((npcId === 'ch3_fighter1' || npcId === 'ch3_fighter2') && this.battleWon !== null && this.currentDay >= 2) {
      const chapterDialogue = this.getChapterDialogue();
      const key = this.battleWon ? 'ch3_battle_won' : 'ch3_battle_lost';
      const reactiveLines = chapterDialogue.npcs[key];
      if (reactiveLines) {
        this.dialogue.show(reactiveLines);
        return;
      }
    }

    // Pullups guy reacts to pushup domination
    if (npcId === 'ch3_pullups' && this.pushupDominated && this.currentDay >= 2) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch3_pushup_beast'];
      if (lines) {
        this.dialogue.show(lines);
        return;
      }
    }

    // Bird warns about dice
    if (npcId === 'ch3_bird' && this.diceBroke) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch3_dice_broke'];
      if (lines) {
        this.dialogue.show(lines);
        this.diceBroke = false; // only warn once
        return;
      }
    }

    this.dialogue.show(dialogue);
  }

  protected getObjectiveHint(): string {
    if (this.currentDay === 1) return 'First day. Meet your cellmates.';
    if (this.currentDay === 2) return 'Work out. Survive.';
    if (this.currentDay === 3) return 'Read. Learn. Find your way out.';
    return 'Hit the bed. Time to go.';
  }

  getMapData(): MapData {
    return jailMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    if (this.currentDay === 3) return jailDay3Dialogue;
    if (this.currentDay === 2) return jailDay2Dialogue;
    return jailDay1Dialogue;
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    GameIntelligence.onInteracted(interactable.id);
    if (interactable.id === 'ch3_bed') {
      this.handleBedInteraction();
      return;
    }

    // Pushup minigame — available Day 2+
    if (interactable.id === 'ch3_pushups' && this.currentDay >= 2) {
      this.playPushupMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dice minigame — available Day 2
    if (interactable.id === 'ch3_dice_watch' && this.currentDay >= 2) {
      this.playDiceMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Battle — available Day 1
    if (interactable.id === 'ch3_fight_watch' && this.currentDay === 1) {
      this.playBattleScene();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch3_commissary') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Commissary window. Ramen, chips, soap, envelopes.' },
        { speaker: 'Narrator', text: 'JP grabs a couple soups and a pen.' },
        { speaker: 'JP\'s Mind', text: 'This is currency in here.' },
      ], () => {
        InventorySystem.addItem('ramen', 2);
        InventorySystem.addItem('stamps', 1);
        InventorySystem.addItem('soap', 1);
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch3_letter_home') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP sits on his bunk with a pen and paper.' },
        { speaker: 'Narrator', text: 'He writes: "Hey Pops. I\'m okay. I\'m reading a lot."' },
        { speaker: 'Narrator', text: '"Tell Mom I\'m sorry. Tell Sister I\'ll be home soon."' },
        { speaker: 'Narrator', text: '"I\'m going to be different when I get out. I promise."' },
        { speaker: 'JP\'s Mind', text: 'He folds it. Holds it for a minute before putting it in the envelope.' },
      ], () => {
        InventorySystem.addItem('letter', 1);
        MoodSystem.changeMorale(10);
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch3_faith') {
      Analytics.trackInteraction(interactable.id);
      this.interactions.consume(interactable.id);
      this.frozen = true;
      // Dim the scene
      const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
        .setScrollFactor(0).setDepth(300);
      this.tweens.add({ targets: dim, alpha: 0.5, duration: 1000 });
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP sits in the corner of the yard. Alone.' },
        { speaker: 'Narrator', text: 'He closes his eyes.' },
        { speaker: 'JP\'s Mind', text: 'God, I know you can hear me.' },
        { speaker: 'JP\'s Mind', text: 'I know I messed up. Bad.' },
        { speaker: 'JP\'s Mind', text: 'But you know I never tried to hurt anyone.' },
        { speaker: 'JP\'s Mind', text: 'I just need one more chance.' },
        { speaker: 'JP\'s Mind', text: 'I\'ll do it right this time.' },
        { speaker: 'Narrator', text: 'The yard is quiet. For the first time, so is his mind.' },
      ], () => {
        MoodSystem.setMood('locked_in', 90);
        MoodSystem.changeMorale(20);
        this.tweens.add({ targets: dim, alpha: 0, duration: 800, onComplete: () => { dim.destroy(); this.frozen = false; } });
      });
      return;
    }

    if (interactable.id === 'ch3_book') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The Compound Effect. JP\'s been reading it for two weeks.' },
        { speaker: 'Narrator', text: '"Small choices + consistency + time = massive results."' },
        { speaker: 'JP\'s Mind', text: 'If that\'s true... then everything I did before was compounding too.' },
        { speaker: 'JP\'s Mind', text: 'Bad choices. Consistently. Over time.' },
        { speaker: 'JP\'s Mind', text: 'No wonder I ended up here.' },
        { speaker: 'Narrator', text: 'He keeps reading.' },
      ], () => {
        InventorySystem.addItem('compound-effect', 1);
        MoodSystem.changeMorale(10);
        this.frozen = false;
      });
      return;
    }

    super.handleInteractable(interactable);
  }

  private handleBedInteraction() {
    // Get bed dialogue for current day
    const chapterDialogue = this.getChapterDialogue();
    const bedLines = chapterDialogue.npcs['ch3_bed'];

    if (this.currentDay === 1) {
      // Show Day 1 bed dialogue, then transition to Day 2
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('3 months later...', () => {
            this.currentDay = 2;
            this.player.setTexture(this.getPlayerTexture());
            // Scale up slightly — Day 2 JP is filling out
            this.player.setScale(2.03);
            this.refreshDayDialogue();
            this.interactions.resetAll();
            if ((this as any)._updateShirtBtn) (this as any)._updateShirtBtn();
          });
        });
      }
    } else if (this.currentDay === 2) {
      // Show Day 2 bed dialogue, then transition to Day 3
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('6 months later...', () => {
            this.currentDay = 3;
            this.player.setTexture(this.getPlayerTexture());
            // Scale up more — Day 3 JP is built
            this.player.setScale(2.06);
            this.refreshDayDialogue();
            this.interactions.resetAll();
            if ((this as any)._updateShirtBtn) (this as any)._updateShirtBtn();
          });
        });
      }
    } else {
      // Day 3 — show final bed dialogue, then play montage and release
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playFinalMontage();
        });
      }
    }
  }

  /**
   * After changing day, update all NPC dialogue references to match the new day.
   */
  private refreshDayDialogue() {
    const chapterDialogue = this.getChapterDialogue();
    for (const npc of this.npcs) {
      npc.dialogue = chapterDialogue.npcs[npc.id] || [{ text: '...' }];
    }
  }

  /**
   * Calendar-style day transition with strikethrough and color progression.
   * Day 1→2: white text, "3 MONTHS LATER..."
   * Day 2→3: yellow text, "6 MONTHS LATER..."
   * Each day's title card feels heavier.
   */
  private playDayTransition(text: string, callback: () => void) {
    this.frozen = true;

    // Determine which day we're transitioning FROM
    const fromDay = this.currentDay;
    // Color progression: Day 1 = white, Day 2 = yellow, Day 3 = gold
    const dayColors = ['#ffffff', '#f0c040', '#ffd700'];
    const dayColor = dayColors[fromDay - 1] || '#ffffff';
    const nextDayColor = dayColors[fromDay] || '#f0c040';
    const dayLabel = `DAY ${fromDay}`;
    const nextDayLabel = `DAY ${fromDay + 1}`;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    // Fade to black
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Show old day label — then strike it out
        const oldDayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, dayLabel, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: dayColor,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

        // Slow fade in old day
        this.tweens.add({
          targets: oldDayText,
          alpha: 1,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold, then strikethrough line slides across
            this.time.delayedCall(800, () => {
              const strikeWidth = oldDayText.width + 20;
              const strikeX = GAME_WIDTH / 2 - strikeWidth / 2;
              const strikeY = GAME_HEIGHT / 2 - 40;
              const strikeLine = this.add.rectangle(strikeX, strikeY, 0, 4, 0xff4444)
                .setOrigin(0, 0.5).setScrollFactor(0).setDepth(202);

              // Animate strikethrough growing across the text
              this.tweens.add({
                targets: strikeLine,
                displayWidth: strikeWidth,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => {
                  // Dim the old day text
                  this.tweens.add({
                    targets: oldDayText,
                    alpha: 0.3,
                    duration: 300,
                  });

                  // Show the time skip text below
                  const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, text, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '14px',
                    color: '#aaaacc',
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

                  this.tweens.add({
                    targets: timeText,
                    alpha: 1,
                    duration: 600,
                    ease: 'Quad.easeOut',
                  });

                  // Hold, then show new day
                  this.time.delayedCall(1500, () => {
                    // Fade out old elements
                    this.tweens.add({
                      targets: [oldDayText, strikeLine, timeText],
                      alpha: 0,
                      duration: 500,
                      onComplete: () => {
                        oldDayText.destroy();
                        strikeLine.destroy();
                        timeText.destroy();

                        // New day appears — heavier, larger
                        const newDayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, nextDayLabel, {
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '36px',
                          color: nextDayColor,
                        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0).setScale(0.6);

                        // Slow dramatic fade in + scale up
                        this.tweens.add({
                          targets: newDayText,
                          alpha: 1,
                          scale: 1,
                          duration: 1000,
                          ease: 'Quad.easeOut',
                          onComplete: () => {
                            // Hold 2 seconds
                            this.time.delayedCall(2000, () => {
                              // Slow fade out
                              this.tweens.add({
                                targets: newDayText,
                                alpha: 0,
                                duration: 800,
                                ease: 'Quad.easeIn',
                                onComplete: () => {
                                  newDayText.destroy();

                                  // Run callback (changes day, resets interactions)
                                  callback();

                                  // Fade back to gameplay
                                  this.tweens.add({
                                    targets: bg,
                                    alpha: 0,
                                    duration: 800,
                                    ease: 'Quad.easeOut',
                                    onComplete: () => {
                                      bg.destroy();
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
                },
              });
            });
          },
        });
      },
    });
  }

  /**
   * Day 3 final montage: time skip beats then transition to ReleaseScene.
   */
  private playFinalMontage() {
    this.frozen = true;

    const steps = [
      { day: 'Day 270', desc: '50 pushups every morning.\nReading two books a week.\nDifferent person.', hold: 1500 },
      { day: 'Day 365', desc: "The doors open.\nJP walks out.\nNot the same kid who walked in.", hold: 2500 },
    ];

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.playTimeSkipStep(steps, 0, bg);
      },
    });
  }

  private playPushupMinigame() {
    this.frozen = true;
    let jpCount = 0;
    let rivalCount = 0;
    let timeLeft = 15;
    let active = true;
    const rivalInterval = 0.6; // seconds per pushup
    let rivalTimer = 0;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Darken background
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'PUSHUP CONTEST', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, 110, 'MASH SPACE!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instructions);

    // Timer (centered)
    const timer = this.add.text(GAME_WIDTH / 2, 145, '15s', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(timer);

    // --- LEFT SIDE: JP ---
    const jpLabel = this.add.text(GAME_WIDTH / 2 - 200, 190, 'JP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(jpLabel);

    const jpCounter = this.add.text(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(jpCounter);

    const jpSprite = this.add.sprite(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 80, this.getPlayerTexture(), 0)
      .setScale(6).setScrollFactor(0).setDepth(301);
    objects.push(jpSprite);

    // --- RIGHT SIDE: INMATE ---
    const rivalLabel = this.add.text(GAME_WIDTH / 2 + 200, 190, 'INMATE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(rivalLabel);

    const rivalCounter = this.add.text(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(rivalCounter);

    const rivalSprite = this.add.sprite(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 + 80, 'npc_inmate3', 0)
      .setScale(6).setScrollFactor(0).setDepth(301);
    objects.push(rivalSprite);

    // VS divider
    const vsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'VS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(vsText);

    // Catching up warning text (hidden by default)
    const warningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(warningText);

    // Crowd reaction text (hidden by default)
    const crowdText = this.add.text(GAME_WIDTH / 2, 50, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
    objects.push(crowdText);

    // JP pushup handler
    const doPushup = () => {
      if (!active) return;
      jpCount++;
      jpCounter.setText(String(jpCount));

      // Escalating squish — gets more exaggerated as count goes up
      const intensity = Math.min(jpCount / 30, 1); // 0→1 over 30 pushups
      const squishY = 3 - intensity * 1.5;   // 3 → 1.5
      const squishX = 7 + intensity * 2;     // 7 → 9
      this.tweens.add({
        targets: jpSprite,
        scaleY: squishY,
        scaleX: squishX,
        duration: 80,
        yoyo: true,
        ease: 'Power1',
      });

      // Counter pulse
      this.tweens.add({
        targets: jpCounter,
        scale: 1.2,
        duration: 60,
        yoyo: true,
      });

      // Sweat particles every 3rd pushup
      if (jpCount % 3 === 0) {
        for (let s = 0; s < 2; s++) {
          const sweatX = (GAME_WIDTH / 2 - 200) + Phaser.Math.Between(-20, 20);
          const sweatY = GAME_HEIGHT / 2 + 60;
          const sweat = this.add.circle(sweatX, sweatY, 3, 0x4488ff)
            .setScrollFactor(0).setDepth(303).setAlpha(0.8);
          objects.push(sweat);
          this.tweens.add({
            targets: sweat,
            y: sweatY + 40 + Phaser.Math.Between(0, 20),
            x: sweatX + Phaser.Math.Between(-10, 10),
            alpha: 0,
            duration: 500,
            ease: 'Quad.easeIn',
            onComplete: () => sweat.destroy(),
          });
        }
      }

      // Crowd reactions based on lead/deficit
      const diff = jpCount - rivalCount;
      if (diff >= 5) {
        crowdText.setText('THE YARD IS WATCHING');
        crowdText.setColor('#f0c040');
        crowdText.setAlpha(1);
        // Pulse effect
        this.tweens.add({
          targets: crowdText,
          scale: 1.15,
          duration: 200,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
      } else if (diff <= -3) {
        crowdText.setText('COME ON!');
        crowdText.setColor('#ff4444');
        crowdText.setAlpha(1);
        this.tweens.add({
          targets: crowdText,
          alpha: 0,
          duration: 400,
          delay: 200,
        });
      }
    };

    // Listen for space mashing
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const pushupListener = () => doPushup();
    spaceKey.on('down', pushupListener);

    // Also support touch/click mashing
    const pointerListener = () => doPushup();
    this.input.on('pointerdown', pointerListener);

    // Rival pushup timer (every 600ms)
    const rivalEvent = this.time.addEvent({
      delay: rivalInterval * 1000,
      loop: true,
      callback: () => {
        if (!active) return;
        rivalCount++;
        rivalCounter.setText(String(rivalCount));

        // Rival squish animation
        this.tweens.add({
          targets: rivalSprite,
          scaleY: 3,
          scaleX: 7,
          duration: 80,
          yoyo: true,
          ease: 'Power1',
        });

        // Check if rival is catching up
        if (rivalCount > jpCount && active) {
          warningText.setText("HE'S CATCHING UP!");
          warningText.setAlpha(1);
          this.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 500,
            delay: 300,
          });
        }
      },
    });

    // Countdown timer
    const timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 14,
      callback: () => {
        timeLeft--;
        timer.setText(`${timeLeft}s`);

        if (timeLeft <= 3) {
          timer.setColor('#ff4444');
        }

        if (timeLeft <= 0) {
          active = false;
          rivalEvent.remove();
          spaceKey.off('down', pushupListener);
          this.input.off('pointerdown', pointerListener);

          // Show result
          instructions.setText('TIME!');
          timer.setVisible(false);
          warningText.setText('');

          // Result message based on comparison
          let message = '';
          const diff = jpCount - rivalCount;
          if (diff > 10) {
            message = 'Destroyed. The yard is watching.';
            jpCounter.setColor('#f0c040');
          } else if (diff > 0) {
            message = 'JP wins. Respect earned.';
            jpCounter.setColor('#40c040');
          } else if (diff === 0) {
            message = 'Dead even. Mutual respect.';
            jpCounter.setColor('#aaaacc');
            rivalCounter.setColor('#aaaacc');
          } else {
            message = 'Inmate wins. JP nods. Next time.';
            rivalCounter.setColor('#ff6666');
          }

          const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#aaaacc',
            wordWrap: { width: 600 },
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
          objects.push(result);

          const scoreResult = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, `JP: ${jpCount}  |  INMATE: ${rivalCount}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#666666',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
          objects.push(scoreResult);

          // Track pushup outcome for reactive NPC dialogue
          if (diff > 10) this.pushupDominated = true;

          // Locked in on pushup win
          if (diff > 0) {
            MoodSystem.setMood('locked_in', 45);
          }

          // Clean up after 3 seconds
          this.time.delayedCall(3000, () => {
            for (const obj of objects) {
              if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
            }
            this.frozen = false;
          });
        }
      },
    });
  }

  private playDiceMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let roundNum = 0;
    let points = 10;
    const maxRounds = 5;
    let currentBet = 1;
    const betOptions = [1, 3, 5];
    let betIndex = 0;

    const winComments = ['Lucky.', 'JP collects.', 'The yard nods.'];
    const loseComments = ['Cold dice.', 'The yard laughs.', 'JP pays up.'];

    // Inmate speech bubbles — random shouts during rolls
    const inmateShouts = [
      'COME ON BABY', 'SEVEN SEVEN SEVEN', "HE'S HEATED",
      'LET IT RIDE', 'BLOW ON EM', 'THAT BOY NICE',
      'NAH NAH NAH', 'OOOH SHIT', 'PAY THE MAN',
      'CMON YOUNGSTER', "DON'T CHOKE", 'BIG MONEY',
    ];
    const shoutPositions = [
      { x: 80, y: 60 }, { x: GAME_WIDTH - 80, y: 60 },
      { x: 100, y: GAME_HEIGHT - 40 }, { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 40 },
      { x: 60, y: GAME_HEIGHT / 2 - 60 }, { x: GAME_WIDTH - 60, y: GAME_HEIGHT / 2 + 60 },
    ];
    const showInmateShout = () => {
      const msg = inmateShouts[Phaser.Math.Between(0, inmateShouts.length - 1)];
      const pos = shoutPositions[Phaser.Math.Between(0, shoutPositions.length - 1)];
      const shout = this.add.text(pos.x, pos.y, msg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ccccaa',
        backgroundColor: '#222222',
        padding: { x: 6, y: 4 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305).setAlpha(0);
      objects.push(shout);
      this.tweens.add({
        targets: shout,
        alpha: 1,
        y: pos.y - 15,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: shout,
            alpha: 0,
            y: pos.y - 35,
            duration: 800,
            delay: 600,
            ease: 'Quad.easeIn',
            onComplete: () => shout.destroy(),
          });
        },
      });
    };

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'YARD DICE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Round + points info
    const roundText = this.add.text(GAME_WIDTH / 2, 130, 'Round 1/5  |  Commissary: 10', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(roundText);

    // Two dice (white squares)
    const diceSize = 60;
    const die1Bg = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    const die2Bg = this.add.rectangle(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    objects.push(die1Bg, die2Bg);

    // Dice value text
    const die1Text = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const die2Text = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(die1Text, die2Text);

    // Bet selection display
    const betLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'BET:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(betLabel);

    const betButtons: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i++) {
      const bx = GAME_WIDTH / 2 + (i - 1) * 100;
      const btn = this.add.text(bx, GAME_HEIGHT / 2 + 115, String(betOptions[i]), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: i === 0 ? '#f0c040' : '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      objects.push(btn);
      betButtons.push(btn);
    }

    // Arrows around selected bet
    const leftArrow = this.add.text(GAME_WIDTH / 2 - 100 - 30, GAME_HEIGHT / 2 + 115, '<', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const rightArrow = this.add.text(GAME_WIDTH / 2 - 100 + 30, GAME_HEIGHT / 2 + 115, '>', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(leftArrow, rightArrow);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, 'LEFT/RIGHT to bet, SPACE to roll', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Result / flavor text
    const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(resultText);

    // Side commentary
    const commentText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 235, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(commentText);

    let rolling = false;
    let phase: 'betting' | 'rolling' | 'done' = 'betting';

    const updateBetDisplay = () => {
      currentBet = betOptions[betIndex];
      for (let i = 0; i < 3; i++) {
        const isSelected = i === betIndex;
        betButtons[i].setColor(isSelected ? '#f0c040' : '#666666');
        betButtons[i].setScale(isSelected ? 1.2 : 1);
        // Grey out bets player can't afford
        if (betOptions[i] > points) {
          betButtons[i].setColor('#333333');
        }
      }
      // Position arrows around selected bet
      const selectedX = GAME_WIDTH / 2 + (betIndex - 1) * 100;
      leftArrow.setPosition(selectedX - 30, GAME_HEIGHT / 2 + 115);
      rightArrow.setPosition(selectedX + 30, GAME_HEIGHT / 2 + 115);
    };

    const endGame = (reason?: string) => {
      phase = 'done';
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);
      instr.setText('');

      let finalMsg: string;
      if (points >= 20) {
        finalMsg = 'JP walks away up. Smart player.';
      } else if (points >= 10) {
        finalMsg = 'Broke even. Could be worse.';
      } else if (points >= 1) {
        finalMsg = "Down bad. But it's just soup.";
      } else {
        finalMsg = 'JP walks away empty.';
        this.diceBroke = true; // Track for Bird's warning
      }

      if (reason) {
        resultText.setText(reason);
        resultText.setColor('#ff4444');
      }

      const finalMsgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 270,
        `Final: ${points} pts  |  ${finalMsg}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(finalMsgText);

      // Clean up after 3 seconds
      this.time.delayedCall(3000, () => {
        spaceKey.off('down', inputListener);
        leftKey.off('down', inputListener);
        rightKey.off('down', inputListener);
        this.input.off('pointerdown', inputListener);
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    const rollDice = () => {
      if (phase !== 'betting' || rolling) return;
      // Can't bet more than you have
      if (currentBet > points) return;

      rolling = true;
      phase = 'rolling';
      resultText.setText('');
      commentText.setText('');
      instr.setText('Rolling...');
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);

      // Inmate shouts during the roll
      showInmateShout();
      this.time.delayedCall(500, () => showInmateShout());

      // Dice tumble animation — full rotation spin
      this.tweens.add({
        targets: [die1Bg, die1Text],
        angle: 360,
        duration: 150,
        repeat: 6,
        ease: 'Linear',
        onComplete: () => {
          die1Bg.setAngle(0);
          die1Text.setAngle(0);
        },
      });
      this.tweens.add({
        targets: [die2Bg, die2Text],
        angle: -360,
        duration: 150,
        repeat: 6,
        ease: 'Linear',
        onComplete: () => {
          die2Bg.setAngle(0);
          die2Text.setAngle(0);
        },
      });

      // Rapid random number cycling during tumble
      this.time.addEvent({
        delay: 60,
        repeat: 15,
        callback: () => {
          die1Text.setText(String(Phaser.Math.Between(1, 6)));
          die2Text.setText(String(Phaser.Math.Between(1, 6)));
        },
      });

      // Land on final values
      this.time.delayedCall(1100, () => {
        rolling = false;
        const val1 = Phaser.Math.Between(1, 6);
        const val2 = Phaser.Math.Between(1, 6);
        const total = val1 + val2;

        die1Text.setText(String(val1));
        die2Text.setText(String(val2));
        die1Bg.setAngle(0);
        die2Bg.setAngle(0);

        // Bounce tween on dice
        this.tweens.add({
          targets: [die1Bg, die1Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
        this.tweens.add({
          targets: [die2Bg, die2Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          delay: 50,
        });

        roundNum++;

        // Crowd reacts to result
        showInmateShout();

        if (total >= 7) {
          points += currentBet;
          resultText.setText(`${total}! Win +${currentBet} pts`);
          resultText.setColor('#40c040');
          commentText.setText(winComments[Phaser.Math.Between(0, winComments.length - 1)]);

          // Big win reaction (bet 5 and win)
          if (currentBet === 5) {
            const ohText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'OHHH!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '20px',
              color: '#f0c040',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(1);
            objects.push(ohText);
            this.tweens.add({
              targets: ohText,
              y: GAME_HEIGHT / 2 - 80,
              alpha: 0,
              scale: 1.5,
              duration: 800,
              ease: 'Quad.easeOut',
              onComplete: () => ohText.destroy(),
            });
          }
        } else {
          points -= currentBet;
          resultText.setText(`${total}. Lose -${currentBet} pts`);
          resultText.setColor('#ff4444');
          commentText.setText(loseComments[Phaser.Math.Between(0, loseComments.length - 1)]);

          // Big loss reaction (bet 5 and lose)
          if (currentBet === 5) {
            const damnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'DAMN.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '20px',
              color: '#ff4444',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303).setAlpha(1);
            objects.push(damnText);
            this.tweens.add({
              targets: damnText,
              y: GAME_HEIGHT / 2 - 70,
              alpha: 0,
              duration: 1000,
              ease: 'Quad.easeOut',
              onComplete: () => damnText.destroy(),
            });
          }
        }

        roundText.setText(`Round ${roundNum}/${maxRounds}  |  Commissary: ${points}`);

        // Check for going broke
        if (points <= 0) {
          points = 0;
          endGame("JP's out. Nothing left to bet.");
          return;
        }

        if (roundNum < maxRounds) {
          // Check for double-or-nothing dare on last round when JP is up
          if (roundNum === maxRounds - 1 && points > 10) {
            this.time.delayedCall(1500, () => {
              // Show the dare
              resultText.setText('');
              commentText.setText('');
              instr.setText('');
              betLabel.setVisible(false);
              for (const b of betButtons) b.setVisible(false);
              leftArrow.setVisible(false);
              rightArrow.setVisible(false);

              const dareText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'DOUBLE OR NOTHING?', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '18px',
                color: '#f0c040',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              objects.push(dareText);

              // Pulse the dare text
              this.tweens.add({
                targets: dareText,
                scale: 1.1,
                duration: 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              });

              let dareChoice = 0; // 0 = YES, 1 = NO
              const yesText = this.add.text(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2, '> YES', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: '#f0c040',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              const noText = this.add.text(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2, '  NO', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: '#666666',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
              objects.push(yesText, noText);

              const updateDareChoice = () => {
                if (dareChoice === 0) {
                  yesText.setText('> YES').setColor('#f0c040');
                  noText.setText('  NO').setColor('#666666');
                } else {
                  yesText.setText('  YES').setColor('#666666');
                  noText.setText('> NO').setColor('#f0c040');
                }
              };

              // Temporary dare input — reuse existing keys
              const dareInputHandler = (event?: { keyCode?: number }) => {
                const keyCode = event?.keyCode;
                if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT || keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
                  dareChoice = dareChoice === 0 ? 1 : 0;
                  updateDareChoice();
                  return;
                }
                if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || !keyCode) {
                  // Remove dare input
                  spaceKey.off('down', dareSpaceWrap);
                  leftKey.off('down', dareLeftWrap);
                  rightKey.off('down', dareRightWrap);
                  this.input.off('pointerdown', darePointerWrap);

                  // Clean up dare UI
                  dareText.destroy();
                  yesText.destroy();
                  noText.destroy();

                  if (dareChoice === 0) {
                    // YES — double or nothing: bet half of points
                    currentBet = Math.floor(points / 2);
                    roundText.setText(`FINAL ROUND  |  Commissary: ${points}  |  Bet: ${currentBet}`);
                    phase = 'betting';
                    rollDice();
                  } else {
                    // NO — normal last round
                    phase = 'betting';
                    roundText.setText(`Round ${roundNum + 1}/${maxRounds}  |  Commissary: ${points}`);
                    instr.setText('LEFT/RIGHT to bet, SPACE to roll');
                    betLabel.setVisible(true);
                    for (const b of betButtons) b.setVisible(true);
                    leftArrow.setVisible(true);
                    rightArrow.setVisible(true);
                    if (betOptions[betIndex] > points) betIndex = 0;
                    updateBetDisplay();
                  }
                }
              };

              const dareSpaceWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const dareLeftWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const dareRightWrap = (e: { keyCode: number }) => dareInputHandler(e);
              const darePointerWrap = () => dareInputHandler();

              spaceKey.on('down', dareSpaceWrap);
              leftKey.on('down', dareLeftWrap);
              rightKey.on('down', dareRightWrap);
              this.input.on('pointerdown', darePointerWrap);
            });
          } else {
            // Normal next round
            this.time.delayedCall(1500, () => {
              phase = 'betting';
              roundText.setText(`Round ${roundNum + 1}/${maxRounds}  |  Commissary: ${points}`);
              instr.setText('LEFT/RIGHT to bet, SPACE to roll');
              betLabel.setVisible(true);
              for (const b of betButtons) b.setVisible(true);
              leftArrow.setVisible(true);
              rightArrow.setVisible(true);
              // Reset bet index if current bet is unaffordable
              if (betOptions[betIndex] > points) {
                betIndex = 0;
              }
              updateBetDisplay();
            });
          }
        } else {
          endGame();
        }
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    const inputListener = (event?: { keyCode?: number }) => {
      if (phase === 'done') return;

      if (phase === 'betting' && !rolling) {
        const keyCode = event?.keyCode;
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
          betIndex = Math.max(0, betIndex - 1);
          // Skip unaffordable bets
          while (betIndex > 0 && betOptions[betIndex] > points) betIndex--;
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
          betIndex = Math.min(2, betIndex + 1);
          // Skip unaffordable bets
          while (betIndex < 2 && betOptions[betIndex] > points) {
            if (betOptions[betIndex] <= points) break;
            betIndex--;
            break;
          }
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || !keyCode) {
          rollDice();
        }
      }
    };

    spaceKey.on('down', (e: { keyCode: number }) => inputListener(e));
    leftKey.on('down', (e: { keyCode: number }) => inputListener(e));
    rightKey.on('down', (e: { keyCode: number }) => inputListener(e));
    this.input.on('pointerdown', () => inputListener());
  }

  private playBattleScene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const DEPTH = 400;
    const FONT = '"Press Start 2P", monospace';

    // === STATE ===
    type BattleState = 'intro' | 'menu' | 'player-action' | 'enemy-action' | 'text' | 'end';
    let state: BattleState = 'intro';
    let jpHP = 100;
    let enemyHP = 80;
    const jpMaxHP = 100;
    const enemyMaxHP = 80;
    let menuIndex = 0; // 0=SWING, 1=DODGE, 2=TALK, 3=WALK AWAY
    let dodgeActive = false;
    let talkDebuff = false; // reduces enemy attack by 5
    let inputEnabled = false;

    // === INTRO: Pokemon swipe transition ===
    const introTop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);
    const introBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);

    // Bars close in
    this.tweens.add({ targets: introTop, y: GAME_HEIGHT / 4, duration: 1 }); // already in place
    this.tweens.add({ targets: introBottom, y: GAME_HEIGHT * 3 / 4, duration: 1 });

    // Flash text "FIGHT!"
    const fightText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'FIGHT!', {
      fontFamily: FONT, fontSize: '36px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 51).setAlpha(0);
    objects.push(fightText);

    this.tweens.add({
      targets: fightText,
      alpha: 1,
      duration: 300,
      delay: 300,
      hold: 600,
      yoyo: true,
      onComplete: () => {
        fightText.destroy();
        // Open the bars to reveal the battle
        this.tweens.add({
          targets: introTop,
          y: -GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => introTop.destroy(),
        });
        this.tweens.add({
          targets: introBottom,
          y: GAME_HEIGHT + GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            introBottom.destroy();
            state = 'menu';
            inputEnabled = true;
          },
        });
      },
    });

    // === BACKGROUND ===
    // Dark concrete background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x252530)
      .setScrollFactor(0).setDepth(DEPTH);
    objects.push(bg);

    // Concrete wall texture lines (horizontal)
    for (let i = 0; i < 8; i++) {
      const y = 60 + i * 70;
      const line = this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 2, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1);
      objects.push(line);
    }
    // Vertical cracks
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 280;
      const crack = this.add.rectangle(x, GAME_HEIGHT / 3, 1, 120 + Math.random() * 80, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1).setAlpha(0.5);
      objects.push(crack);
    }

    // === ENEMY PLATFORM (top-left) ===
    const enemyPlatX = 340;
    const enemyPlatY = 250;
    const enemyPlatform = this.add.ellipse(enemyPlatX, enemyPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(enemyPlatform);

    // Enemy sprite
    const enemySprite = this.add.sprite(enemyPlatX, enemyPlatY, 'npc_inmate3', 0)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(enemySprite);
    const enemySpriteBaseX = enemyPlatX;
    const enemySpriteBaseY = enemyPlatY;

    // Enemy name + HP
    const enemyNameBg = this.add.rectangle(280, 80, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(enemyNameBg);

    const enemyName = this.add.text(130, 58, 'INMATE', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyName);

    const enemyHPLabel = this.add.text(130, 82, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyHPLabel);

    // HP bar background
    const enemyHPBgBar = this.add.rectangle(310, 87, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(enemyHPBgBar);

    // HP bar fill
    const enemyHPBar = this.add.rectangle(310, 87, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(enemyHPBar);

    // === JP PLATFORM (bottom-right) ===
    const jpPlatX = 940;
    const jpPlatY = 560;
    const jpPlatform = this.add.ellipse(jpPlatX, jpPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(jpPlatform);

    // JP sprite (facing up — frame 2)
    const jpSprite = this.add.sprite(jpPlatX, jpPlatY, this.getPlayerTexture(), 2)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(jpSprite);
    const jpSpriteBaseX = jpPlatX;
    const jpSpriteBaseY = jpPlatY;

    // JP name + HP
    const jpNameBg = this.add.rectangle(1000, 470, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(jpNameBg);

    const jpName = this.add.text(850, 448, 'JP', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpName);

    const jpHPLabel = this.add.text(850, 472, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPLabel);

    const jpHPText = this.add.text(1120, 472, `${jpHP}/${jpMaxHP}`, {
      fontFamily: FONT, fontSize: '10px', color: '#aaaacc',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPText);

    const jpHPBgBar = this.add.rectangle(900, 477, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(jpHPBgBar);

    const jpHPBar = this.add.rectangle(900, 477, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(jpHPBar);

    // === BATTLE MENU BOX (bottom, Pokemon-style) ===
    const menuY = 720;
    const menuBoxHeight = 240;

    // Text area (left side)
    const textBoxBg = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(textBoxBg);

    // Inner white border for Pokemon look
    const textBoxInner = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(textBoxInner);

    const battleText = this.add.text(40, menuY + 30, 'An inmate steps to JP.\n"You think you\'re tough?"', {
      fontFamily: FONT, fontSize: '13px', color: '#ffffff',
      wordWrap: { width: GAME_WIDTH / 2 - 80 }, lineSpacing: 8,
    }).setScrollFactor(0).setDepth(DEPTH + 11);
    objects.push(battleText);

    // Menu area (right side)
    const menuBoxBg = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(menuBoxBg);

    const menuBoxInner = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(menuBoxInner);

    // Menu options in 2x2 grid
    const menuOptions = ['SWING', 'DODGE', 'TALK', 'WALK AWAY'];
    const menuBaseX = GAME_WIDTH / 2 + 60;
    const menuBaseY = menuY + 50;
    const menuColGap = 260;
    const menuRowGap = 70;

    const menuTexts: Phaser.GameObjects.Text[] = [];
    const menuCursors: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = menuBaseX + col * menuColGap;
      const y = menuBaseY + row * menuRowGap;

      // Selection arrow
      const cursor = this.add.text(x - 5, y, '\u25b6', {
        fontFamily: FONT, fontSize: '14px', color: '#f0c040',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 12).setAlpha(i === 0 ? 1 : 0);
      objects.push(cursor);
      menuCursors.push(cursor);

      const text = this.add.text(x, y, menuOptions[i], {
        fontFamily: FONT, fontSize: '14px', color: i === 0 ? '#f0c040' : '#aaaacc',
      }).setScrollFactor(0).setDepth(DEPTH + 12);
      objects.push(text);
      menuTexts.push(text);
    }

    // === HP BAR HELPERS ===
    const getHPColor = (ratio: number): number => {
      if (ratio > 0.5) return 0x40c040; // green
      if (ratio > 0.25) return 0xc0c040; // yellow
      return 0xc04040; // red
    };

    const updateEnemyHP = () => {
      const ratio = Math.max(0, enemyHP / enemyMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: enemyHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          enemyHPBar.setFillStyle(color);
        },
      });
    };

    const updateJPHP = () => {
      const ratio = Math.max(0, jpHP / jpMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: jpHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          jpHPBar.setFillStyle(color);
        },
      });
      jpHPText.setText(`${Math.max(0, jpHP)}/${jpMaxHP}`);
    };

    // === MENU UPDATE ===
    const updateMenu = () => {
      for (let i = 0; i < 4; i++) {
        menuTexts[i].setColor(i === menuIndex ? '#f0c040' : '#aaaacc');
        menuCursors[i].setAlpha(i === menuIndex ? 1 : 0);
      }
    };

    // === WHITE FLASH ON HIT ===
    const flashSprite = (target: Phaser.GameObjects.Sprite) => {
      target.setTint(0xffffff);
      this.time.delayedCall(100, () => target.clearTint());

      // Impact particles — blood splatters (or stars in kids mode)
      const hitX = target.x;
      const hitY = target.y;
      const isKids = GameSettings.kidsMode;
      const particleCount = isKids ? 5 : 8;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const speed = 60 + Math.random() * 40;
        const color = isKids ? 0xf0c040 : 0xcc2020; // yellow stars vs blood red
        const size = isKids ? (4 + Math.random() * 3) : (3 + Math.random() * 5);
        const particle = this.add.circle(hitX, hitY, size, color)
          .setScrollFactor(0).setDepth(DEPTH + 20).setAlpha(0.9);
        objects.push(particle);
        this.tweens.add({
          targets: particle,
          x: hitX + Math.cos(angle) * speed,
          y: hitY + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: 300 + Math.random() * 200,
          ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      }

      // Blood drip that lingers (rated R only)
      if (!isKids && Math.random() > 0.4) {
        const drip = this.add.circle(hitX + (Math.random() - 0.5) * 20, hitY, 2, 0x990000, 0.7)
          .setScrollFactor(0).setDepth(DEPTH + 15);
        objects.push(drip);
        this.tweens.add({
          targets: drip,
          y: hitY + 30 + Math.random() * 20,
          alpha: 0.3,
          duration: 800,
          ease: 'Quad.easeIn',
        });
      }
    };

    // === SCREEN SHAKE (heavier for big hits) ===
    const screenShake = (heavy = false) => {
      if (heavy) {
        this.cameras.main.shake(350, 0.025);
      } else {
        this.cameras.main.shake(200, 0.015);
      }
    };

    // === SHOW BATTLE TEXT ===
    const showText = (text: string, callback?: () => void) => {
      state = 'text';
      inputEnabled = false;
      battleText.setText(text);
      this.time.delayedCall(1400, () => {
        if (callback) callback();
      });
    };

    // === SHOW MULTI-LINE TEXT SEQUENCE ===
    const showTextSequence = (lines: string[], callback?: () => void) => {
      let idx = 0;
      const showNext = () => {
        if (idx >= lines.length) {
          if (callback) callback();
          return;
        }
        battleText.setText(lines[idx]);
        idx++;
        this.time.delayedCall(1800, showNext);
      };
      showNext();
    };

    // === ENEMY TURN ===
    const enemyTurn = () => {
      state = 'enemy-action';
      inputEnabled = false;

      if (dodgeActive) {
        // Inmate swings and misses
        this.tweens.add({
          targets: enemySprite,
          x: enemySpriteBaseX + 120,
          duration: 200,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        dodgeActive = false;
        showText('Inmate swings... and misses!', () => {
          if (enemyHP <= 0) { endBattle(true); return; }
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
        return;
      }

      // Inmate attacks
      let damage = Phaser.Math.Between(10, 20);
      if (talkDebuff) {
        damage = Math.max(5, damage - 5);
      }

      // Enemy lunge animation
      this.tweens.add({
        targets: enemySprite,
        x: enemySpriteBaseX + 180,
        y: enemySpriteBaseY + 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Hit JP
          flashSprite(jpSprite);
          screenShake(damage > 15);
          jpHP -= damage;
          updateJPHP();

          // Enemy returns
          this.tweens.add({
            targets: enemySprite,
            x: enemySpriteBaseX,
            y: enemySpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`Inmate swings! JP takes ${damage} damage!`, () => {
            if (jpHP <= 0) { endBattle(false); return; }
            state = 'menu';
            inputEnabled = true;
            battleText.setText('What will JP do?');
          });
        },
      });
    };

    // === PLAYER ACTIONS ===
    const doSwing = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      const damage = Phaser.Math.Between(15, 25);

      // JP lunge animation
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX - 180,
        y: jpSpriteBaseY - 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          flashSprite(enemySprite);
          screenShake(damage > 20);
          enemyHP -= damage;
          updateEnemyHP();

          // JP returns
          this.tweens.add({
            targets: jpSprite,
            x: jpSpriteBaseX,
            y: jpSpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`JP swings! Hit for ${damage} damage!`, () => {
            if (enemyHP <= 0) { endBattle(true); return; }
            enemyTurn();
          });
        },
      });
    };

    const doDodge = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = true;

      // JP shifts sideways
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX + 50,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });

      showText('JP braces and dodges!', () => {
        enemyTurn();
      });
    };

    const doTalk = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      // Talk NEVER works in jail — you get slapped for trying
      showText('JP: "Bro we don\'t gotta do this—"', () => {
        showText('That gay ass shit don\'t work in here.', () => {
          // Enemy gets a FREE hit — bitch slap
          const slapDmg = 20;
          jpHP = Math.max(0, jpHP - slapDmg);
          updateJPHP();

          // Slap animation
          this.cameras.main.shake(300, 0.015);
          const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
            .setScrollFactor(0).setDepth(710).setAlpha(0.4);
          this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy(),
          });

          showText(`Inmate slaps JP! ${slapDmg} damage!\n"I SAID DON'T TALK TO ME."`, () => {
            if (jpHP <= 0) {
              endBattle(false);
            } else {
              enemyTurn();
            }
          });
        });
      });
    };

    const doWalkAway = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      if (enemyHP > 50) {
        showText("The inmate blocks the way.\nYou can't leave yet.", () => {
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
      } else {
        showText('JP walks away. Not worth it.', () => {
          endBattle(true);
        });
      }
    };

    // === END BATTLE ===
    const endBattle = (jpWon: boolean) => {
      state = 'end';
      inputEnabled = false;
      this.battleWon = jpWon; // Track for reactive NPC dialogue

      // Hide menu
      for (const t of menuTexts) t.setAlpha(0);
      for (const c of menuCursors) c.setAlpha(0);

      if (jpWon && enemyHP <= 0) {
        // Enemy falls
        this.tweens.add({
          targets: enemySprite,
          y: enemySpriteBaseY + 80,
          alpha: 0.3,
          angle: 90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        // Screen shake on KO
        screenShake(true);

        // Crowd roar text
        const roarText = this.add.text(GAME_WIDTH / 2, 180, 'K.O.', {
          fontFamily: FONT, fontSize: '40px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 30).setAlpha(0);
        objects.push(roarText);
        this.tweens.add({
          targets: roarText,
          alpha: 1,
          scale: 1.3,
          duration: 400,
          yoyo: true,
          hold: 600,
          ease: 'Quad.easeOut',
          onComplete: () => roarText.destroy(),
        });

        showTextSequence([
          'The inmate hits the ground.',
          'Guard: "BREAK IT UP! Both of you, against the wall!"',
          'JP: "He started it."',
          'Guard: "I don\'t care who started it. You want more time?"',
          "JP's Mind: Not worth it. Never again.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else if (jpWon) {
        // Walked away
        showTextSequence([
          'JP turns his back and walks.',
          "JP's Mind: That's the smart play.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else {
        // JP lost
        this.tweens.add({
          targets: jpSprite,
          y: jpSpriteBaseY + 80,
          alpha: 0.3,
          angle: -90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        // Screen shake on JP going down
        screenShake(true);

        // Crowd roar
        const lossRoar = this.add.text(GAME_WIDTH / 2, 180, 'K.O.', {
          fontFamily: FONT, fontSize: '40px', color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 30).setAlpha(0);
        objects.push(lossRoar);
        this.tweens.add({
          targets: lossRoar,
          alpha: 1,
          scale: 1.3,
          duration: 400,
          yoyo: true,
          hold: 600,
          ease: 'Quad.easeOut',
          onComplete: () => lossRoar.destroy(),
        });

        showTextSequence([
          'JP hits the ground.',
          'Guard: "BREAK IT UP!"',
          'Guard: "Both of you. Against the wall. Now."',
          "JP's Mind: That's the last time I fight in here.",
        ], () => {
          cleanupBattle();
        });
      }
    };

    // === CLEANUP ===
    const cleanupBattle = () => {
      // Pokemon bars closing transition
      const closeTop = this.add.rectangle(GAME_WIDTH / 2, -GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);
      const closeBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);

      this.tweens.add({
        targets: closeTop,
        y: GAME_HEIGHT / 4,
        duration: 500,
        ease: 'Quad.easeIn',
      });
      this.tweens.add({
        targets: closeBottom,
        y: GAME_HEIGHT * 3 / 4,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Destroy all battle objects
          upKey.off('down', onKeyDown);
          downKey.off('down', onKeyDown);
          leftKey.off('down', onKeyDown);
          rightKey.off('down', onKeyDown);
          spaceKey.off('down', onConfirm);

          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }

          // Open bars back to gameplay
          const openTop2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          const openBottom2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          this.tweens.add({
            targets: openTop2,
            y: -GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => { openTop2.destroy(); closeTop.destroy(); },
          });
          this.tweens.add({
            targets: openBottom2,
            y: GAME_HEIGHT + GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => {
              openBottom2.destroy();
              closeBottom.destroy();
              this.frozen = false;
            },
          });
        },
      });
    };

    // === INPUT ===
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const onKeyDown = (event: { keyCode: number }) => {
      if (!inputEnabled || state !== 'menu') return;

      const col = menuIndex % 2;
      const row = Math.floor(menuIndex / 2);

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP && row > 0) {
        menuIndex -= 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN && row < 1) {
        menuIndex += 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT && col > 0) {
        menuIndex -= 1;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT && col < 1) {
        menuIndex += 1;
      }
      updateMenu();
    };

    const onConfirm = () => {
      if (!inputEnabled || state !== 'menu') return;

      switch (menuIndex) {
        case 0: doSwing(); break;
        case 1: doDodge(); break;
        case 2: doTalk(); break;
        case 3: doWalkAway(); break;
      }
    };

    upKey.on('down', onKeyDown);
    downKey.on('down', onKeyDown);
    leftKey.on('down', onKeyDown);
    rightKey.on('down', onKeyDown);
    spaceKey.on('down', onConfirm);
  }

  // playTimeSkip removed — replaced by day system + playFinalMontage

  private playTimeSkipStep(
    steps: { day: string; desc: string; hold: number; shake?: boolean }[],
    index: number,
    bg: Phaser.GameObjects.Rectangle
  ) {
    if (index >= steps.length) {
      // All steps done — fade back to gameplay then transition
      this.tweens.add({
        targets: bg,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeOut',
        onComplete: () => {
          bg.destroy();
          this.frozen = false;
          this.requiredDone = true;
          // Transition to TractorScene
          this.transitionToScene('ReleaseScene');
        },
      });
      return;
    }

    const step = steps[index];

    // Day number — big, white, centered
    const dayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, step.day, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Description — smaller, muted color, below
    const descText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, step.desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#aaaacc',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Fade in the day number
    this.tweens.add({
      targets: dayText,
      alpha: 1,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Camera shake on birthday
        if (step.shake) {
          this.cameras.main.shake(400, 0.01);
        }

        // Fade in description after a beat
        this.tweens.add({
          targets: descText,
          alpha: 1,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold for the specified duration, then fade both out
            this.time.delayedCall(step.hold, () => {
              this.tweens.add({
                targets: [dayText, descText],
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  dayText.destroy();
                  descText.destroy();
                  // Brief pause between steps
                  this.time.delayedCall(300, () => {
                    this.playTimeSkipStep(steps, index + 1, bg);
                  });
                },
              });
            });
          },
        });
      },
    });
  }
}
