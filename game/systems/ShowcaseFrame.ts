import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export interface ShowcaseData {
  title: string;
  description: string;
  revenue: string; // e.g. "$5,000"
}

export class ShowcaseFrame {
  static show(
    scene: Phaser.Scene,
    data: { title: string; description: string; revenue: string },
    onClose: () => void
  ): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const frameW = 560;
    const frameH = 340;

    const container = scene.add.container(centerX, centerY);
    container.setScrollFactor(0);
    container.setDepth(1500);
    container.setAlpha(0);

    // Dim background overlay
    const dimBg = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    container.add(dimBg);

    // Outer frame border (like a monitor bezel)
    const outerBorder = scene.add.rectangle(0, 0, frameW + 8, frameH + 8, 0x606080);
    container.add(outerBorder);

    // Inner frame background
    const innerBg = scene.add.rectangle(0, 0, frameW, frameH, 0x1a1a2e);
    container.add(innerBg);

    // Top decorative bar (like a title bar)
    const titleBar = scene.add.rectangle(0, -frameH / 2 + 20, frameW, 40, 0x2a2a4e);
    container.add(titleBar);

    // Corner accents
    const accentSize = 12;
    const corners = [
      [-frameW / 2, -frameH / 2],
      [frameW / 2, -frameH / 2],
      [-frameW / 2, frameH / 2],
      [frameW / 2, frameH / 2],
    ];
    for (const [cx, cy] of corners) {
      const accent = scene.add.rectangle(cx, cy, accentSize, accentSize, 0xf0c040);
      container.add(accent);
    }

    // Title text (yellow, in the title bar area)
    const titleText = scene.add.text(0, -frameH / 2 + 20, data.title.toUpperCase(), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
      align: 'center',
    });
    titleText.setOrigin(0.5);
    container.add(titleText);

    // Description text
    const descText = scene.add.text(0, -30, data.description, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: frameW - 80, useAdvancedWrap: true },
      lineSpacing: 6,
    });
    descText.setOrigin(0.5);
    container.add(descText);

    // Revenue label
    const revenueLabel = scene.add.text(0, 50, 'REVENUE EARNED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#8888aa',
      align: 'center',
    });
    revenueLabel.setOrigin(0.5);
    container.add(revenueLabel);

    // Revenue number (starts at $0, counts up)
    const revenueText = scene.add.text(0, 80, '$0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#50e050',
      align: 'center',
    });
    revenueText.setOrigin(0.5);
    container.add(revenueText);

    // "Press SPACE to continue" prompt
    const prompt = scene.add.text(0, frameH / 2 - 30, 'PRESS SPACE TO CONTINUE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#888888',
      align: 'center',
    });
    prompt.setOrigin(0.5);
    prompt.setAlpha(0);
    container.add(prompt);

    // Fade in the frame
    scene.tweens.add({
      targets: container,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    // Parse revenue target (strip $ and commas)
    const targetAmount = parseInt(data.revenue.replace(/[$,]/g, ''), 10) || 0;
    const countDuration = 1500; // ms to count up
    let countElapsed = 0;
    let counting = true;
    let canClose = false;

    // Count-up timer
    const countTimer = scene.time.addEvent({
      delay: 16, // ~60fps
      repeat: Math.ceil(countDuration / 16),
      callback: () => {
        countElapsed += 16;
        const progress = Math.min(countElapsed / countDuration, 1);
        // Ease-out curve for satisfying deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * targetAmount);
        revenueText.setText('$' + current.toLocaleString());

        if (progress >= 1) {
          revenueText.setText(data.revenue);
          counting = false;
          canClose = true;

          // Show the prompt with a blink
          prompt.setAlpha(1);
          scene.tweens.add({
            targets: prompt,
            alpha: 0.4,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }
      },
    });

    // Listen for Space to close
    const spaceKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    const closeHandler = () => {
      if (!canClose) {
        // Skip to end of counting
        countTimer.remove();
        revenueText.setText(data.revenue);
        counting = false;
        canClose = true;

        prompt.setAlpha(1);
        scene.tweens.add({
          targets: prompt,
          alpha: 0.4,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        return;
      }

      // Actually close
      spaceKey.off('down', closeHandler);
      scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          container.destroy();
          onClose();
        },
      });
    };

    spaceKey.on('down', closeHandler);
  }
}
