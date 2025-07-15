import { useState } from 'react';

import { toaster } from '@/components/ui';

export const useMCPKeys = () => {
  const [isRequestingToken, setIsRequestingToken] = useState(false);

  const handleRequestToken = async () => {
    setIsRequestingToken(true);

    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await fetch('/api/mcp/generate-token', { method: 'POST' });
      
      toaster.create({
        title: 'Coming Soon',
        description: 'MCP token generation will be available once the API is implemented.',
        type: 'info',
      });
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to generate MCP token. Please try again.',
        type: 'error',
      });
    } finally {
      setIsRequestingToken(false);
    }
  };

  return {
    isRequestingToken,
    handleRequestToken,
  };
};