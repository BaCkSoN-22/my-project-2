const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../db");
const { createActivity } = require("../utils/activity");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// CREATE TOKEN
// ==========================================

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

// ==========================================
// CREATE NOTIFICATION
// ==========================================

function createNotification(
    userId,
    title,
    message,
    type = "info"
) {
    try {
        db.prepare(`
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type,
                is_read,
                created_at
            )
            VALUES (?, ?, ?, ?, 0, ?)
        `).run(
            userId,
            title,
            message,
            type,
            new Date().toISOString()
        );
    } catch (error) {
        console.error(
            "Notification creation error:",
            error
        );
    }
}

// ==========================================
// LOGIN
// ==========================================

router.post(
    "/login",
    async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            // ==================================
            // VALIDATION
            // ==================================

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email and password are required."
                });
            }

            // ==================================
            // FIND USER
            // ==================================

            const user = db.prepare(`
                SELECT *
                FROM users
                WHERE email = ?
            `).get(
                email
                    .trim()
                    .toLowerCase()
            );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            // ==================================
            // CHECK PASSWORD
            // ==================================

            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );

            if (!passwordCorrect) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            // ==================================
            // CREATE TOKEN
            // ==================================

            const token = createToken(user);

            // ==================================
            // SAVE COOKIE
            // ==================================

            res.cookie(
                "token",
                token,
                {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: false,
                    maxAge:
                        7 * 24 * 60 * 60 * 1000
                }
            );

            // ==================================
            // LOGIN NOTIFICATION
            // ==================================

            createNotification(
                user.id,
                "Successful Login",
                `Welcome back, ${user.name}! You logged in successfully.`,
                "success"
            );

            // ==================================
            // ACTIVITY LOG
            // ==================================

            createActivity(
                user.id,
                user.name,
                "login",
                `${user.name} logged into the system.`,
                user.id
            );

            // ==================================
            // RESPONSE
            // ==================================

            res.json({
                success: true,
                message:
                    "Login successful.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Server error."
            });
        }
    }
);

// ==========================================
// REGISTER
// ==========================================

router.post(
    "/register",
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
            // CHECK EXISTING USER
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

            // ==================================
            // CREATE USER ID
            // ==================================

            const id =
                "user-" +
                Date.now();

            const now =
                new Date().toISOString();

            // ==================================
            // CREATE USER
            // ==================================

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
            // REGISTRATION NOTIFICATION
            // ==========================================

            createNotification(
                id,
                "Registration Successful",
                `Welcome, ${cleanName}! Your account has been created successfully.`,
                "success"
            );

            // ==================================
            // REGISTRATION ACTIVITY
            // ==========================================

            createActivity(
                id,
                cleanName,
                "registration",
                `${cleanName} registered a new account.`,
                id
            );

            // ==================================
            // NOTIFY MAIN ADMIN
            // ==========================================

            createNotification(
                "admin-001",
                "New User Registered",
                `${cleanName} (${cleanEmail}) registered a new account.`,
                "info"
            );

            // ==================================
            // ADMIN ACTIVITY
            // ==========================================

            createActivity(
                "admin-001",
                "Admin",
                "registration",
                `${cleanName} (${cleanEmail}) registered a new account.`,
                id
            );

            // ==================================
            // RESPONSE
            // ==================================

            res.status(201).json({
                success: true,
                message:
                    "Registration successful."
            });

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Server error."
            });
        }
    }
);

// ==========================================
// CURRENT USER
// ==========================================

router.get(
    "/me",
    (req, res) => {
        const token =
            req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Not authenticated."
            });
        }

        try {
            const decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );

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
                    decoded.id
                );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "User no longer exists."
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message:
                    "Invalid session."
            });
        }
    }
);

// ==========================================
// LOGOUT
// ==========================================

router.post(
    "/logout",
    (req, res) => {
        res.clearCookie(
            "token"
        );

        res.json({
            success: true,
            message:
                "Logged out successfully."
        });
    }
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;