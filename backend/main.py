import json
import io
import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from .database import engine, get_db, Base
from . import models
from .schemas import (
    ExamCreateRequest,
    ExamUpdateRequest,
    GradeRequest,
    SelfGradeRequest,
    ExamOut,
    ExamListItem,
    ExamResultOut,
    ResultListItem,
    UploadResponse,
    AnswerKeyResponse,
)
from .skills.mc_grader import grade_mc

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PCE-Exam API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exam creation ──────────────────────────────────────────────────────────────

@app.post("/exams/create", response_model=ExamOut)
def create_exam(request: ExamCreateRequest, db: Session = Depends(get_db)):
    title = request.title or f"{request.topic} Exam — {datetime.utcnow().strftime('%b %d, %Y')}"

    exam = models.Exam(
        title=title,
        topic=request.topic,
        source_text=request.source_text,
        answer_key=None,
    )
    db.add(exam)
    db.flush()

    for idx, q in enumerate(request.questions):
        question = models.Question(
            exam_id=exam.id,
            order_index=idx,
            type=q.type,
            text=q.text,
            options=json.dumps(q.options) if q.options else None,
            correct_answer=q.correct_answer,
            feedback=q.feedback,
            rubric=q.rubric,
            image_url=q.image_url,
        )
        db.add(question)

    db.commit()
    db.refresh(exam)
    return exam


# ── Exam listing / retrieval ───────────────────────────────────────────────────

@app.get("/exams", response_model=List[ExamListItem])
def list_exams(db: Session = Depends(get_db)):
    exams = db.query(models.Exam).order_by(models.Exam.created_at.desc()).all()
    return [
        ExamListItem(
            id=e.id,
            title=e.title,
            topic=e.topic,
            created_at=e.created_at,
            question_count=len(e.questions),
        )
        for e in exams
    ]


@app.get("/exams/{exam_id}", response_model=ExamOut)
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


@app.delete("/exams/{exam_id}", status_code=204)
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # Delete related results and answers first
    results = db.query(models.ExamResult).filter(models.ExamResult.exam_id == exam_id).all()
    for r in results:
        db.query(models.AnswerResult).filter(models.AnswerResult.result_id == r.id).delete()
        db.delete(r)
    db.query(models.Question).filter(models.Question.exam_id == exam_id).delete()
    db.delete(exam)
    db.commit()


