import { useGameStore } from '../store/gameStore';
import { TALENT_BRANCHES, TALENT_NODES, canUnlockTalent, getTalentCost, calculateTalentEffects } from '../data/talents';
import type { TalentNode, TalentBranchType } from '../types/game';
import { X, Sparkles, Heart, Swords, Compass, Star, Lock, ChevronUp } from 'lucide-react';

const TalentTree = () => {
  const { showTalentTree, setShowTalentTree, saveData, unlockTalent } = useGameStore();
  
  if (!showTalentTree) return null;
  
  const handleClose = () => {
    setShowTalentTree(false);
  };
  
  const getBranchIcon = (branchId: TalentBranchType) => {
    switch (branchId) {
      case 'survival': return <Heart className="w-5 h-5" />;
      case 'attack': return <Swords className="w-5 h-5" />;
      case 'exploration': return <Compass className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };
  
  const getBranchNodes = (branchId: TalentBranchType) => {
    return TALENT_NODES.filter(n => n.branch === branchId);
  };
  
  const getNodeLevel = (nodeId: string) => {
    return saveData.unlockedTalents[nodeId] || 0;
  };
  
  const getEffectDescription = (node: TalentNode, level: number) => {
    const effects = node.effects;
    const descriptions: string[] = [];
    
    for (const effect of effects) {
      const value = effect.value * (level || 1);
      switch (effect.type) {
        case 'maxHp':
          descriptions.push(`最大生命 +${value}`);
          break;
        case 'speed':
          descriptions.push(`移速 +${Math.round(value * 100)}%`);
          break;
        case 'damage':
          descriptions.push(`伤害 +${Math.round(value * 100)}%`);
          break;
        case 'attackSpeed':
          descriptions.push(`冷却 -${Math.round(value * 100)}%`);
          break;
        case 'runeDrop':
          descriptions.push(`符文掉落 +${Math.round(value * 100)}%`);
          break;
        case 'startRunes':
          descriptions.push(`初始符文 +${value}`);
          break;
        case 'fov':
          descriptions.push(`视野 +${value}`);
          break;
        case 'hpRegen':
          descriptions.push(`每秒回复 ${value} 生命`);
          break;
        case 'damageReduction':
          descriptions.push(`伤害减免 ${Math.round(value * 100)}%`);
          break;
        case 'critChance':
          descriptions.push(`暴击率 +${Math.round(value * 100)}%`);
          break;
        case 'critDamage':
          descriptions.push(`暴伤 +${Math.round(value * 100)}%`);
          break;
        default:
          break;
      }
    }
    
    return descriptions.join('，');
  };
  
  const renderTalentNode = (node: TalentNode, branchColor: string) => {
    const level = getNodeLevel(node.id);
    const isMaxed = level >= node.maxLevel;
    const canUnlock = canUnlockTalent(node.id, saveData.unlockedTalents);
    const cost = getTalentCost(node.id, saveData.unlockedTalents);
    const canAfford = saveData.talentPoints >= cost;
    
    const handleClick = () => {
      if (canUnlock && canAfford) {
        unlockTalent(node.id);
      }
    };
    
    return (
      <div
        key={node.id}
        className="relative flex flex-col items-center"
        style={{ gridColumn: node.position.x + 1 }}
      >
        <button
          onClick={handleClick}
          className={`
            relative w-20 h-20 rounded-xl border-4 transition-all duration-300
            flex flex-col items-center justify-center
            ${level > 0 
              ? 'border-opacity-100 shadow-lg scale-100' 
              : canUnlock 
                ? 'border-opacity-60 hover:scale-105 cursor-pointer hover:border-opacity-100' 
                : 'border-gray-700 opacity-50 cursor-not-allowed'
            }
          `}
          style={{
            borderColor: level > 0 || canUnlock ? branchColor : undefined,
            backgroundColor: level > 0 ? `${branchColor}20` : '#1f2937',
            boxShadow: level > 0 ? `0 0 20px ${branchColor}40` : 'none',
          }}
          disabled={!canUnlock || !canAfford}
        >
          <div className="text-2xl mb-1">
            {level > 0 || canUnlock ? getBranchIcon(node.branch) : <Lock className="w-6 h-6 text-gray-500" />}
          </div>
          <div className="text-xs font-bold" style={{ color: level > 0 || canUnlock ? branchColor : '#6b7280' }}>
            Lv.{level}/{node.maxLevel}
          </div>
          
          {!isMaxed && canUnlock && canAfford && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-300 animate-bounce">
              <ChevronUp className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
        
        <div className="mt-2 text-center">
          <div className={`text-sm font-bold ${level > 0 || canUnlock ? 'text-white' : 'text-gray-500'}`}>
            {node.name}
          </div>
          <div className={`text-xs ${level > 0 || canUnlock ? 'text-gray-400' : 'text-gray-600'}`}>
            {level > 0 || canUnlock ? getEffectDescription(node, 1) : '???'}
          </div>
          {level > 0 && (
            <div className="text-xs text-green-400 mt-0.5">
              当前: {getEffectDescription(node, level)}
            </div>
          )}
          {!isMaxed && (
            <div className={`text-xs mt-1 ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>
              {canUnlock ? `消耗: ${cost} 点` : '需要前置天赋'}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderBranch = (branch: typeof TALENT_BRANCHES[0]) => {
    const nodes = getBranchNodes(branch.id);
    const maxY = Math.max(...nodes.map(n => n.position.y));
    
    return (
      <div key={branch.id} className="flex-1">
        <div className="text-center mb-6">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
            style={{ backgroundColor: `${branch.color}20`, color: branch.color }}
          >
            {getBranchIcon(branch.id)}
            <span className="font-bold text-lg">{branch.name}</span>
          </div>
          <p className="text-gray-400 text-sm">{branch.description}</p>
        </div>
        
        <div className="relative">
          {[...Array(maxY + 1)].map((_, y) => {
            const rowNodes = nodes.filter(n => n.position.y === y);
            const hasMultiple = rowNodes.length > 1;
            
            return (
              <div key={y} className="mb-8">
                <div 
                  className={`grid gap-4 ${hasMultiple ? 'grid-cols-2' : 'grid-cols-1'}`}
                  style={{ justifyItems: 'center' }}
                >
                  {rowNodes.map(node => renderTalentNode(node, branch.color))}
                </div>
                
                {y < maxY && (
                  <div className="flex justify-center -mt-2 mb-2">
                    <div 
                      className="w-0.5 h-6"
                      style={{ backgroundColor: `${branch.color}40` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const effects = calculateTalentEffects(saveData.unlockedTalents);
  
  const totalTalentsSpent = Object.values(saveData.unlockedTalents).reduce((sum, level) => sum + level, 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-gray-900 border-4 border-purple-500 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              天赋树
            </h2>
            <p className="text-gray-400 text-sm mt-1">永久提升你的能力，每局游戏都生效</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-4 bg-gray-800/50 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg shadow-yellow-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-yellow-400 font-bold text-xl">{saveData.talentPoints}</div>
                <div className="text-gray-500 text-xs">可用天赋点</div>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-600" />
            
            <div>
              <div className="text-gray-300 font-bold">已分配: {totalTalentsSpent} 点</div>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-red-400 font-bold">+{effects.maxHp}</div>
              <div className="text-gray-500 text-xs">最大生命</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-bold">+{Math.round(effects.damage * 100)}%</div>
              <div className="text-gray-500 text-xs">技能伤害</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">+{Math.round(effects.speed * 100)}%</div>
              <div className="text-gray-500 text-xs">移动速度</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">+{effects.hpRegen}/s</div>
              <div className="text-gray-500 text-xs">生命回复</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold">{Math.round(effects.critChance * 100)}%</div>
              <div className="text-gray-500 text-xs">暴击率</div>
            </div>
            <div className="text-center">
              <div className="text-pink-400 font-bold">{Math.round(effects.damageReduction * 100)}%</div>
              <div className="text-gray-500 text-xs">减伤</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-8">
            {TALENT_BRANCHES.map(branch => renderBranch(branch))}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            💡 提示：每局游戏结束后，根据你的表现获得天赋点
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalentTree;
