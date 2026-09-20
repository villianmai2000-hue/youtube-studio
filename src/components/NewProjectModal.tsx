'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Film,
  Tv,
  Clock,
  Globe,
  Palette,
  Bot,
  X,
  Check,
  Zap,
  Users,
} from 'lucide-react';
import {
  WorldCulture,
  VisualMedium,
  StylePreset,
  AspectRatio,
  ScriptEngine,
  MovieGenre,
} from '@/lib/types';
import {
  ANIME_GENRES,
  ANIME_STYLES,
  MOVIE_GENRES,
  MOVIE_STYLES,
  CHINESE_SETTING_SUBGENRES,
  JAPANESE_SETTING_SUBGENRES,
  THAI_SETTING_SUBGENRES,
  getSubgenresByCulture,
} from '@/lib/studio-categories';
import { detectStoryCharacterScale } from '@/lib/character-generator';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  // 1. Work Medium (อนิเมะ vs ภาพยนตร์)
  const [visualMedium, setVisualMedium] = useState<VisualMedium>('animation');

  // 2. World Culture (จีน, ญี่ปุ่น, ไทย, สากล)
  const [worldCulture, setWorldCulture] = useState<WorldCulture>('chinese');

  // 3. Subgenre / Setting
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('xianxia');

  // 4. Style Preset
  const [stylePreset, setStylePreset] = useState<StylePreset>('donghua_3d');

  // 5. Title & Synopsis
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');

  // 6. Target Format & Specs
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [durationMode, setDurationMode] = useState<string>('60');
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(90);
  const [scriptEngine, setScriptEngine] = useState<ScriptEngine>('gemini_3_1_pro');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState('');

  // Subgenres based on world culture
  const availableSubgenres = useMemo(() => {
    return getSubgenresByCulture(worldCulture);
  }, [worldCulture]);

  // Styles based on visual medium
  const availableStyles = useMemo(() => {
    return visualMedium === 'animation' ? ANIME_STYLES : MOVIE_STYLES;
  }, [visualMedium]);

  // Auto-detected character scale based on story title, synopsis, culture, and subgenre
  const detectedScale = useMemo(() => {
    return detectStoryCharacterScale(title, synopsis, worldCulture, selectedSubGenre);
  }, [title, synopsis, worldCulture, selectedSubGenre]);

  if (!isOpen) return null;

  // Handle Culture Change
  const handleCultureChange = (cult: WorldCulture) => {
    setWorldCulture(cult);
    if (cult === 'chinese') {
      setSelectedSubGenre('xianxia');
      setVisualMedium('animation');
      setStylePreset('donghua_3d');
      setAspectRatio('16:9');
      setDurationMode('60');
    } else if (cult === 'japanese') {
      setSelectedSubGenre('isekai_jp');
      setVisualMedium('animation');
      setStylePreset('anime_2d');
      setAspectRatio('16:9');
      setDurationMode('30');
    } else if (cult === 'thai') {
      setSelectedSubGenre('naga');
      setVisualMedium('animation');
      setStylePreset('donghua_3d');
      setAspectRatio('16:9');
      setDurationMode('15');
    } else {
      setSelectedSubGenre('action');
      setVisualMedium('live_action');
      setStylePreset('hollywood_cinematic');
      setAspectRatio('16:9');
      setDurationMode('3');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่อเรื่อง');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingStep(`🤖 AI กำลังวิเคราะห์เนื้อเรื่องและออกแบบตัวละคร ${detectedScale.count} ตัวตามพล็อต...`);

    try {
      // 1. Generate Characters Automatically based on the Story Concept
      let characters = [];
      try {
        const charRes = await fetch('/api/ai/generate-characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            synopsis,
            worldCulture,
            genre: selectedSubGenre,
            subGenre: selectedSubGenre,
            visualMedium,
            stylePreset,
            characterCount: detectedScale.count,
          }),
        });
        const charData = await charRes.json();
        if (charData.success && Array.isArray(charData.characters)) {
          characters = charData.characters;
        }
      } catch (charErr) {
        console.warn('Character auto-gen error, will use default template cast:', charErr);
      }

      setLoadingStep('🚀 กำลังจัดเตรียมห้องสตูดิโอและประกอบไทม์ไลน์ภาพยนตร์...');

      // 2. Create the Project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          synopsis: synopsis || `${title} - มหากาพย์เรื่องราวในแดน${worldCulture === 'chinese' ? 'เซียนโบราณ' : worldCulture === 'japanese' ? 'ต่างโลก' : worldCulture === 'thai' ? 'ไทยโบราณ' : 'สากล'}`,
          genre: (worldCulture === 'chinese' ? 'xianxia_cultivation' : worldCulture === 'western_global' ? 'action_scifi' : 'custom') as MovieGenre,
          worldCulture,
          subGenre: selectedSubGenre,
          visualMedium,
          stylePreset,
          aspectRatio,
          scriptEngine,
          targetDurationMinutes: durationMode === 'custom' ? customDurationMinutes : Number(durationMode),
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
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl my-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                สร้างสตูดิโอใหม่ (New Studio Project)
              </h2>
              <p className="text-xs text-cyan-300 mt-0.5 font-medium">
                ✨ สร้างสตูดิโอก่อน แล้วระบบจะวิเคราะห์พล็อตเรื่องเพื่อสร้างตัวละครให้อัตโนมัติ!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-studio-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Step 1 & Step 2: Medium and World Culture Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-cyan-400" /> 1. รูปแบบผลงาน (Work Medium):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisualMedium('animation')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    visualMedium === 'animation'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-studio-950 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <span className="text-base">🌸</span>
                  <span>อนิเมะ / 3D Animation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualMedium('live_action')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    visualMedium === 'live_action'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-studio-950 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <span className="text-base">🎥</span>
                  <span>ภาพยนตร์คนจริง (Live-Action)</span>
                </button>
              </div>
            </div>

            {/* Step 2: World Culture */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> 2. วัฒนธรรมโลก &amp; ธีมหลัก (World Culture):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'chinese', label: 'จีน 🇨🇳', desc: 'เซียน/กำลังภายใน' },
                  { id: 'japanese', label: 'ญี่ปุ่น 🇯🇵', desc: 'ต่างโลก/อนิเมะ' },
                  { id: 'thai', label: 'ไทย 🇹🇭', desc: 'พญานาค/มนต์คาถา' },
                  { id: 'western_global', label: 'สากล 🌐', desc: 'ฮอลลีวูด/ไซไฟ' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCultureChange(c.id as WorldCulture)}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center transition-all ${
                      worldCulture === c.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-studio-950 border-studio-800 text-gray-400 hover:border-studio-700'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-[10px] text-gray-400 font-normal mt-0.5">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 & Step 4: Genre and Visual Art Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-purple-400" /> 3. แนวเรื่องเจาะจง (Genre &amp; Subgenre):
              </label>
              <select
                value={selectedSubGenre}
                onChange={(e) => setSelectedSubGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {availableSubgenres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.emoji} {g.nameTh}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 italic">
                {availableSubgenres.find((g) => g.id === selectedSubGenre)?.description || ''}
              </p>
            </div>

            {/* Visual Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" /> 4. สไตล์งานภาพ (Visual Art Style):
              </label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {availableStyles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.nameTh}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 italic">
                {availableStyles.find((s) => s.id === stylePreset)?.description || ''}
              </p>
            </div>
          </div>

          {/* Step 5: Title & Story Synopsis */}
          <div className="space-y-3 p-4 rounded-2xl bg-studio-950 border border-studio-800">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">
                📌 ชื่อเรื่อง / ชื่อภาพยนตร์หรืออนิเมะ (Title):
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  worldCulture === 'chinese'
                    ? 'เช่น มหาเทพกระบี่ข้ามภพ: พลิกชะตาฟ้าประทาน'
                    : worldCulture === 'thai'
                    ? 'เช่น มหากาพย์นาคราช: สงครามทวงคืนบาดาล'
                    : worldCulture === 'japanese'
                    ? 'เช่น ผู้กล้าดาบสายฟ้าต่างโลก: ทะลุมิติพิชิตจอมมาร'
                    : 'เช่น ปฏิบัติการสายฟ้าแลบ ยุทธการถล่มฐานทัพศัตรู'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-900 border border-studio-700 text-white text-sm font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-200">
                  📖 พล็อตเรื่องย่อ / คอนเซปต์ (Story Synopsis / Logline):
                </label>
                <span className="text-[11px] text-cyan-400">
                  💡 AI จะอ่านเนื้อเรื่องนี้เพื่อสร้างตัวละครให้อัตโนมัติ
                </span>
              </div>
              <textarea
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="เขียนแนวคิดหรือเรื่องย่อสั้นๆ เช่น เมื่อชายหนุ่มผู้ถูกทำลายชีพจรและถูกแย่งชิงกระดูกเซียน ตกสู่หุบเหวแต่ค้นพบกระบี่บรรพกาล การหวนคืนมาทวงแค้นเก้าสำนักใหญ่จึงเริ่มขึ้น..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-cyan-400 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Step 6: Specs: Aspect Ratio, Duration & AI Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Aspect Ratio */}
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold block">สัดส่วนวิดีโอ (Aspect Ratio):</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-studio-950 border-studio-800 text-gray-400'
                  }`}
                >
                  16:9 (แนวนอน)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-studio-950 border-studio-800 text-gray-400'
                  }`}
                >
                  9:16 (Reels/TikTok)
                </button>
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold block flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> ความยาวเป้าหมาย:
                </span>
                {durationMode === 'custom' && (
                  <span className="text-[10px] text-amber-300 font-mono">
                    {customDurationMinutes} นาที (~{Math.round((customDurationMinutes / 60) * 10) / 10} ชม.)
                  </span>
                )}
              </label>
              <select
                value={durationMode}
                onChange={(e) => setDurationMode(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="3">~3 นาที (คลิปสั้น Reels / Shorts)</option>
                <option value="5">~5 นาที (มินิซีรีส์เข้มข้น)</option>
                <option value="15">~15 นาที (ตอนมาตรฐาน)</option>
                <option value="30">~30 นาที (ตอนพิเศษ / ครึ่งชั่วโมง)</option>
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
                    value={customDurationMinutes}
                    onChange={(e) => setCustomDurationMinutes(Math.max(1, Number(e.target.value)))}
                    placeholder="เช่น 90, 180, 240 นาที"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-studio-950 border border-amber-500/50 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-gray-400">นาที</span>
                </div>
              )}
            </div>

            {/* AI Engine */}
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold block flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Engine เขียนบท:
              </label>
              <select
                value={scriptEngine}
                onChange={(e) => setScriptEngine(e.target.value as ScriptEngine)}
                className="w-full px-2.5 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="gemini_3_1_pro">Google Gemini 3.1 Pro</option>
                <option value="gemini_3_8_flash">Google Gemini 3.8 Flash</option>
                <option value="gemini_flash_lite">Gemini 3.5 Flash-Lite</option>
              </select>
            </div>
          </div>

          {/* Character Scale Auto-detection Preview */}
          <div className="p-3 sm:p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    ขนาดตัวละครอัตโนมัติ (Story Scale):
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-extrabold">
                    {detectedScale.count} ตัวละคร
                  </span>
                  <span className="text-[11px] text-cyan-400 font-medium">
                    ({detectedScale.label})
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  💡 {detectedScale.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{loadingStep || 'กำลังสร้างสตูดิโอ...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-200" />
                  <span>🚀 สร้างสตูดิโอ &amp; วิเคราะห์ตัวละครอัตโนมัติ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
