import { TILE_SIZE, COLORS, GAME_WIDTH, CHAR_SIZE } from '../config';

// Convert hex number to CSS color string
function hexToCSS(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

// Helper: draw a single pixel — works with DrawContext or raw CanvasRenderingContext2D
function px(
  g: DrawContext | CanvasRenderingContext2D,
  x: number,
  y: number,
  color: number,
  w = 1,
  h = 1
) {
  if (g instanceof DrawContext) {
    g.ctx.fillStyle = hexToCSS(color);
    g.ctx.fillRect(x, y, w, h);
  } else {
    g.fillStyle = hexToCSS(color);
    g.fillRect(x, y, w, h);
  }
}

// DrawContext wraps CanvasRenderingContext2D to mimic Phaser Graphics API
// so existing draw callbacks work unchanged
class DrawContext {
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) { this.ctx = ctx; }
  fillStyle(color: number, _alpha = 1) {
    this.ctx.fillStyle = hexToCSS(color);
  }
  fillRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillRect(x, y, w, h);
  }
}

// Helper: create texture from raw HTML canvas — guarantees transparency
function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (ctx: DrawContext) => void
) {
  // Skip if texture already exists — prevents green/black placeholder squares
  // when scenes restart and try to re-register the same canvas key
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const rawCtx = canvas.getContext('2d')!;
  rawCtx.clearRect(0, 0, width, height);
  const dc = new DrawContext(rawCtx);
  draw(dc);
  scene.textures.addCanvas(key, canvas);
}

// LEGACY: Phaser Graphics px helper — only used where we still need Graphics API
function pxG(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number,
  w = 1,
  h = 1
) {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

// ─── PLAYER SPRITE SHEET ────────────────────────────────────────────
// 8 frames: down-idle, down-step, up-idle, up-step, left-idle, left-step, right-idle, right-step
// Each frame is 16x16, sheet is 128x16

type OutfitColors = {
  shirt: number;
  shirtLight: number;
  pants: number;
  pantsLight: number;
  shoe: number;
};

function drawPlayerFrame(
  g: DrawContext | CanvasRenderingContext2D,
  offsetX: number,
  direction: 'down' | 'up' | 'left' | 'right',
  stepping: boolean,
  outfit?: OutfitColors
) {
  const ox = offsetX;
  const skin = COLORS.skinTone;
  const skinS = COLORS.skinShadow;
  const hair = COLORS.hairDark;
  const shirt = outfit?.shirt ?? COLORS.shirtBlue;
  const shirtLight = outfit?.shirtLight ?? 0x5070d0;
  const pants = outfit?.pants ?? COLORS.pantsGrey;
  const pantsLight = outfit?.pantsLight ?? 0x606878;
  const shoe = outfit?.shoe ?? COLORS.shoeDark;
  const eyeWhite = 0xffffff;
  const eyeBlack = 0x3a2010; // Brown eyes

  // -- Hair (rows 1-4) --
  // Row 0-1: top of hair
  px(g, ox + 5, 0, hair, 6, 1);
  px(g, ox + 4, 1, hair, 8, 1);
  // Row 2-3: hair sides + forehead
  px(g, ox + 3, 2, hair, 10, 1);
  px(g, ox + 3, 3, hair, 2, 1);
  px(g, ox + 11, 3, hair, 2, 1);

  // -- Face (rows 3-6) --
  px(g, ox + 5, 3, skin, 6, 1);
  px(g, ox + 4, 4, skin, 8, 1);
  px(g, ox + 4, 5, skin, 8, 1);
  px(g, ox + 5, 6, skinS, 6, 1); // chin shadow

  if (direction === 'down') {
    // Eyes
    px(g, ox + 5, 4, eyeWhite, 2, 1);
    px(g, ox + 9, 4, eyeWhite, 2, 1);
    px(g, ox + 6, 4, eyeBlack);
    px(g, ox + 10, 4, eyeBlack);
    // Mouth
    px(g, ox + 7, 5, 0xc07060, 2, 1);
  } else if (direction === 'up') {
    // Back of head — just hair
    px(g, ox + 4, 3, hair, 8, 1);
    px(g, ox + 4, 4, hair, 8, 1);
    px(g, ox + 4, 5, hair, 8, 1);
    px(g, ox + 5, 6, hair, 6, 1);
  } else if (direction === 'left') {
    // Hair covers right side
    px(g, ox + 8, 3, hair, 5, 1);
    px(g, ox + 9, 4, hair, 3, 1);
    // Eye on left
    px(g, ox + 5, 4, eyeWhite, 2, 1);
    px(g, ox + 5, 4, eyeBlack);
    // Mouth
    px(g, ox + 5, 5, 0xc07060, 2, 1);
  } else {
    // right — mirror of left
    px(g, ox + 3, 3, hair, 5, 1);
    px(g, ox + 4, 4, hair, 3, 1);
    // Eye on right
    px(g, ox + 9, 4, eyeWhite, 2, 1);
    px(g, ox + 10, 4, eyeBlack);
    // Mouth
    px(g, ox + 9, 5, 0xc07060, 2, 1);
  }

  // -- Shirt (rows 7-10) --
  px(g, ox + 4, 7, shirt, 8, 1);
  px(g, ox + 3, 8, shirt, 10, 1);
  px(g, ox + 3, 9, shirtLight, 10, 1);
  px(g, ox + 4, 10, shirt, 8, 1);

  // Shirt collar / neck
  px(g, ox + 6, 7, skinS, 4, 1);

  // Arms (shirt colored, sticking out sides)
  if (direction === 'left' || direction === 'right') {
    px(g, ox + 2, 8, skin, 1, 2);
    px(g, ox + 13, 8, skin, 1, 2);
  } else {
    px(g, ox + 2, 8, shirt, 1, 2);
    px(g, ox + 13, 8, shirt, 1, 2);
    px(g, ox + 2, 10, skin);
    px(g, ox + 13, 10, skin);
  }

  // -- Pants (rows 11-13) --
  px(g, ox + 4, 11, pants, 8, 1);
  px(g, ox + 4, 12, pantsLight, 3, 1);
  px(g, ox + 9, 12, pantsLight, 3, 1);

  // Leg gap
  px(g, ox + 7, 12, 0x000000, 2, 1);

  // -- Shoes (rows 13-14) --
  if (stepping) {
    // One foot forward
    if (direction === 'down' || direction === 'up') {
      px(g, ox + 3, 13, shoe, 4, 1);
      px(g, ox + 9, 13, shoe, 4, 1);
      px(g, ox + 3, 14, shoe, 3, 1);
      px(g, ox + 10, 14, shoe, 3, 1);
    } else if (direction === 'left') {
      px(g, ox + 3, 13, shoe, 4, 1);
      px(g, ox + 9, 13, shoe, 3, 1);
      px(g, ox + 2, 14, shoe, 4, 1);
    } else {
      px(g, ox + 5, 13, shoe, 4, 1);
      px(g, ox + 9, 13, shoe, 3, 1);
      px(g, ox + 10, 14, shoe, 4, 1);
    }
  } else {
    px(g, ox + 4, 13, shoe, 3, 1);
    px(g, ox + 9, 13, shoe, 3, 1);
    px(g, ox + 4, 14, shoe, 3, 1);
    px(g, ox + 9, 14, shoe, 3, 1);
  }
}

// ─── 32x32 PLAYER SPRITE (HIGH DETAIL) ─────────────────────────────
// 4x more pixels than 16x16 — visible hair strands, eyes with whites/pupils,
// collar/sleeve detail, actual shoe shapes, real walking animation

function drawPlayerFrame32(
  g: DrawContext | CanvasRenderingContext2D,
  offsetX: number,
  direction: 'down' | 'up' | 'left' | 'right',
  stepping: boolean,
  outfit?: OutfitColors
) {
  const ox = offsetX;
  const skin = COLORS.skinTone;
  const skinS = COLORS.skinShadow;
  const skinH = 0xf8d0a0;
  const hair = COLORS.hairDark;
  const hairH = 0x483030;
  const shirt = outfit?.shirt ?? COLORS.shirtBlue;
  const shirtLight = outfit?.shirtLight ?? 0x5070d0;
  const pants = outfit?.pants ?? COLORS.pantsGrey;
  const pantsLight = outfit?.pantsLight ?? 0x606878;
  const shoe = outfit?.shoe ?? COLORS.shoeDark;
  const shoeH = 0x484848;
  const eyeWhite = 0xffffff;
  const eyeBlack = 0x3a2010; // Brown eyes
  const eyebrow = 0x281818;
  const mouth = 0xc07060;
  const noseShadow = 0xd8a878;
  const belt = 0x403830;
  const beltBuckle = 0x908070;

  // ── HAIR (rows 0-7) — longer shaggy style, more volume ──
  px(g, ox + 9, 0, hair, 14, 1);
  px(g, ox + 7, 1, hair, 18, 1);
  px(g, ox + 5, 2, hair, 22, 1);  // wider coverage
  px(g, ox + 5, 3, hair, 22, 1);
  px(g, ox + 5, 4, hair, 22, 1);
  px(g, ox + 5, 5, hair, 22, 1);
  px(g, ox + 6, 6, hair, 3, 1);   // shaggy sides hang lower
  px(g, ox + 23, 6, hair, 3, 1);
  px(g, ox + 5, 7, hair, 2, 1);   // longer on sides
  px(g, ox + 25, 7, hair, 2, 1);
  // Messy bangs over forehead
  px(g, ox + 8, 5, hair, 6, 1);
  px(g, ox + 10, 6, hair, 4, 1);  // bangs hanging down
  // Hair highlights — subtle shine
  px(g, ox + 11, 1, hairH, 4, 1);
  px(g, ox + 9, 2, hairH, 3, 1);
  px(g, ox + 14, 3, hairH, 4, 1);
  px(g, ox + 18, 2, hairH, 3, 1);
  px(g, ox + 12, 4, hairH, 3, 1);
  px(g, ox + 7, 5, hairH, 2, 1);

  // ── FACE (rows 5-12) ──
  px(g, ox + 6, 6, hair, 3, 3);  // side hair left
  px(g, ox + 23, 6, hair, 3, 3); // side hair right
  px(g, ox + 9, 5, skin, 14, 1);
  px(g, ox + 8, 6, skin, 16, 1);
  px(g, ox + 8, 7, skin, 16, 1);
  px(g, ox + 8, 8, skin, 16, 1);
  px(g, ox + 8, 9, skin, 16, 1);
  px(g, ox + 9, 10, skin, 14, 1);
  px(g, ox + 10, 11, skinS, 12, 1);
  px(g, ox + 11, 12, skinS, 10, 1);

  if (direction === 'down') {
    px(g, ox + 10, 5, eyebrow, 4, 1);  // Eyebrows raised 1px — relaxed, not angry
    px(g, ox + 18, 5, eyebrow, 4, 1);
    px(g, ox + 10, 7, eyeWhite, 4, 2);
    px(g, ox + 18, 7, eyeWhite, 4, 2);
    px(g, ox + 12, 7, eyeBlack, 2, 2);
    px(g, ox + 20, 7, eyeBlack, 2, 2);
    px(g, ox + 15, 9, noseShadow, 2, 1);
    px(g, ox + 13, 10, mouth, 6, 1); // Smile
    px(g, ox + 12, 10, mouth, 1, 1); // Smile wider left
    px(g, ox + 19, 10, mouth, 1, 1); // Smile wider right
    px(g, ox + 7, 7, skin, 1, 2);
    px(g, ox + 24, 7, skin, 1, 2);
    px(g, ox + 7, 8, skinS, 1, 1);
    px(g, ox + 24, 8, skinS, 1, 1);
  } else if (direction === 'up') {
    // Back of head — full hair coverage, no gaps
    px(g, ox + 8, 5, hair, 16, 1);
    px(g, ox + 8, 6, hair, 16, 1);
    px(g, ox + 8, 7, hair, 16, 1);
    px(g, ox + 8, 8, hair, 16, 1);
    px(g, ox + 8, 9, hair, 16, 1);
    px(g, ox + 9, 10, hair, 14, 1);
    px(g, ox + 10, 11, hair, 12, 1);
    px(g, ox + 10, 7, hairH, 2, 1);
    px(g, ox + 16, 8, hairH, 3, 1);
    px(g, ox + 12, 9, hairH, 2, 1);
    px(g, ox + 14, 6, hairH, 4, 1);
    px(g, ox + 7, 7, skin, 1, 2);
    px(g, ox + 24, 7, skin, 1, 2);
  } else if (direction === 'left') {
    // Back of head — hair covers right side
    px(g, ox + 16, 5, hair, 10, 1);
    px(g, ox + 17, 6, hair, 9, 1);
    px(g, ox + 18, 7, hair, 8, 1);
    px(g, ox + 19, 8, hair, 7, 1);
    px(g, ox + 20, 9, hair, 5, 1);
    px(g, ox + 21, 10, hair, 3, 1);
    // Hair highlight on back
    px(g, ox + 19, 6, hairH, 3, 1);
    px(g, ox + 20, 7, hairH, 2, 1);
    // Reshape face — narrower for profile
    px(g, ox + 7, 8, skin, 1, 2);  // nose bridge
    px(g, ox + 6, 9, skin, 1, 2);  // nose tip protrudes
    // Eyebrow
    px(g, ox + 10, 6, eyebrow, 5, 1);
    // Eye — single eye visible
    px(g, ox + 10, 7, eyeWhite, 4, 2);
    px(g, ox + 10, 7, eyeBlack, 2, 2);
    // Nose
    px(g, ox + 7, 9, noseShadow, 2, 1);
    // Mouth — small, shifted left
    px(g, ox + 9, 10, mouth, 4, 1);
    // Jaw definition
    px(g, ox + 8, 11, skinS, 6, 1);
    // Ear on right
    px(g, ox + 23, 7, skinS, 2, 2);
    px(g, ox + 24, 8, skin, 1, 1);
  } else {
    // Back of head — hair covers left side
    px(g, ox + 6, 5, hair, 10, 1);
    px(g, ox + 6, 6, hair, 9, 1);
    px(g, ox + 6, 7, hair, 8, 1);
    px(g, ox + 6, 8, hair, 7, 1);
    px(g, ox + 7, 9, hair, 5, 1);
    px(g, ox + 8, 10, hair, 3, 1);
    // Hair highlight on back
    px(g, ox + 10, 6, hairH, 3, 1);
    px(g, ox + 10, 7, hairH, 2, 1);
    // Reshape face — narrower for profile
    px(g, ox + 24, 8, skin, 1, 2);  // nose bridge
    px(g, ox + 25, 9, skin, 1, 2);  // nose tip protrudes
    // Eyebrow
    px(g, ox + 17, 6, eyebrow, 5, 1);
    // Eye — single eye visible
    px(g, ox + 18, 7, eyeWhite, 4, 2);
    px(g, ox + 20, 7, eyeBlack, 2, 2);
    // Nose
    px(g, ox + 23, 9, noseShadow, 2, 1);
    // Mouth — small, shifted right
    px(g, ox + 19, 10, mouth, 4, 1);
    // Jaw definition
    px(g, ox + 18, 11, skinS, 6, 1);
    // Ear on left
    px(g, ox + 7, 7, skinS, 2, 2);
    px(g, ox + 8, 8, skin, 1, 1);
  }

  // ── NECK (row 12-13) ──
  px(g, ox + 13, 12, skinS, 6, 1);
  px(g, ox + 13, 13, skinS, 6, 1);

  // ── SHIRT (rows 13-21) ──
  px(g, ox + 11, 13, 0xf0f0f0, 2, 1);
  px(g, ox + 19, 13, 0xf0f0f0, 2, 1);
  px(g, ox + 8, 14, shirt, 16, 1);
  px(g, ox + 7, 15, shirt, 18, 1);
  px(g, ox + 6, 16, shirt, 20, 1);
  px(g, ox + 6, 17, shirt, 20, 1);
  px(g, ox + 6, 18, shirtLight, 20, 1);
  px(g, ox + 6, 19, shirt, 20, 1);
  px(g, ox + 7, 20, shirtLight, 18, 1);
  px(g, ox + 8, 21, shirt, 16, 1);
  px(g, ox + 13, 16, shirtLight, 4, 2);

  if (direction === 'left' || direction === 'right') {
    px(g, ox + 4, 16, shirt, 2, 2);
    px(g, ox + 26, 16, shirt, 2, 2);
    px(g, ox + 4, 18, skin, 2, 3);
    px(g, ox + 26, 18, skin, 2, 3);
    px(g, ox + 4, 21, skinS, 2, 1);
    px(g, ox + 26, 21, skinS, 2, 1);
  } else {
    px(g, ox + 4, 16, shirt, 2, 3);
    px(g, ox + 26, 16, shirt, 2, 3);
    px(g, ox + 4, 19, skin, 2, 2);
    px(g, ox + 26, 19, skin, 2, 2);
    px(g, ox + 4, 21, skinS, 2, 1);
    px(g, ox + 26, 21, skinS, 2, 1);
  }

  // ── BELT (row 22) ──
  px(g, ox + 8, 22, belt, 16, 1);
  px(g, ox + 15, 22, beltBuckle, 2, 1);

  // ── PANTS (rows 23-27) ──
  px(g, ox + 8, 23, pants, 16, 1);
  px(g, ox + 8, 24, pants, 16, 1);
  px(g, ox + 8, 25, pantsLight, 7, 1);
  px(g, ox + 17, 25, pantsLight, 7, 1);
  px(g, ox + 15, 25, 0x000000, 2, 1);
  px(g, ox + 9, 26, pants, 6, 1);
  px(g, ox + 17, 26, pants, 6, 1);
  px(g, ox + 15, 26, 0x000000, 2, 1);

  // ── SHOES (rows 27-31) ──
  if (stepping) {
    if (direction === 'down' || direction === 'up') {
      px(g, ox + 6, 27, pants, 6, 1);
      px(g, ox + 20, 27, pants, 6, 1);
      px(g, ox + 5, 28, shoe, 7, 1);
      px(g, ox + 20, 28, shoe, 7, 1);
      px(g, ox + 5, 29, shoe, 7, 1);
      px(g, ox + 21, 29, shoe, 6, 1);
      px(g, ox + 5, 30, shoeH, 7, 1);
      px(g, ox + 21, 30, shoeH, 6, 1);
      px(g, ox + 6, 29, shoeH, 2, 1);
      px(g, ox + 22, 29, shoeH, 2, 1);
    } else if (direction === 'left') {
      px(g, ox + 5, 27, pants, 7, 1);
      px(g, ox + 18, 27, pants, 5, 1);
      px(g, ox + 4, 28, shoe, 8, 1);
      px(g, ox + 18, 28, shoe, 6, 1);
      px(g, ox + 3, 29, shoe, 8, 1);
      px(g, ox + 19, 29, shoe, 5, 1);
      px(g, ox + 3, 30, shoeH, 8, 1);
    } else {
      px(g, ox + 9, 27, pants, 5, 1);
      px(g, ox + 20, 27, pants, 7, 1);
      px(g, ox + 8, 28, shoe, 6, 1);
      px(g, ox + 20, 28, shoe, 8, 1);
      px(g, ox + 8, 29, shoe, 5, 1);
      px(g, ox + 21, 29, shoe, 8, 1);
      px(g, ox + 21, 30, shoeH, 8, 1);
    }
  } else {
    px(g, ox + 8, 27, pants, 6, 1);
    px(g, ox + 18, 27, pants, 6, 1);
    px(g, ox + 7, 28, shoe, 7, 1);
    px(g, ox + 18, 28, shoe, 7, 1);
    px(g, ox + 7, 29, shoe, 7, 1);
    px(g, ox + 18, 29, shoe, 7, 1);
    px(g, ox + 7, 30, shoeH, 7, 1);
    px(g, ox + 18, 30, shoeH, 7, 1);
    px(g, ox + 8, 30, 0x404040, 5, 1);
    px(g, ox + 19, 30, 0x404040, 5, 1);
  }
}

function generatePlayer(scene: Phaser.Scene) {
  const frameW = CHAR_SIZE;
  const frameH = CHAR_SIZE;
  const sheetW = frameW * 8;
  const sheetH = frameH;

  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const rawCtx = canvas.getContext('2d')!;
  rawCtx.clearRect(0, 0, sheetW, sheetH);
  const dc = new DrawContext(rawCtx);

  const directions: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];

  let frameIndex = 0;
  for (const dir of directions) {
    drawPlayerFrame32(dc, frameIndex * frameW, dir, false);
    frameIndex++;
    drawPlayerFrame32(dc, frameIndex * frameW, dir, true);
    frameIndex++;
  }

  scene.textures.addCanvas('player', canvas);

  const texture = scene.textures.get('player');
  for (let i = 0; i < 8; i++) {
    texture.add(i, 0, i * frameW, 0, frameW, frameH);
  }

  const dirs = ['down', 'up', 'left', 'right'];
  for (let i = 0; i < dirs.length; i++) {
    const base = i * 2;
    scene.anims.create({
      key: `walk-${dirs[i]}`,
      frames: [
        { key: 'player', frame: base },
        { key: 'player', frame: base + 1 },
      ],
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: `idle-${dirs[i]}`,
      frames: [{ key: 'player', frame: base }],
      frameRate: 1,
      repeat: 0,
    });
  }
}

// ─── NPC SPRITES ────────────────────────────────────────────────────

function drawNPCBase(
  g: DrawContext | CanvasRenderingContext2D,
  hairColor: number,
  hairStyle: 'short' | 'bald' | 'long' | 'hat',
  shirtColor: number,
  shirtAccent: number,
  pantsColor: number,
  skinColor: number,
  skinShadow: number,
  extras?: (g: DrawContext | CanvasRenderingContext2D) => void
) {
  // Hair
  if (hairStyle === 'short') {
    px(g, 5, 0, hairColor, 6, 1);
    px(g, 4, 1, hairColor, 8, 1);
    px(g, 3, 2, hairColor, 10, 1);
    px(g, 3, 3, hairColor, 2, 1);
    px(g, 11, 3, hairColor, 2, 1);
  } else if (hairStyle === 'long') {
    px(g, 5, 0, hairColor, 6, 1);
    px(g, 4, 1, hairColor, 8, 1);
    px(g, 3, 2, hairColor, 10, 1);
    px(g, 3, 3, hairColor, 2, 1);
    px(g, 11, 3, hairColor, 2, 1);
    // Long sides
    px(g, 2, 4, hairColor, 2, 4);
    px(g, 12, 4, hairColor, 2, 4);
  } else if (hairStyle === 'bald') {
    px(g, 5, 1, skinColor, 6, 1);
    px(g, 4, 2, skinColor, 8, 1);
  } else if (hairStyle === 'hat') {
    // Hat
    px(g, 3, 0, hairColor, 10, 1);
    px(g, 2, 1, hairColor, 12, 1);
    px(g, 4, 2, hairColor, 8, 1);
    px(g, 3, 3, hairColor, 2, 1);
    px(g, 11, 3, hairColor, 2, 1);
  }

  // Face
  px(g, 5, 3, skinColor, 6, 1);
  px(g, 4, 4, skinColor, 8, 1);
  px(g, 4, 5, skinColor, 8, 1);
  px(g, 5, 6, skinShadow, 6, 1);

  // Eyes
  px(g, 5, 4, 0xffffff, 2, 1);
  px(g, 9, 4, 0xffffff, 2, 1);
  px(g, 6, 4, 0x202020);
  px(g, 10, 4, 0x202020);

  // Mouth
  px(g, 7, 5, 0xc07060, 2, 1);

  // Neck
  px(g, 6, 7, skinShadow, 4, 1);

  // Shirt
  px(g, 4, 7, shirtColor, 2, 1);
  px(g, 10, 7, shirtColor, 2, 1);
  px(g, 3, 8, shirtColor, 10, 1);
  px(g, 3, 9, shirtAccent, 10, 1);
  px(g, 4, 10, shirtColor, 8, 1);

  // Arms
  px(g, 2, 8, shirtColor, 1, 2);
  px(g, 13, 8, shirtColor, 1, 2);
  px(g, 2, 10, skinColor);
  px(g, 13, 10, skinColor);

  // Pants
  px(g, 4, 11, pantsColor, 8, 1);
  px(g, 4, 12, pantsColor, 3, 1);
  px(g, 9, 12, pantsColor, 3, 1);
  px(g, 7, 12, 0x000000, 2, 1);

  // Shoes
  px(g, 4, 13, 0x303030, 3, 1);
  px(g, 9, 13, 0x303030, 3, 1);
  px(g, 4, 14, 0x303030, 3, 1);
  px(g, 9, 14, 0x303030, 3, 1);

  if (extras) extras(g);
}

function generateNPC(
  scene: Phaser.Scene,
  key: string,
  hairColor: number,
  hairStyle: 'short' | 'bald' | 'long' | 'hat',
  shirtColor: number,
  shirtAccent: number,
  pantsColor: number,
  skinColor: number,
  skinShadow: number,
  extras?: (g: DrawContext | CanvasRenderingContext2D) => void
) {
  makeTexture(scene, key, TILE_SIZE, TILE_SIZE, (g) => {
    drawNPCBase(
      g,
      hairColor,
      hairStyle,
      shirtColor,
      shirtAccent,
      pantsColor,
      skinColor,
      skinShadow,
      extras
    );
  });
}

// ─── 32x32 NPC SPRITE (HIGH DETAIL) ────────────────────────────────
// Same concept as drawNPCBase but with 4x more detail

