import { Box, SimpleGrid, Text, Heading, Spinner, Button, Flex } from '@chakra-ui/react';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { ProjectCard } from '@/components/ProjectCard';
import { useCreateProjectDialog } from '@/components/dialogs';
import { useProjectContextMenu } from '@/components/context-menu/hooks';

export function ProjectsSettings() {
  const { data: projects, isLoading, error } = useGetApiV2ProjectsQuery({});
  const openCreateProjectDialog = useCreateProjectDialog();
  const handleProjectContextMenu = useProjectContextMenu();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.700">Failed to load projects</Text>
      </Box>
    );
  }

  if (!projects?.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No projects found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Projects ({projects.length})</Heading>
        <Button onClick={openCreateProjectDialog}>Create Project</Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onContextMenu={(evt, projectData) => handleProjectContextMenu(evt, projectData)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
