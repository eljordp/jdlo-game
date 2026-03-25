// ---------------------------------------------------------------------------
// Tile Map Data — Pokemon Platinum-style maps for each chapter
// Each tile is 16x16 px. Maps range from 20x18 (home) to 35x30 (jail).
// ---------------------------------------------------------------------------

export const TILES = {
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
} as const;

export type InteractableType = 'examine' | 'item' | 'evolve' | 'showcase' | 'scratch';

export type MapData = {
  tiles: number[][];
  collisions: number[];
  spawns: {
    player: { x: number; y: number };
    npcs: { id: string; x: number; y: number; sprite: string }[];
  };
  triggers: { x: number; y: number; action: string; target?: string }[];
  interactables: { id: string; x: number; y: number; type: InteractableType; sprite?: string; glow?: boolean }[];
};

// Shorthand aliases so the grids stay compact and readable
const _ = TILES.EMPTY;
const G = TILES.GRASS;
const S = TILES.SAND;
const W = TILES.WATER;
const P = TILES.PATH;
const X = TILES.WALL;
const F = TILES.FLOOR;
const D = TILES.DARK_FLOOR;
const I = TILES.DIRT;
const C = TILES.CONCRETE;
const O = TILES.DOOR;
const T = TILES.TREE;
const L = TILES.PALM;
const E = TILES.FENCE;
const M = TILES.COMPUTER;
const R = TILES.TRACTOR;
const B = TILES.BUILDING_WALL;
const H = TILES.HOT_TUB;

// Collision tiles shared across most maps
const STANDARD_COLLISIONS = [
  TILES.WATER,
  TILES.WALL,
  TILES.TREE,
  TILES.PALM,
  TILES.FENCE,
  TILES.COMPUTER,
  TILES.TRACTOR,
  TILES.BUILDING_WALL,
  TILES.HOT_TUB,
];

