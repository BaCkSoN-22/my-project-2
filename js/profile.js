// ======================================================
// PROFILE PAGE
// ======================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeProfilePage();

    }
);



// ======================================================
// INITIALIZE PROFILE PAGE
// ======================================================


async function initializeProfilePage() {

    console.log(
        "Profile page starting..."
    );


    try {

        const user =
            await requireLogin();


        if (!user) {

            return;

        }


        console.log(
            "Logged in user:",
            user
        );


        setupProfilePage();


        await loadProfile();


    } catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );

    }

}



// ======================================================
// SETUP PROFILE PAGE
// ======================================================


function setupProfilePage() {


    // ==================================================
    // LOGOUT
    // ==================================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                await logout();

            }
        );

    }



    // ==================================================
    // PROFILE FORM
    // ==================================================

    const profileForm =
        document.getElementById(
            "profileForm"
        );


    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await saveProfile();

            }
        );

    }

}



// ======================================================
// LOAD PROFILE
// ======================================================


async function loadProfile() {

    try {

        const data =
            await apiRequest(
                "/profile"
            );


        if (!data.user) {

            throw new Error(
                "User information not found."
            );

        }


        const user =
            data.user;



        // ==================================================
        // NAME INPUT
        // ==================================================

        const profileName =
            document.getElementById(
                "profileName"
            );


        if (profileName) {

            profileName.value =
                user.name || "";

        }



        // ==================================================
        // DISPLAY NAME
        // ==================================================

        const displayName =
            document.getElementById(
                "profileDisplayName"
            );


        if (displayName) {

            displayName.textContent =
                user.name || "User";

        }



        // ==================================================
        // DISPLAY EMAIL
        // ==================================================

        const displayEmail =
            document.getElementById(
                "profileDisplayEmail"
            );


        if (displayEmail) {

            displayEmail.textContent =
                user.email || "";

        }



        // ==================================================
        // DISPLAY ROLE
        // ==================================================

        const displayRole =
            document.getElementById(
                "profileDisplayRole"
            );


        if (displayRole) {

            displayRole.textContent =
                String(
                    user.role || "user"
                ).toUpperCase();

        }



        // ==================================================
        // TOP USER NAME
        // ==================================================

        const topUserName =
            document.getElementById(
                "topUserName"
            );


        if (topUserName) {

            topUserName.textContent =
                user.name || "User";

        }



        // ==================================================
        // TOP USER ROLE
        // ==================================================

        const topUserRole =
            document.getElementById(
                "topUserRole"
            );


        if (topUserRole) {

            topUserRole.textContent =
                String(
                    user.role || "user"
                ).toUpperCase();

        }



        // ==================================================
        // AVATAR
        // ==================================================

        const avatarLetter =
            document.getElementById(
                "avatarLetter"
            );


        if (avatarLetter) {

            avatarLetter.textContent =
                getInitials(
                    user.name
                );

        }



        // Save current user

        currentUser =
            user;


    } catch (error) {

        console.error(
            "Load profile error:",
            error
        );


        showProfileError(
            error.message ||
            "Failed to load profile."
        );

    }

}



// ======================================================
// SAVE PROFILE
// ======================================================


async function saveProfile() {


    // ==================================================
    // INPUTS
    // ==================================================

    const nameInput =
        document.getElementById(
            "profileName"
        );


    const currentPasswordInput =
        document.getElementById(
            "profileCurrentPassword"
        );


    const passwordInput =
        document.getElementById(
            "profilePassword"
        );


    const confirmPasswordInput =
        document.getElementById(
            "profileConfirmPassword"
        );


    const errorElement =
        document.getElementById(
            "profileError"
        );


    const successElement =
        document.getElementById(
            "profileSuccess"
        );



    // ==================================================
    // VALUES
    // ==================================================

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const currentPassword =
        currentPasswordInput
            ? currentPasswordInput.value
            : "";


    const newPassword =
        passwordInput
            ? passwordInput.value
            : "";


    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";



    // ==================================================
    // CLEAR MESSAGES
    // ==================================================

    if (errorElement) {

        errorElement.textContent = "";

    }


    if (successElement) {

        successElement.textContent = "";

    }



    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (!name) {

        showProfileError(
            "Full name is required."
        );

        return;

    }



    if (name.length < 2) {

        showProfileError(
            "Name must contain at least 2 characters."
        );

        return;

    }



    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    const changingPassword =
        newPassword.length > 0 ||
        currentPassword.length > 0 ||
        confirmPassword.length > 0;



    if (changingPassword) {


        // Current password

        if (!currentPassword) {

            showProfileError(
                "Current password is required."
            );

            return;

        }



        // New password

        if (!newPassword) {

            showProfileError(
                "New password is required."
            );

            return;

        }



        // Minimum length

        if (newPassword.length < 6) {

            showProfileError(
                "New password must contain at least 6 characters."
            );

            return;

        }



        // Confirm password

        if (
            newPassword !==
            confirmPassword
        ) {

            showProfileError(
                "New passwords do not match."
            );

            return;

        }

    }



    // ==================================================
    // BUTTON
    // ==================================================

    const button =
        document.querySelector(
            '#profileForm button[type="submit"]'
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Saving...";

    }



    try {


        // ==================================================
        // UPDATE NAME
        // ==================================================

        await apiRequest(
            "/profile",
            {
                method: "PUT",

                body: JSON.stringify({

                    name: name,

                    email:
                        currentUser.email

                })

            }
        );



        // ==================================================
        // CHANGE PASSWORD
        // ==================================================

        if (changingPassword) {

            await apiRequest(
                "/profile/password",
                {
                    method: "PUT",

                    body: JSON.stringify({

                        currentPassword:
                            currentPassword,

                        newPassword:
                            newPassword

                    })

                }
            );

        }



        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        if (changingPassword) {

            showProfileSuccess(
                "Name and password updated successfully."
            );

        } else {

            showProfileSuccess(
                "Name updated successfully."
            );

        }



        // ==================================================
        // CLEAR PASSWORD INPUTS
        // ==================================================

        if (currentPasswordInput) {

            currentPasswordInput.value =
                "";

        }


        if (passwordInput) {

            passwordInput.value =
                "";

        }


        if (confirmPasswordInput) {

            confirmPasswordInput.value =
                "";

        }



        // ==================================================
        // RELOAD PROFILE
        // ==================================================

        await loadProfile();


    } catch (error) {

        console.error(
            "Save profile error:",
            error
        );


        showProfileError(
            error.message ||
            "Failed to update profile."
        );


    } finally {


        if (button) {

            button.disabled = false;

            button.textContent =
                "Save Changes";

        }

    }

}



// ======================================================
// PROFILE ERROR
// ======================================================


function showProfileError(message) {

    const element =
        document.getElementById(
            "profileError"
        );


    if (element) {

        element.textContent =
            message;

    }

}



// ======================================================
// PROFILE SUCCESS
// ======================================================


function showProfileSuccess(message) {

    const element =
        document.getElementById(
            "profileSuccess"
        );


    if (element) {

        element.textContent =
            message;

    }

}



// ======================================================
// GET INITIALS
// ======================================================


function getInitials(name) {

    if (!name) {

        return "U";

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