import type { Pet, PetType, Position } from '../types/game';
import { generateId } from '../game/utils/math';

export const PET_TEMPLATES: Record<PetType, {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  color: string;
  attackRange: number;
  attackCooldown: number;
  skill: {
    name: string;
    damage: number;
    cooldown: number;
    range: number;
    description: string;
  };
}> = {
  fire_dragonling: {
    name: '小火龙',
    hp: 60,
    damage: 12,
    speed: 130,
    color: '#ff6b35',
    attackRange: 100,
    attackCooldown: 1200,
    skill: {
      name: '火焰吐息',
      damage: 25,
      cooldown: 8000,
      range: 120,
      description: '向敌人喷射火焰，造成范围伤害',
    },
  },
  ice_sprite: {
    name: '冰霜精灵',
    hp: 45,
    damage: 8,
    speed: 150,
    color: '#4ecdc4',
    attackRange: 120,
    attackCooldown: 1000,
    skill: {
      name: '寒冰新星',
      damage: 15,
      cooldown: 6000,
      range: 100,
      description: '释放寒冰新星，冻结附近敌人',
    },
  },
  thunder_bird: {
    name: '雷霆鸟',
    hp: 50,
    damage: 15,
    speed: 170,
    color: '#ffe66d',
    attackRange: 130,
    attackCooldown: 1500,
    skill: {
      name: '闪电链',
      damage: 20,
      cooldown: 7000,
      range: 150,
      description: '释放闪电链，在多个敌人间跳跃',
    },
  },
  shadow_cat: {
    name: '暗影猫',
    hp: 55,
    damage: 18,
    speed: 160,
    color: '#a29bfe',
    attackRange: 60,
    attackCooldown: 800,
    skill: {
      name: '暗影突袭',
      damage: 35,
      cooldown: 10000,
      range: 80,
      description: '瞬移到敌人身后进行致命一击',
    },
  },
};

export const createPet = (type: PetType, position: Position): Pet => {
  const template = PET_TEMPLATES[type];
  return {
    id: `pet_${generateId()}`,
    name: template.name,
    type,
    hp: template.hp,
    maxHp: template.hp,
    damage: template.damage,
    speed: template.speed,
    position: { ...position },
    color: template.color,
    attackRange: template.attackRange,
    attackCooldown: template.attackCooldown,
    currentAttackCooldown: 0,
    skill: {
      ...template.skill,
      currentCooldown: 0,
    },
    direction: 1,
    animFrame: 0,
    animTimer: 0,
    isAttacking: false,
    attackAnimTimer: 0,
    followOffset: { x: -30, y: 20 },
  };
};

export const getRandomPetType = (): PetType => {
  const types: PetType[] = ['fire_dragonling', 'ice_sprite', 'thunder_bird', 'shadow_cat'];
  return types[Math.floor(Math.random() * types.length)];
};