// ---------------------------------------------------------------------------
// 0. HOME MAP — Suburban House + Yard  (30 wide x 25 tall)
// ---------------------------------------------------------------------------
// JP's childhood home before everything changes. Proper suburban house with
// JP's room, sister's room, parents' room, living room, kitchen, bathroom.
// Yard with grass and the Frenchie. Street at bottom exits to BeachScene.
// ---------------------------------------------------------------------------
export const homeMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    [ T, G, G, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, T ], // 0  roof line
    [ G, G, G, B, F, F, F, F, F, B, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, B, G, G, G ], // 1  JP room | sister | parents room | bathroom
    [ G, G, G, B, F, M, F, F, F, B, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, B, G, G, G ], // 2  M=computer in JP room
    [ G, G, G, B, F, F, F, F, F, B, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, B, G, G, G ], // 3
    [ G, G, G, B, F, F, F, F, F, B, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, B, G, G, G ], // 4
    [ G, G, G, B, B, B, B, O, B, B, B, B, O, B, B, B, B, O, B, B, B, B, B, O, B, B, B, G, G, G ], // 5  doors to hallway
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 6  hallway
    [ G, G, G, B, B, B, O, B, B, B, B, B, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, G, G, G ], // 7  doors to living room + kitchen
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 8  living room | kitchen
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 9
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 10
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 11
    [ G, G, G, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, F, B, G, G, G ], // 12
    [ G, G, G, B, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G ], // 13 front door
    [ G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 14 yard
    [ G, G, E, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 15 fence top
    [ G, G, E, G, G, T, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, E, G, G ], // 16 yard interior
    [ G, G, E, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 17
    [ G, G, E, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 18
    [ G, G, E, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 19
    [ G, G, E, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 20 fence bottom
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 21 street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 22 street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 23 street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 24 street exit
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 6, y: 3 },  // JP starts in his room
    npcs: [
      { id: 'ch0_pops',    x: 8,  y: 10, sprite: 'npc_pops' },    // living room
      { id: 'ch0_mom',     x: 18, y: 10, sprite: 'npc_female' },   // kitchen
      { id: 'ch0_sister',  x: 12, y: 2,  sprite: 'npc_sister' },   // sister's room
      { id: 'ch0_frenchie', x: 15, y: 18, sprite: 'npc_frenchie' }, // yard
    ],
  },
  triggers: [
    // Street exit at bottom edge → BeachScene
    { x: 9,  y: 24, action: 'scene', target: 'BeachScene' },
    { x: 10, y: 24, action: 'scene', target: 'BeachScene' },
    { x: 11, y: 24, action: 'scene', target: 'BeachScene' },
    { x: 12, y: 24, action: 'scene', target: 'BeachScene' },
    { x: 13, y: 24, action: 'scene', target: 'BeachScene' },
    { x: 14, y: 24, action: 'scene', target: 'BeachScene' },
  ],
  interactables: [
    // JP's Room
    { id: 'ch0_computer',      x: 5,  y: 1,  type: 'examine', glow: true, sprite: 'item-tablet' },  // next to M tile
    { id: 'ch0_crypto',        x: 7,  y: 1,  type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch0_college',       x: 8,  y: 2,  type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch0_bed',           x: 4,  y: 4,  type: 'examine', glow: true, sprite: 'item-bed' },
    { id: 'ch0_poster',        x: 8,  y: 4,  type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch0_hidden_stash',  x: 4,  y: 1,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch0_journal',       x: 6,  y: 4,  type: 'examine', glow: true, sprite: 'item-book' },
    // Sister's Room
    { id: 'ch0_sister_toys',   x: 11, y: 4,  type: 'examine', glow: true, sprite: 'item-star' },
    // Parents' Room
    { id: 'ch0_family_photo',  x: 16, y: 1,  type: 'examine', glow: true, sprite: 'item-photo' },
    // Bathroom
    { id: 'ch0_mirror',        x: 24, y: 1,  type: 'examine', glow: true, sprite: 'item-mirror' },
    // Living Room
    { id: 'ch0_tv',            x: 5,  y: 8,  type: 'examine', glow: true, sprite: 'item-tv' },
    { id: 'ch0_couch',         x: 10, y: 9,  type: 'examine', glow: true, sprite: 'item-couch' },
    // Kitchen
    { id: 'ch0_fridge',        x: 16, y: 8,  type: 'examine', glow: true, sprite: 'item-fridge' },
    { id: 'ch0_mail',          x: 20, y: 9,  type: 'examine', glow: true, sprite: 'item-letter' },
    // Yard
    { id: 'ch0_bbq',           x: 6,  y: 17, type: 'examine', glow: true, sprite: 'item-bbq' },
    { id: 'ch0_goodbye',       x: 10, y: 20, type: 'examine', glow: true, sprite: 'item-star' },
  ],
};

// ---------------------------------------------------------------------------
// 1. BEACH MAP — Frat House by the Beach, Santa Barbara  (28 wide x 22 tall)
// ---------------------------------------------------------------------------
// Dirty house interior at top (living room, JP's room, kitchen, hot tub area).
// Path/concrete connecting house to beach. Sand + water along the south.
// ---------------------------------------------------------------------------
export const beachMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
    [ B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B ], // 0  house top wall
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, C, C, C, C, C, C, B ], // 1  living room | JP room | kitchen | hot tub patio
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 2  hot tub (bubbly)
    [ B, F, F, F, F, F, F, F, B, F, F, F, M, F, B, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 3  computer in JP room
    [ B, F, F, F, F, F, F, F, O, F, F, F, F, F, O, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 4  doors between rooms
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 5
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, C, C, C, C, C, C, B ], // 6
    [ B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B ], // 7  house bottom wall with doors
    [ G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G ], // 8  paths from house doors
    [ G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G ], // 9
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 10 concrete walkway
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 11
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 12 grass transition
    [ G, G, L, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, L, G, G ], // 13
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 14 sand starts
    [ S, S, S, S, S, S, S, S, L, S, S, S, S, S, S, S, S, S, S, L, S, S, S, S, S, S, S, S ], // 15
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 16
    [ S, S, S, S, S, L, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, L, S, S, S, S, S ], // 17
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 18
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 19 ocean
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 20
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 21
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 11, y: 9 },
    npcs: [
      { id: 'ch1_homie1', x: 6,  y: 4,  sprite: 'npc_nolan' },
      { id: 'ch1_homie2', x: 16, y: 4,  sprite: 'npc_david' },
      { id: 'ch1_cooper',  x: 5,  y: 2,  sprite: 'npc_cooper' },
      { id: 'ch1_girl1',  x: 20, y: 2,  sprite: 'npc_bikini1' },
      { id: 'ch1_girl2',  x: 26, y: 3,  sprite: 'npc_bikini2' },
      { id: 'ch1_girl3',  x: 20, y: 5,  sprite: 'npc_bikini1' },
      { id: 'ch1_girl_couch', x: 3, y: 5, sprite: 'npc_bikini2' },
    ],
  },
  triggers: [
    { x: 12, y: 18, action: 'scene', target: 'WrongCrowdScene' },
    { x: 13, y: 18, action: 'scene', target: 'WrongCrowdScene' },
    { x: 14, y: 18, action: 'scene', target: 'WrongCrowdScene' },
    { x: 15, y: 18, action: 'scene', target: 'WrongCrowdScene' },
  ],
  interactables: [
    { id: 'ch1_weed1',   x: 12, y: 3,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_weed2',   x: 10, y: 5,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_weed3',   x: 4,  y: 2,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_bottles', x: 16, y: 2,  type: 'examine', glow: true, sprite: 'item-bottle' },
    { id: 'ch1_hottub',  x: 23, y: 4,  type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch1_mess',    x: 2,  y: 6,  type: 'examine', glow: true, sprite: 'item-bottle' },
    { id: 'ch1_view',    x: 14, y: 16, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch1_smoke',   x: 6,  y: 9,  type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_blunt',   x: 22, y: 6,  type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_bong',    x: 15, y: 5,  type: 'examine', glow: true, sprite: 'item-bong' },
  ],
};

// ---------------------------------------------------------------------------
// 2. WRONG CROWD MAP — Urban / Street Area  (26 wide x 22 tall)
// ---------------------------------------------------------------------------
// Concrete-heavy, alleyways between buildings, a small park, street lamps,
// claustrophobic compared to the beach.
// ---------------------------------------------------------------------------
export const wrongCrowdMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    // --- FRAT HOUSE INTERIOR (rows 0-8) ---
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 0  top wall
    [ X, X, B, B, B, B, B, B, B, X, X, B, B, B, B, B, B, B, B, B, X, X, X, X, X, X, X, X, X, X ], // 1  JP room walls + hallway walls
    [ X, X, B, F, F, F, M, F, B, X, X, B, F, F, F, F, F, F, F, B, X, X, X, X, X, X, X, X, X, X ], // 2  JP room (M=desk w/ weed) | common room
    [ X, X, B, F, F, F, F, F, B, X, X, B, F, F, F, F, F, F, F, B, X, X, X, X, X, X, X, X, X, X ], // 3  JP room | common room
    [ X, X, B, F, F, F, F, F, B, X, X, B, F, F, F, F, F, F, F, B, X, X, X, X, X, X, X, X, X, X ], // 4  JP room | common room
    [ X, X, B, B, B, B, O, B, B, X, X, B, B, B, O, B, B, B, B, B, X, X, X, X, X, X, X, X, X, X ], // 5  doors out of rooms
    [ X, X, X, X, X, X, F, X, X, X, X, X, X, X, F, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 6  narrow hallway
    [ X, X, X, X, X, X, F, F, F, F, F, F, F, F, F, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 7  hallway connecting rooms to front
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, O, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 8  front door of frat house

    // --- FRONT YARD + PARKING (rows 9-12) ---
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, X, X ], // 9   front yard, path from door
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, X, X ], // 10  yard
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, T, G, G, G, T, G, G, G, G, G, X, X ], // 11  BMW 335i parked here (sprite overlay) | trees
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, X, X ], // 12  yard to street

    // --- STREET (rows 13-16) ---
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 13  road
    [ C, C, C, C, E, E, E, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, E, E, E, C, C, C, C, C ], // 14  parked cars on street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 15  road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 16  road continues

    // --- BUYER'S BLOCK (rows 17-22) ---
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, X, X ], // 17  different neighborhood
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, P, G, G, G, G, G, G, G, G, G, X, X ], // 18  path branches to buyer house
    [ X, X, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, T, G, G, G, X, X ], // 19  trees + path to house
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, B, B, B, B, B, B, B, G, X, X ], // 20  buyer house top wall
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, B, D, D, D, D, D, B, G, X, X ], // 21  inside visible through wall
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, O, D, D, D, B, G, X, X ], // 22  path leads directly to door

    // --- INSIDE BUYER'S HOUSE (rows 23-27) ---
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, D, D, D, D, B, X, X, X ], // 23  inside buyer house
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, D, D, D, D, B, X, X, X ], // 24  sale spot area
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, D, D, M, D, B, X, X, X ], // 25  table (M) in back
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, B, B, B, B, B, B, X, X, X ], // 26  back wall
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 27  bottom border
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 5, y: 3 },  // JP starts in his room
    npcs: [
      { id: 'ch2_homie_door', x: 13, y: 9, sprite: 'npc_kid' },     // homie by front door outside
      { id: 'ch2_lookout',    x: 18, y: 20, sprite: 'npc_shady' },   // outside buyer's house
      { id: 'ch2_buyer',      x: 23, y: 23, sprite: 'npc_generic' }, // inside buyer's house
    ],
  },
  triggers: [],  // No scene triggers — only way out is through ch2_sale raid
  interactables: [
    { id: 'ch2_grab_weed', x: 6, y: 2, type: 'examine', glow: true, sprite: 'item-weed-bag' },   // desk in JP's room
    { id: 'ch2_car',       x: 9, y: 11, type: 'examine', glow: true, sprite: 'item-keys' },   // BMW on the curb
    { id: 'ch2_mirror',    x: 10, y: 11, type: 'examine', glow: false },  // car mirror
    { id: 'ch2_buyer_house', x: 19, y: 22, type: 'examine', glow: true, sprite: 'item-star' }, // approaching buyer's door
    { id: 'ch2_sale',      x: 23, y: 24, type: 'examine', glow: true, sprite: 'item-weed-bag' },   // THE TRIGGER — sale spot
    { id: 'ch2_alley',     x: 7, y: 15, type: 'examine', glow: true, sprite: 'item-star' },    // kept from original
    { id: 'ch2_phone',     x: 4, y: 4, type: 'examine', glow: true, sprite: 'item-phone' },     // in JP's room
    { id: 'ch2_graffiti',  x: 6, y: 17, type: 'examine', glow: true, sprite: 'item-star' },    // buyer's block
  ],
};

