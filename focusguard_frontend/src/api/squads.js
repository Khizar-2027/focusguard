import api from './axios';

export const getSquads = () => api.get('/squads/');
export const createSquad = (name) => api.post('/squads/', { name });
export const joinSquad = (code) => api.post('/squads/join/', { code });
export const getSquadDetail = (id) => api.get(`/squads/${id}/`);
export const leaveSquad = (id) => api.delete(`/squads/${id}/leave/`);