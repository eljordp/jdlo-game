import Phaser from 'phaser';
import { virtualInput } from '../../components/GameCanvas';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, SCALE, CHAR_SCALE, TILE_IDS } from '../config';
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
import { InventoryUI } from '../systems/InventoryUI';
import { SubstanceSystem } from '../systems/SubstanceSystem';
import { GameIntelligence } from '../systems/GameIntelligence';
import { BalanceSystem } from '../systems/BalanceSystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { GameStats } from '../systems/GameStats';
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
  protected mapTiles: number[][] = [];
  protected chapterTitle = '';
  protected nextScene = '';
  protected requiredInteractionId: string = '';
  protected requiredDone = false;

  private navArrows: Phaser.GameObjects.Text[] = [];
  private navArrowTweens: Phaser.Tweens.Tween[] = [];
  private speechBubbles: Map<string, Phaser.GameObjects.Text> = new Map();
  private npcIndicators: Map<string, Phaser.GameObjects.Text> = new Map();
  private talkedToNpcs: Set<string> = new Set();
  private floorIndicatorText: Phaser.GameObjects.Text | null = null;

  // NPC nudge system — hints players toward missed interactables
  private nudgeTimers: Map<string, number> = new Map();
  private nudgedItems: Set<string> = new Set();
  private nudgeCheckAccum = 0;

  // Konami code easter egg
  private konamiSequence = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'];
  private konamiProgress = 0;
  private konamiActivated = false;
  private konamiSpeedBoostTimer: Phaser.Time.TimerEvent | null = null;

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
    this.npcIndicators = new Map();
    this.talkedToNpcs = new Set();

    // Analytics
    Analytics.trackChapterStart(this.scene.key);

    // Milestone celebrations
    BalanceSystem.attachScene(this);

    // Achievement system
    AchievementSystem.attachScene(this);
    AchievementSystem.resetChapterTrackers();

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
    this.mapTiles = mapData.tiles;

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

    // Create floating "!" indicators above NPCs
    this.createNpcIndicators();

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

    // Camera follows player — zoomed out slightly for Pokemon-style proportions
    this.cameras.main.setZoom(0.85);
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

    // Inventory UI — press I to open inventory/crafting
    InventoryUI.init(this);

    // Konami code easter egg listener
    this.initKonamiCode();
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

  protected showFloorIndicator(floor: string) {
    if (!this.floorIndicatorText) {
      this.floorIndicatorText = this.add.text(80, GAME_HEIGHT - 30, '', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setScrollFactor(0).setDepth(90).setAlpha(0);
    }
    this.floorIndicatorText.setText(floor);
    this.floorIndicatorText.setAlpha(0);
    this.tweens.add({ targets: this.floorIndicatorText, alpha: 0.4, duration: 400, hold: 2000, yoyo: true });
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

  private objectiveHintBg: Phaser.GameObjects.Rectangle | null = null;
  private objectiveHintText: Phaser.GameObjects.Text | null = null;
  private lastHintString: string = '';

  private showObjectiveHint() {
    const hint = this.getObjectiveHint();
    if (!hint) return;

    // Create persistent hint bar at top
    this.objectiveHintBg = this.add.rectangle(GAME_WIDTH / 2, 16, GAME_WIDTH, 24, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(90).setAlpha(0);

    this.objectiveHintText = this.add.text(GAME_WIDTH / 2, 16, hint, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#cccccc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(91).setAlpha(0);

    this.lastHintString = hint;

    // Fade in after chapter title
    this.tweens.add({
      targets: [this.objectiveHintBg, this.objectiveHintText],
      alpha: (target: Phaser.GameObjects.GameObject) => target === this.objectiveHintBg ? 0.5 : 0.8,
      duration: 600,
      delay: 3500,
    });
  }

  /** Call to refresh the objective hint text (e.g. after state changes) */
  protected refreshObjectiveHint() {
    if (!this.objectiveHintText || !this.objectiveHintText.active) return;
    const hint = this.getObjectiveHint();
    if (hint !== this.lastHintString) {
      this.lastHintString = hint;
      // Brief flash to draw attention
      this.objectiveHintText.setAlpha(0);
      this.objectiveHintText.setText(hint);
      this.tweens.add({ targets: this.objectiveHintText, alpha: 0.8, duration: 400 });
    }
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

    // Sleeping — ONLY for NPCs explicitly marked as sleeping (couch sleeper)
    if (id.includes('couch') || id.includes('sleep') || id.includes('sunbather')) {
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

    // Girls — swaying + bobbing (looks alive, not sleeping)
    if (id.includes('girl') && !id.includes('couch')) {
      // Side-to-side sway
      this.tweens.add({
        targets: sprite,
        x: baseX + 6,
        angle: 5,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // Bounce up/down
      this.tweens.add({
        targets: sprite,
        y: baseY - 4,
        duration: 600 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 200,
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

  private createNpcIndicators() {
    for (const npc of this.npcs) {
      const indicator = this.add.text(
        npc.sprite.x,
        npc.sprite.y - 22,
        '!',
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#f0c040',
        }
      ).setOrigin(0.5).setDepth(14);

      // Match initial NPC visibility
      if (!npc.sprite.visible) indicator.setVisible(false);

      // Gentle bob animation (4px range, 1.5s cycle)
      this.tweens.add({
        targets: indicator,
        y: indicator.y - 4,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Alpha pulse (0.7 to 1.0)
      this.tweens.add({
        targets: indicator,
        alpha: 0.7,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.npcIndicators.set(npc.id, indicator);
    }
  }

  private removeNpcIndicator(npcId: string) {
    const indicator = this.npcIndicators.get(npcId);
    if (!indicator) return;

    // Stop any running tweens on this indicator
    this.tweens.killTweensOf(indicator);

    // Quick scale-down dismiss animation
    this.tweens.add({
      targets: indicator,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        indicator.destroy();
        this.npcIndicators.delete(npcId);
      },
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

  /** Burst confetti/particles at a point — reusable celebration effect */
  protected playConfetti(x: number, y: number, count = 14) {
    const colors = [0x30c060, 0xf0c040, 0xffffff, 0x60a0ff, 0xff6060, 0xff80d0];
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const particle = this.add.rectangle(
        x, y,
        4 + Math.random() * 4, 4 + Math.random() * 4,
        color
      ).setDepth(400);
      this.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 200,
        y: y - 40 - Math.random() * 120,
        alpha: 0,
        angle: Math.random() * 360,
        duration: 800 + Math.random() * 600,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /** Screen impact — shake + flash for big moments */
  protected playScreenImpact(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
    const config = {
      light: { duration: 100, intensity: 0.005, flashAlpha: 0.1 },
      medium: { duration: 200, intensity: 0.01, flashAlpha: 0.2 },
      heavy: { duration: 400, intensity: 0.025, flashAlpha: 0.35 },
    }[intensity];
    this.cameras.main.shake(config.duration, config.intensity);
    SoundEffects.playImpact();
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, config.flashAlpha)
      .setScrollFactor(0).setDepth(500);
    this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
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

    // Direction deltas based on facing
    let dx = 0;
    let dy = 0;
    if (this.facing === 'up') dy = -1;
    if (this.facing === 'down') dy = 1;
    if (this.facing === 'left') dx = -1;
    if (this.facing === 'right') dx = 1;

    const facingX = playerTileX + dx;
    const facingY = playerTileY + dy;

    // Tiles to check for interactions (ordered by priority):
    // 1. Facing tile (original behavior)
    // 2. Standing tile (for walk-onto items)
    // 3. Left of facing tile (45-degree forgiveness)
    // 4. Right of facing tile (45-degree forgiveness)
    // 5. Two tiles ahead (for NPCs at range)
    const checkTiles: { x: number; y: number; npcOnly?: boolean }[] = [
      { x: facingX, y: facingY },
      { x: playerTileX, y: playerTileY },
      { x: facingX + dy, y: facingY + dx },   // perpendicular left
      { x: facingX - dy, y: facingY - dx },   // perpendicular right
      { x: playerTileX + dx * 2, y: playerTileY + dy * 2, npcOnly: true }, // 2 tiles ahead (NPCs only)
    ];

    // Clear all speech bubbles when interacting
    for (const [key, bubble] of this.speechBubbles) {
      bubble.destroy();
      this.speechBubbles.delete(key);
    }

    // Check NPCs first — try all tiles in priority order
    for (const tile of checkTiles) {
      for (const npc of this.npcs) {
        const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
        const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

        if (npcTileX === tile.x && npcTileY === tile.y) {
          // Skip invisible/inactive NPCs — they shouldn't be interactable
          if (!npc.sprite.visible || !npc.sprite.active) continue;
          SoundEffects.playBlip();
          this.handleNPCDialogue(npc.id, npc.dialogue);
          return;
        }
      }
    }

    // Check interactables — try all non-NPC-only tiles in priority order
    let interactable = null;
    for (const tile of checkTiles) {
      if (tile.npcOnly) continue;
      interactable = this.interactions.checkInteraction(tile.x, tile.y);
      if (interactable) break;
    }

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
          SoundEffects.playPickup();
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

  /**
   * Chapter title lookup for transition title cards.
   * Maps scene keys to their display title.
   */
  private static readonly CHAPTER_TITLES: Record<string, string> = {
    HomeScene: 'Chapter 1: Home',
    BeachScene: 'Chapter 2: Santa Barbara',
    WrongCrowdScene: 'Chapter 3: Wrong Crowd',
    CourtScene: 'Chapter 3: The Verdict',
    JailScene: 'Chapter 4: Locked Up',
    ReleaseScene: 'Chapter 4: Release',
    TractorScene: 'Chapter 5: Caymus Vineyards',
    ComeUpScene: 'Chapter 6: The Come Up',
    LAScene: 'Chapter 6: Los Angeles',
    OperatorScene: 'Chapter 7: Operator Mode',
    VegasScene: 'Chapter 7: Vegas',
    HomeReturnScene: 'Home',
  };

  protected transitionToScene(sceneKey: string, sceneData?: Record<string, string>) {
    this.frozen = true;
    SoundEffects.playDoorOpen();
    Analytics.trackChapterComplete(this.scene.key);
    GameStats.increment('chaptersCompleted');
    GameStats.setMax('totalMoney', BalanceSystem.getBalance());

    // Achievement checks on chapter completion
    AchievementSystem.checkSpeedRunner();
    AchievementSystem.checkSoberSally();

    const currentScene = this.scene.key;
    const DEPTH = 2000;
    const LETTERBOX_H = 60; // Height of each letterbox bar

    // --- Phase 1: Letterbox bars slide in ---
    SoundEffects.playCinematicSwoosh();

    const topBar = this.add.rectangle(GAME_WIDTH / 2, -LETTERBOX_H / 2, GAME_WIDTH, LETTERBOX_H, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH);
    const bottomBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + LETTERBOX_H / 2, GAME_WIDTH, LETTERBOX_H, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH);

    this.tweens.add({
      targets: topBar,
      y: LETTERBOX_H / 2,
      duration: 400,
      ease: 'Quad.easeOut',
    });
    this.tweens.add({
      targets: bottomBar,
      y: GAME_HEIGHT - LETTERBOX_H / 2,
      duration: 400,
      ease: 'Quad.easeOut',
    });

    // --- Phase 2: Chapter-specific effect (runs during letterbox) ---
    this.playCinematicEffect(currentScene, sceneKey);

    // --- Phase 3: Fade to black after letterbox settles ---
    this.time.delayedCall(500, () => {
      // Full-screen black overlay fades in
      const blackOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 1).setAlpha(0);

      this.tweens.add({
        targets: blackOverlay,
        alpha: 1,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // --- Phase 4: Show chapter title card on black ---
          // If going to TransitionScene, let that handle its own text
          if (sceneKey === 'TransitionScene') {
            this.scene.start(sceneKey, sceneData);
            return;
          }

          const nextTitle = BaseChapterScene.CHAPTER_TITLES[sceneKey];
          if (nextTitle) {
            this.showTransitionTitleCard(nextTitle, () => {
              this.scene.start(sceneKey, sceneData);
            });
          } else {
            // No title card, just go
            this.scene.start(sceneKey, sceneData);
          }
        },
      });
    });
  }

  /**
   * Show a title card ("Chapter X: Title") on the already-black screen,
   * then call onComplete when done.
   */
  private showTransitionTitleCard(title: string, onComplete: () => void) {
    const DEPTH = 2100;

    // Split "Chapter X: Title" into chapter number and name
    const colonIdx = title.indexOf(':');
    let chapterNum = '';
    let chapterName = title;
    if (colonIdx > -1) {
      chapterNum = title.substring(0, colonIdx).trim();
      chapterName = title.substring(colonIdx + 1).trim();
    }

    // Chapter number (smaller, above)
    const numText = chapterNum ? this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 25, chapterNum, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#8888aa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH).setAlpha(0) : null;

    // Chapter name (larger, center)
    const nameText = this.add.text(GAME_WIDTH / 2, chapterNum ? GAME_HEIGHT / 2 + 10 : GAME_HEIGHT / 2, chapterName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH).setAlpha(0);

    // Decorative line under the title
    const lineWidth = 200;
    const line = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + (chapterNum ? 40 : 30), lineWidth, 2, 0x4060c0)
      .setScrollFactor(0).setDepth(DEPTH).setAlpha(0);

    // Fade in title
    if (numText) {
      this.tweens.add({ targets: numText, alpha: 1, duration: 400 });
    }
    this.tweens.add({ targets: nameText, alpha: 1, duration: 500, delay: 150 });
    this.tweens.add({
      targets: line,
      alpha: 0.6,
      duration: 400,
      delay: 300,
      onComplete: () => {
        // Hold for a beat, then fade out
        this.time.delayedCall(1200, () => {
          const fadeTargets = [nameText, line];
          if (numText) fadeTargets.push(numText);
          this.tweens.add({
            targets: fadeTargets,
            alpha: 0,
            duration: 400,
            onComplete: () => {
              nameText.destroy();
              line.destroy();
              if (numText) numText.destroy();
              onComplete();
            },
          });
        });
      },
    });
  }

  /**
   * Play chapter-pair-specific cinematic effects during the transition.
   * These run DURING the letterbox + fade sequence.
   */
  private playCinematicEffect(fromScene: string, toScene: string) {
    const DEPTH = 1999; // Below letterbox bars but above game

    // Ch1 -> Ch2: Screen wipe + car driving hint
    if (fromScene === 'HomeScene' && (toScene === 'TransitionScene' || toScene === 'BeachScene')) {
      SoundEffects.playCarDrive();
      // Horizontal wipe overlay
      const wipe = this.add.rectangle(-GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH).setAlpha(0.5);
      this.tweens.add({
        targets: wipe,
        x: GAME_WIDTH * 1.5,
        duration: 800,
        ease: 'Quad.easeIn',
        onComplete: () => wipe.destroy(),
      });
    }

    // Ch2 -> Ch3: Night overlay fade
    if (fromScene === 'BeachScene' && (toScene === 'WrongCrowdScene' || toScene === 'TransitionScene')) {
      const nightOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000030)
        .setScrollFactor(0).setDepth(DEPTH).setAlpha(0);
      this.tweens.add({
        targets: nightOverlay,
        alpha: 0.6,
        duration: 600,
        onComplete: () => nightOverlay.destroy(),
      });
    }

    // Ch3 -> Court: Red/blue police flash
    if (fromScene === 'WrongCrowdScene' && toScene === 'CourtScene') {
      SoundEffects.playPoliceSiren();
      this.playPoliceFlash(DEPTH);
    }

    // Ch4 -> Ch5: Bright white freedom flash
    if ((fromScene === 'JailScene' || fromScene === 'ReleaseScene') && toScene === 'TractorScene') {
      SoundEffects.playFreedomFlash();
      const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
        .setScrollFactor(0).setDepth(DEPTH + 5).setAlpha(0);
      this.tweens.add({
        targets: flash,
        alpha: 1,
        duration: 300,
        yoyo: true,
        hold: 200,
        onComplete: () => flash.destroy(),
      });
    }

    // Ch6 -> Ch7: City skyline silhouette wipe
    if ((fromScene === 'ComeUpScene' || fromScene === 'LAScene') && toScene === 'OperatorScene') {
      this.playSkylineWipe(DEPTH);
    }

    // Ch7 -> Vegas: Road stretching out
    if (fromScene === 'OperatorScene' && (toScene === 'VegasScene' || toScene === 'TransitionScene')) {
      SoundEffects.playRoadWind();
      this.playRoadStretch(DEPTH);
    }
  }

  /** Red/blue alternating police flash overlay */
  private playPoliceFlash(depth: number) {
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000)
      .setScrollFactor(0).setDepth(depth).setAlpha(0);

    let count = 0;
    const maxFlashes = 6;
    const flashInterval = 120;

    const doFlash = () => {
      if (count >= maxFlashes) {
        flash.destroy();
        return;
      }
      const isRed = count % 2 === 0;
      flash.setFillStyle(isRed ? 0xff0000 : 0x0000ff);
      flash.setAlpha(0.4);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: flashInterval,
        onComplete: () => {
          count++;
          doFlash();
        },
      });
    };
    doFlash();
  }

  /** City skyline silhouette wipe (buildings rise from bottom) */
  private playSkylineWipe(depth: number) {
    const buildingCount = 12;
    const buildingWidth = GAME_WIDTH / buildingCount;
    const buildings: Phaser.GameObjects.Rectangle[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const height = 60 + Math.random() * 120;
      const bldg = this.add.rectangle(
        i * buildingWidth + buildingWidth / 2,
        GAME_HEIGHT + height / 2,
        buildingWidth - 2,
        height,
        0x101020
      ).setScrollFactor(0).setDepth(depth);
      buildings.push(bldg);

      this.tweens.add({
        targets: bldg,
        y: GAME_HEIGHT - height / 2,
        duration: 500,
        delay: i * 40,
        ease: 'Quad.easeOut',
      });
    }

    // Clean up after transition takes over
    this.time.delayedCall(1200, () => {
      buildings.forEach(b => b.destroy());
    });
  }

  /** Road lines stretching toward horizon (vanishing point perspective) */
  private playRoadStretch(depth: number) {
    // Road background
    const road = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 0.4, GAME_HEIGHT, 0x333338)
      .setScrollFactor(0).setDepth(depth).setAlpha(0);

    // Center line dashes
    const dashes: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < 8; i++) {
      const dash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + i * 60, 4, 30, 0xf0c040)
        .setScrollFactor(0).setDepth(depth + 1).setAlpha(0);
      dashes.push(dash);
    }

    // Fade road in
    this.tweens.add({ targets: road, alpha: 0.7, duration: 300 });
    dashes.forEach(d => this.tweens.add({ targets: d, alpha: 0.8, duration: 300 }));

    // Animate dashes flying toward viewer
    dashes.forEach((dash, i) => {
      this.tweens.add({
        targets: dash,
        y: -60,
        scaleX: 3,
        scaleY: 2,
        duration: 800,
        delay: i * 80,
        ease: 'Quad.easeIn',
      });
    });

    // Clean up
    this.time.delayedCall(1200, () => {
      road.destroy();
      dashes.forEach(d => d.destroy());
    });
  }

  // ── NPC Nudge System ──────────────────────────────────────────

  private static NUDGE_HINTS = [
    'Hey, check that out over there',
    'You see that? Might be worth a look',
    "Don't miss that",
    'Yo, go look at that',
  ];

  private updateNpcNudges(): void {
    const missedIds = GameIntelligence.getMissedItems();
    if (missedIds.length === 0) return;

    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    // Get interactable positions from the interaction system
    const visuals = this.interactions.getVisuals();

    for (const itemId of missedIds) {
      if (this.nudgedItems.has(itemId)) continue;

      // Find position for this interactable
      const visual = visuals.find(v => v.id === itemId);
      if (!visual) continue;

      const distToPlayer = Math.abs(visual.x - playerTileX) + Math.abs(visual.y - playerTileY);

      if (distToPlayer <= 4) {
        // Player is near a missed item — accumulate time
        const prev = this.nudgeTimers.get(itemId) ?? 0;
        const next = prev + 1000; // called every ~1s
        this.nudgeTimers.set(itemId, next);

        if (next >= 10000) {
          // Find nearest NPC within 6 tiles of the player
          let nearestNpc: NPCObject | null = null;
          let nearestDist = Infinity;

          for (const npc of this.npcs) {
            const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
            const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
            const d = Math.abs(npcTileX - playerTileX) + Math.abs(npcTileY - playerTileY);
            if (d <= 6 && d < nearestDist && npc.sprite.visible) {
              nearestDist = d;
              nearestNpc = npc;
            }
          }

          if (nearestNpc) {
            const hint = BaseChapterScene.NUDGE_HINTS[
              Math.floor(Math.random() * BaseChapterScene.NUDGE_HINTS.length)
            ];
            this.showNpcNudgeBubble(nearestNpc.sprite, hint);
            this.nudgedItems.add(itemId);
            GameIntelligence.logAdaptation('npc_nudge', `NPC hinted toward ${itemId}`);
          }
        }
      } else {
        // Player moved away — reset timer
        this.nudgeTimers.delete(itemId);
      }
    }
  }

  private showNpcNudgeBubble(npcSprite: Phaser.GameObjects.Sprite, text: string): void {
    const bubble = this.add.text(npcSprite.x, npcSprite.y - 28, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    })
      .setOrigin(0.5, 1)
      .setDepth(200);

    // Fade out after 3 seconds
    this.tweens.add({
      targets: bubble,
      alpha: 0,
      duration: 800,
      delay: 2200,
      onComplete: () => bubble.destroy(),
    });
  }

  update(_time: number, _delta: number) {
    // Update mood system every frame (particles, effects, timer)
    MoodSystem.update(this, this.player);
    SubstanceSystem.update(_delta);

    // Achievement tracking: faded timer + money milestones
    AchievementSystem.updateFadedTimer(_delta, MoodSystem.isFaded());
    AchievementSystem.checkMoneyAchievements(BalanceSystem.getBalance());

    // NPC nudge system — throttled to every 1s
    this.nudgeCheckAccum += _delta;
    if (this.nudgeCheckAccum >= 1000) {
      this.nudgeCheckAccum = 0;
      this.updateNpcNudges();
    }

    // Refresh objective hint if state changed
    this.refreshObjectiveHint();

    // Update NPC indicator positions (NPCs may animate/move)
    for (const npc of this.npcs) {
      const indicator = this.npcIndicators.get(npc.id);
      if (indicator) {
        indicator.x = npc.sprite.x;
        // Respect NPC visibility
        indicator.setVisible(npc.sprite.visible);
      }
    }

    // Check mobile action button
    if (virtualInput.actionJustPressed) {
      virtualInput.actionJustPressed = false;
      this.handleInteract();
    }

    // Check mobile cancel (B) button — advance dialogue or close overlays
    if (virtualInput.cancelJustPressed) {
      virtualInput.cancelJustPressed = false;
      if (this.dialogue.isActive()) {
        this.dialogue.advance();
      }
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

    // Stumble check — drunk/high causes random movement interrupts
    if (SubstanceSystem.shouldStumble()) {
      this.isMoving = true;
      this.time.delayedCall(300, () => {
        this.isMoving = false;
      });
      // Camera shake for stumble feel
      this.cameras.main.shake(100, 0.003);
      return; // skip this move
    }

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

    // Footstep sound
    SoundEffects.playFootstep();

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: moveDuration,
      onComplete: () => {
        this.isMoving = false;
        this.player.setFrame(frameMap[this.facing]);

        // Play door sound when stepping on a door tile
        if (this.mapTiles[targetTileY] && this.mapTiles[targetTileY][targetTileX] === TILE_IDS.DOOR) {
          SoundEffects.playDoorOpen();
        }

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
    const showSet = new Set(showRows);
    const hideSet = new Set(hideRows);

    // Toggle tile sprites
    for (const row of hideRows) {
      const sprites = this.tilesByRow.get(row);
      if (sprites) sprites.forEach(s => s.setVisible(false));
    }
    for (const row of showRows) {
      const sprites = this.tilesByRow.get(row);
      if (sprites) sprites.forEach(s => s.setVisible(true));
    }

    // Toggle NPCs and their indicators
    for (const npc of this.npcs) {
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);
      if (hideSet.has(npcTileY)) {
        npc.sprite.setVisible(false);
        this.npcIndicators.get(npc.id)?.setVisible(false);
      }
      if (showSet.has(npcTileY)) {
        npc.sprite.setVisible(true);
        this.npcIndicators.get(npc.id)?.setVisible(true);
      }
    }

    // Toggle interactable sprites and markers
    const visuals = this.interactions.getVisuals();
    for (const v of visuals) {
      if (hideSet.has(v.y)) {
        if (v.sprite) v.sprite.setVisible(false);
        if (v.marker) v.marker.setVisible(false);
      }
      if (showSet.has(v.y)) {
        if (v.sprite) v.sprite.setVisible(true);
        if (v.marker) v.marker.setVisible(true);
      }
    }
  }

  /** Override in subclasses to add reactive NPC dialogue behaviors */
  protected handleNPCDialogue(_npcId: string, dialogue: DialogueLine[]): void {
    // Remove the floating indicator for this NPC
    if (!this.talkedToNpcs.has(_npcId)) {
      this.talkedToNpcs.add(_npcId);
      this.removeNpcIndicator(_npcId);
      GameStats.increment('npcsTalkedTo');
    }

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

  // ─── KONAMI CODE EASTER EGG ──────────────────────────────────────
  private initKonamiCode() {
    const keyMap: Record<string, string> = {
      'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
      'b': 'B', 'B': 'B', 'a': 'A', 'A': 'A',
    };

    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (this.konamiActivated) return;
      const mapped = keyMap[event.key];
      if (!mapped) { this.konamiProgress = 0; return; }

      if (mapped === this.konamiSequence[this.konamiProgress]) {
        this.konamiProgress++;
        if (this.konamiProgress >= this.konamiSequence.length) {
          this.konamiProgress = 0;
          this.activateKonamiCode();
        }
      } else {
        this.konamiProgress = mapped === this.konamiSequence[0] ? 1 : 0;
      }
    });
  }

  private activateKonamiCode() {
    this.konamiActivated = true;
    this.frozen = true;

    // Save to localStorage as a hidden stat
    try { localStorage.setItem('jdlo_konami_found', 'true'); } catch {}

    // Rainbow flash effect
    const colors = [0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x0080ff, 0x8000ff];
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, colors[0], 0.6)
      .setScrollFactor(0).setDepth(900);

    let colorIndex = 0;
    const rainbowTimer = this.time.addEvent({
      delay: 100,
      repeat: 19,
      callback: () => {
        colorIndex = (colorIndex + 1) % colors.length;
        flash.setFillStyle(colors[colorIndex], 0.6);
      },
    });

    // Flip all NPC sprites upside down briefly
    const flippedNpcs: Phaser.GameObjects.Sprite[] = [];
    for (const npc of this.npcs) {
      if (npc.sprite.visible) {
        npc.sprite.setFlipY(true);
        flippedNpcs.push(npc.sprite);
      }
    }

    // Secret message
    const msgBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 60, 0x000000, 0.9)
      .setScrollFactor(0).setDepth(901);
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'JDLO MODE ACTIVATED', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(902);

    // After 2 seconds, clean up and apply speed boost
    this.time.delayedCall(2000, () => {
      flash.destroy();
      msgBg.destroy();
      msg.destroy();
      rainbowTimer.remove();

      // Restore NPC sprites
      for (const sprite of flippedNpcs) {
        if (sprite.active) sprite.setFlipY(false);
      }

      // Double player speed for 30 seconds
      this.time.timeScale = 2;
      this.tweens.timeScale = 2;

      const speedText = this.add.text(GAME_WIDTH - 10, 40, 'JDLO MODE: 30s', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(90).setAlpha(0.7);

      let remaining = 30;
      this.konamiSpeedBoostTimer = this.time.addEvent({
        delay: 1000,
        repeat: 29,
        callback: () => {
          remaining--;
          speedText.setText('JDLO MODE: ' + remaining + 's');
          if (remaining <= 0) {
            speedText.destroy();
            this.time.timeScale = 1;
            this.tweens.timeScale = 1;
          }
        },
      });

      this.frozen = false;
    });
  }
}
