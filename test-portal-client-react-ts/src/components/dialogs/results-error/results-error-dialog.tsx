import { Code } from "@chakra-ui/react";

import { Dialog, DialogBody, DialogFooter, DialogProps } from "@/components/ui";
import { ResultError } from "@/utils/models";

interface ResultsErrorDialogProps extends Omit<DialogProps, "children"> {
  resultError: ResultError | null;
}

export const ResultsErrorDialog = ({
  resultError,
  ...props
}: ResultsErrorDialogProps) => {
  return (
    <Dialog size="lg" {...props}>
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Code size="lg">{resultError?.message}</Code>

        {resultError?.callLog?.length > 0 && (
          <Code size="lg" whiteSpace="pre">
            {resultError?.callLog.join("\n")}
          </Code>
        )}

        {resultError?.callStack?.length > 0 && (
          <Code size="lg">{resultError?.callStack.join("\n")}</Code>
        )}
      </DialogBody>

      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
