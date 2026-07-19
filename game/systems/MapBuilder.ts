import { SCALED_TILE, TILE_SIZE, SCALE, TILE_IDS } from '../config';
import type { MapData } from '../data/maps';

// Mapping from tile ID to texture key
const TILE_TEXTURE_MAP: Record<number, string> = {
  [TILE_IDS.GRASS]: 'tile-grass',
  [TILE_IDS.SAND]: 'tile-sand',
  [TILE_IDS.WATER]: 'tile-water',
  [TILE_IDS.PATH]: 'tile-path',
  [TILE_IDS.WALL]: 'tile-wall',
  [TILE_IDS.FLOOR]: 'tile-floor',
  [TILE_IDS.DARK_FLOOR]: 'tile-dark-floor',
  [TILE_IDS.DIRT]: 'tile-dirt',
  [TILE_IDS.CONCRETE]: 'tile-concrete',
  [TILE_IDS.DOOR]: 'tile-door',
  [TILE_IDS.TREE]: 'tile-tree',
  [TILE_IDS.PALM]: 'tile-palm',
  [TILE_IDS.FENCE]: 'tile-fence',
  [TILE_IDS.COMPUTER]: 'tile-computer',
  [TILE_IDS.TRACTOR]: 'tile-tractor',
  [TILE_IDS.BUILDING_WALL]: 'tile-building-wall',
  [TILE_IDS.HOT_TUB]: 'tile-hottub',
  [TILE_IDS.VINE]: 'tile-vine',
  [TILE_IDS.HOUSE_WALL]: 'tile-house-wall',
  [TILE_IDS.HARDWOOD]: 'tile-hardwood',
  [TILE_IDS.COUNTER]: 'tile-counter',
  [TILE_IDS.JAIL_BAR]: 'tile-jail-bar',
  [TILE_IDS.CARPET]: 'tile-carpet',
};

// Detail tiles that need a ground tile rendered underneath
const OVERLAY_TILES = new Set<number>([
  TILE_IDS.TREE,
  TILE_IDS.PALM,
  TILE_IDS.FENCE,
  TILE_IDS.TRACTOR,
  TILE_IDS.COMPUTER,
  TILE_IDS.DOOR,
  TILE_IDS.VINE,
  TILE_IDS.JAIL_BAR,
]);

// Repeating one 32px texture across a large room makes every surface look like
// a spreadsheet. These deterministic variations keep the pixel-art language
// while breaking the obvious tile stamp without introducing blurry filtering.
const MATERIAL_TINTS: Partial<Record<number, number[]>> = {
  [TILE_IDS.GRASS]: [0xffffff, 0xf7fff4, 0xf1f9ee, 0xfbfff8],
  [TILE_IDS.SAND]: [0xffffff, 0xfffbf2, 0xf7f0e4, 0xfff7e8],
  [TILE_IDS.PATH]: [0xffffff, 0xf8f3ed, 0xf2ebe3],
  [TILE_IDS.FLOOR]: [0xffffff, 0xfbf8f2, 0xf4eee5],
  [TILE_IDS.DARK_FLOOR]: [0xffffff, 0xf3f1f6, 0xeceaf0],
  [TILE_IDS.DIRT]: [0xffffff, 0xf7f0e8, 0xeee5dc],
  [TILE_IDS.CONCRETE]: [0xffffff, 0xf5f5f7, 0xeeeeef, 0xf8f6f4],
  [TILE_IDS.HARDWOOD]: [0xffffff, 0xfbf6ed, 0xf3eadc, 0xfff9ef],
  [TILE_IDS.CARPET]: [0xffffff, 0xfaf6ef, 0xf2ece3, 0xfffbf5],
};

const FREE_FLIP_TILES = new Set<number>([
  TILE_IDS.GRASS,
  TILE_IDS.SAND,
  TILE_IDS.DIRT,
  TILE_IDS.CONCRETE,
  TILE_IDS.DARK_FLOOR,
  TILE_IDS.CARPET,
]);

const HORIZONTAL_FLIP_TILES = new Set<number>([
  TILE_IDS.FLOOR,
  TILE_IDS.HARDWOOD,
  TILE_IDS.PATH,
]);

const ARCHITECTURE_TILES = new Set<number>([
  TILE_IDS.WALL,
  TILE_IDS.HOUSE_WALL,
  TILE_IDS.BUILDING_WALL,
  TILE_IDS.COUNTER,
]);

const FLOOR_MATERIALS = new Set<number>([
  TILE_IDS.GRASS,
  TILE_IDS.SAND,
  TILE_IDS.PATH,
  TILE_IDS.FLOOR,
  TILE_IDS.DARK_FLOOR,
  TILE_IDS.DIRT,
  TILE_IDS.CONCRETE,
  TILE_IDS.HARDWOOD,
  TILE_IDS.CARPET,
]);

function tileHash(x: number, y: number, tileId: number): number {
  let value = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263) ^ Math.imul(tileId + 7, 69069);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

