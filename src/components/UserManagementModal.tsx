'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Edit3, Check, X, AlertCircle, CheckCircle, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
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

  // Add User Form states (Focused strictly on Username & Password)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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
          username: username.trim(),
          password: password.trim(),
          displayName: username.trim(), // Defaults display name to username
          role: 'creator',
          requesterRole: currentUser?.role || 'owner',
          requesterName: currentUser?.displayName || 'ยุทธการ คำกลอน',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`เพิ่มผู้ใช้ "${username}" เรียบร้อยแล้ว!`);
        setUsername('');
        setPassword('');
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

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    setEditPassword('');
    setShowEditPassword(false);
    setError('');
    setSuccessMsg('');
  };

  const handleSaveEdit = async (userId: string) => {
    setEditLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          username: editUsername.trim(),
          password: editPassword.trim() || undefined,
          displayName: editUsername.trim(),
          requesterRole: currentUser?.role || 'owner',
          requesterName: currentUser?.displayName || 'ยุทธการ คำกลอน',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`แก้ไขข้อมูลผู้ใช้ "${editUsername}" เรียบร้อยแล้ว!`);
        setEditingUserId(null);
        fetchUsers();
      } else {
        setError(data.error || 'ไม่สามารถแก้ไขผู้ใช้งานได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'owner' || user.username === 'yutthakan' || user.displayName === 'ยุทธการ คำกลอน') {
      alert('ไม่สามารถลบเจ้าของระบบได้');
      return;
    }

    if (!confirm(`คุณต้องการลบผู้ใช้ "@${user.username}" ออกจากระบบหรือไม่?`)) {
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
        setSuccessMsg(`ลบผู้ใช้ "${user.username}" เรียบร้อยแล้ว`);
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glow">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">จัดการผู้ใช้งานในระบบ</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                สิทธิ์เฉพาะเจ้าของ: ยุทธการ คำกลอน
              </span>
            </div>
            <p className="text-xs text-gray-400">
              กำหนดและแก้ไขเฉพาะ <strong className="text-amber-300">ชื่อผู้ใช้ (Username)</strong> และ <strong className="text-amber-300">รหัสผ่าน (Password)</strong>
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

        {/* Form to Add User (Only Username and Password) */}
        <div className="bg-studio-950/80 border border-studio-800 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>เพิ่มผู้ใช้งานใหม่เข้าสู่สตูดิโอ (กำหนดชื่อผู้ใช้และรหัสผ่าน)</span>
          </h3>
          <form onSubmit={handleAddUser} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  ชื่อผู้ใช้สำหรับล็อกอิน (Username) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น somchai_editor"
                    className="w-full pl-9 pr-3.5 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  รหัสผ่าน (Password) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่านสำหรับคนนี้"
                    className="w-full pl-9 pr-10 py-2 bg-studio-900 border border-studio-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
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

        {/* Existing Users Table with Edit Username / Password */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
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

                const isEditingThisUser = editingUserId === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSystemOwner
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-studio-950/60 border-studio-800 hover:border-studio-700'
                    }`}
                  >
                    {!isEditingThisUser ? (
                      /* Display Mode */
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSystemOwner
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-studio-800 text-gray-300'
                            }`}
                          >
                            {isSystemOwner ? '👑' : u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">@{u.username}</span>
                              {isSystemOwner ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  เจ้าของระบบ (ยุทธการ คำกลอน)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                                  ผู้ใช้งาน
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {u.createdBy && <span>เพิ่มโดย: {u.createdBy}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isSystemOwner && (
                            <>
                              <button
                                onClick={() => handleStartEdit(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 border border-studio-700 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors"
                                title="แก้ไขชื่อผู้ใช้และรหัสผ่าน"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>แก้ไข</span>
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                                title="ลบผู้ใช้นี้ออกจากระบบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isSystemOwner && (
                            <span className="text-[11px] text-amber-400/80 font-medium px-2 py-1">
                              เจ้าของถาวร
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode: Edit Username and Password */
                      <div className="space-y-3 p-1">
                        <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pb-1 border-b border-studio-800">
                          <span>แก้ไขชื่อผู้ใช้และรหัสผ่านสำหรับ: @{u.username}</span>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            ยกเลิก
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400 block mb-1">
                              ชื่อผู้ใช้ใหม่ (Username):
                            </label>
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full px-3 py-1.5 bg-studio-900 border border-studio-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-gray-400 block mb-1">
                              รหัสผ่านใหม่ (ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน):
                            </label>
                            <div className="relative">
                              <input
                                type={showEditPassword ? 'text' : 'password'}
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="ใส่รหัสผ่านใหม่"
                                className="w-full pl-3 pr-9 py-1.5 bg-studio-900 border border-studio-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowEditPassword(!showEditPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showEditPassword ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            disabled={editLoading}
                            onClick={() => handleSaveEdit(u.id)}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 shadow-glow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{editLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
                          </button>
                        </div>
                      </div>
                    )}
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
