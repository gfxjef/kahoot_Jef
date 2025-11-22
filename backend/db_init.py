import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def create_tables():
    try:
        print(f"Connecting to {os.getenv('DB_HOST')} as {os.getenv('DB_USER')}")
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=int(os.getenv("DB_PORT", 3306))
        )

        if connection.is_connected():
            cursor = connection.cursor()
            
            # Table: Kahoo_games
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Kahoo_games (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                pin VARCHAR(10) NOT NULL UNIQUE,
                title VARCHAR(100) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                finished_at DATETIME NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            print("Table 'Kahoo_games' checked/created.")

            # Table: Kahoo_players
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Kahoo_players (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                game_id INT UNSIGNED NOT NULL,
                name VARCHAR(100) NOT NULL,
                final_score INT NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_players_game
                    FOREIGN KEY (game_id) REFERENCES Kahoo_games(id)
                    ON DELETE CASCADE,
                INDEX idx_players_game (game_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            print("Table 'Kahoo_players' checked/created.")

            # Table: Kahoo_answers
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Kahoo_answers (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                game_id INT UNSIGNED NOT NULL,
                player_id INT UNSIGNED NOT NULL,
                question_index INT NOT NULL,
                option_index INT NOT NULL,
                is_correct TINYINT(1) NOT NULL DEFAULT 0,
                answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_answers_game
                    FOREIGN KEY (game_id) REFERENCES Kahoo_games(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_answers_player
                    FOREIGN KEY (player_id) REFERENCES Kahoo_players(id)
                    ON DELETE CASCADE,
                INDEX idx_answers_game (game_id),
                INDEX idx_answers_player (player_id),
                INDEX idx_answers_game_question (game_id, question_index)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            print("Table 'Kahoo_answers' checked/created.")

            # Table: Kahoo_questions
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Kahoo_questions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(200) NOT NULL,
                options JSON NOT NULL,
                correct_option_index INT NOT NULL,
                game_id INT UNSIGNED NOT NULL,
                CONSTRAINT fk_questions_game
                    FOREIGN KEY (game_id) REFERENCES Kahoo_games(id)
                    ON DELETE CASCADE,
                INDEX idx_questions_game (game_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            print("Table 'Kahoo_questions' checked/created.")

            cursor.close()
            connection.close()
            print("Database initialization completed successfully.")

    except mysql.connector.Error as e:
        print(f"Error connecting to MySQL: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    create_tables()
