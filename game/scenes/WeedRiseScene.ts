import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { weedRiseMap, type MapData } from '../data/maps';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_HEIGHT, GAME_WIDTH, SCALE, SCALED_TILE } from '../config';
import { SoundEffects } from '../systems/SoundEffects';
import { MusicSystem } from '../systems/MusicSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { WhipMenu, type WhipDestination } from '../systems/WhipMenu';
import { BalanceSystem } from '../systems/BalanceSystem';
import { AffinitySystem } from '../systems/AffinitySystem';

/**
 * The missing middle of the street act.
 *
 * Santa Barbara shows the first desperate front. This chapter shows why JP did
 * not stop: the first run worked, the phone got busier, and danger slowly became
 * routine. Buyers and locations are composites. The emotional progression is
 * the documentary truth.
 */
export class WeedRiseScene extends BaseChapterScene {
  private bagged = false;
  private ordersReady = false;
  private routeCompleted = false;
  private stashHidden = false;
  private orderPolicy: 'all' | 'limit' = 'all';
  private charSnuck = false;
  private rentalUsed = false;

  constructor() {
    super({ key: 'WeedRiseScene' });
    this.chapterTitle = 'Chapter 3: The Rise';
    this.nextScene = 'WrongCrowdScene';
    this.requiredInteractionId = 'rise_stash';
  }

  protected getPlayerTexture(): string {
    return 'player-ch1';
  }

  protected getMusicTrack(): string {
    return 'weed-rise';
  }

  create() {
    super.create();
    this.createRiseIdentity();
    this.addNavArrow(18, 28, 'Next chapter');

    const car = this.add.sprite(
      14 * SCALED_TILE + SCALED_TILE / 2,
      14 * SCALED_TILE + SCALED_TILE / 2,
      'car-bmw335i',
    ).setScale(SCALE).setDepth(6);
    car.setTint(0x111111);
    this.collisionTiles.add('14,14');
  }

  private createRiseIdentity() {
    const tile = SCALED_TILE;

    // Same Santa Barbara chapter, later and more operational: Spanish roofs
    // remain, but the road, parked cars and separate delivery doors dominate.
    const roofBands = [
      { left: 2, right: 25, y: 2 },
      { left: 2, right: 10, y: 20 },
      { left: 13, right: 21, y: 20 },
      { left: 24, right: 33, y: 20 },
    ];
    for (const roof of roofBands) {
      const width = (roof.right - roof.left + 1) * tile;
      const center = ((roof.left + roof.right + 1) / 2) * tile;
      this.add.rectangle(center, roof.y * tile + 7, width, 14, 0x8d382b).setDepth(1.35);
      for (let x = roof.left; x <= roof.right; x++) {
        this.add.rectangle(x * tile + tile / 2, roof.y * tile + 5, tile - 6, 5, 0xc45f40).setDepth(1.4);
      }
    }

    // Each delivery address gets a different porch light and material accent,
    // which makes the route readable without naming real buyers.
    const porches = [
      { x: 6, color: 0xe7b95f },
      { x: 17, color: 0x76b7c8 },
      { x: 29, color: 0xd98fa7 },
    ];
    for (const porch of porches) {
      const px = porch.x * tile + tile / 2;
      const py = 20.25 * tile;
      const light = this.add.circle(px, py, 12, porch.color, 0.55).setDepth(2.1);
      this.tweens.add({ targets: light, alpha: 0.28, duration: 1100 + porch.x * 17, yoyo: true, repeat: -1 });
      this.add.rectangle(px, 19.5 * tile, 44, 10, 0x8d382b).setDepth(1.45);
    }

    // Parking stripes and a dusk streetlamp sell the constant in-and-out loop.
    for (let x = 3; x < 34; x += 4) {
      this.add.rectangle(x * tile, 14.4 * tile, 4, 3.7 * tile, 0xe8e2d6, 0.46).setDepth(0.8).setAngle(22);
    }
    for (const x of [2, 18, 34]) {
      this.add.rectangle(x * tile, 17.1 * tile, 6, 60, 0x3d4748).setDepth(1.8);
      const lamp = this.add.circle(x * tile, 16.65 * tile, 9, 0xf1d17a, 0.72).setDepth(1.9);
      this.tweens.add({ targets: lamp, alpha: 0.35, duration: 1600, yoyo: true, repeat: -1 });
    }

    this.createTownhouseDensity();
    this.createPackingCrew();
    this.createDeliveryNeighborhood();
    this.createRouteAtmosphere();
  }

