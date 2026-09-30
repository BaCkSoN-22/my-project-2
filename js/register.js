// ==========================================
// REGISTER
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const signupForm =
        document.getElementById("signupForm");

    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("signupEmail");

    const passwordInput =
        document.getElementById("signupPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const signupError =
        document.getElementById("signupError");


    // ==========================================
    // CHECK FORM
    // ==========================================

    if (!signupForm) {

        console.error(
            "signupForm not found."
        );

        return;
    }


    // ==========================================
    // SUBMIT
    // ==========================================

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (signupError) {
                signupError.textContent = "";
            }


            // ==================================
            // GET VALUES
            // ==================================

            const name =
                fullNameInput
                    ? fullNameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";


            // ==================================
            // VALIDATION
            // ==================================

            if (!name) {

                showRegisterError(
                    "Please enter your full name."
                );

                return;
            }


            if (name.length < 2) {

                showRegisterError(
                    "Full name must contain at least 2 characters."
                );

                return;
            }


            if (!email) {

                showRegisterError(
                    "Please enter your email."
                );

                return;
            }


            // Basic email validation
            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showRegisterError(
                    "Please enter a valid email address."
                );

                return;
            }


            if (!password) {

                showRegisterError(
                    "Please enter a password."
                );

                return;
            }


            if (password.length < 6) {

                showRegisterError(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (!confirmPassword) {

                showRegisterError(
                    "Please confirm your password."
                );

                return;
            }


            if (password !== confirmPassword) {

                showRegisterError(
                    "Passwords do not match."
                );

                return;
            }


            // ==================================
            // BUTTON
            // ==================================

            const submitButton =
                signupForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Creating Account...";

            }


            // ==================================
            // REGISTER API
            // ==================================

            try {

                const result =
                    await register(
                        name,
                        email,
                        password
                    );


                console.log(
                    "Register result:",
                    result
                );


                // ==================================
                // SUCCESS
                // ==================================

                if (result.success) {

                    alert(
                        "Account created successfully!"
                    );


                    window.location.href =
                        "index.html";

                    return;
                }


                // ==================================
                // SERVER ERROR
                // ==================================

                showRegisterError(
                    result.message ||
                    "Registration failed."
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showRegisterError(
                    error.message ||
                    "Unable to connect to the server."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Create Account";

                }

            }

        }
    );

});


// ==========================================
// SHOW ERROR
// ==========================================

function showRegisterError(message) {

    const errorElement =
        document.getElementById(
            "signupError"
        );


    if (errorElement) {

        errorElement.textContent =
            message;

    }

}