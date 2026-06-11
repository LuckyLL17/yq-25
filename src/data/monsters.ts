import type { Monster, MonsterType, MonsterSkill, BossType, AIType, MonsterState, Position } from '../types/game';
import { getMonsterHpForLevel, getMonsterDamageForLevel, getMonsterSpeedForLevel } from '../game/utils/combat';

let monsterIdCounter = 0;

const ARCHER_SKILLS: MonsterSkill[] = [
  {
    id: 'arrow_shot',
    name: '箭矢射击',
    damage: 8,
    range: 180,
    cooldown: 2000,
    currentCooldown: 0,
    type: 'projectile',
    projectileSpeed: 250,
  },
];

const CASTER_SKILLS: MonsterSkill[] = [
  {
    id: 'fire_bolt',
    name: '火焰弹',
    damage: 12,
    range: 200,
    cooldown: 3000,
    currentCooldown: 0,
    type: 'projectile',
    element: 'fire',
    projectileSpeed: 180,
  },
  {
    id: 'ice_nova',
    name: '冰霜新星',
    damage: 8,
    range: 80,
    cooldown: 5000,
    currentCooldown: 0,
    type: 'aoe',
    element: 'ice',
    aoeRadius: 60,
  },
];

const SUMMONER_SKILLS: MonsterSkill[] = [
  {
    id: 'dark_bolt',
    name: '暗影弹',
    damage: 6,
    range: 160,
    cooldown: 3000,
    currentCooldown: 0,
    type: 'projectile',
    element: 'thunder',
    projectileSpeed: 150,
  },
  {
    id: 'raise_minion',
    name: '召唤仆从',
    damage: 0,
    range: 100,
    cooldown: 8000,
    currentCooldown: 0,
    type: 'summon',
    summonType: 'skeleton',
    summonCount: 2,
  },
];

const HEALER_SKILLS: MonsterSkill[] = [
  {
    id: 'holy_bolt',
    name: '圣光弹',
    damage: 5,
    range: 140,
    cooldown: 2500,
    currentCooldown: 0,
    type: 'projectile',
    projectileSpeed: 160,
  },
  {
    id: 'heal_ally',
    name: '治疗术',
    damage: 0,
    range: 120,
    cooldown: 5000,
    currentCooldown: 0,
    type: 'heal',
    healPercent: 0.3,
  },
];

export const MONSTER_TEMPLATES: Record<MonsterType, {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  aiType: AIType;
  color: string;
  dropChance: number;
  skills: MonsterSkill[];
  detectRange: number;
  attackRange: number;
  fleeThreshold: number;
  maxSummons?: number;
  element?: 'fire' | 'ice' | 'thunder';
}> = {
  slime: {
    name: '史莱姆',
    hp: 30,
    damage: 5,
    speed: 40,
    aiType: 'passive',
    color: '#7bed9f',
    dropChance: 0.2,
    skills: [],
    detectRange: 120,
    attackRange: 30,
    fleeThreshold: 0,
  },
  bat: {
    name: '蝙蝠',
    hp: 20,
    damage: 8,
    speed: 80,
    aiType: 'aggressive',
    color: '#747d8c',
    dropChance: 0.25,
    skills: [],
    detectRange: 160,
    attackRange: 30,
    fleeThreshold: 0,
  },
  skeleton: {
    name: '骷髅兵',
    hp: 50,
    damage: 12,
    speed: 50,
    aiType: 'aggressive',
    color: '#dfe4ea',
    dropChance: 0.35,
    skills: [],
    detectRange: 150,
    attackRange: 30,
    fleeThreshold: 0,
  },
  ghost: {
    name: '幽灵',
    hp: 35,
    damage: 15,
    speed: 60,
    aiType: 'aggressive',
    color: '#a29bfe',
    dropChance: 0.4,
    skills: [],
    detectRange: 150,
    attackRange: 30,
    fleeThreshold: 0,
  },
  goblin: {
    name: '哥布林',
    hp: 45,
    damage: 10,
    speed: 55,
    aiType: 'patrol',
    color: '#2ed573',
    dropChance: 0.3,
    skills: [],
    detectRange: 140,
    attackRange: 30,
    fleeThreshold: 0,
  },
  archer: {
    name: '骷髅射手',
    hp: 35,
    damage: 6,
    speed: 45,
    aiType: 'ranged',
    color: '#c8d6e5',
    dropChance: 0.35,
    skills: ARCHER_SKILLS.map(s => ({ ...s })),
    detectRange: 200,
    attackRange: 180,
    fleeThreshold: 0.3,
  },
  caster: {
    name: '暗影法师',
    hp: 30,
    damage: 4,
    speed: 35,
    aiType: 'caster',
    color: '#6c5ce7',
    dropChance: 0.45,
    skills: CASTER_SKILLS.map(s => ({ ...s })),
    detectRange: 220,
    attackRange: 200,
    fleeThreshold: 0.25,
    element: 'fire',
  },
  summoner: {
    name: '亡灵召唤师',
    hp: 40,
    damage: 3,
    speed: 30,
    aiType: 'summoner',
    color: '#e056a0',
    dropChance: 0.5,
    skills: SUMMONER_SKILLS.map(s => ({ ...s })),
    detectRange: 180,
    attackRange: 160,
    fleeThreshold: 0.2,
    maxSummons: 4,
    element: 'thunder',
  },
  healer: {
    name: '暗黑牧师',
    hp: 35,
    damage: 4,
    speed: 40,
    aiType: 'healer',
    color: '#fdcb6e',
    dropChance: 0.45,
    skills: HEALER_SKILLS.map(s => ({ ...s })),
    detectRange: 180,
    attackRange: 140,
    fleeThreshold: 0.3,
  },
};

