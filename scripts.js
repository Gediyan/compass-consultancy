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


  // User data - in a real app, this would come from your authentication system
let currentUser = null;

// Mock function to check if user is logged in
function checkAuth() {
    // In a real app, you would check your authentication state here
    // For demo purposes, we'll use localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
    updateUI();
}

// Function to update UI based on auth state
function updateUI() {
    const profileIcon = document.getElementById('profileIcon');
    const drawerProfileIcon = document.getElementById('drawerProfileIcon');
    const drawerUserName = document.getElementById('drawerUserName');
    const drawerUserEmail = document.getElementById('drawerUserEmail');
    const accountAction = document.getElementById('accountAction');
    
    if (currentUser) {
        // User is logged in
        // Set profile icon
        if (currentUser.profileImage) {
            profileIcon.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile">`;
            drawerProfileIcon.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile">`;
        } else {
            const initial = currentUser.name.charAt(0).toUpperCase();
            profileIcon.textContent = initial;
            drawerProfileIcon.textContent = initial;
        }
        
        // Set user info
        drawerUserName.textContent = currentUser.name;
        drawerUserEmail.textContent = currentUser.email;
        
        // Update account action
        accountAction.innerHTML = '<i class="material-icons">exit_to_app</i> Sign Out';
        accountAction.onclick = signOut;
    } else {
        // User is not logged in
        profileIcon.textContent = '?';
        drawerProfileIcon.textContent = '?';
        drawerUserName.textContent = 'Guest';
        drawerUserEmail.textContent = '';
        
        // Update account action
        accountAction.innerHTML = '<i class="material-icons">account_circle</i> Sign In';
        accountAction.onclick = goToSignIn;
    }
}

// Navigation drawer functionality
document.getElementById('profileIcon').addEventListener('click', function() {
    document.getElementById('navigationDrawer').classList.add('open');
    document.getElementById('drawerOverlay').style.display = 'block';
});

document.getElementById('drawerOverlay').addEventListener('click', function() {
    document.getElementById('navigationDrawer').classList.remove('open');
    this.style.display = 'none';
});

// Auth related functions
function goToSignIn() {
    // Redirect to sign in page
    window.location.href = '/signin.html'; // Update with your sign in page URL
}

function signOut() {
    // Clear user data
    localStorage.removeItem('user');
    currentUser = null;
    updateUI();
    // Close drawer
    document.getElementById('navigationDrawer').classList.remove('open');
    document.getElementById('drawerOverlay').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // For demo purposes - you can remove this in production
    // This simulates a user signing in
    if (window.location.search.includes('demoLogin=1')) {
        const demoUser = {
            name: "John Doe",
            email: "john@example.com",
            profileImage: "" // You can set a URL here if you want a profile image
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        currentUser = demoUser;
        updateUI();
    }
});