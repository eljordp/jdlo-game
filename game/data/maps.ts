// ---------------------------------------------------------------------------
// Tile Map Data — Pokemon Platinum-style maps for each chapter
// Each tile is 16x16 px. Maps range from 15x12 (jail cell) to 40x30 (home).
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
  VINE: 18,
  HOUSE_WALL: 19,
  HARDWOOD: 20,
  COUNTER: 21,
  JAIL_BAR: 22,
} as const;

export type InteractableType = 'examine' | 'item' | 'evolve' | 'showcase' | 'scratch';

export type MapData = {
  tiles: number[][];
  collisions: number[];
  spawns: {
    player: { x: number; y: number };
    npcs: { id: string; x: number; y: number; sprite: string }[];
  };
  triggers: { x: number; y: number; action: string; target?: string; data?: Record<string, string> }[];
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
const V = TILES.VINE;
const K = TILES.HOUSE_WALL;
const J = TILES.HARDWOOD;
const N = TILES.COUNTER;
const Z = TILES.JAIL_BAR;

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
  TILES.VINE,
  TILES.HOUSE_WALL,
  TILES.COUNTER,
  TILES.JAIL_BAR,
];

// ---------------------------------------------------------------------------
// 0. HOME MAP — Suburban House + Yard  (40 wide x 30 tall)
// ---------------------------------------------------------------------------
// JP's childhood home before everything changes. Proper suburban house with
// JP's room (6x5 interior), sister's room, parents' room, living room,
// open-concept kitchen, bathroom. Big yard with fence, pond, BBQ area,
// driveway. Street at bottom exits to BeachScene.
// ---------------------------------------------------------------------------
export const homeMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [ T, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, T ], // 0  trees + neighborhood top
    [ G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G ], // 1  scattered trees
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 2  open grass
    [ G, G, G, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 3  roof line
    [ G, G, G, K, J, J, J, J, J, J, K, J, J, J, J, J, K, J, J, J, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 4  JP room | sister | parents | gap | bathroom
    [ G, G, G, K, J, J, J, J, J, J, K, J, J, J, J, J, K, J, J, J, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 5  JP room (computer is interactable sprite, not map tile)
    [ G, G, G, K, J, J, J, J, J, J, K, J, J, J, J, J, K, J, J, J, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 6
    [ G, G, G, K, J, J, J, J, J, J, K, J, J, J, J, J, K, J, J, J, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 7
    [ G, G, G, K, J, J, J, J, J, J, K, J, J, J, J, J, K, J, J, J, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 8
    [ G, G, G, K, K, K, K, K, O, K, K, K, K, O, K, K, K, K, K, K, O, K, K, K, K, K, K, K, O, K, K, K, K, O, K, K, K, G, G, G ], // 9  doors to hallway
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 10 hallway
    [ G, G, G, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 11 door to living area
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 12 open concept: living + kitchen (N=counter island)
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 13
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, N, J, K, G, G, G ], // 14 wall counters on right
    [ G, G, G, K, K, K, K, K, K, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 15 front door
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 16 front walkway
    [ G, G, E, E, E, E, E, E, E, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 17 fence top
    [ G, G, E, G, G, I, T, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, I, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 18 mulch near trees
    [ G, G, E, G, G, G, I, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, G, G ], // 19 yard
    [ G, G, E, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, W, W, W, W, W, G, G, G, G, L, G, G, E, G, G ], // 20 pond + palm
    [ G, G, E, G, T, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, T, W, W, W, W, G, G, G, G, G, G, G, E, G, G ], // 21 tree near pond
    [ G, G, E, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, I, W, W, G, G, G, G, G, G, G, G, E, G, G ], // 22 dirt near pond edge
    [ G, G, E, G, G, G, T, G, G, L, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, E, G, G ], // 23 trees + palm
    [ G, G, E, E, E, E, E, E, E, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 24 fence bottom
    [ E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E ], // 25 curb + driveway
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 26 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 27 road (solid concrete)
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 28 road (solid concrete)
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 29
  ],
  collisions: [...STANDARD_COLLISIONS],
  spawns: {
    player: { x: 7, y: 6 },
    npcs: [
      { id: 'ch0_pops',    x: 8,  y: 13, sprite: 'npc_pops' },
      { id: 'ch0_mom',     x: 28, y: 13, sprite: 'npc_female' },
      { id: 'ch0_sister',  x: 13, y: 6,  sprite: 'npc_sister' },
      { id: 'ch0_frenchie', x: 18, y: 20, sprite: 'npc_frenchie' },
    ],
  },
  triggers: [
    { x: 11, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 12, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 13, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 14, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 15, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 16, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 17, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 18, y: 29, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
  ],
  interactables: [
    // JP's Room (cols 4-9, rows 4-8)
    { id: 'ch0_computer',      x: 5,  y: 4,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch0_crypto',        x: 8,  y: 4,  type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch0_college',       x: 9,  y: 5,  type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch0_bed',           x: 6,  y: 4,  type: 'examine', glow: true, sprite: 'item-bed' },
    { id: 'ch0_poster',        x: 9,  y: 7,  type: 'examine', glow: true },
    { id: 'ch0_hidden_stash',  x: 4,  y: 4,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch0_journal',       x: 7,  y: 8,  type: 'examine', glow: true, sprite: 'item-book' },
    // Sister's Room (cols 11-15, rows 4-8)
    { id: 'ch0_sister_toys',   x: 13, y: 7,  type: 'examine', glow: true },
    // Parents' Room (cols 17-23, rows 4-8)
    { id: 'ch0_family_photo',  x: 19, y: 4,  type: 'examine', glow: true, sprite: 'item-photo' },
    // Bathroom (cols 32-35, rows 4-8)
    { id: 'ch0_mirror',        x: 34, y: 4,  type: 'examine', glow: true, sprite: 'item-mirror' },
    // Living Room (left side of open concept, row 12-14)
    { id: 'ch0_tv',            x: 4,  y: 13, type: 'examine', glow: true, sprite: 'item-tv' },
    { id: 'ch0_couch',         x: 7,  y: 13, type: 'examine', glow: true, sprite: 'item-couch' },
    // Kitchen (right side of open concept, row 12-14)
    { id: 'ch0_fridge',        x: 35, y: 12, type: 'examine', glow: true, sprite: 'item-fridge' },
    { id: 'ch0_mail',          x: 28, y: 14, type: 'examine', glow: true, sprite: 'item-letter' },
    // Yard
    { id: 'ch0_bbq',           x: 8,  y: 20, type: 'examine', glow: true, sprite: 'item-bbq' },
    { id: 'ch0_nolan_call',    x: 8,  y: 7,  type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch0_frenchie_ball', x: 16, y: 21, type: 'examine', glow: true },
    { id: 'ch0_fishing',       x: 24, y: 20, type: 'examine', glow: true },
    { id: 'ch0_goodbye',       x: 13, y: 23, type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 1. BEACH MAP — Frat House by the Beach, Santa Barbara  (40 wide x 28 tall)
// ---------------------------------------------------------------------------
// Dirty frat house interior at top with proper rooms (living, JP room, kitchen,
// bedrooms). Hot tub patio on the right. Path/concrete street. Grass-to-sand
// transition. HUGE beach with palms, volleyball area. Ocean at bottom.
// ---------------------------------------------------------------------------
export const beachMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [ B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B ], // 0  house top wall
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, C, C, C, C, C, C, C, C, B ], // 1  living rm | JP rm | kitchen | bedroom | hot tub patio
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, H, H, H, H, C, C, C, C, B ], // 2
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, H, H, H, H, C, C, C, C, B ], // 3  JP room (computer is interactable sprite)
    [ B, F, F, F, F, F, F, F, F, O, F, F, F, F, F, F, O, F, F, F, F, F, O, F, F, F, F, F, B, C, C, H, H, H, H, C, C, C, C, B ], // 4  doors between rooms
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, C, C, C, C, C, C, C, C, B ], // 5
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, C, C, C, C, C, C, C, C, B ], // 6
    [ B, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, F, B, C, C, C, C, C, C, C, C, C, C, B ], // 7
    [ B, B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B, B, O, B, B, B, B, B, O, B, B, B, B, B, B, B, B, O, B, B, B, B, B, B ], // 8  house bottom wall with doors
    [ G, G, G, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G ], // 9  concrete walks from house doors
    [ G, G, L, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, L, G, G ], // 10 walks continue + palms
    [ G, G, G, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G ], // 11
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 12 concrete street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 13 concrete street
    [ G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G ], // 14 grass with trees
    [ G, G, G, G, G, L, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, L, G, G, G, G, G, G ], // 15 two palms marking beach entrance
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 16 sand starts — clean
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 17 open sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, L, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 18 one palm on beach
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 19 open sand — volleyball area
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 20 open sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 21 open sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 22 open sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 23 open sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 24 sand near water
    [ S, S, S, S, S, S, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, S, S, S, S, S, S ], // 25 shore break
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 26 ocean
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 27 ocean
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 12, y: 11 },
    npcs: [
      { id: 'ch1_homie1', x: 12, y: 3,  sprite: 'npc_nolan' },      // Nolan in JP's room area
      { id: 'ch1_homie2', x: 4,  y: 3,  sprite: 'npc_david' },      // David in living room
      { id: 'ch1_cooper',  x: 7,  y: 6,  sprite: 'npc_cooper' },     // Cooper in living room
      { id: 'ch1_girl1',  x: 32, y: 3,  sprite: 'npc_bikini1' },     // In hot tub
      { id: 'ch1_girl2',  x: 36, y: 3,  sprite: 'npc_bikini2' },     // On hot tub patio
      { id: 'ch1_girl3',  x: 34, y: 4,  sprite: 'npc_bikini1' },     // In hot tub
      { id: 'ch1_girl_couch', x: 3, y: 5, sprite: 'npc_bikini2' },   // Sleeping in living room
      { id: 'ch1_terrell', x: 30, y: 7, sprite: 'npc_terrell' },     // By the hot tub patio
      { id: 'ch1_volleyball1', x: 14, y: 20, sprite: 'npc_surfer' },
      { id: 'ch1_volleyball2', x: 16, y: 20, sprite: 'npc_kid' },
      { id: 'ch1_sunbather',   x: 24, y: 22, sprite: 'npc_bikini1' },
    ],
  },
  triggers: [
    { x: 15, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 16, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 17, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 18, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 19, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 20, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 21, y: 25, action: 'scene', target: 'WrongCrowdScene' },
    { x: 22, y: 25, action: 'scene', target: 'WrongCrowdScene' },
  ],
  interactables: [
    { id: 'ch1_weed1',   x: 14, y: 4,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_weed2',   x: 11, y: 6,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_weed3',   x: 5,  y: 2,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_bottles', x: 19, y: 2,  type: 'examine', glow: true, sprite: 'item-bottle' },
    { id: 'ch1_hottub',  x: 30, y: 6,  type: 'examine', glow: true },
    { id: 'ch1_mess',    x: 2,  y: 7,  type: 'examine', glow: true, sprite: 'item-bottle' },
    { id: 'ch1_view',    x: 20, y: 21, type: 'examine', glow: true },
    { id: 'ch1_smoke',   x: 8,  y: 11, type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_blunt',   x: 35, y: 6,  type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_bong',    x: 20, y: 1,  type: 'examine', glow: true, sprite: 'item-bong' },
    { id: 'ch1_setup',   x: 11, y: 2,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch1_bed',     x: 10, y: 1,  type: 'examine', glow: true, sprite: 'item-bed' },
    { id: 'ch1_closet',  x: 15, y: 2,  type: 'examine', glow: true },
    { id: 'ch1_speaker', x: 14, y: 1,  type: 'examine', glow: true },
    { id: 'ch1_volleyball1', x: 15, y: 20, type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 2. WRONG CROWD MAP — SB Frat House at Night + Buyer's Block  (40 wide x 32 tall)
// ---------------------------------------------------------------------------
// Same SB frat house layout from beachMap but at 3:33 AM — dark, empty.
// JP wakes up alone, grabs product, drives across real SB streets to buyer's house.
// All roads are CONCRETE — Santa Barbara has no dirt roads.
// ---------------------------------------------------------------------------
export const wrongCrowdMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

    // === ROWS 0-8: SB FRAT HOUSE (nighttime) — house centered with yard space on sides ===
    [ G, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G ], // 0  house top wall
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, B, D, D, D, D, D, D, B, D, D, D, D, D, B, C, C, C, C, C, B, G, G, G, G, G, G ], // 1  living | JP room | kitchen | patio
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, B, D, D, D, D, D, D, B, D, D, D, D, D, B, C, H, H, H, C, B, G, G, G, G, G, G ], // 2  hot tub
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, B, D, D, D, D, D, D, B, D, D, D, D, D, B, C, H, H, H, C, B, G, G, G, G, G, G ], // 3  JP room
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, O, D, D, D, D, D, D, O, D, D, D, D, D, B, C, H, H, H, C, B, G, G, G, G, G, G ], // 4  doors between rooms
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, B, D, D, D, D, D, D, B, D, D, D, D, D, B, C, H, H, H, C, B, G, G, G, G, G, G ], // 5
    [ G, G, G, G, G, G, B, D, D, D, D, D, D, D, B, D, D, D, D, D, D, B, D, D, D, D, D, B, C, C, C, C, C, B, G, G, G, G, G, G ], // 6
    [ G, G, G, G, G, G, B, B, B, B, O, B, B, B, B, B, B, B, O, B, B, B, B, B, O, B, B, B, B, B, B, O, B, B, G, G, G, G, G, G ], // 7  house bottom wall with doors
    [ G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G ], // 8  concrete walks from doors

    // === ROWS 9-11: FRONT YARD — clean grass, concrete walkway ===
    [ G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G ], // 9  walkways
    [ G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, C, C, C, C, C, C, C, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G ], // 10 Jose here
    [ G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G ], // 11 yard to curb

    // === ROWS 12-15: STREET — all concrete ===
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 12 curb
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 13 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 14 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 15 curb

    // === ROWS 16-20: CONVENIENCE STORE ===
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 16 sidewalk
    [ G, G, G, G, G, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 17 store top wall
    [ G, G, G, G, G, B, F, F, F, F, F, N, F, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 18 store interior
    [ G, G, G, G, G, B, F, F, F, F, F, N, F, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 19 store interior
    [ G, G, G, G, G, B, F, F, F, F, F, F, O, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 20 store door

    // === ROWS 21-23: SECOND STREET ===
    [ G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 21 sidewalk
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 22 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 23 road

    // === ROWS 24-31: BUYER'S HOUSE ===
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 24 sidewalk
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G ], // 25 buyer house top wall
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, B, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 26 driveway
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, D, D, D, O, D, D, D, D, B, G, G, G, G, G, G, G ], // 27 door between rooms
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 28 back room
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, O, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 29 front door
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G ], // 30 buyer house bottom wall
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 31 bottom
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 17, y: 3 },  // JP starts in his room in the frat house
    npcs: [
      { id: 'ch2_homie_door', x: 19, y: 10, sprite: 'npc_jose' },    // Jose waiting in front yard
      { id: 'ch2_corner_guy', x: 8,  y: 18, sprite: 'npc_generic' }, // guy inside convenience store
      { id: 'ch2_street_kid', x: 15, y: 22, sprite: 'npc_shady' },   // kid on the second street
      { id: 'ch2_lookout',    x: 21, y: 26, sprite: 'npc_shady' },   // outside buyer's house driveway
      { id: 'ch2_buyer',      x: 29, y: 28, sprite: 'npc_dealer' },  // inside buyer's house back room
    ],
  },
  triggers: [],  // No scene triggers — only way out is through ch2_sale raid
  interactables: [
    // --- JP's Room (cols 15-20, rows 1-6) ---
    { id: 'ch2_grab_weed', x: 19, y: 3, type: 'examine', glow: true, sprite: 'item-weed-bag' },  // weed on desk in JP's room
    { id: 'ch2_gun',       x: 16, y: 1, type: 'examine', glow: true, sprite: 'item-gun' },       // gun in JP's room
    { id: 'ch2_computer',  x: 19, y: 1, type: 'examine', glow: true },                            // computer/desk
    { id: 'ch2_bed',       x: 15, y: 1, type: 'examine', glow: true, sprite: 'item-bed' },       // bed against north wall in JP's room
    { id: 'ch2_phone',     x: 16, y: 3, type: 'examine', glow: true, sprite: 'item-phone' },     // phone in JP's room
    { id: 'ch2_money_stack', x: 20, y: 3, type: 'examine', glow: true, sprite: 'item-money' },   // money in JP's room
    { id: 'ch2_pops_missed', x: 17, y: 5, type: 'examine', glow: true, sprite: 'item-phone' },   // missed call from pops

    // --- House common areas ---
    { id: 'ch2_light1',    x: 10, y: 3, type: 'examine', glow: true },                            // light switch in living room
    { id: 'ch2_light2',    x: 24, y: 3, type: 'examine', glow: true },                            // light switch in kitchen
    { id: 'ch2_fridge',    x: 26, y: 1, type: 'examine', glow: true, sprite: 'item-fridge' },     // kitchen fridge against north + east wall
    { id: 'ch2_hottub_night', x: 31, y: 4, type: 'examine', glow: true },                         // hot tub area (empty at night)
    { id: 'ch2_front_door', x: 18, y: 8, type: 'examine', glow: true },                           // path from JP room door

    // --- Street & driving ---
    { id: 'ch2_car',       x: 18, y: 13, type: 'examine', glow: true, sprite: 'item-keys' },     // BMW parked on street
    { id: 'ch2_streetlight', x: 25, y: 16, type: 'examine', glow: true },                         // streetlight on sidewalk
    { id: 'ch2_street_walk', x: 14, y: 14, type: 'examine', glow: true },                         // walking the dark street
    { id: 'ch2_nervous',   x: 12, y: 22, type: 'examine', glow: true },                           // nervous on second street

    // --- Convenience store area ---
    { id: 'ch2_graffiti',  x: 4,  y: 17, type: 'examine', glow: true },                           // graffiti visible on store wall
    { id: 'ch2_store',     x: 7,  y: 18, type: 'examine', glow: true },                           // inside the store

    // --- Buyer's house area ---
    { id: 'ch2_parking_lot', x: 20, y: 27, type: 'examine', glow: true },                         // driveway near buyer's house
    { id: 'ch2_sale',      x: 25, y: 29, type: 'examine', glow: true, sprite: 'item-weed-bag' }, // THE TRIGGER — sale spot inside buyer's house
  ],
};


// ---------------------------------------------------------------------------
// 3. JAIL MAP — Cell + Yard + Chapel  (40 wide x 35 tall)
// ---------------------------------------------------------------------------
// REAL jail. 6 bigger cells (4x3 interior) with Z bars, concrete hallway,
// common area, guard station, big exercise yard, chapel/classroom at bottom.
// ---------------------------------------------------------------------------
export const jailMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 0  outer wall
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 1  outer wall

    // --- CELL BLOCK (rows 2-12): 6 cells left (4x3 interior), concrete hall, common area right ---
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, D, X, X ], // 2  cell1 | cell2 | hall | common
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, D, X, X ], // 3
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, D, X, X ], // 4  common area
    [ X, X, X, X, O, Z, Z, X, X, X, O, Z, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 5  cell doors + bars
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, X, X ], // 6  cell3 (JP) | cell4
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, X, X ], // 7
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 8
    [ X, X, X, X, O, Z, Z, X, X, X, O, Z, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 9  cell doors
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 10 cell5 | cell6
    [ X, X, D, D, D, D, Z, X, D, D, D, D, Z, X, C, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 11
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, C, C, C, C, C, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 12 cell block end wall

    // --- MAIN HALLWAY (rows 13-16): wide concrete corridor + guard station ---
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 13
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, F, F, F, F, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 14 guard station fence
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, F, F, F, F, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 15 guard station
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 16

    // --- EXERCISE YARD (rows 17-26): big open fenced area ---
    [ X, X, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, X, X ], // 17 yard fence top (gap at col 17)
    [ X, X, E, C, C, I, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 18 dirt exercise zone
    [ X, X, E, C, I, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 19 open yard
    [ X, X, E, C, C, C, C, C, C, I, C, C, C, C, C, C, C, F, F, F, F, C, C, C, C, C, B, B, C, C, C, C, C, C, C, C, C, E, X, X ], // 20 covered study area (F + B pillars)
    [ X, X, E, C, C, C, C, C, I, C, C, C, C, C, C, C, C, F, F, F, F, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 21
    [ X, X, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 22
    [ X, X, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 23 open space
    [ X, X, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, F, F, F, F, C, C, E, X, X ], // 24 weight rack area (F)
    [ X, X, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, F, F, F, F, C, C, E, X, X ], // 25
    [ X, X, E, E, E, E, E, E, E, E, E, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, X, X ], // 26 yard fence bottom (gap at col 15)

    // --- CHAPEL / CLASSROOM (rows 27-30): dark floor, books, Day 3 learning ---
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 27
    [ X, X, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, X, X ], // 28 pew zones (F clusters)
    [ X, X, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, D, D, D, X, X ], // 29
    [ X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 30

    // --- OUTER WALLS (rows 31-34) ---
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 31
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 32
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 33
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 34
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 3, y: 7 }, // JP's cell (cell3)
    npcs: [
      // --- JP's crew ---
      { id: 'ch3_mikey',    x: 2, y: 7,  sprite: 'npc_inmate' },    // in JP's cell (corner, not blocking door)
      { id: 'ch3_chris',    x: 9, y: 3,  sprite: 'npc_inmate2' },   // cell 2 (back of cell)
      { id: 'ch3_bird',     x: 9, y: 7,  sprite: 'npc_inmate3' },   // cell 4 (back of cell)
      { id: 'ch3_og',       x: 4, y: 11, sprite: 'npc_inmate4' },   // cell 5 (back of cell)
      { id: 'ch3_guard',    x: 19, y: 15, sprite: 'npc_guard' },     // guard station
      { id: 'ch3_mind',     x: 16, y: 16, sprite: 'npc_mirror' },    // bottom of hallway

      // --- Other inmates ---
      { id: 'ch3_fighter1', x: 25, y: 4,  sprite: 'npc_inmate3' },   // common area
      { id: 'ch3_fighter2', x: 26, y: 5,  sprite: 'npc_inmate2' },   // near fighter1
      { id: 'ch3_dice1',    x: 35, y: 7,  sprite: 'npc_inmate' },    // dice corner (right side)
      { id: 'ch3_dice2',    x: 36, y: 8,  sprite: 'npc_inmate4' },   // with dice1
      { id: 'ch3_tattoo',   x: 30, y: 3,  sprite: 'npc_inmate2' },   // common area corner
      { id: 'ch3_smoker',   x: 5, y: 23,  sprite: 'npc_inmate4' },   // yard corner
      { id: 'ch3_pullups',  x: 10, y: 19, sprite: 'npc_inmate3' },   // near exercise zone
      { id: 'ch3_book_inmate', x: 4, y: 3, sprite: 'npc_inmate' },   // cell 1 (study inmate)
    ],
  },
  triggers: [
    { x: 19, y: 30, action: 'scene', target: 'TractorScene' }, // bottom exit (chapel area)
    { x: 20, y: 30, action: 'scene', target: 'TractorScene' },
  ],
  interactables: [
    // --- Cell scratches ---
    { id: 'ch3_wall_1',  x: 2, y: 7,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_2',  x: 2, y: 8,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_3',  x: 15, y: 14, type: 'scratch', glow: true, sprite: 'item-scratch' },  // near guard station
    { id: 'ch3_wall_4',  x: 6, y: 13, type: 'scratch', glow: true, sprite: 'item-scratch' },   // hallway wall

    // --- JP's cell items ---
    { id: 'ch3_bed',         x: 3, y: 6,   type: 'examine', glow: true, sprite: 'item-bed' },      // BACK of JP's cell
    { id: 'ch3_toilet',      x: 2, y: 6,   type: 'examine', glow: true, sprite: 'item-toilet' },   // JP's cell
    { id: 'ch3_book',        x: 5, y: 8,   type: 'examine', glow: true, sprite: 'item-book' },     // JP's cell
    { id: 'ch3_letter_home', x: 4, y: 6,   type: 'examine', glow: true, sprite: 'item-letter' },   // JP's cell

    // --- Hallway / common ---
    { id: 'ch3_phone',       x: 10, y: 13, type: 'examine', glow: true, sprite: 'item-phone' },    // hallway phone
    { id: 'ch3_window',      x: 14, y: 16, type: 'examine', glow: true, sprite: 'item-window' },   // small window in hallway
    { id: 'ch3_transformation', x: 13, y: 16, type: 'examine', glow: true },                        // hallway mirror

    // --- Common area ---
    { id: 'ch3_commissary',  x: 28, y: 4,  type: 'examine', glow: true },                          // commissary counter
    { id: 'ch3_fight_watch', x: 23, y: 3,  type: 'examine', glow: true },                          // watching fight
    { id: 'ch3_dice_watch',  x: 34, y: 8,  type: 'examine', glow: true, sprite: 'item-dice' },     // watching dice
    { id: 'ch3_anger_management', x: 24, y: 8, type: 'examine', glow: true },                      // anger mgmt poster

    // --- Yard ---
    { id: 'ch3_pushups',     x: 12, y: 19, type: 'examine', glow: true, sprite: 'item-weights' },  // yard
    { id: 'ch3_yard',        x: 18, y: 23, type: 'examine', glow: true },                          // open yard area
    { id: 'ch3_birthday',    x: 30, y: 23, type: 'examine', glow: true },                          // yard, open area
    { id: 'ch3_faith',       x: 7, y: 22,  type: 'examine', glow: true },                          // quiet corner of yard

    // --- Study corner / weight rack ---
    { id: 'ch3_tablet',      x: 34, y: 24, type: 'examine', glow: true, sprite: 'item-tablet' },   // weight rack area
    { id: 'ch3_music',       x: 34, y: 25, type: 'examine', glow: true, sprite: 'item-headphones' }, // near weights
    { id: 'ch3_psych_course', x: 35, y: 24, type: 'examine', glow: true, sprite: 'item-book' },    // near study corner

    // --- Mirrors (different locations) ---
    { id: 'ch3_mirror_day2', x: 12, y: 13, type: 'examine', glow: true },                          // hallway mirror
    { id: 'ch3_mirror_day3', x: 33, y: 24, type: 'examine', glow: true },                          // weight area mirror
  ],
};

// ---------------------------------------------------------------------------
// 4. TRACTOR MAP — Farm / Rural Area  (40 wide x 28 tall)
// ---------------------------------------------------------------------------
// Wide open fields, bigger farmhouse, multiple vineyard blocks with paths
// between them, outbuildings, scattered trees. Computer in farmhouse.
// ---------------------------------------------------------------------------
export const tractorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [ T, T, G, G, G, T, G, G, G, G, T, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, T, G, G, G, G, G, T, G, G, G, G, G, T, T ], // 0  tree line top
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 1  scattered trees
    [ G, G, G, G, I, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 2  dirt patch + open sky

    // --- FARMHOUSE AREA (rows 3-8) ---
    [ G, G, G, B, B, B, B, B, B, B, B, G, C, C, C, G, G, G, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 3  farmhouse + parking pad + outbuilding
    [ G, G, G, B, F, F, F, F, F, F, B, G, C, C, C, G, G, G, B, F, F, F, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 4  farmhouse interior
    [ G, G, G, B, F, F, F, F, F, F, B, G, C, R, C, G, G, G, B, F, F, F, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 5  farmhouse interior, R=tractor on pad
    [ G, G, G, B, F, F, F, F, F, F, B, G, C, C, C, G, G, G, B, B, O, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 6
    [ G, G, G, B, B, B, B, O, B, B, B, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 7  farmhouse door
    [ G, G, G, G, G, G, G, P, G, G, G, G, I, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 8  path from farmhouse

    // --- PATH connecting farmhouse to vineyards (rows 9-10) ---
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 9  main horizontal path
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 10 path south

    // --- VINEYARD BLOCK 1 (rows 11-17): left side, big ---
    [ G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, P, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 11 fence top (2 vineyard blocks)
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 12 vineyard row
    [ G, G, E, I, I, I, I, G, I, I, I, G, I, I, I, I, E, G, G, G, P, G, E, I, I, G, I, I, I, G, I, I, I, G, I, I, I, E, G, G ], // 13 weeds in dirt
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 14 vineyard row
    [ G, G, E, I, I, G, I, I, I, G, I, I, I, G, I, I, E, G, G, G, P, G, E, I, I, I, I, G, I, I, I, I, G, I, I, I, I, E, G, G ], // 15 weeds
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 16 vineyard row
    [ G, G, E, I, P, I, P, I, P, I, P, I, P, I, P, I, E, G, G, G, P, G, E, I, P, I, P, I, P, I, P, I, P, I, P, I, P, E, G, G ], // 17 tractor tracks through vineyard
    [ G, G, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, P, G, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, E, G, G ], // 18 fence bottom (gaps for paths)

    // --- VINEYARD ROW 2 bottom + connecting paths (rows 19-22) ---
    [ G, G, G, G, G, G, G, G, G, P, G, G, I, G, G, G, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, I, G, G, G, G, G, G ], // 19 paths connecting blocks
    [ G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, W, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G ], // 20 irrigation puddle
    [ G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G ], // 21
    [ G, G, G, G, G, T, G, G, G, P, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, P, G, G, T, G, G, G, G, G, G, G, G, G ], // 22 scattered trees

    // --- OPEN GRASSLAND + DIRT PATHS (rows 23-25) ---
    [ G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, T, G, G, G, G, G, G ], // 23 main path south
    [ G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G ], // 24 trees
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 25 open grassland

    // --- EXIT AREA (rows 26-27) ---
    [ G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, G ], // 26 path to exit
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 27
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 7, y: 8 },
    npcs: [
      { id: 'ch4_boss', x: 20, y: 9, sprite: 'npc_farmer' },
      { id: 'ch4_coworker', x: 5, y: 9, sprite: 'npc_jose' },
      { id: 'ch4_eliseo', x: 30, y: 15, sprite: 'npc_generic' },
    ],
  },
  triggers: [
    { x: 7,  y: 5,  action: 'dialogue', target: 'ch4_computer' },
    { x: 20, y: 27, action: 'scene', target: 'TransitionScene', data: { text: 'Two months later...', subtext: 'JP is building.', nextScene: 'ComeUpScene' } },
  ],
  interactables: [
    { id: 'ch4_tractor', x: 13, y: 9, type: 'examine', glow: true },
    { id: 'ch4_vines', x: 25, y: 14, type: 'examine', glow: true },
    { id: 'ch4_phone', x: 8, y: 9, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch4_ai_discovery', x: 6, y: 5, type: 'evolve', glow: true, sprite: 'item-tablet' },
    { id: 'ch4_sunrise', x: 35, y: 2, type: 'examine', glow: true },
    { id: 'ch4_lunch', x: 3, y: 9, type: 'examine', glow: true, sprite: 'item-food' },
    { id: 'ch4_paycheck', x: 30, y: 19, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch4_d8_seat', x: 20, y: 6, type: 'examine', glow: true },
    { id: 'ch4_crash', x: 14, y: 17, type: 'examine', glow: true },
    { id: 'ch4_vineyard_row', x: 10, y: 14, type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 5. COME-UP MAP — Home Office + Client District  (40 wide x 28 tall)
// ---------------------------------------------------------------------------
// JP's home office at top, streets with client buildings (print shop, WCT,
// DHL warehouse), park area at bottom with exit trigger.
// ---------------------------------------------------------------------------
export const comeUpMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    // --- JP'S HOME OFFICE AREA (rows 0-6) ---
    [ G, G, T, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G ], // 0  open feel - trees + grass
    [ G, G, G, G, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 1  office walls
    [ G, G, G, G, B, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 2  HARDWOOD floor
    [ G, G, G, G, B, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 3
    [ G, G, G, G, B, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 4
    [ G, G, G, G, B, B, B, B, O, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 5  office door
    [ G, G, T, G, G, I, G, G, C, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 6  yard + driveway

    // --- STREET (rows 7-8) ---
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 7  street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 8  street (solid concrete)

    // --- CLIENT DISTRICT 1 (rows 9-14): first row of buildings ---
    [ G, G, G, I, G, G, G, G, C, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 9  near building
    [ G, G, B, B, B, B, B, G, C, G, G, G, G, G, B, B, B, B, B, B, G, G, G, G, G, G, B, B, B, B, B, B, B, G, G, G, G, G, G, G ], // 10 3 client buildings
    [ G, G, B, F, F, F, B, G, C, G, G, T, G, G, B, F, F, F, F, B, G, G, G, G, G, G, B, F, F, F, F, F, B, G, G, G, G, G, G, G ], // 11
    [ G, G, B, F, N, F, B, G, C, G, G, G, G, G, B, F, F, F, F, B, G, G, G, G, G, G, B, F, F, F, F, F, B, G, G, G, G, G, G, G ], // 12 N=counter in print shop
    [ G, G, B, B, O, B, B, G, C, G, G, G, G, G, B, B, B, O, B, B, G, G, G, G, G, G, B, B, B, O, B, B, B, G, G, G, G, G, G, G ], // 13 doors
    [ G, G, I, G, C, G, G, G, C, G, G, G, I, G, G, G, G, C, G, G, G, G, G, G, I, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G ], // 14 worn dirt near walks

    // --- SECOND STREET (rows 15-16) ---
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 15 main street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 16

    // --- CLIENT DISTRICT 2 (rows 17-22): WCT store, DHL warehouse ---
    [ G, G, G, G, G, G, G, G, C, G, G, B, B, B, B, B, B, G, G, G, G, G, G, G, E, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G ], // 17 WCT store + DHL warehouse (E=signpost)
    [ G, G, G, G, G, G, G, G, C, G, G, B, F, F, F, F, B, G, G, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, B, G, G, G, G ], // 18 WCT interior | DHL dark warehouse
    [ G, G, G, G, G, G, G, G, C, G, G, B, F, F, F, F, B, G, G, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, B, G, G, G, G ], // 19 WCT interior | DHL warehouse
    [ G, G, G, G, G, G, G, G, C, G, G, B, B, B, O, B, B, G, G, G, G, G, G, G, B, B, B, B, O, B, B, B, B, B, B, B, G, G, G, G ], // 20 doors
    [ G, G, G, G, G, G, G, G, C, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G ], // 21 walks from doors
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 22 bottom street

    // --- PARK / EXIT AREA (rows 23-27) ---
    [ G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G ], // 23 park with trees
    [ G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G ], // 24
    [ G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, C, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 25
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 26 walk to exit
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G ], // 27 exit at bottom-right
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 8, y: 3 },
    npcs: [
      { id: 'ch5_first_client', x: 4,  y: 14, sprite: 'npc_client' },
      { id: 'ch5_sticker',      x: 29, y: 14, sprite: 'npc_sticker_smith' },
      { id: 'ch5_ghost',        x: 14, y: 21, sprite: 'npc_generic' },
      { id: 'ch5_rejected',     x: 20, y: 8,  sprite: 'npc_generic' },
      { id: 'ch5_wct',          x: 14, y: 16, sprite: 'npc_client' },
      { id: 'ch5_vacaville',    x: 10, y: 8,  sprite: 'npc_generic' },
      { id: 'ch5_manza',        x: 30, y: 8,  sprite: 'npc_manza' },
    ],
  },
  triggers: [
    { x: 38, y: 27, action: 'scene', target: 'LAScene' },
  ],
  interactables: [
    { id: 'ch5_wct_showcase', x: 4, y: 13, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_sticker_showcase', x: 28, y: 14, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_dhl_showcase', x: 28, y: 21, type: 'showcase', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_first_dollar', x: 7, y: 3, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_late_night', x: 8, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_review', x: 35, y: 9, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch5_print_shop', x: 4, y: 15, type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch5_dhl_building', x: 28, y: 22, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_first_site', x: 7, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_3am', x: 9, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_pricing', x: 8, y: 2, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_github', x: 6, y: 3, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_stack', x: 7, y: 2, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_doubt', x: 6, y: 4, type: 'examine', glow: true, sprite: 'item-phone' },
  ],
};

// ---------------------------------------------------------------------------
// 6. OPERATOR MAP — LA Offices + Downtown  (40 wide x 25 tall)
// ---------------------------------------------------------------------------
// Pomaikai office (bigger, hardwood, conference room), other office buildings,
// concrete streets, downtown shops/plaza, exit to VegasScene at bottom.
// ---------------------------------------------------------------------------
export const operatorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

    // --- TREE LINE + CITY ENTRANCE (rows 0-2) ---
    [ T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, T ], // 0  tree-lined edge
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G ], // 1
    [ G, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T, C, C, C, C, C, G ], // 2  trees along boulevard

    // --- POMAIKAI OFFICE + OFFICE BUILDINGS (rows 3-10) ---
    [ G, C, C, B, B, B, B, B, B, B, B, B, B, B, C, C, C, C, C, B, B, B, B, B, B, B, B, C, C, C, B, B, B, B, B, B, B, C, C, G ], // 3  Pomaikai office (big) + office2 + office3
    [ G, C, C, B, J, J, J, J, J, J, J, J, J, B, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, F, F, F, F, F, B, C, C, G ], // 4  hardwood floors
    [ G, C, C, B, J, J, J, J, J, J, J, J, J, B, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, F, F, F, F, F, B, C, C, G ], // 5  office interiors
    [ G, C, C, B, J, J, J, J, N, J, J, J, J, B, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, F, F, F, F, F, B, C, C, G ], // 6  N=conference room divider in Pomaikai
    [ G, C, C, B, J, J, J, J, N, J, J, J, J, B, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, B, B, O, B, B, B, C, C, G ], // 7  conference room right side
    [ G, C, C, B, J, J, J, J, J, J, J, J, J, B, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 8
    [ G, C, C, B, B, B, B, B, O, B, B, B, B, B, C, C, C, C, C, B, B, B, B, O, B, B, B, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 9  doors
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 10

    // --- MAIN STREET (rows 11-12) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 11 main LA street
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 12

    // --- DOWNTOWN (rows 13-18): shops, plaza, enterprise NPCs ---
    [ G, G, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T, G, G ], // 13
    [ G, T, C, B, B, B, B, B, C, T, C, C, C, C, C, G, G, C, C, C, C, C, G, G, C, B, B, B, B, B, T, C, C, C, C, C, C, T, G, G ], // 14 shop + plaza walk + shop
    [ G, G, C, B, F, F, F, B, C, C, C, C, C, C, C, G, C, G, G, C, G, G, C, G, C, B, F, F, F, B, C, C, C, C, C, C, C, G, G, G ], // 15 shop interiors + grass plaza
    [ G, G, T, B, B, O, B, B, C, C, C, C, C, C, C, C, C, G, T, C, T, G, C, C, C, B, B, O, B, B, C, C, C, C, C, C, G, G, G, G ], // 16 cross street + plaza center
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, G, C, G, G, C, G, G, C, G, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, G ], // 17 plaza edges
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, C, C, C, C, C, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, G ], // 18 plaza bottom

    // --- EXIT STREET (rows 19-22): trees, leading south ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 19 exit street
    [ G, G, C, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, C, C, G, G, G ], // 20 tree-lined
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 21
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 22

    // --- EXIT TO VEGAS (rows 23-24) ---
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 23 gap for exit
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 24
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 19, y: 2 },
    npcs: [
      // LA zone — offices
      { id: 'ch6_malachi',      x: 7,  y: 5,  sprite: 'npc_malachi' },
      { id: 'ch6_big_client',   x: 22, y: 5,  sprite: 'npc_suit' },
      { id: 'ch6_equal',        x: 15, y: 12, sprite: 'npc_whale' },
      { id: 'ch6_office_kult',  x: 6,  y: 4,  sprite: 'npc_tech' },
      { id: 'ch6_tony',         x: 12, y: 10, sprite: 'npc_suit' },
      { id: 'ch6_client2',      x: 33, y: 5,  sprite: 'npc_business' },
      { id: 'ch6_dhl',           x: 28, y: 12, sprite: 'npc_dhl_client' },
      { id: 'ch6_mentor',        x: 20, y: 10, sprite: 'npc_generic' },
      { id: 'ch6_team_member',   x: 24, y: 13, sprite: 'npc_generic' },
      { id: 'ch6_security',      x: 24, y: 10, sprite: 'npc_security' },
      // LA zone — referrals
      { id: 'ch6_manza',         x: 30, y: 12, sprite: 'npc_manza' },
    ],
  },
  triggers: [
    // Exit south — JP heads to Vegas
    { x: 19, y: 24, action: 'scene', target: 'VegasScene' },
  ],
  interactables: [
    // LA zone
    { id: 'ch6_dashboard', x: 10, y: 5, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_portfolio', x: 19, y: 12, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_team', x: 10, y: 12, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_mirror', x: 33, y: 5, type: 'examine', glow: true },
    { id: 'ch6_pomaikai_office', x: 9, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_slack', x: 4, y: 10, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_revenue', x: 36, y: 10, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch6_instagram', x: 16, y: 12, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_future', x: 30, y: 10, type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch6_equal_moment', x: 22, y: 12, type: 'examine', glow: true },
    { id: 'ch6_security', x: 6, y: 15, type: 'examine', glow: true },
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
