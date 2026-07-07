// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Button, Grid, GridItem, Heading, HStack, Separator, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiDownload, FiPackage } from 'react-icons/fi';

import { SkillMarkdownPreview, SkillTag } from '@/components/skills/components';
import { useSkillDetail, useSkillDownloads } from '@/components/skills/hooks';
import { Alert, Wrap } from '@/components/ui';

const MetadataRow = ({ label, value }: { label: string; value: string }) => (
  <VStack align="start" gap={1}>
    <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="text.muted">
      {label}
    </Text>
    <Text color="text.main">{value}</Text>
  </VStack>
);

export const SkillDetailView = memo(() => {
  const { skillName, metadata, content, isFetching, isInitialLoading, error, isNotFound, hasInvalidSkillName } =
    useSkillDetail();
  const {
    markdownError,
    archiveError,
    isDownloadingMarkdown,
    isDownloadingArchive,
    handleMarkdownDownload,
    handleArchiveDownload,
  } = useSkillDownloads(skillName);

  if (hasInvalidSkillName) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text fontSize="lg" color="text.main">
          Skill not found
        </Text>
      </VStack>
    );
  }

  if (error && isNotFound && !metadata) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text fontSize="lg" color="text.main">
          Skill not found
        </Text>
        <Text color="text.secondary">The requested skill is unavailable or has been removed.</Text>
      </VStack>
    );
  }

  if (error && !isFetching && !metadata) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text color="status.error.text" fontSize="lg">
          Failed to load skill details
        </Text>
        <Text color="text.secondary">Please refresh the page and try again.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6} px={4} py={6}>
      <Grid templateColumns={{ base: '1fr', xl: '320px 1fr' }} gap={8} alignItems="start">
        <GridItem>
          <Skeleton loading={isInitialLoading} minH="360px" borderRadius="xl">
            <Wrap w="100%" p={6}>
              <VStack align="stretch" gap={5} w="100%">
                <VStack align="start" gap={3}>
                  <HStack wrap="wrap">
                    {metadata?.category && <SkillTag label={metadata.category} />}
                    {metadata?.version && <SkillTag label={`v${metadata.version}`} />}
                    {metadata?.license && <SkillTag label={metadata.license} />}
                  </HStack>

                  <VStack align="start" gap={2}>
                    <Heading size="lg" color="text.main">
                      {metadata?.title}
                    </Heading>
                    <Text color="text.secondary">{metadata?.description}</Text>
                  </VStack>
                </VStack>

                <Separator />

                <VStack align="stretch" gap={4}>
                  <MetadataRow label="Skill Name" value={metadata?.name ?? skillName} />
                  {metadata?.compatibility && <MetadataRow label="Compatibility" value={metadata.compatibility} />}
                </VStack>

                <Separator />

                <VStack align="stretch" gap={3}>
                  <Button
                    variant="primary"
                    onClick={handleMarkdownDownload}
                    loading={isDownloadingMarkdown}
                    disabled={!metadata}
                  >
                    <FiDownload />
                    Download SKILL.md
                  </Button>
                  {markdownError && (
                    <Text color="status.error.text" fontSize="sm">
                      {markdownError}
                    </Text>
                  )}

                  <Button
                    variant="secondary"
                    onClick={handleArchiveDownload}
                    loading={isDownloadingArchive}
                    disabled={!metadata}
                  >
                    <FiPackage />
                    Download archive
                  </Button>
                  {archiveError && (
                    <Text color="status.error.text" fontSize="sm">
                      {archiveError}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Wrap>
          </Skeleton>
        </GridItem>

        <GridItem>
          <Skeleton loading={isInitialLoading} minH="360px" borderRadius="xl">
            <Wrap w="100%" p={6}>
              <VStack align="stretch" gap={4} w="100%">
                <VStack align="start" gap={2}>
                  <Heading size="md">Markdown Preview</Heading>
                </VStack>

                {!isInitialLoading && !content && (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>No preview content</Alert.Title>
                      <Alert.Description>This skill does not currently include Markdown preview content.</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {content && <SkillMarkdownPreview content={content} />}
              </VStack>
            </Wrap>
          </Skeleton>
        </GridItem>
      </Grid>
    </VStack>
  );
});
