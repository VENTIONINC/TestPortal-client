import { Text, VStack } from '@chakra-ui/react';

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
    <VStack
      onClick={() => toggleHandler(day)}
      flex={1}
      gap={1}
      p={1}
      bg={day.isActive ? 'gray.800' : 'white'}
      color={day.isActive ? 'white' : 'black'}
      border="1px solid"
      borderColor="gray.300"
      borderRadius="sm"
      cursor="pointer"
    >
      <Text>{day.display}</Text>
      {day.stats && (
        <Text textStyle="md">
          P: {day.stats.filter((s: string) => s === 'passed').length}, F:{' '}
          {day.stats.filter((s: string) => s === 'failed').length}, S:{' '}
          {day.stats.filter((s: string) => s === 'skipped').length}
        </Text>
      )}
    </VStack>
  );
};
