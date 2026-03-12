import { Heading, HStack, Text, VStack, Button, Card } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { PromptConfig } from '@/redux/apis/generatedApi';
import { Badge } from '@/components/ui';

import { getCategoryIcon, getCategoryColor } from './promptUtils';

interface PromptCardProps {
  prompt: PromptConfig;
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
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
      <Card.Body gap={4}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={2} flex={1}>
            <HStack>
              <Badge status={badgeColor}>
                <CategoryIcon size={20} color={iconColor} />
                {prompt.category}
              </Badge>
            </HStack>
            <Heading size="md" lineHeight="short" color="text.main">
              {prompt.title}
            </Heading>
          </VStack>
        </HStack>

        <Text fontSize="sm" color="text.muted" lineHeight="base" minHeight="48px">
          {prompt.description}
        </Text>

        <VStack align="start" gap={2} mt="auto">
          <Text fontSize="xs" color="text.muted">
            {parameterCount} parameters ({requiredParameterCount} required)
          </Text>

          <Button size="sm" width="100%" variant="tertiary">
            Use this prompt
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
