import { useState } from 'react';
import { VStack, Box, Button, Input, Text, Flex, Grid, Textarea, Heading } from '@chakra-ui/react';

import { Checkbox } from '@/components/ui/checkbox';

import { DEFAULT_CONFIG } from './constants';
import { generateProductionLikeName, generateReport, downloadReport } from './helpers';
import { useReportGeneratorColors } from './hooks';
import type { PlaywrightReport } from './types';

export const PlaywrightReportGenerator = () => {
  const colors = useReportGeneratorColors();
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

  const toggleBrowser = (browser: string) => {
    setConfig((prev) => ({
      ...prev,
      browsers: prev.browsers.includes(browser)
        ? prev.browsers.filter((b) => b !== browser)
        : [...prev.browsers, browser],
    }));
  };

  return (
    <Box maxW="6xl" mx="auto" p={6} w="100%">
      <Box bg={colors.card.bg} rounded="lg" shadow="lg" p={6} mb={6} borderWidth={1} borderColor={colors.card.border}>
        <Heading size="3xl" mb={6}>
          Playwright Report Generator
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
                    Report Name
                  </Text>
                  <Flex gap={2}>
                    <Input
                      value={config.reportName}
                      onChange={(e) => setConfig({ ...config, reportName: e.target.value })}
                      placeholder="e.g., api-prod-nightly-1234-2025-09-03-14-30-15"
                    />
                    <Button onClick={() => setConfig({ ...config, reportName: generateProductionLikeName() })} size="sm">
                      Gen
                    </Button>
                  </Flex>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
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
                    onChange={(e) => setConfig({ ...config, passRate: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
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
                    style={{ width: '100%' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Browsers
                  </Text>
                  <VStack align="stretch" gap={2}>
                    <Checkbox
                      checked={config.browsers.includes('chromium')}
                      onCheckedChange={() => toggleBrowser('chromium')}
                    >
                      Chromium
                    </Checkbox>
                    <Checkbox
                      checked={config.browsers.includes('firefox')}
                      onCheckedChange={() => toggleBrowser('firefox')}
                    >
                      Firefox
                    </Checkbox>
                    <Checkbox checked={config.browsers.includes('webkit')} onCheckedChange={() => toggleBrowser('webkit')}>
                      WebKit
                    </Checkbox>
                  </VStack>
                </Box>

                <Button onClick={handleGenerateReport} disabled={isGenerating} w="100%" colorScheme="blue">
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </VStack>
            </Box>
          </Box>

          <Box gridColumn={{ base: 'span 1', lg: 'span 2' }}>
            <Box bg={colors.surface.bg} rounded="lg" p={4} borderWidth={1} borderColor={colors.surface.border}>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="lg">Generated Playwright Report</Heading>
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
                    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                      <Box>
                        <Text fontSize="sm" color={colors.total.label}>
                          Total
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          {generatedReport.stats.total}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={colors.passed.label}>
                          Passed
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color={colors.passed.text}>
                          {generatedReport.stats.passed}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={colors.failed.label}>
                          Failed
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color={colors.failed.text}>
                          {generatedReport.stats.failed}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={colors.timedOut.label}>
                          Timed Out
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color={colors.timedOut.text}>
                          {generatedReport.stats.timedOut}
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

                  <Box
                    bg={colors.nestedSurface.bg}
                    borderWidth={1}
                    borderColor={colors.nestedSurface.border}
                    rounded="md"
                    p={4}
                  >
                    <Text fontWeight="medium" mb={2}>
                      Report Details
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
                </VStack>
              ) : (
                <Box textAlign="center" py={12} color="gray.500">
                  <Text>Click "Generate Report" to create a Playwright test report</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};
