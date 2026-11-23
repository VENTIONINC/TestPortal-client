// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
import { Box, Button, HStack, IconButton, Input, Popover, Portal, Stack, Text } from '@chakra-ui/react';
import { FiChevronDown, FiPlus, FiTag } from 'react-icons/fi';

import {
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery,
  usePostApiV2ProjectsByProjectIdScenarioTagsSelectionCountsMutation,
  usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation,
  type ScenarioTagSummary,
} from '@/redux/apis/generatedApi';
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
  onReturn: () => void;
  input: RefObject<HTMLInputElement | null>;
  blocked?: boolean;
}

function TagPanel({ projectId, state, counts, selectionSize, onToggle, onCreate, onClear, onClose, onManage, onReturn, input, blocked }: PanelProps) {
  const { openDialog } = useDialogActions();
  const { currentData: tags = [], isLoading, isError, refetch } = useGetApiV2ProjectsByProjectIdScenarioTagsQuery({ projectId });
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
      else { await onCreate?.(newName); setSearch(''); }
    } catch (cause) { setError(tagError(cause)); }
    finally { lock.current = false; setPending(false); }
  }
  useEffect(() => { input.current?.focus(); }, [input]);
  return <Stack gap={2} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
  }}>
    {selectionSize !== undefined && <Text fontSize="sm" fontWeight="medium">Tag {selectionSize} selected {selectionSize === 1 ? 'scenario' : 'scenarios'}</Text>}
    <Input ref={input} size="sm" placeholder={placeholder} aria-label={onCreate ? placeholder : 'Search tags'} value={search}
      onChange={event => setSearch(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
          event.preventDefault();
          void choose(options[0]);
        }
      }} />
    {isLoading && <Text fontSize="sm">Loading tags…</Text>}
    {isError && <HStack><Text role="alert" fontSize="sm">Tags could not be loaded.</Text><Button size="xs" onClick={() => void refetch()}>Retry</Button></HStack>}
    <Stack maxH="250px" overflowY="auto" gap={0}>
      {options.map(tag => <HStack as="label" key={tag.id} px={1} py={1} cursor="pointer" gap={2}
        _hover={{ bg: 'bg.subtle' }}>
        <input type="checkbox" aria-label={tag.name} aria-checked={state(tag.id) === 'indeterminate' ? 'mixed' : state(tag.id) === true}
          ref={element => { if (element) element.indeterminate = state(tag.id) === 'indeterminate'; }}
          checked={state(tag.id) === true} disabled={pending || blocked} onChange={() => void choose(tag)} />
        <Box flex={1} minW={0} overflowWrap="anywhere">
          <Text fontSize="sm" fontWeight="medium">{tag.name}</Text>
          {tag.description && <Text fontSize="xs" color="text.secondary">{tag.description}</Text>}
        </Box>
        {counts && <Text fontSize="xs" color="text.secondary">{counts[tag.id] ?? 0}</Text>}
      </HStack>)}
      {canCreate && <Button size="sm" h="auto" py={2} variant="ghost" whiteSpace="normal"
        disabled={pending || blocked} onClick={() => void choose()}><FiPlus />Create tag “{newName}” and add {selectionSize === undefined ? 'it' : `to ${selectionSize}`}</Button>}
      {!isLoading && !isError && !options.length && !canCreate && <Text fontSize="sm" p={1} color="text.secondary">No matching tags</Text>}
    </Stack>
    {error && <Text role="alert" fontSize="sm" color="fg.error">{error}</Text>}
    <HStack borderTopWidth="1px" borderColor="border.main" pt={2} gap={1}>
      {onClear && <Button variant="ghost" size="xs" onClick={onClear}>Clear</Button>}
      <Button variant="ghost" size="xs" disabled={pending} onClick={() => { onManage(); openDialog(ManageTagsDialog, { projectId, onReturn }); }}>Manage tags</Button>
      <Button ml="auto" variant="primary" size="xs" onClick={onClose}>Done</Button>
    </HStack>
  </Stack>;
}

function BulkPanel({ projectId, scenarioIds, onApplied, ...panel }: BulkProps & Pick<PanelProps, 'input' | 'onClose' | 'onManage' | 'onReturn'>) {
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
    result.unwrap().then(next => { if (active) setSelection({ ids: scenarioIds, counts: next }); })
      .catch(cause => { if (active) setError(tagError(cause)); });
    return () => { active = false; };
  }, [projectId, scenarioIds, refresh, fetchCounts]);
  async function apply(body: { tagId: string; present: boolean } | { name: string; present: true }) {
    const tag = await assign({ projectId, body: { ...body, scenarioIds } }).unwrap();
    setSelection(current => current?.ids === scenarioIds
      ? { ids: scenarioIds, counts: { ...current.counts, [tag.id]: body.present ? scenarioIds.length : 0 } } : current);
    await onApplied();
  }
  return <>
    {error && <HStack><Text role="alert" fontSize="sm">{error}</Text><Button size="xs" onClick={() => setRefresh(value => value + 1)}>Retry</Button></HStack>}
    {!counts && !error && <Text fontSize="xs" color="text.secondary">Loading selection…</Text>}
    <TagPanel {...panel} projectId={projectId} selectionSize={scenarioIds.length} blocked={!counts}
      state={id => !counts?.[id] ? false : counts[id] === scenarioIds.length || 'indeterminate'}
      onToggle={(tag, present) => apply({ tagId: tag.id, present })} onCreate={name => apply({ name, present: true })} />
  </>;
}

