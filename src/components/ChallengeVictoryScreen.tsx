import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Trophy, Clock, RefreshCw, Home, Star, Sparkles, Swords, Package, Award, Crown } from 'lucide-react';
import { formatTime } from '../data/challenges';
import { getStreakDays } from '../game/utils/storage';
import { BADGES } from '../data/badges';
import { useMemo } from 'react';

const ChallengeVictoryScreen = () => {
  const { scene, killCount, chests, earnedTalentPoints, challengeTimeSpent, challenge, challengeDamageTaken, saveData, challengeIsFirstCompletion, challengeIsNewBestTime, challengePreviousBestTime } = useGameStore();
  const engine = getGameEngine();
  
  const openedChests = chests.filter(c => c.opened).length;
  const streak = getStreakDays();
  const noDamage = challengeDamageTaken === 0;
  const fastComplete = challengeTimeSpent <= 60;
  
  const earnedBadges = useMemo(() => {
    if (!challengeIsFirstCompletion) return [];
    return BADGES.filter(badge => {
      if (badge.id === 'badge_first_challenge') return true;
      if (badge.id === 'badge_speed_runner' && fastComplete) return true;
      if (badge.id === 'badge_perfect' && noDamage) return true;
      if (badge.id === 'badge_collector' && challenge?.goalType !== 'kill_all') return true;
      if (badge.id === 'badge_slayer' && challenge?.goalType !== 'open_all_chests') return true;
      if (badge.id === 'badge_week_streak' && streak >= 7) return true;
      return false;
    }).filter(b => {
      const wasUnlocked = saveData.badges.includes(b.id);
      return !wasUnlocked;
    });
  }, [challengeIsFirstCompletion, fastComplete, noDamage, challenge?.goalType, streak, saveData.badges]);
  
  if (scene !== 'victory') return null;
  
  const handleRestart = () => {
    if (challenge) {
      engine.startChallenge(challenge);
    }
  };
  
  const handleMainMenu = () => {
    engine.goToMenu();
  };
  
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-xl p-8 text-center max-w-md w-full mx-4 shadow-2xl">
        <div className="mb-6">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">挑战成功！</h1>
          <p className="text-gray-400">
            {challengeIsFirstCompletion ? '恭喜你完成了今日挑战' : '再次完成今日挑战'}
          </p>
          {challengeIsNewBestTime && challengePreviousBestTime !== null && (
            <div className="mt-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-400 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <Crown className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-bold">新纪录！</span>
              <span className="text-cyan-200/70 text-sm">
                比之前快 {formatTime(challengePreviousBestTime - challengeTimeSpent)}
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
            <Star className="w-5 h-5" />
            挑战成绩
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{formatTime(challengeTimeSpent)}</div>
              <div className="text-xs text-gray-400">用时</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Swords className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{killCount}</div>
              <div className="text-xs text-gray-400">击杀数</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Package className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{openedChests}</div>
              <div className="text-xs text-gray-400">宝箱数</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{streak}天</div>
              <div className="text-xs text-gray-400">连续完成</div>
            </div>
          </div>
          
          {noDamage && (
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-lg p-2 mb-2">
              <span className="text-purple-300 text-sm font-bold">✨ 完美通关！未受到任何伤害</span>
            </div>
          )}
          
          {fastComplete && (
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500 rounded-lg p-2">
              <span className="text-cyan-300 text-sm font-bold">⚡ 极速通关！不到一分钟</span>
            </div>
          )}
        </div>
        
        {earnedBadges.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold">获得新徽章！</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {earnedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center bg-gray-800/50 rounded-lg p-2 border"
                  style={{ borderColor: badge.color }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: badge.color }}
                  >
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-white font-bold">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {earnedTalentPoints > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold text-lg">获得天赋点！</span>
            </div>
            <div className="text-3xl font-bold text-yellow-300">+{earnedTalentPoints}</div>
            <div className="text-xs text-yellow-200/70 mt-1">
              当前总天赋点: {saveData.talentPoints}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg border-2 border-green-400 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            再次挑战
          </button>
          
          <button
            onClick={handleMainMenu}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg border-2 border-gray-500 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeVictoryScreen;
