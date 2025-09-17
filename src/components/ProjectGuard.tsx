import { ReactNode, useLayoutEffect } from 'react';

import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';
import { LoadingPlaceholder } from '@/components/ui/LoadingPlaceholder';

interface ProjectGuardProps {
  children: ReactNode;
}

export function ProjectGuard({ children }: ProjectGuardProps) {
  const { data: projects, isLoading } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();

  useLayoutEffect(() => {
    if (isLoading || !projects || projects.length === 0 || selectedProjectId) {
      return;
    }

    const firstProject = projects[0];
    setSelectedProjectId(firstProject.id.toString());
  }, [projects, selectedProjectId, setSelectedProjectId, isLoading]);

  if (isLoading || !selectedProjectId) {
    return <LoadingPlaceholder />;
  }

  if (projects && projects.length === 0) {
    return null;
  }

  return <>{children}</>;
}
