// ==========================================
// SIDEBAR
// ==========================================

const SIDEBAR_KEY =
    "admin_system_sidebar";


const sidebar =
    document.getElementById("sidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");


function applySidebarState() {

    const collapsed =
        localStorage.getItem(
            SIDEBAR_KEY
        ) === "collapsed";


    if (!sidebar) {
        return;
    }


    if (collapsed) {

        sidebar.classList.add(
            "sidebar-collapsed"
        );

    } else {

        sidebar.classList.remove(
            "sidebar-collapsed"
        );

    }

}


applySidebarState();


if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        function () {

            if (!sidebar) {
                return;
            }


            sidebar.classList.toggle(
                "sidebar-collapsed"
            );


            const collapsed =
                sidebar.classList.contains(
                    "sidebar-collapsed"
                );


            localStorage.setItem(
                SIDEBAR_KEY,
                collapsed ?
                "collapsed" :
                "expanded"
            );

        }
    );

}