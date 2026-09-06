// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TestScenariosPage } from '@/pages/TestScenarios';

vi.mock('@/components/ui/components/Templates/MainTemplate', () => ({
  MainTemplate: ({ children, pageHeader }: { children: React.ReactNode; pageHeader: string }) => (
    <main>
      <h1>{pageHeader}</h1>
      {children}
    </main>
  ),
}));

vi.mock('@/components/test-scenarios', () => ({
  TestScenarioCatalog: () => <div>Test Scenario catalog</div>,
}));

describe('TestScenariosPage', () => {
  it('renders the catalog under the Test Scenarios heading', () => {
    render(<TestScenariosPage />);

    expect(screen.getByRole('heading', { name: 'Test Scenarios' })).toBeInTheDocument();
    expect(screen.getByText('Test Scenario catalog')).toBeInTheDocument();
  });
});
