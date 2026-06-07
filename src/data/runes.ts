import type { Rune, Skill, RuneElement, RuneEffect } from '../types/game';

export const ELEMENT_RUNES: Rune[] = [
  {
    id: 'rune_fire',
    name: '火焰符文',
    type: 'element',
    element: 'fire',
    color: '#ff6b35',
    rarity: 'common',
    description: '蕴含火焰之力的符文，燃烧敌人造成持续伤害',
  },
  {
    id: 'rune_ice',
    name: '冰霜符文',
    type: 'element',
    element: 'ice',
    color: '#4ecdc4',
    rarity: 'common',
    description: '蕴含冰霜之力的符文，冻结并减速敌人',
  },
  {
    id: 'rune_thunder',
    name: '雷电符文',
    type: 'element',
    element: 'thunder',
    color: '#ffe66d',
    rarity: 'common',
    description: '蕴含雷电之力的符文，高伤害有几率麻痹',
  },
];

export const EFFECT_RUNES: Rune[] = [
  {
    id: 'rune_spread',
    name: '扩散符文',
    type: 'effect',
    effect: 'spread',
    color: '#95e1d3',
    rarity: 'common',
    description: '扩大技能范围，同时攻击多个目标',
  },
  {
    id: 'rune_time',
    name: '时间符文',
    type: 'effect',
    effect: 'time',
    color: '#a29bfe',
    rarity: 'common',
    description: '延长技能持续时间，缩短冷却',
  },
  {
    id: 'rune_power',
    name: '强化符文',
    type: 'effect',
    effect: 'power',
    color: '#fd79a8',
    rarity: 'common',
    description: '大幅提升技能伤害',
  },
  {
    id: 'rune_pierce',
    name: '穿透符文',
    type: 'effect',
    effect: 'pierce',
    color: '#74b9ff',
    rarity: 'common',
    description: '技能可穿透多个敌人',
  },
];

export const ALL_RUNES: Rune[] = [...ELEMENT_RUNES, ...EFFECT_RUNES];

export const getSkillId = (element: RuneElement, effect: RuneEffect): string => {
  return `skill_${element}_${effect}`;
};

