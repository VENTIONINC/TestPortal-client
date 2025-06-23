import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { AnalysisCategory } from '@/types';

export const getAnalysisCategoryStyle = (category?: AnalysisCategory) => {
  if (!category) {
    return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.200' };
  }

  switch (category) {
    case AnalysisCategory.Bug:
      return { Icon: LuBug, color: 'red.500', hoverBgColor: 'red.200' };
    case AnalysisCategory.Script:
      return { Icon: LuCode, color: 'yellow.600', hoverBgColor: 'yellow.200' };
    case AnalysisCategory.Infra:
      return { Icon: LuServer, color: 'blue.500', hoverBgColor: 'blue.200' };
    case AnalysisCategory.Performance:
      return { Icon: LuCpu, color: 'orange.500', hoverBgColor: 'orange.200' };
    default:
      return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.200' };
  }
};
