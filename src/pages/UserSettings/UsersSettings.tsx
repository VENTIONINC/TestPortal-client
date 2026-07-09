// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Box, Button, Flex, HStack, Spinner, Table, Text, VStack } from '@chakra-ui/react';

import {
  useGetApiV2AdminUsersQuery,
  usePostApiV2AdminUsersByUserIdApproveMutation,
  usePostApiV2AdminUsersByUserIdRestoreMutation,
  usePostApiV2AdminUsersByUserIdSuspendMutation,
  type User,
  type UserStatus,
} from '@/redux/apis/generatedApi';
import { Alert, Badge, Section, toaster } from '@/components/ui';
import { extractApiError } from '@/utils/apiErrors';

type UserAction = 'approve' | 'suspend' | 'restore';

const STATUS_BADGE_STATUS: Record<UserStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  active: 'success',
  suspended: 'error',
};

const ACTION_LABELS: Record<UserAction, string> = {
  approve: 'Approve',
  suspend: 'Suspend',
  restore: 'Restore',
};

const ACTION_SUCCESS_MESSAGES: Record<UserAction, string> = {
  approve: 'User approved successfully.',
  suspend: 'User suspended successfully.',
  restore: 'User restored successfully.',
};

function getDirectoryErrorMessage(error: FetchBaseQueryError | SerializedError) {
  if ('status' in error && error.status === 403) {
    return 'The server denied access to the administrator user directory. Confirm that your account still has administrator access and try again.';
  }

  return extractApiError(error);
}

function getAvailableAction(status: UserStatus): UserAction | null {
  switch (status) {
    case 'pending':
      return 'approve';
    case 'active':
      return 'suspend';
    case 'suspended':
      return 'restore';
    default:
      return null;
  }
}

export function UsersSettings() {
  const { data: users, isLoading, isFetching, error, refetch } = useGetApiV2AdminUsersQuery();
  const [approveUser] = usePostApiV2AdminUsersByUserIdApproveMutation();
  const [suspendUser] = usePostApiV2AdminUsersByUserIdSuspendMutation();
  const [restoreUser] = usePostApiV2AdminUsersByUserIdRestoreMutation();

  const [pendingAction, setPendingAction] = useState<{ userId: string; action: UserAction } | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const usersSorted = useMemo(
    () => [...(users ?? [])].sort((left, right) => left.name.localeCompare(right.name)),
    [users],
  );

  const handleAction = async (user: User, action: UserAction) => {
    setPendingAction({ userId: user.id, action });
    setActionErrorMessage(null);

    try {
      if (action === 'approve') {
        await approveUser({ userId: user.id }).unwrap();
      }

      if (action === 'suspend') {
        await suspendUser({ userId: user.id }).unwrap();
      }

      if (action === 'restore') {
        await restoreUser({ userId: user.id }).unwrap();
      }

      toaster.create({
        title: 'User updated',
        description: ACTION_SUCCESS_MESSAGES[action],
        type: 'success',
      });
    } catch (mutationError) {
      setActionErrorMessage(extractApiError(mutationError as FetchBaseQueryError | SerializedError));
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <Section.Root>
        <Section.Head>Users</Section.Head>
        <Section.Description>Review account access and current lifecycle status for your workspace.</Section.Description>
        <Section.Body>
          <Flex align="center" gap={3} color="text.secondary">
            <Spinner size="sm" />
            <Text>Loading users...</Text>
          </Flex>
        </Section.Body>
      </Section.Root>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Failed to load users</Alert.Title>
          <Alert.Description>{getDirectoryErrorMessage(error)}</Alert.Description>
          <Button mt={3} size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (!usersSorted.length) {
    return (
      <Section.Root>
        <Section.Head>Users</Section.Head>
        <Section.Description>Review account access and current lifecycle status for your workspace.</Section.Description>
        <Section.Body>
          <Text color="text.secondary">No users were returned by the server.</Text>
        </Section.Body>
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Head>
        <Flex justify="space-between" align="center" gap={4}>
          <Box>Users</Box>
          {isFetching ? (
            <HStack color="text.secondary" gap={2}>
              <Spinner size="xs" />
              <Text fontSize="sm">Refreshing</Text>
            </HStack>
          ) : null}
        </Flex>
      </Section.Head>
      <Section.Description>Review users and manage pending, active, and suspended accounts.</Section.Description>

      <Section.Body>
        <VStack align="stretch" gap={4}>
          {actionErrorMessage ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Could not update user status</Alert.Title>
                <Alert.Description>{actionErrorMessage}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>Role</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {usersSorted.map((user) => {
                  const action = getAvailableAction(user.status);
                  const isActionPending = pendingAction?.userId === user.id;

                  return (
                    <Table.Row key={user.id}>
                      <Table.Cell>
                        <Text fontWeight="medium" color="text.main">
                          {user.name}
                        </Text>
                      </Table.Cell>
                      <Table.Cell color="text.secondary">{user.email}</Table.Cell>
                      <Table.Cell>
                        <Badge status="info">{user.role}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge status={STATUS_BADGE_STATUS[user.status]}>{user.status}</Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        {action ? (
                          <Button
                            size="xs"
                            variant="outline"
                            loading={isActionPending}
                            onClick={() => handleAction(user, action)}
                            disabled={Boolean(pendingAction)}
                          >
                            {ACTION_LABELS[action]}
                          </Button>
                        ) : (
                          <Text color="text.secondary" fontSize="sm">
                            No actions
                          </Text>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        </VStack>
      </Section.Body>
    </Section.Root>
  );
}
