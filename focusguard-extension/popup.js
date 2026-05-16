const API_BASE = 'http://127.0.0.1:8000/api';
let refreshInterval = null;

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

async function refreshStatus() {
  const data = await chrome.storage.local.get([
    'daily_reels', 'last_reset', 'reels_limit',
    'current_tracking_start', 'current_tracking_site'
  ]);

  const today = new Date().toDateString();
  const dailyReels = data.last_reset === today ? (data.daily_reels || 0) : 0;
  document.getElementById('reels-today').textContent = formatTime(dailyReels);

  const statusEl = document.getElementById('tracking-status');
  const liveEl = document.getElementById('live-timer');

  if (data.current_tracking_start && data.current_tracking_site) {
    // Calculate elapsed directly from saved timestamp — always accurate
    const liveElapsed = Math.floor((Date.now() - data.current_tracking_start) / 1000);
    statusEl.className = 'status-badge active';
    statusEl.innerHTML = `<div class="dot green"></div> Tracking ${data.current_tracking_site}`;
    if (liveEl) liveEl.textContent = `⏱ ${formatTime(liveElapsed)}`;
  } else {
    statusEl.className = 'status-badge inactive';
    statusEl.innerHTML = '<div class="dot gray"></div> Not on distraction site';
    if (liveEl) liveEl.textContent = '';
  }
}

async function init() {
  const result = await chrome.storage.local.get(['access_token', 'daily_reels', 'reels_limit', 'last_reset']);

  if (!result.access_token) {
    document.getElementById('login-view').style.display = 'block';
    return;
  }

  document.getElementById('main-view').style.display = 'block';

  const today = new Date().toDateString();
  const dailyReels = result.last_reset === today ? (result.daily_reels || 0) : 0;
  document.getElementById('reels-today').textContent = formatTime(dailyReels);
  document.getElementById('reels-limit').textContent = `${result.reels_limit || 60}m`;

  if (dailyReels > (result.reels_limit || 60) * 60) {
    document.getElementById('limit-warning').style.display = 'block';
  }

  // Refresh every second for live timer
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(refreshStatus, 1000);
  refreshStatus();
}

document.getElementById('login-btn')?.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!username || !password) {
    errorEl.textContent = 'Please fill in both fields';
    errorEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      const profileRes = await fetch(`${API_BASE}/users/profile/`, {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      const profile = await profileRes.json();

      await chrome.storage.local.set({
        access_token: data.access,
        refresh_token: data.refresh,
        reels_limit: profile.daily_reels_limit
      });

      document.getElementById('login-view').style.display = 'none';
      document.getElementById('main-view').style.display = 'block';
      document.getElementById('reels-limit').textContent = `${profile.daily_reels_limit}m`;

      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(refreshStatus, 1000);
      refreshStatus();
    } else {
      errorEl.textContent = 'Invalid username or password';
      errorEl.style.display = 'block';
    }
  } catch {
    errorEl.textContent = 'Cannot connect to server. Is Django running?';
    errorEl.style.display = 'block';
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});

document.getElementById('open-app-btn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  if (refreshInterval) clearInterval(refreshInterval);
  await chrome.storage.local.remove([
    'access_token', 'refresh_token', 'daily_reels',
    'current_tracking_start', 'current_tracking_site'
  ]);
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('login-view').style.display = 'block';
});

init();