export const BOSS_TEMPLATES: Record<BossType, {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  color: string;
  dropChance: number;
  skills: MonsterSkill[];
  detectRange: number;
  attackRange: number;
  element?: 'fire' | 'ice' | 'thunder';
}> = {
  stone_golem: {
    name: '石之魔像',
    hp: 300,
    damage: 20,
    speed: 30,
    color: '#636e72',
    dropChance: 1.0,
    detectRange: 200,
    attackRange: 40,
    skills: [
      { id: 'golem_slam', name: '大地震击', damage: 25, range: 60, cooldown: 4000, currentCooldown: 0, type: 'aoe', aoeRadius: 70 },
      { id: 'golem_boulder', name: '巨石投掷', damage: 18, range: 200, cooldown: 5000, currentCooldown: 0, type: 'projectile', projectileSpeed: 200 },
    ],
  },
  forest_guardian: {
    name: '森林守护者',
    hp: 350,
    damage: 18,
    speed: 35,
    color: '#27ae60',
    dropChance: 1.0,
    detectRange: 220,
    attackRange: 50,
    element: 'ice',
    skills: [
      { id: 'root_bind', name: '根须缠绕', damage: 10, range: 150, cooldown: 6000, currentCooldown: 0, type: 'projectile', element: 'ice', projectileSpeed: 120 },
      { id: 'nature_wrath', name: '自然之怒', damage: 20, range: 80, cooldown: 5000, currentCooldown: 0, type: 'aoe', element: 'fire', aoeRadius: 80 },
      { id: 'summon_treant', name: '召唤树人', damage: 0, range: 100, cooldown: 10000, currentCooldown: 0, type: 'summon', summonType: 'goblin', summonCount: 2 },
    ],
  },
  ice_witch: {
    name: '冰霜女巫',
    hp: 280,
    damage: 22,
    speed: 40,
    color: '#74b9ff',
    dropChance: 1.0,
    detectRange: 250,
    attackRange: 200,
    element: 'ice',
    skills: [
      { id: 'ice_lance', name: '冰枪术', damage: 20, range: 220, cooldown: 2500, currentCooldown: 0, type: 'projectile', element: 'ice', projectileSpeed: 280 },
      { id: 'blizzard', name: '暴风雪', damage: 15, range: 100, cooldown: 6000, currentCooldown: 0, type: 'aoe', element: 'ice', aoeRadius: 90 },
      { id: 'frost_nova', name: '冰霜新星', damage: 12, range: 60, cooldown: 4000, currentCooldown: 0, type: 'aoe', element: 'ice', aoeRadius: 60 },
    ],
  },
  fire_demon: {
    name: '炎魔',
    hp: 400,
    damage: 25,
    speed: 45,
    color: '#d63031',
    dropChance: 1.0,
    detectRange: 230,
    attackRange: 50,
    element: 'fire',
    skills: [
      { id: 'fireball', name: '火球术', damage: 22, range: 200, cooldown: 3000, currentCooldown: 0, type: 'projectile', element: 'fire', projectileSpeed: 250 },
      { id: 'inferno', name: '炼狱', damage: 30, range: 80, cooldown: 7000, currentCooldown: 0, type: 'aoe', element: 'fire', aoeRadius: 90 },
      { id: 'flame_breath', name: '烈焰吐息', damage: 18, range: 120, cooldown: 4000, currentCooldown: 0, type: 'projectile', element: 'fire', projectileSpeed: 350 },
    ],
  },
  sand_pharaoh: {
    name: '沙漠法老',
    hp: 380,
    damage: 20,
    speed: 38,
    color: '#f39c12',
    dropChance: 1.0,
    detectRange: 220,
    attackRange: 180,
    element: 'fire',
    skills: [
      { id: 'sand_storm', name: '沙暴', damage: 15, range: 100, cooldown: 5000, currentCooldown: 0, type: 'aoe', aoeRadius: 80 },
      { id: 'scarab_swarm', name: '圣甲虫群', damage: 12, range: 180, cooldown: 4000, currentCooldown: 0, type: 'projectile', projectileSpeed: 200 },
      { id: 'mummy_curse', name: '木乃伊诅咒', damage: 0, range: 120, cooldown: 8000, currentCooldown: 0, type: 'summon', summonType: 'skeleton', summonCount: 3 },
    ],
  },
  crystal_dragon: {
    name: '水晶龙',
    hp: 500,
    damage: 28,
    speed: 50,
    color: '#a29bfe',
    dropChance: 1.0,
    detectRange: 250,
    attackRange: 60,
    element: 'thunder',
    skills: [
      { id: 'crystal_breath', name: '水晶吐息', damage: 25, range: 150, cooldown: 3500, currentCooldown: 0, type: 'projectile', element: 'thunder', projectileSpeed: 300 },
      { id: 'prismatic_burst', name: '棱彩爆发', damage: 20, range: 90, cooldown: 5000, currentCooldown: 0, type: 'aoe', element: 'thunder', aoeRadius: 85 },
      { id: 'crystal_shard', name: '水晶碎片', damage: 15, range: 200, cooldown: 3000, currentCooldown: 0, type: 'projectile', element: 'ice', projectileSpeed: 250 },
    ],
  },
  ancient_lich: {
    name: '远古巫妖',
    hp: 350,
    damage: 30,
    speed: 32,
    color: '#6c5ce7',
    dropChance: 1.0,
    detectRange: 260,
    attackRange: 200,
    element: 'thunder',
    skills: [
      { id: 'death_ray', name: '死亡射线', damage: 28, range: 230, cooldown: 3000, currentCooldown: 0, type: 'projectile', element: 'thunder', projectileSpeed: 320 },
      { id: 'soul_drain', name: '灵魂汲取', damage: 20, range: 80, cooldown: 6000, currentCooldown: 0, type: 'aoe', aoeRadius: 70 },
      { id: 'raise_dead', name: '亡灵复苏', damage: 0, range: 120, cooldown: 10000, currentCooldown: 0, type: 'summon', summonType: 'skeleton', summonCount: 4 },
      { id: 'lich_heal', name: '巫妖再生', damage: 0, range: 0, cooldown: 12000, currentCooldown: 0, type: 'heal', healPercent: 0.25 },
    ],
  },
  swamp_hydra: {
    name: '沼泽九头蛇',
    hp: 450,
    damage: 24,
    speed: 42,
    color: '#2ecc71',
    dropChance: 1.0,
    detectRange: 200,
    attackRange: 50,
    element: 'fire',
    skills: [
      { id: 'poison_spit', name: '毒液喷射', damage: 18, range: 160, cooldown: 3000, currentCooldown: 0, type: 'projectile', element: 'fire', projectileSpeed: 220 },
      { id: 'acid_pool', name: '酸液池', damage: 22, range: 80, cooldown: 5000, currentCooldown: 0, type: 'aoe', aoeRadius: 75 },
      { id: 'hydra_regen', name: '九头蛇再生', damage: 0, range: 0, cooldown: 10000, currentCooldown: 0, type: 'heal', healPercent: 0.2 },
    ],
  },
};

