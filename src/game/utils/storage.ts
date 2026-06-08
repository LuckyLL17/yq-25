import type { SaveData, ChallengeRecord } from '../../types/game';

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
