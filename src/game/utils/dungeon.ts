import type { Dungeon, Tile, Room, Position, Chest, Monster, Shop, RoomShape, Decoration, DecorationType, CorridorStyle, DungeonTheme, ThemeConfig } from '../../types/game';
import type { AdventureDifficulty } from '../../types/game';
import { GAME_CONFIG, DUNGEON_THEMES, ROOM_SHAPE_WEIGHTS, CORRIDOR_STYLE_WEIGHTS, getThemeForLevel } from '../../data/config';
import { randomInt, randomRange } from './math';
import { createMonster, getRandomMonsterType, createBoss, getBossForLevel } from '../../data/monsters';
import { getRandomRune } from '../../data/runes';
import { createShop, SHOP_SPAWN_CHANCE } from '../../data/shop';
import { getDifficultyConfig } from '../../data/difficulty';

let chestIdCounter = 0;
let decorationIdCounter = 0;

const createEmptyTiles = (width: number, height: number): Tile[][] => {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        type: 'wall',
        explored: false,
        visible: false,
        variant: randomInt(0, 3),
      };
    }
  }
  return tiles;
};

const selectWeighted = <T extends string>(weights: Record<T, number>): T => {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * total;
  
  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) return key;
  }
  
  return entries[0][0];
};

const selectWeightedDecoration = (weights: Partial<Record<DecorationType, number>>): DecorationType | null => {
  const entries = Object.entries(weights) as [DecorationType, number][];
  if (entries.length === 0) return null;
  
  const total = entries.reduce((sum, [, w]) => sum + (w || 0), 0);
  let random = Math.random() * total;
  
  for (const [key, weight] of entries) {
    random -= weight || 0;
    if (random <= 0) return key;
  }
  
  return entries[0][0];
};

const getRandomRoomShape = (): RoomShape => {
  return selectWeighted(ROOM_SHAPE_WEIGHTS);
};

const getRandomCorridorStyle = (): CorridorStyle => {
  return selectWeighted(CORRIDOR_STYLE_WEIGHTS);
};

const isPointInCircle = (px: number, py: number, cx: number, cy: number, radius: number): boolean => {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
};

const isPointInHexagon = (px: number, py: number, cx: number, cy: number, radius: number): boolean => {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  
  if (dy > radius * Math.sqrt(3) / 2) return false;
  if (dx > radius) return false;
  
  const hexHeight = radius * Math.sqrt(3) / 2;
  const slope = hexHeight / (radius * 0.5);
  const maxDxAtDy = radius - dy / slope;
  
  return dx <= maxDxAtDy;
};

const generateRooms = (width: number, height: number, maxRooms: number): Room[] => {
  const rooms: Room[] = [];
  const minSize = GAME_CONFIG.MIN_ROOM_SIZE;
  const maxSize = GAME_CONFIG.MAX_ROOM_SIZE;
  
  for (let i = 0; i < maxRooms * 3; i++) {
    if (rooms.length >= maxRooms) break;
    
    const shape = getRandomRoomShape();
    let roomWidth: number, roomHeight: number;
    
    if (shape === 'circle') {
      const radius = randomInt(Math.floor(minSize / 2), Math.floor(maxSize / 2));
      roomWidth = radius * 2 + 2;
      roomHeight = radius * 2 + 2;
    } else if (shape === 'hexagon') {
      const radius = randomInt(Math.floor(minSize / 2) + 1, Math.floor(maxSize / 2));
      roomWidth = radius * 2 + 2;
      roomHeight = Math.floor(radius * Math.sqrt(3)) + 2;
    } else if (shape === 'irregular') {
      roomWidth = randomInt(minSize, maxSize + 2);
      roomHeight = randomInt(minSize, maxSize + 2);
    } else {
      roomWidth = randomInt(minSize, maxSize);
      roomHeight = randomInt(minSize, maxSize);
    }
    
    const x = randomInt(1, width - roomWidth - 1);
    const y = randomInt(1, height - roomHeight - 1);
    
    const newRoom: Room = {
      x,
      y,
      width: roomWidth,
      height: roomHeight,
      centerX: Math.floor(x + roomWidth / 2),
      centerY: Math.floor(y + roomHeight / 2),
      shape,
      rotation: Math.random() < 0.5 ? 0 : 90,
    };
    
    let overlaps = false;
    for (const room of rooms) {
      if (
        x - 1 < room.x + room.width &&
        x + roomWidth + 1 > room.x &&
        y - 1 < room.y + room.height &&
        y + roomHeight + 1 > room.y
      ) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      rooms.push(newRoom);
    }
  }
  
  return rooms;
};

