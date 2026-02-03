import { Box, Container, Heading, Flex, IconButton } from '@chakra-ui/react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { useColorMode } from '@/components/ui';

import { ProjectSelect } from './components';

interface HeaderProps {
  title: string;
  actionButton?: React.ReactNode;
}

export const Header = ({ title, actionButton }: HeaderProps) => {
  const { surfaces, borders, text } = useSurfaceColors();
  const { toggleColorMode, colorMode, theme } = useColorMode();

  return (
    <Box bg={surfaces.sidebar} shadow="sm" borderBottom="1px solid" borderColor={borders.subtle}>
      <Container py={4} maxW="full" h="65px">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={text.primary}>
            {title}
          </Heading>

          <Flex align="center" gap={4} ml="auto" mr="20px">
            {actionButton && actionButton}
            <ProjectSelect />

            {/* <Button variant="outline" size="sm" onClick={openUploadDialog}>
              <LuUpload size={16} />
              Upload
            </Button> */}
          </Flex>
          <IconButton
            aria-label="Toggle theme"
            onClick={toggleColorMode}
            variant="ghost"
            color={colorMode === 'light' ? 'black' : 'white'}
            borderWidth="1px"
            borderStyle="solid"
            borderColor={borders.subtle}
          >
            {theme === 'system' ? <FiSun /> : theme === 'light' ? <FiMoon /> : <FiMonitor />}
          </IconButton>
        </Flex>
      </Container>
    </Box>
  );
};
