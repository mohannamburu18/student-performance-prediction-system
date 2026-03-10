import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { ...form, role })
        setMode('login')
        alert('Registered! Please login.')
      } else {
        const fd = new URLSearchParams()
        fd.append('username', form.username)
        fd.append('password', form.password)
        const res = await api.post('/auth/login', fd, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        login(res.data)
        navigate(res.data.role === 'admin' ? '/admin' : '/student')
      }
    } catch (e) { setError(e.response?.data?.detail || 'Something went wrong') }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .login-page {
          min-height: 100vh;
          background: #fdf6f0;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .bg-blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.55; pointer-events: none; }
        .blob1 { width: 480px; height: 480px; background: #fbc8d4; top: -120px; left: -120px; }
        .blob2 { width: 420px; height: 420px; background: #c8e6fb; bottom: -100px; right: -80px; }
        .blob3 { width: 300px; height: 300px; background: #d4fbca; top: 40%; left: 40%; transform: translate(-50%,-50%); }
        .login-container {
          display: flex; width: 920px; min-height: 560px;
          position: relative; z-index: 1;
          border-radius: 28px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(120,80,60,0.12), 0 4px 16px rgba(120,80,60,0.06);
        }
        .login-left {
          flex: 1;
          background: linear-gradient(150deg, #e8a4c8 0%, #b5c8f7 60%, #a8d8c8 100%);
          padding: 52px 48px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .login-left::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; background: rgba(255,255,255,0.18); border-radius: 50%;
        }
        .login-left::after {
          content: ''; position: absolute; bottom: -40px; left: -40px;
          width: 180px; height: 180px; background: rgba(255,255,255,0.12); border-radius: 50%;
        }
        .brand { display: flex; align-items: center; gap: 12px; position: relative; z-index: 2; }
        .brand-icon {
          width: 42px; height: 42px; background: rgba(255,255,255,0.4);
          backdrop-filter: blur(10px); border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; border: 1px solid rgba(255,255,255,0.5);
        }
        .brand-name { color: #3d2b4a; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
        .left-main { position: relative; z-index: 2; }
        .left-title {
          font-family: 'DM Serif Display', serif; color: #2c1e3a;
          font-size: 34px; font-weight: 400; line-height: 1.22;
          margin-bottom: 14px; letter-spacing: -0.5px;
        }
        .left-title em { font-style: italic; color: #6b4fa0; }
        .left-sub { color: rgba(44,30,58,0.7); font-size: 14px; line-height: 1.65; }
        .feature-list { list-style: none; position: relative; z-index: 2; }
        .feature-list li {
          color: rgba(44,30,58,0.8); font-size: 13px; padding: 9px 0;
          display: flex; align-items: center; gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.35);
        }
        .feature-list li:last-child { border-bottom: none; }
        .feat-dot {
          width: 22px; height: 22px; background: rgba(255,255,255,0.5);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.6);
        }
        .login-right { width: 420px; background: #fffaf7; padding: 52px 48px; display: flex; flex-direction: column; justify-content: center; }
        .login-title { font-family: 'DM Serif Display', serif; color: #2c1e3a; font-size: 28px; font-weight: 400; margin-bottom: 6px; letter-spacing: -0.3px; }
        .login-sub { color: #9b8faa; font-size: 13px; margin-bottom: 32px; }
        .tabs { display: flex; gap: 4px; background: #f0e8f5; padding: 4px; border-radius: 12px; margin-bottom: 28px; }
        .tab { flex: 1; padding: 9px; border: none; border-radius: 9px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all 0.2s; background: transparent; color: #9b8faa; }
        .tab.active { background: #b784c7; color: white; box-shadow: 0 2px 8px rgba(183,132,199,0.35); }
        .field-label { display: block; font-size: 11px; font-weight: 600; color: #9b8faa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.07em; }
        .field-input {
          width: 100%; padding: 12px 16px; background: #f5eef9; border: 1.5px solid #e8d8f0;
          border-radius: 11px; color: #2c1e3a; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; margin-bottom: 18px; transition: border 0.2s, background 0.2s;
        }
        .field-input:focus { border-color: #b784c7; background: #fdf8ff; }
        .field-input::placeholder { color: #c4b5d0; }
        .field-select {
          width: 100%; padding: 12px 16px; background: #f5eef9; border: 1.5px solid #e8d8f0;
          border-radius: 11px; color: #2c1e3a; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; margin-bottom: 18px;
        }
        .error-box { background: #fff0f0; border: 1px solid #ffc8c8; color: #c0445a; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .submit-btn {
          width: 100%; padding: 13px; background: linear-gradient(135deg, #b784c7, #9b6bb5);
          color: white; border: none; border-radius: 11px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.22s;
          box-shadow: 0 4px 14px rgba(155,107,181,0.28);
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(155,107,181,0.38); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>
      <div className="login-page">
        <div className="bg-blob blob1" />
        <div className="bg-blob blob2" />
        <div className="bg-blob blob3" />
        <div className="login-container">
          <div className="login-left">
            <div className="brand">
              <div className="brand-icon">🎓</div>
              <div className="brand-name">EduPredict</div>
            </div>
            <div className="left-main">
              <div className="left-title">Smart Insights for<br /><em>Smarter Education</em></div>
              <div className="left-sub">A smart system that predicts student performance and alerts educators early to support students at risk.</div>
            </div>
            <ul className="feature-list">
              <li><span className="feat-dot">✦</span>ML-based risk prediction (High / Medium / Low)</li>
              <li><span className="feat-dot">✦</span>Personalized study plans</li>
              <li><span className="feat-dot">✦</span>Early warning system for faculty</li>
              <li><span className="feat-dot">✦</span>Performance trend visualization</li>
            </ul>
          </div>
          <div className="login-right">
            <div className="login-title">Welcome Back 👋</div>
            <div className="login-sub">Sign in to your account to continue</div>
            <div className="tabs">
              <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
              <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
            </div>
            {error && <div className="error-box">{error}</div>}
            <label className="field-label">Username</label>
            <input className="field-input" name="username" value={form.username} onChange={handle} placeholder="Enter username" />
            {mode === 'register' && <>
              <label className="field-label">Email</label>
              <input className="field-input" name="email" value={form.email} onChange={handle} placeholder="Enter email" />
            </>}
            <label className="field-label">Password</label>
            <input className="field-input" name="password" type="password" value={form.password} onChange={handle} placeholder="Enter password" />
            {mode === 'register' && <>
              <label className="field-label">Role</label>
              <select className="field-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin / Faculty</option>
              </select>
            </>}
            <button className="submit-btn" onClick={submit} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? '→  Sign In' : '→  Create Account'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
