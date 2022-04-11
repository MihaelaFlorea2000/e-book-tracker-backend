CREATE TABLE users (
  id SERIAL PRIMARY KEY
, first_name VARCHAR(255) NOT NULL
, last_name VARCHAR(255) NOT NULL
, email VARCHAR(255) UNIQUE NOT NULL
, password VARCHAR(255) NOT NULL
, profile_image VARCHAR(255)
, yearly INT
, monthly INT
, daily_hours INT
, daily_minutes INT
, dark_theme BOOLEAN DEFAULT false
, font_size INT DEFAULT 100
, reader_theme VARCHAR(255) DEFAULT 'sepia'
, notifications BOOLEAN DEFAULT true
, profile_visibility VARCHAR(255) DEFAULT 'friends'
, show_goals BOOLEAN DEFAULT true
, show_books BOOLEAN DEFAULT true
, show_numbers BOOLEAN DEFAULT true
, current_streak INT DEFAULT 0 
, longest_streak INT DEFAULT 0 
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY
, user_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, title VARCHAR(255) NOT NULL
, authors TEXT[]
, description TEXT
, cover_image VARCHAR(255)
, publisher VARCHAR(255)
, pub_date DATE
, language VARCHAR(255)
, rating REAL
, file VARCHAR(255)
, file_name VARCHAR(255)
, series VARCHAR(255)
, location VARCHAR(255)
, last_opened TIMESTAMPTZ
, current_read INT REFERENCES reads (id) 
    ON UPDATE CASCADE 
    ON DELETE SET NULL
, read BOOLEAN DEFAULT false
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY
, book_id INT REFERENCES books (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, name TEXT
);

CREATE TABLE highlights (
  id SERIAL PRIMARY KEY
, book_id INT REFERENCES books (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, text TEXT
, cfi_range VARCHAR(255) NOT NULL
, color VARCHAR(255)
, note TEXT
);

CREATE TABLE reads (
  id SERIAL PRIMARY KEY
, book_id INT REFERENCES books (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, user_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, start_date TIMESTAMPTZ
, end_date TIMESTAMPTZ
, rating REAL
, notes TEXT
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY
, read_id INT REFERENCES reads (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, start_date TIMESTAMPTZ
, time INTERVAL
);

CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY
, sender_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, receiver_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, date TIMESTAMPTZ NOT NULL
, type VARCHAR(255) DEFAULT 'friend'
);

CREATE TABLE friends (
  id SERIAL PRIMARY KEY
, user_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, friend_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

CREATE TABLE badge_notifications (
  id SERIAL PRIMARY KEY
, badge_id INT REFERENCES badges (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, receiver_id INT REFERENCES users (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, date TIMESTAMPTZ NOT NULL
, type VARCHAR(255) DEFAULT 'badge'
);

CREATE TABLE badges (
  id SERIAL PRIMARY KEY
, type VARCHAR(255) -- books | highlights | days
, number INT
);

-- Create the badges table
INSERT INTO badges (type, number) VALUES ('books', 10);
INSERT INTO badges (type, number) VALUES ('highlights', 10);
INSERT INTO badges (type, number) VALUES ('days', 7);
INSERT INTO badges (type, number) VALUES ('books', 50);
INSERT INTO badges (type, number) VALUES ('highlights', 50);
INSERT INTO badges (type, number) VALUES ('days', 30);
INSERT INTO badges (type, number) VALUES ('books', 100);
INSERT INTO badges (type, number) VALUES ('highlights', 100);
INSERT INTO badges (type, number) VALUES ('days', 100);