const cloneSkills = (skills: MonsterSkill[]): MonsterSkill[] =>
  skills.map(s => ({ ...s, currentCooldown: Math.random() * s.cooldown }));

const getInitialState = (aiType: AIType): MonsterState => {
  if (aiType === 'passive') return 'idle';
  if (aiType === 'patrol') return 'idle';
  return 'idle';
};

export const createMonster = (
  type: MonsterType,
  position: Position,
  level: number = 1,
  difficultyHpMultiplier: number = 1,
  difficultyDamageMultiplier: number = 1,
  levelMultiplierBonus: number = 0
): Monster => {
  const template = MONSTER_TEMPLATES[type];
  monsterIdCounter++;
  const hp = getMonsterHpForLevel(template.hp, level, difficultyHpMultiplier, levelMultiplierBonus);
  const damage = getMonsterDamageForLevel(template.damage, level, difficultyDamageMultiplier, levelMultiplierBonus);
  const speed = getMonsterSpeedForLevel(template.speed, level);
  return {
    id: `monster_${monsterIdCounter}_${Date.now()}`,
    name: template.name,
    type,
    hp,
    maxHp: hp,
    damage,
    speed,
    position: { ...position },
    aiType: template.aiType,
    state: getInitialState(template.aiType),
    color: template.color,
    dropChance: template.dropChance,
    attackCooldown: 1000,
    currentAttackCooldown: 0,
    statusEffects: [],
    direction: Math.random() < 0.5 ? -1 : 1,
    animFrame: 0,
    animTimer: 0,
    isBoss: false,
    skills: cloneSkills(template.skills),
    detectRange: template.detectRange,
    attackRange: template.attackRange,
    stateTimer: 0,
    summonCount: 0,
    maxSummons: (template as any).maxSummons || 0,
    fleeThreshold: template.fleeThreshold,
    stateCooldown: 0,
    element: template.element,
  };
};

