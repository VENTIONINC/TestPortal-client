// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@chakra-ui/react';

import { getMonitoringLink } from './helpers';

interface IntegrationLinksProps {
  reportPortalUrl: string;
  monitoringUrl: string;
  startTime: string;
  duration: number;
  environment: string;
  reportPortalEnabled: boolean;
  monitoringPortalEnabled: boolean;
}

export const IntegrationLinks = ({
  reportPortalUrl,
  monitoringUrl,
  startTime,
  duration,
  environment,
  reportPortalEnabled,
  monitoringPortalEnabled,
  //
}: IntegrationLinksProps) => {
  const monitoringLink = getMonitoringLink({
    startTime,
    duration,
    env: environment,
    url: monitoringUrl,
  });

  return (
    <>
      {reportPortalEnabled && (
        <Link href={reportPortalUrl} target="_blank" rel="noopener noreferrer" color="blue.600">
          Report
        </Link>
      )}
      {monitoringPortalEnabled && (
        <Link href={monitoringLink} target="_blank" rel="noopener noreferrer" color="blue.600">
          Monitoring
        </Link>
      )}
    </>
  );
};