function drawNPCBase32(
  g: DrawContext | CanvasRenderingContext2D,
  hairColor: number,
  hairStyle: 'short' | 'bald' | 'long' | 'hat',
  shirtColor: number,
  shirtAccent: number,
  pantsColor: number,
  skinColor: number,
  skinShadow: number,
  extras?: (g: DrawContext | CanvasRenderingContext2D) => void
) {
  const skinH = ((skinColor >> 16) + 8 > 255 ? 255 : ((skinColor >> 16) + 8)) << 16 |
                (((skinColor >> 8) & 0xff) + 8 > 255 ? 255 : (((skinColor >> 8) & 0xff) + 8)) << 8 |
                ((skinColor & 0xff) + 8 > 255 ? 255 : ((skinColor & 0xff) + 8));
  const hairH = ((hairColor >> 16) + 0x18 > 255 ? 255 : ((hairColor >> 16) + 0x18)) << 16 |
                (((hairColor >> 8) & 0xff) + 0x10 > 255 ? 255 : (((hairColor >> 8) & 0xff) + 0x10)) << 8 |
                ((hairColor & 0xff) + 0x10 > 255 ? 255 : ((hairColor & 0xff) + 0x10));

  // ── HAIR (rows 0-5) ──
  if (hairStyle === 'short') {
    px(g, 10, 0, hairColor, 12, 1);
    px(g, 8, 1, hairColor, 16, 1);
    px(g, 7, 2, hairColor, 18, 1);
    px(g, 6, 3, hairColor, 20, 1);
    px(g, 6, 4, hairColor, 20, 1);
    px(g, 6, 5, hairColor, 4, 1);
    px(g, 22, 5, hairColor, 4, 1);
    // Hair highlights
    px(g, 12, 1, hairH, 3, 1);
    px(g, 10, 2, hairH, 2, 1);
    px(g, 18, 2, hairH, 2, 1);
  } else if (hairStyle === 'long') {
    px(g, 10, 0, hairColor, 12, 1);
    px(g, 8, 1, hairColor, 16, 1);
    px(g, 7, 2, hairColor, 18, 1);
    px(g, 6, 3, hairColor, 20, 1);
    px(g, 6, 4, hairColor, 20, 1);
    px(g, 6, 5, hairColor, 4, 1);
    px(g, 22, 5, hairColor, 4, 1);
    // Long sides flowing down
    px(g, 4, 6, hairColor, 4, 6);
    px(g, 24, 6, hairColor, 4, 6);
    px(g, 5, 12, hairColor, 3, 2);
    px(g, 24, 12, hairColor, 3, 2);
    px(g, 12, 1, hairH, 3, 1);
  } else if (hairStyle === 'bald') {
    px(g, 10, 1, skinColor, 12, 1);
    px(g, 8, 2, skinColor, 16, 1);
    px(g, 7, 3, skinColor, 18, 1);
    px(g, 10, 1, skinShadow, 12, 1); // subtle shadow on scalp
  } else if (hairStyle === 'hat') {
    px(g, 6, 0, hairColor, 20, 1);
    px(g, 4, 1, hairColor, 24, 1);
    px(g, 4, 2, hairColor, 24, 1);
    px(g, 6, 3, hairColor, 20, 1);
    px(g, 6, 4, hairColor, 20, 1);
    px(g, 6, 5, hairColor, 4, 1);
    px(g, 22, 5, hairColor, 4, 1);
    // Hat brim extends
    px(g, 2, 2, hairColor, 2, 1);
    px(g, 28, 2, hairColor, 2, 1);
  }

  // ── FACE (rows 5-12) ──
  px(g, 10, 5, skinColor, 12, 1);
  px(g, 8, 6, skinColor, 16, 1);
  px(g, 8, 7, skinColor, 16, 1);
  px(g, 8, 8, skinColor, 16, 1);
  px(g, 8, 9, skinColor, 16, 1);
  px(g, 9, 10, skinColor, 14, 1);
  px(g, 10, 11, skinShadow, 12, 1);
  px(g, 11, 12, skinShadow, 10, 1);
  // Forehead highlight
  px(g, 12, 5, skinH, 8, 1);

  // Eyebrows
  px(g, 10, 6, 0x282020, 4, 1);
  px(g, 18, 6, 0x282020, 4, 1);
  // Eyes — white with pupil
  px(g, 10, 7, 0xffffff, 4, 2);
  px(g, 18, 7, 0xffffff, 4, 2);
  px(g, 12, 7, 0x202020, 2, 2);
  px(g, 20, 7, 0x202020, 2, 2);
  // Nose shadow
  px(g, 15, 9, skinShadow, 2, 1);
  // Mouth
  px(g, 14, 10, 0xc07060, 4, 1);
  // Ears
  px(g, 7, 7, skinColor, 1, 2);
  px(g, 24, 7, skinColor, 1, 2);
  px(g, 7, 8, skinShadow, 1, 1);
  px(g, 24, 8, skinShadow, 1, 1);

  // ── NECK (row 12-13) ──
  px(g, 13, 12, skinShadow, 6, 1);
  px(g, 13, 13, skinShadow, 6, 1);

  // ── SHIRT (rows 13-21) ──
  px(g, 12, 13, shirtColor, 2, 1);
  px(g, 18, 13, shirtColor, 2, 1);
  px(g, 8, 14, shirtColor, 16, 1);
  px(g, 7, 15, shirtColor, 18, 1);
  px(g, 6, 16, shirtColor, 20, 1);
  px(g, 6, 17, shirtColor, 20, 1);
  px(g, 6, 18, shirtAccent, 20, 1);
  px(g, 6, 19, shirtColor, 20, 1);
  px(g, 7, 20, shirtAccent, 18, 1);
  px(g, 8, 21, shirtColor, 16, 1);
  // Collar / neck detail
  px(g, 12, 13, 0xf0f0f0, 2, 1);
  px(g, 18, 13, 0xf0f0f0, 2, 1);

  // Arms
  px(g, 4, 16, shirtColor, 2, 3);
  px(g, 26, 16, shirtColor, 2, 3);
  px(g, 4, 19, skinColor, 2, 2);
  px(g, 26, 19, skinColor, 2, 2);
  // Hands
  px(g, 4, 21, skinShadow, 2, 1);
  px(g, 26, 21, skinShadow, 2, 1);

  // ── BELT (row 22) ──
  px(g, 8, 22, 0x403830, 16, 1);

  // ── PANTS (rows 23-27) ──
  px(g, 8, 23, pantsColor, 16, 1);
  px(g, 8, 24, pantsColor, 16, 1);
  px(g, 8, 25, pantsColor, 7, 1);
  px(g, 17, 25, pantsColor, 7, 1);
  px(g, 15, 25, 0x000000, 2, 1);
  px(g, 9, 26, pantsColor, 6, 1);
  px(g, 17, 26, pantsColor, 6, 1);
  px(g, 15, 26, 0x000000, 2, 1);

  // ── SHOES (rows 27-30) ──
  px(g, 8, 27, pantsColor, 6, 1);
  px(g, 18, 27, pantsColor, 6, 1);
  px(g, 7, 28, 0x303030, 7, 1);
  px(g, 18, 28, 0x303030, 7, 1);
  px(g, 7, 29, 0x303030, 7, 1);
  px(g, 18, 29, 0x303030, 7, 1);
  px(g, 7, 30, 0x404040, 7, 1);
  px(g, 18, 30, 0x404040, 7, 1);

  if (extras) extras(g);
}

function generateNPC32(
  scene: Phaser.Scene,
  key: string,
  hairColor: number,
  hairStyle: 'short' | 'bald' | 'long' | 'hat',
  shirtColor: number,
  shirtAccent: number,
  pantsColor: number,
  skinColor: number,
  skinShadow: number,
  extras?: (g: DrawContext | CanvasRenderingContext2D) => void
) {
  makeTexture(scene, key, CHAR_SIZE, CHAR_SIZE, (g) => {
    drawNPCBase32(g, hairColor, hairStyle, shirtColor, shirtAccent, pantsColor, skinColor, skinShadow, extras);
  });
}

