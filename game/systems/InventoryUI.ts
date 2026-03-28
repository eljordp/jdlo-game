// ── Inventory UI ─────────────────────────────────────────────────
// Press I or TAB to open. Shows items, crafting, and item usage.
// Separate from EmoteSystem (emotes = animations, inventory = items/actions).

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InventorySystem, CraftRecipe } from './InventorySystem';
import { MoodSystem } from './MoodSystem';
import { SoundEffects } from './SoundEffects';

// ── Smoke Animation (reused when using preroll/cart) ─────────────

function playSmokeAnimation(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, big: boolean) {
  const baseY = player.y;
  const baseAngle = player.angle;
  const dur = big ? 500 : 300;
  const holdDur = big ? 300 : 0;
  const puffCount = big ? 7 : 4;
  const color = big ? 0x80c060 : 0xcccccc;

  // Head tilt back
  scene.tweens.add({
    targets: player,
    angle: baseAngle - (big ? 10 : 8),
    y: baseY - (big ? 3 : 2),
    duration: dur,
    hold: holdDur,
    yoyo: true,
    ease: 'Sine.easeInOut',
  });

  // Smoke puffs after inhale
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

// ── Inventory UI System ──────────────────────────────────────────

export class InventoryUI {
  private static scene: Phaser.Scene | null = null;
  private static player: Phaser.GameObjects.Sprite | null = null;
  private static isOpen = false;
  private static uiObjects: Phaser.GameObjects.GameObject[] = [];
  private static iKey: Phaser.Input.Keyboard.Key | null = null;
  private static escKey: Phaser.Input.Keyboard.Key | null = null;
  private static selectedIndex = 0;
  private static unsubscribe: (() => void) | null = null;
  private static keyCleanup: (() => void) | null = null;

  /** Scene can set this to intercept item use. Return false to cancel. */
  static onBeforeUse: ((itemId: string) => boolean) | null = null;

  static init(scene: Phaser.Scene) {
    this.scene = scene;
    this.player = (scene as unknown as { player: Phaser.GameObjects.Sprite }).player;
    this.isOpen = false;
    this.uiObjects = [];
    this.selectedIndex = 0;

    this.iKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.iKey.on('down', () => this.toggle());

    // Listen for inventory changes to re-render
    this.unsubscribe = InventorySystem.onChange(() => {
      if (this.isOpen) this.render();
    });
  }

  static destroy() {
    if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
  }

  private static toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  private static open() {
    if (!this.scene || this.isOpen) return;
    this.isOpen = true;
    this.selectedIndex = 0;

    const baseScene = this.scene as unknown as { frozen: boolean };
    baseScene.frozen = true;

    this.render();
  }

  static close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }
    this.clearUI();

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

  private static render() {
    this.clearUI();
    if (!this.scene) return;

    const scene = this.scene;
    const items = InventorySystem.getItems();
    const recipes = InventorySystem.getRecipes();

    // ── Overlay ──
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75,
    ).setScrollFactor(0).setDepth(500).setInteractive();
    this.uiObjects.push(overlay);

    // ── Panel ──
    const panelW = 700;
    const panelH = 560;
    const px = GAME_WIDTH / 2;
    const py = GAME_HEIGHT / 2;

    // Background
    this.uiObjects.push(
      scene.add.rectangle(px, py, panelW, panelH, 0x1a1a2e, 0.95)
        .setScrollFactor(0).setDepth(501).setStrokeStyle(2, 0x3a3a5e),
    );

    // Title
    this.uiObjects.push(
      scene.add.text(px, py - panelH / 2 + 28, 'INVENTORY', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
    );

    // Hint
    this.uiObjects.push(
      scene.add.text(px, py - panelH / 2 + 52, 'I to close  |  Click to select  |  U to use  |  C to craft', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
    );

    // ── Items Grid ──
    const gridLeft = px - panelW / 2 + 30;
    const gridTop = py - panelH / 2 + 80;
    const cellW = 100;
    const cellH = 80;
    const cols = 6;

    if (items.length === 0) {
      this.uiObjects.push(
        scene.add.text(px, gridTop + 60, 'Nothing in your pockets.', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#555555',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(502),
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridLeft + col * cellW + cellW / 2;
      const cy = gridTop + row * cellH + cellH / 2;
      const isSelected = i === this.selectedIndex;

      // Cell bg
      const cellBg = scene.add.rectangle(cx, cy, cellW - 8, cellH - 8,
        isSelected ? 0x2a2a4e : 0x141428, 0.9,
      ).setScrollFactor(0).setDepth(502)
        .setStrokeStyle(2, isSelected ? 0xf0c040 : 0x2a2a3e)
        .setInteractive({ useHandCursor: true });
      this.uiObjects.push(cellBg);

      // Icon
      this.uiObjects.push(
        scene.add.text(cx, cy - 14, item.icon, {
          fontSize: '20px',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503),
      );

      // Name
      this.uiObjects.push(
        scene.add.text(cx, cy + 10, item.name, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px',
          color: isSelected ? '#ffffff' : '#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503),
      );

      // Quantity badge
      if (item.quantity > 1) {
        this.uiObjects.push(
          scene.add.text(cx + cellW / 2 - 14, cy - cellH / 2 + 8, `x${item.quantity}`, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#f0c040',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
        );
      }

      // Uses badge (lighter)
      if (item.maxUses > 0) {
        const usesColor = item.uses > 3 ? '#60c060' : item.uses > 0 ? '#f0a030' : '#f04040';
        this.uiObjects.push(
          scene.add.text(cx, cy + 24, `${item.uses}/${item.maxUses}`, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: usesColor,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
        );
      }

      // Click to select
      cellBg.on('pointerdown', () => {
        this.selectedIndex = i;
        this.render();
      });
      cellBg.on('pointerover', () => cellBg.setStrokeStyle(2, 0xf0c040));
      cellBg.on('pointerout', () => cellBg.setStrokeStyle(2, isSelected ? 0xf0c040 : 0x2a2a3e));
    }

    // ── Selected Item Detail ──
    const detailY = py + 80;

    if (items.length > 0 && this.selectedIndex < items.length) {
      const sel = items[this.selectedIndex];

      // Divider
      this.uiObjects.push(
        scene.add.rectangle(px, detailY - 30, panelW - 60, 1, 0x3a3a5e)
          .setScrollFactor(0).setDepth(502),
      );

      // Name + description
      this.uiObjects.push(
        scene.add.text(px - panelW / 2 + 40, detailY, `${sel.icon}  ${sel.name}`, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#ffffff',
        }).setScrollFactor(0).setDepth(502),
      );

      this.uiObjects.push(
        scene.add.text(px - panelW / 2 + 40, detailY + 22, sel.description, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888888',
        }).setScrollFactor(0).setDepth(502),
      );

      // USE button
      if (sel.usable) {
        const canUse = InventorySystem.canUse(sel.id);
        const btnColor = canUse ? 0x30a040 : 0x404048;
        const useBtn = scene.add.rectangle(px + panelW / 2 - 80, detailY + 10, 100, 32, btnColor)
          .setScrollFactor(0).setDepth(503).setInteractive({ useHandCursor: canUse });
        this.uiObjects.push(useBtn);

        this.uiObjects.push(
          scene.add.text(px + panelW / 2 - 80, detailY + 10, 'USE', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '10px',
            color: canUse ? '#ffffff' : '#666666',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
        );

        if (canUse) {
          useBtn.on('pointerover', () => useBtn.setFillStyle(0x40c050));
          useBtn.on('pointerout', () => useBtn.setFillStyle(0x30a040));
          useBtn.on('pointerdown', () => this.useSelectedItem());
        }

        // Show requirement
        if (sel.requiresForUse && !InventorySystem.hasUses(sel.requiresForUse)) {
          const reqItem = InventorySystem.getCatalogItem(sel.requiresForUse);
          const reqName = reqItem ? reqItem.name : sel.requiresForUse;
          this.uiObjects.push(
            scene.add.text(px + panelW / 2 - 80, detailY + 36, `Need: ${reqName}`, {
              fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#f04040',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(503),
          );
        }
      }
    }

    // ── Crafting Section ──
    const craftY = detailY + 70;
    const availableRecipes = recipes.filter(r => InventorySystem.canCraft(r.id));

    if (availableRecipes.length > 0) {
      this.uiObjects.push(
        scene.add.rectangle(px, craftY - 10, panelW - 60, 1, 0x3a3a5e)
          .setScrollFactor(0).setDepth(502),
      );

      this.uiObjects.push(
        scene.add.text(px - panelW / 2 + 40, craftY + 6, 'CRAFT', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
        }).setScrollFactor(0).setDepth(502),
      );

      for (let i = 0; i < availableRecipes.length; i++) {
        const recipe = availableRecipes[i];
        const ry = craftY + 30 + i * 36;

        // Recipe description
        const inputNames = recipe.inputs.map(inp => {
          const cat = InventorySystem.getCatalogItem(inp.itemId);
          return `${cat ? cat.icon : ''} ${cat ? cat.name : inp.itemId} x${inp.qty}`;
        }).join(' + ');
        const outCat = InventorySystem.getCatalogItem(recipe.output.itemId);
        const outputName = outCat ? `${outCat.icon} ${outCat.name}` : recipe.output.itemId;

        this.uiObjects.push(
          scene.add.text(px - panelW / 2 + 40, ry, `${inputNames}  \u2192  ${outputName}`, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#cccccc',
          }).setScrollFactor(0).setDepth(502),
        );

        // Craft button
        const craftBtn = scene.add.rectangle(px + panelW / 2 - 80, ry + 4, 90, 26, 0x4060c0)
          .setScrollFactor(0).setDepth(503).setInteractive({ useHandCursor: true });
        this.uiObjects.push(craftBtn);

        this.uiObjects.push(
          scene.add.text(px + panelW / 2 - 80, ry + 4, 'CRAFT', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(504),
        );

        craftBtn.on('pointerover', () => craftBtn.setFillStyle(0x5080e0));
        craftBtn.on('pointerout', () => craftBtn.setFillStyle(0x4060c0));
        craftBtn.on('pointerdown', () => {
          if (InventorySystem.craft(recipe.id)) {
            SoundEffects.playBlip();
            // Re-render happens via onChange listener
          }
        });
      }
    }

    // ── Keyboard handlers (clean up old ones first) ──
    if (this.keyCleanup) { this.keyCleanup(); this.keyCleanup = null; }

    const uKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    const cKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    const leftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    const onU = () => { this.useSelectedItem(); };
    const onC = () => {
      const available = recipes.filter(r => InventorySystem.canCraft(r.id));
      if (available.length > 0) {
        if (InventorySystem.craft(available[0].id)) {
          SoundEffects.playBlip();
        }
      }
    };
    const onLeft = () => {
      if (this.selectedIndex > 0) { this.selectedIndex--; this.render(); }
    };
    const onRight = () => {
      if (this.selectedIndex < items.length - 1) { this.selectedIndex++; this.render(); }
    };
    const onEsc = () => { this.close(); };
    const onI = () => { this.close(); };

    uKey.on('down', onU);
    cKey.on('down', onC);
    leftKey.on('down', onLeft);
    rightKey.on('down', onRight);
    this.escKey!.on('down', onEsc);
    this.iKey!.on('down', onI);

    // Store cleanup so close() can remove all listeners
    this.keyCleanup = () => {
      uKey.off('down', onU);
      cKey.off('down', onC);
      leftKey.off('down', onLeft);
      rightKey.off('down', onRight);
      this.escKey!.off('down', onEsc);
      this.iKey!.off('down', onI);
    };

    // Click overlay to close
    overlay.on('pointerdown', () => this.close());
  }

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

    // Use the item
    if (InventorySystem.useItem(item.id)) {
      SoundEffects.playBlip();

      // Close inventory and play action
      this.close();

      const scene = this.scene;
      const player = this.player;
      const baseScene = scene as unknown as { frozen: boolean };
      baseScene.frozen = true;

      // Determine animation based on item
      let duration = 1000;
      if (item.id === 'preroll') {
        playSmokeAnimation(scene, player, true);
        MoodSystem.setMood('faded', 90);
        duration = 1500;
      } else if (item.id === 'cart') {
        playSmokeAnimation(scene, player, false);
        if (MoodSystem.isFaded()) {
          MoodSystem.extendMood(60);
        } else {
          MoodSystem.setMood('faded', 60);
        }
        duration = 1000;
      } else if (item.id === 'bong') {
        playSmokeAnimation(scene, player, true);
        MoodSystem.setMood('faded', 120);
        duration = 1500;
      }

      scene.time.delayedCall(duration, () => {
        baseScene.frozen = false;
      });
    }
  }
}
