import { useState, useCallback } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { ALL_RUNES, createSkill, SKILLS } from '../data/runes';
import type { Rune, RuneType } from '../types/game';
import { X, Sparkles, Flame, Snowflake, Zap, Layers, Clock, ZapOff, Target, Plus } from 'lucide-react';

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

const DraggableRune = ({
  rune,
  onDragStart,
  small = false,
}: {
  rune: Rune;
  onDragStart: (rune: Rune) => void;
  small?: boolean;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('runeId', rune.id);
    onDragStart(rune);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`${small ? 'w-12 h-12' : 'w-14 h-14'} rounded-lg border-4 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:scale-110 hover:brightness-110 shadow-lg relative`}
      style={{
        backgroundColor: rune.color,
        borderColor: 'rgba(250, 204, 21, 0.6)',
        boxShadow: `0 0 15px ${rune.color}80, inset 0 -3px 0 rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {getRuneIcon(rune)}
      </div>
      <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
    </div>
  );
};

const CombineSlot = ({
  rune,
  slotType,
  label,
  onDrop,
  onClear,
  isHighlighted,
}: {
  rune: Rune | null;
  slotType: RuneType;
  label: string;
  onDrop: (rune: Rune) => void;
  onClear?: () => void;
  isHighlighted?: boolean;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const runeId = e.dataTransfer.getData('runeId');
    const runeData = ALL_RUNES.find(r => r.id === runeId);
    if (runeData && runeData.type === slotType) {
      onDrop(runeData);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-20 h-20 rounded-xl border-4 flex items-center justify-center transition-all relative ${
          rune
            ? 'border-yellow-400'
            : isDragOver
            ? 'border-green-400 bg-green-400/20 scale-110'
            : 'border-gray-600 border-dashed bg-gray-800/50'
        } ${isHighlighted ? 'ring-4 ring-yellow-400/50 animate-pulse' : ''}`}
        style={rune ? { boxShadow: `0 0 25px ${rune.color}60` } : {}}
      >
        {rune ? (
          <>
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: rune.color }}
            >
              {getRuneIcon(rune)}
            </div>
            {onClear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors border-2 border-red-300"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Plus className="w-8 h-8 text-gray-500 mx-auto" />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 font-mono">{label}</span>
    </div>
  );
};

const RunePanel = () => {
  const {
    runeInventory,
    equippedRunes,
    activeSkills,
    showRunePanel,
    setShowRunePanel,
    addToast,
    refreshSaveData,
    isChallengeMode,
  } = useGameStore();
  const engine = getGameEngine();

  const [combineRune1, setCombineRune1] = useState<Rune | null>(null);
  const [combineRune2, setCombineRune2] = useState<Rune | null>(null);
  const [draggedRune, setDraggedRune] = useState<Rune | null>(null);

  const elementRunes = runeInventory.filter((r) => r.type === 'element');
  const effectRunes = runeInventory.filter((r) => r.type === 'effect');

  const combinedSkill =
    combineRune1 && combineRune2
      ? createSkill(combineRune1, combineRune2)
      : null;

  const handleDragStart = useCallback((rune: Rune) => {
    setDraggedRune(rune);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedRune(null);
  }, []);

  const handleDropOnElementSlot = useCallback((rune: Rune) => {
    if (rune.type !== 'element') return;
    if (combineRune2?.id === rune.id) {
      setCombineRune2(null);
    }
    setCombineRune1(rune);
  }, [combineRune2]);

  const handleDropOnEffectSlot = useCallback((rune: Rune) => {
    if (rune.type !== 'effect') return;
    if (combineRune1?.id === rune.id) {
      setCombineRune1(null);
    }
    setCombineRune2(rune);
  }, [combineRune1]);

  const handleEquipCombine = () => {
    if (!combineRune1 || !combineRune2 || !combinedSkill) return;

    const hasRune1 = equippedRunes.some((r) => r?.id === combineRune1.id);
    const hasRune2 = equippedRunes.some((r) => r?.id === combineRune2.id);

    let emptySlots = equippedRunes.filter((r) => r === null).length;
    const neededSlots = (hasRune1 ? 0 : 1) + (hasRune2 ? 0 : 1);

    if (emptySlots < neededSlots) {
      addToast({
        type: 'info',
        title: '装备栏已满',
        description: '请先移除一些符文',
      });
      return;
    }

    if (!hasRune1) {
      const slot = equippedRunes.findIndex((r) => r === null);
      if (slot !== -1) {
        engine.equipRune(combineRune1, slot);
        addToast({
          type: 'rune',
          title: `装备了 ${combineRune1.name}`,
          color: combineRune1.color,
        });
      }
    }

    if (!hasRune2) {
      const slot = engine.getState().equippedRunes.findIndex((r: Rune | null) => r === null);
      if (slot !== -1) {
        engine.equipRune(combineRune2, slot);
        addToast({
          type: 'rune',
          title: `装备了 ${combineRune2.name}`,
          color: combineRune2.color,
        });
      }
    }

    setTimeout(() => {
      addToast({
        type: 'success',
        title: `解锁技能: ${combinedSkill.name}`,
        description: combinedSkill.description,
        color: combineRune1.color,
      });
    }, 400);

    setCombineRune1(null);
    setCombineRune2(null);
    refreshSaveData();
  };

  const handleUnequipRune = (index: number) => {
    const rune = equippedRunes[index];
    if (!rune) return;

    const newEquipped = [...equippedRunes];
    newEquipped[index] = null;

    engine.state.equippedRunes = newEquipped;
    engine.updateSkillsFromRunes();
    if (engine.onStateChange) {
      engine.onStateChange();
    }

    addToast({
      type: 'info',
      title: `移除了 ${rune.name}`,
    });
  };

  if (!showRunePanel) {
    return (
      <button
        onClick={() => setShowRunePanel(true)}
        className="absolute bottom-4 right-4 z-20 bg-gray-900/90 border-4 border-purple-500 px-4 py-2 rounded-lg text-white font-bold hover:bg-purple-900/90 transition-all hover:scale-105 flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        符文背包
      </button>
    );
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70"
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gray-900 border-4 border-purple-500 rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Sparkles className="w-7 h-7" />
            符文系统
          </h2>
          <button
            onClick={() => setShowRunePanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {isChallengeMode && (
          <div className="mb-4 p-3 bg-yellow-900/30 border-2 border-yellow-600 rounded-lg">
            <p className="text-yellow-300 text-sm text-center">
              ⚡ 挑战模式 - 符文已固定，无法更换
            </p>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border-2 border-gray-700">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">
            ✨ 符文合成区 - 拖拽符文进行组合
          </h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <CombineSlot
              rune={combineRune1}
              slotType="element"
              label="元素符文"
              onDrop={handleDropOnElementSlot}
              onClear={combineRune1 ? () => setCombineRune1(null) : undefined}
              isHighlighted={draggedRune?.type === 'element'}
            />

            <div className="text-3xl text-yellow-400 font-bold">+</div>

            <CombineSlot
              rune={combineRune2}
              slotType="effect"
              label="效果符文"
              onDrop={handleDropOnEffectSlot}
              onClear={combineRune2 ? () => setCombineRune2(null) : undefined}
              isHighlighted={draggedRune?.type === 'effect'}
            />

            <div className="text-3xl text-green-400 font-bold">=</div>

            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-20 h-20 rounded-xl border-4 flex items-center justify-center transition-all ${
                  combinedSkill
                    ? 'border-green-400 bg-green-400/20'
                    : 'border-gray-600 border-dashed bg-gray-800/50'
                }`}
                style={
                  combinedSkill && combineRune1
                    ? { boxShadow: `0 0 25px ${combineRune1.color}60` }
                    : {}
                }
              >
                {combinedSkill ? (
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto flex items-center justify-center animate-pulse"
                      style={{ backgroundColor: combineRune1?.color }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs text-center">
                    组合
                    <br />
                    技能
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">生成技能</span>
            </div>
          </div>

          {combinedSkill && combineRune1 && combineRune2 && (
            <div className="mt-4 p-4 bg-gray-900/80 rounded-lg border-2 border-green-500/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-green-400 mb-1">
                    {combinedSkill.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    {combinedSkill.description}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-red-400">
                      伤害: {combinedSkill.damage}
                    </span>
                    <span className="text-blue-400">
                      冷却: {combinedSkill.cooldown / 1000}s
                    </span>
                    <span className="text-purple-400">
                      范围: {combinedSkill.range}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEquipCombine}
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg border-2 border-green-400 transition-all hover:scale-105 whitespace-nowrap"
                >
                  装备组合
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            装备槽位 ({equippedRunes.filter((r) => r).length}/4)
          </h3>
          <div className="flex gap-4 flex-wrap">
            {equippedRunes.map((rune, index) => (
              <div key={index} className="relative">
                <div
                  className="w-14 h-14 rounded-lg border-4 flex items-center justify-center transition-all"
                  style={
                    rune
                      ? {
                          borderColor: '#facc15',
                          backgroundColor: rune.color,
                          boxShadow: `0 0 15px ${rune.color}60`,
                        }
                      : {
                          borderColor: '#4b5563',
                          borderStyle: 'dashed',
                          backgroundColor: 'rgba(31, 41, 55, 0.5)',
                        }
                  }
                >
                  {rune ? (
                    getRuneIcon(rune)
                  ) : (
                    <span className="text-gray-500 text-xs">空</span>
                  )}
                </div>
                {rune && !isChallengeMode && (
                  <button
                    onClick={() => handleUnequipRune(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors border-2 border-red-300"
                    title="移除符文"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                  槽{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-orange-400 mb-3">
            当前技能 ({activeSkills.length})
          </h3>
          {activeSkills.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {activeSkills.map((skill, index) => {
                const elemRune = ALL_RUNES.find(
                  (r) => r.id === skill.elementRuneId
                );
                return (
                  <div
                    key={skill.id}
                    className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: elemRune?.color || '#666' }}
                      >
                        {elemRune && getRuneIcon(elemRune)}
                      </div>
                      <span className="text-white font-bold text-sm">
                        {skill.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{skill.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              拖拽元素符文和效果符文到上方合成区组合技能
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-green-400 mb-3">
            符文背包 ({runeInventory.length})
          </h3>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-orange-300 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              元素符文 ({elementRunes.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {elementRunes.map((rune, index) => (
                <DraggableRune
                  key={`elem-${rune.id}-${index}`}
                  rune={rune}
                  onDragStart={handleDragStart}
                />
              ))}
              {elementRunes.length === 0 && (
                <span className="text-gray-500 text-sm">暂无元素符文</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              效果符文 ({effectRunes.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {effectRunes.map((rune, index) => (
                <DraggableRune
                  key={`eff-${rune.id}-${index}`}
                  rune={rune}
                  onDragStart={handleDragStart}
                />
              ))}
              {effectRunes.length === 0 && (
                <span className="text-gray-500 text-sm">暂无效果符文</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
          <p className="text-gray-300 text-sm">
            <span className="text-yellow-400 font-bold">操作提示：</span>
            将下方的元素符文和效果符文拖拽到上方合成区，组合出独特的魔法技能！
            组合成功后点击"装备组合"按钮将符文放入装备槽，技能就会出现在下方技能栏。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RunePanel;
