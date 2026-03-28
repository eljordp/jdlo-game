import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InventorySystem } from './InventorySystem';
import { BalanceSystem } from './BalanceSystem';
import { virtualInput } from '../../components/GameCanvas';

// ── Phone System (Singleton) ────────────────────────────────────
// iPhone 16-style phone overlay. Opens with P or TAB.
// Shows apps: Inventory, Messages, Instagram, Call, Photos, Music.

interface AppDef {
  id: string;
  name: string;
  icon: string;
  color: number;
}

// Home screen apps (NOT in dock — these are the grid apps)
const APPS: AppDef[] = [
  { id: 'instagram', name: 'Instagram', icon: '\u{1F4F7}', color: 0xc13584 },
  { id: 'photos',    name: 'Photos',    icon: '\u{1F5BC}\u{FE0F}', color: 0xff9500 },
  { id: 'calculator',name: 'Calculator', icon: '\u{1F5A9}', color: 0x1c1c1e },
  { id: 'weather',   name: 'Weather',   icon: '\u{2600}\u{FE0F}', color: 0x5ac8fa },
  { id: 'settings',  name: 'Settings',  icon: '\u{2699}\u{FE0F}', color: 0x8e8e93 },
  { id: 'health',    name: 'Health',    icon: '\u{2764}\u{FE0F}', color: 0xff2d55 },
  { id: 'wallet',    name: 'Wallet',    icon: '\u{1F4B3}', color: 0x1c1c1e },
  { id: 'camera',    name: 'Camera',    icon: '\u{1F4F8}', color: 0x636366 },
];

// Dock apps (bottom 4 — iPhone essentials)
const DOCK_APPS: AppDef[] = [
  { id: 'call',      name: '',  icon: '\u{1F4DE}', color: 0x34c759 },
  { id: 'messages',  name: '',  icon: '\u{1F4AC}', color: 0x34c759 },
  { id: 'safari',    name: '',  icon: '\u{1F310}', color: 0x007aff },
  { id: 'music',     name: '',  icon: '\u{1F3B5}', color: 0xff2d55 },
];

