import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { weedRiseMap, type MapData } from '../data/maps';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_HEIGHT, GAME_WIDTH, SCALE, SCALED_TILE } from '../config';
import { SoundEffects } from '../systems/SoundEffects';

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
    car.setTint(0xdddddd);
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
    this.createDeliveryNeighborhood();
    this.createRouteAtmosphere();
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
          { speaker: 'JP\'s Mind', text: 'New clothes. Same face.' },
          { speaker: 'JP\'s Mind', text: 'Less sleep behind the eyes.' },
        ],
        rise_kitchen: [
          { speaker: 'Narrator', text: 'Food for everybody. Drinks for everybody.' },
          { speaker: 'Narrator', text: 'Nobody asks where the money came from when they are eating.' },
        ],
        rise_receipts: [
          { speaker: 'Narrator', text: 'Gas. Food. Clothes. Nights out. Cash disappears quietly.' },
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

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
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
      if (!this.ordersReady) {
        this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'No route yet. Check the phone.' }]);
        return;
      }
      if (!this.routeCompleted) {
        this.playDeliveryRun();
        return;
      }
      this.dialogue.show([{ speaker: 'JP\'s Mind', text: 'Engine is still warm.' }]);
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
        this.dialogue.show([
          { speaker: 'Narrator', text: 'JP counts the return twice and hides it behind the kitchen panel.' },
          { speaker: 'Narrator', text: 'For a minute, being back at zero feels impossible.' },
          { speaker: 'Narrator', text: 'Then a car slows outside.' },
          { speaker: 'JP\'s Mind', text: 'Probably nothing.' },
          { speaker: 'Narrator', text: 'It keeps driving.' },
          { speaker: 'JP\'s Mind', text: 'See? Nothing.' },
          { speaker: 'Narrator', text: 'That is how fear becomes routine too.' },
        ], () => this.refreshObjectiveHint());
        return;
      }
    }

    super.handleInteractable(interactable);
  }

  // Director Mode can launch this directly for pacing and gate tests.
  private playWeighingRun() {
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
      this.ordersReady = true;
      this.interactions.consume('rise_phone');
      this.frozen = false;
      this.refreshObjectiveHint();
    });
  }

  // Abstract arcade route: this dramatizes pressure without exposing real buyers
  // or turning the game into a how-to.
  private playDeliveryRun() {
    this.frozen = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T): T => {
      objects.push(object);
      return object;
    };

    add(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x030409, 0.96).setScrollFactor(0).setDepth(400));
    add(this.add.text(cx, 70, 'THE ROUTE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));
    add(this.add.text(cx, 105, 'Press SPACE inside each lit stop.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaabb',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401));
    add(this.add.rectangle(cx, cy + 65, 620, 120, 0x1b1b24).setScrollFactor(0).setDepth(401));
    add(this.add.rectangle(cx, cy + 65, 620, 4, 0xd8b34c, 0.5).setScrollFactor(0).setDepth(402));

    const stopXs = [cx - 190, cx, cx + 190];
    const stops = stopXs.map((x, index) => add(this.add.rectangle(x, cy + 65, 70, 110, index === 0 ? 0x2c9a62 : 0x33333c, index === 0 ? 0.45 : 0.25)
      .setScrollFactor(0).setDepth(402)));
    const car = add(this.add.sprite(cx - 290, cy + 65, 'car-bmw335i').setScale(SCALE * 0.9).setScrollFactor(0).setDepth(403));
    const status = add(this.add.text(cx, cy + 160, 'STOP 1 / 3', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(403));

    let completed = 0;
    let finishing = false;
    const drive = this.tweens.add({
      targets: car,
      x: cx + 290,
      duration: 2100,
      repeat: -1,
      onRepeat: () => { car.x = cx - 290; },
    });

    const finish = () => {
      drive.stop();
      this.input.keyboard?.off('keydown-SPACE', drop);
      this.input.off('pointerdown', drop);
      objects.forEach((object) => object.destroy());
      this.routeCompleted = true;
      this.interactions.consume('rise_bmw');
      this.dialogue.show([
        { speaker: 'Narrator', text: 'Three stops. Three handoffs. The same engine never cools down.' },
        { speaker: 'Narrator', text: 'People start calling JP before they call anyone else.' },
        { speaker: 'JP\'s Mind', text: 'I am making it back.' },
        { speaker: 'JP\'s Mind', text: 'So why does stopping feel harder now?' },
      ], () => {
        this.frozen = false;
        this.refreshObjectiveHint();
      });
    };

    const drop = () => {
      if (finishing) return;
      const target = stops[completed];
      if (!target || Math.abs(car.x - target.x) > target.width / 2) {
        status.setText('MISSED — LOOP BACK').setColor('#ff6666');
        this.cameras.main.shake(100, 0.004);
        return;
      }

      target.setFillStyle(0x55555e, 0.25);
      completed++;
      if (completed >= 3) {
        finishing = true;
        this.input.keyboard?.off('keydown-SPACE', drop);
        this.input.off('pointerdown', drop);
        status.setText('ROUTE COMPLETE').setColor('#55ee99');
        this.time.delayedCall(500, finish);
        return;
      }
      stops[completed].setFillStyle(0x2c9a62, 0.45);
      status.setText(`STOP ${completed + 1} / 3`).setColor('#ffffff');
    };

    this.input.keyboard?.on('keydown-SPACE', drop);
    this.input.on('pointerdown', drop);
    this.events.once('shutdown', () => this.input.off('pointerdown', drop));
  }
}
