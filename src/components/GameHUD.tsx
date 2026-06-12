import { useState, useEffect, useRef } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Heart, Skull, Swords, Map, Target, Package, Star, FlaskConical, Shield, Sword, Wind, PawPrint, Settings, Zap, Timer, Keyboard, AlertTriangle, X } from 'lucide-react';
import type { RuneElement, Potion, StatusEffect } from '../types/game';
import { STATUS_EFFECT_CONFIG } from '../types/game';
import { formatTime } from '../data/challenges';
import { DIFFICULTY_CONFIGS } from '../data/difficulty';
import { loadSettings } from '../game/utils/storage';

const getElementColorClass = (element: RuneElement): string => {
  switch (element) {
    case 'fire': return 'from-orange-500 to-red-600';
    case 'ice': return 'from-cyan-400 to-blue-500';
    case 'thunder': return 'from-yellow-400 to-amber-500';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getElementGlowClass = (element: RuneElement): string => {
  switch (element) {
    case 'fire': return 'shadow-orange-500/50';
    case 'ice': return 'shadow-cyan-400/50';
    case 'thunder': return 'shadow-yellow-400/50';
    default: return 'shadow-gray-400/50';
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
  source: 'shield' | 'attack' | 'defense' | 'speed' | 'status_effect';
  category: 'buff' | 'debuff';
  stacks: number;
  dispellable: boolean;
}

const getStatusEffectIcon = (type: string) => {
  switch (type) {
    case 'burn': return '🔥';
    case 'frozen': return '❄️';
    case 'paralyze': return '⚡';
    case 'slow': return '🐢';
    case 'poison': return '☠️';
    case 'bleed': return '🩸';
    case 'curse': return '💀';
    case 'weakness': return '💔';
    case 'blind': return '🕶️';
    case 'fear': return '😱';
    case 'regen': return '💚';
    case 'haste': return '💨';
    case 'barrier': return '🛡️';
    case 'strength': return '⚔️';
    case 'iron_skin': return '🧱';
    default: return '✨';
  }
};

interface CombatTextItem {
  id: number;
  value: number;
  type: 'damage' | 'heal' | 'crit';
  timestamp: number;
}

let combatTextId = 0;

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

  const [prevHp, setPrevHp] = useState<number>(0);
  const [combatTexts, setCombatTexts] = useState<CombatTextItem[]>([]);
  const [hpLossPreview, setHpLossPreview] = useState<number>(0);
  const [isHealFlash, setIsHealFlash] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const killCountRef = useRef(killCount);
  const [killBump, setKillBump] = useState(false);

  useEffect(() => {
    if (!player) return;
    if (prevHp === 0 && player.hp > 0) {
      setPrevHp(player.hp);
      return;
    }

    const diff = prevHp - player.hp;
    if (diff > 0) {
      setHpLossPreview(diff);
      const id = ++combatTextId;
      setCombatTexts(prev => [...prev.slice(-8), {
        id,
        value: diff,
        type: 'damage',
        timestamp: Date.now(),
      }]);
      setTimeout(() => {
        setCombatTexts(prev => prev.filter(t => t.id !== id));
      }, 1200);
      setTimeout(() => setHpLossPreview(0), 1500);
    } else if (diff < 0) {
      const healAmount = Math.abs(diff);
      setIsHealFlash(true);
      const id = ++combatTextId;
      setCombatTexts(prev => [...prev.slice(-8), {
        id,
        value: healAmount,
        type: 'heal',
        timestamp: Date.now(),
      }]);
      setTimeout(() => {
        setCombatTexts(prev => prev.filter(t => t.id !== id));
      }, 1400);
      setTimeout(() => setIsHealFlash(false), 500);
    }

    setPrevHp(player.hp);
  }, [player?.hp]);

  useEffect(() => {
    if (killCount !== killCountRef.current) {
      killCountRef.current = killCount;
      setKillBump(true);
      setTimeout(() => setKillBump(false), 300);
    }
  }, [killCount]);

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
      icon: <Shield className="w-3.5 h-3.5" />,
      color: '#54a0ff',
      remaining: player.shieldTimer,
      duration: 15000,
      source: 'shield',
      category: 'buff',
      stacks: 1,
      dispellable: false,
    });
  }

  if (player.damageBoostTimer > 0) {
    buffs.push({
      id: 'attack',
      name: '攻击增强',
      icon: <Sword className="w-3.5 h-3.5" />,
      color: '#ff9f43',
      remaining: player.damageBoostTimer,
      duration: potionBuffTimers['attack'] ? 15000 : 8000,
      source: 'attack',
      category: 'buff',
      stacks: 1,
      dispellable: false,
    });
  }

  if (potionBuffTimers['defense'] && potionBuffTimers['defense'] > 0) {
    buffs.push({
      id: 'defense_potion',
      name: '铁壁',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: '#48dbfb',
      remaining: potionBuffTimers['defense'],
      duration: 15000,
      source: 'defense',
      category: 'buff',
      stacks: 1,
      dispellable: false,
    });
  }

  if (potionBuffTimers['speed'] && potionBuffTimers['speed'] > 0) {
    buffs.push({
      id: 'speed',
      name: '疾风',
      icon: <Wind className="w-3.5 h-3.5" />,
      color: '#a29bfe',
      remaining: potionBuffTimers['speed'],
      duration: 10000,
      source: 'speed',
      category: 'buff',
      stacks: 1,
      dispellable: false,
    });
  }

  const playerStatusEffects = (player as any).statusEffects as StatusEffect[] | undefined;
  if (playerStatusEffects) {
    for (const se of playerStatusEffects) {
      const config = STATUS_EFFECT_CONFIG[se.type];
      buffs.push({
        id: `se_${se.type}`,
        name: config.name,
        icon: <span className="text-sm">{getStatusEffectIcon(se.type)}</span>,
        color: config.color,
        remaining: se.duration,
        duration: se.maxDuration,
        source: 'status_effect',
        category: se.category,
        stacks: se.stacks,
        dispellable: se.dispellable,
      });
    }
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
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <div className="bg-gray-900/95 border-4 border-gray-600 p-3 rounded-lg pixel-border relative overflow-hidden">
          {isHealFlash && (
            <div className="absolute inset-0 heal-flash pointer-events-none" />
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className={`relative ${isCriticalHp ? 'animate-pulse' : ''}`}>
              <Heart className={`w-7 h-7 ${isCriticalHp ? 'text-red-400' : isLowHp ? 'text-orange-400' : 'text-red-500'} drop-shadow-lg`} />
              {isCriticalHp && (
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-7 h-7 text-red-400 opacity-40" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-white font-bold text-sm tracking-wide">生命值</span>
                <div className="text-right">
                  <span className={`font-bold font-mono text-lg ${isCriticalHp ? 'text-red-400' : isLowHp ? 'text-orange-400' : 'text-white'}`}>
                    {Math.max(0, Math.floor(player.hp))}
                  </span>
                  <span className="text-gray-400 font-mono text-sm"> / {player.maxHp}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-64 h-7 bg-gray-800 rounded-sm overflow-hidden border-2 border-gray-600 shadow-inner">
            {hpLossPreview > 0 && (
              <div
                className="absolute top-0 h-full bg-yellow-500/60 hp-loss-bar"
                style={{
                  left: `${hpPercent}%`,
                  width: `${Math.min((hpLossPreview / player.maxHp) * 100, 100 - hpPercent)}%`,
                }}
              />
            )}

            <div
              className={`h-full transition-all duration-300 ease-out relative ${
                isCriticalHp
                  ? 'bg-gradient-to-r from-red-800 to-red-500 animate-pulse'
                  : isLowHp
                    ? 'bg-gradient-to-r from-orange-600 to-red-500'
                    : 'bg-gradient-to-r from-red-600 to-red-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20" />
              {hpPercent > 8 && (
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/20 to-transparent" />
              )}
            </div>

            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: hpSegments }).map((_, i) => (
                <div
                  key={i}
                  className="h-full border-r border-black/25 last:border-r-0"
                  style={{ width: `${segmentWidth}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white text-xs font-bold font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {Math.floor(hpPercent)}%
              </span>
            </div>
          </div>

          <div className="relative h-1.5 mt-1">
            {buffs.length > 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-0.5">
                {buffs.map(buff => (
                  <div
                    key={buff.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: buff.color,
                      boxShadow: `0 0 4px ${buff.color}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="absolute -right-1 top-3 bottom-3 w-6 flex flex-col justify-end items-center gap-0.5">
            {combatTexts.slice(-4).map((ct) => (
              <div
                key={ct.id}
                className={`font-bold font-mono text-sm whitespace-nowrap ${
                  ct.type === 'crit'
                    ? 'combat-text-crit text-yellow-300 text-base'
                    : ct.type === 'heal'
                      ? 'combat-text-heal text-green-300'
                      : 'combat-text-damage text-red-300'
                }`}
              >
                {ct.type === 'heal' ? '+' : '-'}{Math.floor(ct.value)}
              </div>
            ))}
          </div>
        </div>

        {buffs.length > 0 && (
          <div className="bg-gray-900/95 border-4 border-gray-600 p-2.5 rounded-lg pixel-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-300 text-xs font-bold">增益效果</span>
            </div>
            <div className="flex gap-2">
              {buffs.filter(b => b.category === 'buff').map((buff) => {
                const progress = buff.remaining / buff.duration;
                const circumference = 2 * Math.PI * 16;
                return (
                  <div
                    key={buff.id}
                    className="relative w-11 h-11 rounded-lg border-2 flex items-center justify-center buff-icon-enter"
                    style={{
                      borderColor: buff.color,
                      backgroundColor: buff.color + '15',
                      boxShadow: `0 0 10px ${buff.color}30, inset 0 0 6px ${buff.color}15`,
                    }}
                    title={`${buff.name}${buff.stacks > 1 ? ` x${buff.stacks}` : ''} - ${(buff.remaining / 1000).toFixed(1)}秒${buff.dispellable ? ' (可驱散)' : ''}`}
                  >
                    <div style={{ color: buff.color }} className="drop-shadow-md">
                      {buff.icon}
                    </div>

                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r="16"
                        fill="none"
                        stroke="rgba(0,0,0,0.35)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="16"
                        fill="none"
                        stroke={buff.color}
                        strokeWidth="2.5"
                        strokeDasharray={`${progress * circumference} ${circumference}`}
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    </svg>

                    {buff.stacks > 1 && (
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-300">
                        <span className="text-[8px] font-bold text-black font-mono">{buff.stacks}</span>
                      </div>
                    )}

                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-gray-900/95 px-1.5 rounded-sm border border-gray-600">
                      {Math.ceil(buff.remaining / 1000)}s
                    </div>
                  </div>
                );
              })}
            </div>
            {buffs.filter(b => b.category === 'debuff').length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mt-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300 text-xs font-bold">负面效果</span>
                </div>
                <div className="flex gap-2">
                  {buffs.filter(b => b.category === 'debuff').map((buff) => {
                    const progress = buff.remaining / buff.duration;
                    const circumference = 2 * Math.PI * 16;
                    return (
                      <div
                        key={buff.id}
                        className="relative w-11 h-11 rounded-lg border-2 flex items-center justify-center buff-icon-enter animate-pulse"
                        style={{
                          borderColor: buff.dispellable ? buff.color : '#636e72',
                          backgroundColor: buff.color + '10',
                          boxShadow: `0 0 8px ${buff.color}25`,
                        }}
                        title={`${buff.name}${buff.stacks > 1 ? ` x${buff.stacks}` : ''} - ${(buff.remaining / 1000).toFixed(1)}秒${buff.dispellable ? ' (可驱散)' : ' (不可驱散)'}`}
                      >
                        <div style={{ color: buff.color }} className="drop-shadow-md opacity-80">
                          {buff.icon}
                        </div>

                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle
                            cx="22"
                            cy="22"
                            r="16"
                            fill="none"
                            stroke="rgba(0,0,0,0.4)"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="16"
                            fill="none"
                            stroke={buff.color}
                            strokeWidth="2.5"
                            strokeDasharray={`${progress * circumference} ${circumference}`}
                            strokeLinecap="round"
                            className="transition-all duration-200"
                          />
                        </svg>

                        {buff.stacks > 1 && (
                          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-red-300">
                            <span className="text-[8px] font-bold text-white font-mono">{buff.stacks}</span>
                          </div>
                        )}

                        {!buff.dispellable && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-700 rounded-full flex items-center justify-center">
                            <X className="w-2 h-2 text-gray-400" />
                          </div>
                        )}

                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-gray-900/95 px-1.5 rounded-sm border border-red-800/50" style={{ color: buff.color }}>
                          {Math.ceil(buff.remaining / 1000)}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {pet && (
          <div className="bg-gray-900/95 border-4 border-pink-600/40 p-2.5 rounded-lg pixel-border">
            <div className="flex items-center gap-2 mb-1.5">
              <PawPrint className="w-4 h-4 text-pink-400" />
              <span className="text-white text-xs font-bold">{pet.name}</span>
              <span className="text-pink-200 text-[10px] font-mono ml-auto">
                {Math.max(0, Math.floor(pet.hp))}/{pet.maxHp}
              </span>
            </div>
            <div className="w-40 h-3 bg-gray-800 rounded-sm overflow-hidden border border-gray-600 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-200 relative"
                style={{ width: `${(pet.hp / pet.maxHp) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              </div>
            </div>
            {pet.skill && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-pink-300" />
                <div className="flex-1 h-1.5 bg-gray-800 rounded-sm overflow-hidden border border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-400 transition-all duration-200"
                    style={{ width: `${(1 - pet.skill.currentCooldown / pet.skill.cooldown) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-pink-200 font-mono w-6 text-right">
                  {pet.skill.currentCooldown > 0 ? `${(pet.skill.currentCooldown / 1000).toFixed(0)}s` : '就绪'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
        <div className="flex gap-2 items-start">
          <button
            onClick={() => {
              engine.togglePause();
              setIsPaused(true);
              setShowSettings(true);
            }}
            className="pointer-events-auto bg-gray-900/95 border-4 border-gray-600 hover:border-yellow-400 p-2 rounded-lg transition-all hover:scale-110"
            title="设置 (ESC)"
          >
            <Settings className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <div className="flex gap-2">
            <div className="bg-gray-900/95 border-4 border-cyan-600/50 px-3.5 py-2 rounded-lg pixel-border flex items-center gap-2.5">
              <div className="bg-cyan-900/40 p-1 rounded">
                <Timer className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div>
                <div className="text-[9px] text-cyan-300/70 font-mono uppercase tracking-wider">时间</div>
                <span className="text-white font-bold font-mono text-lg tracking-wider">
                  {formatMsTime(gameTime)}
                </span>
              </div>
            </div>

            <div
              className="bg-gray-900/95 border-4 px-3.5 py-2 rounded-lg pixel-border flex items-center gap-2.5"
              style={{ borderColor: DIFFICULTY_CONFIGS[difficulty].borderColor }}
            >
              <span className="text-lg">{DIFFICULTY_CONFIGS[difficulty].icon}</span>
              <span className="font-bold font-mono text-sm" style={{ color: DIFFICULTY_CONFIGS[difficulty].color }}>
                {DIFFICULTY_CONFIGS[difficulty].name}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-gray-900/95 border-4 border-purple-500/50 px-3.5 py-2 rounded-lg pixel-border flex items-center gap-2.5">
              <div className="bg-purple-900/40 p-1 rounded">
                <Map className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-[9px] text-purple-300/70 font-mono uppercase tracking-wider">层数</div>
                <span className="text-white font-bold font-mono text-lg">
                  {currentLevel}<span className="text-purple-300 text-xs ml-0.5">F</span>
                </span>
              </div>
            </div>

            <div className="bg-gray-900/95 border-4 border-red-500/50 px-3.5 py-2 rounded-lg pixel-border flex items-center gap-2.5">
              <div className="bg-red-900/40 p-1 rounded">
                <Skull className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <div className="text-[9px] text-red-300/70 font-mono uppercase tracking-wider">击杀</div>
                <span className={`text-white font-bold font-mono text-lg ${killBump ? 'stat-value-bump' : ''}`}>
                  {killCount}
                  {isChallengeMode && totalMonsters > 0 && (
                    <span className="text-gray-500 text-sm">/{totalMonsters}</span>
                  )}
                </span>
              </div>
            </div>

            {isChallengeMode && totalChests > 0 && (
              <div className="bg-gray-900/95 border-4 border-yellow-500/50 px-3.5 py-2 rounded-lg pixel-border flex items-center gap-2.5">
                <div className="bg-yellow-900/40 p-1 rounded">
                  <Package className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-[9px] text-yellow-300/70 font-mono uppercase tracking-wider">宝箱</div>
                  <span className="text-white font-bold font-mono text-lg">
                    {openedChests}<span className="text-gray-500 text-sm">/{totalChests}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {isChallengeMode && challenge && (
            <div className={`bg-gray-900/95 border-4 px-4 py-2 rounded-lg pixel-border flex items-center gap-3 ${
              isLowTime ? 'border-red-500 animate-pulse' : 'border-yellow-500/50'
            }`}>
              <Star className={`w-5 h-5 ${isLowTime ? 'text-red-400' : 'text-yellow-400'}`} />
              <div className="text-center">
                <div className={`text-lg font-bold font-mono ${
                  isLowTime ? 'text-red-400' : 'text-yellow-300'
                }`}>
                  {formatTime(challengeTimeRemaining)}
                </div>
                <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">挑战倒计时</div>
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-end gap-3">
          {activeSkills.map((skill, index) => {
            const cooldownPercent = skill.currentCooldown / skill.cooldown;
            const isReady = skill.currentCooldown <= 0;

            return (
              <div key={skill.id} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => engine.useSkill(index)}
                  className={`relative w-[72px] h-[72px] rounded-xl border-4 transition-all duration-200 ${
                    isReady
                      ? `border-yellow-400 hover:scale-110 cursor-pointer shadow-lg ${getElementGlowClass(skill.element)}`
                      : 'border-gray-600 cursor-not-allowed opacity-70 cooldown-active'
                  } bg-gradient-to-br ${getElementColorClass(skill.element)} group`}
                  title={`${skill.name} - ${skill.description}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Swords className={`w-9 h-9 ${isReady ? 'text-white drop-shadow-lg' : 'text-gray-400'}`} />
                  </div>

                  {!isReady && (
                    <>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all rounded-b-lg"
                        style={{ height: `${cooldownPercent * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-base font-mono drop-shadow-lg">
                          {(skill.currentCooldown / 1000).toFixed(1)}
                        </span>
                      </div>
                    </>
                  )}

                  {isReady && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
                  )}
                </button>

                <div className="w-[72px]">
                  <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        isReady
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-300'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400'
                      }`}
                      style={{ width: `${(1 - cooldownPercent) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-6 h-6 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold text-yellow-400 font-mono">{getSkillKey(index)}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 font-mono group-hover:text-white transition-colors">
                      {skill.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {activeSkills.length === 0 && (
            <div className="bg-gray-900/95 border-4 border-gray-600 px-6 py-3 rounded-lg pixel-border">
              <p className="text-gray-400 text-sm font-mono">
                装备元素符文和效果符文来生成技能
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-3 pointer-events-auto">
        <button
          onClick={() => setShowHotkeys(!showHotkeys)}
          className="bg-gray-900/90 border-2 border-gray-600 hover:border-gray-400 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        >
          <Keyboard className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400 text-[10px] font-mono">快捷键</span>
        </button>
        {showHotkeys && (
          <div className="absolute bottom-8 left-0 bg-gray-900/95 border-4 border-gray-600 p-3 rounded-lg pixel-border min-w-[200px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">W</kbd>
                <span className="text-gray-300 text-[10px] font-mono">上</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">S</kbd>
                <span className="text-gray-300 text-[10px] font-mono">下</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">A</kbd>
                <span className="text-gray-300 text-[10px] font-mono">左</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">D</kbd>
                <span className="text-gray-300 text-[10px] font-mono">右</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">空格</kbd>
                <span className="text-gray-300 text-[10px] font-mono">互动</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">M</kbd>
                <span className="text-gray-300 text-[10px] font-mono">地图</span>
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <kbd className="bg-gray-700 border border-gray-500 px-1.5 py-0.5 rounded text-[10px] text-white font-mono min-w-[24px] text-center">{i}</kbd>
                  <span className="text-gray-300 text-[10px] font-mono">技能{i}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-3 pointer-events-auto">
        <div className="bg-gray-900/95 border-4 border-orange-500/50 p-3 rounded-lg pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <span className="text-white text-xs font-bold">快捷药水</span>
            <button
              onClick={() => setShowPotionPanel(true)}
              className="ml-auto text-xs text-orange-300 hover:text-orange-200 transition-colors font-mono"
            >
              药炉 →
            </button>
          </div>
          <div className="flex gap-2">
            {quickPotions.map(({ count, potion }) => {
              const cooldown = potionCooldowns[potion.templateId] || 0;
              const isReady = cooldown <= 0;
              const cooldownPercent = cooldown / potion.cooldown;

              return (
                <div key={potion.templateId} className="flex flex-col items-center gap-1">
                  <button
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

                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-bold text-yellow-400">{count}</span>
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
                  <div className="relative h-1 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        isReady ? 'bg-yellow-400' : 'bg-gray-500'
                      }`}
                      style={{ width: `${(1 - cooldownPercent) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {quickPotions.length === 0 && (
              <div className="text-gray-500 text-xs py-2 px-3 font-mono">
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
