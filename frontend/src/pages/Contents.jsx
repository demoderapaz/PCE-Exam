import { useState, useEffect, useRef } from 'react'
import { listContents, getContent } from '../api.js'

const SUBJECT_LABELS = {
  'art-history': 'Historia del Arte',
  'empresa': 'Empresa',
}

function subjectColor(subject) {
  const map = {
    'art-history': 'var(--amber)',
    'empresa': 'var(--green)',
  }
  return map[subject] || 'var(--text-dim)'
}

function MarkdownViewer({ content }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current || !content) return
    const html = window.marked ? window.marked.parse(content) : content
    ref.current.innerHTML = html
  }, [content])
  return <div ref={ref} className="md-body" />
}

export default function Contents({ navigate, subject }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)   // { subject, slug, title, content }
  const [loadingDoc, setLoadingDoc] = useState(false)

  useEffect(() => {
    listContents()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function openContent(item) {
    setLoadingDoc(true)
    try {
      const doc = await getContent(item.subject, item.slug)
      setSelected(doc)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingDoc(false)
    }
  }

  // ── Group by subject ────────────────────────────────────────
  const filtered = subject ? items.filter(i => i.subject === subject) : items
  const grouped = filtered.reduce((acc, item) => {
    const g = acc[item.subject] || []
    g.push(item)
    acc[item.subject] = g
    return acc
  }, {})

  // ── Viewer ──────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>← Volver</button>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>
                {SUBJECT_LABELS[selected.subject] || selected.subject}
              </div>
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{selected.title}</h1>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '2rem 2.5rem' }}>
          {loadingDoc
            ? <div className="empty-state"><span className="spinner" /></div>
            : <MarkdownViewer content={selected.content} />
          }
        </div>
      </div>
    )
  }

  // ── Card grid ───────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contenidos</h1>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="empty-state"><span className="spinner" /></div>
      ) : (
        Object.entries(grouped).map(([subject, docs]) => (
          <div key={subject} style={{ marginBottom: '2rem' }}>
            <div className="section-title" style={{ color: subjectColor(subject) }}>
              {SUBJECT_LABELS[subject] || subject}
            </div>
            <div className="card-grid">
              {docs.map(item => (
                <button
                  key={item.slug}
                  onClick={() => openContent(item)}
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '1.4rem 1.25rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                    color: 'var(--text)',
                    font: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = subjectColor(subject); e.currentTarget.style.background = 'var(--bg3)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)' }}
                >
                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: subjectColor(subject), textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    {SUBJECT_LABELS[subject] || subject}
                  </div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
