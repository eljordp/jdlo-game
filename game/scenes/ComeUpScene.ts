import { BaseChapterScene } from './BaseChapterScene';
import { comeUpMap, MapData } from '../data/maps';
import { comeUpDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';
import { MoodSystem } from '../systems/MoodSystem';
import { InventorySystem } from '../systems/InventorySystem';

export class ComeUpScene extends BaseChapterScene {
  private typingPlayed = false;
  private clientReturned = false;
  private ghostMoved = false;
  private stickerTalked = false;
  private lateNightActive = false;
  private rejectionPlayed = false;
  private bankChecked = false;
  private timePassagePlayed = false;
  private popsCallDone = false;

  constructor() {
    super({ key: 'ComeUpScene' });
    this.chapterTitle = 'Chapter 6: The Come Up';
    this.nextScene = 'LAScene';
    this.requiredInteractionId = 'ch5_first_dollar';
  }

  protected getPlayerTexture(): string {
    return 'player-ch5';
  }

  protected getMusicTrack(): string {
    return 'come-up';
  }

  create() {
    super.create();
    // Client showcases
    this.addNavArrow(5, 16, 'WCT');
    this.addNavArrow(18, 16, 'Sticker Smith');
    this.addNavArrow(15, 21, 'DHL');
    // Exit at bottom
    this.addNavArrow(30, 27, 'Exit');
  }

  protected getObjectiveHint(): string {
    return 'Visit clients. Build your portfolio.';
  }

  getMapData(): MapData {
    return comeUpMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return comeUpDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch5_wct_showcase: {
        title: 'WCT E-Commerce',
        description: 'Full online store. Product pages, cart, checkout. Built in one week.',
        revenue: '$900',
      },
      ch5_sticker_showcase: {
        title: 'The Sticker Smith',
        description: 'Complete brand overhaul. Website, Google Business, marketing system.',
        revenue: '$1,000',
      },
      ch5_dhl_showcase: {
        title: 'DHL Translator App',
        description: 'Translation tool for warehouse workers. Enterprise deployment.',
        revenue: 'Enterprise',
      },
    };
  }

  // Ghost prospect walks away when you approach
  protected onPlayerMove(tileX: number, tileY: number): void {
    if (!this.ghostMoved) {
      const ghost = this.npcs.find(n => n.id === 'ch5_ghost');
      if (ghost) {
        const ghostTX = Math.round((ghost.sprite.x - 32) / 64);
        const ghostTY = Math.round((ghost.sprite.y - 32) / 64);
        const dist = Math.abs(ghostTX - tileX) + Math.abs(ghostTY - tileY);
        if (dist <= 3) {
          this.ghostMoved = true;
          // Ghost walks away
          this.collisionTiles.delete(`${ghostTX},${ghostTY}`);
          this.tweens.add({
            targets: ghost.sprite,
            x: ghost.sprite.x + 64 * 4,
            alpha: 0.3,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
              // Update dialogue
              ghost.dialogue = [
                { speaker: 'Narrator', text: 'He\'s gone. Some people just waste your time.' },
                { speaker: 'JP\'s Mind', text: 'Learn to spot them.' },
              ];
            },
          });
        }
      }
    }

    // Late night dim effect after examining 3am interactable
    if (this.lateNightActive) return;
  }

  // Sticker Smith triggers referral chain to Manza
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    if (npcId === 'ch5_sticker' && !this.stickerTalked) {
      this.stickerTalked = true;
      this.dialogue.show(dialogue, () => {
        // After talking to Sticker, Manza gets a referral indicator
        const manza = this.npcs.find(n => n.id === 'ch5_manza');
        if (manza) {
          // Sparkle effect on Manza
          const sparkle = this.add.text(
            manza.sprite.x, manza.sprite.y - 40, 'NEW!',
            { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040' }
          ).setOrigin(0.5).setDepth(15);
          this.tweens.add({
            targets: sparkle,
            y: sparkle.y - 8,
            duration: 800,
            yoyo: true,
            repeat: -1,
          });
          // Update Manza dialogue to reference Sticker
          manza.dialogue = [
            { speaker: 'Manza', text: 'Yo, Sticker just told me about you.' },
            { speaker: 'Manza', text: 'I got like five friends who need sites. You ready?' },
            { speaker: 'JP', text: 'Send them all.' },
            { speaker: 'JP\'s Mind', text: 'Word of mouth. The best kind of marketing.' },
          ];
        }
      });
      return;
    }

    this.dialogue.show(dialogue);
  }

  // Override to add typing mini-game and payment cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch5_stack' || interactable.id === 'ch5_github') {
      Analytics.trackInteraction(interactable.id);
      this.playTypingMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Late night coding dim
    if (interactable.id === 'ch5_3am' && !this.lateNightActive) {
      this.lateNightActive = true;
      const nightOverlay = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 3, GAME_HEIGHT * 3, 0x0a0820, 0
      ).setDepth(8).setAlpha(0);
      this.tweens.add({ targets: nightOverlay, alpha: 0.3, duration: 2000 });
    }

    if (interactable.id === 'ch5_first_dollar') {
      Analytics.trackInteraction(interactable.id);
      this.requiredDone = true;
      this.playPaymentCutscene();
      this.interactions.consume(interactable.id);

      // First client returns after payment (delayed)
      if (!this.clientReturned) {
        this.clientReturned = true;
        this.time.delayedCall(8000, () => {
          if (!this.scene.isActive()) return;
          const firstClient = this.npcs.find(n => n.id === 'ch5_first_client');
          if (firstClient) {
            // Client walks toward player
            const chapterDialogue = this.getChapterDialogue();
            const lines = chapterDialogue.npcs['ch5_client_returns'];
            if (lines) {
              firstClient.dialogue = lines;
              // Visual indicator
              const returnText = this.add.text(
                firstClient.sprite.x, firstClient.sprite.y - 40, '!',
                { fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40c040' }
              ).setOrigin(0.5).setDepth(15);
              this.tweens.add({
                targets: returnText,
                y: returnText.y - 8,
                duration: 600,
                yoyo: true,
                repeat: -1,
              });
            }
          }
        });
      }
      return;
    }
    if (interactable.id === 'ch5_doubt') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'What if this doesn\'t work?' },
        { speaker: 'JP\'s Mind', text: 'What if I\'m just a kid with a laptop pretending to be something?' },
        { speaker: 'JP\'s Mind', text: 'Everyone else went to school. Got degrees. Has experience.' },
        { speaker: 'JP\'s Mind', text: 'I taught myself everything from YouTube and ChatGPT.' },
        { speaker: 'Narrator', text: 'He stares at the screen. The cursor blinks.' },
        { speaker: 'JP\'s Mind', text: '...but the site works. The client paid. That\'s real.' },
        { speaker: 'JP\'s Mind', text: 'Keep going.' },
      ], () => {
        MoodSystem.changeMorale(5);
        this.frozen = false;
      });
      return;
    }

    if (interactable.id === 'ch5_pricing') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: 'JP\'s pricing sheet. Scribbled on a napkin.' },
        { speaker: 'Narrator', text: '"Website: $300. Logo: $50. Full brand: $500."' },
        { speaker: 'JP\'s Mind', text: 'I\'m charging nothing. But it\'s more than zero.' },
        { speaker: 'JP\'s Mind', text: 'Gotta start somewhere.' },
      ], () => { this.frozen = false; });
      return;
    }

    if (interactable.id === 'ch5_late_night') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'Narrator', text: '3:47 AM. Screen glowing in the dark.' },
        { speaker: 'Narrator', text: 'Red Bull can. Cold coffee. Stack of tutorials.' },
        { speaker: 'JP\'s Mind', text: 'Everyone\'s asleep. This is when the real work happens.' },
        { speaker: 'JP\'s Mind', text: 'Nobody sees this part. They only see the finished site.' },
        { speaker: 'Narrator', text: 'He keeps typing.' },
      ], () => {
        MoodSystem.setMood('locked_in', 60);
        this.frozen = false;
      });
      return;
    }

    // Rejection montage — wall of no's
    if (interactable.id === 'ch5_rejection' && !this.rejectionPlayed) {
      this.rejectionPlayed = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.playRejectionMontage();
      return;
    }

    // Bank account — fullscreen overlay
    if (interactable.id === 'ch5_bank_app' && !this.bankChecked) {
      this.bankChecked = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.playBankScene();
      return;
    }

    // Cold email — triggers time passing montage
    if (interactable.id === 'ch5_cold_email' && !this.timePassagePlayed) {
      this.timePassagePlayed = true;
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.playTimePassage();
      return;
    }

    // Fiverr — triggers Pops call after a delay
    if (interactable.id === 'ch5_fiverr' && !this.popsCallDone) {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Fiverr inbox. "Your gig has been removed for violating terms."' },
        { speaker: 'JP\'s Mind', text: 'They want me to charge $5 for a logo and then they ban me?' },
        { speaker: 'JP\'s Mind', text: 'Forget Fiverr. I\'ll find my own clients.' },
      ], () => {
        this.frozen = false;
        // Pops calls after a delay
        this.time.delayedCall(10000, () => {
          if (this.scene.isActive() && !this.popsCallDone) {
            this.triggerPopsCall();
          }
        });
      });
      return;
    }

    super.handleInteractable(interactable);
  }

  // ─── REJECTION MONTAGE ──────────────────────────────────────────
  private playRejectionMontage() {
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    objects.push(this.add.text(GAME_WIDTH / 2, 60, 'THE GRIND', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f04040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301));

    // Wall of rejections — flash one after another
    const rejections = [
      '"Not interested."',
      '"We went with someone else."',
      '"Our budget changed."',
      '"Can you do it for $50?"',
      '"We\'ll get back to you." (they never did)',
      '"My nephew can do it."',
      '"We need someone with more experience."',
      '"Sorry, who are you?"',
      '"Read 3:42 PM"',
      '"Not a good fit."',
      '"We found someone on Fiverr."',
    ];

    let delay = 500;
    for (let i = 0; i < rejections.length; i++) {
      this.time.delayedCall(delay, () => {
        const x = GAME_WIDTH / 2 + Phaser.Math.Between(-200, 200);
        const y = 120 + Phaser.Math.Between(0, 350);
        const size = i < 8 ? '9px' : '11px';
        const color = i < 6 ? '#cc4444' : i < 9 ? '#ff4444' : '#ff6666';

        const text = this.add.text(x, y, rejections[i], {
          fontFamily: '"Press Start 2P", monospace', fontSize: size, color,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(text);

        this.tweens.add({
          targets: text,
          alpha: 0.9,
          duration: 200,
        });

        // Camera shake gets worse
        this.cameras.main.shake(100, 0.002 + i * 0.001);
      });
      delay += 500 + i * 50; // gets faster
    }

    // After all rejections — JP's response
    this.time.delayedCall(delay + 800, () => {
      const response = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 'Next.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
      objects.push(response);

      this.tweens.add({
        targets: response,
        alpha: 1,
        duration: 600,
        hold: 1500,
        onComplete: () => {
          MoodSystem.changeMorale(-10);
          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }
          this.frozen = false;
        },
      });
    });
  }

  // ─── BANK ACCOUNT SCENE ───────────────────────────────────────────
  private playBankScene() {
    const objects: Phaser.GameObjects.GameObject[] = [];
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Phone overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300));

    // Phone body
    const phoneW = 280;
    const phoneH = 480;
    objects.push(this.add.rectangle(cx, cy, phoneW + 10, phoneH + 10, 0x1a1a1a)
      .setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, phoneW, phoneH, 0x0a1020)
      .setScrollFactor(0).setDepth(302));

    // Bank app header
    objects.push(this.add.rectangle(cx, cy - phoneH / 2 + 30, phoneW, 50, 0x1a3050)
      .setScrollFactor(0).setDepth(303));
    objects.push(this.add.text(cx, cy - phoneH / 2 + 30, 'CHECKING ACCOUNT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#80a0c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

    // Balance — big number
    const balanceText = this.add.text(cx, cy - 100, '$0.00', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
    objects.push(balanceText);

    // Count up to $127.43
    let bal = 0;
    const countUp = this.time.addEvent({
      delay: 30,
      repeat: 42,
      callback: () => {
        bal += 3.03;
        if (bal > 127.43) bal = 127.43;
        balanceText.setText(`$${bal.toFixed(2)}`);
      },
    });

    // Bills list
    const bills = [
      { name: 'Rent', amount: '$400.00', due: 'Due Friday' },
      { name: 'Phone', amount: '$85.00', due: 'Due 15th' },
      { name: 'Car Insurance', amount: '$120.00', due: 'Due 20th' },
      { name: 'Food', amount: '???', due: '' },
    ];

    let billY = cy - 20;
    this.time.delayedCall(1500, () => {
      objects.push(this.add.text(cx, billY - 20, 'UPCOMING', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f04040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

      for (let i = 0; i < bills.length; i++) {
        this.time.delayedCall(i * 400, () => {
          const b = bills[i];
          objects.push(this.add.text(cx - 100, billY + i * 35, b.name, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#cccccc',
          }).setScrollFactor(0).setDepth(304));
          objects.push(this.add.text(cx + 80, billY + i * 35, b.amount, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ff6060',
          }).setOrigin(1, 0).setScrollFactor(0).setDepth(304));
          if (b.due) {
            objects.push(this.add.text(cx + 80, billY + i * 35 + 14, b.due, {
              fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f0c040',
            }).setOrigin(1, 0).setScrollFactor(0).setDepth(304));
          }
        });
      }
    });

    // JP's reaction after all bills shown
    this.time.delayedCall(4000, () => {
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: '$127. Rent is $400. Due Friday.' },
        { speaker: 'JP\'s Mind', text: 'I need three clients this week or I\'m done.' },
        { speaker: 'Narrator', text: 'He closes the app. Opens his laptop instead.' },
      ], () => {
        MoodSystem.changeMorale(-15);
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    });
  }

  // ─── TIME PASSING MONTAGE ──────────────────────────────────────────
  private playTimePassage() {
    const objects: Phaser.GameObjects.GameObject[] = [];

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    this.tweens.add({ targets: overlay, alpha: 0.9, duration: 500 });

    const weeks = [
      { text: 'Week 1', sub: '47 cold emails. 2 replies. Both said no.' },
      { text: 'Week 2', sub: 'Built a portfolio site. 3 projects. One is his own.' },
      { text: 'Week 3', sub: 'No clients. Ramen again.' },
      { text: 'Week 4', sub: 'One lead. Met at a coffee shop. Ghosted.' },
      { text: 'Week 6', sub: 'Finally. First client. $300 for a website.' },
      { text: 'Week 8', sub: 'Second client. Word of mouth. $500.' },
    ];

    let delay = 800;
    for (let i = 0; i < weeks.length; i++) {
      this.time.delayedCall(delay, () => {
        const weekText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, weeks[i].text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '20px',
          color: i < 4 ? '#888888' : '#f0c040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(weekText);

        const subText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, weeks[i].sub, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px',
          color: i < 4 ? '#666666' : '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
        objects.push(subText);

        this.tweens.add({
          targets: [weekText, subText],
          alpha: 1,
          duration: 400,
          hold: 1200,
          yoyo: true,
        });
      });
      delay += 2000;
    }

    // End
    this.time.delayedCall(delay + 500, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Two months. Felt like two years.' },
        { speaker: 'JP\'s Mind', text: 'But the momentum is building. I can feel it.' },
      ], () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    });
  }

  // ─── POPS CALL (JP has to lie) ─────────────────────────────────────
  private triggerPopsCall() {
    if (this.popsCallDone) return;
    this.popsCallDone = true;
    this.frozen = true;

    // Phone ring
    this.cameras.main.shake(200, 0.003);

    this.dialogue.show([
      { speaker: 'Narrator', text: 'Phone rings. Pops.' },
      { speaker: 'Pops', text: 'Hey son. How\'s everything going?' },
      { speaker: 'JP', text: 'Good, Pops. Yeah. Everything\'s good.' },
      { speaker: 'Pops', text: 'You eating?' },
      { speaker: 'JP', text: 'Yeah. Three meals a day.' },
      { speaker: 'Narrator', text: 'That\'s a lie. It\'s ramen twice and coffee.' },
      { speaker: 'Pops', text: 'And the business stuff? The websites?' },
      { speaker: 'JP', text: 'Getting clients. Building momentum.' },
      { speaker: 'Narrator', text: 'That\'s half true. One client. Barely momentum.' },
      { speaker: 'Pops', text: 'Good. I\'m proud of you for trying. Most people don\'t even try.' },
      { speaker: 'JP', text: 'Thanks Pops.' },
      { speaker: 'Narrator', text: 'He hangs up. Stares at the wall.' },
      { speaker: 'JP\'s Mind', text: 'I can\'t let him down. I won\'t.' },
    ], () => {
      MoodSystem.changeMorale(10);
      this.frozen = false;
    });
  }

  private playTypingMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;

    const lines = [
      'npx create-next-app',
      'export default function',
      'className="flex gap-4"',
      'npm run build',
      'vercel --prod',
    ];
    let lineIndex = 0;
    let charIndex = 0;
    let totalCharsTyped = 0;
    const startTime = Date.now();

    // Streak tracking
    let streak = 0;

    const monoStyle = {
      fontFamily: '"Press Start 2P", monospace',
    };

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Terminal background
    const termW = GAME_WIDTH - 160;
    const termH = GAME_HEIGHT - 140;
    const terminal = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x0a0a1a)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x30c060);
    objects.push(terminal);

    // Title bar
    const titleBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, termW, 28, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301);
    objects.push(titleBar);
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, 'BUILD THE SITE', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(titleText);

    // --- Clock / Timer (top-left of terminal) ---
    const clockX = GAME_WIDTH / 2 - termW / 2 + 20;
    const clockY = GAME_HEIGHT / 2 - termH / 2 + 14;
    const clockText = this.add.text(clockX, clockY, '0:00', {
      ...monoStyle, fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(clockText);

    const clientWaitingText = this.add.text(clockX, clockY + 14, '', {
      ...monoStyle, fontSize: '6px', color: '#ff4444',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(clientWaitingText);

    const clockTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!active) return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        clockText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

        if (elapsed > 60) {
          clockText.setColor('#ff4444');
          clientWaitingText.setText('Client waiting...');
        } else if (elapsed > 30) {
          clockText.setColor('#f0c040');
          clientWaitingText.setText('');
        }
      },
    });

    // Progress bar background
    const barY = GAME_HEIGHT / 2 - termH / 2 + 44;
    const barW = termW - 60;
    const barBg = this.add.rectangle(GAME_WIDTH / 2, barY, barW, 12, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(1, 0x333355);
    objects.push(barBg);
    // Progress bar fill
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2, barY, 0, 12, 0x30c060)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(barFill);
    // Progress label
    const progressLabel = this.add.text(GAME_WIDTH / 2 + barW / 2 + 10, barY, '0%', {
      ...monoStyle, fontSize: '8px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(progressLabel);

    // WPM display
    const wpmText = this.add.text(GAME_WIDTH / 2 + termW / 2 - 30, GAME_HEIGHT / 2 - termH / 2 + 14, '0 WPM', {
      ...monoStyle, fontSize: '8px', color: '#aaaacc',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(wpmText);

    // --- Streak indicator (next to WPM) ---
    const streakText = this.add.text(GAME_WIDTH / 2 + termW / 2 - 30, GAME_HEIGHT / 2 - termH / 2 + 26, '', {
      ...monoStyle, fontSize: '7px', color: '#f0c040',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(streakText);

    // Line number + prompt
    const lineY = GAME_HEIGHT / 2 - 20;
    const promptX = GAME_WIDTH / 2 - termW / 2 + 40;

    const lineNumText = this.add.text(promptX - 20, lineY - 30, '1/5', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(lineNumText);

    // Target line (untyped chars in grey)
    const targetText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(targetText);

    // Typed text (green, overlaid on top)
    const typedText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(typedText);

    // Blinking cursor
    const cursor = this.add.text(promptX, lineY, '_', {
      ...monoStyle, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(303);
    objects.push(cursor);

    // Cursor blink
    const cursorBlink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        cursor.setAlpha(cursor.alpha === 1 ? 0 : 1);
      },
    });

    // Red flash overlay (for wrong keypress)
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0xff4444, 0)
      .setScrollFactor(0).setDepth(303);
    objects.push(flash);

    // Instruction text
    const instrText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + termH / 2 - 30, 'Type each line to build the site', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instrText);

    // "Line shipped!" text (hidden initially)
    const shippedText = this.add.text(GAME_WIDTH / 2, lineY + 40, '', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
    objects.push(shippedText);

    // Completed lines display area
    const completedTexts: Phaser.GameObjects.Text[] = [];
    const completedStartY = lineY - 80;

    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    const updateProgress = () => {
      let charsCompleted = 0;
      for (let i = 0; i < lineIndex; i++) charsCompleted += lines[i].length;
      charsCompleted += charIndex;
      const pct = Math.round((charsCompleted / totalChars) * 100);
      barFill.setDisplaySize(barW * (pct / 100), 12);
      progressLabel.setText(`${pct}%`);
    };

    const updateWPM = () => {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      if (elapsed <= 0) return 0;
      const words = totalCharsTyped / 5; // standard: 5 chars = 1 word
      const wpm = Math.round(words / elapsed);
      wpmText.setText(`${wpm} WPM`);
      return wpm;
    };

    const updateStreak = () => {
      if (streak >= 30) {
        streakText.setText('LOCKED IN');
        streakText.setColor('#ffffff');
      } else if (streak >= 10) {
        streakText.setText('x' + streak);
        streakText.setColor('#f0c040');
      } else {
        streakText.setText('');
      }

      // At 20+ streak, briefly glow the terminal border
      if (streak === 20 || streak === 25 || streak === 30) {
        terminal.setStrokeStyle(3, 0x60ff90);
        this.time.delayedCall(200, () => {
          if (terminal.active) terminal.setStrokeStyle(2, 0x30c060);
        });
      }
    };

    const loadLine = () => {
      if (lineIndex >= lines.length) {
        finishGame();
        return;
      }
      charIndex = 0;
      const line = lines[lineIndex];
      targetText.setText(line);
      typedText.setText('');
      cursor.setX(promptX);
      cursor.setAlpha(1);
      lineNumText.setText(`${lineIndex + 1}/5`);
      updateProgress();
    };

    const advanceLine = () => {
      // Show completed line in the history area
      const completedY = completedStartY + completedTexts.length * 18;
      const done = this.add.text(promptX, completedY, `> ${lines[lineIndex]}`, {
        ...monoStyle, fontSize: '8px', color: '#30c060',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301).setAlpha(0.5);
      objects.push(done);
      completedTexts.push(done);

      // Flash "Line shipped!"
      shippedText.setText('Line shipped!');
      shippedText.setAlpha(1);
      this.tweens.add({
        targets: shippedText,
        alpha: 0,
        duration: 800,
        delay: 400,
      });

      // Flash terminal border green
      terminal.setStrokeStyle(3, 0x30c060);
      this.time.delayedCall(300, () => {
        terminal.setStrokeStyle(2, 0x30c060);
      });

      lineIndex++;
      this.time.delayedCall(600, () => {
        loadLine();
      });
    };

    // --- Confetti particle helper ---
    const spawnConfetti = () => {
      const confettiColors = [0x30c060, 0xf0c040, 0xffffff, 0x60ff90, 0xffdd00];
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2 - 20;
      for (let i = 0; i < 14; i++) {
        const color = confettiColors[i % confettiColors.length];
        const w = 4 + Math.random() * 6;
        const h = 3 + Math.random() * 5;
        const particle = this.add.rectangle(cx, cy, w, h, color)
          .setScrollFactor(0).setDepth(310).setAlpha(1);
        objects.push(particle);

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const speed = 120 + Math.random() * 180;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Animate: burst up then fall with gravity
        this.tweens.add({
          targets: particle,
          x: cx + vx * 0.8,
          y: cy + vy * 0.4,
          duration: 400,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Gravity fall
            this.tweens.add({
              targets: particle,
              y: GAME_HEIGHT + 20,
              x: cx + vx * 1.2,
              alpha: 0,
              duration: 800 + Math.random() * 400,
              ease: 'Quad.easeIn',
              onComplete: () => {
                particle.destroy();
              },
            });
          },
        });

        // Rotate effect via scale flip
        this.tweens.add({
          targets: particle,
          scaleX: -1,
          duration: 150 + Math.random() * 200,
          yoyo: true,
          repeat: 5,
        });
      }
    };

    const finishGame = () => {
      active = false;
      clockTimer.destroy();
      cursorBlink.destroy();
      this.input.keyboard!.off('keydown', keyHandler);
      this.input.off('pointerdown', pointerListener);

      const elapsed = (Date.now() - startTime) / 1000;
      const minutes = elapsed / 60;
      const words = totalCharsTyped / 5;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

      // Clear typing area
      targetText.setText('');
      typedText.setText('');
      cursor.setAlpha(0);
      lineNumText.setText('');
      instrText.setText('');
      streakText.setText('');
      clientWaitingText.setText('');
      clockText.setText('');

      // --- "SHIPPED!" celebration ---

      // Flash terminal green
      const greenFlash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x30c060, 0.4)
        .setScrollFactor(0).setDepth(305);
      objects.push(greenFlash);
      this.tweens.add({
        targets: greenFlash,
        alpha: 0,
        duration: 400,
      });

      // Confetti burst
      spawnConfetti();

      // "DEPLOYED!" text slam
      const deployedText = this.add.text(GAME_WIDTH / 2, lineY - 50, 'DEPLOYED!', {
        ...monoStyle, fontSize: '28px', color: '#30c060',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(306).setScale(2.5);
      objects.push(deployedText);

      this.tweens.add({
        targets: deployedText,
        scale: 1,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          // After slam, show results
          this.time.delayedCall(600, () => {
            deployedText.setFontSize(14);
            deployedText.setY(lineY - 60);

            // Show results
            titleText.setText('SITE DEPLOYED!');
            titleText.setColor('#30c060');

            const timeStr = elapsed < 60
              ? `${elapsed.toFixed(1)}s`
              : `${Math.floor(elapsed / 60)}m ${Math.round(elapsed % 60)}s`;

            const resultText = this.add.text(GAME_WIDTH / 2, lineY - 10, `${wpm} WPM  //  ${timeStr}`, {
              ...monoStyle, fontSize: '16px', color: '#ffffff',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
            objects.push(resultText);

            const flavor = wpm >= 60
              ? 'Senior dev energy.'
              : wpm >= 40
              ? 'JP ships fast.'
              : wpm >= 20
              ? "Still learning. But it's live."
              : 'Slow and steady. The site works.';

            const flavorText = this.add.text(GAME_WIDTH / 2, lineY + 30, flavor, {
              ...monoStyle, fontSize: '10px', color: '#aaaacc',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
            objects.push(flavorText);

            // Fill progress to 100%
            barFill.setDisplaySize(barW, 12);
            progressLabel.setText('100%');
            wpmText.setText(`${wpm} WPM`);

            // After results display, cleanup and show post-game dialogue
            this.time.delayedCall(3000, () => {
              for (const obj of objects) {
                if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
              }
              this.frozen = false;

              // Post-game dialogue based on WPM
              let postDialogue: DialogueLine[];
              if (wpm >= 60) {
                postDialogue = [{ speaker: 'Narrator', text: "JP's fingers moved like they always knew how." }];
              } else if (wpm >= 40) {
                postDialogue = [{ speaker: 'Narrator', text: "Not fast. But it works. And it's live." }];
              } else {
                postDialogue = [{ speaker: 'Narrator', text: "Slow. But he shipped it. That's what matters." }];
              }

              this.frozen = true;
              this.dialogue.show(postDialogue, () => {
                this.frozen = false;
              });
            });
          });
        },
      });
    };

    const handleCorrectChar = () => {
      const line = lines[lineIndex];
      typedText.setText(line.substring(0, charIndex + 1));
      charIndex++;
      totalCharsTyped++;
      streak++;

      // Move cursor
      // Approximate character width for "Press Start 2P" at 14px
      cursor.setX(promptX + charIndex * 12.5);
      cursor.setAlpha(1);

      updateProgress();
      updateWPM();
      updateStreak();

      // Check if line complete
      if (charIndex >= line.length) {
        advanceLine();
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (!active || lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const expected = line[charIndex];

      // Only handle single printable characters and space
      if (event.key.length !== 1) return;

      if (event.key === expected) {
        handleCorrectChar();

        // Green pulse on cursor
        this.tweens.add({
          targets: cursor,
          scaleY: 1.3,
          duration: 60,
          yoyo: true,
        });
      } else {
        // Wrong key — reset streak, red flash, don't advance
        streak = 0;
        updateStreak();

        flash.setFillStyle(0xff4444, 0.2);
        flash.setAlpha(1);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
        });

        // Shake the target text
        const origX = targetText.x;
        this.tweens.add({
          targets: [targetText, typedText],
          x: origX + 4,
          duration: 40,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            targetText.setX(origX);
            typedText.setX(origX);
          },
        });
      }
    };

    // Touch support — auto-complete current character
    const pointerListener = () => {
      if (!active || lineIndex >= lines.length) return;
      handleCorrectChar();
    };

    this.input.keyboard!.on('keydown', keyHandler);
    this.input.on('pointerdown', pointerListener);

    // Start first line
    loadLine();
  }

  private playPaymentCutscene() {
    this.frozen = true;

    // --- Phone vibration (camera shake before anything appears) ---
    this.cameras.main.shake(100, 0.003);

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(100).setAlpha(0);

    // Payment notification box
    const boxW = 280;
    const boxH = 140;
    const boxX = GAME_WIDTH / 2;
    const boxY = GAME_HEIGHT / 2;

    const box = this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e)
      .setScrollFactor(0).setDepth(101).setAlpha(0).setStrokeStyle(2, 0x30c060);

    // "Payment Received" label
    const label = this.add.text(boxX, boxY - 35, 'Payment Received', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Amount text (will count up)
    const amountText = this.add.text(boxX, boxY + 10, '$0.00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Fade in overlay and box (after shake)
    this.time.delayedCall(120, () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0.6,
        duration: 300,
      });
      this.tweens.add({
        targets: [box, label, amountText],
        alpha: 1,
        duration: 400,
        delay: 200,
        onComplete: () => {
          // Count up from $0 to $300
          let currentAmount = 0;
          const targetAmount = 300;
          const countDuration = 1200; // ms
          const steps = 30;
          const stepDelay = countDuration / steps;
          const increment = targetAmount / steps;

          const counter = this.time.addEvent({
            delay: stepDelay,
            repeat: steps - 1,
            callback: () => {
              currentAmount += increment;
              if (currentAmount > targetAmount) currentAmount = targetAmount;
              amountText.setText('$' + currentAmount.toFixed(2));
            },
          });

          // After counting finishes, show the thought
          this.time.delayedCall(countDuration + 200, () => {
            const thought = this.add.text(boxX, boxY + 45, 'First real dollar from\nsomething I BUILT.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '9px',
              color: '#f0c040',
              align: 'center',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

            this.tweens.add({
              targets: thought,
              alpha: 1,
              duration: 400,
            });

            // --- Emotional beat: escalating amounts ---
            this.time.delayedCall(1200, () => {
              // Fade out the thought text first
              this.tweens.add({
                targets: thought,
                alpha: 0,
                duration: 300,
              });

              // Resize box to fit escalation
              this.tweens.add({
                targets: box,
                displayHeight: 220,
                duration: 300,
              });

              const escalationAmounts = ['$300.', '$500.', '$900.', '$1,000.'];
              const escalationSizes = ['10px', '12px', '14px', '16px'];
              const escalationColors = ['#888888', '#bbbbbb', '#f0c040', '#ffffff'];
              const escalationObjects: Phaser.GameObjects.Text[] = [];
              const baseY = boxY - 10;

              escalationAmounts.forEach((amount, i) => {
                this.time.delayedCall(600 * i, () => {
                  // Hide the original amount text when escalation starts
                  if (i === 0) {
                    amountText.setAlpha(0);
                  }

                  const escalText = this.add.text(boxX, baseY + i * 28, amount, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: escalationSizes[i],
                    color: escalationColors[i],
                  }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);
                  escalationObjects.push(escalText);

                  this.tweens.add({
                    targets: escalText,
                    alpha: 1,
                    duration: 300,
                  });
                });
              });

              // Hold final display for 2 seconds, then fade everything out
              const totalEscalationTime = 600 * escalationAmounts.length;
              this.time.delayedCall(totalEscalationTime + 2000, () => {
                const allObjects = [overlay, box, label, amountText, thought, ...escalationObjects];
                this.tweens.add({
                  targets: allObjects,
                  alpha: 0,
                  duration: 400,
                  onComplete: () => {
                    allObjects.forEach((obj) => {
                      if (obj && obj.active) obj.destroy();
                    });
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
}
