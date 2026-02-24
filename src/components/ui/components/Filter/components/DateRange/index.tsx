import { FormDateRangePicker } from '@/components/ui';
import { FilterField } from '@/types/filter';

interface DateRangeFieldProps {
  field: FilterField;
}

export const DateRangeField = ({ field }: DateRangeFieldProps) => {
  const dateFields = field.fields?.filter((f) => f.type === 'date' && f.name) ?? [];
  const fromField = dateFields[0];
  const toField = dateFields[1];

  if (!fromField?.name || !toField?.name) return null;

  return (
    <FormDateRangePicker
      fromName={fromField.name}
      toName={toField.name}
      label={field.label}
      maxRangeDays={7}
    />
  );
};
