@echo off
echo ====================================
echo   Barztify Frontend - Starting...
echo ====================================
echo.
cd /d "%~dp0"
echo Installing npm dependencies...
npm install
echo.
echo Starting Vite dev server...
echo Akses lokal:   http://localhost:5173
echo Akses jaringan: http://192.168.1.5:5173
echo.
npm run dev
pause
