import { useState, useEffect } from 'react'
import Library from './pages/Library.jsx'
import ExamCreator from './pages/ExamCreator.jsx'
import ExamTaker from './pages/ExamTaker.jsx'
import Results from './pages/Results.jsx'
import Contents from './pages/Contents.jsx'
import { listSubjects } from './api.js'

export default function App() {
  const [page, setPage] = useState({ name: 'library' })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [subjects, setSubjects] = useState([])
  const [subject, setSubject] = useState(() => localStorage.getItem('subject') || '')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    listSubjects().then(list => {
      setSubjects(list)
      if (!subject && list.length > 0) setSubject(list[0])
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('subject', subject)
  }, [subject])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const navigate = (name, params = {}) => setPage({ name, ...params })

  return (
    <div className="app-shell">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="topbar-brand" onClick={() => navigate('library')} style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="120" height="36" viewBox="0 0 260 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Book/bubble icon */}
              <rect x="4" y="10" width="48" height="42" rx="8" fill="url(#grad1)"/>
              <rect x="10" y="16" width="36" height="30" rx="4" fill="white" fillOpacity="0.9"/>
              <polygon points="26,22 26,40 40,31" fill="url(#grad2)"/>
              <path d="M16 56 L22 48 H52 A8 8 0 0 0 60 40 V18" stroke="url(#grad1)" strokeWidth="0" fill="none"/>
              {/* Rays */}
              <line x1="22" y1="8" x2="20" y2="2" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round"/>
              <line x1="28" y1="6" x2="28" y2="0" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
              <line x1="34" y1="8" x2="36" y2="2" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"/>
              {/* Text */}
              <text x="64" y="43" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="26" fill="#1e2d6e">Learning-app</text>
              <defs>
                <linearGradient id="grad1" x1="4" y1="10" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60A5FA"/>
                  <stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
                <linearGradient id="grad2" x1="26" y1="22" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60A5FA"/>
                  <stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          {subjects.length > 0 && (
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="subject-select"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        <div className="topbar-pill">
          {['contents', 'library'].map(name => (
            <button
              key={name}
              className={`pill-tab${page.name === name ? ' pill-tab--active' : ''}`}
              onClick={() => navigate(name)}
            >
              {name === 'library' ? 'Test Library' : 'Contents'}
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            style={{ fontSize: '1rem', padding: '0.25rem 0.4rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main>
        {page.name === 'library' && (
          <Library navigate={navigate} />
        )}
        {page.name === 'create' && (
          <ExamCreator navigate={navigate} editExamId={page.editExamId || null} />
        )}
        {page.name === 'take' && (
          <ExamTaker examId={page.examId} navigate={navigate} />
        )}
        {page.name === 'result' && (
          <Results resultId={page.resultId} navigate={navigate} />
        )}
        {page.name === 'contents' && (
          <Contents navigate={navigate} subject={subject} />
        )}
      </main>
    </div>
  )
}
