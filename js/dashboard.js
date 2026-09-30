// ==========================================
// DASHBOARD
// ==========================================

(function () {

    let currentUser = null;
    let users = [];


    // ==========================================
    // INITIALIZE
    // ==========================================

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );


    async function initializeDashboard() {

        try {

            // ----------------------------------
            // CURRENT USER
            // ----------------------------------

            currentUser =
                typeof getCurrentUser === "function"
                    ? getCurrentUser()
                    : null;


            if (!currentUser) {
                return;
            }


            updateUserInformation(
                currentUser
            );


            // ----------------------------------
            // USER DASHBOARD
            // ----------------------------------

            if (
                String(currentUser.role)
                    .toLowerCase() !== "admin"
            ) {

                showUserDashboard(
                    currentUser
                );

                return;
            }


            // ----------------------------------
            // ADMIN DASHBOARD
            // ----------------------------------

            showAdminDashboard();

            await loadDashboardData();

            await loadRecentActivity();

            setupRefreshButton();

            setupQuickActions();

            checkApiStatus();


        } catch (error) {

            console.error(
                "Dashboard initialization error:",
                error
            );

            showDashboardMessage(
                "Failed to load dashboard data.",
                "error"
            );

        }

    }


    // ==========================================
    // USER INFORMATION
    // ==========================================

    function updateUserInformation(
        user
    ) {

        const name =
            user.name ||
            user.fullName ||
            "User";


        const role =
            String(
                user.role || "user"
            ).toUpperCase();


        const userName =
            document.getElementById(
                "userName"
            );


        const userRole =
            document.getElementById(
                "userRole"
            );


        const welcomeName =
            document.getElementById(
                "welcomeName"
            );


        const userAccountName =
            document.getElementById(
                "userAccountName"
            );


        const userAccountEmail =
            document.getElementById(
                "userAccountEmail"
            );


        const userAccountRole =
            document.getElementById(
                "userAccountRole"
            );


        if (userName) {
            userName.textContent = name;
        }


        if (userRole) {
            userRole.textContent = role;
        }


        if (welcomeName) {
            welcomeName.textContent = name;
        }


        if (userAccountName) {
            userAccountName.textContent = name;
        }


        if (userAccountEmail) {
            userAccountEmail.textContent =
                user.email || "-";
        }


        if (userAccountRole) {
            userAccountRole.textContent =
                role;
        }

    }


    // ==========================================
    // SHOW USER DASHBOARD
    // ==========================================

    function showUserDashboard(
        user
    ) {

        const userDashboard =
            document.getElementById(
                "userDashboardCard"
            );


        if (userDashboard) {
            userDashboard.style.display =
                "block";
        }


        const welcomeText =
            document.getElementById(
                "welcomeText"
            );


        if (welcomeText) {

            welcomeText.textContent =
                "Here is what's happening with your account.";

        }

    }


    // ==========================================
    // SHOW ADMIN DASHBOARD
    // ==========================================

    function showAdminDashboard() {

        document
            .querySelectorAll(
                ".admin-dashboard-only"
            )
            .forEach(
                function (element) {

                    element.style.display =
                        "";

                }
            );

    }


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    async function loadDashboardData() {

        setLoadingState();


        try {

            const response =
                await fetch(
                    "/api/users",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load users."
                );

            }


            users =
                Array.isArray(data.users)
                    ? data.users
                    : [];


            updateStatistics();

            renderRecentUsers();

            renderUserGrowth();

            updateSystemStatus(true);


        } catch (error) {

            console.error(
                "Dashboard data error:",
                error
            );


            updateSystemStatus(false);

            showDashboardMessage(
                "Failed to load dashboard data.",
                "error"
            );

        }

    }


    // ==========================================
    // STATISTICS
    // ==========================================

    function updateStatistics() {

        const totalUsers =
            users.length;


        const totalAdmins =
            users.filter(
                function (user) {

                    return (
                        String(
                            user.role || ""
                        ).toLowerCase() ===
                        "admin"
                    );

                }
            ).length;


        const totalAccounts =
            users.length;


        setElementText(
            "totalUsers",
            totalUsers
        );


        setElementText(
            "totalAdmins",
            totalAdmins
        );


        setElementText(
            "totalAccounts",
            totalAccounts
        );

    }


    // ==========================================
    // RECENT USERS
    // ==========================================

    function renderRecentUsers() {

        const container =
            document.getElementById(
                "recentUsersList"
            );


        if (!container) {
            return;
        }


        if (users.length === 0) {

            container.innerHTML = `

                <div class="dashboard-loading">
                    No users found.
                </div>

            `;

            return;
        }


        const recentUsers =
            [...users]
                .sort(
                    function (a, b) {

                        const dateA =
                            new Date(
                                a.created_at ||
                                a.createdAt ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b.created_at ||
                                b.createdAt ||
                                0
                            ).getTime();

                        return dateB - dateA;

                    }
                )
                .slice(0, 5);


        container.innerHTML =
            recentUsers
                .map(
                    createRecentUserHTML
                )
                .join("");

    }


    // ==========================================
    // RECENT USER HTML
    // ==========================================

    function createRecentUserHTML(
        user
    ) {

        const name =
            user.name ||
            user.fullName ||
            "Unknown User";


        const email =
            user.email ||
            "-";


        const role =
            String(
                user.role || "user"
            ).toUpperCase();


        const initial =
            name
                .charAt(0)
                .toUpperCase();


        const createdAt =
            formatDate(
                user.created_at ||
                user.createdAt
            );


        return `

            <div class="recent-user-item">

                <div class="recent-user-avatar">
                    ${escapeHTML(initial)}
                </div>

                <div class="recent-user-info">

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        ${escapeHTML(email)}
                    </span>

                </div>

                <div class="recent-user-meta">

                    <span class="role-badge">
                        ${escapeHTML(role)}
                    </span>

                    <small>
                        ${escapeHTML(createdAt)}
                    </small>

                </div>

            </div>

        `;

    }


    // ==========================================
    // USER GROWTH
    // ==========================================

    function renderUserGrowth() {

        const chart =
            document.getElementById(
                "userGrowthChart"
            );


        if (!chart) {
            return;
        }


        if (users.length === 0) {

            chart.innerHTML = `

                <div class="chart-placeholder">

                    <span>📈</span>

                    <p>
                        No user data available
                    </p>

                </div>

            `;

            return;
        }


        const monthlyData =
            getMonthlyUserData();


        const maxValue =
            Math.max(
                ...monthlyData.map(
                    item => item.count
                ),
                1
            );


        chart.innerHTML = `

            <div class="simple-growth-chart">

                ${monthlyData
                    .map(
                        function (item) {

                            const height =
                                Math.max(
                                    (item.count /
                                        maxValue) *
                                        100,
                                    5
                                );

                            return `

                                <div class="growth-column">

                                    <div
                                        class="growth-value"
                                    >
                                        ${item.count}
                                    </div>

                                    <div
                                        class="growth-bar"
                                        style="height:${height}%"
                                    ></div>

                                    <div
                                        class="growth-label"
                                    >
                                        ${escapeHTML(
                                            item.label
                                        )}
                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("")}

            </div>

        `;

    }


    // ==========================================
    // MONTHLY DATA
    // ==========================================

    function getMonthlyUserData() {

        const now =
            new Date();


        const result = [];


        for (
            let i = 5;
            i >= 0;
            i--
        ) {

            const date =
                new Date(
                    now.getFullYear(),
                    now.getMonth() - i,
                    1
                );


            const year =
                date.getFullYear();


            const month =
                date.getMonth();


            const count =
                users.filter(
                    function (user) {

                        const created =
                            new Date(
                                user.created_at ||
                                user.createdAt ||
                                ""
                            );


                        return (
                            !Number.isNaN(
                                created.getTime()
                            ) &&
                            created.getFullYear() ===
                                year &&
                            created.getMonth() ===
                                month
                        );

                    }
                ).length;


            result.push({

                label:
                    date.toLocaleDateString(
                        undefined,
                        {
                            month: "short"
                        }
                    ),

                count: count

            });

        }


        return result;

    }


    // ==========================================
    // REFRESH
    // ==========================================

    function setupRefreshButton() {

        const button =
            document.getElementById(
                "refreshDashboard"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            async function () {

                button.disabled = true;

                button.textContent =
                    "↻ Loading...";


                await loadDashboardData();


                button.disabled = false;

                button.textContent =
                    "↻ Refresh";

            }
        );

    }


    // ==========================================
    // API STATUS
    // ==========================================

    async function checkApiStatus() {

        const status =
            document.getElementById(
                "apiStatus"
            );


        if (!status) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            if (response.ok) {

                status.textContent =
                    "● Online";

                status.className =
                    "status-online";

            } else {

                status.textContent =
                    "● Offline";

                status.className =
                    "status-offline";

            }

        } catch (error) {

            status.textContent =
                "● Offline";

            status.className =
                "status-offline";

        }

    }


    // ==========================================
    // DATABASE / AUTH STATUS
    // ==========================================

    function updateSystemStatus(
        online
    ) {

        const databaseStatus =
            document.getElementById(
                "databaseStatus"
            );


        const authStatus =
            document.getElementById(
                "authStatus"
            );


        const sessionStatus =
            document.getElementById(
                "sessionStatus"
            );


        if (databaseStatus) {

            databaseStatus.textContent =
                online
                    ? "● Connected"
                    : "● Unavailable";

            databaseStatus.className =
                online
                    ? "status-online"
                    : "status-offline";

        }


        if (authStatus) {

            authStatus.textContent =
                currentUser
                    ? "● Active"
                    : "● Inactive";

            authStatus.className =
                currentUser
                    ? "status-online"
                    : "status-offline";

        }


        if (sessionStatus) {

            sessionStatus.textContent =
                currentUser
                    ? "● Active"
                    : "● Inactive";

            sessionStatus.className =
                currentUser
                    ? "status-online"
                    : "status-offline";

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    function setLoadingState() {

        const totalUsers =
            document.getElementById(
                "totalUsers"
            );


        const totalAdmins =
            document.getElementById(
                "totalAdmins"
            );


        const totalAccounts =
            document.getElementById(
                "totalAccounts"
            );


        if (totalUsers) {
            totalUsers.textContent = "...";
        }


        if (totalAdmins) {
            totalAdmins.textContent = "...";
        }


        if (totalAccounts) {
            totalAccounts.textContent = "...";
        }

    }


    // ==========================================
    // MESSAGE
    // ==========================================

    function showDashboardMessage(
        message,
        type = "error"
    ) {

        const element =
            document.getElementById(
                "dashboardMessage"
            );


        if (!element) {
            return;
        }


        element.textContent =
            message;


        element.className =
            `dashboard-message ${type}`;


        element.classList.remove(
            "hidden"
        );

    }


    // ==========================================
    // SET TEXT
    // ==========================================

    function setElementText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    // ==========================================
    // DATE
    // ==========================================

    function formatDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";

        }


        return parsed.toLocaleDateString(
            undefined,
            {
                dateStyle: "medium"
            }
        );

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }

    // ==========================================
// RECENT ACTIVITY
// ==========================================

async function loadRecentActivity() {

    const container =
        document.getElementById(
            "dashboardActivityList"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/activity",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load activity."
            );
        }

        const logs =
            Array.isArray(data.logs)
                ? data.logs
                : [];

        renderRecentActivity(
            logs.slice(0, 5)
        );

    } catch (error) {

        console.error(
            "Recent activity error:",
            error
        );

        container.innerHTML = `
            <div class="dashboard-loading">
                Failed to load activity.
            </div>
        `;

    }

}


// ==========================================
// RENDER RECENT ACTIVITY
// ==========================================

function renderRecentActivity(logs) {

    const container =
        document.getElementById(
            "dashboardActivityList"
        );

    if (!container) {
        return;
    }

    if (logs.length === 0) {

        container.innerHTML = `
            <div class="dashboard-loading">
                No activity yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        logs
            .map(
                createDashboardActivityHTML
            )
            .join("");

}


