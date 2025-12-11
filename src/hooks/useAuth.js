import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload) => authService.register(payload),
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }) => authService.verifyOTP(email, otp),
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: ({ email }) => authService.resendOTP(email),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};