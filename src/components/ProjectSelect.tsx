import { NativeSelect } from '@/components/ui';
import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';
import { useResultsActions } from '@/redux/slices/results';

export const ProjectSelect = () => {
  const { data: projects } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();
  const { updateFilters } = useResultsActions();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;

    setSelectedProjectId(projectId);
    updateFilters({ projectId });
  };

  const projectItems = projects!.map((project) => ({
    value: project.id.toString(),
    label: project.name,
  }));

  return <NativeSelect value={selectedProjectId} onChange={handleProjectChange} items={projectItems} />;
};
