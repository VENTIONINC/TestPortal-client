// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Flex, IconButton, Text } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

import { Tooltip } from '@/components/ui/tooltip';
import type { ScenarioTagSummary } from '@/redux/apis/generatedApi';

interface TagChipsProps {
  tags: ScenarioTagSummary[];
  limit?: number;
  emptyLabel?: string;
  onRemove?: (tag: ScenarioTagSummary) => void;
  disabled?: boolean;
}

export function TagChips({ tags, limit, emptyLabel = '—', onRemove, disabled }: TagChipsProps) {
  if (!tags.length) return <Text as="span" fontSize="sm" color="text.secondary">{emptyLabel}</Text>;
  const hidden = limit === undefined ? [] : tags.slice(limit);
  return (
    <Flex gap={1} minW={0} align="center" flexWrap={limit === undefined ? 'wrap' : 'nowrap'}>
      {tags.slice(0, limit).map(tag => (
        <Tooltip key={tag.id} openDelay={500} content={[tag.name, tag.description].filter(Boolean).join(' · ')}>
          <Flex tabIndex={0} align="center" minW={0} maxW="full" bg="bg.subtle" borderWidth="1px"
            borderColor="border.main" borderRadius="full" px={2} gap={1}>
            <Text as="span" truncate fontSize="xs" fontWeight="medium">{tag.name}</Text>
            {onRemove && <IconButton variant="ghost" size="2xs" borderRadius="full" minW={4} h={4}
              aria-label={`Remove ${tag.name}`} disabled={disabled} onClick={() => onRemove(tag)}><FiX /></IconButton>}
          </Flex>
        </Tooltip>
      ))}
      {hidden.length > 0 && <Tooltip openDelay={500} content={hidden.map(tag => tag.name).join(', ')}>
        <Text as="span" tabIndex={0} fontSize="xs" flexShrink={0} px={1} aria-label={`${hidden.length} more tags`}>+{hidden.length}</Text>
      </Tooltip>}
    </Flex>
  );
}
