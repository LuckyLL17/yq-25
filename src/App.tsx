import { useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import ToastContainer from './components/ToastContainer';
import TalentTree from './components/TalentTree';
import ChallengePanel from './components/ChallengePanel';
import ChallengeVictoryScreen from './components/ChallengeVictoryScreen';
import BadgePanel from './components/BadgePanel';
import EquipmentPanel from './components/EquipmentPanel';
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
    
    engine.onChestOpened = ({ runes, equipment }) => {
      let delay = 0;
      runes.forEach((rune, index) => {
        setTimeout(() => {
          addToast({
            type: 'rune',
            title: `获得 ${rune.name}`,
            description: rune.description,
            color: rune.color,
          });
        }, delay);
        delay += 500;
      });
      if (equipment) {
        equipment.forEach((equip, index) => {
          setTimeout(() => {
            addToast({
              type: 'success',
              title: `获得 ${equip.name}`,
              description: equip.description,
              color: equip.color,
            });
          }, delay);
          delay += 600;
        });
      }
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
      <TalentTree />
      <ChallengePanel />
      <ChallengeVictoryScreen />
      <BadgePanel />
      <EquipmentPanel />
      {scene === 'menu' ? <MainMenu /> : <GameCanvas />}
    </div>
  );
}
