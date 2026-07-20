import sqlite3
from pathlib import Path

path = Path("instance/library_dev.db")
print("path", path, path.exists())
if not path.exists():
    raise SystemExit("Database file not found")

conn = sqlite3.connect(path)
cur = conn.cursor()
cols = [r[1] for r in cur.execute("PRAGMA table_info(users);")]
print("before", cols)
if "failed_login_attempts" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0")
    print("added failed_login_attempts")
if "locked_until" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN locked_until DATETIME")
    print("added locked_until")
conn.commit()
cols = [r[1] for r in cur.execute("PRAGMA table_info(users);")]
print("after", cols)
conn.close()
