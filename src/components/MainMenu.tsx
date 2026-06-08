import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Play, BookOpen, Sparkles, Flame, Snowflake, Zap, Layers, Clock, ZapOff, Target, Lock, TreeDeciduous, Star, Swords, Award, PawPrint, Sword } from 'lucide-react';
import { useState } from 'react';
import { ALL_RUNES, SKILLS } from '../data/runes';
import type { Rune, Skill } from '../types/game';
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
    engine.startGame();
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 border-4 border-purple-500 rounded-xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
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

          <div className="mb-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              元素符文 ({saveData.discoveredRunes.filter(id => elementRunes.some(r => r.id === id)).length}/{elementRunes.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {elementRunes.map((rune) => {
                const discovered = saveData.discoveredRunes.includes(rune.id);
                return (
                  <div
                    key={rune.id}
                    className={`rounded-lg p-4 text-center border-2 transition-all ${
                      discovered
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-gray-900/50 border-gray-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        discovered ? '' : 'bg-gray-700'
                      }`}
                      style={discovered ? { backgroundColor: rune.color } : {}}
                    >
                      {discovered ? getRuneIcon(rune) : <Lock className="w-6 h-6 text-gray-500" />}
                    </div>
                    <h3 className={`font-bold mb-1 ${discovered ? 'text-white' : 'text-gray-500'}`}>
                      {discovered ? rune.name : '???'}
                    </h3>
                    <p className={`text-xs ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
                      {discovered ? rune.description : '未发现'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              效果符文 ({saveData.discoveredRunes.filter(id => effectRunes.some(r => r.id === id)).length}/{effectRunes.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {effectRunes.map((rune) => {
                const discovered = saveData.discoveredRunes.includes(rune.id);
                return (
                  <div
                    key={rune.id}
                    className={`rounded-lg p-4 text-center border-2 transition-all ${
                      discovered
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-gray-900/50 border-gray-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        discovered ? '' : 'bg-gray-700'
                      }`}
                      style={discovered ? { backgroundColor: rune.color } : {}}
                    >
                      {discovered ? getRuneIcon(rune) : <Lock className="w-5 h-5 text-gray-500" />}
                    </div>
                    <h3 className={`font-bold text-sm mb-1 ${discovered ? 'text-white' : 'text-gray-500'}`}>
                      {discovered ? rune.name : '???'}
                    </h3>
                    <p className={`text-xs ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
                      {discovered ? rune.description : '未发现'}
                    </p>
                  </div>
                );
              })}
            </div>
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
                return (
                  <div
                    key={skill.id}
                    className={`rounded-lg p-3 border transition-all ${
                      discovered
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-900/30 border-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {discovered && elemRune ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: elemRune.color }}
                        >
                          {getRuneIcon(elemRune)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <span className={`font-bold text-sm ${discovered ? 'text-white' : 'text-gray-500'}`}>
                          {discovered ? skill.name : '???'}
                        </span>
                        <p className={`text-xs mt-0.5 ${discovered ? 'text-gray-400' : 'text-gray-600'}`}>
                          {discovered ? skill.description : '未发现'}
                        </p>
                      </div>
                    </div>
                    {discovered && (
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-red-400">伤害: {skill.damage}</span>
                        <span className="text-blue-400">冷却: {skill.cooldown / 1000}s</span>
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
