import { useState, useEffect, useRef } from 'react'
import { getExams, getResults, deleteExam } from '../api.js'

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function scoreColor(score, max) {
  if (max === 0) return 'var(--text-dim)'
  const pct = score / max
  if (pct >= 0.8) return 'var(--green)'
  if (pct >= 0.5) return 'var(--amber)'
  return 'var(--red)'
}

function MoreMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        className="btn btn-ghost"
        style={{ padding: '0.25rem 0.55rem', fontSize: '1rem', lineHeight: 1, border: 'none' }}
        onClick={() => setOpen(o => !o)}
        title="More options"
      >
        ⋯
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: '4px',
          background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 20, minWidth: '130px',
        }}>
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text)', font: 'inherit', fontSize: '0.875rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.background = 'var(--bg2)'}
            onMouseLeave={e => e.target.style.background = 'none'}
            onClick={() => { setOpen(false); onEdit() }}
          >
            ✎ Edit
          </button>
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--red)', font: 'inherit', fontSize: '0.875rem', padding: '0.6rem 1rem', cursor: 'pointer', borderTop: '1px solid var(--border)' }}
            onMouseEnter={e => e.target.style.background = 'var(--bg2)'}
            onMouseLeave={e => e.target.style.background = 'none'}
            onClick={() => { setOpen(false); onDelete() }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function Library({ navigate }) {
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getExams(), getResults()])
      .then(([e, r]) => { setExams(e); setResults(r) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this exam and all its results?')) return
    try {
      await deleteExam(id)
      setExams(e => e.filter(ex => ex.id !== id))
      setResults(r => r.filter(res => res.exam_id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Test Library</h1>
        <button className="btn btn-primary" onClick={() => navigate('create')}>
          + Create New Test
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="empty-state"><span className="spinner" /></div>
      ) : (
        <>
          <div className="section-title">Your Exams</div>
          {exams.length === 0 ? (
            <div className="empty-state">No exams yet. Create your first one!</div>
          ) : (
            <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
              {exams.map(exam => (
                <div
                  key={exam.id}
                  className="exam-card"
                  onClick={() => navigate('take', { examId: exam.id })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ flex: 1, marginRight: '0.5rem' }}>{exam.title}</h3>
                    <MoreMenu
                      onEdit={() => navigate('create', { editExamId: exam.id })}
                      onDelete={() => handleDelete(exam.id)}
                    />
                  </div>
                  <div className="meta" style={{ marginTop: '0.5rem' }}>
                    <div>{exam.question_count} question{exam.question_count !== 1 ? 's' : ''}</div>
                    <div>{fmt(exam.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section-title">Past Results</div>
          {results.length === 0 ? (
            <div className="empty-state">No results yet. Take an exam to see scores here.</div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Date Taken</th>
                    <th>Score</th>
                    <th>Pct</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const pct = r.max_score > 0 ? Math.round((r.total_score / r.max_score) * 100) : 0
                    return (
                      <tr key={r.id} onClick={() => navigate('result', { resultId: r.id })}>
                        <td>{r.exam_title}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{fmt(r.taken_at)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {r.total_score.toFixed(1)} / {r.max_score.toFixed(1)}
                        </td>
                        <td>
                          <span style={{ color: scoreColor(r.total_score, r.max_score), fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500 }}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
