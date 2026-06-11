import type { EquipmentTemplate, Equipment, EquipmentRarity, EquipmentSlotType } from '../types/game';
import { generateId } from '../game/utils/math';

export const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  {
    id: 'weapon_wooden_staff',
    name: '木杖',
    type: 'weapon',
    rarity: 'common',
    color: '#8B4513',
    icon: '🪄',
    description: '一根普通的木质法杖，是新手冒险者的入门武器',
    baseStats: [
      { type: 'attack', value: 5 },
    ],
    baseDurability: 100,
    basePrice: 50,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'weapon_iron_sword',
    name: '铁剑',
    type: 'weapon',
    rarity: 'common',
    color: '#708090',
    icon: '⚔️',
    description: '锋利的铁剑，可靠的近战武器',
    baseStats: [
      { type: 'attack', value: 8 },
    ],
    baseDurability: 120,
    basePrice: 80,
    upgradeMultiplier: 1.35,
  },
  {
    id: 'weapon_flame_blade',
    name: '烈焰之刃',
    type: 'weapon',
    rarity: 'rare',
    color: '#ff6b35',
    icon: '🔥',
    description: '燃烧着永恒火焰的魔法剑，附带火焰伤害',
    baseStats: [
      { type: 'attack', value: 15 },
      { type: 'critChance', value: 0.05 },
    ],
    baseDurability: 150,
    basePrice: 200,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'weapon_frost_staff',
    name: '寒霜法杖',
    type: 'weapon',
    rarity: 'rare',
    color: '#4ecdc4',
    icon: '❄️',
    description: '蕴含寒冰之力的法杖，能冻结敌人',
    baseStats: [
      { type: 'attack', value: 12 },
      { type: 'attackSpeed', value: 0.1 },
    ],
    baseDurability: 140,
    basePrice: 220,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'weapon_thunder_hammer',
    name: '雷霆之锤',
    type: 'weapon',
    rarity: 'epic',
    color: '#ffe66d',
    icon: '⚡',
    description: '蕴含雷电之力的战锤，每次攻击都有雷电加持',
    baseStats: [
      { type: 'attack', value: 25 },
      { type: 'critChance', value: 0.1 },
      { type: 'critDamage', value: 0.2 },
    ],
    baseDurability: 200,
    basePrice: 500,
    upgradeMultiplier: 1.45,
  },
  {
    id: 'weapon_dragon_slayer',
    name: '屠龙剑',
    type: 'weapon',
    rarity: 'legendary',
    color: '#ff4757',
    icon: '🐉',
    description: '传说中用于斩杀巨龙的神剑，拥有毁天灭地的力量',
    baseStats: [
      { type: 'attack', value: 40 },
      { type: 'critChance', value: 0.15 },
      { type: 'critDamage', value: 0.3 },
      { type: 'attackSpeed', value: 0.15 },
    ],
    baseDurability: 300,
    basePrice: 1500,
    upgradeMultiplier: 1.5,
  },
  {
    id: 'armor_cloth_robe',
    name: '布袍',
    type: 'armor',
    rarity: 'common',
    color: '#a55eea',
    icon: '👘',
    description: '轻便的布袍，提供基础防护',
    baseStats: [
      { type: 'defense', value: 3 },
      { type: 'maxHp', value: 20 },
    ],
    baseDurability: 80,
    basePrice: 40,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'armor_leather_armor',
    name: '皮甲',
    type: 'armor',
    rarity: 'common',
    color: '#cd6133',
    icon: '🦺',
    description: '结实的皮革护甲，平衡了防护和灵活性',
    baseStats: [
      { type: 'defense', value: 5 },
      { type: 'maxHp', value: 30 },
    ],
    baseDurability: 100,
    basePrice: 70,
    upgradeMultiplier: 1.35,
  },
  {
    id: 'armor_chainmail',
    name: '锁子甲',
    type: 'armor',
    rarity: 'rare',
    color: '#778ca3',
    icon: '⛓️',
    description: '由金属环扣连接而成的护甲，防护力出色',
    baseStats: [
      { type: 'defense', value: 10 },
      { type: 'maxHp', value: 50 },
    ],
    baseDurability: 150,
    basePrice: 180,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'armor_mage_robe',
    name: '法师长袍',
    type: 'armor',
    rarity: 'rare',
    color: '#a29bfe',
    icon: '🧙',
    description: '蕴含魔力的长袍，增强法术威力',
    baseStats: [
      { type: 'defense', value: 5 },
      { type: 'maxHp', value: 30 },
      { type: 'attackSpeed', value: 0.12 },
    ],
    baseDurability: 120,
    basePrice: 200,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'armor_plate_armor',
    name: '板甲',
    type: 'armor',
    rarity: 'epic',
    color: '#636e72',
    icon: '🛡️',
    description: '厚重的全身板甲，提供极强的防护能力',
    baseStats: [
      { type: 'defense', value: 18 },
      { type: 'maxHp', value: 80 },
    ],
    baseDurability: 200,
    basePrice: 450,
    upgradeMultiplier: 1.45,
  },
  {
    id: 'armor_dragon_scale',
    name: '龙鳞甲',
    type: 'armor',
    rarity: 'legendary',
    color: '#e17055',
    icon: '🐲',
    description: '由远古巨龙鳞片打造的护甲，坚不可摧',
    baseStats: [
      { type: 'defense', value: 30 },
      { type: 'maxHp', value: 120 },
      { type: 'speed', value: 0.05 },
    ],
    baseDurability: 300,
    basePrice: 1400,
    upgradeMultiplier: 1.5,
  },
  {
    id: 'accessory_copper_ring',
    name: '铜戒指',
    type: 'accessory',
    rarity: 'common',
    color: '#cd6133',
    icon: '💍',
    description: '普通的铜制戒指，略微提升属性',
    baseStats: [
      { type: 'attack', value: 2 },
      { type: 'defense', value: 1 },
    ],
    baseDurability: 60,
    basePrice: 30,
    upgradeMultiplier: 1.3,
  },
  {
    id: 'accessory_speed_boots',
    name: '疾行靴',
    type: 'accessory',
    rarity: 'common',
    color: '#00b894',
    icon: '👢',
    description: '轻便的靴子，提升移动速度',
    baseStats: [
      { type: 'speed', value: 0.1 },
    ],
    baseDurability: 80,
    basePrice: 60,
    upgradeMultiplier: 1.35,
  },
  {
    id: 'accessory_luck_charm',
    name: '幸运护符',
    type: 'accessory',
    rarity: 'rare',
    color: '#fdcb6e',
    icon: '🍀',
    description: '带来好运的护符，增加金币获取和暴击率',
    baseStats: [
      { type: 'goldBonus', value: 0.2 },
      { type: 'critChance', value: 0.08 },
    ],
    baseDurability: 100,
    basePrice: 180,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'accessory_mana_amulet',
    name: '魔力护符',
    type: 'accessory',
    rarity: 'rare',
    color: '#6c5ce7',
    icon: '📿',
    description: '蕴含魔力的护符，提升攻击速度',
    baseStats: [
      { type: 'attackSpeed', value: 0.15 },
      { type: 'attack', value: 5 },
    ],
    baseDurability: 100,
    basePrice: 200,
    upgradeMultiplier: 1.4,
  },
  {
    id: 'accessory_vampiric_ring',
    name: '吸血戒指',
    type: 'accessory',
    rarity: 'epic',
    color: '#d63031',
    icon: '🧛',
    description: '被诅咒的戒指，攻击时有几率恢复生命',
    baseStats: [
      { type: 'attack', value: 12 },
      { type: 'critChance', value: 0.1 },
      { type: 'critDamage', value: 0.15 },
    ],
    baseDurability: 120,
    basePrice: 400,
    upgradeMultiplier: 1.45,
  },
  {
    id: 'accessory_phoenix_feather',
    name: '凤凰羽毛',
    type: 'accessory',
    rarity: 'legendary',
    color: '#ff7675',
    icon: '🪶',
    description: '传说中凤凰的羽毛，拥有浴火重生的力量',
    baseStats: [
      { type: 'maxHp', value: 50 },
      { type: 'attack', value: 20 },
      { type: 'critChance', value: 0.12 },
      { type: 'critDamage', value: 0.25 },
      { type: 'speed', value: 0.08 },
    ],
    baseDurability: 200,
    basePrice: 1200,
    upgradeMultiplier: 1.5,
  },
  {
    id: 'weapon_hellblade',
    name: '地狱之刃',
    type: 'weapon',
    rarity: 'legendary',
    color: '#ff0844',
    icon: '🗡️',
    description: '【英雄/传说难度】来自深渊的魔剑，吞噬一切',
    baseStats: [
      { type: 'attack', value: 55 },
      { type: 'critChance', value: 0.18 },
      { type: 'critDamage', value: 0.4 },
      { type: 'attackSpeed', value: 0.2 },
    ],
    baseDurability: 350,
    basePrice: 2000,
    upgradeMultiplier: 1.55,
  },
  {
    id: 'armor_void_cloak',
    name: '虚空斗篷',
    type: 'armor',
    rarity: 'legendary',
    color: '#6c5ce7',
    icon: '🌑',
    description: '【英雄/传说难度】来自虚空之外的护甲，扭曲时空',
    baseStats: [
      { type: 'defense', value: 40 },
      { type: 'maxHp', value: 150 },
      { type: 'speed', value: 0.12 },
      { type: 'attackSpeed', value: 0.1 },
    ],
    baseDurability: 350,
    basePrice: 1800,
    upgradeMultiplier: 1.55,
  },
  {
    id: 'accessory_dragon_heart',
    name: '龙心坠饰',
    type: 'accessory',
    rarity: 'legendary',
    color: '#e17055',
    icon: '💎',
    description: '【英雄/传说难度】远古巨龙的心脏结晶，蕴含无穷力量',
    baseStats: [
      { type: 'maxHp', value: 80 },
      { type: 'attack', value: 30 },
      { type: 'critChance', value: 0.15 },
      { type: 'critDamage', value: 0.35 },
      { type: 'speed', value: 0.1 },
      { type: 'goldBonus', value: 0.15 },
    ],
    baseDurability: 250,
    basePrice: 2200,
    upgradeMultiplier: 1.55,
  },
];

