import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'catering.db');

// Ensure data directory exists
import fs from 'node:fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    price_per_person REAL NOT NULL,
    is_signature INTEGER NOT NULL DEFAULT 0,
    is_premium INTEGER NOT NULL DEFAULT 0,
    dietary_tags TEXT NOT NULL DEFAULT '[]',
    allergens TEXT NOT NULL DEFAULT '[]',
    available INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    catering_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',

    -- Contact
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    special_requests TEXT NOT NULL DEFAULT '',

    -- Buyout fields (nullable)
    event_date TEXT,
    event_time TEXT,
    headcount INTEGER NOT NULL,
    company_name TEXT,
    event_description TEXT,
    meal_type TEXT,
    bar_option TEXT,

    -- To-go fields (nullable)
    preferred_pickup_date TEXT,
    preferred_pickup_time TEXT,

    -- Shared
    selected_dishes TEXT NOT NULL DEFAULT '[]',
    staff_notes TEXT NOT NULL DEFAULT '',
    estimate_low REAL,
    estimate_high REAL,
    submitted INTEGER NOT NULL DEFAULT 0,

    submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pricing_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_per_person_low REAL NOT NULL DEFAULT 0,
    price_per_person_high REAL NOT NULL DEFAULT 0,
    minimum_headcount INTEGER,
    included_courses INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rental_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL UNIQUE,
    day_label TEXT NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`);

// Migrations for existing databases
const columns = db.prepare("PRAGMA table_info(inquiries)").all() as { name: string }[];
if (!columns.some((c) => c.name === 'submitted')) {
  db.exec("ALTER TABLE inquiries ADD COLUMN submitted INTEGER NOT NULL DEFAULT 1");
}

export default db;