const carveRoom = (tiles: Tile[][], room: Room) => {
  const { x, y, width, height, shape, centerX, centerY } = room;
  
  switch (shape) {
    case 'circle': {
      const radius = Math.min(width, height) / 2 - 1;
      for (let py = y; py < y + height; py++) {
        for (let px = x; px < x + width; px++) {
          if (py >= 0 && py < tiles.length && px >= 0 && px < tiles[0].length) {
            if (isPointInCircle(px + 0.5, py + 0.5, centerX + 0.5, centerY + 0.5, radius)) {
              tiles[py][px].type = 'floor';
              tiles[py][px].variant = randomInt(0, 3);
            }
          }
        }
      }
      break;
    }
    
    case 'hexagon': {
      const radius = Math.min(width, height) / 2 - 0.5;
      for (let py = y; py < y + height; py++) {
        for (let px = x; px < x + width; px++) {
          if (py >= 0 && py < tiles.length && px >= 0 && px < tiles[0].length) {
            if (isPointInHexagon(px + 0.5, py + 0.5, centerX + 0.5, centerY + 0.5, radius)) {
              tiles[py][px].type = 'floor';
              tiles[py][px].variant = randomInt(0, 3);
            }
          }
        }
      }
      break;
    }
    
    case 'irregular': {
      for (let py = y; py < y + height; py++) {
        for (let px = x; px < x + width; px++) {
          if (py >= 0 && py < tiles.length && px >= 0 && px < tiles[0].length) {
            const edgeFactor = Math.sin((px - x) / width * Math.PI) * Math.sin((py - y) / height * Math.PI);
            const noise = Math.sin(px * 0.5 + py * 0.3) * 0.3 + Math.cos(px * 0.2 - py * 0.4) * 0.2;
            const threshold = 0.3 + noise * 0.2;
            
            if (edgeFactor > threshold) {
              tiles[py][px].type = 'floor';
              tiles[py][px].variant = randomInt(0, 3);
            }
          }
        }
      }
      break;
    }
    
    default:
    case 'rectangle': {
      for (let py = y; py < y + height; py++) {
        for (let px = x; px < x + width; px++) {
          if (py >= 0 && py < tiles.length && px >= 0 && px < tiles[0].length) {
            tiles[py][px].type = 'floor';
            tiles[py][px].variant = randomInt(0, 3);
          }
        }
      }
      break;
    }
  }
};

const carveHorizontalCorridor = (tiles: Tile[][], x1: number, x2: number, y: number, width: number = 1) => {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  const halfWidth = Math.floor(width / 2);
  
  for (let x = start; x <= end; x++) {
    for (let wy = -halfWidth; wy <= halfWidth; wy++) {
      const ty = y + wy;
      if (ty >= 0 && ty < tiles.length && x >= 0 && x < tiles[0].length) {
        tiles[ty][x].type = 'floor';
        tiles[ty][x].variant = randomInt(0, 3);
      }
    }
  }
};

const carveVerticalCorridor = (tiles: Tile[][], y1: number, y2: number, x: number, width: number = 1) => {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  const halfWidth = Math.floor(width / 2);
  
  for (let y = start; y <= end; y++) {
    for (let wx = -halfWidth; wx <= halfWidth; wx++) {
      const tx = x + wx;
      if (y >= 0 && y < tiles.length && tx >= 0 && tx < tiles[0].length) {
        tiles[y][tx].type = 'floor';
        tiles[y][tx].variant = randomInt(0, 3);
      }
    }
  }
};

const carveZigzagCorridor = (tiles: Tile[][], x1: number, y1: number, x2: number, y2: number) => {
  let x = x1;
  let y = y1;
  const segmentLength = 3;
  
  while (x !== x2 || y !== y2) {
    if (Math.random() < 0.5 && x !== x2) {
      const step = Math.sign(x2 - x);
      const dist = Math.min(Math.abs(x2 - x), segmentLength);
      carveHorizontalCorridor(tiles, x, x + step * dist, y);
      x += step * dist;
    } else if (y !== y2) {
      const step = Math.sign(y2 - y);
      const dist = Math.min(Math.abs(y2 - y), segmentLength);
      carveVerticalCorridor(tiles, y, y + step * dist, x);
      y += step * dist;
    } else if (x !== x2) {
      const step = Math.sign(x2 - x);
      const dist = Math.min(Math.abs(x2 - x), segmentLength);
      carveHorizontalCorridor(tiles, x, x + step * dist, y);
      x += step * dist;
    }
  }
};

