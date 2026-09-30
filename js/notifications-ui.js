// ==========================================
// NOTIFICATIONS UI
// ==========================================

(function () {

    let notifications = [];

    let notificationBell = null;
    let notificationDropdown = null;
    let notificationList = null;
    let notificationBadge = null;


    // ==========================================
    // INITIALIZE
    // ==========================================

    document.addEventListener(
        "DOMContentLoaded",
        initializeNotifications
    );


    async function initializeNotifications() {

        createNotificationUI();

        await loadNotifications();

        startAutoRefresh();
    }


    // ==========================================
    // CREATE UI
    // ==========================================

    function createNotificationUI() {

        const topbar =
            document.querySelector(".topbar");

        if (!topbar) {
            return;
        }


        // Prevent duplicate UI

        if (
            document.querySelector(
                ".notification-wrapper"
            )
        ) {
            return;
        }


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "notification-wrapper";


        wrapper.innerHTML = `

            <button
                type="button"
                class="notification-bell"
                id="notificationBell"
                aria-label="Notifications"
            >

                <span class="notification-icon">
                    🔔
                </span>

                <span
                    class="notification-badge"
                    id="notificationBadge"
                    hidden
                >
                    0
                </span>

            </button>


            <div
                class="notification-dropdown"
                id="notificationDropdown"
                hidden
            >

                <div class="notification-header">

                    <div>

                        <strong>
                            Notifications
                        </strong>

                        <span
                            class="notification-unread-text"
                            id="notificationUnreadText"
                        >
                            0 unread
                        </span>

                    </div>


                    <button
                        type="button"
                        id="markAllReadBtn"
                        class="notification-mark-all"
                    >
                        Mark all read
                    </button>

                </div>


                <div
                    class="notification-list"
                    id="notificationList"
                >

                    <div class="notification-loading">
                        Loading...
                    </div>

                </div>

            </div>

        `;


        topbar.prepend(wrapper);


        notificationBell =
            document.getElementById(
                "notificationBell"
            );


        notificationDropdown =
            document.getElementById(
                "notificationDropdown"
            );


        notificationList =
            document.getElementById(
                "notificationList"
            );


        notificationBadge =
            document.getElementById(
                "notificationBadge"
            );


        notificationBell.addEventListener(
            "click",
            toggleDropdown
        );


        const markAllButton =
            document.getElementById(
                "markAllReadBtn"
            );


        if (markAllButton) {

            markAllButton.addEventListener(
                "click",
                markAllAsRead
            );

        }


        document.addEventListener(
            "click",
            handleOutsideClick
        );

    }


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    async function loadNotifications() {

        try {

            const response =
                await fetch(
                    "/api/notifications",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            if (response.status === 401) {
                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load notifications."
                );

            }


            notifications =
                Array.isArray(
                    data.notifications
                )
                    ? data.notifications
                    : [];


            updateBadge(
                data.unreadCount || 0
            );


            renderNotifications();


        } catch (error) {

            console.error(
                "Notifications error:",
                error
            );


            if (notificationList) {

                notificationList.innerHTML = `

                    <div class="notification-empty">
                        Failed to load notifications.
                    </div>

                `;

            }

        }

    }


    // ==========================================
    // UPDATE BADGE
    // ==========================================

    function updateBadge(count) {

        if (!notificationBadge) {
            return;
        }


        const unreadCount =
            Number(count) || 0;


        if (unreadCount > 0) {

            notificationBadge.hidden =
                false;

            notificationBadge.textContent =
                unreadCount > 99
                    ? "99+"
                    : unreadCount;

        } else {

            notificationBadge.hidden =
                true;

        }


        const unreadText =
            document.getElementById(
                "notificationUnreadText"
            );


        if (unreadText) {

            unreadText.textContent =
                `${unreadCount} unread`;

        }

    }


    // ==========================================
    // RENDER NOTIFICATIONS
    // ==========================================

    function renderNotifications() {

        if (!notificationList) {
            return;
        }


        if (notifications.length === 0) {

            notificationList.innerHTML = `

                <div class="notification-empty">

                    <div class="notification-empty-icon">
                        🔔
                    </div>

                    <div>
                        No notifications
                    </div>

                </div>

            `;

            return;
        }


        notificationList.innerHTML =
            notifications
                .map(
                    createNotificationHTML
                )
                .join("");


        notificationList
            .querySelectorAll(
                ".notification-item"
            )
            .forEach(
                connectNotificationEvents
            );

    }


    // ==========================================
    // NOTIFICATION HTML
    // ==========================================

    function createNotificationHTML(
        notification
    ) {

        const unreadClass =
            Number(notification.is_read) === 0
                ? "unread"
                : "";


        const typeClass =
            notification.type ||
            "info";


        return `

            <div
                class="notification-item ${unreadClass}"
                data-id="${escapeHTML(notification.id)}"
            >

                <div
                    class="notification-type ${escapeHTML(typeClass)}"
                >
                    ${getNotificationIcon(
                        typeClass
                    )}
                </div>


                <div class="notification-content">

                    <div class="notification-title">

                        ${escapeHTML(
                            notification.title
                        )}

                    </div>


                    <div class="notification-message">

                        ${escapeHTML(
                            notification.message
                        )}

                    </div>


                    <div class="notification-time">

                        ${formatNotificationDate(
                            notification.created_at
                        )}

                    </div>

                </div>


                <div class="notification-actions">

                    ${
                        Number(
                            notification.is_read
                        ) === 0

                            ? `

                                <button
                                    type="button"
                                    class="notification-read-btn"
                                    title="Mark as read"
                                >
                                    ✓
                                </button>

                            `

                            : ""
                    }


                    <button
                        type="button"
                        class="notification-delete-btn"
                        title="Delete"
                    >
                        ×
                    </button>

                </div>

            </div>

        `;

    }


    // ==========================================
    // CONNECT EVENTS
    // ==========================================

    function connectNotificationEvents(
        item
    ) {

        const id =
            item.dataset.id;


        const readButton =
            item.querySelector(
                ".notification-read-btn"
            );


        const deleteButton =
            item.querySelector(
                ".notification-delete-btn"
            );


        // ======================================
        // MARK AS READ
        // ======================================

        if (readButton) {

            readButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    markAsRead(id);

                }
            );

        }


        // ======================================
        // DELETE
        // ======================================

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteNotification(id);

                }
            );

        }


        // ======================================
        // CLICK NOTIFICATION
        // ======================================

        item.addEventListener(
            "click",
            async function () {

                const notification =
                    notifications.find(
                        function (n) {

                            return (
                                String(n.id) ===
                                String(id)
                            );

                        }
                    );


                if (!notification) {
                    return;
                }


                // Mark as read first

                if (
                    Number(
                        notification.is_read
                    ) === 0
                ) {

                    await markAsRead(id);

                }


                // Navigate

                handleNotificationNavigation(
                    notification
                );

            }
        );

    }


    // ==========================================
    // NOTIFICATION NAVIGATION
    // ==========================================

    function handleNotificationNavigation(
        notification
    ) {

        if (!notification) {
            return;
        }


        const title =
            String(
                notification.title || ""
            )
                .trim()
                .toLowerCase();


        const targetId =
            notification.target_id
                ? String(
                    notification.target_id
                ).trim()
                : "";


        // ==========================================
        // USER NOTIFICATIONS
        // ==========================================

        const userNotifications = [

            "user added",

            "user updated",

            "user deleted",

            "new user registered"

        ];


        if (
            userNotifications.includes(
                title
            )
        ) {

            closeDropdown();


            // ======================================
            // OPEN EXACT USER
            // ======================================

            if (targetId) {

                window.location.href =
                    `users.html?user=${encodeURIComponent(
                        targetId
                    )}`;

                return;
            }


            // ======================================
            // FALLBACK
            // ======================================

            window.location.href =
                "users.html";

            return;
        }


        // ==========================================
        // LOGIN
        // ==========================================

        if (
            title ===
            "successful login"
        ) {

            closeDropdown();

            window.location.href =
                "dashboard.html";

            return;
        }


        // ==========================================
        // REGISTRATION
        // ==========================================

        if (
            title ===
            "registration successful"
        ) {

            closeDropdown();

            window.location.href =
                "dashboard.html";

            return;
        }

    }


    // ==========================================
    // CLOSE DROPDOWN
    // ==========================================

    function closeDropdown() {

        if (!notificationDropdown) {
            return;
        }


        notificationDropdown.hidden =
            true;

    }


    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    async function markAsRead(id) {

        try {

            const response =
                await fetch(
                    `/api/notifications/${id}/read`,
                    {
                        method: "PUT",
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to mark notification as read."
                );

            }


            // Update local object immediately

            const notification =
                notifications.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


            if (notification) {

                notification.is_read = 1;

            }


            renderNotifications();


            // Refresh badge

            const unreadCount =
                notifications.filter(
                    function (item) {

                        return (
                            Number(
                                item.is_read
                            ) === 0
                        );

                    }
                ).length;


            updateBadge(
                unreadCount
            );


        } catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );

        }

    }


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    async function markAllAsRead(
        event
    ) {

        if (event) {
            event.stopPropagation();
        }


        try {

            const response =
                await fetch(
                    "/api/notifications/read-all",
                    {
                        method: "PUT",
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to mark all as read."
                );

            }


            notifications.forEach(
                function (notification) {

                    notification.is_read = 1;

                }
            );


            renderNotifications();

            updateBadge(0);


            if (
                typeof window.showSuccess ===
                "function"
            ) {

                window.showSuccess(
                    "All notifications marked as read."
                );

            }


        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error
            );


            if (
                typeof window.showError ===
                "function"
            ) {

                window.showError(
                    "Failed to mark notifications as read."
                );

            }

        }

    }


    // ==========================================
    // DELETE NOTIFICATION
    // ==========================================

    async function deleteNotification(
        id
    ) {

        try {

            const response =
                await fetch(
                    `/api/notifications/${id}`,
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete notification."
                );

            }


            notifications =
                notifications.filter(
                    function (notification) {

                        return (
                            String(
                                notification.id
                            ) !==
                            String(id)
                        );

                    }
                );


            renderNotifications();


            const unreadCount =
                notifications.filter(
                    function (notification) {

                        return (
                            Number(
                                notification.is_read
                            ) === 0
                        );

                    }
                ).length;


            updateBadge(
                unreadCount
            );


        } catch (error) {

            console.error(
                "Delete notification error:",
                error
            );


            if (
                typeof window.showError ===
                "function"
            ) {

                window.showError(
                    "Failed to delete notification."
                );

            }

        }

    }


    // ==========================================
    // DROPDOWN
    // ==========================================

    function toggleDropdown(
        event
    ) {

        event.stopPropagation();


        if (!notificationDropdown) {
            return;
        }


        notificationDropdown.hidden =
            !notificationDropdown.hidden;

    }


    function handleOutsideClick(
        event
    ) {

        if (!notificationDropdown) {
            return;
        }


        const wrapper =
            document.querySelector(
                ".notification-wrapper"
            );


        if (
            wrapper &&
            !wrapper.contains(
                event.target
            )
        ) {

            notificationDropdown.hidden =
                true;

        }

    }


    // ==========================================
    // AUTO REFRESH
    // ==========================================

    function startAutoRefresh() {

        setInterval(
            loadNotifications,
            15000
        );

    }


    // ==========================================
    // ICON
    // ==========================================

    function getNotificationIcon(
        type
    ) {

        switch (type) {

            case "success":
                return "✓";

            case "warning":
                return "⚠";

            case "error":
                return "!";

            case "info":
            default:
                return "i";

        }

    }


    // ==========================================
    // DATE
    // ==========================================

    function formatNotificationDate(
        date
    ) {

        if (!date) {
            return "";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return parsedDate.toLocaleString(
            undefined,
            {
                dateStyle: "short",
                timeStyle: "short"
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


})();