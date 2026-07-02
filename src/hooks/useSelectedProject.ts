import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';

export function useSelectedProject() {
  const selectedProjectId = useSelectedProjectId();
  const { data: projects, isLoading } = useGetApiV2ProjectsQuery({});

  const project = projects?.find((p) => p.id === selectedProjectId);

  return {
    project,
    selectedProjectId,
    isLoading,
  };
}
