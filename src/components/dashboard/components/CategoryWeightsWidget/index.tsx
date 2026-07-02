import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Progress as ChakraProgress } from '@chakra-ui/react';

import { useSelectedProject } from '@/hooks';
import { getIssueCategoryStyle } from '@/utils';
import { IssueCategory } from '@/types';
import { ProgressRoot, ProgressBar } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { key: 'bug', type: IssueCategory.Bug },
  { key: 'infra', type: IssueCategory.Infra },
  { key: 'script', type: IssueCategory.Script },
  { key: 'performance', type: IssueCategory.Performance },
  { key: 'other', type: IssueCategory.Other },
];

export const CategoryWeightsWidget = () => {
  const { project, isLoading } = useSelectedProject();
  const weights = project?.categoryWeights;

  if (isLoading) {
    return (
      <Flex direction="column" gap={5} py={2} w="full">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Box key={idx} w="full">
            <Flex justify="space-between" align="center" mb={2}>
              <Skeleton w="100px" h="14px" borderRadius="md" />
              <Skeleton w="40px" h="14px" borderRadius="md" />
            </Flex>
            <Skeleton w="full" h="6px" borderRadius="full" />
          </Box>
        ))}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={5} py={2} w="full" h="100%" justify="center">
      {categories.map((cat) => {
        const weight = weights?.[cat.key as keyof typeof weights] ?? 100;
        const style = getIssueCategoryStyle(cat.type);
        const IconComponent = style.Icon;

        return (
          <Box key={cat.key} w="full">
            <Flex justify="space-between" align="center" mb={1.5}>
              <Flex align="center" gap={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="24px"
                  h="24px"
                  borderRadius="md"
                  bg="bg.subtle"
                  border="1px solid"
                  borderColor="border.muted"
                >
                  <Icon as={IconComponent} color={style.color} boxSize="14px" />
                </Box>
                <Text fontSize="xs" fontWeight="bold" color="fg" letterSpacing="tight">
                  {style.name || 'Other'}
                </Text>
              </Flex>
              <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                {weight} pts
              </Text>
            </Flex>
            <ProgressRoot value={weight} max={100} size="sm" w="full">
              <ProgressBar bg="bg.subtle" h="6px" borderRadius="full">
                <ChakraProgress.Range bg={style.color} borderRadius="full" />
              </ProgressBar>
            </ProgressRoot>
          </Box>
        );
      })}
    </Flex>
  );
};
