import Phaser from 'phaser';
import { virtualInput } from '../../components/GameCanvas';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, SCALE, CHAR_SCALE } from '../config';
import { DialogueSystem, DialogueLine } from '../systems/DialogueSystem';
import { MapBuilder } from '../systems/MapBuilder';
import { InteractionSystem } from '../systems/InteractionSystem';
import { EvolutionAnimation } from '../systems/EvolutionAnimation';
import { ShowcaseFrame } from '../systems/ShowcaseFrame';
import { MusicSystem } from '../systems/MusicSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { Analytics } from '../systems/Analytics';
import { EmoteSystem } from '../systems/EmoteSystem';
import { MoodSystem } from '../systems/MoodSystem';
import { PhoneSystem } from '../systems/PhoneSystem';
import type { MapData } from '../data/maps';

type NPCObject = {
  sprite: Phaser.GameObjects.Sprite;
  id: string;
  dialogue: DialogueLine[];
};

// Showcase data stored in dialogue map with this prefix
const SHOWCASE_PREFIX = 'showcase:';

export abstract class BaseChapterScene extends Phaser.Scene {
  protected player!: Phaser.GameObjects.Sprite;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  protected dialogue!: DialogueSystem;
  protected interactions!: InteractionSystem;
  protected npcs: NPCObject[] = [];
  protected collisionTiles: Set<string> = new Set();
  protected isMoving = false;
  protected facing: 'down' | 'up' | 'left' | 'right' = 'down';
  protected frozen = false;
  protected triggers: { x: number; y: number; action: string; target?: string; data?: Record<string, string> }[] = [];
  protected mapWidth = 0;
  protected mapHeight = 0;
  protected tilesByRow: Map<number, Phaser.GameObjects.Sprite[]> = new Map();
  protected chapterTitle = '';
  protected nextScene = '';
  protected requiredInteractionId: string = '';
  protected requiredDone = false;

  private navArrows: Phaser.GameObjects.Text[] = [];
  private navArrowTweens: Phaser.Tweens.Tween[] = [];
  private speechBubbles: Map<string, Phaser.GameObjects.Text> = new Map();

