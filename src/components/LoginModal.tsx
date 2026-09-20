'use client';

import React, { useState } from 'react';
import { Lock, User, ShieldCheck, LogIn, AlertCircle, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Recovery Mode with 2-Step OTP
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // OTP Countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('studio_current_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth_change'));
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

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) {
      setError('กรุณากรอกเบอร์โทรศัพท์หรืออีเมลที่ผูกไว้');
      return;
    }
    setRecoveryLoading(true);
    setError('');
    setRecoverySuccess('');

    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', recoveryInput: recoveryInput.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setMaskedTarget(data.maskedTarget || recoveryInput);
        setActiveOtpCode(data.otpCode || '');
        setOtpCountdown(300); // 5 minutes
        setRecoverySuccess(data.message || 'ส่งรหัส OTP เรียบร้อยแล้ว');
      } else {
        setError(data.error || 'เบอร์โทรศัพท์หรืออีเมลนี้ไม่ตรงกับข้อมูลในระบบ');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการขอรหัส OTP');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setRecoveryLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          recoveryInput: recoveryInput.trim(),
          otpCode: otpCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecoverySuccess('ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่สำเร็จแล้ว!');
        setTimeout(() => {
          setIsRecoveryMode(false);
          setOtpSent(false);
          setPassword(newPassword);
          setRecoverySuccess('');
        }, 2200);
      } else {
        setError(data.error || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการยืนยันรหัส OTP');
    } finally {
      setRecoveryLoading(false);
    }
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
              {isRecoveryMode ? <KeyRound className="w-7 h-7 text-cyan-400" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isRecoveryMode ? 'กู้คืนรหัสผ่านเจ้าของระบบ' : 'เข้าสู่ระบบสตูดิโอ'}
          </h2>
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

        {recoverySuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{recoverySuccess}</span>
          </div>
        )}

        {!isRecoveryMode ? (
          /* Normal Login Form */
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
                  placeholder="เช่น ยุทธการ คำกลอน หรือ yutthakan"
                  className="w-full pl-10 pr-4 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setError('');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  ลืมรหัสผ่าน? (กู้คืนบัญชี)
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ใส่รหัสผ่านของคุณ"
                  className="w-full pl-10 pr-11 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 transition-colors"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </form>
        ) : !otpSent ? (
          /* Password Recovery Step 1: Request OTP */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-gray-300 leading-relaxed">
              กรุณากรอก <strong>เบอร์โทรศัพท์</strong> หรือ <strong>อีเมล</strong> ของคุณที่ผูกไว้กับบัญชีเจ้าของระบบ เพื่อขอรับรหัส OTP 6 หลักสำหรับตั้งรหัสผ่านใหม่
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                เบอร์โทรศัพท์ หรือ อีเมลที่ผูกไว้
              </label>
              <input
                type="text"
                required
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์ หรือ อีเมลของคุณ"
                className="w-full px-4 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  setError('');
                }}
                className="px-4 py-2.5 rounded-xl bg-studio-800 hover:bg-studio-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-glow transition-all"
              >
                {recoveryLoading ? 'กำลังส่งรหัส OTP...' : '📲 ขอรับรหัส OTP (Send OTP)'}
              </button>
            </div>
          </form>
        ) : (
          /* Password Recovery Step 2: Verify OTP & Set New Password */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
              <p className="font-semibold mb-1">
                ส่งรหัส OTP ไปที่: <span className="font-mono text-amber-300">{maskedTarget}</span>
              </p>
              {activeOtpCode && (
                <div className="mt-2 p-2 rounded-lg bg-black/60 border border-cyan-500/40 text-[11px] text-cyan-300">
                  <div className="flex items-center justify-between">
                    <span>📲 รหัส OTP ยืนยันตัวตน:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">{activeOtpCode}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                    <span>(รหัสมีอายุ 5 นาที)</span>
                    <span className="text-amber-300 font-mono">
                      เหลือเวลา: {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')} นาที
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                รหัส OTP 6 หลัก
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="กรอกรหัส 6 หลัก"
                className="w-full text-center tracking-[0.4em] font-mono text-lg font-bold px-4 py-2 bg-studio-950 border border-studio-700 rounded-xl text-amber-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                รหัสผ่านใหม่ที่ต้องการตั้ง
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                  className="w-full pl-4 pr-11 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 transition-colors"
                  title={showNewPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>เปลี่ยนเบอร์ / อีเมล</span>
              </button>

              <button
                type="button"
                disabled={recoveryLoading || otpCountdown > 240}
                onClick={handleRequestOtp}
                className="text-cyan-400 hover:text-cyan-300 disabled:text-gray-600 hover:underline transition-colors"
              >
                ขอรหัสใหม่อีกครั้ง {otpCountdown > 240 ? `(${300 - otpCountdown}s)` : ''}
              </button>
            </div>

            <button
              type="submit"
              disabled={recoveryLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs shadow-glow transition-all"
            >
              {recoveryLoading ? 'กำลังบันทึกรหัสผ่านใหม่...' : '🔐 ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
