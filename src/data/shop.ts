import type { Shop, ShopItem, Rune, Potion } from '../types/game';
import type { AdventureDifficulty } from '../types/game';
import { getRunesForDifficulty } from './runes';
import { getEquipmentTemplatesForDifficulty, createEquipment } from './equipment';
import { getRandomPotion } from './potions';
import { generateId } from '../game/utils/math';
import { GAME_CONFIG } from './config';
import { getDifficultyConfig } from './difficulty';

export const SHOPKEEPER_NAMES = [
  '神秘商人·墨',
  '流浪商人·露娜',
  '矮人工匠·铁砧',
  '精灵商人·星眸',
  '黑暗商人·影',
  '古怪炼金师·泡泡',
];

export const SHOPKEEPER_DIALOGUES: string[][] = [
  ['欢迎光临！', '看看有什么你需要的吧~', '今天的商品都是精选的哦！'],
  ['嘿，冒险者！', '要来点装备吗？', '价格公道，童叟无欺！'],
  ['呼...又是你啊。', '随便看看，别碰坏了。', '这些可都是宝贝。'],
  ['嘻嘻嘻~', '想要变得更强吗？', '买下它，你就知道了~'],
  ['远方的旅人啊...', '我这里有些好东西...', '或许能帮上你的忙。'],
  ['哇！有客人！', '快进来快进来！', '今天大减价哦！'],
];

export const getRuneBuyPrice = (rune: Rune): number => {
  const basePrices: Record<string, number> = {
    common: 30,
    rare: 80,
    epic: 200,
    legendary: 500,
  };
  return basePrices[rune.rarity] || 50;
};

export const getPotionBuyPrice = (potion: Potion): number => {
  const basePrices: Record<string, number> = {
    common: 25,
    rare: 60,
    epic: 150,
  };
  return basePrices[potion.rarity] || 40;
};

export const generateShopItems = (level: number, count: number = 6, difficulty: AdventureDifficulty = 'adventurer'): ShopItem[] => {
  const diffConfig = getDifficultyConfig(difficulty);
  const availableRunes = getRunesForDifficulty(difficulty);
  const availableEquipTemplates = getEquipmentTemplatesForDifficulty(difficulty);
  const items: ShopItem[] = [];
  const usedIds = new Set<string>();

  const itemTypes: ('rune' | 'equipment' | 'potion')[] = ['rune', 'equipment', 'potion'];

  while (items.length < count) {
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    if (type === 'rune') {
      const filteredRunes = availableRunes.filter(r => !usedIds.has(r.id));
      if (filteredRunes.length === 0) continue;

      let rune: Rune;
      if (Math.random() < diffConfig.runeRarityBoost) {
        const rareRunes = filteredRunes.filter(r => r.rarity === 'legendary' || r.rarity === 'epic');
        rune = rareRunes.length > 0 ? rareRunes[Math.floor(Math.random() * rareRunes.length)] : filteredRunes[Math.floor(Math.random() * filteredRunes.length)];
      } else {
        rune = filteredRunes[Math.floor(Math.random() * filteredRunes.length)];
      }
      usedIds.add(rune.id);

      items.push({
        id: `shop_rune_${generateId()}`,
        type: 'rune',
        item: { ...rune },
        price: getRuneBuyPrice(rune),
        sold: false,
      });
    } else if (type === 'equipment') {
      const equipLevel = Math.max(1, Math.floor(level * (0.5 + Math.random() * 0.8)));
      
      let template;
      if (Math.random() < diffConfig.equipmentRarityBoost) {
        const highRarity = availableEquipTemplates.filter(t => t.rarity === 'legendary' || t.rarity === 'epic');
        template = highRarity.length > 0 ? highRarity[Math.floor(Math.random() * highRarity.length)] : availableEquipTemplates[Math.floor(Math.random() * availableEquipTemplates.length)];
      } else {
        template = availableEquipTemplates[Math.floor(Math.random() * availableEquipTemplates.length)];
      }
      
      const equipment = createEquipment(template.id, equipLevel);
      if (!equipment) continue;
      if (usedIds.has(equipment.templateId)) continue;
      usedIds.add(equipment.templateId);

      const priceMultiplier = 1 + (level - 1) * 0.1;
      items.push({
        id: `shop_equip_${generateId()}`,
        type: 'equipment',
        item: equipment,
        price: Math.floor(equipment.price * priceMultiplier * 1.5),
        sold: false,
      });
    } else {
      const potion = getRandomPotion();
      if (!potion) continue;
      if (usedIds.has(potion.templateId)) continue;
      usedIds.add(potion.templateId);

      items.push({
        id: `shop_potion_${generateId()}`,
        type: 'potion',
        item: potion,
        price: getPotionBuyPrice(potion),
        sold: false,
      });
    }
  }

  return items;
};

export const createShop = (level: number, position: { x: number; y: number }, roomIndex: number, difficulty: AdventureDifficulty = 'adventurer'): Shop => {
  const shopkeeperIndex = Math.floor(Math.random() * SHOPKEEPER_NAMES.length);

  return {
    id: `shop_${generateId()}`,
    position: {
      x: position.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      y: position.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    },
    roomIndex,
    items: generateShopItems(level, 6, difficulty),
    shopkeeperName: SHOPKEEPER_NAMES[shopkeeperIndex],
    shopkeeperDialogue: SHOPKEEPER_DIALOGUES[shopkeeperIndex],
  };
};

export const SHOP_SPAWN_CHANCE = 0.6;
