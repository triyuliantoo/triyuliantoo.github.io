document.addEventListener('DOMContentLoaded', function () {
    const drawer = document.getElementById('drawerMenu');
    const closeDrawerButton = document.getElementById('closeDrawer');
    const overlay = document.getElementById('overlay');
    const backToTop = document.getElementById('backToTop');
    const themeToggle = document.getElementById('themeToggle');
    const header = document.querySelector('header');

    // Function to show or hide the header based on scroll position
    function toggleHeader() {
        header.classList.add('scrolled');
    }

    // Event listeners
    window.addEventListener('scroll', toggleHeader);
    document.getElementById('menuToggle').addEventListener('click', () => {
        drawer.classList.toggle('open');
        overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
        overlay.style.display = 'none';
        document.body.classList.toggle('drawer-open', drawer.classList.contains('open'));
    });

    closeDrawerButton.addEventListener('click', () => {
        drawer.classList.remove('open');
        overlay.style.display = 'none';
        document.body.classList.remove('drawer-open');
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize header state
    toggleHeader();


    // Wait for 3 seconds before hiding the loading text and showing content
    setTimeout(function() {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.style.display = 'none';
        }
        
        // Fade in the header and main content
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        if (header && main) {
            header.style.opacity = 1;
            main.style.opacity = 1;
        }
    }, 3000);

});
