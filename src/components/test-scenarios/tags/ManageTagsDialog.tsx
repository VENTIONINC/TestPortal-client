// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Box, Button, Flex, HStack, IconButton, Input, Stack, Text, Textarea } from '@chakra-ui/react';
import { FiEdit2, FiPlus, FiTag, FiTrash2, FiX } from 'react-icons/fi';

import { Dialog, DialogBody } from '@/components/ui/dialog';
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
  const title = editor
    ? editor.tag
      ? 'Edit tag'
      : 'New tag'
    : confirmation
      ? count === 1
        ? 'Delete tag'
        : `Delete ${count} tags`
      : 'Manage tags';
  return (
    <Dialog
      title={title}
      onClose={handleDialogClose}
      initialFocusEl={() => searchInput.current}
      size="md"
      contentProps={{ maxW: 'min(560px, calc(100vw - 24px))' }}
    >
      <DialogBody pb={5}>
        {screen === 'list' && (
          <fieldset disabled={busy}>
            <Stack gap={3} onClickCapture={handleListClickCapture}>
              <HStack>
                <Input
                  ref={searchInput}
                  aria-label="Search tags"
                  placeholder="Search tags"
                  size="sm"
                  value={search}
                  onChange={(event) => {
                    act();
                    setSearch(event.target.value);
                  }}
                />
                <Button variant="primary" size="sm" onClick={() => startEditor()}>
                  <FiPlus />
                  New tag
                </Button>
              </HStack>
              <Flex align="center" gap={2} wrap="wrap">
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
                <Text fontSize="xs" color="text.secondary">
                  {matches.length} of {tags.length} tags
                </Text>
                <Text ml="auto" fontSize="xs" color="text.secondary">
                  Used in
                </Text>
                <Box w={16} />
              </Flex>
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
              <Stack gap={0} maxH="400px" overflowY="auto" aria-label="Project tags">
                {matches.map((tag) => (
                  <HStack key={tag.id} gap={2} py={2} borderBottomWidth="1px" borderColor="border.main">
                    <input
                      type="checkbox"
                      aria-label={`Select ${tag.name}`}
                      checked={checkedIds.has(tag.id)}
                      onChange={() => handleToggleTag(tag.id)}
                    />
                    <Box flex={1} minW={0} overflowWrap="anywhere">
                      <Text fontSize="sm" fontWeight="medium">
                        {tag.name}
                      </Text>
                      <Text fontSize="xs" color="text.secondary">
                        {tag.description || 'No description'}
                      </Text>
                    </Box>
                    <Text whiteSpace="nowrap" fontSize="xs" color="text.secondary">
                      {tag.usageCount} {tag.usageCount === 1 ? 'scenario' : 'scenarios'}
                    </Text>
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
                ))}
                {!isLoading && !isError && !matches.length && (
                  <Text py={3} color="text.secondary" fontSize="sm">
                    {search ? 'No matching tags' : 'No tags'}
                  </Text>
                )}
              </Stack>
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
        )}
        {editor && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <Stack gap={3}>
              <Box as="label">
                <Text fontSize="sm">Name</Text>
                <Input
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
                <Text fontSize="sm">Description (optional)</Text>
                <Textarea
                  value={editor.description}
                  disabled={busy}
                  onChange={(event) => setEditor({ ...editor, description: event.target.value })}
                />
              </Box>
              <HStack justify="flex-end">
                <Button size="sm" variant="outline" disabled={busy} onClick={cancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={busy || !editor.name.trim() || !!duplicate}>
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
