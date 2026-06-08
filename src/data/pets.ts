import type { Pet, PetType, Position, PetSkill } from '../types/game';
import { generateId } from '../game/utils/math';

export type PetSkillType = 'aoe' | 'chain' | 'dash' | 'single' | 'shield' | 'heal' | 'buff';

export interface PetSkillTemplate {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  range: number;
  description: string;
  icon: string;
  type: PetSkillType;
}

export const PET_SKILLS: Record<PetType, PetSkillTemplate[]> = {
  fire_dragonling: [
    {
      id: 'fire_breath',
      name: '火焰吐息',
      damage: 25,
      cooldown: 8000,
      range: 120,
      description: '向敌人喷射火焰，造成范围伤害',
      icon: '🔥',
      type: 'aoe',
    },
    {
      id: 'lava_blast',
      name: '熔岩爆击',
      damage: 50,
      cooldown: 12000,
      range: 100,
      description: '聚集熔岩能量，对单个敌人造成巨额伤害',
      icon: '💥',
      type: 'single',
    },
    {
      id: 'flame_shield',
      name: '烈焰护盾',
      damage: 0,
      cooldown: 15000,
      range: 50,
      description: '为主人附加火焰护盾，反弹部分伤害',
      icon: '🛡️',
      type: 'shield',
    },
  ],
  ice_sprite: [
    {
      id: 'frost_nova',
      name: '寒冰新星',
      damage: 15,
      cooldown: 6000,
      range: 100,
      description: '释放寒冰新星，冻结范围内敌人',
      icon: '❄️',
      type: 'aoe',
    },
    {
      id: 'ice_spike',
      name: '冰锥术',
      damage: 35,
      cooldown: 9000,
      range: 150,
      description: '发射锐利冰锥，穿透多个敌人',
      icon: '🧊',
      type: 'single',
    },
    {
      id: 'healing_frost',
      name: '治愈冰晶',
      damage: 0,
      cooldown: 10000,
      range: 60,
      description: '释放治愈冰晶，恢复主人生命值',
      icon: '💚',
      type: 'heal',
    },
  ],
  thunder_bird: [
    {
      id: 'lightning_chain',
      name: '闪电链',
      damage: 20,
      cooldown: 7000,
      range: 150,
      description: '释放闪电链，在多个敌人间跳跃',
      icon: '⚡',
      type: 'chain',
    },
    {
      id: 'thunder_strike',
      name: '雷霆一击',
      damage: 55,
      cooldown: 11000,
      range: 130,
      description: '召唤雷霆从天而降，造成高额伤害',
      icon: '🌩️',
      type: 'single',
    },
    {
      id: 'static_buff',
      name: '静电充能',
      damage: 0,
      cooldown: 14000,
      range: 50,
      description: '为玩家充能，临时提升攻击速度',
      icon: '✨',
      type: 'buff',
    },
  ],
  shadow_cat: [
    {
      id: 'shadow_dash',
      name: '暗影突袭',
      damage: 35,
      cooldown: 10000,
      range: 80,
      description: '瞬移到敌人身后进行致命一击',
      icon: '🌙',
      type: 'dash',
    },
    {
      id: 'shadow_blades',
      name: '影刃风暴',
      damage: 12,
      cooldown: 8000,
      range: 90,
      description: '召唤影刃环绕，对周围敌人持续伤害',
      icon: '🗡️',
      type: 'aoe',
    },
    {
      id: 'stealth_aura',
      name: '潜行光环',
      damage: 0,
      cooldown: 16000,
      range: 50,
      description: '释放暗影能量，短时间内提高主人闪避',
      icon: '👤',
      type: 'buff',
    },
  ],
};

export const PET_TEMPLATES: Record<PetType, {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  color: string;
  attackRange: number;
  attackCooldown: number;
  defaultSkillId: string;
}> = {
  fire_dragonling: {
    name: '小火龙',
    hp: 60,
    damage: 12,
    speed: 130,
    color: '#ff6b35',
    attackRange: 100,
    attackCooldown: 1200,
    defaultSkillId: 'fire_breath',
  },
  ice_sprite: {
    name: '冰霜精灵',
    hp: 45,
    damage: 8,
    speed: 150,
    color: '#4ecdc4',
    attackRange: 120,
    attackCooldown: 1000,
    defaultSkillId: 'frost_nova',
  },
  thunder_bird: {
    name: '雷霆鸟',
    hp: 50,
    damage: 15,
    speed: 170,
    color: '#ffe66d',
    attackRange: 130,
    attackCooldown: 1500,
    defaultSkillId: 'lightning_chain',
  },
  shadow_cat: {
    name: '暗影猫',
    hp: 55,
    damage: 18,
    speed: 160,
    color: '#a29bfe',
    attackRange: 60,
    attackCooldown: 800,
    defaultSkillId: 'shadow_dash',
  },
};

export const getPetSkillById = (petType: PetType, skillId: string): PetSkillTemplate | undefined => {
  return PET_SKILLS[petType]?.find(s => s.id === skillId);
};

export const createPet = (type: PetType, position: Position, skillId?: string): Pet => {
  const template = PET_TEMPLATES[type];
  const skills = PET_SKILLS[type];
  const selectedSkillId = skillId || template.defaultSkillId;
  const skillTemplate = skills.find(s => s.id === selectedSkillId) || skills[0];
  
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
      id: skillTemplate.id,
      name: skillTemplate.name,
      damage: skillTemplate.damage,
      cooldown: skillTemplate.cooldown,
      currentCooldown: 0,
      range: skillTemplate.range,
      description: skillTemplate.description,
      icon: skillTemplate.icon,
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
