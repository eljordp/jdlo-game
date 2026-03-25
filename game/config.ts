// Core game constants — shared across all systems and scenes

export const TILE_SIZE = 32;
export const SCALE = 2;
export const SCALED_TILE = TILE_SIZE * SCALE; // 64px per tile on screen

// Character sprites: 32x32 at scale 2 = 64px on screen (same as 16x16 at scale 4, but 4x detail)
export const CHAR_SIZE = 32;
export const CHAR_SCALE = 2;

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 960;

export const MOVEMENT_SPEED = 120;

// How many tiles fit on screen
export const TILES_X = Math.ceil(GAME_WIDTH / SCALED_TILE); // ~17
export const TILES_Y = Math.ceil(GAME_HEIGHT / SCALED_TILE); // ~13

export const COLORS = {
  // UI
  dialogueBg: 0x1a1a2e,
  dialogueBorder: 0x3a3a5e,
  dialogueText: '#ffffff',
  speakerText: '#f0c040',

  // Environment
  grassGreen: 0x4a8c3f,
  grassLight: 0x5ca04e,
  grassDark: 0x3a7030,
  sandYellow: 0xd4b896,
  sandLight: 0xe0c8a8,
  sandDark: 0xc0a47e,
  waterBlue: 0x3080c0,
  waterLight: 0x48a0e0,
  waterDark: 0x2060a0,
  pathBrown: 0xa08060,
  pathLight: 0xb89878,
  pathDark: 0x886848,
  wallGrey: 0x808090,
  wallLight: 0x9898a8,
  wallDark: 0x606070,
  floorBeige: 0xc8b898,
  darkFloor: 0x484050,
  dirtBrown: 0x9a7a50,
  concrete: 0x505058,
  treeTrunk: 0x6a5030,
  treeGreen: 0x308030,
  treeDark: 0x206020,
  houseWall: 0xe8e0d4,      // warm cream drywall
  houseWallDark: 0xc8c0b4,  // shadow/trim
  houseWallLight: 0xf0e8dc,  // highlight
  hardwood: 0x8a6840,        // warm oak
  hardwoodLight: 0xa07850,   // highlight grain
  hardwoodDark: 0x705530,    // shadow grain
  counter: 0x404048,         // dark granite counter
  counterLight: 0x505058,    // granite highlight

  // Character — JP is tan with black hair, brown eyes
  skinTone: 0xd4a870,
  skinShadow: 0xb88850,
  hairDark: 0x101010,
  shirtBlue: 0x4060c0,
  pantsGrey: 0x505060,
  shoeDark: 0x303030,
} as const;

export const FONT_STYLE = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '14px',
  color: COLORS.dialogueText,
  wordWrap: { width: 1160, useAdvancedWrap: true },
  lineSpacing: 8,
};

export const SPEAKER_FONT_STYLE = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '12px',
  color: COLORS.speakerText,
};

// Tile IDs — must match maps.ts TILES constant
export const TILE_IDS = {
  EMPTY: 0,
  GRASS: 1,
  SAND: 2,
  WATER: 3,
  PATH: 4,
  WALL: 5,
  FLOOR: 6,
  DARK_FLOOR: 7,
  DIRT: 8,
  CONCRETE: 9,
  DOOR: 10,
  TREE: 11,
  PALM: 12,
  FENCE: 13,
  COMPUTER: 14,
  TRACTOR: 15,
  BUILDING_WALL: 16,
  HOT_TUB: 17,
  VINE: 18,
  HOUSE_WALL: 19,
  HARDWOOD: 20,
  COUNTER: 21,
} as const;
