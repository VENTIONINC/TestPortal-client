import { Code } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, FileLocation } from '@/components/ui';
import { DefaultDialogProps, ResultError } from '@/types';

interface ResultsErrorDialogProps extends DefaultDialogProps {
  resultError: ResultError | null;
}

const renderTextWithFileLocations = (text: string) => {
  const fileLocationRegex = /(\([^:\s()]+:\d+(?::\d+)?\)|at\s+[^:\s]+:\d+(?::\d+)?)/g;
  const parts = text.split(fileLocationRegex);

  return parts.map((part, index) => {
    if (fileLocationRegex.test(part)) {
      return <FileLocation key={index} locationText={part} />;
    }
    return part;
  });
};

export const ResultsErrorDialog = ({ resultError, closeDialog }: ResultsErrorDialogProps) => {
  return (
    <Dialog title="Results Error" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Code size="lg" whiteSpace="pre-wrap" wordBreak="break-word">
          {resultError?.message && renderTextWithFileLocations(resultError.message)}
        </Code>

        {resultError?.callLog && resultError.callLog.length > 0 && (
          <Code size="lg" whiteSpace="pre-wrap" wordBreak="break-word" display="block">
            {renderTextWithFileLocations(resultError.callLog.join('\n'))}
          </Code>
        )}

        {resultError?.callStack && resultError.callStack.length > 0 && (
          <Code size="lg" whiteSpace="pre-wrap" wordBreak="break-word" display="block">
            {renderTextWithFileLocations(resultError.callStack.join('\n'))}
          </Code>
        )}
      </DialogBody>

      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
