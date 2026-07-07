const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const defaultPath = path.resolve(__dirname, '../../../data/sqlite/tableflow.db');
const databasePath = process.env.DATABASE_PATH || defaultPath;

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

// WAL keeps reads responsive on small devices while one write is happening.
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

module.exports = { db, databasePath };
