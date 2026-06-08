import type { SaveData, ChallengeRecord, Potion, PotionMaterial } from '../../types/game';

const SAVE_KEY = 'rune_fox_save';

const defaultSaveData: SaveData = {
  highestLevel: 0,
  totalKills: 0,
  discoveredRunes: [],
  discoveredSkills: [],
  highScore: 0,
  talentPoints: 0,
  unlockedTalents: {},
  badges: [],
  challengeHistory: {},
  totalChallengesCompleted: 0,
  unlockedPets: ['fire_dragonling'],
  selectedPet: 'fire_dragonling',
  petSkills: {},
  equipmentInventory: [],
  equippedEquipment: {
    weapon: null,
    armor: null,
    accessory: null,
  },
  discoveredEquipment: [],
  potionInventory: [],
  materialInventory: [],
  discoveredPotions: [],
  discoveredMaterials: [],
};

export const loadSaveData = (): SaveData => {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      return { ...defaultSaveData, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load save data:', e);
  }
  return { ...defaultSaveData };
};

export const saveSaveData = (data: SaveData) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

export const updateSaveData = (updates: Partial<SaveData>) => {
  const current = loadSaveData();
  const updated = { ...current, ...updates };
  saveSaveData(updated);
  return updated;
};

export const discoverRune = (runeId: string) => {
  const data = loadSaveData();
  if (!data.discoveredRunes.includes(runeId)) {
    data.discoveredRunes.push(runeId);
    saveSaveData(data);
  }
  return data;
};

export const discoverSkill = (skillId: string) => {
  const data = loadSaveData();
  if (!data.discoveredSkills.includes(skillId)) {
    data.discoveredSkills.push(skillId);
    saveSaveData(data);
  }
  return data;
};

export const addTalentPoints = (points: number) => {
  const data = loadSaveData();
  data.talentPoints += points;
  saveSaveData(data);
  return data;
};

export const unlockTalent = (talentId: string, cost: number) => {
  const data = loadSaveData();
  if (data.talentPoints < cost) return data;
  
  data.talentPoints -= cost;
  data.unlockedTalents[talentId] = (data.unlockedTalents[talentId] || 0) + 1;
  saveSaveData(data);
  return data;
};

export const unlockBadge = (badgeId: string): SaveData => {
  const data = loadSaveData();
  if (!data.badges.includes(badgeId)) {
    data.badges.push(badgeId);
    saveSaveData(data);
  }
  return data;
};

export const hasBadge = (badgeId: string): boolean => {
  const data = loadSaveData();
  return data.badges.includes(badgeId);
};

export const saveChallengeRecord = (
  date: string,
  record: ChallengeRecord
): SaveData => {
  const data = loadSaveData();
  const existing = data.challengeHistory[date];
  
  if (existing) {
    if (record.completed && existing.bestTime) {
      record.bestTime = Math.min(existing.bestTime, record.timeSpent);
    } else if (record.completed) {
      record.bestTime = record.timeSpent;
    }
  } else if (record.completed) {
    record.bestTime = record.timeSpent;
  }
  
  data.challengeHistory[date] = { ...existing, ...record };
  
  if (record.completed && !existing?.completed) {
    data.totalChallengesCompleted += 1;
  }
  
  saveSaveData(data);
  return data;
};

export const getChallengeRecord = (date: string): ChallengeRecord | null => {
  const data = loadSaveData();
  return data.challengeHistory[date] || null;
};

export const getStreakDays = (): number => {
  const data = loadSaveData();
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = data.challengeHistory[dateStr];
    
    if (record?.completed) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
};

export const unlockPet = (petType: string): SaveData => {
  const data = loadSaveData();
  if (!data.unlockedPets.includes(petType)) {
    data.unlockedPets.push(petType);
    saveSaveData(data);
  }
  return data;
};

export const selectPet = (petType: string): SaveData => {
  const data = loadSaveData();
  if (data.unlockedPets.includes(petType)) {
    data.selectedPet = petType;
    saveSaveData(data);
  }
  return data;
};

export const hasPet = (petType: string): boolean => {
  const data = loadSaveData();
  return data.unlockedPets.includes(petType);
};

export const getSelectedPet = (): string | null => {
  const data = loadSaveData();
  return data.selectedPet;
};

