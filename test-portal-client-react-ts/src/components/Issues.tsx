import React, { useState } from "react";
import { Button, Heading, HStack, Mark, Text, VStack } from "@chakra-ui/react";

import { useIssueFilters } from "@/hooks/useIssueFilters";
import { useIssuesQuery } from "@/hooks/useIssuesQuery";

export const Issues = () => {
  const { filters, updateFilters } = useIssueFilters();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const { data } = useIssuesQuery(filters);

  const applyFilters = (updatedFilters: Partial<typeof filters>) => {
    updateFilters({ ...updatedFilters, page: 1 });
  };

  const nextPage = () => {
    if (data && filters.page < data.totalPages) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  const prevPage = () => {
    if (data && filters.page > 1) {
      updateFilters({ page: filters.page - 1 });
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <HStack align="flex-start">
      <aside
        className="sidebar"
        style={{ width: sidebarExpanded ? "300px" : "0px" }}
      >
        {sidebarExpanded && (
          <>
            {/* Spec Filters Group */}
            <div className="filter-group">
              <h3>Spec Filters</h3>
              <label>
                Tags:
                <input
                  type="text"
                  value={filters.tag || ""}
                  onChange={(e) => applyFilters({ tag: e.target.value })}
                />
              </label>
              <label>
                Spec ID:
                <input
                  type="number"
                  value={filters.specId || ""}
                  onChange={(e) =>
                    applyFilters({
                      specId: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <label>
                Spec File:
                <input
                  type="text"
                  value={filters.specFile || ""}
                  onChange={(e) => applyFilters({ specFile: e.target.value })}
                />
              </label>
              <label>
                Spec Name:
                <input
                  type="text"
                  value={filters.specName || ""}
                  onChange={(e) => applyFilters({ specName: e.target.value })}
                />
              </label>
            </div>

            {/* Execution Filters Group */}
            <div className="filter-group">
              <h3>Execution Filters</h3>
              <label>
                Environment:
                <input
                  type="text"
                  value={filters.environment || ""}
                  onChange={(e) =>
                    applyFilters({ environment: e.target.value })
                  }
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={filters.type || ""}
                  onChange={(e) => applyFilters({ type: e.target.value })}
                />
              </label>
            </div>

            {/* Issue Filters Group */}
            <div className="filter-group">
              <h3>Issue Filters</h3>
              <label>
                Category:
                <select
                  value={filters.category || ""}
                  onChange={(e) => applyFilters({ category: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="Bug">Bug</option>
                  <option value="Improvement">Improvement</option>
                  <option value="Task">Task</option>
                </select>
              </label>

              <label>
                Name:
                <input
                  type="text"
                  value={filters.name || ""}
                  onChange={(e) => applyFilters({ name: e.target.value })}
                />
              </label>

              <label>
                From:
                <input
                  type="date"
                  value={filters.fromDate || ""}
                  onChange={(e) => applyFilters({ fromDate: e.target.value })}
                />
              </label>

              <label>
                To:
                <input
                  type="date"
                  value={filters.toDate || ""}
                  onChange={(e) => applyFilters({ toDate: e.target.value })}
                />
              </label>
            </div>
          </>
        )}
      </aside>

      <VStack flex={1} align="flex-start">
        <Heading textStyle="3xl">Issues</Heading>
        <VStack flex={1} align="flex-start" w="100%">
          {data && data?.issues?.length > 0 ? (
            data.issues.map((issue, index) => (
              <VStack
                key={index}
                align="flex-start"
                w="100%"
                bg="gray.100"
                border="1px solid"
                borderColor="gray.400"
                borderRadius="md"
                p={4}
              >
                <Text fontWeight={600}>{issue.name}</Text>
                <Text>
                  <Mark fontWeight={600}>Category:</Mark> {issue.category}
                </Text>
                <Text>
                  <Mark fontWeight={600}>Description:</Mark> {issue.description}
                </Text>
                <Text>
                  <Mark fontWeight={600}>Created At:</Mark>{" "}
                  {new Date(issue.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            ))
          ) : (
            <Text>No issues found.</Text>
          )}
        </VStack>

        {data && data.totalPages > 1 && (
          <HStack alignSelf="center">
            <Button
              variant="ghost"
              onClick={prevPage}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <Text>
              Page {filters.page} of {data.totalPages}
            </Text>
            <Button
              variant="ghost"
              onClick={nextPage}
              disabled={filters.page === data.totalPages}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>

      <button className="toggle-btn" onClick={toggleSidebar}>
        {sidebarExpanded ? "« Hide Filters" : "» Show Filters"}
      </button>
    </HStack>
  );
};
