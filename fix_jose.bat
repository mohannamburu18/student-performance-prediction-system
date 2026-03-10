@echo off
echo ========================================
echo  Fixing jose package conflict...
echo ========================================
cd /d "%~dp0"

call venv\Scripts\activate.bat

echo Removing bad 'jose' package...
pip uninstall jose -y

echo Removing 'python-jose' if present...
pip uninstall python-jose -y

echo Installing correct python-jose...
pip install "python-jose[cryptography]==3.3.0"

echo.
echo ========================================
echo  Done! Now run:
echo  python -m uvicorn backend.app:app --reload --port 8000
echo ========================================
pause
