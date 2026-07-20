import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { stateStreetMap } from '../data/stateStreetMap';
import type { MapData } from '../data/maps';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_HEIGHT, GAME_WIDTH, SCALE, SCALED_TILE } from '../config';
import { AffinitySystem } from '../systems/AffinitySystem';
import { BalanceSystem } from '../systems/BalanceSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { ClosetStore } from '../systems/ClosetStore';
import { MusicSystem } from '../systems/MusicSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { SoundEffects } from '../systems/SoundEffects';

type StateStreetData = {
  returnScene?: string;
  onComplete?: (choice: 'lillys' | 'oku' | null) => void;
};

/**
 * A compact second map inside the Santa Barbara era. It is deliberately a
 * district, not an open-world city: drive in, walk the real spots, make one
 * choice, and return to the chapter without resetting its state.
 */
export class StateStreetScene extends BaseChapterScene {
  private returnScene = 'WeedRiseScene';
  private onComplete?: (choice: 'lillys' | 'oku' | null) => void;
  private dateChoice: 'lillys' | 'oku' | null = null;
  private exiting = false;

  constructor() {
    super({ key: 'StateStreetScene' });
  }

  init(data: StateStreetData = {}) {
    this.returnScene = data.returnScene || 'WeedRiseScene';
    this.onComplete = data.onComplete;
    const priorChoice = ChoiceLedger.get('sb_coast_date');
    this.dateChoice = priorChoice === "Lilly's" ? 'lillys' : priorChoice === 'Oku' ? 'oku' : null;
    this.exiting = false;
  }

  protected getPlayerTexture(): string {
    return 'player-ch1';
  }

  protected getMusicTrack(): string {
    return 'santa-barbara';
  }

  getMapData(): MapData {
    return stateStreetMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return {
      intro: [],
      npcs: {
        sb_k: [
          { speaker: 'K', text: 'You said dinner. I am not choosing for you.' },
          { speaker: 'JP', text: 'You absolutely have an opinion.' },
          { speaker: 'K', text: 'I have several.' },
        ],
        sb_busker: [
          { speaker: 'Busker', text: 'State Street eats first. Tourists tip after the chorus.' },
        ],
        sb_local: [
          { speaker: 'Local', text: 'Oku if somebody else is paying. Lilly\'s if you actually want tacos.' },
        ],
        sb_diner: [
          { speaker: 'Diner', text: 'Best table is outside. The ocean is the whole point.' },
        ],
        sb_shop_window: [
          { speaker: 'Narrator', text: 'A whole fit in the window. JP prices it without meaning to.' },
          { speaker: 'JP\'s Mind', text: 'Dinner first. I can come back.' },
        ],
        sb_record_window: [
          { speaker: 'Narrator', text: 'Records, old show flyers, a speaker playing through the open door.' },
          { speaker: 'JP\'s Mind', text: 'A city can feel expensive without asking you for anything yet.' },
        ],
        sb_waterfront: [
          { speaker: 'Narrator', text: 'Salt in the air. Skate wheels on concrete. Plates landing behind him.' },
          { speaker: 'JP\'s Mind', text: 'For one block, the phone is not the loudest thing in my head.' },
        ],
        sb_trailhead: [
          { speaker: 'K', text: 'Hot Springs next time. Free, if you can survive walking uphill.' },
          { speaker: 'JP', text: 'So dinner tonight.' },
        ],
      },
    };
  }

  protected getObjectiveHint(): string {
    return this.dateChoice
      ? 'Explore the shops or trail, then return to the black 335i.'
      : 'Explore the district. Pick a spot or head back.';
  }

  create() {
    super.create();
    // Optional districts should never become the resume point for a saved run.
    SaveSystem.saveChapter(this.returnScene);
    this.createDistrictIdentity();
    this.cameras.main.setZoom(0.92);
    this.showLocationCard();
  }

  private createDistrictIdentity() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;

    // White stucco, Spanish tile and awnings make the top edge read as Santa
    // Barbara before the player reads a single sign.
    const storefronts = [
      { left: 1, right: 10, color: 0xf0dfbd, roof: 0xb44f35 },
      { left: 12, right: 21, color: 0xe8d6b8, roof: 0xa84430 },
      { left: 23, right: 36, color: 0xf2e6cf, roof: 0xc05a3b },
    ];
    for (const shop of storefronts) {
      const width = (shop.right - shop.left + 1) * tile - 10;
      const center = ((shop.left + shop.right + 1) / 2) * tile;
      this.add.rectangle(center, 2.7 * tile, width, 4.3 * tile, shop.color, 0.18).setDepth(1.28);
      this.add.rectangle(center, 6, width, 12, shop.roof).setDepth(1.5);
      for (let x = shop.left; x <= shop.right; x++) {
        this.add.rectangle(px(x), 10, tile - 8, 5, 0xe8885d, 0.72).setDepth(1.55);
      }
    }

