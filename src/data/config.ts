import type { DungeonTheme, ThemeConfig, RoomShape, CorridorStyle } from '../types/game';

export const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_WIDTH: 60,
  MAP_HEIGHT: 50,
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 600,
  PLAYER_SPEED: 140,
  PLAYER_MAX_HP: 100,
  MAX_RUNE_SLOTS: 4,
  FOV_RADIUS: 10,
  MIN_ROOM_SIZE: 6,
  MAX_ROOM_SIZE: 15,
  MAX_ROOMS: 15,
  MONSTERS_PER_LEVEL: 10,
  CHESTS_PER_LEVEL: 4,
  INVINCIBLE_DURATION: 600,
  PARTICLE_COUNT: 20,
  DECORATION_DENSITY: 0.15,
  TORCH_GLOW_RADIUS: 4,
};

export const DUNGEON_THEMES: Record<DungeonTheme, ThemeConfig> = {
  stone: {
    id: 'stone',
    name: '石质地牢',
    colors: {
      wall: '#4a4a6a',
      wallDark: '#3a3a5a',
      wallLight: '#5a5a7a',
      floor: '#2d2d44',
      floorAlt: '#252538',
      accent: '#6c5ce7',
    },
    decorationWeights: {
      torch: 30,
      pillar: 15,
      skull: 10,
      crate: 15,
      barrel: 10,
      bones: 10,
      cobweb: 10,
    },
    hasHazard: false,
  },
  forest: {
    id: 'forest',
    name: '幽暗森林',
    colors: {
      wall: '#2d4a3e',
      wallDark: '#1e3a2e',
      wallLight: '#3d5a4e',
      floor: '#1a2e22',
      floorAlt: '#15281e',
      accent: '#27ae60',
    },
    decorationWeights: {
      torch: 10,
      pillar: 5,
      roots: 20,
      mushroom: 25,
      vines: 20,
      crystal: 10,
    },
    hasHazard: true,
    hazardType: 'water',
  },
  ice: {
    id: 'ice',
    name: '寒冰洞窟',
    colors: {
      wall: '#5a7a9a',
      wallDark: '#4a6a8a',
      wallLight: '#6a8aaa',
      floor: '#2a4a6a',
      floorAlt: '#25405a',
      accent: '#4ecdc4',
    },
    decorationWeights: {
      torch: 5,
      pillar: 20,
      crystal: 30,
      icicle: 25,
      skull: 10,
    },
    hasHazard: true,
    hazardType: 'water',
  },
  fire: {
    id: 'fire',
    name: '熔岩地狱',
    colors: {
      wall: '#5a3a2a',
      wallDark: '#4a2a1a',
      wallLight: '#6a4a3a',
      floor: '#3a2a1a',
      floorAlt: '#2a1a0a',
      accent: '#ff6b35',
    },
    decorationWeights: {
      torch: 40,
      pillar: 15,
      skull: 15,
      bones: 15,
      altar: 10,
      rune_stone: 5,
    },
    hasHazard: true,
    hazardType: 'lava',
  },
  desert: {
    id: 'desert',
    name: '沙漠遗迹',
    colors: {
      wall: '#8b7355',
      wallDark: '#6b5a35',
      wallLight: '#9b8365',
      floor: '#6b5a35',
      floorAlt: '#5b4a25',
      accent: '#f39c12',
    },
    decorationWeights: {
      torch: 15,
      pillar: 25,
      skull: 10,
      crate: 10,
      rune_stone: 20,
      bones: 10,
    },
    hasHazard: false,
  },
  crystal: {
    id: 'crystal',
    name: '水晶矿洞',
    colors: {
      wall: '#3a4a6a',
      wallDark: '#2a3a5a',
      wallLight: '#4a5a7a',
      floor: '#1a2a4a',
      floorAlt: '#15203a',
      accent: '#a29bfe',
    },
    decorationWeights: {
      torch: 10,
      crystal: 40,
      pillar: 15,
      rune_stone: 20,
      altar: 10,
    },
    hasHazard: false,
  },
  ruins: {
    id: 'ruins',
    name: '远古遗迹',
    colors: {
      wall: '#5a5a4a',
      wallDark: '#4a4a3a',
      wallLight: '#6a6a5a',
      floor: '#3a3a2a',
      floorAlt: '#2a2a1a',
      accent: '#d4a574',
    },
    decorationWeights: {
      torch: 20,
      pillar: 30,
      rune_stone: 25,
      altar: 15,
      skull: 5,
      bones: 5,
    },
    hasHazard: false,
  },
  swamp: {
    id: 'swamp',
    name: '毒沼深处',
    colors: {
      wall: '#3a4a2a',
      wallDark: '#2a3a1a',
      wallLight: '#4a5a3a',
      floor: '#1a2a0a',
      floorAlt: '#152005',
      accent: '#2ecc71',
    },
    decorationWeights: {
      torch: 10,
      skull: 20,
      bones: 20,
      cobweb: 15,
      mushroom: 20,
      vines: 15,
    },
    hasHazard: true,
    hazardType: 'water',
  },
};

export const ROOM_SHAPE_WEIGHTS: Record<RoomShape, number> = {
  rectangle: 40,
  circle: 25,
  hexagon: 20,
  irregular: 15,
};

export const CORRIDOR_STYLE_WEIGHTS: Record<CorridorStyle, number> = {
  straight: 30,
  zigzag: 20,
  curved: 20,
  wide: 15,
  branching: 15,
};

export const getThemeForLevel = (level: number): DungeonTheme => {
  const themes: DungeonTheme[] = ['stone', 'forest', 'ice', 'fire', 'desert', 'crystal', 'ruins', 'swamp'];
  const index = Math.floor((level - 1) / 3) % themes.length;
  return themes[index];
};
