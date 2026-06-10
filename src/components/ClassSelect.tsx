import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ALL_CLASSES, getClassById } from '../data/classes';
import { ALL_RUNES } from '../data/runes';
import type { ClassType, PlayerClass } from '../types/game';
import { Flame, Snowflake, Zap, Leaf, Heart, Swords, Shield, Wind, Target, ZapOff, ArrowLeft, Play } from 'lucide-react';
import { getGameEngine } from '../game/GameEngine';

const ClassSelect = () => {
  const { scene } = useGameStore();
  const engine = getGameEngine();
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  if (scene !== 'class_select') return null;

  const handleBack = () => {
    engine.setScene('menu');
  };

  const handleSelectClass = (classId: ClassType) => {
    setSelectedClass(classId);
  };

  const handleStartGame = () => {
    if (!selectedClass) return;
    engine.startGameWithClass(selectedClass);
  };

  const selectedClassData = selectedClass ? getClassById(selectedClass) : null;

  const getClassIcon = (classItem: PlayerClass) => {
    switch (classItem.id) {
      case 'fire_mage':
        return <Flame className="w-12 h-12 text-white" />;
      case 'frost_warlock':
        return <Snowflake className="w-12 h-12 text-white" />;
      case 'thunder_assassin':
        return <Zap className="w-12 h-12 text-white" />;
      case 'nature_guardian':
        return <Leaf className="w-12 h-12 text-white" />;
      default:
        return <Flame className="w-12 h-12 text-white" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'hard':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  const getRuneIcon = (rune: any) => {
    if (rune.type === 'element') {
      switch (rune.element) {
        case 'fire':
          return <Flame className="w-4 h-4 text-white" />;
        case 'ice':
          return <Snowflake className="w-4 h-4 text-white" />;
        case 'thunder':
          return <Zap className="w-4 h-4 text-white" />;
        default:
          return <Flame className="w-4 h-4 text-white" />;
      }
    } else {
      switch (rune.effect) {
        case 'spread':
          return <Target className="w-4 h-4 text-white" />;
        case 'time':
          return <Wind className="w-4 h-4 text-white" />;
        case 'power':
          return <ZapOff className="w-4 h-4 text-white" />;
        case 'pierce':
          return <Swords className="w-4 h-4 text-white" />;
        default:
          return <ZapOff className="w-4 h-4 text-white" />;
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500';
      case 'rare':
        return 'border-blue-500';
      case 'epic':
        return 'border-purple-500';
      case 'legendary':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

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
            返回主菜单
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400">
            选择职业
          </h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {ALL_CLASSES.map((classItem) => (
            <div
              key={classItem.id}
              onClick={() => handleSelectClass(classItem.id)}
              className={`cursor-pointer rounded-xl p-4 border-4 transition-all hover:scale-105 ${
                selectedClass === classItem.id
                  ? 'border-yellow-400 bg-gray-800/80 shadow-lg shadow-yellow-500/30'
                  : 'border-gray-600 bg-gray-800/40 hover:border-gray-400'
              }`}
            >
              <div
                className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center border-4 border-white/30"
                style={{ backgroundColor: classItem.color }}
              >
                {getClassIcon(classItem)}
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-1">
                {classItem.name}
              </h3>
              <p className="text-xs text-gray-400 text-center mb-2">
                {classItem.playStyle}
              </p>
              <div className="flex justify-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(
                    classItem.difficulty
                  )}`}
                >
                  {getDifficultyText(classItem.difficulty)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedClassData && (
          <div className="bg-gray-800/70 border-2 border-gray-600 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/30"
                    style={{ backgroundColor: selectedClassData.color }}
                  >
                    {getClassIcon(selectedClassData)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedClassData.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedClassData.description}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-yellow-400 mb-3">初始属性</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300 text-sm">生命值</span>
                    <span className="ml-auto text-white font-bold">
                      {selectedClassData.stats.maxHp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <Swords className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">伤害加成</span>
                    <span className="ml-auto text-white font-bold">
                      +{Math.round((selectedClassData.stats.attack - 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">防御</span>
                    <span className="ml-auto text-white font-bold">
                      +{Math.round((selectedClassData.stats.defense - 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <Wind className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">速度</span>
                    <span className="ml-auto text-white font-bold">
                      {selectedClassData.stats.speed}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">暴击率</span>
                    <span className="ml-auto text-white font-bold">
                      {Math.round(selectedClassData.stats.critChance * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <ZapOff className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">暴击伤害</span>
                    <span className="ml-auto text-white font-bold">
                      {Math.round(selectedClassData.stats.critDamage * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-3">初始符文</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedClassData.startingRuneIds.map((runeId) => {
                    const rune = ALL_RUNES.find((r) => r.id === runeId);
                    if (!rune) return null;
                    return (
                      <div
                        key={runeId}
                        className={`flex items-center gap-2 bg-gray-700/50 rounded-lg p-2 border-2 ${getRarityColor(
                          rune.rarity
                        )}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: rune.color }}
                        >
                          {getRuneIcon(rune)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {rune.name}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {rune.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h3 className="text-lg font-bold text-cyan-400 mt-4 mb-2">
                  专属符文
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  只有该职业才能获得的强力符文
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedClassData.exclusiveRuneIds.map((runeId) => {
                    const rune = ALL_RUNES.find((r) => r.id === runeId);
                    if (!rune) return null;
                    return (
                      <div
                        key={runeId}
                        className="flex items-center gap-2 bg-purple-900/30 rounded-lg p-2 border-2 border-purple-500"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse"
                          style={{ backgroundColor: rune.color }}
                        >
                          {getRuneIcon(rune)}
                        </div>
                        <div className="flex-1">
                          <p className="text-purple-300 text-sm font-bold">
                            {rune.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {rune.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleStartGame}
            disabled={!selectedClass}
            className={`py-4 px-12 text-white font-bold text-xl rounded-xl border-4 shadow-lg transition-all flex items-center gap-3 ${
              selectedClass
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-orange-400 hover:scale-105 hover:shadow-orange-500/30 cursor-pointer'
                : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-7 h-7" />
            开始冒险
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassSelect;
