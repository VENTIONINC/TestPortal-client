import { HStack, ButtonGroup, Button, Box } from '@chakra-ui/react';

import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';

interface DateListProps {
  days: { yyyy_mm_dd: string; display: string; isActive: boolean }[];
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}

export const DateList = ({ days, toggleHandler }: DateListProps) => {
  const { chips } = useResultsSurfaceColors();

  return (
    <HStack overflowX="auto" p="8px" borderRadius="xl" bg="bg.section">
      <Box borderRadius="lg" shadow="sm" overflow="hidden" w="100%">
        <ButtonGroup size="sm" variant="outline" gap={0} w="100%">
          {days.map((day) => (
            <Button
              key={day.yyyy_mm_dd}
              onClick={() => toggleHandler({ yyyy_mm_dd: day.yyyy_mm_dd })}
              flex={1}
              justifyContent="center"
              bg={day.isActive ? 'button.primary.bg.focus' : 'transparent'}
              color={day.isActive ? chips.activeText : chips.inactiveText}
              borderRadius="0"
              border="none"
              minH="42px"
              variant="secondary"
              textAlign="center"
              whiteSpace="nowrap"
              _hover={{ bg: day.isActive ? chips.hoverActiveBg : chips.hoverInactiveBg }}
            >
              {day.display}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </HStack>
  );
};
