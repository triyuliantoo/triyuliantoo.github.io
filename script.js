(() => {
  'use strict';

  const sections = [...document.querySelectorAll('.game-section')];
  const mapNodes = [...document.querySelectorAll('.map-node')];
  const prevButton = document.getElementById('prevStage');
  const nextButton = document.getElementById('nextStage');
  const stageNumber = document.getElementById('stageNumber');
  const transition = document.querySelector('.game-transition');
  const transitionLabel = document.querySelector('.transition-label');
  const bootScreen = document.querySelector('.boot-screen');
  const soundToggle = document.querySelector('.sound-toggle');
  const soundLabel = document.querySelector('.sound-label');
  const cacheRefresh = document.querySelector('.cache-refresh');
  const introCopy = document.getElementById('heroIntro');
  const introMore = document.querySelector('.intro-more');
  const introDialog = document.getElementById('introDialog');
  const introFullCopy = document.querySelector('.intro-full-copy');
  const introClose = document.querySelector('.intro-close');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const buildVersion = document.documentElement.dataset.build || 'development';
  const buildStorageKey = 'tri-profile-build-version';

  async function purgeReleaseCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
      } catch (error) {
        // Cache Storage can be unavailable in private browsing; asset versioning still applies.
      }
    }

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch (error) {
        // A stale worker should not prevent the profile itself from loading.
      }
    }
  }

  function rememberBuild() {
    try { window.localStorage.setItem(buildStorageKey, buildVersion); } catch (error) { /* Storage is optional. */ }
  }

  async function syncReleaseCache() {
    let previousBuild = null;
    try { previousBuild = window.localStorage.getItem(buildStorageKey); } catch (error) { /* Storage is optional. */ }

    if (!previousBuild) {
      rememberBuild();
      return;
    }
    if (previousBuild === buildVersion) return;

    await purgeReleaseCaches();
    rememberBuild();
    const releaseUrl = new URL(window.location.href);
    releaseUrl.searchParams.set('release', buildVersion);
    window.location.replace(releaseUrl.toString());
  }

  void syncReleaseCache();

  if (!sections.length) return;

  document.body.classList.add('js-ready');

  const stageMessages = {
    home: 'READY PLAYER ONE',
    about: 'JUMP TO PROFILE!',
    experience: 'RUN THE QUEST LOG!',
    skills: 'LOADOUT READY!',
    contact: 'QUEST CLEAR!'
  };

  let currentIndex = 0;
  let transitioning = false;
  let wheelCooldown = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let soundOn = false;
  let audioContext;
  let introReturnFocus = null;

  const indexForId = (id) => sections.findIndex((section) => section.id === id);
  const hashId = window.location.hash.replace('#', '');
  const initialIndex = indexForId(hashId);
  if (initialIndex >= 0) currentIndex = initialIndex;

  function setActiveSection(index, direction = 'forward') {
    sections.forEach((section, sectionIndex) => {
      const active = sectionIndex === index;
      section.classList.toggle('is-active', active);
      section.classList.toggle('from-back', !active && direction === 'backward');
      section.setAttribute('aria-hidden', String(!active));
      if (active) section.scrollTop = 0;
    });

    mapNodes.forEach((node, nodeIndex) => {
      const active = nodeIndex === index;
      node.classList.toggle('is-active', active);
      if (active) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });

    stageNumber.textContent = String(index + 1).padStart(2, '0');
    prevButton.disabled = index === 0;
    nextButton.disabled = index === sections.length - 1;
  }

  function updateHash(id, replace = false) {
    const url = id === 'home' ? `${window.location.pathname}${window.location.search}` : `#${id}`;
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ stage: id }, '', url);
  }

  function makeTone(frequency, duration, type = 'square', delay = 0) {
    if (!soundOn) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();

    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.035, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  function playStageSound(action, direction) {
    if (!soundOn) return;
    if (direction === 'backward') {
      makeTone(330, .08);
      makeTone(220, .11, 'square', .08);
      return;
    }
    if (action === 'shoot') {
      makeTone(880, .06, 'sawtooth');
      makeTone(440, .09, 'square', .05);
    } else if (action === 'victory') {
      makeTone(523, .1);
      makeTone(659, .1, 'square', .1);
      makeTone(784, .16, 'square', .2);
    } else {
      makeTone(294, .07);
      makeTone(440, .1, 'square', .07);
    }
  }

  function goToStage(target, options = {}) {
    const targetIndex = typeof target === 'number' ? target : indexForId(target);
    if (targetIndex < 0 || targetIndex >= sections.length || targetIndex === currentIndex || transitioning) return;

    const direction = targetIndex > currentIndex ? 'forward' : 'backward';
    const targetSection = sections[targetIndex];
    const action = targetSection.dataset.action || 'run';
    const duration = reducedMotion.matches ? 0 : 700;
    transitioning = true;

    transition.className = `game-transition is-active ${direction} action-${action}`;
    transitionLabel.textContent = direction === 'backward' ? 'REWIND STAGE!' : stageMessages[targetSection.id];
    playStageSound(action, direction);

    window.setTimeout(() => {
      currentIndex = targetIndex;
      setActiveSection(currentIndex, direction);
      if (!options.fromHistory) updateHash(targetSection.id);

      if (options.focusHeading) {
        const heading = targetSection.querySelector('h1, h2');
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      }
    }, duration ? 300 : 0);

    window.setTimeout(() => {
      transition.className = 'game-transition';
      transitioning = false;
    }, duration);
  }

  setActiveSection(currentIndex);
  updateHash(sections[currentIndex].id, true);

  function updateIntroReadMore() {
    if (!introCopy || !introMore) return;
    const hasOverflow = introCopy.scrollHeight > introCopy.clientHeight + 1;
    introMore.hidden = !hasOverflow;
    if (!hasOverflow && introDialog && !introDialog.hidden) closeIntroDialog(false);
  }

  function openIntroDialog() {
    if (!introDialog || !introMore || !introFullCopy || !introClose) return;
    introReturnFocus = document.activeElement;
    introFullCopy.textContent = introCopy.textContent.trim();
    introDialog.hidden = false;
    introMore.setAttribute('aria-expanded', 'true');
    introClose.focus({ preventScroll: true });
  }

  function closeIntroDialog(restoreFocus = true) {
    if (!introDialog || !introMore) return;
    introDialog.hidden = true;
    introMore.setAttribute('aria-expanded', 'false');
    if (restoreFocus && introReturnFocus instanceof HTMLElement) introReturnFocus.focus({ preventScroll: true });
  }

  if (introCopy && introFullCopy) introFullCopy.textContent = introCopy.textContent.trim();
  if (introMore) introMore.addEventListener('click', openIntroDialog);
  if (introClose) introClose.addEventListener('click', () => closeIntroDialog());
  if (introDialog) {
    introDialog.addEventListener('click', (event) => {
      if (event.target === introDialog) closeIntroDialog();
    });
  }

  window.requestAnimationFrame(updateIntroReadMore);
  window.addEventListener('load', updateIntroReadMore, { once: true });
  let introResizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(introResizeTimer);
    introResizeTimer = window.setTimeout(updateIntroReadMore, 120);
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-go]');
    if (!trigger) return;
    event.preventDefault();
    goToStage(trigger.dataset.go);
  });

  prevButton.addEventListener('click', () => goToStage(currentIndex - 1));
  nextButton.addEventListener('click', () => goToStage(currentIndex + 1));

  document.addEventListener('keydown', (event) => {
    if (introDialog && !introDialog.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeIntroDialog();
      }
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const typing = event.target.matches('input, textarea, select, [contenteditable="true"]');
    if (typing) return;

    if (['ArrowRight', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      goToStage(currentIndex + 1, { focusHeading: true });
    }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      goToStage(currentIndex - 1, { focusHeading: true });
    }
    if (event.key === 'Home') {
      event.preventDefault();
      goToStage(0, { focusHeading: true });
    }
    if (event.key === 'End') {
      event.preventDefault();
      goToStage(sections.length - 1, { focusHeading: true });
    }
  });

  window.addEventListener('wheel', (event) => {
    if (introDialog && !introDialog.hidden) return;
    if (wheelCooldown || transitioning || Math.abs(event.deltaY) < 24) return;
    wheelCooldown = true;
    goToStage(currentIndex + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => { wheelCooldown = false; }, 850);
  }, { passive: true });

  window.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (event) => {
    if (introDialog && !introDialog.hidden) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    const horizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const travel = horizontalSwipe ? deltaX : deltaY;
    if (Math.abs(travel) < 55) return;
    goToStage(currentIndex + (travel < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('popstate', () => {
    const id = window.location.hash.replace('#', '') || 'home';
    const historyIndex = indexForId(id);
    if (historyIndex >= 0) goToStage(historyIndex, { fromHistory: true, focusHeading: true });
  });

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.setAttribute('aria-label', soundOn ? 'Turn game sounds off' : 'Turn game sounds on');
    soundLabel.textContent = soundOn ? 'SFX ON' : 'SFX OFF';
    if (soundOn) {
      makeTone(440, .08);
      makeTone(660, .12, 'square', .08);
    }
  });

  if (cacheRefresh) {
    cacheRefresh.addEventListener('click', async () => {
      cacheRefresh.disabled = true;
      cacheRefresh.classList.add('is-clearing');
      cacheRefresh.setAttribute('aria-busy', 'true');
      await purgeReleaseCaches();
      rememberBuild();
      const refreshUrl = new URL(window.location.href);
      refreshUrl.searchParams.set('refresh', `${buildVersion}-${Date.now()}`);
      window.location.replace(refreshUrl.toString());
    });
  }

  window.setTimeout(() => bootScreen.classList.add('is-done'), reducedMotion.matches ? 0 : 900);
})();
