import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Flex, Popover, Portal } from '@chakra-ui/react';
import { DayPicker } from 'react-day-picker';
import { LuCalendar } from 'react-icons/lu';

import { Field, FieldProps, NativeSelect } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { formatDate, parseDateString } from '@/utils/dateUtils';

export interface DatePickerProps {
  label?: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  fieldProps?: FieldProps;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

export const DatePicker = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Select date',
  disabled,
  minDate,
  maxDate,
  fieldProps,
}: DatePickerProps) => {
  const { menu, borders, text, surfaces } = useSurfaceColors();
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => (value ? parseDateString(value) : undefined), [value]);
  const [pendingDate, setPendingDate] = useState<Date | undefined>(selectedDate);
  const [month, setMonth] = useState<Date>(selectedDate ?? new Date());

  const displayValue = useMemo(() => {
    if (!value) return '';
    const d = parseDateString(value);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  }, [value]);

  const handleOpen = useCallback(() => {
    setPendingDate(selectedDate);
    setMonth(selectedDate ?? new Date());
    setOpen(true);
  }, [selectedDate]);

  const handleConfirm = useCallback(() => {
    if (pendingDate) {
      onChange(formatDate(pendingDate));
    }
    setOpen(false);
  }, [pendingDate, onChange]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleMonthChange = useCallback((newMonth: string) => {
    setMonth((prev) => new Date(prev.getFullYear(), Number(newMonth), 1));
  }, []);

  const handleYearChange = useCallback((newYear: string) => {
    setMonth((prev) => new Date(Number(newYear), prev.getMonth(), 1));
  }, []);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const calendarStyles = useMemo(
    () => ({
      '--rdp-accent-color': '#53ABFC',
      '--rdp-accent-background-color': '#53ABFC',
      '--rdp-day-width': '40px',
      '--rdp-day-height': '40px',
      '--rdp-day_button-width': '40px',
      '--rdp-day_button-height': '40px',
      '--rdp-selected-font': 'bold',
      '--rdp-outside-opacity': '1',
      '--rdp-today-color': '#53ABFC',
    }) as React.CSSProperties,
    [],
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
              bg={surfaces.card}
              borderWidth="1px"
              borderColor={borders.subtle}
              borderRadius="md"
              cursor={disabled ? 'not-allowed' : 'pointer'}
              opacity={disabled ? 0.5 : 1}
              _hover={{ borderColor: borders.focus }}
            >
              <Box flex="1" textAlign="left" color={value ? text.primary : text.muted} fontSize="sm">
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
              p={4}
              w="auto"
              _focusVisible={{ outline: 'none' }}
            >
              <Flex gap={2} mb={3}>
                <Box flex="1">
                  <NativeSelect
                    name={`${name}-month`}
                    value={String(month.getMonth())}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    items={MONTH_OPTIONS}
                  />
                </Box>
                <Box w="100px">
                  <NativeSelect
                    name={`${name}-year`}
                    value={String(month.getFullYear())}
                    onChange={(e) => handleYearChange(e.target.value)}
                    items={yearOptions}
                  />
                </Box>
              </Flex>

              <Box
                css={{
                  '& .rdp-root': {
                    ...calendarStyles,
                  },
                  '& .rdp-day': {
                    color: text.primary,
                    borderRadius: '6px',
                  },
                  '& .rdp-day:hover:not(.rdp-selected)': {
                    backgroundColor: menu.itemHoverBg,
                  },
                  '& .rdp-outside': {
                    color: menu.textSecondary,
                  },
                  '& .rdp-selected .rdp-day_button': {
                    backgroundColor: '#53ABFC',
                    color: 'white',
                    borderRadius: '6px',
                  },
                  '& .rdp-today:not(.rdp-selected) .rdp-day_button': {
                    border: `1px solid ${borders.focus}`,
                    borderRadius: '6px',
                  },
                  '& .rdp-weekday': {
                    color: text.secondary,
                    fontSize: '12px',
                    fontWeight: 'normal',
                  },
                  '& .rdp-caption_label': {
                    display: 'none',
                  },
                  '& .rdp-nav': {
                    display: 'none',
                  },
                }}
              >
                <DayPicker
                  mode="single"
                  selected={pendingDate}
                  onSelect={(date) => setPendingDate(date ?? undefined)}
                  month={month}
                  onMonthChange={setMonth}
                  weekStartsOn={1}
                  showOutsideDays
                  disabled={[
                    ...(minDate ? [{ before: minDate }] : []),
                    ...(maxDate ? [{ after: maxDate }] : []),
                  ]}
                />
              </Box>

              <Flex mt={3} gap={2} justify="flex-end" borderTopWidth="1px" borderColor={borders.subtle} pt={3}>
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
                >
                  Confirm
                </Button>
              </Flex>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Field>
  );
};