function generateAllNPCs(scene: Phaser.Scene) {
  // Friend — warm colors, friendly
  generateNPC32(
    scene,
    'npc-friend',
    0x604020, // brown hair
    'short',
    0x40a040, // green shirt
    0x50b850,
    0x4060a0, // blue jeans
    0xf0c090,
    0xd0a070
  );

  // Shady — dark colors
  generateNPC32(
    scene,
    'npc-shady',
    0x202020,
    'short',
    0x303030, // dark shirt
    0x282828,
    0x202020, // black pants
    0xe0b080,
    0xc09060,
    (g) => {
      // Dark sunglasses
      px(g, 10, 7, 0x101010, 4, 2);
      px(g, 18, 7, 0x101010, 4, 2);
      px(g, 14, 7, 0x101010, 4, 1);
    }
  );

  // Guard — uniform
  generateNPC32(
    scene,
    'npc-guard',
    0x404040,
    'short',
    0x2050a0, // navy blue shirt
    0x184080,
    0x203060, // dark blue pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Badge
      px(g, 10, 16, 0xd0c030, 3, 3);
      // Hat brim
      px(g, 6, 3, 0x2050a0, 20, 2);
    }
  );

  // Farmer — overalls + hat
  generateNPC32(
    scene,
    'npc-farmer',
    0xc09040, // straw hat
    'hat',
    0xa02020, // red flannel
    0xb83030,
    0x6080c0, // overalls (blue denim)
    0xe8b878,
    0xc89858,
    (g) => {
      // Overall straps
      px(g, 10, 16, 0x6080c0, 2, 4);
      px(g, 20, 16, 0x6080c0, 2, 4);
    }
  );

  // Tech — casual hoodie look
  generateNPC32(
    scene,
    'npc-tech',
    0x503828,
    'short',
    0x606060, // grey hoodie
    0x707070,
    0x404050, // dark pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Hoodie detail / laptop
      px(g, 12, 18, 0x80c0f0, 8, 1); // blue accent stripe
    }
  );

  // Business — suit
  generateNPC32(
    scene,
    'npc-business',
    0x302828,
    'short',
    0x282838, // dark suit jacket
    0x303040,
    0x282838, // matching pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Tie
      px(g, 15, 14, 0xc03030, 2, 2);
      px(g, 15, 16, 0xc03030, 2, 2);
      px(g, 15, 18, 0xa02828, 2, 2);
      // White collar
      px(g, 12, 14, 0xf0f0f0, 2, 1);
      px(g, 18, 14, 0xf0f0f0, 2, 1);
    }
  );

  // ── Story-specific NPCs (aliases + unique characters) ──

  // Female NPC (Mom) — 32x32
  // Mom — Japanese/white, lighter skin, straight black hair — 32x32
  generateNPC32(
    scene,
    'npc_female',
    0x1a1018, // straight black hair
    'long',
    0xd0b0a0, // cream/beige blouse
    0xc0a090,
    0x404050, // dark pants
    0xf0d8c0, // lighter/fair skin
    0xd8c0a0, // lighter shadow
    (g) => {
      // Lipstick — subtle pink
      px(g, 14, 10, 0xc07070, 4, 1);
      // Small earrings
      px(g, 7, 9, 0xd0c080, 1, 1);
      px(g, 24, 9, 0xd0c080, 1, 1);
      // Narrower eyes — East Asian feature
      px(g, 10, 7, 0xf0d8c0, 4, 1); // override eye row thinner
      px(g, 18, 7, 0xf0d8c0, 4, 1);
      px(g, 10, 7, 0x201010, 3, 1); // dark narrow eyes
      px(g, 19, 7, 0x201010, 3, 1);
    }
  );

  // Pops — Mexican, older, warm, strong, grey goatee — 32x32
  generateNPC32(
    scene,
    'npc_pops',
    0x383028, // greying dark hair
    'short',
    0x806040, // brown shirt
    0x907050,
    0x405060, // dark jeans
    0xd0a070, // tan/brown skin (Mexican)
    0xb08858,
    (g) => {
      // Grey goatee — chin area
      px(g, 13, 11, 0x909090, 6, 1); // goatee top
      px(g, 14, 12, 0x808080, 4, 1); // goatee bottom
      px(g, 14, 13, 0x707070, 4, 1); // goatee chin
      // Grey stubble on cheeks
      px(g, 10, 10, 0x888880, 3, 1);
      px(g, 19, 10, 0x888880, 3, 1);
      // Grey in hair
      px(g, 8, 2, 0x606058, 4, 1);
      px(g, 20, 3, 0x606058, 3, 1);
      // Wider shoulders (strong build)
      px(g, 3, 16, 0x806040, 1, 2);
      px(g, 28, 16, 0x806040, 1, 2);
    }
  );

  // Kid — young, casual
  generateNPC32(
    scene,
    'npc_kid',
    0x604020,
    'short',
    0x40a040, // green shirt
    0x50b850,
    0x4060a0,
    0xf0c090,
    0xd0a070
  );

  // Jose — Mexican, tan, black hair, bigger build — 32x32
  generateNPC32(
    scene,
    'npc_jose',
    0x101010, // black hair
    'short',
    0x404040, // dark grey shirt
    0x4a4a4a,
    0x303038, // dark jeans
    0xc89860, // tan skin
    0xb08050, // tan shadow
    (g) => {
      // Wider shoulders (bigger build)
      px(g, 3, 14, 0x404040, 2, 4);
      px(g, 27, 14, 0x404040, 2, 4);
      // Slight stubble
      px(g, 12, 11, 0x908068, 2, 1);
      px(g, 18, 11, 0x908068, 2, 1);
      px(g, 14, 12, 0x908068, 4, 1);
    }
  );

  // Shady (underscore alias) — 32x32
  generateNPC32(
    scene,
    'npc_shady',
    0x202020,
    'short',
    0x303030,
    0x282828,
    0x202020,
    0xe0b080,
    0xc09060,
    (g) => {
      // Dark sunglasses — wider at 32x32
      px(g, 10, 7, 0x101010, 4, 2);
      px(g, 18, 7, 0x101010, 4, 2);
      px(g, 14, 7, 0x101010, 4, 1); // bridge
      // Scar or stubble
      px(g, 12, 10, 0xb09068, 2, 1);
    }
  );

  // Generic NPC
  generateNPC32(
    scene,
    'npc_generic',
    0x505050,
    'short',
    0x707070,
    0x808080,
    0x505060,
    0xf0c090,
    0xd0a070
  );

  // Inmate — orange jumpsuit — 32x32
  generateNPC32(
    scene,
    'npc_inmate',
    0x303030,
    'bald',
    0xd07020, // orange jumpsuit
    0xc06018,
    0xd07020, // matching pants
    0xe0b080,
    0xc09060,
    (g) => {
      // ID number on chest
      px(g, 12, 16, 0x181818, 1, 2);
      px(g, 14, 16, 0x181818, 1, 2);
      px(g, 16, 16, 0x181818, 1, 2);
      px(g, 18, 16, 0x181818, 1, 2);
    }
  );

  // Inmate 2 — tatted, bald — 32x32
  generateNPC32(
    scene,
    'npc_inmate2',
    0x303030,
    'bald',
    0xd07020,
    0xc06018,
    0xd07020,
    0xd0a070,
    0xb08858,
    (g) => {
      // Face tats — teardrop, cross on forehead, neck tats
      px(g, 10, 9, 0x304030, 2, 2); // teardrop under left eye
      px(g, 10, 11, 0x304030, 2, 1); // teardrop drip
      px(g, 14, 3, 0x304030, 4, 1); // cross horizontal
      px(g, 15, 2, 0x304030, 2, 3); // cross vertical
      px(g, 22, 8, 0x304030, 2, 2); // tat near right eye
      px(g, 10, 12, 0x304030, 4, 1); // neck tat left
      px(g, 18, 12, 0x304030, 4, 1); // neck tat right
      px(g, 5, 16, 0x304030, 2, 3); // arm sleeve tat
      px(g, 25, 16, 0x304030, 2, 3); // arm sleeve tat
    }
  );

  // Inmate 3 — big/tough, face scar + tats — 32x32
  generateNPC32(
    scene,
    'npc_inmate3',
    0x202020,
    'short',
    0xd07020,
    0xc06018,
    0xd07020,
    0xc09060,
    0xa07848,
    (g) => {
      // Wider shoulders (bigger build)
      px(g, 3, 14, 0xd07020, 2, 4);
      px(g, 27, 14, 0xd07020, 2, 4);
      px(g, 3, 18, 0xc09060, 2, 2);
      px(g, 27, 18, 0xc09060, 2, 2);
      // Face scar across right cheek
      px(g, 18, 8, 0x805040, 5, 1);
      px(g, 20, 9, 0x805040, 3, 1);
      // Neck tattoo — thick
      px(g, 10, 12, 0x304030, 12, 1);
      // Arm tats
      px(g, 4, 17, 0x304030, 2, 3);
      px(g, 26, 17, 0x304030, 2, 3);
    }
  );

  // Inmate 4 — skinny, tired, face tat dots — 32x32
  generateNPC32(
    scene,
    'npc_inmate4',
    0x504030,
    'short',
    0xd07020,
    0xc06018,
    0xd07020,
    0xe8c898,
    0xc8a878,
    (g) => {
      // Dark circles under eyes
      px(g, 10, 9, 0x907060, 3, 1);
      px(g, 19, 9, 0x907060, 3, 1);
      // Face tat dots near eye
      px(g, 8, 7, 0x405040, 2, 2);
      px(g, 6, 9, 0x405040, 2, 2);
      // Neck tat
      px(g, 12, 12, 0x405040, 8, 1);
    }
  );

  // Guard (underscore alias) — 32x32
  generateNPC32(
    scene,
    'npc_guard',
    0x404040,
    'short',
    0x2050a0,
    0x184080,
    0x203060,
    0xf0c090,
    0xd0a070,
    (g) => {
      // Badge — gold, detailed
      px(g, 10, 16, 0xd0c030, 4, 3);
      px(g, 11, 17, 0xe0d040, 2, 1);
      // Hat brim — wide
      px(g, 4, 4, 0x2050a0, 24, 1);
      px(g, 5, 3, 0x2050a0, 22, 1);
      // Belt with tools
      px(g, 8, 22, 0x303030, 16, 1);
      px(g, 20, 22, 0x404040, 2, 1); // radio
    }
  );

  // Mirror — JP looking at himself (same as player but facing forward) — 32x32
  generateNPC32(
    scene,
    'npc_mirror',
    0x302020,
    'short',
    0x4060c0,
    0x5070d0,
    0x505060,
    0xf0c090,
    0xd0a070
  );

  // Farmer (underscore alias) — 32x32
  generateNPC32(
    scene,
    'npc_farmer',
    0xc09040,
    'hat',
    0xa02020,
    0xb83030,
    0x6080c0,
    0xe8b878,
    0xc89858,
    (g) => {
      // Overall straps
      px(g, 10, 16, 0x6080c0, 2, 4);
      px(g, 20, 16, 0x6080c0, 2, 4);
    }
  );

  // Computer NPC (placeholder — looks like a monitor)
  generateNPC32(
    scene,
    'npc_computer',
    0x404050,
    'bald',
    0x4080c0, // blue glow shirt
    0x50a0e0,
    0x404050,
    0xb0d0f0, // screen-glow skin
    0x90b0d0
  );

  // Client — first client, casual
  generateNPC32(
    scene,
    'npc_client',
    0x604020,
    'short',
    0xc04040, // red shirt
    0xd05050,
    0x404060,
    0xf0c090,
    0xd0a070
  );

  // Sticker Smith client (legacy key kept for backward compat)
  generateNPC32(
    scene,
    'npc_sticker',
    0x181818,
    'short',
    0x209020,
    0x30a030,
    0x303840,
    0x8a6a40,
    0x705030,
    (g) => {
      // Black beard — fill chin/jaw area rows 5-7
      px(g, 5, 5, 0x202020, 6, 1); // upper beard across lower face
      px(g, 5, 6, 0x202020, 6, 1); // mid beard
      px(g, 6, 7, 0x202020, 4, 1); // lower chin beard
      px(g, 4, 5, 0x202020, 1, 2); // left jaw
      px(g, 11, 5, 0x202020, 1, 2); // right jaw
    }
  );

  // Sticker Smith — Indian with beard, green brand shirt — 32x32
  generateNPC32(
    scene,
    'npc_sticker_smith',
    0x181818,
    'short',
    0x209020,
    0x30a030,
    0x303840,
    0x8a6a40,
    0x705030,
    (g) => {
      // Full thick beard — 32x32 detail: covers jaw, chin, cheeks
      px(g, 9, 9, 0x202020, 14, 1);   // upper beard across lower face
      px(g, 8, 10, 0x202020, 16, 1);  // mid beard
      px(g, 9, 11, 0x1a1a1a, 14, 1);  // lower beard
      px(g, 10, 12, 0x202020, 12, 1); // chin beard
      px(g, 11, 13, 0x1a1a1a, 10, 1); // bottom chin
      px(g, 7, 8, 0x202020, 2, 3);    // left jaw beard
      px(g, 23, 8, 0x202020, 2, 3);   // right jaw beard
      // Beard texture
      px(g, 12, 10, 0x2a2a2a, 2, 1);
      px(g, 18, 11, 0x2a2a2a, 2, 1);
    }
  );

  // Nolan — JP's homie — 32x32
  generateNPC32(
    scene,
    'npc_nolan',
    0x604830,
    'short',
    0x40a050,
    0x50b060,
    0x4060a0,
    0xf0c890,
    0xd0a870
  );

  // David — JP's homie — 32x32
  generateNPC32(
    scene,
    'npc_david',
    0x302020,
    'short',
    0xc04040,
    0xd05050,
    0x383840,
    0xe0b080,
    0xc09060,
    (g) => {
      // Curly hair texture — extra dots on top
      px(g, 9, 1, 0x383028, 2, 1);
      px(g, 14, 0, 0x383028, 2, 1);
      px(g, 19, 1, 0x383028, 2, 1);
      px(g, 11, 0, 0x383028, 1, 1);
    }
  );

  // Cooper — JP's homie — 32x32
  generateNPC32(
    scene,
    'npc_cooper',
    0xc0a050,
    'short',
    0x4060c0,
    0x5070d0,
    0xa09060,
    0xf0c890,
    0xd0a870
  );

  // Terrel — chill frat homie — 32x32
  generateNPC32(
    scene,
    'npc_terrell',
    0x181818,
    'short',
    0xf0f0f0,
    0xe0e0e0,
    0x303840,
    0xa07848,
    0x806030
  );

  // DHL Client — professional, dark skin, DHL-ish yellow shirt
  generateNPC32(
    scene,
    'npc_dhl_client',
    0x202020, // short dark hair
    'short',
    0xd0a020, // yellow/red DHL-ish shirt
    0xe0b030,
    0x303040, // dark pants
    0xa08050, // dark skin
    0x806838
  );

  // Mentor figure
  generateNPC32(
    scene,
    'npc_mentor',
    0x404040,
    'short',
    0x303048, // dark polo
    0x404058,
    0x303040,
    0xe8c098,
    0xc8a078,
    (g) => {
      // Glasses
      px(g, 5, 4, 0xd0d8e0, 2, 1);
      px(g, 9, 4, 0xd0d8e0, 2, 1);
    }
  );

  // Biz — impressed person
  generateNPC32(
    scene,
    'npc_biz',
    0x302828,
    'short',
    0x282838,
    0x303040,
    0x282838,
    0xf0c090,
    0xd0a070,
    (g) => {
      px(g, 7, 7, 0xc03030, 2, 1);
      px(g, 7, 8, 0xc03030, 2, 1);
    }
  );

  // Malachi — business partner, man bun + glasses + charcoal suit — 32x32
  generateNPC32(
    scene,
    'npc_malachi',
    0x201818,
    'short',
    0x2a2a35,
    0x3a3a45,
    0x222230,
    0xc09060,
    0xa07848,
    (g) => {
      // Man bun — prominent on top of head
      px(g, 12, -2, 0x201818, 8, 1);
      px(g, 13, -3, 0x201818, 6, 1);
      px(g, 14, -4, 0x201818, 4, 1);
      // Hair tie
      px(g, 12, -1, 0x404040, 8, 1);
      // Glasses frames — full rectangle frames, visible
      px(g, 9, 6, 0xc0c0d0, 6, 1);   // left lens top
      px(g, 9, 8, 0xc0c0d0, 6, 1);   // left lens bottom
      px(g, 9, 7, 0xc0c0d0, 1, 1);   // left frame left
      px(g, 14, 7, 0xc0c0d0, 1, 1);  // left frame right
      px(g, 17, 6, 0xc0c0d0, 6, 1);  // right lens top
      px(g, 17, 8, 0xc0c0d0, 6, 1);  // right lens bottom
      px(g, 17, 7, 0xc0c0d0, 1, 1);  // right frame left
      px(g, 22, 7, 0xc0c0d0, 1, 1);  // right frame right
      px(g, 15, 7, 0xc0c0d0, 2, 1);  // bridge
      // Lens tint (subtle)
      px(g, 10, 7, 0xd0d8e0, 4, 1);
      px(g, 18, 7, 0xd0d8e0, 4, 1);
      // White collar detail
      px(g, 12, 13, 0xf0f0f0, 8, 1);
    }
  );

  // Higo — JP's white boy, ginger hair, light skin — 32x32
  generateNPC32(
    scene,
    'npc_higo',
    0xC04820,   // ginger/red hair
    'short',
    0xF0F0F0,   // white tee
    0xE0E0E0,
    0x2a2a2a,   // black jeans
    0xF5D6B8,   // light/white skin
    0xDFC0A0,
  );

  // Suit — big client
  generateNPC32(
    scene,
    'npc_suit',
    0x404040,
    'short',
    0x1a1a2a, // black suit
    0x242434,
    0x1a1a2a,
    0xf0c090,
    0xd0a070,
    (g) => {
      px(g, 7, 7, 0x2060c0, 2, 1); // blue tie
      px(g, 7, 8, 0x2060c0, 2, 1);
      px(g, 6, 7, 0xf0f0f0, 1, 1); // white collar
      px(g, 9, 7, 0xf0f0f0, 1, 1);
    }
  );

  // Whale — $400K/mo person
  generateNPC32(
    scene,
    'npc_whale',
    0x503828,
    'short',
    0x181828, // expensive dark outfit
    0x202030,
    0x181828,
    0xf0c090,
    0xd0a070,
    (g) => {
      // Gold watch
      px(g, 2, 10, 0xd0b040, 1, 1);
      // Gold chain hint
      px(g, 6, 7, 0xd0b040, 4, 1);
    }
  );

  // ── NEW UNIQUE NPC SPRITES ──

  // Surfer — beach bro: blonde, tan, board shorts, shirtless, flip flops — 32x32
  makeTexture(scene, 'npc_surfer', CHAR_SIZE, CHAR_SIZE, (g) => {
    const skin = 0xd0a060;
    const skinS = 0xb08848;
    const skinH = 0xe0b870;
    const hair = 0xd0b050;
    const shorts = 0x2080c0;
    const shortsL = 0x3090d0;
    // Hair — shaggy blonde
    px(g, 10, 0, hair, 12, 1);
    px(g, 8, 1, hair, 16, 1);
    px(g, 7, 2, hair, 18, 1);
    px(g, 6, 3, hair, 20, 1);
    px(g, 6, 4, hair, 20, 1);
    px(g, 6, 5, hair, 4, 1);
    px(g, 22, 5, hair, 4, 1);
    // Hair highlights
    px(g, 12, 1, 0xe0c868, 3, 1);
    px(g, 18, 2, 0xe0c868, 2, 1);
    // Face
    px(g, 10, 5, skin, 12, 1);
    px(g, 8, 6, skin, 16, 1);
    px(g, 8, 7, skin, 16, 1);
    px(g, 8, 8, skin, 16, 1);
    px(g, 8, 9, skin, 16, 1);
    px(g, 9, 10, skin, 14, 1);
    px(g, 10, 11, skinS, 12, 1);
    px(g, 11, 12, skinS, 10, 1);
    px(g, 12, 5, skinH, 8, 1);
    // Eyebrows
    px(g, 10, 6, 0x907840, 4, 1);
    px(g, 18, 6, 0x907840, 4, 1);
    // Eyes
    px(g, 10, 7, 0xffffff, 4, 2);
    px(g, 18, 7, 0xffffff, 4, 2);
    px(g, 12, 7, 0x4080c0, 2, 2); // blue eyes
    px(g, 20, 7, 0x4080c0, 2, 2);
    // Nose
    px(g, 15, 9, skinS, 2, 1);
    // Big smile
    px(g, 13, 10, 0xc07060, 6, 1);
    // Ears
    px(g, 7, 7, skin, 1, 2);
    px(g, 24, 7, skin, 1, 2);
    // Neck
    px(g, 13, 12, skinS, 6, 1);
    px(g, 13, 13, skinS, 6, 1);
    // Shirtless torso (skin tone — no shirt)
    px(g, 8, 14, skin, 16, 1);
    px(g, 7, 15, skin, 18, 1);
    px(g, 6, 16, skin, 20, 1);
    px(g, 6, 17, skin, 20, 1);
    px(g, 6, 18, skinS, 20, 1);
    px(g, 6, 19, skin, 20, 1);
    px(g, 7, 20, skinS, 18, 1);
    px(g, 8, 21, skin, 16, 1);
    // Chest/ab definition
    px(g, 15, 16, skinS, 2, 1);
    px(g, 15, 18, skinS, 2, 1);
    px(g, 15, 20, skinS, 2, 1);
    // Arms (skin)
    px(g, 4, 16, skin, 2, 3);
    px(g, 26, 16, skin, 2, 3);
    px(g, 4, 19, skin, 2, 2);
    px(g, 26, 19, skin, 2, 2);
    px(g, 4, 21, skinS, 2, 1);
    px(g, 26, 21, skinS, 2, 1);
    // Board shorts
    px(g, 8, 22, shorts, 16, 1);
    px(g, 8, 23, shorts, 16, 1);
    px(g, 8, 24, shortsL, 16, 1);
    px(g, 8, 25, shorts, 7, 1);
    px(g, 17, 25, shorts, 7, 1);
    px(g, 15, 25, 0x000000, 2, 1);
    px(g, 9, 26, shorts, 6, 1);
    px(g, 17, 26, shorts, 6, 1);
    // Flower pattern on shorts
    px(g, 10, 23, 0xf0e060, 2, 1);
    px(g, 20, 24, 0xf0e060, 2, 1);
    // Legs below shorts
    px(g, 9, 27, skin, 5, 1);
    px(g, 18, 27, skin, 5, 1);
    // Flip flops
    px(g, 7, 28, 0xa08060, 7, 1);
    px(g, 18, 28, 0xa08060, 7, 1);
    px(g, 7, 29, 0xa08060, 7, 1);
    px(g, 18, 29, 0xa08060, 7, 1);
    px(g, 7, 30, 0x907050, 7, 1);
    px(g, 18, 30, 0x907050, 7, 1);
  });

  // Dealer — street dealer: gold chain, black cap, dark clothes — 32x32
  generateNPC32(
    scene,
    'npc_dealer',
    0x181818, // cap color used as hair
    'hat',
    0x202020,
    0x181818,
    0x181818,
    0xe0b080,
    0xc09060,
    (g) => {
      // Override eyes with narrow menacing slits
      px(g, 10, 7, 0x101010, 4, 1);
      px(g, 18, 7, 0x101010, 4, 1);
      // Frown
      px(g, 14, 10, 0x904040, 4, 1);
      // Gold chain — thick, prominent
      px(g, 10, 12, 0xd0b040, 12, 1);
      px(g, 12, 13, 0xd0b040, 8, 1);
      px(g, 14, 14, 0xc0a030, 4, 1); // chain pendant
      // Override shoes to dark
      px(g, 7, 28, 0x101010, 7, 1);
      px(g, 18, 28, 0x101010, 7, 1);
      px(g, 7, 29, 0x101010, 7, 1);
      px(g, 18, 29, 0x101010, 7, 1);
    }
  );

  // Lawyer — grey hair, glasses, suit, briefcase — 32x32
  generateNPC32(
    scene,
    'npc_lawyer',
    0x909098, // grey hair
    'short',
    0x404050, // dark suit
    0x505060,
    0x404050, // matching pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Glasses
      px(g, 9, 7, 0xc0c0d0, 5, 2);
      px(g, 18, 7, 0xc0c0d0, 5, 2);
      px(g, 14, 7, 0xa0a0b0, 4, 1); // bridge
      // Eyes behind glasses
      px(g, 10, 7, 0xffffff, 3, 2);
      px(g, 19, 7, 0xffffff, 3, 2);
      px(g, 12, 7, 0x202020, 1, 2);
      px(g, 21, 7, 0x202020, 1, 2);
      // White collar
      px(g, 12, 13, 0xf0f0f0, 2, 1);
      px(g, 18, 13, 0xf0f0f0, 2, 1);
      // Tie
      px(g, 15, 15, 0x803030, 2, 1);
      px(g, 15, 16, 0x803030, 2, 1);
      px(g, 15, 17, 0x803030, 2, 1);
      px(g, 15, 18, 0x702828, 2, 1);
      // Briefcase in right hand
      px(g, 27, 20, 0x805030, 3, 3);
      px(g, 27, 23, 0x704020, 3, 1);
      px(g, 28, 19, 0x604020, 1, 1); // handle
    }
  );

  // Judge — black robe, grey hair, stern — 32x32
  generateNPC32(
    scene,
    'npc_judge',
    0x808088, // grey hair
    'short',
    0x101018, // black robe as "shirt"
    0x1a1a24,
    0x101018, // robe continues as pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Stern narrow eyes override
      px(g, 10, 7, 0x202020, 4, 1);
      px(g, 18, 7, 0x202020, 4, 1);
      // Stern mouth
      px(g, 14, 10, 0x907060, 4, 1);
      // White judicial collar
      px(g, 10, 13, 0xf0f0f0, 12, 1);
      px(g, 11, 14, 0xf0f0f0, 10, 1);
      // Robe extends wider — cover arms with robe
      px(g, 4, 16, 0x101018, 2, 3);
      px(g, 26, 16, 0x101018, 2, 3);
      px(g, 3, 17, 0x101018, 3, 2);
      px(g, 26, 17, 0x101018, 3, 2);
      // Hide hands (tucked in robe)
      px(g, 4, 19, 0x101018, 2, 3);
      px(g, 26, 19, 0x101018, 2, 3);
      // Override shoes to dark
      px(g, 7, 28, 0x202020, 7, 1);
      px(g, 18, 28, 0x202020, 7, 1);
      px(g, 7, 29, 0x202020, 7, 1);
      px(g, 18, 29, 0x202020, 7, 1);
      px(g, 7, 30, 0x282828, 7, 1);
      px(g, 18, 30, 0x282828, 7, 1);
    }
  );

  // Waitress — apron over dark top, hair in bun, friendly — 32x32
  generateNPC32(
    scene,
    'npc_waitress',
    0x503020, // brown hair
    'long',   // long hair (bun effect via extras)
    0x303038, // dark top
    0x404048,
    0x303038, // dark pants
    0xf0c090,
    0xd0a070,
    (g) => {
      // Bun on top of head
      px(g, 13, 0, 0x503020, 6, 1);
      px(g, 14, -1, 0x503020, 4, 1); // bun peak (will clip but that's fine)
      // Friendly green eyes override
      px(g, 10, 7, 0xffffff, 4, 2);
      px(g, 18, 7, 0xffffff, 4, 2);
      px(g, 12, 7, 0x408040, 2, 2);
      px(g, 20, 7, 0x408040, 2, 2);
      // Wide smile
      px(g, 13, 10, 0xd08070, 6, 1);
      // Apron overlay on torso
      px(g, 10, 15, 0xf0f0f0, 12, 1);
      px(g, 10, 16, 0xf0f0f0, 12, 1);
      px(g, 10, 17, 0xf0f0f0, 12, 1);
      px(g, 10, 18, 0xe8e8e8, 12, 1);
      px(g, 10, 19, 0xf0f0f0, 12, 1);
      px(g, 10, 20, 0xf0f0f0, 12, 1);
      px(g, 10, 21, 0xf0f0f0, 12, 1);
      px(g, 10, 22, 0xe8e8e8, 12, 1);
      // Apron strings at waist
      px(g, 8, 18, 0xe0e0e0, 2, 1);
      px(g, 22, 18, 0xe0e0e0, 2, 1);
      // Apron pocket
      px(g, 13, 19, 0xe0e0e0, 6, 2);
    }
  );

  // Security — bald, black suit, earpiece, big build — 32x32
  generateNPC32(
    scene,
    'npc_security',
    0x181820, // bald uses hat color as placeholder, we override
    'bald',
    0x181820, // black suit
    0x202028,
    0x181820, // matching pants
    0xe0b080,
    0xc09060,
    (g) => {
      // Serious narrow eyes override
      px(g, 10, 7, 0x202020, 4, 1);
      px(g, 18, 7, 0x202020, 4, 1);
      // Stern mouth
      px(g, 14, 10, 0x906060, 4, 1);
      // Earpiece on right side
      px(g, 25, 7, 0xe0b080, 1, 1); // flesh near ear
      px(g, 25, 8, 0x303030, 1, 1); // earpiece
      px(g, 25, 9, 0x303030, 1, 2); // wire going down
      // Extra wide shoulders — extend suit beyond normal arms
      px(g, 2, 16, 0x181820, 2, 3);
      px(g, 28, 16, 0x181820, 2, 3);
      px(g, 3, 15, 0x181820, 1, 1);
      px(g, 28, 15, 0x181820, 1, 1);
      // Override shoes to shiny black
      px(g, 7, 28, 0x101010, 7, 1);
      px(g, 18, 28, 0x101010, 7, 1);
      px(g, 7, 29, 0x101010, 7, 1);
      px(g, 18, 29, 0x101010, 7, 1);
      px(g, 7, 30, 0x181818, 7, 1);
      px(g, 18, 30, 0x181818, 7, 1);
    }
  );

  // Sister — young girl, takes after Pops (Mexican features), tan skin — 32x32
  generateNPC32(
    scene,
    'npc_sister',
    0x281810, // dark brown hair (like Pops)
    'long',
    0xc060a0, // pink/purple top
    0xd070b0,
    0x505060, // shorts
    0xd0a070, // tan skin (like Pops, not Mom)
    0xb08858,
    (g) => {
      // Shift shorter — draw additional shorter legs/shoes detail
      // Pink sneakers
      px(g, 7, 28, 0xf08080, 7, 1);
      px(g, 18, 28, 0xf08080, 7, 1);
      px(g, 7, 29, 0xf08080, 7, 1);
      px(g, 18, 29, 0xf08080, 7, 1);
      px(g, 7, 30, 0xe07070, 7, 1);
      px(g, 18, 30, 0xe07070, 7, 1);
      // Smile — override mouth wider
      px(g, 13, 10, 0xd08070, 6, 1);
    }
  );

  // Frenchie — tan French Bulldog (top-down/front view) — 32x32
  makeTexture(scene, 'npc_frenchie', CHAR_SIZE, CHAR_SIZE, (g) => {
    const body = 0xc8a070;
    const bodyDk = 0xb08858;
    const bodyLt = 0xd8b880;
    const nose = 0x202020;
    const eye = 0x181818;
    const earPink = 0xd8a0a0;
    const white = 0xf0e8d8;

    // ── Compact stocky body (rows 16-26) ──
    px(g, 9, 16, body, 14, 2);
    px(g, 8, 18, body, 16, 3);
    px(g, 8, 21, bodyLt, 16, 2);  // white chest
    px(g, 9, 23, body, 14, 2);
    px(g, 10, 25, bodyDk, 12, 1);

    // ── Stubby legs (rows 26-30) ──
    px(g, 9, 26, bodyDk, 4, 3);
    px(g, 19, 26, bodyDk, 4, 3);
    px(g, 9, 29, 0x303030, 4, 2);  // paws
    px(g, 19, 29, 0x303030, 4, 2);

    // ── Head (rows 6-16) — wide, flat, square-ish ──
    px(g, 8, 6, body, 16, 2);
    px(g, 7, 8, body, 18, 2);
    px(g, 7, 10, body, 18, 2);
    px(g, 8, 12, bodyLt, 16, 2);
    px(g, 9, 14, bodyLt, 14, 2);
    // White muzzle area
    px(g, 11, 12, white, 10, 4);

    // ── Bat ears — TALL, NARROW, pointed tips ──
    // Left ear
    px(g, 6, 0, body, 2, 1);     // tip
    px(g, 5, 1, body, 3, 1);
    px(g, 4, 2, body, 4, 1);
    px(g, 4, 3, body, 4, 1);
    px(g, 5, 4, body, 4, 1);
    px(g, 6, 5, body, 3, 2);
    // Left ear pink inside
    px(g, 6, 1, earPink, 1, 1);
    px(g, 5, 2, earPink, 3, 1);
    px(g, 5, 3, earPink, 3, 1);
    px(g, 6, 4, earPink, 2, 1);

    // Right ear
    px(g, 24, 0, body, 2, 1);    // tip
    px(g, 24, 1, body, 3, 1);
    px(g, 24, 2, body, 4, 1);
    px(g, 24, 3, body, 4, 1);
    px(g, 23, 4, body, 4, 1);
    px(g, 23, 5, body, 3, 2);
    // Right ear pink inside
    px(g, 25, 1, earPink, 1, 1);
    px(g, 24, 2, earPink, 3, 1);
    px(g, 24, 3, earPink, 3, 1);
    px(g, 24, 4, earPink, 2, 1);

    // ── Face ──
    // Big round dark eyes
    px(g, 9, 9, eye, 3, 2);
    px(g, 20, 9, eye, 3, 2);
    px(g, 9, 9, 0x404060, 1, 1);  // shine
    px(g, 20, 9, 0x404060, 1, 1);

    // Flat wide nose
    px(g, 14, 12, nose, 4, 2);
    px(g, 13, 13, nose, 6, 1);
    // Nostrils
    px(g, 14, 12, 0x404040, 1, 1);
    px(g, 17, 12, 0x404040, 1, 1);

    // Mouth/jowls
    px(g, 13, 15, bodyDk, 2, 1);
    px(g, 17, 15, bodyDk, 2, 1);
    // Tongue
    px(g, 15, 15, 0xd08080, 2, 1);
    px(g, 15, 16, 0xc07070, 2, 1);

    // ── Stubby tail ──
    px(g, 25, 18, bodyDk, 2, 1);
    px(g, 26, 17, bodyDk, 1, 1);
  });

  // Bikini Girl 1 — light blue bikini, long brown hair, sleeping — 32x32
  makeTexture(scene, 'npc_bikini1', CHAR_SIZE, CHAR_SIZE, (g) => {
    const skin = 0xf0c890;
    const skinS = 0xd0a870;
    const skinH = 0xf8d8a0;
    const hair = 0x604020;
    const hairH = 0x785030;
    const bikini = 0x40a0c0;
    const bikiniL = 0x50b0d0;
    // Long flowing hair
    px(g, 10, 0, hair, 12, 1);
    px(g, 8, 1, hair, 16, 1);
    px(g, 7, 2, hair, 18, 1);
    px(g, 6, 3, hair, 20, 1);
    px(g, 6, 4, hair, 20, 1);
    px(g, 6, 5, hair, 4, 1);
    px(g, 22, 5, hair, 4, 1);
    // Hair flowing down sides
    px(g, 4, 6, hair, 4, 8);
    px(g, 24, 6, hair, 4, 8);
    px(g, 5, 14, hair, 3, 2);
    px(g, 24, 14, hair, 3, 2);
    // Hair highlights
    px(g, 12, 1, hairH, 3, 1);
    px(g, 10, 2, hairH, 2, 1);
    px(g, 18, 2, hairH, 2, 1);
    // Face
    px(g, 10, 5, skin, 12, 1);
    px(g, 8, 6, skin, 16, 1);
    px(g, 8, 7, skin, 16, 1);
    px(g, 8, 8, skin, 16, 1);
    px(g, 8, 9, skin, 16, 1);
    px(g, 9, 10, skin, 14, 1);
    px(g, 10, 11, skinS, 12, 1);
    px(g, 11, 12, skinS, 10, 1);
    px(g, 12, 5, skinH, 8, 1);
    // Closed/sleepy eyes (lines, not open)
    px(g, 10, 7, 0x806050, 4, 1);
    px(g, 18, 7, 0x806050, 4, 1);
    // Light eyelashes
    px(g, 10, 6, 0x604020, 4, 1);
    px(g, 18, 6, 0x604020, 4, 1);
    // Nose
    px(g, 15, 9, skinS, 2, 1);
    // Sleepy mouth
    px(g, 14, 10, 0xc07060, 4, 1);
    // Ears
    px(g, 7, 7, skin, 1, 2);
    px(g, 24, 7, skin, 1, 2);
    // Neck
    px(g, 13, 12, skinS, 6, 1);
    px(g, 13, 13, skinS, 6, 1);
    // Bikini top — two triangles with strap
    px(g, 9, 14, bikini, 5, 2);
    px(g, 18, 14, bikini, 5, 2);
    px(g, 10, 16, bikini, 3, 1);
    px(g, 19, 16, bikini, 3, 1);
    // Strap between cups
    px(g, 14, 14, bikiniL, 4, 1);
    // Shoulder straps
    px(g, 11, 13, bikiniL, 1, 1);
    px(g, 20, 13, bikiniL, 1, 1);
    // Exposed skin around bikini top
    px(g, 8, 14, skin, 1, 3);
    px(g, 23, 14, skin, 1, 3);
    px(g, 14, 15, skin, 4, 1); // center gap
    // Exposed midriff
    px(g, 8, 17, skin, 16, 1);
    px(g, 8, 18, skin, 16, 1);
    px(g, 8, 19, skinS, 16, 1);
    px(g, 9, 20, skin, 14, 1);
    px(g, 10, 21, skin, 12, 1);
    // Belly button
    px(g, 15, 19, skinS, 2, 1);
    // Arms (skin, no sleeves)
    px(g, 4, 15, skin, 2, 4);
    px(g, 26, 15, skin, 2, 4);
    px(g, 4, 19, skin, 2, 2);
    px(g, 26, 19, skin, 2, 2);
    px(g, 4, 21, skinS, 2, 1);
    px(g, 26, 21, skinS, 2, 1);
    // Bikini bottom
    px(g, 10, 22, bikini, 12, 1);
    px(g, 11, 23, bikini, 10, 1);
    px(g, 11, 24, bikini, 4, 1);
    px(g, 17, 24, bikini, 4, 1);
    // Legs
    px(g, 9, 25, skin, 5, 1);
    px(g, 18, 25, skin, 5, 1);
    px(g, 9, 26, skin, 5, 1);
    px(g, 18, 26, skin, 5, 1);
    px(g, 9, 27, skinS, 5, 1);
    px(g, 18, 27, skinS, 5, 1);
    // Feet
    px(g, 8, 28, skin, 6, 1);
    px(g, 18, 28, skin, 6, 1);
    px(g, 8, 29, skinS, 6, 1);
    px(g, 18, 29, skinS, 6, 1);
    px(g, 8, 30, skinS, 6, 1);
    px(g, 18, 30, skinS, 6, 1);
  });

  // Bikini Girl 2 — pink bikini, dark hair, active/smiling — 32x32
  makeTexture(scene, 'npc_bikini2', CHAR_SIZE, CHAR_SIZE, (g) => {
    const skin = 0xf0c890;
    const skinS = 0xd0a870;
    const skinH = 0xf8d8a0;
    const hair = 0x302020;
    const hairH = 0x402828;
    const bikini = 0xd06080;
    const bikiniL = 0xe07090;
    // Long dark hair
    px(g, 10, 0, hair, 12, 1);
    px(g, 8, 1, hair, 16, 1);
    px(g, 7, 2, hair, 18, 1);
    px(g, 6, 3, hair, 20, 1);
    px(g, 6, 4, hair, 20, 1);
    px(g, 6, 5, hair, 4, 1);
    px(g, 22, 5, hair, 4, 1);
    // Hair flowing down sides
    px(g, 4, 6, hair, 4, 8);
    px(g, 24, 6, hair, 4, 8);
    px(g, 5, 14, hair, 3, 3);
    px(g, 24, 14, hair, 3, 3);
    // Hair highlights
    px(g, 12, 1, hairH, 3, 1);
    px(g, 18, 2, hairH, 2, 1);
    // Face
    px(g, 10, 5, skin, 12, 1);
    px(g, 8, 6, skin, 16, 1);
    px(g, 8, 7, skin, 16, 1);
    px(g, 8, 8, skin, 16, 1);
    px(g, 8, 9, skin, 16, 1);
    px(g, 9, 10, skin, 14, 1);
    px(g, 10, 11, skinS, 12, 1);
    px(g, 11, 12, skinS, 10, 1);
    px(g, 12, 5, skinH, 8, 1);
    // Eyebrows (thin, arched)
    px(g, 10, 6, 0x302020, 4, 1);
    px(g, 18, 6, 0x302020, 4, 1);
    // Open eyes with color
    px(g, 10, 7, 0xffffff, 4, 2);
    px(g, 18, 7, 0xffffff, 4, 2);
    px(g, 12, 7, 0x206020, 2, 2); // green eyes
    px(g, 20, 7, 0x206020, 2, 2);
    // Nose
    px(g, 15, 9, skinS, 2, 1);
    // Slight smile
    px(g, 13, 10, 0xd08070, 6, 1);
    px(g, 12, 10, 0xd08070, 1, 1); // wider smile
    px(g, 19, 10, 0xd08070, 1, 1);
    // Ears
    px(g, 7, 7, skin, 1, 2);
    px(g, 24, 7, skin, 1, 2);
    // Neck
    px(g, 13, 12, skinS, 6, 1);
    px(g, 13, 13, skinS, 6, 1);
    // Bikini top — pink
    px(g, 9, 14, bikini, 5, 2);
    px(g, 18, 14, bikini, 5, 2);
    px(g, 10, 16, bikiniL, 3, 1);
    px(g, 19, 16, bikiniL, 3, 1);
    // Strap between cups
    px(g, 14, 14, bikiniL, 4, 1);
    // Shoulder straps
    px(g, 11, 13, bikiniL, 1, 1);
    px(g, 20, 13, bikiniL, 1, 1);
    // Skin around bikini
    px(g, 8, 14, skin, 1, 3);
    px(g, 23, 14, skin, 1, 3);
    px(g, 14, 15, skin, 4, 1);
    // Exposed midriff
    px(g, 8, 17, skin, 16, 1);
    px(g, 8, 18, skin, 16, 1);
    px(g, 8, 19, skinS, 16, 1);
    px(g, 9, 20, skin, 14, 1);
    px(g, 10, 21, skin, 12, 1);
    // Belly button
    px(g, 15, 19, skinS, 2, 1);
    // Arms (skin, no sleeves)
    px(g, 4, 15, skin, 2, 4);
    px(g, 26, 15, skin, 2, 4);
    px(g, 4, 19, skin, 2, 2);
    px(g, 26, 19, skin, 2, 2);
    px(g, 4, 21, skinS, 2, 1);
    px(g, 26, 21, skinS, 2, 1);
    // Bikini bottom
    px(g, 10, 22, bikini, 12, 1);
    px(g, 11, 23, bikini, 10, 1);
    px(g, 11, 24, bikini, 4, 1);
    px(g, 17, 24, bikini, 4, 1);
    // Legs
    px(g, 9, 25, skin, 5, 1);
    px(g, 18, 25, skin, 5, 1);
    px(g, 9, 26, skin, 5, 1);
    px(g, 18, 26, skin, 5, 1);
    px(g, 9, 27, skinS, 5, 1);
    px(g, 18, 27, skinS, 5, 1);
    // Sandals
    px(g, 8, 28, 0xc09060, 6, 1);
    px(g, 18, 28, 0xc09060, 6, 1);
    px(g, 8, 29, 0xb08050, 6, 1);
    px(g, 18, 29, 0xb08050, 6, 1);
    px(g, 8, 30, 0xa07040, 6, 1);
    px(g, 18, 30, 0xa07040, 6, 1);
  });

  // Narrator / Professor — older, grey hair, wise
  generateNPC32(
    scene,
    'npc-narrator',
    0xb0b0b0, // grey/white hair
    'long',
    0x604020, // brown coat
    0x705030,
    0x504030, // brown pants
    0xe8c098,
    0xc8a078,
    (g) => {
      // Glasses
      px(g, 5, 4, 0xd0d8e0, 2, 1);
      px(g, 9, 4, 0xd0d8e0, 2, 1);
      px(g, 7, 4, 0xa0a0a0); // bridge
      // Wrinkles under eyes
      px(g, 5, 5, 0xc8a078);
      px(g, 10, 5, 0xc8a078);
    }
  );

  // Manza — creative/visual artist, dark skin, short dreads — 32x32
  generateNPC32(
    scene,
    'npc_manza',
    0x201818,
    'short',
    0x181820,
    0x202028,
    0x282830,
    0xa07848,
    0x806030,
    (g) => {
      // Short dreads texture — extra pixels sticking up
      px(g, 7, 0, 0x201818, 3, 1);
      px(g, 13, 0, 0x201818, 2, 1);
      px(g, 19, 0, 0x201818, 3, 1);
      px(g, 10, 0, 0x181010, 2, 1);
      px(g, 16, 0, 0x181010, 2, 1);
      px(g, 9, 1, 0x181010, 1, 1);
      px(g, 15, 1, 0x181010, 1, 1);
      px(g, 21, 1, 0x181010, 1, 1);
      // Chain detail on neck — bigger
      px(g, 13, 12, 0xd0b040, 6, 1);
      px(g, 14, 13, 0xd0b040, 4, 1);
      px(g, 15, 14, 0xc0a030, 2, 1); // pendant
      // Shoulder-mounted camera — big time filmmaker
      // Camera body on right shoulder (large, professional)
      px(g, 23, 8, 0x1a1a1a, 6, 4);  // main camera body on shoulder
      px(g, 22, 8, 0x2a2a2a, 1, 4);  // left grip
      px(g, 29, 8, 0x2a2a2a, 1, 4);  // right edge
      // Lens barrel extending forward
      px(g, 29, 9, 0x303030, 3, 2);  // lens tube
      px(g, 30, 9, 0x505058, 2, 2);  // lens glass ring
      px(g, 31, 10, 0x707078, 1, 1); // lens highlight
      // Viewfinder on top
      px(g, 24, 7, 0x2a2a2a, 3, 1);  // viewfinder box
      px(g, 25, 7, 0x404048, 1, 1);  // viewfinder screen
      // Red record light
      px(g, 27, 7, 0xff2020, 1, 1);  // recording indicator
      // Hand gripping camera (skin tone)
      px(g, 23, 11, 0xa07848, 2, 1); // right hand on camera
    }
  );

  // Zay — JP's boy, ride or die. Waves/low fade, designer fit, gold chain — 32x32
  generateNPC32(
    scene,
    'npc_zay',
    0x181010,
    'short',
    0x1a1a28,
    0x222230,
    0x1a1a20,
    0x905838,
    0x704828,
    (g) => {
      // Waves texture on hair — visible wave pattern at 32x32
      px(g, 9, 1, 0x241818, 2, 1);
      px(g, 13, 2, 0x241818, 2, 1);
      px(g, 17, 1, 0x241818, 2, 1);
      px(g, 21, 2, 0x241818, 2, 1);
      px(g, 11, 3, 0x241818, 2, 1);
      px(g, 15, 3, 0x241818, 2, 1);
      px(g, 19, 3, 0x241818, 2, 1);
      // Gold chain — thick, prominent, pendant
      px(g, 12, 12, 0xd0b040, 8, 1);
      px(g, 11, 13, 0xd0b040, 2, 1);
      px(g, 19, 13, 0xd0b040, 2, 1);
      px(g, 13, 13, 0xc0a030, 6, 1); // lower chain
      px(g, 14, 14, 0xd0b040, 4, 1); // pendant
      px(g, 15, 15, 0xe0c050, 2, 1); // pendant center (shiny)
      // Brand logo on hoodie
      px(g, 12, 17, 0x303040, 3, 2);
      px(g, 13, 18, 0x404050, 1, 1);
      // Clean white shoes — override dark ones
      px(g, 7, 28, 0xf0f0f0, 7, 1);
      px(g, 18, 28, 0xf0f0f0, 7, 1);
      px(g, 7, 29, 0xf0f0f0, 7, 1);
      px(g, 18, 29, 0xf0f0f0, 7, 1);
      px(g, 7, 30, 0xe8e8e8, 7, 1);
      px(g, 18, 30, 0xe8e8e8, 7, 1);
      // Nike swoosh hint
      px(g, 9, 29, 0xc0c0c0, 3, 1);
      px(g, 20, 29, 0xc0c0c0, 3, 1);
    }
  );

  // Elijah — Pomaikai team, clean-cut, tech startup energy. Dark skin, short fade, dark button-up — 32x32
  generateNPC32(
    scene,
    'npc_elijah',
    0x181010,   // dark hair (tight fade)
    'short',
    0x2a2a3a,   // dark navy button-up shirt
    0x343445,   // shirt accent
    0x282830,   // dark slacks
    0x905838,   // dark skin tone
    0x704828,   // skin shadow
    (g) => {
      // Clean fade edges — tighter on sides
      px(g, 7, 3, 0x703828, 2, 1);  // left fade blend into skin
      px(g, 23, 3, 0x703828, 2, 1); // right fade blend into skin
      px(g, 7, 4, 0x804830, 1, 1);  // left fade lower
      px(g, 24, 4, 0x804830, 1, 1); // right fade lower
      // Clean stubble/beard — subtle, just a hint
      px(g, 11, 10, 0x302018, 3, 1);
      px(g, 18, 10, 0x302018, 3, 1);
      px(g, 12, 11, 0x302018, 8, 1); // jawline stubble
      // Button-up shirt details — button line down center
      px(g, 15, 14, 0x505068, 2, 1); // button 1
      px(g, 15, 16, 0x505068, 2, 1); // button 2
      px(g, 15, 18, 0x505068, 2, 1); // button 3
      px(g, 15, 20, 0x505068, 2, 1); // button 4
      // Collar — open collar, creative professional
      px(g, 11, 12, 0x343445, 3, 1); // left collar
      px(g, 18, 12, 0x343445, 3, 1); // right collar
      px(g, 12, 13, 0x343445, 2, 1); // left collar inner
      px(g, 18, 13, 0x343445, 2, 1); // right collar inner
    }
  );
}

