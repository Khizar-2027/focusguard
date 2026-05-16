import api from './axios';

export const getSubjects = () => api.get('/subjects/');
export const createSubject = (data) => api.post('/subjects/', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}/`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}/`);
export const logSubjectSession = (id, duration) => api.post(`/subjects/${id}/log/`, { duration });
export const getExams = () => api.get('/subjects/exams/');
export const createExam = (data) => api.post('/subjects/exams/', data);
export const deleteExam = (id) => api.delete(`/subjects/exams/${id}/`);