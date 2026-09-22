'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Database, Sparkles, Github, ExternalLink, ShieldCheck, Users, LogIn, LogOut, User as UserIcon, Shield, Key } from 'lucide-react';
import { User } from '@/lib/types';
import LoginModal from './LoginModal';
import UserManagementModal from './UserManagementModal';
import OwnerSecurityModal from './OwnerSecurityModal';
import GeminiKeyModal from './GeminiKeyModal';

export const DEFAULT_OWNER_USER: User = {
  id: 'user-owner-yutthakan',
  username: 'yutthakan',
  displayName: 'ยุทธการ คำกลอน',
  role: 'owner',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  const [atlasStatus, setAtlasStatus] = useState<{
    connected: boolean;
    message: string;
    database?: string;
    bucket?: string;
    latencyMs?: number;
    loading: boolean;
  }>({
    connected: false,
    message: 'กำลังตรวจสอบการเชื่อมต่อ...',
    loading: true,
  });

  const [showDbModal, setShowDbModal] = useState(false);

  useEffect(() => {
    // Check Gemini API key
    const checkGeminiKey = () => {
      setHasGeminiKey(!!localStorage.getItem('studio_gemini_api_key'));
    };
    checkGeminiKey();
    window.addEventListener('gemini_key_change', checkGeminiKey);
    // Check saved user session (Do not auto-login without credentials)
    const checkUser = () => {
      const saved = localStorage.getItem('studio_current_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener('auth_change', checkUser);
    window.addEventListener('storage', checkUser);

    // Health check
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAtlasStatus({
          connected: data.connected,
          message: data.message,
          database: data.database,
          bucket: data.bucket,
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

    return () => {
      window.removeEventListener('gemini_key_change', checkGeminiKey);
      window.removeEventListener('auth_change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studio_current_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth_change'));
    setShowLoginModal(true);
  };

  const isOwnerUser =
    currentUser?.role === 'owner' ||
    currentUser?.displayName === 'ยุทธการ คำกลอน' ||
    currentUser?.username === 'yutthakan';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-studio-700/60 bg-studio-950/90 backdrop-blur-md">
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
                เขียนบท & เจนฉากภาพยนตร์และอนิเมะ 3D (SAN1 Style & Reels)
              </p>
            </div>
          </Link>

          {/* Right Status Badges & Nav */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* User Session Badge & Actions */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Badge */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    isOwnerUser
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'bg-studio-900 border-studio-700 text-gray-200'
                  }`}
                >
                  <span className="text-sm">{isOwnerUser ? '👑' : '👤'}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] leading-tight">
                      {isOwnerUser ? 'เจ้าของระบบ' : currentUser.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้งาน'}
                    </span>
                    <span className="text-xs font-bold text-white">{currentUser.displayName}</span>
                  </div>
                </div>

                {/* Owner Only: Actions */}
                {isOwnerUser && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                      title="จัดการผู้ใช้งานในระบบ (เฉพาะเจ้าของ)"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">จัดการผู้ใช้งาน</span>
                    </button>

                    <button
                      onClick={() => setShowSecurityModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      title="ความปลอดภัยบัญชีเจ้าของ: ผูกเบอร์โทรศัพท์และอีเมล"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ผูกเบอร์ & อีเมล</span>
                    </button>
                  </div>
                )}

                {/* Logout / Switch Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
                  title="ออกจากระบบ / สลับบัญชี"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-glow transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Gemini AI Key Status / Config */}
            <button
              onClick={() => setShowGeminiModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                hasGeminiKey
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
              }`}
              title={
                hasGeminiKey
                  ? 'Google Gemini AI เชื่อมต่อแล้ว (คลิกเพื่อดูหรือเปลี่ยนคีย์)'
                  : 'คลิกเพื่อใส่ Google Gemini API Key ฟรี'
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${hasGeminiKey ? 'text-cyan-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline font-medium">
                {hasGeminiKey ? 'Gemini AI (พร้อม)' : 'ตั้งค่า Gemini AI'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGeminiKey ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* MongoDB Atlas Status */}
            <button
              onClick={() => setShowDbModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                atlasStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
              }`}
              title={atlasStatus.message}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-medium">
                {atlasStatus.connected ? 'MongoDB Atlas' : 'In-Memory Ready'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  atlasStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Gemini API Key Modal */}
      <GeminiKeyModal
        isOpen={showGeminiModal}
        onClose={() => setShowGeminiModal(false)}
        onKeySaved={(key) => {
          setHasGeminiKey(!!key);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* User Management Modal (Owner Only) */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        currentUser={currentUser}
      />

      {/* Owner Security Modal (Phone / Email Binding) */}
      <OwnerSecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

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

              {/* Isolation Details */}
              <div className="bg-studio-950/90 p-3.5 rounded-xl border border-studio-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-studio-800/80 pb-2">
                  <span className="text-gray-400">ชื่อฐานข้อมูล (Database):</span>
                  <code className="text-emerald-400 font-mono font-semibold">
                    {atlasStatus.database || 'youtube_cinematic_donghua_studio'}
                  </code>
                </div>
                <div className="flex items-center justify-between border-b border-studio-800/80 pb-2">
                  <span className="text-gray-400">บักเก็ตจัดเก็บรูป (GridFS Bucket):</span>
                  <code className="text-cyan-400 font-mono font-semibold">
                    {atlasStatus.bucket || 'youtube_studio_media'}
                  </code>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-emerald-400 font-medium">
                  <span>ระบบสำรองความปลอดภัย (Fail-Safe):</span>
                  <span>✅ In-Memory &amp; Local พร้อมทำงาน 100% เสมอ</span>
                </div>
              </div>

              <div className="bg-studio-950/80 p-3.5 rounded-xl border border-studio-800 text-xs space-y-2">
                <p className="font-semibold text-gray-200">
                  วิธีแก้ปัญหา &quot;bad auth&quot; สีส้ม ให้เป็นสีเขียว:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>เปิดเว็บไซต์ MongoDB Atlas &rarr; เมนู Database Access ทางซ้าย</li>
                  <li>แก้ไขรหัสผ่านของ Database User ให้ตรงกับใน Connection String</li>
                  <li>ไปที่ Vercel Dashboard &rarr; Settings &rarr; Environment Variables</li>
                  <li>อัปเดตค่า <code className="text-amber-300">MONGODB_URI</code> ให้มีรหัสผ่านที่ถูกต้อง แล้วกด Redeploy</li>
                </ol>
              </div>
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
