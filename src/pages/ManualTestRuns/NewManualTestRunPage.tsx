// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, Button, Flex, Heading, HStack, Input, NativeSelect, Text, VStack } from '@chakra-ui/react';

import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { useGetApiV2ManualTestRunsQuery, useGetApiV2TestScenarioFoldersQuery, useGetApiV2TestSuitesQuery, usePostApiV2ManualTestRunsMutation } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery, type ManualTestRunEnvironmentProperty } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { PATHS } from '@/types/paths';

type EntryState = { scenarioIds?: string[]; suiteId?: string };
const SUGGESTED_NAMES = ['Environment', 'Browser', 'OS', 'Device', 'Build'];
type FolderOption = { id: string; name: string; children?: FolderOption[] };
const flattenFolders = (folders: FolderOption[], parent = ''): Array<{ id: string; label: string }> => folders.flatMap((folder) => {
  const label = parent ? `${parent} / ${folder.name}` : folder.name;
  return [{ id: folder.id, label }, ...flattenFolders(folder.children ?? [], label)];
});

export function NewManualTestRunPage() {
  const projectId = useSelectedProjectId();
  const location = useLocation();
  const navigate = useNavigate();
  const entry = (location.state as EntryState | null) ?? {};
  const [name, setName] = useState(`Manual run — ${new Date().toLocaleDateString()}`);
  const [selectedIds, setSelectedIds] = useState<string[]>(entry.scenarioIds ?? []);
  const [environment, setEnvironment] = useState<ManualTestRunEnvironmentProperty[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [folderId, setFolderId] = useState('');
  const [suiteId, setSuiteId] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerIds, setPickerIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [createRun, createState] = usePostApiV2ManualTestRunsMutation();
  const runsQuery = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 100 });
  const foldersQuery = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suitesQuery = useGetApiV2TestSuitesQuery({ projectId });
  const scenariosQuery = useGetApiV2TestScenariosQuery({
    projectId, page, limit: 100, sortField: 'title', sortDirection: 'asc',
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(folderId ? { folderId: folderId === 'unfiled' ? 'unfiled' : folderId, includeDescendants: folderId !== 'unfiled' } : {}),
    ...(suiteId ? { suiteId } : {}),
  });
  const scenarios = scenariosQuery.currentData?.scenarios ?? [];
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = scenarios.map((scenario) => scenario.id);
  const selectedRows = scenarios.filter((scenario) => selected.has(scenario.id));
  const sourceRun = runsQuery.currentData?.runs?.[0];
  const folderOptions = flattenFolders((foldersQuery.currentData ?? []) as FolderOption[]);
  const sourceSuite = suitesQuery.currentData?.find((suite) => suite.id === entry.suiteId);
  const suiteScenarioIds = sourceSuite?.members?.map((member) => member.testScenarioId) ?? [];
  const selectionMatchesSuite = Boolean(sourceSuite && suiteScenarioIds.length === selectedIds.length && suiteScenarioIds.every((id) => selected.has(id)));
  const selectedFolders = new Set(selectedRows.map((scenario) => scenario.folderId).filter(Boolean));
  const priorityCounts = selectedRows.reduce((counts, scenario) => {
    const key = scenario.priority ?? 'unprioritized';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const duplicateNames = new Set(environment.map((item) => item.name.trim().toLowerCase()).filter((item, index, all) => item && all.indexOf(item) !== index));

  useEffect(() => {
    if (entry.suiteId && suitesQuery.currentData) {
      const suite = suitesQuery.currentData.find((item) => item.id === entry.suiteId);
      if (suite) {
        setName(`${suite.name} — ${new Date().toLocaleDateString()}`);
        setSelectedIds(suite.members?.slice().sort((a, b) => a.position - b.position).map((member) => member.testScenarioId) ?? []);
      }
    }
  }, [entry.suiteId, suitesQuery.currentData]);

  useEffect(() => {
    const latest = runsQuery.currentData?.runs?.[0];
    if (!latest) return;
    const properties = latest.environmentProperties?.filter((item) => item.name !== 'Build') ?? [];
    if (properties.length) setEnvironment(properties);
  }, [runsQuery.currentData]);

  const addProperty = (propertyName = '') => setEnvironment((items) => [...items, { name: propertyName, value: '' }]);
  const setProperty = (index: number, key: 'name' | 'value', value: string) => setEnvironment((items) => items.map((item, row) => row === index ? { ...item, [key]: value } : item));
  const start = async () => {
    if (!name.trim() || !selectedIds.length) return;
    setError('');
    try {
      const run = await createRun({ projectId, manualTestRunCreateRequest: {
        title: name.trim(), scenarioIds: selectedIds,
        environmentProperties: environment.filter((item, index) => item.name.trim() && item.value.trim() && environment.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) === index).map((item) => ({ name: item.name.trim(), value: item.value.trim() })),
      } }).unwrap();
      navigate(PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(run.id)), { state: { from: 'manual-test-run-history' } });
    } catch {
      setError('The run could not be created. Your draft is still here; try again.');
    }
  };

  return <MainTemplate pageHeader="Test Management">
    <Box maxW="920px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}><Heading size="lg">New manual run</Heading><Button variant="ghost" onClick={() => navigate(PATHS.MANUAL_TEST_RUNS)}>Close</Button></HStack>
      <VStack align="stretch" gap={6}>
        <Box><Text mb={2} fontWeight="semibold">Run name</Text><Input aria-label="Run name" value={name} onChange={(event) => setName(event.target.value)} /></Box>
        <Box borderWidth="1px" borderColor="border" borderRadius="md" p={4}>
          <HStack justify="space-between"><Heading size="sm">Scenarios</Heading><Button size="sm" variant="outline" onClick={() => { if (showPicker) { setSelectedIds([...new Set(pickerIds)]); setShowPicker(false); } else { setPickerIds(selectedIds); setShowPicker(true); } }}>{showPicker ? 'Done' : selectedIds.length ? 'Change' : 'Select scenarios'}</Button></HStack>
          <Text mt={2} color="fg.muted">{selectedIds.length ? `${selectedIds.length} selected · ${selectedFolders.size} folders · ${Object.entries(priorityCounts).map(([priority, count]) => `${priority}: ${count}`).join(', ')}` : 'No scenarios selected'} · All selected scenarios start as Untested</Text>
          {selectionMatchesSuite && <Text mt={2}>Starting from suite: {sourceSuite?.name}</Text>}
          {showPicker && <Box mt={4}>
            <Flex gap={2} wrap="wrap" mb={3}>
              <Input aria-label="Search scenarios" placeholder="Search by title or key" value={search} onChange={(event) => (setSearch(event.target.value), setPage(1))} flex="1" minW="200px" />
              <NativeSelect.Root width="220px"><NativeSelect.Field aria-label="Folder" value={folderId} onChange={(event) => (setFolderId(event.target.value), setPage(1))}><option value="">All folders</option><option value="unfiled">No folder</option>{folderOptions.map((folder) => <option key={folder.id} value={folder.id}>{folder.label}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
              <NativeSelect.Root width="220px"><NativeSelect.Field aria-label="Suite" value={suiteId} onChange={(event) => (setSuiteId(event.target.value), setPage(1))}><option value="">All suites</option>{(suitesQuery.currentData ?? []).map((suite) => <option key={suite.id} value={suite.id}>{suite.name}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
            </Flex>
            <VStack align="stretch" maxH="320px" overflowY="auto" gap={0}>
              <Button size="xs" alignSelf="start" mb={1} variant="ghost" onClick={() => setPickerIds((ids) => visibleIds.every((id) => ids.includes(id)) ? ids.filter((id) => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])])}>Select all {visibleIds.length} shown</Button>
              {scenarios.map((scenario) => <HStack key={scenario.id} py={2} borderBottomWidth="1px" borderColor="border"><label><input type="checkbox" checked={pickerIds.includes(scenario.id)} onChange={() => setPickerIds((ids) => ids.includes(scenario.id) ? ids.filter((id) => id !== scenario.id) : [...ids, scenario.id])} /> <Text as="span" fontWeight="medium">{scenario.scenarioKey}</Text> {scenario.title}<Text as="span" color="fg.muted"> · {scenario.priority ?? 'No priority'}</Text></label></HStack>)}
              {!scenarios.length && <Text color="fg.muted" py={4}>No scenarios match these filters.</Text>}
            </VStack>
            <HStack mt={2}><Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous page</Button><Text fontSize="sm">Page {page} of {scenariosQuery.currentData?.totalPages ?? 1}</Text><Button size="xs" variant="outline" disabled={page >= (scenariosQuery.currentData?.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)}>Next page</Button></HStack>
            <HStack justify="space-between" mt={3}><Text color="fg.muted">{pickerIds.length} selected</Text><HStack><Button size="sm" variant="ghost" onClick={() => setShowPicker(false)}>Cancel</Button><Button size="sm" colorPalette="blue" onClick={() => { setSelectedIds([...new Set(pickerIds)]); setShowPicker(false); }}>Done</Button></HStack></HStack>
          </Box>}
        </Box>
        <Box borderWidth="1px" borderColor="border" borderRadius="md" p={4}>
          <Heading size="sm" mb={3}>Environment</Heading>
          {sourceRun && environment.length > 0 && <HStack mb={3}><Text color="fg.muted" fontSize="sm">Prefilled from {sourceRun.title}</Text><Button size="xs" variant="ghost" onClick={() => setEnvironment([])}>Clear</Button></HStack>}
          {environment.map((item, index) => {
            const pastValues = [...new Set((runsQuery.currentData?.runs ?? []).flatMap((run) => run.environmentProperties.filter((property) => property.name.toLowerCase() === item.name.trim().toLowerCase()).map((property) => property.value)))];
            return <Box key={index} mb={2}><HStack><Input aria-label={`Property ${index + 1} name`} placeholder="Name" value={item.name} onChange={(event) => setProperty(index, 'name', event.target.value)} /><Input aria-label={`Property ${index + 1} value`} list={`environment-values-${index}`} placeholder="Value" value={item.value} onChange={(event) => setProperty(index, 'value', event.target.value)} /><datalist id={`environment-values-${index}`}>{pastValues.map((value) => <option key={value} value={value} />)}</datalist><Button aria-label={`Remove property ${index + 1}`} variant="ghost" onClick={() => setEnvironment((items) => items.filter((_, row) => row !== index))}>×</Button></HStack>{duplicateNames.has(item.name.trim().toLowerCase()) && environment.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) !== index && <Text role="alert" color="red.500" fontSize="sm">This property name is already used. The first value will be kept.</Text>}</Box>;
          })}
          <HStack><Button size="sm" variant="outline" onClick={() => addProperty()}>Add property</Button>{SUGGESTED_NAMES.filter((suggestion) => !environment.some((item) => item.name.toLowerCase() === suggestion.toLowerCase())).map((suggestion) => <Button key={suggestion} size="xs" variant="ghost" onClick={() => addProperty(suggestion)}>{suggestion}</Button>)}</HStack>
          {environment.length > 0 && <Button size="xs" mt={2} variant="ghost" onClick={() => setEnvironment([])}>Clear</Button>}
        </Box>
        {error && <Text role="alert" color="red.500">{error}</Text>}
        <HStack justify="space-between"><Text color="fg.muted">{selectedIds.length} scenarios · Initial status: Untested</Text><HStack><Button variant="outline" onClick={() => navigate(PATHS.MANUAL_TEST_RUNS)}>Cancel</Button><Button colorPalette="blue" disabled={!name.trim() || selectedIds.length === 0 || createState.isLoading} loading={createState.isLoading} onClick={() => void start()}>Start run</Button></HStack></HStack>
      </VStack>
    </Box>
  </MainTemplate>;
}
