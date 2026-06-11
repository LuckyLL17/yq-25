import { useRef, useEffect, useMemo } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import GameHUD from './GameHUD';
import RunePanel from './RunePanel';
import DeathScreen from './DeathScreen';
import ShopPanel from './ShopPanel';
import MiniMap from './MiniMap';
import SettingsMenu from './SettingsMenu';
import { GAME_CONFIG } from '../data/config';
import { loadSettings, DEFAULT_KEY_BINDINGS } from '../game/utils/storage';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, updateFromEngine, setShowShopPanel, setCurrentShop, toggleMiniMap, toggleMiniMapZoom, showSettings, setShowSettings, setIsPaused, settings } = useGameStore();
  const engine = getGameEngine();
  
  const scale = settings.screenScale;
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    engine.setCanvas(canvas);
    engine.start();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) {
        if (e.key === 'Escape') {
          setShowSettings(false);
          engine.setPaused(false);
        }
        return;
      }
      
      const currentSettings = loadSettings();
      const keyBindings = currentSettings.keyBindings;
      
      if (e.key === 'Escape' || e.key === keyBindings.pause) {
        e.preventDefault();
        const paused = engine.togglePause();
        setIsPaused(paused);
        if (paused) {
          setShowSettings(true);
        }
        return;
      }
      
      engine.handleKeyDown(e.key);
      
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      
      if (e.key.toLowerCase() === (keyBindings.minimap || DEFAULT_KEY_BINDINGS.minimap.key).toLowerCase()) {
        toggleMiniMap();
      }
      if (e.key.toLowerCase() === (keyBindings.minimap_zoom || DEFAULT_KEY_BINDINGS.minimap_zoom.key).toLowerCase()) {
        toggleMiniMapZoom();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (showSettings) return;
      engine.handleKeyUp(e.key);
    };
    
    engine.onShopOpen = (shop) => {
      setCurrentShop(shop);
      setShowShopPanel(true);
    };
    
    engine.onPauseChange = (paused) => {
      setIsPaused(paused);
      if (paused && !showSettings) {
        setShowSettings(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.stop();
    };
  }, [engine, setShowShopPanel, setCurrentShop, toggleMiniMap, toggleMiniMapZoom, showSettings, setShowSettings, setIsPaused]);
  
  useEffect(() => {
    if (scene === 'playing' || scene === 'gameover' || scene === 'victory') {
      const state = engine.getState();
      updateFromEngine(state);
    }
  }, [scene, engine, updateFromEngine]);
  
  if (scene === 'menu') return null;
  
  const canvasStyle = useMemo(() => ({
    maxWidth: '100%',
    maxHeight: '100%',
    imageRendering: 'pixelated' as const,
    transform: `scale(${scale})`,
    transformOrigin: 'center center' as const,
  }), [scale]);
  
  const interactKey = settings.keyBindings.interact || DEFAULT_KEY_BINDINGS.interact.key;
  const skillKeys = [1, 2, 3, 4].map(i => settings.keyBindings[`skill_${i}` as keyof typeof settings.keyBindings] || String(i));
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded-lg shadow-2xl"
        style={canvasStyle}
      />
      
      <GameHUD />
      <RunePanel />
      <DeathScreen />
      <ShopPanel />
      {scene === 'playing' && <MiniMap />}
      <SettingsMenu />
      
      {scene === 'playing' && !showSettings && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gray-900/80 px-4 py-2 rounded-lg border-2 border-gray-700">
            <p className="text-gray-400 text-xs text-center">
              {interactKey === ' ' ? '空格键' : interactKey.toUpperCase()}互动 · {skillKeys.map(k => k.toUpperCase()).join('/')} 释放技能 · ESC 暂停设置
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
