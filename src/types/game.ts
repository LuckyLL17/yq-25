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

export type TileType = 'wall' | 'floor' | 'door' | 'stairs' | 'chest' | 'decoration' | 'pillar' | 'torch' | 'water' | 'lava';

export type RoomShape = 'rectangle' | 'circle' | 'hexagon' | 'irregular';

export type DecorationType = 'torch' | 'pillar' | 'skull' | 'altar' | 'crate' | 'barrel' | 'bones' | 'cobweb' | 'crystal' | 'rune_stone' | 'roots' | 'mushroom' | 'vines' | 'icicle';

export type CorridorStyle = 'straight' | 'zigzag' | 'curved' | 'wide' | 'branching';

export type DungeonTheme = 'stone' | 'forest' | 'ice' | 'fire' | 'desert' | 'crystal' | 'ruins' | 'swamp';

export interface Tile {
  type: TileType;
  explored: boolean;
  visible: boolean;
  decoration?: DecorationType;
  variant?: number;
}

export interface Decoration {
  id: string;
  type: DecorationType;
  position: Position;
  tileX: number;
  tileY: number;
  variant: number;
  interactable: boolean;
  glowColor?: string;
}

export interface ThemeColors {
  wall: string;
  wallDark: string;
  wallLight: string;
  floor: string;
  floorAlt: string;
  accent: string;
}

export interface ThemeConfig {
  id: DungeonTheme;
  name: string;
  colors: ThemeColors;
  decorationWeights: Partial<Record<DecorationType, number>>;
  hasHazard: boolean;
  hazardType?: 'water' | 'lava';
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  shape: RoomShape;
  rotation?: number;
}

export type ShopItemType = 'rune' | 'equipment' | 'potion';

export interface ShopItem {
  id: string;
  type: ShopItemType;
  item: Rune | Equipment | Potion;
  price: number;
  sold: boolean;
}

export interface Shop {
  id: string;
  position: Position;
  roomIndex: number;
  items: ShopItem[];
  shopkeeperName: string;
  shopkeeperDialogue: string[];
}

export interface Dungeon {
  tiles: Tile[][];
  rooms: Room[];
  width: number;
  height: number;
  level: number;
  stairsPosition: Position;
  shop: Shop | null;
  theme: DungeonTheme;
  themeConfig: ThemeConfig;
  decorations: Decoration[];
  corridorStyle: CorridorStyle;
}

export type GameScene = 'menu' | 'class_select' | 'difficulty_select' | 'playing' | 'gameover' | 'victory' | 'codex';

export type AdventureDifficulty = 'explorer' | 'adventurer' | 'hero' | 'legend';

export interface DifficultyConfig {
  id: AdventureDifficulty;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  icon: string;
  hpMultiplier: number;
  damageMultiplier: number;
  countMultiplier: number;
  levelMultiplierBonus: number;
  goldMultiplier: number;
  talentPointsMultiplier: number;
  minRuneRarity: RuneRarity;
  minEquipmentRarity: EquipmentRarity;
  runeRarityBoost: number;
  equipmentRarityBoost: number;
}

export type ClassType = 'fire_mage' | 'frost_warlock' | 'thunder_assassin' | 'nature_guardian';

export interface ClassStats {
  maxHp: number;
  speed: number;
  attack: number;
  defense: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
}

