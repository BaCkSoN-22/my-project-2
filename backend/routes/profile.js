const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../db");
const {
    requireAuth
} = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET PROFILE
// ==========================================

router.get(
    "/",
    requireAuth,
    (req, res) => {

        try {

            const user =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at
                    FROM users
                    WHERE id = ?
                `).get(
                    req.user.id
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
                    "Failed to load profile."
            });

        }

    }
);

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(
    "/",
    requireAuth,
    (req, res) => {

        try {

            const {
                name,
                email
            } = req.body;

            if (
                !name ||
                !email
            ) {

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

            const duplicate =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    AND id != ?
                `).get(
                    cleanEmail,
                    req.user.id
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

            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(
                cleanName,
                cleanEmail,
                now,
                req.user.id
            );

            const updatedUser =
                db.prepare(`
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        created_at
                    FROM users
                    WHERE id = ?
                `).get(
                    req.user.id
                );

            res.json({
                success: true,
                message:
                    "Profile updated successfully.",
                user: updatedUser
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to update profile."
            });

        }

    }
);

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/password",
    requireAuth,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword
            } = req.body;

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Current and new password are required."
                });

            }

            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must contain at least 6 characters."
                });

            }

            const user =
                db.prepare(`
                    SELECT *
                    FROM users
                    WHERE id = ?
                `).get(
                    req.user.id
                );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });

            }

            const passwordCorrect =
                await bcrypt.compare(
                    currentPassword,
                    user.password_hash
                );

            if (!passwordCorrect) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Current password is incorrect."
                });

            }

            const passwordHash =
                await bcrypt.hash(
                    newPassword,
                    12
                );

            const now =
                new Date().toISOString();

            db.prepare(`
                UPDATE users
                SET
                    password_hash = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(
                passwordHash,
                now,
                req.user.id
            );

            res.json({
                success: true,
                message:
                    "Password changed successfully."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to change password."
            });

        }

    }
);

module.exports = router;