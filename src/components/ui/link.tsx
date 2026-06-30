// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

export const Link = ({ href, children, ...props }: ChakraLinkProps) => {
  return (
    <ChakraLink asChild {...props}>
      <RouterLink to={href!}>{children}</RouterLink>
    </ChakraLink>
  );
};