// ==========================================
// ACTIVITY HTML
// ==========================================

function createDashboardActivityHTML(
    activity
) {

    const action =
        normalizeDashboardAction(
            activity.action
        );

    const icon =
        getDashboardActivityIcon(
            action
        );

    const actionLabel =
        getDashboardActivityLabel(
            action
        );

    const actionClass =
        getDashboardActivityClass(
            action
        );

    const userName =
        activity.user_name ||
        "Unknown";

    const description =
        activity.description ||
        "-";

    const date =
        formatDashboardActivityDate(
            activity.created_at
        );

    return `
        <div class="dashboard-activity-item">

            <div
                class="dashboard-activity-icon ${actionClass}"
            >
                ${icon}
            </div>

            <div class="dashboard-activity-content">

                <div
                    class="dashboard-activity-title"
                >

                    <strong>
                        ${escapeHTML(userName)}
                    </strong>

                    <span
                        class="dashboard-activity-action"
                    >
                        ${escapeHTML(actionLabel)}
                    </span>

                </div>

                <div
                    class="dashboard-activity-description"
                >
                    ${escapeHTML(description)}
                </div>

                <div
                    class="dashboard-activity-date"
                >
                    ${escapeHTML(date)}
                </div>

            </div>

        </div>
    `;

}


// ==========================================
// NORMALIZE ACTION
// ==========================================

