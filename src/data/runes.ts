import type { Rune, Skill, RuneElement, RuneEffect, RuneRarity } from '../types/game';

export const RARITY_CONFIG: Record<RuneRarity, {
  name: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  glowIntensity: number;
  animation: string;
  tier: number;
  dustValue: number;
  synthesizeCount: number;
}> = {
  common: {
    name: '普通',
    color: '#9ca3af',
    borderColor: '#6b7280',
    bgGradient: 'from-gray-500 to-gray-600',
    glowIntensity: 5,
    animation: '',
    tier: 1,
    dustValue: 5,
    synthesizeCount: 3,
  },
  rare: {
    name: '稀有',
    color: '#3b82f6',
    borderColor: '#2563eb',
    bgGradient: 'from-blue-500 to-blue-600',
    glowIntensity: 12,
    animation: 'animate-pulse-slow',
    tier: 2,
    dustValue: 15,
    synthesizeCount: 3,
  },
  epic: {
    name: '史诗',
    color: '#a855f7',
    borderColor: '#9333ea',
    bgGradient: 'from-purple-500 to-purple-600',
    glowIntensity: 18,
    animation: 'animate-pulse-slow animate-shimmer',
    tier: 3,
    dustValue: 50,
    synthesizeCount: 3,
  },
  legendary: {
    name: '传说',
    color: '#f59e0b',
    borderColor: '#d97706',
    bgGradient: 'from-yellow-500 to-orange-500',
    glowIntensity: 25,
    animation: 'animate-pulse-slow animate-shimmer animate-rainbow',
    tier: 4,
    dustValue: 200,
    synthesizeCount: 0,
  },
};

export const RARITY_ORDER: RuneRarity[] = ['common', 'rare', 'epic', 'legendary'];

