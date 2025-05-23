import { useState } from "react";
import { HStack, Text } from "@chakra-ui/react";
import { LuCheck, LuCirclePlus, LuTrash } from "react-icons/lu";

import { AssignIssueDrawer } from "./drawers";
import { Assumption, Issue, ResultError } from "../utils/models";

interface InlineIssueProps {
  resultError: ResultError;
  assumptions: Assumption[];
}

export const InlineIssue = ({ resultError, assumptions }: InlineIssueProps) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const confirm = async (assumption: Assumption, isConfirmed: boolean) => {
    const response = await fetch(
      `http://localhost:3001/api/assumptions/${assumption.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          madeBy: "user",
          isConfirmed: isConfirmed,
        }),
      }
    );

    if (response.status === 204) {
      // Handle assumption being null in Svelte
      // In React, we would typically update state here
      // We could filter it out of the assumptions array or update it
    }

    if (response.status === 200) {
      await response.json();
    }
  };

  const createAssumption = async (issue: Issue) => {
    if (!issue) {
      throw new Error("Unable to create assumption with no linked issue");
    }

    if (!issue.id) {
      const issueResponse = await fetch(`http://localhost:3001/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issue),
      });

      if (!issueResponse.ok) {
        throw new Error(`Cant post new issue ${issueResponse.status}`);
      }

      issue = await issueResponse.json();
    }

    const assumptionResponse = await fetch(
      "http://localhost:3001/api/assumptions",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          madeBy: "user",
          score: 1,
          isConfirmed: true,
          issueId: issue.id,
          resultErrorId: resultError.id,
        }),
      }
    );

    if (!assumptionResponse.ok) {
      throw new Error(
        `Cant post new assumption ${assumptionResponse.statusText}`
      );
    }

    const assumptionRecord = await assumptionResponse.json();

    if (assumptionRecord) {
      assumptionRecord.issue = new Issue(issue);

      toggleSidebar();
    } else {
      console.error("Failed to assign issue");
    }
  };

  return (
    <>
      {assumptions && assumptions.length ? (
        assumptions.map((assumption, index) => (
          <HStack
            key={index}
            border="1px dashed"
            borderColor="green.500"
            borderRadius="md"
            ml="auto"
            px={2}
          >
            {assumption && assumption.issue && (
              <Text textStyle="sm">{assumption.issue.name}</Text>
            )}

            {assumption && !assumption.isConfirmed ? (
              <>
                <Text>{Math.round(assumption.score * 100)}%</Text>
                <LuCheck
                  color="green"
                  size={32}
                  onClick={() => confirm(assumption, true)}
                  style={{ cursor: "pointer" }}
                />
                <LuTrash
                  color="red"
                  size={32}
                  onClick={() => confirm(assumption, false)}
                  style={{ cursor: "pointer" }}
                />
              </>
            ) : (
              <></>
              //   <button className="edit-issue" onClick={toggleSidebar} />
            )}
          </HStack>
        ))
      ) : (
        <>
          <LuCirclePlus
            size={20}
            onClick={toggleSidebar}
            style={{ marginInlineStart: "auto", cursor: "pointer" }}
          />
          <AssignIssueDrawer
            open={showSidebar}
            onOpenChange={toggleSidebar}
            title={`Assign Issue to Result ${resultError.id}`}
            onSubmit={createAssumption}
            lazyMount
          />
        </>
      )}
    </>
  );
};
