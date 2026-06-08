import { useGameStore } from '../store/gameStore';
import { getTodaysChallenge, getGoalDescription, formatTime, getChallengeRunes } from '../data/challenges';
import { X, Clock, Target, Gift, Star, Swords, Package, Flame, Snowflake, Zap, Layers, ZapOff, Lock } from 'lucide-react';
import { getGameEngine } from '../game/GameEngine';
import type { Rune } from '../types/game';
import { getChallengeRecord, getStreakDays } from '../game/utils/storage';

const ChallengePanel = () => {
  const { showChallengeInfo, setShowChallengeInfo, saveData, setScene } = useGameStore();
  const engine = getGameEngine();
  const challenge = getTodaysChallenge();
  const challengeRunes = getChallengeRunes(challenge);
  const record = getChallengeRecord(challenge.date);
  const streak = getStreakDays();
  
  if (!showChallengeInfo) return null;
  
  const handleStartChallenge = () => {
    setShowChallengeInfo(false);
    engine.startChallenge(challenge);
  };
  
  const getRuneIcon = (rune: Rune) => {
    if (rune.type === 'element') {
      switch (rune.element) {
        case 'fire': return <Flame className="w-5 h-5 text-white" />;
        case 'ice': return <Snowflake className="w-5 h-5 text-white" />;
        case 'thunder': return <Zap className="w-5 h-5 text-white" />;
        default: return <Star className="w-5 h-5 text-white" />;
      }
    } else {
      switch (rune.effect) {
        case 'spread': return <Layers className="w-5 h-5 text-white" />;
        case 'time': return <Clock className="w-5 h-5 text-white" />;
        case 'power': return <ZapOff className="w-5 h-5 text-white" />;
        case 'pierce': return <Target className="w-5 h-5 text-white" />;
        default: return <Star className="w-5 h-5 text-white" />;
      }
    }
  };
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Star className="w-7 h-7" />
            每日挑战
          </h2>
          <button
            onClick={() => setShowChallengeInfo(false)}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-yellow-300 text-sm mb-1">{challenge.date}</div>
            <div className="text-white font-bold text-lg mb-2">第 {challenge.level} 层地牢</div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="text-cyan-300">{formatTime(challenge.timeLimit)}</span>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <span className="text-red-300">{getGoalDescription(challenge.goalType)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            挑战奖励
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">天赋点 x{challenge.talentPointsReward}</span>
              <span className="text-xs text-gray-500">(时间越短奖励越多)</span>
            </div>
            {challenge.badgeReward && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">特殊徽章</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
            <Swords className="w-5 h-5" />
            目标详情
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">敌人数量</span>
              <span className="text-red-400 font-bold">{challenge.monsterCount} 只</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">宝箱数量</span>
              <span className="text-yellow-400 font-bold">{challenge.chestCount} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">地牢层数</span>
              <span className="text-purple-400 font-bold">第 {challenge.level} 层</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-orange-300 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            规定符文
          </h3>
          <div className="flex flex-wrap gap-2">
            {challengeRunes.map((rune) => (
              <div
                key={rune.id}
                className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border-2"
                style={{ borderColor: rune.color }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: rune.color }}
                >
                  {getRuneIcon(rune)}
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{rune.name}</div>
                  <div className="text-gray-400 text-xs">
                    {rune.type === 'element' ? '元素符文' : '效果符文'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            挑战中只能使用这些符文组合技能
          </p>
        </div>
        
        {record && (
          <div className="mb-6 bg-gray-800/30 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-400 mb-2">今日记录</h3>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500">状态：</span>
                <span className={record.completed ? 'text-green-400' : 'text-red-400'}>
                  {record.completed ? '已完成 ✓' : '未完成'}
                </span>
              </div>
              {record.bestTime && (
                <div>
                  <span className="text-gray-500">最佳：</span>
                  <span className="text-cyan-400">{formatTime(record.bestTime)}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {streak > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500 rounded-lg p-3 text-center">
            <div className="text-purple-300 text-sm">连续完成</div>
            <div className="text-2xl font-bold text-yellow-400">{streak} 天</div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleStartChallenge}
            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-lg rounded-xl border-4 border-yellow-400 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Swords className="w-6 h-6" />
            {record?.completed ? '再次挑战' : '开始挑战'}
          </button>
          
          <button
            onClick={() => setShowChallengeInfo(false)}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg border-2 border-gray-500 transition-all"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengePanel;
