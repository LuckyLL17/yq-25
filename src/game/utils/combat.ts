import type { RuneElement, Monster, Equipment } from '../../types/game';
import { RARITY_CONFIG } from '../../data/runes';
import { calculateTalentEffects } from '../../data/talents';
import { loadSaveData } from './storage';

export type Element = 'fire' | 'ice' | 'thunder';

export type TalentEffects = ReturnType<typeof calculateTalentEffects>;

export const ELEMENT_ADVANTAGE: Record<Element, Element> = {
  fire: 'ice',
  ice: 'thunder',
  thunder: 'fire',
};

export const ELEMENT_DISADVANTAGE: Record<Element, Element> = {
  fire: 'thunder',
  ice: 'fire',
  thunder: 'ice',
};

export const ELEMENT_NAMES: Record<Element, string> = {
  fire: '火焰',
  ice: '冰霜',
  thunder: '雷电',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ff6b35',
  ice: '#4ecdc4',
  thunder: '#ffe66d',
};

export const getElementMultiplier = (attackerElement: Element | string | undefined, defenderElement: Element | string | undefined): number => {
  if (!attackerElement || !defenderElement) return 1.0;
  
  const attacker = attackerElement as Element;
  const defender = defenderElement as Element;
  
  if (ELEMENT_ADVANTAGE[attacker] === defender) {
    return 1.5;
  }
  
  if (ELEMENT_DISADVANTAGE[attacker] === defender) {
    return 0.7;
  }
  
  return 1.0;
};

export interface CombatStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  damage: number;
  damageReduction: number;
  hpRegen: number;
  goldBonus: number;
  runeDrop: number;
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  goldBonus: number;
}

export const createEmptyEquipmentStats = (): EquipmentStats => ({
  attack: 0,
  defense: 0,
  maxHp: 0,
  speed: 0,
  critChance: 0,
  critDamage: 0,
  attackSpeed: 0,
  goldBonus: 0,
});

export const calculateEquipmentStats = (equipped: Record<string, Equipment | null>): EquipmentStats => {
  const stats = createEmptyEquipmentStats();
  const slots = ['weapon', 'armor', 'accessory'];
  
  for (const slot of slots) {
    const equip = equipped[slot];
    if (equip && equip.durability > 0) {
      for (const stat of equip.stats) {
        if (stat.type in stats) {
          (stats as any)[stat.type] += stat.value;
        }
      }
    }
  }
  
  return stats;
};

export const calculateRarityDamageMultiplier = (rune1Rarity: string, rune2Rarity: string): number => {
  const tier1 = RARITY_CONFIG[rune1Rarity as keyof typeof RARITY_CONFIG]?.tier || 1;
  const tier2 = RARITY_CONFIG[rune2Rarity as keyof typeof RARITY_CONFIG]?.tier || 1;
  const avgTier = (tier1 + tier2) / 2;
  return 1 + (avgTier - 1.5) * 0.25;
};

export const calculatePlayerCombatStats = (
  classStats: { attack: number; defense: number; maxHp: number; speed: number; critChance: number; critDamage: number; attackSpeed: number },
  equipmentStats: EquipmentStats,
  talentEffects: TalentEffects
): CombatStats => {
  const baseMaxHp = classStats.maxHp || 100;
  
  return {
    maxHp: baseMaxHp + talentEffects.maxHp + equipmentStats.maxHp,
    attack: classStats.attack,
    defense: classStats.defense,
    speed: classStats.speed * (1 + talentEffects.speed + equipmentStats.speed),
    critChance: Math.min(0.8, classStats.critChance + talentEffects.critChance + equipmentStats.critChance),
    critDamage: classStats.critDamage + talentEffects.critDamage + equipmentStats.critDamage,
    attackSpeed: classStats.attackSpeed * (1 + talentEffects.attackSpeed + equipmentStats.attackSpeed),
    damage: talentEffects.damage + (equipmentStats.attack / 100),
    damageReduction: Math.min(0.8, talentEffects.damageReduction),
    hpRegen: talentEffects.hpRegen,
    goldBonus: talentEffects.goldBonus + equipmentStats.goldBonus,
    runeDrop: talentEffects.runeDrop,
  };
};

