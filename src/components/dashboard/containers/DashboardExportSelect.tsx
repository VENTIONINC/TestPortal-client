// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Icon, Spinner, Text, VStack } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';

export type DashboardExportMode = 'standard' | 'ai';

interface DashboardExportSelectProps {
  disabled: boolean;
  exportMode: DashboardExportMode | null;
  onSelect: (mode: DashboardExportMode) => void;
}

const exportOptions: Array<{ value: DashboardExportMode; label: string }> = [
  { value: 'standard', label: 'Export PDF' },
  { value: 'ai', label: 'Export PDF + AI' },
];

const loadingLabelByMode: Record<DashboardExportMode, string> = {
  standard: 'Exporting PDF...',
  ai: 'Exporting PDF + AI...',
};

const ExportFileIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon viewBox="0 0 36 32" fill="none" {...props}>
    <path
      d="M14 22.6667C13.6464 22.6667 13.3072 22.5262 13.0572 22.2762C12.8071 22.0261 12.6667 21.687 12.6667 21.3334V10.6667C12.6667 10.3131 12.8071 9.97395 13.0572 9.7239C13.3072 9.47385 13.6464 9.33338 14 9.33338H19.3333C19.5444 9.33303 19.7534 9.37444 19.9483 9.45522C20.1433 9.536 20.3204 9.65455 20.4693 9.80404L22.8613 12.196C23.0112 12.345 23.1301 12.5223 23.2111 12.7175C23.2921 12.9127 23.3337 13.122 23.3333 13.3334V21.3334C23.3333 21.687 23.1928 22.0261 22.9428 22.2762C22.6927 22.5262 22.3536 22.6667 22 22.6667H14Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.3333 9.33337V12.6667C19.3333 12.8435 19.4036 13.0131 19.5286 13.1381C19.6536 13.2631 19.8232 13.3334 20 13.3334H23.3333"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 16V20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 18L18 16L16 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

const ExportChevronIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon viewBox="0 0 10 10" fill="none" {...props}>
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const DashboardExportSelect = ({ disabled, exportMode, onSelect }: DashboardExportSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerBg = useColorModeValue('#F4F4F5', '#18181B');
  const triggerBorder = useColorModeValue('#E0E0E0', '#3D3D3F');
  const triggerText = useColorModeValue('#333333', '#FFFFFF');
  const triggerHoverBg = useColorModeValue('#ECECEF', '#202024');
  const menuBg = useColorModeValue('#FFFFFF', '#18181B');
  const menuBorder = useColorModeValue('#E0E0E0', '#3D3D3F');
  const menuHoverBg = useColorModeValue('#F4F4F5', '#232327');
  const shadow = useColorModeValue('0 6px 18px rgba(15, 23, 42, 0.08)', '0 8px 20px rgba(0, 0, 0, 0.28)');
  const loadingLabel = exportMode ? loadingLabelByMode[exportMode] : 'Export PDF';
  const isBusy = exportMode !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled || isBusy) {
      setIsOpen(false);
    }
  }, [disabled, isBusy]);

  const handleToggle = () => {
    if (disabled || isBusy) {
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const handleSelect = (mode: DashboardExportMode) => {
    setIsOpen(false);
    onSelect(mode);
  };

  return (
    <Box position="relative" ref={containerRef}>
      <Flex
        as="button"
        align="center"
        justify="space-between"
        gap={3}
        h="32px"
        minW="180px"
        px={3}
        borderRadius="4px"
        border="1px solid"
        borderColor={triggerBorder}
        bg={triggerBg}
        color={triggerText}
        boxShadow="none"
        transition="background-color 0.2s ease, border-color 0.2s ease"
        _hover={disabled || isBusy ? {} : { bg: triggerHoverBg }}
        _focusVisible={{ outline: 'none', boxShadow: `0 0 0 1px ${triggerBorder}` }}
        cursor={disabled || isBusy ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.55 : 1}
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Export dashboard"
      >
        <Flex align="center" gap={2} minW={0}>
          {isBusy ? <Spinner size="xs" color={triggerText} /> : <ExportFileIcon boxSize={4} color={triggerText} />}
          <Text fontSize="sm" fontWeight="medium" lineHeight="20px" truncate>
            {loadingLabel}
          </Text>
        </Flex>

        <ExportChevronIcon
          boxSize={4}
          color={triggerText}
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.2s ease"
          flexShrink={0}
        />
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          minW="100%"
          borderRadius="8px"
          border="1px solid"
          borderColor={menuBorder}
          bg={menuBg}
          boxShadow={shadow}
          zIndex={1100}
          overflow="hidden"
        >
          <VStack align="stretch" gap={0} p={1}>
            {exportOptions.map((option) => (
              <Box
                as="button"
                key={option.value}
                textAlign="left"
                px={3}
                py={2}
                borderRadius="6px"
                fontSize="sm"
                fontWeight="medium"
                color={triggerText}
                transition="background-color 0.2s ease"
                _hover={{ bg: menuHoverBg }}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};