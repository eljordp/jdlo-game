import { GAME_WIDTH, GAME_HEIGHT, FONT_STYLE, SPEAKER_FONT_STYLE } from '../config';
import { SoundEffects } from './SoundEffects';

export interface DialogueChoice {
  text: string;
  next?: DialogueLine[];
}

export interface DialogueLine {
  speaker?: string;
  text: string;
  choices?: DialogueChoice[];
}

export class DialogueSystem {
  private static blipCtx: AudioContext | null = null;
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private boxImage: Phaser.GameObjects.Image;
  private textObject: Phaser.GameObjects.Text;
  private speakerLabel: Phaser.GameObjects.Text;
  private arrow: Phaser.GameObjects.Image;
  private arrowTween: Phaser.Tweens.Tween | null = null;

  private lines: DialogueLine[] = [];
  private currentLineIndex = 0;
  private currentCharIndex = 0;
  private fullCurrentText = '';
  private displayedText = '';
  private charTimer = 0;
  private charDelay = 30; // ms per character
  private isTyping = false;
  private active = false;
  private onComplete: (() => void) | null = null;

  private inputCooldown = 0;
  private readonly COOLDOWN_MS = 200;

  // Choice system
  private choiceMode = false;
  private choices: DialogueChoice[] = [];
  private selectedChoice = 0;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private choiceCursor: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Build the UI — all positioned relative to container
    const boxY = GAME_HEIGHT - 150;

