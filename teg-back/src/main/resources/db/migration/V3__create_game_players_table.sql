-- Create game_players table
CREATE TABLE game_players (
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    color VARCHAR(20) NOT NULL,
    turn_order INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 