const carveCurvedCorridor = (tiles: Tile[][], x1: number, y1: number, x2: number, y2: number) => {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const smoothT = t * t * (3 - 2 * t);
    const wave = Math.sin(t * Math.PI * 2) * 2;
    
    const x = Math.floor(x1 + (x2 - x1) * smoothT + wave * (y2 - y1) / Math.max(1, Math.abs(y2 - y1)));
    const y = Math.floor(y1 + (y2 - y1) * smoothT + wave * (x2 - x1) / Math.max(1, Math.abs(x2 - x1)));
    
    if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
      tiles[y][x].type = 'floor';
      tiles[y][x].variant = randomInt(0, 3);
      if (y + 1 < tiles.length) {
        tiles[y + 1][x].type = 'floor';
        tiles[y + 1][x].variant = randomInt(0, 3);
      }
    }
  }
};

const connectRooms = (tiles: Tile[][], rooms: Room[], style: CorridorStyle) => {
  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currRoom = rooms[i];
    
    const corridorWidth = style === 'wide' ? 3 : 1;
    
    switch (style) {
      case 'zigzag':
        carveZigzagCorridor(tiles, prevRoom.centerX, prevRoom.centerY, currRoom.centerX, currRoom.centerY);
        break;
        
      case 'curved':
        carveCurvedCorridor(tiles, prevRoom.centerX, prevRoom.centerY, currRoom.centerX, currRoom.centerY);
        break;
        
      case 'branching':
        if (Math.random() < 0.5) {
          carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, prevRoom.centerY, corridorWidth);
          carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, currRoom.centerX, corridorWidth);
        } else {
          carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, prevRoom.centerX, corridorWidth);
          carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, currRoom.centerY, corridorWidth);
        }
        if (Math.random() < 0.3 && i > 1) {
          const prevPrevRoom = rooms[i - 2];
          carveZigzagCorridor(tiles, prevPrevRoom.centerX, prevPrevRoom.centerY, currRoom.centerX, currRoom.centerY);
        }
        break;
        
      case 'wide':
      case 'straight':
      default:
        if (Math.random() < 0.5) {
          carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, prevRoom.centerY, corridorWidth);
          carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, currRoom.centerX, corridorWidth);
        } else {
          carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, prevRoom.centerX, corridorWidth);
          carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, currRoom.centerY, corridorWidth);
        }
        break;
    }
  }
};

const getDecorationGlowColor = (type: DecorationType, theme: ThemeConfig): string | undefined => {
  switch (type) {
    case 'torch':
      return '#ff6b35';
    case 'crystal':
      return theme.colors.accent;
    case 'rune_stone':
      return theme.colors.accent;
    case 'altar':
      return theme.colors.accent;
    case 'mushroom':
      return '#27ae60';
    default:
      return undefined;
  }
};

const generateDecorations = (
  tiles: Tile[][],
  rooms: Room[],
  themeConfig: ThemeConfig
): Decoration[] => {
  const decorations: Decoration[] = [];
  const density = GAME_CONFIG.DECORATION_DENSITY;
  
  for (const room of rooms) {
    const floorTiles: Position[] = [];
    
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
          if (tiles[y][x].type === 'floor') {
            const isNearWall = 
              (y > 0 && tiles[y - 1][x].type === 'wall') ||
              (y < tiles.length - 1 && tiles[y + 1][x].type === 'wall') ||
              (x > 0 && tiles[y][x - 1].type === 'wall') ||
              (x < tiles[0].length - 1 && tiles[y][x + 1].type === 'wall');
            
            const isCenter = x === room.centerX && y === room.centerY;
            const isNearCenter = Math.abs(x - room.centerX) <= 1 && Math.abs(y - room.centerY) <= 1;
            
            if (isNearWall || (!isNearCenter && Math.random() < density * 0.3)) {
              floorTiles.push({ x, y });
            }
          }
        }
      }
    }
    
    const decorCount = Math.floor(floorTiles.length * density);
    const shuffled = floorTiles.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(decorCount, shuffled.length); i++) {
      const pos = shuffled[i];
      const decorType = selectWeightedDecoration(themeConfig.decorationWeights);
      
      if (!decorType) continue;
      
      const isInteractable = decorType === 'altar' || decorType === 'rune_stone';
      
      decorations.push({
        id: `decor_${++decorationIdCounter}_${Date.now()}`,
        type: decorType,
        position: {
          x: pos.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
          y: pos.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        },
        tileX: pos.x,
        tileY: pos.y,
        variant: randomInt(0, 3),
        interactable: isInteractable,
        glowColor: getDecorationGlowColor(decorType, themeConfig),
      });
      
      if (decorType === 'pillar') {
        tiles[pos.y][pos.x].type = 'pillar';
      }
    }
  }
  
  return decorations;
};

