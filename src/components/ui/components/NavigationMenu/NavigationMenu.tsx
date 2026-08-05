// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Link, useLocation } from 'react-router';
import { Box, Text, VStack } from '@chakra-ui/react';

import { navigationMenuConfig } from './config';
import { NavItem } from './NavItem';

export const NavigationMenu = ({ collapsed }: { collapsed: boolean }) => {
  const location = useLocation();

  return (
    <VStack align="stretch" mt="4">
      {navigationMenuConfig.map((group) => (
        <Box key={group.id} mb="6">
          {group.title && !collapsed && (
            <Text px="6" mb="3" fontSize="md" fontWeight={500} color="text.secondary">
              {group.title}
            </Text>
          )}
          <VStack align="stretch" gap="4">
            {group.items.map((item) => {
              const isActive = item.path
                ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                : item.active;
              return (
                <Box key={item.id} asChild>
                  <Link to={item.path!}>
                    <NavItem icon={item.icon} label={item.label} collapsed={collapsed} active={isActive} />
                  </Link>
                </Box>
              );
            })}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};
