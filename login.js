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
                // Check if this is a client login (both from radio button and email check)
                const isClientFromEmail = isClientEmail(email);
                const selectedUserType = document.querySelector('input[name="user-type"]:checked')?.value || 'agent';
                
                // Determine user type: prefer radio selection, but verify with email if radio says client
                let finalUserType = selectedUserType === 'client' || isClientFromEmail ? 'client' : 'agent';
                
                // Store authentication state
                const authData = {
                    email: email,
                    userType: finalUserType,
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
                // Clients see their own client site with their projects
                if (finalUserType === 'client') {
                    console.log('Client login detected, preparing redirect to client site...');
                    
                    // Store client info in sessionStorage for quick access
                    try {
                        const clientsData = localStorage.getItem('vugru_clients');
                        if (clientsData) {
                            const clients = JSON.parse(clientsData);
                            const client = clients.find(c => 
                                c.email && c.email.toLowerCase().trim() === email.toLowerCase().trim()
                            );
                            if (client) {
                                sessionStorage.setItem('currentClient', JSON.stringify(client));
                                console.log('Client info stored in sessionStorage:', client.name);
                            } else {
                                console.warn('Client email found but client data not in localStorage');
                            }
                        } else {
                            console.warn('No clients data in localStorage yet');
                        }
                    } catch (e) {
                        console.error('Error storing client info:', e);
                    }
                    
                    // Redirect to clients.html - it will show client-specific view
                    console.log('Redirecting to clients.html...');
                    window.location.href = 'clients.html';
                } else {
                    // Regular users/agents go to project management or video dashboard
                    console.log('Regular user/agent login, redirecting to project management...');
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

    // Check if email belongs to a client
    function isClientEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        
        // First, try to get client emails from localStorage (dynamic check)
        try {
            const clientsData = localStorage.getItem('vugru_clients');
            if (clientsData) {
                const clients = JSON.parse(clientsData);
                if (Array.isArray(clients) && clients.length > 0) {
                    const clientExists = clients.some(client => 
                        client && client.email && client.email.toLowerCase().trim() === normalizedEmail
                    );
                    if (clientExists) {
                        return true;
                    }
                }
            }
        } catch (e) {
            console.error('Error checking clients from localStorage:', e);
        }
        
        // Fallback to hardcoded client emails (for initial setup or if localStorage is empty)
        const defaultClientEmails = [
            'john.smith@example.com',
            'sarah.johnson@example.com',
            'mike.davis@example.com',
            'emily.chen@example.com'
        ];
        
        const isDefaultClient = defaultClientEmails.includes(normalizedEmail);
        
        // If it's a default client email but not in localStorage, initialize default data
        if (isDefaultClient) {
            try {
                const existingData = localStorage.getItem('vugru_clients');
                if (!existingData) {
                    // Initialize default client data for this client email
                    const defaultClients = [
                        { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "+1 (555) 123-4567", company: "Smith Realty Group", projectIds: [1], createdAt: new Date().toISOString() },
                        { id: 2, name: "Sarah Johnson", email: "sarah.johnson@example.com", phone: "+1 (555) 234-5678", company: "Johnson Properties", projectIds: [2], createdAt: new Date().toISOString() },
                        { id: 3, name: "Mike Davis", email: "mike.davis@example.com", phone: "+1 (555) 345-6789", company: "Davis Homes", projectIds: [3], createdAt: new Date().toISOString() },
                        { id: 4, name: "Emily Chen", email: "emily.chen@example.com", phone: "+1 (555) 456-7890", company: "Chen Luxury Estates", projectIds: [4], createdAt: new Date().toISOString() }
                    ];
                    localStorage.setItem('vugru_clients', JSON.stringify(defaultClients));
                }
            } catch (e) {
                console.error('Error initializing default client data:', e);
            }
        }
        
        return isDefaultClient;
    }

    // Authentication function (demo - replace with actual API call)
    function authenticateUser(email, password) {
        // Demo credentials (in production, this would be an API call)
        const demoCredentials = {
            'demo@vugru.com': 'demo123',
            'admin@vugru.com': 'admin123',
            'user@example.com': 'password123',
            'test@test.com': 'test123',
            // Client credentials (password same as email username for demo)
            'john.smith@example.com': 'john123',
            'sarah.johnson@example.com': 'sarah123',
            'mike.davis@example.com': 'mike123',
            'emily.chen@example.com': 'emily123'
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
                        window.location.href = 'clients.html';
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

