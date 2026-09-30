const db = require("../db");

// =========================================================
// CREATE ACTIVITY
// =========================================================

function createActivity(
    userId,
    userName,
    action,
    description,
    targetId = null
) {
    try {

        db.prepare(`
            INSERT INTO activity_logs (
                user_id,
                user_name,
                action,
                description,
                target_id,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            userId || null,
            userName || "Unknown",
            action,
            description,
            targetId || null,
            new Date().toISOString()
        );

    } catch (error) {

        console.error(
            "Activity log creation error:",
            error
        );

    }
}


module.exports = {
    createActivity
};