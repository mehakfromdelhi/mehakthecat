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
    const userTypeRadios = document.querySelectorAll('input[name="user-type"]');

    // Handle user type selection styling (for browsers without :has() support)
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.user-type-option').forEach(option => {
                option.classList.remove('selected');
            });
            if (radio.checked) {
                radio.closest('.user-type-option').classList.add('selected');
            }
        });
    });

    // Set initial selected state
    const checkedRadio = document.querySelector('input[name="user-type"]:checked');
    if (checkedRadio) {
        checkedRadio.closest('.user-type-option').classList.add('selected');
    }

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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = document.getElementById('remember-me').checked;
            const userType = document.querySelector('input[name="user-type"]:checked')?.value || 'agent';
            const submitButton = loginForm.querySelector('button[type="submit"]');

            // Hide any previous errors
            if (loginError) {
                loginError.style.display = 'none';
            }

            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Password length validation
            if (password.length < 3) {
                showError('Password must be at least 3 characters long');
                return;
            }

            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<span>Signing in...</span>';
                
                // Simulate API call delay (remove in production)
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Simple authentication (for demo purposes)
            // In production, this would make an API call to your backend
            if (authenticateUser(email, password)) {
                // Store authentication state
                const authData = {
                    email: email,
                    userType: userType, // 'client' or 'agent'
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

                // Redirect based on user type
                if (userType === 'client') {
                    // Redirect to client dashboard (to be created)
                    window.location.href = 'client-dashboard.html';
                } else {
                    // Redirect to agent dashboard (project management)
                    window.location.href = 'project-management.html';
                }
            } else {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<span>Sign In</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="button-arrow"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>';
                }
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

        // Check against demo credentials first
        const normalizedEmail = email.toLowerCase().trim();
        if (demoCredentials[normalizedEmail] === password) {
            return true;
        }

        // For demo purposes: accept any email/password combination with minimum length
        // In production, remove this and only use the credentials above or make API call
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
    function checkExistingAuth() {
        const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
        if (auth) {
            try {
                const authData = JSON.parse(auth);
                // Check if session is still valid (24 hours)
                const oneDay = 24 * 60 * 60 * 1000;
                if (authData.loggedIn && (Date.now() - authData.timestamp) < oneDay) {
                    // Already logged in, redirect based on user type
                    const userType = authData.userType || 'agent';
                    if (userType === 'client') {
                        window.location.href = 'client-dashboard.html';
                    } else {
                        window.location.href = 'project-management.html';
                    }
                    return true;
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
        return false;
    }

    // Check on page load
    checkExistingAuth();

    /*
     * -------------------------------------------
     * Forgot Password Link
     * -------------------------------------------
     */
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim() || prompt('Enter your email address:');
            if (email) {
                alert(`Password reset link has been sent to ${email}.\n\nIn production, this would send a password reset email.`);
                console.log('Password reset requested for:', email);
            }
        });
    }

    /*
     * -------------------------------------------
     * Sign Up Link
     * -------------------------------------------
     */
    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Sign up functionality would be implemented here.\n\nIn production, this would navigate to a registration page or open a signup modal.');
            console.log('Sign up link clicked');
            // In production: window.location.href = 'signup.html';
        });
    }
});

