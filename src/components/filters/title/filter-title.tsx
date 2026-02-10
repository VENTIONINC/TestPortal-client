import { Button, Stack, StackProps, Text, VStack } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

import { useSurfaceColors } from '@/theme';

interface FiltersTitleProps extends StackProps {
  title: string;
  clearable?: boolean;
  onClear?: () => void;
  actions?: React.ReactNode;
}

export const FiltersTitle = ({ title, clearable, onClear, actions }: FiltersTitleProps) => {
  const { text } = useSurfaceColors();

  return (
    <Stack direction="row" w="100%" p="0 0 0 15px" mb={3}>
      <Text fontWeight={700} whiteSpace="nowrap" color={text.primary} mr="auto">
        {title}
      </Text>

      {clearable && (
        <Button cursor="pointer" onClick={onClear} size="xs">
          <LuX size={16} />
          Clear all
        </Button>
      )}
      {actions}
    </Stack>
  );
};
