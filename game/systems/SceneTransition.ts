import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export type TransitionType = 'fade' | 'wipe';

export class SceneTransition {
  /**
   * Fade to black, switch scene, fade in.
   */
  static fadeToScene(
    currentScene: Phaser.Scene,
    targetSceneKey: string,
    data?: Record<string, unknown>,
    duration = 500
  ): void {
    const cam = currentScene.cameras.main;

    // Fade out
    cam.fadeOut(duration, 0, 0, 0);

    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      currentScene.scene.start(targetSceneKey, data);
    });
  }

  /**
   * Pokemon-style wipe: black bars close in from top/bottom (or left/right),
   * then open in the new scene.
   */
  static wipeToScene(
    currentScene: Phaser.Scene,
    targetSceneKey: string,
    data?: Record<string, unknown>,
    duration = 600,
    direction: 'vertical' | 'horizontal' = 'vertical'
  ): void {
    const halfDuration = duration / 2;

    if (direction === 'vertical') {
      // Two black bars: top and bottom, closing in
      const topBar = currentScene.add.rectangle(
        GAME_WIDTH / 2,
        -GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      topBar.setDepth(2000);
      topBar.setScrollFactor(0);

      const bottomBar = currentScene.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT + GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      bottomBar.setDepth(2000);
      bottomBar.setScrollFactor(0);

      // Close bars
      currentScene.tweens.add({
        targets: topBar,
        y: GAME_HEIGHT / 4,
        duration: halfDuration,
        ease: 'Quad.easeIn',
      });

      currentScene.tweens.add({
        targets: bottomBar,
        y: GAME_HEIGHT - GAME_HEIGHT / 4,
        duration: halfDuration,
        ease: 'Quad.easeIn',
        onComplete: () => {
          currentScene.scene.start(targetSceneKey, data);
        },
      });
    } else {
      // Horizontal bars: left and right
      const leftBar = currentScene.add.rectangle(
        -GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      leftBar.setDepth(2000);
      leftBar.setScrollFactor(0);

      const rightBar = currentScene.add.rectangle(
        GAME_WIDTH + GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      rightBar.setDepth(2000);
      rightBar.setScrollFactor(0);

      currentScene.tweens.add({
        targets: leftBar,
        x: GAME_WIDTH / 4,
        duration: halfDuration,
        ease: 'Quad.easeIn',
      });

      currentScene.tweens.add({
        targets: rightBar,
        x: GAME_WIDTH - GAME_WIDTH / 4,
        duration: halfDuration,
        ease: 'Quad.easeIn',
        onComplete: () => {
          currentScene.scene.start(targetSceneKey, data);
        },
      });
    }
  }

  /**
   * Call this at the START of a new scene's create() to fade in from black.
   */
  static fadeIn(scene: Phaser.Scene, duration = 500): void {
    scene.cameras.main.fadeIn(duration, 0, 0, 0);
  }

  /**
   * Call this at the START of a new scene's create() to open wipe bars.
   */
  static wipeIn(
    scene: Phaser.Scene,
    duration = 600,
    direction: 'vertical' | 'horizontal' = 'vertical'
  ): void {
    const halfDuration = duration / 2;

    if (direction === 'vertical') {
      const topBar = scene.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 4,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      topBar.setDepth(2000);
      topBar.setScrollFactor(0);

      const bottomBar = scene.add.rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT - GAME_HEIGHT / 4,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      bottomBar.setDepth(2000);
      bottomBar.setScrollFactor(0);

      scene.tweens.add({
        targets: topBar,
        y: -GAME_HEIGHT / 2,
        duration: halfDuration,
        ease: 'Quad.easeOut',
        onComplete: () => topBar.destroy(),
      });

      scene.tweens.add({
        targets: bottomBar,
        y: GAME_HEIGHT + GAME_HEIGHT / 2,
        duration: halfDuration,
        ease: 'Quad.easeOut',
        onComplete: () => bottomBar.destroy(),
      });
    } else {
      const leftBar = scene.add.rectangle(
        GAME_WIDTH / 4,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      leftBar.setDepth(2000);
      leftBar.setScrollFactor(0);

      const rightBar = scene.add.rectangle(
        GAME_WIDTH - GAME_WIDTH / 4,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000
      );
      rightBar.setDepth(2000);
      rightBar.setScrollFactor(0);

      scene.tweens.add({
        targets: leftBar,
        x: -GAME_WIDTH / 2,
        duration: halfDuration,
        ease: 'Quad.easeOut',
        onComplete: () => leftBar.destroy(),
      });

      scene.tweens.add({
        targets: rightBar,
        x: GAME_WIDTH + GAME_WIDTH / 2,
        duration: halfDuration,
        ease: 'Quad.easeOut',
        onComplete: () => rightBar.destroy(),
      });
    }
  }
}
