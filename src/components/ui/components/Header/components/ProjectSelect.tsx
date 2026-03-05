import { NativeSelect } from '@/components/ui';
import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';

export const ProjectSelect = () => {
  const { data: projects } = useGetApiV2ProjectsQuery({});
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;

    setSelectedProjectId(projectId);
  };

  const projectItems = projects!
    .filter((project) => project.isActive)
    .map((project) => ({
      value: project.id,
      label: project.name,
    }));

  return <NativeSelect maxH={8} value={selectedProjectId} onChange={handleProjectChange} items={projectItems} />;
};
