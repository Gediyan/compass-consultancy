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
    const loginCard = document.querySelector('.auth-card:not(.signup-card)');
    const signupCard = document.querySelector('.signup-card');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    const signupPassword = document.getElementById('signupPassword');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Switch between login and signup forms
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
    });

    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    // Forgot password modal
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });

    // Toggle password visibility
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'visibility';
            } else {
                input.type = 'password';
                this.textContent = 'visibility_off';
            }
        });
    });

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

    // Form validation and submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
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
            // In a real app, you would send this to your authentication server
            console.log('Login submitted:', { email, password });
            alert('Login successful! (This is a demo)');
            // Redirect to dashboard or home page
            // window.location.href = '/dashboard.html';
        }
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
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
        }
        
        // Email validation
        if (!email) {
            document.getElementById('signupEmailError').textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('signupEmailError').textContent = 'Please enter a valid email';
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
            alert('You must agree to the terms and conditions');
            isValid = false;
        }
        
        if (isValid) {
            // In a real app, you would send this to your registration endpoint
            console.log('Signup submitted:', { name, email, password });
            alert('Account created successfully! (This is a demo)');
            
            // For demo purposes, store the user and switch to login
            localStorage.setItem('demoUser', JSON.stringify({ name, email }));
            signupCard.style.display = 'none';
            loginCard.style.display = 'block';
            document.getElementById('email').value = email;
        }
    });

    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        // Reset error
        document.getElementById('resetEmailError').textContent = '';
        
        if (!email) {
            document.getElementById('resetEmailError').textContent = 'Email is required';
        } else if (!isValidEmail(email)) {
            document.getElementById('resetEmailError').textContent = 'Please enter a valid email';
        } else {
            // In a real app, you would send a password reset email
            console.log('Password reset requested for:', email);
            alert('Password reset link sent to your email! (This is a demo)');
            forgotPasswordModal.style.display = 'none';
        }
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 
                            this.classList.contains('facebook') ? 'Facebook' : 'Apple';
            console.log(`${provider} login clicked`);
            alert(`This would normally redirect to ${provider} login (This is a demo)`);
        });
    });

    // Helper function to validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Demo: Check if there's a demo user to pre-fill login
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
        const user = JSON.parse(demoUser);
        document.getElementById('email').value = user.email;
    }
});