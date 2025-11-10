# Disable foreign key checks for SQLite
import sqlite3

# Monkey patch to disable foreign key checks
_original_connect = sqlite3.connect

def _patched_connect(*args, **kwargs):
    conn = _original_connect(*args, **kwargs)
    conn.execute("PRAGMA foreign_keys=OFF")
    return conn

sqlite3.connect = _patched_connect

