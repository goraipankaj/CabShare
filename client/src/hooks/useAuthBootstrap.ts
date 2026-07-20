import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux';
import { setCredentials, logout } from '@/redux/slices/authSlice';
import { API_BASE_URL } from '@/constants';

/**
 * On first mount, tries to silently exchange the httpOnly refresh cookie for a
 * new access token so a page refresh doesn't force the user to log in again.
 */
export const useAuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          dispatch(setCredentials({ accessToken: json.data.accessToken, user: json.data.user }));
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrap();
  }, [dispatch]);

  return isBootstrapping;
};
