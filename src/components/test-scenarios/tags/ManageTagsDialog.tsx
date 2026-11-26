// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Box, Button, HStack, IconButton, Input, InputGroup, Stack, Table, Text, Textarea } from '@chakra-ui/react';
import { FiEdit2, FiPlus, FiSearch, FiTag, FiTrash2, FiX } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import {
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery,
  usePatchApiV2ProjectsByProjectIdScenarioTagsAndTagIdMutation,
  usePostApiV2ProjectsByProjectIdScenarioTagsMutation,
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionPreviewMutation,
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionMutation,
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionUndoMutation,
  type ManagedScenarioTag,
  type PostApiV2ProjectsByProjectIdScenarioTagsDeletionPreviewApiResponse as Impact,
} from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { matchingTags, removeDeletedFilters, tagError, toggleTag } from './tagUtils';

interface Props {
  projectId: string;
  closeDialog: () => void;
  onReturn?: () => void;
}

type Editor = { tag?: ManagedScenarioTag; name: string; description: string };
type Confirmation = { tags: ManagedScenarioTag[]; operationId: string; impact?: Impact };
type Undo = { operationId: string; count: number; search: string; checked: string[]; restoreFilters: () => void };

function getDeletionImpactMessage(affectedCount: number, tagCount: number) {
  if (affectedCount === 0) return tagCount === 1 ? 'No scenario uses it.' : 'No scenarios use these tags.';
  const subject = affectedCount === 1 ? 'scenario' : 'scenarios';
  const target = tagCount === 1 ? 'this tag' : 'one or more of these tags';
  return `${affectedCount} ${subject} will lose ${target}.`;
}

