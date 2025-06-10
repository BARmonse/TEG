CREATE TABLE IF NOT EXISTS player_countries (
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    country_id VARCHAR(50) NOT NULL,
    troops INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (game_id, user_id, country_id),
    CONSTRAINT fk_player_countries_gameplayer FOREIGN KEY (game_id, user_id) REFERENCES game_players(game_id, user_id),
    CONSTRAINT fk_player_countries_country FOREIGN KEY (country_id) REFERENCES countries(id)
);