@app.put("/exams/{exam_id}", response_model=ExamOut)
def update_exam(exam_id: int, request: ExamUpdateRequest, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Update metadata
    exam.topic = request.topic
    exam.title = request.title or f"{request.topic} Exam — {datetime.utcnow().strftime('%b %d, %Y')}"
    exam.source_text = request.source_text

    # Replace questions (keep results intact — they reference question ids that will change,
    # so also wipe answer results that reference old questions)
    old_question_ids = [q.id for q in exam.questions]
    if old_question_ids:
        db.query(models.AnswerResult).filter(
            models.AnswerResult.question_id.in_(old_question_ids)
        ).delete(synchronize_session=False)
    db.query(models.Question).filter(models.Question.exam_id == exam_id).delete()

    for idx, q in enumerate(request.questions):
        question = models.Question(
            exam_id=exam.id,
            order_index=idx,
            type=q.type,
            text=q.text,
            options=json.dumps(q.options) if q.options else None,
            correct_answer=q.correct_answer,
            feedback=q.feedback,
            rubric=q.rubric,
            image_url=q.image_url,
        )
        db.add(question)

    db.commit()
    db.refresh(exam)
    return exam


@app.get("/exams/{exam_id}/answer-key", response_model=AnswerKeyResponse)
def get_answer_key(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # Build answer key from questions
    lines = []
    for i, q in enumerate(exam.questions, 1):
        if q.type == "mc":
            lines.append(f"Q{i} (MC): {q.correct_answer}")
        else:
            lines.append(f"Q{i} (Long): {q.correct_answer or ''}")
            if q.rubric:
                lines.append(f"  Rubric: {q.rubric}")
    return AnswerKeyResponse(answer_key="\n".join(lines))


# ── Grading ────────────────────────────────────────────────────────────────────

@app.post("/exams/{exam_id}/grade", response_model=ExamResultOut)
def grade_exam(exam_id: int, request: GradeRequest, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    answer_map = {a.question_id: a.answer for a in request.answers}

    exam_result = models.ExamResult(
        exam_id=exam_id,
        total_score=0.0,
        max_score=0.0,
    )
    db.add(exam_result)
    db.flush()

    total_score = 0.0
    max_score = 0.0

    for question in exam.questions:
        user_answer = answer_map.get(question.id, "")

        if question.type == "mc":
            graded = grade_mc(question.correct_answer or "", user_answer)
        else:
            # Long answer: pending self-grading, score = -1 sentinel
            graded = {"score": -1.0, "max_score": 10.0, "feedback": ""}

        ar = models.AnswerResult(
            result_id=exam_result.id,
            question_id=question.id,
            user_answer=user_answer,
            score=graded["score"],
            max_score=graded["max_score"],
            feedback=graded.get("feedback", ""),
        )
        db.add(ar)

        if question.type == "mc":
            total_score += graded["score"]
        max_score += graded["max_score"]

    exam_result.total_score = total_score
    exam_result.max_score = max_score
    db.commit()
    db.refresh(exam_result)
    return exam_result


@app.patch("/results/{result_id}/self-grade", response_model=ExamResultOut)
def self_grade(result_id: int, request: SelfGradeRequest, db: Session = Depends(get_db)):
    """Save self-assigned scores for long answer questions."""
    result = db.query(models.ExamResult).filter(models.ExamResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    score_map = {s.answer_result_id: s for s in request.scores}

    total = 0.0
    for ar in result.answers:
        if ar.id in score_map:
            entry = score_map[ar.id]
            ar.score = max(0.0, min(ar.max_score, entry.score))
            ar.feedback = entry.feedback or ""
        if ar.score >= 0:
            total += ar.score

    result.total_score = total
    db.commit()
    db.refresh(result)
    return result


# ── Results ────────────────────────────────────────────────────────────────────

@app.get("/results", response_model=List[ResultListItem])
def list_results(db: Session = Depends(get_db)):
    results = db.query(models.ExamResult).order_by(models.ExamResult.taken_at.desc()).all()
    return [
        ResultListItem(
            id=r.id,
            exam_id=r.exam_id,
            exam_title=r.exam.title if r.exam else "Unknown",
            taken_at=r.taken_at,
            total_score=r.total_score,
            max_score=r.max_score,
        )
        for r in results
    ]


@app.get("/results/{result_id}", response_model=ExamResultOut)
def get_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(models.ExamResult).filter(models.ExamResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


# ── Document upload ────────────────────────────────────────────────────────────

# ── Contents ───────────────────────────────────────────────────────────────────

CONTENTS_ROOT = os.path.join(os.path.dirname(__file__), "..", "ai-ready", "contents")

def _slug_to_title(slug: str) -> str:
    name = slug.replace("-", " ").replace("_", " ")
    words = name.split()
    # Capitalise but keep "y", "de", "del" lowercase
    stop = {"y", "de", "del", "la", "el", "los", "las"}
    return " ".join(w.capitalize() if w not in stop else w for w in words)

@app.get("/subjects")
def list_subjects():
    root = os.path.abspath(CONTENTS_ROOT)
    return sorted([
        d for d in os.listdir(root)
        if os.path.isdir(os.path.join(root, d)) and not d.startswith(".")
    ])

@app.get("/contents")
def list_contents():
    items = []
    root = os.path.abspath(CONTENTS_ROOT)
    for subject in sorted(os.listdir(root)):
        subject_path = os.path.join(root, subject)
        if not os.path.isdir(subject_path):
            continue
        for fname in sorted(os.listdir(subject_path)):
            if not fname.endswith(".md"):
                continue
            slug = fname[:-3]
            items.append({
                "subject": subject,
                "slug": slug,
                "title": _slug_to_title(slug),
            })
    return items

@app.get("/contents/{subject}/{slug}")
def get_content(subject: str, slug: str):
    root = os.path.abspath(CONTENTS_ROOT)
    path = os.path.abspath(os.path.join(root, subject, slug + ".md"))
    # Security: ensure path stays inside contents root
    if not path.startswith(root):
        raise HTTPException(status_code=403, detail="Forbidden")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Content not found")
    with open(path, encoding="utf-8") as f:
        content = f.read()
    return {"subject": subject, "slug": slug, "title": _slug_to_title(slug), "content": content}


@app.post("/upload-document", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or ""
    content = await file.read()

    if filename.endswith(".pdf"):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF parsing failed: {e}")
    elif filename.endswith((".txt", ".md")):
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use .txt, .pdf, or .md")

    return UploadResponse(text=text)
