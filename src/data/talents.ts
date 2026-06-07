import type { TalentNode, TalentBranch } from '../types/game';

export const TALENT_BRANCHES: TalentBranch[] = [
  {
    id: 'survival',
    name: '生存',
    color: '#ff6b6b',
    icon: 'heart',
    description: '提升生命值和生存能力',
  },
  {
    id: 'attack',
    name: '攻击',
    color: '#ffa502',
    icon: 'sword',
    description: '提升伤害和攻击速度',
  },
  {
    id: 'exploration',
    name: '探索',
    color: '#70a1ff',
    icon: 'compass',
    description: '提升移动速度和探索效率',
  },
];

export const TALENT_NODES: TalentNode[] = [
  {
    id: 'survival_hp_1',
    name: '强健体魄 I',
    description: '最大生命值 +20',
    maxLevel: 5,
    costPerLevel: 1,
    effects: [{ type: 'maxHp', value: 20 }],
    position: { x: 0, y: 0 },
    requires: [],
    branch: 'survival',
  },
  {
    id: 'survival_hp_2',
    name: '强健体魄 II',
    description: '最大生命值 +30',
    maxLevel: 5,
    costPerLevel: 2,
    effects: [{ type: 'maxHp', value: 30 }],
    position: { x: 0, y: 1 },
    requires: ['survival_hp_1'],
    branch: 'survival',
  },
  {
    id: 'survival_regen',
    name: '快速恢复',
    description: '每5秒恢复1点生命',
    maxLevel: 3,
    costPerLevel: 2,
    effects: [{ type: 'maxHp', value: 10 }],
    position: { x: 1, y: 1 },
    requires: ['survival_hp_1'],
    branch: 'survival',
  },
  {
    id: 'survival_tough',
    name: '铜墙铁壁',
    description: '受到伤害减少10%',
    maxLevel: 3,
    costPerLevel: 3,
    effects: [{ type: 'maxHp', value: 50 }],
    position: { x: 0, y: 2 },
    requires: ['survival_hp_2'],
    branch: 'survival',
  },
  {
    id: 'attack_damage_1',
    name: '锐利符文 I',
    description: '技能伤害 +10%',
    maxLevel: 5,
    costPerLevel: 1,
    effects: [{ type: 'damage', value: 0.1 }],
    position: { x: 0, y: 0 },
    requires: [],
    branch: 'attack',
  },
  {
    id: 'attack_damage_2',
    name: '锐利符文 II',
    description: '技能伤害 +15%',
    maxLevel: 5,
    costPerLevel: 2,
    effects: [{ type: 'damage', value: 0.15 }],
    position: { x: 0, y: 1 },
    requires: ['attack_damage_1'],
    branch: 'attack',
  },
  {
    id: 'attack_speed',
    name: '迅捷施法',
    description: '技能冷却 -8%',
    maxLevel: 4,
    costPerLevel: 2,
    effects: [{ type: 'attackSpeed', value: 0.08 }],
    position: { x: 1, y: 1 },
    requires: ['attack_damage_1'],
    branch: 'attack',
  },
  {
    id: 'attack_crit',
    name: '致命一击',
    description: '暴击伤害 +20%',
    maxLevel: 3,
    costPerLevel: 3,
    effects: [{ type: 'damage', value: 0.2 }],
    position: { x: 0, y: 2 },
    requires: ['attack_damage_2'],
    branch: 'attack',
  },
  {
    id: 'explore_speed_1',
    name: '敏捷身法 I',
    description: '移动速度 +10%',
    maxLevel: 5,
    costPerLevel: 1,
    effects: [{ type: 'speed', value: 0.1 }],
    position: { x: 0, y: 0 },
    requires: [],
    branch: 'exploration',
  },
  {
    id: 'explore_speed_2',
    name: '敏捷身法 II',
    description: '移动速度 +12%',
    maxLevel: 5,
    costPerLevel: 2,
    effects: [{ type: 'speed', value: 0.12 }],
    position: { x: 0, y: 1 },
    requires: ['explore_speed_1'],
    branch: 'exploration',
  },
  {
    id: 'explore_fov',
    name: '鹰眼视野',
    description: '视野范围 +1',
    maxLevel: 3,
    costPerLevel: 2,
    effects: [{ type: 'fov', value: 1 }],
    position: { x: 1, y: 1 },
    requires: ['explore_speed_1'],
    branch: 'exploration',
  },
  {
    id: 'explore_runes',
    name: '幸运寻宝',
    description: '符文掉落率 +15%',
    maxLevel: 4,
    costPerLevel: 2,
    effects: [{ type: 'runeDrop', value: 0.15 }],
    position: { x: 0, y: 2 },
    requires: ['explore_speed_2'],
    branch: 'exploration',
  },
  {
    id: 'explore_start',
    name: '初始储备',
    description: '初始符文 +1',
    maxLevel: 2,
    costPerLevel: 3,
    effects: [{ type: 'startRunes', value: 1 }],
    position: { x: 1, y: 2 },
    requires: ['explore_fov'],
    branch: 'exploration',
  },
];

export const calculateTalentEffects = (unlockedTalents: Record<string, number>) => {
  const effects = {
    maxHp: 0,
    speed: 0,
    damage: 0,
    attackSpeed: 0,
    runeDrop: 0,
    startRunes: 0,
    fov: 0,
    goldBonus: 0,
  };

  for (const node of TALENT_NODES) {
    const level = unlockedTalents[node.id] || 0;
    if (level > 0) {
      for (const effect of node.effects) {
        effects[effect.type] += effect.value * level;
      }
    }
  }

  return effects;
};

export const canUnlockTalent = (
  talentId: string,
  unlockedTalents: Record<string, number>
): boolean => {
  const node = TALENT_NODES.find(n => n.id === talentId);
  if (!node) return false;

  const currentLevel = unlockedTalents[talentId] || 0;
  if (currentLevel >= node.maxLevel) return false;

  for (const reqId of node.requires) {
    const reqLevel = unlockedTalents[reqId] || 0;
    const reqNode = TALENT_NODES.find(n => n.id === reqId);
    if (!reqNode || reqLevel <= 0) return false;
  }

  return true;
};

export const getTalentCost = (talentId: string, unlockedTalents: Record<string, number>): number => {
  const node = TALENT_NODES.find(n => n.id === talentId);
  if (!node) return 0;
  const currentLevel = unlockedTalents[talentId] || 0;
  return node.costPerLevel * (currentLevel + 1);
};
