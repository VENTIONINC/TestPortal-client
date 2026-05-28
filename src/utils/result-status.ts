// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { LuCheck, LuCircleHelp, LuClock, LuSkipForward, LuX } from 'react-icons/lu';

import { ResultStatus } from '@/types';

export const getResultStatusStyle = (status: ResultStatus) => {
  switch (status) {
    case ResultStatus.Passed:
      return { Icon: LuCheck, title: 'Passed', tokenBase: 'status.success' };
    case ResultStatus.Failed:
      return { Icon: LuX, title: 'Failed', tokenBase: 'status.error' };
    case ResultStatus.Skipped:
      return { Icon: LuSkipForward, title: 'Skipped', tokenBase: 'status.neutral' };
    case ResultStatus.TimedOut:
      return { Icon: LuClock, title: 'Timed Out', tokenBase: 'status.attention' };
    default:
      return { Icon: LuCircleHelp, title: 'Unknown', tokenBase: 'status.neutral' };
  }
};
