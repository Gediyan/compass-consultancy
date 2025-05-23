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
    
    // Handle post submission
    const postForm = document.getElementById('postForm');


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

    // Add these variables at the top of your script
    let selectedImages = [];

    // Image selection handler
    document.getElementById('postImages').addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (!file.type.match('image.*')) {
                showNotification(`Skipped ${file.name} - not an image file`, true);
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                showNotification(`Skipped ${file.name} - file too large (max 2MB)`, true);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImages.push({
                    id: `new-${Date.now()}`,
                    data: e.target.result,
                    file: file,
                    isExisting: false
                });
                updateImagePreviews();
            };
            reader.readAsDataURL(file);
        });
        
        // Reset file input to allow selecting same files again
        e.target.value = '';
    });

    // Handle image removal
    document.getElementById('imagePreviews').addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index);
            removeCurrentImage(index);
        }
    });
    
    // Submit handler (updated to handle both create and update)
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
    
        try {
            // Get form values
            const title = document.getElementById('postTitle').value.trim();
            const type = document.getElementById('postType').value;
            const description = document.getElementById('postDescription').value.trim();
            const date = document.getElementById('postDate').value;
            let location = '';
            
            if (type === 'event') {
                location = document.getElementById('eventLocation').value.trim();
            }

            // Filter out images marked for removal
            const finalImages = selectedImages
                .filter(img => !img.remove)
                .map(img => img.data);
            
            // Ensure we have at least one image
            const images = finalImages.length > 0 ? finalImages : ['images/image-placeholder.jpg'];
            
            // Create/update post object
            const newPost = {
                id: this.dataset.editingId || Date.now().toString(),
                title,
                type,
                description,
                date,
                location,
                images: images,
                mainImage: images[0],
                createdAt: this.dataset.editingId ? 
                    JSON.parse(localStorage.getItem('compass_aeped_posts'))
                        .find(p => p.id === this.dataset.editingId).createdAt : 
                    new Date().toISOString()
            };
            
            // Save to localStorage
            const POSTS_KEY = 'compass_aeped_posts';
            let posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
            
            if (this.dataset.editingId) {
                posts = posts.map(post => post.id === this.dataset.editingId ? newPost : post);
            } else {
                posts.push(newPost);
            }
            
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            
            // Reset form and show success
            resetForm();
            showNotification(`Post ${this.dataset.editingId ? 'updated' : 'published'} successfully!`);
            updatePostsList();
            
        } catch (error) {
            console.error('Error submitting post:', error);
            showNotification('An error occurred while saving the post', true);
        }
    });

    // Function to get selected coordinate
    const selectOnMapBtn = document.getElementById('selectOnMapBtn');
    const eventLocationInput = document.getElementById('eventLocation');
    
    // Store selected coordinates for later use if needed
    let selectedCoords = null;
    
    selectOnMapBtn.addEventListener('click', function() {
        // First try to get current location to center the map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    openMapWithCoords(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    // Default to Addis Ababa coordinates if geolocation fails
                    openMapWithCoords(9.0054, 38.7636);
                }
            );
        } else {
            // Default to Addis Ababa coordinates if geolocation not supported
            openMapWithCoords(9.0054, 38.7636);
        }
    });
    
    function openMapWithCoords(lat, lng) {
        // Open Google Maps with a marker at the specified location
        // Using the "mapaction" URL parameter to allow selecting a location
        const mapsUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=15&basemap=terrain`;
        
        // Open in a new window
        const mapWindow = window.open(mapsUrl, 'MapSelection', 'width=800,height=600');
        
        // Listen for message from the map window
        window.addEventListener('message', function receiveMessage(event) {
            // Check origin for security
            if (event.origin !== "https://www.google.com") return;
            
            if (event.data && event.data.type === 'location_selected') {
                const location = event.data.location;
                selectedCoords = { lat: location.lat, lng: location.lng };
                
                // Get address using reverse geocoding
                reverseGeocode(location.lat, location.lng)
                    .then(address => {
                        eventLocationInput.value = address;
                        showNotification('Location selected successfully!');
                    })
                    .catch(error => {
                        console.error('Geocoding error:', error);
                        eventLocationInput.value = `${location.lat}, ${location.lng}`;
                        showNotification('Location selected (could not get address)');
                    });
                
                // Clean up event listener
                window.removeEventListener('message', receiveMessage);
                mapWindow.close();
            }
        });
        
        // Add a fallback in case the message doesn't come through
        setTimeout(() => {
            const fallbackAddress = prompt('Please copy and paste the address from Google Maps:');
            if (fallbackAddress) {
                eventLocationInput.value = fallbackAddress;
                showNotification('Location added successfully!');
            }
        }, 3000);
    }
    
    async function reverseGeocode(lat, lng) {
        // Use Google Maps Geocoding API
        const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].formatted_address;
        }
        throw new Error('No address found');
    }

    function updatePostsList() {
        const POSTS_KEY = 'compass_aeped_posts';
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        const postsList = document.querySelector('.posts-list');
        
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p>No posts found.</p>';
            return;
        }
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            // Use mainImage if available, otherwise fall back to image
            const displayImage = post.mainImage || post.image || 'images/image-placeholder.jpg';
            
            // Add badge if multiple images exist
            const imageBadge = post.images && post.images.length > 1 ? 
                `<span class="image-count-badge">${post.images.length} images</span>` : '';
            
            postCard.innerHTML = `
                <div class="post-image-container">
                    <img src="${displayImage}" alt="${post.title}" class="post-image">
                    ${imageBadge}
                </div>
                <div class="post-info">
                    <h3>${post.title}</h3>
                    <div class="post-meta">
                        <span class="post-type ${post.type}">${post.type === 'news' ? 'News' : 'Event'}</span>
                        <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <p class="post-description">${post.description}</p>
                    ${post.location ? `<p class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.location}</p>` : ''}
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

    // Global variable to track current edit state
    let currentlyEditing = null;

    // Edit post function
    window.editPost = function(postId) {
        if (currentlyEditing === postId) {
            showNotification('You are already editing this post');
            return;
        }

        resetForm(); // Clear previous edit state

        const POSTS_KEY = 'compass_aeped_posts';
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        const postToEdit = posts.find(post => post.id === postId);

        if (!postToEdit) {
            showNotification('Post not found', true);
            return;
        }

        // Fill form with post data
        document.getElementById('postTitle').value = postToEdit.title;
        document.getElementById('postType').value = postToEdit.type;
        document.getElementById('postDescription').value = postToEdit.description;
        document.getElementById('postDate').value = postToEdit.date;

        // Handle location field
        if (postToEdit.type === 'event') {
            document.getElementById('eventLocation').value = postToEdit.location || '';
            document.getElementById('eventFields').style.display = 'block';
        }

        // Store original images reference
        const currentImagesInput = document.createElement('input');
        currentImagesInput.type = 'hidden';
        currentImagesInput.id = 'currentImages';
        currentImagesInput.value = JSON.stringify(postToEdit.images || [postToEdit.image]);
        postForm.appendChild(currentImagesInput);

        // Initialize selectedImages with existing images
        selectedImages = (postToEdit.images || [postToEdit.image]).map((img, index) => ({
            id: `existing-${index}`,
            data: img,
            isExisting: true
        }));

        // Display image previews
        updateImagePreviews();

        // Set edit mode
        postForm.dataset.editingId = postId;
        currentlyEditing = postId;
        document.querySelector('button[type="submit"]').textContent = 'Update Post';

        // Scroll to form
        postForm.scrollIntoView({ behavior: 'smooth' });
    };

    // Update image previews display
    function updateImagePreviews() {
        const previewContainer = document.getElementById('imagePreviews');
        previewContainer.innerHTML = '';

        selectedImages.forEach((img, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            if (img.remove) {
                // Show "will be removed" state
                previewItem.classList.add('marked-for-removal');
                previewItem.innerHTML = `
                    <img src="${img.data}" alt="Marked for removal">
                    <button class="undo-btn" onclick="removeCurrentImage(${index})">
                        <i class="material-icons">undo</i>
                    </button>
                    <span class="removal-notice">Will be removed</span>
                `;
            } else {
                // Show normal image with remove option
                previewItem.innerHTML = `
                    <img src="${img.data}" alt="Preview image ${index + 1}">
                    <button class="remove-btn" onclick="removeCurrentImage(${index})">
                        <i class="material-icons">close</i>
                    </button>
                `;
            }
            previewContainer.appendChild(previewItem);
        });

        // Add "Add more images" button if we have space
        if (selectedImages.filter(img => !img.remove).length < 10) {
            const addMoreBtn = document.createElement('button');
            addMoreBtn.type = 'button';
            addMoreBtn.className = 'btn btn--secondary add-more-btn';
            addMoreBtn.innerHTML = '<i class="material-icons">add</i> Add More Images';
            addMoreBtn.addEventListener('click', () => document.getElementById('postImages').click());
            previewContainer.appendChild(addMoreBtn);
        }
    }

    window.removeCurrentImage = function(index) {
        // Toggle removal state
        if (selectedImages[index].remove) {
            // If already marked, undo the removal
            delete selectedImages[index].remove;
        } else {
            // Mark for removal
            selectedImages[index].remove = true;
        }
        updateImagePreviews();
    };

    // Add this undo function
    window.undoRemoveImage = function(index) {
        delete selectedImages[index].remove;
        updateImagePreviews();
    };

    // Delete post function
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

    // Reset form function
    function resetForm() {
        postForm.reset();
        postForm.removeAttribute('data-editing-id');
        document.getElementById('eventFields').style.display = 'none';
        document.querySelector('button[type="submit"]').textContent = 'Publish Post';
        document.getElementById('imagePreviews').innerHTML = '';
        selectedImages = [];
        currentlyEditing = null;
    }
fz
    // Initialize post type toggle
    document.getElementById('postType').addEventListener('change', function() {
        document.getElementById('eventFields').style.display = 
            this.value === 'event' ? 'block' : 'none';
    });

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
    
    // When user clicks outside modal
    window.addEventListener('click', function(event) {
        if (event.target == confirmationModal) {
            confirmationModal.style.display = "none";
        }
    });
    
});