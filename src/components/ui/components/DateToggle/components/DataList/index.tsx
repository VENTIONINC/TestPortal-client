// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { HStack, ButtonGroup, Button, Box } from '@chakra-ui/react';

interface DateListProps {
  days: { yyyy_mm_dd: string; display: string; isActive: boolean }[];
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
  size?: 'default' | 'small';
  isBorder?: boolean;
}

export const DateList = ({ days, toggleHandler, size = 'default', isBorder = true }: DateListProps) => {
  const buttonH = size === 'small' ? '30px' : '40px';
  const buttonFontSize = 13;

  return (
  <HStack overflowX="auto" borderRadius="md" bg="bg.section">
    <Box borderRadius="md" shadow={isBorder ? "sm" : "none"} overflow="hidden" w="100%">
      <ButtonGroup  variant="outline" gap={0} w="100%">
        {days.map((day) => (
          <Button
            key={day.yyyy_mm_dd}
            onClick={() => toggleHandler({ yyyy_mm_dd: day.yyyy_mm_dd })}
            flex={1}
            justifyContent="center"
            borderRadius="0"
            height={buttonH}
            fontSize={buttonFontSize}
            fontWeight={500}
            variant="tertiary"
            textAlign="center"
            whiteSpace="nowrap"
            border="1px solid "
            borderColor={
              isBorder ?
              day.isActive ? 'button.groupButton.selected.borderColor' : 'button.groupButton.default.borderColor'
              : 'transparent'
            }
            bg={
              day.isActive ? 'button.groupButton.selected.bg' : isBorder ? 'button.groupButton.default.bg' : "transparent"
            }
            color={day.isActive ? 'button.groupButton.selected.color' : 'button.groupButton.default.color'}
            _hover={{
              bg: 'button.groupButton.hover.bg',
              color: 'button.groupButton.hover.color',
              borderColor: 'button.groupButton.hover.borderColor',
            }}
          >
            {day.display}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  </HStack>
  )
}