export const setPetSkill = (petType: string, skillId: string): SaveData => {
  const data = loadSaveData();
  data.petSkills = {
    ...data.petSkills,
    [petType]: skillId,
  };
  saveSaveData(data);
  return data;
};

export const getPetSkill = (petType: string): string | null => {
  const data = loadSaveData();
  return data.petSkills[petType] || null;
};

import type { Equipment, EquipmentSlotType } from '../../types/game';

export const saveEquipment = (
  inventory?: Equipment[],
  equipped?: Record<EquipmentSlotType, Equipment | null>,
  newSaveData?: SaveData
): SaveData => {
  const data = newSaveData || loadSaveData();
  
  if (inventory !== undefined) {
    data.equipmentInventory = inventory;
  }
  
  if (equipped !== undefined) {
    const equippedIds: Record<string, string | null> = {};
    (Object.keys(equipped) as EquipmentSlotType[]).forEach(slot => {
      equippedIds[slot] = equipped[slot]?.instanceId || null;
    });
    data.equippedEquipment = equippedIds;
  }
  
  saveSaveData(data);
  return data;
};

export const discoverEquipment = (templateId: string): SaveData => {
  const data = loadSaveData();
  if (!data.discoveredEquipment.includes(templateId)) {
    data.discoveredEquipment.push(templateId);
    saveSaveData(data);
  }
  return data;
};

export const hasDiscoveredEquipment = (templateId: string): boolean => {
  const data = loadSaveData();
  return data.discoveredEquipment.includes(templateId);
};

export const getEquipmentInventory = (): Equipment[] => {
  const data = loadSaveData();
  return data.equipmentInventory || [];
};

export const getEquippedEquipment = (): Record<string, string | null> => {
  const data = loadSaveData();
  return data.equippedEquipment || {
    weapon: null,
    armor: null,
    accessory: null,
  };
};

export const savePotions = (
  potions?: Potion[],
  materials?: PotionMaterial[],
  newSaveData?: SaveData
): SaveData => {
  const data = newSaveData || loadSaveData();
  
  if (potions !== undefined) {
    data.potionInventory = potions;
  }
  
  if (materials !== undefined) {
    data.materialInventory = materials;
  }
  
  saveSaveData(data);
  return data;
};

export const discoverPotion = (templateId: string): SaveData => {
  const data = loadSaveData();
  if (!data.discoveredPotions.includes(templateId)) {
    data.discoveredPotions.push(templateId);
    saveSaveData(data);
  }
  return data;
};

export const discoverMaterial = (materialId: string): SaveData => {
  const data = loadSaveData();
  if (!data.discoveredMaterials.includes(materialId)) {
    data.discoveredMaterials.push(materialId);
    saveSaveData(data);
  }
  return data;
};

export const getPotionInventory = (): Potion[] => {
  const data = loadSaveData();
  return data.potionInventory || [];
};

export const getMaterialInventory = (): PotionMaterial[] => {
  const data = loadSaveData();
  return data.materialInventory || [];
};

export const addPotionToInventory = (potion: Potion): SaveData => {
  const data = loadSaveData();
  data.potionInventory = [...(data.potionInventory || []), potion];
  saveSaveData(data);
  return data;
};

export const removePotionFromInventory = (potionId: string): SaveData => {
  const data = loadSaveData();
  data.potionInventory = (data.potionInventory || []).filter(p => p.id !== potionId);
  saveSaveData(data);
  return data;
};

export const addMaterialToInventory = (material: PotionMaterial): SaveData => {
  const data = loadSaveData();
  data.materialInventory = [...(data.materialInventory || []), material];
  saveSaveData(data);
  return data;
};

export const removeMaterialFromInventory = (materialId: string, count: number = 1): SaveData => {
  const data = loadSaveData();
  let remaining = count;
  const newMaterials: PotionMaterial[] = [];
  
  for (const mat of (data.materialInventory || [])) {
    if (remaining > 0 && mat.id === materialId) {
      remaining--;
    } else {
      newMaterials.push(mat);
    }
  }
  
  data.materialInventory = newMaterials;
  saveSaveData(data);
  return data;
};

export const getMaterialCount = (materialId: string): number => {
  const data = loadSaveData();
  return (data.materialInventory || []).filter(m => m.id === materialId).length;
};
