import { useState, useRef, useEffect } from 'react';
import { Button, Text, Box, VStack, Circle } from '@chakra-ui/react';
import { LuUser } from 'react-icons/lu';

import { Link, useColorModeValue } from '@/components/ui';
import { useAuth } from '@/hooks';
import { PATHS } from '@/types/paths';
import { useSurfaceColors } from '@/theme';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const { surfaces, borders, text, states } = useSurfaceColors();
  const avatarBg = useColorModeValue('blue.500', 'blue.300');

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const hoverBg = states.hoverSubtle;
  const buttonColor = text.primary;

  return (
    <Box position="relative" ref={menuRef}>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} _hover={{ bg: 'transparent' }}>
        <Circle size="8" bg={avatarBg} color="white">
          <LuUser size={16} />
        </Circle>
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          right={0}
          mt={1}
          bg={surfaces.popover}
          border="1px"
          borderColor={borders.subtle}
          borderRadius="md"
          shadow="lg"
          zIndex={1000}
          minWidth="200px"
        >
          <VStack align="start" p={3} borderBottom="1px" borderColor={borders.subtle} gap={1}>
            <Text fontSize="sm" fontWeight="medium" color={text.primary}>
              {user.name}
            </Text>
          </VStack>
          <VStack gap={0} align="stretch">
            <Link href={PATHS.USER_SETTINGS} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                width="100%"
                justifyContent="flex-start"
                borderRadius={0}
                color={buttonColor}
                _hover={{ bg: hoverBg }}
              >
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              width="100%"
              justifyContent="flex-start"
              onClick={handleLogout}
              borderRadius={0}
              borderBottomRadius="md"
              color={buttonColor}
              _hover={{ bg: hoverBg }}
            >
              Sign Out
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};
