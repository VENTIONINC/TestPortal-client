import { Box, Code } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps, ResultError } from '@/types';

interface ResultsErrorDialogProps extends DefaultDialogProps {
  resultError: ResultError | null;
}

export const ResultsErrorDialog = ({ resultError, closeDialog }: ResultsErrorDialogProps) => {
  return (
    <Dialog title="Results Error" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        {resultError?.message && (
          <Box>
            <Code display="block" size="lg" whiteSpace="pre-wrap" wordBreak="break-word">
              {resultError.message}
            </Code>
          </Box>
        )}

        {resultError?.callLog && resultError.callLog.length > 0 && (
          <Box>
            <Code display="block" size="lg" whiteSpace="pre-wrap" wordBreak="break-word">
              {resultError.callLog.join('\n')}
            </Code>
          </Box>
        )}

        {resultError?.callStack && resultError.callStack.length > 0 && (
          <Box>
            <Code display="block" size="lg" whiteSpace="pre-wrap" wordBreak="break-word">
              {resultError.callStack.join('\n')}
            </Code>
          </Box>
        )}
      </DialogBody>

      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
