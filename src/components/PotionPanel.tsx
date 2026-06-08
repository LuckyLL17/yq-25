import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { POTION_TEMPLATES, POTION_RECIPES, MATERIAL_TEMPLATES, getPotionTemplate, getMaterialTemplate, getRecipeByPotionId } from '../data/potions';
import type { Potion, PotionMaterial, PotionRarity } from '../types/game';
import { X, FlaskConical, Heart, Shield, Sword, Wind, PawPrint, Sparkles } from 'lucide-react';

const getRarityColor = (rarity: PotionRarity): string => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    default: return 'border-gray-400';
  }
};

const getRarityBg = (rarity: PotionRarity): string => {
  switch (rarity) {
    case 'common': return 'from-gray-600 to-gray-700';
    case 'rare': return 'from-blue-600 to-blue-700';
    case 'epic': return 'from-purple-600 to-purple-700';
    default: return 'from-gray-600 to-gray-700';
  }
};

const getPotionTypeIcon = (type: string) => {
  switch (type) {
    case 'health': return <Heart className="w-5 h-5 text-white" />;
    case 'attack': return <Sword className="w-5 h-5 text-white" />;
    case 'defense': return <Shield className="w-5 h-5 text-white" />;
    case 'speed': return <Wind className="w-5 h-5 text-white" />;
    case 'heal_pet': return <PawPrint className="w-5 h-5 text-white" />;
    default: return <Sparkles className="w-5 h-5 text-white" />;
  }
};

const MaterialItem = ({ material, count }: { material: PotionMaterial; count: number }) => {
  return (
    <div
      className={`relative w-14 h-14 rounded-lg border-4 flex flex-col items-center justify-center bg-gradient-to-br ${getRarityBg(material.rarity)} shadow-lg transition-all hover:scale-105`}
      style={{
        boxShadow: `0 0 10px ${material.color}40`,
      }}
      title={`${material.name} x${count}\n${material.description}`}
    >
      <span className="text-xl">{material.icon}</span>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-yellow-400">{count}</span>
      </div>
      <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
    </div>
  );
};

