import api from './axios';

export const getSessions = (date) => api.get(`/sessions/${date ? `?date=${date}` : ''}`);
export const createSession = (data) => api.post('/sessions/', data);
export const getDailySummary = () => api.get('/sessions/daily/');
export const getWeeklySummary = () => api.get('/sessions/weekly/');