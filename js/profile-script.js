document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileImageUpload = document.getElementById('profileImageUpload');
    const profilePicture = document.getElementById('profilePicture');
    const profileInitial = document.getElementById('profileInitial');
    const nameField = document.getElementById('nameField');
    const nameValue = nameField.querySelector('.field-value');
    const nameInput = nameField.querySelector('.field-input');
    const editBtn = nameField.querySelector('.edit-btn');
    const saveBtn = document.getElementById('saveChanges');
    
    // Current user data
    let currentUser = null;
    
    // Check authentication and load user data
    function loadUserData() {
        const SESSION_KEY = 'compass_aeped_session';
        const sessionData = localStorage.getItem(SESSION_KEY);
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            const USERS_KEY = 'compass_aeped_users';
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            currentUser = users.find(user => user.id === session.userId);
            
            if (currentUser) {
                // Update profile picture
                if (currentUser.profileImage) {
                    profilePicture.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" class="profile-image">`;
                } else {
                    const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
                    profileInitial.textContent = initial;
                }
                
                // Update name and email
                if (currentUser.name) {
                    nameValue.textContent = currentUser.name;
                    nameInput.value = currentUser.name;
                }
                
                // Update email if you have an email field
                // document.getElementById('emailField').textContent = currentUser.email || '';
            }
        }
    }
    
    // Handle profile image upload
    profileImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePicture.innerHTML = `<img src="${event.target.result}" alt="Profile" class="profile-image">`;
                
                // In a real app, you would upload this to your server
                // For demo, we'll store it in localStorage
                if (currentUser) {
                    currentUser.profileImage = event.target.result;
                    updateUserInStorage();
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Toggle edit mode for name
    editBtn.addEventListener('click', function() {
        nameValue.style.display = 'none';
        nameInput.style.display = 'block';
        nameInput.focus();
    });
    
    // Handle name input blur
    nameInput.addEventListener('blur', function() {
        saveNameChange();
    });
    
    // Handle enter key in name input
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveNameChange();
        }
    });
    
    function saveNameChange() {
        const newName = nameInput.value.trim();
        if (newName && newName !== nameValue.textContent) {
            nameValue.textContent = newName;
            
            // Update in storage
            if (currentUser) {
                currentUser.name = newName;
                updateUserInStorage();
            }
        }
        nameValue.style.display = 'block';
        nameInput.style.display = 'none';
    }
    
    // Save all changes
    saveBtn.addEventListener('click', function() {
        // In a real app, you would send updates to the server
        alert('Changes saved successfully!');
    });
    
    // Update user in localStorage
    function updateUserInStorage() {
        if (currentUser) {
            const USERS_KEY = 'compass_aeped_users';
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            const index = users.findIndex(user => user.id === currentUser.id);
            
            if (index !== -1) {
                users[index] = currentUser;
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                
                // Update session with new name if needed
                const SESSION_KEY = 'compass_aeped_session';
                const session = JSON.parse(localStorage.getItem(SESSION_KEY));
                if (session) {
                    session.name = currentUser.name;
                    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                }
            }
        }
    }
    
    // Initialize
    loadUserData();
});