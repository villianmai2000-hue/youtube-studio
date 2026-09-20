'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Film,
  Palette,
  Clock,
  User,
  ShieldAlert,
  Bot,
  Smartphone,
  Tv,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  MovieGenre,
  VisualMedium,
  StylePreset,
  AspectRatio,
  ScriptEngine,
  CharacterBible,
} from '@/lib/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

interface TempCharacter {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  appearanceAnchor: string;
  clothingStyle: string;
  voiceStyle: string;
  weaponsOrProps: string;
  googleFlowSeed: string;
}

export default function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState<MovieGenre>('military_tactical');
  const [militaryCategory, setMilitaryCategory] = useState<
    'missiles_weapons' | 'jets_drones' | 'special_forces' | 'armored_tanks'
  >('missiles_weapons');
  const [visualMedium, setVisualMedium] = useState<VisualMedium>('live_action');
  const [stylePreset, setStylePreset] = useState<StylePreset>('military_combat');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [scriptEngine, setScriptEngine] = useState<ScriptEngine>('gemini_3_1_pro');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(3);

  // Characters List
  const [characters, setCharacters] = useState<TempCharacter[]>([
    {
      name: 'ผู้การพายุ',
      role: 'protagonist',
      appearanceAnchor:
        'ผู้บัญชาการหน่วยรบพิเศษหนุ่ม ผิวเข้มคมเข้ม สวมหมวกเบเรต์และชุดเกราะ Tactical Vest ลายพราง แววตาเด็ดเดี่ยว มีแผลเป็นเล็กๆ เหนือคิ้วซ้าย 8k photorealistic',
      clothingStyle: 'ชุดเกราะ Tactical Vest ลายพรางสนามรบ วิทยุสื่อสารสะพายบ่า',
      voiceStyle: 'ดุดัน หนักแน่น สั่งการเฉียบขาด',
      weaponsOrProps: 'ปืนไรเฟิลจู่โจมติดกล้องเล็งและไฟเลเซอร์',
      googleFlowSeed: '849201',
    },
    {
      name: 'พลเอกศัตรู',
      role: 'antagonist',
      appearanceAnchor:
        'หัวหน้ากองกำลังฝ่ายตรงข้าม รูปร่างกำยำ สวมหน้ากากกันแก๊สและแว่นยุทธวิธีสีดำทมิฬ เสื้อเกราะหนักลายพรางเทาดำ แววตาดุดัน 8k photorealistic',
      clothingStyle: 'เสื้อเกราะหนักลายพรางเทาดำ หน้ากากยุทธวิธี',
      voiceStyle: 'ดุดัน ทะนงตัว เยือกเย็น',
      weaponsOrProps: 'ปืนกลหนักและรีโมตจุดชนวนขีปนาวุธ',
      googleFlowSeed: '631894',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenreChange = (newGenre: MovieGenre) => {
    setGenre(newGenre);
    if (newGenre === 'military_tactical') {
      setVisualMedium('live_action');
      setStylePreset('military_combat');
      setAspectRatio('9:16');
      setTargetDurationMinutes(3);
      setCharacters([
        {
          name: 'ผู้การพายุ',
          role: 'protagonist',
          appearanceAnchor:
            'ผู้บัญชาการหน่วยรบพิเศษหนุ่ม ผิวเข้มคมเข้ม สวมหมวกเบเรต์และชุดเกราะ Tactical Vest ลายพราง แววตาเด็ดเดี่ยว 8k photorealistic',
          clothingStyle: 'ชุดเกราะ Tactical Vest ลายพรางสนามรบ วิทยุสื่อสารสะพายบ่า',
          voiceStyle: 'ดุดัน หนักแน่น สั่งการเฉียบขาด',
          weaponsOrProps: 'ปืนไรเฟิลจู่โจมติดกล้องเล็งและไฟเลเซอร์',
          googleFlowSeed: '849201',
        },
        {
          name: 'แม่ทัพศัตรู',
          role: 'antagonist',
          appearanceAnchor:
            'หัวหน้ากองกำลังฝ่ายตรงข้าม รูปร่างกำยำ สวมหน้ากากกันแก๊สและแว่นยุทธวิธีสีดำทมิฬ เสื้อเกราะหนักลายพรางเทาดำ แววตาดุดัน',
          clothingStyle: 'เสื้อเกราะหนักลายพรางเทาดำ หน้ากากยุทธวิธี',
          voiceStyle: 'ดุดัน ทะนงตัว เยือกเย็น',
          weaponsOrProps: 'ปืนกลหนักและรีโมตจุดชนวนขีปนาวุธ',
          googleFlowSeed: '631894',
        },
      ]);
    } else if (newGenre === 'xianxia_cultivation') {
      setVisualMedium('animation');
      setStylePreset('donghua_3d');
      setAspectRatio('16:9');
      setTargetDurationMinutes(60);
      setCharacters([
        {
          name: 'เซียวหลิน',
          role: 'protagonist',
          appearanceAnchor:
            'จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีคราม สไตล์อนิเมะจีน 3D สวยสง่า',
          clothingStyle: 'ชุดคลุมผ้าไหมโบราณพริ้วไหวปักดิ้นทอง',
          voiceStyle: 'ทุ้ม นิ่ง สุขุม แฝงพลังความมุ่งมั่น',
          weaponsOrProps: 'กระบี่ครามโบราณลอยกลางอากาศ',
          googleFlowSeed: '741258',
        },
        {
          name: 'จ้าวอสูรโลหิต',
          role: 'antagonist',
          appearanceAnchor:
            'จ้าวอสูรผู้เกรงขาม แววตาสีแดงเพลิงเรืองรอง สวมชุดเกราะหนามสีดำทมิฬ มีไอหมอกมารสีเลือดแผ่ออกมารอบตัว สไตล์อนิเมะจีน 3D',
          clothingStyle: 'ชุดเกราะหนามทมิฬ แผ่ไอหมอกมารสีเลือด',
          voiceStyle: 'ดุดัน ทะนงตัว เยือกเย็น',
          weaponsOrProps: 'ง้าวโลหิตทมิฬ / พลังออร่ามาร',
          googleFlowSeed: '952314',
        },
      ]);
    }
  };

  const handleAddCharacter = () => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    setCharacters([
      ...characters,
      {
        name: `ตัวละครใหม่ ${characters.length + 1}`,
        role: 'supporting',
        appearanceAnchor: 'ระบุลักษณะเด่น รูปร่าง หน้าตา เครื่องแต่งกาย เพื่อล็อคหน้าตาด้วย AI',
        clothingStyle: 'เครื่องแต่งกายประจำตัว',
        voiceStyle: 'น้ำเสียงเป็นเอกลักษณ์',
        weaponsOrProps: '',
        googleFlowSeed: randomSeed,
      },
    ]);
  };

  const handleRemoveCharacter = (index: number) => {
    if (characters.length <= 1) {
      alert('ต้องมีตัวละครอย่างน้อย 1 ตัว');
      return;
    }
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleUpdateCharacter = (index: number, field: keyof TempCharacter, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const randomizeSeed = (index: number) => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    handleUpdateCharacter(index, 'googleFlowSeed', randomSeed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่อเรื่อง');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          synopsis,
          genre,
          militaryCategory: genre === 'military_tactical' ? militaryCategory : undefined,
          visualMedium,
          stylePreset,
          aspectRatio,
          scriptEngine,
          targetDurationMinutes,
          characters,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        onCreated(data.project.id);
        onClose();
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">สร้างโปรเจกต์ใหม่ (ภาพยนตร์ / อนิเมะ / ทหาร)</h2>
              <p className="text-xs text-gray-400">
                รองรับสัดส่วน 16:9 และ 9:16 &bull; เลือกรุ่น AI เขียนบท &bull; ล็อคหน้าตาตัวละครด้วย flow.google.com
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

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              ชื่อเรื่อง / หัวข้อคลิป *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                genre === 'military_tactical'
                  ? 'เช่น: เผยแสนยานุภาพ ขีปนาวุธไฮเปอร์โซนิก vs ระบบป้องกันภัยทางอากาศ (2-5 นาที)'
                  : 'เช่น: มหากาพย์มหาเทพกระบี่สายฟ้า ทะลวง 9 ดินแดน (รวมตอน 1 ชั่วโมงเต็ม)'
              }
              className="w-full px-4 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              เรื่องย่อ / ข้อมูลยุทธการ / สปอยล์เนื้อเรื่อง
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="เล่าไฮไลต์สำคัญ เหตุการณ์ที่เกิดขึ้น อาวุธที่นำมาใช้งาน หรือการปะทะชี้ชะตา..."
              className="w-full px-4 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Row: Aspect Ratio & Script Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio Selector (16:9 vs 9:16) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                สัดส่วนวิดีโอ (Aspect Ratio) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                      : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <Tv className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">16:9 แนวนอน</span>
                  <span className="text-[10px] text-gray-400">YouTube, Cinema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                      : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold">9:16 แนวตั้ง</span>
                  <span className="text-[10px] text-gray-400">Reels, Shorts, TikTok</span>
                </button>
              </div>
            </div>

            {/* AI Scriptwriting Model Engine */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                เลือกรุ่น AI เขียนบทสคริปต์
              </label>
              <select
                value={scriptEngine}
                onChange={(e) => setScriptEngine(e.target.value as ScriptEngine)}
                className="w-full px-3.5 py-3 rounded-xl bg-studio-950 border border-studio-700 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <optgroup label="Google Gemini">
                  <option value="gemini_3_1_pro">Google Gemini 3.1 Pro (เขียนบทพากย์ละเอียด ภาษาไทยคมชัด)</option>
                  <option value="gemini_3_8_flash">Google Gemini 3.8 Flash (ความเร็วสูง ดำเนินเรื่องฉับไว)</option>
                  <option value="gemini_flash_lite">Google Gemini 3.5 Flash-Lite (ประหยัด ประมวลผลเร็ว)</option>
                </optgroup>
                <optgroup label="Claude.ai">
                  <option value="claude_extra">Claude.ai Extra (บรรยายเชิงลึก มหากาพย์)</option>
                  <option value="claude_high">Claude.ai High (ความแม่นยำสูง อารมณ์เข้มข้น)</option>
                  <option value="claude_medium">Claude.ai Medium (สมดุลและรวดเร็ว)</option>
                </optgroup>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">
                ระบบเชื่อมต่อระบบเขียนบทภาษาไทยเต็มรูปแบบแยกเสียงพากย์และเสียงตัวละคร
              </p>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              หมวดหมู่หลัก (Genre) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleGenreChange('military_tactical')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  genre === 'military_tactical'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                    : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🚀</span>
                  <span className="text-xs font-bold text-white">แนวทหาร &amp; ยุทธการสงคราม</span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  2-5 นาที สไตล์ Facebook Reels (ยุทโธปกรณ์, รถถัง, โดรน, ขีปนาวุธ)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleGenreChange('xianxia_cultivation')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  genre === 'xianxia_cultivation'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                    : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚔️</span>
                  <span className="text-xs font-bold text-white">บำเพ็ญเพียร / กำลังภายใน</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  สไตล์เพื่อนที่ดีที่สุด SAN1 (3D Donghua อนิเมะจีน รันชั่วโมง)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleGenreChange('action_scifi')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  genre === 'action_scifi'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                    : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  <span className="text-xs font-bold text-white">แอ็กชัน / ไซไฟ / แฟนตาซี</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  โลกอนาคต หุ่นยนต์รบ หรือเวทมนตร์มหากาพย์
                </p>
              </button>
            </div>
          </div>

          {/* If Military: Subcategory selector */}
          {genre === 'military_tactical' && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                🎯 เลือกหมวดย่อยของคลิปทหาร (อิงสไตล์ Facebook Reels)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'missiles_weapons', label: '🚀 ขีปนาวุธ & อาวุธ', desc: 'ไฮเปอร์โซนิก, ปืนใหญ่' },
                  { id: 'jets_drones', label: '✈️ เครื่องบินรบ & โดรน', desc: 'F-35, โดรนกามิกาเซ่' },
                  { id: 'special_forces', label: '🛡️ หน่วยรบพิเศษ', desc: 'ภารกิจลับ, ชิงตัวประกัน' },
                  { id: 'armored_tanks', label: '💥 รถถัง & ยานเกราะ', desc: 'สงครามยานเกราะประจัญบาน' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMilitaryCategory(cat.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      militaryCategory === cat.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                        : 'bg-studio-900 border-studio-700 text-gray-400 hover:border-studio-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{cat.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              เป้าหมายความยาวคลิป
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {genre === 'military_tactical'
                ? [
                    { mins: 2, label: '2 นาที (Reels)', sub: '12 ฉาก เร้าใจกระชับ' },
                    { mins: 3, label: '3 นาที (แนะนำ)', sub: '18 ฉาก ละเอียดเข้มข้น' },
                    { mins: 5, label: '5 นาที (เต็มเรื่อง)', sub: '30 ฉาก ยุทธการครบวงจร' },
                    { mins: 15, label: '15 นาที (สารคดี)', sub: 'วิเคราะห์แสนยานุภาพเชิงลึก' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setTargetDurationMinutes(item.mins)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetDurationMinutes === item.mins
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                          : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-gray-100">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                    </button>
                  ))
                : [
                    { mins: 15, label: '15 นาที', sub: '~2,000 คำ' },
                    { mins: 30, label: '30 นาที', sub: '~4,000 คำ' },
                    { mins: 60, label: '60 นาที (1 ชม.)', sub: '~8,000 คำ (แนะนำ)' },
                    { mins: 120, label: '120 นาที (2 ชม.)', sub: '~16,000 คำ มหากาพย์' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setTargetDurationMinutes(item.mins)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetDurationMinutes === item.mins
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                          : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-gray-100">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                    </button>
                  ))}
            </div>
          </div>

          {/* Medium Selector: คนจริง vs การ์ตูน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                <Palette className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                ประเภทภาพ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVisualMedium('live_action');
                    setStylePreset(genre === 'military_tactical' ? 'military_combat' : 'hollywood_cinematic');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    visualMedium === 'live_action'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-cyanGlow'
                      : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white">🎬 คนจริง (Live-Action)</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">ภาพยนตร์ 35mm / กล้องทหาร 4K</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVisualMedium('animation');
                    setStylePreset('donghua_3d');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    visualMedium === 'animation'
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-glow'
                      : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white">🎨 อนิเมะ / แอนิเมชัน</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">3D Donghua / 2D Anime</p>
                </button>
              </div>
            </div>

            {/* Style Preset Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                สไตล์งานภาพเรนเดอร์ (AI Render Style)
              </label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                className="w-full px-3.5 py-3 rounded-xl bg-studio-950 border border-studio-700 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {visualMedium === 'live_action' ? (
                  <>
                    <option value="military_combat">🎯 หน่วยรบ ยุทโธปกรณ์ ยานเกราะ Tactical 4K</option>
                    <option value="hollywood_cinematic">🎞️ ภาพยนตร์คนจริง เลนส์ 35 มม. แสงเงาลุ่มลึก</option>
                    <option value="imax_70mm">🎥 กล้องยักษ์ IMAX 70 มม. คมชัดสูงสุด</option>
                    <option value="dark_noir">🌧️ ดาร์กฟิล์มนัวร์ ถนนเปียกฝน แสงสะท้อน</option>
                  </>
                ) : (
                  <>
                    <option value="donghua_3d">🔥 อนิเมะจีน 3D กำลังภายใน (เพื่อนที่ดีที่สุด SAN1)</option>
                    <option value="anime_2d">🌸 อนิเมะญี่ปุ่น 2D ระดับโรงภาพยนตร์</option>
                    <option value="western_3d">🎭 แอนิเมชัน 3D ระดับโลก (Arcane / Pixar)</option>
                    <option value="manhwa_action">⚡ มันฮวาเกาหลี แอ็กชันดาร์กแฟนตาซี</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Multi-Character Setup with Google Flow Seed Locking */}
          <div className="p-4 rounded-2xl bg-studio-950/80 border border-studio-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  กำหนดตัวละครตั้งแต่เริ่มต้น &amp; ล็อคหน้าตาด้วย flow.google.com
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ระบบจะสร้าง Seed และ Appearance Anchor เฉพาะตัวละคร เพื่อล็อคหน้าไม่ให้เพี้ยนข้ามฉากบน flow.google.com
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="px-2.5 py-1.5 rounded-xl bg-studio-800 hover:bg-studio-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มตัวละคร</span>
              </button>
            </div>

            <div className="space-y-3">
              {characters.map((char, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-studio-900/90 border border-studio-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold text-amber-400">#{index + 1}</span>
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => handleUpdateCharacter(index, 'name', e.target.value)}
                        placeholder="ชื่อตัวละคร"
                        className="px-2.5 py-1 bg-studio-950 border border-studio-700 rounded-lg text-xs text-white font-bold w-36 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={char.role}
                        onChange={(e) => handleUpdateCharacter(index, 'role', e.target.value)}
                        className="px-2 py-1 bg-studio-950 border border-studio-700 rounded-lg text-xs text-gray-300 focus:outline-none"
                      >
                        <option value="protagonist">พระเอก / ตัวเอกนำ</option>
                        <option value="antagonist">ตัวร้าย / คู่ปรับ</option>
                        <option value="supporting">ตัวละครรอง / ผู้ช่วย</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Seed locking display & refresh */}
                      <div
                        className="flex items-center gap-1 px-2 py-1 bg-studio-950 border border-studio-700 rounded-lg text-[11px] text-cyan-300 font-mono"
                        title="Seed สำหรับ flow.google.com เพื่อล็อคหน้าตาตัวละคร"
                      >
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>Seed:</span>
                        <input
                          type="text"
                          value={char.googleFlowSeed}
                          onChange={(e) => handleUpdateCharacter(index, 'googleFlowSeed', e.target.value)}
                          className="w-14 bg-transparent text-cyan-300 focus:outline-none text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => randomizeSeed(index)}
                          className="text-gray-400 hover:text-white"
                          title="สุ่ม Seed ใหม่"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>

                      {characters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCharacter(index)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                          title="ลบตัวละครนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">
                      ลักษณะเด่น / Visual Prompt สำหรับ flow.google.com (หน้าตา, ทรงผม, รูปร่าง):
                    </label>
                    <input
                      type="text"
                      value={char.appearanceAnchor}
                      onChange={(e) => handleUpdateCharacter(index, 'appearanceAnchor', e.target.value)}
                      placeholder="เช่น ชายหนุ่มหน้าตาคมเข้ม แววตามุ่งมั่น สวมชุดเกราะ Tactical Vest ลายพราง 8k resolution"
                      className="w-full px-2.5 py-1 bg-studio-950 border border-studio-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-studio-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'กำลังสร้างโปรเจกต์...' : 'เริ่มสร้างสตูดิโอ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
