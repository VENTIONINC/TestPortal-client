import { Section } from '@/components/ui';

import { useMCPKeys } from './hooks/index';
import { TokenHeader, TokenReadyCard, TokenGenerationCard } from './components';

export function MCPTokenSection() {
  const { mcpToken, tokenExpiresAt, isRequestingToken, isRevokingToken, handleRequestToken, handleRevokeToken } =
    useMCPKeys();

  return (
    <Section.Root>
      <TokenHeader
        hasToken={!!mcpToken}
        isRequestingToken={isRequestingToken}
        isRevokingToken={isRevokingToken}
        onRequest={handleRequestToken}
        onRevoke={handleRevokeToken}
      />
      <Section.Description>Generate your Model Context Protocol token for Claude desktop</Section.Description>
      <Section.Card p={2}>
        {mcpToken ? (
          <TokenReadyCard mcpToken={mcpToken} tokenExpiresAt={tokenExpiresAt} />
        ) : (
          <TokenGenerationCard />
        )}
      </Section.Card>
    </Section.Root>
  );
}
