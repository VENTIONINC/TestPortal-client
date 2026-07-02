// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Badge, Card, Text, Heading, Flex, Box, Icon } from '@chakra-ui/react';
import { MouseEvent } from 'react';
import { FiCode, FiAlertCircle, FiPlay } from 'react-icons/fi';
import { FaRegFolder } from 'react-icons/fa6';

import { ContextMenuButton, ClipboardCopyText } from '@/components/ui';
import type { Project } from '@/redux/apis/generatedApi';
import { getIssueCategoryStyle } from '@/utils';
import { IssueCategory } from '@/types';

import { useProjectCardColors } from './hooks';

interface ProjectCardProps {
  project: Project;
  onContextMenu: (evt: MouseEvent, project: { id: string; name: string; isActive: boolean }) => void;
}

const colorSet = {
  activeIssues: {
    _light: 'rgba(255, 69, 69, 0.1)',
    _dark: 'rgba(224, 53, 56, 0.1)',
  },
  activeIssuesColor: {
    _light: '#FF4545',
    _dark: '#E03538 ',
  },
  activeResults: {
    _light: 'rgba(31, 230, 71, 0.1)',
    _dark: 'rgba(44, 217, 88, 0.1)',
  },
  activeResultsColor: {
    _light: '#1FE647',
    _dark: '#2CD958',
  },
  activeSpecs: {
    _light: 'rgba(110, 200, 255, 0.1)',
    _dark: 'rgba(110, 200, 255, 0.1)',
  },
  activeSpecsColor: {
    _light: '#6EC8FF',
    _dark: '#3AA9FF',
  },
  defaultBgColor: {
    _light: '#F9FAFB',
    _dark: '#333337',
  },
  defaultColor: {
    _light: '#11181C',
    _dark: '#E1E1E6',
  },
  counterColor: {
    _light: '#333333',
    _dark: '#EAEAEA',
  },
  color: {
    _light: '#666666',
    _dark: '#B2B2B2',
  },
};

export function ProjectCard({ project, onContextMenu }: ProjectCardProps) {
  const { _count, name, description, id, isActive } = project;
  const { executions, issues, specs } = _count || {};

  const { textColor, descriptionColor, cardHoverOrderColor, hoverShadow, gradientBg } = useProjectCardColors(isActive);

  const infoPanel = [
    {
      label: 'Issues',
      value: issues || 0,
      icon: FiAlertCircle,
      color: isActive ? colorSet.activeIssuesColor : colorSet.defaultColor,
      bg: isActive ? colorSet.activeIssues : colorSet.defaultBgColor,
      colorCounter: colorSet.counterColor,
    },
    {
      label: 'Results',
      value: executions || 0,
      icon: FiPlay,
      color: isActive ? colorSet.activeResultsColor : colorSet.defaultColor,
      bg: isActive ? colorSet.activeResults : colorSet.defaultBgColor,
      colorCounter: colorSet.counterColor,
    },
    {
      label: 'Specs',
      value: specs || 0,
      icon: FiCode,
      color: isActive ? colorSet.activeSpecsColor : colorSet.defaultColor,
      bg: isActive ? colorSet.activeSpecs : colorSet.defaultBgColor,
      colorCounter: colorSet.counterColor,
    },
  ];

  return (
    <Card.Root
      position="relative"
      overflow="hidden"
      bg="bg.cardSecondary"
      borderRadius="xl"
      borderColor="border.secondary"
      boxShadow="0px 1px 2px rgba(0, 0, 0, 0.08)"
      minH="233px"
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

      <Card.Body position="relative" p={0}>
        <Flex justifyContent="space-between" alignItems="center" p="8px 6px 15px 8px">
          <Flex direction="column" align="start" flex={1}>
            <Flex align="center" w="full">
              <Box
                borderRadius="lg"
                bg="bg.page"
                w="36px"
                h="36px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr="16px"
              >
                {/* <Icon as={FiLayers} color={isActive ? activeIconColor : mutedTextColor} boxSize={5} /> */}
                <FaRegFolder />
              </Box>
              <Flex direction="column" align="start" flex={1}>
                <Flex flexDirection="column">
                  <Heading size="md" fontWeight="bold" color={textColor} lineHeight="shorter" mb="5px">
                    {name}
                  </Heading>

                  <Badge
                    colorScheme={isActive ? 'green' : 'gray'}
                    variant="subtle"
                    borderRadius="full"
                    fontSize="12px"
                    h="22px"
                    maxW="fit-content"
                    px="5px"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="border.secondary"
                    bg="bg.section"
                  >
                    <Box
                      w={2}
                      h={2}
                      bg={isActive ? 'status.success' : 'status.neutral'}
                      borderRadius="full"
                      mr="3px"
                      mb="1px"
                    />
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <ContextMenuButton onClick={(evt) => onContextMenu(evt, { id, name, isActive })} size="sm" />
        </Flex>

        {description && (
          <Box mx="8px" mb="13px">
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

        <ClipboardCopyText
          value={id}
          fontSize="xs"
          color={colorSet.color}
          bg={colorSet.defaultBgColor}
          p="0 4px"
          borderRadius="md"
          w="fit-content"
          mx="8px"
        >
          ID: {id}
        </ClipboardCopyText>

        <Box mx="8px" mt="12px" mb="4px">
          <Text fontSize="xs" fontWeight="semibold" color={descriptionColor} mb="6px">
            Category weights:
          </Text>
          <Flex gap={2} wrap="wrap">
            {[
              { key: 'bug', type: IssueCategory.Bug },
              { key: 'infra', type: IssueCategory.Infra },
              { key: 'script', type: IssueCategory.Script },
              { key: 'performance', type: IssueCategory.Performance },
              { key: 'other', type: IssueCategory.Other },
            ].map((cat) => {
              const weight = project.categoryWeights?.[cat.key as keyof typeof project.categoryWeights] ?? 100;
              const style = getIssueCategoryStyle(cat.type);
              const IconComponent = style.Icon;

              return (
                <Flex
                  key={cat.key}
                  align="center"
                  gap={1.5}
                  px="8px"
                  py="3px"
                  borderRadius="md"
                  bg="bg.subtle"
                  border="1px solid"
                  borderColor="border.muted"
                >
                  <Icon as={IconComponent} color={style.color} boxSize="12px" />
                  <Text fontSize="10px" fontWeight="medium" color="fg.muted">
                    {style.name || 'Other'}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="fg">
                    {weight}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>

        {_count && (
          <>
            {/* <Box height="1px" bg={dividerColor} opacity={isActive ? 1 : 0.5} mb={4} mt="auto" /> */}

            <Flex
              justify="space-between"
              mt="auto"
              mb="10px"
              borderTop="1px solid border.secondary"
              p="15px 7px 0 8px"
              gap={3}
            >
              {infoPanel.map((info) => (
                <Flex key={info.label} direction="column" align="center" flex={1} gap={1} bg={info.bg}>
                  <Box>
                    <Flex gap={2} align="center">
                      <Icon as={info.icon} color={info.color} boxSize={4} />
                      <Text
                        fontSize="xs"
                        color={info.color}
                        textTransform="uppercase"
                        letterSpacing="wide"
                        fontWeight="medium"
                      >
                        {info.label}
                      </Text>
                    </Flex>
                  </Box>

                  <Text fontSize="lg" fontWeight="bold" color={info.colorCounter}>
                    {info.value}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
