"""
Run once to apply all pending DB migrations:
   python3 migrate.py
"""
import sqlite3

MIGRATIONS = [
    ("feedback", "ALTER TABLE questions ADD COLUMN feedback TEXT"),
    ("image_url", "ALTER TABLE questions ADD COLUMN image_url TEXT"),
]

conn = sqlite3.connect("pce_exam.db")
try:
    for col, sql in MIGRATIONS:
        try:
            conn.execute(sql)
            conn.commit()
            print(f"✓ Column '{col}' added to questions table.")
        except sqlite3.OperationalError as e:
            print(f"Skipped '{col}': {e}")
finally:
    conn.close()
