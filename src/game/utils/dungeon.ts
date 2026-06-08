import type { Dungeon, Tile, Room, Position, Chest, Monster, Shop } from '../../types/game';
import { GAME_CONFIG } from '../../data/config';
import { randomInt, randomRange } from './math';
import { createMonster, getRandomMonsterType } from '../../data/monsters';
import { getRandomRune } from '../../data/runes';
import { createShop, SHOP_SPAWN_CHANCE } from '../../data/shop';

let chestIdCounter = 0;

const createEmptyTiles = (width: number, height: number): Tile[][] => {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        type: 'wall',
        explored: false,
        visible: false,
      };
    }
  }
  return tiles;
};

const generateRooms = (width: number, height: number, maxRooms: number): Room[] => {
  const rooms: Room[] = [];
  const minSize = GAME_CONFIG.MIN_ROOM_SIZE;
  const maxSize = GAME_CONFIG.MAX_ROOM_SIZE;
  
  for (let i = 0; i < maxRooms * 3; i++) {
    if (rooms.length >= maxRooms) break;
    
    const roomWidth = randomInt(minSize, maxSize);
    const roomHeight = randomInt(minSize, maxSize);
    const x = randomInt(1, width - roomWidth - 1);
    const y = randomInt(1, height - roomHeight - 1);
    
    const newRoom: Room = {
      x,
      y,
      width: roomWidth,
      height: roomHeight,
      centerX: Math.floor(x + roomWidth / 2),
      centerY: Math.floor(y + roomHeight / 2),
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
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
        tiles[y][x].type = 'floor';
      }
    }
  }
};

const carveHorizontalCorridor = (tiles: Tile[][], x1: number, x2: number, y: number) => {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  for (let x = start; x <= end; x++) {
    if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
      tiles[y][x].type = 'floor';
    }
  }
};

const carveVerticalCorridor = (tiles: Tile[][], y1: number, y2: number, x: number) => {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  for (let y = start; y <= end; y++) {
    if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
      tiles[y][x].type = 'floor';
    }
  }
};

const connectRooms = (tiles: Tile[][], rooms: Room[]) => {
  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currRoom = rooms[i];
    
    if (Math.random() < 0.5) {
      carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, prevRoom.centerY);
      carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, currRoom.centerX);
    } else {
      carveVerticalCorridor(tiles, prevRoom.centerY, currRoom.centerY, prevRoom.centerX);
      carveHorizontalCorridor(tiles, prevRoom.centerX, currRoom.centerX, currRoom.centerY);
    }
  }
};

export const generateDungeon = (level: number): Dungeon => {
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  
  const tiles = createEmptyTiles(width, height);
  const rooms = generateRooms(width, height, GAME_CONFIG.MAX_ROOMS + level);
  
  for (const room of rooms) {
    carveRoom(tiles, room);
  }
  
  connectRooms(tiles, rooms);
  
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
    shop = createShop(level, shopTilePos, shopRoomIndex);
  }
  
  return {
    tiles,
    rooms,
    width,
    height,
    level,
    stairsPosition,
    shop,
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

export const generateMonsters = (dungeon: Dungeon, level: number): Monster[] => {
  const monsters: Monster[] = [];
  const count = GAME_CONFIG.MONSTERS_PER_LEVEL + Math.floor(level * 1.5);
  const levelMultiplier = 1 + (level - 1) * 0.3;
  
  const firstRoom = dungeon.rooms[0];
  const excludeRooms = [firstRoom];
  
  for (let i = 0; i < count; i++) {
    const position = getRandomFloorPosition(dungeon, excludeRooms);
    if (!position) continue;
    
    const type = getRandomMonsterType(level);
    const monster = createMonster(type, {
      x: position.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      y: position.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    }, levelMultiplier);
    
    monsters.push(monster);
  }
  
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
      
      if (newTiles[tileY][tileX].type === 'wall') {
        break;
      }
      
      x += dx;
      y += dy;
    }
  }
  
  return { ...dungeon, tiles: newTiles };
};
