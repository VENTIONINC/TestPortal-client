// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, Heading, HStack, IconButton, Input, Menu, Text, Textarea, VStack } from '@chakra-ui/react';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit,
  FiFolderPlus,
  FiLayers,
  FiMoreHorizontal,
  FiMove,
  FiPlus,
  FiPlay,
  FiTrash2,
} from 'react-icons/fi';

import { Tooltip } from '@/components/ui';

import type {
  CatalogInlineEditor,
  CatalogEditorForm,
  CatalogFolder,
  CatalogFolderRow,
  CatalogSuite,
  TestScenarioCatalogViewProps,
} from './types';
import { CATALOG_SCOPE } from './utils';
import { ManageTagsButton } from '../../tags';

interface CatalogHeaderProps {
  projectId?: string;
  inlineEditor: CatalogInlineEditor | null;
  selectedSuite?: CatalogSuite;
  selectedFolder?: CatalogFolderRow;
  selectedFolderPath?: string;
  scope: TestScenarioCatalogViewProps['scope'];
  isScenariosTab: boolean;
  isSelectedSuiteEmpty: boolean;
  isExecutingOperation: boolean;
  handleRunSuite: () => Promise<void>;
  onManageScenarios: () => void;
  startEditSuite: () => void;
  onDeleteSuite: (suite: CatalogSuite) => void;
  onCreateScenario?: () => void;
  startInlineFolder: (parentId: string | null) => void;
  startRenameFolder: (folder: CatalogFolder) => void;
  selectedFolderIndex: number;
  selectedFolderSiblingCount: number;
  reorderFolder: (folder: CatalogFolder, direction: -1 | 1) => Promise<void>;
  openFolderActionDialog: (kind: 'move-folder' | 'delete-folder', folder: CatalogFolder) => void;
  editor: CatalogEditorForm;
}

