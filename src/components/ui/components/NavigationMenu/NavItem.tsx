import { Box, Flex, Text } from '@chakra-ui/react';

import { Tooltip } from '@/components/ui';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active?: boolean;
};

export const NavItem = ({ icon: IconComp, label, collapsed, active }: NavItemProps) => {

  const content = (
    <Flex
      align="center"
      justify={collapsed ? 'center' : 'flex-start'}
      py="2"
      px="6"
      bg={active ? 'bg.active' : 'transparent'}
      color={active ? 'logo.icon' : 'text.secondary'}
      _hover={{ bg: 'bg.hover' }}
      cursor="pointer"
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
