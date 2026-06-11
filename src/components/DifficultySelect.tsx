import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '../data/difficulty';
import type { AdventureDifficulty } from '../types/game';
import { ArrowLeft, Play, Heart, Swords, Shield, Star, Skull, Sparkles, Lock, Gem } from 'lucide-react';
import { getGameEngine } from '../game/GameEngine';

const DifficultySelect = () => {
  const { scene, selectedClass, setDifficulty } = useGameStore();
  const engine = getGameEngine();
  const [selectedDifficulty, setSelectedDifficulty] = useState<AdventureDifficulty | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (scene !== 'difficulty_select') return null;

  const handleBack = () => {
    engine.setScene('class_select');
  };

  const handleStartGame = () => {
    if (!selectedClass || !selectedDifficulty) return;
    if (selectedDifficulty === 'hero' || selectedDifficulty === 'legend') {
      if (!confirmed) {
        setConfirmed(true);
        return;
      }
    }
    setDifficulty(selectedDifficulty);
    engine.startGameWithClass(selectedClass, selectedDifficulty);
  };

  const getStatBar = (value: number, max: number, color: string) => {
    const percent = Math.min(100, (value / max) * 100);
    return (
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  const selectedConfig = selectedDifficulty ? DIFFICULTY_CONFIGS[selectedDifficulty] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-4 relative overflow-hidden">
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

      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回选择职业
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-red-400">
            选择冒险难度
          </h1>
          <div className="w-28" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {DIFFICULTY_ORDER.map((diffId) => {
            const config = DIFFICULTY_CONFIGS[diffId];
            const isSelected = selectedDifficulty === diffId;
            const isHard = diffId === 'hero' || diffId === 'legend';

            return (
              <div
                key={diffId}
                onClick={() => {
                  setSelectedDifficulty(diffId);
                  setConfirmed(false);
                }}
                className={`cursor-pointer rounded-xl p-5 border-4 transition-all hover:scale-105 relative ${
                  isSelected
                    ? 'bg-gray-800/80 shadow-lg'
                    : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-400'
                }`}
                style={isSelected ? { borderColor: config.borderColor, boxShadow: `0 0 20px ${config.color}40` } : {}}
              >
                {isHard && (
                  <div className="absolute top-2 right-2">
                    <Skull className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                )}
                <div
                  className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center border-4 border-white/20 text-4xl"
                  style={{ backgroundColor: config.color + '30', borderColor: config.color }}
                >
                  {config.icon}
                </div>
                <h3 className="text-lg font-bold text-white text-center mb-1">
                  {config.name}
                </h3>
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>

        {selectedConfig && (
          <div className="bg-gray-800/70 border-2 border-gray-600 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border-3 text-3xl"
                style={{ backgroundColor: selectedConfig.color + '30', borderColor: selectedConfig.color }}
              >
                {selectedConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: selectedConfig.color }}>
                  {selectedConfig.name}难度
                </h2>
                <p className="text-gray-400 text-sm">{selectedConfig.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  怪物强化
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" /> 怪物血量
                      </span>
                      <span className="text-white font-bold">x{selectedConfig.hpMultiplier}</span>
                    </div>
                    {getStatBar(selectedConfig.hpMultiplier, 2.5, '#ff4757')}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Swords className="w-3 h-3 text-orange-400" /> 怪物伤害
                      </span>
                      <span className="text-white font-bold">x{selectedConfig.damageMultiplier}</span>
                    </div>
                    {getStatBar(selectedConfig.damageMultiplier, 2.5, '#ff6b35')}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-400" /> 怪物数量
                      </span>
                      <span className="text-white font-bold">x{selectedConfig.countMultiplier}</span>
                    </div>
                    {getStatBar(selectedConfig.countMultiplier, 2.5, '#5352ed')}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  奖励加成
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Gem className="w-3 h-3 text-yellow-400" /> 金币掉落
                      </span>
                      <span className="text-white font-bold">x{selectedConfig.goldMultiplier}</span>
                    </div>
                    {getStatBar(selectedConfig.goldMultiplier, 1.5, '#fbbf24')}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Star className="w-3 h-3 text-purple-400" /> 天赋点奖励
                      </span>
                      <span className="text-white font-bold">x{selectedConfig.talentPointsMultiplier}</span>
                    </div>
                    {getStatBar(selectedConfig.talentPointsMultiplier, 2.0, '#a78bfa')}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    解锁内容
                  </h3>
                  <div className="space-y-2">
                    {selectedConfig.minRuneRarity !== 'common' && (
                      <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-purple-300">
                        ✦ 解锁传说级符文
                      </div>
                    )}
                    {selectedConfig.minEquipmentRarity !== 'common' && (
                      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg px-3 py-2 text-sm text-yellow-300">
                        ✦ 解锁难度专属装备
                      </div>
                    )}
                    {selectedConfig.runeRarityBoost > 0 && (
                      <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-300">
                        ✦ 高级符文出现率 +{Math.round(selectedConfig.runeRarityBoost * 100)}%
                      </div>
                    )}
                    {selectedConfig.equipmentRarityBoost > 0 && (
                      <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg px-3 py-2 text-sm text-orange-300">
                        ✦ 高级装备出现率 +{Math.round(selectedConfig.equipmentRarityBoost * 100)}%
                      </div>
                    )}
                    {selectedDifficulty === 'explorer' && (
                      <div className="bg-green-900/30 border border-green-500/50 rounded-lg px-3 py-2 text-sm text-green-300">
                        ✦ 怪物弱化，适合休闲探索
                      </div>
                    )}
                    {selectedDifficulty === 'adventurer' && (
                      <div className="bg-gray-700/30 border border-gray-500/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                        ✦ 标准冒险体验
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmed && (selectedDifficulty === 'hero' || selectedDifficulty === 'legend') && (
          <div className="bg-red-900/40 border-2 border-red-500/50 rounded-xl p-4 mb-4 text-center animate-pulse">
            <p className="text-red-300 font-bold text-lg">
              ⚠️ 再次点击确认：{selectedConfig?.name}难度挑战极为困难！
            </p>
            <p className="text-red-400/70 text-sm mt-1">
              怪物将非常强大，请确保已做好充分准备
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleStartGame}
            disabled={!selectedDifficulty || !selectedClass}
            className={`py-4 px-12 text-white font-bold text-xl rounded-xl border-4 shadow-lg transition-all flex items-center gap-3 ${
              selectedDifficulty && selectedClass
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-orange-400 hover:scale-105 hover:shadow-orange-500/30 cursor-pointer'
                : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-7 h-7" />
            {confirmed ? '确认开始！' : '开始冒险'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelect;
