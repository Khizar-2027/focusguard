import api from './axios';

export const registerUser = (data) => api.post('/users/register/', data);
export const loginUser = (data) => api.post('/users/login/', data);
export const getProfile = () => api.get('/users/profile/');
export const getSites = () => api.get('/users/sites/');

export const updateProfile = (data) => api.put('/users/profile/', {
  daily_study_goal: data.daily_study_goal,
  daily_reels_limit: data.daily_reels_limit,
});

export const updateSites = (data) => api.put('/users/profile/', {
  distraction_sites: data.distraction_sites,
  productive_sites: data.productive_sites,
});

export const updatePomodoro = (data) => api.put('/users/profile/', {
  pomodoro_work_minutes: data.pomodoro_work_minutes,
  pomodoro_break_minutes: data.pomodoro_break_minutes,
  playlist_url: data.playlist_url,
});