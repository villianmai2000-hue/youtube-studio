'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, CharacterBible } from '@/lib/types';
import {
  Film,
  Sparkles,
  Clock,
  User,
  Globe,
  ArrowRight,
  Bot,
  ShieldCheck,
  Plus,
  Loader2,
  Check,
  Layers,
} from 'lucide-react';

interface CreateSequelModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSequelCreated?: (newProject: Project) => void;
}

export default function CreateSequelModal({
  isOpen,
  onClose,
  project,
  onSequelCreated,
}: CreateSequelModalProps) {
  const router = useRouter();

  const currentPart = project.partNumber || 1;
  const nextPart = currentPart + 1;

  // Auto-generate smart sequel title
  const generateDefaultTitle = () => {
    const base = (project?.seriesTitle || project?.title || 'ภาพยนตร์').trim();
    // If title ends with "ภาค X", replace it
    const match = base.match(/(.*?)\s*(?:ภาค|Part|Season|ซีซั่น)\s*(\d+)/i);
    if (match) {
      return `${match[1].trim()} ภาค ${nextPart}`;
    }
    return `${base} ภาค ${nextPart}`;
  };

  const [sequelTitle, setSequelTitle] = useState(generateDefaultTitle());
  const [synopsis, setSynopsis] = useState('');
  const [durationMode, setDurationMode] = useState<string>('60');
  const [customDuration, setCustomDuration] = useState<number>(90);
  const [addNewCharacter, setAddNewCharacter] = useState(true);
  const [generatingSynopsis, setGeneratingSynopsis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // AI Prompt Continuation Generator
  const handleGenerateContinuationSynopsis = async () => {
    setGeneratingSynopsis(true);
    try {
      const hero = project.characters.find((c) => c.role === 'protagonist')?.name || 'ตัวเอก';
      const villain = project.characters.find((c) => c.role === 'antagonist')?.name || 'ศัตรู';
      const prevEnding = project.storyArchitecture?.ending || project.synopsis || '';

      const promptSuggestion = `สืบเนื่องจากมหาศึกในภาคที่ ${currentPart} หลังจากที่${hero}ได้ผ่านการต่อสู้อันดุเดือด ณ ${project.worldBuilding?.city || 'แดนการประลอง'} และค้นพบความจริงเบื้องหลังชาติกำเนิด... ในภาคที่ ${nextPart} นี้ ภัยคุกคามครั้งใหม่ที่ยิ่งใหญ่กว่าเดิมได้ปรากฏขึ้น เมื่อผนึกโบราณแห่ง${project.worldBuilding?.kingdom || 'อาณาจักร'}เริ่มสั่นคลอน ${hero}จำต้องออกเดินทางสู่ดินแดนต้องห้ามเพื่อทลายขอบเขตพลังขั้นสูงสุด และเผชิญหน้ากับศัตรูระดับจักรพรรดิที่แฝงตัวอยู่ในเงามืด`;

      setSynopsis(promptSuggestion);
    } finally {
      setGeneratingSynopsis(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sequelTitle.trim()) {
      setError('กรุณาระบุชื่อภาคต่อ');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const finalDuration = durationMode === 'custom' ? customDuration : Number(durationMode);

      // Clone characters preserving 100% 11 dimensions & Face Lock Seeds
      let inheritedCharacters: CharacterBible[] = project.characters.map((c) => ({
        ...c,
        id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }));

      // Optionally add a new formidable character for the sequel
      if (addNewCharacter) {
        const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
        const newVillain: CharacterBible = {
          id: `char-${Date.now()}-boss`,
          name: project.worldCulture === 'chinese' ? 'จอมมารบรรพกาลเก้าสุริยัน' : project.worldCulture === 'thai' ? 'พญาอสูรราหูเทวะ' : 'จักรพรรดิมหาวิบัติ',
          role: 'antagonist',
          age: 'พันปี',
          bodyBuild: 'ร่างสูงใหญ่กำยำ แผ่ไอสังหารแรงกล้า',
          facialFeatures: 'แววตาคมกริบเรืองแสงสีม่วงทมิฬ',
          hairStyle: 'ผมยาวสีดำสนิทสยายพริ้ว',
          clothingStyle: 'เกราะทมิฬลวดลายโบราณ ปลอกแขนเกล็ดอสูร',
          colorTheme: 'ดำ-ม่วงทมิฬ (Obsidian & Void Purple)',
          weaponsOrProps: 'หอกมารกลืนดารา',
          personality: 'เหี้ยมหาญ ไร้ปรานี วางแผนลึกล้ำ',
          abilities: 'พลังกลืนกินมิติ ควบคุมหมอกอสูร',
          weaknesses: 'ยังฟื้นฟูพลังจากผนึกโบราณได้เพียง 7 ส่วน',
          relationships: `ศัตรูร้ายกาจคนใหม่ที่เหนือกว่าศัตรูในภาค ${currentPart}`,
          appearanceAnchor: 'supreme dark demon emperor, glowing ominous purple eyes, obsidian armor, 8k resolution, cinematic lighting',
          voiceStyle: 'ทุ้มลึก ก้องกังวาน สั่นสะเทือนวิญญาณ',
          googleFlowSeed: randomSeed,
          googleFlowPrompt: `supreme dark emperor, obsidian armor, glowing void purple eyes, cinematic masterpiece, 8k --seed ${randomSeed}`,
        };
        inheritedCharacters.push(newVillain);
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sequelTitle.trim(),
          synopsis: synopsis.trim() || `${sequelTitle} - ภาคต่อมหากาพย์การเดินทางบทใหม่สืบเนื่องจาก ${project.title}`,
          genre: project.genre,
          genreNameCustom: project.genreNameCustom,
          worldCulture: project.worldCulture,
          subGenre: project.subGenre,
          militaryCategory: project.militaryCategory,
          visualMedium: project.visualMedium,
          stylePreset: project.stylePreset,
          aspectRatio: project.aspectRatio || '16:9',
          scriptEngine: project.scriptEngine || 'gemini_3_1_pro',
          targetDurationMinutes: finalDuration,
          characters: inheritedCharacters,
          worldBuilding: project.worldBuilding,
          // Sequel Chaining Data
          seriesId: project.seriesId || project.id,
          seriesTitle: project.seriesTitle || project.title,
          partNumber: nextPart,
          parentProjectId: project.id,
          previousPartTitle: project.title,
          previousEndingRecap: project.storyArchitecture?.ending || project.synopsis,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        if (onSequelCreated) {
          onSequelCreated(data.project);
        }
        onClose();
        router.push(`/project/${data.project.id}`);
      } else {
        setError(data.error || 'สร้างภาคต่อไม่สำเร็จ');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 text-amber-400 border border-amber-500/30 shadow-glow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">🎬 สร้างภาคต่อ / ซีซั่นถัดไป</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                  ภาคที่ {nextPart}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                สืบทอดตัวละคร 11 มิติ, Face Lock Seed และข้อมูลโลกเดิม 100% ต่อเนื่องไม่สะดุด
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

        {/* Previous Part Info Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-studio-950 border border-studio-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">ภาคต้นกำเนิด:</span>
            <span className="font-bold text-amber-300 truncate max-w-[280px]">{project.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-studio-800/60 text-[11px] text-gray-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ส่งต่อตัวละคร: <strong>{project.characters.length} ตัว</strong> (Face Lock คงเดิม)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>โลก &amp; กฎพลัง: <strong>{project.worldBuilding?.kingdom || 'สืบทอด 9 มิติ'}</strong></span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Sequel Title */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">ชื่อโปรเจกต์ภาคต่อ:</label>
            <input
              type="text"
              value={sequelTitle}
              onChange={(e) => setSequelTitle(e.target.value)}
              placeholder="เช่น มหาเทพกระบี่ข้ามภพ ภาค 2: ผนึกมารหมื่นลี้"
              className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          {/* Synopsis with AI Suggestion Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-300 font-semibold">โครงเรื่องย่อภาคต่อ (Synopsis):</label>
              <button
                type="button"
                onClick={handleGenerateContinuationSynopsis}
                disabled={generatingSynopsis}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {generatingSynopsis ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
                <span>🤖 ให้ AI วางพล็อตเรื่องต่อจากภาคก่อนหน้า</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="เล่าเรื่องราวความท้าทายใหม่ จุดพลิกผัน หรือศัตรูตัวใหม่ที่จะเกิดขึ้นในภาคนี้..."
              className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-cyan-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Target Duration Selector (with 90, 120, 150 min + custom) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-studio-950/70 border border-studio-800">
            <label className="text-gray-300 font-semibold block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>ความยาวเป้าหมายสำหรับภาคนี้:</span>
              </span>
              {durationMode === 'custom' && (
                <span className="text-[10px] text-amber-300 font-mono">
                  {customDuration} นาที (~{Math.round((customDuration / 60) * 10) / 10} ชม.)
                </span>
              )}
            </label>

            <select
              value={durationMode}
              onChange={(e) => setDurationMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-studio-900 border border-studio-700 text-white text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="30">~30 นาที (ตอนพิเศษเข้มข้น)</option>
              <option value="60">~60 นาที (1 ชั่วโมงเต็ม)</option>
              <option value="90">~90 นาที (1 ชั่วโมง 30 นาที) 🌟</option>
              <option value="120">~120 นาที (2 ชั่วโมงเต็ม) 🌟</option>
              <option value="150">~150 นาที (2 ชั่วโมง 30 นาที) 🌟</option>
              <option value="custom">⏱️ กำหนดเวลาเอง (ระบุจำนวนนาทีเอง)...</option>
            </select>

            {durationMode === 'custom' && (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Math.max(1, Number(e.target.value)))}
                  placeholder="ระบุจำนวนนาที เช่น 180"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-studio-900 border border-amber-500/50 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-gray-400">นาที</span>
              </div>
            )}
          </div>

          {/* Option: Add new character */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="addNewCharCheck"
              checked={addNewCharacter}
              onChange={(e) => setAddNewCharacter(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-studio-950 border-studio-700 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="addNewCharCheck" className="text-gray-300 text-xs cursor-pointer select-none">
              ✨ ให้ AI เพิ่มตัวละครใหม่อัตโนมัติ 1 ตัวสำหรับภาคนี้ (เช่น ศัตรูระดับจักรพรรดิคนใหม่)
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-studio-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 hover:from-amber-400 hover:to-cyan-300 text-black font-extrabold text-xs shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างภาคต่อ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างภาค {nextPart} และเปิดสตูดิโอทันที</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
