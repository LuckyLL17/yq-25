import { useRef, useEffect } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import GameHUD from './GameHUD';
import RunePanel from './RunePanel';
import DeathScreen from './DeathScreen';
import ShopPanel from './ShopPanel';
import MiniMap from './MiniMap';
import { GAME_CONFIG } from '../data/config';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, updateFromEngine, setShowShopPanel, setCurrentShop, toggleMiniMap, toggleMiniMapZoom } = useGameStore();
  const engine = getGameEngine();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    engine.setCanvas(canvas);
    engine.start();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyDown(e.key);
      
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      
      if (e.key.toLowerCase() === 'm') {
        toggleMiniMap();
      }
      if (e.key.toLowerCase() === 'n') {
        toggleMiniMapZoom();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.key);
    };
    
    engine.onShopOpen = (shop) => {
      setCurrentShop(shop);
      setShowShopPanel(true);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.stop();
    };
  }, [engine, setShowShopPanel, setCurrentShop, toggleMiniMap, toggleMiniMapZoom]);
  
  useEffect(() => {
    if (scene === 'playing' || scene === 'gameover' || scene === 'victory') {
      const state = engine.getState();
      updateFromEngine(state);
    }
  }, [scene, engine, updateFromEngine]);
  
  if (scene === 'menu') return null;
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded-lg shadow-2xl"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated',
        }}
      />
      
      <GameHUD />
      <RunePanel />
      <DeathScreen />
      <ShopPanel />
      {scene === 'playing' && <MiniMap />}
      
      {scene === 'playing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gray-900/80 px-4 py-2 rounded-lg border-2 border-gray-700">
            <p className="text-gray-400 text-xs text-center">
              空格键互动 · 数字键释放技能 · M 键小地图 · N 键放大
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