// ─── TILE SPRITES ───────────────────────────────────────────────────

function generateTiles(scene: Phaser.Scene) {
  const S = TILE_SIZE; // 32

  // -- Grass (32x32) --
  makeTexture(scene, 'tile-grass', S, S, (g) => {
    // Base green fill — warmer, richer green
    g.fillStyle(0x4e9442);
    g.fillRect(0, 0, S, S);

    // Large natural variation patches (no grid pattern)
    px(g, 0, 0, 0x478a3c, 18, 14);
    px(g, 14, 12, 0x529848, 18, 20);
    px(g, 0, 18, 0x4a8e40, 12, 14);
    px(g, 20, 0, 0x509244, 12, 10);

    // Grass blade clusters (irregular, not on a grid)
    // Cluster 1 — top left
    px(g, 2, 1, 0x3c7832, 1, 3);
    px(g, 4, 2, 0x3c7832, 1, 2);
    px(g, 2, 0, 0x5ca04e, 1, 1); // tip highlight

    // Cluster 2 — mid
    px(g, 11, 5, 0x3c7832, 1, 3);
    px(g, 13, 4, 0x3c7832, 1, 2);
    px(g, 11, 4, 0x5ca04e, 1, 1);

    // Cluster 3 — right
    px(g, 24, 3, 0x3c7832, 1, 3);
    px(g, 26, 2, 0x3c7832, 1, 2);
    px(g, 24, 2, 0x5ca04e, 1, 1);

    // Cluster 4 — bottom left
    px(g, 5, 20, 0x3c7832, 1, 3);
    px(g, 7, 19, 0x3c7832, 1, 2);
    px(g, 5, 19, 0x5ca04e, 1, 1);

    // Cluster 5 — center bottom
    px(g, 16, 22, 0x3c7832, 1, 3);
    px(g, 18, 23, 0x3c7832, 1, 2);
    px(g, 16, 21, 0x5ca04e, 1, 1);

    // Cluster 6 — bottom right
    px(g, 27, 18, 0x3c7832, 1, 3);
    px(g, 29, 17, 0x3c7832, 1, 2);
    px(g, 27, 17, 0x5ca04e, 1, 1);

    // Scattered single blades
    px(g, 8, 10, 0x3a7430, 1, 2);
    px(g, 19, 8, 0x3a7430, 1, 2);
    px(g, 30, 12, 0x3a7430, 1, 2);
    px(g, 1, 28, 0x3a7430, 1, 2);
    px(g, 22, 28, 0x3a7430, 1, 2);
    px(g, 14, 14, 0x3a7430, 1, 2);

    // Lighter patches (sun-touched areas)
    px(g, 6, 6, 0x5aa04c, 5, 3);
    px(g, 20, 14, 0x5aa04c, 4, 4);
    px(g, 10, 26, 0x5aa04c, 6, 3);

    // Soil specks (very few, natural)
    px(g, 15, 9, 0x6a5a30, 1, 1);
    px(g, 28, 25, 0x6a5a30, 1, 1);
    px(g, 3, 15, 0x6a5a30, 1, 1);

    // NO flowers — keep it clean suburban lawn
  });

  // -- Sand (32x32) --
  makeTexture(scene, 'tile-sand', S, S, (g) => {
    // Sandy base
    g.fillStyle(COLORS.sandYellow);
    g.fillRect(0, 0, S, S);

    // Grain texture — scattered light dots
    px(g, 3, 2, COLORS.sandLight, 4, 1);
    px(g, 14, 5, COLORS.sandLight, 3, 1);
    px(g, 22, 1, COLORS.sandLight, 5, 1);
    px(g, 8, 10, COLORS.sandLight, 3, 2);
    px(g, 2, 18, COLORS.sandLight, 4, 1);
    px(g, 20, 14, COLORS.sandLight, 3, 1);
    px(g, 26, 22, COLORS.sandLight, 4, 1);
    px(g, 12, 26, COLORS.sandLight, 3, 1);
    px(g, 5, 30, COLORS.sandLight, 5, 1);

    // Darker sand grains
    px(g, 10, 4, COLORS.sandDark, 3, 1);
    px(g, 24, 8, COLORS.sandDark, 2, 1);
    px(g, 6, 14, COLORS.sandDark, 2, 1);
    px(g, 18, 20, COLORS.sandDark, 3, 1);
    px(g, 4, 24, COLORS.sandDark, 2, 1);
    px(g, 28, 16, COLORS.sandDark, 2, 1);
    px(g, 14, 30, COLORS.sandDark, 3, 1);

    // Wave-washed darker lines (subtle)
    px(g, 0, 12, 0xc8a888, S, 1);
    px(g, 0, 28, 0xc8a888, S, 1);

    // Small shell shapes (tiny spirals)
    px(g, 18, 7, 0xe8d0b0, 2, 2);
    px(g, 19, 7, 0xf0e0c0, 1, 1);
    px(g, 7, 22, 0xe8d0b0, 2, 2);
    px(g, 8, 22, 0xf0e0c0, 1, 1);

    // Pebble accents
    px(g, 26, 4, 0xb8a080, 2, 2);
    px(g, 12, 16, 0xb8a080, 2, 1);
    px(g, 4, 8, 0xb8a080, 1, 1);
    px(g, 22, 28, 0xb8a080, 2, 1);
  });

  // -- Water (32x32, static — no animation to avoid black spots) --
  makeTexture(scene, 'tile-water', S, S, (g) => {
    // Deep blue base
    g.fillStyle(0x2870b0);
    g.fillRect(0, 0, S, S);

    // Lighter center
    px(g, 4, 4, 0x3080c0, 24, 24);
    px(g, 6, 6, 0x3888c8, 20, 20);

    // Gentle ripple curves
    px(g, 5, 8, 0x48a0e0, 10, 1);
    px(g, 4, 9, 0x48a0e0, 2, 1);
    px(g, 15, 9, 0x48a0e0, 2, 1);
    px(g, 14, 16, 0x48a0e0, 12, 1);
    px(g, 13, 17, 0x48a0e0, 2, 1);
    px(g, 26, 17, 0x48a0e0, 2, 1);
    px(g, 8, 24, 0x48a0e0, 14, 1);
    px(g, 7, 25, 0x48a0e0, 2, 1);
    px(g, 22, 25, 0x48a0e0, 2, 1);

    // Subtle sparkle highlights
    px(g, 10, 6, 0x90d0ff, 2, 1);
    px(g, 11, 5, 0xb0e0ff, 1, 1);
    px(g, 22, 14, 0x90d0ff, 2, 1);
    px(g, 14, 22, 0x90d0ff, 2, 1);
    px(g, 6, 28, 0xb0e0ff, 1, 1);
  });

  // -- Path (32x32) --
  makeTexture(scene, 'tile-path', S, S, (g) => {
    // Dirt/stone base
    g.fillStyle(COLORS.pathBrown);
    g.fillRect(0, 0, S, S);

    // Worn center (lighter — foot traffic area)
    px(g, 8, 0, COLORS.pathLight, 16, S);
    px(g, 10, 0, 0xc0a080, 12, S);

    // Edges blending to grass
    px(g, 0, 0, 0x6a8050, 3, S);    // left grass edge
    px(g, 29, 0, 0x6a8050, 3, S);   // right grass edge
    px(g, 3, 0, 0x8a7858, 3, S);    // left blend
    px(g, 26, 0, 0x8a7858, 3, S);   // right blend

    // Stone/gravel detail on the path
    px(g, 10, 4, 0x908070, 3, 2);
    px(g, 18, 8, 0x908070, 4, 2);
    px(g, 12, 16, 0x908070, 3, 3);
    px(g, 20, 22, 0x908070, 2, 2);
    px(g, 14, 28, 0x908070, 3, 2);

    // Lighter gravel highlights
    px(g, 11, 4, 0xa89880, 1, 1);
    px(g, 19, 8, 0xa89880, 1, 1);
    px(g, 13, 16, 0xa89880, 1, 1);

    // Darker worn marks
    px(g, 15, 10, COLORS.pathDark, 4, 1);
    px(g, 12, 20, COLORS.pathDark, 5, 1);
    px(g, 16, 26, COLORS.pathDark, 3, 1);

    // Scattered small pebbles
    px(g, 8, 6, 0x807060, 1, 1);
    px(g, 22, 12, 0x807060, 1, 1);
    px(g, 10, 24, 0x807060, 1, 1);
    px(g, 24, 30, 0x807060, 1, 1);
  });

  // -- Wall (32x32) — brick pattern --
  makeTexture(scene, 'tile-wall', S, S, (g) => {
    // Base grey
    g.fillStyle(COLORS.wallGrey);
    g.fillRect(0, 0, S, S);

    // Horizontal mortar lines (every 8px)
    g.fillStyle(COLORS.wallDark);
    g.fillRect(0, 7, S, 1);
    g.fillRect(0, 15, S, 1);
    g.fillRect(0, 23, S, 1);
    g.fillRect(0, 31, S, 1);

    // Vertical mortar — offset per row (standard brick pattern)
    // Row 1 (y 0-6)
    px(g, 7, 0, COLORS.wallDark, 1, 7);
    px(g, 15, 0, COLORS.wallDark, 1, 7);
    px(g, 23, 0, COLORS.wallDark, 1, 7);
    px(g, 31, 0, COLORS.wallDark, 1, 7);
    // Row 2 (y 8-14) — offset by 4
    px(g, 3, 8, COLORS.wallDark, 1, 7);
    px(g, 11, 8, COLORS.wallDark, 1, 7);
    px(g, 19, 8, COLORS.wallDark, 1, 7);
    px(g, 27, 8, COLORS.wallDark, 1, 7);
    // Row 3 (y 16-22)
    px(g, 7, 16, COLORS.wallDark, 1, 7);
    px(g, 15, 16, COLORS.wallDark, 1, 7);
    px(g, 23, 16, COLORS.wallDark, 1, 7);
    px(g, 31, 16, COLORS.wallDark, 1, 7);
    // Row 4 (y 24-30) — offset
    px(g, 3, 24, COLORS.wallDark, 1, 7);
    px(g, 11, 24, COLORS.wallDark, 1, 7);
    px(g, 19, 24, COLORS.wallDark, 1, 7);
    px(g, 27, 24, COLORS.wallDark, 1, 7);

    // Light highlights on individual bricks (top-left of each)
    px(g, 1, 1, COLORS.wallLight, 5, 1);
    px(g, 9, 1, COLORS.wallLight, 5, 1);
    px(g, 17, 1, COLORS.wallLight, 5, 1);
    px(g, 25, 1, COLORS.wallLight, 5, 1);
    px(g, 5, 9, COLORS.wallLight, 5, 1);
    px(g, 13, 9, COLORS.wallLight, 5, 1);
    px(g, 21, 9, COLORS.wallLight, 5, 1);
    px(g, 1, 17, COLORS.wallLight, 5, 1);
    px(g, 9, 17, COLORS.wallLight, 5, 1);
    px(g, 17, 17, COLORS.wallLight, 5, 1);
    px(g, 25, 17, COLORS.wallLight, 5, 1);
    px(g, 5, 25, COLORS.wallLight, 5, 1);
    px(g, 13, 25, COLORS.wallLight, 5, 1);
    px(g, 21, 25, COLORS.wallLight, 5, 1);

    // Slight color variation per brick (subtle)
    px(g, 9, 2, 0x868696, 4, 4);
    px(g, 21, 10, 0x787888, 4, 4);
    px(g, 1, 18, 0x868696, 4, 4);
    px(g, 13, 26, 0x787888, 4, 4);
  });

  // -- Floor (32x32) — wooden planks --
  makeTexture(scene, 'tile-floor', S, S, (g) => {
    // Warm wood base
    g.fillStyle(COLORS.floorBeige);
    g.fillRect(0, 0, S, S);

    // Plank divisions (horizontal dark lines every 8px)
    g.fillStyle(0xa89868);
    g.fillRect(0, 7, S, 1);
    g.fillRect(0, 15, S, 1);
    g.fillRect(0, 23, S, 1);
    g.fillRect(0, 31, S, 1);

    // Wood grain lines (subtle horizontal streaks within each plank)
    px(g, 2, 2, 0xd4c4a0, 10, 1);
    px(g, 16, 3, 0xd4c4a0, 8, 1);
    px(g, 4, 10, 0xd4c4a0, 12, 1);
    px(g, 20, 11, 0xd4c4a0, 6, 1);
    px(g, 6, 18, 0xd4c4a0, 8, 1);
    px(g, 18, 19, 0xd4c4a0, 10, 1);
    px(g, 2, 26, 0xd4c4a0, 14, 1);
    px(g, 22, 27, 0xd4c4a0, 6, 1);

    // Darker grain accent lines
    px(g, 8, 4, 0xb0a078, 6, 1);
    px(g, 14, 12, 0xb0a078, 8, 1);
    px(g, 4, 20, 0xb0a078, 10, 1);
    px(g, 10, 28, 0xb0a078, 8, 1);

    // Knot details (small darker circles)
    px(g, 10, 4, 0xa09060, 2, 2);
    px(g, 11, 5, 0x968858, 1, 1);
    px(g, 24, 18, 0xa09060, 2, 2);
    px(g, 25, 19, 0x968858, 1, 1);

    // Left edge shadow
    g.fillStyle(0xb0a080);
    g.fillRect(0, 0, 1, S);
  });

  // -- House Wall (32x32) — warm cream drywall --
  makeTexture(scene, 'tile-house-wall', S, S, (g) => {
    // Warm cream drywall base
    g.fillStyle(COLORS.houseWall);
    g.fillRect(0, 0, S, S);

    // Subtle texture variation
    px(g, 0, 0, 0xe4dcd0, 16, 16);
    px(g, 16, 16, 0xece4d8, 16, 16);

    // Baseboard trim at bottom
    g.fillStyle(COLORS.houseWallDark);
    g.fillRect(0, 28, S, 4);
    px(g, 0, 27, 0xd0c8bc, S, 1); // top edge of baseboard

    // Crown molding at top
    px(g, 0, 0, COLORS.houseWallLight, S, 2);
    px(g, 0, 2, COLORS.houseWallDark, S, 1);

    // Very subtle wall texture
    px(g, 8, 10, 0xe0d8cc, 3, 1);
    px(g, 20, 16, 0xe0d8cc, 4, 1);
    px(g, 4, 22, 0xe0d8cc, 5, 1);
    px(g, 14, 8, 0xece4d8, 2, 1);
    px(g, 24, 20, 0xece4d8, 3, 1);
  });

  // -- Hardwood (32x32) — warm oak planks --
  makeTexture(scene, 'tile-hardwood', S, S, (g) => {
    // Rich warm oak base
    g.fillStyle(COLORS.hardwood);
    g.fillRect(0, 0, S, S);

    // Plank divisions (horizontal gaps)
    g.fillStyle(COLORS.hardwoodDark);
    g.fillRect(0, 7, S, 1);
    g.fillRect(0, 15, S, 1);
    g.fillRect(0, 23, S, 1);
    g.fillRect(0, 31, S, 1);

    // Staggered vertical seams (plank ends)
    px(g, 10, 0, COLORS.hardwoodDark, 1, 7);
    px(g, 22, 8, COLORS.hardwoodDark, 1, 7);
    px(g, 6, 16, COLORS.hardwoodDark, 1, 7);
    px(g, 18, 24, COLORS.hardwoodDark, 1, 7);

    // Wood grain (warm light streaks)
    px(g, 2, 2, COLORS.hardwoodLight, 6, 1);
    px(g, 14, 3, COLORS.hardwoodLight, 5, 1);
    px(g, 24, 10, COLORS.hardwoodLight, 4, 1);
    px(g, 8, 11, COLORS.hardwoodLight, 8, 1);
    px(g, 2, 18, COLORS.hardwoodLight, 3, 1);
    px(g, 12, 19, COLORS.hardwoodLight, 6, 1);
    px(g, 20, 26, COLORS.hardwoodLight, 5, 1);
    px(g, 4, 27, COLORS.hardwoodLight, 4, 1);

    // Darker grain accents
    px(g, 4, 4, 0x7a5830, 8, 1);
    px(g, 16, 12, 0x7a5830, 6, 1);
    px(g, 8, 20, 0x7a5830, 10, 1);
    px(g, 24, 28, 0x7a5830, 5, 1);

    // Knot detail
    px(g, 16, 4, 0x705030, 2, 2);
    px(g, 17, 5, 0x685028, 1, 1);
    px(g, 4, 26, 0x705030, 2, 2);

    // Subtle color variation per plank
    px(g, 12, 0, 0x907048, 8, 7);
    px(g, 0, 16, 0x866440, 6, 7);
  });

  // -- Counter (32x32) — dark granite --
  makeTexture(scene, 'tile-counter', S, S, (g) => {
    // Marble countertop — white/grey with veins
    // Base white marble
    px(g, 0, 0, 0xe8e4e0, S, S);
    // Subtle grey variation
    px(g, 0, 0, 0xe0dcd8, S, S / 2);
    px(g, 0, S / 2, 0xeae6e2, S, S / 2);
    // Marble veins — thin grey/blue lines
    px(g, 3, 2, 0xc8c4c0, 8, 1);
    px(g, 5, 3, 0xd0ccc8, 6, 1);
    px(g, 8, 5, 0xc0bab4, 10, 1);
    px(g, 12, 6, 0xc8c0b8, 7, 1);
    px(g, 2, 10, 0xd0c8c0, 12, 1);
    px(g, 6, 11, 0xc4beb8, 8, 1);
    px(g, 1, 14, 0xc8c4c0, 14, 1);
    // Front edge — polished look
    px(g, 0, S - 2, 0xd8d4d0, S, 1);
    px(g, 0, S - 1, 0xc0bcb8, S, 1);
    // Subtle warm highlight
    px(g, 4, 8, 0xf0ece8, 3, 1);
    px(g, 10, 3, 0xf0ece8, 4, 1);
  });

  // -- Dark Floor (32x32) — concrete/stone --
  makeTexture(scene, 'tile-dark-floor', S, S, (g) => {
    // Dark stone base
    g.fillStyle(COLORS.darkFloor);
    g.fillRect(0, 0, S, S);

    // Grid lines (tile edges)
    g.fillStyle(0x383040);
    g.fillRect(0, 0, S, 1);
    g.fillRect(0, 0, 1, S);
    g.fillRect(0, 15, S, 1);
    g.fillRect(15, 0, 1, S);

    // Cracks
    px(g, 8, 4, 0x3a3240, 1, 6);
    px(g, 9, 9, 0x3a3240, 1, 4);
    px(g, 22, 18, 0x3a3240, 1, 8);
    px(g, 23, 25, 0x3a3240, 1, 4);
    px(g, 14, 22, 0x3a3240, 5, 1);

    // Stain patterns (lighter/darker patches)
    px(g, 4, 4, 0x504860, 4, 4);
    px(g, 20, 8, 0x504860, 5, 3);
    px(g, 10, 20, 0x544c64, 6, 4);
    px(g, 24, 26, 0x403848, 4, 3);

    // Subtle texture dots
    px(g, 6, 12, 0x423a52, 1, 1);
    px(g, 18, 6, 0x423a52, 1, 1);
    px(g, 28, 14, 0x423a52, 1, 1);
    px(g, 12, 28, 0x423a52, 1, 1);
    px(g, 2, 22, 0x504860, 1, 1);
    px(g, 26, 4, 0x504860, 1, 1);

    // Scuff marks (shoe marks — slightly lighter streaks)
    px(g, 16, 14, 0x585068, 6, 1);
    px(g, 17, 15, 0x565066, 4, 1);
    px(g, 6, 26, 0x585068, 5, 1);
    px(g, 24, 8, 0x565066, 3, 1);

    // Drain hole (small dark circle in corner area)
    px(g, 14, 14, 0x282030, 2, 2);
    px(g, 13, 15, 0x302838, 1, 1);
    px(g, 16, 15, 0x302838, 1, 1);
    px(g, 15, 13, 0x302838, 1, 1);
  });

  // -- Dirt (32x32) --
  makeTexture(scene, 'tile-dirt', S, S, (g) => {
    // Rich brown earth base
    g.fillStyle(COLORS.dirtBrown);
    g.fillRect(0, 0, S, S);

    // Clump texture — lighter/darker earth patches
    px(g, 4, 4, 0xa88860, 5, 2);
    px(g, 18, 8, 0xa88860, 4, 2);
    px(g, 2, 16, 0xa88860, 6, 2);
    px(g, 24, 22, 0xa88860, 4, 2);
    px(g, 10, 28, 0xa88860, 5, 2);

    px(g, 12, 2, 0x8a6a40, 3, 1);
    px(g, 26, 6, 0x8a6a40, 4, 1);
    px(g, 8, 14, 0x8a6a40, 5, 1);
    px(g, 20, 18, 0x8a6a40, 3, 1);
    px(g, 4, 26, 0x8a6a40, 4, 1);

    // Tilled furrow lines (every 10px)
    g.fillStyle(0x7a5a30);
    g.fillRect(0, 9, S, 1);
    g.fillRect(0, 19, S, 1);
    g.fillRect(0, 29, S, 1);

    // Small root/worm details
    px(g, 14, 6, 0x6a4a20, 3, 1);
    px(g, 15, 7, 0x6a4a20, 1, 2);
    px(g, 22, 14, 0x6a4a20, 2, 1);
    px(g, 23, 15, 0x6a4a20, 1, 1);
    px(g, 6, 24, 0x6a4a20, 4, 1);
    px(g, 9, 25, 0x6a4a20, 1, 1);

    // Scattered small stones
    px(g, 8, 4, 0x807060, 2, 1);
    px(g, 28, 12, 0x807060, 2, 1);
    px(g, 16, 24, 0x807060, 1, 1);
  });

  // -- Concrete / Road (32x32 dark asphalt) --
  makeTexture(scene, 'tile-concrete', S, S, (g) => {
    // Dark asphalt base
    g.fillStyle(0x404048);
    g.fillRect(0, 0, S, S);

    // Texture variation (slightly lighter patches)
    px(g, 4, 4, 0x484850, 6, 3);
    px(g, 18, 10, 0x484850, 8, 3);
    px(g, 2, 20, 0x484850, 5, 2);
    px(g, 24, 26, 0x484850, 6, 3);
    px(g, 10, 16, 0x484850, 4, 2);

    // Darker patches (wear marks / oil stains)
    px(g, 12, 2, 0x383840, 4, 2);
    px(g, 22, 8, 0x383840, 3, 3);
    px(g, 6, 14, 0x383840, 2, 3);
    px(g, 26, 18, 0x383840, 4, 2);
    px(g, 14, 26, 0x383840, 3, 2);

    // Crack lines (diagonal feel)
    px(g, 8, 6, 0x353538, 1, 4);
    px(g, 9, 9, 0x353538, 1, 3);
    px(g, 10, 11, 0x353538, 1, 2);
    px(g, 20, 18, 0x353538, 1, 5);
    px(g, 21, 22, 0x353538, 1, 3);

    // Tar patches (slightly warmer dark)
    px(g, 16, 6, 0x3a3838, 3, 2);
    px(g, 4, 24, 0x3a3838, 4, 2);

    // Subtle aggregate dots (road surface texture)
    px(g, 6, 2, 0x464650, 1, 1);
    px(g, 14, 8, 0x464650, 1, 1);
    px(g, 28, 4, 0x464650, 1, 1);
    px(g, 2, 28, 0x464650, 1, 1);
    px(g, 20, 30, 0x464650, 1, 1);
    px(g, 30, 16, 0x464650, 1, 1);

    // Expansion joints (thin scored lines forming grid)
    g.fillStyle(0x383840);
    g.fillRect(15, 0, 1, S);  // vertical joint
    g.fillRect(0, 15, S, 1);  // horizontal joint
    // Joint highlight (slight bevel)
    g.fillStyle(0x4a4a52);
    g.fillRect(16, 0, 1, S);
    g.fillRect(0, 16, S, 1);

    // Color variation patches (slightly warmer/cooler concrete)
    px(g, 2, 2, 0x444850, 6, 4);
    px(g, 20, 20, 0x424440, 5, 4);
    px(g, 8, 22, 0x464450, 4, 3);
  });

  // -- Door (32x32) --
  makeTexture(scene, 'tile-door', S, S, (g) => {
    // Door frame
    g.fillStyle(0x705030);
    g.fillRect(0, 0, S, S);

    // Main door surface
    g.fillStyle(0x905830);
    g.fillRect(3, 2, 26, 28);

    // Top panels (two side by side)
    g.fillStyle(0x804820);
    g.fillRect(5, 3, 9, 10);
    g.fillRect(18, 3, 9, 10);

    // Bottom panels
    g.fillRect(5, 16, 9, 12);
    g.fillRect(18, 16, 9, 12);

    // Panel bevels (light top edge, dark bottom edge)
    px(g, 5, 3, 0xa06830, 9, 1);
    px(g, 18, 3, 0xa06830, 9, 1);
    px(g, 5, 16, 0xa06830, 9, 1);
    px(g, 18, 16, 0xa06830, 9, 1);
    px(g, 5, 12, 0x704018, 9, 1);
    px(g, 18, 12, 0x704018, 9, 1);
    px(g, 5, 27, 0x704018, 9, 1);
    px(g, 18, 27, 0x704018, 9, 1);

    // Wood grain lines on panels
    px(g, 7, 5, 0x8a5428, 5, 1);
    px(g, 7, 8, 0x8a5428, 4, 1);
    px(g, 20, 6, 0x8a5428, 5, 1);
    px(g, 20, 9, 0x8a5428, 4, 1);
    px(g, 7, 19, 0x8a5428, 6, 1);
    px(g, 7, 23, 0x8a5428, 4, 1);
    px(g, 20, 20, 0x8a5428, 5, 1);
    px(g, 20, 24, 0x8a5428, 4, 1);

    // Door handle / knob (gold)
    px(g, 22, 14, 0xd0c030, 2, 3);
    px(g, 23, 14, 0xe0d050, 1, 1); // highlight
    px(g, 22, 16, 0xb0a020, 2, 1); // shadow

    // Hinges (left side)
    px(g, 3, 6, 0x606060, 2, 2);
    px(g, 3, 22, 0x606060, 2, 2);
  });

  // -- Tree (32x32) --
  makeTexture(scene, 'tile-tree', S, S, (g) => {
    // Ground shadow (ellipse shape)
    px(g, 8, 28, 0x2a5020, 16, 2);
    px(g, 10, 30, 0x2a5020, 12, 2);

    // Trunk — tapered, with bark detail
    px(g, 14, 18, 0x6a5030, 4, 14); // main trunk
    px(g, 15, 18, 0x7a6040, 2, 14); // bark highlight center
    px(g, 13, 22, 0x5a4020, 1, 6);  // left bark shadow
    px(g, 18, 22, 0x5a4020, 1, 6);  // right bark shadow
    // Bark texture lines
    px(g, 14, 21, 0x5a4020, 4, 1);
    px(g, 15, 24, 0x5a4020, 2, 1);
    px(g, 14, 27, 0x5a4020, 4, 1);
    // Root flare
    px(g, 12, 30, 0x6a5030, 2, 2);
    px(g, 18, 30, 0x6a5030, 2, 2);

    // Canopy — built up in layers for round shape with depth
    // Deep shadow layer (bottom of canopy)
    px(g, 7, 16, 0x1a6020, 18, 3);
    px(g, 5, 15, 0x1a6020, 22, 2);

    // Main canopy (dark green base)
    px(g, 9, 5, 0x287028, 14, 2);   // very top
    px(g, 7, 7, 0x287028, 18, 2);   // upper
    px(g, 5, 9, 0x2a7a2a, 22, 2);   // upper-mid
    px(g, 4, 11, 0x2a7a2a, 24, 2);  // mid
    px(g, 4, 13, 0x287028, 24, 2);  // lower-mid
    px(g, 6, 15, 0x206020, 20, 2);  // lower

    // Light canopy patches (sun-facing top)
    px(g, 10, 5, 0x40a040, 6, 2);
    px(g, 14, 4, 0x48b048, 4, 1);   // bright top center
    px(g, 8, 8, 0x38a038, 5, 2);    // upper left light
    px(g, 19, 7, 0x38a038, 4, 2);   // upper right light
    px(g, 12, 10, 0x40a040, 6, 2);  // center light
    px(g, 7, 12, 0x38a038, 4, 2);   // left light
    px(g, 21, 11, 0x38a038, 3, 2);  // right light

    // Highlight dots (leaf tips catching light)
    px(g, 12, 5, 0x50c050, 2, 1);
    px(g, 16, 4, 0x50c050, 1, 1);
    px(g, 9, 8, 0x50c050, 1, 1);
    px(g, 22, 9, 0x50c050, 1, 1);
    px(g, 14, 11, 0x50c050, 2, 1);
    px(g, 8, 13, 0x50c050, 1, 1);

    // Dark gaps (depth between leaf clusters)
    px(g, 11, 7, 0x1a5818, 1, 1);
    px(g, 18, 9, 0x1a5818, 1, 1);
    px(g, 13, 12, 0x1a5818, 1, 1);
    px(g, 23, 13, 0x1a5818, 1, 1);
    px(g, 7, 10, 0x1a5818, 1, 1);
  });

  // -- Palm Tree (32x32) --
  makeTexture(scene, 'tile-palm', S, S, (g) => {
    // Ground shadow
    px(g, 10, 30, 0x2a5020, 12, 2);

    // Curved trunk — slight lean for natural feel
    px(g, 15, 14, 0x907050, 3, 18); // main trunk
    px(g, 14, 16, 0x907050, 1, 14); // left edge
    px(g, 18, 16, 0x907050, 1, 12); // right edge
    px(g, 16, 14, 0xa08868, 1, 16); // highlight stripe
    // Ring marks (coconut palm texture)
    px(g, 14, 17, 0x706040, 5, 1);
    px(g, 14, 20, 0x706040, 5, 1);
    px(g, 14, 23, 0x706040, 5, 1);
    px(g, 14, 26, 0x706040, 5, 1);
    px(g, 15, 29, 0x706040, 3, 1);

    // Coconut cluster at top
    px(g, 14, 12, 0x8a6a30, 3, 2);
    px(g, 15, 11, 0x7a5a28, 1, 1);

    // Fronds — spread outward from center, each is a thin tapered line
    // Left frond (drooping)
    px(g, 4, 4, 0x30a030, 10, 1);
    px(g, 2, 5, 0x28902a, 9, 1);
    px(g, 1, 6, 0x28902a, 7, 1);
    px(g, 0, 7, 0x208020, 5, 1);
    px(g, 0, 8, 0x208020, 3, 1);

    // Right frond (drooping)
    px(g, 18, 3, 0x30a030, 10, 1);
    px(g, 20, 4, 0x28902a, 10, 1);
    px(g, 23, 5, 0x28902a, 7, 1);
    px(g, 25, 6, 0x208020, 5, 1);
    px(g, 27, 7, 0x208020, 3, 1);

    // Top frond (upward)
    px(g, 13, 1, 0x38b038, 6, 1);
    px(g, 12, 2, 0x30a030, 8, 1);
    px(g, 10, 3, 0x30a030, 12, 1);
    px(g, 9, 4, 0x28902a, 4, 1);
    px(g, 19, 4, 0x28902a, 4, 1);

    // Back-left frond
    px(g, 6, 2, 0x28902a, 8, 1);
    px(g, 3, 3, 0x208020, 6, 1);
    px(g, 1, 4, 0x208020, 3, 1);

    // Back-right frond
    px(g, 18, 1, 0x28902a, 8, 1);
    px(g, 22, 2, 0x208020, 7, 1);
    px(g, 26, 3, 0x208020, 4, 1);

    // Frond highlight tips
    px(g, 14, 0, 0x48c048, 4, 1);
    px(g, 5, 4, 0x48c048, 2, 1);
    px(g, 25, 3, 0x48c048, 2, 1);
  });

  // -- Vine / Vineyard Trellis Row (32x32) --
  makeTexture(scene, 'tile-vine', S, S, (g) => {
    // Central wooden trellis post (4px wide, full height)
    g.fillStyle(0x6a5030);
    g.fillRect(14, 0, 4, S);
    // Post highlight
    px(g, 14, 0, 0x7a6040, 2, S);
    // Post grain lines
    px(g, 15, 4, 0x5a4020, 1, 2);
    px(g, 15, 12, 0x5a4020, 1, 2);
    px(g, 15, 20, 0x5a4020, 1, 2);
    px(g, 15, 28, 0x5a4020, 1, 2);

    // Horizontal wires
    px(g, 0, 4, 0x808080, S, 1);   // top wire
    px(g, 0, 16, 0x808080, S, 1);  // middle wire
    px(g, 0, 5, 0x909090, S, 1);   // wire highlight

    // Green leaf clusters — left side
    px(g, 1, 2, 0x408030, 6, 3);
    px(g, 0, 6, 0x509040, 8, 3);
    px(g, 2, 10, 0x306820, 6, 3);
    px(g, 0, 14, 0x408030, 7, 3);
    px(g, 1, 18, 0x509040, 6, 3);
    px(g, 0, 22, 0x306820, 8, 3);
    px(g, 2, 26, 0x408030, 5, 3);
    px(g, 1, 30, 0x509040, 6, 2);

    // Green leaf clusters — right side
    px(g, 24, 1, 0x509040, 6, 3);
    px(g, 22, 5, 0x306820, 8, 3);
    px(g, 24, 9, 0x408030, 6, 3);
    px(g, 22, 13, 0x509040, 7, 3);
    px(g, 24, 17, 0x306820, 6, 3);
    px(g, 22, 21, 0x408030, 8, 3);
    px(g, 24, 25, 0x509040, 5, 3);
    px(g, 22, 29, 0x306820, 6, 3);

    // Leaf detail — individual leaf veins
    px(g, 5, 3, 0x60a850, 1, 1);
    px(g, 8, 8, 0x60a850, 1, 1);
    px(g, 3, 15, 0x60a850, 1, 1);
    px(g, 10, 20, 0x60a850, 1, 1);
    px(g, 26, 3, 0x60a850, 1, 1);
    px(g, 28, 12, 0x60a850, 1, 1);
    px(g, 25, 22, 0x60a850, 1, 1);

    // Purple grape clusters (3x3 each, multiple berries)
    px(g, 3, 7, 0x604080, 3, 3);
    px(g, 4, 8, 0x705090, 2, 2);
    px(g, 3, 7, 0x806098, 1, 1);    // highlight

    px(g, 2, 19, 0x705090, 3, 3);
    px(g, 3, 20, 0x604080, 2, 2);
    px(g, 2, 19, 0x806098, 1, 1);

    px(g, 26, 8, 0x705090, 3, 3);
    px(g, 27, 9, 0x604080, 2, 2);
    px(g, 26, 8, 0x806098, 1, 1);

    px(g, 25, 20, 0x604080, 3, 3);
    px(g, 26, 21, 0x705090, 2, 2);
    px(g, 25, 20, 0x806098, 1, 1);

    // Extra grape clusters for density
    px(g, 5, 27, 0x604080, 2, 2);
    px(g, 5, 27, 0x806098, 1, 1);
    px(g, 27, 27, 0x705090, 2, 2);
    px(g, 27, 27, 0x806098, 1, 1);
  });

  // -- Fence (32x32) --
  makeTexture(scene, 'tile-fence', S, S, (g) => {
    // Left post
    g.fillStyle(0x907050);
    g.fillRect(2, 3, 5, 28);
    // Right post
    g.fillRect(25, 3, 5, 28);

    // Post tops (beveled)
    px(g, 2, 2, 0xb09070, 5, 1);
    px(g, 25, 2, 0xb09070, 5, 1);

    // Horizontal rails
    g.fillStyle(0xa08060);
    g.fillRect(0, 8, S, 3);
    g.fillRect(0, 20, S, 3);

    // Rail highlights (top edge of each rail)
    px(g, 0, 8, 0xb89878, S, 1);
    px(g, 0, 20, 0xb89878, S, 1);

    // Rail shadow (bottom edge)
    px(g, 0, 10, 0x886848, S, 1);
    px(g, 0, 22, 0x886848, S, 1);

    // Wood grain on posts
    px(g, 3, 6, 0x806040, 1, 6);
    px(g, 5, 12, 0x806040, 1, 5);
    px(g, 3, 20, 0x806040, 1, 4);
    px(g, 26, 6, 0x806040, 1, 6);
    px(g, 28, 14, 0x806040, 1, 5);
    px(g, 26, 24, 0x806040, 1, 4);

    // Nail / joint details
    px(g, 4, 8, 0x505050, 1, 1);
    px(g, 4, 20, 0x505050, 1, 1);
    px(g, 27, 8, 0x505050, 1, 1);
    px(g, 27, 20, 0x505050, 1, 1);

    // Post shadows on right side
    px(g, 6, 4, 0x806040, 1, 26);
    px(g, 29, 4, 0x806040, 1, 26);
  });

  // -- Computer (32x32) --
  makeTexture(scene, 'tile-computer', S, S, (g) => {
    // Desk surface
    g.fillStyle(0x806040);
    g.fillRect(0, 20, S, 12);
    px(g, 0, 20, 0x906848, S, 1); // desk top edge highlight
    // Desk front edge shadow
    px(g, 0, 31, 0x604020, S, 1);
    // Desk legs
    px(g, 1, 28, 0x604020, 3, 4);
    px(g, 28, 28, 0x604020, 3, 4);

    // Monitor bezel (dark grey frame)
    g.fillStyle(0x404050);
    g.fillRect(4, 1, 24, 16);
    // Monitor inner bevel
    px(g, 4, 1, 0x505060, 24, 1);  // top highlight
    px(g, 4, 16, 0x303040, 24, 1); // bottom shadow

    // Screen
    g.fillStyle(0x3060a0);
    g.fillRect(6, 3, 20, 12);

    // Screen content — code lines
    px(g, 8, 4, 0x60c060, 8, 1);   // green code line 1
    px(g, 8, 6, 0x60c060, 12, 1);  // green code line 2
    px(g, 8, 8, 0x60c060, 6, 1);   // green code line 3
    px(g, 10, 10, 0x60c060, 10, 1); // green code line 4 (indented)
    px(g, 8, 12, 0x60c060, 4, 1);  // green code line 5
    // Cursor
    px(g, 12, 12, 0x80e080, 2, 1);
    // Window bar at top
    px(g, 6, 3, 0x405880, 20, 1);
    px(g, 22, 3, 0xc04040, 2, 1); // close button
    px(g, 20, 3, 0xe0c040, 2, 1); // minimize button

    // Monitor stand
    px(g, 12, 17, 0x404050, 8, 2);
    px(g, 14, 19, 0x404050, 4, 1);

    // Keyboard
    g.fillStyle(0x505060);
    g.fillRect(5, 22, 22, 4);
    px(g, 6, 22, 0x606070, 20, 1); // key row highlight
    // Individual key suggestion
    px(g, 7, 23, 0x606878, 2, 1);
    px(g, 10, 23, 0x606878, 2, 1);
    px(g, 13, 23, 0x606878, 2, 1);
    px(g, 16, 23, 0x606878, 2, 1);
    px(g, 19, 23, 0x606878, 2, 1);
    px(g, 22, 23, 0x606878, 2, 1);
    px(g, 9, 24, 0x606878, 8, 1); // spacebar

    // Mouse (right of keyboard)
    px(g, 28, 23, 0x505060, 2, 3);
    px(g, 28, 23, 0x606070, 2, 1);
  });

  // -- Tractor (32x32 D8 Cat Bulldozer — Caterpillar Yellow) --
  makeTexture(scene, 'tile-tractor', S, S, (g) => {
    // Main body — Caterpillar yellow
    g.fillStyle(0xd0a020);
    g.fillRect(5, 5, 22, 12);
    px(g, 6, 4, 0xe0b830, 20, 1); // top highlight
    px(g, 5, 16, 0xb89018, 22, 1); // bottom shadow

    // Cab / window area
    g.fillStyle(0x80c0e0);
    g.fillRect(7, 5, 8, 7);
    // Window frame
    px(g, 7, 5, 0xa0a0b0, 8, 1);
    px(g, 7, 11, 0xa0a0b0, 8, 1);
    px(g, 7, 5, 0xa0a0b0, 1, 7);
    px(g, 14, 5, 0xa0a0b0, 1, 7);
    // Window cross-bar
    px(g, 10, 5, 0xa0a0b0, 1, 7);

    // Engine/hood (right side)
    g.fillStyle(0xb08818);
    g.fillRect(17, 7, 10, 8);
    px(g, 18, 8, 0xc09820, 8, 1); // hood highlight
    // Grille lines
    px(g, 26, 8, 0x808080, 1, 6);
    px(g, 18, 10, 0xa08010, 8, 1);
    px(g, 18, 12, 0xa08010, 8, 1);

    // Exhaust stack
    px(g, 26, 3, 0x606060, 2, 4);
    px(g, 26, 2, 0x707070, 2, 1);
    px(g, 27, 1, 0x505050, 1, 2); // smoke

    // Tracks/treads (left side — big)
    g.fillStyle(0x303030);
    g.fillRect(4, 18, 14, 12);
    // Tread detail
    px(g, 5, 19, 0x505050, 12, 10); // inner
    px(g, 6, 20, 0x404040, 10, 8);  // hub area
    px(g, 8, 22, 0x505050, 6, 4);   // center hub
    px(g, 10, 23, 0x303030, 2, 2);  // axle
    // Tread teeth
    px(g, 4, 20, 0x383838, 1, 2);
    px(g, 4, 23, 0x383838, 1, 2);
    px(g, 4, 26, 0x383838, 1, 2);
    px(g, 17, 20, 0x383838, 1, 2);
    px(g, 17, 23, 0x383838, 1, 2);
    px(g, 17, 26, 0x383838, 1, 2);

    // Front wheel (smaller)
    g.fillStyle(0x303030);
    g.fillRect(22, 22, 8, 8);
    px(g, 23, 23, 0x505050, 6, 6);
    px(g, 25, 25, 0x303030, 2, 2);

    // Axle connecting
    px(g, 18, 24, 0x606060, 4, 2);

    // CAT text hint (tiny yellow on side)
    px(g, 8, 8, 0xe0c030, 3, 1);
  });

  // -- Building Wall (32x32 exterior) --
  makeTexture(scene, 'tile-building-wall', S, S, (g) => {
    // Stucco/stone base
    g.fillStyle(0xa09888);
    g.fillRect(0, 0, S, S);

    // Brick/stone pattern — horizontal mortar every 8px
    g.fillStyle(0x908878);
    g.fillRect(0, 7, S, 1);
    g.fillRect(0, 15, S, 1);
    g.fillRect(0, 23, S, 1);
    g.fillRect(0, 31, S, 1);
    // Vertical mortar — offset per row
    px(g, 8, 0, 0x908878, 1, 7);
    px(g, 24, 0, 0x908878, 1, 7);
    px(g, 0, 8, 0x908878, 1, 7);
    px(g, 16, 8, 0x908878, 1, 7);
    px(g, 8, 16, 0x908878, 1, 7);
    px(g, 24, 16, 0x908878, 1, 7);
    px(g, 0, 24, 0x908878, 1, 7);
    px(g, 16, 24, 0x908878, 1, 7);

    // Stone highlights (top-left of each block)
    px(g, 1, 0, 0xb0a898, 6, 1);
    px(g, 10, 0, 0xb0a898, 12, 1);
    px(g, 2, 8, 0xb0a898, 12, 1);
    px(g, 18, 8, 0xb0a898, 12, 1);
    px(g, 1, 16, 0xb0a898, 6, 1);
    px(g, 10, 16, 0xb0a898, 12, 1);
    px(g, 2, 24, 0xb0a898, 12, 1);
    px(g, 18, 24, 0xb0a898, 12, 1);

    // Weathering / darker patches
    px(g, 4, 2, 0x988878, 3, 3);
    px(g, 20, 10, 0x988878, 4, 3);
    px(g, 10, 18, 0x988878, 3, 3);
    px(g, 26, 26, 0x988878, 4, 3);

    // Small window detail (cross-bar window)
    px(g, 10, 2, 0x4a6a8a, 5, 4);  // window glass
    px(g, 12, 2, 0x908878, 1, 4);  // vertical bar
    px(g, 10, 3, 0x908878, 5, 1);  // horizontal bar
    px(g, 10, 2, 0xb0a898, 5, 1);  // window top trim
    px(g, 10, 5, 0x807868, 5, 1);  // window bottom trim
  });

  // -- Jail Bars (32x32) — vertical steel bars with gap between --
  makeTexture(scene, 'tile-jail-bar', S, S, (g) => {
    // Dark floor background shows through (this is an overlay tile)
    // Vertical bars every 8px
    for (let bx = 2; bx < S; bx += 8) {
      // Bar body (steel grey)
      g.fillStyle(0x606068);
      g.fillRect(bx, 0, 3, S);
      // Highlight on left edge
      g.fillStyle(0x808088);
      g.fillRect(bx, 0, 1, S);
      // Shadow on right edge
      g.fillStyle(0x404048);
      g.fillRect(bx + 2, 0, 1, S);
    }
    // Horizontal crossbar at top and bottom
    g.fillStyle(0x505058);
    g.fillRect(0, 1, S, 3);
    g.fillRect(0, S - 4, S, 3);
    // Crossbar highlights
    g.fillStyle(0x707078);
    g.fillRect(0, 1, S, 1);
    g.fillRect(0, S - 4, S, 1);
  });

  // --- tile-carpet --- (soft beige/tan carpet for bedrooms)
  makeTexture(scene, 'tile-carpet', S, S, (g) => {
    // Base carpet color — warm beige
    px(g, 0, 0, 0xc8b8a0, S, S);
    // Carpet texture — subtle fiber pattern
    for (let y = 0; y < S; y += 2) {
      for (let x = 0; x < S; x += 3) {
        const shade = Math.random() > 0.5 ? 0xc4b49c : 0xccbca4;
        px(g, x, y, shade, 1, 1);
      }
    }
    // Slightly darker edges for tile separation
    px(g, 0, 0, 0xb8a890, S, 1);
    px(g, 0, 0, 0xb8a890, 1, S);
  });
}

