import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Heart, Skull, Swords, Map, Clock, Target, Package, Star, FlaskConical, Shield, Sword, Wind, PawPrint, Settings, Zap, Timer, Trophy } from 'lucide-react';
import { SKILLS } from '../data/runes';
import type { RuneElement, Potion } from '../types/game';
import { formatTime } from '../data/challenges';
import { getPotionTemplate } from '../data/potions';
import { DIFFICULTY_CONFIGS } from '../data/difficulty';
import { loadSettings, DEFAULT_KEY_BINDINGS } from '../game/utils/storage';

const getElementColorClass = (element: RuneElement): string => {
  switch (element) {
    case 'fire': return 'from-orange-500 to-red-600';
    case 'ice': return 'from-cyan-400 to-blue-500';
    case 'thunder': return 'from-yellow-400 to-amber-500';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getPotionIcon = (type: string) => {
  switch (type) {
    case 'health': return <Heart className="w-5 h-5 text-white" />;
    case 'attack': return <Sword className="w-5 h-5 text-white" />;
    case 'defense': return <Shield className="w-5 h-5 text-white" />;
    case 'speed': return <Wind className="w-5 h-5 text-white" />;
    case 'heal_pet': return <PawPrint className="w-5 h-5 text-white" />;
    default: return <FlaskConical className="w-5 h-5 text-white" />;
  }
};

interface BuffItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  remaining: number;
  duration: number;
}

const GameHUD = () => {
  const { 
    player, 
    currentLevel, 
    killCount, 
    activeSkills, 
    isChallengeMode, 
    challenge, 
    challengeTimeRemaining,
    chests,
    potionInventory,
    potionCooldowns,
    potionBuffTimers,
    pet,
    difficulty,
    gameTime,
    setShowPotionPanel,
    setShowSettings,
    setIsPaused,
  } = useGameStore();
  const engine = getGameEngine();
  
  if (!player) return null;
  
  const hpPercent = (player.hp / player.maxHp) * 100;
  const isLowHp = hpPercent <= 30;
  const isCriticalHp = hpPercent <= 15;
  const openedChests = chests.filter(c => c.opened).length;
  
  const isLowTime = isChallengeMode && challengeTimeRemaining < 30;
  const totalMonsters = challenge?.monsterCount || 0;
  const totalChests = challenge?.chestCount || 0;
  
  const potionCounts: Record<string, { count: number; potion: Potion }> = {};
  for (const potion of potionInventory) {
    if (!potionCounts[potion.templateId]) {
      potionCounts[potion.templateId] = { count: 0, potion };
    }
    potionCounts[potion.templateId].count++;
  }
  
  const quickPotions = Object.values(potionCounts).slice(0, 4);

  const buffs: BuffItem[] = [];
  
  if (player.shieldTimer > 0) {
    buffs.push({
      id: 'shield',
      name: '护盾',
      icon: <Shield className="w-4 h-4" />,
      color: '#54a0ff',
      remaining: player.shieldTimer,
      duration: 15000,
    });
  }
  
  if (player.damageBoostTimer > 0) {
    buffs.push({
      id: 'attack',
      name: '攻击增强',
      icon: <Sword className="w-4 h-4" />,
      color: '#ff9f43',
      remaining: player.damageBoostTimer,
      duration: potionBuffTimers['attack'] ? 15000 : 8000,
    });
  }
  
  if (potionBuffTimers['defense'] && potionBuffTimers['defense'] > 0) {
    buffs.push({
      id: 'defense_potion',
      name: '铁壁',
      icon: <Shield className="w-4 h-4" />,
      color: '#54a0ff',
      remaining: potionBuffTimers['defense'],
      duration: 15000,
    });
  }
  
  if (potionBuffTimers['speed'] && potionBuffTimers['speed'] > 0) {
    buffs.push({
      id: 'speed',
      name: '疾风',
      icon: <Wind className="w-4 h-4" />,
      color: '#5f27cd',
      remaining: potionBuffTimers['speed'],
      duration: 10000,
    });
  }

  const settings = loadSettings();
  const getSkillKey = (index: number) => {
    const key = settings.keyBindings[`skill_${index + 1}` as keyof typeof settings.keyBindings] || String(index + 1);
    return key.toUpperCase();
  };

  const formatMsTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    return formatTime(seconds);
  };

  const hpSegments = Math.ceil(player.maxHp / 50);
  const segmentWidth = 100 / hpSegments;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="bg-gray-900/90 border-4 border-gray-700 p-3 rounded-lg pixel-border">
            <div className="flex items-center gap-2 mb-2">
              <div className={`relative ${isCriticalHp ? 'animate-pulse' : ''}`}>
                <Heart className={`w-6 h-6 ${isCriticalHp ? 'text-red-400' : isLowHp ? 'text-orange-400' : 'text-red-500'}`} />
                {isCriticalHp && (
                  <div className="absolute inset-0 animate-ping">
                    <Heart className="w-6 h-6 text-red-400 opacity-50" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-white font-bold text-sm">生命值</span>
                <div className="text-white text-xs font-mono">
                  {Math.max(0, Math.floor(player.hp))} / {player.maxHp}
                </div>
              </div>
            </div>
            
            <div className="relative w-56 h-6 bg-gray-800 rounded overflow-hidden border-2 border-gray-600">
              <div
                className={`h-full transition-all duration-300 ease-out ${
                  isCriticalHp 
                    ? 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse' 
                    : isLowHp 
                      ? 'bg-gradient-to-r from-orange-600 to-red-500' 
                      : 'bg-gradient-to-r from-red-600 to-red-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
              
              <div className="absolute inset-0 flex pointer-events-none">
                {Array.from({ length: hpSegments }).map((_, i) => (
                  <div 
                    key={i}
                    className="h-full border-r border-black/20 last:border-r-0"
                    style={{ width: `${segmentWidth}%` }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>
            
            {buffs.length > 0 && (
              <div className="flex gap-1.5 mt-3">
                {buffs.map((buff) => {
                  const progress = buff.remaining / buff.duration;
                  return (
                    <div
                      key={buff.id}
                      className="relative w-10 h-10 rounded-lg border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: buff.color,
                        backgroundColor: buff.color + '20',
                        boxShadow: `0 0 8px ${buff.color}40`,
                      }}
                      title={`${buff.name} - ${(buff.remaining / 1000).toFixed(1)}秒`}
                    >
                      <div style={{ color: buff.color }}>
                        {buff.icon}
                      </div>
                      
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke="rgba(0,0,0,0.3)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke={buff.color}
                          strokeWidth="3"
                          strokeDasharray={`${progress * 106.8} 106.8`}
                          strokeLinecap="round"
                          className="transition-all duration-200"
                        />
                      </svg>
                      
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-gray-900/90 px-1 rounded">
                        {Math.ceil(buff.remaining / 1000)}s
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {pet && (
            <div className="bg-gray-900/90 border-4 border-pink-600/50 p-2.5 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <PawPrint className="w-4 h-4 text-pink-400" />
                <span className="text-white text-xs font-bold">{pet.name}</span>
              </div>
              <div className="w-40 h-3 bg-gray-800 rounded overflow-hidden border border-gray-600">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-200"
                  style={{ width: `${(pet.hp / pet.maxHp) * 100}%` }}
                />
              </div>
              <div className="text-pink-200 text-[10px] mt-0.5 font-mono text-center">
                {Math.max(0, Math.floor(pet.hp))} / {pet.maxHp}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2 items-start">
            <button
              onClick={() => {
                engine.togglePause();
                setIsPaused(true);
                setShowSettings(true);
              }}
              className="pointer-events-auto bg-gray-900/90 border-4 border-gray-600 hover:border-yellow-400 p-2 rounded-lg transition-all hover:scale-110"
              title="设置 (ESC)"
            >
              <Settings className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-3">
              <div className="bg-gray-900/90 border-4 border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Timer className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold font-mono">
                  {formatMsTime(gameTime)}
                </span>
              </div>
              
              <div
                className="bg-gray-900/90 border-4 px-4 py-2 rounded-lg flex items-center gap-2"
                style={{ borderColor: DIFFICULTY_CONFIGS[difficulty].borderColor }}
              >
                <span className="text-lg">{DIFFICULTY_CONFIGS[difficulty].icon}</span>
                <span className="font-bold font-mono" style={{ color: DIFFICULTY_CONFIGS[difficulty].color }}>
                  {DIFFICULTY_CONFIGS[difficulty].name}
                </span>
              </div>

              <div className="bg-gray-900/90 border-4 border-purple-500/70 px-4 py-2 rounded-lg flex items-center gap-2">
                <Map className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs text-purple-300">层数</div>
                  <span className="text-white font-bold font-mono">第 {currentLevel} 层</span>
                </div>
              </div>
              
              <div className="bg-gray-900/90 border-4 border-red-500/70 px-4 py-2 rounded-lg flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-xs text-red-300">击杀</div>
                  <span className="text-white font-bold font-mono">
                    {killCount}
                    {isChallengeMode && totalMonsters > 0 && (
                      <span className="text-gray-500">/{totalMonsters}</span>
                    )}
                  </span>
                </div>
              </div>
              
              {isChallengeMode && totalChests > 0 && (
                <div className="bg-gray-900/90 border-4 border-yellow-500/70 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-xs text-yellow-300">宝箱</div>
                    <span className="text-white font-bold font-mono">
                      {openedChests}/{totalChests}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {isChallengeMode && challenge && (
              <div className={`bg-gray-900/90 border-4 px-4 py-2 rounded-lg flex items-center gap-3 ${
                isLowTime ? 'border-red-500 animate-pulse' : 'border-yellow-500'
              }`}>
                <Star className={`w-5 h-5 ${isLowTime ? 'text-red-400' : 'text-yellow-400'}`} />
                <div className="text-center">
                  <div className={`text-lg font-bold font-mono ${
                    isLowTime ? 'text-red-400' : 'text-yellow-300'
                  }`}>
                    {formatTime(challengeTimeRemaining)}
                  </div>
                  <div className="text-xs text-gray-400">挑战倒计时</div>
                </div>
              </div>
            )}
            
            {isChallengeMode && challenge && (
              <div className="bg-gray-900/70 border-2 border-gray-600 px-3 py-1 rounded text-xs text-gray-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                {challenge.goalType === 'kill_all' && '击杀全部敌人'}
                {challenge.goalType === 'open_all_chests' && '打开所有宝箱'}
                {challenge.goalType === 'both' && '击杀全部敌人并打开所有宝箱'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        {activeSkills.map((skill, index) => {
          const cooldownPercent = skill.currentCooldown / skill.cooldown;
          const isReady = skill.currentCooldown <= 0;
          const keyLabel = getSkillKey(index);
          
          return (
            <button
              key={skill.id}
              onClick={() => engine.useSkill(index)}
              className={`relative w-20 h-20 rounded-xl border-4 transition-all duration-200 ${
                isReady
                  ? 'border-yellow-400 hover:scale-110 cursor-pointer hover:shadow-lg'
                  : 'border-gray-600 cursor-not-allowed opacity-70'
              } bg-gradient-to-br ${getElementColorClass(skill.element)} shadow-lg group`}
              title={`${skill.name} - ${skill.description}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Swords className={`w-10 h-10 ${isReady ? 'text-white drop-shadow-lg' : 'text-gray-400'}`} />
              </div>
              
              {!isReady && (
                <>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all"
                    style={{ height: `${cooldownPercent * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg font-mono drop-shadow-lg">
                      {(skill.currentCooldown / 1000).toFixed(1)}
                    </span>
                  </div>
                </>
              )}
              
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-yellow-400 font-mono">{keyLabel}</span>
              </div>
              
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white font-mono bg-black/90 px-2 py-1 rounded">
                  {skill.name}
                </span>
              </div>
              
              {isReady && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
              )}
            </button>
          );
        })}
        
        {activeSkills.length === 0 && (
          <div className="bg-gray-900/90 border-4 border-gray-700 px-6 py-3 rounded-lg">
            <p className="text-gray-400 text-sm">
              装备元素符文和效果符文来生成技能
            </p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="text-gray-500 text-xs mb-1 font-mono">
          WASD 移动 · {settings.keyBindings.interact || ' '} 互动
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="bg-gray-900/90 border-4 border-orange-500 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <span className="text-white text-xs font-bold">快捷药水</span>
            <button
              onClick={() => setShowPotionPanel(true)}
              className="ml-auto text-xs text-orange-300 hover:text-orange-200 transition-colors"
            >
              药炉
            </button>
          </div>
          <div className="flex gap-2">
            {quickPotions.map(({ count, potion }) => {
              const cooldown = potionCooldowns[potion.templateId] || 0;
              const isReady = cooldown <= 0;
              const cooldownPercent = cooldown / potion.cooldown;
              
              return (
                <button
                  key={potion.templateId}
                  onClick={() => engine.usePotion(potion.id, 'player')}
                  disabled={!isReady}
                  className={`relative w-12 h-12 rounded-lg border-3 transition-all ${
                    isReady
                      ? 'border-yellow-400 hover:scale-110 cursor-pointer'
                      : 'border-gray-600 cursor-not-allowed opacity-60'
                  } shadow-lg`}
                  style={{
                    backgroundColor: potion.color + '30',
                    borderColor: potion.color,
                    boxShadow: isReady ? `0 0 10px ${potion.color}60` : 'none',
                  }}
                  title={`${potion.name} x${count}\n${potion.description}\n冷却: ${potion.cooldown / 1000}秒`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getPotionIcon(potion.type)}
                  </div>
                  
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-yellow-400">{count}</span>
                  </div>
                  
                  {!isReady && (
                    <>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all rounded-b-md"
                        style={{ height: `${cooldownPercent * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold font-mono">
                          {(cooldown / 1000).toFixed(1)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
                </button>
              );
            })}
            
            {quickPotions.length === 0 && (
              <div className="text-gray-500 text-xs py-2 px-3">
                暂无药水
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
