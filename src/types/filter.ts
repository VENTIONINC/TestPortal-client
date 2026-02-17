export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterField {
  label?: string;
  name?: string;
  type: 'select' | 'input' | 'dateRange' | 'date';
  options?: FilterFieldOption[];
  value?: string | number;
  fields?: FilterField[]; // For dateRange type
}

export interface FilterConfigSection {
  title?: string;
  fields: FilterField[];
}
