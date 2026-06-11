import { useState, useCallback, useMemo } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import {
  ALL_RUNES,
  createSkill,
  RARITY_CONFIG,
  getNextRarity,
  canSynthesize,
  decomposeRune,
} from '../data/runes';
import type { Rune, RuneType, RuneRarity } from '../types/game';
import {
  X,
  Sparkles,
  Flame,
  Snowflake,
  Zap,
  Layers,
  Clock,
  ZapOff,
  Target,
  Plus,
  Trash2,
  Hammer,
  ChevronDown,
  Star,
  Gem,
} from 'lucide-react';

const getRuneIcon = (rune: Rune) => {
  if (rune.type === 'element') {
    switch (rune.element) {
      case 'fire':
        return <Flame className="w-6 h-6 text-white" />;
      case 'ice':
        return <Snowflake className="w-6 h-6 text-white" />;
      case 'thunder':
        return <Zap className="w-6 h-6 text-white" />;
      default:
        return <Sparkles className="w-6 h-6 text-white" />;
    }
  } else {
    switch (rune.effect) {
      case 'spread':
        return <Layers className="w-6 h-6 text-white" />;
      case 'time':
        return <Clock className="w-6 h-6 text-white" />;
      case 'power':
        return <ZapOff className="w-6 h-6 text-white" />;
      case 'pierce':
        return <Target className="w-6 h-6 text-white" />;
      default:
        return <Sparkles className="w-6 h-6 text-white" />;
    }
  }
};

const getRarityStars = (rarity: RuneRarity) => {
  const tier = RARITY_CONFIG[rarity].tier;
  return Array.from({ length: tier }, (_, i) => (
    <Star key={i} className="w-2.5 h-2.5" fill="currentColor" />
  ));
};

