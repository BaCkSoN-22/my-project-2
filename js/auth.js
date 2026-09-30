// ==========================================
// REAL API AUTHENTICATION
// ==========================================

const API_BASE = "/api";

// ==========================================
// CURRENT USER
// ==========================================

let currentUser = null;

// ==========================================
// API REQUEST HELPER
// ==========================================

async function apiRequest(
    url,
    options = {}
) {
    const response = await fetch(
        API_BASE + url,
        {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Server request failed."
        );
    }

    return data;
}

// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {

    try {

        const data =
            await apiRequest(
                "/auth/me"
            );

        currentUser =
            data.user;

        return currentUser;

    } catch (error) {

        currentUser = null;

        return null;
    }
}

// ==========================================
// LOGIN
// ==========================================

async function login(
    email,
    password
) {

    try {

        const data =
            await apiRequest(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        currentUser =
            data.user;

        return {
            success: true,
            user: data.user
        };

    } catch (error) {

        return {
            success: false,
            message: error.message
        };
    }
}

// ==========================================
// REGISTER
// ==========================================

async function register(
    name,
    email,
    password
) {

    try {

        const data =
            await apiRequest(
                "/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

        return {
            success: true,
            message: data.message
        };

    } catch (error) {

        return {
            success: false,
            message: error.message
        };
    }
}

// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        await apiRequest(
            "/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        currentUser = null;

        window.location.href =
            "index.html";
    }
}

// ==========================================
// AUTH GUARD
// ==========================================

async function requireLogin() {

    const user =
        await getCurrentUser();

    if (!user) {

        window.location.href =
            "index.html";

        return null;
    }

    return user;
}

// ==========================================
// ADMIN GUARD
// ==========================================

async function requireAdmin() {

    const user =
        await requireLogin();

    if (!user) {
        return null;
    }

    if (user.role !== "admin") {

        alert(
            "Access denied. Admin only."
        );

        window.location.href =
            "dashboard.html";

        return null;
    }

    return user;
}