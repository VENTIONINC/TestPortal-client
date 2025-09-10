import { Box, Button, Input, VStack, Text, Switch, HStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { usePatchApiV2UsersByUserIdIntegrationsMutation } from '@/redux/apis/generatedApi';
import { toaster } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const portalSettingsSchema = z.object({
  reportalPortalUrl: z.string().optional(),
  monitoringPortalUrl: z.string().optional(),
  reportPortalEnabled: z.boolean(),
  monitoringPortalEnabled: z.boolean(),
});

type PortalSettingsFormData = z.infer<typeof portalSettingsSchema>;

export function PortalSettings() {
  const user = useCurrentUser();
  const [updateUserIntegrations, { isLoading: isUpdating }] = usePatchApiV2UsersByUserIdIntegrationsMutation();

  const { register, handleSubmit, watch, setValue } = useForm<PortalSettingsFormData>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
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
          reportPortalUrl: data.reportalPortalUrl,
          reportPortalEnabled: data.reportPortalEnabled,
          monitoringPortalUrl: data.monitoringPortalUrl,
          monitoringPortalEnabled: data.monitoringPortalEnabled,
        },
      }).unwrap();

      toaster.create({
        title: 'Settings saved',
        description: 'Portal URLs have been updated successfully.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Error saving settings',
        description: 'Failed to update portal URLs. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCheckChange = (field: keyof PortalSettingsFormData) => (e: React.FormEvent<HTMLLabelElement>) => {
    const checked = (e.target as HTMLInputElement).checked;

    setValue(field, checked);
  };

  return (
    <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md" p={6}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Portal URLs
            </Text>
            <Text color="gray.600" fontSize="sm" mb={6}>
              Configure the URLs for your portal integrations.
            </Text>
          </Box>

          <Box>
            <HStack justify="space-between" align="center" mb={3}>
              <Text fontWeight="medium">Reportal Portal URL</Text>
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
              <Text fontWeight="medium">Monitoring Portal URL</Text>
              <Switch.Root
                size="sm"
                checked={watch('monitoringPortalEnabled')}
                // {...register('monitoringPortalEnabled')}
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
