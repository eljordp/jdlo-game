import { TILES, type MapData } from './maps';

const WIDTH = 38;
const HEIGHT = 22;

const tiles: number[][] = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, () => TILES.GRASS),
);

const fill = (left: number, top: number, right: number, bottom: number, tile: number) => {
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) tiles[y][x] = tile;
  }
};

const building = (left: number, right: number, doorX: number, floor: number = TILES.HARDWOOD) => {
  fill(left, 0, right, 0, TILES.BUILDING_WALL);
  fill(left, 1, right, 4, floor);
  fill(left, 5, right, 5, TILES.BUILDING_WALL);
  tiles[5][doorX] = TILES.DOOR;
  tiles[0][doorX] = TILES.BUILDING_WALL;
};

// State Street storefronts. Each room is compact enough to read at the game's
// camera scale; the doors open onto one continuous sidewalk.
building(1, 10, 6, TILES.FLOOR);       // Lilly's
building(12, 21, 17, TILES.HARDWOOD); // small shops
building(23, 36, 29, TILES.CARPET);   // clothing / record windows

// Sidewalk, street and the waterfront walk.
fill(0, 6, WIDTH - 1, 7, TILES.PATH);
fill(0, 8, WIDTH - 1, 10, TILES.CONCRETE);
fill(0, 11, WIDTH - 1, 12, TILES.PATH);
fill(0, 13, WIDTH - 1, 17, TILES.SAND);
fill(0, 18, WIDTH - 1, HEIGHT - 1, TILES.WATER);

// Oku sits on the sand at the waterline. The patio faces the Pacific.
fill(25, 13, 35, 13, TILES.BUILDING_WALL);
fill(25, 14, 35, 16, TILES.HARDWOOD);
fill(25, 17, 35, 17, TILES.BUILDING_WALL);
tiles[17][30] = TILES.DOOR;

// A small trailhead at the east edge hints at Hot Springs without turning the
// restaurant district into a hiking level.
for (let y = 11; y <= 16; y++) tiles[y][37] = TILES.PATH;
tiles[12][35] = TILES.FENCE;
tiles[12][36] = TILES.DOOR;
tiles[13][35] = TILES.TREE;
tiles[15][36] = TILES.TREE;

// Palms frame the coast while leaving a wide, obvious route from the car to
// every destination.
for (const [x, y] of [[2, 7], [10, 7], [24, 7], [34, 7], [4, 12], [14, 12], [23, 12]] as const) {
  tiles[y][x] = TILES.PALM;
}

export const stateStreetMap: MapData = {
  tiles,
  collisions: [
    TILES.WATER,
    TILES.WALL,
    TILES.TREE,
    TILES.PALM,
    TILES.FENCE,
    TILES.BUILDING_WALL,
    TILES.HOUSE_WALL,
    TILES.COUNTER,
  ],
  spawns: {
    player: { x: 18, y: 11 },
    npcs: [
      { id: 'sb_k', x: 20, y: 11, sprite: 'npc_k' },
      { id: 'sb_busker', x: 12, y: 6, sprite: 'npc_david' },
      { id: 'sb_local', x: 27, y: 7, sprite: 'npc_female' },
      { id: 'sb_diner', x: 33, y: 15, sprite: 'npc_bikini2' },
    ],
  },
  triggers: [],
  interactables: [
    { id: 'sb_lillys', x: 6, y: 4, type: 'examine', glow: true },
    { id: 'sb_oku', x: 30, y: 16, type: 'examine', glow: true },
    { id: 'sb_bmw', x: 18, y: 9, type: 'examine', glow: true },
    { id: 'sb_shop_window', x: 17, y: 4, type: 'examine', glow: false },
    { id: 'sb_record_window', x: 29, y: 4, type: 'examine', glow: false },
    { id: 'sb_waterfront', x: 16, y: 17, type: 'examine', glow: false },
    { id: 'sb_trailhead', x: 36, y: 12, type: 'examine', glow: false },
  ],
};
