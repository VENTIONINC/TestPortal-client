import { Text, VStack, HStack } from '@chakra-ui/react';

import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';

interface TopSectionProps {
  results: { title: string; count: number }[];
  label: string;
  onClick: (message: string) => void;
}

export const List = ({ results, label, onClick }: TopSectionProps) => {
  const { stats } = useResultsSurfaceColors();

  return (
    <VStack align="stretch" flex={1} mt={4} px="3px" aria-label={label}>
      {results.map(({ title, count }, index) => (
        <HStack key={`${title}-${index}-${count}`} textStyle="md">
          <Text
            fontWeight={700}
            color={stats.countText}
            borderRadius="40px"
            border="1px solid"
            fontSize="xs"
            borderColor="status.error"
            px="7px"
            // py={1}
            bg="bg.card"
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
            color={stats.strongText}
          >
            {title}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};
