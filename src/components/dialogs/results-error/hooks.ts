import { useDialogActions } from '@/redux/slices/dialog';
import { ResultError } from '@/types';

import { ResultsErrorDialog } from './results-error-dialog';

export const useResultsErrorDialog = () => {
  const { openDialog } = useDialogActions();

  return (resultError: ResultError) => openDialog(ResultsErrorDialog, { resultError });
};
