import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Play, BookOpen, Sparkles, Flame, Snowflake, Zap, Layers, Clock, ZapOff, Target, Lock, TreeDeciduous, Star, Swords, Award, PawPrint, Sword } from 'lucide-react';
import { useState } from 'react';
import { ALL_RUNES, SKILLS, RARITY_CONFIG, RARITY_ORDER } from '../data/runes';
import type { Rune, Skill, RuneRarity } from '../types/game';
import { getTodaysChallenge, formatTime, getGoalDescription } from '../data/challenges';
import { getChallengeRecord } from '../game/utils/storage';
import PetPanel from './PetPanel';

const MainMenu = () => {
  const { scene, saveData, setShowTalentTree, setShowChallengeInfo, setShowBadgePanel, setShowEquipmentPanel } = useGameStore();
  const engine = getGameEngine();
  const [showCodex, setShowCodex] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPetPanel, setShowPetPanel] = useState(false);
  
  const todaysChallenge = getTodaysChallenge();
  const todaysRecord = getChallengeRecord(todaysChallenge.date);
  
  if (scene !== 'menu') return null;
  
  const handleStartGame = () => {
    engine.setScene('class_select');
  };
  
  const handleOpenTalents = () => {
    setShowTalentTree(true);
  };
  
  const getRuneIcon = (rune: Rune) => {
    if (rune.type === 'element') {
      switch (rune.element) {
        case 'fire': return <Flame className="w-6 h-6 text-white" />;
        case 'ice': return <Snowflake className="w-6 h-6 text-white" />;
        case 'thunder': return <Zap className="w-6 h-6 text-white" />;
        default: return <Sparkles className="w-6 h-6 text-white" />;
      }
    } else {
      switch (rune.effect) {
        case 'spread': return <Layers className="w-6 h-6 text-white" />;
        case 'time': return <Clock className="w-6 h-6 text-white" />;
        case 'power': return <ZapOff className="w-6 h-6 text-white" />;
        case 'pierce': return <Target className="w-6 h-6 text-white" />;
        default: return <Sparkles className="w-6 h-6 text-white" />;
      }
    }
  };

  const elementRunes = ALL_RUNES.filter(r => r.type === 'element');
  const effectRunes = ALL_RUNES.filter(r => r.type === 'effect');
  const allSkills = Object.values(SKILLS);

  if (showPetPanel) {
    return <PetPanel onClose={() => setShowPetPanel(false)} />;
  }

  if (showCodex) {
    const codexGetRuneIcon = getRuneIcon;
    
    const renderCodexRuneCard = (rune: Rune, discovered: boolean) => {
      const config = RARITY_CONFIG[rune.rarity];
      return (
        <div
          key={rune.id}
          className={`rounded-lg p-4 text-center border-2 transition-all relative overflow-hidden ${
            discovered
              ? `codex-rune-animate`
              : 'opacity-50'
          }`}
          style={discovered ? {
            background: `linear-gradient(145deg, ${config.color}10 0%, ${config.color}05 100%)`,
            borderColor: `${config.color}50`,
            boxShadow: config.borderGlow,
          } : {
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderColor: 'rgba(31, 41, 55, 0.5)',
          }}
        >
          <div
            className={`w-16 h-16 mx-auto mb-3 rounded-lg border-[3px] flex items-center justify-center relative overflow-hidden ${discovered ? config.animation : ''}`}
            style={discovered ? {
              background: `linear-gradient(145deg, ${rune.color} 0%, ${rune.color}cc 50%, ${rune.color}99 100%)`,
              borderColor: config.borderColor,
              boxShadow: `${config.borderGlow}, ${config.innerShadow}`,
            } : {
              backgroundColor: '#374151',
              borderColor: '#4b5563',
            }}
          >
            {discovered ? (
              <>
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)`,
                }} />
                <div className="relative z-10 drop-shadow-lg">{codexGetRuneIcon(rune)}</div>
                {rune.rarity === 'legendary' && (
                  <>
                    <div className="rarity-sparkle" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
                    <div className="rarity-sparkle-diamond" style={{ top: '50%', right: '10%', animationDelay: '0.8s' }} />
                    <div className="rarity-sparkle" style={{ bottom: '10%', left: '25%', animationDelay: '1.5s' }} />
                  </>
                )}
                {rune.rarity === 'epic' && (
                  <>
                    <div className="rarity-sparkle" style={{ top: '15%', right: '15%', animationDelay: '0.5s' }} />
                    <div className="rarity-sparkle-diamond" style={{ bottom: '15%', left: '15%', animationDelay: '1.2s' }} />
                  </>
                )}
                {rune.rarity === 'rare' && (
                  <>
                    <div className="rarity-sparkle" style={{ top: '20%', right: '20%', animationDelay: '0.3s' }} />
                    <div className="rarity-sparkle" style={{ bottom: '20%', left: '20%', animationDelay: '1.3s' }} />
                  </>
                )}
              </>
            ) : (
              <Lock className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <h3 className={`font-bold mb-1 text-sm ${discovered ? 'text-white' : 'text-gray-500'}`}>
            {discovered ? rune.name : '???'}
          </h3>
          {discovered && (
            <div className="flex justify-center mb-1">
              <div
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${config.color}30 0%, ${config.color}15 100%)`,
                  color: config.color,
                  border: `1px solid ${config.color}60`,
                  textShadow: `0 0 4px ${config.color}60`,
                }}
              >
                {Array.from({ length: config.tier }, (_, i) => (
                  <Star key={i} className="w-2 h-2" fill="currentColor" />
                ))}
                <span className="ml-0.5">{config.name}</span>
              </div>
            </div>
          )}
          <p className={`text-xs leading-relaxed ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
            {discovered ? rune.description : '未发现'}
          </p>
        </div>
      );
    };
    
    const renderRaritySection = (rarity: RuneRarity, type: 'element' | 'effect') => {
      const config = RARITY_CONFIG[rarity];
      const runes = (type === 'element' ? elementRunes : effectRunes).filter(r => r.rarity === rarity);
      if (runes.length === 0) return null;
      const discovered = runes.filter(r => saveData.discoveredRunes.includes(r.id)).length;
      
      return (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, ${config.color}25 0%, ${config.color}10 100%)`,
                color: config.color,
                border: `1.5px solid ${config.color}40`,
                boxShadow: config.borderGlow,
                textShadow: `0 0 8px ${config.color}60`,
              }}
            >
              {Array.from({ length: config.tier }, (_, i) => (
                <Star key={i} className="w-3 h-3" fill="currentColor" />
              ))}
              <span className="ml-1">{config.name}</span>
            </div>
            <span className="text-gray-400 text-xs">
              {discovered}/{runes.length} 已发现
            </span>
          </div>
          <div className={`grid gap-3 ${
            rarity === 'legendary' ? 'grid-cols-2 md:grid-cols-3' :
            rarity === 'epic' ? 'grid-cols-2 md:grid-cols-3' :
            rarity === 'rare' ? 'grid-cols-2 md:grid-cols-4' :
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {runes.map(rune => renderCodexRuneCard(rune, saveData.discoveredRunes.includes(rune.id)))}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border-4 border-purple-500 rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              符文图鉴
            </h2>
            <button
              onClick={() => setShowCodex(false)}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              元素符文 ({saveData.discoveredRunes.filter(id => elementRunes.some(r => r.id === id)).length}/{elementRunes.length})
            </h3>
            {RARITY_ORDER.map(rarity => renderRaritySection(rarity, 'element'))}
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              效果符文 ({saveData.discoveredRunes.filter(id => effectRunes.some(r => r.id === id)).length}/{effectRunes.length})
            </h3>
            {RARITY_ORDER.map(rarity => renderRaritySection(rarity, 'effect'))}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              组合技能 ({saveData.discoveredSkills.length}/{allSkills.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allSkills.map((skill) => {
                const discovered = saveData.discoveredSkills.includes(skill.id);
                const elemRune = ALL_RUNES.find(r => r.id === skill.elementRuneId);
                const effectRune = ALL_RUNES.find(r => r.id === skill.effectRuneId);
                const higherRarity = elemRune && effectRune
                  ? (RARITY_CONFIG[elemRune.rarity].tier >= RARITY_CONFIG[effectRune.rarity].tier ? elemRune.rarity : effectRune.rarity)
                  : elemRune?.rarity || 'common';
                const skillConfig = RARITY_CONFIG[higherRarity];
                return (
                  <div
                    key={skill.id}
                    className={`rounded-lg p-3 border transition-all ${
                      discovered
                        ? 'codex-rune-animate'
                        : 'opacity-50'
                    }`}
                    style={discovered ? {
                      background: `linear-gradient(145deg, ${skillConfig.color}10 0%, transparent 100%)`,
                      borderColor: `${skillConfig.color}40`,
                    } : {
                      backgroundColor: 'rgba(17, 24, 39, 0.3)',
                      borderColor: 'rgba(31, 41, 55, 0.5)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {discovered && elemRune ? (
                        <div
                          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: `linear-gradient(145deg, ${elemRune.color} 0%, ${elemRune.color}cc 100%)`,
                            borderColor: RARITY_CONFIG[elemRune.rarity].borderColor,
                            boxShadow: RARITY_CONFIG[elemRune.rarity].borderGlow,
                          }}
                        >
                          <div className="absolute inset-0" style={{
                            background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                          }} />
                          <div className="relative z-10">{getRuneIcon(elemRune)}</div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${discovered ? 'text-white' : 'text-gray-500'}`}>
                            {discovered ? skill.name : '???'}
                          </span>
                          {discovered && (
                            <div
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold"
                              style={{
                                background: `linear-gradient(135deg, ${skillConfig.color}30 0%, ${skillConfig.color}10 100%)`,
                                color: skillConfig.color,
                                border: `1px solid ${skillConfig.color}50`,
                              }}
                            >
                              {Array.from({ length: skillConfig.tier }, (_, i) => (
                                <Star key={i} className="w-1.5 h-1.5" fill="currentColor" />
                              ))}
                              <span className="ml-0.5">{skillConfig.name}</span>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
                          {discovered ? skill.description : '未发现'}
                        </p>
                      </div>
                    </div>
                    {discovered && (
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-red-400">伤害: {skill.damage}</span>
                        <span className="text-blue-400">冷却: {skill.cooldown / 1000}s</span>
                        <span className="text-purple-400">范围: {skill.range}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (showHelp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border-4 border-cyan-500 rounded-xl p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-cyan-300">游戏说明</h2>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">操作方式</h3>
              <ul className="space-y-1 text-sm">
                <li>• <span className="text-white font-mono">WASD</span> / <span className="text-white font-mono">方向键</span> - 移动</li>
                <li>• <span className="text-white font-mono">空格键</span> - 与物品互动</li>
                <li>• <span className="text-white font-mono">1 / 2 / 3 / 4</span> - 释放技能</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-2">符文系统</h3>
              <p className="text-sm">
                符文分为<span className="text-orange-400 font-bold">元素符文</span>和
                <span className="text-cyan-400 font-bold">效果符文</span>两种。
                同时装备元素符文和效果符文时，会自动组合生成独特的技能！
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">元素符文</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>火焰</span>
                </div>
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                  <span>冰霜</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>雷电</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-2">效果符文</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-green-400" />
                  <span>扩散 - 范围扩大</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>时间 - 持续延长</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZapOff className="w-4 h-4 text-pink-400" />
                  <span>强化 - 伤害提升</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>穿透 - 贯穿敌人</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">游戏目标</h3>
              <p className="text-sm">
                尽可能深入地牢，收集更多符文，组合出强大的技能，击败怪物，挑战更高层数！
                死亡后需要重新开始，但每次冒险都会获得不同的符文组合。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center mb-12">
        <div className="mb-6 relative inline-block">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-2xl">
            <div className="text-6xl">🦊</div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center border-2 border-purple-400">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 mb-4 tracking-wider">
          符文小狐狸
        </h1>
        <p className="text-xl text-purple-300 mb-2">
          魔法地牢冒险
        </p>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          收集符文，组合技能，探索随机生成的地牢深处
        </p>
      </div>
      
      <div className="relative z-10 space-y-4 w-full max-w-xs">
        <button
          onClick={handleStartGame}
          className="w-full py-4 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xl rounded-xl border-4 border-orange-400 shadow-lg transition-all hover:scale-105 hover:shadow-orange-500/30 flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7" />
          开始冒险
        </button>
        
        <button
          onClick={() => setShowChallengeInfo(true)}
          className="w-full py-4 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-xl rounded-xl border-4 border-yellow-400 shadow-lg transition-all hover:scale-105 hover:shadow-yellow-500/30 flex items-center justify-center gap-3 relative"
        >
          <Star className="w-7 h-7" />
          每日挑战
          {!todaysRecord?.completed && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
        </button>
        
        {todaysChallenge && (
          <div className="bg-gray-800/50 border border-yellow-600/50 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-bold">今日目标</span>
              <span className={todaysRecord?.completed ? 'text-green-400' : 'text-gray-400'}>
                {todaysRecord?.completed ? '✓ 已完成' : '未完成'}
              </span>
            </div>
            <div className="text-gray-300 flex items-center gap-1">
              <Target className="w-3 h-3" />
              {getGoalDescription(todaysChallenge.goalType)}
            </div>
            <div className="text-gray-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              限时 {formatTime(todaysChallenge.timeLimit)}
              <span className="mx-1">·</span>
              <Swords className="w-3 h-3" />
              {todaysChallenge.monsterCount} 只敌人
            </div>
          </div>
        )}
        
        <button
          onClick={handleOpenTalents}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl border-4 border-purple-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 relative"
        >
          <TreeDeciduous className="w-5 h-5" />
          天赋树
          {saveData.talentPoints > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-300 animate-bounce">
              {saveData.talentPoints}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setShowHelp(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl border-4 border-cyan-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          游戏说明
        </button>
        
        <button
          onClick={() => setShowCodex(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl border-4 border-purple-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          符文图鉴
        </button>
        
        <button
          onClick={() => setShowEquipmentPanel(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl border-4 border-orange-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 relative"
        >
          <Sword className="w-5 h-5" />
          装备背包
          {saveData.equipmentInventory && saveData.equipmentInventory.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-400 text-orange-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-orange-200">
              {saveData.equipmentInventory.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setShowPetPanel(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold rounded-xl border-4 border-pink-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 relative"
        >
          <PawPrint className="w-5 h-5" />
          宠物伙伴
          {saveData.unlockedPets && saveData.unlockedPets.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-400 text-pink-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-pink-200">
              {saveData.unlockedPets.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setShowBadgePanel(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl border-4 border-yellow-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 relative"
        >
          <Award className="w-5 h-5" />
          徽章收藏
          {saveData.badges && saveData.badges.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-300">
              {saveData.badges.length}
            </span>
          )}
        </button>
      </div>
      
      {saveData.highestLevel > 0 && (
        <div className="relative z-10 mt-8 bg-gray-800/50 border-2 border-gray-600 rounded-lg px-6 py-3">
          <p className="text-gray-400 text-sm">
            历史最高层数：<span className="text-yellow-400 font-bold">{saveData.highestLevel}</span>
            {' | '}
            总击杀数：<span className="text-red-400 font-bold">{saveData.totalKills}</span>
          </p>
        </div>
      )}
      
      <p className="relative z-10 text-gray-600 text-xs mt-8">
        像素风 Roguelike · 符文组合系统
      </p>
    </div>
  );
};

export default MainMenu;