export function ManageTagsDialog({ projectId, closeDialog, onReturn }: Props) {
  const {
    currentData: tags = [],
    isLoading,
    isError,
    refetch,
  } = useGetApiV2ProjectsByProjectIdScenarioTagsQuery({ projectId });
  const [create] = usePostApiV2ProjectsByProjectIdScenarioTagsMutation();
  const [edit] = usePatchApiV2ProjectsByProjectIdScenarioTagsAndTagIdMutation();
  const [preview] = usePostApiV2ProjectsByProjectIdScenarioTagsDeletionPreviewMutation();
  const [remove] = usePostApiV2ProjectsByProjectIdScenarioTagsDeletionMutation();
  const [restore] = usePostApiV2ProjectsByProjectIdScenarioTagsDeletionUndoMutation();
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [editor, setEditor] = useState<Editor>();
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [undo, setUndo] = useState<Undo>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const matches = matchingTags(tags, search);
  const checkedIds = new Set(checked);
  const selected = tags.filter((tag) => checkedIds.has(tag.id));
  const matchingChecked = matches.filter((tag) => checkedIds.has(tag.id)).length;
  const allMatchesChecked = matches.length > 0 && matchingChecked === matches.length;
  const duplicate =
    editor &&
    tags.find((tag) => tag.id !== editor.tag?.id && tag.name.toLowerCase() === editor.name.trim().toLowerCase());
  const duplicateMessage =
    duplicate && `A tag named "${duplicate.name}" already exists. Tag names are not case-sensitive.`;
  const screen = editor ? 'editor' : confirmation ? 'confirmation' : 'list';
  useEffect(() => {
    if (screen === 'editor') nameInput.current?.focus();
    if (screen === 'confirmation') cancelButton.current?.focus();
    if (screen === 'list') searchInput.current?.focus();
  }, [screen]);

  function act() {
    setUndo(undefined);
    setError('');
  }
  async function request(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (cause) {
      setError(tagError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function handleDialogClose() {
    if (lock.current) return;
    if (screen !== 'list') {
      cancel();
      return;
    }
    closeDialog();
    onReturn?.();
  }
  function cancel() {
    setEditor(undefined);
    setConfirmation(undefined);
    act();
  }
  function selectMatches() {
    act();
    const matched = new Set(matches.map((tag) => tag.id));
    setChecked(allMatchesChecked ? checked.filter((id) => !matched.has(id)) : [...new Set([...checked, ...matched])]);
  }
  function startEditor(tag?: ManagedScenarioTag) {
    act();
    setEditor({ tag, name: tag?.name ?? '', description: tag?.description ?? '' });
  }
  async function save() {
    if (!editor || !editor.name.trim() || duplicate) return;
    const body = { name: editor.name.trim(), description: editor.description.trim() };
    await request(async () => {
      try {
        if (editor.tag) await edit({ projectId, tagId: editor.tag.id, body }).unwrap();
        else await create({ projectId, body }).unwrap();
      } catch (cause) {
        void refetch();
        throw cause;
      }
      setEditor(undefined);
    });
  }
  async function loadPreview(next: Confirmation) {
    setConfirmation({ ...next, impact: undefined });
    const impact = await preview({ projectId, body: { tagIds: next.tags.map((tag) => tag.id) } }).unwrap();
    setConfirmation({ ...next, impact });
  }
  function startDeletion(targets: ManagedScenarioTag[]) {
    act();
    void request(() => loadPreview({ tags: targets, operationId: crypto.randomUUID() }));
  }
  async function confirmDeletion() {
    if (!confirmation?.impact) return;
    const { tags: targets, operationId, impact } = confirmation;
    const tagIds = targets.map((tag) => tag.id);
    await request(async () => {
      try {
        await remove({ projectId, body: { tagIds, operationId, revision: impact.revision } }).unwrap();
      } catch (cause) {
        if (cause && typeof cause === 'object' && 'status' in cause && cause.status === 409) {
          await loadPreview(confirmation);
          void refetch();
        }
        throw cause;
      }
      const restoreFilters = removeDeletedFilters(projectId, tagIds);
      setUndo({ count: targets.length, operationId, checked, search, restoreFilters });
      setChecked(checked.filter((id) => !tagIds.includes(id)));
      setConfirmation(undefined);
    });
  }
  function undoDeletion() {
    if (!undo) return;
    void request(async () => {
      await restore({ projectId, body: { operationId: undo.operationId } }).unwrap();
      undo.restoreFilters();
      setChecked(undo.checked);
      setSearch(undo.search);
      setUndo(undefined);
    });
  }
  function handleListClickCapture(event: MouseEvent) {
    if (undo && !(event.target as Element).closest('[data-tag-undo]')) setUndo(undefined);
  }
  function handleToggleTag(id: string) {
    act();
    setChecked((current) => toggleTag(current, id));
  }
  const tagNamesLabel = confirmation?.tags
    .map((tag) => `“${tags.find((current) => current.id === tag.id)?.name ?? tag.name}”`)
    .join(', ');
  const count = confirmation?.tags.length ?? 0;
  const isNewTag = !!editor && !editor.tag;
  const labelProps = isNewTag ? { fontSize: 'xs', color: 'text.secondary', mb: 1 } : { fontSize: 'sm' };
  const title = editor
    ? editor.tag
      ? 'Edit tag'
      : 'New tag'
    : confirmation
      ? count === 1
        ? 'Delete tag'
        : `Delete ${count} tags`
      : 'Tags';
  return (
    <Dialog
      title={title}
      onClose={handleDialogClose}
      initialFocusEl={() => searchInput.current}
      size="md"
      contentProps={
        screen === 'list' || isNewTag
          ? {
              w: 'calc(100vw - 24px)',
              maxW: isNewTag ? '480px' : '880px',
              maxH: 'calc(100dvh - 24px)',
              bg: 'bg.panel',
              borderRadius: '16px',
            }
          : { maxW: 'min(560px, calc(100vw - 24px))' }
      }
      headerProps={
        screen === 'list' ? { px: 6, py: 6, borderBottomWidth: '1px' } : isNewTag ? { px: 6, pt: 6, pb: 4 } : undefined
      }
      closeTriggerProps={screen === 'list' ? { top: 5, insetEnd: 6 } : isNewTag ? { display: 'none' } : undefined}
    >
      <DialogBody {...(screen === 'list' ? { px: 6, py: 4 } : isNewTag ? { px: 6, pt: 0, pb: 6 } : { pb: 5 })}>
        {screen === 'list' && (
          <Box asChild minW={0}>
            <fieldset disabled={busy}>
              <Stack gap={4} onClickCapture={handleListClickCapture}>
                <HStack justify="space-between">
                  <InputGroup maxW="440px" minW={0} startElement={<FiSearch />}>
                    <Input
                      ref={searchInput}
                      aria-label="Search tags"
                      placeholder="Search by name or description"
                      borderRadius="lg"
                      value={search}
                      onChange={(event) => {
                        act();
                        setSearch(event.target.value);
                      }}
                    />
                  </InputGroup>
                  <Button variant="primary" borderRadius="lg" onClick={() => startEditor()}>
                    <FiPlus />
                    New tag
                  </Button>
                </HStack>
                {selected.length > 0 && (
                  <HStack p={2} bg="bg.subtle" borderRadius="md" wrap="wrap">
                    <Text fontSize="sm">{selected.length} selected</Text>
                    {!allMatchesChecked && matches.length > 0 && (
                      <Button variant="ghost" size="xs" onClick={selectMatches}>
                        Select all {matches.length}
                      </Button>
                    )}
                    <Button variant="ghost" size="xs" onClick={() => startDeletion(selected)}>
                      Delete selected
                    </Button>
                    <IconButton
                      ml="auto"
                      variant="ghost"
                      size="xs"
                      aria-label="Clear tag selection"
                      onClick={() => {
                        act();
                        setChecked([]);
                      }}
                    >
                      <FiX />
                    </IconButton>
                  </HStack>
                )}
                {isLoading && <Text>Loading tags…</Text>}
                {isError && (
                  <HStack>
                    <Text role="alert">Tags could not be loaded.</Text>
                    <Button
                      size="xs"
                      onClick={() => {
                        act();
                        void refetch();
                      }}
                    >
                      Retry
                    </Button>
                  </HStack>
                )}
                <Box
                  borderWidth="1px"
                  borderColor="border.main"
                  borderRadius="xl"
                  overflow="auto"
                  h="min(402px, calc(100dvh - 248px))"
                  minH="140px"
                >
                  <Table.Root
                    aria-label="Project tags"
                    size="sm"
                    stickyHeader
                    tableLayout="fixed"
                    minW="620px"
                    css={{
                      '& th, & td': { px: 2, py: 1 },
                      '& th': { fontSize: 'xs', color: 'text.secondary', bg: 'bg.subtle' },
                      '& input[type=checkbox]': { width: '16px', height: '16px', verticalAlign: 'middle' },
                    }}
                  >
                    <Table.Header>
                      <Table.Row h="40px">
                        <Table.ColumnHeader w="48px" textAlign="center">
                          <input
                            type="checkbox"
                            aria-label="Select matching tags"
                            checked={allMatchesChecked}
                            ref={(element) => {
                              if (element) element.indeterminate = matchingChecked > 0 && !allMatchesChecked;
                            }}
                            disabled={!matches.length}
                            onChange={selectMatches}
                          />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="21%">Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Description</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="right" w="100px">
                          Used in
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="84px" aria-label="Actions" />
                      </Table.Row>
                    </Table.Header>
                    <Table.Body color="text.secondary">
                      {matches.map((tag) => (
                        <Table.Row key={tag.id} h="49px">
                          <Table.Cell textAlign="center">
                            <input
                              type="checkbox"
                              aria-label={`Select ${tag.name}`}
                              checked={checkedIds.has(tag.id)}
                              onChange={() => handleToggleTag(tag.id)}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              as="span"
                              display="inline-block"
                              maxW="full"
                              overflowWrap="anywhere"
                              bg={{ base: '#EEEEEE', _dark: 'bg.subtle' }}
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                              fontWeight="medium"
                            >
                              {tag.name}
                            </Text>
                          </Table.Cell>
                          <Table.Cell overflowWrap="anywhere">{tag.description || 'No description'}</Table.Cell>
                          <Table.Cell textAlign="right" whiteSpace="nowrap">
                            {tag.usageCount} {tag.usageCount === 1 ? 'scenario' : 'scenarios'}
                          </Table.Cell>
                          <Table.Cell>
                            <HStack
                              gap={1}
                              css={{ '& button': { color: 'inherit' }, '& button svg': { boxSize: '14px' } }}
                            >
                              <IconButton
                                aria-label={`Edit ${tag.name}`}
                                variant="ghost"
                                size="xs"
                                onClick={() => startEditor(tag)}
                              >
                                <FiEdit2 />
                              </IconButton>
                              <IconButton
                                aria-label={`Delete ${tag.name}`}
                                variant="ghost"
                                size="xs"
                                onClick={() => startDeletion([tag])}
                              >
                                <FiTrash2 />
                              </IconButton>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                  {!isLoading && !isError && !matches.length && (
                    <Text p={3} color="text.secondary" fontSize="sm">
                      {search ? 'No matching tags' : 'No tags'}
                    </Text>
                  )}
                </Box>
                {undo && (
                  <HStack bg="bg.subtle" borderRadius="md" px={3} py={1} justify="space-between">
                    <Text role="status" fontSize="sm">
                      {undo.count === 1 ? 'Tag deleted' : `${undo.count} tags deleted`}
                    </Text>
                    <Button data-tag-undo size="sm" variant="ghost" disabled={busy} onClick={undoDeletion}>
                      Undo
                    </Button>
                  </HStack>
                )}
              </Stack>
            </fieldset>
          </Box>
        )}
        {editor && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <Stack gap={isNewTag ? 4 : 3}>
              <Box as="label">
                <Text {...labelProps}>Name</Text>
                <Input
                  {...(isNewTag && {
                    placeholder: 'For example AC-6, M1 or smoke',
                    borderRadius: 'lg',
                    _placeholder: { fontWeight: 'medium', color: 'fg.subtle' },
                    _focus: {
                      borderColor: 'border.active',
                      outline: '2px solid',
                      outlineColor: 'blue.muted',
                      outlineOffset: '1px',
                    },
                  })}
                  ref={nameInput}
                  required
                  value={editor.name}
                  disabled={busy}
                  aria-invalid={!!duplicate}
                  onChange={(event) => {
                    setError('');
                    setEditor({ ...editor, name: event.target.value });
                  }}
                />
              </Box>
              {duplicateMessage && (
                <Text role="alert" color="fg.error" fontSize="sm">
                  {duplicateMessage}
                </Text>
              )}
              <Box as="label">
                <Text {...labelProps}>{isNewTag ? 'Description' : 'Description (optional)'}</Text>
                <Textarea
                  {...(isNewTag && {
                    placeholder: 'What this tag stands for, for example the text of the criterion (optional)',
                    h: '82px',
                    borderRadius: 'lg',
                    resize: 'none',
                    _placeholder: { color: 'fg.subtle' },
                  })}
                  value={editor.description}
                  disabled={busy}
                  onChange={(event) => setEditor({ ...editor, description: event.target.value })}
                />
              </Box>
              <HStack justify="flex-end">
                <Button
                  size={isNewTag ? 'md' : 'sm'}
                  variant={isNewTag ? 'ghost' : 'outline'}
                  disabled={busy}
                  onClick={cancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size={isNewTag ? 'md' : 'sm'}
                  variant="primary"
                  {...(isNewTag && {
                    px: 4,
                    borderRadius: 'lg',
                    _disabled: { bg: 'button.secondary.bg.disabled', color: 'text.secondary', opacity: 1 },
                  })}
                  disabled={busy || !editor.name.trim() || !!duplicate}
                >
                  {editor.tag ? 'Save changes' : 'Create tag'}
                </Button>
              </HStack>
            </Stack>
          </form>
        )}
        {confirmation && (
          <Stack gap={3}>
            <Text overflowWrap="anywhere">Delete {tagNamesLabel}?</Text>
            {confirmation.impact ? (
              <Text>
                {getDeletionImpactMessage(confirmation.impact.affectedCount, count)} The scenarios themselves will be
                kept.
              </Text>
            ) : busy ? (
              <Text>Checking affected scenarios…</Text>
            ) : (
              <Button size="sm" onClick={() => void request(() => loadPreview(confirmation))}>
                Retry preview
              </Button>
            )}
            <HStack justify="flex-end">
              <Button ref={cancelButton} size="sm" variant="outline" disabled={busy} onClick={cancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                disabled={busy || !confirmation.impact}
                onClick={() => void confirmDeletion()}
              >
                {title}
              </Button>
            </HStack>
          </Stack>
        )}
        {error && error !== duplicateMessage && (
          <Text mt={2} role="alert" fontSize="sm" color="fg.error">
            {error}
          </Text>
        )}
      </DialogBody>
      {screen === 'list' && (
        <DialogFooter borderTopWidth="1px" px={6} py={5} justifyContent="space-between">
          <Text fontSize="sm" color="text.secondary">
            {search.trim() ? `${matches.length} of ` : ''}
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </Text>
          <Button variant="outline" borderRadius="lg" disabled={busy} onClick={handleDialogClose}>
            Done
          </Button>
        </DialogFooter>
      )}
    </Dialog>
  );
}

export function ManageTagsButton({ projectId }: { projectId: string }) {
  const { openDialog } = useDialogActions(projectId);
  return (
    <Button variant="outline" onClick={() => openDialog(ManageTagsDialog, { projectId })}>
      <FiTag />
      Manage tags
    </Button>
  );
}
