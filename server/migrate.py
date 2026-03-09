import sqlite3
import os

db_path = os.path.join('d:/Projects/Trace-working-main/server', 'trace.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        try: c.execute('ALTER TABLE users ADD COLUMN evidence_bundle VARCHAR(1024)')
        except Exception as e: print("evidence_bundle skip:", e)
        try: c.execute('ALTER TABLE users ADD COLUMN role VARCHAR(255)')
        except Exception as e: print("role skip:", e)
        try: c.execute('ALTER TABLE users ADD COLUMN ai_score INTEGER')
        except Exception as e: print("ai_score skip:", e)
        try: c.execute('ALTER TABLE users ADD COLUMN is_assessed BOOLEAN DEFAULT 0')
        except Exception as e: print("is_assessed skip:", e)
        print("Migration complete")
    except Exception as e:
        print("Migration error:", e)
    conn.commit()
    conn.close()
else:
    print("DB does not exist yet")
