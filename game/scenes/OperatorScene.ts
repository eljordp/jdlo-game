import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, TILE_SIZE, SCALED_TILE } from '../config';
import { Analytics } from '../systems/Analytics';

export class OperatorScene extends BaseChapterScene {
  private npcsTalkedTo = new Set<string>();
  private dashboardDone = false;
  private pitchDone = false;
  private clockText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 7: Operator Mode';
    this.nextScene = 'VegasScene';
    this.requiredInteractionId = 'ch6_equal_moment';
  }

  protected getPlayerTexture(): string {
    return 'player-ch7';
  }

  protected getMusicTrack(): string {
    return 'operator';
  }

  create() {
    super.create();

    // Exit south -- head to Vegas (row 57 visible, triggers at 58)
    this.addNavArrow(19, 57, 'Vegas');

    // --- C8 Corvette + Lambo SVJ parked side by side ---
    const c8X = 19 * SCALED_TILE + SCALED_TILE / 2;
    const c8Y = 51 * SCALED_TILE + SCALED_TILE / 2;
    const c8 = this.add.sprite(c8X, c8Y, 'car-corvette-c8').setScale(SCALE).setDepth(5);
    this.collisionTiles.add('18,51'); this.collisionTiles.add('19,51'); this.collisionTiles.add('20,51');

    const svjX = 23 * SCALED_TILE + SCALED_TILE / 2;
    const svjY = 51 * SCALED_TILE + SCALED_TILE / 2;
    const svj = this.add.sprite(svjX, svjY, 'car-lambo-svj').setScale(SCALE).setDepth(5);
    this.collisionTiles.add('22,51'); this.collisionTiles.add('23,51'); this.collisionTiles.add('24,51');

    // --- Gym equipment (inside gym building ~rows 37-42, cols 3-12) ---
    // Bench press
    const benchX = 6 * SCALED_TILE + SCALED_TILE / 2;
    const benchY = 39 * SCALED_TILE + SCALED_TILE / 2;
    this.add.rectangle(benchX, benchY, 28, 14, 0x505060).setDepth(5); // bench
    this.add.rectangle(benchX, benchY - 8, 36, 3, 0x808090).setDepth(6); // barbell
    this.add.circle(benchX - 18, benchY - 8, 6, 0x404050).setDepth(6); // left plate
    this.add.circle(benchX + 18, benchY - 8, 6, 0x404050).setDepth(6); // right plate

    // Dumbbells rack
    const rackX = 10 * SCALED_TILE + SCALED_TILE / 2;
    const rackY = 38 * SCALED_TILE + SCALED_TILE / 2;
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(rackX + i * 10 - 20, rackY, 8, 6, 0x606070).setDepth(5);
      this.add.circle(rackX + i * 10 - 20 - 4, rackY, 3, 0x505060).setDepth(5);
      this.add.circle(rackX + i * 10 - 20 + 4, rackY, 3, 0x505060).setDepth(5);
    }

    // Pull-up bar
    const pullupX = 5 * SCALED_TILE + SCALED_TILE / 2;
    const pullupY = 41 * SCALED_TILE;
    this.add.rectangle(pullupX, pullupY, 40, 3, 0x808090).setDepth(6); // bar
    this.add.rectangle(pullupX - 18, pullupY, 3, 20, 0x606070).setDepth(5); // left post
    this.add.rectangle(pullupX + 18, pullupY, 3, 20, 0x606070).setDepth(5); // right post

    // --- Coffee shop details (inside ~rows 37-42, cols 14-19) ---
    // Espresso machine
    const espressoX = 16 * SCALED_TILE + SCALED_TILE / 2;
    const espressoY = 38 * SCALED_TILE + SCALED_TILE / 2;
    this.add.rectangle(espressoX, espressoY, 18, 14, 0x404048).setDepth(5); // machine body
    this.add.rectangle(espressoX, espressoY - 6, 12, 4, 0x808088).setDepth(6); // chrome top
    this.add.circle(espressoX - 4, espressoY + 2, 2, 0x30c060).setDepth(6); // green light

    // Matcha cup on counter
    const matchaX = 17 * SCALED_TILE;
    const matchaY = 40 * SCALED_TILE + SCALED_TILE / 2;
    this.add.circle(matchaX, matchaY, 5, 0x80c060).setDepth(6); // matcha green cup
    this.add.circle(matchaX, matchaY, 3, 0xa0e080).setDepth(7); // foam top

    // Menu board on wall
    const menuX = 15 * SCALED_TILE + SCALED_TILE / 2;
    const menuY = 37 * SCALED_TILE + 10;
    this.add.rectangle(menuX, menuY, 30, 20, 0x1a1a2a).setDepth(5); // chalkboard
    this.add.text(menuX, menuY, 'MENU', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '4px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(6);

    // --- Ambient office atmosphere ---

    // Subtle office lighting flicker (white overlay oscillating between 0.02 and 0.04 alpha)
    const ambientLight = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xffffff
    ).setScrollFactor(0).setDepth(1).setAlpha(0.02);

    this.tweens.add({
      targets: ambientLight,
      alpha: 0.04,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Location tag: "LA, CA" in the top-right corner
    const locationTag = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 20, 'LA, CA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({
      targets: locationTag,
      alpha: 0.35,
      duration: 1500,
      delay: 4000,
      ease: 'Quad.easeOut',
    });

    // Small clock display (advances as you explore)
    this.clockText = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 34, '2:00 PM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#f0c040',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({
      targets: this.clockText,
      alpha: 0.3,
      duration: 1500,
      delay: 4200,
      ease: 'Quad.easeOut',
    });
  }

  // Clock advances based on NPC count
  private advanceClock() {
    if (!this.clockText) return;
    const count = this.npcsTalkedTo.size;
    const times = ['2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];
    const timeIndex = Math.min(count, times.length - 1);
    this.clockText.setText(times[timeIndex]);
  }

  // Malachi reacts based on client count + dashboard/pitch
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    this.npcsTalkedTo.add(npcId);
    this.advanceClock();

    // Malachi impressed if you've talked to 5+ people
    if (npcId === 'ch6_malachi' && this.npcsTalkedTo.size >= 5) {
      const chapterDialogue = this.getChapterDialogue();
      const impressedLines = chapterDialogue.npcs['ch6_malachi_impressed'];
      if (impressedLines) {
        this.dialogue.show(impressedLines);
        return;
      }
    }

    // Team member thanks you after dashboard
    if (npcId === 'ch6_team' && this.dashboardDone) {
      const chapterDialogue = this.getChapterDialogue();
      const thanksLines = chapterDialogue.npcs['ch6_team_thanks'];
      if (thanksLines) {
        this.dialogue.show(thanksLines);
        return;
      }
    }

    // DHL manager reacts after pitch
    if (npcId === 'ch6_dhl' && this.pitchDone) {
      const chapterDialogue = this.getChapterDialogue();
      const solvedLines = chapterDialogue.npcs['ch6_dhl_solved'];
      if (solvedLines) {
        this.dialogue.show(solvedLines);
        return;
      }
    }

    this.dialogue.show(dialogue);
  }

  protected getObjectiveHint(): string {
    return 'Run the LA operation. Talk to everyone, then head south to Vegas.';
  }

  getMapData(): MapData {
    return operatorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return operatorDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch6_dashboard: {
        title: "Pomaika'i Team Dashboard",
        description: 'Full ops dashboard. Built in one session. Whole team uses it daily.',
        revenue: 'COO',
      },
      ch6_portfolio: {
        title: 'The Portfolio',
        description: '6+ clients. Websites, AI systems, sales ops. All self-taught in 5 months.',
        revenue: '$10K+/mo',
      },
    };
  }

  // --- Override handleInteractable for custom moments ---
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Client pitch presentation (big_client or client2)
    if (interactable.id === 'ch6_portfolio') {
      Analytics.trackInteraction(interactable.id);
      this.pitchDone = true;
      this.playClientPitch();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dashboard showcase
    if (interactable.id === 'ch6_dashboard') {
      Analytics.trackInteraction(interactable.id);
      this.dashboardDone = true;
      this.playDashboardShowcase();
      this.interactions.consume(interactable.id);
      return;
    }

    // The equal moment -- the required interaction
    if (interactable.id === 'ch6_equal_moment') {
      Analytics.trackInteraction(interactable.id);
      this.playEqualMoment();
      this.interactions.consume(interactable.id);
      return;
    }

    // Everything else goes to base handler
    super.handleInteractable(interactable);
  }

  // ─── CLIENT PITCH PRESENTATION ──────────────────────────────────────
  private playClientPitch() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // White "slide" rectangle
    const slideW = 700;
    const slideH = 380;
    const slide = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, slideW, slideH, 0xffffff)
      .setScrollFactor(0).setDepth(301);
    objects.push(slide);

    // Thin gold border on slide
    const border = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, slideW + 4, slideH + 4)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0xf0c040);
    objects.push(border);

    const slides = [
      { heading: 'The Problem', body: 'Client needs a system that runs\nwithout hand-holding.\nNo dashboards. No visibility.\nJust chaos.' },
      { heading: 'The Solution', body: 'Custom ops dashboard.\nAI-powered workflows.\nTeam Slack integration.\nBuilt in one weekend.' },
      { heading: 'The Result', value: '$15K/mo', sub: 'Recurring revenue. Zero downtime.' },
    ];

    let slideIndex = 0;
    let headingText: Phaser.GameObjects.Text | null = null;
    let bodyText: Phaser.GameObjects.Text | null = null;
    let valueText: Phaser.GameObjects.Text | null = null;
    let subText: Phaser.GameObjects.Text | null = null;

    const showSlide = (index: number) => {
      // Clean previous
      headingText?.destroy();
      bodyText?.destroy();
      valueText?.destroy();
      subText?.destroy();

      const s = slides[index];
      const slideTop = GAME_HEIGHT / 2 - 20 - slideH / 2;

      headingText = this.add.text(GAME_WIDTH / 2, slideTop + 50, s.heading, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '16px',
        color: '#111111',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
      objects.push(headingText);

      this.tweens.add({ targets: headingText, alpha: 1, duration: 400 });

      if (s.body) {
        bodyText = this.add.text(GAME_WIDTH / 2, slideTop + 130, s.body, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#333333',
          align: 'center',
          lineSpacing: 10,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(bodyText);
        this.tweens.add({ targets: bodyText, alpha: 1, duration: 400, delay: 200 });
      }

      if (s.value) {
        valueText = this.add.text(GAME_WIDTH / 2, slideTop + 160, s.value, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '32px',
          color: '#c8a020',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(valueText);
        this.tweens.add({ targets: valueText, alpha: 1, duration: 600, delay: 300 });
      }

      if (s.sub) {
        subText = this.add.text(GAME_WIDTH / 2, slideTop + 220, s.sub, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#555555',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
        objects.push(subText);
        this.tweens.add({ targets: subText, alpha: 1, duration: 400, delay: 500 });
      }
    };

    showSlide(0);

    // Auto-advance slides
    const advanceTimer = this.time.addEvent({
      delay: 3000,
      repeat: 2,
      callback: () => {
        slideIndex++;
        if (slideIndex < slides.length) {
          showSlide(slideIndex);
        } else {
          // All slides done -- show "Deal closed."
          headingText?.destroy();
          bodyText?.destroy();
          valueText?.destroy();
          subText?.destroy();

          const closedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Deal closed.', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#111111',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
          objects.push(closedText);

          this.tweens.add({
            targets: closedText,
            alpha: 1,
            duration: 600,
            onComplete: () => {
              this.time.delayedCall(1500, () => {
                // Fade out everything
                this.tweens.add({
                  targets: objects,
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    for (const obj of objects) obj.destroy();
                    // End with narrator line
                    this.dialogue.show([
                      { speaker: 'Narrator', text: 'JP doesn\'t pitch anymore. He presents.' },
                    ], () => { this.frozen = false; });
                  },
                });
              });
            },
          });
        }
      },
    });
    objects.push(advanceTimer as unknown as Phaser.GameObjects.GameObject);
  }

  // ─── DASHBOARD SHOWCASE ─────────────────────────────────────────────
  private playDashboardShowcase() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92)
      .setScrollFactor(0).setDepth(300);
    objects.push(bg);

    // Green-bordered terminal
    const termW = 640;
    const termH = 360;
    const termBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x0a0a0a)
      .setScrollFactor(0).setDepth(301);
    objects.push(termBg);

    const termBorder = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW + 4, termH + 4)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x00ff66);
    objects.push(termBorder);

    // Terminal header
    const headerBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 16, termW, 32, 0x0d1a0d)
      .setScrollFactor(0).setDepth(302);
    objects.push(headerBar);

    const headerText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 16, "POMAIKA'I OPS DASHBOARD", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#00ff66',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(headerText);

    // Stats that count up
    const stats = [
      { label: 'Team Members', target: 8, suffix: '' },
      { label: 'Active Projects', target: 12, suffix: '' },
      { label: 'Monthly Revenue', target: 15, suffix: 'K', prefix: '$' },
    ];

    const startY = GAME_HEIGHT / 2 - termH / 2 + 80;
    const statTexts: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const y = startY + i * 80;

      // Label
      const label = this.add.text(GAME_WIDTH / 2 - 200, y, stat.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#00cc55',
      }).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(label);

      // Value (starts at 0)
      const valueStr = `${stat.prefix || ''}0${stat.suffix}`;
      const valueObj = this.add.text(GAME_WIDTH / 2 + 160, y, valueStr, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: '#00ff66',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(valueObj);
      statTexts.push(valueObj);

      // Dots between label and value
      const dots = this.add.text(GAME_WIDTH / 2 - 10, y + 4, '..............', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#005522',
      }).setScrollFactor(0).setDepth(303).setAlpha(0);
      objects.push(dots);

      // Stagger the reveal of each stat row
      const delay = i * 600;
      this.tweens.add({ targets: [label, valueObj, dots], alpha: 1, duration: 300, delay });

      // Count-up animation
      const counter = { value: 0 };
      this.tweens.add({
        targets: counter,
        value: stat.target,
        duration: 1500,
        delay: delay + 300,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          const v = Math.round(counter.value);
          valueObj.setText(`${stat.prefix || ''}${v}${stat.suffix}`);
        },
      });
    }

    // After all counters finish, show Malachi's line
    const totalDuration = (stats.length - 1) * 600 + 300 + 1500 + 800;
    this.time.delayedCall(totalDuration, () => {
      // Fade out the dashboard
      this.tweens.add({
        targets: objects,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          for (const obj of objects) obj.destroy();
          this.dialogue.show([
            { speaker: 'Malachi', text: 'This is what I needed. You built this in one session?' },
          ], () => { this.frozen = false; });
        },
      });
    });
  }

  // ─── EQUAL MOMENT (Required Interaction) ────────────────────────────
  private playEqualMoment() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dim the screen
    const dimOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(300);
    objects.push(dimOverlay);

    this.tweens.add({
      targets: dimOverlay,
      alpha: 0.6,
      duration: 800,
      onComplete: () => {
        // Line 1: "Six months ago he was on a tractor."
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Six months ago he was on a tractor.' },
        ], () => {
          // Pause 2 seconds
          this.time.delayedCall(2000, () => {
            // Line 2
            this.dialogue.show([
              { speaker: 'Narrator', text: 'Now he sits at tables with people doing $400K a month.' },
            ], () => {
              // Pause 1.5 seconds
              this.time.delayedCall(1500, () => {
                // Line 3
                this.dialogue.show([
                  { speaker: 'Narrator', text: 'And they treat him like an equal.' },
                ], () => {
                  // Mark required done
                  this.requiredDone = true;

                  // Fade dim back out
                  this.tweens.add({
                    targets: dimOverlay,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => {
                      for (const obj of objects) obj.destroy();
                      this.frozen = false;
                    },
                  });
                });
              });
            });
          });
        });
      },
    });
  }
}