export interface PlayerClass {
  id: ClassType;
  name: string;
  description: string;
  playStyle: string;
  color: string;
  icon: string;
  stats: ClassStats;
  startingRuneIds: string[];
  exclusiveRuneIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export type RuneElement = 'fire' | 'ice' | 'thunder';
export type RuneEffect = 'spread' | 'time' | 'power' | 'pierce';
export type RuneType = 'element' | 'effect';
export type RuneRarity = 'common' | 'rare' | 'epic' | 'legendary';

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

export type EquipmentType = 'weapon' | 'armor' | 'accessory';
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type EquipmentStatType = 
  | 'attack' 
  | 'defense' 
  | 'maxHp' 
  | 'speed' 
  | 'critChance' 
  | 'critDamage'
  | 'attackSpeed'
  | 'goldBonus';

export interface EquipmentStat {
  type: EquipmentStatType;
  value: number;
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  color: string;
  icon: string;
  description: string;
  baseStats: EquipmentStat[];
  baseDurability: number;
  basePrice: number;
  upgradeMultiplier: number;
}

export interface Equipment {
  instanceId: string;
  templateId: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  color: string;
  icon: string;
  description: string;
  stats: EquipmentStat[];
  level: number;
  maxLevel: number;
  durability: number;
  maxDurability: number;
  price: number;
}

export type EquipmentSlotType = 'weapon' | 'armor' | 'accessory';

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

export type MonsterType = 'slime' | 'bat' | 'skeleton' | 'ghost' | 'goblin' | 'archer' | 'caster' | 'summoner' | 'healer';
export type BossType = 'stone_golem' | 'forest_guardian' | 'ice_witch' | 'fire_demon' | 'sand_pharaoh' | 'crystal_dragon' | 'ancient_lich' | 'swamp_hydra';
export type AIType = 'passive' | 'aggressive' | 'patrol' | 'ranged' | 'caster' | 'summoner' | 'healer' | 'boss';
export type MonsterState = 'idle' | 'chase' | 'attack' | 'flee' | 'cast' | 'heal' | 'summon';

export interface MonsterSkill {
  id: string;
  name: string;
  damage: number;
  range: number;
  cooldown: number;
  currentCooldown: number;
  type: 'projectile' | 'aoe' | 'summon' | 'heal' | 'buff';
  element?: 'fire' | 'ice' | 'thunder';
  projectileSpeed?: number;
  aoeRadius?: number;
  summonType?: MonsterType;
  summonCount?: number;
  healPercent?: number;
}

export interface MonsterProjectile {
  id: string;
  position: Position;
  velocity: Position;
  damage: number;
  element?: 'fire' | 'ice' | 'thunder';
  range: number;
  traveled: number;
  size: number;
  color: string;
  sourceId: string;
}

export type PetType = 'fire_dragonling' | 'ice_sprite' | 'thunder_bird' | 'shadow_cat';

export interface PetSkill {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  range: number;
  description: string;
  icon: string;
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
  bossType?: BossType;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  position: Position;
  aiType: AIType;
  state: MonsterState;
  color: string;
  dropChance: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  statusEffects: StatusEffect[];
  direction: number;
  animFrame: number;
  animTimer: number;
  isBoss: boolean;
  skills: MonsterSkill[];
  detectRange: number;
  attackRange: number;
  stateTimer: number;
  summonCount: number;
  maxSummons: number;
  fleeThreshold: number;
  ownerId?: string;
  stateCooldown: number;
  element?: 'fire' | 'ice' | 'thunder';
}

export type ChestType = 'normal' | 'rare' | 'epic';

export interface Chest {
  id: string;
  position: Position;
  type: ChestType;
  opened: boolean;
  rewardRuneIds: string[];
}

export type PotionType = 'health' | 'mana' | 'attack' | 'defense' | 'speed' | 'heal_pet';
export type PotionRarity = 'common' | 'rare' | 'epic';
export type MaterialType = 'herb' | 'crystal' | 'mushroom' | 'flower' | 'essence' | 'bone';

export interface PotionMaterial {
  id: string;
  name: string;
  type: MaterialType;
  color: string;
  icon: string;
  description: string;
  rarity: PotionRarity;
}

export interface PotionRecipe {
  id: string;
  resultPotionId: string;
  materials: { materialId: string; count: number }[];
}

export interface Potion {
  id: string;
  templateId: string;
  name: string;
  type: PotionType;
  color: string;
  icon: string;
  description: string;
  rarity: PotionRarity;
  value: number;
  duration?: number;
  cooldown: number;
  currentCooldown?: number;
}

export interface PotionTemplate {
  id: string;
  name: string;
  type: PotionType;
  color: string;
  icon: string;
  description: string;
  rarity: PotionRarity;
  value: number;
  duration?: number;
  cooldown: number;
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

export type SkillVFXType = 'projectile_trail' | 'explosion_ring' | 'shockwave' | 'persistent_field' | 'beam' | 'impact_burst';

export interface SkillVFX {
  id: string;
  type: SkillVFXType;
  position: Position;
  targetPosition?: Position;
  element: RuneElement;
  color: string;
  life: number;
  maxLife: number;
  radius: number;
  maxRadius?: number;
  lineWidth?: number;
  angle?: number;
  speed?: number;
}

export interface ScreenFlash {
  color: string;
  alpha: number;
  duration: number;
  maxDuration: number;
  intensity: number;
}

export interface ColorFilter {
  color: string;
  alpha: number;
  duration: number;
  maxDuration: number;
}

export interface ChantState {
  isChanting: boolean;
  skillIndex: number;
  timer: number;
  duration: number;
  element: RuneElement;
  color: string;
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
  shieldTimer: number;
  damageBoostTimer: number;
  damageBoostPercent: number;
  classType: ClassType | null;
}

export interface GameState {
  scene: GameScene;
  player: Player;
  selectedClass: ClassType | null;
  difficulty: AdventureDifficulty;
  dungeon: Dungeon | null;
  monsters: Monster[];
  chests: Chest[];
  pet: Pet | null;
  projectiles: Projectile[];
  monsterProjectiles: MonsterProjectile[];
  particles: Particle[];
  damageNumbers: DamageNumber[];
  runeInventory: Rune[];
  equippedRunes: (Rune | null)[];
  activeSkills: Skill[];
  currentLevel: number;
  killCount: number;
  gold: number;
  runeDust: number;
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
  equipmentInventory: Equipment[];
  equippedEquipment: Record<EquipmentSlotType, Equipment | null>;
  potionInventory: Potion[];
  materialInventory: PotionMaterial[];
  potionCooldowns: Record<string, number>;
  potionBuffTimers: Record<string, number>;
  skillVFXs: SkillVFX[];
  screenFlash: ScreenFlash | null;
  colorFilter: ColorFilter | null;
  playerChant: ChantState | null;
  screenShake: { intensity: number; duration: number; maxDuration: number };
  gameTime: number;
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
  petSkills: Record<string, string>;
  potionInventory: Potion[];
  materialInventory: PotionMaterial[];
  discoveredPotions: string[];
  discoveredMaterials: string[];
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

export type GameAction = 
  | 'move_up' 
  | 'move_down' 
  | 'move_left' 
  | 'move_right' 
  | 'interact'
  | 'skill_1' 
  | 'skill_2' 
  | 'skill_3' 
  | 'skill_4'
  | 'pause'
  | 'minimap'
  | 'minimap_zoom';

export interface KeyBinding {
  action: GameAction;
  key: string;
  label: string;
}

export interface GameSettings {
  keyBindings: Record<GameAction, string>;
  screenScale: number;
  bgmVolume: number;
  sfxVolume: number;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
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
  petSkills: Record<string, string>;
  equipmentInventory: Equipment[];
  equippedEquipment: Record<string, string | null>;
  discoveredEquipment: string[];
}
