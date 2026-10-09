// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Button, Card, Heading, HStack, Text, VStack } from '@chakra-ui/react';

import { SkillMetadata } from '@/redux/apis/generatedApi';

import { SkillTag } from './SkillTag';

interface SkillCardProps {
  skill: SkillMetadata;
  onSelect: (skillId: string) => void;
}

export const SkillCard = memo(function SkillCard({ skill, onSelect }: SkillCardProps) {
  return (
    <Card.Root
      h="232px"
      variant="elevated"
      bg="bg.cardSecondary"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'card',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onSelect(skill.id)}
    >
      <Card.Body p={4} gap={4} h="100%" justifyContent="space-between">
        <VStack align="start" gap={3} minH={0}>
          <HStack wrap="wrap">
            <SkillTag label={skill.category} />
            {skill.version && <SkillTag label={`v${skill.version}`} />}
            {skill.license && <SkillTag label={skill.license} />}
          </HStack>

          <VStack align="start" gap={2} w="100%" minH={0}>
            <Heading size="md" color="text.main" lineClamp={2}>
              {skill.title}
            </Heading>
            <Text color="text.secondary" fontSize="sm" lineHeight="tall" minH="72px" lineClamp={3}>
              {skill.description}
            </Text>
          </VStack>
        </VStack>

        <Button minH={10} size="sm" width="100%" variant="tertiary">
          View details
        </Button>
      </Card.Body>
    </Card.Root>
  );
});
