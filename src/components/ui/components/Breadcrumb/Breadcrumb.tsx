import { Breadcrumb as ChakraBreadcrumb, Box, type SystemStyleObject } from '@chakra-ui/react';
import * as React from 'react';
import { useLocation, Link as RouterLink } from 'react-router';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { routerConfig } from './config';

export interface BreadcrumbProps extends ChakraBreadcrumb.RootProps {
  separator?: React.ReactNode;
  separatorGap?: SystemStyleObject['gap'];
}

const BreadcrumbSeparator = () => {
  const { text } = useSurfaceColors();

  return (
    <Box as="svg" width="6px" height="10px" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 9L5 5L1 1" stroke={text.primary} strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
};

export const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(function BreadcrumbRoot(props, ref) {
  const { separator = <BreadcrumbSeparator />, separatorGap, ...rest } = props;
  const location = useLocation();
  const currentRoute = (routerConfig as Record<string, Array<{ title: React.ReactNode; url?: string }>>)[
    location.pathname
  ];

  const { text } = useSurfaceColors();

  return (
    <ChakraBreadcrumb.Root ref={ref} {...rest}>
      <ChakraBreadcrumb.List gap={separatorGap}>
        {currentRoute?.map(({ title, url }, index) => {
          const last = index === currentRoute.length - 1;
          return (
            <React.Fragment key={index}>
              <ChakraBreadcrumb.Item>
                {last ? (
                  <ChakraBreadcrumb.CurrentLink color={text.primary} fontWeight="normal">
                    {title}
                  </ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link asChild color={text.secondary} fontWeight="normal">
                    <RouterLink to={url || '#'}>{title}</RouterLink>
                  </ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {!last && <ChakraBreadcrumb.Separator>{separator}</ChakraBreadcrumb.Separator>}
            </React.Fragment>
          );
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  );
});
