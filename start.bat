@echo off
chcp 65001 > nul
title AI Cinema & Donghua 3D YouTube Studio
color 0b
echo ===================================================================
echo     AI Cinema & Donghua 3D YouTube Studio
echo     (สไตล์ เพื่อนที่ดีที่สุด SAN1 & หนังภาพยนตร์มหากาพย์)
echo ===================================================================
echo.
echo [1/2] กำลังเปิดหน้าเว็บในบราวเซอร์: http://localhost:3000 ...
start http://localhost:3000
echo [2/2] กำลังสตาร์ท Next.js Development Server...
echo.
call npm run dev
pause
