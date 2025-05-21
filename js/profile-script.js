document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const elements = {
        profileImageUpload: document.getElementById('profileImageUpload'),
        profilePicture: document.getElementById('profilePicture'),
        profileInitial: document.getElementById('profileInitial'),
        profileDefault: document.getElementById('profileDefault'),
        
        // User info elements
        nameValue: document.querySelector('#nameField .field-value'),
        nameInput: document.querySelector('#nameField .field-input'),
        editBtn: document.querySelector('#nameField .btn--secondary'),
        emailValue: document.querySelector('#emailField .field-value'),
        accountCreatedValue: document.querySelector('#accountCreatedDate .field-value'),
        saveBtn: document.getElementById('saveChanges'),

        imageEditorModal: document.getElementById('imageEditorModal'),
        imageToCrop: document.getElementById('imageToCrop'),
        rotateLeftBtn: document.getElementById('rotateLeftBtn'),
        rotateRightBtn: document.getElementById('rotateRightBtn'),
        zoomInBtn: document.getElementById('zoomInBtn'),
        zoomOutBtn: document.getElementById('zoomOutBtn'),
        cancelCropBtn: document.getElementById('cancelCropBtn'),
        saveCropBtn: document.getElementById('saveCropBtn'),
        closeModalBtn: document.querySelector('.image-close-modal')
        
    };
        
    // Confirmation modal
    const confirmationModal = document.getElementById('confirmationModal');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const closeModal = document.querySelector('.close-modal');

    // Add these at the top with your other DOM elements
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Show/hide event fields based on post type
    const postTypeSelect = document.getElementById('postType');
    const eventFields = document.getElementById('eventFields');


    // State variables
    let currentUser = null; // Current user data
    let cropper = null;

    // Initialize the application
    init();

    function init() {
        loadUserData();
        setupEventListeners();
        setupTabs();
    }

    function loadUserData() {
        const sessionData = getSessionData();
        if (!sessionData) return;

        currentUser = getUserFromStorage(sessionData.userId);
        if (!currentUser) return;

        if (currentUser.accountType === 'admin') {
            console.log('Please:', currentUser);
            document.querySelector('.admin-tab').style.display = 'block';
        }
        updateProfileDisplay();
        updateUserInfoDisplay();
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

    function updateUserInStorage() {
        if (!currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('compass_aeped_users')) || [];
        const index = users.findIndex(user => user.id === currentUser.id);
        
        if (index !== -1) {
            users[index] = currentUser;
        } else {
            users.push(currentUser);
        }
        
        localStorage.setItem('compass_aeped_users', JSON.stringify(users));
        updateSessionData();
    }

    function updateSessionData() {
        const session = getSessionData();
        if (session && currentUser) {
            session.name = currentUser.name;
            session.profilePicture = currentUser.profileImage;
            localStorage.setItem('compass_aeped_session', JSON.stringify(session));
        }
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
            elements.profileDefault.style.backgroundImage = `url('${currentUser.profileImage}')`;
            elements.profileDefault.style.backgroundSize = "cover";
            elements.profileInitial.style.display = 'none';
            document.getElementById('deletePhotoBtn').style.display = 'block';
        } else {
            const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G';
            elements.profileInitial.textContent = initial;
            elements.profilePicture.style.display = 'none';
            document.getElementById('deletePhotoBtn').style.display = 'none';
        }
    }

    function updateUserInfoDisplay() {
        if (!currentUser) return;
        
        elements.nameValue.textContent = currentUser.name || 'Guest';
        elements.nameInput.value = currentUser.name || 'Guest';
        elements.emailValue.textContent = currentUser.email || 'guest@gmail.com';
        
        if (currentUser.createdAt) {
            const date = new Date(currentUser.createdAt);
            elements.accountCreatedValue.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
        }
    }

    // Event Handlers
    function setupEventListeners() {
        // Profile image handling
        elements.profileImageUpload?.addEventListener('change', handleImageUpload);
        
        // Name editing
        elements.editBtn?.addEventListener('click', toggleNameEdit);
        elements.nameInput?.addEventListener('blur', saveNameChange);
        elements.nameInput?.addEventListener('keypress', e => e.key === 'Enter' && saveNameChange());
        elements.saveBtn?.addEventListener('click', handleSaveChanges);
        
        // Image editor
        elements.rotateLeftBtn?.addEventListener('click', () => cropper?.rotate(-90));
        elements.rotateRightBtn?.addEventListener('click', () => cropper?.rotate(90));
        elements.zoomInBtn?.addEventListener('click', () => cropper?.zoom(0.1));
        elements.zoomOutBtn?.addEventListener('click', () => cropper?.zoom(-0.1));
        elements.cancelCropBtn?.addEventListener('click', closeImageEditor);
        elements.closeModalBtn?.addEventListener('click', closeImageEditor);
        elements.saveCropBtn?.addEventListener('click', saveCroppedImage);
        
        // Post management
        elements.postTypeSelect?.addEventListener('change', toggleEventFields);
        elements.postForm?.addEventListener('submit', handlePostSubmit);
    }

    function setupTabs() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
                
                if (btn.getAttribute('data-tab') === 'manage') {
                    updatePostsList();
                }
            });
        });
    }

    // Profile Photo Functions
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file (JPEG, PNG, GIF)', true);
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image size should be less than 2MB', true);
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = event => {
            elements.imageToCrop.src = event.target.result;
            elements.imageEditorModal.style.display = 'block';
            
            elements.imageToCrop.onload = () => {
                if (cropper) cropper.destroy();
                
                cropper = new Cropper(elements.imageToCrop, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true
                });
            };
        };
        
        reader.onerror = () => showNotification('Error reading image file', true);
        reader.readAsDataURL(file);
    }

    function saveCroppedImage() {
        if (!cropper || !currentUser) {
            closeImageEditor();
            return;
        }
        
        const canvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400,
            fillColor: '#fff'
        });
        
        if (!canvas) {
            showNotification('Error cropping image', true);
            return;
        }
        
        canvas.toBlob(blob => {
            if (!blob) {
                showNotification('Error processing image', true);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = event => {
                currentUser.profileImage = event.target.result;
                updateProfileDisplay();
                updateUserInStorage();
                showNotification('Profile picture updated successfully!');
                closeImageEditor();
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.92);
    }

    function closeImageEditor() {
        elements.imageEditorModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        // Reset file input to allow selecting the same file again
        elements.profileImageUpload.value = '';
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
        // In your postForm submit handler:
        if (imageFile) {
            // Check image size (e.g., max 2MB)
            if (imageFile.size > 2 * 1024 * 1024) {
                showNotification('Image size should be less than 2MB', true);
                return;
            }
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

    // Forgot password modal
    deletePhotoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmationModal.style.display = 'flex';
        
    });

    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    modalConfirmBtn.addEventListener('click', function() {
        if (currentUser) {
            currentUser.profileImage = null;
            updateUserInStorage();
            updateProfileDisplay();
            elements.profileDefault.style.backgroundImage = 'none'
            elements.profileInitial.style.display = 'block';
            confirmationModal.style.display = 'none';
        }
    });

    modalCancelBtn.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
});