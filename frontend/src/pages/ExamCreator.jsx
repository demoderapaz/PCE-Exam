import { useState, useRef, useEffect } from 'react'
import { createExam, updateExam, uploadDocument, getExam } from '../api.js'

const emptyMC = () => ({
  type: 'mc',
  text: '',
  options: ['A) ', 'B) ', 'C) ', 'D) '],
  correct_answer: 'A',
  feedback: '',
  image_url: '',
  rubric: null,
})

const emptyLong = () => ({
  type: 'long',
  text: '',
  options: null,
  correct_answer: '',
  rubric: '',
})

const TOPICS = ['Historia del Arte', 'Empresa']

export default function ExamCreator({ navigate, editExamId }) {
  const [step, setStep] = useState(editExamId ? 1 : 0)  // 0 = topic picker, 1 = form
  const [topic, setTopic] = useState('')
  const [title, setTitle] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [fileName, setFileName] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!editExamId)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  // Load existing exam when editing
  useEffect(() => {
    if (!editExamId) return
    getExam(editExamId)
      .then(exam => {
        setTopic(exam.topic)
        setTitle(exam.title)
        setSourceText(exam.source_text || '')
        setQuestions(exam.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text,
          options: q.options ? JSON.parse(q.options) : null,
          correct_answer: q.correct_answer || '',
          feedback: q.feedback || '',
          image_url: q.image_url || '',
          _previewUrl: q.image_url || '',
          rubric: q.rubric || '',
        })))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [editExamId])

  // ── Resolve Wikipedia media viewer URLs to direct image URLs ──
  async function resolveImageUrl(i, rawUrl) {
    const match = rawUrl.match(/wikipedia\.org\/wiki\/[^#]+#\/media\/File:(.+)/)
    if (!match) {
      updateQuestion(i, '_previewUrl', rawUrl)
      return
    }
    const fileName = decodeURIComponent(match[1])
    try {
      const api = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`
      const res = await fetch(api)
      const data = await res.json()
      const pages = data.query.pages
      const page = pages[Object.keys(pages)[0]]
      const directUrl = page.imageinfo?.[0]?.url
      if (directUrl) {
        updateQuestion(i, 'image_url', directUrl)
        updateQuestion(i, '_previewUrl', directUrl)
      } else {
        updateQuestion(i, '_previewUrl', rawUrl)
      }
    } catch {
      updateQuestion(i, '_previewUrl', rawUrl)
    }
  }

  // ── File upload ──────────────────────────────────────────
  async function handleFile(file) {
    if (!file) return
    try {
      const res = await uploadDocument(file)
      setSourceText(res.text)
      setFileName(file.name)
    } catch (e) {
      setError(`File upload failed: ${e.message}`)
    }
  }

  // ── Question management ──────────────────────────────────
  function addQuestion(type) {
    setQuestions(qs => [...qs, type === 'mc' ? emptyMC() : emptyLong()])
  }

  function removeQuestion(i) {
    setQuestions(qs => qs.filter((_, idx) => idx !== i))
  }

  function updateQuestion(i, field, value) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  function updateOption(qi, oi, value) {
    setQuestions(qs => qs.map((q, idx) => {
      if (idx !== qi) return q
      const opts = [...q.options]
      // Keep the letter prefix (e.g. "A) ") intact
      const prefix = opts[oi].slice(0, 3)
      opts[oi] = prefix + value
      return { ...q, options: opts }
    }))
  }

  function moveQuestion(i, dir) {
    setQuestions(qs => {
      const arr = [...qs]
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  // ── Save ─────────────────────────────────────────────────
  async function handleSave() {
    if (!topic.trim()) { setError('Topic is required.'); return }
    if (questions.length === 0) { setError('Add at least one question.'); return }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { setError(`Question ${i + 1} has no text.`); return }
      if (q.type === 'mc' && !q.correct_answer) { setError(`Question ${i + 1}: select the correct answer.`); return }
    }
    setError(null)
    setSaving(true)
    try {
      const payload = {
        topic: topic.trim(),
        title: title.trim() || undefined,
        source_text: sourceText || undefined,
        questions: questions.map(({ id: _id, _previewUrl: _p, ...q }) => ({
          ...q,
          image_url: q.image_url?.trim() || null,
          feedback: q.feedback?.trim() || null,
        })),
      }
      if (editExamId) {
        await updateExam(editExamId, payload)
      } else {
        await createExam(payload)
      }
      navigate('library')
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="page">
      {/* ── Step 0: Topic picker ── */}
      {step === 0 && (
        <>
          <div className="page-header">
            <h1 className="page-title">Select a Topic</h1>
            <button className="btn btn-ghost" onClick={() => navigate('library')}>← Back</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => { setTopic(t); setStep(1) }}
                style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px',
                  color: 'var(--text)', fontFamily: 'var(--font-head)', fontSize: '1.2rem',
                  padding: '2rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)' }}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Step 1: Exam form ── */}
      {loading && <div className="empty-state"><span className="spinner" /></div>}
      {step === 1 && !loading && <><div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost" onClick={() => editExamId ? navigate('library') : setStep(0)}>← Back</button>
          <h1 className="page-title">{editExamId ? 'Edit Exam' : 'Create Exam'}</h1>
        </div>
        {editExamId && (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
          </button>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ── Metadata ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Exam Info</div>
        <div className="form-group">
          <label>Topic *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The French Revolution" style={{ flex: 1 }} />
            {!editExamId && (
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => setStep(0)}>
                Change
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Title (optional — auto-generated if blank)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Exam — Unit 3" />
        </div>

        {/* Source text */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Source Text (optional — paste or upload)</label>
          <div
            className={`drop-zone ${dragging ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
            style={{ marginBottom: '0.5rem' }}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          >
            {fileName ? `✓ ${fileName}` : 'Drag & drop .txt / .pdf / .md, or click to browse'}
          </div>
          <input ref={fileRef} type="file" accept=".txt,.pdf,.md" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <textarea
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Or paste your reference text here…"
            style={{ minHeight: '100px' }}
          />
        </div>
      </div>

      {/* ── Questions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="section-title" style={{ marginBottom: 0, border: 'none' }}>
          Questions ({questions.length})
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={() => addQuestion('mc')}>+ Multiple Choice</button>
          <button className="btn btn-ghost" onClick={() => addQuestion('long')}>+ Long Answer</button>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="empty-state" style={{ padding: '2rem 0' }}>No questions yet. Add one above.</div>
      )}

      {questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Q{i + 1} · {q.type === 'mc' ? 'MULTIPLE CHOICE' : 'LONG ANSWER'}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => moveQuestion(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}>↓</button>
              <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => removeQuestion(i)}>✕</button>
            </div>
          </div>

          {/* Question text */}
          <div className="form-group">
            <label>Question</label>
            <textarea value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)} placeholder="Write your question here…" style={{ minHeight: '70px' }} />
          </div>

          {q.type === 'mc' ? (
            <>
              <div className="form-group">
                <label>Image URL <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="url"
                    value={q.image_url || ''}
                    onChange={e => updateQuestion(i, 'image_url', e.target.value)}
                    placeholder="https://upload.wikimedia.org/wikipedia/commons/…"
                    style={{ flex: 1 }}
                  />
                  {q.image_url?.trim() && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                      onClick={() => resolveImageUrl(i, q.image_url.trim())}
                    >
                      Ver imagen
                    </button>
                  )}
                </div>
                {q._previewUrl && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img
                      key={q._previewUrl}
                      src={q._previewUrl}
                      alt="Preview"
                      style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border)', objectFit: 'contain', background: 'var(--bg3)', display: 'block' }}
                      onError={e => { e.target.replaceWith(Object.assign(document.createElement('p'), { textContent: '⚠️ No se pudo cargar la imagen. Comprueba la URL.', style: 'color:var(--red);font-size:0.85rem;margin-top:0.4rem' })) }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Options</label>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.85rem', minWidth: '1.5rem' }}>{opt.slice(0, 2)}</span>
                    <input
                      type="text"
                      style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '0.45rem 0.7rem', font: 'inherit', outline: 'none' }}
                      value={opt.slice(3)}
                      onChange={e => updateOption(i, oi, e.target.value)}
                      placeholder={`Option ${opt.slice(0, 1)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Correct Answer</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['A', 'B', 'C', 'D'].map(letter => (
                    <label key={letter} className={`mc-option ${q.correct_answer === letter ? 'selected' : ''}`} style={{ cursor: 'pointer', padding: '0.4rem 1rem' }}>
                      <input type="radio" name={`correct-${i}`} value={letter} checked={q.correct_answer === letter} onChange={() => updateQuestion(i, 'correct_answer', letter)} style={{ marginRight: '0.3rem', accentColor: 'var(--amber)' }} />
                      {letter}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Feedback <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(shown after answering)</span></label>
                <textarea
                  value={q.feedback || ''}
                  onChange={e => updateQuestion(i, 'feedback', e.target.value)}
                  placeholder="Explain why the correct answer is right, and why the distractors are wrong…"
                  style={{ minHeight: '70px' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Model Answer</label>
                <textarea value={q.correct_answer} onChange={e => updateQuestion(i, 'correct_answer', e.target.value)} placeholder="Write the expected answer / key points…" style={{ minHeight: '90px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Rubric (optional)</label>
                <textarea value={q.rubric} onChange={e => updateQuestion(i, 'rubric', e.target.value)} placeholder="e.g. Award points for: 1) … 2) … 3) …" style={{ minHeight: '70px' }} />
              </div>
            </>
          )}
        </div>
      ))}

      {questions.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : editExamId ? 'Save Changes' : 'Save Exam'}
          </button>
        </div>
      )}
      </>}
    </div>
  )
}
