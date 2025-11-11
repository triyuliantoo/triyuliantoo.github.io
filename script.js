document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.getElementById('drawerMenu');
  const closeDrawerButton = document.getElementById('closeDrawer');
  const overlay = document.getElementById('overlay');
  const backToTop = document.getElementById('backToTop');
  const themeToggle = document.getElementById('themeToggle');
  const header = document.querySelector('header');

  async function loadHtmlPartial(url, containerId) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const text = await response.text();
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = text;
      }
    } catch (error) {
      console.error(`Error loading partial ${url}:`, error);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat bagian ini.</p>`;
      }
    }
  }

  async function loadAllContent() {
    document.body.classList.add('loading');
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const loadPromises = [
      loadHtmlPartial('_aboutMe.html', 'aboutMe-container'),
      loadHtmlPartial('_workHistory.html', 'workHistory-container'),
      loadHtmlPartial('_portfolio.html', 'portfolio-container')
    ];

    await Promise.all(loadPromises);

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
  }

  loadAllContent();

  function toggleHeader() {
    header.classList.add('scrolled');
  }

  window.addEventListener('scroll', toggleHeader);
  document.getElementById('menuToggle').addEventListener('click', () => {
    drawer.classList.toggle('open');
    overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
    document.body.classList.toggle('drawer-open', drawer.classList.contains('open'));
  });

  closeDrawerButton.addEventListener('click', () => {
    drawer.classList.remove('open');
I    overlay.style.display = 'none';
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

  toggleHeader();

  window.addEventListener('scroll', function () {
    if (window.scrollY > 200) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  });

  window.showModal = function (id) {
    var modal = document.getElementById('portfolioModal');
    var content = document.getElementById('modalContent');
    modal.style.display = 'block';
    content.innerHTML = 'Project details for Project ' + id;
  };
  window.closeModal = function () {
    document.getElementById('portfolioModal').style.display = 'none';
  };
  window.onclick = function (event) {
    var modal = document.getElementById('portfolioModal');
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});