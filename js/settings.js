// ==========================================
// SETTINGS PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    try {

        const user = await requireLogin();

        if (!user) {
            return;
        }

        loadUserInfo(user);
        loadSettings();
        setupSettings();

    } catch (error) {

        console.error(
            "Settings initialization error:",
            error
        );

    }

});


// ==========================================
// USER INFO
// ==========================================

function loadUserInfo(user) {

    const topUserName =
        document.getElementById("topUserName");

    const topUserRole =
        document.getElementById("topUserRole");


    if (topUserName) {

        topUserName.textContent =
            user.name || "User";

    }


    if (topUserRole) {

        topUserRole.textContent =
            String(
                user.role || "user"
            ).toUpperCase();

    }

}


// ==========================================
// LOAD SETTINGS
// ==========================================

function loadSettings() {

    // --------------------------------------
    // Notifications
    // --------------------------------------

    const notifications =
        localStorage.getItem(
            "admin_system_notifications"
        );


    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );


    if (notificationsToggle) {

        notificationsToggle.checked =
            notifications !== "false";

    }


    // --------------------------------------
    // Dark Mode
    // --------------------------------------

    const savedTheme =
        localStorage.getItem("admin_theme");


    const themeToggle =
        document.getElementById("themeToggle");


    if (themeToggle) {

        themeToggle.checked =
            savedTheme === "dark";

    }

}


// ==========================================
// SETUP
// ==========================================

function setupSettings() {


    // ======================================
    // LOGOUT
    // ======================================

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                await logout();

            }
        );

    }


    // ======================================
    // DARK MODE
    // ======================================

    const themeToggle =
        document.getElementById("themeToggle");


    if (themeToggle) {

        themeToggle.addEventListener(
            "change",
            function () {

                if (themeToggle.checked) {

                    document.body.classList.add(
                        "dark-theme"
                    );

                    localStorage.setItem(
                        "admin_theme",
                        "dark"
                    );

                } else {

                    document.body.classList.remove(
                        "dark-theme"
                    );

                    localStorage.setItem(
                        "admin_theme",
                        "light"
                    );

                }

            }
        );

    }


    // ======================================
    // SAVE SETTINGS
    // ======================================

    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );


    const saveButton =
        document.getElementById(
            "saveSettingsBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const enabled =
                    notificationsToggle
                        ? notificationsToggle.checked
                        : true;


                localStorage.setItem(
                    "admin_system_notifications",
                    enabled
                        ? "true"
                        : "false"
                );


                const message =
                    document.getElementById(
                        "settingsMessage"
                    );


                if (message) {

                    message.textContent =
                        "Settings saved successfully.";

                    message.classList.add("show");


                    setTimeout(
                        function () {

                            message.classList.remove(
                                "show"
                            );

                        },
                        3000
                    );

                }

            }
        );

    }

}