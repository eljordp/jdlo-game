import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class HomeScene extends BaseChapterScene {
  private interactionCount = 0;
  private phoneTriggered = false;
  private trackedInteractions = new Set<string>();

  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
    this.requiredInteractionId = 'ch0_nolan_call';
  }

  protected getPlayerTexture(): string {
    return 'player-ch0';
  }

  protected getMusicTrack(): string {
    return ''; // Home is quiet — no synthetic music needed
  }

  create() {
    super.create();
    this.addNavArrow(10, 29, 'Leave home');
  }

  protected getObjectiveHint(): string {
    return 'Explore your house. Talk to family. Leave when ready.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }

  // Override to add computer interface, fetch, goodbye, phone ring
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch0_journal') {
      Analytics.trackInteraction(interactable.id);
      this.showJournal();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_computer') {
      if (this.frozen) return; // prevent re-opening while interface is up
      Analytics.trackInteraction(interactable.id);
      this.showComputerInterface();
      this.trackForPhoneCall(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_frenchie_ball') {
      Analytics.trackInteraction(interactable.id);
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_fishing') {
      Analytics.trackInteraction(interactable.id);
      this.playFishing();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_goodbye') {
      Analytics.trackInteraction(interactable.id);
      this.playGoodbyeCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    this.trackForPhoneCall(interactable.id);
    super.handleInteractable(interactable);
  }

  private trackForPhoneCall(id: string) {
    if (this.phoneTriggered) return;
    if (this.trackedInteractions.has(id)) return;
    this.trackedInteractions.add(id);
    this.interactionCount++;

    // After 4 unique interactions, queue surprise phone call
    if (this.interactionCount >= 4) {
      this.phoneTriggered = true;
      // Wait until player is unfrozen (dialogue finished) before ringing
      const checkReady = () => {
        if (!this.scene.isActive()) return;
        if (this.frozen) {
          // Still in dialogue — check again in 500ms
          this.time.delayedCall(500, checkReady);
        } else {
          // Dialogue done — wait a beat then ring
          this.time.delayedCall(1500, () => {
            if (this.scene.isActive() && !this.frozen) this.triggerPhoneCall();
          });
        }
      };
      this.time.delayedCall(1000, checkReady);
    }
  }

  private triggerPhoneCall() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Vibrate/ring effect — screen shake
    this.cameras.main.shake(200, 0.003);

    // Phone overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Phone body — centered on screen
    const phoneX = GAME_WIDTH / 2;
    const phoneY = GAME_HEIGHT / 2 - 40;
    const phoneW = 200;
    const phoneH = 340;

    // Phone outer body
    const phoneBody = this.add.rectangle(phoneX, phoneY, phoneW, phoneH, 0x1a1a1a)
      .setScrollFactor(0).setDepth(301);
    objects.push(phoneBody);

    // Phone screen
    const phoneScreen = this.add.rectangle(phoneX, phoneY - 20, phoneW - 20, phoneH - 80, 0x0a2040)
      .setScrollFactor(0).setDepth(302);
    objects.push(phoneScreen);

    // Caller name
    const callerName = this.add.text(phoneX, phoneY - 80, 'Nolan', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callerName);

    // "Incoming Call" text
    const callLabel = this.add.text(phoneX, phoneY - 50, 'Incoming Call...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#80a0c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
    objects.push(callLabel);

    // Pulsing ring animation on caller name
    this.tweens.add({
      targets: callerName,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Periodic vibrate
    const vibrateTimer = this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (this.scene.isActive()) this.cameras.main.shake(150, 0.002);
      },
    });

    // Answer button — green
    const btnY = phoneY + phoneH / 2 - 40;
    const answerBtn = this.add.rectangle(phoneX, btnY, 140, 36, 0x30a040)
      .setScrollFactor(0).setDepth(303).setInteractive({ useHandCursor: true });
    objects.push(answerBtn);

    const answerText = this.add.text(phoneX, btnY, 'ANSWER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304);
    objects.push(answerText);

    // Button hover effect
    answerBtn.on('pointerover', () => answerBtn.setFillStyle(0x40c050));
    answerBtn.on('pointerout', () => answerBtn.setFillStyle(0x30a040));

    // Answer handler
    const answer = () => {
      vibrateTimer.remove();
      answerBtn.off('pointerdown');
      spaceKey.off('down', spaceHandler);

      // Clean up phone UI
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }

      // Nolan dialogue
      this.dialogue.show([
        { speaker: 'Nolan', text: 'Yooo JP! What\'s good bro?' },
        { speaker: 'JP', text: 'Nolan. What\'s up man?' },
        { speaker: 'Nolan', text: 'Bro. This weekend. Santa Barbara. You gotta come.' },
        { speaker: 'Nolan', text: 'We got the frat house, the beach, the whole thing.' },
        { speaker: 'JP', text: 'Who\'s going?' },
        { speaker: 'Nolan', text: 'Everyone bro. David, Cooper, Terrell. Some girls too.' },
        { speaker: 'Nolan', text: 'It\'s gonna be crazy. You in?' },
        { speaker: 'JP', text: '...I\'m in.' },
        { speaker: 'Nolan', text: 'LET\'S GO! I\'ll send you the address. Pack light bro.' },
      ], () => {
        // Mark the required interaction as done
        this.requiredDone = true;
        this.frozen = false;
      });
    };

    answerBtn.on('pointerdown', answer);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const spaceHandler = () => answer();
    spaceKey.on('down', spaceHandler);
  }

  private showJournal() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark overlay
    objects.push(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300));

    // Journal notebook — cream/tan paper
    const bookW = 500;
    const bookH = 440;
    // Leather cover visible on edges
    objects.push(this.add.rectangle(cx, cy, bookW + 16, bookH + 16, 0x5a3a20)
      .setScrollFactor(0).setDepth(301));
    // Spine
    objects.push(this.add.rectangle(cx - bookW / 2 - 4, cy, 8, bookH + 16, 0x4a2a18)
      .setScrollFactor(0).setDepth(302));
    // Paper pages
    objects.push(this.add.rectangle(cx + 4, cy, bookW, bookH, 0xf5edd8)
      .setScrollFactor(0).setDepth(302));

    // Ruled lines
    for (let i = 0; i < 14; i++) {
      const lineY = cy - bookH / 2 + 50 + i * 28;
      objects.push(this.add.rectangle(cx + 4, lineY, bookW - 40, 1, 0xc8c0b0)
        .setScrollFactor(0).setDepth(303).setAlpha(0.5));
    }

    // Red margin line
    objects.push(this.add.rectangle(cx - bookW / 2 + 60, cy, 1, bookH - 20, 0xd08080)
      .setScrollFactor(0).setDepth(303).setAlpha(0.6));

    // Date at top
    objects.push(this.add.text(cx - bookW / 2 + 70, cy - bookH / 2 + 24, 'June 14', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#8a7a6a',
    }).setScrollFactor(0).setDepth(304));

    // Journal entries — handwritten feel
    const entries = [
      'I\'m going to be somebody.',
      'I just don\'t know how yet.',
      '',
      'Everyone around me has a plan.',
      'College, job, whatever.',
      'I don\'t have a plan.',
      'I just know this isn\'t it.',
      '',
      'Pops says "do it all the way."',
      'But what is "it"?',
      '',
      'Something\'s coming. I can feel it.',
    ];

    let entryY = cy - bookH / 2 + 52;
    for (const line of entries) {
      if (line === '') { entryY += 14; continue; }
      objects.push(this.add.text(cx - bookW / 2 + 70, entryY, line, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#3a3028',
      }).setScrollFactor(0).setDepth(304));
      entryY += 28;
    }

    // Close hint
    objects.push(this.add.text(cx, cy + bookH / 2 + 20, 'Press SPACE to close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

    // Close on Space or click
    const closeJournal = () => {
      spaceKey.off('down', closeJournal);
      this.input.off('pointerdown', closeJournal);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // Delay input registration so it doesn't immediately close
    this.time.delayedCall(300, () => {
      spaceKey.on('down', closeJournal);
      this.input.on('pointerdown', closeJournal);
    });
  }

  private showComputerInterface() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 20;
    const monW = 780;
    const monH = 520;

    // Dark overlay
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // MacBook body — silver bezel
    objects.push(this.add.rectangle(cx, cy, monW + 24, monH + 24, 0xc0c0c0).setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy, monW + 20, monH + 20, 0xa0a0a0).setScrollFactor(0).setDepth(301));

    // Screen — macOS desktop gradient (dark blue/purple)
    objects.push(this.add.rectangle(cx, cy, monW, monH, 0x1a1028).setScrollFactor(0).setDepth(302));
    // Desktop gradient bands
    objects.push(this.add.rectangle(cx, cy - 100, monW, 120, 0x2a1838).setScrollFactor(0).setDepth(302).setAlpha(0.5));
    objects.push(this.add.rectangle(cx, cy + 80, monW, 160, 0x141020).setScrollFactor(0).setDepth(302).setAlpha(0.5));

    // Stand
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 18, 80, 16, 0xb0b0b0).setScrollFactor(0).setDepth(301));
    objects.push(this.add.rectangle(cx, cy + monH / 2 + 30, 160, 8, 0xa0a0a0).setScrollFactor(0).setDepth(301));

    // Menu bar at top
    objects.push(this.add.rectangle(cx, cy - monH / 2 + 10, monW, 20, 0x1a1a1a).setScrollFactor(0).setDepth(303).setAlpha(0.8));
    objects.push(this.add.text(cx - monW / 2 + 15, cy - monH / 2 + 4, '  JP\'s MacBook', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#cccccc',
    }).setScrollFactor(0).setDepth(304));
    objects.push(this.add.text(cx + monW / 2 - 80, cy - monH / 2 + 4, '11:42 PM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#cccccc',
    }).setScrollFactor(0).setDepth(304));

    // Dock at bottom — dark glass bar
    const dockY = cy + monH / 2 - 40;
    objects.push(this.add.rectangle(cx, dockY, 500, 50, 0x1a1a2a).setScrollFactor(0).setDepth(303).setAlpha(0.7));
    objects.push(this.add.rectangle(cx, dockY - 25, 500, 1, 0x404060).setScrollFactor(0).setDepth(303).setAlpha(0.5));

    // App icons on dock
    const apps = [
      { name: 'Safari',    color: 0x2090e0, icon: 'S', x: cx - 180 },
      { name: 'Mail',      color: 0x3080d0, icon: 'M', x: cx - 100 },
      { name: 'Instagram', color: 0xc040a0, icon: 'IG', x: cx - 20 },
      { name: 'YouTube',   color: 0xe02020, icon: 'YT', x: cx + 60 },
      { name: 'Close',     color: 0x606060, icon: 'X', x: cx + 180 },
    ];

    const appButtons: Phaser.GameObjects.Rectangle[] = [];
    for (const app of apps) {
      // App icon square
      const btn = this.add.rectangle(app.x, dockY, 42, 42, app.color)
        .setScrollFactor(0).setDepth(304).setInteractive({ useHandCursor: true });
      objects.push(btn);
      appButtons.push(btn);

      // Rounded corners feel — highlight
      objects.push(this.add.rectangle(app.x, dockY - 8, 36, 4, 0xffffff).setScrollFactor(0).setDepth(305).setAlpha(0.15));

      // App label
      objects.push(this.add.text(app.x, dockY, app.icon, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(305));

      // App name below dock
      objects.push(this.add.text(app.x, dockY + 30, app.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#808090',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(304));

      // Hover glow
      btn.on('pointerover', () => btn.setAlpha(0.8));
      btn.on('pointerout', () => btn.setAlpha(1));
    }

    // Desktop hint
    objects.push(this.add.text(cx, cy - 40, 'Click an app to open', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#606080',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // ESC hint
    objects.push(this.add.text(cx, cy + monH / 2 - 8, 'ESC to close', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#404050',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303));

    // Close handler
    const closeAll = () => {
      if (!active) return;
      active = false;
      escKey.off('down', closeAll);
      for (const obj of objects) {
        if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
      }
      this.frozen = false;
    };

    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', closeAll);

    // App window builder
    const showAppWindow = (title: string, content: { speaker?: string; text: string }[]) => {
      if (!active) return;
      active = false;

      // App window overlay
      const winObjs: Phaser.GameObjects.GameObject[] = [];
      const winW = monW - 60;
      const winH = monH - 80;
      const winY = cy - 10;

      // Window background
      winObjs.push(this.add.rectangle(cx, winY, winW, winH, 0x1e1e2e).setScrollFactor(0).setDepth(310));
      // Title bar
      winObjs.push(this.add.rectangle(cx, winY - winH / 2 + 14, winW, 28, 0x2a2a3a).setScrollFactor(0).setDepth(311));
      // Traffic lights
      winObjs.push(this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 14, 5, 0xff5f57).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.circle(cx - winW / 2 + 36, winY - winH / 2 + 14, 5, 0xffbd2e).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.circle(cx - winW / 2 + 52, winY - winH / 2 + 14, 5, 0x28c940).setScrollFactor(0).setDepth(312));
      // Title text
      winObjs.push(this.add.text(cx, winY - winH / 2 + 14, title, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaacc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Content lines
      let lineY = winY - winH / 2 + 50;
      for (const line of content) {
        if (line.speaker) {
          winObjs.push(this.add.text(cx - winW / 2 + 20, lineY, line.speaker, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
          }).setScrollFactor(0).setDepth(312));
          lineY += 18;
        }
        winObjs.push(this.add.text(cx - winW / 2 + 20, lineY, line.text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#c0c0d0',
          wordWrap: { width: winW - 40 }, lineSpacing: 6,
        }).setScrollFactor(0).setDepth(312));
        lineY += 30;
      }

      // Close button (click red traffic light or press ESC)
      const closeBtn = this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 14, 5, 0xff5f57)
        .setScrollFactor(0).setDepth(313).setInteractive({ useHandCursor: true });
      winObjs.push(closeBtn);

      const closeWin = () => {
        winSpace.off('down', winSpaceHandler);
        for (const o of winObjs) { if (o && o.active) (o as Phaser.GameObjects.GameObject).destroy(); }
        active = true;
      };
      closeBtn.on('pointerdown', closeWin);

      // Space or click red dot to close app window (NOT ESC — ESC closes whole MacBook)
      const winSpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const winSpaceHandler = () => closeWin();
      winSpace.on('down', winSpaceHandler);

      for (const o of winObjs) objects.push(o);
    };

    // IG DM interface — special handler
    const showInstagram = () => {
      if (!active) return;
      active = false;

      const winObjs: Phaser.GameObjects.GameObject[] = [];
      const winW = monW - 60;
      const winH = monH - 80;
      const winY = cy - 10;

      // Window bg
      winObjs.push(this.add.rectangle(cx, winY, winW, winH, 0x0a0a0a).setScrollFactor(0).setDepth(310));
      // IG header — gradient purple/orange
      winObjs.push(this.add.rectangle(cx, winY - winH / 2 + 24, winW, 48, 0x833ab4).setScrollFactor(0).setDepth(311));
      winObjs.push(this.add.rectangle(cx + 100, winY - winH / 2 + 24, winW / 2, 48, 0xc13584).setScrollFactor(0).setDepth(311).setAlpha(0.6));
      // IG logo text
      winObjs.push(this.add.text(cx, winY - winH / 2 + 16, 'Instagram', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.text(cx, winY - winH / 2 + 34, 'Direct Messages', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ddddee',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Traffic lights
      winObjs.push(this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 12, 5, 0xff5f57).setScrollFactor(0).setDepth(313));
      winObjs.push(this.add.circle(cx - winW / 2 + 36, winY - winH / 2 + 12, 5, 0xffbd2e).setScrollFactor(0).setDepth(313));
      winObjs.push(this.add.circle(cx - winW / 2 + 52, winY - winH / 2 + 12, 5, 0x28c940).setScrollFactor(0).setDepth(313));

      // DM conversation list (left panel)
      const panelX = cx - winW / 2;
      const panelW = 200;
      winObjs.push(this.add.rectangle(panelX + panelW / 2, winY + 20, panelW, winH - 60, 0x121212).setScrollFactor(0).setDepth(311));
      // Divider line
      winObjs.push(this.add.rectangle(panelX + panelW, winY + 20, 1, winH - 60, 0x333333).setScrollFactor(0).setDepth(312));

      // DM contacts
      const dms = [
        { name: 'Nolan', preview: 'bro come thru this wknd', active: true },
        { name: 'David', preview: 'lmao u see that video', active: false },
        { name: 'Cooper', preview: 'yo', active: false },
        { name: 'Random Girl', preview: 'hey :)', active: false },
      ];

      let dmY = winY - winH / 2 + 70;
      for (const dm of dms) {
        // DM row highlight if active
        if (dm.active) {
          winObjs.push(this.add.rectangle(panelX + panelW / 2, dmY + 10, panelW - 4, 40, 0x1e1e2e).setScrollFactor(0).setDepth(312));
        }
        // Profile circle
        winObjs.push(this.add.circle(panelX + 22, dmY + 10, 12, dm.active ? 0x833ab4 : 0x333333).setScrollFactor(0).setDepth(312));
        winObjs.push(this.add.text(panelX + 22, dmY + 10, dm.name[0], {
          fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(313));
        // Name
        winObjs.push(this.add.text(panelX + 42, dmY, dm.name, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: dm.active ? '#ffffff' : '#888888',
        }).setScrollFactor(0).setDepth(312));
        // Preview
        winObjs.push(this.add.text(panelX + 42, dmY + 14, dm.preview, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666666',
        }).setScrollFactor(0).setDepth(312));

        // Blue dot for unread
        if (dm.active) {
          winObjs.push(this.add.circle(panelX + panelW - 14, dmY + 10, 4, 0x3897f0).setScrollFactor(0).setDepth(312));
        }

        dmY += 46;
      }

      // Right panel — active conversation with Nolan
      const chatX = panelX + panelW + 10;
      const chatW = winW - panelW - 10;

      // Chat header
      winObjs.push(this.add.text(chatX + chatW / 2, winY - winH / 2 + 60, 'Nolan', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));
      winObjs.push(this.add.text(chatX + chatW / 2, winY - winH / 2 + 76, 'Active now', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#44bb44',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312));

      // Chat messages — bubble style
      const messages = [
        { from: 'nolan', text: 'yooo JP' },
        { from: 'nolan', text: 'bro this weekend' },
        { from: 'nolan', text: 'santa barbara' },
        { from: 'nolan', text: 'frat house on the beach' },
        { from: 'nolan', text: 'david n cooper already down' },
        { from: 'jp', text: 'who else going' },
        { from: 'nolan', text: 'terrell, some girls from UCSB' },
        { from: 'nolan', text: 'bro come thru this wknd 🔥' },
      ];

      let msgY = winY - winH / 2 + 96;
      for (const msg of messages) {
        const isJP = msg.from === 'jp';
        const bubbleColor = isJP ? 0x3897f0 : 0x262626;
        const textColor = '#ffffff';
        const msgX = isJP ? chatX + chatW - 30 : chatX + 20;
        const originX = isJP ? 1 : 0;

        // Bubble
        const textObj = this.add.text(msgX, msgY, msg.text, {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: textColor,
          padding: { x: 8, y: 6 },
          backgroundColor: isJP ? '#3897f0' : '#262626',
        }).setOrigin(originX, 0).setScrollFactor(0).setDepth(312);
        winObjs.push(textObj);

        msgY += 26;
      }

      // Close on red button, ESC, or Space
      const closeBtn = this.add.circle(cx - winW / 2 + 20, winY - winH / 2 + 12, 5, 0xff5f57)
        .setScrollFactor(0).setDepth(314).setInteractive({ useHandCursor: true });
      winObjs.push(closeBtn);

      const closeWin = () => {
        igSpace.off('down', igSpaceHandler);
        for (const o of winObjs) { if (o && o.active) (o as Phaser.GameObjects.GameObject).destroy(); }
        active = true;
      };
      closeBtn.on('pointerdown', closeWin);

      // Space or click red dot to close (NOT ESC)
      const igSpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const igSpaceHandler = () => closeWin();
      igSpace.on('down', igSpaceHandler);

      for (const o of winObjs) objects.push(o);
    };

    // Wire up app clicks
    appButtons[0].on('pointerdown', () => showAppWindow('Safari — Crypto Portfolio', [
      { speaker: 'Coinbase', text: 'Portfolio: -42.3% this month' },
      { text: 'BTC: $28,400  (-8.2%)' },
      { text: 'ETH: $1,830   (-12.1%)' },
      { text: 'DOGE: $0.07   (-34.5%)' },
      { speaker: 'JP\'s Mind', text: 'Pops would kill me if he knew how much I put in.' },
    ]));

    appButtons[1].on('pointerdown', () => showAppWindow('Mail — Inbox (3)', [
      { speaker: 'UC Davis Admissions', text: 'Congratulations! You have been accepted...' },
      { speaker: 'Sac State', text: 'We are pleased to offer you admission...' },
      { speaker: 'Sonoma State', text: 'Dear Jordan, Welcome to the Seawolf family...' },
      { speaker: 'JP\'s Mind', text: '$40K a year for something I can learn on YouTube? Nah.' },
    ]));

    appButtons[2].on('pointerdown', () => showInstagram());

    appButtons[3].on('pointerdown', () => showAppWindow('YouTube — Trending', [
      { text: '"How I Made $10K/Month Dropshipping" — 2.1M views' },
      { text: '"Crypto Trading for Beginners" — 890K views' },
      { text: '"Affiliate Marketing Blueprint" — 1.4M views' },
      { speaker: 'JP\'s Mind', text: 'Everyone selling the dream. Nobody shows the work.' },
    ]));

    appButtons[4].on('pointerdown', () => closeAll());
  }

  private playFishing() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let totalCaught = 0;
    let round = 0;
    const totalRounds = 3;
    let gameOver = false;

    // Dark overlay
    objects.push(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300));

    // Scenery — grass bank at top
    objects.push(this.add.rectangle(GAME_WIDTH / 2, 130, GAME_WIDTH - 100, 160, 0x4a8c3f)
      .setScrollFactor(0).setDepth(300));

    // JP sprite on bank
    const jpSprite = this.add.sprite(300, 160, this.getPlayerTexture(), 0)
      .setScale(4).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Pops sprite nearby
    const popsSprite = this.add.sprite(180, 170, 'npc_pops', 0)
      .setScale(3.5).setScrollFactor(0).setDepth(302);
    objects.push(popsSprite);

    // Pond — deeper blue with gradient
    const pondY = GAME_HEIGHT / 2 + 120;
    const pondW = GAME_WIDTH - 100;
    const pondH = 380;
    objects.push(this.add.rectangle(GAME_WIDTH / 2, pondY, pondW, pondH, 0x1a4878)
      .setScrollFactor(0).setDepth(300));
    objects.push(this.add.rectangle(GAME_WIDTH / 2, pondY - 60, pondW, 80, 0x2060a0)
      .setScrollFactor(0).setDepth(300).setAlpha(0.5));

    // Water ripple animations
    for (let i = 0; i < 6; i++) {
      const ripple = this.add.circle(200 + Math.random() * 900, pondY - 80 + Math.random() * 300, 15 + Math.random() * 20, 0x3080c0, 0.15)
        .setScrollFactor(0).setDepth(301);
      objects.push(ripple);
      this.tweens.add({ targets: ripple, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 2000 + Math.random() * 2000, repeat: -1, delay: Math.random() * 2000 });
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 30, 'FISHING WITH POPS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(title);

    // Exit button
    const exitBtn = this.add.text(80, 30, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);

    // Score
    const scoreText = this.add.text(GAME_WIDTH - 100, 30, 'Caught: 0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(scoreText);

    // Bobber
    const bobberX = GAME_WIDTH / 2 + 50;
    const bobberRestY = pondY - pondH / 2 + 40;
    const bobber = this.add.circle(bobberX, bobberRestY, 6, 0xff3030).setScrollFactor(0).setDepth(303);
    objects.push(bobber);
    objects.push(this.add.circle(bobberX, bobberRestY - 3, 3, 0xffffff).setScrollFactor(0).setDepth(304));

    // Fishing line from JP to bobber
    const fishLine = this.add.line(0, 0, 320, 140, bobberX, bobberRestY, 0xffffff, 0.4)
      .setScrollFactor(0).setDepth(302).setLineWidth(1);
    objects.push(fishLine);

    // Fish shadows (ellipse bodies + tail ellipses)
    const fishBodies: Phaser.GameObjects.Ellipse[] = [];
    const fishTails: Phaser.GameObjects.Ellipse[] = [];
    const fishSpeeds: number[] = [];
    for (let i = 0; i < 7; i++) {
      const sx = 150 + Math.random() * 1000;
      const sy = pondY - 60 + Math.random() * 250;
      const bodyW = 16 + Math.random() * 16; // varied sizes
      const bodyH = 6 + Math.random() * 4;
      const speed = (0.4 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);
      const tailOffsetX = speed > 0 ? -(bodyW / 2 + 3) : (bodyW / 2 + 3);
      const body = this.add.ellipse(sx, sy, bodyW, bodyH, 0x0a2040, 0.3)
        .setScrollFactor(0).setDepth(301);
      const tail = this.add.ellipse(sx + tailOffsetX, sy, bodyW * 0.35, bodyH * 0.7, 0x0a2040, 0.25)
        .setScrollFactor(0).setDepth(301);
      objects.push(body); objects.push(tail);
      fishBodies.push(body); fishTails.push(tail);
      fishSpeeds.push(speed);
    }
    const fishUpdate = () => {
      for (let i = 0; i < fishBodies.length; i++) {
        const b = fishBodies[i]; if (!b.active) continue;
        b.x += fishSpeeds[i];
        const tailOff = fishSpeeds[i] > 0 ? -(b.width / 2 + 3) : (b.width / 2 + 3);
        fishTails[i].x = b.x + tailOff;
        fishTails[i].y = b.y;
        if (b.x < 100 || b.x > GAME_WIDTH - 100) fishSpeeds[i] *= -1;
      }
    };
    this.events.on('update', fishUpdate);

    // Reel progress bar (hidden until bite)
    const barX = GAME_WIDTH / 2;
    const barY = pondY - pondH / 2 - 20;
    const barW = 300;
    const barBg = this.add.rectangle(barX, barY, barW, 20, 0x1a1a2a).setScrollFactor(0).setDepth(305).setVisible(false);
    const barFill = this.add.rectangle(barX - barW / 2, barY, 0, 16, 0x40c060).setOrigin(0, 0.5).setScrollFactor(0).setDepth(306).setVisible(false);
    const barBorder = this.add.rectangle(barX, barY, barW, 20).setStrokeStyle(2, 0x4060a0).setScrollFactor(0).setDepth(307).setVisible(false).setFillStyle(0, 0);
    objects.push(barBg, barFill, barBorder);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Waiting for a bite...', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(instr);

    // State
    let phase: 'waiting' | 'bite' | 'reeling' | 'done' = 'waiting';
    let reelProgress = 0;
    let reelDecay = 0;

    const fishData = [
      { name: 'Largemouth Bass', size: '3.2 lbs', color: 0x408040 },
      { name: 'Rainbow Trout', size: '1.8 lbs', color: 0xc06080 },
      { name: 'Channel Catfish', size: '5.1 lbs', color: 0x706050 },
    ];

    const startRound = () => {
      phase = 'waiting';
      reelProgress = 0;
      barFill.displayWidth = 0;
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      instr.setText(`Round ${round + 1}/${totalRounds} — Casting...`);

      // --- Cast animation ---
      // Start bobber near JP, animate it to the pond
      bobber.setPosition(340, 160);
      fishLine.setTo(320, 140, 340, 160);

      // "Cast!" text
      const castText = this.add.text(GAME_WIDTH / 2, pondY - 120, 'Cast!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310).setAlpha(1);
      objects.push(castText);
      this.tweens.add({ targets: castText, alpha: 0, y: pondY - 160, duration: 800, ease: 'Quad.easeOut' });

      // Tween bobber to pond
      this.tweens.add({
        targets: bobber,
        x: bobberX,
        y: bobberRestY,
        duration: 500,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          fishLine.setTo(320, 140, bobber.x, bobber.y);
        },
        onComplete: () => {
          // Splash circle at landing
          const splash = this.add.circle(bobberX, bobberRestY, 4, 0x80c0ff, 0.7)
            .setScrollFactor(0).setDepth(303);
          objects.push(splash);
          this.tweens.add({ targets: splash, radius: 20, alpha: 0, scaleX: 3, scaleY: 2, duration: 500, onComplete: () => splash.destroy() });

          instr.setText(`Round ${round + 1}/${totalRounds} — Wait for a bite...`);

          // Gentle bobber float
          this.tweens.add({ targets: bobber, y: bobberRestY + 4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

          this.time.delayedCall(2000 + Math.random() * 3000, () => {
            if (gameOver || phase !== 'waiting') return;
            triggerBite();
          });
        },
      });
    };

    const triggerBite = () => {
      phase = 'bite';
      this.tweens.killTweensOf(bobber);
      this.tweens.add({ targets: bobber, y: bobberRestY + 20, duration: 100, yoyo: true, repeat: 5, ease: 'Bounce.easeOut' });
      this.cameras.main.shake(150, 0.006);
      instr.setText('MASH SPACE to reel it in!');
      instr.setColor('#ff4444');

      // "BITE!" flash text
      const biteText = this.add.text(bobberX, pondY - 20, 'BITE!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '22px', color: '#ff2222',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(312).setScale(0.3);
      objects.push(biteText);
      this.tweens.add({ targets: biteText, scale: 1.4, alpha: 0, duration: 300, ease: 'Quad.easeOut', onComplete: () => biteText.destroy() });

      // Show reel bar
      barBg.setVisible(true); barFill.setVisible(true); barBorder.setVisible(true);
      reelProgress = 0;
      reelDecay = 0.4 + round * 0.15; // harder each round
      phase = 'reeling';

      // Fish fights back — progress decays over time
      const reelUpdate = () => {
        if (phase !== 'reeling' || gameOver) { this.events.off('update', reelUpdate); return; }
        reelProgress -= reelDecay;
        if (reelProgress < 0) reelProgress = 0;
        barFill.displayWidth = (reelProgress / 100) * barW;
        // Color gradient: green → yellow → full
        if (reelProgress > 70) barFill.setFillStyle(0x40f060);
        else if (reelProgress > 40) barFill.setFillStyle(0xf0c040);
        else barFill.setFillStyle(0x40c060);

        if (reelProgress >= 100) {
          phase = 'done';
          this.events.off('update', reelUpdate);
          catchFish();
        }
      };
      this.events.on('update', reelUpdate);

      // Timeout — 5 seconds to reel it in
      this.time.delayedCall(5000, () => {
        if (phase === 'reeling') {
          phase = 'done';
          missRound();
        }
      });
    };

    const catchPhrases = ["That's a keeper!", "Nice one, son!", "Just like when you were little."];
    const missPhrases = ["Almost had it.", "They're fighters today.", "Patience, JP."];

    const showPopsComment = (caught: boolean) => {
      const phrases = caught ? catchPhrases : missPhrases;
      const line = phrases[Math.floor(Math.random() * phrases.length)];
      const bubble = this.add.text(popsSprite.x + 40, popsSprite.y - 40, line, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
        backgroundColor: '#333355', padding: { x: 6, y: 4 },
      }).setOrigin(0, 1).setScrollFactor(0).setDepth(312);
      objects.push(bubble);
      this.tweens.add({ targets: bubble, alpha: 0, delay: 1200, duration: 300, onComplete: () => bubble.destroy() });
    };

    const spawnSplashParticles = () => {
      for (let i = 0; i < 9; i++) {
        const angle = (Math.PI * 2 / 9) * i + (Math.random() - 0.5) * 0.4;
        const dist = 30 + Math.random() * 30;
        const p = this.add.circle(bobber.x, bobber.y, 2 + Math.random() * 3, 0x60a0e0, 0.8)
          .setScrollFactor(0).setDepth(309);
        objects.push(p);
        this.tweens.add({
          targets: p,
          x: bobber.x + Math.cos(angle) * dist,
          y: bobber.y + Math.sin(angle) * dist,
          alpha: 0, scale: 0.3, duration: 400 + Math.random() * 200, ease: 'Quad.easeOut',
          onComplete: () => p.destroy(),
        });
      }
    };

    const catchFish = () => {
      totalCaught++;
      scoreText.setText(`Caught: ${totalCaught}`);
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      this.cameras.main.flash(300, 255, 255, 255);

      // Splash particles
      spawnSplashParticles();

      const fish = fishData[round] || fishData[0];
      const caughtText = this.add.text(GAME_WIDTH / 2, pondY - 100, `${fish.name}\n${fish.size}`, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#40f060', align: 'center', lineSpacing: 8,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
      objects.push(caughtText);

      // Fish shape flies up
      const fishShape = this.add.rectangle(GAME_WIDTH / 2, pondY - 40, 30, 12, fish.color).setScrollFactor(0).setDepth(308);
      objects.push(fishShape);
      this.tweens.add({ targets: fishShape, y: pondY - 140, alpha: 0, duration: 1200, ease: 'Quad.easeOut' });

      instr.setText('Nice catch!');
      instr.setColor('#40f060');

      // Pops commentary
      this.time.delayedCall(600, () => showPopsComment(true));

      this.time.delayedCall(2500, () => {
        caughtText.destroy();
        round++;
        if (round < totalRounds) startRound();
        else finishFishing();
      });
    };

    const missRound = () => {
      barBg.setVisible(false); barFill.setVisible(false); barBorder.setVisible(false);
      const miss = this.add.text(GAME_WIDTH / 2, pondY - 80, 'It got away!', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ff6666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
      objects.push(miss);
      instr.setText('Too slow...');
      instr.setColor('#ff6666');

      // Pops commentary
      this.time.delayedCall(600, () => showPopsComment(false));

      this.time.delayedCall(2500, () => {
        miss.destroy();
        round++;
        if (round < totalRounds) startRound();
        else finishFishing();
      });
    };

    // Space = reel (add progress)
    const reelInput = () => {
      if (phase === 'reeling') {
        reelProgress += 8;
        // Bobber jerks up
        this.tweens.add({ targets: bobber, y: bobberRestY - 5, duration: 50, yoyo: true });
      }
    };

    const finishFishing = () => {
      gameOver = true;
      this.events.off('update', fishUpdate);
      spaceKey.off('down', reelInput);
      this.input.off('pointerdown', reelInput);
      escKey.off('down', exitHandler);

      title.setText(totalCaught === totalRounds ? 'FULL BUCKET!' : totalCaught > 0 ? 'NOT BAD' : 'SKUNKED');
      instr.setText(`Total: ${totalCaught}/${totalRounds}`);
      instr.setColor('#ffffff');

      this.time.delayedCall(2000, () => {
        for (const obj of objects) { if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy(); }
        this.dialogue.show([
          { speaker: 'Pops', text: 'Not bad. Remember when we used to do this every weekend?' },
          { speaker: 'JP', text: 'Yeah. I miss that.' },
          { speaker: 'Pops', text: 'We\'ll do it again. When you come back.' },
        ], () => { this.frozen = false; });
      });
    };

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', reelInput);
    this.input.on('pointerdown', reelInput);
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const exitHandler = () => finishFishing();
    escKey.on('down', exitHandler);
    exitBtn.on('pointerdown', exitHandler);

    startRound();
  }

  private playGoodbyeCutscene() {
    this.frozen = true;

    // Step 1: Ask if ready to leave
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Ready to head to Santa Barbara?' },
    ], () => {
      // Show yes/no choice
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2;

      const yesBg = this.add.rectangle(cx - 80, cy, 120, 40, 0x30a040)
        .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
      const yesText = this.add.text(cx - 80, cy, 'Yeah', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      const noBg = this.add.rectangle(cx + 80, cy, 120, 40, 0xa03030)
        .setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
      const noText = this.add.text(cx + 80, cy, 'Not yet', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      yesBg.on('pointerover', () => yesBg.setFillStyle(0x40c050));
      yesBg.on('pointerout', () => yesBg.setFillStyle(0x30a040));
      noBg.on('pointerover', () => noBg.setFillStyle(0xc04040));
      noBg.on('pointerout', () => noBg.setFillStyle(0xa03030));

      const cleanup = () => {
        yesBg.destroy(); yesText.destroy();
        noBg.destroy(); noText.destroy();
      };

      noBg.on('pointerdown', () => {
        cleanup();
        this.frozen = false;
      });

      yesBg.on('pointerdown', () => {
        cleanup();
        this.runGoodbyeSequence();
      });

      // Space = yes by default
      const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const spaceHandler = () => {
        spaceKey.off('down', spaceHandler);
        cleanup();
        this.runGoodbyeSequence();
      };
      spaceKey.on('down', spaceHandler);
    });
  }

  private runGoodbyeSequence() {
    // JP takes one last look
    this.dialogue.show([
      { speaker: 'Narrator', text: 'JP takes one last look around. This is home.' },
    ], () => {
      // Walk south toward the street
      const exitY = this.player.y + SCALED_TILE * 2;
      this.tweens.add({
        targets: this.player,
        y: exitY,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          // Screen dims
          const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setScrollFactor(0).setDepth(50).setAlpha(0);
          this.tweens.add({
            targets: dim,
            alpha: 0.3,
            duration: 400,
            onComplete: () => {
              this.dialogue.show([
                { speaker: 'Narrator', text: 'He grabs his bag. Hugs his sister. Daps up Pops.' },
                { speaker: 'Narrator', text: 'Ivy whines at the door. She knows.' },
              ], () => {
                this.tweens.add({
                  targets: this.player,
                  y: this.player.y + SCALED_TILE * 2,
                  duration: 1000,
                  ease: 'Linear',
                  onComplete: () => {
                    this.tweens.add({
                      targets: dim,
                      alpha: 0,
                      duration: 300,
                      onComplete: () => {
                        dim.destroy();
                        this.frozen = false;
                      },
                    });
                  },
                });
              });
            },
          });
        },
      });
    });
  }

  private playFetch() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let score = 0;
    let round = 0;
    const totalRounds = 3;
    let gameEnded = false;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Green yard background
    const yard = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, GAME_WIDTH - 160, 500, 0x4a8c3f)
      .setScrollFactor(0).setDepth(300);
    objects.push(yard);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'FETCH WITH IVY!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Exit button
    const exitBtn = this.add.text(80, 70, '< EXIT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    objects.push(exitBtn);
    exitBtn.on('pointerdown', () => finishGame());
    const escExit = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escExit.on('down', () => finishGame());

    // Score display
    const scoreText = this.add.text(GAME_WIDTH - 100, 70, 'Score: 0/3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(scoreText);

    // JP position (left side)
    const jpSprite = this.add.sprite(200, GAME_HEIGHT / 2 + 100, this.getPlayerTexture(), 6)
      .setScale(5).setScrollFactor(0).setDepth(302);
    objects.push(jpSprite);

    // Ivy sprite (near JP)
    const frenchie = this.npcs.find(n => n.id === 'ch0_frenchie');
    const ivyTexture = frenchie ? 'npc_frenchie' : this.getPlayerTexture();
    const ivyStartX = 260;
    const ivyStartY = GAME_HEIGHT / 2 + 140;
    const ivy = this.add.sprite(ivyStartX, ivyStartY, ivyTexture, 0)
      .setScale(4).setScrollFactor(0).setDepth(302);
    objects.push(ivy);

    // Idle tail wag animation
    this.tweens.add({ targets: ivy, angle: 3, duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Aim line (oscillating angle indicator)
    const aimLine = this.add.line(0, 0, 200, GAME_HEIGHT / 2 + 80, 500, GAME_HEIGHT / 2 - 100, 0xffffff, 0.6)
      .setScrollFactor(0).setDepth(301).setLineWidth(2);
    objects.push(aimLine);

    // Power bar (vertical, near JP)
    const powerBarX = 120;
    const powerBarY = GAME_HEIGHT / 2 - 20;
    const powerBarH = 200;
    const powerBarW = 16;
    const powerBg = this.add.rectangle(powerBarX, powerBarY, powerBarW, powerBarH, 0x1a1a2a)
      .setScrollFactor(0).setDepth(303);
    objects.push(powerBg);
    const powerFill = this.add.rectangle(powerBarX, powerBarY + powerBarH / 2, powerBarW - 4, 0, 0x40c060)
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(304);
    objects.push(powerFill);
    const powerBorder = this.add.rectangle(powerBarX, powerBarY, powerBarW, powerBarH)
      .setStrokeStyle(2, 0x4060a0).setFillStyle(0, 0).setScrollFactor(0).setDepth(305);
    objects.push(powerBorder);
    const powerLabel = this.add.text(powerBarX, powerBarY - powerBarH / 2 - 14, 'PWR', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(305);
    objects.push(powerLabel);

    // Instruction
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Hold SPACE to charge, release to throw!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Aim angle oscillation
    let aimAngle = 0;
    let aimDir = 1;
    let aiming = true;
    const aimSpeed = 0.03;

    // Power charge state
    let charging = false;
    let power = 0;
    const maxPower = 100;
    const chargeSpeed = 1.8; // per frame
    let powerOscDir = 1;

    const startRound = (animate: boolean) => {
      if (animate && (ivy.x !== ivyStartX || ivy.y !== ivyStartY)) {
        // Animate Ivy running back to JP
        aiming = false;
        aimLine.setVisible(false);
        this.tweens.add({
          targets: ivy,
          x: ivyStartX,
          y: ivyStartY,
          duration: 500,
          ease: 'Quad.easeInOut',
          onComplete: () => {
            ivy.setAngle(0);
            beginAiming();
          },
        });
      } else {
        ivy.setPosition(ivyStartX, ivyStartY);
        beginAiming();
      }
    };

    const beginAiming = () => {
      aiming = true;
      charging = false;
      power = 0;
      powerFill.displayHeight = 0;
      aimAngle = 0;
      aimDir = 1;
      aimLine.setVisible(true);
      instr.setText(`Round ${round + 1}/${totalRounds} — Hold SPACE to charge!`);
    };

    // Update aim line + power
    const updateHandler = () => {
      if (gameEnded) return;
      if (aiming) {
        aimAngle += aimSpeed * aimDir;
        if (aimAngle > 1.2) aimDir = -1;
        if (aimAngle < -1.2) aimDir = 1;

        // Aim line length based on current power (min 150, max 500)
        const throwDist = 150 + (power / maxPower) * 350;
        const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
        const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;
        aimLine.setTo(200, GAME_HEIGHT / 2 + 80, endX, endY);
      }

      // Charge power while holding
      if (charging && aiming) {
        power += chargeSpeed * powerOscDir;
        if (power >= maxPower) { power = maxPower; powerOscDir = -1; }
        if (power <= 30 && powerOscDir === -1) { powerOscDir = 1; }
        powerFill.displayHeight = (power / maxPower) * (powerBarH - 4);

        // Color: green → yellow → red at max
        if (power > 80) powerFill.setFillStyle(0xf04040);
        else if (power > 50) powerFill.setFillStyle(0xf0c040);
        else powerFill.setFillStyle(0x40c060);
      }
    };

    this.events.on('update', updateHandler);

    const throwBall = () => {
      if (!aiming || !charging) return;
      charging = false;
      aiming = false;
      aimLine.setVisible(false);

      const throwPower = Math.max(power, 20); // minimum throw
      const throwDist = 150 + (throwPower / maxPower) * 350;
      const endX = 200 + Math.cos(-0.3 + aimAngle * 0.8) * throwDist;
      const endY = (GAME_HEIGHT / 2 + 80) + Math.sin(-0.3 + aimAngle * 0.8) * throwDist;

      // JP throw animation
      this.tweens.add({ targets: jpSprite, scaleX: 5.5, duration: 80, yoyo: true });

      // Create ball
      const ball = this.add.circle(200, GAME_HEIGHT / 2 + 80, 8, 0xc0d030)
        .setScrollFactor(0).setDepth(303);
      objects.push(ball);

      // Fly ball
      this.tweens.add({
        targets: ball,
        x: endX,
        y: endY,
        duration: 400 + (throwDist / 500) * 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          const inYard = endX > 140 && endX < GAME_WIDTH - 140 &&
                         endY > 180 && endY < GAME_HEIGHT - 80;

          // Ball bounce on landing
          this.tweens.add({
            targets: ball,
            y: ball.y - 20,
            duration: 120,
            yoyo: true,
            ease: 'Quad.easeOut',
          });

          // Dust puff at landing
          for (let d = 0; d < 3; d++) {
            const dust = this.add.circle(
              endX + Phaser.Math.Between(-15, 15),
              endY + Phaser.Math.Between(-5, 5),
              3 + Math.random() * 3, 0x8a7a5a, 0.5
            ).setScrollFactor(0).setDepth(302);
            objects.push(dust);
            this.tweens.add({
              targets: dust,
              y: dust.y - 10 - Math.random() * 10,
              alpha: 0,
              scale: 2,
              duration: 400,
              delay: d * 60,
              onComplete: () => dust.destroy(),
            });
          }

          if (inYard) {
            // Ivy chases ball
            this.tweens.killTweensOf(ivy);
            this.tweens.add({
              targets: ivy,
              x: endX,
              y: endY,
              duration: 500 + throwDist * 0.5,
              ease: 'Quad.easeInOut',
              onUpdate: () => {
                // Flip Ivy to face direction of travel
                ivy.setFlipX(ivy.x > endX);
              },
              onComplete: () => {
                ball.destroy();
                score++;
                scoreText.setText(`Score: ${score}/${totalRounds}`);

                // Good girl text
                const good = this.add.text(ivy.x, ivy.y - 40, 'Good girl Ivy!', {
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '10px',
                  color: '#40c040',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
                objects.push(good);

                // Wiggle celebration
                this.tweens.add({
                  targets: ivy,
                  angle: 10,
                  duration: 80,
                  yoyo: true,
                  repeat: 4,
                  onComplete: () => {
                    this.tweens.add({
                      targets: good,
                      alpha: 0,
                      y: good.y - 20,
                      duration: 500,
                      onComplete: () => {
                        good.destroy();
                        // Restart tail wag
                        this.tweens.add({ targets: ivy, angle: 3, duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                        round++;
                        if (round < totalRounds) {
                          startRound(true);
                        } else {
                          finishGame();
                        }
                      },
                    });
                  },
                });
              },
            });
          } else {
            // Missed — ball out of bounds
            ball.setFillStyle(0xff4444);
            const miss = this.add.text(endX, endY - 30, 'Out of bounds!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
              color: '#ff4444',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
            objects.push(miss);

            // Ivy looks confused (tilts head)
            this.tweens.add({ targets: ivy, angle: -15, duration: 200, yoyo: true, hold: 400 });

            this.time.delayedCall(1200, () => {
              ball.destroy();
              miss.destroy();
              round++;
              if (round < totalRounds) {
                startRound(true);
              } else {
                finishGame();
              }
            });
          }
        },
      });
    };

    // Charge start (space down)
    const startCharge = () => {
      if (!aiming || gameEnded) return;
      charging = true;
      power = 0;
      powerOscDir = 1;
    };

    // Release throw (space up)
    const releaseThrow = () => {
      if (charging && aiming) throwBall();
    };

    const finishGame = () => {
      gameEnded = true;
      this.events.off('update', updateHandler);
      spaceKey.off('down', startCharge);
      spaceKey.off('up', releaseThrow);
      this.input.off('pointerdown', tapThrow);

      instr.setText(`Ivy fetched ${score}/${totalRounds} balls!`);
      title.setText(score === totalRounds ? 'PERFECT!' : score > 0 ? 'GOOD GIRL IVY!' : 'NEXT TIME...');

      const resultMsg = score === totalRounds
        ? 'Ivy is the happiest dog alive.'
        : score > 0
        ? 'Ivy had fun. She always does.'
        : 'Ivy tilts her head. She still loves JP.';

      const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, resultMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#aaaacc',
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(result);

      const finalScore = score;
      this.time.delayedCall(2500, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        // Post-game dialogue
        const dialogueLines = finalScore === totalRounds
          ? [{ speaker: 'Narrator', text: 'Ivy drops the ball at JP\'s feet. Tail going crazy.' }]
          : finalScore > 0
          ? [{ speaker: 'Narrator', text: 'Ivy rolls onto her back. She doesn\'t care about the score.' }]
          : [{ speaker: 'Narrator', text: 'Ivy stares at JP. Still the best girl.' }];
        this.dialogue.show(dialogueLines, () => { this.frozen = false; });
      });
    };

    // Input — hold space to charge, release to throw
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', startCharge);
    spaceKey.on('up', releaseThrow);
    // Touch/click: tap to start charge, tap again to throw
    let tapCharging = false;
    const tapThrow = () => {
      if (gameEnded) return;
      if (!tapCharging) {
        startCharge();
        tapCharging = true;
      } else {
        releaseThrow();
        tapCharging = false;
      }
    };
    this.input.on('pointerdown', tapThrow);

    // Start first round
    startRound(false);
  }
}
