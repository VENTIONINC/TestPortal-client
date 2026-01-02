import { Box, SimpleGrid, Text, Heading, Button, Flex } from '@chakra-ui/react';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { ProjectCard } from '@/components/ProjectCard';
import { useCreateProjectDialog } from '@/components/dialogs';
import { useProjectContextMenu } from '@/hooks';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export function ProjectsSettings() {
  const { data: projects, error } = useGetApiV2ProjectsQuery({});
  const openCreateProjectDialog = useCreateProjectDialog();
  const handleProjectContextMenu = useProjectContextMenu();
  const { alerts, text, borders } = useSurfaceColors();

  if (!projects || error) {
    return (
      <Box p={4} bg={alerts.error.bg} borderRadius="md" border="1px" borderColor={alerts.error.border}>
        <Text color={alerts.error.text}>Failed to load projects</Text>
      </Box>
    );
  }

  if (!projects.length) {
    return (
      <Box textAlign="center" py={8}>
        <Text color={text.muted}>Create a new project to get started</Text>
        <Button mt={4} onClick={openCreateProjectDialog}>
          Create Project
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md" color={text.primary}>
          Projects ({projects.length})
        </Heading>
        <Button onClick={openCreateProjectDialog}>Create Project</Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
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
