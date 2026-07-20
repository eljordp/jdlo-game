// The closet. 2021-23 hype era. Buy drip when the money's flowing;
// sell it back at a loss when crypto zeroes you out. Resale reality:
// you never get back what you paid, and you knew that when you bought it.

import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { BalanceSystem } from './BalanceSystem';
import { SoundEffects } from './SoundEffects';

export interface DripItem {
  brand: string;
  item: string;
  buy: number;   // what it costs new/hyped
  sell: number;  // what it moves for used (always less — that's the lesson)
}

// The real era roster. Prices tuned to how it actually resold 2021-23.
export const DRIP_ROSTER: DripItem[] = [
  { brand: 'Sp5der',       item: 'Worldwide hoodie',     buy: 380, sell: 240 },
  { brand: 'A.L.O.C.S.',   item: 'Cough Syrup hoodie',   buy: 220, sell: 120 },
  { brand: 'BAPE',         item: 'Shark full-zip',        buy: 420, sell: 260 },
  { brand: 'Supreme',      item: 'Box Logo hoodie',       buy: 600, sell: 380 },
  { brand: 'Chrome Hearts',item: 'cross tee',             buy: 750, sell: 420 },
  { brand: 'Denim Tears',  item: 'Cotton Wreath jeans',   buy: 320, sell: 180 },
  { brand: 'Amiri',        item: 'MX1 jeans',             buy: 950, sell: 500 },
  { brand: 'Balenciaga',   item: 'Triple S',              buy: 1050, sell: 550 },
  { brand: 'Gucci',        item: 'GG belt',               buy: 480, sell: 260 },
  { brand: 'Essentials',   item: 'FOG hoodie',            buy: 110, sell: 60 },
];

export class ClosetStore {
  private static isOpen = false;
  // Ownership persists across scenes (BalanceSystem-style singleton).
  static owned = new Set<string>();
  static get open_(): boolean { return this.isOpen; }

  // The flex-era closet JP had BEFORE the crash — what he'd sell to survive.
  static seedCrashCloset(): void {
    if (this.owned.size === 0) {
      ['Sp5der', 'BAPE', 'Supreme', 'Denim Tears', 'Gucci'].forEach(b => this.owned.add(b));
    }
  }

  // mode 'buy' = king-era flossing. mode 'sell' = crash-era survival.
  static open(
    scene: Phaser.Scene,
    mode: 'buy' | 'sell',
    owned: Set<string>,
    onDone: () => void,
  ): void {
    if (this.isOpen) return;
    this.isOpen = true;
    SoundEffects.playConfirm();

    const cx = GAME_WIDTH / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let index = 0;

    // In sell mode, only show what JP actually owns.
    const roster = mode === 'sell'
      ? DRIP_ROSTER.filter(d => owned.has(d.brand))
      : DRIP_ROSTER;

    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.82)
      .setScrollFactor(0).setDepth(600));
    const panelH = 150 + Math.max(1, roster.length) * 40;
    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, 620, panelH, 0x12100e)
      .setScrollFactor(0).setDepth(601).setStrokeStyle(3, mode === 'buy' ? 0xd4a017 : 0x8a5a5a));

    const topY = GAME_HEIGHT / 2 - panelH / 2 + 30;
    objects.push(scene.add.text(cx, topY, mode === 'buy' ? 'THE DRIP RACK' : 'SELL THE CLOSET', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: mode === 'buy' ? '#f0c040' : '#d88888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602));
    const balText = scene.add.text(cx, topY + 26, 'BOOKS: $' + BalanceSystem.getBalance().toLocaleString(), {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#40c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    objects.push(balText);
    objects.push(scene.add.text(cx, topY + 44,
      mode === 'buy' ? 'you only get back a fraction. you know this.' : 'moving it for less than you paid. always.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#7a6a4a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602));

    if (roster.length === 0) {
      objects.push(scene.add.text(cx, GAME_HEIGHT / 2 + 10, 'Closet\'s already empty. Sold it all.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#8a8a8a',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(602));
    }

    const rowTexts: Phaser.GameObjects.Text[] = [];
    const listStartY = topY + 78;
    const rows = [...roster, null]; // null = DONE row

    const rowLabel = (d: DripItem | null): string => {
      if (!d) return 'DONE';
      const price = mode === 'buy' ? d.buy : d.sell;
      const ownedTag = mode === 'buy' && owned.has(d.brand) ? ' [have]' : '';
      return `${d.brand} — ${d.item}  $${price}${ownedTag}`;
    };

    rows.forEach((d, i) => {
      const y = listStartY + i * 40;
      const disabled = Boolean(d) && mode === 'buy' && (owned.has(d!.brand) || BalanceSystem.getBalance() < d!.buy);
      const t = scene.add.text(cx - 270, y, rowLabel(d), {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px',
        color: disabled ? '#4a4438' : (d ? '#e0d4b8' : '#c0b090'),
      }).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: true });
      rowTexts.push(t);
      objects.push(t);
      t.on('pointerover', () => { index = i; render(); });
      t.on('pointerdown', () => choose(i));
    });

    const cursor = scene.add.text(cx - 292, listStartY, '▶', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(603);
    objects.push(cursor);

    const render = () => {
      cursor.setY(listStartY + index * 40);
      balText.setText('BOOKS: $' + BalanceSystem.getBalance().toLocaleString());
      rowTexts.forEach((t, i) => {
        const d = rows[i];
        const disabled = Boolean(d) && mode === 'buy' && (owned.has(d!.brand) || BalanceSystem.getBalance() < d!.buy);
        t.setColor(i === index ? '#f0c040' : disabled ? '#4a4438' : (d ? '#e0d4b8' : '#c0b090'));
      });
    };

    const kb = scene.input.keyboard!;
    const up = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const space = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const esc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const cleanup = () => {
      up.off('down', onUp); down.off('down', onDown);
      space.off('down', onSpace); esc.off('down', onEsc);
      objects.forEach(o => o.destroy());
      this.isOpen = false;
    };

    const flash = (text: string, color: string) => {
      const f = scene.add.text(cx, GAME_HEIGHT / 2 + panelH / 2 - 30, text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(604);
      objects.push(f);
      scene.tweens.add({ targets: f, alpha: 0, y: f.y - 18, duration: 1100, onComplete: () => f.destroy() });
    };

    const choose = (i: number) => {
      const d = rows[i];
      if (!d) { cleanup(); onDone(); return; }
      if (mode === 'buy') {
        if (owned.has(d.brand) || BalanceSystem.getBalance() < d.buy) return;
        BalanceSystem.spend(d.buy);
        owned.add(d.brand);
        SoundEffects.playCash();
        flash(`Copped the ${d.brand}. -$${d.buy}`, '#f0c040');
      } else {
        if (!owned.has(d.brand)) return;
        BalanceSystem.earn(d.sell);
        owned.delete(d.brand);
        SoundEffects.playCash();
        flash(`Sold the ${d.brand}. +$${d.sell} (paid $${d.buy})`, '#d88888');
      }
      // rebuild list to reflect ownership change
      cleanup();
      ClosetStore.open(scene, mode, owned, onDone);
    };
    const onUp = () => { index = (index - 1 + rows.length) % rows.length; render(); SoundEffects.playBlip(); };
    const onDown = () => { index = (index + 1) % rows.length; render(); SoundEffects.playBlip(); };
    const onSpace = () => choose(index);
    const onEsc = () => { cleanup(); onDone(); };

    up.on('down', onUp);
    down.on('down', onDown);
    space.on('down', onSpace);
    esc.on('down', onEsc);
  }
}
