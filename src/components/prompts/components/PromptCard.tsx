// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Heading, HStack, Text, VStack, Button, Card } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { PromptConfig } from '@/redux/apis/generatedApi';
import { Badge } from '@/components/ui';

import { getCategoryIcon, getCategoryColor } from '../utils';

interface PromptCardProps {
  prompt: PromptConfig;
}

export const PromptCard = memo(function PromptCard({ prompt }: PromptCardProps) {
  const navigate = useNavigate();
  const { icon: CategoryIcon, color: iconColor } = getCategoryIcon(prompt.category);
  const badgeColor = getCategoryColor(prompt.category) as
    | 'default'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'attention';

  const parameterCount = Object.keys(prompt.parameters).length;
  const requiredParameterCount = Object.values(prompt.parameters).filter((p) => p.required).length;

  const handleUsePrompt = () => {
    navigate(`/prompts/${prompt.name}`);
  };

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
      onClick={handleUsePrompt}
    >
      <Card.Body p={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" flex={1}>
            <HStack mb={2}>
              <Badge status={badgeColor} minH={6} >
                <CategoryIcon size={12} color={iconColor} />
                {prompt.category}
              </Badge>
            </HStack>
            <Heading size="md" lineHeight="short" color="text.main" mb={4}>
              {prompt.title}
            </Heading>
          </VStack>
        </HStack>

        <Text fontSize="xs" mb={1} color="text.secondary" lineHeight="base" minHeight="48px">
          {prompt.description}
        </Text>

        <VStack align="start" mt="auto">
          <Text fontSize="xs" color="text.secondary" mb={2}>
            {parameterCount} parameters ({requiredParameterCount} required)
          </Text>

          <Button minH={10} size="sm" width="100%" variant="tertiary">
            Use this prompt
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
});
