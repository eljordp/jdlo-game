import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class EvolutionAnimation {
  static play(
    scene: Phaser.Scene,
    stages: string[],
    onComplete: () => void
  ): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Full-screen white overlay, starts transparent
    const overlay = scene.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0);
    overlay.setScrollFactor(0);
    overlay.setDepth(2000);

    // Flash rectangle for between-stage pulses
    const flash = scene.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0);
    flash.setScrollFactor(0);
    flash.setDepth(2001);

    // Stage name text (hidden initially)
    const stageText = scene.add.text(centerX, centerY, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#000000',
      align: 'center',
    });
    stageText.setOrigin(0.5);
    stageText.setScrollFactor(0);
    stageText.setDepth(2002);
    stageText.setAlpha(0);

    // Step 1: Fade screen to white
    scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        showStage(0);
      },
    });

    function showStage(index: number): void {
      if (index >= stages.length) {
        // All stages done — big final flash then LEVEL UP
        finalSequence();
        return;
      }

      const stageName = stages[index];
      const progress = index / (stages.length - 1); // 0 to 1

      // Text gets progressively larger and bolder
      const baseFontSize = 18;
      const fontSize = baseFontSize + Math.floor(progress * 16); // 18px → 34px
      stageText.setFontSize(fontSize);
      stageText.setText(stageName);
      stageText.setAlpha(0);
      stageText.setScale(0.5 + progress * 0.5);

      // Fade in the stage name
      scene.tweens.add({
        targets: stageText,
        alpha: 1,
        scale: 1 + progress * 0.3,
        duration: 400,
        ease: 'Back.easeOut',
      });

      // After 1.5 seconds, flash and transition to next
      scene.time.delayedCall(1500, () => {
        // Flash between stages
        flash.setAlpha(1);
        scene.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 300,
          ease: 'Power2',
        });

        // Fade out current stage text
        scene.tweens.add({
          targets: stageText,
          alpha: 0,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            showStage(index + 1);
          },
        });
      });
    }

    function finalSequence(): void {
      // Big triple flash
      let flashCount = 0;
      const flashInterval = scene.time.addEvent({
        delay: 150,
        repeat: 2,
        callback: () => {
          flash.setAlpha(1);
          scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 120,
            ease: 'Power3',
          });
          flashCount++;
        },
      });

      scene.time.delayedCall(600, () => {
        // Show LEVEL UP
        stageText.setText('LEVEL UP');
        stageText.setFontSize(36);
        stageText.setColor('#f0c040');
        stageText.setAlpha(0);
        stageText.setScale(0.3);

        // Add a shadow/stroke for emphasis
        stageText.setStroke('#000000', 6);

        scene.tweens.add({
          targets: stageText,
          alpha: 1,
          scale: 1.2,
          duration: 500,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Hold for a moment, then settle
            scene.tweens.add({
              targets: stageText,
              scale: 1.0,
              duration: 300,
              ease: 'Sine.easeInOut',
            });
          },
        });

        // After showing LEVEL UP, fade everything out
        scene.time.delayedCall(2000, () => {
          scene.tweens.add({
            targets: [overlay, stageText],
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
              // Cleanup
              overlay.destroy();
              flash.destroy();
              stageText.destroy();
              onComplete();
            },
          });
        });
      });
    }
  }
}
