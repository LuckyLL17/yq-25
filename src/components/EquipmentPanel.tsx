import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getGameEngine } from '../game/GameEngine';
import { 
  RARITY_COLORS, 
  RARITY_NAMES, 
  EQUIPMENT_SLOT_NAMES, 
  getStatName, 
  getStatDisplayValue,
  getUpgradeCost,
  getBuyPrice,
  getSellPrice,
} from '../data/equipment';
import type { Equipment, EquipmentSlotType } from '../types/game';
import { X, Sword, Shield, Gem, Sparkles, Star, TrendingUp, AlertTriangle, ShoppingBag, RefreshCw, Coins } from 'lucide-react';

const EquipmentCard = ({
  equipment,
  onClick,
  isSelected,
  isEquipped,
  small = false,
}: {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
  isEquipped?: boolean;
  small?: boolean;
}) => {
  const durabilityPercent = (equipment.durability / equipment.maxDurability) * 100;
  const isBroken = equipment.durability <= 0;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border-4 cursor-pointer transition-all hover:scale-105 ${
        isSelected
          ? 'ring-4 ring-yellow-400 scale-105'
          : ''
      } ${isBroken ? 'opacity-50 grayscale' : ''}`}
      style={{
        borderColor: RARITY_COLORS[equipment.rarity],
        backgroundColor: `${equipment.color}20`,
        boxShadow: `0 0 15px ${RARITY_COLORS[equipment.rarity]}40`,
      }}
    >
      <div className={`${small ? 'p-2' : 'p-3'}`}>
        <div className={`${small ? 'text-3xl' : 'text-4xl'} text-center mb-1`}>
          {equipment.icon}
        </div>
        <div className={`${small ? 'text-xs' : 'text-sm'} font-bold text-center text-white truncate`}>
          {equipment.name}
        </div>
        <div className="text-xs text-center mt-1" style={{ color: RARITY_COLORS[equipment.rarity] }}>
          {RARITY_NAMES[equipment.rarity]}
        </div>
        <div className="text-xs text-center text-yellow-400 font-mono mt-1">
          Lv.{equipment.level}
        </div>
        {!small && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>耐久</span>
              <span className="font-mono">{equipment.durability}/{equipment.maxDurability}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${durabilityPercent}%`,
                  backgroundColor: durabilityPercent > 50 ? '#7bed9f' : durabilityPercent > 25 ? '#ffeaa7' : '#ff7675',
                }}
              />
            </div>
          </div>
        )}
      </div>
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold border-2 border-green-300">
          装备中
        </div>
      )}
      {isBroken && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-red-400 text-xs font-bold">已损坏</span>
        </div>
      )}
    </div>
  );
};

