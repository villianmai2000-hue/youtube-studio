# AI Cinema & Donghua 3D YouTube Studio
### สตูดิโอสร้างบทและฉากวิดีโอยาว YouTube สไตล์ภาพยนตร์และอนิเมะจีน 3D กำลังภายใน (สไตล์ เพื่อนที่ดีที่สุด SAN1)

ระบบ Fullstack Web Application สำหรับครีเอเตอร์สาย YouTube ที่ต้องการผลิตคอนเทนต์เล่าเรื่อง/สปอยล์หนัง/อนิเมะจีน 3D ความยาวระดับชั่วโมง ("รันชั่วโมง") รองรับการจัดเก็บรูปภาพและข้อมูลใน **MongoDB Atlas Cloud (GridFS)** โดยตรง, ซอร์สโค้ดพร้อมส่งขึ้น **GitHub** และ Deploy บน **Vercel**

---

## 🌟 ฟังก์ชันเด่นของระบบ

1. **โหมดเลือกระหว่าง "คนจริง (Live-Action)" vs "การ์ตูน (Animation)"**
   - 🎬 **คนจริง:** เลนส์ 35mm/70mm IMAX, แสง Chiaroscuro, ผิวหนังสมจริงแบบภาพยนตร์ฮอลลีวูด
   - 🎨 **การ์ตูน:**
     - **3D Chinese Donghua:** สไตล์อนิเมะจีน 3D กำลังภายใน (Unreal Engine 5 render, Octane 3D) แบบช่อง *เพื่อนที่ดีที่สุด SAN1*
     - **2D Japanese Anime:** สไตล์อนิเมะญี่ปุ่นระดับโรงภาพยนตร์ (Ufotable / Makoto Shinkai)
     - **3D Western Animation:** สไตล์ภาพยนตร์แอนิเมชันระดับโลก (Arcane / Pixar)
     - **Manhwa Action:** สไตล์มันฮวาแอ็กชันดาร์กแฟนตาซี (Solo Leveling)

2. **รองรับแนวภาพยนตร์ทุกรูปแบบ (Universal Movie Genres)**
   - ⚔️ บำเพ็ญเพียร / กำลังภายใน / เซียน / เทพยุทธ์ (Xianxia / Wuxia)
   - 🚀 แอ็กชัน / ไซไฟ / ไซเบอร์พังก์ (Action / Sci-Fi / Cyberpunk)
   - 🐉 แฟนตาซีมหากาพย์ (Epic Fantasy)
   - 👻 สยองขวัญ / ระทึกขวัญ (Horror / Supernatural Thriller)
   - 🕵️ สืบสวน / นัวร์ นีออน ฝนตก (Mystery / Noir)
   - 🏛️ ย้อนยุค / สงครามประวัติศาสตร์ (Historical War)

3. **เขียนบทเล่าเรื่องและบทสนทนาด้วย AI (Dual-track Script)**
   - **บทบรรยาย (Voiceover Narration):** อารมณ์เข้มข้น ดึงดูด กระชับ น่าติดตาม
   - **บทสนทนา (Character Dialogue):** ระบุชื่อผู้พูด + อารมณ์น้ำเสียง (เช่น เยือกเย็น, ตะโกนก้อง)
   - **คิวเสียง (SFX / BGM Cues):** แนะนำจังหวะดนตรีและเอฟเฟกต์ประกอบ

4. **ระบบคุมความต่อเนื่องของภาพและวิดีโอ (Visual Continuity Engine)**
   - **Character Bible Anchor:** ล็อคหน้าตา ทรงผม เสื้อผ้า และอาวุธของตัวละคร เพื่อไม่ให้หน้าเปลี่ยนข้ามฉาก
   - **Video Motion Prompts:** สร้างคำสั่งพร้อมต์สำหรับ AI Video (Kling AI, Runway Gen-3, Luma Dream Machine) พร้อมระบุมุมกล้องและคำสั่งความต่อเนื่องของฉาก

5. **สถาปัตยกรรมสำหรับคลิปยาวระดับชั่วโมง ("รันชั่วโมง")**
   - แบ่งเป็น 4 องค์ (4 Acts: 0-15 น., 15-30 น., 30-45 น., 45-60+ น.)
   - ตัวนับคำภาษาไทยและคำนวณระยะเวลาพากย์จริงแบบเรียลไทม์
   - บันทึกสถานะลง MongoDB Atlas Cloud อัตโนมัติ (Progressive Auto-save)