export const calculatePlayerDamage = (
  baseDamage: number,
  combatStats: CombatStats,
  skillElement: Element | string,
  monsterElement: Element | string | undefined,
  isCrit: boolean = false,
  damageBoost: number = 0
): { damage: number; isCrit: boolean; elementMultiplier: number } => {
  let finalDamage = baseDamage;
  
  const baseDamageMultiplier = combatStats.attack * (1 + combatStats.damage);
  finalDamage = Math.floor(finalDamage * baseDamageMultiplier);
  
  const elementMultiplier = getElementMultiplier(skillElement, monsterElement);
  finalDamage = Math.floor(finalDamage * elementMultiplier);
  
  let actuallyCrit = isCrit;
  if (!isCrit && combatStats.critChance > 0) {
    if (Math.random() < combatStats.critChance) {
      actuallyCrit = true;
    }
  }
  
  if (actuallyCrit) {
    const critMultiplier = 2 + combatStats.critDamage;
    finalDamage = Math.floor(finalDamage * critMultiplier);
  }
  
  if (damageBoost > 0) {
    finalDamage = Math.floor(finalDamage * (1 + damageBoost / 100));
  }
  
  return {
    damage: Math.max(1, finalDamage),
    isCrit: actuallyCrit,
    elementMultiplier,
  };
};

export const calculateMonsterDamage = (
  baseDamage: number,
  monsterElement: Element | string | undefined,
  playerElement: Element | string | undefined,
  combatStats: CombatStats,
  hasShield: boolean = false
): number => {
  let finalDamage = baseDamage;
  
  const elementMultiplier = getElementMultiplier(monsterElement, playerElement);
  finalDamage = Math.floor(finalDamage * elementMultiplier);
  
  const classDefenseReduction = Math.min(0.5, (combatStats.defense - 1) * 0.3);
  const equipmentDefenseReduction = Math.min(0.5, 0);
  const totalDefenseReduction = Math.min(0.8, classDefenseReduction + equipmentDefenseReduction);
  finalDamage = Math.floor(finalDamage * (1 - totalDefenseReduction));
  
  finalDamage = Math.max(1, Math.floor(finalDamage * (1 - combatStats.damageReduction)));
  
  if (hasShield) {
    finalDamage = Math.max(1, Math.floor(finalDamage * 0.5));
  }
  
  return Math.max(1, finalDamage);
};

export const getLevelMultiplier = (level: number, levelMultiplierBonus: number = 0): number => {
  return 1 + (level - 1) * 0.15 + levelMultiplierBonus;
};

export const getMonsterHpForLevel = (baseHp: number, level: number, difficultyMultiplier: number = 1, levelMultiplierBonus: number = 0): number => {
  const levelMult = getLevelMultiplier(level, levelMultiplierBonus);
  return Math.floor(baseHp * levelMult * difficultyMultiplier);
};

export const getMonsterDamageForLevel = (baseDamage: number, level: number, difficultyMultiplier: number = 1, levelMultiplierBonus: number = 0): number => {
  const levelMult = getLevelMultiplier(level, levelMultiplierBonus);
  return Math.floor(baseDamage * levelMult * difficultyMultiplier);
};

export const getMonsterSpeedForLevel = (baseSpeed: number, level: number): number => {
  const speedBonus = Math.min(0.5, (level - 1) * 0.02);
  return Math.floor(baseSpeed * (1 + speedBonus));
};

export const getMonsterElementForType = (type: string): Element | undefined => {
  const elementMap: Record<string, Element> = {
    caster: 'fire',
    summoner: 'thunder',
    ice_witch: 'ice',
    fire_demon: 'fire',
    crystal_dragon: 'thunder',
    stone_golem: undefined as any,
    forest_guardian: 'ice',
    sand_pharaoh: 'fire',
    ancient_lich: 'thunder',
    swamp_hydra: 'fire',
  };
  return elementMap[type];
};
