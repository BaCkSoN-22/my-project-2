// ==========================================
// LOGIN PAGE
// ==========================================


const loginForm =
    document.getElementById("loginForm");


const loginEmail =
    document.getElementById("email");


const loginPassword =
    document.getElementById("password");


const loginError =
    document.getElementById("loginError");


// ==========================================
// LOGIN FORM
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // Clear old error
            if (loginError) {
                loginError.textContent = "";
            }


            // ==================================
            // GET VALUES
            // ==================================

            const email =
                loginEmail
                    ? loginEmail.value.trim()
                    : "";


            const password =
                loginPassword
                    ? loginPassword.value
                    : "";


            // ==================================
            // VALIDATION
            // ==================================

            if (!email) {

                if (loginError) {
                    loginError.textContent =
                        "Please enter your email.";
                }

                return;
            }


            if (!password) {

                if (loginError) {
                    loginError.textContent =
                        "Please enter your password.";
                }

                return;
            }


            // ==================================
            // BUTTON
            // ==================================

            const submitButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Logging in...";

            }


            try {

                // ==================================
                // LOGIN REQUEST
                // ==================================

                const result =
                    await login(
                        email,
                        password
                    );


                // ==================================
                // SUCCESS
                // ==================================

                if (result.success) {

                    window.location.href =
                        "dashboard.html";

                    return;
                }


                // ==================================
                // LOGIN ERROR
                // ==================================

                if (loginError) {

                    loginError.textContent =
                        result.message ||
                        "Invalid email or password.";

                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                if (loginError) {

                    loginError.textContent =
                        "Unable to connect to the server.";

                }

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Login";

                }

            }

        }
    );

}