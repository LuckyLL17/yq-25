import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Heart, Skull, Swords, Map, Clock, Target, Package, Star, FlaskConical, Shield, Sword, Wind, PawPrint } from 'lucide-react';
import { SKILLS } from '../data/runes';
import type { RuneElement, Potion } from '../types/game';
import { formatTime } from '../data/challenges';
import { getPotionTemplate } from '../data/potions';

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
    pet,
    setShowPotionPanel,
  } = useGameStore();
  const engine = getGameEngine();
  
  if (!player) return null;
  
  const hpPercent = (player.hp / player.maxHp) * 100;
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
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
      <div className="flex justify-between items-start">
        <div className="bg-gray-900/90 border-4 border-gray-700 p-3 rounded-lg pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-white font-bold text-sm">HP</span>
          </div>
          <div className="w-48 h-5 bg-gray-800 rounded overflow-hidden border-2 border-gray-600">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="text-white text-xs mt-1 text-center font-mono">
            {Math.max(0, Math.floor(player.hp))} / {player.maxHp}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
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
          
          <div className="flex gap-3">
            <div className="bg-gray-900/90 border-4 border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Map className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold font-mono">第 {currentLevel} 层</span>
            </div>
            
            <div className="bg-gray-900/90 border-4 border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-400" />
              <span className="text-white font-bold font-mono">
                {killCount}
                {isChallengeMode && totalMonsters > 0 && (
                  <span className="text-gray-500">/{totalMonsters}</span>
                )}
              </span>
            </div>
            
            {isChallengeMode && totalChests > 0 && (
              <div className="bg-gray-900/90 border-4 border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold font-mono">
                  {openedChests}/{totalChests}
                </span>
              </div>
            )}
          </div>
          
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
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        {activeSkills.map((skill, index) => {
          const cooldownPercent = skill.currentCooldown / skill.cooldown;
          const isReady = skill.currentCooldown <= 0;
          
          return (
            <button
              key={skill.id}
              onClick={() => engine.useSkill(index)}
              className={`relative w-16 h-16 rounded-lg border-4 transition-all ${
                isReady
                  ? 'border-yellow-400 hover:scale-110 cursor-pointer'
                  : 'border-gray-600 cursor-not-allowed opacity-70'
              } bg-gradient-to-br ${getElementColorClass(skill.element)} shadow-lg`}
              title={`${skill.name} - ${skill.description}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Swords className={`w-8 h-8 ${isReady ? 'text-white' : 'text-gray-400'}`} />
              </div>
              
              {!isReady && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all"
                  style={{ height: `${cooldownPercent * 100}%` }}
                />
              )}
              
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-400 font-mono">{index + 1}</span>
              </div>
              
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-white font-mono bg-black/80 px-2 py-0.5 rounded">
                  {skill.name}
                </span>
              </div>
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
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all rounded-b-md"
                      style={{ height: `${cooldownPercent * 100}%` }}
                    />
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
