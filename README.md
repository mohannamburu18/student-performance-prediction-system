# 🎓 EduPredict — AI Student Performance Prediction System

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Build-purple?logo=vite)
![Scikit Learn](https://img.shields.io/badge/ML-ScikitLearn-orange?logo=scikitlearn)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

🚀 **EduPredict** is an **AI-powered student performance prediction and early warning system** designed to help educational institutions identify students at risk and provide personalized improvement recommendations.

The system integrates **Machine Learning, FastAPI backend APIs, and a modern React dashboard** to analyze academic data and predict student outcomes.

---

# 🎥 Project Demo

Watch the working demo of **EduPredict — Student Performance Prediction System**

https://github.com/mohannamburu18/student-performance-prediction-system/blob/main/demo/Demo%20video.mp4


---

# 📸 Application Screenshots

### 🔐 Login Page

![Login](screenshots/login%20page.png)


### 📊 Student Dashboard

![Dashboard](screenshots/student%20dashboard.png)

### 📈 Prediction Result

![Prediction](screenshots/prediction%20summary.png)

---

# ✨ Features

🔐 **Secure Authentication**

* JWT based login system

📊 **Admin Dashboard**

* Monitor students
* Detect academic risk

🎯 **Performance Prediction**

* Machine learning model predicts student performance

📚 **Personalized Recommendations**

* Suggests improvements for weak subjects

⚡ **FastAPI Backend**

* High performance API system

🎨 **Modern UI**

* React + Vite frontend

📈 **Early Warning System**

* Helps institutions intervene early

---

# 🧠 Machine Learning Pipeline

The project uses **Scikit-learn classification models** trained on academic datasets.

Steps:

1️⃣ Data preprocessing
2️⃣ Feature engineering
3️⃣ Model training
4️⃣ Model serialization (`.pkl`)
5️⃣ Prediction API integration

---

# 🏗 System Architecture

```
        React Frontend
      (Vite + Components)
              │
              │ REST API
              ▼
        FastAPI Backend
       (Authentication + APIs)
              │
              │ Prediction Request
              ▼
       Machine Learning Models
         (Scikit-learn .pkl)
```

---

# 📂 Project Structure

```
EduPredict
│
├── backend
│   ├── app.py
│   ├── auth
│   ├── routes
│   ├── database
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│
├── ml_pipeline
│   ├── generate_dataset.py
│   ├── train_models.py
│
├── requirements.txt
└── README.md
```

---

# ⚡ Quick Fix: `jose` SyntaxError

If backend shows:

```
SyntaxError: Missing parentheses in call to 'print'
```

Run:

```
pip uninstall jose -y
pip install "python-jose[cryptography]==3.3.0"
```

---

# 🚀 Running the Project

Two terminals are required.

---

# 🖥 Terminal 1 — Backend

```
cd project_modified

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn backend.app:app --reload --port 8000
```

Backend URL:

```
http://localhost:8000
```

API Docs:

```
http://localhost:8000/docs
```

---

# 💻 Terminal 2 — Frontend

```
cd project_modified/frontend

npm install
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

⚠ Backend must run **before opening frontend**.

---

# ❗ ECONNREFUSED Error

This means backend is not running.

Check Terminal 1 shows:

```
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

# 📦 Requirements

* Python **3.10+**
* Node.js **18+**
* npm
* Git

---

# 🌟 Future Improvements

📱 Mobile application
☁ Cloud deployment
📊 Advanced analytics dashboard
🤖 Deep learning models
📚 Smart study plan generator

---

# 👨‍💻 Author

**Mohan Namburu**

🎓 B.Tech CSE
🏫 Sastra Deemed University

GitHub:

```
https://github.com/mohannamburu18
```

---

# ⭐ Support

If you like this project:

⭐ Star this repository
🍴 Fork the project
📢 Share with others