export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#9ca3af',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

export const RARITY_NAMES: Record<EquipmentRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const RARITY_WEIGHTS: Record<EquipmentRarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
};

export const EQUIPMENT_SLOT_NAMES: Record<EquipmentSlotType, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: '饰品',
};

export const EQUIPMENT_TYPE_ICONS: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💎',
};

export const getEquipmentTemplate = (templateId: string): EquipmentTemplate | undefined => {
  return EQUIPMENT_TEMPLATES.find(t => t.id === templateId);
};

export const createEquipment = (templateId: string, level: number = 1): Equipment | null => {
  const template = getEquipmentTemplate(templateId);
  if (!template) return null;

  const levelMultiplier = Math.pow(template.upgradeMultiplier, level - 1);
  const stats = template.baseStats.map(stat => ({
    ...stat,
    value: Math.floor(stat.value * levelMultiplier * 100) / 100,
  }));

  const maxLevel = getMaxLevelForRarity(template.rarity);
  const maxDurability = Math.floor(template.baseDurability * (1 + (level - 1) * 0.1));

  return {
    instanceId: `equip_${generateId()}`,
    templateId: template.id,
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    color: template.color,
    icon: template.icon,
    description: template.description,
    stats,
    level,
    maxLevel,
    durability: maxDurability,
    maxDurability,
    price: Math.floor(template.basePrice * levelMultiplier),
  };
};

