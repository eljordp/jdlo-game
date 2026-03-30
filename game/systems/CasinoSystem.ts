// ─── CASINO SYSTEM ──────────────────────────────────────────────────
// Shared casino + crypto trading overlay. Works on ANY Phaser scene.
// Static singleton — balance persists across scenes.
// ─────────────────────────────────────────────────────────────────────

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { BalanceSystem } from './BalanceSystem';
import { AchievementSystem } from './AchievementSystem';
import { GameStats } from './GameStats';
import { SoundEffects } from './SoundEffects';

const CASINO_SAVE_KEY = 'jdlo-casino-balance';

export class CasinoSystem {
  private static casinoBalance = 500;
  private static initialized = false;

  // ─── INIT / PERSISTENCE ──────────────────────────────────────────

  private static init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const val = localStorage.getItem(CASINO_SAVE_KEY);
      if (val) this.casinoBalance = parseInt(val, 10) || 500;
    } catch { /* noop */ }
  }

  private static save() {
    try { localStorage.setItem(CASINO_SAVE_KEY, String(this.casinoBalance)); } catch { /* noop */ }
  }

  // ─── BALANCE HELPERS ─────────────────────────────────────────────

  private static getCasinoBalance(): number {
    this.init();
    const bal = BalanceSystem.getBalance();
    return bal > 0 ? bal : this.casinoBalance;
  }

  private static updateCasinoBalance(delta: number) {
    this.init();
    if (BalanceSystem.getBalance() > 0 || delta > 0) {
      if (delta > 0) BalanceSystem.earn(delta, 'casino');
      else BalanceSystem.spend(Math.abs(delta), 'casino');
    }
    this.casinoBalance += delta;
    if (this.casinoBalance < 0) this.casinoBalance = 0;
    this.save();
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────

  /** Open the casino menu overlay on the given scene. */
  static openCasino(scene: Phaser.Scene, onClose: () => void) {
    this.init();
    this.showCasino(scene, onClose);
  }

  /** Open the crypto trading overlay on the given scene. */
  static openCrypto(scene: Phaser.Scene, onClose: () => void) {
    this.init();
    this.showCryptoTrading(scene, onClose);
  }

  // ─── CASINO MENU ────────────────────────────────────────────────

  private static showCasino(scene: Phaser.Scene, onClose: () => void) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = scene.add.rectangle(cx, cy, 340, 360, 0x0a3a1a)
      .setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 342, 362, 0xf0c040, 0)
      .setStrokeStyle(2, 0xf0c040)
      .setScrollFactor(0).setDepth(299);

    const title = scene.add.text(cx, cy - 155, 'LUCKY JP CASINO', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const balText = scene.add.text(cx, cy - 125, 'Balance: $' + this.casinoBalance, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const games = ['Slots', 'Blackjack', 'Dice', 'Back'];
    const gameColors = [0x1a2a4a, 0x3a1a1a, 0x1a3a3a, 0x333333];
    const gameHover = [0x2a4a6a, 0x5a2a2a, 0x2a5a5a, 0x555555];
    const buttons: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    games.forEach((g, i) => {
      const y = cy - 60 + i * 55;
      const btn = scene.add.rectangle(cx, y, 260, 40, gameColors[i])
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const label = scene.add.text(cx, y, g, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      btn.on('pointerover', () => btn.setFillStyle(gameHover[i]));
      btn.on('pointerout', () => btn.setFillStyle(gameColors[i]));

      btn.on('pointerdown', () => {
        cleanup();
        if (g === 'Slots') this.showSlots(scene, onClose);
        else if (g === 'Blackjack') this.showBlackjack(scene, onClose);
        else if (g === 'Dice') this.showDice(scene, onClose);
        else onClose();
      });

      buttons.push(btn);
      labels.push(label);
    });

    const elements: Phaser.GameObjects.GameObject[] = [bg, border, title, balText, ...buttons, ...labels];
    const cleanup = () => elements.forEach(e => e.destroy());

    const keys = [
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    ];
    const handlers: (() => void)[] = [];
    keys.forEach((key, i) => {
      const handler = () => {
        keys.forEach((k, j) => k.off('down', handlers[j]));
        cleanup();
        if (i === 0) this.showSlots(scene, onClose);
        else if (i === 1) this.showBlackjack(scene, onClose);
        else if (i === 2) this.showDice(scene, onClose);
        else onClose();
      };
      handlers.push(handler);
      key.on('down', handler);
    });
  }

  // ─── CASINO BROKE ───────────────────────────────────────────────

  private static showCasinoBroke(scene: Phaser.Scene, onClose: () => void) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = scene.add.rectangle(cx, cy, 320, 180, 0x1a0a0a)
      .setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 322, 182, 0xff4444, 0)
      .setStrokeStyle(2, 0xff4444)
      .setScrollFactor(0).setDepth(299);
    const msg = scene.add.text(cx, cy - 30, "You're broke.", {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const sub = scene.add.text(cx, cy + 10, 'Time to go home.', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const hint = scene.add.text(cx, cy + 50, '[SPACE] Leave', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    scene.cameras.main.shake(500, 0.01);

    const elements = [bg, border, msg, sub, hint];
    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const handler = () => {
      spaceKey.off('down', handler);
      elements.forEach(e => e.destroy());
      onClose();
    };
    spaceKey.on('down', handler);
  }

  // ─── SLOTS ──────────────────────────────────────────────────────

  private static showSlots(scene: Phaser.Scene, onClose: () => void) {
    if (this.casinoBalance <= 0) { this.showCasinoBroke(scene, onClose); return; }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const SYMBOLS = ['\u{1F352}', '\u{1F34B}', '\u{1F514}', '\u{1F48E}', '7\uFE0F\u20E3', '\u{1F340}'];
    let currentBet = 10;
    let spinning = false;
    const reelResults = [0, 1, 2];

    const bg = scene.add.rectangle(cx, cy, 380, 420, 0x0a3a1a)
      .setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 382, 422, 0xf0c040, 0)
      .setStrokeStyle(2, 0xf0c040)
      .setScrollFactor(0).setDepth(299);

    const title = scene.add.text(cx, cy - 185, 'LUCKY SLOTS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const balLabel = scene.add.text(cx, cy - 160, '$' + this.casinoBalance, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Reel display area
    const reelBg = scene.add.rectangle(cx, cy - 80, 300, 80, 0x0a1a0a)
      .setScrollFactor(0).setDepth(301);
    const reelBorder = scene.add.rectangle(cx, cy - 80, 302, 82, 0x335533, 0)
      .setStrokeStyle(1, 0x335533)
      .setScrollFactor(0).setDepth(301);

    const reelTexts: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i++) {
      const x = cx - 80 + i * 80;
      const t = scene.add.text(x, cy - 80, SYMBOLS[reelResults[i]], {
        fontSize: '36px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      reelTexts.push(t);
    }

    const resultText = scene.add.text(cx, cy - 25, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Bet buttons
    const betLabel = scene.add.text(cx, cy + 15, 'BET: $' + currentBet, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const betAmounts = [10, 50, 100];
    const betBtns: Phaser.GameObjects.Rectangle[] = [];
    const betLabels: Phaser.GameObjects.Text[] = [];
    betAmounts.forEach((amt, i) => {
      const x = cx - 100 + i * 100;
      const btn = scene.add.rectangle(x, cy + 50, 80, 30, 0x1a2a4a)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const lbl = scene.add.text(x, cy + 50, '$' + amt, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      btn.on('pointerover', () => btn.setFillStyle(0x2a4a6a));
      btn.on('pointerout', () => btn.setFillStyle(currentBet === amt ? 0x3a5a7a : 0x1a2a4a));
      btn.on('pointerdown', () => {
        if (spinning) return;
        currentBet = amt;
        betLabel.setText('BET: $' + currentBet);
        betBtns.forEach((b, j) => b.setFillStyle(j === i ? 0x3a5a7a : 0x1a2a4a));
      });
      betBtns.push(btn);
      betLabels.push(lbl);
    });
    betBtns[0].setFillStyle(0x3a5a7a);

    // SPIN button
    const spinBtn = scene.add.rectangle(cx, cy + 100, 200, 44, 0x8b0000)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const spinLabel = scene.add.text(cx, cy + 100, 'SPIN', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    spinBtn.on('pointerover', () => { if (!spinning) spinBtn.setFillStyle(0xaa2222); });
    spinBtn.on('pointerout', () => spinBtn.setFillStyle(0x8b0000));

    // Back button
    const backBtn = scene.add.rectangle(cx, cy + 160, 140, 32, 0x333333)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const backLabel = scene.add.text(cx, cy + 160, 'BACK', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x555555));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333333));

    const elements: Phaser.GameObjects.GameObject[] = [
      bg, border, title, balLabel, reelBg, reelBorder, ...reelTexts,
      resultText, betLabel, ...betBtns, ...betLabels, spinBtn, spinLabel,
      backBtn, backLabel,
    ];
    const cleanup = () => elements.forEach(e => e.destroy());

    const doSpin = () => {
      if (spinning) return;
      if (this.casinoBalance < currentBet) {
        resultText.setText('Not enough $!').setColor('#ff4444');
        return;
      }
      spinning = true;
      resultText.setText('');
      spinLabel.setText('...');
      SoundEffects.slotSpin();

      // Determine result first (rigged RNG)
      const roll = Math.random();
      let finalSymbols: number[];
      if (roll < 0.15) {
        // 3 match - jackpot
        const s = Phaser.Math.Between(0, SYMBOLS.length - 1);
        finalSymbols = [s, s, s];
      } else if (roll < 0.45) {
        // 2 match
        const s = Phaser.Math.Between(0, SYMBOLS.length - 1);
        const pos = Phaser.Math.Between(0, 2);
        finalSymbols = [
          Phaser.Math.Between(0, SYMBOLS.length - 1),
          Phaser.Math.Between(0, SYMBOLS.length - 1),
          Phaser.Math.Between(0, SYMBOLS.length - 1),
        ];
        // Force 2 to match
        const otherPos = (pos + 1) % 3;
        finalSymbols[pos] = s;
        finalSymbols[otherPos] = s;
        // Make sure 3rd is different
        const third = (pos + 2) % 3;
        if (finalSymbols[third] === s) finalSymbols[third] = (s + 1) % SYMBOLS.length;
      } else {
        // All different
        const a = Phaser.Math.Between(0, SYMBOLS.length - 1);
        const b = (a + Phaser.Math.Between(1, SYMBOLS.length - 1)) % SYMBOLS.length;
        let c = (b + Phaser.Math.Between(1, SYMBOLS.length - 2)) % SYMBOLS.length;
        if (c === a) c = (c + 1) % SYMBOLS.length;
        finalSymbols = [a, b, c];
      }

      // Animate reels
      let reelsFinished = 0;
      for (let r = 0; r < 3; r++) {
        const reelText = reelTexts[r];
        const stopDelay = 600 + r * 400;
        let spinTimer = 0;
        const spinInterval = 80;
        const spinEvent = scene.time.addEvent({
          delay: spinInterval,
          loop: true,
          callback: () => {
            spinTimer += spinInterval;
            reelText.setText(SYMBOLS[Phaser.Math.Between(0, SYMBOLS.length - 1)]);
            if (spinTimer >= stopDelay) {
              spinEvent.destroy();
              reelText.setText(SYMBOLS[finalSymbols[r]]);
              reelsFinished++;
              if (reelsFinished === 3) {
                // Evaluate
                const a = finalSymbols[0], b = finalSymbols[1], c = finalSymbols[2];
                if (a === b && b === c) {
                  // JACKPOT
                  const win = currentBet * 10;
                  this.updateCasinoBalance(win - currentBet);
                  resultText.setText('JACKPOT!!! +$' + win).setColor('#f0c040');
                  scene.cameras.main.shake(600, 0.02);
                  scene.cameras.main.flash(300, 255, 200, 0);
                  SoundEffects.slotJackpot();
                  GameStats.increment('casinoWins');
                  GameStats.increment('casinoProfit', win - currentBet);
                  AchievementSystem.check('jackpot_king');
                  AchievementSystem.trackCasinoProfit(win - currentBet);
                } else if (a === b || b === c || a === c) {
                  // Small win
                  const win = currentBet * 2;
                  this.updateCasinoBalance(win - currentBet);
                  resultText.setText('WIN! +$' + win).setColor('#22ff88');
                  scene.cameras.main.shake(200, 0.005);
                  SoundEffects.slotWin();
                  GameStats.increment('casinoWins');
                  GameStats.increment('casinoProfit', win - currentBet);
                  AchievementSystem.trackCasinoProfit(win - currentBet);
                } else {
                  // Loss
                  this.updateCasinoBalance(-currentBet);
                  resultText.setText('-$' + currentBet).setColor('#ff4444');
                  SoundEffects.casinoLose();
                  GameStats.increment('casinoLosses');
                  GameStats.increment('casinoProfit', -currentBet);
                  AchievementSystem.trackCasinoLoss(currentBet);
                }
                balLabel.setText('$' + this.casinoBalance);
                spinLabel.setText('SPIN');
                spinning = false;

                if (this.casinoBalance <= 0) {
                  scene.time.delayedCall(1000, () => { cleanup(); this.showCasinoBroke(scene, onClose); });
                }
              }
            }
          },
        });
      }
    };

    spinBtn.on('pointerdown', doSpin);
    backBtn.on('pointerdown', () => { cleanup(); this.showCasino(scene, onClose); });

    // Keyboard
    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const hSpin = () => doSpin();
    const hBack = () => { spaceKey.off('down', hSpin); escKey.off('down', hBack); cleanup(); this.showCasino(scene, onClose); };
    spaceKey.on('down', hSpin);
    escKey.on('down', hBack);
  }

  // ─── BLACKJACK ──────────────────────────────────────────────────

  private static showBlackjack(scene: Phaser.Scene, onClose: () => void) {
    if (this.casinoBalance <= 0) { this.showCasinoBroke(scene, onClose); return; }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    let currentBet = 25;
    let gameActive = false;

    const suits = ['\u2660', '\u2665', '\u2666', '\u2663'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const drawCard = (): { rank: string; suit: string; value: number } => {
      const rank = ranks[Phaser.Math.Between(0, 12)];
      const suit = suits[Phaser.Math.Between(0, 3)];
      const value = parseInt(rank) || (rank === 'A' ? 11 : 10);
      return { rank, suit, value };
    };

    const handValue = (hand: { rank: string; suit: string; value: number }[]): number => {
      let total = 0;
      let aces = 0;
      for (const c of hand) {
        total += c.value;
        if (c.rank === 'A') aces++;
      }
      while (total > 21 && aces > 0) { total -= 10; aces--; }
      return total;
    };

    const handStr = (hand: { rank: string; suit: string; value: number }[], hideSecond = false): string => {
      return hand.map((c, i) => {
        if (hideSecond && i === 1) return '??';
        return c.rank + c.suit;
      }).join(' ');
    };

    let playerHand: { rank: string; suit: string; value: number }[] = [];
    let dealerHand: { rank: string; suit: string; value: number }[] = [];

    const bg = scene.add.rectangle(cx, cy, 380, 420, 0x0a3a1a)
      .setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 382, 422, 0xf0c040, 0)
      .setStrokeStyle(2, 0xf0c040)
      .setScrollFactor(0).setDepth(299);

    const title = scene.add.text(cx, cy - 185, 'BLACKJACK', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const balLabel = scene.add.text(cx, cy - 160, '$' + this.casinoBalance, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const dealerLabel = scene.add.text(cx - 160, cy - 130, 'DEALER', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    const dealerCards = scene.add.text(cx, cy - 105, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const dealerTotal = scene.add.text(cx + 160, cy - 105, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);

    const sep = scene.add.rectangle(cx, cy - 60, 340, 2, 0x335533)
      .setScrollFactor(0).setDepth(301);

    const playerLabel = scene.add.text(cx - 160, cy - 40, 'YOU', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    const playerCards = scene.add.text(cx, cy - 15, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const playerTotal = scene.add.text(cx + 160, cy - 15, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#f0c040',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(301);

    const resultText = scene.add.text(cx, cy + 30, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Bet selection
    const betLabel = scene.add.text(cx, cy + 65, 'BET: $' + currentBet, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const betAmounts = [25, 50, 100];
    const betBtns: Phaser.GameObjects.Rectangle[] = [];
    const betBtnLabels: Phaser.GameObjects.Text[] = [];
    betAmounts.forEach((amt, i) => {
      const x = cx - 100 + i * 100;
      const btn = scene.add.rectangle(x, cy + 95, 80, 28, i === 0 ? 0x3a5a7a : 0x1a2a4a)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const lbl = scene.add.text(x, cy + 95, '$' + amt, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      btn.on('pointerover', () => btn.setFillStyle(0x2a4a6a));
      btn.on('pointerout', () => btn.setFillStyle(currentBet === amt ? 0x3a5a7a : 0x1a2a4a));
      btn.on('pointerdown', () => {
        if (gameActive) return;
        currentBet = amt;
        betLabel.setText('BET: $' + currentBet);
        betBtns.forEach((b, j) => b.setFillStyle(j === i ? 0x3a5a7a : 0x1a2a4a));
      });
      betBtns.push(btn);
      betBtnLabels.push(lbl);
    });

    // Action buttons: DEAL / HIT / STAND
    const dealBtn = scene.add.rectangle(cx, cy + 135, 200, 36, 0x8b0000)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const dealLabel = scene.add.text(cx, cy + 135, 'DEAL', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    dealBtn.on('pointerover', () => dealBtn.setFillStyle(0xaa2222));
    dealBtn.on('pointerout', () => dealBtn.setFillStyle(0x8b0000));

    const hitBtn = scene.add.rectangle(cx - 65, cy + 135, 110, 36, 0x2a5a2a)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true }).setVisible(false);
    const hitLabel = scene.add.text(cx - 65, cy + 135, 'HIT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setVisible(false);
    hitBtn.on('pointerover', () => hitBtn.setFillStyle(0x3a7a3a));
    hitBtn.on('pointerout', () => hitBtn.setFillStyle(0x2a5a2a));

    const standBtn = scene.add.rectangle(cx + 65, cy + 135, 110, 36, 0x5a2a2a)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true }).setVisible(false);
    const standLabel = scene.add.text(cx + 65, cy + 135, 'STAND', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setVisible(false);
    standBtn.on('pointerover', () => standBtn.setFillStyle(0x7a3a3a));
    standBtn.on('pointerout', () => standBtn.setFillStyle(0x5a2a2a));

    // Back button
    const backBtn = scene.add.rectangle(cx, cy + 180, 140, 28, 0x333333)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const backLabel = scene.add.text(cx, cy + 180, 'BACK', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x555555));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333333));

    const elements: Phaser.GameObjects.GameObject[] = [
      bg, border, title, balLabel, dealerLabel, dealerCards, dealerTotal,
      sep, playerLabel, playerCards, playerTotal, resultText, betLabel,
      ...betBtns, ...betBtnLabels, dealBtn, dealLabel, hitBtn, hitLabel,
      standBtn, standLabel, backBtn, backLabel,
    ];
    const cleanup = () => elements.forEach(e => e.destroy());

    const updateDisplay = (hideDealer = true) => {
      dealerCards.setText(handStr(dealerHand, hideDealer));
      dealerTotal.setText(hideDealer && dealerHand.length > 0 ? '?' : '' + handValue(dealerHand));
      playerCards.setText(handStr(playerHand));
      playerTotal.setText('' + handValue(playerHand));
      balLabel.setText('$' + this.casinoBalance);
    };

    const endRound = (msg: string, won: boolean, multiplier: number) => {
      gameActive = false;
      updateDisplay(false);
      if (won) {
        const winnings = Math.floor(currentBet * multiplier);
        this.updateCasinoBalance(winnings - currentBet);
        resultText.setText(msg + ' +$' + winnings).setColor('#22ff88');
        scene.cameras.main.shake(300, 0.008);
        GameStats.increment('casinoWins');
        GameStats.increment('casinoProfit', winnings - currentBet);
        SoundEffects.slotWin();
        AchievementSystem.trackBlackjackWin();
        AchievementSystem.trackCasinoProfit(winnings - currentBet);
      } else {
        this.updateCasinoBalance(-currentBet);
        resultText.setText(msg + ' -$' + currentBet).setColor('#ff4444');
        SoundEffects.casinoLose();
        GameStats.increment('casinoLosses');
        GameStats.increment('casinoProfit', -currentBet);
        AchievementSystem.trackCasinoLoss(currentBet);
      }
      balLabel.setText('$' + this.casinoBalance);
      hitBtn.setVisible(false); hitLabel.setVisible(false);
      standBtn.setVisible(false); standLabel.setVisible(false);
      dealBtn.setVisible(true); dealLabel.setVisible(true).setText('DEAL AGAIN');

      if (this.casinoBalance <= 0) {
        scene.time.delayedCall(1200, () => { cleanup(); this.showCasinoBroke(scene, onClose); });
      }
    };

    const dealerPlay = () => {
      while (handValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
      }
      const dv = handValue(dealerHand);
      const pv = handValue(playerHand);
      if (dv > 21) endRound('Dealer busts!', true, 2);
      else if (pv > dv) endRound('You win!', true, 2);
      else if (pv === dv) { resultText.setText('Push. Bet returned.').setColor('#f0c040'); gameActive = false; hitBtn.setVisible(false); hitLabel.setVisible(false); standBtn.setVisible(false); standLabel.setVisible(false); dealBtn.setVisible(true); dealLabel.setVisible(true).setText('DEAL AGAIN'); updateDisplay(false); }
      else endRound('Dealer wins.', false, 0);
    };

    const doDeal = () => {
      if (gameActive) return;
      if (this.casinoBalance < currentBet) { resultText.setText('Not enough $!').setColor('#ff4444'); return; }
      gameActive = true;
      resultText.setText('');
      playerHand = [drawCard(), drawCard()];
      dealerHand = [drawCard(), drawCard()];
      SoundEffects.cardFlip();
      dealBtn.setVisible(false); dealLabel.setVisible(false);
      hitBtn.setVisible(true); hitLabel.setVisible(true);
      standBtn.setVisible(true); standLabel.setVisible(true);
      updateDisplay(true);

      // Check natural blackjack
      if (handValue(playerHand) === 21) {
        endRound('BLACKJACK!', true, 2.5);
        scene.cameras.main.flash(200, 255, 200, 0);
      }
    };

    const doHit = () => {
      if (!gameActive) return;
      playerHand.push(drawCard());
      SoundEffects.cardFlip();
      updateDisplay(true);
      if (handValue(playerHand) > 21) endRound('BUST!', false, 0);
      else if (handValue(playerHand) === 21) dealerPlay();
    };

    const doStand = () => {
      if (!gameActive) return;
      dealerPlay();
    };

    dealBtn.on('pointerdown', doDeal);
    hitBtn.on('pointerdown', doHit);
    standBtn.on('pointerdown', doStand);
    backBtn.on('pointerdown', () => { cleanupKeys(); cleanup(); this.showCasino(scene, onClose); });

    // Keyboard
    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const hKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    const sKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const hDeal = () => doDeal();
    const hHit = () => doHit();
    const hStand = () => doStand();
    const hEsc = () => { cleanupKeys(); cleanup(); this.showCasino(scene, onClose); };
    spaceKey.on('down', hDeal);
    hKey.on('down', hHit);
    sKey.on('down', hStand);
    escKey.on('down', hEsc);
    const cleanupKeys = () => { spaceKey.off('down', hDeal); hKey.off('down', hHit); sKey.off('down', hStand); escKey.off('down', hEsc); };
  }

  // ─── DICE (Craps-style) ─────────────────────────────────────────

  private static showDice(scene: Phaser.Scene, onClose: () => void) {
    if (this.casinoBalance <= 0) { this.showCasinoBroke(scene, onClose); return; }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    let currentBet = 10;
    let pick: 'over' | 'under' | null = null;
    let rolling = false;
    let autoRoll = false;

    const bg = scene.add.rectangle(cx, cy, 380, 400, 0x0a3a1a)
      .setScrollFactor(0).setDepth(300);
    const border = scene.add.rectangle(cx, cy, 382, 402, 0xf0c040, 0)
      .setStrokeStyle(2, 0xf0c040)
      .setScrollFactor(0).setDepth(299);

    const title = scene.add.text(cx, cy - 175, 'DICE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const balLabel = scene.add.text(cx, cy - 150, '$' + this.casinoBalance, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Dice display
    const die1Text = scene.add.text(cx - 50, cy - 90, '-', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const die2Text = scene.add.text(cx + 50, cy - 90, '-', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const totalText = scene.add.text(cx, cy - 40, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const resultText = scene.add.text(cx, cy - 10, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Pick: OVER 7 / UNDER 7
    const pickLabel = scene.add.text(cx, cy + 20, 'Pick:', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const overBtn = scene.add.rectangle(cx - 80, cy + 55, 130, 34, 0x1a2a4a)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const overLabel = scene.add.text(cx - 80, cy + 55, 'OVER 7', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    overBtn.on('pointerover', () => overBtn.setFillStyle(0x2a4a6a));
    overBtn.on('pointerout', () => overBtn.setFillStyle(pick === 'over' ? 0x3a5a7a : 0x1a2a4a));

    const underBtn = scene.add.rectangle(cx + 80, cy + 55, 130, 34, 0x1a2a4a)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const underLabel = scene.add.text(cx + 80, cy + 55, 'UNDER 7', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    underBtn.on('pointerover', () => underBtn.setFillStyle(0x2a4a6a));
    underBtn.on('pointerout', () => underBtn.setFillStyle(pick === 'under' ? 0x3a5a7a : 0x1a2a4a));

    overBtn.on('pointerdown', () => { if (rolling) return; pick = 'over'; overBtn.setFillStyle(0x3a5a7a); underBtn.setFillStyle(0x1a2a4a); });
    underBtn.on('pointerdown', () => { if (rolling) return; pick = 'under'; underBtn.setFillStyle(0x3a5a7a); overBtn.setFillStyle(0x1a2a4a); });

    // Bet selection
    const betLabel = scene.add.text(cx, cy + 95, 'BET: $' + currentBet, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const betAmounts = [10, 25, 50];
    const betBtns: Phaser.GameObjects.Rectangle[] = [];
    const betBtnLabels: Phaser.GameObjects.Text[] = [];
    betAmounts.forEach((amt, i) => {
      const x = cx - 90 + i * 90;
      const btn = scene.add.rectangle(x, cy + 120, 70, 26, i === 0 ? 0x3a5a7a : 0x1a2a4a)
        .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      const lbl = scene.add.text(x, cy + 120, '$' + amt, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      btn.on('pointerover', () => btn.setFillStyle(0x2a4a6a));
      btn.on('pointerout', () => btn.setFillStyle(currentBet === amt ? 0x3a5a7a : 0x1a2a4a));
      btn.on('pointerdown', () => { if (rolling) return; currentBet = amt; betLabel.setText('BET: $' + currentBet); betBtns.forEach((b, j) => b.setFillStyle(j === i ? 0x3a5a7a : 0x1a2a4a)); });
      betBtns.push(btn);
      betBtnLabels.push(lbl);
    });

    // ROLL button
    const rollBtn = scene.add.rectangle(cx, cy + 155, 200, 36, 0x8b0000)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const rollLabel = scene.add.text(cx, cy + 155, 'ROLL', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    rollBtn.on('pointerover', () => { if (!rolling) rollBtn.setFillStyle(0xaa2222); });
    rollBtn.on('pointerout', () => rollBtn.setFillStyle(0x8b0000));

    // Back button
    const backBtn = scene.add.rectangle(cx + 140, cy - 175, 40, 20, 0x333333)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const backLabel = scene.add.text(cx + 140, cy - 175, 'X', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x555555));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333333));

    const elements: Phaser.GameObjects.GameObject[] = [
      bg, border, title, balLabel, die1Text, die2Text, totalText, resultText,
      pickLabel, overBtn, overLabel, underBtn, underLabel, betLabel,
      ...betBtns, ...betBtnLabels, rollBtn, rollLabel, backBtn, backLabel,
    ];
    const cleanup = () => elements.forEach(e => e.destroy());

    const doRoll = () => {
      if (rolling) return;
      if (!pick) { resultText.setText('Pick OVER or UNDER!').setColor('#f0c040'); return; }
      if (this.casinoBalance < currentBet) { resultText.setText('Not enough $!').setColor('#ff4444'); return; }
      rolling = true;
      resultText.setText('');
      rollLabel.setText('...');
      SoundEffects.diceRoll();

      // Animate dice
      let ticks = 0;
      const maxTicks = 15;
      const animEvent = scene.time.addEvent({
        delay: 80,
        loop: true,
        callback: () => {
          ticks++;
          die1Text.setText('' + Phaser.Math.Between(1, 6));
          die2Text.setText('' + Phaser.Math.Between(1, 6));
          if (ticks >= maxTicks) {
            animEvent.destroy();
            const d1 = Phaser.Math.Between(1, 6);
            const d2 = Phaser.Math.Between(1, 6);
            const sum = d1 + d2;
            die1Text.setText('' + d1);
            die2Text.setText('' + d2);
            totalText.setText('Total: ' + sum);

            if (sum === 7) {
              // House wins
              this.updateCasinoBalance(-currentBet);
              resultText.setText('7! House wins. -$' + currentBet).setColor('#ff4444');
              SoundEffects.casinoLose();
              GameStats.increment('diceLosses');
              GameStats.increment('casinoLosses');
              GameStats.increment('casinoProfit', -currentBet);
              AchievementSystem.trackDiceLoss();
              AchievementSystem.trackCasinoLoss(currentBet);
            } else if ((pick === 'over' && sum > 7) || (pick === 'under' && sum < 7)) {
              const win = currentBet * 2;
              this.updateCasinoBalance(win - currentBet);
              resultText.setText('WIN! +$' + win).setColor('#22ff88');
              scene.cameras.main.shake(200, 0.005);
              SoundEffects.chipStack();
              GameStats.increment('diceWins');
              GameStats.increment('casinoWins');
              GameStats.increment('casinoProfit', win - currentBet);
              AchievementSystem.trackDiceWin();
              AchievementSystem.trackCasinoProfit(win - currentBet);
            } else {
              this.updateCasinoBalance(-currentBet);
              resultText.setText('Wrong call. -$' + currentBet).setColor('#ff4444');
              SoundEffects.casinoLose();
              GameStats.increment('diceLosses');
              GameStats.increment('casinoLosses');
              GameStats.increment('casinoProfit', -currentBet);
              AchievementSystem.trackDiceLoss();
              AchievementSystem.trackCasinoLoss(currentBet);
            }

            balLabel.setText('$' + this.casinoBalance);
            rollLabel.setText('ROLL');
            rolling = false;

            if (this.casinoBalance <= 0) {
              scene.time.delayedCall(1000, () => { cleanup(); this.showCasinoBroke(scene, onClose); });
            } else if (autoRoll) {
              scene.time.delayedCall(800, () => doRoll());
            }
          }
        },
      });
    };

    rollBtn.on('pointerdown', doRoll);
    backBtn.on('pointerdown', () => { autoRoll = false; cleanupKeys(); cleanup(); this.showCasino(scene, onClose); });

    // Keyboard
    const spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const oKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    const uKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    const aKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const hRoll = () => doRoll();
    const hOver = () => { if (!rolling) { pick = 'over'; overBtn.setFillStyle(0x3a5a7a); underBtn.setFillStyle(0x1a2a4a); } };
    const hUnder = () => { if (!rolling) { pick = 'under'; underBtn.setFillStyle(0x3a5a7a); overBtn.setFillStyle(0x1a2a4a); } };
    const hAuto = () => { autoRoll = !autoRoll; rollLabel.setText(autoRoll ? 'AUTO' : 'ROLL'); if (autoRoll && !rolling) doRoll(); };
    const hEsc = () => { autoRoll = false; cleanupKeys(); cleanup(); this.showCasino(scene, onClose); };
    spaceKey.on('down', hRoll);
    escKey.on('down', hEsc);
    oKey.on('down', hOver);
    uKey.on('down', hUnder);
    aKey.on('down', hAuto);
    const cleanupKeys = () => { spaceKey.off('down', hRoll); escKey.off('down', hEsc); oKey.off('down', hOver); uKey.off('down', hUnder); aKey.off('down', hAuto); };
  }

  // ─── CRYPTO TRADING ─────────────────────────────────────────────

  private static showCryptoTrading(scene: Phaser.Scene, onClose: () => void) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const D = 300; // base depth

    // ── State ──
    interface CoinState { name: string; price: number; startPrice: number; holdings: number; volatility: [number, number]; history: number[]; }
    const coins: CoinState[] = [
      { name: 'LUNA', price: 1.20, startPrice: 1.20, holdings: 0, volatility: [0.05, 0.20], history: [] },
      { name: 'DOGE', price: 0.08, startPrice: 0.08, holdings: 0, volatility: [0.01, 0.06], history: [] },
      { name: 'BTC',  price: 42000, startPrice: 42000, holdings: 0, volatility: [0.01, 0.05], history: [] },
      { name: 'SHIB', price: 0.00003, startPrice: 0.00003, holdings: 0, volatility: [0.10, 0.40], history: [] },
    ];
    coins.forEach(c => { for (let i = 0; i < 20; i++) c.history.push(c.price); });

    let cash = Math.max(BalanceSystem.getBalance(), 1000);
    const startCash = cash;
    let peakPortfolio = cash;
    let selectedCoin = 0;
    let running = true;

    const elements: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(obj: T): T => { elements.push(obj); return obj; };

    // ── Background ──
    add(scene.add.rectangle(cx, cy, 360, 440, 0x0a0a1a).setScrollFactor(0).setDepth(D));
    add(scene.add.rectangle(cx, cy, 362, 442, 0x22ff88, 0).setStrokeStyle(2, 0x22ff88).setScrollFactor(0).setDepth(D - 1));

    // ── Header ──
    add(scene.add.text(cx, cy - 200, 'ROBINHOOD', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#22ff88',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));

    // ── Portfolio value ──
    const portfolioText = add(scene.add.text(cx, cy - 178, '$' + cash.toFixed(2), {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));

    const cashText = add(scene.add.text(cx, cy - 160, 'Cash: $' + cash.toFixed(2), {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));

    // ── Coin rows ──
    const coinNames: Phaser.GameObjects.Text[] = [];
    const coinPrices: Phaser.GameObjects.Text[] = [];
    const coinChanges: Phaser.GameObjects.Text[] = [];
    const coinHoldings: Phaser.GameObjects.Text[] = [];
    const selectors: Phaser.GameObjects.Rectangle[] = [];

    coins.forEach((c, i) => {
      const rowY = cy - 120 + i * 42;
      const sel = add(scene.add.rectangle(cx, rowY, 330, 36, i === 0 ? 0x1a2a3a : 0x111122)
        .setScrollFactor(0).setDepth(D + 1));
      selectors.push(sel);

      add(scene.add.rectangle(cx, rowY + 18, 320, 1, 0x222244).setScrollFactor(0).setDepth(D + 1));

      const nm = add(scene.add.text(cx - 155, rowY - 8, c.name, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 2));
      coinNames.push(nm);

      const pr = add(scene.add.text(cx + 30, rowY - 8, '$' + fmtPrice(c.price), {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 2));
      coinPrices.push(pr);

      const ch = add(scene.add.text(cx + 140, rowY - 8, '+0.0%', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#22ff88',
      }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(D + 2));
      coinChanges.push(ch);

      const hd = add(scene.add.text(cx - 155, rowY + 8, 'Held: 0', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#666666',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D + 2));
      coinHoldings.push(hd);
    });

    // ── Price chart (graphics) ──
    const chartX = cx - 140;
    const chartY = cy + 65;
    const chartW = 280;
    const chartH = 60;
    add(scene.add.rectangle(cx, chartY + chartH / 2, chartW + 10, chartH + 10, 0x0d0d1f).setScrollFactor(0).setDepth(D + 1));
    const chartGfx = add(scene.add.graphics().setScrollFactor(0).setDepth(D + 2));

    // ── Event banner ──
    const eventBanner = add(scene.add.text(cx, cy + 115, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ff0000',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 3).setAlpha(0));

    // ── Panic / Diamond text ──
    const panicText = add(scene.add.text(cx, cy + 135, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 3).setAlpha(0));

    // ── Controls hint ──
    add(scene.add.text(cx, cy + 195, '[1-4] Coin [B]uy [S]ell [A]ll-in', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
    add(scene.add.text(cx, cy + 208, '[SPACE/ESC] Exit', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '5px', color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));

    // ── Screen tint overlay (for panic / euphoria) ──
    const tintOverlay = add(scene.add.rectangle(cx, cy, 360, 440, 0xff0000, 0)
      .setScrollFactor(0).setDepth(D + 4)) as Phaser.GameObjects.Rectangle;

    // ── Helpers ──
    function fmtPrice(p: number): string {
      if (p >= 1000) return p.toFixed(2);
      if (p >= 1) return p.toFixed(4);
      if (p >= 0.001) return p.toFixed(6);
      return p.toFixed(8);
    }

    function getPortfolioValue(): number {
      let val = cash;
      coins.forEach(c => { val += c.holdings * c.price; });
      return val;
    }

    function pctChange(c: CoinState): number {
      return ((c.price - c.startPrice) / c.startPrice) * 100;
    }

    // ── Draw chart ──
    const drawChart = () => {
      const gfx = chartGfx as Phaser.GameObjects.Graphics;
      gfx.clear();
      const coin = coins[selectedCoin];
      const hist = coin.history;
      if (hist.length < 2) return;

      const minP = Math.min(...hist) * 0.95;
      const maxP = Math.max(...hist) * 1.05;
      const range = maxP - minP || 1;
      const isUp = coin.price >= coin.startPrice;
      const lineColor = isUp ? 0x22ff88 : 0xff4444;

      gfx.lineStyle(2, lineColor, 1);
      gfx.beginPath();
      hist.forEach((p, i) => {
        const px = chartX + (i / (hist.length - 1)) * chartW;
        const py = chartY + chartH - ((p - minP) / range) * chartH;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      });
      gfx.strokePath();

      // Fill under line
      gfx.fillStyle(lineColor, 0.1);
      gfx.beginPath();
      hist.forEach((p, i) => {
        const px = chartX + (i / (hist.length - 1)) * chartW;
        const py = chartY + chartH - ((p - minP) / range) * chartH;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      });
      gfx.lineTo(chartX + chartW, chartY + chartH);
      gfx.lineTo(chartX, chartY + chartH);
      gfx.closePath();
      gfx.fillPath();
    };

    // ── Update display ──
    const updateDisplay = () => {
      const pv = getPortfolioValue();
      GameStats.setMax('cryptoPeakPortfolio', Math.round(pv));
      portfolioText.setText('$' + pv.toFixed(2));
      const pvColor = pv >= startCash ? '#22ff88' : '#ff4444';
      portfolioText.setColor(pvColor);
      cashText.setText('Cash: $' + cash.toFixed(2));

      coins.forEach((c, i) => {
        coinPrices[i].setText('$' + fmtPrice(c.price));
        const pct = pctChange(c);
        const sign = pct >= 0 ? '+' : '';
        coinChanges[i].setText(sign + pct.toFixed(1) + '%');
        coinChanges[i].setColor(pct >= 0 ? '#22ff88' : '#ff4444');
        coinHoldings[i].setText('Held: ' + (c.holdings > 0 ? c.holdings.toFixed(c.price < 1 ? 0 : 6) : '0') + (c.holdings > 0 ? ' ($' + (c.holdings * c.price).toFixed(2) + ')' : ''));

        selectors[i].setFillStyle(i === selectedCoin ? 0x1a2a3a : 0x111122);
      });

      drawChart();

      // Track peak
      if (pv > peakPortfolio) peakPortfolio = pv;

      // Panic: portfolio dropped >30% from peak
      const dropPct = ((peakPortfolio - pv) / peakPortfolio) * 100;
      if (dropPct > 30) {
        panicText.setText('SELL SELL SELL');
        panicText.setColor('#ff4444');
        panicText.setAlpha(1);
        tintOverlay.setFillStyle(0xff0000, 0.08);
        scene.tweens.add({ targets: panicText, alpha: 0, duration: 1500, delay: 500 });
        // Diamond hands: still holding through a >30% crash
        const hasHoldings = coins.some(c => c.holdings > 0);
        if (hasHoldings) AchievementSystem.check('diamond_hands');
      }

      // Euphoria: portfolio up >100%
      const gainPct = ((pv - startCash) / startCash) * 100;
      if (gainPct > 100) {
        panicText.setText('DIAMOND HANDS');
        panicText.setColor('#22ff88');
        panicText.setAlpha(1);
        tintOverlay.setFillStyle(0x22ff88, 0.06);
        scene.tweens.add({ targets: panicText, alpha: 0, duration: 2000, delay: 500 });
      }

      // To The Moon: portfolio hits $10K
      AchievementSystem.check('to_the_moon', pv >= 10000);
    };

    // ── Price tick ──
    const priceTick = () => {
      if (!running) return;
      coins.forEach(c => {
        const [minV, maxV] = c.volatility;
        const swing = minV + Math.random() * (maxV - minV);
        const direction = Math.random() > 0.48 ? 1 : -1; // slight upward bias
        c.price *= (1 + direction * swing);
        if (c.price < c.startPrice * 0.001) c.price = c.startPrice * 0.001; // floor
        c.history.push(c.price);
        if (c.history.length > 20) c.history.shift();
      });
      updateDisplay();
    };

    // ── Random events ──
    const events = [
      { name: 'ELON TWEETED ABOUT DOGE', color: '#f0c040', action: () => {
        const doge = coins[1];
        const pump = 0.5 + Math.random() * 0.5; // 50-100%
        doge.price *= (1 + pump);
        doge.history.push(doge.price);
        if (doge.history.length > 20) doge.history.shift();
        scene.cameras.main.shake(400, 0.008);
        SoundEffects.pricePump();
      }},
      { name: 'SEC INVESTIGATION', color: '#ff2222', action: () => {
        coins.forEach(c => {
          const drop = 0.2 + Math.random() * 0.2; // 20-40%
          c.price *= (1 - drop);
          c.history.push(c.price);
          if (c.history.length > 20) c.history.shift();
        });
        tintOverlay.setFillStyle(0xff0000, 0.15);
        scene.tweens.add({ targets: tintOverlay, alpha: 0, duration: 1000, onComplete: () => tintOverlay.setAlpha(1) });
        scene.cameras.main.shake(500, 0.012);
        SoundEffects.priceDump();
      }},
      { name: 'WHALE ALERT  --  BTC', color: '#4488ff', action: () => {
        const btc = coins[2];
        btc.price *= 1.15;
        btc.history.push(btc.price);
        if (btc.history.length > 20) btc.history.shift();
        // Whale emoji float
        const whale = add(scene.add.text(cx - 180, cy, 'W', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#4488ff',
        }).setScrollFactor(0).setDepth(D + 5));
        scene.tweens.add({ targets: whale, x: cx + 200, duration: 3000, onComplete: () => whale.destroy() });
        SoundEffects.pricePump();
      }},
      { name: 'RUG PULL -- SHIB GOT RUGGED', color: '#ff0000', action: () => {
        const shib = coins[3];
        shib.price *= 0.2; // 80% drop
        shib.history.push(shib.price);
        if (shib.history.length > 20) shib.history.shift();
        tintOverlay.setFillStyle(0xff0000, 0.2);
        scene.tweens.add({ targets: tintOverlay, alpha: 0, duration: 1500, onComplete: () => tintOverlay.setAlpha(1) });
        scene.cameras.main.shake(600, 0.015);
        SoundEffects.rugPull();
      }},
      { name: 'LUNA TO THE MOON', color: '#bb66ff', action: () => {
        const luna = coins[0];
        luna.price *= 3; // +200%
        luna.history.push(luna.price);
        if (luna.history.length > 20) luna.history.shift();
        scene.cameras.main.shake(500, 0.01);
        tintOverlay.setFillStyle(0xbb66ff, 0.1);
        scene.tweens.add({ targets: tintOverlay, alpha: 0, duration: 1200, onComplete: () => tintOverlay.setAlpha(1) });
        SoundEffects.pricePump();
      }},
    ];

    const fireEvent = () => {
      if (!running) return;
      const evt = events[Math.floor(Math.random() * events.length)];
      evt.action();
      eventBanner.setText(evt.name);
      eventBanner.setColor(evt.color);
      eventBanner.setAlpha(1);
      scene.tweens.add({ targets: eventBanner, alpha: 0, duration: 3000, delay: 1500 });
      updateDisplay();
    };

    // ── Timers ──
    const priceTimer = scene.time.addEvent({ delay: 2000, callback: priceTick, loop: true });
    const eventDelay = 15000 + Math.random() * 15000;
    let eventTimer = scene.time.addEvent({ delay: eventDelay, callback: () => {
      fireEvent();
      // Schedule next event
      const next = 15000 + Math.random() * 15000;
      eventTimer = scene.time.addEvent({ delay: next, callback: () => fireEvent(), loop: false });
    }, loop: false });

    // Recurring event scheduler
    const eventLoop = scene.time.addEvent({ delay: 20000, callback: () => {
      if (running) fireEvent();
    }, loop: true });

    // ── Buy / Sell ──
    const buyAmount = 100;

    const buyCoin = () => {
      const c = coins[selectedCoin];
      if (cash < buyAmount) return;
      const units = buyAmount / c.price;
      cash -= buyAmount;
      c.holdings += units;
      updateDisplay();
      // Little shake on buy
      scene.cameras.main.shake(100, 0.002);
      SoundEffects.chipStack();
    };

    const sellCoin = () => {
      const c = coins[selectedCoin];
      if (c.holdings <= 0) return;
      // Paper hands: selling during a >30% crash from peak
      const pvBeforeSell = getPortfolioValue();
      const dropPctSell = ((peakPortfolio - pvBeforeSell) / peakPortfolio) * 100;
      if (dropPctSell > 30) AchievementSystem.check('paper_hands');
      const value = c.holdings * c.price;
      cash += value;
      c.holdings = 0;
      updateDisplay();
      // Big gain = big shake
      if (value > buyAmount * 2) scene.cameras.main.shake(300, 0.008);
      SoundEffects.chipStack();
    };

    const allIn = () => {
      const c = coins[selectedCoin];
      if (cash < 0.01) return;
      const units = cash / c.price;
      c.holdings += units;
      cash = 0;
      updateDisplay();
      scene.cameras.main.shake(200, 0.005);
      // Flash "ALL IN" text
      panicText.setText('ALL IN');
      panicText.setColor('#f0c040');
      panicText.setAlpha(1);
      scene.tweens.add({ targets: panicText, alpha: 0, duration: 1500 });
    };

    // ── Keyboard ──
    const kOne   = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    const kTwo   = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    const kThree = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    const kFour  = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    const kB     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    const kS     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const kA     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const kSpace = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const kEsc   = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const hOne   = () => { selectedCoin = 0; updateDisplay(); };
    const hTwo   = () => { selectedCoin = 1; updateDisplay(); };
    const hThree = () => { selectedCoin = 2; updateDisplay(); };
    const hFour  = () => { selectedCoin = 3; updateDisplay(); };
    const hBuy   = () => buyCoin();
    const hSell  = () => sellCoin();
    const hAll   = () => allIn();

    const closeGame = () => {
      running = false;
      priceTimer.destroy();
      eventTimer.destroy();
      eventLoop.destroy();
      cleanKeys();

      // Apply gains/losses to BalanceSystem
      const finalValue = getPortfolioValue();
      GameStats.setMax('cryptoPeakPortfolio', Math.round(finalValue));
      const delta = Math.round(finalValue - startCash);
      if (delta > 0) BalanceSystem.earn(delta, 'casino');
      else if (delta < 0) BalanceSystem.spend(Math.min(Math.abs(delta), BalanceSystem.getBalance()), 'casino');
      this.casinoBalance += delta;
      if (this.casinoBalance < 0) this.casinoBalance = 0;
      this.save();

      elements.forEach(e => { try { e.destroy(); } catch (_e) { /* already destroyed */ } });
      onClose();
    };

    const hClose = () => closeGame();

    kOne.on('down', hOne);
    kTwo.on('down', hTwo);
    kThree.on('down', hThree);
    kFour.on('down', hFour);
    kB.on('down', hBuy);
    kS.on('down', hSell);
    kA.on('down', hAll);
    kSpace.on('down', hClose);
    kEsc.on('down', hClose);

    const cleanKeys = () => {
      kOne.off('down', hOne); kTwo.off('down', hTwo); kThree.off('down', hThree); kFour.off('down', hFour);
      kB.off('down', hBuy); kS.off('down', hSell); kA.off('down', hAll);
      kSpace.off('down', hClose); kEsc.off('down', hClose);
    };

    // Initial display
    updateDisplay();
  }
}
