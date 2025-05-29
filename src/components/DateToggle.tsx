import { Text, HStack, Box } from '@chakra-ui/react';

interface DateToggleProps {
  day: {
    yyyy_mm_dd: string;
    stats: string[];
    isActive: boolean;
    display: string;
  };
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}

export const DateToggle = ({ day, toggleHandler }: DateToggleProps) => {
  return (
    <HStack
      onClick={() => toggleHandler(day)}
      flex={1}
      gap={1}
      justify="space-between"
      p={1}
      bg={day.isActive ? 'green.600' : 'white'}
      color={day.isActive ? 'white' : 'black'}
      border="1px solid"
      borderColor="gray.300"
      borderRadius="sm"
      cursor="pointer"
    >
      <Text textStyle="sm" fontWeight={500}>
        {day.display}
      </Text>
      {day.stats.length > 0 && (
        <HStack gap={1} flexWrap="wrap" justify="center" bg="white" p={0.5} borderRadius="sm">
          {day.stats.map((status: string, index: number) => (
            <Box
              key={index}
              w="6px"
              h="6px"
              borderRadius="full"
              bg={status === 'passed' ? 'green.600' : status === 'failed' ? 'red.500' : 'gray.500'}
            />
          ))}
        </HStack>
      )}
    </HStack>
  );
};
