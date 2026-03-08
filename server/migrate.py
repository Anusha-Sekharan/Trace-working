import sqlite3
import os

db_path = os.path.join('d:/Projects/Trace-working-main/server', 'trace.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute('ALTER TABLE users ADD COLUMN role VARCHAR(255)')
        c.execute('ALTER TABLE users ADD COLUMN ai_score INTEGER')
        c.execute('ALTER TABLE users ADD COLUMN is_assessed BOOLEAN DEFAULT 0')
        print("Migration successful")
    except Exception as e:
        print("Migration error:", e)
    conn.commit()
    conn.close()
else:
    print("DB does not exist yet")