function normalizeDashboardAction(action) {

    const value =
        String(
            action || ""
        )
            .trim()
            .toLowerCase();

    const map = {

        "login":
            "login",

        "successful_login":
            "login",

        "user added":
            "user_added",

        "user_added":
            "user_added",

        "user updated":
            "user_updated",

        "user_updated":
            "user_updated",

        "user deleted":
            "user_deleted",

        "user_deleted":
            "user_deleted",

        "registration":
            "registration",

        "registration successful":
            "registration",

        "new user registered":
            "registration"

    };

    return (
        map[value] ||
        value ||
        "unknown"
    );

}


// ==========================================
// ACTIVITY LABEL
// ==========================================

function getDashboardActivityLabel(
    action
) {

    const labels = {

        login:
            "Login",

        user_added:
            "User Added",

        user_updated:
            "User Updated",

        user_deleted:
            "User Deleted",

        registration:
            "Registration"

    };

    return (
        labels[action] ||
        "Activity"
    );

}


// ==========================================
// ACTIVITY ICON
// ==========================================

function getDashboardActivityIcon(
    action
) {

    switch (action) {

        case "login":
            return "🔐";

        case "user_added":
            return "➕";

        case "user_updated":
            return "✏️";

        case "user_deleted":
            return "🗑️";

        case "registration":
            return "📝";

        default:
            return "📋";

    }

}


