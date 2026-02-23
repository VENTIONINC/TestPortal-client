import { HStack, ButtonGroup, Button, Box } from '@chakra-ui/react';

interface DateListProps {
  days: { yyyy_mm_dd: string; display: string; isActive: boolean }[];
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}

export const DateList = ({ days, toggleHandler }: DateListProps) => (
  <HStack overflowX="auto" p="8px" borderRadius="xl" bg="bg.section">
    <Box borderRadius="lg" shadow="sm" overflow="hidden" w="100%">
      <ButtonGroup size="sm" variant="outline" gap={0} w="100%">
        {days.map((day) => (
          <Button
            key={day.yyyy_mm_dd}
            onClick={() => toggleHandler({ yyyy_mm_dd: day.yyyy_mm_dd })}
            flex={1}
            justifyContent="center"
            borderRadius="0"
            minH="42px"
            variant="tertiary"
            textAlign="center"
            whiteSpace="nowrap"
            border="1px solid"
            borderColor={
              day.isActive ? 'button.groupButton.selected.borderColor' : 'button.groupButton.default.borderColor'
            }
            bg={day.isActive ? 'button.groupButton.selected.bg' : 'button.groupButton.default.bg'}
            color={day.isActive ? 'button.groupButton.selected.color' : 'button.groupButton.default.color'}
            _hover={{
              bg: 'button.groupButton.hover.bg',
              color: 'button.groupButton.hover.color',
              borderColor: 'button.groupButton.hover.borderColor',
            }}
          >
            {day.display}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  </HStack>
);
