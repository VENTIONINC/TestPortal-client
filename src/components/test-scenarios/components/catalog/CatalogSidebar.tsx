// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { DragEvent, ReactNode } from 'react';
import { Box, Button, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { FiFolder, FiLayers, FiList, FiPlus } from 'react-icons/fi';

import type {
  CatalogEditorForm,
  CatalogFolder,
  CatalogFolderRow,
  CatalogSuite,
  TestScenarioCatalogViewProps,
} from './types';
import { CATALOG_SCOPE, getFolderChildren, UNFILED_DESTINATION } from './utils';

const UnfiledFolderIcon = () => (
  <svg
    aria-hidden="true"
    width="22"
    height="22"
    style={{ display: 'block', flexShrink: 0 }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M2.5 6.5a2 2 0 0 1 2-2h4.8l2.6 2.6h7.6a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2z"
      strokeDasharray="2 2"
    />
  </svg>
);

export const CatalogSidebar = ({
  organizationTab,
  scope,
  folders,
  suites,
  organizationLoading,
  organizationError,
  projectScenarioCount,
  unfiledScenarioCount,
  selectedFolder,
  folderScenarioCounts,
  isDraggingScenario,
  dragOverFolderId,
  changeScope,
  startInlineFolder,
  inlineFolderParentId,
  inlineFolderName,
  inlineFolderError,
  setInlineFolderName,
  onCancelFolderDraft,
  submitInlineFolder,
  showSuiteDraft,
  onCreateSuite,
  handleScenarioDragOver,
  handleScenarioDrop,
  onDragLeave,
  onSuiteDragOver,
  handleSuiteDrop,
  editor,
}: {
  organizationTab?: TestScenarioCatalogViewProps['organizationTab'];
  scope: TestScenarioCatalogViewProps['scope'];
  folders: CatalogFolder[];
  suites: CatalogSuite[];
  organizationLoading: boolean;
  organizationError?: unknown;
  projectScenarioCount: number;
  unfiledScenarioCount: number;
  selectedFolder?: CatalogFolderRow;
  folderScenarioCounts: Map<string, number>;
  isDraggingScenario: boolean;
  dragOverFolderId: string | null;
  changeScope: TestScenarioCatalogViewProps['onScopeChange'];
  startInlineFolder: (parentId: string | null) => void;
  inlineFolderParentId: string | null | undefined;
  inlineFolderName: string;
  inlineFolderError: string | null;
  setInlineFolderName: (name: string) => void;
  onCancelFolderDraft: () => void;
  submitInlineFolder: () => Promise<void>;
  showSuiteDraft: boolean;
  onCreateSuite: () => void;
  handleScenarioDragOver: (event: DragEvent<HTMLElement>, destinationId: string) => void;
  handleScenarioDrop: (event: DragEvent<HTMLElement>, destinationId: string | null) => void;
  onDragLeave: (destinationId: string) => void;
  onSuiteDragOver: (event: DragEvent<HTMLElement>, suiteId: string) => void;
  handleSuiteDrop: (event: DragEvent<HTMLElement>, suiteId: string) => void;
  editor: CatalogEditorForm;
}) => {
  const renderFolder = (folder: CatalogFolder): ReactNode => {
    const children = getFolderChildren(folder);
    const selected = scope.kind === CATALOG_SCOPE.folder && scope.id === folder.id;
    return (
      <Box key={folder.id}>
        <HStack gap={0}>
          <Button
            flex="1"
            minW="0"
            size="sm"
            px={2}
            ps={1}
            variant={selected || dragOverFolderId === folder.id ? 'subtle' : 'ghost'}
            colorPalette={selected || dragOverFolderId === folder.id ? 'blue' : undefined}
            borderStartWidth="3px"
            borderStartColor={selected || dragOverFolderId === folder.id ? 'blue.500' : 'transparent'}
            outline={dragOverFolderId === folder.id ? '2px dashed' : undefined}
            outlineColor="blue.500"
            outlineOffset="-2px"
            alignItems="center"
            justifyContent="flex-start"
            aria-current={selected ? 'page' : undefined}
            onClick={() => changeScope({ kind: 'folder', id: folder.id })}
            onDragOver={(event) => handleScenarioDragOver(event, folder.id)}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onDragLeave(folder.id);
            }}
            onDrop={(event) => handleScenarioDrop(event, folder.id)}
          >
            <FiFolder size={22} style={{ display: 'block', flexShrink: 0 }} />
            <Text display="flex" alignItems="center" flex="1" textAlign="left" lineClamp={1}>
              {folder.name}
            </Text>
            <Text color="text.muted" fontSize="xs">
              {folderScenarioCounts.get(folder.id) ?? folder.scenarioCount}
            </Text>
          </Button>
        </HStack>
        {children.map((child) => (
          <Box key={child.id} ps={4}>
            {renderFolder(child)}
          </Box>
        ))}
        {inlineFolderParentId === folder.id && (
          <Box ps={4} py={1}>
            <Input
              autoFocus
              size="sm"
              aria-label="New folder name"
              placeholder="Subfolder name"
              border="1px solid"
              borderColor="blue.500"
              _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
              value={inlineFolderName}
              disabled={editor.isSubmitting}
              onChange={(event) => setInlineFolderName(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onCancelFolderDraft();
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void submitInlineFolder();
                }
              }}
            />
            {inlineFolderError && (
              <Text role="alert" color="fg.error" fontSize="xs">
                {inlineFolderError}
              </Text>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <VStack
      align="stretch"
      gap={4}
      pe={{ base: 0, lg: 4 }}
      borderEndWidth={{ base: 0, lg: '1px' }}
      borderColor={isDraggingScenario ? 'blue.200' : 'border.main'}
      bg={isDraggingScenario ? 'blue.50' : 'bg.card'}
      outline={isDraggingScenario ? '1px solid' : undefined}
      outlineColor="blue.200"
      outlineOffset="4px"
      borderRadius={isDraggingScenario ? 'sm' : undefined}
      aria-label="Scenario organization"
    >
      {organizationTab !== 'suites' && (
        <VStack align="stretch" gap={1}>
          <Button
            size="sm"
            p={1}
            justifyContent="flex-start"
            variant={scope.kind === CATALOG_SCOPE.all ? 'subtle' : 'ghost'}
            colorPalette={scope.kind === CATALOG_SCOPE.all ? 'blue' : undefined}
            borderStartWidth="3px"
            borderStartColor={scope.kind === CATALOG_SCOPE.all ? 'blue.500' : 'transparent'}
            aria-current={scope.kind === CATALOG_SCOPE.all ? 'page' : undefined}
            onClick={() => changeScope({ kind: 'all' })}
          >
            <FiLayers />
            All scenarios
            <Text ml="auto" color="text.muted" fontSize="xs">
              {projectScenarioCount}
            </Text>
          </Button>
        </VStack>
      )}
      {organizationTab !== 'suites' && (
        <Box>
          <HStack justify="space-between" px={2} mb={1}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              color="text.secondary"
              textTransform="uppercase"
            >
              Folders
            </Text>
            <IconButton
              size="xs"
              variant="ghost"
              color="text.secondary"
              aria-label={selectedFolder ? 'Create subfolder' : 'Create folder'}
              title={selectedFolder ? 'Create inside selected folder' : 'Create folder'}
              disabled={Boolean(selectedFolder && selectedFolder.depth >= 2)}
              onClick={() => startInlineFolder(selectedFolder?.id ?? null)}
            >
              <FiPlus />
            </IconButton>
          </HStack>
          {organizationLoading ? (
            <Text px={2} color="text.muted" fontSize="sm">
              Loading folders…
            </Text>
          ) : organizationError ? (
            <Text px={2} color="fg.error" fontSize="sm" role="alert">
              Folders could not be loaded.
            </Text>
          ) : folders.length === 0 && inlineFolderParentId !== null ? (
            <Text px={2} color="text.muted" fontSize="sm">
              No folders yet
            </Text>
          ) : (
            <VStack align="stretch" gap={0}>
              {inlineFolderParentId === null && (
                <Box py={1}>
                  <Input
                    autoFocus
                    size="sm"
                    aria-label="New folder name"
                    placeholder="Folder name, Enter to create"
                    border="1px solid"
                    borderColor="blue.500"
                    _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
                    value={inlineFolderName}
                    disabled={editor.isSubmitting}
                    onChange={(event) => setInlineFolderName(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') onCancelFolderDraft();
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void submitInlineFolder();
                      }
                    }}
                  />
                  {inlineFolderError && (
                    <Text role="alert" color="fg.error" fontSize="xs">
                      {inlineFolderError}
                    </Text>
                  )}
                </Box>
              )}
              {folders.map(renderFolder)}
            </VStack>
          )}
        </Box>
      )}
      {organizationTab !== 'suites' && (
        <Button
          size="sm"
          minH="24px"
          px={1.5}
          gap={3}
          variant="ghost"
          alignItems="center"
          justifyContent="flex-start"
          aria-current={scope.kind === 'unfiled' ? 'page' : undefined}
          onClick={() => changeScope({ kind: 'unfiled' })}
          bg={scope.kind === 'unfiled' || dragOverFolderId === UNFILED_DESTINATION ? 'blue.subtle' : undefined}
          outline={dragOverFolderId === UNFILED_DESTINATION ? '2px dashed' : undefined}
          outlineColor="blue.500"
          outlineOffset="-2px"
          color={scope.kind === 'unfiled' ? 'blue.fg' : 'text.main'}
          _hover={{ bg: 'bg.subtle' }}
          onDragOver={(event) => handleScenarioDragOver(event, UNFILED_DESTINATION)}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onDragLeave(UNFILED_DESTINATION);
          }}
          onDrop={(event) => handleScenarioDrop(event, null)}
        >
          <UnfiledFolderIcon />
          <Text display="flex" alignItems="center" fontStyle="italic">
            No folder
          </Text>
          <Text ml="auto" color="text.muted" fontSize="xs">
            {unfiledScenarioCount}
          </Text>
        </Button>
      )}
      {organizationTab !== 'scenarios' && (
        <Box>
          <HStack justify="space-between" px={2} mb={1}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              color="text.secondary"
              textTransform="uppercase"
            >
              Suites
            </Text>
            <IconButton size="xs" variant="ghost" aria-label="Create suite" onClick={() => onCreateSuite()}>
              <FiPlus />
            </IconButton>
          </HStack>
          {showSuiteDraft && (
            <form onSubmit={(event) => void editor.onSubmit(event)}>
              <Box py={1}>
                <Input
                  aria-label="Suite name"
                  autoFocus
                  size="sm"
                  maxLength={120}
                  value={editor.name}
                  placeholder="Suite name, Enter to create"
                  border="1px solid"
                  borderColor="blue.500"
                  _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
                  disabled={editor.isSubmitting}
                  onChange={(event) => editor.onNameChange(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') editor.onCancel();
                    if (event.key === 'Enter' && !editor.name.trim()) {
                      event.preventDefault();
                      editor.onCancel();
                    }
                  }}
                />
                {editor.error && (
                  <Text role="alert" color="fg.error" fontSize="xs">
                    {editor.error}
                  </Text>
                )}
              </Box>
            </form>
          )}
          {organizationLoading ? (
            <Text px={2} color="text.muted" fontSize="sm">
              Loading suites…
            </Text>
          ) : organizationError ? (
            <Text px={2} color="fg.error" fontSize="sm" role="alert">
              Suites could not be loaded.
            </Text>
          ) : suites.length === 0 && !showSuiteDraft ? (
            <VStack align="stretch" px={2} py={2} gap={2}>
              <Text color="text.secondary" fontSize="sm">
                No suites yet
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" gap={0}>
              {suites.map((suite) => {
                const selected = scope.kind === CATALOG_SCOPE.suite && scope.id === suite.id;
                return (
                  <Button
                    key={suite.id}
                    size="sm"
                    variant={selected ? 'subtle' : 'ghost'}
                    colorPalette={selected ? 'blue' : undefined}
                    borderStartWidth="3px"
                    borderStartColor={selected ? 'blue.500' : 'transparent'}
                    justifyContent="flex-start"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => changeScope({ kind: 'suite', id: suite.id })}
                    onDragOver={(event) => onSuiteDragOver(event, suite.id)}
                    onDragLeave={() => onDragLeave(suite.id)}
                    onDrop={(event) => handleSuiteDrop(event, suite.id)}
                    outline={dragOverFolderId === suite.id ? '2px dashed' : undefined}
                    outlineColor="blue.500"
                  >
                    <FiList aria-hidden="true" />
                    <Text flex="1" textAlign="left" lineClamp={1}>
                      {suite.name}
                    </Text>
                    <Text color="text.muted" fontSize="xs">
                      {suite.members?.length ?? 0}
                    </Text>
                  </Button>
                );
              })}
            </VStack>
          )}
        </Box>
      )}
    </VStack>
  );
};
