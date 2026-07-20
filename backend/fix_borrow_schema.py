import sqlite3
from pathlib import Path

path = Path("instance/library_dev.db")
print("Database path:", path, "exists:", path.exists())
if not path.exists():
    raise SystemExit("Database file not found")

conn = sqlite3.connect(path)
cur = conn.cursor()
cols = [r[1] for r in cur.execute("PRAGMA table_info(borrow_records);")]
print("Columns before:", cols)

if "renewed" not in cols:
    cur.execute("ALTER TABLE borrow_records ADD COLUMN renewed BOOLEAN NOT NULL DEFAULT 0")
    print("Added 'renewed' column to borrow_records")
else:
    print("'renewed' column already exists in borrow_records")

conn.commit()
cols = [r[1] for r in cur.execute("PRAGMA table_info(borrow_records);")]
print("Columns after:", cols)
conn.close()


