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
}

export interface SaveData {
  highestLevel: number;
  totalKills: number;
  discoveredRunes: string[];
  discoveredSkills: string[];
  highScore: number;
}
