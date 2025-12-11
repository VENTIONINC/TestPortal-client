import { Box, Button, Flex, HStack, Image } from '@chakra-ui/react';
import { useLocation } from 'react-router';
import { LuUpload } from 'react-icons/lu';

import { Link } from '@/components/ui';
import { UserMenu } from '@/components/UserMenu';
import { ProjectSelect } from '@/components/ProjectSelect';
import { useResultsFileUploadDialog } from '@/components/dialogs';
import { PATHS } from '@/types/paths';

const NAVIGATION_LINKS = [
  { label: 'Results', path: PATHS.RESULTS },
  { label: 'Issues', path: PATHS.ISSUES },
  { label: 'Prompts', path: PATHS.PROMPTS },
];

export const AppHeader = () => {
  const location = useLocation();
  const openUploadDialog = useResultsFileUploadDialog();

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" px={6} py={4}>
        <HStack gap={8}>
          <Link href={PATHS.ROOT} textStyle="lg" fontWeight="bold" color="blue.600">
            <Image src="image.png" alt="TestPortal Logo" height="10" />
          </Link>

          <HStack gap={4}>
            {NAVIGATION_LINKS.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  color={isActive ? 'blue.500' : 'gray.600'}
                  fontWeight={isActive ? 700 : 500}
                >
                  {link.label}
                </Link>
              );
            })}
          </HStack>
        </HStack>

        <Flex align="center" gap={4}>
          <ProjectSelect />
          <Button variant="outline" size="sm" onClick={openUploadDialog} colorScheme="blue">
            <LuUpload size={16} />
            Upload
          </Button>
          <UserMenu />
        </Flex>
      </Flex>
    </Box>
  );
};
