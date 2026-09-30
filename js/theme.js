// ==========================================
// THEME SYSTEM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTheme();

        setupThemeButton();

    }
);


// ==========================================
// LOAD THEME
// ==========================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("admin_theme");


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    } else {

        document.body.classList.remove(
            "dark-theme"
        );

    }

}


// ==========================================
// THEME BUTTON
// ==========================================

function setupThemeButton() {

    const toggle =
        document.getElementById("themeToggle");


    if (!toggle) {

        return;

    }


    // Settings page checkbox
    if (toggle.type === "checkbox") {

        toggle.checked =
            localStorage.getItem(
                "admin_theme"
            ) === "dark";

        return;

    }


    // Dashboard theme button
    toggle.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.contains(
                    "dark-theme"
                );


            if (isDark) {

                document.body.classList.remove(
                    "dark-theme"
                );

                localStorage.setItem(
                    "admin_theme",
                    "light"
                );

            } else {

                document.body.classList.add(
                    "dark-theme"
                );

                localStorage.setItem(
                    "admin_theme",
                    "dark"
                );

            }

        }
    );

}