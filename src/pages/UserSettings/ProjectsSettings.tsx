// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, SimpleGrid, Text, Button, Flex, HStack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { ProjectCard } from '@/components/ProjectCard';
import { useCreateProjectDialog } from '@/components/ui/components/Dialogs';
import { useProjectContextMenu } from '@/hooks';
import { Alert } from '@/components/ui';
export function ProjectsSettings() {
  const { data: projects } = useGetApiV2ProjectsQuery({});
  const openCreateProjectDialog = useCreateProjectDialog();
  const handleProjectContextMenu = useProjectContextMenu();

  if (!projects) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Failed to load projects</Alert.Title>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  if (!projects.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="text.muted">Create a new project to get started</Text>
        <Button mt={4} onClick={openCreateProjectDialog} variant="primary">
          <LuPlus /> Create Project
        </Button>
      </Box>
    );
  }

  return (
    <Box bg="bg.section" p="16px 15px 15px 17px" borderRadius="md">
      <Box mb={4}>
        <Flex justify="space-between" align="center">
          <Box>Projects</Box>
          <HStack>
            <Button onClick={openCreateProjectDialog} variant="primary" minW="162px">
              <LuPlus />
              Create Project
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onContextMenu={(evt, projectData) => handleProjectContextMenu(evt, projectData)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
