// =========================================================
// ACTIVITY LOG
// =========================================================

let allActivities = [];
let filteredActivities = [];

let currentPage = 1;
let activityLimit = 10;


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    loadActivity();

    setupActivityEvents();

});


// =========================================================
// LOAD ACTIVITY
// =========================================================

async function loadActivity() {

    const tableBody =
        document.getElementById("activityTableBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">
                Loading...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "/api/activity",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load activity."
            );

        }

        allActivities =
            Array.isArray(data.logs)
                ? data.logs
                : [];

        filteredActivities =
            [...allActivities];

        currentPage = 1;

        renderActivity();

    } catch (error) {

        console.error(
            "Activity load error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading">
                    Failed to load activity.
                </td>
            </tr>
        `;

        showActivityMessage(
            error.message ||
            "Failed to load activity.",
            "error"
        );

    }

}


// =========================================================
// EVENTS
// =========================================================

function setupActivityEvents() {

    const search =
        document.getElementById(
            "activitySearch"
        );

    const action =
        document.getElementById(
            "activityAction"
        );

    const limit =
        document.getElementById(
            "activityLimit"
        );

    const refresh =
        document.getElementById(
            "refreshActivity"
        );

    const previous =
        document.getElementById(
            "activityPrev"
        );

    const next =
        document.getElementById(
            "activityNext"
        );


    // SEARCH

    if (search) {

        search.addEventListener(
            "input",
            function () {

                currentPage = 1;

                filterActivities();

            }
        );

    }


    // ACTION FILTER

    if (action) {

        action.addEventListener(
            "change",
            function () {

                currentPage = 1;

                filterActivities();

            }
        );

    }


    // LIMIT

    if (limit) {

        limit.addEventListener(
            "change",
            function () {

                activityLimit =
                    Number(limit.value) || 10;

                currentPage = 1;

                renderActivity();

            }
        );

    }


    // REFRESH

    if (refresh) {

        refresh.addEventListener(
            "click",
            async function () {

                refresh.disabled = true;

                refresh.textContent =
                    "↻ Loading...";

                await loadActivity();

                refresh.disabled = false;

                refresh.textContent =
                    "↻ Refresh";

            }
        );

    }


    // PREVIOUS

    if (previous) {

        previous.addEventListener(
            "click",
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    renderActivity();

                }

            }
        );

    }


    // NEXT

    if (next) {

        next.addEventListener(
            "click",
            function () {

                const totalPages =
                    Math.ceil(
                        filteredActivities.length /
                        activityLimit
                    );

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderActivity();

                }

            }
        );

    }

}


// =========================================================
// FILTER
// =========================================================

function filterActivities() {

    const searchInput =
        document.getElementById(
            "activitySearch"
        );

    const actionSelect =
        document.getElementById(
            "activityAction"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const action =
        actionSelect
            ? actionSelect.value
            : "all";


    filteredActivities =
        allActivities.filter(
            function (activity) {

                const userName =
                    String(
                        activity.user_name || ""
                    ).toLowerCase();

                const activityAction =
                    String(
                        activity.action || ""
                    ).toLowerCase();

                const description =
                    String(
                        activity.description || ""
                    ).toLowerCase();

                const targetId =
                    String(
                        activity.target_id || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    userName.includes(search) ||
                    activityAction.includes(search) ||
                    description.includes(search) ||
                    targetId.includes(search);


                const matchesAction =
                    action === "all" ||
                    activityAction ===
                    action.toLowerCase();


                return (
                    matchesSearch &&
                    matchesAction
                );

            }
        );


    renderActivity();

}


// =========================================================
// RENDER
// =========================================================

function renderActivity() {

    const tableBody =
        document.getElementById(
            "activityTableBody"
        );

    if (!tableBody) {
        return;
    }


    const total =
        filteredActivities.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / activityLimit
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        activityLimit;


    const endIndex =
        Math.min(
            startIndex +
            activityLimit,
            total
        );


    const pageActivities =
        filteredActivities.slice(
            startIndex,
            endIndex
        );


    if (
        pageActivities.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading">
                    No activity found.
                </td>
            </tr>
        `;

    } else {

        tableBody.innerHTML =
            pageActivities
                .map(
                    createActivityRow
                )
                .join("");

    }


    updateActivityInfo(
        total,
        startIndex,
        endIndex,
        totalPages
    );

}


// =========================================================
// CREATE TABLE ROW
// =========================================================

function createActivityRow(
    activity
) {

    const userName =
        escapeHtml(
            activity.user_name ||
            "Unknown"
        );


    const action =
        String(
            activity.action ||
            "default"
        );


    const description =
        escapeHtml(
            activity.description ||
            "-"
        );


    const targetId =
        escapeHtml(
            activity.target_id ||
            "-"
        );


    const date =
        formatActivityDate(
            activity.created_at
        );


    const actionLabel =
        getActionLabel(action);


    const actionClass =
        action
            .toLowerCase()
            .replace(
                /[^a-z0-9_-]/g,
                ""
            );


    return `
        <tr>

            <td>
                <strong>
                    ${userName}
                </strong>
            </td>

            <td>
                <span
                    class="activity-action ${actionClass}"
                >
                    ${actionLabel}
                </span>
            </td>

            <td>
                ${description}
            </td>

            <td>
                ${targetId}
            </td>

            <td>
                ${date}
            </td>

        </tr>
    `;

}


// =========================================================
// ACTION LABEL
// =========================================================

function getActionLabel(
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


    return labels[action] ||
        action || 
        "Activity";

}


// =========================================================
// UPDATE PAGINATION
// =========================================================

function updateActivityInfo(
    total,
    startIndex,
    endIndex,
    totalPages
) {

    const from =
        document.getElementById(
            "activityFrom"
        );

    const to =
        document.getElementById(
            "activityTo"
        );

    const totalElement =
        document.getElementById(
            "activityTotal"
        );

    const count =
        document.getElementById(
            "activityCount"
        );

    const page =
        document.getElementById(
            "activityPage"
        );

    const previous =
        document.getElementById(
            "activityPrev"
        );

    const next =
        document.getElementById(
            "activityNext"
        );


    if (from) {

        from.textContent =
            total === 0
                ? 0
                : startIndex + 1;

    }


    if (to) {

        to.textContent =
            endIndex;

    }


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (count) {

        count.textContent =
            `${total} activit${total === 1 ? "y" : "ies"}`;

    }


    if (page) {

        page.textContent =
            `Page ${currentPage} of ${totalPages}`;

    }


    if (previous) {

        previous.disabled =
            currentPage <= 1;

    }


    if (next) {

        next.disabled =
            currentPage >= totalPages;

    }

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatActivityDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================================
// MESSAGE
// =========================================================

function showActivityMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "activityMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.className =
        `dashboard-message ${type}`;

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value);

    return div.innerHTML;

}