document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const isDark = body.classList.contains('dark-theme');
    
    // Initialize theme and icons
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    } else if (isDark) {
        body.classList.remove('dark-theme');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

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

    // Tab switching functionality
    const manageSelector = document.getElementById('manageSelector');
    
    manageSelector.addEventListener('change', function() {
        const tabPane = document.querySelectorAll('.tab-pane');
        document.querySelectorAll('.manage-tab-btn').forEach(btn => btn.classList.remove('active'));
        tabPane.forEach(pane => pane.classList.remove('active'));
        
        // Show selected form section
        const selectedManageTab = document.getElementById(this.value);

        if (!selectedManageTab) return;
        if (selectedManageTab.id === 'testimonials-tab'){
            loadTestimonials();
        } else if (selectedManageTab.id === 'posts-tab') {
            updatePostsList();
        }
        
        selectedManageTab.classList.add('active');
    });

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
    document.getElementById('postImages').addEventListener('change', async function(e) {
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
        });

        // Process all files in parallel
        const compressionPromises = files.map(file => 
            compressImage(file).catch(error => {
                console.error('Image compression failed for one file:', error);
                return null; // Return null for failed compressions
            })
        );

        // Wait for all compressions to complete
        const compressionResults = await Promise.all(compressionPromises);
        
        const newCompressedImages = compressionResults
            .filter(result => result !== null)
            .map(compressionResult => ({
                id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Better unique ID
                data: compressionResult.dataUrl,
                file: compressionResult.file,
                originalSize: formatFileSize(compressionResult.originalSize),
                compressedSize: formatFileSize(compressionResult.compressedSize),
                isExisting: false
            }));

        // Merge existing images with new compressed images (preserves existing ones)
        selectedImages = [...selectedImages, ...newCompressedImages];

        updateImagePreviews();
        
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
            const finalImages = selectedImages .filter(img => !img.remove) .map(img => img.data);
            const fileName = selectedImages .filter(filesName => !filesName.remove) .map(filesName => filesName.file);
            const originalSize = selectedImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.originalSize);
            const compressedSize = selectedImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.compressedSize);
            
            // Ensure we have at least one image
            const images = finalImages.length > 0 ? finalImages : ['../images/image-placeholder.jpg'];
            
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
                fileNameArray: fileName,
                originalSize: originalSize,
                compressedSize: compressedSize,
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
            const displayImage = post.mainImage || '../images/image-placeholder.jpg';
            
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
        selectedImages = (postToEdit.images).map((img, index) => ({
            id: `existing-${index}`,
            data: img,
            file: postToEdit.fileNameArray[index],
            originalSize: postToEdit.originalSize[index],
            compressedSize: postToEdit.compressedSize[index],
            isExisting: true
        }));
        console.log(postToEdit);

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
                    <span class="image-name">${img.file}</span>
                    <span class="image-size">${img.originalSize} to ${img.compressedSize}</span>
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

    // Initialize post type toggle
    document.getElementById('postType').addEventListener('change', function() {
        document.getElementById('eventFields').style.display = 
            this.value === 'event' ? 'block' : 'none';
    });

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

// Helper function to show notifications
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = isError ? 'notification error' : 'notification success';
    notification.innerHTML = `
        <i class="material-icons">${isError ? 'error' : 'check_circle'}</i>
        <span>${message}</span>
    `;
    
    // Position the notification based on current scroll
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    notification.style.top = `${scrollTop + 20}px`;
    notification.style.right = '20px';
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger the show animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after animation and timeout
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300); // Match this with your CSS transition time
    }, 3000);
    
    // Update position on scroll
    const updatePosition = () => {
        const newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        notification.style.top = `${newScrollTop + 20}px`;
    };
    
    window.addEventListener('scroll', updatePosition);
    
    // Clean up scroll listener when notification is removed
    setTimeout(() => {
        window.removeEventListener('scroll', updatePosition);
    }, 3300); // Slightly longer than total display time
}

// Database functions
const TestimonialDB = {
    // Key for localStorage
    STORAGE_KEY: 'compass_aeped_testimonials',
    
    // Get all testimonials
    getAll: function() {
        const testimonials = localStorage.getItem(this.STORAGE_KEY);
        return testimonials ? JSON.parse(testimonials) : [];
    },
    
    // Save a new testimonial
    save: function(testimonial) {
        const testimonials = this.getAll();
        testimonial.id = Date.now(); // Add unique ID
        testimonials.unshift(testimonial); // Add to beginning of array
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(testimonials));
        return testimonial;
    },
    
    // Update a testimonial
    update: function(id, updatedData) {
        const testimonials = this.getAll();
        const index = testimonials.findIndex(t => t.id == id);
        if (index !== -1) {
            testimonials[index] = {...testimonials[index], ...updatedData};
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(testimonials));
            return true;
        }
        return false;
    },
    
    // Delete a testimonial
    delete: function(id) {
        const testimonials = this.getAll();
        const filtered = testimonials.filter(t => t.id != id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return testimonials.length !== filtered.length;
    },
    
    // Get a single testimonial by ID
    getById: function(id) {
        return this.getAll().find(t => t.id == id);
    }
};

