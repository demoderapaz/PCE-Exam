const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      msg = body.detail || JSON.stringify(body)
    } catch (_) {}
    throw new Error(msg)
  }
  return res.json()
}

export async function createExam({ topic, title, source_text, questions }) {
  return request('/exams/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, title, source_text, questions }),
  })
}

export async function updateExam(id, payload) {
  return request(`/exams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteExam(id) {
  const res = await fetch(`${BASE}/exams/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const b = await res.json(); msg = b.detail || msg } catch (_) {}
    throw new Error(msg)
  }
}

export async function getExams() {
  return request('/exams')
}

export async function getExam(id) {
  return request(`/exams/${id}`)
}

export async function getAnswerKey(id) {
  return request(`/exams/${id}/answer-key`)
}

export async function gradeExam(examId, answers) {
  return request(`/exams/${examId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
}

export async function selfGrade(resultId, scores) {
  return request(`/results/${resultId}/self-grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scores }),
  })
}

export async function getResults() {
  return request('/results')
}

export async function getResult(id) {
  return request(`/results/${id}`)
}

export async function listSubjects() {
  return request('/subjects')
}

export async function listContents() {
  return request('/contents')
}

export async function getContent(subject, slug) {
  return request(`/contents/${subject}/${slug}`)
}

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/upload-document', { method: 'POST', body: formData })
}
