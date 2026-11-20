// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Input, Text, Textarea } from '@chakra-ui/react';

interface ManualRunScenarioEvidenceProps {
  executionComment: string;
  defectReference: string;
  readOnly: boolean;
  onChangeComment: (value: string) => void;
  onChangeDefectReference: (value: string) => void;
}

export function ManualRunScenarioEvidence({
  executionComment,
  defectReference,
  readOnly,
  onChangeComment,
  onChangeDefectReference,
}: ManualRunScenarioEvidenceProps) {
  return (
    <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={3} mt={4}>
      <Box>
        <Text fontSize="xs" color="fg.muted">
          Comment on the scenario
        </Text>
        <Textarea
          aria-label="Comment on the scenario"
          id="run-comment"
          size="sm"
          mt={1}
          placeholder="Add a comment"
          value={executionComment}
          readOnly={readOnly}
          bg={readOnly ? 'bg.subtle' : 'bg.panel'}
          onChange={(event) => onChangeComment(event.target.value)}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted">
          Bug or ticket
        </Text>
        <Input
          aria-label="Bug or ticket"
          id="run-defect"
          size="sm"
          mt={1}
          placeholder="https://youtrack… or https://jira…"
          value={defectReference}
          readOnly={readOnly}
          bg={readOnly ? 'bg.subtle' : 'bg.panel'}
          onChange={(event) => onChangeDefectReference(event.target.value)}
        />
      </Box>
    </Box>
  );
}