// Load testimonials from database
function loadTestimonials() {
    const testimonials = TestimonialDB.getAll();
    const testimonialsList = document.querySelector('.testimonials-list');
    
    if (testimonials.length === 0) {
        testimonialsList.innerHTML = `
            <div class="empty-state">
                <i class="material-icons">format_quote</i>
                <p>No testimonials yet. Create your first one!</p>
            </div>
        `;
        return;
    }
    
    testimonialsList.innerHTML = '';
    testimonials.forEach(testimonial => {
        const testimonialItem = createTestimonialItem(testimonial);
        testimonialsList.appendChild(testimonialItem);
    });
}


// Add these variables at the top of your script
let selectedClientImages = [];

// Image selection handler
document.getElementById('clientImages').addEventListener('change', async function(e) {
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
    });

    // Process all files in parallel
    const compressionPromises = files.map(file => 
        compressImage(file).catch(error => {
            console.error('Image compression failed for one file:', error);
            return null; // Return null for failed compressions
        })
    );

    // Wait for all compressions to complete
    const compressionResults = await Promise.all(compressionPromises);
    
    // Filter out null results (failed compressions) and format

    const newCompressedImages = compressionResults
        .filter(result => result !== null)
        .map(compressionResult => ({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Better unique ID
            data: compressionResult.dataUrl,
            file: compressionResult.file,
            originalSize: formatFileSize(compressionResult.originalSize),
            compressedSize: formatFileSize(compressionResult.compressedSize),
            isExisting: false
        }));

    // Merge existing images with new compressed images (preserves existing ones)
    selectedClientImages = [...selectedClientImages, ...newCompressedImages];

    updateClientImagePreviews();
    
    // Reset file input to allow selecting same files again
    e.target.value = '';
});



function updateClientImagePreviews() {
    const previewContainer = document.getElementById('testimonialImagePreviews');
    previewContainer.innerHTML = '';

    selectedClientImages.forEach((img, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        
        if (img.remove) {
            // Show "will be removed" state
            previewItem.classList.add('marked-for-removal');
            previewItem.innerHTML = `
                <img src="${img.data}" alt="Marked for removal">
                <button class="undo-btn" onclick="removeClientCurrentImage(${index})">
                    <i class="material-icons">undo</i>
                </button>
                <span class="removal-notice">Will be removed</span>
            `;
        } else {
            // Show normal image with remove option
            previewItem.innerHTML = `
                <img src="${img.data}" alt="Preview image ${index + 1}">
                <button class="remove-btn" onclick="removeClientCurrentImage(${index})">
                    <i class="material-icons">close</i>
                </button>
                <span class="image-name">${img.file}</span>
                <span class="image-size">${img.originalSize} to ${img.compressedSize}</span>
            `;
        }
        previewContainer.appendChild(previewItem);
    });

    // Add "Add more images" button if we have space
    if (selectedClientImages.filter(img => !img.remove).length < 10) {
        const addMoreBtn = document.createElement('button');
        addMoreBtn.type = 'button';
        addMoreBtn.className = 'btn btn--secondary add-more-btn';
        addMoreBtn.innerHTML = '<i class="material-icons">add</i> Add More Images';
        addMoreBtn.addEventListener('click', () => document.getElementById('clientImages').click());
        previewContainer.appendChild(addMoreBtn);
    }
}

window.removeClientCurrentImage = function(index) {
    // Toggle removal state
    if (selectedClientImages[index].remove) {
        // If already marked, undo the removal
        delete selectedClientImages[index].remove;
    } else {
        // Mark for removal
        selectedClientImages[index].remove = true;
    }
    updateClientImagePreviews();
};

// Add this undo function
window.undoRemoveImage = function(index) {
    delete selectedClientImages[index].remove;
    updateClientImagePreviews();
};

// Function to create testimonial item HTML
function createTestimonialItem(testimonial) {
    const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
    const date = new Date(testimonial.createdAt).toLocaleDateString();
    const imageCount = testimonial.images ? testimonial.images.length : 0;

    // Add badge if multiple images exist
    const imageBadge = imageCount > 0 ? 
        `<span class="image-count-badge">${imageCount} images</span>` : '';
    
    const element = document.createElement('div');
    element.className = 'testimonial-item';
    element.dataset.id = testimonial.id;
    element.innerHTML = `
        <div class="testimonial-rating" title="${testimonial.rating} out of 5 stars">
            ${stars}
        </div>
        <blockquote class="testimonial-quote"><p>${testimonial.quote}</p></blockquote>
        <div class="client-info">
            <div class="client-avatar">
                <img src="${testimonial.avatar || '../images/image-placeholder.jpg'}" alt="${testimonial.name}" class="client-avatar-image">
                ${imageBadge}
            </div>
            <div class="client-details">
                <h4>${testimonial.name}</h4>
                <p>${testimonial.position}</p>
                <small class="testimonial-date">${date}</small>
            </div>
        </div>
        <div class="testimonial-actions">
            <button type="button" class="edit-testimonial" title="Edit">
                <i class="material-icons">edit</i>
            </button>
            <button type="button" class="delete-testimonial" title="Delete">
                <i class="material-icons">delete</i>
            </button>
        </div>
    `;
    
    return element;
}

