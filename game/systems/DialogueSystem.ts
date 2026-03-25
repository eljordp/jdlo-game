import { GAME_WIDTH, GAME_HEIGHT, FONT_STYLE, SPEAKER_FONT_STYLE } from '../config';

export interface DialogueLine {
  speaker?: string;
  text: string;
}

export class DialogueSystem {
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

  advance(): void {
    if (!this.active) return;
    if (this.scene.time.now < this.inputCooldown) return;

    this.inputCooldown = this.scene.time.now + this.COOLDOWN_MS;

    if (this.isTyping) {
      // Complete the current line instantly
      this.displayedText = this.fullCurrentText;
      this.textObject.setText(this.displayedText);
      this.isTyping = false;
      this.showArrow();
      return;
    }

    // Advance to next line
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
    }

    if (this.currentCharIndex >= this.fullCurrentText.length) {
      this.isTyping = false;
      this.showArrow();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    if (this.arrowTween) {
      this.arrowTween.stop();
    }
    this.container.destroy();
  }
}
