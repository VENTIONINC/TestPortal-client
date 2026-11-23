// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react';
import { Box, Text } from '@chakra-ui/react';

import type { ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';

import { ManualRunScenarioStep, type StepDraft } from './ManualRunScenarioStep';

interface ManualRunScenarioStepsProps {
  steps: ManualTestRunScenarioRead['steps'];
  result: ManualTestRunScenarioRead['result'];
  completed: boolean;
  stepDraft: Record<string, StepDraft>;
  openComments: Record<string, boolean>;
  setStepDraft: Dispatch<SetStateAction<Record<string, StepDraft>>>;
  setOpenComments: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export function ManualRunScenarioSteps({
  steps,
  result,
  completed,
  stepDraft,
  openComments,
  setStepDraft,
  setOpenComments,
}: ManualRunScenarioStepsProps) {
  const flagKind = result === 'failed' ? 'failed' : result === 'blocked' ? 'blocked' : null;

  return (
    <Box overflowX="auto" ml={{ base: 0, md: '-42px' }}>
      <Box minW="500px">
        <Box
          display="grid"
          gridTemplateColumns="30px minmax(0, calc(50% - 21px)) minmax(0, 1fr) 64px"
          gap={3}
          color="fg.muted"
          fontSize="xs"
          pb={2}
        >
          <Text pl={3}>#</Text>
          <Text>Steps</Text>
          <Text>Expected result</Text>
          <Text />
        </Box>
        {flagKind && !completed && (
          <Text color={flagKind === 'failed' ? 'red.600' : 'orange.600'} fontSize="13px" ml="42px" mb={3}>
            Flag the step where it {flagKind === 'failed' ? 'failed' : 'was blocked'}. Add a comment to any step to say
            what you saw.
          </Text>
        )}
        {[...steps]
          .sort((a, b) => a.position - b.position)
          .map((step, stepIndex) => {
            const draft = stepDraft[step.id] ?? {
              comment: '',
              failedFlag: false,
              failedComment: '',
              blockedFlag: false,
              blockedComment: '',
            };
            const flagged =
              flagKind === 'failed' ? draft.failedFlag : flagKind === 'blocked' ? draft.blockedFlag : false;
            const commentOpen = !flagged && Boolean(openComments[step.id] || draft.comment);
            const update = (patch: Partial<typeof draft>) =>
              setStepDraft((items) => ({ ...items, [step.id]: { ...draft, ...patch } }));
            const handleToggleStepFlag = () => {
              setStepDraft((items) => {
                const next = { ...items };
                const selecting = !flagged;
                if (selecting) {
                  for (const [id, item] of Object.entries(next)) {
                    if (id === step.id) continue;
                    if (flagKind === 'failed' && item.failedFlag) {
                      next[id] = { ...item, failedFlag: false, failedComment: '' };
                    } else if (flagKind === 'blocked' && item.blockedFlag) {
                      next[id] = { ...item, blockedFlag: false, blockedComment: '' };
                    }
                  }
                }
                next[step.id] = {
                  ...draft,
                  ...(flagKind === 'failed'
                    ? { failedFlag: selecting, failedComment: selecting ? draft.failedComment : '' }
                    : { blockedFlag: selecting, blockedComment: selecting ? draft.blockedComment : '' }),
                  comment: '',
                };
                return next;
              });
              setOpenComments((items) => ({ ...items, [step.id]: false }));
            };

            const handleOpenStepComment = () => {
              setOpenComments((items) => ({ ...items, [step.id]: true }));
              update({
                comment: draft.comment,
                ...(flagKind === 'failed'
                  ? { failedFlag: false, failedComment: '' }
                  : flagKind === 'blocked'
                    ? { blockedFlag: false, blockedComment: '' }
                    : {}),
              });
            };

            const handleClearStepComment = () => {
              update({ comment: '' });
              setOpenComments((items) => ({ ...items, [step.id]: false }));
            };

            return (
              <ManualRunScenarioStep
                key={step.id}
                step={step}
                stepNumber={stepIndex + 1}
                draft={draft}
                flagKind={flagKind}
                flagged={flagged}
                commentOpen={commentOpen}
                completed={completed}
                onUpdate={update}
                onToggleFlag={handleToggleStepFlag}
                onOpenComment={handleOpenStepComment}
                onClearComment={handleClearStepComment}
              />
            );
          })}
      </Box>
    </Box>
  );
}
