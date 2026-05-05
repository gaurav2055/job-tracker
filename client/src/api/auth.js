import api from './client';

export const changePassword = (currentPassword, newPassword) =>
  api.patch('/auth/password', { currentPassword, newPassword });