// ---------------------------------------------------------------------------
// 3. JAIL MAP — Cell + Hallway  (15 wide x 12 tall)
// ---------------------------------------------------------------------------
// REAL jail. Cells, yard, common area, hallways. 35 wide x 30 tall.
// ---------------------------------------------------------------------------
export const jailMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 0
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 1

    // --- CELL BLOCK (rows 2-10) left side + COMMON AREA right side ---
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 2  cell1 | cell2 | hall | common area
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 3
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, M, D, D, D, D, D, D, M, D, D, D, D, X, X ], // 4  tables in common area
    [ X, X, X, O, X, X, X, X, O, X, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 5  cell doors
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 6  cell3 (JP's) | cell4
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, M, D, D, D, D, D, D, D, D, X, X ], // 7
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 8
    [ X, X, X, O, X, X, X, X, O, X, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 9  cell doors
    [ X, X, F, F, F, X, X, F, F, F, X, X, D, D, D, D, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 10 cell5 | cell6 (extra)

    // --- MAIN HALLWAY (rows 11-14) ---
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 11
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, F, F, F, F, F, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 12 guard station
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, F, M, F, F, F, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 13 guard desk
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 14

    // --- YARD / EXERCISE AREA (rows 15-22) ---
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 15
    [ X, X, C, C, C, C, E, E, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 16 pull-up bars
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 17
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, F, F, F, C, X, X ], // 18 JP's study corner
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, F, F, F, C, X, X ], // 19
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 20
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 21
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 22

    // --- BOTTOM COMMON AREA (rows 23-25) ---
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 23
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 24
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 25

    // --- BOTTOM WALLS (rows 26-29) ---
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 26
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 27
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 28
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 29
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 3, y: 7 }, // JP's cell (cell3)
    npcs: [
      // --- Existing NPCs ---
      { id: 'ch3_cellmate', x: 2, y: 7,  sprite: 'npc_inmate' },   // in JP's cell (corner, not blocking door)
      { id: 'ch3_guard',    x: 17, y: 12, sprite: 'npc_guard' },    // guard station (right side, not blocking)
      { id: 'ch3_inmate1',  x: 4, y: 2,  sprite: 'npc_inmate' },   // cell 1 (back of cell)
      { id: 'ch3_inmate2',  x: 7, y: 3,  sprite: 'npc_inmate2' },  // cell 2 (back of cell)
      { id: 'ch3_inmate3',  x: 7, y: 7,  sprite: 'npc_inmate3' },  // cell 4 (back of cell)
      { id: 'ch3_inmate4',  x: 4, y: 10, sprite: 'npc_inmate4' },  // cell 5 (back of cell)
      { id: 'ch3_mind',     x: 14, y: 14, sprite: 'npc_mirror' },   // bottom of hallway (wide open space)

      // --- New NPCs ---
      { id: 'ch3_fighter1', x: 22, y: 4,  sprite: 'npc_inmate3' },  // common area (not on main path)
      { id: 'ch3_fighter2', x: 23, y: 5,  sprite: 'npc_inmate2' },  // near fighter1
      { id: 'ch3_dice1',    x: 30, y: 7,  sprite: 'npc_inmate' },   // dice corner (right side)
      { id: 'ch3_dice2',    x: 32, y: 8,  sprite: 'npc_inmate4' },  // with dice1
      { id: 'ch3_tattoo',   x: 27, y: 3,  sprite: 'npc_inmate2' },  // common area corner
      { id: 'ch3_smoker',   x: 4, y: 20,  sprite: 'npc_inmate4' },  // yard corner
      { id: 'ch3_pullups',  x: 8, y: 17,  sprite: 'npc_inmate3' },  // near pull-up bars
    ],
  },
  triggers: [
    { x: 17, y: 25, action: 'scene', target: 'TractorScene' }, // bottom exit
    { x: 18, y: 25, action: 'scene', target: 'TractorScene' },
  ],
  interactables: [
    // --- Existing interactables (moved to valid positions) ---
    { id: 'ch3_wall_1',  x: 2, y: 7,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_2',  x: 2, y: 8,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_3',  x: 14, y: 12, type: 'scratch', glow: true, sprite: 'item-scratch' },  // guard station
    { id: 'ch3_wall_4',  x: 5, y: 11, type: 'scratch', glow: true, sprite: 'item-scratch' },   // hallway wall
    { id: 'ch3_book',    x: 4, y: 8,  type: 'examine', glow: true, sprite: 'item-book' },   // JP's cell
    { id: 'ch3_pushups', x: 10, y: 17, type: 'examine', glow: true, sprite: 'item-weights' },  // yard

    // --- New interactables ---
    { id: 'ch3_phone',       x: 9, y: 11,  type: 'examine', glow: true, sprite: 'item-phone' },  // hallway phone
    { id: 'ch3_tablet',      x: 30, y: 18, type: 'examine', glow: true, sprite: 'item-tablet' },  // study corner
    { id: 'ch3_music',       x: 30, y: 19, type: 'examine', glow: true, sprite: 'item-headphones' },  // study corner
    { id: 'ch3_bed',         x: 3, y: 8,   type: 'examine', glow: true, sprite: 'item-bed' },  // JP's bunk
    { id: 'ch3_toilet',      x: 2, y: 6,   type: 'examine', glow: true, sprite: 'item-toilet' },  // JP's cell
    { id: 'ch3_window',      x: 13, y: 14, type: 'examine', glow: true, sprite: 'item-window' },  // small window in hallway
    { id: 'ch3_dice_watch',  x: 29, y: 8,  type: 'examine', glow: true, sprite: 'item-dice' },  // watching dice
    { id: 'ch3_fight_watch', x: 20, y: 3,  type: 'examine', glow: true, sprite: 'item-star' },  // watching fight
  ],
};

