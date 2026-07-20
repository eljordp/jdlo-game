// @jdlo — the social loop that IS JP.
// When he has motion, he posts and buyers slide into the DMs.
// When he has no motion, he posts anyway, it flops, nobody hits him up —
// and he deletes it. The exact self-sabotage, made playable.
//
// motion rises with sales/activity, decays over time.
// followers rise on a hot post, fall on a flop and a delete.

import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SoundEffects } from './SoundEffects';

export class SocialSystem {
  static followers = 2847;
  static motion = 20;          // 0-100. sales/activity feed this.
  private static lastFlopped = false;
  private static isOpen = false;

  static addMotion(n: number): void {
    this.motion = Math.max(0, Math.min(100, this.motion + n));
  }

  static open(scene: Phaser.Scene, onClose: () => void): void {
    if (this.isOpen) return;
    this.isOpen = true;
    SoundEffects.playConfirm();

    const cx = GAME_WIDTH / 2;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const line = (y: number, text: string, color: string, size = '9px') => {
      const t = scene.add.text(cx, y, text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: size, color, align: 'center',
        wordWrap: { width: 460 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
      objs.push(t);
      return t;
    };

    objs.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.82)
      .setScrollFactor(0).setDepth(600));
    objs.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, 520, 420, 0x0e0e14)
      .setScrollFactor(0).setDepth(601).setStrokeStyle(3, 0xd4a017));

    const header = line(GAME_HEIGHT / 2 - 175, '@jdlo', '#ffffff', '15px');
    objs.push(header);
    const fol = line(GAME_HEIGHT / 2 - 148, this.followers.toLocaleString() + ' followers', '#8899bb', '7px');
    const motionBar = () => {
      const hot = this.motion >= 50;
      return (hot ? 'MOTION: HOT ' : 'MOTION: COLD ') + '█'.repeat(Math.round(this.motion / 10)) + '·'.repeat(10 - Math.round(this.motion / 10));
    };
    const mot = line(GAME_HEIGHT / 2 - 120, motionBar(), this.motion >= 50 ? '#40c060' : '#8a6a4a', '7px');

    let feed = line(GAME_HEIGHT / 2 - 40, 'What you posting?', '#c0c0d0', '9px');

    const btn = (x: number, label: string, color: number, cb: () => void) => {
      const bg = scene.add.rectangle(x, GAME_HEIGHT / 2 + 120, 200, 44, color)
        .setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: true });
      const tx = scene.add.text(x, GAME_HEIGHT / 2 + 120, label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(603);
      bg.on('pointerdown', cb);
      objs.push(bg, tx);
      return [bg, tx] as const;
    };

    const refresh = () => {
      fol.setText(this.followers.toLocaleString() + ' followers');
      mot.setText(motionBar());
      mot.setColor(this.motion >= 50 ? '#40c060' : '#8a6a4a');
    };

    const post = () => {
      if (this.motion >= 50) {
        // HOT: the post lands, buyers slide in
        const gain = 40 + Math.floor(this.motion * 2);
        this.followers += gain;
        this.lastFlopped = false;
        SoundEffects.playCash();
        feed.setText(`Posted. +${gain} followers.\n\nDMs blowing up:\n"aye you got that?"\n"pull up on me twin"\n"lmk when you free"`);
        feed.setColor('#40c060');
        refresh();
      } else {
        // COLD: it flops. silence. the fell-off feeling.
        this.lastFlopped = true;
        this.followers -= 12;
        SoundEffects.playImpact();
        feed.setText('Posted.\n\n...\n\n3 likes. All homies.\nNobody slid up. Nobody copped.\nYou can feel yourself falling off.');
        feed.setColor('#c86868');
        refresh();
      }
    };

    const del = () => {
      if (this.lastFlopped) {
        this.lastFlopped = false;
        this.followers -= 6;
        feed.setText('Deleted.\n\nLike it never happened.\nExcept it did. It always does.\nThat\'s the pattern, JP.');
        feed.setColor('#8a8a9a');
        refresh();
      } else {
        feed.setText('Nothing to delete right now.\nThe hot ones you leave up.\nIt\'s the flops you erase.');
        feed.setColor('#8a8a9a');
      }
    };

    btn(cx - 150, 'POST', 0x3a5f8e, post);
    btn(cx + 60, 'DELETE LAST', 0x8a3a3a, del);

    const closeBtn = scene.add.text(cx + 225, GAME_HEIGHT / 2 - 175, 'X', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(603).setInteractive({ useHandCursor: true });
    objs.push(closeBtn);
    const esc = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const shut = () => {
      esc.off('down', shut);
      objs.forEach(o => o.destroy());
      this.isOpen = false;
      onClose();
    };
    closeBtn.on('pointerdown', shut);
    esc.on('down', shut);
  }
}
