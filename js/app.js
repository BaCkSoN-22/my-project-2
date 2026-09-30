
// ==========================================
// ADMIN SYSTEM - DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

async function initializeDashboard() {

    try {

        const currentUser = await requireLogin();

        if (!currentUser) {
            return;
        }

        setupUserInterface(currentUser);

        setupLogout();

        setupRefresh();

        if (currentUser.role === "admin") {

            await loadAdminDashboard();

        } else {

            setupUserDashboard(currentUser);

        }

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

        if (typeof showError === "function") {

            showError(
                "Unable to load dashboard."
            );

        }

    }

}


// ==========================================
// USER INTERFACE
// ==========================================

function setupUserInterface(user) {

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const welcomeName =
        document.getElementById("welcomeName");

    const welcomeText =
        document.getElementById("welcomeText");


    const name =
        user.name || "User";

    const role =
        user.role || "user";


    if (userName) {

        userName.textContent =
            name;

    }


    if (userRole) {

        userRole.textContent =
            role.toUpperCase();

    }


    if (welcomeName) {

        welcomeName.textContent =
            name;

    }


    if (welcomeText) {

        if (role === "admin") {

            welcomeText.textContent =
                "Here is what's happening with your system.";

        } else {

            welcomeText.textContent =
                "Here is what's happening with your account.";

        }

    }

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await logout();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


// ==========================================
// REFRESH
// ==========================================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshDashboard"
        );


    if (!refreshButton) {
        return;
    }


    refreshButton.addEventListener(
        "click",
        async () => {

            const originalText =
                refreshButton.textContent;


            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "↻ Loading...";


            try {

                await loadAdminDashboard();

                if (
                    typeof showSuccess ===
                    "function"
                ) {

                    showSuccess(
                        "Dashboard refreshed."
                    );

                }

            } catch (error) {

                console.error(
                    "Refresh error:",
                    error
                );

                if (
                    typeof showError ===
                    "function"
                ) {

                    showError(
                        "Unable to refresh dashboard."
                    );

                }

            } finally {

                refreshButton.disabled =
                    false;

                refreshButton.textContent =
                    originalText;

            }

        }
    );

}


// ==========================================
// ADMIN DASHBOARD
// ==========================================

async function loadAdminDashboard() {

    const recentList =
        document.getElementById(
            "recentUsersList"
        );


    if (recentList) {

        recentList.innerHTML = `
            <div class="dashboard-loading">
                Loading users...
            </div>
        `;

    }


    try {

        setApiStatus(
            "loading"
        );


        const response =
            await apiRequest(
                "/users"
            );


        const users =
            Array.isArray(response)
                ? response
                : response.users || [];


        setApiStatus(
            "online"
        );


        updateStatistics(users);

        renderRecentUsers(users);

        renderUserGrowth(users);

        updateSystemStatus();


    } catch (error) {

        console.error(
            "Loading users failed:",
            error
        );


        setApiStatus(
            "offline"
        );


        if (recentList) {

            recentList.innerHTML = `
                <div class="dashboard-error">
                    <strong>
                        Unable to load users
                    </strong>

                    <p>
                        Please check the server
                        connection and try again.
                    </p>
                </div>
            `;

        }


        if (
            typeof showError ===
            "function"
        ) {

            showError(
                error.message ||
                "Unable to load dashboard data."
            );

        }

        throw error;

    }

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics(users) {

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


    const admins =
        users.filter(
            user =>
                user.role === "admin"
        );


    const regularUsers =
        users.filter(
            user =>
                user.role !== "admin"
        );


    if (totalUsers) {

        animateNumber(
            totalUsers,
            regularUsers.length
        );

    }


    if (totalAdmins) {

        animateNumber(
            totalAdmins,
            admins.length
        );

    }


    if (totalAccounts) {

        animateNumber(
            totalAccounts,
            users.length
        );

    }

}


// ==========================================
// NUMBER ANIMATION
// ==========================================

function animateNumber(
    element,
    target
) {

    const duration =
        500;


    const start =
        Number(element.textContent) || 0;


    const difference =
        target - start;


    if (difference === 0) {

        element.textContent =
            target;

        return;

    }


    const startTime =
        performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime -
            startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const value =
            Math.round(
                start +
                difference * progress
            );


        element.textContent =
            value;


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


// ==========================================
// RECENT USERS
// ==========================================

function renderRecentUsers(users) {

    const container =
        document.getElementById(
            "recentUsersList"
        );


    if (!container) {
        return;
    }


    if (!users.length) {

        container.innerHTML = `
            <div class="dashboard-empty">
                <div class="empty-icon">
                    👥
                </div>

                <strong>
                    No users found
                </strong>

                <p>
                    There are no registered
                    users yet.
                </p>
            </div>
        `;

        return;

    }


    const sortedUsers =
        [...users]
            .sort(
                (
                    a,
                    b
                ) =>
                    getUserDate(b) -
                    getUserDate(a)
            )
            .slice(
                0,
                5
            );


    container.innerHTML =
        sortedUsers
            .map(
                user =>
                    createRecentUser(
                        user
                    )
            )
            .join("");

}


// ==========================================
// CREATE RECENT USER
// ==========================================

function createRecentUser(user) {

    const name =
        escapeHTML(
            user.name ||
            "Unknown User"
        );


    const email =
        escapeHTML(
            user.email ||
            "-"
        );


    const role =
        user.role ||
        "user";


    const initials =
        getInitials(
            user.name
        );


    const date =
        formatDate(
            user.createdAt
        );


    return `
        <div class="recent-user">

            <div class="recent-user-avatar">
                ${escapeHTML(initials)}
            </div>

            <div class="recent-user-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${email}
                </span>

            </div>

            <div class="recent-user-meta">

                <span
                    class="recent-user-role
                    ${role === "admin"
                        ? "admin"
                        : "user"}"
                >
                    ${escapeHTML(
                        role.toUpperCase()
                    )}
                </span>

                <small>
                    ${date}
                </small>

            </div>

        </div>
    `;

}


// ==========================================
// USER GROWTH
// ==========================================

function renderUserGrowth(users) {

    const chart =
        document.getElementById(
            "userGrowthChart"
        );


    if (!chart) {
        return;
    }


    if (!users.length) {

        chart.innerHTML = `
            <div class="chart-placeholder">

                <span>
                    📈
                </span>

                <p>
                    No user data available
                </p>

            </div>
        `;

        return;

    }


    const months =
        getLastSixMonths();


    const monthlyData =
        months.map(
            month => {

                const count =
                    users.filter(
                        user =>
                            isSameMonth(
                                getUserDate(user),
                                month.date
                            )
                    ).length;


                return {
                    label:
                        month.label,
                    count
                };

            }
        );


    const max =
        Math.max(
            ...monthlyData.map(
                item =>
                    item.count
            ),
            1
        );


    chart.innerHTML = `
        <div class="growth-chart">

            <div class="chart-bars">

                ${monthlyData
                    .map(
                        item => {

                            const height =
                                Math.max(
                                    (
                                        item.count /
                                        max
                                    ) * 100,
                                    item.count > 0
                                        ? 8
                                        : 2
                                );


                            return `
                                <div
                                    class="chart-bar-wrapper"
                                >

                                    <div
                                        class="chart-value"
                                    >
                                        ${item.count}
                                    </div>

                                    <div
                                        class="chart-bar"
                                        style="
                                            height:
                                            ${height}%;
                                        "
                                        title="
                                            ${item.label}:
                                            ${item.count}
                                            users
                                        "
                                    ></div>

                                    <div
                                        class="chart-label"
                                    >
                                        ${item.label}
                                    </div>

                                </div>
                            `;

                        }
                    )
                    .join("")}

            </div>

        </div>
    `;

}


// ==========================================
// LAST 6 MONTHS
// ==========================================

function getLastSixMonths() {

    const result = [];

    const now =
        new Date();


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


        result.push({

            date,

            label:
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short"
                    }
                )

        });

    }


    return result;

}


