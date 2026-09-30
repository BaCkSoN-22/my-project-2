const express = require("express");
const router = express.Router();

const db = require("../db");
const { requireAuth } = require("../middleware/auth");


// =========================================================
// GET ACTIVITY LOG
// =========================================================

router.get("/", requireAuth, (req, res) => {

    try {

        // მხოლოდ Admin
        if (
            String(req.user.role).toLowerCase() !== "admin"
        ) {

            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });

        }


        const logs = db.prepare(`
            SELECT
                id,
                user_id,
                user_name,
                action,
                description,
                target_id,
                created_at
            FROM activity_logs
            ORDER BY created_at DESC
            LIMIT 500
        `).all();


        res.json({
            success: true,
            logs
        });

    } catch (error) {

        console.error(
            "Get activity logs error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load activity logs."
        });

    }

});


module.exports = router;