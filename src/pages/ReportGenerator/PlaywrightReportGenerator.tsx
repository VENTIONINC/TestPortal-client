import { useState } from 'react';
import { VStack, Box, Button, Input, Text, Flex, Grid, Textarea } from '@chakra-ui/react';

import { DEFAULT_CONFIG } from './constants';
import { generateProductionLikeName, generateReport, downloadReport } from './helpers';
import { useReportGeneratorColors } from './hooks';
import type { PlaywrightReport } from './types';

export const PlaywrightReportGenerator = () => {
  const [config, setConfig] = useState({
    reportName: generateProductionLikeName(),
    projectName: DEFAULT_CONFIG.projectName,
    totalTests: DEFAULT_CONFIG.totalTests,
    passRate: DEFAULT_CONFIG.passRate,
    browsers: DEFAULT_CONFIG.browsers,
    workers: DEFAULT_CONFIG.workers,
  });

  const [generatedReport, setGeneratedReport] = useState<PlaywrightReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const colors = useReportGeneratorColors();

  const handleGenerateReport = () => {
    setIsGenerating(true);

    const report = generateReport({
      reportName: config.reportName,
      projectName: config.projectName,
      totalTests: config.totalTests,
      passRate: config.passRate,
      browsers: config.browsers,
      workers: config.workers,
    });

    setGeneratedReport(report);
    setIsGenerating(false);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    downloadReport(generatedReport);
  };

  return (
    <Box maxW="6xl" mx="auto" p={6} w="100%">
      <Box bg={colors.card.bg} rounded="lg" shadow="lg" p={6} mb={6} borderWidth={1} borderColor={colors.card.border}>
        <Text fontSize="3xl" fontWeight="bold" mb={6}>
          Playwright Report Generator
        </Text>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Report Name
              </Text>
              <Flex gap={2}>
                <Input
                  value={config.reportName}
                  onChange={(e) => setConfig({ ...config, reportName: e.target.value })}
                  placeholder="e.g., api-prod-nightly-1234-2025-09-03-14-30-15"
                />
                <Button onClick={() => setConfig({ ...config, reportName: generateProductionLikeName() })} size="sm">
                  Generate
                </Button>
              </Flex>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Project Name
              </Text>
              <Input
                value={config.projectName}
                onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Total Tests: {config.totalTests}
              </Text>
              <input
                type="range"
                min={5}
                max={100}
                value={config.totalTests}
                onChange={(e) => setConfig({ ...config, totalTests: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#3b82f6' }}
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
                onChange={(e) => setConfig({ ...config, passRate: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Workers: {config.workers}
              </Text>
              <input
                type="range"
                min={1}
                max={8}
                value={config.workers}
                onChange={(e) => setConfig({ ...config, workers: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </Box>
          </VStack>

          <VStack align="stretch" gap={4}></VStack>
        </Grid>

        <Flex gap={3} mb={6}>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>

          {generatedReport && (
            <Button onClick={handleDownloadReport} colorScheme="blue">
              Download Report
            </Button>
          )}
        </Flex>

        {generatedReport && (
          <Box bg={colors.surface.bg} rounded="lg" p={4} borderWidth={1} borderColor={colors.surface.border}>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mb={4}>
              <Box bg={colors.passed.bg} borderWidth={1} borderColor={colors.passed.border} rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={colors.passed.text}>
                  {generatedReport.stats.passed}
                </Text>
                <Text fontSize="sm" color={colors.passed.label}>
                  Passed
                </Text>
              </Box>
              <Box bg={colors.failed.bg} borderWidth={1} borderColor={colors.failed.border} rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={colors.failed.text}>
                  {generatedReport.stats.failed}
                </Text>
                <Text fontSize="sm" color={colors.failed.label}>
                  Failed
                </Text>
              </Box>
              <Box bg={colors.timedOut.bg} borderWidth={1} borderColor={colors.timedOut.border} rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={colors.timedOut.text}>
                  {generatedReport.stats.timedOut}
                </Text>
                <Text fontSize="sm" color={colors.timedOut.label}>
                  Timed Out
                </Text>
              </Box>
              <Box bg={colors.total.bg} borderWidth={1} borderColor={colors.total.border} rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color={colors.total.text}>
                  {generatedReport.stats.total}
                </Text>
                <Text fontSize="sm" color={colors.total.label}>
                  Total
                </Text>
              </Box>
            </Grid>

            <Box bg={colors.nestedSurface.bg} borderWidth={1} borderColor={colors.nestedSurface.border} rounded="md" p={3} mb={4}>
              <Text fontWeight="medium" mb={2}>
                Report Name:
              </Text>
              <Box bg={colors.surface.bg} p={3} rounded="md" borderWidth={1} borderColor={colors.surface.border}>
                <Text fontSize="lg" fontFamily="mono">
                  {generatedReport.reportName || 'Unnamed Report'}
                </Text>
              </Box>
            </Box>

            <Box bg={colors.nestedSurface.bg} borderWidth={1} borderColor={colors.nestedSurface.border} rounded="md" p={3} mb={4}>
              <Text fontWeight="medium" mb={2}>
                Complete JSON Report:
              </Text>
              <Textarea
                id="json-output"
                value={JSON.stringify(generatedReport, null, 2)}
                readOnly
                h="64"
                fontSize="xs"
                fontFamily="mono"
                resize="none"
              />
            </Box>

            <Box bg={colors.nestedSurface.bg} borderWidth={1} borderColor={colors.nestedSurface.border} rounded="md" p={3}>
              <Text fontWeight="medium" mb={2}>
                Report Summary:
              </Text>
              <VStack align="stretch" gap={1} fontSize="sm">
                <Text>
                  <strong>Report Name:</strong> {generatedReport.reportName}
                </Text>
                <Text>
                  <strong>Duration:</strong> {Math.round(generatedReport.stats.duration / 1000)}s
                </Text>
                <Text>
                  <strong>Workers:</strong> {config.workers}
                </Text>
                <Text>
                  <strong>Browsers:</strong> {config.browsers.join(', ')}
                </Text>
                <Text>
                  <strong>Pass Rate:</strong>{' '}
                  {Math.round((generatedReport.stats.passed / generatedReport.stats.total) * 100)}%
                </Text>
              </VStack>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
