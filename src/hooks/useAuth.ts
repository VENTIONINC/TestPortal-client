import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { logout } from '@/redux/slices/auth';
import { useGetApiV2UsersByUserIdQuery } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import type { RootState } from '@/redux/store';

function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken, refreshToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const userId = accessToken ? getUserIdFromToken(accessToken) : null;

  const { data: user } = useGetApiV2UsersByUserIdQuery(
    { userId: userId! },
    {
      skip: !accessToken || !userId,
      refetchOnMountOrArgChange: false,
    },
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate(PATHS.LOGIN);
  };

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: isAuthenticated && !!user,
    logout: handleLogout,
  };
}