// Phone dimensions
const PHONE_W = 240;
const PHONE_H = 420;
const BORDER = 4;
const NOTCH_W = 70;
const NOTCH_H = 16;
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

    // Mobile: poll virtualInput for phone button
    scene.events.on('update', () => {
      if (virtualInput.phoneJustPressed) {
        virtualInput.phoneJustPressed = false;
        this.toggle();
      }
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

    // Outer body (border) — titanium frame
    const outerBody = scene.add.rectangle(cx, cy, PHONE_W + BORDER * 2, PHONE_H + BORDER * 2, 0x2a2a30)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 1);
    phoneObjects.push(outerBody);

    // Inner body
    const innerBody = scene.add.rectangle(cx, cy, PHONE_W, PHONE_H, 0x0e0e12)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 2);
    phoneObjects.push(innerBody);

    // Screen area (slightly inset)
    const screenX = cx;
    const screenY = cy;
    const screenW = PHONE_W - 12;
    const screenH = PHONE_H - 32;
    const screen = scene.add.rectangle(screenX, screenY, screenW, screenH, 0x0c0c1a)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 3);
    phoneObjects.push(screen);

    // Wallpaper gradient layers (subtle purple-blue gradient)
    const gradientSteps = 6;
    for (let i = 0; i < gradientSteps; i++) {
      const t = i / gradientSteps;
      const gy = screenY - screenH / 2 + t * screenH;
      const gh = screenH / gradientSteps + 1;
      const r = Math.floor(0x10 + t * 0x08);
      const g = Math.floor(0x08 + t * 0x0c);
      const b = Math.floor(0x20 + (1 - t) * 0x18);
      const color = (r << 16) | (g << 8) | b;
      const grad = scene.add.rectangle(screenX, gy + gh / 2, screenW, gh, color, 0.6)
        .setScrollFactor(0).setDepth(DEPTH_BASE + 3);
      phoneObjects.push(grad);
    }

    // Dynamic Island (notch) — pill shape via two circles + rect
    const notchY = cy - PHONE_H / 2 + 24;
    const notch = scene.add.rectangle(cx, notchY, NOTCH_W, NOTCH_H, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(notch);
    // Round ends
    const notchL = scene.add.circle(cx - NOTCH_W / 2, notchY, NOTCH_H / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(notchL);
    const notchR = scene.add.circle(cx + NOTCH_W / 2, notchY, NOTCH_H / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(notchR);

    // Home indicator
    const homeInd = scene.add.rectangle(cx, cy + PHONE_H / 2 - 10, HOME_IND_W, HOME_IND_H, 0xffffff, 0.5)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 4);
    phoneObjects.push(homeInd);

    // Status bar
    const statusY = cy - PHONE_H / 2 + 46;

    const carrier = scene.add.text(cx - screenW / 2 + 12, statusY, 'JDLO', {
      fontFamily: FONT, fontSize: '7px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(carrier);

    // Signal dots
    const sigX = cx - screenW / 2 + 48;
    for (let i = 0; i < 4; i++) {
      const dot = scene.add.circle(sigX + i * 6, statusY, 2, 0xffffff, i < 3 ? 0.9 : 0.3)
        .setScrollFactor(0).setDepth(DEPTH_BASE + 5);
      phoneObjects.push(dot);
    }

    const timeText = scene.add.text(cx, statusY, '4:20 PM', {
      fontFamily: FONT, fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(timeText);

    // Battery indicator (icon-style)
    const batX = cx + screenW / 2 - 20;
    const batBody = scene.add.rectangle(batX, statusY, 16, 8, 0x000000, 0)
      .setStrokeStyle(1, 0x34c759).setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(batBody);
    const batFill = scene.add.rectangle(batX - 2, statusY, 11, 5, 0x34c759)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(batFill);
    const batTip = scene.add.rectangle(batX + 9, statusY, 2, 4, 0x34c759, 0.5)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    phoneObjects.push(batTip);

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

    // === iOS-style layout ===
    const iconSize = 38;
    const cols = 4;
    const gapX = (screenW - 20) / cols;
    const gapY = 58;
    const gridStartX = cx - screenW / 2 + 10 + gapX / 2;
    const gridStartY = statusY + 50;

    // App grid — 4 columns, main apps
    for (let i = 0; i < APPS.length; i++) {
      const app = APPS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ax = gridStartX + col * gapX;
      const ay = gridStartY + row * gapY;

      this.buildAppIcon(scene, ax, ay, iconSize, app, cx, cy, screenW, screenH, statusY);
    }

    // === iOS Dock — frosted glass bar at bottom with 4 pinned apps ===
    const dockY = cy + screenH / 2 - 38;
    const dockH = 52;

    // Dock background (frosted glass)
    const dockBg = scene.add.rectangle(cx, dockY, screenW - 8, dockH, 0x2a2a40, 0.6)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    this.objects.push(dockBg);
    // Dock top highlight
    this.objects.push(scene.add.rectangle(cx, dockY - dockH / 2, screenW - 12, 1, 0xffffff, 0.06)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 5));

    // Dock apps (4 pinned — Phone, Messages, Safari, Music)
    const dockGapX = (screenW - 30) / 4;
    const dockStartX = cx - screenW / 2 + 15 + dockGapX / 2;
    for (let i = 0; i < DOCK_APPS.length; i++) {
      const app = DOCK_APPS[i];
      const dx = dockStartX + i * dockGapX;
      this.buildAppIcon(scene, dx, dockY, iconSize - 4, app, cx, cy, screenW, screenH, statusY);
    }

    // === Balance widget — iOS widget style ===
    const widgetY = gridStartY + Math.ceil(APPS.length / cols) * gapY + 10;
    const widgetW = screenW - 24;
    const widgetH = 50;

    // Widget background (rounded card look)
    const widgetBg = scene.add.rectangle(cx, widgetY, widgetW, widgetH, 0x1c1c2e, 0.8)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 5).setStrokeStyle(1, 0x3a3a5e, 0.3);
    this.objects.push(widgetBg);

    this.objects.push(scene.add.text(cx - widgetW / 2 + 12, widgetY - 12, 'Wallet', {
      fontFamily: FONT, fontSize: '6px', color: '#8888aa',
    }).setScrollFactor(0).setDepth(DEPTH_BASE + 7));

    const balanceValue = scene.add.text(cx - widgetW / 2 + 12, widgetY + 4, BalanceSystem.formatted(), {
      fontFamily: FONT, fontSize: '11px', color: '#50e070',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
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
    const frameCount = 23; // overlay + phone frame objects (body, screen, gradient, notch, status bar)
    const contentObjects = this.objects.splice(frameCount);
    for (const obj of contentObjects) {
      if (obj && obj.active) obj.destroy();
    }
  }

  private static buildAppIcon(scene: Phaser.Scene, ax: number, ay: number, size: number, app: AppDef, cx: number, cy: number, screenW: number, screenH: number, statusY: number) {
    // iOS squircle icon with rounded corners + gradient
    const r = Math.floor(size * 0.22); // iOS corner radius ~22% of size
    const half = size / 2;

    // Drop shadow (rounded rect) — positioned at icon center so scale works from center
    const shadow = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH_BASE + 5);
    shadow.setPosition(ax, ay);
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillRoundedRect(-half + 1, -half + 2, size, size, r);
    this.objects.push(shadow);

    // Main icon background (rounded rect) — draw relative to (0,0), position at center
    const iconGfx = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH_BASE + 6);
    iconGfx.setPosition(ax, ay);
    iconGfx.fillStyle(app.color, 1);
    iconGfx.fillRoundedRect(-half, -half, size, size, r);

    // iOS gradient: lighter top → darker bottom
    const baseR = (app.color >> 16) & 0xff;
    const baseG = (app.color >> 8) & 0xff;
    const baseB = app.color & 0xff;
    // Top highlight band
    const lightR = Math.min(255, baseR + 40);
    const lightG = Math.min(255, baseG + 40);
    const lightB = Math.min(255, baseB + 40);
    const lightColor = (lightR << 16) | (lightG << 8) | lightB;
    iconGfx.fillStyle(lightColor, 0.35);
    iconGfx.fillRoundedRect(-half, -half, size, size * 0.5, { tl: r, tr: r, bl: 0, br: 0 });
    // Bottom darken band
    const darkR = Math.max(0, baseR - 30);
    const darkG = Math.max(0, baseG - 30);
    const darkB = Math.max(0, baseB - 30);
    const darkColor = (darkR << 16) | (darkG << 8) | darkB;
    iconGfx.fillStyle(darkColor, 0.25);
    iconGfx.fillRoundedRect(-half, 0, size, size * 0.5, { tl: 0, tr: 0, bl: r, br: r });
    // Glass sheen (subtle white bar at top)
    iconGfx.fillStyle(0xffffff, 0.12);
    iconGfx.fillRoundedRect(-half + 3, -half + 2, size - 6, size * 0.3, { tl: r - 2, tr: r - 2, bl: 0, br: 0 });
    // Subtle border for dark icons so they don't vanish into background
    const brightness = baseR + baseG + baseB;
    if (brightness < 150) {
      iconGfx.lineStyle(1, 0x444466, 0.5);
      iconGfx.strokeRoundedRect(-half, -half, size, size, r);
    }
    this.objects.push(iconGfx);

    // Hit area for interaction (invisible rect over the icon)
    const iconBg = scene.add.rectangle(ax, ay, size, size, 0x000000, 0)
      .setScrollFactor(0).setDepth(DEPTH_BASE + 6).setInteractive({ useHandCursor: true });
    this.objects.push(iconBg);

    // Emoji
    const iconText = scene.add.text(ax, ay, app.icon, {
      fontSize: String(Math.floor(size * 0.5)) + 'px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_BASE + 7);
    this.objects.push(iconText);

    // Label (only if name provided)
    if (app.name) {
      this.objects.push(scene.add.text(ax, ay + size / 2 + 6, app.name, {
        fontFamily: FONT, fontSize: '4px', color: '#cccccc',
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH_BASE + 7));
    }

    // Hover — scale the graphics + emoji + hitbox together
    iconBg.on('pointerover', () => { iconGfx.setScale(1.1); iconText.setScale(1.1); iconBg.setScale(1.1); });
    iconBg.on('pointerout', () => { iconGfx.setScale(1); iconText.setScale(1); iconBg.setScale(1); });

    // Click
    iconBg.on('pointerdown', () => {
      this.openApp(app, cx, cy, screenW, screenH, statusY);
    });
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
