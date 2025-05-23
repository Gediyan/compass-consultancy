// main-scripts.js

// Counter Animation Function
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const animationDuration = 5000;
    let animationStarted = false;
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationStarted) {
          animationStarted = true;
          
          counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const startTime = Date.now();
            
            const updateCount = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              const currentCount = Math.floor(progress * target);
              
              counter.innerText = currentCount;
              
              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                counter.innerText = target;
              }
            };
            
            requestAnimationFrame(updateCount);
          });
        }
      });
    }, { threshold: 0.5 });
  
    counters.forEach(counter => {
      observer.observe(counter.parentElement);
    });
  }
  
  // Read More/Less Function
  function initReadMore() {
    const btn = document.querySelector('.read-more-btn');
    if (btn) {
        btn.addEventListener('click', function() {
            const moreText = document.querySelector('.more-text');
            const isHidden = moreText.style.display === 'none';
            
            moreText.style.display = isHidden ? 'inline' : 'none';
            btn.textContent = isHidden ? 'Read Less' : 'Read More';
            
            // Optional: Smooth scroll to maintain context
            if (isHidden) {
                moreText.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            });
          }
  }
  
  // Initialize all functions when DOM loads
  document.addEventListener('DOMContentLoaded', function() {
    initCounterAnimation();
    initReadMore();
    // Add more initializers here
  });

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const dropdownBtn = document.getElementById('profileDropdownBtn');
  const dropdown = document.getElementById('profileDropdown');
  const accountAction = document.getElementById('accountAction');
  const profileAction = document.getElementById('profileAction');
  
  // Check session status on page load
  checkSessionStatus();

  function checkSessionStatus() {
      const SESSION_KEY = 'compass_aeped_session';
      const sessionData = localStorage.getItem(SESSION_KEY);
      
      if (sessionData) {
          // User is logged in - setup dropdown
          checkAuth();
      } else {
          // No active session - go to signin page
          setupNewLoginSignin();
      }
  }
    
  // Check authentication status
  function checkAuth() {
    const SESSION_KEY = 'compass_aeped_session';
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expires = new Date(session.expires);
        
        if (now < expires) {
            // Session is valid
            const USERS_KEY = 'compass_aeped_users';
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            const user = users.find(u => u.id === session.userId);
            
            if (user) {
                updateProfileDropdown(user);
                return;
            }
        } else {
            // Session expired
            localStorage.removeItem(SESSION_KEY);
        }
    }
    
    // Default to guest state
    // updateProfileDropdown(null);
  }
  
  // Update dropdown with user data
  function updateProfileDropdown(user) {
      const dropdownProfileIcon = document.getElementById('dropdownProfileIcon');
      const dropdownUserName = document.getElementById('dropdownUserName');
      const dropdownUserEmail = document.getElementById('dropdownUserEmail');
      
      if (user) {
          // User is logged in
          if (user.profileImage) {
              dropdownBtn.innerHTML = `<img src="${user.profileImage}" alt="Profile" class="profile-image">`;
              profileDropdownBtn.style.backgroundImage = `url('${user.profileImage}')`;
              profileDropdownBtn.style.backgroundSize = "cover";
              profileDropdownBtn.style.borderColor = 'white';
              profileDropdownBtn.style.borderRadius = '50%';
              dropdownProfileIcon.innerHTML = `<img src="${user.profileImage}" alt="Profile" class="profile-image">`;
          } else {
              const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
              dropdownBtn.textContent = initial;
              profileDropdownBtn.textContent = initial;
              dropdownProfileIcon.textContent = initial;
          }
          
          dropdownUserName.textContent = user.name || 'User';
          dropdownUserEmail.textContent = user.email || '';
          
          profileAction.innerHTML = '<i class="material-icons">account_circle</i> Profile';
          profileAction.onclick = goToUserProfile;
          
          accountAction.innerHTML = '<i class="material-icons">exit_to_app</i> Sign Out';
          accountAction.onclick = signOut;
      } else {
          // Guest state
          dropdownBtn.textContent = 'G';
          dropdownProfileIcon.textContent = 'G';
          dropdownUserName.textContent = 'Guest';
          dropdownUserEmail.textContent = '';
          
          accountAction.innerHTML = '<i class="material-icons">account_circle</i> Sign In';
          accountAction.onclick = goToSignIn;
      }
  }
  
  // Dropdown toggle functionality
  if (dropdownBtn && dropdown) {
      dropdownBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          dropdown.classList.toggle('show');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
          if (!dropdown.contains(e.target) && e.target !== dropdownBtn) {
              dropdown.classList.remove('show');
          }
      });
  }
  
  // Auth functions
  function goToUserProfile(e) {
      e.preventDefault();

      if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'profile.html';
      } else {
        window.location.href = 'pages/profile.html';
      }
  }
  
  // Auth functions
  function goToSignIn(e) {
      e.preventDefault();
        const isRoot = window.location.pathname === '/index.html' || 
                   window.location.pathname === '/';
        const path = isRoot ? 'pages/signin.html' : '../pages/signin.html';
        window.location.href = path;
  }
  
  function signOut(e) {
      e.preventDefault();
      const SESSION_KEY = 'compass_aeped_session';
      localStorage.removeItem(SESSION_KEY);

      if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html';
      } else {
        window.location.href = 'index.html';
      }

      // Optional: Show a notification
      showNotification('You have been signed out');
  }
  
  function showNotification(message) {
      // Implement your notification system here
      console.log(message);
      alert(message); // Temporary for demo
  }

  function setupNewLoginSignin() {
    
    // Redirect to sign-in page on click
    profileDropdownBtn.onclick = function() {

        if (window.location.pathname.includes('/pages/')) {
          window.location.href = `signin.html`;
        } else {
          window.location.href = `pages/signin.html`;
        }
    };
  }
});


// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '🌞';
    } else {
        themeToggle.textContent = '🌓';
    }
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '🌞' : '🌓';
    });

    // Location pin interactions
    const locationPins = document.querySelectorAll('.footprint-pin');
    locationPins.forEach(pin => {
        pin.addEventListener('mouseover', function() {
            const location = this.getAttribute('data-location');
            document.getElementById(`${location}-info`).style.display = 'block';
        });
        
        pin.addEventListener('mouseout', function() {
            const location = this.getAttribute('data-location');
            document.getElementById(`${location}-info`).style.display = 'none';
        });
    });

    // Mobile menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 767) {
                mainNav.classList.remove('active');
            }
        });
    });
});


// Function to load posts on home page
function loadPosts() {
    const POSTS_KEY = 'compass_aeped_posts';
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    
    const newsContainer = document.querySelector('.news-container');
    const eventsContainer = document.querySelector('.events-container');
    
    // Clear existing content
    if (newsContainer) newsContainer.innerHTML = '';
    if (eventsContainer) eventsContainer.innerHTML = '';
    
    // Filter and sort posts
    const newsPosts = posts.filter(post => post.type === 'news')
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
    const eventPosts = posts.filter(post => post.type === 'event')
                          .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Handle news posts
    if (newsPosts.length > 0) {
        newsPosts.forEach(post => {
            const postElement = createPostElement(post);
            addPostNavigation(postElement, post.id);
            if (newsContainer) newsContainer.appendChild(postElement);
        });
    } else {
        if (newsContainer) newsContainer.innerHTML = '<p class="no-posts">No news articles found.</p>';
    }
    
    // Handle event posts
    if (eventPosts.length > 0) {
        eventPosts.forEach(post => {
            const postElement = createPostElement(post);
            addPostNavigation(postElement, post.id);
            if (eventsContainer) eventsContainer.appendChild(postElement);
        });
    } else {
        if (eventsContainer) eventsContainer.innerHTML = '<p class="no-posts">No upcoming events found.</p>';
    }
}

// Helper function to add navigation to post elements
function addPostNavigation(postElement, postId) {
    const readMoreBtn = postElement.querySelector('.read-more');
    if (readMoreBtn) {
        readMoreBtn.href = `pages/news-events.html#post-${postId}`;
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPost(postId);
        });
    }
    
    // Make entire card clickable if desired (optional)
    postElement.style.cursor = 'pointer';
    postElement.addEventListener('click', (e) => {
        // Don't navigate if clicking on the read more button (to avoid double trigger)
        if (!e.target.closest('.read-more')) {
            navigateToPost(postId);
        }
    });
}

// Function to navigate to post on news-events page
function navigateToPost(postId) {
    // Check if we're already on the news-events page
    if (window.location.pathname.includes('pages/news-events.html')) {
        // Scroll to the post
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
            postElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Optional: Add highlight effect
            postElement.style.animation = 'highlight 2s';
            setTimeout(() => {
                postElement.style.animation = '';
            }, 2000);
        }
    } else {
        // Navigate to news-events page with hash
        window.location.href = `pages/news-events.html#post-${postId}`;
    }
}

// Add this CSS for the highlight effect (optional)
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0% { background-color: rgba(255, 255, 0, 0.3); }
        100% { background-color: transparent; }
    }
