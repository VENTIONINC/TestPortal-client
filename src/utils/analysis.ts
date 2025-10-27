import { LuBug, LuCircleHelp, LuCode, LuCpu, LuServer } from 'react-icons/lu';

import { AnalysisCategory } from '@/types';

export const getAnalysisCategoryStyle = (category?: AnalysisCategory) => {
  if (!category) {
    return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.100' };
  }

  switch (category) {
    case AnalysisCategory.Bug:
      return { Icon: LuBug, color: 'red.500', hoverBgColor: 'red.100' };
    case AnalysisCategory.Script:
      return { Icon: LuCode, color: 'yellow.600', hoverBgColor: 'yellow.100' };
    case AnalysisCategory.Infra:
      return { Icon: LuServer, color: 'blue.500', hoverBgColor: 'blue.100' };
    case AnalysisCategory.Performance:
      return { Icon: LuCpu, color: 'orange.500', hoverBgColor: 'orange.100' };
    default:
      return { Icon: LuCircleHelp, color: 'gray.500', hoverBgColor: 'gray.100' };
  }
};

export const getConfidenceLabel = (confidence?: number): string => {
  if (!confidence) return '';

  switch (confidence) {
    case 1:
      return 'Not Confident';
    case 2:
      return 'Somewhat';
    case 3:
      return 'Moderate';
    case 4:
      return 'Confident';
    case 5:
      return 'Very Confident';
    default:
      return String(confidence);
  }
};
