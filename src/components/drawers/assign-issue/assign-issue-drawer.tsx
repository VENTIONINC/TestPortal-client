import { useState, useEffect, useCallback } from 'react';
import { VStack } from '@chakra-ui/react';

import { Drawer, DrawerBody, DrawerProps } from '@/components/ui';
import { Issue } from '@/types';

interface IssueDrawerProps extends Omit<DrawerProps, 'children'> {
  onSubmit: (issue: Issue) => void;
}

export const AssignIssueDrawer = ({ onSubmit, ...props }: IssueDrawerProps) => {
  const [issue, setIssue] = useState<Issue>({
    name: '',
    category: '',
    description: '',
    portal: '',
    service: '',
    ticket: '',
  } as Issue);
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);

  const loadIssues = useCallback(async () => {
    if (!issue.name.trim()) return;

    const queryParams = new URLSearchParams({
      name: issue.name,
      category: issue.category,
      description: issue.description,
      portal: issue.portal,
      service: issue.service,
      ticket: issue.ticket,
      limit: '10',
    });

    try {
      const res = await fetch(`http://localhost:3001/api/issues?${queryParams}`);
      const data = await res.json();
      setExistingIssues(data.issues);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load issues:', error);
    }
  }, [issue.category, issue.description, issue.name, issue.portal, issue.service, issue.ticket]);

  const handleIssueNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssue({ ...issue, name: e.target.value });
  };

  const handleIssueSelected = (selectedIssue: Issue) => {
    setIssue(selectedIssue);
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadIssues, 300);
    return () => clearTimeout(timeoutId);
  }, [loadIssues]);

  return (
    <Drawer {...props}>
      <DrawerBody>
        <VStack align="flex-start" gap={0}>
          <label>Issue Name</label>
          <input type="text" value={issue.name} onChange={handleIssueNameChange} placeholder="Search for issues..." />
          {issue.name && existingIssues.length > 0 && (
            <ul className="suggestions">
              {existingIssues.map((suggestion, index) => (
                <li key={suggestion.id || index} onClick={() => handleIssueSelected(suggestion)}>
                  <strong>{suggestion.name}</strong>
                </li>
              ))}
            </ul>
          )}
        </VStack>

        <div className="form-group">
          <label>Category:</label>
          <select
            value={issue.category}
            onChange={(e) => setIssue({ ...issue, category: e.target.value })}
            className="select"
          >
            <option value="" disabled>
              Select category
            </option>
            <option value="Bug">Bug</option>
            <option value="Script">Script</option>
            <option value="Infra">Infra</option>
            <option value="Performance">Performance</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            value={issue.description}
            onChange={(e) => setIssue({ ...issue, description: e.target.value })}
            placeholder="Issue description"
            className="input"
          />
        </div>

        <div className="button-group">
          <button className="button primary" onClick={() => onSubmit(issue)}>
            Submit
          </button>
          {/* <button className="button secondary" onClick={onClose}>
              Cancel
            </button> */}
        </div>
      </DrawerBody>
    </Drawer>
  );
};
