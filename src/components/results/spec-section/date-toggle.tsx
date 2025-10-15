import { memo } from 'react';
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

export const DateToggle = memo(({ day, toggleHandler }: DateToggleProps) => {
  return (
    <HStack
      onClick={() => toggleHandler(day)}
      flex={1}
      gap={1}
      justify="space-between"
      py={0.5}
      px={2}
      bg={day.isActive ? 'green.600' : 'white'}
      color={day.isActive ? 'white' : 'black'}
      borderRadius="sm"
      cursor="pointer"
      shadow="sm"
      _hover={{ bg: day.isActive ? 'green.500' : 'gray.200' }}
    >
      <Text whiteSpace="nowrap">{day.display}</Text>
      {day.stats.length > 0 && (
        <HStack gap={0.5} justify="center" bg="white" p="2px" borderRadius="sm">
          {day.stats.map((status: string, index: number) => {
            const isFirst = index === 0;
            const isLast = index === day.stats.length - 1;
            const isOnly = day.stats.length === 1;

            let borderRadiusProps = {};
            if (isOnly) {
              borderRadiusProps = { borderRadius: 'full' };
            } else if (isFirst) {
              borderRadiusProps = {
                borderTopLeftRadius: 'full',
                borderBottomLeftRadius: 'full',
              };
            } else if (isLast) {
              borderRadiusProps = {
                borderTopRightRadius: 'full',
                borderBottomRightRadius: 'full',
              };
            }

            return (
              <Box
                key={index}
                w={1.5}
                h={1.5}
                {...borderRadiusProps}
                bg={status === 'passed' ? 'green.600' : status === 'failed' ? 'red.500' : 'gray.500'}
              />
            );
          })}
        </HStack>
      )}
    </HStack>
  );
});
