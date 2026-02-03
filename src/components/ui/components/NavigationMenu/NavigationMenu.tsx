import { useNavigate, useLocation } from 'react-router';
import { Box, Text, VStack } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { navigationMenuConfig } from './config';
import { NavItem } from './NavItem';

export const NavigationMenu = ({ collapsed }: { collapsed: boolean }) => {
  const { text } = useSurfaceColors();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <VStack align="stretch" spacing="4" px="2" mt="2">
      {navigationMenuConfig.map((group) => (
        <Box key={group.id}>
          {group.title && !collapsed && (
            <Text px="2" mb="2" fontSize="xs" fontWeight="bold" color={text.secondary} textTransform="uppercase">
              {group.title}
            </Text>
          )}
          <VStack align="stretch" spacing="1">
            {group.items.map((item) => {
              const isActive = item.path
                ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                : item.active;
              return (
                <Box key={item.id} onClick={() => item.path && navigate(item.path)}>
                  <NavItem icon={item.icon} label={item.label} collapsed={collapsed} active={isActive} />
                </Box>
              );
            })}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};