export const getMaxLevelForRarity = (rarity: EquipmentRarity): number => {
  switch (rarity) {
    case 'common': return 5;
    case 'rare': return 8;
    case 'epic': return 12;
    case 'legendary': return 15;
    default: return 5;
  }
};

export const getUpgradeCost = (equipment: Equipment): number => {
  const template = getEquipmentTemplate(equipment.templateId);
  if (!template) return Infinity;
  
  const baseCost = template.basePrice * 0.5;
  const levelMultiplier = Math.pow(1.5, equipment.level);
  return Math.floor(baseCost * levelMultiplier);
};

export const upgradeEquipment = (equipment: Equipment): Equipment | null => {
  if (equipment.level >= equipment.maxLevel) return null;
  
  const template = getEquipmentTemplate(equipment.templateId);
  if (!template) return null;

  const newLevel = equipment.level + 1;
  const levelMultiplier = Math.pow(template.upgradeMultiplier, newLevel - 1);
  const newStats = template.baseStats.map(stat => ({
    ...stat,
    value: Math.floor(stat.value * levelMultiplier * 100) / 100,
  }));

  const newMaxDurability = Math.floor(template.baseDurability * (1 + (newLevel - 1) * 0.1));

  return {
    ...equipment,
    level: newLevel,
    stats: newStats,
    maxDurability: newMaxDurability,
    durability: Math.min(equipment.durability + Math.floor(template.baseDurability * 0.1), newMaxDurability),
    price: Math.floor(template.basePrice * levelMultiplier),
  };
};