`;
document.head.appendChild(style);

// Update news-events page to handle hash on load
if (window.location.pathname.includes('pages/news-events.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Load posts first
        const POSTS_KEY = 'compass_aeped_posts';
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayAllPosts(posts);
        initSlideshows();
        
        // Check for hash and scroll to post
        if (window.location.hash) {
            const postId = window.location.hash.substring(1); // Remove # from #post-123
            const postElement = document.getElementById(postId);
            if (postElement) {
                setTimeout(() => {
                    postElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Optional highlight
                    postElement.style.animation = 'highlight 2s';
                }, 500); // Small delay to allow posts to render
            }
        }
    });
}

// Helper function to create post element (updated with better link styling)
function createPostElement(post) {
    const element = document.createElement('div');
    element.className = post.type === 'news' ? 'news-card' : 'event-card';

    // Calculate time ago
    const postDate = new Date(post.createdAt || post.date);
    const timeAgo = getTimeAgo(postDate);
    const displayImage = post.mainImage || post.image || 'images/image-placeholder.jpg';
    
    const day = postDate.getDate();
    const month = postDate.toLocaleString('default', { month: 'short' });
    const weekday = postDate.toLocaleString('default', { weekday: 'short' });
    const time = postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (post.type === 'news') {
        element.innerHTML = `
            <img src="${displayImage}" alt="${post.title}" class="news-card-image">
            <div class="post-card__content">
                <div class="post-card__header">
                    <h2 class="card-title">${post.title}</h2>
                    <div class="post-card__meta">
                        <span class="post-card__time">
                            <i class="far fa-clock"></i> ${time}
                        </span>
                        <span class="post-card__weekday">${weekday}</span>
                    </div>
                </div>
                <p class="post-card__description">${post.description}</p>
                <div class="post-card__footer">
                    <span class="post-card__posted-time">Posted ${timeAgo}</span>
                    <a href="pages/news-events.html#post-${post.id}" class="post-card__cta">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    } else {
        // Enhanced event card implementation
        element.innerHTML = `
            <div class="event-card__image-container">
                <img src="${displayImage}" alt="${post.title}" class="event-card-image">
                <div class="event-card__date-badge">
                    <span class="event-card__day">${day}</span>
                    <span class="event-card__month">${month}</span>
                </div>
            </div>
            <div class="post-card__content">
                <div class="post-card__header">
                    <h2 class="card-title">${post.title}</h2>
                    <div class="post-card__meta">
                        <span class="post-card__time">
                            <i class="far fa-clock"></i> ${time}
                        </span>
                        <span class="post-card__weekday">${weekday}</span>
                    </div>
                </div>
                <div class="event-card__details">
                    <div class="event-card__location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${post.location || 'Location to be announced'}</span>
                    </div>
                    <p class="post-card__description">${post.description}</p>
                </div>
                <div class="post-card__footer">
                    <span class="post-card__posted-time">Posted ${timeAgo}</span>
                    <a href="pages/news-events.html#post-${post.id}" class="post-card__cta">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    return element;
}


// Helper function to calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'just now';
}

// Call loadPosts when the page loads
document.addEventListener('DOMContentLoaded', loadPosts);

// Wait for both DOM content and footer to load
document.addEventListener('DOMContentLoaded', function() {
    // First check if footer is already loaded
    checkForFooter();
    
    // Also set up listener for footer load event
    document.addEventListener('footerLoaded', initializeBusinessHours);
});

function checkForFooter() {
    // If footer is already loaded when DOMContentLoaded fires
    if (document.getElementById('openStatus')) {
        initializeBusinessHours();
    }
}

function initializeBusinessHours() {
    const openStatus = document.getElementById('openStatus');
    
    if (!openStatus) {
        console.error('openStatus element not found');
        return;
    }
    
    function checkBusinessHours() {
        const now = new Date();
        const day = now.getDay(); // 0 (Sun) to 6 (Sat)
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Convert current time to minutes since midnight
        const currentTime = hours * 60 + minutes;
        
        // Business hours in minutes since midnight (8:30 AM to 5:30 PM)
        const openTime = 8 * 60 + 30;
        const closeTime = 17 * 60 + 30;
        
        // Check if it's a weekday (Monday=1 to Saturday=6) and within business hours
        const isOpen = (day >= 1 && day <= 6) && 
                      (currentTime >= openTime && currentTime < closeTime);
        
        // Update the status display
        openStatus.textContent = isOpen ? "(Open)" : "(Closed)";
        openStatus.style.color = isOpen ? "#4CAF50" : "#F44336"; // Green/Red colors
    }
    
    // Helper function for debugging
    function getDayName(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    }
    
    // Check immediately
    checkBusinessHours();
    
    // Update every minute to handle changes
    const intervalId = setInterval(checkBusinessHours, 60000);
    
    // Clean up interval when page unloads
    window.addEventListener('beforeunload', function() {
        clearInterval(intervalId);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const POSTS_KEY = 'compass_aeped_posts';
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display all posts
    displayAllPosts(posts);
    
    // Display featured posts (latest 3)
    postSlideshow(posts.slice(0, 3));
            
    // Initialize all slideshows
    initSlideshows();
});

function postSlideshow(posts) {
    const container = document.getElementById('featuredPosts');
    if (container) container.innerHTML = '';
    
    // Create slideshow container
    const slideshow = document.createElement('div');
    slideshow.className = 'preview-slideshow';
    
    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'slideshow-controls';
    
    // Add posts as slides
    posts.forEach((post, index) => {
        const postCard = document.createElement('div');
        postCard.className = 'preview-card';
        
        postCard.innerHTML = `
            <div class="preview-card-bg" style="background-image: url('${post.mainImage || post.image || 'images/image-placeholder.jpg'}')"></div>
            <div class="preview-card-content">
                <span class="post-type ${post.type}">${post.type === 'news' ? 'News' : 'Event'}</span>
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span><i class="far fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    ${post.location ? `<span><i class="fas fa-map-marker-alt"></i> ${post.location}</span>` : ''}
                </div>
            </div>
        `;
        
        // Make the card clickable
        postCard.addEventListener('click', () => {
            document.getElementById(`post-${post.id}`)?.scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        slideshow.appendChild(postCard);
        
        // Add control dot
        const dot = document.createElement('div');
        dot.className = 'slide-dot';
        dot.dataset.index = index;
        controls.appendChild(dot);
    });
    
    if (container) {
        container.appendChild(slideshow);
        container.appendChild(controls);
    }
    
    // Auto-rotate slides
    let currentSlide = 0;
    const slideCount = posts.length;
    const dots = document.querySelectorAll('.slide-dot');
    
    function updateSlide() {
        slideshow.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Set first slide as active
    dots[0]?.classList.add('active');
    
    // Auto-rotation
    let rotationInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlide();
    }, 5000); // Change slide every 5 seconds
    
    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            currentSlide = parseInt(dot.dataset.index);
            updateSlide();
            // Reset timer when manually navigating
            clearInterval(rotationInterval);
        });
    });
    
    // Pause on hover
    if (container){
        container.addEventListener('mouseenter', () => {
            clearInterval(rotationInterval);
        });
        
        container.addEventListener('mouseleave', () => {
            rotationInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % slideCount;
                updateSlide();
            }, 5000);
        });
    }
}

function displayAllPosts(posts) {
    const container = document.getElementById('allPosts');
    // Safely clear only if elements exist
    if (container) container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts">No posts available yet.</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-detail';
        postElement.id = `post-${post.id}`;
        
        // Get all images for this post
        const images = post.images || [post.image || 'images/image-placeholder.jpg'];
        
        // Generate slideshow HTML
        const slideshowHTML = images.map((img, index) => `
            <img src="${img}" alt="${post.title} - Image ${index + 1}" 
                 class="main-image-slide ${index === 0 ? 'active' : ''}" 
                 data-index="${index}">
        `).join('');
        
        // Generate dots HTML if multiple images
        const dotsHTML = images.length > 1 ? images.map((_, index) => `
            <div class="slide-dot ${index === 0 ? 'active' : ''}" 
                 data-index="${index}"></div>
        `).join('') : '';
        
        postElement.innerHTML = `
            <div class="post-header">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta-detail">
                    <span class="post-type ${post.type}">${post.type === 'news' ? 'News' : 'Event'}</span>
                    <span><i class="far fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    ${post.location ? `<span><i class="fas fa-map-marker-alt"></i> ${post.location}</span>` : ''}
                </div>
            </div>
            
            <div class="image-gallery">
                <div class="main-image-container" data-post-id="${post.id}">
                    ${slideshowHTML}
                    ${images.length > 1 ? `
                    <div class="gallery-controls">
                        <div class="slide-dots">
                            ${dotsHTML}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="post-content">
                <p>${post.description}</p>
            </div>
            
            ${post.location ? `
            <div class="post-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${post.location}</span>
            </div>
            ` : ''}
        `;
        
        if (container) container.appendChild(postElement);
    });
}

