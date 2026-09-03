// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Flex, Popover, Portal, Text } from '@chakra-ui/react';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { DateRange, DayButton as DayPickerDayButton, DayButtonProps, DayPicker, Matcher } from 'react-day-picker';
import { LuCalendar, LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { Field, FieldProps, Tooltip, Input } from '@/components/ui';
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

const PRESET_LABELS: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this-week', label: 'This week' },
  { key: 'last-week', label: 'Last week' },
  { key: 'this-month', label: 'This month' },
  { key: 'last-month', label: 'Last month' },
];

const isValidDateString = (dateString: string) => {
  const d = new Date(dateString);
  return !isNaN(d.getTime());
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

  const [startInputText, setStartInputText] = useState(
    fromValue ? formatDisplayDateValue(parseDateString(fromValue)) : '',
  );
  const [endInputText, setEndInputText] = useState(toValue ? formatDisplayDateValue(parseDateString(toValue)) : '');
  const [activeInput, setActiveInput] = useState<'start' | 'end' | 'done'>('start');

  const rightMonth = useMemo(() => {
    const d = new Date(leftMonth);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [leftMonth]);

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

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setOpen(details.open);

      if (details.open) {
        setStartInputText(fromValue ? formatDisplayDateValue(parseDateString(fromValue)) : '');
        setEndInputText(toValue ? formatDisplayDateValue(parseDateString(toValue)) : '');
        setActiveInput('start');
      }

      if (!details.open) {
        setHoverDate(undefined);
        setIsSelectingEnd(false);
      }
    },
    [fromValue, toValue],
  );

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
    setStartInputText(formatDisplayDateValue(from));
    setEndInputText(formatDisplayDateValue(to));
    setHoverDate(undefined);
    setIsSelectingEnd(false);
    setActiveInput('done');
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

      if (!pendingRange?.from || (!isSelectingEnd && activeInput === 'start')) {
        setPendingRange({ from: clickedDay, to: undefined });
        setStartInputText(formatDisplayDateValue(clickedDay));
        setEndInputText('');
        setIsSelectingEnd(true);
        setActiveInput('end');
        return;
      }

      if (activeInput === 'end' && pendingRange?.from) {
        const anchor = startOfDay(pendingRange.from);

        if (clickedDay.getTime() === anchor.getTime()) {
          setPendingRange(undefined);
          setStartInputText('');
          setEndInputText('');
          setIsSelectingEnd(false);
          setActiveInput('start');
          return;
        }

        const nextRange = getBoundedRangeFromAnchor(anchor, clickedDay, maxRangeDays);
        setPendingRange(nextRange);
        setStartInputText(formatDisplayDateValue(nextRange.from));
        setEndInputText(formatDisplayDateValue(nextRange.to));
        setIsSelectingEnd(false);
        setActiveInput('done');
      }
    },
    [isSelectingEnd, maxRangeDays, pendingRange, activeInput],
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

  const handlePrevMonth = useCallback(() => {
    setLeftMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setLeftMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartInputText(val);
    if (isValidDateString(val)) {
      const d = new Date(val);
      setPendingRange((prev) => ({ from: d, to: prev?.to }));
      setLeftMonth(d);
    }
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndInputText(val);
    if (isValidDateString(val)) {
      const d = new Date(val);
      setPendingRange((prev) => ({ from: prev?.from, to: d }));
    }
  };

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
        '--rdp-accent-color': 'var(--chakra-colors-accent-solid)',
        '--rdp-accent-background-color': 'var(--chakra-colors-accent-solid)',
        '--rdp-day-width': 'var(--date-range-picker-day-size)',
        '--rdp-day-height': 'var(--date-range-picker-day-size)',
        '--rdp-day_button-width': 'var(--date-range-picker-day-size)',
        '--rdp-day_button-height': 'var(--date-range-picker-day-size)',
        '--rdp-selected-font': 'bold',
        '--rdp-outside-opacity': '1',
        '--rdp-today-color': 'var(--chakra-colors-accent-solid)',

        width: '100%',
      },
      '& .rdp-month': {
        width: '100%',
      },
      '& .rdp-month_grid': {
        width: '100%',
        height: 'var(--date-range-picker-grid-height)',
      },
      '& .rdp-weekdays': {
        width: '100%',
      },
      '& .rdp-week:nth-of-type(n+6)': {
        display: 'none',
      },
      '& .rdp-week': {
        width: '280px',
        height: 'calc(var(--date-range-picker-day-size) - 10px)',
        textAlign: 'center',
      },
      '& .rdp-day': {
        color: 'text.main',
      },
      '& .rdp-day:hover:not(.rdp-selected):not(.rdp-range_middle):not(.rdp-disabled)': {
        backgroundColor: 'bg.hover',
      },
      '& .rdp-outside': {
        color: 'text.muted',
      },
      '& .rdp-disabled': {
        color: 'text.muted',
        opacity: 0.35,
        cursor: 'not-allowed',
      },
      '& .rdp-day_button': {
        width: '100%',
        height: '100%',
      },
      '& .rdp-range_start .rdp-day_button, & .rdp-range_end .rdp-day_button': {
        backgroundColor: 'accent.solid',
        color: 'white',
      },
      '& .rdp-range_middle': {
        backgroundColor: 'bg.active',
        color: 'text.main',
      },
      '& .rdp-today:not(.rdp-selected):not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button':
        {
          border: `1px solid var(--chakra-colors-border-active)`,
        },
      '& .rdp-weekday': {
        color: 'text.secondary',
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
    [],
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
                  color={fromValue ? 'text.main' : 'text.muted'}
                  fontSize="sm"
                  pr={showClearButton ? 6 : 0}
                >
                  {displayValue || placeholder}
                </Box>
                <Box color="text.secondary">
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
                color: 'text.secondary',
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
          <Popover.Positioner px={{ base: 2, md: 3 }}>
            <Popover.Content
              bg="bg.panel"
              borderColor="border.main"
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="sm"
              p={0}
              w={{ base: 'calc(100vw - 16px)', md: 'auto' }}
              maxW="calc(100vw - 16px)"
              overflowX="hidden"
              css={{
                '--date-range-picker-day-size': '40px',
                '--date-range-picker-grid-height': '200px',
                '--date-range-picker-input-gap': '20px',
                '--date-range-picker-heading-gap': '20px',
                '--date-range-picker-footer-gap': '29px',
                '@media screen and (max-height: 900px)': {
                  '--date-range-picker-day-size': '36px',
                  '--date-range-picker-grid-height': '180px',
                  '--date-range-picker-input-gap': '12px',
                  '--date-range-picker-heading-gap': '12px',
                  '--date-range-picker-footer-gap': '12px',
                },
              }}
              _focusVisible={{ outline: 'none' }}
            >
              <Flex direction={{ base: 'column', lg: 'row' }}>
                {showPresets && (
                  <Box
                    borderRightWidth={{ base: '0', lg: '1px' }}
                    borderBottomWidth={{ base: '1px', lg: '0' }}
                    borderColor="border.main"
                    minW={{ base: '0', lg: '119px' }}
                    w="100%"
                    px={{ base: 2, lg: 0 }}
                  >
                    <Flex
                      direction={{ base: 'row', lg: 'column' }}
                      wrap={{ base: 'wrap', lg: 'nowrap' }}
                      mt={{ base: 2, lg: '15px' }}
                      mb={{ base: 2, md: 0 }}
                      gap={{ base: 2, md: 0 }}
                    >
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
                            h={{ base: '28px', lg: '20px' }}
                            mb={{ base: 0, lg: '7px' }}
                            minW={{ base: 'fit-content', lg: 'auto' }}
                            whiteSpace="nowrap"
                            fontWeight={isActive ? 600 : 400}
                            justifyContent="flex-start"
                            bg={isActive ? 'bg.hover' : 'transparent'}
                            color={isExceedsMax ? 'text.muted' : isActive ? 'text.main' : 'text.secondary'}
                            opacity={isExceedsMax ? 0.5 : 1}
                            disabled={isExceedsMax}
                            _hover={isExceedsMax ? {} : { bg: 'bg.hover', color: 'text.main' }}
                            onClick={() => handlePreset(key)}
                          >
                            {presetLabel}
                          </Button>
                        );
                      })}
                    </Flex>
                  </Box>
                )}

                <Box p={{ base: '10px', md: '11px 8px 8px 13px' }} flex="1" minWidth={{ base: '0', lg: '605px' }}>
                  <Flex
                    mb="var(--date-range-picker-input-gap)"
                    gap={4}
                    alignItems="center"
                    direction={{ base: 'column', sm: 'row' }}
                  >
                    <Field label="Start date" flex="1">
                      <Input
                        name="startDate"
                        value={startInputText}
                        onChange={handleStartInputChange}
                        onFocus={() => {
                          setActiveInput('start');
                          setIsSelectingEnd(false);
                        }}
                        placeholder="MM/DD/YYYY"
                        bg="bg.input"
                        borderColor={activeInput === 'start' ? 'border.active' : 'border.main'}
                        _focus={{
                          borderColor: 'border.active',
                          boxShadow: '0 0 0 1px var(--chakra-colors-border-active)',
                        }}
                      />
                    </Field>
                    <Box mt={{ base: 0, sm: '20px' }}>—</Box>
                    <Field label="End date" flex="1">
                      <Input
                        name="endDate"
                        value={endInputText}
                        onChange={handleEndInputChange}
                        onFocus={() => {
                          setActiveInput('end');
                          setIsSelectingEnd(true);
                        }}
                        placeholder="MM/DD/YYYY"
                        bg="bg.input"
                        borderColor={activeInput === 'end' ? 'border.active' : 'border.main'}
                        _focus={{
                          borderColor: 'border.active',
                          boxShadow: '0 0 0 1px var(--chakra-colors-border-active)',
                        }}
                      />
                    </Field>
                  </Flex>

                  <Flex direction={{ base: 'column', lg: 'row' }}>
                    {/* Left calendar */}
                    <Box flex="1" mr={{ base: 0, lg: '25px' }} mb={{ base: 4, lg: 0 }}>
                      <Flex
                        mb="var(--date-range-picker-heading-gap)"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth} p={0} minW="32px">
                          <LuChevronLeft size={20} />
                        </Button>
                        <Text fontWeight="bold">
                          {MONTH_NAMES[leftMonth.getMonth()]} {leftMonth.getFullYear()}
                        </Text>
                        <Box w="32px" /> {/* Placeholder for balance */}
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
                      <Flex
                        mb="var(--date-range-picker-heading-gap)"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box w="32px" /> {/* Placeholder for balance */}
                        <Text fontWeight="bold">
                          {MONTH_NAMES[rightMonth.getMonth()]} {rightMonth.getFullYear()}
                        </Text>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth} p={0} minW="32px">
                          <LuChevronRight size={20} />
                        </Button>
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

                  <Flex
                    mt="var(--date-range-picker-footer-gap)"
                    gap={2}
                    justify="flex-end"
                    alignItems={{ base: 'stretch', sm: 'center' }}
                    direction={{ base: 'column', sm: 'row' }}
                    wrap="wrap"
                    borderTopWidth="1px"
                    borderColor="border.main"
                    pt={3}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      color="text.secondary"
                      onClick={handleGoToToday}
                      mr={{ base: 0, sm: 'auto' }}
                      w={{ base: '100%', sm: 'auto' }}
                    >
                      Today
                    </Button>
                    <Flex alignItems="center" w={{ base: '100%', sm: 'auto' }}>
                      <Text fontSize="14px" color="text.main" fontWeight="400">
                        {pendingRangeLabel}
                      </Text>
                    </Flex>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="border.main"
                      color="text.main"
                      onClick={handleCancel}
                      w={{ base: '100%', sm: 'auto' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      bg="accent.solid"
                      color="white"
                      _hover={{ bg: 'blue.600' }}
                      onClick={handleConfirm}
                      disabled={isConfirmDisabled}
                      w={{ base: '100%', sm: 'auto' }}
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
