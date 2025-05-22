// main-scripts.js

// Counter Animation Function
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const animationDuration = 2000;
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
              dropdownBtn.style.backgroundImage = `url('${user.profileImage}')`;
              dropdownBtn.style.backgroundSize = "cover";
              dropdownProfileIcon.innerHTML = `<img src="${user.profileImage}" alt="Profile" class="profile-image">`;
          } else {
              const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
              dropdownBtn.textContent = initial;
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
    newsContainer.innerHTML = '';
    eventsContainer.innerHTML = '';
    
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
            newsContainer.appendChild(postElement);
        });
    } else {
        newsContainer.innerHTML = '<p class="no-posts">No news articles found.</p>';
    }
    
    // Handle event posts
    if (eventPosts.length > 0) {
        eventPosts.forEach(post => {
            const postElement = createPostElement(post);
            addPostNavigation(postElement, post.id);
            eventsContainer.appendChild(postElement);
        });
    } else {
        eventsContainer.innerHTML = '<p class="no-posts">No upcoming events found.</p>';
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
        
        displayFeaturedPosts(posts.slice(0, 3));
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
    const displayImage = post.mainImage || post.image || 'https://via.placeholder.com/600x400';
    
    if (post.type === 'news') {
        const newsDate = new Date(post.date);
        const localDate = newsDate.toLocaleDateString();
        element.innerHTML = `
            <img src="${displayImage}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${post.title}</h3>
                <div class="card-meta">
                    <span class="card-date">${localDate}</span>
                    <span class="card-time-ago">• ${timeAgo}</span>
                </div>
                <p class="card-excerpt">${post.description}</p>
                <a href="pages/news-events.html#post-${post.id}" class="read-more">Read More →</a>
            </div>
        `;
    } else {
        // For events
        const eventDate = new Date(post.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('default', { month: 'short' });
        
        element.innerHTML = `
            <img src="${displayImage}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <div class="event-details">
                    <div class="event-date">
                        <span class="event-day">${day}</span>
                        <span class="event-month">${month}</span>
                    </div>
                    <div class="event-info">
                        <h3 class="card-title">${post.title}</h3>
                        <div class="event-location-container">
                            <div class="location-pin">📍 </div>
                            <div class="event-location"> ${post.location || 'Location not specified'}</div>
                        </div>
                        <div class="card-meta">
                            <span class="card-time-ago">• ${timeAgo}</span>
                        </div>
                    </div>
                </div>
                <p class="card-excerpt">${post.description}</p>
                <a href="pages/news-events.html#post-${post.id}" class="read-more">Learn More →</a>
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
        
        // For debugging (view in browser console)
        console.log(`Business hours check: 
            Day ${day} (${getDayName(day)}), 
            Time ${hours}:${minutes < 10 ? '0' + minutes : minutes}, 
            Status: ${isOpen ? 'OPEN' : 'CLOSED'}`);
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
    
    // Display featured posts (latest 3)
    displayFeaturedPosts(posts.slice(0, 3));
    
    // Display all posts
    displayAllPosts(posts);
            
    // Initialize all slideshows
    initSlideshows();
});

function displayFeaturedPosts(posts) {
    const container = document.getElementById('featuredPosts');
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'preview-card';
        
        postCard.innerHTML = `
            <div class="preview-card-bg" style="background-image: url('${post.mainImage || post.image || 'https://via.placeholder.com/600x400'}')"></div>
            <div class="preview-card-content">
                <span class="post-type ${post.type}">${post.type === 'news' ? 'News' : 'Event'}</span>
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                    ${post.location ? `<span><i class="fas fa-map-marker-alt"></i> ${post.location}</span>` : ''}
                </div>
            </div>
        `;
        
        // Make the card clickable to scroll to the full post
        postCard.addEventListener('click', () => {
            document.getElementById(`post-${post.id}`).scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        container.appendChild(postCard);
    });
}
        
function displayAllPosts(posts) {
    const container = document.getElementById('allPosts');
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts available yet.</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-detail';
        postElement.id = `post-${post.id}`;
        
        // Get all images for this post
        const images = post.images || [post.image || 'https://via.placeholder.com/600x400'];
        
        // Generate slideshow HTML if multiple images exist
        let slideshowHTML = '';
        let dotsHTML = '';
        
        if (images.length > 1) {
            slideshowHTML = images.map((img, index) => `
                <img src="${img}" alt="${post.title} - Image ${index + 1}" 
                        class="main-image-slide ${index === 0 ? 'active' : ''}" 
                        data-post="${post.id}" 
                        data-index="${index}">
            `).join('');
            
            dotsHTML = images.map((_, index) => `
                <div class="dot ${index === 0 ? 'active' : ''}" 
                        data-post="${post.id}" 
                        data-index="${index}"></div>
            `).join('');
        } else {
            slideshowHTML = `
                <img src="${images[0]}" alt="${post.title}" class="main-image-slide active">
            `;
        }
        
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
                <div class="main-image-container">
                    ${slideshowHTML}
                    
                    ${images.length > 1 ? `
                    <div class="gallery-nav">
                        <button class="gallery-nav-btn prev-btn" data-post="${post.id}">
                            <i class="material-icons">chevron_left</i>
                        </button>
                        <button class="gallery-nav-btn next-btn" data-post="${post.id}">
                            <i class="material-icons">chevron_right</i>
                        </button>
                    </div>
                    ` : ''}
                </div>
                
                ${images.length > 1 ? `
                <div class="gallery-controls">
                    <div class="gallery-dots">
                        ${dotsHTML}
                    </div>
                </div>
                ` : ''}
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
        
        container.appendChild(postElement);
    });
}

function initSlideshows() {
    // Initialize all slideshows with auto-rotation
    document.querySelectorAll('.main-image-container').forEach(container => {
        const postId = container.querySelector('.main-image-slide')?.dataset.post;
        if (!postId) return;
        
        const slides = container.querySelectorAll('.main-image-slide');
        if (slides.length <= 1) return;
        
        // Auto-rotation variables
        let currentIndex = 0;
        let intervalId;
        const rotationInterval = 5000; // 5 seconds
        
        // Function to show specific slide
        const showSlide = (index) => {
            // Wrap around if needed
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;
            
            // Update slides
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            
            // Update dots
            const dots = document.querySelectorAll(`.dot[data-post="${postId}"]`);
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
        
        // Navigation buttons
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                showSlide(currentIndex - 1);
                startRotation();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                showSlide(currentIndex + 1);
                startRotation();
            });
        }
        
        // Dot navigation
        document.querySelectorAll(`.dot[data-post="${postId}"]`).forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                clearInterval(intervalId);
                showSlide(index);
                startRotation();
            });
        });
    });
}