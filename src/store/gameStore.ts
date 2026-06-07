import { create } from 'zustand';
import type { GameScene, Rune, Skill, Player, Monster, Chest, SaveData } from '../types/game';
import { loadSaveData } from '../game/utils/storage';

interface GameStore {
  scene: GameScene;
  player: Player | null;
  monsters: Monster[];
  chests: Chest[];
  runeInventory: Rune[];
  equippedRunes: (Rune | null)[];
  activeSkills: Skill[];
  currentLevel: number;
  killCount: number;
  gold: number;
  saveData: SaveData;
  combineSlot1: Rune | null;
  combineSlot2: Rune | null;
  showRunePanel: boolean;
  
  setScene: (scene: GameScene) => void;
  setPlayer: (player: Player) => void;
  setMonsters: (monsters: Monster[]) => void;
  setChests: (chests: Chest[]) => void;
  setRuneInventory: (runes: Rune[]) => void;
  setEquippedRunes: (runes: (Rune | null)[]) => void;
  setActiveSkills: (skills: Skill[]) => void;
  setCurrentLevel: (level: number) => void;
  setKillCount: (count: number) => void;
  setGold: (gold: number) => void;
  setCombineSlot1: (rune: Rune | null) => void;
  setCombineSlot2: (rune: Rune | null) => void;
  setShowRunePanel: (show: boolean) => void;
  updateFromEngine: (state: any) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  scene: 'menu',
  player: null,
  monsters: [],
  chests: [],
  runeInventory: [],
  equippedRunes: [null, null, null, null],
  activeSkills: [],
  currentLevel: 1,
  killCount: 0,
  gold: 0,
  saveData: loadSaveData(),
  combineSlot1: null,
  combineSlot2: null,
  showRunePanel: false,
  
  setScene: (scene) => set({ scene }),
  setPlayer: (player) => set({ player }),
  setMonsters: (monsters) => set({ monsters }),
  setChests: (chests) => set({ chests }),
  setRuneInventory: (runeInventory) => set({ runeInventory }),
  setEquippedRunes: (equippedRunes) => set({ equippedRunes }),
  setActiveSkills: (activeSkills) => set({ activeSkills }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),
  setKillCount: (killCount) => set({ killCount }),
  setGold: (gold) => set({ gold }),
  setCombineSlot1: (combineSlot1) => set({ combineSlot1 }),
  setCombineSlot2: (combineSlot2) => set({ combineSlot2 }),
  setShowRunePanel: (showRunePanel) => set({ showRunePanel }),
  
  updateFromEngine: (state) => set({
    scene: state.scene,
    player: state.player,
    runeInventory: state.runeInventory,
    equippedRunes: state.equippedRunes,
    activeSkills: state.activeSkills,
    currentLevel: state.currentLevel,
    killCount: state.killCount,
    gold: state.gold,
    monsters: state.monsters,
    chests: state.chests,
    combineSlot1: state.combineSlot1,
    combineSlot2: state.combineSlot2,
  }),
}));
