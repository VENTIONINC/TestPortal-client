import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Flex, Popover, Portal, Text } from '@chakra-ui/react';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { DateRange, DayButton as DayPickerDayButton, DayButtonProps, DayPicker, Matcher } from 'react-day-picker';
import { LuCalendar, LuX } from 'react-icons/lu';

import { Field, FieldProps, NativeSelect, Tooltip } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { formatDate, parseDateString, getPresetDateRange, type DateRangePreset } from '@/utils/dateUtils';

export interface DateRangePickerProps {
  label?: string;
  name: string;
  fromValue?: string;
  toValue?: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onClear?: () => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  maxRangeDays?: number;
  showPresets?: boolean;
  fieldProps?: FieldProps;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({ value: String(i), label: name }));

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
};

const PRESET_LABELS: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this-week', label: 'This week' },
  { key: 'last-week', label: 'Last week' },
  { key: 'this-month', label: 'This month' },
  { key: 'last-month', label: 'Last month' },
];

const PHASE_LABELS: Record<SelectionPhase, string | null> = {
  start: 'Select start date',
  end: 'Select end date',
  done: null,
};

type SelectionPhase = 'start' | 'end' | 'done';

const formatWeekdayName = (date: Date): string => date.toLocaleDateString('en-US', { weekday: 'short' });

const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

const formatDisplayDateValue = (date?: Date): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getBoundedRangeFromAnchor = (anchor: Date, target: Date, maxRangeDays?: number): DateRange => {
  const normalizedAnchor = startOfDay(anchor);
  const normalizedTarget = startOfDay(target);

  if (normalizedTarget.getTime() >= normalizedAnchor.getTime()) {
    if (maxRangeDays && differenceInCalendarDays(normalizedTarget, normalizedAnchor) + 1 > maxRangeDays) {
      const clippedTo = new Date(normalizedAnchor);
      clippedTo.setDate(normalizedAnchor.getDate() + maxRangeDays - 1);
      return { from: normalizedAnchor, to: clippedTo };
    }

    return { from: normalizedAnchor, to: normalizedTarget };
  }

  if (maxRangeDays && differenceInCalendarDays(normalizedAnchor, normalizedTarget) + 1 > maxRangeDays) {
    const clippedFrom = new Date(normalizedAnchor);
    clippedFrom.setDate(normalizedAnchor.getDate() - (maxRangeDays - 1));
    return { from: clippedFrom, to: normalizedAnchor };
  }

  return { from: normalizedTarget, to: normalizedAnchor };
};

