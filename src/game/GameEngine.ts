import type { GameState, Player, Skill, Rune, Position, Projectile, Particle, DamageNumber, StatusEffect, Monster, Chest, DailyChallenge } from '../types/game';
import { GAME_CONFIG } from '../data/config';
import { generateDungeon, generateMonsters, generateChests, getPlayerStartPosition, updateFOV, isWalkable } from './utils/dungeon';
import { getRandomRunes, createSkill, ALL_RUNES, SKILLS } from '../data/runes';
import { calculateTalentEffects } from '../data/talents';
import { generateId, distance, clamp, normalize } from './utils/math';
import { drawFox, drawMonster, drawChest, drawStairs, drawRuneIcon, getElementColor, getElementGlowColor } from './utils/pixel';
import { updateSaveData, discoverRune, discoverSkill, addTalentPoints, loadSaveData, saveChallengeRecord, getChallengeRecord, unlockBadge, getStreakDays } from './utils/storage';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private keys: Set<string> = new Set();
  private isRunning: boolean = false;
  private hpRegenTimer: number = 0;
  
  public state: GameState;
  public onStateChange: (() => void) | null = null;
  public onChestOpened: ((rewards: { runes: Rune[] }) => void) | null = null;
  
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
      },
      dungeon: null,
      monsters: [],
      chests: [],
      projectiles: [],
      particles: [],
      damageNumbers: [],
      runeInventory: initialRunes,
      equippedRunes: equipped,
      activeSkills: [],
      currentLevel: 1,
      killCount: 0,
      gold: 0,
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
    
    if (this.state.scene === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number) {
    this.updatePlayer(deltaTime);
    this.updateMonsters(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateParticles(deltaTime);
    this.updateDamageNumbers(deltaTime);
    this.updateSkillCooldowns(deltaTime);
    this.updateCamera();
    this.checkChestCollision();
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
    
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) { dx -= 1; player.direction = -1; }
    if (this.keys.has('d') || this.keys.has('arrowright')) { dx += 1; player.direction = 1; }
    
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
      const detectRange = 150;
      
      if (monster.aiType === 'aggressive' && dist < detectRange) {
        const dir = normalize({
          x: player.position.x - monster.position.x,
          y: player.position.y - monster.position.y,
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
      } else if (monster.aiType === 'patrol') {
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
      
      monster.animTimer += deltaTime;
      if (monster.animTimer > 300) {
        monster.animFrame = (monster.animFrame + 1) % 2;
        monster.animTimer = 0;
      }
      
      if (dist < 30 && player.invincible <= 0 && monster.currentAttackCooldown <= 0) {
        this.damagePlayer(monster.damage);
        monster.currentAttackCooldown = monster.attackCooldown;
      }
      
      if (monster.currentAttackCooldown > 0) {
        monster.currentAttackCooldown -= deltaTime;
      }
    }
    
    this.state.monsters = this.state.monsters.filter(m => m.hp > 0);
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
      
      if (Math.random() < 0.3) {
        this.addParticle(
          proj.position.x,
          proj.position.y,
          getElementColor(proj.element),
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
      const dn = this.state.damageNumbers[i];
      dn.position.y -= 30 * (deltaTime / 1000);
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
      if (dist < 30 && this.keys.has(' ')) {
        this.openChest(chest);
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
    if (dist < 25 && this.keys.has(' ')) {
      this.nextLevel();
    }
  }
  
  private openChest(chest: Chest) {
    chest.opened = true;
    const rewardRunes: Rune[] = [];
    
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
    }
    
    for (let i = 0; i < 15; i++) {
      this.addParticle(
        chest.position.x,
        chest.position.y,
        '#ffd700',
        'magic'
      );
    }
    
    if (this.onChestOpened && rewardRunes.length > 0) {
      this.onChestOpened({ runes: rewardRunes });
    }
    
    this.notifyStateChange();
  }
  
  private nextLevel() {
    this.state.currentLevel++;
    
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    const newDungeon = generateDungeon(this.state.currentLevel);
    const newMonsters = generateMonsters(newDungeon, this.state.currentLevel);
    const newChests = generateChests(newDungeon, this.state.currentLevel);
    const startPos = getPlayerStartPosition(newDungeon);
    
    const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
    const updatedDungeon = updateFOV(newDungeon, startPos, fovRadius);
    
    this.state.dungeon = updatedDungeon;
    this.state.monsters = newMonsters;
    this.state.chests = newChests;
    this.state.player.position = { ...startPos };
    this.state.projectiles = [];
    this.state.particles = [];
    
    updateSaveData({ highestLevel: Math.max(this.state.currentLevel, (window as any).highestLevel || 0) });
    
    this.notifyStateChange();
  }
  
  public startGame() {
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    
    this.hpRegenTimer = 0;
    
    const baseRuneCount = 4 + talentEffects.startRunes;
    const initialRunes = getRandomRunes(Math.max(4, Math.min(baseRuneCount, 8)));
    const equipped: (Rune | null)[] = [null, null, null, null];
    
    initialRunes.forEach((rune, i) => {
      if (i < 4) equipped[i] = rune;
    });
    
    const dungeon = generateDungeon(1);
    const monsters = generateMonsters(dungeon, 1);
    const chests = generateChests(dungeon, 1);
    const startPos = getPlayerStartPosition(dungeon);
    
    const fovRadius = GAME_CONFIG.FOV_RADIUS + talentEffects.fov;
    const updatedDungeon = updateFOV(dungeon, startPos, fovRadius);
    
    const maxHp = GAME_CONFIG.PLAYER_MAX_HP + talentEffects.maxHp;
    const speed = GAME_CONFIG.PLAYER_SPEED * (1 + talentEffects.speed);
    
    this.state.scene = 'playing';
    this.state.dungeon = updatedDungeon;
    this.state.monsters = monsters;
    this.state.chests = chests;
    this.state.currentLevel = 1;
    this.state.killCount = 0;
    this.state.gold = 0;
    this.state.projectiles = [];
    this.state.particles = [];
    this.state.damageNumbers = [];
    this.state.runeInventory = initialRunes;
    this.state.equippedRunes = equipped;
    this.state.activeSkills = [];
    this.state.earnedTalentPoints = 0;
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
    };
    
    this.updateSkillsFromRunes();
    initialRunes.forEach(r => discoverRune(r.id));
    
    this.notifyStateChange();
  }
  
  private gameOver() {
    this.state.scene = 'gameover';
    
    if (this.state.isChallengeMode && !this.state.challengeCompleted) {
      this.failChallenge();
    } else {
      const talentPointsEarned = Math.max(1, Math.floor(this.state.currentLevel / 2) + Math.floor(this.state.killCount / 10));
      this.state.earnedTalentPoints = talentPointsEarned;
      
      const saveData = addTalentPoints(talentPointsEarned);
      
      updateSaveData({
        totalKills: saveData.totalKills + this.state.killCount,
        highestLevel: Math.max(this.state.currentLevel, saveData.highestLevel),
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
    this.state.projectiles = [];
    this.state.particles = [];
    this.state.damageNumbers = [];
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
    };
    
    this.updateSkillsFromRunes();
    challengeRunes.forEach(r => discoverRune(r.id));
    
    this.notifyStateChange();
  }
  
  public useSkill(skillIndex: number) {
    if (this.state.scene !== 'playing') return;
    
    const skill = this.state.activeSkills[skillIndex];
    if (!skill || skill.currentCooldown > 0) return;
    
    skill.currentCooldown = skill.cooldown;
    
    const player = this.state.player;
    const targetX = player.position.x + player.direction * 50;
    const targetY = player.position.y;
    
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
  
  private castAreaSkill(skill: Skill) {
    const player = this.state.player;
    
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      this.addParticle(
        player.position.x + Math.cos(angle) * skill.range * 0.5,
        player.position.y + Math.sin(angle) * skill.range * 0.5,
        getElementColor(skill.element),
        'explosion'
      );
    }
    
    for (const monster of this.state.monsters) {
      if (monster.hp <= 0) continue;
      const dist = distance(player.position, monster.position);
      if (dist < skill.range) {
        this.damageMonster(monster, skill.damage, skill.element, skill.effect);
      }
    }
  }
  
  private castDurationSkill(skill: Skill) {
    const player = this.state.player;
    
    const applyDamage = () => {
      for (const monster of this.state.monsters) {
        if (monster.hp <= 0) continue;
        const dist = distance(player.position, monster.position);
        if (dist < skill.range) {
          this.damageMonster(monster, skill.damage * 0.3, skill.element, skill.effect);
        }
      }
    };
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.state.scene === 'playing') {
          applyDamage();
          
          for (let j = 0; j < 8; j++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * skill.range;
            this.addParticle(
              player.position.x + Math.cos(angle) * dist,
              player.position.y + Math.sin(angle) * dist,
              getElementColor(skill.element),
              'magic'
            );
          }
        }
      }, i * (skill.duration / 5));
    }
  }
  
  private castPowerSkill(skill: Skill) {
    const player = this.state.player;
    
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
    
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 * i) / 25;
      this.addParticle(
        targetX + Math.cos(angle) * skill.range * 0.3,
        targetY + Math.sin(angle) * skill.range * 0.3,
        getElementColor(skill.element),
        'explosion'
      );
    }
    
    if (nearestMonster) {
      this.damageMonster(nearestMonster, skill.damage, skill.element, skill.effect, true);
    }
  }
  
  private castPierceSkill(skill: Skill) {
    const player = this.state.player;
    
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
    
    let finalDamage = damage;
    let actuallyCrit = isCrit;
    
    if (!isCrit && talentEffects.critChance > 0) {
      if (Math.random() < talentEffects.critChance) {
        actuallyCrit = true;
        const critMultiplier = 2 + talentEffects.critDamage;
        finalDamage = Math.floor(damage * critMultiplier);
      }
    } else if (isCrit) {
      finalDamage = Math.floor(damage * (2 + talentEffects.critDamage));
    }
    
    monster.hp -= finalDamage;
    
    const color = getElementColor(element as any);
    this.addDamageNumber(monster.position, finalDamage, color, actuallyCrit);
    
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
      }
      
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
  
  private damagePlayer(damage: number) {
    if (this.state.player.invincible > 0) return;
    
    const saveData = loadSaveData();
    const talentEffects = calculateTalentEffects(saveData.unlockedTalents);
    const finalDamage = Math.max(1, Math.floor(damage * (1 - talentEffects.damageReduction)));
    
    this.state.player.hp -= finalDamage;
    this.state.player.invincible = GAME_CONFIG.INVINCIBLE_DURATION;
    
    if (this.state.isChallengeMode) {
      this.state.challengeDamageTaken += finalDamage;
    }
    
    this.addDamageNumber(this.state.player.position, finalDamage, '#ff4757', false);
    
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
      if (key === '1') this.useSkill(0);
      if (key === '2') this.useSkill(1);
      if (key === '3') this.useSkill(2);
      if (key === '4') this.useSkill(3);
    }
  }
  
  public handleKeyUp(key: string) {
    this.keys.delete(key.toLowerCase());
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
          const damageMultiplier = 1 + talentEffects.damage;
          const cooldownMultiplier = 1 - talentEffects.attackSpeed;
          
          skill.damage = Math.floor(skill.damage * damageMultiplier);
          skill.cooldown = Math.floor(skill.cooldown * Math.max(0.5, cooldownMultiplier));
          
          skills.push(skill);
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
  }
  
  private renderGame() {
    if (!this.ctx || !this.canvas || !this.state.dungeon) return;
    
    const ctx = this.ctx;
    const cam = this.state.camera;
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    const startTileX = Math.max(0, Math.floor(cam.x / tileSize));
    const startTileY = Math.max(0, Math.floor(cam.y / tileSize));
    const endTileX = Math.min(this.state.dungeon.width, Math.ceil((cam.x + this.canvas.width) / tileSize) + 1);
    const endTileY = Math.min(this.state.dungeon.height, Math.ceil((cam.y + this.canvas.height) / tileSize) + 1);
    
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = this.state.dungeon.tiles[y][x];
        const screenX = x * tileSize - cam.x;
        const screenY = y * tileSize - cam.y;
        
        if (!tile.explored) {
          continue;
        }
        
        if (tile.type === 'wall') {
          ctx.fillStyle = '#4a4a6a';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          ctx.fillStyle = '#3a3a5a';
          ctx.fillRect(screenX, screenY + tileSize - 4, tileSize, 4);
          ctx.fillStyle = '#5a5a7a';
          ctx.fillRect(screenX, screenY, tileSize, 4);
        } else {
          ctx.fillStyle = '#2d2d44';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          
          ctx.fillStyle = '#252538';
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
        drawMonster(ctx, monster.type, screenX, screenY, monster.color, monster.animFrame, 2);
        
        const hpPercent = monster.hp / monster.maxHp;
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(screenX - 12, screenY - 20, 24, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#7bed9f' : hpPercent > 0.25 ? '#ffeaa7' : '#ff7675';
        ctx.fillRect(screenX - 12, screenY - 20, 24 * hpPercent, 4);
        
        if (monster.statusEffects.length > 0) {
          for (let i = 0; i < monster.statusEffects.length; i++) {
            const effect = monster.statusEffects[i];
            let effectColor = '#ffffff';
            if (effect.type === 'burn') effectColor = '#ff6b35';
            else if (effect.type === 'frozen') effectColor = '#4ecdc4';
            else if (effect.type === 'slow') effectColor = '#74b9ff';
            else if (effect.type === 'paralyze') effectColor = '#ffe66d';
            
            ctx.fillStyle = effectColor;
            ctx.fillRect(screenX - 10 + i * 6, screenY - 26, 4, 4);
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
    
    for (const proj of this.state.projectiles) {
      const screenX = proj.position.x - cam.x;
      const screenY = proj.position.y - cam.y;
      
      ctx.fillStyle = getElementColor(proj.element);
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = getElementGlowColor(proj.element);
      ctx.beginPath();
      ctx.arc(screenX, screenY, proj.size + 4, 0, Math.PI * 2);
      ctx.fill();
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
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = dn.color;
      ctx.font = `${dn.isCrit ? 'bold ' : ''}16px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(dn.value > 0 ? `-${dn.value}` : '', screenX, screenY);
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
