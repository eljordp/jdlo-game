// Pokémon-style pause menu: STATS / FRIENDS / CHOICES / BAG.
// Self-contained overlay — open with PauseMenu.open(scene, onClose).
// Reads GameStats, AffinitySystem, ChoiceLedger, InventorySystem, BalanceSystem.
// Integration is the M key in BaseChapterScene; P remains reserved for phone.

import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { GameStats } from './GameStats';
import { BalanceSystem } from './BalanceSystem';
import { MoodSystem } from './MoodSystem';
import { AffinitySystem } from './AffinitySystem';
import { ChoiceLedger, CHOICE_DEFS } from './ChoiceLedger';
import { InventorySystem } from './InventorySystem';
import { SoundEffects } from './SoundEffects';
import { MusicSystem } from './MusicSystem';
import { GameSettings } from './GameSettings';

type Tab = 'STATS' | 'FRIENDS' | 'CHOICES' | 'BAG' | 'SETTINGS';
const TABS: Tab[] = ['STATS', 'FRIENDS', 'CHOICES', 'BAG', 'SETTINGS'];
const VOLUME_STEPS = [0, 0.25, 0.5, 0.75, 1];
const TEXT_SPEEDS = [0.75, 1, 1.5, 2];

// Friendly display names for tracked NPCs (fallback: prettified id).
const NPC_NAMES: Record<string, string> = {
  ch0_pops: 'Pops', ch0_mom: 'Mom', ch0_sister: 'Sister', ch0_frenchie: 'Ivy',
  ch1_homie1: 'Nolan', ch1_homie2: 'David', ch1_cooper: 'Cooper', ch1_terrell: 'Terrell',
  ch1_bigbart: 'Big Bart', ch1_gf_k: 'K', rise_jose: 'Jose', ch2_homie_door: 'Jose',
  ch3_mikey: 'Mikey', ch3_chris: 'Chris', ch3_bird: 'Bird', ch3_og: 'OG',
  ch4_coworker: 'Juan', ch4_eliseo: 'Eliseo', ch4_boss: 'Ernesto',
  ch5_sticker: 'Sticker Smith', ch6_malachi: 'Malachi', ch6_elijah: 'Elijah',
};

export class PauseMenu {
  private static isOpen = false;

  static get open_(): boolean { return this.isOpen; }

