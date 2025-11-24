document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.getElementById('drawerMenu');
  const closeDrawerButton = document.getElementById('closeDrawer');
  const overlay = document.getElementById('overlay');
  const backToTop = document.getElementById('backToTop');
  const themeToggle = document.getElementById('themeToggle');
  const header = document.querySelector('header');

  document.body.classList.add('loading');

  setTimeout(function () {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    document.body.classList.remove('loading');

    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (header && main) {
      header.style.opacity = 1;
      main.style.opacity = 1;
    }
  }, 3000);

  function toggleHeader() {
    if (header) {
      header.classList.add('scrolled');
    }
  }

  window.addEventListener('scroll', toggleHeader);

  if (document.getElementById('menuToggle')) {
    document.getElementById('menuToggle').addEventListener('click', () => {
      drawer.classList.toggle('open');
      overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
      document.body.classList.toggle('drawer-open', drawer.classList.contains('open'));
    });
  }

  if (closeDrawerButton) {
    closeDrawerButton.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.style.display = 'none';
      document.body.classList.remove('drawer-open');
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
      }
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  toggleHeader();

  window.addEventListener('scroll', function () {
    if (window.scrollY > 200) {
      if (backToTop) backToTop.style.display = 'block';
    } else {
      if (backToTop) backToTop.style.display = 'none';
    }
  });

  window.showModal = function (id) {
    var modal = document.getElementById('portfolioModal');
    var content = document.getElementById('modalContent');
    if (modal && content) {
      modal.style.display = 'block';
      content.innerHTML = 'Project details for Project ' + id;
    }
  };

  window.closeModal = function () {
    var modal = document.getElementById('portfolioModal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  window.onclick = function (event) {
    var modal = document.getElementById('portfolioModal');
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});