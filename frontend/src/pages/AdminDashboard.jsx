import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

const RISK_COLOR = { High: '#e07a8a', Medium: '#c49520', Low: '#3a9a6a' }
const RISK_BG    = { High: 'rgba(224,122,138,0.12)', Medium: 'rgba(196,149,32,0.12)', Low: 'rgba(58,154,106,0.12)' }
const PIE_COLORS = ['#e07a8a','#f0c060','#88d4a8']

const MODEL_DATA = [
  { name: 'Logistic Reg',  accuracy: 78 },
  { name: 'Decision Tree', accuracy: 67 },
  { name: 'Random Forest', accuracy: 75 },
  { name: 'Grad Boosting', accuracy: 82 },
]

const FEATURE_DATA = [
  { name: 'Attendance',  importance: 30 },
  { name: 'Study Hours', importance: 22 },
  { name: 'Prev Score',  importance: 18 },
  { name: 'Weekly Test', importance: 12 },
  { name: 'Screen Time', importance: 8  },
  { name: 'Assignment',  importance: 6  },
  { name: 'Sleep',       importance: 4  },
]

const SIDEBAR = [
  { icon: '⊞', label: 'Dashboard',      key: 'dashboard' },
  { icon: '📊', label: 'ML Analytics',  key: 'ml'        },
  { icon: '📝', label: 'Analyze Student', key: 'analyze'  },
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f7f2fc; color: #2c1e3a; }
  .layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px; background: #fffaf7; border-right: 1.5px solid #e8d8f0;
    display: flex; flex-direction: column; padding: 24px 16px;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 10;
    box-shadow: 2px 0 16px rgba(183,132,199,0.09);
  }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 32px; }
  .brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg,#c89ee0,#8fc8f0); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .brand-name { font-size: 16px; font-weight: 700; color: #2c1e3a; letter-spacing:-0.3px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #9b8faa; margin-bottom: 4px; transition: all 0.2s; }
  .nav-item:hover { background: #f5eef9; color: #2c1e3a; }
  .nav-item.active { background: #eedff8; color: #7a3fb8; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-bottom { margin-top: auto; }
  .logout-btn { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #d05a70; width: 100%; background: none; border: none; font-family: 'DM Sans',sans-serif; transition: all 0.2s; }
  .logout-btn:hover { background: #ffeef2; }

  /* ── Main ── */
  .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; }
  .topbar { background: #fffaf7; border-bottom: 1.5px solid #e8d8f0; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 5; }
  .topbar-title { font-size: 20px; font-weight: 700; color: #2c1e3a; letter-spacing:-0.3px; }
  .user-chip { display: flex; align-items: center; gap: 10px; background: #f5eef9; padding: 8px 16px; border-radius: 20px; border: 1px solid #e2d0ee; }
  .user-avatar { width: 30px; height: 30px; background: linear-gradient(135deg,#c89ee0,#8fc8f0); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; }
  .user-name { font-size: 13px; font-weight: 600; color: #9b8faa; }
  .content { padding: 28px 32px; flex: 1; }

  /* ── Cards ── */
  .card { background: #fffaf7; border: 1.5px solid #e8d8f0; border-radius: 18px; padding: 24px; box-shadow: 0 2px 14px rgba(183,132,199,0.08); }
  .card-title { font-size: 14px; font-weight: 700; color: #2c1e3a; margin-bottom: 20px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .mb20 { margin-bottom: 20px; }
  .stat-mini { text-align: center; padding: 8px 0; }
  .stat-mini-val { font-size: 32px; font-weight: 800; }
  .stat-mini-label { font-size: 11px; color: #9b8faa; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .risk-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 15px; font-weight: 800; }

  .warning-box { background: #fff0f2; border: 1.5px solid #f0c0c8; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .warning-title { font-size: 14px; font-weight: 700; color: #c04060; margin-bottom: 4px; }
  .warning-sub { font-size: 12px; color: #d07088; }

  .action-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f0e4f8; font-size: 13px; color: #6b5a7a; }
  .action-item:last-child { border-bottom: none; }
  .action-check { color: #3a9a6a; flex-shrink: 0; font-weight: 700; }

  /* ── Student header ── */
  .student-header { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f5eef9; border-radius: 14px; margin-bottom: 20px; border: 1.5px solid #e2d0ee; }
  .student-avatar { width: 44px; height: 44px; background: linear-gradient(135deg,#c89ee0,#8fc8f0); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: white; }
  .student-name { font-size: 16px; font-weight: 700; color: #2c1e3a; }
  .student-roll { font-size: 12px; color: #9b8faa; margin-top: 2px; }
  .student-course { font-size: 12px; color: #8244b8; font-weight: 600; margin-top: 2px; }

  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .field-label { display: block; font-size: 11px; font-weight: 600; color: #9b8faa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
  .field-wrap { display: flex; align-items: center; background: #f5eef9; border: 1.5px solid #e2d0ee; border-radius: 11px; padding: 10px 14px; margin-bottom: 18px; transition: border 0.2s; }
  .field-wrap:focus-within { border-color: #b784c7; background: #fdf8ff; }
  .field-input { background: none; border: none; outline: none; color: #2c1e3a; font-size: 14px; font-family: 'DM Sans',sans-serif; width: 100%; }
  .field-input::placeholder { color: #c4b5d0; }
  .submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg,#c07ad8,#8f54c0); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; margin-top: 8px; transition: all 0.2s; box-shadow: 0 4px 14px rgba(155,107,181,0.28); }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(155,107,181,0.35); }
  .submit-btn:disabled { opacity: 0.5; transform: none; cursor: not-allowed; box-shadow: none; }
  .error-msg { color: #c0445a; font-size: 13px; margin-bottom: 12px; }
  .section-divider { height: 1.5px; background: #eedff5; border-radius: 2px; margin: 6px 0 22px; }

  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-size: 18px; font-weight: 700; color: #9b8faa; margin-bottom: 8px; }
  .empty-sub { font-size: 13px; color: #c4b5d0; }
`

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('analyze')
  const [form, setForm] = useState({
    student_name: '', roll_number: '', course: '',
    prev_semester_score: 60, attendance: 80,
    weekly_test_score: 65, assignment_score: 70, monthly_scores: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => {
    const v = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setForm(f => ({ ...f, [e.target.name]: v }))
  }

  const predict = async () => {
    setLoading(true); setError('')
    try {
      const monthly = form.monthly_scores
        ? form.monthly_scores.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
        : []
      const res = await api.post('/admin/predict', { ...form, monthly_scores: monthly })
      setResult(res.data)
      setActiveNav('dashboard')
    } catch (e) { setError(e.response?.data?.detail || 'Prediction failed') }
    setLoading(false)
  }

  const doLogout = () => { logout(); navigate('/') }
  const riskLevel = result?.prediction?.risk_level || 'Low'

  const pieData = [
    { name: 'High Risk',   value: 18 },
    { name: 'Medium Risk', value: 40 },
    { name: 'Low Risk',    value: 42 },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">🏫</div>
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
              <span className="nav-icon">⏻</span> Logout
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              {activeNav === 'dashboard' && 'Student Analysis Result'}
              {activeNav === 'ml'        && 'ML Analytics'}
              {activeNav === 'analyze'   && 'Analyze Student'}
            </div>
            <div className="user-chip">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <div className="user-name">Admin: {user?.username}</div>
            </div>
          </div>

          <div className="content">

            {/* ── DASHBOARD — Results ── */}
            {activeNav === 'dashboard' && (
              result ? <>
                <div className="student-header">
                  <div className="student-avatar">{result.student_name?.[0]?.toUpperCase() || 'S'}</div>
                  <div>
                    <div className="student-name">{result.student_name}</div>
                    <div className="student-roll">Roll No: {result.roll_number}</div>
                    {result.course && <div className="student-course">Course: {result.course}</div>}
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    <div className="risk-badge" style={{ background: RISK_BG[riskLevel], color: RISK_COLOR[riskLevel], border:`1.5px solid ${RISK_COLOR[riskLevel]}50` }}>
                      {riskLevel === 'Low' ? '✓' : '⚠'} {riskLevel.toUpperCase()} RISK
                    </div>
                  </div>
                </div>

                <div className="grid2">
                  <div className="card">
                    <div className="card-title">Prediction Summary</div>
                    <div className="stat-mini" style={{ marginBottom:20 }}>
                      <div className="stat-mini-val" style={{ color: RISK_COLOR[riskLevel] }}>{result.prediction.predicted_score}</div>
                      <div className="stat-mini-label">Predicted Score / 100</div>
                    </div>
                    {result.prediction.early_warning && (
                      <div className="warning-box">
                        <div className="warning-title">⚠ Early Warning Triggered</div>
                        <div className="warning-sub">Student requires immediate academic intervention.</div>
                      </div>
                    )}
                    <div className="card-title">Suggested Actions</div>
                    {result.prediction.suggested_actions.map((a, i) => (
                      <div key={i} className="action-item">
                        <span className="action-check">✔</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="card-title">Performance Trend</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={result.performance_graph}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eedff5" />
                        <XAxis dataKey="month" tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0,100]} tick={{ fill:'#9b8faa', fontSize:12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} />
                        <Line type="monotone" dataKey="actual"    stroke="#b784c7" strokeWidth={2.5} dot={{ fill:'#b784c7', r:4 }} name="Actual" connectNulls />
                        <Line type="monotone" dataKey="projected" stroke="#f0c060" strokeWidth={2}   strokeDasharray="6 3" dot={{ fill:'#f0c060', r:3 }} name="Projected" connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </> : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No Analysis Yet</div>
                  <div className="empty-sub">Go to Analyze Student tab and submit student details.</div>
                </div>
              )
            )}

            {/* ── ML ANALYTICS ── */}
            {activeNav === 'ml' && (
              <>
                <div className="grid2 mb20">
                  <div className="card">
                    <div className="card-title">Model Comparison</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={MODEL_DATA} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eedff5" />
                        <XAxis dataKey="name" tick={{ fill:'#9b8faa', fontSize:11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[50,100]} tick={{ fill:'#9b8faa', fontSize:11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} formatter={v => `${v}%`} />
                        <Bar dataKey="accuracy" name="Accuracy" radius={[6,6,0,0]}>
                          {MODEL_DATA.map((_, i) => <Cell key={i} fill={i === 3 ? '#88d4a8' : i === 0 ? '#b784c7' : '#8fc8f0'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <div className="card-title">Risk Distribution (Institution)</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} formatter={v => `${v}%`} />
                        <Legend formatter={v => <span style={{ color:'#9b8faa', fontSize:12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Feature Importance (Random Forest)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={FEATURE_DATA} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eedff5" horizontal={false} />
                      <XAxis type="number" tick={{ fill:'#9b8faa', fontSize:11 }} axisLine={false} tickLine={false} domain={[0,35]} />
                      <YAxis type="category" dataKey="name" tick={{ fill:'#6b5a7a', fontSize:12 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ background:'#fffaf7', border:'1px solid #e2d0ee', borderRadius:8, color:'#2c1e3a', fontSize:12 }} formatter={v => `${v}%`} />
                      <Bar dataKey="importance" name="Importance" radius={[0,6,6,0]}>
                        {FEATURE_DATA.map((_, i) => <Cell key={i} fill={`hsl(${270 + i * 18}, 50%, ${65 - i * 3}%)`} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* ── ANALYZE STUDENT FORM ── */}
            {activeNav === 'analyze' && (
              <div className="card">
                <div className="card-title" style={{ marginBottom:6 }}>Enter Student Academic Details</div>
                <div className="section-divider" />
                <div className="form-grid">

                  {/* Student Name */}
                  <div>
                    <label className="field-label">Student Name</label>
                    <div className="field-wrap">
                      <input className="field-input" type="text" name="student_name" value={form.student_name} onChange={handle} placeholder="e.g. Rahul Kumar" />
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="field-label">Roll Number</label>
                    <div className="field-wrap">
                      <input className="field-input" type="text" name="roll_number" value={form.roll_number} onChange={handle} placeholder="e.g. 21CS001" />
                    </div>
                  </div>

                  {/* Course — full width */}
                  <div style={{ gridColumn:'1/-1' }}>
                    <label className="field-label">Course</label>
                    <div className="field-wrap">
                      <input className="field-input" type="text" name="course" value={form.course} onChange={handle} placeholder="e.g. B.Tech CSE, MBA, B.Sc Physics…" />
                    </div>
                  </div>

                  {/* Numeric fields — no emojis */}
                  {[
                    { name:'prev_semester_score', label:'Prev Semester Score (%)' },
                    { name:'attendance',           label:'Attendance (%)'          },
                    { name:'weekly_test_score',    label:'Weekly Test Score (%)'   },
                    { name:'assignment_score',     label:'Assignment Score (%)'    },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="field-label">{f.label}</label>
                      <div className="field-wrap">
                        <input className="field-input" type="number" name={f.name} value={form[f.name]} onChange={handle} min={0} max={100} step="0.1" />
                      </div>
                    </div>
                  ))}

                  {/* Monthly scores — full width */}
                  <div style={{ gridColumn:'1/-1' }}>
                    <label className="field-label">Monthly Scores (comma-separated, optional)</label>
                    <div className="field-wrap">
                      <input className="field-input" name="monthly_scores" value={form.monthly_scores} onChange={handle} placeholder="e.g. 60, 65, 72, 68" />
                    </div>
                  </div>

                </div>
                {error && <div className="error-msg">{error}</div>}
                <button className="submit-btn" onClick={predict} disabled={loading}>
                  {loading ? '⟳  Analyzing…' : '→  Analyze Student'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
