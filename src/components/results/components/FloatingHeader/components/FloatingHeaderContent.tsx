import { memo, useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { DateToggle } from '@/components/ui';
import { ResultsStats } from '../../Stats';
import { ResultsFloatingHeaderProps } from '../types';
import { TagList } from './TagList';

export const ResultsFloatingHeaderContent = memo(
  ({ availableDates, statistics, toggleDate, isFetching, isStuck, availableTags = [] }: ResultsFloatingHeaderProps) => {
    const { setValue, watch } = useFormContext();
    const tagsValue = watch('tags') || [];
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTagClick = useCallback(
      (tag: string) => {
        const newValue = tagsValue.includes(tag) ? tagsValue.filter((t: string) => t !== tag) : [...tagsValue, tag];
        setValue('tags', newValue);
      },
      [setValue, tagsValue],
    );

    return (
      <>
        {/* Date line container */}
        <Box
          p={isStuck ? 0 : 2}
          mt={isStuck ? 1 : 0}
          mb={4}
          bg="bg.section"
          borderRadius="lg"
          shadow="cardSecondary"
          transition="padding 0.25s ease, margin 0.25s ease"
        >
          <DateToggle
            days={availableDates}
            toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)}
            size={isStuck ? 'small' : 'default'}
            isBorder={!isStuck}
          />
        </Box>

        {/* Stats and Tags container */}
        <Box
          mt={isStuck ? 1 : 0}
          p={isStuck ? 0 : 2}
          bg={isStuck ? 'transparent' : 'bg.section'}
          shadow={isStuck ? 'none' : 'cardSecondary'}
          borderRadius="md"
        >
          <ResultsStats
            typeView={isStuck ? 'tag' : 'badge'}
            statistics={statistics}
            isFetching={isFetching}
            size={isStuck ? 'small' : 'default'}
          />

          <TagList
            availableTags={availableTags}
            tagsValue={tagsValue}
            handleTagClick={handleTagClick}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            isStuck={isStuck}
          />
        </Box>
      </>
    );
  },
);
