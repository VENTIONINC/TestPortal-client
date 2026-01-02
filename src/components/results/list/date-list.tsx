import { HStack, Flex, Text } from '@chakra-ui/react';

import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';

interface DateListProps {
  dateConfigs: { date: string; name: string; isActive: boolean }[];
  toggleDateConfig: (date: string) => void;
}

export const DateList = ({ dateConfigs, toggleDateConfig }: DateListProps) => {
  const { chips } = useResultsSurfaceColors();

  return (
    <HStack overflowX="auto">
      {dateConfigs.map((day) => (
        <Flex
          key={day.date}
          onClick={() => toggleDateConfig(day.date)}
          flex={1}
          justify="center"
          p={1}
          bg={day.isActive ? chips.activeBg : chips.inactiveBg}
          color={day.isActive ? chips.activeText : chips.inactiveText}
          borderRadius="sm"
          border="1px solid"
          borderColor={chips.border}
          cursor="pointer"
          textAlign="center"
          shadow="sm"
          whiteSpace="nowrap"
          mb={2}
          _hover={{ bg: day.isActive ? chips.hoverActiveBg : chips.hoverInactiveBg }}
        >
          <Text>{day.name}</Text>
        </Flex>
      ))}
    </HStack>
  );
};
