// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Button, Popover, Portal, Text } from '@chakra-ui/react';
import { FiUserPlus } from 'react-icons/fi';

import { AssigneeOptions } from './AssigneePicker';

export const BulkAssigneePicker = ({
  count,
  users,
  disabled,
  onOpen,
  onChange,
}: {
  count: number;
  users: Array<{ id: string; name: string }>;
  disabled: boolean;
  onOpen: () => void;
  onChange: (id: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    setOpen(nextOpen);
    if (nextOpen) onOpen();
  };

  const handleSelectAssignee = (id: string | null) => {
    setOpen(false);
    onChange(id);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      positioning={{ placement: 'top-end' }}
    >
      <Popover.Trigger asChild>
        <Button
          size="xs"
          variant="ghost"
          color="white"
          disabled={disabled}
          aria-label="Bulk assign"
          _hover={{ bg: 'gray.700', color: 'white' }}
          _active={{ bg: 'gray.600', color: 'white' }}
          _expanded={{ bg: 'gray.700', color: 'white' }}
        >
          <FiUserPlus aria-hidden="true" /> Assign
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="200px" maxW="calc(100vw - 32px)" bg="bg.panel" color="text.primary" p={1}>
            <Popover.Body p={0} maxH="240px" overflowY="auto">
              <Text fontSize="xs" color="text.secondary" px={2} py={2}>
                Assign {count} selected to
              </Text>
              <AssigneeOptions
                users={users}
                onSelect={handleSelectAssignee}
              />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
