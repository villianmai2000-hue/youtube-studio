'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Key,
} from 'lucide-react';
import GeminiKeyModal from './GeminiKeyModal';
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
import { analyzeStoryTheme } from '@/lib/theme-detector';

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

  // Character Count: Auto-detect vs Custom Count
  const [characterCountMode, setCharacterCountMode] = useState<'auto' | 'custom'>('auto');
  const [customCharacterCount, setCustomCharacterCount] = useState<number>(10);

  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [showGeminiKeyModal, setShowGeminiKeyModal] = useState(false);
  const [manualCultureLock, setManualCultureLock] = useState(false);
  const [autoDetectedTheme, setAutoDetectedTheme] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState('');

  // ตรวจสอบ Gemini API Key เมื่อเปิดโมดอล
  useEffect(() => {
    if (isOpen) {
      const key = localStorage.getItem('studio_gemini_api_key');
      setHasGeminiKey(!!key);
    }
  }, [isOpen]);

  // ตรวจจับแนวเรื่องอัตโนมัติจากชื่อเรื่องและเรื่องย่อด้วย Theme Detector อัจฉริยะ
  useEffect(() => {
    if (manualCultureLock) return;
    if (!title.trim() && !synopsis.trim()) {
      setAutoDetectedTheme('');
      return;
    }

    const theme = analyzeStoryTheme({ title, synopsis });
    if (theme.themeKey !== 'general_fantasy' || theme.isHorrorOrGhost || theme.isThaiMyth || theme.isCultivation || theme.isPirateOrAdventure || theme.isSciFi || theme.isMilitary) {
      setWorldCulture(theme.effectiveCulture);
      setSelectedSubGenre(theme.effectiveSubGenre);
      if (theme.effectiveCulture === 'thai' || theme.isHorrorOrGhost) {
        setStylePreset('donghua_3d');
      } else if (theme.isAnimeOrJapan) {
        setStylePreset('anime_2d');
      } else if (theme.isWesternCinema) {
        setStylePreset('hollywood_cinematic');
      }
      setAutoDetectedTheme(`${theme.themeEmoji} ตรวจพบ: ${theme.themeNameTh}`);
    } else {
      setAutoDetectedTheme('');
    }
  }, [title, synopsis, manualCultureLock]);

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
    setManualCultureLock(true);
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
      setSelectedSubGenre('ghosts_spirits_th');
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

    const apiKey = localStorage.getItem('studio_gemini_api_key') || '';

    // วิเคราะห์แก่นเรื่องและวัฒนธรรมที่แท้จริงด้วย Theme Detector
    const theme = analyzeStoryTheme({
      title,
      synopsis,
      worldCulture,
      subGenre: selectedSubGenre,
    });

    const effectiveGenre = theme.effectiveGenre;
    const effectiveCulture = manualCultureLock ? worldCulture : theme.effectiveCulture;
    const effectiveSubGenre = manualCultureLock ? selectedSubGenre : theme.effectiveSubGenre;

    const finalCharacterCount =
      characterCountMode === 'auto'
        ? detectedScale.count
        : Math.max(1, customCharacterCount);

    setLoadingStep(`🤖 AI กำลังวิเคราะห์เนื้อเรื่องและออกแบบตัวละคร ${finalCharacterCount} ตัวให้ตรงตามพล็อต...`);

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
            worldCulture: effectiveCulture,
            genre: effectiveGenre,
            subGenre: effectiveSubGenre,
            visualMedium,
            stylePreset,
            characterCount: finalCharacterCount,
            apiKey,
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
          synopsis:
            synopsis ||
            `${title} - มหากาพย์เรื่องราวในแดน${theme.themeNameTh}`,
          genre: effectiveGenre,
          worldCulture: effectiveCulture,
          subGenre: effectiveSubGenre,
          visualMedium,
          stylePreset,
          aspectRatio,
          scriptEngine,
          targetDurationMinutes: durationMode === 'custom' ? customDurationMinutes : Number(durationMode),
          characterCount: finalCharacterCount,
          characters,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        // Dual-layer backup to browser localStorage
        try {
          localStorage.setItem(`studio_project_${data.project.id}`, JSON.stringify(data.project));
          const cachedList = JSON.parse(localStorage.getItem('studio_cached_projects') || '[]');
          const updatedList = [data.project, ...cachedList.filter((p: any) => p.id !== data.project.id)];
          localStorage.setItem('studio_cached_projects', JSON.stringify(updatedList));
        } catch (storageErr) {
          console.warn('LocalStorage backup warning:', storageErr);
        }

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

        {/* Gemini API Key Status Banner */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-studio-950/70 border border-studio-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-gray-300">
              {hasGeminiKey ? (
                <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  เชื่อมต่อ Google Gemini AI (ตัวจริง) พร้อมเขียนบทและสร้างตัวละครตรงปก 100%
                </span>
              ) : (
                <span className="text-amber-300">
                  ⚠️ ยังไม่ได้ตั้งค่า Gemini API Key (ระบบจะใช้เอนจินอัจฉริยะในตัว)
                </span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowGeminiKeyModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-studio-800 hover:bg-studio-700 text-cyan-300 text-[11px] font-semibold border border-studio-700 transition-colors"
          >
            <Key className="w-3 h-3 text-cyan-400" />
            <span>{hasGeminiKey ? 'แก้ไข Key' : '🔑 ใส่ Gemini Key ฟรี'}</span>
          </button>
        </div>

        {/* Auto-detected Theme Banner */}
        {autoDetectedTheme && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium">{autoDetectedTheme}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
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

          {/* Character Scale & Custom Count Selection */}
          <div className="p-3 sm:p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>ระบบสร้างตัวละคร (Character Ensemble Engine)</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    เลือกให้อนุมัติสร้างตามเนื้อเรื่องอัตโนมัติ หรือกำหนดจำนวนเองได้ตามใจชอบ
                  </p>
                </div>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1 p-1 bg-studio-950 border border-studio-800 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCharacterCountMode('auto')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    characterCountMode === 'auto'
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🤖 อัตโนมัติ ({detectedScale.count} ตัว)
                </button>
                <button
                  type="button"
                  onClick={() => setCharacterCountMode('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    characterCountMode === 'custom'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ✏️ กำหนดจำนวนเอง
                </button>
              </div>
            </div>

            {characterCountMode === 'auto' ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-studio-900/80 border border-studio-800 text-xs gap-2">
                <div>
                  <span className="text-cyan-300 font-bold">{detectedScale.label}:</span>{' '}
                  <span className="text-gray-300">{detectedScale.reason}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/30 whitespace-nowrap">
                  {detectedScale.count} ตัวละคร
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-studio-900/80 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-xs text-amber-300 font-bold block">
                      ต้องการสร้างตัวละครกี่ตัว (ใส่เลขได้เท่าไหร่ก็ได้):
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      💡 AI จะสร้างตัวละครครบ 11 มิติ พร้อมบทพูดและจัดสรรฉากให้ทุกคน
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customCharacterCount}
                      onChange={(e) => setCustomCharacterCount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-20 px-3 py-1.5 rounded-xl bg-studio-950 border border-amber-500/50 text-amber-300 font-extrabold text-center text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                    <span className="text-xs text-amber-200 font-bold">ตัว</span>
                  </div>
                </div>

                {/* Quick Selection Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-studio-800/80">
                  <span className="text-[10px] text-gray-400 mr-1">ตัวเลือกยอดนิยม:</span>
                  {[3, 5, 8, 10, 12, 16, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCustomCharacterCount(n)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                        customCharacterCount === n
                          ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                          : 'bg-studio-950 text-gray-300 border-studio-800 hover:border-studio-700'
                      }`}
                    >
                      {n} ตัว {n === 10 ? '🏴‍☠️ วันพีช' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

      {/* Gemini Key Config Modal */}
      <GeminiKeyModal
        isOpen={showGeminiKeyModal}
        onClose={() => setShowGeminiKeyModal(false)}
        onKeySaved={(k) => setHasGeminiKey(!!k)}
      />
    </div>
  );
}
