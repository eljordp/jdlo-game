// ── Inventory UI ─────────────────────────────────────────────────
// Press I or TAB to open. Shows items, crafting, and item usage.
// Redesigned: bigger cells, readable text, product-page detail popup.

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InventorySystem, CraftRecipe } from './InventorySystem';
import { MoodSystem } from './MoodSystem';
import { SoundEffects } from './SoundEffects';
import { virtualInput } from '../../components/GameCanvas';

// ── Smoke Animation (reused when using preroll/cart) ─────────────

function playSmokeAnimation(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, big: boolean) {
  const baseY = player.y;
  const baseAngle = player.angle;
  const dur = big ? 500 : 300;
  const holdDur = big ? 300 : 0;
  const puffCount = big ? 7 : 4;
  const color = big ? 0x80c060 : 0xcccccc;

  scene.tweens.add({
    targets: player,
    angle: baseAngle - (big ? 10 : 8),
    y: baseY - (big ? 3 : 2),
    duration: dur,
    hold: holdDur,
    yoyo: true,
    ease: 'Sine.easeInOut',
  });

  const delay = big ? 900 : 350;
  scene.time.delayedCall(delay, () => {
    for (let i = 0; i < puffCount; i++) {
      scene.time.delayedCall(i * (big ? 100 : 120), () => {
        const puff = scene.add.circle(
          player.x + (Math.random() * 12 - 6),
          player.y - 28,
          (big ? 4 : 3) + Math.random() * (big ? 3 : 2),
          color, big ? 0.55 : 0.5,
        ).setDepth(player.depth + 1);
        scene.tweens.add({
          targets: puff,
          y: puff.y - (big ? 40 : 30) - Math.random() * (big ? 20 : 15),
          x: puff.x + Math.random() * 16 - 8,
          alpha: 0,
          scaleX: 2.5,
          scaleY: 2.5,
          duration: (big ? 1000 : 800) + Math.random() * 500,
          onComplete: () => puff.destroy(),
        });
      });
    }
  });
}

// ── Item effect descriptions for the product page ────────────────

const ITEM_EFFECTS: Record<string, string> = {
  cart: 'Hit the blinker. Instant faded.\nNo lighter needed.',
  eighth: 'Raw flower. Roll it up with papers\nor pack a bowl.',
  papers: 'RAW blacks. Combine with an eighth\nto roll a preroll.',
  lighter: 'Bic lighter with limited flicks.\nNeeded to light prerolls and bongs.',
  preroll: 'Hand-rolled joint. Light it up\nfor a long, smooth high.',
  bong: 'Fat rips. Hits way harder than\na preroll. Needs a lighter.',
  za: 'Loose za. Pack a bowl with it\nor save it for later.',
};

// ── Inventory UI System ──────────────────────────────────────────

export class InventoryUI {
  private static scene: Phaser.Scene | null = null;
  private static player: Phaser.GameObjects.Sprite | null = null;
  private static isOpen = false;
  private static uiObjects: Phaser.GameObjects.GameObject[] = [];
  private static detailObjects: Phaser.GameObjects.GameObject[] = [];
  private static iKey: Phaser.Input.Keyboard.Key | null = null;
  private static escKey: Phaser.Input.Keyboard.Key | null = null;
  private static selectedIndex = 0;
  private static detailOpen = false;
  private static unsubscribe: (() => void) | null = null;
  private static keyCleanup: (() => void) | null = null;

  /** Scene can set this to intercept item use. Return false to cancel. */
  static onBeforeUse: ((itemId: string) => boolean) | null = null;

  static init(scene: Phaser.Scene) {
    this.scene = scene;
    this.player = (scene as unknown as { player: Phaser.GameObjects.Sprite }).player;
    this.isOpen = false;
    this.detailOpen = false;
    this.uiObjects = [];
    this.detailObjects = [];
    this.selectedIndex = 0;

    this.iKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.iKey.on('down', () => this.toggle());

    scene.events.on('update', () => {
      if (virtualInput.inventoryJustPressed) {
        virtualInput.inventoryJustPressed = false;
        this.toggle();
      }
      if (virtualInput.cancelJustPressed && (this.isOpen || this.detailOpen)) {
        virtualInput.cancelJustPressed = false;
        if (this.detailOpen) this.closeDetail();
        else this.close();
      }
    });

    this.unsubscribe = InventorySystem.onChange(() => {
      if (this.isOpen && !this.detailOpen) this.render();
    });
  }

  static destroy() {
    if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
  }

  private static toggle() {
    if (this.detailOpen) { this.closeDetail(); return; }
    if (this.isOpen) this.close();
    else this.open();
  }