const PotionItem = ({ 
  potion, 
  count, 
  cooldown = 0, 
  onUse, 
  onUsePet 
}: { 
  potion: Potion; 
  count: number; 
  cooldown?: number;
  onUse?: () => void;
  onUsePet?: () => void;
}) => {
  const isOnCooldown = cooldown > 0;
  const cooldownPercent = cooldown / potion.cooldown;

  return (
    <div
      className={`relative w-16 h-16 rounded-lg border-4 flex flex-col items-center justify-center bg-gradient-to-br ${getRarityBg(potion.rarity)} shadow-lg transition-all ${
        isOnCooldown ? 'opacity-60' : 'hover:scale-105 cursor-pointer'
      }`}
      style={{
        boxShadow: `0 0 12px ${potion.color}50`,
        borderColor: potion.color,
      }}
      title={`${potion.name} x${count}\n${potion.description}\n冷却: ${potion.cooldown / 1000}秒`}
    >
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center" 
           style={{ backgroundColor: potion.color + '40' }}>
        {getPotionTypeIcon(potion.type)}
      </div>
      
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 border-2 border-yellow-400 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-yellow-400">{count}</span>
      </div>
      
      {isOnCooldown && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all rounded-b-md"
          style={{ height: `${cooldownPercent * 100}%` }}
        />
      )}
      
      <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
      
      {onUse && !isOnCooldown && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onUse(); }}
            className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded border border-green-400"
          >
            自己用
          </button>
          {onUsePet && (
            <button
              onClick={(e) => { e.stopPropagation(); onUsePet(); }}
              className="px-2 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs rounded border border-pink-400"
            >
              宠物用
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ 
  potionTemplateId, 
  canCraft, 
  onCraft 
}: { 
  potionTemplateId: string; 
  canCraft: boolean;
  onCraft: () => void;
}) => {
  const template = getPotionTemplate(potionTemplateId);
  const recipe = getRecipeByPotionId(potionTemplateId);
  
  if (!template || !recipe) return null;

  return (
    <div className={`p-3 rounded-lg border-2 ${canCraft ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800/50'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-12 h-12 rounded-lg border-3 flex items-center justify-center bg-gradient-to-br ${getRarityBg(template.rarity)}`}
          style={{ borderColor: template.color, boxShadow: `0 0 8px ${template.color}40` }}
        >
          {getPotionTypeIcon(template.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm">{template.name}</h4>
          <p className="text-gray-400 text-xs">{template.description}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-1">所需材料：</p>
        <div className="flex gap-2 flex-wrap">
          {recipe.materials.map((mat, idx) => {
            const matTemplate = getMaterialTemplate(mat.materialId);
            return matTemplate ? (
              <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
                <span className="text-sm">{matTemplate.icon}</span>
                <span className="text-xs text-gray-300">{matTemplate.name} x{mat.count}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
      
      <button
        onClick={onCraft}
        disabled={!canCraft}
        className={`w-full py-2 rounded font-bold text-sm transition-all ${
          canCraft
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-2 border-green-400 hover:scale-105'
            : 'bg-gray-700 text-gray-500 border-2 border-gray-600 cursor-not-allowed'
        }`}
      >
        {canCraft ? '✨ 合成' : '材料不足'}
      </button>
    </div>
  );
};

const PotionPanel = () => {
  const {
    potionInventory,
    materialInventory,
    potionCooldowns,
    showPotionPanel,
    setShowPotionPanel,
    usePotion,
    craftPotion,
    pet,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'craft' | 'inventory'>('craft');

  const materialCounts: Record<string, number> = {};
  for (const mat of materialInventory) {
    materialCounts[mat.id] = (materialCounts[mat.id] || 0) + 1;
  }

  const potionCounts: Record<string, { count: number; potion: Potion }> = {};
  for (const potion of potionInventory) {
    if (!potionCounts[potion.templateId]) {
      potionCounts[potion.templateId] = { count: 0, potion };
    }
    potionCounts[potion.templateId].count++;
  }

  const canCraftPotion = (potionTemplateId: string): boolean => {
    const recipe = getRecipeByPotionId(potionTemplateId);
    if (!recipe) return false;
    
    for (const mat of recipe.materials) {
      if ((materialCounts[mat.materialId] || 0) < mat.count) {
        return false;
      }
    }
    return true;
  };

  const handleUsePotion = (potionId: string, target: 'player' | 'pet') => {
    usePotion(potionId, target);
  };

  const handleCraftPotion = (potionTemplateId: string) => {
    craftPotion(potionTemplateId);
  };

  if (!showPotionPanel) {
    return (
      <button
        onClick={() => setShowPotionPanel(true)}
        className="absolute bottom-4 left-4 z-20 bg-gray-900/90 border-4 border-orange-500 px-4 py-2 rounded-lg text-white font-bold hover:bg-orange-900/90 transition-all hover:scale-105 flex items-center gap-2"
      >
        <FlaskConical className="w-5 h-5" />
        药炉
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-4 border-orange-500 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-300 flex items-center gap-2">
            <FlaskConical className="w-7 h-7" />
            药炉系统
          </h2>
          <button
            onClick={() => setShowPotionPanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('craft')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'craft'
                ? 'bg-orange-600 text-white border-2 border-orange-400'
                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
            }`}
          >
            🧪 药水合成
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-orange-600 text-white border-2 border-orange-400'
                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
            }`}
          >
            🎒 药水背包
          </button>
        </div>

        {activeTab === 'craft' && (
          <>
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
              <h3 className="text-lg font-bold text-green-400 mb-3">📦 材料库存</h3>
              {materialInventory.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(materialCounts).map(([matId, count]) => {
                    const template = getMaterialTemplate(matId);
                    return template ? (
                      <MaterialItem key={matId} material={template} count={count} />
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无材料，击杀敌人或开启宝箱获取</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">📜 合成配方</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POTION_TEMPLATES.map((template) => (
                  <RecipeCard
                    key={template.id}
                    potionTemplateId={template.id}
                    canCraft={canCraftPotion(template.id)}
                    onCraft={() => handleCraftPotion(template.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-3">🧪 药水库存</h3>
            {potionInventory.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {Object.entries(potionCounts).map(([templateId, { count, potion }]) => {
                  const cooldown = potionCooldowns[templateId] || 0;
                  const canUseOnPet = potion.type === 'heal_pet' || potion.type === 'health';
                  
                  return (
                    <div key={templateId} className="flex flex-col items-center">
                      <PotionItem
                        potion={potion}
                        count={count}
                        cooldown={cooldown}
                        onUse={() => handleUsePotion(potion.id, 'player')}
                        onUsePet={pet && canUseOnPet ? () => handleUsePotion(potion.id, 'pet') : undefined}
                      />
                      <span className="text-xs text-gray-400 mt-1 text-center">{potion.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">暂无药水，去合成一些吧！</p>
            )}
            
            <div className="mt-6 p-3 bg-orange-900/30 rounded-lg border border-orange-700/50">
              <p className="text-orange-300 text-sm">
                <span className="font-bold">提示：</span> 
                将鼠标悬停在药水上可以看到使用按钮。生命药水可以给宠物使用，其他药水只能自己使用。
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
          <p className="text-gray-300 text-sm">
            <span className="text-yellow-400 font-bold">操作提示：</span>
            击杀敌人和开启宝箱有几率获得材料和药水。收集材料后可以在药炉中合成更强力的药水！
            药水有冷却时间，请合理使用。
          </p>
        </div>
      </div>
    </div>
  );
};

export default PotionPanel;
