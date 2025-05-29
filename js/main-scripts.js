// main-scripts.js

// Sticky Header with Background Change

const header = document.querySelector('.main-header');

// For slideshow/hero preview
const createSectionObserver = (section, className) => {
  if (!section) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        header.classList.toggle(className, !entry.isIntersecting);
      });
    },
    { 
      rootMargin: '0px 0px 0px 0px',
      threshold: 0
    }
  );
  observer.observe(section);
};

createSectionObserver(document.querySelector('.slideshow-section'), 'scrolled');
createSectionObserver(document.querySelector('.hero-preview'), 'scrolled');
createSectionObserver(document.querySelector('.services-section'));

// For testimonial section
const serviceSecttionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      header.style.opacity = !entry.isIntersecting ? '1' : '0';
    });
  },
  { 
    rootMargin: '0px 0px 0px 0px',
    threshold: 0.05
  }
);

if (document.querySelector('.services-section')) {
  serviceSecttionObserver.observe(document.querySelector('.services-section'));
}
// For testimonial section
const testimonialObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      header.style.opacity = !entry.isIntersecting ? '1' : '0';
    });
  },
  { 
    rootMargin: '0px 0px 0px 0px',
    threshold: [1, 0.5]
  }
);

if (document.querySelector('.testimonials-carousel')) {
  testimonialObserver.observe(document.querySelector('.testimonials-carousel'));
}

// Automatic Text Slideshow
let textSlideIndex = 0;
const textSlides = document.querySelectorAll('.text-slide');

function showTextSlides() {

    if (!textSlides) return;
    if (textSlides.length === 0) return;
    // Hide all slides
    textSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Move to next slide
    textSlideIndex++;
    if (textSlideIndex > textSlides.length) {
        textSlideIndex = 1;
    }
    
    // Show current slide
    textSlides[textSlideIndex-1].classList.add('active');
    
    // Change slide every 5 seconds
    setTimeout(showTextSlides, 5000);
}

// Manual Image Slideshow
let imageSlideIndex = 1;
showSlides(imageSlideIndex);

function plusSlides(n) {
  showSlides(imageSlideIndex += n);
}

function currentSlide(n) {
  showSlides(imageSlideIndex = n);
}

function showSlides(n) {
  let i;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  if (!slides) return;
  if (slides.length === 0) return;
  
  if (n > slides.length) {
    imageSlideIndex = 1;
  }    
  if (n < 1) {
    imageSlideIndex = slides.length;
  }
  
  // Hide all slides
  slides.forEach(slide => {
    slide.style.display = "none";  
  });
  
  // Remove active class from dots
  dots.forEach(dot => {
    dot.classList.remove('active-dot');
  });
  
  // Show current slide
  slides[imageSlideIndex-1].style.display = "block";  
  dots[imageSlideIndex-1].classList.add('active-dot');
}

// Start both slideshows
document.addEventListener('DOMContentLoaded', function() {
  showTextSlides();
  showSlides(imageSlideIndex);
});

// Back to Top Button
document.getElementById('back-to-top').addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Show/hide button based on scroll position
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  const backToTopButton = document.getElementById("back-to-top");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}

// Smooth scroll to top when clicked
document.getElementById("back-to-top").addEventListener("click", function() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

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


document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const featuredPosts = document.querySelector('.preview-card');
    const slideshow = document.querySelector('.slideshow-section');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Initialize theme and icons
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        sunIcon.style.display = 'inline-block';
        moonIcon.style.display = 'none';
        if (slideshow) {
            slideshow.style.filter = 'brightness(0.7)'; // Lower brightness for slideshow
        } else if (featuredPosts){
                featuredPosts.style.filter = 'brightness(0.1)'; // Lower brightness for slideshow
            }
        
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline-block';
        if (slideshow) {
            slideshow.style.filter = 'brightness(1)'; // Upper brightness for slideshow
        } else if (featuredPosts){
                featuredPosts.style.filter = 'brightness(1)'; // Upper brightness for slideshow
            }
    }
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Toggle icon visibility
        if (isDark) {
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
            sunIcon.style.background = 'none'
            if (slideshow) {
                slideshow.style.filter = 'brightness(0.7)'; // Lower brightness for slideshow
            } else if (featuredPosts){
                featuredPosts.style.filter = 'brightness(0.1)'; // Lower brightness for slideshow
            }
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
            if (slideshow) {
                slideshow.style.filter = 'brightness(1)'; // Upper brightness for slideshow
            } else if (featuredPosts){
                featuredPosts.style.filter = 'brightness(1)'; // Upper brightness for slideshow
            }
        }
    });

    // Add background to moon icon when displayed
    moonIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    moonIcon.style.borderRadius = '50%';
    moonIcon.style.padding = '4px';
    moonIcon.style.transition = 'background-color 0.3s ease';

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
});

