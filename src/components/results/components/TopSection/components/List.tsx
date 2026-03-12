import { Text, VStack, HStack } from '@chakra-ui/react';

interface TopSectionProps {
  results: { title: string; count: number }[];
  label: string;
  onClick: (message: string) => void;
}

export const List = ({ results, label, onClick }: TopSectionProps) => {

  return (
    <VStack align="stretch" flex={1} mt={4} px="3px" aria-label={label}>
      {results.map(({ title, count }, index) => (
        <HStack key={`${title}-${index}-${count}`} textStyle="md">
          <Text
            fontWeight={700}
            color={label === 'errors' ? 'status.error.text' : 'status.attention.text'}
            borderRadius="40px"
            fontSize="xs"
            px="7px"
            bg={label === 'errors' ? 'status.error.bg' : 'status.attention.bg'}
          >
            {count}
          </Text>
          <Text
            onClick={() => onClick(title)}
            lineClamp={1}
            fontWeight={400}
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            fontSize="sm"
            color="text.main"
            ml={2}
          >
            {title}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};
