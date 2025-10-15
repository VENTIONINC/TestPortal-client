import { useState } from 'react';
import { VStack, Box, Button, Input, Text, Flex, Grid, Textarea, Heading } from '@chakra-ui/react';

import { Checkbox } from '@/components/ui/checkbox';

import { DEFAULT_CTRF_CONFIG, CTRF_PRESETS } from './constants';
import { generateCTRFReport, downloadCTRFReport } from './helpers';
import { useReportGeneratorColors } from './hooks';
import type { CTRFReport, CTRFConfig } from './types';

export const CTRFReportGenerator = () => {
  const colors = useReportGeneratorColors();
  const [config, setConfig] = useState<CTRFConfig>(DEFAULT_CTRF_CONFIG);
  const [generatedReport, setGeneratedReport] = useState<CTRFReport | null>(null);

  const handleGenerateReport = () => {
    const report = generateCTRFReport(config);
    setGeneratedReport(report);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    downloadCTRFReport(generatedReport);
  };

  return (
    <Box maxW="6xl" mx="auto" p={6} w="100%">
      <Box bg={colors.card.bg} rounded="lg" shadow="lg" p={6} mb={6} borderWidth={1} borderColor={colors.card.border}>
        <Heading size="3xl" mb={6}>
          CTRF Report Generator
        </Heading>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
          <Box>
            <Box bg={colors.surface.bg} rounded="lg" p={4} borderWidth={1} borderColor={colors.surface.border}>
              <Heading size="lg" mb={4}>
                Configuration
              </Heading>

              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Tool Name
                  </Text>
                  <select
                    value={config.toolName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, toolName: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', borderWidth: '1px' }}
                  >
                    <option value="playwright">Playwright</option>
                    <option value="jest">Jest</option>
                    <option value="cypress">Cypress</option>
                    <option value="vitest">Vitest</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Tool Version
                  </Text>
                  <Input
                    value={config.toolVersion}
                    onChange={(e) => setConfig((prev) => ({ ...prev, toolVersion: e.target.value }))}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    App Name
                  </Text>
                  <Input
                    value={config.appName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, appName: e.target.value }))}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Branch
                  </Text>
                  <select
                    value={config.branchName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, branchName: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', borderWidth: '1px' }}
                  >
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Total Tests: {config.totalTests}
                  </Text>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    value={config.totalTests}
                    onChange={(e) => setConfig((prev) => ({ ...prev, totalTests: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Pass Rate: {config.passRate}%
                  </Text>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={config.passRate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, passRate: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </Box>

                <VStack align="stretch" gap={2}>
                  <Checkbox
                    checked={config.includeFlaky}
                    onCheckedChange={(e) => setConfig((prev) => ({ ...prev, includeFlaky: !!e.checked }))}
                  >
                    Include Flaky Tests
                  </Checkbox>
                  <Checkbox
                    checked={config.includeRetries}
                    onCheckedChange={(e) => setConfig((prev) => ({ ...prev, includeRetries: !!e.checked }))}
                  >
                    Include Retries
                  </Checkbox>
                </VStack>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Quick Presets
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    {Object.keys(CTRF_PRESETS).map((name) => (
                      <Button
                        key={name}
                        onClick={() => setConfig((prev) => ({ ...prev, ...CTRF_PRESETS[name] }))}
                        size="sm"
                        variant="outline"
                      >
                        {name}
                      </Button>
                    ))}
                  </Grid>
                </Box>

                <Button onClick={handleGenerateReport} w="100%" colorScheme="blue">
                  Generate Report
                </Button>
              </VStack>
            </Box>
          </Box>

          <Box gridColumn={{ base: 'span 1', lg: 'span 2' }}>
            <Box bg={colors.surface.bg} rounded="lg" p={4} borderWidth={1} borderColor={colors.surface.border}>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="lg">Generated CTRF Report</Heading>
                {generatedReport && (
                  <Button onClick={handleDownloadReport} size="sm" colorScheme="green">
                    Download JSON
                  </Button>
                )}
              </Flex>

              {generatedReport ? (
                <VStack align="stretch" gap={4}>
                  <Box
                    bg={colors.nestedSurface.bg}
                    p={4}
                    rounded="md"
                    borderWidth={1}
                    borderColor={colors.nestedSurface.border}
                  >
                    <Text fontWeight="medium" mb={2}>
                      Report Summary
                    </Text>
                    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={4}>
                      <Box>
                        <Text fontSize="sm" color={colors.total.label}>
                          Total
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          {generatedReport.results.summary.tests}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={colors.passed.label}>
                          Passed
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color={colors.passed.text}>
                          {generatedReport.results.summary.passed}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={colors.failed.label}>
                          Failed
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color={colors.failed.text}>
                          {generatedReport.results.summary.failed}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm">Pending</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                          {generatedReport.results.summary.pending}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm">Skipped</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                          {generatedReport.results.summary.skipped}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  <Box
                    bg={colors.card.bg}
                    borderWidth={1}
                    borderColor={colors.card.border}
                    rounded="md"
                    p={4}
                    maxH="96"
                    overflow="auto"
                  >
                    <Textarea
                      value={JSON.stringify(generatedReport, null, 2)}
                      readOnly
                      minH="80"
                      fontSize="xs"
                      fontFamily="mono"
                    />
                  </Box>
                </VStack>
              ) : (
                <Box textAlign="center" py={12} color="gray.500">
                  <Text>Click "Generate Report" to create a CTRF test report</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};