// ---------------------------------------------------------------------------
// 4. TRACTOR MAP — Farm / Rural Area  (28 wide x 22 tall)
// ---------------------------------------------------------------------------
// Wide open dirt fields, fenced pastures, a tractor, a small farmhouse,
// grass borders. Computer hidden in a corner — the AI discovery moment.
// ---------------------------------------------------------------------------
export const tractorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
    [ T, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, T ], // 0
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 1
    [ G, G, G, B, B, B, B, B, G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, G, G ], // 2
    [ G, G, G, B, F, F, F, B, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 3
    [ G, G, G, B, F, F, M, B, G, G, E, I, E, I, E, I, E, I, E, I, E, I, E, G, G, G, G, G ], // 4  vineyard row
    [ G, G, G, B, F, F, F, B, G, G, E, I, I, I, I, I, R, I, I, I, I, I, E, G, G, G, G, G ], // 5
    [ G, G, G, B, B, O, B, B, G, G, E, I, E, I, E, I, E, I, E, I, E, I, E, G, G, G, G, G ], // 6  vineyard row
    [ G, G, G, G, G, P, G, G, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 7
    [ G, G, G, G, G, P, G, G, G, G, E, I, E, I, E, I, E, I, E, I, E, I, E, G, G, T, G, G ], // 8  vineyard row
    [ G, P, P, P, P, P, P, P, P, P, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 9
    [ G, G, G, G, G, P, G, G, G, G, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 10
    [ G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G ], // 11
    [ G, G, T, G, G, P, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T, G, G ], // 12
    [ G, G, G, G, G, P, G, G, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 13
    [ G, G, G, G, G, P, G, G, E, I, E, I, E, I, E, P, I, E, I, E, I, E, E, G, G, G, G, G ], // 14  vineyard row
    [ G, G, G, G, G, P, G, G, E, I, I, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 15
    [ G, G, G, G, G, P, G, G, E, I, E, I, E, I, E, I, E, I, E, I, E, I, E, G, G, G, G, G ], // 16  vineyard row
    [ G, G, G, G, G, P, G, G, E, I, I, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 17
    [ G, G, G, G, G, P, G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, G, G ], // 18
    [ G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 19
    [ T, G, G, G, G, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 20
    [ T, T, T, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, T, T ], // 21
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 5, y: 7 },
    npcs: [
      { id: 'ch4_boss', x: 14, y: 5, sprite: 'npc_farmer' },
    ],
  },
  triggers: [
    { x: 6,  y: 4,  action: 'dialogue', target: 'ch4_computer' },
    { x: 8,  y: 21, action: 'scene', target: 'ComeUpScene' },
  ],
  interactables: [
    { id: 'ch4_tractor', x: 13, y: 5, type: 'examine', glow: true, sprite: 'item-keys' },
    { id: 'ch4_vines', x: 18, y: 8, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch4_phone', x: 6, y: 8, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch4_ai_discovery', x: 5, y: 4, type: 'evolve', glow: true, sprite: 'item-tablet' },
    { id: 'ch4_sunrise', x: 24, y: 1, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch4_lunch', x: 2, y: 7, type: 'examine', glow: true, sprite: 'item-food' },
    { id: 'ch4_paycheck', x: 24, y: 11, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch4_d8_seat', x: 15, y: 5, type: 'examine', glow: true, sprite: 'item-keys' },
    { id: 'ch4_crash', x: 17, y: 5, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch4_vineyard_row', x: 13, y: 7, type: 'examine', glow: true, sprite: 'item-star' },
  ],
};

// ---------------------------------------------------------------------------
// 5. COME-UP MAP — Home Office expanding to a street  (28 wide x 24 tall)
// ---------------------------------------------------------------------------
// Small room with computer at top, opening into a lively street with
// small client buildings, a park area, paths connecting everything.
// ---------------------------------------------------------------------------
export const comeUpMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 0
    [ X, X, X, X, B, B, B, B, B, B, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 1
    [ X, X, X, X, B, F, F, F, M, B, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 2
    [ X, X, X, X, B, F, F, F, F, B, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 3
    [ X, X, X, X, B, F, F, F, F, B, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 4
    [ X, X, X, X, B, B, B, O, B, B, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 5
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 6
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 7
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 8
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 9
    [ G, G, B, B, B, B, G, P, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, G, G, G, G, G ], // 10
    [ G, G, B, F, F, B, G, P, G, G, T, G, G, G, G, G, G, B, F, F, F, F, B, G, G, T, G, G ], // 11
    [ G, G, B, F, F, B, G, P, G, G, G, G, G, G, G, G, G, B, F, F, F, F, B, G, G, G, G, G ], // 12
    [ G, G, B, B, O, B, G, P, G, G, G, G, G, G, G, G, G, B, B, B, O, B, B, G, G, G, G, G ], // 13
    [ G, G, G, G, P, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G ], // 14
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 15
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 16
    [ G, G, B, B, B, B, B, P, G, B, B, B, B, B, G, G, G, B, B, B, B, B, B, B, G, G, G, G ], // 17  print shop + DHL
    [ G, G, B, F, F, F, B, P, G, B, F, F, F, B, G, G, G, B, F, F, D, F, F, B, G, G, G, G ], // 18
    [ G, G, B, F, F, F, B, P, G, B, F, F, F, B, G, P, G, B, F, D, D, D, F, B, G, G, G, G ], // 19
    [ G, G, B, B, O, B, B, P, G, B, B, O, B, B, G, P, G, B, B, B, O, B, B, B, G, G, G, G ], // 20
    [ G, G, G, G, P, G, G, P, G, G, G, P, G, G, G, P, G, G, G, G, P, G, G, G, G, G, G, G ], // 21
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 22
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 23
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 7, y: 3 },
    npcs: [
      { id: 'ch5_first_client', x: 4,  y: 14, sprite: 'npc_client' },
      { id: 'ch5_sticker',      x: 20, y: 14, sprite: 'npc_sticker_smith' },
      { id: 'ch5_mentor',       x: 13, y: 18, sprite: 'npc_mentor' },
      { id: 'ch5_impressed',    x: 15, y: 8,  sprite: 'npc_biz' },
      { id: 'ch5_dhl',          x: 15, y: 10, sprite: 'npc_dhl_client' },
      { id: 'ch5_vacaville',    x: 8,  y: 8,  sprite: 'npc_generic' },
      { id: 'ch5_fw_wheels',    x: 22, y: 8,  sprite: 'npc_kid' },
    ],
  },
  triggers: [
    { x: 27, y: 23, action: 'scene', target: 'LAScene' },
  ],
  interactables: [
    { id: 'ch5_wct_showcase', x: 3, y: 14, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_sticker_showcase', x: 19, y: 14, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_dhl_showcase', x: 13, y: 17, type: 'showcase', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_first_dollar', x: 6, y: 3, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_late_night', x: 7, y: 3, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_review', x: 24, y: 9, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch5_print_shop', x: 11, y: 21, type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch5_dhl_building', x: 20, y: 21, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_first_site', x: 6, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_3am', x: 8, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_pricing', x: 7, y: 2, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_github', x: 5, y: 3, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_stack', x: 6, y: 2, type: 'examine', glow: true, sprite: 'item-tablet' },
  ],
};

// ---------------------------------------------------------------------------
// 6. OPERATOR MAP — City / Business District  (30 wide x 25 tall)
// ---------------------------------------------------------------------------
// Biggest map. Wide streets, tall buildings, a large office, conference room.
// Clean concrete, some greenery. The culmination.
// ---------------------------------------------------------------------------
export const operatorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    [ T, T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, T, T ], // 0
    [ T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, T ], // 1
    [ G, G, C, C, B, B, B, B, B, B, B, C, C, C, C, C, C, C, B, B, B, B, B, B, B, B, C, C, G, G ], // 2
    [ G, C, C, C, B, F, F, F, F, F, B, C, C, C, C, C, C, C, B, F, F, F, F, F, F, B, C, C, C, G ], // 3
    [ G, C, C, C, B, F, F, F, F, F, B, C, C, C, C, C, C, C, B, F, F, F, F, F, F, B, C, C, C, G ], // 4
    [ G, C, C, C, B, F, F, F, F, F, B, C, C, E, C, C, E, C, B, F, F, M, F, F, F, B, C, C, C, G ], // 5
    [ G, C, C, C, B, F, F, F, F, F, B, C, C, E, C, C, E, C, B, F, F, F, F, F, F, B, C, C, C, G ], // 6
    [ G, C, C, C, B, B, B, B, O, B, B, C, C, C, C, C, C, C, B, B, B, B, O, B, B, B, C, C, C, G ], // 7
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 8
    [ G, C, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, C, G ], // 9
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 10
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 11
    [ G, C, C, B, B, B, B, B, B, B, B, B, B, C, P, C, C, G, G, G, G, G, G, G, G, G, G, C, C, G ], // 12
    [ G, C, C, B, F, F, F, F, F, F, F, F, B, C, P, C, C, G, G, T, G, G, G, T, G, G, G, C, C, G ], // 13
    [ G, C, C, B, F, F, F, F, F, F, F, F, B, C, P, C, C, G, G, G, G, G, G, G, G, G, G, C, C, G ], // 14
    [ G, C, C, B, F, F, M, F, F, M, F, F, B, C, P, C, C, G, G, G, P, P, P, G, G, G, G, C, C, G ], // 15
    [ G, C, C, B, F, F, F, F, F, F, F, F, B, C, P, C, C, G, T, G, P, G, P, G, T, G, G, C, C, G ], // 16
    [ G, C, C, B, F, F, F, F, F, F, F, F, B, C, P, C, C, G, G, G, P, G, P, G, G, G, G, C, C, G ], // 17
    [ G, C, C, B, B, B, B, B, B, O, B, B, B, C, P, C, C, G, G, G, P, P, P, G, G, G, G, C, C, G ], // 18
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, G, G, G, G, G, G, G, G, G, G, C, C, G ], // 19
    [ G, C, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, C, G ], // 20
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, B, B, B, B, B, B, B, B, B, C, C, C, G ], // 21  Pomaika'i office
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, B, F, F, M, F, F, M, F, B, C, C, G, G ], // 22
    [ T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, B, F, F, F, F, F, F, F, B, C, G, G, T ], // 23
    [ T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, B, B, B, B, O, B, B, B, B, G, G, T, T ], // 24
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 14, y: 1 },
    npcs: [
      { id: 'ch6_malachi',      x: 7,  y: 15, sprite: 'npc_malachi' },
      { id: 'ch6_big_client',   x: 22, y: 5,  sprite: 'npc_suit' },
      { id: 'ch6_equal',        x: 21, y: 15, sprite: 'npc_whale' },
      { id: 'ch6_office_kult',  x: 6,  y: 4,  sprite: 'npc_tech' },
      { id: 'ch6_tony',         x: 12, y: 8,  sprite: 'npc_suit' },
      { id: 'ch6_client2',      x: 24, y: 4,  sprite: 'npc_business' },
      { id: 'ch6_team_member',  x: 19, y: 23, sprite: 'npc_generic' },
    ],
  },
  triggers: [
    { x: 14, y: 24, action: 'scene', target: 'EndScene' },
  ],
  interactables: [
    { id: 'ch6_dashboard', x: 8, y: 5, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_portfolio', x: 14, y: 10, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_vegas', x: 5, y: 8, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch6_team', x: 11, y: 14, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_mirror', x: 5, y: 22, type: 'examine', glow: true, sprite: 'item-mirror' },
    { id: 'ch6_pomaikai_office', x: 21, y: 23, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_vegas_memory', x: 10, y: 8, type: 'examine', glow: true, sprite: 'item-star' },
    { id: 'ch6_slack', x: 3, y: 8, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_revenue', x: 25, y: 8, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch6_instagram', x: 16, y: 11, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_future', x: 7, y: 19, type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch6_equal_moment', x: 22, y: 11, type: 'examine', glow: true, sprite: 'item-star' },
  ],
};

// ---------------------------------------------------------------------------
// All maps indexed by key — useful for the scene manager
// ---------------------------------------------------------------------------
export const ALL_MAPS: Record<string, MapData> = {
  home: homeMap,
  beach: beachMap,
  wrongCrowd: wrongCrowdMap,
  jail: jailMap,
  tractor: tractorMap,
  comeUp: comeUpMap,
  operator: operatorMap,
};
