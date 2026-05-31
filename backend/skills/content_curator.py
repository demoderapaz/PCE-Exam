import os
from typing import Optional
import anthropic

MODEL = "claude-sonnet-4-20250514"


async def curate_content(topic: str, source_text: Optional[str] = None) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    if source_text:
        user_message = (
            f"Topic: {topic}\n\n"
            f"Source document:\n{source_text}\n\n"
            "Please summarize and extract the most relevant concepts from this document "
            "for exam purposes. Produce a structured markdown summary (500–800 words) covering "
            "key concepts, definitions, facts, and themes that would appear on an exam."
        )
    else:
        user_message = (
            f"Topic: {topic}\n\n"
            "Generate a rich, structured markdown summary of this topic (500–800 words) covering "
            "key concepts, facts, definitions, and common exam themes. Organize it with clear "
            "headings and be thorough — this will be used to generate exam questions."
        )

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=(
            "You are an expert educator and curriculum designer. Your job is to produce "
            "high-quality, accurate, and well-organized study content that can be used "
            "as the basis for exam questions. Be precise, factual, and comprehensive."
        ),
        messages=[{"role": "user", "content": user_message}],
    )

    return message.content[0].text
