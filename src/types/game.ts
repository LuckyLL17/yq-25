export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TileType = 'wall' | 'floor' | 'door' | 'stairs' | 'chest';

export interface Tile {
  type: TileType;
  explored: boolean;
  visible: boolean;
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface Dungeon {
  tiles: Tile[][];
  rooms: Room[];
  width: number;
  height: number;
  level: number;
  stairsPosition: Position;
}

export type GameScene = 'menu' | 'playing' | 'gameover' | 'victory' | 'codex';

export type RuneElement = 'fire' | 'ice' | 'thunder';
export type RuneEffect = 'spread' | 'time' | 'power' | 'pierce';
export type RuneType = 'element' | 'effect';
export type RuneRarity = 'common' | 'rare' | 'epic';

export interface Rune {
  id: string;
  name: string;
  type: RuneType;
  element?: RuneElement;
  effect?: RuneEffect;
  color: string;
  rarity: RuneRarity;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  elementRuneId: string;
  effectRuneId: string;
  element: RuneElement;
  effect: RuneEffect;
  damage: number;
  range: number;
  cooldown: number;
  currentCooldown: number;
  duration: number;
  projectileSpeed: number;
  description: string;
}

export type MonsterType = 'slime' | 'bat' | 'skeleton' | 'ghost' | 'goblin';
export type AIType = 'passive' | 'aggressive' | 'patrol';

export type PetType = 'fire_dragonling' | 'ice_sprite' | 'thunder_bird' | 'shadow_cat';

export interface PetSkill {
  name: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  range: number;
  description: string;
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  position: Position;
  color: string;
  attackRange: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  skill: PetSkill;
  direction: number;
  animFrame: number;
  animTimer: number;
  isAttacking: boolean;
  attackAnimTimer: number;
  followOffset: { x: number; y: number };
}

export interface StatusEffect {
  type: 'burn' | 'frozen' | 'paralyze' | 'slow';
  duration: number;
  damage?: number;
}

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  position: Position;
  aiType: AIType;
  color: string;
  dropChance: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  statusEffects: StatusEffect[];
  direction: number;
  animFrame: number;
  animTimer: number;
}

export type ChestType = 'normal' | 'rare' | 'epic';

export interface Chest {
  id: string;
  position: Position;
  type: ChestType;
  opened: boolean;
  rewardRuneIds: string[];
}

export interface Projectile {
  id: string;
  position: Position;
  velocity: Position;
  damage: number;
  element: RuneElement;
  effect: RuneEffect;
  range: number;
  traveled: number;
  piercing: boolean;
  hitTargets: string[];
  size: number;
}

export interface Particle {
  id: string;
  position: Position;
  velocity: Position;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'explosion' | 'magic';
}

export interface DamageNumber {
  id: string;
  position: Position;
  value: number;
  color: string;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export interface Player {
  position: Position;
  hp: number;
  maxHp: number;
  speed: number;
  direction: number;
  animFrame: number;
  animTimer: number;
  isMoving: boolean;
  attackCooldown: number;
  currentAttackCooldown: number;
  invincible: number;
}

export interface GameState {
  scene: GameScene;
  player: Player;
  dungeon: Dungeon | null;
  monsters: Monster[];
  chests: Chest[];
  pet: Pet | null;
  projectiles: Projectile[];
  particles: Particle[];
  damageNumbers: DamageNumber[];
  runeInventory: Rune[];
  equippedRunes: (Rune | null)[];
  activeSkills: Skill[];
  currentLevel: number;
  killCount: number;
  gold: number;
  selectedRuneSlot: number | null;
  combineSlot1: Rune | null;
  combineSlot2: Rune | null;
  camera: Position;
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
}

export interface SaveData {
  highestLevel: number;
  totalKills: number;
  discoveredRunes: string[];
  discoveredSkills: string[];
  highScore: number;
  talentPoints: number;
  unlockedTalents: Record<string, number>;
  unlockedPets: string[];
  selectedPet: string | null;
}

export type TalentEffectType = 
  | 'maxHp' 
  | 'speed' 
  | 'damage' 
  | 'attackSpeed' 
  | 'runeDrop' 
  | 'startRunes'
  | 'fov'
  | 'goldBonus'
  | 'hpRegen'
  | 'damageReduction'
  | 'critChance'
  | 'critDamage';

export interface TalentEffect {
  type: TalentEffectType;
  value: number;
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number;
  effects: TalentEffect[];
  position: { x: number; y: number };
  requires: string[];
  branch: TalentBranchType;
}

export type TalentBranchType = 'survival' | 'attack' | 'exploration';

export interface TalentBranch {
  id: TalentBranchType;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export type ChallengeGoalType = 'kill_all' | 'open_all_chests' | 'both';

export interface DailyChallenge {
  id: string;
  date: string;
  level: number;
  timeLimit: number;
  goalType: ChallengeGoalType;
  requiredRuneIds: string[];
  monsterCount: number;
  chestCount: number;
  dungeonSeed: number;
  talentPointsReward: number;
  badgeReward?: string;
}

export interface ChallengeRecord {
  date: string;
  completed: boolean;
  timeSpent: number;
  killCount: number;
  chestsOpened: number;
  bestTime?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
}

export interface ChallengeGameState {
  isChallengeMode: boolean;
  challenge: DailyChallenge | null;
  timeRemaining: number;
  totalKillsNeeded: number;
  totalChestsNeeded: number;
  challengeCompleted: boolean;
  challengeFailed: boolean;
}

export interface SaveData {
  highestLevel: number;
  totalKills: number;
  discoveredRunes: string[];
  discoveredSkills: string[];
  highScore: number;
  talentPoints: number;
  unlockedTalents: Record<string, number>;
  badges: string[];
  challengeHistory: Record<string, ChallengeRecord>;
  bestChallengeTime?: number;
  totalChallengesCompleted: number;
  unlockedPets: string[];
  selectedPet: string | null;
}