const EquipmentSlot = ({
  slotType,
  equipment,
  onClick,
  onRemove,
}: {
  slotType: EquipmentSlotType;
  equipment: Equipment | null;
  onClick?: () => void;
  onRemove?: () => void;
}) => {
  const getSlotIcon = () => {
    switch (slotType) {
      case 'weapon': return <Sword className="w-8 h-8 text-gray-500" />;
      case 'armor': return <Shield className="w-8 h-8 text-gray-500" />;
      case 'accessory': return <Gem className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={onClick}
        className={`w-24 h-28 rounded-xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 relative ${
          equipment
            ? ''
            : 'border-gray-600 border-dashed bg-gray-800/50'
        }`}
        style={equipment ? {
          borderColor: RARITY_COLORS[equipment.rarity],
          backgroundColor: `${equipment.color}20`,
          boxShadow: `0 0 20px ${RARITY_COLORS[equipment.rarity]}40`,
        } : {}}
      >
        {equipment ? (
          <>
            <div className="text-4xl mb-1">{equipment.icon}</div>
            <div className="text-xs font-bold text-white text-center px-1 truncate w-full">
              {equipment.name}
            </div>
            <div className="text-xs text-yellow-400 font-mono">
              Lv.{equipment.level}
            </div>
            {equipment.durability <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                <span className="text-red-400 text-xs font-bold">已损坏</span>
              </div>
            )}
          </>
        ) : (
          <>
            {getSlotIcon()}
            <span className="text-xs text-gray-500 mt-1">空</span>
          </>
        )}
      </div>
      <span className="text-sm text-gray-400 font-bold">
        {EQUIPMENT_SLOT_NAMES[slotType]}
      </span>
      {equipment && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors border-2 border-red-300"
          title="卸下装备"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
};

const EquipmentDetail = ({
  equipment,
  onEquip,
  onUnequip,
  onUpgrade,
  onBuy,
  onSell,
  mode = 'inventory',
  isEquipped,
  canUpgrade,
  upgradeCost,
}: {
  equipment: Equipment;
  onEquip?: () => void;
  onUnequip?: () => void;
  onUpgrade?: () => void;
  onBuy?: () => void;
  onSell?: () => void;
  mode?: 'inventory' | 'shop';
  isEquipped: boolean;
  canUpgrade: boolean;
  upgradeCost: number;
}) => {
  const durabilityPercent = (equipment.durability / equipment.maxDurability) * 100;
  const isBroken = equipment.durability <= 0;
  const { saveData } = useGameStore();
  const canAffordUpgrade = saveData.talentPoints >= upgradeCost;
  const buyPrice = getBuyPrice(equipment);
  const sellPrice = getSellPrice(equipment);
  const canAffordBuy = saveData.talentPoints >= buyPrice;

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-4">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center text-5xl flex-shrink-0"
          style={{
            backgroundColor: `${equipment.color}30`,
            borderColor: RARITY_COLORS[equipment.rarity],
            borderWidth: '3px',
            boxShadow: `0 0 20px ${RARITY_COLORS[equipment.rarity]}40`,
          }}
        >
          {equipment.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1">{equipment.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${RARITY_COLORS[equipment.rarity]}30`,
                color: RARITY_COLORS[equipment.rarity],
              }}
            >
              {RARITY_NAMES[equipment.rarity]}
            </span>
            <span className="text-yellow-400 font-mono text-sm">
              Lv.{equipment.level}/{equipment.maxLevel}
            </span>
          </div>
          <p className="text-gray-400 text-sm">{equipment.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          属性加成
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {equipment.stats.map((stat, index) => (
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
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          耐久度
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${durabilityPercent}%`,
                backgroundColor: durabilityPercent > 50 ? '#7bed9f' : durabilityPercent > 25 ? '#ffeaa7' : '#ff7675',
              }}
            />
          </div>
          <span className="text-gray-300 font-mono text-sm">
            {equipment.durability}/{equipment.maxDurability}
          </span>
        </div>
        {isBroken && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>装备已损坏，无法提供属性加成</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {mode === 'shop' ? (
          <>
            <button
              onClick={onBuy}
              disabled={!canAffordBuy}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                canAffordBuy
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              购买 ({buyPrice}⭐)
            </button>
          </>
        ) : (
          <>
            {isEquipped ? (
              <button
                onClick={onUnequip}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                卸下装备
              </button>
            ) : (
              <button
                onClick={onEquip}
                disabled={isBroken}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  isBroken
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                }`}
              >
                {isBroken ? '已损坏' : '装备'}
              </button>
            )}
            <button
              onClick={onUpgrade}
              disabled={!canUpgrade || !canAffordUpgrade}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                canUpgrade && canAffordUpgrade
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              升级 ({upgradeCost}⭐)
            </button>
            <button
              onClick={onSell}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-orange-400 font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              title="出售装备"
            >
              <Coins className="w-4 h-4" />
              {sellPrice}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const EquipmentPanel = () => {
  const {
    showEquipmentPanel,
    setShowEquipmentPanel,
    equipmentInventory,
    equippedEquipment,
    equipItem,
    unequipItem,
    upgradeEquipmentItem,
    addToast,
    saveData,
    scene,
    shopEquipment,
    refreshShop,
    buyEquipment,
    sellEquipment,
  } = useGameStore();
  const engine = getGameEngine();

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');

  const isInGame = scene === 'playing';

  useEffect(() => {
    if (showEquipmentPanel && shopEquipment.length === 0) {
      refreshShop();
    }
  }, [showEquipmentPanel, shopEquipment.length, refreshShop]);

  const handleEquip = (equipment: Equipment) => {
    if (equipment.durability <= 0) {
      addToast({
        type: 'info',
        title: '装备已损坏',
        description: '无法装备已损坏的装备',
      });
      return;
    }
    equipItem(equipment);
    setSelectedEquipment(null);
  };

  const handleUnequip = (slotType: EquipmentSlotType) => {
    unequipItem(slotType);
    setSelectedEquipment(null);
  };

  const handleUpgrade = (equipment: Equipment) => {
    const cost = getUpgradeCost(equipment);
    if (saveData.talentPoints < cost) {
      addToast({
        type: 'info',
        title: '天赋点不足',
        description: `升级需要 ${cost} 天赋点`,
      });
      return;
    }
    if (equipment.level >= equipment.maxLevel) {
      addToast({
        type: 'info',
        title: '已达最高等级',
        description: '该装备已达到最高等级',
      });
      return;
    }
    const success = upgradeEquipmentItem(equipment.instanceId);
    if (success) {
      const updatedEquip = [...equipmentInventory, ...Object.values(equippedEquipment).filter(Boolean) as Equipment[]]
        .find(e => e.instanceId === equipment.instanceId);
      if (updatedEquip) {
        setSelectedEquipment(updatedEquip);
      }
    }
  };

  const handleBuy = (equipment: Equipment) => {
    const price = getBuyPrice(equipment);
    if (saveData.talentPoints < price) {
      addToast({
        type: 'info',
        title: '天赋点不足',
        description: `购买需要 ${price} 天赋点`,
      });
      return;
    }
    const success = buyEquipment(equipment.instanceId);
    if (success) {
      setSelectedEquipment(null);
    }
  };

  const handleSell = (equipment: Equipment) => {
    const price = getSellPrice(equipment);
    const success = sellEquipment(equipment.instanceId);
    if (success) {
      setSelectedEquipment(null);
      addToast({
        type: 'success',
        title: `出售成功`,
        description: `获得 ${price} 天赋点`,
      });
    }
  };

  const filteredInventory = equipmentInventory.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const filteredShop = shopEquipment.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const allEquipment = [
    ...equipmentInventory,
    ...Object.values(equippedEquipment).filter(Boolean) as Equipment[],
    ...shopEquipment,
  ];

  const getSelectedEquip = (): Equipment | null => {
    if (!selectedEquipment) return null;
    return allEquipment.find(e => e.instanceId === selectedEquipment.instanceId) || null;
  };

  const selectedEquip = getSelectedEquip();
  const isSelectedEquipped = selectedEquip 
    ? Object.values(equippedEquipment).some(e => e?.instanceId === selectedEquip.instanceId)
    : false;
  const isSelectedInShop = selectedEquip
    ? shopEquipment.some(e => e.instanceId === selectedEquip.instanceId)
    : false;
  const upgradeCost = selectedEquip ? getUpgradeCost(selectedEquip) : 0;
  const canUpgrade = selectedEquip ? selectedEquip.level < selectedEquip.maxLevel : false;

  if (!showEquipmentPanel) {
    if (isInGame) {
      return (
        <button
          onClick={() => setShowEquipmentPanel(true)}
          className="absolute bottom-4 left-4 z-20 bg-gray-900/90 border-4 border-orange-500 px-4 py-2 rounded-lg text-white font-bold hover:bg-orange-900/90 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sword className="w-5 h-5" />
          装备
        </button>
      );
    }
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-4 border-orange-500 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-300 flex items-center gap-2">
            <Sword className="w-7 h-7" />
            装备系统
          </h2>
          <button
            onClick={() => setShowEquipmentPanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">
            ✨ 装备槽位 (3/3)
          </h3>
          <div className="flex justify-center gap-6">
            {(['weapon', 'armor', 'accessory'] as EquipmentSlotType[]).map(slotType => (
              <div key={slotType} className="relative">
                <EquipmentSlot
                  slotType={slotType}
                  equipment={equippedEquipment[slotType]}
                  onClick={() => {
                    if (equippedEquipment[slotType]) {
                      setSelectedEquipment(equippedEquipment[slotType]);
                    }
                  }}
                  onRemove={() => handleUnequip(slotType)}
                />
              </div>
            ))}
          </div>
        </div>

        {selectedEquip && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5" />
              装备详情
            </h3>
            <EquipmentDetail
              equipment={selectedEquip}
              onEquip={() => handleEquip(selectedEquip)}
              onUnequip={() => handleUnequip(selectedEquip.type as EquipmentSlotType)}
              onUpgrade={() => handleUpgrade(selectedEquip)}
              onBuy={() => handleBuy(selectedEquip)}
              onSell={() => handleSell(selectedEquip)}
              mode={isSelectedInShop ? 'shop' : 'inventory'}
              isEquipped={isSelectedEquipped}
              canUpgrade={canUpgrade}
              upgradeCost={upgradeCost}
            />
          </div>
        )}

        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Gem className="w-4 h-4" />
              装备背包
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-2 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'shop'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              装备商店
            </button>
          </div>
        </div>

        {activeTab === 'shop' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                今日商品 ({shopEquipment.length})
              </h3>
              <button
                onClick={refreshShop}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="text-yellow-400 font-bold">当前天赋点:</span>
              <span className="text-yellow-300 font-mono">{saveData.talentPoints} ⭐</span>
            </div>

            {filteredShop.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredShop.map(equipment => (
                  <div key={equipment.instanceId} className="relative">
                    <EquipmentCard
                      equipment={equipment}
                      onClick={() => setSelectedEquipment(equipment)}
                      isSelected={selectedEquipment?.instanceId === equipment.instanceId}
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {getBuyPrice(equipment)} ⭐
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>商店暂无商品</p>
                <p className="text-sm mt-1">点击刷新按钮获取新商品</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <Gem className="w-5 h-5" />
                装备背包 ({equipmentInventory.length})
              </h3>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'weapon', label: '武器' },
                  { key: 'armor', label: '防具' },
                  { key: 'accessory', label: '饰品' },
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterType === filter.key
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredInventory.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredInventory.map(equipment => (
                  <EquipmentCard
                    key={equipment.instanceId}
                    equipment={equipment}
                    onClick={() => setSelectedEquipment(equipment)}
                    isSelected={selectedEquipment?.instanceId === equipment.instanceId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Gem className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无装备</p>
                <p className="text-sm mt-1">击败怪物或打开宝箱获取装备</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-3 bg-orange-900/30 rounded-lg border border-orange-700/50">
          <p className="text-gray-300 text-sm">
            <span className="text-yellow-400 font-bold">提示：</span>
            装备可以从宝箱和怪物掉落中获取，也可以在商店中用天赋点购买。每件装备都有耐久度，战斗中会消耗耐久，耐久为0时装备失效。
            使用<span className="text-yellow-400"> 天赋点 </span>可以升级装备，提升属性和耐久度上限。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel;
