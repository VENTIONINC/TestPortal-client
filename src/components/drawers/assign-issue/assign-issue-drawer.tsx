import { useState, useEffect, useCallback } from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Drawer, DrawerBody, DrawerProps, Input, NativeSelect } from '@/components/ui';
import { useLazyGetIssuesQuery } from '@/redux/apis/issuesApi';
import { Issue, IssueCategory } from '@/types';

interface IssueDrawerProps extends Omit<DrawerProps, 'children'> {
  onSubmit: (issue: Issue) => void;
}

export const AssignIssueDrawer = ({ onSubmit, ...props }: IssueDrawerProps) => {
  const [issue, setIssue] = useState<Issue>({
    name: '',
    category: '' as IssueCategory,
    description: '',
    portal: '',
    service: '',
    ticket: '',
  } as Issue);
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);

  const [getIssues] = useLazyGetIssuesQuery();

  const loadIssues = useCallback(async () => {
    if (!issue.name.trim()) return;

    try {
      const res = await getIssues({ name: issue.name, category: issue.category }).unwrap();
      setExistingIssues(res.issues);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load issues:', error);
    }
  }, [getIssues, issue.category, issue.name]);

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
      <DrawerBody display="flex" flexDir="column" gap={4}>
        <VStack align="flex-start" gap={0}>
          <Input
            label="Issue Name"
            name="name"
            placeholder="Search for issues..."
            value={issue.name}
            onChange={handleIssueNameChange}
          />
          {issue.name && existingIssues.length > 0 && (
            <VStack align="stretch" bg="gray.100" borderRadius="sm">
              {existingIssues.map((suggestion, index) => (
                <Text
                  key={suggestion.id || index}
                  onClick={() => handleIssueSelected(suggestion)}
                  px={2}
                  fontWeight={600}
                  cursor="pointer"
                  _hover={{ bg: 'gray.200' }}
                >
                  {suggestion.name}
                </Text>
              ))}
            </VStack>
          )}
        </VStack>

        <NativeSelect
          label="Category:"
          name="category"
          placeholder="Select Category"
          value={issue.category}
          onChange={(e) => setIssue({ ...issue, category: e.target.value as IssueCategory })}
          items={[
            { value: IssueCategory.Bug, label: 'Bug' },
            { value: IssueCategory.Script, label: 'Script' },
            { value: IssueCategory.Infra, label: 'Infra' },
            { value: IssueCategory.Performance, label: 'Performance' },
          ]}
        />
        <Input
          label="Description:"
          name="description"
          value={issue.description}
          onChange={(e) => setIssue({ ...issue, description: e.target.value })}
        />

        <Button onClick={() => onSubmit(issue)} variant="ghost">
          Submit
        </Button>
      </DrawerBody>
    </Drawer>
  );
};
