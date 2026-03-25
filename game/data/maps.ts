// ---------------------------------------------------------------------------
// Tile Map Data — Pokemon Platinum-style maps for each chapter
// Each tile is 16x16 px. Maps range from 15x12 (jail) to 30x25 (city).
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
];

// ---------------------------------------------------------------------------
// 0. HOME MAP — Suburban House + Yard  (20 wide x 18 tall)
// ---------------------------------------------------------------------------
// JP's childhood home. Small house with rooms, a yard with grass and a path,
// fence around the yard, a tree or two. Before everything else.
// ---------------------------------------------------------------------------
export const homeMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 0
    [ G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 1
    [ G, G, E, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 2
    [ G, G, E, G, B, B, B, B, B, B, B, B, B, B, G, G, G, E, G, G ], // 3
    [ G, G, E, G, B, F, F, F, B, F, F, M, F, B, G, T, G, E, G, G ], // 4
    [ G, G, E, G, B, F, F, F, B, F, F, F, F, B, G, G, G, E, G, G ], // 5
    [ G, G, E, G, B, F, F, F, O, F, F, F, F, B, G, G, G, E, G, G ], // 6
    [ G, G, E, G, B, B, B, B, B, B, O, B, B, B, G, G, G, E, G, G ], // 7
    [ G, G, E, G, G, G, G, G, P, G, P, G, G, G, G, G, G, E, G, G ], // 8
    [ G, G, E, G, G, G, G, G, P, P, P, G, G, G, G, G, G, E, G, G ], // 9
    [ G, G, E, G, G, T, G, G, P, G, G, G, G, G, G, G, G, E, G, G ], // 10
    [ G, G, E, G, G, G, G, G, P, G, G, G, G, G, G, G, G, E, G, G ], // 11
    [ G, G, E, G, G, G, G, G, P, G, G, G, G, G, T, G, G, E, G, G ], // 12
    [ G, G, E, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, G, G ], // 13
    [ G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G ], // 14
    [ G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G ], // 15
    [ G, G, G, G, G, G, G, P, P, P, G, G, G, G, G, G, G, G, G, G ], // 16
    [ G, G, G, G, G, G, G, P, P, P, G, G, G, G, G, G, G, G, G, G ], // 17
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 8, y: 8 },
    npcs: [
      { id: 'ch0_pops',    x: 12, y: 9,  sprite: 'npc_pops' },
      { id: 'ch0_mom',     x: 6,  y: 5,  sprite: 'npc_female' },
      { id: 'ch0_sister',  x: 6,  y: 6,  sprite: 'npc_sister' },
      { id: 'ch0_frenchie', x: 14, y: 11, sprite: 'npc_frenchie' },
    ],
  },
  triggers: [
    { x: 7,  y: 17, action: 'scene', target: 'BeachScene' },
    { x: 8,  y: 17, action: 'scene', target: 'BeachScene' },
    { x: 9,  y: 17, action: 'scene', target: 'BeachScene' },
  ],
  interactables: [
    { id: 'ch0_bed',    x: 11, y: 5,  type: 'examine', glow: true },
    { id: 'ch0_window', x: 5,  y: 4,  type: 'examine', glow: true },
    { id: 'ch0_fridge', x: 5,  y: 5,  type: 'examine', glow: true },
    { id: 'ch0_tv',     x: 10, y: 6,  type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 1. BEACH MAP — Coastal Town  (28 wide x 22 tall)
// ---------------------------------------------------------------------------
// Water along the south/east edge, sand dominates, palm trees scattered,
// two small houses in the north, paths connecting everything.
// ---------------------------------------------------------------------------
export const beachMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
    [ T, T, G, G, G, G, T, G, G, G, G, G, G, T, G, G, G, G, T, G, G, G, G, G, T, T, G, G ], // 0
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, L ], // 1
    [ G, G, B, B, B, B, B, G, G, G, G, G, G, G, G, G, B, B, B, B, B, G, G, G, G, G, G, S ], // 2
    [ G, G, B, F, F, F, B, G, G, T, G, G, G, G, G, G, B, F, F, F, B, G, G, G, G, G, S, S ], // 3
    [ G, G, B, F, F, F, B, G, G, G, G, G, G, G, G, G, B, F, F, F, B, G, G, L, G, S, S, S ], // 4
    [ G, G, B, B, O, B, B, G, G, G, G, G, G, G, G, G, B, B, O, B, B, G, G, G, S, S, S, S ], // 5
    [ G, G, G, G, P, G, G, G, G, G, G, T, G, G, G, G, G, G, P, G, G, G, G, S, S, S, L, S ], // 6
    [ G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, S, S, S, S, S, S ], // 7
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, S, S, L, S, S, S ], // 8
    [ G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, S, S, S, S, S, S, S ], // 9
    [ G, G, G, G, P, G, G, G, G, L, G, G, G, G, G, L, G, G, P, G, S, S, S, S, S, S, S, W ], // 10
    [ G, G, T, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, S, S, L, S, S, S, W, W ], // 11
    [ G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, S, S, S, S, S, S, W, W, W ], // 12
    [ G, G, G, G, P, P, P, P, P, P, P, P, P, G, G, G, G, G, P, S, S, S, S, S, W, W, W, W ], // 13
    [ G, G, L, G, G, G, G, G, G, G, G, G, P, G, G, G, G, S, S, S, S, L, S, W, W, W, W, W ], // 14
    [ G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, L, S, S, S, S, S, S, W, W, W, W, W, W ], // 15
    [ G, G, G, G, G, T, G, G, G, G, G, G, P, G, S, S, S, S, S, S, S, W, W, W, W, W, W, W ], // 16
    [ G, G, G, G, G, G, G, G, G, G, G, G, P, S, S, S, S, L, S, S, W, W, W, W, W, W, W, W ], // 17
    [ G, G, G, G, G, G, G, T, G, G, G, G, P, S, S, S, S, S, S, W, W, W, W, W, W, W, W, W ], // 18
    [ T, G, G, G, G, G, G, G, G, G, G, S, S, S, S, S, S, S, W, W, W, W, W, W, W, W, W, W ], // 19
    [ T, G, G, G, G, G, G, G, G, G, S, S, S, S, S, L, S, W, W, W, W, W, W, W, W, W, W, W ], // 20
    [ T, T, G, G, P, P, P, P, G, G, S, S, S, S, S, S, W, W, W, W, W, W, W, W, W, W, W, W ], // 21
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 12, y: 10 },
    npcs: [
      { id: 'ch1_pops',     x: 5,  y: 6,  sprite: 'npc_pops' },
      { id: 'ch1_mom',      x: 4,  y: 3,  sprite: 'npc_female' },
      { id: 'ch1_friend',   x: 20, y: 9,  sprite: 'npc_kid' },
      { id: 'ch1_stranger', x: 1,  y: 17, sprite: 'npc_shady' },
    ],
  },
  triggers: [
    { x: 4,  y: 21, action: 'scene', target: 'WrongCrowdScene' },
    { x: 5,  y: 21, action: 'scene', target: 'WrongCrowdScene' },
    { x: 6,  y: 21, action: 'scene', target: 'WrongCrowdScene' },
    { x: 7,  y: 21, action: 'scene', target: 'WrongCrowdScene' },
  ],
  interactables: [
    { id: 'ch1_joint', x: 8, y: 12, type: 'examine', glow: true },
    { id: 'ch1_stash', x: 3, y: 8, type: 'examine', glow: true },
    { id: 'ch1_view', x: 22, y: 5, type: 'examine', glow: true },
    { id: 'ch1_car', x: 7, y: 7, type: 'examine', glow: true },
    { id: 'ch1_sunset', x: 14, y: 17, type: 'examine', glow: true },
    { id: 'ch1_money', x: 2, y: 10, type: 'examine', glow: true },
    { id: 'ch1_bench', x: 17, y: 10, type: 'examine', glow: true },
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
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
    [ X, X, X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X, X, X, X ], // 0
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X, X ], // 1
    [ X, C, C, B, B, B, B, C, C, B, B, B, B, B, C, C, C, B, B, B, B, B, C, C, X, X ], // 2
    [ X, C, C, B, F, F, B, C, C, B, F, F, F, B, C, C, C, B, F, F, F, B, C, C, C, X ], // 3
    [ X, C, C, B, F, F, B, C, C, B, F, F, F, B, C, C, C, B, F, F, F, B, C, C, C, X ], // 4
    [ X, C, C, B, B, O, B, C, C, B, B, O, B, B, C, E, C, B, B, B, O, B, C, C, C, X ], // 5
    [ X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, C, C, C, C, C, C, C, C, C, X ], // 6
    [ X, C, P, P, P, P, P, P, P, P, P, P, P, P, P, E, P, P, P, P, P, P, P, P, C, X ], // 7
    [ X, C, C, C, C, C, C, C, X, X, C, C, C, C, C, C, C, C, C, X, X, C, C, C, C, X ], // 8
    [ X, C, C, C, C, C, C, C, X, D, D, C, C, C, C, C, C, C, X, X, D, D, C, C, C, X ], // 9
    [ X, C, B, B, B, B, C, C, X, D, D, C, C, E, C, C, C, C, X, D, D, D, C, C, C, X ], // 10
    [ X, C, B, F, F, B, C, C, X, X, C, C, C, E, C, C, C, C, X, X, X, C, C, C, C, X ], // 11
    [ X, C, B, F, F, B, C, C, C, C, C, C, C, C, C, G, G, G, G, G, G, G, G, C, C, X ], // 12
    [ X, C, B, B, O, B, C, C, C, C, C, C, C, C, G, G, T, G, G, G, T, G, G, C, C, X ], // 13
    [ X, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, C, C, X ], // 14
    [ X, C, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, P, G, G, G, G, C, C, X ], // 15
    [ X, C, C, C, C, C, C, C, C, X, X, C, C, C, G, T, G, G, P, G, G, T, G, C, C, X ], // 16
    [ X, C, C, B, B, B, B, C, C, X, D, D, C, C, G, G, G, G, P, G, G, G, G, C, C, X ], // 17
    [ X, C, C, B, F, F, B, C, C, X, D, D, C, C, G, G, G, G, P, G, G, G, G, C, C, X ], // 18
    [ X, C, C, B, B, O, B, C, C, X, X, C, C, C, C, C, C, P, P, C, C, C, C, C, C, X ], // 19
    [ X, C, C, C, C, C, C, C, C, C, C, C, C, P, P, P, P, P, C, C, C, C, C, C, C, X ], // 20
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, P, P, P, P, X, X, X, X, X, X, X, X, X ], // 21
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 12, y: 1 },
    npcs: [
      { id: 'ch2_shady',    x: 10, y: 9,  sprite: 'npc_shady' },
      { id: 'ch2_warning',  x: 18, y: 14, sprite: 'npc_kid' },
      { id: 'ch2_random',   x: 6,  y: 7,  sprite: 'npc_generic' },
    ],
  },
  triggers: [
    { x: 13, y: 21, action: 'scene', target: 'CourtScene' },
    { x: 14, y: 21, action: 'scene', target: 'CourtScene' },
    { x: 15, y: 21, action: 'scene', target: 'CourtScene' },
    { x: 16, y: 21, action: 'scene', target: 'CourtScene' },
  ],
  interactables: [
    { id: 'ch2_alley', x: 10, y: 10, type: 'examine', glow: true },
    { id: 'ch2_phone', x: 5, y: 14, type: 'examine', glow: true },
    { id: 'ch2_graffiti', x: 2, y: 7, type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 3. JAIL MAP — Cell + Hallway  (15 wide x 12 tall)
// ---------------------------------------------------------------------------
// Tiny. A 4x3 cell, a narrow hallway. Heavy walls. Claustrophobic.
// ---------------------------------------------------------------------------
export const jailMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 0
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 1
    [ X, X, X, X, X, X, D, D, D, D, D, D, X, X, X ], // 2
    [ X, X, X, F, F, F, D, D, D, D, D, D, X, X, X ], // 3
    [ X, X, X, F, F, F, D, D, D, D, D, D, X, X, X ], // 4
    [ X, X, X, F, F, F, D, D, D, D, D, D, X, X, X ], // 5
    [ X, X, X, X, O, X, D, D, D, D, D, D, X, X, X ], // 6
    [ X, X, X, X, D, D, D, D, D, D, D, D, X, X, X ], // 7
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 8
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 9
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 10
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 11
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 4, y: 4 },
    npcs: [
      { id: 'ch3_cellmate', x: 3, y: 5, sprite: 'npc_inmate' },
      { id: 'ch3_guard',    x: 8, y: 5, sprite: 'npc_guard' },
      { id: 'ch3_inmate1',  x: 7, y: 3, sprite: 'npc_inmate' },
      { id: 'ch3_inmate2',  x: 10, y: 4, sprite: 'npc_inmate2' },
      { id: 'ch3_inmate3',  x: 9, y: 7, sprite: 'npc_inmate3' },
      { id: 'ch3_inmate4',  x: 6, y: 7, sprite: 'npc_inmate4' },
    ],
  },
  triggers: [
    { x: 11, y: 5, action: 'scene', target: 'TractorScene' },
  ],
  interactables: [
    { id: 'ch3_wall_1', x: 3, y: 3, type: 'scratch', glow: true },
    { id: 'ch3_wall_2', x: 4, y: 3, type: 'scratch', glow: true },
    { id: 'ch3_wall_3', x: 5, y: 3, type: 'scratch', glow: true },
    { id: 'ch3_wall_4', x: 3, y: 4, type: 'scratch', glow: true },
    { id: 'ch3_book',    x: 5, y: 5, type: 'examine', glow: true },
    { id: 'ch3_pushups', x: 5, y: 4, type: 'examine', glow: true },
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
    [ G, G, G, B, F, F, M, B, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 4
    [ G, G, G, B, F, F, F, B, G, G, E, I, I, I, I, I, R, I, I, I, I, I, E, G, G, G, G, G ], // 5
    [ G, G, G, B, B, O, B, B, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 6
    [ G, G, G, G, G, P, G, G, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 7
    [ G, G, G, G, G, P, G, G, G, G, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, T, G, G ], // 8
    [ G, P, P, P, P, P, P, P, P, P, E, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 9
    [ G, G, G, G, G, P, G, G, G, G, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 10
    [ G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G ], // 11
    [ G, G, T, G, G, P, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T, G, G ], // 12
    [ G, G, G, G, G, P, G, G, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 13
    [ G, G, G, G, G, P, G, G, E, I, I, I, I, I, I, P, I, I, I, I, I, I, E, G, G, G, G, G ], // 14
    [ G, G, G, G, G, P, G, G, E, I, I, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 15
    [ G, G, G, G, G, P, G, G, E, I, I, I, I, I, I, I, I, I, I, I, I, I, E, G, G, G, G, G ], // 16
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
    { id: 'ch4_tractor', x: 13, y: 5, type: 'examine', glow: true },
    { id: 'ch4_vines', x: 18, y: 8, type: 'examine', glow: true },
    { id: 'ch4_phone', x: 6, y: 8, type: 'examine', glow: true },
    { id: 'ch4_ai_discovery', x: 5, y: 4, type: 'evolve', glow: true },
    { id: 'ch4_sunrise', x: 24, y: 1, type: 'examine', glow: true },
    { id: 'ch4_lunch', x: 2, y: 7, type: 'examine', glow: true },
    { id: 'ch4_paycheck', x: 24, y: 11, type: 'examine', glow: true },
    { id: 'ch4_d8_seat', x: 15, y: 5, type: 'examine', glow: true },
    { id: 'ch4_crash', x: 17, y: 5, type: 'examine', glow: true },
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
    [ G, G, B, B, B, B, B, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 17
    [ G, G, B, F, F, F, B, P, G, G, G, G, T, G, G, G, G, G, G, T, G, G, G, T, G, G, G, G ], // 18
    [ G, G, B, F, F, F, B, P, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 19
    [ G, G, B, B, O, B, B, P, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 20
    [ G, G, G, G, P, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 21
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 22
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 23
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 7, y: 3 },
    npcs: [
      { id: 'ch5_first_client', x: 4,  y: 14, sprite: 'npc_client' },
      { id: 'ch5_sticker',      x: 20, y: 14, sprite: 'npc_sticker' },
      { id: 'ch5_mentor',       x: 13, y: 18, sprite: 'npc_mentor' },
      { id: 'ch5_impressed',    x: 15, y: 8,  sprite: 'npc_biz' },
    ],
  },
  triggers: [
    { x: 27, y: 23, action: 'scene', target: 'LAScene' },
  ],
  interactables: [
    { id: 'ch5_wct_showcase', x: 3, y: 14, type: 'showcase', glow: true },
    { id: 'ch5_sticker_showcase', x: 19, y: 14, type: 'showcase', glow: true },
    { id: 'ch5_dhl_showcase', x: 13, y: 17, type: 'showcase', glow: true },
    { id: 'ch5_first_dollar', x: 6, y: 3, type: 'examine', glow: true },
    { id: 'ch5_late_night', x: 7, y: 3, type: 'examine', glow: true },
    { id: 'ch5_review', x: 24, y: 9, type: 'examine', glow: true },
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
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 21
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G ], // 22
    [ T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, T ], // 23
    [ T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T ], // 24
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 14, y: 1 },
    npcs: [
      { id: 'ch6_malachi',    x: 7,  y: 15, sprite: 'npc_malachi' },
      { id: 'ch6_big_client', x: 22, y: 5,  sprite: 'npc_suit' },
      { id: 'ch6_equal', x: 21, y: 15, sprite: 'npc_whale' },
    ],
  },
  triggers: [
    { x: 14, y: 24, action: 'scene', target: 'EndScene' },
  ],
  interactables: [
    { id: 'ch6_dashboard', x: 8, y: 5, type: 'examine', glow: true },
    { id: 'ch6_portfolio', x: 14, y: 10, type: 'examine', glow: true },
    { id: 'ch6_vegas', x: 5, y: 8, type: 'examine', glow: true },
    { id: 'ch6_team', x: 11, y: 14, type: 'examine', glow: true },
    { id: 'ch6_mirror', x: 5, y: 22, type: 'examine', glow: true },
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
