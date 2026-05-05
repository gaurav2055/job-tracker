import api from './client';

export const getFollowups = (jobId) => api.get('/followups', { params: { jobId } });
export const createFollowup = (data) => api.post('/followups', data);
export const updateFollowup = (id, data) => api.put(`/followups/${id}`, data);
export const deleteFollowup = (id) => api.delete(`/followups/${id}`);
