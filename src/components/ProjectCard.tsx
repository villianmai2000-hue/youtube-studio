'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Film, Clock, User, ArrowRight, Trash2, Layers, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onSequelClick?: (project: Project) => void;
}

export default function ProjectCard({ project, onDelete, onSequelClick }: ProjectCardProps) {
  const isDonghua = project.genre === 'xianxia_cultivation';
  const isLiveAction = project.visualMedium === 'live_action';

  // Calculate estimated duration from scenes
  const totalDurationSec = project.scenes.reduce((sum, s) => sum + (s.estimatedDurationSec || 0), 0);
  const durationMin = Math.round(totalDurationSec / 60);

  const getGenreBadge = () => {
    switch (project.genre) {
      case 'xianxia_cultivation':
        return { label: '⚔️ บำเพ็ญเพียร 3D', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' };
      case 'action_scifi':
        return { label: '🚀 ไซไฟ / แอ็กชัน', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' };
      case 'epic_fantasy':
        return { label: '🐉 แฟนตาซีมหากาพย์', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' };
      case 'horror_thriller':
        return { label: '👻 สยองขวัญ / ระทึกขวัญ', color: 'border-red-500/40 bg-red-500/10 text-red-300' };
      case 'mystery_noir':
        return { label: '🕵️ ฟิล์มนัวร์ / สืบสวน', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' };
      case 'historical_war':
        return { label: '🏛️ สงครามประวัติศาสตร์', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' };
      default:
        return { label: '🎬 ภาพยนตร์', color: 'border-gray-500/40 bg-gray-500/10 text-gray-300' };
    }
  };

  const badge = getGenreBadge();

  return (
    <div className="group relative rounded-2xl bg-studio-900 border border-studio-800 hover:border-studio-700 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Accent */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isLiveAction
            ? 'from-cyan-500 to-blue-600'
            : 'from-amber-500 via-amber-400 to-purple-600'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
              {badge.label}
            </span>
            {project.partNumber && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border border-amber-500/40 bg-amber-500/20 text-amber-300">
                ภาคที่ {project.partNumber}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLiveAction
                  ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                  : 'border-purple-500/30 bg-purple-950/40 text-purple-300'
              }`}
            >
              {isLiveAction ? '🎬 คนจริง (Live-Action)' : '🎨 การ์ตูน/อนิเมะ'}
            </span>
            <span className="text-[11px] text-gray-400 ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              เป้าหมาย: {project.targetDurationMinutes} น.
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Synopsis */}
          <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {project.synopsis || 'ไม่มีเรื่องย่อ'}
          </p>
        </div>

        {/* Stats Row */}
        <div className="pt-3 border-t border-studio-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-studio-950/60 p-2 rounded-xl border border-studio-800">
            <span className="text-gray-400 text-[10px] block">จำนวนฉาก</span>
            <span className="font-bold text-white text-sm">{project.scenes.length} ฉาก</span>
          </div>
          <div className="bg-studio-950/60 p-2 rounded-xl border border-studio-800">
            <span className="text-gray-400 text-[10px] block">เวลาพากย์จริง</span>
            <span className="font-bold text-amber-400 text-sm">~{durationMin} นาที</span>
          </div>
          <div className="bg-studio-950/60 p-2 rounded-xl border border-studio-800">
            <span className="text-gray-400 text-[10px] block">ตัวละคร</span>
            <span className="font-bold text-cyan-400 text-sm">{project.characters.length} คน</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(project.id);
            }}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
            title="ลบโปรเจกต์นี้อย่างถาวร"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onSequelClick && (
            <button
              onClick={() => onSequelClick(project)}
              className="py-2 px-3 rounded-xl bg-studio-800 hover:bg-studio-700 text-amber-300 border border-studio-700 hover:border-amber-400 text-xs font-semibold flex items-center gap-1 transition-all"
              title="สร้างภาคต่อสืบทอดตัวละครเดิม 100%"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ภาคต่อ</span>
            </button>
          )}

          <Link
            href={`/project/${project.id}`}
            className="flex-1 py-2 px-3.5 rounded-xl bg-studio-800 hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group-hover:bg-amber-500 group-hover:text-black shadow-sm text-center truncate"
          >
            <span>เข้า Studio</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
