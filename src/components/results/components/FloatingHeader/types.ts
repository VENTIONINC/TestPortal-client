import { type ComponentProps } from 'react';
import { DateToggle } from '@/components/ui';
import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

export interface ResultsFloatingHeaderProps {
  availableDates: ComponentProps<typeof DateToggle>['days'];
  statistics?: ResultsStatsResponse;
  toggleDate: (day: string) => void;
  isFetching?: boolean;
  isStuck?: boolean;
  availableTags?: string[];
}

export interface TagListProps {
  availableTags: string[];
  tagsValue: string[];
  handleTagClick: (tag: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isStuck?: boolean;
}
