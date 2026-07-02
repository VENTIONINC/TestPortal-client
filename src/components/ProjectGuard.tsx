// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ReactNode, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId, useIsInitialized } from '@/redux/slices/projects';
import { LoadingPlaceholder } from '@/components/ui/LoadingPlaceholder';
import { PATHS } from '@/types/paths';

interface ProjectGuardProps {
  children: ReactNode;
}

export function ProjectGuard({ children }: ProjectGuardProps) {
  const { data: projects, isLoading } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const isInitialized = useIsInitialized();
  const { setSelectedProjectId, setIsInitialized } = useProjectsActions();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isLoading || !projects || isInitialized) {
      return;
    }
    if (projects.length === 0) {
      setIsInitialized(true);
      navigate(PATHS.USER_SETTINGS_PROJECTS);
      return;
    }

    // Only set project if no valid project is selected
    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const isCurrentProjectValid = currentProject && currentProject.isActive;

    if (!selectedProjectId || !isCurrentProjectValid) {
      const firstProject = projects.find((p) => p.isActive) || projects[0];
      setSelectedProjectId(firstProject.id);
    }

    setIsInitialized(true);
  }, [projects, selectedProjectId, setSelectedProjectId, isLoading, isInitialized, setIsInitialized, navigate]);

  if (!isInitialized) {
    return <LoadingPlaceholder />;
  }

  return <>{children}</>;
}
