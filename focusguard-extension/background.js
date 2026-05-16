const API_BASE = 'http://127.0.0.1:8000/api';

// Default sites — used until user syncs from app
const DEFAULT_DISTRACTION = ['instagram.com', 'youtube.com', 'facebook.com', 'tiktok.com', 'twitter.com', 'reddit.com'];
const DEFAULT_PRODUCTIVE = ['chatgpt.com', 'claude.ai', 'khanacademy.org', 'coursera.org', 'notion.so', 'github.com'];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'PING') {
    sendResponse({ status: 'alive' });
    return true;
  }

  if (message.type === 'SAVE_SESSION') {
    const { duration, site, startedAt, endedAt, sessionType } = message;
    saveSession(duration, site, startedAt, endedAt, sessionType || 'reels')
      .then(() => sendResponse({ status: 'saved' }))
      .catch(() => sendResponse({ status: 'error' }));
    return true;
  }

  if (message.type === 'GET_SITES') {
    chrome.storage.local.get(['distraction_sites', 'productive_sites'], (result) => {
      sendResponse({
        distraction_sites: result.distraction_sites || DEFAULT_DISTRACTION,
        productive_sites: result.productive_sites || DEFAULT_PRODUCTIVE,
      });
    });
    return true;
  }

  return true;
});

// Fetch latest sites from backend and store locally
async function syncSitesFromBackend() {
  const result = await chrome.storage.local.get(['access_token']);
  if (!result.access_token) return;

  try {
    const res = await fetch(`${API_BASE}/users/sites/`, {
      headers: { 'Authorization': `Bearer ${result.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      await chrome.storage.local.set({
        distraction_sites: data.distraction_sites,
        productive_sites: data.productive_sites,
      });
      console.log('[FocusGuard BG] Sites synced from backend');
    }
  } catch (e) {
    console.log('[FocusGuard BG] Sites sync failed:', e);
  }
}

// Sync sites on startup
chrome.runtime.onStartup.addListener(() => {
  syncSitesFromBackend();
  recoverOrphanedSession();
});

chrome.runtime.onInstalled.addListener(() => {
  syncSitesFromBackend();
  recoverOrphanedSession();
});

async function recoverOrphanedSession() {
  const data = await chrome.storage.local.get([
    'current_tracking_start', 'current_tracking_site', 'current_tracking_type',
  ]);
  if (!data.current_tracking_start) return;

  const duration = Math.floor((Date.now() - data.current_tracking_start) / 1000);
  if (duration >= 10 && duration <= 14400) {
    console.log('[FocusGuard BG] Recovering orphaned session:', duration + 's');
    const startedAt = new Date(data.current_tracking_start).toISOString();
    const endedAt = new Date().toISOString();
    await chrome.storage.local.remove([
      'current_tracking_start', 'current_tracking_site', 'current_tracking_type',
    ]);
    await saveSession(duration, data.current_tracking_site, startedAt, endedAt, data.current_tracking_type || 'reels');
  } else {
    await chrome.storage.local.remove([
      'current_tracking_start', 'current_tracking_site', 'current_tracking_type',
    ]);
  }
}

async function saveSession(duration, site, startedAt, endedAt, sessionType = 'reels') {
  const result = await chrome.storage.local.get(['access_token']);
  let token = result.access_token;
  if (!token) return;

  const body = JSON.stringify({
    session_type: sessionType,
    source: 'extension',
    duration,
    started_at: startedAt,
    ended_at: endedAt,
    notes: `Auto-tracked: ${site}`,
  });

  let res = await fetch(`${API_BASE}/sessions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body,
  });

  if (res.status === 401) {
    token = await refreshToken();
    if (!token) return;
    res = await fetch(`${API_BASE}/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body,
    });
  }

  if (res.ok) {
    if (sessionType === 'reels') {
      await updateDailyCount(duration);
    }
    console.log('[FocusGuard BG] Saved:', duration + 's', sessionType, 'on', site);
  }
}

async function updateDailyCount(duration) {
  const stored = await chrome.storage.local.get(['daily_reels', 'last_reset', 'reels_limit']);
  const today = new Date().toDateString();
  let dailyReels = stored.last_reset === today ? (stored.daily_reels || 0) : 0;
  dailyReels += duration;
  await chrome.storage.local.set({ daily_reels: dailyReels, last_reset: today });

  const limit = (stored.reels_limit || 60) * 60;
  if (dailyReels > limit) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'FocusGuard — Limit Exceeded',
      message: `${Math.floor(dailyReels / 60)} mins of distractions today. Get back to work!`,
    });
  }
}

async function refreshToken() {
  const result = await chrome.storage.local.get(['refresh_token']);
  if (!result.refresh_token) return null;
  try {
    const res = await fetch(`${API_BASE}/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: result.refresh_token }),
    });
    if (res.ok) {
      const data = await res.json();
      await chrome.storage.local.set({ access_token: data.access });
      return data.access;
    }
    await chrome.storage.local.remove(['access_token', 'refresh_token']);
    return null;
  } catch { return null; }
}