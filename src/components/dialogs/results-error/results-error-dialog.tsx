import { Code } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps, ResultError } from '@/types';

interface ResultsErrorDialogProps extends DefaultDialogProps {
  resultError: ResultError | null;
}

export const ResultsErrorDialog = ({ resultError, closeDialog }: ResultsErrorDialogProps) => {
  return (
    <Dialog title="Results Error" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Code size="lg">{resultError?.message}</Code>

        {resultError?.callLog && resultError.callLog.length > 0 && (
          <Code size="lg" whiteSpace="pre">
            {resultError.callLog.join('\n')}
          </Code>
        )}

        {resultError?.callStack && resultError.callStack.length > 0 && (
          <Code size="lg" whiteSpace="pre">
            {resultError.callStack.join('\n')}
          </Code>
        )}
      </DialogBody>

      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
