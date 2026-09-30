const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET;

// ==========================================
// AUTHENTICATION
// ==========================================

function requireAuth(
    req,
    res,
    next
) {

    const token =
        req.cookies.token;

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session."
        });

    }
}

// ==========================================
// ADMIN ONLY
// ==========================================

function requireAdmin(
    req,
    res,
    next
) {

    if (
        !req.user ||
        req.user.role !== "admin"
    ) {

        return res.status(403).json({
            success: false,
            message: "Admin access required."
        });

    }

    next();
}

module.exports = {
    requireAuth,
    requireAdmin
};