"""
Database migration script to preserve transfer history when shares are deleted.

This script updates the transfer_history table to make share_id nullable
and changes the foreign key constraint to SET NULL on delete.

Run this script once to update your existing database.
"""

import sqlite3
import os
from pathlib import Path

# Get database path
DB_PATH = Path(__file__).parent / "easyshare.db"

def migrate_database():
    """Update the database schema to preserve transfer history"""
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("No migration needed - database will be created with correct schema")
        return

    print(f"Migrating database at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if transfer_history table exists
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='transfer_history'
        """)

        if not cursor.fetchone():
            print("transfer_history table doesn't exist yet - no migration needed")
            conn.close()
            return

        # Create new table with updated schema
        print("Creating new transfer_history table with updated schema...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transfer_history_new (
                id TEXT PRIMARY KEY,
                share_id TEXT,
                transfer_type TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                peer_info TEXT,
                status TEXT NOT NULL,
                transfer_speed TEXT,
                duration_seconds INTEGER,
                FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE SET NULL
            )
        """)

        # Copy existing data
        print("Copying existing transfer history data...")
        cursor.execute("""
            INSERT INTO transfer_history_new
            SELECT * FROM transfer_history
        """)

        # Drop old table
        print("Removing old table...")
        cursor.execute("DROP TABLE transfer_history")

        # Rename new table
        print("Renaming new table...")
        cursor.execute("ALTER TABLE transfer_history_new RENAME TO transfer_history")

        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")
        print("Transfer history will now be preserved even when shares are deleted.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
