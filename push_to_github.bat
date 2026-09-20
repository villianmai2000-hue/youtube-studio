@echo off
chcp 65001 > nul
title Push to GitHub - youtube-studio

echo ===================================================================
echo   Push to GitHub: youtube-studio (villianmai2000-hue)
echo ===================================================================
echo.
echo Target: https://github.com/villianmai2000-hue/youtube-studio.git
echo.

git remote remove origin >nul 2>&1
git remote add origin https://github.com/villianmai2000-hue/youtube-studio.git
git branch -M main

echo [1/3] Git Add...
git add .

echo [2/3] Git Commit...
git commit -m "feat: AI Cinema and Donghua 3D YouTube Studio update" >nul 2>&1

echo [3/3] Git Push...
git push -u origin main
if errorlevel 1 goto FAILED

:SUCCESS
echo.
echo ===================================================================
echo   SUCCESS: Uploaded to GitHub completely!
echo   Repo URL: https://github.com/villianmai2000-hue/youtube-studio
echo ===================================================================
goto END

:FAILED
echo.
echo ===================================================================
echo   FAILED: Could not push to GitHub.
echo   If browser opened, please click Sign in with your browser.
echo ===================================================================
goto END

:END
echo.
echo Press any key to exit...
pause > nul
