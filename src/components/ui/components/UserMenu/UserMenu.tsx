// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Text, Box, VStack, Circle, Flex, Icon, Portal } from '@chakra-ui/react';
import { LuChevronsUpDown } from 'react-icons/lu';

import { useAuth } from '@/hooks';
interface UserMenuProps {
  collapsed?: boolean;
}

export const UserMenu = ({ collapsed }: UserMenuProps) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();

    setMenuPosition({
      bottom: window.innerHeight - triggerRect.top + 8,
      left: triggerRect.left,
      width: triggerRect.width,
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isTriggerClick = triggerRef.current?.contains(target);
      const isMenuClick = menuContentRef.current?.contains(target);

      if (!isTriggerClick && !isMenuClick) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateMenuPosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const avatarBg = 'bg.active';

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const hoverBg = 'bg.hover';
  const menuWidth = collapsed ? '160px' : `${menuPosition.width}px`;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'JD';

  return (
    <Box position="relative" w="100%" p={2}>
      <Flex
        as="button"
        ref={triggerRef}
        align="center"
        w="100%"
        p={2}
        bg={isOpen ? hoverBg : 'bg.cardSecondary'}
        shadow="sm"
        borderRadius="md"
        onClick={() => {
          updateMenuPosition();
          setIsOpen(!isOpen);
        }}
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
        <Portal>
          <Box
            ref={menuContentRef}
            position="fixed"
            bottom={`${menuPosition.bottom}px`}
            left={`${menuPosition.left}px`}
            w={menuWidth}
            minW="160px"
            bg="bg.panel"
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
        </Portal>
      )}
    </Box>
  );
};
