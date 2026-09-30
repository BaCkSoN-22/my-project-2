// USERS PAGE
// ======================================================

let users = [];
let currentPage = 1;

const rowsPerPage = 10;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Users page loaded");

    initializeUsersPage();

});


// ======================================================
// INITIALIZE
// ======================================================

async function initializeUsersPage() {

    try {

        const currentUser = await requireAdmin();

        if (!currentUser) {
            return;
        }

        console.log(
            "Admin authenticated:",
            currentUser
        );

        updateAdminInfo(currentUser);

        setupButtons();

        await loadUsers();

    } catch (error) {

        console.error(
            "Users initialization error:",
            error
        );

        if (typeof showError === "function") {
            showError(
                error.message ||
                "Failed to initialize Users page."
            );
        }

    }

}


// ======================================================
// ADMIN INFO
// ======================================================

function updateAdminInfo(user) {

    const adminName =
        document.getElementById("adminName");

    const adminRole =
        document.getElementById("adminRole");

    if (adminName) {

        adminName.textContent =
            user.name || "Admin";

    }

    if (adminRole) {

        adminRole.textContent =
            String(
                user.role || "admin"
            ).toUpperCase();

    }

}


// ======================================================
// BUTTON SETUP
// ======================================================

function setupButtons() {

    console.log("Setting up buttons...");


    // ==================================================
    // ADD USER
    // ==================================================

    const addUserBtn =
        document.getElementById("addUserBtn");

    if (addUserBtn) {

        addUserBtn.onclick = function (event) {

            event.preventDefault();

            console.log("ADD USER CLICKED");

            openAddUserModal();

        };

    } else {

        console.error(
            "addUserBtn not found!"
        );

    }


    // ==================================================
    // LOGOUT
    // ==================================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.onclick = async function (event) {

            event.preventDefault();

            await logout();

        };

    }


    // ==================================================
    // SEARCH
    // ==================================================

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.oninput = function () {

            currentPage = 1;

            renderUsers();

        };

    }


    // ==================================================
    // ROLE FILTER
    // ==================================================

    const roleFilter =
        document.getElementById("roleFilter");

    if (roleFilter) {

        roleFilter.onchange = function () {

            currentPage = 1;

            renderUsers();

        };

    }


    // ==================================================
    // SORT
    // ==================================================

    const sortSelect =
        document.getElementById("sortSelect");

    if (sortSelect) {

        sortSelect.onchange = function () {

            currentPage = 1;

            renderUsers();

        };

    }


    // ==================================================
    // USER FORM
    // ==================================================

    const userForm =
        document.getElementById("userForm");

    if (userForm) {

        userForm.onsubmit = async function (event) {

            event.preventDefault();

            await saveUser();

        };

    }


    // ==================================================
    // CLOSE USER MODAL
    // ==================================================

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    if (closeModalBtn) {

        closeModalBtn.onclick = function () {

            closeUserModal();

        };

    }


    // ==================================================
    // CANCEL USER
    // ==================================================

    const cancelUserBtn =
        document.getElementById("cancelUserBtn");

    if (cancelUserBtn) {

        cancelUserBtn.onclick = function () {

            closeUserModal();

        };

    }


    // ==================================================
    // PREVIOUS PAGE
    // ==================================================

    const prevPageBtn =
        document.getElementById("prevPageBtn");

    if (prevPageBtn) {

        prevPageBtn.onclick = function () {

            if (currentPage > 1) {

                currentPage--;

                renderUsers();

            }

        };

    }


    // ==================================================
    // NEXT PAGE
    // ==================================================

    const nextPageBtn =
        document.getElementById("nextPageBtn");

    if (nextPageBtn) {

        nextPageBtn.onclick = function () {

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        getFilteredUsers().length /
                        rowsPerPage
                    )
                );

            if (currentPage < totalPages) {

                currentPage++;

                renderUsers();

            }

        };

    }


    // ==================================================
    // DETAILS EDIT
    // ==================================================

    const detailsEditBtn =
        document.getElementById(
            "detailsEditBtn"
        );

    if (detailsEditBtn) {

        detailsEditBtn.onclick = function () {

            const id =
                this.dataset.userId;

            if (!id) {
                return;
            }

            closeDetailsModal();

            openEditUserModal(id);

        };

    }


    // ==================================================
    // DETAILS DELETE
    // ==================================================

    const detailsDeleteBtn =
        document.getElementById(
            "detailsDeleteBtn"
        );

    if (detailsDeleteBtn) {

        detailsDeleteBtn.onclick =
            async function () {

                const id =
                    this.dataset.userId;

                if (!id) {
                    return;
                }

                await deleteUser(id);

            };

    }


    // ==================================================
    // CLOSE DETAILS
    // ==================================================

    const closeDetailsBtn =
        document.getElementById(
            "closeDetailsBtn"
        );

    if (closeDetailsBtn) {

        closeDetailsBtn.onclick =
            function () {

                closeDetailsModal();

            };

    }

}


