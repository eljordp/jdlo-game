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
