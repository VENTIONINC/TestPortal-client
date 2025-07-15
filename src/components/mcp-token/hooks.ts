import { useState } from 'react';

import { toaster } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  usePostApiV2UsersByUserIdMcpTokenMutation,
  useDeleteApiV2UsersByUserIdMcpTokenMutation,
} from '@/redux/apis/generatedApi';

export const useMCPKeys = () => {
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);

  const { user } = useAuth();
  const mcpToken = user?.mcpToken || null;
  const [generateMcpToken, { isLoading: isRequestingToken }] = usePostApiV2UsersByUserIdMcpTokenMutation();
  const [revokeMcpToken, { isLoading: isRevokingToken }] = useDeleteApiV2UsersByUserIdMcpTokenMutation();

  const handleRequestToken = async () => {
    if (!user?.id) {
      toaster.create({
        title: 'Error',
        description: 'User not found. Please log in again.',
        type: 'error',
      });
      return;
    }

    try {
      const response = await generateMcpToken({
        userId: user.id,
      }).unwrap();

      setTokenExpiresAt(response.expiresAt);

      toaster.create({
        title: 'MCP Token Generated',
        description: 'Your MCP token has been generated successfully. Copy it to use in Claude desktop.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to generate MCP token. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRevokeToken = async () => {
    if (!user?.id) {
      toaster.create({
        title: 'Error',
        description: 'User not found. Please log in again.',
        type: 'error',
      });
      return;
    }

    try {
      await revokeMcpToken({
        userId: user.id,
      }).unwrap();

      setTokenExpiresAt(null);

      toaster.create({
        title: 'MCP Token Revoked',
        description: 'Your MCP token has been revoked successfully.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to revoke MCP token. Please try again.',
        type: 'error',
      });
    }
  };

  return {
    mcpToken,
    tokenExpiresAt,
    isRequestingToken,
    isRevokingToken,
    handleRequestToken,
    handleRevokeToken,
  };
};