// ======================================================
// LOAD USERS
// ======================================================

async function loadUsers() {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Loading...
                </td>
            </tr>
        `;

    }


    try {

        console.log("Loading users...");

        const data =
            await apiRequest("/users");


        console.log(
            "Users API response:",
            data
        );


        if (
            !data ||
            !Array.isArray(data.users)
        ) {

            throw new Error(
                "Invalid users response."
            );

        }


        users =
            data.users;


        updateTotalUsers();

        currentPage = 1;

        renderUsers();

        // Open user from notification link
        await openUserFromUrl();

        openAddUserFromUrl();


    } catch (error) {

        console.error(
            "Load users error:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        style="
                            text-align:center;
                            color:#ef4444;
                        ">
                        ${escapeHtml(
                            error.message ||
                            "Failed to load users."
                        )}
                    </td>
                </tr>
            `;

        }


        if (typeof showError === "function") {

            showError(
                error.message ||
                "Failed to load users."
            );

        }

    }

}


// ======================================================
// TOTAL USERS
// ======================================================

function updateTotalUsers() {

    const totalUsersCount =
        document.getElementById(
            "totalUsersCount"
        );


    if (totalUsersCount) {

        totalUsersCount.textContent =
            users.length;

    }

}


// ======================================================
// FILTER USERS
// ======================================================

function getFilteredUsers() {

    let result =
        [...users];


    // ==================================================
    // SEARCH
    // ==================================================

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (search) {

        result =
            result.filter(
                function (user) {

                    const name =
                        String(
                            user.name || ""
                        ).toLowerCase();


                    const email =
                        String(
                            user.email || ""
                        ).toLowerCase();


                    const id =
                        String(
                            user.id || ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        email.includes(search) ||
                        id.includes(search)
                    );

                }
            );

    }


    // ==================================================
    // ROLE FILTER
    // ==================================================

    const roleFilter =
        document.getElementById(
            "roleFilter"
        );


    const selectedRole =
        roleFilter
            ? roleFilter.value
            : "all";


    if (
        selectedRole &&
        selectedRole !== "all"
    ) {

        result =
            result.filter(
                function (user) {

                    return (
                        String(
                            user.role || "user"
                        ).toLowerCase() ===
                        selectedRole
                    );

                }
            );

    }


    // ==================================================
    // SORT
    // ==================================================

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const sort =
        sortSelect
            ? sortSelect.value
            : "newest";


    result.sort(
        function (a, b) {

            const nameA =
                String(
                    a.name || ""
                );


            const nameB =
                String(
                    b.name || ""
                );


            const emailA =
                String(
                    a.email || ""
                );


            const emailB =
                String(
                    b.email || ""
                );


            const dateA =
                new Date(
                    a.created_at || 0
                ).getTime();


            const dateB =
                new Date(
                    b.created_at || 0
                ).getTime();


            switch (sort) {

                case "name-asc":

                    return nameA.localeCompare(
                        nameB
                    );


                case "name-desc":

                    return nameB.localeCompare(
                        nameA
                    );


                case "email-asc":

                    return emailA.localeCompare(
                        emailB
                    );


                case "email-desc":

                    return emailB.localeCompare(
                        emailA
                    );


                case "oldest":

                    return dateA - dateB;


                case "newest":

                default:

                    return dateB - dateA;

            }

        }
    );


    return result;

}


