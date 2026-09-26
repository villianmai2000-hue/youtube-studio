'use client';

import React, { useState, useEffect } from 'react';
import { ScriptScene } from '@/lib/types';
import { cleanSceneTitle } from '@/lib/script-templates';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Clock,
  Video,
  MessageSquare,
  Copy,
  Check,
  Volume2,
} from 'lucide-react';

interface VideoTimelinePlayerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScenes: ScriptScene[];
  projectTitle: string;
}

export default function VideoTimelinePlayer({
  isOpen,
  onClose,
  selectedScenes,
  projectTitle,
}: VideoTimelinePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(0);
  const [copied, setCopied] = useState(false);

  const SCENE_DURATION = 10; // 10 วินาทีต่อฉาก

  const currentScene = selectedScenes[currentIndex];
  const totalDuration = selectedScenes.length * SCENE_DURATION;

  // Clean prompt helper
  const cleanVideoPrompt = (prompt?: string) => {
    if (!prompt) return '';
    return prompt
      .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
      .replace(/Seed Lock:[^\n]*\n?/gi, '')
      .replace(/\(Seed:[^\)]*\)/gi, '')
      .replace(/--seed\s+\d+/gi, '')
      .trim();
  };

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgressSec(0);
      setIsPlaying(true);
    }
  }, [isOpen, selectedScenes.length]);

  // Playback timer (10 วินาทีต่อฉาก)
  useEffect(() => {
    if (!isOpen || !isPlaying || selectedScenes.length === 0) return;

    const interval = setInterval(() => {
      setProgressSec((prev) => {
        if (prev + 0.5 >= SCENE_DURATION) {
          // Move to next scene or loop
          setCurrentIndex((idx) => {
            if (idx + 1 < selectedScenes.length) {
              return idx + 1;
            } else {
              setIsPlaying(false);
              return 0;
            }
          });
          return 0;
        }
        return prev + 0.5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, selectedScenes.length, currentIndex]);

  if (!isOpen || selectedScenes.length === 0) return null;

  const handleNext = () => {
    if (currentIndex + 1 < selectedScenes.length) {
      setCurrentIndex(currentIndex + 1);
      setProgressSec(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgressSec(0);
    }
  };

  // Copy merged script of selected scenes (พร้อมสร้างวิดีโอ & บทพูดตัวละคร เรียงตามลำดับ)
  const handleCopyMergedScript = () => {
    let merged = `🎬 รวมฉากและวิดีโอต่อเนื่อง (${selectedScenes.length} ฉาก, รวมเวลา ${totalDuration} วินาที)\n`;
    merged += `เรื่อง: ${projectTitle}\n`;
    merged += `=======================================================\n\n`;

    selectedScenes.forEach((s) => {
      merged += `[ฉากที่ ${s.sceneNumber}]: ${cleanSceneTitle(s.title)}\n`;
      if (s.narration) {
        merged += `🎙️ บทเล่าเรื่อง / เสียงพากย์:\n${s.narration.trim()}\n\n`;
      }
      if (s.imagePrompt) {
        merged += `🎨 พร้อมสร้างภาพ:\n${s.imagePrompt}\n\n`;
      }
      merged += `📹 พร้อมสร้างวิดีโอ:\n${cleanVideoPrompt(s.videoMotionPrompt)}\n\n`;
      if (s.dialogues && s.dialogues.length > 0) {
        merged += `💬 บทสนทนาตัวละคร:\n`;
        s.dialogues.forEach((d) => {
          merged += `  • ${d.speaker || 'ตัวละคร'} (${d.emotion || 'ปกติ'}): "${d.text || ''}"\n`;
        });
        merged += `\n`;
      }
      if (s.sfxBgm) {
        merged += `🎵 ดนตรี & ซาวด์: ${s.sfxBgm}\n`;
      }
      merged += `-------------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(merged);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-950 border border-studio-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-studio-900 border-b border-studio-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>เล่นรวมฉากและวิดีโอต่อเนื่อง</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                  {SCENE_DURATION} วินาที/ฉาก
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                ฉากที่เลือก {currentIndex + 1} จาก {selectedScenes.length} ฉาก (รวมเวลาทั้งหมด {totalDuration} วินาที)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMergedScript}
              className="px-3 py-1.5 rounded-xl bg-studio-800 hover:bg-studio-700 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-studio-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">คัดลอกฉากรวมแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>คัดลอกสคริปต์ฉากรวม</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-studio-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Area (16:9 Aspect Ratio) */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {currentScene.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentScene.mediaUrl}
              alt={currentScene.title}
              className="w-full h-full object-cover animate-fade-in transition-all duration-700 scale-105"
            />
          ) : (
            /* Card Center: พร้อมสร้างวิดีโอ (ตัดพร้อมสร้างภาพออกตามคำขอ) */
            <div className="p-6 text-center space-y-3 max-w-lg w-full">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-glow">
                <Video className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white leading-snug">
                {cleanSceneTitle(currentScene.title)}
              </h4>
              <div className="text-left bg-studio-900/90 p-3.5 rounded-2xl border border-cyan-500/30 space-y-1 shadow-inner">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  📹 พร้อมสร้างวิดีโอ (Video Motion):
                </span>
                <p className="text-xs text-cyan-100 font-sans leading-relaxed line-clamp-3 select-all">
                  {cleanVideoPrompt(currentScene.videoMotionPrompt) || 'ยังไม่มีคำสั่งสร้างวิดีโอ'}
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/30">
                ⏱️ ฉากนี้เล่น {SCENE_DURATION} วินาที
              </span>
            </div>
          )}

          {/* Top Overlays: Scene Info & Timer */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              ฉากที่ {currentScene.sceneNumber}: {cleanSceneTitle(currentScene.title)}
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/10">
              ⏱️ {Math.round(progressSec)}s / {SCENE_DURATION}s
            </span>
          </div>

          {/* Bottom Overlay: พร้อมสร้างวิดีโอขึ้นก่อน แล้วตามด้วยบทพูดตัวละคร ต่อไป */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2 pointer-events-none">
            {/* SFX / BGM Banner */}
            {currentScene.sfxBgm && (
              <div className="inline-block px-3 py-1 rounded-lg bg-purple-950/80 backdrop-blur-sm border border-purple-500/30 text-[11px] text-purple-300">
                <Volume2 className="w-3 h-3 inline mr-1" />
                {currentScene.sfxBgm}
              </div>
            )}

            {/* Video Prompt & Character Dialogue Box */}
            <div className="p-3.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 text-left shadow-2xl space-y-2 pointer-events-auto">
              {/* 1. พร้อมสร้างวิดีโอขึ้นก่อน */}
              <div className="bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30 text-left">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                  📹 พร้อมสร้างวิดีโอ:
                </span>
                <p className="text-xs sm:text-sm text-cyan-200 font-medium leading-relaxed drop-shadow select-all">
                  {cleanVideoPrompt(currentScene.videoMotionPrompt) || 'คำสั่งสร้างวิดีโอสำหรับฉากนี้'}
                </p>
              </div>

              {/* 2. บทพูดตัวละคร ต่อไป */}
              {currentScene.dialogues && currentScene.dialogues.length > 0 && (
                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-amber-400" /> บทสนทนาตัวละคร (Character Dialogues):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {currentScene.dialogues.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        className="px-2.5 py-1 rounded-lg bg-studio-900/90 border border-amber-500/30 text-xs text-white"
                      >
                        <strong className="text-amber-400">{d.speaker}</strong> ({d.emotion}): &ldquo;{d.text}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="p-4 sm:p-5 bg-studio-900 border-t border-studio-800 space-y-3">
          {/* Progress Bar for Current Scene (10 วินาที) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>เวลาของฉากนี้: {Math.round(progressSec)} วินาที</span>
              <span>กำหนดฉากละ: {SCENE_DURATION} วินาที</span>
            </div>
            <div className="w-full h-2 rounded-full bg-studio-950 border border-studio-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                style={{ width: `${(progressSec / SCENE_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Sequence Thumbnails Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            {selectedScenes.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgressSec(0);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-left transition-all border ${
                  idx === currentIndex
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                    : 'bg-studio-950 border-studio-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="text-[10px] font-bold text-amber-400">ฉาก {s.sceneNumber}</div>
                <div className="text-xs font-semibold truncate max-w-[120px]">{cleanSceneTitle(s.title)}</div>
              </button>
            ))}
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl bg-studio-800 text-gray-300 hover:text-white hover:bg-studio-700 disabled:opacity-40 transition-colors"
                title="ฉากก่อนหน้า"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-glow transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" />
                    <span>หยุดชั่วคราว</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>เล่นต่อ ({SCENE_DURATION} วิ/ฉาก)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === selectedScenes.length - 1}
                className="p-2.5 rounded-xl bg-studio-800 text-gray-300 hover:text-white hover:bg-studio-700 disabled:opacity-40 transition-colors"
                title="ฉากถัดไป"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>ความยาวรวม {totalDuration} วินาที ({(totalDuration / 60).toFixed(1)} นาที)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