function initSlideshows() {
    document.querySelectorAll('.main-image-container').forEach(container => {
        const slides = container.querySelectorAll('.main-image-slide');
        if (slides.length <= 1) return;
        
        const dots = container.querySelectorAll('.slide-dot');
        let currentIndex = 0;
        let intervalId;
        let rotationInterval = 5000; // 5 seconds
        
        const showSlide = (index) => {
            // Handle wrap-around
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            
            // Update slides
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            
            // Update dots
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index]?.classList.add('active');
            
            currentIndex = index;
        };
        
        // Auto-rotation function
        const startRotation = () => {
            intervalId = setInterval(() => {
                showSlide(currentIndex + 1);
            }, rotationInterval);
        };
        
        // Start auto-rotation
        startRotation();
        
        // Pause on hover
        container.addEventListener('mouseenter', () => {
            clearInterval(intervalId);
        });
        
        container.addEventListener('mouseleave', () => {
            startRotation();
        });
        
        // Dot navigation
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(dot.dataset.index);
                clearInterval(intervalId);
                showSlide(index);
                startRotation();
            });
        });
        
        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            clearInterval(intervalId);
            if (touchStartX - touchEndX > 50) {
                // Swipe left - next
                showSlide(currentIndex + 1);
            } else if (touchEndX - touchStartX > 50) {
                // Swipe right - previous
                showSlide(currentIndex - 1);
            }
            startRotation();
        };
    });
}


