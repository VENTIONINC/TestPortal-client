// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ChangeEvent } from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';

import { NativeSelect } from '@/components/ui';
import type { Project } from '@/redux/apis/generatedApi';

type ProjectOption = Pick<Project, 'id' | 'name'>;

interface PromptProjectSelectProps {
  projects: ProjectOption[];
  selectedProject?: ProjectOption;
  isLoading: boolean;
  hasError: boolean;
  validationError?: string;
  onSelect: (projectId: string) => void;
  onRetry: () => void;
}

export function PromptProjectSelect({
  projects,
  selectedProject,
  isLoading,
  hasError,
  validationError,
  onSelect,
  onRetry,
}: PromptProjectSelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelect(event.target.value);
  };

  const handleRetry = () => {
    onRetry();
  };

  if (isLoading) return <Text>Loading projects...</Text>;

  if (hasError) {
    return (
      <VStack align="stretch">
        <Text color="status.error.text">Unable to load projects.</Text>
        <Button onClick={handleRetry}>Retry loading projects</Button>
      </VStack>
    );
  }

  if (projects.length === 0) {
    return <Text>No active projects are available. Create or activate a project to continue.</Text>;
  }

  const items = [
    { value: '', label: 'Select a project' },
    ...projects.map(project => ({ value: project.id, label: project.name })),
  ];

  return (
    <VStack align="stretch">
      <NativeSelect
        label="Project"
        error={validationError}
        value={selectedProject?.id ?? ''}
        onChange={handleChange}
        items={items}
      />
      {selectedProject ? (
        <Text fontSize="sm">{selectedProject.name} — {selectedProject.id}</Text>
      ) : (
        <Text fontSize="sm" color="status.error.text">Select an active project to generate a prompt.</Text>
      )}
    </VStack>
  );
}
