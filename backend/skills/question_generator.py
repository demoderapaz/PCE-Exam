import os
import json
import re
from typing import List
import anthropic

MODEL = "claude-sonnet-4-20250514"


async def generate_questions(
    topic: str,
    curated_content: str,
    num_mc: int,
    num_long: int,
) -> List[dict]:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    user_message = f"""Topic: {topic}

Curated content:
{curated_content}

Generate exactly {num_mc} multiple choice questions and {num_long} long answer questions based on the content above.

Return ONLY a valid JSON array with no markdown fences, no commentary — just the raw JSON.

Each MC question object:
{{
  "type": "mc",
  "text": "Question text here?",
  "options": ["A) option one", "B) option two", "C) option three", "D) option four"],
  "correct_answer": "B"
}}

Each long answer question object:
{{
  "type": "long",
  "text": "Question text here?",
  "correct_answer": "A thorough model answer.",
  "rubric": "Award points for: 1) ... 2) ... 3) ..."
}}

Questions should vary in difficulty, test different aspects of the content, and be clearly worded."""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=(
            "You are an expert exam writer. You produce clear, accurate, and well-structured "
            "exam questions. Always return only valid JSON with no markdown code fences or extra text."
        ),
        messages=[{"role": "user", "content": user_message}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        questions = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse questions JSON: {e}\nRaw response:\n{raw}")

    if not isinstance(questions, list):
        raise ValueError(f"Expected a JSON array of questions, got: {type(questions)}")

    return questions
