import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { DialogueLine } from './DialogueSystem';
import { AchievementSystem } from './AchievementSystem';
import { GameStats } from './GameStats';
import { SoundEffects } from './SoundEffects';

export interface DMThread {
  key: string;
  name: string;
  preview: string;
}

export interface DMMessage {
  from: 'them' | 'me';
  text: string;
}

export interface DMChoice {
  label: string;
  callback: () => void;
}

/**
 * Shared DM / Instagram system — can be opened from any scene.
 *
 * State (igFollowers, dmsDone, fumbleCount, volleyballGirlInvited) persists
 * as static properties so it survives across calls within a play-through.
 */
export class DMSystem {
  // ─── Persistent state ──────────────────────────────────────────────
  static igFollowers = 2847;
  static dmsDone = new Set<string>();
  private static _fumbleCount = 0;
  static volleyballGirlInvited = false;

  /** Thread definitions — shared across scenes */
  static readonly defaultThreads: DMThread[] = [
    { key: 'volleyball', name: 'College Girl \uD83C\uDFD0', preview: 'nice game earlier \uD83D\uDC40' },
    { key: 'gf', name: 'K \uD83D\uDC95', preview: 'having fun?' },
    { key: 'random', name: 'Random Girl', preview: 'hey' },
    { key: 'plug', name: 'Plug \uD83D\uDD0C', preview: 'u good on that?' },
  ];

  // ─── Fumble helpers ────────────────────────────────────────────────
  static getFumbleCount(): number {
    return DMSystem._fumbleCount;
  }

  static incrementFumble(): void {
    DMSystem._fumbleCount++;
  }

  static resetFumble(): void {
    DMSystem._fumbleCount = 0;
  }

  // ─── Reset all state (e.g. new play-through) ──────────────────────
  static reset(): void {
    DMSystem.igFollowers = 2847;
    DMSystem.dmsDone = new Set<string>();
    DMSystem._fumbleCount = 0;
    DMSystem.volleyballGirlInvited = false;
  }

