document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile script initialized'); // Debugging

    // DOM Elements
    const elements = {
        profileImageUpload: document.getElementById('profileImageUpload'),
        profilePicture: document.getElementById('profilePicture'),
        profileInitial: document.getElementById('profileInitial'),
        nameField: document.getElementById('nameField'),
        emailField: document.getElementById('emailField'),
        nameValue: document.querySelector('#nameField .field-value'),
        nameInput: document.querySelector('#nameField .field-input'),
        editBtn: document.querySelector('#nameField .edit-btn'),
        saveBtn: document.getElementById('saveChanges')
    };

    // Current user data
    let currentUser = null;

    // Initialize
    initProfile();

    function initProfile() {
        console.log('Initializing profile...');
        loadUserData();
        setupEventListeners();
    }

    function loadUserData() {
        console.log('Loading user data...');
        const sessionData = getSessionData();
        
        if (sessionData) {
            currentUser = getUserFromStorage(sessionData.userId);
            
            if (currentUser) {
                console.log('User found:', currentUser);
                updateProfileDisplay();
                updateUserInfoDisplay();
            } else {
                console.warn('No user found for session');
            }
        } else {
            console.warn('No active session found');
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

        console.log('Updating user info display...');
        
        if (elements.nameValue && elements.nameInput) {
            elements.nameValue.textContent = currentUser.name || 'Guest';
            elements.nameInput.value = currentUser.name || 'Guest';
        }
        
        if (elements.emailValue) {
            elements.emailValue.textContent = currentUser.email || 'guest@gmail.com';
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
        console.log('Handling image upload...');
        const file = e.target.files[0];
        
        if (!file) {
            console.log('No file selected');
            return;
        }

        // Validate file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(event) {
            console.log('File read successfully');
            
            // Update current user
            if (currentUser) {
                currentUser.profileImage = event.target.result;
                updateUserInStorage();
                updateProfileDisplay();
            }
            
            // Reset input to allow same file to be selected again
            elements.profileImageUpload.value = '';
        };
        
        reader.onerror = function() {
            console.error('Error reading file');
            alert('Error reading the image file. Please try another image.');
        };
        
        reader.readAsDataURL(file);
    }

    function toggleNameEdit() {
        console.log('Toggling name edit mode');
        elements.nameValue.style.display = 'none';
        elements.nameInput.style.display = 'block';
        elements.nameInput.focus();
    }

    function saveNameChange() {
        console.log('Saving name change');
        const newName = elements.nameInput.value.trim();
        
        if (newName && newName !== elements.nameValue.textContent) {
            elements.nameValue.textContent = newName;
            
            if (currentUser) {
                currentUser.name = newName;
                updateUserInStorage();
                updateProfileDisplay(); // Update initial if needed
            }
        }
        
        elements.nameValue.style.display = 'block';
        elements.nameInput.style.display = 'none';
    }

    function handleSaveChanges() {
        console.log('Saving all changes...');
        alert('Changes saved successfully!');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    function updateUserInStorage() {
        if (!currentUser) return;

        console.log('Updating user in storage...');
        
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
            console.error('Error updating user storage:', e);
        }
    }

    function updateSessionData() {
        const SESSION_KEY = 'compass_aeped_session';
        const session = getSessionData();
        
        if (session) {
            session.name = currentUser.name;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
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