import api from './axios';

export const getStreak = () => api.get('/streaks/');