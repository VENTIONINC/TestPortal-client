import { Box, Flex, Text } from '@chakra-ui/react';

import { Tooltip } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
};

export const NavItem = ({ icon: IconComp, label, collapsed, active }: NavItemProps) => {
  const { nav } = useSurfaceColors();

  const content = (
    <Flex
      align="center"
      justify={collapsed ? 'center' : 'flex-start'}
      py="2"
      px="6"
      bg={active ? 'bg.active' : 'transparent'}
      color={active ? 'logo.icon' : nav.item.inactiveText}
      _hover={{ bg: nav.item.hoverBg }}
    >
      <IconComp style={{ fontSize: '18px' }} />
      <Box
        overflow="hidden"
        whiteSpace="nowrap"
        ml={collapsed ? 0 : 3}
        maxW={collapsed ? 0 : '200px'}
        opacity={collapsed ? 0 : 1}
        transition="all 0.2s ease-in-out"
      >
        <Text fontSize="md" fontWeight="500">
          {label}
        </Text>
      </Box>
    </Flex>
  );

  return (
    <Tooltip content={label} positioning={{ placement: 'right' }} disabled={!collapsed}>
      {content}
    </Tooltip>
  );
};