// Mobile navigation menu toggle functionality

document.addEventListener('DOMContentLoaded', function() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    document.body.appendChild(overlay);

    // Create mobile nav popup container
    const mobileNavPopup = document.createElement('div');
    mobileNavPopup.id = 'mobileNavPopup';
    mobileNavPopup.className = 'mobile-nav-popup';
    document.body.appendChild(mobileNavPopup);

    // Create popup header
    const popupHeader = document.createElement('div');
    popupHeader.className = 'popup-header';
    mobileNavPopup.appendChild(popupHeader);

    // Create logo in header
    const popupLogo = document.createElement('img');
    let imagesPath = '';
    if (window.location.pathname.includes('/pages/')) {
        imagesPath = '../images/';
      } else {
        imagesPath = 'images/';
      }

    popupLogo.src = `${imagesPath}logo-700px-01.png`;
    popupLogo.alt = 'Company Logo';
    popupLogo.className = 'popup-logo';
    popupHeader.appendChild(popupLogo);

    // Create close button
    const closePopupBtn = document.createElement('button');
    closePopupBtn.id = 'closePopupBtn';
    closePopupBtn.className = 'close-popup';
    closePopupBtn.innerHTML = '&times;';
    popupHeader.appendChild(closePopupBtn);

    // Create popup content container
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    mobileNavPopup.appendChild(popupContent);

    // Create navigation
    const popupNav = document.createElement('nav');
    popupNav.className = 'popup-nav';
    popupContent.appendChild(popupNav);

    let path = '';
    let indexPath = '';
    if (window.location.pathname.includes('/pages/')) {
        path = '';
        indexPath = '../index.html'
      } else {
        path = 'pages/';
        indexPath = 'index.html';
      }

    // Navigation items data
    const navItems = [
        { href: `${indexPath}`, icon: '<i class="fas fa-home"></i>', text: 'Home' },
        { href: `${path}news-events.html`, icon: '<span class="material-icons">newspaper</span>', text: 'News & Events' },
        { href: `${path}about.html`, icon: '<i class="fas fa-building"></i>', text: 'About' },
        { href: `${path}services.html`, icon: '<i class="fas fa-tools"></i>', text: 'Services' },
        { href: `${path}projects.html`, icon: '<span class="material-icons">work</span>', text: 'Projects' },
        { href: `${path}team.html`, icon: '<i class="fas fa-user-tie"></i>', text: 'Team' },
        { href: `${path}contact.html`, icon: '<span class="material-icons">contact_mail</span>', text: 'Contact Us' }
    ];
    console.log('indexPath:', indexPath, 'path:', path)

  // Create navigation items
  navItems.forEach(item => {
    const navItem = document.createElement('a');
    navItem.href = item.href;
    navItem.className = 'nav-item';
    navItem.innerHTML = `
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-text">${item.text}</span>
    `;
    popupNav.appendChild(navItem);
  });

  // Create popup footer
  const popupFooter = document.createElement('div');
  popupFooter.className = 'popup-footer';
  popupContent.appendChild(popupFooter);

  // Create contact info
  const contactInfo = document.createElement('div');
  contactInfo.className = 'popup-contact-info';
  contactInfo.innerHTML = `
    <p><i class="fas fa-phone"></i> +1 (123) 456-7890</p>
    <p><i class="fas fa-envelope"></i> info@compassaeped.com</p>
  `;
  popupFooter.appendChild(contactInfo);

  // Create social links
  const socialLinks = document.createElement('div');
  socialLinks.className = 'popup-social-links';
  socialLinks.innerHTML = `
    <a href="#"><i class="fab fa-facebook"></i></a>
    <a href="#"><i class="fab fa-twitter"></i></a>
    <a href="#"><i class="fab fa-linkedin"></i></a>
  `;
  popupFooter.appendChild(socialLinks);

  // Function to open popup
  function openPopup() {
    mobileNavPopup.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Function to close popup
  function closePopup() {
    mobileNavPopup.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Event listeners
  document.getElementById('logoIcon').addEventListener('click', function(e) {
    e.preventDefault();
    openPopup();
  });

  closePopupBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // Close when clicking on nav items
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', closePopup);
  });

  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closePopup();
    }
  });

  // Responsive handling
  function handleResize() {
    if (window.innerWidth > 992) {
      closePopup();
    }
  }

  window.addEventListener('resize', handleResize);
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
    
    if (posts.length === 0 && container) {
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

const TestimonialDB = {
    // Key for localStorage
    STORAGE_KEY: 'compass_aeped_testimonials',
    
    // Get all testimonials
    getAll: function() {
        const testimonials = localStorage.getItem(this.STORAGE_KEY);
        return testimonials ? JSON.parse(testimonials) : [];
    },
}

document.addEventListener('DOMContentLoaded', function() {
    function loadTestimonials() {
        const testimonials = TestimonialDB.getAll();
        const testimonialsTrack = document.querySelector('.testimonials-track');
        
        if (testimonialsTrack && testimonials.length === 0) {
            testimonialsTrack.innerHTML = `
                <div class="empty-state">
                    <i class="material-icons">format_quote</i>
                    <p>No testimonials yet. Create your first one!</p>
                </div>
            `;
            return;
        }
        if (testimonialsTrack) {
            testimonialsTrack.innerHTML = '';
            testimonials.forEach(testimonial => {
                const testimonialItem = createTestimonialItem(testimonial);
                testimonialsTrack.appendChild(testimonialItem);
            });
        }
    }

    function createTestimonialItem(testimonial) {
        const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
        const date = new Date(testimonial.createdAt).toLocaleDateString();
        const testimonialImages = testimonial.images || [];
        
        const element = document.createElement('div');
        element.className = 'testimonial-card';
        element.dataset.id = testimonial.id;
        element.innerHTML = `
            <div class="testimonial-content">
                <div class="rating" title="${testimonial.rating} out of 5 stars">
                    <span class="star">${stars}</span>
                </div>
                <blockquote class="testimonial-quote"><p>${testimonial.quote}</p></blockquote>
            </div>
            <div class="client-info">
                <div class="client-avatar">
                    <img src="${testimonial.avatar || '../images/image-placeholder.jpg'}" 
                        alt="${testimonial.name}" 
                        class="client-avatar-image"
                        data-testimonial-id="${testimonial.id}">
                    ${testimonialImages.length > 1 ? 
                        `<span class="image-count-badge">${testimonialImages.length}</span>` : ''}
                </div>
                <div class="client-details">
                    <h3 class="client-name">${testimonial.name}</h3>
                    <p class="client-position">${testimonial.position}</p>
                    <small class="testimonial-date">${date}</small>
                </div>
            </div>
        `;
        
        // Add click handler for avatar image
        const avatarImage = element.querySelector('.client-avatar-image');
        avatarImage.addEventListener('click', () => {
            openImagePopup(testimonial);
        });
        
        return element;
    }

    function openImagePopup(testimonial) {
        const testimonialImages = testimonial.images || [];
        if (testimonialImages.length === 0) return;
        
        // Create popup overlay
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'testimonial-image-popup-overlay';
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'testimonial-image-popup';
        
        // Create main image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'popup-image-container';
        
        // Create image element
        const currentImage = document.createElement('img');
        currentImage.className = 'popup-main-image';
        currentImage.src = testimonial.avatar || testimonialImages[0];
        currentImage.alt = `${testimonial.name}'s images`;
        
        // Add navigation controls if multiple images
        if (testimonialImages.length > 1) {
            // Previous button
            const prevButton = document.createElement('button');
            prevButton.className = 'popup-nav-button popup-prev-button';
            prevButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                </svg>
            `;
            
            // Next button
            const nextButton = document.createElement('button');
            nextButton.className = 'popup-nav-button popup-next-button';
            nextButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
            `;
            
            // Image counter
            const imageCounter = document.createElement('div');
            imageCounter.className = 'popup-image-counter';
            imageCounter.textContent = `1 / ${testimonialImages.length}`;
            
            // Thumbnail strip
            const thumbnailStrip = document.createElement('div');
            thumbnailStrip.className = 'popup-thumbnail-strip';
            
            testimonialImages.forEach((img, index) => {
                const thumb = document.createElement('img');
                thumb.className = 'popup-thumbnail';
                thumb.src = img;
                thumb.alt = `Thumbnail ${index + 1}`;
                thumb.dataset.index = index;
                
                if (img === (testimonial.avatar || testimonialImages[0])) {
                    thumb.classList.add('active-thumbnail');
                }
                
                thumb.addEventListener('click', () => {
                    currentImage.src = img;
                    updateActiveThumbnail(thumbnailStrip, index);
                    imageCounter.textContent = `${index + 1} / ${testimonialImages.length}`;
                });
                
                thumbnailStrip.appendChild(thumb);
            });
            
            // Navigation functionality
            let currentIndex = testimonial.avatar ? 
                testimonialImages.indexOf(testimonial.avatar) : 0;
            if (currentIndex === -1) currentIndex = 0;
            
            const navigate = (direction) => {
                if (direction === 'prev') {
                    currentIndex = (currentIndex - 1 + testimonialImages.length) % testimonialImages.length;
                } else {
                    currentIndex = (currentIndex + 1) % testimonialImages.length;
                }
                
                currentImage.src = testimonialImages[currentIndex];
                updateActiveThumbnail(thumbnailStrip, currentIndex);
                imageCounter.textContent = `${currentIndex + 1} / ${testimonialImages.length}`;
            };
            
            prevButton.addEventListener('click', () => navigate('prev'));
            nextButton.addEventListener('click', () => navigate('next'));
            
            imageContainer.appendChild(prevButton);
            imageContainer.appendChild(currentImage);
            imageContainer.appendChild(nextButton);
            popupContent.appendChild(imageContainer);
            popupContent.appendChild(imageCounter);
            popupContent.appendChild(thumbnailStrip);
        } else {
            // Single image view
            imageContainer.appendChild(currentImage);
            popupContent.appendChild(imageContainer);
        }
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'popup-close-button';
        closeButton.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(popupOverlay);
        });
        
        popupContent.appendChild(closeButton);
        popupOverlay.appendChild(popupContent);
        
        // Close when clicking outside image
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                document.body.removeChild(popupOverlay);
            }
        });
        
        document.body.appendChild(popupOverlay);
    }

    function updateActiveThumbnail(thumbnailStrip, activeIndex) {
        const thumbnails = thumbnailStrip.querySelectorAll('.popup-thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index === activeIndex) {
                thumb.classList.add('active-thumbnail');
            } else {
                thumb.classList.remove('active-thumbnail');
            }
        });
    }

    // Load testimonials when the Home page shown
    loadTestimonials();
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
        if (prevBtn) {
            prevBtn.disabled = currentPosition <= 0;
            prevBtn.style.hover = 'none';
        }
        if (nextBtn) nextBtn.disabled = currentPosition >= cards.length - visibleCards;
    }

    // Go to previous slide
    function prevSlide() {
        if (currentPosition > 0) {
            currentPosition--;
            updateCarousel();
        }
    }

    // Go to next slide
    function nextSlide() {
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


// Database functions
const ServiceDB = {
    // Key for localStorage
    SERVICE_KEY: 'compass_service_categories',
    
    // Get all services
    getAll: function() {
        const services = localStorage.getItem(this.SERVICE_KEY);
        return services ? JSON.parse(services) : [];
    },
};

document.addEventListener('DOMContentLoaded', function() {
    // Load services immediately
    loadServicesIntoCard();

    // Intersection Observer to trigger animation
    setupIntersectionObserver();
  
    function loadServicesIntoCard() {
        const servicesCardContent = document.getElementById('servicesCard');
        if (!servicesCardContent) return;

        servicesCardContent.innerHTML = '';
        
        const categories = ServiceDB.getAll();
        
        if (categories.length === 0) {
            servicesCardContent.innerHTML = '<p>No services available yet.</p>';
            return;
        }

        const sortCategories = categories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        console.log(sortCategories);
        // Create container for all categories
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'services-card-content';
        
        sortCategories.forEach(category => {
            if (category.services && category.services.length > 0) {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'service-category';
                
                categoryElement.innerHTML = `
                    <h3 class="service-header"><i class="${category.icon}"></i> ${category.title}</h3>
                    <p class="category-description">${category.description}</p>
                `;
                
                const servicesList = document.createElement('div');
                servicesList.className = 'services-list';
                
                category.services.forEach(service => {
                    const serviceElement = document.createElement('div');
                    serviceElement.className = 'service-item';
                    serviceElement.dataset.serviceId = service.id;
                    serviceElement.dataset.categoryId = category.id;
                    
                    let imageHtml = '';
                    if (service.image && service.image.dataUrl) {
                    imageHtml = `<img src="${service.image.dataUrl}" alt="${service.title}" class="service-image-preview" id="${service.id}">`;
                    }
                    
                    let featuresHtml = '';
                    if (service.features && service.features.length > 0) {
                    featuresHtml = `
                        <ul class="service-features" id="${service.id}">
                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    `;
                    }
                    
                    serviceElement.innerHTML = `
                    ${imageHtml}
                    <h4 class="each-header" id="${service.id}">${service.title}</h4>
                    <p>${service.description}</p>
                    ${featuresHtml}
                    `;
                    
                    serviceElement.addEventListener('click', function() {
                    navigateToService(service.id, category.id);
                    });
                    
                    servicesList.appendChild(serviceElement);
                });
                
                const readMoreBtn = document.createElement('a');
                readMoreBtn.className = 'read-more-btn';
                readMoreBtn.textContent = 'Read More';
                readMoreBtn.href = `services.html#category-${category.id}`;
                
                categoryElement.appendChild(servicesList);
                categoryElement.appendChild(readMoreBtn);
                categoriesContainer.appendChild(categoryElement);
            }
        });
        
        servicesCardContent.appendChild(categoriesContainer);
    }
});

function setupIntersectionObserver() {
    const servicesCard = document.getElementById('servicesCard');
    
    if (!servicesCard) return;

    // Set initial threshold based on screen size
    let threshold = window.matchMedia('(max-width: 768px)').matches ? 0.04 : 0.07;

    // Create a simple, reliable observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Element is visible - adding visible class');
                servicesCard.style.willChange = 'opacity, transform';
                servicesCard.classList.add('visible');
                observer.unobserve(entry.target);
            }
            }
        );
        
        }, {
            rootMargin: '0px 0px 0px 0px',
            threshold: threshold,
        }
    );
    
    observer.observe(servicesCard);
}


