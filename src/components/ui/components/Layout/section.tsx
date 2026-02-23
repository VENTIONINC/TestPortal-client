import { Box } from '@chakra-ui/react';

const Root = ({ children }: { children: React.ReactNode }) => (
  <Box bg="bg.section" p="16px 15px 15px 17px" borderRadius="md">
    {children}
  </Box>
);

const Head = ({ children }: { children: React.ReactNode }) => (
  <Box as="h2" fontSize="lg" mb={4}>
    {children}
  </Box>
);
const Description = ({ children }: { children: React.ReactNode }) => (
  <Box fontSize="sm" color="text.muted" mb={4}>
    {children}
  </Box>
);
const Body = ({ children }: { children: React.ReactNode }) => <Box>{children}</Box>;
const Footer = ({ children }: { children: React.ReactNode }) => <Box mt={6}>{children}</Box>;
const Card = ({ children, p }: { children: React.ReactNode; p?: string | number }) => (
  <Box bg="bg.cardSecondary" borderRadius="md" border="1px" borderColor="borders.subtle" p={p || 4} w="100%">
    {children}
  </Box>
);

export const Section = ({
  title,
  children,
  footer,
  description,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  return (
    <Root>
      <Head>{title}</Head>
      <Description>{description}</Description>
      <Body>{children}</Body>
      {footer && <Footer>{footer}</Footer>}
    </Root>
  );
};

Section.Root = Root;
Section.Body = Body;
Section.Head = Head;
Section.Description = Description;
Section.Card = Card;
Section.Footer = Footer;