// Handle edit and delete actions (event delegation)
document.querySelector('.testimonials-list').addEventListener('click', function(e) {
    const testimonialItem = e.target.closest('.testimonial-item');
    if (!testimonialItem) return;

    if (!editingTestimonial) {
        selectedClientImages = []
    };
    
    const testimonialId = testimonialItem.getAttribute('data-id');
    
    if (e.target.closest('.edit-testimonial')) {
        // Edit functionality
        const testimonial = TestimonialDB.getById(testimonialId);
        if (testimonial) {
            populateEditForm(testimonial);
        }
    } else if (e.target.closest('.delete-testimonial')) {
        // Delete functionality
        if (confirm('Are you sure you want to delete this testimonial?')) {
            const isDeleted = TestimonialDB.delete(testimonialId);
            if (isDeleted) {
                testimonialItem.remove();
                showNotification('Testimonial deleted successfully!');
                
                // Show empty state if no testimonials left
                if (!document.querySelector('.testimonial-item')) {
                    document.querySelector('.testimonials-list').innerHTML = `
                        <div class="empty-state">
                            <i class="material-icons">format_quote</i>
                            <p>No testimonials yet. Create your first one!</p>
                        </div>
                    `;
                }
            } else {
                showNotification('Failed to delete testimonial!', true);
            }
        }
    }
});

// Handle form submission for new testimonials
async function handleFormSubmit(e) {
    e.preventDefault();
    // Get form values
    const rating = document.getElementById('testimonialRating').value;
    const quote = document.getElementById('testimonialQuote').value;
    const name = document.getElementById('clientName').value;
    const position = document.getElementById('clientPosition').value;

    // Filter out images marked for removal
    const finalImages = selectedClientImages .filter(img => !img.remove) .map(img => img.data);
    const fileName = selectedClientImages .filter(filesName => !filesName.remove) .map(filesName => filesName.file);
    const originalSize = selectedClientImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.originalSize);
    const compressedSize = selectedClientImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.compressedSize);
    
    // Ensure we have at least one image
    const imagesBase64 = finalImages.length > 0 ? finalImages : ['../images/image-placeholder.jpg'];
    
    // Create testimonial object
    const testimonial = {
        rating,
        quote,
        name,
        position,
        avatar: imagesBase64[0] || '../images/image-placeholder.jpg', // First image as avatar
        images: imagesBase64,
        createdAt: new Date().toISOString(),
        fileNameArray: fileName,
        originalSize: originalSize,
        compressedSize: compressedSize,
    };
    
    // Save to database
    const savedTestimonial = TestimonialDB.save(testimonial);
    
    // Reload testimonials list
    loadTestimonials();
    
    // Reset form
    this.reset();
    selectedClientImages = []
    document.getElementById('testimonialImagePreviews').innerHTML = '';
    
    // Show success message
    showNotification('Testimonial saved successfully!');
}

let editingTestimonial = null;

// Populate form for editing with enhanced image management
function populateEditForm(testimonial) {

    if (editingTestimonial === testimonial.id) {
        showNotification('You are already editing this testimony');
        return;
    }

    // Reset form
    const form = document.getElementById('testimonialForm');
    form.reset();

    if (!testimonial) {
        showNotification('Testimony not found', true);
        return;
    }

    document.getElementById('testimonialRating').value = testimonial.rating;
    document.getElementById('testimonialQuote').value = testimonial.quote;
    document.getElementById('clientName').value = testimonial.name;
    document.getElementById('clientPosition').value = testimonial.position;

    // Store original images reference
    const currentTestimonialImagesInput = document.createElement('input');
    currentTestimonialImagesInput.type = 'hidden';
    currentTestimonialImagesInput.id = 'currentImages';
    currentTestimonialImagesInput.value = JSON.stringify(testimonial.images);
    form.appendChild(currentTestimonialImagesInput);

    // Initialize selectedImages with existing images
    selectedClientImages = (testimonial.images).map((img, index) => ({
        id: `existing-${index}`,
        data: img,
        file: testimonial.fileNameArray[index],
        originalSize: testimonial.originalSize[index],
        compressedSize: testimonial.compressedSize[index],
        isExisting: true
    }));

    // Display image previews
    updateClientImagePreviews();
    
    // Change form to update mode
    form.dataset.editId = testimonial.id;
    editingTestimonial = testimonial.id;
    form.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Update Testimonial';

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });

    // Update form submit handler temporarily
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', handleUpdateSubmit);
}