// Slideshow functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.welcome-slide');
    const navButtons = document.querySelectorAll('.slide-nav-btn');
    let currentSlide = 0;
    let slideInterval;
    let slideDuration = 6000; // 6 seconds per slide
    
    function showSlide(index) {
        // Reset all slides
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        
        // Update nav buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Set new current slide
        currentSlide = (index + slides.length) % slides.length;
        if (slides.length > 0) {
            slides[currentSlide].classList.add('active');
            navButtons[currentSlide].classList.add('active');
        
            // Set previous slide for transition effect
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            slides[prevIndex].classList.add('prev');
        }
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Start autoplay
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    // Pause on hover
    const slideshow = document.querySelector('.slideshow-container');
    if (slideInterval) {
        slideshow.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshow.addEventListener('mouseleave', startSlideShow);
    }
    
    // Navigation buttons
    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(index);
            startSlideShow();
        });
    });
    
    // Initialize
    showSlide(0);
    startSlideShow();
});

document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.testimonials-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.previous');
    const nextBtn = document.querySelector('.next');
    let currentPosition = 0;
    let visibleCards = 3;
    let cardWidth = 0;

    // Calculate the width of each card including margins
    function calculateCardWidth() {
        if (cards.length === 0) return 0;
        
        const cardStyle = window.getComputedStyle(cards[currentPosition]);
        const margin = parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
        return cards[0].offsetWidth + margin;
    }

    // Update the number of visible cards based on screen size
    function updateVisibleCards() {
        if (window.innerWidth <= 768) {
            visibleCards = 1;
        } else if (window.innerWidth <= 1080) {
            visibleCards = 2;
        } else {
            visibleCards = 3;
        }
        cardWidth = calculateCardWidth();
    }

    // Update the carousel position
    function updateCarousel() {
        if (!track) return;
        
        const translateValue = -currentPosition * cardWidth;
        track.style.transform = `translateX(${translateValue}px)`;
        
        // Update button states
        if (prevBtn) prevBtn.disabled = currentPosition <= 0;
        if (nextBtn) nextBtn.disabled = currentPosition >= cards.length - visibleCards;
    }

    // Go to previous slide
    function prevSlide() {
        console.log('Prev clicked - Before:', visibleCards, 'cardWidth:', cardWidth);
        if (currentPosition > 0) {
            currentPosition--;
            updateCarousel();
        }
    }

    // Go to next slide
    function nextSlide() {
        console.log('next clicked - Before:', visibleCards, 'cardWidth:', cardWidth);
        if (currentPosition < cards.length - visibleCards) {
            currentPosition++;
            updateCarousel();
        }
    }

    // Initialize the carousel
    function initCarousel() {
        updateVisibleCards();
        updateCarousel();
        
        // Add event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        window.addEventListener('resize', function() {
            const oldVisibleCards = visibleCards;
            updateVisibleCards();
            
            // Only update if visible cards changed
            if (visibleCards !== oldVisibleCards) {
                currentPosition = Math.min(currentPosition, cards.length - visibleCards);
                updateCarousel();
            }
        });
    }

    // Start the carousel
    initCarousel();
});