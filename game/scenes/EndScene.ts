import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { MusicSystem } from '../systems/MusicSystem';
import { Analytics } from '../systems/Analytics';
import { GameStats, type GameStatsData } from '../systems/GameStats';
import { BalanceSystem } from '../systems/BalanceSystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { SoundEffects } from '../systems/SoundEffects';

export class EndScene extends Phaser.Scene {
  private statsElements: Phaser.GameObjects.GameObject[] = [];
  private shareCardElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'EndScene' });
  }

  create() {
    MusicSystem.stop();
    Analytics.trackGameComplete();

    // Final stat snapshot
    GameStats.setMax('totalMoney', BalanceSystem.getBalance());

    // Beat all chapters achievement
    AchievementSystem.attachScene(this);
    AchievementSystem.check('the_whole_story');

    this.cameras.main.fadeIn(1500, 0, 0, 0);
    this.showStatsScreen();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  GTA-STYLE STATS SCREEN
  // ═══════════════════════════════════════════════════════════════════

  private showStatsScreen() {
    const stats = GameStats.getAll();
    const cx = GAME_WIDTH / 2;
    const d = 100; // depth base

    // ── Full black background ──
    const bg = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510)
      .setDepth(d);
    this.statsElements.push(bg);

    // ── Gold trim lines ──
    const topLine = this.add.rectangle(cx, 40, GAME_WIDTH - 120, 2, 0xd4a017)
      .setDepth(d + 1).setAlpha(0);
    const bottomLine = this.add.rectangle(cx, GAME_HEIGHT - 100, GAME_WIDTH - 120, 2, 0xd4a017)
      .setDepth(d + 1).setAlpha(0);
    this.statsElements.push(topLine, bottomLine);

    this.tweens.add({ targets: [topLine, bottomLine], alpha: 0.6, duration: 800, delay: 300 });

    // ── Title ──
    const title = this.add.text(cx, 72, 'JDLO: THE STATS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#d4a017',
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.statsElements.push(title);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      delay: 200,
    });

    // Subtitle
    const subtitle = this.add.text(cx, 100, 'YOUR STORY IN NUMBERS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8888aa',
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.statsElements.push(subtitle);

    this.tweens.add({ targets: subtitle, alpha: 1, duration: 800, delay: 600 });

    // ── Stats in two columns ──
    const leftX = cx - 260;
    const rightX = cx + 40;
    const startY = 150;
    const lineH = 52;

    const leftStats = [
      { icon: '\u{1F4B0}', label: 'Peak Balance', value: '$' + stats.totalMoney.toLocaleString(), color: '#22ff88' },
      { icon: '\u{1F3B0}', label: 'Casino Record', value: this.formatRecord(stats.casinoWins, stats.casinoLosses, stats.casinoProfit), color: stats.casinoProfit >= 0 ? '#22ff88' : '#ff4444' },
      { icon: '\u{1F4C8}', label: 'Crypto Peak', value: stats.cryptoPeakPortfolio > 0 ? '$' + stats.cryptoPeakPortfolio.toLocaleString() : '--', color: '#00ccff' },
      { icon: '\u{1F494}', label: 'Girls Fumbled', value: '' + stats.girlsFumbled, color: stats.girlsFumbled > 3 ? '#ff4444' : '#ffffff' },
      { icon: '\u{2764}\u{FE0F}', label: 'Girls Succeeded', value: '' + stats.girlsSucceeded, color: '#ff69b4' },
      { icon: '\u{1F37A}', label: 'Drinks Had', value: '' + stats.drinksHad, color: '#ffaa00' },
    ];

    const rightStats = [
      { icon: '\u{1F33F}', label: 'Times Smoked', value: '' + stats.timesSmoked, color: '#66cc66' },
      { icon: '\u{1F3B2}', label: 'Dice Record', value: stats.diceWins + '-' + stats.diceLosses, color: '#ffffff' },
      { icon: '\u{1F5E3}\u{FE0F}', label: 'NPCs Met', value: '' + stats.npcsTalkedTo, color: '#aaaaff' },
      { icon: '\u{1F4E6}', label: 'Items Found', value: '' + stats.itemsCollected, color: '#ffcc44' },
      { icon: '\u{23F1}\u{FE0F}', label: 'Play Time', value: this.formatPlayTime(stats.totalPlayTimeMs), color: '#cccccc' },
      { icon: '\u{1F3AE}', label: 'Minigames', value: stats.minigamesWon + '/' + stats.minigamesPlayed + ' won', color: '#ff8844' },
    ];

    // Render left column with stagger
    leftStats.forEach((s, i) => {
      this.createStatRow(leftX, startY + i * lineH, s.icon, s.label, s.value, s.color, d + 2, 800 + i * 150);
    });

    // Render right column with stagger
    rightStats.forEach((s, i) => {
      this.createStatRow(rightX, startY + i * lineH, s.icon, s.label, s.value, s.color, d + 2, 800 + i * 150 + 75);
    });

    // ── Divider before grade ──
    const gradeDivider = this.add.rectangle(cx, startY + 6 * lineH + 10, GAME_WIDTH - 200, 1, 0x333355)
      .setDepth(d + 1).setAlpha(0);
    this.statsElements.push(gradeDivider);
    this.tweens.add({ targets: gradeDivider, alpha: 0.5, duration: 600, delay: 2200 });

    // ── GRADE ──
    const gradeDelay = 2600;
    const grade = this.calculateGrade(stats);
    const gradeY = startY + 6 * lineH + 55;

    const gradeLabel = this.add.text(cx - 60, gradeY, 'GRADE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#8888aa',
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.statsElements.push(gradeLabel);

    const gradeText = this.add.text(cx + 40, gradeY, grade.letter, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: grade.color,
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(d + 3).setScale(0);
    this.statsElements.push(gradeText);

    const gradeDesc = this.add.text(cx, gradeY + 40, grade.description, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#aaaacc',
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.statsElements.push(gradeDesc);

    // Grade label fade in
    this.tweens.add({ targets: gradeLabel, alpha: 1, duration: 600, delay: gradeDelay });

    // Grade letter bounce in with flash
    this.tweens.add({
      targets: gradeText,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
      delay: gradeDelay + 400,
      onStart: () => {
        // Screen flash on grade reveal
        this.time.delayedCall(gradeDelay > 0 ? 0 : gradeDelay + 400, () => {
          const flash = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, grade.flashColor)
            .setDepth(d + 10).setAlpha(0);
          this.statsElements.push(flash);
          this.tweens.add({
            targets: flash,
            alpha: { from: 0, to: 0.5 },
            duration: 150,
            yoyo: true,
            onComplete: () => {
              this.tweens.add({
                targets: flash,
                alpha: { from: 0, to: 0.3 },
                duration: 100,
                yoyo: true,
                onComplete: () => flash.destroy(),
              });
            },
          });
        });
        // Camera shake
        this.cameras.main.shake(400, 0.012);
      },
    });

    // Grade bounce pulse
    this.tweens.add({
      targets: gradeText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: 2,
      delay: gradeDelay + 1200,
    });

    // Grade description
    this.tweens.add({ targets: gradeDesc, alpha: 1, duration: 600, delay: gradeDelay + 1000 });

    // ── Buttons ──
    const btnY = GAME_HEIGHT - 55;
    const btnDelay = gradeDelay + 1600;

    // CONTINUE button (goes to narrative end)
    const continueBtn = this.add.text(cx - 160, btnY, '[ CONTINUE ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(d + 5).setAlpha(0).setInteractive({ useHandCursor: true });
    this.statsElements.push(continueBtn);

    continueBtn.on('pointerover', () => continueBtn.setColor('#ffdd66'));
    continueBtn.on('pointerout', () => continueBtn.setColor('#f0c040'));
    continueBtn.on('pointerdown', () => this.transitionToNarrative());

    this.tweens.add({ targets: continueBtn, alpha: 1, duration: 800, delay: btnDelay });
    this.tweens.add({
      targets: continueBtn,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      delay: btnDelay + 1000,
    });

    // SHARE button
    const shareBtn = this.add.text(cx + 60, btnY, '[ SHARE CARD ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setDepth(d + 5).setAlpha(0).setInteractive({ useHandCursor: true });
    this.statsElements.push(shareBtn);

    shareBtn.on('pointerover', () => shareBtn.setColor('#88aaee'));
    shareBtn.on('pointerout', () => shareBtn.setColor('#6688cc'));
    shareBtn.on('pointerdown', () => {
      this.showShareCard(stats, grade.letter, grade.color);
    });

    this.tweens.add({ targets: shareBtn, alpha: 1, duration: 800, delay: btnDelay + 200 });

    // PLAY AGAIN
    const playAgain = this.add.text(cx + 240, btnY, '[ PLAY AGAIN ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#555577',
    }).setOrigin(0.5).setDepth(d + 5).setAlpha(0).setInteractive({ useHandCursor: true });
    this.statsElements.push(playAgain);

    playAgain.on('pointerover', () => playAgain.setColor('#8888aa'));
    playAgain.on('pointerout', () => playAgain.setColor('#555577'));
    playAgain.on('pointerdown', () => {
      GameStats.reset();
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    });

    this.tweens.add({ targets: playAgain, alpha: 1, duration: 800, delay: btnDelay + 400 });

    // SPACE to continue
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.transitionToNarrative();
    });
  }

  // ── Stat Row Builder ──

  private createStatRow(
    x: number, y: number,
    icon: string, label: string, value: string, valueColor: string,
    depth: number, delay: number,
  ) {
    // Icon
    const iconText = this.add.text(x, y, icon, {
      fontSize: '18px',
    }).setOrigin(0, 0.5).setDepth(depth).setAlpha(0);
    this.statsElements.push(iconText);

    // Label
    const labelText = this.add.text(x + 30, y - 8, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#666688',
    }).setOrigin(0, 0.5).setDepth(depth).setAlpha(0);
    this.statsElements.push(labelText);

    // Value
    const valueText = this.add.text(x + 30, y + 10, value, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: valueColor,
    }).setOrigin(0, 0.5).setDepth(depth).setAlpha(0).setScale(0.8);
    this.statsElements.push(valueText);

    // Animate in
    this.tweens.add({ targets: iconText, alpha: 1, duration: 400, delay });
    this.tweens.add({ targets: labelText, alpha: 1, duration: 400, delay: delay + 50 });
    this.tweens.add({
      targets: valueText,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      delay: delay + 100,
    });
  }

  // ── Grade Calculator ──

  private calculateGrade(stats: GameStatsData): { letter: string; color: string; flashColor: number; description: string } {
    let score = 0;

    // NPCs talked to (max 20 pts)
    score += Math.min(stats.npcsTalkedTo * 2, 20);
    // Items collected (max 15 pts)
    score += Math.min(stats.itemsCollected * 3, 15);
    // Chapters (max 21 pts, 3 per chapter)
    score += stats.chaptersCompleted * 3;
    // Casino games played (max 10 pts)
    score += Math.min((stats.casinoWins + stats.casinoLosses), 10);
    // Girls interacted with (max 10 pts)
    score += Math.min((stats.girlsFumbled + stats.girlsSucceeded) * 2, 10);
    // Substances (max 5 pts)
    score += Math.min(stats.drinksHad + stats.timesSmoked, 5);
    // Minigames (max 10 pts)
    score += Math.min(stats.minigamesPlayed * 2, 10);
    // Play time bonus (max 9 pts, 1pt per 5 min)
    score += Math.min(Math.floor(stats.totalPlayTimeMs / 300000), 9);

    // Total possible = ~100

    if (score >= 80) return { letter: 'S', color: '#FFD700', flashColor: 0xFFD700, description: 'You lived every moment. Legend.' };
    if (score >= 60) return { letter: 'A', color: '#22ff88', flashColor: 0x22ff88, description: 'Experienced most of the story. Respect.' };
    if (score >= 40) return { letter: 'B', color: '#00ccff', flashColor: 0x00ccff, description: 'Solid run. Missed some things though.' };
    if (score >= 20) return { letter: 'C', color: '#ff8844', flashColor: 0xff8844, description: 'Rushed through. Go back and explore.' };
    return { letter: 'D', color: '#ff4444', flashColor: 0xff4444, description: 'Barely scratched the surface.' };
  }

  // ═══════════════════════════════════════════════════════════════════
  //  SHARE CARD
  // ═══════════════════════════════════════════════════════════════════

  private showShareCard(stats: GameStatsData, gradeLetter: string, gradeColor: string) {
    // Destroy any existing card first
    this.dismissShareCard();

    SoundEffects.achievementUnlock();
    this.cameras.main.shake(250, 0.008);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const d = 500; // above everything

    // ── Dark fullscreen backdrop (click-to-dismiss) ──
    const backdrop = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setDepth(d).setAlpha(0).setInteractive();
    this.shareCardElements.push(backdrop);

    this.tweens.add({ targets: backdrop, alpha: 0.82, duration: 300 });

    // ── Card dimensions ──
    const cardW = 580;
    const cardH = 760;
    const cardX = cx;
    const cardY = cy;

    // ── Card background ──
    const cardBg = this.add.rectangle(cardX, cardY, cardW, cardH, 0x07071a)
      .setDepth(d + 1).setAlpha(0);
    this.shareCardElements.push(cardBg);

    // Gold border — drawn as a slightly larger rectangle behind the card
    const cardBorder = this.add.rectangle(cardX, cardY, cardW + 4, cardH + 4, 0xd4a017)
      .setDepth(d + 0.5).setAlpha(0);
    this.shareCardElements.push(cardBorder);

    // Inner accent border
    const cardInner = this.add.rectangle(cardX, cardY, cardW - 24, cardH - 24, 0x0d0d2a)
      .setDepth(d + 1.5).setAlpha(0);
    this.shareCardElements.push(cardInner);

    // ── Animate card in ──
    this.tweens.add({
      targets: [cardBorder, cardBg, cardInner],
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut',
      delay: 100,
    });

    const topY = cardY - cardH / 2;

    // ── Top accent line ──
    const accentLine = this.add.rectangle(cardX, topY + 42, cardW - 60, 2, 0xd4a017)
      .setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(accentLine);
    this.tweens.add({ targets: accentLine, alpha: 0.7, duration: 400, delay: 350 });

    // ── Header label ──
    const headerLabel = this.add.text(cardX, topY + 28, 'JDLO THE GAME', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#d4a017',
      letterSpacing: 6,
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(headerLabel);
    this.tweens.add({ targets: headerLabel, alpha: 1, duration: 400, delay: 300 });

    // ── Main title ──
    const titleLine1 = this.add.text(cardX, topY + 70, 'I JUST BEAT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(titleLine1);

    const titleLine2 = this.add.text(cardX, topY + 100, 'JDLO THE GAME', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#d4a017',
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(titleLine2);

    this.tweens.add({ targets: [titleLine1, titleLine2], alpha: 1, duration: 500, delay: 400 });

    // ── Grade section ──
    const gradeY = topY + 160;

    const gradeCircleBg = this.add.circle(cardX, gradeY + 10, 52, 0x000000)
      .setDepth(d + 2).setAlpha(0).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(gradeColor.replace('#', '')).color);
    this.shareCardElements.push(gradeCircleBg);

    const gradeBig = this.add.text(cardX, gradeY + 10, gradeLetter, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '58px',
      color: gradeColor,
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(d + 3).setAlpha(0).setScale(0);
    this.shareCardElements.push(gradeBig);

    this.tweens.add({
      targets: [gradeCircleBg],
      alpha: 1,
      duration: 400,
      delay: 500,
    });
    this.tweens.add({
      targets: gradeBig,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 550,
      onComplete: () => {
        this.tweens.add({
          targets: gradeBig,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 500,
          yoyo: true,
          repeat: 1,
        });
      },
    });

    // ── Tagline ──
    const tagline = this.add.text(cardX, gradeY + 80, this.getTagline(gradeLetter), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: gradeColor,
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(tagline);
    this.tweens.add({ targets: tagline, alpha: 1, duration: 400, delay: 700 });

    // ── Divider ──
    const divider = this.add.rectangle(cardX, gradeY + 106, cardW - 100, 1, 0x333355)
      .setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(divider);
    this.tweens.add({ targets: divider, alpha: 0.8, duration: 400, delay: 750 });

    // ── Stats grid ──
    const statsStartY = gradeY + 132;
    const col1X = cardX - 220;
    const col2X = cardX + 20;
    const rowH = 68;

    const achievementCount = AchievementSystem.getUnlocked().length;

    const cardStats = [
      // Left column
      { col: 0, row: 0, icon: '\u{1F4B0}', label: 'MONEY MADE',     value: '$' + stats.totalMoney.toLocaleString(),                                color: '#22ff88' },
      { col: 0, row: 1, icon: '\u{1F3B0}', label: 'CASINO RECORD',  value: stats.casinoWins + '-' + stats.casinoLosses,                           color: stats.casinoWins >= stats.casinoLosses ? '#22ff88' : '#ff4444' },
      { col: 0, row: 2, icon: '\u{1F494}', label: 'GIRLS FUMBLED',  value: '' + stats.girlsFumbled,                                               color: stats.girlsFumbled > 3 ? '#ff4444' : '#ffffff' },
      { col: 0, row: 3, icon: '\u{23F1}\u{FE0F}', label: 'PLAY TIME', value: this.formatPlayTime(stats.totalPlayTimeMs),                          color: '#cccccc' },
      // Right column
      { col: 1, row: 0, icon: '\u{1F4C8}', label: 'CRYPTO PEAK',    value: stats.cryptoPeakPortfolio > 0 ? '$' + stats.cryptoPeakPortfolio.toLocaleString() : '--', color: '#00ccff' },
      { col: 1, row: 1, icon: '\u{1F37A}', label: 'DRINKS HAD',     value: '' + stats.drinksHad,                                                  color: '#ffaa00' },
      { col: 1, row: 2, icon: '\u{1F3C5}', label: 'ACHIEVEMENTS',   value: achievementCount + '/20',                                              color: '#f0c040' },
      { col: 1, row: 3, icon: '\u{1F4E6}', label: 'ITEMS FOUND',    value: '' + stats.itemsCollected,                                             color: '#ffcc44' },
    ];

    cardStats.forEach((s, idx) => {
      const x = s.col === 0 ? col1X : col2X;
      const y = statsStartY + s.row * rowH;
      const delay = 800 + idx * 80;

      const iconT = this.add.text(x, y, s.icon, { fontSize: '16px' })
        .setOrigin(0, 0.5).setDepth(d + 2).setAlpha(0);
      this.shareCardElements.push(iconT);

      const labelT = this.add.text(x + 26, y - 9, s.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#555577',
      }).setOrigin(0, 0.5).setDepth(d + 2).setAlpha(0);
      this.shareCardElements.push(labelT);

      const valueT = this.add.text(x + 26, y + 9, s.value, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: s.color,
      }).setOrigin(0, 0.5).setDepth(d + 2).setAlpha(0).setScale(0.85);
      this.shareCardElements.push(valueT);

      this.tweens.add({ targets: iconT, alpha: 1, duration: 300, delay });
      this.tweens.add({ targets: labelT, alpha: 1, duration: 300, delay: delay + 30 });
      this.tweens.add({ targets: valueT, alpha: 1, scale: 1, duration: 350, ease: 'Back.easeOut', delay: delay + 60 });
    });

    // ── Bottom accent line ──
    const bottomAccent = this.add.rectangle(cardX, topY + cardH - 50, cardW - 60, 2, 0xd4a017)
      .setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(bottomAccent);
    this.tweens.add({ targets: bottomAccent, alpha: 0.5, duration: 400, delay: 1500 });

    // ── Footer branding ──
    const footer = this.add.text(cardX, topY + cardH - 32, 'jdlo.site', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#d4a017',
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(d + 2).setAlpha(0);
    this.shareCardElements.push(footer);
    this.tweens.add({ targets: footer, alpha: 0.8, duration: 400, delay: 1550 });

    // ── Buttons row ──
    const btnRowY = topY + cardH + 30;

    // SAVE button
    const saveBtn = this.add.text(cardX - 100, btnRowY, '[ SAVE IMAGE ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#22ff88',
    }).setOrigin(0.5).setDepth(d + 3).setAlpha(0).setInteractive({ useHandCursor: true });
    this.shareCardElements.push(saveBtn);

    saveBtn.on('pointerover', () => saveBtn.setColor('#66ffaa'));
    saveBtn.on('pointerout', () => saveBtn.setColor('#22ff88'));
    saveBtn.on('pointerdown', () => {
      saveBtn.setText('SAVING...');
      saveBtn.setColor('#f0c040');
      this.downloadShareCard(() => {
        saveBtn.setText('SAVED!');
        SoundEffects.slotWin();
        this.time.delayedCall(2000, () => {
          saveBtn.setText('[ SAVE IMAGE ]');
          saveBtn.setColor('#22ff88');
        });
      });
    });

    this.tweens.add({ targets: saveBtn, alpha: 1, duration: 400, delay: 1700 });

    // CLOSE button
    const closeBtn = this.add.text(cardX + 100, btnRowY, '[ CLOSE ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#555577',
    }).setOrigin(0.5).setDepth(d + 3).setAlpha(0).setInteractive({ useHandCursor: true });
    this.shareCardElements.push(closeBtn);

    closeBtn.on('pointerover', () => closeBtn.setColor('#8888aa'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#555577'));
    closeBtn.on('pointerdown', () => this.dismissShareCard());

    this.tweens.add({ targets: closeBtn, alpha: 1, duration: 400, delay: 1750 });

    // ESC to close
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const escHandler = () => {
      this.dismissShareCard();
      escKey.off('down', escHandler);
    };
    escKey.on('down', escHandler);
  }

  private dismissShareCard() {
    if (this.shareCardElements.length === 0) return;
    this.tweens.add({
      targets: this.shareCardElements.filter(e => e && e.active),
      alpha: 0,
      duration: 250,
      onComplete: () => {
        this.shareCardElements.forEach(e => { try { e.destroy(); } catch { /* */ } });
        this.shareCardElements = [];
      },
    });
  }

  private downloadShareCard(onDone: () => void) {
    // Hide everything except the card itself (backdrop + card elements)
    // by hiding stats elements and buttons that sit outside the card.
    // Then snapshot the canvas, crop to the card region, and trigger download.
    const canvas = this.game.canvas;
    const cardW = 580;
    const cardH = 760;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Small delay so any button state has settled
    this.time.delayedCall(80, () => {
      try {
        // Capture the full game canvas
        const fullDataUrl = canvas.toDataURL('image/png');

        // Draw into an offscreen canvas cropped to the card
        const offscreen = document.createElement('canvas');
        const cropX = Math.floor(cx - cardW / 2);
        const cropY = Math.floor(cy - cardH / 2);
        offscreen.width = cardW;
        offscreen.height = cardH;
        const ctx2d = offscreen.getContext('2d')!;
        const img = new Image();
        img.onload = () => {
          ctx2d.drawImage(img, cropX, cropY, cardW, cardH, 0, 0, cardW, cardH);
          const croppedUrl = offscreen.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = croppedUrl;
          a.download = 'jdlo-game-card.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          onDone();
        };
        img.src = fullDataUrl;
      } catch {
        // Fallback — just open the full canvas in a new tab
        const url = canvas.toDataURL('image/png');
        window.open(url, '_blank');
        onDone();
      }
    });
  }

  private getTagline(gradeLetter: string): string {
    const taglines: Record<string, string> = {
      S: 'ABSOLUTELY BUILT DIFFERENT',
      A: 'BUILT DIFFERENT',
      B: 'SOLID. KEEP PUSHING.',
      C: 'ROOM TO GROW, NO CAP',
      D: 'DOWN BAD. GO AGAIN.',
    };
    return taglines[gradeLetter] ?? 'DOWN BAD. GO AGAIN.';
  }

  // ── Record Formatter ──

  private formatRecord(wins: number, losses: number, profit: number): string {
    const sign = profit >= 0 ? '+' : '';
    return wins + '-' + losses + ' (' + sign + '$' + profit.toLocaleString() + ')';
  }

  // ── Play Time Formatter ──

  private formatPlayTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return hours + 'h ' + minutes + 'm';
    return minutes + 'm';
  }

  // ═══════════════════════════════════════════════════════════════════
  //  TRANSITION FROM STATS → NARRATIVE END
  // ═══════════════════════════════════════════════════════════════════

  private transitionToNarrative() {
    // Fade out stats
    this.tweens.add({
      targets: this.statsElements.filter(e => e && e.active),
      alpha: 0,
      duration: 800,
      onComplete: () => {
        this.statsElements.forEach(e => { try { e.destroy(); } catch { /* */ } });
        this.statsElements = [];
        this.showNarrativeEnd();
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NARRATIVE END (Original EndScene content)
  // ═══════════════════════════════════════════════════════════════════

  private showNarrativeEnd() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // Player sprite — operator outfit
    const player = this.add.sprite(GAME_WIDTH / 2, 100, 'player-ch6', 0)
      .setScale(8).setAlpha(0);

    this.tweens.add({
      targets: player,
      alpha: 1,
      duration: 1000,
    });

    // Name
    const title = this.add.text(GAME_WIDTH / 2, 200, 'JDLO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      delay: 500,
    });

    // The message — this isn't the end
    const mainMessage = this.add.text(GAME_WIDTH / 2, 270, 'The story isn\'t over.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: mainMessage,
      alpha: 1,
      duration: 1000,
      delay: 1200,
    });

    const sub = this.add.text(GAME_WIDTH / 2, 305, 'It\'s still being written. Every single day.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#8888aa',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: sub,
      alpha: 1,
      duration: 800,
      delay: 1800,
    });

    // Stats — compounding
    const stats = [
      'Self-taught in 5 months',
      '6+ clients and counting',
      'COO at 22',
      'Nothing stops. Always compounding.',
    ];

    let yPos = 370;
    stats.forEach((stat, i) => {
      const t = this.add.text(GAME_WIDTH / 2, yPos, stat, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: i === stats.length - 1 ? '#f0c040' : '#7777aa',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: t,
        alpha: 1,
        duration: 800,
        delay: 2400 + (i * 500),
      });

      yPos += 35;
    });

    // Callback to the beginning — reflective moment
    const callbackDelay = 2400 + stats.length * 500 + 600;

    const callbackLine1 = this.add.text(GAME_WIDTH / 2, 510, 'The kid who stared at the ceiling in his bedroom...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaacc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: callbackLine1,
      alpha: 1,
      duration: 1200,
      delay: callbackDelay,
    });

    const callbackLine2 = this.add.text(GAME_WIDTH / 2, 540, '...now runs operations from an LA highrise.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaacc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: callbackLine2,
      alpha: 1,
      duration: 1200,
      delay: callbackDelay + 1500,
    });

    // Three clear CTAs
    const ctaY = 590;
    const ctaDelay = callbackDelay + 3000;

    const keepUp = this.add.text(GAME_WIDTH / 2, ctaY, 'Keep up with the story', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    keepUp.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    keepUp.on('pointerover', () => keepUp.setColor('#ffdd66'));
    keepUp.on('pointerout', () => keepUp.setColor('#f0c040'));

    this.tweens.add({ targets: keepUp, alpha: 1, duration: 800, delay: ctaDelay });

    const igHandle = this.add.text(GAME_WIDTH / 2, ctaY + 28, '@jdlo', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    igHandle.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    igHandle.on('pointerover', () => igHandle.setColor('#88aaee'));
    igHandle.on('pointerout', () => igHandle.setColor('#6688cc'));

    this.tweens.add({ targets: igHandle, alpha: 1, duration: 800, delay: ctaDelay + 200 });

    // Divider
    const divider = this.add.text(GAME_WIDTH / 2, ctaY + 65, '\u2014\u2014\u2014\u2014\u2014', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#333355',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: divider, alpha: 1, duration: 800, delay: ctaDelay + 400 });

    // Learn from me
    const learn = this.add.text(GAME_WIDTH / 2, ctaY + 100, 'Learn what I know', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    learn.on('pointerdown', () => window.open('https://jdlo.site', '_blank'));
    learn.on('pointerover', () => learn.setColor('#ffdd66'));
    learn.on('pointerout', () => learn.setColor('#f0c040'));

    this.tweens.add({ targets: learn, alpha: 1, duration: 800, delay: ctaDelay + 600 });

    const site = this.add.text(GAME_WIDTH / 2, ctaY + 128, 'jdlo.site', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    site.on('pointerdown', () => window.open('https://jdlo.site', '_blank'));
    site.on('pointerover', () => site.setColor('#88aaee'));
    site.on('pointerout', () => site.setColor('#6688cc'));

    this.tweens.add({ targets: site, alpha: 1, duration: 800, delay: ctaDelay + 800 });

    // Work with me
    const work = this.add.text(GAME_WIDTH / 2, ctaY + 175, 'Work with me', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    work.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    work.on('pointerover', () => work.setColor('#ffdd66'));
    work.on('pointerout', () => work.setColor('#f0c040'));

    this.tweens.add({ targets: work, alpha: 1, duration: 800, delay: ctaDelay + 1000 });

    const dm = this.add.text(GAME_WIDTH / 2, ctaY + 203, 'DM me. Let\'s build.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    dm.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    dm.on('pointerover', () => dm.setColor('#88aaee'));
    dm.on('pointerout', () => dm.setColor('#6688cc'));

    this.tweens.add({ targets: dm, alpha: 1, duration: 800, delay: ctaDelay + 1200 });

    // Share button
    const shareBtn = this.add.text(GAME_WIDTH / 2, ctaY + 250, '[ SHARE YOUR JOURNEY ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    shareBtn.on('pointerdown', () => {
      this.shareGame();
    });
    shareBtn.on('pointerover', () => shareBtn.setColor('#ffdd66'));
    shareBtn.on('pointerout', () => shareBtn.setColor('#f0c040'));

    this.tweens.add({ targets: shareBtn, alpha: 1, duration: 800, delay: ctaDelay + 1500 });

    // Play again
    const restart = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'SPACE to play again', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#333355',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: restart,
      alpha: 1,
      duration: 1000,
      delay: 6000,
    });

    this.tweens.add({
      targets: restart,
      alpha: 0.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      delay: 7000,
    });

    // Track if player has interacted (space/tap to replay)
    let playerInteracted = false;

    this.input.keyboard!.on('keydown-SPACE', () => {
      if (playerInteracted) return;
      playerInteracted = true;
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    });

    this.input.on('pointerdown', () => {
      // Mobile tap to replay (only if tapping empty area, not a link)
    });

    // ── POST-CREDITS SEQUENCE ──────────────────────────────────────────
    // If the player hasn't pressed space after 8 seconds, trigger cliffhanger
    this.time.delayedCall(8000, () => {
      if (playerInteracted) return;
      this.startPostCredits();
    });
  }

  private startPostCredits() {
    // Fade everything to black
    const blackOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: blackOverlay,
      alpha: 1,
      duration: 2000,
      onComplete: () => {
        this.postCreditsSequence();
      },
    });
  }

  private postCreditsSequence() {
    const baseDepth = 300;
    const d = baseDepth;

    // Road scene dimensions
    const roadY = GAME_HEIGHT / 2 + 180;  // road sits lower
    const roadH = 60;

    // ── STEP 1: Fade to black, then build the night scene ──
    // Background is already black from the overlay. Draw the night road.

    // Dark sky (very dark blue-black)
    const sky = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, GAME_WIDTH, GAME_HEIGHT - 200, 0x060810)
      .setDepth(d).setAlpha(0);

    // Road surface
    const road = this.add.rectangle(GAME_WIDTH / 2, roadY, GAME_WIDTH, roadH, 0x282830)
      .setDepth(d).setAlpha(0);
    const roadLine = this.add.rectangle(GAME_WIDTH / 2, roadY, GAME_WIDTH, 2, 0x404050)
      .setDepth(d + 1).setAlpha(0);

    // Road dashes (center line)
    const dashes: Phaser.GameObjects.Rectangle[] = [];
    for (let dx = 100; dx < GAME_WIDTH; dx += 80) {
      const dash = this.add.rectangle(dx, roadY, 30, 2, 0x606068)
        .setDepth(d + 1).setAlpha(0);
      dashes.push(dash);
    }

    // Streetlights
    const lights: Phaser.GameObjects.GameObject[] = [];
    for (let lx = 200; lx < GAME_WIDTH; lx += 300) {
      const pole = this.add.rectangle(lx, roadY - roadH / 2 - 60, 3, 120, 0x404050)
        .setDepth(d).setAlpha(0);
      const bulb = this.add.circle(lx, roadY - roadH / 2 - 120, 4, 0xf0d060)
        .setDepth(d + 1).setAlpha(0);
      const glow = this.add.circle(lx, roadY - roadH / 2 - 100, 40, 0xf0d060, 0.05)
        .setDepth(d).setAlpha(0);
      lights.push(pole, bulb, glow);
    }

    // Fade in the night scene
    this.tweens.add({ targets: [sky, road, roadLine], alpha: 1, duration: 1500 });
    dashes.forEach(dash => this.tweens.add({ targets: dash, alpha: 1, duration: 1500 }));
    lights.forEach(l => this.tweens.add({ targets: l, alpha: 1, duration: 1500 }));

    // ── STEP 2: Place the Lambo + Zay leaning ──
    this.time.delayedCall(2000, () => {
      // Lambo SVJ — parked on the road, right of center
      const lamboX = GAME_WIDTH / 2 + 100;
      const lamboY = roadY - 20;
      const lambo = this.add.sprite(lamboX, lamboY, 'car-lambo-svj')
        .setScale(4).setDepth(d + 2).setAlpha(0);

      // Zay — leaning against the car (just to the left of it)
      const zayX = lamboX - 110;
      const zayY = roadY - 50;
      const zay = this.add.sprite(zayX, zayY, 'npc_zay', 0)
        .setScale(5).setDepth(d + 3).setAlpha(0);

      this.tweens.add({ targets: [lambo, zay], alpha: 1, duration: 1000 });

      // ── STEP 3: JP walks in from the left ──
      this.time.delayedCall(2000, () => {
        const jpStartX = -80;
        const jpY = roadY - 50;
        const jp = this.add.sprite(jpStartX, jpY, 'player-ch6', 6) // right-facing frame
          .setScale(5).setDepth(d + 3);

        // Walk JP in
        this.tweens.add({
          targets: jp,
          x: zayX - 100,
          duration: 2500,
          ease: 'Linear',
          onComplete: () => {
            // JP stops, faces Zay (right-facing idle)
            jp.setFrame(6);

            // ── STEP 4: Dialogue ──
            const dialogueLines = [
              { speaker: 'Zay', text: 'JP. My boy.' },
              { speaker: 'JP', text: 'Zay. What\'s good.' },
              { speaker: 'Zay', text: 'I heard what you been building. I\'m proud of you bro. For real.' },
              { speaker: 'JP', text: 'Appreciate that. Means a lot coming from you.' },
              { speaker: 'Zay', text: 'So where we going next?' },
              { speaker: 'JP', text: 'Everywhere.' },
            ];

            let lineIdx = 0;
            const dialogueBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 120, GAME_WIDTH - 80, 100, 0x1a1a2e, 0.95)
              .setDepth(d + 10).setStrokeStyle(2, 0x3a3a5e);
            const speakerText = this.add.text(80, GAME_HEIGHT - 160, '', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '12px',
              color: '#f0c040',
            }).setDepth(d + 11);
            const lineText = this.add.text(80, GAME_HEIGHT - 135, '', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '14px',
              color: '#ffffff',
              wordWrap: { width: GAME_WIDTH - 160 },
              lineSpacing: 8,
            }).setDepth(d + 11);

            const showLine = () => {
              if (lineIdx >= dialogueLines.length) {
                dialogueBg.destroy();
                speakerText.destroy();
                lineText.destroy();
                // ── STEP 5: Both walk to the Lambo ──
                walkToLambo(jp, zay, lambo);
                return;
              }
              speakerText.setText(dialogueLines[lineIdx].speaker);
              lineText.setText(dialogueLines[lineIdx].text);
              lineIdx++;
            };

            showLine();

            const advanceDialogue = () => {
              showLine();
            };

            const spaceKeyPost = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            spaceKeyPost.on('down', advanceDialogue);
            this.input.on('pointerdown', advanceDialogue);

            const walkToLambo = (jpSpr: Phaser.GameObjects.Sprite, zaySpr: Phaser.GameObjects.Sprite, lamboSpr: Phaser.GameObjects.Sprite) => {
              spaceKeyPost.off('down', advanceDialogue);
              this.input.off('pointerdown', advanceDialogue);

              // Both walk toward the Lambo
              this.tweens.add({
                targets: jpSpr,
                x: lamboX - 60,
                duration: 1500,
                ease: 'Linear',
              });
              this.tweens.add({
                targets: zaySpr,
                x: lamboX - 30,
                duration: 1200,
                ease: 'Linear',
                onComplete: () => {
                  // ── STEP 6: They "get in" — sprites fade into the car ──
                  this.tweens.add({
                    targets: [jpSpr, zaySpr],
                    alpha: 0,
                    duration: 600,
                    onComplete: () => {
                      jpSpr.destroy();
                      zaySpr.destroy();

                      // ── STEP 7: Lambo drives off screen ──
                      this.time.delayedCall(500, () => {
                        this.tweens.add({
                          targets: lamboSpr,
                          x: GAME_WIDTH + 300,
                          scaleX: 2,
                          scaleY: 2,
                          duration: 2500,
                          ease: 'Quad.easeIn',
                          onComplete: () => {
                            lamboSpr.destroy();

                            // ── STEP 8: Road gets quiet ──
                            this.time.delayedCall(1500, () => {
                              // "To be continued..." fades in
                              const tbc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'To be continued...', {
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '20px',
                                color: '#f0c040',
                              }).setOrigin(0.5).setDepth(d + 10).setAlpha(0);

                              this.tweens.add({
                                targets: tbc,
                                alpha: 1,
                                duration: 1500,
                              });

                              // Pulse
                              this.tweens.add({
                                targets: tbc,
                                alpha: 0.5,
                                duration: 1500,
                                yoyo: true,
                                repeat: -1,
                                delay: 2500,
                              });

                              // "Follow the story -> @jdlo"
                              const follow = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Follow the story  @jdlo', {
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '12px',
                                color: '#6688cc',
                              }).setOrigin(0.5).setDepth(d + 10).setAlpha(0)
                                .setInteractive({ useHandCursor: true });

                              follow.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
                              follow.on('pointerover', () => follow.setColor('#88aaee'));
                              follow.on('pointerout', () => follow.setColor('#6688cc'));

                              this.tweens.add({ targets: follow, alpha: 1, duration: 800, delay: 2000 });

                              // Replay hint
                              const replayHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'SPACE to play again', {
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '9px',
                                color: '#333355',
                              }).setOrigin(0.5).setDepth(d + 10).setAlpha(0);

                              this.tweens.add({ targets: replayHint, alpha: 1, duration: 800, delay: 3000 });
                              this.tweens.add({
                                targets: replayHint,
                                alpha: 0.2,
                                duration: 1200,
                                yoyo: true,
                                repeat: -1,
                                delay: 4000,
                              });

                              // Re-enable replay
                              this.input.keyboard!.on('keydown-SPACE', () => {
                                this.cameras.main.fadeOut(1000, 0, 0, 0);
                                this.cameras.main.once('camerafadeoutcomplete', () => {
                                  this.scene.start('IntroScene');
                                });
                              });
                            });
                          },
                        });
                      });
                    },
                  });
                },
              });
            };
          },
        });
      });
    });
  }

  private shareGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 1080, 1080);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JDLO', 540, 200);

    // Subtitle
    ctx.fillStyle = '#f0c040';
    ctx.font = '28px monospace';
    ctx.fillText('A True Story', 540, 260);

    // Stats
    ctx.fillStyle = '#aaaacc';
    ctx.font = '22px monospace';
    ctx.fillText("I played through JP's story", 540, 400);
    ctx.fillText('From Santa Barbara to the boardroom', 540, 440);

    // CTA
    ctx.fillStyle = '#f0c040';
    ctx.font = '26px monospace';
    ctx.fillText('Play it yourself:', 540, 600);
    ctx.fillStyle = '#6688cc';
    ctx.font = '24px monospace';
    ctx.fillText('jdlo-game.vercel.app', 540, 650);

    // @jdlo
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText('@jdlo', 540, 750);

    // Try to share or download
    canvas.toBlob((blob) => {
      if (blob && navigator.share) {
        const file = new File([blob], 'jdlo-game.png', { type: 'image/png' });
        navigator.share({
          title: 'JDLO | The Game',
          text: "I just played through JP's story. From Santa Barbara to the boardroom.",
          files: [file],
        }).catch(() => {
          this.downloadShare(blob);
        });
      } else if (blob) {
        this.downloadShare(blob);
      }
    }, 'image/png');
  }

  private downloadShare(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jdlo-game.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}
