// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';
import { Box, Flex, Popover, Portal, Stack, Text, HStack, Button } from '@chakra-ui/react';
import { LuChevronDown, LuX, LuCheck } from 'react-icons/lu';

import { Checkbox, Field, FieldProps, Badge } from '@/components/ui';

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
  const [localValue, setLocalValue] = useState<string[]>(value);

  // Sync local state when external value changes
  useMemo(() => {
    setLocalValue(value);
  }, [value]);

  const selectedItems = useMemo(() => items.filter((item) => localValue.includes(item.value)), [items, localValue]);

  const handleToggle = useCallback(
    (itemValue: string) => {
      const newValue = localValue.includes(itemValue)
        ? localValue.filter((v) => v !== itemValue)
        : [...localValue, itemValue];
      setLocalValue(newValue); // Instant UI update
      onChange(newValue);
    },
    [localValue, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLocalValue([]);
      onChange([]);
    },
    [onChange],
  );

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            w="full"
            outline="none"
            onBlur={onBlur}
            disabled={disabled}
            p={0}
            h="auto"
            display="block"
            css={{
              '&:focus-visible > div': {
                borderColor: 'var(--chakra-colors-border-focus)',
                boxShadow: '0 0 0 1px var(--chakra-colors-border-focus)',
              },
            }}
          >
            <Flex
              w="full"
              align="center"
              gap={2}
              px={3}
              py={2}
              bg="bg.input"
              color="text.primary"
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
              <HStack flex="1" overflow="hidden" flexWrap="wrap" gap={1} minW={0}>
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <Badge key={item.value} variant="surface" status="info" isCapitalize={false} maxW="100%">
                      <Text truncate maxW="full" display="block">
                        {item.label}
                      </Text>
                    </Badge>
                  ))
                ) : (
                  <Text color="text.muted" fontSize="sm">
                    {placeholder}
                  </Text>
                )}
              </HStack>
              <HStack gap={1}>
                {localValue.length > 0 && !disabled && (
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
          </Button>
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
              maxW="340px"
              maxH="300px"
              overflowY="auto"
              overflowX="hidden"
              zIndex="popover"
              _focusVisible={{ outline: 'none' }}
            >
              <Stack gap={0}>
                {items.length > 0 ? (
                  items.map((item) => {
                    const isSelected = localValue.includes(item.value);
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
                        <Box pointerEvents="none" display="flex" alignItems="center" flex="1" minW={0}>
                          <Checkbox checked={isSelected} tabIndex={-1} w="full">
                            <Text fontSize="sm" truncate maxW="full" display="block">
                              {item.label}
                            </Text>
                          </Checkbox>
                        </Box>
                        {isSelected && (
                          <LuCheck size={14} color="var(--chakra-colors-blue-500)" style={{ flexShrink: 0 }} />
                        )}
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
