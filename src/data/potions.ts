import type { PotionTemplate, PotionMaterial, PotionRecipe, Potion, PotionRarity } from '../types/game';
import { generateId } from '../game/utils/math';

export const MATERIAL_TEMPLATES: PotionMaterial[] = [
  {
    id: 'mat_health_herb',
    name: '生命草',
    type: 'herb',
    color: '#7bed9f',
    icon: '🌿',
    description: '散发着淡淡清香的草药，具有恢复生命的功效',
    rarity: 'common',
  },
  {
    id: 'mat_mana_flower',
    name: '魔力花',
    type: 'flower',
    color: '#a29bfe',
    icon: '🌸',
    description: '蕴含魔力的神秘花朵，花瓣闪烁着微光',
    rarity: 'common',
  },
  {
    id: 'mat_fire_crystal',
    name: '火焰水晶',
    type: 'crystal',
    color: '#ff6b35',
    icon: '💎',
    description: '内部燃烧着火焰的水晶，蕴含强大能量',
    rarity: 'rare',
  },
  {
    id: 'mat_ice_mushroom',
    name: '冰霜蘑菇',
    type: 'mushroom',
    color: '#4ecdc4',
    icon: '🍄',
    description: '生长在寒冷地带的奇异蘑菇，触感冰凉',
    rarity: 'common',
  },
  {
    id: 'mat_thunder_essence',
    name: '雷电精华',
    type: 'essence',
    color: '#ffe66d',
    icon: '⚡',
    description: '从雷暴中凝聚的能量精华，噼啪作响',
    rarity: 'rare',
  },
  {
    id: 'mat_bone_dust',
    name: '骨粉',
    type: 'bone',
    color: '#dfe4ea',
    icon: '🦴',
    description: '研磨精细的骨头粉末，是炼制药水的基础材料',
    rarity: 'common',
  },
  {
    id: 'mat_shadow_herb',
    name: '暗影草',
    type: 'herb',
    color: '#57606f',
    icon: '🌱',
    description: '生长在阴暗处的药草，能增强防御力',
    rarity: 'rare',
  },
  {
    id: 'mat_speed_flower',
    name: '疾风花',
    type: 'flower',
    color: '#70a1ff',
    icon: '🌺',
    description: '花瓣轻盈如风，能提升移动速度',
    rarity: 'rare',
  },
  {
    id: 'mat_pet_essence',
    name: '宠物精华',
    type: 'essence',
    color: '#ff6b81',
    icon: '💖',
    description: '蕴含生命能量的精华，对宠物有显著疗效',
    rarity: 'epic',
  },
  {
    id: 'mat_golden_essence',
    name: '黄金精华',
    type: 'essence',
    color: '#ffd700',
    icon: '✨',
    description: '极其稀有的精华，能大幅增强药水效果',
    rarity: 'epic',
  },
];

export const POTION_TEMPLATES: PotionTemplate[] = [
  {
    id: 'potion_health_small',
    name: '小型生命药水',
    type: 'health',
    color: '#ff6b6b',
    icon: '🧪',
    description: '恢复30点生命值',
    rarity: 'common',
    value: 30,
    cooldown: 5000,
  },
  {
    id: 'potion_health_medium',
    name: '中型生命药水',
    type: 'health',
    color: '#ee5253',
    icon: '🧪',
    description: '恢复60点生命值',
    rarity: 'rare',
    value: 60,
    cooldown: 8000,
  },
  {
    id: 'potion_health_large',
    name: '大型生命药水',
    type: 'health',
    color: '#c0392b',
    icon: '🧪',
    description: '恢复100点生命值',
    rarity: 'epic',
    value: 100,
    cooldown: 12000,
  },
  {
    id: 'potion_attack',
    name: '力量药水',
    type: 'attack',
    color: '#ff9f43',
    icon: '⚔️',
    description: '15秒内攻击力提升30%',
    rarity: 'rare',
    value: 30,
    duration: 15000,
    cooldown: 30000,
  },
  {
    id: 'potion_defense',
    name: '铁壁药水',
    type: 'defense',
    color: '#54a0ff',
    icon: '🛡️',
    description: '15秒内受到伤害减少30%',
    rarity: 'rare',
    value: 30,
    duration: 15000,
    cooldown: 30000,
  },
  {
    id: 'potion_speed',
    name: '疾风药水',
    type: 'speed',
    color: '#5f27cd',
    icon: '💨',
    description: '10秒内移动速度提升50%',
    rarity: 'rare',
    value: 50,
    duration: 10000,
    cooldown: 25000,
  },
  {
    id: 'potion_pet_heal',
    name: '宠物治疗药水',
    type: 'heal_pet',
    color: '#ff6b81',
    icon: '🐾',
    description: '恢复宠物50%最大生命值',
    rarity: 'rare',
    value: 50,
    cooldown: 10000,
  },
];

