import { LuCode, LuFileText, LuTrendingUp, LuZap } from 'react-icons/lu';
import { IconType } from 'react-icons';

export interface CategoryIconConfig {
  icon: IconType;
  color: string;
}

export const getCategoryIcon = (category: string): CategoryIconConfig => {
  switch (category) {
    case 'development':
      return { icon: LuCode, color: 'status.info.icon' };
    case 'reporting':
      return { icon: LuFileText, color: 'status.success.icon' };
    case 'analysis':
      return { icon: LuTrendingUp, color: 'status.attention.icon' };
    case 'performance':
      return { icon: LuZap, color: 'status.attention.icon' };
    default:
      return { icon: LuCode, color: 'status.neutral.icon' };
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'development':
      return 'info';
    case 'reporting':
      return 'success';
    case 'analysis':
      return 'attention';
    case 'performance':
      return 'warning';
    default:
      return 'default';
  }
};
