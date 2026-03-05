import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Flex, Popover, Portal, Text } from '@chakra-ui/react';
import { DateRange, DayPicker, Matcher } from 'react-day-picker';
import { LuCalendar } from 'react-icons/lu';

import { Field, FieldProps, NativeSelect } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { formatDate, parseDateString, getPresetDateRange, type DateRangePreset } from '@/utils/dateUtils';

export interface DateRangePickerProps {
  label?: string;
  name: string;
  fromValue?: string;
  toValue?: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
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

const formatWeekdayName = (date: Date): string => date.toLocaleDateString('en-US', { weekday: 'short' });

const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    label,
    fromValue,
    toValue,
    onChangeFrom,
    onChangeTo,
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
    setOpen(true);
  }, [selectedRange, fromValue]);

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
    setOpen(false);
  }, []);

  const handlePreset = useCallback((preset: DateRangePreset) => {
    const range = getPresetDateRange(preset);
    const from = parseDateString(range.from);
    const to = parseDateString(range.to);
    setPendingRange({ from, to });
    setLeftMonth(from);
  }, []);

  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (maxRangeDays && range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
        const diffDays = Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= maxRangeDays) {
          const clippedTo = new Date(range.from);
          clippedTo.setDate(range.from.getDate() + maxRangeDays - 1);
          setPendingRange({ from: range.from, to: clippedTo });
          return;
        }
      }
      setPendingRange(range);
    },
    [maxRangeDays],
  );

  const handleLeftMonthChange = useCallback((newMonth: string) => {
    setLeftMonth((prev) => new Date(prev.getFullYear(), Number(newMonth), 1));
  }, []);

  const handleLeftYearChange = useCallback((newYear: string) => {
    setLeftMonth((prev) => new Date(Number(newYear), prev.getMonth(), 1));
  }, []);

  const handleRightMonthChange = useCallback((newMonth: string) => {
    const m = Number(newMonth);
    // Right month is leftMonth + 1, so set leftMonth to m - 1
    setLeftMonth((prev) => new Date(prev.getFullYear(), m - 1, 1));
  }, []);

  const handleRightYearChange = useCallback((newYear: string) => {
    // Keep the right month's month index, set leftMonth accordingly
    setLeftMonth((prev) => {
      const rightMonthIndex = (prev.getMonth() + 1) % 12;
      return new Date(Number(newYear), rightMonthIndex - 1, 1);
    });
  }, []);

  // Always disable future dates (after today).
  // When maxRangeDays is set and user has picked the start date (from exists, to doesn't or equals from),
  // also disable dates that are beyond maxRangeDays from the anchor.
  const disabledDays = useMemo<Matcher[]>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const futureDisabled: Matcher = { after: today };

    if (!maxRangeDays || !pendingRange?.from) return [futureDisabled];
    // Deactivate range restriction once user has completed the selection (to is set and differs from from)
    if (pendingRange.to && pendingRange.from.getTime() !== pendingRange.to.getTime()) return [futureDisabled];

    const anchor = pendingRange.from;
    const minDate = new Date(anchor);
    minDate.setDate(anchor.getDate() - (maxRangeDays - 1));
    const maxDate = new Date(anchor);
    maxDate.setDate(anchor.getDate() + (maxRangeDays - 1));

    return [{ before: minDate }, { after: maxDate < today ? maxDate : today }];
  }, [maxRangeDays, pendingRange]);

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
      <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
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
              <Box flex="1" textAlign="left" color={fromValue ? text.primary : text.muted} fontSize="sm">
                {displayValue || placeholder}
              </Box>
              <Box color={text.secondary}>
                <LuCalendar size={16} />
              </Box>
            </Flex>
          </button>
        </Popover.Trigger>

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
                        const presetDays = Math.ceil(
                          (parseDateString(presetRange.to).getTime() - parseDateString(presetRange.from).getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        const isExceedsMax = maxRangeDays !== undefined && presetDays > maxRangeDays;

                        return (
                          <Button
                            key={key}
                            variant="ghost"
                            size="xs"
                            h="20px"
                            mb="7px"
                            fontWeight={400}
                            justifyContent="flex-start"
                            color={isExceedsMax ? menu.textSecondary : text.secondary}
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
                      <Box css={calendarCss}>
                        <DayPicker
                          mode="range"
                          selected={pendingRange}
                          onSelect={handleRangeSelect}
                          month={leftMonth}
                          onMonthChange={setLeftMonth}
                          weekStartsOn={1}
                          showOutsideDays
                          disabled={disabledDays}
                          formatters={{ formatWeekdayName }}
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
                      <Box css={calendarCss}>
                        <DayPicker
                          mode="range"
                          selected={pendingRange}
                          onSelect={handleRangeSelect}
                          month={rightMonth}
                          weekStartsOn={1}
                          showOutsideDays
                          disabled={disabledDays}
                          formatters={{ formatWeekdayName }}
                        />
                      </Box>
                    </Box>
                  </Flex>

                  <Flex mt="29px" gap={2} justify="flex-end" borderTopWidth="1px" borderColor={borders.subtle} pt={3}>
                    <Flex alignItems="center">
                      <Text fontSize="14px" color={text.primary} fontWeight="400">
                        {pendingRange
                          ? `${pendingRange.from?.toLocaleDateString()} - ${pendingRange.to?.toLocaleDateString()}`
                          : ''}
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
                    <Button size="sm" bg="#53ABFC" color="white" _hover={{ bg: '#3A9AEB' }} onClick={handleConfirm}>
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
