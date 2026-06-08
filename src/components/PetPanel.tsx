import { useGameStore } from '../store/gameStore';
import { Heart, Swords, Zap, Shield, Star, Lock, Flame, Snowflake, Sparkles, Clock, Target } from 'lucide-react';
import { PET_TEMPLATES, PET_SKILLS } from '../data/pets';
import { selectPet, unlockPet, setPetSkill } from '../game/utils/storage';
import { useState } from 'react';
import type { PetType } from '../types/game';
interface PetPanelProps {
 onClose: () => void;
}
const PetPanel = ({ onClose }: PetPanelProps) => {
 const { saveData, refreshSaveData } = useGameStore();
 const [expandedPet, setExpandedPet] = useState<string | null>(null);
 const handleSelectPet = (petType: string) => {
 if (saveData.unlockedPets.includes(petType)) {
 selectPet(petType);
 refreshSaveData();
 }
 };
 const handleUnlockPet = (petType: string) => {
 const cost = 5;
 if (saveData.talentPoints >= cost && !saveData.unlockedPets.includes(petType)) {
 unlockPet(petType);
 refreshSaveData();
 }
 };
 const handleSelectSkill = (petType: string, skillId: string) => {
 if (saveData.unlockedPets.includes(petType)) {
 setPetSkill(petType, skillId);
 refreshSaveData();
 }
 };
 const getPetEmoji = (type: string) => {
 switch (type) {
 case 'fire_dragonling': return '🐉';
 case 'ice_sprite': return '❄️';
 case 'thunder_bird': return '⚡';
 case 'shadow_cat': return '🐱';
 default: return '✨';
 }
 };
 const getSkillTypeLabel = (type: string) => {
 switch (type) {
 case 'aoe': return { label: '范围', color: 'text-orange-400' };
 case 'chain': return { label: '连锁', color: 'text-yellow-400' };
 case 'dash': return { label: '突袭', color: 'text-purple-400' };
 case 'single': return { label: '单体', color: 'text-red-400' };
 case 'shield': return { label: '护盾', color: 'text-blue-400' };
 case 'heal': return { label: '治疗', color: 'text-green-400' };
 case 'buff': return { label: '增益', color: 'text-pink-400' };
 default: return { label: '技能', color: 'text-gray-400' };
 }
 };
 const getSelectedSkillId = (petType: string): string => {
 return saveData.petSkills?.[petType] || PET_TEMPLATES[petType as PetType]?.defaultSkillId || '';
 };
 const pets = Object.entries(PET_TEMPLATES);
 return (<div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
 <div className="bg-gray-900/90 border-4 border-pink-500 rounded-xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-3xl font-bold text-pink-300 flex items-center gap-2">
 <Sparkles className="w-8 h-8"/>
 宠物伙伴
 </h2>
 <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">
 ✕
 </button>
 </div>

 <p className="text-gray-400 text-sm mb-6">
 选择一只宠物伙伴与你一同冒险！每只宠物都有 3 个独特技能，每次只能携带一个技能。
 <br />
 <span className="text-yellow-400">
 当前天赋点: {saveData.talentPoints}
 </span>
 </p>

 <div className="space-y-4">
 {pets.map(([type, template]) => {
 const unlocked = saveData.unlockedPets.includes(type);
 const selected = saveData.selectedPet === type;
 const unlockCost = 5;
 const skills = PET_SKILLS[type as keyof typeof PET_SKILLS] || [];
 const selectedSkillId = getSelectedSkillId(type);
 const isExpanded = expandedPet === type;
 return (<div key={type} className={`rounded-xl border-2 transition-all overflow-hidden ${selected
 ? 'bg-pink-900/30 border-pink-400 shadow-lg shadow-pink-500/20'
 : unlocked
 ? 'bg-gray-800/50 border-gray-600'
 : 'bg-gray-900/50 border-gray-800 opacity-80'}`}>
 <div className="p-5 cursor-pointer" onClick={() => unlocked && setExpandedPet(isExpanded ? null : type)}>
 <div className="flex items-start gap-4">
 <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 ${unlocked ? '' : 'grayscale opacity-50'}`} style={{ backgroundColor: unlocked ? template.color + '30' : '#374151' }}>
 {unlocked ? getPetEmoji(type) : <Lock className="w-6 h-6 text-gray-500"/>}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <h3 className={`font-bold text-lg ${unlocked ? 'text-white' : 'text-gray-500'}`}>
 {unlocked ? template.name : '???'}
 </h3>
 {selected && (<span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
 使用中
 </span>)}
 {unlocked && (<span className="text-xs text-gray-400 ml-auto">
 {isExpanded ? '收起 ▲' : '展开技能 ▼'}
 </span>)}
 </div>

 <p className={`text-xs mb-3 ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
 {unlocked
 ? `已解锁 ${skills.length} 个技能 · 当前: ${skills.find(s => s.id === selectedSkillId)?.name || '无'}`
 : '未解锁的神秘宠物'}
 </p>

 {unlocked && (<div className="grid grid-cols-2 gap-2 text-xs">
 <div className="flex items-center gap-1 text-red-400">
 <Heart className="w-3 h-3"/>
 <span>生命: {template.hp}</span>
 </div>
 <div className="flex items-center gap-1 text-orange-400">
 <Swords className="w-3 h-3"/>
 <span>攻击: {template.damage}</span>
 </div>
 <div className="flex items-center gap-1 text-cyan-400">
 <Zap className="w-3 h-3"/>
 <span>速度: {template.speed}</span>
 </div>
 <div className="flex items-center gap-1 text-blue-400">
 <Target className="w-3 h-3"/>
 <span>射程: {template.attackRange}</span>
 </div>
 </div>)}
 </div>
 </div>

 {unlocked ? (<div className="mt-4 flex gap-2">
 {selected ? (<button disabled className="flex-1 py-2 bg-pink-600 text-white text-sm font-bold rounded-lg cursor-default">
 已携带
 </button>) : (<button onClick={(e) => { e.stopPropagation(); handleSelectPet(type); }} className="flex-1 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg transition-all">
 携带此宠物
 </button>)}
 </div>) : (<button onClick={(e) => { e.stopPropagation(); handleUnlockPet(type); }} disabled={saveData.talentPoints < unlockCost} className={`w-full mt-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${saveData.talentPoints >= unlockCost
 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
 : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
 <Star className="w-4 h-4"/>
 解锁 ({unlockCost} 天赋点)
 </button>)}
 </div>

 {unlocked && isExpanded && (<div className="px-5 pb-5 border-t border-gray-700/50 pt-4">
 <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
 <Sparkles className="w-4 h-4"/>
 选择技能 <span className="text-gray-400 font-normal text-xs">(每次只能配置一个)</span>
 </h4>
 <div className="space-y-2">
 {skills.map((skill) => {
 const skillSelected = skill.id === selectedSkillId;
 const skillTypeInfo = getSkillTypeLabel(skill.type);
 return (<div key={skill.id} onClick={(e) => { e.stopPropagation(); handleSelectSkill(type, skill.id); }} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${skillSelected
 ? 'bg-yellow-900/30 border-yellow-500'
 : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}>
 <div className="flex items-center gap-3">
 <div className="text-2xl">{skill.icon}</div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className={`font-bold text-sm ${skillSelected ? 'text-yellow-300' : 'text-white'}`}>
 {skill.name}
 </span>
 <span className={`text-xs px-1.5 py-0.5 rounded bg-gray-800 ${skillTypeInfo.color}`}>
 {skillTypeInfo.label}
 </span>
 {skillSelected && (<span className="text-xs bg-yellow-500 text-yellow-900 px-1.5 py-0.5 rounded font-bold">
 已装备
 </span>)}
 </div>
 <p className="text-xs text-gray-400 mb-2">
 {skill.description}
 </p>
 <div className="flex gap-4 text-xs">
 {skill.damage > 0 && (<span className="text-red-400 flex items-center gap-1">
 <Swords className="w-3 h-3"/>
 伤害: {skill.damage}
 </span>)}
 <span className="text-blue-400 flex items-center gap-1">
 <Clock className="w-3 h-3"/>
 冷却: {skill.cooldown / 1000}s
 </span>
 <span className="text-purple-400 flex items-center gap-1">
 <Target className="w-3 h-3"/>
 范围: {skill.range}
 </span>
 </div>
 </div>
 </div>
 </div>);
 })}
 </div>
 </div>)}
 </div>);
 })}
 </div>
 </div>
 </div>);
};
export default PetPanel;
