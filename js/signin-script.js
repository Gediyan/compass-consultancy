document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeModal = document.querySelector('.close-modal');
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    const signupPassword = document.getElementById('signupPassword');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const successNotification = document.getElementById('successNotification');
    const notificationMessage = document.querySelector('.notification-message');
    const rememberMe = document.getElementById('rememberMe');

    // Users database in localStorage
    const USERS_KEY = 'compass_aeped_users';
    const SESSION_KEY = 'compass_aeped_session';

    // Add this near the top with other constants
    const ACCOUNT_TYPE_KEY = 'accountType';
    let accountType = 'customer'; // Default account type

    // Account type tabs functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update account type
            accountType = this.dataset.accountType;
        });
    });

    // Initialize users if not exists
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }

    // Check for existing session
    checkExistingSession();

    // Switch between login and signup forms
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
        resetForms();
    });

    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        resetForms();
    });

    // Forgot password modal
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
        resetForms();
    });

    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
            resetForms();
        }
    });

    // Toggle password visibility
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            togglePasswordVisibility(input, this);
        });
    });

    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility_off';
        }
    }

    // Password strength indicator
    signupPassword.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updateStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Character diversity
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 3); // Cap at 3 for our 3-bar display
    }

    function updateStrengthIndicator(strength) {
        strengthBars.forEach((bar, index) => {
            if (index < strength) {
                bar.style.backgroundColor = getStrengthColor(strength);
            } else {
                bar.style.backgroundColor = '#e0e0e0';
            }
        });
        
        const strengthMessages = ['Weak', 'Medium', 'Strong'];
        strengthText.textContent = strength > 0 ? strengthMessages[strength - 1] : 'Password strength';
        strengthText.style.color = strength > 0 ? getStrengthColor(strength) : 'var(--light-text)';
    }

    function getStrengthColor(strength) {
        switch(strength) {
            case 1: return '#f94144'; // Weak - red
            case 2: return '#f8961e'; // Medium - orange
            case 3: return '#43aa8b'; // Strong - green
            default: return '#e0e0e0';
        }
    }

    // Show notification
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        successNotification.className = isError ? 'notification error show' : 'notification show';
        
        setTimeout(() => {
            successNotification.classList.remove('show');
        }, 3000);
    }

    // Reset all forms
    function resetForms() {
        loginForm.reset();
        signupForm.reset();
        forgotPasswordForm.reset();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Reset password strength
        updateStrengthIndicator(0);
    }

    // Check if email already exists
    function emailExists(email) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        return users.some(user => user.email === email);
    }

    // Create new user
    function createUser(name, email, password) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In a real app, this should be hashed
            createdAt: new Date().toISOString(),
            accountType: accountType // Store the selected account type
        };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Also store the account type separately if needed
        localStorage.setItem(ACCOUNT_TYPE_KEY, accountType);
        return newUser;
    }

    // Authenticate user
    function authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        return users.find(user => user.email === email && user.password === password);
    }

    // Create session
    function createSession(user, remember) {
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            expires: remember ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
                new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    // Check existing session
    function checkExistingSession() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (session) {
            const now = new Date();
            const expires = new Date(session.expires);
            
            if (now < expires) {
                // Session is valid, redirect to dashboard
                window.location.href = '../index.html';
            } else {
                // Session expired, clear it
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }

    // Form validation and submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = rememberMe.checked;
        
        // Reset errors
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        
        let isValid = true;
        
        // Email validation
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        }
        
        if (isValid) {
            const user = authenticateUser(email, password);
            
            if (user) {
                createSession(user, remember);
                showNotification('Login successful! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                showNotification('Invalid email or password', true);
                document.getElementById('passwordError').textContent = 'Invalid email or password';
            }
        }
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Reset errors
        document.getElementById('nameError').textContent = '';
        document.getElementById('signupEmailError').textContent = '';
        document.getElementById('signupPasswordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';
        
        let isValid = true;
        
        // Name validation
        if (!name) {
            document.getElementById('nameError').textContent = 'Name is required';
            isValid = false;
        } else if (name.length < 2) {
            document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
            isValid = false;
        }
        
        // Email validation
        if (!email) {
            document.getElementById('signupEmailError').textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('signupEmailError').textContent = 'Please enter a valid email';
            isValid = false;
        } else if (emailExists(email)) {
            document.getElementById('signupEmailError').textContent = 'Email already registered';
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            document.getElementById('signupPasswordError').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 8) {
            document.getElementById('signupPasswordError').textContent = 'Password must be at least 8 characters';
            isValid = false;
        }
        
        // Confirm password validation
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        // Terms validation
        if (!agreeTerms) {
            showNotification('You must agree to the terms and conditions', true);
            isValid = false;
        }
        
        if (isValid) {
            const user = createUser(name, email, password);
            showNotification('Account created successfully!');
            
            // For demo purposes, switch to login and pre-fill email
            setTimeout(() => {
                signupCard.style.display = 'none';
                loginCard.style.display = 'block';
                document.getElementById('email').value = email;
                document.getElementById('password').focus();
            }, 1500);
        }
    });

    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        
        // Reset error
        document.getElementById('resetEmailError').textContent = '';
        
        if (!email) {
            document.getElementById('resetEmailError').textContent = 'Email is required';
        } else if (!isValidEmail(email)) {
            document.getElementById('resetEmailError').textContent = 'Please enter a valid email';
        } else if (!emailExists(email)) {
            document.getElementById('resetEmailError').textContent = 'Email not found';
        } else {
            // In a real app, you would send a password reset email
            showNotification('Password reset link sent to your email!');
            setTimeout(() => {
                forgotPasswordModal.style.display = 'none';
            }, 1500);
        }
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 
                            this.classList.contains('facebook') ? 'Facebook' : 'Apple';
            showNotification(`This would normally redirect to ${provider} login`);
        });
    });

    // Helper function to validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Demo: Focus on email field if login card is shown
    if (loginCard.style.display !== 'none') {
        const emailField = document.getElementById('email');
        if (emailField && !emailField.value) {
            emailField.focus();
        }
    }
});