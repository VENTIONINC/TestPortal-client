// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  generatedApi,
  type CreateTestScenarioRequest,
  type DeleteApiV2TestScenariosByScenarioIdApiArg,
  type DeleteApiV2TestScenariosByScenarioIdApiResponse,
  type GetApiV2TestScenariosByScenarioIdApiArg,
  type GetApiV2TestScenariosByScenarioIdApiResponse,
  type GetApiV2TestScenariosApiArg,
  type PatchApiV2TestScenariosByScenarioIdApiArg,
  type PatchApiV2TestScenariosByScenarioIdApiResponse,
  type PostApiV2TestScenariosApiArg,
  type PostApiV2TestScenariosApiResponse,
  type TestScenario,
  type TestScenarioCreatorSummary,
  type TestScenarioListResponse,
  type TestScenarioSummary,
  type UpdateTestScenarioRequest,
} from '@/redux/apis/generatedApi';
import { store } from '@/redux/store';

afterEach(() => {
  vi.restoreAllMocks();
  store.dispatch(generatedApi.util.resetApiState());
});

const creator: TestScenarioCreatorSummary = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
};

const scenario: TestScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  contentMd: '# Checkout flow',
  details: 'Scenario details',
  objective: 'Complete checkout',
  preconditions: 'Signed in',
  testData: null,
  expectedResult: 'Order exists',
  notes: null,
  steps: [],
  contentMdHash: 'hash-1',
  contentMdFormatVersion: 1,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

const summary: TestScenarioSummary = {
  id: scenario.id,
  projectId: scenario.projectId,
  createdById: scenario.createdById,
  title: scenario.title,
  details: scenario.details,
  createdBy: creator,
  createdAt: scenario.createdAt,
  updatedAt: scenario.updatedAt,
};

const listArgs: GetApiV2TestScenariosApiArg = {
  projectId: 'project-1',
  page: 2,
  limit: 30,
};

const listResponse: TestScenarioListResponse = {
  scenarios: [summary],
  total: 31,
  page: 2,
  limit: 30,
  totalPages: 2,
};

