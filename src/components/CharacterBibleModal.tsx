'use client';

import React, { useState, useEffect } from 'react';
import { CharacterBible, VisualMedium, StylePreset, Project } from '@/lib/types';
import {
  User,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Bot,
  ChevronDown,
  ChevronUp,
  Sword,
  Zap,
  Shield,
  Heart,
  Palette,
  Eye,
} from 'lucide-react';
import { CHARACTER_11_DIMENSIONS } from '@/lib/studio-categories';

interface CharacterBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterBible[];
  project?: Project;
  projectId?: string;
  visualMedium?: VisualMedium;
  stylePreset?: StylePreset;
  onSaveCharacters: (characters: CharacterBible[]) => void;
}

export default function CharacterBibleModal({
  isOpen,
  onClose,
  characters: initialCharacters,
  project,
  projectId,
  visualMedium = 'animation',
  stylePreset = 'donghua_3d',
  onSaveCharacters,
}: CharacterBibleModalProps) {
  const [characters, setCharacters] = useState<CharacterBible[]>(initialCharacters);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingAiCharacters, setGeneratingAiCharacters] = useState(false);
  const [generatingCharId, setGeneratingCharId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCharIds, setExpandedCharIds] = useState<Record<string, boolean>>({});
  const [activeTabPerChar, setActiveTabPerChar] = useState<Record<string, 'dimensions' | 'prompts'>>({});

  // Sync when initialCharacters changes
  useEffect(() => {
    if (initialCharacters && initialCharacters.length > 0) {
      setCharacters(initialCharacters);
    }
  }, [initialCharacters]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedCharIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id], // default open if undefined
    }));
  };

  const isExpanded = (id: string) => {
    return expandedCharIds[id] !== false; // default expanded
  };

  const setCharTab = (id: string, tab: 'dimensions' | 'prompts') => {
    setActiveTabPerChar((prev) => ({ ...prev, [id]: tab }));
  };

  const getCharTab = (id: string) => {
    return activeTabPerChar[id] || 'dimensions';
  };

  const handleAddCharacter = () => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    const newChar: CharacterBible = {
      id: `char-${Date.now()}`,
      name: `ตัวละคร ${characters.length + 1}`,
      role: 'supporting',
      age: '19-25 ปี',
      bodyBuild: 'รูปร่างสง่างาม ปราดเปรียว สมส่วน',
      facialFeatures: 'ใบหน้าคมคาย แววตามุ่งมั่น',
      hairStyle: 'ผมยาวสีดำขลับ รวบสูงประดับปิ่น',
      clothingStyle: 'ชุดคลุมผ้าไหมประณีต สวมเกราะอ่อน',
      colorTheme: 'คราม-เงิน (Navy Blue & Silver)',
      weaponsOrProps: 'กระบี่โบราณลวดลายมังกร',
      personality: 'สุขุม กล้าหาญ ยึดมั่นในความถูกต้อง',
      abilities: 'ทักษะวิทยายุทธ์ขั้นสูง พลังลมปราณสายฟ้า',
      weaknesses: 'ห่วงใยพวกพ้อง ยึดมั่นในสัญญา',
      relationships: 'สหายร่วมศึกผู้จงรักภักดี',
      appearanceAnchor: 'distinct facial features, sharp piercing eyes, signature attire, 8k resolution',
      voiceStyle: 'น้ำเสียงเป็นเอกลักษณ์ สุขุม หนักแน่น',
      googleFlowSeed: randomSeed,
      googleFlowPrompt: `character portrait, distinct facial features, 8k resolution, cinematic lighting --seed ${randomSeed}`,
    };
    setCharacters([...characters, newChar]);
  };

  const handleUpdate = (index: number, field: keyof CharacterBible, value: any) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };

    // Auto update flow prompt if appearanceAnchor or seed changes
    if (field === 'appearanceAnchor' || field === 'googleFlowSeed') {
      const seed = field === 'googleFlowSeed' ? value : updated[index].googleFlowSeed || '12345';
      const anchor = field === 'appearanceAnchor' ? value : updated[index].appearanceAnchor;
      updated[index].googleFlowPrompt = `${anchor}, character portrait, 8k resolution, cinematic lighting --seed ${seed}`;
    }
    setCharacters(updated);
  };

  const randomizeSeed = (index: number) => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    handleUpdate(index, 'googleFlowSeed', randomSeed);
  };

  const handleDelete = (index: number) => {
    if (characters.length <= 1) {
      alert('ต้องมีตัวละครอย่างน้อย 1 ตัวในโปรเจกต์');
      return;
    }
    const updated = characters.filter((_, i) => i !== index);
    setCharacters(updated);
  };

  // 1. AI Auto-Analyze Story & Generate Characters
  const handleAiAutoGenerateCharacters = async () => {
    const confirmMsg = characters.length > 0
      ? `ต้องการให้ AI วิเคราะห์พล็อตเรื่อง "${project?.title || 'ปัจจุบัน'}" และสร้างตัวละครชุดใหม่ที่ตรงกับเนื้อเรื่องทั้งหมดใช่หรือไม่? (ข้อมูลเดิมจะถูกแทนที่)`
      : `ให้ AI วิเคราะห์พล็อตเรื่องและสร้างตัวละครอัตโนมัติ?`;

    if (!confirm(confirmMsg)) return;

    setGeneratingAiCharacters(true);
    try {
      const res = await fetch('/api/ai/generate-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project?.title || '',
          synopsis: project?.synopsis || '',
          worldCulture: project?.worldCulture || 'chinese',
          genre: project?.genre || 'xianxia_cultivation',
          subGenre: project?.subGenre || '',
          visualMedium: project?.visualMedium || visualMedium,
          stylePreset: project?.stylePreset || stylePreset,
          characterCount: 3,
        }),
      });

      const data = await res.json();
      if (data.success && data.characters && data.characters.length > 0) {
        setCharacters(data.characters);
        alert(`✨ สร้างตัวละครตรงตามพล็อตเรื่องสำเร็จ ${data.characters.length} ตัว (${data.source || 'AI Narrative Engine'})`);
      } else {
        alert(data.error || 'สร้างตัวละครจาก AI ไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Error generating characters:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์สร้างตัวละคร');
    } finally {
      setGeneratingAiCharacters(false);
    }
  };

  // 2. Generate Image for a single character
  const handleGenerateSingleImage = async (index: number) => {
    const char = characters[index];
    setGeneratingCharId(char.id);

    try {
      const res = await fetch('/api/ai/generate-character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: char.id,
          projectId: projectId || project?.id,
          name: char.name,
          appearanceAnchor: char.appearanceAnchor,
          clothingStyle: char.clothingStyle,
          visualMedium: project?.visualMedium || visualMedium,
          stylePreset: project?.stylePreset || stylePreset,
          googleFlowSeed: char.googleFlowSeed,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        handleUpdate(index, 'imageUrl', data.imageUrl);
        if (data.fileId) {
          handleUpdate(index, 'referenceImageGridFsId', data.fileId);
        }
      } else {
        alert(data.error || 'สร้างภาพตัวละครไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์สร้างภาพ');
    } finally {
      setGeneratingCharId(null);
    }
  };

  // 3. Generate Images for all characters sequentially
  const handleGenerateAllImages = async () => {
    setGeneratingAll(true);
    try {
      const updatedChars = [...characters];
      for (let i = 0; i < updatedChars.length; i++) {
        const char = updatedChars[i];
        try {
          const res = await fetch('/api/ai/generate-character-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterId: char.id,
              projectId: projectId || project?.id,
              name: char.name,
              appearanceAnchor: char.appearanceAnchor,
              clothingStyle: char.clothingStyle,
              visualMedium: project?.visualMedium || visualMedium,
              stylePreset: project?.stylePreset || stylePreset,
              googleFlowSeed: char.googleFlowSeed,
            }),
          });

          const data = await res.json();
          if (data.success && data.imageUrl) {
            updatedChars[i] = {
              ...updatedChars[i],
              imageUrl: data.imageUrl,
              referenceImageGridFsId: data.fileId || updatedChars[i].referenceImageGridFsId,
            };
            setCharacters([...updatedChars]);
          }
        } catch (err) {
          console.error(`Failed to generate image for ${char.name}`, err);
        }
      }
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleCopyFlowPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    onSaveCharacters(characters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl my-6 relative max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">สมุดคุมตัวละคร (Character Bible 11 มิติ)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {characters.length} ตัวละคร
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                ควบคุมหน้าตาตัวละคร 11 มิติ ไม่ให้เพี้ยนข้ามฉากด้วย Face Lock &amp; Seed รองรับ flow.google.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-studio-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Banner: AI Story-Driven Character Generator + Batch Image Generator */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-studio-950 to-cyan-950/40 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">🤖 AI สร้างตัวละครตามเนื้อเรื่องอัตโนมัติ</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Story Premise Synced
              </span>
            </div>
            <p className="text-xs text-gray-300">
              วิเคราะห์พล็อตเรื่อง &quot;{project?.title || 'ของสตูดิโอ'}&quot; เพื่อสร้างตัวละครที่มีบทบาท ครบทั้ง 11 มิติ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Auto-generate characters button */}
            <button
              type="button"
              onClick={handleAiAutoGenerateCharacters}
              disabled={generatingAiCharacters}
              className="px-3.5 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-500/40 hover:border-amber-400 shadow-sm disabled:opacity-50"
              title="วิเคราะห์เรื่องและสร้างตัวละครอัตโนมัติ"
            >
              {generatingAiCharacters ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>กำลังวิเคราะห์พล็อต...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>🤖 AI เจนตัวละครจากพล็อตเรื่อง</span>
                </>
              )}
            </button>

            {/* flow.google.com link */}
            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/30"
              title="เปิด Google Flow (VideoFX / ImageFX)"
            >
              <span>flow.google.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Generate all images */}
            <button
              type="button"
              onClick={handleGenerateAllImages}
              disabled={generatingAll}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างครบทุกตัว...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ เจนภาพตัวละครทั้งหมด</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Character Cards List */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {characters.map((char, idx) => {
            const expanded = isExpanded(char.id);
            const activeTab = getCharTab(char.id);

            return (
              <div
                key={char.id}
                className="p-4 sm:p-5 rounded-2xl bg-studio-950 border border-studio-800 space-y-4 relative group hover:border-studio-700 transition-all"
              >
                {/* Top Card Bar: Name, Index, Role, Seed, Expand, Delete */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-studio-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-7 h-7 rounded-xl bg-studio-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                      placeholder="ชื่อตัวละคร"
                      className="px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-white font-bold text-sm w-44 focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={char.role}
                      onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-300 text-xs focus:outline-none"
                    >
                      <option value="protagonist">🌟 พระเอก / ตัวเอก (Protagonist)</option>
                      <option value="antagonist">⚡ ตัวร้าย / คู่ปรับ (Antagonist)</option>
                      <option value="supporting">🛡️ สหาย / ตัวละครสมทบ (Supporting)</option>
                      <option value="mentor">📜 อาจารย์ / ผู้ชี้แนะ (Mentor)</option>
                      <option value="beast_companion">🐉 สัตว์เทวะ / อาวุธประจำกาย (Companion)</option>
                    </select>

                    {/* Age pill */}
                    <input
                      type="text"
                      value={char.age || ''}
                      onChange={(e) => handleUpdate(idx, 'age', e.target.value)}
                      placeholder="อายุ / วัย"
                      className="w-24 px-2.5 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-amber-300 text-xs text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Seed Lock & Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-studio-900 border border-studio-700 rounded-xl text-xs text-cyan-300 font-mono">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Seed:</span>
                      <input
                        type="text"
                        value={char.googleFlowSeed || '12345'}
                        onChange={(e) => handleUpdate(idx, 'googleFlowSeed', e.target.value)}
                        className="w-16 bg-transparent text-cyan-300 focus:outline-none text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => randomizeSeed(idx)}
                        className="text-gray-400 hover:text-white p-0.5"
                        title="สุ่ม Seed ใหม่"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(char.id)}
                      className="p-1.5 rounded-lg bg-studio-900 text-gray-400 hover:text-white border border-studio-700 transition-colors"
                      title={expanded ? 'ย่อหน้าต่าง' : 'ขยายดูรายละเอียด'}
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-studio-900 transition-colors"
                      title="ลบตัวละคร"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {expanded && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-1">
                    {/* Portrait Preview & Single Generate Button */}
                    <div className="md:col-span-1 flex flex-col items-center">
                      <div className="w-36 h-48 rounded-2xl bg-studio-900 border border-studio-700 overflow-hidden relative shadow-inner flex items-center justify-center">
                        {char.imageUrl ? (
                          <img
                            src={char.imageUrl}
                            alt={char.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 text-gray-500 flex flex-col items-center gap-1.5">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                            <span className="text-[10px]">ยังไม่มีรูปตัวละคร</span>
                          </div>
                        )}

                        {generatingCharId === char.id && (
                          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                            <span className="text-[10px] text-amber-300">กำลังเจนภาพ...</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerateSingleImage(idx)}
                        disabled={generatingCharId === char.id || generatingAll}
                        className="mt-2.5 w-36 py-1.5 px-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-amber-400 text-xs font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{char.imageUrl ? 'เจนภาพใหม่' : 'สร้างภาพ AI'}</span>
                      </button>

                      {/* Color Theme Mini Pill */}
                      {char.colorTheme && (
                        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-amber-400" />
                          <span className="truncate max-w-[130px]">{char.colorTheme}</span>
                        </div>
                      )}
                    </div>

                    {/* Main Character Dimensions & Prompts Tabs */}
                    <div className="md:col-span-3 space-y-3">
                      {/* Tab selector */}
                      <div className="flex items-center gap-2 border-b border-studio-800 pb-2">
                        <button
                          type="button"
                          onClick={() => setCharTab(char.id, 'dimensions')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'dimensions'
                              ? 'bg-amber-500 text-black shadow-glow'
                              : 'text-gray-400 hover:text-white bg-studio-900 border border-studio-800'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>11 มิติข้อมูลตัวละคร</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCharTab(char.id, 'prompts')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'prompts'
                              ? 'bg-cyan-400 text-black shadow-cyanGlow'
                              : 'text-gray-400 hover:text-white bg-studio-900 border border-studio-800'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Visual Lock &amp; Prompt AI</span>
                        </button>
                      </div>

                      {/* TAB 1: 11 Dimensions Grid */}
                      {activeTab === 'dimensions' && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          {/* Group 1: Appearance (Body, Face, Hair, Clothes, Color) */}
                          <div className="p-3 rounded-xl bg-studio-900/80 border border-studio-800 space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                              <Eye className="w-3.5 h-3.5" />
                              <span>รูปลักษณ์ภายนอก (Dimensions 1-6)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">รูปร่าง/ส่วนสูง (Body Build):</label>
                                <input
                                  type="text"
                                  value={char.bodyBuild || ''}
                                  onChange={(e) => handleUpdate(idx, 'bodyBuild', e.target.value)}
                                  placeholder="เช่น: กำยำ สูง 182 ซม. ไหล่กว้าง ปราดเปรียว"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">ใบหน้า/สีตา (Facial Features):</label>
                                <input
                                  type="text"
                                  value={char.facialFeatures || ''}
                                  onChange={(e) => handleUpdate(idx, 'facialFeatures', e.target.value)}
                                  placeholder="เช่น: คมเข้ม นัยน์ตาสีทองอำพัน คิ้วกระบี่"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">ทรงผม/สีผม (Hair Style):</label>
                                <input
                                  type="text"
                                  value={char.hairStyle || ''}
                                  onChange={(e) => handleUpdate(idx, 'hairStyle', e.target.value)}
                                  placeholder="เช่น: ผมยาวสีดำขลับรวบครึ่งศีรษะ ปอยผมข้างหู"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">โทนสีประจำตัว (Color Theme):</label>
                                <input
                                  type="text"
                                  value={char.colorTheme || ''}
                                  onChange={(e) => handleUpdate(idx, 'colorTheme', e.target.value)}
                                  placeholder="เช่น: ดำ-ทอง หรือ น้ำเงินคราม-เงิน"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-gray-400 block mb-0.5">เครื่องแต่งกาย (Clothing):</label>
                                <input
                                  type="text"
                                  value={char.clothingStyle}
                                  onChange={(e) => handleUpdate(idx, 'clothingStyle', e.target.value)}
                                  placeholder="เช่น: เสื้อคลุมผ้าไหมปักลายเกล็ดมังกร เกราะแขนสีเงิน สนับเข่าหนัง"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 2: Gear, Abilities & Weaknesses */}
                          <div className="p-3 rounded-xl bg-studio-900/80 border border-studio-800 space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                              <Sword className="w-3.5 h-3.5" />
                              <span>อาวุธ ทักษะ &amp; จุดอ่อน (Dimensions 7, 9, 10)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">อาวุธ/อุปกรณ์ (Weapons):</label>
                                <input
                                  type="text"
                                  value={char.weaponsOrProps || ''}
                                  onChange={(e) => handleUpdate(idx, 'weaponsOrProps', e.target.value)}
                                  placeholder="เช่น: กระบี่หักสะท้านฟ้า, ยานรบ"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">พลัง/ทักษะพิเศษ (Abilities):</label>
                                <input
                                  type="text"
                                  value={char.abilities || ''}
                                  onChange={(e) => handleUpdate(idx, 'abilities', e.target.value)}
                                  placeholder="เช่น: เก้ากระบี่สวรรค์, ทะลวงมิติ"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">จุดอ่อน/ข้อจำกัด (Weaknesses):</label>
                                <input
                                  type="text"
                                  value={char.weaknesses || ''}
                                  onChange={(e) => handleUpdate(idx, 'weaknesses', e.target.value)}
                                  placeholder="เช่น: ชีพจรเคยแตกสลาย, ห่วงคนรัก"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 3: Personality & Relationships */}
                          <div className="p-3 rounded-xl bg-studio-900/80 border border-studio-800 space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                              <Heart className="w-3.5 h-3.5" />
                              <span>บุคลิกภาพ &amp; ความสัมพันธ์ (Dimensions 8, 11)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">บุคลิกภาพ (Personality):</label>
                                <input
                                  type="text"
                                  value={char.personality || ''}
                                  onChange={(e) => handleUpdate(idx, 'personality', e.target.value)}
                                  placeholder="เช่น: เยือกเย็น ไม่ยอมแพ้ มีไหวพริบปฏิภาณ"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-0.5">ความสัมพันธ์ (Relationships):</label>
                                <input
                                  type="text"
                                  value={char.relationships || ''}
                                  onChange={(e) => handleUpdate(idx, 'relationships', e.target.value)}
                                  placeholder="เช่น: สหายร่วมสาบาน, คู่ปรับตลอดกาล"
                                  className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: Visual Lock & Flow Google Prompts */}
                      {activeTab === 'prompts' && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div>
                            <label className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                              Visual Anchor (ลักษณะเด่นที่จะถูกนำไปล็อคในทุกฉาก):
                            </label>
                            <textarea
                              rows={2}
                              value={char.appearanceAnchor}
                              onChange={(e) => handleUpdate(idx, 'appearanceAnchor', e.target.value)}
                              placeholder="เช่น: handsome young warrior, sharp piercing eyes, distinct armor, 8k resolution"
                              className="w-full px-3 py-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Flow Google Prompt Copy Box */}
                          <div className="p-3 rounded-xl bg-studio-900 border border-studio-800 flex items-center justify-between gap-2">
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-semibold mb-0.5">
                                <span>🌊 คำสั่งสร้างภาพสำหรับ flow.google.com:</span>
                              </div>
                              <p className="text-[11px] text-gray-400 truncate font-mono">
                                {char.googleFlowPrompt || `${char.appearanceAnchor}, 8k --seed ${char.googleFlowSeed || '12345'}`}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyFlowPrompt(
                                  char.googleFlowPrompt || `${char.appearanceAnchor}, 8k --seed ${char.googleFlowSeed || '12345'}`,
                                  char.id
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-studio-800 hover:bg-cyan-950 border border-studio-700 hover:border-cyan-500/40 text-xs text-gray-200 hover:text-cyan-300 flex items-center gap-1 transition-all flex-shrink-0"
                            >
                              {copiedId === char.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 text-[11px]">คัดลอกแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">คัดลอก</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="text-xs">
                            <label className="text-gray-400 block mb-1">สไตล์เสียงพากย์ (Voice Style):</label>
                            <input
                              type="text"
                              value={char.voiceStyle}
                              onChange={(e) => handleUpdate(idx, 'voiceStyle', e.target.value)}
                              placeholder="เช่น: เสียงทุ้มต่ำ หนักแน่น ดุดัน สุขุม"
                              className="w-full px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddCharacter}
            className="w-full py-3 rounded-2xl border border-dashed border-studio-700 hover:border-amber-500/50 hover:bg-studio-950 text-gray-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มตัวละครใหม่ในโปรเจกต์</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-studio-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกข้อมูลตัวละครทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
}
