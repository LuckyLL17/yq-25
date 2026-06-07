import type { Monster, MonsterType, AIType, Position } from '../types/game';

let monsterIdCounter = 0;

export const MONSTER_TEMPLATES: Record<MonsterType, {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  aiType: AIType;
  color: string;
  dropChance: number;
}> = {
  slime: {
    name: '史莱姆',
    hp: 30,
    damage: 5,
    speed: 40,
    aiType: 'passive',
    color: '#7bed9f',
    dropChance: 0.2,
  },
  bat: {
    name: '蝙蝠',
    hp: 20,
    damage: 8,
    speed: 80,
    aiType: 'aggressive',
    color: '#747d8c',
    dropChance: 0.25,
  },
  skeleton: {
    name: '骷髅兵',
    hp: 50,
    damage: 12,
    speed: 50,
    aiType: 'aggressive',
    color: '#dfe4ea',
    dropChance: 0.35,
  },
  ghost: {
    name: '幽灵',
    hp: 35,
    damage: 15,
    speed: 60,
    aiType: 'aggressive',
    color: '#a29bfe',
    dropChance: 0.4,
  },
  goblin: {
    name: '哥布林',
    hp: 45,
    damage: 10,
    speed: 55,
    aiType: 'patrol',
    color: '#2ed573',
    dropChance: 0.3,
  },
};

export const createMonster = (
  type: MonsterType,
  position: Position,
  levelMultiplier: number = 1
): Monster => {
  const template = MONSTER_TEMPLATES[type];
  monsterIdCounter++;
  return {
    id: `monster_${monsterIdCounter}_${Date.now()}`,
    name: template.name,
    type,
    hp: Math.floor(template.hp * levelMultiplier),
    maxHp: Math.floor(template.hp * levelMultiplier),
    damage: Math.floor(template.damage * levelMultiplier),
    speed: template.speed,
    position: { ...position },
    aiType: template.aiType,
    color: template.color,
    dropChance: template.dropChance,
    attackCooldown: 1000,
    currentAttackCooldown: 0,
    statusEffects: [],
    direction: 0,
    animFrame: 0,
    animTimer: 0,
  };
};

export const getRandomMonsterType = (level: number): MonsterType => {
  const types: MonsterType[] = ['slime', 'bat', 'skeleton', 'ghost', 'goblin'];
  const weights = [
    Math.max(0, 5 - level),
    Math.max(1, 4 - level * 0.5),
    level * 0.8,
    level * 0.5,
    level * 0.6,
  ];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) return types[i];
  }
  return types[0];
};
