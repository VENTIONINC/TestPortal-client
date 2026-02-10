import { ChakraProvider as Provider } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

import { system } from '../../theme';

export const ChakraProvider = ({ children }: PropsWithChildren) => {
  return <Provider value={system}>{children}</Provider>;
};
