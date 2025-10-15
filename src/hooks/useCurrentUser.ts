import { useSelector } from 'react-redux';

import { useGetApiV2UsersByUserIdQuery } from '@/redux/apis/generatedApi';
import type { RootState } from '@/redux/store';
import { getUserIdFromToken } from '@/utils/auth';

export const useCurrentUser = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const userId = accessToken ? getUserIdFromToken(accessToken) : null;

  const { data: userData } = useGetApiV2UsersByUserIdQuery({ userId: userId! });

  if (!userData) {
    throw new Error('User data is not available');
  }

  return userData;
};
