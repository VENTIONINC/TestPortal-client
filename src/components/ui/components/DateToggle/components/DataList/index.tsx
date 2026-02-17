import { HStack, ButtonGroup, Button, Box } from '@chakra-ui/react';

import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';

interface DateListProps {
  days: { date: string; name: string; isActive: boolean }[];
  toggleHandler: (date: string) => void;
}

export const DateList = ({ days, toggleHandler }: DateListProps) => {
  const { chips } = useResultsSurfaceColors();

  return (
    <HStack overflowX="auto">
      <Box border="1px solid" borderColor={chips.border} borderRadius="sm" shadow="sm" overflow="hidden" w="100%">
        <ButtonGroup size="sm" variant="outline" gap={0} w="100%">
          {days.map((day) => (
            <Button
              key={day.date}
              onClick={() => toggleHandler(day.date)}
              flex={1}
              justifyContent="center"
              bg={day.isActive ? 'button.primary.bg.focus' : chips.inactiveBg}
              color={day.isActive ? chips.activeText : chips.inactiveText}
              borderRadius="0"
              border="none"
              textAlign="center"
              whiteSpace="nowrap"
              _hover={{ bg: day.isActive ? chips.hoverActiveBg : chips.hoverInactiveBg }}
            >
              {day.name}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </HStack>
  );
};
