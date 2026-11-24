// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type RefObject,
} from 'react';
import { Box, Button, HStack, IconButton, Input, Popover, Portal, Stack, Text } from '@chakra-ui/react';
import { FiChevronDown, FiPlus, FiSearch, FiTag } from 'react-icons/fi';

import {
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery,
  usePostApiV2ProjectsByProjectIdScenarioTagsSelectionCountsMutation,
  usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation,
  type ScenarioTagSummary,
} from '@/redux/apis/generatedApi';
import { toaster } from '@/components/ui/toaster';
import { useDialogActions } from '@/redux/slices/dialog';

import { ManageTagsDialog } from './ManageTagsDialog';
import { matchingTags, subscribeToTagDeletion, tagError, toggleTag } from './tagUtils';

type Counts = Record<string, number>;
type Toggle = (tag: ScenarioTagSummary, present: boolean) => void | Promise<void>;
type Create = (name: string) => void | Promise<void>;
interface PickerProps {
  projectId: string;
  selectedIds: string[];
  onToggle: Toggle;
  onCreate: Create;
  disabled?: boolean;
}
interface FilterProps {
  projectId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  counts: Counts;
}
interface BulkProps {
  projectId: string;
  scenarioIds: string[];
  openManager?: (onReturn: () => void) => void;
  onApplied: () => void | Promise<void>;
  disabled?: boolean;
}

interface PanelProps {
  projectId: string;
  counts?: Counts;
  state: (id: string) => boolean | 'indeterminate';
  onToggle: Toggle;
  onCreate?: Create;
  selectionSize?: number;
  onClear?: () => void;
  onClose: () => void;
  onManage: () => void;
  input: RefObject<HTMLInputElement | null>;
  blocked?: boolean;
}

function TagPanel({
  projectId,
  state,
  counts,
  selectionSize,
  onToggle,
  onCreate,
  onClear,
  onClose,
  onManage,
  input,
  blocked,
}: PanelProps) {
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const {
    currentData: tags = [],
    isLoading,
    isError,
    refetch,
  } = useGetApiV2ProjectsByProjectIdScenarioTagsQuery({ projectId });
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const options = matchingTags(tags, search);
  const newName = search.trim();
  const canCreate = !isLoading && !isError && !!onCreate && !!newName && !options.length;
  const placeholder = onCreate ? 'Find or create a tag' : 'Type to find a tag';
  async function choose(tag?: ScenarioTagSummary) {
    if (lock.current || blocked || (!tag && !canCreate)) return;
    lock.current = true;
    setPending(true);
    setError('');
    try {
      if (tag) await onToggle(tag, state(tag.id) !== true);
      else {
        await onCreate?.(newName);
        setSearch('');
      }
    } catch (cause) {
      const message = tagError(cause);
      if (mounted.current) setError(message);
      else toaster.create({ type: 'error', title: 'Could not update tags', description: message });
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  useEffect(() => {
    input.current?.focus();
  }, [input]);

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void choose(options[0]);
    }
  }

  function handlePanelKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }
  return (
    <Stack gap={2} onKeyDown={handlePanelKeyDown}>
      {selectionSize !== undefined && (
        <Text fontSize="sm" fontWeight="medium">
          Tag {selectionSize} selected {selectionSize === 1 ? 'scenario' : 'scenarios'}
        </Text>
      )}
      <Box position="relative" borderBottomWidth={onClear ? '1px' : undefined} borderColor="border.main">
        {onClear && (
          <Box
            position="absolute"
            insetStart={0}
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            color="text.muted"
            pointerEvents="none"
          >
            <FiSearch aria-hidden="true" size={13} />
          </Box>
        )}
        <Input
          ps={onClear ? 7 : undefined}
          border={onClear ? 0 : undefined}
          focusRing={onClear ? 'none' : undefined}
          ref={input}
          size="sm"
          placeholder={placeholder}
          aria-label={onCreate ? placeholder : 'Search tags'}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </Box>
      {isLoading && <Text fontSize="sm">Loading tags…</Text>}
      {isError && (
        <HStack>
          <Text role="alert" fontSize="sm">
            Tags could not be loaded.
          </Text>
          <Button size="xs" onClick={() => void refetch()}>
            Retry
          </Button>
        </HStack>
      )}
      <Stack maxH="250px" overflowY="auto" gap={0}>
        {options.map((tag) => {
          const tagState = state(tag.id);
          const isChecked = tagState === true;
          const isIndeterminate = tagState === 'indeterminate';
          return (
            <HStack as="label" key={tag.id} px={1} py={1} cursor="pointer" gap={2} _hover={{ bg: 'bg.subtle' }}>
              <input
                type="checkbox"
                aria-label={tag.name}
                aria-checked={isIndeterminate ? 'mixed' : isChecked}
                ref={(element) => {
                  if (element) element.indeterminate = isIndeterminate;
                }}
                checked={isChecked}
                disabled={pending || blocked}
                onChange={() => void choose(tag)}
              />
              <Box flex={1} minW={0} overflowWrap="anywhere">
                <Text fontSize="sm" fontWeight="medium">
                  {tag.name}
                </Text>
                {tag.description && (
                  <Text fontSize="xs" color="text.secondary">
                    {tag.description}
                  </Text>
                )}
              </Box>
              {counts && (
                <Text fontSize="xs" color="text.secondary">
                  {counts[tag.id] ?? 0}
                </Text>
              )}
            </HStack>
          );
        })}
        {canCreate && (
          <Button
            size="sm"
            h="auto"
            py={2}
            variant="ghost"
            whiteSpace="normal"
            disabled={pending || blocked}
            onClick={() => void choose()}
          >
            <FiPlus />
            Create tag “{newName}” and add {selectionSize === undefined ? 'it' : `to ${selectionSize}`}
          </Button>
        )}
        {!isLoading && !isError && !options.length && !canCreate && (
          <Text fontSize="sm" p={1} color="text.secondary">
            No matching tags
          </Text>
        )}
      </Stack>
      {error && (
        <Text role="alert" fontSize="sm" color="fg.error">
          {error}
        </Text>
      )}
      <HStack borderTopWidth="1px" borderColor="border.main" pt={2} gap={1}>
        {onClear && (
          <Button variant="ghost" size="xs" fontSize="sm" onClick={onClear}>
            Clear
          </Button>
        )}
        <Button variant="ghost" size="xs" fontSize="sm" disabled={pending} onClick={onManage}>
          Manage tags
        </Button>
        <Button ml="auto" variant="primary" size="sm" fontSize="sm" onClick={onClose}>
          Done
        </Button>
      </HStack>
    </Stack>
  );
}