export const getNextRarity = (rarity: RuneRarity): RuneRarity | null => {
  const index = RARITY_ORDER.indexOf(rarity);
  if (index === -1 || index >= RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[index + 1];
};

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
  {
    id: 'rune_fire_rare',
    name: '炽焰符文',
    type: 'element',
    element: 'fire',
    color: '#ff8c00',
    rarity: 'rare',
    description: '炽热的火焰符文，燃烧更猛烈，灼烧伤害提升',
  },
  {
    id: 'rune_ice_rare',
    name: '极霜符文',
    type: 'element',
    element: 'ice',
    color: '#1e90ff',
    rarity: 'rare',
    description: '极寒的冰霜符文，冻结几率提升，减速效果增强',
  },
  {
    id: 'rune_thunder_rare',
    name: '闪雷符文',
    type: 'element',
    element: 'thunder',
    color: '#ffd700',
    rarity: 'rare',
    description: '迅捷的雷电符文，攻击速度更快，麻痹几率提升',
  },
  {
    id: 'rune_fire_exclusive',
    name: '烈焰核心',
    type: 'element',
    element: 'fire',
    color: '#ff4757',
    rarity: 'epic',
    description: '【火焰法师专属】蕴含远古火焰之力，大幅提升火焰伤害',
  },
  {
    id: 'rune_ice_exclusive',
    name: '永冻之心',
    type: 'element',
    element: 'ice',
    color: '#00d2d3',
    rarity: 'epic',
    description: '【冰霜术士专属】极寒之力的结晶，冻结时间更长',
  },
  {
    id: 'rune_thunder_exclusive',
    name: '雷霆之怒',
    type: 'element',
    element: 'thunder',
    color: '#f368e0',
    rarity: 'epic',
    description: '【雷电刺客专属】狂暴雷电之力，必定暴击',
  },
  {
    id: 'rune_nature_exclusive',
    name: '生命之种',
    type: 'element',
    element: 'fire',
    color: '#7bed9f',
    rarity: 'epic',
    description: '【自然守护者专属】生命力量的精华，攻击时恢复生命',
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
  {
    id: 'rune_spread_rare',
    name: '扩散增幅符文',
    type: 'effect',
    effect: 'spread',
    color: '#00cec9',
    rarity: 'rare',
    description: '更大范围的扩散，同时影响更多目标',
  },
  {
    id: 'rune_time_rare',
    name: '时间延滞符文',
    type: 'effect',
    effect: 'time',
    color: '#6c5ce7',
    rarity: 'rare',
    description: '效果持续时间大幅延长，冷却进一步缩短',
  },
  {
    id: 'rune_power_rare',
    name: '力量激化符文',
    type: 'effect',
    effect: 'power',
    color: '#e84393',
    rarity: 'rare',
    description: '技能伤害进一步提升，有几率造成暴击',
  },
  {
    id: 'rune_pierce_rare',
    name: '贯穿强化符文',
    type: 'effect',
    effect: 'pierce',
    color: '#0984e3',
    rarity: 'rare',
    description: '穿透更多敌人，穿透伤害衰减降低',
  },
  {
    id: 'rune_explosion',
    name: '爆裂符文',
    type: 'effect',
    effect: 'spread',
    color: '#ff6348',
    rarity: 'epic',
    description: '【专属】技能命中后产生二次爆炸',
  },
  {
    id: 'rune_freeze',
    name: '冰封符文',
    type: 'effect',
    effect: 'time',
    color: '#1e90ff',
    rarity: 'epic',
    description: '【专属】完全冻结敌人，无法行动',
  },
  {
    id: 'rune_chain',
    name: '连锁符文',
    type: 'effect',
    effect: 'pierce',
    color: '#ffd700',
    rarity: 'epic',
    description: '【专属】闪电在敌人间多次跳跃',
  },
  {
    id: 'rune_regen',
    name: '再生符文',
    type: 'effect',
    effect: 'power',
    color: '#2ed573',
    rarity: 'epic',
    description: '【专属】技能伤害转化为生命值',
  },
];

export const LEGENDARY_ELEMENT_RUNES: Rune[] = [
  {
    id: 'rune_inferno',
    name: '地狱业火',
    type: 'element',
    element: 'fire',
    color: '#ff0844',
    rarity: 'legendary',
    description: '【传说难度】源自深渊的永恒之火，焚尽一切',
  },
  {
    id: 'rune_absolute_zero',
    name: '绝对冰零',
    type: 'element',
    element: 'ice',
    color: '#00d2ff',
    rarity: 'legendary',
    description: '【传说难度】冻结时空本身的极寒之力',
  },
  {
    id: 'rune_divine_thunder',
    name: '天罚神雷',
    type: 'element',
    element: 'thunder',
    color: '#f9ca24',
    rarity: 'legendary',
    description: '【传说难度】天界降下的审判之雷，无可闪避',
  },
];

export const LEGENDARY_EFFECT_RUNES: Rune[] = [
  {
    id: 'rune_nova',
    name: '新星符文',
    type: 'effect',
    effect: 'spread',
    color: '#fd79a8',
    rarity: 'legendary',
    description: '【传说难度】技能引发毁灭性新星爆发，覆盖全场',
  },
  {
    id: 'rune_eternity',
    name: '永恒符文',
    type: 'effect',
    effect: 'time',
    color: '#6c5ce7',
    rarity: 'legendary',
    description: '【传说难度】大幅延长所有效果持续时间',
  },
  {
    id: 'rune_annihilation',
    name: '湮灭符文',
    type: 'effect',
    effect: 'power',
    color: '#e84393',
    rarity: 'legendary',
    description: '【传说难度】极大提升伤害，足以湮灭一切',
  },
  {
    id: 'rune_phantom',
    name: '幻影符文',
    type: 'effect',
    effect: 'pierce',
    color: '#00cec9',
    rarity: 'legendary',
    description: '【传说难度】技能化为穿透幻影，无视一切障碍',
  },
];

export const ALL_RUNES: Rune[] = [...ELEMENT_RUNES, ...EFFECT_RUNES, ...LEGENDARY_ELEMENT_RUNES, ...LEGENDARY_EFFECT_RUNES];

export const getRunesForDifficulty = (difficulty: string): Rune[] => {
  const base = [...ELEMENT_RUNES, ...EFFECT_RUNES];
  if (difficulty === 'hero' || difficulty === 'legend') {
    return [...base, ...LEGENDARY_ELEMENT_RUNES, ...LEGENDARY_EFFECT_RUNES];
  }
  return base;
};

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

export const LEGENDARY_SKILLS: Record<string, Skill> = {
  [getSkillId('fire', 'spread') + '_legendary']: {
    id: getSkillId('fire', 'spread') + '_legendary',
    name: '炼狱新星',
    elementRuneId: 'rune_inferno',
    effectRuneId: 'rune_nova',
    element: 'fire',
    effect: 'spread',
    damage: 60,
    range: 200,
    cooldown: 3000,
    currentCooldown: 0,
    duration: 1200,
    projectileSpeed: 0,
    description: '炼狱之火席卷一切，超大范围持续燃烧',
  },
  [getSkillId('fire', 'time') + '_legendary']: {
    id: getSkillId('fire', 'time') + '_legendary',
    name: '永恒熔岩',
    elementRuneId: 'rune_inferno',
    effectRuneId: 'rune_eternity',
    element: 'fire',
    effect: 'time',
    damage: 30,
    range: 100,
    cooldown: 2500,
    currentCooldown: 0,
    duration: 8000,
    projectileSpeed: 0,
    description: '熔岩地面持续极长时间灼烧，寸草不生',
  },
  [getSkillId('fire', 'power') + '_legendary']: {
    id: getSkillId('fire', 'power') + '_legendary',
    name: '末日审判',
    elementRuneId: 'rune_inferno',
    effectRuneId: 'rune_annihilation',
    element: 'fire',
    effect: 'power',
    damage: 150,
    range: 80,
    cooldown: 4500,
    currentCooldown: 0,
    duration: 1000,
    projectileSpeed: 0,
    description: '召唤末日陨石，毁灭性单体伤害',
  },
  [getSkillId('fire', 'pierce') + '_legendary']: {
    id: getSkillId('fire', 'pierce') + '_legendary',
    name: '焚天裂隙',
    elementRuneId: 'rune_inferno',
    effectRuneId: 'rune_phantom',
    element: 'fire',
    effect: 'pierce',
    damage: 65,
    range: 400,
    cooldown: 2200,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 600,
    description: '撕裂虚空的焚天火焰，贯穿一切',
  },
  [getSkillId('ice', 'spread') + '_legendary']: {
    id: getSkillId('ice', 'spread') + '_legendary',
    name: '冰河纪元',
    elementRuneId: 'rune_absolute_zero',
    effectRuneId: 'rune_nova',
    element: 'ice',
    effect: 'spread',
    damage: 50,
    range: 250,
    cooldown: 3500,
    currentCooldown: 0,
    duration: 3000,
    projectileSpeed: 0,
    description: '冰河之寒覆盖全场，冻结所有敌人',
  },
  [getSkillId('ice', 'time') + '_legendary']: {
    id: getSkillId('ice', 'time') + '_legendary',
    name: '时间冻结',
    elementRuneId: 'rune_absolute_zero',
    effectRuneId: 'rune_eternity',
    element: 'ice',
    effect: 'time',
    damage: 35,
    range: 120,
    cooldown: 4000,
    currentCooldown: 0,
    duration: 6000,
    projectileSpeed: 0,
    description: '将敌人冻结在时间之中，极长时间无法行动',
  },
  [getSkillId('ice', 'power') + '_legendary']: {
    id: getSkillId('ice', 'power') + '_legendary',
    name: '零度湮灭',
    elementRuneId: 'rune_absolute_zero',
    effectRuneId: 'rune_annihilation',
    element: 'ice',
    effect: 'power',
    damage: 130,
    range: 60,
    cooldown: 3800,
    currentCooldown: 0,
    duration: 1500,
    projectileSpeed: 0,
    description: '绝对零度的毁灭一击，目标碎裂为冰晶',
  },
  [getSkillId('ice', 'pierce') + '_legendary']: {
    id: getSkillId('ice', 'pierce') + '_legendary',
    name: '极寒冰枪',
    elementRuneId: 'rune_absolute_zero',
    effectRuneId: 'rune_phantom',
    element: 'ice',
    effect: 'pierce',
    damage: 55,
    range: 450,
    cooldown: 1800,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 550,
    description: '穿越一切的极寒冰枪，冻结路径上所有敌人',
  },
  [getSkillId('thunder', 'spread') + '_legendary']: {
    id: getSkillId('thunder', 'spread') + '_legendary',
    name: '雷神降世',
    elementRuneId: 'rune_divine_thunder',
    effectRuneId: 'rune_nova',
    element: 'thunder',
    effect: 'spread',
    damage: 55,
    range: 220,
    cooldown: 2800,
    currentCooldown: 0,
    duration: 800,
    projectileSpeed: 0,
    description: '雷神之力降临，万雷齐发轰击全场',
  },
  [getSkillId('thunder', 'time') + '_legendary']: {
    id: getSkillId('thunder', 'time') + '_legendary',
    name: '永恒雷暴',
    elementRuneId: 'rune_divine_thunder',
    effectRuneId: 'rune_eternity',
    element: 'thunder',
    effect: 'time',
    damage: 35,
    range: 250,
    cooldown: 5000,
    currentCooldown: 0,
    duration: 8000,
    projectileSpeed: 0,
    description: '持续的雷霆风暴，不断打击范围内敌人',
  },
  [getSkillId('thunder', 'power') + '_legendary']: {
    id: getSkillId('thunder', 'power') + '_legendary',
    name: '万钧天罚',
    elementRuneId: 'rune_divine_thunder',
    effectRuneId: 'rune_annihilation',
    element: 'thunder',
    effect: 'power',
    damage: 180,
    range: 50,
    cooldown: 5000,
    currentCooldown: 0,
    duration: 600,
    projectileSpeed: 0,
    description: '天罚之雷的终极形态，一击必杀级伤害',
  },
  [getSkillId('thunder', 'pierce') + '_legendary']: {
    id: getSkillId('thunder', 'pierce') + '_legendary',
    name: '神雷贯穿',
    elementRuneId: 'rune_divine_thunder',
    effectRuneId: 'rune_phantom',
    element: 'thunder',
    effect: 'pierce',
    damage: 70,
    range: 500,
    cooldown: 2000,
    currentCooldown: 0,
    duration: 0,
    projectileSpeed: 700,
    description: '神雷化为贯穿之光，速度和伤害极致提升',
  },
};

export const ALL_SKILLS: Record<string, Skill> = { ...SKILLS, ...LEGENDARY_SKILLS };

export const createSkill = (elementRune: Rune, effectRune: Rune): Skill | null => {
  if (elementRune.type !== 'element' || effectRune.type !== 'effect') {
    return null;
  }
  const isLegendary = elementRune.rarity === 'legendary' || effectRune.rarity === 'legendary';
  if (isLegendary) {
    const legendarySkillId = getSkillId(elementRune.element!, effectRune.effect!) + '_legendary';
    const legendaryTemplate = LEGENDARY_SKILLS[legendarySkillId];
    if (legendaryTemplate) return { ...legendaryTemplate, currentCooldown: 0 };
  }
  const skillId = getSkillId(elementRune.element!, effectRune.effect!);
  const skillTemplate = SKILLS[skillId];
  if (!skillTemplate) return null;
  return { ...skillTemplate, currentCooldown: 0 };
};

export const getRandomRunes = (count: number, difficulty?: string): Rune[] => {
  const result: Rune[] = [];
  const pool = difficulty ? [...getRunesForDifficulty(difficulty)] : [...ALL_RUNES];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
};

export const getRandomRune = (difficulty?: string): Rune => {
  const pool = difficulty ? getRunesForDifficulty(difficulty) : ALL_RUNES;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRuneById = (id: string): Rune | undefined => {
  return ALL_RUNES.find(r => r.id === id);
};

export const getRunesByRarityAndType = (
  rarity: RuneRarity,
  type: 'element' | 'effect',
  elementOrEffect?: string
): Rune[] => {
  return ALL_RUNES.filter(r => {
    if (r.rarity !== rarity || r.type !== type) return false;
    if (type === 'element' && elementOrEffect && r.element !== elementOrEffect) return false;
    if (type === 'effect' && elementOrEffect && r.effect !== elementOrEffect) return false;
    return true;
  });
};

export const canSynthesize = (runes: Rune[]): boolean => {
  if (runes.length === 0) return false;
  const firstRune = runes[0];
  const config = RARITY_CONFIG[firstRune.rarity];
  if (config.synthesizeCount === 0) return false;
  if (runes.length !== config.synthesizeCount) return false;
  return runes.every(r =>
    r.rarity === firstRune.rarity &&
    r.type === firstRune.type &&
    (r.type === 'element' ? r.element === firstRune.element : r.effect === firstRune.effect)
  );
};

export const synthesizeRunes = (runes: Rune[]): Rune | null => {
  if (!canSynthesize(runes)) return null;
  const firstRune = runes[0];
  const nextRarity = getNextRarity(firstRune.rarity);
  if (!nextRarity) return null;
  const candidates = getRunesByRarityAndType(
    nextRarity,
    firstRune.type,
    firstRune.type === 'element' ? firstRune.element : firstRune.effect
  );
  if (candidates.length === 0) {
    const allCandidates = getRunesByRarityAndType(nextRarity, firstRune.type);
    if (allCandidates.length === 0) return null;
    return allCandidates[Math.floor(Math.random() * allCandidates.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const decomposeRune = (rune: Rune): number => {
  return RARITY_CONFIG[rune.rarity].dustValue;
};

export const getSkillWithRarityBonus = (skill: Skill, rarity1: RuneRarity, rarity2: RuneRarity): Skill => {
  const tier1 = RARITY_CONFIG[rarity1].tier;
  const tier2 = RARITY_CONFIG[rarity2].tier;
  const avgTier = (tier1 + tier2) / 2;
  const multiplier = 1 + (avgTier - 1.5) * 0.25;
  return {
    ...skill,
    damage: Math.floor(skill.damage * multiplier),
    range: Math.floor(skill.range * (1 + (avgTier - 1.5) * 0.1)),
    cooldown: Math.floor(skill.cooldown / (1 + (avgTier - 1.5) * 0.1)),
  };
};
