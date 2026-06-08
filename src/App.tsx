import { useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import ToastContainer from './components/ToastContainer';
import TalentTree from './components/TalentTree';
import ChallengePanel from './components/ChallengePanel';
import ChallengeVictoryScreen from './components/ChallengeVictoryScreen';
import BadgePanel from './components/BadgePanel';
import EquipmentPanel from './components/EquipmentPanel';
import PotionPanel from './components/PotionPanel';
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
    
    engine.onChestOpened = ({ runes, equipment, potions, materials }) => {
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
      potions.forEach((potion, index) => {
        setTimeout(() => {
          addToast({
            type: 'success',
            title: `获得药水 ${potion.name}`,
            description: potion.description,
            color: potion.color,
          });
        }, delay);
        delay += 400;
      });
      const materialCounts: Record<string, { count: number; material: any }> = {};
      for (const mat of materials) {
        if (!materialCounts[mat.id]) {
          materialCounts[mat.id] = { count: 0, material: mat };
        }
        materialCounts[mat.id].count++;
      }
      Object.values(materialCounts).forEach(({ count, material }) => {
        setTimeout(() => {
          addToast({
            type: 'success',
            title: `获得材料 ${material.name} x${count}`,
            description: material.description,
            color: material.color,
          });
        }, delay);
        delay += 350;
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
      <TalentTree />
      <ChallengePanel />
      <ChallengeVictoryScreen />
      <BadgePanel />
      <EquipmentPanel />
      <PotionPanel />
      {scene === 'menu' ? <MainMenu /> : <GameCanvas />}
    </div>
  );
}
