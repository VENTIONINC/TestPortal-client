// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FormEvent } from 'react';
import { Button, Input, Text, Textarea, VStack } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect } from '@/components/ui';

import type { CatalogEditor, CatalogEditorForm, CatalogFolder, CatalogFolderRow, CatalogSuite } from './types';
import { flattenFolders } from './utils';

export const DeleteSelectedScenariosDialog = ({
  count,
  isDeletingSelected,
  onClose,
  onConfirm,
}: {
  count: number;
  isDeletingSelected: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) => (
  <Dialog title={`Delete ${count} selected scenario${count === 1 ? '' : 's'}?`} onClose={onClose}>
    <DialogBody>
      <Text>
        This permanently deletes the selected scenarios. Only scenarios in this confirmed selection will be deleted.
      </Text>
    </DialogBody>
    <DialogFooter>
      <Button type="button" variant="ghost" disabled={isDeletingSelected} onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="button"
        colorPalette="red"
        loading={isDeletingSelected}
        disabled={isDeletingSelected}
        onClick={() => void onConfirm()}
      >
        Delete {count} scenarios
      </Button>
    </DialogFooter>
  </Dialog>
);

export const RemoveScenariosFromSuiteDialog = ({
  count,
  isRemovingFromSuite,
  removeFromSuiteError,
  onClose,
  onSubmit,
}: {
  count: number;
  isRemovingFromSuite: boolean;
  removeFromSuiteError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) => (
  <Dialog title={`Remove ${count} scenario${count === 1 ? '' : 's'} from suite`} onClose={onClose}>
    <form onSubmit={(event) => void onSubmit(event)}>
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <Text color="text.secondary">The selected scenarios will remain in the project and other suites.</Text>
          {removeFromSuiteError && (
            <Text role="alert" color="fg.error">
              {removeFromSuiteError}
            </Text>
          )}
        </VStack>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isRemovingFromSuite}
          disabled={isRemovingFromSuite || count === 0}
        >
          Remove {count} scenario{count === 1 ? '' : 's'}
        </Button>
      </DialogFooter>
    </form>
  </Dialog>
);

export const CatalogOrganizationDialog = ({
  createDialog,
  selectedFolder,
  targetFolder,
  targetSuite,
  moveParentId,
  folderRows,
  folderScenarioCounts,
  isInFolderSubtree,
  setMoveParentId,
  editor,
}: {
  createDialog: Extract<CatalogEditor, 'folder' | 'move-folder' | 'delete-folder' | 'delete-suite'>;
  selectedFolder?: CatalogFolder;
  targetFolder: CatalogFolder | null;
  targetSuite: CatalogSuite | null;
  moveParentId: string;
  folderRows: CatalogFolderRow[];
  folderScenarioCounts: Map<string, number>;
  isInFolderSubtree: (candidateId: string, folderId: string) => boolean;
  setMoveParentId: (id: string) => void;
  editor: CatalogEditorForm;
}) => (
  <Dialog
    title={
      createDialog === 'folder'
        ? selectedFolder
          ? `Create folder inside ${selectedFolder.name}`
          : 'Create folder'
        : createDialog === 'move-folder'
          ? `Move ${targetFolder?.name ?? 'folder'}`
          : createDialog === 'delete-folder'
            ? `Delete folder “${targetFolder?.name ?? 'folder'}”?`
            : `Delete suite “${targetSuite?.name ?? ''}”?`
    }
    onClose={editor.onCancel}
  >
    <form onSubmit={(event) => void editor.onSubmit(event)}>
      <DialogBody>
        <VStack align="stretch" gap={4}>
          {createDialog === 'folder' && (
            <label>
              <Text mb={1}>Name</Text>
              <Input
                autoFocus
                required
                maxLength={200}
                value={editor.name}
                onChange={(event) => editor.onNameChange(event.currentTarget.value)}
                bg={undefined}
              />
            </label>
          )}
          {createDialog === 'folder' && (
            <label>
              <Text mb={1}>Description (optional)</Text>
              <Textarea
                value={editor.description}
                onChange={(event) => editor.onDescriptionChange(event.currentTarget.value)}
              />
            </label>
          )}
          {createDialog === 'move-folder' && targetFolder && (
            <NativeSelect
              label="Parent folder"
              value={moveParentId}
              onChange={(event) => setMoveParentId(event.currentTarget.value)}
            >
              <option value="">Root level</option>
              {folderRows
                .filter((folder) => !isInFolderSubtree(folder.id, targetFolder.id))
                .map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {'　'.repeat(folder.depth)}
                    {folder.name}
                  </option>
                ))}
            </NativeSelect>
          )}
          {createDialog === 'delete-folder' &&
            targetFolder &&
            (() => {
              const nestedFolders = flattenFolders([targetFolder]).slice(1);
              const nestedFolderCount = nestedFolders.length;
              const scenarioCount = folderScenarioCounts.get(targetFolder.id) ?? targetFolder.scenarioCount;

              return (
                <Text>
                  {nestedFolderCount === 0
                    ? `All ${scenarioCount} scenarios in this folder will move to No folder. Scenarios are not deleted.`
                    : `Its ${nestedFolderCount} subfolder${nestedFolderCount === 1 ? '' : 's'} ${nestedFolders.map((folder) => `“${folder.name}”`).join(', ')} will be deleted as well. All ${scenarioCount} scenario${scenarioCount === 1 ? '' : 's'} from these folders will move to No folder. Scenarios are not deleted.`}
                </Text>
              );
            })()}
          {createDialog === 'delete-suite' && (
            <Text color="text.secondary">
              {targetSuite?.members?.length ?? 0} scenario{targetSuite?.members?.length === 1 ? '' : 's'} will be
              unlinked from this suite. The scenarios themselves stay in the catalog. This can’t be undone.
            </Text>
          )}
          {editor.error && (
            <Text role="alert" color="fg.error">
              {editor.error}
            </Text>
          )}
        </VStack>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={editor.onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant={['delete-folder', 'delete-suite'].includes(createDialog) ? 'solid' : 'primary'}
          colorPalette={['delete-folder', 'delete-suite'].includes(createDialog) ? 'red' : undefined}
          disabled={editor.isSubmitting || (createDialog === 'folder' && !editor.name.trim())}
          loading={editor.isSubmitting}
        >
          {createDialog === 'folder'
            ? 'Create'
            : createDialog === 'move-folder'
              ? 'Move'
              : ['delete-folder', 'delete-suite'].includes(createDialog)
                ? 'Delete'
                : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  </Dialog>
);
