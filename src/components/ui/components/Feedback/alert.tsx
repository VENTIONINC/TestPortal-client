import { Alert as ChakraAlert, AlertRootProps, Box } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

const Root = forwardRef<HTMLDivElement, AlertRootProps>(function AlertRoot(props, ref) {
  const { alerts, backgroundColor } = useSurfaceColors();
  const status = (props.status as keyof typeof alerts) || 'info';
  const style = alerts[status] || alerts.info;

  // Handle mixed usage of border property (color vs css shorthand)
  //   const isShorthandBorder = style.border?.includes(' ');
  //   const borderProps = isShorthandBorder
  //     ? { border: style.border, borderColor: style.borderColor || style.border }
  //     : { borderWidth: '1px', borderColor: style.border };

  return (
    <Box borderRadius="12px" p="15px" bg={backgroundColor.primary}>
      <ChakraAlert.Root ref={ref} {...props} bg={style.bg} color={style.text}>
        {props.children}
      </ChakraAlert.Root>
    </Box>
  );
});

export const Alert = {
  Root,
  Indicator: ChakraAlert.Indicator,
  Content: ChakraAlert.Content,
  Title: ChakraAlert.Title,
  Description: ChakraAlert.Description,
};