    this.container = scene.add.container(0, boxY);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0);

    // Dialogue box background
    this.boxImage = scene.add.image(GAME_WIDTH / 2, 75, 'dialogue-box');
    this.boxImage.setScrollFactor(0);
    this.container.add(this.boxImage);

    // Speaker name
    this.speakerLabel = scene.add.text(30, 8, '', SPEAKER_FONT_STYLE);
    this.speakerLabel.setScrollFactor(0);
    this.container.add(this.speakerLabel);

    // Main text
    this.textObject = scene.add.text(30, 35, '', FONT_STYLE);
    this.textObject.setScrollFactor(0);
    this.container.add(this.textObject);

    // Continue arrow
    this.arrow = scene.add.image(GAME_WIDTH - 30, 130, 'arrow-down');
    this.arrow.setScale(2);
    this.arrow.setScrollFactor(0);
    this.arrow.setVisible(false);
    this.container.add(this.arrow);

    // Hide everything initially
    this.container.setVisible(false);

    // No internal input handling — the scene controls when advance() is called.
    // This prevents double-firing when the scene also listens for Space/Enter.
  }

  show(lines: DialogueLine[], onComplete?: () => void): void {
    if (lines.length === 0) return;

    this.lines = lines;
    this.currentLineIndex = 0;
    this.onComplete = onComplete || null;
    this.active = true;
    this.inputCooldown = this.scene.time.now + this.COOLDOWN_MS;
    this.container.setVisible(true);
    this.arrow.setVisible(false);
    this.clearChoiceUI();

    this.startLine(0);
  }

  private startLine(index: number): void {
    const line = this.lines[index];
    if (!line) return;

    this.fullCurrentText = line.text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.charTimer = 0;
    this.isTyping = true;
    this.choiceMode = false;
    this.clearChoiceUI();

    // Speaker name
    if (line.speaker) {
      this.speakerLabel.setText(line.speaker);
      this.speakerLabel.setVisible(true);
    } else {
      this.speakerLabel.setText('');
      this.speakerLabel.setVisible(false);
    }

    this.textObject.setText('');
    this.arrow.setVisible(false);

    // Stop existing arrow tween
    if (this.arrowTween) {
      this.arrowTween.stop();
      this.arrowTween = null;
    }
  }

  private finishTyping(): void {
    this.displayedText = this.fullCurrentText;
    this.textObject.setText(this.displayedText);
    this.isTyping = false;

    const line = this.lines[this.currentLineIndex];
    if (line && line.choices && line.choices.length > 0) {
      this.enterChoiceMode(line.choices);
    } else {
      this.showArrow();
    }
  }

  private enterChoiceMode(choices: DialogueChoice[]): void {
    this.choiceMode = true;
    this.choices = choices;
    this.selectedChoice = 0;

    // Calculate choice positioning — below the main text, inside the dialogue box
    const startY = 80;
    const choiceSpacing = 22;

    // Choice cursor (Pokemon-style triangle)
    this.choiceCursor = this.scene.add.text(40, startY, '\u25b6', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setScrollFactor(0);
    this.container.add(this.choiceCursor);

    for (let i = 0; i < choices.length; i++) {
      const y = startY + i * choiceSpacing;
      const isSelected = i === this.selectedChoice;
      const choiceText = this.scene.add.text(60, y, choices[i].text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: isSelected ? '#f0c040' : '#888888',
        wordWrap: { width: 1100, useAdvancedWrap: true },
      }).setScrollFactor(0);
      this.choiceTexts.push(choiceText);
      this.container.add(choiceText);
    }

    this.updateChoiceHighlight();

    // Listen for arrow keys to navigate choices
    this.scene.input.keyboard!.on('keydown-UP', this.choiceUp, this);
    this.scene.input.keyboard!.on('keydown-DOWN', this.choiceDown, this);
    this.scene.input.keyboard!.on('keydown-W', this.choiceUp, this);
    this.scene.input.keyboard!.on('keydown-S', this.choiceDown, this);
  }

  private choiceUp = (): void => {
    if (!this.choiceMode) return;
    this.selectedChoice = (this.selectedChoice - 1 + this.choices.length) % this.choices.length;
    this.updateChoiceHighlight();
  };

  private choiceDown = (): void => {
    if (!this.choiceMode) return;
    this.selectedChoice = (this.selectedChoice + 1) % this.choices.length;
    this.updateChoiceHighlight();
  };

  private updateChoiceHighlight(): void {
    const startY = 80;
    const choiceSpacing = 22;

    for (let i = 0; i < this.choiceTexts.length; i++) {
      const isSelected = i === this.selectedChoice;
      this.choiceTexts[i].setColor(isSelected ? '#f0c040' : '#888888');
    }

    if (this.choiceCursor) {
      this.choiceCursor.setY(startY + this.selectedChoice * choiceSpacing);
    }
  }

  private confirmChoice(): void {
    const chosen = this.choices[this.selectedChoice];
    this.clearChoiceUI();
    this.choiceMode = false;

    // Remove key listeners
    this.scene.input.keyboard!.off('keydown-UP', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-DOWN', this.choiceDown, this);
    this.scene.input.keyboard!.off('keydown-W', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-S', this.choiceDown, this);

    if (chosen.next && chosen.next.length > 0) {
      // Splice the choice's follow-up lines into the dialogue right after current line
      const remaining = this.lines.slice(this.currentLineIndex + 1);
      this.lines = [
        ...this.lines.slice(0, this.currentLineIndex + 1),
        ...chosen.next,
        ...remaining,
      ];
    }

    // Advance to next line
    this.currentLineIndex++;
    if (this.currentLineIndex >= this.lines.length) {
      this.hide();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    this.startLine(this.currentLineIndex);
  }

  private clearChoiceUI(): void {
    for (const t of this.choiceTexts) {
      t.destroy();
    }
    this.choiceTexts = [];
    if (this.choiceCursor) {
      this.choiceCursor.destroy();
      this.choiceCursor = null;
    }
    this.choices = [];
    this.selectedChoice = 0;
  }

  advance(): void {
    if (!this.active) return;
    if (this.scene.time.now < this.inputCooldown) return;

    this.inputCooldown = this.scene.time.now + this.COOLDOWN_MS;

    // If in choice mode, confirm the selection
    if (this.choiceMode) {
      this.confirmChoice();
      return;
    }

    if (this.isTyping) {
      // Complete the current line instantly
      this.finishTyping();
      return;
    }

    // Advance to next line
    SoundEffects.playDialogueClick();
    this.currentLineIndex++;
    if (this.currentLineIndex >= this.lines.length) {
      // Dialogue complete
      this.hide();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    this.startLine(this.currentLineIndex);
  }

  /** Handle mobile choice navigation — called from scene for virtual D-pad */
  choiceNavigate(direction: 'up' | 'down'): void {
    if (!this.choiceMode) return;
    if (direction === 'up') this.choiceUp();
    else this.choiceDown();
  }

  isInChoiceMode(): boolean {
    return this.choiceMode;
  }

  private showArrow(): void {
    this.arrow.setVisible(true);
    this.arrow.setY(130);
    this.arrowTween = this.scene.tweens.add({
      targets: this.arrow,
      y: 136,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hide(): void {
    this.active = false;
    this.container.setVisible(false);
    this.clearChoiceUI();

    // Clean up key listeners just in case
    this.scene.input.keyboard!.off('keydown-UP', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-DOWN', this.choiceDown, this);
    this.scene.input.keyboard!.off('keydown-W', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-S', this.choiceDown, this);

    if (this.arrowTween) {
      this.arrowTween.stop();
      this.arrowTween = null;
    }
  }

  update(time: number, delta: number): void {
    if (!this.active || !this.isTyping) return;

    this.charTimer += delta;

    while (this.charTimer >= this.charDelay && this.currentCharIndex < this.fullCurrentText.length) {
      this.charTimer -= this.charDelay;
      this.currentCharIndex++;
      this.displayedText = this.fullCurrentText.substring(0, this.currentCharIndex);
      this.textObject.setText(this.displayedText);

      // Dialogue blip — play on every 2nd non-space character
      const ch = this.fullCurrentText[this.currentCharIndex - 1];
      if (ch && ch !== ' ' && this.currentCharIndex % 2 === 0) {
        this.playBlip();
      }
    }

    if (this.currentCharIndex >= this.fullCurrentText.length) {
      this.isTyping = false;

      // Check if this line has choices
      const line = this.lines[this.currentLineIndex];
      if (line && line.choices && line.choices.length > 0) {
        this.enterChoiceMode(line.choices);
      } else {
        this.showArrow();
      }
    }
  }

  /** Per-character blip — pitch varies by speaker for personality */
  private playBlip(): void {
    const line = this.lines[this.currentLineIndex];
    const speaker = line?.speaker || '';

    // Base frequency per speaker type
    let baseFreq: number;
    if (speaker === 'Narrator') {
      baseFreq = 180; // low, calm
    } else if (speaker.includes('JP') || speaker === 'Jordan') {
      baseFreq = 280; // mid, natural
    } else if (speaker.includes('Girl') || speaker === 'K' || speaker === 'Mom' || speaker === 'Sister') {
      baseFreq = 400; // higher, feminine
    } else {
      baseFreq = 240; // default — other NPCs
    }

    // Slight random variation per character (+/- 20hz) for organic feel
    const freq = baseFreq + (Math.random() - 0.5) * 40;

    // Reuse SoundEffects' AudioContext pattern
    try {
      if (!DialogueSystem.blipCtx) DialogueSystem.blipCtx = new AudioContext();
      const ctx = DialogueSystem.blipCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio not available
    }
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    this.clearChoiceUI();
    this.scene.input.keyboard!.off('keydown-UP', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-DOWN', this.choiceDown, this);
    this.scene.input.keyboard!.off('keydown-W', this.choiceUp, this);
    this.scene.input.keyboard!.off('keydown-S', this.choiceDown, this);
    if (this.arrowTween) {
      this.arrowTween.stop();
    }
    this.container.destroy();
  }
}
