const express = require("express");
const bcrypt = require("bcryptjs");
const { createActivity } = require("../utils/activity");


const db = require("../db");
const {
    requireAuth,
    requireAdmin
} = require("../middleware/auth");

const router = express.Router();


// ==========================================
// NOTIFICATION HELPER
// ==========================================

function createNotification(
    userId,
    title,
    message,
    type = "info",
    targetId = null
) {
    try {
        db.prepare(`
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type,
                is_read,
                created_at,
                target_id
            )
            VALUES (?, ?, ?, ?, 0, ?, ?)
        `).run(
            userId,
            title,
            message,
            type,
            new Date().toISOString(),
            targetId
        );

    } catch (error) {

        // Notification failure should NOT break
        // the main user operation.

        console.error(
            "Notification creation error:",
            error
        );
    }
}


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    (req, res) => {

        try {

            const users =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at,
                        updated_at
                    FROM users
                    ORDER BY created_at DESC
                `).all();

            res.json({
                success: true,
                users
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to load users."
            });

        }

    }
);


// ==========================================
// GET SINGLE USER
// ==========================================

router.get(
    "/:id",
    requireAuth,
    requireAdmin,
    (req, res) => {

        try {

            const user =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at,
                        updated_at
                    FROM users
                    WHERE id = ?
                `).get(
                    req.params.id
                );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });

            }

            res.json({
                success: true,
                user
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to load user."
            });

        }

    }
);


// ==========================================
// CREATE USER
// ==========================================

router.post(
    "/",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // ==================================
            // VALIDATION
            // ==================================

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email and password are required."
                });

            }


            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters."
                });

            }


            const cleanName =
                name.trim();

            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            // ==================================
            // CHECK DUPLICATE EMAIL
            // ==================================

            const existingUser =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                `).get(
                    cleanEmail
                );


            if (existingUser) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered."
                });

            }


            // ==================================
            // HASH PASSWORD
            // ==================================

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            const id =
                "user-" +
                Date.now();


            const now =
                new Date().toISOString();


            // ==================================
            // CREATE USER
            // ==================================

            // Admin cannot create another admin.
            // Every newly created account is USER.

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
                id,
                cleanName,
                cleanEmail,
                passwordHash,
                "user",
                now,
                now
            );


            // ==================================
            // GET CREATED USER
            // ==================================

            const newUser =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at,
                        updated_at
                    FROM users
                    WHERE id = ?
                `).get(id);


            // ==================================
            // CREATE NOTIFICATION
            // ==================================

            createNotification(
                req.user.id,
                "User Added",
                `${cleanName} was added to the system.`,
                "success",
                id
            );

            createActivity(
    req.user.id,
    req.user.name,
    "user_added",
    `${cleanName} was added to the system.`,
    id
);


            // ==================================
            // RESPONSE
            // ==================================

            res.status(201).json({
                success: true,
                message:
                    "User created successfully.",
                user: newUser
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to create user."
            });

        }

    }
);


// ==========================================
// UPDATE USER
// ==========================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            // ==================================
            // MAIN ADMIN PROTECTION
            // ==================================

            if (
                userId === "admin-001"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "The Main Admin account cannot be modified."
                });

            }


            // ==================================
            // FIND EXISTING USER
            // ==================================

            const existingUser =
                db.prepare(`
                    SELECT *
                    FROM users
                    WHERE id = ?
                `).get(userId);


            if (!existingUser) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });

            }


            const {
                name,
                email,
                password
            } = req.body;


            // ==================================
            // VALIDATION
            // ==================================

            if (!name || !email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name and email are required."
                });

            }


            const cleanName =
                name.trim();

            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            // ==================================
            // CHECK DUPLICATE EMAIL
            // ==================================

            const duplicate =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    AND id != ?
                `).get(
                    cleanEmail,
                    userId
                );


            if (duplicate) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered."
                });

            }


            const now =
                new Date().toISOString();


            // ==================================
            // UPDATE USER
            // ==================================

            if (password) {

                if (password.length < 6) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Password must contain at least 6 characters."
                    });

                }


                const passwordHash =
                    await bcrypt.hash(
                        password,
                        12
                    );


                db.prepare(`
                    UPDATE users
                    SET
                        name = ?,
                        email = ?,
                        password_hash = ?,
                        role = 'user',
                        updated_at = ?
                    WHERE id = ?
                `).run(
                    cleanName,
                    cleanEmail,
                    passwordHash,
                    now,
                    userId
                );


            } else {

                db.prepare(`
                    UPDATE users
                    SET
                        name = ?,
                        email = ?,
                        role = 'user',
                        updated_at = ?
                    WHERE id = ?
                `).run(
                    cleanName,
                    cleanEmail,
                    now,
                    userId
                );

            }


            // ==================================
            // GET UPDATED USER
            // ==================================

            const updatedUser =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at,
                        updated_at
                    FROM users
                    WHERE id = ?
                `).get(userId);


            // ==================================
            // CREATE NOTIFICATION
            // ==================================

            createNotification(
                req.user.id,
                "User Updated",
                `${cleanName} was updated successfully.`,
                "info",
                userId
            );


            createActivity(
    req.user.id,
    req.user.name,
    "user_updated",
    `${cleanName} was updated successfully.`,
    userId
);


            // ==================================
            // RESPONSE
            // ==================================

            res.json({
                success: true,
                message:
                    "User updated successfully.",
                user: updatedUser
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to update user."
            });

        }

    }
);


// ==========================================
// DELETE USER
// ==========================================

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    (req, res) => {

        try {

            const userId =
                req.params.id;


            // ==================================
            // PROTECT MAIN ADMIN
            // ==================================

            if (
                userId === "admin-001"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "The Main Admin account cannot be deleted."
                });

            }


            // ==================================
            // PREVENT SELF DELETE
            // ==================================

            if (
                userId === req.user.id
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot delete your own account."
                });

            }


            // ==================================
            // FIND USER
            // ==================================

            const existingUser =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email
                    FROM users
                    WHERE id = ?
                `).get(userId);


            if (!existingUser) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });

            }


            // ==================================
            // DELETE USER
            // ==================================

            db.prepare(`
                DELETE FROM users
                WHERE id = ?
            `).run(userId);


            // ==================================
            // CREATE NOTIFICATION
            // ==================================

            createNotification(
                req.user.id,
                "User Deleted",
                `${existingUser.name} was deleted from the system.`,
                "warning",
                userId
            );

            createActivity(
    req.user.id,
    req.user.name,
    "user_deleted",
    `${existingUser.name} was deleted from the system.`,
    userId
);

            

            // ==================================
            // RESPONSE
            // ==================================

            res.json({
                success: true,
                message:
                    "User deleted successfully."
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete user."
            });

        }

    }
);


module.exports = router;