function BulkPanel({
  projectId,
  scenarioIds,
  onApplied,
  ...panel
}: BulkProps & Pick<PanelProps, 'input' | 'onClose' | 'onManage'>) {
  const [fetchCounts] = usePostApiV2ProjectsByProjectIdScenarioTagsSelectionCountsMutation();
  const [assign] = usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation();
  const [selection, setSelection] = useState<{ ids: string[]; counts: Counts }>();
  const counts = selection?.ids === scenarioIds ? selection.counts : undefined;
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setSelection(undefined);
    setError('');
    const result = fetchCounts({ projectId, body: { scenarioIds } });
    result
      .unwrap()
      .then((next) => {
        if (active) setSelection({ ids: scenarioIds, counts: next });
      })
      .catch((cause) => {
        if (active) setError(tagError(cause));
      });
    return () => {
      active = false;
    };
  }, [projectId, scenarioIds, refresh, fetchCounts]);
  async function apply(body: { tagId: string; present: boolean } | { name: string; present: true }) {
    const tag = await assign({ projectId, body: { ...body, scenarioIds } }).unwrap();
    setSelection((current) =>
      current?.ids === scenarioIds
        ? { ids: scenarioIds, counts: { ...current.counts, [tag.id]: body.present ? scenarioIds.length : 0 } }
        : current,
    );
    await onApplied();
  }
  function getTagState(id: string) {
    const count = counts?.[id] ?? 0;
    if (!count) return false;
    return count === scenarioIds.length ? true : 'indeterminate';
  }

  return (
    <>
      {error && (
        <HStack>
          <Text role="alert" fontSize="sm">
            {error}
          </Text>
          <Button size="xs" onClick={() => setRefresh((value) => value + 1)}>
            Retry
          </Button>
        </HStack>
      )}
      {!counts && !error && (
        <Text fontSize="xs" color="text.secondary">
          Loading selection…
        </Text>
      )}
      <TagPanel
        {...panel}
        projectId={projectId}
        selectionSize={scenarioIds.length}
        blocked={!counts}
        state={getTagState}
        onToggle={(tag, present) => apply({ tagId: tag.id, present })}
        onCreate={(name) => apply({ name, present: true })}
      />
    </>
  );
}

function TagDisclosure({
  projectId,
  openManager,
  trigger,
  mode,
  panel,
}: {
  projectId: string;
  openManager?: BulkProps['openManager'];
  trigger: (ref: RefObject<HTMLButtonElement | null>, open: boolean, toggle: () => void) => ReactElement;
  mode: 'inline' | 'filter' | 'bulk';
  panel: (props: Pick<PanelProps, 'input' | 'onClose' | 'onManage'>) => ReactElement;
}) {
  const { openDialog } = useDialogActions(projectId);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  function handleManageTags() {
    setOpen(false);
    const onReturn = () => {
      if (triggerRef.current?.isConnected) setOpen(true);
    };
    if (openManager) openManager(onReturn);
    else openDialog(ManageTagsDialog, { projectId, onReturn });
  }
  const content =
    open &&
    panel({
      input,
      onClose: close,
      onManage: handleManageTags,
    });
  if (mode === 'inline')
    return (
      <>
        {trigger(triggerRef, open, () => setOpen(!open))}
        {open && (
          <Box
            flexBasis="100%"
            w="full"
            borderWidth="1px"
            borderColor="border.main"
            borderRadius="md"
            p={2}
            bg="bg.card"
          >
            {content}
          </Box>
        )}
      </>
    );
  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: next }) => setOpen(next)}
      initialFocusEl={() => input.current}
      positioning={{ placement: mode === 'bulk' ? 'top-start' : 'bottom-end' }}
    >
      <Popover.Trigger asChild>{trigger(triggerRef, open, () => {})}</Popover.Trigger>
      {open && (
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              w="300px"
              maxW="calc(100vw - 24px)"
              p={3}
              pt={mode === 'filter' ? 0 : 3}
              bg="bg.card"
              color="text.primary"
            >
              {content}
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      )}
    </Popover.Root>
  );
}

