// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterField {
  label?: string;
  name?: string;
  type: 'select' | 'input' | 'dateRange' | 'date' | 'multiSelect';
  options?: FilterFieldOption[];
  value?: string | number;
  fields?: FilterField[]; // For dateRange type
  disabled?: boolean;
}

export interface FilterConfigSection {
  title?: string;
  fields: FilterField[];
}
