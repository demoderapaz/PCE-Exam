# PCE-Exam

A local exam creation and grading application powered by Claude AI.

## Setup

### Backend
```bash
# From the project root (PCE-Exam/)
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn backend.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. Click **Create New Exam** and enter a topic (or upload a .txt/.pdf/.md document)
2. Set the number of MC and long-answer questions, then click **Generate Exam**
3. Take the exam from the Library
4. View graded results with per-question feedback
