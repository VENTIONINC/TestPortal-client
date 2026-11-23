// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, type FormEvent } from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect } from '@/components/ui';
import type { DefaultDialogProps } from '@/types';

import type { CatalogFolderRow, TestScenarioCatalogViewProps } from '../types';
import { useCatalogConfirmation } from './hooks/useCatalogConfirmation';

interface MoveFolderOptions {
  kind: 'move-folder';
  targetId: string;
  targetName: string;
  parentId: string | null;
  destinations: CatalogFolderRow[];
  moveFolder: TestScenarioCatalogViewProps['onUpdateFolder'];
}

interface DeleteFolderOptions {
  kind: 'delete-folder';
  targetId: string;
  targetName: string;
  nestedFolderNames: string[];
  scenarioCount: number;
  deleteFolder: TestScenarioCatalogViewProps['onDeleteFolder'];
  onDeleted: (result: Awaited<ReturnType<TestScenarioCatalogViewProps['onDeleteFolder']>>) => void;
}

interface DeleteSuiteOptions {
  kind: 'delete-suite';
  targetId: string;
  targetName: string;
  scenarioCount: number;
  deleteSuite: TestScenarioCatalogViewProps['onDeleteSuite'];
}

export type CatalogOrganizationDialogOptions = MoveFolderOptions | DeleteFolderOptions | DeleteSuiteOptions;

interface CatalogOrganizationDialogProps extends DefaultDialogProps {
  options: CatalogOrganizationDialogOptions;
}

const describeFolderDeletion = ({ nestedFolderNames, scenarioCount }: DeleteFolderOptions) => {
  const nestedFolderCount = nestedFolderNames.length;
  if (!nestedFolderCount) {
    return `All ${scenarioCount} scenarios in this folder will move to No folder. Scenarios are not deleted.`;
  }

  const names = nestedFolderNames.map((name) => `“${name}”`).join(', ');
  return `Its ${nestedFolderCount} subfolder${nestedFolderCount === 1 ? '' : 's'} ${names} will be deleted as well. All ${scenarioCount} scenario${scenarioCount === 1 ? '' : 's'} from these folders will move to No folder. Scenarios are not deleted.`;
};

export const CatalogOrganizationDialog = ({ closeDialog, options }: CatalogOrganizationDialogProps) => {
  const isMove = options.kind === 'move-folder';
  const isFolderDeletion = options.kind === 'delete-folder';
  const title = isMove
    ? `Move ${options.targetName}`
    : `Delete ${isFolderDeletion ? 'folder' : 'suite'} “${options.targetName}”?`;
  const [parentId, setParentId] = useState(isMove ? options.parentId ?? '' : '');
  const { error, isSubmitting, onCancel, onConfirm } = useCatalogConfirmation(
    async () => {
      if (options.kind === 'move-folder') {
        await options.moveFolder(options.targetId, { parentId: parentId || null });
      } else if (options.kind === 'delete-folder') {
        return options.deleteFolder(options.targetId);
      } else {
        await options.deleteSuite(options.targetId);
      }
    },
    closeDialog,
    (result) => {
      if (options.kind === 'delete-folder' && result) options.onDeleted(result);
    },
  );
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onConfirm();
  };

  return (
    <Dialog
      title={title}
      onClose={onCancel}
      closeOnEscape={!isSubmitting}
      closeOnInteractOutside={!isSubmitting}
      closeTriggerProps={{ disabled: isSubmitting }}
    >
      <form onSubmit={handleSubmit}>
        <DialogBody>
          <VStack align="stretch" gap={4}>
            {isMove ? (
              <NativeSelect
                label="Parent folder"
                value={parentId}
                disabled={isSubmitting}
                onChange={(event) => setParentId(event.currentTarget.value)}
              >
                <option value="">Root level</option>
                {options.destinations.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {'　'.repeat(folder.depth)}
                    {folder.name}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              isFolderDeletion ? (
                <Text>{describeFolderDeletion(options)}</Text>
              ) : (
                <Text color="text.secondary">
                  {options.scenarioCount} scenario{options.scenarioCount === 1 ? '' : 's'} will be unlinked from this
                  suite. The scenarios themselves stay in the catalog. This can’t be undone.
                </Text>
              )
            )}
            {error && <Text role="alert" color="fg.error">{error}</Text>}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isMove ? 'primary' : 'solid'}
            colorPalette={isMove ? undefined : 'red'}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isMove ? 'Move' : 'Delete'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