export const createBoss = (
  bossType: BossType,
  position: Position,
  level: number = 1,
  difficultyHpMultiplier: number = 1,
  difficultyDamageMultiplier: number = 1,
  levelMultiplierBonus: number = 0
): Monster => {
  const template = BOSS_TEMPLATES[bossType];
  monsterIdCounter++;
  const hp = getMonsterHpForLevel(template.hp, level, difficultyHpMultiplier, levelMultiplierBonus);
  const damage = getMonsterDamageForLevel(template.damage, level, difficultyDamageMultiplier, levelMultiplierBonus);
  const speed = getMonsterSpeedForLevel(template.speed, level);
  return {
    id: `boss_${monsterIdCounter}_${Date.now()}`,
    name: template.name,
    type: 'skeleton',
    bossType,
    hp,
    maxHp: hp,
    damage,
    speed,
    position: { ...position },
    aiType: 'boss',
    state: 'idle',
    color: template.color,
    dropChance: template.dropChance,
    attackCooldown: 1500,
    currentAttackCooldown: 0,
    statusEffects: [],
    direction: 1,
    animFrame: 0,
    animTimer: 0,
    isBoss: true,
    skills: cloneSkills(template.skills),
    detectRange: template.detectRange,
    attackRange: template.attackRange,
    stateTimer: 0,
    summonCount: 0,
    maxSummons: 6,
    fleeThreshold: 0,
    stateCooldown: 0,
    element: template.element,
  };
};

export const getRandomMonsterType = (level: number): MonsterType => {
  const types: MonsterType[] = ['slime', 'bat', 'skeleton', 'ghost', 'goblin', 'archer', 'caster', 'summoner', 'healer'];
  const weights = [
    Math.max(0, 5 - level),
    Math.max(1, 4 - level * 0.5),
    level * 0.8,
    level * 0.5,
    level * 0.6,
    level * 0.4,
    level * 0.3,
    Math.max(0, level * 0.2 - 0.5),
    Math.max(0, level * 0.25 - 0.5),
  ];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) return types[i];
  }
  return types[0];
};

export const getBossForLevel = (level: number): BossType => {
  const bosses: BossType[] = ['stone_golem', 'forest_guardian', 'ice_witch', 'fire_demon', 'sand_pharaoh', 'crystal_dragon', 'ancient_lich', 'swamp_hydra'];
  const index = Math.floor((level - 1) % bosses.length);
  return bosses[index];
};
