// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useId, useState } from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiPlay, FiX } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { useGetApiV2ManualTestRunsQuery, useLazyGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import type {
  ManualTestRunEnvironmentProperty,
  ManualTestRunScenarioRead,
  TestScenarioSummary,
} from '@/redux/apis/generatedApi';

import { ManageScenariosDialog } from './ManageScenariosDialog';

const names = ['Environment', 'Browser', 'OS', 'Device', 'Build'];
export const normalizeEnvironment = (items: ManualTestRunEnvironmentProperty[]) =>
  items
    .filter(
      (item, index) =>
        item.name.trim() &&
        item.value.trim() &&
        items.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) === index,
    )
    .map((item) => ({ name: item.name.trim(), value: item.value.trim() }));

type Props = {
  projectId: string;
  mode: 'new' | 'edit';
  name: string;
  onNameChange: (value: string) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  environment: ManualTestRunEnvironmentProperty[];
  onEnvironmentChange: (items: ManualTestRunEnvironmentProperty[]) => void;
  existing?: ManualTestRunScenarioRead[];
  sourceSuiteName?: string;
  sourceRunTitle?: string;
  saving: boolean;
  warning?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export function ManualRunDetailsDialog({
  projectId,
  mode,
  name,
  onNameChange,
  selectedIds,
  onSelectionChange,
  environment,
  onEnvironmentChange,
  existing = [],
  sourceSuiteName,
  sourceRunTitle,
  saving,
  warning,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<TestScenarioSummary[]>([]);
  const [loadScenarios] = useLazyGetApiV2TestScenariosQuery();
  const runs = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 100, show: 'all', period: 'any_time' });
  const listId = useId();
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const first = await loadScenarios({ projectId, page: 1, limit: 100 }, true).unwrap();
        const rest = await Promise.all(
          Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
            loadScenarios({ projectId, page: index + 2, limit: 100 }, true).unwrap(),
          ),
        );
        if (active) setCatalog([first, ...rest].flatMap((page) => page.scenarios));
      } catch {
        if (active) setCatalog([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [projectId, loadScenarios]);
  const rows = selectedIds
    .map((id) => {
      const row = catalog.find((item) => item.id === id);
      const snapshot = existing.find((item) => item.sourceScenarioId === id);
      return row
        ? { priority: row.priority, folder: row.folderId ?? 'unfiled' }
        : snapshot
          ? { priority: snapshot.priority, folder: snapshot.folderPath ?? 'unfiled' }
          : undefined;
    })
    .filter((row) => row !== undefined);
  const counts = (['high', 'medium', 'low'] as const).map(
    (priority) =>
      `${priority[0].toUpperCase() + priority.slice(1)} ${rows.filter((row) => row.priority === priority).length}`,
  );
  const completeStats = rows.length === selectedIds.length;
  const updateProperty = (index: number, key: 'name' | 'value', value: string) =>
    onEnvironmentChange(environment.map((item, row) => (row === index ? { ...item, [key]: value } : item)));
  const suggestions = [
    ...new Set([
      ...names,
      ...(runs.currentData?.runs ?? []).flatMap((run) => run.environmentProperties.map((item) => item.name)),
    ]),
  ];
  return (
    <>
      <Dialog
        title={mode === 'new' ? 'New manual run' : 'Edit run details'}
        onClose={onClose}
        contentProps={{ bg: 'bg.panel', maxW: '740px', w: 'calc(100vw - 2rem)', maxH: '90vh' }}
        headerProps={{ borderBottomWidth: '1px', borderColor: 'border.main', p: 6 }}
      >
        <DialogBody p={6}>
          <VStack align="stretch" gap={5}>
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={1}>
                Run name
              </Text>
              <Input
                aria-label="Run name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                autoFocus
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Scenarios
              </Text>
              <HStack borderWidth="1px" borderColor="border.main" borderRadius="md" p={4} justify="space-between">
                <Box>
                  <Text fontSize="16px" fontWeight="medium">
                    {selectedIds.length} unique {selectedIds.length === 1 ? 'scenario' : 'scenarios'}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {selectedIds.length === 0
                      ? 'Select scenarios to continue'
                      : completeStats
                        ? `${counts.join(' · ')} · in ${new Set(rows.map((row) => row.folder)).size} folders`
                        : 'Loading scenario details…'}
                  </Text>
                </Box>
                <Button variant="outline" onClick={() => setPickerOpen(true)}>
                  Change
                </Button>
              </HStack>
              {sourceSuiteName && (
                <Text color="fg.muted" fontSize="sm" mt={2}>
                  Started from the suite “{sourceSuiteName}”.
                </Text>
              )}
            </Box>
            <Box>
              <HStack justify="space-between" mb={2} flexWrap="wrap">
                <Text fontSize="sm" color="fg.muted">
                  Environment (optional)
                </Text>
                {mode === 'new' && sourceRunTitle && environment.length > 0 && (
                  <Text fontSize="sm" color="fg.muted">
                    Copied from “{sourceRunTitle}”, build left empty ·{' '}
                    <Button
                      variant="plain"
                      size="sm"
                      colorPalette="blue"
                      px={0}
                      onClick={() => onEnvironmentChange([])}
                    >
                      Clear
                    </Button>
                  </Text>
                )}
              </HStack>
              <datalist id={`${listId}-names`}>
                {suggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {environment.map((item, index) => {
                const duplicate =
                  item.name.trim() &&
                  environment.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) !==
                    index;
                const values = [
                  ...new Set(
                    (runs.currentData?.runs ?? []).flatMap((run) =>
                      run.environmentProperties
                        .filter((property) => property.name.trim().toLowerCase() === item.name.trim().toLowerCase())
                        .map((property) => property.value),
                    ),
                  ),
                ];
                return (
                  <Box key={index} mb={2}>
                    <HStack>
                      <Input
                        flex="2"
                        aria-label={`Property ${index + 1} name`}
                        list={`${listId}-names`}
                        placeholder="Name"
                        value={item.name}
                        onChange={(event) => updateProperty(index, 'name', event.target.value)}
                      />
                      <Input
                        flex="3"
                        aria-label={`Property ${index + 1} value`}
                        list={`${listId}-values-${index}`}
                        placeholder={item.name.trim().toLowerCase() === 'build' ? 'e.g. 2.4.2' : 'Value'}
                        value={item.value}
                        onChange={(event) => updateProperty(index, 'value', event.target.value)}
                      />
                      <datalist id={`${listId}-values-${index}`}>
                        {values.map((value) => (
                          <option key={value} value={value} />
                        ))}
                      </datalist>
                      <Button
                        aria-label={`Remove property ${index + 1}`}
                        size="sm"
                        w="32px"
                        minW="32px"
                        h="32px"
                        p={0}
                        variant="ghost"
                        onClick={() => onEnvironmentChange(environment.filter((_, row) => row !== index))}
                      >
                        <FiX />
                      </Button>
                    </HStack>
                    {duplicate && (
                      <Text role="alert" color="fg.error" fontSize="sm">
                        This property name is already used. The first value will be kept.
                      </Text>
                    )}
                  </Box>
                );
              })}
              <HStack flexWrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  color="fg.muted"
                  borderStyle="dashed"
                  borderRadius="full"
                  onClick={() => onEnvironmentChange([...environment, { name: '', value: '' }])}
                >
                  + Add property
                </Button>
                {names
                  .filter(
                    (suggestion) =>
                      !environment.some((item) => item.name.trim().toLowerCase() === suggestion.toLowerCase()),
                  )
                  .map((suggestion) => (
                    <Button
                      key={suggestion}
                      size="sm"
                      variant="outline"
                      color="fg.muted"
                      borderRadius="full"
                      onClick={() => onEnvironmentChange([...environment, { name: suggestion, value: '' }])}
                    >
                      + {suggestion}
                    </Button>
                  ))}
              </HStack>
            </Box>
            {warning && (
              <Box role="alert" bg="yellow.subtle" color="orange.fg" p={3} borderRadius="md">
                Removing these scenarios will also remove{' '}
                {
                  existing.filter((item) => !selectedIds.includes(item.sourceScenarioId) && item.result !== 'untested')
                    .length
                }{' '}
                saved results. Save these changes?
              </Box>
            )}
            {error && (
              <Text role="alert" color="fg.error">
                {error}
              </Text>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter borderTopWidth="1px" borderColor="border.main" px={6} py={5}>
          <HStack w="full" justify="space-between" flexWrap="wrap">
            {mode === 'new' ? (
              <Text color="fg.muted" fontSize="sm">
                {selectedIds.length} scenarios, all start as Untested
              </Text>
            ) : (
              <Box />
            )}
            <HStack>
              <Button variant="ghost" disabled={saving} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                disabled={saving || !name.trim() || !selectedIds.length}
                loading={saving}
                onClick={onSubmit}
              >
                {mode === 'new' && <FiPlay />}
                {mode === 'new' ? 'Start run' : warning ? 'Remove results and save' : 'Save changes'}
              </Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </Dialog>
      {pickerOpen && (
        <ManageScenariosDialog
          projectId={projectId}
          runTitle={name}
          existing={existing}
          initialIds={selectedIds}
          pickerMode
          saving={false}
          onClose={() => setPickerOpen(false)}
          onSave={(ids) => {
            onSelectionChange(ids);
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}
