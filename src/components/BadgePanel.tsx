import { useGameStore } from '../store/gameStore';
import { X, Award, Star, Zap, Shield, Calendar, Crown, Package, Swords, Lock } from 'lucide-react';
import { BADGES } from '../data/badges';
import { getStreakDays, getChallengeRecord } from '../game/utils/storage';
import { getTodaysChallenge } from '../data/challenges';

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'star': return <Star className="w-6 h-6 text-white" />;
    case 'zap': return <Zap className="w-6 h-6 text-white" />;
    case 'shield': return <Shield className="w-6 h-6 text-white" />;
    case 'calendar': return <Calendar className="w-6 h-6 text-white" />;
    case 'crown': return <Crown className="w-6 h-6 text-white" />;
    case 'chest': return <Package className="w-6 h-6 text-white" />;
    case 'sword': return <Swords className="w-6 h-6 text-white" />;
    default: return <Award className="w-6 h-6 text-white" />;
  }
};

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    case 'legendary': return 'border-yellow-400';
    default: return 'border-gray-400';
  }
};

const getRarityBg = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'from-gray-600 to-gray-700';
    case 'rare': return 'from-blue-600 to-blue-800';
    case 'epic': return 'from-purple-600 to-purple-800';
    case 'legendary': return 'from-yellow-500 to-orange-600';
    default: return 'from-gray-600 to-gray-700';
  }
};

const getRarityText = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '普通';
    case 'rare': return '稀有';
    case 'epic': return '史诗';
    case 'legendary': return '传说';
    default: return '普通';
  }
};

const BadgePanel = () => {
  const { showBadgePanel, setShowBadgePanel, saveData } = useGameStore();
  
  if (!showBadgePanel) return null;
  
  const todaysChallenge = getTodaysChallenge();
  const todaysRecord = getChallengeRecord(todaysChallenge.date);
  const streak = getStreakDays();
  
  const unlockedCount = BADGES.filter(b => saveData.badges.includes(b.id)).length;
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Award className="w-7 h-7" />
            徽章收藏
            <span className="text-sm text-gray-400 font-normal">
              ({unlockedCount}/{BADGES.length})
            </span>
          </h2>
          <button
            onClick={() => setShowBadgePanel(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-800/50 border border-yellow-600/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{unlockedCount}</div>
            <div className="text-xs text-gray-400">已获得徽章</div>
          </div>
          <div className="bg-gray-800/50 border border-purple-600/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{saveData.totalChallengesCompleted || 0}</div>
            <div className="text-xs text-gray-400">累计挑战</div>
          </div>
          <div className="bg-gray-800/50 border border-cyan-600/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{streak}</div>
            <div className="text-xs text-gray-400">连续天数</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const unlocked = saveData.badges.includes(badge.id);
            
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-4 text-center border-4 transition-all ${
                  unlocked
                    ? `${getRarityColor(badge.rarity)} bg-gray-800/50`
                    : 'border-gray-700 bg-gray-900/50 opacity-60'
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center border-4 ${
                    unlocked 
                      ? `bg-gradient-to-br ${getRarityBg(badge.rarity)} ${getRarityColor(badge.rarity)}`
                      : 'bg-gray-700 border-gray-600'
                  }`}
                  style={unlocked ? { boxShadow: `0 0 20px ${badge.color}60` } : {}}
                >
                  {unlocked ? getBadgeIcon(badge.icon) : <Lock className="w-6 h-6 text-gray-500" />}
                </div>
                
                <h3 className={`font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {unlocked ? badge.name : '???'}
                </h3>
                
                <div className={`text-xs mb-2 ${
                  unlocked ? getRarityColor(badge.rarity).replace('border-', 'text-') : 'text-gray-600'
                }`}>
                  {getRarityText(badge.rarity)}
                </div>
                
                <p className={`text-xs ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                  {unlocked ? badge.description : badge.requirement}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            完成每日挑战获得特殊徽章，收集所有徽章成为地牢大师！
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgePanel;