export const POTION_RECIPES: PotionRecipe[] = [
  {
    id: 'recipe_health_small',
    resultPotionId: 'potion_health_small',
    materials: [
      { materialId: 'mat_health_herb', count: 2 },
      { materialId: 'mat_bone_dust', count: 1 },
    ],
  },
  {
    id: 'recipe_health_medium',
    resultPotionId: 'potion_health_medium',
    materials: [
      { materialId: 'mat_health_herb', count: 3 },
      { materialId: 'mat_bone_dust', count: 2 },
      { materialId: 'mat_ice_mushroom', count: 1 },
    ],
  },
  {
    id: 'recipe_health_large',
    resultPotionId: 'potion_health_large',
    materials: [
      { materialId: 'mat_health_herb', count: 5 },
      { materialId: 'mat_golden_essence', count: 1 },
      { materialId: 'mat_bone_dust', count: 3 },
    ],
  },
  {
    id: 'recipe_attack',
    resultPotionId: 'potion_attack',
    materials: [
      { materialId: 'mat_fire_crystal', count: 1 },
      { materialId: 'mat_bone_dust', count: 2 },
      { materialId: 'mat_thunder_essence', count: 1 },
    ],
  },
  {
    id: 'recipe_defense',
    resultPotionId: 'potion_defense',
    materials: [
      { materialId: 'mat_shadow_herb', count: 2 },
      { materialId: 'mat_ice_mushroom', count: 2 },
      { materialId: 'mat_bone_dust', count: 1 },
    ],
  },
  {
    id: 'recipe_speed',
    resultPotionId: 'potion_speed',
    materials: [
      { materialId: 'mat_speed_flower', count: 2 },
      { materialId: 'mat_thunder_essence', count: 1 },
      { materialId: 'mat_bone_dust', count: 1 },
    ],
  },
  {
    id: 'recipe_pet_heal',
    resultPotionId: 'potion_pet_heal',
    materials: [
      { materialId: 'mat_pet_essence', count: 1 },
      { materialId: 'mat_health_herb', count: 3 },
      { materialId: 'mat_mana_flower', count: 2 },
    ],
  },
];

export const getPotionTemplate = (templateId: string): PotionTemplate | undefined => {
  return POTION_TEMPLATES.find(p => p.id === templateId);
};

export const getMaterialTemplate = (materialId: string): PotionMaterial | undefined => {
  return MATERIAL_TEMPLATES.find(m => m.id === materialId);
};

export const getRecipeByPotionId = (potionId: string): PotionRecipe | undefined => {
  return POTION_RECIPES.find(r => r.resultPotionId === potionId);
};

export const createPotion = (templateId: string): Potion | null => {
  const template = getPotionTemplate(templateId);
  if (!template) return null;
  
  return {
    id: `potion_${generateId()}`,
    templateId: template.id,
    name: template.name,
    type: template.type,
    color: template.color,
    icon: template.icon,
    description: template.description,
    rarity: template.rarity,
    value: template.value,
    duration: template.duration,
    cooldown: template.cooldown,
    currentCooldown: 0,
  };
};

export const createMaterial = (materialId: string): PotionMaterial | null => {
  const template = getMaterialTemplate(materialId);
  if (!template) return null;
  
  return { ...template };
};

export const getRandomMaterial = (rarity?: PotionRarity): PotionMaterial | null => {
  let materials = MATERIAL_TEMPLATES;
  
  if (rarity) {
    materials = materials.filter(m => m.rarity === rarity);
  }
  
  if (materials.length === 0) return null;
  
  const template = materials[Math.floor(Math.random() * materials.length)];
  return createMaterial(template.id);
};

export const getRandomPotion = (rarity?: PotionRarity): Potion | null => {
  let potions = POTION_TEMPLATES;
  
  if (rarity) {
    potions = potions.filter(p => p.rarity === rarity);
  }
  
  if (potions.length === 0) return null;
  
  const template = potions[Math.floor(Math.random() * potions.length)];
  return createPotion(template.id);
};
