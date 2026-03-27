import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InventorySystem } from './InventorySystem';
import { BalanceSystem } from './BalanceSystem';

// ── Phone System (Singleton) ────────────────────────────────────
// iPhone 16-style phone overlay. Opens with P or TAB.
// Shows apps: Inventory, Messages, Instagram, Call, Photos, Music.

interface AppDef {
  id: string;
  name: string;
  icon: string;
  color: number;
}

const APPS: AppDef[] = [
  { id: 'inventory', name: 'Inventory', icon: '\u{1F392}', color: 0x4a90d9 },
  { id: 'messages',  name: 'Messages',  icon: '\u{1F4AC}', color: 0x34c759 },
  { id: 'instagram', name: 'Instagram', icon: '\u{1F4F7}', color: 0xc13584 },
  { id: 'call',      name: 'Call',      icon: '\u{1F4DE}', color: 0x30d158 },
  { id: 'photos',    name: 'Photos',    icon: '\u{1F5BC}\u{FE0F}', color: 0xff9500 },
  { id: 'music',     name: 'Music',     icon: '\u{1F3B5}', color: 0xff2d55 },
];

// Phone dimensions
const PHONE_W = 220;
const PHONE_H = 400;
const BORDER = 6;
const NOTCH_W = 60;
const NOTCH_H = 14;
const CORNER_R = 18; // simulated via border rect offset
const HOME_IND_W = 80;
const HOME_IND_H = 3;

const DEPTH_BASE = 500;
const FONT = '"Press Start 2P", monospace';

export class PhoneSystem {
  private static scene: Phaser.Scene | null = null;
  private static isOpen = false;
  private static objects: Phaser.GameObjects.GameObject[] = [];
  private static pKey: Phaser.Input.Keyboard.Key | null = null;
  private static tabKey: Phaser.Input.Keyboard.Key | null = null;
  private static escKey: Phaser.Input.Keyboard.Key | null = null;
  private static currentScreen: 'home' | 'app' = 'home';
  private static phoneContainer: Phaser.GameObjects.Container | null = null;

