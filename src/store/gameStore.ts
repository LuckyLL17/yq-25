import { create } from 'zustand';
import type { GameScene, Rune, Skill, Player, Monster, Chest, SaveData, DailyChallenge } from '../types/game';
import { loadSaveData, unlockTalent as saveUnlockTalent } from '../game/utils/storage';
import { getTalentCost, canUnlockTalent } from '../data/talents';

interface ToastMessage {
  id: string;
  type: 'rune' | 'info' | 'success';
  title: string;
  description?: string;
  color?: string;
}

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
  showTalentTree: boolean;
  showChallengeInfo: boolean;
  toasts: ToastMessage[];
  draggedRune: Rune | null;
  earnedTalentPoints: number;
  isChallengeMode: boolean;
  challenge: DailyChallenge | null;
  challengeTimeRemaining: number;
  challengeTimeSpent: number;
  challengeCompleted: boolean;
  challengeFailed: boolean;
  
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
  setShowTalentTree: (show: boolean) => void;
  setShowChallengeInfo: (show: boolean) => void;
  setDraggedRune: (rune: Rune | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshSaveData: () => void;
  unlockTalent: (talentId: string) => void;
  updateFromEngine: (state: any) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
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
  showTalentTree: false,
  showChallengeInfo: false,
  toasts: [],
  draggedRune: null,
  earnedTalentPoints: 0,
  isChallengeMode: false,
  challenge: null,
  challengeTimeRemaining: 0,
  challengeTimeSpent: 0,
  challengeCompleted: false,
  challengeFailed: false,
  
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
  setShowTalentTree: (showTalentTree) => set({ showTalentTree }),
  setShowChallengeInfo: (showChallengeInfo) => set({ showChallengeInfo }),
  setDraggedRune: (draggedRune) => set({ draggedRune }),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
  
  refreshSaveData: () => {
    set({ saveData: loadSaveData() });
  },
  
  unlockTalent: (talentId) => {
    const state = get();
    const { unlockedTalents, talentPoints } = state.saveData;
    
    if (!canUnlockTalent(talentId, unlockedTalents)) return;
    
    const cost = getTalentCost(talentId, unlockedTalents);
    if (talentPoints < cost) return;
    
    const newSaveData = saveUnlockTalent(talentId, cost);
    set({ saveData: newSaveData });
    
    get().addToast({
      type: 'success',
      title: '天赋升级！',
      description: `消耗 ${cost} 天赋点`,
      color: '#ffd700',
    });
  },
  
  updateFromEngine: (state) => {
    set({
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
      earnedTalentPoints: state.earnedTalentPoints || 0,
      isChallengeMode: state.isChallengeMode || false,
      challenge: state.challenge || null,
      challengeTimeRemaining: state.challengeTimeRemaining || 0,
      challengeTimeSpent: state.challengeTimeSpent || 0,
      challengeCompleted: state.challengeCompleted || false,
      challengeFailed: state.challengeFailed || false,
    });
    
    if (state.scene === 'gameover' || state.scene === 'victory') {
      set({ saveData: loadSaveData() });
    }
  },
}));