  static open(scene: Phaser.Scene, onClose: () => void): void {
    if (this.isOpen) return;
    this.isOpen = true;
    SoundEffects.playConfirm();

    const objects: Phaser.GameObjects.GameObject[] = [];
    let tabObjects: Phaser.GameObjects.GameObject[] = [];
    let activeTab: Tab = 'STATS';
    let settingsIndex = 0;
    let settingsActions: Array<() => void> = [];

    const cx = GAME_WIDTH / 2;
    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.82)
      .setScrollFactor(0).setDepth(600));
    objects.push(scene.add.rectangle(cx, GAME_HEIGHT / 2, 640, 620, 0x101018)
      .setScrollFactor(0).setDepth(601).setStrokeStyle(3, 0x8888aa));

    // Tab bar
    const tabTexts: Record<Tab, Phaser.GameObjects.Text> = {} as Record<Tab, Phaser.GameObjects.Text>;
    TABS.forEach((tab, i) => {
      const t = scene.add.text(cx - 250 + i * 125, GAME_HEIGHT / 2 - 275, tab, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#666688',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => switchTab(tab));
      tabTexts[tab] = t;
      objects.push(t);
    });

    objects.push(scene.add.text(cx, GAME_HEIGHT / 2 + 285, 'TAB page · ↑↓ select · ENTER change · ESC close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#555577',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(602));

    const line = (x: number, y: number, text: string, color = '#ccccdd', size = '9px') => {
      const t = scene.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: size, color,
      }).setScrollFactor(0).setDepth(602);
      tabObjects.push(t);
      return t;
    };

    const renderTab = () => {
      tabObjects.forEach(o => o.destroy());
      tabObjects = [];
      settingsActions = [];
      TABS.forEach(tab => tabTexts[tab].setColor(tab === activeTab ? '#f0c040' : '#666688'));
      const left = cx - 280;
      let y = GAME_HEIGHT / 2 - 230;

      if (activeTab === 'STATS') {
        const s = GameStats.getAll() as unknown as Record<string, number>;
        line(left, y, `CASH  $${BalanceSystem.getBalance().toLocaleString()}`, '#40c060', '11px'); y += 40;
        line(left, y, `MOOD  ${MoodSystem['currentMood'] ?? 'sober'}`); y += 34;
        const rows: Array<[string, string]> = [
          ['NPCs met', String(s.npcsMet ?? 0)],
          ['Items found', String(s.itemsFound ?? 0)],
          ['Minigames played', String(s.minigamesPlayed ?? 0)],
          ['Times smoked', String(s.timesSmoked ?? 0)],
          ['Drinks had', String(s.drinksHad ?? 0)],
          ['Dice record', String(s.diceWins ?? 0)],
        ];
        for (const [label, val] of rows) {
          line(left, y, label, '#8888aa');
          line(left + 380, y, val, '#ffffff');
          y += 30;
        }
      }

      if (activeTab === 'FRIENDS') {
        const snap = AffinitySystem.snapshot();
        const ids = Object.keys(snap);
        if (ids.length === 0) {
          line(left, y, 'Nobody knows you yet.', '#8888aa');
        } else {
          for (const id of ids.slice(0, 14)) {
            const name = NPC_NAMES[id] ?? id.replace(/^ch\d+_|^rise_/, '');
            const lvl = snap[id];
            const tier = AffinitySystem.tier(id);
            const color = tier === 'close' ? '#40c060' : tier === 'cold' ? '#ff6666' : '#ccccdd';
            const meter = '♥'.repeat(Math.max(0, lvl + 2)) + '·'.repeat(Math.max(0, 2 - lvl));
            line(left, y, name, color);
            line(left + 320, y, meter, color);
            line(left + 470, y, tier.toUpperCase(), '#666688', '7px');
            y += 34;
          }
        }
      }

      if (activeTab === 'CHOICES') {
        const rows = CHOICE_DEFS
          .map(def => ({ def, pick: ChoiceLedger.get(def.id) }))
          .filter(r => r.pick !== null);
        if (rows.length === 0) {
          line(left, y, 'No choices made yet.', '#8888aa');
          y += 30;
          line(left, y, 'They’re coming.', '#555577', '8px');
        } else {
          for (const { def, pick } of rows.slice(0, 9)) {
            line(left, y, def.prompt, '#8888aa', '8px'); y += 24;
            line(left + 20, y, `> ${pick}`, '#f0c040'); y += 34;
          }
          line(left, y + 6, 'How JP chose? Finish the story.', '#555577', '8px');
        }
      }

      if (activeTab === 'BAG') {
        const items = (InventorySystem as unknown as { getAll?: () => Array<{ name: string; quantity: number }> }).getAll?.()
          ?? [];
        if (items.length === 0) {
          line(left, y, 'Empty. For now.', '#8888aa');
        } else {
          for (const item of items.slice(0, 14)) {
            line(left, y, item.name, '#ccccdd');
            line(left + 420, y, `x${item.quantity}`, '#ffffff');
            y += 32;
          }
        }
      }

      if (activeTab === 'SETTINGS') {
        line(left, y, 'AUDIO + DIALOGUE', '#f0c040', '11px'); y += 48;

        const cycleValue = (values: number[], current: number): number => {
          const index = values.reduce((best, value, i) =>
            Math.abs(value - current) < Math.abs(values[best] - current) ? i : best, 0);
          return values[(index + 1) % values.length];
        };
        const setting = (label: string, value: string, action: () => void) => {
          const rowIndex = settingsActions.length;
          settingsActions.push(action);
          const selected = rowIndex === settingsIndex;
          const row = line(left, y, `${selected ? '> ' : '  '}${label}  ${value}`, selected ? '#f0c040' : '#ccccdd', '10px')
            .setInteractive({ useHandCursor: true });
          row.on('pointerdown', () => {
            settingsIndex = rowIndex;
            action();
            SoundEffects.playConfirm();
            renderTab();
          });
          y += 52;
        };

        setting('MUSIC', `${Math.round(GameSettings.musicVolume * 100)}%`, () => {
          const next = cycleValue(VOLUME_STEPS, GameSettings.musicVolume);
          GameSettings.setNumber('musicVolume', next);
          MusicSystem.setVolume(next);
        });
        setting('SFX', `${Math.round(GameSettings.sfxVolume * 100)}%`, () => {
          SoundEffects.setVolume(cycleValue(VOLUME_STEPS, GameSettings.sfxVolume));
        });
        setting('TEXT SPEED', `${GameSettings.textSpeed}x`, () => {
          GameSettings.setNumber('textSpeed', cycleValue(TEXT_SPEEDS, GameSettings.textSpeed));
        });
        y += 12;
        line(left, y, 'Click a setting to change it.', '#666688', '8px'); y += 28;
        line(left, y, 'Changes save automatically.', '#666688', '8px');
      }
    };

    const switchTab = (tab: Tab) => {
      if (tab === activeTab) return;
      activeTab = tab;
      SoundEffects.playBlip();
      renderTab();
    };

    const kb = scene.input.keyboard!;
    const tabKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const upKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const onTab = () => switchTab(TABS[(TABS.indexOf(activeTab) + 1) % TABS.length]);
    const moveSetting = (direction: number) => {
      if (activeTab !== 'SETTINGS' || settingsActions.length === 0) return;
      settingsIndex = (settingsIndex + direction + settingsActions.length) % settingsActions.length;
      SoundEffects.playBlip();
      renderTab();
    };
    const changeSetting = () => {
      if (activeTab !== 'SETTINGS') return;
      const action = settingsActions[settingsIndex];
      if (!action) return;
      action();
      SoundEffects.playConfirm();
      renderTab();
    };
    const onSettingUp = () => moveSetting(-1);
    const onSettingDown = () => moveSetting(1);
    const close = () => {
      tabKey.off('down', onTab);
      escKey.off('down', close);
      upKey.off('down', onSettingUp);
      downKey.off('down', onSettingDown);
      enterKey.off('down', changeSetting);
      tabObjects.forEach(o => o.destroy());
      objects.forEach(o => o.destroy());
      this.isOpen = false;
      onClose();
    };
    tabKey.on('down', onTab);
    escKey.on('down', close);
    upKey.on('down', onSettingUp);
    downKey.on('down', onSettingDown);
    enterKey.on('down', changeSetting);

    renderTab();
  }
}
