import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { MusicSystem } from '../systems/MusicSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { virtualInput } from '../../components/GameCanvas';

type MenuState = 'main' | 'chapters' | 'settings';

interface MenuItem {
  label: string;
  action: () => void;
  enabled: boolean;
}

const CHAPTERS = [
  { key: 'HomeScene', label: 'Chapter 1: Home' },
  { key: 'BeachScene', label: 'Chapter 2: Santa Barbara' },
  { key: 'WrongCrowdScene', label: 'Chapter 3: Wrong Crowd' },
  { key: 'CourtScene', label: 'Chapter 4: Locked Up' },
  { key: 'TractorScene', label: 'Chapter 5: Caymus Vineyards' },
  { key: 'ComeUpScene', label: 'Chapter 6: The Come Up' },
  { key: 'OperatorScene', label: 'Chapter 7: Operator Mode' },
];

const SPEEDS = [1, 1.5, 2, 3];

const YELLOW = '#f0c040';
const GREY = '#666688';
const WHITE = '#ffffff';
const FADED = '#888899';

export class MenuScene extends Phaser.Scene {
  private menuState: MenuState = 'main';
  private selectedIndex = 0;
  private menuItems: MenuItem[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private arrowIndicator!: Phaser.GameObjects.Text;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;

  // Settings state
  private musicOn = true;
  private speedIndex = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.menuState = 'main';
    this.selectedIndex = 0;
    MusicSystem.stop();

    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // Green C8 behind the characters
    const c8 = this.add.sprite(GAME_WIDTH / 2, 290, 'car-corvette-c8')
      .setScale(5).setDepth(0.5);

    // Player sprite (JP) — left side
    this.playerSprite = this.add.sprite(GAME_WIDTH / 2 - 70, 260, 'player', 0)
      .setScale(6).setDepth(1);

    // Higo — right side
    const higo = this.add.sprite(GAME_WIDTH / 2 + 70, 260, 'npc_higo', 0)
      .setScale(6).setDepth(1);

    this.tweens.add({
      targets: [this.playerSprite, higo],
      scaleX: 6.15,
      scaleY: 5.85,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title
    this.titleText = this.add.text(GAME_WIDTH / 2, 380, 'JDLO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: WHITE,
    }).setOrigin(0.5).setDepth(1);

    // Subtitle
    this.subtitleText = this.add.text(GAME_WIDTH / 2, 420, 'A True Story', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: FADED,
    }).setOrigin(0.5).setDepth(1);

    // Arrow indicator (reused for all menus)
    this.arrowIndicator = this.add.text(0, 0, '\u25b6', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: YELLOW,
    }).setOrigin(0.5).setDepth(2);

    // Build main menu
    this.buildMainMenu();

