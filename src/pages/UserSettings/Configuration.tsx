import { Box, Button, Input, VStack, Text, Switch, HStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatchApiV2UsersByUserIdIntegrationsMutation } from '@/redux/apis/generatedApi';
import { toaster } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

const portalSettingsSchema = z.object({
  analyzeEnabled: z.boolean(),
  reportalPortalUrl: z.string().optional(),
  monitoringPortalUrl: z.string().optional(),
  reportPortalEnabled: z.boolean(),
  monitoringPortalEnabled: z.boolean(),
});

type PortalSettingsFormData = z.infer<typeof portalSettingsSchema>;

export function Configuration() {
  const user = useCurrentUser();
  const [updateUserIntegrations, { isLoading: isUpdating }] = usePatchApiV2UsersByUserIdIntegrationsMutation();
  const { surfaces, borders, text } = useSurfaceColors();

  const { register, handleSubmit, watch, setValue } = useForm<PortalSettingsFormData>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      analyzeEnabled: user.analyzeEnabled || false,
      reportalPortalUrl: user.reportPortalUrl || '',
      monitoringPortalUrl: user.monitoringPortalUrl || '',
      reportPortalEnabled: user.reportPortalEnabled || false,
      monitoringPortalEnabled: user.monitoringPortalEnabled || false,
    },
  });

  const onSubmit = async (data: PortalSettingsFormData) => {
    try {
      await updateUserIntegrations({
        userId: user.id,
        userIntegrationsUpdateRequest: {
          analyzeEnabled: data.analyzeEnabled,
          reportPortalUrl: data.reportalPortalUrl,
          reportPortalEnabled: data.reportPortalEnabled,
          monitoringPortalUrl: data.monitoringPortalUrl,
          monitoringPortalEnabled: data.monitoringPortalEnabled,
        },
      }).unwrap();

      toaster.create({
        title: 'Settings saved',
        description: 'Integration settings have been updated successfully.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Error saving settings',
        description: 'Failed to update integration settings. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCheckChange = (field: keyof PortalSettingsFormData) => (e: React.FormEvent<HTMLLabelElement>) => {
    const checked = (e.target as HTMLInputElement).checked;

    setValue(field, checked);
  };

  return (
    <Box bg={surfaces.card} border="1px" borderColor={borders.subtle} borderRadius="md" shadow="md" p={6}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color={text.primary}>
              Integration Settings
            </Text>
            <Text color={text.muted} fontSize="sm" mb={6}>
              Configure your integration settings.
            </Text>
          </Box>

          <Box>
            <HStack justify="space-between" align="center" mb={3}>
              <Text fontWeight="medium" color={text.primary}>
                Enable Analysis
              </Text>
              <Switch.Root
                size="sm"
                checked={watch('analyzeEnabled')}
                onChange={handleCheckChange('analyzeEnabled')}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>
          </Box>

          <Box>
            <HStack justify="space-between" align="center" mb={3}>
              <Text fontWeight="medium" color={text.primary}>
                Reportal Portal URL
              </Text>
              <Switch.Root
                size="sm"
                checked={watch('reportPortalEnabled')}
                // {...register('reportPortalEnabled')}
                onChange={handleCheckChange('reportPortalEnabled')}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>
            <Input {...register('reportalPortalUrl')} placeholder="Enter reportal portal URL" size="md" />
          </Box>

          <Box>
            <HStack justify="space-between" align="center" mb={3}>
              <Text fontWeight="medium" color={text.primary}>
                Monitoring Portal URL
              </Text>
              <Switch.Root
                size="sm"
                checked={watch('monitoringPortalEnabled')}
                onChange={handleCheckChange('monitoringPortalEnabled')}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>
            <Input {...register('monitoringPortalUrl')} placeholder="Enter monitoring portal URL" size="md" />
          </Box>

          <Box pt={4}>
            <Button onClick={handleSubmit(onSubmit)} colorScheme="blue" loading={isUpdating} loadingText="Saving...">
              Save Settings
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
}
