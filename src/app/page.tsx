'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import NewProjectModal from '@/components/NewProjectModal';
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
  Sliders,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
            'handsome 20yo cultivation master, long silver-white hair tied with ancient jade hairpin, flowing deep black and gold embroidered daoist martial robe, calm piercing amber eyes, carrying ancient glowing azure divine sword on back, 3d chinese donghua UE5 render',
          antagonistName: 'จ้าวอสูรโลหิต',
          antagonistAnchor:
            'formidable demon warlord, glowing crimson eyes, heavy obsidian spiky armor, dark red demonic aura swirling around',
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
              onClick={() => setIsModalOpen(true)}
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
            onClick={() => setIsModalOpen(true)}
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
                onClick={() => setIsModalOpen(true)}
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
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
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
    </div>
  );
}
