import { type ComponentProps } from 'react';
import { Box } from '@chakra-ui/react';

import { DateToggle } from '@/components/ui';
import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

import { ResultsStats } from '../Stats';
import { useStickyObserver } from '../../hooks';

interface ResultsFloatingHeaderProps {
  availableDates: ComponentProps<typeof DateToggle>['days'];
  statistics?: ResultsStatsResponse;
  toggleDate: (day: string) => void;
  isFetching?: boolean;
  isStuck?: boolean;
}

const ResultsFloatingHeaderContent = ({ availableDates, statistics, toggleDate, isFetching, isStuck }: ResultsFloatingHeaderProps) => {
  return (
    <>
      <Box
        p={isStuck ? 0 : 2}
        mt={isStuck ? 1 : 0}
        bg="bg.section"
        borderRadius="lg"
        shadow="card"
        transition="padding 0.25s ease, margin 0.25s ease"
      >
        <DateToggle days={availableDates} toggleHandler={(day) => toggleDate(day.yyyy_mm_dd)} size={isStuck ? 'small' : 'default'} isBorder={!isStuck}/>
      </Box>
      <Box display="grid" mt={isStuck ? 1 : 0}>
        {/* Badge view — visible when NOT stuck */}
        <Box
          gridArea="1 / 1"
          opacity={isStuck ? 0 : 1}
          pointerEvents={isStuck ? 'none' : 'auto'}
          position={isStuck ? 'absolute' : 'relative'}
          transition="opacity 0.2s ease"
        >
          <ResultsStats typeView="badge" statistics={statistics} isFetching={isFetching} size="default" />
        </Box>

        {/* Tag view — visible when stuck */}
        <Box
          gridArea="1 / 1"
          opacity={isStuck ? 1 : 0}
          pointerEvents={isStuck ? 'auto' : 'none'}
          position={isStuck ? 'relative' : 'absolute'}
          transition="opacity 0.3s ease"
        >
          <ResultsStats typeView="tag" statistics={statistics} isFetching={isFetching} size="small" />
        </Box>
      </Box>
    </>
  );
};

export const ResultsFloatingHeader = ({ availableDates, statistics, toggleDate, isFetching }: ResultsFloatingHeaderProps) => {
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
        />
      </Box>
    </>
  );
};
