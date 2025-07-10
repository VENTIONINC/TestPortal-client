import { HStack, Flex, Text } from '@chakra-ui/react';

interface DateListProps {
  dateConfigs: { date: string; name: string; isActive: boolean }[];
  toggleDateConfig: (dateConfig: { date: string; name: string; isActive: boolean }) => void;
}

export const DateList = ({ dateConfigs, toggleDateConfig }: DateListProps) => {
  return (
    <HStack overflowX="auto">
      {dateConfigs.map((day) => (
        <Flex
          key={day.date}
          onClick={() => toggleDateConfig(day)}
          flex={1}
          justify="center"
          p={1}
          bg={day.isActive ? 'gray.800' : 'white'}
          color={day.isActive ? 'white' : 'black'}
          borderRadius="sm"
          cursor="pointer"
          textAlign="center"
          shadow="sm"
          whiteSpace="nowrap"
          mb={2}
          _hover={{ bg: day.isActive ? 'gray.600' : 'gray.200' }}
        >
          <Text>{day.name}</Text>
        </Flex>
      ))}
    </HStack>
  );
};