// Handle form submission for updates with image management
async function handleUpdateSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const testimonialId = form.dataset.editId;
    
    // Get form values
    const rating = document.getElementById('testimonialRating').value;
    const quote = document.getElementById('testimonialQuote').value;
    const name = document.getElementById('clientName').value;
    const position = document.getElementById('clientPosition').value;

    

    // Filter out images marked for removal
    const finalImages = selectedClientImages .filter(img => !img.remove) .map(img => img.data);
    const fileName = selectedClientImages .filter(filesName => !filesName.remove) .map(filesName => filesName.file);
    const originalSize = selectedClientImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.originalSize);
    const compressedSize = selectedClientImages .filter(sizeInfo => !sizeInfo.remove) .map(sizeInfo => sizeInfo.compressedSize);
    
    // Ensure we have at least one image
    const imagesBase64 = finalImages.length > 0 ? finalImages : ['../images/image-placeholder.jpg'];
    
    // Prepare updated data
    const updatedData = {
        rating,
        quote,
        name,
        position,
        updatedAt: new Date().toISOString(),
        fileNameArray: fileName,
        originalSize: originalSize,
        compressedSize: compressedSize
    };
    
    // Add new images
    updatedData.images = imagesBase64;
    
    // Set avatar (first image that's not being removed, or first new image)
    if (imagesBase64.length > 0) {
        updatedData.avatar = imagesBase64[0];
    } else if (updatedData.images.length > 0) {
        updatedData.avatar = updatedData.images[0];
    }
    
    // Update in database
    const isUpdated = TestimonialDB.update(testimonialId, updatedData);
    
    if (isUpdated) {
        // Reload testimonials
        loadTestimonials();
        
        // Reset form
        form.reset();
        editingTestimonial = '';
        document.getElementById('testimonialImagePreviews').innerHTML = '';
        delete form.dataset.editId;
        form.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Save Testimonial';
        
        // Restore original submit handler
        form.removeEventListener('submit', handleUpdateSubmit);
        form.addEventListener('submit', handleFormSubmit);
        
        showNotification('Testimonial updated successfully!');
    } else {
        showNotification('Failed to update testimonial!', true);
    }
}


// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load testimonials if on the testimonials tab
    if (document.querySelector('#testimonials-tab').classList.contains('active')) {
        loadTestimonials();
    }
    
    // Set up form submission handler
    document.getElementById('testimonialForm').addEventListener('submit', handleFormSubmit);
});


// Database functions
const ServiceDB = {
    // Key for localStorage
    SERVICE_KEY: 'compass_service_categories',
    
    // Get all services
    getAll: function() {
        const services = localStorage.getItem(this.SERVICE_KEY);
        return services ? JSON.parse(services) : [];
    },
    
    // Save a new service
    save: function(service) {
        const services = this.getAll();
        service.id = Date.now(); // Add unique ID
        services.unshift(service); // Add to beginning of array
        localStorage.setItem(this.SERVICE_KEY, JSON.stringify(services));
        return service;
    },
    
    // Update a service
    update: function(id, updatedData) {
        const services = this.getAll();
        const index = services.findIndex(t => t.id == id);
        if (index !== -1) {
            services[index] = {...services[index], ...updatedData};
            localStorage.setItem(this.SERVICE_KEY, JSON.stringify(services));
            return true;
        }
        return false;
    },
    
    // Delete a testimonial
    delete: function(id) {
        const services = this.getAll();
        const filtered = services.filter(t => t.id != id);
        localStorage.setItem(this.SERVICE_KEY, JSON.stringify(filtered));
        return services.length !== filtered.length;
    },
    
    // Get a single testimonial by ID
    getById: function(id) {
        return this.getAll().find(t => t.id == id);
    }
};

