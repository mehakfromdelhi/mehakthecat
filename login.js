/*
 * ===========================================
 * Login Page JavaScript
 * ===========================================
 * Handles login form submission, password visibility toggle,
 * and authentication logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');

    // Toggle password visibility
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.style.display = isPassword ? 'none' : 'block';
            eyeOffIcon.style.display = isPassword ? 'block' : 'none';
        });
    }

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Hide any previous errors
            if (loginError) {
                loginError.style.display = 'none';
            }

            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Simple authentication (for demo purposes)
            // In production, this would make an API call to your backend
            if (authenticateUser(email, password)) {
                // Store authentication state
                const authData = {
                    email: email,
                    loggedIn: true,
                    timestamp: Date.now()
                };

                if (rememberMe) {
                    // Store in localStorage (persists across sessions)
                    localStorage.setItem('auth', JSON.stringify(authData));
                } else {
                    // Store in sessionStorage (cleared when browser closes)
                    sessionStorage.setItem('auth', JSON.stringify(authData));
                }

                // Redirect to dashboard
                window.location.href = 'Vugru HTML.html';
            } else {
                showError('Invalid email or password. Please try again.');
            }
        });
    }

    // Authentication function (demo - replace with actual API call)
    function authenticateUser(email, password) {
        // Demo credentials (in production, this would be an API call)
        const demoCredentials = {
            'demo@vugru.com': 'demo123',
            'admin@vugru.com': 'admin123',
            'user@example.com': 'password123',
            'test@test.com': 'test123'
        };

        // Check against demo credentials
        if (demoCredentials[email.toLowerCase()] === password) {
            return true;
        }

        // For demo purposes: accept any email/password combination
        // In production, remove this and only use the credentials above
        if (email.length > 0 && password.length >= 3) {
            return true;
        }

        return false;
    }

    // Show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        if (loginError) {
            loginError.style.display = 'flex';
        }
        
        // Add shake animation
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }

    // Check if user is already logged in
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (auth) {
        try {
            const authData = JSON.parse(auth);
            // Check if session is still valid (24 hours)
            const oneDay = 24 * 60 * 60 * 1000;
            if (authData.loggedIn && (Date.now() - authData.timestamp) < oneDay) {
                // Already logged in, redirect to dashboard
                window.location.href = 'Vugru HTML.html';
            } else {
                // Session expired, clear auth
                localStorage.removeItem('auth');
                sessionStorage.removeItem('auth');
            }
        } catch (e) {
            // Invalid auth data, clear it
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
        }
    }
});