export const CatalogHeader = ({
  projectId,
  inlineEditor,
  selectedSuite,
  selectedFolder,
  selectedFolderPath,
  scope,
  isScenariosTab,
  isSelectedSuiteEmpty,
  isExecutingOperation,
  handleRunSuite,
  onManageScenarios,
  startEditSuite,
  onDeleteSuite,
  onCreateScenario,
  startInlineFolder,
  startRenameFolder,
  selectedFolderIndex,
  selectedFolderSiblingCount,
  reorderFolder,
  openFolderActionDialog,
  editor,
}: CatalogHeaderProps) => (
  <Box>
    <HStack justify="space-between" align="start" gap={3} flexWrap="wrap">
      <Box minW="0" flex="1">
        {(inlineEditor === 'edit-suite' && selectedSuite) || (inlineEditor === 'rename-folder' && selectedFolder) ? (
          <form onSubmit={(event) => void editor.onSubmit(event)}>
            <Grid templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) auto' }} alignItems="start" gap={3}>
              <VStack align="stretch" gap={2}>
                <label>
                  <Text mb={1} fontSize="xs" color="text.secondary">
                    {inlineEditor === 'rename-folder' ? 'Folder name' : 'Name'}
                  </Text>
                  <Input
                    aria-label={inlineEditor === 'rename-folder' ? 'Folder name' : 'Suite name'}
                    autoFocus
                    required
                    maxLength={200}
                    value={editor.name}
                    onChange={(event) => editor.onNameChange(event.currentTarget.value)}
                  />
                </label>
                <label>
                  <Text mb={1} fontSize="xs" color="text.secondary">
                    {inlineEditor === 'rename-folder' ? 'Description (optional)' : 'Description'}
                  </Text>
                  <Textarea
                    aria-label={inlineEditor === 'rename-folder' ? 'Description (optional)' : 'Suite description'}
                    value={editor.description}
                    onChange={(event) => editor.onDescriptionChange(event.currentTarget.value)}
                  />
                </label>
                {editor.error && (
                  <Text role="alert" color="fg.error" fontSize="sm">
                    {editor.error}
                  </Text>
                )}
              </VStack>
              <HStack justify="flex-end" pt={{ base: 0, md: 5 }}>
                <Button size="sm" variant="ghost" type="button" onClick={() => editor.onCancel()}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={!editor.name.trim() || editor.isSubmitting}
                  loading={editor.isSubmitting}
                >
                  Save changes
                </Button>
              </HStack>
            </Grid>
          </form>
        ) : (
          <Heading fontSize="lg" lineHeight="1.3">
            {selectedFolderPath ??
              selectedSuite?.name ??
              (scope.kind === CATALOG_SCOPE.suite
                ? 'Select a suite'
                : scope.kind === 'unfiled'
                  ? 'No folder scenarios'
                  : 'All scenarios')}
          </Heading>
        )}
        {inlineEditor !== 'edit-suite' && inlineEditor !== 'rename-folder' && selectedFolder?.description && (
          <Text mt={1} color="text.secondary" fontSize="sm">
            {selectedFolder.description}
          </Text>
        )}
        {inlineEditor !== 'edit-suite' && selectedSuite && (
          <Text mt={1} color="text.muted" fontSize="sm">
            {selectedSuite.description?.trim() || 'No description'}
          </Text>
        )}
      </Box>
      {selectedSuite && inlineEditor !== 'edit-suite' && (
        <HStack>
          <Tooltip
            content="Add scenarios to run this suite"
            openDelay={500}
            closeDelay={0}
            disabled={!isSelectedSuiteEmpty}
          >
            <Button
              variant="primary"
              disabled={isSelectedSuiteEmpty || isExecutingOperation}
              loading={isExecutingOperation}
              data-disabled={isSelectedSuiteEmpty ? '' : undefined}
              cursor={isSelectedSuiteEmpty ? 'not-allowed' : 'pointer'}
              bg={isSelectedSuiteEmpty ? 'button.primary.bg.disabled' : undefined}
              color={isSelectedSuiteEmpty ? 'button.primary.color' : undefined}
              opacity={1}
              _hover={isSelectedSuiteEmpty ? { bg: 'button.primary.bg.disabled', boxShadow: 'none' } : undefined}
              onClick={() => void handleRunSuite()}
            >
              <FiPlay aria-hidden="true" />
              Run suite
            </Button>
          </Tooltip>
          <Button variant="outline" onClick={onManageScenarios}>
            <FiLayers />
            Manage scenarios
          </Button>
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton aria-label="Suite actions" variant="outline">
                <FiMoreHorizontal />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="edit" onClick={startEditSuite}>
                  <HStack justify="left" w="full">
                    <FiEdit aria-hidden="true" />
                    <Text>Edit suite details</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item value="delete" color="fg.error" onClick={() => onDeleteSuite(selectedSuite)}>
                  <HStack justify="left" w="full">
                    <FiTrash2 aria-hidden="true" />
                    <Text>Delete suite</Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </HStack>
      )}
      <HStack gap={2}>
        {isScenariosTab && projectId && inlineEditor !== 'rename-folder' && <ManageTagsButton projectId={projectId} />}
        {isScenariosTab && inlineEditor !== 'rename-folder' && (
          <Button aria-label="Create Test Scenario" variant="primary" onClick={onCreateScenario}>
            <FiPlus />
            Create scenario
          </Button>
        )}
        {isScenariosTab && selectedFolder && inlineEditor !== 'rename-folder' && (
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <IconButton aria-label="Folder actions" size="md" variant="outline">
                <FiMoreHorizontal />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content minW="210px" p="1" borderRadius="lg">
                {selectedFolder && selectedFolder.depth < 2 && (
                  <Menu.Item
                    value="create-folder"
                    minH="32px"
                    gap="3"
                    onClick={() => startInlineFolder(selectedFolder.id)}
                  >
                    <FiFolderPlus aria-hidden="true" />
                    New subfolder
                  </Menu.Item>
                )}
                {selectedFolder && (
                  <>
                    <Menu.Item
                      value="rename-folder"
                      minH="32px"
                      gap="3"
                      onClick={() => startRenameFolder(selectedFolder)}
                    >
                      <FiEdit aria-hidden="true" />
                      Edit folder details
                    </Menu.Item>
                    <Menu.Item
                      value="move-folder-up"
                      minH="32px"
                      gap="3"
                      disabled={selectedFolderIndex <= 0}
                      onClick={() => void reorderFolder(selectedFolder, -1)}
                    >
                      <FiArrowUp aria-hidden="true" />
                      Move up
                    </Menu.Item>
                    <Menu.Item
                      value="move-folder-down"
                      minH="32px"
                      gap="3"
                      disabled={selectedFolderIndex < 0 || selectedFolderIndex >= selectedFolderSiblingCount - 1}
                      onClick={() => void reorderFolder(selectedFolder, 1)}
                    >
                      <FiArrowDown aria-hidden="true" />
                      Move down
                    </Menu.Item>
                    <Menu.Item
                      value="move-folder"
                      minH="32px"
                      gap="3"
                      onClick={() => openFolderActionDialog('move-folder', selectedFolder)}
                    >
                      <FiMove aria-hidden="true" />
                      Move
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item
                      value="delete-folder"
                      minH="32px"
                      gap="3"
                      color="fg.error"
                      onClick={() => openFolderActionDialog('delete-folder', selectedFolder)}
                    >
                      <FiTrash2 aria-hidden="true" />
                      Delete folder
                    </Menu.Item>
                  </>
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </HStack>
    </HStack>
  </Box>
);
