(function () {
  if (window.__focusguardInjected) return;
  window.__focusguardInjected = true;

  let pingInterval = null;
  let currentTrackingType = null;

  function isValid() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); }
    catch (e) { return false; }
  }

  function getHost() {
    return window.location.hostname.replace(/^www\./, '');
  }

  async function getSites() {
    return new Promise((resolve) => {
      if (!isValid()) {
        resolve({ distraction_sites: [], productive_sites: [] });
        return;
      }
      chrome.runtime.sendMessage({ type: 'GET_SITES' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ distraction_sites: [], productive_sites: [] });
        } else {
          resolve(response);
        }
      });
    });
  }

  async function getSiteType() {
    const host = getHost();
    const { distraction_sites, productive_sites } = await getSites();

    const isDistraction = distraction_sites.some(site => host.includes(site));
    if (isDistraction) {
      // For YouTube — only track non-educational paths
      if (host.includes('youtube.com')) {
        const path = window.location.pathname;
        if (path.includes('/shorts/') || path === '/') return 'reels';
        return null;
      }
      // For Instagram — only reels/stories
      if (host.includes('instagram.com')) {
        const path = window.location.pathname;
        if (path.includes('/reels/') || path.includes('/stories/')) return 'reels';
        return null;
      }
      return 'reels';
    }

    const isProductive = productive_sites.some(site => host.includes(site));
    if (isProductive) return 'study';

    return null;
  }

  async function isCurrentlyTracking() {
    if (!isValid()) return false;
    const data = await chrome.storage.local.get('current_tracking_start');
    return !!data.current_tracking_start;
  }

  async function startTracking(sessionType) {
    if (!isValid()) return;
    const already = await isCurrentlyTracking();
    if (already) return;

    const host = getHost();
    currentTrackingType = sessionType;

    await chrome.storage.local.set({
      current_tracking_start: Date.now(),
      current_tracking_site: host,
      current_tracking_type: sessionType,
    });

    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (!isValid()) { clearInterval(pingInterval); return; }
      chrome.runtime.sendMessage({ type: 'PING' }).catch(() => {});
    }, 25000);

    console.log('[FocusGuard] Started', sessionType, 'tracking on:', host);
  }

  async function stopTracking() {
    if (!isValid()) return;
    if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }

    const data = await chrome.storage.local.get([
      'current_tracking_start', 'current_tracking_site', 'current_tracking_type',
    ]);
    if (!data.current_tracking_start) return;

    const duration = Math.floor((Date.now() - data.current_tracking_start) / 1000);
    const site = data.current_tracking_site;
    const sessionType = data.current_tracking_type || 'reels';
    const startedAt = new Date(data.current_tracking_start).toISOString();
    const endedAt = new Date().toISOString();

    await chrome.storage.local.remove([
      'current_tracking_start', 'current_tracking_site', 'current_tracking_type',
    ]);
    currentTrackingType = null;

    if (duration < 10) return;

    const trySend = (attempt = 1) => {
      if (!isValid()) return;
      chrome.runtime.sendMessage({
        type: 'SAVE_SESSION',
        duration, site, startedAt, endedAt,
        sessionType,
      }).catch(() => {
        if (attempt < 3) setTimeout(() => trySend(attempt + 1), 1000 * attempt);
      });
    };
    trySend();
    console.log('[FocusGuard] Stopped', sessionType, ':', duration + 's on', site);
  }

  // Initial check
  (async () => {
    const type = await getSiteType();
    if (type) startTracking(type);
  })();

  // SPA navigation watcher
  let lastUrl = location.href;
  const navObserver = new MutationObserver(async () => {
    if (!isValid()) { navObserver.disconnect(); return; }
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    const already = await isCurrentlyTracking();
    const type = await getSiteType();

    if (type) {
      if (!already) startTracking(type);
    } else {
      if (already) stopTracking();
    }
  });
  navObserver.observe(document, { subtree: true, childList: true });

  // Visibility change
  document.addEventListener('visibilitychange', async () => {
    if (!isValid()) return;
    if (document.hidden) {
      const already = await isCurrentlyTracking();
      if (already) stopTracking();
    } else {
      const type = await getSiteType();
      if (type) startTracking(type);
    }
  });

  // Page unload
  window.addEventListener('beforeunload', async () => {
    const already = await isCurrentlyTracking();
    if (already) stopTracking();
  });

  // Listen for site updates from the app
  window.addEventListener('message', async (event) => {
    if (event.data?.type === 'FOCUSGUARD_UPDATE_SITES') {
      if (!isValid()) return;
      await chrome.storage.local.set({
        distraction_sites: event.data.distraction_sites,
        productive_sites: event.data.productive_sites,
      });
      console.log('[FocusGuard] Sites updated from app');
    }
  });

})();