CREATE TABLE IF NOT EXISTS game_players (
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    color VARCHAR(20) NOT NULL,
    turn_order INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    objective VARCHAR(255),
    PRIMARY KEY (game_id, user_id),
    CONSTRAINT fk_game_players_game FOREIGN KEY (game_id) REFERENCES games(id),
    CONSTRAINT fk_game_players_users FOREIGN KEY (game_id) REFERENCES games(id)
); 