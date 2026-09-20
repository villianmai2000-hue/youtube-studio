'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, UserCheck, AlertCircle, CheckCircle, X } from 'lucide-react';
import { User } from '@/lib/types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export default function UserManagementModal({ isOpen, onClose, currentUser }: UserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'creator' | 'admin'>('creator');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        setError(data.error || 'ไม่สามารถโหลดรายชื่อผู้ใช้งานได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          displayName,
          role,
          requesterRole: currentUser?.role || 'owner',
          requesterName: currentUser?.displayName || 'ยุทธการ คำกลอน',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`เพิ่มผู้ใช้ "${displayName}" เรียบร้อยแล้ว!`);
        setUsername('');
        setPassword('');
        setDisplayName('');
        fetchUsers();
      } else {
        setError(data.error || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'owner' || user.username === 'yutthakan' || user.displayName === 'ยุทธการ คำกลอน') {
      alert('ไม่สามารถลบเจ้าของระบบได้');
      return;
    }

    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.displayName}" (@${user.username}) ออกจากระบบหรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/auth/users?id=${encodeURIComponent(user.id)}&requesterRole=${encodeURIComponent(
          currentUser?.role || 'owner'
        )}&requesterName=${encodeURIComponent(currentUser?.displayName || 'ยุทธการ คำกลอน')}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`ลบผู้ใช้ "${user.displayName}" เรียบร้อยแล้ว`);
        fetchUsers();
      } else {
        setError(data.error || 'ไม่สามารถลบผู้ใช้งานได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">จัดการผู้ใช้งานในระบบ</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                สิทธิ์เฉพาะเจ้าของ
              </span>
            </div>
            <p className="text-xs text-gray-400">
              เจ้าของระบบ: <strong className="text-amber-300">คุณยุทธการ คำกลอน</strong> &bull; กำหนดว่าใครสามารถเข้าใช้สตูดิโอนี้ได้
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
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form to Add User */}
        <div className="bg-studio-950/80 border border-studio-800 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>เพิ่มผู้ใช้งานใหม่เข้าสู่สตูดิโอ</span>
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  ชื่อ-นามสกุล / ชื่อที่แสดง <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี (ทีมตัดต่อ)"
                  className="w-full px-3.5 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  ชื่อผู้ใช้สำหรับล็อกอิน (Username) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น somchai_editor"
                  className="w-full px-3.5 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  รหัสผ่าน (Password) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="เช่น Somchai#2026"
                  className="w-full px-3.5 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  สิทธิ์การใช้งาน (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="creator">ผู้สร้างคลิป / ผู้เขียนบท (Creator)</option>
                  <option value="admin">ผู้ดูแลร่วม (Admin)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'กำลังบันทึก...' : 'อนุมัติเพิ่มผู้ใช้'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Users Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>รายชื่อผู้มีสิทธิ์เข้าใช้งาน ({users.length} คน)</span>
            </h3>
            <button
              onClick={fetchUsers}
              className="text-[11px] text-gray-400 hover:text-white underline"
            >
              รีเฟรชรายชื่อ
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="text-center py-6 text-xs text-gray-400">กำลังโหลดรายชื่อ...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">ไม่มีผู้ใช้อื่นในระบบ</div>
            ) : (
              users.map((u) => {
                const isSystemOwner =
                  u.role === 'owner' ||
                  u.displayName === 'ยุทธการ คำกลอน' ||
                  u.username === 'yutthakan';

                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isSystemOwner
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-studio-950/60 border-studio-800 hover:border-studio-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSystemOwner
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-studio-800 text-gray-300'
                        }`}
                      >
                        {isSystemOwner ? '👑' : u.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{u.displayName}</span>
                          {isSystemOwner && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              เจ้าของระบบ (Owner)
                            </span>
                          )}
                          {!isSystemOwner && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                              {u.role === 'admin' ? 'ผู้ดูแล' : 'ผู้สร้างคลิป'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                          <span>ชื่อผู้ใช้: @{u.username}</span>
                          {u.createdBy && <span>&bull; เพิ่มโดย: {u.createdBy}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isSystemOwner ? (
                        <span className="text-[11px] text-amber-400/80 font-medium px-2 py-1">
                          เจ้าของถาวร
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                          title="ลบผู้ใช้นี้ออกจากระบบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
