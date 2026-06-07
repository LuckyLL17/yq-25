import { useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import ToastContainer from './components/ToastContainer';
import { useGameStore } from './store/gameStore';
import { getGameEngine } from './game/GameEngine';

export default function App() {
  const { scene, updateFromEngine, addToast, refreshSaveData } = useGameStore();
  const engine = getGameEngine();
  
  useEffect(() => {
    engine.onStateChange = () => {
      const state = engine.getState();
      updateFromEngine(state);
    };
    
    engine.onChestOpened = ({ runes }) => {
      runes.forEach((rune, index) => {
        setTimeout(() => {
          addToast({
            type: 'rune',
            title: `获得 ${rune.name}`,
            description: rune.description,
            color: rune.color,
          });
        }, index * 500);
      });
      refreshSaveData();
    };
    
    const state = engine.getState();
    updateFromEngine(state);
  }, [engine, updateFromEngine, addToast, refreshSaveData]);

  useEffect(() => {
    if (scene === 'menu') {
      refreshSaveData();
    }
  }, [scene, refreshSaveData]);
  
  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ToastContainer />
      {scene === 'menu' ? <MainMenu /> : <GameCanvas />}
    </div>
  );
}
