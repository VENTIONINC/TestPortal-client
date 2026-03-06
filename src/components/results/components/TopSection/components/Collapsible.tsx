import { Collapsible, Flex, Text } from '@chakra-ui/react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { type Dispatch, type SetStateAction } from 'react';

import { List } from './List';

interface CollapsibleWrapperProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  title: string;
  results: { title: string; count: number }[];
  handleClickToResult: (message: string) => void;
}

export const CollapsibleWrapper = ({
  setIsOpen,
  isOpen,
  title,
  results,
  handleClickToResult,
}: CollapsibleWrapperProps) => (
  <Collapsible.Root bg="bg.cardSecondary" onOpenChange={() => setIsOpen(!isOpen)}>
    <Collapsible.Trigger asChild>
      <Flex align="center" minH="27px" pl="2px">
        {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
        <Text fontWeight={500} cursor="pointer" whiteSpace="nowrap" pl="9px" fontSize="lg">
          {title}
        </Text>
      </Flex>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <List results={results} label="errors" onClick={handleClickToResult} />
    </Collapsible.Content>
  </Collapsible.Root>
);
