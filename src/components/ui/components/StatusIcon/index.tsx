import { Flex } from '@chakra-ui/react';

import { ResultStatus } from '@/types';
import { getResultStatusStyle } from '@/utils';

interface StatusIconProps {
  status: ResultStatus;
  type?: 'circle' | 'square' | '';
}

export const StatusIcon = ({ status, type }: StatusIconProps) => {
  const { color, Icon, title } = getResultStatusStyle(status as ResultStatus);

  return (
    <Flex
      color={color}
      border="1px solid"
      borderColor={type === 'circle' ? color : 'transparent'}
      borderRadius={type === 'circle' ? 'full' : 'xs'}
      p="2px"
    >
      <Icon title={title} size={9} />
    </Flex>
  );
};