// ─── UI ELEMENTS ────────────────────────────────────────────────────

function generateUI(scene: Phaser.Scene) {
  // Dialogue box — 800x150
  makeTexture(scene, 'dialogue-box', GAME_WIDTH, 150, (g) => {
    const w = GAME_WIDTH;
    const h = 150;

    // Outer border (lighter)
    g.fillStyle(COLORS.dialogueBorder);
    g.fillRect(0, 0, w, h);

    // Inner background
    g.fillStyle(COLORS.dialogueBg);
    g.fillRect(3, 3, w - 6, h - 6);

    // Inner highlight border
    g.fillStyle(0x2a2a4e);
    g.fillRect(4, 4, w - 8, 1);
    g.fillRect(4, 4, 1, h - 8);

    // Bottom/right shadow
    g.fillStyle(0x101020);
    g.fillRect(4, h - 5, w - 8, 1);
    g.fillRect(w - 5, 4, 1, h - 8);

    // Corner accents (Pokemon-style rounded corners with lighter pixels)
    const accent = 0x4a4a6e;
    // Top-left
    px(g, 0, 0, 0x000000, 2, 2);
    px(g, 2, 0, accent);
    px(g, 0, 2, accent);
    // Top-right
    px(g, w - 2, 0, 0x000000, 2, 2);
    px(g, w - 3, 0, accent);
    px(g, w - 1, 2, accent);
    // Bottom-left
    px(g, 0, h - 2, 0x000000, 2, 2);
    px(g, 2, h - 1, accent);
    px(g, 0, h - 3, accent);
    // Bottom-right
    px(g, w - 2, h - 2, 0x000000, 2, 2);
    px(g, w - 3, h - 1, accent);
    px(g, w - 1, h - 3, accent);
  });

  // Arrow down indicator
  makeTexture(scene, 'arrow-down', 12, 8, (g) => {
    g.fillStyle(0xffffff);
    g.fillRect(2, 0, 8, 2);
    g.fillRect(3, 2, 6, 2);
    g.fillRect(4, 4, 4, 2);
    g.fillRect(5, 6, 2, 2);
  });
}

// ─── CHAPTER PLAYER OUTFITS ─────────────────────────────────────────

function generateChapterOutfits(scene: Phaser.Scene) {
  const frameW = CHAR_SIZE;
  const frameH = CHAR_SIZE;
  const sheetW = frameW * 8;

  const outfits: { key: string; colors: OutfitColors }[] = [
    {
      key: 'player-ch0',
      colors: { shirt: 0x808088, shirtLight: 0x909098, pants: 0x404050, pantsLight: 0x505060, shoe: 0x383838 },
    },
    {
      key: 'player-ch1',
      colors: { shirt: 0xf0f0f0, shirtLight: 0xe0e0e0, pants: 0x303038, pantsLight: 0x404048, shoe: 0x303030 },
    },
    {
      key: 'player-ch2',
      colors: { shirt: 0x202028, shirtLight: 0x2a2a32, pants: 0x1a1a20, pantsLight: 0x242428, shoe: 0x303030 },
    },
    {
      key: 'player-ch3',
      colors: { shirt: 0xd07020, shirtLight: 0xc06018, pants: 0xd07020, pantsLight: 0xc06018, shoe: 0x606060 },
    },
    {
      key: 'player-ch4',
      colors: { shirt: 0x8a7a50, shirtLight: 0x9a8a60, pants: 0x5a6a80, pantsLight: 0x6a7a90, shoe: 0x504030 },
    },
    {
      key: 'player-ch5',
      colors: { shirt: 0x8B7355, shirtLight: 0x9B8365, pants: 0x3B4050, pantsLight: 0x4B5060, shoe: 0x5C4033 },
    },
    {
      key: 'player-ch6',
      colors: { shirt: 0x6B6B75, shirtLight: 0x7B7B85, pants: 0x2B3B5B, pantsLight: 0x3B4B6B, shoe: 0xE0E0E0 },
    },
    {
      // Ch7 Operator — white tee, black jeans, clean
      key: 'player-ch7',
      colors: { shirt: 0xF0F0F0, shirtLight: 0xE8E8E8, pants: 0x1a1a1a, pantsLight: 0x2a2a2a, shoe: 0xF0F0F0 },
    },
    {
      // Swim trunks — "shirt" is skin tone (shirtless), blue trunks
      key: 'player-swim',
      colors: { shirt: 0xd4a870, shirtLight: 0xdcb480, pants: 0x2060b0, pantsLight: 0x3070c0, shoe: 0xd4a870 },
    },
  ];

  const directions: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];

  for (const { key, colors } of outfits) {
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = frameH;
    const rawCtx = canvas.getContext('2d')!;
    rawCtx.clearRect(0, 0, sheetW, frameH);
    const dc = new DrawContext(rawCtx);

    let frameIndex = 0;
    for (const dir of directions) {
      drawPlayerFrame32(dc, frameIndex * frameW, dir, false, colors);
      frameIndex++;
      drawPlayerFrame32(dc, frameIndex * frameW, dir, true, colors);
      frameIndex++;
    }

    scene.textures.addCanvas(key, canvas);
    const texture = scene.textures.get(key);
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH);
    }
  }
}

// ─── TIRED PLAYER (Ch3 — messy hair, bags under eyes) ────────────────

function generateTiredPlayer(scene: Phaser.Scene) {
  if (scene.textures.exists('player-ch3-tired')) return;

  const frameW = CHAR_SIZE;
  const sheetW = frameW * 8;
  const sheetH = frameW;
  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const rawCtx = canvas.getContext('2d')!;
  rawCtx.clearRect(0, 0, sheetW, sheetH);
  const dc = new DrawContext(rawCtx);

  // Draw base ch2 outfit frames (black hoodie) at 32x32
  const outfit: OutfitColors = {
    shirt: 0x202028, shirtLight: 0x2a2a32,
    pants: 0x1a1a20, pantsLight: 0x242428,
    shoe: 0x303030,
  };
  const directions: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];
  let fi = 0;
  for (const dir of directions) {
    drawPlayerFrame32(dc, fi * frameW, dir, false, outfit);
    fi++;
    drawPlayerFrame32(dc, fi * frameW, dir, true, outfit);
    fi++;
  }

  const hair = 0x302020;
  const bagColor = 0x604850;

  // Overlay messy hair + tired eyes on each frame (scaled to 32x32 positions)
  for (let f = 0; f < 8; f++) {
    const ox = f * frameW;
    const dir = (['down', 'down', 'up', 'up', 'left', 'left', 'right', 'right'] as const)[f];

    // Extra shaggy hair — bangs hanging lower, longer strands at 32px
    px(dc, ox + 7, 5, hair, 4, 1);   // left bangs extending down
    px(dc, ox + 21, 5, hair, 4, 1);  // right bangs extending down
    px(dc, ox + 10, 5, hair, 2, 1);  // center-left messy strand
    px(dc, ox + 9, 4, hair, 8, 1);   // thick messy top layer
    // Stray strands hanging further
    px(dc, ox + 5, 6, hair, 2, 1);   // far left strand
    px(dc, ox + 25, 6, hair, 2, 1);  // far right strand
    px(dc, ox + 8, 3, hair, 4, 1);   // extra messy top
    px(dc, ox + 18, 3, hair, 3, 1);  // extra messy top right

    if (dir === 'down') {
      // Dark circles under eyes (row 9, under the eye positions at row 7-8)
      px(dc, ox + 10, 9, bagColor, 4, 1); // under left eye
      px(dc, ox + 18, 9, bagColor, 4, 1); // under right eye
      // Droopy eye effect
      px(dc, ox + 10, 7, 0x181818, 1, 1); // droopy left outer
      px(dc, ox + 21, 7, 0x181818, 1, 1); // droopy right outer
    } else if (dir === 'left') {
      px(dc, ox + 10, 9, bagColor, 4, 1);
      px(dc, ox + 10, 7, 0x181818, 1, 1);
    } else if (dir === 'right') {
      px(dc, ox + 18, 9, bagColor, 4, 1);
      px(dc, ox + 21, 7, 0x181818, 1, 1);
    }
  }

  scene.textures.addCanvas('player-ch3-tired', canvas);
  const texture = scene.textures.get('player-ch3-tired');
  for (let i = 0; i < 8; i++) {
    texture.add(i, 0, i * frameW, 0, frameW, frameW);
  }
}

// ─── JAIL SPRITE EVOLUTION (day1 → day2 → day3 → shirtless) ─────────