// ==========================================
// SAME MONTH
// ==========================================

function isSameMonth(
    dateA,
    dateB
) {

    if (
        !dateA ||
        !dateB
    ) {

        return false;

    }


    return (
        dateA.getFullYear() ===
        dateB.getFullYear()
    ) &&
    (
        dateA.getMonth() ===
        dateB.getMonth()
    );

}


// ==========================================
// USER DATE
// ==========================================

function getUserDate(user) {

    const value =
        user.createdAt ||
        user.created_at;


    if (!value) {

        return 0;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 0;

    }


    return date;

}


// ==========================================
// SYSTEM STATUS
// ==========================================

function updateSystemStatus() {

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
            "● Connected";

        databaseStatus.className =
            "status-online";

    }


    if (authStatus) {

        authStatus.textContent =
            "● Active";

        authStatus.className =
            "status-online";

    }


    if (sessionStatus) {

        sessionStatus.textContent =
            "● Active";

        sessionStatus.className =
            "status-online";

    }

}


// ==========================================
// API STATUS
// ==========================================

function setApiStatus(
    status
) {

    const element =
        document.getElementById(
            "apiStatus"
        );


    if (!element) {
        return;
    }


    if (status === "online") {

        element.textContent =
            "● Online";

        element.className =
            "status-online";

    }


    if (status === "loading") {

        element.textContent =
            "● Checking...";

        element.className =
            "status-loading";

    }


    if (status === "offline") {

        element.textContent =
            "● Offline";

        element.className =
            "status-offline";

    }

}


// ==========================================
// USER DASHBOARD
// ==========================================

function setupUserDashboard(
    user
) {

    const userDashboard =
        document.getElementById(
            "userDashboardCard"
        );


    const adminStats =
        document.getElementById(
            "adminStats"
        );


    const analytics =
        document.getElementById(
            "dashboardAnalytics"
        );


    const quickActions =
        document.querySelectorAll(
            ".admin-dashboard-only"
        );


    if (adminStats) {

        adminStats.style.display =
            "none";

    }


    if (analytics) {

        analytics.style.display =
            "none";

    }


    quickActions.forEach(
        element => {

            element.style.display =
                "none";

        }
    );


    if (userDashboard) {

        userDashboard.style.display =
            "block";

    }


    const name =
        document.getElementById(
            "userAccountName"
        );


    const email =
        document.getElementById(
            "userAccountEmail"
        );


    const role =
        document.getElementById(
            "userAccountRole"
        );


    if (name) {

        name.textContent =
            user.name ||
            "-";

    }


    if (email) {

        email.textContent =
            user.email ||
            "-";

    }


    if (role) {

        role.textContent =
            (
                user.role ||
                "user"
            ).toUpperCase();

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(
    value
) {

    if (!value) {

        return "Unknown";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ==========================================
// INITIALS
// ==========================================

function getInitials(
    name
) {

    if (!name) {

        return "?";

    }


    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {

        return "?";

    }


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1]
            .charAt(0)
    ).toUpperCase();

}


// ==========================================
// HTML ESCAPE
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
