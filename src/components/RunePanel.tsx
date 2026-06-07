import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { ALL_RUNES, createSkill, SKILLS } from '../data/runes';
import type { Rune, RuneType, RuneElement, RuneEffect } from '../types/game';
import { X, Sparkles, Flame, Snowflake, Zap, Layers, Clock, ZapOff, Target } from 'lucide-react';

const getRuneIcon = (rune: Rune) => {
  if (rune.type === 'element') {
    switch (rune.element) {
      case 'fire': return <Flame className="w-6 h-6" />;
      case 'ice': return <Snowflake className="w-6 h-6" />;
      case 'thunder': return <Zap className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  } else {
    switch (rune.effect) {
      case 'spread': return <Layers className="w-6 h-6" />;
      case 'time': return <Clock className="w-6 h-6" />;
      case 'power': return <ZapOff className="w-6 h-6" />;
      case 'pierce': return <Target className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  }
};

const RuneSlot = ({
  rune,
  index,
  onClick,
  isCombineSlot = false,
  slotType = null,
}: {
  rune: Rune | null;
  index?: number;
  onClick?: () => void;
  isCombineSlot?: boolean;
  slotType?: RuneType | null;
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-16 h-16 rounded-lg border-4 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
        rune
          ? 'border-yellow-400 bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg'
          : 'border-gray-600 border-dashed bg-gray-800/50 hover:border-gray-500'
      }`}
      style={rune ? { boxShadow: `0 0 15px ${rune.color}40` } : {}}
    >
      {rune ? (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: rune.color }}
        >
          <div className="text-white">
            {getRuneIcon(rune)}
          </div>
        </div>
      ) : (
        <span className="text-gray-500 text-xs">
          {isCombineSlot ? (slotType === 'element' ? '元素' : '效果') : '空'}
        </span>
      )}
    </div>
  );
};

const RunePanel = () => {
  const { runeInventory, equippedRunes, activeSkills, showRunePanel, setShowRunePanel } = useGameStore();
  const engine = getGameEngine();
  
  const handleEquipRune = (rune: Rune, slotIndex: number) => {
    engine.equipRune(rune, slotIndex);
  };
  
  const elementRunes = runeInventory.filter(r => r.type === 'element');
  const effectRunes = runeInventory.filter(r => r.type === 'effect');
  
  if (!showRunePanel) {
    return (
      <button
        onClick={() => setShowRunePanel(true)}
        className="absolute bottom-4 right-4 z-20 bg-gray-900/90 border-4 border-purple-500 px-4 py-2 rounded-lg text-white font-bold hover:bg-purple-900/90 transition-all hover:scale-105"
      >
        符文背包
      </button>
    );
  }
  
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-4 border-purple-500 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            符文系统
          </h2>
          <button
            onClick={() => setShowRunePanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-3">装备槽位 (最多4个符文)</h3>
          <div className="flex gap-3">
            {equippedRunes.map((rune, index) => (
              <div key={index} className="relative">
                <RuneSlot
                  rune={rune}
                  index={index}
                  onClick={() => {
                    if (rune) {
                      const emptySlot = equippedRunes.findIndex(r => r === null);
                    }
                  }}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                  槽位 {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-orange-400 mb-3">当前技能</h3>
          {activeSkills.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {activeSkills.map((skill, index) => {
                const elementRune = runeInventory.find(r => r.id === skill.elementRuneId);
                const effectRune = runeInventory.find(r => r.id === skill.effectRuneId);
                
                return (
                  <div
                    key={skill.id}
                    className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: elementRune?.color || '#666' }}
                      >
                        {elementRune && getRuneIcon(elementRune)}
                      </div>
                      <span className="text-white font-bold">+</span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: effectRune?.color || '#666' }}
                      >
                        {effectRune && getRuneIcon(effectRune)}
                      </div>
                      <span className="text-white font-bold ml-2">{skill.name}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{skill.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-red-400">伤害: {skill.damage}</span>
                      <span className="text-blue-400">冷却: {skill.cooldown / 1000}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              装备至少一个元素符文和一个效果符文来生成技能
            </p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-green-400 mb-3">
            符文背包 ({runeInventory.length})
          </h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-bold text-orange-300 mb-2">元素符文</h4>
            <div className="flex flex-wrap gap-2">
              {elementRunes.map((rune, index) => (
                <div
                  key={`${rune.id}-${index}`}
                  className="relative group"
                  onClick={() => {
                    const emptySlot = equippedRunes.findIndex(r => r === null);
                    if (emptySlot !== -1) {
                      handleEquipRune(rune, emptySlot);
                    }
                  }}
                >
                  <RuneSlot rune={rune} />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {rune.name}
                  </div>
                </div>
              ))}
              {elementRunes.length === 0 && (
                <span className="text-gray-500 text-sm">暂无元素符文</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2">效果符文</h4>
            <div className="flex flex-wrap gap-2">
              {effectRunes.map((rune, index) => (
                <div
                  key={`${rune.id}-${index}`}
                  className="relative group"
                  onClick={() => {
                    const emptySlot = equippedRunes.findIndex(r => r === null);
                    if (emptySlot !== -1) {
                      handleEquipRune(rune, emptySlot);
                    }
                  }}
                >
                  <RuneSlot rune={rune} />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {rune.name}
                  </div>
                </div>
              ))}
              {effectRunes.length === 0 && (
                <span className="text-gray-500 text-sm">暂无效果符文</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">
            <span className="text-yellow-400 font-bold">提示：</span>
            点击背包中的符文可以装备到空槽位。同时装备元素符文和效果符文会自动生成组合技能。按数字键 1-3 释放技能。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RunePanel;
