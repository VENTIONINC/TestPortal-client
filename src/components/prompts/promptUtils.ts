import { LuCode, LuFileText, LuTrendingUp, LuZap } from 'react-icons/lu';
import { IconType } from 'react-icons';

export interface CategoryIconConfig {
  icon: IconType;
  color: string;
}

export const getCategoryIcon = (category: string): CategoryIconConfig => {
  switch (category) {
    case 'development':
      return { icon: LuCode, color: 'blue.500' };
    case 'reporting':
      return { icon: LuFileText, color: 'green.500' };
    case 'analysis':
      return { icon: LuTrendingUp, color: 'purple.500' };
    case 'performance':
      return { icon: LuZap, color: 'orange.500' };
    default:
      return { icon: LuCode, color: 'gray.500' };
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'development':
      return 'blue';
    case 'reporting':
      return 'green';
    case 'analysis':
      return 'purple';
    case 'performance':
      return 'orange';
    default:
      return 'gray';
  }
};