export function TagPicker({ projectId, selectedIds, onToggle, onCreate, disabled }: PickerProps) {
  return (
    <TagDisclosure
      projectId={projectId}
      mode="inline"
      trigger={(ref, open, toggle) => (
        <IconButton
          type="button"
          ref={ref}
          variant="outline"
          size="xs"
          borderStyle="dashed"
          borderRadius="full"
          aria-label="Add tags"
          aria-expanded={open}
          disabled={disabled}
          onClick={toggle}
        >
          <FiPlus />
        </IconButton>
      )}
      panel={(props) => (
        <TagPanel
          {...props}
          projectId={projectId}
          state={(id) => selectedIds.includes(id)}
          onToggle={onToggle}
          onCreate={onCreate}
          blocked={disabled}
        />
      )}
    />
  );
}

export function TagFilter({ projectId, selectedIds, onChange, counts }: FilterProps) {
  const [restoredAt, setRestoredAt] = useState(0);
  const hasSelection = selectedIds.length > 0;
  const { currentData, isError, isFetching, startedTimeStamp } = useGetApiV2ProjectsByProjectIdScenarioTagsQuery(
    { projectId },
    { skip: !hasSelection },
  );
  useEffect(() => {
    // Undo restores IDs immediately. The cached directory may still describe the deletion.
    if (!currentData || isError || isFetching || (startedTimeStamp ?? 0) < restoredAt) return;
    const available = new Set(currentData.map(({ id }) => id));
    const remaining = selectedIds.filter((id) => available.has(id));
    if (remaining.length !== selectedIds.length) onChange(remaining);
  }, [currentData, isError, isFetching, startedTimeStamp, restoredAt, selectedIds, onChange]);
  const current = useRef({ selectedIds, onChange });
  useEffect(() => {
    current.current = { selectedIds, onChange };
  }, [selectedIds, onChange]);
  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeToTagDeletion((project, deleted) => {
      if (project !== projectId) return;
      const { selectedIds: before, onChange: update } = current.current;
      if (!before.some((id) => deleted.includes(id))) return;
      update(before.filter((id) => !deleted.includes(id)));
      return () => {
        if (mounted) {
          setRestoredAt(Date.now());
          current.current.onChange(before);
        }
      };
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [projectId]);
  const selectionLabel =
    selectedIds.length === 1 ? (currentData?.find(({ id }) => id === selectedIds[0])?.name ?? '1') : selectedIds.length;
  return (
    <TagDisclosure
      projectId={projectId}
      mode="filter"
      trigger={(ref) => (
        <Button
          ref={ref}
          variant="outline"
          fontSize="sm"
          bg="bg.card"
          borderColor={hasSelection ? 'border.active' : undefined}
        >
          {hasSelection ? `Tags: ${selectionLabel}` : 'Tags'}
          <FiChevronDown />
        </Button>
      )}
      panel={(props) => (
        <TagPanel
          {...props}
          projectId={projectId}
          state={(id) => selectedIds.includes(id)}
          counts={counts}
          onToggle={(tag) => onChange(toggleTag(selectedIds, tag.id))}
          onClear={() => onChange([])}
        />
      )}
    />
  );
}

export function BulkTagPicker({ projectId, scenarioIds, onApplied, disabled, openManager }: BulkProps) {
  return (
    <TagDisclosure
      projectId={projectId}
      openManager={openManager}
      mode="bulk"
      trigger={(ref) => (
        <Button
          ref={ref}
          variant="ghost"
          size="sm"
          color="inherit"
          disabled={disabled || !scenarioIds.length}
          _hover={{ bg: 'whiteAlpha.200', _dark: { bg: 'blackAlpha.200' } }}
          _expanded={{ bg: 'whiteAlpha.200', _dark: { bg: 'blackAlpha.200' } }}
        >
          <FiTag />
          Tag
        </Button>
      )}
      panel={(props) => <BulkPanel {...props} projectId={projectId} scenarioIds={scenarioIds} onApplied={onApplied} />}
    />
  );
}
