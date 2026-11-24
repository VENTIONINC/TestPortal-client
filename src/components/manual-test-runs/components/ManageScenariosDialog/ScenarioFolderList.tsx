// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { Button, Text, VStack } from '@chakra-ui/react';

interface FolderNode {
  id: string;
  name: string;
  scenarioCount?: number;
  children?: FolderNode[];
}
const flattenFolders = (folders: FolderNode[], depth = 0): Array<FolderNode & { depth: number }> =>
  folders.flatMap((folder) => [{ ...folder, depth }, ...flattenFolders(folder.children ?? [], depth + 1)]);

interface ScenarioFolderListProps {
  folders: FolderNode[];
  folder: string;
  total: number;
  onFolderChange: (folder: string) => void;
}

export const ScenarioFolderList = ({ folders, folder, total, onFolderChange }: ScenarioFolderListProps) => (
  <VStack align="stretch" gap={1} p={2} borderEndWidth="1px" borderColor="border.main" overflowY="auto">
    <Button
      size="sm"
      variant={folder === '' ? 'subtle' : 'ghost'}
      colorPalette={folder === '' ? 'blue' : undefined}
      justifyContent="space-between"
      onClick={() => onFolderChange('')}
    >
      <Text>All scenarios</Text>
      <Text fontSize="xs">{total}</Text>
    </Button>
    {flattenFolders(folders).map((item) => (
      <Button
        key={item.id}
        size="sm"
        variant={folder === item.id ? 'subtle' : 'ghost'}
        colorPalette={folder === item.id ? 'blue' : undefined}
        justifyContent="space-between"
        ps={`${12 + item.depth * 12}px`}
        onClick={() => onFolderChange(item.id)}
      >
        <Text lineClamp={1}>{item.name}</Text>
        <Text fontSize="xs">{item.scenarioCount ?? 0}</Text>
      </Button>
    ))}
    <Button
      size="sm"
      variant={folder === 'unfiled' ? 'subtle' : 'ghost'}
      colorPalette={folder === 'unfiled' ? 'blue' : undefined}
      justifyContent="start"
      onClick={() => onFolderChange('unfiled')}
    >
      No folder
    </Button>
  </VStack>
);
