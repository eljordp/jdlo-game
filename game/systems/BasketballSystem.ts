import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SoundEffects } from './SoundEffects';

// Driveway 1v1 vs Pops — first to 5.
// Offense: stop the swing bar in the sweet spot to shoot.
// Defense: hit SPACE on the "!" to block, jump early and he scores easy.
export class BasketballSystem {
  static play(scene: Phaser.Scene, playerTexture: string, onDone: (won: boolean) => void) {
    const objects: Phaser.GameObjects.GameObject[] = [];
    const FIRST_TO = 5;
    let jpScore = 0;
    let popsScore = 0;
    let over = false;
    let possessionActive = false;

    const cx = GAME_WIDTH / 2;
    const groundY = GAME_HEIGHT / 2 + 130;

    // Court
    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300));
    objects.push(scene.add.rectangle(cx, groundY + 40, GAME_WIDTH - 160, 100, 0x2a2a2e)
      .setScrollFactor(0).setDepth(301));
    objects.push(scene.add.rectangle(cx, groundY - 8, GAME_WIDTH - 160, 4, 0x4a4a50)
      .setScrollFactor(0).setDepth(301));

    // Hoop (right side): pole, backboard, rim
    const rimX = GAME_WIDTH - 200;
    const rimY = GAME_HEIGHT / 2 - 60;
    objects.push(scene.add.rectangle(rimX + 46, groundY - 60, 8, 200, 0x505058).setScrollFactor(0).setDepth(302));
    objects.push(scene.add.rectangle(rimX + 34, rimY - 20, 12, 70, 0xd0d0d8).setScrollFactor(0).setDepth(302));
    objects.push(scene.add.rectangle(rimX, rimY, 56, 6, 0xd04030).setScrollFactor(0).setDepth(303));
    for (let i = 0; i < 4; i++) {
      objects.push(scene.add.rectangle(rimX - 20 + i * 13, rimY + 14, 2, 22, 0xe8e8f0, 0.7)
        .setScrollFactor(0).setDepth(302));
    }

    // Players
    const jp = scene.add.sprite(cx - 160, groundY - 40, playerTexture, 0)
      .setScale(4).setScrollFactor(0).setDepth(305);
    objects.push(jp);
    const pops = scene.add.sprite(cx - 60, groundY - 40, 'npc_pops', 0)
      .setScale(4).setScrollFactor(0).setDepth(305);
    objects.push(pops);

    // Ball
    const ball = scene.add.circle(cx - 130, groundY - 30, 8, 0xd07830).setScrollFactor(0).setDepth(306);
    objects.push(ball);

    // UI
    objects.push(scene.add.text(cx, 40, 'DRIVEWAY 1v1', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310));
    objects.push(scene.add.text(cx, 66, `FIRST TO ${FIRST_TO}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310));
    const scoreText = scene.add.text(cx, 100, 'JP 0 — 0 POPS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(scoreText);
    const promptText = scene.add.text(cx, GAME_HEIGHT - 70, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(promptText);

    const exitBtn = scene.add.text(80, 40, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);

    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    let shotHandler: (() => void) | null = null;
    let blockHandler: (() => void) | null = null;
    const timers: Phaser.Time.TimerEvent[] = [];

    const cleanup = () => {
      over = true;
      if (shotHandler) spaceKey.off('down', shotHandler);
      if (blockHandler) spaceKey.off('down', blockHandler);
      timers.forEach(t => t.remove());
      objects.forEach(o => { scene.tweens.killTweensOf(o); o.destroy(); });
    };

    const finish = (won: boolean) => {
      const banner = scene.add.text(cx, GAME_HEIGHT / 2 - 40, won ? 'GAME.' : 'POPS TAKES IT', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: won ? '#40c060' : '#ff6666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(320).setAlpha(0);
      objects.push(banner);
      scene.tweens.add({ targets: banner, alpha: 1, duration: 300 });
      if (won) SoundEffects.crowdReact(); else SoundEffects.fumble();
      timers.push(scene.time.delayedCall(1600, () => { cleanup(); onDone(won); }));
    };

    const updateScore = () => scoreText.setText(`JP ${jpScore} — ${popsScore} POPS`);

    const arcBallTo = (x: number, y: number, ms: number, then: () => void) => {
      const apexY = Math.min(ball.y, y) - 90;
      scene.tweens.add({
        targets: ball, x: (ball.x + x) / 2, y: apexY, duration: ms / 2, ease: 'Quad.easeOut',
        onComplete: () => scene.tweens.add({
          targets: ball, x, y, duration: ms / 2, ease: 'Quad.easeIn', onComplete: then,
        }),
      });
    };

    const resetPositions = (then: () => void) => {
      ball.setPosition(cx - 130, groundY - 30);
      jp.setX(cx - 160);
      pops.setX(cx - 60);
      timers.push(scene.time.delayedCall(500, then));
    };

    // --- JP possession: swing bar shot ---
    const jpPossession = () => {
      if (over) return;
      possessionActive = true;
      promptText.setText('SPACE to shoot — stop it in the green');

      const barW = 260;
      const barY = GAME_HEIGHT - 110;
      const barBg = scene.add.rectangle(cx, barY, barW, 14, 0x303038).setScrollFactor(0).setDepth(311);
      const sweet = scene.add.rectangle(cx, barY, barW * 0.16, 14, 0x40c060).setScrollFactor(0).setDepth(312);
      const okZoneL = scene.add.rectangle(cx - barW * 0.19, barY, barW * 0.22, 14, 0xf0c040, 0.5).setScrollFactor(0).setDepth(311);
      const okZoneR = scene.add.rectangle(cx + barW * 0.19, barY, barW * 0.22, 14, 0xf0c040, 0.5).setScrollFactor(0).setDepth(311);
      const marker = scene.add.rectangle(cx - barW / 2, barY, 5, 22, 0xffffff).setScrollFactor(0).setDepth(313);
      const barObjs = [barBg, sweet, okZoneL, okZoneR, marker];
      barObjs.forEach(o => objects.push(o));

      scene.tweens.add({
        targets: marker, x: cx + barW / 2, duration: 420, yoyo: true, repeat: -1, ease: 'Linear',
      });

      shotHandler = () => {
        if (over || !possessionActive) return;
        possessionActive = false;
        spaceKey.off('down', shotHandler!);
        shotHandler = null;
        scene.tweens.killTweensOf(marker);
        const off = Math.abs(marker.x - cx) / (barW / 2); // 0 = perfect
        barObjs.forEach(o => { scene.tweens.killTweensOf(o); o.destroy(); });
        promptText.setText('');

        // JP rises for the jumper
        scene.tweens.add({ targets: jp, y: groundY - 70, duration: 180, yoyo: true, ease: 'Quad.easeOut' });
        const swish = off < 0.16;
        const rimmer = !swish && off < 0.5 && Math.random() < 0.5;
        arcBallTo(rimX, rimY - 6, 550, () => {
          if (swish || rimmer) {
            SoundEffects.playConfirm();
            jpScore++;
            updateScore();
            scene.tweens.add({ targets: ball, y: rimY + 40, duration: 200, ease: 'Quad.easeIn' });
            flashText(swish ? 'SWISH' : 'RATTLES IN', '#40c060');
          } else {
            SoundEffects.playImpact();
            flashText('OFF THE RIM', '#ff6666');
            scene.tweens.add({ targets: ball, x: rimX - 70, y: groundY - 30, duration: 320, ease: 'Quad.easeIn' });
          }
          timers.push(scene.time.delayedCall(900, nextPossession));
        });
      };
      spaceKey.on('down', shotHandler);
    };

    // --- Pops possession: block the "!" ---
    const popsPossession = () => {
      if (over) return;
      possessionActive = true;
      promptText.setText('SPACE on the "!" to block');
      ball.setPosition(cx - 40, groundY - 30);

      // Pops dribbles
      const dribble = scene.tweens.add({ targets: ball, y: groundY - 6, duration: 160, yoyo: true, repeat: -1 });

      let cueShown = false;
      let jumped = false;
      const cue = scene.add.text(pops.x, pops.y - 70, '!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '26px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(315).setVisible(false);
      objects.push(cue);

      const resolve = (blocked: boolean, bitOnFake: boolean) => {
        if (over || !possessionActive) return;
        possessionActive = false;
        spaceKey.off('down', blockHandler!);
        blockHandler = null;
        dribble.remove();
        cue.destroy();
        promptText.setText('');
        if (blocked) {
          SoundEffects.playImpact();
          flashText('BLOCKED', '#40c060');
          scene.tweens.add({ targets: ball, x: cx - 180, y: groundY - 20, duration: 300, ease: 'Quad.easeOut' });
          timers.push(scene.time.delayedCall(900, nextPossession));
        } else {
          const scores = bitOnFake ? Math.random() < 0.85 : Math.random() < 0.6;
          arcBallTo(rimX, rimY - 6, 550, () => {
            if (scores) {
              SoundEffects.playConfirm();
              popsScore++;
              updateScore();
              scene.tweens.add({ targets: ball, y: rimY + 40, duration: 200, ease: 'Quad.easeIn' });
              flashText(bitOnFake ? 'YOU BIT ON THE FAKE' : 'POPS SCORES', '#ff6666');
            } else {
              flashText('SHORT', '#aaaacc');
              scene.tweens.add({ targets: ball, x: rimX - 70, y: groundY - 30, duration: 320, ease: 'Quad.easeIn' });
            }
            timers.push(scene.time.delayedCall(900, nextPossession));
          });
        }
      };

      blockHandler = () => {
        if (over || !possessionActive || jumped) return;
        jumped = true;
        scene.tweens.add({ targets: jp, y: groundY - 75, duration: 160, yoyo: true, ease: 'Quad.easeOut' });
        resolve(cueShown, !cueShown);
      };
      spaceKey.on('down', blockHandler);

      timers.push(scene.time.delayedCall(Phaser.Math.Between(800, 1800), () => {
        if (over || !possessionActive) return;
        cueShown = true;
        cue.setVisible(true);
        // Block window: 380ms after the cue, then Pops gets his shot off clean
        timers.push(scene.time.delayedCall(380, () => {
          if (!over && possessionActive) resolve(false, false);
        }));
      }));
    };

    const flashText = (msg: string, color: string) => {
      const t = scene.add.text(cx, GAME_HEIGHT / 2 - 100, msg, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(315);
      objects.push(t);
      scene.tweens.add({ targets: t, alpha: 0, y: t.y - 24, duration: 800, onComplete: () => t.destroy() });
    };

    let jpBall = true;
    const nextPossession = () => {
      if (over) return;
      if (jpScore >= FIRST_TO) { finish(true); return; }
      if (popsScore >= FIRST_TO) { finish(false); return; }
      jpBall = !jpBall;
      resetPositions(() => { if (!over) (jpBall ? jpPossession : popsPossession)(); });
    };

    exitBtn.on('pointerdown', () => { cleanup(); onDone(false); });

    jpPossession();
  }
}
