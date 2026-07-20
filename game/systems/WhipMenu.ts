// The whip menu. Click the car, pick where the night goes.
// Pokémon-style destination picker — the agency of choosing a place without
// the cost of a walkable district. Each destination routes to an existing
// cutaway/beat in the chapter.
//
// Usage:
//   WhipMenu.open(scene, 'WHERE TO?', [
//     { label: 'STATE STREET', sub: 'the spots. the life.', onSelect: () => this.goState() },
//     { label: 'BEACH CITY',   sub: 'where the money is.', onSelect: () => this.goRun() },
//   ], () => { this.frozen = false; });

import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SoundEffects } from './SoundEffects';

export interface WhipDestination {
  label: string;
  sub: string;
  locked?: string;        // if set, destination is greyed and shows this reason
  onSelect: () => void;
}

export class WhipMenu {
  private static isOpen = false;
  static get open_(): boolean { return this.isOpen; }

  static open(
    scene: Phaser.Scene,
    title: string,
    destinations: WhipDestination[],
    onClose: () => void,
  ): void {
    if (this.isOpen) return;
    this.isOpen = true;
    SoundEffects.playConfirm();

    const cx = GAME_WIDTH / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let index = 0;

    // Include a Cancel row at the bottom
    const rows: WhipDestination[] = [
      ...destinations,
      { label: 'STAY IN', sub: 'not tonight.', onSelect: () => {} },
    ];

    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(600));
    const panelH = 120 + rows.length * 70;
    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, 560, panelH, 0x14100c)
      .setScrollFactor(0).setDepth(601).setStrokeStyle(3, 0xd4a017));

    // Keys in the ignition — a little chrome flourish
    objects.push(scene.add.text(cx, GAME_HEIGHT / 2 - panelH / 2 + 34, title, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602));
    objects.push(scene.add.text(cx, GAME_HEIGHT / 2 - panelH / 2 + 58, '↑↓ pick · SPACE go · ESC keys back', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#6a5a3a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602));

    const rowTexts: Phaser.GameObjects.Text[] = [];
    const rowSubs: Phaser.GameObjects.Text[] = [];
    const startY = GAME_HEIGHT / 2 - panelH / 2 + 100;

    rows.forEach((dest, i) => {
      const y = startY + i * 70;
      const locked = Boolean(dest.locked);
      const label = scene.add.text(cx - 220, y, dest.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '13px',
        color: locked ? '#4a4438' : '#e8dcc0',
      }).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !locked });
      const sub = scene.add.text(cx - 220, y + 22, locked ? dest.locked! : dest.sub, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px',
        color: locked ? '#5a4a2a' : '#9a8a68',
      }).setScrollFactor(0).setDepth(602);
      rowTexts.push(label);
      rowSubs.push(sub);
      objects.push(label, sub);
      if (!locked) {
        label.on('pointerover', () => { index = i; render(); });
        label.on('pointerdown', () => choose(i));
      }
    });

    const cursor = scene.add.text(cx - 250, startY, '▶', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(603);
    objects.push(cursor);

    const render = () => {
      cursor.setY(startY + index * 70);
      rowTexts.forEach((t, i) => {
        if (rows[i].locked) return;
        t.setColor(i === index ? '#f0c040' : '#e8dcc0');
      });
      SoundEffects.playBlip();
    };

    const kb = scene.input.keyboard!;
    const up = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const space = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const esc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const move = (dir: number) => {
      let next = index;
      for (let n = 0; n < rows.length; n++) {
        next = (next + dir + rows.length) % rows.length;
        if (!rows[next].locked) break;
      }
      index = next;
      render();
    };
    const onUp = () => move(-1);
    const onDown = () => move(1);
    const onSpace = () => choose(index);

    const cleanup = () => {
      up.off('down', onUp); down.off('down', onDown);
      space.off('down', onSpace); esc.off('down', onEsc);
      objects.forEach(o => o.destroy());
      this.isOpen = false;
    };
    const choose = (i: number) => {
      const dest = rows[i];
      if (dest.locked) return;
      cleanup();
      onClose();
      dest.onSelect();
    };
    const onEsc = () => { cleanup(); onClose(); };

    up.on('down', onUp);
    down.on('down', onDown);
    space.on('down', onSpace);
    esc.on('down', onEsc);
  }
}
