def grade_mc(correct_answer: str, user_answer: str) -> dict:
    correct = correct_answer.strip().upper()
    given = user_answer.strip().upper() if user_answer else ""

    if given == correct:
        return {"score": 1.0, "max_score": 1.0, "feedback": "Correct!"}
    else:
        return {
            "score": 0.0,
            "max_score": 1.0,
            "feedback": f"Incorrect. The correct answer was {correct}.",
        }
