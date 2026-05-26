@echo off
echo ====================================
echo   Barztify Music API - Starting...
echo ====================================
echo.
cd /d "%~dp0music_api"
echo Installing dependencies...
pip install -r requirements.txt -q
echo.
echo Starting server on http://0.0.0.0:7979
echo Test di browser: http://localhost:7979/health
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 7979 --reload
pause
