import { Button, Stack, StackProps, Text } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

import { useSurfaceColors } from '@/theme';

interface FiltersHeaderProps extends StackProps {
  title: string;
  clearable?: boolean;
  onClear?: () => void;
  actions?: React.ReactNode;
}

export const FiltersHeader = ({ title, clearable, onClear, actions }: FiltersHeaderProps) => {
  const { text } = useSurfaceColors();

  return (
    <Stack direction="row" w="100%" p="1px 0 0 16px" mb={2} align="center">
      <Text fontSize="lg" fontWeight={700} whiteSpace="nowrap" color={text.primary} mr="auto">
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
