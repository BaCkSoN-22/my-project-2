
// ======================================
// GLOBAL NOTIFICATIONS
// ======================================

(function () {

    function escapeText(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function getContainer() {

        let container =
            document.querySelector(".toast-container");

        if (!container) {

            container =
                document.createElement("div");

            container.className =
                "toast-container";

            document.body.appendChild(container);
        }

        return container;
    }

    function showToast(
        message,
        type = "success",
        duration = 3000
    ) {

        const container = getContainer();

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-message">
                ${escapeText(message)}
            </div>

            <button
                class="toast-close"
                type="button"
                aria-label="Close notification"
            >
                &times;
            </button>
        `;

        container.appendChild(toast);

        const closeButton =
            toast.querySelector(".toast-close");

        let removed = false;

        function removeToast() {

            if (removed) {
                return;
            }

            removed = true;

            toast.style.animation =
                "toastSlideOut 0.3s ease forwards";

            setTimeout(() => {

                toast.remove();

                if (
                    container.children.length === 0
                ) {
                    container.remove();
                }

            }, 300);
        }

        closeButton.addEventListener(
            "click",
            removeToast
        );

        setTimeout(
            removeToast,
            duration
        );
    }

    // Global function
    window.showToast = showToast;

    // Convenient shortcuts
    window.showSuccess = function (message) {
        showToast(message, "success");
    };

    window.showError = function (message) {
        showToast(message, "error", 4000);
    };

    window.showWarning = function (message) {
        showToast(message, "warning", 3500);
    };

})();