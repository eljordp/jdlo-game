import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class OperatorScene extends BaseChapterScene {
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

    // Exit south -- head to Vegas
    this.addNavArrow(19, 36, 'Vegas');

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

    // Small clock display
    const clockText = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 34, '2:00 PM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#f0c040',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(300).setAlpha(0);

    this.tweens.add({
      targets: clockText,
      alpha: 0.3,
      duration: 1500,
      delay: 4200,
      ease: 'Quad.easeOut',
    });
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
      this.playClientPitch();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dashboard showcase
    if (interactable.id === 'ch6_dashboard') {
      Analytics.trackInteraction(interactable.id);
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
