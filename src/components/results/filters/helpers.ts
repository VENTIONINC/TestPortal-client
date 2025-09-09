import { ResultStatus } from '@/types';

export const getStatusOptions = () => {
  return [
    { value: '', label: 'All' },
    ...Object.values(ResultStatus).map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    })),
  ];
};
