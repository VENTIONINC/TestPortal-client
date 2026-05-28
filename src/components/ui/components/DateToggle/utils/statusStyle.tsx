// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { LuCircleHelp, LuClock, LuSkipForward } from 'react-icons/lu';
import { AiOutlineCloseCircle, AiOutlineCheckCircle } from 'react-icons/ai';

import { ResultStatus } from '@/types';

export const getStatusStyle = (status: ResultStatus) => {
  switch (status) {
    case ResultStatus.Passed:
      return { Icon: AiOutlineCheckCircle, color: 'status.success' };
    case ResultStatus.Failed:
      return { Icon: AiOutlineCloseCircle, color: 'status.error' };
    case ResultStatus.Skipped:
      return { Icon: LuSkipForward, color: 'status.neutral' };
    case ResultStatus.TimedOut:
      return { Icon: LuClock, color: 'status.warning' };
    default:
      return { Icon: LuCircleHelp, color: 'status.unknown' };
  }
};
