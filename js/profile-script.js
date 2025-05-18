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
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Forgot password modal
    deletePhotoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmationModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Show/hide event fields based on post type
    const postTypeSelect = document.getElementById('postType');
    const eventFields = document.getElementById('eventFields');
    
    postTypeSelect.addEventListener('change', () => {
        if (postTypeSelect.value === 'event') {
            eventFields.style.display = 'block';
        } else {
            eventFields.style.display = 'none';
        }
    });

    // Handle post submission
    // const postForm = document.getElementById('postForm');
    
    // In your postForm submit handler:
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('postTitle').value;
        const type = document.getElementById('postType').value;
        const description = document.getElementById('postDescription').value;
        const date = document.getElementById('postDate').value;
        const imageFile = document.getElementById('postImage').files[0];
        let location = '';
        
        if (type === 'event') {
            location = document.getElementById('eventLocation').value;
        }

        // Convert image to base64 if exists
        let imageBase64 = 'https://via.placeholder.com/600x400'; // Default placeholder
        if (imageFile) {
            imageBase64 = await convertToBase64(imageFile);
        }
        
        // Create new post object
        const newPost = {
            id: Date.now().toString(),
            title,
            type,
            description,
            date,
            location,
            createdAt: new Date().toISOString(),
            image: imageBase64 // Now storing base64 string
        };
        
        // Save to localStorage
        const POSTS_KEY = 'compass_aeped_posts';
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        posts.push(newPost);
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        
        // Show success message
        showNotification('Post published successfully!');
        
        // Reset form
        postForm.reset();
        eventFields.style.display = 'none';
        
        // Update posts list
        updatePostsList();
    });

    // Helper function to convert file to base64
    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Function to update posts list
    function updatePostsList() {
        const POSTS_KEY = 'compass_aeped_posts';
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        const postsList = document.querySelector('.posts-list');
        
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p>No posts found.</p>';
            return;
        }
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            postCard.innerHTML = `
                <img src="${post.image}" alt="${post.title}" class="post-image">
                <div class="post-info">
                    <h3>${post.title}</h3>
                    <p>${post.type === 'news' ? 'News' : 'Event'} • ${new Date(post.date).toLocaleDateString()}</p>
                    <div class="post-actions">
                        <button class="btn btn--secondary" onclick="editPost('${post.id}')">
                            <i class="material-icons">edit</i> Edit
                        </button>
                        <button class="btn btn--danger" onclick="deletePost('${post.id}')">
                            <i class="material-icons">delete</i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            postsList.appendChild(postCard);
        });
    }

    // Load posts when manage tab is shown
    document.querySelector('[data-tab="manage"]').addEventListener('click', updatePostsList);

    // Helper function to show notifications
    function showNotification(message, isError = false) {
        const notification = document.getElementById('successNotification');
        const icon = document.getElementById('notification-icon');
        const msgElement = document.getElementById('notification-message');
        
        msgElement.textContent = message;
        notification.className = isError ? 'notification error show' : 'notification show';
        
        if (isError) {
            icon.textContent = 'error';
        } else {
            icon.textContent = 'check_circle';
        }
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }

    // Make functions available globally
    window.editPost = function(postId) {
        // Implement edit functionality
        showNotification('Edit functionality coming soon!');
    };

    window.deletePost = function(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            const POSTS_KEY = 'compass_aeped_posts';
            const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
            const updatedPosts = posts.filter(post => post.id !== postId);
            
            localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
            updatePostsList();
            showNotification('Post deleted successfully!');
        }
    };

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
            console.log('User found:', currentUser);
            currentUser = getUserFromStorage(sessionData.userId);
            
            if (currentUser) {
                console.log('User found:', currentUser);
                if (currentUser.accountType === 'admin') {
                    console.log('Please:', currentUser);
                    document.querySelector('.admin-tab').style.display = 'block';
                }
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