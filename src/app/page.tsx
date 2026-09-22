'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, User } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import NewProjectModal from '@/components/NewProjectModal';
import CreateSequelModal from '@/components/CreateSequelModal';
import LoginModal from '@/components/LoginModal';
import {
  Sparkles,
  Plus,
  Film,
  Video,
  Database,
  Layers,
  Zap,
  CheckCircle2,
  BookOpen,
  Eye,
  EyeOff,
  Sliders,
  Lock,
  LogIn,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Gate Form State
  const [gateIdentifier, setGateIdentifier] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateShowPass, setGateShowPass] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sequelTargetProject, setSequelTargetProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      let serverProjects: Project[] = [];
      if (data.success && Array.isArray(data.projects)) {
        serverProjects = data.projects;
      }

      // Check localStorage cached projects
      const cachedStr = typeof window !== 'undefined' ? localStorage.getItem('studio_cached_projects') : null;
      let cachedProjects: Project[] = [];
      if (cachedStr) {
        try {
          cachedProjects = JSON.parse(cachedStr);
        } catch {
          // ignore
        }
      }

      // Merge server and local projects with intelligent timestamp comparison (Newest updatedAt wins!)
      const projectMap = new Map<string, Project>();
      const projectsToResyncToServer: Project[] = [];

      // 1. Put all cached local projects first
      cachedProjects.forEach((p) => {
        if (p && p.id) projectMap.set(p.id, p);
      });

      // 2. Merge server projects
      serverProjects.forEach((sp) => {
        if (!sp || !sp.id) return;
        const local = projectMap.get(sp.id);
        if (!local) {
          projectMap.set(sp.id, sp);
        } else {
          const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
          const serverTime = sp.updatedAt ? new Date(sp.updatedAt).getTime() : 0;
          if (serverTime >= localTime) {
            projectMap.set(sp.id, sp);
          } else {
            // Local version in browser is NEWER than server! Keep local and flag to resync to server
            projectMap.set(sp.id, local);
            projectsToResyncToServer.push(local);
          }
        }
      });

      // 3. Also check individual localStorage keys (e.g. studio_project_${id}) in case user edited directly
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('studio_project_')) {
            try {
              const single = JSON.parse(localStorage.getItem(key) || '');
              if (single && single.id) {
                const current = projectMap.get(single.id);
                if (!current) {
                  projectMap.set(single.id, single);
                  projectsToResyncToServer.push(single);
                } else {
                  const singleTime = single.updatedAt ? new Date(single.updatedAt).getTime() : 0;
                  const currentTime = current.updatedAt ? new Date(current.updatedAt).getTime() : 0;
                  if (singleTime > currentTime) {
                    projectMap.set(single.id, single);
                    projectsToResyncToServer.push(single);
                  }
                }
              }
            } catch {
              // ignore
            }
          }
        }
      }

      const merged = Array.from(projectMap.values()).sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );

      setProjects(merged);

      // Keep localStorage in sync with merged
      if (typeof window !== 'undefined' && merged.length > 0) {
        localStorage.setItem('studio_cached_projects', JSON.stringify(merged));
      }

      // Background resync: any projects missing on server OR newer locally get pushed via PUT
      const missingOnServer = cachedProjects.filter((cp) => !serverProjects.some((sp) => sp.id === cp.id));
      const allToSync = [...missingOnServer, ...projectsToResyncToServer];
      const uniqueToSync = Array.from(new Map(allToSync.map((p) => [p.id, p])).values());

      if (uniqueToSync.length > 0) {
        for (const proj of uniqueToSync) {
          fetch(`/api/projects/${proj.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proj),
          }).catch((e) => console.warn('Resync project error:', e));
        }
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      // Fallback to local storage on network error
      const cachedStr = typeof window !== 'undefined' ? localStorage.getItem('studio_cached_projects') : null;
      if (cachedStr) {
        try {
          setProjects(JSON.parse(cachedStr));
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

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

    fetchProjects();

    return () => {
      window.removeEventListener('auth_change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateLoading(true);
    setGateError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: gateIdentifier.trim(), password: gatePassword.trim() }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('studio_current_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        window.dispatchEvent(new Event('auth_change'));
        fetchProjects();
      } else {
        setGateError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setGateError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    } finally {
      setGateLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // Helper to load sample "เพื่อนที่ดีที่สุด SAN1" 3D project instantly
  const handleCreateSampleProject = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'มหาเทพกระบี่ข้ามภพ: พลิกชะตาฟ้าประทาน (รวมตอน 1 ชั่วโมงเต็ม)',
          synopsis:
            'เมื่อเซียวเฉิน ชายหนุ่มผู้ถูกทำลายจุดชีพจรและถูกแย่งชิงกระดูกเซียนไป ตกสู่หุบเหวดวงดาวมรณะ ทว่าที่ก้นเหวเขากลับค้นพบกระบี่บรรพกาลเก้าวิญญาณ การตื่นขึ้นของมหาเทพไร้พ่ายจึงเริ่มต้นขึ้น เพื่อกลับไปทลายเก้าสำนักใหญ่ที่เคยเหยียบย่ำเขา!',
          genre: 'xianxia_cultivation',
          visualMedium: 'animation',
          stylePreset: 'donghua_3d',
          targetDurationMinutes: 60,
          leadHeroName: 'เซียวเฉิน',
          leadHeroAnchor:
            'จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีครามไว้ด้านหลัง สไตล์อนิเมะจีน 3D สวยสง่า',
          antagonistName: 'จ้าวอสูรโลหิต',
          antagonistAnchor:
            'จ้าวอสูรผู้เกรงขาม แววตาสีแดงเพลิงเรืองรอง สวมชุดเกราะหนามสีดำทมิฬ มีไอหมอกมารสีเลือดแผ่ออกมารอบตัว สไตล์อนิเมะจีน 3D น่าเกรงขาม',
        }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        router.push(`/project/${data.project.id}`);
      }
    } catch (err) {
      console.error('Failed to create sample project:', err);
    }
  };

  // Auth Gatekeeper: Locked Screen if not logged in
  if (authChecked && !currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-studio-900/95 border border-studio-700/80 rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-cyan-500 p-0.5 mx-auto shadow-glow">
              <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              🔒 สตูดิโอระบบปิด (Private Studio)
            </span>
            <h2 className="text-2xl font-black text-white">กรุณาเข้าสู่ระบบก่อนใช้งาน</h2>
            <p className="text-xs text-gray-400">
              ต้องเข้าสู่ระบบก่อน จึงจะสามารถสร้างโปรเจกต์ เขียนบท AI หรือเรนเดอร์ภาพได้
            </p>
          </div>

          {gateError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                ชื่อผู้ใช้งาน (Username) *
              </label>
              <input
                type="text"
                required
                value={gateIdentifier}
                onChange={(e) => setGateIdentifier(e.target.value)}
                placeholder="เช่น: yutthakan หรือ ชื่อผู้ใช้ที่ได้รับอนุญาต"
                className="w-full px-4 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                รหัสผ่าน (Password) *
              </label>
              <div className="relative">
                <input
                  type={gateShowPass ? 'text' : 'password'}
                  required
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setGateShowPass(!gateShowPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  title={gateShowPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {gateShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{gateLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="text-xs text-amber-400/80 hover:text-amber-300 underline transition-colors"
            >
              ลืมรหัสผ่าน? กู้คืนบัญชีด้วยเบอร์โทรหรืออีเมล
            </button>
          </div>

          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setShowLoginModal(false);
              fetchProjects();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-studio-700 bg-gradient-to-br from-studio-900 via-studio-950 to-studio-900 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สไตล์ช่อง &quot;เพื่อนที่ดีที่สุด SAN1&quot; &amp; หนังภาพยนตร์มหากาพย์</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            สตูดิโอสร้างคลิป YouTube{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-400 bg-clip-text text-transparent">
              รันชั่วโมง สไตล์หนัง &amp; อนิเมะ 3D
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            ระบบเขียนบทสนทนาและเสียงพากย์ด้วย AI แบ่งฉากต่อเนื่องไม่ตัดข้าม พร้อมตัวเลือกระหว่าง{' '}
            <strong className="text-white">คนจริง (Live-Action)</strong> และ{' '}
            <strong className="text-white">การ์ตูน/อนิเมะจีน 3D (Donghua)</strong>{' '}
            ส่งไฟล์รูปเข้าจัดเก็บใน <strong className="text-emerald-400">MongoDB Atlas Cloud</strong> ทันที
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleOpenModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>สร้างโปรเจกต์ใหม่</span>
            </button>

            <button
              onClick={handleCreateSampleProject}
              className="px-5 py-3.5 rounded-2xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>โหลดตัวอย่างอนิเมะ 3D (เพื่อนที่ดีที่สุด SAN1)</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 pt-8 border-t border-studio-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-200">รันชั่วโมง (Long-form)</p>
              <p className="text-gray-400 text-[11px]">แบ่ง 4 องค์ 15-120 นาที ไม่หลุด</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-200">คนจริง vs การ์ตูน</p>
              <p className="text-gray-400 text-[11px]">สลับ Live-Action และ 3D Donghua</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-200">MongoDB Atlas GridFS</p>
              <p className="text-gray-400 text-[11px]">ไฟล์รูปส่งเข้า Atlas Cloud ทันที</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-200">ภาพต่อเนื่อง ไม่ตัดข้าม</p>
              <p className="text-gray-400 text-[11px]">ล็อค Character Anchor &amp; มุมกล้อง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>โปรเจกต์ทั้งหมดของคุณ</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              จัดการบท สคริปต์เสียงพากย์ และพร้อมต์วิดีโอ YouTube
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-amber-300 border border-studio-700 hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างคลิปใหม่</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            กำลังโหลดโปรเจกต์จากฐานข้อมูล...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 rounded-3xl border border-dashed border-studio-800 bg-studio-950/40 text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">ยังไม่มีโปรเจกต์สร้างคลิป</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                เริ่มต้นสร้างคลิปแรกของคุณ หรือคลิกปุ่มด้านล่างเพื่อโหลดโปรเจกต์ตัวอย่างสไตล์อนิเมะจีน 3D (เพื่อนที่ดีที่สุด SAN1)
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors"
              >
                สร้างโปรเจกต์ใหม่
              </button>
              <button
                onClick={handleCreateSampleProject}
                className="px-5 py-2.5 rounded-xl bg-studio-800 text-white font-medium text-xs hover:bg-studio-700 transition-colors"
              >
                โหลดตัวอย่างเพื่อนที่ดีที่สุด SAN1
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onSequelClick={(p) => setSequelTargetProject(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newId) => router.push(`/project/${newId}`)}
      />

      {/* Create Sequel Modal */}
      {sequelTargetProject && (
        <CreateSequelModal
          isOpen={Boolean(sequelTargetProject)}
          onClose={() => setSequelTargetProject(null)}
          project={sequelTargetProject}
          onSequelCreated={(newP) => {
            setSequelTargetProject(null);
            fetchProjects();
            router.push(`/project/${newP.id}`);
          }}
        />
      )}
    </div>
  );
}
