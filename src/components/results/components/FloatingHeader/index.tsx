// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Box } from '@chakra-ui/react';

import { useStickyObserver } from '../../hooks';
import { ResultsFloatingHeaderContent } from './components';
import { ResultsFloatingHeaderProps } from './types';

export const ResultsFloatingHeader = memo(
  ({ availableDates, statistics, toggleDate, isFetching, availableTags, activeTags, onToggleTag }: ResultsFloatingHeaderProps) => {
    const { sentinelRef, isStuck } = useStickyObserver(66);

    return (
      <>
        {/* Invisible sentinel — when it scrolls out of view, header is "stuck" */}
        <Box ref={sentinelRef} h="1px" w="100%" mt="-1px" />
        <Box
          position="sticky"
          top="66px"
          zIndex={1}
          bg={isStuck ? 'bg.panel' : 'transparent'}
          boxShadow={isStuck ? 'sm' : 'none'}
          transition="background 0.2s, box-shadow 0.2s"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: '-30px',
            width: '30px',
            bg: 'bg.panel',
            opacity: isStuck ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-30px',
            width: '30px',
            bg: 'bg.panel',
            opacity: isStuck ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
        >
          <ResultsFloatingHeaderContent
            availableDates={availableDates}
            statistics={statistics}
            toggleDate={toggleDate}
            isFetching={isFetching}
            isStuck={isStuck}
            availableTags={availableTags}
            activeTags={activeTags}
            onToggleTag={onToggleTag}
          />
        </Box>
      </>
    );
  },
);

export * from './types';
export * from './components';