// ======================================================
// RENDER USERS
// ======================================================

function renderUsers() {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );


    if (!tableBody) {
        return;
    }


    const filteredUsers =
        getFilteredUsers();


    const totalUsers =
        filteredUsers.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalUsers /
                rowsPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        rowsPerPage;


    const end =
        Math.min(
            start + rowsPerPage,
            totalUsers
        );


    const pageUsers =
        filteredUsers.slice(
            start,
            end
        );


    // ==================================================
    // EMPTY
    // ==================================================

    if (pageUsers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;">
                    No users found.
                </td>
            </tr>
        `;

    } else {

        tableBody.innerHTML =
            pageUsers
                .map(
                    createUserRow
                )
                .join("");

    }


    updatePagination(
        totalUsers,
        start,
        end,
        totalPages
    );


    connectUserRowButtons();

}


// ======================================================
// CREATE USER ROW
// ======================================================

function createUserRow(user) {

    const id =
        escapeHtml(
            String(
                user.id ?? ""
            )
        );


    const name =
        escapeHtml(
            user.name ||
            "Unknown"
        );


    const email =
        escapeHtml(
            user.email ||
            "-"
        );


    const role =
        String(
            user.role ||
            "user"
        ).toLowerCase();


    const safeRole =
        role === "admin"
            ? "admin"
            : "user";


    const created =
        formatDate(
            user.created_at
        );


    return `
        <tr>

            <td>
                <div class="user-name">
                    ${name}
                </div>
            </td>

            <td>
                ${email}
            </td>

            <td>
                <span class="role-badge ${safeRole}">
                    ${safeRole.toUpperCase()}
                </span>
            </td>

            <td>
                ${created}
            </td>

            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="btn-small btn-view"
                        data-action="view"
                        data-id="${id}">
                        View
                    </button>

                    <button
                        type="button"
                        class="btn-small btn-edit"
                        data-action="edit"
                        data-id="${id}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn-small btn-delete"
                        data-action="delete"
                        data-id="${id}">
                        Delete
                    </button>

                </div>

            </td>

        </tr>
    `;

}


// ======================================================
// TABLE BUTTONS
// ======================================================

function connectUserRowButtons() {

    const buttons =
        document.querySelectorAll(
            "#usersTableBody [data-action]"
        );


    buttons.forEach(
        function (button) {

            button.onclick =
                async function () {

                    const action =
                        this.dataset.action;


                    const id =
                        this.dataset.id;


                    if (!id) {
                        return;
                    }


                    if (action === "view") {

                        await openUserDetails(
                            id
                        );

                    }


                    if (action === "edit") {

                        await openEditUserModal(
                            id
                        );

                    }


                    if (action === "delete") {

                        await deleteUser(
                            id
                        );

                    }

                };

        }
    );

}


// ======================================================
// PAGINATION
// ======================================================

function updatePagination(
    total,
    start,
    end,
    totalPages
) {

    const showingFrom =
        document.getElementById(
            "showingFrom"
        );


    const showingTo =
        document.getElementById(
            "showingTo"
        );


    const showingTotal =
        document.getElementById(
            "showingTotal"
        );


    const pageInfo =
        document.getElementById(
            "pageInfo"
        );


    const prevPageBtn =
        document.getElementById(
            "prevPageBtn"
        );


    const nextPageBtn =
        document.getElementById(
            "nextPageBtn"
        );


    if (showingFrom) {

        showingFrom.textContent =
            total === 0
                ? "0"
                : String(
                    start + 1
                );

    }


    if (showingTo) {

        showingTo.textContent =
            String(end);

    }


    if (showingTotal) {

        showingTotal.textContent =
            String(total);

    }


    if (pageInfo) {

        pageInfo.textContent =
            `Page ${currentPage} / ${totalPages}`;

    }


    if (prevPageBtn) {

        prevPageBtn.disabled =
            currentPage <= 1;

    }


    if (nextPageBtn) {

        nextPageBtn.disabled =
            currentPage >= totalPages;

    }

}


// ======================================================
// OPEN ADD USER MODAL
// ======================================================

function openAddUserModal() {

    console.log(
        "Opening Add User modal..."
    );


    const modal =
        document.getElementById(
            "userModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const form =
        document.getElementById(
            "userForm"
        );


    const editUserId =
        document.getElementById(
            "editUserId"
        );


    const passwordInput =
        document.getElementById(
            "userPasswordInput"
        );


    const error =
        document.getElementById(
            "userFormError"
        );


    if (!modal) {

        console.error(
            "userModal not found!"
        );

        if (typeof showError === "function") {
            showError("User modal not found.");
        }

        return;

    }


    if (title) {

        title.textContent =
            "Add User";

    }


    if (form) {

        form.reset();

    }


    if (editUserId) {

        editUserId.value =
            "";

    }


    if (passwordInput) {

        passwordInput.value =
            "";

        passwordInput.required =
            true;

    }


    if (error) {

        error.textContent =
            "";

    }


    showModal(modal);

}


// ======================================================
// OPEN EDIT USER MODAL
// ======================================================

async function openEditUserModal(id) {

    const normalizedId =
        String(id);


    let user =
        users.find(
            function (item) {

                return (
                    String(item.id) ===
                    normalizedId
                );

            }
        );


    if (!user) {

        try {

            const data =
                await apiRequest(
                    `/users/${encodeURIComponent(
                        normalizedId
                    )}`
                );


            if (
                data &&
                data.user
            ) {

                user =
                    data.user;

            }

        } catch (error) {

            console.error(
                "Failed to load user:",
                error
            );

        }

    }


    if (!user) {

        showError("User not found.");

        return;

    }


    const modal =
        document.getElementById(
            "userModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const editUserId =
        document.getElementById(
            "editUserId"
        );


    const nameInput =
        document.getElementById(
            "userNameInput"
        );


    const emailInput =
        document.getElementById(
            "userEmailInput"
        );


    const passwordInput =
        document.getElementById(
            "userPasswordInput"
        );


    const roleInput =
        document.getElementById(
            "userRoleInput"
        );


    const error =
        document.getElementById(
            "userFormError"
        );


    if (!modal) {
        return;
    }


    if (title) {

        title.textContent =
            "Edit User";

    }


    if (editUserId) {

        editUserId.value =
            normalizedId;

    }


    if (nameInput) {

        nameInput.value =
            user.name || "";

    }


    if (emailInput) {

        emailInput.value =
            user.email || "";

    }


    if (passwordInput) {

        passwordInput.value =
            "";

        passwordInput.required =
            false;

    }


    if (roleInput) {

        roleInput.value =
            "user";

    }


    if (error) {

        error.textContent =
            "";

    }


    showModal(modal);

}


// ======================================================
// SAVE USER
// ======================================================

async function saveUser() {

    console.log(
        "Saving user..."
    );


    const editUserId =
        document.getElementById(
            "editUserId"
        );


    const nameInput =
        document.getElementById(
            "userNameInput"
        );


    const emailInput =
        document.getElementById(
            "userEmailInput"
        );


    const passwordInput =
        document.getElementById(
            "userPasswordInput"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    const editId =
        editUserId
            ? editUserId.value.trim()
            : "";


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!name) {

        showUserFormError(
            "Name is required."
        );

        return;

    }


    if (name.length < 2) {

        showUserFormError(
            "Name must contain at least 2 characters."
        );

        return;

    }


    if (!email) {

        showUserFormError(
            "Email is required."
        );

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        showUserFormError(
            "Please enter a valid email address."
        );

        return;

    }


    // ==================================================
    // NEW USER PASSWORD
    // ==================================================

    if (!editId && !password) {

        showUserFormError(
            "Password is required."
        );

        return;

    }


    if (
        password &&
        password.length < 6
    ) {

        showUserFormError(
            "Password must contain at least 6 characters."
        );

        return;

    }


    // ==================================================
    // SAVE BUTTON
    // ==================================================

    const submitButton =
        document.querySelector(
            '#userForm button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Saving...";

    }


    try {

        let data;


        // ==================================================
        // EDIT
        // ==================================================

        if (editId) {

            const body = {

                name: name,

                email: email

            };


            if (password) {

                body.password =
                    password;

            }


            console.log(
                "Updating user:",
                editId,
                body
            );


            data =
                await apiRequest(
                    `/users/${encodeURIComponent(
                        editId
                    )}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );

        }


        // ==================================================
        // CREATE
        // ==================================================

        else {

            const body = {

                name: name,

                email: email,

                password: password

            };


            console.log(
                "Creating user:",
                body
            );


            data =
                await apiRequest(
                    "/users",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );

        }


        console.log(
            "Save response:",
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to save user."
            );

        }


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        closeUserModal();


        // ==================================================
        // RELOAD USERS
        // ==================================================

        await loadUsers();


        // ==================================================
        // SUCCESS
        // ==================================================

        if (typeof showSuccess === "function") {

            showSuccess(
                editId
                    ? "User updated successfully."
                    : "User created successfully."
            );

        }


    } catch (error) {

        console.error(
            "Save user error:",
            error
        );


        showUserFormError(
            error.message ||
            "Failed to save user."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Save User";

        }

    }

}