    // Keyboard input
    this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard!.on('keydown-ENTER', () => this.confirmSelection());
  }

  private clearMenu() {
    for (const t of this.menuTexts) t.destroy();
    this.menuTexts = [];
    this.menuItems = [];
  }

  private buildMainMenu() {
    this.clearMenu();
    this.menuState = 'main';
    this.selectedIndex = 0;

    // Show title elements
    this.playerSprite.setVisible(true);
    this.titleText.setVisible(true);
    this.subtitleText.setVisible(true);

    const hasSave = SaveSystem.hasSave();

    this.menuItems = [
      { label: 'Play', action: () => this.startPlay(), enabled: true },
      { label: 'Continue', action: () => this.startContinue(), enabled: hasSave },
      { label: 'Chapter Select', action: () => this.buildChapterSelect(), enabled: true },
      { label: 'Settings', action: () => this.buildSettings(), enabled: true },
    ];

    this.renderMenu(520);
  }

  private buildChapterSelect() {
    this.clearMenu();
    this.menuState = 'chapters';
    this.selectedIndex = 0;

    // Hide title elements for more room
    this.playerSprite.setVisible(false);
    this.titleText.setVisible(false);
    this.subtitleText.setVisible(false);

    // Header
    const header = this.add.text(GAME_WIDTH / 2, 200, 'CHAPTER SELECT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: WHITE,
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(header);

    this.menuItems = CHAPTERS.map((ch) => ({
      label: ch.label,
      action: () => this.scene.start(ch.key),
      enabled: true,
    }));

    this.menuItems.push({
      label: 'Back',
      action: () => this.buildMainMenu(),
      enabled: true,
    });

    this.renderMenu(300);
  }

  private buildSettings() {
    this.clearMenu();
    this.menuState = 'settings';
    this.selectedIndex = 0;

    // Hide title elements
    this.playerSprite.setVisible(false);
    this.titleText.setVisible(false);
    this.subtitleText.setVisible(false);

    // Header
    const header = this.add.text(GAME_WIDTH / 2, 280, 'SETTINGS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: WHITE,
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(header);

    this.menuItems = [
      {
        label: `Music: ${this.musicOn ? 'ON' : 'OFF'}`,
        action: () => this.toggleMusic(),
        enabled: true,
      },
      {
        label: `Speed: ${SPEEDS[this.speedIndex]}x`,
        action: () => this.cycleSpeed(),
        enabled: true,
      },
      {
        label: 'Back',
        action: () => this.buildMainMenu(),
        enabled: true,
      },
    ];

    this.renderMenu(380);
  }

  private renderMenu(startY: number) {
    const spacing = 44;

    for (let i = 0; i < this.menuItems.length; i++) {
      const item = this.menuItems[i];
      const y = startY + i * spacing;

      const color = !item.enabled ? '#444455' : (i === this.selectedIndex ? YELLOW : GREY);

      const text = this.add.text(GAME_WIDTH / 2, y, item.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color,
      }).setOrigin(0.5).setDepth(1);

      // Mouse/touch interaction
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        if (item.enabled) {
          this.selectedIndex = i;
          this.updateMenuVisuals();
        }
      });
      text.on('pointerdown', () => {
        if (item.enabled) {
          this.selectedIndex = i;
          this.confirmSelection();
        }
      });

      this.menuTexts.push(text);
    }

    this.updateMenuVisuals();
  }

  private updateMenuVisuals() {
    // Update text colors
    const menuOnlyTexts = this.menuTexts.filter(t => {
      const text = t.text;
      // Skip headers
      return text !== 'CHAPTER SELECT' && text !== 'SETTINGS';
    });

    for (let i = 0; i < this.menuItems.length; i++) {
      const item = this.menuItems[i];
      const text = menuOnlyTexts[i];
      if (!text) continue;

      if (!item.enabled) {
        text.setColor('#444455');
      } else if (i === this.selectedIndex) {
        text.setColor(YELLOW);
      } else {
        text.setColor(GREY);
      }
    }

    // Position arrow indicator
    const selectedText = menuOnlyTexts[this.selectedIndex];
    if (selectedText) {
      const bounds = selectedText.getBounds();
      this.arrowIndicator.setPosition(bounds.left - 24, selectedText.y);
      this.arrowIndicator.setVisible(true);
    }
  }

  private moveSelection(dir: number) {
    let next = this.selectedIndex + dir;

    // Wrap around
    if (next < 0) next = this.menuItems.length - 1;
    if (next >= this.menuItems.length) next = 0;

    // Skip disabled items
    let attempts = 0;
    while (!this.menuItems[next].enabled && attempts < this.menuItems.length) {
      next += dir;
      if (next < 0) next = this.menuItems.length - 1;
      if (next >= this.menuItems.length) next = 0;
      attempts++;
    }

    this.selectedIndex = next;
    this.updateMenuVisuals();
    SoundEffects.playBlip();
  }

  private confirmSelection() {
    const item = this.menuItems[this.selectedIndex];
    if (item && item.enabled) {
      SoundEffects.playConfirm();
      item.action();
    }
  }

  private startPlay() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('IntroScene');
    });
  }

  private startContinue() {
    const save = SaveSystem.loadSave();
    if (save) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(save.chapter);
      });
    }
  }

  private toggleMusic() {
    this.musicOn = !this.musicOn;
    MusicSystem.toggleMute();
    // Rebuild settings to update label
    this.buildSettings();
  }

  private cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % SPEEDS.length;
    // Apply speed globally
    virtualInput.gameSpeed = SPEEDS[this.speedIndex];
    // Rebuild settings to update label
    this.buildSettings();
  }
}
