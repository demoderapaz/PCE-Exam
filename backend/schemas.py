from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Exam creation ──────────────────────────────────────────────────────────────

class QuestionIn(BaseModel):
    type: str  # "mc" or "long"
    text: str
    options: Optional[List[str]] = None   # ["A) ...", "B) ...", "C) ...", "D) ..."]
    correct_answer: Optional[str] = None
    feedback: Optional[str] = None
    rubric: Optional[str] = None
    image_url: Optional[str] = None       # optional image shown above the question

    class Config:
        extra = "ignore"


class ExamCreateRequest(BaseModel):
    topic: str
    title: Optional[str] = None
    source_text: Optional[str] = None
    questions: List[QuestionIn] = []

    class Config:
        extra = "ignore"


class ExamUpdateRequest(BaseModel):
    topic: str
    title: Optional[str] = None
    source_text: Optional[str] = None
    questions: List[QuestionIn] = []

    class Config:
        extra = "ignore"


# ── Grading ────────────────────────────────────────────────────────────────────

class AnswerSubmission(BaseModel):
    question_id: int
    answer: str


class GradeRequest(BaseModel):
    answers: List[AnswerSubmission]


class SelfGradeEntry(BaseModel):
    answer_result_id: int
    score: float
    feedback: Optional[str] = None


class SelfGradeRequest(BaseModel):
    scores: List[SelfGradeEntry]


# ── Output schemas ─────────────────────────────────────────────────────────────

class QuestionOut(BaseModel):
    id: int
    order_index: int
    type: str
    text: str
    options: Optional[str] = None
    correct_answer: Optional[str] = None
    feedback: Optional[str] = None
    rubric: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ExamOut(BaseModel):
    id: int
    title: str
    topic: str
    source_text: Optional[str] = None
    created_at: datetime
    questions: List[QuestionOut]

    class Config:
        from_attributes = True


class ExamListItem(BaseModel):
    id: int
    title: str
    topic: str
    created_at: datetime
    question_count: int

    class Config:
        from_attributes = True


class AnswerResultOut(BaseModel):
    id: int
    question_id: int
    user_answer: Optional[str]
    score: float
    max_score: float
    feedback: Optional[str]
    question: QuestionOut

    class Config:
        from_attributes = True


class ExamResultOut(BaseModel):
    id: int
    exam_id: int
    taken_at: datetime
    total_score: float
    max_score: float
    answers: List[AnswerResultOut]

    class Config:
        from_attributes = True


class ResultListItem(BaseModel):
    id: int
    exam_id: int
    exam_title: str
    taken_at: datetime
    total_score: float
    max_score: float

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    text: str


class AnswerKeyResponse(BaseModel):
    answer_key: str