  private static open() {
    if (!this.scene || this.isOpen) return;
    this.isOpen = true;
    this.detailOpen = false;
    this.selectedIndex = 0;

    const baseScene = this.scene as unknown as { frozen: boolean };
    baseScene.frozen = true;

    this.render();
  }

  static close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.detailOpen = false;
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }
    this.clearUI();
    this.clearDetail();

    if (this.scene) {
      const baseScene = this.scene as unknown as { frozen: boolean };
      baseScene.frozen = false;
    }
  }

  private static clearUI() {
    for (const obj of this.uiObjects) {
      if (obj && obj.active) obj.destroy();
    }
    this.uiObjects = [];
  }

  private static clearDetail() {
    for (const obj of this.detailObjects) {
      if (obj && obj.active) obj.destroy();
    }
    this.detailObjects = [];
  }

  // ── Main Grid View ─────────────────────────────────────────────

  private static render() {
    this.clearUI();
    this.clearDetail();
    this.detailOpen = false;
    if (!this.scene) return;

    const scene = this.scene;
    const items = InventorySystem.getItems();
    const recipes = InventorySystem.getRecipes();

    // ── Overlay ──
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8,
    ).setScrollFactor(0).setDepth(500).setInteractive();
    this.uiObjects.push(overlay);
    overlay.on('pointerdown', () => this.close());

    // ── Panel ──
    const panelW = 820;
    const panelH = 620;
    const px = GAME_WIDTH / 2;
    const py = GAME_HEIGHT / 2;

    this.uiObjects.push(
      scene.add.rectangle(px, py, panelW, panelH, 0x12121e, 0.97)
        .setScrollFactor(0).setDepth(501).setStrokeStyle(2, 0x3a3a5e),
    );

    // Title
    this.uiObjects.push(
      scene.add.text(px, py - panelH / 2 + 32, 'INVENTORY', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
    );

    // Hint
    this.uiObjects.push(
      scene.add.text(px, py - panelH / 2 + 60, 'Click an item to inspect  |  I to close', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#555555',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
    );

    // ── Items Grid — bigger cells ──
    const gridLeft = px - panelW / 2 + 40;
    const gridTop = py - panelH / 2 + 90;
    const cellW = 140;
    const cellH = 120;
    const cols = 5;

    if (items.length === 0) {
      this.uiObjects.push(
        scene.add.text(px, gridTop + 80, 'Nothing in your pockets.', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#444444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridLeft + col * cellW + cellW / 2;
      const cy = gridTop + row * cellH + cellH / 2;

      // Cell bg
      const cellBg = scene.add.rectangle(cx, cy, cellW - 10, cellH - 10,
        0x1a1a30, 0.95,
      ).setScrollFactor(0).setDepth(502)
        .setStrokeStyle(2, 0x2a2a4e)
        .setInteractive({ useHandCursor: true });
      this.uiObjects.push(cellBg);

      // Big icon
      this.uiObjects.push(
        scene.add.text(cx, cy - 20, item.icon, {
          fontSize: '32px',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503),
      );

      // Name — bigger, readable
      this.uiObjects.push(
        scene.add.text(cx, cy + 18, item.name, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '10px',
          color: '#cccccc',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503),
      );

      // Quantity badge
      if (item.quantity > 1) {
        this.uiObjects.push(
          scene.add.text(cx + cellW / 2 - 18, cy - cellH / 2 + 12, `x${item.quantity}`, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#f0c040',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
        );
      }

      // Durability bar (lighter)
      if (item.maxUses > 0) {
        const barW = 50;
        const barH = 6;
        const barX = cx - barW / 2;
        const barY = cy + 36;
        const pct = item.uses / item.maxUses;
        const barColor = pct > 0.3 ? 0x40c060 : pct > 0 ? 0xf0a030 : 0xf04040;

        this.uiObjects.push(
          scene.add.rectangle(cx, barY, barW, barH, 0x222233)
            .setScrollFactor(0).setDepth(503),
        );
        if (pct > 0) {
          this.uiObjects.push(
            scene.add.rectangle(barX + (barW * pct) / 2, barY, barW * pct, barH, barColor)
              .setScrollFactor(0).setDepth(504),
          );
        }
      }

      // Hover effect
      cellBg.on('pointerover', () => {
        cellBg.setStrokeStyle(2, 0xf0c040);
        cellBg.setFillStyle(0x252540, 0.95);
      });
      cellBg.on('pointerout', () => {
        cellBg.setStrokeStyle(2, 0x2a2a4e);
        cellBg.setFillStyle(0x1a1a30, 0.95);
      });

      // Click → open product page
      cellBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.selectedIndex = i;
        this.openDetail();
      });
    }

    // ── Crafting hint at bottom ──
    const availableRecipes = recipes.filter(r => InventorySystem.canCraft(r.id));
    if (availableRecipes.length > 0) {
      const craftY = py + panelH / 2 - 40;
      this.uiObjects.push(
        scene.add.rectangle(px, craftY - 10, panelW - 60, 1, 0x3a3a5e)
          .setScrollFactor(0).setDepth(502),
      );

      const recipe = availableRecipes[0];
      const inputNames = recipe.inputs.map(inp => {
        const cat = InventorySystem.getCatalogItem(inp.itemId);
        return `${cat ? cat.icon : ''} ${cat ? cat.name : inp.itemId} x${inp.qty}`;
      }).join(' + ');
      const outCat = InventorySystem.getCatalogItem(recipe.output.itemId);
      const outputName = outCat ? `${outCat.icon} ${outCat.name}` : recipe.output.itemId;

      this.uiObjects.push(
        scene.add.text(px - 120, craftY, `${inputNames}  \u2192  ${outputName}`, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#aaaaaa',
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(502),
      );

      const craftBtn = scene.add.rectangle(px + panelW / 2 - 100, craftY, 110, 34, 0x4060c0)
        .setScrollFactor(0).setDepth(503).setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x6080e0);
      this.uiObjects.push(craftBtn);

      this.uiObjects.push(
        scene.add.text(px + panelW / 2 - 100, craftY, 'CRAFT', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
      );

      craftBtn.on('pointerover', () => craftBtn.setFillStyle(0x5080e0));
      craftBtn.on('pointerout', () => craftBtn.setFillStyle(0x4060c0));
      craftBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        if (InventorySystem.craft(recipe.id)) {
          SoundEffects.playBlip();
        }
      });
    }

    // ── Keyboard ──
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }

    const leftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const enterKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const onLeft = () => { if (this.selectedIndex > 0) { this.selectedIndex--; } };
    const onRight = () => { if (this.selectedIndex < items.length - 1) { this.selectedIndex++; } };
    const onEnter = () => { if (items.length > 0) this.openDetail(); };
    const onEsc = () => { this.close(); };

    leftKey.on('down', onLeft);
    rightKey.on('down', onRight);
    enterKey.on('down', onEnter);
    this.escKey!.on('down', onEsc);

    this.keyCleanup = () => {
      leftKey.off('down', onLeft);
      rightKey.off('down', onRight);
      enterKey.off('down', onEnter);
      this.escKey!.off('down', onEsc);
    };
  }

  // ── Product Page Detail Card ───────────────────────────────────

  private static openDetail() {
    if (!this.scene) return;
    const items = InventorySystem.getItems();
    if (this.selectedIndex >= items.length) return;

    this.detailOpen = true;
    this.clearDetail();

    const scene = this.scene;
    const item = items[this.selectedIndex];
    const effects = ITEM_EFFECTS[item.id] || item.description;

    const px = GAME_WIDTH / 2;
    const py = GAME_HEIGHT / 2;
    const cardW = 480;
    const cardH = 420;

    // Dim background (on top of inventory)
    const dimBg = scene.add.rectangle(px, py, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(510).setInteractive();
    this.detailObjects.push(dimBg);
    dimBg.on('pointerdown', () => this.closeDetail());

    // Card
    const card = scene.add.rectangle(px, py, cardW, cardH, 0x141428, 0.98)
      .setScrollFactor(0).setDepth(511).setStrokeStyle(2, 0xf0c040)
      .setInteractive();
    this.detailObjects.push(card);
    card.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });

    // Big icon
    this.detailObjects.push(
      scene.add.text(px, py - cardH / 2 + 60, item.icon, {
        fontSize: '56px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
    );

    // Name
    this.detailObjects.push(
      scene.add.text(px, py - cardH / 2 + 110, item.name.toUpperCase(), {
        fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
    );

    // Description
    this.detailObjects.push(
      scene.add.text(px, py - cardH / 2 + 142, item.description, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
    );

    // Divider
    this.detailObjects.push(
      scene.add.rectangle(px, py - cardH / 2 + 165, cardW - 60, 1, 0x3a3a5e)
        .setScrollFactor(0).setDepth(512),
    );

    // Effects / what it does
    this.detailObjects.push(
      scene.add.text(px, py - cardH / 2 + 185, 'EFFECTS', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
    );

    this.detailObjects.push(
      scene.add.text(px, py - cardH / 2 + 215, effects, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#aaaaaa',
        align: 'center', lineSpacing: 6,
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(512),
    );

    // Stats row
    const statsY = py + 40;
    // Quantity
    this.detailObjects.push(
      scene.add.text(px - 100, statsY, `QTY: ${item.quantity}`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#60c060',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
    );

    // Durability
    if (item.maxUses > 0) {
      const pct = item.uses / item.maxUses;
      const durColor = pct > 0.3 ? '#60c060' : pct > 0 ? '#f0a030' : '#f04040';
      this.detailObjects.push(
        scene.add.text(px + 100, statsY, `USES: ${item.uses}/${item.maxUses}`, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: durColor,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
      );
    }

    // Requirement
    if (item.requiresForUse) {
      const hasReq = InventorySystem.hasUses(item.requiresForUse);
      const reqItem = InventorySystem.getCatalogItem(item.requiresForUse);
      const reqName = reqItem ? reqItem.name : item.requiresForUse;
      this.detailObjects.push(
        scene.add.text(px, statsY + 24, `Requires: ${reqName} ${hasReq ? '\u2705' : '\u274C'}`, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px',
          color: hasReq ? '#60c060' : '#f04040',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(512),
      );
    }

    // ── Buttons ──
    const btnY = py + cardH / 2 - 50;

    // USE button
    if (item.usable) {
      const canUse = InventorySystem.canUse(item.id);
      const btnColor = canUse ? 0x30a040 : 0x333340;

      const useBtn = scene.add.rectangle(px - 70, btnY, 140, 44, btnColor)
        .setScrollFactor(0).setDepth(513).setInteractive({ useHandCursor: canUse })
        .setStrokeStyle(1, canUse ? 0x40c050 : 0x444455);
      this.detailObjects.push(useBtn);

      this.detailObjects.push(
        scene.add.text(px - 70, btnY, canUse ? 'USE' : 'LOCKED', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '14px',
          color: canUse ? '#ffffff' : '#555555',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(514),
      );

      if (canUse) {
        useBtn.on('pointerover', () => useBtn.setFillStyle(0x40c050));
        useBtn.on('pointerout', () => useBtn.setFillStyle(0x30a040));
        useBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          this.useSelectedItem();
        });
      }
    }

    // BACK button
    const backBtn = scene.add.rectangle(px + 70, btnY, 140, 44, 0x333340)
      .setScrollFactor(0).setDepth(513).setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x555566);
    this.detailObjects.push(backBtn);

    this.detailObjects.push(
      scene.add.text(px + 70, btnY, 'BACK', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#aaaaaa',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(514),
    );

    backBtn.on('pointerover', () => backBtn.setFillStyle(0x444455));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333340));
    backBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.closeDetail();
    });

    // Keyboard: U to use, ESC/I to go back
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }
    const uKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    const onU = () => this.useSelectedItem();
    const onEscDetail = () => this.closeDetail();
    uKey.on('down', onU);
    this.escKey!.on('down', onEscDetail);
    this.iKey!.on('down', onEscDetail);
    this.keyCleanup = () => {
      uKey.off('down', onU);
      this.escKey!.off('down', onEscDetail);
      this.iKey!.off('down', onEscDetail);
    };
  }

  private static closeDetail() {
    this.detailOpen = false;
    this.clearDetail();
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }
    // Re-render the grid
    this.render();
  }

  // ── Use Item ───────────────────────────────────────────────────

  private static useSelectedItem() {
    if (!this.scene || !this.player) return;
    const items = InventorySystem.getItems();
    if (this.selectedIndex >= items.length) return;

    const item = items[this.selectedIndex];
    if (!item.usable || !InventorySystem.canUse(item.id)) return;

    // Let scene intercept (e.g. Mom catches you smoking inside)
    if (this.onBeforeUse && !this.onBeforeUse(item.id)) {
      this.close();
      return;
    }

    if (InventorySystem.useItem(item.id)) {
      SoundEffects.playBlip();
      this.close();

      const scene = this.scene;
      const player = this.player;
      const baseScene = scene as unknown as { frozen: boolean };
      baseScene.frozen = true;

      // Import SubstanceSystem for proper tracking
      let SubSys: { hit: (p: number) => void } | null = null;
      try { SubSys = require('./SubstanceSystem').SubstanceSystem; } catch { /* not available */ }

      let duration = 1000;
      if (item.id === 'preroll') {
        playSmokeAnimation(scene, player, true);
        if (SubSys) SubSys.hit(1); else MoodSystem.setMood('faded', 90);
        duration = 1500;
      } else if (item.id === 'cart') {
        playSmokeAnimation(scene, player, false);
        if (SubSys) SubSys.hit(3); else {
          if (MoodSystem.isFaded()) MoodSystem.extendMood(60);
          else MoodSystem.setMood('faded', 60);
        }
        duration = 1000;
      } else if (item.id === 'bong') {
        playSmokeAnimation(scene, player, true);
        if (SubSys) SubSys.hit(2); else MoodSystem.setMood('faded', 120);
        duration = 1500;
      }

      scene.time.delayedCall(duration, () => {
        baseScene.frozen = false;
      });
    }
  }
}
