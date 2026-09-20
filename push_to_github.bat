@echo off
chcp 65001 > nul
title ส่งโค้ดขึ้น GitHub - youtube-studio (villianmai2000-hue)
color 0a

echo ===================================================================
echo     ส่งโค้ดขึ้น GitHub: youtube-studio (villianmai2000-hue)
echo ===================================================================
echo.
echo ปลายทาง: https://github.com/villianmai2000-hue/youtube-studio.git
echo.

git remote remove origin >nul 2>&1
git remote add origin https://github.com/villianmai2000-hue/youtube-studio.git
git branch -M main

echo [1/3] กำลังเตรียมไฟล์ (git add)...
git add .

echo [2/3] บันทึกสถานะการเปลี่ยนแปลง (git commit)...
git commit -m "feat: AI Cinema & Donghua 3D YouTube Studio update" >nul 2>&1

echo [3/3] กำลังส่งโค้ดขึ้น GitHub (git push)...
echo (หากมีหน้าต่าง Browser หรือ GitHub Login เด้งขึ้นมา ให้กด Sign in เพื่อยืนยันสิทธิ์)
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo    ส่งโค้ดขึ้น GitHub สำเร็จเรียบร้อยแล้ว! 100%%
    echo    ตรวจสอบผลงานได้ที่: https://github.com/villianmai2000-hue/youtube-studio
    echo ===================================================================
) else (
    echo.
    echo ===================================================================
    echo  หากติดปัญหา:
    echo  - หากขึ้นหน้าต่างยืนยัน ให้กดปุ่ม "Sign in with your browser"
    echo  - หาก repo ใน GitHub มีไฟล์ README อยู่แล้ว อาจต้อง pull ก่อน
    echo ===================================================================
)

echo.
echo กดปุ่มใดๆ เพื่อปิดหน้าต่างนี้...
pause > nul
