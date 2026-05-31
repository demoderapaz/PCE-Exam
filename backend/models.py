from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    source_text = Column(Text, nullable=True)
    answer_key = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="exam", order_by="Question.order_index")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # "mc" or "long"
    text = Column(Text, nullable=False)
    options = Column(Text, nullable=True)      # JSON string for MC
    correct_answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)     # explanation shown after answering
    rubric = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)    # optional image shown above the question

    exam = relationship("Exam", back_populates="questions")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    taken_at = Column(DateTime, default=datetime.utcnow)
    total_score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)

    exam = relationship("Exam")
    answers = relationship("AnswerResult", back_populates="result")


class AnswerResult(Base):
    __tablename__ = "answer_results"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("exam_results.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)

    result = relationship("ExamResult", back_populates="answers")
    question = relationship("Question")
