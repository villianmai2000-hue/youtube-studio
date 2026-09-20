@echo off
chcp 65001 > nul
title ส่งโค้ดขึ้น GitHub อัตโนมัติ (AI Studio)
color 0a

echo ===================================================================
echo     ส่งโค้ดขึ้น GitHub (AI Cinema & Donghua 3D YouTube Studio)
echo ===================================================================
echo.

git status -s
echo.
set /p commit_msg="ใส่ข้อความบันทึกการเปลี่ยนแปลง (กด Enter เพื่อใช้ค่าเริ่มต้น): "
if "%commit_msg%"=="" set commit_msg="feat: update AI YouTube Studio with 24h Vercel and MongoDB Atlas"

echo.
echo [1/3] กำลังเตรียมไฟล์...
git add .

echo [2/3] กำลังบันทึก Commit: %commit_msg%
git commit -m %commit_msg%

echo.
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ยังไม่ได้เชื่อมต่อกับ GitHub Repository!
    echo.
    echo ตัวอย่าง URL: https://github.com/USERNAME/REPO_NAME.git
    set /p repo_url="กรุณาวาง GitHub Repository URL ของคุณ: "
    if not "%repo_url%"=="" (
        git remote add origin %repo_url%
        git branch -M main
    )
)

echo [3/3] กำลังส่งโค้ดขึ้น GitHub (git push)...
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo    ส่งโค้ดขึ้น GitHub สำเร็จเรียบร้อยแล้ว!
    echo ===================================================================
) else (
    echo.
    echo หากเจอปัญหา กรุณาตรวจสอบว่าคุณล็อกอิน GitHub บนเครื่องนี้แล้วหรือยัง
)

echo.
pause