const addHazards = (tiles: Tile[][], rooms: Room[], themeConfig: ThemeConfig) => {
  if (!themeConfig.hasHazard || !themeConfig.hazardType) return;
  
  const hazardType = themeConfig.hazardType;
  
  for (const room of rooms) {
    if (Math.random() < 0.3) continue;
    
    const hazardCount = randomInt(1, 3);
    
    for (let i = 0; i < hazardCount; i++) {
      const hx = randomInt(room.x + 1, room.x + room.width - 2);
      const hy = randomInt(room.y + 1, room.y + room.height - 2);
      
      if (hy >= 0 && hy < tiles.length && hx >= 0 && hx < tiles[0].length) {
        if (tiles[hy][hx].type === 'floor') {
          const size = randomInt(1, 2);
          for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
              const ny = hy + dy;
              const nx = hx + dx;
              if (ny >= 0 && ny < tiles.length && nx >= 0 && nx < tiles[0].length) {
                if (tiles[ny][nx].type === 'floor') {
                  tiles[ny][nx].type = hazardType;
                }
              }
            }
          }
        }
      }
    }
  }
};

export const generateDungeon = (level: number, difficulty: AdventureDifficulty = 'adventurer'): Dungeon => {
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  
  const theme = getThemeForLevel(level);
  const themeConfig = DUNGEON_THEMES[theme];
  const corridorStyle = getRandomCorridorStyle();
  
  const tiles = createEmptyTiles(width, height);
  const rooms = generateRooms(width, height, GAME_CONFIG.MAX_ROOMS + level);
  
  for (const room of rooms) {
    carveRoom(tiles, room);
  }
  
  connectRooms(tiles, rooms, corridorStyle);
  addHazards(tiles, rooms, themeConfig);
  
  const decorations = generateDecorations(tiles, rooms, themeConfig);
  
  const lastRoom = rooms[rooms.length - 1];
  const stairsPosition: Position = {
    x: lastRoom.centerX,
    y: lastRoom.centerY,
  };
  tiles[lastRoom.centerY][lastRoom.centerX].type = 'stairs';
  
  let shop: Shop | null = null;
  if (rooms.length >= 3 && Math.random() < SHOP_SPAWN_CHANCE) {
    const shopRoomIndex = Math.max(1, Math.floor(rooms.length / 2));
    const shopRoom = rooms[shopRoomIndex];
    const shopTilePos = { x: shopRoom.centerX, y: shopRoom.centerY };
    shop = createShop(level, shopTilePos, shopRoomIndex, difficulty);
  }
  
  return {
    tiles,
    rooms,
    width,
    height,
    level,
    stairsPosition,
    shop,
    theme,
    themeConfig,
    decorations,
    corridorStyle,
  };
};

export const getRandomFloorPosition = (dungeon: Dungeon, excludeRooms: Room[] = []): Position | null => {
  const validRooms = dungeon.rooms.filter(
    (room) => !excludeRooms.some((r) => r.x === room.x && r.y === room.y)
  );
  
  if (validRooms.length === 0) return null;
  
  const room = validRooms[randomInt(0, validRooms.length - 1)];
  return {
    x: randomInt(room.x + 1, room.x + room.width - 2),
    y: randomInt(room.y + 1, room.y + room.height - 2),
  };
};

export const generateMonsters = (dungeon: Dungeon, level: number, difficulty: AdventureDifficulty = 'adventurer'): Monster[] => {
  const diffConfig = getDifficultyConfig(difficulty);
  const monsters: Monster[] = [];
  const baseCount = GAME_CONFIG.MONSTERS_PER_LEVEL + Math.floor(level * 1.5);
  const count = Math.floor(baseCount * diffConfig.countMultiplier);
  const levelMultiplier = (1 + (level - 1) * 0.3 + diffConfig.levelMultiplierBonus) * diffConfig.hpMultiplier;

  const firstRoom = dungeon.rooms[0];
  const lastRoom = dungeon.rooms[dungeon.rooms.length - 1];
  const excludeRooms = [firstRoom, lastRoom];

  for (let i = 0; i < count; i++) {
    const position = getRandomFloorPosition(dungeon, excludeRooms);
    if (!position) continue;

    const type = getRandomMonsterType(level);
    const monster = createMonster(type, {
      x: position.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      y: position.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    }, levelMultiplier);

    monster.damage = Math.floor(monster.damage * diffConfig.damageMultiplier);

    monsters.push(monster);
  }

  const bossType = getBossForLevel(level);
  const bossPos = {
    x: lastRoom.centerX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    y: lastRoom.centerY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
  };
  const boss = createBoss(bossType, bossPos, levelMultiplier);
  boss.damage = Math.floor(boss.damage * diffConfig.damageMultiplier);
  monsters.push(boss);

  return monsters;
};

