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
                          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Events sorted chronologically
    
    // Handle news posts
    if (newsPosts.length > 0) {
        newsPosts.forEach(post => {
            newsContainer.appendChild(createPostElement(post));
        });
    } else {
        newsContainer.innerHTML = '<p class="no-posts">No news articles found.</p>';
    }
    
    // Handle event posts
    if (eventPosts.length > 0) {
        eventPosts.forEach(post => {
            eventsContainer.appendChild(createPostElement(post));
        });
    } else {
        eventsContainer.innerHTML = '<p class="no-posts">No upcoming events found.</p>';
    }
}

// Helper function to create post element
function createPostElement(post) {
    const element = document.createElement('div');
    element.className = post.type === 'news' ? 'news-card' : 'event-card';

    // Calculate time ago
    const postDate = new Date(post.createdAt || post.date); // Fallback to post.date if createdAt doesn't exist
    const timeAgo = getTimeAgo(postDate);
    
    if (post.type === 'news') {
        const newsDate = new Date(post.date);
        const localDate = newsDate.toLocaleDateString();
        element.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${post.title}</h3>
                <div class="card-meta">
                    <span class="card-date">${localDate}</span>
                    <span class="card-time-ago">• ${timeAgo}</span>
                </div>
                <p class="card-excerpt">${post.description}</p>
                <a href="#" class="read-more">Read More →</a>
            </div>
        `;
    } else {
        // For events
        const eventDate = new Date(post.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('default', { month: 'short' });
        
        element.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="card-image">
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
                <a href="#" class="read-more">Learn More →</a>
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