  // The payroll, visible: K and the roommate at the table, packing.
  private createPackingCrew() {
    const tile = SCALED_TILE;
    const px = (v: number) => v * tile + tile / 2;
    const k = this.add.sprite(px(5.4), px(7.2), 'npc_k', 0).setScale(SCALE * 0.95).setDepth(3.2);
    const roommate = this.add.sprite(px(7.2), px(7.2), 'npc_female', 0).setScale(SCALE * 0.95).setDepth(3.2).setTint(0xd8c8e8);
    this.tweens.add({ targets: k, y: px(7.2) - 3, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: roommate, y: px(7.2) - 3, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300 });
    // Preroll trays: little white cylinders accumulating
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(px(5.9 + (i % 3) * 0.35), px(7.75 + Math.floor(i / 3) * 0.2), 12, 4, 0xf0ead8).setDepth(3.1).setAngle(-10 + i * 4);
    }
    this.add.text(px(6.3), px(8.55), 'THE TABLE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#8a6a52',
    }).setOrigin(0.5).setDepth(3.1).setAlpha(0.7);
  }

  private createTownhouseDensity() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;
    const rect = (x: number, y: number, width: number, height: number, color: number, depth = 2.15, alpha = 1) =>
      this.add.rectangle(px(x), px(y), width * tile, height * tile, color, alpha).setDepth(depth);
    const prop = (texture: string, x: number, y: number, scale = 0.82, tint?: number) => {
      const sprite = this.add.sprite(px(x), px(y), texture).setScale(SCALE * scale).setDepth(3.15);
      if (tint !== undefined) sprite.setTint(tint);
      return sprite;
    };
    const block = (...tiles: Array<[number, number]>) => {
      for (const [x, y] of tiles) this.collisionTiles.add(`${x},${y}`);
    };

    // Living room / packing room: the social space has turned into an order
    // station without ever becoming a professional operation.
    rect(6.3, 7.8, 5.6, 2.2, 0x5a3028, 2.02);
    rect(6.3, 7.8, 5.1, 1.7, 0x9b5a45, 2.04);
    for (let x = 4.2; x <= 8.4; x += 0.7) {
      this.add.rectangle(px(x), px(7.8), 4, 1.45 * tile, 0xd59668, 0.28).setDepth(2.06);
    }
    prop('item-couch', 3.7, 7.9, 0.95, 0x6f493c);
    prop('item-tv', 9.4, 7.9, 0.82);
    prop('item-speaker', 9.5, 6.6, 0.68);
    prop('item-laundry-basket', 3.6, 3.5, 0.7);
    prop('item-storage-box', 4.5, 3.5, 0.72);
    prop('item-letter', 5.4, 3.5, 0.72);
    rect(5.1, 4.3, 3.5, 0.55, 0x4f3428, 2.7);
    for (const x of [4.2, 5.1, 6.0]) {
      this.add.rectangle(px(x), px(4.15), 34, 20, x === 5.1 ? 0xebe4d6 : 0x94724f).setDepth(2.82).setAngle(x === 4.2 ? -8 : x === 6 ? 7 : 0);
    }
    block([3, 8], [9, 8], [4, 3]);

    // JP's room: bed, clothes, shoes, an always-on phone glow and one narrow
    // clear strip from the living room door to the parking-lot door.
    rect(15.4, 6.2, 5.4, 2.8, 0x2f4350, 2.01);
    rect(15.4, 6.2, 4.8, 2.2, 0x496979, 2.03);
    prop('item-bed', 13.2, 3.4, 0.92, 0xd6d1c5);
    prop('item-nightstand', 14.4, 3.4, 0.65);
    const phoneGlow = this.add.circle(px(14.4), px(3.2), 11, 0x76b7ff, 0.4).setDepth(3.05);
    this.tweens.add({ targets: phoneGlow, alpha: 0.12, duration: 620, yoyo: true, repeat: -1 });
    prop('item-closet', 18.1, 8.3, 0.85);
    prop('item-shoe-rack', 16.8, 8.4, 0.76);
    prop('item-laundry-basket', 12.4, 8.3, 0.7, 0x6f7c91);
    for (const [x, y, color] of [[14.3, 8.35, 0x1e2430], [15.0, 8.5, 0xd9d9d9], [15.6, 8.32, 0x4e6e9f]] as const) {
      this.add.rectangle(px(x), px(y), 30, 14, color).setDepth(3.05).setAngle((x - 15) * 14);
    }
    block([13, 3], [18, 8], [17, 8], [12, 8]);

    // Kitchen: full counters, sink, fridge, table, takeout and the stash panel.
    rect(22, 3.25, 5.1, 0.7, 0x674935, 2.5);
    rect(24.1, 6.0, 0.75, 4.9, 0x674935, 2.5);
    for (const x of [20.1, 21.2, 22.3, 23.4]) {
      this.add.rectangle(px(x), px(3.08), 54, 10, 0xc9b18b).setDepth(2.62);
    }
    prop('item-fridge', 20.2, 4.1, 0.88, 0xe2dfd5);
    prop('item-bottle', 23.3, 3.25, 0.58, 0x8ec5d2);
    prop('item-food', 20.7, 7.4, 0.72);
    prop('item-bottle', 21.4, 7.45, 0.52, 0xb86f43);
    prop('item-letter', 20.1, 8.4, 0.62);
    rect(21.0, 7.8, 2.5, 1.7, 0x5a3828, 2.42);
    this.add.rectangle(px(21), px(7.8), 2.05 * tile, 1.25 * tile, 0x8a5a3e).setDepth(2.45);
    for (const [x, y] of [[20, 7], [22, 7], [20, 9], [22, 9]] as Array<[number, number]>) {
      prop('item-nightstand', x, y, 0.52, 0x6d4635);
    }
    this.add.rectangle(px(24.1), px(8.2), 34, 48, 0x4a3427).setDepth(2.7).setStrokeStyle(3, 0x9b7858);
    this.add.text(px(24.1), px(8.2), 'PANEL', {
      fontFamily: 'monospace', fontSize: '7px', color: '#c6ad86',
    }).setOrigin(0.5).setDepth(2.75);
    block([20, 4], [24, 4], [24, 5], [24, 6], [20, 7], [22, 7]);
  }

  private createDeliveryNeighborhood() {
    const tile = SCALED_TILE;
    const px = (value: number) => value * tile + tile / 2;
    const prop = (texture: string, x: number, y: number, scale = 0.74, tint?: number) => {
      const sprite = this.add.sprite(px(x), px(y), texture).setScale(SCALE * scale).setDepth(3.1);
      if (tint !== undefined) sprite.setTint(tint);
      return sprite;
    };

    // Three houses, three lives. The buyers remain composites, but the rooms
    // are specific enough to feel inhabited instead of copied boxes.
    const rugs = [
      { x: 6, color: 0x315f78, accent: 0xd6bc76 },
      { x: 17, color: 0x574c73, accent: 0xa8b58f },
      { x: 29, color: 0x7b384b, accent: 0xd38f6f },
    ];
    for (const rug of rugs) {
      this.add.rectangle(px(rug.x), px(24.35), 5.2 * tile, 1.8 * tile, rug.color).setDepth(2.02);
      this.add.rectangle(px(rug.x), px(24.35), 4.7 * tile, 1.4 * tile, rug.accent, 0.25).setDepth(2.04);
      for (const dx of [-1.6, -0.8, 0, 0.8, 1.6]) {
        this.add.rectangle(px(rug.x + dx), px(24.35), 3, 1.25 * tile, rug.accent, 0.38).setDepth(2.06);
      }
    }

    // First referral: student apartment, game on, shoes and takeout by door.
    prop('item-couch', 3.2, 22.0, 0.8, 0x47677e);
    prop('item-tv', 8.7, 22.0, 0.72);
    prop('item-food', 4.1, 25.2, 0.58);
    prop('item-shoe-rack', 8.7, 25.2, 0.62);
    prop('item-poster', 4.1, 21.0, 0.62, 0x78a2c8);

    // Repeat buyer: cleaner, quieter, mail stacked beside a work laptop.
    prop('item-desk', 14.5, 22.0, 0.76, 0x6f5c4c);
    prop('item-tablet', 14.5, 21.75, 0.48);
    prop('item-couch', 19.8, 25.0, 0.75, 0x6b647d);
    prop('item-letter', 14.3, 25.0, 0.52);
    prop('item-lamp', 20.3, 22.0, 0.58);

    // New referral: louder room, speaker, drinks, people already waiting.
    prop('item-speaker', 26.2, 22.0, 0.76);
    prop('item-couch', 31.8, 22.0, 0.8, 0x7e4658);
    prop('item-bottle', 26.2, 25.2, 0.52, 0xc99861);
    prop('item-bottle', 27.0, 25.3, 0.48, 0x5f9b8c);
    prop('item-led-strip', 32.8, 21.0, 0.72, 0xd76ea3);

    for (const house of [{ x: 6, label: 'A' }, { x: 17, label: 'B' }, { x: 29, label: 'C' }]) {
      this.add.rectangle(px(house.x + 1.25), px(20.25), 32, 22, 0x3f3028).setDepth(2.3);
      this.add.text(px(house.x + 1.25), px(20.25), house.label, {
        fontFamily: 'monospace', fontSize: '10px', color: '#d8c6a6',
      }).setOrigin(0.5).setDepth(2.35);
    }
  }

  private createRouteAtmosphere() {
    const tile = SCALED_TILE;
    const roadY = 13.35 * tile + tile / 2;

    // Traffic never stops for JP's route. These are background vehicles, not
    // collision objects, so the playable road remains reliable.
    const traffic = [
      { x: -2 * tile, y: roadY - 28, tint: 0x7f8a93, duration: 8800 },
      { x: 38 * tile, y: roadY + 34, tint: 0x6f493f, duration: 10600 },
    ];
    traffic.forEach((carData, index) => {
      const car = this.add.sprite(carData.x, carData.y, 'item-car').setScale(SCALE * 0.82).setTint(carData.tint).setDepth(2.45).setAlpha(0.78);
      if (index === 1) car.setFlipX(true);
      this.tweens.add({
        targets: car,
        x: index === 0 ? 38 * tile : -2 * tile,
        duration: carData.duration,
        repeat: -1,
        onRepeat: () => { car.x = index === 0 ? -2 * tile : 38 * tile; },
        ease: 'Linear',
      });
    });

    // A third car behaves like an arrival instead of more looping traffic:
    // it pulls up, sits long enough for the player to notice, then leaves.
    // Keeping it decorative preserves the road collision and route logic.
    const arrival = this.add.container(38 * tile, 15.45 * tile).setDepth(2.52).setAlpha(0.9);
    const arrivalCar = this.add.sprite(0, 0, 'item-car').setScale(SCALE * 0.86).setTint(0x344d63);
    const headlightA = this.add.circle(-20, -13, 5, 0xf3d58a, 0.48);
    const headlightB = this.add.circle(-20, 13, 5, 0xf3d58a, 0.48);
    arrival.add([headlightA, headlightB, arrivalCar]);
    this.tweens.add({
      targets: arrival,
      x: 28.4 * tile,
      duration: 2800,
      hold: 3200,
      yoyo: true,
      repeat: -1,
      repeatDelay: 6800,
      ease: 'Sine.easeInOut',
    });

    // Sidewalk movement makes the route feel inhabited. These figures are
    // intentionally non-interactive composites: they suggest people coming
    // and going without adding fake names or blocking the player's path.
    const sidewalkPeople = [
      { texture: 'npc_generic', fromX: 1.6, toX: 10.5, y: 17.55, tint: 0x8ba2ae, duration: 7600, delay: 400 },
      { texture: 'npc_female', fromX: 34.2, toX: 25.4, y: 18.05, tint: 0xb88391, duration: 8900, delay: 2300 },
    ];
    sidewalkPeople.forEach((person, index) => {
      const walker = this.add.sprite(person.fromX * tile, person.y * tile, person.texture)
        .setScale(SCALE * 0.78)
        .setTint(person.tint)
        .setDepth(2.58)
        .setAlpha(0.86);
      if (index === 1) walker.setFlipX(true);
      this.tweens.add({
        targets: walker,
        x: person.toX * tile,
        duration: person.duration,
        delay: person.delay,
        hold: 900,
        yoyo: true,
        repeat: -1,
        repeatDelay: 1200,
        ease: 'Linear',
        onYoyo: () => walker.setFlipX(!walker.flipX),
        onRepeat: () => walker.setFlipX(!walker.flipX),
      });
    });

    // Two strangers keep meeting at the same curb, pausing, and separating.
    // Nothing is labeled or explained; repetition is the story detail.
    const curbMeet = [
      { texture: 'npc_kid', fromX: 12.8, toX: 16.3, tint: 0x768ea0, delay: 0 },
      { texture: 'npc_generic', fromX: 20.5, toX: 17.0, tint: 0x9d806d, delay: 220 },
    ];
    curbMeet.forEach((person, index) => {
      const figure = this.add.sprite(person.fromX * tile, 17.45 * tile, person.texture)
        .setScale(SCALE * 0.76)
        .setTint(person.tint)
        .setDepth(2.61)
        .setAlpha(0.9)
        .setFlipX(index === 0);
      this.tweens.add({
        targets: figure,
        x: person.toX * tile,
        duration: 1900,
        delay: person.delay,
        hold: 1500,
        yoyo: true,
        repeat: -1,
        repeatDelay: 5400,
        ease: 'Sine.easeInOut',
      });
    });

    // Dumpsters, mailboxes and stacked delivery clutter fill the dead edges of
    // the parking lot while preserving the central driving path.
    for (const [x, y] of [[3, 12], [33, 16], [25, 12]] as Array<[number, number]>) {
      this.add.sprite(x * tile + tile / 2, y * tile + tile / 2, 'item-storage-box')
        .setScale(SCALE * 0.68).setTint(0x58615d).setDepth(2.7);
    }
    for (const x of [5, 16, 28]) {
      this.add.rectangle(x * tile + tile / 2, 19.1 * tile, 18, 36, 0x4d5557).setDepth(2.25);
      this.add.rectangle(x * tile + tile / 2, 18.85 * tile, 24, 8, 0x727b7d).setDepth(2.3);
    }

    const windowLights = [
      { x: 4, y: 21.1, color: 0x8bbbd0 },
      { x: 15, y: 21.1, color: 0xe0b36f },
      { x: 31, y: 21.1, color: 0xd47fa6 },
    ];
    windowLights.forEach((light, index) => {
      const glow = this.add.rectangle(light.x * tile + tile / 2, light.y * tile, 58, 32, light.color, 0.3).setDepth(2.2);
      this.tweens.add({ targets: glow, alpha: 0.12, duration: 1300 + index * 420, yoyo: true, repeat: -1 });
    });
  }

  getMapData(): MapData {
    return weedRiseMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return {
      intro: [
        { speaker: 'Narrator', text: 'The first run paid the plug back.' },
        { speaker: 'Narrator', text: 'The next one put money in JP\'s pocket.' },
        { speaker: 'Narrator', text: 'Then the phone started ringing without him asking.' },
        { speaker: 'JP\'s Mind', text: 'I said I would stop when I made the LUNA money back.' },
        { speaker: 'JP\'s Mind', text: 'I stopped keeping track of when that happened.' },
      ],
      npcs: {
        rise_nolan: [
          { speaker: 'Nolan', text: 'Bro, your phone has not stopped buzzing all morning.' },
          { speaker: 'JP', text: 'That\'s a good thing.' },
          { speaker: 'Nolan', text: 'It is until it isn\'t.' },
          { speaker: 'JP\'s Mind', text: 'He still wanted the parties. He just did not want to see what paid for them.' },
        ],
        rise_jose: [
          { speaker: 'Jose', text: 'You used to answer the first time I called.' },
          { speaker: 'JP', text: 'I\'ve been busy.' },
          { speaker: 'Jose', text: 'Nah. You\'ve been somewhere else.' },
          { speaker: 'Jose', text: 'Just do not disappear on everybody, bro.' },
        ],
        rise_first_buyer: [
          { speaker: 'Buyer', text: 'My friend said you always come through.' },
          { speaker: 'JP', text: 'Your friend talks too much.' },
          { speaker: 'Buyer', text: 'Still came through though.' },
        ],
        rise_repeat_buyer: [
          { speaker: 'Buyer', text: 'Same as last time.' },
          { speaker: 'Narrator', text: 'No greeting. No small talk. Routine.' },
          { speaker: 'JP\'s Mind', text: 'That was the part that should have scared me.' },
        ],
        rise_new_buyer: [
          { speaker: 'Buyer', text: 'I got your number from somebody at the party.' },
          { speaker: 'JP\'s Mind', text: 'Everybody knew somebody. That was how it spread.' },
        ],
        rise_bed: [
          { speaker: 'Narrator', text: 'The phone sleeps under JP\'s pillow now.' },
          { speaker: 'Narrator', text: 'Buzz. Wake up. Leave. Return. Repeat.' },
        ],
        rise_mirror: [
          { speaker: 'Narrator', text: 'Hauls all over the room. Bags with tags, boxes with plastic still on.' },
          { speaker: 'JP\'s Mind', text: 'Fit game stupid right now. New drip for me, new drip for her.' },
          { speaker: 'JP\'s Mind', text: 'Fly fit on, bread in the pocket, phone full of huzz. I looked GOOD.' },
          { speaker: 'JP\'s Mind', text: 'Less sleep behind the eyes though.' },
        ],
        rise_kitchen: [
          { speaker: 'Narrator', text: 'Chick-fil-A bags stacked on Taco Bell bags. DoorDash to the door every night, for JP and whoever\'s around.' },
          { speaker: 'Narrator', text: 'Food for everybody. Drinks for everybody. Life is catered.' },
          { speaker: 'JP\'s Mind', text: 'Hella bread. Hella motion. People texting ME to buy. This is what winning looks like.' },
        ],
        rise_receipts: [
          { speaker: 'Narrator', text: 'Gas. Food. Clothes. Nights out. Cash disappears quietly.' },
          { speaker: 'Narrator', text: 'Also on the books: the girlfriend\'s roommate. Twenty an hour, packing prerolls at the kitchen table.' },
          { speaker: 'JP\'s Mind', text: 'I had PAYROLL. Twenty years old with a whole employee. Lowkey hilarious.' },
          { speaker: 'Narrator', text: 'K packs too. K has never once been paid.' },
          { speaker: 'JP\'s Mind', text: 'We got a different compensation structure.' },
          { speaker: 'JP\'s Mind', text: 'More money coming in. Somehow still chasing it.' },
        ],
        rise_order_board: [
          { speaker: 'Narrator', text: 'Names are reduced to initials, times and crossed-out addresses.' },
          { speaker: 'JP\'s Mind', text: 'A whole day can fit on one folded sheet.' },
        ],
        rise_laundry: [
          { speaker: 'Narrator', text: 'Clean clothes never make it into the closet anymore.' },
          { speaker: 'JP\'s Mind', text: 'Grab a shirt. Check the phone. Leave again.' },
        ],
        rise_takeout: [
          { speaker: 'Narrator', text: 'Half the kitchen is takeout containers and unopened groceries.' },
          { speaker: 'JP\'s Mind', text: 'Money saves time until the life it buys takes all of it.' },
        ],
        rise_trunk: [
          { speaker: 'Narrator', text: 'Gas receipts, spare clothes and a trunk that never really empties.' },
          { speaker: 'JP\'s Mind', text: 'Everything I need to stay out longer.' },
        ],
        rise_mailbox: [
          { speaker: 'Narrator', text: 'Bills for people who live normal days.' },
          { speaker: 'JP\'s Mind', text: 'I keep checking the street before I check the mail.' },
        ],
        rise_overlook: [
          { speaker: 'Narrator', text: 'Santa Barbara looks clean from up here.' },
          { speaker: 'JP\'s Mind', text: 'From far enough away, everything does.' },
        ],
        rise_exit_note: [
          { speaker: 'JP\'s Mind', text: 'The first time felt like a decision.' },
          { speaker: 'JP\'s Mind', text: 'Now it just feels like Tuesday.' },
        ],
      },
    };
  }

  protected getObjectiveHint(): string {
    if (!this.bagged) return 'Use the scale in the living room.';
    if (!this.ordersReady) return 'Check the phone.';
    if (!this.routeCompleted) return 'Take the BMW out.';
    if (!this.stashHidden) return 'Put the return away in the kitchen.';
    return 'Explore, then take the south path when ready.';
  }

  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    if (npcId === 'rise_jose') {
      ChoiceLedger.record('jose_text', 'Left it on read');
    }
    super.handleNPCDialogue(npcId, dialogue);
  }

  private beachDateDone = false;
  private secondDateTried = false;
  private hikeDone = false;

  private showSbCutaway(kind: 'coast' | 'lillys' | 'oku' | 'hot_springs'): () => void {
    const objects: Array<Phaser.GameObjects.GameObject & Partial<Phaser.GameObjects.Components.Alpha> & Partial<Phaser.GameObjects.Components.ScrollFactor> & Partial<Phaser.GameObjects.Components.Depth>> = [];
    const d = 240;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const add = <T extends Phaser.GameObjects.GameObject & Partial<Phaser.GameObjects.Components.ScrollFactor> & Partial<Phaser.GameObjects.Components.Depth>>(obj: T): T => {
      obj.setScrollFactor?.(0);
      obj.setDepth?.(d + objects.length / 100);
      objects.push(obj);
      return obj;
    };

    add(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x061018, 0.78));
    add(this.add.rectangle(cx, cy + 145, GAME_WIDTH, 170, 0x12395a, 1));
    for (let i = 0; i < 5; i++) {
      add(this.add.rectangle(cx - 460 + i * 230, cy + 90 + i % 2 * 20, 150, 5, 0xdaf3ff, 0.34));
    }
    // Low coast silhouette: enough Santa Barbara identity without turning the
    // cutaway into a whole extra map.
    add(this.add.triangle(cx - 340, cy + 62, 0, 56, 140, 0, 280, 56, 0x18242a, 0.95));
    add(this.add.triangle(cx + 385, cy + 66, 0, 62, 180, 0, 360, 62, 0x18242a, 0.95));
    for (const palmX of [cx - 520, cx + 520]) {
      add(this.add.rectangle(palmX, cy + 40, 8, 126, 0x3e2b1f, 1).setAngle(palmX < cx ? -4 : 4));
      for (let i = 0; i < 5; i++) {
        add(this.add.rectangle(palmX + (i - 2) * 12, cy - 30 + Math.abs(i - 2) * 6, 48, 7, 0x244c35, 1).setAngle((i - 2) * 18));
      }
    }
    add(this.add.rectangle(cx, cy + 235, GAME_WIDTH, 86, 0xd9b06f, 1));

    if (kind === 'coast' || kind === 'lillys') {
      // Lilly's: tiny taco window, paper plates, and a bench with the Pacific doing half the work.
      add(this.add.rectangle(cx - 260, cy + 30, 210, 120, 0xf1dfbf, 1).setStrokeStyle(4, 0x8f4d32));
      add(this.add.rectangle(cx - 260, cy - 15, 120, 48, 0x24323a, 1).setStrokeStyle(3, 0xf0c040));
      add(this.add.text(cx - 260, cy - 18, "LILLY'S", {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
      }).setOrigin(0.5));
      add(this.add.rectangle(cx - 90, cy + 190, 260, 18, 0x7a4a2a, 1));
      add(this.add.rectangle(cx - 170, cy + 160, 22, 55, 0x5b3926, 1));
      add(this.add.rectangle(cx - 10, cy + 160, 22, 55, 0x5b3926, 1));
      for (const x of [cx - 130, cx - 70]) {
        add(this.add.circle(x, cy + 178, 16, 0xf5e7c8, 1).setStrokeStyle(2, 0xb45f2c));
      }
    }

    if (kind === 'coast' || kind === 'oku') {
      // Oku: clean patio geometry, white table, warm lanterns, money on the water.
      add(this.add.rectangle(cx + 260, cy + 25, 245, 135, 0xefe8da, 1).setStrokeStyle(4, 0x2b3d50));
      add(this.add.rectangle(cx + 260, cy - 55, 260, 22, 0x1b2b34, 1));
      add(this.add.text(cx + 260, cy - 58, 'OKU', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#ffffff',
      }).setOrigin(0.5));
      for (const x of [cx + 170, cx + 260, cx + 350]) {
        add(this.add.circle(x, cy - 8, 12, 0xffd98c, 0.78));
        add(this.add.rectangle(x, cy + 58, 46, 34, 0xf7f1e6, 1).setStrokeStyle(2, 0xc9b98a));
      }
      add(this.add.rectangle(cx + 260, cy + 138, 230, 10, 0x9c6d3d, 1));
    }

    if (kind === 'hot_springs') {
      add(this.add.rectangle(cx, cy + 20, 760, 230, 0x192a24, 1));
      for (let i = 0; i < 9; i++) {
        add(this.add.circle(cx - 330 + i * 82, cy + 52 + (i % 3) * 26, 44, 0x33483a, 1));
      }
      add(this.add.ellipse(cx, cy + 95, 340, 116, 0x5aa0a6, 0.82).setStrokeStyle(5, 0xb6f0e8));
      for (let i = 0; i < 6; i++) {
        const steam = add(this.add.text(cx - 115 + i * 46, cy + 38, '~', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#d8f7ff',
        }).setOrigin(0.5).setAlpha(0.36));
        this.tweens.add({ targets: steam, y: cy + 15, alpha: 0.08, duration: 1300 + i * 120, yoyo: true, repeat: -1 });
      }
      add(this.add.text(cx, cy - 58, 'HOT SPRINGS TRAIL', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#e8e0c8',
      }).setOrigin(0.5));
      add(this.add.text(cx, cy + 178, 'NO SIGNAL', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#7fa8a0',
      }).setOrigin(0.5));
    }

    objects.forEach((obj) => {
      obj.setAlpha?.(0);
      this.tweens.add({ targets: obj, alpha: 1, duration: 450 });
    });

    return () => {
      this.tweens.add({
        targets: objects.filter(o => o.active),
        alpha: 0,
        duration: 300,
        onComplete: () => objects.forEach(o => { try { o.destroy(); } catch { /* ignore */ } }),
      });
    };
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // ── SB coast eats: same ocean, two price tags. King era can afford either. ──
    if (interactable.id === 'rise_overlook' && this.beachDateDone && this.secondDateTried && !this.hikeDone) {
      this.hikeDone = true;
      this.frozen = true;
      const closeCutaway = this.showSbCutaway('hot_springs');
      this.dialogue.show([
        { speaker: 'K', text: 'No restaurants. Hot Springs trail. Bring water and don\'t complain.' },
        { speaker: 'Narrator', text: 'Montecito canyon. Forty minutes up. Phones lose signal halfway — the best feature of the whole trail.' },
        { speaker: 'Narrator', text: 'Warm water, cold air, the whole coast laid out below.' },
        { speaker: 'K', text: 'See? Free. Better than Oku.' },
        { speaker: 'JP\'s Mind', text: 'She\'s right. No signal means no orders. First quiet my head\'s had in a month.' },
        { speaker: 'JP\'s Mind', text: 'The phone found signal on the way down. Eleven missed messages. Back to it.' },
      ], () => { closeCutaway(); AffinitySystem.adjust('ch1_gf_k', 1); this.frozen = false; });
      return;
    }

    if (interactable.id === 'rise_overlook' && this.beachDateDone && !this.secondDateTried) {
      this.frozen = true;
      this.secondDateTried = true;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'Phone full of options. Options got standards though.' },
      ], () => {
        this.showRouteChoice('Who you texting?', 'Lily', 'Sam', () => {
          // Lily: boujee tier. Pretty tax is real.
          this.dialogue.show([
            { speaker: 'JP', text: '(text) lilly\'s run?' },
            { speaker: 'Lily', text: '(text) that\'s cute. oku has my table. 8pm.' },
            { speaker: 'JP\'s Mind', text: 'Lily heard \'taqueria\' and left me on read for a full minute. Boujee tax it is.' },
          ], () => {
            this.showRouteChoice('Oku. Lily\'s table.', 'Pay it -$100', 'Cancel', () => {
              const closeCutaway = this.showSbCutaway('oku');
              BalanceSystem.spend(100);
              AffinitySystem.adjust('ch1_lily', 1);
              this.dialogue.show([
                { speaker: 'Narrator', text: 'She shows up twenty minutes late looking like the reason menus don\'t have prices.' },
                { speaker: 'Lily', text: 'You can afford me tonight. Congratulations.' },
                { speaker: 'JP\'s Mind', text: 'A hundred dollars. Worth every cent. Don\'t tell her I said that.' },
              ], () => { closeCutaway(); this.frozen = false; });
            }, () => {
              this.dialogue.show([
                { speaker: 'Lily', text: '(text) lol. call me when the budget grows up.' },
              ], () => { this.frozen = false; });
            });
          });
        }, () => {
          // Sam: the door the life closes. No tier fixes this one.
          this.dialogue.show([
            { speaker: 'JP', text: '(text) dinner this week? anywhere u want' },
            { speaker: 'Sam', text: '(text) you\'re fun. but i know what you do for money.' },
            { speaker: 'Sam', text: '(text) study group. every night. good luck jp, i mean it.' },
            { speaker: 'JP\'s Mind', text: 'Goodies don\'t date the plug. No amount of sushi fixes that.' },
            { speaker: 'JP\'s Mind', text: 'She hears the clock. I\'m the clock.' },
          ], () => { this.frozen = false; });
        });
      });
      return;
    }

    if (interactable.id === 'rise_overlook' && !this.beachDateDone) {
      this.frozen = true;
      const closeCoast = this.showSbCutaway('coast');
      this.dialogue.show([
        { speaker: 'Narrator', text: 'The coast. Taco window on the left. The sushi spot on the sand, right there on the water.' },
        { speaker: 'JP\'s Mind', text: 'K deserves a night out. Question is which one.' },
      ], () => {
        this.showRouteChoice('Take K out?', 'Lilly\'s Taqueria -$15', 'Oku on the water -$80', () => {
          closeCoast();
          const closeCutaway = this.showSbCutaway('lillys');
          this.beachDateDone = true;
          BalanceSystem.spend(15);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Two plates, one bench, the whole Pacific for free.' },
            { speaker: 'K', text: 'Lilly\'s?? This is literally my favorite spot and you know it.' },
            { speaker: 'JP\'s Mind', text: 'Fifteen dollars. Best money I spent all month, and I spent a LOT of money this month.' },
          ], () => { closeCutaway(); AffinitySystem.adjust('ch1_gf_k', 1); this.frozen = false; });
        }, () => {
          closeCoast();
          const closeCutaway = this.showSbCutaway('oku');
          this.beachDateDone = true;
          BalanceSystem.spend(80);
          this.dialogue.show([
            { speaker: 'Narrator', text: 'Oku. Sand-side table. She orders like rent isn\'t real.' },
            { speaker: 'JP', text: 'Get whatever. We\'re good.' },
            { speaker: 'Narrator', text: 'And tonight, they are.' },
            { speaker: 'JP\'s Mind', text: 'Eighty on dinner like it\'s nothing. The ocean made it feel normal.' },
          ], () => { closeCutaway(); AffinitySystem.adjust('ch1_gf_k', 1); this.frozen = false; });
        });
      });
      return;
    }
    if (interactable.id === 'rise_bed' && this.ordersReady && !this.charSnuck && ChoiceLedger.get('char_sneak') === null) {
      this.playCharSneak();
      return;
    }
    if (interactable.id === 'rise_scale') {
      if (this.bagged) {
        this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Already bagged. Phone next.' }]);
        return;
      }
      this.playWeighingRun();
      return;
    }

    if (interactable.id === 'rise_phone') {
      if (!this.bagged) {
        this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Nothing is ready yet. Use the scale first.' }]);
        return;
      }
      if (!this.ordersReady) {
        this.playOrderRush();
        return;
      }
      this.dialogue.show([
        { speaker: 'Narrator', text: 'More messages arrive while JP is reading the old ones.' },
        { speaker: 'JP\'s Mind', text: 'Everybody needs something right now.' },
      ]);
      return;
    }

    if (interactable.id === 'rise_bmw') {
      this.openWhip();
      return;
    }

    if (interactable.id === 'rise_stash') {
      if (!this.routeCompleted) {
        this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Nothing to put away yet.' }]);
        return;
      }
      if (!this.stashHidden) {
        this.stashHidden = true;
        this.requiredDone = true;
        this.interactions.consume(interactable.id);
        MusicSystem.transitionTo('weed-paranoia', 1200);
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP counts the return twice and hides it behind the kitchen panel.' },
          { speaker: 'Narrator', text: 'For a minute, being back at zero feels impossible.' },
          { speaker: 'Narrator', text: 'Then a car slows outside.' },
          { speaker: 'Narrator', text: 'JP waits until the engine fades before he breathes again.' },
          { speaker: 'Narrator', text: 'That is how fear becomes routine too.' },
        ], () => this.refreshObjectiveHint());
        return;
      }
    }

    super.handleInteractable(interactable);
  }

  // Director Mode can launch this directly for pacing and gate tests.
  private playWeighingRun() {
    // Era menu: strains named like superheroes and desserts

    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
      objects.push(object);
      return object;
    };

    add(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x050508, 0.94).setScrollFactor(0).setDepth(400));
    add(this.add.text(cx, cy - 190, 'BAG THE RUN', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));
    add(this.add.text(cx, cy - 155, 'Stop the marker inside the green zone. 3 bags.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaabb',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));

    const track = add(this.add.rectangle(cx, cy, 430, 26, 0x22222a).setScrollFactor(0).setDepth(401));
    const zone = add(this.add.rectangle(cx + 65, cy, 90, 24, 0x2c9a62, 0.8).setScrollFactor(0).setDepth(402));
    const marker = add(this.add.rectangle(cx - 205, cy, 8, 42, 0xffffff).setScrollFactor(0).setDepth(403));
    const counter = add(this.add.text(cx, cy + 70, '0 / 3', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));
    const feedback = add(this.add.text(cx, cy + 115, '[SPACE] SEAL', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#888899',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));

    let sealed = 0;
    let clean = 0;
    let finishing = false;
    const tween = this.tweens.add({
      targets: marker,
      x: cx + 205,
      duration: 1250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const finish = () => {
      tween.stop();
      this.input.keyboard?.off('keydown-SPACE', seal);
      track.off('pointerdown', seal).disableInteractive();
      objects.forEach((object) => object.destroy());
      this.bagged = true;
      this.interactions.consume('rise_scale');
      this.dialogue.show([
        { speaker: 'Narrator', text: clean === 3 ? 'Three clean seals. The repetition is already getting easy.' : 'Three bags ready. Not perfect, but ready.' },
        { speaker: 'JP\'s Mind', text: 'At first my hands shook doing this.' },
        { speaker: 'JP\'s Mind', text: 'They do not shake anymore.' },
      ], () => {
        this.frozen = false;
        this.refreshObjectiveHint();
      });
    };

    const seal = () => {
      if (finishing) return;
      SoundEffects.playBagRustle();
      const hit = Math.abs(marker.x - zone.x) <= zone.width / 2;
      if (hit) clean++;
      sealed++;
      counter.setText(`${sealed} / 3`);
      feedback.setText(hit ? 'CLEAN' : 'CLOSE ENOUGH').setColor(hit ? '#55ee99' : '#f0c040');
      this.cameras.main.shake(80, hit ? 0.002 : 0.005);
      if (sealed >= 3) {
        finishing = true;
        this.input.keyboard?.off('keydown-SPACE', seal);
        track.off('pointerdown', seal).disableInteractive();
        this.time.delayedCall(450, finish);
      } else {
        marker.x = cx - 205;
      }
    };

    this.input.keyboard?.on('keydown-SPACE', seal);
    track.setInteractive({ useHandCursor: true }).on('pointerdown', seal);
  }

  private playOrderRush() {
    this.frozen = true;
    SoundEffects.playVibrate();
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Three unread messages become eleven.' },
      { speaker: 'Buyer (text)', text: 'you around?' },
      { speaker: 'Buyer (text)', text: 'my friend needs one too' },
      { speaker: 'Buyer (text)', text: 'can you come now' },
      { speaker: 'JP\'s Mind', text: 'The first sale felt like luck.' },
      { speaker: 'JP\'s Mind', text: 'This feels like demand.' },
      { speaker: 'JP\'s Mind', text: 'If I stop now, I go back to zero.' },
    ], () => {
      this.showRouteChoice('Eleven messages. Take every stop?', 'Take all', 'Set a limit', () => {
        this.orderPolicy = 'all';
        ChoiceLedger.record('rise_orders', 'Took every order');
        this.dialogue.show([
          { speaker: 'JP\'s Mind', text: 'Everybody gets a yes. I will figure the route out moving.' },
          { speaker: 'Narrator', text: 'The night gets longer before the car even starts.' },
        ], () => this.finishOrderRush());
      }, () => {
        this.orderPolicy = 'limit';
        ChoiceLedger.record('rise_orders', 'Set a limit');
        this.dialogue.show([
          { speaker: 'JP', text: 'Three stops. Everybody else can wait.' },
          { speaker: 'Narrator', text: 'The boundary lasts until the next vibration.' },
        ], () => this.finishOrderRush());
      });
    });
  }

  private finishOrderRush() {
    this.ordersReady = true;
    this.interactions.consume('rise_phone');
    this.frozen = false;
    this.refreshObjectiveHint();
  }

  // Abstract arcade route: this dramatizes pressure without exposing real buyers
  // or turning the game into a how-to.
  // The whip outside the house. Two lives fork right here every night.
  private openWhip() {
    this.frozen = true;
    const dests: WhipDestination[] = [
      {
        label: 'BEACH CITY', sub: 'where the money is.',
        locked: !this.ordersReady ? 'no route yet — check the phone' : (this.routeCompleted ? 'runs are done for tonight' : undefined),
        onSelect: () => this.playDeliveryRun(),
      },
      {
        label: 'STATE STREET', sub: 'the spots. the life.',
        onSelect: () => this.openStateStreet(),
      },
    ];
    WhipMenu.open(this, 'WHERE TO?', dests, () => { this.frozen = false; });
  }

  private openStateStreet() {
    this.frozen = true;
    const bal = BalanceSystem.getBalance();
    const dests: WhipDestination[] = [
      {
        label: "LILLY'S TAQUERIA", sub: 'adobada. $15. everybody\'s favorite.',
        locked: bal < 15 ? 'need $15' : undefined,
        onSelect: () => this.playSpot('lillys'),
      },
      {
        label: 'OKU', sub: 'sushi on the water. $80. the good table.',
        locked: bal < 80 ? 'need $80' : undefined,
        onSelect: () => this.playSpot('oku'),
      },
      {
        label: 'HOT SPRINGS TRAIL', sub: 'free. no signal halfway up.',
        onSelect: () => this.playSpot('hike'),
      },
    ];
    WhipMenu.open(this, 'STATE STREET', dests, () => { this.frozen = false; });
  }

  private playSpot(spot: 'lillys' | 'oku' | 'hike') {
    this.frozen = true;
    if (spot === 'lillys') {
      BalanceSystem.spend(15);
      AffinitySystem.adjust('ch1_gf_k', 1);
      this.dialogue.show([
        { speaker: 'Narrator', text: "Lilly's window. Two adobada plates, one bench, the whole Pacific for free." },
        { speaker: 'K', text: "Lilly's?? This is literally my favorite spot and you know it." },
        { speaker: 'JP\'s Mind', text: 'Fifteen dollars. Best money I spent all month, and I spent a LOT this month.' },
      ], () => { this.frozen = false; });
    } else if (spot === 'oku') {
      BalanceSystem.spend(80);
      AffinitySystem.adjust('ch1_gf_k', 1);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Oku. Sand-side table. She orders like rent isn\'t real.' },
        { speaker: 'JP', text: "Get whatever. We're good." },
        { speaker: 'JP\'s Mind', text: 'Eighty on dinner like it\'s nothing. Because right now, it\'s nothing. Right now.' },
      ], () => { this.frozen = false; });
    } else {
      AffinitySystem.adjust('ch1_gf_k', 1);
      this.dialogue.show([
        { speaker: 'K', text: 'No restaurants. Hot Springs trail. Bring water and don\'t complain.' },
        { speaker: 'Narrator', text: 'Montecito canyon. Phones lose signal halfway up — the best feature of the whole trail.' },
        { speaker: 'K', text: 'See? Free. Better than Oku.' },
        { speaker: 'JP\'s Mind', text: 'No signal means no orders. First quiet my head\'s had in a month.' },
        { speaker: 'JP\'s Mind', text: 'The phone found signal on the way down. Eleven missed messages. Back to it.' },
      ], () => { this.frozen = false; });
    }
  }

  private playDeliveryRun() {
    this.frozen = true;
    SoundEffects.playDoorOpen();

    this.dialogue.show([
      { speaker: 'Narrator', text: 'Tonight\'s menu on the counter: three strains named like superheroes and desserts. The customers order by vibe.' },
      { speaker: 'Narrator', text: 'Three confirmed stops. One late message keeps buzzing.' },
      { speaker: 'JP\'s Mind', text: this.orderPolicy === 'all'
        ? 'I already told everybody yes. Now I have to make the route work.'
        : 'Three stops was the limit. The phone does not care.' },
    ], () => {
      this.showVehicleChoice();
    });
  }

  // Real practice: the 335i everybody knows, or a rental nobody looks at twice.
  // Char. Snuck in through the window while the packing seminar ran downstairs.
  private playCharSneak() {
    this.frozen = true;
    this.dialogue.show([
      { speaker: 'Narrator', text: 'Phone buzz. Char: "outside lol"' },
      { speaker: 'JP\'s Mind', text: 'K and the roommate are mid preroll-seminar in the kitchen.' },
    ], () => {
      this.showRouteChoice('Char is outside.', 'Sneak her in', 'Too risky', () => {
        this.charSnuck = true;
        ChoiceLedger.record('char_sneak', 'Snuck her in');
        this.dialogue.show([
          { speaker: 'Narrator', text: 'Window. Quiet. Shoes off.' },
          { speaker: 'K', text: '(from the kitchen) Babe! We need more papers!' },
          { speaker: 'JP', text: '...I\'ll grab some!' },
          { speaker: 'Narrator', text: 'Char freezes mid-window like a raccoon in headlights.' },
          { speaker: 'Narrator', text: 'She\'s gone by morning. Nobody ever knew.' },
          { speaker: 'JP\'s Mind', text: 'I was living a whole soap opera in a two-bedroom.' },
        ], () => { this.frozen = false; });
      }, () => {
        ChoiceLedger.record('char_sneak', 'Too risky');
        this.dialogue.show([
          { speaker: 'JP', text: '(texting) not tonight. house is full' },
          { speaker: 'Narrator', text: 'Char replies with one emoji. It is not a kind one.' },
        ], () => { this.frozen = false; });
      });
    });
  }

  private showVehicleChoice() {
    this.showRouteChoice('Whose car tonight?', 'The 335i', 'Rental (-$60)', () => {
      this.rentalUsed = false;
      this.dialogue.show([
        { speaker: 'JP\'s Mind', text: 'My car. My music. Everybody on the block knows the all-black already.' },
      ], () => this.showPaceChoice());
    }, () => {
      this.rentalUsed = true;
      BalanceSystem.spend(60);
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Gray rental. Beige interior. The most invisible car in California.' },
        { speaker: 'JP\'s Mind', text: 'Sixty bucks to look like nobody. Best money in the business.' },
      ], () => this.showPaceChoice());
    });
  }

  // Pace before route: speed saves the night and spends your luck.
  // Heat carries into Wrong Crowd — the city remembers fast cars.
  private showPaceChoice() {
    this.showRouteChoice('How does JP drive tonight?', 'Speed', 'Drive normal', () => {
      // SPEED — one rearview moment, and the night gets warmer
      if (!this.rentalUsed) { try { localStorage.setItem('jdlo_heat', '1'); } catch { /* ignore */ } }
      const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff2020, 0)
        .setScrollFactor(0).setDepth(500);
      const flashBlue = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2040ff, 0)
        .setScrollFactor(0).setDepth(500);
      this.tweens.add({ targets: flash, alpha: 0.16, duration: 130, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: flashBlue, alpha: 0.16, duration: 130, yoyo: true, repeat: 2, delay: 65,
        onComplete: () => { flash.destroy(); flashBlue.destroy(); } });
      SoundEffects.playPoliceSiren();
      this.dialogue.show([
        ...(this.rentalUsed ? [
          { speaker: 'Narrator', text: 'The rental eats two red lights. Nobody looks. Rentals are wallpaper.' },
          { speaker: 'JP\'s Mind', text: 'Sixty dollars well spent.' },
        ] : [
          { speaker: 'Narrator', text: 'The 335i eats two red lights. Rearview: red and blue, one block over.' },
          { speaker: 'JP\'s Mind', text: 'Not for me. This time.' },
          { speaker: 'Narrator', text: 'The engine settles. The heart does not.' },
        ]),
      ], () => this.continueToRoute());
    }, () => {
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Speed limit. Full stops. Blinkers.' },
        { speaker: 'JP\'s Mind', text: 'Slow is smooth. Boring keeps you free.' },
      ], () => this.continueToRoute());
    });
  }

  private continueToRoute() {
    this.showRouteChoice('Which stop comes first?', 'Urgent one', 'Closest one', () => {
      ChoiceLedger.record('rise_route', 'Urgent stop first');
      this.runRoutePressure('urgent');
    }, () => {
      ChoiceLedger.record('rise_route', 'Closest stop first');
      this.runRoutePressure('close');
    });
  }

  private runRoutePressure(route: 'urgent' | 'close') {
    const routeLines: DialogueLine[] = route === 'urgent'
      ? [
          { speaker: 'Narrator', text: 'JP crosses town for the loudest message first.' },
          { speaker: 'Narrator', text: 'The closest buyer sends another question mark.' },
        ]
      : [
          { speaker: 'Narrator', text: 'The first handoff is two blocks away. Efficient.' },
          { speaker: 'Narrator', text: 'The urgent buyer calls before JP reaches the next light.' },
        ];

    this.dialogue.show(routeLines, () => {
      SoundEffects.playVibrate();
      this.showRouteChoice('Last-minute order. Add the stop?', 'Add it', 'Keep moving', () => {
        ChoiceLedger.record('rise_extra_stop', 'Added the stop');
        this.finishDeliveryRoute([
          { speaker: 'JP', text: 'Send the location.' },
          { speaker: 'Narrator', text: 'The route bends back across town. Easy money adds another hour.' },
          { speaker: 'Narrator', text: 'Four stops. The same engine never cools down.' },
        ]);
      }, () => {
        ChoiceLedger.record('rise_extra_stop', 'Ignored it');
        this.finishDeliveryRoute([
          { speaker: 'JP\'s Mind', text: 'Not tonight.' },
          { speaker: 'Narrator', text: 'The phone vibrates until the screen goes dark.' },
          { speaker: 'Narrator', text: 'Three stops. For once, the route ends where JP planned.' },
        ]);
      });
    });
  }

  private finishDeliveryRoute(opening: DialogueLine[]) {
    this.routeCompleted = true;
    this.interactions.consume('rise_bmw');
    this.dialogue.show([
      ...opening,
      { speaker: 'Narrator', text: 'People start calling JP before they call anyone else.' },
      { speaker: 'JP\'s Mind', text: 'I am making it back.' },
      { speaker: 'JP\'s Mind', text: 'So why does stopping feel harder now?' },
    ], () => {
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  private showRouteChoice(
    prompt: string,
    yesLabel: string,
    noLabel: string,
    onYes: () => void,
    onNo: () => void,
  ) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const promptText = this.add.text(cx, cy - 42, prompt, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451);
    const yesBg = this.add.rectangle(cx - 105, cy + 12, 180, 46, 0x355d49)
      .setScrollFactor(0).setDepth(450).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(cx - 105, cy + 12, yesLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451);
    const noBg = this.add.rectangle(cx + 105, cy + 12, 180, 46, 0x4b5362)
      .setScrollFactor(0).setDepth(450).setInteractive({ useHandCursor: true });
    const noText = this.add.text(cx + 105, cy + 12, noLabel, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(451);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const cleanup = () => {
      promptText.destroy(); yesBg.destroy(); yesText.destroy(); noBg.destroy(); noText.destroy();
      spaceKey.off('down', chooseYes); nKey.off('down', chooseNo);
    };
    const chooseYes = () => { cleanup(); onYes(); };
    const chooseNo = () => { cleanup(); onNo(); };
    yesBg.on('pointerdown', chooseYes);
    noBg.on('pointerdown', chooseNo);
    spaceKey.on('down', chooseYes);
    nKey.on('down', chooseNo);
  }
}
