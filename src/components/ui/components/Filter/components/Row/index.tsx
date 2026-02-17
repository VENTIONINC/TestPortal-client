import { Box, StackProps } from '@chakra-ui/react';

interface FiltersRowProps extends StackProps {
  children: React.ReactNode;
}

export const FiltersRow = ({ children }: FiltersRowProps) => {
  return <Box mb="15px">{children}</Box>;
};
