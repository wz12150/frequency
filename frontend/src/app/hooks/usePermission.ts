import { useAuth } from '../context/AuthContext';

export function usePermission() {
  const { hasPermission, hasRole, user } = useAuth();

  return {
    hasPermission,
    hasRole,
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
    isLoggedIn: !!user,
  };
}