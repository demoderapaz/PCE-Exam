import { useState, useEffect } from 'react'
import { getResult, getExam, selfGrade } from '../api.js'

function scoreClass(score, max) {
  if (score < 0) return 'partial'  // pending
  if (max === 0) return ''
  const pct = score / max
  if (pct >= 1) return 'full'
  if (pct > 0) return 'partial'
  return 'zero'
}

function scoreBarColor(pct) {
  if (pct >= 0.8) return 'var(--green)'
  if (pct >= 0.5) return 'var(--amber)'
  return 'var(--red)'
}

export default function Results({ resultId, navigate }) {
  const [result, setResult] = useState(null)
  const [examTitle, setExamTitle] = useState('')
  const [selfScores, setSelfScores] = useState({})   // answerId -> { score, feedback }
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResult(resultId)
      .then(r => {
        setResult(r)
        // Init self-scores for long answers
        const init = {}
        r.answers.forEach(ar => {
          if (ar.question.type === 'long') {
            init[ar.id] = { score: ar.score >= 0 ? ar.score : 5, feedback: ar.feedback || '' }
          }
        })
        setSelfScores(init)
        // Check if already graded
        const allGraded = r.answers.every(ar => ar.score >= 0)
        setSubmitted(allGraded)
        return getExam(r.exam_id)
      })
      .then(exam => setExamTitle(exam.title))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [resultId])

  const longAnswers = result?.answers.filter(ar => ar.question.type === 'long') || []
  const needsSelfGrade = longAnswers.length > 0 && !submitted

  async function handleSelfGrade() {
    setSaving(true)
    setError(null)
    try {
      const scores = Object.entries(selfScores).map(([id, val]) => ({
        answer_result_id: Number(id),
        score: Number(val.score),
        feedback: val.feedback,
      }))
      const updated = await selfGrade(resultId, scores)
      setResult(updated)
      setSubmitted(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><div className="empty-state"><span className="spinner" /></div></div>
  if (error && !result) return <div className="page"><div className="error-box">{error}</div></div>

  const pct = result.max_score > 0 ? result.total_score / result.max_score : 0
  const pctDisplay = Math.round(pct * 100)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost" onClick={() => navigate('library')}>← Library</button>
          <div>
            <h1 className="page-title">Results</h1>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{examTitle}</div>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Score summary */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem' }}>
            {submitted ? `${result.total_score.toFixed(1)} / ${result.max_score.toFixed(1)}` : 'Pending self-grade'}
          </span>
          {submitted && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: scoreBarColor(pct) }}>
              {pctDisplay}%
            </span>
          )}
        </div>
        {submitted && (
          <div className="score-bar-wrap">
            <div className="score-bar-fill" style={{ width: `${pctDisplay}%`, background: scoreBarColor(pct) }} />
          </div>
        )}
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }} onClick={() => navigate('take', { examId: result.exam_id })}>
          Retake Test
        </button>
      </div>

      <div className="section-title">Question Breakdown</div>

      {result.answers.map((ar, i) => {
        const q = ar.question
        const isPending = ar.score < 0
        const cls = isPending ? 'partial' : scoreClass(ar.score, ar.max_score)
        const options = q.options ? JSON.parse(q.options) : []

        return (
          <div key={ar.id} className={`q-result ${cls}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="q-num">{q.type === 'mc' ? 'MC' : 'LONG'} · Question {i + 1}</div>
              {!isPending && (
                <div className="q-score" style={{ color: cls === 'full' ? 'var(--green)' : cls === 'partial' ? 'var(--amber)' : 'var(--red)' }}>
                  {ar.score.toFixed(1)} / {ar.max_score.toFixed(1)}
                </div>
              )}
            </div>

            <div className="q-text">{q.text}</div>

            {q.type === 'mc' ? (
              <div className="q-answer-row">
                <div>
                  <div className="q-answer-label">Your answer</div>
                  <div className="q-answer-value">{ar.user_answer || '—'}</div>
                </div>
                <div>
                  <div className="q-answer-label">Correct answer</div>
                  <div className="q-answer-value" style={{ color: 'var(--green)' }}>{q.correct_answer}</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="q-answer-label">Your answer</div>
                  <div className="q-answer-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {ar.user_answer || <em style={{ color: 'var(--text-dim)' }}>No answer provided</em>}
                  </div>
                </div>

                {/* Model answer always shown for long questions */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="q-answer-label" style={{ color: 'var(--green)' }}>Model answer</div>
                  <div className="q-answer-value" style={{ whiteSpace: 'pre-wrap', borderColor: 'var(--green)', color: 'var(--text-dim)' }}>
                    {q.correct_answer || <em>No model answer provided</em>}
                  </div>
                </div>

                {q.rubric && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div className="q-answer-label">Rubric</div>
                    <div className="q-answer-value" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-dim)', fontSize: '0.82rem' }}>{q.rubric}</div>
                  </div>
                )}

                {/* Self-grade controls */}
                {!submitted && selfScores[ar.id] !== undefined && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <div className="q-answer-label" style={{ marginBottom: '0.5rem' }}>Your score (0 – 10)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <input
                        type="range"
                        min={0} max={10} step={0.5}
                        value={selfScores[ar.id].score}
                        onChange={e => setSelfScores(s => ({ ...s, [ar.id]: { ...s[ar.id], score: e.target.value } }))}
                        style={{ flex: 1, accentColor: 'var(--amber)', minWidth: '140px' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', minWidth: '2.5rem', textAlign: 'right' }}>
                        {Number(selfScores[ar.id].score).toFixed(1)}
                      </span>
                    </div>
                    <textarea
                      style={{ width: '100%', marginTop: '0.5rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', font: 'inherit', padding: '0.5rem 0.7rem', minHeight: '60px', resize: 'vertical', outline: 'none', fontSize: '0.85rem' }}
                      placeholder="Optional notes on your answer…"
                      value={selfScores[ar.id].feedback}
                      onChange={e => setSelfScores(s => ({ ...s, [ar.id]: { ...s[ar.id], feedback: e.target.value } }))}
                    />
                  </div>
                )}

                {submitted && ar.feedback && (
                  <div className="q-feedback">{ar.feedback}</div>
                )}
              </>
            )}
          </div>
        )
      })}

      {needsSelfGrade && (
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleSelfGrade} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : 'Submit Self-Grade'}
          </button>
        </div>
      )}
    </div>
  )
}
