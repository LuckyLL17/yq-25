import { useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import { useGameStore } from './store/gameStore';
import { getGameEngine } from './game/GameEngine';

export default function App() {
  const { scene, updateFromEngine } = useGameStore();
  const engine = getGameEngine();
  
  useEffect(() => {
    engine.onStateChange = () => {
      const state = engine.getState();
      updateFromEngine(state);
    };
    
    const state = engine.getState();
    updateFromEngine(state);
  }, [engine, updateFromEngine]);
  
  return (
    <div className="min-h-screen bg-gray-900">
      {scene === 'menu' ? <MainMenu /> : <GameCanvas />}
    </div>
  );
}
