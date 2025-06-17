import { useState } from 'react';
import { Flex, HStack } from '@chakra-ui/react';

import { IssuesList } from '@/components/issues';
import { ResultsList } from '@/components/results/';

enum ACTIVE_TAB {
  Results = 'results',
  Issues = 'issues',
}

function App() {
  const [activeTab, setActiveTab] = useState<ACTIVE_TAB>(ACTIVE_TAB.Results);

  const switchTab = (tab: ACTIVE_TAB) => {
    setActiveTab(tab);
  };

  return (
    <>
      <HStack>
        {Object.values(ACTIVE_TAB).map((tab) => (
          <Flex
            key={tab}
            onClick={() => switchTab(tab)}
            flex={1}
            justify="center"
            textTransform="capitalize"
            p={2.5}
            fontWeight={700}
            cursor="pointer"
            borderBottom="2px solid transparent"
            {...(activeTab === tab && {
              color: 'blue.500',
              borderColor: 'blue.500',
            })}
          >
            {tab}
          </Flex>
        ))}
      </HStack>

      <Flex p={4}>
        {activeTab === ACTIVE_TAB.Results && <ResultsList />}
        {activeTab === ACTIVE_TAB.Issues && <IssuesList />}
      </Flex>
    </>
  );
}

export default App;
