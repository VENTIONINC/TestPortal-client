// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Box, Button, Popover, Portal, Text, VStack } from '@chakra-ui/react';

import type { ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';

export const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${Array.from(parts[parts.length - 1])[0]}.` : parts[0];
};

const AssigneeAvatar = ({ name }: { name?: string }) => (
  <Box
    aria-hidden="true"
    flexShrink={0}
    w="6"
    h="6"
    display="grid"
    placeItems="center"
    borderRadius="full"
    bg={name ? 'blue.subtle' : 'bg.panel'}
    borderWidth={name ? '0' : '1px'}
    borderColor="border.main"
    color="blue.fg"
    fontSize="xs"
    fontWeight="medium"
  >
    {name?.trim().charAt(0).toUpperCase()}
  </Box>
);

export const AssigneeOptions = ({ users, selectedId, onSelect }: {
  users: Array<{ id: string; name: string }>;
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}) => (
  <VStack align="stretch" gap={0}>
    {users.map((user) => (
      <Button key={user.id} size="sm" variant="ghost" justifyContent="flex-start" px={2}
        bg={selectedId === user.id ? 'blue.50' : undefined}
        onClick={() => onSelect(user.id)} title={user.name}>
        <AssigneeAvatar name={user.name} />
        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{shortName(user.name)}</Text>
      </Button>
    ))}
    <Button size="sm" variant="ghost" justifyContent="flex-start" px={2}
      bg={selectedId === null ? 'blue.50' : undefined} onClick={() => onSelect(null)}>
      <AssigneeAvatar />
      Unassigned
    </Button>
  </VStack>
);

interface AssigneePickerProps {
  scenario: ManualTestRunScenarioRead;
  users: Array<{ id: string; name: string }>;
  disabled: boolean;
  triggerHeight?: string;
  onOpen: () => void;
  onChange: (assigneeId: string | null) => void;
}

export const AssigneePicker = ({ scenario, users, disabled, triggerHeight, onOpen, onChange }: AssigneePickerProps) => {
  const [open, setOpen] = useState(false);
  const options = scenario.assignee && !users.some((user) => user.id === scenario.assigneeId)
    ? [scenario.assignee, ...users]
    : users;

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => {
      setOpen(nextOpen);
      if (nextOpen) onOpen();
    }} positioning={{ placement: 'bottom-start' }}>
      <Popover.Trigger asChild>
        <Button
          aria-label={`Assignee for ${scenario.title}`}
          variant="ghost"
          size="xs"
          h={triggerHeight}
          fontSize="13px"
          w="full"
          minW={0}
          p={0}
          justifyContent="flex-start"
          bg="transparent"
          cursor={disabled ? 'not-allowed' : 'pointer'}
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          _expanded={{ bg: 'transparent' }}
          disabled={disabled}
          title={scenario.assignee?.name ?? 'Unassigned'}
        >
          <AssigneeAvatar name={scenario.assignee?.name} />
          <Text flex="1" minW={0} textAlign="left" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {scenario.assignee ? shortName(scenario.assignee.name) : 'Unassigned'}
          </Text>
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="200px" maxW="calc(100vw - 32px)" bg="bg.panel" p={1}>
            <Popover.Body p={0} maxH="240px" overflowY="auto">
              <AssigneeOptions users={options} selectedId={scenario.assigneeId ?? null}
                onSelect={(id) => { setOpen(false); if ((scenario.assigneeId ?? null) !== id) onChange(id); }} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

