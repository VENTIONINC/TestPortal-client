import { LuCircleCheck, LuCircleSlash, LuCircleX, LuClockAlert } from 'react-icons/lu';

import { ResultStatus } from '@/types';

import { type StatusMeta } from './types';

export const STATUS_ORDER = [
  ResultStatus.Passed,
  ResultStatus.Failed,
  ResultStatus.Skipped,
  ResultStatus.TimedOut,
] as const;

export const STATUS_META: Record<ResultStatus, StatusMeta> = {
  [ResultStatus.Passed]: {
    title: 'Passed',
    Icon: LuCircleCheck,
  },
  [ResultStatus.Failed]: {
    title: 'Failed',
    Icon: LuCircleX,
  },
  [ResultStatus.Skipped]: {
    title: 'Skipped',
    Icon: LuCircleSlash,
  },
  [ResultStatus.TimedOut]: {
    title: 'Timed out',
    Icon: LuClockAlert,
  },
};