6. **ไฟล์รูปส่งเข้าจัดเก็บใน MongoDB Atlas ทันที**
   - ใช้ **MongoDB GridFS** ในการสตรีมและจัดเก็บไฟล์รูปภาพเข้าฐานข้อมูล Cloud Atlas ทันทีผ่าน API `/api/media/upload` และเรียกดูผ่าน `/api/media/[id]`

7. **ศูนย์ส่งออกผลงาน (Export Hub)**
   - ส่งออกสคริปต์เต็ม (.TXT) สำหรับนักพากย์
   - ส่งออกซับไตเติล YouTube (.SRT) พร้อม Timecode
   - ส่งออกตารางพร้อมต์ภาพ Batch (.CSV) สำหรับ Midjourney / Flux
   - ส่งออกคำอธิบายคลิป YouTube (SEO) พร้อม Chapters ช่วงเวลาสำคัญ

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
```bash
cp .env.example .env.local
```
เปิดไฟล์ `.env.local` และใส่ค่า:
```env
# MongoDB Atlas Cloud Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# กำหนดชื่อฐานข้อมูลแยกเฉพาะสำหรับโปรเจกต์นี้ (เพื่อแยกเด็ดขาดจากโปรเจกต์อื่นบนคลัสเตอร์ Atlas 100%)
MONGODB_DB_NAME=youtube_cinematic_donghua_studio
MONGODB_GRIDFS_BUCKET=youtube_studio_media

# (ตัวเลือกเสริม) Google Gemini API Key หากต้องการใช้ AI คิดบทแบบสด
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. รันเซิร์ฟเวอร์สำหรับทดสอบ (Local Development)
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

---

## ☁️ วิธีเชื่อมต่อ MongoDB Atlas Cloud

1. สมัครหรือเข้าสู่ระบบที่ [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. สร้างฟรีคลัสเตอร์ (M0 Free Tier)
3. ไปที่แท็บ **Database Access** &rarr; เพิ่มผู้ใช้งาน (Database User) พร้อมรหัสผ่าน
4. ไปที่แท็บ **Network Access** &rarr; เพิ่ม `0.0.0.0/0` (Allow Access from Anywhere) เพื่อให้ Vercel เข้าถึงได้
5. ไปที่แท็บ **Database** &rarr; คลิกปุ่ม **Connect** &rarr; เลือก **Drivers** (Node.js)
6. คัดลอก Connection String และนำมาระบุใน `MONGODB_URI` ในไฟล์ `.env.local`

---

## 🐙 วิธีนำโค้ดขึ้น GitHub

1. เปิด Terminal ในโฟลเดอร์โปรเจกต์นี้
2. เพิ่มไฟล์และคอมมิทโค้ด:
```bash
git add .
git commit -m "feat: AI Cinema & Donghua 3D YouTube Studio initial release"
```
3. สร้าง Repository ใหม่บน [GitHub.com](https://github.com/new) (เช่น `cinematic-donghua-ai-studio`)
4. เชื่อมโยงและ Push โค้ด:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## ▲ วิธี Deploy บน Vercel

1. เข้าสู่ระบบที่ [vercel.com](https://vercel.com)
2. คลิก **Add New** &rarr; **Project**
3. เลือก Repository จาก GitHub ที่เพิ่ง Push ขึ้นไป
4. ในส่วน **Environment Variables** ให้เพิ่ม:
   - `MONGODB_URI`: Connection String ของ MongoDB Atlas
   - `MONGODB_DB_NAME`: `youtube_cinematic_donghua_studio` (ระบุชื่อฐานข้อมูลแยกเฉพาะ)
   - `MONGODB_GRIDFS_BUCKET`: `youtube_studio_media` (ระบุบักเก็ตแยกเฉพาะ)
   - `GEMINI_API_KEY`: (ถ้ามี) API Key สำหรับ AI
5. คลิก **Deploy** &rarr; ระบบจะ Build และพร้อมใช้งานทั่วโลก รัน 24 ชั่วโมงต่อเนื่อง!