describe('generated Test Scenario list contract', () => {
  it('exposes scenario fields and pagination metadata at compile time', () => {
    expectTypeOf(listArgs).toEqualTypeOf<GetApiV2TestScenariosApiArg>();
    expectTypeOf(listResponse).toEqualTypeOf<TestScenarioListResponse>();
    expectTypeOf<TestScenarioListResponse['scenarios'][number]>().toEqualTypeOf<TestScenarioSummary>();
    expectTypeOf(scenario.details).toEqualTypeOf<string | null>();
    expect(scenario).toMatchObject({
      id: expect.any(String),
      projectId: expect.any(String),
      createdById: expect.any(String),
      title: expect.any(String),
      contentMd: expect.any(String),
      details: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(listResponse.scenarios[0]).toEqual(summary);
    expect(listResponse.scenarios[0]).not.toHaveProperty('contentMd');
    expect(listResponse.scenarios[0].createdBy).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(listResponse).toMatchObject({
      scenarios: [summary],
      total: 31,
      page: 2,
      limit: 30,
      totalPages: 2,
    });
    expect(listArgs).toEqual({ projectId: 'project-1', page: 2, limit: 30 });
  });
});

describe('generated Test Scenario CRUD contract', () => {
  const createArgs: PostApiV2TestScenariosApiArg = {
    createTestScenarioRequest: {
      projectId: 'project-1',
      title: 'Checkout flow',
      details: 'Scenario details',
      objective: 'Complete checkout',
    } satisfies CreateTestScenarioRequest,
  };
  const detailArgs: GetApiV2TestScenariosByScenarioIdApiArg = {
    scenarioId: 'scenario-1',
    projectId: 'project-1',
  };
  const patchArgs: PatchApiV2TestScenariosByScenarioIdApiArg = {
    ...detailArgs,
    updateTestScenarioRequest: {
      objective: 'Updated objective',
    } satisfies UpdateTestScenarioRequest,
  };
  const deleteArgs: DeleteApiV2TestScenariosByScenarioIdApiArg = detailArgs;

  it('exposes exact create, detail, partial PATCH, and delete argument/response types', () => {
    expectTypeOf(createArgs).toEqualTypeOf<PostApiV2TestScenariosApiArg>();
    expectTypeOf(detailArgs).toEqualTypeOf<GetApiV2TestScenariosByScenarioIdApiArg>();
    expectTypeOf(patchArgs).toEqualTypeOf<PatchApiV2TestScenariosByScenarioIdApiArg>();
    expectTypeOf(deleteArgs).toEqualTypeOf<DeleteApiV2TestScenariosByScenarioIdApiArg>();
    expectTypeOf<PostApiV2TestScenariosApiResponse>().toEqualTypeOf<TestScenario>();
    expectTypeOf<GetApiV2TestScenariosByScenarioIdApiResponse>().toEqualTypeOf<TestScenario>();
    expectTypeOf<PatchApiV2TestScenariosByScenarioIdApiResponse>().toEqualTypeOf<TestScenario>();
    expectTypeOf<DeleteApiV2TestScenariosByScenarioIdApiResponse>().toEqualTypeOf<unknown>();
  });
});

describe('generated Test Scenario cache behavior', () => {
  it('refetches the project-scoped catalog after create, update, clear, and delete', async () => {
    let catalogRequests = 0;
    let deleted = false;
    let persistedScenario = scenario;
    let persistedSummary = summary;
    const postBodies: unknown[] = [];
    const patchBodies: unknown[] = [];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;
      const path = new URL(request.url).pathname;

      if (request.method === 'GET' && path === '/api/v2/test-scenarios') {
        catalogRequests += 1;
        const scenarios = deleted ? [] : [persistedSummary];

        return new Response(
          JSON.stringify({
            scenarios,
            total: scenarios.length,
            page: 1,
            limit: 10,
            totalPages: scenarios.length ? 1 : 0,
          }),
          { headers: { 'content-type': 'application/json' } },
        );
      }

      if (request.method === 'POST') {
        const body = (await request.clone().json()) as { details?: string };
        postBodies.push(body);
        persistedScenario = { ...scenario, details: body.details ?? null };
        persistedSummary = { ...summary, details: persistedScenario.details };

        return new Response(JSON.stringify(persistedScenario), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      }

      if (request.method === 'PATCH') {
        const body = (await request.clone().json()) as Partial<TestScenario>;
        patchBodies.push(body);
        persistedScenario = { ...persistedScenario, ...body };
        persistedSummary = {
          ...persistedSummary,
          title: persistedScenario.title,
          details: persistedScenario.details,
          updatedAt: persistedScenario.updatedAt,
        };

        return new Response(JSON.stringify(persistedScenario), {
          headers: { 'content-type': 'application/json' },
        });
      }

      if (request.method === 'DELETE') {
        deleted = true;
        return new Response(JSON.stringify({}), {
          headers: { 'content-type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({}), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const catalogArgs = { projectId: 'project-1', page: 1, limit: 10 };
    const subscription = store.dispatch(generatedApi.endpoints.getApiV2TestScenarios.initiate(catalogArgs));
    await subscription;
    expect(catalogRequests).toBe(1);

    await store
      .dispatch(
        generatedApi.endpoints.postApiV2TestScenarios.initiate({
          createTestScenarioRequest: {
            projectId: 'project-1',
            title: scenario.title,
            details: 'Created details',
          },
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(catalogRequests).toBe(2));
    expect(postBodies).toEqual([
      {
        projectId: 'project-1',
        title: scenario.title,
        details: 'Created details',
      },
    ]);
    await vi.waitFor(() =>
      expect(
        generatedApi.endpoints.getApiV2TestScenarios.select(catalogArgs)(store.getState()).data?.scenarios[0].details,
      ).toBe('Created details'),
    );

    await store
      .dispatch(
        generatedApi.endpoints.patchApiV2TestScenariosByScenarioId.initiate({
          scenarioId: 'scenario-1',
          projectId: 'project-1',
          updateTestScenarioRequest: { details: 'Updated details' },
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(catalogRequests).toBe(3));
    expect(patchBodies).toEqual([{ details: 'Updated details' }]);
    await vi.waitFor(() =>
      expect(
        generatedApi.endpoints.getApiV2TestScenarios.select(catalogArgs)(store.getState()).data?.scenarios[0].details,
      ).toBe('Updated details'),
    );

    await store
      .dispatch(
        generatedApi.endpoints.patchApiV2TestScenariosByScenarioId.initiate({
          scenarioId: 'scenario-1',
          projectId: 'project-1',
          updateTestScenarioRequest: { title: 'Updated checkout flow', objective: 'Updated objective' },
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(catalogRequests).toBe(4));
    expect(patchBodies).toEqual([
      { details: 'Updated details' },
      { title: 'Updated checkout flow', objective: 'Updated objective' },
    ]);
    await vi.waitFor(() =>
      expect(
        generatedApi.endpoints.getApiV2TestScenarios.select(catalogArgs)(store.getState()).data?.scenarios[0],
      ).toMatchObject({
        title: 'Updated checkout flow',
        details: 'Updated details',
      }),
    );

    await store
      .dispatch(
        generatedApi.endpoints.patchApiV2TestScenariosByScenarioId.initiate({
          scenarioId: 'scenario-1',
          projectId: 'project-1',
          updateTestScenarioRequest: { details: null },
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(catalogRequests).toBe(5));
    expect(patchBodies).toEqual([
      { details: 'Updated details' },
      { title: 'Updated checkout flow', objective: 'Updated objective' },
      { details: null },
    ]);
    await vi.waitFor(() =>
      expect(
        generatedApi.endpoints.getApiV2TestScenarios.select(catalogArgs)(store.getState()).data?.scenarios[0].details,
      ).toBeNull(),
    );

    await store
      .dispatch(
        generatedApi.endpoints.deleteApiV2TestScenariosByScenarioId.initiate({
          scenarioId: 'scenario-1',
          projectId: 'project-1',
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(catalogRequests).toBe(6));

    await vi.waitFor(() => {
      const cachedCatalog = generatedApi.endpoints.getApiV2TestScenarios.select(catalogArgs)(store.getState()).data;
      expect(cachedCatalog?.scenarios).toEqual([]);
    });
    expect(fetchMock).toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
