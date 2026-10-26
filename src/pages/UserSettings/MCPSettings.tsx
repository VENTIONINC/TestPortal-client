// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { Accordion, Box, HStack, Switch, Text, VStack } from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';

import { MCPTokenSection } from '@/components/mcp-token';
import { toaster, Section } from '@/components/ui';
import { CopyableText } from '@/components/ui/components';
import { copyToClipboard } from '@/utils';

import { buildMcpEndpoint, createMcpClientRecipes, type McpClientId } from './configs';

export function MCPSettings() {
  const [useBeta, setUseBeta] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [copiedByClient, setCopiedByClient] = useState<Partial<Record<McpClientId, string>>>({});
  const endpoint = buildMcpEndpoint(useBeta);
  const recipes = createMcpClientRecipes(endpoint);
  const endpointRef = useRef(endpoint);
  const copyRequestIds = useRef<Partial<Record<McpClientId, number>>>({});
  const copyTimers = useRef<Partial<Record<McpClientId, ReturnType<typeof setTimeout>>>>({});

  endpointRef.current = endpoint;

  useEffect(
    () => () => {
      for (const timer of Object.values(copyTimers.current)) {
        if (timer) clearTimeout(timer);
      }
    },
    [],
  );

  const handleCopy = async (clientId: McpClientId, configuration: string) => {
    const requestId = (copyRequestIds.current[clientId] ?? 0) + 1;
    copyRequestIds.current[clientId] = requestId;
    const previousTimer = copyTimers.current[clientId];
    if (previousTimer) clearTimeout(previousTimer);
    setCopiedByClient((current) => {
      if (!current[clientId]) return current;
      const next = { ...current };
      delete next[clientId];
      return next;
    });

    try {
      await copyToClipboard(configuration);
      if (endpointRef.current !== endpoint || copyRequestIds.current[clientId] !== requestId) return;

      setCopiedByClient((current) => ({ ...current, [clientId]: configuration }));
      toaster.create({
        title: 'Copied!',
        description: 'Configuration copied to clipboard',
        type: 'success',
      });

      copyTimers.current[clientId] = setTimeout(() => {
        if (copyRequestIds.current[clientId] === requestId) {
          setCopiedByClient((current) => {
            if (current[clientId] !== configuration) return current;
            const next = { ...current };
            delete next[clientId];
            return next;
          });
        }
      }, 2000);
    } catch {
      if (endpointRef.current !== endpoint || copyRequestIds.current[clientId] !== requestId) return;
      toaster.create({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        type: 'error',
      });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <MCPTokenSection />

      <Section.Root>
        <Section.Head>MCP Client Setup</Section.Head>
        <Section.Description>
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="text.muted">
              Generate setup configuration for the MCP client you use. Both endpoints use the same MCP token.
            </Text>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <Switch.Root
                checked={useBeta}
                onCheckedChange={({ checked }) => setUseBeta(checked)}
              >
                <Switch.HiddenInput role="switch" />
                <Switch.Control />
                <Switch.Label>Use beta MCP endpoint</Switch.Label>
              </Switch.Root>
              <Box minW={0} maxW="100%">
                <Text fontSize="xs" color="text.muted" mb={1}>
                  Selected endpoint
                </Text>
                <Text
                  aria-live="polite"
                  fontSize="sm"
                  fontFamily="mono"
                  color="text.main"
                  overflowWrap="anywhere"
                  data-testid="selected-mcp-endpoint"
                >
                  {endpoint}
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Section.Description>

        <Section.Body>
          <Accordion.Root
            multiple
            collapsible
            value={expandedSections}
            onValueChange={({ value }) => setExpandedSections(value)}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            {recipes.map((recipe) => {
              const isCopied = copiedByClient[recipe.id] === recipe.configuration;

              return (
                <Accordion.Item
                  key={recipe.id}
                  value={recipe.id}
                  bg="bg.cardSecondary"
                  border="1px solid"
                  borderColor="borders.subtle"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <Accordion.ItemTrigger
                    w="100%"
                    px={4}
                    py={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    textAlign="left"
                    _hover={{ bg: 'bg.card' }}
                  >
                    <Text fontWeight="semibold" color="text.main">
                      {recipe.name}
                    </Text>
                    <Accordion.ItemIndicator>
                      <LuChevronDown />
                    </Accordion.ItemIndicator>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody px={4} pb={4}>
                      <VStack align="stretch" gap={4}>
                        <Text fontSize="sm" color="text.muted">
                          {recipe.format} configuration
                        </Text>
                        <Section.Card p={3}>
                          <CopyableText
                            value={recipe.configuration}
                            variant="multi"
                            copied={isCopied}
                            onCopy={() => void handleCopy(recipe.id, recipe.configuration)}
                            copyAriaLabel={
                              isCopied ? `${recipe.name} configuration copied` : `Copy ${recipe.name} configuration`
                            }
                          />
                        </Section.Card>
                        <Box>
                          <Text fontSize="sm" color="text.main" fontWeight="semibold" mb={2}>
                            Setup instructions
                          </Text>
                          <Box as="ol" pl={5}>
                            {recipe.setupInstructions.map((instruction) => (
                              <Box as="li" key={instruction} fontSize="sm" color="text.muted" mb={1}>
                                {instruction}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </VStack>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>

          <Box
            mt={4}
            p={3}
            bg="rgba(255, 135, 77, 0.1)"
            border="1px"
            borderColor="status.warning"
            borderRadius="md"
            w="100%"
          >
            <Text fontSize="sm" color="status.warning" fontWeight="semibold">
              Security Note:
            </Text>
            <Text fontSize="sm" color="status.warning" mt={1}>
              Keep your MCP token secure and never share it publicly. Treat it like a password.
            </Text>
          </Box>
        </Section.Body>
      </Section.Root>
    </VStack>
  );
}