document.addEventListener('DOMContentLoaded', function() {

    // Form selection functionality
    const formSelector = document.getElementById('serviceFormSelector');
    const formSections = document.querySelectorAll('.form-section');
    
    formSelector.addEventListener('change', function() {
        // Hide all form sections
        formSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected form section
        const selectedForm = document.getElementById(this.value);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    });

    // Add feature input
    document.getElementById('addFeatureBtn').addEventListener('click', function() {
        const container = document.getElementById('serviceFeaturesContainer');
        const featureDiv = document.createElement('div');
        featureDiv.className = 'feature-input';
        featureDiv.innerHTML = `
            <input type="text" class="feature-input-field" placeholder="Feature description">
            <button type="button" class="remove-feature">
                <i class="material-icons">remove</i>
            </button>
        `;
        container.appendChild(featureDiv);
    });

    // Remove feature
    document.getElementById('serviceFeaturesContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-feature')) {
            e.target.closest('.feature-input').remove();
        }
    });

    // Service image preview (updated to show compression info)
    document.getElementById('serviceImage').addEventListener('change', serviceImagePreview);
        
    async function serviceImagePreview (e) {
        const recommendedImageSize = document.getElementById('recommendedImageSize');
        recommendedImageSize.innerHTML = '';

        const preview = document.getElementById('serviceImagePreview');
        preview.innerHTML = '';
        
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const originalSize = formatFileSize(file.size);
            
            // Show temporary preview
            const tempPreview = document.createElement('div');
            tempPreview.innerHTML = `
                <p>Loading and compressing image (${originalSize})...</p>
                <progress value="0" max="100"></progress>
            `;
            preview.appendChild(tempPreview);
            
            try {
                const compressionResult = await compressImage(file);
                
                preview.innerHTML = '';
                const img = document.createElement('img');
                img.src = compressionResult.dataUrl;
                preview.appendChild(img);
                
                const info = document.createElement('div');
                info.className = 'image-info';
                info.innerHTML = `
                    <span class="image-name">${compressionResult.file}</span>
                    <span class="image-size">${formatFileSize(compressionResult.originalSize)} to ${formatFileSize(compressionResult.compressedSize)}</span>
                `;
                const sizeInfo = document.createElement('small');
                sizeInfo.innerHTML = `
                    Recommended size: 800x600 pixels: Loaded Image Size: ${compressionResult.width}×${compressionResult.height} px
                `;
                recommendedImageSize.appendChild(sizeInfo)
                preview.appendChild(info);
            } catch (error) {
                preview.innerHTML = '<p class="error">Failed to process image</p>';
                console.error('Image processing error:', error);
            }
        }
    }

    // Set up service category submission handler
    document.getElementById('serviceCategoryForm').addEventListener('submit', handleServiceCategorySubmit);
    
    function handleServiceCategorySubmit (e) {
        e.preventDefault();
        
        const title = document.getElementById('categoryTitle').value;
        const icon = document.getElementById('categoryIcon').value;
        const description = document.getElementById('categoryDescription').value;
        
        const category = {
            id: Date.now().toString(),
            title,
            icon,
            description,
            services: [],
            createdAt: new Date().toISOString()
        };

        // Save to database
        const savedServiceCategory = ServiceDB.save(category);
        
        this.reset();
        updateCategoryDropdown();
        loadServices();
        
        showNotification('Service category saved successfully!');
    }

    // Save individual service
    document.getElementById('individualServiceForm').addEventListener('submit', handleIndividualServiceSubmit);
    
    async function handleIndividualServiceSubmit (e) {
        e.preventDefault();
        
        const categoryId = document.getElementById('serviceCategory').value;
        const title = document.getElementById('individualServiceTitle').value;
        const description = document.getElementById('individualServiceDescription').value;
        const imageFile = document.getElementById('serviceImage').files[0];
        
        // Get features
        const features = [];
        document.querySelectorAll('.feature-input-field').forEach(input => {
            if (input.value.trim() !== '') {
                features.push(input.value.trim());
            }
        });
        
        // Compress and store image if exists
        let imageData = null;
        if (imageFile) {
            try {
                const compressionResult = await compressImage(imageFile);
                imageData = {
                    dataUrl: compressionResult.dataUrl,
                    dimensions: {
                        width: compressionResult.width,
                        height: compressionResult.height
                    },
                    originalSize: formatFileSize(compressionResult.originalSize),
                    compressedSize: formatFileSize(compressionResult.compressedSize)
                };
            } catch (error) {
                console.error('Image compression failed:', error);
                alert('Failed to process image. Please try another image.');
                return;
            }
        }
        
        const service = {
            id: Date.now().toString(),
            title,
            description,
            features,
            image: imageData, // Store compressed image data
            createdAt: new Date().toISOString(),
            file: imageFile.name
        };

        console.log(imageFile.name);
        
        // Add service to the selected category
        const categories = ServiceDB.getAll();
        const categoryIndex = categories.findIndex(t => t.id == categoryId);
        
        if (categoryIndex !== -1) {
            categories[categoryIndex].services.push(service);
            localStorage.setItem('compass_service_categories', JSON.stringify(categories));
            
            this.reset();
            document.getElementById('serviceFeaturesContainer').innerHTML = '';
            document.getElementById('serviceImagePreview').innerHTML = '';
            
            loadServices();
            showNotification('Service added successfully!');
        } else {
            showNotification('Error: Category not found!');
        }
    }

    // Update category dropdown
    function updateCategoryDropdown() {
        const select = document.getElementById('serviceCategory');
        select.innerHTML = '<option value="">Select a category</option>';
        
        const categories = ServiceDB.getAll();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.title;
            select.appendChild(option);
        });
    }

    // Load services
    function loadServices() {
        const accordion = document.getElementById('servicesAccordion');
        const categories = ServiceDB.getAll();
        
        if (categories.length === 0) {
            accordion.innerHTML = `
                <div class="service empty-state">
                    <i class="material-icons">info</i>
                    <p>No service categories added yet. Create your first category above.</p>
                </div>
            `;
            return;
        }
        
        accordion.innerHTML = '';
        
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.id = category.id;
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <div class="category-title">
                    <i class="material-icons">${category.icon}</i>
                    <h3>${category.title}</h3>
                </div>
                <div class="category-actions">
                    <button type="button" class="edit-category" title="Edit">
                        <i class="material-icons">edit</i>
                    </button>
                    <button type="button" class="delete-category" title="Delete">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            `;
            
            const categoryBody = document.createElement('div');
            categoryBody.className = 'category-body';
            categoryBody.dataset.id = category.id;
            categoryBody.innerHTML = `
                <p>${category.description}</p>
                <div class="services-list">
                    ${category.services.length > 0 ? 
                        category.services.map(service => `
                            <div class="service-item" id="${service.id}">
                                <div class="service-header-action">
                                    <h4>${service.title}</h4>
                                    <div class="service-actions">
                                         <button class="edit-service" 
                                                data-category-id="${category.id}"
                                                data-service-id="${service.id}">
                                            <i class="material-icons">edit</i>
                                        </button>
                                        <button class="delete-service" 
                                                data-category-id="${category.id}"
                                                data-service-id="${service.id}">
                                            <i class="material-icons">delete</i>
                                        </button>
                                    </div>
                                </div>
                                
                                <p>${service.description}</p>
                                <div class="service-info-container">
                                    ${service.image ? `
                                        <img src="${service.image.dataUrl}" alt="${service.title}" class="service-image">
                                    ` : ''}
                                    <ul class="service-features">
                                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="service empty-state">No services in this category yet</div>'
                    }
                </div>
            `;
            
            categoryCard.appendChild(categoryHeader);
            categoryCard.appendChild(categoryBody);
            accordion.appendChild(categoryCard);
        });
    }

    // Edit and delete services category
    document.getElementById('servicesAccordion').addEventListener('click', function(e) {
        const serviceCategoryItem = e.target.closest('.category-card');
        if (!serviceCategoryItem) return;

        if (!editingServiceCategory) {
            existingServices = []
        };

        const serviceCategoryId = serviceCategoryItem.getAttribute('data-id');

        if (e.target.closest('.edit-category')) {
            // Edit functionality
            const categories = ServiceDB.getById(serviceCategoryId);
            if (categories) {
                const categoryForm = document.getElementById('category-form');
                const serviceForm = document.getElementById('service-form');
                if (!categoryForm) {
                    serviceForm.style.display = 'none';
                    categoryForm.style.display = 'block';
                }
                populateEditCategory(categories);
            } else {
                showNotification('Category not found', true);
            }
        } else if (e.target.closest('.delete-category')) {
            if (confirm('Are you sure you want to delete this category and all its services?')) {
                const isDeleted = ServiceDB.delete(serviceCategoryId);

                if (isDeleted) {
                    loadServices();
                    updateCategoryDropdown();
                    showNotification('Service Category deleted successfully!');
                } else {
                    showNotification('Failed to delete service category!', true);
                }
                
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-service')) {
            const button = e.target.closest('.edit-service');
            const categoryId = button.dataset.categoryId;
            const serviceId = button.dataset.serviceId;
            editService(categoryId, serviceId);
        }
        if (e.target.closest('.delete-service')) {
            const button = e.target.closest('.delete-service');
            const categoryId = button.dataset.categoryId;
            const serviceId = button.dataset.serviceId;
            deleteService(categoryId, serviceId);
        }
    });

    function deleteService (categoryId, serviceId){
        // Delete individual service
        if (confirm('Are you sure you want to delete this service?')) {
            let categories = ServiceDB.getAll();
            const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
            
            if (categoryIndex !== -1) {
                categories[categoryIndex].services = categories[categoryIndex].services.filter(
                    service => service.id !== serviceId
                );
                localStorage.setItem('compass_service_categories', JSON.stringify(categories));
                loadServices();
            }
        }
    }

    let editingIndividualService = null;

    // Your edit function
    function editService(categoryId, serviceId) {
        const category = ServiceDB.getById(categoryId);

        function getServiceByID (id) {
            return category.services.find(service => service.id === id);
        }

        const service = getServiceByID(serviceId);

        if (editingIndividualService === serviceId) {
            showNotification('You are already editing this post');
            return;
        }

        const categoryForm = document.getElementById('category-form');
        const serviceForm = document.getElementById('service-form');
        if (categoryForm) {
            categoryForm.style.display = 'none';
            serviceForm.style.display = 'block';
        }

        if (service) {
                populateEditService(service, category);
            }
    }

    function populateEditService(service, category){
        // Reset form
        const individualServiceForm = document.getElementById('individualServiceForm');
        individualServiceForm.reset();
        editingServiceCategory = category.id;

        // Best practice - select by ID:
        document.getElementById('individualServiceTitle').value = service.title;
        document.getElementById('individualServiceDescription').value = service.description;
        updateCategoryDropdown(); 

        // Function to select a category by ID
        function selectCategoryById(categoryId) {
            document.getElementById('serviceCategory').value = categoryId;
        }
        selectCategoryById(category.id);

        function renderServiceFeatures(features) {
            const container = document.getElementById('serviceFeaturesContainer');
            container.innerHTML = ''; // Clear existing content

            if (features && features.length > 0) {
                features.forEach(feature => {
                    const featureDiv = document.createElement('div');
                    featureDiv.className = 'feature-input';
                    featureDiv.innerHTML = `
                        <input type="text" class="feature-input-field" value="${feature}">
                        <button type="button" class="remove-feature">
                            <i class="material-icons">remove</i>
                        </button>
                    `;
                    container.appendChild(featureDiv);
                });
            } else {
                container.innerHTML = '<div class="service empty-state">No features in this service yet</div>';
            }
        }

        // Render the features
        renderServiceFeatures(service.features);

        const recommendedImageSize = document.getElementById('recommendedImageSize');
        recommendedImageSize.innerHTML = '';

        const preview = document.getElementById('serviceImagePreview');
        preview.innerHTML = '';
        if (service.image.dataUrl){
            const img = document.createElement('img');
            img.src = service.image.dataUrl;
            
            preview.appendChild(img);
            
            const info = document.createElement('div');
            info.className = 'image-info';
            info.innerHTML = `
                <span class="image-name">${service.file}</span>
                <span class="image-size">${service.image.originalSize} to ${service.image.compressedSize}</span>
            `;
            const sizeInfo = document.createElement('small');
            sizeInfo.innerHTML = `
                Recommended size: 800x600 pixels: Loaded Image Size: ${service.image.dimensions.width}×${service.image.dimensions.height} px
            `;
            recommendedImageSize.appendChild(sizeInfo)
            preview.appendChild(info);
        }

        // Change form to update mode
        individualServiceForm.dataset.editId = service.id;
        editingIndividualService = service.id;
        individualServiceForm.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Update Service';

        // Scroll to form
        individualServiceForm.scrollIntoView({ behavior: 'smooth' });

        // Update form submit handler temporarily
        individualServiceForm.removeEventListener('submit', handleIndividualServiceSubmit);
        individualServiceForm.addEventListener('submit', handleUpdateIndividualServiceSubmit);
    }

    // Remove feature functionality (using event delegation)
    document.getElementById('serviceFeaturesContainer').addEventListener('click', function(e) {
        if (e.target.closest('.remove-feature')) {
            e.target.closest('.feature-input').remove();
            
            // Show empty state if no features left
            if (this.querySelectorAll('.feature-input').length === 0) {
                this.innerHTML = '<div class="service empty-state">No features in this service yet</div>';
            }
        }
    });

    async function handleUpdateIndividualServiceSubmit(e) {
        e.preventDefault();
        const serviceForm = e.target;
        
        // Get form values
        const categoryId = document.getElementById('serviceCategory').value;
        const title = document.getElementById('individualServiceTitle').value;
        const description = document.getElementById('individualServiceDescription').value;
        const imageFile = document.getElementById('serviceImage').files[0];
        const serviceId = this.dataset.editId;
        
        // Get features from inputs
        const features = [];
        document.querySelectorAll('#serviceFeaturesContainer .feature-input-field').forEach(input => {
            if (input.value.trim() !== '') {
                features.push(input.value.trim());
            }
        });
        
        // Get existing categories
        let categories = ServiceDB.getAll();
        
        // Find the category containing the service
        const categoryIndex = categories.findIndex(cat => cat.id === editingServiceCategory);
        if (categoryIndex === -1) {
            showNotification('Category not found!', true);
            return;
        }
        
        // Find the service index within the category
        const serviceIndex = categories[categoryIndex].services.findIndex(srv => srv.id === serviceId);
        if (serviceIndex === -1) {
            showNotification('Service not found!', true);
            return;
        }
        
        // Process image (keep existing if no new image uploaded)
        let imageData = categories[categoryIndex].services[serviceIndex].image;
        
        // If new image was uploaded
        if (imageFile) {
            try {
                const compressionResult = await compressImage(imageFile);
                imageData = {
                    dataUrl: compressionResult.dataUrl,
                    dimensions: {
                        width: compressionResult.width,
                        height: compressionResult.height
                    },
                    originalSize: formatFileSize(compressionResult.originalSize),
                    compressedSize: formatFileSize(compressionResult.compressedSize)
                };
            } catch (error) {
                showNotification('Failed to process image. Please try another image.', true);
                return;
            }
        }
        
        // Update the service
        categories[categoryIndex].services[serviceIndex] = {
            ...categories[categoryIndex].services[serviceIndex],
            title,
            description,
            features,
            image: imageData,
            updatedAt: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('compass_service_categories', JSON.stringify(categories));
        
        // Show success message
        showNotification('Service updated successfully!');
        
        // Reset form and reload services
        serviceForm.reset();
        document.getElementById('serviceFeaturesContainer').innerHTML = '';
        document.getElementById('serviceImagePreview').innerHTML = '';
        delete serviceForm.dataset.editId;
        serviceForm.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Save Service';
        editingIndividualService = null;
        editingServiceCategory = null;
        
        // Reload services to show changes
        loadServices();
        
        // Restore original submit handler
        serviceForm.addEventListener('submit', handleIndividualServiceSubmit);
        serviceForm.removeEventListener('submit', handleUpdateIndividualServiceSubmit);
    }
        

    let editingServiceCategory = null;
    let existingServices = [];

    function populateEditCategory(category) {
        if (editingServiceCategory === category.id) {
            showNotification('You are already editing this Service Category');
            return;
        }

        // Reset form
        const serviceCategoryForm = document.getElementById('serviceCategoryForm');
        serviceCategoryForm.reset();

        document.getElementById('categoryTitle').value = category.title;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('selectedIconPreview').innerHTML = `<i class="material-icons">${category.icon}</i>`;
        document.getElementById('categoryDescription').value = category.description;
        existingServices = category.services

        // Change form to update mode
        serviceCategoryForm.dataset.editId = category.id;
        editingServiceCategory = category.id;
        serviceCategoryForm.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Update Category';

        // Scroll to form
        serviceCategoryForm.scrollIntoView({ behavior: 'smooth' });

        // Update form submit handler temporarily
        serviceCategoryForm.removeEventListener('submit', handleServiceCategorySubmit);
        serviceCategoryForm.addEventListener('submit', handleUpdateServiceCategorySubmit);
    }

    function handleUpdateServiceCategorySubmit (e) {
        e.preventDefault();
        const categoryForm = e.target;
        const serviceFormId = categoryForm.dataset.editId;
        
        // Get form values
        const title = document.getElementById('categoryTitle').value;
        const icon = document.getElementById('categoryIcon').value;
        const description = document.getElementById('categoryDescription').value;

        // Ensure we have at least one services
        const serviceList = existingServices.length > 0 ? existingServices : [];
        const category = {
            updatedAt: Date.now().toString(),
            title,
            icon,
            description,
        };

        // Add new images
        category.services = serviceList;
        
        // Update in database
        const isUpdated = ServiceDB.update(serviceFormId, category);
        
        if (isUpdated) {
            categoryForm.reset();
            editingServiceCategory = '';
            delete categoryForm.dataset.editId;
            categoryForm.querySelector('button[type="submit"]').innerHTML = '<i class="material-icons">save</i> Save Category';
            
            // Restore original submit handler
            categoryForm.removeEventListener('submit', handleUpdateServiceCategorySubmit);
            categoryForm.addEventListener('submit', handleServiceCategorySubmit);
            
            updateCategoryDropdown();
            loadServices();
            
            showNotification('Service category Updated successfully!');
        } else {
            showNotification('Failed to update testimonial!', true);
        }
    }

    // Initialize
    updateCategoryDropdown();
    loadServices();
});


