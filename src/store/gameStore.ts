import { create } from 'zustand';
import type { GameScene, Rune, Skill, Player, Monster, Chest, SaveData, DailyChallenge, Equipment, EquipmentSlotType, Potion, PotionMaterial, Shop, Pet, ClassType } from '../types/game';
import { loadSaveData, unlockTalent as saveUnlockTalent, saveEquipment, savePotions } from '../game/utils/storage';
import { getTalentCost, canUnlockTalent } from '../data/talents';
import { upgradeEquipment as upgradeEquip, getUpgradeCost, getEquipmentTemplate, generateShopEquipment, getBuyPrice, getSellPrice } from '../data/equipment';
import { createPotion, getPotionTemplate } from '../data/potions';

const loadEquipmentFromSaveData = (saveData: SaveData): { inventory: Equipment[]; equipped: Record<EquipmentSlotType, Equipment | null> } => {
  const inventory = saveData.equipmentInventory || [];
  const equippedIds = saveData.equippedEquipment || {};
  
  const equipped: Record<EquipmentSlotType, Equipment | null> = {
    weapon: null,
    armor: null,
    accessory: null,
  };
  
  for (const slot of ['weapon', 'armor', 'accessory'] as EquipmentSlotType[]) {
    const instanceId = equippedIds[slot];
    if (instanceId) {
      const equip = inventory.find(e => e.instanceId === instanceId);
      if (equip) {
        equipped[slot] = equip;
      }
    }
  }
  
  return { inventory, equipped };
};

interface ToastMessage {
  id: string;
  type: 'rune' | 'info' | 'success';
  title: string;
  description?: string;
  color?: string;
}

interface GameStore {
  scene: GameScene;
  selectedClass: ClassType | null;
  player: Player | null;
  monsters: Monster[];
  chests: Chest[];
  runeInventory: Rune[];
  equippedRunes: (Rune | null)[];
  activeSkills: Skill[];
  currentLevel: number;
  killCount: number;
  gold: number;
  saveData: SaveData;
  combineSlot1: Rune | null;
  combineSlot2: Rune | null;
  showRunePanel: boolean;
  showTalentTree: boolean;
  showChallengeInfo: boolean;
  showBadgePanel: boolean;
  showPetPanel: boolean;
  showEquipmentPanel: boolean;
  toasts: ToastMessage[];
  draggedRune: Rune | null;
  earnedTalentPoints: number;
  isChallengeMode: boolean;
  challenge: DailyChallenge | null;
  challengeTimeRemaining: number;
  challengeTimeSpent: number;
  challengeCompleted: boolean;
  challengeFailed: boolean;
  challengeDamageTaken: number;
  challengeIsFirstCompletion: boolean;
  challengeIsNewBestTime: boolean;
  challengePreviousBestTime: number | null;
  equipmentInventory: Equipment[];
  equippedEquipment: Record<EquipmentSlotType, Equipment | null>;
  shopEquipment: Equipment[];
  lastShopRefresh: number;
  potionInventory: Potion[];
  materialInventory: PotionMaterial[];
  potionCooldowns: Record<string, number>;
  potionBuffTimers: Record<string, number>;
  showPotionPanel: boolean;
  showShopPanel: boolean;
  currentShop: Shop | null;
  pet: Pet | null;
  