  // ─── Open the DM inbox (Instagram screen) ─────────────────────────
  /**
   * Opens the Instagram DM inbox UI.
   * @param scene      The calling Phaser scene (any scene)
   * @param dialogue   A dialogue-show function: (lines, onComplete?) => void
   * @param onClose    Called when the user backs out to the phone apps screen
   * @param threads    Optional override for displayed DM threads
   */
  static openDMs(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    onClose: () => void,
    threads: DMThread[] = DMSystem.defaultThreads,
  ): void {
    SoundEffects.dmReceived();
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const bg = scene.add.rectangle(cx, cy, 280, 380, 0x1a1a2e).setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 282, 382, 0xcc44aa, 0).setStrokeStyle(2, 0xcc44aa).setScrollFactor(0).setDepth(299);
    const header = scene.add.text(cx, cy - 165, 'INSTAGRAM', { fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#cc44aa' }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const handle = scene.add.text(cx - 80, cy - 140, '@jdlo', { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    const followersText = scene.add.text(cx + 80, cy - 140, DMSystem.igFollowers.toLocaleString() + ' followers', { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#aaaaaa' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);
    const dmLabel = scene.add.text(cx, cy - 115, 'DMs', { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#cc44aa' }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const sep = scene.add.rectangle(cx, cy - 100, 240, 1, 0x333344).setScrollFactor(0).setDepth(301);
    const elements: Phaser.GameObjects.GameObject[] = [bg, border, header, handle, followersText, dmLabel, sep];
    const keyHandlers: { key: Phaser.Input.Keyboard.Key; handler: () => void }[] = [];
    const cleanup = () => { elements.forEach(e => e.destroy()); keyHandlers.forEach(kh => kh.key.off('down', kh.handler)); };

    threads.forEach((t, i) => {
      const y = cy - 75 + i * 55;
      const done = DMSystem.dmsDone.has(t.key);
      const threadBg = scene.add.rectangle(cx, y, 240, 44, done ? 0x1a1a2e : 0x222244).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const dot = !done ? scene.add.circle(cx - 110, y - 8, 4, 0xcc44aa).setScrollFactor(0).setDepth(302) : null;
      const nameText = scene.add.text(cx - 95, y - 8, t.name, { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: done ? '#666677' : '#ffffff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
      const previewText = scene.add.text(cx - 95, y + 8, done ? '(read)' : t.preview, { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#888899' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
      threadBg.on('pointerover', () => threadBg.setFillStyle(0x333366));
      threadBg.on('pointerout', () => threadBg.setFillStyle(done ? 0x1a1a2e : 0x222244));
      threadBg.on('pointerdown', () => { cleanup(); DMSystem.openThread(scene, dialogue, onClose, t.key); });
      elements.push(threadBg, nameText, previewText);
      if (dot) elements.push(dot);
      const keyCode = [Phaser.Input.Keyboard.KeyCodes.ONE, Phaser.Input.Keyboard.KeyCodes.TWO, Phaser.Input.Keyboard.KeyCodes.THREE, Phaser.Input.Keyboard.KeyCodes.FOUR][i];
      const key = scene.input.keyboard!.addKey(keyCode);
      const kHandler = () => { cleanup(); DMSystem.openThread(scene, dialogue, onClose, t.key); };
      key.on('down', kHandler);
      keyHandlers.push({ key, handler: kHandler });
    });

    const hint = scene.add.text(cx, cy + 160, '[1-4] Open DM  [SPACE] Back', { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#666677' }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    elements.push(hint);
    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const backHandler = () => { cleanup(); onClose(); };
    spaceKey.on('down', backHandler);
    keyHandlers.push({ key: spaceKey, handler: backHandler });
  }

  // ─── Open a specific DM thread ────────────────────────────────────
  private static openThread(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    onClose: () => void,
    threadKey: string,
  ): void {
    DMSystem.dmsDone.add(threadKey);
    const reopen = () => DMSystem.openDMs(scene, dialogue, onClose);
    switch (threadKey) {
      case 'volleyball': DMSystem.showDMVolleyball(scene, dialogue, reopen); break;
      case 'gf': DMSystem.showDMGirlfriend(scene, dialogue, reopen); break;
      case 'random': DMSystem.showDMRandom(scene, dialogue, reopen); break;
      case 'plug': DMSystem.showDMPlug(scene, dialogue, reopen); break;
      default: reopen(); break;
    }
  }

  // ─── DM Bubble Renderer ───────────────────────────────────────────
  static showDMBubble(
    scene: Phaser.Scene,
    messages: DMMessage[],
    choices: DMChoice[],
  ): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const bg = scene.add.rectangle(cx, cy, 280, 380, 0x0d0d1a).setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 282, 382, 0x333355, 0).setStrokeStyle(2, 0x333355).setScrollFactor(0).setDepth(299);
    const elements: Phaser.GameObjects.GameObject[] = [bg, border];
    let yPos = cy - 160;
    for (const msg of messages) {
      const isMe = msg.from === 'me';
      const bubbleColor = isMe ? 0x0066ff : 0x333344;
      const alignX = isMe ? cx + 50 : cx - 50;
      const bubble = scene.add.rectangle(alignX, yPos, 180, 24, bubbleColor).setOrigin(isMe ? 1 : 0, 0.5).setScrollFactor(0).setDepth(301);
      const lbl = scene.add.text(isMe ? alignX - 8 : alignX + 8, yPos, msg.text, { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ffffff', wordWrap: { width: 164 } }).setOrigin(isMe ? 1 : 0, 0.5).setScrollFactor(0).setDepth(302);
      elements.push(bubble, lbl);
      yPos += 32;
    }
    const keyHandlers: { key: Phaser.Input.Keyboard.Key; handler: () => void }[] = [];
    const cleanup = () => { elements.forEach(e => e.destroy()); keyHandlers.forEach(kh => kh.key.off('down', kh.handler)); };
    yPos = Math.max(yPos + 10, cy + 80);
    choices.forEach((choice, i) => {
      const btnY = yPos + i * 36;
      const btn = scene.add.rectangle(cx, btnY, 220, 28, 0x0066ff).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const btnLbl = scene.add.text(cx, btnY, choice.label, { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      btn.on('pointerover', () => btn.setFillStyle(0x2288ff));
      btn.on('pointerout', () => btn.setFillStyle(0x0066ff));
      btn.on('pointerdown', () => { cleanup(); choice.callback(); });
      elements.push(btn, btnLbl);
      const keyCode = i === 0 ? Phaser.Input.Keyboard.KeyCodes.ONE : Phaser.Input.Keyboard.KeyCodes.TWO;
      const key = scene.input.keyboard!.addKey(keyCode);
      const kH = () => { cleanup(); choice.callback(); };
      key.on('down', kH);
      keyHandlers.push({ key, handler: kH });
    });
  }

  // ─── Individual DM Threads ────────────────────────────────────────

  private static showDMVolleyball(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    reopen: () => void,
  ): void {
    DMSystem.showDMBubble(scene,
      [{ from: 'them', text: 'nice game earlier \uD83D\uDC40' }],
      [
        { label: 'come to the party tonight', callback: () => {
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'nice game earlier \uD83D\uDC40' }, { from: 'me', text: 'come to the party tonight' }, { from: 'them', text: 'bet. what\'s the address' }],
            [{ label: '6694 Del Playa Dr', callback: () => {
              DMSystem.showDMBubble(scene,
                [{ from: 'me', text: 'come to the party tonight' }, { from: 'them', text: 'bet. what\'s the address' }, { from: 'me', text: '6694 Del Playa Dr' }, { from: 'them', text: 'see you there \uD83D\uDE18' }],
                [{ label: '(close)', callback: () => {
                  DMSystem.volleyballGirlInvited = true;
                  dialogue([{ speaker: 'JP\'s Mind', text: 'She\'s definitely pulling up.' }, { speaker: 'JP\'s Mind', text: 'K can NOT find out about this.' }], () => { reopen(); });
                }}],
              );
            }}],
          );
        }},
        { label: 'thanks lol', callback: () => {
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'nice game earlier \uD83D\uDC40' }, { from: 'me', text: 'thanks lol' }, { from: 'them', text: '...' }],
            [{ label: '(left on read)', callback: () => {
              AchievementSystem.trackLeftOnRead();
              dialogue([{ speaker: 'JP\'s Mind', text: 'She left me on read. Fair.' }], () => { reopen(); });
            }}],
          );
        }},
      ],
    );
  }

  private static showDMGirlfriend(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    reopen: () => void,
  ): void {
    DMSystem.showDMBubble(scene,
      [{ from: 'them', text: 'having fun?' }],
      [
        { label: 'yeah it\'s chill', callback: () => {
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'having fun?' }, { from: 'me', text: 'yeah it\'s chill' }, { from: 'them', text: 'ok...' }, { from: 'them', text: 'don\'t do anything stupid' }],
            [{ label: '(close)', callback: () => {
              dialogue([{ speaker: 'JP\'s Mind', text: 'She knows. She always knows.' }], () => { reopen(); });
            }}],
          );
        }},
        { label: 'I miss you', callback: () => {
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'having fun?' }, { from: 'me', text: 'I miss you' }, { from: 'them', text: '\uD83E\uDD7A I miss you too baby' }, { from: 'them', text: 'come back soon' }],
            [{ label: '(close)', callback: () => {
              dialogue([{ speaker: 'JP\'s Mind', text: 'I do miss her though. For real.' }], () => { reopen(); });
            }}],
          );
        }},
      ],
    );
  }

  private static showDMRandom(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    reopen: () => void,
  ): void {
    DMSystem.showDMBubble(scene,
      [{ from: 'them', text: 'hey' }],
      [
        { label: 'hey what\'s up', callback: () => {
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'hey' }, { from: 'me', text: 'hey what\'s up' }, { from: 'them', text: 'you\'re cute. you single?' }],
            [
              { label: 'it\'s complicated', callback: () => {
                DMSystem.showDMBubble(scene,
                  [{ from: 'them', text: 'you\'re cute. you single?' }, { from: 'me', text: 'it\'s complicated' }, { from: 'them', text: 'lol ok bye' }],
                  [{ label: '(she unfollowed you)', callback: () => {
                    DMSystem.igFollowers--;
                    dialogue([
                      { speaker: 'Narrator', text: 'She unfollowed you. Followers: ' + DMSystem.igFollowers.toLocaleString() },
                      { speaker: 'JP\'s Mind', text: 'Damn. Lost a follower over that.' },
                    ], () => { reopen(); });
                  }}],
                );
              }},
              { label: 'yeah', callback: () => {
                DMSystem.showDMBubble(scene,
                  [{ from: 'them', text: 'you\'re cute. you single?' }, { from: 'me', text: 'yeah' }, { from: 'them', text: 'come find me at the party \uD83D\uDE08' }],
                  [{ label: '(close)', callback: () => {
                    dialogue([
                      { speaker: 'JP\'s Mind', text: '"Yeah" I said. While K\'s contact is right there.' },
                      { speaker: 'JP\'s Mind', text: 'I am a terrible person.' },
                    ], () => { reopen(); });
                  }}],
                );
              }},
            ],
          );
        }},
        { label: '(ignore)', callback: () => {
          dialogue([{ speaker: 'JP\'s Mind', text: 'Not even opening that.' }], () => { reopen(); });
        }},
      ],
    );
  }

  private static showDMPlug(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    reopen: () => void,
  ): void {
    DMSystem.showDMBubble(scene,
      [{ from: 'them', text: 'u good on that?' }],
      [
        { label: 'always', callback: () => {
          AchievementSystem.trackPlugInteraction(scene.scene.key);
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'u good on that?' }, { from: 'me', text: 'always' }, { from: 'them', text: '\uD83E\uDD1D' }],
            [{ label: '(close)', callback: () => {
              dialogue([{ speaker: 'JP\'s Mind', text: 'We good.' }], () => { reopen(); });
            }}],
          );
        }},
        { label: 'need more', callback: () => {
          AchievementSystem.trackPlugInteraction(scene.scene.key);
          DMSystem.showDMBubble(scene,
            [{ from: 'them', text: 'u good on that?' }, { from: 'me', text: 'need more' }, { from: 'them', text: 'say less pulling up' }],
            [{ label: '(close)', callback: () => {
              dialogue([{ speaker: 'JP\'s Mind', text: 'Plug never lets me down.' }], () => { reopen(); });
            }}],
          );
        }},
      ],
    );
  }

  // ─── Party Flirt System ───────────────────────────────────────────
  /**
   * Generic flirt interaction — 50/50 success/rejection.
   * @param scene     The calling scene
   * @param dialogue  Dialogue show function
   * @param npcId     NPC identifier (for future per-NPC customisation)
   * @param onClose   Called after the dialogue finishes
   */
  static openFlirt(
    scene: Phaser.Scene,
    dialogue: (lines: DialogueLine[], onComplete?: () => void) => void,
    _npcId: string,
    onClose?: () => void,
  ): void {
    const success = Math.random() < 0.5;

    if (success) {
      const successLines: DialogueLine[][] = [
        [
          { speaker: 'Girl', text: 'You\'re funny \uD83D\uDE02' },
          { speaker: 'Girl', text: 'Want to go somewhere quieter?' },
          { speaker: 'JP\'s Mind', text: 'Don\'t fumble this. DO NOT fumble this.' },
          { speaker: 'Narrator', text: 'She grabs your hand and pulls you toward the hot tub.' },
        ],
        [
          { speaker: 'Girl', text: 'Okay I see you.' },
          { speaker: 'Narrator', text: 'She whispers something in your ear. You can\'t hear over the music but you nod anyway.' },
          { speaker: 'JP\'s Mind', text: 'I have absolutely no idea what she just said.' },
          { speaker: 'JP\'s Mind', text: 'But I\'m going with it.' },
        ],
        [
          { speaker: 'Girl', text: 'You live here?? That\'s so cool.' },
          { speaker: 'JP', text: 'Yeah. It\'s aight.' },
          { speaker: 'Girl', text: 'Show me around?' },
          { speaker: 'JP\'s Mind', text: 'She said show me around. She said SHOW ME AROUND.' },
          { speaker: 'Narrator', text: 'He shows her around. Takes the long route past his room.' },
        ],
      ];
      const lines = successLines[Math.floor(Math.random() * successLines.length)];
      GameStats.increment('girlsSucceeded');
      AchievementSystem.trackFlirtSuccess();
      dialogue(lines, onClose);
    } else {
      DMSystem._fumbleCount++;
      SoundEffects.fumble();
      GameStats.increment('girlsFumbled');
      AchievementSystem.trackFumble(DMSystem._fumbleCount);

      const rejections: DialogueLine[][] = [
        [
          { speaker: 'Girl', text: 'Ew.' },
          { speaker: 'Narrator', text: 'She literally walked away mid-sentence.' },
          { speaker: 'JP\'s Mind', text: 'That did NOT just happen.' },
        ],
        [
          { speaker: 'Girl', text: 'I have a boyfriend.' },
          { speaker: 'JP', text: 'I wasn\'t even\u2014' },
          { speaker: 'Girl', text: 'Sure.' },
          { speaker: 'JP\'s Mind', text: 'Pain.' },
        ],
        [
          { speaker: 'Girl', text: 'You\'re not my type sorry.' },
          { speaker: 'JP', text: '...' },
          { speaker: 'Narrator', text: 'She turned around and started talking to Cooper instead.' },
          { speaker: 'JP\'s Mind', text: 'COOPER?? She picked COOPER over me??' },
        ],
        [
          { speaker: 'Narrator', text: 'She showed her friends your DM. They\'re all laughing.' },
          { speaker: 'JP\'s Mind', text: 'I can hear them from here. This is a nightmare.' },
        ],
        [
          { speaker: 'Girl', text: 'Aww. That\'s sweet.' },
          { speaker: 'Narrator', text: 'She pats you on the shoulder and walks away.' },
          { speaker: 'JP\'s Mind', text: 'She patted me. On the shoulder. Like a dog.' },
        ],
        [
          { speaker: 'Girl', text: 'Haha maybe later!' },
          { speaker: 'Narrator', text: 'She will not be coming back later.' },
          { speaker: 'JP\'s Mind', text: 'We both know what "maybe later" means.' },
        ],
        [
          { speaker: 'Narrator', text: 'Her boyfriend just showed up. He\'s 6\'4.' },
          { speaker: 'Girl', text: 'Babe! This guy was just leaving.' },
          { speaker: 'JP', text: 'Yep. I was. Definitely was.' },
          { speaker: 'JP\'s Mind', text: 'That man could bench press me and both my trash bags.' },
        ],
      ];

      const lines = rejections[Math.floor(Math.random() * rejections.length)];
      dialogue(lines, onClose);
    }
  }
}
