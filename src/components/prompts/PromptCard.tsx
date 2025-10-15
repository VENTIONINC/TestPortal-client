import { Badge, Button, Card, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { PromptConfig } from '@/redux/apis/generatedApi';

import { getCategoryIcon, getCategoryColor } from './promptUtils';

interface PromptCardProps {
  prompt: PromptConfig;
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const navigate = useNavigate();
  const { icon: CategoryIcon, color: iconColor } = getCategoryIcon(prompt.category);
  const badgeColor = getCategoryColor(prompt.category);

  const parameterCount = Object.keys(prompt.parameters).length;
  const requiredParameterCount = Object.values(prompt.parameters).filter((p) => p.required).length;

  const handleUsePrompt = () => {
    navigate(`/prompts/${prompt.name}`);
  };

  return (
    <Card.Root
      variant="elevated"
      height="fit-content"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={handleUsePrompt}
    >
      <Card.Body gap={4}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={2} flex={1}>
            <HStack>
              <CategoryIcon size={20} color={iconColor} />
              <Badge colorPalette={badgeColor} variant="subtle" size="sm">
                {prompt.category}
              </Badge>
            </HStack>
            <Heading size="md" lineHeight="short">
              {prompt.title}
            </Heading>
          </VStack>
        </HStack>

        <Text fontSize="sm" color="gray.600" lineHeight="base" minHeight="48px">
          {prompt.description}
        </Text>

        <VStack align="start" gap={2}>
          <Text fontSize="xs" color="gray.500">
            {parameterCount} parameters ({requiredParameterCount} required)
          </Text>

          <Button size="sm" width="100%" colorPalette={badgeColor}>
            <LuArrowRight />
            Use This Prompt
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
