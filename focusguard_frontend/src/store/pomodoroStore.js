import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PHASES = { IDLE: 'idle', WORK: 'work', BREAK: 'break' };

let _intervalId = null;

const usePomodoroStore = create(
  persist(
    (set, get) => ({
      phase: PHASES.IDLE,
      startTimestamp: null,
      workMinutes: 45,
      breakMinutes: 10,
      playlistUrl: '',
      sessionsCompleted: 0,

      configure: (w, b, p) => set({ workMinutes: w, breakMinutes: b, playlistUrl: p }),

      start: () => {
        if (_intervalId) return;
        set({ phase: PHASES.WORK, startTimestamp: Date.now() });
        _tick(set, get);
      },

      skip: () => {
        if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
        set({ phase: PHASES.IDLE, startTimestamp: null });
      },

      reset: () => {
        if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
        set({ phase: PHASES.IDLE, startTimestamp: null, sessionsCompleted: 0 });
      },

      resume: () => {
        const { phase, startTimestamp } = get();
        if (phase !== PHASES.IDLE && startTimestamp && !_intervalId) {
          _tick(set, get);
        }
      },
    }),
    {
      name: 'focusguard-pomodoro',
      partialize: (s) => ({
        phase: s.phase,
        startTimestamp: s.startTimestamp,
        workMinutes: s.workMinutes,
        breakMinutes: s.breakMinutes,
        playlistUrl: s.playlistUrl,
        sessionsCompleted: s.sessionsCompleted,
      }),
    }
  )
);

function _tick(set, get) {
  _intervalId = setInterval(() => {
    const { phase, startTimestamp, workMinutes, breakMinutes, playlistUrl } = get();
    if (!startTimestamp) return;

    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);

    if (phase === PHASES.WORK && elapsed >= workMinutes * 60) {
      clearInterval(_intervalId); _intervalId = null;
      _saveSession(workMinutes * 60);
      _notify('🎉 Break Time!', `Take a ${breakMinutes} minute break.`);
      if (playlistUrl) window.open(playlistUrl, '_blank');
      set({ phase: PHASES.BREAK, startTimestamp: Date.now() });
      _tick(set, get);
    } else if (phase === PHASES.BREAK && elapsed >= breakMinutes * 60) {
      clearInterval(_intervalId); _intervalId = null;
      _notify('⚡ Break Over!', 'Time to focus again!');
      set(s => ({ phase: PHASES.IDLE, startTimestamp: null, sessionsCompleted: s.sessionsCompleted + 1 }));
    } else {
      set(s => ({ ...s })); // force re-render
    }
  }, 1000);
}

async function _saveSession(duration) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const now = new Date();
    const started = new Date(now.getTime() - duration * 1000);
    await fetch('http://127.0.0.1:8000/api/sessions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        session_type: 'study', source: 'manual', duration,
        started_at: started.toISOString(), ended_at: now.toISOString(),
        notes: 'Pomodoro session',
      }),
    });
  } catch (e) { console.error('[Pomodoro] Save failed:', e); }
}

function _notify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export default usePomodoroStore;