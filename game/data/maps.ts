// ---------------------------------------------------------------------------
// Tile Map Data — Pokemon Platinum-style maps for each chapter
// Each tile is 16x16 px. Maps range from 15x12 (jail cell) to 40x40 (wrong crowd).
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
  CARPET: 23,
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
const A = TILES.CARPET;

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
// 0. HOME MAP — Suburban House + Yard  (40 wide x 44 tall)
// ---------------------------------------------------------------------------
// JP's childhood home before everything changes. Proper suburban house with
// JP's room (6x5 interior), sister's room, parents' room, living room,
// open-concept kitchen, bathroom. Big yard with fence, pond, BBQ area,
// driveway. Street at bottom exits to BeachScene.
// ---------------------------------------------------------------------------
export const homeMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    // === ROWS 0-9: SECOND FLOOR (upstairs — JP's room, sister's room, bathroom, hallway) ===
    [ _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _ ], // 0  empty (camera buffer)
    [ _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _ ], // 1  empty (camera buffer)
    [ _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _ ], // 2  empty (camera buffer)
    [ _, _, _, _, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, _, _, _, _, _ ], // 3  upstairs top wall
    [ _, _, _, _, K, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, K, A, A, A, A, A, A, K, F, F, F, F, K, _, _, _, _, _ ], // 4  JP room | upstairs lounge | sister room | bath
    [ _, _, _, _, K, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, K, A, A, A, A, A, A, K, F, F, F, F, K, _, _, _, _, _ ], // 5
    [ _, _, _, _, K, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, K, A, A, A, A, A, A, K, F, F, F, F, K, _, _, _, _, _ ], // 6
    [ _, _, _, _, K, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, K, A, A, A, A, A, A, K, F, F, F, F, K, _, _, _, _, _ ], // 7
    [ _, _, _, _, K, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, K, A, A, A, A, A, A, K, F, F, F, F, K, _, _, _, _, _ ], // 8
    [ _, _, _, _, K, K, K, K, O, K, K, K, K, K, K, K, O, K, K, K, O, K, K, K, K, K, O, K, K, K, K, O, K, K, K, _, _, _, _, _ ], // 9  single doors centered in each room
    [ _, _, _, _, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, _, _, _, _, _ ], // 10 upstairs hallway
    [ _, _, _, _, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, _, _, _, _, _ ], // 11 upstairs floor
    [ G, G, G, K, A, A, A, A, A, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 12 parents master (left) | open living extension (right)
    [ G, G, G, K, A, A, A, A, A, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 13
    [ G, G, G, K, A, A, A, A, A, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 14
    [ G, G, G, K, A, A, A, A, A, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 15
    [ G, G, G, K, A, A, A, A, A, A, A, A, A, A, A, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 16
    [ G, G, G, K, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, G, G, G ], // 17 parents door + wall
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 18 hallway (hardwood)
    [ G, G, G, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, O, K, K, K, G, G, G ], // 19 door to living area + bathroom door (col 33)
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, J, J, J, N, N, N, N, J, J, J, J, J, J, J, K, G, G, G ], // 20 living + kitchen island + dining table
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, K, G, G, G ], // 21
    [ G, G, G, K, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, N, N, N, N, J, K, G, G, G ], // 22 marble wall counters (kitchen right side)
    [ G, G, G, K, K, K, K, K, K, K, K, K, K, O, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, O, K, K, K, K, K, K, G, G, G ], // 23 front door + side door to yard

    // === FRONT YARD — big, open, things to do ===
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G ], // 24 walkway from front door + side path
    [ G, G, G, G, G, G, G, L, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G ], // 25 palm + paths
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, B, B, B, B, B, B, B, B, G ], // 26 garage top wall (bigger, 8 wide)
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, B, C, C, C, C, C, C, B, G ], // 27 garage interior — tools, workbench
    [ G, G, G, G, T, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, B, C, C, C, C, C, C, B, G ], // 28 garage interior — cars
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, B, C, C, C, C, C, C, B, G ], // 29 garage interior
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, B, B, B, B, O, B, B, B, G ], // 30 garage door (south facing)
    [ G, G, G, G, G, G, G, G, G, L, G, G, G, C, G, G, C, C, C, C, C, C, C, C, G, G, G, G, G, G, C, C, C, C, C, C, C, C, C, G ], // 31 basketball court top + driveway to garage
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, C, C, C, C, C, C, C, C, G, G, W, W, W, G, C, C, C, C, C, C, C, C, C, G ], // 32 court + pond
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, C, C, C, C, C, C, C, C, G, G, W, W, W, G, G, G, G, G, G, L, G, G, G, G ], // 33 court + pond + palm
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, C, C, C, C, C, C, C, C, G, G, G, W, G, G, G, G, G, G, G, G, G, G, G, G ], // 34 court bottom + pond edge
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 35 open grass
    [ G, G, G, G, G, G, L, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G ], // 36 palms + tree
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, F, F, F, F, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 37 patio seating area
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, F, F, F, F, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 38 patio
    [ E, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, E ], // 39 curb
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 40 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 41 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 42 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 43 road
  ],
  collisions: [...STANDARD_COLLISIONS],
  spawns: {
    player: { x: 7, y: 6 },  // JP wakes up in his room UPSTAIRS
    npcs: [
      { id: 'ch0_pops',    x: 8,  y: 21, sprite: 'npc_pops' },
      { id: 'ch0_mom',     x: 26, y: 21, sprite: 'npc_female' },
      { id: 'ch0_sister',  x: 25, y: 5,  sprite: 'npc_sister' },  // sister upstairs in her room
      { id: 'ch0_frenchie', x: 10, y: 31, sprite: 'npc_frenchie' },
    ],
  },
  triggers: [
    { x: 11, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 12, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 13, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 14, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 15, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 16, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 17, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
    { x: 18, y: 43, action: 'scene', target: 'TransitionScene', data: { text: 'Three weeks later...', nextScene: 'BeachScene' } },
  ],
  interactables: [
    // JP's Room — UPSTAIRS (cols 5-10, rows 4-8)
    // JP's Room — UPSTAIRS (cols 5-10, rows 4-8)
    { id: 'ch0_bed',           x: 5,  y: 4,  type: 'examine', glow: false, sprite: 'item-bed' },        // bed against back wall
    // ch0_papers removed — discovered when interacting with nightstand/crypto (hidden item)
    { id: 'ch0_computer',      x: 10, y: 5,  type: 'examine', glow: true, sprite: 'item-desk' },        // MacBook right wall
    { id: 'ch0_college',       x: 10, y: 6,  type: 'examine', glow: true, sprite: 'item-letter' },      // letters on desk
    { id: 'ch0_poster',        x: 6,  y: 3,  type: 'examine', glow: false, sprite: 'item-poster' },     // poster on wall (wall row)
    // ch0_hidden_stash removed — discovered when interacting with desk (hidden item, no visible sprite)
    { id: 'ch0_journal',       x: 8,  y: 8,  type: 'examine', glow: true, sprite: 'item-book' },        // journal near door
    { id: 'ch0_crypto',        x: 8,  y: 4,  type: 'examine', glow: false, sprite: 'item-phone' },      // phone on nightstand
    // Upstairs Lounge (cols 12-21, rows 4-8)
    { id: 'ch0_family_albums', x: 13, y: 4,  type: 'examine', glow: true, sprite: 'item-book' },       // photo albums on shelf (wall)
    { id: 'ch0_lounge_rug',    x: 16, y: 7,  type: 'examine', glow: false, sprite: 'item-rug' },
    // Sister's Room — UPSTAIRS (cols 23-28, rows 4-8)
    { id: 'ch0_sister_bed',    x: 24, y: 4,  type: 'examine', glow: false, sprite: 'item-bed-pink' },   // bed
    { id: 'ch0_sister_posters', x: 27, y: 6,  type: 'examine', glow: false, sprite: 'item-photo' },      // mood board / art prints
    { id: 'ch0_sister_mirror', x: 23, y: 4,  type: 'examine', glow: false, sprite: 'item-mirror' },     // mirror on wall
    { id: 'ch0_sister_nightlight', x: 28, y: 8, type: 'examine', glow: false, sprite: 'item-lamp' },    // LED lamp near door
    { id: 'ch0_shoe_rack',     x: 28, y: 5,  type: 'examine', glow: false, sprite: 'item-shoe-rack' },   // shoe rack against wall
    { id: 'ch0_makeup_stand',  x: 23, y: 6,  type: 'examine', glow: false, sprite: 'item-makeup-stand' }, // vanity / makeup stand
    { id: 'ch0_led_lights',    x: 25, y: 3,  type: 'examine', glow: false, sprite: 'item-led-strip' },  // LED strip on back wall
    // Parents' Room — DOWNSTAIRS (rows 12-16, they keep the master)
    { id: 'ch0_parents_bed',   x: 5,  y: 12, type: 'examine', glow: false, sprite: 'item-bed' },
    { id: 'ch0_family_photo',  x: 8,  y: 12, type: 'examine', glow: true, sprite: 'item-photo' },
    { id: 'ch0_parents_tv',    x: 12, y: 15, type: 'examine', glow: false, sprite: 'item-tv' },
    { id: 'ch0_parents_bookshelf', x: 10, y: 12, type: 'examine', glow: false, sprite: 'item-bookshelf' },
    { id: 'ch0_parents_closet', x: 13, y: 12, type: 'examine', glow: false, sprite: 'item-closet' },
    { id: 'ch0_parents_dresser', x: 6, y: 15, type: 'examine', glow: false, sprite: 'item-nightstand' },
    { id: 'ch0_parents_desk',   x: 12, y: 13, type: 'examine', glow: false, sprite: 'item-desk' },       // small desk in parents' room
    { id: 'ch0_parents_safe',   x: 14, y: 15, type: 'examine', glow: true, sprite: 'item-storage-box' },
    // Downstairs living extension (cols 16-36, rows 12-16) — den / family room
    { id: 'ch0_den_couch',     x: 20, y: 14, type: 'examine', glow: false, sprite: 'item-couch' },     // big couch
    { id: 'ch0_den_tv',        x: 18, y: 12, type: 'examine', glow: false, sprite: 'item-tv' },        // TV on wall
    { id: 'ch0_den_rug',       x: 22, y: 14, type: 'examine', glow: false, sprite: 'item-rug' },       // area rug
    { id: 'ch0_den_lamp',      x: 24, y: 12, type: 'examine', glow: false, sprite: 'item-lamp' },      // floor lamp
    { id: 'ch0_den_plant',     x: 30, y: 12, type: 'examine', glow: false, sprite: 'item-plant' },     // potted plant
    { id: 'ch0_den_shelf',     x: 28, y: 12, type: 'examine', glow: false, sprite: 'item-bookshelf' }, // bookshelf
    { id: 'ch0_den_table',     x: 34, y: 14, type: 'examine', glow: false, sprite: 'item-nightstand' },// side table (nightstand works for this)
    // Upstairs Lounge / Hang Spot (cols 12-21, merged lounge)
    { id: 'ch0_upstairs_tv',   x: 15, y: 4,  type: 'examine', glow: false, sprite: 'item-tv' },        // TV on wall
    { id: 'ch0_upstairs_couch',x: 16, y: 6,  type: 'examine', glow: false, sprite: 'item-couch' },     // couch
    { id: 'ch0_yoga_mat',      x: 19, y: 8,  type: 'examine', glow: false, sprite: 'item-yoga-mat' },   // yoga mat under weights
    { id: 'ch0_weights',       x: 19, y: 7,  type: 'examine', glow: false, sprite: 'item-weights' },    // dumbbells on mat
    // Sister art — UPSTAIRS
    { id: 'ch0_sister_drawing_wall', x: 26, y: 4, type: 'examine', glow: false, sprite: 'item-poster' },  // art print on wall, away from bed
    // Kitchen (rows 20-22)
    { id: 'ch0_kitchen_knife',  x: 32, y: 22, type: 'examine', glow: false, sprite: 'item-knife' },     // knife block
    { id: 'ch0_cookie_jar',    x: 34, y: 22, type: 'examine', glow: false, sprite: 'item-food' },
    // Bathroom — UPSTAIRS (cols 29-33, rows 4-8)
    { id: 'ch0_mirror',        x: 30, y: 4,  type: 'examine', glow: true, sprite: 'item-mirror' },
    { id: 'ch0_shower',        x: 32, y: 6,  type: 'examine', glow: true, sprite: 'item-shower' },  // clearly inside bathroom
    // Hallway (row 18)
    { id: 'ch0_hallway_photo', x: 20, y: 18, type: 'examine', glow: false, sprite: 'item-photo' },      // decoration
    // Living Room (left side, row 20-22)
    { id: 'ch0_tv',            x: 4,  y: 20, type: 'examine', glow: false, sprite: 'item-tv' },         // TV against wall (row 20)
    { id: 'ch0_couch',         x: 6,  y: 21, type: 'examine', glow: false, sprite: 'item-couch' },      // furniture
    { id: 'ch0_window_view',   x: 3,  y: 21, type: 'examine', glow: false, sprite: 'item-window' },     // window on side wall
    { id: 'ch0_living_plant',  x: 10, y: 20, type: 'examine', glow: false, sprite: 'item-plant' },      // potted plant in living room
    { id: 'ch0_living_rug',    x: 8,  y: 21, type: 'examine', glow: false, sprite: 'item-rug' },        // rug under living area
    // Kitchen (right side, row 20-22)
    { id: 'ch0_fridge',        x: 35, y: 20, type: 'examine', glow: false, sprite: 'item-fridge' },     // appliance
    { id: 'ch0_food',          x: 33, y: 20, type: 'examine', glow: false, sprite: 'item-food' },       // scenery
    { id: 'ch0_mail',          x: 28, y: 22, type: 'examine', glow: true, sprite: 'item-letter' },      // story — college letters
    // Garage (cols 32-36, rows 27-28)
    { id: 'ch0_pops_truck',    x: 34, y: 28, type: 'examine', glow: false, sprite: 'item-truck' },      // Pops' F-150 in garage
    { id: 'ch0_jp_car',        x: 33, y: 31, type: 'examine', glow: false, sprite: 'item-car' },        // JP's BMW in driveway (not garage)
    { id: 'ch0_garage_tools',  x: 32, y: 27, type: 'examine', glow: false, sprite: 'item-desk' },       // tools on workbench wall
    { id: 'ch0_workbench',     x: 34, y: 27, type: 'examine', glow: false, sprite: 'item-desk' },        // Pops' workbench
    { id: 'ch0_record_player', x: 37, y: 27, type: 'examine', glow: true, sprite: 'item-record' },      // record player in garage corner
    // Yard
    { id: 'ch0_bbq',           x: 5,  y: 25, type: 'examine', glow: false, sprite: 'item-bbq' },       // BBQ near house
    { id: 'ch0_basketball',    x: 20, y: 32, type: 'examine', glow: true, sprite: 'item-ball' },         // basketball half-court
    { id: 'ch0_frenchie_ball', x: 8,  y: 35, type: 'examine', glow: true, sprite: 'item-ball' },        // fetch in open grass
    { id: 'ch0_fishing',       x: 27, y: 32, type: 'examine', glow: true, sprite: 'item-fishing' },      // fishing rod at pond
    { id: 'ch0_goodbye',       x: 13, y: 38, type: 'examine', glow: true, sprite: 'item-photo' },        // goodbye near curb
    { id: 'ch0_patio',         x: 19, y: 37, type: 'examine', glow: false, sprite: 'item-couch' },       // patio chairs

    // Surprise elements
    { id: 'ch0_rooftop',       x: 33, y: 4,  type: 'examine', glow: true, sprite: 'item-photo' },        // easter egg — bathroom window
    // Stairs
    // Stairs are auto-trigger (step on tile = swap floor). Visual only:
    { id: 'ch0_stairs_visual_up',   x: 20, y: 18, type: 'examine', glow: false, sprite: 'item-stairs' },  // visual stairs (downstairs, against wall)
    { id: 'ch0_stairs_visual_down', x: 20, y: 4,  type: 'examine', glow: false, sprite: 'item-stairs' },  // visual stairs (upstairs lounge, against back wall)
    // ch0_shoebox removed — discovered when interacting with bed (hidden under bed, Pokemon style)
    // tv_sitdown removed — Pops already has fishing moment

    // Windows — on wall tiles, no floating sprite
    { id: 'ch0_window_jp',     x: 9,  y: 3,  type: 'examine', glow: false, sprite: 'item-window' },
    { id: 'ch0_window_sister', x: 13, y: 3,  type: 'examine', glow: false, sprite: 'item-window' },
    { id: 'ch0_window_parents',x: 22, y: 11, type: 'examine', glow: false, sprite: 'item-window' },
    { id: 'ch0_window_bath',   x: 34, y: 3,  type: 'examine', glow: false, sprite: 'item-window' },
    // kitchen window removed — no back wall exit anymore
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
    // === FRAT HOUSE — living rm + JP rm + kitchen + NOLAN'S MASTER down the hall + hot tub ===
    [ B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G ], // 0  house top wall (wider — cols 0-34)
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, G, G, G, G ], // 1  living rm (1-11) | JP rm (13-22) | kitchen (24-33)
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, C, C, C, G ], // 2
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, C, H, C, G ], // 3  hot tub
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, N, N, F, F, F, B, G, C, H, C, G ], // 4  kitchen counter
    [ B, F, F, F, F, F, F, F, F, F, F, F, O, F, F, F, F, F, F, F, F, F, F, O, F, F, F, F, F, F, F, F, F, F, O, G, C, H, C, G ], // 5  doors between rooms (12, 23, 34)
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, C, C, C, G ], // 6
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, G, G, G, G ], // 7
    [ B, F, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, F, F, F, F, F, F, F, F, F, F, B, G, G, G, G, G ], // 8
    [ B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, B, B, O, B, B, B, B, B, G, G, G, G, G ], // 9  bottom wall, doors at 6, 18, 29
    // === HALLWAY + NOLAN'S MASTER BEDROOM (rows 10-16) ===
    [ G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G ], // 10 walks from doors
    [ G, G, G, G, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G ], // 11 hallway to Nolan's + his room top wall
    [ G, G, L, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, L, G ], // 12 Nolan's room (hardwood, 11 wide) — THE room
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G ], // 13
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G ], // 14
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G ], // 15
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, B, B, B, B, B, O, B, B, B, B, B, B, G, G, G, G, G, G ], // 16 Nolan's door (col 27)
    // === YARD (rows 17-19) — beer pong, smoke spot, space for the party ===
    [ G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G ], // 17 walks
    [ G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G ], // 18 yard
    [ G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G ], // 19 yard
    // === STREET (rows 20-21) ===
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 20 street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 21 street
    [ G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G ], // 22 trees
    [ G, G, G, G, G, L, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, L, G, G, G, G, G, G ], // 23 palms
    // === BEACH (compact — 5 rows + shore + ocean) ===
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 24 sand
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, L, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 25 palm + volleyball
    [ S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S ], // 26 bonfire
    [ S, S, S, S, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, S, S, S, S ], // 27 shore
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 28 ocean
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 29 ocean
    [ W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W ], // 30 ocean
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 18, y: 17 },
    npcs: [
      // Living room
      { id: 'ch1_homie2',       x: 5,  y: 4,  sprite: 'npc_david' },
      { id: 'ch1_cooper',       x: 9,  y: 7,  sprite: 'npc_cooper' },
      { id: 'ch1_girl_couch',   x: 4,  y: 6,  sprite: 'npc_bikini2' },
      // JP's room
      { id: 'ch1_gf_k',         x: 15, y: 2,  sprite: 'npc_k' },
      // Kitchen
      { id: 'ch1_bigbart',      x: 28, y: 4,  sprite: 'npc_bigbart' },
      { id: 'ch1_homie1',       x: 25, y: 14, sprite: 'npc_nolan' },     // Nolan near his room
      // Hot tub patio
      { id: 'ch1_girl1',        x: 37, y: 4,  sprite: 'npc_bikini1' },
      { id: 'ch1_girl2',        x: 38, y: 5,  sprite: 'npc_bikini2' },
      { id: 'ch1_girl3',        x: 37, y: 5,  sprite: 'npc_bikini1' },
      // Yard
      { id: 'ch1_terrell',      x: 34, y: 17, sprite: 'npc_terrell' },
      // Beach
      { id: 'ch1_volleyball1',  x: 16, y: 25, sprite: 'npc_surfer' },
      { id: 'ch1_volleyball2',  x: 18, y: 25, sprite: 'npc_kid' },
      { id: 'ch1_sunbather',    x: 28, y: 26, sprite: 'npc_bikini1' },
    ],
  },
  triggers: [
    { x: 15, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 16, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 17, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 18, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 19, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 20, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 21, y: 27, action: 'scene', target: 'WrongCrowdScene' },
    { x: 22, y: 27, action: 'scene', target: 'WrongCrowdScene' },
  ],
  interactables: [
    // --- Living Room (cols 1-11, rows 1-8) ---
    { id: 'ch1_couch',      x: 4,  y: 3,  type: 'examine', glow: false, sprite: 'item-couch' },
    { id: 'ch1_tv',         x: 1,  y: 5,  type: 'examine', glow: false, sprite: 'item-tv' },
    { id: 'ch1_mess',       x: 3,  y: 8,  type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch1_bottles',    x: 8,  y: 2,  type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch1_speaker',    x: 11, y: 1,  type: 'examine', glow: false, sprite: 'item-speaker' },
    { id: 'ch1_weed1',      x: 7,  y: 3,  type: 'examine', glow: true, sprite: 'item-weed-bag' },

    // --- JP's Room (cols 13-22, rows 1-8) ---
    { id: 'ch1_bed',        x: 14, y: 2,  type: 'examine', glow: false, sprite: 'item-bed-k' },
    { id: 'ch1_setup',      x: 16, y: 2,  type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch1_computer',   x: 21, y: 3,  type: 'examine', glow: false, sprite: 'item-desk' },
    { id: 'ch1_weed2',      x: 19, y: 6,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_closet',     x: 22, y: 1,  type: 'examine', glow: false, sprite: 'item-nightstand' },
    { id: 'ch1_poster',     x: 18, y: 1,  type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch1_clothes',    x: 20, y: 8,  type: 'examine', glow: false, sprite: 'item-laundry-basket' },

    // --- Kitchen (cols 24-33, rows 1-8) ---
    { id: 'ch1_fridge',     x: 24, y: 1,  type: 'examine', glow: false, sprite: 'item-fridge' },
    { id: 'ch1_counter',    x: 27, y: 2,  type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch1_bong',       x: 26, y: 1,  type: 'examine', glow: true, sprite: 'item-bong' },
    { id: 'ch1_food',       x: 31, y: 3,  type: 'examine', glow: false, sprite: 'item-food' },
    { id: 'ch1_weed3',      x: 25, y: 6,  type: 'examine', glow: true, sprite: 'item-weed-bag' },
    { id: 'ch1_blunt',      x: 30, y: 7,  type: 'examine', glow: true, sprite: 'item-joint' },

    // --- Hot Tub Patio (outside, cols 36-38, rows 3-5) ---
    { id: 'ch1_hottub',     x: 37, y: 4,  type: 'examine', glow: false, sprite: 'item-hottub' },
    { id: 'ch1_shower',     x: 23, y: 15, type: 'examine', glow: true, sprite: 'item-shower' },

    // --- NOLAN'S MASTER BEDROOM (cols 22-32, rows 12-15) — THE room ---
    { id: 'ch1_nolan_bed',   x: 23, y: 12, type: 'examine', glow: false, sprite: 'item-bed' },         // king size bed
    { id: 'ch1_nolan_tv',    x: 32, y: 12, type: 'examine', glow: false, sprite: 'item-tv' },          // big TV on wall
    { id: 'ch1_nolan_setup', x: 30, y: 14, type: 'examine', glow: false, sprite: 'item-desk' },        // gaming setup
    { id: 'ch1_nolan_speaker', x: 25, y: 12, type: 'examine', glow: false, sprite: 'item-speaker' },   // big speaker
    { id: 'ch1_nolan_poster', x: 27, y: 12, type: 'examine', glow: false, sprite: 'item-poster' },     // poster on wall
    { id: 'ch1_nolan_weed',  x: 28, y: 15, type: 'examine', glow: true, sprite: 'item-weed-bag' },     // weed on nightstand
    { id: 'ch1_surfboard',   x: 32, y: 15, type: 'examine', glow: false, sprite: 'item-surfboard' },   // surfboard leaning

    // --- Yard (rows 17-19) ---
    { id: 'ch1_smoke',      x: 10, y: 18, type: 'examine', glow: true, sprite: 'item-joint' },
    { id: 'ch1_beerpong',   x: 34, y: 18, type: 'examine', glow: true, sprite: 'item-desk' },

    // --- Beach (rows 24-26) ---
    { id: 'ch1_view',       x: 20, y: 26, type: 'examine', glow: false, sprite: 'item-photo' },
    { id: 'ch1_volleyball1', x: 17, y: 25, type: 'examine', glow: true, sprite: 'item-ball' },
    { id: 'ch1_towels',     x: 8,  y: 24, type: 'examine', glow: false, sprite: 'item-rug' },
    { id: 'ch1_cooler',     x: 10, y: 24, type: 'examine', glow: false, sprite: 'item-storage-box' },
    { id: 'ch1_bonfire',    x: 30, y: 26, type: 'examine', glow: false, sprite: 'item-bonfire' },
    { id: 'ch1_surfboards', x: 5,  y: 24, type: 'examine', glow: false, sprite: 'item-surfboard' },
    { id: 'ch1_sunset',     x: 36, y: 25, type: 'examine', glow: false, sprite: 'item-photo' },
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

    // === ROWS 21-28: EXPANSION — longer walk with residential street, alley/park ===
    [ C, C, C, C, C, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C ], // 21 sidewalk with grass patches
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 22 residential road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 23 residential road
    [ C, C, C, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T, C, C, C, C, C, C, C, T, C, C, C, C, C, C, C, T, C, C, C, C, C ], // 24 sidewalk with trees
    [ E, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, E, G, G, G, G, E ], // 25 alley/park — fence sides, grass
    [ E, G, G, G, G, G, G, G, G, G, I, I, I, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, E, I, I, G, G, E ], // 26 dirt path, bench area (F)
    [ E, G, G, G, G, G, F, F, G, G, I, G, I, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, E, E, I, G, G, G, E ], // 27 bench, tree, dirt path
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 28 back to concrete sidewalk

    // === ROWS 29-31: SECOND STREET ===
    [ G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 29 sidewalk
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 30 road
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 31 road

    // === ROWS 32-39: BUYER'S HOUSE ===
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 32 sidewalk
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G ], // 33 buyer house top wall
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, B, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 34 driveway
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, D, D, D, O, D, D, D, D, B, G, G, G, G, G, G, G ], // 35 door between rooms
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, B, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 36 back room
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, O, D, D, D, B, D, D, D, D, B, G, G, G, G, G, G, G ], // 37 front door
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G ], // 38 buyer house bottom wall
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 39 bottom
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 17, y: 3 },  // JP starts in his room in the frat house
    npcs: [
      { id: 'ch2_homie_door', x: 19, y: 10, sprite: 'npc_jose' },    // Jose waiting in front yard
      { id: 'ch2_corner_guy', x: 8,  y: 18, sprite: 'npc_generic' }, // guy inside convenience store
      { id: 'ch2_street_kid', x: 15, y: 30, sprite: 'npc_shady' },   // kid on the second street
      { id: 'ch2_lookout',    x: 21, y: 34, sprite: 'npc_shady' },   // outside buyer's house driveway
      { id: 'ch2_buyer',      x: 29, y: 36, sprite: 'npc_dealer' },  // inside buyer's house back room
      { id: 'ch2_drunk_guy',  x: 5,  y: 23, sprite: 'npc_generic' }, // drunk on the residential street
      { id: 'ch2_girl_walking', x: 30, y: 22, sprite: 'npc_female' }, // girl walking alone at 3am
      { id: 'ch2_shadow_figure', x: 35, y: 25, sprite: 'npc_shady' }, // someone watching from the alley
    ],
  },
  triggers: [],  // No scene triggers — only way out is through ch2_sale raid
  interactables: [
    // --- JP's Room (cols 15-20, rows 1-6) ---
    // Bed with weed PILED on both sides — overflowing from under the bed
    { id: 'ch2_bed',       x: 15, y: 1, type: 'examine', glow: false, sprite: 'item-bed' },      // furniture
    { id: 'ch2_bed_pile_L', x: 15, y: 2, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // pile LEFT of bed (stacked)
    { id: 'ch2_bed_pile_L2', x: 15, y: 2, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // second bag same tile (visual stack)
    { id: 'ch2_bed_pile_L3', x: 15, y: 3, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // spilling onto floor
    { id: 'ch2_bed_pile_R', x: 16, y: 2, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // pile RIGHT of bed
    { id: 'ch2_bed_pile_R2', x: 16, y: 2, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // stacked on same tile
    { id: 'ch2_bed_under',  x: 15, y: 1, type: 'examine', glow: false, sprite: 'item-weed-bag' }, // bag poking out from UNDER the bed
    { id: 'ch2_grab_weed', x: 19, y: 3, type: 'examine', glow: true, sprite: 'item-weed-bag' },  // main grab bag on desk
    { id: 'ch2_closet',    x: 20, y: 1, type: 'examine', glow: false, sprite: 'item-bookshelf' },   // CLOSET — bags fall out
    { id: 'ch2_gun',       x: 16, y: 1, type: 'examine', glow: true, sprite: 'item-gun' },       // gun
    { id: 'ch2_computer',  x: 19, y: 1, type: 'examine', glow: false, sprite: 'item-desk' },        // computer/desk
    { id: 'ch2_phone',     x: 16, y: 3, type: 'examine', glow: true, sprite: 'item-phone' },     // phone
    { id: 'ch2_money_stack', x: 20, y: 3, type: 'examine', glow: true, sprite: 'item-money' },   // money
    { id: 'ch2_pops_missed', x: 17, y: 5, type: 'examine', glow: true, sprite: 'item-phone' },   // missed call from pops

    // --- House common areas ---
    { id: 'ch2_light1',    x: 10, y: 3, type: 'examine', glow: false, sprite: 'item-lamp' },       // light switch
    { id: 'ch2_light2',    x: 24, y: 3, type: 'examine', glow: false, sprite: 'item-lamp' },       // light switch
    { id: 'ch2_fridge',    x: 26, y: 1, type: 'examine', glow: false, sprite: 'item-fridge' },    // appliance
    { id: 'ch2_hottub_night', x: 31, y: 4, type: 'examine', glow: false, sprite: 'item-hottub' },    // hot tub at night
    { id: 'ch2_front_door', x: 18, y: 8, type: 'examine', glow: false },                            // front door — visible from map tile

    // --- Street & driving ---
    { id: 'ch2_car',       x: 18, y: 13, type: 'examine', glow: true, sprite: 'item-keys' },     // BMW parked on street
    { id: 'ch2_streetlight', x: 25, y: 16, type: 'examine', glow: false, sprite: 'item-streetlight' }, // streetlight
    { id: 'ch2_street_walk', x: 14, y: 14, type: 'examine', glow: false },                          // HIDDEN — JP's thoughts while walking dark street
    { id: 'ch2_nervous',   x: 12, y: 30, type: 'examine', glow: false },                            // HIDDEN — internal monologue, nervous feeling

    // --- Convenience store area ---
    { id: 'ch2_graffiti',  x: 4,  y: 17, type: 'examine', glow: false, sprite: 'item-poster' },     // graffiti — visible on wall
    { id: 'ch2_store',     x: 7,  y: 18, type: 'examine', glow: false, sprite: 'item-convenience' },  // convenience store shelves

    // --- Atmospheric triggers (no sprites — discovered by pressing Space) ---
    { id: 'ch2_residential', x: 15, y: 24, type: 'examine', glow: false },                          // HIDDEN — looking at houses where normal people sleep
    { id: 'ch2_flashback_spot', x: 10, y: 26, type: 'examine', glow: false },                       // HIDDEN — where Jose and JP used to hang
    { id: 'ch2_alley',      x: 35, y: 26, type: 'examine', glow: false },                           // HIDDEN — dark alley, JP's thoughts

    // --- Buyer's house area ---
    { id: 'ch2_parking_lot', x: 20, y: 35, type: 'examine', glow: false, sprite: 'item-car' },      // car in driveway
    { id: 'ch2_sale',      x: 25, y: 37, type: 'examine', glow: true, sprite: 'item-weed-bag' }, // THE TRIGGER — sale spot inside buyer's house
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
    { id: 'ch3_wall_1',  x: 2, y: 7,  type: 'scratch', glow: false, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_2',  x: 2, y: 8,  type: 'scratch', glow: false, sprite: 'item-scratch' },   // JP's cell wall
    { id: 'ch3_wall_3',  x: 15, y: 14, type: 'scratch', glow: false, sprite: 'item-scratch' },  // near guard station
    { id: 'ch3_wall_4',  x: 6, y: 13, type: 'scratch', glow: false, sprite: 'item-scratch' },   // hallway wall

    // --- JP's cell items ---
    { id: 'ch3_bed',         x: 3, y: 6,   type: 'examine', glow: true, sprite: 'item-bed' },      // BACK of JP's cell
    { id: 'ch3_toilet',      x: 2, y: 6,   type: 'examine', glow: false, sprite: 'item-toilet' },  // furniture
    { id: 'ch3_book',        x: 5, y: 8,   type: 'examine', glow: true, sprite: 'item-book' },     // JP's cell
    { id: 'ch3_letter_home', x: 4, y: 6,   type: 'examine', glow: true, sprite: 'item-letter' },   // JP's cell

    // --- Hallway / common ---
    { id: 'ch3_phone',       x: 10, y: 13, type: 'examine', glow: true, sprite: 'item-phone' },    // hallway phone
    { id: 'ch3_window',      x: 14, y: 16, type: 'examine', glow: false, sprite: 'item-window' },   // jail window
    { id: 'ch3_transformation', x: 13, y: 16, type: 'examine', glow: false, sprite: 'item-mirror' },  // hallway mirror

    // --- Common area ---
    { id: 'ch3_commissary',  x: 28, y: 4,  type: 'examine', glow: false, sprite: 'item-food' },      // commissary counter
    { id: 'ch3_fight_watch', x: 23, y: 3,  type: 'examine', glow: true, sprite: 'item-weights' },   // watching fight
    { id: 'ch3_dice_watch',  x: 34, y: 8,  type: 'examine', glow: true, sprite: 'item-dice' },     // watching dice
    { id: 'ch3_anger_management', x: 24, y: 8, type: 'examine', glow: false, sprite: 'item-poster' }, // wall poster — scenery

    // --- Yard ---
    { id: 'ch3_pushups',     x: 12, y: 19, type: 'examine', glow: true, sprite: 'item-weights' },  // yard
    { id: 'ch3_yard',        x: 18, y: 23, type: 'examine', glow: false, sprite: 'item-ball' },     // scenery
    { id: 'ch3_birthday',    x: 30, y: 23, type: 'examine', glow: false, sprite: 'item-food' },      // yard, open area
    { id: 'ch3_faith',       x: 7, y: 22,  type: 'examine', glow: true, sprite: 'item-book' },      // quiet corner of yard

    // --- Study corner / weight rack ---
    { id: 'ch3_tablet',      x: 34, y: 24, type: 'examine', glow: false, sprite: 'item-tablet' },   // weight rack area
    { id: 'ch3_music',       x: 34, y: 25, type: 'examine', glow: false, sprite: 'item-headphones' }, // near weights
    { id: 'ch3_psych_course', x: 35, y: 24, type: 'examine', glow: true, sprite: 'item-book' },    // near study corner

    // --- Mirrors (different locations) ---
    { id: 'ch3_mirror_day2', x: 12, y: 13, type: 'examine', glow: false, sprite: 'item-mirror' },    // hallway mirror
    { id: 'ch3_mirror_day3', x: 33, y: 24, type: 'examine', glow: false, sprite: 'item-mirror' },    // weight area mirror
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

    // --- WORK AREA + PATH connecting farmhouse to vineyards (rows 9-10) ---
    [ G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G ], // 9  main horizontal path
    [ G, G, I, I, G, G, G, P, G, G, I, G, G, G, G, G, I, G, G, G, P, G, G, G, I, I, G, G, G, G, I, G, G, G, G, I, G, G, G, G ], // 10 dirt patches — crates, barrels, work gear scattered

    // --- VINEYARD BLOCK 1 (rows 11-17): left side, big ---
    [ G, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G, G, P, G, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G, G ], // 11 fence top (2 vineyard blocks)
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 12 vineyard row
    [ G, G, E, I, I, I, I, G, I, I, I, G, I, I, I, I, E, G, G, G, P, G, E, I, I, G, I, I, I, G, I, I, I, G, I, I, I, E, G, G ], // 13 weeds in dirt
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 14 vineyard row
    [ G, G, E, I, I, G, I, I, I, G, I, I, I, G, I, I, E, G, G, G, P, G, E, I, I, I, I, G, I, I, I, I, G, I, I, I, I, E, G, G ], // 15 weeds
    [ G, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, E, G, G, G, P, G, E, I, V, I, V, I, V, I, V, I, V, I, V, I, V, E, G, G ], // 16 vineyard row
    [ G, G, E, I, P, I, P, I, P, I, P, I, P, I, P, I, E, G, G, G, P, G, E, I, P, I, P, I, P, I, P, I, P, I, P, I, P, E, G, G ], // 17 tractor tracks through vineyard
    [ G, G, E, E, E, E, E, E, E, P, E, E, E, E, E, E, E, G, G, G, P, G, E, E, E, E, E, P, E, E, E, E, E, E, E, E, E, E, G, G ], // 18 fence bottom (gaps for paths)

    // --- VINEYARD ROW 2 bottom + work area (rows 19-22) ---
    [ G, G, I, G, G, G, G, G, G, P, G, G, I, G, G, G, G, G, I, G, P, G, G, G, I, G, G, P, G, G, G, G, G, I, G, G, G, G, G, G ], // 19 dirt patches, grape crate spots
    [ G, G, G, I, G, G, G, G, G, P, G, G, G, G, G, W, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, I, W, G, G, G, G, G, G, G ], // 20 irrigation puddles + dirt
    [ G, G, G, G, G, I, G, G, G, P, G, G, G, I, G, G, G, G, G, G, P, G, G, I, G, G, G, P, G, G, G, G, G, G, I, G, G, G, G, G ], // 21 scattered work patches
    [ G, G, G, G, G, T, G, G, G, P, G, G, G, G, G, G, I, G, G, G, P, G, G, G, G, G, G, P, G, G, T, G, G, G, G, I, G, G, G, G ], // 22 shade trees + dirt

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
    { x: 20, y: 35, action: 'scene', target: 'TransitionScene', data: { text: 'Two months later...', subtext: 'JP is building.', nextScene: 'ComeUpScene' } },
  ],
  interactables: [
    { id: 'ch4_tractor', x: 13, y: 9, type: 'examine', glow: true, sprite: 'item-car' },
    { id: 'ch4_vines', x: 25, y: 14, type: 'examine', glow: false, sprite: 'item-plant' },
    { id: 'ch4_phone', x: 8, y: 9, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch4_ai_discovery', x: 6, y: 5, type: 'evolve', glow: true, sprite: 'item-tablet' },
    { id: 'ch4_sunrise', x: 35, y: 2, type: 'examine', glow: false, sprite: 'item-photo' },
    { id: 'ch4_lunch', x: 3, y: 9, type: 'examine', glow: true, sprite: 'item-food' },
    { id: 'ch4_paycheck', x: 30, y: 19, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch4_d8_seat', x: 20, y: 6, type: 'examine', glow: false, sprite: 'item-car' },
    { id: 'ch4_crash', x: 14, y: 17, type: 'examine', glow: false, sprite: 'item-car' },
    { id: 'ch4_vineyard_row', x: 10, y: 14, type: 'examine', glow: false, sprite: 'item-plant' },
    { id: 'ch4_farmhouse',    x: 5,  y: 3,  type: 'examine', glow: false, sprite: 'item-nightstand' },
    { id: 'ch4_radio',        x: 3,  y: 4,  type: 'examine', glow: false, sprite: 'item-phone' },
    { id: 'ch4_water_cooler', x: 8,  y: 5,  type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch4_tools',        x: 7,  y: 3,  type: 'examine', glow: false, sprite: 'item-weights' },
    { id: 'ch4_truck',        x: 12, y: 3,  type: 'examine', glow: false, sprite: 'item-car' },
    { id: 'ch4_grape_row1',   x: 20, y: 12, type: 'examine', glow: false, sprite: 'item-plant' },
    { id: 'ch4_grape_row2',   x: 25, y: 16, type: 'examine', glow: false, sprite: 'item-plant' },
    { id: 'ch4_shade_tree',   x: 15, y: 8,  type: 'examine', glow: false, sprite: 'item-plant' },
    { id: 'ch4_snake',        x: 30, y: 14, type: 'examine', glow: true, sprite: 'item-ball' },
    { id: 'ch4_break_spot',   x: 18, y: 6,  type: 'examine', glow: false, sprite: 'item-bbq' },
    { id: 'ch4_dust',         x: 35, y: 10, type: 'examine', glow: false, sprite: 'item-photo' },
    { id: 'ch4_hat',          x: 10, y: 7,  type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch4_spanish_radio', x: 22, y: 4, type: 'examine', glow: false, sprite: 'item-phone' },
    // Work area between farmhouse and vineyards
    { id: 'ch4_grape_crate1', x: 3,  y: 10, type: 'examine', glow: false, sprite: 'item-storage-box' },
    { id: 'ch4_grape_crate2', x: 24, y: 10, type: 'examine', glow: false, sprite: 'item-storage-box' },
    { id: 'ch4_water_barrel', x: 10, y: 10, type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch4_wheelbarrow',  x: 35, y: 10, type: 'examine', glow: false, sprite: 'item-car' },
    { id: 'ch4_hose',         x: 16, y: 10, type: 'examine', glow: false, sprite: 'item-plant' },
    // Between vineyard blocks
    { id: 'ch4_grape_bucket', x: 3,  y: 19, type: 'examine', glow: false, sprite: 'item-storage-box' },
    { id: 'ch4_pruning',      x: 13, y: 19, type: 'examine', glow: false, sprite: 'item-weights' },
    { id: 'ch4_water_jug',    x: 24, y: 19, type: 'examine', glow: false, sprite: 'item-bottle' },
    { id: 'ch4_crate_stack',  x: 33, y: 19, type: 'examine', glow: false, sprite: 'item-storage-box' },
    { id: 'ch4_shade_bench',  x: 6,  y: 22, type: 'examine', glow: false, sprite: 'item-couch' },
    { id: 'ch4_irrigation',   x: 32, y: 20, type: 'examine', glow: false, sprite: 'item-bottle' },
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
    // --- JP'S HOME OFFICE AREA (rows 0-8): bigger office (18 wide, 16 interior, 5 rows deep) ---
    [ G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G ], // 0  trees + grass
    [ G, G, G, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 1  office walls (18 wide)
    [ G, G, G, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 2  HARDWOOD floor (16 interior)
    [ G, G, G, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 3
    [ G, G, G, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 4
    [ G, G, G, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 5
    [ G, G, G, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 6
    [ G, G, G, B, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, B, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 7  office door
    [ G, G, T, G, G, I, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 8  yard + driveway

    // --- STREET (rows 9-10) ---
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 9  street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 10 street

    // --- CLIENT DISTRICT 1 (rows 11-19): 3 BIGGER buildings (8-10 wide, 4 interior rows) ---
    [ G, G, G, I, G, G, G, G, G, G, C, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 11 yard
    [ G, B, B, B, B, B, B, B, B, G, C, G, G, B, B, B, B, B, B, B, B, B, B, G, G, B, B, B, B, B, B, B, B, B, B, B, G, G, G, G ], // 12 3 client buildings (wider)
    [ G, B, F, F, F, F, F, F, B, G, C, G, G, B, F, F, F, F, F, F, F, F, B, G, G, B, F, F, F, N, N, F, F, F, F, B, G, G, G, G ], // 13 interior row 1
    [ G, B, F, F, N, F, F, F, B, G, C, G, G, B, F, F, F, F, F, F, F, F, B, G, G, B, F, F, F, F, F, F, F, F, F, B, G, G, G, G ], // 14 interior row 2
    [ G, B, F, F, F, F, F, F, B, G, C, G, G, B, F, F, F, F, F, F, F, F, B, G, G, B, F, F, N, N, F, F, N, N, F, B, G, G, G, G ], // 15 interior row 3
    [ G, B, F, F, F, F, F, F, B, G, C, G, G, B, F, F, F, F, F, F, F, F, B, G, G, B, F, F, F, F, F, F, F, F, F, B, G, G, G, G ], // 16 interior row 4
    [ G, B, B, B, B, O, B, B, B, G, C, G, G, B, B, B, B, B, O, B, B, B, B, G, G, B, B, B, B, B, O, B, B, B, B, B, G, G, G, G ], // 17 doors
    [ G, I, G, G, G, C, G, G, G, G, C, G, G, I, G, G, G, G, C, G, G, G, G, G, G, I, G, G, G, G, C, G, G, G, G, G, G, G, G, G ], // 18 walkways
    [ G, G, G, G, G, C, G, G, G, G, C, G, G, G, G, G, G, G, C, G, G, G, T, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G ], // 19 yard

    // --- SECOND STREET (rows 20-21) ---
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 20 street
    [ C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C ], // 21

    // --- CLIENT DISTRICT 2 (rows 22-29): WCT store (8 wide) + DHL warehouse (12 wide), 4 interior rows ---
    [ G, G, G, G, G, G, G, G, C, G, B, B, B, B, B, B, B, B, B, G, G, G, G, G, B, B, B, B, B, B, B, B, B, B, B, B, B, G, G, G ], // 22 WCT + DHL roofline
    [ G, G, G, G, G, G, G, G, C, G, B, F, F, F, F, F, F, F, B, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, D, B, G, G, G ], // 23
    [ G, G, G, G, G, G, G, G, C, G, B, F, F, F, F, F, F, F, B, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, D, B, G, G, G ], // 24
    [ G, G, G, G, G, G, G, G, C, G, B, F, F, F, F, F, F, F, B, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, D, B, G, G, G ], // 25
    [ G, G, G, G, G, G, G, G, C, G, B, F, F, F, F, F, F, F, B, G, G, G, G, G, B, D, D, D, D, D, D, D, D, D, D, D, B, G, G, G ], // 26
    [ G, G, G, G, G, G, G, G, C, G, B, B, B, B, B, O, B, B, B, G, G, G, G, G, B, B, B, B, B, B, O, B, B, B, B, B, B, G, G, G ], // 27 doors
    [ G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G ], // 28 walks
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 29 bottom street

    // --- PARK / EXIT AREA (rows 30-35): bigger park ---
    [ G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G ], // 30 park entrance
    [ G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G ], // 31
    [ G, G, G, G, G, G, G, G, B, C, C, B, G, G, G, W, W, G, G, G, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 32 bench + pond
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, W, W, G, G, G, C, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 33 pond + pathway
    [ G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 34 walk to exit
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, G ], // 35 exit
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 10, y: 4 },
    npcs: [
      { id: 'ch5_first_client', x: 5,  y: 18, sprite: 'npc_client' },
      { id: 'ch5_sticker',      x: 30, y: 18, sprite: 'npc_sticker_smith' },
      { id: 'ch5_ghost',        x: 15, y: 28, sprite: 'npc_generic' },
      { id: 'ch5_rejected',     x: 20, y: 10, sprite: 'npc_generic' },
      { id: 'ch5_wct',          x: 15, y: 21, sprite: 'npc_client' },
      { id: 'ch5_vacaville',    x: 10, y: 10, sprite: 'npc_generic' },
      { id: 'ch5_manza',        x: 30, y: 10, sprite: 'npc_manza' },
    ],
  },
  triggers: [
    { x: 38, y: 35, action: 'scene', target: 'LAScene' },
  ],
  interactables: [
    // Showcases near client building doors
    { id: 'ch5_wct_showcase', x: 5, y: 17, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_sticker_showcase', x: 30, y: 18, type: 'showcase', glow: true, sprite: 'item-money' },
    { id: 'ch5_dhl_showcase', x: 30, y: 28, type: 'showcase', glow: true, sprite: 'item-tablet' },
    // JP's office — NOW SPREAD OUT in bigger 16-wide, 5-row space
    { id: 'ch5_first_dollar', x: 5,  y: 3,  type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_first_site',   x: 10, y: 2,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_late_night',    x: 15, y: 4,  type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch5_github',        x: 18, y: 3,  type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch5_3am',           x: 8,  y: 5,  type: 'examine', glow: false, sprite: 'item-phone' },
    { id: 'ch5_pricing',       x: 13, y: 2,  type: 'examine', glow: false, sprite: 'item-money' },
    { id: 'ch5_stack',         x: 7,  y: 2,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_doubt',         x: 16, y: 6,  type: 'examine', glow: false, sprite: 'item-book' },
    { id: 'ch5_fiverr',        x: 19, y: 5,  type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch5_cold_email',    x: 12, y: 6,  type: 'examine', glow: true, sprite: 'item-letter' },
    { id: 'ch5_portfolio',     x: 9,  y: 3,  type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch5_coffee',        x: 5,  y: 5,  type: 'examine', glow: false, sprite: 'item-food' },
    { id: 'ch5_whiteboard',    x: 8,  y: 1,  type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch5_invoice',       x: 17, y: 2,  type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch5_youtube',       x: 14, y: 5,  type: 'examine', glow: false, sprite: 'item-tv' },
    { id: 'ch5_ramen',         x: 4,  y: 4,  type: 'examine', glow: false, sprite: 'item-food' },
    { id: 'ch5_bank_app',      x: 11, y: 4,  type: 'examine', glow: true, sprite: 'item-phone' },
    // Street + client district items
    { id: 'ch5_review',        x: 35, y: 13, type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch5_sticker_wall',  x: 28, y: 14, type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch5_print_shop',    x: 5,  y: 20, type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch5_dhl_building',  x: 30, y: 29, type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch5_rejection',     x: 20, y: 17, type: 'examine', glow: true, sprite: 'item-phone' },
    { id: 'ch5_testimonial',   x: 32, y: 15, type: 'examine', glow: true, sprite: 'item-letter' },
  ],
};

// ---------------------------------------------------------------------------
// 6. OPERATOR MAP — LA Offices + Downtown  (40 wide x 55 tall)
// ---------------------------------------------------------------------------
// Pomaikai office (bigger, hardwood, conference room), other office buildings,
// concrete streets, downtown shops/plaza, gym, coffee shop, highrise lobby,
// JP's apartment block, C8 Corvette, food truck, mural wall.
// Exit to VegasScene at bottom.
// ---------------------------------------------------------------------------
export const operatorMap: MapData = {
  tiles: [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

    // --- BOULEVARD ENTRANCE (rows 0-1) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 0  wide boulevard
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 1

    // --- OFFICE DISTRICT (rows 2-9): Pomaikai HQ (16 wide) + Office 2 (10 wide) + Office 3 (6 wide) ---
    [ G, C, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, C, G ], // 2  rooflines
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, B, F, F, F, F, B, C, G ], // 3  Pomaikai interior (14 wide)
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, B, F, F, F, F, B, C, G ], // 4
    [ G, C, B, J, J, J, J, J, J, N, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, B, F, F, F, F, B, C, G ], // 5  N = conference room divider
    [ G, C, B, J, J, J, J, J, J, N, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, B, F, F, F, F, B, C, G ], // 6
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, B, B, B, O, B, B, C, G ], // 7  Office 3 door
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, B, C, C, C, C, C, C, C, C, C, G ], // 8
    [ G, C, B, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, O, B, B, B, B, C, C, C, C, C, C, C, C, C, G ], // 9  Pomaikai door + Office 2 door

    // --- SIDEWALK + MAIN STREET (rows 10-12) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 10 sidewalk
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 11 main LA street
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 12

    // --- DOWNTOWN (rows 13-18): shops + fountain plaza ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 13 sidewalk
    [ G, C, B, B, B, B, B, B, B, C, T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, B, B, B, B, B, B, B, B, B, B, C, C, C, G ], // 14 shop 1 + street tree + shop 2
    [ G, C, B, F, F, F, F, F, B, C, C, C, C, C, G, G, G, C, C, C, C, G, G, G, C, C, B, F, F, F, F, F, F, F, F, B, C, C, C, G ], // 15 interiors + plaza edges
    [ G, C, B, F, F, F, F, F, B, C, C, C, C, C, G, T, G, C, C, W, C, G, T, G, C, C, B, F, F, F, F, F, F, F, F, B, C, C, C, G ], // 16 plaza — 2 trees + fountain
    [ G, C, B, B, B, O, B, B, B, C, C, C, C, C, G, G, G, C, C, C, C, G, G, G, C, C, B, B, B, B, B, O, B, B, B, B, C, C, C, G ], // 17 shop doors + plaza bottom
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 18

    // --- SECOND STREET (rows 19-20) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 19 street
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 20 main street 2

    // --- BLOCK 2 (rows 21-27): restaurant + coworking space + luxury building ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 21 sidewalk
    [ G, C, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, B, B, C, G ], // 22 restaurant + coworking + luxury bldg
    [ G, C, B, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, B, C, G ], // 23 restaurant interior (hardwood) | coworking (14 wide) | luxury (6 wide)
    [ G, C, B, J, J, J, N, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, B, C, G ], // 24 restaurant bar counter | coworking desks | luxury
    [ G, C, B, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, B, C, G ], // 25
    [ G, C, B, B, B, B, O, B, B, B, C, C, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, B, C, C, B, B, B, B, O, B, B, B, C, G ], // 26 doors
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 27 sidewalk

    // --- THIRD STREET (rows 28-29) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 28 street
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 29 main street 3

    // --- PARKING + PARK (rows 30-33) ---
    [ G, C, C, C, B, B, B, B, C, I, T, I, C, C, C, C, C, G, G, G, G, G, G, C, C, C, C, C, I, T, I, C, B, B, B, B, C, C, C, G ], // 30 parking + landscaped trees + park start
    [ G, C, C, C, B, C, C, B, C, C, C, C, C, C, C, C, G, G, T, G, G, T, G, G, C, C, C, C, C, C, C, C, B, C, C, B, C, C, C, G ], // 31 parking lots + park with trees
    [ G, C, C, C, B, C, C, B, C, C, C, C, C, C, C, C, G, G, G, W, W, G, G, G, C, C, C, C, C, C, C, C, B, C, C, B, C, C, C, G ], // 32 parking + park pond
    [ G, G, C, C, B, B, B, B, C, C, C, C, C, C, C, C, G, G, G, G, G, G, G, G, C, C, C, C, C, C, C, C, B, B, B, B, C, C, G, G ], // 33 lot ends + park bottom

    // --- FOURTH STREET (rows 34-35) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 34 street
    [ T, C, C, C, C, C, C, T, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, T, C, C, C, C, C, C, T, C, C, C, C, C, C, C, C, T ], // 35 tree-lined boulevard

    // --- BLOCK 3 (rows 36-42): Gym + Coffee Shop + Highrise Lobby ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 36 sidewalk
    [ G, C, B, B, B, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, B, C, C, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, C, G ], // 37 rooflines: gym (10) + coffee (6) + highrise (14)
    [ G, C, B, F, F, F, F, F, F, F, F, B, C, C, B, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, G ], // 38 gym floor | coffee hardwood | highrise lobby
    [ G, C, B, F, N, F, N, F, N, F, F, B, C, C, B, J, J, N, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, G ], // 39 gym equipment (N=racks) | coffee counter | lobby interior
    [ G, C, B, F, F, F, F, F, F, F, F, B, C, C, B, J, J, J, J, J, B, C, C, B, J, J, J, J, N, N, N, J, J, J, J, J, J, B, C, G ], // 40 gym | coffee | lobby reception desk (N)
    [ G, C, B, F, N, F, N, F, F, F, F, B, C, C, B, J, J, J, J, J, B, C, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, G ], // 41 gym benches | coffee | lobby open floor
    [ G, C, B, B, B, B, B, O, B, B, B, B, C, C, B, B, B, O, B, B, B, C, C, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, C, G ], // 42 gym door | coffee door | highrise entrance
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 43 sidewalk

    // --- FIFTH STREET (rows 44-45) ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 44 street
    [ T, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, T ], // 45 fifth street

    // --- BLOCK 4 (rows 46-52): JP's World — apartment exterior, C8, food truck, mural ---
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 46 sidewalk
    [ G, C, B, B, B, B, B, B, B, B, B, B, B, B, B, B, B, C, C, C, C, C, C, B, B, B, C, C, C, B, B, B, B, B, B, B, B, B, C, G ], // 47 JP's building facade (14 wide) | gap | food truck (3x2) | mural wall (8 wide)
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, C, C, C, C, B, F, B, C, C, C, B, B, B, B, B, B, B, B, B, C, G ], // 48 building lobby interior | food truck interior | mural (solid wall = art)
    [ G, C, B, J, J, J, J, J, J, J, J, J, J, J, J, J, B, C, C, C, C, C, C, B, B, B, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 49 building interior
    [ G, C, B, J, J, J, J, N, J, J, J, N, J, J, J, J, B, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 50 lobby columns (N) | open area
    [ G, C, B, B, B, B, B, B, O, B, B, B, B, B, B, B, B, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 51 building entrance (grand door) | C8 parking area
    [ G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G ], // 52 sidewalk — C8 is at (20,51) on concrete

    // --- EXIT PARK + ROAD (rows 53-58): wider road to Vegas ---
    [ G, G, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, G, G ], // 53 sidewalk
    [ G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, G, G, T, G, G, G, G ], // 54 road with park edges + trees
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 55 road narrows (6 wide)
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 56 exit road
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 57 exit road
    [ G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, C, C, C, C, C, C, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G ], // 58 exit
  ],
  collisions: STANDARD_COLLISIONS,
  spawns: {
    player: { x: 19, y: 1 },
    npcs: [
      // Pomaikai HQ
      { id: 'ch6_malachi',      x: 7,  y: 5,  sprite: 'npc_malachi' },
      { id: 'ch6_elijah',       x: 12, y: 5,  sprite: 'npc_elijah' },
      { id: 'ch6_office_kult',  x: 5,  y: 4,  sprite: 'npc_tech' },
      // Office 2 — big client
      { id: 'ch6_big_client',   x: 24, y: 5,  sprite: 'npc_suit' },
      // Office 3
      { id: 'ch6_client2',      x: 35, y: 5,  sprite: 'npc_business' },
      // Street — security right outside Pomaikai door
      { id: 'ch6_security',     x: 9,  y: 10, sprite: 'npc_security' },
      { id: 'ch6_tony',         x: 14, y: 11, sprite: 'npc_suit' },
      { id: 'ch6_equal',        x: 20, y: 12, sprite: 'npc_whale' },
      { id: 'ch6_dhl',          x: 30, y: 12, sprite: 'npc_dhl_client' },
      { id: 'ch6_mentor',       x: 18, y: 13, sprite: 'npc_generic' },
      { id: 'ch6_team_member',  x: 5,  y: 16, sprite: 'npc_generic' },
      { id: 'ch6_manza',        x: 35, y: 12, sprite: 'npc_manza' },
      // Block 2 — restaurant + coworking
      { id: 'ch6_restaurant',   x: 6,  y: 24, sprite: 'npc_generic' },
      { id: 'ch6_coworker1',    x: 16, y: 24, sprite: 'npc_tech' },
      { id: 'ch6_coworker2',    x: 22, y: 24, sprite: 'npc_tech' },
      { id: 'ch6_luxury_npc',   x: 34, y: 24, sprite: 'npc_suit' },
      // Block 3 — gym, coffee, highrise
      { id: 'ch6_gym_bro',      x: 5,  y: 40, sprite: 'npc_generic' },
      { id: 'ch6_barista',      x: 17, y: 39, sprite: 'npc_generic' },
      { id: 'ch6_doorman',      x: 29, y: 42, sprite: 'npc_security' },
      // Block 4 — JP's world
      { id: 'ch6_food_truck',   x: 24, y: 47, sprite: 'npc_generic' },
      { id: 'ch6_valet',        x: 21, y: 51, sprite: 'npc_suit' },
      // Streets — pedestrians
      { id: 'ch6_pedestrian1',  x: 12, y: 35, sprite: 'npc_generic' },
      { id: 'ch6_pedestrian2',  x: 30, y: 44, sprite: 'npc_generic' },
    ],
  },
  triggers: [
    // Exit south — JP heads to Vegas (6-wide road at row 58)
    { x: 17, y: 58, action: 'scene', target: 'VegasScene' },
    { x: 18, y: 58, action: 'scene', target: 'VegasScene' },
    { x: 19, y: 58, action: 'scene', target: 'VegasScene' },
    { x: 20, y: 58, action: 'scene', target: 'VegasScene' },
    { x: 21, y: 58, action: 'scene', target: 'VegasScene' },
    { x: 22, y: 58, action: 'scene', target: 'VegasScene' },
  ],
  interactables: [
    // Pomaikai HQ — one tablet (dashboard), rest are invisible "!" markers
    { id: 'ch6_dashboard', x: 12, y: 4, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_pomaikai_office', x: 14, y: 6, type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch6_slack', x: 5, y: 6, type: 'examine', glow: false, sprite: 'item-phone' },
    // Street — one tablet for portfolio
    { id: 'ch6_portfolio', x: 19, y: 12, type: 'examine', glow: true, sprite: 'item-tablet' },
    { id: 'ch6_team', x: 12, y: 12, type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch6_instagram', x: 16, y: 13, type: 'examine', glow: false, sprite: 'item-phone' },
    { id: 'ch6_equal_moment', x: 22, y: 12, type: 'examine', glow: true, sprite: 'item-money' },
    // Office 3
    { id: 'ch6_mirror', x: 34, y: 5, type: 'examine', glow: false, sprite: 'item-mirror' },
    // Downtown shops
    { id: 'ch6_revenue', x: 33, y: 16, type: 'examine', glow: true, sprite: 'item-money' },
    { id: 'ch6_future', x: 30, y: 16, type: 'examine', glow: false, sprite: 'item-letter' },
    { id: 'ch6_security', x: 10, y: 10, type: 'examine', glow: false, sprite: 'item-poster' },
    // Block 2
    { id: 'ch6_steak_dinner', x: 7, y: 23, type: 'examine', glow: false, sprite: 'item-food' },
    { id: 'ch6_cowork_laptop', x: 19, y: 23, type: 'examine', glow: false, sprite: 'item-tablet' },
    { id: 'ch6_luxury_view', x: 35, y: 23, type: 'examine', glow: false, sprite: 'item-photo' },
    // Park
    { id: 'ch6_park_bench', x: 20, y: 31, type: 'examine', glow: false, sprite: 'item-book' },
    // Block 3 — Gym, Coffee, Highrise
    { id: 'ch6_gym_weights', x: 6, y: 39, type: 'examine', glow: false, sprite: 'item-weights' },
    { id: 'ch6_coffee', x: 16, y: 38, type: 'examine', glow: false, sprite: 'item-food' },
    { id: 'ch6_lobby_desk', x: 29, y: 40, type: 'examine', glow: false, sprite: 'item-tablet' },
    // Block 4 — JP's World
    { id: 'ch6_corvette', x: 19, y: 52, type: 'examine', glow: false, sprite: 'item-tablet' },  // below car — no visible sprite, real car placed by scene
    { id: 'ch6_food_truck_menu', x: 24, y: 48, type: 'examine', glow: true, sprite: 'item-food' },
    { id: 'ch6_mural', x: 33, y: 48, type: 'examine', glow: false, sprite: 'item-poster' },
    { id: 'ch6_rooftop', x: 9, y: 48, type: 'examine', glow: false, sprite: 'item-photo' },
    // --- Expansion: 16 new interactables ---
    { id: 'ch6_whiteboard',      x: 10, y: 5,  type: 'examine', glow: false, sprite: 'item-poster' },     // office whiteboard
    { id: 'ch6_client_call',     x: 15, y: 6,  type: 'examine', glow: true,  sprite: 'item-phone' },      // client on phone
    { id: 'ch6_printer',         x: 8,  y: 6,  type: 'examine', glow: false, sprite: 'item-desk' },       // office printer
    { id: 'ch6_water_cooler',    x: 13, y: 4,  type: 'examine', glow: false, sprite: 'item-bottle' },     // office water cooler
    { id: 'ch6_elevator',        x: 30, y: 42, type: 'examine', glow: false, sprite: 'item-nightstand' }, // highrise elevator
    { id: 'ch6_view_city',       x: 32, y: 44, type: 'examine', glow: true,  sprite: 'item-photo' },      // city view from JP's apartment
    { id: 'ch6_closet',          x: 10, y: 48, type: 'examine', glow: false, sprite: 'item-nightstand' }, // JP's closet
    { id: 'ch6_restaurant_menu', x: 8,  y: 23, type: 'examine', glow: false, sprite: 'item-letter' },     // restaurant menu
    { id: 'ch6_fountain',        x: 20, y: 28, type: 'examine', glow: false, sprite: 'item-plant' },      // plaza fountain
    { id: 'ch6_street_art',      x: 15, y: 32, type: 'examine', glow: false, sprite: 'item-poster' },     // street art
    { id: 'ch6_lambo',           x: 23, y: 52, type: 'examine', glow: false,  sprite: 'item-tablet' },    // below car — no visible sprite, real car placed by scene
    { id: 'ch6_valet_stand',     x: 18, y: 50, type: 'examine', glow: false, sprite: 'item-keys' },       // valet stand
    { id: 'ch6_newspaper',       x: 25, y: 30, type: 'examine', glow: false, sprite: 'item-letter' },     // LA Times on a bench
    { id: 'ch6_homeless',        x: 5,  y: 35, type: 'examine', glow: true,  sprite: 'item-food' },       // homeless person (reality check)
    { id: 'ch6_billboard',       x: 35, y: 15, type: 'examine', glow: false, sprite: 'item-poster' },     // billboard on the street
    { id: 'ch6_pops_call',       x: 12, y: 48, type: 'examine', glow: true,  sprite: 'item-phone' },      // call from Pops
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
