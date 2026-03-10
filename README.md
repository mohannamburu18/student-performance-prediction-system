# EduPredict — Student Performance Prediction System

## ⚡ Quick Fix: `jose` SyntaxError
If you see `SyntaxError: Missing parentheses in call to 'print'` on startup:
```bash
pip uninstall jose -y
pip install "python-jose[cryptography]==3.3.0"
```

---

## 🚀 Running the Project

You need **two terminals open at the same time**.

### Terminal 1 — Backend (FastAPI)
```bash
cd project_modified

# First time only: create venv & install deps
python -m venv venv
venv\Scripts\activate
pip uninstall jose -y
pip install -r requirements.txt

# Every time: start the backend
venv\Scripts\activate
python -m uvicorn backend.app:app --reload --port 8000
```
✅ Backend runs on → http://localhost:8000

### Terminal 2 — Frontend (React + Vite)
```bash
cd project_modified/frontend
npm install        # first time only
npm run dev
```
✅ Frontend runs on → http://localhost:5173

> **Important:** Backend must be running BEFORE you use the frontend.
> Both terminals must stay open while using the app.

---

## ❓ ECONNREFUSED error?
This means the backend is not running. Make sure Terminal 1 shows:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```
If it shows a different port, update `frontend/vite.config.js` to match.

---

## 📦 Requirements
- Python 3.10+  
- Node.js 18+
