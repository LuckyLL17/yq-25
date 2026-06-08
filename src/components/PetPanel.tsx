import { useGameStore } from '../store/gameStore';
import { Heart, Swords, Zap, Shield, Star, Lock, Flame, Snowflake, Sparkles } from 'lucide-react';
import { PET_TEMPLATES } from '../data/pets';
import { selectPet, unlockPet } from '../game/utils/storage';
import type { PetType } from '../types/game';

interface PetPanelProps {
  onClose: () => void;
}

const PetPanel = ({ onClose }: PetPanelProps) => {
  const { saveData, refreshSaveData } = useGameStore();

  const handleSelectPet = (petType: string) => {
    if (saveData.unlockedPets.includes(petType)) {
      selectPet(petType);
      refreshSaveData();
    }
  };

  const handleUnlockPet = (petType: string) => {
    const cost = 5;
    if (saveData.talentPoints >= cost && !saveData.unlockedPets.includes(petType)) {
      unlockPet(petType);
      refreshSaveData();
    }
  };

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'fire_dragonling': return <Flame className="w-8 h-8" />;
      case 'ice_sprite': return <Snowflake className="w-8 h-8" />;
      case 'thunder_bird': return <Zap className="w-8 h-8" />;
      case 'shadow_cat': return <Sparkles className="w-8 h-8" />;
      default: return <Star className="w-8 h-8" />;
    }
  };

  const getPetEmoji = (type: string) => {
    switch (type) {
      case 'fire_dragonling': return '🐉';
      case 'ice_sprite': return '❄️';
      case 'thunder_bird': return '⚡';
      case 'shadow_cat': return '🐱';
      default: return '✨';
    }
  };

  const pets = Object.entries(PET_TEMPLATES);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 border-4 border-pink-500 rounded-xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-pink-300 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            宠物伙伴
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          选择一只宠物伙伴与你一同冒险！宠物会自动跟随你并攻击敌人。
          <br />
          <span className="text-yellow-400">
            当前天赋点: {saveData.talentPoints}
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map(([type, template]) => {
            const unlocked = saveData.unlockedPets.includes(type);
            const selected = saveData.selectedPet === type;
            const unlockCost = 5;

            return (
              <div
                key={type}
                className={`rounded-xl p-5 border-2 transition-all ${
                  selected
                    ? 'bg-pink-900/30 border-pink-400 shadow-lg shadow-pink-500/20'
                    : unlocked
                    ? 'bg-gray-800/50 border-gray-600 hover:border-pink-400'
                    : 'bg-gray-900/50 border-gray-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 ${
                      unlocked ? '' : 'grayscale opacity-50'
                    }`}
                    style={{ backgroundColor: unlocked ? template.color + '30' : '#374151' }}
                  >
                    {unlocked ? getPetEmoji(type) : <Lock className="w-6 h-6 text-gray-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {unlocked ? template.name : '???'}
                      </h3>
                      {selected && (
                        <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                          使用中
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mb-3 ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {unlocked ? template.skill.description : '未解锁的神秘宠物'}
                    </p>

                    {unlocked ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="flex items-center gap-1 text-red-400">
                            <Heart className="w-3 h-3" />
                            <span>生命: {template.hp}</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Swords className="w-3 h-3" />
                            <span>攻击: {template.damage}</span>
                          </div>
                          <div className="flex items-center gap-1 text-cyan-400">
                            <Zap className="w-3 h-3" />
                            <span>速度: {template.speed}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <Shield className="w-3 h-3" />
                            <span>射程: {template.attackRange}</span>
                          </div>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-2 mb-3">
                          <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold mb-1">
                            <Star className="w-3 h-3" />
                            <span>{template.skill.name}</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            伤害: {template.skill.damage} · 冷却: {template.skill.cooldown / 1000}s
                          </p>
                        </div>

                        {selected ? (
                          <button
                            disabled
                            className="w-full py-2 bg-pink-600 text-white text-sm font-bold rounded-lg cursor-default"
                          >
                            已携带
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectPet(type)}
                            className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg transition-all"
                          >
                            携带此宠物
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleUnlockPet(type)}
                        disabled={saveData.talentPoints < unlockCost}
                        className={`w-full py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          saveData.talentPoints >= unlockCost
                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        解锁 ({unlockCost} 天赋点)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PetPanel;
