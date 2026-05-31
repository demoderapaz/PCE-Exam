import os
import json
import re
from typing import List
import anthropic

MODEL = "claude-sonnet-4-20250514"


async def grade_long_answer(
    question_text: str,
    model_answer: str,
    rubric: str,
    user_answer: str,
) -> dict:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=(
            "You are a strict but fair exam grader. Grade student answers on a 0–10 scale. "
            "Return ONLY valid JSON with no markdown fences: "
            '{"score": <float 0-10>, "feedback": "<written feedback string>"}'
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Question: {question_text}\n\n"
                f"Model answer: {model_answer}\n\n"
                f"Grading rubric: {rubric}\n\n"
                f"Student answer: {user_answer}\n\n"
                "Grade this answer 0–10. Provide written feedback explaining strengths and weaknesses. "
                "Return only JSON: {\"score\": <number>, \"feedback\": \"<text>\"}"
            ),
        }],
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        result = json.loads(raw)
        score = float(result.get("score", 0))
        score = max(0.0, min(10.0, score))
        return {
            "score": score,
            "max_score": 10.0,
            "feedback": result.get("feedback", ""),
        }
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        raise ValueError(f"Failed to parse grader response: {e}\nRaw:\n{raw}")
