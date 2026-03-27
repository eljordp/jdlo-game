import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class HomeScene extends BaseChapterScene {
  private interactionCount = 0;
  private phoneTriggered = false;
  private trackedInteractions = new Set<string>();

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
    return ''; // Home is quiet — no synthetic music needed
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

  // Override to add computer interface, fetch, goodbye, phone ring
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch0_computer') {
      Analytics.trackInteraction(interactable.id);
      this.showComputerInterface();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_frenchie_ball') {
      Analytics.trackInteraction(interactable.id);
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_fishing') {
      Analytics.trackInteraction(interactable.id);
      this.playFishing();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_goodbye') {
      Analytics.trackInteraction(interactable.id);
      this.playGoodbyeCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    this.trackForPhoneCall(interactable.id);
    super.handleInteractable(interactable);
  }

  private trackForPhoneCall(id: string) {
    if (this.phoneTriggered) return;
    if (this.trackedInteractions.has(id)) return;
    this.trackedInteractions.add(id);
    this.interactionCount++;

    // After 4 unique interactions, trigger surprise phone call
    if (this.interactionCount >= 4) {
      this.phoneTriggered = true;
      // Delay so current interaction finishes first
      this.time.delayedCall(2000, () => {
        if (this.scene.isActive()) this.triggerPhoneCall();
      });
    }
  }

  private triggerPhoneCall() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Vibrate/ring effect — screen shake
    this.cameras.main.shake(200, 0.003);

    // Phone overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Phone body — centered on screen
    const phoneX = GAME_WIDTH / 2;
    const phoneY = GAME_HEIGHT / 2 - 40;
    const phoneW = 200;
    const phoneH = 340;

    // Phone outer body
    const phoneBody = this.add.rectangle(phoneX, phoneY, phoneW, phoneH, 0x1a1a1a)
      .setScrollFactor(0).setDepth(301);
    objects.push(phoneBody);

    // Phone screen
    const phoneScreen = this.add.rectangle(phoneX, phoneY - 20, phoneW - 20, phoneH - 80, 0x0a2040)
      .setScrollFactor(0).setDepth(302);
    objects.push(phoneScreen);

    // Caller name
    const callerName = this.add.text(phoneX, phoneY - 80, 'Nolan', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callerName);

    // "Incoming Call" text
    const callLabel = this.add.text(phoneX, phoneY - 50, 'Incoming Call...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#80a0c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callLabel);

    // Pulsing ring animation on caller name
    this.tweens.add({
      targets: callerName,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Periodic vibrate
    const vibrateTimer = this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (this.scene.isActive()) this.cameras.main.shake(150, 0.002);
      },
    });

    // Answer button — green
    const btnY = phoneY + phoneH / 2 - 40;
    const answerBtn = this.add.rectangle(phoneX, btnY, 140, 36, 0x30a040)
      .setScrollFactor(0).setDepth(303).setInteractive({ useHandCursor: true });
    objects.push(answerBtn);

    const answerText = this.add.text(phoneX, btnY, 'ANSWER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
    objects.push(answerText);

    // Button hover effect
    answerBtn.on('pointerover', () => answerBtn.setFillStyle(0x40c050));
    answerBtn.on('pointerout', () => answerBtn.setFillStyle(0x30a040));

    // Answer handler
    const answer = () => {
      vibrateTimer.remove();
      answerBtn.off('pointerdown');
      spaceKey.off('down', spaceHandler);

      // Clean up phone UI
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }

      // Nolan dialogue
      this.dialogue.show([
        { speaker: 'Nolan', text: 'Yooo JP! What\'s good bro?' },
        { speaker: 'JP', text: 'Nolan. What\'s up man?' },
        { speaker: 'Nolan', text: 'Bro. This weekend. Santa Barbara. You gotta come.' },
        { speaker: 'Nolan', text: 'We got the frat house, the beach, the whole thing.' },
        { speaker: 'JP', text: 'Who\'s going?' },
        { speaker: 'Nolan', text: 'Everyone bro. David, Cooper, Terrell. Some girls too.' },
        { speaker: 'Nolan', text: 'It\'s gonna be crazy. You in?' },
        { speaker: 'JP', text: '...I\'m in.' },
        { speaker: 'Nolan', text: 'LET\'S GO! I\'ll send you the address. Pack light bro.' },
      ], () => {
        // Mark the required interaction as done
        this.requiredDone = true;
        this.frozen = false;
      });
    };

    answerBtn.on('pointerdown', answer);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const spaceHandler = () => answer();
    spaceKey.on('down', spaceHandler);
  }

  private showComputerInterface() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let selectedIndex = 0;
    let active = true;

    const menuItems = [
      { label: 'Crypto Portfolio', lines: [
        { speaker: 'JP\'s Mind', text: 'Bitcoin, Ethereum, some random altcoins. Down 40% this month.' },
        { speaker: 'JP\'s Mind', text: 'Pops would kill me if he knew how much I put in.' },
      ]},
      { label: 'College Emails', lines: [
        { speaker: 'JP\'s Mind', text: '3 acceptance letters. UC Davis, Sac State, Sonoma.' },
        { speaker: 'JP\'s Mind', text: '$40K a year for something I can learn on YouTube? Nah.' },
      ]},
      { label: 'Social Media', lines: [
        { speaker: 'JP\'s Mind', text: 'Instagram DMs. Nolan wants to link in Santa Barbara this weekend.' },
        { speaker: 'JP\'s Mind', text: '"Bro come thru. Crazy party at the frat house."' },
      ]},
      { label: 'YouTube - "How to Make Money Online"', lines: [
        { speaker: 'JP\'s Mind', text: 'Dropshipping, crypto trading, affiliate marketing...' },
        { speaker: 'JP\'s Mind', text: 'Everyone\'s selling the dream. Nobody shows the work.' },
      ]},
      { label: '[ Exit ]', lines: [] },
    ];

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Monitor frame — outer bezel
    const monW = 700;
    const monH = 480;
    const monX = GAME_WIDTH / 2;
    const monY = GAME_HEIGHT / 2 - 20;
    const bezel = this.add.rectangle(monX, monY, monW + 20, monH + 20, 0x2a2a2a)
      .setScrollFactor(0).setDepth(301);
    objects.push(bezel);

    // Screen background — dark blue/black
    const screen = this.add.rectangle(monX, monY, monW, monH, 0x0a0a1e)
      .setScrollFactor(0).setDepth(302);
    objects.push(screen);

    // Monitor stand
    const stand = this.add.rectangle(monX, monY + monH / 2 + 20, 60, 20, 0x2a2a2a)
      .setScrollFactor(0).setDepth(301);
    objects.push(stand);
    const base = this.add.rectangle(monX, monY + monH / 2 + 35, 120, 10, 0x333333)
      .setScrollFactor(0).setDepth(301);
    objects.push(base);

    // Screen header
    const header = this.add.text(monX, monY - monH / 2 + 30, 'JP\'s Computer', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#40c080',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(header);

    // Divider line
    const divider = this.add.rectangle(monX, monY - monH / 2 + 50, monW - 40, 1, 0x304030)
      .setScrollFactor(0).setDepth(303);
    objects.push(divider);

    // Menu items
    const menuTexts: Phaser.GameObjects.Text[] = [];
    const startY = monY - monH / 2 + 80;
    for (let i = 0; i < menuItems.length; i++) {
      const item = this.add.text(monX - monW / 2 + 60, startY + i * 40, menuItems[i].label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: i === selectedIndex ? '#40ff80' : '#608060',
      }).setScrollFactor(0).setDepth(303);
      objects.push(item);
      menuTexts.push(item);
    }

    // Cursor arrow
    const cursor = this.add.text(monX - monW / 2 + 40, startY, '>', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#40ff80',
    }).setScrollFactor(0).setDepth(303);
    objects.push(cursor);

    // Blinking cursor animation
    this.tweens.add({
      targets: cursor,
      alpha: 0.3,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    // Instructions
    const hint = this.add.text(monX, monY + monH / 2 - 20, 'Arrow keys to navigate  ·  Space to select', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#405040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(hint);

    const updateSelection = () => {
      for (let i = 0; i < menuTexts.length; i++) {
        menuTexts[i].setColor(i === selectedIndex ? '#40ff80' : '#608060');
      }
      cursor.setY(startY + selectedIndex * 40);
    };

    const closeInterface = () => {
      if (!active) return;
      active = false;
      upKey.off('down', upHandler);
      downKey.off('down', downHandler);
      selectKey.off('down', selectHandler);
      enterKey.off('down', selectHandler);
      this.input.off('pointerdown', clickHandler);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    };

    const selectItem = () => {
      if (!active) return;
      const item = menuItems[selectedIndex];

      // Exit option
      if (item.lines.length === 0) {
        closeInterface();
        return;
      }

      // Show dialogue for selected item, then return to menu
      active = false;
      for (const obj of objects) {
        if (obj && obj.active) {
          (obj as Phaser.GameObjects.Sprite | Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle).setAlpha?.(0.3);
        }
      }

      this.dialogue.show(item.lines, () => {
        active = true;
        for (const obj of objects) {
          if (obj && obj.active) {
            (obj as Phaser.GameObjects.Sprite | Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle).setAlpha?.(1);
          }
        }
        updateSelection();
      });
    };

    // Input handlers
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const selectKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const upHandler = () => { if (!active) return; selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length; updateSelection(); };
    const downHandler = () => { if (!active) return; selectedIndex = (selectedIndex + 1) % menuItems.length; updateSelection(); };
    const selectHandler = () => selectItem();
    const clickHandler = () => selectItem();

    upKey.on('down', upHandler);
    downKey.on('down', downHandler);
    selectKey.on('down', selectHandler);
    enterKey.on('down', selectHandler);
    this.input.on('pointerdown', clickHandler);
  }

  private playFishing() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let totalCaught = 0;
    let round = 0;
    const totalRounds = 3;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 50, 'FISHING WITH POPS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Score
    const scoreText = this.add.text(GAME_WIDTH - 120, 50, 'Caught: 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(scoreText);

    // Pond — blue rectangle in bottom half
    const pondY = GAME_HEIGHT / 2 + 80;
    const pondW = GAME_WIDTH - 200;
    const pondH = 340;
    const pond = this.add.rectangle(GAME_WIDTH / 2, pondY, pondW, pondH, 0x2060a0)
      .setScrollFactor(0).setDepth(300);
    objects.push(pond);

    // Pond surface shimmer
    const shimmer = this.add.rectangle(GAME_WIDTH / 2, pondY - 40, pondW - 40, 8, 0x3080c0, 0.4)
      .setScrollFactor(0).setDepth(301);
    objects.push(shimmer);
    this.tweens.add({
      targets: shimmer,
      alpha: 0.15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // Fishing line — thin white line from top center
    const lineTopX = GAME_WIDTH / 2;
    const lineTopY = pondY - pondH / 2 - 30;
    const bobberRestY = pondY - pondH / 2 + 20;
    const line = this.add.line(0, 0, lineTopX, lineTopY, lineTopX, bobberRestY, 0xffffff, 0.6)
      .setScrollFactor(0).setDepth(302).setLineWidth(1);
    objects.push(line);

    // Bobber — small red circle
    const bobber = this.add.circle(lineTopX, bobberRestY, 6, 0xff3030)
      .setScrollFactor(0).setDepth(303);
    objects.push(bobber);
    // White top half of bobber
    const bobberTop = this.add.circle(lineTopX, bobberRestY - 3, 3, 0xffffff)
      .setScrollFactor(0).setDepth(304);
    objects.push(bobberTop);

    // Fish swimming under the surface — barely visible
    const fishArr: Phaser.GameObjects.Rectangle[] = [];
    const fishSpeeds: number[] = [];
    for (let i = 0; i < 5; i++) {
      const fx = 200 + Math.random() * (GAME_WIDTH - 400);
      const fy = pondY - 40 + Math.random() * (pondH - 100);
      const fishW = 10 + Math.random() * 8;
      const fish = this.add.rectangle(fx, fy, fishW, 4, 0x183050, 0.25)
        .setScrollFactor(0).setDepth(301);
      objects.push(fish);
      fishArr.push(fish);
      fishSpeeds.push((0.3 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1));
    }

    // Fish movement update
    const fishUpdate = () => {
      for (let i = 0; i < fishArr.length; i++) {
        const f = fishArr[i];
        if (!f.active) continue;
        f.x += fishSpeeds[i];
        const leftBound = GAME_WIDTH / 2 - pondW / 2 + 20;
        const rightBound = GAME_WIDTH / 2 + pondW / 2 - 20;
        if (f.x < leftBound) { f.x = leftBound; fishSpeeds[i] *= -1; }
        if (f.x > rightBound) { f.x = rightBound; fishSpeeds[i] *= -1; }
      }
    };
    this.events.on('update', fishUpdate);

    // Instruction text
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Waiting...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // State
    let waiting = false;
    let biteActive = false;
    let biteTimer: Phaser.Time.TimerEvent | null = null;
    let missTimer: Phaser.Time.TimerEvent | null = null;

    const startRound = () => {
      waiting = true;
      biteActive = false;
      instr.setText(`Round ${round + 1}/${totalRounds} — Wait for a bite...`);
      bobber.setPosition(lineTopX, bobberRestY);
      bobberTop.setPosition(lineTopX, bobberRestY - 3);
      line.setTo(lineTopX, lineTopY, lineTopX, bobberRestY);

      // Random wait 2-5 seconds before bite
      const waitTime = 2000 + Math.random() * 3000;
      biteTimer = this.time.delayedCall(waitTime, () => {
        triggerBite();
      });
    };

    const triggerBite = () => {
      biteActive = true;
      waiting = false;

      // Bobber dips down
      this.tweens.add({
        targets: bobber,
        y: bobberRestY + 14,
        duration: 150,
        yoyo: true,
        repeat: 2,
        ease: 'Bounce.easeOut',
      });
      this.tweens.add({
        targets: bobberTop,
        y: bobberRestY + 11,
        duration: 150,
        yoyo: true,
        repeat: 2,
        ease: 'Bounce.easeOut',
      });

      // Flash BITE! text
      const biteText = this.add.text(GAME_WIDTH / 2, pondY - pondH / 2 - 10, 'BITE!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ff4444',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
      objects.push(biteText);

      // Blink the text
      this.tweens.add({
        targets: biteText,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 4,
      });

      instr.setText('SPACE to reel in!');

      // 1 second window to react
      missTimer = this.time.delayedCall(1000, () => {
        if (!biteActive) return;
        biteActive = false;
        biteText.destroy();

        const missText = this.add.text(GAME_WIDTH / 2, pondY - 30, 'It got away.', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#ff8888',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
        objects.push(missText);

        this.time.delayedCall(1500, () => {
          missText.destroy();
          round++;
          if (round < totalRounds) {
            startRound();
          } else {
            finishFishing();
          }
        });
      });
    };

    const reelIn = () => {
      if (biteActive) {
        biteActive = false;
        if (missTimer) { missTimer.remove(); missTimer = null; }
        totalCaught++;
        scoreText.setText(`Caught: ${totalCaught}`);

        // Destroy the BITE text if it exists
        const biteTexts = objects.filter(o => o.active && o instanceof Phaser.GameObjects.Text && (o as Phaser.GameObjects.Text).text === 'BITE!');
        biteTexts.forEach(t => t.destroy());

        // Fish caught message
        const fishNames = ['a bass', 'a trout', 'a catfish'];
        const caughtText = this.add.text(GAME_WIDTH / 2, pondY - 60, `JP caught ${fishNames[round] || 'a fish'}!`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#40c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
        objects.push(caughtText);

        // Show caught fish sprite (a visible shape)
        const caughtFish = this.add.rectangle(GAME_WIDTH / 2, pondY - 30, 24, 10, 0x4090c0)
          .setScrollFactor(0).setDepth(305);
        objects.push(caughtFish);
        this.tweens.add({
          targets: caughtFish,
          y: pondY - 80,
          alpha: 0,
          duration: 1500,
          ease: 'Quad.easeOut',
        });

        this.time.delayedCall(2000, () => {
          caughtText.destroy();
          round++;
          if (round < totalRounds) {
            startRound();
          } else {
            finishFishing();
          }
        });
      }
    };

    const finishFishing = () => {
      this.events.off('update', fishUpdate);
      spaceKey.off('down', reelListener);
      this.input.off('pointerdown', reelListener);

      instr.setText(`Total catch: ${totalCaught}/${totalRounds}`);
      title.setText(totalCaught === totalRounds ? 'FULL BUCKET!' : totalCaught > 0 ? 'NOT BAD' : 'SKUNKED');

      this.time.delayedCall(2000, () => {
        // Cleanup mini-game visuals
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }

        // Post-fishing dialogue from Pops
        this.dialogue.show([
          { speaker: 'Pops', text: 'Not bad. Remember when we used to do this every weekend?' },
          { speaker: 'JP', text: 'Yeah. I miss that.' },
          { speaker: 'Pops', text: 'We\'ll do it again. When you come back.' },
        ], () => {
          this.frozen = false;
        });
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const reelListener = () => reelIn();
    spaceKey.on('down', reelListener);
    this.input.on('pointerdown', reelListener);

    // Start first round
    startRound();
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