const RarityBadge = ({ rarity }: { rarity: RuneRarity }) => {
  const config = RARITY_CONFIG[rarity];
  return (
    <div
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold ${config.animation}`}
      style={{
        background: `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`,
        color: config.color,
        border: `1.5px solid ${config.color}80`,
        boxShadow: config.borderGlow,
        textShadow: `0 0 6px ${config.color}80`,
      }}
    >
      {getRarityStars(rarity)}
      <span className="ml-1">{config.name}</span>
    </div>
  );
};

const RuneCard = ({
  rune,
  onDragStart,
  small = false,
  showRarity = true,
  onClick,
  selected = false,
  decomposed = false,
  onContextMenu,
  index,
}: {
  rune: Rune;
  onDragStart?: (rune: Rune) => void;
  small?: boolean;
  showRarity?: boolean;
  onClick?: () => void;
  selected?: boolean;
  decomposed?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  index?: number;
}) => {
  const config = RARITY_CONFIG[rune.rarity];
  const size = small ? 'w-12 h-12' : 'w-14 h-14';

  const handleDragStart = (e: React.DragEvent) => {
    if (!onDragStart) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('runeId', rune.id);
    if (index !== undefined) {
      e.dataTransfer.setData('runeIndex', String(index));
    }
    onDragStart(rune);
  };

  return (
    <div className="relative inline-block">
      {rune.rarity !== 'common' && (
        <div
          className="absolute inset-[-3px] rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.color}50 0%, transparent 70%)`,
            filter: 'blur(4px)',
            zIndex: 0,
          }}
        />
      )}
      <div
        draggable={!!onDragStart}
        onDragStart={handleDragStart}
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={`${size} rounded-lg border-[3px] flex items-center justify-center relative overflow-hidden
          ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${selected ? 'ring-4 ring-white scale-110 z-10' : ''}
          ${decomposed ? 'opacity-40 grayscale' : ''}
          transition-all duration-200 hover:scale-110 hover:brightness-115 shadow-lg
          ${config.animation}`}
        style={{
          background: `linear-gradient(145deg, ${rune.color} 0%, ${rune.color}cc 50%, ${rune.color}99 100%)`,
          borderColor: config.borderColor,
          boxShadow: `${config.borderGlow}, ${config.innerShadow}, 0 0 ${config.glowIntensity}px ${rune.color}80`,
        }}
      >
        <div
          className="rune-glow-overlay"
          style={{ backgroundColor: config.color }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="drop-shadow-lg">
            {getRuneIcon(rune)}
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-md pointer-events-none z-10"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)`,
          }}
        />
        {rune.rarity === 'legendary' && (
          <>
            <div
              className="rarity-sparkle"
              style={{ top: '8%', left: '10%', animationDelay: '0s' }}
            />
            <div
              className="rarity-sparkle-diamond"
              style={{ top: '55%', right: '8%', animationDelay: '0.6s' }}
            />
            <div
              className="rarity-sparkle"
              style={{ bottom: '10%', left: '20%', animationDelay: '1.2s' }}
            />
            <div
              className="rarity-sparkle-diamond"
              style={{ top: '15%', right: '20%', animationDelay: '1.8s' }}
            />
          </>
        )}
        {rune.rarity === 'epic' && (
          <>
            <div
              className="rarity-sparkle"
              style={{ top: '15%', right: '15%', animationDelay: '0.7s' }}
            />
            <div
              className="rarity-sparkle-diamond"
              style={{ bottom: '15%', left: '15%', animationDelay: '1.4s' }}
            />
            <div
              className="rarity-sparkle"
              style={{ top: '60%', right: '60%', animationDelay: '2.1s' }}
            />
          </>
        )}
        {rune.rarity === 'rare' && (
          <>
            <div
              className="rarity-sparkle"
              style={{ top: '20%', right: '20%', animationDelay: '0.5s' }}
            />
            <div
              className="rarity-sparkle"
              style={{ bottom: '20%', left: '20%', animationDelay: '1.5s' }}
            />
          </>
        )}
      </div>
      {showRarity && !small && (
        <div className="absolute -top-2.5 -right-2.5 z-20">
          <RarityBadge rarity={rune.rarity} />
        </div>
      )}
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
    const runeData = ALL_RUNES.find((r) => r.id === runeId);
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
            ? ''
            : isDragOver
            ? 'border-green-400 bg-green-400/20 scale-110'
            : 'border-gray-600 border-dashed bg-gray-800/50'
        } ${isHighlighted ? 'ring-4 ring-yellow-400/50 animate-pulse' : ''}`}
        style={
          rune
            ? {
                borderColor: RARITY_CONFIG[rune.rarity].borderColor,
                boxShadow: `0 0 25px ${rune.color}60`,
              }
            : {}
        }
      >
        {rune ? (
          <>
            <RuneCard rune={rune} showRarity={false} small />
            {onClear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors border-2 border-red-300 z-30"
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

type PanelMode = 'combine' | 'synthesize' | 'decompose';

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
    runeDust,
    synthesizeRunesAction,
    decomposeRuneAction,
  } = useGameStore();
  const engine = getGameEngine();

  const [panelMode, setPanelMode] = useState<PanelMode>('combine');

  const [combineRune1, setCombineRune1] = useState<Rune | null>(null);
  const [combineRune2, setCombineRune2] = useState<Rune | null>(null);
  const [draggedRune, setDraggedRune] = useState<Rune | null>(null);

  const [synthSelected, setSynthSelected] = useState<{ index: number; rune: Rune }[]>([]);
  const [decomposeConfirm, setDecomposeConfirm] = useState<{
    index: number;
    rune: Rune;
  } | null>(null);

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

  const handleDropOnElementSlot = useCallback(
    (rune: Rune) => {
      if (rune.type !== 'element') return;
      if (combineRune2?.id === rune.id) {
        setCombineRune2(null);
      }
      setCombineRune1(rune);
    },
    [combineRune2]
  );

  const handleDropOnEffectSlot = useCallback(
    (rune: Rune) => {
      if (rune.type !== 'effect') return;
      if (combineRune1?.id === rune.id) {
        setCombineRune1(null);
      }
      setCombineRune2(rune);
    },
    [combineRune1]
  );

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
      const slot = engine
        .getState()
        .equippedRunes.findIndex((r: Rune | null) => r === null);
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

  const toggleSynthSelect = (index: number, rune: Rune) => {
    const existingIdx = synthSelected.findIndex((s) => s.index === index);
    if (existingIdx !== -1) {
      setSynthSelected(synthSelected.filter((_, i) => i !== existingIdx));
      return;
    }

    if (synthSelected.length === 0) {
      setSynthSelected([{ index, rune }]);
      return;
    }

    const first = synthSelected[0].rune;
    const isCompatible =
      rune.rarity === first.rarity &&
      rune.type === first.type &&
      (rune.type === 'element'
        ? rune.element === first.element
        : rune.effect === first.effect);

    if (!isCompatible) {
      addToast({
        type: 'info',
        title: '无法选择',
        description: '合成需要相同稀有度、相同类型、相同元素/效果的符文',
      });
      return;
    }

    const config = RARITY_CONFIG[first.rarity];
    if (synthSelected.length >= config.synthesizeCount) {
      addToast({
        type: 'info',
        title: '已达上限',
        description: `最多选择 ${config.synthesizeCount} 个符文进行合成`,
      });
      return;
    }

    const equippedRuneIds = equippedRunes.filter(Boolean).map((r) => r!.id);
    if (equippedRuneIds.includes(rune.id)) {
      addToast({
        type: 'info',
        title: '已装备',
        description: '请先卸下装备中的符文再合成',
      });
      return;
    }

    setSynthSelected([...synthSelected, { index, rune }]);
  };

  const synthPreview = useMemo(() => {
    if (synthSelected.length === 0) return null;
    const selectedRunes = synthSelected.map((s) => s.rune);
    if (!canSynthesize(selectedRunes)) {
      return {
        canSynth: false,
        needCount: RARITY_CONFIG[selectedRunes[0].rarity].synthesizeCount,
        currentCount: selectedRunes.length,
        nextRarity: getNextRarity(selectedRunes[0].rarity),
      };
    }
    return {
      canSynth: true,
      needCount: RARITY_CONFIG[selectedRunes[0].rarity].synthesizeCount,
      currentCount: selectedRunes.length,
      nextRarity: getNextRarity(selectedRunes[0].rarity),
    };
  }, [synthSelected]);

  const handleSynthConfirm = () => {
    if (!synthPreview?.canSynth) return;
    const runeIds = synthSelected.map((s) => s.rune.id);
    const success = synthesizeRunesAction(runeIds);
    if (success) {
      setSynthSelected([]);
    }
  };

  const handleDecomposeConfirm = () => {
    if (!decomposeConfirm) return;
    decomposeRuneAction(decomposeConfirm.rune.id, decomposeConfirm.index);
    setDecomposeConfirm(null);
  };

  const getFilteredInventory = (type: RuneType) => {
    const items = type === 'element' ? elementRunes : effectRunes;
    const baseItems = runeInventory.filter((r) => r.type === type);
    return baseItems.map((rune, globalIdx) => ({
      rune,
      globalIdx: runeInventory.findIndex(
        (r, i) =>
          r.id === rune.id &&
          i >= runeInventory.indexOf(items[0]) &&
          runeInventory.slice(0, i).filter((rr) => rr.id === rune.id).length ===
            items.slice(0, items.indexOf(rune)).filter((rr) => rr.id === rune.id).length
      ),
      actualIdx: runeInventory.indexOf(rune, runeInventory.findIndex((x) => x === items[items.indexOf(rune)])),
    }));
  };

  const renderRuneGrid = (type: RuneType) => {
    const items = runeInventory
      .map((rune, idx) => ({ rune, idx }))
      .filter((x) => x.rune.type === type);

    return items.map(({ rune, idx }) => {
      const inSynth = panelMode === 'synthesize' &&
        synthSelected.some((s) => s.index === idx);

      return (
        <div key={`${type}-${rune.id}-${idx}`} className="relative">
          <RuneCard
            rune={rune}
            onDragStart={panelMode === 'combine' ? handleDragStart : undefined}
            onClick={
              panelMode === 'synthesize'
                ? () => toggleSynthSelect(idx, rune)
                : panelMode === 'decompose'
                ? () => setDecomposeConfirm({ index: idx, rune })
                : undefined
            }
            selected={inSynth}
            index={idx}
          />
          {panelMode === 'synthesize' && inSynth && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-30">
              {synthSelected.findIndex((s) => s.index === idx) + 1}
            </div>
          )}
        </div>
      );
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
      <div className="bg-gray-900 border-4 border-purple-500 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Sparkles className="w-7 h-7" />
            符文系统
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2"
              style={{
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
              }}
            >
              <Gem className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-sm">
                {runeDust} 粉尘
              </span>
            </div>
            <button
              onClick={() => setShowRunePanel(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'combine', label: '技能组合', icon: Sparkles },
            { key: 'synthesize', label: '符文合成', icon: Hammer },
            { key: 'decompose', label: '符文分解', icon: Trash2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setPanelMode(key as PanelMode);
                setSynthSelected([]);
                setDecomposeConfirm(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                panelMode === key
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {isChallengeMode && (
          <div className="mb-4 p-3 bg-yellow-900/30 border-2 border-yellow-600 rounded-lg">
            <p className="text-yellow-300 text-sm text-center">
              ⚡ 挑战模式 - 符文已固定，无法更换
            </p>
          </div>
        )}

        {panelMode === 'combine' && (
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
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-green-400">
                        {combinedSkill.name}
                      </h4>
                      <RarityBadge
                        rarity={
                          RARITY_CONFIG[combineRune1.rarity].tier >=
                          RARITY_CONFIG[combineRune2.rarity].tier
                            ? combineRune1.rarity
                            : combineRune2.rarity
                        }
                      />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {combinedSkill.description}
                    </p>
                    <div className="flex gap-4 text-xs flex-wrap">
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
                    disabled={isChallengeMode}
                    className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-green-400 disabled:border-gray-500 transition-all hover:scale-105 disabled:hover:scale-100 whitespace-nowrap"
                  >
                    装备组合
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {panelMode === 'synthesize' && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border-2 border-amber-700">
            <h3 className="text-lg font-bold text-amber-400 mb-3 text-center flex items-center justify-center gap-2">
              <Hammer className="w-5 h-5" />
              符文合成 - 选择相同符文升级为更高稀有度
            </h3>
            {synthPreview ? (
              <div className="mb-4 p-3 bg-gray-900/80 rounded-lg border-2 border-amber-500/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-300 text-sm">
                        已选择：
                        <span
                          className="font-bold"
                          style={{
                            color: RARITY_CONFIG[synthSelected[0].rune.rarity].color,
                          }}
                        >
                          {synthPreview.currentCount}/{synthPreview.needCount}
                        </span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                      {synthPreview.nextRarity && (
                        <RarityBadge rarity={synthPreview.nextRarity} />
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      相同稀有度、相同类型、相同元素/效果的 {synthPreview.needCount} 个符文 → 更高一级稀有度
                    </p>
                  </div>
                  <button
                    onClick={handleSynthConfirm}
                    disabled={!synthPreview.canSynth}
                    className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-amber-400 disabled:border-gray-500 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <Hammer className="w-4 h-4" />
                    合成
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-900/60 rounded-lg border-2 border-gray-600">
                <p className="text-gray-400 text-sm text-center">
                  点击下方背包中的符文进行选择（3个同稀有度、同类型符文可合成更高等级）
                </p>
              </div>
            )}
          </div>
        )}

        {panelMode === 'decompose' && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border-2 border-red-700">
            <h3 className="text-lg font-bold text-red-400 mb-3 text-center flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              符文分解 - 将不需要的符文分解为粉尘
            </h3>
            <div className="p-3 bg-gray-900/60 rounded-lg border-2 border-gray-600 mb-2">
              <p className="text-gray-400 text-sm text-center">
                点击背包中的符文进行分解，获得符文粉尘
              </p>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="text-gray-400">
                  普通 →{' '}
                  <span className="text-yellow-400 font-bold">
                    {RARITY_CONFIG.common.dustValue}
                  </span>{' '}
                  粉尘
                </span>
                <span className="text-gray-400">
                  稀有 →{' '}
                  <span className="text-yellow-400 font-bold">
                    {RARITY_CONFIG.rare.dustValue}
                  </span>{' '}
                  粉尘
                </span>
                <span className="text-gray-400">
                  史诗 →{' '}
                  <span className="text-yellow-400 font-bold">
                    {RARITY_CONFIG.epic.dustValue}
                  </span>{' '}
                  粉尘
                </span>
                <span className="text-gray-400">
                  传说 →{' '}
                  <span className="text-yellow-400 font-bold">
                    {RARITY_CONFIG.legendary.dustValue}
                  </span>{' '}
                  粉尘
                </span>
              </div>
            </div>
            {decomposeConfirm && (
              <div className="p-4 bg-red-900/30 rounded-lg border-2 border-red-500/50 mb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <RuneCard
                      rune={decomposeConfirm.rune}
                      showRarity={false}
                      small
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">
                          {decomposeConfirm.rune.name}
                        </span>
                        <RarityBadge rarity={decomposeConfirm.rune.rarity} />
                      </div>
                      <p className="text-gray-400 text-xs">
                        将获得{' '}
                        <span className="text-yellow-400 font-bold">
                          {decomposeRune(decomposeConfirm.rune)}
                        </span>{' '}
                        符文粉尘
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDecomposeConfirm(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg border-2 border-gray-500 transition-all text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDecomposeConfirm}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg border-2 border-red-400 transition-all hover:scale-105 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      确认分解
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                          borderColor: RARITY_CONFIG[rune.rarity].borderColor,
                          backgroundColor: rune.color,
                          boxShadow: `0 0 ${RARITY_CONFIG[rune.rarity].glowIntensity}px ${rune.color}60`,
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
                {rune && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <RarityBadge rarity={rune.rarity} />
                  </div>
                )}
                {rune && !isChallengeMode && (
                  <button
                    onClick={() => handleUnequipRune(index)}
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors border-2 border-red-300 z-30"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSkills.map((skill, index) => {
                const elemRune = ALL_RUNES.find(
                  (r) => r.id === skill.elementRuneId
                );
                const effectRune = ALL_RUNES.find(
                  (r) => r.id === skill.effectRuneId
                );
                const higherRarity =
                  elemRune && effectRune
                    ? RARITY_CONFIG[elemRune.rarity].tier >=
                      RARITY_CONFIG[effectRune.rarity].tier
                      ? elemRune.rarity
                      : effectRune.rarity
                    : elemRune?.rarity || effectRune?.rarity || 'common';
                return (
                  <div
                    key={skill.id}
                    className="bg-gray-800 border-2 rounded-lg p-3"
                    style={{
                      borderColor: `${RARITY_CONFIG[higherRarity].color}60`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: elemRune?.color || '#666',
                          boxShadow: `0 0 10px ${elemRune?.color || '#666'}60`,
                        }}
                      >
                        {elemRune && getRuneIcon(elemRune)}
                      </div>
                      <span className="text-white font-bold text-sm">
                        {skill.name}
                      </span>
                      <RarityBadge rarity={higherRarity} />
                      <span className="ml-auto text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-1">
                      {skill.description}
                    </p>
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-red-400">
                        伤害: {skill.damage}
                      </span>
                      <span className="text-blue-400">
                        冷却: {skill.cooldown / 1000}s
                      </span>
                      <span className="text-purple-400">
                        范围: {skill.range}
                      </span>
                    </div>
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
            <div className="flex flex-wrap gap-3 p-3 bg-gray-800/50 rounded-lg min-h-[70px]">
              {renderRuneGrid('element')}
              {elementRunes.length === 0 && (
                <span className="text-gray-500 text-sm self-center">
                  暂无元素符文
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              效果符文 ({effectRunes.length})
            </h4>
            <div className="flex flex-wrap gap-3 p-3 bg-gray-800/50 rounded-lg min-h-[70px]">
              {renderRuneGrid('effect')}
              {effectRunes.length === 0 && (
                <span className="text-gray-500 text-sm self-center">
                  暂无效果符文
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
          {panelMode === 'combine' && (
            <p className="text-gray-300 text-sm">
              <span className="text-yellow-400 font-bold">操作提示：</span>
              将下方的元素符文和效果符文拖拽到上方合成区，组合出独特的魔法技能！
              组合成功后点击"装备组合"按钮将符文放入装备槽，技能就会出现在下方技能栏。
            </p>
          )}
          {panelMode === 'synthesize' && (
            <p className="text-gray-300 text-sm">
              <span className="text-yellow-400 font-bold">合成规则：</span>
              选择 3 个相同稀有度、相同类型（元素/效果）、相同属性（如火、冰、扩散等）的符文，
              可以合成 1 个更高稀有度的同类符文。传说符文无法继续合成。
            </p>
          )}
          {panelMode === 'decompose' && (
            <p className="text-gray-300 text-sm">
              <span className="text-yellow-400 font-bold">分解规则：</span>
              点击不需要的符文将其分解，获得符文粉尘。装备中的符文无法分解，请先卸下。
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunePanel;
