import { TILE_SIZE, COLORS, GAME_WIDTH } from '../config';

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
  const eyeBlack = 0x202020;

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

function generatePlayer(scene: Phaser.Scene) {
  const frameW = TILE_SIZE;
  const frameH = TILE_SIZE;
  const sheetW = frameW * 8;
  const sheetH = frameH;

  // Create raw canvas for transparency
  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const rawCtx = canvas.getContext('2d')!;
  rawCtx.clearRect(0, 0, sheetW, sheetH);
  const dc = new DrawContext(rawCtx);

  const directions: Array<'down' | 'up' | 'left' | 'right'> = [
    'down',
    'up',
    'left',
    'right',
  ];

  let frameIndex = 0;
  for (const dir of directions) {
    drawPlayerFrame(dc, frameIndex * frameW, dir, false);
    frameIndex++;
    drawPlayerFrame(dc, frameIndex * frameW, dir, true);
    frameIndex++;
  }

  scene.textures.addCanvas('player', canvas);

  // Add spritesheet frame data
  const texture = scene.textures.get('player');
  for (let i = 0; i < 8; i++) {
    texture.add(i, 0, i * frameW, 0, frameW, frameH);
  }

  // Create animations
  // Frame layout: 0=down-idle, 1=down-step, 2=up-idle, 3=up-step, 4=left-idle, 5=left-step, 6=right-idle, 7=right-step
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

function generateAllNPCs(scene: Phaser.Scene) {
  // Friend — warm colors, friendly
  generateNPC(
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
  generateNPC(
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
      // Sunglasses
      px(g, 5, 4, 0x101010, 2, 1);
      px(g, 9, 4, 0x101010, 2, 1);
      px(g, 7, 4, 0x101010, 2, 1);
    }
  );

  // Guard — uniform
  generateNPC(
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
      px(g, 5, 8, 0xd0c030, 2, 2);
      // Hat brim
      px(g, 2, 2, 0x2050a0, 12, 1);
    }
  );

  // Farmer — overalls + hat
  generateNPC(
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
      px(g, 5, 8, 0x6080c0, 1, 3);
      px(g, 10, 8, 0x6080c0, 1, 3);
    }
  );

  // Tech — casual hoodie look
  generateNPC(
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
      px(g, 6, 9, 0x80c0f0, 4, 1); // blue accent stripe
    }
  );

  // Business — suit
  generateNPC(
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
      px(g, 7, 7, 0xc03030, 2, 1);
      px(g, 7, 8, 0xc03030, 2, 1);
      px(g, 7, 9, 0xa02828, 2, 1);
      // White collar
      px(g, 6, 7, 0xf0f0f0, 1, 1);
      px(g, 9, 7, 0xf0f0f0, 1, 1);
    }
  );

  // ── Story-specific NPCs (aliases + unique characters) ──

  // Female NPC (Mom)
  generateNPC(
    scene,
    'npc_female',
    0x402020, // dark hair
    'long',
    0x8040a0, // purple top
    0x9050b0,
    0x404060, // dark pants
    0xf0c090,
    0xd0a070
  );

  // Pops — older, warm, strong
  generateNPC(
    scene,
    'npc_pops',
    0x504030, // dark brown hair
    'short',
    0x806040, // brown shirt
    0x907050,
    0x405060, // dark jeans
    0xe0b080,
    0xc09060
  );

  // Kid — young, casual
  generateNPC(
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

  // Shady (underscore alias)
  generateNPC(
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
      px(g, 5, 4, 0x101010, 2, 1);
      px(g, 9, 4, 0x101010, 2, 1);
      px(g, 7, 4, 0x101010, 2, 1);
    }
  );

  // Generic NPC
  generateNPC(
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

  // Inmate — orange jumpsuit
  generateNPC(
    scene,
    'npc_inmate',
    0x303030,
    'bald',
    0xd07020, // orange jumpsuit
    0xc06018,
    0xd07020, // matching pants
    0xe0b080,
    0xc09060
  );

  // Inmate 2 — tatted, bald
  generateNPC(
    scene,
    'npc_inmate2',
    0x303030,
    'bald',
    0xd07020,
    0xc06018,
    0xd07020,
    0xd0a070, // slightly different skin
    0xb08858,
    (g) => {
      // Face tats — teardrop under left eye, cross on forehead, neck tats
      px(g, 5, 5, 0x304030, 1, 1); // teardrop under left eye
      px(g, 5, 6, 0x304030, 1, 1); // teardrop drip
      px(g, 7, 2, 0x304030, 2, 1); // cross on forehead (horizontal)
      px(g, 7, 1, 0x304030, 1, 2); // cross on forehead (vertical)
      px(g, 11, 4, 0x304030, 1, 2); // tat near right eye
      px(g, 5, 7, 0x304030, 3, 1); // neck tat left
      px(g, 9, 7, 0x304030, 3, 1); // neck tat right
      px(g, 3, 8, 0x304030, 1, 2); // arm sleeve tat
      px(g, 12, 8, 0x304030, 1, 2); // arm sleeve tat
    }
  );

  // Inmate 3 — big/tough, face scar + tats
  generateNPC(
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
      // Wider shoulders
      px(g, 1, 8, 0xd07020, 1, 2);
      px(g, 14, 8, 0xd07020, 1, 2);
      px(g, 1, 10, 0xc09060, 1, 1);
      px(g, 14, 10, 0xc09060, 1, 1);
      // Face scar across right cheek
      px(g, 9, 4, 0x805040, 3, 1);
      px(g, 10, 5, 0x805040, 2, 1);
      // Neck tattoo — thick
      px(g, 5, 7, 0x304030, 6, 1);
      // Arm tats
      px(g, 2, 9, 0x304030, 1, 2);
      px(g, 13, 9, 0x304030, 1, 2);
    }
  );

  // Inmate 4 — skinny, tired, face tat "13" on cheek
  generateNPC(
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
      px(g, 5, 5, 0x907060, 2, 1);
      px(g, 9, 5, 0x907060, 2, 1);
      // Face tat dots near eye
      px(g, 4, 4, 0x405040, 1, 1);
      px(g, 3, 5, 0x405040, 1, 1);
      // Neck tat
      px(g, 6, 7, 0x405040, 4, 1);
    }
  );

  // Guard (underscore alias)
  generateNPC(
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
      px(g, 5, 8, 0xd0c030, 2, 2);
      px(g, 2, 2, 0x2050a0, 12, 1);
    }
  );

  // Mirror — JP looking at himself (same as player but facing forward)
  generateNPC(
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

  // Farmer (underscore alias)
  generateNPC(
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
      px(g, 5, 8, 0x6080c0, 1, 3);
      px(g, 10, 8, 0x6080c0, 1, 3);
    }
  );

  // Computer NPC (placeholder — looks like a monitor)
  generateNPC(
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
  generateNPC(
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

  // Sticker Smith client
  generateNPC(
    scene,
    'npc_sticker',
    0x803020,
    'short',
    0x209020, // green brand shirt
    0x30a030,
    0x303840,
    0xe0b080,
    0xc09060
  );

  // Mentor figure
  generateNPC(
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
  generateNPC(
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

  // Malachi — business partner
  generateNPC(
    scene,
    'npc_malachi',
    0x201818,
    'short',
    0x2040a0, // blue button-up
    0x3050b0,
    0x303040,
    0xc09060,
    0xa07848
  );

  // Suit — big client
  generateNPC(
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
  generateNPC(
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

  // Sister — young girl, smaller, long dark hair, pink top
  makeTexture(scene, 'npc_sister', TILE_SIZE, TILE_SIZE, (g) => {
    // Shift everything down 2px to appear shorter
    const oy = 2;
    // Hair — long dark
    px(g, 5, oy + 0, 0x302020, 6, 1);
    px(g, 4, oy + 1, 0x302020, 8, 1);
    px(g, 3, oy + 2, 0x302020, 10, 1);
    px(g, 3, oy + 3, 0x302020, 2, 1);
    px(g, 11, oy + 3, 0x302020, 2, 1);
    // Long sides
    px(g, 2, oy + 4, 0x302020, 2, 3);
    px(g, 12, oy + 4, 0x302020, 2, 3);
    // Face
    px(g, 5, oy + 3, 0xf0c090, 6, 1);
    px(g, 4, oy + 4, 0xf0c090, 8, 1);
    px(g, 4, oy + 5, 0xf0c090, 8, 1);
    px(g, 5, oy + 6, 0xd0a070, 6, 1);
    // Eyes
    px(g, 5, oy + 4, 0xffffff, 2, 1);
    px(g, 9, oy + 4, 0xffffff, 2, 1);
    px(g, 6, oy + 4, 0x202020);
    px(g, 10, oy + 4, 0x202020);
    // Mouth — smile
    px(g, 7, oy + 5, 0xc07060, 2, 1);
    // Pink/purple top
    px(g, 4, oy + 7, 0xc060a0, 8, 1);
    px(g, 3, oy + 8, 0xc060a0, 10, 1);
    px(g, 3, oy + 9, 0xd070b0, 10, 1);
    // Shorts
    px(g, 4, oy + 10, 0x505060, 8, 1);
    px(g, 4, oy + 11, 0x505060, 3, 1);
    px(g, 9, oy + 11, 0x505060, 3, 1);
    // Shoes
    px(g, 4, oy + 12, 0xf08080, 3, 1);
    px(g, 9, oy + 12, 0xf08080, 3, 1);
  });

  // Frenchie — tan French Bulldog
  makeTexture(scene, 'npc_frenchie', TILE_SIZE, TILE_SIZE, (g) => {
    // Dog is centered, sits lower in the 16x16 tile
    const oy = 6;
    // Body — tan/fawn
    px(g, 4, oy + 2, 0xc8a070, 8, 4); // main body
    px(g, 3, oy + 3, 0xc8a070, 1, 2); // left side
    px(g, 12, oy + 3, 0xc8a070, 1, 2); // right side
    // Head — slightly darker face
    px(g, 5, oy + 0, 0xc8a070, 6, 2); // top of head
    px(g, 4, oy + 1, 0xa08050, 8, 1); // face
    // Big bat ears (characteristic Frenchie feature)
    px(g, 4, oy - 1, 0xa08050, 2, 2); // left ear
    px(g, 10, oy - 1, 0xa08050, 2, 2); // right ear
    px(g, 4, oy - 2, 0xa08050, 1, 1); // left ear tip
    px(g, 11, oy - 2, 0xa08050, 1, 1); // right ear tip
    // Inner ear (pink)
    px(g, 5, oy - 1, 0xd09080, 1, 1);
    px(g, 10, oy - 1, 0xd09080, 1, 1);
    // Eyes
    px(g, 6, oy + 0, 0x202020, 1, 1);
    px(g, 9, oy + 0, 0x202020, 1, 1);
    // Black nose
    px(g, 7, oy + 1, 0x101010, 2, 1);
    // Stubby legs
    px(g, 4, oy + 6, 0xc8a070, 2, 2); // front left
    px(g, 10, oy + 6, 0xc8a070, 2, 2); // front right
    // Tail — tiny stub
    px(g, 12, oy + 2, 0xb09060, 1, 1);
  });

  // Bikini Girl 1 — light blue bikini, long brown hair, lounging/sleeping
  makeTexture(scene, 'npc_bikini1', TILE_SIZE, TILE_SIZE, (g) => {
    const skin = 0xf0c890;
    const skinS = 0xd0a870;
    const hair = 0x604020;
    const bikini = 0x40a0c0;
    // Hair — long
    px(g, 5, 0, hair, 6, 1);
    px(g, 4, 1, hair, 8, 1);
    px(g, 3, 2, hair, 10, 1);
    px(g, 3, 3, hair, 2, 1);
    px(g, 11, 3, hair, 2, 1);
    px(g, 2, 4, hair, 2, 4);
    px(g, 12, 4, hair, 2, 4);
    // Face
    px(g, 5, 3, skin, 6, 1);
    px(g, 4, 4, skin, 8, 1);
    px(g, 4, 5, skin, 8, 1);
    px(g, 5, 6, skinS, 6, 1);
    // Eyes closed (sleeping)
    px(g, 5, 4, 0x806050, 2, 1);
    px(g, 9, 4, 0x806050, 2, 1);
    // Mouth
    px(g, 7, 5, 0xc07060, 2, 1);
    // Neck
    px(g, 6, 7, skinS, 4, 1);
    // Bikini top
    px(g, 4, 7, bikini, 2, 1);
    px(g, 10, 7, bikini, 2, 1);
    px(g, 3, 8, bikini, 10, 1);
    px(g, 4, 9, bikini, 8, 1);
    // Exposed midriff
    px(g, 4, 10, skin, 8, 1);
    px(g, 5, 11, skin, 6, 1);
    // Bikini bottom
    px(g, 5, 12, bikini, 6, 1);
    px(g, 5, 13, bikini, 3, 1);
    px(g, 8, 13, bikini, 3, 1);
    // Legs
    px(g, 4, 13, skin, 1, 1);
    px(g, 11, 13, skin, 1, 1);
    px(g, 4, 14, skin, 3, 1);
    px(g, 9, 14, skin, 3, 1);
    // Arms
    px(g, 2, 8, skin, 1, 2);
    px(g, 13, 8, skin, 1, 2);
  });

  // Bikini Girl 2 — pink bikini, dark hair
  makeTexture(scene, 'npc_bikini2', TILE_SIZE, TILE_SIZE, (g) => {
    const skin = 0xf0c890;
    const skinS = 0xd0a870;
    const hair = 0x302020;
    const bikini = 0xd06080;
    // Hair — long dark
    px(g, 5, 0, hair, 6, 1);
    px(g, 4, 1, hair, 8, 1);
    px(g, 3, 2, hair, 10, 1);
    px(g, 3, 3, hair, 2, 1);
    px(g, 11, 3, hair, 2, 1);
    px(g, 2, 4, hair, 2, 4);
    px(g, 12, 4, hair, 2, 4);
    // Face
    px(g, 5, 3, skin, 6, 1);
    px(g, 4, 4, skin, 8, 1);
    px(g, 4, 5, skin, 8, 1);
    px(g, 5, 6, skinS, 6, 1);
    // Eyes open
    px(g, 5, 4, 0xffffff, 2, 1);
    px(g, 9, 4, 0xffffff, 2, 1);
    px(g, 6, 4, 0x202020);
    px(g, 10, 4, 0x202020);
    // Mouth
    px(g, 7, 5, 0xc07060, 2, 1);
    // Neck
    px(g, 6, 7, skinS, 4, 1);
    // Bikini top
    px(g, 4, 7, bikini, 2, 1);
    px(g, 10, 7, bikini, 2, 1);
    px(g, 3, 8, bikini, 10, 1);
    px(g, 4, 9, bikini, 8, 1);
    // Exposed midriff
    px(g, 4, 10, skin, 8, 1);
    px(g, 5, 11, skin, 6, 1);
    // Bikini bottom
    px(g, 5, 12, bikini, 6, 1);
    px(g, 5, 13, bikini, 3, 1);
    px(g, 8, 13, bikini, 3, 1);
    // Legs
    px(g, 4, 13, skin, 1, 1);
    px(g, 11, 13, skin, 1, 1);
    px(g, 4, 14, skin, 3, 1);
    px(g, 9, 14, skin, 3, 1);
    // Arms
    px(g, 2, 8, skin, 1, 2);
    px(g, 13, 8, skin, 1, 2);
  });

  // Narrator / Professor — older, grey hair, wise
  generateNPC(
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
}

// ─── TILE SPRITES ───────────────────────────────────────────────────

function generateTiles(scene: Phaser.Scene) {
  const S = TILE_SIZE;

  // -- Grass --
  makeTexture(scene, 'tile-grass', S, S, (g) => {
    // Base
    g.fillStyle(COLORS.grassGreen);
    g.fillRect(0, 0, S, S);
    // Variation — lighter patches
    g.fillStyle(COLORS.grassLight);
    px(g, 2, 3, COLORS.grassLight, 2, 1);
    px(g, 8, 1, COLORS.grassLight, 3, 1);
    px(g, 5, 7, COLORS.grassLight, 2, 1);
    px(g, 12, 10, COLORS.grassLight, 2, 1);
    px(g, 1, 12, COLORS.grassLight, 2, 1);
    px(g, 10, 5, COLORS.grassLight, 1, 2);
    // Darker blades
    px(g, 4, 2, COLORS.grassDark);
    px(g, 11, 6, COLORS.grassDark);
    px(g, 7, 11, COLORS.grassDark);
    px(g, 14, 3, COLORS.grassDark);
    px(g, 1, 8, COLORS.grassDark);
    // Tiny flower accents (occasional)
    px(g, 3, 9, 0xf0e060);
    px(g, 13, 13, 0xf0e060);
  });

  // -- Sand --
  makeTexture(scene, 'tile-sand', S, S, (g) => {
    g.fillStyle(COLORS.sandYellow);
    g.fillRect(0, 0, S, S);
    // Texture
    px(g, 3, 2, COLORS.sandLight, 3, 1);
    px(g, 10, 5, COLORS.sandLight, 2, 1);
    px(g, 1, 10, COLORS.sandLight, 2, 1);
    px(g, 7, 13, COLORS.sandLight, 3, 1);
    px(g, 5, 7, COLORS.sandDark, 2, 1);
    px(g, 12, 11, COLORS.sandDark);
    px(g, 2, 14, COLORS.sandDark);
    // Small pebble
    px(g, 9, 3, 0xb8a080);
    px(g, 14, 9, 0xb8a080);
  });

  // -- Water (2-frame animation sheet) --
  makeTexture(scene, 'tile-water', S * 2, S, (g) => {
    // Frame 1
    g.fillStyle(COLORS.waterBlue);
    g.fillRect(0, 0, S, S);
    px(g, 2, 3, COLORS.waterLight, 4, 1);
    px(g, 9, 7, COLORS.waterLight, 3, 1);
    px(g, 1, 11, COLORS.waterLight, 5, 1);
    px(g, 5, 1, COLORS.waterDark, 3, 1);
    px(g, 11, 5, COLORS.waterDark, 2, 1);
    px(g, 3, 14, COLORS.waterDark, 4, 1);
    // Sparkle
    px(g, 6, 4, 0x80d0ff);
    px(g, 13, 9, 0x80d0ff);

    // Frame 2 — shifted highlights
    g.fillStyle(COLORS.waterBlue);
    g.fillRect(S, 0, S, S);
    px(g, S + 4, 5, COLORS.waterLight, 4, 1);
    px(g, S + 11, 2, COLORS.waterLight, 3, 1);
    px(g, S + 2, 9, COLORS.waterLight, 5, 1);
    px(g, S + 7, 13, COLORS.waterDark, 3, 1);
    px(g, S + 1, 3, COLORS.waterDark, 2, 1);
    px(g, S + 10, 7, COLORS.waterDark, 4, 1);
    px(g, S + 8, 1, 0x80d0ff);
    px(g, S + 3, 11, 0x80d0ff);
  });

  // -- Path --
  makeTexture(scene, 'tile-path', S, S, (g) => {
    g.fillStyle(COLORS.pathBrown);
    g.fillRect(0, 0, S, S);
    px(g, 1, 2, COLORS.pathLight, 3, 1);
    px(g, 8, 6, COLORS.pathLight, 2, 1);
    px(g, 3, 11, COLORS.pathLight, 4, 1);
    px(g, 12, 3, COLORS.pathDark, 2, 1);
    px(g, 5, 8, COLORS.pathDark, 3, 1);
    px(g, 10, 13, COLORS.pathDark, 2, 1);
    // Pebbles
    px(g, 4, 4, 0x908070);
    px(g, 11, 9, 0x908070);
  });

  // -- Wall --
  makeTexture(scene, 'tile-wall', S, S, (g) => {
    g.fillStyle(COLORS.wallGrey);
    g.fillRect(0, 0, S, S);
    // Brick lines
    g.fillStyle(COLORS.wallDark);
    g.fillRect(0, 4, S, 1);
    g.fillRect(0, 9, S, 1);
    g.fillRect(0, 14, S, 1);
    g.fillRect(7, 0, 1, 4);
    g.fillRect(3, 5, 1, 4);
    g.fillRect(11, 5, 1, 4);
    g.fillRect(7, 10, 1, 4);
    // Highlights
    px(g, 1, 1, COLORS.wallLight, 5, 1);
    px(g, 9, 6, COLORS.wallLight, 2, 1);
    px(g, 4, 11, COLORS.wallLight, 3, 1);
  });

  // -- Floor --
  makeTexture(scene, 'tile-floor', S, S, (g) => {
    g.fillStyle(COLORS.floorBeige);
    g.fillRect(0, 0, S, S);
    // Tile grid lines
    g.fillStyle(0xb0a080);
    g.fillRect(0, 0, S, 1);
    g.fillRect(0, 0, 1, S);
    // Subtle variation
    px(g, 5, 5, 0xd0c0a0, 3, 3);
    px(g, 10, 10, 0xb8a888, 2, 2);
  });

  // -- Dark Floor --
  makeTexture(scene, 'tile-dark-floor', S, S, (g) => {
    g.fillStyle(COLORS.darkFloor);
    g.fillRect(0, 0, S, S);
    g.fillStyle(0x383040);
    g.fillRect(0, 0, S, 1);
    g.fillRect(0, 0, 1, S);
    px(g, 6, 6, 0x504860, 3, 3);
    px(g, 11, 3, 0x403848, 2, 2);
  });

  // -- Dirt --
  makeTexture(scene, 'tile-dirt', S, S, (g) => {
    g.fillStyle(COLORS.dirtBrown);
    g.fillRect(0, 0, S, S);
    px(g, 2, 3, 0xa88860, 3, 1);
    px(g, 9, 7, 0x8a6a40, 2, 1);
    px(g, 1, 12, 0xa88860, 4, 1);
    px(g, 7, 1, 0x8a6a40);
    px(g, 13, 10, 0xa88860, 2, 1);
    // Tilled lines
    g.fillStyle(0x7a5a30);
    g.fillRect(0, 5, S, 1);
    g.fillRect(0, 11, S, 1);
  });

  // -- Concrete / Road (dark asphalt) --
  makeTexture(scene, 'tile-concrete', S, S, (g) => {
    // Dark asphalt base
    g.fillStyle(0x404048);
    g.fillRect(0, 0, S, S);
    // Texture variation
    px(g, 2, 3, 0x484850, 3, 2);
    px(g, 9, 8, 0x484850, 4, 2);
    px(g, 1, 12, 0x484850, 2, 1);
    // Darker patches (wear marks)
    px(g, 6, 1, 0x383840, 2, 1);
    px(g, 11, 6, 0x383840, 2, 2);
    px(g, 3, 10, 0x383840, 1, 2);
    // Subtle crack
    px(g, 5, 5, 0x353538, 1, 3);
  });

  // -- Door --
  makeTexture(scene, 'tile-door', S, S, (g) => {
    // Frame
    g.fillStyle(0x705030);
    g.fillRect(0, 0, S, S);
    // Door panels
    g.fillStyle(0x905830);
    g.fillRect(2, 1, 12, 14);
    // Panel insets
    g.fillStyle(0x804820);
    g.fillRect(3, 2, 4, 5);
    g.fillRect(9, 2, 4, 5);
    g.fillRect(3, 9, 4, 5);
    g.fillRect(9, 9, 4, 5);
    // Handle
    px(g, 11, 8, 0xd0c030, 1, 2);
  });

  // -- Tree --
  makeTexture(scene, 'tile-tree', S, S, (g) => {
    // Trunk
    px(g, 6, 10, COLORS.treeTrunk, 4, 6);
    px(g, 7, 10, 0x7a6040, 2, 6);
    // Canopy — rounded shape
    g.fillStyle(COLORS.treeGreen);
    g.fillRect(3, 2, 10, 7);
    g.fillRect(2, 3, 12, 5);
    g.fillRect(4, 1, 8, 1);
    // Shading
    g.fillStyle(COLORS.treeDark);
    g.fillRect(3, 6, 10, 2);
    g.fillRect(2, 5, 1, 2);
    // Highlights
    px(g, 5, 2, 0x40a040, 3, 2);
    px(g, 9, 3, 0x40a040, 2, 1);
  });

  // -- Palm Tree --
  makeTexture(scene, 'tile-palm', S, S, (g) => {
    // Trunk — curved
    px(g, 7, 8, 0x907050, 2, 8);
    px(g, 8, 7, 0x907050, 2, 1);
    px(g, 8, 6, 0xa08060, 1, 1);
    // Bark texture
    px(g, 7, 9, 0x806040, 2, 1);
    px(g, 7, 11, 0x806040, 2, 1);
    px(g, 7, 13, 0x806040, 2, 1);
    // Fronds (leaves spreading out)
    g.fillStyle(0x30a030);
    // Left frond
    px(g, 1, 3, 0x30a030, 7, 1);
    px(g, 0, 4, 0x30a030, 6, 1);
    px(g, 0, 5, 0x209020, 4, 1);
    // Right frond
    px(g, 9, 2, 0x30a030, 6, 1);
    px(g, 10, 3, 0x30a030, 6, 1);
    px(g, 12, 4, 0x209020, 4, 1);
    // Top fronds
    px(g, 5, 1, 0x30a030, 5, 1);
    px(g, 6, 0, 0x40b040, 4, 1);
    // Center
    px(g, 7, 2, 0x50c050, 3, 2);
    // Coconuts
    px(g, 6, 4, 0x805020, 2, 2);
    px(g, 9, 5, 0x906030);
  });

  // -- Fence --
  makeTexture(scene, 'tile-fence', S, S, (g) => {
    // Posts
    g.fillStyle(0x907050);
    g.fillRect(1, 2, 3, 14);
    g.fillRect(12, 2, 3, 14);
    // Rails
    g.fillStyle(0xa08060);
    g.fillRect(0, 4, S, 2);
    g.fillRect(0, 10, S, 2);
    // Post tops
    px(g, 1, 1, 0xb09070, 3, 1);
    px(g, 12, 1, 0xb09070, 3, 1);
    // Wood grain
    px(g, 2, 6, 0x806040, 1, 3);
    px(g, 13, 6, 0x806040, 1, 3);
  });

  // -- Computer --
  makeTexture(scene, 'tile-computer', S, S, (g) => {
    // Desk
    g.fillStyle(0x806040);
    g.fillRect(0, 10, S, 6);
    px(g, 0, 10, 0x906848, S, 1); // desk top edge
    // Desk legs
    px(g, 1, 14, 0x604020, 2, 2);
    px(g, 13, 14, 0x604020, 2, 2);
    // Monitor
    g.fillStyle(0x404050);
    g.fillRect(2, 1, 12, 8);
    // Screen
    g.fillStyle(0x3060a0);
    g.fillRect(3, 2, 10, 6);
    // Screen content (code lines)
    px(g, 4, 3, 0x60c060, 4, 1);
    px(g, 4, 5, 0x60c060, 6, 1);
    px(g, 4, 7, 0x60c060, 3, 1);
    // Stand
    px(g, 6, 9, 0x404050, 4, 1);
    px(g, 7, 10, 0x404050, 2, 1);
    // Keyboard
    g.fillStyle(0x505060);
    g.fillRect(3, 11, 10, 2);
    px(g, 4, 11, 0x606070, 8, 1);
  });

  // -- Tractor --
  makeTexture(scene, 'tile-tractor', S, S, (g) => {
    // Body
    g.fillStyle(0xc03030);
    g.fillRect(3, 3, 10, 6);
    px(g, 4, 2, 0xd04040, 8, 1); // top
    // Cab / window
    g.fillStyle(0x80c0e0);
    g.fillRect(4, 3, 4, 3);
    // Engine/hood
    g.fillStyle(0xa02828);
    g.fillRect(9, 4, 4, 4);
    px(g, 13, 5, 0x808080, 1, 2); // exhaust
    // Big back wheel
    g.fillStyle(0x303030);
    g.fillRect(3, 9, 6, 6);
    px(g, 4, 10, 0x505050, 4, 4); // hubcap
    px(g, 5, 11, 0x303030, 2, 2);
    // Small front wheel
    g.fillRect(11, 11, 4, 4);
    px(g, 12, 12, 0x505050, 2, 2);
    // Axle
    px(g, 9, 12, 0x606060, 2, 1);
  });

  // -- Building Wall (exterior) --
  makeTexture(scene, 'tile-building-wall', S, S, (g) => {
    g.fillStyle(0xa09888);
    g.fillRect(0, 0, S, S);
    // Brick pattern
    g.fillStyle(0x908878);
    g.fillRect(0, 3, S, 1);
    g.fillRect(0, 7, S, 1);
    g.fillRect(0, 11, S, 1);
    g.fillRect(0, 15, S, 1);
    g.fillRect(4, 0, 1, 3);
    g.fillRect(12, 0, 1, 3);
    g.fillRect(0, 4, 1, 3);
    g.fillRect(8, 4, 1, 3);
    g.fillRect(4, 8, 1, 3);
    g.fillRect(12, 8, 1, 3);
    g.fillRect(0, 12, 1, 3);
    g.fillRect(8, 12, 1, 3);
    // Highlights
    px(g, 1, 0, 0xb0a898, 3, 1);
    px(g, 5, 4, 0xb0a898, 3, 1);
    px(g, 1, 8, 0xb0a898, 3, 1);
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
  const frameW = TILE_SIZE;
  const frameH = TILE_SIZE;
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
      colors: { shirt: 0x606068, shirtLight: 0x707078, pants: 0x383840, pantsLight: 0x484850, shoe: 0x303030 },
    },
    {
      key: 'player-ch6',
      colors: { shirt: 0x1a2040, shirtLight: 0x243050, pants: 0x181820, pantsLight: 0x222230, shoe: 0x202020 },
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
      drawPlayerFrame(dc, frameIndex * frameW, dir, false, colors);
      frameIndex++;
      drawPlayerFrame(dc, frameIndex * frameW, dir, true, colors);
      frameIndex++;
    }

    scene.textures.addCanvas(key, canvas);
    const texture = scene.textures.get(key);
    for (let i = 0; i < 8; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH);
    }
  }
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────

// ─── HOT TUB TILE ────────────────────────────────────────────────────
// Bubbly warm water, not ocean waves

function generateHotTub(scene: Phaser.Scene) {
  const S = TILE_SIZE;
  // Create a static bubbly tile
  makeTexture(scene, 'tile-hottub', S, S, (g) => {
    // Warm blue base
    g.fillStyle(0x4098d0);
    g.fillRect(0, 0, S, S);

    // Lighter warm water patches
    px(g, 2, 2, 0x50a8e0, 3, 2);
    px(g, 8, 6, 0x50a8e0, 4, 2);
    px(g, 1, 10, 0x50a8e0, 3, 2);
    px(g, 10, 12, 0x50a8e0, 3, 2);

    // Bubbles — white/light circles scattered
    px(g, 3, 3, 0xd0e8ff, 2, 2);
    px(g, 10, 2, 0xd0e8ff, 2, 2);
    px(g, 6, 7, 0xe0f0ff, 2, 2);
    px(g, 13, 8, 0xd0e8ff, 2, 2);
    px(g, 2, 12, 0xe0f0ff, 2, 2);
    px(g, 8, 13, 0xd0e8ff, 2, 2);
    px(g, 14, 14, 0xe0f0ff, 1, 1);

    // Bubble highlights (bright white dots)
    px(g, 3, 3, 0xffffff, 1, 1);
    px(g, 10, 2, 0xffffff, 1, 1);
    px(g, 6, 7, 0xffffff, 1, 1);
    px(g, 13, 8, 0xffffff, 1, 1);
    px(g, 2, 12, 0xffffff, 1, 1);
    px(g, 8, 13, 0xffffff, 1, 1);

    // Steam wisps (very light)
    px(g, 4, 0, 0xc0d8f0, 2, 1);
    px(g, 11, 1, 0xc0d8f0, 2, 1);
    px(g, 7, 0, 0xb0d0e8, 1, 1);
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
}

export function generateAllSprites(scene: Phaser.Scene): void {
  generatePlayer(scene);
  generateChapterOutfits(scene);
  generateAllNPCs(scene);
  generateTiles(scene);
  generateUI(scene);
  generateHotTub(scene);
  generateBMW(scene);
  generateItems(scene);
}
