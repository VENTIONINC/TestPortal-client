// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Wrap } from '@chakra-ui/react';

import { FilterTag } from '@/components/ui/components';

import { TagListProps } from '../types';

export const TagList = ({
  availableTags,
  tagsValue,
  handleTagClick,
  isExpanded,
  onToggleExpand,
  isStuck,
}: TagListProps) => {
  const selectedTags = availableTags.filter((tag) => tagsValue.includes(tag));
  const unselectedTags = availableTags.filter((tag) => !tagsValue.includes(tag));
  const collapsedTags = [
    ...selectedTags,
    ...unselectedTags.slice(0, Math.max(0, 5 - selectedTags.length)),
  ];
  const hasMoreTags = collapsedTags.length < availableTags.length;
  const visibleTags = isExpanded ? availableTags : collapsedTags;
  const hiddenTagsCount = availableTags.length - collapsedTags.length;

  if (availableTags.length === 0) return null;

  return (
    <Box mt={isStuck ? 2 : 3} pb={2}>
      <Wrap gap="8px">
        {visibleTags.map((tag) => {
          const isSelected = tagsValue.includes(tag);
          return <FilterTag key={tag} tag={tag} isSelected={isSelected} onClick={() => handleTagClick(tag)} />;
        })}
        {hasMoreTags && (
          <Box
            as="button"
            onClick={onToggleExpand}
            bg="bg.section"
            color="text.secondary"
            fontSize="xs"
            fontWeight="medium"
            height="26px"
            px={3}
            borderRadius="full"
            border="1px dashed"
            borderColor="border.subdued"
            _hover={{ bg: 'border.active', color: 'text.primary', borderColor: 'border.active' }}
            transition="all 0.2s"
          >
            {isExpanded ? 'Hide' : `+${hiddenTagsCount}`}
          </Box>
        )}
      </Wrap>
    </Box>
  );
};
