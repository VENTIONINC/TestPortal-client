import { useEffect, useRef, useState } from 'react';
import { Box, Text, HStack, Portal, Card } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme';
import { useCloseContextMenu, useContextMenuState } from '@/redux/slices/contextMenu';

interface AdjustedPosition {
  x: number;
  y: number;
  transformOrigin: string;
}

const calculateBoundaryAwarePosition = (
  originalX: number,
  originalY: number,
  menuElement: HTMLElement,
): AdjustedPosition => {
  const EDGE_PADDING = 8;
  const OFFSET_X = -8;
  const OFFSET_Y = 4;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const menuRect = menuElement.getBoundingClientRect();
  const menuWidth = menuRect.width;
  const menuHeight = menuRect.height;

  let adjustedX = originalX + OFFSET_X;
  let adjustedY = originalY + OFFSET_Y;

  const menuRight = adjustedX + menuWidth;
  const menuBottom = adjustedY + menuHeight;

  if (menuRight > viewportWidth) {
    adjustedX = viewportWidth - menuWidth - EDGE_PADDING;
  }
  if (adjustedX < EDGE_PADDING) {
    adjustedX = EDGE_PADDING;
  }

  if (menuBottom > viewportHeight) {
    adjustedY = viewportHeight - menuHeight - EDGE_PADDING;
  }
  if (adjustedY < EDGE_PADDING) {
    adjustedY = EDGE_PADDING;
  }

  let transformOrigin = 'top left';

  if (adjustedX < originalX + OFFSET_X) {
    transformOrigin = adjustedY < originalY + OFFSET_Y ? 'bottom right' : 'top right';
  } else if (adjustedY < originalY + OFFSET_Y) {
    transformOrigin = 'bottom left';
  }

  return {
    x: adjustedX,
    y: adjustedY,
    transformOrigin,
  };
};

export const ContextMenu = () => {
  const { options, position, show } = useContextMenuState();
  const closeContextMenu = useCloseContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<AdjustedPosition | null>(null);
  const { surfaces, borders, text, states } = useSurfaceColors();
  const bgColor = surfaces.card;
  const borderColor = borders.subtle;
  const textColor = text.primary;
  const secondaryTextColor = text.muted;
  const hoverBgColor = states.hoverSubtle;
  const disabledTextColor = text.muted;
  const shadowColor = useSurfaceColors().surfaces.shadow;

  useEffect(() => {
    if (show && menuRef.current) {
      const adjustedPos = calculateBoundaryAwarePosition(position.x, position.y, menuRef.current);
      setAdjustedPosition(adjustedPos);
    } else {
      setAdjustedPosition(null);
    }
  }, [show, position.x, position.y]);
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [show, closeContextMenu]);

  if (!show) return null;

  const { x, y } = adjustedPosition || position;
  const transformOrigin = adjustedPosition?.transformOrigin || 'top left';

  return (
    <Portal>
      <Box
        ref={menuRef}
        position="fixed"
        left={`${x}px`}
        top={`${y}px`}
        zIndex={9999}
        transformOrigin={transformOrigin}
        style={{
          visibility: adjustedPosition ? 'visible' : 'hidden',
        }}
      >
        <Card.Root
          bg={bgColor}
          borderColor={borderColor}
          borderWidth="1px"
          shadow={shadowColor}
          borderRadius="md"
          minW="14rem"
          maxW="20rem"
          p={1}
          data-testid="context-menu"
        >
          {options.map(({ title, subTitle, onClick, disabled, icon: Icon, divider }, index) => {
            const isClickable = !!onClick && !disabled;

            return (
              <Box key={`${title}-${index}`}>
                <Box
                  as="button"
                  w="full"
                  textAlign="left"
                  px={3}
                  py={2}
                  borderRadius="sm"
                  transition="background-color 0.2s"
                  cursor={isClickable ? 'pointer' : 'default'}
                  opacity={disabled ? 0.5 : 1}
                  _hover={isClickable ? { bg: hoverBgColor } : undefined}
                  _focus={
                    isClickable
                      ? {
                          bg: hoverBgColor,
                          outline: '2px solid',
                          outlineColor: 'blue.500',
                          outlineOffset: '-2px',
                        }
                      : undefined
                  }
                  onClick={
                    isClickable
                      ? () => {
                          closeContextMenu();
                          onClick?.();
                        }
                      : undefined
                  }
                  _disabled={{ opacity: 0.5 }}
                  aria-label={title}
                  tabIndex={disabled ? -1 : 0}
                >
                  <HStack justify="space-between" w="full" gap={3}>
                    <Box flex={1} textAlign="left">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={disabled ? disabledTextColor : textColor}
                        lineHeight="tight"
                      >
                        {title}
                      </Text>
                      {subTitle && (
                        <Text fontSize="xs" color={secondaryTextColor} lineHeight="tight" mt={0.5}>
                          {subTitle}
                        </Text>
                      )}
                    </Box>
                    {Icon && (
                      <Box flexShrink={0} color={disabled ? disabledTextColor : secondaryTextColor}>
                        <Icon size={16} />
                      </Box>
                    )}
                  </HStack>
                </Box>
                {divider && index < options.length - 1 && <Box h="1px" bg={borderColor} mx={2} my={1} />}
              </Box>
            );
          })}
        </Card.Root>
      </Box>
    </Portal>
  );
};
