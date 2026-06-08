import type { Badge } from '../types/game';

export const BADGES: Badge[] = [
  {
    id: 'badge_first_challenge',
    name: '初出茅庐',
    description: '完成第一次每日挑战',
    icon: 'star',
    color: '#ffd700',
    rarity: 'common',
    requirement: '完成1次每日挑战',
  },
  {
    id: 'badge_speed_runner',
    name: '疾风迅影',
    description: '在60秒内完成每日挑战',
    icon: 'zap',
    color: '#00d2d3',
    rarity: 'rare',
    requirement: '60秒内完成挑战',
  },
  {
    id: 'badge_perfect',
    name: '完美无瑕',
    description: '不受伤完成每日挑战',
    icon: 'shield',
    color: '#ff6b6b',
    rarity: 'epic',
    requirement: '无伤完成挑战',
  },
  {
    id: 'badge_week_streak',
    name: '坚持不懈',
    description: '连续7天完成每日挑战',
    icon: 'calendar',
    color: '#5f27cd',
    rarity: 'epic',
    requirement: '连续7天完成挑战',
  },
  {
    id: 'badge_master',
    name: '地牢大师',
    description: '累计完成30次每日挑战',
    icon: 'crown',
    color: '#f368e0',
    rarity: 'legendary',
    requirement: '累计完成30次挑战',
  },
  {
    id: 'badge_collector',
    name: '宝藏猎人',
    description: '开启所有宝箱完成挑战',
    icon: 'chest',
    color: '#ffa502',
    rarity: 'rare',
    requirement: '开启所有宝箱',
  },
  {
    id: 'badge_slayer',
    name: '屠戮者',
    description: '击杀所有敌人完成挑战',
    icon: 'sword',
    color: '#e74c3c',
    rarity: 'rare',
    requirement: '击杀所有敌人',
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(b => b.id === id);
};
