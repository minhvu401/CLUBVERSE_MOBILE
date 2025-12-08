import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ email, password, fullName }) => 
      authService.register(email, password, fullName),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};