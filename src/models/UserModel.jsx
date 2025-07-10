import { apiService } from "../services/apiService";

export const login = (email, password) => apiService.login(email, password);

export const sendPasswordResetEmail = (email) =>
  apiService.sendPasswordResetEmail(email);

export const validatePasswordResetToken = (token) =>
  apiService.validatePasswordResetToken(token);

export const resetPassword = (token, newPassword) =>
  apiService.resetPassword(token, newPassword);
