import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getGameEngine } from '../game/GameEngine';
import { getAudioManager } from '../game/AudioManager';
import { loadSettings, saveSettings, DEFAULT_KEY_BINDINGS, resetKeyBindings } from '../game/utils/storage';
import type { GameAction, GameSettings } from '../types/game';
import { Settings, Keyboard, Volume2, VolumeX, Monitor, Pause, RotateCcw, Play, X, Music } from 'lucide-react';

type SettingsTab = 'general' | 'keybinds' | 'audio' | 'video';

const KEY_DISPLAY_MAP: Record<string, string> = {
  ' ': '空格',
  'Escape': 'ESC',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Enter': '回车',
  'Shift': 'Shift',
  'Control': 'Ctrl',
  'Alt': 'Alt',
  'Tab': 'Tab',
  'Backspace': '退格',
};

const displayKey = (key: string): string => {
  return KEY_DISPLAY_MAP[key] || key.toUpperCase();
};

const SettingsMenu = () => {
  const { showSettings, setShowSettings } = useGameStore();
  const engine = getGameEngine();
  const audio = getAudioManager();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [listeningAction, setListeningAction] = useState<GameAction | null>(null);
  const [localScale, setLocalScale] = useState(settings.screenScale);

  useEffect(() => {
    setSettings(loadSettings());
    setLocalScale(loadSettings().screenScale);
  }, [showSettings]);

  const handleKeyCapture = useCallback((e: KeyboardEvent) => {
    if (!listeningAction) return;
    e.preventDefault();
    e.stopPropagation();

    let key = e.key;
    if (key === 'Escape') {
      setListeningAction(null);
      return;
    }

    const newSettings = { ...settings };
    newSettings.keyBindings = { ...newSettings.keyBindings, [listeningAction]: key };
    setSettings(newSettings);
    saveSettings(newSettings);
    audio.playSFX('menu_click');
    setListeningAction(null);
  }, [listeningAction, settings, audio]);

  useEffect(() => {
    if (listeningAction) {
      window.addEventListener('keydown', handleKeyCapture, true);
      return () => window.removeEventListener('keydown', handleKeyCapture, true);
    }
  }, [listeningAction, handleKeyCapture]);

  if (!showSettings) return null;

  const handleResetGame = () => {
    engine.resetGame();
    setShowSettings(false);
    audio.playSFX('menu_click');
  };

  const handleResume = () => {
    engine.setPaused(false);
    setShowSettings(false);
    audio.playSFX('menu_click');
  };

  const handleTogglePause = () => {
    engine.togglePause();
    audio.playSFX('menu_click');
  };

  const handleResetKeyBindings = () => {
    const newSettings = resetKeyBindings();
    setSettings(newSettings);
    audio.playSFX('menu_click');
  };

  const handleScaleChange = (scale: number) => {
    setLocalScale(scale);
    const newSettings = { ...settings, screenScale: scale };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleBGMToggle = () => {
    const newSettings = { ...settings, bgmEnabled: !settings.bgmEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);
    audio.applyVolumes();
    if (newSettings.bgmEnabled) {
      audio.startBGM();
    } else {
      audio.stopBGM();
    }
    audio.playSFX('menu_click');
  };

  const handleSFXToggle = () => {
    const newSettings = { ...settings, sfxEnabled: !settings.sfxEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);
    audio.applyVolumes();
    if (newSettings.sfxEnabled) {
      audio.playSFX('menu_click');
    }
  };

  const handleBGMVolume = (volume: number) => {
    const newSettings = { ...settings, bgmVolume: volume };
    setSettings(newSettings);
    saveSettings(newSettings);
    audio.applyVolumes();
  };

  const handleSFXVolume = (volume: number) => {
    const newSettings = { ...settings, sfxVolume: volume };
    setSettings(newSettings);
    saveSettings(newSettings);
    audio.applyVolumes();
  };

  const isPaused = engine.getPaused();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: '通用', icon: <Settings className="w-4 h-4" /> },
    { id: 'keybinds', label: '按键', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'audio', label: '音频', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'video', label: '画面', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-4 border-yellow-600 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            设置
          </h2>
          <button
            onClick={handleResume}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b-2 border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); audio.playSFX('menu_click'); }}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Pause className="w-5 h-5 text-yellow-400" />
                  游戏控制
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleTogglePause}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg border-2 border-blue-400 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? '继续游戏' : '暂停游戏'}
                  </button>
                  <button
                    onClick={handleResetGame}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg border-2 border-red-400 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    重置游戏
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-sm text-gray-400 mb-2">游戏状态</h3>
                <div className="flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <span className="text-white">{isPaused ? '已暂停' : '运行中'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keybinds' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-sm">点击按键可重新绑定</p>
                <button
                  onClick={handleResetKeyBindings}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors px-3 py-1 bg-gray-800 rounded border border-yellow-600"
                >
                  恢复默认
                </button>
              </div>
              {(Object.entries(DEFAULT_KEY_BINDINGS) as [GameAction, { key: string; label: string }][]).map(([action, { label }]) => {
                const currentKey = settings.keyBindings[action];
                const isListening = listeningAction === action;

                return (
                  <div
                    key={action}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border-2 border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{label}</span>
                    <button
                      onClick={() => {
                        setListeningAction(action);
                        audio.playSFX('menu_click');
                      }}
                      className={`min-w-[80px] py-1.5 px-4 rounded border-2 text-sm font-mono font-bold transition-all ${
                        isListening
                          ? 'bg-yellow-600 border-yellow-400 text-white animate-pulse'
                          : 'bg-gray-700 border-gray-600 text-gray-200 hover:border-yellow-500 hover:text-yellow-300'
                      }`}
                    >
                      {isListening ? '按下...' : displayKey(currentKey)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-cyan-400" />
                    背景音乐
                  </h3>
                  <button
                    onClick={handleBGMToggle}
                    className={`py-1.5 px-4 rounded border-2 text-sm font-bold transition-all ${
                      settings.bgmEnabled
                        ? 'bg-green-600 border-green-400 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-400'
                    }`}
                  >
                    {settings.bgmEnabled ? '开启' : '关闭'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.bgmVolume}
                      onChange={(e) => handleBGMVolume(parseFloat(e.target.value))}
                      disabled={!settings.bgmEnabled}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
                    />
                    <span className="text-gray-300 text-sm w-10 text-right">
                      {Math.round(settings.bgmVolume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-orange-400" />
                    游戏音效
                  </h3>
                  <button
                    onClick={handleSFXToggle}
                    className={`py-1.5 px-4 rounded border-2 text-sm font-bold transition-all ${
                      settings.sfxEnabled
                        ? 'bg-green-600 border-green-400 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-400'
                    }`}
                  >
                    {settings.sfxEnabled ? '开启' : '关闭'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {settings.sfxEnabled ? (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-500" />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.sfxVolume}
                      onChange={(e) => handleSFXVolume(parseFloat(e.target.value))}
                      disabled={!settings.sfxEnabled}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-400 disabled:opacity-30"
                    />
                    <span className="text-gray-300 text-sm w-10 text-right">
                      {Math.round(settings.sfxVolume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => audio.playSFX('menu_click')}
                disabled={!settings.sfxEnabled}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white text-sm rounded-lg border-2 border-gray-600 transition-all"
              >
                测试音效
              </button>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  画面缩放
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-8">50%</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={localScale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                    <span className="text-gray-400 text-sm w-8">200%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-yellow-400 text-2xl font-bold font-mono">
                      {Math.round(localScale * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[0.75, 1, 1.25, 1.5, 2].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => handleScaleChange(scale)}
                        className={`py-1 px-3 rounded border-2 text-xs font-bold transition-all ${
                          localScale === scale
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {Math.round(scale * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">
                  画面缩放会调整游戏画布的大小。较低的缩放可以显示更多内容，较高的缩放可以让画面更清晰。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t-2 border-gray-700 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            按 ESC 关闭设置
          </div>
          <button
            onClick={handleResume}
            className="py-2 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg border-2 border-green-400 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            返回游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
