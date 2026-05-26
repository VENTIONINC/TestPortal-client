// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Path } from 'react-hook-form';

import { FormInput, FormSelect, FormMultiSelect } from '@/components/ui';
import { FilterConfigSection, FilterField } from '@/types/filter';

import { DateRangeField } from '../DateRange';
import { FiltersRow } from '../Row';
import { FiltersGroup } from '../Group';

interface FieldsProps {
  config: FilterConfigSection[];
  onApply: () => void;
}

export const Fields = ({ config, onApply }: FieldsProps) => {
  const renderFilterFields = (fields: FilterField[], sectionKey: string) =>
    fields.map((field: FilterField, fieldIndex: number) => {
      const fieldName = field.name as Path<Record<string, string>> | undefined;
      const fieldKey = `${sectionKey}-${field.name ?? 'field'}-${fieldIndex}`;

      switch (field.type) {
        case 'select':
          if (!fieldName) return null;

          return (
            <FiltersRow key={fieldKey}>
              <FormSelect
                name={fieldName}
                label={field.label}
                disabled={field.disabled}
                items={(field.options ?? []).map((option) => ({ value: option.value, label: option.label }))}
              />
            </FiltersRow>
          );
        case 'multiSelect':
          if (!fieldName) return null;

          return (
            <FiltersRow key={fieldKey}>
              <FormMultiSelect
                name={fieldName}
                label={field.label}
                disabled={field.disabled}
                items={(field.options ?? []).map((option) => ({ value: option.value, label: option.label }))}
              />
            </FiltersRow>
          );
        case 'input':
          if (!fieldName) return null;

          return (
            <FiltersRow key={fieldKey}>
              <FormInput name={fieldName} label={field.label} disabled={field.disabled} />
            </FiltersRow>
          );
        case 'dateRange':
          return (
            <FiltersRow key={fieldKey}>
              <DateRangeField field={field} />
            </FiltersRow>
          );
        default:
          return null;
      }
    });

  return config.map((section, sectionIndex) => {
    const sectionKey = `${section.title || 'section'}-${section.fields[0]?.name || 'fields'}-${sectionIndex}`;

    return (
      <FiltersGroup key={sectionKey} title={section.title || ''} handleSearch={onApply}>
        {renderFilterFields(section.fields, sectionKey)}
      </FiltersGroup>
    );
  });
};
