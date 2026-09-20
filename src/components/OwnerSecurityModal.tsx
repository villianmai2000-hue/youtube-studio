'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Mail, Lock, CheckCircle2, AlertCircle, X, Save } from 'lucide-react';

interface OwnerSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (phone: string, email: string) => void;
}

export default function OwnerSecurityModal({ isOpen, onClose, onUpdated }: OwnerSecurityModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [requesterPassword, setRequesterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      setError('');
      setSuccessMsg('');
      fetch('/api/auth/security')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPhoneNumber(data.ownerPhone || '0962033005');
            setEmail(data.ownerEmail || 'yutthakan2000@gmail.com');
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          requesterPassword: requesterPassword.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'บันทึกข้อมูลความปลอดภัยสำเร็จ!');
        setRequesterPassword('');
        if (onUpdated) onUpdated(data.phoneNumber, data.email);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.error || 'ไม่สามารถอัปเดตข้อมูลได้ รหัสผ่านอาจไม่ถูกต้อง');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 p-0.5 shadow-glow">
            <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">ความปลอดภัยบัญชีเจ้าของระบบ</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                สิทธิ์สูงสุด
              </span>
            </div>
            <p className="text-xs text-gray-400">
              ผูกเบอร์โทรศัพท์และอีเมลเพื่อป้องกันการโดนแฮก และใช้กู้คืนรหัสผ่านได้ทันที
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>เบอร์โทรศัพท์มือถือที่ผูกไว้ (สำหรับกู้คืนรหัสผ่าน)</span>
            </label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="เช่น 0962033005"
              className="w-full px-3.5 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              *หากลืมรหัสผ่าน สามารถกรอกเบอร์นี้เพื่อตั้งรหัสผ่านใหม่ได้ทันที
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>อีเมลเจ้าของระบบ (สำหรับแจ้งเตือนและกันโดนแฮก)</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="เช่น yutthakan2000@gmail.com"
              className="w-full px-3.5 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="pt-2 border-t border-studio-800">
            <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>ใส่รหัสผ่านปัจจุบันของคุณยุทธการเพื่อยืนยันการแก้ไข</span>
            </label>
            <input
              type="password"
              required
              value={requesterPassword}
              onChange={(e) => setRequesterPassword(e.target.value)}
              placeholder="รหัสผ่านเจ้าของปัจจุบัน (0962033005Maiiam2000)"
              className="w-full px-3.5 py-2.5 bg-studio-950 border border-studio-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={loading || fetching}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลความปลอดภัย'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
