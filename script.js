document.addEventListener('DOMContentLoaded', function () {
    const drawer = document.getElementById('drawerMenu');
    const closeDrawerButton = document.getElementById('closeDrawer');
    const overlay = document.getElementById('overlay');
    const backToTop = document.getElementById('backToTop');
    const themeToggle = document.getElementById('themeToggle');
    const header = document.querySelector('header');

    // 1. Activate loading mode: body cannot be scrolled
    document.body.classList.add('loading');

    // 2. Loading: wait 3 seconds, then hide loading overlay and enable scroll again
    setTimeout(function() {
        // Hide/remove the loading overlay
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        // Allow scrolling again
        document.body.classList.remove('loading');

        // Fade in the header and main content
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        if (header && main) {
            header.style.opacity = 1;
            main.style.opacity = 1;
        }
    }, 3000);

    // Show the header after scroll (always visible after first scroll)
    function toggleHeader() {
        header.classList.add('scrolled');
    }

    // Event listeners for navigation drawer
    window.addEventListener('scroll', toggleHeader);
    document.getElementById('menuToggle').addEventListener('click', () => {
        drawer.classList.toggle('open');
        overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
        document.body.classList.toggle('drawer-open', drawer.classList.contains('open'));
    });

    closeDrawerButton.addEventListener('click', () => {
        drawer.classList.remove('open');
        overlay.style.display = 'none';
        document.body.classList.remove('drawer-open');
    });

    // Theme toggling (dark/light)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Scroll to top button functionality
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize header state
    toggleHeader();

    // Show/hide backToTop button on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    // Portfolio Modal Logic
    window.showModal = function(id) {
        var modal = document.getElementById('portfolioModal');
        var content = document.getElementById('modalContent');
        modal.style.display = 'block';
        content.innerHTML = 'Project details for Project ' + id;
    };
    window.closeModal = function() {
        document.getElementById('portfolioModal').style.display = 'none';
    };
    // Close modal if clicking outside modal content
    window.onclick = function(event) {
        var modal = document.getElementById('portfolioModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
