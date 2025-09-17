import { ReactNode, useEffect } from 'react';
import { Box, Flex, Image } from '@chakra-ui/react';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';
import { useResultsActions } from '@/redux/slices/results';

interface ProjectGuardProps {
  children: ReactNode;
}

export function ProjectGuard({ children }: ProjectGuardProps) {
  const { data: projects, isLoading } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();
  const { updateFilters } = useResultsActions();

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      const firstProject = projects[0];
      setSelectedProjectId(firstProject.id.toString());
      updateFilters({ projectId: firstProject.id.toString() });
    }
  }, [projects, selectedProjectId, setSelectedProjectId, updateFilters]);

  if (isLoading) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="gray.50"
        _dark={{ bg: "gray.900" }}
      >
        <Box mb={8}>
          <Image
            src="/Gemini_Generated_Image_fbnppgfbnppgfbnp.jpg"
            alt="Test Analysis Portal"
            maxW="300px"
            h="auto"
          />
        </Box>
      </Flex>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return <>{children}</>;
}