// ==========================================
// ACTIVITY CLASS
// ==========================================

function getDashboardActivityClass(
    action
) {

    switch (action) {

        case "login":
            return "activity-login";

        case "user_added":
            return "activity-added";

        case "user_updated":
            return "activity-updated";

        case "user_deleted":
            return "activity-deleted";

        case "registration":
            return "activity-registration";

        default:
            return "activity-default";

    }

}


// ==========================================
// ACTIVITY DATE
// ==========================================

function formatDashboardActivityDate(
    date
) {

    if (!date) {
        return "-";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }

    return parsed.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}

// ==========================================
// QUICK ACTIONS
// ==========================================

function setupQuickActions() {

    const addUserBtn =
        document.getElementById("quickAddUser");

    const manageUsersBtn =
        document.getElementById("quickManageUsers");

    const profileBtn =
        document.getElementById("quickProfile");

    const settingsBtn =
        document.getElementById("quickSettings");


    if (addUserBtn) {

        addUserBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "users.html?action=add";

            }
        );

    }


    if (manageUsersBtn) {

        manageUsersBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "users.html";

            }
        );

    }


    if (profileBtn) {

        profileBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "profile.html";

            }
        );

    }


    if (settingsBtn) {

        settingsBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "settings.html";

            }
        );

    }

}


})();