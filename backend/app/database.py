"""SQLite access layer. All SQL lives here so moving to PostgreSQL later only means
changing db() (e.g. psycopg) and the `?` placeholders to `%s`."""
import sqlite3
from contextlib import contextmanager

from . import config


@contextmanager
def db():
    conn = sqlite3.connect(config.DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with db() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)""")


def add_feedback(rating: int, comment: str) -> int:
    with db() as c:
        return c.execute("INSERT INTO feedback (rating, comment) VALUES (?, ?)", (rating, comment)).lastrowid


def get_stats(recent: int = 5) -> dict:
    with db() as c:
        row = c.execute("SELECT COUNT(*) AS n, AVG(rating) AS avg FROM feedback").fetchone()
        dist = {str(i): 0 for i in range(1, 6)}
        for r in c.execute("SELECT rating, COUNT(*) AS n FROM feedback GROUP BY rating"):
            dist[str(r["rating"])] = r["n"]
        comments = [dict(r) for r in c.execute(
            "SELECT rating, comment, created_at FROM feedback WHERE comment <> '' ORDER BY id DESC LIMIT ?", (recent,))]
    return {"average": round(row["avg"], 2) if row["avg"] else 0, "total": row["n"],
            "distribution": dist, "recent": comments}
