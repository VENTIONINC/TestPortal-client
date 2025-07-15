import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex, Image } from '@chakra-ui/react';

import { useGetApiV2UsersByUserIdQuery } from '@/redux/apis/generatedApi';
import type { RootState } from '@/redux/store';

interface AppGuardProps {
  children: ReactNode;
}

function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export function AppGuard({ children }: AppGuardProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const userId = accessToken ? getUserIdFromToken(accessToken) : null;

  const { isLoading: isUserLoading, isError } = useGetApiV2UsersByUserIdQuery(
    { userId: userId! },
    {
      skip: !accessToken || !userId || !isAuthenticated,
      refetchOnMountOrArgChange: false,
    },
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setIsInitialized(true);
      return;
    }

    if (!isUserLoading && !isError) {
      setIsInitialized(true);
    }
  }, [isAuthenticated, accessToken, isUserLoading, isError]);

  if (!isInitialized) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="gray.50"
        _dark={{ bg: "gray.900" }}
      >
        <Box mb={8}>
          <Image
            src="/Gemini_Generated_Image_fbnppgfbnppgfbnp.jpg"
            alt="Test Analysis Portal"
            maxW="300px"
            h="auto"
          />
        </Box>
      </Flex>
    );
  }

  return <>{children}</>;
}