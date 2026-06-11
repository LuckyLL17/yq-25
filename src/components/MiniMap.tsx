import { useRef, useEffect } from 'react';
import { getGameEngine } from '../game/GameEngine';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../data/config';
import { Map, ZoomIn, ZoomOut, X } from 'lucide-react';

const MiniMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { showMiniMap, miniMapZoomed, toggleMiniMap, toggleMiniMapZoom } = useGameStore();
  const engine = getGameEngine();

  const miniMapSize = miniMapZoomed ? 300 : 150;

  useEffect(() => {
    if (!showMiniMap || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentSize = miniMapZoomed ? 300 : 150;

    const renderMiniMap = () => {
      const state = engine.state;
      if (!state.dungeon) {
        animationRef.current = requestAnimationFrame(renderMiniMap);
        return;
      }

      const dungeon = state.dungeon;
      const tileSize = currentSize / Math.max(dungeon.width, dungeon.height);
      const mapWidth = dungeon.width * tileSize;
      const mapHeight = dungeon.height * tileSize;

      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, currentSize, currentSize);

      const offsetX = (currentSize - mapWidth) / 2;
      const offsetY = (currentSize - mapHeight) / 2;

      for (let y = 0; y < dungeon.height; y++) {
        for (let x = 0; x < dungeon.width; x++) {
          const tile = dungeon.tiles[y][x];
          if (!tile.explored) continue;

          const drawX = offsetX + x * tileSize;
          const drawY = offsetY + y * tileSize;

          if (tile.type === 'wall') {
            ctx.fillStyle = '#4a4a6a';
          } else if (tile.type === 'stairs') {
            ctx.fillStyle = '#ffd700';
          } else {
            ctx.fillStyle = '#2d2d44';
          }

          ctx.fillRect(drawX, drawY, tileSize, tileSize);

          if (!tile.visible && tile.explored) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(drawX, drawY, tileSize, tileSize);
          }
        }
      }

      for (const chest of state.chests) {
        if (chest.opened) continue;

        const tileX = Math.floor(chest.position.x / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(chest.position.y / GAME_CONFIG.TILE_SIZE);

        if (
          tileX >= 0 && tileX < dungeon.width &&
          tileY >= 0 && tileY < dungeon.height &&
          dungeon.tiles[tileY][tileX].explored
        ) {
          const drawX = offsetX + tileX * tileSize + tileSize / 2;
          const drawY = offsetY + tileY * tileSize + tileSize / 2;
          const size = Math.max(2, tileSize * 0.6);

          ctx.fillStyle = chest.type === 'epic' ? '#a855f7' :
                          chest.type === 'rare' ? '#3b82f6' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(drawX, drawY, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const monster of state.monsters) {
        if (monster.hp <= 0) continue;

        const tileX = Math.floor(monster.position.x / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(monster.position.y / GAME_CONFIG.TILE_SIZE);

        if (
          tileX >= 0 && tileX < dungeon.width &&
          tileY >= 0 && tileY < dungeon.height &&
          dungeon.tiles[tileY][tileX].visible
        ) {
          const drawX = offsetX + tileX * tileSize + tileSize / 2;
          const drawY = offsetY + tileY * tileSize + tileSize / 2;
          const size = monster.isBoss ? Math.max(3, tileSize * 0.7) : Math.max(2, tileSize * 0.5);

          ctx.fillStyle = monster.isBoss ? '#ffd700' : '#ef4444';
          ctx.beginPath();
          ctx.arc(drawX, drawY, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const shop = dungeon.shop;
      if (shop) {
        const shopTileX = Math.floor(shop.position.x / GAME_CONFIG.TILE_SIZE);
        const shopTileY = Math.floor(shop.position.y / GAME_CONFIG.TILE_SIZE);

        if (
          shopTileX >= 0 && shopTileX < dungeon.width &&
          shopTileY >= 0 && shopTileY < dungeon.height &&
          dungeon.tiles[shopTileY][shopTileX].explored
        ) {
          const drawX = offsetX + shopTileX * tileSize + tileSize / 2;
          const drawY = offsetY + shopTileY * tileSize + tileSize / 2;
          const size = Math.max(3, tileSize * 0.7);

          ctx.fillStyle = '#22c55e';
          ctx.fillRect(drawX - size / 2, drawY - size / 2, size, size);
        }
      }

      const stairs = dungeon.stairsPosition;
      if (dungeon.tiles[stairs.y][stairs.x].explored) {
        const drawX = offsetX + stairs.x * tileSize + tileSize / 2;
        const drawY = offsetY + stairs.y * tileSize + tileSize / 2;
        const size = Math.max(3, tileSize * 0.7);

        ctx.fillStyle = '#ffd700';
        ctx.fillRect(drawX - size / 2, drawY - size / 2, size, size);

        ctx.fillStyle = '#0f0f1a';
        ctx.font = `bold ${Math.max(8, tileSize * 0.5)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↓', drawX, drawY);
      }

      const playerTileX = Math.floor(state.player.position.x / GAME_CONFIG.TILE_SIZE);
      const playerTileY = Math.floor(state.player.position.y / GAME_CONFIG.TILE_SIZE);
      const playerDrawX = offsetX + playerTileX * tileSize + tileSize / 2;
      const playerDrawY = offsetY + playerTileY * tileSize + tileSize / 2;
      const playerSize = Math.max(4, tileSize * 0.8);

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(playerDrawX, playerDrawY, playerSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, tileSize * 0.15);
      ctx.stroke();

      if (miniMapZoomed) {
        const viewportWidth = GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.TILE_SIZE * tileSize;
        const viewportHeight = GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.TILE_SIZE * tileSize;
        const viewportX = playerDrawX - viewportWidth / 2;
        const viewportY = playerDrawY - viewportHeight / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
      }

      animationRef.current = requestAnimationFrame(renderMiniMap);
    };

    renderMiniMap();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [showMiniMap, miniMapZoomed, engine]);

  if (!showMiniMap) {
    return (
      <button
        onClick={toggleMiniMap}
        className="absolute top-4 right-4 z-20 bg-gray-900/90 border-2 border-purple-500 p-2 rounded-lg hover:bg-gray-800 transition-colors"
        title="显示小地图 (M)"
      >
        <Map className="w-5 h-5 text-purple-400" />
      </button>
    );
  }

  return (
    <div
      className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
        miniMapZoomed ? 'w-[320px]' : 'w-[170px]'
      }`}
    >
      <div className="bg-gray-900/95 border-4 border-purple-600 rounded-lg p-2 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-purple-400" />
            <span className="text-white text-xs font-bold">小地图</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMiniMapZoom}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title={miniMapZoomed ? '缩小' : '放大'}
            >
              {miniMapZoomed ? (
                <ZoomOut className="w-4 h-4 text-gray-400" />
              ) : (
                <ZoomIn className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={toggleMiniMap}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="关闭小地图 (M)"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={miniMapSize}
            height={miniMapSize}
            className="border-2 border-gray-700 rounded"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2 justify-center text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
            <span className="text-gray-400">玩家</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">怪物</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">宝箱</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
            <span className="text-gray-400">楼梯</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-gray-400">商店</span>
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-gray-500">
          按 M 键切换 · N 键放大缩小
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
