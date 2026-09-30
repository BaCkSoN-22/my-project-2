
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");


// ==========================================
// DATABASE FOLDER
// ==========================================

const dataFolder = path.join(
    __dirname,
    "data"
);


if (!fs.existsSync(dataFolder)) {

    fs.mkdirSync(
        dataFolder,
        {
            recursive: true
        }
    );

}


// ==========================================
// DATABASE
// ==========================================

const dbPath = path.join(
    dataFolder,
    "admin-system.db"
);


const db = new Database(
    dbPath
);


// ==========================================
// USERS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (

        id TEXT PRIMARY KEY,

        name TEXT NOT NULL,

        email TEXT NOT NULL UNIQUE,

        password_hash TEXT NOT NULL,

        role TEXT NOT NULL DEFAULT 'user',

        created_at TEXT NOT NULL,

        updated_at TEXT NOT NULL

    )
`);


// ==========================================
// NOTIFICATIONS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id TEXT NOT NULL,

        title TEXT NOT NULL,

        message TEXT NOT NULL,

        type TEXT NOT NULL DEFAULT 'info',

        is_read INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE

    )
`);


// ==========================================
// NOTIFICATIONS INDEX
// ==========================================

db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_notifications_user_id

    ON notifications(user_id)
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_notifications_created_at

    ON notifications(created_at)
`);


// ==========================================
// NOTIFICATION TARGET ID MIGRATION
// ==========================================

const notificationColumns = db
    .prepare("PRAGMA table_info(notifications)")
    .all();

const hasTargetId = notificationColumns.some(
    column => column.name === "target_id"
);

if (!hasTargetId) {
    db.prepare(`
        ALTER TABLE notifications
        ADD COLUMN target_id TEXT
    `).run();

    console.log(
        "Added target_id column to notifications."
    );
}

// ==========================================
// ACTIVITY LOG TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        user_name TEXT,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        target_id TEXT,
        created_at TEXT NOT NULL
    )
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
    ON activity_logs(created_at)
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
    ON activity_logs(user_id)
`);


// ==========================================
// CREATE MAIN ADMIN
// ==========================================

function createMainAdmin() {

    const existingAdmin =
        db.prepare(`
            SELECT *
            FROM users
            WHERE id = ?
        `).get(
            "admin-001"
        );


    if (existingAdmin) {

        return;

    }


    const passwordHash =
        bcrypt.hashSync(
            "Admin123!",
            12
        );


    const now =
        new Date().toISOString();


    db.prepare(`
        INSERT INTO users (

            id,
            name,
            email,
            password_hash,
            role,
            created_at,
            updated_at

        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

    `).run(

        "admin-001",

        "Main Admin",

        "admin@admin.com",

        passwordHash,

        "admin",

        now,

        now

    );


    console.log(
        "Main Admin account created."
    );

}


createMainAdmin();


// ==========================================
// DATABASE SETTINGS
// ==========================================

db.pragma(
    "foreign_keys = ON"
);


// ==========================================
// EXPORT
// ==========================================

module.exports = db;
