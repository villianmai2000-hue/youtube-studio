import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AI Cinema & Donghua Studio | สร้างบทและคลิป YouTube วิดีโอยาว',
  description:
    'สตูดิโอ AI สร้างบทภาพยนตร์และอนิเมะจีน 3D กำลังภายใน (สไตล์ เพื่อนที่ดีที่สุด SAN1) จัดเก็บรูปภาพและข้อมูลใน MongoDB Atlas Cloud รองรับการรันคลิประดับชั่วโมงและ Deploy บน Vercel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-studio-950 text-gray-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
