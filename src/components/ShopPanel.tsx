import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getGameEngine } from '../game/GameEngine';
import { X, ShoppingBag, Star, Sparkles, FlaskConical, Sword, Shield, Gem, Zap } from 'lucide-react';
import type { Shop, ShopItem, Rune, Equipment, Potion } from '../types/game';
import { RARITY_COLORS, RARITY_NAMES, getStatName, getStatDisplayValue, getBuyPrice } from '../data/equipment';
import { drawShopkeeper } from '../game/utils/pixel';
import { getRuneBuyPrice } from '../data/shop';

const RARITY_RUNE_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#60a5fa',
  epic: '#a78bfa',
};

const ShopItemCard = ({
  shopItem,
  onClick,
  isSelected,
  canAfford,
}: {
  shopItem: ShopItem;
  onClick?: () => void;
  isSelected?: boolean;
  canAfford: boolean;
}) => {
  const getItemDisplay = () => {
    if (shopItem.type === 'rune') {
      const rune = shopItem.item as Rune;
      return {
        icon: rune.type === 'element' ? '✨' : '🔮',
        name: rune.name,
        color: rune.color,
        rarity: rune.rarity,
        description: rune.description,
      };
    } else if (shopItem.type === 'equipment') {
      const equip = shopItem.item as Equipment;
      return {
        icon: equip.icon,
        name: equip.name,
        color: equip.color,
        rarity: equip.rarity,
        description: equip.description,
      };
    } else {
      const potion = shopItem.item as Potion;
      return {
        icon: potion.icon,
        name: potion.name,
        color: potion.color,
        rarity: potion.rarity,
        description: potion.description,
      };
    }
  };

  const display = getItemDisplay();
  const rarityColor = shopItem.type === 'rune' 
    ? RARITY_RUNE_COLORS[display.rarity] || '#9ca3af'
    : RARITY_COLORS[display.rarity as keyof typeof RARITY_COLORS] || '#9ca3af';

  if (shopItem.sold) {
    return (
      <div className="relative rounded-xl border-4 border-gray-700 bg-gray-800/50 opacity-50">
        <div className="p-3">
          <div className="text-4xl text-center mb-1 grayscale">
            {display.icon}
          </div>
          <div className="text-sm font-bold text-center text-gray-500">
            已售出
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-400 text-lg font-bold transform -rotate-12 border-2 border-red-400 px-3 py-1 rounded">
            SOLD
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border-4 cursor-pointer transition-all hover:scale-105 ${
        isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''
      } ${!canAfford ? 'opacity-60' : ''}`}
      style={{
        borderColor: rarityColor,
        backgroundColor: `${display.color}20`,
        boxShadow: `0 0 15px ${rarityColor}40`,
      }}
    >
      <div className="p-3">
        <div className="text-4xl text-center mb-1">
          {display.icon}
        </div>
        <div className="text-sm font-bold text-center text-white truncate">
          {display.name}
        </div>
        <div className="text-xs text-center mt-1" style={{ color: rarityColor }}>
          {RARITY_NAMES[display.rarity as keyof typeof RARITY_NAMES] || display.rarity}
        </div>
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
        <Star className="w-3 h-3" />
        {shopItem.price}
      </div>
    </div>
  );
};

const ItemDetail = ({
  shopItem,
  onBuy,
  canAfford,
}: {
  shopItem: ShopItem;
  onBuy: () => void;
  canAfford: boolean;
}) => {
  const renderRuneDetail = (rune: Rune) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded">
          {rune.type === 'element' ? '元素符文' : '效果符文'}
        </span>
        {rune.element && (
          <span className="px-2 py-0.5 bg-orange-900/50 text-orange-300 text-xs rounded">
            {rune.element === 'fire' ? '火焰' : rune.element === 'ice' ? '冰霜' : '雷电'}
          </span>
        )}
        {rune.effect && (
          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded">
            {rune.effect === 'spread' ? '扩散' : rune.effect === 'time' ? '时间' : rune.effect === 'power' ? '强化' : '穿透'}
          </span>
        )}
      </div>
      <p className="text-gray-300 text-sm">{rune.description}</p>
    </div>
  );

  const renderEquipmentDetail = (equip: Equipment) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {equip.stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900/50 rounded-lg px-3 py-2 flex items-center justify-between"
          >
            <span className="text-gray-400 text-sm">{getStatName(stat.type)}</span>
            <span className="text-green-400 font-mono text-sm font-bold">
              {getStatDisplayValue(stat.type, stat.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">等级</span>
        <span className="text-yellow-400 font-mono">Lv.{equip.level}/{equip.maxLevel}</span>
      </div>
      <p className="text-gray-300 text-sm">{equip.description}</p>
    </div>
  );

  const renderPotionDetail = (potion: Potion) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-green-900/50 text-green-300 text-xs rounded">
          消耗品
        </span>
        {potion.duration && (
          <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-300 text-xs rounded">
            持续 {potion.duration / 1000}秒
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">冷却时间</span>
        <span className="text-blue-400 font-mono">{potion.cooldown / 1000}秒</span>
      </div>
      <p className="text-gray-300 text-sm">{potion.description}</p>
    </div>
  );

  const getItemIcon = () => {
    if (shopItem.type === 'rune') return '✨';
    if (shopItem.type === 'equipment') return (shopItem.item as Equipment).icon;
    return (shopItem.item as Potion).icon;
  };

  const getItemName = () => {
    if (shopItem.type === 'rune') return (shopItem.item as Rune).name;
    if (shopItem.type === 'equipment') return (shopItem.item as Equipment).name;
    return (shopItem.item as Potion).name;
  };

  const getItemColor = () => {
    if (shopItem.type === 'rune') return (shopItem.item as Rune).color;
    if (shopItem.type === 'equipment') return (shopItem.item as Equipment).color;
    return (shopItem.item as Potion).color;
  };

  const getRarityColor = () => {
    const rarity = shopItem.type === 'rune' 
      ? (shopItem.item as Rune).rarity 
      : shopItem.type === 'equipment' 
        ? (shopItem.item as Equipment).rarity 
        : (shopItem.item as Potion).rarity;
    return shopItem.type === 'rune'
      ? RARITY_RUNE_COLORS[rarity] || '#9ca3af'
      : RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#9ca3af';
  };

  const getRarityName = () => {
    const rarity = shopItem.type === 'rune' 
      ? (shopItem.item as Rune).rarity 
      : shopItem.type === 'equipment' 
        ? (shopItem.item as Equipment).rarity 
        : (shopItem.item as Potion).rarity;
    return RARITY_NAMES[rarity as keyof typeof RARITY_NAMES] || rarity;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-4">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center text-5xl flex-shrink-0"
          style={{
            backgroundColor: `${getItemColor()}30`,
            borderColor: getRarityColor(),
            borderWidth: '3px',
            boxShadow: `0 0 20px ${getRarityColor()}40`,
          }}
        >
          {getItemIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1">{getItemName()}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${getRarityColor()}30`,
                color: getRarityColor(),
              }}
            >
              {getRarityName()}
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
              {shopItem.type === 'rune' ? '符文' : shopItem.type === 'equipment' ? '装备' : '药水'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          物品详情
        </h4>
        {shopItem.type === 'rune' && renderRuneDetail(shopItem.item as Rune)}
        {shopItem.type === 'equipment' && renderEquipmentDetail(shopItem.item as Equipment)}
        {shopItem.type === 'potion' && renderPotionDetail(shopItem.item as Potion)}
      </div>

      <button
        onClick={onBuy}
        disabled={!canAfford || shopItem.sold}
        className={`w-full py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
          canAfford && !shopItem.sold
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:scale-105'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        {shopItem.sold ? '已售出' : `购买 (${shopItem.price} 天赋点)`}
      </button>
    </div>
  );
};

const ShopPanel = () => {
  const {
    showShopPanel,
    setShowShopPanel,
    currentShop,
    saveData,
    addToast,
  } = useGameStore();
  const engine = getGameEngine();
  
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !showShopPanel) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      animFrameRef.current = Math.floor(frame / 30) % 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(108, 92, 231, 0.1)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height - 20, 60, 0, Math.PI * 2);
      ctx.fill();
      
      drawShopkeeper(ctx, canvas.width / 2, canvas.height - 30, 1, animFrameRef.current, 3);
      
      if (showShopPanel) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [showShopPanel]);

  useEffect(() => {
    if (showShopPanel && currentShop) {
      setDialogueIndex(0);
      setSelectedItem(null);
    }
  }, [showShopPanel, currentShop]);

  const handleBuy = (shopItem: ShopItem) => {
    if (!currentShop) return;
    
    if (saveData.talentPoints < shopItem.price) {
      addToast({
        type: 'info',
        title: '天赋点不足',
        description: `购买需要 ${shopItem.price} 天赋点`,
      });
      return;
    }

    const success = engine.buyShopItem(shopItem.id);
    if (success) {
      addToast({
        type: 'success',
        title: '购买成功！',
        description: `获得了 ${shopItem.type === 'rune' ? (shopItem.item as Rune).name : shopItem.type === 'equipment' ? (shopItem.item as Equipment).name : (shopItem.item as Potion).name}`,
        color: '#ffd700',
      });
      setSelectedItem(null);
    }
  };

  const nextDialogue = () => {
    if (!currentShop) return;
    if (dialogueIndex < currentShop.shopkeeperDialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    }
  };

  if (!showShopPanel || !currentShop) {
    return null;
  }

  const availableItems = currentShop.items.filter(item => !item.sold);
  const filteredItems = activeCategory === 'all'
    ? currentShop.items
    : currentShop.items.filter(item => item.type === activeCategory);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-4 border-purple-600 rounded-xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            神秘商店
          </h2>
          <button
            onClick={() => setShowShopPanel(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl border-2 border-purple-700/50 p-4 mb-4">
              <div className="flex justify-center mb-4">
                <canvas
                  ref={canvasRef}
                  width={120}
                  height={160}
                  className="image-rendering-pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <h3 className="text-lg font-bold text-center text-yellow-300 mb-2">
                {currentShop.shopkeeperName}
              </h3>
              <div 
                className="bg-gray-900/70 rounded-lg p-3 border border-purple-700/30 cursor-pointer hover:bg-gray-900 transition-colors"
                onClick={nextDialogue}
              >
                <p className="text-gray-200 text-sm text-center">
                  "{currentShop.shopkeeperDialogue[dialogueIndex]}"
                </p>
                {dialogueIndex < currentShop.shopkeeperDialogue.length - 1 && (
                  <p className="text-gray-500 text-xs text-center mt-2">
                    点击继续...
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl border-2 border-yellow-700/50 p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-bold">我的天赋点</span>
              </div>
              <div className="text-3xl font-bold text-center text-yellow-400 font-mono">
                {saveData.talentPoints}
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
              <p className="text-gray-300 text-sm">
                <span className="text-purple-300 font-bold">提示：</span>
                点击商品查看详情，使用天赋点购买符文、装备和药水。商品售出后不可退回！
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedItem && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  商品详情
                </h3>
                <ItemDetail
                  shopItem={selectedItem}
                  onBuy={() => handleBuy(selectedItem)}
                  canAfford={saveData.talentPoints >= selectedItem.price}
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                <Gem className="w-5 h-5" />
                商品列表 ({availableItems.length}/{currentShop.items.length})
              </h3>

              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all', label: '全部', icon: <Sparkles className="w-4 h-4" /> },
                  { key: 'rune', label: '符文', icon: <Zap className="w-4 h-4" /> },
                  { key: 'equipment', label: '装备', icon: <Sword className="w-4 h-4" /> },
                  { key: 'potion', label: '药水', icon: <FlaskConical className="w-4 h-4" /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeCategory === tab.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredItems.map(item => (
                    <ShopItemCard
                      key={item.id}
                      shopItem={item}
                      onClick={() => !item.sold && setSelectedItem(item)}
                      isSelected={selectedItem?.id === item.id}
                      canAfford={saveData.talentPoints >= item.price}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>商店暂无商品</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPanel;
