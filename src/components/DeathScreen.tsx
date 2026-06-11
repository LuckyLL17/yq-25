import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { Skull, RefreshCw, Trophy, Swords, Map, Sparkles, TreeDeciduous } from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../data/difficulty';

const DeathScreen = () => {
  const { currentLevel, killCount, scene, earnedTalentPoints, setShowTalentTree, saveData, difficulty } = useGameStore();
  const engine = getGameEngine();
  
  if (scene !== 'gameover') return null;
  
  const handleRestart = () => {
    engine.startGame();
  };
  
  const handleMainMenu = () => {
    const state = engine.getState();
    state.scene = 'menu';
  };
  
  const handleOpenTalents = () => {
    setShowTalentTree(true);
  };
  
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-4 border-red-600 rounded-xl p-8 text-center max-w-md w-full mx-4 shadow-2xl">
        <div className="mb-6">
          <Skull className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-red-500 mb-2">游戏结束</h1>
          <p className="text-gray-400">小狐狸倒下了...</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            本局成绩
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Map className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{currentLevel}</div>
              <div className="text-xs text-gray-400">到达层数</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <Swords className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{killCount}</div>
              <div className="text-xs text-gray-400">击杀数量</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{DIFFICULTY_CONFIGS[difficulty].icon}</span>
                <span className="font-bold" style={{ color: DIFFICULTY_CONFIGS[difficulty].color }}>
                  {DIFFICULTY_CONFIGS[difficulty].name}难度
                </span>
              </div>
            </div>
          </div>
        </div>
        
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
            onClick={handleOpenTalents}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg border-2 border-purple-400 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <TreeDeciduous className="w-5 h-5" />
            升级天赋树
          </button>
          
          <button
            onClick={handleRestart}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg border-2 border-green-400 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            再来一次
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg border-2 border-gray-500 transition-all hover:scale-105"
          >
            返回主菜单
          </button>
        </div>
        
        <p className="text-gray-500 text-xs mt-6">
          <Sparkles className="w-4 h-4 inline mr-1" />
          每次冒险都是全新的体验
        </p>
      </div>
    </div>
  );
};

export default DeathScreen;
