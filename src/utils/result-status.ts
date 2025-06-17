import { LuCheck, LuCircleHelp, LuClock, LuSkipForward, LuX } from 'react-icons/lu';

import { ResultStatus } from '@/types';

export const getResultStatusStyle = (status: ResultStatus) => {
  switch (status) {
    case ResultStatus.Passed:
      return { Icon: LuCheck, title: 'Passed', color: 'green.600' };
    case ResultStatus.Failed:
      return { Icon: LuX, title: 'Failed', color: 'red.600' };
    case ResultStatus.Skipped:
      return { Icon: LuSkipForward, title: 'Skipped', color: 'yellow.600' };
    case ResultStatus.TimedOut:
      return { Icon: LuClock, title: 'Timed Out', color: 'orange.600' };
    default:
      return { Icon: LuCircleHelp, title: 'Unknown', color: 'gray.600' };
  }
};
