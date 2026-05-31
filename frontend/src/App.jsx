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
          <span className="topbar-brand" onClick={() => navigate('library')}>
            PCE-Exam
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