const getPreviewRange = (anchor: Date, hovered: Date): DateRange => {
  if (hovered.getTime() >= anchor.getTime()) {
    return { from: anchor, to: hovered };
  }

  return { from: hovered, to: anchor };
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    label,
    fromValue,
    toValue,
    onChangeFrom,
    onChangeTo,
    onClear,
    onBlur,
    error,
    placeholder = 'Select date range',
    disabled,
    maxRangeDays,
    showPresets = true,
    fieldProps,
  } = props;
  const { menu, borders, text } = useSurfaceColors();
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | undefined>();
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!fromValue && !toValue) return undefined;
    return {
      from: fromValue ? parseDateString(fromValue) : undefined,
      to: toValue ? parseDateString(toValue) : undefined,
    };
  }, [fromValue, toValue]);

  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(selectedRange);
  const [leftMonth, setLeftMonth] = useState<Date>(fromValue ? parseDateString(fromValue) : new Date());

  const rightMonth = useMemo(() => {
    const d = new Date(leftMonth);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [leftMonth]);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const displayValue = useMemo(() => {
    if (!fromValue && !toValue) return '';
    const from = formatDisplayDate(fromValue);
    const to = formatDisplayDate(toValue);
    if (from && to) return `${from} - ${to}`;
    if (from) return `${from} - ...`;
    return '';
  }, [fromValue, toValue]);

  const handleOpen = useCallback(() => {
    setPendingRange(selectedRange);
    setLeftMonth(fromValue ? parseDateString(fromValue) : new Date());
    setHoverDate(undefined);
    setIsSelectingEnd(Boolean(selectedRange?.from && !selectedRange.to));
    setOpen(true);
  }, [fromValue, selectedRange]);

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    setOpen(details.open);

    if (!details.open) {
      setHoverDate(undefined);
      setIsSelectingEnd(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingRange?.from) {
      onChangeFrom(formatDate(pendingRange.from));
      if (pendingRange.to) {
        onChangeTo(formatDate(pendingRange.to));
      } else {
        onChangeTo(formatDate(pendingRange.from));
      }
    }
    setOpen(false);
  }, [pendingRange, onChangeFrom, onChangeTo]);

  const handleCancel = useCallback(() => {
    setHoverDate(undefined);
    setIsSelectingEnd(false);
    setOpen(false);
  }, []);

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setPendingRange(undefined);
      setHoverDate(undefined);
      setIsSelectingEnd(false);
      setOpen(false);
      onClear?.();
    },
    [onClear],
  );

  const handlePreset = useCallback((preset: DateRangePreset) => {
    const range = getPresetDateRange(preset);
    const from = parseDateString(range.from);
    const to = parseDateString(range.to);
    const nextRange = { from, to };
    setPendingRange(nextRange);
    setLeftMonth(from);
    setHoverDate(undefined);
    setIsSelectingEnd(false);
  }, []);

  const selectionPhase = useMemo<SelectionPhase>(() => {
    if (!pendingRange?.from) {
      return 'start';
    }

    return isSelectingEnd ? 'end' : 'done';
  }, [isSelectingEnd, pendingRange]);

  const activePreset = useMemo<DateRangePreset | null>(() => {
    if (!pendingRange?.from || !pendingRange?.to) return null;

    for (const { key } of PRESET_LABELS) {
      const presetRange = getPresetDateRange(key);

      if (formatDate(pendingRange.from) === presetRange.from && formatDate(pendingRange.to) === presetRange.to) {
        return key;
      }
    }

    return null;
  }, [pendingRange]);

  const displayRange = useMemo<DateRange | undefined>(() => {
    if (selectionPhase === 'end' && hoverDate && pendingRange?.from) {
      return getPreviewRange(pendingRange.from, hoverDate);
    }

    return pendingRange;
  }, [hoverDate, pendingRange, selectionPhase]);

  const pendingRangeLabel = useMemo(() => {
    if (!pendingRange?.from) {
      return '';
    }

    if (selectionPhase === 'end' && !hoverDate) {
      return `${formatDisplayDateValue(pendingRange.from)} - ...`;
    }

    const rangeForLabel = displayRange ?? pendingRange;

    if (!rangeForLabel?.from) {
      return '';
    }

    return `${formatDisplayDateValue(rangeForLabel.from)} - ${formatDisplayDateValue(rangeForLabel.to)}`;
  }, [displayRange, hoverDate, pendingRange, selectionPhase]);

  const handleRangeSelect = useCallback(
    (_range: DateRange | undefined, triggerDate: Date, modifiers: Record<string, boolean>) => {
      if (modifiers.disabled) {
        return;
      }

      setHoverDate(undefined);
      const clickedDay = startOfDay(triggerDate);

      if (!pendingRange?.from || !isSelectingEnd) {
        setPendingRange({ from: clickedDay, to: clickedDay });
        setIsSelectingEnd(true);
        return;
      }

      const anchor = startOfDay(pendingRange.from);

      if (clickedDay.getTime() === anchor.getTime()) {
        setPendingRange(undefined);
        setIsSelectingEnd(false);
        return;
      }

      const nextRange = getBoundedRangeFromAnchor(anchor, clickedDay, maxRangeDays);
      setPendingRange(nextRange);
      setIsSelectingEnd(false);
    },
    [isSelectingEnd, maxRangeDays, pendingRange],
  );

  const handleDayMouseEnter = useCallback(
    (day: Date, modifiers: Record<string, boolean>) => {
      if (!isSelectingEnd || !pendingRange?.from || modifiers.disabled) {
        return;
      }

      setHoverDate(day);
    },
    [isSelectingEnd, pendingRange],
  );

  const handleCalendarMouseLeave = useCallback(() => {
    setHoverDate(undefined);
  }, []);

  const handleLeftMonthChange = useCallback((newMonth: string) => {
    setLeftMonth((prev) => new Date(prev.getFullYear(), Number(newMonth), 1));
  }, []);

  const handleLeftYearChange = useCallback((newYear: string) => {
    setLeftMonth((prev) => new Date(Number(newYear), prev.getMonth(), 1));
  }, []);

  const handleRightMonthChange = useCallback(
    (newMonth: string) => {
      setLeftMonth(new Date(rightMonth.getFullYear(), Number(newMonth) - 1, 1));
    },
    [rightMonth],
  );

  const handleRightYearChange = useCallback(
    (newYear: string) => {
      setLeftMonth(new Date(Number(newYear), rightMonth.getMonth() - 1, 1));
    },
    [rightMonth],
  );

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setLeftMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setHoverDate(undefined);
  }, []);

  // Always disable future dates (after today).
  // When maxRangeDays is set and the user is choosing the end date,
  // disable dates that exceed the allowed distance from the anchor.
  const disabledDays = useMemo<Matcher[]>(() => {
    const today = startOfDay(new Date());
    const futureDisabled: Matcher = { after: today };

    if (!maxRangeDays || !isSelectingEnd || !pendingRange?.from) {
      return [futureDisabled];
    }

    const anchor = pendingRange.from;
    const minDate = new Date(anchor);
    minDate.setDate(anchor.getDate() - (maxRangeDays - 1));
    const maxDate = new Date(anchor);
    maxDate.setDate(anchor.getDate() + (maxRangeDays - 1));
    const maxSelectableDate = maxDate.getTime() < today.getTime() ? maxDate : today;

    return [{ before: minDate }, { after: maxSelectableDate }];
  }, [isSelectingEnd, maxRangeDays, pendingRange]);

  const getDisabledDayReason = useCallback(
    (day: Date): string => {
      const normalizedDay = startOfDay(day);
      const today = startOfDay(new Date());

      if (normalizedDay.getTime() > today.getTime()) {
        return 'Future dates not available';
      }

      if (maxRangeDays && isSelectingEnd && pendingRange?.from) {
        const anchor = startOfDay(pendingRange.from);
        const minDate = new Date(anchor);
        minDate.setDate(anchor.getDate() - (maxRangeDays - 1));
        const maxDate = new Date(anchor);
        maxDate.setDate(anchor.getDate() + (maxRangeDays - 1));
        const maxSelectableDate = maxDate.getTime() < today.getTime() ? maxDate : today;

        if (normalizedDay.getTime() < minDate.getTime() || normalizedDay.getTime() > maxSelectableDate.getTime()) {
          return `Max range: ${maxRangeDays} days`;
        }
      }

      return 'Date not available';
    },
    [isSelectingEnd, maxRangeDays, pendingRange],
  );

  const CalendarDayButton = useCallback(
    (buttonProps: DayButtonProps) => {
      if (!buttonProps.modifiers.disabled) {
        return <DayPickerDayButton {...buttonProps} />;
      }

      return (
        <Tooltip
          content={getDisabledDayReason(buttonProps.day.date)}
          contentProps={{ maxW: '220px', textAlign: 'center' }}
        >
          <Box as="span" display="block" w="full" h="full">
            <DayPickerDayButton {...buttonProps} />
          </Box>
        </Tooltip>
      );
    },
    [getDisabledDayReason],
  );

  const dayPickerComponents = useMemo(
    () => ({
      DayButton: CalendarDayButton,
    }),
    [CalendarDayButton],
  );
  const isConfirmDisabled = !pendingRange?.from;
  const showClearButton = Boolean((fromValue || toValue) && onClear && !disabled);

  const calendarCss = useMemo(
    () => ({
      '& .rdp-root': {
        '--rdp-accent-color': '#53ABFC',
        '--rdp-accent-background-color': '#53ABFC',
        '--rdp-day-width': '40px',
        '--rdp-day-height': '40px',
        '--rdp-day_button-width': '40px',
        '--rdp-day_button-height': '40px',
        '--rdp-selected-font': 'bold',
        '--rdp-outside-opacity': '1',
        '--rdp-today-color': '#53ABFC',

        width: '100%',
      },
      '& .rdp-month': {
        width: '100%',
      },
      '& .rdp-month_grid': {
        width: '100%',
        height: '200px',
      },
      '& .rdp-weekdays': {
        width: '100%',
      },
      '& .rdp-week:nth-of-type(n+6)': {
        display: 'none',
      },
      '& .rdp-week': {
        width: '280px',
        height: '30px',
        textAlign: 'center',
      },
      '& .rdp-day': {
        color: text.primary,
      },
      '& .rdp-day:hover:not(.rdp-selected):not(.rdp-range_middle):not(.rdp-disabled)': {
        backgroundColor: menu.itemHoverBg,
      },
      '& .rdp-outside': {
        color: menu.textSecondary,
      },
      '& .rdp-disabled': {
        color: menu.textSecondary,
        opacity: 0.35,
        cursor: 'not-allowed',
      },
      '& .rdp-day_button': {
        width: '100%',
        height: '100%',
      },
      '& .rdp-range_start .rdp-day_button, & .rdp-range_end .rdp-day_button': {
        backgroundColor: '#53ABFC',
        color: 'white',
      },
      '& .rdp-range_middle': {
        backgroundColor: 'rgba(83, 171, 252, 0.15)',
        color: text.primary,
      },
      '& .rdp-today:not(.rdp-selected):not(.rdp-range_start):not(.rdp-range_end) .rdp-day_button': {
        border: `1px solid ${borders.focus}`,
      },
      '& .rdp-weekday': {
        color: text.secondary,
        fontSize: '12px',
        fontWeight: 'normal',
        paddingBottom: '12px',
      },
      '& .rdp-month_caption': {
        display: 'none',
      },
      '& .rdp-nav': {
        display: 'none',
      },
    }),
    [text, menu, borders],
  );

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Box position="relative" w="full">
          <Popover.Trigger asChild>
            <button
              type="button"
              style={{ width: '100%', background: 'none', border: 'none', padding: 0 }}
              onClick={handleOpen}
              onBlur={onBlur}
              disabled={disabled}
            >
              <Flex
                w="full"
                align="center"
                gap={2}
                px={3}
                py={2}
                bg="bg.input"
                borderWidth="1px"
                borderColor="border.main"
                borderRadius="md"
                cursor={disabled ? 'not-allowed' : 'pointer'}
                opacity={disabled ? 0.5 : 1}
                _hover={{ borderColor: 'border.active' }}
              >
                <Box
                  flex="1"
                  textAlign="left"
                  color={fromValue ? text.primary : text.muted}
                  fontSize="sm"
                  pr={showClearButton ? 6 : 0}
                >
                  {displayValue || placeholder}
                </Box>
                <Box color={text.secondary}>
                  <LuCalendar size={16} />
                </Box>
              </Flex>
            </button>
          </Popover.Trigger>

          {showClearButton && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
              aria-label="Clear date range"
              style={{
                position: 'absolute',
                top: '50%',
                right: '38px',
                transform: 'translateY(-50%)',
                color: text.secondary,
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                padding: 0,
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              <LuX size={14} />
            </button>
          )}
        </Box>

        <Portal>
          <Popover.Positioner>
            <Popover.Content
              bg={menu.bg}
              borderColor={borders.subtle}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow={menu.shadow}
              p={0}
              w="100%"
              _focusVisible={{ outline: 'none' }}
            >
              <Flex>
                {showPresets && (
                  <Box borderRightWidth="1px" borderColor={borders.subtle} minW="119px">
                    <Flex direction="column" mt="15px">
                      {PRESET_LABELS.map(({ key, label: presetLabel }) => {
                        const presetRange = getPresetDateRange(key);
                        const presetDays =
                          differenceInCalendarDays(parseDateString(presetRange.to), parseDateString(presetRange.from)) +
                          1;
                        const isExceedsMax = maxRangeDays !== undefined && presetDays > maxRangeDays;
                        const isActive = activePreset === key;

                        return (
                          <Button
                            key={key}
                            variant="ghost"
                            size="xs"
                            h="20px"
                            mb="7px"
                            fontWeight={isActive ? 600 : 400}
                            justifyContent="flex-start"
                            bg={isActive ? menu.itemHoverBg : 'transparent'}
                            color={isExceedsMax ? menu.textSecondary : isActive ? text.primary : text.secondary}
                            opacity={isExceedsMax ? 0.5 : 1}
                            disabled={isExceedsMax}
                            _hover={isExceedsMax ? {} : { bg: menu.itemHoverBg, color: text.primary }}
                            onClick={() => handlePreset(key)}
                          >
                            {presetLabel}
                          </Button>
                        );
                      })}
                    </Flex>
                  </Box>
                )}

                <Box p="11px 8px 8px 13px" flex="1" minWidth="605px">
                  {PHASE_LABELS[selectionPhase] && (
                    <Text fontSize="12px" color={text.secondary} mb={4}>
                      {PHASE_LABELS[selectionPhase]}
                    </Text>
                  )}

                  <Flex>
                    {/* Left calendar */}
                    <Box flex="1" mr="25px">
                      <Flex mb={5}>
                        <NativeSelect
                          name="left-month"
                          h="32px"
                          minW="140px"
                          mr="15px"
                          value={String(leftMonth.getMonth())}
                          onChange={(e) => handleLeftMonthChange(e.target.value)}
                          items={MONTH_OPTIONS}
                        />

                        <NativeSelect
                          name="left-year"
                          h="32px"
                          w="125px"
                          value={String(leftMonth.getFullYear())}
                          onChange={(e) => handleLeftYearChange(e.target.value)}
                          items={yearOptions}
                        />
                      </Flex>
                      <Box css={calendarCss} onMouseLeave={handleCalendarMouseLeave}>
                        <DayPicker
                          mode="range"
                          selected={displayRange}
                          onSelect={handleRangeSelect}
                          onDayMouseEnter={handleDayMouseEnter}
                          month={leftMonth}
                          onMonthChange={setLeftMonth}
                          weekStartsOn={1}
                          showOutsideDays
                          disabled={disabledDays}
                          formatters={{ formatWeekdayName }}
                          components={dayPickerComponents}
                        />
                      </Box>
                    </Box>

                    {/* Right calendar */}
                    <Box flex="1">
                      <Flex mb={5} maxW="140px">
                        <NativeSelect
                          name="right-month"
                          h="32px"
                          minW="140px"
                          mr="15px"
                          value={String(rightMonth.getMonth())}
                          onChange={(e) => handleRightMonthChange(e.target.value)}
                          items={MONTH_OPTIONS}
                        />

                        <NativeSelect
                          name="right-year"
                          h="32px"
                          w="125px"
                          value={String(rightMonth.getFullYear())}
                          onChange={(e) => handleRightYearChange(e.target.value)}
                          items={yearOptions}
                        />
                      </Flex>
                      <Box css={calendarCss} onMouseLeave={handleCalendarMouseLeave}>
                        <DayPicker
                          mode="range"
                          selected={displayRange}
                          onSelect={handleRangeSelect}
                          onDayMouseEnter={handleDayMouseEnter}
                          month={rightMonth}
                          weekStartsOn={1}
                          showOutsideDays
                          disabled={disabledDays}
                          formatters={{ formatWeekdayName }}
                          components={dayPickerComponents}
                        />
                      </Box>
                    </Box>
                  </Flex>

                  <Flex mt="29px" gap={2} justify="flex-end" borderTopWidth="1px" borderColor={borders.subtle} pt={3}>
                    <Button size="sm" variant="ghost" color={text.secondary} onClick={handleGoToToday} mr="auto">
                      Today
                    </Button>
                    <Flex alignItems="center">
                      <Text fontSize="14px" color={text.primary} fontWeight="400">
                        {pendingRangeLabel}
                      </Text>
                    </Flex>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor={borders.subtle}
                      color={text.primary}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      bg="#53ABFC"
                      color="white"
                      _hover={{ bg: '#3A9AEB' }}
                      onClick={handleConfirm}
                      disabled={isConfirmDisabled}
                    >
                      Confirm
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Field>
  );
};
