'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ScriptScene, VisualMedium, StylePreset, CharacterBible, User as UserType } from '@/lib/types';
import SceneCard from '@/components/SceneCard';
import CharacterBibleModal from '@/components/CharacterBibleModal';
import VideoTimelinePlayer from '@/components/VideoTimelinePlayer';
import LoginModal from '@/components/LoginModal';
import MetaPackageModal from '@/components/MetaPackageModal';
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
  Lock,
  LogIn,
  Eye,
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

  // Meta Reels Master Package Modal (Seedream 5.0 Pro)
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // AI Script Generation in Studio
  const [generatingAct, setGeneratingAct] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Auth Gate
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const saved = localStorage.getItem('studio_current_user');
      if (saved) {
        try {
          const u = JSON.parse(saved);
          setCurrentUser(u);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    };

    checkUser();
    window.addEventListener('auth_change', checkUser);
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('auth_change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

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

  // Multi-type batch copy handler
  const [copyState, setCopyState] = useState<string | null>(null);

  const handleCopyType = (type: 'narration' | 'dialogues' | 'images' | 'videos' | 'flow' | 'full' | 'meta') => {
    if (!project) return;
    const targets = project.scenes
      .filter((s) => (selectedSceneIds.length > 0 ? selectedSceneIds.includes(s.id) : true))
      .sort((a, b) => a.sceneNumber - b.sceneNumber);

    if (targets.length === 0) {
      alert('ไม่มีฉากที่เลือก');
      return;
    }

    let output = '';

    const sanitizePrompt = (text?: string) => {
      if (!text) return '';
      return text
        .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
        .replace(/Seed Lock:[^\n]*\n?/gi, '')
        .replace(/\(Seed:[^\)]*\)/gi, '')
        .replace(/--seed\s+\d+/gi, '')
        .trim();
    };

    if (type === 'narration') {
      // Merged Narrations
      output = targets
        .map((s) => s.narration.trim())
        .filter(Boolean)
        .join('\n\n');
    } else if (type === 'dialogues') {
      // Merged Dialogues
      output = targets
        .map((s) => {
          if (!s.dialogues || s.dialogues.length === 0) return null;
          const diaLines = s.dialogues.map((d) => `${d.speaker} (${d.emotion}): "${d.text}"`).join('\n');
          return `[ฉากที่ ${s.sceneNumber}: ${s.title}]\n${diaLines}`;
        })
        .filter(Boolean)
        .join('\n\n');
    } else if (type === 'images') {
      // Merged Image prompts
      output = targets
        .map((s) => `[ฉากที่ ${s.sceneNumber}: ${s.title}]\n${s.imagePrompt}`)
        .join('\n\n');
    } else if (type === 'videos') {
      // Merged Video motion prompts (คลีน Seed Lock ออก เพื่อให้เจนวิดีโอไม่เพี้ยน)
      output = targets
        .map((s) => `[ฉากที่ ${s.sceneNumber}: ${s.title}]\n${sanitizePrompt(s.videoMotionPrompt)}`)
        .join('\n\n');
    } else if (type === 'flow') {
      // Merged Google Flow prompts (flow.google.com คลีน ไม่เพี้ยน)
      output = targets
        .map((s) => `[ฉากที่ ${s.sceneNumber}: ${s.title} - flow.google.com]\n${sanitizePrompt(s.googleFlowPrompt || s.imagePrompt)}`)
        .join('\n\n');
    } else if (type === 'meta') {
      // All-in-One Meta/Facebook Reels Production Package (บทพากย์ + ฉาก + บทพูด + SFX + พร้อมต์วิดีโอ + แฮชแท็ก)
      output = `🚀 รวมทุกอย่างสำหรับสร้างคลิปใน Meta / Facebook Reels เบ็ดเสร็จ\n`;
      output += `==========================================================\n`;
      output += `📌 ชื่อเรื่อง / แคปชันวิดีโอ: ${project.title}\n`;
      output += `📐 สัดส่วน: ${project.aspectRatio || '16:9'} (Reels / Shorts) | ความยาว: ~${targets.length * 10} วินาที (${targets.length} ฉาก @ 10 วิ/ฉาก)\n`;
      output += `🤖 AI Engine: ${project.scriptEngine || 'gemini_3_1_pro'} | โหมด: ${project.visualMedium === 'live_action' ? 'ภาพยนตร์คนจริง (Live-Action)' : 'อนิเมะ 3D'}\n\n`;

      output += `📖 [1. บทบรรยายสำหรับลงเสียงพากย์ / Voiceover (แบ่งฉากละ 10 วินาที / พากย์รวดเดียวจบ)]:\n`;
      output += `----------------------------------------------------------\n`;
      targets.forEach((s, idx) => {
        const startSec = idx * 10;
        const endSec = (idx + 1) * 10;
        const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
        const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
        output += `⏱️ [ฉากที่ ${s.sceneNumber} (${startMinStr} - ${endMinStr})]:\n${s.narration.trim()}\n\n`;
      });

      output += `🎬 [2. ไทม์ไลน์แจกแจงทีละฉาก (ลำดับภาพ + บทพูด + ซาวด์ SFX/BGM + พร้อมต์วิดีโอ)]:\n`;
      output += `----------------------------------------------------------\n`;
      targets.forEach((s, idx) => {
        const startSec = idx * 10;
        const endSec = (idx + 1) * 10;
        const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
        const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
        output += `[ฉากที่ ${s.sceneNumber}] (${startMinStr} - ${endMinStr}) : ${s.title}\n`;
        output += `🎙️ เสียงพากย์: ${s.narration}\n`;
        if (s.dialogues && s.dialogues.length > 0) {
          output += `💬 บทพูดตัวละคร:\n`;
          s.dialogues.forEach((d) => {
            output += `   • ${d.speaker} (${d.emotion}): "${d.text}"\n`;
          });
        }
        output += `🎥 มุมกล้อง & แสง: ${s.cameraMovement} | ${s.lighting}\n`;
        output += `🎵 ดนตรี BGM & เอฟเฟกต์เสียง SFX: ${s.sfxBgm}\n`;
        output += `📹 พร้อมต์เจนวิดีโอ AI (Kling/Runway/Haiper/Luma): ${sanitizePrompt(s.videoMotionPrompt)}\n`;
        output += `🌊 flow.google.com: ${sanitizePrompt(s.googleFlowPrompt || s.imagePrompt)}\n`;
        output += `\n`;
      });

      output += `💡 [3. เช็กลิสต์แนะนำสิ่งที่ต้องมีเพิ่มเติม เพื่อให้การสร้างอนิเมะ/หนังสมบูรณ์ครบเครื่อง]:\n`;
      output += `----------------------------------------------------------\n`;
      output += `1. 🎙️ เสียงพากย์ AI (Thai Voice Synthesis): แนะนำใช้ ElevenLabs (Multilingual v2) หรือ Fish Audio ปรับความเร็ว 1.05x-1.1x เพื่อให้จังหวะกระชับพอดี 10 วิ/ฉาก และใส่คีย์เวิร์ดอารมณ์ [anger/fierce/calm]\n`;
      output += `2. 🎬 เทคนิคต่อช็อตไหลลื่นไม่ตัด (Continuous Stitching): ใน Kling 1.5 หรือ Runway Gen-3 ให้ใช้ฟีเจอร์ "End Frame as Start Frame" นำเฟรมสุดท้ายของฉากที่ 1 ไปเป็นเฟรมเริ่มต้นของฉากที่ 2 จะได้วิดีโอแบบ Single Take ไหลลื่น 100%\n`;
      output += `3. 🎼 การมิกซ์เสียง BGM & SFX (CapCut / Premiere): วางดนตรีกู่เจิ้ง/ออร์เคสตราไว้ระดับ -16dB ถึง -18dB และเปิด Ducking หลบเสียงพากย์ที่ -3dB พร้อมใส่เสียง Sub-bass Drop (Braam) ในวินาทีที่ตัวเอกระเบิดพลัง\n`;
      output += `4. 🎨 คัลเลอร์เกรดดิ้ง (Color Grading): ใส่โทนสีสไตล์ Donghua Cinematic (Teal & Orange / Cyan Gold Glow) ดึงความเปรียบต่างแสงจันทร์และพลังปราณให้มีมิติสูงสุด\n\n`;

      output += `🏷️ [4. แฮชแท็กสำหรับโพสต์ลง Meta Reels / TikTok / CapCut]:\n`;
      if (project.genre === 'military_tactical') {
        output += `#Reels #ทหาร #ยุทธการทหาร #ขีปนาวุธ #กองทัพ #แสนยานุภาพ #อาวุธสงคราม #เทคโนโลยีทหาร #MilitaryReels #Shorts\n`;
      } else if (project.genre === 'xianxia_cultivation') {
        output += `#Reels #อนิเมะจีน3D #กำลังภายใน #เซียนกระบี่ #Donghua #SAN1 #อนิเมะ #Shorts #ซีรีส์จีน #Seedream\n`;
      } else {
        output += `#Reels #ภาพยนตร์AI #หนังไซไฟ #วิดีโอสั้น #Shorts #MetaReels #AIAnimation\n`;
      }
    } else if (type === 'full') {
      // Full Production Script
      output = `🎬 บทภาพยนตร์ / คลิปฉบับสมบูรณ์: ${project.title}\n`;
      output += `หมวดหมู่: ${project.genre} | สัดส่วน: ${project.aspectRatio || '16:9'} | AI Engine: ${project.scriptEngine || 'Google Gemini'}\n`;
      output += `รวม ${targets.length} ฉาก (ความยาวรวม ~${targets.length * 10} วินาที @ 10 วิ/ฉาก)\n\n`;
      output += `=== รายชื่อตัวละคร (Character Bible) ===\n`;
      project.characters.forEach((c) => {
        output += `- ${c.name} (${c.role}): ${c.appearanceAnchor}\n`;
      });
      output += `\n============================================\n\n`;
      targets.forEach((s) => {
        output += `=== [ฉากที่ ${s.sceneNumber}] (องค์ที่ ${s.actNumber}) : ${s.title} (10 วินาที) ===\n`;
        output += `🎥 ทิศทางกล้อง: ${s.cameraMovement}\n`;
        output += `💡 แสงเงา: ${s.lighting}\n`;
        output += `🎙️ บทบรรยายเสียงพากย์:\n${s.narration}\n`;
        if (s.dialogues && s.dialogues.length > 0) {
          output += `💬 บทสนทนาตัวละคร:\n`;
          s.dialogues.forEach((d) => {
            output += `  ${d.speaker} (${d.emotion}): "${d.text}"\n`;
          });
        }
        output += `🎵 เสียง/ดนตรี: ${s.sfxBgm}\n`;
        output += `🎨 Prompt ภาพ (Midjourney/Flux): ${s.imagePrompt}\n`;
        output += `📹 Prompt วิดีโอ (Kling/Runway): ${sanitizePrompt(s.videoMotionPrompt)}\n`;
        output += `🌊 flow.google.com: ${sanitizePrompt(s.googleFlowPrompt || s.imagePrompt)}\n\n`;
      });
    }

    navigator.clipboard.writeText(output);
    setCopyState(type);
    if (type === 'meta') {
      setIsMetaModalOpen(true);
    }
    setTimeout(() => setCopyState(null), 2200);
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

  // Auth Gatekeeper: Locked Screen if not logged in
  if (authChecked && !currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-cyan-500 p-0.5 mx-auto shadow-glow">
            <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              🔒 สตูดิโอระบบปิด (Private Studio)
            </span>
            <h2 className="text-2xl font-black text-white mt-2">กรุณาเข้าสู่ระบบก่อนเปิดสตูดิโอ</h2>
            <p className="text-xs text-gray-400 mt-1">
              โปรเจกต์นี้ถูกล็อคไว้เพื่อความปลอดภัย ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของหรือผู้ใช้ที่ได้รับอนุญาตก่อน
            </p>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบตอนนี้</span>
          </button>

          <div className="pt-1">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              &larr; กลับไปหน้าหลัก
            </Link>
          </div>

          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setShowLoginModal(false);
            }}
          />
        </div>
      </div>
    );
  }

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

      {/* Multi-Scene Sequential Aggregator & Action Panel (แผงรวมฉากที่เลือก & รวมสคริปต์ 1 คลิก) */}
      <div className="p-5 rounded-3xl bg-studio-900/95 border border-amber-500/40 backdrop-blur-md space-y-4 shadow-2xl">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-studio-950 border border-studio-700 text-xs font-bold text-gray-200 hover:border-amber-400 transition-colors"
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
              <span className="font-semibold">รวมฉากที่เลือก:</span>{' '}
              <strong className="text-amber-400 text-sm">
                {selectedSceneIds.length > 0 ? selectedSceneIds.length : filteredScenes.length}
              </strong>{' '}
              ฉาก{' '}
              <span className="text-gray-400">
                (ความยาวรวม ~{(selectedSceneIds.length > 0 ? selectedSceneIds.length : filteredScenes.length) * 10} วินาที @ 10 วิ/ฉาก)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Play Button */}
            <button
              type="button"
              onClick={() => setIsTimelinePlayerOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                {selectedSceneIds.length > 0
                  ? `เล่นภาพต่อเนื่องที่เลือก (${selectedSceneIds.length * 10} วิ)`
                  : `เล่นภาพต่อเนื่องทุกฉาก (${project.scenes.length * 10} วิ)`}
              </span>
            </button>

            {/* Batch AI Image Generator */}
            <button
              type="button"
              onClick={handleBatchGenerateImages}
              disabled={batchGenerating || (selectedSceneIds.length === 0 && filteredScenes.length === 0)}
              className="px-4 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Sparkles className={`w-3.5 h-3.5 ${batchGenerating ? 'animate-spin' : ''}`} />
              <span>
                {batchGenerating
                  ? `กำลังวาดภาพ (${batchProgress.current}/${batchProgress.total})...`
                  : '✨ วาดภาพ AI ทุกฉากที่เลือก'}
              </span>
            </button>
          </div>
        </div>

        {/* Sequential Scenes Badges Strip (แสดงฉากที่เลือกเรียงต่อกัน 1, 2, 3...) */}
        {selectedSceneIds.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              ลำดับฉากที่ถูกเลือก (Sequential Flow):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pr-2">
              {project.scenes
                .filter((s) => selectedSceneIds.includes(s.id))
                .sort((a, b) => a.sceneNumber - b.sceneNumber)
                .map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-studio-950 border border-studio-800 text-[11px] font-semibold text-gray-200 whitespace-nowrap"
                  >
                    <span className="text-amber-400 font-bold">#{s.sceneNumber}</span>
                    <span className="truncate max-w-[120px]">{s.title}</span>
                    {idx < selectedSceneIds.length - 1 && (
                      <span className="text-gray-600 ml-1">&rarr;</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Meta Reels All-in-One Feature Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              handleCopyType('meta');
              setIsMetaModalOpen(true);
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-between transition-all group border border-cyan-400/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/15 text-cyan-200 shadow-inner">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white text-sm sm:text-base">
                    🚀 รวมทุกอย่างสำหรับสร้างคลิปใน Meta เบ็ดเสร็จ (เปิดดูบนเว็บ)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 text-[10px] font-bold border border-cyan-400/40">
                    Seedream 5.0 Pro (10s ไหลลื่น)
                  </span>
                </div>
                <p className="text-[11px] text-cyan-100 font-normal mt-0.5">
                  (เปิดหน้าต่างสตูดิโอ: บทพากย์ 10 วิ + ไทม์ไลน์ภาพยนตร์ + บทพูด + ซาวด์แยก BGM/SFX + เช็กลิสต์แนะนำระดับโปร)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/20 group-hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
              {copyState === 'meta' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-300">เปิดดู &amp; คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>เปิดดู &amp; คัดลอก</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* 6 1-Click Batch Copier Buttons Grid */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
            📋 คัดลอกแยกหมวดหมู่ย่อย (1-Click Batch Copier):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* 1. Voiceover Narration */}
            <button
              type="button"
              onClick={() => handleCopyType('narration')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-amber-950/30 border border-studio-800 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-0.5">
                <span>🎙️ บทบรรยายรวม</span>
                {copyState === 'narration' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'narration' ? '✅ คัดลอกสำเร็จ!' : 'รวมเสียงพากย์สำหรับบอทอ่าน'}
              </p>
            </button>

            {/* 2. Character Dialogues */}
            <button
              type="button"
              onClick={() => handleCopyType('dialogues')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-cyan-950/30 border border-studio-800 hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-0.5">
                <span>💬 บทสนทนารวม</span>
                {copyState === 'dialogues' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'dialogues' ? '✅ คัดลอกสำเร็จ!' : 'รวมคำพูดทุกตัวละคร'}
              </p>
            </button>

            {/* 3. Image Prompts */}
            <button
              type="button"
              onClick={() => handleCopyType('images')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-amber-950/30 border border-studio-800 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-0.5">
                <span>🎨 พร้อมต์ภาพรวม</span>
                {copyState === 'images' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-300" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'images' ? '✅ คัดลอกสำเร็จ!' : 'สำหรับ Midjourney / Flux'}
              </p>
            </button>

            {/* 4. Video Motion Prompts */}
            <button
              type="button"
              onClick={() => handleCopyType('videos')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-cyan-950/30 border border-studio-800 hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-0.5">
                <span>🎥 พร้อมต์วิดีโอรวม</span>
                {copyState === 'videos' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-300" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'videos' ? '✅ คัดลอกสำเร็จ!' : 'สำหรับ Kling / Runway Gen-3'}
              </p>
            </button>

            {/* 5. Google Flow Prompts with Seed */}
            <button
              type="button"
              onClick={() => handleCopyType('flow')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-emerald-950/30 border border-studio-800 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-0.5">
                <span>🌊 flow.google.com</span>
                {copyState === 'flow' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'flow' ? '✅ คัดลอกสำเร็จ!' : 'ล็อคหน้าตาตัวละครด้วย Seed'}
              </p>
            </button>

            {/* 6. Full Production Script */}
            <button
              type="button"
              onClick={() => handleCopyType('full')}
              className="p-2.5 rounded-xl bg-studio-950 hover:bg-purple-950/30 border border-studio-800 hover:border-purple-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-0.5">
                <span>📄 สคริปต์ฉบับเต็ม</span>
                {copyState === 'full' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400" />
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                {copyState === 'full' ? '✅ คัดลอกสำเร็จ!' : 'ครบทุกมุมกล้อง, แสง, คิวเสียง'}
              </p>
            </button>
          </div>
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

      {/* Sticky Floating Bottom Bar for Quick Batch Actions when scenes are selected */}
      {selectedSceneIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-studio-950/95 border border-amber-500/50 rounded-2xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-lg flex items-center gap-3 max-w-[95vw] overflow-x-auto animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 border-r border-studio-800 pr-3 text-xs whitespace-nowrap">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
              {selectedSceneIds.length}
            </span>
            <span className="text-gray-200 font-medium">ฉากที่เลือก</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyType('narration')}
              className="px-3 py-1.5 rounded-xl bg-studio-900 hover:bg-amber-950 border border-studio-700 hover:border-amber-500 text-amber-300 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              {copyState === 'narration' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyState === 'narration' ? 'คัดลอกแล้ว!' : 'คัดลอกบทบรรยาย'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyType('flow')}
              className="px-3 py-1.5 rounded-xl bg-studio-900 hover:bg-emerald-950 border border-studio-700 hover:border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              {copyState === 'flow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyState === 'flow' ? 'คัดลอกแล้ว!' : 'คัดลอก flow.google'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTimelinePlayerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 whitespace-nowrap transition-colors shadow-glow"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>เล่นภาพ ({selectedSceneIds.length * 10} วิ)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSceneIds([])}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-studio-800 transition-colors"
              title="ยกเลิกการเลือก"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Character Bible Modal */}
      <CharacterBibleModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        characters={project.characters}
        projectId={project.id}
        visualMedium={project.visualMedium}
        stylePreset={project.stylePreset}
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

      {/* Meta Reels Master Package Modal (Seedream 5.0 Pro) */}
      <MetaPackageModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        project={project}
        selectedSceneIds={selectedSceneIds}
      />
    </div>
  );
}
