CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Insert test users (password is 'password' BCrypt encoded)
INSERT INTO users (username, email, password, games_played, games_won, games_lost) VALUES
('barmonse', 'barmonse@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 10, 5, 5),
('Mr Guiso', 'mrguiso@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 8, 3, 5),
('player3', 'player3@test.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 5, 2, 3),
('player4', 'player4@test.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 6, 1, 5),
('player5', 'player5@test.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 3, 0, 3),
('player6', 'player6@test.com', '$2a$10$xn3LI/AjqicFYZFruSwve.268jZ.E.r1sYnlJtGtLsGCRXj29WE5S', 4, 1, 3); 