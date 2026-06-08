import type { DailyChallenge, ChallengeGoalType, Rune } from '../types/game';
import { ALL_RUNES, ELEMENT_RUNES, EFFECT_RUNES } from './runes';

const getDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const seededRandom = (seed: number): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const pickRandom = <T>(arr: T[], random: () => number): T => {
  return arr[Math.floor(random() * arr.length)];
};

const pickNRandom = <T>(arr: T[], n: number, random: () => number): T[] => {
  const result: T[] = [];
  const pool = [...arr];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
};

const generateSeedFromDate = (dateStr: string): number => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const generateDailyChallenge = (date: Date = new Date()): DailyChallenge => {
  const dateStr = getDateString(date);
  const seed = generateSeedFromDate(dateStr);
  const random = seededRandom(seed);
  
  const dayOfYear = getDayOfYear(date);
  const difficulty = 1 + Math.floor(dayOfYear / 30) % 10;
  
  const goalTypes: ChallengeGoalType[] = ['kill_all', 'open_all_chests', 'both'];
  const goalType = pickRandom(goalTypes, random);
  
  const monsterCount = 5 + Math.floor(random() * 8) + difficulty * 2;
  const chestCount = goalType === 'open_all_chests' ? 3 + Math.floor(random() * 3) : 2 + Math.floor(random() * 2);
  
  const timeBase = monsterCount * 8 + chestCount * 15;
  const timeLimit = Math.max(60, Math.floor(timeBase * (1.2 + random() * 0.5)));
  
  const elementRune = pickRandom(ELEMENT_RUNES, random);
  const effectRuneCount = 1 + Math.floor(random() * 2);
  const effectRunes = pickNRandom(EFFECT_RUNES, effectRuneCount, random);
  
  const requiredRuneIds = [elementRune.id, ...effectRunes.map(r => r.id)];
  
  const talentPointsReward = 3 + difficulty + Math.floor(random() * 3);
  
  let badgeReward: string | undefined;
  if (dayOfYear % 7 === 0) {
    badgeReward = 'badge_week_streak';
  } else if (dayOfYear % 30 === 0) {
    badgeReward = 'badge_master';
  }
  
  return {
    id: `challenge_${dateStr}`,
    date: dateStr,
    level: difficulty,
    timeLimit,
    goalType,
    requiredRuneIds,
    monsterCount,
    chestCount,
    dungeonSeed: seed,
    talentPointsReward,
    badgeReward,
  };
};

export const getTodaysChallenge = (): DailyChallenge => {
  return generateDailyChallenge(new Date());
};

export const isTodayChallenge = (challenge: DailyChallenge): boolean => {
  const todayStr = getDateString(new Date());
  return challenge.date === todayStr;
};

export const getChallengeRunes = (challenge: DailyChallenge): Rune[] => {
  return challenge.requiredRuneIds
    .map(id => ALL_RUNES.find(r => r.id === id))
    .filter((r): r is Rune => r !== undefined);
};

export const getGoalDescription = (goalType: ChallengeGoalType): string => {
  switch (goalType) {
    case 'kill_all':
      return '击杀全部敌人';
    case 'open_all_chests':
      return '打开所有宝箱';
    case 'both':
      return '击杀全部敌人并打开所有宝箱';
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
