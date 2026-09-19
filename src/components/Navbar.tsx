'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Database, Sparkles, Github, ExternalLink, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const [atlasStatus, setAtlasStatus] = useState<{
    connected: boolean;
    message: string;
    latencyMs?: number;
    loading: boolean;
  }>({
    connected: false,
    message: 'กำลังตรวจสอบการเชื่อมต่อ...',
    loading: true,
  });

  const [showDbModal, setShowDbModal] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAtlasStatus({
          connected: data.connected,
          message: data.message,
          latencyMs: data.latencyMs,
          loading: false,
        });
      })
      .catch(() => {
        setAtlasStatus({
          connected: false,
          message: 'Local fallback mode',
          loading: false,
        });
      });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-studio-700/60 bg-studio-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-cyan-500 p-0.5 shadow-glow">
              <div className="w-full h-full bg-studio-950 rounded-[10px] flex items-center justify-center">
                <Film className="w-5 h-5 text-studio-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg bg-gradient-to-r from-amber-300 via-yellow-100 to-cyan-300 bg-clip-text text-transparent">
                  CINEMA & DONGHUA
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI Studio
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                เขียนบท & เจนฉากภาพยนตร์และอนิเมะ 3D (SAN1 Style)
              </p>
            </div>
          </Link>

          {/* Right Status Badges & Nav */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* MongoDB Atlas Status */}
            <button
              onClick={() => setShowDbModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                atlasStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
              }`}
              title={atlasStatus.message}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">
                {atlasStatus.connected ? 'MongoDB Atlas' : 'MongoDB Local'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  atlasStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {atlasStatus.latencyMs !== undefined && (
                <span className="text-[10px] text-gray-400 hidden md:inline">
                  {atlasStatus.latencyMs}ms
                </span>
              )}
            </button>

            {/* Vercel & GitHub Badges */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-studio-850 border border-studio-700 text-gray-300">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">
                Vercel Ready
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-studio-800 rounded-lg transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Database Info Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">การเชื่อมต่อ MongoDB Atlas Cloud</h3>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <div
                className={`p-3 rounded-xl border ${
                  atlasStatus.connected
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                }`}
              >
                <p className="font-semibold text-xs uppercase tracking-wider">สถานะปัจจุบัน:</p>
                <p className="mt-1 text-sm">{atlasStatus.message}</p>
              </div>

              <div className="bg-studio-950/80 p-3.5 rounded-xl border border-studio-800 text-xs space-y-2">
                <p className="font-semibold text-gray-200">
                  วิธีการเชื่อมต่อ MongoDB Atlas Cloud (เพื่อเก็บรูปและบทลง Atlas ทันที):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>ไปที่ MongoDB Atlas (mongodb.com) และสร้าง Free Cluster (M0)</li>
                  <li>คลิก &quot;Connect&quot; &rarr; &quot;Drivers&quot; &rarr; Copy Connection String</li>
                  <li>เปิดไฟล์ <code className="text-amber-300">.env.local</code> ในโปรเจกต์</li>
                  <li>ใส่ URI ในตัวแปร <code className="text-amber-300">MONGODB_URI=...</code></li>
                </ol>
              </div>

              <p className="text-xs text-gray-400">
                *ไฟล์รูปภาพที่อัปโหลดจะถูกส่งเข้า <strong>MongoDB Atlas GridFS</strong> ทันทีตามที่ระบุไว้
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-studio-800 hover:bg-studio-700 text-white rounded-lg text-sm transition-colors"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
