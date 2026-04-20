import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Flex, Popover, Portal, Stack, Text, Badge, HStack, IconButton } from '@chakra-ui/react';
import { LuChevronDown, LuX, LuCheck } from 'react-icons/lu';

import { Checkbox, Field, FieldProps } from '@/components/ui';

export interface MultiSelectItem {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  name: string;
  items: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  fieldProps?: FieldProps;
}

export const MultiSelect = ({
  label,
  name,
  items,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Select options...',
  disabled,
  fieldProps,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedItems = useMemo(
    () => items.filter((item) => value.includes(item.value)),
    [items, value]
  );

  const handleToggle = useCallback(
    (itemValue: string) => {
      const newValue = value.includes(itemValue)
        ? value.filter((v) => v !== itemValue)
        : [...value, itemValue];
      onChange(newValue);
    },
    [value, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Popover.Trigger asChild>
          <button
            type="button"
            style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
            onBlur={onBlur}
            disabled={disabled}
          >
            <Flex
              w="full"
              align="center"
              gap={2}
              px={3}
              py={2}
              bg="bg.input"
              borderWidth="1px"
              borderColor="border.main"
              borderRadius="md"
              cursor={disabled ? 'not-allowed' : 'pointer'}
              opacity={disabled ? 0.5 : 1}
              minH="40px"
              _hover={{ borderColor: 'border.active' }}
              transition="all 0.2s"
              position="relative"
            >
              <HStack flex="1" overflow="hidden" flexWrap="wrap" gap={1}>
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <Badge
                      key={item.value}
                      variant="solid"
                      bg="blue.500"
                      color="white"
                      size="sm"
                      borderRadius="sm"
                      px={1}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      {item.label}
                    </Badge>
                  ))
                ) : (
                  <Text color="text.muted" fontSize="sm">
                    {placeholder}
                  </Text>
                )}
              </HStack>
              <HStack gap={1}>
                {value.length > 0 && !disabled && (
                  <Box
                    as="span"
                    onClick={handleClear}
                    color="text.muted"
                    _hover={{ color: 'text.primary' }}
                    display="flex"
                    alignItems="center"
                  >
                    <LuX size={14} />
                  </Box>
                )}
                <Box color="text.secondary">
                  <LuChevronDown size={16} />
                </Box>
              </HStack>
            </Flex>
          </button>
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="dialog"
              p={1}
              minW="200px"
              maxH="300px"
              overflowY="auto"
              zIndex="popover"
              _focusVisible={{ outline: 'none' }}
            >
              <Stack gap={0}>
                {items.length > 0 ? (
                  items.map((item) => {
                    const isSelected = value.includes(item.value);
                    return (
                      <Box
                        key={item.value}
                        px={3}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: 'bg.muted' }}
                        onClick={() => handleToggle(item.value)}
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(item.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Text fontSize="sm">{item.label}</Text>
                        </Checkbox>
                        {isSelected && <LuCheck size={14} color="var(--chakra-colors-blue-500)" />}
                      </Box>
                    );
                  })
                ) : (
                  <Box px={3} py={2}>
                    <Text fontSize="sm" color="text.muted">
                      No options available
                    </Text>
                  </Box>
                )}
              </Stack>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Field>
  );
};
