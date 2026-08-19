// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Button, Stack } from '@chakra-ui/react';

import { Drawer, DrawerBody, Input, Textarea, toaster } from '@/components/ui';
import { useConfirmIssueDeletionDialog } from '@/components/ui/components/Dialogs';
import {
  useDeleteApiV2IssuesByIssueIdMutation,
  usePatchApiV2IssuesByIssueIdMutation,
  usePostApiV2ErrorFormatterMutation,
} from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import type { DefaultDrawerProps, IssueCore } from '@/types';

interface EditIssueDrawerProps extends DefaultDrawerProps {
  issue: IssueCore;
}

export function EditIssueDrawer({ issue, closeDrawer }: EditIssueDrawerProps) {
  const projectId = useSelectedProjectId();
  const [name, setName] = useState(issue.name);
  const [description, setDescription] = useState(issue.description ?? '');
  const [updateIssue, updateState] = usePatchApiV2IssuesByIssueIdMutation();
  const [deleteIssue, deleteState] = useDeleteApiV2IssuesByIssueIdMutation();
  const [formatIssue, formatState] = usePostApiV2ErrorFormatterMutation();

  const update = async () => {
    if (!name.trim()) return;
    try {
      await updateIssue({
        issueId: issue.id,
        updateIssueRequest: { name: name.trim(), description },
      }).unwrap();
      closeDrawer();
    } catch {
      toaster.create({ title: 'Failed to update issue', type: 'error' });
    }
  };

  const remove = async () => {
    try {
      await deleteIssue({ issueId: issue.id, projectId }).unwrap();
      closeDrawer();
    } catch {
      toaster.create({ title: 'Failed to delete issue', type: 'error' });
    }
  };

  const polish = async () => {
    try {
      const formatted = await formatIssue({
        errorFormatterRequest: { name, description },
      }).unwrap();
      setName(formatted.name);
      setDescription(formatted.description);
    } catch {
      toaster.create({ title: 'Failed to polish issue', type: 'error' });
    }
  };

  const confirmDelete = useConfirmIssueDeletionDialog({ onConfirm: remove });

  return (
    <Drawer title="Edit issue" onClose={closeDrawer}>
      <DrawerBody>
        <Stack gap={4}>
          <Input name="issue-name" label="Issue name" value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea
            name="description"
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            minH="140px"
          />
          <Button variant="outline" loading={formatState.isLoading} onClick={() => void polish()}>Polish with AI</Button>
          <Button loading={updateState.isLoading} disabled={!name.trim()} onClick={() => void update()}>Update</Button>
          <Button variant="secondaryError" loading={deleteState.isLoading} onClick={confirmDelete}>Delete</Button>
        </Stack>
      </DrawerBody>
    </Drawer>
  );
}
