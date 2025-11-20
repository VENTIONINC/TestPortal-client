import { ReactNode, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';
import { LoadingPlaceholder } from '@/components/ui/LoadingPlaceholder';
import { PATHS } from '@/types/paths';

interface ProjectGuardProps {
  children: ReactNode;
}

export function ProjectGuard({ children }: ProjectGuardProps) {
  const { data: projects, isLoading } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();
  const [isInitialized, setIsInitialized] = useState(false);
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

    const firstProject = projects.find((p) => p.isActive) || projects[0];
    setSelectedProjectId(firstProject.id);
    setIsInitialized(true);
  }, [projects, selectedProjectId, setSelectedProjectId, isLoading, isInitialized, navigate]);

  if (!isInitialized) {
    return <LoadingPlaceholder />;
  }

  return <>{children}</>;
}
