'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ScriptScene, VisualMedium, StylePreset, CharacterBible } from '@/lib/types';
import SceneCard from '@/components/SceneCard';
import CharacterBibleModal from '@/components/CharacterBibleModal';
import VideoTimelinePlayer from '@/components/VideoTimelinePlayer';
import {
  Film,
  Sparkles,
  Save,
  User,
  Download,
  ArrowLeft,
  Clock,
  Palette,
  Plus,
  Layers,
  Database,
  CheckCircle,
  PlayCircle,
  CheckSquare,
  Square,
  Play,
  Copy,
  Check,
} from 'lucide-react';

export default function ProjectStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Act Filter
  const [selectedAct, setSelectedAct] = useState<number | 'all'>('all');
  
  // Multi-scene Selection for Video Stitching & Batch Generation
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [isTimelinePlayerOpen, setIsTimelinePlayerOpen] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchCopied, setBatchCopied] = useState(false);

  // Character Bible Modal
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);

  // AI Script Generation in Studio
  const [generatingAct, setGeneratingAct] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Fetch Project
  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.project) {
          setProject(data.project);
        } else {
          router.push('/');
        }
      })
      .catch((err) => {
        console.error('Error loading project:', err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [projectId, router]);

  // Save Project to MongoDB Atlas
  const handleSave = async (projectToSave?: Project) => {
    const target = projectToSave || project;
    if (!target) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // Update Single Scene
  const handleUpdateScene = (updatedScene: ScriptScene) => {
    if (!project) return;
    const updatedScenes = project.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s));
    const updatedProject = { ...project, scenes: updatedScenes };
    setProject(updatedProject);
  };

  // Delete Scene
  const handleDeleteScene = (sceneId: string) => {
    if (!project) return;
    if (!confirm('ต้องการลบฉากนี้ใช่หรือไม่?')) return;
    const updatedScenes = project.scenes.filter((s) => s.id !== sceneId);
    setProject({ ...project, scenes: updatedScenes });
  };

  // Add New Scene Manually
  const handleAddScene = () => {
    if (!project) return;
    const act = typeof selectedAct === 'number' ? (selectedAct as 1 | 2 | 3 | 4) : 1;
    const nextNum = project.scenes.length + 1;

    const newScene: ScriptScene = {
      id: `scene-${Date.now()}-${nextNum}`,
      sceneNumber: nextNum,
      actNumber: act,
      title: `ฉากที่ ${nextNum}: ฉากใหม่`,
      narration: '',
      dialogues: [],
      sfxBgm: '[BGM: บรรเลงตามอารมณ์ฉาก]',
      characterIds: project.characters.map((c) => c.id),
      visualMedium: project.visualMedium,
      stylePreset: project.stylePreset,
      cameraMovement: 'Cinematic medium tracking shot',
      lighting: 'Atmospheric cinematic lighting',
      imagePrompt: '',
      videoMotionPrompt: '',
      negativePrompt: '',
      estimatedDurationSec: 30,
      createdAt: new Date().toISOString(),
    };

    setProject({ ...project, scenes: [...project.scenes, newScene] });
  };

  // Switch Visual Medium (Live-Action vs Animation)
  const handleToggleMedium = async (newMedium: VisualMedium) => {
    if (!project) return;
    const newStyle: StylePreset = newMedium === 'live_action' ? 'hollywood_cinematic' : 'donghua_3d';

    const updatedProject: Project = {
      ...project,
      visualMedium: newMedium,
      stylePreset: newStyle,
    };
    setProject(updatedProject);
    handleSave(updatedProject);
  };

  // Generate Script for Current Act via AI
  const handleGenerateActScript = async () => {
    if (!project) return;
    const actToGenerate = typeof selectedAct === 'number' ? selectedAct : 1;

    setGeneratingAct(true);
    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          synopsis: project.synopsis,
          genre: project.genre,
          visualMedium: project.visualMedium,
          stylePreset: project.stylePreset,
          targetDurationMinutes: project.targetDurationMinutes,
          actNumber: actToGenerate,
          characters: project.characters,
          apiKey: apiKeyInput,
          customInstructions: customAiPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.scenes) {
        // Replace or append scenes for this act
        const otherActsScenes = project.scenes.filter((s) => s.actNumber !== actToGenerate);
        const mergedScenes = [...otherActsScenes, ...data.scenes].sort(
          (a, b) => a.sceneNumber - b.sceneNumber
        );

        const updatedProject = { ...project, scenes: mergedScenes };
        setProject(updatedProject);
        handleSave(updatedProject);
        alert(`เจนบทองค์ที่ ${actToGenerate} สำเร็จ! (${data.source || 'AI'})`);
      }
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingAct(false);
    }
  };

  // Toggle selection for a scene
  const handleToggleSelectScene = (sceneId: string) => {
    setSelectedSceneIds((prev) =>
      prev.includes(sceneId) ? prev.filter((id) => id !== sceneId) : [...prev, sceneId]
    );
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    if (selectedSceneIds.length === filteredScenes.length) {
      setSelectedSceneIds([]);
    } else {
      setSelectedSceneIds(filteredScenes.map((s) => s.id));
    }
  };

  // Batch Generate Images for all selected scenes
  const handleBatchGenerateImages = async () => {
    if (!project || selectedSceneIds.length === 0) {
      alert('กรุณาติ๊กเลือกฉากที่ต้องการสร้างภาพก่อน');
      return;
    }

    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: selectedSceneIds.length });

    let updatedScenes = [...project.scenes];

    for (let i = 0; i < selectedSceneIds.length; i++) {
      const sceneId = selectedSceneIds[i];
      const targetScene = updatedScenes.find((s) => s.id === sceneId);
      if (!targetScene) continue;

      setBatchProgress({ current: i + 1, total: selectedSceneIds.length });

      try {
        const res = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneId: targetScene.id,
            projectId: project.id,
            prompt: targetScene.imagePrompt || targetScene.title,
            visualMedium: project.visualMedium,
            stylePreset: project.stylePreset,
          }),
        });
        const data = await res.json();
        if (data.success && data.mediaUrl) {
          updatedScenes = updatedScenes.map((s) =>
            s.id === sceneId
              ? { ...s, mediaFileId: data.fileId, mediaUrl: data.mediaUrl }
              : s
          );
          setProject({ ...project, scenes: updatedScenes });
        }
      } catch (err) {
        console.error('Batch image error for scene:', sceneId, err);
      }
    }

    const finalProject = { ...project, scenes: updatedScenes };
    setProject(finalProject);
    await handleSave(finalProject);
    setBatchGenerating(false);
    alert('สร้างภาพสำหรับทุกฉากที่เลือกเรียบร้อยแล้ว และส่งเข้าคลาวด์ Atlas ทันที!');
  };

  // Copy merged script of selected scenes
  const handleCopySelectedMerged = () => {
    if (!project) return;
    const targets = project.scenes.filter((s) => selectedSceneIds.includes(s.id));
    if (targets.length === 0) return;

    let merged = `🎬 รวมฉากและวิดีโอต่อเนื่อง (${targets.length} ฉาก, ฉากละ 10 วินาที รวม ${targets.length * 10} วินาที)\n`;
    merged += `เรื่อง: ${project.title}\n\n`;

    targets.forEach((s) => {
      merged += `=== [ฉากที่ ${s.sceneNumber}] (10 วินาที) : ${s.title} ===\n`;
      merged += `มุมกล้อง: ${s.cameraMovement}\n`;
      merged += `แสงเงา: ${s.lighting}\n`;
      merged += `บทบรรยาย: ${s.narration}\n`;
      if (s.dialogues.length > 0) {
        merged += `บทสนทนา:\n`;
        s.dialogues.forEach((d) => {
          merged += `  - ${d.speaker} (${d.emotion}): "${d.text}"\n`;
        });
      }
      merged += `คำสั่งวิดีโอต่อเนื่อง: ${s.videoMotionPrompt}\n\n`;
    });

    navigator.clipboard.writeText(merged);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2000);
  };

  // Word Count & Duration Metrics (ปรับเป็น 10 วินาทีต่อฉากตามที่ผู้ใช้กำหนด!)
  const metrics = useMemo(() => {
    if (!project) return { totalWords: 0, totalSeconds: 0, durationMinutes: 0, progressPercent: 0 };
    let totalText = '';
    project.scenes.forEach((s) => {
      totalText += s.narration + ' ';
      s.dialogues.forEach((d) => {
        totalText += d.text + ' ';
      });
    });

    const words = Math.round(totalText.replace(/\s+/g, '').length / 4); // Thai word approx
    const totalSeconds = project.scenes.length * 10; // ฉากละ 10 วินาที!
    const durationMinutes = Math.round((totalSeconds / 60) * 10) / 10;
    const progressPercent = Math.min(100, Math.round((durationMinutes / (project.targetDurationMinutes || 60)) * 100));

    return { totalWords: words, totalSeconds, durationMinutes, progressPercent };
  }, [project]);

  // Filter scenes by selected act
  const filteredScenes = useMemo(() => {
    if (!project) return [];
    if (selectedAct === 'all') return project.scenes;
    return project.scenes.filter((s) => s.actNumber === selectedAct);
  }, [project, selectedAct]);

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        กำลังโหลดสตูดิโอและข้อมูลจาก MongoDB Atlas...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-studio-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-400 hover:text-white hover:bg-studio-800 transition-colors"
            title="กลับสู่แดชบอร์ด"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                className="font-extrabold text-lg sm:text-xl text-white bg-transparent border-b border-transparent hover:border-studio-700 focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400">
              {project.genre === 'xianxia_cultivation'
                ? '⚔️ สไตล์ อนิเมะจีน 3D กำลังภายใน (เพื่อนที่ดีที่สุด SAN1)'
                : `🎬 หมวดหมู่: ${project.genre}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Visual Medium Switcher: Real vs Cartoon */}
          <div className="flex items-center bg-studio-900 border border-studio-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => handleToggleMedium('animation')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                project.visualMedium === 'animation'
                  ? 'bg-amber-500 text-black shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎨 การ์ตูน/อนิเมะ 3D
            </button>
            <button
              onClick={() => handleToggleMedium('live_action')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                project.visualMedium === 'live_action'
                  ? 'bg-cyan-400 text-black shadow-cyanGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎬 ภาพยนตร์คนจริง
            </button>
          </div>

          {/* Character Bible Button */}
          <button
            onClick={() => setIsCharModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-300 hover:text-white hover:border-studio-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>สมุดคุมตัวละคร ({project.characters.length})</span>
          </button>

          {/* Export Button */}
          <Link
            href={`/project/${projectId}/export`}
            className="px-3 py-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-300 hover:text-white hover:border-studio-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>ส่งออกสคริปต์</span>
          </Link>

          {/* Save Button */}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              savedSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-glow'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>บันทึกลงคลาวด์แล้ว!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Duration Tracker for "รันชั่วโมง" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-gray-200">
              เวลาเล่าเรื่องจริง: ~{metrics.durationMinutes} นาที
            </span>
            <span className="text-gray-400">
              / เป้าหมายคลิป: {project.targetDurationMinutes} นาที (&quot;รันชั่วโมง&quot;)
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <span>คำภาษาไทยทั้งหมด: <strong className="text-white">{metrics.totalWords} คำ</strong></span>
            <span>จำนวนฉากทั้งหมด: <strong className="text-white">{project.scenes.length} ฉาก</strong></span>
            <span className="text-amber-400 font-bold">{metrics.progressPercent}% สำเร็จ</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full bg-studio-950 border border-studio-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Act Navigator Tabs ("รันชั่วโมง" 4 องค์) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-studio-900 border border-studio-800 rounded-2xl text-xs">
          {[
            { id: 1, label: 'องค์ที่ 1: ปูเรื่อง & จุดพลิกผัน (0-15 น.)' },
            { id: 2, label: 'องค์ที่ 2: ผจญภัย & ฝึกวิชา (15-30 น.)' },
            { id: 3, label: 'องค์ที่ 3: มหาสงคราม & ศัตรูแกร่ง (30-45 น.)' },
            { id: 4, label: 'องค์ที่ 4: ไคลแม็กซ์ & ทิ้งปม (45-60+ น.)' },
            { id: 'all', label: 'แสดงทุกองค์ (ทั้งหมด)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAct(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
                selectedAct === tab.id
                  ? 'bg-amber-500 text-black shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-studio-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddScene}
          className="px-4 py-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มฉากในองค์นี้</span>
        </button>
      </div>

      {/* AI Act Writer Studio Box */}
      {typeof selectedAct === 'number' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-studio-900 via-studio-950 to-studio-900 border border-amber-500/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-white">
                AI สตูดิโอเขียนบทประจำ องค์ที่ {selectedAct}
              </span>
              <span className="text-[11px] text-gray-400">
                (สร้างบทบรรยาย + บทสนทนาตัวละคร + พร้อมต์ต่อเนื่อง 4 ฉาก)
              </span>
            </div>

            <button
              onClick={handleGenerateActScript}
              disabled={generatingAct}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generatingAct ? 'animate-spin' : ''}`} />
              <span>{generatingAct ? 'AI กำลังคิดบท...' : `เขียนบท AI องค์ที่ ${selectedAct}`}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-8">
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="คำสั่งพิเศษสำหรับองค์นี้ (เช่น: เน้นให้พระเอกสู้กับจอมอสูรอย่างดุเดือด, มีฉากเปิดตัวกระบี่วิเศษ...)"
                className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Gemini API Key (ไม่ใส่ก็ใช้ Template ได้)"
                className="w-full px-3 py-2 rounded-xl bg-studio-950 border border-studio-800 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-Scene Selection & Action Bar (ติ๊กเลือกฉากรวมวิดีโอ & สร้างภาพ AI) */}
      <div className="p-4 rounded-2xl bg-studio-900/90 border border-amber-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-studio-950 border border-studio-700 text-xs font-semibold text-gray-200 hover:border-amber-400 transition-colors"
          >
            {selectedSceneIds.length === filteredScenes.length && filteredScenes.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>ยกเลิกเลือกทั้งหมด</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-gray-400" />
                <span>เลือกทุกฉาก ({filteredScenes.length} ฉาก)</span>
              </>
            )}
          </button>

          <div className="text-xs text-gray-300">
            เลือกแล้ว: <strong className="text-amber-400">{selectedSceneIds.length}</strong> ฉาก{' '}
            <span className="text-gray-500">
              (รวมเวลา {selectedSceneIds.length * 10} วินาที @ 10 วิ/ฉาก)
            </span>
          </div>
        </div>

        {/* Action Buttons for Selected Scenes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Play Video Sequence (10s per scene) */}
          <button
            type="button"
            onClick={() => setIsTimelinePlayerOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>
              {selectedSceneIds.length > 0
                ? `เล่นรวมฉากที่เลือก (${selectedSceneIds.length * 10} วิ)`
                : `เล่นรวมทุกฉาก (${project.scenes.length * 10} วิ)`}
            </span>
          </button>

          {/* Button: Batch AI Image Generation */}
          <button
            type="button"
            onClick={handleBatchGenerateImages}
            disabled={batchGenerating || selectedSceneIds.length === 0}
            className="px-3.5 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Sparkles className={`w-3.5 h-3.5 ${batchGenerating ? 'animate-spin' : ''}`} />
            <span>
              {batchGenerating
                ? `กำลังสร้างภาพ (${batchProgress.current}/${batchProgress.total})...`
                : 'สร้างภาพ AI ทุกฉากที่เลือก'}
            </span>
          </button>

          {/* Button: Copy Merged Prompts */}
          {selectedSceneIds.length > 0 && (
            <button
              type="button"
              onClick={handleCopySelectedMerged}
              className="px-3 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {batchCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>รวมคำสั่งฉากที่เลือก</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Scenes List */}
      <div className="space-y-6">
        {filteredScenes.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-studio-800 p-6 space-y-3">
            <p className="text-gray-400 text-sm">ยังไม่มีฉากในองค์นี้</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleGenerateActScript}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
              >
                เขียนบทด้วย AI
              </button>
              <button
                onClick={handleAddScene}
                className="px-4 py-2 bg-studio-800 text-white text-xs rounded-xl"
              >
                เพิ่มฉากด้วยตนเอง
              </button>
            </div>
          </div>
        ) : (
          filteredScenes.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              characters={project.characters}
              visualMedium={project.visualMedium}
              stylePreset={project.stylePreset}
              genre={project.genre}
              projectId={project.id}
              isSelected={selectedSceneIds.includes(scene.id)}
              onToggleSelect={() => handleToggleSelectScene(scene.id)}
              onUpdate={handleUpdateScene}
              onDelete={handleDeleteScene}
            />
          ))
        )}
      </div>

      {/* Character Bible Modal */}
      <CharacterBibleModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        characters={project.characters}
        onSaveCharacters={(chars) => {
          const updated = { ...project, characters: chars };
          setProject(updated);
          handleSave(updated);
        }}
      />

      {/* Video Timeline & Storyboard Player Modal (10 วินาที/ฉาก) */}
      <VideoTimelinePlayer
        isOpen={isTimelinePlayerOpen}
        onClose={() => setIsTimelinePlayerOpen(false)}
        selectedScenes={
          selectedSceneIds.length > 0
            ? project.scenes.filter((s) => selectedSceneIds.includes(s.id))
            : project.scenes
        }
        projectTitle={project.title}
      />
    </div>
  );
}
