import { Box, Text } from '@chakra-ui/react';

import { parseFileLocation, openInVSCode } from '@/utils';

interface FileLocationProps {
  locationText: string;
  children?: React.ReactNode;
}

export const FileLocation = ({ locationText, children }: FileLocationProps) => {
  const parsedLocation = parseFileLocation(locationText);

  if (!parsedLocation) {
    return <Text>{children || locationText}</Text>;
  }

  const handleClick = () => {
    openInVSCode(parsedLocation.filePath, parsedLocation.line, parsedLocation.column);
  };

  return (
    <Box
      as="button"
      color="blue.400"
      textDecoration="underline"
      cursor="pointer"
      _hover={{
        color: 'blue.300',
        backgroundColor: 'blue.900',
        textDecoration: 'none',
      }}
      onClick={handleClick}
      display="block"
      flexDirection="column"
      background="none"
      border="none"
      padding="0"
      margin="0"
      font="inherit"
      textAlign="left"
      borderRadius="2px"
      alignItems="flex-start"
    >
      {children || locationText}
    </Box>
  );
};
