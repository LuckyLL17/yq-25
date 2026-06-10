import type { PlayerClass, ClassType } from '../types/game';

export const CLASSES: Record<ClassType, PlayerClass> = {
  fire_mage: {
    id: 'fire_mage',
    name: '火焰法师',
    description: '精通火焰魔法的法师，擅长造成高额范围伤害',
    playStyle: '高伤害 · 范围攻击 · 燃烧持续伤害',
    color: '#ff6b35',
    icon: '🔥',
    difficulty: 'easy',
    stats: {
      maxHp: 80,
      speed: 130,
      attack: 1.3,
      defense: 0.8,
      critChance: 0.05,
      critDamage: 1.5,
      attackSpeed: 1.0,
    },
    startingRuneIds: ['rune_fire', 'rune_power', 'rune_spread', 'rune_fire_exclusive'],
    exclusiveRuneIds: ['rune_fire_exclusive'],
  },
  frost_warlock: {
    id: 'frost_warlock',
    name: '冰霜术士',
    description: '操控寒冰的术士，擅长控制敌人并持续输出',
    playStyle: '控制型 · 减速冻结 · 持续伤害',
    color: '#4ecdc4',
    icon: '❄️',
    difficulty: 'medium',
    stats: {
      maxHp: 90,
      speed: 120,
      attack: 1.0,
      defense: 1.0,
      critChance: 0.03,
      critDamage: 1.4,
      attackSpeed: 0.9,
    },
    startingRuneIds: ['rune_ice', 'rune_time', 'rune_spread', 'rune_ice_exclusive'],
    exclusiveRuneIds: ['rune_ice_exclusive'],
  },
  thunder_assassin: {
    id: 'thunder_assassin',
    name: '雷电刺客',
    description: '迅捷的雷电刺客，高暴击高速度，擅长快速打击',
    playStyle: '高速高暴击 · 穿透攻击 · 闪电连击',
    color: '#ffe66d',
    icon: '⚡',
    difficulty: 'hard',
    stats: {
      maxHp: 70,
      speed: 170,
      attack: 1.2,
      defense: 0.7,
      critChance: 0.25,
      critDamage: 2.0,
      attackSpeed: 1.4,
    },
    startingRuneIds: ['rune_thunder', 'rune_pierce', 'rune_power', 'rune_thunder_exclusive'],
    exclusiveRuneIds: ['rune_thunder_exclusive'],
  },
  nature_guardian: {
    id: 'nature_guardian',
    name: '自然守护者',
    description: '大自然的守护者，高生命高防御，均衡发展',
    playStyle: '坦克型 · 高生存 · 均衡属性',
    color: '#7bed9f',
    icon: '🌿',
    difficulty: 'easy',
    stats: {
      maxHp: 140,
      speed: 110,
      attack: 0.9,
      defense: 1.5,
      critChance: 0.08,
      critDamage: 1.3,
      attackSpeed: 0.8,
    },
    startingRuneIds: ['rune_fire', 'rune_ice', 'rune_thunder', 'rune_nature_exclusive'],
    exclusiveRuneIds: ['rune_nature_exclusive'],
  },
};

export const ALL_CLASSES: PlayerClass[] = Object.values(CLASSES);

export const getClassById = (id: ClassType): PlayerClass | undefined => {
  return CLASSES[id];
};

export const getClassExclusiveRunes = (classId: ClassType): string[] => {
  return CLASSES[classId]?.exclusiveRuneIds || [];
};

export const getClassStartingRunes = (classId: ClassType): string[] => {
  return CLASSES[classId]?.startingRuneIds || [];
};