// Global functions for navigation
function navigateToService(serviceId, categoryId) {
  window.location.href = `pages/services.html#category-${categoryId}-service-${serviceId}`;
}

function navigateToCategory(categoryId) {
  window.location.href = `pages/services.html#category-${categoryId}`;
}


document.addEventListener('DOMContentLoaded', function() {
  // Check URL hash on page load
  const hash = window.location.hash;
  
  if (hash) {
    // Check if hash contains a service ID
    const serviceMatch = hash.match(/service-([^&]+)/);
    const categoryMatch = hash.match(/category-([^&]+)/);  
    
    if (categoryMatch) {
        const categoryId = categoryMatch[1];
        const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
        console.log('hash:', categoryMatch[1], 'categoryElement:',categoryElement); 
      
      if (categoryElement) {
        // Scroll to category
        setTimeout(() => {
          categoryElement.scrollIntoView({ behavior: 'smooth' });
          
          // If there's a service ID, scroll to that service after a delay
          if (serviceMatch) {
            const serviceId = serviceMatch[1];
            setTimeout(() => {
              const serviceElement = document.querySelector(`[data-service-id="${serviceId}"]`);
              if (serviceElement) {
                serviceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Optional: highlight the service
                serviceElement.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.5)';
                setTimeout(() => {
                  serviceElement.style.boxShadow = 'none';
                }, 3000);
              }
            }, 500);
          }
        }, 100);
      }
    }
  }
});