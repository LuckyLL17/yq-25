const SAVE_KEY = 'rune_fox_save';

const defaultSaveData = {
  highestLevel: 0,
  totalKills: 0,
  discoveredRunes: [] as string[],
  discoveredSkills: [] as string[],
  highScore: 0,
  talentPoints: 0,
  unlockedTalents: {} as Record<string, number>,
};

export const loadSaveData = () => {
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

export const saveSaveData = (data: typeof defaultSaveData) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

export const updateSaveData = (updates: Partial<typeof defaultSaveData>) => {
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
