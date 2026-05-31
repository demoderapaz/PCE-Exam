import os
from typing import List
import anthropic

MODEL = "claude-sonnet-4-20250514"


async def generate_answer_key(questions: List[dict]) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    questions_text = ""
    for i, q in enumerate(questions, 1):
        questions_text += f"\nQuestion {i} ({q['type'].upper()}): {q['text']}\n"
        if q["type"] == "mc":
            for opt in q.get("options", []):
                questions_text += f"  {opt}\n"
            questions_text += f"  Correct answer: {q.get('correct_answer', '')}\n"
        else:
            questions_text += f"  Model answer: {q.get('correct_answer', '')}\n"
            questions_text += f"  Rubric: {q.get('rubric', '')}\n"

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system="You are an expert educator. Format answer keys clearly and professionally.",
        messages=[{
            "role": "user",
            "content": (
                f"Produce a clean, well-formatted answer key for the following exam questions.\n"
                f"For MC questions: show the correct letter and a brief explanation.\n"
                f"For long answer questions: show the model answer and grading rubric.\n\n"
                f"{questions_text}"
            ),
        }],
    )

    return message.content[0].text
