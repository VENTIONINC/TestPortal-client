// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Button, Card, Heading, HStack, Text, VStack } from '@chakra-ui/react';

import { SkillMetadata } from '@/redux/apis/generatedApi';

import { SkillTag } from './SkillTag';

interface SkillCardProps {
  skill: SkillMetadata;
  onSelect: (skillName: string) => void;
}

export const SkillCard = memo(function SkillCard({ skill, onSelect }: SkillCardProps) {
  return (
    <Card.Root
      variant="elevated"
      bg="bg.cardSecondary"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'card',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onSelect(skill.name)}
    >
      <Card.Body p={4} gap={4}>
        <VStack align="start" gap={3}>
          <HStack wrap="wrap">
            <SkillTag label={skill.category} />
            {skill.version && <SkillTag label={`v${skill.version}`} />}
            {skill.license && <SkillTag label={skill.license} />}
          </HStack>

          <VStack align="start" gap={2}>
            <Heading size="md" color="text.main">
              {skill.title}
            </Heading>
            <Text color="text.secondary" fontSize="sm" lineHeight="tall" minH="72px">
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
