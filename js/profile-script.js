document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const elements = {
        profileImageUpload: document.getElementById('profileImageUpload'),
        profilePicture: document.getElementById('profilePicture'),
        profileInitial: document.getElementById('profileInitial'),

        nameField: document.getElementById('nameField'),
        emailField: document.getElementById('emailField'),
        accountCreated: document.getElementById('accountCreatedDate'),

        nameValue: document.querySelector('#nameField .field-value'),
        emailValue: document.querySelector('#emailField .field-value'),
        accountCreatedValue: document.querySelector('#accountCreatedDate .field-value'),

        nameInput: document.querySelector('#nameField .field-input'),
        editBtn: document.querySelector('#nameField .btn--secondary'),
        saveBtn: document.getElementById('saveChanges'),
        
    };

    // Add these at the top with your other DOM elements
    const notificationMessage = document.getElementById('notification-message');
    const successNotification = document.getElementById('successNotification');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const closeModal = document.querySelector('.close-modal');

    // Forgot password modal
    deletePhotoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmationModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    // Current user data
    let currentUser = null;

    // Initialize
    initProfile();

    function initProfile() {
        loadUserData();
        setupEventListeners();
    }

    function loadUserData() {
        const sessionData = getSessionData();
        
        if (sessionData) {
            currentUser = getUserFromStorage(sessionData.userId);
            
            if (currentUser) {
                console.log('User found:', currentUser);
                updateProfileDisplay();
                updateUserInfoDisplay();
            } 
        } 
    }

    function getSessionData() {
        const SESSION_KEY = 'compass_aeped_session';
        const sessionData = localStorage.getItem(SESSION_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    function getUserFromStorage(userId) {
        const USERS_KEY = 'compass_aeped_users';
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        return users.find(user => user.id === userId);
    }

    

    // Update profile display to handle delete button visibility
    function updateProfileDisplay() {
        if (!currentUser) return;

        // Clear previous image if exists
        const existingImg = elements.profilePicture.querySelector('img');
        if (existingImg) {
            elements.profilePicture.removeChild(existingImg);
        }

        if (currentUser.profileImage) {
            const img = document.createElement('img');
            img.src = currentUser.profileImage;
            img.alt = 'Profile';
            img.className = 'profile-image';
            elements.profilePicture.insertBefore(img, elements.profileInitial);
            elements.profileInitial.style.display = 'none';
            document.getElementById('deletePhotoBtn').style.display = 'block';
        } else {
            const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G';
            elements.profileInitial.textContent = initial;
            elements.profileInitial.style.display = 'flex';
            document.getElementById('deletePhotoBtn').style.display = 'none';
        }
    }

    function updateUserInfoDisplay() {
        if (!currentUser) return;
        
        if (elements.nameValue && elements.nameInput) {
            elements.nameValue.textContent = currentUser.name || 'Guest';
            elements.nameInput.value = currentUser.name || 'Guest';
        }
        
        if (elements.emailValue) {
            elements.emailValue.textContent = currentUser.email || 'guest@gmail.com';
        }
        
        if (elements.accountCreatedValue) {
            const dateValue = currentUser.createdAt;
            const date = new Date(dateValue);
            const options = {year: 'numeric', month: 'long', day: 'numeric',
                // hour: '2-digit',
                // minute: '2-digit',
                // second: '2-digit',
                // timeZoneName: 'short'
                };
            elements.accountCreatedValue.textContent = date.toLocaleString('en-US', options) || '';
        }
    }

    function setupEventListeners() {
        // Profile image upload
        if (elements.profileImageUpload) {
            elements.profileImageUpload.addEventListener('change', handleImageUpload);
        }

        // Name editing
        if (elements.editBtn) {
            elements.editBtn.addEventListener('click', toggleNameEdit);
        }

        if (elements.nameInput) {
            elements.nameInput.addEventListener('blur', saveNameChange);
            elements.nameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') saveNameChange();
            });
        }

        // Save changes
        if (elements.saveBtn) {
            elements.saveBtn.addEventListener('click', handleSaveChanges);
        }
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        
        if (!file) {
            showNotification('Please select an image file (JPEG, PNG, GIF)', true);
            return;
        }

        // Validate file type
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file (JPEG, PNG, GIF)', true);
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image size should be less than 25MB', true);
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(event) {
            
            // Update current user
            if (currentUser) {
                currentUser.profileImage = event.target.result;
                updateProfileDisplay();
                showNotification('Profile picture updated successfully!');
            }
            
            // Reset input to allow same file to be selected again
            elements.profileImageUpload.value = '';
        };
        
        reader.onerror = function() {
            showNotification('Error reading image file', true);
        };
        
        reader.readAsDataURL(file);
    }

    function toggleNameEdit() {
        elements.nameValue.style.display = 'none';
        elements.nameInput.style.display = 'block';
        elements.nameInput.focus();
    }

    function saveNameChange() {
        const newName = elements.nameInput.value.trim();
        
        if (newName && newName !== elements.nameValue.textContent) {
            elements.nameValue.textContent = newName;
            
            if (currentUser) {
                currentUser.name = newName;
                updateProfileDisplay(); // Update initial if needed
            }
        }
        
        elements.nameValue.style.display = 'block';
        elements.nameInput.style.display = 'none';
    }

    function handleSaveChanges() {
        updateUserInStorage();
        showNotification('Changes saved successfully!');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    function updateUserInStorage() {
        if (!currentUser) return;
        
        try {
            const USERS_KEY = 'compass_aeped_users';
            let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            
            const index = users.findIndex(user => user.id === currentUser.id);
            if (index !== -1) {
                users[index] = currentUser;
            } else {
                users.push(currentUser);
            }
            
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            
            // Update session data if needed
            updateSessionData();
        } catch (e) {
            showNotification('Error updating user storage', true);
        }
    }

    function updateSessionData() {
        const SESSION_KEY = 'compass_aeped_session';
        const session = getSessionData();
        
        if (session) {
            session.name = currentUser.name;
            session.profilePicture = currentUser.profilePicture;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
    }

    // Show notification
    function showNotification(message, isError = false) {
        // Reset any existing notifications
        successNotification.classList.remove('show', 'error');
        
        // Force reflow to ensure animation restarts
        void successNotification.offsetWidth;
        
        // Set message and style
        notificationMessage.textContent = message;
        successNotification.classList.add('show');
        if (isError) {
            successNotification.classList.add('error');
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successNotification.classList.remove('show');
        }, 3000);
    }
});

// Delete profile picture functionality
document.getElementById('deletePhotoBtn').addEventListener('click', function() {
    showModal(
        'Delete Profile Picture',
        'Are you sure you want to remove your profile picture?',
        function() {
            if (currentUser) {
                currentUser.profileImage = null;
                updateUserInStorage();
                updateProfileDisplay();
                this.style.display = 'none';
            }
        }
    );
});

// Modal function for confirmations
function showModal(title, message, confirmCallback) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    
    modal.style.display = 'block';
    
    document.getElementById('modalConfirmBtn').onclick = function() {
        confirmCallback();
        modal.style.display = 'none';
    };
    
    document.getElementById('modalCancelBtn').onclick = function() {
        modal.style.display = 'none';
    };
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}