  setScene: (scene: GameScene) => void;
  setPlayer: (player: Player) => void;
  setMonsters: (monsters: Monster[]) => void;
  setChests: (chests: Chest[]) => void;
  setRuneInventory: (runes: Rune[]) => void;
  setEquippedRunes: (runes: (Rune | null)[]) => void;
  setActiveSkills: (skills: Skill[]) => void;
  setCurrentLevel: (level: number) => void;
  setKillCount: (count: number) => void;
  setGold: (gold: number) => void;
  setCombineSlot1: (rune: Rune | null) => void;
  setCombineSlot2: (rune: Rune | null) => void;
  setShowRunePanel: (show: boolean) => void;
  setShowTalentTree: (show: boolean) => void;
  setShowChallengeInfo: (show: boolean) => void;
  setShowBadgePanel: (show: boolean) => void;
  setShowPetPanel: (show: boolean) => void;
  setShowEquipmentPanel: (show: boolean) => void;
  setShowPotionPanel: (show: boolean) => void;
  setDraggedRune: (rune: Rune | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshSaveData: () => void;
  unlockTalent: (talentId: string) => void;
  updateFromEngine: (state: any) => void;
  equipItem: (equipment: Equipment) => void;
  unequipItem: (slotType: EquipmentSlotType) => void;
  upgradeEquipmentItem: (instanceId: string) => boolean;
  addEquipmentToInventory: (equipment: Equipment) => void;
  removeEquipmentFromInventory: (instanceId: string) => void;
  refreshShop: () => void;
  buyEquipment: (instanceId: string) => boolean;
  sellEquipment: (instanceId: string) => boolean;
  usePotion: (potionId: string, target?: 'player' | 'pet') => boolean;
  craftPotion: (potionTemplateId: string) => boolean;
  setPotionInventory: (potions: Potion[]) => void;
  setMaterialInventory: (materials: PotionMaterial[]) => void;
  setShowShopPanel: (show: boolean) => void;
  setCurrentShop: (shop: Shop | null) => void;
  buyShopItem: (itemId: string) => boolean;
}

export const useGameStore = create<GameStore>((set, get) => {
  const initialSaveData = loadSaveData();
  const initialEquipment = loadEquipmentFromSaveData(initialSaveData);
  
  return {
    scene: 'menu',
    selectedClass: null,
    player: null,
    monsters: [],
    chests: [],
    runeInventory: [],
    equippedRunes: [null, null, null, null],
    activeSkills: [],
    currentLevel: 1,
    killCount: 0,
    gold: 0,
    saveData: initialSaveData,
    combineSlot1: null,
    combineSlot2: null,
    showRunePanel: false,
    showTalentTree: false,
    showChallengeInfo: false,
    showBadgePanel: false,
    showPetPanel: false,
    showEquipmentPanel: false,
    toasts: [],
    draggedRune: null,
    earnedTalentPoints: 0,
    isChallengeMode: false,
    challenge: null,
    challengeTimeRemaining: 0,
    challengeTimeSpent: 0,
    challengeCompleted: false,
    challengeFailed: false,
    challengeDamageTaken: 0,
    challengeIsFirstCompletion: false,
    challengeIsNewBestTime: false,
    challengePreviousBestTime: null,
    equipmentInventory: initialEquipment.inventory,
    equippedEquipment: initialEquipment.equipped,
    shopEquipment: [],
    lastShopRefresh: 0,
    potionInventory: initialSaveData.potionInventory || [],
    materialInventory: initialSaveData.materialInventory || [],
    potionCooldowns: {},
    potionBuffTimers: {},
    showPotionPanel: false,
    showShopPanel: false,
    currentShop: null,
    pet: null,
  
  setScene: (scene) => set({ scene }),
  setPlayer: (player) => set({ player }),
  setMonsters: (monsters) => set({ monsters }),
  setChests: (chests) => set({ chests }),
  setRuneInventory: (runeInventory) => set({ runeInventory }),
  setEquippedRunes: (equippedRunes) => set({ equippedRunes }),
  setActiveSkills: (activeSkills) => set({ activeSkills }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),
  setKillCount: (killCount) => set({ killCount }),
  setGold: (gold) => set({ gold }),
  setCombineSlot1: (combineSlot1) => set({ combineSlot1 }),
  setCombineSlot2: (combineSlot2) => set({ combineSlot2 }),
  setShowRunePanel: (showRunePanel) => set({ showRunePanel }),
  setShowTalentTree: (showTalentTree) => set({ showTalentTree }),
  setShowChallengeInfo: (showChallengeInfo) => set({ showChallengeInfo }),
  setShowBadgePanel: (showBadgePanel) => set({ showBadgePanel }),
  setShowPetPanel: (showPetPanel) => set({ showPetPanel }),
  setShowEquipmentPanel: (showEquipmentPanel) => set({ showEquipmentPanel }),
  setShowPotionPanel: (showPotionPanel) => set({ showPotionPanel }),
  setPotionInventory: (potionInventory) => set({ potionInventory }),
  setMaterialInventory: (materialInventory) => set({ materialInventory }),
  setShowShopPanel: (showShopPanel) => set({ showShopPanel }),
  setCurrentShop: (currentShop) => set({ currentShop }),
  setDraggedRune: (draggedRune) => set({ draggedRune }),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
  
  refreshSaveData: () => {
    const newSaveData = loadSaveData();
    const equipmentData = loadEquipmentFromSaveData(newSaveData);
    set({ 
      saveData: newSaveData,
      equipmentInventory: equipmentData.inventory,
      equippedEquipment: equipmentData.equipped,
    });
  },
  
  unlockTalent: (talentId) => {
    const state = get();
    const { unlockedTalents, talentPoints } = state.saveData;
    
    if (!canUnlockTalent(talentId, unlockedTalents)) return;
    
    const cost = getTalentCost(talentId, unlockedTalents);
    if (talentPoints < cost) return;
    
    const newSaveData = saveUnlockTalent(talentId, cost);
    set({ saveData: newSaveData });
    
    get().addToast({
      type: 'success',
      title: '天赋升级！',
      description: `消耗 ${cost} 天赋点`,
      color: '#ffd700',
    });
  },
  
  updateFromEngine: (state) => {
    set({
      scene: state.scene,
      selectedClass: state.selectedClass || null,
      player: state.player,
      runeInventory: state.runeInventory,
      equippedRunes: state.equippedRunes,
      activeSkills: state.activeSkills,
      currentLevel: state.currentLevel,
      killCount: state.killCount,
      gold: state.gold,
      monsters: state.monsters,
      chests: state.chests,
      combineSlot1: state.combineSlot1,
      combineSlot2: state.combineSlot2,
      earnedTalentPoints: state.earnedTalentPoints || 0,
      isChallengeMode: state.isChallengeMode || false,
      challenge: state.challenge || null,
      challengeTimeRemaining: state.challengeTimeRemaining || 0,
      challengeTimeSpent: state.challengeTimeSpent || 0,
      challengeCompleted: state.challengeCompleted || false,
      challengeFailed: state.challengeFailed || false,
      challengeDamageTaken: state.challengeDamageTaken || 0,
      challengeIsFirstCompletion: state.challengeIsFirstCompletion || false,
      challengeIsNewBestTime: state.challengeIsNewBestTime || false,
      challengePreviousBestTime: state.challengePreviousBestTime ?? null,
      equipmentInventory: state.equipmentInventory || [],
      equippedEquipment: state.equippedEquipment || {
        weapon: null,
        armor: null,
        accessory: null,
      },
      potionInventory: state.potionInventory || [],
      materialInventory: state.materialInventory || [],
      potionCooldowns: state.potionCooldowns || {},
      potionBuffTimers: state.potionBuffTimers || {},
      pet: state.pet || null,
    });
    
    if (state.scene === 'gameover' || state.scene === 'victory') {
      set({ saveData: loadSaveData() });
    }
  },

  equipItem: (equipment: Equipment) => {
    const state = get();
    const slotType = equipment.type as EquipmentSlotType;
    const currentEquipped = state.equippedEquipment[slotType];
    
    const newEquipped = { ...state.equippedEquipment };
    const newInventory = [...state.equipmentInventory];
    
    if (currentEquipped) {
      newInventory.push(currentEquipped);
    }
    
    const inventoryIndex = newInventory.findIndex(e => e.instanceId === equipment.instanceId);
    if (inventoryIndex !== -1) {
      newInventory.splice(inventoryIndex, 1);
    }
    
    newEquipped[slotType] = equipment;
    
    set({
      equippedEquipment: newEquipped,
      equipmentInventory: newInventory,
    });
    
    saveEquipment(newInventory, newEquipped);
    
    state.addToast({
      type: 'success',
      title: `装备了 ${equipment.name}`,
      color: equipment.color,
    });
  },

  unequipItem: (slotType: EquipmentSlotType) => {
    const state = get();
    const equipped = state.equippedEquipment[slotType];
    
    if (!equipped) return;
    
    const newEquipped = { ...state.equippedEquipment };
    newEquipped[slotType] = null;
    
    const newInventory = [...state.equipmentInventory, equipped];
    
    set({
      equippedEquipment: newEquipped,
      equipmentInventory: newInventory,
    });
    
    saveEquipment(newInventory, newEquipped);
    
    state.addToast({
      type: 'info',
      title: `卸下了 ${equipped.name}`,
    });
  },

  upgradeEquipmentItem: (instanceId: string): boolean => {
    const state = get();
    const allEquipment = [
      ...state.equipmentInventory,
      ...Object.values(state.equippedEquipment).filter(Boolean) as Equipment[],
    ];
    
    const equipment = allEquipment.find(e => e.instanceId === instanceId);
    if (!equipment) return false;
    
    const cost = getUpgradeCost(equipment);
    if (state.saveData.talentPoints < cost) return false;
    
    const upgraded = upgradeEquip(equipment);
    if (!upgraded) return false;
    
    const newTalentPoints = state.saveData.talentPoints - cost;
    const newSaveData = { ...state.saveData, talentPoints: newTalentPoints };
    saveEquipment(undefined, undefined, newSaveData);
    
    const isEquipped = Object.values(state.equippedEquipment).some(
      e => e?.instanceId === instanceId
    );
    
    if (isEquipped) {
      const slotType = equipment.type as EquipmentSlotType;
      const newEquipped = { ...state.equippedEquipment };
      newEquipped[slotType] = upgraded;
      set({
        equippedEquipment: newEquipped,
        saveData: loadSaveData(),
      });
      saveEquipment(state.equipmentInventory, newEquipped);
    } else {
      const newInventory = state.equipmentInventory.map(e =>
        e.instanceId === instanceId ? upgraded : e
      );
      set({
        equipmentInventory: newInventory,
        saveData: loadSaveData(),
      });
      saveEquipment(newInventory, state.equippedEquipment);
    }
    
    state.addToast({
      type: 'success',
      title: `${equipment.name} 升级到 Lv.${upgraded.level}！`,
      description: `消耗 ${cost} 天赋点`,
      color: equipment.color,
    });
    
    return true;
  },

  addEquipmentToInventory: (equipment: Equipment) => {
    const state = get();
    set({
      equipmentInventory: [...state.equipmentInventory, equipment],
    });
    saveEquipment(
      [...state.equipmentInventory, equipment],
      state.equippedEquipment
    );
  },

  removeEquipmentFromInventory: (instanceId: string) => {
    const state = get();
    const newInventory = state.equipmentInventory.filter(
      e => e.instanceId !== instanceId
    );
    set({ equipmentInventory: newInventory });
    saveEquipment(newInventory, state.equippedEquipment);
  },

  refreshShop: () => {
    const shopItems = generateShopEquipment(6);
    set({ 
      shopEquipment: shopItems,
      lastShopRefresh: Date.now(),
    });
  },

  buyEquipment: (instanceId: string): boolean => {
    const state = get();
    const equipment = state.shopEquipment.find(e => e.instanceId === instanceId);
    if (!equipment) return false;

    const price = getBuyPrice(equipment);
    if (state.saveData.talentPoints < price) return false;

    const newTalentPoints = state.saveData.talentPoints - price;
    const newSaveData = { ...state.saveData, talentPoints: newTalentPoints };
    
    const newInventory = [...state.equipmentInventory, equipment];
    const newShop = state.shopEquipment.filter(e => e.instanceId !== instanceId);
    
    saveEquipment(newInventory, state.equippedEquipment, newSaveData);
    
    set({
      saveData: loadSaveData(),
      equipmentInventory: newInventory,
      shopEquipment: newShop,
    });

    state.addToast({
      type: 'success',
      title: `购买了 ${equipment.name}`,
      description: `消耗 ${price} 天赋点`,
      color: equipment.color,
    });

    return true;
  },

  sellEquipment: (instanceId: string): boolean => {
    const state = get();
    const equipment = state.equipmentInventory.find(e => e.instanceId === instanceId);
    if (!equipment) return false;

    const price = getSellPrice(equipment);
    const newTalentPoints = state.saveData.talentPoints + price;
    const newSaveData = { ...state.saveData, talentPoints: newTalentPoints };
    
    const newInventory = state.equipmentInventory.filter(e => e.instanceId !== instanceId);
    
    saveEquipment(newInventory, state.equippedEquipment, newSaveData);
    
    set({
      saveData: loadSaveData(),
      equipmentInventory: newInventory,
    });

    state.addToast({
      type: 'success',
      title: `出售了 ${equipment.name}`,
      description: `获得 ${price} 天赋点`,
      color: equipment.color,
    });

    return true;
  },

  usePotion: (potionId: string, target: 'player' | 'pet' = 'player'): boolean => {
    const { getGameEngine } = require('../game/GameEngine');
    const engine = getGameEngine();
    if (!engine) return false;
    
    const success = engine.usePotion(potionId, target);
    
    if (success) {
      const potion = engine.state.potionInventory.find(p => p.templateId === getPotionTemplate(potionId)?.id);
      const template = getPotionTemplate(potionId);
      if (template) {
        get().addToast({
          type: 'success',
          title: `使用了 ${template.name}`,
          description: template.description,
          color: template.color,
        });
      }
    }
    
    return success;
  },

  craftPotion: (potionTemplateId: string): boolean => {
    const { getGameEngine } = require('../game/GameEngine');
    const engine = getGameEngine();
    if (!engine) return false;
    
    const success = engine.craftPotion(potionTemplateId);
    
    if (success) {
      const template = getPotionTemplate(potionTemplateId);
      if (template) {
        get().addToast({
          type: 'success',
          title: `合成了 ${template.name}`,
          description: template.description,
          color: template.color,
        });
      }
    }
    
    return success;
  },

  buyShopItem: (itemId: string): boolean => {
    const { getGameEngine } = require('../game/GameEngine');
    const engine = getGameEngine();
    if (!engine) return false;
    
    const success = engine.buyShopItem(itemId);
    
    if (success) {
      set({ saveData: loadSaveData() });
    }
    
    return success;
  },
  };
});
