import { memo, useState } from 'react';
import { Box } from '@chakra-ui/react';

import { DateToggle } from '@/components/ui';

import { ResultsStats } from '../../Stats';
import { ResultsFloatingHeaderProps } from '../types';
import { TagList } from './TagList';

export const ResultsFloatingHeaderContent = memo(
  ({
    availableDates,
    statistics,
    toggleDate,
    isFetching,
    isStuck,
    availableTags = [],
    activeTags = [],
    onToggleTag,
  }: ResultsFloatingHeaderProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
            tagsValue={activeTags}
            handleTagClick={onToggleTag || (() => {})}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            isStuck={isStuck}
          />
        </Box>
      </>
    );
  },
);