function generateJailSprites(scene: Phaser.Scene) {
  const frameW = CHAR_SIZE;
  const sheetW = frameW * 8;
  const sheetH = frameW;
  const directions: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];

  const skin = 0xd4a870;
  const skinS = 0xb88850;
  const skinH = 0xf8d0a0;
  const hair = 0x302020;
  const hairH = 0x483030;
  const eyeWhite = 0xffffff;
  const eyeBlack = 0x3a2010;
  const eyebrow = 0x281818;
  const mouth = 0xc07060;
  const noseShadow = 0xd8a878;
  const belt = 0x403830;
  const beltBuckle = 0x908070;

  // Grey prison outfit colors
  const prisonShirt = 0x808088;
  const prisonShirtLight = 0x909098;
  const prisonPants = 0x606068;
  const prisonPantsLight = 0x707078;
  const prisonShoe = 0x505050;

  // Tired overlay colors (same as generateTiredPlayer)
  const bagColor = 0x604850;

  // ─── PLAYER-JAIL-DAY1 — Just arrested, same as ch3-tired but grey prison outfit ───
  if (!scene.textures.exists('player-jail-day1')) {
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const rawCtx = canvas.getContext('2d')!;
    rawCtx.clearRect(0, 0, sheetW, sheetH);
    const dc = new DrawContext(rawCtx);

    const outfit: OutfitColors = {
      shirt: prisonShirt, shirtLight: prisonShirtLight,
      pants: prisonPants, pantsLight: prisonPantsLight,
      shoe: prisonShoe,
    };

    let fi = 0;
    for (const dir of directions) {
      drawPlayerFrame32(dc, fi * frameW, dir, false, outfit);
      fi++;
      drawPlayerFrame32(dc, fi * frameW, dir, true, outfit);
      fi++;
    }

    // Overlay messy hair + tired eyes (same as generateTiredPlayer)
    for (let f = 0; f < 8; f++) {
      const ox = f * frameW;
      const dir = (['down', 'down', 'up', 'up', 'left', 'left', 'right', 'right'] as const)[f];

      // Extra shaggy hair
      px(dc, ox + 7, 5, hair, 4, 1);
      px(dc, ox + 21, 5, hair, 4, 1);
      px(dc, ox + 10, 5, hair, 2, 1);
      px(dc, ox + 9, 4, hair, 8, 1);
      px(dc, ox + 5, 6, hair, 2, 1);
      px(dc, ox + 25, 6, hair, 2, 1);
      px(dc, ox + 8, 3, hair, 4, 1);
      px(dc, ox + 18, 3, hair, 3, 1);

      if (dir === 'down') {
        px(dc, ox + 10, 9, bagColor, 4, 1);
        px(dc, ox + 18, 9, bagColor, 4, 1);
        px(dc, ox + 10, 7, 0x181818, 1, 1);
        px(dc, ox + 21, 7, 0x181818, 1, 1);
      } else if (dir === 'left') {
        px(dc, ox + 10, 9, bagColor, 4, 1);
        px(dc, ox + 10, 7, 0x181818, 1, 1);
      } else if (dir === 'right') {
        px(dc, ox + 18, 9, bagColor, 4, 1);
        px(dc, ox + 21, 7, 0x181818, 1, 1);
      }
    }

    scene.textures.addCanvas('player-jail-day1', canvas);
    const texture = scene.textures.get('player-jail-day1');
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameW);
    }
  }

  // ─── PLAYER-JAIL-DAY2 — Eyes clearing, slightly wider shoulders ───
  if (!scene.textures.exists('player-jail-day2')) {
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const rawCtx = canvas.getContext('2d')!;
    rawCtx.clearRect(0, 0, sheetW, sheetH);
    const dc = new DrawContext(rawCtx);

    const outfit: OutfitColors = {
      shirt: prisonShirt, shirtLight: prisonShirtLight,
      pants: prisonPants, pantsLight: prisonPantsLight,
      shoe: prisonShoe,
    };

    let fi = 0;
    for (const dir of directions) {
      drawPlayerFrame32(dc, fi * frameW, dir, false, outfit);
      fi++;
      drawPlayerFrame32(dc, fi * frameW, dir, true, outfit);
      fi++;
    }

    // Wider shoulders overlay — extend shirt 1px on each side (rows 15-20)
    for (let f = 0; f < 8; f++) {
      const ox = f * frameW;
      // Extend arms/shoulders 1px wider on each side
      px(dc, ox + 5, 15, prisonShirt, 1, 1);
      px(dc, ox + 26, 15, prisonShirt, 1, 1);
      px(dc, ox + 5, 16, prisonShirt, 1, 1);
      px(dc, ox + 26, 16, prisonShirt, 1, 1);
      px(dc, ox + 5, 17, prisonShirt, 1, 1);
      px(dc, ox + 26, 17, prisonShirt, 1, 1);
      // Skin on extended arms
      px(dc, ox + 3, 19, skin, 1, 2);
      px(dc, ox + 27, 19, skin, 1, 2);
      px(dc, ox + 3, 21, skinS, 1, 1);
      px(dc, ox + 27, 21, skinS, 1, 1);
    }

    scene.textures.addCanvas('player-jail-day2', canvas);
    const texture = scene.textures.get('player-jail-day2');
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameW);
    }
  }

  // ─── PLAYER-JAIL-DAY3 — Healthy, visibly bigger arms, confident ───
  if (!scene.textures.exists('player-jail-day3')) {
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const rawCtx = canvas.getContext('2d')!;
    rawCtx.clearRect(0, 0, sheetW, sheetH);
    const dc = new DrawContext(rawCtx);

    const outfit: OutfitColors = {
      shirt: prisonShirt, shirtLight: prisonShirtLight,
      pants: prisonPants, pantsLight: prisonPantsLight,
      shoe: prisonShoe,
    };

    let fi = 0;
    for (const dir of directions) {
      drawPlayerFrame32(dc, fi * frameW, dir, false, outfit);
      fi++;
      drawPlayerFrame32(dc, fi * frameW, dir, true, outfit);
      fi++;
    }

    // Bigger arms — extend shirt and arms 2px wider on each side
    for (let f = 0; f < 8; f++) {
      const ox = f * frameW;
      const dir = (['down', 'down', 'up', 'up', 'left', 'left', 'right', 'right'] as const)[f];

      // Wider shoulders (2px each side)
      px(dc, ox + 4, 14, prisonShirt, 2, 1);
      px(dc, ox + 26, 14, prisonShirt, 2, 1);
      px(dc, ox + 4, 15, prisonShirt, 2, 1);
      px(dc, ox + 26, 15, prisonShirt, 2, 1);
      px(dc, ox + 3, 16, prisonShirt, 3, 1);
      px(dc, ox + 26, 16, prisonShirt, 3, 1);
      px(dc, ox + 3, 17, prisonShirt, 3, 1);
      px(dc, ox + 26, 17, prisonShirt, 3, 1);
      px(dc, ox + 3, 18, prisonShirtLight, 3, 1);
      px(dc, ox + 26, 18, prisonShirtLight, 3, 1);

      // Thicker arms below shirt
      if (dir === 'left' || dir === 'right') {
        px(dc, ox + 3, 18, skin, 3, 3);
        px(dc, ox + 26, 18, skin, 3, 3);
        px(dc, ox + 3, 21, skinS, 3, 1);
        px(dc, ox + 26, 21, skinS, 3, 1);
      } else {
        px(dc, ox + 3, 19, skin, 3, 2);
        px(dc, ox + 26, 19, skin, 3, 2);
        px(dc, ox + 3, 21, skinS, 3, 1);
        px(dc, ox + 26, 21, skinS, 3, 1);
      }

      // Arm muscle shadow on outer edge
      px(dc, ox + 3, 19, skinS, 1, 2);
      px(dc, ox + 28, 19, skinS, 1, 2);
    }

    scene.textures.addCanvas('player-jail-day3', canvas);
    const texture = scene.textures.get('player-jail-day3');
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameW);
    }
  }

  // ─── PLAYER-JAIL-SHIRTLESS — Buff, no shirt, visible muscles ───
  if (!scene.textures.exists('player-jail-shirtless')) {
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const rawCtx = canvas.getContext('2d')!;
    rawCtx.clearRect(0, 0, sheetW, sheetH);
    const dc = new DrawContext(rawCtx);

    // Use skin tone as shirt (shirtless), prison pants remain
    const outfit: OutfitColors = {
      shirt: skin, shirtLight: skinH,
      pants: prisonPants, pantsLight: prisonPantsLight,
      shoe: prisonShoe,
    };

    let fi = 0;
    for (const dir of directions) {
      drawPlayerFrame32(dc, fi * frameW, dir, false, outfit);
      fi++;
      drawPlayerFrame32(dc, fi * frameW, dir, true, outfit);
      fi++;
    }

    // Muscle detail overlays on each frame
    for (let f = 0; f < 8; f++) {
      const ox = f * frameW;
      const dir = (['down', 'down', 'up', 'up', 'left', 'left', 'right', 'right'] as const)[f];

      // Remove the collar line (row 13) — shirtless has no collar
      px(dc, ox + 11, 13, skinS, 2, 1);
      px(dc, ox + 19, 13, skinS, 2, 1);

      // Wider shoulders / bigger arms (2-3px each side)
      px(dc, ox + 4, 14, skin, 2, 1);
      px(dc, ox + 26, 14, skin, 2, 1);
      px(dc, ox + 4, 15, skin, 2, 1);
      px(dc, ox + 26, 15, skin, 2, 1);
      px(dc, ox + 3, 16, skin, 3, 1);
      px(dc, ox + 26, 16, skin, 3, 1);
      px(dc, ox + 3, 17, skin, 3, 1);
      px(dc, ox + 26, 17, skin, 3, 1);
      px(dc, ox + 3, 18, skinH, 3, 1);
      px(dc, ox + 26, 18, skinH, 3, 1);

      // Thicker arms below shoulders
      if (dir === 'left' || dir === 'right') {
        px(dc, ox + 3, 18, skin, 3, 3);
        px(dc, ox + 26, 18, skin, 3, 3);
        px(dc, ox + 3, 21, skinS, 3, 1);
        px(dc, ox + 26, 21, skinS, 3, 1);
      } else {
        px(dc, ox + 3, 19, skin, 3, 2);
        px(dc, ox + 26, 19, skin, 3, 2);
        px(dc, ox + 3, 21, skinS, 3, 1);
        px(dc, ox + 26, 21, skinS, 3, 1);
      }

      // Arm muscle shadow on outer edge (darker skin on outside of arms)
      px(dc, ox + 3, 17, skinS, 1, 4);
      px(dc, ox + 28, 17, skinS, 1, 4);

      if (dir === 'down') {
        // Chest/pec definition — subtle shadow lines
        px(dc, ox + 10, 15, skinS, 5, 1);  // left pec line
        px(dc, ox + 17, 15, skinS, 5, 1);  // right pec line
        px(dc, ox + 11, 16, skinS, 1, 1);  // left pec shadow
        px(dc, ox + 20, 16, skinS, 1, 1);  // right pec shadow

        // Subtle six-pack lines (2 horizontal lines in skin shadow)
        px(dc, ox + 13, 18, skinS, 6, 1);  // upper ab line
        px(dc, ox + 13, 20, skinS, 6, 1);  // lower ab line
        // Center line
        px(dc, ox + 15, 16, skinS, 2, 5);  // vertical center
      } else if (dir === 'left') {
        // Side torso definition
        px(dc, ox + 10, 16, skinS, 1, 4);  // side muscle shadow
        px(dc, ox + 13, 18, skinS, 4, 1);  // ab line
        px(dc, ox + 13, 20, skinS, 4, 1);  // ab line
      } else if (dir === 'right') {
        // Side torso definition
        px(dc, ox + 21, 16, skinS, 1, 4);  // side muscle shadow
        px(dc, ox + 15, 18, skinS, 4, 1);  // ab line
        px(dc, ox + 15, 20, skinS, 4, 1);  // ab line
      }
      // 'up' direction: back view — no muscle detail needed on front
    }

    scene.textures.addCanvas('player-jail-shirtless', canvas);
    const texture = scene.textures.get('player-jail-shirtless');
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameW);
    }
  }
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────

// ─── HOT TUB TILE ────────────────────────────────────────────────────
// Bubbly warm water, not ocean waves

function generateHotTub(scene: Phaser.Scene) {
  const S = TILE_SIZE;
  // Create a static bubbly tile (32x32)
  makeTexture(scene, 'tile-hottub', S, S, (g) => {
    // Warm blue base
    g.fillStyle(0x4098d0);
    g.fillRect(0, 0, S, S);

    // Warm blue depth variation
    px(g, 0, 0, 0x3888c0, S, 4);   // top edge darker
    px(g, 0, 28, 0x3888c0, S, 4);  // bottom edge darker
    px(g, 0, 0, 0x3888c0, 4, S);   // left edge
    px(g, 28, 0, 0x3888c0, 4, S);  // right edge

    // Lighter warm water patches
    px(g, 4, 4, 0x50a8e0, 6, 3);
    px(g, 16, 10, 0x50a8e0, 8, 3);
    px(g, 2, 18, 0x50a8e0, 6, 3);
    px(g, 20, 22, 0x50a8e0, 6, 3);
    px(g, 10, 26, 0x50a8e0, 5, 3);

    // Bubble clusters — larger, more detailed
    // Cluster 1
    px(g, 6, 5, 0xd0e8ff, 3, 3);
    px(g, 7, 5, 0xe0f0ff, 2, 2);
    px(g, 6, 5, 0xffffff, 1, 1);
    // Cluster 2
    px(g, 20, 4, 0xd0e8ff, 3, 3);
    px(g, 21, 4, 0xe0f0ff, 2, 2);
    px(g, 20, 4, 0xffffff, 1, 1);
    // Cluster 3
    px(g, 12, 12, 0xe0f0ff, 3, 3);
    px(g, 13, 12, 0xd0e8ff, 2, 2);
    px(g, 12, 12, 0xffffff, 1, 1);
    // Cluster 4
    px(g, 26, 14, 0xd0e8ff, 3, 3);
    px(g, 27, 14, 0xe0f0ff, 2, 2);
    px(g, 26, 14, 0xffffff, 1, 1);
    // Cluster 5
    px(g, 4, 22, 0xe0f0ff, 3, 3);
    px(g, 5, 22, 0xd0e8ff, 2, 2);
    px(g, 4, 22, 0xffffff, 1, 1);
    // Cluster 6
    px(g, 18, 26, 0xd0e8ff, 3, 3);
    px(g, 19, 26, 0xe0f0ff, 2, 2);
    px(g, 18, 26, 0xffffff, 1, 1);

    // Small single bubbles
    px(g, 10, 8, 0xe0f0ff, 2, 2);
    px(g, 10, 8, 0xffffff, 1, 1);
    px(g, 28, 8, 0xe0f0ff, 1, 1);
    px(g, 14, 20, 0xe0f0ff, 2, 2);
    px(g, 14, 20, 0xffffff, 1, 1);
    px(g, 24, 28, 0xe0f0ff, 1, 1);
    px(g, 8, 16, 0xe0f0ff, 1, 1);

    // Steam wisps (very light, at top)
    px(g, 6, 0, 0xc0d8f0, 3, 1);
    px(g, 8, 1, 0xb0d0e8, 2, 1);
    px(g, 20, 0, 0xc0d8f0, 4, 1);
    px(g, 22, 1, 0xb0d0e8, 2, 1);
    px(g, 14, 0, 0xc0d8f0, 2, 1);
  });
}

// ─── BMW 335i SPRITE ─────────────────────────────────────────────────
// Top-down view, 48x32 pixels (3 tiles wide, 2 tiles tall)
// Black E90 335i — N54 twin turbo, catless downpipes, low stance

function generateBMW(scene: Phaser.Scene) {
  const w = 48;
  const h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, w, h);

  const black = '#1a1a1e';
  const darkGrey = '#282830';
  const bodyShine = '#303038';
  const chrome = '#a0a0b0';
  const chromeDark = '#707080';
  const headlight = '#d0e8ff';
  const taillight = '#ff2020';
  const taillightDark = '#a01010';
  const window_ = '#1a2040';
  const windowShine = '#2a3050';
  const grille = '#0a0a0e';
  const grilleChrome = '#808090';
  const tire = '#181818';
  const rim = '#606068';
  const indicator = '#f0a020';

  // === BODY SHELL (top-down, facing right) ===
  // Main body — rounded rectangle
  g.fillStyle = black;
  g.fillRect(4, 6, 40, 20);  // main body

  // Front bumper (right side)
  g.fillRect(42, 8, 4, 16);
  g.fillStyle = darkGrey;
  g.fillRect(44, 9, 2, 14);

  // Rear bumper (left side)
  g.fillStyle = black;
  g.fillRect(1, 8, 4, 16);
  g.fillStyle = darkGrey;
  g.fillRect(1, 9, 2, 14);

  // Body shine lines
  g.fillStyle = bodyShine;
  g.fillRect(10, 7, 28, 1);  // top shine
  g.fillRect(10, 24, 28, 1); // bottom shine
  g.fillRect(6, 10, 1, 12);  // side shine

  // === ROOF / WINDOWS ===
  g.fillStyle = window_;
  g.fillRect(14, 10, 18, 12); // window area
  g.fillStyle = windowShine;
  g.fillRect(15, 11, 8, 1);  // windshield glare
  g.fillRect(15, 14, 6, 1);  // side window glare

  // Window pillars
  g.fillStyle = black;
  g.fillRect(13, 10, 1, 12); // A-pillar
  g.fillRect(22, 10, 1, 12); // B-pillar
  g.fillRect(32, 10, 1, 12); // C-pillar

  // === BMW KIDNEY GRILLES (front, right side) ===
  g.fillStyle = grille;
  g.fillRect(43, 11, 3, 4); // left kidney
  g.fillRect(43, 17, 3, 4); // right kidney
  g.fillStyle = grilleChrome;
  g.fillRect(43, 11, 3, 1); // chrome surround top
  g.fillRect(43, 14, 3, 1);
  g.fillRect(43, 17, 3, 1);
  g.fillRect(43, 20, 3, 1);

  // === HEADLIGHTS (angel eyes) ===
  g.fillStyle = headlight;
  g.fillRect(44, 8, 2, 3);   // top headlight
  g.fillRect(44, 21, 2, 3);  // bottom headlight
  // Angel eye rings
  g.fillStyle = '#ffffff';
  g.fillRect(45, 9, 1, 1);
  g.fillRect(45, 22, 1, 1);

  // === TAILLIGHTS ===
  g.fillStyle = taillight;
  g.fillRect(2, 8, 2, 3);    // top taillight
  g.fillRect(2, 21, 2, 3);   // bottom taillight
  g.fillStyle = taillightDark;
  g.fillRect(2, 9, 1, 1);
  g.fillRect(2, 22, 1, 1);

  // === DUAL EXHAUST TIPS (catless downpipes baby) ===
  g.fillStyle = chrome;
  g.fillRect(0, 10, 2, 2);   // left exhaust
  g.fillRect(0, 20, 2, 2);   // right exhaust
  g.fillStyle = '#404040';
  g.fillRect(0, 11, 1, 1);   // exhaust opening
  g.fillRect(0, 21, 1, 1);

  // === TIRES + RIMS ===
  // Front tires
  g.fillStyle = tire;
  g.fillRect(36, 5, 6, 3);   // front-top tire
  g.fillRect(36, 24, 6, 3);  // front-bottom tire
  g.fillStyle = rim;
  g.fillRect(38, 5, 2, 3);   // front-top rim
  g.fillRect(38, 24, 2, 3);  // front-bottom rim

  // Rear tires (slightly wider — that low stance)
  g.fillStyle = tire;
  g.fillRect(6, 4, 7, 3);    // rear-top tire
  g.fillRect(6, 25, 7, 3);   // rear-bottom tire
  g.fillStyle = rim;
  g.fillRect(8, 4, 3, 3);    // rear-top rim
  g.fillRect(8, 25, 3, 3);   // rear-bottom rim

  // === SIDE INDICATORS ===
  g.fillStyle = indicator;
  g.fillRect(35, 7, 2, 1);
  g.fillRect(35, 24, 2, 1);

  // === SIDE MIRRORS ===
  g.fillStyle = black;
  g.fillRect(20, 5, 2, 2);
  g.fillRect(20, 25, 2, 2);

  scene.textures.addCanvas('car-bmw335i', canvas);
}

// ─── CORVETTE C8 ──────────────────────────────────────────────────────
// 64x32 top-down sprite — white/pearl C8 Stingray, mid-engine supercar
function generateCorvetteC8(scene: Phaser.Scene) {
  if (scene.textures.exists('car-corvette-c8')) return;
  const w = 64;
  const h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, w, h);

  const bodyMain = '#1a3a28';      // Dark metallic green — almost black
  const bodyShadow = '#0e2518';
  const bodyHighlight = '#2a5038';
  const bodyPearl = '#1e4030';
  const black = '#1a1a1e';
  const windowTint = '#101828';
  const windowShine = '#1a2848';
  const chrome = '#a0a0b0';
  const headlight = '#d0e8ff';
  const headlightBlue = '#80b0ff';
  const headlightWhite = '#f0f8ff';
  const taillight = '#ff2020';
  const taillightDark = '#a01010';
  const taillightBright = '#ff4040';
  const tire = '#181818';
  const tireSide = '#222228';
  const rim = '#808088';
  const rimHighlight = '#b0b0b8';
  const rimCenter = '#606068';
  const exhaust = '#505058';
  const exhaustDark = '#303038';
  const diffuser = '#0a0a0e';
  const scoopDark = '#404048';
  const carbonFiber = '#1a1a20';

  // === BODY SHELL (top-down, facing right) ===
  // C8 mid-engine: short front overhang, long rear, massive haunches

  // Main body block
  g.fillStyle = bodyMain;
  g.fillRect(6, 7, 52, 18);   // core body

  // Rear haunches — C8 signature wide hips
  g.fillStyle = bodyMain;
  g.fillRect(6, 5, 22, 2);    // rear top haunch
  g.fillRect(6, 25, 22, 2);   // rear bottom haunch
  g.fillRect(8, 4, 18, 1);    // wider rear top
  g.fillRect(8, 27, 18, 1);   // wider rear bottom

  // Front section — narrower, wedge nose
  g.fillStyle = bodyMain;
  g.fillRect(56, 9, 6, 14);   // front nose
  g.fillRect(58, 10, 4, 12);  // narrower nose tip
  g.fillRect(60, 11, 3, 10);  // pointed tip

  // Rear overhang
  g.fillStyle = bodyMain;
  g.fillRect(2, 9, 5, 14);    // rear end
  g.fillRect(3, 8, 4, 16);    // rear width

  // === BODY SHADING + PEARL EFFECT ===
  g.fillStyle = bodyShadow;
  g.fillRect(6, 24, 50, 1);   // lower body shadow
  g.fillRect(6, 7, 50, 1);    // upper body shadow
  g.fillRect(6, 12, 1, 8);    // rear side shadow

  g.fillStyle = bodyHighlight;
  g.fillRect(14, 8, 36, 1);   // top highlight streak
  g.fillRect(14, 23, 36, 1);  // bottom highlight streak

  // Pearl shimmer on upper body
  g.fillStyle = bodyPearl;
  g.fillRect(20, 9, 20, 1);   // pearl accent top
  g.fillRect(20, 22, 20, 1);  // pearl accent bottom

  // Center spine (prominent on C8)
  g.fillStyle = bodyShadow;
  g.fillRect(24, 15, 22, 2);  // center spine line
  g.fillStyle = bodyHighlight;
  g.fillRect(26, 15, 18, 1);  // spine highlight

  // === SIDE AIR INTAKES (C8 signature — behind doors) ===
  g.fillStyle = scoopDark;
  g.fillRect(24, 6, 5, 2);    // top side scoop
  g.fillRect(24, 24, 5, 2);   // bottom side scoop
  g.fillStyle = black;
  g.fillRect(25, 6, 3, 1);    // scoop intake dark
  g.fillRect(25, 25, 3, 1);
  g.fillStyle = carbonFiber;
  g.fillRect(24, 7, 5, 1);    // carbon fiber trim
  g.fillRect(24, 24, 5, 1);

  // === ENGINE COVER (visible vents behind cabin) ===
  g.fillStyle = scoopDark;
  g.fillRect(10, 10, 8, 12);  // engine bay area
  g.fillStyle = '#353540';
  g.fillRect(11, 11, 6, 2);   // vent slat 1
  g.fillRect(11, 14, 6, 2);   // vent slat 2
  g.fillRect(11, 17, 6, 2);   // vent slat 3
  g.fillRect(11, 20, 6, 2);   // vent slat 4

  // === WINDOWS (targa-style, mid-engine cab-forward) ===
  g.fillStyle = windowTint;
  g.fillRect(32, 10, 18, 12); // window area (pushed forward)
  g.fillStyle = windowShine;
  g.fillRect(33, 11, 8, 1);   // windshield glare top
  g.fillRect(33, 15, 5, 1);   // side window glare
  g.fillRect(42, 12, 6, 1);   // front windshield glare

  // A-pillars and targa bar
  g.fillStyle = black;
  g.fillRect(31, 10, 1, 12);  // rear window pillar
  g.fillRect(39, 10, 1, 12);  // B-pillar
  g.fillRect(50, 10, 1, 12);  // A-pillar (front)
  g.fillRect(36, 10, 4, 1);   // targa bar top
  g.fillRect(36, 21, 4, 1);   // targa bar bottom

  // === HEADLIGHTS (angular LED strips — C8 signature) ===
  g.fillStyle = headlightWhite;
  g.fillRect(59, 10, 3, 1);   // top LED strip
  g.fillRect(59, 21, 3, 1);   // bottom LED strip
  g.fillStyle = headlight;
  g.fillRect(60, 11, 2, 2);   // top headlight body
  g.fillRect(60, 19, 2, 2);   // bottom headlight body
  g.fillStyle = headlightBlue;
  g.fillRect(61, 11, 1, 1);   // blue DRL accent top
  g.fillRect(61, 20, 1, 1);   // blue DRL accent bottom
  // DRL lines running back
  g.fillStyle = headlight;
  g.fillRect(56, 9, 6, 1);    // top DRL line
  g.fillRect(56, 22, 6, 1);   // bottom DRL line

  // === REAR — wide taillights + quad exhaust + diffuser ===
  // Taillights (thin horizontal bands — C8 style)
  g.fillStyle = taillight;
  g.fillRect(3, 8, 3, 4);     // top taillight
  g.fillRect(3, 20, 3, 4);    // bottom taillight
  g.fillStyle = taillightBright;
  g.fillRect(4, 9, 2, 2);     // bright center top
  g.fillRect(4, 21, 2, 2);    // bright center bottom
  g.fillStyle = taillightDark;
  g.fillRect(3, 10, 1, 2);    // taillight depth top
  g.fillRect(3, 22, 1, 2);    // taillight depth bottom

  // Black rear diffuser
  g.fillStyle = diffuser;
  g.fillRect(1, 13, 4, 6);    // center diffuser
  g.fillStyle = carbonFiber;
  g.fillRect(0, 14, 2, 4);    // deep diffuser carbon

  // Quad exhaust tips (center-exit)
  g.fillStyle = chrome;
  g.fillRect(0, 12, 2, 2);    // top-outer exhaust
  g.fillRect(0, 14, 2, 2);    // top-inner exhaust
  g.fillRect(0, 18, 2, 2);    // bottom-inner exhaust
  g.fillRect(0, 20, 2, 2);    // bottom-outer exhaust
  g.fillStyle = exhaustDark;
  g.fillRect(0, 13, 1, 1);    // exhaust hole
  g.fillRect(0, 15, 1, 1);
  g.fillRect(0, 19, 1, 1);
  g.fillRect(0, 21, 1, 1);

  // === TIRES + RIMS ===
  // Front tires (narrower — 245s)
  g.fillStyle = tire;
  g.fillRect(48, 5, 8, 4);    // front-top tire
  g.fillRect(48, 23, 8, 4);   // front-bottom tire
  g.fillStyle = tireSide;
  g.fillRect(49, 5, 6, 1);    // tire sidewall top
  g.fillRect(49, 26, 6, 1);   // tire sidewall bottom
  g.fillStyle = rim;
  g.fillRect(50, 6, 4, 3);    // front-top rim
  g.fillRect(50, 23, 4, 3);   // front-bottom rim
  g.fillStyle = rimHighlight;
  g.fillRect(51, 7, 2, 1);    // rim shine top
  g.fillRect(51, 24, 2, 1);   // rim shine bottom
  g.fillStyle = rimCenter;
  g.fillRect(52, 6, 1, 1);    // lug nut hint
  g.fillRect(52, 25, 1, 1);

  // Rear tires (much wider — 345s, massive)
  g.fillStyle = tire;
  g.fillRect(7, 2, 10, 5);    // rear-top tire
  g.fillRect(7, 25, 10, 5);   // rear-bottom tire
  g.fillStyle = tireSide;
  g.fillRect(8, 2, 8, 1);     // tire sidewall
  g.fillRect(8, 29, 8, 1);
  g.fillStyle = rim;
  g.fillRect(9, 3, 6, 4);     // rear-top rim
  g.fillRect(9, 25, 6, 4);    // rear-bottom rim
  g.fillStyle = rimHighlight;
  g.fillRect(10, 4, 4, 2);    // rear rim shine top
  g.fillRect(10, 26, 4, 2);   // rear rim shine bottom
  g.fillStyle = rimCenter;
  g.fillRect(12, 4, 1, 1);    // lug nut
  g.fillRect(12, 27, 1, 1);

  // === SIDE MIRRORS ===
  g.fillStyle = bodyMain;
  g.fillRect(44, 5, 3, 2);    // top mirror
  g.fillRect(44, 25, 3, 2);   // bottom mirror
  g.fillStyle = bodyShadow;
  g.fillRect(45, 5, 1, 1);    // mirror shadow
  g.fillRect(45, 26, 1, 1);

  // === CHROME ACCENTS ===
  g.fillStyle = chrome;
  g.fillRect(4, 15, 1, 2);    // rear badge
  g.fillRect(56, 15, 1, 2);   // front badge/lip

  // === FRONT SPLITTER ===
  g.fillStyle = carbonFiber;
  g.fillRect(58, 9, 4, 1);    // front splitter top edge
  g.fillRect(58, 22, 4, 1);   // front splitter bottom edge
  g.fillRect(62, 12, 1, 8);   // front lip

  scene.textures.addCanvas('car-corvette-c8', canvas);
}

