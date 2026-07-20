// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useCallback } from 'react';
import { Grid, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { Alert, Skeleton, Wrap } from '@/components/ui';
import { PATHS } from '@/types/paths';

import { SkillCard } from '../../components';
import { useSkillsCatalog } from '../../hooks';

export const SkillsCatalogView = memo(() => {
  const navigate = useNavigate();
  const { skills, isInitialLoading, error, isEmpty } = useSkillsCatalog();

  const handleSelectSkill = useCallback(
    (skillId: string) => {
      navigate(PATHS.SKILL_DETAILS.replace(':id', encodeURIComponent(skillId)));
    },
    [navigate],
  );

  return (
    <Wrap my={4} mx={6} p={4}>
      <VStack align="stretch" gap={4} w="100%">
        <VStack align="start" gap={2}>
          <Heading fontSize="lg">Skills Hub</Heading>
          <Text color="text.secondary">
            Browse authenticated Skills Hub packages, preview their Markdown instructions, and download the assets you
            need.
          </Text>
        </VStack>

        {isInitialLoading && (
          <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={6} justifyContent="center" py={4}>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Skeleton key={index} minH="224px" borderRadius="xl" loading={true} />
            ))}
          </Grid>
        )}

        {error && skills.length === 0 && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Failed to load skills</Alert.Title>
              <Alert.Description>Please try again in a moment.</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {skills.length > 0 && (
          <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={6} justifyContent="center">
            {skills.map((skill) => (
              <Skeleton key={skill.id} loading={false} minH="224px" borderRadius="xl">
                <SkillCard skill={skill} onSelect={handleSelectSkill} />
              </Skeleton>
            ))}
          </Grid>
        )}

        {isEmpty && (
          <VStack py={8}>
            <Text color="text.muted">No skills are available right now.</Text>
          </VStack>
        )}
      </VStack>
    </Wrap>
  );
});