  abstract getMapData(): MapData;
  abstract getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> };

  // Override in subclasses to use chapter-specific player outfit
  protected getPlayerTexture(): string {
    return 'player';
  }

  // Override in subclasses to set background music track
  protected getMusicTrack(): string {
    return '';
  }

  // Override in subclasses to provide showcase data
  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {};
  }

  create() {
    this.npcs = [];
    this.collisionTiles = new Set();
    this.isMoving = false;
    this.frozen = false;
    this.requiredDone = false;
    this.speechBubbles = new Map();

    // Analytics
    Analytics.trackChapterStart(this.scene.key);

    // Clean up previous nav arrows
    for (const tween of this.navArrowTweens) tween.stop();
    for (const arrow of this.navArrows) arrow.destroy();
    this.navArrows = [];
    this.navArrowTweens = [];

    // Restore game speed from previous scene
    if (virtualInput.gameSpeed !== 1) {
      this.time.timeScale = virtualInput.gameSpeed;
      this.tweens.timeScale = virtualInput.gameSpeed;
    }

    // Camera fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Pokemon-style opening bars effect
    const openTop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(999);
    const openBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(999);
    this.tweens.add({
      targets: openTop,
      y: -GAME_HEIGHT / 4,
      duration: 800,
      delay: 200,
      ease: 'Quad.easeOut',
      onComplete: () => openTop.destroy(),
    });
    this.tweens.add({
      targets: openBottom,
      y: GAME_HEIGHT + GAME_HEIGHT / 4,
      duration: 800,
      delay: 200,
      ease: 'Quad.easeOut',
      onComplete: () => openBottom.destroy(),
    });

    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Build the map
    const mapData = this.getMapData();
    const mapBuilder = new MapBuilder(this);
    const { collisions, bounds, tilesByRow } = mapBuilder.buildMap(mapData);
    this.collisionTiles = collisions;
    this.mapWidth = bounds.width;
    this.mapHeight = bounds.height;
    this.tilesByRow = tilesByRow;
    this.triggers = mapData.triggers || [];

    // Create player at spawn point
    const spawn = mapData.spawns.player;
    const playerTexture = this.getPlayerTexture();
    this.player = this.add.sprite(
      spawn.x * SCALED_TILE + SCALED_TILE / 2,
      spawn.y * SCALED_TILE + SCALED_TILE / 2,
      playerTexture, 0
    ).setScale(CHAR_SCALE).setDepth(10);

    // Create NPCs
    const chapterDialogue = this.getChapterDialogue();
    for (const npcData of mapData.spawns.npcs) {
      const sprite = this.add.sprite(
        npcData.x * SCALED_TILE + SCALED_TILE / 2,
        npcData.y * SCALED_TILE + SCALED_TILE / 2,
        npcData.sprite, 0
      ).setScale(CHAR_SCALE).setDepth(9);

      // NPCs block movement
      this.collisionTiles.add(`${npcData.x},${npcData.y}`);

      // Animate NPC based on their ID
      this.animateNPC(sprite, npcData.id);

      this.npcs.push({
        sprite,
        id: npcData.id,
        dialogue: chapterDialogue.npcs[npcData.id] || [{ text: '...' }],
      });
    }

    // Set up interaction system
    this.interactions = new InteractionSystem(this);
    const interactables = (mapData.interactables || []) as import('../systems/InteractionSystem').Interactable[];
    this.interactions.init(interactables);

    // Set up dialogue system
    this.dialogue = new DialogueSystem(this);

    // Interaction keys
    this.input.keyboard!.on('keydown-SPACE', () => this.handleInteract());
    this.input.keyboard!.on('keydown-ENTER', () => this.handleInteract());
    this.input.on('pointerdown', () => this.handleInteract());

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapWidth * SCALED_TILE, this.mapHeight * SCALED_TILE);

    // Show chapter title
    this.showChapterTitle();

    // Show objective hint
    this.showObjectiveHint();

    // Start background music
    const track = this.getMusicTrack();
    if (track) MusicSystem.play(track);

    // Autosave progress
    SaveSystem.saveChapter(this.scene.key);

    // Emote system — press E to open emote wheel
    EmoteSystem.init(this);

    // Phone system — press P or TAB to open phone
    PhoneSystem.init(this);
  }

  private showChapterTitle() {
    if (!this.chapterTitle) return;

    this.frozen = true;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(100).setAlpha(1);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.chapterTitle, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: bg,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            bg.destroy();
            title.destroy();
            this.frozen = false;

            // Show intro dialogue
            const chapter = this.getChapterDialogue();
            if (chapter.intro.length > 0) {
              this.dialogue.show(chapter.intro);
            }
          },
        });
      },
    });
  }

  protected addNavArrow(tileX: number, tileY: number, label?: string) {
    const worldX = tileX * SCALED_TILE + SCALED_TILE / 2;
    const worldY = tileY * SCALED_TILE - 8;

    const arrow = this.add.text(worldX, worldY, '\u25bc', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0c040',
    }).setOrigin(0.5, 1).setDepth(50).setAlpha(0.6);

    this.navArrows.push(arrow);

    const tween = this.tweens.add({
      targets: arrow,
      y: worldY + 8,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.navArrowTweens.push(tween);

    if (label) {
      const labelText = this.add.text(worldX, worldY + 14, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#f0c040',
      }).setOrigin(0.5, 0).setDepth(50).setAlpha(0.4);

      this.navArrows.push(labelText);
    }
  }

  protected getObjectiveHint(): string {
    return 'Explore and interact with everything';
  }

  private showObjectiveHint() {
    const hint = this.getObjectiveHint();
    if (!hint) return;

    const bg = this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 80, 28, 0x000000, 0.55)
      .setScrollFactor(0).setDepth(90).setAlpha(0);

    const text = this.add.text(GAME_WIDTH / 2, 30, hint, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(91).setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: [bg, text],
      alpha: (target: Phaser.GameObjects.GameObject) => target === bg ? 0.55 : 0.85,
      duration: 600,
      delay: 3500, // show after chapter title finishes
      hold: 8000,
      yoyo: true,
      onComplete: () => {
        bg.destroy();
        text.destroy();
      },
    });
  }

  private animateNPC(sprite: Phaser.GameObjects.Sprite, id: string) {
    const baseY = sprite.y;
    const baseX = sprite.x;

    // Pushups — bouncing up and down
    if (id.includes('pushup')) {
      this.tweens.add({
        targets: sprite,
        y: baseY + 8,
        scaleY: CHAR_SCALE * 0.7,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Pull-ups — pull up with body compression, pause at top, drop down faster
    if (id.includes('pullup')) {
      const pullUp = () => {
        this.tweens.add({
          targets: sprite,
          y: baseY - 18,
          scaleY: CHAR_SCALE * 0.85,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.time.delayedCall(200, () => {
              this.tweens.add({
                targets: sprite,
                y: baseY,
                scaleY: CHAR_SCALE,
                duration: 400,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  this.time.delayedCall(300, pullUp);
                },
              });
            });
          },
        });
      };
      pullUp();
      return;
    }

    // Fighters — lunging side to side, shaking
    if (id.includes('fighter')) {
      this.tweens.add({
        targets: sprite,
        x: baseX + (id.includes('1') ? 10 : -10),
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Power1',
      });
      // Slight bounce
      this.tweens.add({
        targets: sprite,
        y: baseY - 4,
        duration: 300,
        yoyo: true,
        repeat: -1,
        delay: 150,
      });
      return;
    }

    // Dice — rocking side to side (rolling motion)
    if (id.includes('dice')) {
      this.tweens.add({
        targets: sprite,
        angle: id.includes('1') ? 8 : -8,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // Crouching bob
      this.tweens.add({
        targets: sprite,
        y: baseY + 4,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
      return;
    }

    // Smoker — subtle sway + smoke particles rising from hand + lit ember at hand height
    if (id.includes('smoker') || id.includes('smoke')) {
      // Slight sway (breathing while leaning)
      this.tweens.add({
        targets: sprite,
        x: baseX + 2,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Lit cigarette ember — at HAND height (sprite.y - 12), not on the floor
      const ember = this.add.circle(baseX + 12, baseY - 12, 3, 0xff4400).setDepth(20);
      this.tweens.add({
        targets: ember,
        alpha: 0.3,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
      // Ember follows sprite sway
      this.tweens.add({
        targets: ember,
        x: baseX + 14,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Smoke particles rising from ember — grey circles drifting up and fading
      this.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
          const sx = ember.x + (Math.random() * 6 - 3);
          const sy = ember.y;
          const particle = this.add.circle(sx, sy, 2, 0xaaaaaa, 0.5).setDepth(19);
          this.tweens.add({
            targets: particle,
            y: sy - 40 - Math.random() * 20,
            x: sx + (Math.random() * 16 - 8),
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 1500 + Math.random() * 800,
            onComplete: () => particle.destroy(),
          });
        },
      });
      return;
    }

    // Tattoo — arm moving (drawing motion)
    if (id.includes('tattoo')) {
      this.tweens.add({
        targets: sprite,
        x: baseX + 3,
        y: baseY + 2,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
      return;
    }

    // Sleeping — slow breathing (scale pulse)
    if (id.includes('girl') && (id.includes('1') || id.includes('couch'))) {
      this.tweens.add({
        targets: sprite,
        scaleX: CHAR_SCALE * 1.03,
        scaleY: CHAR_SCALE * 0.97,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // Zzz
      this.time.addEvent({
        delay: 3000,
        loop: true,
        callback: () => {
          const zzz = this.add.text(
            sprite.x + 15, sprite.y - 20, 'z',
            { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#8888aa' }
          ).setDepth(20).setAlpha(0.7);
          this.tweens.add({
            targets: zzz,
            y: zzz.y - 20,
            alpha: 0,
            duration: 2000,
            onComplete: () => zzz.destroy(),
          });
        },
      });
      return;
    }

    // Hot tub girls — bobbing in water
    if (id.includes('girl') && !id.includes('couch')) {
      this.tweens.add({
        targets: sprite,
        y: baseY + 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Dog/Frenchie — tail wag (wobble)
    if (id.includes('frenchie') || id.includes('dog')) {
      this.tweens.add({
        targets: sprite,
        angle: 5,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
      this.tweens.add({
        targets: sprite,
        y: baseY + 2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: 100,
      });
      return;
    }

    // Homies — subtle idle sway (everyone else who's just chilling)
    if (id.includes('homie')) {
      this.tweens.add({
        targets: sprite,
        x: baseX + 2,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Book inmate / reading NPC — subtle page-turn rock
    if (id.includes('book') || id.includes('read') || id.includes('psych')) {
      this.tweens.add({
        targets: sprite,
        angle: -3,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Music/speaker — head bob (y oscillation)
    if (id.includes('speaker') || id.includes('music') || id.includes('terrell')) {
      this.tweens.add({
        targets: sprite,
        y: baseY - 4,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Guard — stands rigid, slight weight shift
    if (id.includes('guard')) {
      this.tweens.add({
        targets: sprite,
        x: baseX + 1,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Generic idle — very subtle breathing (scale pulse)
    this.tweens.add({
      targets: sprite,
      scaleY: sprite.scaleY * 1.015,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playDiscoveryScene(onComplete: () => void) {
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Dark overlay — like a late night screen glow
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510, 0.9)
      .setScrollFactor(0).setDepth(500);
    objects.push(bg);

    // Computer screen glow in center
    const screenGlow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 320, 200, 0x101830)
      .setScrollFactor(0).setDepth(501).setStrokeStyle(2, 0x304060);
    objects.push(screenGlow);

    // Screen light on JP's face
    const faceGlow = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 60, 0x203050, 0.15)
      .setScrollFactor(0).setDepth(501);
    objects.push(faceGlow);

    // JP sprite sitting at the computer
    const jp = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, this.getPlayerTexture(), 2)
      .setScale(CHAR_SCALE + 1).setScrollFactor(0).setDepth(502);
    objects.push(jp);

    // Text lines appearing on the "screen" — like JP is actually browsing
    const lines = [
      { text: '> what is chatgpt', delay: 800, color: '#608090' },
      { text: '> how to build a website', delay: 2000, color: '#608090' },
      { text: '> wix tutorial beginner', delay: 3200, color: '#608090' },
      { text: '> webflow vs wix', delay: 4400, color: '#7090a0' },
      { text: '> how to make money online for real', delay: 5600, color: '#7090a0' },
      { text: '> lovable ai website builder', delay: 6800, color: '#80a0b0' },
      { text: '> claude ai coding assistant', delay: 8000, color: '#a0c0d0' },
    ];

    let yPos = GAME_HEIGHT / 2 - 110;
    for (const line of lines) {
      const t = this.add.text(GAME_WIDTH / 2 - 140, yPos, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: line.color,
      }).setScrollFactor(0).setDepth(502).setAlpha(0);
      objects.push(t);

      // Typewriter effect for each line
      this.time.delayedCall(line.delay, () => {
        t.setAlpha(1);
        let charIdx = 0;
        const typeTimer = this.time.addEvent({
          delay: 40,
          repeat: line.text.length - 1,
          callback: () => {
            charIdx++;
            t.setText(line.text.substring(0, charIdx));
          },
        });
      });

      yPos += 22;
    }

    // After all lines, show the realization
    this.time.delayedCall(9500, () => {
      // Screen brightens slightly
      this.tweens.add({
        targets: screenGlow,
        fillColor: 0x182040,
        duration: 800,
      });

      const realization = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, 'This changes everything.', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#f0c040',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
      objects.push(realization);

      this.tweens.add({
        targets: realization,
        alpha: 1,
        duration: 1000,
        hold: 2000,
        yoyo: true,
        onComplete: () => {
          // Clean up
          for (const obj of objects) {
            if (obj && obj.active) obj.destroy();
          }
          onComplete();
        },
      });
    });
  }

  protected playSmokingAnimation() {
    // Create smoke particles above player for 3 seconds
    const emitSmoke = () => {
      const smoke = this.add.text(
        this.player.x + (Math.random() * 10 - 5),
        this.player.y - 25,
        '~',
        { fontFamily: 'monospace', fontSize: '14px', color: '#bbbbbb' }
      ).setDepth(20).setAlpha(0.7);
      this.tweens.add({
        targets: smoke,
        y: smoke.y - 40,
        x: smoke.x + (Math.random() * 20 - 10),
        alpha: 0,
        duration: 1500,
        onComplete: () => smoke.destroy(),
      });
    };
    // Emit several puffs
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 400, emitSmoke);
    }
  }

  protected handleInteract() {
    // If dialogue is active, advance it
    if (this.dialogue.isActive()) {
      this.dialogue.advance();
      return;
    }

    if (this.frozen) return;

    // Get player tile position and facing tile
    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    let facingX = playerTileX;
    let facingY = playerTileY;
    if (this.facing === 'up') facingY--;
    if (this.facing === 'down') facingY++;
    if (this.facing === 'left') facingX--;
    if (this.facing === 'right') facingX++;

    // Clear all speech bubbles when interacting
    for (const [key, bubble] of this.speechBubbles) {
      bubble.destroy();
      this.speechBubbles.delete(key);
    }

    // Check NPCs first
    for (const npc of this.npcs) {
      const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

      if (npcTileX === facingX && npcTileY === facingY) {
        SoundEffects.playBlip();
        this.handleNPCDialogue(npc.id, npc.dialogue);
        return;
      }
    }

    // Check interactables (at facing tile AND current tile)
    const interactable = this.interactions.checkInteraction(facingX, facingY)
      || this.interactions.checkInteraction(playerTileX, playerTileY);

    if (interactable) {
      this.handleInteractable(interactable);
    }
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Track interaction for analytics
    Analytics.trackInteraction(interactable.id);

    // Check if this is the required interaction for the chapter
    if (interactable.id === this.requiredInteractionId) {
      this.requiredDone = true;
    }

    const chapterDialogue = this.getChapterDialogue();
    const showcaseData = this.getShowcaseData();

    switch (interactable.type) {
      case 'examine':
      case 'scratch': {
        // Show dialogue from the chapter's NPC map (interactable IDs are stored there too)
        const lines = chapterDialogue.npcs[interactable.id];
        if (lines) {
          // Check if this is a smoking interaction
          const isSmoking = interactable.id.includes('smoke') || interactable.id.includes('blunt') || interactable.id.includes('bong');
          this.dialogue.show(lines, isSmoking ? () => this.playSmokingAnimation() : undefined);
          this.interactions.consume(interactable.id);
        }
        break;
      }

      case 'evolve': {
        // AI discovery — grounded, real moment
        this.frozen = true;
        const discoveryLines = chapterDialogue.npcs[interactable.id];
        if (discoveryLines) {
          this.dialogue.show(discoveryLines, () => {
            this.playDiscoveryScene(() => {
              this.frozen = false;
              this.interactions.consume(interactable.id);
            });
          });
        }
        break;
      }

      case 'showcase': {
        // Show client work frame (Chapter 5-6)
        const data = showcaseData[interactable.id];
        if (data) {
          this.frozen = true;
          ShowcaseFrame.show(this, data, () => {
            this.frozen = false;
            this.interactions.consume(interactable.id);
          });
        } else {
          // Fallback to dialogue if no showcase data
          const lines = chapterDialogue.npcs[interactable.id];
          if (lines) {
            this.dialogue.show(lines);
            this.interactions.consume(interactable.id);
          }
        }
        break;
      }
    }
  }

  protected transitionToScene(sceneKey: string, sceneData?: Record<string, string>) {
    this.frozen = true;
    SoundEffects.playDoorOpen();
    Analytics.trackChapterComplete(this.scene.key);

    // Pokemon-style bars closing in from top and bottom
    const topBar = this.add.rectangle(GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(1000);
    const bottomBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(1000);

    this.tweens.add({
      targets: topBar,
      y: GAME_HEIGHT / 4,
      duration: 600,
      ease: 'Quad.easeIn',
    });
    this.tweens.add({
      targets: bottomBar,
      y: GAME_HEIGHT * 3 / 4,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.scene.start(sceneKey, sceneData);
      },
    });
  }

  update(_time: number, _delta: number) {
    // Update mood system every frame (particles, effects, timer)
    MoodSystem.update(this, this.player);

    // Check mobile action button
    if (virtualInput.actionJustPressed) {
      virtualInput.actionJustPressed = false;
      this.handleInteract();
    }

    if (this.frozen || this.dialogue.isActive() || this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown || virtualInput.left) { dx = -1; this.facing = 'left'; }
    else if (this.cursors.right.isDown || this.wasd.D.isDown || virtualInput.right) { dx = 1; this.facing = 'right'; }
    else if (this.cursors.up.isDown || this.wasd.W.isDown || virtualInput.up) { dy = -1; this.facing = 'up'; }
    else if (this.cursors.down.isDown || this.wasd.S.isDown || virtualInput.down) { dy = 1; this.facing = 'down'; }

    const frameMap = { down: 0, up: 2, left: 4, right: 6 };
    this.player.setFrame(frameMap[this.facing]);

    if (dx === 0 && dy === 0) return;

    const currentTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const currentTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);
    const targetTileX = currentTileX + dx;
    const targetTileY = currentTileY + dy;

    const key = `${targetTileX},${targetTileY}`;
    if (this.collisionTiles.has(key)) return;
    if (targetTileX < 0 || targetTileX >= this.mapWidth || targetTileY < 0 || targetTileY >= this.mapHeight) return;

    this.isMoving = true;
    const targetX = targetTileX * SCALED_TILE + SCALED_TILE / 2;
    const targetY = targetTileY * SCALED_TILE + SCALED_TILE / 2;

    const walkFrame = frameMap[this.facing] + 1;
    this.player.setFrame(walkFrame);

    // Sprint — SHIFT key makes movement faster
    const shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    const isSprinting = shiftKey.isDown;
    const baseMoveDuration = isSprinting ? 110 : 200;
    // Mood affects walk speed: multiplier > 1 = slower (higher duration), < 1 = faster
    const moveDuration = Math.round(baseMoveDuration * MoodSystem.getSpeedMultiplier());

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: moveDuration,
      onComplete: () => {
        this.isMoving = false;
        this.player.setFrame(frameMap[this.facing]);
        this.onPlayerMove(targetTileX, targetTileY);
        this.checkTriggers(targetTileX, targetTileY);
      },
    });

    // Walking bounce — subtle squash-and-stretch for lively movement
    this.tweens.add({
      targets: this.player,
      scaleY: CHAR_SCALE * 1.05,
      scaleX: CHAR_SCALE * 0.95,
      duration: 100,
      yoyo: true,
    });

    // Show speech bubbles for nearby NPCs
    this.updateSpeechBubbles();
  }

  private updateSpeechBubbles() {
    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    for (const npc of this.npcs) {
      const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      const dist = Math.abs(playerTileX - npcTileX) + Math.abs(playerTileY - npcTileY);

      if (dist <= 2 && !this.dialogue.isActive()) {
        if (!this.speechBubbles.has(npc.id)) {
          const bubble = this.add.text(npc.sprite.x, npc.sprite.y - 30, '...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 },
          }).setOrigin(0.5).setDepth(15);
          this.speechBubbles.set(npc.id, bubble);
        } else {
          // Update position (NPC might be animated/moving)
          const bubble = this.speechBubbles.get(npc.id)!;
          bubble.setPosition(npc.sprite.x, npc.sprite.y - 30);
        }
      } else {
        if (this.speechBubbles.has(npc.id)) {
          this.speechBubbles.get(npc.id)!.destroy();
          this.speechBubbles.delete(npc.id);
        }
      }
    }
  }

  /** Override in subclasses to react to player movement (e.g. hot tub clothes change) */
  protected onPlayerMove(_tileX: number, _tileY: number): void {}

  /** Show/hide tile rows for floor switching (Pokemon-style) */
  protected setFloorVisibility(showRows: number[], hideRows: number[]): void {
    for (const row of hideRows) {
      const sprites = this.tilesByRow.get(row);
      if (sprites) sprites.forEach(s => s.setVisible(false));
    }
    for (const row of showRows) {
      const sprites = this.tilesByRow.get(row);
      if (sprites) sprites.forEach(s => s.setVisible(true));
    }
    // Also hide/show NPCs and interactable sprites based on their tile Y
    for (const npc of this.npcs) {
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      const shouldShow = showRows.includes(npcTileY);
      const shouldHide = hideRows.includes(npcTileY);
      if (shouldHide) npc.sprite.setVisible(false);
      if (shouldShow) npc.sprite.setVisible(true);
    }
  }

  /** Override in subclasses to add reactive NPC dialogue behaviors */
  protected handleNPCDialogue(_npcId: string, dialogue: DialogueLine[]): void {
    // Mood-reactive NPC dialogue: if faded, 30% chance NPCs comment on it
    if (MoodSystem.isFaded() && Math.random() < 0.3) {
      const fadedLines: string[] = [
        'You good bro? Smells loud.',
        'Damn, you faded huh.',
        'Eyes lookin low my boy.',
        'Smells crazy over here...',
      ];
      const line = fadedLines[Math.floor(Math.random() * fadedLines.length)];
      const speakerName = _npcId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const prependLine: DialogueLine = { speaker: speakerName, text: line };
      this.dialogue.show([prependLine, ...dialogue]);
      return;
    }

    this.dialogue.show(dialogue);
  }

  private checkTriggers(tileX: number, tileY: number) {
    for (const trigger of this.triggers) {
      if (trigger.x === tileX && trigger.y === tileY) {
        if (trigger.action === 'scene' && trigger.target) {
          if (!this.requiredInteractionId || this.requiredDone) {
            this.transitionToScene(trigger.target, trigger.data);
          } else {
            this.dialogue.show([{ text: 'There\'s something you need to do first...' }]);
          }
        } else if (trigger.action === 'dialogue' && trigger.target) {
          const chapter = this.getChapterDialogue();
          const dialogueLines = chapter.npcs[trigger.target];
          if (dialogueLines) {
            this.dialogue.show(dialogueLines);
          }
        }
      }
    }
  }
}
