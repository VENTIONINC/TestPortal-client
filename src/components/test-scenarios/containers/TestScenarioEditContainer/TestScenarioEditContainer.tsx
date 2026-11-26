// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario } from '@/redux/apis/generatedApi';

import { SavedScenarioCardTags } from '../../components/ScenarioCardTags';
import { TestScenarioDetailStateView, TestScenarioForm } from '../../components';
import { ScenarioDraftNavigationGuard } from '../../components/ScenarioDraftNavigationGuard';
import { useTestScenarioEdit } from './hooks/useTestScenarioEdit';
import { useTestScenarioEditNavigation } from './hooks/useTestScenarioEditNavigation';

export interface TestScenarioEditContainerProps {
  projectId: string;
  scenarioId: string;
}

const toStepDrafts = (scenario: TestScenario) =>
  scenario.steps.map((step) => ({
    key: step.id,
    id: step.id,
    action: step.action,
    expectedResult: step.expectedResult ?? '',
  }));

const ScopedScenarioEditContainer = ({ projectId, scenarioId }: TestScenarioEditContainerProps) => {
  const navigation = useTestScenarioEditNavigation(projectId, scenarioId);
  const edit = useTestScenarioEdit(projectId, scenarioId, navigation.navigateAfterSave);
  const breadcrumb = navigation.getBreadcrumb(edit.scenario?.folderId);

  return (
    <>
      <ScenarioDraftNavigationGuard dirty={edit.hasUnsavedChanges} allowNavigation={edit.allowNavigation} />
      <TestScenarioDetailStateView
        scenario={edit.scenario}
        isLoading={edit.isLoading}
        isUnavailable={edit.isUnavailable}
        isError={edit.isError}
        onRetry={() => void edit.retry()}
        onBack={() => navigation.navigateBack(edit.scenario?.folderId)}
      >
        {(scenario) => (
          <TestScenarioForm
            key={`${projectId}:${scenarioId}`}
            mode="edit"
            initialValues={scenario}
            history={scenario}
            {...breadcrumb}
            initialSteps={toStepDrafts(scenario)}
            tagField={
              <SavedScenarioCardTags
                projectId={projectId}
                scenarioId={scenarioId}
                tags={edit.tags}
                disabled={edit.isSubmitting}
                onAssigned={edit.onTagsAssigned}
              />
            }
            initialSuites={scenario.suites ?? []}
            suites={navigation.suites}
            folders={navigation.folders}
            initialFolderId={scenario.folderId}
            reconciliation={edit.reconciliation}
            isSubmitting={edit.isSubmitting}
            apiError={edit.apiError}
            successMessage={edit.successMessage}
            onDirtyChange={edit.setDirty}
            onReload={() => void edit.reloadScenario()}
            onSubmit={edit.handleSubmit}
            onCancel={navigation.cancelEdit}
          />
        )}
      </TestScenarioDetailStateView>
    </>
  );
};

export const TestScenarioEditContainer = (props: TestScenarioEditContainerProps) => (
  <ScopedScenarioEditContainer key={`${props.projectId}:${props.scenarioId}`} {...props} />
);
