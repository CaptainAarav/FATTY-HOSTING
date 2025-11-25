const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/fatty_hosting.db');
const db = new Database(dbPath);

function initDatabase() {
    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create server requests table
    db.exec(`
        CREATE TABLE IF NOT EXISTS server_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            server_name TEXT NOT NULL,
            server_type TEXT DEFAULT 'java',
            player_count INTEGER NOT NULL,
            amp_username TEXT NOT NULL,
            amp_password TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Add server_type column if it doesn't exist (for existing databases)
    try {
        db.exec(`ALTER TABLE server_requests ADD COLUMN server_type TEXT DEFAULT 'java'`);
    } catch (error) {
        // Column already exists, ignore error
    }

    console.log('Database initialized successfully');
}

module.exports = {
    db,
    initDatabase
};
