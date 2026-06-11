import type { DifficultyConfig, AdventureDifficulty } from '../types/game';

export const DIFFICULTY_CONFIGS: Record<AdventureDifficulty, DifficultyConfig> = {
  explorer: {
    id: 'explorer',
    name: '探险者',
    description: '轻松探索地牢，享受符文组合的乐趣。怪物较弱，符文和道具更容易获取。',
    color: '#7bed9f',
    borderColor: '#2ed573',
    icon: '🌿',
    hpMultiplier: 0.7,
    damageMultiplier: 0.6,
    countMultiplier: 0.7,
    levelMultiplierBonus: -0.1,
    goldMultiplier: 1.2,
    talentPointsMultiplier: 0.8,
    minRuneRarity: 'common',
    minEquipmentRarity: 'common',
    runeRarityBoost: 0,
    equipmentRarityBoost: 0,
  },
  adventurer: {
    id: 'adventurer',
    name: '冒险者',
    description: '标准冒险体验，需要合理搭配符文和装备才能深入地牢。',
    color: '#ffa502',
    borderColor: '#e67e22',
    icon: '⚔️',
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    countMultiplier: 1.0,
    levelMultiplierBonus: 0,
    goldMultiplier: 1.0,
    talentPointsMultiplier: 1.0,
    minRuneRarity: 'common',
    minEquipmentRarity: 'common',
    runeRarityBoost: 0,
    equipmentRarityBoost: 0,
  },
  hero: {
    id: 'hero',
    name: '英雄',
    description: '怪物更强更多，但可获取稀有和史诗符文、装备。适合经验丰富的冒险者。',
    color: '#5352ed',
    borderColor: '#3742fa',
    icon: '🛡️',
    hpMultiplier: 1.5,
    damageMultiplier: 1.4,
    countMultiplier: 1.4,
    levelMultiplierBonus: 0.2,
    goldMultiplier: 0.9,
    talentPointsMultiplier: 1.3,
    minRuneRarity: 'rare',
    minEquipmentRarity: 'rare',
    runeRarityBoost: 0.3,
    equipmentRarityBoost: 0.3,
  },
  legend: {
    id: 'legend',
    name: '传说',
    description: '极致挑战！怪物极其强大且数量众多，但传说符文和装备将在此解锁。你准备好了吗？',
    color: '#ff4757',
    borderColor: '#c0392b',
    icon: '👑',
    hpMultiplier: 2.2,
    damageMultiplier: 2.0,
    countMultiplier: 1.8,
    levelMultiplierBonus: 0.4,
    goldMultiplier: 0.8,
    talentPointsMultiplier: 1.8,
    minRuneRarity: 'rare',
    minEquipmentRarity: 'rare',
    runeRarityBoost: 0.6,
    equipmentRarityBoost: 0.6,
  },
};

export const DIFFICULTY_ORDER: AdventureDifficulty[] = ['explorer', 'adventurer', 'hero', 'legend'];

export const getDifficultyConfig = (id: AdventureDifficulty): DifficultyConfig => {
  return DIFFICULTY_CONFIGS[id];
};

export const getMonsterCount = (baseCount: number, difficulty: AdventureDifficulty): number => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return Math.floor(baseCount * config.countMultiplier);
};

export const getMonsterHpMultiplier = (baseLevelMultiplier: number, difficulty: AdventureDifficulty): number => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return (baseLevelMultiplier + config.levelMultiplierBonus) * config.hpMultiplier;
};

export const getMonsterDamageMultiplier = (difficulty: AdventureDifficulty): number => {
  return DIFFICULTY_CONFIGS[difficulty].damageMultiplier;
};

export const getGoldReward = (baseGold: number, difficulty: AdventureDifficulty): number => {
  return Math.floor(baseGold * DIFFICULTY_CONFIGS[difficulty].goldMultiplier);
};

export const getTalentPointsReward = (basePoints: number, difficulty: AdventureDifficulty): number => {
  return Math.floor(basePoints * DIFFICULTY_CONFIGS[difficulty].talentPointsMultiplier);
};