// ======================================================
// DELETE USER
// ======================================================

async function deleteUser(id) {

    const normalizedId =
        String(id);


    const user =
        users.find(
            function (item) {

                return (
                    String(item.id) ===
                    normalizedId
                );

            }
        );


    if (!user) {

        showError("User not found.");

        return;

    }


    // ==================================================
    // PROTECT MAIN ADMIN
    // ==================================================

    if (
        normalizedId ===
        "admin-001"
    ) {

        showWarning(
            "The Main Admin cannot be deleted."
        );

        return;

    }


    // ==================================================
    // CONFIRM
    // ==================================================

    const confirmed =
        confirm(
            `Are you sure you want to delete "${user.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        console.log(
            "Deleting user:",
            normalizedId
        );


        const data =
            await apiRequest(
                `/users/${encodeURIComponent(
                    normalizedId
                )}`,
                {
                    method: "DELETE"
                }
            );


        console.log(
            "Delete response:",
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to delete user."
            );

        }


        closeDetailsModal();


        await loadUsers();


        if (typeof showSuccess === "function") {

            showSuccess(
                "User deleted successfully."
            );

        }


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );


        showError(
            error.message ||
            "Failed to delete user."
        );

    }

}


// ======================================================
// USER DETAILS
// ======================================================

async function openUserDetails(id) {

    const normalizedId =
        String(id);


    let user =
        users.find(
            function (item) {

                return (
                    String(item.id) ===
                    normalizedId
                );

            }
        );


    // ==================================================
    // LOAD FRESH USER
    // ==================================================

    try {

        const data =
            await apiRequest(
                `/users/${encodeURIComponent(
                    normalizedId
                )}`
            );


        if (
            data &&
            data.user
        ) {

            user =
                data.user;

        }

    } catch (error) {

        console.warn(
            "Could not load fresh user:",
            error
        );

    }


    if (!user) {

        showError("User not found.");

        return;

    }


    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (!modal) {

        showError(
            "Details modal not found."
        );

        return;

    }


    const detailsAvatar =
        document.getElementById(
            "detailsAvatar"
        );


    const detailsName =
        document.getElementById(
            "detailsName"
        );


    const detailsRole =
        document.getElementById(
            "detailsRole"
        );


    const detailsEmail =
        document.getElementById(
            "detailsEmail"
        );


    const detailsId =
        document.getElementById(
            "detailsId"
        );


    const detailsCreated =
        document.getElementById(
            "detailsCreated"
        );


    const detailsEditBtn =
        document.getElementById(
            "detailsEditBtn"
        );


    const detailsDeleteBtn =
        document.getElementById(
            "detailsDeleteBtn"
        );


    if (detailsAvatar) {

        detailsAvatar.textContent =
            getInitials(
                user.name
            );

    }


    if (detailsName) {

        detailsName.textContent =
            user.name || "-";

    }


    if (detailsRole) {

        detailsRole.textContent =
            String(
                user.role || "user"
            ).toUpperCase();

    }


    if (detailsEmail) {

        detailsEmail.textContent =
            user.email || "-";

    }


    if (detailsId) {

        detailsId.textContent =
            user.id || "-";

    }


    if (detailsCreated) {

        detailsCreated.textContent =
            formatDate(
                user.created_at
            );

    }


    if (detailsEditBtn) {

        detailsEditBtn.dataset.userId =
            normalizedId;

    }


    if (detailsDeleteBtn) {

        detailsDeleteBtn.dataset.userId =
            normalizedId;


        detailsDeleteBtn.disabled =
            normalizedId === "admin-001";

    }


    showModal(modal);

}


// ======================================================
// CLOSE USER MODAL
// ======================================================

function closeUserModal() {

    const modal =
        document.getElementById(
            "userModal"
        );


    if (!modal) {
        return;
    }


    hideModal(modal);

}


// ======================================================
// CLOSE DETAILS MODAL
// ======================================================

function closeDetailsModal() {

    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (!modal) {
        return;
    }


    hideModal(modal);

}


// ======================================================
// SHOW MODAL
// ======================================================

function showModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    modal.style.display =
        "flex";


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ======================================================
// HIDE MODAL
// ======================================================

function hideModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.style.display =
        "none";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ======================================================
// FORM ERROR
// ======================================================

function showUserFormError(message) {

    const errorElement =
        document.getElementById(
            "userFormError"
        );


    if (errorElement) {

        errorElement.textContent =
            message;

    }


    if (typeof showError === "function") {

        showError(message);

    }

}


// ======================================================
// DATE
// ======================================================

function formatDate(date) {

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
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ======================================================
// INITIALS
// ======================================================

function getInitials(name) {

    if (!name) {
        return "?";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

// ======================================================
// OPEN USER FROM URL
// ======================================================

async function openUserFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const userId =
        params.get("user");

    if (!userId) {
        return;
    }

    const normalizedId =
        String(userId).trim();

    if (!normalizedId) {
        return;
    }

    console.log(
        "Opening user from notification:",
        normalizedId
    );

    // Wait a little so the page is fully rendered
    await new Promise(
        function (resolve) {
            setTimeout(resolve, 100);
        }
    );

    // Open User Details modal
    await openUserDetails(
        normalizedId
    );

    // Remove ?user=... from address bar
    // without reloading the page
    const cleanUrl =
        window.location.pathname;

    window.history.replaceState(
        {},
        document.title,
        cleanUrl
    );
}

// ======================================================
// OPEN USER FROM URL
// ======================================================

async function openUserFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const userId =
        params.get("user");

    if (!userId) {
        return;
    }

    const normalizedId =
        String(userId).trim();

    if (!normalizedId) {
        return;
    }

    console.log(
        "Opening user from notification:",
        normalizedId
    );

    // Wait until page is rendered
    await new Promise(
        function (resolve) {
            setTimeout(resolve, 100);
        }
    );

    // Open User Details modal
    await openUserDetails(
        normalizedId
    );

    // Remove ?user=... from URL
    // without reloading the page
    const cleanUrl =
        window.location.pathname;

    window.history.replaceState(
        {},
        document.title,
        cleanUrl
    );
}

// ======================================================
// OPEN ADD USER FROM DASHBOARD
// ======================================================

function openAddUserFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const action =
        params.get("action");

    if (action !== "add") {
        return;
    }


    const addUserButton =
        document.getElementById(
            "addUserBtn"
        );

    if (!addUserButton) {
        return;
    }


    addUserButton.click();


    // Clean URL
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

}