export const getRandomEquipmentTemplate = (rarity?: EquipmentRarity): EquipmentTemplate => {
  let pool = EQUIPMENT_TEMPLATES;
  
  if (rarity) {
    pool = pool.filter(t => t.rarity === rarity);
  } else {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity: EquipmentRarity = 'common';
    for (const [r, weight] of Object.entries(RARITY_WEIGHTS) as [EquipmentRarity, number][]) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = r;
        break;
      }
    }
    
    pool = EQUIPMENT_TEMPLATES.filter(t => t.rarity === selectedRarity);
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomEquipment = (level?: number, rarity?: EquipmentRarity): Equipment | null => {
  const template = getRandomEquipmentTemplate(rarity);
  const equipLevel = level || 1;
  return createEquipment(template.id, equipLevel);
};

export const getStatName = (statType: string): string => {
  const names: Record<string, string> = {
    attack: '攻击力',
    defense: '防御力',
    maxHp: '最大生命',
    speed: '移动速度',
    critChance: '暴击率',
    critDamage: '暴击伤害',
    attackSpeed: '攻击速度',
    goldBonus: '金币加成',
  };
  return names[statType] || statType;
};

export const getStatDisplayValue = (statType: string, value: number): string => {
  if (['speed', 'critChance', 'critDamage', 'attackSpeed', 'goldBonus'].includes(statType)) {
    return `+${(value * 100).toFixed(1)}%`;
  }
  return `+${value}`;
};

export const getEquipmentByType = (type: string): EquipmentTemplate[] => {
  return EQUIPMENT_TEMPLATES.filter(t => t.type === type);
};

export const generateShopEquipment = (count: number = 6): Equipment[] => {
  const shopItems: Equipment[] = [];
  const usedTemplateIds = new Set<string>();
  
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  
  while (shopItems.length < count && usedTemplateIds.size < EQUIPMENT_TEMPLATES.length) {
    let random = Math.random() * totalWeight;
    let selectedRarity: EquipmentRarity = 'common';
    
    for (const [r, weight] of Object.entries(RARITY_WEIGHTS) as [EquipmentRarity, number][]) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = r;
        break;
      }
    }
    
    const pool = EQUIPMENT_TEMPLATES.filter(t => t.rarity === selectedRarity && !usedTemplateIds.has(t.id));
    if (pool.length === 0) continue;
    
    const template = pool[Math.floor(Math.random() * pool.length)];
    const level = Math.max(1, Math.floor(Math.random() * 3) + 1);
    const equipment = createEquipment(template.id, level);
    
    if (equipment) {
      usedTemplateIds.add(template.id);
      shopItems.push(equipment);
    }
  }
  
  return shopItems;
};

export const getBuyPrice = (equipment: Equipment): number => {
  return Math.floor(equipment.price * 1.5);
};

export const getSellPrice = (equipment: Equipment): number => {
  const durabilityRatio = equipment.durability / equipment.maxDurability;
  return Math.floor(equipment.price * 0.3 * durabilityRatio);
};

export const DIFFICULTY_EXCLUSIVE_IDS = ['weapon_hellblade', 'armor_void_cloak', 'accessory_dragon_heart'];

export const getEquipmentTemplatesForDifficulty = (difficulty: string): EquipmentTemplate[] => {
  if (difficulty === 'hero' || difficulty === 'legend') {
    return EQUIPMENT_TEMPLATES;
  }
  return EQUIPMENT_TEMPLATES.filter(t => !DIFFICULTY_EXCLUSIVE_IDS.includes(t.id));
};