// ─── LAMBORGHINI SVJ SPRITE ──────────────────────────────────────────
// 48x32 top-down sprite — Verde Mantis green SVJ, aggressive wedge, massive wing
function generateLamboSVJ(scene: Phaser.Scene) {
  if (scene.textures.exists('car-lambo-svj')) return;
  const w = 48;
  const h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, w, h);

  const green = '#40c040';
  const greenDark = '#30a030';
  const greenLight = '#50d050';
  const black = '#1a1a1e';
  const darkGrey = '#282830';
  const headlight = '#e0e8ff';
  const headlightYellow = '#f0e060';
  const taillight = '#ff2020';
  const taillightDark = '#a01010';
  const tire = '#181818';
  const rim = '#606068';
  const rimHighlight = '#808088';
  const exhaust = '#505058';
  const chrome = '#a0a0b0';
  const windowTint = '#101828';
  const windowShine = '#1a2848';
  const carbonFiber = '#0a0a0e';
  const diffuserGrey = '#2a2a30';

  // === BODY SHELL — extreme wedge shape, very low and wide ===
  g.fillStyle = green;
  g.fillRect(4, 6, 40, 20);   // main body

  // Wider rear haunches (SVJ is WIDE)
  g.fillRect(3, 5, 18, 1);    // rear top widening
  g.fillRect(3, 26, 18, 1);   // rear bottom widening
  g.fillRect(4, 4, 14, 1);    // even wider rear
  g.fillRect(4, 27, 14, 1);

  // Aggressive front — narrower wedge
  g.fillStyle = green;
  g.fillRect(42, 9, 4, 14);   // front nose
  g.fillRect(44, 10, 2, 12);  // front tip

  // Rear section
  g.fillStyle = green;
  g.fillRect(1, 8, 4, 16);    // rear overhang
  g.fillRect(2, 7, 3, 18);    // rear width

  // === BODY SHADING ===
  g.fillStyle = greenDark;
  g.fillRect(4, 24, 38, 2);   // bottom shadow line
  g.fillRect(4, 6, 38, 1);    // top shadow line
  g.fillRect(4, 10, 1, 12);   // rear side shadow
  g.fillRect(22, 7, 16, 1);   // body crease top
  g.fillRect(22, 24, 16, 1);  // body crease bottom

  g.fillStyle = greenLight;
  g.fillRect(10, 7, 12, 1);   // top highlight
  g.fillRect(10, 24, 12, 1);  // bottom highlight
  g.fillRect(20, 8, 14, 1);   // center spine highlight

  // === HEXAGONAL SIDE AIR INTAKES (SVJ signature) ===
  g.fillStyle = carbonFiber;
  g.fillRect(14, 6, 6, 2);    // top side intake
  g.fillRect(14, 24, 6, 2);   // bottom side intake
  g.fillStyle = darkGrey;
  g.fillRect(15, 6, 4, 1);    // intake mesh top
  g.fillRect(15, 25, 4, 1);   // intake mesh bottom
  // Second set of intakes (larger, further back)
  g.fillStyle = carbonFiber;
  g.fillRect(6, 5, 5, 2);     // rear top scoop
  g.fillRect(6, 25, 5, 2);    // rear bottom scoop
  g.fillStyle = darkGrey;
  g.fillRect(7, 5, 3, 1);
  g.fillRect(7, 26, 3, 1);

  // === MASSIVE REAR WING / SPOILER (SVJ distinctive feature) ===
  g.fillStyle = carbonFiber;
  g.fillRect(1, 3, 8, 2);     // wing top
  g.fillRect(1, 27, 8, 2);    // wing bottom
  g.fillStyle = black;
  g.fillRect(2, 2, 6, 1);     // wing endplate top
  g.fillRect(2, 29, 6, 1);    // wing endplate bottom
  // Wing supports
  g.fillStyle = carbonFiber;
  g.fillRect(3, 5, 1, 2);     // top support
  g.fillRect(7, 5, 1, 2);     // top support 2
  g.fillRect(3, 25, 1, 2);    // bottom support
  g.fillRect(7, 25, 1, 2);    // bottom support 2

  // === ROOF / WINDOWS ===
  g.fillStyle = windowTint;
  g.fillRect(26, 10, 12, 12); // window area (very forward — engine is rear)
  g.fillStyle = windowShine;
  g.fillRect(27, 11, 5, 1);   // windshield glare
  g.fillRect(27, 14, 4, 1);   // side window glare

  // Pillars
  g.fillStyle = black;
  g.fillRect(25, 10, 1, 12);  // rear pillar
  g.fillRect(38, 10, 1, 12);  // A-pillar
  g.fillRect(33, 10, 1, 12);  // B-pillar

  // === HEADLIGHTS (thin Y-shaped LED — Aventador SVJ style) ===
  g.fillStyle = headlight;
  g.fillRect(44, 10, 2, 1);   // top LED thin
  g.fillRect(44, 21, 2, 1);   // bottom LED thin
  g.fillStyle = headlightYellow;
  g.fillRect(45, 11, 1, 1);   // Y-arm top
  g.fillRect(43, 9, 1, 1);    // outer DRL top
  g.fillRect(45, 20, 1, 1);   // Y-arm bottom
  g.fillRect(43, 22, 1, 1);   // outer DRL bottom
  // DRL extensions
  g.fillStyle = headlight;
  g.fillRect(42, 8, 3, 1);    // top DRL strip
  g.fillRect(42, 23, 3, 1);   // bottom DRL strip

  // === TAILLIGHTS (wide horizontal) ===
  g.fillStyle = taillight;
  g.fillRect(2, 7, 2, 3);     // top taillight
  g.fillRect(2, 22, 2, 3);    // bottom taillight
  g.fillStyle = taillightDark;
  g.fillRect(2, 8, 1, 1);
  g.fillRect(2, 23, 1, 1);

  // === GIANT REAR DIFFUSER (SVJ has enormous one) ===
  g.fillStyle = diffuserGrey;
  g.fillRect(1, 11, 3, 10);   // center diffuser area
  g.fillStyle = carbonFiber;
  g.fillRect(0, 12, 2, 8);    // deep diffuser
  // Diffuser fins
  g.fillStyle = darkGrey;
  g.fillRect(1, 13, 1, 1);
  g.fillRect(1, 15, 1, 1);
  g.fillRect(1, 17, 1, 1);
  g.fillRect(1, 19, 1, 1);

  // === QUAD EXHAUST (high-mounted on SVJ) ===
  g.fillStyle = exhaust;
  g.fillRect(0, 10, 2, 2);    // top-left
  g.fillRect(0, 12, 1, 1);    // top-right
  g.fillRect(0, 20, 2, 2);    // bottom-left
  g.fillRect(0, 19, 1, 1);    // bottom-right
  g.fillStyle = '#404040';
  g.fillRect(0, 11, 1, 1);    // exhaust opening
  g.fillRect(0, 21, 1, 1);

  // === TIRES + RIMS ===
  // Front tires
  g.fillStyle = tire;
  g.fillRect(36, 5, 6, 3);    // front-top
  g.fillRect(36, 24, 6, 3);   // front-bottom
  g.fillStyle = rim;
  g.fillRect(38, 5, 2, 3);    // front-top rim
  g.fillRect(38, 24, 2, 3);   // front-bottom rim
  g.fillStyle = rimHighlight;
  g.fillRect(39, 6, 1, 1);
  g.fillRect(39, 25, 1, 1);

  // Rear tires (very wide — Pirelli P Zeros)
  g.fillStyle = tire;
  g.fillRect(5, 2, 9, 4);     // rear-top (wider than C8)
  g.fillRect(5, 26, 9, 4);    // rear-bottom
  g.fillStyle = rim;
  g.fillRect(7, 2, 5, 4);     // rear-top rim
  g.fillRect(7, 26, 5, 4);    // rear-bottom rim
  g.fillStyle = rimHighlight;
  g.fillRect(8, 3, 3, 2);     // rear rim shine
  g.fillRect(8, 27, 3, 2);

  // === SIDE MIRRORS ===
  g.fillStyle = green;
  g.fillRect(32, 5, 2, 2);
  g.fillRect(32, 25, 2, 2);
  g.fillStyle = greenDark;
  g.fillRect(33, 5, 1, 1);
  g.fillRect(33, 25, 1, 1);

  // === CENTER SPINE (engine cover lines) ===
  g.fillStyle = greenDark;
  g.fillRect(8, 15, 16, 2);   // engine cover spine
  g.fillStyle = carbonFiber;
  g.fillRect(10, 15, 2, 2);   // carbon engine vent
  g.fillRect(16, 15, 2, 2);   // carbon engine vent 2

  // === SVJ badge area ===
  g.fillStyle = chrome;
  g.fillRect(3, 15, 1, 2);    // tiny badge

  scene.textures.addCanvas('car-lambo-svj', canvas);
}

// ─── ITEM SPRITES ─────────────────────────────────────────────────────
// 16x16 pixel art items placed on interactable tiles so players can see
// what they're about to interact with.

function generateItems(scene: Phaser.Scene) {

  // --- item-weed-bag ---
  makeTexture(scene, 'item-weed-bag', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 5, 12, 0x2a3a20, 7, 2);
    // Bag body
    px(g, 5, 5, 0x4a7a30, 6, 7);
    px(g, 6, 4, 0x4a7a30, 4, 1);
    // Darker green depth
    px(g, 6, 8, 0x3a6020, 4, 3);
    px(g, 5, 10, 0x3a6020, 6, 1);
    // Bag tie/knot at top
    px(g, 7, 3, 0x6a5030, 2, 2);
    px(g, 7, 2, 0x6a5030, 2, 1);
    // Leaf detail
    px(g, 8, 6, 0x80c050, 2, 1);
    px(g, 9, 7, 0x80c050, 1, 2);
    px(g, 7, 7, 0x70b040, 1, 1);
    // Highlight
    px(g, 6, 5, 0x60a040, 2, 1);
    px(g, 5, 6, 0x60a040, 1, 2);
  });

  // --- item-phone ---
  makeTexture(scene, 'item-phone', TILE_SIZE, TILE_SIZE, (g) => {
    // Phone body (black rectangle)
    px(g, 5, 2, 0x1a1a1a, 6, 12);
    // Rounded corners - slightly darker border
    px(g, 6, 2, 0x2a2a2a, 4, 1);
    px(g, 5, 3, 0x2a2a2a, 1, 10);
    px(g, 10, 3, 0x2a2a2a, 1, 10);
    px(g, 6, 13, 0x2a2a2a, 4, 1);
    // Screen (blue-white glow)
    px(g, 6, 4, 0x4080d0, 4, 7);
    px(g, 7, 4, 0x60a0e0, 2, 5);
    px(g, 6, 5, 0x80c0f0, 3, 2);  // bright area
    // Screen reflection
    px(g, 6, 4, 0xa0d0ff, 1, 1);
    // Home button
    px(g, 7, 12, 0x404040, 2, 1);
    // Speaker at top
    px(g, 7, 3, 0x303030, 2, 1);
    // Shadow
    px(g, 6, 14, 0x101010, 5, 1);
  });

  // --- item-book ---
  makeTexture(scene, 'item-book', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 4, 12, 0x3a2010, 9, 1);
    // Book cover (red-brown)
    px(g, 3, 5, 0x8a3030, 9, 7);
    px(g, 4, 4, 0x8a3030, 7, 1);
    // Cover depth / spine
    px(g, 3, 5, 0x6a2020, 1, 7);
    px(g, 3, 11, 0x6a2020, 9, 1);
    // Pages visible on right side
    px(g, 11, 5, 0xf0e8d0, 2, 7);
    px(g, 12, 6, 0xe0d8c0, 1, 5);
    // Page lines
    px(g, 11, 6, 0xd0c8b0, 1, 1);
    px(g, 11, 8, 0xd0c8b0, 1, 1);
    px(g, 11, 10, 0xd0c8b0, 1, 1);
    // Cover highlight
    px(g, 5, 5, 0xa04040, 5, 1);
    // Title lines on cover
    px(g, 5, 7, 0xd0a030, 4, 1);
    px(g, 5, 9, 0xd0a030, 3, 1);
  });

  // --- item-bottle ---
  makeTexture(scene, 'item-bottle', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 6, 14, 0x3a2010, 5, 1);
    // Bottle body (brown glass)
    px(g, 6, 5, 0x6a4820, 4, 9);
    // Bottle neck
    px(g, 7, 2, 0x6a4820, 2, 3);
    // Cap
    px(g, 7, 1, 0xc0c0c0, 2, 2);
    px(g, 7, 1, 0xe0e0e0, 1, 1);
    // Label area
    px(g, 6, 7, 0xe0d0a0, 4, 3);
    px(g, 7, 8, 0xc0b080, 2, 1);
    // Glass highlight
    px(g, 6, 5, 0x8a6830, 1, 4);
    px(g, 9, 6, 0x503010, 1, 7);
    // Bottle bottom
    px(g, 6, 13, 0x503010, 4, 1);
  });

  // --- item-money ---
  makeTexture(scene, 'item-money', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 13, 0x1a3010, 10, 1);
    // Bottom bill
    px(g, 4, 9, 0x2a6a20, 9, 4);
    px(g, 4, 9, 0x3a7a30, 9, 1);
    // Middle bill (offset)
    px(g, 3, 7, 0x3a8a30, 9, 3);
    px(g, 3, 7, 0x4a9a40, 9, 1);
    // Top bill
    px(g, 4, 5, 0x4aaa40, 9, 3);
    px(g, 4, 5, 0x60c060, 9, 1);
    // Bill details
    px(g, 7, 6, 0x80d070, 3, 1);
    px(g, 6, 8, 0x60b050, 2, 1);
    px(g, 8, 10, 0x409030, 3, 1);
    // Dollar sign on top bill
    px(g, 8, 5, 0x206010, 1, 2);
    px(g, 7, 5, 0x206010, 1, 1);
    px(g, 9, 6, 0x206010, 1, 1);
    // Band around stack
    px(g, 5, 8, 0xd0b060, 7, 1);
  });

  // --- item-joint ---
  makeTexture(scene, 'item-joint', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 10, 0x404030, 10, 1);
    // Joint body (white/tan paper)
    px(g, 3, 7, 0xe8dcc0, 10, 2);
    px(g, 3, 7, 0xf0e8d0, 8, 1);
    // Twisted end (left)
    px(g, 2, 7, 0xd0c8b0, 1, 2);
    px(g, 1, 8, 0xc0b8a0, 1, 1);
    // Orange lit tip (right)
    px(g, 13, 7, 0xff6020, 1, 2);
    px(g, 12, 7, 0xe05010, 1, 2);
    px(g, 14, 7, 0xff8040, 1, 1);
    // Ember glow
    px(g, 13, 6, 0xff9040, 1, 1);
    // Smoke wisps
    px(g, 14, 5, 0xc0c0c0, 1, 1);
    px(g, 13, 4, 0xa0a0a0, 1, 1);
    px(g, 14, 3, 0x808080, 1, 1);
    px(g, 15, 2, 0x606060, 1, 1);
    // Paper crease
    px(g, 6, 8, 0xd0c8b0, 1, 1);
    px(g, 9, 8, 0xd0c8b0, 1, 1);
  });

  // --- item-letter ---
  makeTexture(scene, 'item-letter', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 4, 13, 0x808080, 9, 1);
    // Paper body (white)
    px(g, 3, 4, 0xf0ece0, 10, 9);
    // Paper edge shadow
    px(g, 12, 5, 0xd0c8b8, 1, 8);
    px(g, 3, 12, 0xd0c8b8, 10, 1);
    // Curled corner (bottom-right)
    px(g, 11, 12, 0xe0d8c8, 1, 1);
    px(g, 12, 11, 0xc0b8a0, 1, 1);
    // Text lines
    px(g, 5, 6, 0x808890, 6, 1);
    px(g, 5, 8, 0x909098, 5, 1);
    px(g, 5, 10, 0x808890, 4, 1);
    // Header line (bolder)
    px(g, 5, 5, 0x404050, 5, 1);
  });

  // --- item-photo ---
  makeTexture(scene, 'item-photo', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 4, 14, 0x3a2a18, 10, 1);
    // Frame (brown wood)
    px(g, 3, 3, 0x8a6030, 10, 11);
    // Frame highlight (top + left)
    px(g, 3, 3, 0xa07040, 10, 1);
    px(g, 3, 3, 0xa07040, 1, 11);
    // Frame shadow (bottom + right)
    px(g, 3, 13, 0x604020, 10, 1);
    px(g, 12, 3, 0x604020, 1, 11);
    // Photo inside (lighter area)
    px(g, 5, 5, 0xd0c0a0, 6, 7);
    // Family silhouettes (simple shapes)
    px(g, 6, 7, 0x806050, 1, 3);  // person 1
    px(g, 8, 7, 0x806050, 1, 3);  // person 2
    px(g, 10, 8, 0x806050, 1, 2); // person 3 (shorter)
    px(g, 6, 6, 0x906858, 1, 1);  // head 1
    px(g, 8, 6, 0x906858, 1, 1);  // head 2
    px(g, 10, 7, 0x906858, 1, 1); // head 3
    // Blue sky background in photo
    px(g, 5, 5, 0x90c0e0, 6, 2);
  });

  // --- item-tablet ---
  makeTexture(scene, 'item-tablet', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 13, 0x101010, 11, 1);
    // Tablet body (black)
    px(g, 2, 4, 0x1a1a1a, 12, 9);
    // Bezel
    px(g, 2, 4, 0x2a2a2a, 12, 1);
    px(g, 2, 12, 0x2a2a2a, 12, 1);
    px(g, 2, 4, 0x2a2a2a, 1, 9);
    px(g, 13, 4, 0x2a2a2a, 1, 9);
    // Screen (bright blue-white)
    px(g, 4, 5, 0x4888d0, 8, 7);
    // Screen content - lines of code / text
    px(g, 5, 6, 0x70b0f0, 5, 1);
    px(g, 5, 8, 0x80c0ff, 4, 1);
    px(g, 5, 10, 0x60a0e0, 6, 1);
    // Screen highlight
    px(g, 4, 5, 0xa0d0ff, 2, 1);
    // Camera dot
    px(g, 7, 4, 0x404040, 1, 1);
  });

  // --- item-keys ---
  makeTexture(scene, 'item-keys', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 5, 13, 0x303030, 7, 1);
    // Key fob body (BMW style, rounded rectangle)
    px(g, 5, 4, 0x2a2a2a, 6, 6);
    px(g, 6, 3, 0x2a2a2a, 4, 1);
    px(g, 6, 10, 0x2a2a2a, 4, 1);
    // Chrome ring on fob
    px(g, 7, 5, 0xc0c8d0, 2, 2);
    px(g, 7, 5, 0xe0e8f0, 1, 1);
    // BMW logo hint (blue/white quarters)
    px(g, 7, 5, 0x3060c0, 1, 1);
    px(g, 8, 6, 0x3060c0, 1, 1);
    // Buttons on fob
    px(g, 6, 8, 0x404040, 1, 1);
    px(g, 8, 8, 0x404040, 1, 1);
    px(g, 9, 8, 0x404040, 1, 1);
    // Key blade sticking out
    px(g, 5, 11, 0xb0b8c0, 1, 3);
    px(g, 4, 12, 0xa0a8b0, 2, 1);
    // Key teeth
    px(g, 4, 13, 0xc0c8d0, 1, 1);
    px(g, 4, 11, 0xc0c8d0, 1, 1);
    // Key ring
    px(g, 10, 3, 0xc0c0c0, 2, 2);
    px(g, 11, 3, 0xa0a0a0, 1, 1);
    px(g, 10, 4, 0xa0a0a0, 1, 1);
  });

  // --- item-pencil ---
  makeTexture(scene, 'item-pencil', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 10, 0x808030, 11, 1);
    // Pencil body (yellow)
    px(g, 4, 7, 0xe8c830, 9, 2);
    // Darker yellow band
    px(g, 4, 8, 0xd0b020, 9, 1);
    // Metal ferrule
    px(g, 2, 7, 0xc0c0b0, 2, 2);
    px(g, 2, 7, 0xd0d0c0, 1, 1);
    // Eraser (pink)
    px(g, 1, 7, 0xe07080, 1, 2);
    px(g, 1, 7, 0xf08090, 1, 1);
    // Wood + graphite point
    px(g, 13, 7, 0xc09858, 1, 2);
    px(g, 14, 7, 0x404040, 1, 1);
    px(g, 14, 8, 0x505050, 1, 1);
    // Highlight line
    px(g, 5, 7, 0xf0d840, 6, 1);
  });

  // --- item-headphones ---
  makeTexture(scene, 'item-headphones', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 14, 0x101010, 10, 1);
    // Headband arc (top)
    px(g, 5, 2, 0x2a2a2a, 6, 1);
    px(g, 4, 3, 0x2a2a2a, 1, 1);
    px(g, 11, 3, 0x2a2a2a, 1, 1);
    px(g, 3, 4, 0x2a2a2a, 1, 2);
    px(g, 12, 4, 0x2a2a2a, 1, 2);
    // Headband highlight
    px(g, 6, 2, 0x404040, 4, 1);
    // Headband padding
    px(g, 6, 3, 0x505050, 4, 1);
    // Left ear cup
    px(g, 2, 6, 0x1a1a1a, 4, 5);
    px(g, 2, 6, 0x303030, 4, 1);
    px(g, 2, 6, 0x303030, 1, 5);
    // Left cushion
    px(g, 3, 7, 0x404040, 2, 3);
    // Right ear cup
    px(g, 10, 6, 0x1a1a1a, 4, 5);
    px(g, 10, 6, 0x303030, 4, 1);
    px(g, 13, 6, 0x303030, 1, 5);
    // Right cushion
    px(g, 11, 7, 0x404040, 2, 3);
    // Side arms
    px(g, 3, 5, 0x2a2a2a, 1, 2);
    px(g, 12, 5, 0x2a2a2a, 1, 2);
  });

  // --- item-bbq ---
  makeTexture(scene, 'item-bbq', TILE_SIZE, TILE_SIZE, (g) => {
    // Legs
    px(g, 4, 12, 0x606060, 1, 3);
    px(g, 11, 12, 0x606060, 1, 3);
    // Cross bar between legs
    px(g, 5, 13, 0x505050, 6, 1);
    // Grill body (black)
    px(g, 3, 5, 0x2a2a2a, 10, 7);
    // Body highlight
    px(g, 3, 5, 0x404040, 10, 1);
    px(g, 3, 5, 0x383838, 1, 7);
    // Red grill lines
    px(g, 4, 7, 0xc04030, 8, 1);
    px(g, 4, 9, 0xc04030, 8, 1);
    // Grill grate detail
    px(g, 5, 6, 0x505050, 1, 5);
    px(g, 8, 6, 0x505050, 1, 5);
    px(g, 11, 6, 0x505050, 1, 5);
    // Lid handle
    px(g, 7, 3, 0x606060, 2, 2);
    px(g, 7, 3, 0x808080, 2, 1);
    // Smoke wisps
    px(g, 6, 2, 0xa0a0a0, 1, 1);
    px(g, 9, 1, 0x808080, 1, 1);
    px(g, 7, 0, 0x606060, 1, 1);
  });

  // --- item-dice ---
  makeTexture(scene, 'item-dice', TILE_SIZE, TILE_SIZE, (g) => {
    // Shadow
    px(g, 3, 13, 0x808080, 11, 1);
    // Left die
    px(g, 2, 6, 0xf0f0f0, 5, 5);
    px(g, 2, 6, 0xd8d8d8, 5, 1); // top highlight
    px(g, 6, 7, 0xd0d0d0, 1, 4); // right shadow
    px(g, 2, 10, 0xd0d0d0, 5, 1); // bottom shadow
    // Left die dots (showing 5)
    px(g, 3, 7, 0x1a1a1a, 1, 1);
    px(g, 5, 7, 0x1a1a1a, 1, 1);
    px(g, 4, 8, 0x1a1a1a, 1, 1);
    px(g, 3, 9, 0x1a1a1a, 1, 1);
    px(g, 5, 9, 0x1a1a1a, 1, 1);
    // Right die (slightly rotated - offset)
    px(g, 9, 5, 0xf0f0f0, 5, 5);
    px(g, 9, 5, 0xe0e0e0, 5, 1);
    px(g, 13, 6, 0xd0d0d0, 1, 4);
    px(g, 9, 9, 0xd0d0d0, 5, 1);
    // Right die dots (showing 3)
    px(g, 10, 6, 0x1a1a1a, 1, 1);
    px(g, 11, 7, 0x1a1a1a, 1, 1);
    px(g, 12, 8, 0x1a1a1a, 1, 1);
  });

  // --- item-gun ---
  makeTexture(scene, 'item-gun', TILE_SIZE, TILE_SIZE, (g) => {
    // Handgun — side view, dark steel
    // Slide (top)
    px(g, 3, 5, 0x303038, 10, 3); // main slide
    px(g, 12, 5, 0x404048, 2, 2); // front sight
    px(g, 3, 5, 0x404048, 1, 1); // rear sight
    // Barrel
    px(g, 13, 6, 0x252530, 2, 1);
    // Frame
    px(g, 4, 8, 0x383840, 8, 2); // frame body
    // Trigger guard
    px(g, 7, 10, 0x303038, 3, 2);
    px(g, 7, 11, 0x303038, 1, 1);
    // Trigger
    px(g, 8, 10, 0x505058, 1, 2);
    // Grip
    px(g, 3, 8, 0x2a2a30, 3, 5); // grip body
    px(g, 3, 8, 0x353540, 1, 5); // grip texture
    px(g, 4, 9, 0x202028, 1, 3); // grip shadow
    // Magazine base
    px(g, 3, 13, 0x404048, 3, 1);
    // Highlight on slide
    px(g, 5, 5, 0x505060, 6, 1);
  });
}