export const SKILLS: Record<string, Skill> = {
  [getSkillId('fire', 'spread')]: {
    id: getSkillId('fire', 'spread'),
    name: '烈焰风暴',
    elementRuneId: 'rune_fire',
    effectRuneId: 'rune_spread',
    element: 'fire',
    effect: 'spread',
    damage: 25,
    range: 120,
    cooldown: 2000,
    currentCooldown: 0,
    duration: 500,
    projectileSpeed: 0,
    description: '范围火焰爆炸，点燃区域内所有敌人',
  },
  [getSkillId('fire', 'time')]: {
    id: getSkillId('fire', 'time'),
    name: '炎爆持续',
    elementRuneId: 'rune_fire',
    effectRuneId: 'rune_time',
    element: 'fire',
    effect: 'time',
    damage: 15,
    range: 80,
    cooldown: 1500,
    currentCooldown: 0,
    duration: 3000,
    projectileSpeed: 0,
    description: '留下燃烧地面，持续造成灼烧伤害',
  },
  [getSkillId('fire', 'power')]: {
    id: getSkillId('fire', 'power'),
    name: '陨石坠落',
    elementRuneId: 'rune_fire',
    effectRuneId: 'rune_power',
    element: 'fire',
    effect: 'power',
    damage: 80,
    range: 60,
    cooldown: 3000,
    currentCooldown: 0,
    duration: 800,
    projectileSpeed: 0,
    description: '召唤巨型火球，超高单体伤害',
  },
  [getSkillId('fire', 'pierce')]: {
    id: getSkillId('fire', 'pierce'),
    name: '烈焰穿透',
    elementRuneId: 'rune_fire',
    effectRuneId: 'rune_pierce',
    element: 'fire',
    effect: 'pierce',
    damage: 35,
    range: 300,
    cooldown: 1800,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 400,
    description: '发射穿透火焰，穿过所有敌人',
  },
  [getSkillId('ice', 'spread')]: {
    id: getSkillId('ice', 'spread'),
    name: '寒冰新星',
    elementRuneId: 'rune_ice',
    effectRuneId: 'rune_spread',
    element: 'ice',
    effect: 'spread',
    damage: 18,
    range: 150,
    cooldown: 2500,
    currentCooldown: 0,
    duration: 2000,
    projectileSpeed: 0,
    description: '全屏冰冻波，所有敌人减速并受伤害',
  },
  [getSkillId('ice', 'time')]: {
    id: getSkillId('ice', 'time'),
    name: '绝对零度',
    elementRuneId: 'rune_ice',
    effectRuneId: 'rune_time',
    element: 'ice',
    effect: 'time',
    damage: 20,
    range: 100,
    cooldown: 3000,
    currentCooldown: 0,
    duration: 4000,
    projectileSpeed: 0,
    description: '长时间冻结敌人，冰冻期间受伤增加',
  },
  [getSkillId('ice', 'power')]: {
    id: getSkillId('ice', 'power'),
    name: '冰锥穿刺',
    elementRuneId: 'rune_ice',
    effectRuneId: 'rune_power',
    element: 'ice',
    effect: 'power',
    damage: 70,
    range: 50,
    cooldown: 2800,
    currentCooldown: 0,
    duration: 1000,
    projectileSpeed: 0,
    description: '巨型冰锥爆发，高伤害有几率冻结',
  },
  [getSkillId('ice', 'pierce')]: {
    id: getSkillId('ice', 'pierce'),
    name: '冰棱贯穿',
    elementRuneId: 'rune_ice',
    effectRuneId: 'rune_pierce',
    element: 'ice',
    effect: 'pierce',
    damage: 30,
    range: 320,
    cooldown: 1600,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 350,
    description: '发射穿透冰棱，减速并伤害敌人',
  },
  [getSkillId('thunder', 'spread')]: {
    id: getSkillId('thunder', 'spread'),
    name: '连锁闪电',
    elementRuneId: 'rune_thunder',
    effectRuneId: 'rune_spread',
    element: 'thunder',
    effect: 'spread',
    damage: 30,
    range: 180,
    cooldown: 2200,
    currentCooldown: 0,
    duration: 600,
    projectileSpeed: 0,
    description: '闪电在敌人之间跳跃，伤害递减',
  },
  [getSkillId('thunder', 'time')]: {
    id: getSkillId('thunder', 'time'),
    name: '雷暴天气',
    elementRuneId: 'rune_thunder',
    effectRuneId: 'rune_time',
    element: 'thunder',
    effect: 'time',
    damage: 20,
    range: 200,
    cooldown: 4000,
    currentCooldown: 0,
    duration: 5000,
    projectileSpeed: 0,
    description: '持续落雷，随机打击范围内敌人',
  },
  [getSkillId('thunder', 'power')]: {
    id: getSkillId('thunder', 'power'),
    name: '神罚之雷',
    elementRuneId: 'rune_thunder',
    effectRuneId: 'rune_power',
    element: 'thunder',
    effect: 'power',
    damage: 100,
    range: 40,
    cooldown: 3500,
    currentCooldown: 0,
    duration: 500,
    projectileSpeed: 0,
    description: '单体超高伤害雷击，必定暴击',
  },
  [getSkillId('thunder', 'pierce')]: {
    id: getSkillId('thunder', 'pierce'),
    name: '穿透雷弧',
    elementRuneId: 'rune_thunder',
    effectRuneId: 'rune_pierce',
    element: 'thunder',
    effect: 'pierce',
    damage: 45,
    range: 350,
    cooldown: 2000,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 500,
    description: '直线穿透的雷电光束，高伤害',
  },
};

export const createSkill = (elementRune: Rune, effectRune: Rune): Skill | null => {
  if (elementRune.type !== 'element' || effectRune.type !== 'effect') {
    return null;
  }
  const skillId = getSkillId(elementRune.element!, effectRune.effect!);
  const skillTemplate = SKILLS[skillId];
  if (!skillTemplate) return null;
  return { ...skillTemplate, currentCooldown: 0 };
};

export const getRandomRunes = (count: number): Rune[] => {
  const result: Rune[] = [];
  const pool = [...ALL_RUNES];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
};

export const getRandomRune = (): Rune => {
  return ALL_RUNES[Math.floor(Math.random() * ALL_RUNES.length)];
};
