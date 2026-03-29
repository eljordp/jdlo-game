import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { MusicSystem } from '../systems/MusicSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { GameSettings } from '../systems/GameSettings';
import { InventorySystem } from '../systems/InventorySystem';
import { virtualInput } from '../../components/GameCanvas';

type MenuState = 'main' | 'chapters' | 'settings';

interface MenuItem {
  label: string;
  action: () => void;
  enabled: boolean;
}

const CHAPTERS = [
  { key: 'HomeScene', label: 'Ch 1: Home', desc: 'Where it all started' },
  { key: 'BeachScene', label: 'Ch 2: Santa Barbara', desc: 'The boys, the beach, the bad ideas' },
  { key: 'WrongCrowdScene', label: 'Ch 3: Wrong Crowd', desc: '3 AM. Nothing good happens.' },
  { key: 'CourtScene', label: 'Ch 4: Locked Up', desc: 'Faced 13 years. Took the plea.' },
  { key: 'TractorScene', label: 'Ch 5: Caymus Vineyards', desc: 'Honest work. Restless mind.' },
  { key: 'ComeUpScene', label: 'Ch 6: The Come Up', desc: '$300. Then $500. Then $900.' },
  { key: 'OperatorScene', label: 'Ch 7: Operator Mode', desc: 'They treat him like an equal now.' },
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
  private taglineText: Phaser.GameObjects.Text | null = null;

  // Settings state
  private musicOn = true;
  private speedIndex = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.menuState = 'main';
    this.selectedIndex = 0;
    MusicSystem.play('menu');

    // Dark background with subtle gradient
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);
    // Subtle vignette gradient at top
    const vignette = this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 200, 0x0a0818, 0.5).setOrigin(0.5, 0).setDepth(0);

    // Floating particles — ambient dust/stars
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        const px = Math.random() * GAME_WIDTH;
        const py = GAME_HEIGHT + 10;
        const size = 1 + Math.random() * 2;
        const alpha = 0.1 + Math.random() * 0.2;
        const particle = this.add.circle(px, py, size, 0xffffff, alpha).setDepth(0);
        this.tweens.add({
          targets: particle,
          y: -10,
          x: px + (Math.random() - 0.5) * 60,
          alpha: 0,
          duration: 6000 + Math.random() * 4000,
          onComplete: () => particle.destroy(),
        });
      },
    });

    // Ambient glow behind player
    const glow = this.add.circle(GAME_WIDTH / 2, 260, 80, 0x2040a0, 0.08).setDepth(0);
    this.tweens.add({
      targets: glow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.04,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Player sprite — centered, breathing animation, fades in
    this.playerSprite = this.add.sprite(GAME_WIDTH / 2, 260, 'player', 0)
      .setScale(6).setDepth(1).setAlpha(0);

    this.tweens.add({
      targets: this.playerSprite,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeOut',
    });

    this.tweens.add({
      targets: this.playerSprite,
      scaleX: 6.15,
      scaleY: 5.85,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title — fades in with slight rise
    this.titleText = this.add.text(GAME_WIDTH / 2, 395, 'JDLO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: WHITE,
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: 380,
      duration: 1000,
      delay: 600,
      ease: 'Quad.easeOut',
    });

    // Subtitle — fades in after title
    this.subtitleText = this.add.text(GAME_WIDTH / 2, 420, 'A True Story', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: FADED,
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    this.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      duration: 800,
      delay: 1200,
      ease: 'Quad.easeOut',
    });

    // Rotating tagline — cycles through different hooks
    const taglines = [
      'Based on real events. No cap.',
      '7 chapters. 1 real story.',
      'From the bedroom to the boardroom.',
      'He faced 13 years. Took the plea.',
      'Self-taught everything. In 5 months.',
      'Not a game about a coder. A game about a person.',
    ];
    let tagIdx = 0;
    this.taglineText = this.add.text(GAME_WIDTH / 2, 450, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#555577',
    }).setOrigin(0.5).setDepth(1).setAlpha(0);
    const tagline = this.taglineText;

    // Cycle taglines every 4 seconds
    const showTag = () => {
      if (!tagline || !tagline.active) return;
      tagline.setText(taglines[tagIdx % taglines.length]);
      tagIdx++;
      this.tweens.add({ targets: tagline, alpha: 0.6, duration: 600 });
      this.time.delayedCall(3400, () => {
        if (!tagline.active) return;
        this.tweens.add({
          targets: tagline, alpha: 0, duration: 600,
          onComplete: () => { if (tagline.active) showTag(); },
        });
      });
    };
    this.time.delayedCall(2000, showTag);

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
    if (this.taglineText) this.taglineText.setVisible(true);

    const hasSave = SaveSystem.hasSave();

    this.menuItems = [
      { label: 'Play', action: () => this.startPlay(), enabled: true },
      { label: 'Continue', action: () => this.startContinue(), enabled: hasSave },
      { label: 'Chapter Select', action: () => this.buildChapterSelect(), enabled: true },
      { label: 'Settings', action: () => this.buildSettings(), enabled: true },
    ];

    this.renderMenu(520);
  }

  private chapterDescText?: Phaser.GameObjects.Text;

  private buildChapterSelect() {
    this.clearMenu();
    this.menuState = 'chapters';
    this.selectedIndex = 0;

    // Hide title elements for more room
    this.playerSprite.setVisible(false);
    this.titleText.setVisible(false);
    this.subtitleText.setVisible(false);

    // Header
    const header = this.add.text(GAME_WIDTH / 2, 140, 'SELECT YOUR CHAPTER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: YELLOW,
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(header);

    // Subheader
    const sub = this.add.text(GAME_WIDTH / 2, 165, 'Every chapter is a real part of JP\'s life', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: FADED,
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(sub);

    // Description area — updates on hover
    this.chapterDescText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, CHAPTERS[0].desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaacc',
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(this.chapterDescText);

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

    this.renderMenu(220);
  }

  private buildSettings() {
    this.clearMenu();
    this.menuState = 'settings';
    this.selectedIndex = 0;

    // Hide title elements
    this.playerSprite.setVisible(false);
    this.titleText.setVisible(false);
    this.subtitleText.setVisible(false);
    if (this.taglineText) this.taglineText.setVisible(false);

    // Header
    const header = this.add.text(GAME_WIDTH / 2, 160, 'SETTINGS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: YELLOW,
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(header);

    const kidsOn = GameSettings.kidsMode;
    const bigHeadOn = GameSettings.bigHead;
    const hardOn = GameSettings.hardMode;
    const speedRunOn = GameSettings.get('speedRun');

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
        label: `Kids Mode: ${kidsOn ? 'ON (lol)' : 'OFF'}`,
        action: () => { GameSettings.toggle('kidsMode'); this.buildSettings(); },
        enabled: true,
      },
      {
        label: `Big Head Mode: ${bigHeadOn ? 'HUGE' : 'Normal'}`,
        action: () => { GameSettings.toggle('bigHead'); this.buildSettings(); },
        enabled: true,
      },
      {
        label: `Hard Mode: ${hardOn ? 'Pain' : 'Normal'}`,
        action: () => { GameSettings.toggle('hardMode'); this.buildSettings(); },
        enabled: true,
      },
      {
        label: `Speed Run: ${speedRunOn ? 'Clock ON' : 'OFF'}`,
        action: () => { GameSettings.toggle('speedRun'); this.buildSettings(); },
        enabled: true,
      },
      {
        label: 'Back',
        action: () => this.buildMainMenu(),
        enabled: true,
      },
    ];

    // Fun description for kids mode
    const descText = kidsOn
      ? '"Weed" is now "Candy". "Bong" is "Juice Box". You\'re welcome, parents.'
      : 'Toggle settings to customize your experience';
    const desc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, descText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: kidsOn ? '#50e070' : FADED,
      wordWrap: { width: GAME_WIDTH - 100 },
      align: 'center',
    }).setOrigin(0.5).setDepth(1);
    this.menuTexts.push(desc);

    this.renderMenu(240);
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
    // Update chapter description if in chapter select
    if (this.menuState === 'chapters' && this.chapterDescText && this.selectedIndex < CHAPTERS.length) {
      this.chapterDescText.setText(CHAPTERS[this.selectedIndex].desc);
    }

    // Update text colors
    const skipTexts = ['SELECT YOUR CHAPTER', 'SETTINGS', 'Every chapter is a real part of JP\'s life', '"Weed" is now "Candy". "Bong" is "Juice Box". You\'re welcome, parents.', 'Toggle settings to customize your experience'];
    const menuOnlyTexts = this.menuTexts.filter(t => {
      return !skipTexts.includes(t.text) && !t.text.startsWith('"') && t !== this.chapterDescText;
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
    // New game — clear old save data
    InventorySystem.clearAll();
    SaveSystem.clearSave();

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