function applyMaterialVariation(sprite: Phaser.GameObjects.Sprite, tileId: number, x: number, y: number): void {
  const hash = tileHash(x, y, tileId);
  const tints = MATERIAL_TINTS[tileId];
  if (tints?.length) sprite.setTint(tints[hash % tints.length]);

  if (FREE_FLIP_TILES.has(tileId)) {
    sprite.setFlip(Boolean(hash & 1), Boolean(hash & 2));
  } else if (HORIZONTAL_FLIP_TILES.has(tileId)) {
    sprite.setFlipX(Boolean(hash & 1));
  }
}

// What ground tile to put under each overlay, based on nearby tiles
function findNearbyGround(tiles: number[][], x: number, y: number, width: number, height: number): string {
  // Check adjacent tiles for a ground type
  const neighbors = [
    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    [x - 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1],
  ];
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nTile = tiles[ny][nx];
      if (!OVERLAY_TILES.has(nTile) && nTile !== TILE_IDS.WATER && nTile !== 0) {
        const tex = TILE_TEXTURE_MAP[nTile];
        if (tex) return tex;
      }
    }
  }
  return 'tile-grass'; // fallback
}

export class MapBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  buildMap(mapData: MapData): { collisions: Set<string>; bounds: { width: number; height: number }; tilesByRow: Map<number, Phaser.GameObjects.Sprite[]> } {
    const collisions = new Set<string>();
    const collisionTileIds = new Set(mapData.collisions);
    const tilesByRow = new Map<number, Phaser.GameObjects.Sprite[]>();

    const mapHeight = mapData.tiles.length;
    const mapWidth = mapData.tiles[0]?.length || 0;

    let waterFrame = 0;
    const waterSprites: Phaser.GameObjects.Sprite[] = [];

    for (let y = 0; y < mapHeight; y++) {
      if (!tilesByRow.has(y)) tilesByRow.set(y, []);
      const rowSprites = tilesByRow.get(y)!;

      for (let x = 0; x < mapWidth; x++) {
        const tileId = mapData.tiles[y][x];
        const textureKey = TILE_TEXTURE_MAP[tileId];

        if (!textureKey) {
          // Render EMPTY tiles as solid black to prevent bleed-through
          if (tileId === 0) {
            const black = this.scene.add.rectangle(
              x * SCALED_TILE + SCALED_TILE / 2,
              y * SCALED_TILE + SCALED_TILE / 2,
              SCALED_TILE, SCALED_TILE, 0x000000
            ).setDepth(0);
            rowSprites.push(black as unknown as Phaser.GameObjects.Sprite);
          }
          continue;
        }

        const pixelX = x * SCALED_TILE + SCALED_TILE / 2;
        const pixelY = y * SCALED_TILE + SCALED_TILE / 2;

        // If this is an overlay tile, render a ground tile underneath first
        if (OVERLAY_TILES.has(tileId)) {
          const groundTexture = findNearbyGround(mapData.tiles, x, y, mapWidth, mapHeight);
          const ground = this.scene.add.sprite(pixelX, pixelY, groundTexture);
          ground.setScale(SCALE);
          ground.setDepth(0);
          ground.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
          rowSprites.push(ground);
        }

        if (tileId === TILE_IDS.WATER) {
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          sprite.setDepth(0);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
          waterSprites.push(sprite);
          rowSprites.push(sprite);
        } else {
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          const depth = (tileId === TILE_IDS.TREE || tileId === TILE_IDS.PALM) ? 50
            : OVERLAY_TILES.has(tileId) ? 1 : 0;
          sprite.setDepth(depth);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
          applyMaterialVariation(sprite, tileId, x, y);
          rowSprites.push(sprite);
        }

        // Contact shadows make walls, counters, and buildings sit on the map
        // instead of reading as another flat colored square.
        if (FLOOR_MATERIALS.has(tileId)) {
          const above = y > 0 ? mapData.tiles[y - 1][x] : TILE_IDS.EMPTY;
          const left = x > 0 ? mapData.tiles[y][x - 1] : TILE_IDS.EMPTY;
          if (ARCHITECTURE_TILES.has(above)) {
            const shadow = this.scene.add.rectangle(pixelX, pixelY - SCALED_TILE / 2 + 4, SCALED_TILE, 8, 0x000000, 0.16)
              .setDepth(0.25);
            rowSprites.push(shadow as unknown as Phaser.GameObjects.Sprite);
          }
          if (ARCHITECTURE_TILES.has(left)) {
            const shadow = this.scene.add.rectangle(pixelX - SCALED_TILE / 2 + 3, pixelY, 6, SCALED_TILE, 0x000000, 0.10)
              .setDepth(0.25);
            rowSprites.push(shadow as unknown as Phaser.GameObjects.Sprite);
          }
        }

        if (collisionTileIds.has(tileId)) {
          collisions.add(`${x},${y}`);
        }
      }
    }

    // Animate water tiles — gentle alpha pulse to simulate waves
    if (waterSprites.length > 0) {
      let wavePhase = 0;
      this.scene.time.addEvent({
        delay: 80,
        loop: true,
        callback: () => {
          wavePhase += 0.05;
          for (let i = 0; i < waterSprites.length; i++) {
            const offset = i * 0.3;
            const alpha = 0.85 + 0.15 * Math.sin(wavePhase + offset);
            waterSprites[i].setAlpha(alpha);
          }
        },
      });
    }

    return {
      collisions,
      bounds: { width: mapWidth, height: mapHeight },
      tilesByRow,
    };
  }
}
