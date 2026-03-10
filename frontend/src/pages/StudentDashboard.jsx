import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const SIDEBAR = [
  { icon: '⊞', label: 'Dashboard', key: 'dashboard' },
  { icon: '📅', label: 'Study Plan', key: 'plan' },
  { icon: '📊', label: 'Analytics', key: 'analytics' },
]

function Gauge({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const angle = -135 + (pct / 100) * 270
  const color = pct < 50 ? '#e07a8a' : pct < 70 ? '#d4a840' : '#5aaa7a'
  return (
    <div style={{ position: 'relative', width: 160, height: 110, margin: '0 auto' }}>
      <svg width="160" height="110" viewBox="0 0 160 110">
        <path d="M 20 100 A 60 60 0 1 1 140 100" fill="none" stroke="#e8d8f0" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 100 A 60 60 0 0 1 50 37" fill="none" stroke="#f0a0b0" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M 50 37 A 60 60 0 0 1 110 37" fill="none" stroke="#f0d888" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M 110 37 A 60 60 0 0 1 140 100" fill="none" stroke="#88d4a8" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <g transform={`rotate(${angle}, 80, 100)`}>
          <line x1="80" y1="100" x2="80" y2="48" stroke="#4a2d6a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="100" r="6" fill={color} />
        </g>
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#2c1e3a', lineHeight: 1 }}>{Math.round(pct)}</div>
        <div style={{ fontSize: 11, color: '#9b8faa', marginTop: 2 }}>Out of 100</div>
      </div>
    </div>
  )
}

const FIELDS = [
  { name: 'study_hours',        label: 'Study Hours / Day',    min: 0, max: 24  },
  { name: 'sleep_hours',        label: 'Sleep Hours / Day',    min: 0, max: 12  },
  { name: 'screen_time',        label: 'Screen Time (hrs)',    min: 0, max: 24  },
  { name: 'prev_semester_score',label: 'Prev Semester Score',  min: 0, max: 100 },
  { name: 'attendance',         label: 'Attendance (%)',       min: 0, max: 100 },
  { name: 'weekly_test_score',  label: 'Weekly Test Score',    min: 0, max: 100 },
  { name: 'assignment_score',   label: 'Assignment Score',     min: 0, max: 100 },
]

const SUBJECTS = ['None', 'Math', 'Physics', 'Chemistry', 'English', 'CS']
const RISK_COLOR = { High: '#e07a8a', Medium: '#c49520', Low: '#3a9a6a' }
const RISK_BG    = { High: 'rgba(224,122,138,0.12)', Medium: 'rgba(196,149,32,0.12)', Low: 'rgba(58,154,106,0.12)' }

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [form, setForm] = useState({
    study_hours: 5, sleep_hours: 7, screen_time: 3,
    prev_semester_score: 65, attendance: 80,
    weekly_test_score: 60, assignment_score: 70,
    weak_subjects: 'None', course: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value }))

  const predict = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/student/predict', form)
      setResult(res.data)
      setAnalyzed(true)
      setActiveNav('dashboard')
    } catch (e) { setError(e.response?.data?.detail || 'Prediction failed') }
    setLoading(false)
  }

  const doLogout = () => { logout(); navigate('/') }

  const trendData = result ? [
    { month: 'Jan', score: Math.max(30, result.prediction.predicted_score - 15), target: result.prediction.predicted_score },
    { month: 'Feb', score: Math.max(35, result.prediction.predicted_score - 10), target: result.prediction.predicted_score + 2 },
    { month: 'Mar', score: Math.max(40, result.prediction.predicted_score - 6),  target: result.prediction.predicted_score + 4 },
    { month: 'Apr', score: result.prediction.predicted_score,                     target: result.prediction.predicted_score + 6 },
    { month: 'May', score: Math.min(100, result.prediction.predicted_score + 3),  target: result.prediction.predicted_score + 8 },
    { month: 'Jun', score: Math.min(100, result.prediction.predicted_score + 5),  target: result.prediction.predicted_score + 10 },
  ] : []

  /* Score increase if tips are followed — 6-week projection */
  const tipImpactData = result ? [
    { week: 'Now',  followed: result.prediction.predicted_score,                    ignored: result.prediction.predicted_score },
    { week: 'Wk 1', followed: Math.min(100, result.prediction.predicted_score + 4),  ignored: Math.max(0, result.prediction.predicted_score - 1) },
    { week: 'Wk 2', followed: Math.min(100, result.prediction.predicted_score + 8),  ignored: Math.max(0, result.prediction.predicted_score - 1.5) },
    { week: 'Wk 3', followed: Math.min(100, result.prediction.predicted_score + 12), ignored: Math.max(0, result.prediction.predicted_score - 2) },
    { week: 'Wk 4', followed: Math.min(100, result.prediction.predicted_score + 15), ignored: Math.max(0, result.prediction.predicted_score - 2.5) },
    { week: 'Wk 5', followed: Math.min(100, result.prediction.predicted_score + 18), ignored: Math.max(0, result.prediction.predicted_score - 3) },
  ] : []

  const riskLevel = result?.prediction?.risk_level || 'Low'

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #f7f2fc; color: #2c1e3a; }

    .layout { display: flex; min-height: 100vh; }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px; background: #fffaf7;
      border-right: 1.5px solid #e8d8f0;
      display: flex; flex-direction: column;
      padding: 24px 16px; position: fixed;
      top: 0; left: 0; height: 100vh; z-index: 10;
      box-shadow: 2px 0 16px rgba(183,132,199,0.09);
    }
    .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 32px; }
    .brand-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg,#c89ee0,#8fc8f0);
      border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .brand-name { font-size: 16px; font-weight: 700; color: #2c1e3a; letter-spacing:-0.3px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 11px 14px;
      border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500;
      color: #9b8faa; margin-bottom: 4px; transition: all 0.2s;
    }
    .nav-item:hover { background: #f5eef9; color: #2c1e3a; }
    .nav-item.active { background: #eedff8; color: #7a3fb8; }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }
    .nav-bottom { margin-top: auto; }
    .logout-btn {
      display: flex; align-items: center; gap: 12px; padding: 11px 14px;
      border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500;
      color: #d05a70; width: 100%; background: none; border: none;
      font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .logout-btn:hover { background: #ffeef2; }

    /* ── Main ── */
    .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; }
    .topbar {
      background: #fffaf7; border-bottom: 1.5px solid #e8d8f0;
      padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;
      position: sticky; top: 0; z-index: 5;
    }
    .topbar-title { font-size: 20px; font-weight: 700; color: #2c1e3a; letter-spacing:-0.3px; }
    .user-chip {
      display: flex; align-items: center; gap: 10px;
      background: #f5eef9; padding: 8px 16px; border-radius: 20px; border: 1px solid #e2d0ee;
    }
    .user-avatar {
      width: 30px; height: 30px;
      background: linear-gradient(135deg,#c89ee0,#8fc8f0);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: white;
    }
    .user-name { font-size: 13px; font-weight: 600; color: #9b8faa; }
    .content { padding: 28px 32px; flex: 1; }

    /* ── Stat cards ── */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .stat-card {
      background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px; padding: 24px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      box-shadow: 0 2px 14px rgba(183,132,199,0.08);
    }
    .stat-label { font-size: 12px; font-weight: 600; color: #9b8faa; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px; }
    .risk-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 15px; font-weight: 800; }
    .confidence-number { font-size: 48px; font-weight: 800; color: #2c1e3a; line-height: 1; }
    .confidence-sub { font-size: 12px; color: #9b8faa; margin-top: 4px; }

    /* ── Chart cards ── */
    .chart-card {
      background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px;
      padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 14px rgba(183,132,199,0.08);
    }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .chart-title { font-size: 15px; font-weight: 700; color: #2c1e3a; }
    .chart-subtitle { font-size: 12px; color: #9b8faa; margin-top: 3px; }
    .chart-legend { display: flex; gap: 16px; flex-wrap: wrap; justify-content: flex-end; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9b8faa; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* tip-impact highlight banner */
    .impact-banner {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(90deg,#edfaf3,#fdf0fc);
      border: 1.5px solid #b8e8cc; border-radius: 12px;
      padding: 12px 18px; margin-bottom: 20px;
    }
    .impact-banner-icon { font-size: 22px; }
    .impact-banner-text { font-size: 13px; color: #2c5a3a; font-weight: 500; }
    .impact-banner-gain { font-size: 18px; font-weight: 800; color: #2a8a52; margin-left: auto; white-space: nowrap; }

    /* ── Bottom grid ── */
    .bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 24px; }
    .issues-card {
      background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px;
      padding: 24px; box-shadow: 0 2px 14px rgba(183,132,199,0.08);
    }
    .card-title { font-size: 14px; font-weight: 700; color: #2c1e3a; margin-bottom: 16px; }
    .issue-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0e4f8; font-size: 13px; color: #6b5a7a; }
    .issue-item:last-child { border-bottom: none; }
    .issue-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tips-card {
      background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px;
      padding: 24px; box-shadow: 0 2px 14px rgba(183,132,199,0.08);
    }
    .tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .tip-item {
      display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #6b5a7a;
      padding: 10px 12px; background: #f8f1fd; border-radius: 10px; border: 1px solid #e8d0f5;
    }
    .tip-check { color: #3a9a6a; flex-shrink: 0; margin-top: 1px; font-weight: 700; }
    .tip-check.amber { color: #c49520; }

    /* ── Study plan ── */
    .plan-card { background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px; padding: 24px; box-shadow: 0 2px 14px rgba(183,132,199,0.08); }
    .plan-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 10px; margin-top: 16px; }
    .day-col { background: #f5eaf9; border-radius: 12px; padding: 12px 8px; border: 1px solid #e4d0f0; }
    .day-header { font-size: 11px; font-weight: 700; color: #8244b8; text-align: center; margin-bottom: 10px; text-transform: uppercase; }
    .day-task { font-size: 11px; color: #6b5a7a; padding: 5px 0; display: flex; align-items: center; gap: 5px; border-bottom: 1px solid #ddd0ee; }
    .day-task:last-child { border-bottom: none; }
    .task-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    /* ── Analytics form ── */
    .form-card { background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px; padding: 28px; box-shadow: 0 2px 14px rgba(183,132,199,0.08); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
    .field-label { display: block; font-size: 11px; font-weight: 600; color: #9b8faa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
    .field-wrap {
      display: flex; align-items: center;
      background: #f5eef9; border: 1.5px solid #e2d0ee;
      border-radius: 11px; padding: 10px 14px; margin-bottom: 18px; transition: border 0.2s;
    }
    .field-wrap:focus-within { border-color: #b784c7; background: #fdf8ff; }
    .field-input { background: none; border: none; outline: none; color: #2c1e3a; font-size: 14px; font-family: 'DM Sans',sans-serif; width: 100%; }
    .field-input::placeholder { color: #c4b5d0; }
    .field-select { background: none; border: none; outline: none; color: #2c1e3a; font-size: 14px; font-family: 'DM Sans',sans-serif; width: 100%; }
    .field-select option { background: #f5eef9; color: #2c1e3a; }
    .predict-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg,#c07ad8,#8f54c0);
      color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
      cursor: pointer; font-family: 'DM Sans',sans-serif; margin-top: 8px; transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(155,107,181,0.28);
    }
    .predict-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(155,107,181,0.35); }
    .predict-btn:disabled { opacity: 0.5; transform: none; cursor: not-allowed; box-shadow: none; }
    .error-msg { color: #c0445a; font-size: 13px; margin-bottom: 12px; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-title { font-size: 18px; font-weight: 700; color: #9b8faa; margin-bottom: 8px; }
    .empty-sub { font-size: 13px; color: #c4b5d0; }
    .section-divider { height: 1.5px; background: #eedff5; border-radius: 2px; margin: 6px 0 22px; }
  `

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">🎓</div>
            <div className="brand-name">EduPredict</div>
          </div>
          {SIDEBAR.map(item => (
            <div key={item.key} className={`nav-item ${activeNav === item.key ? 'active' : ''}`} onClick={() => setActiveNav(item.key)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="nav-bottom">
            <button className="logout-btn" onClick={doLogout}>
              <span className="nav-icon">⏻</span><span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              {activeNav === 'dashboard' && 'Student Performance Dashboard'}
              {activeNav === 'plan'      && 'Study Plan'}
              {activeNav === 'analytics' && 'Analyze Parameters'}
            </div>
            <div className="user-chip">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <div className="user-name">Welcome, {user?.username}</div>
            </div>
          </div>

          <div className="content">

            {/* ── DASHBOARD ── */}
            {activeNav === 'dashboard' && (
              analyzed && result ? <>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Predicted Score</div>
                    <Gauge score={result.prediction.predicted_score} />
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Risk Level</div>
                    <div style={{ flex: 1, display:'flex', flexDirection:'column', justifyContent:'center', gap: 16 }}>
                      <div className="risk-badge" style={{ background: RISK_BG[riskLevel], color: RISK_COLOR[riskLevel], border:`1.5px solid ${RISK_COLOR[riskLevel]}50`, alignSelf:'center' }}>
                        {riskLevel === 'Low' ? '✓' : '⚠'} {riskLevel.toUpperCase()} RISK
                      </div>
                      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                        {Object.entries(result.prediction.confidence).map(([k,v]) => (
                          <div key={k} style={{ fontSize:11, color:'#9b8faa', background:'#f5eef9', padding:'4px 10px', borderRadius:6, border:'1px solid #e2d0ee' }}>
                            {k}: <span style={{ color:'#6b3fa8', fontWeight:700 }}>{v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Confidence</div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                      <div className="confidence-number">{result.prediction.confidence[riskLevel]}%</div>
                      <div className="confidence-sub">Model Accuracy</div>
                      <div style={{ width:'80%', height:6, background:'#f0e4f8', borderRadius:3, marginTop:14 }}>
                        <div style={{ width:`${result.prediction.confidence[riskLevel]}%`, height:'100%', background:'linear-gradient(90deg,#c07ad8,#8fc8f0)', borderRadius:3 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance trend */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Performance Trend &amp; Target</div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item"><div className="legend-dot" style={{ background:'#b784c7' }} />Current Trend</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background:'#f0c060' }} />Target</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#c07ad8" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#c07ad8" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eedff5" />
                      <XAxis dataKey="month" tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[30,100]} tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} />
                      <Area type="monotone" dataKey="score"  stroke="#b784c7" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill:'#b784c7', r:4 }} name="Score" />
                      <Line type="monotone" dataKey="target" stroke="#f0c060" strokeWidth={2} strokeDasharray="6 3" dot={{ fill:'#f0c060', r:3 }} name="Target" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* ── Score increase prediction if tips followed ── */}
                <div className="chart-card">
                  <div className="impact-banner">
                    <span className="impact-banner-icon">🚀</span>
                    <div className="impact-banner-text">
                      <strong>Score Increase Prediction</strong> — if personalized tips are followed consistently
                    </div>
                    <div className="impact-banner-gain">
                      +{Math.min(100, result.prediction.predicted_score + 18) - result.prediction.predicted_score} pts in 5 weeks
                    </div>
                  </div>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Projected Score — Tips Followed vs. Ignored</div>
                      <div className="chart-subtitle">Based on your personalized recommendations</div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item"><div className="legend-dot" style={{ background:'#5aaa7a' }} />Tips Followed</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background:'#e07a8a' }} />Tips Ignored</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={tipImpactData}>
                      <defs>
                        <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#5aaa7a" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#5aaa7a" stopOpacity={0}    />
                        </linearGradient>
                        <linearGradient id="ignoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#e07a8a" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#e07a8a" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eedff5" />
                      <XAxis dataKey="week" tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[Math.max(0, result.prediction.predicted_score - 10), Math.min(100, result.prediction.predicted_score + 25)]} tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} />
                      <Area type="monotone" dataKey="followed" stroke="#5aaa7a" strokeWidth={2.5} fill="url(#followGrad)" dot={{ fill:'#5aaa7a', r:4 }} name="Tips Followed" />
                      <Area type="monotone" dataKey="ignored"  stroke="#e07a8a" strokeWidth={2}   fill="url(#ignoreGrad)" dot={{ fill:'#e07a8a', r:3 }} name="Tips Ignored" strokeDasharray="5 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bottom-grid">
                  <div className="issues-card">
                    <div className="card-title">Key Issues</div>
                    {result.prediction.reasons.map((r, i) => (
                      <div key={i} className="issue-item">
                        <div className="issue-dot" style={{ background: i === 0 ? '#e07a8a' : i === 1 ? '#e0a850' : '#d4c040' }} />
                        {r}
                      </div>
                    ))}
                  </div>
                  <div className="tips-card">
                    <div className="card-title">Personalized Tips</div>
                    <div className="tips-grid">
                      {[...result.recommendations.general_tips, ...result.recommendations.subject_tips].slice(0, 4).map((t, i) => (
                        <div key={i} className="tip-item">
                          <span className={`tip-check ${i % 2 === 1 ? 'amber' : ''}`}>✔</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </> : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <div className="empty-title">No Analysis Yet</div>
                  <div className="empty-sub">Go to Analytics tab, enter your parameters and click Predict to see your dashboard.</div>
                </div>
              )
            )}

            {/* ── STUDY PLAN ── */}
            {activeNav === 'plan' && (
              analyzed && result ? (
                <div className="plan-card">
                  <div className="card-title">Study Plan</div>
                  <div className="plan-grid">
                    {result.recommendations.weekly_study_plan.map((d, i) => {
                      const colors = ['#b784c7','#5aaa7a','#e07a8a','#f0c060','#8fc8f0','#f0a880','#9b8faa']
                      return (
                        <div key={i} className="day-col">
                          <div className="day-header">{d.day.slice(0,3)}</div>
                          {d.tasks.map((t, j) => (
                            <div key={j} className="day-task">
                              <div className="task-dot" style={{ background: colors[j % colors.length] }} />
                              {t}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <div className="empty-title">Run Analysis First</div>
                  <div className="empty-sub">Your study plan will appear here after prediction.</div>
                </div>
              )
            )}

            {/* ── ANALYTICS / INPUT ── */}
            {activeNav === 'analytics' && (
              <div className="form-card">
                <div className="card-title" style={{ marginBottom:6 }}>Enter Your Study Parameters</div>
                <div className="section-divider" />
                <div className="form-grid">
                  {/* Course — full width */}
                  <div style={{ gridColumn:'1/-1' }}>
                    <label className="field-label">Course</label>
                    <div className="field-wrap">
                      <input className="field-input" type="text" name="course" value={form.course} onChange={handle} placeholder="e.g. B.Tech CSE, MBA, B.Sc Physics…" />
                    </div>
                  </div>

                  {FIELDS.map(f => (
                    <div key={f.name}>
                      <label className="field-label">{f.label}</label>
                      <div className="field-wrap">
                        <input className="field-input" type="number" name={f.name} min={f.min} max={f.max} step="0.1" value={form[f.name]} onChange={handle} />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="field-label">Weak Subject</label>
                    <div className="field-wrap">
                      <select className="field-select" name="weak_subjects" value={form.weak_subjects} onChange={handle}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {error && <div className="error-msg">{error}</div>}
                <button className="predict-btn" onClick={predict} disabled={loading}>
                  {loading ? '⟳  Analyzing…' : '→  Predict My Performance'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
