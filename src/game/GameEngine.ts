import type { GameState, Player, Skill, Rune, Position, Projectile, Particle, DamageNumber, StatusEffect, Monster, MonsterSkill, MonsterProjectile, Chest, DailyChallenge, Pet, Equipment, EquipmentSlotType, Potion, PotionMaterial, Shop, ShopItem, ClassType, PlayerClass, GameAction, AdventureDifficulty, MonsterState, SkillVFX, ScreenFlash, ColorFilter, ChantState } from '../types/game';
import { GAME_CONFIG } from '../data/config';
import { generateDungeon, generateMonsters, generateChests, getPlayerStartPosition, updateFOV, isWalkable } from './utils/dungeon';
import { getRandomRunes, createSkill, ALL_RUNES, SKILLS, getRuneById, getSkillWithRarityBonus } from '../data/runes';
import { createMonster } from '../data/monsters';
import { calculateTalentEffects } from '../data/talents';
import { getClassById, getClassStartingRunes } from '../data/classes';
import { generateId, distance, normalize } from './utils/math';
import { drawFox, drawMonster, drawChest, drawStairs, drawRuneIcon, drawPet, getElementColor, getElementGlowColor, drawShopkeeper, drawDecoration } from './utils/pixel';
import { createPet, PET_SKILLS } from '../data/pets';
import { updateSaveData, discoverRune, discoverSkill, addTalentPoints, loadSaveData, saveChallengeRecord, getChallengeRecord, unlockBadge, getStreakDays, getPetSkill, discoverEquipment, saveEquipment, savePotions, discoverPotion, discoverMaterial, loadSettings, DEFAULT_KEY_BINDINGS } from './utils/storage';
import { getDifficultyConfig, getTalentPointsReward, getGoldReward } from '../data/difficulty';
import { getEquipmentTemplatesForDifficulty, getRandomEquipment, getEquipmentTemplate } from '../data/equipment';
import { getRandomPotion, getRandomMaterial, createPotion, getPotionTemplate, getRecipeByPotionId } from '../data/potions';
import { getAudioManager } from './AudioManager';
import { 
  calculateEquipmentStats, 
  calculatePlayerCombatStats, 
  calculatePlayerDamage, 
  calculateMonsterDamage,
  getElementMultiplier,
} from './utils/combat';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private keys: Set<string> = new Set();
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private hpRegenTimer: number = 0;
  
  public state: GameState;
  public onStateChange: (() => void) | null = null;
  public onChestOpened: ((rewards: { runes: Rune[]; equipment?: Equipment[]; potions: Potion[]; materials: PotionMaterial[] }) => void) | null = null;
  public onShopOpen: ((shop: Shop) => void) | null = null;
  public onPauseChange: ((paused: boolean) => void) | null = null;
  
  private getKeyForAction(action: GameAction): string {
    const settings = loadSettings();
    return settings.keyBindings[action] || DEFAULT_KEY_BINDINGS[action].key;
  }
  
  private isActionPressed(action: GameAction): boolean {
    const boundKey = this.getKeyForAction(action);
    if (this.keys.has(boundKey.toLowerCase())) return true;
    if (this.keys.has(boundKey)) return true;
    return false;
  }
  
  constructor() {
    this.state = this.createInitialState();
  }
  
  private createInitialState(): GameState {
    const initialRunes = getRandomRunes(4);
    const equipped: (Rune | null)[] = [null, null, null, null];
    
    initialRunes.forEach((rune, i) => {
      if (i < 4) equipped[i] = rune;
    });
    
    return {
      scene: 'menu',
      player: {
        position: { x: 0, y: 0 },
        hp: GAME_CONFIG.PLAYER_MAX_HP,
        maxHp: GAME_CONFIG.PLAYER_MAX_HP,
        speed: GAME_CONFIG.PLAYER_SPEED,
        direction: 1,
        animFrame: 0,
        animTimer: 0,
        isMoving: false,
        attackCooldown: 500,
        currentAttackCooldown: 0,
        invincible: 0,
        shieldTimer: 0,
        damageBoostTimer: 0,
        damageBoostPercent: 0,
        classType: null,
      },
      selectedClass: null,
      difficulty: 'adventurer',
      dungeon: null,
      monsters: [],
      chests: [],
      pet: null,
      projectiles: [],
      monsterProjectiles: [],
      particles: [],
      damageNumbers: [],
      runeInventory: initialRunes,
      equippedRunes: equipped,
      activeSkills: [],
      currentLevel: 1,
      killCount: 0,
      gold: 0,
      runeDust: 0,
      selectedRuneSlot: null,
      combineSlot1: null,
      combineSlot2: null,
      camera: { x: 0, y: 0 },
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
      equipmentInventory: [],
      equippedEquipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      potionInventory: [],
      materialInventory: [],
      potionCooldowns: {},
      potionBuffTimers: {},
      skillVFXs: [],
      screenFlash: null,
      colorFilter: null,
      playerChant: null,
      screenShake: { intensity: 0, duration: 0, maxDuration: 0 },
      gameTime: 0,
    };
  }
  
  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }
  
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  private gameLoop = () => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;
    
    if (this.state.scene === 'playing' && !this.isPaused) {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number) {
    this.state.gameTime += deltaTime;
    this.updatePlayer(deltaTime);
    this.updatePet(deltaTime);
    this.updateMonsters(deltaTime);
    this.updateMonsterProjectiles(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateParticles(deltaTime);
    this.updateDamageNumbers(deltaTime);
    this.updateSkillCooldowns(deltaTime);
    this.updateSkillVFXs(deltaTime);
    this.updateChant(deltaTime);
    this.updateScreenFlash(deltaTime);
    this.updateColorFilter(deltaTime);
    this.updateScreenShake(deltaTime);
    this.updatePotionCooldowns(deltaTime);
    this.updatePotionBuffs(deltaTime);
    this.updateCamera();
    this.checkChestCollision();
    this.checkShopCollision();
    this.checkStairsCollision();
    this.updateHpRegen(deltaTime);
    
    if (this.state.isChallengeMode && !this.state.challengeCompleted && !this.state.challengeFailed) {
      this.updateChallenge(deltaTime);
    }
    
    if (this.state.player.hp <= 0) {
      this.gameOver();
    }
  }
  
  private updatePlayer(deltaTime: number) {
    const player = this.state.player;
    const dt = deltaTime / 1000;
    
    let dx = 0;
    let dy = 0;
    
    if (this.isActionPressed('move_up') || this.keys.has('arrowup')) dy -= 1;
    if (this.isActionPressed('move_down') || this.keys.has('arrowdown')) dy += 1;
    if (this.isActionPressed('move_left') || this.keys.has('arrowleft')) { dx -= 1; player.direction = -1; }
    if (this.isActionPressed('move_right') || this.keys.has('arrowright')) { dx += 1; player.direction = 1; }
    
    if (dx !== 0 || dy !== 0) {
      const normalized = normalize({ x: dx, y: dy });
      const newX = player.position.x + normalized.x * player.speed * dt;
      const newY = player.position.y + normalized.y * player.speed * dt;
      
      if (this.state.dungeon && isWalkable(this.state.dungeon, newX, player.position.y)) {
        player.position.x = newX;
      }
      if (this.state.dungeon && isWalkable(this.state.dungeon, player.position.x, newY)) {
        player.position.y = newY;
      }
      
      player.isMoving = true;
      player.animTimer += deltaTime;
      if (player.animTimer > 150) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTimer = 0;
      }
    } else {
      player.isMoving = false;
      player.animFrame = 0;
    }
    
    if (player.invincible > 0) {
      player.invincible -= deltaTime;
    }
    
    if (player.shieldTimer > 0) {
      player.shieldTimer -= deltaTime;
    }
    if (player.damageBoostTimer > 0) {
      player.damageBoostTimer -= deltaTime;
      if (player.damageBoostTimer <= 0) {
        player.damageBoostPercent = 0;
      }
    }
    
    if (this.state.dungeon) {
      const saveData = loadSaveData();
      const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
      const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
      
      this.state.dungeon = updateFOV(
        this.state.dungeon,
        player.position,
        fovRadius
      );
    }
  }
  
  private updateMonsters(deltaTime: number) {
    const dt = deltaTime / 1000;
    const player = this.state.player;

    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;

      this.updateStatusEffects(monster, deltaTime);

      let speedMultiplier = 1;
      const frozen = monster.statusEffects.find(s => s.type === 'frozen');
      const slowed = monster.statusEffects.find(s => s.type === 'slow');
      if (frozen) speedMultiplier = 0;
      else if (slowed) speedMultiplier = 0.5;

      const dist = distance(monster.position, player.position);

      for (const skill of monster.skills) {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown -= deltaTime;
          if (skill.currentCooldown < 0) skill.currentCooldown = 0;
        }
      }

      if (monster.stateTimer > 0) monster.stateTimer -= deltaTime;
      if (monster.stateCooldown > 0) monster.stateCooldown -= deltaTime;

      switch (monster.aiType) {
        case 'passive':
          this.updatePassiveAI(monster, dt, speedMultiplier, dist);
          break;
        case 'aggressive':
          this.updateAggressiveAI(monster, dt, speedMultiplier, dist);
          break;
        case 'patrol':
          this.updatePatrolAI(monster, dt, speedMultiplier, dist);
          break;
        case 'ranged':
          this.updateRangedAI(monster, dt, speedMultiplier, dist);
          break;
        case 'caster':
          this.updateCasterAI(monster, dt, speedMultiplier, dist);
          break;
        case 'summoner':
          this.updateSummonerAI(monster, dt, speedMultiplier, dist);
          break;
        case 'healer':
          this.updateHealerAI(monster, dt, speedMultiplier, dist);
          break;
        case 'boss':
          this.updateBossAI(monster, dt, speedMultiplier, dist);
          break;
      }

      monster.animTimer += deltaTime;
      if (monster.animTimer > 300) {
        monster.animFrame = (monster.animFrame + 1) % 2;
        monster.animTimer = 0;
      }

      if (monster.attackRange <= 40 && dist < 30 && player.invincible <= 0 && monster.currentAttackCooldown <= 0) {
        this.damagePlayer(monster.damage, monster.element);
        monster.currentAttackCooldown = monster.attackCooldown;
      }

      if (monster.currentAttackCooldown > 0) {
        monster.currentAttackCooldown -= deltaTime;
      }
    }

    this.state.monsters = this.state.monsters.filter(m => m.hp > 0);
  }

  private tryChangeState(monster: Monster, newState: MonsterState, minDuration: number = 500, cooldown: number = 200): boolean {
    if (monster.state === newState) return true;
    if (monster.stateCooldown > 0 || monster.stateTimer > 0) return false;
    monster.state = newState;
    monster.stateTimer = minDuration;
    monster.stateCooldown = cooldown;
    return true;
  }

  private updatePassiveAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    if (distToPlayer < monster.detectRange && monster.state === 'idle') {
      this.tryChangeState(monster, 'chase', 1000, 300);
    }
    if (monster.state === 'chase') {
      if (distToPlayer > monster.detectRange * 1.5 && monster.stateTimer <= 0) {
        this.tryChangeState(monster, 'idle', 1500, 300);
        return;
      }
      this.moveMonsterTowardPlayer(monster, dt, speedMultiplier);
    }
  }

  private updateAggressiveAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    if (distToPlayer < monster.detectRange) {
      if (this.tryChangeState(monster, 'chase', 500, 200)) {
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier);
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 300);
    }
  }

  private updatePatrolAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    if (distToPlayer < monster.detectRange) {
      if (this.tryChangeState(monster, 'chase', 800, 300)) {
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier);
      }
      return;
    }
    this.tryChangeState(monster, 'idle', 0, 0);
    if (Math.random() < 0.01) {
      monster.direction = Math.random() < 0.5 ? -1 : 1;
    }
    const newX = monster.position.x + monster.direction * monster.speed * speedMultiplier * dt * 0.3;
    if (this.state.dungeon && isWalkable(this.state.dungeon, newX, monster.position.y)) {
      monster.position.x = newX;
    } else {
      monster.direction *= -1;
    }
  }

  private updateRangedAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    const hpPercent = monster.hp / monster.maxHp;
    const tooClose = distToPlayer < 40;
    const inFleeRange = distToPlayer < 60;
    const lowHp = hpPercent < monster.fleeThreshold;

    if (tooClose || (lowHp && inFleeRange)) {
      this.tryChangeState(monster, 'flee', 800, 300);
      this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 1.3);
      return;
    }

    if (distToPlayer < monster.detectRange) {
      const idealMin = 80;
      const idealMax = monster.attackRange * 0.85;

      if (distToPlayer < idealMin) {
        this.tryChangeState(monster, 'flee', 600, 250);
        this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier);
        return;
      }

      if (distToPlayer > idealMax) {
        this.tryChangeState(monster, 'chase', 700, 300);
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier);
        return;
      }

      if (this.tryChangeState(monster, 'attack', 400, 200)) {
        this.tryUseMonsterSkill(monster, 'projectile');
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 300);
    }
  }

  private updateCasterAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    const hpPercent = monster.hp / monster.maxHp;
    const tooClose = distToPlayer < 50;
    const lowHp = hpPercent < monster.fleeThreshold;

    if (tooClose || (lowHp && distToPlayer < 80)) {
      this.tryChangeState(monster, 'flee', 900, 300);
      this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 1.2);
      return;
    }

    if (distToPlayer < monster.detectRange) {
      const idealMin = 90;
      const idealMax = monster.attackRange * 0.8;

      if (distToPlayer < idealMin) {
        this.tryChangeState(monster, 'flee', 700, 300);
        this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier);
        return;
      }

      if (distToPlayer > idealMax) {
        this.tryChangeState(monster, 'chase', 800, 300);
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier);
        return;
      }

      if (this.tryChangeState(monster, 'cast', 500, 250)) {
        this.tryUseMonsterSkill(monster, 'projectile');
        this.tryUseMonsterSkill(monster, 'aoe');
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 300);
    }
  }

  private updateSummonerAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    const hpPercent = monster.hp / monster.maxHp;
    const tooClose = distToPlayer < 60;
    const lowHp = hpPercent < monster.fleeThreshold;

    if (tooClose || (lowHp && distToPlayer < 90)) {
      this.tryChangeState(monster, 'flee', 1000, 400);
      this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 1.2);
      return;
    }

    if (distToPlayer < monster.detectRange) {
      const ownSummons = this.countOwnSummons(monster);
      if (ownSummons < monster.maxSummons) {
        if (this.tryChangeState(monster, 'summon', 800, 500)) {
          this.tryUseMonsterSkill(monster, 'summon');
          return;
        }
      }

      const idealMin = 100;
      const idealMax = monster.attackRange * 0.75;

      if (distToPlayer < idealMin) {
        this.tryChangeState(monster, 'flee', 700, 300);
        this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 0.6);
        return;
      }

      if (distToPlayer > idealMax) {
        this.tryChangeState(monster, 'chase', 900, 400);
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier * 0.5);
        return;
      }

      if (this.tryChangeState(monster, 'cast', 500, 300)) {
        this.tryUseMonsterSkill(monster, 'projectile');
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 400);
    }
  }

  private updateHealerAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    const hpPercent = monster.hp / monster.maxHp;
    const tooClose = distToPlayer < 50;
    const lowHp = hpPercent < monster.fleeThreshold;

    if (tooClose || (lowHp && distToPlayer < 80)) {
      this.tryChangeState(monster, 'flee', 900, 400);
      this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 1.2);
      return;
    }

    const healSkill = monster.skills.find(s => s.type === 'heal');
    const healRange = healSkill?.range || 120;

    const injuredAlly = this.findInjuredAlly(monster, healRange);
    if (injuredAlly && distToPlayer < monster.detectRange) {
      const distToAlly = distance(monster.position, injuredAlly.position);
      if (distToAlly < healRange) {
        if (this.tryChangeState(monster, 'heal', 600, 400)) {
          this.tryUseMonsterSkill(monster, 'heal');
          return;
        }
      } else {
        if (this.tryChangeState(monster, 'chase', 700, 300)) {
          this.moveMonsterTowardTarget(monster, dt, speedMultiplier * 0.7, injuredAlly.position);
          return;
        }
      }
    }

    if (distToPlayer < monster.detectRange) {
      const idealMin = 90;
      const idealMax = monster.attackRange * 0.8;

      if (distToPlayer < idealMin) {
        this.tryChangeState(monster, 'flee', 700, 300);
        this.moveMonsterAwayFromPlayer(monster, dt, speedMultiplier * 0.7);
        return;
      }

      if (distToPlayer > idealMax) {
        this.tryChangeState(monster, 'chase', 800, 300);
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier * 0.6);
        return;
      }

      if (this.tryChangeState(monster, 'attack', 500, 250)) {
        this.tryUseMonsterSkill(monster, 'projectile');
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 400);
    }
  }

  private updateBossAI(monster: Monster, dt: number, speedMultiplier: number, distToPlayer: number) {
    if (distToPlayer < monster.detectRange) {
      const hpPercent = monster.hp / monster.maxHp;
      const isEnraged = hpPercent < 0.3;

      if (distToPlayer > monster.attackRange) {
        this.tryChangeState(monster, 'chase', 400, 100);
        const speed = isEnraged ? monster.speed * 1.5 : monster.speed;
        this.moveMonsterTowardPlayer(monster, dt, speedMultiplier * (speed / monster.speed));
      } else {
        if (this.tryChangeState(monster, 'attack', 300, 100)) {
          if (distToPlayer < 40 && this.state.player.invincible <= 0 && monster.currentAttackCooldown <= 0) {
            this.damagePlayer(monster.damage * (isEnraged ? 1.5 : 1), monster.element);
            monster.currentAttackCooldown = monster.attackCooldown * (isEnraged ? 0.6 : 1);
          }
        }
      }

      for (const skill of monster.skills) {
        if (skill.currentCooldown <= 0) {
          this.executeMonsterSkill(monster, skill);
          skill.currentCooldown = skill.cooldown * (isEnraged ? 0.6 : 1);
        }
      }
    } else {
      this.tryChangeState(monster, 'idle', 1000, 300);
    }
  }

  private moveMonsterTowardPlayer(monster: Monster, dt: number, speedMultiplier: number) {
    this.moveMonsterTowardTarget(monster, dt, speedMultiplier, this.state.player.position);
  }

  private moveMonsterTowardTarget(monster: Monster, dt: number, speedMultiplier: number, target: Position) {
    const dir = normalize({
      x: target.x - monster.position.x,
      y: target.y - monster.position.y,
    });

    const newX = monster.position.x + dir.x * monster.speed * speedMultiplier * dt;
    const newY = monster.position.y + dir.y * monster.speed * speedMultiplier * dt;

    if (this.state.dungeon && isWalkable(this.state.dungeon, newX, monster.position.y)) {
      monster.position.x = newX;
    }
    if (this.state.dungeon && isWalkable(this.state.dungeon, monster.position.x, newY)) {
      monster.position.y = newY;
    }

    if (dir.x < -0.1) monster.direction = -1;
    else if (dir.x > 0.1) monster.direction = 1;
  }

  private moveMonsterAwayFromPlayer(monster: Monster, dt: number, speedMultiplier: number) {
    const player = this.state.player;
    const dir = normalize({
      x: monster.position.x - player.position.x,
      y: monster.position.y - player.position.y,
    });

    const newX = monster.position.x + dir.x * monster.speed * speedMultiplier * dt;
    const newY = monster.position.y + dir.y * monster.speed * speedMultiplier * dt;

    if (this.state.dungeon && isWalkable(this.state.dungeon, newX, monster.position.y)) {
      monster.position.x = newX;
    }
    if (this.state.dungeon && isWalkable(this.state.dungeon, monster.position.x, newY)) {
      monster.position.y = newY;
    }

    if (dir.x < -0.1) monster.direction = -1;
    else if (dir.x > 0.1) monster.direction = 1;
  }

  private tryUseMonsterSkill(monster: Monster, skillType: MonsterSkill['type']) {
    const skill = monster.skills.find(s => s.type === skillType && s.currentCooldown <= 0);
    if (!skill) return;
    this.executeMonsterSkill(monster, skill);
    skill.currentCooldown = skill.cooldown;
  }

  private executeMonsterSkill(monster: Monster, skill: MonsterSkill) {
    const player = this.state.player;
    const dist = distance(monster.position, player.position);

    switch (skill.type) {
      case 'projectile': {
        if (dist > (skill.range || 150)) return;
        const dir = normalize({
          x: player.position.x - monster.position.x,
          y: player.position.y - monster.position.y,
        });
        const speed = skill.projectileSpeed || 200;
        const proj: MonsterProjectile = {
          id: generateId(),
          position: { ...monster.position },
          velocity: { x: dir.x * speed, y: dir.y * speed },
          damage: skill.damage,
          element: skill.element || monster.element,
          range: skill.range || 150,
          traveled: 0,
          size: monster.isBoss ? 8 : 5,
          color: this.getMonsterSkillColor(skill),
          sourceId: monster.id,
        };
        this.state.monsterProjectiles.push(proj);
        for (let i = 0; i < 6; i++) {
          this.addParticle(
            monster.position.x + (Math.random() - 0.5) * 10,
            monster.position.y + (Math.random() - 0.5) * 10,
            proj.color,
            'magic'
          );
        }
        break;
      }

      case 'aoe': {
        if (dist > (skill.aoeRadius || 60) + 50) return;
        const radius = skill.aoeRadius || 60;
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          this.addParticle(
            monster.position.x + Math.cos(angle) * radius * 0.5,
            monster.position.y + Math.sin(angle) * radius * 0.5,
            this.getMonsterSkillColor(skill),
            'explosion'
          );
        }
        if (dist < radius && this.state.player.invincible <= 0) {
          this.damagePlayer(skill.damage, skill.element || monster.element);
        }
        break;
      }

      case 'summon': {
        const summonType = skill.summonType || 'skeleton';
        const count = skill.summonCount || 2;
        const currentSummons = this.countOwnSummons(monster);
        const maxAllowed = monster.maxSummons || 4;
        if (currentSummons >= maxAllowed) return;

        const actualCount = Math.min(count, maxAllowed - currentSummons);
        const currentLevel = this.state.currentLevel;
        const diffConfig = getDifficultyConfig(this.state.difficulty);
        for (let i = 0; i < actualCount; i++) {
          const angle = (Math.PI * 2 * i) / actualCount;
          const spawnX = monster.position.x + Math.cos(angle) * 40;
          const spawnY = monster.position.y + Math.sin(angle) * 40;
          if (this.state.dungeon && isWalkable(this.state.dungeon, spawnX, spawnY)) {
            const summon = createMonster(summonType, { x: spawnX, y: spawnY }, currentLevel, diffConfig.hpMultiplier * 0.6, diffConfig.damageMultiplier * 0.6, diffConfig.levelMultiplierBonus);
            summon.ownerId = monster.id;
            summon.detectRange = Math.max(summon.detectRange, 120);
            this.state.monsters.push(summon);
            for (let j = 0; j < 8; j++) {
              this.addParticle(spawnX, spawnY, '#6c5ce7', 'magic');
            }
          }
        }
        break;
      }

      case 'heal': {
        const healPercent = skill.healPercent || 0.3;
        const healRange = skill.range || 120;
        const target = this.findInjuredAlly(monster, healRange) ||
          ((monster.hp < monster.maxHp) ? monster : null);
        if (!target) return;
        const healAmount = Math.floor(target.maxHp * healPercent);
        const oldHp = target.hp;
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        const actualHeal = target.hp - oldHp;
        if (actualHeal > 0) {
          this.addDamageNumber(target.position, actualHeal, '#7bed9f', false);
          for (let i = 0; i < 12; i++) {
            this.addParticle(
              target.position.x + (Math.random() - 0.5) * 20,
              target.position.y + (Math.random() - 0.5) * 20,
              '#7bed9f',
              'magic'
            );
          }
        }
        break;
      }

      case 'buff': {
        break;
      }
    }
  }

  private findInjuredAlly(monster: Monster, healRange: number = 120): Monster | null {
    let mostInjured: Monster | null = null;
    let lowestPercent = 1;
    for (const ally of this.state.monsters) {
      if (ally.hp <= 0 || ally.id === monster.id) continue;
      const dist = distance(monster.position, ally.position);
      if (dist > healRange) continue;
      const percent = ally.hp / ally.maxHp;
      if (percent < 0.8 && percent < lowestPercent) {
        lowestPercent = percent;
        mostInjured = ally;
      }
    }
    return mostInjured;
  }

  private countOwnSummons(monster: Monster): number {
    return this.state.monsters.filter(
      m => m.hp > 0 && m.ownerId === monster.id
    ).length;
  }

  private getMonsterSkillColor(skill: MonsterSkill): string {
    if (skill.element === 'fire') return '#ff6b35';
    if (skill.element === 'ice') return '#4ecdc4';
    if (skill.element === 'thunder') return '#ffe66d';
    return '#a29bfe';
  }

  private updateMonsterProjectiles(deltaTime: number) {
    const dt = deltaTime / 1000;

    for (let i = this.state.monsterProjectiles.length - 1; i >= 0; i--) {
      const proj = this.state.monsterProjectiles[i];

      proj.position.x += proj.velocity.x * dt;
      proj.position.y += proj.velocity.y * dt;
      proj.traveled += Math.abs(proj.velocity.x * dt) + Math.abs(proj.velocity.y * dt);

      if (Math.random() < 0.3) {
        this.addParticle(
          proj.position.x,
          proj.position.y,
          proj.color,
          'spark'
        );
      }

      const distToPlayer = distance(proj.position, this.state.player.position);
      if (distToPlayer < 20 + proj.size && this.state.player.invincible <= 0) {
        this.damagePlayer(proj.damage, proj.element);
        this.addScreenFlash(proj.color, 0.2, 150);
        this.state.monsterProjectiles.splice(i, 1);
        continue;
      }

      if (
        proj.traveled > proj.range ||
        !this.state.dungeon ||
        !isWalkable(this.state.dungeon, proj.position.x, proj.position.y)
      ) {
        this.state.monsterProjectiles.splice(i, 1);
      }
    }
  }
  
  private updatePet(deltaTime: number) {
    const pet = this.state.pet;
    if (!pet || pet.hp <= 0) return;
    
    const dt = deltaTime / 1000;
    const player = this.state.player;
    
    const targetX = player.position.x + pet.followOffset.x;
    const targetY = player.position.y + pet.followOffset.y;
    const distToTarget = distance(pet.position, { x: targetX, y: targetY });
    
    if (distToTarget > 5) {
      const dir = normalize({
        x: targetX - pet.position.x,
        y: targetY - pet.position.y,
      });
      
      const speed = distToTarget > 60 ? pet.speed * 2 : pet.speed;
      let moved = false;
      
      if (this.state.dungeon) {
        const newX = pet.position.x + dir.x * speed * dt;
        const newY = pet.position.y + dir.y * speed * dt;
        
        const canMoveX = isWalkable(this.state.dungeon, newX, pet.position.y);
        const canMoveY = isWalkable(this.state.dungeon, pet.position.x, newY);
        
        if (canMoveX) {
          pet.position.x = newX;
          moved = true;
        }
        if (canMoveY) {
          pet.position.y = newY;
          moved = true;
        }
        
        if (!canMoveX && !canMoveY && distToTarget > 100) {
          const playerTileX = Math.floor(player.position.x / GAME_CONFIG.TILE_SIZE);
          const playerTileY = Math.floor(player.position.y / GAME_CONFIG.TILE_SIZE);
          
          const offsets = [
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: 1, y: 1 },
          ];
          
          for (const offset of offsets) {
            const checkX = playerTileX + offset.x;
            const checkY = playerTileY + offset.y;
            
            if (
              checkX >= 0 && checkX < this.state.dungeon.width &&
              checkY >= 0 && checkY < this.state.dungeon.height &&
              this.state.dungeon.tiles[checkY][checkX].type === 'floor'
            ) {
              const oldPos = { ...pet.position };
              pet.position.x = (checkX + 0.5) * GAME_CONFIG.TILE_SIZE;
              pet.position.y = (checkY + 0.5) * GAME_CONFIG.TILE_SIZE;
              
              for (let i = 0; i < 10; i++) {
                this.addParticle(
                  oldPos.x + (Math.random() - 0.5) * 20,
                  oldPos.y + (Math.random() - 0.5) * 20,
                  pet.color,
                  'magic'
                );
                this.addParticle(
                  pet.position.x + (Math.random() - 0.5) * 20,
                  pet.position.y + (Math.random() - 0.5) * 20,
                  pet.color,
                  'magic'
                );
              }
              moved = true;
              break;
            }
          }
        } else if (!canMoveX || !canMoveY) {
          const altDir = { x: 0, y: 0 };
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            altDir.y = dir.y > 0 ? 1 : -1;
          } else {
            altDir.x = dir.x > 0 ? 1 : -1;
          }
          
          const altNewX = pet.position.x + altDir.x * speed * 0.7 * dt;
          const altNewY = pet.position.y + altDir.y * speed * 0.7 * dt;
          
          if (altDir.x !== 0 && isWalkable(this.state.dungeon, altNewX, pet.position.y)) {
            pet.position.x = altNewX;
            moved = true;
          }
          if (altDir.y !== 0 && isWalkable(this.state.dungeon, pet.position.x, altNewY)) {
            pet.position.y = altNewY;
            moved = true;
          }
        }
      }
      
      if (dir.x < -0.1) pet.direction = -1;
      else if (dir.x > 0.1) pet.direction = 1;
      
      if (moved) {
        pet.animTimer += deltaTime;
        if (pet.animTimer > 120) {
          pet.animFrame = (pet.animFrame + 1) % 4;
          pet.animTimer = 0;
        }
      }
    } else {
      pet.animFrame = 0;
    }
    
    let nearestMonster: Monster | null = null;
    let nearestDist = Infinity;
    
    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      const dist = distance(pet.position, monster.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestMonster = monster;
      }
    }
    
    if (nearestMonster && nearestDist < pet.attackRange) {
      if (pet.currentAttackCooldown <= 0) {
        this.petAttack(pet, nearestMonster);
        pet.currentAttackCooldown = pet.attackCooldown;
        pet.isAttacking = true;
        pet.attackAnimTimer = 200;
      }
      
      if (nearestMonster.position.x < pet.position.x) {
        pet.direction = -1;
      } else {
        pet.direction = 1;
      }
    }
    
    if (pet.skill.currentCooldown <= 0 && nearestMonster && nearestDist < pet.skill.range) {
      this.petUseSkill(pet, nearestMonster);
      pet.skill.currentCooldown = pet.skill.cooldown;
    }
    
    if (pet.currentAttackCooldown > 0) {
      pet.currentAttackCooldown -= deltaTime;
    }
    if (pet.skill.currentCooldown > 0) {
      pet.skill.currentCooldown -= deltaTime;
    }
    
    if (pet.attackAnimTimer > 0) {
      pet.attackAnimTimer -= deltaTime;
      if (pet.attackAnimTimer <= 0) {
        pet.isAttacking = false;
      }
    }
    
    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      const dist = distance(pet.position, monster.position);
      if (dist < 25 && monster.currentAttackCooldown <= 0) {
        this.damagePet(pet, monster.damage * 0.5);
      }
    }
  }
  
  private petAttack(pet: Pet, target: Monster) {
    const damage = pet.damage;
    this.damageMonster(target, damage, this.getPetElement(pet.type), 'pet');
    
    for (let i = 0; i < 5; i++) {
      this.addParticle(
        target.position.x + (Math.random() - 0.5) * 20,
        target.position.y + (Math.random() - 0.5) * 20,
        pet.color,
        'spark'
      );
    }
    
    const proj: Projectile = {
      id: generateId(),
      position: { ...pet.position },
      velocity: {
        x: (target.position.x - pet.position.x) * 5,
        y: (target.position.y - pet.position.y) * 5,
      },
      damage: 0,
      element: this.getPetElement(pet.type) as any,
      effect: 'pierce' as any,
      range: 50,
      traveled: 0,
      piercing: true,
      hitTargets: [],
      size: 4,
    };
    this.state.projectiles.push(proj);
  }
  
  private petUseSkill(pet: Pet, target: Monster) {
    const skill = pet.skill;
    const petElement = this.getPetElement(pet.type);
    const skillTemplate = PET_SKILLS[pet.type as keyof typeof PET_SKILLS]?.find(s => s.id === skill.id);
    const skillType = skillTemplate?.type || 'single';
    
    switch (skillType) {
      case 'aoe': {
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          const centerX = skill.id.includes('blade') ? pet.position.x : target.position.x;
          const centerY = skill.id.includes('blade') ? pet.position.y : target.position.y;
          this.addParticle(
            centerX + Math.cos(angle) * skill.range * 0.4,
            centerY + Math.sin(angle) * skill.range * 0.4,
            pet.color,
            'explosion'
          );
        }
        const centerPos = skill.id.includes('blade') ? pet.position : target.position;
        for (const monster of this.state.monsters) {
          if (monster.hp <= 0) continue;
          const dist = distance(centerPos, monster.position);
          if (dist < skill.range * 0.5) {
            this.damageMonster(monster, skill.damage, petElement as any, 'spread');
          }
        }
        break;
      }
        
      case 'chain': {
        const chainTargets: Monster[] = [target];
        let lastTarget = target;
        
        for (let i = 0; i < 2; i++) {
          let nextNearest: Monster | null = null;
          let nextDist = Infinity;
          
          for (const monster of this.state.monsters) {
            if (monster.hp <= 0) continue;
            if (chainTargets.includes(monster)) continue;
            const dist = distance(lastTarget.position, monster.position);
            if (dist < nextDist && dist < 80) {
              nextDist = dist;
              nextNearest = monster;
            }
          }
          
          if (nextNearest) {
            chainTargets.push(nextNearest);
            lastTarget = nextNearest;
          }
        }
        
        for (const monster of chainTargets) {
          this.damageMonster(monster, skill.damage, petElement as any, 'power');
          
          for (let j = 0; j < 8; j++) {
            this.addParticle(
              monster.position.x + (Math.random() - 0.5) * 15,
              monster.position.y + (Math.random() - 0.5) * 15,
              pet.color,
              'spark'
            );
          }
        }
        break;
      }
        
      case 'dash': {
        const oldPos = { ...pet.position };
        pet.position.x = target.position.x + (target.position.x > pet.position.x ? -20 : 20);
        pet.position.y = target.position.y;
        
        this.damageMonster(target, skill.damage, petElement as any, 'power', true);
        
        for (let i = 0; i < 12; i++) {
          this.addParticle(
            oldPos.x + (Math.random() - 0.5) * 10,
            oldPos.y + (Math.random() - 0.5) * 10,
            pet.color,
            'magic'
          );
        }
        for (let i = 0; i < 12; i++) {
          this.addParticle(
            pet.position.x + (Math.random() - 0.5) * 10,
            pet.position.y + (Math.random() - 0.5) * 10,
            pet.color,
            'magic'
          );
        }
        break;
      }
      
      case 'single': {
        this.damageMonster(target, skill.damage, petElement as any, 'power', true);
        
        for (let i = 0; i < 15; i++) {
          this.addParticle(
            target.position.x + (Math.random() - 0.5) * 25,
            target.position.y + (Math.random() - 0.5) * 25,
            pet.color,
            'explosion'
          );
        }
        break;
      }
      
      case 'shield': {
        this.state.player.shieldTimer = 5000;
        
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          this.addParticle(
            this.state.player.position.x + Math.cos(angle) * 25,
            this.state.player.position.y + Math.sin(angle) * 25,
            pet.color,
            'magic'
          );
        }
        
        this.addDamageNumber(this.state.player.position, 0, pet.color, false);
        break;
      }
      
      case 'heal': {
        const healAmount = Math.floor(this.state.player.maxHp * 0.2);
        const oldHp = this.state.player.hp;
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + healAmount);
        const actualHeal = this.state.player.hp - oldHp;
        
        if (actualHeal > 0) {
          this.addDamageNumber(this.state.player.position, actualHeal, '#7bed9f', false);
        }
        
        for (let i = 0; i < 15; i++) {
          this.addParticle(
            this.state.player.position.x + (Math.random() - 0.5) * 20,
            this.state.player.position.y - 10 + (Math.random() - 0.5) * 20,
            '#7bed9f',
            'magic'
          );
        }
        break;
      }
      
      case 'buff': {
        this.state.player.damageBoostPercent = 50;
        this.state.player.damageBoostTimer = 8000;
        
        for (let i = 0; i < 20; i++) {
          this.addParticle(
            this.state.player.position.x + (Math.random() - 0.5) * 30,
            this.state.player.position.y + (Math.random() - 0.5) * 30,
            pet.color,
            'spark'
          );
        }
        
        this.addDamageNumber(this.state.player.position, 0, pet.color, false);
        break;
      }
    }
  }
  
  private getPetElement(type: string): string {
    switch (type) {
      case 'fire_dragonling': return 'fire';
      case 'ice_sprite': return 'ice';
      case 'thunder_bird': return 'thunder';
      case 'shadow_cat': return 'fire';
      default: return 'fire';
    }
  }
  
  private damagePet(pet: Pet, damage: number) {
    pet.hp -= Math.floor(damage);
    
    this.addDamageNumber(pet.position, Math.floor(damage), '#ff4757', false);
    
    for (let i = 0; i < 6; i++) {
      this.addParticle(
        pet.position.x,
        pet.position.y,
        pet.color,
        'spark'
      );
    }
    
    if (pet.hp <= 0) {
      pet.hp = 0;
      for (let i = 0; i < 20; i++) {
        this.addParticle(
          pet.position.x,
          pet.position.y,
          pet.color,
          'explosion'
        );
      }
    }
  }
  
  private updateStatusEffects(entity: Monster, deltaTime: number) {
    for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
      const effect = entity.statusEffects[i];
      effect.duration -= deltaTime;
      
      if (effect.type === 'burn' && effect.damage) {
        if (Math.random() < 0.02) {
          entity.hp -= effect.damage;
          this.addDamageNumber(entity.position, effect.damage, '#ff6b35', false);
        }
      }
      
      if (effect.duration <= 0) {
        entity.statusEffects.splice(i, 1);
      }
    }
  }
  
  private updateProjectiles(deltaTime: number) {
    const dt = deltaTime / 1000;

    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];

      proj.position.x += proj.velocity.x * dt;
      proj.position.y += proj.velocity.y * dt;
      proj.traveled += Math.abs(proj.velocity.x * dt) + Math.abs(proj.velocity.y * dt);

      if (Math.random() < 0.5) {
        const color = getElementColor(proj.element);
        this.addParticle(
          proj.position.x + (Math.random() - 0.5) * 4,
          proj.position.y + (Math.random() - 0.5) * 4,
          color,
          'spark'
        );
      }

      if (proj.element === 'fire' && Math.random() < 0.3) {
        this.addParticle(
          proj.position.x + (Math.random() - 0.5) * 6,
          proj.position.y + (Math.random() - 0.5) * 6,
          '#ffe66d',
          'spark'
        );
      } else if (proj.element === 'ice' && Math.random() < 0.3) {
        this.addParticle(
          proj.position.x + (Math.random() - 0.5) * 6,
          proj.position.y + (Math.random() - 0.5) * 6,
          '#ffffff',
          'magic'
        );
      } else if (proj.element === 'thunder' && Math.random() < 0.2) {
        this.addParticle(
          proj.position.x + (Math.random() - 0.5) * 8,
          proj.position.y + (Math.random() - 0.5) * 8,
          '#ffffff',
          'spark'
        );
      }

      for (const monster of this.state.monsters) {
        if (monster.hp <= 0) continue;
        if (proj.hitTargets.includes(monster.id)) continue;

        const dist = distance(proj.position, monster.position);
        if (dist < 20 + proj.size) {
          this.damageMonster(monster, proj.damage, proj.element, proj.effect);
          proj.hitTargets.push(monster.id);

          this.addSkillVFX({
            id: generateId(),
            type: 'impact_burst',
            position: { ...monster.position },
            element: proj.element,
            color: getElementColor(proj.element),
            life: 200,
            maxLife: 200,
            radius: 15,
          });

          if (!proj.piercing) {
            this.state.projectiles.splice(i, 1);
            break;
          }
        }
      }

      if (
        proj.traveled > proj.range ||
        !this.state.dungeon ||
        !isWalkable(this.state.dungeon, proj.position.x, proj.position.y)
      ) {
        this.state.projectiles.splice(i, 1);
      }
    }
  }
  
  private updateParticles(deltaTime: number) {
    const dt = deltaTime / 1000;
    
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.velocity.x *= 0.98;
      p.velocity.y *= 0.98;
      p.life -= deltaTime;
      
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
  }
  
  private updateDamageNumbers(deltaTime: number) {
    for (let i = this.state.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.state.damageNumbers[i] as any;
      const progress = 1 - dn.life / dn.maxLife;
      
      dn.position.y -= (dn.isCrit ? 45 : 30) * (deltaTime / 1000);
      dn.position.x += Math.sin(progress * Math.PI * 2) * (dn.isCrit ? 8 : 3) * (deltaTime / 1000);
      dn.life -= deltaTime;
      
      if (dn.life <= 0) {
        this.state.damageNumbers.splice(i, 1);
      }
    }
  }
  
  private updateSkillCooldowns(deltaTime: number) {
    for (const skill of this.state.activeSkills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= deltaTime;
        if (skill.currentCooldown < 0) skill.currentCooldown = 0;
      }
    }
  }

  private updateSkillVFXs(deltaTime: number) {
    for (let i = this.state.skillVFXs.length - 1; i >= 0; i--) {
      const vfx = this.state.skillVFXs[i];
      vfx.life -= deltaTime;

      if (vfx.maxRadius && vfx.type === 'explosion_ring') {
        const progress = 1 - vfx.life / vfx.maxLife;
        vfx.radius = 5 + (vfx.maxRadius - 5) * Math.pow(progress, 0.5);
      }

      if (vfx.maxRadius && vfx.type === 'shockwave') {
        const progress = 1 - vfx.life / vfx.maxLife;
        vfx.radius = 5 + (vfx.maxRadius - 5) * progress;
      }

      if (vfx.life <= 0) {
        this.state.skillVFXs.splice(i, 1);
      }
    }
  }

  private updateChant(deltaTime: number) {
    const chant = this.state.playerChant;
    if (!chant || !chant.isChanting) return;

    chant.timer += deltaTime;

    const player = this.state.player;
    if (Math.random() < 0.4) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 20;
      this.addParticle(
        player.position.x + Math.cos(angle) * dist,
        player.position.y + Math.sin(angle) * dist,
        chant.color,
        'magic'
      );
    }

    if (chant.timer >= chant.duration) {
      chant.isChanting = false;
      this.state.playerChant = null;
      this.completeSkillCast(chant.skillIndex);
    }
  }

  private updateScreenFlash(deltaTime: number) {
    const flash = this.state.screenFlash;
    if (!flash) return;

    flash.duration -= deltaTime;
    flash.alpha = flash.intensity * (flash.duration / flash.maxDuration);

    if (flash.duration <= 0) {
      this.state.screenFlash = null;
    }
  }

  private updateColorFilter(deltaTime: number) {
    const filter = this.state.colorFilter;
    if (!filter) return;

    filter.duration -= deltaTime;
    filter.alpha = (filter.alpha / filter.maxDuration) * filter.maxDuration * (filter.duration / filter.maxDuration);

    if (filter.duration <= 0) {
      this.state.colorFilter = null;
    }
  }

  private updateScreenShake(deltaTime: number) {
    const shake = this.state.screenShake;
    if (shake.duration <= 0) return;

    shake.duration -= deltaTime;
    if (shake.duration <= 0) {
      shake.intensity = 0;
      shake.duration = 0;
    }
  }
  
  private updatePotionCooldowns(deltaTime: number) {
    for (const key of Object.keys(this.state.potionCooldowns)) {
      if (this.state.potionCooldowns[key] > 0) {
        this.state.potionCooldowns[key] -= deltaTime;
        if (this.state.potionCooldowns[key] < 0) {
          this.state.potionCooldowns[key] = 0;
        }
      }
    }
  }
  
  private updatePotionBuffs(deltaTime: number) {
    const buffTimers = this.state.potionBuffTimers;
    let needUpdateSpeed = false;
    
    for (const key of Object.keys(buffTimers)) {
      if (buffTimers[key] > 0) {
        buffTimers[key] -= deltaTime;
        if (buffTimers[key] <= 0) {
          buffTimers[key] = 0;
          if (key === 'speed') {
            needUpdateSpeed = true;
          }
          if (key === 'attack') {
            this.state.player.damageBoostPercent = 0;
            this.state.player.damageBoostTimer = 0;
          }
        }
      }
    }
    
    if (needUpdateSpeed) {
      this.state.player.speed = GAME_CONFIG.PLAYER_SPEED;
    }
  }
  
  private updateHpRegen(deltaTime: number) {
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    if (talentEffects.hpRegen > 0) {
      this.hpRegenTimer += deltaTime;
      const regenInterval = 1000;
      
      while (this.hpRegenTimer >= regenInterval) {
        this.hpRegenTimer -= regenInterval;
        const player = this.state.player;
        if (player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + talentEffects.hpRegen);
        }
      }
    }
  }
  
  private getClassStats() {
    const classType = this.state.player.classType;
    if (!classType) {
      return {
        attack: 1.0,
        defense: 1.0,
        maxHp: 0,
        speed: 0,
        critChance: 0,
        critDamage: 0,
        attackSpeed: 1.0,
      };
    }
    
    const playerClass = getClassById(classType);
    if (!playerClass) {
      return {
        attack: 1.0,
        defense: 1.0,
        maxHp: 0,
        speed: 0,
        critChance: 0,
        critDamage: 0,
        attackSpeed: 1.0,
      };
    }
    
    return {
      attack: playerClass.stats.attack,
      defense: playerClass.stats.defense,
      maxHp: 0,
      speed: 0,
      critChance: playerClass.stats.critChance,
      critDamage: playerClass.stats.critDamage - 1,
      attackSpeed: playerClass.stats.attackSpeed,
    };
  }

  private getEquipmentStats() {
    const stats = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      speed: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      goldBonus: 0,
    };
    
    const equipped = this.state.equippedEquipment;
    const slots: EquipmentSlotType[] = ['weapon', 'armor', 'accessory'];
    
    for (const slot of slots) {
      const equip = equipped[slot];
      if (equip && equip.durability > 0) {
        for (const stat of equip.stats) {
          if (stat.type in stats) {
            (stats as any)[stat.type] += stat.value;
          }
        }
      }
    }
    
    return stats;
  }
  
  private consumeEquipmentDurability(amount: number = 1) {
    const slots: EquipmentSlotType[] = ['weapon', 'armor', 'accessory'];
    let hasBroken = false;
    
    for (const slot of slots) {
      const equip = this.state.equippedEquipment[slot];
      if (equip && equip.durability > 0) {
        equip.durability = Math.max(0, equip.durability - amount);
        if (equip.durability === 0) {
          hasBroken = true;
        }
      }
    }
    
    return hasBroken;
  }
  
  private addEquipmentDrop(level: number) {
    const dropChance = 0.1 + level * 0.02;
    const diffConfig = getDifficultyConfig(this.state.difficulty);
    
    if (Math.random() < dropChance) {
      const availableTemplates = getEquipmentTemplatesForDifficulty(this.state.difficulty);
      let template;
      if (Math.random() < diffConfig.equipmentRarityBoost) {
        const highRarity = availableTemplates.filter(t => t.rarity === 'legendary' || t.rarity === 'epic');
        template = highRarity.length > 0 ? highRarity[Math.floor(Math.random() * highRarity.length)] : availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      } else {
        template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      }
      const equipment = template ? getRandomEquipment(Math.max(1, Math.floor(level / 2))) : null;
      if (equipment) {
        this.state.equipmentInventory.push(equipment);
        discoverEquipment(equipment.templateId);
        saveEquipment(this.state.equipmentInventory, this.state.equippedEquipment);
        return equipment;
      }
    }
    return null;
  }
  
  private updateCamera() {
    if (!this.canvas) return;
    
    const player = this.state.player;
    const targetX = player.position.x - this.canvas.width / 2;
    const targetY = player.position.y - this.canvas.height / 2;
    
    this.state.camera.x += (targetX - this.state.camera.x) * 0.1;
    this.state.camera.y += (targetY - this.state.camera.y) * 0.1;
  }
  
  private checkChestCollision() {
    const player = this.state.player;
    
    for (const chest of this.state.chests) {
      if (chest.opened) continue;
      
      const dist = distance(player.position, chest.position);
      if (dist < 30 && this.isActionPressed('interact')) {
        this.openChest(chest);
      }
    }
  }
  
  private checkShopCollision() {
    if (!this.state.dungeon || !this.state.dungeon.shop) return;
    
    const player = this.state.player;
    const shop = this.state.dungeon.shop;
    
    const dist = distance(player.position, shop.position);
    if (dist < 40 && this.isActionPressed('interact')) {
      const interactKey = this.getKeyForAction('interact');
      this.keys.delete(interactKey.toLowerCase());
      if (this.onShopOpen) {
        this.onShopOpen(shop);
      }
    }
  }
  
  private checkStairsCollision() {
    if (!this.state.dungeon) return;
    
    const player = this.state.player;
    const stairs = this.state.dungeon.stairsPosition;
    const stairsPixelX = stairs.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const stairsPixelY = stairs.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    
    const dist = distance(player.position, { x: stairsPixelX, y: stairsPixelY });
    if (dist < 25 && this.isActionPressed('interact')) {
      this.nextLevel();
    }
  }
  
  private openChest(chest: Chest) {
    chest.opened = true;
    const rewardRunes: Rune[] = [];
    const rewardEquipment: Equipment[] = [];
    const rewardMaterials: PotionMaterial[] = [];
    const rewardPotions: Potion[] = [];
    
    if (!this.state.isChallengeMode) {
      for (const runeId of chest.rewardRuneIds) {
        const rune = ALL_RUNES.find(r => r.id === runeId);
        if (rune) {
          const runeCopy = { ...rune };
          this.state.runeInventory.push(runeCopy);
          rewardRunes.push(runeCopy);
          discoverRune(rune.id);
          
          this.addDamageNumber(
            { x: chest.position.x, y: chest.position.y - 20 },
            0,
            rune.color,
            false
          );
        }
      }
      
      let equipDropChance = 0.3;
      if (chest.type === 'rare') equipDropChance = 0.6;
      if (chest.type === 'epic') equipDropChance = 0.9;
      
      if (Math.random() < equipDropChance) {
        const rarity = chest.type === 'epic' ? 'epic' : 
                       chest.type === 'rare' ? 'rare' : 
                       Math.random() < 0.7 ? 'common' : 'rare';
        const equipment = getRandomEquipment(
          Math.max(1, this.state.currentLevel),
          rarity as any
        );
        if (equipment) {
          this.state.equipmentInventory.push(equipment);
          rewardEquipment.push(equipment);
          discoverEquipment(equipment.templateId);
          saveEquipment(this.state.equipmentInventory, this.state.equippedEquipment);
        }
      }
      
      let materialCount = 1;
      let potionChance = 0.4;
      if (chest.type === 'rare') {
        materialCount = 2;
        potionChance = 0.6;
      }
      if (chest.type === 'epic') {
        materialCount = 3;
        potionChance = 0.8;
      }
      
      for (let i = 0; i < materialCount; i++) {
        const rarity = chest.type === 'epic' ? (Math.random() < 0.3 ? 'epic' : 'rare') :
                       chest.type === 'rare' ? (Math.random() < 0.5 ? 'rare' : 'common') :
                       'common';
        const material = getRandomMaterial(rarity as any);
        if (material) {
          this.state.materialInventory.push(material);
          rewardMaterials.push(material);
          discoverMaterial(material.id);
        }
      }
      
      if (Math.random() < potionChance) {
        const rarity = chest.type === 'epic' ? (Math.random() < 0.3 ? 'epic' : 'rare') :
                       chest.type === 'rare' ? (Math.random() < 0.4 ? 'rare' : 'common') :
                       'common';
        const potion = getRandomPotion(rarity as any);
        if (potion) {
          this.state.potionInventory.push(potion);
          rewardPotions.push(potion);
          discoverPotion(potion.templateId);
        }
      }
      
      savePotions(this.state.potionInventory, this.state.materialInventory);
      
      const goldAmount = Math.floor(20 + this.state.currentLevel * 10 + Math.random() * 30);
      const adjustedGold = getGoldReward(goldAmount, this.state.difficulty);
      const equipmentStats = calculateEquipmentStats(this.state.equippedEquipment);
      const saveData = loadSaveData();
      const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
      const goldBonus = 1 + talentEffects.goldBonus + equipmentStats.goldBonus;
      this.state.gold += Math.floor(adjustedGold * goldBonus);
    }
    
    for (let i = 0; i < 15; i++) {
      this.addParticle(
        chest.position.x,
        chest.position.y,
        '#ffd700',
        'magic'
      );
    }
    
    getAudioManager().playSFX('chest');
    
    if (this.onChestOpened) {
      this.onChestOpened({ runes: rewardRunes, equipment: rewardEquipment, potions: rewardPotions, materials: rewardMaterials });
    }
    
    this.notifyStateChange();
  }
  
  private nextLevel() {
    this.state.currentLevel++;
    
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    const difficulty = this.state.difficulty;
    
    const newDungeon = generateDungeon(this.state.currentLevel, difficulty);
    const newMonsters = generateMonsters(newDungeon, this.state.currentLevel, difficulty);
    const newChests = generateChests(newDungeon, this.state.currentLevel);
    const startPos = getPlayerStartPosition(newDungeon);
    
    const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
    const updatedDungeon = updateFOV(newDungeon, startPos, fovRadius);
    
    this.state.dungeon = updatedDungeon;
    this.state.monsters = newMonsters;
    this.state.chests = newChests;
    this.state.player.position = { ...startPos };
    this.state.projectiles = [];
    this.state.monsterProjectiles = [];
    this.state.particles = [];
    this.state.skillVFXs = [];
    this.state.screenFlash = null;
    this.state.colorFilter = null;
    this.state.playerChant = null;
    this.state.screenShake = { intensity: 0, duration: 0, maxDuration: 0 };

    if (this.state.pet) {

      this.state.pet.hp = this.state.pet.maxHp;
      this.state.pet.position = { x: startPos.x - 30, y: startPos.y + 20 };
      this.state.pet.skill.currentCooldown = 0;
      this.state.pet.currentAttackCooldown = 0;
    }
    
    updateSaveData({ highestLevel: Math.max(this.state.currentLevel, (window as any).highestLevel || 0) });
    
    getAudioManager().playSFX('stairs');
    this.notifyStateChange();
  }
  
  public setScene(scene: string) {
    this.state.scene = scene as any;
    this.notifyStateChange();
  }

  public startGame() {
    this.startGameWithClass('fire_mage');
  }

  public startGameWithClass(classId: ClassType, difficulty: AdventureDifficulty = 'adventurer') {
    const playerClass = getClassById(classId);
    if (!playerClass) return;

    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    this.hpRegenTimer = 0;
    
    const startingRuneIds = getClassStartingRunes(classId);
    const initialRunes = startingRuneIds
      .map(id => getRuneById(id))
      .filter((r): r is Rune => r !== undefined);

    const baseRuneCount = 4 + talentEffects.startRunes;
    const bonusRuneCount = Math.max(0, baseRuneCount - initialRunes.length);
    if (bonusRuneCount > 0) {
      const bonusRunes = getRandomRunes(bonusRuneCount, difficulty);
      initialRunes.push(...bonusRunes);
    }
    
    const equipped: (Rune | null)[] = [null, null, null, null];
    initialRunes.forEach((rune, i) => {
      if (i < 4) equipped[i] = rune;
    });
    
    const dungeon = generateDungeon(1, difficulty);
    const monsters = generateMonsters(dungeon, 1, difficulty);
    const chests = generateChests(dungeon, 1);
    const startPos = getPlayerStartPosition(dungeon);
    
    const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
    const updatedDungeon = updateFOV(dungeon, startPos, fovRadius);
    
    const equipmentStats = this.calculateEquipmentStatsFromSave(saveData);
    
    const classStats = playerClass.stats;
    const maxHp = classStats.maxHp + talentEffects.maxHp + equipmentStats.maxHp;
    const speed = classStats.speed * (1 + talentEffects.speed + equipmentStats.speed);
    const attackCooldown = 500 / classStats.attackSpeed;
    
    this.state.scene = 'playing';
    this.state.selectedClass = classId;
    this.state.difficulty = difficulty;
    this.state.dungeon = updatedDungeon;
    this.state.monsters = monsters;
    this.state.chests = chests;
    this.state.currentLevel = 1;
    this.state.killCount = 0;
    this.state.gold = 0;
    this.state.runeDust = 0;
    this.state.projectiles = [];
    this.state.monsterProjectiles = [];
    this.state.particles = [];
    this.state.damageNumbers = [];
    this.state.skillVFXs = [];
    this.state.screenFlash = null;
    this.state.colorFilter = null;
    this.state.playerChant = null;
    this.state.screenShake = { intensity: 0, duration: 0, maxDuration: 0 };
    this.state.runeInventory = initialRunes;
    this.state.equippedRunes = equipped;
    this.state.activeSkills = [];
    this.state.earnedTalentPoints = 0;
    this.state.equipmentInventory = saveData.equipmentInventory || [];
    this.state.equippedEquipment = this.loadEquippedEquipment(saveData);
    this.state.gameTime = 0;
    this.state.player = {
      position: { ...startPos },
      hp: maxHp,
      maxHp: maxHp,
      speed: speed,
      direction: 1,
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
      attackCooldown: attackCooldown,
      currentAttackCooldown: 0,
      invincible: 0,
      shieldTimer: 0,
      damageBoostTimer: 0,
      damageBoostPercent: 0,
      classType: classId,
    };
    
    const selectedPetType = saveData.selectedPet || 'fire_dragonling';
    const savedSkillId = getPetSkill(selectedPetType);
    const pet = createPet(selectedPetType as any, { x: startPos.x - 30, y: startPos.y + 20 }, savedSkillId || undefined);
    this.state.pet = pet;
    
    this.state.potionInventory = saveData.potionInventory || [];
    this.state.materialInventory = saveData.materialInventory || [];
    this.state.potionCooldowns = {};
    this.state.potionBuffTimers = {};
    
    this.updateSkillsFromRunes();
    initialRunes.forEach(r => discoverRune(r.id));
    
    getAudioManager().startBGM();
    this.notifyStateChange();
  }
  
  private calculateEquipmentStatsFromSave(saveData: any) {
    const stats = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      speed: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      goldBonus: 0,
    };
    
    const inventory = saveData.equipmentInventory || [];
    const equippedIds = saveData.equippedEquipment || {};
    
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const equipId = equippedIds[slot];
      if (equipId) {
        const equip = inventory.find((e: any) => e.instanceId === equipId);
        if (equip && equip.durability > 0) {
          for (const stat of equip.stats) {
            if (stat.type in stats) {
              (stats as any)[stat.type] += stat.value;
            }
          }
        }
      }
    }
    
    return stats;
  }
  
  private loadEquippedEquipment(saveData: any): Record<EquipmentSlotType, Equipment | null> {
    const result: Record<EquipmentSlotType, Equipment | null> = {
      weapon: null,
      armor: null,
      accessory: null,
    };
    
    const inventory = saveData.equipmentInventory || [];
    const equippedIds = saveData.equippedEquipment || {};
    
    for (const slot of ['weapon', 'armor', 'accessory'] as EquipmentSlotType[]) {
      const equipId = equippedIds[slot];
      if (equipId) {
        const equip = inventory.find((e: any) => e.instanceId === equipId);
        if (equip) {
          result[slot] = equip;
        }
      }
    }
    
    return result;
  }
  
  private gameOver() {
    this.state.scene = 'gameover';
    getAudioManager().playSFX('death');
    getAudioManager().stopBGM();
    
    if (this.state.isChallengeMode && !this.state.challengeCompleted) {
      this.failChallenge();
    } else {
      const baseTalentPoints = Math.max(1, Math.floor(this.state.currentLevel / 2) + Math.floor(this.state.killCount / 10));
      const talentPointsEarned = getTalentPointsReward(baseTalentPoints, this.state.difficulty);
      this.state.earnedTalentPoints = talentPointsEarned;
      
      const saveData = addTalentPoints(talentPointsEarned);
      
      const equippedIds: Record<string, string | null> = {};
      (['weapon', 'armor', 'accessory'] as EquipmentSlotType[]).forEach(slot => {
        equippedIds[slot] = this.state.equippedEquipment[slot]?.instanceId || null;
      });
      
      updateSaveData({
        totalKills: saveData.totalKills + this.state.killCount,
        highestLevel: Math.max(this.state.currentLevel, saveData.highestLevel),
        equipmentInventory: this.state.equipmentInventory,
        equippedEquipment: equippedIds,
        potionInventory: this.state.potionInventory,
        materialInventory: this.state.materialInventory,
      });
    }
    
    this.notifyStateChange();
  }
  
  private updateChallenge(deltaTime: number) {
    this.state.challengeTimeRemaining -= deltaTime / 1000;
    this.state.challengeTimeSpent += deltaTime / 1000;
    
    if (this.state.challengeTimeRemaining <= 0) {
      this.state.challengeTimeRemaining = 0;
      this.failChallenge();
      return;
    }
    
    if (this.checkChallengeGoal()) {
      this.completeChallenge();
    }
  }
  
  private checkChallengeGoal(): boolean {
    if (!this.state.challenge) return false;
    
    const goalType = this.state.challenge.goalType;
    const totalMonsters = this.state.challenge.monsterCount;
    const totalChests = this.state.challenge.chestCount;
    const killedMonsters = this.state.killCount;
    const openedChests = this.state.chests.filter(c => c.opened).length;
    
    switch (goalType) {
      case 'kill_all':
        return killedMonsters >= totalMonsters;
      case 'open_all_chests':
        return openedChests >= totalChests;
      case 'both':
        return killedMonsters >= totalMonsters && openedChests >= totalChests;
      default:
        return false;
    }
  }
  
  private completeChallenge() {
    if (!this.state.challenge) return;
    
    this.state.challengeCompleted = true;
    this.state.scene = 'victory';
    
    const challenge = this.state.challenge;
    const timeSpent = this.state.challengeTimeSpent;
    const noDamage = this.state.challengeDamageTaken === 0;
    const fastComplete = timeSpent <= 60;
    
    const existingRecord = getChallengeRecord(challenge.date);
    const isFirstCompletion = !existingRecord?.completed;
    const previousBestTime = existingRecord?.bestTime ?? null;
    const isNewBestTime = previousBestTime === null || timeSpent < previousBestTime;
    
    this.state.challengeIsFirstCompletion = isFirstCompletion;
    this.state.challengeIsNewBestTime = isNewBestTime;
    this.state.challengePreviousBestTime = previousBestTime;
    
    let totalPoints = 0;
    let saveData = loadSaveData();
    
    if (isFirstCompletion) {
      const basePoints = challenge.talentPointsReward;
      const timeBonus = Math.max(0, Math.floor((challenge.timeLimit - timeSpent) / 10));
      totalPoints = basePoints + timeBonus;
      
      this.state.earnedTalentPoints = totalPoints;
      saveData = addTalentPoints(totalPoints);
    } else {
      this.state.earnedTalentPoints = 0;
    }
    
    const newBestTime = isNewBestTime ? timeSpent : previousBestTime!;
    
    saveChallengeRecord(challenge.date, {
      date: challenge.date,
      completed: true,
      timeSpent,
      killCount: this.state.killCount,
      chestsOpened: this.state.chests.filter(c => c.opened).length,
      bestTime: newBestTime,
    });
    
    if (isFirstCompletion) {
      unlockBadge('badge_first_challenge');
      
      if (fastComplete) {
        unlockBadge('badge_speed_runner');
      }
      
      if (noDamage) {
        unlockBadge('badge_perfect');
      }
      
      if (challenge.goalType === 'both' || challenge.goalType === 'open_all_chests') {
        unlockBadge('badge_collector');
      }
      
      if (challenge.goalType === 'both' || challenge.goalType === 'kill_all') {
        unlockBadge('badge_slayer');
      }
      
      const streak = getStreakDays();
      if (streak >= 7) {
        unlockBadge('badge_week_streak');
      }
      
      if (saveData.totalChallengesCompleted >= 30) {
        unlockBadge('badge_master');
      }
      
      if (challenge.badgeReward) {
        unlockBadge(challenge.badgeReward);
      }
    }
    
    updateSaveData({
      totalKills: saveData.totalKills + this.state.killCount,
    });
    
    this.notifyStateChange();
  }
  
  private failChallenge() {
    if (!this.state.challenge) return;
    
    this.state.challengeFailed = true;
    this.state.scene = 'gameover';
    
    saveChallengeRecord(this.state.challenge.date, {
      date: this.state.challenge.date,
      completed: false,
      timeSpent: this.state.challengeTimeSpent,
      killCount: this.state.killCount,
      chestsOpened: this.state.chests.filter(c => c.opened).length,
    });
    
    this.notifyStateChange();
  }
  
  public goToMenu() {
    this.state.scene = 'menu';
    this.state.isChallengeMode = false;
    this.state.challenge = null;
    this.isPaused = false;
    getAudioManager().stopBGM();
    this.notifyStateChange();
  }
  
  public startChallenge(challenge: DailyChallenge) {
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    this.hpRegenTimer = 0;
    
    const challengeRunes = challenge.requiredRuneIds
      .map(id => ALL_RUNES.find(r => r.id === id))
      .filter((r): r is Rune => r !== undefined);
    
    const equipped: (Rune | null)[] = [null, null, null, null];
    challengeRunes.forEach((rune, i) => {
      if (i < 4) equipped[i] = rune;
    });
    
    const dungeon = generateDungeon(challenge.level);
    const monsters = generateMonsters(dungeon, challenge.level);
    const chests = generateChests(dungeon, challenge.level);
    
    const adjustedMonsters = monsters.slice(0, challenge.monsterCount);
    const adjustedChests = chests.slice(0, challenge.chestCount);
    
    const startPos = getPlayerStartPosition(dungeon);
    
    const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
    const updatedDungeon = updateFOV(dungeon, startPos, fovRadius);
    
    const maxHp = GAME_CONFIG.PLAYER_MAX_HP + talentEffects.maxHp;
    const speed = GAME_CONFIG.PLAYER_SPEED * (1 + talentEffects.speed);
    
    this.state.scene = 'playing';
    this.state.dungeon = updatedDungeon;
    this.state.monsters = adjustedMonsters;
    this.state.chests = adjustedChests;
    this.state.currentLevel = challenge.level;
    this.state.killCount = 0;
    this.state.gold = 0;
    this.state.runeDust = 0;
    this.state.projectiles = [];
    this.state.monsterProjectiles = [];
    this.state.particles = [];
    this.state.damageNumbers = [];
    this.state.skillVFXs = [];
    this.state.screenFlash = null;
    this.state.colorFilter = null;
    this.state.playerChant = null;
    this.state.screenShake = { intensity: 0, duration: 0, maxDuration: 0 };
    this.state.runeInventory = challengeRunes;
    this.state.equippedRunes = equipped;
    this.state.activeSkills = [];
    this.state.earnedTalentPoints = 0;
    this.state.isChallengeMode = true;
    this.state.challenge = challenge;
    this.state.challengeTimeRemaining = challenge.timeLimit;
    this.state.challengeTimeSpent = 0;
    this.state.challengeCompleted = false;
    this.state.challengeFailed = false;
    this.state.challengeDamageTaken = 0;
    this.state.gameTime = 0;
    this.state.player = {
      position: { ...startPos },
      hp: maxHp,
      maxHp: maxHp,
      speed: speed,
      direction: 1,
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
      attackCooldown: 500,
      currentAttackCooldown: 0,
      invincible: 0,
      shieldTimer: 0,
      damageBoostTimer: 0,
      damageBoostPercent: 0,
      classType: null,
    };
    
    const challengeSaveData = loadSaveData();
    const challengePetType = challengeSaveData.selectedPet || 'fire_dragonling';
    const challengeSavedSkillId = getPetSkill(challengePetType);
    const challengePet = createPet(challengePetType as any, { x: startPos.x - 30, y: startPos.y + 20 }, challengeSavedSkillId || undefined);
    this.state.pet = challengePet;
    
    this.updateSkillsFromRunes();
    challengeRunes.forEach(r => discoverRune(r.id));
    
    getAudioManager().startBGM();
    this.notifyStateChange();
  }
  
  public useSkill(skillIndex: number) {
    if (this.state.scene !== 'playing') return;
    if (this.state.playerChant?.isChanting) return;

    const skill = this.state.activeSkills[skillIndex];
    if (!skill || skill.currentCooldown > 0) return;

    const chantDuration = skill.effect === 'power' ? 400 : skill.effect === 'pierce' ? 200 : 300;

    this.state.playerChant = {
      isChanting: true,
      skillIndex,
      timer: 0,
      duration: chantDuration,
      element: skill.element,
      color: getElementColor(skill.element),
    };

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 15;
      this.addParticle(
        this.state.player.position.x + Math.cos(angle) * dist,
        this.state.player.position.y + Math.sin(angle) * dist,
        getElementColor(skill.element),
        'magic'
      );
    }
  }

  private completeSkillCast(skillIndex: number) {
    const skill = this.state.activeSkills[skillIndex];
    if (!skill) return;

    skill.currentCooldown = skill.cooldown;

    const player = this.state.player;

    getAudioManager().playSFX('skill');

    this.addScreenShake(3, 150);
    this.addScreenFlash(getElementColor(skill.element), 0.15, 100);
    this.addColorFilter(getElementColor(skill.element), 0.08, 500);

    if (skill.effect === 'spread') {
      this.castAreaSkill(skill);
    } else if (skill.effect === 'time') {
      this.castDurationSkill(skill);
    } else if (skill.effect === 'power') {
      this.castPowerSkill(skill);
    } else if (skill.effect === 'pierce') {
      this.castPierceSkill(skill);
    }
  }
  
  public usePotion(potionId: string, target: 'player' | 'pet' = 'player'): boolean {
    if (this.state.scene !== 'playing') return false;
    
    const potionIndex = this.state.potionInventory.findIndex(p => p.id === potionId);
    if (potionIndex === -1) return false;
    
    const potion = this.state.potionInventory[potionIndex];
    
    if (this.state.potionCooldowns[potion.templateId] > 0) return false;
    
    let success = false;
    
    switch (potion.type) {
      case 'health':
        if (target === 'player') {
          const oldHp = this.state.player.hp;
          this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + potion.value);
          success = this.state.player.hp > oldHp;
          
          if (success) {
            this.addDamageNumber(this.state.player.position, potion.value, '#7bed9f', false);
            for (let i = 0; i < 12; i++) {
              this.addParticle(
                this.state.player.position.x + (Math.random() - 0.5) * 25,
                this.state.player.position.y - 10 + (Math.random() - 0.5) * 25,
                '#7bed9f',
                'magic'
              );
            }
          }
        }
        break;
        
      case 'attack':
        if (target === 'player') {
          this.state.player.damageBoostPercent = Math.max(this.state.player.damageBoostPercent, potion.value);
          this.state.player.damageBoostTimer = Math.max(this.state.player.damageBoostTimer, potion.duration || 15000);
          this.state.potionBuffTimers['attack'] = potion.duration || 15000;
          success = true;
          
          for (let i = 0; i < 15; i++) {
            this.addParticle(
              this.state.player.position.x + (Math.random() - 0.5) * 35,
              this.state.player.position.y + (Math.random() - 0.5) * 35,
              potion.color,
              'spark'
            );
          }
        }
        break;
        
      case 'defense':
        if (target === 'player') {
          this.state.player.shieldTimer = Math.max(this.state.player.shieldTimer, potion.duration || 15000);
          this.state.potionBuffTimers['defense'] = potion.duration || 15000;
          success = true;
          
          for (let i = 0; i < 15; i++) {
            this.addParticle(
              this.state.player.position.x + (Math.random() - 0.5) * 35,
              this.state.player.position.y + (Math.random() - 0.5) * 35,
              potion.color,
              'magic'
            );
          }
        }
        break;
        
      case 'speed':
        if (target === 'player') {
          this.state.player.speed = GAME_CONFIG.PLAYER_SPEED * (1 + potion.value / 100);
          this.state.potionBuffTimers['speed'] = potion.duration || 10000;
          success = true;
          
          for (let i = 0; i < 12; i++) {
            this.addParticle(
              this.state.player.position.x + (Math.random() - 0.5) * 30,
              this.state.player.position.y + (Math.random() - 0.5) * 30,
              potion.color,
              'spark'
            );
          }
        }
        break;
        
      case 'heal_pet':
        if (target === 'pet' && this.state.pet) {
          const pet = this.state.pet;
          const healAmount = Math.floor(pet.maxHp * (potion.value / 100));
          const oldHp = pet.hp;
          pet.hp = Math.min(pet.maxHp, pet.hp + healAmount);
          success = pet.hp > oldHp;
          
          if (success) {
            this.addDamageNumber(pet.position, healAmount, '#7bed9f', false);
            for (let i = 0; i < 10; i++) {
              this.addParticle(
                pet.position.x + (Math.random() - 0.5) * 20,
                pet.position.y - 5 + (Math.random() - 0.5) * 20,
                '#ff6b81',
                'magic'
              );
            }
          }
        }
        break;
    }
    
    if (success) {
      this.state.potionCooldowns[potion.templateId] = potion.cooldown;
      this.state.potionInventory.splice(potionIndex, 1);
      savePotions(this.state.potionInventory, this.state.materialInventory);
      this.notifyStateChange();
    }
    
    return success;
  }
  
  public craftPotion(potionTemplateId: string): boolean {
    const recipe = getRecipeByPotionId(potionTemplateId);
    if (!recipe) return false;
    
    const materialCounts: Record<string, number> = {};
    for (const mat of this.state.materialInventory) {
      materialCounts[mat.id] = (materialCounts[mat.id] || 0) + 1;
    }
    
    for (const req of recipe.materials) {
      if ((materialCounts[req.materialId] || 0) < req.count) {
        return false;
      }
    }
    
    for (const req of recipe.materials) {
      let remaining = req.count;
      for (let i = this.state.materialInventory.length - 1; i >= 0 && remaining > 0; i--) {
        if (this.state.materialInventory[i].id === req.materialId) {
          this.state.materialInventory.splice(i, 1);
          remaining--;
        }
      }
    }
    
    const newPotion = createPotion(potionTemplateId);
    if (newPotion) {
      this.state.potionInventory.push(newPotion);
      discoverPotion(potionTemplateId);
      savePotions(this.state.potionInventory, this.state.materialInventory);
      this.notifyStateChange();
      return true;
    }
    
    return false;
  }
  
  public getMaterialCount(materialId: string): number {
    return this.state.materialInventory.filter(m => m.id === materialId).length;
  }
  
  public getPotionCooldown(potionTemplateId: string): number {
    return this.state.potionCooldowns[potionTemplateId] || 0;
  }
  
  public buyShopItem(itemId: string): boolean {
    if (!this.state.dungeon || !this.state.dungeon.shop) return false;
    
    const shop = this.state.dungeon.shop;
    const shopItem = shop.items.find(item => item.id === itemId);
    
    if (!shopItem || shopItem.sold) return false;
    
    const saveData = loadSaveData();
    if (saveData.talentPoints < shopItem.price) return false;
    
    if (shopItem.type === 'rune') {
      const rune = shopItem.item as Rune;
      this.state.runeInventory.push({ ...rune });
      discoverRune(rune.id);
    } else if (shopItem.type === 'equipment') {
      const equipment = shopItem.item as Equipment;
      this.state.equipmentInventory.push({ ...equipment });
      discoverEquipment(equipment.templateId);
      saveEquipment(this.state.equipmentInventory, this.state.equippedEquipment);
    } else if (shopItem.type === 'potion') {
      const potion = shopItem.item as Potion;
      this.state.potionInventory.push({ ...potion });
      discoverPotion(potion.templateId);
      savePotions(this.state.potionInventory, this.state.materialInventory);
    }
    
    const newTalentPoints = saveData.talentPoints - shopItem.price;
    const newSaveData = { ...saveData, talentPoints: newTalentPoints };
    updateSaveData(newSaveData);
    
    shopItem.sold = true;
    
    this.notifyStateChange();
    return true;
  }
  
  private addMaterialDrop(level: number): PotionMaterial | null {
    const dropChance = 0.3 + level * 0.03;
    
    if (Math.random() < dropChance) {
      const rand = Math.random();
      let rarity: 'common' | 'rare' | 'epic' = 'common';
      
      if (rand > 0.95) rarity = 'epic';
      else if (rand > 0.7) rarity = 'rare';
      
      const material = getRandomMaterial(rarity);
      if (material) {
        this.state.materialInventory.push(material);
        discoverMaterial(material.id);
        savePotions(this.state.potionInventory, this.state.materialInventory);
        return material;
      }
    }
    return null;
  }
  
  private addPotionDrop(level: number): Potion | null {
    const dropChance = 0.1 + level * 0.01;
    
    if (Math.random() < dropChance) {
      const rand = Math.random();
      let rarity: 'common' | 'rare' | 'epic' = 'common';
      
      if (rand > 0.9) rarity = 'epic';
      else if (rand > 0.6) rarity = 'rare';
      
      const potion = getRandomPotion(rarity);
      if (potion) {
        this.state.potionInventory.push(potion);
        discoverPotion(potion.templateId);
        savePotions(this.state.potionInventory, this.state.materialInventory);
        return potion;
      }
    }
    return null;
  }
  
  private castAreaSkill(skill: Skill) {
    const player = this.state.player;
    const color = getElementColor(skill.element);

    this.addSkillVFX({
      id: generateId(),
      type: 'explosion_ring',
      position: { ...player.position },
      element: skill.element,
      color,
      life: 600,
      maxLife: 600,
      radius: 5,
      maxRadius: skill.range,
    });

    this.addSkillVFX({
      id: generateId(),
      type: 'shockwave',
      position: { ...player.position },
      element: skill.element,
      color,
      life: 400,
      maxLife: 400,
      radius: 5,
      maxRadius: skill.range * 1.2,
      lineWidth: 3,
    });

    this.addScreenShake(5, 300);
    this.addScreenFlash(color, 0.25, 150);

    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const dist = Math.random() * skill.range * 0.5;
      this.addParticle(
        player.position.x + Math.cos(angle) * dist,
        player.position.y + Math.sin(angle) * dist,
        color,
        'explosion'
      );
    }

    if (skill.element === 'fire') {
      for (let i = 0; i < 20; i++) {
        this.addParticle(
          player.position.x + (Math.random() - 0.5) * skill.range,
          player.position.y + (Math.random() - 0.5) * skill.range,
          '#ffe66d',
          'spark'
        );
      }
    } else if (skill.element === 'ice') {
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        this.addParticle(
          player.position.x + Math.cos(angle) * skill.range * 0.7,
          player.position.y + Math.sin(angle) * skill.range * 0.7,
          '#ffffff',
          'magic'
        );
      }
    } else if (skill.element === 'thunder') {
      for (let i = 0; i < 12; i++) {
        this.addParticle(
          player.position.x + (Math.random() - 0.5) * skill.range * 0.8,
          player.position.y + (Math.random() - 0.5) * skill.range * 0.8,
          '#ffffff',
          'spark'
        );
      }
    }

    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      const dist = distance(player.position, monster.position);
      if (dist < skill.range) {
        this.damageMonster(monster, skill.damage, skill.element, skill.effect);
        this.addSkillVFX({
          id: generateId(),
          type: 'impact_burst',
          position: { ...monster.position },
          element: skill.element,
          color,
          life: 300,
          maxLife: 300,
          radius: 20,
        });
      }
    }
  }
  
  private castDurationSkill(skill: Skill) {
    const player = this.state.player;
    const color = getElementColor(skill.element);

    this.addSkillVFX({
      id: generateId(),
      type: 'persistent_field',
      position: { ...player.position },
      element: skill.element,
      color,
      life: skill.duration,
      maxLife: skill.duration,
      radius: skill.range,
    });

    this.addSkillVFX({
      id: generateId(),
      type: 'explosion_ring',
      position: { ...player.position },
      element: skill.element,
      color,
      life: 500,
      maxLife: 500,
      radius: 5,
      maxRadius: skill.range,
    });

    this.addScreenShake(2, 200);
    this.addColorFilter(color, 0.1, skill.duration);

    const applyDamage = () => {
      for (const monster of this.state.monsters) {
        if (monster.hp <= 0) continue;
        const dist = distance(player.position, monster.position);
        if (dist < skill.range) {
          this.damageMonster(monster, skill.damage * 0.3, skill.element, skill.effect);
          this.addSkillVFX({
            id: generateId(),
            type: 'impact_burst',
            position: { ...monster.position },
            element: skill.element,
            color,
            life: 200,
            maxLife: 200,
            radius: 15,
          });
        }
      }
    };

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.state.scene === 'playing') {
          applyDamage();

          if (skill.element === 'fire') {
            for (let j = 0; j < 12; j++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * skill.range;
              this.addParticle(
                player.position.x + Math.cos(angle) * dist,
                player.position.y + Math.sin(angle) * dist - 5,
                Math.random() < 0.5 ? '#ff6b35' : '#ffe66d',
                'spark'
              );
            }
          } else if (skill.element === 'ice') {
            for (let j = 0; j < 10; j++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * skill.range;
              this.addParticle(
                player.position.x + Math.cos(angle) * dist,
                player.position.y + Math.sin(angle) * dist,
                Math.random() < 0.5 ? '#4ecdc4' : '#ffffff',
                'magic'
              );
            }
          } else if (skill.element === 'thunder') {
            for (let j = 0; j < 8; j++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * skill.range;
              this.addParticle(
                player.position.x + Math.cos(angle) * dist,
                player.position.y + Math.sin(angle) * dist,
                Math.random() < 0.5 ? '#ffe66d' : '#ffffff',
                'spark'
              );
            }
            this.addScreenFlash('#ffe66d', 0.1, 80);
          }
        }
      }, i * (skill.duration / 5));
    }
  }
  
  private castPowerSkill(skill: Skill) {
    const player = this.state.player;
    const color = getElementColor(skill.element);

    let nearestMonster: Monster | null = null;
    let nearestDist = Infinity;

    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      const dist = distance(player.position, monster.position);
      if (dist < nearestDist && dist < skill.range + 100) {
        nearestDist = dist;
        nearestMonster = monster;
      }
    }

    const targetX = nearestMonster ? nearestMonster.position.x : player.position.x + player.direction * 80;
    const targetY = nearestMonster ? nearestMonster.position.y : player.position.y;

    this.addSkillVFX({
      id: generateId(),
      type: 'beam',
      position: { ...player.position },
      targetPosition: { x: targetX, y: targetY },
      element: skill.element,
      color,
      life: 300,
      maxLife: 300,
      radius: 8,
      lineWidth: 6,
      angle: Math.atan2(targetY - player.position.y, targetX - player.position.x),
    });

    this.addSkillVFX({
      id: generateId(),
      type: 'explosion_ring',
      position: { x: targetX, y: targetY },
      element: skill.element,
      color,
      life: 500,
      maxLife: 500,
      radius: 5,
      maxRadius: skill.range * 0.8,
    });

    this.addSkillVFX({
      id: generateId(),
      type: 'shockwave',
      position: { x: targetX, y: targetY },
      element: skill.element,
      color,
      life: 300,
      maxLife: 300,
      radius: 5,
      maxRadius: skill.range,
      lineWidth: 2,
    });

    this.addSkillVFX({
      id: generateId(),
      type: 'impact_burst',
      position: { x: targetX, y: targetY },
      element: skill.element,
      color,
      life: 400,
      maxLife: 400,
      radius: 30,
    });

    this.addScreenShake(8, 400);
    this.addScreenFlash(color, 0.35, 200);

    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      this.addParticle(
        targetX + Math.cos(angle) * skill.range * 0.3,
        targetY + Math.sin(angle) * skill.range * 0.3,
        color,
        'explosion'
      );
    }

    if (skill.element === 'fire') {
      for (let i = 0; i < 25; i++) {
        this.addParticle(
          targetX + (Math.random() - 0.5) * skill.range * 0.6,
          targetY + (Math.random() - 0.5) * skill.range * 0.6 - 10,
          Math.random() < 0.3 ? '#ffe66d' : '#ff6b35',
          'spark'
        );
      }
    } else if (skill.element === 'ice') {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * skill.range * 0.5;
        this.addParticle(
          targetX + Math.cos(angle) * dist,
          targetY + Math.sin(angle) * dist,
          Math.random() < 0.4 ? '#ffffff' : '#74b9ff',
          'magic'
        );
      }
    } else if (skill.element === 'thunder') {
      for (let i = 0; i < 15; i++) {
        this.addParticle(
          targetX + (Math.random() - 0.5) * skill.range * 0.5,
          targetY + (Math.random() - 0.5) * skill.range * 0.5,
          '#ffffff',
          'spark'
        );
      }
    }

    if (nearestMonster) {
      this.damageMonster(nearestMonster, skill.damage, skill.element, skill.effect, true);
    }
  }
  
  private castPierceSkill(skill: Skill) {
    const player = this.state.player;
    const color = getElementColor(skill.element);

    const proj: Projectile = {
      id: generateId(),
      position: { ...player.position },
      velocity: {
        x: player.direction * skill.projectileSpeed,
        y: 0,
      },
      damage: skill.damage,
      element: skill.element,
      effect: skill.effect,
      range: skill.range,
      traveled: 0,
      piercing: true,
      hitTargets: [],
      size: 10,
    };

    this.state.projectiles.push(proj);

    this.addSkillVFX({
      id: generateId(),
      type: 'projectile_trail',
      position: { ...player.position },
      element: skill.element,
      color,
      life: 200,
      maxLife: 200,
      radius: 15,
      angle: player.direction > 0 ? 0 : Math.PI,
      speed: skill.projectileSpeed,
    });

    this.addScreenShake(2, 100);

    if (skill.element === 'fire') {
      for (let i = 0; i < 10; i++) {
        this.addParticle(
          player.position.x + player.direction * (5 + i * 3),
          player.position.y + (Math.random() - 0.5) * 8,
          Math.random() < 0.5 ? '#ff6b35' : '#ffe66d',
          'spark'
        );
      }
    } else if (skill.element === 'ice') {
      for (let i = 0; i < 8; i++) {
        this.addParticle(
          player.position.x + player.direction * (5 + i * 3),
          player.position.y + (Math.random() - 0.5) * 10,
          Math.random() < 0.5 ? '#4ecdc4' : '#74b9ff',
          'magic'
        );
      }
    } else if (skill.element === 'thunder') {
      for (let i = 0; i < 6; i++) {
        this.addParticle(
          player.position.x + player.direction * (5 + i * 3),
          player.position.y + (Math.random() - 0.5) * 12,
          Math.random() < 0.3 ? '#ffffff' : '#ffe66d',
          'spark'
        );
      }
    }
  }
  
  private damageMonster(
    monster: Monster,
    damage: number,
    element: string,
    effect: string,
    isCrit: boolean = false
  ) {
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    const equipmentStats = calculateEquipmentStats(this.state.equippedEquipment);
    const classStats = this.getClassStats();
    
    const combatStats = calculatePlayerCombatStats(classStats, equipmentStats, talentEffects);
    
    const damageResult = calculatePlayerDamage(
      damage,
      combatStats,
      element,
      monster.element,
      isCrit,
      this.state.player.damageBoostTimer > 0 ? this.state.player.damageBoostPercent : 0
    );
    
    let finalDamage = damageResult.damage;
    let actuallyCrit = damageResult.isCrit;
    const elementMultiplier = damageResult.elementMultiplier;
    
    if (elementMultiplier > 1) {
      const superText = `克制! x${elementMultiplier}`;
    } else if (elementMultiplier < 1) {
      const resistText = `抵抗! x${elementMultiplier}`;
    }
    
    monster.hp -= finalDamage;
    
    const color = getElementColor(element as any);
    this.addDamageNumber(monster.position, finalDamage, color, actuallyCrit);
    getAudioManager().playSFX('hit');

    this.addSkillVFX({
      id: generateId(),
      type: 'impact_burst',
      position: { ...monster.position },
      element: element as any,
      color,
      life: 250,
      maxLife: 250,
      radius: actuallyCrit ? 25 : 15,
    });

    if (actuallyCrit) {
      this.addScreenFlash(color, 0.15, 100);
      this.addScreenShake(3, 150);
    }

    if (element === 'fire') {
      if (!monster.statusEffects.find(s => s.type === 'burn')) {
        monster.statusEffects.push({
          type: 'burn',
          duration: 3000,
          damage: 3,
        });
      }
    } else if (element === 'ice') {
      const effectType = effect === 'time' ? 'frozen' : 'slow';
      if (!monster.statusEffects.find(s => s.type === effectType)) {
        monster.statusEffects.push({
          type: effectType,
          duration: effect === 'time' ? 3000 : 2000,
        });
      }
    } else if (element === 'thunder') {
      if (Math.random() < 0.3 && !monster.statusEffects.find(s => s.type === 'paralyze')) {
        monster.statusEffects.push({
          type: 'paralyze',
          duration: 1000,
        });
      }
    }
    
    if (monster.hp <= 0) {
      this.state.killCount++;
      
      if (!this.state.isChallengeMode) {
        const saveData = loadSaveData();
        const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
        const adjustedDropChance = monster.dropChance * (1 + talentEffects.runeDrop);
        
        if (Math.random() < adjustedDropChance) {
          const rune = ALL_RUNES[Math.floor(Math.random() * ALL_RUNES.length)];
          this.state.runeInventory.push({ ...rune });
          discoverRune(rune.id);
        }
        
        const droppedEquipment = this.addEquipmentDrop(this.state.currentLevel);
        if (droppedEquipment) {
          for (let i = 0; i < 8; i++) {
            this.addParticle(
              monster.position.x,
              monster.position.y,
              droppedEquipment.color,
              'magic'
            );
          }
        }
        
        const droppedMaterial = this.addMaterialDrop(this.state.currentLevel);
        if (droppedMaterial) {
          for (let i = 0; i < 6; i++) {
            this.addParticle(
              monster.position.x + (Math.random() - 0.5) * 20,
              monster.position.y + (Math.random() - 0.5) * 20,
              droppedMaterial.color,
              'magic'
            );
          }
        }
        
        const droppedPotion = this.addPotionDrop(this.state.currentLevel);
        if (droppedPotion) {
          for (let i = 0; i < 8; i++) {
            this.addParticle(
              monster.position.x + (Math.random() - 0.5) * 25,
              monster.position.y + (Math.random() - 0.5) * 25,
              droppedPotion.color,
              'magic'
            );
          }
        }
        
        const goldDrop = Math.floor(5 + this.state.currentLevel * 3 + Math.random() * 10);
        const goldBonus = 1 + talentEffects.goldBonus + equipmentStats.goldBonus;
        this.state.gold += Math.floor(goldDrop * goldBonus);
      }
      
      this.consumeEquipmentDurability(0.5);
      
      for (let i = 0; i < 10; i++) {
        this.addParticle(
          monster.position.x,
          monster.position.y,
          monster.color,
          'spark'
        );
      }
    }
  }
  
  private getPlayerPrimaryElement(): string | undefined {
    const equippedRunes = this.state.equippedRunes.filter(Boolean) as any[];
    const elementRunes = equippedRunes.filter(r => r.type === 'element');
    if (elementRunes.length > 0) {
      return elementRunes[0].element;
    }
    return undefined;
  }

  private damagePlayer(damage: number, attackerElement?: string) {
    if (this.state.player.invincible > 0) return;
    
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    const equipmentStats = calculateEquipmentStats(this.state.equippedEquipment);
    const classStats = this.getClassStats();
    
    const combatStats = calculatePlayerCombatStats(classStats, equipmentStats, talentEffects);
    const playerElement = this.getPlayerPrimaryElement();
    
    const finalDamage = calculateMonsterDamage(
      damage,
      attackerElement,
      playerElement,
      combatStats,
      this.state.player.shieldTimer > 0
    );
    
    this.state.player.hp -= finalDamage;
    this.state.player.invincible = GAME_CONFIG.INVINCIBLE_DURATION;
    
    if (this.state.isChallengeMode) {
      this.state.challengeDamageTaken += finalDamage;
    }
    
    this.addDamageNumber(this.state.player.position, finalDamage, '#ff4757', false);
    getAudioManager().playSFX('damage');

    this.addScreenFlash('#ff4757', 0.3, 200);
    this.addScreenShake(6, 300);
    this.addColorFilter('#ff0000', 0.15, 400);

    this.consumeEquipmentDurability(1);
    
    for (let i = 0; i < 8; i++) {
      this.addParticle(
        this.state.player.position.x,
        this.state.player.position.y,
        '#ff4757',
        'spark'
      );
    }
  }
  
  private addParticle(x: number, y: number, color: string, type: 'spark' | 'smoke' | 'explosion' | 'magic') {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'explosion' ? 100 : type === 'magic' ? 30 : 50;

    this.state.particles.push({
      id: generateId(),
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
        y: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
      },
      color,
      size: type === 'explosion' ? 4 + Math.random() * 4 : 2 + Math.random() * 2,
      life: type === 'magic' ? 800 : 500,
      maxLife: type === 'magic' ? 800 : 500,
      type,
    });
  }

  private addSkillVFX(vfx: SkillVFX) {
    this.state.skillVFXs.push(vfx);
  }

  private addScreenShake(intensity: number, duration: number) {
    this.state.screenShake = {
      intensity,
      duration,
      maxDuration: duration,
    };
  }

  private addScreenFlash(color: string, intensity: number, duration: number) {
    this.state.screenFlash = {
      color,
      alpha: intensity,
      duration,
      maxDuration: duration,
      intensity,
    };
  }

  private addColorFilter(color: string, alpha: number, duration: number) {
    this.state.colorFilter = {
      color,
      alpha,
      duration,
      maxDuration: duration,
    };
  }
  
  private addDamageNumber(position: Position, value: number, color: string, isCrit: boolean) {
    this.state.damageNumbers.push({
      id: generateId(),
      position: { x: position.x + (Math.random() - 0.5) * 20, y: position.y - 10 },
      value,
      color,
      life: 1000,
      maxLife: 1000,
      isCrit,
    });
  }
  
  public handleKeyDown(key: string) {
    this.keys.add(key.toLowerCase());
    
    if (this.state.scene === 'playing') {
      if (this.isActionPressed('skill_1')) this.useSkill(0);
      if (this.isActionPressed('skill_2')) this.useSkill(1);
      if (this.isActionPressed('skill_3')) this.useSkill(2);
      if (this.isActionPressed('skill_4')) this.useSkill(3);
    }
  }
  
  public handleKeyUp(key: string) {
    this.keys.delete(key.toLowerCase());
  }
  
  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    if (this.onPauseChange) {
      this.onPauseChange(this.isPaused);
    }
    const audio = getAudioManager();
    if (this.isPaused) {
      audio.pauseBGM();
    } else {
      audio.resumeBGM();
    }
    return this.isPaused;
  }
  
  public getPaused(): boolean {
    return this.isPaused;
  }
  
  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (this.onPauseChange) {
      this.onPauseChange(this.isPaused);
    }
  }
  
  public resetGame() {
    this.isPaused = false;
    this.keys.clear();
    this.hpRegenTimer = 0;
    this.state = this.createInitialState();
    this.notifyStateChange();
  }
  
  public setCombineSlot(slot: 1 | 2, rune: Rune | null) {
    if (slot === 1) {
      this.state.combineSlot1 = rune;
    } else {
      this.state.combineSlot2 = rune;
    }
    this.updateSkillsFromRunes();
    this.notifyStateChange();
  }
  
  public equipRune(rune: Rune, slot: number) {
    if (slot < 0 || slot >= GAME_CONFIG.MAX_RUNE_SLOTS) return;
    
    this.state.equippedRunes[slot] = rune;
    this.updateSkillsFromRunes();
    this.notifyStateChange();
  }
  
  public updateSkillsFromRunes() {
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    const skills: Skill[] = [];
    const equipped = this.state.equippedRunes.filter(r => r !== null) as Rune[];
    
    const elementRunes = equipped.filter(r => r.type === 'element');
    const effectRunes = equipped.filter(r => r.type === 'effect');
    
    for (const elemRune of elementRunes) {
      for (const effRune of effectRunes) {
        const skill = createSkill(elemRune, effRune);
        if (skill) {
          const skillWithRarity = getSkillWithRarityBonus(skill, elemRune.rarity, effRune.rarity);
          const damageMultiplier = 1 + talentEffects.damage;
          const cooldownMultiplier = 1 - talentEffects.attackSpeed;
          
          skillWithRarity.damage = Math.floor(skillWithRarity.damage * damageMultiplier);
          skillWithRarity.cooldown = Math.floor(skillWithRarity.cooldown * Math.max(0.5, cooldownMultiplier));
          
          skills.push(skillWithRarity);
          discoverSkill(skill.id);
        }
      }
    }
    
    this.state.activeSkills = skills.slice(0, GAME_CONFIG.MAX_RUNE_SLOTS);
  }
  
  private render() {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.state.scene === 'playing' || this.state.scene === 'gameover') {
      this.renderGame();
    }
    
    if (this.isPaused && this.state.scene === 'playing') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2 - 20);
      
      ctx.font = '16px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('按 ESC 继续游戏', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }
  
  private renderGame() {
    if (!this.ctx || !this.canvas || !this.state.dungeon) return;

    const ctx = this.ctx;
    const cam = { ...this.state.camera };
    const tileSize = GAME_CONFIG.TILE_SIZE;

    const shake = this.state.screenShake;
    if (shake.duration > 0 && shake.intensity > 0) {
      const progress = shake.duration / shake.maxDuration;
      const offsetX = (Math.random() - 0.5) * shake.intensity * 2 * progress;
      const offsetY = (Math.random() - 0.5) * shake.intensity * 2 * progress;
      cam.x += offsetX;
      cam.y += offsetY;
    }
    
    const startTileX = Math.max(0, Math.floor(cam.x / tileSize));
    const startTileY = Math.max(0, Math.floor(cam.y / tileSize));
    const endTileX = Math.min(this.state.dungeon.width, Math.ceil((cam.x + this.canvas.width) / tileSize) + 1);
    const endTileY = Math.min(this.state.dungeon.height, Math.ceil((cam.y + this.canvas.height) / tileSize) + 1);
    
    const theme = this.state.dungeon.themeConfig;
    const colors = theme.colors;
    
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = this.state.dungeon.tiles[y][x];
        const screenX = x * tileSize - cam.x;
        const screenY = y * tileSize - cam.y;
        
        if (!tile.explored) {
          continue;
        }
        
        if (tile.type === 'wall') {
          ctx.fillStyle = colors.wall;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          ctx.fillStyle = colors.wallDark;
          ctx.fillRect(screenX, screenY + tileSize - 4, tileSize, 4);
          ctx.fillStyle = colors.wallLight;
          ctx.fillRect(screenX, screenY, tileSize, 4);
          
          if ((tile.variant || 0) % 3 === 0) {
            ctx.fillStyle = colors.wallDark;
            ctx.fillRect(screenX + 4, screenY + 8, 4, 8);
          }
        } else if (tile.type === 'pillar') {
          ctx.fillStyle = colors.wallDark;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else if (tile.type === 'water') {
          ctx.fillStyle = '#2a4a8a';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          
          const waveOffset = Math.sin(Date.now() / 500 + x + y) * 2;
          ctx.fillStyle = '#3a5a9a';
          ctx.fillRect(screenX, screenY + waveOffset + 4, tileSize, 4);
          ctx.fillStyle = '#4a6aaa';
          ctx.fillRect(screenX + 4, screenY + waveOffset + 12, tileSize - 8, 2);
        } else if (tile.type === 'lava') {
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          
          const lavaGlow = (Math.sin(Date.now() / 300 + x * 0.5 + y * 0.5) + 1) / 2;
          ctx.fillStyle = `rgba(255, 107, 53, ${0.3 + lavaGlow * 0.4})`;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(screenX + 4, screenY + 8, 8, 4);
          ctx.fillRect(screenX + 16, screenY + 16, 6, 4);
          
          if (Math.random() < 0.02) {
            ctx.fillStyle = '#ff6b35';
            ctx.fillRect(screenX + 8 + Math.random() * 12, screenY + 4, 2, 4);
          }
        } else {
          ctx.fillStyle = colors.floor;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          
          ctx.fillStyle = colors.floorAlt;
          if ((x + y) % 2 === 0) {
            ctx.fillRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);
          }
        }
        
        if (!tile.visible && tile.explored) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }
    
    const stairs = this.state.dungeon.stairsPosition;
    const stairsScreenX = stairs.x * tileSize + tileSize / 2 - cam.x;
    const stairsScreenY = stairs.y * tileSize + tileSize / 2 - cam.y;
    const stairsTile = this.state.dungeon.tiles[stairs.y][stairs.x];
    if (stairsTile.visible) {
      drawStairs(ctx, stairsScreenX, stairsScreenY, 2);
    }
    
    const animFrame = Math.floor(Date.now() / 200);
    for (const decor of this.state.dungeon.decorations) {
      const screenX = decor.position.x - cam.x;
      const screenY = decor.position.y - cam.y;
      
      if (
        decor.tileX >= 0 && decor.tileX < this.state.dungeon.width &&
        decor.tileY >= 0 && decor.tileY < this.state.dungeon.height &&
        this.state.dungeon.tiles[decor.tileY][decor.tileX].visible
      ) {
        const glowColor = decor.glowColor || this.state.dungeon.themeConfig.colors.accent;
        
        if (decor.glowColor) {
          const glowAlpha = 0.15 + Math.sin(Date.now() / 300) * 0.1;
          ctx.fillStyle = decor.glowColor;
          ctx.globalAlpha = glowAlpha;
          ctx.beginPath();
          ctx.arc(screenX, screenY, tileSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        drawDecoration(
          ctx,
          decor.type,
          screenX,
          screenY,
          decor.variant,
          glowColor,
          animFrame,
          2
        );
      }
    }
    
    for (const chest of this.state.chests) {
      const screenX = chest.position.x - cam.x;
      const screenY = chest.position.y - cam.y;
      
      const tileX = Math.floor(chest.position.x / tileSize);
      const tileY = Math.floor(chest.position.y / tileSize);
      
      if (
        tileX >= 0 && tileX < this.state.dungeon.width &&
        tileY >= 0 && tileY < this.state.dungeon.height &&
        this.state.dungeon.tiles[tileY][tileX].visible
      ) {
        drawChest(ctx, screenX, screenY, chest.opened, 2);
      }
    }
    
    const shop = this.state.dungeon.shop;
    if (shop) {
      const shopScreenX = shop.position.x - cam.x;
      const shopScreenY = shop.position.y - cam.y;
      
      const shopTileX = Math.floor(shop.position.x / tileSize);
      const shopTileY = Math.floor(shop.position.y / tileSize);
      
      if (
        shopTileX >= 0 && shopTileX < this.state.dungeon.width &&
        shopTileY >= 0 && shopTileY < this.state.dungeon.height &&
        this.state.dungeon.tiles[shopTileY][shopTileX].visible
      ) {
        const animFrame = Math.floor(Date.now() / 500) % 2;
        drawShopkeeper(ctx, shopScreenX, shopScreenY, 1, animFrame, 2);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(shopScreenX - 30, shopScreenY - 50, 60, 16);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('商店', shopScreenX, shopScreenY - 38);
        
        const distToPlayer = distance(this.state.player.position, shop.position);
        if (distToPlayer < 50) {
          const promptY = shopScreenY - 68;
          const bounce = Math.sin(Date.now() / 200) * 2;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(shopScreenX - 50, promptY + bounce - 10, 100, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('按空格进入', shopScreenX, promptY + bounce + 4);
        }
      }
    }
    
    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      
      const screenX = monster.position.x - cam.x;
      const screenY = monster.position.y - cam.y;
      
      const tileX = Math.floor(monster.position.x / tileSize);
      const tileY = Math.floor(monster.position.y / tileSize);
      
      if (
        tileX >= 0 && tileX < this.state.dungeon.width &&
        tileY >= 0 && tileY < this.state.dungeon.height &&
        this.state.dungeon.tiles[tileY][tileX].visible
      ) {
        drawMonster(ctx, monster.type, screenX, screenY, monster.color, monster.animFrame, 2, monster.isBoss, monster.bossType);
        
        const hpBarWidth = monster.isBoss ? 36 : 24;
        const hpPercent = monster.hp / monster.maxHp;
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(screenX - hpBarWidth / 2, screenY - (monster.isBoss ? 28 : 20), hpBarWidth, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#7bed9f' : hpPercent > 0.25 ? '#ffeaa7' : '#ff7675';
        ctx.fillRect(screenX - hpBarWidth / 2, screenY - (monster.isBoss ? 28 : 20), hpBarWidth * hpPercent, 4);
        
        if (monster.isBoss) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(monster.name, screenX, screenY - 34);
        }

        const stateColors: Record<string, string> = {
          idle: '#636e72',
          chase: '#ff6b35',
          attack: '#d63031',
          flee: '#74b9ff',
          cast: '#6c5ce7',
          heal: '#7bed9f',
          summon: '#e056a0',
        };
        ctx.fillStyle = stateColors[monster.state] || '#636e72';
        ctx.fillRect(screenX - 10, screenY - (monster.isBoss ? 24 : 14) - 6, 4, 4);
        
        if (monster.statusEffects.length > 0) {
          for (let i = 0; i < monster.statusEffects.length; i++) {
            const effect = monster.statusEffects[i];
            let effectColor = '#ffffff';
            if (effect.type === 'burn') effectColor = '#ff6b35';
            else if (effect.type === 'frozen') effectColor = '#4ecdc4';
            else if (effect.type === 'slow') effectColor = '#74b9ff';
            else if (effect.type === 'paralyze') effectColor = '#ffe66d';
            
            ctx.fillStyle = effectColor;
            ctx.fillRect(screenX - 10 + i * 6, screenY - (monster.isBoss ? 24 : 14) - 12, 4, 4);
          }
        }
      }
    }
    
    const player = this.state.player;
    const playerScreenX = player.position.x - cam.x;
    const playerScreenY = player.position.y - cam.y;
    
    if (player.invincible <= 0 || Math.floor(player.invincible / 50) % 2 === 0) {
      drawFox(ctx, playerScreenX, playerScreenY, player.direction, player.animFrame, 2);
    }
    
    const pet = this.state.pet;
    if (pet && pet.hp > 0) {
      const petScreenX = pet.position.x - cam.x;
      const petScreenY = pet.position.y - cam.y;
      
      const petTileX = Math.floor(pet.position.x / tileSize);
      const petTileY = Math.floor(pet.position.y / tileSize);
      
      if (
        petTileX >= 0 && petTileX < this.state.dungeon.width &&
        petTileY >= 0 && petTileY < this.state.dungeon.height &&
        this.state.dungeon.tiles[petTileY][petTileX].visible
      ) {
        drawPet(ctx, pet.type, petScreenX, petScreenY, pet.direction, pet.animFrame, pet.isAttacking, 2);
        
        const hpPercent = pet.hp / pet.maxHp;
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(petScreenX - 12, petScreenY - 20, 24, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#7bed9f' : hpPercent > 0.25 ? '#ffeaa7' : '#ff7675';
        ctx.fillRect(petScreenX - 12, petScreenY - 20, 24 * hpPercent, 4);
        
        ctx.fillStyle = pet.color;
        ctx.fillRect(petScreenX - 10, petScreenY - 26, 4, 4);
        
        const skillCooldownPercent = pet.skill.currentCooldown / pet.skill.cooldown;
        if (skillCooldownPercent > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(petScreenX - 8, petScreenY - 26, 16, 3);
          ctx.fillStyle = pet.color;
          ctx.fillRect(petScreenX - 8, petScreenY - 26, 16 * (1 - skillCooldownPercent), 3);
        }
      }
    }
    
    for (const proj of this.state.projectiles) {
      const screenX = proj.position.x - cam.x;
      const screenY = proj.position.y - cam.y;
      const color = getElementColor(proj.element);

      ctx.fillStyle = getElementGlowColor(proj.element);
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      const dir = normalize(proj.velocity);
      for (let i = 1; i <= 3; i++) {
        const trailX = screenX - dir.x * i * 6;
        const trailY = screenY - dir.y * i * 6;
        ctx.globalAlpha = 0.6 - i * 0.15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(trailX, trailY, proj.size * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    for (const proj of this.state.monsterProjectiles) {
      const screenX = proj.position.x - cam.x;
      const screenY = proj.position.y - cam.y;

      ctx.fillStyle = proj.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const vfx of this.state.skillVFXs) {
      const screenX = vfx.position.x - cam.x;
      const screenY = vfx.position.y - cam.y;
      const alpha = vfx.life / vfx.maxLife;

      switch (vfx.type) {
        case 'explosion_ring': {
          ctx.globalAlpha = alpha * 0.6;
          ctx.strokeStyle = vfx.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.globalAlpha = alpha * 0.2;
          ctx.fillStyle = vfx.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'shockwave': {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = vfx.color;
          ctx.lineWidth = vfx.lineWidth || 2;
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'persistent_field': {
          const pulse = 0.5 + Math.sin(Date.now() / 200) * 0.15;
          ctx.globalAlpha = alpha * pulse * 0.25;
          ctx.fillStyle = vfx.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = alpha * pulse * 0.4;
          ctx.strokeStyle = vfx.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (vfx.element === 'fire') {
            ctx.globalAlpha = alpha * 0.3;
            for (let i = 0; i < 4; i++) {
              const angle = Date.now() / 300 + i * Math.PI / 2;
              const innerR = vfx.radius * 0.3;
              const outerR = vfx.radius * 0.8;
              const fx = screenX + Math.cos(angle) * (innerR + Math.random() * (outerR - innerR));
              const fy = screenY + Math.sin(angle) * (innerR + Math.random() * (outerR - innerR));
              ctx.fillStyle = Math.random() < 0.5 ? '#ff6b35' : '#ffe66d';
              ctx.fillRect(fx - 2, fy - 2, 4, 4);
            }
          } else if (vfx.element === 'ice') {
            ctx.globalAlpha = alpha * 0.3;
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI * 2 * i) / 6;
              const fx = screenX + Math.cos(angle) * vfx.radius * 0.6;
              const fy = screenY + Math.sin(angle) * vfx.radius * 0.6;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(fx - 1, fy - 1, 2, 2);
            }
          } else if (vfx.element === 'thunder') {
            ctx.globalAlpha = alpha * 0.4;
            const arcAngle = Date.now() / 100;
            const ax = screenX + Math.cos(arcAngle) * vfx.radius * 0.5;
            const ay = screenY + Math.sin(arcAngle) * vfx.radius * 0.5;
            ctx.fillStyle = '#ffe66d';
            ctx.fillRect(ax - 1, ay - 1, 3, 3);
          }
          break;
        }

        case 'beam': {
          if (vfx.targetPosition) {
            const targetScreenX = vfx.targetPosition.x - cam.x;
            const targetScreenY = vfx.targetPosition.y - cam.y;

            ctx.globalAlpha = alpha * 0.8;
            ctx.strokeStyle = vfx.color;
            ctx.lineWidth = vfx.lineWidth || 4;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(targetScreenX, targetScreenY);
            ctx.stroke();

            ctx.globalAlpha = alpha * 0.4;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = (vfx.lineWidth || 4) * 0.5;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(targetScreenX, targetScreenY);
            ctx.stroke();
          }
          break;
        }

        case 'impact_burst': {
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = vfx.color;
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const dist = vfx.radius * (1 - alpha * 0.5);
            const bx = screenX + Math.cos(angle) * dist;
            const by = screenY + Math.sin(angle) * dist;
            ctx.fillRect(bx - 2, by - 2, 4, 4);
          }

          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(screenX, screenY, vfx.radius * alpha * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'projectile_trail': {
          ctx.globalAlpha = alpha * 0.3;
          const trailDir = vfx.angle || 0;
          for (let i = 0; i < 5; i++) {
            const trailDist = i * 8;
            const tx = screenX - Math.cos(trailDir) * trailDist;
            const ty = screenY - Math.sin(trailDir) * trailDist;
            const trailSize = vfx.radius * (1 - i * 0.15);
            ctx.fillStyle = vfx.color;
            ctx.beginPath();
            ctx.arc(tx, ty, trailSize, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
      }
      ctx.globalAlpha = 1;
    }

    const chant = this.state.playerChant;
    if (chant && chant.isChanting) {
      const playerScreenX = this.state.player.position.x - cam.x;
      const playerScreenY = this.state.player.position.y - cam.y;
      const progress = chant.timer / chant.duration;

      ctx.strokeStyle = chant.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.2;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 20 + progress * 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      ctx.globalAlpha = 0.3 + progress * 0.3;
      ctx.fillStyle = chant.color;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 25, 0, Math.PI * 2);
      ctx.fill();

      const innerPulse = 0.5 + Math.sin(Date.now() / 80) * 0.3;
      ctx.globalAlpha = innerPulse * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 8 + progress * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }
    
    for (const p of this.state.particles) {
      const screenX = p.position.x - cam.x;
      const screenY = p.position.y - cam.y;
      const alpha = p.life / p.maxLife;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(screenX - p.size / 2, screenY - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
    
    for (const dn of this.state.damageNumbers) {
      const screenX = dn.position.x - cam.x;
      const screenY = dn.position.y - cam.y;
      const alpha = dn.life / dn.maxLife;
      const progress = 1 - alpha;
      
      const isHeal = dn.color === '#7bed9f';
      
      let scale = 1;
      if (progress < 0.2) {
        scale = 0.5 + (progress / 0.2) * 0.5;
      } else if (dn.isCrit && progress < 0.5) {
        scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
      }
      
      const fontSize = dn.isCrit ? 22 : 16;
      const actualFontSize = fontSize * scale;
      
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = isHeal ? `+${dn.value}` : `-${dn.value}`;
      
      ctx.font = `bold ${actualFontSize}px monospace`;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillText(text, screenX + 2, screenY + 2);
      
      ctx.font = `${dn.isCrit ? 'bold ' : ''}${actualFontSize}px monospace`;
      ctx.fillStyle = dn.color;
      ctx.fillText(text, screenX, screenY);
      
      if (dn.isCrit) {
        ctx.globalAlpha = alpha * 0.4;
        ctx.font = `bold ${actualFontSize * 1.4}px monospace`;
        ctx.fillStyle = dn.color;
        ctx.fillText(text, screenX, screenY);
        ctx.globalAlpha = alpha;
      }
      
      ctx.globalAlpha = 1;
      ctx.textBaseline = 'alphabetic';
    }

    const flash = this.state.screenFlash;
    if (flash && flash.alpha > 0) {
      ctx.globalAlpha = flash.alpha;
      ctx.fillStyle = flash.color;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1;
    }

    const colorFilter = this.state.colorFilter;
    if (colorFilter && colorFilter.alpha > 0) {
      ctx.globalAlpha = colorFilter.alpha;
      ctx.fillStyle = colorFilter.color;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1;
    }
  }
  
  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
  
  public getState() {
    return this.state;
  }
}

let gameEngineInstance: GameEngine | null = null;

export const getGameEngine = (): GameEngine => {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
};
