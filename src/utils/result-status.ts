import { LuCheck, LuCircleHelp, LuClock, LuSkipForward, LuX } from 'react-icons/lu';

import { ResultStatus } from '@/types';

export const getResultStatusStyle = (status: ResultStatus) => {
  switch (status) {
    case ResultStatus.Passed:
      return { Icon: LuCheck, title: 'Passed', color: 'status.success' };
    case ResultStatus.Failed:
      return { Icon: LuX, title: 'Failed', color: 'status.error' };
    case ResultStatus.Skipped:
      return { Icon: LuSkipForward, title: 'Skipped', color: 'status.textColor' };
    case ResultStatus.TimedOut:
      return { Icon: LuClock, title: 'Timed Out', color: 'status.warning' };
    default:
      return { Icon: LuCircleHelp, title: 'Unknown', color: 'status.unknown' };
  }
};