    const sign = (x: number, y: number, text: string, color = '#f5e6c8') =>
      this.add.text(px(x), px(y), text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color,
      }).setOrigin(0.5).setDepth(4);

    sign(6, 4.15, "LILLY'S", '#7d2c22');
    sign(17, 4.15, 'STATE ST. GOODS', '#3b4b55');
    sign(29, 4.15, 'RECORDS + CLOTHES', '#49384f');

    // Street markings, crosswalk and parking pockets keep the four concrete
    // rows readable as a road instead of a gray plaza.
    this.add.rectangle(px(18.5), px(9), 37 * tile, 4, 0xf1d06a, 0.8).setDepth(1.2);
    for (let x = 2; x < 36; x += 4) {
      this.add.rectangle(px(x), px(8.15), 4, 0.9 * tile, 0xffffff, 0.42).setDepth(1.22).setAngle(24);
    }
    for (let y = 8.05; y <= 10.95; y += 0.58) {
      this.add.rectangle(px(18), px(y), 1.15 * tile, 12, 0xf2f0e8, 0.78).setDepth(1.24);
    }
    sign(4.5, 6.55, 'STATE STREET', '#5b3b2d');

    // JP's car is the visual anchor and the only exit.
    this.add.sprite(px(18), px(9), 'car-bmw335i').setScale(SCALE).setTint(0x111111).setDepth(6);
    this.collisionTiles.add('17,9');
    this.collisionTiles.add('18,9');
    this.collisionTiles.add('19,9');

    // Oku patio: clean lines, warm lights and occupied tables facing the water.
    this.add.rectangle(px(30), px(13.15), 10.7 * tile, 13, 0xa84430).setDepth(1.55);
    sign(30, 14.35, 'OKU', '#f7f1e7');
    for (const x of [27, 30, 33]) {
      const light = this.add.circle(px(x), px(17.65), 10, 0xffd990, 0.68).setDepth(3.2);
      this.tweens.add({ targets: light, alpha: 0.28, duration: 1250 + x * 11, yoyo: true, repeat: -1 });
      this.add.rectangle(px(x), px(17.85), 54, 24, 0xf4ecdf).setDepth(2.8).setStrokeStyle(2, 0xb59670);
    }

    // Lilly's service window and the low-cost bench across from the water.
    this.add.rectangle(px(6), px(3.1), 2.7 * tile, 0.95 * tile, 0x27333a).setDepth(2.65).setStrokeStyle(3, 0xe0b76e);
    this.add.rectangle(px(8), px(6.65), 3.2 * tile, 16, 0x7a4a2b).setDepth(2.7);
    for (const x of [7.2, 8.8]) this.add.rectangle(px(x), px(6.9), 18, 46, 0x5b3926).setDepth(2.68);

    // The Pacific and its foam line move continuously; background figures do
    // short purposeful routes instead of idling like wallpaper.
    for (let i = 0; i < 8; i++) {
      const foam = this.add.rectangle(px(2 + i * 5), px(18.05 + (i % 2) * 0.18), 2.6 * tile, 5, 0xe5f5ff, 0.38).setDepth(1.35);
      this.tweens.add({ targets: foam, x: foam.x + 34, alpha: 0.12, duration: 1800 + i * 100, yoyo: true, repeat: -1 });
    }
    const walker = this.add.sprite(px(7), px(11.7), 'npc_cooper').setScale(SCALE * 0.82).setDepth(8).setTint(0xc9d3df);
    this.tweens.add({ targets: walker, x: px(13), duration: 5200, yoyo: true, repeat: -1, hold: 900, ease: 'Sine.easeInOut' });
    const skater = this.add.sprite(px(23), px(11.7), 'npc_david').setScale(SCALE * 0.78).setDepth(8).setTint(0xe1bb78).setFlipX(true);
    this.tweens.add({ targets: skater, x: px(29), duration: 3300, yoyo: true, repeat: -1, hold: 650, ease: 'Linear' });

    sign(35.7, 11.5, 'HOT SPRINGS\nTRAIL', '#355c45');
  }

  private showLocationCard() {
    const card = this.add.text(GAME_WIDTH / 2, 100, 'STATE STREET / WATERFRONT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f5e6c8',
      backgroundColor: '#1a1712', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(120).setAlpha(0);
    const sub = this.add.text(GAME_WIDTH / 2, 137, 'SANTA BARBARA', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#b4d9e8',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(120).setAlpha(0);
    this.tweens.add({ targets: [card, sub], alpha: 0.92, duration: 450, hold: 1700, yoyo: true, onComplete: () => { card.destroy(); sub.destroy(); } });
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'sb_bmw') {
      this.returnToRise();
      return;
    }
    if (interactable.id === 'sb_lillys') {
      this.chooseRestaurant('lillys');
      return;
    }
    if (interactable.id === 'sb_oku') {
      this.chooseRestaurant('oku');
      return;
    }
    if (interactable.id === 'sb_shop_window') {
      this.frozen = true;
      ClosetStore.open(this, 'buy', ClosetStore.owned, () => {
        this.frozen = false;
        this.refreshObjectiveHint();
      });
      return;
    }
    if (interactable.id === 'sb_trailhead') {
      this.visitHotSprings();
      return;
    }
    super.handleInteractable(interactable);
  }

  private chooseRestaurant(choice: 'lillys' | 'oku') {
    if (this.dateChoice) {
      this.dialogue.show([{ speaker: 'JP\'s Mind', text: this.dateChoice === choice
        ? 'Tonight is already handled.'
        : 'Not both. The night does not need another stop.' }]);
      return;
    }

    const price = choice === 'lillys' ? 15 : 80;
    if (!BalanceSystem.canAfford(price)) {
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: `${choice === 'lillys' ? "Lilly's" : 'Oku'} costs $${price}. I do not have it tonight.` },
      ]);
      return;
    }

    this.frozen = true;
    this.dateChoice = choice;
    ChoiceLedger.record('sb_coast_date', choice === 'lillys' ? "Lilly's" : 'Oku');
    const lines: DialogueLine[] = choice === 'lillys'
      ? [
          { speaker: 'Narrator', text: 'Two plates, one bench, the whole Pacific for free.' },
          { speaker: 'K', text: 'Lilly\'s? You remembered.' },
          { speaker: 'JP\'s Mind', text: 'Fifteen dollars. Best money I spent all month.' },
        ]
      : [
          { speaker: 'Narrator', text: 'Oku. Sand-side table. She orders like rent is not real.' },
          { speaker: 'JP', text: 'Get whatever. We\'re good.' },
          { speaker: 'Narrator', text: 'And tonight, they are.' },
          { speaker: 'JP\'s Mind', text: 'Eighty on dinner like it is nothing. The ocean made it feel normal.' },
        ];

    BalanceSystem.spend(price, `Dinner at ${choice}`);
    AffinitySystem.adjust('ch1_gf_k', 1);
    SoundEffects.playPickup();
    this.dialogue.show(lines, () => {
      this.frozen = false;
      this.refreshObjectiveHint();
      this.addNavArrow(18, 10, 'BMW');
    });
  }

  private visitHotSprings() {
    if (ChoiceLedger.get('sb_hike') === 'Went') {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The trail is still there. So is the first place the phone went quiet.' },
      ]);
      return;
    }

    this.frozen = true;
    ChoiceLedger.record('sb_hike', 'Went');
    AffinitySystem.adjust('ch1_gf_k', 1);
    this.dialogue.show([
      { speaker: 'K', text: 'No restaurants. Hot Springs trail. Bring water and do not complain.' },
      { speaker: 'Narrator', text: 'Montecito canyon. Forty minutes up. Phones lose signal halfway—the best feature of the whole trail.' },
      { speaker: 'Narrator', text: 'Warm water, cold air, the coast spread out below them.' },
      { speaker: 'K', text: 'See? Free. Better than Oku.' },
      { speaker: 'JP\'s Mind', text: 'No signal means no orders. First quiet my head has had in a month.' },
      { speaker: 'JP\'s Mind', text: 'Signal comes back on the way down. The messages were waiting.' },
    ], () => {
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  private returnToRise() {
    if (!this.dateChoice) {
      this.frozen = true;
      this.dialogue.show([
        { speaker: 'K', text: 'Not tonight? Fine. Let\'s go.' },
      ], () => this.leaveDistrict(null));
      return;
    }
    this.leaveDistrict(this.dateChoice);
  }

  private leaveDistrict(choice: 'lillys' | 'oku' | null) {
    if (this.exiting) return;
    this.exiting = true;
    this.frozen = true;
    SoundEffects.playCarDrive();
    this.cameras.main.fadeOut(550, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.onComplete?.(choice);
      const returnScene = this.scene.get(this.returnScene);
      if (returnScene.scene.isSleeping()) {
        this.scene.wake(this.returnScene, { stateStreetChoice: choice });
        this.scene.stop();
      } else {
        this.scene.start(this.returnScene, { stateStreetChoice: choice });
      }
    });
  }
}
