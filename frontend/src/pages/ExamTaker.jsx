import { useState, useEffect } from 'react'
import { getExam, gradeExam } from '../api.js'

export default function ExamTaker({ examId, navigate }) {
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getExam(examId)
      .then(e => {
        const shuffled = [...e.questions].sort(() => Math.random() - 0.5)
        setExam({ ...e, questions: shuffled })
        const init = {}
        shuffled.forEach(q => { init[q.id] = '' })
        setAnswers(init)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [examId])

  function selectAnswer(qId, letter, correctAnswer) {
    if (revealed[qId]) return
    setAnswers(prev => ({ ...prev, [qId]: letter }))
    setRevealed(prev => ({ ...prev, [qId]: correctAnswer }))
  }

  function goNext() {
    setCurrent(i => i + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: Number(question_id),
        answer,
      }))
      const result = await gradeExam(examId, payload)
      navigate('result', { resultId: result.id })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page"><div className="empty-state"><span className="spinner" /></div></div>
  if (error && !exam) return <div className="page"><div className="error-box">{error}</div></div>

  const questions = exam.questions
  const total = questions.length
  const q = questions[current]
  const options = q?.options ? JSON.parse(q.options) : []
  const isRevealed = q ? !!revealed[q.id] : false
  const isCorrect = q ? answers[q.id] === revealed[q.id] : false
  const isLast = current === total - 1
  const progress = ((current) / total) * 100

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost" onClick={() => navigate('library')}>← Library</button>
          <div>
            <h1 className="page-title">{exam.title}</h1>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Pregunta {current + 1} de {total}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="score-bar-wrap" style={{ marginBottom: '2rem' }}>
        <div className="score-bar-fill" style={{ width: `${progress}%`, background: 'var(--amber)' }} />
      </div>

      {error && <div className="error-box">{error}</div>}

      {q && (
        <div className="card">
          <div className="q-num">MC · Pregunta {current + 1}</div>

          {/* Image (if present) */}
          {q.image_url && (
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <img
                src={q.image_url}
                alt="Obra de referencia"
                style={{
                  maxWidth: '100%',
                  maxHeight: '380px',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: '#111',
                }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                Observa la imagen antes de responder
              </div>
            </div>
          )}

          <div className="q-text" style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>{q.text}</div>

          <div className="mc-options">
            {options.map(opt => {
              const letter = opt.charAt(0)
              const isSelected = answers[q.id] === letter
              const isCorrectOpt = letter === revealed[q.id]
              let optClass = 'mc-option-btn'
              if (isRevealed) {
                if (isCorrectOpt) optClass += ' mc-correct'
                else if (isSelected) optClass += ' mc-wrong'
              } else if (isSelected) {
                optClass += ' selected'
              }
              return (
                <button
                  key={opt}
                  className={optClass}
                  onClick={() => selectAnswer(q.id, letter, q.correct_answer)}
                  disabled={isRevealed}
                >
                  <span className="mc-opt-letter">{letter.toUpperCase()}</span>
                  <span>{opt.slice(2).trim()}</span>
                  {isRevealed && isCorrectOpt && <span className="mc-opt-badge mc-opt-badge--correct">✓</span>}
                  {isRevealed && isSelected && !isCorrectOpt && <span className="mc-opt-badge mc-opt-badge--wrong">✗</span>}
                </button>
              )
            })}
          </div>

          {/* Feedback + Next button */}
          {isRevealed && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                background: isCorrect ? 'rgba(61,214,140,0.08)' : 'rgba(248,113,113,0.08)',
                borderLeft: `3px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`,
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 600, color: isCorrect ? 'var(--green)' : 'var(--red)', marginBottom: q.feedback ? '0.4rem' : 0 }}>
                  {isCorrect ? '¡Correcto!' : `Incorrecto — Respuesta correcta: ${revealed[q.id].toUpperCase()}`}
                </div>
                {q.feedback && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>{q.feedback}</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!isLast ? (
                  <button className="btn btn-primary" onClick={goNext}>Siguiente →</button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><span className="spinner" /> Guardando…</> : 'Ver resultados'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
