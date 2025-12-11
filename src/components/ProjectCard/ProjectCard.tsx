import { Badge, Card, Text, Heading, Flex, Box, Icon } from '@chakra-ui/react';
import { MouseEvent } from 'react';
import { FiCode, FiAlertCircle, FiPlay, FiLayers, FiCheckCircle } from 'react-icons/fi';

import { ContextMenuButton } from '@/components/ui';
import type { Project } from '@/redux/apis/generatedApi';

import { useProjectCardColors } from './hooks';

interface ProjectCardProps {
  project: Project;
  onContextMenu: (evt: MouseEvent, project: { id: string; isActive: boolean }) => void;
}

export function ProjectCard({ project, onContextMenu }: ProjectCardProps) {
  const { _count, name, description, id, isActive } = project;
  const { executions, issues, specs } = _count || {};

  const {
    cardBg,
    cardBorder,
    textColor,
    descriptionColor,
    mutedTextColor,
    cardHoverOrderColor,
    hoverShadow,
    gradientBg,
    issueColor,
    executionColor,
    specColor,
    activeOrderColor,
    activeIconColor,
    dividerColor,
  } = useProjectCardColors(isActive);

  return (
    <Card.Root
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor={cardBorder}
      bg={cardBg}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor="pointer"
      _hover={
        isActive
          ? {
              transform: 'translateY(-2px)',
              shadow: hoverShadow,
              borderColor: cardHoverOrderColor,
            }
          : {}
      }
    >
      {isActive && (
        <Box position="absolute" top={0} left={0} right={0} height="3px" background={gradientBg} opacity={0.8} />
      )}

      {isActive && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          background={gradientBg}
          opacity={0.02}
          pointerEvents="none"
        />
      )}

      <Card.Body p={6} position="relative">
        <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Flex direction="column" align="start" flex={1} gap={2}>
            <Flex gap={3} align="center" w="full">
              <Box p={2} borderRadius="lg" bg={isActive ? activeOrderColor : 'transparent'}>
                <Icon as={FiLayers} color={isActive ? activeIconColor : mutedTextColor} boxSize={5} />
              </Box>
              <Flex direction="column" align="start" gap={1} flex={1}>
                <Flex gap={2} align="center" wrap="wrap">
                  <Heading size="md" fontWeight="bold" color={textColor} lineHeight="shorter">
                    {name}
                  </Heading>
                  {isActive ? (
                    <Badge
                      colorScheme="green"
                      size="sm"
                      variant="subtle"
                      borderRadius="full"
                      px={2}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FiCheckCircle} boxSize={3} />
                      Active
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" size="sm" variant="subtle" borderRadius="full" px={2}>
                      Inactive
                    </Badge>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <ContextMenuButton onClick={(evt) => onContextMenu(evt, { id, isActive })} size="sm" />
        </Flex>

        {description && (
          <Box mb={4}>
            <Text
              color={descriptionColor}
              fontSize="sm"
              lineHeight="tall"
              overflow="hidden"
              textOverflow="ellipsis"
              display="-webkit-box"
              css={{
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </Text>
          </Box>
        )}

        {_count && (
          <>
            <Box height="1px" bg={dividerColor} opacity={isActive ? 1 : 0.5} mb={4} />

            <Flex justify="space-between" gap={6}>
              <Flex direction="column" align="center" flex={1} gap={1}>
                <Flex gap={2} align="center">
                  <Icon as={FiAlertCircle} color={isActive ? issueColor : mutedTextColor} boxSize={4} />
                  <Text fontSize="lg" fontWeight="bold" color={isActive ? issueColor : mutedTextColor}>
                    {issues || 0}
                  </Text>
                </Flex>
                <Text
                  fontSize="xs"
                  color={mutedTextColor}
                  textTransform="uppercase"
                  letterSpacing="wide"
                  fontWeight="medium"
                >
                  Issues
                </Text>
              </Flex>

              <Flex direction="column" align="center" flex={1} gap={1}>
                <Flex gap={2} align="center">
                  <Icon as={FiPlay} color={isActive ? executionColor : mutedTextColor} boxSize={4} />
                  <Text fontSize="lg" fontWeight="bold" color={isActive ? executionColor : mutedTextColor}>
                    {executions || 0}
                  </Text>
                </Flex>
                <Text
                  fontSize="xs"
                  color={mutedTextColor}
                  textTransform="uppercase"
                  letterSpacing="wide"
                  fontWeight="medium"
                >
                  Results
                </Text>
              </Flex>

              <Flex direction="column" align="center" flex={1} gap={1}>
                <Flex gap={2} align="center">
                  <Icon as={FiCode} color={isActive ? specColor : mutedTextColor} boxSize={4} />
                  <Text fontSize="lg" fontWeight="bold" color={isActive ? specColor : mutedTextColor}>
                    {specs || 0}
                  </Text>
                </Flex>
                <Text
                  fontSize="xs"
                  color={mutedTextColor}
                  textTransform="uppercase"
                  letterSpacing="wide"
                  fontWeight="medium"
                >
                  Specs
                </Text>
              </Flex>
            </Flex>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
