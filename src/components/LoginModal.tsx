'use client';

import React, { useState } from 'react';
import { Lock, User, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('studio_current_user', JSON.stringify(data.user));
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const fillOwnerCredentials = () => {
    setIdentifier('ยุทธการ คำกลอน');
    setPassword('0962033005Maiiam2000');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-md w-full p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          ✕
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-cyan-500 p-0.5 mx-auto shadow-glow">
            <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white">เข้าสู่ระบบสตูดิโอ</h2>
          <p className="text-xs text-gray-400">
            CINEMA &amp; DONGHUA AI STUDIO &bull; ระบบความปลอดภัยส่วนบุคคล
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ชื่อผู้ใช้งาน หรือ ชื่อเจ้าของระบบ
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="เช่น ยุทธการ คำกลอน"
                className="w-full pl-10 pr-4 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ใส่รหัสผ่านของคุณ"
                className="w-full pl-10 pr-4 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
          </button>
        </form>

        {/* Quick Owner Fill Button */}
        <div className="mt-5 pt-4 border-t border-studio-800 text-center">
          <button
            type="button"
            onClick={fillOwnerCredentials}
            className="text-xs text-amber-400/90 hover:text-amber-300 hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <span>👑 คลิกใส่ข้อมูลเจ้าของระบบอัตโนมัติ (ยุทธการ คำกลอน)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
