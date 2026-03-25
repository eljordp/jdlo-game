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
};

// Detail tiles that need a ground tile rendered underneath
const OVERLAY_TILES = new Set<number>([
  TILE_IDS.TREE,
  TILE_IDS.PALM,
  TILE_IDS.FENCE,
  TILE_IDS.TRACTOR,
  TILE_IDS.COMPUTER,
  TILE_IDS.DOOR,
]);

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

  buildMap(mapData: MapData): { collisions: Set<string>; bounds: { width: number; height: number } } {
    const collisions = new Set<string>();
    const collisionTileIds = new Set(mapData.collisions);

    const mapHeight = mapData.tiles.length;
    const mapWidth = mapData.tiles[0]?.length || 0;

    let waterFrame = 0;
    const waterSprites: Phaser.GameObjects.Sprite[] = [];

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileId = mapData.tiles[y][x];
        const textureKey = TILE_TEXTURE_MAP[tileId];

        if (!textureKey) continue;

        const pixelX = x * SCALED_TILE + SCALED_TILE / 2;
        const pixelY = y * SCALED_TILE + SCALED_TILE / 2;

        // If this is an overlay tile, render a ground tile underneath first
        if (OVERLAY_TILES.has(tileId)) {
          const groundTexture = findNearbyGround(mapData.tiles, x, y, mapWidth, mapHeight);
          const ground = this.scene.add.sprite(pixelX, pixelY, groundTexture);
          ground.setScale(SCALE);
          ground.setDepth(0);
          ground.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }

        if (tileId === TILE_IDS.WATER) {
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          sprite.setDepth(0);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
          sprite.setCrop(0, 0, TILE_SIZE, TILE_SIZE);
          waterSprites.push(sprite);
        } else {
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          // Overlay tiles render above ground, trees/palms above player
          const depth = (tileId === TILE_IDS.TREE || tileId === TILE_IDS.PALM) ? 50
            : OVERLAY_TILES.has(tileId) ? 1 : 0;
          sprite.setDepth(depth);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }

        if (collisionTileIds.has(tileId)) {
          collisions.add(`${x},${y}`);
        }
      }
    }

    // Animate water tiles
    if (waterSprites.length > 0) {
      this.scene.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
          waterFrame = (waterFrame + 1) % 2;
          for (const sprite of waterSprites) {
            sprite.setCrop(waterFrame * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
          }
        },
      });
    }

    return {
      collisions,
      bounds: { width: mapWidth, height: mapHeight },
    };
  }
}
