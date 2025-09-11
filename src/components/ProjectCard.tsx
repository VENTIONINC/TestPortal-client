import { Card, Text, Heading } from '@chakra-ui/react';

import type { Project } from '@/redux/apis/generatedApi';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { _count, name, description, id } = project;
  const { executions, issues, specs } = _count || {};

  return (
    <Card.Root p={4}>
      <Card.Body>
        <Heading size="sm" mb={2}>
          {name}
        </Heading>
        {description && (
          <Text color="gray.600" fontSize="sm" mb={2}>
            {description}
          </Text>
        )}
        {_count && (
          <Text fontSize="xs" color="gray.500" mb={1}>
            Issues: {issues || 0} • Results: {executions || 0} • Specs: {specs || 0}
          </Text>
        )}
        <Text fontSize="xs" color="gray.500">
          ID: {id}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