function generateMoreItems(scene: Phaser.Scene) {

  // --- item-bed ---
  makeTexture(scene, 'item-bed', TILE_SIZE, TILE_SIZE, (g) => {
    // ~24x16 top-down bed, centered in 32x32 canvas
    // Headboard (dark wood, top edge)
    px(g, 4, 7, 0x503010, 24, 2);
    px(g, 4, 7, 0x604020, 24, 1); // highlight
    // Bed frame (brown wood)
    px(g, 4, 9, 0x6a4020, 24, 16);
    px(g, 4, 9, 0x7a5030, 24, 1); // top edge highlight
    px(g, 4, 24, 0x5a3018, 24, 1); // bottom edge shadow
    // Mattress (white/cream)
    px(g, 5, 10, 0xe8e0d8, 22, 14);
    // Pillow (at top, near headboard)
    px(g, 6, 10, 0xf0ece8, 8, 4);
    px(g, 7, 11, 0xf8f4f0, 6, 2); // pillow highlight
    // Blanket (blue, covering lower 2/3)
    px(g, 5, 15, 0x4060a0, 22, 9);
    px(g, 5, 15, 0x5070b0, 22, 1); // blanket fold highlight
    px(g, 5, 18, 0x3a5090, 22, 1); // blanket shadow fold
    // Frame side edges
    px(g, 4, 9, 0x5a3018, 1, 16); // left frame
    px(g, 27, 9, 0x5a3018, 1, 16); // right frame
  });

  // --- item-bed-pink --- (sister's room)
  makeTexture(scene, 'item-bed-pink', TILE_SIZE, TILE_SIZE, (g) => {
    // Headboard (white painted wood)
    px(g, 4, 7, 0xe0d8d0, 24, 2);
    px(g, 4, 7, 0xf0e8e0, 24, 1);
    // Bed frame (white)
    px(g, 4, 9, 0xe0d8d0, 24, 16);
    px(g, 4, 9, 0xf0e8e0, 24, 1);
    px(g, 4, 24, 0xc8c0b8, 24, 1);
    // Mattress
    px(g, 5, 10, 0xf8f0e8, 22, 14);
    // Pillow (pink)
    px(g, 6, 10, 0xf0b0c0, 8, 4);
    px(g, 7, 11, 0xf8c0d0, 6, 2);
    // Pink comforter
    px(g, 5, 15, 0xe87098, 22, 9);
    px(g, 5, 15, 0xf080a8, 22, 1);
    px(g, 5, 18, 0xd06088, 22, 1);
    // Hearts/pattern on comforter
    px(g, 12, 17, 0xf090b0, 2, 2);
    px(g, 20, 19, 0xf090b0, 2, 2);
    // Frame edges
    px(g, 4, 9, 0xc8c0b8, 1, 16);
    px(g, 27, 9, 0xc8c0b8, 1, 16);
  });

  // --- item-mirror ---
  makeTexture(scene, 'item-mirror', TILE_SIZE, TILE_SIZE, (g) => {
    // Frame (gold/bronze)
    px(g, 4, 2, 0xa08040, 8, 12);
    px(g, 4, 2, 0xb09050, 8, 1);
    px(g, 4, 2, 0xb09050, 1, 12);
    px(g, 11, 2, 0x806030, 1, 12);
    px(g, 4, 13, 0x806030, 8, 1);
    // Mirror surface (light blue/silver)
    px(g, 5, 3, 0xc0d8e8, 6, 10);
    // Reflection streak
    px(g, 6, 4, 0xe0f0ff, 2, 6);
    px(g, 7, 5, 0xf0f8ff, 1, 3);
    // Shadow at bottom
    px(g, 5, 11, 0xa0b8c8, 6, 2);
  });

  // --- item-tv ---
  makeTexture(scene, 'item-tv', TILE_SIZE, TILE_SIZE, (g) => {
    // ~20x16 flat screen TV, centered in 32x32 canvas
    // TV body/bezel (dark grey)
    px(g, 6, 7, 0x1a1a1a, 20, 16);
    // Bezel edges
    px(g, 6, 7, 0x2a2a2a, 20, 1);   // top bezel
    px(g, 6, 22, 0x2a2a2a, 20, 1);  // bottom bezel
    px(g, 6, 7, 0x2a2a2a, 1, 16);   // left bezel
    px(g, 25, 7, 0x2a2a2a, 1, 16);  // right bezel
    // Screen (blue glow)
    px(g, 7, 8, 0x3070b0, 18, 14);
    px(g, 9, 10, 0x4090d0, 12, 8);  // inner glow
    px(g, 11, 12, 0x60b0f0, 6, 4);  // bright center
    // Stand (thin base)
    px(g, 12, 23, 0x303030, 8, 2);
    px(g, 10, 25, 0x404040, 12, 2);
    // Power LED
    px(g, 15, 22, 0x40ff40, 2, 1);
  });

  // --- item-couch ---
  makeTexture(scene, 'item-couch', TILE_SIZE, TILE_SIZE, (g) => {
    // ~28x14 wide couch, top-down/front view, centered in 32x32 canvas
    // Back cushions (top part)
    px(g, 2, 9, 0x7a3838, 28, 4);
    px(g, 2, 9, 0x8a4040, 28, 1); // highlight on back
    // Seat area (bottom part)
    px(g, 2, 13, 0x6a3030, 28, 8);
    // Cushion divider lines
    px(g, 11, 13, 0x582828, 1, 8);
    px(g, 20, 13, 0x582828, 1, 8);
    // Seat cushion highlights
    px(g, 4, 14, 0x8a4848, 6, 1);
    px(g, 13, 14, 0x8a4848, 6, 1);
    px(g, 22, 14, 0x8a4848, 6, 1);
    // Armrests (both sides)
    px(g, 2, 10, 0x5a2828, 3, 12);  // left arm
    px(g, 27, 10, 0x5a2828, 3, 12); // right arm
    // Armrest top highlights
    px(g, 2, 10, 0x6a3434, 3, 1);
    px(g, 27, 10, 0x6a3434, 3, 1);
    // Shadow under couch
    px(g, 3, 21, 0x402020, 26, 1);
    // Legs (visible at bottom)
    px(g, 4, 21, 0x402020, 2, 2);
    px(g, 26, 21, 0x402020, 2, 2);
  });

  // --- item-bong ---
  makeTexture(scene, 'item-bong', TILE_SIZE, TILE_SIZE, (g) => {
    // Base (water chamber - glass blue)
    px(g, 5, 8, 0x80b0d0, 5, 5);
    px(g, 6, 7, 0x80b0d0, 3, 1);
    // Water inside
    px(g, 5, 10, 0x4080b0, 5, 3);
    px(g, 6, 10, 0x5090c0, 3, 2);
    // Neck (tube going up)
    px(g, 7, 2, 0x90c0e0, 2, 6);
    px(g, 7, 2, 0xa0d0f0, 1, 5);
    // Mouthpiece
    px(g, 6, 1, 0x70a0c0, 4, 2);
    px(g, 7, 1, 0x80b0d0, 2, 1);
    // Bowl (side stem)
    px(g, 10, 6, 0x70a0c0, 2, 1);
    px(g, 11, 5, 0x70a0c0, 1, 2);
    px(g, 11, 4, 0x505050, 2, 2);
    px(g, 12, 4, 0x404040, 1, 1);
    // Glass highlight
    px(g, 6, 3, 0xd0f0ff, 1, 3);
    // Shadow
    px(g, 5, 13, 0x506070, 6, 1);
  });

  // --- item-star ---
  makeTexture(scene, 'item-star', TILE_SIZE, TILE_SIZE, (g) => {
    // Central sparkle (warm gold)
    px(g, 7, 7, 0xffd040, 2, 2);
    // Rays outward
    px(g, 7, 5, 0xffe060, 2, 2); // top
    px(g, 7, 9, 0xffe060, 2, 2); // bottom
    px(g, 5, 7, 0xffe060, 2, 2); // left
    px(g, 9, 7, 0xffe060, 2, 2); // right
    // Diagonal sparkle points
    px(g, 5, 5, 0xffc830, 1, 1);
    px(g, 10, 5, 0xffc830, 1, 1);
    px(g, 5, 10, 0xffc830, 1, 1);
    px(g, 10, 10, 0xffc830, 1, 1);
    // Outer glow dots
    px(g, 7, 3, 0xffb020, 1, 1);
    px(g, 8, 12, 0xffb020, 1, 1);
    px(g, 3, 7, 0xffb020, 1, 1);
    px(g, 12, 8, 0xffb020, 1, 1);
    // Core bright pixel
    px(g, 7, 7, 0xfffff0, 1, 1);
  });

  // --- item-toilet ---
  makeTexture(scene, 'item-toilet', TILE_SIZE, TILE_SIZE, (g) => {
    // Bowl (white porcelain)
    px(g, 4, 7, 0xe8e8e8, 8, 6);
    px(g, 5, 6, 0xe8e8e8, 6, 1);
    // Bowl shadow
    px(g, 4, 12, 0xc8c8c8, 8, 1);
    px(g, 11, 8, 0xd0d0d0, 1, 4);
    // Water inside
    px(g, 5, 9, 0x80c0e0, 6, 3);
    px(g, 6, 9, 0xa0d8f0, 4, 2);
    // Tank (back)
    px(g, 5, 2, 0xe0e0e0, 6, 5);
    px(g, 5, 2, 0xf0f0f0, 6, 1);
    // Flush handle
    px(g, 10, 3, 0xc0c0c0, 2, 1);
    px(g, 11, 3, 0xd0d0d0, 1, 1);
    // Seat rim
    px(g, 4, 7, 0xd8d8d8, 8, 1);
    // Shadow
    px(g, 5, 13, 0xa0a0a0, 7, 1);
  });

  // --- item-scratch ---
  makeTexture(scene, 'item-scratch', TILE_SIZE, TILE_SIZE, (g) => {
    // Wall background hint
    px(g, 3, 3, 0x606060, 10, 10);
    // Scratch marks (lighter lines on dark wall)
    // Tally marks - groups of 5
    px(g, 4, 4, 0xa0a090, 1, 6);
    px(g, 5, 4, 0xa0a090, 1, 6);
    px(g, 6, 4, 0xa0a090, 1, 6);
    px(g, 7, 4, 0xa0a090, 1, 6);
    // Diagonal cross mark
    px(g, 4, 5, 0xb0b0a0, 4, 1);
    px(g, 4, 7, 0xb0b0a0, 4, 1);
    // Second group
    px(g, 9, 5, 0x909080, 1, 5);
    px(g, 10, 5, 0x909080, 1, 5);
    px(g, 11, 5, 0x909080, 1, 5);
    // Scratch texture
    px(g, 5, 11, 0x808070, 3, 1);
    px(g, 9, 11, 0x808070, 2, 1);
  });

  // --- item-weights ---
  makeTexture(scene, 'item-weights', TILE_SIZE, TILE_SIZE, (g) => {
    // Bar (horizontal)
    px(g, 2, 7, 0xb0b0b0, 12, 2);
    px(g, 2, 7, 0xc0c0c0, 12, 1);
    // Left weight plates
    px(g, 1, 4, 0x404040, 3, 8);
    px(g, 1, 4, 0x505050, 3, 1);
    px(g, 1, 4, 0x505050, 1, 8);
    // Right weight plates
    px(g, 12, 4, 0x404040, 3, 8);
    px(g, 12, 4, 0x505050, 3, 1);
    px(g, 14, 4, 0x353535, 1, 8);
    // Grip texture on bar
    px(g, 6, 7, 0xd0d0d0, 1, 2);
    px(g, 8, 7, 0xd0d0d0, 1, 2);
    px(g, 10, 7, 0xd0d0d0, 1, 2);
    // Shadow
    px(g, 2, 12, 0x303030, 12, 1);
  });

  // --- item-window ---
  makeTexture(scene, 'item-window', TILE_SIZE, TILE_SIZE, (g) => {
    // Small window frame centered in tile (8x8 at offset 4,4)
    // Outer frame (thin grey border)
    px(g, 4, 4, 0x808890, 8, 1);  // top
    px(g, 4, 11, 0x606870, 8, 1); // bottom
    px(g, 4, 4, 0x707880, 1, 8);  // left
    px(g, 11, 4, 0x606870, 1, 8); // right
    // Cross bars dividing into 4 panes
    px(g, 7, 4, 0x707880, 1, 8);  // vertical bar
    px(g, 4, 7, 0x707880, 8, 1);  // horizontal bar
    // Glass panes (light blue, 2x2 each)
    px(g, 5, 5, 0x90d0f8, 2, 2);  // top-left pane
    px(g, 8, 5, 0x80c8f0, 3, 2);  // top-right pane
    px(g, 5, 8, 0x70b8e8, 2, 3);  // bottom-left pane
    px(g, 8, 8, 0x68b0e0, 3, 3);  // bottom-right pane
    // Tiny highlight on glass
    px(g, 5, 5, 0xc0e8ff, 1, 1);  // glint top-left
    // Sill
    px(g, 4, 12, 0x909898, 8, 1);
  });

  // --- item-desk ---
  makeTexture(scene, 'item-desk', TILE_SIZE, TILE_SIZE, (g) => {
    // Desk surface — dark wood, top-down view
    px(g, 2, 8, 0x5a3a20, 28, 14);
    // Surface top highlight
    px(g, 2, 8, 0x6a4a30, 28, 2);
    // Surface wood grain
    px(g, 6, 12, 0x503018, 18, 1);
    px(g, 4, 15, 0x503018, 22, 1);
    px(g, 8, 18, 0x503018, 14, 1);
    // Front edge shadow
    px(g, 2, 21, 0x3a2210, 28, 2);
    // Legs (front two visible)
    px(g, 4, 22, 0x4a3018, 3, 6);
    px(g, 25, 22, 0x4a3018, 3, 6);
    // Drawer handle
    px(g, 13, 22, 0x808070, 6, 1);
    // Items on desk — small monitor
    px(g, 12, 4, 0x1a1a1a, 8, 5);
    px(g, 13, 5, 0x3070b0, 6, 3);  // screen glow
    // Keyboard
    px(g, 10, 10, 0x303030, 12, 2);
    px(g, 11, 10, 0x404040, 10, 1);
  });

  // --- item-nightstand ---
  makeTexture(scene, 'item-nightstand', TILE_SIZE, TILE_SIZE, (g) => {
    // Small bedside table
    px(g, 8, 12, 0x6a4a30, 16, 12);
    // Top surface
    px(g, 7, 11, 0x7a5a40, 18, 2);
    // Front drawer
    px(g, 10, 16, 0x5a3a20, 12, 4);
    // Drawer handle
    px(g, 14, 17, 0x909080, 4, 1);
    // Shadow
    px(g, 8, 24, 0x3a2a18, 16, 1);
    // Legs
    px(g, 9, 23, 0x5a3a20, 2, 2);
    px(g, 21, 23, 0x5a3a20, 2, 2);
    // Lamp on top
    px(g, 14, 6, 0xd0c080, 4, 1);  // shade
    px(g, 13, 5, 0xe0d090, 6, 1);  // shade top
    px(g, 15, 7, 0x807060, 2, 4);  // lamp stem
    px(g, 14, 8, 0xf0e8a0, 1, 1);  // light dot
  });

  // --- item-bookshelf ---
  makeTexture(scene, 'item-bookshelf', TILE_SIZE, TILE_SIZE, (g) => {
    // Tall bookshelf — dark wood frame with colorful book spines
    // Frame (dark wood)
    px(g, 4, 2, 0x4a2a18, 24, 28);
    // Frame edges
    px(g, 4, 2, 0x5a3a20, 24, 1);  // top
    px(g, 4, 2, 0x5a3a20, 1, 28);  // left
    px(g, 27, 2, 0x3a2010, 1, 28); // right shadow
    px(g, 4, 29, 0x3a2010, 24, 1); // bottom shadow
    // Shelves (3 rows)
    px(g, 5, 11, 0x5a3a20, 22, 2);
    px(g, 5, 20, 0x5a3a20, 22, 2);
    // Book spines — row 1 (top shelf)
    px(g, 6, 3, 0xc03030, 3, 8);   // red book
    px(g, 10, 3, 0x3050a0, 3, 8);  // blue book
    px(g, 14, 4, 0x30a050, 2, 7);  // thin green
    px(g, 17, 3, 0xd0a030, 3, 8);  // yellow book
    px(g, 21, 3, 0x806040, 4, 8);  // brown book
    // Book spines — row 2 (middle shelf)
    px(g, 6, 13, 0x8040a0, 3, 7);  // purple book
    px(g, 10, 13, 0xa06030, 4, 7); // orange book
    px(g, 15, 14, 0x404040, 2, 6); // thin dark
    px(g, 18, 13, 0xc05050, 3, 7); // red book
    px(g, 22, 13, 0x2070a0, 3, 7); // blue book
    // Book spines — row 3 (bottom shelf)
    px(g, 6, 22, 0x50a050, 4, 7);  // green book
    px(g, 11, 22, 0xb0b0b0, 3, 7); // grey book
    px(g, 15, 22, 0xd08040, 3, 7); // orange
    px(g, 19, 23, 0x606080, 2, 6); // thin navy
    px(g, 22, 22, 0xc0a060, 3, 7); // tan book
  });

  // --- item-poster ---
  makeTexture(scene, 'item-poster', TILE_SIZE, TILE_SIZE, (g) => {
    // Wall poster — rectangular, slightly tilted feel
    // Paper background (off-white)
    px(g, 6, 3, 0xf0e8d8, 20, 24);
    // Border/frame
    px(g, 6, 3, 0xc0b8a0, 20, 1);   // top
    px(g, 6, 26, 0xc0b8a0, 20, 1);  // bottom
    px(g, 6, 3, 0xc0b8a0, 1, 24);   // left
    px(g, 25, 3, 0xc0b8a0, 1, 24);  // right
    // Bold text lines (motivational quote look)
    px(g, 9, 7, 0x202020, 14, 2);   // line 1
    px(g, 11, 11, 0x303030, 10, 2);  // line 2
    px(g, 9, 15, 0x202020, 14, 2);   // line 3
    // Small accent graphic (star/mountain)
    px(g, 14, 20, 0xd0a030, 4, 3);
    px(g, 15, 19, 0xd0a030, 2, 1);
    px(g, 16, 18, 0xe0b040, 1, 1);
    // Pin at top
    px(g, 16, 2, 0xd04040, 2, 2);
  });

  // --- item-fridge ---
  makeTexture(scene, 'item-fridge', TILE_SIZE, TILE_SIZE, (g) => {
    // ~16x24 tall fridge, centered in 32x32 canvas
    // Body (white/silver)
    px(g, 8, 3, 0xe0e0e0, 16, 26);
    // Top door (freezer, shorter)
    px(g, 8, 3, 0xd8d8d8, 16, 8);
    px(g, 8, 3, 0xf0f0f0, 16, 1); // top edge highlight
    // Gap between doors
    px(g, 8, 11, 0xa0a0a0, 16, 1);
    // Bottom door (fridge, taller)
    px(g, 8, 12, 0xe0e0e0, 16, 17);
    // Handles (right side)
    px(g, 23, 6, 0xb0b0b0, 1, 3);   // freezer handle
    px(g, 23, 16, 0xb0b0b0, 1, 5);  // fridge handle
    // Shadow on right edge
    px(g, 23, 4, 0xc0c0c0, 1, 25);
    // Shadow on bottom
    px(g, 8, 28, 0xa0a0a0, 16, 1);
    // Door edge highlight (left side)
    px(g, 8, 3, 0xf0f0f0, 1, 8);    // freezer left
    px(g, 8, 12, 0xf0f0f0, 1, 16);  // fridge left
  });

  // --- item-food ---
  makeTexture(scene, 'item-food', TILE_SIZE, TILE_SIZE, (g) => {
    // Plate (white circle-ish)
    px(g, 3, 8, 0xe8e8e8, 10, 5);
    px(g, 4, 7, 0xe8e8e8, 8, 1);
    px(g, 4, 13, 0xd0d0d0, 8, 1);
    // Plate rim highlight
    px(g, 4, 7, 0xf0f0f0, 8, 1);
    // Food items on plate
    // Meat/protein (brown)
    px(g, 5, 9, 0x8a5020, 4, 3);
    px(g, 5, 9, 0xa06030, 4, 1);
    // Greens
    px(g, 9, 9, 0x40a040, 3, 2);
    px(g, 10, 9, 0x50b050, 2, 1);
    // Rice/starch (white-ish)
    px(g, 6, 11, 0xf0e8d0, 3, 2);
    // Steam wisps
    px(g, 6, 6, 0xc0c0c0, 1, 1);
    px(g, 8, 5, 0xa0a0a0, 1, 1);
    px(g, 10, 6, 0xb0b0b0, 1, 1);
    // Shadow
    px(g, 4, 14, 0x808080, 9, 1);
  });

  // Shower head + water
  makeTexture(scene, 'item-shower', TILE_SIZE, TILE_SIZE, (g) => {
    // Shower arm (horizontal pipe)
    px(g, 6, 2, 0xc0c0c0, 8, 2);
    // Shower head (wider, angled down)
    px(g, 8, 4, 0xa8a8a8, 6, 3);
    px(g, 9, 4, 0xb8b8b8, 4, 1);
    // Water droplets
    px(g, 9, 8, 0x60a0e0, 1, 2);
    px(g, 11, 9, 0x60a0e0, 1, 3);
    px(g, 13, 8, 0x60a0e0, 1, 2);
    px(g, 10, 12, 0x4888c8, 1, 2);
    px(g, 12, 11, 0x4888c8, 1, 3);
    px(g, 8, 13, 0x4888c8, 1, 2);
    // Pipe mount
    px(g, 6, 1, 0x909090, 2, 2);
  });

  // Car (top-down, small sedan)
  makeTexture(scene, 'item-car', TILE_SIZE, TILE_SIZE, (g) => {
    // Body (dark blue)
    px(g, 4, 3, 0x2a3a6a, 8, 10);
    // Roof
    px(g, 5, 5, 0x3a4a7a, 6, 5);
    // Windshield (front)
    px(g, 5, 4, 0x80b0d0, 6, 2);
    // Rear window
    px(g, 5, 10, 0x6090b0, 6, 2);
    // Wheels (dark)
    px(g, 3, 4, 0x202020, 1, 3);
    px(g, 12, 4, 0x202020, 1, 3);
    px(g, 3, 9, 0x202020, 1, 3);
    px(g, 12, 9, 0x202020, 1, 3);
    // Headlights
    px(g, 5, 3, 0xf0e060, 2, 1);
    px(g, 9, 3, 0xf0e060, 2, 1);
    // Taillights
    px(g, 5, 13, 0xe03030, 2, 1);
    px(g, 9, 13, 0xe03030, 2, 1);
  });

  // Tennis ball (for fetch)
  makeTexture(scene, 'item-ball', TILE_SIZE, TILE_SIZE, (g) => {
    // Ball body (tennis ball green-yellow)
    px(g, 5, 5, 0xc8e020, 6, 6);
    px(g, 6, 4, 0xc8e020, 4, 1);
    px(g, 6, 11, 0xc8e020, 4, 1);
    px(g, 4, 6, 0xc8e020, 1, 4);
    px(g, 11, 6, 0xc8e020, 1, 4);
    // Seam line (white curve)
    px(g, 6, 5, 0xf0f0e0, 1, 1);
    px(g, 7, 6, 0xf0f0e0, 1, 1);
    px(g, 8, 7, 0xf0f0e0, 1, 1);
    px(g, 9, 8, 0xf0f0e0, 1, 1);
    px(g, 10, 9, 0xf0f0e0, 1, 1);
    // Highlight
    px(g, 6, 6, 0xd8f040, 2, 2);
    // Shadow
    px(g, 6, 12, 0x808020, 4, 1);
  });

  // Sister's crayon drawing
  makeTexture(scene, 'item-drawing', TILE_SIZE, TILE_SIZE, (g) => {
    // Paper background (white, slightly off-white)
    px(g, 3, 2, 0xf8f4e8, 10, 12);
    // Tape at top
    px(g, 6, 1, 0xd0c880, 4, 2);
    // Stick figure 1 (big - JP)
    px(g, 5, 5, 0x4060c0, 1, 1); // head
    px(g, 5, 6, 0x4060c0, 1, 3); // body
    px(g, 4, 7, 0x4060c0, 1, 1); // left arm
    px(g, 6, 7, 0x4060c0, 1, 1); // right arm
    px(g, 4, 9, 0x4060c0, 1, 2); // left leg
    px(g, 6, 9, 0x4060c0, 1, 2); // right leg
    // Stick figure 2 (small - sister)
    px(g, 9, 6, 0xff69b4, 1, 1); // head
    px(g, 9, 7, 0xff69b4, 1, 2); // body
    px(g, 8, 8, 0xff69b4, 1, 1); // left arm
    px(g, 10, 8, 0xff69b4, 1, 1); // right arm
    px(g, 8, 9, 0xff69b4, 1, 2); // left leg
    px(g, 10, 9, 0xff69b4, 1, 2); // right leg
    // Holding hands (connect)
    px(g, 7, 7, 0xc040a0, 2, 1);
    // Text "ME AND JP" (just colored dots as pixel text)
    px(g, 4, 12, 0xe04040, 8, 1);
  });

  // Record player / turntable
  makeTexture(scene, 'item-record', TILE_SIZE, TILE_SIZE, (g) => {
    // Turntable body (dark wood)
    px(g, 2, 4, 0x5a3a20, 12, 8);
    // Platter (black circle)
    px(g, 4, 5, 0x1a1a1a, 8, 6);
    px(g, 5, 4, 0x1a1a1a, 6, 1);
    px(g, 5, 11, 0x1a1a1a, 6, 1);
    // Record grooves (subtle)
    px(g, 5, 6, 0x252525, 6, 4);
    // Center label (red)
    px(g, 7, 7, 0xc03030, 2, 2);
    // Tonearm
    px(g, 12, 4, 0xb0b0b0, 1, 1);
    px(g, 11, 5, 0xa0a0a0, 1, 1);
    px(g, 10, 6, 0xa0a0a0, 1, 1);
    px(g, 9, 7, 0x808080, 1, 1);
    // Needle
    px(g, 9, 8, 0xc0c0c0, 1, 1);
  });

  // Sock (Ivy's gift)
  makeTexture(scene, 'item-sock', TILE_SIZE, TILE_SIZE, (g) => {
    // Sock body (white with stripe)
    px(g, 6, 3, 0xf0f0f0, 4, 6);
    px(g, 6, 5, 0xe0e0e0, 4, 1); // shadow fold
    // Toe curve
    px(g, 5, 9, 0xf0f0f0, 5, 2);
    px(g, 5, 8, 0xf0f0f0, 1, 1);
    // Red stripe at top
    px(g, 6, 3, 0xd04040, 4, 1);
    // Slight crumple (it's a used sock)
    px(g, 7, 6, 0xe8e8e8, 2, 1);
  });

  // Food plate (mom's plate)
  makeTexture(scene, 'item-plate', TILE_SIZE, TILE_SIZE, (g) => {
    // Plate (white circle)
    px(g, 3, 5, 0xf0f0f0, 10, 6);
    px(g, 4, 4, 0xf0f0f0, 8, 1);
    px(g, 4, 11, 0xe0e0e0, 8, 1);
    // Plate rim
    px(g, 3, 5, 0xe8e8e8, 1, 6);
    px(g, 12, 5, 0xe8e8e8, 1, 6);
    // Food - rice
    px(g, 5, 6, 0xf0e8c8, 3, 3);
    // Food - meat
    px(g, 8, 6, 0x8a5020, 3, 2);
    px(g, 8, 6, 0xa06830, 3, 1);
    // Food - veggies
    px(g, 6, 9, 0x40a040, 3, 1);
    // Steam
    px(g, 6, 3, 0xc0c0c0, 1, 1);
    px(g, 8, 2, 0xb0b0b0, 1, 1);
    px(g, 10, 3, 0xc0c0c0, 1, 1);
  });
}

export function generateAllSprites(scene: Phaser.Scene): void {
  generatePlayer(scene);
  generateChapterOutfits(scene);
  generateTiredPlayer(scene);
  generateJailSprites(scene);
  generateAllNPCs(scene);
  generateTiles(scene);
  generateUI(scene);
  generateHotTub(scene);
  generateBMW(scene);
  generateCorvetteC8(scene);
  generateLamboSVJ(scene);
  generateItems(scene);
  generateMoreItems(scene);
}
