import { Database } from 'bun:sqlite';

const db = new Database('trace.db');

// Enable foreign key constraints
db.run(`
  PRAGMA foreign_keys = ON;
`);

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL,
    price INTEGER NOT NULL,
    cost_multiplier REAL NOT NULL,
    count INTEGER NOT NULL,
    base_probability REAL NOT NULL,
    base_upgrade_cost INTEGER NOT NULL,
    boost_amount INTEGER NOT NULL,
    effective_probability REAL NOT NULL,
    roll_cost_override INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    APIupdated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES items(itemId) ON DELETE CASCADE
  )
`);

export default db;
