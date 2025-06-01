-- Game Status enum
CREATE TYPE game_status AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED');

-- Game table
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status game_status NOT NULL DEFAULT 'WAITING',
    max_players INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    winner_id BIGINT REFERENCES users(id),
    created_by_id BIGINT NOT NULL REFERENCES users(id)
);

-- Player colors enum
CREATE TYPE player_color AS ENUM ('RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'PURPLE');

-- Game Players junction table
CREATE TABLE game_players (
    game_id BIGINT REFERENCES games(id),
    user_id BIGINT REFERENCES users(id),
    color player_color NOT NULL,
    turn_order INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id)
);

-- Countries table
CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    continent VARCHAR(50) NOT NULL
);

-- Game Country Status table
CREATE TABLE game_country_status (
    game_id BIGINT REFERENCES games(id),
    country_id BIGINT REFERENCES countries(id),
    owner_id BIGINT REFERENCES users(id),
    troops INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (game_id, country_id)
);

-- Insert countries data
INSERT INTO countries (name, continent) VALUES
-- America del Sur
('Argentina', 'South America'),
('Brasil', 'South America'),
('Chile', 'South America'),
('Colombia', 'South America'),
('Peru', 'South America'),
('Uruguay', 'South America'),
-- America del Norte
('Alaska', 'North America'),
('California', 'North America'),
('Canada', 'North America'),
('Groenlandia', 'North America'),
('Labrador', 'North America'),
('Mexico', 'North America'),
('Nueva York', 'North America'),
('Oregon', 'North America'),
('Terranova', 'North America'),
('Yukon', 'North America'),
-- Europa
('Alemania', 'Europe'),
('Espana', 'Europe'),
('Francia', 'Europe'),
('Gran Bretana', 'Europe'),
('Islandia', 'Europe'),
('Italia', 'Europe'),
('Polonia', 'Europe'),
('Rusia', 'Europe'),
('Suecia', 'Europe'),
-- Africa
('Congo', 'Africa'),
('Egipto', 'Africa'),
('Etiopia', 'Africa'),
('Madagascar', 'Africa'),
('Sahara', 'Africa'),
('Sudafrica', 'Africa'),
('Zaire', 'Africa'),
-- Asia
('Arabia', 'Asia'),
('China', 'Asia'),
('Gobi', 'Asia'),
('India', 'Asia'),
('Iran', 'Asia'),
('Israel', 'Asia'),
('Japon', 'Asia'),
('Kamchatka', 'Asia'),
('Malaysia', 'Asia'),
('Mongolia', 'Asia'),
('Siberia', 'Asia'),
('Taimir', 'Asia'),
('Tartaria', 'Asia'),
('Turquia', 'Asia'),
-- Oceania
('Australia', 'Oceania'),
('Borneo', 'Oceania'),
('Java', 'Oceania'),
('Sumatra', 'Oceania'); 