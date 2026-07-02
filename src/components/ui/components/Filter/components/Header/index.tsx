// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Stack, StackProps, Text } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

interface FiltersHeaderProps extends StackProps {
  title: string;
  clearable?: boolean;
  onClear?: () => void;
  leadingAction?: React.ReactNode;
  actions?: React.ReactNode;
}

export const FiltersHeader = ({ title, clearable, onClear, leadingAction, actions }: FiltersHeaderProps) => {
  return (
    <Stack direction="row" w="100%" mb={1} align="center" gap={1}>
      {leadingAction}

      <Text fontSize="lg" fontWeight={700} whiteSpace="nowrap" color="text.main" mr="auto">
        {title}
      </Text>

      {clearable && (
        <Button cursor="pointer" variant="ghost" size="sm" onClick={onClear}>
          <LuX size={16} />
          Clear all
        </Button>
      )}
      {actions}
    </Stack>
  );
};
