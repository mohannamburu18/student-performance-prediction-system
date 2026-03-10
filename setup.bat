@echo off
echo ========================================
echo  EduPredict - Backend Setup
echo ========================================
cd /d "%~dp0"

echo [1/4] Creating virtual environment...
python -m venv venv

echo [2/4] Activating...
call venv\Scripts\activate.bat

echo [3/4] Removing conflicting jose package...
pip uninstall jose -y 2>nul

echo [4/4] Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo  Done! Now run in TWO separate terminals:
echo.
echo  Terminal 1 (Backend):
echo    venv\Scripts\activate
echo    python -m uvicorn backend.app:app --reload --port 8000
echo.
echo  Terminal 2 (Frontend):
echo    cd frontend
echo    npm install
echo    npm run dev
echo ========================================
pause
