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
// 0. HOME MAP — Suburban House + Yard  (30 wide x 25 tall)
// ---------------------------------------------------------------------------
// JP's childhood home before everything changes. Proper suburban house with
// JP's room, sister's room, parents' room, living room, kitchen, bathroom.
// Yard with grass and the Frenchie. Street at bottom exits to BeachScene.
// ---------------------------------------------------------------------------
export const homeMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    [ T, G, G, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, T ], // 0  roof
    [ G, G, G, K, J, J, J, J, J, K, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 1  rooms
    [ G, G, G, K, J, M, J, J, J, K, J, J, J, J, K, J, M, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 2  JP room (M=computer) | sister | parents (M=TV) | bathroom
    [ G, G, G, K, J, J, J, J, J, K, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 3
    [ G, G, G, K, J, J, J, J, J, K, J, J, J, J, K, J, J, J, J, J, J, K, F, F, F, F, K, G, G, G ], // 4
    [ G, G, G, K, K, K, K, O, K, K, K, K, O, K, K, K, K, O, K, K, K, K, K, O, K, K, K, G, G, G ], // 5  doors
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 6  hallway
    [ G, G, G, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 7  door to living area
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, J, J, J, J, J, J, K, G, G, G ], // 8  open concept: living + kitchen (N=counter island)
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 9
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, K, G, G, G ], // 10  wall counters on right
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 11
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 12
    [ G, G, G, K, K, K, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 13 front door
    [ G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 14 yard
    [ G, G, V, E, E, E, E, E, E, E, P, E, E, V, E, E, E, E, E, V, E, E, E, E, E, E, E, V, G, G ], // 15 fence top + vine accents
    [ G, G, E, G, I, T, G, G, L, G, P, G, G, G, G, G, T, G, G, G, I, G, G, G, T, G, G, E, G, G ], // 16 mulch near trees, palm
    [ G, G, E, G, G, I, G, G, G, G, P, G, G, L, G, G, G, G, G, W, W, W, W, G, G, G, G, E, G, G ], // 17 pond expanded slightly
    [ G, G, E, G, G, G, G, G, G, G, P, G, G, G, G, I, G, G, G, T, W, W, W, G, G, L, G, E, G, G ], // 18 mulch, palm added
    [ G, G, E, T, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, I, G, G, L, G, G, G, G, E, G, G ], // 19 dirt near pond
    [ G, G, V, E, E, E, E, E, E, E, P, E, E, E, V, E, E, E, E, E, E, E, E, E, E, V, E, E, G, G ], // 20 fence bottom + vine
    [ E, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E ], // 21 curb (fence segments) + driveway
    [ C, C, C, P, P, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, P, C ], // 22 road markings (PATH)
    [ C, C, C, C, C, C, C, P, C, C, P, C, C, P, C, C, C, P, C, C, C, C, P, C, C, C, C, C, C, C ], // 23 dashed center lane
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 24
  ],
  collisions: [...STANDARD_COLLISIONS],
  spawns: {
    player: { x: 6, y: 3 },
    npcs: [
      { id: 'ch0_pops',    x: 8,  y: 10, sprite: 'npc_pops' },
      { id: 'ch0_mom',     x: 20, y: 9,  sprite: 'npc_female' },
      { id: 'ch0_sister',  x: 12, y: 2,  sprite: 'npc_sister' },
      { id: 'ch0_frenchie', x: 15, y: 18, sprite: 'npc_frenchie' },
    ],
  },
  triggers: [
    { x: 9,  y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 10, y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 11, y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 12, y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 13, y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 14, y: 24, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
  ],
  interactables: [
    // JP's Room
    { id: 'ch0_computer',      x: 5,  y: 1,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch0_crypto',        x: 7,  y: 1,  type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch0_college',       x: 8,  y: 2,  type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch0_bed',           x: 4,  y: 4,  type: 'examine', glow: true, sprite: 'item-bed' },
    { id: 'ch0_poster',        x: 8,  y: 4,  type: 'examine', glow: true },
    { id: 'ch0_hidden_stash',  x: 4,  y: 1,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch0_journal',       x: 6,  y: 4,  type: 'examine', glow: true, sprite: 'item-book' },
    // Sister's Room
    { id: 'ch0_sister_toys',   x: 11, y: 4,  type: 'examine', glow: true },
    // Parents' Room
    { id: 'ch0_family_photo',  x: 16, y: 1,  type: 'examine', glow: true, sprite: 'item-photo' },
    // Bathroom
    { id: 'ch0_mirror',        x: 24, y: 1,  type: 'examine', glow: true, sprite: 'item-mirror' },
    // Living Room
    { id: 'ch0_tv',            x: 5,  y: 8,  type: 'examine', glow: true, sprite: 'item-tv' },
    { id: 'ch0_couch',         x: 10, y: 9,  type: 'examine', glow: true, sprite: 'item-couch' },
    // Kitchen
    { id: 'ch0_fridge',        x: 25, y: 8,  type: 'examine', glow: true, sprite: 'item-fridge' },
    { id: 'ch0_mail',          x: 20, y: 11, type: 'examine', glow: true, sprite: 'item-letter' },
    // Yard
    { id: 'ch0_bbq',           x: 6,  y: 17, type: 'examine', glow: true, sprite: 'item-bbq' },
    { id: 'ch0_nolan_call',    x: 7,  y: 4,  type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch0_frenchie_ball', x: 16, y: 17, type: 'examine', glow: true },
    { id: 'ch0_fishing',       x: 19, y: 17, type: 'examine', glow: true },
    { id: 'ch0_goodbye',       x: 10, y: 20, type: 'examine', glow: true },
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
    [ B, F, F, F, F, F, F, F, B, F, F, F, M, F, B, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 3  walls between rooms
    [ B, F, F, F, F, F, F, F, O, F, F, F, F, F, O, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 4  single doors between rooms
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, H, H, H, H, H, C, B ], // 5  walls between rooms
    [ B, F, F, F, F, F, F, F, B, F, F, F, F, F, B, F, F, F, F, B, C, C, C, C, C, C, C, B ], // 6
    [ B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B ], // 7  house bottom wall with doors
    [ G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G ], // 8  paths from house doors
    [ G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G ], // 9
    [ C, C, C, P, C, C, P, C, C, C, C, C, C, P, C, C, C, C, P, C, C, C, C, C, C, P, C, C ], // 10 concrete + crosswalk PATH
    [ C, C, C, C, C, P, C, C, C, C, C, C, P, C, C, C, C, P, C, C, C, C, C, P, C, C, C, C ], // 11 offset crosswalk
    [ G, G, T, G, I, G, G, V, G, G, G, G, G, G, G, I, G, G, G, G, G, G, V, G, G, T, G, G ], // 12 grass transition + dirt + vine
    [ G, I, L, G, G, G, L, G, G, I, G, G, G, V, G, G, G, G, G, I, G, L, G, G, G, L, G, G ], // 13 more palms + dirt + vine
    [ S, S, S, S, S, P, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, P, S, S, S, S, S ], // 14 sand + footpath
    [ S, S, S, I, S, P, S, S, L, S, S, S, E, S, S, S, S, S, S, L, S, S, P, S, S, S, I, S ], // 15 wet sand (I), volleyball post (E)
    [ S, S, S, L, S, P, S, I, S, S, S, S, S, S, S, S, E, S, S, S, S, S, P, S, L, S, S, S ], // 16 volleyball post, footpath
    [ S, S, I, S, S, L, S, S, S, I, S, S, S, S, S, S, S, S, S, S, I, S, L, S, S, S, S, S ], // 17 wet sand scattered
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 18
    [ S, S, S, W, S, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, S, W, S, S, S, S ], // 19 shore break — sand in water
    [ W, W, W, W, W, W, W, W, W, W, W, W, P, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 20 rocks (PATH) in water
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 21
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 11, y: 9 },
    npcs: [
      { id: 'ch1_homie1', x: 10, y: 2,  sprite: 'npc_nolan' },      // Nolan in JP's room area
      { id: 'ch1_homie2', x: 3,  y: 2,  sprite: 'npc_david' },      // David in living room
      { id: 'ch1_cooper',  x: 6,  y: 5,  sprite: 'npc_cooper' },     // Cooper in living room
      { id: 'ch1_girl1',  x: 22, y: 3,  sprite: 'npc_bikini1' },     // In hot tub
      { id: 'ch1_girl2',  x: 26, y: 3,  sprite: 'npc_bikini2' },     // Outside hot tub
      { id: 'ch1_girl3',  x: 24, y: 4,  sprite: 'npc_bikini1' },     // In hot tub
      { id: 'ch1_girl_couch', x: 2, y: 4, sprite: 'npc_bikini2' },   // Sleeping in living room
      { id: 'ch1_terrell', x: 20, y: 6, sprite: 'npc_terrell' },     // By the hot tub patio
      { id: 'ch1_volleyball1', x: 10, y: 16, sprite: 'npc_surfer' },
      { id: 'ch1_volleyball2', x: 12, y: 16, sprite: 'npc_kid' },
      { id: 'ch1_sunbather',   x: 18, y: 15, sprite: 'npc_bikini1' },
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
    { id: 'ch1_hottub',  x: 20, y: 6,  type: 'examine', glow: true },
    { id: 'ch1_mess',    x: 2,  y: 6,  type: 'examine', glow: true, sprite: 'item-bottle' },
    { id: 'ch1_view',    x: 14, y: 16, type: 'examine', glow: true },
    { id: 'ch1_smoke',   x: 6,  y: 9,  type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_blunt',   x: 22, y: 6,  type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_bong',    x: 17, y: 1,  type: 'examine', glow: true, sprite: 'item-bong' },
    { id: 'ch1_setup',   x: 11, y: 2,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch1_bed',     x: 9,  y: 5,  type: 'examine', glow: true, sprite: 'item-bed' },
    { id: 'ch1_closet',  x: 13, y: 2,  type: 'examine', glow: true },
    { id: 'ch1_speaker', x: 9,  y: 1,  type: 'examine', glow: true },
    { id: 'ch1_volleyball1', x: 11, y: 16, type: 'examine', glow: true },
  ],
};

// ---------------------------------------------------------------------------
// 2. WRONG CROWD MAP — SB Frat House at Night + Buyer's Block  (30 wide x 28 tall)
// ---------------------------------------------------------------------------
// Same SB frat house layout from beachMap but at 3:33 AM — dark, empty.
// JP wakes up alone, grabs product, drives to buyer's house across the street.
// ---------------------------------------------------------------------------
export const wrongCrowdMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    // --- SB FRAT HOUSE AT NIGHT (rows 0-7) — same layout as beachMap but DARK_FLOOR ---
    [ X, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, X ], // 0  house top wall
    [ X, B, D, D, D, D, D, D, B, D, D, D, D, D, B, D, D, D, D, B, C, C, C, C, C, C, C, B, X, X ], // 1  living room | JP room | kitchen | hot tub patio
    [ X, B, D, D, D, D, D, D, B, D, D, D, D, D, B, D, D, D, D, B, C, H, H, H, H, H, C, B, X, X ], // 2  hot tub (empty at night)
    [ X, B, D, D, D, D, D, D, B, D, D, D, M, D, B, D, D, D, D, B, C, H, H, H, H, H, C, B, X, X ], // 3  M=computer desk in JP room
    [ X, B, D, D, D, D, D, D, O, D, D, D, D, D, O, D, D, D, D, B, C, H, H, H, H, H, C, B, X, X ], // 4  doors between rooms
    [ X, B, D, D, D, D, D, D, B, D, D, D, D, D, B, D, D, D, D, B, C, H, H, H, H, H, C, B, X, X ], // 5  walls between rooms
    [ X, B, D, D, D, D, D, D, B, D, D, D, D, D, B, D, D, D, D, B, C, C, C, C, C, C, C, B, X, X ], // 6
    [ X, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B, O, B, B, B, B, B, B, O, B, B, B, B, X, X ], // 7  house bottom wall with doors

    // --- DARK YARD (rows 8-9) + vine and dirt detail ---
    [ X, G, G, I, P, G, T, G, G, V, G, P, G, G, G, G, P, G, G, G, G, G, G, P, G, T, G, G, X, X ], // 8  paths + dirt + vine on fence
    [ X, G, G, G, P, G, G, I, G, G, G, P, G, G, G, G, P, G, I, G, G, G, G, P, G, G, G, G, X, X ], // 9  yard + dirt patches

    // --- STREET (rows 10-12) + lane markings ---
    [ C, C, C, C, C, C, P, C, C, C, C, C, C, P, C, C, C, C, P, C, C, C, C, C, C, P, C, C, C, C ], // 10 crosswalk pattern
    [ C, C, C, C, C, P, C, C, C, C, C, C, P, C, C, C, C, P, C, C, C, C, C, P, C, C, C, C, C, C ], // 11 BMW parked here (sprite overlay)
    [ C, I, C, C, C, C, C, C, I, C, C, C, C, C, C, C, C, C, C, C, I, C, C, C, C, C, C, I, C, C ], // 12 street + gritty dirt patches

    // --- STREET + APPROACH (rows 13-16) + lane markings ---
    [ C, C, C, C, E, E, E, C, C, P, C, C, C, C, P, C, C, C, C, C, C, C, E, E, E, C, C, C, C, C ], // 13 parked cars (fences) + lane marks
    [ C, C, C, C, C, C, C, C, C, C, C, I, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 14 road with path + dirt
    [ C, C, I, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, I, C, C, C, C, C, C, C, C, C, C, C ], // 15 road + grit
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 16 road continues

    // --- BUYER'S BLOCK (rows 17-22) ---
    [ X, X, G, G, B, B, B, B, B, G, G, G, G, G, P, G, G, G, G, G, G, T, G, G, G, T, G, G, X, X ], // 17 corner store + trees
    [ X, X, G, G, B, F, F, F, O, G, G, G, G, G, P, P, P, P, P, G, G, G, G, G, G, G, G, G, X, X ], // 18 store interior + path branches
    [ X, X, G, G, B, B, B, B, B, G, G, T, G, G, G, G, G, G, P, G, G, G, G, G, T, G, G, G, X, X ], // 19 store wall + trees
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, B, B, B, B, B, B, B, G, X, X ], // 20 buyer house top wall
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, B, D, D, D, D, D, B, G, X, X ], // 21 inside visible through wall
    [ X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, O, D, D, D, B, G, X, X ], // 22 path leads directly to door

    // --- INSIDE BUYER'S HOUSE (rows 23-27) + detail ---
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, D, F, D, D, B, X, X, X ], // 23 floor variation inside
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, D, D, D, D, B, X, X, X ], // 24 sale spot area
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, D, F, D, M, D, B, X, X, X ], // 25 table (M) + floor mix
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, B, B, B, B, B, B, B, X, X, X ], // 26 back wall
    [ X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X ], // 27 bottom border
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 11, y: 3 },  // JP starts in his room (same position as beachMap JP room)
    npcs: [
      { id: 'ch2_homie_door', x: 14, y: 9, sprite: 'npc_jose' },    // Jose waiting outside
      { id: 'ch2_corner_guy', x: 6, y: 18, sprite: 'npc_generic' }, // guy at corner store
      { id: 'ch2_street_kid', x: 10, y: 17, sprite: 'npc_shady' },  // kid on the street
      { id: 'ch2_lookout',    x: 18, y: 20, sprite: 'npc_shady' },   // outside buyer's house
      { id: 'ch2_buyer',      x: 23, y: 23, sprite: 'npc_dealer' }, // inside buyer's house
    ],
  },
  triggers: [],  // No scene triggers — only way out is through ch2_sale raid
  interactables: [
    { id: 'ch2_grab_weed', x: 12, y: 3, type: 'examine', glow: true, sprite: 'item-weed-bag' },  // weed on desk in JP's room
    { id: 'ch2_gun',       x: 10, y: 1, type: 'examine', glow: true, sprite: 'item-gun' },       // gun in JP's room
    { id: 'ch2_computer',  x: 12, y: 1, type: 'examine', glow: true },                            // computer/desk
    { id: 'ch2_bed',       x: 9,  y: 5, type: 'examine', glow: true, sprite: 'item-bed' },       // bed in JP's room
    { id: 'ch2_car',       x: 11, y: 11, type: 'examine', glow: true, sprite: 'item-keys' },     // BMW on street
    { id: 'ch2_sale',      x: 23, y: 24, type: 'examine', glow: true, sprite: 'item-weed-bag' }, // THE TRIGGER — sale spot
    { id: 'ch2_phone',     x: 10, y: 3, type: 'examine', glow: true, sprite: 'item-phone' },     // phone in JP's room
    { id: 'ch2_money_stack', x: 13, y: 3, type: 'examine', glow: true, sprite: 'item-money' },   // money in JP's room
    { id: 'ch2_light1',    x: 4, y: 3, type: 'examine', glow: true },                             // light switch in living room
    { id: 'ch2_light2',    x: 16, y: 3, type: 'examine', glow: true },                            // light switch in kitchen
    { id: 'ch2_graffiti',  x: 3, y: 17, type: 'examine', glow: true },
    { id: 'ch2_store',     x: 7, y: 18, type: 'examine', glow: true },
    { id: 'ch2_nervous',   x: 12, y: 18, type: 'examine', glow: true },
    { id: 'ch2_streetlight', x: 16, y: 17, type: 'examine', glow: true },
    { id: 'ch2_hottub_night', x: 23, y: 3, type: 'examine', glow: true },
    { id: 'ch2_fridge',       x: 17, y: 2, type: 'examine', glow: true, sprite: 'item-fridge' },
    { id: 'ch2_front_door',   x: 11, y: 8, type: 'examine', glow: true },
    { id: 'ch2_street_walk',  x: 14, y: 13, type: 'examine', glow: true },
    { id: 'ch2_parking_lot',  x: 20, y: 21, type: 'examine', glow: true },
    { id: 'ch2_pops_missed',  x: 10, y: 5, type: 'examine', glow: true, sprite: 'item-phone' },
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

    // --- CELL BLOCK (rows 2-10) left: cells w/ jail bars | concrete hall | right: common area ---
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, X, X ], // 2  cell1 | cell2 | hall | common
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, F, F, D, D, D, D, D, D, D, D, D, X, X ], // 3
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, M, F, F, D, D, D, D, M, D, D, D, D, X, X ], // 4  tables in common area
    [ X, X, X, O, Z, Z, X, X, O, Z, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 5  cell doors + bars
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, D, D, F, F, D, D, D, D, D, X, X ], // 6  JP's cell | cell4
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, M, D, F, F, D, D, D, D, D, X, X ], // 7
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 8
    [ X, X, X, O, Z, Z, X, X, O, Z, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 9  cell doors
    [ X, X, D, D, D, Z, X, D, D, D, Z, X, C, C, C, C, X, X, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, X, X ], // 10

    // --- MAIN HALLWAY (rows 11-14) — concrete institutional ---
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 11
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, E, F, F, F, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 12 guard station (fenced)
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, E, F, M, F, E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 13 guard desk
    [ X, X, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, X, X ], // 14

    // --- YARD / EXERCISE AREA (rows 15-22) — fenced perimeter ---
    [ X, X, E, E, E, E, E, E, E, E, E, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, X, X ], // 15 yard fence top
    [ X, X, E, C, I, C, E, E, E, C, C, I, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, E, X, X ], // 16 pull-up bars + dirt
    [ X, X, E, C, C, C, C, C, C, C, I, C, C, C, C, P, P, P, C, C, C, C, P, C, C, E, E, C, C, C, C, C, E, X, X ], // 17
    [ X, X, E, I, C, C, C, C, C, C, C, C, C, C, C, P, F, F, F, C, C, C, P, C, C, C, C, C, C, F, F, F, E, X, X ], // 18 covered + study
    [ X, X, E, C, C, C, C, C, I, C, C, C, C, C, C, P, F, F, F, C, C, C, P, P, P, P, C, C, C, F, F, F, E, X, X ], // 19
    [ X, X, E, C, C, C, C, C, C, C, C, C, I, C, C, C, C, C, C, C, C, C, C, C, C, C, I, C, C, C, C, C, E, X, X ], // 20
    [ X, X, E, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E, X, X ], // 21
    [ X, X, E, E, E, E, E, E, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, X, X ], // 22 yard fence bottom

    // --- BOTTOM COMMON AREA (rows 23-25) — chapel/classroom ---
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
      // --- JP's crew ---
      { id: 'ch3_mikey',    x: 2, y: 7,  sprite: 'npc_inmate' },    // in JP's cell (corner, not blocking door)
      { id: 'ch3_chris',    x: 7, y: 3,  sprite: 'npc_inmate2' },   // cell 2 (back of cell)
      { id: 'ch3_bird',     x: 7, y: 7,  sprite: 'npc_inmate3' },   // cell 4 (back of cell)
      { id: 'ch3_og',       x: 4, y: 10, sprite: 'npc_inmate4' },   // cell 5 (back of cell)
      { id: 'ch3_guard',    x: 17, y: 12, sprite: 'npc_guard' },     // guard station (right side, not blocking)
      { id: 'ch3_mind',     x: 14, y: 14, sprite: 'npc_mirror' },    // bottom of hallway (wide open space)

      // --- Other inmates ---
      { id: 'ch3_fighter1', x: 22, y: 4,  sprite: 'npc_inmate3' },   // common area (not on main path)
      { id: 'ch3_fighter2', x: 23, y: 5,  sprite: 'npc_inmate2' },   // near fighter1
      { id: 'ch3_dice1',    x: 30, y: 7,  sprite: 'npc_inmate' },    // dice corner (right side)
      { id: 'ch3_dice2',    x: 32, y: 8,  sprite: 'npc_inmate4' },   // with dice1
      { id: 'ch3_tattoo',   x: 27, y: 3,  sprite: 'npc_inmate2' },   // common area corner
      { id: 'ch3_smoker',   x: 4, y: 20,  sprite: 'npc_inmate4' },   // yard corner
      { id: 'ch3_pullups',  x: 8, y: 17,  sprite: 'npc_inmate3' },   // near pull-up bars
      { id: 'ch3_book_inmate', x: 4, y: 2, sprite: 'npc_inmate' },   // cell 1 (study inmate)
    ],
  },
  triggers: [
    { x: 17, y: 25, action: 'scene', target: 'TractorScene' }, // bottom exit
    { x: 18, y: 25, action: 'scene', target: 'TractorScene' },
  ],
  interactables: [
    // --- Cell scratches ---
    { id: 'ch3_wall_1',  x: 2, y: 7,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_2',  x: 2, y: 8,  type: 'scratch', glow: true, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_3',  x: 13, y: 12, type: 'scratch', glow: true, sprite: 'item-scratch' },  // near guard station
    { id: 'ch3_wall_4',  x: 5, y: 11, type: 'scratch', glow: true, sprite: 'item-scratch' },   // hallway wall

    // --- JP's cell items ---
    { id: 'ch3_bed',         x: 3, y: 6,   type: 'examine', glow: true, sprite: 'item-bed' },      // BACK of JP's cell (top corner)
    { id: 'ch3_toilet',      x: 2, y: 6,   type: 'examine', glow: true, sprite: 'item-toilet' },   // JP's cell
    { id: 'ch3_book',        x: 4, y: 8,   type: 'examine', glow: true, sprite: 'item-book' },     // JP's cell
    { id: 'ch3_letter_home', x: 4, y: 6,   type: 'examine', glow: true, sprite: 'item-letter' },   // JP's cell

    // --- Hallway / common ---
    { id: 'ch3_phone',       x: 9, y: 11,  type: 'examine', glow: true, sprite: 'item-phone' },    // hallway phone
    { id: 'ch3_window',      x: 13, y: 14, type: 'examine', glow: true, sprite: 'item-window' },   // small window in hallway
    { id: 'ch3_transformation', x: 12, y: 14, type: 'examine', glow: true },                        // hallway mirror

    // --- Common area ---
    { id: 'ch3_commissary',  x: 25, y: 4,  type: 'examine', glow: true },                          // commissary counter
    { id: 'ch3_fight_watch', x: 20, y: 3,  type: 'examine', glow: true },                          // watching fight
    { id: 'ch3_dice_watch',  x: 29, y: 8,  type: 'examine', glow: true, sprite: 'item-dice' },     // watching dice
    { id: 'ch3_anger_management', x: 21, y: 8, type: 'examine', glow: true },                      // anger mgmt poster

    // --- Yard ---
    { id: 'ch3_pushups',     x: 10, y: 17, type: 'examine', glow: true, sprite: 'item-weights' },  // yard
    { id: 'ch3_yard',        x: 15, y: 20, type: 'examine', glow: true },                          // open yard area
    { id: 'ch3_birthday',    x: 25, y: 20, type: 'examine', glow: true },                          // yard, open area
    { id: 'ch3_faith',       x: 6, y: 19,  type: 'examine', glow: true },                          // quiet corner of yard

    // --- Study corner ---
    { id: 'ch3_tablet',      x: 30, y: 18, type: 'examine', glow: true, sprite: 'item-tablet' },   // study corner
    { id: 'ch3_music',       x: 30, y: 19, type: 'examine', glow: true, sprite: 'item-headphones' }, // study corner
    { id: 'ch3_psych_course', x: 31, y: 18, type: 'examine', glow: true, sprite: 'item-book' },    // near study corner

    // --- Mirrors (different locations) ---
    { id: 'ch3_mirror_day2', x: 10, y: 11, type: 'examine', glow: true },                          // hallway mirror
    { id: 'ch3_mirror_day3', x: 28, y: 18, type: 'examine', glow: true },                          // study area mirror
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
    [ T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 0  reduced borders
    [ G, G, G, G, I, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 1  dirt patch
    [ G, G, G, B, B, B, B, B, G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, G, G ], // 2
    [ G, G, C, B, F, F, F, B, C, G, E, I, G, I, I, I, I, I, I, I, G, I, E, G, G, G, G, G ], // 3  concrete pad + weedy vineyard
    [ G, G, C, B, F, F, M, B, C, G, E, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, G, G ], // 4  vineyard row
    [ G, G, C, B, F, F, F, B, C, G, E, I, I, G, I, I, R, I, I, G, I, I, E, G, G, G, G, G ], // 5  grass weeds in dirt
    [ G, G, G, B, B, O, B, B, G, G, E, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, G, G ], // 6  vineyard row
    [ G, G, G, G, G, P, G, G, G, G, E, I, I, I, I, G, I, I, I, G, I, I, E, G, G, G, G, G ], // 7  weeds
    [ G, G, I, G, G, P, G, G, G, G, E, I, V, I, V, I, V, I, V, I, V, I, E, G, G, T, G, G ], // 8  vineyard row
    [ G, P, P, P, P, P, P, P, P, P, E, I, P, I, P, I, P, I, P, I, P, I, E, G, G, G, G, G ], // 9  tractor tracks through vineyard
    [ G, G, G, G, G, P, G, W, G, G, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 10 irrigation puddle (W)
    [ G, G, I, G, G, P, G, G, G, G, G, G, I, G, G, P, G, G, G, I, G, G, G, G, G, G, G, G ], // 11 dirt path variations
    [ G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T, G, G ], // 12
    [ G, G, E, G, G, P, G, G, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, G, G ], // 13 fence property boundary
    [ G, G, G, G, G, P, G, G, E, I, V, I, V, I, E, P, I, V, I, V, I, V, E, G, G, G, G, G ], // 14  vineyard row
    [ G, W, G, G, G, P, G, G, E, I, G, I, I, I, I, I, I, I, G, I, I, I, E, G, G, G, G, G ], // 15 irrigation puddle + weeds
    [ G, G, G, G, G, P, G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, G, G ], // 16  vineyard row
    [ G, G, G, I, G, P, G, G, E, I, I, I, I, G, I, I, I, I, I, G, I, I, E, G, G, G, G, G ], // 17 weeds in dirt
    [ G, G, G, G, G, P, G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, G, G ], // 18
    [ G, G, G, G, G, P, G, G, G, I, G, G, G, G, G, G, G, G, G, G, G, I, G, G, G, G, G, G ], // 19 dirt edge
    [ G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 20
    [ T, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T ], // 21 reduced borders
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 5, y: 7 },
    npcs: [
      { id: 'ch4_boss', x: 14, y: 5, sprite: 'npc_farmer' },
      { id: 'ch4_coworker', x: 3, y: 8, sprite: 'npc_jose' },
      { id: 'ch4_eliseo', x: 20, y: 7, sprite: 'npc_generic' },
    ],
  },
  triggers: [
    { x: 6,  y: 4,  action: 'dialogue', target: 'ch4_computer' },
    { x: 8,  y: 21, action: 'scene', target: 'TransitionScene', data: { text: 'Two months later...', subtext: 'JP is building.', nextScene: 'ComeUpScene' } },
  ],
  interactables: [
    { id: 'ch4_tractor', x: 13, y: 5, type: 'examine', glow: true },
    { id: 'ch4_vines', x: 18, y: 8, type: 'examine', glow: true },
    { id: 'ch4_phone', x: 6, y: 8, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch4_ai_discovery', x: 5, y: 4, type: 'evolve', glow: true, sprite: 'item-tablet' },
    { id: 'ch4_sunrise', x: 24, y: 1, type: 'examine', glow: true },
    { id: 'ch4_lunch', x: 2, y: 7, type: 'examine', glow: true, sprite: 'item-food' },
    { id: 'ch4_paycheck', x: 24, y: 11, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch4_d8_seat', x: 15, y: 5, type: 'examine', glow: true },
    { id: 'ch4_crash', x: 17, y: 5, type: 'examine', glow: true },
    { id: 'ch4_vineyard_row', x: 13, y: 7, type: 'examine', glow: true },
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
    [ G, G, T, G, G, G, G, G, G, T, G, G, G, G, G, G, G, T, G, G, G, G, G, G, T, G, G, G ], // 0  open feel — trees + grass
    [ G, G, G, G, B, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 1
    [ G, G, G, G, B, J, J, J, M, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 2  HARDWOOD office floor
    [ G, G, G, G, B, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 3
    [ G, G, G, G, B, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 4
    [ G, G, G, G, B, B, B, O, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 5
    [ G, G, T, G, G, I, G, P, G, G, G, G, T, G, G, I, G, G, G, G, G, T, G, G, G, G, G, G ], // 6  trees + worn dirt along path
    [ G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 7
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 8
    [ G, G, G, I, G, G, G, P, G, G, T, G, G, G, G, G, G, G, G, I, G, G, G, G, T, G, G, G ], // 9  dirt patches
    [ G, G, B, B, B, B, G, P, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, G, G, G, G, G ], // 10
    [ G, G, B, F, F, B, G, P, G, G, T, G, G, G, G, G, G, B, F, F, F, F, B, G, G, T, G, G ], // 11
    [ G, G, B, F, F, B, G, P, G, G, G, G, G, G, G, G, G, B, F, F, F, F, B, G, G, G, G, G ], // 12
    [ G, G, B, B, O, B, G, P, G, G, G, G, G, G, G, G, G, B, B, B, O, B, B, G, G, G, G, G ], // 13
    [ G, G, I, G, P, G, G, P, G, G, G, I, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G ], // 14 worn dirt near paths
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 15
    [ G, G, G, G, G, G, G, P, G, G, T, G, G, G, G, T, G, G, G, G, G, G, G, G, G, T, G, G ], // 16 trees
    [ G, G, B, B, B, B, B, P, G, E, B, B, B, B, G, G, G, E, B, B, B, B, B, B, G, G, G, G ], // 17  print shop + DHL (E = signposts)
    [ G, G, B, F, N, F, B, P, G, B, F, M, F, B, G, G, G, B, D, D, D, D, D, B, G, G, G, G ], // 18  N=counter in print shop, M=press, D=dark warehouse
    [ G, G, B, F, F, F, B, P, G, B, F, F, F, B, G, P, G, B, D, D, M, D, D, B, G, G, G, G ], // 19  M=shipping terminal
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
      { id: 'ch5_ghost',        x: 13, y: 18, sprite: 'npc_generic' },
      { id: 'ch5_rejected',     x: 15, y: 8,  sprite: 'npc_generic' },
      { id: 'ch5_wct',          x: 15, y: 10, sprite: 'npc_client' },
      { id: 'ch5_vacaville',    x: 8,  y: 8,  sprite: 'npc_generic' },
      { id: 'ch5_manza',        x: 22, y: 8,  sprite: 'npc_manza' },
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
    { id: 'ch5_doubt', x: 5, y: 4, type: 'examine', glow: true, sprite: 'item-phone' },
  ],
};

// ---------------------------------------------------------------------------
// 6. OPERATOR MAP — LA + Vegas + Home  (40 wide x 35 tall)
// ---------------------------------------------------------------------------
// Biggest map in the game. Three zones connected by paths:
// TOP (0-12): LA — City/Office zone with Pomaikai office, buildings
// MIDDLE (13-20): Transition road connecting LA to the south zones
// BOTTOM-LEFT (21-34): Vegas — Casino/hotel, conference room, suits
// BOTTOM-RIGHT (21-34): Home — Grass, family house, Caymus callback
// JP starts in LA, walks south to Vegas, then east to come home.
// Exit trigger at home — full circle.
// ---------------------------------------------------------------------------
export const operatorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [ T, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, T ], // 0  LA — top edge
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G ], // 1
    [ G, C, C, B, B, B, B, B, B, B, B, C, C, T, C, C, C, C, C, B, B, B, B, B, B, B, B, C, C, C, B, B, B, B, B, B, C, C, C, G ], // 2  offices + Pomaikai
    [ G, C, C, B, J, J, J, J, J, J, B, C, C, C, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, F, F, M, F, B, C, C, C, G ], // 3  HARDWOOD in LA offices
    [ G, C, C, B, J, J, J, J, J, J, B, C, C, C, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, F, F, F, F, B, C, C, C, G ], // 4
    [ G, C, C, B, J, J, M, J, J, J, B, C, C, C, C, C, C, C, C, B, J, J, M, J, J, J, B, C, C, C, B, F, F, F, F, B, C, C, C, G ], // 5  M=computers
    [ G, C, C, B, J, J, J, J, J, J, B, C, C, C, C, C, C, C, C, B, J, J, J, J, J, J, B, C, C, C, B, B, B, O, B, B, C, C, C, G ], // 6
    [ G, C, C, B, B, B, B, O, B, B, B, C, C, T, C, C, C, C, C, B, B, B, B, O, B, B, B, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 7  doors
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 8
    [ G, C, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, C, G ], // 9  main LA street
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 10
    [ G, C, C, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, T, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 11
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 12

    // ── DOWNTOWN (rows 13-17) — client offices + shops ──
    [ G, G, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T, G, G ], // 13
    [ G, T, C, B, B, B, B, B, C, T, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, B, B, B, B, T, C, C, C, C, C, C, C, T, G, G ], // 14 shop buildings
    [ G, G, C, B, F, F, F, B, C, C, C, C, C, C, C, C, C, C, C, P, C, C, C, C, C, B, F, F, B, C, C, C, C, C, C, C, C, G, G, G ], // 15 shop interiors
    [ G, G, T, B, B, O, B, B, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, B, B, O, B, P, P, P, P, P, P, C, T, G, G, G ], // 16 cross street + shop doors
    [ G, G, C, C, C, C, C, C, C, C, C, C, T, C, C, C, C, C, C, P, C, C, C, C, C, C, C, C, C, C, C, T, C, C, C, C, C, G, G, G ], // 17

    // ── EXIT STREET (rows 18-19) ──
    [ G, C, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, C, G ], // 18 exit street
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 19 bottom edge — exit gap at center
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 19, y: 1 },
    npcs: [
      // LA zone — offices
      { id: 'ch6_malachi',      x: 7,  y: 5,  sprite: 'npc_malachi' },
      { id: 'ch6_big_client',   x: 22, y: 5,  sprite: 'npc_suit' },
      { id: 'ch6_equal',        x: 15, y: 11, sprite: 'npc_whale' },
      { id: 'ch6_office_kult',  x: 6,  y: 4,  sprite: 'npc_tech' },
      { id: 'ch6_tony',         x: 12, y: 8,  sprite: 'npc_suit' },
      { id: 'ch6_client2',      x: 33, y: 4,  sprite: 'npc_business' },
      { id: 'ch6_dhl',           x: 28, y: 11, sprite: 'npc_dhl_client' },
      { id: 'ch6_mentor',        x: 20, y: 8,  sprite: 'npc_generic' },
      { id: 'ch6_team_member',   x: 24, y: 13, sprite: 'npc_generic' },
      { id: 'ch6_security',      x: 24, y: 8,  sprite: 'npc_security' },
      // LA zone — referrals
      { id: 'ch6_manza',         x: 30, y: 11, sprite: 'npc_manza' },
    ],
  },
  triggers: [
    // Exit south — JP heads to Vegas
    { x: 19, y: 19, action: 'scene', target: 'VegasScene' },
  ],
  interactables: [
    // LA zone
    { id: 'ch6_dashboard', x: 8, y: 5, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_portfolio', x: 19, y: 10, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_team', x: 10, y: 11, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_mirror', x: 33, y: 5, type: 'examine', glow: true },
    { id: 'ch6_pomaikai_office', x: 23, y: 3, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_slack', x: 3, y: 8, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_revenue', x: 36, y: 8, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch6_instagram', x: 16, y: 11, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch6_future', x: 30, y: 8, type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch6_equal_moment', x: 22, y: 11, type: 'examine', glow: true },
    { id: 'ch6_security', x: 5, y: 15, type: 'examine', glow: true },
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