// Material Icons data (top 100 commonly used icons)
const materialIcons = [
    'home', 'search', 'info', 'check', 'close', 'menu', 'expand_more', 'expand_less',
    'favorite', 'favorite_border', 'share', 'settings', 'account_circle', 'add', 'delete',
    'arrow_back', 'arrow_forward', 'chevron_left', 'chevron_right', 'refresh', 'more_vert',
    'visibility', 'visibility_off', 'lock', 'lock_open', 'person', 'people', 'person_add',
    'email', 'phone', 'link', 'calendar_today', 'location_on', 'map', 'local_offer',
    'shopping_cart', 'shopping_basket', 'credit_card', 'work', 'school', 'star', 'star_border',
    'star_half', 'bookmark', 'bookmark_border', 'lightbulb', 'lightbulb_outline', 'help',
    'help_outline', 'warning', 'error', 'error_outline', 'notifications', 'notifications_none',
    'notifications_off', 'done', 'done_all', 'remove', 'add_circle', 'remove_circle',
    'cancel', 'arrow_upward', 'arrow_downward', 'chevron_up', 'chevron_down', 'filter_list',
    'sort', 'import_export', 'redo', 'undo', 'cached', 'autorenew', 'loop', 'hourglass_empty',
    'hourglass_full', 'print', 'save', 'cloud', 'cloud_upload', 'cloud_download', 'attach_file',
    'create', 'edit', 'content_copy', 'content_cut', 'content_paste', 'inbox', 'archive',
    'report', 'delete_forever', 'send', 'mail', 'drafts', 'markunread', 'reply', 'reply_all',
    'forward', 'insert_link', 'insert_photo', 'insert_chart', 'format_quote', 'format_list_bulleted',
    'format_list_numbered', 'format_bold', 'format_italic', 'format_underlined', 'format_color_text'
];

