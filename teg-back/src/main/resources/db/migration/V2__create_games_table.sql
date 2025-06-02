-- Create games table
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    max_players INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    winner_id BIGINT REFERENCES users(id),
    created_by_id BIGINT NOT NULL REFERENCES users(id)
); 