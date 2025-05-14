// scripts.js

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

  // Read More/Less Function
  function initMobileMenuToggle() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    toggleButton.addEventListener('click', function() {
      navList.classList.toggle('active');
    });
    
    // Close menu when clicking on links (optional)
    document.querySelectorAll('.nav-list a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('active');
      });
    });
  }
  
  // Initialize all functions when DOM loads
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenuToggle();
    initCounterAnimation();
    initReadMore();
    // Add more initializers here
  });

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropdownBtn = document.getElementById('profileDropdownBtn');
    const dropdown = document.getElementById('profileDropdown');
    const accountAction = document.getElementById('accountAction');
    
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
        updateProfileDropdown(null);
    }
    
    // Update dropdown with user data
    function updateProfileDropdown(user) {
        const profileIcon = document.getElementById('profileIcon');
        const dropdownProfileIcon = document.getElementById('dropdownProfileIcon');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');
        
        if (user) {
            // User is logged in
            if (user.profileImage) {
                profileIcon.innerHTML = `<img src="${user.profileImage}" alt="Profile" class="profile-image">`;
                dropdownProfileIcon.innerHTML = `<img src="${user.profileImage}" alt="Profile" class="profile-image" width="40px" height="40px" border-radius="50%">`;
            } else {
                const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                profileIcon.textContent = initial;
                dropdownProfileIcon.textContent = initial;
            }
            
            dropdownUserName.textContent = user.name || 'User';
            dropdownUserEmail.textContent = user.email || '';
            
            accountAction.innerHTML = '<i class="material-icons">exit_to_app</i> Sign Out';
            accountAction.onclick = signOut;
        } else {
            // Guest state
            profileIcon.textContent = 'G';
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
    function goToSignIn(e) {
        e.preventDefault();
        window.location.href = 'pages/signin.html';
    }
    
    function signOut(e) {
        e.preventDefault();
        localStorage.removeItem('compass_aeped_session');
        updateProfileDropdown(null);
        dropdown.classList.remove('show');
        // Optional: Show a notification
        showNotification('You have been signed out');
    }
    
    function showNotification(message) {
        // Implement your notification system here
        console.log(message);
        alert(message); // Temporary for demo
    }
    
    // Initialize
    checkAuth();
});