  static init(scene: Phaser.Scene) {
    this.scene = scene;
    this.isOpen = false;
    this.objects = [];
    this.currentScreen = 'home';
    this.phoneContainer = null;

    // Register keys
    this.pKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.tabKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.pKey.on('down', () => this.toggle());
    this.tabKey.on('down', (e: KeyboardEvent) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      this.toggle();
    });
    this.escKey.on('down', () => {
      if (this.isOpen) this.close();
    });
  }

  private static toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private static open() {
    if (!this.scene || this.isOpen) return;
    this.isOpen = true;

    const scene = this.scene;
    const baseScene = scene as unknown as { frozen: boolean };
    baseScene.frozen = true;

    // Dark overlay
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7,
    ).setScrollFactor(0).setDepth(DEPTH_BASE).setInteractive();
    overlay.on('pointerdown', () => this.close());
    this.objects.push(overlay);

    // Phone body — outer border (simulates rounded corners via larger dark rect)
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // We build the phone as individual objects (no container needed for slide anim)
    // But we'll group them and tween together
    const phoneObjects: Phaser.GameObjects.GameObject[] = [];

    // Outer body (border)
    const outerBody = scene.add.rectangle(cx, cy, PHONE_W + BORDER * 2, PHONE_H + BORDER * 2, 0x0a0a0e)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 1);
    phoneObjects.push(outerBody);

    // Inner body
    const innerBody = scene.add.rectangle(cx, cy, PHONE_W, PHONE_H, 0x1a1a1e)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 2);
    phoneObjects.push(innerBody);

    // Screen area (slightly inset)
    const screenX = cx;
    const screenY = cy;
    const screenW = PHONE_W - 16;
    const screenH = PHONE_H - 40;
    const screen = scene.add.rectangle(screenX, screenY, screenW, screenH, 0x0a0a14)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 3);
    phoneObjects.push(screen);

    // Dynamic Island (notch)
    const notch = scene.add.rectangle(cx, cy - PHONE_H / 2 + 28, NOTCH_W, NOTCH_H, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(notch);

    // Home indicator
    const homeInd = scene.add.rectangle(cx, cy + PHONE_H / 2 - 12, HOME_IND_W, HOME_IND_H, 0xffffff, 0.4)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(homeInd);

    // Status bar
    const statusY = cy - PHONE_H / 2 + 48;

    const carrier = scene.add.text(cx - screenW / 2 + 10, statusY, 'JDLO', {
      fontFamily: FONT, fontSize: '7px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(carrier);

    const timeText = scene.add.text(cx, statusY, '4:20 PM', {
      fontFamily: FONT, fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(timeText);

    const battery = scene.add.text(cx + screenW / 2 - 10, statusY, '100%', {
      fontFamily: FONT, fontSize: '7px', color: '#34c759',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(battery);

    // Store all phone objects
    this.objects.push(...phoneObjects);

    // Build home screen content
    this.buildHomeScreen(cx, cy, screenW, screenH, statusY);

    // Slide-up animation: start all phone objects below screen, tween up
    const slideOffset = GAME_HEIGHT;
    for (const obj of phoneObjects) {
      if ('y' in obj) {
        const go = obj as Phaser.GameObjects.Shape | Phaser.GameObjects.Text;
        const targetY = go.y;
        go.y = targetY + slideOffset;
        scene.tweens.add({
          targets: go,
          y: targetY,
          duration: 350,
          ease: 'Back.easeOut',
        });
      }
    }
    // Also animate the content objects that buildHomeScreen creates
    // They're added to this.objects after phoneObjects, so we handle them too
    const contentStart = phoneObjects.length + 1; // +1 for overlay
    scene.time.delayedCall(10, () => {
      for (let i = contentStart; i < this.objects.length; i++) {
        const obj = this.objects[i];
        if (obj && 'y' in obj) {
          const go = obj as Phaser.GameObjects.Shape | Phaser.GameObjects.Text;
          const targetY = go.y;
          go.y = targetY + slideOffset;
          scene.tweens.add({
            targets: go,
            y: targetY,
            duration: 350,
            ease: 'Back.easeOut',
          });
        }
      }
    });
  }

  private static close() {
    if (!this.isOpen || !this.scene) return;
    this.isOpen = false;
    this.currentScreen = 'home';

    const scene = this.scene;

    // Slide down then destroy
    const slideOffset = GAME_HEIGHT;
    let completed = 0;
    const total = this.objects.length;

    for (const obj of this.objects) {
      if (obj && 'y' in obj && obj.active) {
        const go = obj as Phaser.GameObjects.Shape | Phaser.GameObjects.Text;
        scene.tweens.add({
          targets: go,
          y: go.y + slideOffset,
          duration: 250,
          ease: 'Quad.easeIn',
          onComplete: () => {
            go.destroy();
            completed++;
            if (completed >= total) this.finishClose();
          },
        });
      } else if (obj && obj.active) {
        // Overlay — just fade
        const go = obj as Phaser.GameObjects.Rectangle;
        scene.tweens.add({
          targets: go,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            go.destroy();
            completed++;
            if (completed >= total) this.finishClose();
          },
        });
      } else {
        completed++;
      }
    }

    if (total === 0 || completed >= total) {
      this.finishClose();
    }
  }

  private static finishClose() {
    this.objects = [];
    if (this.scene) {
      const baseScene = this.scene as unknown as { frozen: boolean };
      baseScene.frozen = false;
    }
  }

  // ── Home Screen ──────────────────────────────────────────────

  private static buildHomeScreen(cx: number, cy: number, screenW: number, screenH: number, statusY: number) {
    if (!this.scene) return;
    const scene = this.scene;
    this.currentScreen = 'home';

    const cols = 3;
    const rows = 2;
    const appSize = 44;
    const gapX = 56;
    const gapY = 64;
    const gridW = (cols - 1) * gapX;
    const gridH = (rows - 1) * gapY;
    const gridStartX = cx - gridW / 2;
    const gridStartY = statusY + 40;

    for (let i = 0; i < APPS.length; i++) {
      const app = APPS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ax = gridStartX + col * gapX;
      const ay = gridStartY + row * gapY;

      // App icon background
      const iconBg = scene.add.rectangle(ax, ay, appSize, appSize, app.color, 0.9)
        .setScrollFactor(0).setDepth(DEPTH_BASE + 6).setInteractive({ useHandCursor: true });
      this.objects.push(iconBg);

      // Emoji icon
      const iconText = scene.add.text(ax, ay - 2, app.icon, {
        fontSize: '18px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
      this.objects.push(iconText);

      // App label
      const label = scene.add.text(ax, ay + appSize / 2 + 6, app.name, {
        fontFamily: FONT, fontSize: '5px', color: '#cccccc',
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
      this.objects.push(label);

      // Hover effect
      iconBg.on('pointerover', () => {
        iconBg.setScale(1.1);
        iconText.setScale(1.1);
      });
      iconBg.on('pointerout', () => {
        iconBg.setScale(1);
        iconText.setScale(1);
      });

      // Click — open app
      iconBg.on('pointerdown', () => {
        this.openApp(app, cx, cy, screenW, screenH, statusY);
      });
    }

    // Balance display below apps
    const balanceY = gridStartY + gridH + 50;
    const balanceBg = scene.add.rectangle(cx, balanceY, screenW - 20, 32, 0x1a1a2e, 0.8)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    this.objects.push(balanceBg);

    const balanceLabel = scene.add.text(cx - screenW / 2 + 20, balanceY, 'Balance', {
      fontFamily: FONT, fontSize: '6px', color: '#888899',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
    this.objects.push(balanceLabel);

    const balanceValue = scene.add.text(cx + screenW / 2 - 20, balanceY, BalanceSystem.formatted(), {
      fontFamily: FONT, fontSize: '10px', color: '#40c060',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
    this.objects.push(balanceValue);
  }

  // ── App Screens ──────────────────────────────────────────────

  private static clearContent() {
    // Remove everything except overlay + phone body (first 10ish objects)
    // Actually safer: tag content objects separately
    // For simplicity, we'll just rebuild — remove all and rebuild phone
    // Better approach: remove objects added after a marker index

    // We'll remove objects from the content area only
    // Content objects start after the phone frame objects
    // Phone frame = overlay(1) + outerBody + innerBody + screen + notch + homeInd + carrier + time + battery = 9
    const frameCount = 10; // overlay + 9 phone frame objects
    const contentObjects = this.objects.splice(frameCount);
    for (const obj of contentObjects) {
      if (obj && obj.active) obj.destroy();
    }
  }

  private static openApp(app: AppDef, cx: number, cy: number, screenW: number, screenH: number, statusY: number) {
    if (!this.scene) return;
    this.clearContent();
    this.currentScreen = 'app';

    const scene = this.scene;

    // Back button
    const backBtn = scene.add.text(cx - screenW / 2 + 10, statusY + 18, '< Back', {
      fontFamily: FONT, fontSize: '7px', color: '#4a90d9',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6)
      .setInteractive({ useHandCursor: true });
    this.objects.push(backBtn);

    backBtn.on('pointerover', () => backBtn.setColor('#80b8ff'));
    backBtn.on('pointerout', () => backBtn.setColor('#4a90d9'));
    backBtn.on('pointerdown', () => {
      this.clearContent();
      this.buildHomeScreen(cx, cy, screenW, screenH, statusY);
    });

    // App title
    const titleText = scene.add.text(cx, statusY + 18, app.name, {
      fontFamily: FONT, fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    this.objects.push(titleText);

    if (app.id === 'inventory') {
      this.buildInventoryScreen(cx, cy, screenW, screenH, statusY);
    } else {
      this.buildPlaceholderScreen(app, cx, cy, screenW, screenH, statusY);
    }
  }

  // ── Inventory Screen ─────────────────────────────────────────

  private static buildInventoryScreen(cx: number, cy: number, screenW: number, screenH: number, statusY: number) {
    if (!this.scene) return;
    const scene = this.scene;

    const items = InventorySystem.getItems();
    const startY = statusY + 38;
    const rowH = 36;
    const maxVisible = Math.floor((screenH - 80) / rowH);

    if (items.length === 0) {
      const empty = scene.add.text(cx, cy, 'Nothing yet.', {
        fontFamily: FONT, fontSize: '8px', color: '#555555',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6);
      this.objects.push(empty);
      return;
    }

    for (let i = 0; i < Math.min(items.length, maxVisible); i++) {
      const item = items[i];
      const iy = startY + i * rowH;

      // Row divider line
      if (i > 0) {
        const divider = scene.add.rectangle(cx, iy - rowH / 2 + 2, screenW - 20, 1, 0x333344, 0.5)
          .setScrollFactor(0).setDepth(DEPTH_BASE + 6);
        this.objects.push(divider);
      }

      // Icon
      const icon = scene.add.text(cx - screenW / 2 + 20, iy, item.icon, {
        fontSize: '14px',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
      this.objects.push(icon);

      // Name
      const name = scene.add.text(cx - screenW / 2 + 44, iy - 6, item.name, {
        fontFamily: FONT, fontSize: '7px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
      this.objects.push(name);

      // Description
      const desc = scene.add.text(cx - screenW / 2 + 44, iy + 8, item.description, {
        fontFamily: FONT, fontSize: '5px', color: '#888888',
        wordWrap: { width: screenW - 70 },
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
      this.objects.push(desc);
    }

    // Item count at bottom
    const countText = scene.add.text(cx, cy + screenH / 2 - 30, `${items.length} item${items.length !== 1 ? 's' : ''}`, {
      fontFamily: FONT, fontSize: '6px', color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    this.objects.push(countText);
  }

  // ── Placeholder Screen ───────────────────────────────────────

  private static buildPlaceholderScreen(app: AppDef, cx: number, cy: number, _screenW: number, _screenH: number, _statusY: number) {
    if (!this.scene) return;
    const scene = this.scene;

    // Big emoji
    const bigIcon = scene.add.text(cx, cy - 20, app.icon, {
      fontSize: '32px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    this.objects.push(bigIcon);

    // Coming soon text
    const soon = scene.add.text(cx, cy + 20, 'Coming soon', {
      fontFamily: FONT, fontSize: '8px', color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    this.objects.push(soon);

    // Subtle pulse on the icon
    scene.tweens.add({
      targets: bigIcon,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
