// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, useRef, useEffect } from 'react';
import { Button, Text, Box, VStack, Circle, Flex, Icon } from '@chakra-ui/react';
import { LuChevronsUpDown } from 'react-icons/lu';

import { useAuth } from '@/hooks';
interface UserMenuProps {
  collapsed?: boolean;
}

export const UserMenu = ({ collapsed }: UserMenuProps) => {
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

  const avatarBg = 'bg.active';

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const hoverBg = 'bg.hover';

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'JD';

  return (
    <Box position="relative" ref={menuRef} w="100%" p={2}>
      <Flex
        as="button"
        align="center"
        w="100%"
        p={2}
        bg={isOpen ? hoverBg : 'bg.cardSecondary'}
        shadow="sm"
        borderRadius="md"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: hoverBg }}
        justify={collapsed ? 'center' : 'space-between'}
        gap={3}
        transition="all 0.2s"
      >
        <Flex align="center" gap={3}>
          <Circle size="8" bg={avatarBg} color="text.primary" flexShrink={0}>
            <Text fontSize="xs" fontWeight="bold">
              {initials}
            </Text>
          </Circle>

          {!collapsed && (
            <VStack align="start" gap={0} overflow="hidden">
              <Text fontSize="sm" fontWeight="medium" color="text.primary" truncate maxW="120px">
                {user.name}
              </Text>
              <Text fontSize="xs" color="text.secondary" truncate maxW="120px">
                {user.email || 'user@example.com'}
              </Text>
            </VStack>
          )}
        </Flex>

        {!collapsed && <Icon as={LuChevronsUpDown} color="text.primary" size="sm" />}
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          bottom="100%"
          left={0}
          right={0}
          mb={2}
          mx={2}
          bg="bg.menu"
          border="1px"
          borderColor="border.subtle"
          borderRadius="md"
          shadow="dialog"
          zIndex={1000}
          animation="scale-fade-in 0.2s ease-out forwards"
          css={{
            '@keyframes scale-fade-in': {
              '0%': { opacity: 0, transform: 'scale(0.95)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <VStack gap={0} align="stretch" py={1}>
            <Button
              variant="ghost"
              size="sm"
              width="100%"
              justifyContent="flex-start"
              onClick={handleLogout}
              borderRadius={0}
              color="text.primary"
              fontWeight="normal"
              _hover={{ bg: 'bg.hover' }}
              px={3}
            >
              Sign Out
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};
