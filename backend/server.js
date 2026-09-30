
require("dotenv").config();


const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");


// ==========================================
// LOAD DATABASE
// ==========================================

require("./db");


// ==========================================
// ROUTES
// ==========================================

const authRoutes =
    require("./routes/auth");


const usersRoutes =
    require("./routes/users");


const profileRoutes =
    require("./routes/profile");


const notificationsRoutes =
    require("./routes/notifications");


const activityRoutes =
    require("./routes/activity");


// ==========================================
// APP
// ==========================================

const app =
    express();


const PORT =
    process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    cookieParser()
);


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/users",
    usersRoutes
);


app.use(
    "/api/profile",
    profileRoutes
);


app.use(
    "/api/notifications",
    notificationsRoutes
);

app.use(
    "/api/activity",
    activityRoutes
);

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            ".."
        )
    )
);


// ==========================================
// API 404
// ==========================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            " Admin System Server Started"
        );

        console.log(
            "======================================"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log("");

    }
);