export const generateChests = (dungeon: Dungeon, level: number): Chest[] => {
  const chests: Chest[] = [];
  const count = GAME_CONFIG.CHESTS_PER_LEVEL + Math.floor(level * 0.5);
  
  const firstRoom = dungeon.rooms[0];
  const lastRoom = dungeon.rooms[dungeon.rooms.length - 1];
  const excludeRooms = [firstRoom, lastRoom];
  
  for (let i = 0; i < count; i++) {
    const position = getRandomFloorPosition(dungeon, excludeRooms);
    if (!position) continue;
    
    chestIdCounter++;
    const rand = Math.random();
    let type: 'normal' | 'rare' | 'epic' = 'normal';
    if (rand > 0.9) type = 'epic';
    else if (rand > 0.7) type = 'rare';
    
    const rewardCount = type === 'epic' ? 2 : type === 'rare' ? 2 : 1;
    const rewardRuneIds: string[] = [];
    for (let j = 0; j < rewardCount; j++) {
      rewardRuneIds.push(getRandomRune().id);
    }
    
    chests.push({
      id: `chest_${chestIdCounter}_${Date.now()}`,
      position: {
        x: position.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
        y: position.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      },
      type,
      opened: false,
      rewardRuneIds,
    });
  }
  
  return chests;
};

export const getPlayerStartPosition = (dungeon: Dungeon): Position => {
  const firstRoom = dungeon.rooms[0];
  return {
    x: firstRoom.centerX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    y: firstRoom.centerY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
  };
};

export const isWalkable = (dungeon: Dungeon, x: number, y: number): boolean => {
  const tileX = Math.floor(x / GAME_CONFIG.TILE_SIZE);
  const tileY = Math.floor(y / GAME_CONFIG.TILE_SIZE);
  
  if (tileX < 0 || tileX >= dungeon.width || tileY < 0 || tileY >= dungeon.height) {
    return false;
  }
  
  const tile = dungeon.tiles[tileY][tileX];
  return tile.type === 'floor' || tile.type === 'stairs';
};

export const updateFOV = (dungeon: Dungeon, playerPos: Position, radius: number): Dungeon => {
  const playerTileX = Math.floor(playerPos.x / GAME_CONFIG.TILE_SIZE);
  const playerTileY = Math.floor(playerPos.y / GAME_CONFIG.TILE_SIZE);
  
  const newTiles = dungeon.tiles.map((row) =>
    row.map((tile) => ({ ...tile, visible: false }))
  );
  
  for (let angle = 0; angle < 360; angle += 1) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    
    let x = playerTileX + 0.5;
    let y = playerTileY + 0.5;
    
    for (let i = 0; i < radius; i++) {
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      
      if (tileX < 0 || tileX >= dungeon.width || tileY < 0 || tileY >= dungeon.height) {
        break;
      }
      
      newTiles[tileY][tileX].visible = true;
      newTiles[tileY][tileX].explored = true;
      
      if (newTiles[tileY][tileX].type === 'wall' || newTiles[tileY][tileX].type === 'pillar') {
        break;
      }
      
      x += dx;
      y += dy;
    }
  }
  
  for (const decor of dungeon.decorations) {
    if (decor.type === 'torch' && newTiles[decor.tileY]?.[decor.tileX]?.explored) {
      const torchGlowRadius = GAME_CONFIG.TORCH_GLOW_RADIUS;
      for (let dy = -torchGlowRadius; dy <= torchGlowRadius; dy++) {
        for (let dx = -torchGlowRadius; dx <= torchGlowRadius; dx++) {
          const tx = decor.tileX + dx;
          const ty = decor.tileY + dy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= torchGlowRadius && tx >= 0 && tx < dungeon.width && ty >= 0 && ty < dungeon.height) {
            if (newTiles[ty][tx].explored) {
              newTiles[ty][tx].visible = true;
            }
          }
        }
      }
    }
  }
  
  return { ...dungeon, tiles: newTiles };
};