function SelectedLabel({ projectId, id }: { projectId: string; id: string }) {
  const { currentData } = useGetApiV2ProjectsByProjectIdScenarioTagsQuery({ projectId });
  return <>Tags: {currentData?.find(tag => tag.id === id)?.name ?? '1'}</>;
}

function TagDisclosure({ trigger, mode, panel }: {
  trigger: (ref: RefObject<HTMLButtonElement | null>, open: boolean, toggle: () => void) => ReactElement;
  mode: 'inline' | 'filter' | 'bulk';
  panel: (props: Pick<PanelProps, 'input' | 'onClose' | 'onManage' | 'onReturn'>) => ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  const content = open && panel({
    input, onClose: close, onManage: () => setOpen(false),
    onReturn: () => { if (triggerRef.current?.isConnected) setOpen(true); },
  });
  if (mode === 'inline') return <>
    {trigger(triggerRef, open, () => setOpen(!open))}
    {open && <Box flexBasis="100%" w="full" borderWidth="1px" borderColor="border.main" borderRadius="md" p={2} bg="bg.card">{content}</Box>}
  </>;
  return <Popover.Root open={open} onOpenChange={({ open: next }) => setOpen(next)}
    initialFocusEl={() => input.current} positioning={{ placement: mode === 'bulk' ? 'top-start' : 'bottom-end' }}>
    <Popover.Trigger asChild>{trigger(triggerRef, open, () => {})}</Popover.Trigger>
    {open && <Portal><Popover.Positioner><Popover.Content w="300px" maxW="calc(100vw - 24px)" p={3} bg="bg.card" color="text.primary">
      {content}
    </Popover.Content></Popover.Positioner></Portal>}
  </Popover.Root>;
}

export function TagPicker({ projectId, selectedIds, onToggle, onCreate, disabled }: PickerProps) {
  return <TagDisclosure mode="inline"
    trigger={(ref, open, toggle) => <IconButton type="button" ref={ref} variant="outline" size="xs" borderStyle="dashed" borderRadius="full"
      aria-label="Add tags" aria-expanded={open} disabled={disabled} onClick={toggle}><FiPlus /></IconButton>}
    panel={props => <TagPanel {...props} projectId={projectId} state={id => selectedIds.includes(id)}
      onToggle={onToggle} onCreate={onCreate} blocked={disabled} />} />;
}

export function TagFilter({ projectId, selectedIds, onChange, counts }: FilterProps) {
  const current = useRef({ selectedIds, onChange });
  useEffect(() => { current.current = { selectedIds, onChange }; }, [selectedIds, onChange]);
  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeToTagDeletion((project, deleted) => {
      if (project !== projectId) return;
      const { selectedIds: before, onChange: update } = current.current;
      if (!before.some(id => deleted.includes(id))) return;
      update(before.filter(id => !deleted.includes(id)));
      return () => { if (mounted) current.current.onChange(before); };
    });
    return () => { mounted = false; unsubscribe(); };
  }, [projectId]);
  return <TagDisclosure mode="filter"
    trigger={ref => <Button ref={ref} variant="outline" bg="bg.card" borderColor={selectedIds.length ? 'border.active' : undefined}>
      {selectedIds.length === 1 ? <SelectedLabel projectId={projectId} id={selectedIds[0]} /> : selectedIds.length ? `Tags: ${selectedIds.length}` : 'Tags'}<FiChevronDown />
    </Button>}
    panel={props => <TagPanel {...props} projectId={projectId} state={id => selectedIds.includes(id)} counts={counts}
      onToggle={tag => onChange(toggleTag(selectedIds, tag.id))} onClear={() => onChange([])} />} />;
}

export function BulkTagPicker({ projectId, scenarioIds, onApplied, disabled }: BulkProps) {
  return <TagDisclosure mode="bulk" trigger={ref =>
    <Button ref={ref} variant="ghost" size="sm" color="inherit" disabled={disabled || !scenarioIds.length}><FiTag />Tag</Button>}
    panel={props => <BulkPanel {...props} projectId={projectId} scenarioIds={scenarioIds} onApplied={onApplied} />} />;
}
