import { HStack, SimpleGrid, Tag, Text, Card } from '@chakra-ui/react';

import { TestStatus, TestStat } from '../../../types';

const statusColors: Record<TestStatus, string> = {
  runs: 'gray',
  passed: 'green',
  failed: 'orange',
};

export const Stats = ({ stats }: { stats: TestStat[] }) => (
  <SimpleGrid columns={{ base: 1 }} gap={3}>
    {stats.map((stat) => (
      <Card.Root key={stat.label} p={3} borderRadius="lg">
        <Card.Body>
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              {stat.label}
            </Text>
            <Tag.Root size="sm" colorScheme={statusColors[stat.status]}>
              <Tag.Label>{stat.status}</Tag.Label>
            </Tag.Root>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" mt={2}>
            {stat.value}
          </Text>
        </Card.Body>
      </Card.Root>
    ))}
  </SimpleGrid>
);
