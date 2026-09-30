
const express = require("express");

const router = express.Router();

const db = require("../db");

const {
    requireAuth
} = require("../middleware/auth");


// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

router.get(
    "/",
    requireAuth,
    (req, res) => {

        try {

            const userId =
                req.user.id;

            const notifications =
                db.prepare(`
                    SELECT
                        id,
                        user_id,
                        title,
                        message,
                        type,
                        is_read,
                        created_at
                        target_id
                    FROM notifications
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                `).all(userId);


            const unreadCount =
                db.prepare(`
                    SELECT COUNT(*) AS count
                    FROM notifications
                    WHERE user_id = ?
                    AND is_read = 0
                `).get(userId).count;


            res.json({

                success: true,

                notifications,

                unreadCount

            });

        } catch (error) {

            console.error(
                "Get notifications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to load notifications."

            });

        }

    }
);


// ==========================================
// GET UNREAD COUNT
// ==========================================

router.get(
    "/unread-count",
    requireAuth,
    (req, res) => {

        try {

            const userId =
                req.user.id;


            const result =
                db.prepare(`
                    SELECT COUNT(*) AS count
                    FROM notifications
                    WHERE user_id = ?
                    AND is_read = 0
                `).get(userId);


            res.json({

                success: true,

                unreadCount:
                    result.count

            });

        } catch (error) {

            console.error(
                "Unread count error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to get unread count."

            });

        }

    }
);


// ==========================================
// MARK ONE AS READ
// ==========================================

router.put(
    "/:id/read",
    requireAuth,
    (req, res) => {

        try {

            const userId =
                req.user.id;

            const notificationId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    notificationId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid notification ID."

                });

            }


            const result =
                db.prepare(`
                    UPDATE notifications
                    SET is_read = 1
                    WHERE id = ?
                    AND user_id = ?
                `).run(
                    notificationId,
                    userId
                );


            if (result.changes === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Notification marked as read."

            });

        } catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to mark notification as read."

            });

        }

    }
);


// ==========================================
// MARK ALL AS READ
// ==========================================

router.put(
    "/read-all",
    requireAuth,
    (req, res) => {

        try {

            const userId =
                req.user.id;


            db.prepare(`
                UPDATE notifications
                SET is_read = 1
                WHERE user_id = ?
                AND is_read = 0
            `).run(userId);


            res.json({

                success: true,

                message:
                    "All notifications marked as read."

            });

        } catch (error) {

            console.error(
                "Mark all notifications read error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to mark all notifications as read."

            });

        }

    }
);


// ==========================================
// DELETE ONE NOTIFICATION
// ==========================================

router.delete(
    "/:id",
    requireAuth,
    (req, res) => {

        try {

            const userId =
                req.user.id;

            const notificationId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    notificationId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid notification ID."

                });

            }


            const result =
                db.prepare(`
                    DELETE FROM notifications
                    WHERE id = ?
                    AND user_id = ?
                `).run(
                    notificationId,
                    userId
                );


            if (result.changes === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Notification deleted."

            });

        } catch (error) {

            console.error(
                "Delete notification error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete notification."

            });

        }

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;
