from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Updating database schema...")
    try:
        # Check if column exists
        with db.engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM Kahoo_games LIKE 'status'"))
            if result.fetchone():
                print("Column 'status' already exists.")
            else:
                print("Adding column 'status'...")
                conn.execute(text("ALTER TABLE Kahoo_games ADD COLUMN status VARCHAR(20) DEFAULT 'PREPARED'"))
                conn.commit()
                print("Column 'status' added successfully.")
    except Exception as e:
        print(f"Error updating schema: {e}")