// Icon Picker functionality
document.addEventListener('DOMContentLoaded', function() {
    const iconPickerModal = document.getElementById('iconPickerModal');
    const openIconPicker = document.getElementById('openIconPicker');
    const iconCloseModal = document.querySelector('.icon-close-modal');
    const iconsGrid = document.getElementById('iconsGrid');
    const iconSearch = document.getElementById('iconSearch');
    const categoryIconInput = document.getElementById('categoryIcon');
    const selectedIconPreview = document.getElementById('selectedIconPreview');

    // Load icons into the grid
    function loadIcons(icons) {
        iconsGrid.innerHTML = '';
        icons.forEach(icon => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.innerHTML = `
                <i class="material-icons">${icon}</i>
                <span>${icon}</span>
            `;
            iconItem.addEventListener('click', function() {
                categoryIconInput.value = icon;
                selectedIconPreview.innerHTML = `<i class="material-icons">${icon}</i>`;
                closeIconPicker();
            });
            iconsGrid.appendChild(iconItem);
        });
    }

    // Open icon picker
    openIconPicker.addEventListener('click', function() {
        iconPickerModal.style.display = 'block';
        loadIcons(materialIcons);
    });

    // Close icon picker
    function closeIconPicker() {
        iconPickerModal.style.display = 'none';
    }

    iconCloseModal.addEventListener('click', closeIconPicker);

    // Close when clicking outside modal
    window.addEventListener('click', function(event) {
        if (event.target === iconPickerModal) {
            closeIconPicker();
        }
    });

    // Search functionality
    iconSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredIcons = materialIcons.filter(icon => 
            icon.toLowerCase().includes(searchTerm)
        );
        loadIcons(filteredIcons);
    });

    // Initialize with empty preview
    selectedIconPreview.innerHTML = '<i class="material-icons">image</i>';
});


// Image compression function
function compressImage(file, quality = 0.7, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                resolve({
                    dataUrl: compressedDataUrl,
                    width: width,
                    height: height,
                    originalSize: file.size,
                    file: file.name,
                    compressedSize: compressedDataUrl.length // Approximate
                });
            };

            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

// Helper function to format file sizes
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}