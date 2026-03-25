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
};

export class MapBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Build the tile map from a MapData definition.
   * Returns a Set of "x,y" strings for collision tiles, and map bounds in tile units.
   */
  buildMap(mapData: MapData): { collisions: Set<string>; bounds: { width: number; height: number } } {
    const collisions = new Set<string>();
    const collisionTileIds = new Set(mapData.collisions);

    const mapHeight = mapData.tiles.length;
    const mapWidth = mapData.tiles[0]?.length || 0;

    let waterFrame = 0;
    const waterSprites: Phaser.GameObjects.Sprite[] = [];

    // Place tiles
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileId = mapData.tiles[y][x];
        const textureKey = TILE_TEXTURE_MAP[tileId];

        // EMPTY (0) or unmapped tiles get nothing rendered
        if (!textureKey) continue;

        const pixelX = x * SCALED_TILE + SCALED_TILE / 2;
        const pixelY = y * SCALED_TILE + SCALED_TILE / 2;

        if (tileId === TILE_IDS.WATER) {
          // Water uses a 2-frame texture (32x16), we crop to show one frame at a time
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          sprite.setDepth(0);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
          sprite.setCrop(0, 0, TILE_SIZE, TILE_SIZE);
          waterSprites.push(sprite);
        } else {
          const sprite = this.scene.add.sprite(pixelX, pixelY, textureKey);
          sprite.setScale(SCALE);
          // Trees render above the player
          sprite.setDepth(tileId === TILE_IDS.TREE || tileId === TILE_IDS.PALM ? 50 : 0);
          sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }

        // Mark collision
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
